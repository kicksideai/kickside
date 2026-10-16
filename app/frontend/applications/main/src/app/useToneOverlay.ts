import type { Ref } from 'vue'

// The shell owns the live base-tone overlay for its document and web-component
// shadows. Each root gets one adopted stylesheet so later-mounted surfaces
// receive the same tone without reaching into a leaf module.
export function useToneOverlay(contentMain: Ref<HTMLElement | null>) {
  const toneSheets = new WeakMap<Document | ShadowRoot, CSSStyleSheet>()
  let toneOverlayShadowCss = ''
  let toneObserver: MutationObserver | null = null
  let toneReapplyTimer: ReturnType<typeof setTimeout> | null = null

  function toneSheetFor(root: Document | ShadowRoot): CSSStyleSheet {
    let sheet = toneSheets.get(root)
    if (!sheet) { sheet = new CSSStyleSheet(); toneSheets.set(root, sheet) }
    if (!root.adoptedStyleSheets.includes(sheet)) root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
    return sheet
  }

  function setToneSheet(root: Document | ShadowRoot, css: string) {
    if (!css) { toneSheets.get(root)?.replaceSync(''); return }
    toneSheetFor(root).replaceSync(css)
  }

  function forEachShadow(fn: (sr: ShadowRoot) => void) {
    const walk = (node: ParentNode) => {
      node.querySelectorAll('*').forEach((el) => {
        const sr = (el as HTMLElement).shadowRoot
        if (sr) { fn(sr); walk(sr) }
      })
    }
    walk(document)
  }

  function applyToneOverlay(hostCss: string, shadowCss: string) {
    toneOverlayShadowCss = shadowCss
    setToneSheet(document, hostCss)
    forEachShadow((sr) => setToneSheet(sr, shadowCss))
  }

  function onToneApply(event: Event) {
    const detail = (event as CustomEvent).detail ?? {}
    applyToneOverlay(String(detail.hostCss ?? ''), String(detail.shadowCss ?? ''))
  }

  // New surfaces can mount after the theme changes. Only roots without our
  // sheet need work; adopting it does not mutate the observed light DOM.
  function scheduleToneReapply() {
    if (!toneOverlayShadowCss) return
    if (toneReapplyTimer) clearTimeout(toneReapplyTimer)
    toneReapplyTimer = setTimeout(() => {
      forEachShadow((sr) => { if (!toneSheets.has(sr)) setToneSheet(sr, toneOverlayShadowCss) })
    }, 50)
  }

  function start() {
    window.addEventListener('kickside:tone-apply', onToneApply)
    toneObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) { scheduleToneReapply(); return }
        }
      }
    })
    toneObserver.observe(contentMain.value ?? document.body, { childList: true, subtree: true })
  }

  function stop() {
    window.removeEventListener('kickside:tone-apply', onToneApply)
    toneObserver?.disconnect()
    toneObserver = null
    if (toneReapplyTimer) clearTimeout(toneReapplyTimer)
  }

  return { start, stop }
}
