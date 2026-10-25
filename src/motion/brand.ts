import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(CustomEase, ScrollTrigger, ScrollToPlugin, SplitText);

const root = document.documentElement;
const prop = (name: string, el: Element = root) => getComputedStyle(el).getPropertyValue(name).trim();
const seconds = (name: string) => parseFloat(prop(name)) / 1000;

function bezier(name: string) {
  const [a, b, c, d] = (prop(name).match(/-?[\d.]+/g) ?? ['0', '0', '1', '1']).map(Number);
  return `M0,0 C${a},${b} ${c},${d} 1,1`;
}

export const ease = {
  tape: CustomEase.create('tape', bezier('--ease-tape')),
  swing: CustomEase.create('tape-swing', bezier('--ease-tape-swing')),
};

export const dur = {
  quick: seconds('--tape-quick'),
  base: seconds('--tape-base'),
  long: seconds('--tape-long'),
  stagger: seconds('--tape-stagger'),
};

export const media = {
  motion: '(prefers-reduced-motion: no-preference)',
  wide: '(min-width: 961px)',
};

export const theme = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

/** The tape's six colours where `el` sits: the page, or a theme probe. */
export function palette(el: Element = root): string[] {
  return [1, 2, 3, 4, 5, 6].map((i) => prop(`--band-${i}`, el));
}

/** An invisible element wearing another theme, to read its tokens before switching to it. */
export function probe(mode: 'light' | 'dark') {
  const el = document.createElement('i');
  el.hidden = true;
  el.setAttribute('data-theme', mode);
  return document.body.appendChild(el);
}

/** A custom property in degrees, read where the layout sets it. */
export function angle(name: string, el: Element = root): number {
  return parseFloat(prop(name, el)) || 0;
}

export function token(name: string, el: Element = root): string {
  return prop(name, el);
}

/** How far through an eased tween it reaches `y`, so a beat can be timed to a moving edge. */
export function reach(fn: (x: number) => number, y: number) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < y) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The left edge of every visible character in `el`, as the browser kerns and lays it out. */
function kerned(el: Element) {
  const lefts: number[] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walk.nextNode() as Text | null; node; node = walk.nextNode() as Text | null) {
    for (let i = 0; i < node.length; i++) {
      if (!node.data[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      lefts.push(range.getBoundingClientRect().left);
    }
  }
  return lefts;
}

/**
 * Splits text into letters, each in a padded word mask so descenders are never cropped.
 * Split letters lose their kerning, so each one is nudged back onto the spot it held in the
 * unsplit text: reverting the split afterwards moves nothing.
 */
export function letters(el: HTMLElement) {
  const lefts = kerned(el);
  const split = SplitText.create(el, { type: 'words,chars', mask: 'words', wordsClass: 'word' });
  split.chars.forEach((c, i) => {
    const dx = (lefts[i] ?? 0) - c.getBoundingClientRect().left;
    if (Math.abs(dx) > 0.05) (c as HTMLElement).style.marginLeft = `${dx}px`;
  });
  return split;
}

const unit = gsap.utils.clamp(0, 1);

/** Progress through the [from, to] slice of `p`, clamped to 0..1. */
export const slice = (p: number, from: number, to: number) => unit(gsap.utils.normalize(from, to, p));
export const mix = (a: number, b: number, k: number) => gsap.utils.interpolate(a, b, k);
export { unit };

export { gsap, ScrollTrigger };
