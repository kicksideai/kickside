import { describe, it, expect } from "vitest"
import { humanizeKey, formatContext, decisionFields, defaultFormValues, missingRequired } from "./decision"

describe("humanizeKey", () => {
  it("turns a snake_case or kebab-case key into a title-cased label", () => {
    expect(humanizeKey("refund_amount")).toBe("Refund Amount")
    expect(humanizeKey("customer-tier")).toBe("Customer Tier")
  })

  it("returns the raw key when it has no usable characters", () => {
    expect(humanizeKey("")).toBe("")
    expect(humanizeKey("___")).toBe("___")
  })
})

describe("formatContext", () => {
  it("is empty for null, undefined, and an empty string", () => {
    expect(formatContext(null)).toEqual({ kind: "empty" })
    expect(formatContext(undefined)).toEqual({ kind: "empty" })
    expect(formatContext("")).toEqual({ kind: "empty" })
  })

  it("renders a string context as text", () => {
    expect(formatContext("Refund request from a VIP customer.")).toEqual({
      kind: "text",
      text: "Refund request from a VIP customer.",
    })
  })

  it("renders a plain object as labeled rows, flagging long values", () => {
    const view = formatContext({ amount: 42, customer_tier: "gold", note: "x".repeat(90) })
    expect(view.kind).toBe("rows")
    if (view.kind !== "rows") throw new Error("expected rows")
    expect(view.rows).toEqual([
      { key: "amount", label: "Amount", value: "42", long: false },
      { key: "customer_tier", label: "Customer Tier", value: "gold", long: false },
      { key: "note", label: "Note", value: "x".repeat(90), long: true },
    ])
  })

  it("treats a nested value as a compact printed block, not raw JSON inline", () => {
    const view = formatContext({ items: [1, 2, 3] })
    expect(view.kind).toBe("rows")
    if (view.kind !== "rows") throw new Error("expected rows")
    expect(view.rows[0].value).toBe(JSON.stringify([1, 2, 3], null, 2))
    expect(view.rows[0].long).toBe(true)
  })

  it("is empty for an object with no own keys", () => {
    expect(formatContext({})).toEqual({ kind: "empty" })
  })

  it("falls back to a printed form for an array or primitive context", () => {
    expect(formatContext([1, 2])).toEqual({ kind: "text", text: "[\n  1,\n  2\n]" })
    expect(formatContext(7)).toEqual({ kind: "text", text: "7" })
  })
})

describe("decisionFields", () => {
  it("is empty when form is missing or not a JSON Schema object", () => {
    expect(decisionFields(undefined)).toEqual([])
    expect(decisionFields({})).toEqual([])
  })

  it("reads a well-formed form schema", () => {
    const fields = decisionFields({
      type: "object",
      required: ["reason"],
      properties: {
        reason: { title: "Reason", type: "string" },
        tier: { title: "Tier", type: "string", enum: ["gold", "silver"] },
      },
    })
    expect(fields).toEqual([
      { key: "reason", label: "Reason", type: "text", required: true, options: [] },
      { key: "tier", label: "Tier", type: "select", required: false, options: ["gold", "silver"] },
    ])
  })

  it("ignores malformed or unsupported schema properties", () => {
    const fields = decisionFields({ type: "object", properties: { unknown: { type: "mystery" }, broken: null } })
    expect(fields).toEqual([])
  })
})

describe("defaultFormValues / missingRequired", () => {
  const fields = decisionFields({
    type: "object",
    required: ["reason", "confirm"],
    properties: {
      reason: { title: "Reason", type: "string" },
      confirm: { title: "Confirm", type: "boolean" },
    },
  })

  it("seeds text/select/number fields empty and checkboxes false", () => {
    expect(defaultFormValues(fields)).toEqual({ reason: "", confirm: false })
  })

  it("seeds supported controls with schema defaults, including zero and false", () => {
    const fields = decisionFields({ type: "object", required: ["owner"], properties: {
      call_slot: { type: "string", default: "Thu 10:00 PT" },
      owner: { type: "string", enum: ["Maya Chen", "Tomas Varga"], default: "Tomas Varga" },
      seats: { type: "integer", default: 3 },
      amount: { type: "number", default: 0 },
      notify: { type: "boolean", default: true },
      delayed: { type: "boolean", default: false },
    } })
    expect(defaultFormValues(fields)).toEqual({ call_slot: "Thu 10:00 PT", owner: "Tomas Varga", seats: 3, amount: 0, notify: true, delayed: false })
    expect(missingRequired(fields, defaultFormValues(fields))).toBe(false)
  })

  it("ignores defaults that the declared controls cannot hold", () => {
    const fields = decisionFields({ type: "object", properties: {
      text: { type: "string", default: 4 },
      amount: { type: "number", default: "4" },
      infinite: { type: "number", default: Infinity },
      fraction: { type: "integer", default: 1.5 },
      notify: { type: "boolean", default: "true" },
      owner: { type: "string", enum: ["Maya"], default: "Tomas" },
    } })
    expect(defaultFormValues(fields)).toEqual({ text: "", amount: "", infinite: "", fraction: "", notify: false, owner: "" })
  })

  it("flags a missing required text value and a false required checkbox", () => {
    expect(missingRequired(fields, { reason: "", confirm: false })).toBe(true)
    expect(missingRequired(fields, { reason: "  ", confirm: true })).toBe(true)
    expect(missingRequired(fields, { reason: "ok", confirm: true })).toBe(false)
  })

  it("treats 0 as a filled required value, not a missing one", () => {
    const numeric = decisionFields({ type: "object", required: ["amount"], properties: { amount: { type: "number" } } })
    expect(missingRequired(numeric, { amount: 0 })).toBe(false)
  })
})
