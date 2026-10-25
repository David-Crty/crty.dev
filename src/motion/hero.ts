import { gsap, ScrollTrigger, ease, angle, reach, token, unit, letters } from './brand';

export interface Tape {
  box: HTMLElement;
  tape: HTMLElement;
  label: HTMLElement;
  stripes: HTMLElement[];
  /** Radians, as the layout currently sets it. */
  angle: number;
}

export function findTape(): Tape | undefined {
  const box = document.querySelector<HTMLElement>('.site .tapes');
  const tape = box?.querySelector<HTMLElement>('.tape');
  const label = tape?.querySelector<HTMLElement>('.along');
  if (!box || !tape || !label) return;
  return {
    box, tape, label,
    stripes: [...tape.querySelectorAll<HTMLElement>(':scope > i')],
    angle: (angle('--tape-angle', box) * Math.PI) / 180,
  };
}

/** How far along the tape it stays inside its box, before leaving at the right or the top. */
function visibleLength(t: Tape) {
  const cos = Math.cos(t.angle), sin = Math.sin(t.angle);
  const right = cos > 0 ? (t.box.clientWidth - t.tape.offsetLeft) / cos : Infinity;
  const top = sin < 0 ? t.tape.offsetTop / -sin : Infinity;
  return Math.max(0, Math.min(t.tape.offsetWidth, right, top));
}

/** Where an element sits along the tape, measured from the tape's end at the hero's foot. */
function along(t: Tape, el: Element) {
  const box = t.box.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2 - (box.left + t.tape.offsetLeft);
  const y = r.top + r.height / 2 - (box.top + t.tape.offsetTop);
  return x * Math.cos(t.angle) + y * Math.sin(t.angle);
}

const HAIRLINE = 1.2;

/**
 * The 0 to 7 s shot, for the dark sleeve. A gold hairline draws up the diagonal and thickens
 * into the first stripe, the other five grow out from under it one at a time, and a tab
 * slides down the band printing the label behind it, letter by letter.
 */
export function diagonalIdent(t: Tape, { quick = false, wide = true } = {}) {
  const h = t.stripes[0].offsetHeight;
  const long = t.tape.offsetWidth;
  const length = visibleLength(t);
  const split = letters(t.label);
  const marks = split.chars.map((c) => along(t, c));
  const tab = document.createElement('span');
  tab.className = 'tab';
  t.tape.append(tab);

  const grow = t.stripes.map((_, i) => ({ s: i === 0 ? HAIRLINE / h : 0 }));
  const stack = () => {
    let lift = 0;
    t.stripes.forEach((el, i) => {
      el.style.transform = `translateY(${-lift}px) scaleY(${grow[i].s})`;
      lift += (1 - grow[i].s) * h;
    });
  };
  // the clip reaches past the band on both sides so the label and the tab are never cut
  const drawn = (d: number) => `inset(-48px ${long - d}px -16px 0px)`;

  gsap.set(t.stripes, { transformOrigin: '50% 0%' });
  gsap.set(split.chars, { yPercent: 150 });
  gsap.set(tab, { skewX: (t.angle * 180) / Math.PI, x: length, autoAlpha: 0 });
  stack();

  const travel = wide ? 1.5 : 1.1;
  const tl = gsap.timeline({ paused: true, defaults: { ease: ease.tape } });
  tl.fromTo(t.tape, { clipPath: drawn(0) }, { clipPath: drawn(length), duration: wide ? 0.95 : 0.7 })
    .set(t.tape, { clipPath: 'none' })
    .to(grow[0], { s: 1, duration: 0.26, onUpdate: stack }, '-=0.1')
    .to(grow.slice(1), { s: 1, duration: 0.24, stagger: 0.1, onUpdate: stack }, '-=0.12')
    .addLabel('tab', '-=0.42')
    .set(tab, { autoAlpha: 1 }, 'tab')
    .to(tab, { x: -tab.offsetWidth, duration: travel }, 'tab')
    // each letter comes up out of the band just after the tab's tail has passed it
    .to(split.chars, {
      yPercent: 0,
      duration: 0.32,
      stagger: (i) => travel * reach(ease.tape, unit((length - marks[i] + tab.offsetWidth * 0.6) / (length + tab.offsetWidth))),
    }, 'tab')
    .call(() => {
      tab.remove();
      split.revert();
    })
    .set([t.tape, ...t.stripes], { clearProps: 'all' });

  if (quick) tl.timeScale(1.5);
  return tl;
}

