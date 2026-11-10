import { defineComponent as G, computed as D, ref as y, useId as J, watch as W, openBlock as i, createElementBlock as o, createElementVNode as s, toDisplayString as d, withDirectives as X, vModelText as Y, createVNode as m, withCtx as Z, Fragment as w, renderList as T, normalizeClass as $, unref as c, withModifiers as z, createCommentVNode as v, renderSlot as ee, nextTick as P } from "vue";
import { Icon as C } from "@iconify/vue";
import { u as te, r as ae, _ as ie, t as V, b as U } from "./trait-presentation-v3U6eC0-.js";
import { api as oe } from "@wippy-fe/proxy";
const se = { class: "kx-group kx-capability-picker" }, le = { class: "kx-group-head" }, ne = { class: "kx-group-title" }, re = { class: "kx-group-meta" }, de = ["aria-expanded", "aria-activedescendant"], ce = ["id", "onMouseenter", "onClick"], ue = { class: "kx-tadd-opt" }, pe = { class: "kx-tadd-opt-text" }, ke = { class: "kx-trait-name" }, ve = { class: "kx-trait-badges" }, he = ["aria-expanded", "aria-label", "onClick"], fe = {
  key: 0,
  class: "kx-trait-cfg"
}, _e = {
  key: 0,
  class: "kx-trait-description"
}, xe = {
  key: 1,
  class: "kx-trait-description"
}, ge = {
  key: 2,
  class: "kx-trait-tools",
  "aria-label": "Declared tools"
}, ye = ["data-declared-tool-id"], be = { class: "kx-trait-description" }, me = {
  key: 0,
  class: "kx-tadd-empty"
}, we = {
  key: 0,
  class: "kx-traits"
}, Te = ["data-trait-id"], $e = { class: "kx-trait-row" }, Ce = { class: "kx-trait-text" }, Se = { class: "kx-trait-name" }, Ae = { class: "kx-trait-badges" }, Ie = { class: "kx-trait-actions" }, De = ["aria-expanded", "title", "aria-label", "onClick"], Ee = ["aria-label", "onClick"], Me = {
  key: 0,
  class: "kx-trait-cfg"
}, Oe = {
  key: 0,
  class: "kx-trait-description"
}, Le = {
  key: 1,
  class: "kx-trait-description"
}, Ne = {
  key: 2,
  class: "kx-trait-tools",
  "aria-label": "Declared tools"
}, Re = ["data-declared-tool-id"], He = { class: "kx-trait-description" }, ze = {
  key: 1,
  class: "kx-trait-cfg"
}, Pe = {
  key: 1,
  class: "kx-sec-foot"
}, qe = /* @__PURE__ */ G({
  __name: "CapabilityPicker",
  props: {
    traits: {},
    tools: {},
    selected: {},
    label: { default: "Capabilities" },
    emptyMessage: { default: "No capabilities yet. Add one above to give this agent what it can do." }
  },
  emits: ["change"],
  setup(b, { emit: S }) {
    const u = b, x = S, { isTraitOpen: f, toggleTraitOpen: E } = te(() => u.selected), h = D(() => u.traits.filter((t) => u.selected.includes(t.id))), _ = D(() => new Map(u.traits.map((t) => [t.id, ae(t, u.tools)]))), p = y(null);
    function K(t) {
      p.value = p.value === t ? null : t;
    }
    const A = y(""), r = y(!1), N = y(null), R = y(null), M = y([]), k = y(-1), I = `capabilities-${J()}`, g = D(() => {
      const t = A.value.trim().toLowerCase();
      return u.traits.filter((a) => !u.selected.includes(a.id)).filter((a) => !t || (a.title || a.id).toLowerCase().includes(t) || (a.description || "").toLowerCase().includes(t));
    }), Q = D(() => k.value >= 0 ? `${I}-option-${k.value}` : void 0);
    W([r, g], ([t, a]) => {
      M.value = [], k.value = t && a.length ? 0 : -1;
    });
    function q(t, a) {
      t instanceof HTMLElement && (M.value[a] = t);
    }
    function O(t, a = !1) {
      k.value = t, !(!a || t < 0) && P(() => M.value[t]?.scrollIntoView?.({ block: "nearest" }));
    }
    function B() {
      r.value = !0, O(g.value.length ? 0 : -1, !0);
    }
    function F(t) {
      const a = g.value.length;
      if (t.key === "ArrowRight" || t.key === "ArrowLeft") {
        const e = g.value[k.value];
        r.value && e && (t.preventDefault(), p.value = t.key === "ArrowRight" ? e.id : null);
        return;
      }
      if (t.key === "Escape") {
        r.value && t.stopPropagation(), r.value = !1;
        return;
      }
      if (t.key === "Tab") {
        r.value = !1;
        return;
      }
      if (t.key === "ArrowDown" || t.key === "ArrowUp") {
        if (t.preventDefault(), r.value = !0, !a) return;
        const e = t.key === "ArrowDown" ? 1 : -1, l = k.value < 0 ? e > 0 ? -1 : 0 : k.value;
        O((l + e + a) % a, !0);
        return;
      }
      if (t.key === "Home" || t.key === "End") {
        if (!r.value || !a) return;
        t.preventDefault(), O(t.key === "Home" ? 0 : a - 1, !0);
        return;
      }
      if (t.key === "Enter" && r.value && k.value >= 0) {
        t.preventDefault();
        const e = g.value[k.value];
        e && H(e.id);
      }
    }
    function H(t) {
      u.selected.includes(t) || x("change", [...u.selected, t]), p.value = null, A.value = "", k.value = -1, P(() => {
        R.value?.focus({ preventScroll: !0 }), r.value = !1;
      });
    }
    function j(t) {
      x("change", u.selected.filter((a) => a !== t));
    }
    return (t, a) => (i(), o("div", se, [
      s("div", le, [
        s("span", ne, d(b.label), 1),
        s("span", re, d(h.value.length) + " active", 1)
      ]),
      s("div", {
        ref_key: "traitAddRoot",
        ref: N,
        class: "kx-tadd"
      }, [
        X(s("input", {
          ref_key: "traitSearchInput",
          ref: R,
          "onUpdate:modelValue": a[0] || (a[0] = (e) => A.value = e),
          class: "kx-input kx-tadd-input",
          type: "text",
          role: "combobox",
          "aria-label": "Search capabilities to add",
          "aria-autocomplete": "list",
          "aria-expanded": r.value,
          "aria-controls": I,
          "aria-activedescendant": r.value ? Q.value : void 0,
          placeholder: "Search capabilities to add…",
          onFocus: a[1] || (a[1] = (e) => r.value = !0),
          onInput: B,
          onKeydown: F
        }, null, 40, de), [
          [Y, A.value]
        ]),
        m(ie, {
          open: r.value,
          "onUpdate:open": a[3] || (a[3] = (e) => r.value = e),
          anchor: N.value
        }, {
          default: Z(() => [
            s("div", {
              id: I,
              class: "kx-tadd-menu",
              role: "listbox",
              "aria-label": "Available capabilities"
            }, [
              (i(!0), o(w, null, T(g.value, (e, l) => (i(), o("div", {
                key: e.id,
                id: `${I}-option-${l}`,
                ref_for: !0,
                ref: (n) => q(n, l),
                class: $(["kx-tadd-option", l === k.value && "kx-tadd-opt-active"]),
                tabindex: "-1",
                role: "option",
                "aria-selected": !1,
                onMouseenter: (n) => k.value = l,
                onClick: (n) => H(e.id)
              }, [
                s("div", ue, [
                  s("span", {
                    class: $(["kx-trait-ico", `kx-tint-${c(V)(e)}`])
                  }, [
                    m(c(C), {
                      icon: e.icon || "tabler:puzzle",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ], 2),
                  s("span", pe, [
                    s("span", ke, d(e.title || e.id), 1)
                  ]),
                  s("span", ve, [
                    (i(!0), o(w, null, T(c(U)(e), (n) => (i(), o("span", {
                      key: n.key,
                      class: $(["kx-badge kx-tag-caps", `kx-badge-${n.key}`])
                    }, d(n.label), 3))), 128))
                  ]),
                  e.description || e.prompt || e.tools?.length ? (i(), o("button", {
                    key: 0,
                    type: "button",
                    class: "kx-trait-fold",
                    "aria-expanded": p.value === e.id,
                    "aria-label": `${p.value === e.id ? "Hide" : "Show"} ${e.title || e.id} details`,
                    onClick: z((n) => K(e.id), ["stop"]),
                    onKeydown: a[2] || (a[2] = z(() => {
                    }, ["stop"]))
                  }, [
                    m(c(C), {
                      icon: p.value === e.id ? "tabler:chevron-down" : "tabler:chevron-right",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ], 40, he)) : v("", !0)
                ]),
                p.value === e.id ? (i(), o("div", fe, [
                  e.description ? (i(), o("p", _e, d(e.description), 1)) : v("", !0),
                  e.prompt ? (i(), o("p", xe, d(e.prompt), 1)) : v("", !0),
                  e.tools?.length ? (i(), o("ul", ge, [
                    (i(!0), o(w, null, T(_.value.get(e.id), ({ id: n, tool: L }) => (i(), o("li", {
                      key: n,
                      "data-declared-tool-id": n
                    }, [
                      s("strong", null, d(L?.title || n), 1),
                      s("p", be, d(L?.llm_description || (L ? "No description declared." : "This tool is not in the available catalog.")), 1)
                    ], 8, ye))), 128))
                  ])) : v("", !0)
                ])) : v("", !0)
              ], 42, ce))), 128)),
              g.value.length ? v("", !0) : (i(), o("div", me, "No matching capabilities."))
            ])
          ]),
          _: 1
        }, 8, ["open", "anchor"])
      ], 512),
      h.value.length ? (i(), o("ul", we, [
        (i(!0), o(w, null, T(h.value, (e) => (i(), o("li", {
          key: e.id,
          "data-trait-id": e.id,
          class: "kx-trait"
        }, [
          s("div", $e, [
            s("span", {
              class: $(["kx-trait-ico", `kx-tint-${c(V)(e)}`])
            }, [
              m(c(C), {
                icon: e.icon || "tabler:puzzle",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 2),
            s("span", Ce, [
              s("span", Se, d(e.title || e.id), 1)
            ]),
            s("span", Ae, [
              (i(!0), o(w, null, T(c(U)(e), (l) => (i(), o("span", {
                key: l.key,
                class: $(["kx-badge kx-tag-caps", `kx-badge-${l.key}`])
              }, d(l.label), 3))), 128))
            ]),
            s("span", Ie, [
              e.description || e.prompt || e.tools?.length ? (i(), o("button", {
                key: 0,
                type: "button",
                class: "kx-trait-fold",
                "aria-expanded": c(f)(e.id),
                title: c(f)(e.id) ? "Hide details" : "Show details",
                "aria-label": c(f)(e.id) ? "Hide details" : "Show details",
                onClick: (l) => c(E)(e.id)
              }, [
                m(c(C), {
                  icon: c(f)(e.id) ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, De)) : v("", !0),
              s("button", {
                type: "button",
                class: "kx-trait-x",
                "aria-label": `Remove ${e.title || e.id} capability`,
                onClick: (l) => j(e.id)
              }, [
                m(c(C), {
                  icon: "tabler:x",
                  "aria-hidden": "true"
                })
              ], 8, Ee)
            ])
          ]),
          c(f)(e.id) ? (i(), o("div", Me, [
            e.description ? (i(), o("p", Oe, d(e.description), 1)) : v("", !0),
            e.prompt ? (i(), o("p", Le, d(e.prompt), 1)) : v("", !0),
            e.tools?.length ? (i(), o("ul", Ne, [
              (i(!0), o(w, null, T(_.value.get(e.id), ({ id: l, tool: n }) => (i(), o("li", {
                key: l,
                "data-declared-tool-id": l
              }, [
                s("strong", null, d(n?.title || l), 1),
                s("p", He, d(n?.llm_description || (n ? "No description declared." : "This tool is not in the available catalog.")), 1)
              ], 8, Re))), 128))
            ])) : v("", !0)
          ])) : v("", !0),
          t.$slots.config && e.web_component ? (i(), o("div", ze, [
            ee(t.$slots, "config", { trait: e })
          ])) : v("", !0)
        ], 8, Te))), 128))
      ])) : (i(), o("p", Pe, d(b.emptyMessage), 1))
    ]));
  }
});
async function Be() {
  const b = [], S = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set();
  let x;
  do {
    const f = new URLSearchParams({ limit: "100" });
    x && f.set("cursor", x);
    const { data: E } = await oe.get(`/api/v1/agents/tools?${f.toString()}`), h = E;
    if (!h?.success) throw new Error("could not load tools");
    for (const p of h.tools || [])
      p.id && !S.has(p.id) && (S.add(p.id), b.push(p));
    const _ = typeof h.next_cursor == "string" && h.next_cursor ? h.next_cursor : void 0;
    if (_ && u.has(_)) throw new Error("tool catalog pagination did not advance");
    _ && u.add(_), x = _;
  } while (x);
  return b;
}
export {
  qe as _,
  Be as l
};
//# sourceMappingURL=toolCatalog-CE8HFruH.js.map
