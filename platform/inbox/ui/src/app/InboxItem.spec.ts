import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import declarations from "../../../src/_index.yaml?raw"
import InboxItem from "./InboxItem.vue"

function decisionItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "item-1",
    item_type: "flow_decision",
    title: "Approve this refund?",
    content: "fallback text",
    priority: "high",
    status: "pending",
    metadata: {
      context: { amount: 42, customer_tier: "gold" },
      approve_label: "Approve refund",
      reject_label: "Deny refund",
      ...overrides,
    },
  }
}

describe("InboxItem flow_decision rendering", () => {
  it("shows no resolution actions without a canonical type declaration", () => {
    const w = mount(InboxItem, { props: { item: decisionItem() } })
    expect(w.findAll('[data-testid="inbox-action"]')).toHaveLength(0)
  })

  it("renders an object context as labeled rows instead of raw content", () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item: decisionItem() } })
    expect(w.text()).toContain("Amount")
    expect(w.text()).toContain("42")
    expect(w.text()).toContain("Customer Tier")
    expect(w.text()).not.toContain("fallback text")
  })

  it("renders a string context through the markdown renderer", () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item: decisionItem({ context: "Refund requested by a **VIP** customer." }) } })
    const md = w.find("wc-render-markdown")
    expect(md.exists()).toBe(true)
    expect(md.attributes("source")).toContain("Refund requested by a **VIP** customer.")
  })

  it("falls back to item.content when metadata.context is absent", () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item: decisionItem({ context: undefined }) } })
    expect(w.find("wc-render-markdown").attributes("source")).toContain("fallback text")
  })

  it("uses metadata.approve_label / reject_label on the resolution buttons", () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item: decisionItem() } })
    const labels = w.findAll("button").map((b) => b.text())
    expect(labels.some((t) => t.includes("Approve refund"))).toBe(true)
    expect(labels.some((t) => t.includes("Deny refund"))).toBe(true)
  })

  it("collects form field values and submits them with the resolve action", async () => {
    const item = decisionItem({
      form: {
        type: "object",
        required: ["reason"],
        properties: {
          reason: { type: "string", title: "Reason" },
          tier: { type: "string", title: "Tier", enum: ["gold", "silver"] },
          confirmed: { type: "boolean", title: "Confirmed" },
        },
      },
    })
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item } })

    const approveBtn = w.findAll("button")[0]
    expect((approveBtn.element as HTMLButtonElement).disabled).toBe(true)

    await w.find('input[type="text"]').setValue("Customer requested it")
    await w.findComponent({ name: 'Select' }).setValue("silver")
    await w.findComponent({ name: 'Checkbox' }).setValue(true)

    expect((approveBtn.element as HTMLButtonElement).disabled).toBe(false)
    await approveBtn.trigger("click")

    const emitted = w.emitted("resolve")
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual({
      id: "item-1",
      action: "approve",
      form: { reason: "Customer requested it", tier: "silver", confirmed: true },
    })
  })

  it("prefills a required field and submits its unchanged declared default", async () => {
    const item = decisionItem({ form: {
      type: "object", required: ["call_slot"],
      properties: { call_slot: { type: "string", title: "Proposed call slot", default: "Thu 10:00 PT" } },
    } })
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item } })
    expect((w.find('input[type="text"]').element as HTMLInputElement).value).toBe("Thu 10:00 PT")
    const approve = w.find('[data-testid="inbox-action"]')
    expect((approve.element as HTMLButtonElement).disabled).toBe(false)
    await approve.trigger("click")
    expect(w.emitted("resolve")?.[0]?.[0]).toEqual({ id: "item-1", action: "approve", form: { call_slot: "Thu 10:00 PT" } })
  })

  it("edits a prefilled multiline draft and submits the corrected value", async () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject"], item: decisionItem({
      prompt: "Correct the draft before approving.",
      form: { type: "object", required: ["body"], properties: {
        body: { type: "string", format: "textarea", title: "Email draft", default_expr: "input.draft", default: "Hello\nOriginal draft" },
      } },
    }) } })
    expect(w.find('wc-render-markdown[source="Correct the draft before approving."]').exists()).toBe(true)
    const draft = w.find('textarea[data-testid="decision-body"]')
    expect(draft.exists()).toBe(true)
    expect((draft.element as HTMLTextAreaElement).value).toBe("Hello\nOriginal draft")
    await draft.setValue("Hello\nCorrected draft")
    await w.find('[data-testid="inbox-action"]').trigger("click")
    expect(w.emitted("resolve")?.[0]?.[0]).toEqual({
      id: "item-1", action: "approve", form: { body: "Hello\nCorrected draft" },
    })
  })

  it("preserves numeric and boolean enum defaults in the submitted form", async () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject"], item: decisionItem({
      form: { type: "object", properties: {
        stage: { type: "integer", enum: [0, 1], default: 0 },
        notify: { type: "boolean", enum: [false, true], default: false },
      } },
    }) } })
    const selects = w.findAllComponents({ name: 'Select' })
    expect(selects[0].props('modelValue')).toBe(0)
    expect(selects[1].props('modelValue')).toBe(false)
    await w.find('[data-testid="inbox-action"]').trigger("click")
    expect(w.emitted("resolve")?.[0]?.[0]).toEqual({
      id: "item-1", action: "approve", form: { stage: 0, notify: false },
    })
  })

  it("allows rejection with missing required fields and submits values as entered", async () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item: decisionItem({
      form: { type: "object", required: ["reason", "confirmed"], properties: {
        reason: { type: "string" }, confirmed: { type: "boolean" }, note: { type: "string" },
      } },
    }) } })
    await w.find('[data-testid="decision-note"]').setValue("Cannot approve this")
    const [approve, reject] = w.findAll('[data-testid="inbox-action"]')
    expect(approve.attributes("disabled")).toBeDefined()
    expect(reject.attributes("disabled")).toBeUndefined()
    await reject.trigger("click")
    expect(w.emitted("resolve")?.[0]?.[0]).toEqual({
      id: "item-1", action: "reject", form: { reason: "", confirmed: false, note: "Cannot approve this" },
    })
    w.unmount()
  })

  it("disables all resolution buttons and shows a resolving label while in flight", () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item: decisionItem(), resolving: true, resolvingAction: "approve" } })
    const buttons = w.findAll('[data-testid="inbox-action"]')
    for (const b of buttons) expect((b.element as HTMLButtonElement).disabled).toBe(true)
    expect(w.text()).toContain("Resolving…")
  })
})

