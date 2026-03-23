// Ordered newest → oldest by date.
// Set published: false to hide from listings without deleting the page.
const posts = [
  {
    slug:        'threejs-cube-from-zero',
    title:       'Your First Three.js Scene: A Cube From Zero',
    date:        'March 22, 2026',
    description: 'Build a rotating 3D cube step by step: scene setup, geometry, lighting, and materials, each concept paired with an interactive demo you can poke at directly in the browser.',
    tags:        ['Three.js', 'WebGL', '3D'],
    readTime:    '9 min read',
    published:   true,
  },
  {
    slug:        'easing-curves-explained',
    title:       'Easing Curves Explained: The Secret Behind Great Animation',
    date:        'March 18, 2026',
    description: 'A deep dive into cubic-bezier curves: how the four values map time to progress, why overshoot feels physical, and five curves worth bookmarking — with interactive demos for each concept.',
    tags:        ['CSS', 'Animation', 'Motion'],
    readTime:    '7 min read',
    published:   true,
  },
  {
    slug:        'text-animation-in-react',
    title:       'Building Letter-by-Letter Text Animations in React',
    date:        'March 15, 2026',
    description: 'A deep dive into the mechanics behind character-level CSS animations: text splitting, stagger delays, wave math, and overshoot easing, with interactive examples you can tweak in the browser.',
    tags:        ['React', 'CSS Animations', 'Motion'],
    readTime:    '8 min read',
    published:   true,
  },
]

export default posts
