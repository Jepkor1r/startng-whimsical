/**
 * "Got a game?" steps as a danfo route.
 * As the section scrolls through the viewport, the bus drives along the road
 * (vertical on phones, horizontal on desktop), the road fills in behind it,
 * and each step lights up when the bus reaches its stop. Scroll back and the
 * bus reverses (and turns around).
 *
 * Reduced motion: the bus parks at the last stop and every step is lit.
 */
export function initRoute(motion) {
  const route = document.querySelector('.route');
  if (!route) return;
  const road = route.querySelector('.road');
  const bus = route.querySelector('.bus');
  const steps = [...route.querySelectorAll('.step')];
  const wide = window.matchMedia('(min-width: 760px)');

  let travel = 0;     // px the bus can move along the road
  let busLen = 0;     // bus length along the road axis
  let stopsAt = [];   // each stop's centre, in px along the road
  let lastP = -1;
  let raf = 0;
  let active = false;
  let driveTimer = 0;

  const measure = () => {
    const horizontal = wide.matches;
    const roadRect = road.getBoundingClientRect();
    const busRect = bus.getBoundingClientRect();
    busLen = horizontal ? busRect.width : busRect.height;
    travel = Math.max(0, (horizontal ? roadRect.width : roadRect.height) - busLen);
    stopsAt = steps.map((step) => {
      const s = step.querySelector('.stop').getBoundingClientRect();
      return horizontal ? s.left + s.width / 2 - roadRect.left : s.top + s.height / 2 - roadRect.top;
    });
  };

  const paint = (p, dir) => {
    route.style.setProperty('--p', p.toFixed(4));
    route.style.setProperty('--travel-now', `${(p * travel).toFixed(1)}px`);
    route.style.setProperty('--dir', dir);
    const front = p * travel + busLen * 0.8; // roughly where the bus's nose is
    steps.forEach((step, i) => step.classList.toggle('is-lit', front >= stopsAt[i]));
  };

  const parkAtEnd = () => { measure(); paint(1, 1); };

  const render = () => {
    raf = 0;
    if (!motion.ok) return parkAtEnd();
    const r = route.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the route's top hits 85% down the screen, 1 when its bottom reaches 40%.
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.45)));
    if (Math.abs(p - lastP) < 0.0005) return;

    paint(p, lastP >= 0 && p < lastP ? -1 : 1);
    if (lastP >= 0) {
      bus.classList.add('is-driving');
      clearTimeout(driveTimer);
      driveTimer = setTimeout(() => bus.classList.remove('is-driving'), 180);
    }
    lastP = p;
  };

  const schedule = () => { if (active && !raf) raf = requestAnimationFrame(render); };

  const relayout = () => { measure(); lastP = -1; render(); };

  measure();
  if (!motion.ok) parkAtEnd(); else render();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) schedule();
    }).observe(route);
  } else {
    active = true;
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  document.addEventListener('motionchange', relayout);
}
