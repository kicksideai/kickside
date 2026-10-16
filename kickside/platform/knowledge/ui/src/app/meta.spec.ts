import { describe, it, expect } from "vitest"
import { componentMetaEvent } from "@widgets/app/componentRealtime"
import { KNOWLEDGE_META_FIELD_TYPES, KNOWLEDGE_COUNT_KEYS } from "./meta"

describe("knowledge public-meta field types", () => {
  it("coerces raw TEXT count values to numbers through the shared seam", () => {
    const event = componentMetaEvent(
      {
        event: "component.meta.changed",
        component_id: "kb1",
        meta: { document_count: "4", embedding_count: "12", claim_count: "3", title: "Docs" },
      },
      "kb1",
      KNOWLEDGE_META_FIELD_TYPES,
    )
    expect(event).not.toBeNull()
    for (const key of KNOWLEDGE_COUNT_KEYS) {
      expect(typeof event?.meta[key]).toBe("number")
    }
    expect(event?.meta.document_count).toBe(4)
    expect(event?.meta.embedding_count).toBe(12)
    // Non-count string fields pass through untouched.
    expect(event?.meta.title).toBe("Docs")
  })
})
