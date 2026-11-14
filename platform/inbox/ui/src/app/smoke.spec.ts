import { describe, it, expect, vi } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import Inbox from "./inbox.vue"

// Smoke-mount every component in this module: exercises setup() + template render
// under the shared host mocks. Permissive props cover the common required ones.
const mods = import.meta.glob("./*.vue", { eager: true }) as Record<string, any>
const props: Record<string, any> = {
  item: { id: "i", kind: "k", data: {} }, content: "", config: {}, modelValue: false,
  tabs: [], active: "", node: {}, src: "", kbId: "kb1", value: "", noun: "document",
  kind: "jira", concepts: [], edges: [], selectedId: null, highlightIds: new Set(),
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

describe("inbox realtime", () => {
  it("subscribes to canonical component public meta and refreshes without zeroing counts", async () => {
    ;(globalThis as any).__realtimeHandlers__ = []
    ;(globalThis as any).__api__ = {
      "/api/v1/inbox/item-types": { item_types: [] },
      "/api/v1/inbox?status=": {
        success: true,
        items: [],
        total_count: 0,
        item_count: 12,
        pending_count: 7,
        resolved_count: 5,
        urgent_count: 1,
        high_count: 2,
        component_id: "cmp-1",
      },
    }

    const w = mount(Inbox)
    await flushPromises()
    await flushPromises()

    expect((globalThis as any).__realtimeHandlers__.length).toBeGreaterThan(0)
    expect(w.text()).toContain("7 pending")
    // A meta.changed carrying no counts must not zero the loaded stats.
    ;(globalThis as any).__emitRealtime__({
      topic: "component.cmp-1",
      data: { event: "component.meta.changed", component_id: "cmp-1", meta: { status: "ready" } },
    })
    await flushPromises()
    expect(w.text()).toContain("7 pending")
    w.unmount()
  })
})
