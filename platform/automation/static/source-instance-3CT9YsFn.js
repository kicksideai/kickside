import { defineComponent as q, reactive as te, watch as O, openBlock as d, createElementBlock as p, createElementVNode as m, createVNode as I, unref as k, createTextVNode as re, withDirectives as _, vModelText as A, Fragment as S, renderList as M, toDisplayString as $, vModelSelect as U, vModelCheckbox as ne, createCommentVNode as T, ref as E, useId as oe, computed as V, nextTick as R, withCtx as se, normalizeClass as ie } from "vue";
import { Icon as N } from "@iconify/vue";
import { f as le } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DNnuyvEa.js";
const L = 2, ae = ["once", "interval", "ticker", "cron"], ce = /* @__PURE__ */ new Set(["v", "source", "config", "schedule", "backfill", "filter", "poll", "delivery"]), ue = /* @__PURE__ */ new Set(["expr"]);
function j(e) {
  return typeof e == "string" ? e.trim() : "";
}
function de(e) {
  return typeof e == "number" && Number.isInteger(e) && e > 0;
}
function g(e) {
  return { error: { code: "invalid_spec", message: e } };
}
function K(e, t) {
  const n = [];
  let o = !1, r = !1;
  for (const s of t)
    String(s.id || "") === e && (r = !0, s.surface === "events" && typeof s.event == "string" && s.event ? n.push(s.event) : s.surface === "collection" && (o = !0));
  return r ? { source: e, triggerTypes: n, hasTrigger: n.length > 0, hasPull: o } : null;
}
function kt(e, t = []) {
  const n = /* @__PURE__ */ new Map();
  for (const r of e) {
    const s = String(r.id || "");
    s && (n.has(s) || n.set(s, []), n.get(s).push(r));
  }
  const o = [];
  for (const [r, s] of n) {
    if (t.length && !s.some((a) => t.includes(String(a.class || "")))) continue;
    const c = K(r, s), l = s[0];
    let i;
    for (const a of s) {
      const x = a.config_schema;
      if (x) {
        i || (i = {});
        for (const [h, P] of Object.entries(x))
          h in i || (i[h] = P);
      }
    }
    o.push({
      ...c,
      id: r,
      title: l.title || l.name || r,
      icon: l.icon || "",
      group: l.group || "",
      description: l.description || "",
      provider: l.provider || "",
      class: String(l.class || ""),
      component: l.component,
      outputSchema: l.output_schema,
      fields: i
    });
  }
  return o;
}
function pe(e) {
  if (e == null) return { out: null };
  if (typeof e != "object" || Array.isArray(e)) return { error: "How often must carry a schedule type and expression." };
  const t = e, n = j(t.type);
  if (!ae.includes(n))
    return { error: "How often must be one of: once, interval, ticker, cron." };
  const o = j(t.expression);
  if (!o) return { error: "How often needs an expression." };
  for (const r of Object.keys(t))
    if (r !== "type" && r !== "expression") return { error: `How often has an unknown field: ${r}.` };
  return { out: { type: n, expression: o } };
}
function fe(e) {
  if (e == null) return { out: null };
  if (e === "all" || e === "none") return { out: e };
  if (typeof e == "object" && !Array.isArray(e)) {
    const t = e, n = j(t.since), o = t.last_days;
    if (o != null && !de(o))
      return { error: 'History "last days" must be a positive whole number.' };
    if (!n && o == null)
      return { error: "History must be all, only new, a number of days, or a start date." };
    const r = {};
    return n && (r.since = n), o != null && (r.last_days = o), { out: r };
  }
  return { error: "History must be all, only new, a number of days, or a start date." };
}
function Y(e, t, n) {
  return e == null ? {} : typeof e != "number" || !Number.isSafeInteger(e) || e < n ? { error: `${t} must be an integer of at least ${n}.` } : { value: e };
}
function me(e) {
  if (e == null) return { out: {} };
  if (typeof e != "object" || Array.isArray(e)) return { error: "Poll settings must be an object." };
  const t = e, n = /* @__PURE__ */ new Set(["page_size", "max_pages_per_run", "max_items_per_run"]);
  for (const r of Object.keys(t)) if (!n.has(r)) return { error: `Poll settings have an unknown field: ${r}.` };
  const o = {};
  for (const [r, s, c] of [
    ["page_size", "Page size", 1],
    ["max_pages_per_run", "Pages per run", 1],
    ["max_items_per_run", "Items per run", 0]
  ]) {
    const l = Y(t[r], s, c);
    if (l.error) return { error: l.error };
    l.value !== void 0 && (o[r] = l.value);
  }
  return { out: o };
}
function ye(e) {
  if (e == null) return {};
  if (typeof e != "object" || Array.isArray(e)) return { error: "Delivery settings must be an object." };
  const t = e;
  for (const o of Object.keys(t))
    if (o !== "retry_after_ms") return { error: `Delivery settings have an unknown field: ${o}.` };
  const n = Y(t.retry_after_ms, "Delivery retry delay", 1);
  return n.error ? { error: n.error } : { out: n.value !== void 0 ? { retry_after_ms: n.value } : {} };
}
function be(e) {
  if (e == null || typeof e != "object" || Array.isArray(e))
    return { error: "Trigger settings must be an object." };
  const t = e;
  if (t.v !== L) return { error: "Trigger settings require v = 2." };
  for (const i of Object.keys(t))
    if (!ce.has(i)) return { error: `Trigger settings have an unknown field: ${i}.` };
  const n = t.filter;
  if (n != null && (typeof n != "object" || Array.isArray(n)))
    return { error: "The event filter must be an object." };
  const o = n ?? {};
  for (const i of Object.keys(o))
    if (!ue.has(i)) return { error: `The event filter has an unknown field: ${i}.` };
  if (o.expr != null && typeof o.expr != "string")
    return { error: "The filter expression must be text." };
  const r = pe(t.schedule);
  if (r.error) return { error: r.error };
  const s = fe(t.backfill);
  if (s.error) return { error: s.error };
  const c = me(t.poll);
  if (c.error) return { error: c.error };
  const l = ye(t.delivery);
  return l.error ? { error: l.error } : {
    spec: {
      v: L,
      source: j(t.source),
      config: typeof t.config == "object" && t.config && !Array.isArray(t.config) ? { ...t.config } : {},
      filter: { expr: j(o.expr) },
      schedule: r.out,
      backfill: s.out,
      poll: t.poll == null ? void 0 : c.out,
      delivery: l.out
    }
  };
}
function he(e) {
  return e.backfill != null ? g(`History imports a source's existing items — "On a schedule" has no source.`) : e.schedule ? e.poll != null ? g("Poll settings apply only to a collection source.") : { resolution: { mode: "timer", spec: e } } : g("How often is required — pick a schedule.");
}
function ke(e) {
  if (e.schedule)
    return g("This source runs on each incoming event — a schedule does not apply.");
  if (e.poll != null) return g("Poll settings apply only to a collection source.");
  const t = e.backfill;
  return t == null ? g("History is required for this source — choose all or only new.") : t === "all" || t === "none" ? { resolution: { mode: "watch", spec: e } } : g('This is an events source — History can be "All" (from the start) or "Only new".');
}
function ve(e) {
  return e.backfill == null ? g("History is required for this source — choose all, only new, a number of days, or a start date.") : e.schedule ? { resolution: { mode: "poll", spec: e } } : g("How often is required for this source — pick a cadence.");
}
function vt(e, t) {
  const n = be(e);
  if (n.error || !n.spec) return { error: { code: "invalid_spec", message: n.error || "Invalid trigger settings." } };
  const o = n.spec;
  if (!o.source) return he(o);
  const r = K(o.source, t);
  return r ? r.hasTrigger ? ke(o) : r.hasPull ? ve(o) : g("This source announces no events and cannot be checked for items.") : { error: { code: "source_not_found", message: "This source is not available." } };
}
function w(e) {
  return e === null || typeof e != "object" ? JSON.stringify(e) ?? "null" : Array.isArray(e) ? `[${e.map(w).join(",")}]` : `{${Object.keys(e).sort().filter((o) => e[o] !== void 0).map((o) => `${JSON.stringify(o)}:${w(e[o])}`).join(",")}}`;
}
const J = "ticker", gt = {
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
}, ge = [
  ["0", "Sunday"],
  ["1", "Monday"],
  ["2", "Tuesday"],
  ["3", "Wednesday"],
  ["4", "Thursday"],
  ["5", "Friday"],
  ["6", "Saturday"]
], xe = ge.map(([e, t]) => ({ label: t, value: e })), _e = [
  { label: "minutes", value: "m" },
  { label: "hours", value: "h" },
  { label: "days", value: "d" }
], $e = [
  { label: "Daily", value: "daily" },
  { label: "Weekdays", value: "weekdays" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Custom cron expression", value: "custom" }
];
function W(e) {
  const t = Math.floor(Number(e));
  return Number.isFinite(t) && t > 0 ? t : null;
}
function Se(e) {
  const t = typeof e == "string" ? e.trim().match(/^([1-9]\d*)([mhd])$/) : null;
  return t ? { n: Number(t[1]), unit: t[2] } : null;
}
function z(e) {
  return String(e).padStart(2, "0");
}
function G(e, t) {
  if (!/^\d+$/.test(e) || !/^\d+$/.test(t)) return null;
  const n = Number(e), o = Number(t);
  return n < 0 || n > 59 || o < 0 || o > 23 ? null : `${z(o)}:${z(n)}`;
}
function Te(e) {
  const t = typeof e == "string" ? e.trim() : "", n = t.split(/\s+/);
  if (n.length !== 5) return t ? { preset: "custom", time: "", custom: t } : null;
  const [o, r, s, c, l] = n, i = G(o, r);
  return !i || c !== "*" ? { preset: "custom", time: "", custom: t } : s === "*" && l === "*" ? { preset: "daily", time: i } : s === "*" && l === "1-5" ? { preset: "weekdays", time: i } : s === "*" && /^[0-6]$/.test(l) ? { preset: "weekly", time: i, weekday: l } : l === "*" && /^(?:[1-9]|[12]\d|3[01])$/.test(s) ? { preset: "monthly", time: i, monthday: Number(s) } : { preset: "custom", time: "", custom: t };
}
function B(e, t = "custom") {
  if (!e || !e.expression)
    return {
      specificTimes: !0,
      periodicEvery: 0,
      periodicUnit: "m",
      cronPreset: t,
      cronTime: "",
      cronWeekday: "",
      cronMonthday: 0,
      customCron: ""
    };
  const n = e.type, o = e.expression, r = Se(o);
  if ((n === "interval" || n === "ticker") && r)
    return {
      specificTimes: !1,
      periodicEvery: r.n,
      periodicUnit: r.unit,
      cronPreset: "daily",
      cronTime: "",
      cronWeekday: "",
      cronMonthday: 0,
      customCron: ""
    };
  const s = n === "cron" ? Te(o) : { preset: "custom", time: "", custom: o };
  return {
    specificTimes: !0,
    periodicEvery: 0,
    periodicUnit: "m",
    cronPreset: s?.preset || "custom",
    cronTime: s?.time || "",
    cronWeekday: s?.weekday || "",
    cronMonthday: s?.monthday || 0,
    customCron: s?.custom || (s?.preset === "custom" ? o : "")
  };
}
function Ce(e) {
  if (!e.specificTimes) {
    const s = W(e.periodicEvery);
    return s == null ? null : {
      type: J,
      expression: `${s}${e.periodicUnit}`
    };
  }
  if (e.cronPreset === "custom") {
    const s = e.customCron.trim();
    return s ? { type: "cron", expression: s } : null;
  }
  const [t, n] = e.cronTime.split(":");
  if (!G(n, t)) return null;
  const o = Math.min(23, Math.max(0, Number(t))), r = Math.min(59, Math.max(0, Number(n)));
  if (e.cronPreset === "weekdays") return { type: "cron", expression: `${r} ${o} * * 1-5` };
  if (e.cronPreset === "weekly")
    return e.cronWeekday ? { type: "cron", expression: `${r} ${o} * * ${e.cronWeekday}` } : null;
  if (e.cronPreset === "monthly") {
    const s = W(e.cronMonthday);
    return s == null ? null : { type: "cron", expression: `${r} ${o} ${Math.min(31, s)} * *` };
  }
  return { type: "cron", expression: `${r} ${o} * * *` };
}
function xt(e) {
  return e ? { type: e.type === "interval" ? J : "cron", expression: e.expression } : null;
}
function _t(e) {
  return !e || e.type === "once" ? null : { type: e.type === "cron" ? "cron" : "interval", expression: e.expression };
}
const we = {
  class: "kx-tc-field",
  "data-test": "tc-schedule"
}, Pe = { class: "kx-tc-lbl" }, Ee = { class: "kx-tc-row" }, Oe = ["disabled"], Ie = ["disabled"], Ae = ["value"], Me = { class: "kx-tc-check" }, je = ["disabled"], Ve = {
  key: 0,
  class: "kx-tc-specific"
}, Ne = ["disabled"], Ue = ["value"], De = ["disabled"], He = ["value"], Fe = ["disabled"], Re = ["disabled"], Le = {
  key: 1,
  class: "kx-tc-sub"
}, We = ["disabled"], $t = /* @__PURE__ */ q({
  __name: "ScheduleForm",
  props: {
    modelValue: {},
    disabled: { type: Boolean },
    defaultPreset: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, o = t, r = te(B(n.modelValue, n.defaultPreset));
    let s = w(n.modelValue);
    O(() => n.modelValue, (l) => {
      w(l) !== s && (s = w(l), Object.assign(r, B(l, n.defaultPreset)));
    });
    function c() {
      const l = Ce(r);
      s = w(l), o("update:modelValue", l);
    }
    return (l, i) => (d(), p("div", we, [
      m("span", Pe, [
        I(k(N), {
          icon: "tabler:repeat",
          "aria-hidden": "true"
        }),
        i[8] || (i[8] = re(" How often", -1))
      ]),
      m("label", Ee, [
        i[9] || (i[9] = m("span", null, "Runs every", -1)),
        _(m("input", {
          "onUpdate:modelValue": i[0] || (i[0] = (a) => r.periodicEvery = a),
          class: "kx-tc-input kx-tc-num",
          "data-test": "tc-periodic-n",
          "aria-label": "Interval count",
          min: "1",
          step: "1",
          type: "number",
          disabled: e.disabled || r.specificTimes,
          onInput: c
        }, null, 40, Oe), [
          [
            A,
            r.periodicEvery,
            void 0,
            { number: !0 }
          ]
        ]),
        _(m("select", {
          "onUpdate:modelValue": i[1] || (i[1] = (a) => r.periodicUnit = a),
          class: "kx-tc-select kx-tc-unit",
          "data-test": "tc-periodic-unit",
          "aria-label": "Interval unit",
          disabled: e.disabled || r.specificTimes,
          onChange: c
        }, [
          (d(!0), p(S, null, M(k(_e), (a) => (d(), p("option", {
            key: a.value,
            value: a.value
          }, $(a.label), 9, Ae))), 128))
        ], 40, Ie), [
          [U, r.periodicUnit]
        ])
      ]),
      m("label", Me, [
        _(m("input", {
          "onUpdate:modelValue": i[2] || (i[2] = (a) => r.specificTimes = a),
          "data-test": "tc-specific-toggle",
          type: "checkbox",
          disabled: e.disabled,
          onChange: c
        }, null, 40, je), [
          [ne, r.specificTimes]
        ]),
        i[10] || (i[10] = m("span", null, "At specific times", -1))
      ]),
      r.specificTimes ? (d(), p("div", Ve, [
        _(m("select", {
          "onUpdate:modelValue": i[3] || (i[3] = (a) => r.cronPreset = a),
          class: "kx-tc-select",
          "data-test": "tc-cron-preset",
          "aria-label": "Cadence",
          disabled: e.disabled,
          onChange: c
        }, [
          (d(!0), p(S, null, M(k($e), (a) => (d(), p("option", {
            key: a.value,
            value: a.value
          }, $(a.label), 9, Ue))), 128))
        ], 40, Ne), [
          [U, r.cronPreset]
        ]),
        r.cronPreset !== "custom" ? (d(), p(S, { key: 0 }, [
          r.cronPreset === "weekly" ? _((d(), p("select", {
            key: 0,
            "onUpdate:modelValue": i[4] || (i[4] = (a) => r.cronWeekday = a),
            class: "kx-tc-select",
            "data-test": "tc-cron-weekday",
            "aria-label": "Day of week",
            disabled: e.disabled,
            onChange: c
          }, [
            (d(!0), p(S, null, M(k(xe), (a) => (d(), p("option", {
              key: a.value,
              value: a.value
            }, $(a.label), 9, He))), 128))
          ], 40, De)), [
            [U, r.cronWeekday]
          ]) : T("", !0),
          r.cronPreset === "monthly" ? _((d(), p("input", {
            key: 1,
            "onUpdate:modelValue": i[5] || (i[5] = (a) => r.cronMonthday = a),
            class: "kx-tc-input",
            "data-test": "tc-cron-monthday",
            type: "number",
            disabled: e.disabled,
            onInput: c
          }, null, 40, Fe)), [
            [
              A,
              r.cronMonthday,
              void 0,
              { number: !0 }
            ]
          ]) : T("", !0),
          _(m("input", {
            "onUpdate:modelValue": i[6] || (i[6] = (a) => r.cronTime = a),
            class: "kx-tc-input",
            "data-test": "tc-cron-time",
            "aria-label": "Time (UTC)",
            type: "time",
            disabled: e.disabled,
            onInput: c
          }, null, 40, Re), [
            [A, r.cronTime]
          ])
        ], 64)) : (d(), p("label", Le, [
          i[11] || (i[11] = m("span", { class: "kx-tc-lbl" }, "Custom cron expression", -1)),
          _(m("input", {
            "onUpdate:modelValue": i[7] || (i[7] = (a) => r.customCron = a),
            class: "kx-tc-input kx-tc-code",
            "data-test": "tc-custom-cron",
            "aria-label": "Custom cron expression",
            spellcheck: "false",
            disabled: e.disabled,
            onInput: c
          }, null, 40, We), [
            [A, r.customCron]
          ])
        ]))
      ])) : T("", !0)
    ]));
  }
}), ze = ["aria-expanded", "aria-controls", "aria-label", "disabled"], Be = { class: "p-select-label" }, qe = {
  key: 0,
  class: "kx-ps-val"
}, Ke = { class: "kx-ps-val-label" }, Ye = {
  key: 1,
  class: "kx-ps-ph"
}, Je = { class: "p-select-dropdown" }, Ge = { class: "p-select-overlay kx-ps-panel" }, Qe = { class: "p-select-header" }, Xe = ["aria-label", "aria-controls", "aria-activedescendant"], Ze = ["id", "aria-label"], et = {
  class: "p-select-option-group",
  role: "presentation"
}, tt = ["id", "aria-selected", "onClick", "onMousemove"], rt = { class: "kx-ps-opt-body" }, nt = { class: "kx-ps-opt-title" }, ot = {
  key: 0,
  class: "kx-ps-opt-sub"
}, st = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, it = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, lt = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, at = ["disabled"], St = /* @__PURE__ */ q({
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
  setup(e, { emit: t }) {
    const n = e, o = t, r = E(null), s = E(null), c = E(!1), l = E(""), i = E(0), a = oe(), x = V(() => {
      const u = l.value.trim().toLowerCase(), y = /* @__PURE__ */ new Map();
      for (const f of n.items) {
        if (!n.remote && u && ![f.title, f.subtitle, f.id, f.group].some((ee) => ee?.toLowerCase().includes(u))) continue;
        const v = f.group || "Other", C = y.get(v);
        C ? C.push(f) : y.set(v, [f]);
      }
      let b = 0;
      return [...y.entries()].sort((f, v) => f[0].localeCompare(v[0])).map(([f, v]) => ({ group: f, items: v.map((C) => ({ item: C, index: b++ })) }));
    }), h = V(() => x.value.flatMap((u) => u.items)), P = V(() => n.items.find((u) => u.id === n.modelValue)), D = V(() => h.value[i.value] ? `${a}-${i.value}` : void 0);
    O(l, () => {
      i.value = 0;
    }), O([c, l], ([u, y]) => {
      u && n.remote && o("search", y);
    }), O(() => n.disabled, (u) => {
      u && (c.value = !1);
    }), O(c, async (u) => {
      if (!u) {
        r.value?.focus();
        return;
      }
      l.value = "", i.value = Math.max(0, h.value.findIndex(({ item: y }) => y.id === n.modelValue)), await R(), s.value?.focus();
    });
    function H(u) {
      n.disabled || n.loading || (o("update:modelValue", u.id), c.value = !1);
    }
    async function F(u) {
      if (u.key === "Escape" && c.value) {
        u.preventDefault(), u.stopPropagation(), c.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(u.key)) return;
      if (u.preventDefault(), !c.value) {
        c.value = !0;
        return;
      }
      if (u.key === "Enter") {
        const f = h.value[i.value];
        f && H(f.item);
        return;
      }
      const y = h.value.length - 1;
      i.value = u.key === "Home" ? 0 : u.key === "End" ? y : Math.max(0, Math.min(y, i.value + (u.key === "ArrowDown" ? 1 : -1))), await R(), r.value?.getRootNode()?.querySelector(`[id="${D.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (u, y) => (d(), p(S, null, [
      m("button", {
        ref_key: "anchor",
        ref: r,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": c.value,
        "aria-controls": k(a),
        "aria-label": e.ariaLabel,
        disabled: e.disabled,
        onClick: y[0] || (y[0] = (b) => c.value = !c.value),
        onKeydown: F
      }, [
        m("span", Be, [
          P.value ? (d(), p("span", qe, [
            I(k(N), {
              icon: P.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            m("span", Ke, $(P.value.title), 1)
          ])) : (d(), p("span", Ye, $(e.placeholder || "Select…"), 1))
        ]),
        m("span", Je, [
          I(k(N), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, ze),
      I(le, {
        open: c.value,
        "onUpdate:open": y[3] || (y[3] = (b) => c.value = b),
        anchor: r.value
      }, {
        default: se(() => [
          m("div", Ge, [
            m("div", Qe, [
              _(m("input", {
                ref_key: "search",
                ref: s,
                "onUpdate:modelValue": y[1] || (y[1] = (b) => l.value = b),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${e.ariaLabel || e.placeholder || "options"}`,
                "aria-controls": k(a),
                "aria-activedescendant": D.value,
                onKeydown: F
              }, null, 40, Xe), [
                [A, l.value]
              ])
            ]),
            m("ul", {
              id: k(a),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": e.ariaLabel || e.placeholder || "Options"
            }, [
              (d(!0), p(S, null, M(x.value, (b) => (d(), p(S, {
                key: b.group
              }, [
                m("li", et, $(b.group), 1),
                (d(!0), p(S, null, M(b.items, ({ item: f, index: v }) => (d(), p("li", {
                  id: `${k(a)}-${v}`,
                  key: f.id,
                  class: ie(["p-select-option kx-ps-option", { "p-select-option-selected": f.id === e.modelValue, "p-focus": v === i.value }]),
                  role: "option",
                  "aria-selected": f.id === e.modelValue,
                  onClick: (C) => H(f),
                  onMousemove: (C) => i.value = v
                }, [
                  I(k(N), {
                    icon: f.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  m("span", rt, [
                    m("span", nt, $(f.title), 1),
                    f.subtitle ? (d(), p("span", ot, $(f.subtitle), 1)) : T("", !0)
                  ])
                ], 42, tt))), 128))
              ], 64))), 128)),
              e.loading ? (d(), p("li", st, "Loading…")) : !h.value.length && !e.error ? (d(), p("li", it, "No matches")) : T("", !0)
            ], 8, Ze),
            e.error ? (d(), p("div", lt, $(e.error), 1)) : T("", !0),
            e.more ? (d(), p("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: e.loading || e.disabled,
              onClick: y[2] || (y[2] = (b) => o("more"))
            }, "Load more", 8, at)) : T("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
function ct(e) {
  return !!(e && typeof e.picker == "string" && e.picker && e.picker !== "wc-schema-form");
}
function Q(e) {
  return e?.config_schema;
}
function X(e, t = "ports") {
  const n = Q(e);
  if (!n) return null;
  const o = [];
  for (const [x, h] of Object.entries(n))
    ct(h) && o.push([x, h]);
  if (o.length === 0) return null;
  o.length > 1 && console.error(`${t}: port schema declares multiple picker fields`, o.map(([x]) => x));
  const [r, s] = o[0], c = typeof s.class == "string" ? s.class : "", l = typeof s.title == "string" ? s.title : "", i = typeof s.detail == "string" ? s.detail : "", a = typeof s.delete_endpoint == "string" ? s.delete_endpoint : "";
  return { key: r, tag: s.picker ?? "", threadClass: c, title: l, schema: { properties: { [r]: s } }, detail: i, deleteEndpoint: a };
}
function ut(e, t = "ports") {
  const n = Q(e);
  if (!n) return null;
  const o = X(e, t)?.key, r = {};
  for (const [s, c] of Object.entries(n))
    s !== o && (r[s] = c);
  return Object.keys(r).length ? { type: "object", properties: r } : null;
}
function dt(e) {
  if (!e) return null;
  if (typeof e == "string")
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  return e;
}
function pt(e) {
  const t = dt(e);
  return !!(t && t.properties && Object.keys(t.properties).length);
}
const Tt = "wc-schema-form", ft = "wc-component-picker", Z = "trigger-config";
function Ct(e) {
  return e ? X({ config_schema: e.fields }, Z) : null;
}
function wt(e, t) {
  const n = e?.key || "";
  return n ? String(t[n] || "") : "";
}
function mt(e) {
  return e ? ut({ config_schema: e.fields }, Z) : null;
}
function Pt(e, t) {
  return !!t && pt(mt(e));
}
function Et(e, t) {
  if (t?.tag !== ft) return;
  const n = t.threadClass;
  if (n)
    return {
      type: "thread",
      thread_class: n,
      title: t?.title ?? "",
      component: e?.component,
      delete_endpoint: t?.deleteEndpoint || ""
    };
}
export {
  J as C,
  Tt as S,
  gt as T,
  St as _,
  Et as a,
  pt as b,
  dt as c,
  $t as d,
  Ct as e,
  xt as f,
  kt as g,
  Pt as h,
  wt as i,
  w as j,
  mt as o,
  X as p,
  vt as r,
  ut as s,
  _t as t
};
//# sourceMappingURL=source-instance-3CT9YsFn.js.map
