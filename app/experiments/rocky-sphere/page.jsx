'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import ExperimentLayout from '../../components/layouts/ExperimentLayout'

// ─── GLSL injected into MeshStandardMaterial via onBeforeCompile ──────────────

const UNIFORMS_GLSL = `
  uniform float uTime;
  uniform float uDispScale;
  uniform float uNoiseFreq;
`

const NOISE_GLSL = `
  float nhash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float nvalue(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(nhash(i),             nhash(i+vec3(1,0,0)), u.x),
          mix(nhash(i+vec3(0,1,0)), nhash(i+vec3(1,1,0)), u.x), u.y),
      mix(mix(nhash(i+vec3(0,0,1)), nhash(i+vec3(1,0,1)), u.x),
          mix(nhash(i+vec3(0,1,1)), nhash(i+vec3(1,1,1)), u.x), u.y),
      u.z);
  }
  float nfbm(vec3 p) {
    float v = 0.0, a = 0.5, f = 1.0;
    for (int i = 0; i < 8; i++) { v += a * nvalue(p * f); a *= 0.48; f *= 2.07; }
    return v;
  }
  float getDisp(vec3 n, float t) {
    float s = uNoiseFreq;
    float n1 = nfbm(n * 1.6 * s + vec3(0.0,  0.0,  t * 0.40));
    float n2 = nfbm(n * 3.8 * s + vec3(7.3)  + vec3(t * 0.28, 0.0, 0.0));
    float n3r= nfbm(n * 6.0 * s + vec3(2.0)  + vec3(0.0, t * 0.18, 0.0));
    float n3 = pow(abs(n3r - 0.5) * 2.0, 1.8);
    return (n1 * 0.42 + n2 * 0.18 + n3 * 0.22) * uDispScale;
  }
`

// Replaces #include <beginnormal_vertex>
// Computes displaced position + perturbed normal via finite differences.
const NORMAL_INJECTION = `
  vec3 _nrm      = normalize(position);
  float _t       = uTime;
  float _d       = getDisp(_nrm, _t);
  vec3  _displaced = _nrm * (1.0 + _d);

  float _eps  = 0.012;
  vec3  _up   = abs(_nrm.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0);
  vec3  _tan1 = normalize(cross(_nrm, _up));
  vec3  _tan2 = normalize(cross(_nrm, _tan1));
  vec3  _pA   = normalize(_nrm + _eps*_tan1) * (1.0 + getDisp(normalize(_nrm + _eps*_tan1), _t));
  vec3  _pB   = normalize(_nrm + _eps*_tan2) * (1.0 + getDisp(normalize(_nrm + _eps*_tan2), _t));
  vec3  objectNormal = normalize(cross(_pA - _displaced, _pB - _displaced));
`

// Replaces #include <begin_vertex> (main material — _displaced already computed above)
const POSITION_INJECTION = `
  vec3 transformed = _displaced;
`

// Replaces #include <begin_vertex> in the depth material (no prior normal pass, compute inline)
const DEPTH_POSITION_INJECTION = `
  vec3 _nrm = normalize(position);
  float _t  = uTime;
  vec3 transformed = _nrm * (1.0 + getDisp(_nrm, _t));
`

// ─── Code generator ───────────────────────────────────────────────────────────

