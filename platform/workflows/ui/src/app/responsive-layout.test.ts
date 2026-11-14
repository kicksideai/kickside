// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const propsRef = ref<Record<string, unknown>>({ route: '/wf-980' })
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => propsRef,
  useEvents: () => vi.fn(),
}))
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  host: { confirm: vi.fn(), toast: vi.fn() },
}))
vi.mock('./canvas/WorkflowCanvas.vue', () => ({
  default: {
    name: 'WorkflowCanvas',
    props: ['workflowId'],
    template: '<main class="canvas-stub" :data-workflow-id="workflowId" />',
  },
}))
vi.mock('./list/WorkflowList.vue', () => ({
  default: { name: 'WorkflowList', template: '<main class="list-stub" />' },
}))

const WorkflowBuilder = (await import('./WorkflowBuilder.vue')).default
const HERE = dirname(fileURLToPath(import.meta.url))
const source = (path: string) => readFileSync(join(HERE, path), 'utf8')

describe('compact workflow editor layout', () => {
  it('renders the real editor route at 980px instead of replacing it', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 980 })
    const wrapper = mount(WorkflowBuilder)

    expect(wrapper.find('.canvas-stub').attributes('data-workflow-id')).toBe('wf-980')
    expect(wrapper.find('.wf-toosmall').exists()).toBe(false)
  })

  it('uses one shared responsive contract for the generic canvas surfaces', () => {
    const canvas = source('../styles/canvas.css')
    const rails = source('../styles/vueflow.css')
    const runs = source('../styles/runs.css')
    const nodes = source('../styles/nodes.css')
    const builder = source('WorkflowBuilder.vue')
    const railState = source('canvas/use-responsive-rails.ts')
    const workflowLayout = source('canvas/useCanvasLayoutActions.ts')
    const workflowView = source('canvas/WorkflowCanvasView.vue')
    const configAssist = source('../styles/config-assist.css')

    expect(builder).not.toContain('w < 1024')
    expect(builder).not.toContain('wf-toosmall')
    expect(canvas).toContain('container-type: inline-size')
    expect(canvas).toContain('@container (max-width: 1024px)')
    expect(canvas).toContain('.wf-top .wf-toolbar-compactable span { display: none; }')
    expect(canvas).toContain('@media (max-width: 640px)')
    expect(canvas).toMatch(/\.wf:has\(\.wf-canvas-root\)\s*\{[^}]*position:\s*fixed/)

    // Palette remains a layout rail. At phone widths PrimeVue Drawer owns the
    // inspector overlay, mask, focus trap, and Escape behavior.
    expect(rails).toContain('@container (max-width: 1180px)')
    expect(rails).toContain('width: min(244px, calc(100% - 56px))')
    expect(rails).toContain('width: min(312px, calc(100% - 44px))')
    expect(rails).not.toMatch(/\.wf-panel\s*\{[^}]*position:\s*absolute/)
    expect(railState).toContain('if (isCompact && inspector && paletteOpen.value) paletteOpen.value = false')
    expect(railState).toContain('async function prepareCanvasAction(): Promise<boolean>')
    expect(railState).toContain('if (!compact.value || !paletteOpen.value) return false')
    expect(railState).toContain('paletteOpen.value = false')
    expect(railState).toContain('reframeAfterRailChange()')
    expect(workflowLayout).toContain('await prepareCanvasAction()')
    expect(workflowView).toContain("import Drawer from 'primevue/drawer'")
    expect(workflowView).toContain('<Drawer')
    expect(workflowView).toContain(':modal="true"')
    expect(workflowView).toContain(':close-on-escape="true"')
    expect(workflowView).not.toContain('wf-rail-scrim')
    expect(rails).not.toContain('.wf-rail-scrim')
    expect(nodes).toMatch(/\.wfn-title[^}]*text-overflow:\s*ellipsis/)
    expect(nodes).toMatch(/\.wfn-sub[^}]*text-overflow:\s*ellipsis/)

    // Run/history overlays use the same container width rather than the browser viewport.
    expect(runs).toContain('max-width: calc(100cqw - 16px)')
    expect(runs).toContain('@container (max-width: 640px)')
    expect(configAssist).toContain('container-type: inline-size')
    expect(configAssist).toContain('@container (max-width: 300px)')
  })

  it('reflows the workflow list and delegates row popup placement outside its scrollport', () => {
    const list = source('../styles/list.css')
    const table = source('list/WorkflowTable.vue')

    expect(list).toContain('@container (max-width: 860px)')
    expect(list).toContain('grid-template-areas:')
    expect(list).toContain('"main status actions"')
    expect(list).toContain('.wf-table-head { display: none; }')
    expect(list).toMatch(/\.wf-row\s*\{[^}]*flex:\s*0 0 auto/)
    // The row menu rides the shared AnchoredPanel: composedPath dismissal and
    // fixed placement above the table's scroll and container contexts. PrimeVue
    // popups read retargeted event.target at the document and close on the
    // click that should activate an item.
    expect(table).toContain("@widgets/app/AnchoredPanel.vue")
    expect(table).not.toContain("primevue/menu")
  })

  it('keeps the shared trigger builder viewport-bound with one scroll owner', () => {
    const dialogs = source('../styles/dialogs.css')
    const panel = source('panels/AddTriggerPanel.vue')

    expect(dialogs).toMatch(/\.wf-trigger-modal\s*\{[^}]*max-height:\s*calc\(100dvh - 24px\)/)
    expect(dialogs).toMatch(/\.wf-trigger-modal\s*\{[^}]*overflow:\s*hidden/)
    expect(dialogs).toMatch(/\.wf-trigger-body\s*\{[^}]*overflow:\s*auto/)
    expect(panel).toContain("import Dialog from 'primevue/dialog'")
    expect(panel).toContain('<Dialog')
    expect(panel).toContain('dismissable-mask')
    expect(panel).toContain('class="wf-trigger-body"')
    expect(panel).not.toContain('useModalDialog')
    expect(panel).not.toContain('wf-trigger-mask')
  })
})
