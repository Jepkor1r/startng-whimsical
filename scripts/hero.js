/**
 * Hero interactions
 *  - Floating Lagos things drift away from the cursor (parallax, mouse only).
 *  - Tap/click a floating thing: it boings and shouts (e.g. "Jollof!").
 *  - Your start.ng character watches the pointer, and jumps when tapped.
 *  - "Play now": coin drops into the slot, button presses, sparks fly,
 *    the character jumps, then we scroll to the games.
 * One-off reactions use the Web Animations API (transform/opacity only).
 */
import { boing, jump, say, burst } from './fx.js';

export function initHero(motion) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const buddy = hero.querySelector('.buddy');
  const play = hero.querySelector('.btn-play');

  // Pause the idle loops while the hero is off-screen (saves battery).
  let inView = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      hero.classList.toggle('is-offscreen', !inView);
    }).observe(hero);
  }

  /* ---------- Pointer tracking: parallax + character eyes ---------- */
  let px = 0;
  let py = 0;
  let raf = 0;

  const update = () => {
    raf = 0;
    if (!inView || !motion.ok) return;

    // Read layout first…
    const r = buddy && buddy.getBoundingClientRect();

    // …then write.
    if (motion.finePointer && !motion.lite) {
      hero.style.setProperty('--mx', (px / innerWidth * 2 - 1).toFixed(3));
      hero.style.setProperty('--my', (py / innerHeight * 2 - 1).toFixed(3));
    }
    if (r) {
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height * 0.45);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(dist / 120, 1) * 3; // pupils move up to 3 SVG units
      buddy.style.setProperty('--ex', `${(dx / dist * reach).toFixed(2)}px`);
      buddy.style.setProperty('--ey', `${(dy / dist * reach).toFixed(2)}px`);
    }
  };

  const track = (e) => {
    px = e.clientX;
    py = e.clientY;
    if (!raf) raf = requestAnimationFrame(update);
  };
  window.addEventListener('pointermove', track, { passive: true });
  window.addEventListener('pointerdown', track, { passive: true }); // touch: eyes look where you tap

  /* ---------- Tap a floating thing ---------- */
  hero.querySelectorAll('.floater').forEach((floater) => {
    floater.addEventListener('click', () => {
      if (!motion.ok) return;
      boing(floater.querySelector('svg'));
      say(floater, floater.dataset.say);
    });
  });

  /* ---------- Character ---------- */
  buddy?.addEventListener('click', () => motion.ok && jump(buddy));

  /* ---------- Play now ---------- */
  play?.addEventListener('click', (e) => {
    // Respect reduced motion and "open in new tab" style clicks: plain link behaviour.
    if (!motion.ok || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();

    play.querySelector('.coin').animate([
      { opacity: 1, transform: 'translateY(-10px) scale(1)' },
      { opacity: 1, transform: 'translateY(20px) scale(0.75)', offset: 0.7 },
      { opacity: 0, transform: 'translateY(30px) scale(0.3)' },
    ], { duration: 300, easing: 'ease-in' });

    play.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.92)', offset: 0.35 },
      { transform: 'scale(1.06)', offset: 0.7 },
      { transform: 'scale(1)' },
    ], { duration: 420, delay: 200, easing: 'ease-out' });

    setTimeout(() => burst(play), 260);
    if (buddy) setTimeout(() => jump(buddy), 300);

    // Short and sweet: the celebration never holds navigation back for more than half a second.
    setTimeout(() => {
      const target = document.getElementById('games');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', '#games');
      document.getElementById('games-title')?.focus({ preventScroll: true });
    }, 480);
  });
}
