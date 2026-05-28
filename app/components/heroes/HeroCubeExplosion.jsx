'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

const GRID               = 4
const CELL               = 1
const SIZE               = 1
const HALF               = ((GRID - 1) * CELL) / 2
const INTRO_DURATION     = 3.2
const INTRO_DELAY        = 0.3
const INTRO_START        = 0.35  // initial scatter (0 = assembled, 1 = fully exploded)
const REPULSION_RADIUS   = 2.2
const REPULSION_STRENGTH = 0.7

const MATERIAL_PARAMS = {
  roughness:          0.41,
  metalness:          0.00,
  clearcoat:          0.98,
  clearcoatRoughness: 0.12,
  envMapIntensity:    1.35,
  transmission:       0.81,
  ior:                2.25,
  reflectivity:       0.75,
  sheen:              1.00,
  iridescence:        0.51,
}

function CubeGrid({ scrollRef, mouseRef, onAssembled, onNearlyAssembled }) {
  const { camera }   = useThree()
  const groupRef     = useRef(null)
  const meshRefs     = useRef([])
  const smoothScroll = useRef(INTRO_START)
  const introContrib = useRef(INTRO_START)
  const startTime    = useRef(null)
  const firedRef         = useRef(false)
  const nearlyFiredRef   = useRef(false)

  const repulsions = useRef([])
  const _ndc  = useMemo(() => new THREE.Vector3(), [])
  const _dir  = useMemo(() => new THREE.Vector3(), [])
  const _mw   = useMemo(() => new THREE.Vector3(), [])
  const _diff = useMemo(() => new THREE.Vector3(), [])

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#121212'),
    ...MATERIAL_PARAMS,
  }), [])

  const data = useMemo(() => {
    const result = []
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        for (let z = 0; z < GRID; z++) {
          const base = new THREE.Vector3(
            x * CELL - HALF,
            y * CELL - HALF,
            z * CELL - HALF,
          )
          const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
          ).normalize().multiplyScalar(18 + Math.random() * 14)

          const rotAxis = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5,
          ).normalize()

          result.push({
            base,
            dir,
            rotAxis,
            rotSpeed: (Math.random() < 0.5 ? 1 : -1) * (Math.PI * 2 + Math.random() * Math.PI * 3),
            delay:    Math.random() * 0.25,
          })
        }
      }
    }
    repulsions.current = result.map(() => new THREE.Vector3())
    return result
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    if (startTime.current === null) startTime.current = t
    const elapsed = t - startTime.current

    if (elapsed > INTRO_DELAY) {
      const introT = Math.min(1, (elapsed - INTRO_DELAY) / INTRO_DURATION)
      introContrib.current = INTRO_START * Math.pow(1 - introT, 2.5)
    }

    const effectiveScroll = Math.min(1, scrollRef.current + introContrib.current)
    smoothScroll.current += (effectiveScroll - smoothScroll.current) * 0.06
    const s = smoothScroll.current

    if (!nearlyFiredRef.current && smoothScroll.current < 0.15) {
      nearlyFiredRef.current = true
      onNearlyAssembled?.()
    }

    if (!firedRef.current && smoothScroll.current < 0.05) {
      firedRef.current = true
      onAssembled?.()
    }

    groupRef.current.rotation.y = 0
    groupRef.current.rotation.x = 0

    _ndc.set(mouseRef.current.x, mouseRef.current.y, 0.5).unproject(camera)
    _dir.copy(_ndc).sub(camera.position).normalize()
    const tPlane = -camera.position.z / _dir.z
    _mw.copy(camera.position).addScaledVector(_dir, tPlane)

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const { base, dir, rotAxis, rotSpeed, delay } = data[i]
      const localProgress = Math.max(0, Math.min(1, (s - delay) / (1 - delay)))
      const eased         = 1 - Math.pow(1 - localProgress, 3)
      const assembled     = 1 - eased

      const px = base.x + dir.x * eased
      const py = base.y + dir.y * eased
      const pz = base.z + dir.z * eased

      const repulsionWeight = assembled * (1 - introContrib.current)
      const rep = repulsions.current[i]

      if (repulsionWeight > 0.05) {
        _diff.set(px - _mw.x, py - _mw.y, pz - _mw.z)
        const dist = _diff.length()
        if (dist < REPULSION_RADIUS) {
          const strength = (1 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH * repulsionWeight
          rep.lerp(_diff.normalize().multiplyScalar(strength), 0.12)
        } else {
          rep.lerp(_diff.set(0, 0, 0), 0.08)
        }
      } else {
        rep.multiplyScalar(0.92)
      }

      mesh.position.set(px + rep.x, py + rep.y, pz + rep.z)

      if (eased > 0.001) {
        mesh.setRotationFromAxisAngle(rotAxis, rotSpeed * eased)
      } else {
        mesh.rotation.set(0, 0, 0)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {data.map(({ base }, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={base}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[SIZE, SIZE, SIZE]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

export default function HeroCubeExplosion({ onAssembled, onNearlyAssembled, scrollBuffer = 600 }) {
  const scrollRef = useRef(0)
  const mouseRef  = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(1, window.scrollY / scrollBuffer)
    }
    const onMouseMove = (e) => {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('scroll',    onScroll,    { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => {
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [scrollBuffer])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [6, 5, 8], fov: 42 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.8 }}
        shadows
      >
        <ambientLight intensity={1.64} color="#ffffff" />
        <directionalLight
          position={[6, 8, 10]} intensity={5.80} color="#dde4f0" castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5} shadow-camera-far={40}
          shadow-camera-left={-8}  shadow-camera-right={8}
          shadow-camera-top={8}    shadow-camera-bottom={-8}
        />
        <directionalLight position={[-5, 4, 4]} intensity={5.00} color="#dde0e8" />
        <directionalLight position={[0, 10, 2]}  intensity={2.15} color="#ffffff" />

        <CubeGrid scrollRef={scrollRef} mouseRef={mouseRef} onAssembled={onAssembled} onNearlyAssembled={onNearlyAssembled} />

        <EffectComposer>
          <Bloom intensity={1.4} luminanceThreshold={0.25} luminanceSmoothing={0.85} mipmapBlur />
          <Vignette offset={0.12} darkness={0.95} blendFunction={BlendFunction.NORMAL} />
        </EffectComposer>

        <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
}
