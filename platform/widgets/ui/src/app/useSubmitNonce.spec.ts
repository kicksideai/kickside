import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useSubmitNonce } from './useSubmitNonce'

describe('useSubmitNonce', () => {
  it('submits once for each new camelCased host nonce', async () => {
    const props = ref<Record<string, unknown>>({})
    const submit = vi.fn()
    useSubmitNonce(props, submit)

    props.value = { submitNonce: '1' }
    await nextTick()
    props.value = { submitNonce: '2' }
    await nextTick()

    expect(submit).toHaveBeenCalledTimes(2)
  })

  it('ignores empty or unchanged values', async () => {
    const props = ref<Record<string, unknown>>({})
    const submit = vi.fn()
    useSubmitNonce(props, submit)

    props.value = { submitNonce: '' }
    await nextTick()
    props.value = { submitNonce: '1' }
    await nextTick()
    props.value = { submitNonce: '1' }
    await nextTick()

    expect(submit).toHaveBeenCalledOnce()
  })

  it('does not re-enter while the component is busy', async () => {
    const props = ref<Record<string, unknown>>({})
    const busy = ref(true)
    const submit = vi.fn()
    useSubmitNonce(props, submit, busy)

    props.value = { submitNonce: '1' }
    await nextTick()
    expect(submit).not.toHaveBeenCalled()

    busy.value = false
    props.value = { submitNonce: '2' }
    await nextTick()
    expect(submit).toHaveBeenCalledOnce()
  })
})
