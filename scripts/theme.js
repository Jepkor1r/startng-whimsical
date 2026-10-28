/**
 * Light / dark theme toggle (start.ng has both).
 * The <head> script already applied the saved or OS theme before first paint;
 * this wires up the button, remembers the choice and follows OS changes
 * until the user picks one.
 *
 * Whimsy: where the View Transitions API exists, the new theme sweeps out in a
 * circle from the toggle like a light switching on/off. Reduced motion or
 * older browsers get an instant switch.
 */
export function initTheme(motion) {
  const root = document.documentElement;
  const button = document.querySelector('.theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');
  const osDark = window.matchMedia('(prefers-color-scheme: dark)');
  if (!button) return;

  const saved = () => { try { return localStorage.getItem('theme'); } catch { return null; } };
  const save = (theme) => { try { localStorage.setItem('theme', theme); } catch { /* private mode */ } };

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    meta?.setAttribute('content', theme === 'dark' ? '#292a23' : '#f6f5ee');
  };

  apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  osDark.addEventListener('change', (e) => { if (!saved()) apply(e.matches ? 'dark' : 'light'); });

  button.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    save(next);

    if (!motion.ok || !document.startViewTransition) return apply(next);

    const r = button.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    document.startViewTransition(() => apply(next)).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  });
}
