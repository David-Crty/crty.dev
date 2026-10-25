import { gsap, ScrollTrigger, ease, dur, mix, slice, palette, token } from './brand';
import { Ribbon, boxOf, type Box, type Seg } from './lines';
import type { Tape } from './hero';

/** Where the story's scrub lands: the card's edge halfway up the screen. */
const LAND = 0.5;

interface Scene {
  ribbon: Ribbon;
  /** Recomputes the geometry; called on every refresh. */
  measure(): void;
  /** Draws the story at progress p. */
  render(p: number): void;
  /** The scroll position the story finishes at. */
  end(): number;
  /** The real tape and edge the ribbon stands in for, and the label it slides away. */
  tape: HTMLElement;
  edge: HTMLElement;
  label: HTMLElement;
}

/**
 * Swaps the real tape and edge for the ribbon while the story is between them. Every stripe
 * has settled by the time either swap happens, so the ribbon and the real thing line up to
 * the pixel and nothing jumps.
 */
function handOver(scene: Scene, p: number) {
  const away = p > 0.001, landed = p >= 0.995;
  scene.tape.classList.toggle('is-away', away);
  scene.edge.classList.toggle('is-pending', !landed);
  scene.ribbon.show(away && !landed);
  return away && !landed;
}

/** The label slides off along the tape as the story starts, and back when it rewinds. */
function slideLabel(label: HTMLElement, p: number, by: number) {
  const k = ease.tape(slice(p, 0, 0.16));
  label.style.transform = k ? `translateX(${by * k}px)` : '';
  label.style.opacity = k ? String(1 - k) : '';
}

/**
 * How faded the tape at rest is. Below desktop it runs behind the copy at this strength, so
 * the story starts there, needs no cut-out for the copy, and comes up to full on the way down.
 */
const dimOf = (t: Tape) => Math.min(1, parseFloat(token('--tape-dim', t.box)) || 1);

/** The shortest the whole story can play in, however fast the page is scrolled. */
const SHORTEST = dur.long * 2;
/** How long the story takes to settle on the scroll when it is not speed-limited. */
const LAG = 0.2;

/**
 * Scrubs a scene with the page's scroll, from the top down to where it lands. The story
 * chases the scroll position rather than sitting on it, and never faster than SHORTEST
 * allows, so a quick flick still plays the whole shot. A `fresh` story starts from the hero
 * tape even when the page has already scrolled, and plays its way down to it.
 */
function drive(scene: Scene, fresh = false) {
  let p = 0, target = 0;
  const trigger = ScrollTrigger.create({
    start: 0,
    end: () => scene.end(),
    invalidateOnRefresh: true,
    onRefreshInit: () => scene.measure(),
    onRefresh: (self) => { target = self.progress; scene.render(p); },
    onUpdate: (self) => { target = self.progress; },
  });
  const follow = (_: number, ms: number) => {
    const gap = target - p;
    if (!gap) return;
    const dt = Math.min(ms, 100) / 1000;
    const cap = dt / SHORTEST;
    const step = gsap.utils.clamp(-cap, cap, gap * (1 - Math.exp(-dt / LAG)));
    p = Math.abs(gap) < 1e-4 ? target : p + step;
    scene.render(p);
  };
  gsap.ticker.add(follow);
  target = trigger.progress;
  p = fresh ? 0 : target;
  scene.measure();
  scene.render(p);
  return () => {
    gsap.ticker.remove(follow);
    trigger.kill();
    scene.ribbon.remove();
    scene.tape.classList.remove('is-away');
    scene.edge.classList.remove('is-pending');
    slideLabel(scene.label, 0, 0);
  };
}

/** The first section's pieces the tape travels to. */
function landing() {
  const section = document.querySelector<HTMLElement>('.site main section');
  const edge = section?.querySelector<HTMLElement>(':scope > .edge');
  const head = section?.querySelector<HTMLElement>('.sec-head');
  const title = head?.querySelector<HTMLElement>('h2');
  const num = head?.querySelector<HTMLElement>('.num');
  const copy = document.querySelector<HTMLElement>('.site .hero-copy');
  const top = document.querySelector<HTMLElement>('.site .top');
  if (!edge || !head || !title || !num || !copy || !top) return;
  return { edge, head, title, num, copy, top };
}

const pageWidth = () => document.documentElement.clientWidth;

/** Linear blend of two segments. */
function blend(a: Seg, b: Seg, k: number): Seg {
  if (k <= 0) return a;
  if (k >= 1) return b;
  return { px: mix(a.px, b.px, k), py: mix(a.py, b.py, k), qx: mix(a.qx, b.qx, k), qy: mix(a.qy, b.qy, k), t: mix(a.t, b.t, k), a: mix(a.a, b.a, k) };
}

