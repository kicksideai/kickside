import { describe, it, expect } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
const mods = import.meta.glob("./*.vue", { eager: true }) as Record<string, any>
const props: Record<string, any> = { modelValue: [], options: [], items: [], config: {}, value: "", models: [], multiple: true, placeholder: "" }
describe("component smoke mounts", () => {
  for (const [path, mod] of Object.entries(mods)) {
    it(`mounts ${path}`, async () => { const w = mount(mod.default, { props }); await flushPromises(); expect(w.exists()).toBe(true); w.unmount() })
  }
})

