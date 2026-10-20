<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { api } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { inputPreset } from '@widgets/app/inputPreset'
import { useParentId } from '@widgets/app/useParentId'
import { useSubmitNonce } from '@widgets/app/useSubmitNonce'
import { errMsg } from '@widgets/app/errMsg'
import ScheduleForm from '../trigger-config/app/ScheduleForm.vue'
import { fromRecurringSchedule, toRecurringSchedule, type RecurringSchedule } from '../trigger-config/schedule'
import type { TriggerSchedule } from '../trigger-config/spec'
import TaskTargetEditor, { type TaskTarget } from './TaskTargetEditor.vue'

const view = defineProps<{ recurring: boolean }>()
const props = useProps<{ typeId?: string; parentId?: string; input?: unknown; config?: unknown; submitNonce?: string }>()
const emit = useEvents<{
  'automation-installed': { success: boolean; id?: string; error?: string }
  'submit-state': { saving: boolean }
  created: { id?: string }
  change: { id: string }
  close: Record<string, never>
}>()
const parentId = useParentId(props)
const automationId = computed(() => String(inputPreset(props.value.config).id || ''))
const title = ref('')
const enabled = ref(true)
const schedule = ref<TriggerSchedule | null>(null)
const target = ref<TaskTarget>({ kind: 'agent' })
const targetError = ref('Choose a target.')
const loading = ref(true)
const loaded = ref(false)
const saving = ref(false)
const error = ref('')
watch(saving, value => emit('submit-state', { saving: value }))
useSubmitNonce(props, submit, saving)
const validation = computed(() => view.recurring && !schedule.value ? 'Complete the UTC schedule.' : targetError.value)

function seed(input: Record<string, unknown>) {
  title.value = typeof input.title === 'string' ? input.title : ''
  enabled.value = input.enabled !== false
  schedule.value = fromRecurringSchedule(input.schedule as RecurringSchedule || null)
  target.value = input.target as TaskTarget || { kind: 'agent' }
}
async function load() {
  loading.value = true; loaded.value = false; error.value = ''
  try {
    if (automationId.value) {
      const { data } = await api.get<{ success?: boolean; config?: Record<string, unknown>; error?: unknown }>(
        `/api/v1/automations/${encodeURIComponent(automationId.value)}/config`)
      if (!data.success) throw new Error(errMsg(data.error, 'Could not load the task.'))
      const stored = data.config?._portable_input
      if (!stored || typeof stored !== 'object' || Array.isArray(stored) || typeof data.config?.enabled !== 'boolean') {
        throw new Error('The task has no stored declaration.')
      }
      seed({ ...stored, enabled: data.config?.enabled })
    } else seed(inputPreset(props.value.input))
    loaded.value = true
  } catch (cause) { error.value = errMsg(cause, 'Could not load the task.') }
  finally { loading.value = false }
}
async function submit() {
  if (!loaded.value || saving.value) return
  if (validation.value) {
    error.value = validation.value
    if (!automationId.value) emit('automation-installed', { success: false, error: error.value })
    return
  }
  saving.value = true; error.value = ''
  const input = { title: title.value, enabled: enabled.value, target: target.value,
    ...(view.recurring && schedule.value ? { schedule: toRecurringSchedule(schedule.value) } : {}) }
  try {
    if (automationId.value) {
      const { data } = await api.put<{ success?: boolean; error?: unknown }>(`/api/v1/automations/${encodeURIComponent(automationId.value)}`, { input })
      if (!data.success) throw new Error(errMsg(data.error, 'Could not save the task.'))
      emit('change', { id: automationId.value }); emit('close', {})
    } else {
      const { data } = await api.post<{ success?: boolean; id?: string; error?: unknown }>('/api/v1/automations', {
        type: props.value.typeId, parent_id: parentId.value || undefined, input,
      })
      if (!data.success) throw new Error(errMsg(data.error, 'Could not create the task.'))
      emit('automation-installed', { success: true, id: data.id }); emit('created', { id: data.id })
    }
  } catch (cause) {
    error.value = errMsg(cause, 'Could not save the task.')
    if (!automationId.value) emit('automation-installed', { success: false, error: error.value })
  } finally { saving.value = false }
}
onMounted(load)
watch(automationId, load)
</script>

<template>
  <p v-if="loading" class="task-hint">Loading task…</p>
  <p v-else-if="!loaded" role="alert">{{ error }}</p>
  <form v-else class="task-form" @submit.prevent="submit">
    <label class="task-field">Title <input v-model="title" aria-label="Title" :disabled="saving" /></label>
    <label class="task-check"><input v-model="enabled" type="checkbox" :disabled="saving" /> Enabled</label>
    <section v-if="recurring" aria-label="Schedule (UTC)">
      <p class="task-hint">All times are UTC.</p>
      <ScheduleForm v-model="schedule" default-preset="daily" :disabled="saving" />
    </section>
    <TaskTargetEditor v-model="target" :disabled="saving" @validation="targetError = $event" />
    <p v-if="error" class="task-error" role="alert">{{ error }}</p>
    <div v-if="automationId" class="task-actions">
      <button type="button" :disabled="saving" @click="emit('close', {})">Cancel</button>
      <button type="submit" :disabled="saving || !!validation">{{ saving ? 'Saving…' : 'Save' }}</button>
    </div>
  </form>
</template>