/** How heavy each stripe is once the band has come apart, gold to green. */
const WEIGHTS = [0.55, 0.32, 0.7, 0.22, 0.45, 0.14];

/**
 * The dark sleeve's continuity shot, scrubbed by scroll. The band comes apart from the
 * bottom stripe up while hairlines multiply out of each stripe, the whole field swings flat
 * into the gap above the first section, then narrows past the title and lands as the
 * featured card's edge. Every line is the tape's own colour; nothing cuts.
 */
export function diagonalStory(t: Tape, { wide = true, fresh = false } = {}) {
  const at = landing();
  if (!at) return;
  const per = wide ? 4 : 2;
  const count = 6 * per;
  const colours = palette();
  const ribbon = new Ribbon(document.querySelector('.site')!, Array.from({ length: count }, (_, j) => colours[j % 6]));

  let g = {} as {
    W: number; O: [number, number]; a: [number, number]; n: [number, number]; h: number; L: number;
    floor: number; r0: number; r1: number; x0: number; edge: Box; eh: number; holes: Box[]; spread: number; dim: number;
  };

  const scene: Scene = {
    ribbon,
    measure() {
      const box = boxOf(t.box);
      const head = boxOf(at.head);
      const title = boxOf(at.title);
      const copy = boxOf(at.copy, 14);
      const edge = boxOf(at.edge);
      const dim = dimOf(t);
      g = {
        W: pageWidth(),
        O: [box.x0 + t.tape.offsetLeft, box.y0 + t.tape.offsetTop],
        a: [Math.cos(t.angle), Math.sin(t.angle)],
        n: [-Math.sin(t.angle), Math.cos(t.angle)],
        h: t.stripes[0].offsetHeight,
        L: t.tape.offsetWidth,
        floor: box.y1,
        r0: Math.max(copy.y1 + 6, head.y0 - (wide ? 150 : 60)),
        r1: head.y0 - (wide ? 18 : 10),
        x0: title.x1 + (wide ? 40 : 18),
        edge,
        eh: edge.y1 > edge.y0 ? (edge.y1 - edge.y0) / 6 : 2,
        holes: [...(dim < 1 ? [] : [copy]), boxOf(at.top, 8), { x0: 0, y0: head.y0 - 10, x1: title.x1 + 22, y1: head.y1 + 10 }],
        spread: wide ? 380 : 110,
        dim,
      };
    },
    end() {
      const e = at.edge.getBoundingClientRect().top + scrollY;
      return Math.max(240, e - innerHeight * LAND);
    },
    tape: t.tape,
    edge: at.edge,
    label: t.label,
    render(p) {
      slideLabel(t.label, p, 260);
      if (!handOver(scene, p)) return;

      const { O, a, n, h, L, W, edge, eh } = g;
      const fade = mix(g.dim, 1, slice(p, 0.45, 0.7));
      const ray = (d: number): Seg => {
        const px = O[0] + n[0] * d, py = O[1] + n[1] * d;
        return { px, py, qx: px + a[0] * L, qy: py + a[1] * L, t: h, a: 1 };
      };
      for (let j = 0; j < count; j++) {
        const band = j % 6;
        const k = Math.floor(j / 6);
        const idx = band * per + k;
        const order = idx / (count - 1);
        const rest = k === 0 ? ray(band * h) : { ...ray((band + 1) * h), t: 0, a: 0 };
        const apart = { ...ray(g.spread * order ** 1.35), t: k === 0 ? Math.max(1.5, h * WEIGHTS[band]) : 1.3, a: k === 0 ? 1 : 0.9 };
        const y = mix(g.r0, g.r1, order);
        const flat: Seg = { px: g.x0, py: y, qx: W + 40, qy: y, t: k === 0 ? 3 : 1.3, a: apart.a };
        const ey = edge.y0 + band * eh;
        const gathered: Seg = { px: g.x0, py: ey, qx: W + 40, qy: ey, t: eh, a: k === 0 ? 1 : 0 };
        const landed: Seg = { px: edge.x0, py: ey, qx: edge.x1, qy: ey, t: eh, a: gathered.a };

        const sA = 0.02 + (5 - band) * 0.025 + k * 0.012;
        const sB = 0.3 + (count - 1 - idx) * (0.09 / count);
        const sC = 0.6 + idx * (0.07 / count);
        const sD = 0.74 + band * 0.018;
        let s = blend(rest, apart, ease.tape(slice(p, sA, sA + 0.18)));
        s = blend(s, flat, ease.swing(slice(p, sB, sB + 0.26)));
        s = blend(s, gathered, ease.swing(slice(p, sC, sC + 0.18)));
        s = blend(s, landed, ease.tape(slice(p, sD, sD + 0.13)));
        ribbon.draw(j, { ...s, a: s.a * fade });
      }
      const floor = mix(mix(g.floor, g.r1 + 6, slice(p, 0.2, 0.4)), edge.y1 + 2, slice(p, 0.55, 0.68));
      ribbon.clip({ x0: 0, y0: 0, x1: W, y1: floor }, g.holes);
    },
  };
  return drive(scene, fresh);
}

