import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './Grainient.css';

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ];
};

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime, uTimeSpeed, uColorBalance, uWarpStrength, uWarpFrequency;
uniform float uWarpSpeed, uWarpAmplitude, uBlendAngle, uBlendSoftness;
uniform float uRotationAmount, uNoiseScale, uGrainAmount, uGrainScale, uGrainAnimated;
uniform float uContrast, uGamma, uSaturation, uZoom;
uniform vec2 uCenterOffset;
uniform vec3 uColor1, uColor2, uColor3;
out vec4 fragColor;

mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
vec2 hash(vec2 p) { p = vec2(dot(p, vec2(2127.1,81.17)), dot(p, vec2(1269.5,283.37))); return fract(sin(p) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  float a = dot(-1.0 + 2.0 * hash(i), f);
  float b = dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(-1.0 + 2.0 * hash(i + vec2(1.0)), f - vec2(1.0));
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
void main() {
  float t = iTime * uTimeSpeed;
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float ratio = iResolution.x / max(iResolution.y, 1.0);
  vec2 p = (uv - 0.5 + uCenterOffset) / max(uZoom, 0.001);
  float degree = noise(vec2(t * 0.1, p.x * p.y) * uNoiseScale);
  p.y /= ratio;
  p = rot(radians((degree - 0.5) * uRotationAmount + 180.0)) * p;
  p.y *= ratio;
  float amp = uWarpAmplitude / max(uWarpStrength, 0.001);
  float wt = t * uWarpSpeed;
  p.x += sin(p.y * uWarpFrequency + wt) / max(amp, 0.001);
  p.y += sin(p.x * (uWarpFrequency * 1.5) + wt) / max(amp * 0.5, 0.001);
  mat2 blendRot = rot(radians(uBlendAngle));
  float bx = (p * blendRot).x;
  float s = max(uBlendSoftness, 0.0);
  float edge0 = -0.3 - uColorBalance - s;
  float edge1 = 0.2 - uColorBalance + s;
  vec3 layer1 = mix(uColor3, uColor2, smoothstep(edge0, edge1, bx));
  vec3 layer2 = mix(uColor2, uColor1, smoothstep(edge0, edge1, bx));
  vec3 col = mix(layer1, layer2, smoothstep(0.5 - uColorBalance + s, -0.3 - uColorBalance - s, p.y));
  vec2 grainUv = uv * max(uGrainScale, 0.001);
  if (uGrainAnimated > 0.5) grainUv += vec2(iTime * 0.05);
  float grain = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * uGrainAmount;
  col = (col - 0.5) * uContrast + 0.5;
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSaturation);
  col = pow(max(col, 0.0), vec3(1.0 / max(uGamma, 0.001)));
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const contexts = new WeakMap();

const Grainient = ({
  timeSpeed = 0.25,
  colorBalance = 0,
  warpStrength = 1,
  warpFrequency = 5,
  warpSpeed = 2,
  warpAmplitude = 50,
  blendAngle = 0,
  blendSoftness = 0.05,
  rotationAmount = 500,
  noiseScale = 2,
  grainAmount = 0.1,
  grainScale = 2,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1,
  saturation = 1,
  centerX = 0,
  centerY = 0,
  zoom = 0.9,
  color1 = '#FF9FFC',
  color2 = '#5227FF',
  color3 = '#B497CF',
  className = ''
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return undefined;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let renderer;
    let canvas;
    let raf = 0;
    let io;
    let ro;
    let pageVisible = !document.hidden;
    let inView = true;

    try {
      renderer = new Renderer({ webgl: 2, alpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 2) });
      const gl = renderer.gl;
      canvas = gl.canvas;
      canvas.className = 'grainient-canvas';
      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          iTime: { value: 0 }, iResolution: { value: new Float32Array([1, 1]) },
          uTimeSpeed: { value: timeSpeed }, uColorBalance: { value: colorBalance }, uWarpStrength: { value: warpStrength },
          uWarpFrequency: { value: warpFrequency }, uWarpSpeed: { value: warpSpeed }, uWarpAmplitude: { value: warpAmplitude },
          uBlendAngle: { value: blendAngle }, uBlendSoftness: { value: blendSoftness }, uRotationAmount: { value: rotationAmount },
          uNoiseScale: { value: noiseScale }, uGrainAmount: { value: grainAmount }, uGrainScale: { value: grainScale },
          uGrainAnimated: { value: grainAnimated ? 1 : 0 }, uContrast: { value: contrast }, uGamma: { value: gamma },
          uSaturation: { value: saturation }, uCenterOffset: { value: new Float32Array([centerX, centerY]) }, uZoom: { value: zoom },
          uColor1: { value: new Float32Array(hexToRgb(color1)) }, uColor2: { value: new Float32Array(hexToRgb(color2)) }, uColor3: { value: new Float32Array(hexToRgb(color3)) }
        }
      });
      const mesh = new Mesh(gl, { geometry, program });
      contexts.set(container, { renderer, program });
      container.appendChild(canvas);

      const setSize = () => {
        const rect = container.getBoundingClientRect();
        renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
        const res = program.uniforms.iResolution.value;
        res[0] = gl.drawingBufferWidth; res[1] = gl.drawingBufferHeight;
        renderer.render({ scene: mesh });
      };
      ro = new ResizeObserver(setSize); ro.observe(container); setSize();
      const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
      const start = () => {
        if (reduceMotion || !inView || !pageVisible || raf) return;
        const startTime = performance.now() - program.uniforms.iTime.value * 1000;
        const loop = (now) => { program.uniforms.iTime.value = (now - startTime) * 0.001; renderer.render({ scene: mesh }); raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
      };
      io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; inView ? start() : stop(); }) : null;
      io?.observe(container);
      const onVisibility = () => { pageVisible = !document.hidden; pageVisible ? start() : stop(); };
      document.addEventListener('visibilitychange', onVisibility);
      start();
      return () => { stop(); ro?.disconnect(); io?.disconnect(); document.removeEventListener('visibilitychange', onVisibility); contexts.delete(container); canvas?.remove(); };
    } catch (error) {
      container.dataset.fallback = 'true';
      if (import.meta.env?.DEV) console.warn('Grainient WebGL fallback:', error);
      return () => { contexts.delete(container); canvas?.remove(); };
    }
  }, []);

  useEffect(() => {
    const ctx = contexts.get(containerRef.current);
    if (!ctx) return;
    const u = ctx.program.uniforms;
    u.uTimeSpeed.value = timeSpeed; u.uColorBalance.value = colorBalance; u.uWarpStrength.value = warpStrength; u.uWarpFrequency.value = warpFrequency;
    u.uWarpSpeed.value = warpSpeed; u.uWarpAmplitude.value = warpAmplitude; u.uBlendAngle.value = blendAngle; u.uBlendSoftness.value = blendSoftness;
    u.uRotationAmount.value = rotationAmount; u.uNoiseScale.value = noiseScale; u.uGrainAmount.value = grainAmount; u.uGrainScale.value = grainScale;
    u.uGrainAnimated.value = grainAnimated ? 1 : 0; u.uContrast.value = contrast; u.uGamma.value = gamma; u.uSaturation.value = saturation;
    u.uCenterOffset.value = new Float32Array([centerX, centerY]); u.uZoom.value = zoom; u.uColor1.value = new Float32Array(hexToRgb(color1));
    u.uColor2.value = new Float32Array(hexToRgb(color2)); u.uColor3.value = new Float32Array(hexToRgb(color3));
  }, [timeSpeed, colorBalance, warpStrength, warpFrequency, warpSpeed, warpAmplitude, blendAngle, blendSoftness, rotationAmount, noiseScale, grainAmount, grainScale, grainAnimated, contrast, gamma, saturation, centerX, centerY, zoom, color1, color2, color3]);

  return <div ref={containerRef} className={`grainient-container ${className}`.trim()} aria-hidden="true" />;
};

export default Grainient;
