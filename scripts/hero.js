/**
 * Hero interactions
 *  - Floating Lagos things drift away from the cursor (parallax, mouse only).
 *  - Tap/click a floating thing: it boings and shouts (e.g. "Jollof!").
 *  - Your start.ng character watches the pointer, and jumps when tapped.
 *  - "Play now": coin drops into the slot, button presses, sparks fly,
 *    the character jumps, then we scroll to the games.
 * One-off reactions use the Web Animations API (transform/opacity only).
 */
const SPARK_COLOURS = ['#d8fd71', '#f7b731', '#e2572b', '#346fdf', '#8e4fd6', '#db2967'];
const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

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

/* ---------- Reaction helpers ---------- */

function boing(el) {
  el.animate([
    { transform: 'none' },
    { transform: 'scale(1.25, 0.8)', offset: 0.2 },
    { transform: 'translateY(-18px) scale(0.9, 1.12) rotate(12deg)', offset: 0.5 },
    { transform: 'scale(1.06, 0.94)', offset: 0.8 },
    { transform: 'none' },
  ], { duration: 650, easing: 'ease-out' });
}

function jump(el) {
  el.animate([
    { transform: 'none' },
    { transform: 'scale(1.12, 0.85)', offset: 0.15 },
    { transform: 'translateY(-34px) scale(0.92, 1.08) rotate(-6deg)', offset: 0.45 },
    { transform: 'scale(1.1, 0.9)', offset: 0.78 },
    { transform: 'none' },
  ], { duration: 720, easing: 'ease-out' });
}

function say(floater, text) {
  if (!text) return;
  const chip = document.createElement('span');
  chip.className = 'say';
  chip.textContent = text;
  floater.appendChild(chip);
  chip.animate([
    { opacity: 0, transform: 'translate(-50%, 0) scale(0.6)' },
    { opacity: 1, transform: 'translate(-50%, -18px) scale(1)', offset: 0.25 },
    { opacity: 0, transform: 'translate(-50%, -42px) scale(0.9)' },
  ], { duration: 1100, easing: 'ease-out' }).onfinish = () => chip.remove();
}

/** Confetti-ish sparks flying out from the centre of an element. */
function burst(el, count = 14) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  for (let i = 0; i < count; i++) {
    const spark = document.createElement('span');
    spark.className = 'spark';
    spark.style.cssText = `position:fixed;left:${cx - 4.5}px;top:${cy - 4.5}px;background:${SPARK_COLOURS[i % SPARK_COLOURS.length]}`;
    document.body.appendChild(spark);

    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 55 + Math.random() * 45;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist * 0.75;
    spark.animate([
      { opacity: 1, transform: 'translate(0, 0) rotate(0) scale(1)' },
      { opacity: 0, transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 360}deg) scale(0.3)` },
    ], { duration: 650, easing: EASE_OUT }).onfinish = () => spark.remove();
  }
}
