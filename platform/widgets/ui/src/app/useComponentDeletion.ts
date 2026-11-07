// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { onBeforeUnmount, watch, type Ref } from 'vue'
import { api, host, on } from '@wippy-fe/proxy'
import { componentDeletionEvent } from './componentRealtime'
import { errMsg } from './errMsg'

export interface ComponentDeletionState {
  deleting_at?: string | null
  deletion_job_id?: string | null
  deletion_job?: {status: string; attempts: number; last_error?: string | null} | null
}

// onDeleted reports every row that leaves the list. onDeletionFinished reports only a
// known deletion: a marked row that leaves the list, or a component.deleted event.
export function useComponentDeletion<T extends ComponentDeletionState>(
  rows: Ref<T[]>, id: (row: T) => string, onDeleted?: (id: string) => void, onDeletionFinished?: (id: string) => void,
) {
  let active = true
  const deleted = new Set<string>()
  const accepted = new Map<string, Pick<ComponentDeletionState, 'deleting_at' | 'deletion_job_id'>>()
  function acceptDeletion(componentId: string, result?: {job_id?: string | null}) {
    const row = rows.value.find(row => id(row) === componentId)
    const previous = accepted.get(componentId)
    const state = {
      deleting_at: previous?.deleting_at || row?.deleting_at || new Date().toISOString(),
      deletion_job_id: result?.job_id || previous?.deletion_job_id || row?.deletion_job_id,
    }
    accepted.set(componentId, state)
    if (row) { Object.assign(row, state); row.deletion_job = undefined }
  }
  async function read(row: T) {
    const componentId = id(row)
    // Each acceptance object identifies the attempt observed by this read.
    const generation = accepted.get(componentId)
    const current = () => active && rows.value.includes(row) && accepted.get(componentId) === generation
    try {
      const {data} = await api.get(`/api/v1/components/${encodeURIComponent(componentId)}`)
      if (!data?.success) throw new Error(errMsg(data, 'Could not read deletion progress'))
      if (current()) {
        row.deleting_at = generation?.deleting_at || data.deleting_at
        row.deletion_job_id = data.deletion_job_id
        if (generation) generation.deletion_job_id = row.deletion_job_id
        row.deletion_job = data.deletion_job ?? null
      }
    } catch (error) {
      if (current()) host.handleError('other', {message: errMsg(error, 'Could not read deletion progress')})
    }
  }
  // The rows whose deletion progress this hook has already taken from the server.
  let settled: T[] = []
  const stop = watch(() => rows.value, (list, previous = []) => {
    const remaining = list.filter(row => !deleted.has(id(row)))
    for (const row of previous) {
      if (deleted.has(id(row)) || remaining.some(current => id(current) === id(row))) continue
      onDeleted?.(id(row))
      if (row.deleting_at) onDeletionFinished?.(id(row))
    }
    if (remaining.length !== list.length) { rows.value = remaining; return }
    for (const row of list) {
      const state = accepted.get(id(row))
      if (state) {
        if (row.deletion_job_id !== state.deletion_job_id) row.deletion_job = undefined
        Object.assign(row, state)
      }
      const prior = previous.find(prior => id(prior) === id(row))
      if (row.deletion_job === undefined && prior?.deletion_job_id === row.deletion_job_id) row.deletion_job = prior?.deletion_job
      // Progress is read for rows whose state arrives from the server; a row kept from
      // the settled list carries the state the deletion events already applied.
      if (row.deleting_at && !settled.includes(row)) void read(row)
    }
    settled = list
  }, {immediate: true})
  const off = on('@message', message => {
    const event = componentDeletionEvent(message)
    if (!event) return
    const row = rows.value.find(row => id(row) === event.component_id)
    if (event.event === 'component.deleted') {
      if (row && !deleted.has(event.component_id)) {
        onDeleted?.(event.component_id)
        onDeletionFinished?.(event.component_id)
      }
      deleted.add(event.component_id)
      accepted.delete(event.component_id)
      rows.value = rows.value.filter(row => id(row) !== event.component_id)
    } else if (row) {
      acceptDeletion(event.component_id, {job_id: event.deletion_job_id})
    }
  })
  onBeforeUnmount(() => { active = false; stop(); if (typeof off === 'function') off() })
  return {acceptDeletion}
}
