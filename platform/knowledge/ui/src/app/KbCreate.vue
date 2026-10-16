<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@wippy-fe/proxy'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { useParentId } from '@widgets/app/useParentId'
import { errMsg } from '@widgets/app/errMsg'
import KbDialog from './KbDialog.vue'
import type { Engine, EmbeddingModel } from './kbDialogTypes'

// Host wrapper exposing the full KbDialog as the <kx-kb-create-dialog> custom
// element for the workspace "+" -> Knowledge Base action. It obtains the same
// knowledge API proxy, loads the engine catalog + embedding models the dialog
// needs, opens the dialog in create mode (target null), and bridges the
// dialog's saved/close to DOM events.
//
// parent-id (the workspace folder the "+" was opened in) is threaded into the
// create POST so the KB lands under that folder; empty means root. Several KBs
// can be created without reopening, so each POST carries the placement.
interface CreateProps { parentId?: string }
interface CreateEvents { created: Record<string, never>; close: Record<string, never> }

// Opaque engine catalog entry: this wrapper only loads engines from the API and
// hands them to KbDialog, which owns the authoritative Engine type (including the
// config_schema field shape). Kept as an unknown-config passthrough so the two
// definitions can't drift; KbDialog validates the schema it consumes.
const props = useProps<CreateProps>()
const emit = useEvents<CreateEvents>()

// useProps exposes host attributes camelCased (parent-id -> parentId).
const parentId = useParentId(props)

const engines = ref<Engine[]>([])
const models = ref<EmbeddingModel[]>([])
// Set when the engine/model catalog fetch fails, so the dialog shows a directed error
// with retry instead of an empty catalog that reads as "no options to choose".
const loadError = ref('')

async function loadOptions() {
  loadError.value = ''
  try {
    const [eng, mod] = await Promise.all([
      api.get('/api/v1/knowledge/engines'),
      api.get('/api/v1/knowledge/models'),
    ])
    if (!eng.data?.success) throw new Error(eng.data?.error || 'Could not load knowledge engines.')
    if (!mod.data?.success) throw new Error(mod.data?.error || 'Could not load embedding models.')
    engines.value = (eng.data.engines || []) as Engine[]
    models.value = (mod.data.models || []) as EmbeddingModel[]
  } catch (e) {
    engines.value = []
    models.value = []
    loadError.value = errMsg(e, 'Could not load knowledge engines.')
  }
}

onMounted(loadOptions)
</script>

<template>
  <KbDialog
    :open="true"
    :api="api"
    :engines="engines"
    :models="models"
    :target="null"
    :parent-id="parentId.value"
    :load-error="loadError"
    @retry="loadOptions"
    @close="emit('close', {})"
    @saved="emit('created', {})"
  />
</template>
