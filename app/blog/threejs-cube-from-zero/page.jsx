'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import * as THREE from 'three'
import Section from '../../components/Section'
import { P, H2, IC, Code, Callout, Divider, DemoBox } from '../../components/blog/prose'

function TabRow({ options, value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border transition-colors
            ${value === o.value ? 'bg-violet text-white border-violet' : 'bg-bg border-ui text-muted hover:text-foreground'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Demo 1 — Scene, Camera, Renderer ────────────────────────────────────────

function SceneDemo() {
  const mountRef = useRef(null)
  const stateRef = useRef({})
  const [bg, setBg] = useState('#0F1115')

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    scene.background = new THREE.Color(bg)
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 5)

    // Axis helper so users can see the three axes
    scene.add(new THREE.AxesHelper(2))
    // Grid
    const grid = new THREE.GridHelper(6, 10, 0x2a2f3a, 0x2a2f3a)
    scene.add(grid)

    stateRef.current = { scene, renderer }

    let rafId
    function tick() {
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (stateRef.current.scene) {
      stateRef.current.scene.background = new THREE.Color(bg)
    }
  }, [bg])

  return (
    <>
      <p className="text-[12px] font-mono text-muted">
        An empty scene with the coordinate axes (X=red, Y=green, Z=blue) and a grid. No geometry yet.
      </p>
      <div ref={mountRef} className="w-full rounded-xl overflow-hidden" style={{ height: 260 }} />
      <div className="flex items-center gap-3 text-[12px] font-mono text-muted">
        <label>Background color</label>
        <input type="color" value={bg} onChange={e => setBg(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-ui bg-transparent" />
        <code className="text-violet">{bg}</code>
      </div>
    </>
  )
}

// ─── Demo 2 — Hello Cube ──────────────────────────────────────────────────────

function CubeDemo() {
  const mountRef   = useRef(null)
  const meshRef    = useRef(null)
  const matRef     = useRef(null)
  const [wire, setWire]   = useState(false)
  const [color, setColor] = useState('#7C5CFF')
  const [axis, setAxis]   = useState('y')

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    scene.background = new THREE.Color('#0d0f18')
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(2, 1.5, 4)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 1.4)
    dir.position.set(4, 6, 4)
    scene.add(dir)

    const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5)
    const mat = new THREE.MeshStandardMaterial({ color, wireframe: wire })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    meshRef.current = mesh
    matRef.current  = mat

    let rafId
    function tick() {
      mesh.rotation[axis] += 0.012
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [axis])

  useEffect(() => {
    if (matRef.current) {
      matRef.current.wireframe = wire
      matRef.current.color.set(color)
    }
  }, [wire, color])

  return (
    <>
      <div ref={mountRef} className="w-full rounded-xl overflow-hidden" style={{ height: 280 }} />
      <div className="flex flex-wrap gap-4 items-center">
        <TabRow
          options={[{ value: 'x', label: 'Rotate X' }, { value: 'y', label: 'Rotate Y' }, { value: 'z', label: 'Rotate Z' }]}
          value={axis} onChange={setAxis}
        />
        <label className="flex items-center gap-2 text-[12px] font-mono text-muted cursor-pointer">
          <input type="checkbox" checked={wire} onChange={e => setWire(e.target.checked)} className="cursor-pointer" />
          Wireframe
        </label>
        <div className="flex items-center gap-2 text-[12px] font-mono text-muted">
          <label>Color</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-ui bg-transparent" />
        </div>
      </div>
    </>
  )
}

// ─── Demo 3 — Lighting ────────────────────────────────────────────────────────

function LightingDemo() {
  const mountRef  = useRef(null)
  const sceneRef  = useRef(null)
  const lightsRef = useRef({})
  const [mode, setMode] = useState('ambient+directional')

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    scene.background = new THREE.Color('#0d0f18')
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(2, 1.5, 4)
    camera.lookAt(0, 0, 0)

    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    const directional = new THREE.DirectionalLight(0xffffff, 2)
    directional.position.set(4, 6, 4)
    const point = new THREE.PointLight(0x7C5CFF, 4, 12)
    point.position.set(-2, 2, 2)

    scene.add(ambient)
    scene.add(directional)
    scene.add(point)
    lightsRef.current = { ambient, directional, point }
    sceneRef.current  = scene

    const geo  = new THREE.BoxGeometry(1.5, 1.5, 1.5)
    const mat  = new THREE.MeshStandardMaterial({ color: '#E8EAF0', roughness: 0.4, metalness: 0.1 })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    let rafId
    function tick() {
      mesh.rotation.y += 0.008
      mesh.rotation.x += 0.004
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const { ambient, directional, point } = lightsRef.current
    if (!ambient) return
    if (mode === 'none') {
      ambient.intensity = 0; directional.intensity = 0; point.intensity = 0
    } else if (mode === 'ambient') {
      ambient.intensity = 1.5; directional.intensity = 0; point.intensity = 0
    } else if (mode === 'ambient+directional') {
      ambient.intensity = 0.5; directional.intensity = 2; point.intensity = 0
    } else if (mode === 'ambient+directional+point') {
      ambient.intensity = 0.5; directional.intensity = 2; point.intensity = 4
    }
  }, [mode])

  return (
    <>
      <TabRow
        options={[
          { value: 'none',                    label: 'No light' },
          { value: 'ambient',                 label: 'Ambient only' },
          { value: 'ambient+directional',     label: '+ Directional' },
          { value: 'ambient+directional+point', label: '+ Point light' },
        ]}
        value={mode} onChange={setMode}
      />
      <div ref={mountRef} className="w-full rounded-xl overflow-hidden" style={{ height: 280 }} />
      <p className="text-[11px] font-mono text-muted">
        {mode === 'none' && 'MeshStandardMaterial requires light. Without it, the cube is invisible.'}
        {mode === 'ambient' && 'AmbientLight illuminates all faces equally, flat and unshaded.'}
        {mode === 'ambient+directional' && 'DirectionalLight acts like sunlight: it creates shading and depth.'}
        {mode === 'ambient+directional+point' && 'PointLight emits from a position like a lamp. Notice the violet glow on the left face.'}
      </p>
    </>
  )
}

