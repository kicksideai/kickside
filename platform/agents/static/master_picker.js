import { W as Z, P as ee } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as te, ref as u, watch as se, onMounted as ne, computed as q, openBlock as a, createElementBlock as i, createElementVNode as n, Fragment as v, renderList as x, createTextVNode as I, toDisplayString as m, createVNode as c, unref as p, createCommentVNode as f, withCtx as M, normalizeClass as U } from "vue";
import { Icon as d } from "@iconify/vue";
import { api as z, define as ae } from "@wippy-fe/proxy";
import { _ as B } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
import { s as ie } from "./styles-CiCzyjUM.js";
const le = { class: "kx-ns" }, oe = { class: "kx-ns-toggle" }, ce = ["checked"], re = { class: "kx-ns-section" }, ue = { class: "kx-ns-chips" }, pe = ["onClick"], de = {
  key: 0,
  class: "kx-ns-empty"
}, ve = { class: "kx-ns-add" }, me = ["aria-expanded"], ke = {
  class: "kx-ns-menu",
  role: "listbox"
}, he = { class: "kx-ns-group" }, _e = ["aria-selected", "onClick"], be = { class: "kx-ns-opt-label" }, xe = {
  key: 0,
  class: "kx-ns-menu-empty"
}, fe = { class: "kx-ns-section" }, ge = { class: "kx-ns-chips" }, ye = ["onClick"], Ce = {
  key: 0,
  class: "kx-ns-empty"
}, Ae = { class: "kx-ns-add" }, we = ["aria-expanded"], Ne = {
  class: "kx-ns-menu",
  role: "listbox"
}, je = ["aria-selected", "onClick"], Ee = { class: "kx-ns-opt-text" }, Oe = { class: "kx-ns-opt-label" }, $e = {
  key: 0,
  class: "kx-ns-opt-desc"
}, Pe = {
  key: 0,
  class: "kx-ns-menu-empty"
}, Te = /* @__PURE__ */ te({
  __name: "MasterNamespacePicker",
  props: {
    config: {}
  },
  emits: ["config-changed"],
  setup(j, { emit: H }) {
    const E = j, K = H;
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
    const A = O(E.config), l = u(A.namespaces || []), r = u(A.trait_ids || []), k = u(!!A.inject_trait_catalog), g = u([]), y = u([]), h = u(!1), _ = u(!1), $ = u(null), P = u(null);
    se(() => E.config, (e) => {
      const t = O(e);
      l.value = t.namespaces || [], r.value = t.trait_ids || [], k.value = !!t.inject_trait_catalog;
    }), ne(async () => {
      try {
        const { data: e } = await z.get("/api/v1/agents/namespaces");
        g.value = e?.success && Array.isArray(e.namespaces) ? e.namespaces : [];
      } catch {
        g.value = [];
      }
      try {
        const { data: e } = await z.get("/api/v1/agents/traits");
        y.value = e?.success && Array.isArray(e.traits) ? e.traits : [];
      } catch {
        y.value = [];
      }
    });
    const L = { agent: "Agents", trait: "Capabilities" }, T = q(
      () => ["agent", "trait"].map((e) => ({ kind: e, label: L[e] || e, items: g.value.filter((t) => t.kind === e) })).filter((e) => e.items.length)
    );
    function R(e) {
      const t = e.lastIndexOf(":");
      return t > 0 ? e.slice(0, t) : "";
    }
    function W(e) {
      if (!l.value.length || l.value.includes("*")) return !0;
      const t = R(e);
      return t ? l.value.some((s) => t === s || t.startsWith(`${s}.`)) : !1;
    }
    const V = q(() => y.value.filter((e) => W(e.id))), D = (e) => g.value.find((t) => t.id === e)?.label || e, F = (e) => y.value.find((t) => t.id === e)?.title || e, w = (e) => l.value.includes(e), N = (e) => r.value.includes(e);
    function b() {
      K("config-changed", {
        namespaces: [...l.value],
        trait_ids: [...r.value],
        inject_trait_catalog: k.value
      });
    }
    function G(e) {
      const t = l.value.indexOf(e);
      t >= 0 ? l.value.splice(t, 1) : l.value.push(e), b();
    }
    function J(e) {
      const t = r.value.indexOf(e);
      t >= 0 ? r.value.splice(t, 1) : r.value.push(e), b();
    }
    function Q(e) {
      l.value.splice(e, 1), b();
    }
    function X(e) {
      r.value.splice(e, 1), b();
    }
    function Y() {
      k.value = !k.value, b();
    }
    return (e, t) => (a(), i("div", le, [
      n("label", oe, [
        n("input", {
          class: "kx-ns-switch-input",
          type: "checkbox",
          checked: k.value,
          onChange: Y
        }, null, 40, ce),
        t[4] || (t[4] = n("span", {
          class: "kx-ns-switch",
          "aria-hidden": "true"
        }, null, -1)),
        t[5] || (t[5] = n("span", null, "Show available capabilities in the prompt", -1))
      ]),
      n("div", re, [
        t[7] || (t[7] = n("div", { class: "kx-ns-label" }, "Namespace scope", -1)),
        n("div", ue, [
          (a(!0), i(v, null, x(l.value, (s, o) => (a(), i("span", {
            key: s,
            class: "kx-ns-chip"
          }, [
            I(m(D(s)) + " ", 1),
            n("button", {
              type: "button",
              class: "kx-ns-x",
              "aria-label": "Remove",
              onClick: (S) => Q(o)
            }, [
              c(p(d), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, pe)
          ]))), 128)),
          l.value.length === 0 ? (a(), i("span", de, "All namespaces")) : f("", !0)
        ]),
        n("div", ve, [
          n("button", {
            ref_key: "nsAnchorEl",
            ref: $,
            type: "button",
            class: "kx-ns-btn",
            "aria-haspopup": "listbox",
            "aria-expanded": h.value,
            onClick: t[0] || (t[0] = (s) => h.value = !h.value)
          }, [
            c(p(d), {
              icon: "tabler:plus",
              "aria-hidden": "true"
            }),
            t[6] || (t[6] = n("span", null, "Add namespace", -1)),
            c(p(d), {
              icon: "tabler:chevron-down",
              class: "kx-ns-caret",
              "aria-hidden": "true"
            })
          ], 8, me),
          c(B, {
            open: h.value,
            "onUpdate:open": t[1] || (t[1] = (s) => h.value = s),
            anchor: $.value,
            "min-width": 240
          }, {
            default: M(() => [
              n("div", ke, [
                (a(!0), i(v, null, x(T.value, (s) => (a(), i(v, {
                  key: s.kind
                }, [
                  n("div", he, m(s.label), 1),
                  (a(!0), i(v, null, x(s.items, (o) => (a(), i("button", {
                    key: o.id,
                    type: "button",
                    class: U(["kx-ns-opt", w(o.id) && "kx-ns-opt-on"]),
                    role: "option",
                    "aria-selected": w(o.id),
                    onClick: (S) => G(o.id)
                  }, [
                    c(p(d), {
                      icon: w(o.id) ? "tabler:square-check-filled" : "tabler:square",
                      class: "kx-ns-check",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    n("span", be, m(o.label), 1)
                  ], 10, _e))), 128))
                ], 64))), 128)),
                T.value.length ? f("", !0) : (a(), i("div", xe, "No namespaces visible to you."))
              ])
            ]),
            _: 1
          }, 8, ["open", "anchor"])
        ])
      ]),
      n("div", fe, [
        t[9] || (t[9] = n("div", { class: "kx-ns-label" }, "Capability allow-list", -1)),
        n("div", ge, [
          (a(!0), i(v, null, x(r.value, (s, o) => (a(), i("span", {
            key: s,
            class: "kx-ns-chip"
          }, [
            I(m(F(s)) + " ", 1),
            n("button", {
              type: "button",
              class: "kx-ns-x",
              "aria-label": "Remove",
              onClick: (S) => X(o)
            }, [
              c(p(d), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, ye)
          ]))), 128)),
          r.value.length === 0 ? (a(), i("span", Ce, "All public capabilities in scope")) : f("", !0)
        ]),
        n("div", Ae, [
          n("button", {
            ref_key: "traitAnchorEl",
            ref: P,
            type: "button",
            class: "kx-ns-btn",
            "aria-haspopup": "listbox",
            "aria-expanded": _.value,
            onClick: t[2] || (t[2] = (s) => _.value = !_.value)
          }, [
            c(p(d), {
              icon: "tabler:puzzle",
              "aria-hidden": "true"
            }),
            t[8] || (t[8] = n("span", null, "Add capability", -1)),
            c(p(d), {
              icon: "tabler:chevron-down",
              class: "kx-ns-caret",
              "aria-hidden": "true"
            })
          ], 8, we),
          c(B, {
            open: _.value,
            "onUpdate:open": t[3] || (t[3] = (s) => _.value = s),
            anchor: P.value,
            "min-width": 300
          }, {
            default: M(() => [
              n("div", Ne, [
                (a(!0), i(v, null, x(V.value, (s) => (a(), i("button", {
                  key: s.id,
                  type: "button",
                  class: U(["kx-ns-opt kx-ns-opt-rich", N(s.id) && "kx-ns-opt-on"]),
                  role: "option",
                  "aria-selected": N(s.id),
                  onClick: (o) => J(s.id)
                }, [
                  c(p(d), {
                    icon: N(s.id) ? "tabler:square-check-filled" : "tabler:square",
                    class: "kx-ns-check",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  n("span", Ee, [
                    n("span", Oe, m(s.title || s.id), 1),
                    s.description ? (a(), i("span", $e, m(s.description), 1)) : f("", !0)
                  ])
                ], 10, je))), 128)),
                V.value.length ? f("", !0) : (a(), i("div", Pe, "No capabilities visible in this scope."))
              ])
            ]),
            _: 1
          }, 8, ["open", "anchor"])
        ])
      ]),
      t[10] || (t[10] = n("p", { class: "kx-ns-hint" }, "Namespace and capability limits bound what this agent can activate. Context-bearing capabilities can be activated with a context object.", -1))
    ]));
  }
}), Ve = {
  type: "object",
  properties: {
    config: {
      type: "object",
      description: "Capability context: { namespaces: string[], trait_ids: string[], inject_trait_catalog: boolean }"
    }
  }
};
class Se extends Z {
  static get wippyConfig() {
    return {
      propsSchema: Ve,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ie
    };
  }
  static get vueConfig() {
    return { rootComponent: Te, plugins: [ee] };
  }
}
ae(import.meta.url, Se);
//# sourceMappingURL=master_picker.js.map
