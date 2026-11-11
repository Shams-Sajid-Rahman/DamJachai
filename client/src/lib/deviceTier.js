/**
 * Decides how much 3D the device can handle on the landing page.
 *
 *  - 'full'     desktop or strong device: every object, sparkles, antialiasing, DPR up to 1.75
 *  - 'lite'     small screen or modest device: fewer objects, no sparkles, DPR up to 1.25
 *  - 'fallback' no WebGL, software renderer, Save-Data on, or a very weak device: 2D gradient only
 *
 * `reducedMotion` (prefers-reduced-motion) keeps the 3D but renders one calm, static frame.
 */

function getGpuInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { webgl: false, renderer: '' };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext(); // free the probe context straight away
    return { webgl: true, renderer };
  } catch {
    return { webgl: false, renderer: '' };
  }
}

const SOFTWARE_GPU = /swiftshader|llvmpipe|software|basic render|microsoft basic/i;

export function detectDeviceTier() {
  if (typeof window === 'undefined') return { tier: 'fallback', reducedMotion: true, smallScreen: true };

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const smallScreen = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4; // GB, Chrome only
  const saveData = navigator.connection?.saveData === true;

  const base = { reducedMotion, smallScreen };

  // For testing: ?scene=full | lite | fallback forces a tier (and ?scene=static forces reduced motion).
  const forced = new URLSearchParams(window.location.search).get('scene');
  if (['full', 'lite', 'fallback'].includes(forced)) return { ...base, smallScreen: false, tier: forced, reason: 'forced' };
  if (forced === 'static') return { ...base, smallScreen: false, reducedMotion: true, tier: 'full', reason: 'forced' };

  if (saveData) return { ...base, tier: 'fallback', reason: 'save-data' };

  const gpu = getGpuInfo();
  if (!gpu.webgl) return { ...base, tier: 'fallback', reason: 'no-webgl' };
  if (SOFTWARE_GPU.test(gpu.renderer)) return { ...base, tier: 'fallback', reason: 'software-gpu' };
  if (cores <= 2 || memory <= 2) return { ...base, tier: 'fallback', reason: 'weak-device' };

  const tier = smallScreen || cores <= 4 || memory <= 4 ? 'lite' : 'full';
  return { ...base, tier };
}