function generateCode(cfg) {
  const hex = cfg.color.replace('#', '')
  return `'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const UNIFORMS_GLSL = ${JSON.stringify(UNIFORMS_GLSL)}
const NOISE_GLSL    = ${JSON.stringify(NOISE_GLSL)}
const NORMAL_INJECTION       = ${JSON.stringify(NORMAL_INJECTION)}
const POSITION_INJECTION     = ${JSON.stringify(POSITION_INJECTION)}
const DEPTH_POSITION_INJECTION = ${JSON.stringify(DEPTH_POSITION_INJECTION)}

export default function RockySphere() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap
    renderer.outputColorSpace  = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0.1, 5)

    const shared = {
      uTime:      { value: 0 },
      uDispScale: { value: ${cfg.dispScale} },
      uNoiseFreq: { value: ${cfg.noiseFreq} },
    }

    const geo = new THREE.SphereGeometry(1, 256, 256)
    const mat = new THREE.MeshStandardMaterial({
      color:     0x${hex},
      roughness: ${cfg.roughness},
      metalness: ${cfg.metalness},
    })
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime      = shared.uTime
      shader.uniforms.uDispScale = shared.uDispScale
      shader.uniforms.uNoiseFreq = shared.uNoiseFreq
      shader.vertexShader = UNIFORMS_GLSL + NOISE_GLSL + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', NORMAL_INJECTION)
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',       POSITION_INJECTION)
    }

    const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })
    depthMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime      = shared.uTime
      shader.uniforms.uDispScale = shared.uDispScale
      shader.uniforms.uNoiseFreq = shared.uNoiseFreq
      shader.vertexShader = UNIFORMS_GLSL + NOISE_GLSL + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', DEPTH_POSITION_INJECTION)
    }

    const mesh = new THREE.Mesh(geo, mat)
    mesh.customDepthMaterial = depthMat
    mesh.castShadow = true
    mesh.position.y = 0.1
    scene.add(mesh)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    )
    ground.rotation.x    = -Math.PI / 2
    ground.position.y    = -1.65
    ground.receiveShadow = true
    scene.add(ground)

    scene.add(new THREE.AmbientLight(0xffffff, 1.2))

    const key = new THREE.DirectionalLight(0xffffff, ${cfg.lightInt})
    key.position.set(3, 4, 2.5)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.left = -2; key.shadow.camera.right  = 2
    key.shadow.camera.top  =  2; key.shadow.camera.bottom = -2
    key.shadow.camera.near = 0.1; key.shadow.camera.far   = 20
    key.shadow.bias   = -0.0005
    key.shadow.radius = 3
    scene.add(key)

    const fill = new THREE.DirectionalLight(0xffffff, 0.6)
    fill.position.set(-3, -2, 2)
    scene.add(fill)

    function resize() {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    let rafId
    function tick(t) {
      shared.uTime.value = t * 0.0004 * ${cfg.waveSpeed}
      mesh.rotation.y    = t * 0.00018 * ${cfg.speed}
      mesh.rotation.x    = Math.sin(t * 0.00009 * ${cfg.speed}) * 0.12
      mesh.position.y    = 0.1 + Math.sin(t * 0.00047) * 0.05
                               + Math.sin(t * 0.00031) * 0.02
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div ref={mountRef} style={{ width: '100%', height: '500px', background: '${cfg.bg}' }} />
  )
}`
}

// ─── Controls sub-components ─────────────────────────────────────────────────

function SliderRow({ label, value, min, max, step = 0.01, unit = '', onChange }) {
  return (
    <div className="ctrl-row">
      <span className="ctrl-label">{label}</span>
      <div className="ctrl-right">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))} />
        <span className="ctrl-val">{value}{unit}</span>
      </div>
    </div>
  )
}

// ─── Presets ──────────────────────────────────────────────────────────────────

const COLORS = [
  { label: 'Obsidian',  hex: '#090909' },
  { label: 'Volcanic',  hex: '#1a0500' },
  { label: 'Deep Sea',  hex: '#000d1a' },
  { label: 'Steel',     hex: '#0d1117' },
  { label: 'Rust',      hex: '#260800' },
  { label: 'Violet',    hex: '#1a0533' },
  { label: 'Toxic',     hex: '#0a1f00' },
  { label: 'Fuchsia',   hex: '#1a0018' },
  { label: 'Aurora',    hex: '#003322' },
  { label: 'Neon',      hex: '#7C5CFF' },
]

