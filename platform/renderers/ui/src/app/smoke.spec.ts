import { describe, it, expect } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"

// Smoke-mount every component in this module: exercises setup() + template render
// under the shared host mocks. Permissive props cover the common required ones.
const mods = import.meta.glob("./*.vue", { eager: true }) as Record<string, any>
const props: Record<string, any> = {
  item: { id: "i", kind: "k", data: {} }, content: "", config: {}, modelValue: false,
  tabs: [], active: "", node: {}, src: "", kbId: "kb1", value: "", noun: "document",
  kind: "jira", concepts: [], edges: [], selectedId: null, highlightIds: new Set(),
  size: { name: "Sheet", rows: 0, columns: 0 }, page: { row: 0, column: 0 },
  schema: {}, fields: [], options: [], items: [], resource: {}, url: "",
  models: [], connections: [], services: [], traits: [], tools: [], agents: [], providers: [],
}

describe("component smoke mounts", () => {
  for (const [path, mod] of Object.entries(mods)) {
    it(`mounts ${path}`, async () => {
      const C = mod.default
      const w = mount(C, { props })
      await flushPromises()
      expect(w.exists()).toBe(true)
      w.unmount()
    })
  }
})

