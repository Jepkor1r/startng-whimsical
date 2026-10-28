/**
 * The only parts of Three.js the hero's 3D jollof pot uses.
 * Bundled + tree-shaken into assets/vendor/three-subset.min.js by
 * tools/build-three.sh so the site ships ~1/10th of the library
 * and still deploys with no build step.
 */
export {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  Mesh,
  LatheGeometry,
  SphereGeometry,
  TorusGeometry,
  MeshToonMaterial,
  MeshBasicMaterial,
  DirectionalLight,
  AmbientLight,
  DataTexture,
  RedFormat,
  NearestFilter,
  BackSide,
  Vector2,
  Color,
} from 'three';
