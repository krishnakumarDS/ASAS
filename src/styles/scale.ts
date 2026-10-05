// Keeps the desktop layout identical across displays AND window sizes.
//
// The UI is designed for a ~1440 x 760 CSS-px page area (a typical Mac browser window). Windows laptops usually use 125–150%
// display scaling and have taller browser chrome, so the same window can give e.g. 1460 x 625 CSS px: the width is fine but
// the height is ~20% short, which makes the sidebar overflow and the pages wrap differently. Instead of changing the layout we
// shrink the whole UI proportionally (by whichever of width/height is short) so it always lays out like the reference size.
// Phones/tablets (below DESKTOP_MIN) keep their own responsive layout; larger windows are never enlarged.
const REF_WIDTH = 1440
const REF_HEIGHT = 760
const DESKTOP_MIN = 1000
const MIN_ZOOM = 0.67 // never shrink below 67%

export function applyUiScale() {
  const w = window.innerWidth, h = window.innerHeight
  let z = 1
  if (w >= DESKTOP_MIN) z = Math.max(MIN_ZOOM, Math.min(1, w / REF_WIDTH, h / REF_HEIGHT))
  z = Math.round(z * 1000) / 1000
  const root = document.documentElement
  root.style.zoom = z === 1 ? '' : String(z)
  root.style.setProperty('--zoom', String(z)) // lets vw/vh based sizes cancel the zoom (see tokens.css)
}

export function initUiScale() {
  applyUiScale()
  window.addEventListener('resize', applyUiScale)
}