describe("InboxItem header type and time", () => {
  const noticeItem = {
    id: "item-3",
    item_type: "precall_brief_review",
    title: "Review pre-call brief",
    content: "Body",
    priority: "normal",
    status: "pending",
    created_at: Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60,
  }

  it("humanizes a raw item_type when the kind declares no title", () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item: noticeItem } })
    const meta = w.find(".kx-detail-meta")
    expect(meta.text()).toContain("Precall Brief Review")
    expect(meta.text()).not.toContain("precall_brief_review")
  })

  it("prefers the declared item-type title over the humanized fallback", () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item: noticeItem, typeLabel: "Pre-call brief" } })
    const meta = w.find(".kx-detail-meta")
    expect(meta.text()).toContain("Pre-call brief")
    expect(meta.text()).not.toContain("Precall Brief Review")
  })

  it("renders a relative time with the absolute timestamp in the tooltip", () => {
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item: noticeItem } })
    const timeEl = w.findAll(".kx-detail-meta span").find((s) => /ago$/.test(s.text()))
    expect(timeEl).toBeTruthy()
    expect(timeEl!.text()).toBe("2d ago")
    // The absolute form stays one hover away rather than on the face.
    expect(timeEl!.attributes("title")).toBe(new Date(noticeItem.created_at * 1000).toLocaleString())
  })
})

describe("InboxItem non-decision rendering is unchanged", () => {
  it("renders content and generic metadata.fields, ignoring the decision branch", () => {
    const item = {
      id: "item-2",
      item_type: "notice",
      title: "Heads up",
      content: "Plain content",
      priority: "low",
      status: "pending",
      metadata: { fields: [{ label: "Status", value: "green" }] },
    }
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item } })
    expect(w.find("wc-render-markdown").attributes("source")).toContain("Plain content")
    expect(w.text()).toContain("Status")
    expect(w.text()).toContain("green")
    const labels = w.findAll("button").map((b) => b.text())
    expect(labels.some((t) => t.includes("Approve"))).toBe(true)
  })
})

