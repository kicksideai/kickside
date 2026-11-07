import { defineComponent as Z, ref as u, watch as ee, onMounted as te, computed as V, openBlock as a, createElementBlock as i, createElementVNode as n, Fragment as v, renderList as b, createTextVNode as z, toDisplayString as k, createVNode as c, unref as d, createCommentVNode as f, withCtx as B, normalizeClass as L } from "vue";
import { Icon as p } from "@iconify/vue";
import { api as D } from "@wippy-fe/proxy";
import { _ as H } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
const se = { class: "kx-ns" }, ne = { class: "kx-ns-toggle" }, ae = ["checked"], ie = { class: "kx-ns-section" }, le = { class: "kx-ns-chips" }, oe = ["onClick"], ce = {
  key: 0,
  class: "kx-ns-empty"
}, re = { class: "kx-ns-add" }, ue = ["aria-expanded"], de = {
  class: "kx-ns-menu",
  role: "listbox"
}, pe = { class: "kx-ns-group" }, ve = ["aria-selected", "onClick"], ke = { class: "kx-ns-opt-label" }, he = {
  key: 0,
  class: "kx-ns-menu-empty"
}, xe = { class: "kx-ns-section" }, _e = { class: "kx-ns-chips" }, me = ["onClick"], be = {
  key: 0,
  class: "kx-ns-empty"
}, fe = { class: "kx-ns-add" }, ye = ["aria-expanded"], ge = {
  class: "kx-ns-menu",
  role: "listbox"
}, Ce = ["aria-selected", "onClick"], Ae = { class: "kx-ns-opt-text" }, we = { class: "kx-ns-opt-label" }, Ne = {
  key: 0,
  class: "kx-ns-opt-desc"
}, je = {
  key: 0,
  class: "kx-ns-menu-empty"
}, qe = /* @__PURE__ */ Z({
  __name: "MasterNamespacePicker",
  props: {
    config: {}
  },
  emits: ["config-changed"],
  setup(M, { emit: R }) {
    const j = M, S = R;
    function C(e) {
      return Array.isArray(e) ? e.filter((t) => typeof t == "string" && t !== "") : [];
    }
    function O(e) {
      return Array.isArray(e) ? { namespaces: C(e), trait_ids: [], inject_trait_catalog: !1 } : {
        namespaces: C(e?.namespaces),
        trait_ids: C(e?.trait_ids),
        inject_trait_catalog: e?.inject_trait_catalog === !0
      };
    }
    const A = O(j.config), l = u(A.namespaces || []), r = u(A.trait_ids || []), h = u(!!A.inject_trait_catalog), y = u([]), g = u([]), x = u(!1), _ = u(!1), $ = u(null), E = u(null);
    ee(() => j.config, (e) => {
      const t = O(e);
      l.value = t.namespaces || [], r.value = t.trait_ids || [], h.value = !!t.inject_trait_catalog;
    }), te(async () => {
      try {
        const { data: e } = await D.get("/api/v1/agents/namespaces");
        y.value = e?.success && Array.isArray(e.namespaces) ? e.namespaces : [];
      } catch {
        y.value = [];
      }
      try {
        const { data: e } = await D.get("/api/v1/agents/traits");
        g.value = e?.success && Array.isArray(e.traits) ? e.traits : [];
      } catch {
        g.value = [];
      }
    });
    const U = { agent: "Agents", trait: "Capabilities" }, T = V(
      () => ["agent", "trait"].map((e) => ({ kind: e, label: U[e] || e, items: y.value.filter((t) => t.kind === e) })).filter((e) => e.items.length)
    );
    function F(e) {
      const t = e.lastIndexOf(":");
      return t > 0 ? e.slice(0, t) : "";
    }
    function K(e) {
      if (!l.value.length || l.value.includes("*")) return !0;
      const t = F(e);
      return t ? l.value.some((s) => t === s || t.startsWith(`${s}.`)) : !1;
    }
    const q = V(() => g.value.filter((e) => K(e.id))), P = (e) => y.value.find((t) => t.id === e)?.label || e, W = (e) => g.value.find((t) => t.id === e)?.title || e, w = (e) => l.value.includes(e), N = (e) => r.value.includes(e);
    function m() {
      S("config-changed", {
        namespaces: [...l.value],
        trait_ids: [...r.value],
        inject_trait_catalog: h.value
      });
    }
    function G(e) {
      const t = l.value.indexOf(e);
      t >= 0 ? l.value.splice(t, 1) : l.value.push(e), m();
    }
    function J(e) {
      const t = r.value.indexOf(e);
      t >= 0 ? r.value.splice(t, 1) : r.value.push(e), m();
    }
    function Q(e) {
      l.value.splice(e, 1), m();
    }
    function X(e) {
      r.value.splice(e, 1), m();
    }
    function Y() {
      h.value = !h.value, m();
    }
    return (e, t) => (a(), i("div", se, [
      n("label", ne, [
        n("input", {
          class: "kx-ns-switch-input",
          type: "checkbox",
          checked: h.value,
          onChange: Y
        }, null, 40, ae),
        t[4] || (t[4] = n("span", {
          class: "kx-ns-switch",
          "aria-hidden": "true"
        }, null, -1)),
        t[5] || (t[5] = n("span", null, "Show available capabilities in the prompt", -1))
      ]),
      n("div", ie, [
        t[7] || (t[7] = n("div", { class: "kx-ns-label" }, "Namespace scope", -1)),
        n("div", le, [
          (a(!0), i(v, null, b(l.value, (s, o) => (a(), i("span", {
            key: s,
            class: "kx-ns-chip"
          }, [
            z(k(P(s)) + " ", 1),
            n("button", {
              type: "button",
              class: "kx-ns-x",
              "aria-label": "Remove",
              onClick: (I) => Q(o)
            }, [
              c(d(p), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, oe)
          ]))), 128)),
          l.value.length === 0 ? (a(), i("span", ce, "All namespaces")) : f("", !0)
        ]),
        n("div", re, [
          n("button", {
            ref_key: "nsAnchorEl",
            ref: $,
            type: "button",
            class: "kx-ns-btn",
            "aria-haspopup": "listbox",
            "aria-expanded": x.value,
            onClick: t[0] || (t[0] = (s) => x.value = !x.value)
          }, [
            c(d(p), {
              icon: "tabler:plus",
              "aria-hidden": "true"
            }),
            t[6] || (t[6] = n("span", null, "Add namespace", -1)),
            c(d(p), {
              icon: "tabler:chevron-down",
              class: "kx-ns-caret",
              "aria-hidden": "true"
            })
          ], 8, ue),
          c(H, {
            open: x.value,
            "onUpdate:open": t[1] || (t[1] = (s) => x.value = s),
            anchor: $.value,
            "min-width": 240
          }, {
            default: B(() => [
              n("div", de, [
                (a(!0), i(v, null, b(T.value, (s) => (a(), i(v, {
                  key: s.kind
                }, [
                  n("div", pe, k(s.label), 1),
                  (a(!0), i(v, null, b(s.items, (o) => (a(), i("button", {
                    key: o.id,
                    type: "button",
                    class: L(["kx-ns-opt", w(o.id) && "kx-ns-opt-on"]),
                    role: "option",
                    "aria-selected": w(o.id),
                    onClick: (I) => G(o.id)
                  }, [
                    c(d(p), {
                      icon: w(o.id) ? "tabler:square-check-filled" : "tabler:square",
                      class: "kx-ns-check",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    n("span", ke, k(o.label), 1)
                  ], 10, ve))), 128))
                ], 64))), 128)),
                T.value.length ? f("", !0) : (a(), i("div", he, "No namespaces visible to you."))
              ])
            ]),
            _: 1
          }, 8, ["open", "anchor"])
        ])
      ]),
      n("div", xe, [
        t[9] || (t[9] = n("div", { class: "kx-ns-label" }, "Capability allow-list", -1)),
        n("div", _e, [
          (a(!0), i(v, null, b(r.value, (s, o) => (a(), i("span", {
            key: s,
            class: "kx-ns-chip"
          }, [
            z(k(W(s)) + " ", 1),
            n("button", {
              type: "button",
              class: "kx-ns-x",
              "aria-label": "Remove",
              onClick: (I) => X(o)
            }, [
              c(d(p), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, me)
          ]))), 128)),
          r.value.length === 0 ? (a(), i("span", be, "All public capabilities in scope")) : f("", !0)
        ]),
        n("div", fe, [
          n("button", {
            ref_key: "traitAnchorEl",
            ref: E,
            type: "button",
            class: "kx-ns-btn",
            "aria-haspopup": "listbox",
            "aria-expanded": _.value,
            onClick: t[2] || (t[2] = (s) => _.value = !_.value)
          }, [
            c(d(p), {
              icon: "tabler:puzzle",
              "aria-hidden": "true"
            }),
            t[8] || (t[8] = n("span", null, "Add capability", -1)),
            c(d(p), {
              icon: "tabler:chevron-down",
              class: "kx-ns-caret",
              "aria-hidden": "true"
            })
          ], 8, ye),
          c(H, {
            open: _.value,
            "onUpdate:open": t[3] || (t[3] = (s) => _.value = s),
            anchor: E.value,
            "min-width": 300
          }, {
            default: B(() => [
              n("div", ge, [
                (a(!0), i(v, null, b(q.value, (s) => (a(), i("button", {
                  key: s.id,
                  type: "button",
                  class: L(["kx-ns-opt kx-ns-opt-rich", N(s.id) && "kx-ns-opt-on"]),
                  role: "option",
                  "aria-selected": N(s.id),
                  onClick: (o) => J(s.id)
                }, [
                  c(d(p), {
                    icon: N(s.id) ? "tabler:square-check-filled" : "tabler:square",
                    class: "kx-ns-check",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  n("span", Ae, [
                    n("span", we, k(s.title || s.id), 1),
                    s.description ? (a(), i("span", Ne, k(s.description), 1)) : f("", !0)
                  ])
                ], 10, Ce))), 128)),
                q.value.length ? f("", !0) : (a(), i("div", je, "No capabilities visible in this scope."))
              ])
            ]),
            _: 1
          }, 8, ["open", "anchor"])
        ])
      ]),
      t[10] || (t[10] = n("p", { class: "kx-ns-hint" }, "Namespace and capability limits bound what this agent can activate. Context-bearing capabilities can be activated with a context object.", -1))
    ]));
  }
});
export {
  qe as default
};
//# sourceMappingURL=MasterNamespacePicker-CUrceSK3.js.map
