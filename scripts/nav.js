/**
 * Phone menu (≤ 600px): the menu button folds the page links into a drop-down
 * card. Closes on Esc (focus returns to the button), on an outside tap, after
 * following a link, or when the screen gets wide enough to show the links inline.
 */
export function initNav() {
  const header = document.querySelector('.nav');
  const button = header?.querySelector('.menu-toggle');
  const nav = header?.querySelector('#site-nav');
  if (!button || !nav) return;
  const phone = window.matchMedia('(max-width: 600px)');

  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
  };
  const isOpen = () => header.classList.contains('is-open');

  button.addEventListener('click', () => {
    setOpen(!isOpen());
    if (isOpen()) nav.querySelector('a')?.focus({ preventScroll: true });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      button.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (isOpen() && !header.contains(e.target)) setOpen(false);
  });

  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  phone.addEventListener('change', (e) => { if (!e.matches) setOpen(false); });
}
