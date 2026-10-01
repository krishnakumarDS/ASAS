// In-memory only — false again on every full page load, since the bundle re-evaluates from
// scratch. In-app (router) navigation keeps this module alive, so it stays true until the next
// real reload. Same pattern as EA Portal: every fresh load passes through the welcome screen.
let entered = false

export function markEntered() {
  entered = true
}

export function hasEnteredThisLoad() {
  return entered
}

/** Back to the welcome screen (there is no sign-out: identity belongs to the Power Platform host). */
export function markLeft() {
  entered = false
}
