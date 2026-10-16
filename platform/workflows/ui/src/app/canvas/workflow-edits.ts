import type { Command } from '../api/commands'
import type { ApplyResult } from '../types'
import { type SyncEngine } from '../mapping/sync'
import { jsonEqual } from '@widgets/app/json-equal'

interface WorkflowEditsOptions {
  engine: SyncEngine
  request: (commands: Command[]) => Promise<ApplyResult>
  rebuild: (refit?: boolean) => void
  recover: (cause: unknown) => Promise<void>
  checkpoint?: (commands: Command[][]) => void
}
interface Edit {
  commands: Command[]
  stage: number
  done: Promise<void>
  resolve: () => void
}
function nodeKey(commands: Command[]): string | null {
  const command = commands.length === 1 ? commands[0] : null
  return command?.type === 'node.update' && typeof command.body.id === 'string' ? command.body.id : null
}

export function workflowEdits({ engine, request, rebuild, recover, checkpoint }: WorkflowEditsOptions) {
  const queue: Edit[] = []
  let active: Edit | null = null
  let worker: Promise<boolean> | null = null
  let failed = false
  const remember = () => checkpoint?.([...(active ? [active.commands] : []), ...queue.map(edit => edit.commands)])

  async function drain(): Promise<boolean> {
    while (queue.length) {
      const edit = queue.shift()!
      active = edit
      try {
        remember()
        engine.applyResponse(await request(edit.commands), Date.now(), edit.stage)
        edit.resolve()
        active = null
        remember()
        rebuild()
      } catch (cause) {
        // Keep the failed edit and its successors for explicit recovery. The
        // durable checkpoint is removed only after a server acknowledgement.
        failed = true
        queue.unshift(edit)
        active = null
        await recover(cause)
        for (const edit of queue) edit.resolve()
        return false
      }
    }
    return true
  }
  function start(): Promise<boolean> {
    if (!worker && !failed) {
      // Coalesce all notifications in the current Vue/model synchronization
      // turn. No timer/debounce window delays an intentional edit.
      worker = Promise.resolve().then(drain).finally(() => {
        worker = null
        if (queue.length && !failed) void start()
      })
    }
    return worker ?? Promise.resolve(!failed)
  }
  const save = (commands: Command[], refit = false): Promise<void> => {
    if (!commands.length) return Promise.resolve()
    const key = nodeKey(commands)
    // A structural command is an ordering barrier; updates to different nodes
    // commute within the trailing run of node updates.
    let queued: Edit | undefined
    if (key) {
      for (let i = queue.length - 1; i >= 0; i--) {
        const other = nodeKey(queue[i].commands)
        if (!other) break
        if (other === key) { queued = queue[i]; break }
      }
      if (!queued && !queue.length && active && jsonEqual(active.commands, commands)) return active.done
    }
    if (queued) {
      const merged = [{ ...commands[0], body: { ...queued.commands[0].body, ...commands[0].body } }]
      if (jsonEqual(queued.commands, merged)) return queued.done
      engine.rejectCommands(queued.stage)
      queued.commands = merged
      queued.stage = engine.stageCommands(merged)
    } else {
      let resolve!: () => void
      const done = new Promise<void>(finish => { resolve = finish })
      queued = { commands, stage: engine.stageCommands(commands), done, resolve }
      queue.push(queued)
    }
    try { remember() }
    catch (cause) {
      failed = true
      void recover(cause).then(() => { for (const edit of queue) edit.resolve() })
      return queued.done
    }
    rebuild(refit)
    // Recovery has already reported the failed writer. Keep subsequent edits
    // checkpointed for reload, and settle their callers without starting a retry.
    if (failed) queued.resolve()
    else void start()
    return queued.done
  }
  const flush = async (): Promise<boolean> => {
    do { if (!await start()) return false } while (active || queue.length)
    return true
  }
  const api = Object.assign(save, { flush, pending: false })
  Object.defineProperty(api, 'pending', { get: () => !!active || queue.length > 0 })
  return api
}