describe("InboxItem custom item-type actions", () => {
  it("preserves declared custom action order and humanizes their labels", async () => {
    const item = {
      id: "item-custom",
      item_type: "crm_merge_review",
      title: "Review duplicate",
      content: "Choose the merge action",
      priority: "normal",
      status: "pending",
      metadata: {},
    }
    const w = mount(InboxItem, {
      props: { item, actions: ["merge_and_set_primary", "not_same_person", "skip"] },
    })
    const buttons = w.findAll('[data-testid="inbox-action"]')
    expect(buttons.map((button) => button.text())).toEqual([
      "Merge And Set Primary",
      "Not Same Person",
      "Skip",
    ])
    await buttons[1].trigger("click")
    expect(w.emitted("resolve")?.[0]?.[0]).toEqual({ id: "item-custom", action: "not_same_person" })
  })

  it("hides pending host actions only when the declaration assigns them to the component", () => {
    const item = {
      id: "item-component-owned",
      item_type: "custom_review",
      title: "Review in component",
      content: "Component body",
      priority: "normal",
      status: "pending",
      metadata: {},
    }
    const w = mount(InboxItem, {
      props: { item, actionOwner: "component", actions: ["approve", "reject"] },
    })
    expect(w.findAll('[data-testid="inbox-action"]')).toHaveLength(0)
  })

  it("does not let item metadata claim action ownership", () => {
    const item = {
      id: "item-metadata-owner",
      item_type: "custom_review",
      title: "Host review",
      content: "Host body",
      priority: "normal",
      status: "pending",
      metadata: { action_owner: "component" },
    }
    const w = mount(InboxItem, { props: { item, actions: ["approve"] } })
    expect(w.findAll('[data-testid="inbox-action"]').map((button) => button.text())).toEqual(["Approve"])
  })

  it("keeps resolved status and delete controls for component-owned actions", async () => {
    const item = {
      id: "item-resolved",
      item_type: "custom_review",
      title: "Reviewed",
      content: "Component body",
      priority: "normal",
      status: "approved",
      resolved_at: 1_700_000_000,
      metadata: {},
    }
    const w = mount(InboxItem, { props: { item, actionOwner: "component" } })
    expect(w.find(".kx-resolved").text()).toContain("Approved")
    const deleteButton = w.find('[data-testid="inbox-delete"]')
    expect(deleteButton.text()).toContain("Delete")
    await deleteButton.trigger("click")
    expect(w.emitted("delete")?.[0]?.[0]).toBe("item-resolved")
  })
})

describe("InboxItem resolved decisions", () => {
  it.each(["approve", "reject"])("shows %s and the submitted form read-only", (action) => {
    const item = { ...decisionItem({ form: { type: "object", properties: {
      reason: { type: "string", title: "Review reason" }, count: { type: "number" }, confirmed: { type: "boolean" },
    } } }), status: action === "approve" ? "approved" : "rejected", action,
      form: { reason: "Entered reason", count: 0, confirmed: false, extra_note: "Preserved extra" } }
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item } })
    expect(w.find('[data-testid="decision-outcome"]').text()).toContain(action === "approve" ? "Approve refund" : "Deny refund")
    expect(w.find('[data-testid="decision-submitted-form"]').text()).toContain("Review reason")
    expect(w.text()).toContain("Entered reason")
    expect(w.text()).toContain("0")
    expect(w.text()).toContain("false")
    expect(w.text()).toContain("Preserved extra")
    expect(w.findAll("input")).toHaveLength(0)
    expect(w.findAll('[data-testid="inbox-action"]')).toHaveLength(0)
    expect(w.find(".kx-form-hint").exists()).toBe(false)
    w.unmount()
  })

  it("switches an open pending decision to its submitted form when resolved", async () => {
    const item = decisionItem({ form: { type: "object", properties: { reason: { type: "string" } } } })
    const w = mount(InboxItem, { props: { actions: ["approve", "reject", "dismiss"], item } })
    await w.find('input[type="text"]').setValue("Unsaved edit")
    await w.setProps({ item: { ...item, status: "rejected", action: "reject", form: { reason: "Committed value" } } })
    expect(w.text()).toContain("Committed value")
    expect(w.text()).not.toContain("Unsaved edit")
    expect(w.findAll("input")).toHaveLength(0)
    w.unmount()
  })
})


describe("InboxItem declared built-in actions", () => {
  function declaredActions(type: string): string[] {
    const entry = declarations.split(`  - name: item_type.${type}\n`)[1]?.split("\n  - name:")[0]
    const actions = entry?.match(/^      actions: \[([^\]]+)\]/m)?.[1]
    expect(actions, `${type} must declare its resolution actions`).toBeDefined()
    return actions!.split(",").map(action => action.trim())
  }
  function item(type: string) {
    return { id: `item-${type}`, item_type: type, title: "Review", content: "Body", priority: "normal", status: "pending" }
  }
  it("renders Dismiss for the built-in notice declaration", async () => {
    const w = mount(InboxItem, { props: { item: item("notice"), actions: declaredActions("notice") } })
    const buttons = w.findAll('[data-testid="inbox-action"]')
    expect(buttons.map(button => button.text())).toEqual(["Dismiss"])
    await buttons[0].trigger("click")
    expect(w.emitted("resolve")?.[0]?.[0]).toEqual({ id: "item-notice", action: "dismiss" })
    w.unmount()
  })
  it("renders the system declaration's complete action set", () => {
    const w = mount(InboxItem, { props: { item: item("system"), actions: declaredActions("system") } })
    expect(w.findAll('[data-testid="inbox-action"]').map(button => button.text())).toEqual(["Approve", "Reject", "Dismiss"])
    w.unmount()
  })
  it("renders exactly the declared actions without adding built-in buttons", () => {
    const w = mount(InboxItem, { props: { item: item("custom"), actions: ["done", "snooze"] } })
    expect(w.findAll('[data-testid="inbox-action"]').map(button => button.text())).toEqual(["Done", "Snooze"])
    w.unmount()
  })
})
