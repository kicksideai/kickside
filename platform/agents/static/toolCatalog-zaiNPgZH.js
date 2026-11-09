import { defineComponent as J, computed as M, ref as b, useId as W, watch as X, openBlock as i, createElementBlock as o, createElementVNode as s, toDisplayString as r, withDirectives as Y, vModelText as Z, createVNode as w, withCtx as ee, Fragment as T, renderList as $, normalizeClass as C, unref as d, withModifiers as V, createCommentVNode as k, renderSlot as te, nextTick as P } from "vue";
import { Icon as S } from "@iconify/vue";
import { u as ae, r as ie, _ as oe, t as U, b as K } from "./trait-presentation-SeG51N48.js";
import { api as se } from "@wippy-fe/proxy";
const le = { class: "kx-group kx-capability-picker" }, ne = { class: "kx-group-head" }, re = { class: "kx-group-title" }, de = { class: "kx-group-meta" }, ce = ["aria-expanded", "aria-activedescendant"], ue = ["id", "onMouseenter", "onClick"], pe = { class: "kx-tadd-opt" }, ke = { class: "kx-tadd-opt-text" }, ve = { class: "kx-trait-name" }, he = { class: "kx-trait-badges" }, fe = ["aria-expanded", "aria-label", "onClick"], _e = {
  key: 0,
  class: "kx-trait-cfg"
}, xe = {
  key: 0,
  class: "kx-trait-description"
}, ge = {
  key: 1,
  class: "kx-trait-description"
}, ye = {
  key: 2,
  class: "kx-trait-tools",
  "aria-label": "Declared tools"
}, be = ["data-declared-tool-id"], me = { class: "kx-trait-description" }, we = {
  key: 0,
  class: "kx-tadd-empty"
}, Te = {
  key: 0,
  class: "kx-traits"
}, $e = ["data-trait-id"], Ce = { class: "kx-trait-row" }, Se = { class: "kx-trait-text" }, Ae = { class: "kx-trait-name" }, Ie = { class: "kx-trait-badges" }, De = { class: "kx-trait-actions" }, Ee = ["aria-expanded", "title", "aria-label", "onClick"], Me = ["aria-label", "onClick"], Le = {
  key: 0,
  class: "kx-trait-cfg"
}, Ne = {
  key: 0,
  class: "kx-trait-description"
}, Re = {
  key: 1,
  class: "kx-trait-description"
}, He = {
  key: 2,
  class: "kx-trait-tools",
  "aria-label": "Declared tools"
}, Oe = ["data-declared-tool-id"], ze = { class: "kx-trait-description" }, Ve = {
  key: 1,
  class: "kx-sec-foot"
}, qe = /* @__PURE__ */ J({
  __name: "CapabilityPicker",
  props: {
    traits: {},
    tools: {},
    selected: {},
    label: { default: "Capabilities" },
    emptyMessage: { default: "No capabilities yet. Add one above to give this agent what it can do." }
  },
  emits: ["change"],
  setup(m, { emit: A }) {
    const u = m, _ = A, { collapsedTraits: I, isTraitCollapsed: x, toggleTraitCollapsed: h } = ae(), v = M(() => u.traits.filter((t) => u.selected.includes(t.id))), g = M(() => new Map(u.traits.map((t) => [t.id, ie(t, u.tools)]))), f = b(null);
    function Q(t) {
      f.value = f.value === t ? null : t;
    }
    const D = b(""), c = b(!1), H = b(null), O = b(null), L = b([]), p = b(-1), E = `capabilities-${W()}`, y = M(() => {
      const t = D.value.trim().toLowerCase();
      return u.traits.filter((a) => !u.selected.includes(a.id)).filter((a) => !t || (a.title || a.id).toLowerCase().includes(t) || (a.description || "").toLowerCase().includes(t));
    }), q = M(() => p.value >= 0 ? `${E}-option-${p.value}` : void 0);
    X([c, y], ([t, a]) => {
      L.value = [], p.value = t && a.length ? 0 : -1;
    });
    function B(t, a) {
      t instanceof HTMLElement && (L.value[a] = t);
    }
    function N(t, a = !1) {
      p.value = t, !(!a || t < 0) && P(() => L.value[t]?.scrollIntoView?.({ block: "nearest" }));
    }
    function F() {
      c.value = !0, N(y.value.length ? 0 : -1, !0);
    }
    function j(t) {
      const a = y.value.length;
      if (t.key === "ArrowRight" || t.key === "ArrowLeft") {
        const e = y.value[p.value];
        c.value && e && (t.preventDefault(), f.value = t.key === "ArrowRight" ? e.id : null);
        return;
      }
      if (t.key === "Escape") {
        c.value = !1;
        return;
      }
      if (t.key === "Tab") {
        c.value = !1;
        return;
      }
      if (t.key === "ArrowDown" || t.key === "ArrowUp") {
        if (t.preventDefault(), c.value = !0, !a) return;
        const e = t.key === "ArrowDown" ? 1 : -1, l = p.value < 0 ? e > 0 ? -1 : 0 : p.value;
        N((l + e + a) % a, !0);
        return;
      }
      if (t.key === "Home" || t.key === "End") {
        if (!c.value || !a) return;
        t.preventDefault(), N(t.key === "Home" ? 0 : a - 1, !0);
        return;
      }
      if (t.key === "Enter" && c.value && p.value >= 0) {
        t.preventDefault();
        const e = y.value[p.value];
        e && z(e.id);
      }
    }
    function z(t) {
      u.selected.includes(t) || _("change", [...u.selected, t]), f.value = null, D.value = "", c.value = !1, p.value = -1, P(() => O.value?.focus({ preventScroll: !0 }));
    }
    function G(t) {
      _("change", u.selected.filter((a) => a !== t)), I.value.has(t) && h(t);
    }
    return (t, a) => (i(), o("div", le, [
      s("div", ne, [
        s("span", re, r(m.label), 1),
        s("span", de, r(v.value.length) + " active", 1)
      ]),
      s("div", {
        ref_key: "traitAddRoot",
        ref: H,
        class: "kx-tadd"
      }, [
        Y(s("input", {
          ref_key: "traitSearchInput",
          ref: O,
          "onUpdate:modelValue": a[0] || (a[0] = (e) => D.value = e),
          class: "kx-input kx-tadd-input",
          type: "text",
          role: "combobox",
          "aria-label": "Search capabilities to add",
          "aria-autocomplete": "list",
          "aria-expanded": c.value,
          "aria-controls": E,
          "aria-activedescendant": c.value ? q.value : void 0,
          placeholder: "Search capabilities to add…",
          onFocus: a[1] || (a[1] = (e) => c.value = !0),
          onInput: F,
          onKeydown: j
        }, null, 40, ce), [
          [Z, D.value]
        ]),
        w(oe, {
          open: c.value,
          "onUpdate:open": a[3] || (a[3] = (e) => c.value = e),
          anchor: H.value
        }, {
          default: ee(() => [
            s("div", {
              id: E,
              class: "kx-tadd-menu",
              role: "listbox",
              "aria-label": "Available capabilities"
            }, [
              (i(!0), o(T, null, $(y.value, (e, l) => (i(), o("div", {
                key: e.id,
                id: `${E}-option-${l}`,
                ref_for: !0,
                ref: (n) => B(n, l),
                class: C(["kx-tadd-option", l === p.value && "kx-tadd-opt-active"]),
                tabindex: "-1",
                role: "option",
                "aria-selected": !1,
                onMouseenter: (n) => p.value = l,
                onClick: (n) => z(e.id)
              }, [
                s("div", pe, [
                  s("span", {
                    class: C(["kx-trait-ico", `kx-tint-${d(U)(e)}`])
                  }, [
                    w(d(S), {
                      icon: e.icon || "tabler:puzzle",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ], 2),
                  s("span", ke, [
                    s("span", ve, r(e.title || e.id), 1)
                  ]),
                  s("span", he, [
                    (i(!0), o(T, null, $(d(K)(e), (n) => (i(), o("span", {
                      key: n.key,
                      class: C(["kx-badge kx-tag-caps", `kx-badge-${n.key}`])
                    }, r(n.label), 3))), 128))
                  ]),
                  e.description || e.prompt || e.tools?.length ? (i(), o("button", {
                    key: 0,
                    type: "button",
                    class: "kx-trait-fold",
                    "aria-expanded": f.value === e.id,
                    "aria-label": `${f.value === e.id ? "Hide" : "Show"} ${e.title || e.id} details`,
                    onClick: V((n) => Q(e.id), ["stop"]),
                    onKeydown: a[2] || (a[2] = V(() => {
                    }, ["stop"]))
                  }, [
                    w(d(S), {
                      icon: f.value === e.id ? "tabler:chevron-down" : "tabler:chevron-right",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ], 40, fe)) : k("", !0)
                ]),
                f.value === e.id ? (i(), o("div", _e, [
                  e.description ? (i(), o("p", xe, r(e.description), 1)) : k("", !0),
                  e.prompt ? (i(), o("p", ge, r(e.prompt), 1)) : k("", !0),
                  e.tools?.length ? (i(), o("ul", ye, [
                    (i(!0), o(T, null, $(g.value.get(e.id), ({ id: n, tool: R }) => (i(), o("li", {
                      key: n,
                      "data-declared-tool-id": n
                    }, [
                      s("strong", null, r(R?.title || n), 1),
                      s("p", me, r(R?.llm_description || (R ? "No description declared." : "This tool is not in the available catalog.")), 1)
                    ], 8, be))), 128))
                  ])) : k("", !0)
                ])) : k("", !0)
              ], 42, ue))), 128)),
              y.value.length ? k("", !0) : (i(), o("div", we, "No matching capabilities."))
            ])
          ]),
          _: 1
        }, 8, ["open", "anchor"])
      ], 512),
      v.value.length ? (i(), o("ul", Te, [
        (i(!0), o(T, null, $(v.value, (e) => (i(), o("li", {
          key: e.id,
          "data-trait-id": e.id,
          class: "kx-trait"
        }, [
          s("div", Ce, [
            s("span", {
              class: C(["kx-trait-ico", `kx-tint-${d(U)(e)}`])
            }, [
              w(d(S), {
                icon: e.icon || "tabler:puzzle",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 2),
            s("span", Se, [
              s("span", Ae, r(e.title || e.id), 1)
            ]),
            s("span", Ie, [
              (i(!0), o(T, null, $(d(K)(e), (l) => (i(), o("span", {
                key: l.key,
                class: C(["kx-badge kx-tag-caps", `kx-badge-${l.key}`])
              }, r(l.label), 3))), 128))
            ]),
            s("span", De, [
              t.$slots.config && e.web_component || e.description || e.prompt || e.tools?.length ? (i(), o("button", {
                key: 0,
                type: "button",
                class: "kx-trait-fold",
                "aria-expanded": !d(x)(e.id),
                title: d(x)(e.id) ? "Show details" : "Hide details",
                "aria-label": d(x)(e.id) ? "Show details" : "Hide details",
                onClick: (l) => d(h)(e.id)
              }, [
                w(d(S), {
                  icon: d(x)(e.id) ? "tabler:chevron-right" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, Ee)) : k("", !0),
              s("button", {
                type: "button",
                class: "kx-trait-x",
                "aria-label": `Remove ${e.title || e.id} capability`,
                onClick: (l) => G(e.id)
              }, [
                w(d(S), {
                  icon: "tabler:x",
                  "aria-hidden": "true"
                })
              ], 8, Me)
            ])
          ]),
          d(x)(e.id) ? k("", !0) : (i(), o("div", Le, [
            e.description ? (i(), o("p", Ne, r(e.description), 1)) : k("", !0),
            e.prompt ? (i(), o("p", Re, r(e.prompt), 1)) : k("", !0),
            e.tools?.length ? (i(), o("ul", He, [
              (i(!0), o(T, null, $(g.value.get(e.id), ({ id: l, tool: n }) => (i(), o("li", {
                key: l,
                "data-declared-tool-id": l
              }, [
                s("strong", null, r(n?.title || l), 1),
                s("p", ze, r(n?.llm_description || (n ? "No description declared." : "This tool is not in the available catalog.")), 1)
              ], 8, Oe))), 128))
            ])) : k("", !0),
            te(t.$slots, "config", { trait: e })
          ]))
        ], 8, $e))), 128))
      ])) : (i(), o("p", Ve, r(m.emptyMessage), 1))
    ]));
  }
});
async function Be() {
  const m = [], A = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set();
  let _;
  do {
    const I = new URLSearchParams({ limit: "100" });
    _ && I.set("cursor", _);
    const { data: x } = await se.get(`/api/v1/agents/tools?${I.toString()}`), h = x;
    if (!h?.success) throw new Error("could not load tools");
    for (const g of h.tools || [])
      g.id && !A.has(g.id) && (A.add(g.id), m.push(g));
    const v = typeof h.next_cursor == "string" && h.next_cursor ? h.next_cursor : void 0;
    if (v && u.has(v)) throw new Error("tool catalog pagination did not advance");
    v && u.add(v), _ = v;
  } while (_);
  return m;
}
export {
  qe as _,
  Be as l
};
//# sourceMappingURL=toolCatalog-zaiNPgZH.js.map