const BACKGROUNDS = [
  { label: 'Parchment', hex: '#EDEAE4' },
  { label: 'Dark',      hex: '#0F1115' },
  { label: 'Warm',      hex: '#F5F0E8' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RockySphere() {
  const mountRef    = useRef(null)
  const matRef      = useRef(null)
  const keyLightRef = useRef(null)
  const uRef        = useRef(null)   // shader uniforms
  const speedRef    = useRef(1)

  const [dispScale, setDispScale] = useState(1)
  const [noiseFreq, setNoiseFreq] = useState(1)
  const [waveSpeed, setWaveSpeed] = useState(1)
  const [speed,     setSpeed]     = useState(1)
  const [roughness, setRoughness] = useState(0.85)
  const [metalness, setMetalness] = useState(0.12)
  const [lightInt,  setLightInt]  = useState(4.5)
  const [color,     setColor]     = useState('#090909')
  const [bg,        setBg]        = useState('#EDEAE4')
  const [showCode,  setShowCode]  = useState(false)
  const [copied,    setCopied]    = useState(false)

  // ── Bootstrap Three.js once ─────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap
    renderer.outputColorSpace  = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0.1, 5)

    // Plain sphere — displacement handled entirely in vertex shader
    const geo = new THREE.SphereGeometry(1, 256, 256)

    // Shared uniforms — both main and depth materials read the same objects
    const shared = { uTime: { value: 0 }, uDispScale: { value: 1 }, uNoiseFreq: { value: 1 } }
    uRef.current = shared

    const mat = new THREE.MeshStandardMaterial({ color: 0x090909, roughness: 0.85, metalness: 0.12 })
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime      = shared.uTime
      shader.uniforms.uDispScale = shared.uDispScale
      shader.uniforms.uNoiseFreq = shared.uNoiseFreq
      shader.vertexShader = UNIFORMS_GLSL + NOISE_GLSL + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', NORMAL_INJECTION)
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',       POSITION_INJECTION)
    }
    matRef.current = mat

    // Depth material — same displacement so shadow matches the jagged surface
    const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })
    depthMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime      = shared.uTime
      shader.uniforms.uDispScale = shared.uDispScale
      shader.uniforms.uNoiseFreq = shared.uNoiseFreq
      shader.vertexShader = UNIFORMS_GLSL + NOISE_GLSL + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', DEPTH_POSITION_INJECTION)
    }

    const mesh = new THREE.Mesh(geo, mat)
    mesh.customDepthMaterial = depthMat
    mesh.castShadow = true
    mesh.position.y = 0.1
    scene.add(mesh)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    )
    ground.rotation.x    = -Math.PI / 2
    ground.position.y    = -1.65
    ground.receiveShadow = true
    scene.add(ground)

    scene.add(new THREE.AmbientLight(0xffffff, 1.2))

    const key = new THREE.DirectionalLight(0xffffff, 4.5)
    key.position.set(3, 4, 2.5)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.left   = -2; key.shadow.camera.right  = 2
    key.shadow.camera.top    =  2; key.shadow.camera.bottom = -2
    key.shadow.camera.near   = 0.1; key.shadow.camera.far   = 20
    key.shadow.bias          = -0.0005
    key.shadow.radius        = 3
    scene.add(key)
    keyLightRef.current = key

    const fill = new THREE.DirectionalLight(0xffffff, 0.6)
    fill.position.set(-3, -2, 2)
    scene.add(fill)

    function resize() {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    let rafId
    function tick(t) {
      if (uRef.current) uRef.current.uTime.value = t * 0.0004 * speedRef.current

      mesh.rotation.y  = t * 0.00018 * speedRef.current
      mesh.rotation.x  = Math.sin(t * 0.00009 * speedRef.current) * 0.12
      // Subtle physical bob — independent of rotation
      mesh.position.y  = 0.1 + Math.sin(t * 0.00047) * 0.05
                              + Math.sin(t * 0.00031) * 0.02

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  // ── Uniform updates (all real-time, no rebuild) ───────────────────────────
  useEffect(() => { if (uRef.current) uRef.current.uDispScale.value = dispScale }, [dispScale])
  useEffect(() => { if (uRef.current) uRef.current.uNoiseFreq.value = noiseFreq }, [noiseFreq])
  useEffect(() => { speedRef.current = speed * waveSpeed }, [speed, waveSpeed])

  useEffect(() => {
    if (!matRef.current) return
    matRef.current.roughness = roughness
    matRef.current.metalness = metalness
    matRef.current.color.set(color)
    matRef.current.needsUpdate = true
  }, [roughness, metalness, color])

  useEffect(() => {
    if (keyLightRef.current) keyLightRef.current.intensity = lightInt
  }, [lightInt])

  return (
    <ExperimentLayout
      label="rocky-sphere"
      title="Rocky Sphere"
      description="GPU vertex displacement with animated FBM noise. Every parameter updates in real-time on the shader."
    >
      <div className="flex gap-6 items-start max-[900px]:flex-col">

        {/* ── CONTROLS ────────────────────────────────────────────────────── */}
        <aside
          className="w-[240px] max-[900px]:w-full shrink-0 rounded-xl overflow-hidden font-mono"
          style={{ background: 'var(--color-tool-bg1)', border: '1px solid var(--color-tool-border)' }}
        >
          <div className="section border-b border-tool-border">
            <div className="sec-hdr"><span>Geometry</span></div>
            <div className="sec-body">
              <SliderRow label="Displacement" value={dispScale} min={0}   max={2} step={0.05} onChange={setDispScale} />
              <SliderRow label="Noise freq"   value={noiseFreq} min={0.3} max={3} step={0.05} onChange={setNoiseFreq} />
            </div>
          </div>

          <div className="section border-b border-tool-border">
            <div className="sec-hdr"><span>Motion</span></div>
            <div className="sec-body">
              <SliderRow label="Wave speed" value={waveSpeed} min={0} max={4} step={0.1} onChange={setWaveSpeed} />
              <SliderRow label="Rotation"   value={speed}     min={0} max={4} step={0.1} onChange={setSpeed}     />
            </div>
          </div>

          <div className="section border-b border-tool-border">
            <div className="sec-hdr"><span>Surface</span></div>
            <div className="sec-body">
              <SliderRow label="Roughness" value={roughness} min={0} max={1}  step={0.01} onChange={setRoughness} />
              <SliderRow label="Metalness" value={metalness} min={0} max={1}  step={0.01} onChange={setMetalness} />
              <SliderRow label="Light"     value={lightInt}  min={0} max={10} step={0.1}  onChange={setLightInt}  />
            </div>
          </div>

          <div className="section border-b border-tool-border">
            <div className="sec-hdr"><span>Color</span></div>
            <div className="sec-body">
              <div className="grid grid-cols-5 gap-1.5 pt-1 w-full">
                {COLORS.map(c => (
                  <button key={c.hex} title={c.label} onClick={() => setColor(c.hex)}
                    className="w-full aspect-square rounded border transition-all duration-150"
                    style={{
                      background:  c.hex,
                      borderColor: color === c.hex ? 'rgba(124,92,255,0.8)' : 'var(--color-tool-border2)',
                      boxShadow:   color === c.hex ? '0 0 0 2px rgba(124,92,255,0.3)' : 'none',
                    }} />
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="sec-hdr"><span>Background</span></div>
            <div className="sec-body">
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {BACKGROUNDS.map(b => (
                  <button key={b.hex} onClick={() => setBg(b.hex)}
                    className="font-mono text-[9px] py-1.5 rounded border transition-colors duration-150"
                    style={{
                      background:  b.hex,
                      borderColor: bg === b.hex ? 'rgba(124,92,255,0.8)' : 'var(--color-tool-border2)',
                      color:       b.hex === '#0F1115' ? '#E8EAF0' : '#0F1115',
                      boxShadow:   bg === b.hex ? '0 0 0 2px rgba(124,92,255,0.3)' : 'none',
                    }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── CANVAS ──────────────────────────────────────────────────────── */}
        <div
          ref={mountRef}
          className="flex-1 min-w-0 rounded-xl overflow-hidden max-[900px]:w-full"
          style={{
            height: 'clamp(420px, 68vh, 780px)',
            background: bg,
            transition: 'background 0.4s ease',
          }}
        />

      </div>

      {/* ── CODE EXPORT ─────────────────────────────────────────────────────── */}
      <div className="mt-8">
        <button
          onClick={() => setShowCode(v => !v)}
          className="font-mono text-[12px] px-4 py-2 rounded-lg border transition-colors duration-150"
          style={{
            background:  showCode ? 'rgba(124,92,255,0.12)' : 'var(--color-tool-bg2)',
            borderColor: showCode ? 'rgba(124,92,255,0.4)'  : 'var(--color-tool-border2)',
            color:       showCode ? 'var(--color-violet)'   : 'var(--color-tool-text2)',
          }}
        >
          {showCode ? '↑ Hide code' : '↓ Export as React component'}
        </button>

        {showCode && (
          <div className="mt-4 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-tool-border)' }}>
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ background: 'var(--color-tool-bg1)', borderColor: 'var(--color-tool-border)' }}
            >
              <span className="font-mono text-[11px] tracking-widest" style={{ color: 'var(--color-tool-text2)' }}>
                RockySphere.jsx
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateCode({ dispScale, noiseFreq, waveSpeed, speed, roughness, metalness, lightInt, color, bg }))
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="font-mono text-[11px] px-3 py-1 rounded border transition-colors duration-150"
                style={{
                  background:  copied ? 'rgba(46,230,166,0.12)' : 'var(--color-tool-bg3)',
                  borderColor: copied ? 'rgba(46,230,166,0.4)'  : 'var(--color-tool-border2)',
                  color:       copied ? 'var(--color-mint)'     : 'var(--color-tool-text2)',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre
              className="overflow-x-auto p-6 text-[12px] leading-[1.8]"
              style={{
                background: 'var(--color-tool-bg0)',
                color:      'var(--color-tool-text)',
                fontFamily: 'var(--font-mono)',
                margin: 0,
              }}
            >
              {generateCode({ dispScale, noiseFreq, waveSpeed, speed, roughness, metalness, lightInt, color, bg })}
            </pre>
          </div>
        )}
      </div>

    </ExperimentLayout>
  )
}
