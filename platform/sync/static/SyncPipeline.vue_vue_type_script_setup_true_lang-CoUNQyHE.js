import { defineComponent as F, ref as x, onMounted as De, watch as q, onBeforeUnmount as fe, openBlock as k, createElementBlock as y, createElementVNode as d, nextTick as J, createVNode as A, unref as i, Fragment as D, normalizeClass as me, toDisplayString as H, createCommentVNode as P, createBlock as Fe, resolveDynamicComponent as ze, normalizeStyle as We, renderSlot as Ke, useId as Ue, computed as g, withCtx as Ge, withDirectives as ne, vModelText as ve, renderList as ue, createTextVNode as Je, vModelCheckbox as Ye } from "vue";
import { Icon as N } from "@iconify/vue";
import { loadByTagName as Qe, api as ee } from "@wippy-fe/proxy";
function te(t, l) {
  if (t && typeof t == "object") {
    const e = t, c = e.response?.data?.error;
    if (typeof c == "string") return c;
    if (c && typeof c == "object" && typeof c.message == "string")
      return c.message;
    if (typeof e.message == "string" && e.message) return e.message;
  }
  return l;
}
const Xe = { class: "kx-wcmount" }, Ze = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, et = /* @__PURE__ */ F({
  __name: "WcMount",
  props: {
    tag: {},
    config: {},
    schema: {},
    meta: {},
    provider: {},
    label: {},
    attrs: {}
  },
  emits: ["change", "select", "created", "close", "error"],
  setup(t, { emit: l }) {
    const e = t, c = l, s = x(null), a = x(!1);
    let o = null, b = 0;
    const f = /* @__PURE__ */ new Set();
    function S(r) {
      r.composedPath()[0] === o && (r.stopPropagation(), c("change", r.detail));
    }
    function O(r) {
      return r.composedPath()[0] !== o ? !1 : (r.stopPropagation(), !0);
    }
    function C(r) {
      O(r) && c("select", r.detail);
    }
    function I(r) {
      O(r) && c("created", r.detail);
    }
    function T(r) {
      O(r) && c("close", r.detail);
    }
    function M(r) {
      O(r) && c("error", r.detail);
    }
    function _(r) {
      if (typeof r == "string") return r;
      try {
        return JSON.stringify(r ?? {});
      } catch {
        return null;
      }
    }
    function u() {
      if (!o) return;
      const r = _(e.config);
      if (r !== null && o.setAttribute("config", r), e.schema !== void 0 && e.schema !== null) {
        const w = _(e.schema);
        w !== null && o.setAttribute("schema", w);
      }
      if (e.meta !== void 0 && e.meta !== null) {
        const w = _(e.meta);
        w !== null && o.setAttribute("meta", w);
      }
      e.provider && o.setAttribute("provider", e.provider), e.label && o.setAttribute("label", e.label);
      const $ = e.attrs || {};
      for (const w of [...f])
        (!(w in $) || $[w] == null) && (o.removeAttribute(w), f.delete(w));
      for (const [w, L] of Object.entries($)) {
        if (L == null) continue;
        const j = typeof L == "object" ? _(L) : String(L);
        j !== null && (o.setAttribute(w, j), f.add(w));
      }
    }
    function v(r = o) {
      r && (r.removeEventListener("config-changed", S), r.removeEventListener("change", S), r.removeEventListener("select", C), r.removeEventListener("created", I), r.removeEventListener("close", T), r.removeEventListener("error", M), r === o && (o = null), f.clear());
    }
    async function E(r) {
      if (!customElements.get(r))
        try {
          await Qe(r, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function m() {
      const r = ++b, $ = s.value, w = e.tag;
      if (a.value = !1, !!$ && (v(), $.innerHTML = "", !!w))
        try {
          if (await E(w), r !== b || s.value !== $ || e.tag !== w) return;
          const L = document.createElement(w);
          L.classList.add("kx-wcmount-surface"), o = L, u(), L.addEventListener("config-changed", S), L.addEventListener("change", S), L.addEventListener("select", C), L.addEventListener("created", I), L.addEventListener("close", T), L.addEventListener("error", M), L.style.display = "block", $.appendChild(L), a.value = !customElements.get(w);
        } catch {
          r === b && (a.value = !0);
        }
    }
    async function h() {
      a.value = !1, await J(), await m();
    }
    return De(m), q(() => e.tag, m), q(() => [e.config, e.schema, e.meta, e.provider, e.label, e.attrs], u, { deep: !0 }), fe(() => {
      b += 1, v();
    }), (r, $) => (k(), y("div", Xe, [
      a.value ? (k(), y("div", Ze, [
        $[0] || ($[0] = d("span", null, "This setup panel couldn’t load.", -1)),
        d("button", {
          type: "button",
          onClick: h
        }, "Try again")
      ])) : (k(), y("div", {
        key: 1,
        ref_key: "host",
        ref: s
      }, null, 512))
    ]));
  }
}), tt = (t, l) => {
  const e = t.__vccOpts || t;
  for (const [c, s] of l)
    e[c] = s;
  return e;
}, oe = /* @__PURE__ */ tt(et, [["__scopeId", "data-v-3d6a00f1"]]), nt = { class: "kx-stage" }, ot = { class: "kx-stage-head" }, st = { class: "kx-stage-ico" }, it = {
  class: "kx-stage-cfg",
  "data-test": "pl-trigger"
}, at = "kickside-trigger-config", rt = /* @__PURE__ */ F({
  __name: "SyncCreateSource",
  props: {
    icon: {},
    seed: {},
    editing: { type: Boolean }
  },
  emits: ["change"],
  setup(t, { emit: l }) {
    const e = t, c = l;
    function s(a) {
      c("change", a);
    }
    return (a, o) => (k(), y("div", nt, [
      d("div", ot, [
        d("span", st, [
          A(i(N), {
            icon: e.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        o[0] || (o[0] = d("span", { class: "kx-stage-lbl" }, "Source", -1))
      ]),
      d("div", it, [
        A(oe, {
          tag: at,
          attrs: { allowed: "source", reconfigure: e.editing ? "true" : null, value: e.seed },
          onChange: s
        }, null, 8, ["attrs"])
      ])
    ]));
  }
}), lt = { class: "kx-stage kx-stage-mid" }, ct = { class: "kx-stage-head" }, ut = { class: "kx-stage-ico" }, dt = {
  key: 0,
  class: "kx-stage-desc",
  "data-test": "pl-transform-hint"
}, pt = {
  key: 1,
  class: "kx-stage-desc",
  role: "alert"
}, ft = "kickside-transform-assist", mt = /* @__PURE__ */ F({
  __name: "SyncCreateTransform",
  props: {
    canAssist: { type: Boolean },
    detected: {},
    transform: {},
    samples: {},
    sampleError: {},
    sourceSchema: {},
    sinkSchema: {},
    inputShape: {},
    hint: {},
    value: {},
    generationPolicy: {}
  },
  emits: ["transform-confirmed"],
  setup(t, { emit: l }) {
    const e = t, c = l;
    function s(a) {
      c("transform-confirmed", a);
    }
    return (a, o) => (k(), y("div", lt, [
      d("div", ct, [
        d("span", ut, [
          A(i(N), {
            icon: "tabler:transform",
            "aria-hidden": "true"
          })
        ]),
        o[0] || (o[0] = d("span", { class: "kx-stage-lbl" }, "Transform", -1))
      ]),
      e.canAssist ? (k(), y(D, { key: 1 }, [
        e.detected && (!e.transform || e.transform.kind === "none") ? (k(), y("div", {
          key: 0,
          class: me(["kx-detect", e.detected.needed && "kx-detect-warn"])
        }, [
          A(i(N), {
            icon: e.detected.needed ? "tabler:alert-triangle" : "tabler:circle-check",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          d("span", null, H(e.detected.reason), 1)
        ], 2)) : P("", !0),
        e.sampleError ? (k(), y("p", pt, H(e.sampleError), 1)) : P("", !0),
        (k(), Fe(ze(ft), {
          "data-test": "pl-transform",
          samples: e.samples,
          "source-schema": e.sourceSchema,
          "sink-schema": e.sinkSchema,
          "input-shape": e.inputShape,
          hint: e.hint,
          value: e.value,
          "generation-policy": e.generationPolicy,
          onTransformConfirmed: s
        }, null, 40, ["samples", "source-schema", "sink-schema", "input-shape", "hint", "value", "generation-policy"]))
      ], 64)) : (k(), y("p", dt, "Pick a source and destination to define the transform."))
    ]));
  }
}), vt = 2e3;
function de(t) {
  const l = t.margin ?? 8, e = t.gap ?? 4, c = Math.max(0, t.viewportWidth), s = Math.max(0, t.viewportHeight), a = Math.max(0, c - l * 2), o = Math.min(Math.max(0, t.requestedWidth), a), b = t.align === "right" ? t.anchor.right - o : t.anchor.left, f = Math.max(l, Math.min(b, c - l - o)), S = Math.max(0, s - t.anchor.bottom - e - l), O = Math.max(0, t.anchor.top - e - l), C = S < t.requestedMaxHeight && O > S ? "above" : "below", I = C === "above" ? O : S, T = Math.round(Math.min(Math.max(0, t.requestedMaxHeight), I)), M = Math.min(Math.max(0, t.panelHeight ?? T), T), _ = C === "above" ? t.anchor.top - e - M : t.anchor.bottom + e, u = t.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(f - u.left),
    width: Math.round(o),
    maxHeight: T,
    side: C,
    top: Math.round(_ - u.top)
  };
}
const ht = /* @__PURE__ */ F({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: vt }
  },
  emits: ["update:open"],
  setup(t, { emit: l }) {
    const e = t, c = l, s = x(null), a = x({ position: "fixed", visibility: "hidden" });
    function o() {
      const _ = e.anchor, u = s.value;
      if (!_ || !u) return;
      const v = _.getBoundingClientRect(), E = e.width === "anchor" ? Math.max(e.minWidth, v.width) : Math.max(e.minWidth, e.width), m = {
        anchor: v,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: E,
        requestedMaxHeight: e.maxHeight,
        align: e.align,
        gap: e.gap
      }, h = de(m);
      Object.assign(u.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${h.width}px`,
        maxHeight: `${h.maxHeight}px`,
        visibility: "hidden"
      });
      const r = u.getBoundingClientRect(), $ = de({
        ...m,
        containingBlockOrigin: { left: r.left, top: r.top },
        panelHeight: r.height
      }), w = {
        position: "fixed",
        left: `${$.left}px`,
        top: `${$.top}px`,
        width: `${$.width}px`,
        maxHeight: `${$.maxHeight}px`,
        "--anchored-panel-available-height": `${$.maxHeight}px`,
        margin: "0",
        zIndex: String(e.zIndex),
        visibility: "visible"
      };
      a.value = w;
    }
    let b = null, f = !1;
    function S() {
      f || !e.open || (f = !0, requestAnimationFrame(() => {
        f = !1, e.open && o();
      }));
    }
    function O() {
      typeof ResizeObserver > "u" || (b = new ResizeObserver(S), s.value && b.observe(s.value), e.anchor && b.observe(e.anchor));
    }
    function C() {
      b?.disconnect(), b = null, f = !1;
    }
    q(() => e.open, async (_) => {
      C(), _ && (a.value = { position: "fixed", visibility: "hidden" }, await J(), o(), O());
    }, { immediate: !0 });
    function I(_) {
      if (!e.open) return;
      const u = _.composedPath();
      s.value && u.includes(s.value) || e.anchor && u.includes(e.anchor) || c("update:open", !1);
    }
    function T(_) {
      e.open && _.key === "Escape" && c("update:open", !1);
    }
    function M() {
      e.open && o();
    }
    return document.addEventListener("click", I), document.addEventListener("keydown", T), window.addEventListener("resize", M), window.addEventListener("scroll", M, !0), fe(() => {
      C(), document.removeEventListener("click", I), document.removeEventListener("keydown", T), window.removeEventListener("resize", M), window.removeEventListener("scroll", M, !0);
    }), (_, u) => t.open ? (k(), y("div", {
      key: 0,
      ref_key: "panel",
      ref: s,
      class: "anchored-panel",
      style: We(a.value)
    }, [
      Ke(_.$slots, "default")
    ], 4)) : P("", !0);
  }
}), gt = ["aria-expanded", "aria-controls", "aria-label", "disabled"], kt = { class: "p-select-label" }, yt = {
  key: 0,
  class: "kx-ps-val"
}, bt = { class: "kx-ps-val-label" }, xt = {
  key: 1,
  class: "kx-ps-ph"
}, _t = { class: "p-select-dropdown" }, St = { class: "p-select-overlay kx-ps-panel" }, wt = { class: "p-select-header" }, Ct = ["aria-label", "aria-controls", "aria-activedescendant"], Et = ["id", "aria-label"], $t = {
  class: "p-select-option-group",
  role: "presentation"
}, Mt = ["id", "aria-selected", "onClick", "onMousemove"], Lt = { class: "kx-ps-opt-body" }, Ot = { class: "kx-ps-opt-title" }, At = {
  key: 0,
  class: "kx-ps-opt-sub"
}, It = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, Tt = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, Pt = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, Ht = ["disabled"], Bt = /* @__PURE__ */ F({
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
  setup(t, { emit: l }) {
    const e = t, c = l, s = x(null), a = x(null), o = x(!1), b = x(""), f = x(0), S = Ue(), O = g(() => {
      const u = b.value.trim().toLowerCase(), v = /* @__PURE__ */ new Map();
      for (const m of e.items) {
        if (!e.remote && u && ![m.title, m.subtitle, m.id, m.group].some(($) => $?.toLowerCase().includes(u))) continue;
        const h = m.group || "Other", r = v.get(h);
        r ? r.push(m) : v.set(h, [m]);
      }
      let E = 0;
      return [...v.entries()].sort((m, h) => m[0].localeCompare(h[0])).map(([m, h]) => ({ group: m, items: h.map((r) => ({ item: r, index: E++ })) }));
    }), C = g(() => O.value.flatMap((u) => u.items)), I = g(() => e.items.find((u) => u.id === e.modelValue)), T = g(() => C.value[f.value] ? `${S}-${f.value}` : void 0);
    q(b, () => {
      f.value = 0;
    }), q([o, b], ([u, v]) => {
      u && e.remote && c("search", v);
    }), q(() => e.disabled, (u) => {
      u && (o.value = !1);
    }), q(o, async (u) => {
      if (!u) {
        s.value?.focus();
        return;
      }
      b.value = "", f.value = Math.max(0, C.value.findIndex(({ item: v }) => v.id === e.modelValue)), await J(), a.value?.focus();
    });
    function M(u) {
      e.disabled || e.loading || (c("update:modelValue", u.id), o.value = !1);
    }
    async function _(u) {
      if (u.key === "Escape" && o.value) {
        u.preventDefault(), u.stopPropagation(), o.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(u.key)) return;
      if (u.preventDefault(), !o.value) {
        o.value = !0;
        return;
      }
      if (u.key === "Enter") {
        const m = C.value[f.value];
        m && M(m.item);
        return;
      }
      const v = C.value.length - 1;
      f.value = u.key === "Home" ? 0 : u.key === "End" ? v : Math.max(0, Math.min(v, f.value + (u.key === "ArrowDown" ? 1 : -1))), await J(), s.value?.getRootNode()?.querySelector(`[id="${T.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (u, v) => (k(), y(D, null, [
      d("button", {
        ref_key: "anchor",
        ref: s,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": o.value,
        "aria-controls": i(S),
        "aria-label": t.ariaLabel,
        disabled: t.disabled,
        onClick: v[0] || (v[0] = (E) => o.value = !o.value),
        onKeydown: _
      }, [
        d("span", kt, [
          I.value ? (k(), y("span", yt, [
            A(i(N), {
              icon: I.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            d("span", bt, H(I.value.title), 1)
          ])) : (k(), y("span", xt, H(t.placeholder || "Select…"), 1))
        ]),
        d("span", _t, [
          A(i(N), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, gt),
      A(ht, {
        open: o.value,
        "onUpdate:open": v[3] || (v[3] = (E) => o.value = E),
        anchor: s.value
      }, {
        default: Ge(() => [
          d("div", St, [
            d("div", wt, [
              ne(d("input", {
                ref_key: "search",
                ref: a,
                "onUpdate:modelValue": v[1] || (v[1] = (E) => b.value = E),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${t.ariaLabel || t.placeholder || "options"}`,
                "aria-controls": i(S),
                "aria-activedescendant": T.value,
                onKeydown: _
              }, null, 40, Ct), [
                [ve, b.value]
              ])
            ]),
            d("ul", {
              id: i(S),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": t.ariaLabel || t.placeholder || "Options"
            }, [
              (k(!0), y(D, null, ue(O.value, (E) => (k(), y(D, {
                key: E.group
              }, [
                d("li", $t, H(E.group), 1),
                (k(!0), y(D, null, ue(E.items, ({ item: m, index: h }) => (k(), y("li", {
                  id: `${i(S)}-${h}`,
                  key: m.id,
                  class: me(["p-select-option kx-ps-option", { "p-select-option-selected": m.id === t.modelValue, "p-focus": h === f.value }]),
                  role: "option",
                  "aria-selected": m.id === t.modelValue,
                  onClick: (r) => M(m),
                  onMousemove: (r) => f.value = h
                }, [
                  A(i(N), {
                    icon: m.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  d("span", Lt, [
                    d("span", Ot, H(m.title), 1),
                    m.subtitle ? (k(), y("span", At, H(m.subtitle), 1)) : P("", !0)
                  ])
                ], 42, Mt))), 128))
              ], 64))), 128)),
              t.loading ? (k(), y("li", It, "Loading…")) : !C.value.length && !t.error ? (k(), y("li", Tt, "No matches")) : P("", !0)
            ], 8, Et),
            t.error ? (k(), y("div", Pt, H(t.error), 1)) : P("", !0),
            t.more ? (k(), y("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: t.loading || t.disabled,
              onClick: v[2] || (v[2] = (E) => c("more"))
            }, "Load more", 8, Ht)) : P("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), Rt = { class: "kx-stage" }, Nt = { class: "kx-stage-head" }, qt = { class: "kx-stage-ico" }, jt = {
  key: 0,
  class: "kx-stage-desc"
}, Vt = {
  key: 0,
  class: "kx-stage-desc"
}, Dt = { class: "kx-stage-cfg" }, Ft = {
  key: 0,
  class: "kx-stage-opts"
}, zt = /* @__PURE__ */ F({
  __name: "SyncCreateDestination",
  props: {
    items: {},
    sinkId: {},
    editing: { type: Boolean },
    selectedSink: {},
    configTag: {},
    configSchema: {},
    pickerMeta: {},
    config: {},
    hasOptions: { type: Boolean },
    optionsSchema: {},
    lockedHint: {},
    sourceContext: {},
    sourceSchema: {}
  },
  emits: ["update:sinkId", "update:config", "binding"],
  setup(t, { emit: l }) {
    const e = t, c = l;
    function s(a) {
      a && typeof a == "object" && c("update:config", a);
    }
    return (a, o) => (k(), y("div", Rt, [
      d("div", Nt, [
        d("span", qt, [
          A(i(N), {
            icon: e.selectedSink?.icon || "tabler:database",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        o[2] || (o[2] = d("span", { class: "kx-stage-lbl" }, "Destination", -1))
      ]),
      A(Bt, {
        items: e.items,
        "model-value": e.sinkId,
        disabled: e.editing,
        placeholder: "Pick a destination…",
        "onUpdate:modelValue": o[0] || (o[0] = (b) => c("update:sinkId", b))
      }, null, 8, ["items", "model-value", "disabled"]),
      e.editing ? (k(), y("p", jt, H(e.lockedHint), 1)) : P("", !0),
      e.selectedSink && !e.editing ? (k(), y(D, { key: 1 }, [
        e.selectedSink.description ? (k(), y("p", Vt, H(e.selectedSink.description), 1)) : P("", !0),
        d("div", Dt, [
          A(oe, {
            tag: e.configTag,
            schema: e.configSchema,
            config: e.config,
            meta: e.pickerMeta,
            provider: e.selectedSink.provider,
            attrs: { "source-context": e.sourceContext, "source-schema": e.sourceSchema, "return-route": "/automations" },
            onChange: s,
            onSelect: o[1] || (o[1] = (b) => c("binding", b))
          }, null, 8, ["tag", "schema", "config", "meta", "provider", "attrs"]),
          e.hasOptions ? (k(), y("div", Ft, [
            o[3] || (o[3] = d("span", { class: "kx-opts-lbl" }, "Options", -1)),
            A(oe, {
              tag: "wc-schema-form",
              schema: e.optionsSchema,
              config: e.config,
              onChange: s
            }, null, 8, ["schema", "config"])
          ])) : P("", !0)
        ])
      ], 64)) : P("", !0)
    ]));
  }
});
function Wt(t) {
  return !!(t && typeof t.picker == "string" && t.picker && t.picker !== "wc-schema-form");
}
function he(t) {
  return t?.config_schema;
}
function ge(t, l = "ports") {
  const e = he(t);
  if (!e) return null;
  const c = [];
  for (const [O, C] of Object.entries(e))
    Wt(C) && c.push([O, C]);
  if (c.length === 0) return null;
  c.length > 1 && console.error(`${l}: port schema declares multiple picker fields`, c.map(([O]) => O));
  const [s, a] = c[0], o = typeof a.class == "string" ? a.class : "", b = typeof a.title == "string" ? a.title : "", f = typeof a.detail == "string" ? a.detail : "", S = typeof a.delete_endpoint == "string" ? a.delete_endpoint : "";
  return { key: s, tag: a.picker ?? "", threadClass: o, title: b, schema: { properties: { [s]: a } }, detail: f, deleteEndpoint: S };
}
function Kt(t, l = "ports") {
  const e = he(t);
  if (!e) return null;
  const c = ge(t, l)?.key, s = {};
  for (const [a, o] of Object.entries(e))
    a !== c && (s[a] = o);
  return Object.keys(s).length ? { type: "object", properties: s } : null;
}
function G(t) {
  if (!t) return null;
  if (typeof t == "string")
    try {
      return JSON.parse(t);
    } catch {
      return null;
    }
  return t;
}
function Ut(t) {
  const l = G(t);
  return !!(l && l.properties && Object.keys(l.properties).length);
}
const Gt = "_portable_input";
function U(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : null;
}
function Jt(t) {
  const l = U(t);
  return l && typeof l.kind == "string" ? l : null;
}
function Yt(t) {
  return t === !0 ? !0 : void 0;
}
function ke(t) {
  if (!t.transform) throw new Error("transform selection is required");
  const l = {
    title: t.title.trim(),
    trigger: t.trigger,
    sink_port: t.sinkPort,
    sink_config: t.sinkConfig,
    transform: t.transform,
    enabled: t.enabled
  };
  return t.reconcile && (l.reconcile = t.reconcile), t.outputSchema !== void 0 && (l.output_schema = t.outputSchema), l;
}
function pn(t) {
  const l = U(t), e = U(l?.[Gt]), c = U(e?.trigger), s = typeof e?.sink_port == "string" ? e.sink_port : "", a = Jt(e?.transform), o = l?.enabled;
  return !e || !c || !s || !a || typeof o != "boolean" ? null : ke({
    title: typeof e.title == "string" ? e.title : "",
    trigger: c,
    sinkPort: s,
    sinkConfig: U(e.sink_config) ?? {},
    transform: a,
    outputSchema: e.output_schema,
    reconcile: Yt(e.reconcile),
    enabled: o
  });
}
const Qt = "wc-component-picker", Xt = "wc-schema-form", pe = "Locked after install — reinstall the data sync to change it.";
function fn(t) {
  const l = t.managed, e = x(""), c = x(""), s = x({}), a = x(), o = x(!1), b = x(!0), f = x({ v: 2 }), S = x(!1), O = g(() => S.value && f.value.source ? {
    source: f.value.source,
    config: f.value.config || {},
    ...f.value.filter ? { filter: f.value.filter } : {}
  } : void 0), C = x(""), I = x(void 0), T = x(""), M = x(null), _ = x([]), u = x([]), v = g(() => {
    const n = f.value.source;
    return typeof n == "string" ? n : "";
  }), E = g(() => _.value.filter((n) => n.id === v.value)), m = g(() => E.value[0] || null), h = g(() => u.value.find((n) => n.id === c.value) || null);
  function r() {
    l || (o.value = !1);
  }
  function $() {
    s.value = {}, a.value = void 0, o.value = !1;
  }
  function w(n) {
    const p = n ?? {};
    if (!p.spec || typeof p.spec != "object" || Array.isArray(p.spec)) return;
    const z = v.value;
    f.value = { ...p.spec }, S.value = p.valid === !0, C.value = typeof p.error == "string" ? p.error : "", p.output_schema !== void 0 && (I.value = p.output_schema), v.value !== z && r();
  }
  const L = x([]), j = x(void 0), Y = x(""), ye = g(() => S.value && v.value ? JSON.stringify({ source: v.value, config: f.value.config ?? {}, limit: 1 }) : "");
  q(ye, async (n, p, z) => {
    let W = !0;
    if (z(() => {
      W = !1;
    }), L.value = [], j.value = void 0, Y.value = "", !!n)
      try {
        const { data: B } = await ee.post(
          "/api/v1/automations/source-samples",
          JSON.parse(n)
        );
        if (!W) return;
        if (B.success !== !0 || !Array.isArray(B.samples)) throw new Error(te(B.error, "Could not read source samples."));
        L.value = B.samples, j.value = B.output_schema;
      } catch (B) {
        W && (Y.value = te(B, "Could not read source samples."));
      }
  });
  const be = g(() => JSON.stringify(L.value.map((n) => ({ payload: n })))), xe = g(() => {
    for (const n of E.value) {
      const p = n.reconcile;
      if (p && typeof p.pull_keys == "string" && p.pull_keys) return p;
    }
    return null;
  }), se = g(() => !xe.value || !h.value || !E.value.some((p) => p.surface === "collection") ? !1 : !!(h.value.operations || {}).delete), _e = g(() => u.value.map((n) => ({
    id: n.id,
    title: n.title || n.name || n.id,
    icon: n.icon || "tabler:database",
    group: n.group || "Destinations",
    subtitle: n.description
  }))), V = g(() => ge(h.value, "SyncForm")), Se = g(() => {
    if (V.value?.tag !== Qt) return;
    const n = String(h.value?.class || "");
    if (n)
      return { type: "thread", thread_class: n, title: V.value?.title ?? "", component: h.value?.component, delete_endpoint: V.value?.deleteEndpoint || "" };
  }), we = g(() => V.value?.tag || Xt), Q = g(() => Kt(h.value, "SyncForm")), Ce = g(() => V.value?.schema ?? Q.value), Ee = g(() => !!V.value && Ut(Q.value)), $e = g(() => {
    if (!h.value) return !1;
    const n = V.value;
    if (n && h.value.config_schema?.[n.key]?.required) {
      const p = s.value[n.key];
      return p != null && p !== "" && (!Array.isArray(p) || p.length > 0);
    }
    return !0;
  }), ie = g(() => {
    if (j.value != null) return G(j.value);
    for (const n of E.value)
      if (n.output_schema != null) return G(n.output_schema);
    return null;
  }), ae = g(() => G(a.value ?? h.value?.input_schema) ?? (h.value ? { properties: { content: { type: "string" } }, required: ["content"] } : null)), Me = g(() => {
    if (!v.value || !h.value) return null;
    const n = ae.value;
    if (!n || !n.properties) return { needed: !1, reason: "Destination accepts the item as-is — no transform needed." };
    const p = new Set(Object.keys(ie.value?.properties || {})), z = /* @__PURE__ */ new Set(), W = /* @__PURE__ */ new Map(), B = h.value?.config_schema || {};
    for (const [R, Ve] of Object.entries(B)) {
      const K = Ve || {};
      if (typeof K.supplies != "string") continue;
      W.set(K.supplies, typeof K.title == "string" && K.title ? K.title : R);
      const Z = s.value[R];
      Z != null && Z !== "" && z.add(K.supplies);
    }
    const X = (n.required || []).filter((R) => !p.has(R) && !z.has(R));
    if (X.length === 0) return { needed: !1, reason: "Fields line up — pass through works." };
    const ce = l ? [] : X.map((R) => W.get(R)).filter((R) => !!R), je = ce.length ? `, or fill ${ce.join(", ")} below` : "";
    return { needed: !0, reason: `Destination needs ${X.join(", ")}, not in the source — map it with an Expression or LLM${je}.` };
  }), re = g(() => !!v.value && !!h.value), Le = g(() => JSON.stringify(ie.value ?? {})), Oe = g(() => JSON.stringify(ae.value ?? {})), Ae = g(() => h.value?.input_shape ?? ""), Ie = g(() => {
    if (!re.value) return "";
    const n = m.value?.title || m.value?.name || "source", p = h.value?.title || h.value?.name || "destination";
    return `Map ${n} items into ${p} input.`;
  }), Te = g(() => M.value ? JSON.stringify(M.value) : "");
  function Pe(n) {
    le(n.detail?.transform);
  }
  function le(n) {
    const p = n;
    p && typeof p.kind == "string" && (M.value = p);
  }
  function He(n) {
    if (!n || typeof n != "object") return;
    const p = n;
    a.value = p.input_schema, le(p.transform);
  }
  const Be = g(() => {
    if (!e.value.trim()) return "Name is required.";
    if (!S.value) return C.value || "Source is required.";
    if (!c.value) return "Destination is required.";
    if (!$e.value) return "Destination configuration is required.";
    const n = M.value;
    return n ? n.kind === "expr" && !n.expr.trim() ? "Expression is required." : n.kind === "llm" && !n.prompt.trim() ? "Prompt is required." : n.kind === "code" && !n.code.trim() ? "Code is required." : "" : "Transform selection is required.";
  });
  async function Re() {
    try {
      const [n, p] = await Promise.all([
        ee.get("/api/v1/automations/sources"),
        ee.get("/api/v1/automations/sinks")
      ]);
      return _.value = n.data?.sources || [], u.value = p.data?.sinks || [], !l && u.value.length === 1 && (c.value = u.value[0].id), "";
    } catch (n) {
      return te(n, "failed to load catalog");
    }
  }
  function Ne(n) {
    e.value = n.title, T.value = n.trigger, f.value = n.trigger, I.value = n.output_schema, M.value = n.transform, c.value = n.sink_port, s.value = n.sink_config, o.value = n.reconcile != null, b.value = n.enabled;
  }
  function qe() {
    return ke({
      // The trigger spec rides verbatim as input.trigger: the trigger service
      // validates and normalizes it server-side.
      title: e.value,
      trigger: f.value,
      sinkPort: c.value,
      sinkConfig: s.value,
      transform: M.value,
      outputSchema: I.value,
      reconcile: (l || se.value) && o.value ? !0 : void 0,
      enabled: b.value
    });
  }
  return {
    managed: l,
    sourceContext: O,
    title: e,
    sinkId: c,
    sinkConfig: s,
    reconcileEnabled: o,
    triggerSeed: T,
    transform: M,
    sources: _,
    sinks: u,
    selectedSource: m,
    selectedSink: h,
    supportsReconcile: se,
    sinkItems: _e,
    sinkPickerMeta: Se,
    sinkConfigTag: we,
    sinkConfigSchema: Ce,
    sinkOptionsSchema: Q,
    sinkHasOptions: Ee,
    transformDetected: Me,
    canAssist: re,
    assistSourceSchema: Le,
    assistSinkSchema: Oe,
    assistInputShape: Ae,
    assistHint: Ie,
    assistValue: Te,
    validationError: Be,
    assistSamples: be,
    sampleError: Y,
    onTriggerChange: w,
    onAssistConfirmed: Pe,
    onSinkChange: $,
    onSinkBinding: He,
    loadCatalog: Re,
    seed: Ne,
    currentInput: qe
  };
}
const Zt = { class: "kx-field" }, en = { class: "kx-pipe" }, tn = { class: "kx-pipe-conn" }, nn = { class: "kx-pipe-conn" }, on = {
  key: 0,
  class: "kx-runopts"
}, sn = { class: "kx-field" }, an = { class: "kx-reconcile-check" }, rn = ["disabled"], ln = { class: "kx-field-hint" }, mn = /* @__PURE__ */ F({
  __name: "SyncPipeline",
  props: {
    form: {},
    destinationLocked: { type: Boolean },
    generationPolicy: {}
  },
  setup(t) {
    const l = t, e = l.form;
    return (c, s) => (k(), y(D, null, [
      d("label", Zt, [
        s[4] || (s[4] = d("span", { class: "kx-field-lbl" }, [
          Je("Name "),
          d("span", {
            class: "kx-req",
            "aria-hidden": "true"
          }, "*")
        ], -1)),
        ne(d("input", {
          "onUpdate:modelValue": s[0] || (s[0] = (a) => i(e).title.value = a),
          "data-test": "pl-title",
          class: "kx-input",
          type: "text",
          placeholder: "Fireflies to Knowledge Base"
        }, null, 512), [
          [ve, i(e).title.value]
        ])
      ]),
      d("div", en, [
        A(rt, {
          icon: i(e).selectedSource.value?.icon || "tabler:plug",
          seed: i(e).triggerSeed.value,
          editing: i(e).managed,
          onChange: i(e).onTriggerChange
        }, null, 8, ["icon", "seed", "editing", "onChange"]),
        d("div", tn, [
          A(i(N), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        A(mt, {
          "can-assist": i(e).canAssist.value,
          detected: i(e).transformDetected.value,
          transform: i(e).transform.value,
          samples: i(e).assistSamples.value,
          "sample-error": i(e).sampleError.value,
          "source-schema": i(e).assistSourceSchema.value,
          "sink-schema": i(e).assistSinkSchema.value,
          "input-shape": i(e).assistInputShape.value,
          hint: i(e).assistHint.value,
          value: i(e).assistValue.value,
          "generation-policy": l.generationPolicy,
          onTransformConfirmed: i(e).onAssistConfirmed
        }, null, 8, ["can-assist", "detected", "transform", "samples", "sample-error", "source-schema", "sink-schema", "input-shape", "hint", "value", "generation-policy", "onTransformConfirmed"]),
        d("div", nn, [
          A(i(N), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        A(zt, {
          items: i(e).sinkItems.value,
          "sink-id": i(e).sinkId.value,
          editing: i(e).managed || !!l.destinationLocked,
          "selected-sink": i(e).selectedSink.value,
          "config-tag": i(e).sinkConfigTag.value,
          "config-schema": i(e).sinkConfigSchema.value,
          "picker-meta": i(e).sinkPickerMeta.value,
          config: i(e).sinkConfig.value,
          "source-context": i(e).sourceContext.value,
          "source-schema": i(e).assistSourceSchema.value,
          "has-options": i(e).sinkHasOptions.value,
          "options-schema": i(e).sinkOptionsSchema.value,
          "locked-hint": l.destinationLocked ? "Selected by the owning component." : i(pe),
          "onUpdate:sinkId": s[1] || (s[1] = (a) => {
            i(e).sinkId.value = a, i(e).onSinkChange();
          }),
          "onUpdate:config": s[2] || (s[2] = (a) => {
            i(e).sinkConfig.value = { ...i(e).sinkConfig.value, ...a };
          }),
          onBinding: i(e).onSinkBinding
        }, null, 8, ["items", "sink-id", "editing", "selected-sink", "config-tag", "config-schema", "picker-meta", "config", "source-context", "source-schema", "has-options", "options-schema", "locked-hint", "onBinding"])
      ]),
      i(e).supportsReconcile.value || i(e).managed && i(e).reconcileEnabled.value ? (k(), y("div", on, [
        d("div", sn, [
          d("label", an, [
            ne(d("input", {
              "onUpdate:modelValue": s[3] || (s[3] = (a) => i(e).reconcileEnabled.value = a),
              class: "kx-check",
              type: "checkbox",
              disabled: i(e).managed
            }, null, 8, rn), [
              [Ye, i(e).reconcileEnabled.value]
            ]),
            s[5] || (s[5] = d("span", null, "Reconcile deleted source items", -1))
          ]),
          d("span", ln, H(i(e).managed ? i(pe) : "Periodically compares source keys with this sync’s owned destinations and removes items that disappeared from the source."), 1)
        ])
      ])) : P("", !0)
    ], 64));
  }
});
export {
  mn as _,
  te as e,
  pn as s,
  fn as u
};
//# sourceMappingURL=SyncPipeline.vue_vue_type_script_setup_true_lang-CoUNQyHE.js.map
