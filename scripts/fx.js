/**
 * Shared one-off reactions (Web Animations API, transform/opacity only).
 * Callers decide whether motion is allowed before using these.
 */
const SPARK_COLOURS = ['#d8fd71', '#f7b731', '#e2572b', '#346fdf', '#8e4fd6', '#db2967'];
const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

export function boing(el) {
  el.animate([
    { transform: 'none' },
    { transform: 'scale(1.25, 0.8)', offset: 0.2 },
    { transform: 'translateY(-18px) scale(0.9, 1.12) rotate(12deg)', offset: 0.5 },
    { transform: 'scale(1.06, 0.94)', offset: 0.8 },
    { transform: 'none' },
  ], { duration: 650, easing: 'ease-out' });
}

export function jump(el) {
  el.animate([
    { transform: 'none' },
    { transform: 'scale(1.12, 0.85)', offset: 0.15 },
    { transform: 'translateY(-34px) scale(0.92, 1.08) rotate(-6deg)', offset: 0.45 },
    { transform: 'scale(1.1, 0.9)', offset: 0.78 },
    { transform: 'none' },
  ], { duration: 720, easing: 'ease-out' });
}

export function say(floater, text) {
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
export function burst(el, count = 14) {
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
