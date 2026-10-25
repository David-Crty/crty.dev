import { gsap, ease } from './brand';

/**
 * "◀◀ Rewind" runs the page back to the top on the house swing instead of jumping, so the
 * scroll story plays backwards on the way up: the card's edge unspools into hairlines and
 * they wind back into the hero tape. Scrolling by hand at any point takes over.
 */
export function rewind() {
  const off = new AbortController();
  const html = document.documentElement;
  for (const link of document.querySelectorAll<HTMLAnchorElement>('.site .rewind')) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      html.style.scrollBehavior = 'auto';
      gsap.to(window, {
        scrollTo: { y: 0, autoKill: true },
        duration: gsap.utils.clamp(0.9, 2.2, scrollY / 1400),
        ease: ease.swing,
        overwrite: true,
        onInterrupt: () => { html.style.scrollBehavior = ''; },
        onComplete: () => {
          html.style.scrollBehavior = '';
          location.hash = link.hash;
        },
      });
    }, { signal: off.signal });
  }
  return () => off.abort();
}
