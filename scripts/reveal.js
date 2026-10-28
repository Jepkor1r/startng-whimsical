/**
 * Scroll reveal: elements with [data-reveal] rise in the first time they
 * enter the viewport. CSS only hides them under html.motion-ok, and if
 * IntersectionObserver is missing we reveal everything straight away.
 */
export function initReveal(motion) {
  const items = document.querySelectorAll('[data-reveal]');
  const showAll = () => items.forEach((el) => el.classList.add('is-in'));

  if (!motion.ok || !('IntersectionObserver' in window)) return showAll();
  document.addEventListener('motionchange', showAll);

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  items.forEach((el) => io.observe(el));
}
