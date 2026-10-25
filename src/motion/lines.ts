/** A stripe drawn from its top-left corner P towards Q, `t` thick along its normal, at opacity `a`. */
export interface Seg {
  px: number;
  py: number;
  qx: number;
  qy: number;
  t: number;
  a: number;
}

/** The size every stripe is drawn at and scaled down from, so none is ever scaled up and blurred. */
const LONG = 2400;
const THICK = 24;

/**
 * Loose stripes laid over the page in page coordinates, for the scroll stories. The layer
 * clips to whatever region the story allows, so a stripe can never land on text.
 */
export class Ribbon {
  readonly el = document.createElement('div');
  readonly lines: HTMLElement[];

  constructor(host: Element, colours: string[]) {
    this.el.className = 'ribbon';
    this.el.setAttribute('aria-hidden', 'true');
    this.lines = colours.map((c) => {
      const line = document.createElement('i');
      line.style.background = c;
      this.el.append(line);
      return line;
    });
    host.append(this.el);
  }

  draw(k: number, s: Seg) {
    const dx = s.qx - s.px, dy = s.qy - s.py;
    const style = this.lines[k].style;
    style.transform = `translate(${s.px}px, ${s.py}px) rotate(${Math.atan2(dy, dx)}rad) scale(${Math.hypot(dx, dy) / LONG}, ${s.t / THICK})`;
    style.opacity = String(s.a);
  }

  /** Shows the layer only inside `outer`, minus the `holes`, all in page pixels. */
  clip(outer: Box, holes: Box[]) {
    const rect = (b: Box) => `M${b.x0},${b.y0}H${b.x1}V${b.y1}H${b.x0}Z`;
    const cut = holes.map((b) => inside(b, outer)).filter((b) => b.x1 > b.x0 && b.y1 > b.y0);
    this.el.style.height = `${outer.y1}px`;
    this.el.style.clipPath = `path(evenodd, "${[outer, ...cut].map(rect).join(' ')}")`;
  }

  show(on: boolean) {
    this.el.style.visibility = on ? 'visible' : 'hidden';
  }

  remove() {
    this.el.remove();
  }
}

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** An element's box in page pixels, grown by `pad`. */
export function boxOf(el: Element, pad = 0): Box {
  const r = el.getBoundingClientRect();
  return { x0: r.left + scrollX - pad, y0: r.top + scrollY - pad, x1: r.right + scrollX + pad, y1: r.bottom + scrollY + pad };
}

function inside(b: Box, o: Box): Box {
  return { x0: Math.max(b.x0, o.x0), y0: Math.max(b.y0, o.y0), x1: Math.min(b.x1, o.x1), y1: Math.min(b.y1, o.y1) };
}
