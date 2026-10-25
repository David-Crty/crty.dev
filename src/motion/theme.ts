import { gsap, ease, palette, probe, angle, media, theme, token } from './brand';

export type Mode = 'light' | 'dark';

const root = document.documentElement;
const SWITCHING = 'is-switching-theme';
const LONG = 2400;
const THICK = 24;

/** Notes what sits under the top third of the screen; the returned call puts it back there. */
function holdPlace() {
  const probe = document.elementFromPoint(innerWidth / 2, innerHeight / 3);
  const anchor = probe?.closest('section, .hero, footer, .feature, .row, .sec-head, article, header') ?? probe;
  const before = anchor?.getBoundingClientRect().top ?? 0;
  return () => {
    if (anchor?.isConnected) scrollBy({ top: anchor.getBoundingClientRect().top - before, behavior: 'instant' });
  };
}

/** Hit-testing is off inside a view transition's update, so the place is taken before it starts. */
function apply(mode: Mode, restore = holdPlace()) {
  root.setAttribute('data-theme', mode);
  restore();
  document.dispatchEvent(new CustomEvent('tape:theme', { detail: mode }));
}

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * The switch as one tape: a gold hairline shoots out from the toggle at the old sleeve's
 * angle, the other stripes grow out of it on both sides as it swings to the new sleeve's
 * angle, then it splits down the middle and opens, with the new theme inside the opening and
 * the stripes riding its two edges off the screen.
 */
class Opening {
  readonly el = document.createElement('div');
  readonly stripes: HTMLElement[] = [];
  readonly fill?: HTMLElement;
  /** Half the drawn length, each half's opening, the angle, and each stripe's thickness. */
  readonly s = { l: 0, up: 0, down: 0, th: 0 };
  readonly w = [0, 0, 0, 0, 0, 0].map((v) => ({ v }));
  readonly c: [number, number];
  readonly far: number;

  constructor(from: Element | null, colours: string[], ground?: string) {
    const r = from?.getBoundingClientRect();
    this.c = r ? [r.left + r.width / 2, r.top + r.height / 2] : [innerWidth - 40, 40];
    this.far = Math.hypot(innerWidth, innerHeight) * 1.1;
    this.el.className = 'tape-switch';
    this.el.setAttribute('aria-hidden', 'true');
    if (ground) {
      this.fill = document.createElement('b');
      this.fill.style.background = ground;
      this.el.append(this.fill);
    }
    for (let k = 0; k < 12; k++) {
      const stripe = document.createElement('i');
      stripe.style.background = colours[k % 6];
      this.el.append(stripe);
      this.stripes.push(stripe);
    }
    document.body.append(this.el);
  }

  /** How far each half has to open, at angle `th`, for its inner edge to clear every corner. */
  reach(th: number) {
    const n = [-Math.sin(th), Math.cos(th)];
    const d = [[0, 0], [innerWidth, 0], [0, innerHeight], [innerWidth, innerHeight]]
      .map(([x, y]) => (x - this.c[0]) * n[0] + (y - this.c[1]) * n[1]);
    return { down: Math.max(0, ...d) + 4, up: Math.max(0, ...d.map((v) => -v)) + 4 };
  }

  /** The outer edges of both stripe groups, as the region the new page shows through. */
  clip() {
    const { l, up, down, th } = this.s;
    const a = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
    const band = this.w.reduce((x, y) => x + y.v, 0);
    const pt = (o: number, along: number) =>
      `${(this.c[0] + n[0] * o + a[0] * along).toFixed(1)}px ${(this.c[1] + n[1] * o + a[1] * along).toFixed(1)}px`;
    const lo = -up - band, hi = down + band;
    return `polygon(${pt(lo, -l)}, ${pt(lo, l)}, ${pt(hi, l)}, ${pt(hi, -l)})`;
  }

  draw() {
    const { l, up, down, th } = this.s;
    const w = this.w.map((x) => x.v);
    const a = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
    const place = (el: HTMLElement, o: number, t: number) => {
      const x = this.c[0] + n[0] * o - a[0] * l, y = this.c[1] + n[1] * o - a[1] * l;
      el.style.transform = `translate(${x}px, ${y}px) rotate(${th}rad) scale(${(2 * l) / LONG}, ${t / THICK})`;
    };
    let below = down, above = -up;
    for (let k = 0; k < 6; k++) {
      place(this.stripes[k], below, w[k]);
      below += w[k];
      above -= w[k];
      place(this.stripes[k + 6], above, w[k]);
    }
    if (this.fill) place(this.fill, -up, up + down);
  }

  remove() {
    this.el.remove();
  }
}

function choreograph(o: Opening, from: number, to: number) {
  const s = o.s;
  const { up, down } = o.reach(to);
  const bold = Math.min(42, Math.max(18, Math.hypot(innerWidth, innerHeight) * 0.022));
  s.th = from;
  o.w[0].v = 0.6;
  return gsap.timeline({ defaults: { ease: ease.tape }, onUpdate: () => o.draw() })
    .to(s, { l: o.far, duration: 0.28 }, 0)
    .to(o.w[0], { v: bold * 0.45, duration: 0.2 }, 0.14)
    .to(o.w.slice(1), { v: bold * 0.45, duration: 0.2, stagger: 0.035 }, 0.18)
    .to(s, { th: to, duration: 0.36, ease: ease.swing }, 0.16)
    .addLabel('open', 0.46)
    .to(s, { up, down, duration: 0.8 }, 'open')
    .to(o.w, { v: bold, duration: 0.5 }, 'open');
}

let busy = false;
let wanted: Mode | null = null;

function settle() {
  busy = false;
  const next = wanted;
  wanted = null;
  if (next && next !== theme()) switchTheme(next);
}

/** Without view transitions the opening fills with the new ground, the theme flips under it, and it lifts. */
function fallback(mode: Mode, from: Element | null, angles: [number, number]) {
  const target = probe(mode);
  const o = new Opening(from, palette(target), token('--ground', target));
  target.remove();
  o.draw();
  choreograph(o, angles[0], angles[1]).call(() => {
    apply(mode);
    gsap.to(o.el, { autoAlpha: 0, duration: 0.24, ease: 'none', onComplete: () => { o.remove(); settle(); } });
  });
}

export function switchTheme(mode: Mode, from: Element | null = null) {
  if (mode === theme()) return;
  if (busy) {
    wanted = mode;
    return;
  }
  if (!matchMedia(media.motion).matches) return apply(mode);

  const target = probe(mode);
  const angles: [number, number] = [rad(angle('--wipe-angle')), rad(angle('--wipe-angle', target))];
  target.remove();
  busy = true;
  if (!document.startViewTransition) return fallback(mode, from, angles);

  let o: Opening | undefined;
  const restore = holdPlace();
  root.classList.add(SWITCHING);
  const vt = document.startViewTransition(() => {
    apply(mode, restore);
    o = new Opening(from, palette());
    o.draw();
    root.style.setProperty('--switch-clip', o.clip());
  });
  vt.ready.then(() => {
    if (!o) return;
    const opening = o;
    const tl = choreograph(opening, angles[0], angles[1]).eventCallback('onUpdate', () => {
      opening.draw();
      root.style.setProperty('--switch-clip', opening.clip());
    });
    // the pseudo-elements carry no animation of their own, so this one holds the transition open
    root.animate({ opacity: [1, 1] }, { duration: tl.duration() * 1000, pseudoElement: '::view-transition-new(root)' });
  }).catch(() => {});
  vt.finished.finally(() => {
    o?.remove();
    root.classList.remove(SWITCHING);
    root.style.removeProperty('--switch-clip');
    settle();
  });
}
