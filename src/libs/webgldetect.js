/**
 * WebGl detector
 */
export default function webglDetector() {
  const WebGL = { status: false, disabled: true };
  const names = ['webgl', 'experimental-webgl', 'moz-webgl'];

  if (!!window.WebGLRenderingContext) {
    let canvas = document.createElement('canvas'),
        gl = false, i;

    for (i in names) {
      try {
        gl = canvas.getContext(names[i]);

        if (gl && typeof gl.getParameter === 'function') {
          // WebGL is enabled
          WebGL.status = true;
          WebGL.disabled = false;
          WebGL.name = names[i];

          return WebGL;
        }
      } catch(e) {}
    }
    // WebGL is supported, but disabled
    WebGL.status = true;
  }

  // WebGL not supported
  return WebGL;
};