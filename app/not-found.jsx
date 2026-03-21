'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Cursor from './components/Cursor'
import * as THREE from 'three'
import { GLTFLoader }  from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

export default function NotFound() {
  const mountRef  = useRef(null)
  const text404Ref = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const textEl = text404Ref.current
    if (!mount || !textEl) return

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    // ── Scene / Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200)
    camera.position.set(0, 0, 10)

    // ── Cursor tracking ───────────────────────────────────────────────────────
    const cursor  = { x: 0, y: 0 }
    const target  = { rx: 0, ry: 0 }
    // Per-digit parallax — [xFactor, yFactor, rotScale]
    const DIGIT_FACTORS = [[22, 10, 1.2], [8, 14, 0.7], [18, 8, 1.0]]
    const digits3d = [{x:0,y:0,rx:0,ry:0}, {x:0,y:0,rx:0,ry:0}, {x:0,y:0,rx:0,ry:0}]

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 3.0))

    // ── OBJ face with texture ─────────────────────────────────────────────────
    const faceGroup = new THREE.Group()
    scene.add(faceGroup)

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)
    gltfLoader.load('/memoji.glb', (gltf) => {
      const obj = gltf.scene

      const box = new THREE.Box3().setFromObject(obj)
      const center = new THREE.Vector3()
      box.getCenter(center)
      obj.position.sub(center)

      const size  = new THREE.Vector3()
      box.getSize(size)
      const scale = 3.2 / Math.max(size.x, size.y, size.z)
      obj.scale.setScalar(scale)
      obj.traverse(child => { if (child.isMesh) child.castShadow = true })
      faceGroup.add(obj)
    })

    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // ── Mouse ─────────────────────────────────────────────────────────────────
    function onMouseMove(e) {
      cursor.x =  (e.clientX / window.innerWidth  - 0.5) * 2
      cursor.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Animate ───────────────────────────────────────────────────────────────
    const LERP = 0.06
    let rafId

    function tick() {
      target.rx += (cursor.y * 0.15         - target.rx) * LERP
      target.ry += (cursor.x * 0.3          - target.ry) * LERP
      faceGroup.rotation.x = target.rx + 0.15
      faceGroup.rotation.y = target.ry

      // Drift the HTML text subtly with cursor
      const spans = textEl.children
      digits3d.forEach((d, i) => {
        const [fx, fy, rs] = DIGIT_FACTORS[i]
        d.x  += (-cursor.x * fx         - d.x)  * LERP * 0.5
        d.y  += (-cursor.y * fy         - d.y)  * LERP * 0.5
        d.rx += ( cursor.y * 12 * rs    - d.rx) * LERP * 0.5
        d.ry += (-cursor.x * 14 * rs    - d.ry) * LERP * 0.5
        spans[i].style.transform =
          `translate(${d.x}px, ${-d.y}px) rotateX(${d.rx}deg) rotateY(${d.ry}deg)`
      })

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="relative w-screen h-screen bg-bg overflow-hidden">
      <Cursor />

      {/* 404 text — each digit reacts independently to cursor */}
      <div
        ref={text404Ref}
        className="absolute font-head font-bold text-foreground select-none pointer-events-none"
        style={{
          fontSize: 'clamp(140px, 38vw, 640px)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.9,
          display: 'flex',
          perspective: '800px',
          perspectiveOrigin: 'center center',
        }}
      >
        {['4','0','4'].map((ch, i) => (
          <span
            key={i}
            className="inline-block will-change-transform"
            style={{
              textShadow: `
                1px 2px 0 rgba(0,0,0,0.5),
                2px 4px 0 rgba(0,0,0,0.35),
                3px 6px 0 rgba(0,0,0,0.2),
                0 0 60px rgba(124,92,255,0.15)
              `,
            }}
          >{ch}</span>
        ))}
      </div>

      {/* Three.js canvas — alpha:true so text shows through, head renders on top */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Bottom overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none">
        <p className="font-mono text-[13px] text-muted mb-5 tracking-widest">
          Looks like you found a dead end.
        </p>
        <Link
          href="/"
          className="pointer-events-auto font-mono text-[12px] px-6 py-3 rounded-lg border border-ui text-muted hover:border-violet hover:text-violet transition-colors duration-200"
        >
          ← Back home
        </Link>
      </div>

    </div>
  )
}
