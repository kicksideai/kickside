<script setup lang="ts">
import Button from 'primevue/button'
import ButtonGroup from 'primevue/buttongroup'
import { computed, nextTick, ref, type ComponentPublicInstance } from 'vue'
import { Icon } from '@iconify/vue'
import { ADD_TRIGGER_PUBLISH_FIRST, canAddTrigger } from '../panels/add-trigger'

// The editor's command surface. Primary actions (Undo/Redo, Add trigger, Run, Publish)
// stay explicit at every width. Canvas-view controls (Fit/Auto layout/Layout direction/
// Hide steps) collapse into one View menu; Export and Share — the least frequent
// commands — collapse into one overflow menu. Past runs and Versions (renamed from
// History, which read as a near-synonym of Past runs) are their own clearly labeled
// buttons. Commands remain owned by WorkflowCanvas — this component only composes their
// presentation, so there is still one state/mutation path.
const props = defineProps<{
  paletteOpen: boolean
  countLabel: string
  canUndo: boolean
  canRedo: boolean
  viewingRun: boolean
  layoutDir: 'TB' | 'LR'
  runsOpen: boolean
  runActive: boolean
  simBusy: boolean
  publishedVersion: number
  exportBusy: boolean
  historyOpen: boolean
  publishBusy: boolean
}>()

const addTriggerAvailable = computed(() => canAddTrigger(props.publishedVersion))
const addTriggerTitle = computed(() => addTriggerAvailable.value
  ? 'Choose when this Workflow runs'
  : ADD_TRIGGER_PUBLISH_FIRST)
const addTriggerAriaLabel = computed(() => addTriggerAvailable.value
  ? 'Add trigger'
  : `Add trigger unavailable. ${ADD_TRIGGER_PUBLISH_FIRST}.`)

const emit = defineEmits<{
  back: []
  'toggle-palette': []
  undo: []
  redo: []
  fit: []
  'auto-layout': []
  'toggle-direction': []
  // A command that opens a surface reports the element that invoked it, so the canvas can
  // anchor that surface and return focus here once it closes. A command dispatched from a
  // menu reports the menu's own opener, which is what remains on screen.
  'edit-connections': [invoker: HTMLElement | null]
  'toggle-runs': [invoker: HTMLElement | null]
  'add-trigger': [invoker: HTMLElement | null]
  share: [invoker: HTMLElement | null]
  'run-published': [invoker: HTMLElement | null]
  run: [invoker: HTMLElement | null]
  export: []
  'toggle-history': [invoker: HTMLElement | null]
  publish: []
}>()

function invokerOf(event: Event): HTMLElement | null {
  return event.currentTarget instanceof HTMLElement ? event.currentTarget : null
}

// One open/close/keyboard-nav contract shared by every toolbar dropdown (View, and the
// Export/Share overflow). The menus stay in this component's own DOM so their items are
// reachable from the toolbar's focus order at any width.
function useToolbarMenu() {
  const open = ref(false)
  const button = ref<HTMLButtonElement | null>(null)
  const menu = ref<HTMLElement | null>(null)

  async function toggle() {
    open.value = !open.value
    if (open.value) {
      await nextTick()
      menu.value?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
    }
  }
  function close(restoreFocus = false) {
    if (!open.value) return
    open.value = false
    if (restoreFocus) nextTick(() => button.value?.focus())
  }
  // A chosen command returns focus to the stable opener before emitting; a command that
  // opens a dialog may then move focus into that dialog, while an immediate command
  // retains a valid keyboard position in the toolbar.
  async function choose(run: () => void) {
    open.value = false
    await nextTick()
    button.value?.focus()
    run()
  }
  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return
    const buttons = Array.from(menu.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || [])
    if (!buttons.length) return
    event.preventDefault()
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? buttons.length - 1
        : event.key === 'ArrowDown' ? (current + 1 + buttons.length) % buttons.length
          : (current - 1 + buttons.length) % buttons.length
    buttons[next].focus()
  }
  return { open, button, menu, toggle, close, choose, onKeydown }
}

