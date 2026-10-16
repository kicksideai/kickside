import { describe, it, expect } from "vitest"
import { componentMetaEvent } from "@widgets/app/componentRealtime"
import { statusLabel, humanizeItemType, INBOX_META_FIELD_TYPES } from "./labels"

describe("inbox public-meta field types", () => {
  it("coerces raw TEXT count values to numbers through the shared seam", () => {
    const event = componentMetaEvent(
      {
        event: "component.meta.changed",
        component_id: "cmp-1",
        meta: { item_count: "12", pending_count: "7", resolved_count: "5", urgent_count: "1", high_count: "2" },
      },
      "cmp-1",
      INBOX_META_FIELD_TYPES,
    )
    expect(event).not.toBeNull()
    for (const key of Object.keys(INBOX_META_FIELD_TYPES)) {
      expect(typeof event?.meta[key]).toBe("number")
    }
    expect(event?.meta.pending_count).toBe(7)
    expect(event?.meta.item_count).toBe(12)
  })
})

describe("inbox status labels", () => {
  it("maps each declared status enum value to a human label", () => {
    expect(statusLabel("pending")).toBe("Pending")
    expect(statusLabel("resolved")).toBe("Resolved")
    expect(statusLabel("approved")).toBe("Approved")
    expect(statusLabel("rejected")).toBe("Rejected")
    expect(statusLabel("dismissed")).toBe("Dismissed")
  })

  it("falls back to the raw token for an unknown status and empty for none", () => {
    expect(statusLabel("mystery")).toBe("mystery")
    expect(statusLabel()).toBe("")
  })
})

describe("inbox item-type humanization", () => {
  it("de-snake-cases a raw item_type token to Title Case", () => {
    expect(humanizeItemType("precall_brief_review")).toBe("Precall Brief Review")
    expect(humanizeItemType("flow.decision")).toBe("Flow Decision")
    expect(humanizeItemType("notice")).toBe("Notice")
  })

  it("returns empty for a missing item_type", () => {
    expect(humanizeItemType()).toBe("")
    expect(humanizeItemType("")).toBe("")
  })
})
