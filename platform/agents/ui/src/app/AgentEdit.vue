<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@wippy-fe/proxy'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { useParentId } from '@widgets/app/useParentId'
import AgentForm from './AgentForm.vue'
import { loadToolCatalog } from './toolCatalog.ts'

// Host wrapper exposing the shared AgentForm as the <wc-agent-edit> custom element
// for both the Agents page and the workspace agent kind. It reads host attributes,
// loads the editor's option lists, and bridges AgentForm's save/close to DOM events.
// Edit mode when an agent id arrives (component-id / entry-id, or the workspace
// route channel); create mode when only parent-id is given.
// Keys are camelCased: WippyVueElement exposes host attributes camelCased
// (component-id -> componentId, parent-id -> parentId, entry-id -> entryId).
interface EditProps { parentId?: string; componentId?: string; entryId?: string; route?: string; mode?: string }
interface EditEvents { saved: { id: string }; created: { id: string }; close: { id: string } }

const wprops = useProps<EditProps>()
const emit = useEvents<EditEvents>()

const editId = computed(() => {
  const p = wprops.value
  return p.componentId || p.entryId || (!p.parentId ? (p.route || '') : '')
})
const agentId = computed<string | null>(() => editId.value || null)
// useParentId accepts the structural host-props ref and handles camel/kebab keys.
const parentId = useParentId(wprops)

const traits = ref<any[]>([])
const tools = ref<any[]>([])
const models = ref<any[]>([])
const agents = ref<any[]>([])

// Option lists for the editor; each endpoint degrades to an empty list when its
// owning module is not installed, so the form hides controls it can't populate.
async function loadOptions() {
  try { const { data } = await api.get('/api/v1/agents/traits'); traits.value = data?.success ? (data.traits || []) : [] } catch { traits.value = [] }
  try { tools.value = await loadToolCatalog() } catch { tools.value = [] }
  try { const { data } = await api.get('/api/v1/models/list?capability=generate', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } }); models.value = data?.success ? (data.models || []) : [] } catch { models.value = [] }
  try { const { data } = await api.get('/api/v1/user-agents'); agents.value = data?.success ? (data.agents || []) : [] } catch { agents.value = [] }
}

onMounted(loadOptions)

function onSaved(id: string) {
  if (agentId.value) emit('saved', { id: id || agentId.value })
  else emit('created', { id: id || '' })
}
function onClose() { emit('close', { id: agentId.value || '' }) }
</script>

<template>
  <AgentForm
    :open="true"
    :embedded="true"
    :agent-id="agentId"
    :parent-id="parentId.value"
    :traits="traits"
    :tools="tools"
    :models="models"
    :agents="agents"
    @saved="onSaved"
    @close="onClose"
  />
</template>
