import type { Command } from '../api/commands'
import { CMD, type WfDoc } from '../types'
import { foldCommands } from '../mapping/sync'
import { jsonEqual } from '@widgets/app/json-equal'

// Pending node patches replace older values within a run of updates. Structural
// edits remain barriers, including batches which atomically add and position a node.
export function coalesceBatches(batches: Command[][]): Command[][] {
  const result: Command[][] = []
  for (const batch of batches) {
    const command = batch.length === 1 ? batch[0] : null
    let merged = false
    if (command?.type === CMD.NODE_UPDATE) {
      for (let i = result.length - 1; i >= 0; i--) {
        const prior = result[i].length === 1 ? result[i][0] : null
        if (prior?.type !== CMD.NODE_UPDATE) break
        if (prior.body.id === command.body.id) {
          result[i] = [{ ...command, body: { ...prior.body, ...command.body } }]
          merged = true
          break
        }
      }
    }
    if (!merged) result.push(batch)
  }
  return result
}
const commandTypes = new Set<string>(Object.values(CMD))
function isCommand(value: unknown): value is Command {
  if (!value || typeof value !== 'object') return false
  const command = value as Record<string, unknown>
  return typeof command.type === 'string' && commandTypes.has(command.type)
    && !!command.body && typeof command.body === 'object' && !Array.isArray(command.body)
}

// Acknowledge only after the server replies. A terminated page can leave a
// committed request in the journal, so compare with freshly fetched state
// before recovery instead of producing a duplicate definition edit.
export class WorkflowEditJournal {
  private key: string
  constructor(owner: string, workflow: string, private storage: Storage) {
    this.key = `kickside.workflow-edits.v1:${encodeURIComponent(owner)}:${encodeURIComponent(workflow)}`
  }
  write(batches: Command[][]): void {
    if (batches.length) this.storage.setItem(this.key, JSON.stringify(coalesceBatches(batches)))
    else this.storage.removeItem(this.key)
  }
  read(doc: WfDoc): Command[][] {
    const value: unknown = JSON.parse(this.storage.getItem(this.key) ?? '[]')
    if (!Array.isArray(value) || !value.every(batch => Array.isArray(batch) && batch.every(isCommand))) {
      throw new Error('Invalid pending Workflow edits. The recovery record has been retained.')
    }
    const projected = JSON.parse(JSON.stringify(doc)) as WfDoc
    return coalesceBatches(value as Command[][]).flatMap(batch => {
      // Adds use client-minted identities. An existing identity proves the add
      // committed even if a later update changed its initial fields before the
      // page could remove the checkpoint.
      const remaining = batch.filter(command => {
        const id = String(command.body.id || '')
        if (command.type === CMD.NODE_ADD) return !projected.nodes[id]
        if (command.type === CMD.EDGE_ADD) return !projected.edges[id]
        if (command.type === CMD.NOTE_ADD) return !projected.notes[id]
        return true
      })
      const before = JSON.parse(JSON.stringify(projected)) as WfDoc
      foldCommands(projected, remaining)
      return jsonEqual(before, projected) ? [] : [remaining]
    })
  }
}
