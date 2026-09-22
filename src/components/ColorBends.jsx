import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './ColorBends.css'

const MAX_COLORS = 8

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  #define MAX_COLORS 8
  uniform vec2 uCanvas;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec2 uRot;
  uniform int uColorCount;
  uniform vec3 uColors[MAX_COLORS];
  uniform int uTransparent;
  uniform float uScale;
  uniform float uFrequency;
  uniform float uWarpStrength;
  uniform vec2 uPointer;
  uniform float uMouseInfluence;
  uniform float uParallax;
  uniform float uNoise;
  uniform int uIterations;
  uniform float uIntensity;
  uniform float uBandWidth;
  varying vec2 vUv;

  void main() {
    float t = uTime * uSpeed;
    vec2 p = vUv * 2.0 - 1.0;
    p += uPointer * uParallax * 0.1;
    vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
    vec2 q = vec2(rp.x * (uCanvas.x / max(uCanvas.y, 1.0)), rp.y);
    q /= max(uScale, 0.0001);
    q /= 0.5 + 0.2 * dot(q, q);
    q += 0.2 * cos(t) - 7.56;
    q += (uPointer - rp) * uMouseInfluence * 0.2;

    for (int j = 0; j < 5; j++) {
      if (j >= uIterations - 1) break;
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
      q += (rr - q) * 0.15;
    }

    vec3 col = vec3(0.0);
    float alpha = 1.0;
    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
        if (i >= uColorCount) break;
        s -= 0.01;
        vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
        float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
        float kBelow = clamp(uWarpStrength, 0.0, 1.0);
        float kMix = pow(kBelow, 0.3);
        float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
        vec2 warped = s + (r - s) * kBelow * gain;
        float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
        float m = mix(m0, m1, kMix);
        float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
        sumCol += uColors[i] * w;
        cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      alpha = uTransparent > 0 ? cover : 1.0;
    } else {
      vec2 s = q;
      for (int k = 0; k < 3; ++k) {
        s -= 0.01;
        vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
        float m = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
        col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      }
      alpha = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    col *= uIntensity;
    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col = clamp(col + (n - 0.5) * uNoise, 0.0, 1.0);
    }
    vec3 rgb = uTransparent > 0 ? col * alpha : col;
    gl_FragColor = vec4(rgb, alpha);
  }
