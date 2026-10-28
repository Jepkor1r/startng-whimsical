/**
 * Hidden snack hunt (Easter egg).
 * Tap every floating thing in the hero. The first tap reveals a counter on
 * your start.ng character; each find gets a lime tick. Find them all and the
 * character celebrates and nudges you towards a real game.
 *
 * The total is whatever is visible: 6 things on phones, 8 on wider screens.
 * Works with reduced motion too (just without the bouncing and confetti).
 *
 * Keyboard + screen readers: the floating things are buttons forming ONE Tab
 * stop (a roving tabindex, placed just after "Play now"). Arrow keys move
 * between them in reading order, Home/End jump to the ends, Enter/Space taps.
 * Progress is announced ("3 of 8 found"); winning by keyboard moves focus to
 * "Pick a game", and Esc returns it to the snacks.
 */
import { burst, jump } from './fx.js';

export function initSnackHunt(motion) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const stage = hero.querySelector('.hero-stage');
  const floaters = [...hero.querySelectorAll('.floater')];
  const buddy = hero.querySelector('.buddy');
  const counter = hero.querySelector('.hunt-count');
  const status = hero.querySelector('.hunt-status');
  const win = hero.querySelector('.hunt-win');
  const found = new Set();
  let won = false;
  let lastFocused = null;

  // Wake the snacks up for assistive tech (they're inert without JS).
  stage.removeAttribute('aria-hidden');
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-label', 'Snack hunt');
  floaters.forEach((f) => f.setAttribute('aria-label', f.dataset.name));

  const visible = () => floaters.filter((f) => f.getClientRects().length > 0);

  /** Visible snacks in reading order: top-to-bottom rows, then left-to-right. */
  const inReadingOrder = () => visible()
    .map((f) => ({ f, r: f.getBoundingClientRect() }))
    .sort((a, b) => (Math.abs(a.r.top - b.r.top) > 40 ? a.r.top - b.r.top : a.r.left - b.r.left))
    .map(({ f }) => f);

  /* ---------- Roving tabindex: exactly one snack is tabbable ---------- */
  const setTabStop = (target) => floaters.forEach((f) => { f.tabIndex = f === target ? 0 : -1; });
  const ensureTabStop = () => {
    const current = floaters.find((f) => f.tabIndex === 0);
    if (!current || !current.getClientRects().length) setTabStop(inReadingOrder()[0]);
  };
  ensureTabStop();
  window.matchMedia('(min-width: 760px)').addEventListener('change', ensureTabStop);

  stage.addEventListener('keydown', (e) => {
    const order = inReadingOrder();
    const i = order.indexOf(document.activeElement);
    if (i < 0) return;
    const moves = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: order.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = order[(moves[e.key] + order.length) % order.length]; // wraps around
    setTabStop(next);
    next.focus();
  });

  /* ---------- Counting ---------- */
  const update = (byKeyboard) => {
    const pool = visible();
    const got = pool.filter((f) => found.has(f)).length;
    counter.textContent = `${got}/${pool.length}`;
    counter.classList.add('is-on');
    if (motion.ok) {
      counter.animate([{ scale: 1 }, { scale: 1.35 }, { scale: 1 }], { duration: 350, easing: 'ease-out' });
    }
    if (got === pool.length && !won) celebrate(pool.length, byKeyboard);
    else status.textContent = `${got} of ${pool.length} found`;
  };

  const celebrate = (total, byKeyboard) => {
    won = true;
    counter.textContent = `${total}/${total} ★`;
    status.textContent = '';

    const msg = document.createElement('p');
    msg.innerHTML = `<b>Na you sabi!</b> You found all ${total}. With eyes like that, the daily tournament should be scared.`;

    const go = document.createElement('a');
    go.className = 'btn';
    go.href = '#games';
    go.textContent = 'Pick a game';
    go.addEventListener('click', () => close(false));

    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'hunt-close';
    x.setAttribute('aria-label', 'Close message');
    x.textContent = '×';
    x.addEventListener('click', () => close(true));

    win.replaceChildren(msg, go, x);
    win.classList.add('is-open');
    if (byKeyboard) go.focus({ preventScroll: true });

    if (motion.ok && buddy) {
      burst(buddy, 24);
      jump(buddy);
      setTimeout(() => jump(buddy), 760);
    }
  };

  function close(returnFocus) {
    const hadFocus = win.contains(document.activeElement);
    win.classList.remove('is-open');
    win.replaceChildren();
    if (returnFocus && hadFocus) lastFocused?.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && win.classList.contains('is-open')) close(true);
  });

  floaters.forEach((floater) => {
    floater.addEventListener('click', (e) => {
      lastFocused = floater;
      setTabStop(floater);
      if (found.has(floater)) return;
      found.add(floater);
      floater.classList.add('is-found');
      floater.setAttribute('aria-label', `${floater.dataset.name}, found`);
      update(e.detail === 0); // detail 0 = activated by keyboard, not a pointer
    });
  });
}
