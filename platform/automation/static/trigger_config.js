import { W as ce, u as nt, a as rt, e as it, b as st } from "./errMsg-CFwf-kA2.js";
import { o as at, n as ee, P as lt } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DdaB0Y7l.js";
import { defineComponent as te, ref as $, useId as ct, computed as m, watch as q, nextTick as we, openBlock as p, createElementBlock as h, Fragment as L, createElementVNode as d, unref as x, createVNode as _, toDisplayString as P, withCtx as ut, withDirectives as R, vModelText as W, renderList as _e, normalizeClass as G, createCommentVNode as k, reactive as dt, createTextVNode as ue, vModelCheckbox as pt, createBlock as J, onMounted as ft } from "vue";
import { Icon as O } from "@iconify/vue";
import { loadByTagName as mt, api as ht, define as vt } from "@wippy-fe/proxy";
const yt = ["aria-expanded", "aria-controls", "aria-label", "disabled"], gt = { class: "p-select-label" }, bt = {
  key: 0,
  class: "kx-ps-val"
}, xt = { class: "kx-ps-val-label" }, kt = {
  key: 1,
  class: "kx-ps-ph"
}, wt = { class: "p-select-dropdown" }, _t = { class: "p-select-overlay kx-ps-panel" }, St = { class: "p-select-header" }, $t = ["aria-label", "aria-controls", "aria-activedescendant"], Ct = ["id", "aria-label"], Tt = {
  class: "p-select-option-group",
  role: "presentation"
}, zt = ["id", "aria-selected", "onClick", "onMousemove"], Et = { class: "kx-ps-opt-body" }, Ot = { class: "kx-ps-opt-title" }, Pt = {
  key: 0,
  class: "kx-ps-opt-sub"
}, At = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, Vt = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, jt = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, Mt = ["disabled"], It = /* @__PURE__ */ te({
  __name: "PickerSelect",
  props: {
    items: {},
    modelValue: {},
    placeholder: {},
    ariaLabel: {},
    disabled: { type: Boolean },
    remote: { type: Boolean },
    loading: { type: Boolean },
    more: { type: Boolean },
    error: {}
  },
  emits: ["update:modelValue", "search", "more"],
  setup(e, { emit: n }) {
    const r = e, i = n, t = $(null), l = $(null), f = $(!1), u = $(""), s = $(0), v = ct(), z = m(() => {
      const c = u.value.trim().toLowerCase(), g = /* @__PURE__ */ new Map();
      for (const y of r.items) {
        if (!r.remote && c && ![y.title, y.subtitle, y.id, y.group].some((B) => B?.toLowerCase().includes(c))) continue;
        const A = y.group || "Other", b = g.get(A);
        b ? b.push(y) : g.set(A, [y]);
      }
      let w = 0;
      return [...g.entries()].sort((y, A) => y[0].localeCompare(A[0])).map(([y, A]) => ({ group: y, items: A.map((b) => ({ item: b, index: w++ })) }));
    }), C = m(() => z.value.flatMap((c) => c.items)), V = m(() => r.items.find((c) => c.id === r.modelValue)), T = m(() => C.value[s.value] ? `${v}-${s.value}` : void 0);
    q(u, () => {
      s.value = 0;
    }), q([f, u], ([c, g]) => {
      c && r.remote && i("search", g);
    }), q(() => r.disabled, (c) => {
      c && (f.value = !1);
    }), q(f, async (c) => {
      if (!c) {
        t.value?.focus();
        return;
      }
      u.value = "", s.value = Math.max(0, C.value.findIndex(({ item: g }) => g.id === r.modelValue)), await we(), l.value?.focus();
    });
    function E(c) {
      r.disabled || r.loading || (i("update:modelValue", c.id), f.value = !1);
    }
    async function j(c) {
      if (c.key === "Escape" && f.value) {
        c.preventDefault(), c.stopPropagation(), f.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(c.key)) return;
      if (c.preventDefault(), !f.value) {
        f.value = !0;
        return;
      }
      if (c.key === "Enter") {
        const y = C.value[s.value];
        y && E(y.item);
        return;
      }
      const g = C.value.length - 1;
      s.value = c.key === "Home" ? 0 : c.key === "End" ? g : Math.max(0, Math.min(g, s.value + (c.key === "ArrowDown" ? 1 : -1))), await we(), t.value?.getRootNode()?.querySelector(`[id="${T.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (c, g) => (p(), h(L, null, [
      d("button", {
        ref_key: "anchor",
        ref: t,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": f.value,
        "aria-controls": x(v),
        "aria-label": e.ariaLabel,
        disabled: e.disabled,
        onClick: g[0] || (g[0] = (w) => f.value = !f.value),
        onKeydown: j
      }, [
        d("span", gt, [
          V.value ? (p(), h("span", bt, [
            _(x(O), {
              icon: V.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            d("span", xt, P(V.value.title), 1)
          ])) : (p(), h("span", kt, P(e.placeholder || "Select…"), 1))
        ]),
        d("span", wt, [
          _(x(O), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, yt),
      _(at, {
        open: f.value,
        "onUpdate:open": g[3] || (g[3] = (w) => f.value = w),
        anchor: t.value
      }, {
        default: ut(() => [
          d("div", _t, [
            d("div", St, [
              R(d("input", {
                ref_key: "search",
                ref: l,
                "onUpdate:modelValue": g[1] || (g[1] = (w) => u.value = w),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${e.ariaLabel || e.placeholder || "options"}`,
                "aria-controls": x(v),
                "aria-activedescendant": T.value,
                onKeydown: j
              }, null, 40, $t), [
                [W, u.value]
              ])
            ]),
            d("ul", {
              id: x(v),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": e.ariaLabel || e.placeholder || "Options"
            }, [
              (p(!0), h(L, null, _e(z.value, (w) => (p(), h(L, {
                key: w.group
              }, [
                d("li", Tt, P(w.group), 1),
                (p(!0), h(L, null, _e(w.items, ({ item: y, index: A }) => (p(), h("li", {
                  id: `${x(v)}-${A}`,
                  key: y.id,
                  class: G(["p-select-option kx-ps-option", { "p-select-option-selected": y.id === e.modelValue, "p-focus": A === s.value }]),
                  role: "option",
                  "aria-selected": y.id === e.modelValue,
                  onClick: (b) => E(y),
                  onMousemove: (b) => s.value = A
                }, [
                  _(x(O), {
                    icon: y.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  d("span", Et, [
                    d("span", Ot, P(y.title), 1),
                    y.subtitle ? (p(), h("span", Pt, P(y.subtitle), 1)) : k("", !0)
                  ])
                ], 42, zt))), 128))
              ], 64))), 128)),
              e.loading ? (p(), h("li", At, "Loading…")) : !C.value.length && !e.error ? (p(), h("li", Vt, "No matches")) : k("", !0)
            ], 8, Ct),
            e.error ? (p(), h("div", jt, P(e.error), 1)) : k("", !0),
            e.more ? (p(), h("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: e.loading || e.disabled,
              onClick: g[2] || (g[2] = (w) => i("more"))
            }, "Load more", 8, Mt)) : k("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), Se = 2, Nt = ["once", "interval", "ticker", "cron"], Ut = /* @__PURE__ */ new Set(["v", "source", "config", "schedule", "backfill", "filter", "poll", "delivery"]), Dt = /* @__PURE__ */ new Set(["expr"]);
function Q(e) {
  return typeof e == "string" ? e.trim() : "";
}
function Ht(e) {
  return typeof e == "number" && Number.isInteger(e) && e > 0;
}
function U(e) {
  return { error: { code: "invalid_spec", message: e } };
}
function Ee(e, n) {
  const r = [];
  let i = !1, t = !1;
  for (const l of n)
    String(l.id || "") === e && (t = !0, l.surface === "events" && typeof l.event == "string" && l.event ? r.push(l.event) : l.surface === "collection" && (i = !0));
  return t ? { source: e, triggerTypes: r, hasTrigger: r.length > 0, hasPull: i } : null;
}
function $e(e, n = []) {
  const r = /* @__PURE__ */ new Map();
  for (const t of e) {
    const l = String(t.id || "");
    l && (r.has(l) || r.set(l, []), r.get(l).push(t));
  }
  const i = [];
  for (const [t, l] of r) {
    if (n.length && !l.some((v) => n.includes(String(v.class || "")))) continue;
    const f = Ee(t, l), u = l[0];
    let s;
    for (const v of l) {
      const z = v.config_schema;
      if (z) {
        s || (s = {});
        for (const [C, V] of Object.entries(z))
          C in s || (s[C] = V);
      }
    }
    i.push({
      ...f,
      id: t,
      title: u.title || u.name || t,
      icon: u.icon || "",
      group: u.group || "",
      description: u.description || "",
      provider: u.provider || "",
      class: String(u.class || ""),
      component: u.component,
      outputSchema: u.output_schema,
      fields: s
    });
  }
  return i;
}
function Rt(e) {
  if (e == null) return { out: null };
  if (typeof e != "object" || Array.isArray(e)) return { error: "How often must carry a schedule type and expression." };
  const n = e, r = Q(n.type);
  if (!Nt.includes(r))
    return { error: "How often must be one of: once, interval, ticker, cron." };
  const i = Q(n.expression);
  if (!i) return { error: "How often needs an expression." };
  for (const t of Object.keys(n))
    if (t !== "type" && t !== "expression") return { error: `How often has an unknown field: ${t}.` };
  return { out: { type: r, expression: i } };
}
function Ft(e) {
  if (e == null) return { out: null };
  if (e === "all" || e === "none") return { out: e };
  if (typeof e == "object" && !Array.isArray(e)) {
    const n = e, r = Q(n.since), i = n.last_days;
    if (i != null && !Ht(i))
      return { error: 'History "last days" must be a positive whole number.' };
    if (!r && i == null)
      return { error: "History must be all, only new, a number of days, or a start date." };
    const t = {};
    return r && (t.since = r), i != null && (t.last_days = i), { out: t };
  }
  return { error: "History must be all, only new, a number of days, or a start date." };
}
function Oe(e, n, r) {
  return e == null ? {} : typeof e != "number" || !Number.isSafeInteger(e) || e < r ? { error: `${n} must be an integer of at least ${r}.` } : { value: e };
}
function Lt(e) {
  if (e == null) return { out: {} };
  if (typeof e != "object" || Array.isArray(e)) return { error: "Poll settings must be an object." };
  const n = e, r = /* @__PURE__ */ new Set(["page_size", "max_pages_per_run", "max_items_per_run"]);
  for (const t of Object.keys(n)) if (!r.has(t)) return { error: `Poll settings have an unknown field: ${t}.` };
  const i = {};
  for (const [t, l, f] of [
    ["page_size", "Page size", 1],
    ["max_pages_per_run", "Pages per run", 1],
    ["max_items_per_run", "Items per run", 0]
  ]) {
    const u = Oe(n[t], l, f);
    if (u.error) return { error: u.error };
    u.value !== void 0 && (i[t] = u.value);
  }
  return { out: i };
}
function Wt(e) {
  if (e == null) return {};
  if (typeof e != "object" || Array.isArray(e)) return { error: "Delivery settings must be an object." };
  const n = e;
  for (const i of Object.keys(n))
    if (i !== "retry_after_ms") return { error: `Delivery settings have an unknown field: ${i}.` };
  const r = Oe(n.retry_after_ms, "Delivery retry delay", 1);
  return r.error ? { error: r.error } : { out: r.value !== void 0 ? { retry_after_ms: r.value } : {} };
}
function Bt(e) {
  if (e == null || typeof e != "object" || Array.isArray(e))
    return { error: "Trigger settings must be an object." };
  const n = e;
  if (n.v !== Se) return { error: "Trigger settings require v = 2." };
  for (const s of Object.keys(n))
    if (!Ut.has(s)) return { error: `Trigger settings have an unknown field: ${s}.` };
  const r = n.filter;
  if (r != null && (typeof r != "object" || Array.isArray(r)))
    return { error: "The event filter must be an object." };
  const i = r ?? {};
  for (const s of Object.keys(i))
    if (!Dt.has(s)) return { error: `The event filter has an unknown field: ${s}.` };
  if (i.expr != null && typeof i.expr != "string")
    return { error: "The filter expression must be text." };
  const t = Rt(n.schedule);
  if (t.error) return { error: t.error };
  const l = Ft(n.backfill);
  if (l.error) return { error: l.error };
  const f = Lt(n.poll);
  if (f.error) return { error: f.error };
  const u = Wt(n.delivery);
  return u.error ? { error: u.error } : {
    spec: {
      v: Se,
      source: Q(n.source),
      config: typeof n.config == "object" && n.config && !Array.isArray(n.config) ? { ...n.config } : {},
      filter: { expr: Q(i.expr) },
      schedule: t.out,
      backfill: l.out,
      poll: n.poll == null ? void 0 : f.out,
      delivery: u.out
    }
  };
}
function Kt(e) {
  return e.backfill != null ? U(`History imports a source's existing items — "On a schedule" has no source.`) : e.schedule ? e.poll != null ? U("Poll settings apply only to a collection source.") : { resolution: { mode: "timer", spec: e } } : U("How often is required — pick a schedule.");
}
function qt(e) {
  if (e.schedule)
    return U("This source runs on each incoming event — a schedule does not apply.");
  if (e.poll != null) return U("Poll settings apply only to a collection source.");
  const n = e.backfill;
  return n == null ? U("History is required for this source — choose all or only new.") : n === "all" || n === "none" ? { resolution: { mode: "watch", spec: e } } : U('This is an events source — History can be "All" (from the start) or "Only new".');
}
function Jt(e) {
  return e.backfill == null ? U("History is required for this source — choose all, only new, a number of days, or a start date.") : e.schedule ? { resolution: { mode: "poll", spec: e } } : U("How often is required for this source — pick a cadence.");
}
function Yt(e, n) {
  const r = Bt(e);
  if (r.error || !r.spec) return { error: { code: "invalid_spec", message: r.error || "Invalid trigger settings." } };
  const i = r.spec;
  if (!i.source) return Kt(i);
  const t = Ee(i.source, n);
  return t ? t.hasTrigger ? qt(i) : t.hasPull ? Jt(i) : U("This source announces no events and cannot be checked for items.") : { error: { code: "source_not_found", message: "This source is not available." } };
}
function F(e) {
  return e === null || typeof e != "object" ? JSON.stringify(e) ?? "null" : Array.isArray(e) ? `[${e.map(F).join(",")}]` : `{${Object.keys(e).sort().filter((i) => e[i] !== void 0).map((i) => `${JSON.stringify(i)}:${F(e[i])}`).join(",")}}`;
}
const Pe = "ticker", Gt = {
  type: "object",
  properties: {
    fired_at: { type: "string", format: "date-time", title: "Fired at" },
    occurred_at: { type: "string", format: "date-time", title: "Occurred at" },
    schedule: {
      type: "object",
      title: "Schedule",
      properties: {
        type: { type: "string" },
        expression: { type: "string" },
        tz: { type: "string" }
      }
    }
  }
}, Qt = [
  ["0", "Sunday"],
  ["1", "Monday"],
  ["2", "Tuesday"],
  ["3", "Wednesday"],
  ["4", "Thursday"],
  ["5", "Friday"],
  ["6", "Saturday"]
], Xt = Qt.map(([e, n]) => ({ label: n, value: e })), Zt = [
  { label: "minutes", value: "m" },
  { label: "hours", value: "h" },
  { label: "days", value: "d" }
], eo = [
  { label: "Daily", value: "daily" },
  { label: "Weekdays", value: "weekdays" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Custom cron expression", value: "custom" }
];
function Ce(e) {
  const n = Math.floor(Number(e));
  return Number.isFinite(n) && n > 0 ? n : null;
}
function to(e) {
  const n = typeof e == "string" ? e.trim().match(/^([1-9]\d*)([mhd])$/) : null;
  return n ? { n: Number(n[1]), unit: n[2] } : null;
}
function Te(e) {
  return String(e).padStart(2, "0");
}
function Ae(e, n) {
  if (!/^\d+$/.test(e) || !/^\d+$/.test(n)) return null;
  const r = Number(e), i = Number(n);
  return r < 0 || r > 59 || i < 0 || i > 23 ? null : `${Te(i)}:${Te(r)}`;
}
function oo(e) {
  const n = typeof e == "string" ? e.trim() : "", r = n.split(/\s+/);
  if (r.length !== 5) return n ? { preset: "custom", time: "", custom: n } : null;
  const [i, t, l, f, u] = r, s = Ae(i, t);
  return !s || f !== "*" ? { preset: "custom", time: "", custom: n } : l === "*" && u === "*" ? { preset: "daily", time: s } : l === "*" && u === "1-5" ? { preset: "weekdays", time: s } : l === "*" && /^[0-6]$/.test(u) ? { preset: "weekly", time: s, weekday: u } : u === "*" && /^(?:[1-9]|[12]\d|3[01])$/.test(l) ? { preset: "monthly", time: s, monthday: Number(l) } : { preset: "custom", time: "", custom: n };
}
function ze(e) {
  if (!e || !e.expression)
    return {
      specificTimes: !0,
      periodicEvery: 0,
      periodicUnit: "m",
      cronPreset: "custom",
      cronTime: "",
      cronWeekday: "",
      cronMonthday: 0,
      customCron: ""
    };
  const n = e.type, r = e.expression, i = to(r);
  if ((n === "interval" || n === "ticker") && i)
    return {
      specificTimes: !1,
      periodicEvery: i.n,
      periodicUnit: i.unit,
      cronPreset: "daily",
      cronTime: "",
      cronWeekday: "",
      cronMonthday: 0,
      customCron: ""
    };
  const t = n === "cron" ? oo(r) : { preset: "custom", time: "", custom: r };
  return {
    specificTimes: !0,
    periodicEvery: 0,
    periodicUnit: "m",
    cronPreset: t?.preset || "custom",
    cronTime: t?.time || "",
    cronWeekday: t?.weekday || "",
    cronMonthday: t?.monthday || 0,
    customCron: t?.custom || (t?.preset === "custom" ? r : "")
  };
}
function no(e) {
  if (!e.specificTimes) {
    const l = Ce(e.periodicEvery);
    return l == null ? null : {
      type: Pe,
      expression: `${l}${e.periodicUnit}`
    };
  }
  if (e.cronPreset === "custom") {
    const l = e.customCron.trim();
    return l ? { type: "cron", expression: l } : null;
  }
  const [n, r] = e.cronTime.split(":");
  if (!Ae(r, n)) return null;
  const i = Math.min(23, Math.max(0, Number(n))), t = Math.min(59, Math.max(0, Number(r)));
  if (e.cronPreset === "weekdays") return { type: "cron", expression: `${t} ${i} * * 1-5` };
  if (e.cronPreset === "weekly")
    return e.cronWeekday ? { type: "cron", expression: `${t} ${i} * * ${e.cronWeekday}` } : null;
  if (e.cronPreset === "monthly") {
    const l = Ce(e.cronMonthday);
    return l == null ? null : { type: "cron", expression: `${t} ${i} ${Math.min(31, l)} * *` };
  }
  return { type: "cron", expression: `${t} ${i} * * *` };
}
const ro = {
  class: "kx-tc-field",
  "data-test": "tc-schedule"
}, io = { class: "kx-tc-lbl" }, so = { class: "kx-tc-row" }, ao = ["disabled"], lo = { class: "kx-tc-check" }, co = ["disabled"], uo = {
  key: 0,
  class: "kx-tc-specific"
}, po = ["disabled"], fo = ["disabled"], mo = {
  key: 1,
  class: "kx-tc-sub"
}, ho = ["disabled"], vo = /* @__PURE__ */ te({
  __name: "ScheduleForm",
  props: {
    modelValue: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: n }) {
    const r = e, i = n, t = dt(ze(r.modelValue));
    let l = F(r.modelValue);
    q(() => r.modelValue, (u) => {
      F(u) !== l && (l = F(u), Object.assign(t, ze(u)));
    });
    function f() {
      const u = no(t);
      l = F(u), i("update:modelValue", u);
    }
    return (u, s) => (p(), h("div", ro, [
      d("span", io, [
        _(x(O), {
          icon: "tabler:repeat",
          "aria-hidden": "true"
        }),
        s[8] || (s[8] = ue(" How often", -1))
      ]),
      d("label", so, [
        s[9] || (s[9] = d("span", null, "Runs every", -1)),
        R(d("input", {
          "onUpdate:modelValue": s[0] || (s[0] = (v) => t.periodicEvery = v),
          class: "kx-tc-input kx-tc-num",
          "data-test": "tc-periodic-n",
          type: "number",
          disabled: e.disabled || t.specificTimes,
          onInput: f
        }, null, 40, ao), [
          [
            W,
            t.periodicEvery,
            void 0,
            { number: !0 }
          ]
        ]),
        _(x(ee), {
          modelValue: t.periodicUnit,
          "onUpdate:modelValue": s[1] || (s[1] = (v) => t.periodicUnit = v),
          class: "kx-tc-select kx-tc-unit",
          "data-test": "tc-periodic-unit",
          options: x(Zt),
          "option-label": "label",
          "option-value": "value",
          disabled: e.disabled || t.specificTimes,
          onChange: f
        }, null, 8, ["modelValue", "options", "disabled"])
      ]),
      d("label", lo, [
        R(d("input", {
          "onUpdate:modelValue": s[2] || (s[2] = (v) => t.specificTimes = v),
          "data-test": "tc-specific-toggle",
          type: "checkbox",
          disabled: e.disabled,
          onChange: f
        }, null, 40, co), [
          [pt, t.specificTimes]
        ]),
        s[10] || (s[10] = d("span", null, "At specific times", -1))
      ]),
      t.specificTimes ? (p(), h("div", uo, [
        _(x(ee), {
          modelValue: t.cronPreset,
          "onUpdate:modelValue": s[3] || (s[3] = (v) => t.cronPreset = v),
          class: "kx-tc-select",
          "data-test": "tc-cron-preset",
          options: x(eo),
          "option-label": "label",
          "option-value": "value",
          disabled: e.disabled,
          onChange: f
        }, null, 8, ["modelValue", "options", "disabled"]),
        t.cronPreset !== "custom" ? (p(), h(L, { key: 0 }, [
          t.cronPreset === "weekly" ? (p(), J(x(ee), {
            key: 0,
            modelValue: t.cronWeekday,
            "onUpdate:modelValue": s[4] || (s[4] = (v) => t.cronWeekday = v),
            class: "kx-tc-select",
            "data-test": "tc-cron-weekday",
            options: x(Xt),
            "option-label": "label",
            "option-value": "value",
            disabled: e.disabled,
            onChange: f
          }, null, 8, ["modelValue", "options", "disabled"])) : k("", !0),
          t.cronPreset === "monthly" ? R((p(), h("input", {
            key: 1,
            "onUpdate:modelValue": s[5] || (s[5] = (v) => t.cronMonthday = v),
            class: "kx-tc-input",
            "data-test": "tc-cron-monthday",
            type: "number",
            disabled: e.disabled,
            onInput: f
          }, null, 40, po)), [
            [
              W,
              t.cronMonthday,
              void 0,
              { number: !0 }
            ]
          ]) : k("", !0),
          R(d("input", {
            "onUpdate:modelValue": s[6] || (s[6] = (v) => t.cronTime = v),
            class: "kx-tc-input",
            "data-test": "tc-cron-time",
            type: "time",
            disabled: e.disabled,
            onInput: f
          }, null, 40, fo), [
            [W, t.cronTime]
          ])
        ], 64)) : (p(), h("label", mo, [
          s[11] || (s[11] = d("span", { class: "kx-tc-lbl" }, "Custom cron expression", -1)),
          R(d("input", {
            "onUpdate:modelValue": s[7] || (s[7] = (v) => t.customCron = v),
            class: "kx-tc-input kx-tc-code",
            "data-test": "tc-custom-cron",
            spellcheck: "false",
            disabled: e.disabled,
            onInput: f
          }, null, 40, ho), [
            [W, t.customCron]
          ])
        ]))
      ])) : k("", !0)
    ]));
  }
});
function yo(e) {
  return !!(e && typeof e.picker == "string" && e.picker && e.picker !== "wc-schema-form");
}
function Ve(e) {
  return e?.config_schema;
}
function je(e, n = "ports") {
  const r = Ve(e);
  if (!r) return null;
  const i = [];
  for (const [v, z] of Object.entries(r))
    yo(z) && i.push([v, z]);
  if (i.length === 0) return null;
  i.length > 1 && console.error(`${n}: port schema declares multiple picker fields`, i.map(([v]) => v));
  const [t, l] = i[0], f = typeof l.title == "string" ? l.title : "", u = typeof l.detail == "string" ? l.detail : "", s = typeof l.delete_endpoint == "string" ? l.delete_endpoint : "";
  return { key: t, tag: l.picker ?? "", title: f, schema: { properties: { [t]: l } }, detail: u, deleteEndpoint: s };
}
function go(e, n = "ports") {
  const r = Ve(e);
  if (!r) return null;
  const i = je(e, n)?.key, t = {};
  for (const [l, f] of Object.entries(r))
    l !== i && (t[l] = f);
  return Object.keys(t).length ? { type: "object", properties: t } : null;
}
function bo(e) {
  if (!e) return null;
  if (typeof e == "string")
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  return e;
}
function xo(e) {
  const n = bo(e);
  return !!(n && n.properties && Object.keys(n.properties).length);
}
const Me = "wc-schema-form", ko = "wc-component-picker", Ie = "trigger-config";
function Ne(e) {
  return e ? je({ config_schema: e.fields }, Ie) : null;
}
function Ue(e, n) {
  const r = e?.key || "";
  return r ? String(n[r] || "") : "";
}
function De(e) {
  return e ? go({ config_schema: e.fields }, Ie) : null;
}
function wo(e, n) {
  return !!n && xo(De(e));
}
function _o(e, n) {
  if (n?.tag !== ko) return;
  const r = e?.class || "";
  if (r)
    return {
      type: "thread",
      thread_class: r,
      title: n?.title ?? "",
      component: e?.component,
      delete_endpoint: n?.deleteEndpoint || ""
    };
}
const So = {
  key: 0,
  class: "kx-tc-lbl"
}, $o = {
  key: 2,
  class: "kx-tc-opts"
}, Co = {
  key: 1,
  class: "kx-tc-detail",
  "data-test": "tc-detail"
}, To = /* @__PURE__ */ te({
  __name: "SourceInstance",
  props: {
    source: {},
    config: {},
    locked: { type: Boolean }
  },
  emits: ["change"],
  setup(e, { emit: n }) {
    const r = e, i = n, t = m(() => Ne(r.source)), l = m(() => t.value?.tag || Me), f = m(() => t.value?.schema), u = m(() => _o(r.source, t.value)), s = m(() => De(r.source)), v = m(() => wo(r.source, t.value)), z = m(() => t.value?.detail || ""), C = m(() => {
      const V = t.value?.key || "", T = Ue(t.value, r.config);
      return V && T ? { [V]: T } : null;
    });
    return (V, T) => (p(), h(L, null, [
      t.value || v.value ? (p(), h("div", {
        key: 0,
        class: G(["kx-tc-field", e.locked && "kx-tc-locked"]),
        "data-test": "tc-instance"
      }, [
        t.value?.title ? (p(), h("span", So, P(t.value.title), 1)) : k("", !0),
        t.value ? (p(), J(ce, {
          key: 1,
          tag: l.value,
          schema: f.value,
          config: e.config,
          meta: u.value,
          provider: e.source.provider,
          onChange: T[0] || (T[0] = (E) => i("change", E))
        }, null, 8, ["tag", "schema", "config", "meta", "provider"])) : k("", !0),
        v.value ? (p(), h("div", $o, [
          T[2] || (T[2] = d("span", { class: "kx-tc-lbl" }, "Options", -1)),
          _(ce, {
            tag: "wc-schema-form",
            schema: s.value,
            config: e.config,
            onChange: T[1] || (T[1] = (E) => i("change", E))
          }, null, 8, ["schema", "config"])
        ])) : k("", !0)
      ], 2)) : k("", !0),
      z.value && C.value ? (p(), h("div", Co, [
        _(ce, {
          tag: z.value,
          config: C.value
        }, null, 8, ["tag", "config"])
      ])) : k("", !0)
    ], 64));
  }
}), zo = {
  key: 0,
  class: "kx-tc-note",
  "aria-live": "polite"
}, Eo = {
  key: 1,
  class: "kx-tc-warn",
  role: "alert",
  "data-test": "tc-load-error"
}, Oo = {
  class: "kx-tc-field",
  "data-test": "tc-when"
}, Po = { class: "kx-tc-lbl" }, Ao = {
  key: 0,
  class: "kx-tc-static",
  "data-test": "tc-when-locked"
}, Vo = {
  key: 2,
  class: "kx-tc-desc"
}, jo = {
  key: 0,
  class: "kx-tc-note",
  "data-test": "tc-catalog-empty"
}, Mo = {
  key: 1,
  class: "kx-tc-warn",
  role: "alert",
  "data-test": "tc-source-missing"
}, Io = {
  key: 2,
  class: "kx-tc-warn",
  role: "alert",
  "data-test": "tc-unsupported"
}, No = {
  key: 1,
  class: "kx-tc-note",
  "data-test": "tc-live-note"
}, Uo = { class: "kx-tc-lbl" }, Do = {
  key: 0,
  class: "kx-tc-static",
  "data-test": "tc-history-locked"
}, Ho = {
  class: "kx-tc-hint",
  "data-test": "tc-history-hint"
}, Ro = {
  key: 2,
  class: "kx-tc-sub"
}, Fo = ["disabled"], Lo = {
  key: 3,
  class: "kx-tc-sub"
}, Wo = ["disabled"], Bo = ["open"], Ko = { class: "kx-tc-sub" }, qo = ["disabled"], Jo = {
  key: 4,
  class: "kx-tc-gate",
  "data-test": "tc-gate",
  "aria-live": "polite"
}, M = "__schedule__", Yo = /* @__PURE__ */ te({
  __name: "TriggerConfig",
  setup(e) {
    const n = nt(), r = rt();
    function i(o) {
      return n.value?.[o];
    }
    function t(o) {
      const a = i(o);
      return a === !0 || a === "true" || a === "";
    }
    function l(o) {
      const a = i(o);
      return typeof a == "string" ? a.split(",").map((S) => S.trim()).filter(Boolean) : [];
    }
    const f = m(() => t("disabled")), u = m(() => t("reconfigure")), s = m(() => f.value || u.value), v = m(() => {
      const o = l("allowed");
      return o.length ? o : ["timer", "source"];
    }), z = m(() => v.value.includes("timer")), C = m(() => v.value.includes("source")), V = m(() => l("sourceClasses")), T = $([]), E = $(!0), j = $(""), c = $(""), g = $({}), w = $(null), y = $(""), A = m(() => {
      const o = i("historyDefault");
      return o === "none" || o === "all" ? o : null;
    }), b = $(null), B = $(null), Y = $(""), oe = $(!1), He = m(() => C.value ? $e(T.value, V.value) : []), Re = m(() => $e(T.value)), I = m(() => c.value && c.value !== M && Re.value.find((o) => o.id === c.value) || null), Fe = m(() => !!c.value && c.value !== M && !I.value && !E.value && !j.value), de = m(() => {
      const o = [];
      z.value && o.push({ id: M, title: "On a schedule", icon: "tabler:clock", group: "Schedule", subtitle: "Run at times you choose" });
      for (const a of He.value)
        o.push({ id: a.id, title: a.title, icon: a.icon || "tabler:plug", group: a.group || "Sources", subtitle: a.description || a.provider });
      return o;
    }), Le = m(() => C.value && !E.value && !j.value && !c.value && !de.value.length), D = m(() => {
      if (!c.value) return "none";
      if (c.value === M) return "timer";
      const o = I.value;
      return o ? o.hasTrigger ? "watch" : o.hasPull ? "poll" : "unsupported" : "none";
    }), pe = m(() => D.value === "timer" || D.value === "poll"), We = m(() => D.value === "poll" || D.value === "watch"), fe = m(() => D.value === "watch"), ne = m(() => A.value), Be = m(() => !!I.value && D.value !== "unsupported"), me = m(() => {
      const o = [
        { label: "All", value: "all" },
        { label: "Only new", value: "none" }
      ];
      return fe.value || (o.push({ label: "Last N days", value: "last_days" }), o.push({ label: "Since a date", value: "since" })), o;
    }), Ke = m(() => c.value === M ? "On a schedule" : I.value?.title || c.value || "Not set"), qe = m(() => me.value.find((o) => o.value === b.value)?.label || "Not set"), re = m(() => Ne(I.value)), Je = m(() => Ue(re.value, g.value));
    function Ye() {
      if (!b.value) return null;
      if (b.value === "all") return "all";
      if (b.value === "none") return "none";
      if (b.value === "last_days") {
        const o = Math.floor(Number(B.value));
        return Number.isInteger(o) && o > 0 ? { last_days: o } : null;
      }
      return b.value === "since" && Y.value ? { since: new Date(Y.value).toISOString() } : null;
    }
    const ie = $(null), se = $(null);
    function he() {
      const o = { v: 2 }, a = w.value;
      if (c.value === M)
        return a && (o.schedule = a), o;
      o.source = c.value, Object.keys(g.value).length && (o.config = { ...g.value }), y.value.trim() && (o.filter = { expr: y.value.trim() }), pe.value && a && (o.schedule = a), D.value === "poll" && ie.value && (o.poll = ie.value), se.value && (o.delivery = se.value);
      const S = c.value !== M ? Ye() : null;
      return S != null && (o.backfill = S), o;
    }
    function ve() {
      const o = he();
      if (!c.value) return { spec: o, valid: !1, error: "Pick when this runs." };
      const a = Yt(o, T.value);
      return a.error ? { spec: o, valid: !1, error: a.error.message } : c.value !== M && re.value && !Je.value ? { spec: o, valid: !1, error: `${re.value.title || "Instance"} is required.` } : { spec: o, valid: !0 };
    }
    const ae = m(() => E.value ? null : ve()), ye = m(() => c.value === M ? Gt : I.value?.outputSchema);
    let le = "";
    function H() {
      const o = ve();
      ye.value !== void 0 && (o.output_schema = ye.value), le = F(o.spec), r("change", o);
    }
    function ge(o) {
      if (o == null) return null;
      if (typeof o == "string") {
        const a = o.trim();
        if (!a) return null;
        try {
          o = JSON.parse(a);
        } catch {
          return null;
        }
      }
      return typeof o == "object" && o && !Array.isArray(o) ? o : null;
    }
    function be(o) {
      const a = typeof o.source == "string" ? o.source.trim() : "";
      c.value = a || M, g.value = typeof o.config == "object" && o.config && !Array.isArray(o.config) ? { ...o.config } : {};
      const S = o.schedule;
      if (S && typeof S == "object") {
        const N = String(S.type || ""), tt = N === "once" || N === "interval" || N === "ticker" || N === "cron" ? N : Pe, ot = typeof S.expression == "string" ? S.expression : "";
        w.value = { type: tt, expression: ot };
      } else
        w.value = null;
      const X = o.poll;
      ie.value = X && typeof X == "object" && !Array.isArray(X) ? X : null;
      const Z = o.delivery;
      se.value = Z && typeof Z == "object" && !Array.isArray(Z) ? Z : null;
      const ke = o.filter;
      y.value = typeof ke?.expr == "string" ? ke.expr : "", oe.value = !!y.value;
      const K = o.backfill;
      if (K === "none") b.value = "none";
      else if (K === "all") b.value = "all";
      else if (K && typeof K == "object" && !Array.isArray(K)) {
        const N = K;
        typeof N.last_days == "number" ? (b.value = "last_days", B.value = N.last_days) : typeof N.since == "string" ? (b.value = "since", Y.value = N.since.slice(0, 10)) : b.value = ne.value;
      } else b.value = ne.value;
    }
    q(() => n.value?.value, (o) => {
      const a = ge(o);
      a && F(a) !== le && (be(a), le = F(he()));
    });
    function Ge(o) {
      o !== c.value && (c.value = o, g.value = {}, y.value = "", b.value = ne.value, w.value = null, H());
    }
    function Qe(o) {
      w.value = o, H();
    }
    function Xe(o) {
      o && typeof o == "object" && (g.value = { ...g.value, ...o }, H());
    }
    function Ze(o) {
      b.value = o, H();
    }
    async function xe() {
      E.value = !0, j.value = "";
      try {
        const { data: o } = await ht.get("/api/v1/automations/sources");
        T.value = o?.sources || [];
      } catch (o) {
        C.value && (j.value = it(o, "could not load sources"), r("error", { message: j.value, error: o }));
      } finally {
        E.value = !1;
      }
    }
    function et() {
      xe().then(() => H());
    }
    return ft(async () => {
      mt(Me, { timeoutMs: 8e3 }).catch(() => {
      }), C.value ? await xe() : E.value = !1;
      const o = ge(i("value"));
      o ? be(o) : z.value && !C.value && (c.value = M, w.value = null), j.value || r("load", void 0), H();
    }), (o, a) => (p(), h("div", {
      class: G(["kx-tc", f.value && "kx-tc-off"])
    }, [
      E.value ? (p(), h("div", zo, [
        _(x(O), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        a[4] || (a[4] = d("span", null, "Loading sources…", -1))
      ])) : j.value ? (p(), h("div", Eo, [
        _(x(O), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        d("span", null, P(j.value), 1),
        d("button", {
          type: "button",
          class: "kx-tc-retry",
          onClick: et
        }, "Retry")
      ])) : (p(), h(L, { key: 2 }, [
        d("div", Oo, [
          d("span", Po, [
            _(x(O), {
              icon: "tabler:calendar-bolt",
              "aria-hidden": "true"
            }),
            a[5] || (a[5] = ue(" When", -1))
          ]),
          s.value ? (p(), h("p", Ao, P(Ke.value), 1)) : (p(), J(It, {
            key: 1,
            items: de.value,
            "model-value": c.value,
            placeholder: "Pick when this runs…",
            "aria-label": "When this runs",
            "onUpdate:modelValue": Ge
          }, null, 8, ["items", "model-value"])),
          I.value?.description ? (p(), h("p", Vo, P(I.value.description), 1)) : k("", !0)
        ]),
        Le.value ? (p(), h("div", jo, [
          _(x(O), {
            icon: "tabler:plug-x",
            "aria-hidden": "true"
          }),
          a[6] || (a[6] = d("span", null, "No sources are available to trigger on yet.", -1))
        ])) : k("", !0),
        Fe.value ? (p(), h("div", Mo, [
          _(x(O), {
            icon: "tabler:plug-x",
            "aria-hidden": "true"
          }),
          d("span", null, 'The source "' + P(c.value) + '" is not available. It may have been removed or you no longer have access to it.', 1)
        ])) : D.value === "unsupported" ? (p(), h("div", Io, [
          _(x(O), {
            icon: "tabler:plug-x",
            "aria-hidden": "true"
          }),
          a[7] || (a[7] = d("span", null, "This source can't start anything yet — it announces no events and can't be checked for items.", -1))
        ])) : (p(), h(L, { key: 3 }, [
          I.value ? (p(), J(To, {
            key: 0,
            source: I.value,
            config: g.value,
            locked: s.value,
            onChange: Xe
          }, null, 8, ["source", "config", "locked"])) : k("", !0),
          D.value === "watch" ? (p(), h("div", No, [
            _(x(O), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            }),
            a[8] || (a[8] = d("span", null, "Runs on each incoming event — no schedule to set. Choose an explicit history boundary.", -1))
          ])) : k("", !0),
          pe.value ? (p(), J(vo, {
            key: 2,
            "model-value": w.value,
            disabled: f.value,
            "onUpdate:modelValue": Qe
          }, null, 8, ["model-value", "disabled"])) : k("", !0),
          We.value ? (p(), h("div", {
            key: 3,
            class: G(["kx-tc-field", s.value && "kx-tc-locked"]),
            "data-test": "tc-history"
          }, [
            d("span", Uo, [
              _(x(O), {
                icon: "tabler:history",
                "aria-hidden": "true"
              }),
              a[9] || (a[9] = ue(" History", -1))
            ]),
            s.value ? (p(), h("p", Do, P(qe.value), 1)) : (p(), J(x(ee), {
              key: 1,
              class: "kx-tc-select",
              "data-test": "tc-history-kind",
              "model-value": b.value,
              options: me.value,
              "option-label": "label",
              "option-value": "value",
              "onUpdate:modelValue": Ze
            }, null, 8, ["model-value", "options"])),
            d("span", Ho, P(fe.value ? b.value === "all" ? "Replays this thread's history from the start, then continues live." : `How much of this thread's history to replay on the first run. "Only new" starts from now.` : `How much of the source's existing items to bring in on the first run. "Only new" starts from now.`), 1),
            b.value === "last_days" ? (p(), h("label", Ro, [
              a[10] || (a[10] = d("span", { class: "kx-tc-lbl" }, "Days", -1)),
              R(d("input", {
                "onUpdate:modelValue": a[0] || (a[0] = (S) => B.value = S),
                class: "kx-tc-input",
                "data-test": "tc-history-days",
                type: "number",
                disabled: s.value,
                onChange: H
              }, null, 40, Fo), [
                [
                  W,
                  B.value,
                  void 0,
                  { number: !0 }
                ]
              ])
            ])) : k("", !0),
            b.value === "since" ? (p(), h("label", Lo, [
              a[11] || (a[11] = d("span", { class: "kx-tc-lbl" }, "Since", -1)),
              R(d("input", {
                "onUpdate:modelValue": a[1] || (a[1] = (S) => Y.value = S),
                class: "kx-tc-input",
                "data-test": "tc-history-since",
                type: "date",
                disabled: s.value,
                onChange: H
              }, null, 40, Wo), [
                [W, Y.value]
              ])
            ])) : k("", !0)
          ], 2)) : k("", !0),
          Be.value ? (p(), h("details", {
            key: 4,
            class: "kx-tc-adv",
            open: oe.value,
            onToggle: a[3] || (a[3] = (S) => oe.value = S.target.open)
          }, [
            d("summary", null, [
              _(x(O), {
                class: "kx-tc-caret",
                icon: "tabler:chevron-right",
                "aria-hidden": "true"
              }),
              a[12] || (a[12] = d("span", null, "Advanced", -1))
            ]),
            d("div", {
              class: G(["kx-tc-adv-body", s.value && "kx-tc-locked"])
            }, [
              d("label", Ko, [
                a[13] || (a[13] = d("span", { class: "kx-tc-lbl" }, "Only when this matches", -1)),
                R(d("textarea", {
                  "onUpdate:modelValue": a[2] || (a[2] = (S) => y.value = S),
                  class: "kx-tc-input kx-tc-textarea",
                  "data-test": "tc-expr",
                  rows: "2",
                  placeholder: "item.status == 'active'",
                  spellcheck: "false",
                  disabled: s.value,
                  onChange: H
                }, null, 40, qo), [
                  [W, y.value]
                ]),
                a[14] || (a[14] = d("span", { class: "kx-tc-hint" }, "An expression over each incoming item; items that don't match are skipped.", -1))
              ])
            ], 2)
          ], 40, Bo)) : k("", !0)
        ], 64)),
        ae.value && !ae.value.valid ? (p(), h("div", Jo, [
          _(x(O), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          d("span", null, P(ae.value.error), 1)
        ])) : k("", !0)
      ], 64))
    ], 2));
  }
}), Go = '.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;font-size:13px;color:var(--p-text-color)}*,*:before,*:after{box-sizing:border-box}.kx-tc{display:flex;flex-direction:column;gap:16px;min-width:0}.kx-tc-field,.kx-tc-sub{min-width:0}.kx-tc-off{opacity:.6;pointer-events:none}.kx-tc-field{display:flex;flex-direction:column;gap:7px}.kx-tc-sub{display:flex;flex-direction:column;gap:5px;margin-top:8px}.kx-tc-lbl{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:650;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-tc-lbl svg{width:13px;height:13px;opacity:.85}.kx-tc-desc{margin:0;font-size:12px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-hint{font-size:11px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-input{width:100%;height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s,box-shadow .15s}.kx-tc-input:disabled{opacity:.6}.kx-tc-textarea{height:auto;min-height:56px;padding:8px 10px;line-height:1.45;resize:vertical;font-family:ui-monospace,monospace;font-size:12px}.kx-tc-code{font-family:ui-monospace,monospace;font-size:12px}.kx-tc-row{display:grid;grid-template-columns:max-content minmax(72px,96px) minmax(120px,1fr);align-items:center;gap:8px}.kx-tc-num,.kx-tc-unit{width:100%;min-width:0}.kx-tc-check{display:inline-flex;align-items:center;gap:8px;width:fit-content;font-size:12px;color:var(--p-text-color);cursor:pointer}.kx-tc-check input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-tc-check input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-tc-check input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-tc-check input:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset)}.kx-tc-check input:checked:before{transform:rotate(45deg) scale(1)}.kx-tc-check input:disabled{opacity:.55;cursor:not-allowed}.kx-tc-check:has(input:disabled){cursor:not-allowed}.kx-tc-specific{display:grid;grid-template-columns:minmax(160px,1fr) minmax(112px,140px) minmax(112px,140px);gap:8px;align-items:start}.kx-tc-specific .kx-tc-sub{grid-column:1 / -1;margin-top:0}.kx-tc-select{width:100%;min-width:0}.kx-tc-locked{pointer-events:none;opacity:.6}.kx-tc-static{display:flex;align-items:center;min-height:36px;font-size:13px;color:var(--p-text-color)}.kx-tc-field[data-test=tc-instance]{gap:9px;padding:12px;border-radius:10px;border:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 2.5%,transparent)}.kx-tc-note{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-tc-note svg{width:15px;height:15px;flex:none}.kx-tc-note>span,.kx-tc-warn>span,.kx-tc-gate>span{min-width:0;flex:1}.kx-tc-warn{display:flex;align-items:center;flex-wrap:wrap;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-tc-warn svg{width:15px;height:15px;flex:none}.kx-tc-retry{margin-left:auto;padding:8px 10px;font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;color:inherit;background:transparent;border:1px solid currentColor;border-radius:8px}.kx-tc-gate{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;color:var(--p-text-muted-color);padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--p-text-color) 4%,transparent)}.kx-tc-gate svg{width:15px;height:15px;flex:none}.kx-tc-opts{display:flex;flex-direction:column;gap:6px;margin-top:6px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-tc-detail{margin-top:2px}.kx-tc-adv summary{display:flex;align-items:center;gap:6px;cursor:pointer;list-style:none;font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.kx-tc-adv summary::-webkit-details-marker{display:none}.kx-tc-adv summary:hover{color:var(--p-text-color)}.kx-tc-caret{width:14px;height:14px;transition:transform .15s}.kx-tc-adv[open] .kx-tc-caret{transform:rotate(90deg)}.kx-tc-adv-body{margin-top:8px}@media(max-width:520px){.kx-tc-row,.kx-tc-specific{grid-template-columns:1fr}}', Qo = {
  type: "object",
  properties: {
    value: {
      type: "string",
      default: "",
      description: "Current Trigger Spec v2 as a JSON object string. Empty starts a fresh spec; non-empty seeds every section (edit mode)."
    },
    allowed: {
      type: "string",
      default: "timer,source",
      description: 'CSV of offered trigger families: "timer" (the "On a schedule" row) and/or "source" (the source catalog).'
    },
    "source-classes": {
      type: "string",
      default: "",
      description: "Optional CSV of source classes; when set, only bindings declaring one of these classes are offered."
    },
    "history-default": {
      type: "string",
      description: "Optional owner-provided initial History. Missing history is unready; the editor does not choose a replay boundary."
    },
    disabled: {
      type: "boolean",
      default: !1,
      description: "Disable all edits."
    },
    reconfigure: {
      type: "boolean",
      default: !1,
      description: "Editing an installed trigger: structural fields (source, instance, options, filter, history) render locked; cadence stays editable."
    }
  }
};
class Xo extends st {
  static get wippyConfig() {
    return {
      propsSchema: Qo,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Go
    };
  }
  static get vueConfig() {
    return { rootComponent: Yo, plugins: [lt] };
  }
}
vt(import.meta.url, Xo);
//# sourceMappingURL=trigger_config.js.map