`

const hexToRgb = (hex) => {
  const clean = String(hex || '').replace('#', '').trim()
  const value = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean
  if (!/^[0-9a-f]{6}$/i.test(value)) return new THREE.Vector3()
  return new THREE.Vector3(
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  )
}

const ColorBends = ({
  className = '',
  style,
  rotation = 90,
  speed = 0.2,
  colors = [],
  transparent = true,
  autoRotate = 0,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  parallax = 0.5,
  noise = 0.15,
  iterations = 1,
  intensity = 1.5,
  bandWidth = 6,
}) => {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const materialRef = useRef(null)
  const frameRef = useRef(0)
  const pointerTargetRef = useRef(new THREE.Vector2())
  const pointerCurrentRef = useRef(new THREE.Vector2())
  const rotationRef = useRef(rotation)
  const autoRotateRef = useRef(autoRotate)

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof window === 'undefined') return undefined

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let renderer
    let scene
    let camera
    let geometry
    let material
    let mesh
    let resizeObserver
    let intersectionObserver
    let pageVisible = !document.hidden
    let inView = true

    try {
      scene = new THREE.Scene()
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
      geometry = new THREE.PlaneGeometry(2, 2)
      const colorUniforms = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3())
      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uCanvas: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uSpeed: { value: speed },
          uRot: { value: new THREE.Vector2(1, 0) },
          uColorCount: { value: 0 },
          uColors: { value: colorUniforms },
          uTransparent: { value: transparent ? 1 : 0 },
          uScale: { value: scale },
          uFrequency: { value: frequency },
          uWarpStrength: { value: warpStrength },
          uPointer: { value: new THREE.Vector2() },
          uMouseInfluence: { value: mouseInfluence },
          uParallax: { value: parallax },
          uNoise: { value: noise },
          uIterations: { value: iterations },
          uIntensity: { value: intensity },
          uBandWidth: { value: bandWidth },
        },
        transparent: true,
        premultipliedAlpha: true,
      })
      materialRef.current = material
      mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setClearColor(0x000000, transparent ? 0 : 1)
      renderer.domElement.className = 'color-bends-canvas'
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      const resize = () => {
        const width = Math.max(container.clientWidth, 1)
        const height = Math.max(container.clientHeight, 1)
        renderer.setSize(width, height, false)
        material.uniforms.uCanvas.value.set(width, height)
      }
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)
      resize()

      const stop = () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
      }
      const start = () => {
        if (reducedMotion || !inView || !pageVisible || frameRef.current) return
        const animate = (time) => {
          material.uniforms.uTime.value = time * 0.001
          const current = pointerCurrentRef.current
          const target = pointerTargetRef.current
          current.lerp(target, 0.08)
          material.uniforms.uPointer.value.copy(current)
          const degrees = rotationRef.current + autoRotateRef.current * time * 0.001
          const radians = degrees * Math.PI / 180
          material.uniforms.uRot.value.set(Math.cos(radians), Math.sin(radians))
          renderer.render(scene, camera)
          frameRef.current = requestAnimationFrame(animate)
        }
        frameRef.current = requestAnimationFrame(animate)
      }

      intersectionObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting
        inView ? start() : stop()
      })
      intersectionObserver.observe(container)
      const onVisibility = () => {
        pageVisible = !document.hidden
        pageVisible ? start() : stop()
      }
      document.addEventListener('visibilitychange', onVisibility)
      start()

      const onPointerMove = (event) => {
        const rect = container.getBoundingClientRect()
        pointerTargetRef.current.set(
          ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
          -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1),
        )
      }
      container.addEventListener('pointermove', onPointerMove)

      return () => {
        stop()
        document.removeEventListener('visibilitychange', onVisibility)
        container.removeEventListener('pointermove', onPointerMove)
        resizeObserver?.disconnect()
        intersectionObserver?.disconnect()
        geometry?.dispose()
        material?.dispose()
        renderer?.dispose()
        renderer?.forceContextLoss?.()
        renderer?.domElement?.remove()
        rendererRef.current = null
        materialRef.current = null
      }
    } catch (error) {
      container.dataset.fallback = 'true'
      if (import.meta.env?.DEV) console.warn('ColorBends WebGL fallback:', error)
      return () => renderer?.domElement?.remove()
    }
  }, [])

  useEffect(() => {
    const material = materialRef.current
    if (!material) return
    rotationRef.current = rotation
    autoRotateRef.current = autoRotate
    const uniforms = material.uniforms
    uniforms.uSpeed.value = speed
    uniforms.uTransparent.value = transparent ? 1 : 0
    uniforms.uScale.value = scale
    uniforms.uFrequency.value = frequency
    uniforms.uWarpStrength.value = warpStrength
    uniforms.uMouseInfluence.value = mouseInfluence
    uniforms.uParallax.value = parallax
    uniforms.uNoise.value = noise
    uniforms.uIterations.value = iterations
    uniforms.uIntensity.value = intensity
    uniforms.uBandWidth.value = bandWidth
    const parsedColors = colors.filter(Boolean).slice(0, MAX_COLORS).map(hexToRgb)
    for (let index = 0; index < MAX_COLORS; index += 1) {
      uniforms.uColors.value[index].copy(parsedColors[index] || new THREE.Vector3())
    }
    uniforms.uColorCount.value = parsedColors.length
    rendererRef.current?.setClearColor(0x000000, transparent ? 0 : 1)
  }, [autoRotate, bandWidth, colors, frequency, intensity, iterations, mouseInfluence, noise, parallax, rotation, scale, speed, transparent, warpStrength])

  return <div ref={containerRef} className={`color-bends-container ${className}`.trim()} style={style} aria-hidden="true" />
}

export default ColorBends
