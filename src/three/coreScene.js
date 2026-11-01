import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/**
 * Persistent scroll-driven core.
 *
 * Scroll progress drives the whole life cycle:
 *  0.00 → 0.22  modular core assembles
 *  0.22 → 0.38  blocks separate (problems)
 *  0.38 → 0.55  blocks re-connect into a lattice
 *  0.55 → 0.72  vortex, then morph into the CORVEXA wordmark
 *  0.72 → 1.00  wordmark holds for the closing sections
 *
 * Rendered with an opaque dark clear + CSS `mix-blend-mode: screen`, so the
 * bloom pass composites cleanly and the canvas melts into the page.
 */

const N = 512
// five states → the last segment is the wordmark hold, so it settles early
const BOUNDS = [0, 0.22, 0.38, 0.55, 0.72, 1]
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/* ---------------------------------------------------------- wordmark sample */
function sampleWordmark(text) {
  try {
    const W = 1200
    const H = 300
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 176px "Sora Variable", "Sora", system-ui, sans-serif'
    if ('letterSpacing' in ctx) ctx.letterSpacing = '10px'
    ctx.fillText(text, W / 2, H / 2 + 6)

    const { data } = ctx.getImageData(0, 0, W, H)
    const raw = []
    const step = 2
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4 + 3] > 120) raw.push([x, y])
      }
    }
    if (raw.length < N) return null

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const [x, y] of raw) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    const w = maxX - minX
    const h = maxY - minY
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2

    // deterministic shuffle so the wordmark is stable between renders
    let s = 1337
    const rnd = () => {
      s = (s * 1664525 + 1013904223) % 4294967296
      return s / 4294967296
    }
    const shuffled = raw.slice()
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1))
      const tmp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = tmp
    }

    const pts = new Float32Array(N * 2)
    for (let i = 0; i < N; i += 1) {
      const [x, y] = shuffled[i % shuffled.length]
      pts[i * 2] = (x - cx) / w
      pts[i * 2 + 1] = -(y - cy) / w
    }
    return { pts, aspect: h / w }
  } catch {
    return null
  }
}

function fibonacciSphere(i, total, radius) {
  const y = 1 - (i / (total - 1)) * 2
  const r = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = i * 2.399963229728653
  return [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]
}

