/* ═══════════════════════════════════════════════════════════════════════════════
   ROCKY SPHERE — jeanphilippebelley.com
   ───────────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ───────────────────────────────────────────────────────────────────────────────

   <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>

   <canvas id="c"></canvas>

   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   ───────────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ───────────────────────────────────────────────────────────────────────────────

   * { margin: 0; padding: 0; box-sizing: border-box; }
   body { background: #EDEAE4; overflow: hidden; }
   canvas { display: block; }
   #credit {
     position: fixed;
     bottom: 20px; right: 24px;
     font-family: 'Space Grotesk', sans-serif;
     font-size: 13px;
     font-weight: 700;
     letter-spacing: 0.06em;
     color: rgba(15,17,21,0.25);
     text-decoration: none;
     transition: color 0.2s;
   }
   #credit span { color: #7C5CFF; }
   #credit:hover { color: rgba(15,17,21,0.6); }

   ═══════════════════════════════════════════════════════════════════════════════ */

const canvas = document.getElementById('c')

// ─── Renderer ─────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace

// ─── Scene / Camera ───────────────────────────────────────────────────────────
const scene  = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
camera.position.set(0, 0.15, 5)

// ─── Noise ────────────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + t * (b - a) }

function hash(x, y, z) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return n - Math.floor(n)
}

function valueNoise(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z)
  const fx = x - ix, fy = y - iy, fz = z - iz
  const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy), uz = fz*fz*(3-2*fz)
  const v = (dx, dy, dz) => hash(ix+dx, iy+dy, iz+dz)
  return lerp(
    lerp(lerp(v(0,0,0), v(1,0,0), ux), lerp(v(0,1,0), v(1,1,0), ux), uy),
    lerp(lerp(v(0,0,1), v(1,0,1), ux), lerp(v(0,1,1), v(1,1,1), ux), uy),
    uz
  )
}

function fbm(x, y, z, octaves = 8) {
  let val = 0, amp = 0.5, freq = 1
  for (let o = 0; o < octaves; o++) {
    val  += amp * valueNoise(x * freq, y * freq, z * freq)
    amp  *= 0.48
    freq *= 2.07
  }
  return val
}

// ─── Sphere geometry with displaced vertices ──────────────────────────────────
const geo = new THREE.SphereGeometry(1, 256, 256)
const pos = geo.attributes.position

for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
  const r  = Math.sqrt(x*x + y*y + z*z)
  const nx = x/r, ny = y/r, nz = z/r

  // Large rocky base shapes
  const n1 = fbm(nx * 1.6,       ny * 1.6,       nz * 1.6,       6)
  // Fine sharp cracks + spikes
  const n2 = fbm(nx * 3.8 + 7.3, ny * 3.8 + 7.3, nz * 3.8 + 7.3, 5)
  // Pointed peaks
  const n3 = Math.pow(Math.abs(fbm(nx * 6 + 2, ny * 6 + 2, nz * 6 + 2, 4) - 0.5) * 2, 1.8)

  const disp = n1 * 0.42 + n2 * 0.18 + n3 * 0.22

  pos.setXYZ(i, nx * (1 + disp), ny * (1 + disp), nz * (1 + disp))
}

pos.needsUpdate = true
geo.computeVertexNormals()

// ─── Material ─────────────────────────────────────────────────────────────────
const mat = new THREE.MeshStandardMaterial({
  color:    0x090909,
  roughness: 0.85,
  metalness: 0.12,
})

const mesh = new THREE.Mesh(geo, mat)
mesh.castShadow    = true
mesh.position.y    = 0.1
scene.add(mesh)

// ─── Ground shadow plane ──────────────────────────────────────────────────────
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 12),
  new THREE.ShadowMaterial({ opacity: 0.18 })
)
ground.rotation.x    = -Math.PI / 2
ground.position.y    = -1.65
ground.receiveShadow = true
scene.add(ground)

// ─── Lights ───────────────────────────────────────────────────────────────────
// Soft ambient
scene.add(new THREE.AmbientLight(0xffffff, 1.2))

// Key light — top right, creates the specular highlight
const key = new THREE.DirectionalLight(0xffffff, 4.5)
key.position.set(3, 4, 2.5)
key.castShadow = true
key.shadow.mapSize.set(2048, 2048)
key.shadow.camera.near   = 0.1
key.shadow.camera.far    = 20
key.shadow.camera.left   = -3
key.shadow.camera.right  = 3
key.shadow.camera.top    = 3
key.shadow.camera.bottom = -3
key.shadow.bias          = -0.0005
key.shadow.radius        = 3
scene.add(key)

// Soft fill from bottom left
const fill = new THREE.DirectionalLight(0xffffff, 0.6)
fill.position.set(-3, -2, 2)
scene.add(fill)

// ─── Resize ───────────────────────────────────────────────────────────────────
function resize() {
  const W = window.innerWidth, H = window.innerHeight
  renderer.setSize(W, H)
  camera.aspect = W / H
  camera.updateProjectionMatrix()
}
window.addEventListener('resize', resize)
resize()

// ─── Animation loop ───────────────────────────────────────────────────────────
function tick(t) {
  mesh.rotation.y = t * 0.00018
  mesh.rotation.x = Math.sin(t * 0.00009) * 0.12
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
