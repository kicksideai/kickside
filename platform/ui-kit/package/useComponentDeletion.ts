// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { onBeforeUnmount, watch, type Ref } from 'vue'
import { on } from '@wippy-fe/proxy'
import { componentDeletionEvent } from './componentRealtime'

export interface ComponentDeletionState {
  deleting_at?: string | null
  deletion_job_id?: string | null
  deletion_job?: {status: string; attempts: number; last_error?: string | null} | null
}

// onDeleted reports every row that leaves the list. onDeletionFinished reports only a
// known deletion: a marked row that leaves the list, or a component.deleted event.
// A list view passes its loader as onDeletionFinished: the deletion changes the list
// outside any list read, and the next read replaces the outcome of earlier reads.
export function useComponentDeletion<T extends ComponentDeletionState>(
  rows: Ref<T[]>, id: (row: T) => string, onDeleted?: (id: string) => void, onDeletionFinished?: (id: string) => void,
) {
  const deleted = new Set<string>()
  const accepted = new Map<string, Pick<ComponentDeletionState, 'deleting_at' | 'deletion_job_id'>>()
  function acceptDeletion(componentId: string, result?: {job_id?: string | null}) {
    const row = rows.value.find(row => id(row) === componentId)
    const previous = accepted.get(componentId)
    const jobId = result?.job_id || previous?.deletion_job_id || row?.deletion_job_id
    // A repeated event for the same attempt keeps its confirmed progress.
    const tracked = previous ? previous.deletion_job_id : row?.deleting_at ? row.deletion_job_id : undefined
    if ((previous || row?.deleting_at) && jobId === tracked) return
    const state = {
      deleting_at: previous?.deleting_at || row?.deleting_at || new Date().toISOString(),
      deletion_job_id: jobId,
    }
    accepted.set(componentId, state)
    if (row) { Object.assign(row, state); row.deletion_job = undefined }
  }
  const stop = watch(() => rows.value, (list, previous = []) => {
    const remaining = list.filter(row => !deleted.has(id(row)))
    for (const row of previous) {
      if (deleted.has(id(row)) || remaining.some(current => id(current) === id(row))) continue
      onDeleted?.(id(row))
      if (row.deleting_at) onDeletionFinished?.(id(row))
    }
    if (remaining.length !== list.length) { rows.value = remaining; return }
    for (const row of list) {
      // A marked list snapshot confirms job absence. Local acceptance and events
      // keep progress unresolved until the next authorized list response arrives.
      if (row.deleting_at && row.deletion_job === undefined && !previous.includes(row)) row.deletion_job = null
      const state = accepted.get(id(row))
      if (state) {
        if (row.deletion_job_id !== state.deletion_job_id) row.deletion_job = undefined
        Object.assign(row, state)
      }
      const prior = previous.find(prior => id(prior) === id(row))
      if (row.deletion_job === undefined && prior?.deletion_job_id === row.deletion_job_id) row.deletion_job = prior?.deletion_job
    }
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
  onBeforeUnmount(() => { stop(); if (typeof off === 'function') off() })
  return {acceptDeletion}
}
