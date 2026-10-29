<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { computed, ref, watch } from 'vue'
import { api } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { errMsg } from '@widgets/app/errMsg'
import { useParentId } from '@widgets/app/useParentId'
import { useSubmitNonce } from '@widgets/app/useSubmitNonce'

const props = useProps<{ parentId?: string; submitNonce?: string; sourceContext?: string }>()
const emit = useEvents<{
  'submit-state': { saving: boolean }
  created: { id?: string }
  close: Record<string, never>
}>()

const title = ref('')
const saving = ref(false)
const error = ref('')
const parentId = useParentId(props)
const valid = computed(() => title.value.trim() !== '')
const nameInvalid = computed(() => error.value === 'Name is required.')

watch(saving, (value) => emit('submit-state', { saving: value }))
useSubmitNonce(props, create, saving)

async function create() {
  if (saving.value) return
  if (!valid.value) {
    error.value = 'Name is required.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const { data } = await api.post<{ success?: boolean; flow_id?: string; error?: string | { message?: string } }>(
      '/api/v1/workflows',
      { title: title.value.trim(), parent_id: parentId.value || undefined, source_context: props.value.sourceContext ? JSON.parse(props.value.sourceContext) : undefined },
    )
    if (!data?.success || !data.flow_id) {
      const apiError = typeof data?.error === 'string' ? data.error : data?.error?.message
      throw new Error(apiError || 'Workflow creation failed')
    }
    emit('created', { id: data.flow_id })
  } catch (cause) {
    error.value = errMsg(cause, 'Workflow creation failed')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="wf-setup" @submit.prevent="create">
    <label class="wf-setup-field" for="workflow-setup-name">
      <span class="wf-setup-label">Name <span class="wf-setup-req" aria-hidden="true">*</span></span>
      <InputText
        id="workflow-setup-name"
        v-model="title"
        class="wf-setup-input"
        type="text"
        placeholder="Qualify inbound lead"
        required
        aria-required="true"
        :invalid="nameInvalid"
        :aria-describedby="error ? 'workflow-setup-hint workflow-setup-error' : 'workflow-setup-hint'"
        @input="nameInvalid && (error = '')"
      />
    </label>
    <p id="workflow-setup-hint" class="wf-setup-hint">Create the Workflow first, then define and publish its Blocks in the editor.</p>
    <Message v-if="error" id="workflow-setup-error" class="wf-setup-error" severity="error" :closable="false">{{ error }}</Message>
  </form>
</template>
