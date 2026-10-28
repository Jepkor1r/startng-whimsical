/**
 * Hidden snack hunt (Easter egg).
 * Tap every floating thing in the hero. The first tap reveals a counter on
 * your start.ng character; each find gets a lime tick. Find them all and the
 * character celebrates and nudges you towards a real game.
 *
 * The total is whatever is visible: 6 things on phones, 8 on wider screens.
 * Works with reduced motion too (just without the bouncing and confetti).
 * The floaters are decorative (aria-hidden), so this is a pointer-only bonus;
 * the win message is still announced through a live region.
 */
import { burst, jump } from './fx.js';

export function initSnackHunt(motion) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const floaters = [...hero.querySelectorAll('.floater')];
  const buddy = hero.querySelector('.buddy');
  const counter = hero.querySelector('.hunt-count');
  const win = hero.querySelector('.hunt-win');
  const found = new Set();
  let won = false;

  const visible = () => floaters.filter((f) => f.getClientRects().length > 0);

  const update = () => {
    const pool = visible();
    const got = pool.filter((f) => found.has(f)).length;
    counter.textContent = `${got}/${pool.length}`;
    counter.classList.add('is-on');
    if (motion.ok) {
      counter.animate([{ scale: 1 }, { scale: 1.35 }, { scale: 1 }], { duration: 350, easing: 'ease-out' });
    }
    if (got === pool.length && !won) celebrate(pool.length);
  };

  const celebrate = (total) => {
    won = true;
    counter.textContent = `${total}/${total} ★`;

    const msg = document.createElement('p');
    msg.innerHTML = `<b>Na you sabi!</b> You found all ${total}. With eyes like that, the daily tournament should be scared.`;

    const go = document.createElement('a');
    go.className = 'btn';
    go.href = '#games';
    go.textContent = 'Pick a game';
    go.addEventListener('click', close);

    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'hunt-close';
    x.setAttribute('aria-label', 'Close message');
    x.textContent = '×';
    x.addEventListener('click', close);

    win.replaceChildren(msg, go, x);
    win.classList.add('is-open');

    if (motion.ok && buddy) {
      burst(buddy, 24);
      jump(buddy);
      setTimeout(() => jump(buddy), 760);
    }
  };

  function close() {
    win.classList.remove('is-open');
    win.replaceChildren();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && win.classList.contains('is-open')) close();
  });

  floaters.forEach((floater) => {
    floater.addEventListener('click', () => {
      if (found.has(floater)) return;
      found.add(floater);
      floater.classList.add('is-found');
      update();
    });
  });
}
