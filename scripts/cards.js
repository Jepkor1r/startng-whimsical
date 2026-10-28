/**
 * Game cards tilt towards the cursor like a card in your hand.
 * Mouse/trackpad only; touch devices get the tap "squish" from CSS instead.
 */
const MAX_TILT = 12; // degrees

export function initCards(motion) {
  if (!motion.finePointer) return;

  document.querySelectorAll('.game-card').forEach((card) => {
    let raf = 0;
    let last;

    card.addEventListener('pointermove', (e) => {
      if (!motion.ok || motion.lite) return;
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = card.getBoundingClientRect();
        const x = (last.clientX - r.left) / r.width - 0.5;  // -0.5 … 0.5
        const y = (last.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', `${(x * MAX_TILT).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${(-y * MAX_TILT).toFixed(2)}deg`);
      });
    });

    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      raf = 0;
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
    });
  });
}
