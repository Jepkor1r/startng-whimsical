/**
 * The one Three.js moment: a cartoon 3D pot of jollof that replaces the
 * flat jollof sticker in the hero.
 *
 * - Toon shading + an "inverted hull" outline, so it matches the flat art.
 * - Spins slowly, leans towards the cursor, puffs steam.
 * - Click it: it hops and spins (the snack hunt still counts it, since the
 *   click lands on the same .floater element).
 * - Only renders while visible; tears itself down (back to the SVG) if the
 *   WebGL context is lost or the user switches to reduced motion.
 *
 * Only ever loaded by hero-3d.js, after it has checked the device can cope.
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh,
  LatheGeometry, SphereGeometry, TorusGeometry,
  MeshToonMaterial, MeshBasicMaterial, DirectionalLight, AmbientLight,
  DataTexture, RedFormat, NearestFilter, BackSide, Vector2, Color,
} from '../assets/vendor/three-subset.min.js';

const OUTLINE = { light: '#292a23', dark: '#e9e7dc' };
const STEAM = { light: '#cfcdbf', dark: '#fffefa' }; // white steam would vanish on the cream background

export function mountJollof3D(floater, motion) {
  const holder = floater.querySelector('.bob');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 2.4, 6.4);
  camera.lookAt(0, 0.15, 0);

  scene.add(new AmbientLight(0xffffff, 1.1));
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(3, 5, 4);
  scene.add(sun);

  // 3-step toon ramp
  const ramp = new DataTexture(new Uint8Array([90, 170, 255]), 3, 1, RedFormat);
  ramp.minFilter = ramp.magFilter = NearestFilter;
  ramp.needsUpdate = true;
  const toon = (color) => new MeshToonMaterial({ color, gradientMap: ramp });

  const outlineMat = new MeshBasicMaterial({ color: OUTLINE.light, side: BackSide });
  const withOutline = (mesh, grow = 1.06) => {
    const hull = new Mesh(mesh.geometry, outlineMat);
    hull.scale.setScalar(grow);
    mesh.add(hull);
    return mesh;
  };

  /* ---------- Build the pot ---------- */
  const pot = new Group();
  scene.add(pot);

  // Body: a lathe (profile spun around Y)
  const profile = [
    [0, -0.95], [0.75, -0.95], [1.1, -0.82], [1.3, -0.5], [1.36, -0.05], [1.32, 0.32],
  ].map(([x, y]) => new Vector2(x, y));
  pot.add(withOutline(new Mesh(new LatheGeometry(profile, 48), toon('#33342c')), 1.05));

  // Rim
  const rim = new Mesh(new TorusGeometry(1.32, 0.09, 12, 48), toon('#4a4b41'));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.33;
  pot.add(withOutline(rim, 1.08));

  // Handles: half rings sticking out each side
  for (const side of [-1, 1]) {
    const handle = new Mesh(new TorusGeometry(0.24, 0.075, 8, 20, Math.PI), toon('#4a4b41'));
    handle.position.set(side * 1.36, 0.12, 0);
    handle.rotation.set(Math.PI / 2, 0, side * -Math.PI / 2);
    pot.add(withOutline(handle, 1.15));
  }

  // Jollof: a squashed, slightly lumpy dome
  const riceGeo = new SphereGeometry(1.26, 48, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  const pos = riceGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const bump = 1 + Math.sin(x * 7.3) * Math.cos(z * 6.1) * 0.035 + Math.sin((x + z) * 13) * 0.015;
    pos.setXYZ(i, x * bump, y * bump, z * bump);
  }
  riceGeo.computeVertexNormals();
  const rice = new Mesh(riceGeo, toon('#e2572b'));
  rice.scale.y = 0.55;
  rice.position.y = 0.3;
  pot.add(withOutline(rice, 1.04));

  // Peas and carrots sprinkled on the dome
  const bits = [new SphereGeometry(0.075, 10, 8), new SphereGeometry(0.06, 8, 6)];
  const pea = toon('#278546');
  const carrot = toon('#f7b731');
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4;                       // golden-angle-ish spread
    const r = 0.25 + (i / 16) * 0.85;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = 0.3 + Math.sqrt(Math.max(0, 1.26 * 1.26 - r * r)) * 0.55;
    const bit = new Mesh(bits[i % 2], i % 3 ? pea : carrot);
    bit.position.set(x, y + 0.02, z);
    pot.add(bit);
  }

  // Steam puffs (loop upwards and fade by shrinking)
  const steamMat = new MeshBasicMaterial({ color: '#fffefa', transparent: true, opacity: 0.85 });
  const puffs = [0, 1, 2].map((i) => {
    const puff = new Mesh(new SphereGeometry(0.16, 12, 10), steamMat);
    puff.userData.offset = i / 3;
    puff.userData.x = (i - 1) * 0.35;
    scene.add(puff); // in scene space so steam rises straight up while the pot spins
    return puff;
  });

  /* ---------- Size, theme ---------- */
  const resize = () => {
    const size = Math.round(floater.getBoundingClientRect().width) || 120;
    renderer.setSize(size, size, false);
  };

  const applyTheme = () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    outlineMat.color = new Color(dark ? OUTLINE.dark : OUTLINE.light);
    steamMat.color = new Color(dark ? STEAM.dark : STEAM.light);
  };
  const themeWatch = new MutationObserver(applyTheme);
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  applyTheme();

  /* ---------- Interaction ---------- */
  let tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;
  let spinBoost = 0, hopT = 1;

  const onPointer = (e) => {
    aimY = (e.clientX / innerWidth - 0.5) * 0.8;
    aimX = (e.clientY / innerHeight - 0.5) * 0.5;
  };
  const onClick = () => { spinBoost = 9; hopT = 0; };
  window.addEventListener('pointermove', onPointer, { passive: true });
  floater.addEventListener('click', onClick);

  /* ---------- Loop (only while visible) ---------- */
  let last = performance.now();
  let spin = 0;
  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    spinBoost *= 0.92;
    spin += dt * (0.55 + spinBoost);
    tiltX += (aimX - tiltX) * 0.06;
    tiltY += (aimY - tiltY) * 0.06;
    pot.rotation.set(0.12 + tiltX, spin, tiltY * 0.4);

    hopT = Math.min(hopT + dt * 1.6, 1);
    pot.position.y = Math.sin(hopT * Math.PI) * 0.6; // one hop arc

    for (const puff of puffs) {
      const t = (now / 2400 + puff.userData.offset) % 1;
      puff.position.set(puff.userData.x + Math.sin(t * 6) * 0.08, 0.9 + t * 1.2 + pot.position.y, 0);
      puff.scale.setScalar(Math.sin(t * Math.PI) * 1.1);
    }

    renderer.render(scene, camera);
  };

  let visible = true;
  const sync = () => {
    const run = visible && !document.hidden && motion.ok;
    renderer.setAnimationLoop(run ? (t) => frame(t) : null);
    if (run) last = performance.now();
  };
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  io.observe(floater);
  document.addEventListener('visibilitychange', sync);

  /* ---------- Swap in only after the first frame has rendered ---------- */
  floater.classList.add('is-3d'); // the 3D pot is drawn a bit bigger than the sticker
  resize();
  frame(performance.now());
  holder.prepend(canvas);         // all in one task, so there's no blank frame
  window.addEventListener('resize', resize);
  sync();

  /* ---------- Fallback back to the SVG ---------- */
  const teardown = () => {
    renderer.setAnimationLoop(null);
    io.disconnect();
    themeWatch.disconnect();
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', sync);
    document.removeEventListener('motionchange', onMotionChange);
    floater.removeEventListener('click', onClick);
    floater.classList.remove('is-3d');
    canvas.remove();
    scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
    ramp.dispose();
    renderer.dispose();
  };
  const onMotionChange = () => { if (!motion.ok) teardown(); };

  canvas.addEventListener('webglcontextlost', teardown, { once: true });
  document.addEventListener('motionchange', onMotionChange);

  return teardown;
}
