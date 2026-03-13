'use client'

import { useEffect } from 'react'

export default function MorphingBlob() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('c'), antialias: true})
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setSize(innerWidth, innerHeight)
      renderer.shadowMap.enabled = true

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100)
      camera.position.set(0, 0, 7)

      const bgGeo = new THREE.SphereGeometry(40, 8, 8)
      const bgMat = new THREE.MeshBasicMaterial({color: 0x060c14, side: THREE.BackSide})
      const bgMesh = new THREE.Mesh(bgGeo, bgMat)
      scene.add(bgMesh)

      scene.add(new THREE.AmbientLight(0xffffff, 0.2))
      const keyLight = new THREE.PointLight(0xffffff, 3, 30)
      keyLight.position.set(5, 6, 5)
      scene.add(keyLight)
      const fillLight = new THREE.PointLight(0x0044ff, 1.5, 20)
      fillLight.position.set(-5, -3, 2)
      scene.add(fillLight)
      const rimLight = new THREE.PointLight(0x00ffcc, 1, 15)
      rimLight.position.set(0, -5, -5)
      scene.add(rimLight)

      const palettes = {
        alien: {a: new THREE.Color(0x00ffcc), b: new THREE.Color(0x88ff00), light: 0x00ffcc, bg: 0x040a06},
        lava:  {a: new THREE.Color(0xff2200), b: new THREE.Color(0xff8800), light: 0xff4400, bg: 0x0d0400},
        void:  {a: new THREE.Color(0x8800ff), b: new THREE.Color(0xff00aa), light: 0x6600cc, bg: 0x04000d},
        ocean: {a: new THREE.Color(0x0088ff), b: new THREE.Color(0x00ddff), light: 0x00aaff, bg: 0x020814},
        toxic: {a: new THREE.Color(0x44ff00), b: new THREE.Color(0xffee00), light: 0x88ff00, bg: 0x040800},
      }

      const SEGS = 120
      const blobGeo = new THREE.SphereGeometry(1.8, SEGS, SEGS)
      const blobMat = new THREE.MeshStandardMaterial({
        color: 0x00ffcc,
        roughness: 0.15,
        metalness: 0.6,
        envMapIntensity: 1,
        wireframe: false,
      })
      const blob = new THREE.Mesh(blobGeo, blobMat)
      scene.add(blob)

      const posAttr = blobGeo.attributes.position
      const origPos = new Float32Array(posAttr.array.length)
      for (let i = 0; i < posAttr.array.length; i++) origPos[i] = posAttr.array[i]
      const count = posAttr.count

      function hash(n) {
        let x = Math.sin(n) * 43758.5453123
        return x - Math.floor(x)
      }
      function noise3(x, y, z) {
        const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z)
        const fx = x - ix, fy = y - iy, fz = z - iz
        const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy), uz = fz*fz*(3-2*fz)
        const n000 = hash(ix + iy*57 + iz*113)
        const n100 = hash(ix+1 + iy*57 + iz*113)
        const n010 = hash(ix + (iy+1)*57 + iz*113)
        const n110 = hash(ix+1 + (iy+1)*57 + iz*113)
        const n001 = hash(ix + iy*57 + (iz+1)*113)
        const n101 = hash(ix+1 + iy*57 + (iz+1)*113)
        const n011 = hash(ix + (iy+1)*57 + (iz+1)*113)
        const n111 = hash(ix+1 + (iy+1)*57 + (iz+1)*113)
        return (
          (1-uz)*((1-uy)*((1-ux)*n000 + ux*n100) + uy*((1-ux)*n010 + ux*n110)) +
          uz*((1-uy)*((1-ux)*n001 + ux*n101) + uy*((1-ux)*n011 + ux*n111))
        ) * 2 - 1
      }

      function fbm(x, y, z, oct) {
        let v = 0, amp = 0.5, freq = 1, max = 0
        for (let i = 0; i < oct; i++) {
          v += noise3(x*freq, y*freq, z*freq) * amp
          max += amp; amp *= 0.5; freq *= 2.1
        }
        return v / max
      }

      let p = {bspeed:1.0, bdepth:0.35, freq:1.8, chaos:0.55, tent:0.3, rot:0.4, spike:0.0}

      const clock = new THREE.Clock()
      const tmpV = new THREE.Vector3()

      function deformBlob(t) {
        const breath = 1 + Math.sin(t * p.bspeed * 2) * p.bdepth * 0.4
        const slowT = t * 0.3
        for (let i = 0; i < count; i++) {
          const ox = origPos[i*3], oy = origPos[i*3+1], oz = origPos[i*3+2]
          tmpV.set(ox, oy, oz)
          const len = tmpV.length()
          const nx = ox/len, ny = oy/len, nz = oz/len
          const n1 = fbm(nx * p.freq + slowT, ny * p.freq + slowT*0.7, nz * p.freq, 4)
          const n2 = fbm(nx * p.freq*1.7 - slowT*0.5, ny * p.freq*1.7, nz * p.freq*1.7 + slowT, 3)
          const tentacle = Math.max(0, n1) * p.tent * 1.2
          const spike = Math.pow(Math.abs(n1), 1 - p.spike * 0.8) * Math.sign(n1)
          const disp = (spike * p.chaos + n2 * p.chaos * 0.4 + tentacle) * breath
          posAttr.setXYZ(i, ox + nx * disp, oy + ny * disp, oz + nz * disp)
        }
        posAttr.needsUpdate = true
        blobGeo.computeVertexNormals()
      }

      let drag = false, px = 0, py = 0, rotX = 0, rotY = 0
      const cv = document.getElementById('c')
      cv.addEventListener('mousedown', e => { drag = true; px = e.clientX; py = e.clientY })
      cv.addEventListener('mouseup', () => drag = false)
      cv.addEventListener('mousemove', e => {
        if (!drag) return
        rotY += (e.clientX - px) * 0.005; px = e.clientX
        rotX += (e.clientY - py) * 0.005; py = e.clientY
      })
      cv.addEventListener('wheel', e => { camera.position.z = Math.max(3, Math.min(18, camera.position.z + e.deltaY * 0.01)) })
      cv.addEventListener('touchstart', e => { px = e.touches[0].clientX; py = e.touches[0].clientY })
      cv.addEventListener('touchmove', e => {
        rotY += (e.touches[0].clientX - px) * 0.007; px = e.touches[0].clientX
        rotX += (e.touches[0].clientY - py) * 0.007; py = e.touches[0].clientY
        e.preventDefault()
      }, {passive:false})

      function applyPalette(name) {
        const pal = palettes[name]
        blobMat.color.copy(pal.a)
        fillLight.color.set(pal.b)
        rimLight.color.set(pal.light)
        keyLight.color.set(pal.light)
        bgMesh.material.color.set(pal.bg)
      }
      applyPalette('alien')

      let animRaf
      function animate() {
        animRaf = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        deformBlob(t)
        blob.rotation.y += p.rot * 0.004
        blob.rotation.x += p.rot * 0.0015
        blob.rotation.y += rotY * 0.06; rotY *= 0.88
        blob.rotation.x += rotX * 0.06; rotX *= 0.88
        keyLight.position.x = Math.sin(t*0.4) * 6
        keyLight.position.z = Math.cos(t*0.4) * 5
        fillLight.position.x = Math.cos(t*0.3) * -5
        renderer.render(scene, camera)
      }
      animate()

      const handleResize = () => {
        camera.aspect = innerWidth/innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(innerWidth, innerHeight)
      }
      window.addEventListener('resize', handleResize)

      function bindSlider(id, key, valId) {
        const el = document.getElementById(id)
        el.addEventListener('input', () => {
          p[key] = parseFloat(el.value)
          document.getElementById(valId).textContent = p[key].toFixed(2)
        })
      }
      bindSlider('s-bspeed', 'bspeed', 'v-bspeed')
      bindSlider('s-bdepth', 'bdepth', 'v-bdepth')
      bindSlider('s-freq',   'freq',   'v-freq')
      bindSlider('s-chaos',  'chaos',  'v-chaos')
      bindSlider('s-tent',   'tent',   'v-tent')
      bindSlider('s-rot',    'rot',    'v-rot')
      bindSlider('s-spike',  'spike',  'v-spike')

      document.getElementById('s-pal').addEventListener('change', e => applyPalette(e.target.value))

      document.getElementById('btn-panic').addEventListener('click', () => {
        p.bspeed = 3.5; p.bdepth = 0.9; p.chaos = 1.3; p.tent = 0.85; p.spike = 0.7; p.rot = 1.8
        document.getElementById('s-bspeed').value = p.bspeed
        document.getElementById('s-bdepth').value = p.bdepth
        document.getElementById('s-chaos').value  = p.chaos
        document.getElementById('s-tent').value   = p.tent
        document.getElementById('s-spike').value  = p.spike
        document.getElementById('s-rot').value    = p.rot
        ;['bspeed','bdepth','chaos','tent','spike','rot'].forEach(k => {
          document.getElementById('v-'+k).textContent = p[k].toFixed(2)
        })
      })

      document.getElementById('btn-calm').addEventListener('click', () => {
        p.bspeed = 0.5; p.bdepth = 0.15; p.chaos = 0.2; p.tent = 0.05; p.spike = 0.0; p.rot = 0.15
        document.getElementById('s-bspeed').value = p.bspeed
        document.getElementById('s-bdepth').value = p.bdepth
        document.getElementById('s-chaos').value  = p.chaos
        document.getElementById('s-tent').value   = p.tent
        document.getElementById('s-spike').value  = p.spike
        document.getElementById('s-rot').value    = p.rot
        ;['bspeed','bdepth','chaos','tent','spike','rot'].forEach(k => {
          document.getElementById('v-'+k).textContent = p[k].toFixed(2)
        })
      })

      // store cleanup refs
      script._cleanup = () => {
        cancelAnimationFrame(animRaf)
        window.removeEventListener('resize', handleResize)
      }
    }
    document.body.appendChild(script)

    return () => {
      if (script._cleanup) script._cleanup()
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  const sliderClass = "w-full h-[3px] appearance-none bg-[rgba(255,255,255,0.18)] rounded-[2px] outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[13px] [&::-webkit-slider-thumb]:h-[13px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"

  return (
    <div className="relative bg-black overflow-hidden font-sans w-screen h-screen">
      <canvas id="c" className="block w-screen h-screen" />

      {/* Floating UI panel */}
      <div className="absolute top-4 right-4 bg-[rgba(255,255,255,0.05)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.12)] rounded-[14px] p-4 w-[230px] text-white text-[13px]">
        <h3 className="text-[14px] font-medium mb-[14px] tracking-[0.4px]">Morphing Blob</h3>

        {[
          { id:'bspeed', label:'Breath speed', val:'1.0',  min:'0.1', max:'4',   step:'0.1'  },
          { id:'bdepth', label:'Breath depth', val:'0.35', min:'0',   max:'1',   step:'0.01' },
          { id:'freq',   label:'Noise freq',   val:'1.8',  min:'0.2', max:'5',   step:'0.1'  },
          { id:'chaos',  label:'Noise chaos',  val:'0.55', min:'0',   max:'1.5', step:'0.05' },
          { id:'tent',   label:'Tentacles',    val:'0.3',  min:'0',   max:'1',   step:'0.05' },
        ].map(s => (
          <div key={s.id} className="mb-[13px]">
            <label className="flex justify-between mb-[5px] text-[rgba(255,255,255,0.6)]">
              {s.label} <span id={`v-${s.id}`} className="text-white font-medium">{s.val}</span>
            </label>
            <input type="range" id={`s-${s.id}`} min={s.min} max={s.max} step={s.step} defaultValue={s.val} className={sliderClass} />
          </div>
        ))}

        <hr className="border-none border-t border-[rgba(255,255,255,0.1)] my-[13px]" />

        {[
          { id:'rot',   label:'Rotation speed', val:'0.4', min:'0', max:'2',   step:'0.05' },
          { id:'spike', label:'Spikes',          val:'0.0', min:'0', max:'1',   step:'0.05' },
        ].map(s => (
          <div key={s.id} className="mb-[13px]">
            <label className="flex justify-between mb-[5px] text-[rgba(255,255,255,0.6)]">
              {s.label} <span id={`v-${s.id}`} className="text-white font-medium">{s.val}</span>
            </label>
            <input type="range" id={`s-${s.id}`} min={s.min} max={s.max} step={s.step} defaultValue={s.val} className={sliderClass} />
          </div>
        ))}

        <hr className="border-none border-t border-[rgba(255,255,255,0.1)] my-[13px]" />

        <div className="mb-[13px]">
          <label className="flex justify-between mb-[5px] text-[rgba(255,255,255,0.6)]">Palette</label>
          <select id="s-pal" className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white rounded-[7px] px-2 py-[5px] text-[13px] outline-none [&_option]:bg-[#111]">
            <option value="alien">Alien (cyan/lime)</option>
            <option value="lava">Lava (red/orange)</option>
            <option value="void">Void (purple/black)</option>
            <option value="ocean">Ocean (blue/teal)</option>
            <option value="toxic">Toxic (green/yellow)</option>
          </select>
        </div>

        <hr className="border-none border-t border-[rgba(255,255,255,0.1)] my-[13px]" />

        <button id="btn-panic" className="w-full py-[7px] rounded-[7px] mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-[13px] cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.18)]">
          Panic mode 🫀
        </button>
        <button id="btn-calm" className="w-full py-[7px] rounded-[7px] mt-[6px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-[13px] cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.18)]">
          Calm down 🫧
        </button>
      </div>

      <div className="absolute bottom-[14px] left-1/2 -translate-x-1/2 text-[rgba(255,255,255,0.25)] text-[12px] pointer-events-none">
        Drag to orbit · Scroll to zoom
      </div>
    </div>
  )
}
