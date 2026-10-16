<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { loadByTagName } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

const props = useProps<{ componentInstanceId?: string; 'component-instance-id'?: string }>()
const emit = useEvents<{ navigate: { route: string } }>()
const automationsHost = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref('')
let automationsEl: HTMLElement | null = null

function componentId(): string {
  return String(props.value?.componentInstanceId || props.value?.['component-instance-id'] || '').trim()
}
function onNavigate(event: Event) {
  const detail = (event as CustomEvent<{ route?: string }>).detail
  if (detail?.route) emit('navigate', { route: detail.route })
}
async function mountSurface(host: HTMLElement | null, tag: string, attrs: Record<string, string>): Promise<HTMLElement | null> {
  if (!host) return null
  await loadByTagName(tag, { timeoutMs: 8000 })
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
  el.addEventListener('navigate', onNavigate)
  el.style.display = 'block'
  host.replaceChildren(el)
  return el
}
async function load() {
  const id = componentId()
  if (!id) { error.value = 'Component is required.'; loading.value = false; return }
  loading.value = false
  await nextTick()
  await mountActive()
}
async function mountActive() {
  const id = componentId()
  if (!id || loading.value) return
  try {
    await nextTick()
    if (!automationsEl) {
      automationsEl = await mountSurface(automationsHost.value, 'kickside-automation-manager', {
        'component-id': id,
        mode: 'component',
      })
    }
  } catch {
    error.value = 'Workflow controls could not load. Try refreshing this page.'
  }
}
onMounted(load)
onBeforeUnmount(() => {
  automationsEl?.removeEventListener('navigate', onNavigate)
})
</script>

<template>
  <div class="cw-root">
    <header class="cw-head">
      <span class="cw-head-icon"><Icon icon="tabler:route" aria-hidden="true" /></span>
      <span class="cw-head-copy">
        <h1>Workflows</h1>
        <p>Connect component events to typed Blocks or published Workflows.</p>
      </span>
    </header>
    <Message v-if="error" class="cw-feedback" severity="error" :closable="false">{{ error }}</Message>
    <div v-if="loading" class="cw-state">
      <ProgressSpinner class="cw-spinner" stroke-width="4" aria-label="Loading Workflows" />
      <span>Loading Workflows…</span>
    </div>
    <template v-else>
      <section class="cw-section" aria-label="Event Workflows">
        <div ref="automationsHost" class="cw-host" />
      </section>
    </template>
  </div>
</template>
