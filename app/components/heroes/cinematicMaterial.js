import * as THREE from 'three'

const TEX = 512

// ── Noise primitives ──────────────────────────────────────────────────────────

function hash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function valueNoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix,        fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  return (
    hash(ix,     iy)     * (1 - ux) * (1 - uy) +
    hash(ix + 1, iy)     * ux       * (1 - uy) +
    hash(ix,     iy + 1) * (1 - ux) * uy       +
    hash(ix + 1, iy + 1) * ux       * uy
  )
}

function fbm(x, y, octaves = 6, lacunarity = 2.07, gain = 0.48) {
  let v = 0, a = 0.5, f = 1, max = 0
  for (let i = 0; i < octaves; i++) {
    v   += valueNoise(x * f, y * f) * a
    max += a
    a   *= gain
    f   *= lacunarity
  }
  return v / max
}

// ── Texture generators ────────────────────────────────────────────────────────

function makeRoughnessMap() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = TEX
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(TEX, TEX)

  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      const u = x / TEX, v = y / TEX
      const coarse = fbm(u * 3.5, v * 3.5, 4)
      const fine   = fbm(u * 9.0 + 5.3, v * 9.0 + 2.7, 6)
      const micro  = fbm(u * 22.0 + 11.1, v * 22.0 + 8.4, 3)
      const raw      = coarse * 0.35 + fine * 0.50 + micro * 0.15
      const roughness = 0.72 + raw * 0.24
      const px = Math.min(255, Math.round(roughness * 255))
      const i = (y * TEX + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = px
      img.data[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(canvas)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 2)
  return t
}

function makeNormalMap() {
  const heights = new Float32Array(TEX * TEX)
  const scale = 7.5, octaves = 7

  for (let y = 0; y < TEX; y++)
    for (let x = 0; x < TEX; x++)
      heights[y * TEX + x] = fbm((x / TEX) * scale, (y / TEX) * scale, octaves)

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = TEX
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(TEX, TEX)
  const str = 3.2

  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      const xp = Math.min(TEX - 1, x + 1), xn = Math.max(0, x - 1)
      const yp = Math.min(TEX - 1, y + 1), yn = Math.max(0, y - 1)
      const dx = (heights[y * TEX + xp] - heights[y * TEX + xn]) * str
      const dy = (heights[yp * TEX + x] - heights[yn * TEX + x]) * str
      const dz = 1.0
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
      const i = (y * TEX + x) * 4
      img.data[i]     = Math.round((-dx / len * 0.5 + 0.5) * 255)
      img.data[i + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255)
      img.data[i + 2] = Math.round(( dz / len * 0.5 + 0.5) * 255)
      img.data[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(canvas)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 2)
  return t
}

function makeAOMap() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = TEX
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(TEX, TEX)

  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      const u = x / TEX, v = y / TEX
      const h  = fbm(u * 4.5, v * 4.5, 5)
      const ao = 0.50 + Math.pow(h, 0.55) * 0.50
      const px = Math.min(255, Math.round(ao * 255))
      const i = (y * TEX + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = px
      img.data[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(canvas)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(1, 1)
  return t
}

// ── Material factory ──────────────────────────────────────────────────────────

export function createCinematicMaterial() {
  const roughnessMap = makeRoughnessMap()
  const normalMap    = makeNormalMap()
  const aoMap        = makeAOMap()

  const mat = new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color('#121212'),
    roughness:          0.88,
    metalness:          0.12,
    roughnessMap,
    normalMap,
    normalScale:        new THREE.Vector2(0.55, 0.55),
    aoMap,
    aoMapIntensity:     0.65,
    clearcoat:          0.12,
    clearcoatRoughness: 0.90,
    envMapIntensity:    1.1,
  })

  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vWPos;
       varying vec3 vWNormal;`
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       vWPos    = (modelMatrix * vec4(position, 1.0)).xyz;
       vWNormal = normalize(mat3(modelMatrix) * normal);`
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vWPos;
       varying vec3 vWNormal;`
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      `#include <output_fragment>
       vec3  toEye  = normalize(cameraPosition - vWPos);
       float cosA   = abs(dot(normalize(vWNormal), toEye));
       float fresnel = pow(1.0 - cosA, 4.5);
       gl_FragColor.rgb += fresnel * vec3(0.08, 0.08, 0.10) * 0.7;
      `
    )
  }

  mat.customProgramCacheKey = () => 'cinematic-v1'
  return mat
}

export function applyUV2(geometry) {
  if (!geometry.attributes.uv2 && geometry.attributes.uv) {
    geometry.setAttribute('uv2', geometry.attributes.uv)
  }
}