export function createCoreScene(canvas, { reduced = false, getProgress = null } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
  renderer.setClearColor(0x03050c, 1)
  renderer.toneMapping = THREE.NoToneMapping

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, 16)

  const group = new THREE.Group()
  scene.add(group)

  /* ------------------------------------------------------------- geometry */
  const rand = new Float32Array(N)
  const seeds = new Float32Array(N)
  const spin = new Float32Array(N)
  const quats = []
  const quat = new THREE.Quaternion()
  const euler = new THREE.Euler()

  for (let i = 0; i < N; i += 1) {
    seeds[i] = Math.random()
    rand[i] = Math.random()
    spin[i] = (Math.random() - 0.5) * 0.9
    euler.set(rand[i] * Math.PI, seeds[i] * Math.PI * 2, spin[i] * Math.PI)
    quats.push(new THREE.Quaternion().setFromEuler(euler))
  }

  const norm = sampleWordmark('CORVEXA')
  const textAspect = norm ? norm.aspect : 0.26

  const geometry = new THREE.BoxGeometry(0.12, 0.12, 0.12)
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#2f6bff') },
      uColorB: { value: new THREE.Color('#3ee8ff') },
      uGlow: { value: 0.5 },
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      varying float vFres;
      varying float vUp;
      varying float vSeed;
      varying float vDepth;

      void main() {
        vSeed = aSeed;
        vec3 p = position;
        p.z += sin(uTime * 0.55 + aSeed * 6.2831) * 0.02;
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
        vec3 n = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        vFres = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 2.0);
        vUp = n.y * 0.5 + 0.5;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uGlow;
      uniform float uOpacity;
      varying float vFres;
      varying float vUp;
      varying float vSeed;
      varying float vDepth;

      void main() {
        vec3 col = mix(uColorA, uColorB, clamp(vFres * 0.8 + vSeed * 0.1, 0.0, 1.0));
        col *= 0.42 + vUp * 0.46 + uGlow * 0.18;
        col += uColorB * vFres * 0.12;
        // depth falloff keeps the cloud from reading as a flat wall of cubes
        float fade = 0.44 + 0.56 * smoothstep(24.0, 12.0, vDepth);
        gl_FragColor = vec4(col * fade, uOpacity * 0.94);
      }
    `,
  })

  const blocks = new THREE.InstancedMesh(geometry, material, N)
  blocks.frustumCulled = false
  group.add(blocks)

  /* --------------------------------------------------------------- states */
  function stateCore() {
    const arr = new Float32Array(N * 3)
    for (let i = 0; i < N; i += 1) {
      if (i < 72) {
        // dense inner nucleus
        const [x, y, z] = fibonacciSphere(i, 72, 0.5)
        arr[i * 3] = x
        arr[i * 3 + 1] = y
        arr[i * 3 + 2] = z
      } else {
        const [x, y, z] = fibonacciSphere(i - 72, N - 72, 1.55)
        arr[i * 3] = x
        arr[i * 3 + 1] = y
        arr[i * 3 + 2] = z
      }
    }
    return arr
  }

  function stateExplode() {
    const arr = new Float32Array(N * 3)
    for (let i = 0; i < N; i += 1) {
      const [x, y, z] = fibonacciSphere(i, N, 1)
      const r = 1.15 + rand[i] * 1.5
      arr[i * 3] = x * r + (seeds[i] - 0.5) * 0.4
      arr[i * 3 + 1] = y * r * 0.9 + (rand[i] - 0.5) * 0.4
      arr[i * 3 + 2] = z * r * 0.8
    }
    return arr
  }

  function stateLattice() {
    const arr = new Float32Array(N * 3)
    // 8 × 8 × 8 grid — a compact, legible lattice
    const spacing = 0.4
    for (let i = 0; i < N; i += 1) {
      const gx = (i % 8) - 3.5
      const gy = (Math.floor(i / 8) % 8) - 3.5
      const gz = Math.floor(i / 64) - 3.5
      arr[i * 3] = gx * spacing
      arr[i * 3 + 1] = gy * spacing
      arr[i * 3 + 2] = gz * spacing
    }
    return arr
  }

  function stateVortex() {
    const arr = new Float32Array(N * 3)
    for (let i = 0; i < N; i += 1) {
      const k = i / (N - 1)
      const angle = k * Math.PI * 2 * 4.4 + (i % 3) * 0.6
      const radius = 0.85 + (i % 6) * 0.16
      const y = (k - 0.5) * 3.6
      arr[i * 3] = Math.cos(angle + y * 0.55) * radius
      arr[i * 3 + 1] = y + Math.sin(angle * 1.5) * 0.14
      arr[i * 3 + 2] = Math.sin(angle + y * 0.55) * radius
    }
    return arr
  }

  function stateWordmark(textScale) {
    const arr = new Float32Array(N * 3)
    if (!norm) return stateCore()
    for (let i = 0; i < N; i += 1) {
      arr[i * 3] = norm.pts[i * 2] * textScale
      arr[i * 3 + 1] = norm.pts[i * 2 + 1] * textScale
      arr[i * 3 + 2] = (seeds[i] - 0.5) * 0.1
    }
    return arr
  }

  /* ------------------------------------------------------------- connectors */
  const lattice = stateLattice()
  const pairs = []
  for (let i = 0; i < N; i += 1) {
    const gx = i % 8
    const row = Math.floor(i / 8)
    if (gx < 7 && i + 1 < N) pairs.push([i, i + 1])
    if (row < 56 && i + 8 < N) pairs.push([i, i + 8])
  }
  const linePositions = new Float32Array(pairs.length * 6)
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
  const lineMat = new THREE.LineBasicMaterial({
    color: '#48d7ff',
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const lines = new THREE.LineSegments(lineGeo, lineMat)
  lines.frustumCulled = false
  group.add(lines)

  /* --------------------------------------------------------------- resize */
  let textScale = 4
  let states = [stateCore(), stateExplode(), stateLattice(), stateVortex(), stateWordmark(textScale)]

  function rebuildText() {
    states[4] = stateWordmark(textScale)
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    composer.setSize(w, h)

    const worldH = 2 * Math.tan(((camera.fov * Math.PI) / 180) / 2) * camera.position.z
    const worldW = worldH * camera.aspect
    textScale = Math.min(worldW * 0.7, (worldH * 0.3) / Math.max(0.08, textAspect))
    rebuildText()
  }

  /* ------------------------------------------------------------- composer */
  const composer = new EffectComposer(renderer)
  composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.18, 0.4, 0.55)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  // re-sample the wordmark once the display font has actually loaded
  if (document.fonts?.ready) {
    document.fonts.ready
      .then(() => {
        resize()
        if (reduced) renderAt(progress)
      })
      .catch(() => {})
  }

  /* -------------------------------------------------------------- pointer */
  const pointer = new THREE.Vector2(0, 0)
  const pointerTarget = new THREE.Vector2(0, 0)
  const onPointer = (e) => {
    pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1
    pointerTarget.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }
  if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true })

  /* -------------------------------------------------------------- controls */
  const dummy = new THREE.Object3D()
  const cur = new Float32Array(N * 3)
  let targetProgress = 0
  let progress = 0
  let elapsed = 0

  const colA = new THREE.Color()
  const colB = new THREE.Color()
  const cA0 = new THREE.Color('#1f4fff')
  const cA1 = new THREE.Color('#9a5cff')
  const cB0 = new THREE.Color('#3ee8ff')
  const cB1 = new THREE.Color('#c4a8ff')

  function update(p, t) {
    // eased segment lookup
    let seg = 4
    for (let s = 0; s < 5; s += 1) {
      if (p >= BOUNDS[s] && p < BOUNDS[s + 1]) {
        seg = s
        break
      }
    }
    const span = BOUNDS[seg + 1] - BOUNDS[seg]
    const local = span > 0 ? clamp01((p - BOUNDS[seg]) / span) : 1
    const from = states[seg]
    const to = states[Math.min(seg + 1, 4)]

    const logoW = smoothstep(0.6, 0.74, p)
    const blockScale = 1 - 0.32 * logoW

    // scroll-driven rotation (settles to a flat logo at the end)
    const rxF = (1 - logoW) * (1 + pointer.y * 0.22)
    const ryF = (1 - logoW) * (1 + pointer.x * 0.3)
    group.rotation.x = (Math.sin(p * Math.PI * 2) * 0.55 + p * Math.PI * 1.5 + t * 0.05) * rxF
    group.rotation.y = (p * Math.PI * 2.7 + t * 0.07) * ryF
    group.rotation.z = Math.sin(p * Math.PI * 3) * 0.3 * (1 - logoW)

    const breathe = 1 + Math.sin(p * Math.PI) * 0.16
    group.scale.setScalar(breathe)

    for (let i = 0; i < N; i += 1) {
      const delay = rand[i] * 0.28
      const lt = clamp01((local - delay) / (1 - delay))
      const e = easeInOut(lt)
      const arc = Math.sin(Math.PI * lt) * 0.22

      const ix = i * 3
      const dirX = from[ix]
      const dirY = from[ix + 1]
      const dirZ = from[ix + 2]

      const x = dirX + (to[ix] - dirX) * e
      const y = dirY + (to[ix + 1] - dirY) * e
      const z = dirZ + (to[ix + 2] - dirZ) * e

      cur[ix] = x + dirX * arc
      cur[ix + 1] = y + dirY * arc
      cur[ix + 2] = z + dirZ * arc

      dummy.position.set(cur[ix], cur[ix + 1], cur[ix + 2])
      dummy.quaternion.copy(quats[i])
      dummy.scale.setScalar((0.62 + seeds[i] * 0.5) * blockScale)
      dummy.updateMatrix()
      blocks.setMatrixAt(i, dummy.matrix)
    }
    blocks.instanceMatrix.needsUpdate = true

    // connector web
    const lineOpacity = smoothstep(0.3, 0.42, p) * (1 - smoothstep(0.54, 0.62, p))
    lineMat.opacity = lineOpacity * 0.5
    if (lineOpacity > 0.001) {
      for (let k = 0; k < pairs.length; k += 1) {
        const [a, b] = pairs[k]
        const o = k * 6
        linePositions[o] = cur[a * 3]
        linePositions[o + 1] = cur[a * 3 + 1]
        linePositions[o + 2] = cur[a * 3 + 2]
        linePositions[o + 3] = cur[b * 3]
        linePositions[o + 4] = cur[b * 3 + 1]
        linePositions[o + 5] = cur[b * 3 + 2]
      }
      lineGeo.attributes.position.needsUpdate = true
    }

    // palette + glow
    colA.copy(cA0).lerp(cA1, p)
    colB.copy(cB0).lerp(cB1, p)
    material.uniforms.uColorA.value.copy(colA)
    material.uniforms.uColorB.value.copy(colB)
    material.uniforms.uTime.value = t
    material.uniforms.uGlow.value = 0.35 + Math.sin(p * Math.PI * 2) * 0.25
    bloom.strength = 0.1 + Math.sin(p * Math.PI) * 0.06
  }

  /* ----------------------------------------------------------------- loop */
  let frameId = 0
  let running = false
  let disposed = false

  function frame() {
    if (!running) return
    elapsed += 1 / 60
    if (getProgress) targetProgress = clamp01(getProgress())
    const p = progress + (targetProgress - progress) * 0.12
    progress = Math.abs(targetProgress - p) < 0.0002 ? targetProgress : p
    pointer.lerp(pointerTarget, 0.05)
    update(progress, elapsed)
    composer.render()
    frameId = requestAnimationFrame(frame)
  }

  function start() {
    if (running || disposed || reduced) return
    running = true
    frame()
  }

  function stop() {
    running = false
    cancelAnimationFrame(frameId)
  }

  function renderAt(p) {
    update(clamp01(p), 0.6)
    composer.render()
  }

  function dispose() {
    disposed = true
    stop()
    window.removeEventListener('pointermove', onPointer)
    ro.disconnect()
    geometry.dispose()
    material.dispose()
    lineGeo.dispose()
    lineMat.dispose()
    composer.dispose()
    renderer.dispose()
  }

  return {
    start,
    stop,
    dispose,
    resize,
    renderAt,
    setProgress(value) {
      targetProgress = clamp01(value)
      if (reduced) {
        progress = targetProgress
        renderAt(targetProgress)
      }
    },
  }
}
