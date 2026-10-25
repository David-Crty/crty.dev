import { gsap, ease, dur, theme } from './brand';

const HIDE_LEFT = 'inset(0% 100% 0% 0%)';
const HIDE_RIGHT = 'inset(0% 0% 0% 100%)';
const SHOW = 'inset(0% 0% 0% 0%)';

/** Which half of the row the pointer is over, so the tape comes in and goes out on that side. */
const leftHalf = (row: HTMLElement, e: PointerEvent) => {
  const r = row.getBoundingClientRect();
  return e.clientX < r.left + r.width / 2;
};

/**
 * Dark rows: the band under a row runs in from the side the pointer came from and runs out
 * the side it leaves by, so sweeping down a list draws one tape after another.
 */
function bands(list: HTMLElement, signal: AbortSignal) {
  for (const row of list.querySelectorAll<HTMLElement>('.row')) {
    const band = document.createElement('span');
    band.className = 'band';
    band.setAttribute('aria-hidden', 'true');
    row.append(band);
    gsap.set(band, { clipPath: HIDE_LEFT });
    let shown = false;
    const show = (fromLeft: boolean) => {
      if (!shown) gsap.set(band, { clipPath: fromLeft ? HIDE_LEFT : HIDE_RIGHT });
      shown = true;
      gsap.to(band, { clipPath: SHOW, duration: dur.base, ease: ease.tape, overwrite: true });
    };
    const hide = (toLeft: boolean) => {
      shown = false;
      gsap.to(band, { clipPath: toLeft ? HIDE_LEFT : HIDE_RIGHT, duration: dur.base, ease: ease.tape, overwrite: true });
    };
    row.addEventListener('pointerenter', (e) => show(leftHalf(row, e)), { signal });
    row.addEventListener('pointerleave', (e) => hide(leftHalf(row, e)), { signal });
    row.addEventListener('focus', () => show(true), { signal });
    row.addEventListener('blur', () => hide(false), { signal });
  }
}

/**
 * Light shelf: a spine's coloured tab splits into three blocks that rise up through it one
 * after another, like a sleeve's colour mark being printed, and sink back when the pointer leaves.
 */
function marks(list: HTMLElement, signal: AbortSignal) {
  for (const row of list.querySelectorAll<HTMLElement>('.row')) {
    const mark = document.createElement('span');
    mark.className = 'mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<i></i><i></i><i></i>';
    row.append(mark);
    const blocks = [...mark.children];
    gsap.set(blocks, { scaleY: 0, transformOrigin: '50% 100%' });
    const rise = () => gsap.to(blocks, { scaleY: 1, transformOrigin: '50% 100%', duration: dur.quick + 0.08, ease: ease.tape, stagger: 0.06, overwrite: true });
    const sink = () => gsap.to(blocks, { scaleY: 0, transformOrigin: '50% 0%', duration: dur.quick, ease: ease.tape, stagger: { each: 0.05, from: 'end' }, overwrite: true });
    row.addEventListener('pointerenter', rise, { signal });
    row.addEventListener('pointerleave', sink, { signal });
    row.addEventListener('focus', rise, { signal });
    row.addEventListener('blur', sink, { signal });
  }
}

export function hovers() {
  const light = theme() === 'light';
  const off = new AbortController();
  for (const list of document.querySelectorAll<HTMLElement>('.site .rows')) {
    if (!light) bands(list, off.signal);
    else if (list.classList.contains('shelf')) marks(list, off.signal);
  }
  document.documentElement.classList.toggle('has-bands', !light);
  return () => {
    off.abort();
    document.documentElement.classList.remove('has-bands');
    document.querySelectorAll('.site .row > .band, .site .row > .mark').forEach((el) => el.remove());
  };
}
