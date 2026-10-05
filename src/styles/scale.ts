// Keeps the desktop layout identical across displays.
//
// Windows laptops commonly use 125–150% display scaling, so a 1920px screen only gives the page ~1280–1536 CSS px.
// Below REF_WIDTH the layout would switch to its narrower breakpoints (fewer columns, tighter grids) and look different from
// a Mac at 1440px. Instead of changing the layout, shrink the whole UI proportionally so the page always lays out at
// REF_WIDTH. Phones/tablets (below DESKTOP_MIN) keep their own responsive layout, and wider screens are untouched.
const REF_WIDTH = 1440
const DESKTOP_MIN = 1000
const MIN_ZOOM = 0.8 // never shrink text below 80%

export function applyUiScale() {
  const w = window.innerWidth
  const z = w >= DESKTOP_MIN && w < REF_WIDTH ? Math.max(MIN_ZOOM, Math.round((w / REF_WIDTH) * 1000) / 1000) : 1
  const root = document.documentElement
  root.style.zoom = z === 1 ? '' : String(z)
  root.style.setProperty('--zoom', String(z)) // lets vw/vh based sizes cancel the zoom (see tokens.css)
}

export function initUiScale() {
  applyUiScale()
  window.addEventListener('resize', applyUiScale)
}
