// Ordered newest → oldest. Homepage always shows the first 3.
const experiments = [
  {
    href:   '/experiments/bezier-editor',
    icon:   '◈',
    title:  'Bezier Editor',
    desc:   'Interactive cubic-bezier curve editor. Drag handles, tweak values, pick a preset, preview your easing on a live animation, and copy the CSS.',
    tags:   ['CSS Easing', 'SVG', 'Motion'],
    accent: '124,92,255',
  },
  {
    href:   '/experiments/text-animator',
    icon:   '✦',
    title:  'Text Animator',
    desc:   'Letter-by-letter animation studio. Control opacity, translate, scale, rotate, blur, stagger and easing with a live preview window.',
    tags:   ['CSS Animations', 'Typography', 'Motion'],
    accent: '46,230,166',
  },
  {
    href:   '/experiments/wire-studio',
    icon:   '🔵',
    title:  'Wire Studio',
    desc:   'Interactive Three.js wireframe sphere editor with custom GLSL rim lighting, real-time displacement, edge scalloping, and presets.',
    tags:   ['Three.js', 'GLSL', 'Wireframe'],
    accent: '34,211,238',
  },
  {
    href:   '/experiments/morphing-blob',
    icon:   '🫀',
    title:  'Morphing Blob',
    desc:   '3D Three.js organic blob with layered FBM noise deformation, drag-to-orbit controls, palette switching, and panic mode.',
    tags:   ['Three.js', 'GLSL', 'FBM Noise'],
    accent: '124,92,255',
  },
  {
    href:   '/experiments/blob-editor',
    icon:   '🟠',
    title:  'Blob Editor',
    desc:   '2D WebGL blob renderer with real-time SDF shape morphing, swirl color mixing, halo glow layers, and per-frame PNG export.',
    tags:   ['WebGL', 'GLSL', 'Canvas API'],
    accent: '245,160,64',
  },
]

export default experiments
