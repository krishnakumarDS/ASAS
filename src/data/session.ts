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

/** "Log out": returns to the welcome/login screen. The Power Platform session itself belongs to the host, so it is not ended. */
export function markLeft() {
  entered = false
}
