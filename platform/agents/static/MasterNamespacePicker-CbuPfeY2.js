import { defineComponent as H, ref as r, watch as K, onMounted as U, computed as T, openBlock as s, createElementBlock as i, createElementVNode as l, createCommentVNode as p, Fragment as h, renderList as A, createTextVNode as W, toDisplayString as j, createVNode as m, unref as f, withCtx as G, normalizeClass as J, createBlock as Q } from "vue";
import { Icon as g } from "@iconify/vue";
import { api as B } from "@wippy-fe/proxy";
import { a as X, u as Y } from "./wc-runtime-KO3cNuNo.js";
import { l as Z, _ as ee } from "./toolCatalog-W6OjlU7E.js";
import { _ as te } from "./trait-presentation-B3J8cp5c.js";
const ae = { class: "kx-ns" }, se = {
  key: 0,
  class: "kx-ns-toggle"
}, ne = ["checked"], ie = {
  key: 1,
  class: "kx-ns-section"
}, le = { class: "kx-ns-chips" }, oe = ["aria-label", "onClick"], re = {
  key: 0,
  class: "kx-ns-empty"
}, ce = { class: "kx-ns-add" }, ue = ["aria-expanded"], pe = {
  class: "kx-ns-menu",
  role: "listbox"
}, de = { class: "kx-ns-group" }, ve = ["aria-selected", "onClick"], me = { class: "kx-ns-opt-label" }, _e = {
  key: 0,
  class: "kx-ns-menu-empty"
}, ke = {
  key: 3,
  class: "kx-ns-hint"
}, we = /* @__PURE__ */ H({
  __name: "MasterNamespacePicker",
  setup(he) {
    const _ = X(), I = Y();
    function c(e) {
      return !_.value.schema || Object.prototype.hasOwnProperty.call(_.value.schema.properties || {}, e);
    }
    function b(e) {
      return Array.isArray(e) ? e.filter((t) => typeof t == "string" && t !== "") : [];
    }
    function N(e) {
      return Array.isArray(e) ? { namespaces: b(e), trait_ids: [], inject_trait_catalog: !1 } : {
        namespaces: b(e?.namespaces),
        trait_ids: b(e?.trait_ids),
        inject_trait_catalog: e?.inject_trait_catalog === !0
      };
    }
    const x = N(_.value.config), n = r(x.namespaces || []), u = r(x.trait_ids || []), d = r(!!x.inject_trait_catalog), y = r([]), C = r([]), O = r([]), v = r(!1), $ = r(null);
    K(() => _.value.config, (e) => {
      const t = N(e);
      n.value = t.namespaces || [], u.value = t.trait_ids || [], d.value = !!t.inject_trait_catalog;
    }), U(async () => {
      const [e, t, a] = await Promise.all([
        B.get("/api/v1/agents/namespaces"),
        B.get("/api/v1/agents/traits"),
        Z()
      ]);
      y.value = e.data.namespaces, C.value = t.data.traits, O.value = a;
    });
    const P = { agent: "Agents", trait: "Capabilities" }, E = T(
      () => ["agent", "trait"].map((e) => ({ kind: e, label: P[e] || e, items: y.value.filter((t) => t.kind === e) })).filter((e) => e.items.length)
    );
    function V(e) {
      const t = e.lastIndexOf(":");
      return t > 0 ? e.slice(0, t) : "";
    }
    function R(e) {
      if (!n.value.length || n.value.includes("*")) return !0;
      const t = V(e);
      return t ? n.value.some((a) => t === a || t.startsWith(`${a}.`)) : !1;
    }
    const q = T(() => [
      ...C.value.filter((e) => R(e.id) || u.value.includes(e.id)),
      ...u.value.filter((e) => !C.value.some((t) => t.id === e)).map((e) => ({ id: e }))
    ]), L = (e) => y.value.find((t) => t.id === e)?.label || e, w = (e) => n.value.includes(e);
    function k() {
      I("config-changed", {
        ...c("namespaces") ? { namespaces: [...n.value] } : {},
        ...c("trait_ids") ? { trait_ids: [...u.value] } : {},
        ...c("inject_trait_catalog") ? { inject_trait_catalog: d.value } : {}
      });
    }
    function D(e) {
      const t = n.value.indexOf(e);
      t >= 0 ? n.value.splice(t, 1) : n.value.push(e), k();
    }
    function M(e) {
      u.value = e, k();
    }
    function S(e) {
      n.value.splice(e, 1), k();
    }
    function z() {
      d.value = !d.value, k();
    }
    return (e, t) => (s(), i("div", ae, [
      c("inject_trait_catalog") ? (s(), i("label", se, [
        l("input", {
          class: "kx-ns-switch-input",
          type: "checkbox",
          checked: d.value,
          onChange: z
        }, null, 40, ne),
        t[2] || (t[2] = l("span", {
          class: "kx-ns-switch",
          "aria-hidden": "true"
        }, null, -1)),
        t[3] || (t[3] = l("span", null, "Show available capabilities in the prompt", -1))
      ])) : p("", !0),
      c("namespaces") ? (s(), i("div", ie, [
        t[5] || (t[5] = l("div", { class: "kx-ns-label" }, "Limit which packages it can use", -1)),
        l("div", le, [
          (s(!0), i(h, null, A(n.value, (a, o) => (s(), i("span", {
            key: a,
            class: "kx-ns-chip"
          }, [
            W(j(L(a)) + " ", 1),
            l("button", {
              type: "button",
              class: "kx-ns-x",
              "aria-label": `Remove ${L(a)} package limit`,
              onClick: (F) => S(o)
            }, [
              m(f(g), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, oe)
          ]))), 128)),
          n.value.length === 0 ? (s(), i("span", re, "All packages")) : p("", !0)
        ]),
        l("div", ce, [
          l("button", {
            ref_key: "nsAnchorEl",
            ref: $,
            type: "button",
            class: "kx-ns-btn",
            "aria-haspopup": "listbox",
            "aria-expanded": v.value,
            onClick: t[0] || (t[0] = (a) => v.value = !v.value)
          }, [
            m(f(g), {
              icon: "tabler:plus",
              "aria-hidden": "true"
            }),
            t[4] || (t[4] = l("span", null, "Choose packages", -1)),
            m(f(g), {
              icon: "tabler:chevron-down",
              class: "kx-ns-caret",
              "aria-hidden": "true"
            })
          ], 8, ue),
          m(te, {
            open: v.value,
            "onUpdate:open": t[1] || (t[1] = (a) => v.value = a),
            anchor: $.value,
            "min-width": 240
          }, {
            default: G(() => [
              l("div", pe, [
                (s(!0), i(h, null, A(E.value, (a) => (s(), i(h, {
                  key: a.kind
                }, [
                  l("div", de, j(a.label), 1),
                  (s(!0), i(h, null, A(a.items, (o) => (s(), i("button", {
                    key: o.id,
                    type: "button",
                    class: J(["kx-ns-opt", w(o.id) && "kx-ns-opt-on"]),
                    role: "option",
                    "aria-selected": w(o.id),
                    onClick: (F) => D(o.id)
                  }, [
                    m(f(g), {
                      icon: w(o.id) ? "tabler:square-check-filled" : "tabler:square",
                      class: "kx-ns-check",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    l("span", me, j(o.label), 1)
                  ], 10, ve))), 128))
                ], 64))), 128)),
                E.value.length ? p("", !0) : (s(), i("div", _e, "No packages available."))
              ])
            ]),
            _: 1
          }, 8, ["open", "anchor"])
        ])
      ])) : p("", !0),
      c("trait_ids") ? (s(), Q(ee, {
        key: 2,
        traits: q.value,
        tools: O.value,
        selected: u.value,
        label: "Limit which capabilities it can turn on",
        "empty-message": "All available capabilities are allowed.",
        onChange: M
      }, null, 8, ["traits", "tools", "selected"])) : p("", !0),
      c("trait_ids") ? (s(), i("p", ke, "Leave the limits empty to allow all available capabilities.")) : p("", !0)
    ]));
  }
});
export {
  we as default
};
//# sourceMappingURL=MasterNamespacePicker-CbuPfeY2.js.map
