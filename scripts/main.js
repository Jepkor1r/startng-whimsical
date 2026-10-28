/**
 * Entry point. The <head> script has already set:
 *   html.motion-ok  → user has not asked for reduced motion
 *   html.lite       → Save-Data or a very low-core device: skip the always-on extras
 * Every module reads the shared `motion` object at event time, so flipping
 * the OS reduced-motion setting takes effect without a reload.
 */
import { initReveal } from './reveal.js';
import { initHero } from './hero.js';
import { initCards } from './cards.js';
import { initRoute } from './route.js';
import { initTheme } from './theme.js';
import { initSnackHunt } from './snack-hunt.js';
import { initNav } from './nav.js';

const root = document.documentElement;
const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const motion = {
  get ok() { return root.classList.contains('motion-ok'); },
  get lite() { return root.classList.contains('lite'); },
  finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
};

reduceQuery.addEventListener('change', (e) => {
  root.classList.toggle('motion-ok', !e.matches);
  document.dispatchEvent(new CustomEvent('motionchange'));
});

initReveal(motion);
initHero(motion);
initCards(motion);
initRoute(motion);
initTheme(motion);
initSnackHunt(motion);
initNav();
