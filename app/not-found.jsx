'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'

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
    const cursor = { x: 0, y: 0 }
    const target = { rx: 0, ry: 0 }
    const text3d = { x: 0, y: 0 }

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.4))

    const key = new THREE.DirectionalLight(0xffffff, 3.5)
    key.position.set(4, 6, 8)
    key.castShadow = true
    scene.add(key)

    const rim = new THREE.DirectionalLight(0x7C5CFF, 1.5)
    rim.position.set(-5, 2, -4)
    scene.add(rim)

    const fill = new THREE.DirectionalLight(0x2EE6A6, 0.6)
    fill.position.set(3, -3, 5)
    scene.add(fill)

    // ── STL face ──────────────────────────────────────────────────────────────
    const faceGroup = new THREE.Group()
    scene.add(faceGroup)

    const loader = new STLLoader()
    loader.load('/JPBelley_Memoji.stl', (geometry) => {
      geometry.computeVertexNormals()
      geometry.computeBoundingBox()

      const box    = geometry.boundingBox
      const center = new THREE.Vector3()
      box.getCenter(center)
      geometry.translate(-center.x, -center.y, -center.z)

      const size   = new THREE.Vector3()
      box.getSize(size)
      const scale  = 4.5 / Math.max(size.x, size.y, size.z)

      const mat  = new THREE.MeshStandardMaterial({ color: 0xE8EAF0, roughness: 0.55, metalness: 0.05 })
      const mesh = new THREE.Mesh(geometry, mat)
      mesh.scale.setScalar(scale)
      mesh.rotation.x = -Math.PI / 2
      mesh.castShadow = true
      faceGroup.add(mesh)
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
      target.rx += (cursor.y * 0.45         - target.rx) * LERP
      target.ry += (cursor.x * Math.PI / 2  - target.ry) * LERP
      faceGroup.rotation.x = target.rx
      faceGroup.rotation.y = target.ry

      // Drift the HTML text subtly with cursor
      text3d.x += (cursor.x * 18 - text3d.x) * LERP * 0.5
      text3d.y += (cursor.y * 8  - text3d.y) * LERP * 0.5
      textEl.style.transform = `translate(calc(-50% + ${text3d.x}px), calc(-50% + ${-text3d.y}px))`

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

      {/* 404 text — HTML so it uses the real font and scales with vw */}
      <div
        ref={text404Ref}
        className="absolute font-head font-black text-foreground select-none pointer-events-none will-change-transform"
        style={{
          fontSize: 'clamp(100px, 28vw, 480px)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.9,
        }}
      >
        404
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
