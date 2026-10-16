<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { anchoredPlacement, OVERLAY_PICKER_Z_INDEX } from './anchoredPlacement'

// Shared dropdown/menu shell. Anchors its content to a trigger element with viewport
// coordinates and position:fixed, so the panel escapes the overflow clipping of a
// surrounding modal/scroll container. This mirrors the proven anchoring used by the
// widget pickers (multiselect/component/model) - plain fixed positioning, no Popover
// API top layer (which gets the UA's default popover chrome and centering and does
// not position reliably inside a shadow-DOM/iframe host).
//
// The panel keeps the consumer's own chrome (background, border, radius, shadow): this
// owns placement, not looks. Open state stays with the consumer (v-model:open), which
// keeps each picker's keyboard/selection logic intact; this owns outside-click + Escape.
const props = withDefaults(defineProps<{
  open: boolean
  anchor: HTMLElement | null
  align?: 'left' | 'right'
  width?: 'anchor' | number
  minWidth?: number
  maxHeight?: number
  gap?: number
  zIndex?: number
}>(), {
  align: 'left',
  width: 'anchor',
  minWidth: 0,
  maxHeight: 340,
  gap: 4,
  zIndex: OVERLAY_PICKER_Z_INDEX,
})

const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>()

const panel = ref<HTMLElement | null>(null)
// Start hidden so the first frame (before place() runs) does not flash at 0,0.
const style = ref<Record<string, string>>({ position: 'fixed', visibility: 'hidden' })

function place() {
  const a = props.anchor
  const p = panel.value
  if (!a || !p) return
  const r = a.getBoundingClientRect()
  const requestedWidth = props.width === 'anchor'
    ? Math.max(props.minWidth, r.width)
    : Math.max(props.minWidth, props.width as number)
  const input = {
    anchor: r,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    requestedWidth,
    requestedMaxHeight: props.maxHeight,
    align: props.align,
    gap: props.gap,
  }
  const initial = anchoredPlacement(input)

  // A transformed/filtering ancestor becomes the containing block for fixed-position
  // descendants. Place the hidden panel at local 0,0 to measure that block's viewport
  // origin and its rendered (height-clamped) size, then convert the target viewport
  // coordinates back into the containing block's local frame.
  Object.assign(p.style, {
    position: 'fixed', left: '0px', top: '0px', right: 'auto', bottom: 'auto',
    width: `${initial.width}px`, maxHeight: `${initial.maxHeight}px`, visibility: 'hidden',
  })
  const box = p.getBoundingClientRect()
  const placement = anchoredPlacement({
    ...input,
    containingBlockOrigin: { left: box.left, top: box.top },
    panelHeight: box.height,
  })
  const s: Record<string, string> = {
    position: 'fixed',
    left: `${placement.left}px`,
    top: `${placement.top}px`,
    width: `${placement.width}px`,
    maxHeight: `${placement.maxHeight}px`,
    '--anchored-panel-available-height': `${placement.maxHeight}px`,
    margin: '0',
    zIndex: String(props.zIndex),
    visibility: 'visible',
  }
  style.value = s
}

// Async options, wrapping chips, and expanding tree branches can change the panel
// or anchor height after open. Re-place on either resize so upward-opening panels
// stay attached to their trigger. Coalesce observer bursts through rAF to avoid a
// synchronous ResizeObserver feedback loop.
let resizeObserver: ResizeObserver | null = null
let reflowQueued = false
function scheduleReflow() {
  if (reflowQueued || !props.open) return
  reflowQueued = true
  requestAnimationFrame(() => {
    reflowQueued = false
    if (props.open) place()
  })
}
function observeSize() {
  if (typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(scheduleReflow)
  if (panel.value) resizeObserver.observe(panel.value)
  if (props.anchor) resizeObserver.observe(props.anchor)
}
function unobserveSize() {
  resizeObserver?.disconnect()
  resizeObserver = null
  reflowQueued = false
}

// On open, render hidden then place before paint (v-if mounts the node this tick;
// nextTick guarantees the ref + anchor rect exist before we measure), then watch
// for content/anchor size changes. On close, tear the observer down.
watch(() => props.open, async (v) => {
  unobserveSize()
  if (!v) return
  style.value = { position: 'fixed', visibility: 'hidden' }
  await nextTick()
  place()
  observeSize()
}, { immediate: true })

// The panel + trigger live in the host's shadow root, so a bubbled document click is
// retargeted to the host: composedPath keeps the real in-tree nodes, so an inside
// click is detected and the panel is not dismissed the instant it opens.
function onDocClick(e: MouseEvent) {
  if (!props.open) return
  const path = e.composedPath()
  if ((panel.value && path.includes(panel.value)) || (props.anchor && path.includes(props.anchor))) return
  emit('update:open', false)
}
function onKey(e: KeyboardEvent) { if (props.open && e.key === 'Escape') emit('update:open', false) }
function reflow() { if (props.open) place() }

document.addEventListener('click', onDocClick)
document.addEventListener('keydown', onKey)
window.addEventListener('resize', reflow)
window.addEventListener('scroll', reflow, true)
onBeforeUnmount(() => {
  unobserveSize()
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', reflow)
  window.removeEventListener('scroll', reflow, true)
})
</script>

<template>
  <div v-if="open" ref="panel" class="anchored-panel" :style="style">
    <slot />
  </div>
</template>

<style>
/* Placement-only wrapper; the slotted panel carries its own chrome. */
.anchored-panel { position: fixed; min-width: 0; overflow: auto; }
</style>