/**
 * The light sleeve's continuity shot, scrubbed by scroll. The flat stack opens into bars
 * with ink separators like ruled paper, narrows to the section band's width in a stair, and
 * feeds through behind that band one bar at a time, coming out underneath as the featured
 * card's edge.
 */
export function bandsStory(t: Tape, { fresh = false } = {}) {
  const at = landing();
  if (!at) return;
  const colours = palette();
  const ink = token('--ink');
  const ribbon = new Ribbon(document.querySelector('.site')!, [...colours, ...Array.from({ length: 5 }, () => ink)]);

  let g = {} as { W: number; x: number; y: number; w: number; h: number; floor: number; band: Box; edge: Box; eh: number; holes: Box[]; low: number; dim: number };

  const scene: Scene = {
    ribbon,
    measure() {
      const box = boxOf(t.box);
      const head = boxOf(at.head);
      const num = boxOf(at.num, 14);
      const edge = boxOf(at.edge);
      const dim = dimOf(t);
      g = {
        W: pageWidth(),
        x: box.x0 + t.tape.offsetLeft,
        y: box.y0 + t.tape.offsetTop,
        w: t.tape.offsetWidth,
        h: t.stripes[0].offsetHeight,
        floor: box.y1,
        band: boxOf(at.title),
        edge,
        eh: edge.y1 > edge.y0 ? (edge.y1 - edge.y0) / 6 : 4,
        holes: [...(dim < 1 ? [] : [boxOf(at.copy, 14)]), boxOf(at.top, 8), { x0: 0, y0: num.y0, x1: num.x1, y1: num.y1 }],
        low: head.y0 - 8,
        dim,
      };
    },
    end() {
      const e = at.edge.getBoundingClientRect().top + scrollY;
      return Math.max(240, e - innerHeight * LAND);
    },
    tape: t.tape,
    edge: at.edge,
    label: t.label,
    render(p) {
      slideLabel(t.label, p, 160);
      if (!handOver(scene, p)) return;

      const { h, edge, eh, band } = g;
      const bar = h * 0.8, gap = h * 0.45;
      const pitch = bar + gap;
      const drop = Math.max(0, g.low - (g.y + 6 * pitch - gap));
      const left = band.x0 + 48, right = band.x1;
      const fade = mix(g.dim, 1, slice(p, 0.15, 0.45));
      for (let j = 0; j < 11; j++) {
        const separator = j >= 6;
        const r = separator ? j - 6 : j;
        const flat = (y: number, th: number, x0 = g.x, x1 = g.x + g.w): Seg => ({ px: x0, py: y, qx: x1, qy: y, t: th, a: 1 });
        const rest = separator ? flat(g.y + (r + 1) * h, 0) : flat(g.y + r * h, h);
        const open = separator ? flat(g.y + r * pitch + bar, gap) : flat(g.y + r * pitch, bar);
        const narrow = separator
          ? { ...flat(g.y + drop + r * pitch + bar, 0, left, right), a: 0 }
          : flat(g.y + drop + r * pitch, bar, left, right);
        const fed = flat(edge.y0 + r * eh, eh, left, right);
        const landed = flat(edge.y0 + r * eh, eh, edge.x0, edge.x1);

        const sA = r * 0.015;
        const sB = 0.2 + r * 0.022;
        const sC = 0.42 + (5 - r) * 0.045;
        let s = blend(rest, open, ease.tape(slice(p, sA, sA + 0.2)));
        s = blend(s, narrow, ease.tape(slice(p, sB, sB + 0.2)));
        if (!separator) {
          s = blend(s, fed, ease.swing(slice(p, sC, sC + 0.22)));
          s = blend(s, landed, ease.tape(slice(p, sC + 0.2, sC + 0.3)));
        }
        ribbon.draw(j, { ...s, a: s.a * fade });
      }
      const floor = mix(g.floor, edge.y1 + 2, slice(p, 0.04, 0.3));
      ribbon.clip({ x0: 0, y0: 0, x1: g.W, y1: floor }, g.holes);
    },
  };
  return drive(scene, fresh);
}

const arrived = new WeakSet<Element>();

/**
 * Build and play an element's reveal the moment it first scrolls into view. Anything already
 * on screen or scrolled past is left as it is, and nothing plays twice, theme switch included.
 */
export function onArrival(el: Element, play: () => gsap.core.Animation | void) {
  if (arrived.has(el) || el.getBoundingClientRect().top < innerHeight) {
    arrived.add(el);
    return;
  }
  ScrollTrigger.create({ trigger: el, start: 'top bottom', once: true, onEnter: () => { arrived.add(el); play(); } });
}
