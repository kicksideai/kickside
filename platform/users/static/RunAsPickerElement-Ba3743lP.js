import { defineComponent as S, ref as f, useId as R, computed as _, watch as I, nextTick as D, openBlock as d, createElementBlock as v, Fragment as B, createElementVNode as m, unref as h, createVNode as L, toDisplayString as E, withCtx as K, withDirectives as H, vModelText as O, renderList as q, normalizeClass as T, createCommentVNode as A, onBeforeUnmount as z, createBlock as N, mergeProps as F } from "vue";
import { a as j, u as G } from "./wc-runtime-KO3cNuNo.js";
import { api as J } from "@wippy-fe/proxy";
import { Icon as P } from "@iconify/vue";
import { _ as W } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
const X = ["aria-expanded", "aria-controls", "aria-label", "disabled"], Y = { class: "p-select-label" }, Z = {
  key: 0,
  class: "kx-ps-val"
}, Q = { class: "kx-ps-val-label" }, ee = {
  key: 1,
  class: "kx-ps-ph"
}, ae = { class: "p-select-dropdown" }, oe = { class: "p-select-overlay kx-ps-panel" }, te = { class: "p-select-header" }, le = ["aria-label", "aria-controls", "aria-activedescendant"], se = ["id", "aria-label"], ne = {
  class: "p-select-option-group",
  role: "presentation"
}, re = ["id", "aria-selected", "onClick", "onMousemove"], ie = { class: "kx-ps-opt-body" }, ue = { class: "kx-ps-opt-title" }, ce = {
  key: 0,
  class: "kx-ps-opt-sub"
}, de = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, pe = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, ve = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, me = ["disabled"], fe = /* @__PURE__ */ S({
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
  setup(l, { emit: w }) {
    const s = l, k = w, u = f(null), i = f(null), t = f(!1), y = f(""), c = f(0), b = R(), x = _(() => {
      const e = y.value.trim().toLowerCase(), o = /* @__PURE__ */ new Map();
      for (const a of s.items) {
        if (!s.remote && e && ![a.title, a.subtitle, a.id, a.group].some((U) => U?.toLowerCase().includes(e))) continue;
        const n = a.group || "Other", g = o.get(n);
        g ? g.push(a) : o.set(n, [a]);
      }
      let r = 0;
      return [...o.entries()].sort((a, n) => a[0].localeCompare(n[0])).map(([a, n]) => ({ group: a, items: n.map((g) => ({ item: g, index: r++ })) }));
    }), C = _(() => x.value.flatMap((e) => e.items)), V = _(() => s.items.find((e) => e.id === s.modelValue)), $ = _(() => C.value[c.value] ? `${b}-${c.value}` : void 0);
    I(y, () => {
      c.value = 0;
    }), I([t, y], ([e, o]) => {
      e && s.remote && k("search", o);
    }), I(() => s.disabled, (e) => {
      e && (t.value = !1);
    }), I(t, async (e) => {
      if (!e) {
        u.value?.focus();
        return;
      }
      y.value = "", c.value = Math.max(0, C.value.findIndex(({ item: o }) => o.id === s.modelValue)), await D(), i.value?.focus();
    });
    function M(e) {
      s.disabled || s.loading || (k("update:modelValue", e.id), t.value = !1);
    }
    async function p(e) {
      if (e.key === "Escape" && t.value) {
        e.preventDefault(), e.stopPropagation(), t.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(e.key)) return;
      if (e.preventDefault(), !t.value) {
        t.value = !0;
        return;
      }
      if (e.key === "Enter") {
        const a = C.value[c.value];
        a && M(a.item);
        return;
      }
      const o = C.value.length - 1;
      c.value = e.key === "Home" ? 0 : e.key === "End" ? o : Math.max(0, Math.min(o, c.value + (e.key === "ArrowDown" ? 1 : -1))), await D(), u.value?.getRootNode()?.querySelector(`[id="${$.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (e, o) => (d(), v(B, null, [
      m("button", {
        ref_key: "anchor",
        ref: u,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": t.value,
        "aria-controls": h(b),
        "aria-label": l.ariaLabel,
        disabled: l.disabled,
        onClick: o[0] || (o[0] = (r) => t.value = !t.value),
        onKeydown: p
      }, [
        m("span", Y, [
          V.value ? (d(), v("span", Z, [
            L(h(P), {
              icon: V.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            m("span", Q, E(V.value.title), 1)
          ])) : (d(), v("span", ee, E(l.placeholder || "Select…"), 1))
        ]),
        m("span", ae, [
          L(h(P), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, X),
      L(W, {
        open: t.value,
        "onUpdate:open": o[3] || (o[3] = (r) => t.value = r),
        anchor: u.value
      }, {
        default: K(() => [
          m("div", oe, [
            m("div", te, [
              H(m("input", {
                ref_key: "search",
                ref: i,
                "onUpdate:modelValue": o[1] || (o[1] = (r) => y.value = r),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${l.ariaLabel || l.placeholder || "options"}`,
                "aria-controls": h(b),
                "aria-activedescendant": $.value,
                onKeydown: p
              }, null, 40, le), [
                [O, y.value]
              ])
            ]),
            m("ul", {
              id: h(b),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": l.ariaLabel || l.placeholder || "Options"
            }, [
              (d(!0), v(B, null, q(x.value, (r) => (d(), v(B, {
                key: r.group
              }, [
                m("li", ne, E(r.group), 1),
                (d(!0), v(B, null, q(r.items, ({ item: a, index: n }) => (d(), v("li", {
                  id: `${h(b)}-${n}`,
                  key: a.id,
                  class: T(["p-select-option kx-ps-option", { "p-select-option-selected": a.id === l.modelValue, "p-focus": n === c.value }]),
                  role: "option",
                  "aria-selected": a.id === l.modelValue,
                  onClick: (g) => M(a),
                  onMousemove: (g) => c.value = n
                }, [
                  L(h(P), {
                    icon: a.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  m("span", ie, [
                    m("span", ue, E(a.title), 1),
                    a.subtitle ? (d(), v("span", ce, E(a.subtitle), 1)) : A("", !0)
                  ])
                ], 42, re))), 128))
              ], 64))), 128)),
              l.loading ? (d(), v("li", de, "Loading…")) : !C.value.length && !l.error ? (d(), v("li", pe, "No matches")) : A("", !0)
            ], 8, se),
            l.error ? (d(), v("div", ve, E(l.error), 1)) : A("", !0),
            l.more ? (d(), v("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: l.loading || l.disabled,
              onClick: o[2] || (o[2] = (r) => k("more"))
            }, "Load more", 8, me)) : A("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), be = /* @__PURE__ */ S({
  __name: "RunAsPicker",
  props: {
    value: { default: "" },
    componentId: { default: "" },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["change", "load", "error"],
  setup(l, { emit: w }) {
    const s = l, k = w, u = f(null), i = f([]), t = f(""), y = f(""), c = f(!1), b = f("");
    let x = 0;
    const C = _(() => [
      ...u.value ? [{ id: u.value.id, title: "Me", icon: "tabler:user", group: "Accounts" }] : [],
      ...i.value.map((p) => ({ id: p.id, title: p.label, subtitle: "Bot account", icon: "tabler:robot", group: "Accounts" }))
    ]), V = _(() => s.value || u.value?.id || "");
    async function $(p, e = !1) {
      const o = ++x, r = e ? t.value : "";
      y.value = p, c.value = !0, b.value = "", e || (i.value = [], u.value = null, t.value = "");
      try {
        const a = {
          ...s.componentId ? { component_id: s.componentId } : {},
          q: p,
          limit: 100,
          ...r ? { cursor: r } : {}
        }, { data: n } = await J.get("/api/v1/users/run-as-candidates", { params: a });
        if (o !== x) return;
        if (!n.success || !n.me || !Array.isArray(n.candidates)) throw new Error(n.error || "Could not load run-as accounts");
        if (r && n.next_cursor === r) throw new Error("Candidate page repeats its cursor");
        u.value = n.me, i.value = [...new Map([...e ? i.value : [], ...n.candidates].map((g) => [g.id, g])).values()], t.value = n.next_cursor || "", k("load");
      } catch (a) {
        if (o !== x) return;
        u.value = null, i.value = [], t.value = "", b.value = a instanceof Error ? a.message : "Could not load run-as accounts", k("error", { message: b.value, error: a });
      } finally {
        o === x && (c.value = !1);
      }
    }
    function M(p) {
      const e = p === u.value?.id ? u.value : i.value.find((o) => o.id === p);
      !e || s.disabled || c.value || k("change", { principal: { kind: "user", id: e.id }, label: e.label });
    }
    return I(() => s.componentId, () => {
      $("");
    }, { immediate: !0 }), z(() => {
      x += 1;
    }), (p, e) => (d(), N(fe, {
      items: C.value,
      "model-value": V.value,
      placeholder: l.value ? "Selection unavailable" : "Me",
      "aria-label": "Run as",
      disabled: l.disabled,
      remote: "",
      loading: c.value,
      error: b.value,
      more: !!t.value,
      "onUpdate:modelValue": M,
      onSearch: $,
      onMore: e[0] || (e[0] = (o) => $(y.value, !0))
    }, null, 8, ["items", "model-value", "placeholder", "disabled", "loading", "error", "more"]));
  }
}), we = /* @__PURE__ */ S({
  __name: "RunAsPickerElement",
  setup(l) {
    const w = j(), s = G(), k = _(() => ({ value: w.value?.value, componentId: w.value?.root, disabled: w.value?.disabled }));
    return (u, i) => (d(), N(be, F(k.value, {
      onChange: i[0] || (i[0] = (t) => h(s)("config-changed", t)),
      onLoad: i[1] || (i[1] = (t) => h(s)("load", void 0)),
      onError: i[2] || (i[2] = (t) => h(s)("error", t))
    }), null, 16));
  }
});
export {
  we as default
};
//# sourceMappingURL=RunAsPickerElement-Ba3743lP.js.map
