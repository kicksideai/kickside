import { describe, expect, it, vi } from 'vitest'
import { waitForCustomElement } from './chatRuntime'

describe('chat custom-element runtime', () => {
  it('accepts an element already injected by Web Host', async () => {
    const Existing = class {} as unknown as CustomElementConstructor
    const registry = { get: () => Existing, whenDefined: vi.fn() }
    await expect(waitForCustomElement('wippy-chat', 5000, registry)).resolves.toBeUndefined()
    expect(registry.whenDefined).not.toHaveBeenCalled()
  })

  it('fails visibly when Web Host never defines chat', async () => {
    const registry = { get: () => undefined, whenDefined: () => new Promise<CustomElementConstructor>(() => {}) }
    const pending = waitForCustomElement('wippy-chat', 5000, registry)
    const rejected = expect(pending).rejects.toThrow('did not define <wippy-chat>')
    await vi.advanceTimersByTimeAsync(5000)
    await rejected
  })
})