/**
 * The 21 to 34 s shot, for the light sleeve. An ink band wipes in at an angle carrying three
 * thin stripes; they spread, flatten and thicken into bars with black separators, then every
 * separator fills with a stripe of its own, so three bars become six, while the stack pans home.
 */
export function bandsIdent(t: Tape, { quick = false, wide = true } = {}) {
  const h = t.stripes[0].offsetHeight;
  const odd = t.stripes.filter((_, i) => i % 2 === 0);
  const even = t.stripes.filter((_, i) => i % 2 === 1);
  const ink = document.createElement('span');
  ink.className = 'ink';
  t.tape.append(ink);

  gsap.set(t.tape, { rotation: wide ? -12 : -8, x: wide ? 220 : 90, transformOrigin: '50% 50%' });
  gsap.set(ink, { scaleY: wide ? 2.2 : 1.7, clipPath: 'inset(0% 100% 0% 0%)' });
  gsap.set(odd, { transformOrigin: '50% 0%', scaleY: 0.22, y: (i) => -i * 2 * h + i * 8, clipPath: 'inset(0% 100% 0% 0%)' });
  gsap.set(even, { transformOrigin: '50% 50%', scaleY: 0 });
  // the label is carried in on the ink band, so it starts out in the paper's colour
  gsap.set(t.label, { x: wide ? -220 : -90, autoAlpha: 0, color: token('--ground') });

  const tl = gsap.timeline({ paused: true, defaults: { ease: ease.tape } });
  tl.to(ink, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 }, 0)
    .to(odd, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, stagger: 0.08 }, 0.14)
    .to(t.tape, { x: 0, duration: 2.6, ease: 'power3.out' }, 0)
    .to(t.label, { x: 0, autoAlpha: 1, duration: 1.4 }, 0.42)
    .addLabel('flat', 0.95)
    .to(t.tape, { rotation: 0, duration: 0.8, ease: ease.swing }, 'flat')
    .to(odd, { y: -0.25 * h, scaleY: 1.5, duration: 0.75, ease: ease.swing }, 'flat')
    .to(ink, { scaleY: 1, duration: 0.75, ease: ease.swing }, 'flat')
    .to(t.label, { color: token('--ink'), duration: 0.4, ease: 'none' }, 'flat+=0.2')
    .addLabel('six', 'flat+=0.72')
    .to(even, { scaleY: 1, duration: 0.42, stagger: 0.09 }, 'six')
    .to(odd, { y: 0, scaleY: 1, duration: 0.42, stagger: 0.09 }, 'six')
    .call(() => ink.remove())
    .set([t.tape, t.label, ...t.stripes], { clearProps: 'all' });

  if (quick) tl.timeScale(1.5);
  return tl;
}

/**
 * Every few seconds a glint runs up the tape at rest, the way light catches a glossy sleeve.
 * It only runs while the hero is where the page opens.
 */
export function glint(t: Tape) {
  const shine = document.createElement('span');
  shine.className = 'glint';
  t.tape.append(shine);
  const loop = gsap.timeline({ repeat: -1, repeatDelay: 7, delay: 2.5, paused: scrollY > 60 })
    .fromTo(shine, { x: -shine.offsetWidth }, { x: () => visibleLength(t), duration: 1.6, ease: ease.tape });
  ScrollTrigger.create({ start: 0, end: 60, onToggle: ({ isActive }) => loop.paused(!isActive) });
}

/** Play when the tape is on screen: straight away on desktop, on arrival below the copy on mobile. */
export function playWhenSeen(t: Tape, tl: gsap.core.Timeline) {
  ScrollTrigger.create({ trigger: t.box, start: 'top 85%', once: true, onEnter: () => tl.play() });
}
