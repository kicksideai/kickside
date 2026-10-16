// Registry-affecting actions (module install/uninstall, nav edits) settle in the
// backend a beat after the triggering request resolves, so a single reload can
// race ahead of the write. Callers re-pull on a short ladder — immediately, then
// at 0.4s / 1.2s / 2.5s — each supplying its own refresh action. schedule()
// cancels any in-flight ladder first; clear() is for teardown (onUnmounted).
export const REGISTRY_REFRESH_DELAYS_MS = [0, 400, 1200, 2500]

export function createRefreshLadder(run: () => void) {
  let timers: Array<ReturnType<typeof setTimeout>> = []
  function clear() {
    for (const t of timers) clearTimeout(t)
    timers = []
  }
  function schedule() {
    clear()
    timers = REGISTRY_REFRESH_DELAYS_MS.map(delay => setTimeout(run, delay))
  }
  return { schedule, clear }
}
