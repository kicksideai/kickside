import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, nextTick } from 'vue'
import { useJournal } from './useJournal'

/**
 * A journal whose hourly activity outruns one page: the reader must receive
 * the WHOLE history as day buckets, following the keyset continuation, never
 * a silently truncated slice.
 */
vi.mock('@wippy-fe/proxy', () => {
  const dayPage = (after?: string) => {
    if (!after) {
      return {
        buckets: [{ bucket_at: 1000, agent_id: 'ana', events: 5, last_ts: 1030 }],
        width_s: 86400, bucket: 'day', has_more: true,
        next_cursor: { after_bucket_at: 1000, after_agent_id: 'ana' },
      }
    }
    return {
      buckets: [{ bucket_at: 87400, agent_id: 'bo', events: 7, last_ts: 87430 }],
      width_s: 86400, bucket: 'day', has_more: false,
    }
  }
  const answer = (url: string) => {
    if (url.includes('/health')) return { success: true, health: { status: 'ok' } }
    if (url.includes('/cursors')) return { success: true, cursors: { items: [] } }
    if (url.includes('/spans')) return { success: true, spans: { items: [], counts: { open: 0, sealed: 0, total: 0 } } }
    if (url.includes('/activity')) {
      if (url.includes('bucket=hour')) {
        return { success: true, activity: { buckets: [{ bucket_at: 1, events: 1 }], width_s: 3600, bucket: 'hour', has_more: true } }
      }
      const after = url.includes('after_bucket_at=1000') ? '1000' : undefined
      return { success: true, activity: dayPage(after) }
    }
    if (url.includes('/tree')) return { success: true, tree: { children: [] } }
    if (url.includes('/assemble')) return { success: true, assembly: null }
    if (url.includes('/graphs')) return { success: true, graphs: [] }
    return { success: true, journal: { stats: { total: 0, task_count: 0 }, events: [], graphs: [] } }
  }
  return {
    api: {
      get: (url: string) => Promise.resolve({ data: answer(url) }),
      post: () => Promise.resolve({ data: { success: true, assembly: null } }),
    },
    on: () => () => {},
  }
})

function reader() {
  let journal!: ReturnType<typeof useJournal>
  const harness = defineComponent({
    setup() {
      journal = useJournal(computed(() => 'entry-1'))
      return () => null
    },
  })
  const wrapper = mount(harness)
  return { wrapper, journal }
}

const settle = async () => { for (let turn = 0; turn < 10; turn++) await nextTick() }

describe('activity at history scale', () => {
  it('falls back to day buckets and follows the continuation to the whole history', async () => {
    const { wrapper, journal } = reader()
    await journal.loadAll()
    await settle()
    expect(journal.bucketWidthS.value).toBe(86400)
    expect(journal.buckets.value.map(bucket => bucket.bucket_at)).toEqual([1000, 87400])
    wrapper.unmount()
  })
})
