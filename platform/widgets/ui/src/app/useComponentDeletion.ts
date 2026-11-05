import { onBeforeUnmount, watch, type Ref } from 'vue'
import { api, host, on } from '@wippy-fe/proxy'
import { componentDeletionEvent } from './componentRealtime'
import { errMsg } from './errMsg'

export interface ComponentDeletionState {
  deleting_at?: string | null
  deletion_job_id?: string | null
  deletion_job?: {status: string; attempts: number; last_error?: string | null} | null
}

export function useComponentDeletion<T extends ComponentDeletionState>(
  rows: Ref<T[]>, id: (row: T) => string, onDeleted?: (id: string) => void,
) {
  let active = true
  const deleted = new Set<string>()
  function acceptDeletion(componentId: string, result?: {job_id?: string | null}) {
    const row = rows.value.find(row => id(row) === componentId)
    if (!row) return
    row.deleting_at = row.deleting_at || new Date().toISOString()
    row.deletion_job_id = result?.job_id || row.deletion_job_id
    row.deletion_job = undefined
  }
  async function read(row: T) {
    row.deletion_job = undefined
    try {
      const {data} = await api.get(`/api/v1/components/${encodeURIComponent(id(row))}`)
      if (!data?.success) throw new Error(errMsg(data, 'Could not read deletion progress'))
      if (active && rows.value.includes(row)) {
        row.deleting_at = data.deleting_at
        row.deletion_job_id = data.deletion_job_id
        row.deletion_job = data.deletion_job ?? null
      }
    } catch (error) {
      if (active && rows.value.includes(row)) host.handleError('other', {message: errMsg(error, 'Could not read deletion progress')})
    }
  }
  const stop = watch(() => rows.value, (list, previous = []) => {
    const remaining = list.filter(row => !deleted.has(id(row)))
    for (const row of previous) if (!deleted.has(id(row)) && !remaining.some(current => id(current) === id(row))) onDeleted?.(id(row))
    if (remaining.length !== list.length) { rows.value = remaining; return }
    for (const row of list) if (row.deleting_at) void read(row)
  }, {immediate: true})
  const off = on('@message', message => {
    const event = componentDeletionEvent(message)
    if (!event) return
    const row = rows.value.find(row => id(row) === event.component_id)
    if (event.event === 'component.deleted') {
      if (row && !deleted.has(event.component_id)) onDeleted?.(event.component_id)
      deleted.add(event.component_id)
      rows.value = rows.value.filter(row => id(row) !== event.component_id)
    } else if (row) {
      acceptDeletion(event.component_id)
      void read(row)
    }
  })
  onBeforeUnmount(() => { active = false; stop(); if (typeof off === 'function') off() })
  return {acceptDeletion}
}
