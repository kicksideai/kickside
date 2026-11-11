import { defineComponent as F, ref as _, onMounted as Ve, watch as q, onBeforeUnmount as fe, openBlock as k, createElementBlock as y, createElementVNode as d, nextTick as J, createVNode as A, unref as o, Fragment as V, normalizeClass as me, toDisplayString as H, createCommentVNode as T, createBlock as Fe, resolveDynamicComponent as ze, normalizeStyle as Ke, renderSlot as We, useId as Ue, computed as g, withCtx as Ge, withDirectives as ne, vModelText as ve, renderList as ue, createTextVNode as Je, vModelCheckbox as Ye } from "vue";
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
}, se = /* @__PURE__ */ F({
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
    const e = t, c = l, i = _(null), a = _(!1);
    let s = null, b = 0;
    const f = /* @__PURE__ */ new Set();
    function S(r) {
      r.composedPath()[0] === s && (r.stopPropagation(), c("change", r.detail));
    }
    function O(r) {
      return r.composedPath()[0] !== s ? !1 : (r.stopPropagation(), !0);
    }
    function C(r) {
      O(r) && c("select", r.detail);
    }
    function I(r) {
      O(r) && c("created", r.detail);
    }
    function P(r) {
      O(r) && c("close", r.detail);
    }
    function M(r) {
      O(r) && c("error", r.detail);
    }
    function x(r) {
      if (typeof r == "string") return r;
      try {
        return JSON.stringify(r ?? {});
      } catch {
        return null;
      }
    }
    function u() {
      if (!s) return;
      const r = x(e.config);
      if (r !== null && s.setAttribute("config", r), e.schema !== void 0 && e.schema !== null) {
        const w = x(e.schema);
        w !== null && s.setAttribute("schema", w);
      }
      if (e.meta !== void 0 && e.meta !== null) {
        const w = x(e.meta);
        w !== null && s.setAttribute("meta", w);
      }
      e.provider && s.setAttribute("provider", e.provider), e.label && s.setAttribute("label", e.label);
      const $ = e.attrs || {};
      for (const w of [...f])
        (!(w in $) || $[w] == null) && (s.removeAttribute(w), f.delete(w));
      for (const [w, L] of Object.entries($)) {
        if (L == null) continue;
        const j = typeof L == "object" ? x(L) : String(L);
        j !== null && (s.setAttribute(w, j), f.add(w));
      }
    }
    function v(r = s) {
      r && (r.removeEventListener("config-changed", S), r.removeEventListener("change", S), r.removeEventListener("select", C), r.removeEventListener("created", I), r.removeEventListener("close", P), r.removeEventListener("error", M), r === s && (s = null), f.clear());
    }
    async function E(r) {
      if (!customElements.get(r))
        try {
          await Qe(r, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function m() {
      const r = ++b, $ = i.value, w = e.tag;
      if (a.value = !1, !!$ && (v(), $.innerHTML = "", !!w))
        try {
          if (await E(w), r !== b || i.value !== $ || e.tag !== w) return;
          const L = document.createElement(w);
          L.classList.add("kx-wcmount-surface"), s = L, u(), L.addEventListener("config-changed", S), L.addEventListener("change", S), L.addEventListener("select", C), L.addEventListener("created", I), L.addEventListener("close", P), L.addEventListener("error", M), L.style.display = "block", $.appendChild(L), a.value = !customElements.get(w);
        } catch {
          r === b && (a.value = !0);
        }
    }
    async function h() {
      a.value = !1, await J(), await m();
    }
    return Ve(m), q(() => e.tag, m), q(() => [e.config, e.schema, e.meta, e.provider, e.label, e.attrs], u, { deep: !0 }), fe(() => {
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
        ref: i
      }, null, 512))
    ]));
  }
}), et = { class: "kx-stage" }, tt = { class: "kx-stage-head" }, nt = { class: "kx-stage-ico" }, st = {
  class: "kx-stage-cfg",
  "data-test": "pl-trigger"
}, ot = "kickside-trigger-config", it = /* @__PURE__ */ F({
  __name: "SyncCreateSource",
  props: {
    icon: {},
    seed: {},
    editing: { type: Boolean }
  },
  emits: ["change"],
  setup(t, { emit: l }) {
    const e = t, c = l;
    function i(a) {
      c("change", a);
    }
    return (a, s) => (k(), y("div", et, [
      d("div", tt, [
        d("span", nt, [
          A(o(N), {
            icon: e.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        s[0] || (s[0] = d("span", { class: "kx-stage-lbl" }, "Source", -1))
      ]),
      d("div", st, [
        A(se, {
          tag: ot,
          attrs: { allowed: "source", reconfigure: e.editing ? "true" : null, value: e.seed },
          onChange: i
        }, null, 8, ["attrs"])
      ])
    ]));
  }
}), at = { class: "kx-stage kx-stage-mid" }, rt = { class: "kx-stage-head" }, lt = { class: "kx-stage-ico" }, ct = {
  key: 0,
  class: "kx-stage-desc",
  "data-test": "pl-transform-hint"
}, ut = {
  key: 1,
  class: "kx-stage-desc",
  role: "alert"
}, dt = "kickside-transform-assist", pt = /* @__PURE__ */ F({
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
    function i(a) {
      c("transform-confirmed", a);
    }
    return (a, s) => (k(), y("div", at, [
      d("div", rt, [
        d("span", lt, [
          A(o(N), {
            icon: "tabler:transform",
            "aria-hidden": "true"
          })
        ]),
        s[0] || (s[0] = d("span", { class: "kx-stage-lbl" }, "Transform", -1))
      ]),
      e.canAssist ? (k(), y(V, { key: 1 }, [
        e.detected && (!e.transform || e.transform.kind === "none") ? (k(), y("div", {
          key: 0,
          class: me(["kx-detect", e.detected.needed && "kx-detect-warn"])
        }, [
          A(o(N), {
            icon: e.detected.needed ? "tabler:alert-triangle" : "tabler:circle-check",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          d("span", null, H(e.detected.reason), 1)
        ], 2)) : T("", !0),
        e.sampleError ? (k(), y("p", ut, H(e.sampleError), 1)) : T("", !0),
        (k(), Fe(ze(dt), {
          "data-test": "pl-transform",
          samples: e.samples,
          "source-schema": e.sourceSchema,
          "sink-schema": e.sinkSchema,
          "input-shape": e.inputShape,
          hint: e.hint,
          value: e.value,
          "generation-policy": e.generationPolicy,
          onTransformConfirmed: i
        }, null, 40, ["samples", "source-schema", "sink-schema", "input-shape", "hint", "value", "generation-policy"]))
      ], 64)) : (k(), y("p", ct, "Pick a source and destination to define the transform."))
    ]));
  }
}), ft = 2e3;
function de(t) {
  const l = t.margin ?? 8, e = t.gap ?? 4, c = Math.max(0, t.viewportWidth), i = Math.max(0, t.viewportHeight), a = Math.max(0, c - l * 2), s = Math.min(Math.max(0, t.requestedWidth), a), b = t.align === "right" ? t.anchor.right - s : t.anchor.left, f = Math.max(l, Math.min(b, c - l - s)), S = Math.max(0, i - t.anchor.bottom - e - l), O = Math.max(0, t.anchor.top - e - l), C = S < t.requestedMaxHeight && O > S ? "above" : "below", I = C === "above" ? O : S, P = Math.round(Math.min(Math.max(0, t.requestedMaxHeight), I)), M = Math.min(Math.max(0, t.panelHeight ?? P), P), x = C === "above" ? t.anchor.top - e - M : t.anchor.bottom + e, u = t.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(f - u.left),
    width: Math.round(s),
    maxHeight: P,
    side: C,
    top: Math.round(x - u.top)
  };
}
const mt = /* @__PURE__ */ F({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: ft }
  },
  emits: ["update:open"],
  setup(t, { emit: l }) {
    const e = t, c = l, i = _(null), a = _({ position: "fixed", visibility: "hidden" });
    function s() {
      const x = e.anchor, u = i.value;
      if (!x || !u) return;
      const v = x.getBoundingClientRect(), E = e.width === "anchor" ? Math.max(e.minWidth, v.width) : Math.max(e.minWidth, e.width), m = {
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
        f = !1, e.open && s();
      }));
    }
    function O() {
      typeof ResizeObserver > "u" || (b = new ResizeObserver(S), i.value && b.observe(i.value), e.anchor && b.observe(e.anchor));
    }
    function C() {
      b?.disconnect(), b = null, f = !1;
    }
    q(() => e.open, async (x) => {
      C(), x && (a.value = { position: "fixed", visibility: "hidden" }, await J(), s(), O());
    }, { immediate: !0 });
    function I(x) {
      if (!e.open) return;
      const u = x.composedPath();
      i.value && u.includes(i.value) || e.anchor && u.includes(e.anchor) || c("update:open", !1);
    }
    function P(x) {
      !e.open || x.key !== "Escape" || (x.preventDefault(), x.stopImmediatePropagation(), c("update:open", !1));
    }
    function M() {
      e.open && s();
    }
    return document.addEventListener("click", I), document.addEventListener("keydown", P, !0), window.addEventListener("resize", M), window.addEventListener("scroll", M, !0), fe(() => {
      C(), document.removeEventListener("click", I), document.removeEventListener("keydown", P, !0), window.removeEventListener("resize", M), window.removeEventListener("scroll", M, !0);
    }), (x, u) => t.open ? (k(), y("div", {
      key: 0,
      ref_key: "panel",
      ref: i,
      class: "anchored-panel",
      style: Ke(a.value)
    }, [
      We(x.$slots, "default")
    ], 4)) : T("", !0);
  }
}), vt = ["aria-expanded", "aria-controls", "aria-label", "disabled"], ht = { class: "p-select-label" }, gt = {
  key: 0,
  class: "kx-ps-val"
}, kt = { class: "kx-ps-val-label" }, yt = {
  key: 1,
  class: "kx-ps-ph"
}, bt = { class: "p-select-dropdown" }, xt = { class: "p-select-overlay kx-ps-panel" }, _t = { class: "p-select-header" }, St = ["aria-label", "aria-controls", "aria-activedescendant"], wt = ["id", "aria-label"], Ct = {
  class: "p-select-option-group",
  role: "presentation"
}, Et = ["id", "aria-selected", "onClick", "onMousemove"], $t = { class: "kx-ps-opt-body" }, Mt = { class: "kx-ps-opt-title" }, Lt = {
  key: 0,
  class: "kx-ps-opt-sub"
}, Ot = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, At = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, It = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, Pt = ["disabled"], Tt = /* @__PURE__ */ F({
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
    const e = t, c = l, i = _(null), a = _(null), s = _(!1), b = _(""), f = _(0), S = Ue(), O = g(() => {
      const u = b.value.trim().toLowerCase(), v = /* @__PURE__ */ new Map();
      for (const m of e.items) {
        if (!e.remote && u && ![m.title, m.subtitle, m.id, m.group].some(($) => $?.toLowerCase().includes(u))) continue;
        const h = m.group || "Other", r = v.get(h);
        r ? r.push(m) : v.set(h, [m]);
      }
      let E = 0;
      return [...v.entries()].sort((m, h) => m[0].localeCompare(h[0])).map(([m, h]) => ({ group: m, items: h.map((r) => ({ item: r, index: E++ })) }));
    }), C = g(() => O.value.flatMap((u) => u.items)), I = g(() => e.items.find((u) => u.id === e.modelValue)), P = g(() => C.value[f.value] ? `${S}-${f.value}` : void 0);
    q(b, () => {
      f.value = 0;
    }), q([s, b], ([u, v]) => {
      u && e.remote && c("search", v);
    }), q(() => e.disabled, (u) => {
      u && (s.value = !1);
    }), q(s, async (u) => {
      if (!u) {
        i.value?.focus();
        return;
      }
      b.value = "", f.value = Math.max(0, C.value.findIndex(({ item: v }) => v.id === e.modelValue)), await J(), a.value?.focus();
    });
    function M(u) {
      e.disabled || e.loading || (c("update:modelValue", u.id), s.value = !1);
    }
    async function x(u) {
      if (u.key === "Escape" && s.value) {
        u.preventDefault(), u.stopPropagation(), s.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(u.key)) return;
      if (u.preventDefault(), !s.value) {
        s.value = !0;
        return;
      }
      if (u.key === "Enter") {
        const m = C.value[f.value];
        m && M(m.item);
        return;
      }
      const v = C.value.length - 1;
      f.value = u.key === "Home" ? 0 : u.key === "End" ? v : Math.max(0, Math.min(v, f.value + (u.key === "ArrowDown" ? 1 : -1))), await J(), i.value?.getRootNode()?.querySelector(`[id="${P.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (u, v) => (k(), y(V, null, [
      d("button", {
        ref_key: "anchor",
        ref: i,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": s.value,
        "aria-controls": o(S),
        "aria-label": t.ariaLabel,
        disabled: t.disabled,
        onClick: v[0] || (v[0] = (E) => s.value = !s.value),
        onKeydown: x
      }, [
        d("span", ht, [
          I.value ? (k(), y("span", gt, [
            A(o(N), {
              icon: I.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            d("span", kt, H(I.value.title), 1)
          ])) : (k(), y("span", yt, H(t.placeholder || "Select…"), 1))
        ]),
        d("span", bt, [
          A(o(N), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, vt),
      A(mt, {
        open: s.value,
        "onUpdate:open": v[3] || (v[3] = (E) => s.value = E),
        anchor: i.value
      }, {
        default: Ge(() => [
          d("div", xt, [
            d("div", _t, [
              ne(d("input", {
                ref_key: "search",
                ref: a,
                "onUpdate:modelValue": v[1] || (v[1] = (E) => b.value = E),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${t.ariaLabel || t.placeholder || "options"}`,
                "aria-controls": o(S),
                "aria-activedescendant": P.value,
                onKeydown: x
              }, null, 40, St), [
                [ve, b.value]
              ])
            ]),
            d("ul", {
              id: o(S),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": t.ariaLabel || t.placeholder || "Options"
            }, [
              (k(!0), y(V, null, ue(O.value, (E) => (k(), y(V, {
                key: E.group
              }, [
                d("li", Ct, H(E.group), 1),
                (k(!0), y(V, null, ue(E.items, ({ item: m, index: h }) => (k(), y("li", {
                  id: `${o(S)}-${h}`,
                  key: m.id,
                  class: me(["p-select-option kx-ps-option", { "p-select-option-selected": m.id === t.modelValue, "p-focus": h === f.value }]),
                  role: "option",
                  "aria-selected": m.id === t.modelValue,
                  onClick: (r) => M(m),
                  onMousemove: (r) => f.value = h
                }, [
                  A(o(N), {
                    icon: m.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  d("span", $t, [
                    d("span", Mt, H(m.title), 1),
                    m.subtitle ? (k(), y("span", Lt, H(m.subtitle), 1)) : T("", !0)
                  ])
                ], 42, Et))), 128))
              ], 64))), 128)),
              t.loading ? (k(), y("li", Ot, "Loading…")) : !C.value.length && !t.error ? (k(), y("li", At, "No matches")) : T("", !0)
            ], 8, wt),
            t.error ? (k(), y("div", It, H(t.error), 1)) : T("", !0),
            t.more ? (k(), y("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: t.loading || t.disabled,
              onClick: v[2] || (v[2] = (E) => c("more"))
            }, "Load more", 8, Pt)) : T("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), Ht = { class: "kx-stage" }, Bt = { class: "kx-stage-head" }, Rt = { class: "kx-stage-ico" }, Nt = {
  key: 0,
  class: "kx-stage-desc"
}, qt = {
  key: 0,
  class: "kx-stage-desc"
}, jt = { class: "kx-stage-cfg" }, Dt = {
  key: 0,
  class: "kx-stage-opts"
}, Vt = /* @__PURE__ */ F({
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
    function i(a) {
      a && typeof a == "object" && c("update:config", a);
    }
    return (a, s) => (k(), y("div", Ht, [
      d("div", Bt, [
        d("span", Rt, [
          A(o(N), {
            icon: e.selectedSink?.icon || "tabler:database",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        s[2] || (s[2] = d("span", { class: "kx-stage-lbl" }, "Destination", -1))
      ]),
      A(Tt, {
        items: e.items,
        "model-value": e.sinkId,
        disabled: e.editing,
        placeholder: "Pick a destination…",
        "onUpdate:modelValue": s[0] || (s[0] = (b) => c("update:sinkId", b))
      }, null, 8, ["items", "model-value", "disabled"]),
      e.editing ? (k(), y("p", Nt, H(e.lockedHint), 1)) : T("", !0),
      e.selectedSink && !e.editing ? (k(), y(V, { key: 1 }, [
        e.selectedSink.description ? (k(), y("p", qt, H(e.selectedSink.description), 1)) : T("", !0),
        d("div", jt, [
          A(se, {
            tag: e.configTag,
            schema: e.configSchema,
            config: e.config,
            meta: e.pickerMeta,
            provider: e.selectedSink.provider,
            attrs: { "source-context": e.sourceContext, "source-schema": e.sourceSchema, "return-route": "/automations" },
            onChange: i,
            onSelect: s[1] || (s[1] = (b) => c("binding", b))
          }, null, 8, ["tag", "schema", "config", "meta", "provider", "attrs"]),
          e.hasOptions ? (k(), y("div", Dt, [
            s[3] || (s[3] = d("span", { class: "kx-opts-lbl" }, "Options", -1)),
            A(se, {
              tag: "wc-schema-form",
              schema: e.optionsSchema,
              config: e.config,
              onChange: i
            }, null, 8, ["schema", "config"])
          ])) : T("", !0)
        ])
      ], 64)) : T("", !0)
    ]));
  }
});
function Ft(t) {
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
    Ft(C) && c.push([O, C]);
  if (c.length === 0) return null;
  c.length > 1 && console.error(`${l}: port schema declares multiple picker fields`, c.map(([O]) => O));
  const [i, a] = c[0], s = typeof a.class == "string" ? a.class : "", b = typeof a.title == "string" ? a.title : "", f = typeof a.detail == "string" ? a.detail : "", S = typeof a.delete_endpoint == "string" ? a.delete_endpoint : "";
  return { key: i, tag: a.picker ?? "", threadClass: s, title: b, schema: { properties: { [i]: a } }, detail: f, deleteEndpoint: S };
}
function zt(t, l = "ports") {
  const e = he(t);
  if (!e) return null;
  const c = ge(t, l)?.key, i = {};
  for (const [a, s] of Object.entries(e))
    a !== c && (i[a] = s);
  return Object.keys(i).length ? { type: "object", properties: i } : null;
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
function Kt(t) {
  const l = G(t);
  return !!(l && l.properties && Object.keys(l.properties).length);
}
const Wt = "_portable_input";
function U(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : null;
}
function Ut(t) {
  const l = U(t);
  return l && typeof l.kind == "string" ? l : null;
}
function Gt(t) {
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
function un(t) {
  const l = U(t), e = U(l?.[Wt]), c = U(e?.trigger), i = typeof e?.sink_port == "string" ? e.sink_port : "", a = Ut(e?.transform), s = l?.enabled;
  return !e || !c || !i || !a || typeof s != "boolean" ? null : ke({
    title: typeof e.title == "string" ? e.title : "",
    trigger: c,
    sinkPort: i,
    sinkConfig: U(e.sink_config) ?? {},
    transform: a,
    outputSchema: e.output_schema,
    reconcile: Gt(e.reconcile),
    enabled: s
  });
}
const Jt = "wc-component-picker", Yt = "wc-schema-form", pe = "Locked after install — reinstall the data sync to change it.";
function dn(t) {
  const l = t.managed, e = _(""), c = _(""), i = _({}), a = _(), s = _(!1), b = _(!0), f = _({ v: 2 }), S = _(!1), O = g(() => S.value && f.value.source ? {
    source: f.value.source,
    config: f.value.config || {},
    ...f.value.filter ? { filter: f.value.filter } : {}
  } : void 0), C = _(""), I = _(void 0), P = _(""), M = _(null), x = _([]), u = _([]), v = g(() => {
    const n = f.value.source;
    return typeof n == "string" ? n : "";
  }), E = g(() => x.value.filter((n) => n.id === v.value)), m = g(() => E.value[0] || null), h = g(() => u.value.find((n) => n.id === c.value) || null);
  function r() {
    l || (s.value = !1);
  }
  function $() {
    i.value = {}, a.value = void 0, s.value = !1;
  }
  function w(n) {
    const p = n ?? {};
    if (!p.spec || typeof p.spec != "object" || Array.isArray(p.spec)) return;
    const z = v.value;
    f.value = { ...p.spec }, S.value = p.valid === !0, C.value = typeof p.error == "string" ? p.error : "", p.output_schema !== void 0 && (I.value = p.output_schema), v.value !== z && r();
  }
  const L = _([]), j = _(void 0), Y = _(""), ye = g(() => S.value && v.value ? JSON.stringify({ source: v.value, config: f.value.config ?? {}, limit: 1 }) : "");
  q(ye, async (n, p, z) => {
    let K = !0;
    if (z(() => {
      K = !1;
    }), L.value = [], j.value = void 0, Y.value = "", !!n)
      try {
        const { data: B } = await ee.post(
          "/api/v1/automations/source-samples",
          JSON.parse(n)
        );
        if (!K) return;
        if (B.success !== !0 || !Array.isArray(B.samples)) throw new Error(te(B.error, "Could not read source samples."));
        L.value = B.samples, j.value = B.output_schema;
      } catch (B) {
        K && (Y.value = te(B, "Could not read source samples."));
      }
  });
  const be = g(() => JSON.stringify(L.value.map((n) => ({ payload: n })))), xe = g(() => {
    for (const n of E.value) {
      const p = n.reconcile;
      if (p && typeof p.pull_keys == "string" && p.pull_keys) return p;
    }
    return null;
  }), oe = g(() => !xe.value || !h.value || !E.value.some((p) => p.surface === "collection") ? !1 : !!(h.value.operations || {}).delete), _e = g(() => u.value.map((n) => ({
    id: n.id,
    title: n.title || n.name || n.id,
    icon: n.icon || "tabler:database",
    group: n.group || "Destinations",
    subtitle: n.description
  }))), D = g(() => ge(h.value, "SyncForm")), Se = g(() => {
    if (D.value?.tag !== Jt) return;
    const n = String(h.value?.class || "");
    if (n)
      return { type: "thread", thread_class: n, title: D.value?.title ?? "", component: h.value?.component, delete_endpoint: D.value?.deleteEndpoint || "" };
  }), we = g(() => D.value?.tag || Yt), Q = g(() => zt(h.value, "SyncForm")), Ce = g(() => D.value?.schema ?? Q.value), Ee = g(() => !!D.value && Kt(Q.value)), $e = g(() => {
    if (!h.value) return !1;
    const n = D.value;
    if (n && h.value.config_schema?.[n.key]?.required) {
      const p = i.value[n.key];
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
    const p = new Set(Object.keys(ie.value?.properties || {})), z = /* @__PURE__ */ new Set(), K = /* @__PURE__ */ new Map(), B = h.value?.config_schema || {};
    for (const [R, De] of Object.entries(B)) {
      const W = De || {};
      if (typeof W.supplies != "string") continue;
      K.set(W.supplies, typeof W.title == "string" && W.title ? W.title : R);
      const Z = i.value[R];
      Z != null && Z !== "" && z.add(W.supplies);
    }
    const X = (n.required || []).filter((R) => !p.has(R) && !z.has(R));
    if (X.length === 0) return { needed: !1, reason: "Fields line up — pass through works." };
    const ce = l ? [] : X.map((R) => K.get(R)).filter((R) => !!R), je = ce.length ? `, or fill ${ce.join(", ")} below` : "";
    return { needed: !0, reason: `Destination needs ${X.join(", ")}, not in the source — map it with an Expression or LLM${je}.` };
  }), re = g(() => !!v.value && !!h.value), Le = g(() => JSON.stringify(ie.value ?? {})), Oe = g(() => JSON.stringify(ae.value ?? {})), Ae = g(() => h.value?.input_shape ?? ""), Ie = g(() => {
    if (!re.value) return "";
    const n = m.value?.title || m.value?.name || "source", p = h.value?.title || h.value?.name || "destination";
    return `Map ${n} items into ${p} input.`;
  }), Pe = g(() => M.value ? JSON.stringify(M.value) : "");
  function Te(n) {
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
      return x.value = n.data?.sources || [], u.value = p.data?.sinks || [], !l && u.value.length === 1 && (c.value = u.value[0].id), "";
    } catch (n) {
      return te(n, "failed to load catalog");
    }
  }
  function Ne(n) {
    e.value = n.title, P.value = n.trigger, f.value = n.trigger, I.value = n.output_schema, M.value = n.transform, c.value = n.sink_port, i.value = n.sink_config, s.value = n.reconcile != null, b.value = n.enabled;
  }
  function qe() {
    return ke({
      // The trigger spec rides verbatim as input.trigger: the trigger service
      // validates and normalizes it server-side.
      title: e.value,
      trigger: f.value,
      sinkPort: c.value,
      sinkConfig: i.value,
      transform: M.value,
      outputSchema: I.value,
      reconcile: (l || oe.value) && s.value ? !0 : void 0,
      enabled: b.value
    });
  }
  return {
    managed: l,
    sourceContext: O,
    title: e,
    sinkId: c,
    sinkConfig: i,
    reconcileEnabled: s,
    triggerSeed: P,
    transform: M,
    sources: x,
    sinks: u,
    selectedSource: m,
    selectedSink: h,
    supportsReconcile: oe,
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
    assistValue: Pe,
    validationError: Be,
    assistSamples: be,
    sampleError: Y,
    onTriggerChange: w,
    onAssistConfirmed: Te,
    onSinkChange: $,
    onSinkBinding: He,
    loadCatalog: Re,
    seed: Ne,
    currentInput: qe
  };
}
const Qt = { class: "kx-field" }, Xt = { class: "kx-pipe" }, Zt = { class: "kx-pipe-conn" }, en = { class: "kx-pipe-conn" }, tn = {
  key: 0,
  class: "kx-runopts"
}, nn = { class: "kx-field" }, sn = { class: "kx-reconcile-check" }, on = ["disabled"], an = { class: "kx-field-hint" }, pn = /* @__PURE__ */ F({
  __name: "SyncPipeline",
  props: {
    form: {},
    destinationLocked: { type: Boolean },
    generationPolicy: {}
  },
  setup(t) {
    const l = t, e = l.form;
    return (c, i) => (k(), y(V, null, [
      d("label", Qt, [
        i[4] || (i[4] = d("span", { class: "kx-field-lbl" }, [
          Je("Name "),
          d("span", {
            class: "kx-req",
            "aria-hidden": "true"
          }, "*")
        ], -1)),
        ne(d("input", {
          "onUpdate:modelValue": i[0] || (i[0] = (a) => o(e).title.value = a),
          "data-test": "pl-title",
          class: "kx-input",
          type: "text",
          placeholder: "Fireflies to Knowledge Base"
        }, null, 512), [
          [ve, o(e).title.value]
        ])
      ]),
      d("div", Xt, [
        A(it, {
          icon: o(e).selectedSource.value?.icon || "tabler:plug",
          seed: o(e).triggerSeed.value,
          editing: o(e).managed,
          onChange: o(e).onTriggerChange
        }, null, 8, ["icon", "seed", "editing", "onChange"]),
        d("div", Zt, [
          A(o(N), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        A(pt, {
          "can-assist": o(e).canAssist.value,
          detected: o(e).transformDetected.value,
          transform: o(e).transform.value,
          samples: o(e).assistSamples.value,
          "sample-error": o(e).sampleError.value,
          "source-schema": o(e).assistSourceSchema.value,
          "sink-schema": o(e).assistSinkSchema.value,
          "input-shape": o(e).assistInputShape.value,
          hint: o(e).assistHint.value,
          value: o(e).assistValue.value,
          "generation-policy": l.generationPolicy,
          onTransformConfirmed: o(e).onAssistConfirmed
        }, null, 8, ["can-assist", "detected", "transform", "samples", "sample-error", "source-schema", "sink-schema", "input-shape", "hint", "value", "generation-policy", "onTransformConfirmed"]),
        d("div", en, [
          A(o(N), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        A(Vt, {
          items: o(e).sinkItems.value,
          "sink-id": o(e).sinkId.value,
          editing: o(e).managed || !!l.destinationLocked,
          "selected-sink": o(e).selectedSink.value,
          "config-tag": o(e).sinkConfigTag.value,
          "config-schema": o(e).sinkConfigSchema.value,
          "picker-meta": o(e).sinkPickerMeta.value,
          config: o(e).sinkConfig.value,
          "source-context": o(e).sourceContext.value,
          "source-schema": o(e).assistSourceSchema.value,
          "has-options": o(e).sinkHasOptions.value,
          "options-schema": o(e).sinkOptionsSchema.value,
          "locked-hint": l.destinationLocked ? "Selected by the owning component." : o(pe),
          "onUpdate:sinkId": i[1] || (i[1] = (a) => {
            o(e).sinkId.value = a, o(e).onSinkChange();
          }),
          "onUpdate:config": i[2] || (i[2] = (a) => {
            o(e).sinkConfig.value = { ...o(e).sinkConfig.value, ...a };
          }),
          onBinding: o(e).onSinkBinding
        }, null, 8, ["items", "sink-id", "editing", "selected-sink", "config-tag", "config-schema", "picker-meta", "config", "source-context", "source-schema", "has-options", "options-schema", "locked-hint", "onBinding"])
      ]),
      o(e).supportsReconcile.value || o(e).managed && o(e).reconcileEnabled.value ? (k(), y("div", tn, [
        d("div", nn, [
          d("label", sn, [
            ne(d("input", {
              "onUpdate:modelValue": i[3] || (i[3] = (a) => o(e).reconcileEnabled.value = a),
              class: "kx-check",
              type: "checkbox",
              disabled: o(e).managed
            }, null, 8, on), [
              [Ye, o(e).reconcileEnabled.value]
            ]),
            i[5] || (i[5] = d("span", null, "Reconcile deleted source items", -1))
          ]),
          d("span", an, H(o(e).managed ? o(pe) : "Periodically compares source keys with this sync’s owned destinations and removes items that disappeared from the source."), 1)
        ])
      ])) : T("", !0)
    ], 64));
  }
});
export {
  pn as _,
  te as e,
  un as s,
  dn as u
};
//# sourceMappingURL=SyncPipeline.vue_vue_type_script_setup_true_lang-wUVvfzFm.js.map
