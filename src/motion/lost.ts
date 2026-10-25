import { gsap, ScrollTrigger } from './brand';

/**
 * The 404 is the one page allowed a tracking glitch: every few seconds two slices of the
 * title jump sideways for a few frames, and a tracking bar rolls down the page.
 */
export function lost() {
  const box = document.querySelector<HTMLElement>('.lost');
  const title = box?.querySelector<HTMLElement>('.glitch');
  const bar = box?.querySelector<HTMLElement>('.tracking');
  if (!box || !title || !bar) return;

  const rand = gsap.utils.random;
  const slice = (p: 'a' | 'b') => {
    const top = rand(4, 78, 1);
    const height = rand(6, 22, 1);
    return { [`--${p}-top`]: `${top}%`, [`--${p}-bottom`]: `${100 - top - height}%`, [`--${p}-x`]: `${rand(-14, 14, 1)}px` };
  };
  const rest = { '--a-top': '100%', '--a-bottom': '0%', '--a-x': '0px', '--b-top': '100%', '--b-bottom': '0%', '--b-x': '0px' };

  gsap.set(title, rest);
  const glitch = gsap.timeline({ repeat: -1, repeatDelay: 4.2, delay: 1.6 });
  [0, 0.1, 0.2].forEach((at) => glitch
    .call(() => gsap.set(title, slice('a')), [], at)
    .call(() => gsap.set(title, slice('b')), [], at + 0.05));
  glitch.call(() => gsap.set(title, rest), [], 0.32);

  gsap.set(bar, { opacity: 0.5 });
  const roll = gsap.fromTo(bar, { y: -40 }, { y: () => box.offsetHeight, duration: 7, ease: 'none', repeat: -1 });

  ScrollTrigger.create({
    trigger: box,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: ({ isActive }) => [glitch, roll].forEach((a) => (isActive ? a.resume() : a.pause())),
  });
}
