import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const read = (relative: string) => fs.readFileSync(new URL(relative, import.meta.url), 'utf8')

describe('workflow interaction clarity contract', () => {
  it('keeps canvas-view and export/share commands in named menus at every width', () => {
    const toolbar = read('./canvas/CanvasToolbar.vue')
    const canvas = read('../styles/canvas.css')
    // The View and overflow menus are unconditional — not a width-triggered fallback —
    // so there is no "clip before it collapses" race left to guard against.
    expect(toolbar).toContain('aria-label="View controls"')
    expect(toolbar).toContain('aria-label="More workflow actions"')
    expect(toolbar).toContain('Fit view')
    expect(toolbar).toContain('wf-toolbar-menu-wrap')
    expect(canvas).toMatch(/\.wf-toolbar-menu-wrap\s*\{[^}]*display:\s*inline-flex/s)
  })

  it('makes every workflow handle discoverable without guessing its direction', () => {
    const node = read('./nodes/WorkflowNode.vue')
    expect(node).toContain('aria-label="Connect into step"')
    expect(node).toContain('title="Connect from output"')
    expect(node).toContain(':title="`Connect from ${p.label}`"')
  })

  it('loads reduced-motion fallbacks last without priority overrides', () => {
    const reducedMotion = read('../styles/reduced-motion.css')
    const entrypoints = [
      read('../styles.css'),
      read('../workflow-setup.css'),
      read('../workflow-embed.css'),
    ]

    expect(reducedMotion).toContain('@media (prefers-reduced-motion: reduce)')
    expect(reducedMotion).not.toContain('!important')
    for (const entrypoint of entrypoints) {
      // Reduced motion has to be the last sheet pulled in, so its overrides land
      // after every module rule they need to beat.
      const imports = [...entrypoint.matchAll(/@import '([^']+)'/g)].map(m => m[1])
      expect(imports.at(-1)).toBe('./styles/reduced-motion.css')

      // Tailwind's base follows the imports, because @import must precede every
      // other rule. That is only safe while the base sets no motion of its own.
      const afterImports = entrypoint.slice(entrypoint.lastIndexOf("@import '"))
      expect(afterImports).not.toMatch(/animation|transition|scroll-behavior/)
    }
  })

  it('delegates routine dialog placement to the Wippy-managed overlay layer', () => {
    const dialogs = [
      read('./panels/AddTriggerPanel.vue'),
      read('./canvas/ConnectionEditorDialog.vue'),
      read('./canvas/RunWithInputDialog.vue'),
      read('./runs/RunsPanel.vue'),
      read('./runs/VersionHistoryPanel.vue'),
    ]

    for (const dialog of dialogs) {
      expect(dialog).not.toMatch(/\bappend-to=|\bappendTo=/)
    }
  })

  it('lets PrimeVue restore focus before using the embedded-shadow fallback', () => {
    const canvas = read('./canvas/WorkflowCanvas.vue')
    const connectionEditor = read('./canvas/useCanvasConnectionEditor.ts')
    const overlayActions = read('./canvas/useCanvasOverlayActions.ts')
    const list = read('./list/WorkflowList.vue')
    const connections = read('./canvas/ConnectionEditorDialog.vue')
    const share = read('./share.ts')
    const focus = read('./overlay-focus.ts')

    for (const owner of [canvas, list]) {
      expect(owner).not.toContain('rememberDialogInvoker')
      expect(owner).not.toContain('restoreDialogInvoker')
      expect(owner).toContain('rememberOverlayInvoker')
      expect(owner).toContain('restoreOverlayFocusFallback')
      expect(owner).toContain('restoreOverlayFocusAfterHide')
    }
    expect(focus).toContain('window.setTimeout(resolve, delayMs)')
    expect(focus).toContain('element.getClientRects().length > 0')
    expect(focus).toContain("[aria-hidden=\"true\"]")
    expect(focus).toContain('[role="menuitem"]')
    expect(focus).toContain('isMeaningfulOverlayFocus(root?.activeElement ?? null)')
    expect(focus).toContain('!isMeaningfulOverlayFocus(root?.activeElement ?? null)')
    expect(list).toContain('@after-hide="focusDeleteFallback"')
    expect(list).toContain('if (!focusAfterDelete.value) return')
    expect(connectionEditor).toContain('function openConnections(invoker: HTMLElement | null = null)')
    expect(overlayActions).toContain('function openSim(invoker: HTMLElement | null = null)')
    expect(connectionEditor).toContain('rememberOverlayInvoker(invoker)')
    expect(overlayActions).toContain('rememberOverlayInvoker(invoker)')
    expect(canvas).toContain('button[aria-label="More workflow actions"]')
    expect(canvas).toMatch(/restoreOverlayFocusFallback[\s\S]*overlayFallback\.value \?\?/)
    expect(connections).toContain('icon="tabler:trash"')
    expect(connections).toContain(':aria-label="`Delete ${edge.label}`"')
    expect(connections).toContain('@keydown.capture.esc="onDialogEscape"')
    expect(share).toContain("querySelector('[role=\"dialog\"]')")
    expect(share).toContain('observer?.disconnect()')
  })
})
