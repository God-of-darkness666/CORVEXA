import * as THREE from 'three'

/**
 * Hero: the CORVEXA wordmark built from ~640 glowing modular cubes.
 *
 * The DOM <h1> stays in the layout for accessibility and SEO, and is hidden
 * once the 3D wordmark has painted. Cubes ignite around the cursor, and every
 * cube carries its letter index so hovering a letter lights the whole letter.
 *
 * Background is intentionally cube-free: drifting particles, two orbital
 * rings and a distant wireframe core.
 */

const BLOCKS = 1400
const WORD = 'CORVEXA'

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

function sampleWordmark(text, count) {
  const W = 1400
  const H = 380
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const chars = [...text]
  const fontSize = 210
  ctx.font = `700 ${fontSize}px "Sora Variable", Sora, system-ui, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'

  const advances = chars.map((char) => ctx.measureText(char).width)
  const tracking = 0
  const total = advances.reduce((sum, advance) => sum + advance, 0) + tracking * (chars.length - 1)
  let cursor = (W - total) / 2
  const baseline = H / 2

  const ranges = []
  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, baseline)
    ranges.push([cursor, cursor + advances[index]])
    cursor += advances[index] + tracking
  })

  const { data } = ctx.getImageData(0, 0, W, H)
  const raw = []
  const step = 3
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 120) {
        let letter = 0
        for (let l = 0; l < ranges.length; l += 1) {
          if (x >= ranges[l][0] && x <= ranges[l][1]) {
            letter = l
            break
          }
        }
        raw.push([x, y, letter])
      }
    }
  }
  if (raw.length < count) return null

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
  const width = maxX - minX
  const height = maxY - minY
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  // deterministic shuffle → stable wordmark between reloads
  let seed = 20260501
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  for (let i = raw.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1))
    const tmp = raw[i]
    raw[i] = raw[j]
    raw[j] = tmp
  }

  const positions = new Float32Array(count * 3)
  const letters = new Float32Array(count)
  for (let i = 0; i < count; i += 1) {
    const [x, y, letter] = raw[i % raw.length]
    positions[i * 3] = (x - cx) / width
    positions[i * 3 + 1] = -(y - cy) / width
    positions[i * 3 + 2] = (rnd() - 0.5) * 0.012
    letters[i] = letter
  }

  // vertical position inside the wordmark, for the brand gradient
  const halfHeight = height / width / 2
  const grad = new Float32Array(count)
  for (let i = 0; i < count; i += 1) {
    grad[i] = clamp01((positions[i * 3 + 1] + halfHeight) / Math.max(0.0001, halfHeight * 2))
  }

  // normalised horizontal bands per letter, for hover illumination
  const bands = ranges.map(([a, b]) => [(a - cx) / width, (b - cx) / width])

  return { positions, letters, grad, aspect: height / width, bands }
}

export function createHeroScene(canvas, { reduced = false, onReady = null } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearAlpha(0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 160)
  camera.position.set(0, 0, 14)

  const clock = new THREE.Clock()
  const wordmark = sampleWordmark(WORD, BLOCKS)
  const hasWordmark = Boolean(wordmark)

  /* ------------------------------------------------------------ word blocks */
  const positions = wordmark ? wordmark.positions : new Float32Array(BLOCKS * 3)
  const seedArray = new Float32Array(BLOCKS)
  const heatArray = new Float32Array(BLOCKS)
  const letterArray = wordmark ? wordmark.letters : new Float32Array(BLOCKS)
  const gradArray = wordmark ? wordmark.grad : new Float32Array(BLOCKS)
  const scatter = new Float32Array(BLOCKS * 3)

  for (let i = 0; i < BLOCKS; i += 1) {
    seedArray[i] = Math.random()
    // where each cube waits before the wordmark assembles
    const angle = seedArray[i] * Math.PI * 2
    const radius = 0.55 + seedArray[i] * 0.85
    scatter[i * 3] = Math.cos(angle) * radius
    scatter[i * 3 + 1] = Math.sin(angle) * radius * 0.72
    scatter[i * 3 + 2] = (seedArray[i] - 0.5) * 0.7
  }

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  geometry.setAttribute('heat', new THREE.InstancedBufferAttribute(heatArray, 1))
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seedArray, 1))
  geometry.setAttribute('aLetter', new THREE.InstancedBufferAttribute(letterArray, 1))
  geometry.setAttribute('aGrad', new THREE.InstancedBufferAttribute(gradArray, 1))

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#2a55ff') },
      uColorB: { value: new THREE.Color('#7ff2ff') },
      uLitLetter: { value: -1 },
      uLit: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float heat;
      attribute float aSeed;
      attribute float aLetter;
      attribute float aGrad;
      uniform float uTime;
      uniform float uLitLetter;
      uniform float uLit;
      varying float vHeat;
      varying float vLetterLit;
      varying float vFres;
      varying float vUp;
      varying float vSeed;
      varying float vGrad;

      void main() {
        vHeat = heat;
        vSeed = aSeed;
        vGrad = aGrad;
        vLetterLit = (uLitLetter >= 0.0 && abs(aLetter - uLitLetter) < 0.5) ? uLit : 0.0;

        vec3 p = position;
        p *= 1.0 + heat * 0.45 + vLetterLit * 0.08;
        p.z += heat * 0.55;

        vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
        vec3 n = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        vFres = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 2.5);
        vUp = n.y * 0.5 + 0.5;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uTime;
      varying float vHeat;
      varying float vLetterLit;
      varying float vFres;
      varying float vUp;
      varying float vSeed;
      varying float vGrad;

      void main() {
        float lit = clamp(vHeat * 1.1 + vLetterLit * 0.55, 0.0, 1.0);
        // vertical brand gradient: deep electric blue below → cyan above
        vec3 base = mix(uColorA, uColorB, 0.04 + vGrad * 0.5);
        vec3 col = mix(base, uColorB, clamp(vFres * 0.6 + lit, 0.0, 1.0));
        float shimmer = 0.9 + 0.1 * sin(uTime * 0.8 + vSeed * 38.0);
        col *= (0.46 + vUp * 0.72 + vGrad * 0.2) * shimmer;
        col += uColorB * lit * 0.2;
        col += vec3(0.04, 0.13, 0.36) * vSeed * 0.16;
        gl_FragColor = vec4(col, 0.94);
      }
    `,
  })

  const blocks = new THREE.InstancedMesh(geometry, material, BLOCKS)
  blocks.frustumCulled = false
  scene.add(blocks)

  /* ---------------------------------------------------------- distant layer */
  const backdrop = new THREE.Group()
  backdrop.position.z = -9
  scene.add(backdrop)

  const ghost = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(7.5, 1)),
    new THREE.LineBasicMaterial({
      color: '#3f8cff',
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
    }),
  )
  backdrop.add(ghost)

  const halo = new THREE.Group()
  backdrop.add(halo)
  for (let r = 0; r < 2; r += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(8.4 + r * 1.4, 0.008, 6, 200),
      new THREE.MeshBasicMaterial({
        color: r === 0 ? '#3ee8ff' : '#9a5cff',
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
      }),
    )
    ring.rotation.x = Math.PI / 2 + r * 0.42
    ring.rotation.y = r * 0.7
    halo.add(ring)
  }

  /* ------------------------------------------------------------- particles */
  const P_COUNT = 900
  const pGeo = new THREE.BufferGeometry()
  const pPos = new Float32Array(P_COUNT * 3)
  const pSeed = new Float32Array(P_COUNT)
  for (let p = 0; p < P_COUNT; p += 1) {
    const radius = 4 + Math.random() * 13
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    pPos[p * 3] = Math.sin(phi) * Math.cos(theta) * radius
    pPos[p * 3 + 1] = Math.cos(phi) * radius * 0.6
    pPos[p * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius - 5
    pSeed[p] = Math.random()
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 1))

  const pMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vSeed;
      varying float vAlpha;

      void main() {
        vSeed = aSeed;
        vec3 p = position;
        p.y += sin(uTime * 0.18 + aSeed * 12.0) * 1.1;
        p.x += cos(uTime * 0.14 + aSeed * 9.0) * 0.9;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.0 + aSeed * 2.2) * uPixelRatio * (34.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vAlpha = 0.18 + aSeed * 0.6;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vSeed;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float falloff = smoothstep(0.5, 0.0, d);
        vec3 col = mix(vec3(0.24, 0.5, 1.0), vec3(0.4, 0.95, 1.0), vSeed);
        gl_FragColor = vec4(col, falloff * falloff * vAlpha * 0.55);
      }
    `,
  })
  const particles = new THREE.Points(pGeo, pMat)
  particles.frustumCulled = false
  scene.add(particles)

  /* ------------------------------------------------------ placement & frame */
  let frame = { x: 0, y: 0, w: 0, h: 0 }
  let scale = 1
  let offset = new THREE.Vector2(0, 0)

  function applyFrame() {
    if (!frame.w || !frame.h) return
    const worldHeight = 2 * Math.tan(((camera.fov * Math.PI) / 180) / 2) * camera.position.z
    const pxToWorld = worldHeight / canvas.clientHeight
    const wordWidth = frame.w * pxToWorld
    const maxHeight = frame.h * pxToWorld
    const aspect = wordmark ? wordmark.aspect : 0.16
    scale = Math.min(wordWidth, maxHeight / Math.max(0.05, aspect))
    offset.set(
      (frame.x + frame.w / 2 - canvas.clientWidth / 2) * pxToWorld,
      -((frame.y + frame.h / 2) - canvas.clientHeight / 2) * pxToWorld,
    )
    blocks.scale.setScalar(scale)
    blocks.position.set(offset.x, offset.y, 0)
  }

  function setFrame(next) {
    frame = next
    applyFrame()
  }

  /* --------------------------------------------------------------- pointer */
  const pointer = new THREE.Vector2(0, 0)
  const pointerTarget = new THREE.Vector2(0, 0)
  const cursorWorld = new THREE.Vector3(0, 0, 0)
  const raycaster = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  let litTarget = -1
  let litValue = 0
  let pointerSeen = false

  function handlePointer(event) {
    pointerSeen = true
    pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1
    pointerTarget.y = -((event.clientY / window.innerHeight) * 2 - 1)
  }
  window.addEventListener('pointermove', handlePointer, { passive: true })

  /* ---------------------------------------------------------------- resize */
  function resize() {
    const parent = canvas.parentElement
    const w = parent ? parent.clientWidth : window.innerWidth
    const h = parent ? parent.clientHeight : window.innerHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    pMat.uniforms.uPixelRatio.value = renderer.getPixelRatio()
    applyFrame()
  }

  const ro = new ResizeObserver(resize)
  if (canvas.parentElement) ro.observe(canvas.parentElement)
  resize()

  /* ------------------------------------------------------------------ loop */
  const dummy = new THREE.Object3D()
  const cameraHome = new THREE.Vector3(0, 0, 14)
  let frameId = 0
  let running = false
  let disposed = false
  let ready = false
  let form = 0
  let lastT = 0

  function markReady() {
    if (ready) return
    ready = true
    if (onReady) onReady()
  }

  function update(t) {
    const dt = lastT > 0 ? Math.min(0.05, t - lastT) : 1 / 60
    lastT = t
    if (form < 1) form = Math.min(1, form + dt / 1.7)
    const grow = Math.min(1, form * 1.35)

    pointer.lerp(pointerTarget, 0.07)
    raycaster.setFromCamera(pointer, camera)
    raycaster.ray.intersectPlane(plane, cursorWorld)

    // cursor in wordmark-local space
    const localX = (cursorWorld.x - blocks.position.x) / Math.max(0.0001, scale)
    const localY = (cursorWorld.y - blocks.position.y) / Math.max(0.0001, scale)

    let hoveredLetter = -1
    if (pointerSeen && wordmark && form > 0.92) {
      for (let l = 0; l < wordmark.bands.length; l += 1) {
        const [a, b] = wordmark.bands[l]
        if (localX >= a - 0.012 && localX <= b + 0.012 && Math.abs(localY) < 0.14) {
          hoveredLetter = l
          break
        }
      }
    }
    litTarget = hoveredLetter
    litValue += ((hoveredLetter >= 0 ? 1 : 0) - litValue) * 0.12
    material.uniforms.uLitLetter.value = litTarget
    material.uniforms.uLit.value = litValue

    const radius = 0.055
    for (let i = 0; i < BLOCKS; i += 1) {
      const ix = i * 3
      const seed = seedArray[i]
      const bx = positions[ix]
      const by = positions[ix + 1]
      const bz = positions[ix + 2]

      // staggered assembly from the scattered cloud into the wordmark
      const k = grow <= seed * 0.4 ? 0 : Math.min(1, (grow - seed * 0.4) / 0.6)
      const e = k * k * (3 - 2 * k)

      const dx = bx - localX
      const dy = by - localY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const falloff = Math.exp(-(dist * dist) / (2 * radius * radius))
      const target = pointerSeen ? falloff * 1.1 : 0
      heatArray[i] += (target - heatArray[i]) * (target > heatArray[i] ? 0.2 : 0.07)

      // magnetic pull toward the cursor — kept subtle so letters stay readable
      const pull = heatArray[i] * 0.012 * e

      dummy.position.set(
        scatter[ix] + (bx - scatter[ix]) * e + dx * -pull,
        scatter[ix + 1] + (by - scatter[ix + 1]) * e + dy * -pull,
        scatter[ix + 2] + (bz - scatter[ix + 2]) * e + heatArray[i] * 0.35,
      )
      const s = 0.0125 * (0.82 + seed * 0.36) * (1 + heatArray[i] * 0.32) * (0.3 + 0.7 * e)
      dummy.scale.setScalar(s)
      dummy.rotation.set(
        (seed - 0.5) * 0.34 + heatArray[i] * 0.4 + (1 - e) * (seed - 0.5) * 2.6,
        (seed - 0.5) * 0.42 + (1 - e) * (seed - 0.5) * 3.1,
        (seed - 0.5) * 0.24 + (1 - e) * (0.5 - seed) * 2.2,
      )
      dummy.updateMatrix()
      blocks.setMatrixAt(i, dummy.matrix)
    }
    blocks.instanceMatrix.needsUpdate = true
    geometry.attributes.heat.needsUpdate = true
    material.uniforms.uTime.value = t
    pMat.uniforms.uTime.value = t

    camera.position.x = cameraHome.x + pointer.x * 0.35
    camera.position.y = cameraHome.y + pointer.y * 0.22
    camera.lookAt(0, 0, 0)

    backdrop.rotation.y = t * 0.03 + pointer.x * 0.06
    backdrop.rotation.x = Math.sin(t * 0.16) * 0.05
    halo.rotation.z = t * 0.05
    particles.rotation.y = t * 0.012
  }

  function frameLoop() {
    if (!running) return
    const t = clock.getElapsedTime()
    update(t)
    renderer.render(scene, camera)
    markReady()
    frameId = requestAnimationFrame(frameLoop)
  }

  function start() {
    if (reduced || running || disposed) return
    running = true
    clock.getDelta()
    frameLoop()
  }

  function stop() {
    running = false
    cancelAnimationFrame(frameId)
  }

  function renderStatic() {
    form = 1
    lastT = 0
    update(0.6)
    renderer.render(scene, camera)
    markReady()
  }

  function dispose() {
    disposed = true
    stop()
    window.removeEventListener('pointermove', handlePointer)
    ro.disconnect()
    geometry.dispose()
    material.dispose()
    pGeo.dispose()
    pMat.dispose()
    ghost.geometry.dispose()
    ghost.material.dispose()
    halo.children.forEach((ring) => {
      ring.geometry.dispose()
      ring.material.dispose()
    })
    renderer.dispose()
  }

  if (reduced) renderStatic()

  return { start, stop, dispose, resize, setFrame, renderStatic, hasWordmark }
}
