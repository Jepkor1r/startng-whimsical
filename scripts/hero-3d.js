/**
 * Decides whether the hero gets its one Three.js moment (a 3D jollof pot).
 * The flat SVG pot is the default and the fallback. Three.js is only fetched,
 * after the page is idle, when ALL of these hold:
 *   - motion is OK (no prefers-reduced-motion) and the device isn't "lite"
 *   - not Save-Data, at least 4 CPU cores
 *   - a wide screen (≥ 760px) with a mouse/trackpad
 *   - a WebGL2 context can actually be created
 * Any failure (old browser, network, GPU) quietly keeps the SVG.
 */
export function initHero3D(motion) {
  const floater = document.querySelector('.f-jollof');
  if (!floater || !capable(motion)) return;

  const go = () => {
    if (!capable(motion)) return;
    import('./jollof-3d.js')
      .then(({ mountJollof3D }) => mountJollof3D(floater, motion))
      .catch(() => { /* keep the SVG */ });
  };

  // Wait for the page to finish loading and go idle: the 3D never competes with content.
  const whenIdle = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 1200));
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}

function capable(motion) {
  if (!motion.ok || motion.lite) return false;
  if (navigator.connection?.saveData) return false;
  if ((navigator.hardwareConcurrency || 0) < 4) return false;
  if (!motion.finePointer || !window.matchMedia('(min-width: 760px)').matches) return false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext(); // free the probe context
    return true;
  } catch {
    return false;
  }
}