const viewMenu = useToolbarMenu()
const overflowMenu = useToolbarMenu()
// Only one toolbar dropdown is open at a time — opening the other closes whichever is
// already open, the standard single-open-menu contract.
async function toggleView() { overflowMenu.close(); await viewMenu.toggle() }
async function toggleOverflow() { viewMenu.close(); await overflowMenu.toggle() }

// `ref="name"` string bindings only resolve a top-level setup binding, not a nested
// property path — a function ref assigns into the menu's own button/menu refs instead.
// A Button ref is the component instance, so the host element comes off `$el`.
type TemplateRefEl = Element | ComponentPublicInstance | null
function hostElement(el: TemplateRefEl): HTMLElement | null {
  if (el instanceof HTMLElement) return el
  const host = (el as ComponentPublicInstance | null)?.$el
  return host instanceof HTMLElement ? host : null
}
function bindViewButton(el: TemplateRefEl) { viewMenu.button.value = hostElement(el) as HTMLButtonElement | null }
function bindViewMenu(el: TemplateRefEl) { viewMenu.menu.value = hostElement(el) }
function bindOverflowButton(el: TemplateRefEl) { overflowMenu.button.value = hostElement(el) as HTMLButtonElement | null }
function bindOverflowMenu(el: TemplateRefEl) { overflowMenu.menu.value = hostElement(el) }
</script>

