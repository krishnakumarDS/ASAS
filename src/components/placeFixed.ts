// Places a position:fixed element (a dropdown list drawn on the page body) at window coordinates (left, top).
// The UI is zoomed as a whole on smaller windows (styles/scale.ts: html { zoom }), and a zoomed page multiplies the left / top it is given,
// so a list placed from a measured position lands up and to the left. Here the element is placed, measured, and corrected by the factor it came out wrong by,
// which is 1 (no change) without zoom. Returns that factor so a width can be corrected the same way (width / factor).
export function placeFixed(el: HTMLElement, left: number, top: number): number {
  el.style.right = 'auto'
  el.style.bottom = 'auto'
  el.style.left = `${left}px`
  el.style.top = `${top}px`
  const r = el.getBoundingClientRect()
  const fx = left > 1 && r.left > 0 ? r.left / left : 1
  const fy = top > 1 && r.top > 0 ? r.top / top : 1
  if (Math.abs(fx - 1) > 0.01) el.style.left = `${left / fx}px`
  if (Math.abs(fy - 1) > 0.01) el.style.top = `${top / fy}px`
  return Math.abs(fx - 1) > 0.01 ? fx : Math.abs(fy - 1) > 0.01 ? fy : 1
}