// ─── Demo 4 — Materials ───────────────────────────────────────────────────────

const MATERIALS = {
  basic:    { label: 'MeshBasicMaterial',    desc: 'No lighting. Always renders the same regardless of lights. Good for UI, wireframes, or flat color fills.' },
  normal:   { label: 'MeshNormalMaterial',   desc: 'Maps the face normal vectors to RGB. Each face shows a different color depending on its orientation. Great for debugging geometry.' },
  phong:    { label: 'MeshPhongMaterial',    desc: 'Classic shading with a specular highlight. Cheaper than Standard but physically inaccurate. Still useful for stylised looks.' },
  standard: { label: 'MeshStandardMaterial', desc: 'PBR (physically-based rendering) material. Responds to metalness and roughness. Use this by default for realistic results.' },
}

function MaterialsDemo() {
  const mountRef  = useRef(null)
  const meshRef   = useRef(null)
  const [active, setActive] = useState('standard')

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    scene.background = new THREE.Color('#0d0f18')
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(2, 1.5, 4)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dir = new THREE.DirectionalLight(0xffffff, 2)
    dir.position.set(4, 6, 4)
    scene.add(dir)

    const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5)
    const mat = new THREE.MeshStandardMaterial({ color: '#7C5CFF', roughness: 0.4, metalness: 0.1 })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)
    meshRef.current = mesh

    let rafId
    function tick() {
      mesh.rotation.y += 0.008
      mesh.rotation.x += 0.004
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const mats = {
      basic:    new THREE.MeshBasicMaterial({ color: '#7C5CFF' }),
      normal:   new THREE.MeshNormalMaterial(),
      phong:    new THREE.MeshPhongMaterial({ color: '#7C5CFF', shininess: 80 }),
      standard: new THREE.MeshStandardMaterial({ color: '#7C5CFF', roughness: 0.4, metalness: 0.1 }),
    }
    const prev = mesh.material
    mesh.material = mats[active]
    prev.dispose()
  }, [active])

  return (
    <>
      <TabRow
        options={Object.entries(MATERIALS).map(([v, m]) => ({ value: v, label: m.label }))}
        value={active} onChange={setActive}
      />
      <div ref={mountRef} className="w-full rounded-xl overflow-hidden" style={{ height: 280 }} />
      <p className="text-[12px] font-mono text-muted leading-relaxed">
        {MATERIALS[active].desc}
      </p>
    </>
  )
}

// ─── The Post ─────────────────────────────────────────────────────────────────

