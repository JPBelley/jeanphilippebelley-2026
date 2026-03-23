'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader }  from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

export default function MemojiHead({ size = 2.8, className = '', style = {} }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    // ── Scene / Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200)
    camera.position.set(0, 0, 10)

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 3.0))

    // ── Head ──────────────────────────────────────────────────────────────────
    const faceGroup = new THREE.Group()
    scene.add(faceGroup)

    let targetScale  = 0
    let currentScale = 0

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
      const sz = new THREE.Vector3()
      box.getSize(sz)
      const effectiveSize = window.innerWidth < 768 ? size * 2.8 : size
      targetScale = effectiveSize / Math.max(sz.x, sz.y, sz.z)
      obj.scale.setScalar(0)
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

    // ── Cursor ────────────────────────────────────────────────────────────────
    const cursor = { x: 0, y: 0 }
    const target = { rx: 0, ry: 0 }

    function onMouseMove(e) {
      cursor.x =  (e.clientX / window.innerWidth  - 0.5) * 2
      cursor.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Animate ───────────────────────────────────────────────────────────────
    const LERP = 0.06
    let rafId

    function tick() {
      target.rx += (cursor.y * 0.3  - target.rx) * LERP
      target.ry += (cursor.x * 0.55 - target.ry) * LERP
      faceGroup.rotation.x = target.rx + 0.15
      faceGroup.rotation.y = target.ry

      if (faceGroup.children.length > 0 && targetScale > 0) {
        currentScale += (targetScale - currentScale) * 0.06
        faceGroup.children[0].scale.setScalar(currentScale)
      }

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
  }, [size])

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ pointerEvents: 'none', ...style }}
    />
  )
}
