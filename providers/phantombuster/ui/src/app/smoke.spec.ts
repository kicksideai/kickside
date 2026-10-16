import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const mods = import.meta.glob('./*.vue', { eager: true }) as Record<string, any>

describe('component smoke mounts', () => {
  for (const [path, mod] of Object.entries(mods)) {
    it(`mounts ${path}`, async () => {
      const C = mod.default
      const w = mount(C)
      await flushPromises()
      expect(w.exists()).toBe(true)
      w.unmount()
    })
  }
})