<template>
  <header class="wf-top">
    <Button text rounded title="Back to Workflows" aria-label="Back to Workflows" @click="emit('back')"><Icon icon="tabler:arrow-left" aria-hidden="true" /></Button>
    <span class="wf-top-count">{{ countLabel }}</span>
    <div class="wf-top-spacer"></div>

    <!-- One group: three graph-editing actions that act on the canvas as a whole.
         Same secondary/outlined treatment as View, Past runs and Versions further
         along this row, so it reads as one bordered control rather than three
         floating glyphs. ButtonGroup merges the adjacent borders and owns the
         end radii, so the buttons drop `rounded`. -->
    <ButtonGroup class="wf-edit-actions">
      <Button severity="secondary" outlined :disabled="!canUndo || viewingRun" title="Undo (⌘Z)" aria-label="Undo" @click="emit('undo')"><Icon icon="tabler:arrow-back-up" aria-hidden="true" /></Button>
      <Button severity="secondary" outlined :disabled="!canRedo || viewingRun" title="Redo (⌘⇧Z)" aria-label="Redo" @click="emit('redo')"><Icon icon="tabler:arrow-forward-up" aria-hidden="true" /></Button>
      <Button severity="secondary" outlined :disabled="viewingRun" title="Edit connections" aria-label="Edit connections" @click="emit('edit-connections', invokerOf($event))"><Icon icon="tabler:arrows-join-2" aria-hidden="true" /></Button>
    </ButtonGroup>
    <span class="wf-vsep"></span>

    <div class="wf-toolbar-menu-wrap">
      <Button :ref="bindViewButton" class="wf-toolbar-compactable" severity="secondary" :outlined="!viewMenu.open.value" title="View controls" aria-label="View controls" aria-haspopup="menu" :aria-expanded="viewMenu.open.value" @click="toggleView"><Icon icon="tabler:layout-grid" aria-hidden="true" /><span>View</span></Button>
      <div v-if="viewMenu.open.value" class="wf-toolbar-menu-backdrop" @click="viewMenu.close()"></div>
      <div v-if="viewMenu.open.value" :ref="bindViewMenu" class="wf-toolbar-menu" role="menu" aria-label="View controls" @keydown="viewMenu.onKeydown">
        <button role="menuitem" @click="viewMenu.choose(() => emit('fit'))"><Icon icon="tabler:maximize" aria-hidden="true" />Fit view</button>
        <button role="menuitem" :disabled="viewingRun" @click="viewMenu.choose(() => emit('auto-layout'))"><Icon icon="tabler:layout-distribute-vertical" aria-hidden="true" />Auto layout</button>
        <button role="menuitem" @click="viewMenu.choose(() => emit('toggle-direction'))"><Icon :icon="layoutDir === 'TB' ? 'tabler:arrow-right' : 'tabler:arrow-down'" aria-hidden="true" />Lay out {{ layoutDir === 'TB' ? 'left to right' : 'top to bottom' }}</button>
        <span class="wf-toolbar-menu-sep" role="separator"></span>
        <button role="menuitem" data-testid="palette-toggle" :aria-pressed="paletteOpen" @click="viewMenu.choose(() => emit('toggle-palette'))"><Icon :icon="paletteOpen ? 'tabler:layout-sidebar-left-collapse' : 'tabler:layout-sidebar-left-expand'" aria-hidden="true" />{{ paletteOpen ? 'Hide steps' : 'Show steps' }}</button>
      </div>
    </div>

    <Button class="wf-toolbar-compactable" severity="secondary" :outlined="!(runsOpen || viewingRun)" title="Past runs" aria-label="Past runs" @click="emit('toggle-runs', invokerOf($event))"><Icon icon="tabler:history" aria-hidden="true" /><span>Past runs</span></Button>
    <Button class="wf-toolbar-compactable" severity="secondary" :outlined="!historyOpen" title="Version history" aria-label="Versions" @click="emit('toggle-history', invokerOf($event))"><Icon icon="tabler:versions" aria-hidden="true" /><span>Versions</span></Button>
    <span class="wf-vsep"></span>
    <Button class="wf-toolbar-compactable" severity="secondary" outlined :disabled="!addTriggerAvailable" :title="addTriggerTitle" :aria-label="addTriggerAriaLabel" @click="emit('add-trigger', invokerOf($event))"><Icon icon="tabler:plug-connected" aria-hidden="true" /><span>Add trigger</span></Button>

    <div class="wf-top-spacer"></div>

    <Button :severity="runActive ? 'danger' : undefined" :disabled="simBusy" :loading="simBusy" :title="runActive ? 'Stop the running workflow' : 'Run with an input'" @click="emit('run', invokerOf($event))">
      <Icon v-if="!simBusy" :icon="runActive ? 'tabler:player-stop' : 'tabler:player-play'" aria-hidden="true" />
      <span>{{ runActive ? 'Stop' : 'Run' }}</span>
    </Button>

    <Button severity="secondary" outlined aria-label="Run published" :disabled="!publishedVersion || viewingRun" title="Run a published version with a selected account" @click="emit('run-published', invokerOf($event))">Run published</Button>

    <div class="wf-toolbar-menu-wrap">
      <Button :ref="bindOverflowButton" text rounded :severity="overflowMenu.open.value ? undefined : 'secondary'" title="More workflow actions" aria-label="More workflow actions" aria-haspopup="menu" :aria-expanded="overflowMenu.open.value" @click="toggleOverflow"><Icon icon="tabler:dots" aria-hidden="true" /></Button>
      <div v-if="overflowMenu.open.value" class="wf-toolbar-menu-backdrop" @click="overflowMenu.close()"></div>
      <div v-if="overflowMenu.open.value" :ref="bindOverflowMenu" class="wf-toolbar-menu" role="menu" aria-label="More workflow actions" @keydown="overflowMenu.onKeydown">
        <button role="menuitem" @click="overflowMenu.choose(() => emit('share', overflowMenu.button.value))"><Icon icon="tabler:share" aria-hidden="true" />Share</button>
        <button role="menuitem" :disabled="!publishedVersion || exportBusy" @click="overflowMenu.choose(() => emit('export'))"><Icon icon="tabler:download" aria-hidden="true" />Export</button>
      </div>
    </div>

    <Button severity="secondary" outlined :disabled="publishBusy" :loading="publishBusy" title="Publish this workflow" @click="emit('publish')"><Icon v-if="!publishBusy" icon="tabler:rocket" aria-hidden="true" /><span>Publish</span></Button>
  </header>
</template>
