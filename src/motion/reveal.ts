import { gsap, ease, dur, theme, angle, palette, reach, unit, letters } from './brand';
import { onArrival } from './story';

/** Lays a run of tape across an element as a hairline, to draw and retract within one shot. */
function hairline(host: HTMLElement, colour: string, css: Partial<CSSStyleDeclaration>) {
  const line = document.createElement('span');
  line.className = 'run';
  line.style.background = colour;
  Object.assign(line.style, css);
  host.append(line);
  return line;
}

/**
 * Dark: a gold hairline shoots across the heading's row and the title rides in up the
 * tape's diagonal behind its head, one letter at a time, then the line runs out.
 * Light: the line-cut numeral prints a line at a time, the ink band shoots in from its cut
 * corner and the title slides along it.
 */
export function headings() {
  const light = theme() === 'light';
  const rad = (angle('--tape-angle', document.querySelector('.site') ?? undefined) * Math.PI) / 180;
  for (const head of document.querySelectorAll<HTMLElement>('.site .sec-head')) {
    const title = head.querySelector<HTMLElement>('h2');
    const num = head.querySelector<HTMLElement>('.num');
    if (!title || !num) continue;
    onArrival(head, () => {
      const split = letters(title);
      const tl = gsap.timeline({
        defaults: { ease: ease.tape },
        onComplete: () => {
          split.revert();
          gsap.set([title, num], { clearProps: 'clipPath' });
        },
      });
      if (light) {
        const w = title.offsetWidth, h = title.offsetHeight;
        const lines = Math.max(1, Math.round(num.offsetHeight / 8));
        tl.fromTo(num, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: `steps(${lines})` }, 0)
          .fromTo(title, { clipPath: `polygon(40px 0px, 40px 0px, 0px ${h}px, 0px ${h}px)` },
            { clipPath: `polygon(40px 0px, ${w}px 0px, ${w}px ${h}px, 0px ${h}px)`, duration: dur.base }, 0.12)
          .from(split.chars, { x: -36, autoAlpha: 0, duration: dur.base, stagger: 0.018 }, 0.26);
        return tl;
      }
      const span = head.offsetWidth - num.offsetLeft;
      const run = 0.62;
      const line = hairline(head, palette()[0], { left: `${num.offsetLeft}px`, width: `${span}px`, top: `${title.offsetTop + title.offsetHeight}px` });
      // far enough down the diagonal that each letter starts wholly outside its word's mask
      const d = (title.offsetHeight * 1.45 + 4) / Math.abs(Math.sin(rad) || 1);
      tl.from(num, { clipPath: 'inset(0% 100% 0% 0%)', duration: dur.quick }, 0)
        .fromTo(line, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: run }, 0)
        .set(line, { transformOrigin: '100% 50%' })
        .to(line, { scaleX: 0, duration: 0.45 })
        .call(() => line.remove());
      // each letter rides in just behind the hairline's head as it passes
      const left = head.getBoundingClientRect().left + num.offsetLeft;
      const marks = split.chars.map((c) => c.getBoundingClientRect().left - left);
      tl.from(split.chars, {
        x: -Math.cos(rad) * d,
        y: -Math.sin(rad) * d,
        duration: dur.base,
        stagger: (i) => Math.max(0, run * reach(ease.tape, unit(marks[i] / span)) - 0.06),
      }, 0);
      return tl;
    });
  }
}

/**
 * Dark lists: every row's rule is drawn in by a hairline of tape, a colour per row, that
 * fades back to the plain rule as the row's text slides in after it. Light shelf: the spines
 * are slid onto the shelf from the right, one after another, tab first.
 */
export function rows() {
  const light = theme() === 'light';
  const colours = palette();
  for (const list of document.querySelectorAll<HTMLElement>('.site .rows')) {
    const items = [...list.querySelectorAll<HTMLElement>('.row')];
    if (!items.length) continue;
    onArrival(list, () => {
      const tl = gsap.timeline({ defaults: { ease: ease.tape }, onComplete: () => list.classList.remove('is-arriving') });
      list.classList.add('is-arriving');
      if (light && list.classList.contains('shelf')) {
        items.forEach((row, i) => {
          tl.from(row, { x: () => innerWidth - row.getBoundingClientRect().left + 24, duration: 0.7, clearProps: 'transform' }, i * 0.09);
        });
        return tl;
      }
      items.forEach((row, i) => {
        const at = i * 0.08;
        const cells = [...row.children].filter((c) => !c.matches('.band, .mark, .run'));
        if (!light) {
          const rule = hairline(row, colours[i % 6], { left: '0', right: '0', bottom: '-1px' });
          tl.fromTo(rule, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.6 }, at)
            .to(rule, { autoAlpha: 0, duration: 0.5, ease: 'none' }, at + 0.55)
            .call(() => rule.remove(), [], at + 1.05);
        }
        tl.from(cells, { x: -14, autoAlpha: 0, duration: dur.base, stagger: 0.05, clearProps: 'all' }, at + 0.06);
      });
      return tl;
    });
  }
}

/**
 * The footer's sign-off: the big line rises out of its own baseline, and the strip under it
 * is built bar by bar, each stripe shooting in from the left so their ends make a stair that
 * closes square. On the light sleeve the ruled paper behind it prints first, a line at a time.
 */
export function footer() {
  const foot = document.querySelector<HTMLElement>('.site footer');
  const title = foot?.querySelector<HTMLElement>('.foot h2');
  const strip = foot?.querySelector<HTMLElement>('.edge.base');
  if (!foot || !title || !strip) return;
  if (theme() === 'light') {
    onArrival(foot, () => gsap.fromTo(foot, { '--ruled': '0%' }, {
      '--ruled': '100%',
      duration: 1.1,
      ease: `steps(${Math.max(1, Math.round(foot.offsetHeight / 7))})`,
      clearProps: '--ruled',
    }));
  }
  onArrival(title, () => {
    const split = letters(title);
    return gsap.timeline({ onComplete: () => split.revert() })
      .from(split.chars, { yPercent: 140, duration: dur.base, ease: ease.tape, stagger: 0.028 });
  });
  stair(strip);
}

/** A band built stripe by stripe from the left, their leading ends a stair until they land flush. */
export function stair(edge: HTMLElement, { delay = 0 } = {}) {
  const stripes = [...edge.querySelectorAll<HTMLElement>('i')];
  onArrival(edge, () => gsap.timeline({ delay, onComplete: () => gsap.set(stripes, { clearProps: 'all' }) })
    .fromTo(stripes, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.6, ease: ease.tape, stagger: 0.07 }));
}