export default function ThreejsCubePost() {
  return (
    <Section size="narrow">

        <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-mono text-muted hover:text-foreground transition-colors no-underline mb-10">
          ← All posts
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-4">
            <span>March 22, 2026</span>
            <span>·</span>
            <span>9 min read</span>
          </div>
          <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
            Your First Three.js Scene: A Cube From Zero
          </h1>
          <div className="flex flex-wrap gap-2">
            {['Three.js', 'WebGL', '3D'].map(tag => (
              <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded border border-ui bg-bg2 text-muted">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <article>
          <P>
            Three.js is the most popular library for 3D on the web. It sits on top of WebGL and
            removes the pain of writing raw shader code while still giving you full control when
            you need it. In this article you'll build a rotating cube from scratch, layer in
            lighting and materials, and end up with an intuition for how every piece fits together.
          </P>
          <P>
            Every section has an interactive demo you can poke at directly in the browser. The goal
            isn't to memorise the API. The goal is to build a mental model that makes the docs make sense.
          </P>

          <Divider />

          {/* ── 1. The Three Pillars ── */}
          <H2 id="three-pillars">1. The Three Pillars</H2>
          <P>
            Every Three.js program is built on the same three concepts: a <IC>Scene</IC>, a{' '}
            <IC>Camera</IC>, and a <IC>Renderer</IC>. You can't skip any of them.
          </P>

          <Code lang="js">{`import * as THREE from 'three'

// 1. Scene — the container for everything
const scene = new THREE.Scene()

// 2. Camera — the viewpoint into the scene
const camera = new THREE.PerspectiveCamera(
  50,                              // field of view (degrees)
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1,                             // near clipping plane
  1000                             // far clipping plane
)
camera.position.z = 5

// 3. Renderer — draws the scene onto a <canvas>
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Render a single frame
renderer.render(scene, camera)`}</Code>

          <P>
            At this point the canvas exists but the scene is empty. The demo below shows exactly that:
            a scene with no geometry, just the coordinate axes and a grid to give you a sense of space.
            X is red, Y is green, Z is blue.
          </P>

          <DemoBox label="Interactive · Empty Scene">
            <SceneDemo />
          </DemoBox>

          <Callout>
            <strong>PerspectiveCamera parameters.</strong> The first argument is the vertical field
            of view in degrees. 50 to 75 is typical for most scenes. The second is the aspect ratio.
            The last two (<IC>near</IC> and <IC>far</IC>) define the clipping planes. Anything
            outside that range isn't rendered. Keep <IC>near</IC> as large as you can without
            clipping visible objects; a tiny near value causes z-fighting artefacts.
          </Callout>

          <Divider />

          {/* ── 2. Adding a Cube ── */}
          <H2 id="adding-a-cube">2. Adding a Cube</H2>
          <P>
            In Three.js, a visible object is always a <IC>Mesh</IC>: the combination of a{' '}
            <IC>Geometry</IC> (the shape) and a <IC>Material</IC> (the appearance). Neither is
            useful on its own.
          </P>

          <Code lang="js">{`// Geometry — defines the shape
const geometry = new THREE.BoxGeometry(1, 1, 1)
// BoxGeometry(width, height, depth)

// Material — defines the appearance
const material = new THREE.MeshStandardMaterial({ color: 0x7C5CFF })

// Mesh — combines both into a renderable object
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)`}</Code>

          <P>
            The cube is now in the scene but it won't animate by itself. Three.js doesn't have
            a built-in update loop. You drive it with <IC>requestAnimationFrame</IC>:
          </P>

          <Code lang="js">{`function tick() {
  cube.rotation.y += 0.01  // rotate ~0.57° per frame
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)`}</Code>

          <DemoBox label="Interactive · Hello Cube">
            <CubeDemo />
          </DemoBox>

          <P>
            Toggle wireframe mode to see the triangles that make up the cube's faces. Each quad face
            is made of two triangles, the fundamental unit of 3D rendering. Switch the
            rotation axis to feel the difference between tumbling on X, Y, and Z.
          </P>

          <Callout>
            <strong>Colors in Three.js.</strong> You can pass a color as a hex number{' '}
            (<IC>0x7C5CFF</IC>), a hex string (<IC>'#7C5CFF'</IC>), a CSS color name{' '}
            (<IC>'violet'</IC>), or a <IC>THREE.Color</IC> instance. They're all equivalent.
            At runtime, you update a material color with{' '}
            <IC>material.color.set('#newcolor')</IC>.
          </Callout>

          <Divider />

          {/* ── 3. Lighting ── */}
          <H2 id="lighting">3. Let There Be Light</H2>
          <P>
            If you tried to use <IC>MeshStandardMaterial</IC> without any lights you'd see nothing,
            or rather a black shape. That's because physically-based materials need a light source
            to show any shading. Three.js ships with several light types. The two you'll use most
            are <IC>AmbientLight</IC> and <IC>DirectionalLight</IC>.
          </P>

          <Code lang="js">{`// AmbientLight — illuminates all surfaces equally, no shading
const ambient = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambient)

// DirectionalLight — parallel rays from a direction, like the sun
const sun = new THREE.DirectionalLight(0xffffff, 2)
sun.position.set(4, 6, 4)
scene.add(sun)

// PointLight — emits in all directions from a position, like a lamp
const lamp = new THREE.PointLight(0x7C5CFF, 4, 12)
lamp.position.set(-2, 2, 2)
scene.add(lamp)`}</Code>

          <DemoBox label="Interactive · Lighting Modes">
            <LightingDemo />
          </DemoBox>

          <P>
            Notice that with ambient light only, the cube looks completely flat. Every face
            receives the same illumination, so there's no visual depth. Adding a directional light
            immediately creates shading: some faces are bright, others dark, and you can read the
            cube as a 3D object. The point light adds a tinted glow from a specific position in space.
          </P>

          <Callout>
            <strong>Light intensity and color.</strong> The second argument to any light constructor
            is the intensity. For <IC>DirectionalLight</IC> and <IC>PointLight</IC> it's in physical
            units when <IC>renderer.useLegacyLights = false</IC>. Values of 1 to 5 are typical.
            The first argument is the color; tinting your lights is one of the fastest ways to make
            a scene feel atmospheric.
          </Callout>

          <Divider />

          {/* ── 4. Materials ── */}
          <H2 id="materials">4. Materials: Beyond the Default</H2>
          <P>
            The material determines how a surface responds to light. Three.js ships with around
            a dozen material types. You'll use four of them for almost everything:
          </P>

          <Code lang="js">{`// No lighting calculation — always shows the raw color
const basic    = new THREE.MeshBasicMaterial({ color: '#7C5CFF' })

// Normals mapped to RGB — great for debugging geometry
const normals  = new THREE.MeshNormalMaterial()

// Classic Phong shading with a specular highlight
const phong    = new THREE.MeshPhongMaterial({ color: '#7C5CFF', shininess: 80 })

// PBR: physically-based rendering — the right default for 3D
const standard = new THREE.MeshStandardMaterial({
  color:     '#7C5CFF',
  roughness: 0.4,   // 0 = mirror, 1 = chalk
  metalness: 0.1,   // 0 = plastic, 1 = metal
})`}</Code>

          <DemoBox label="Interactive · Material Explorer">
            <MaterialsDemo />
          </DemoBox>

          <P>
            <IC>MeshNormalMaterial</IC> is especially useful during development. Because each face
            renders a color based on its outward normal, you can instantly see the orientation of
            every polygon. If two adjacent faces look the same color when they shouldn't, you likely
            have a normals issue.
          </P>

          <Divider />

          {/* ── 5. Putting it together ── */}
          <H2 id="full-example">5. The Full Example</H2>
          <P>
            Here's everything together in a self-contained snippet you can drop into any project:
          </P>

          <Code lang="js">{`import * as THREE from 'three'

// ── Setup ──────────────────────────────────────────────────────────
const scene    = new THREE.Scene()
const camera   = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })

camera.position.set(2, 1.5, 4)
camera.lookAt(0, 0, 0)
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// ── Lights ─────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.5))
const sun = new THREE.DirectionalLight(0xffffff, 2)
sun.position.set(4, 6, 4)
scene.add(sun)

// ── Cube ───────────────────────────────────────────────────────────
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshStandardMaterial({ color: '#7C5CFF', roughness: 0.4 })
)
scene.add(cube)

// ── Resize handler ─────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})

// ── Render loop ────────────────────────────────────────────────────
function tick() {
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)`}</Code>

          <Divider />

          {/* ── Closing ── */}
          <H2 id="next">Where to Go Next</H2>
          <P>
            A rotating cube is the foundation. From here everything builds on the same primitives:
            more geometry, more lights, more materials, and eventually custom GLSL shaders for
            effects that go beyond what the built-in materials can do.
          </P>
          <ul className="list-none flex flex-col gap-3 mb-6 pl-0">
            {[
              ['Add shadows', 'Enable renderer.shadowMap.enabled = true, set castShadow on lights and meshes, and receiveShadow on floor planes.'],
              ['Load a model', 'Use GLTFLoader from three/addons to load .glb files exported from Blender, Meshy AI, or any 3D tool.'],
              ['Add controls', 'OrbitControls (also in addons) gives you free camera rotation, pan, and zoom in two lines.'],
              ['Explore geometry', 'SphereGeometry, TorusGeometry, CylinderGeometry all follow the same Mesh pattern. Experiment with the segment count to control smoothness.'],
              ['Try vertex shaders', 'onBeforeCompile lets you inject custom GLSL into a standard material without writing a full shader from scratch.'],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3 text-[14px] leading-relaxed">
                <span className="text-violet mt-[3px] shrink-0">→</span>
                <span>
                  <strong className="text-foreground">{title}.</strong>
                  {' '}<span className="text-muted">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <P>
            If you want to see these ideas taken further, the{' '}
            <Link href="/experiments/rocky-sphere" className="text-violet hover:underline">Rocky Sphere</Link>{' '}
            experiment on this site uses vertex shader displacement on a standard sphere geometry.
          </P>
        </article>

      </Section>
  )
}
