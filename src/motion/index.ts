import { gsap, media, theme } from './brand';
import { findTape, glint, diagonalIdent, bandsIdent, playWhenSeen } from './hero';
import { diagonalStory, bandsStory } from './story';
import { headings, rows, footer, stair } from './reveal';
import { hovers } from './hover';
import { rewind } from './rewind';
import { lost } from './lost';

const SEEN = 'crty:intro';
const root = document.documentElement;
let late = false;
let introDone = false;

function seen() {
  try { return sessionStorage.getItem(SEEN) === '1'; } catch { return false; }
}

/** `replay` is for a theme switch: the new tape records itself while the switch reveals it. */
function mount({ replay = false } = {}) {
  const mm = gsap.matchMedia();
  mm.add({ motion: media.motion, wide: media.wide }, (ctx) => {
    const { motion, wide } = ctx.conditions as Record<string, boolean>;
    if (!motion) return;

    const light = theme() === 'light';
    const tape = findTape();
    const edge = document.querySelector<HTMLElement>('.site main section > .edge');
    let story: (() => void) | undefined;
    const roll = () => {
      if (!tape) return;
      glint(tape);
      story = light ? bandsStory(tape) : diagonalStory(tape, { wide });
    };
    // the hero tape becomes this edge on the way down, so it waits for it
    if (tape) edge?.classList.add('is-pending');
    // The ident is left out of the context: once played it must stay played, not be rolled
    // back to its first frame when the context reverts. Cleanup finishes it instead.
    let ident: gsap.core.Timeline | undefined;
    let alive = true;
    if (tape && !late && (replay || !introDone) && scrollY < 40) {
      ctx.ignore(() => {
        ident = (light ? bandsIdent : diagonalIdent)(tape, { quick: replay || seen(), wide });
        ident.call(() => {
          if (!alive) return;
          introDone = true;
          try { sessionStorage.setItem(SEEN, '1'); } catch {}
          ctx.add(roll);
        });
      });
      if (wide) ident!.play();
      else playWhenSeen(tape, ident!);
    } else {
      introDone = true;
      roll();
    }
    if (!tape && edge) stair(edge);

    headings();
    rows();
    footer();
    lost();
    const unhover = hovers();
    const unrewind = rewind();

    return () => {
      alive = false;
      ident?.progress(1).kill();
      story?.();
      unhover();
      unrewind();
      edge?.classList.remove('is-pending');
      document.querySelectorAll('.site .tape .tab, .site .tape .glint, .site .tape .ink, .site .run').forEach((el) => el.remove());
    };
  });
  return mm;
}

/** Text is split for some shots, so the motion waits for the real fonts to be measured. */
document.fonts.ready.then(() => {
  // booted after the failsafe already showed the static hero: leave it be
  late = performance.now() > 2400;
  root.classList.add('motion');
  let mm = mount();
  document.addEventListener('tape:theme', () => {
    mm.revert();
    mm = mount({ replay: true });
  });
});
