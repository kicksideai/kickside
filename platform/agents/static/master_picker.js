import { u as H, g as z, W as F, P as G } from "./primevue-plugin-BTxKP425.js";
import { defineComponent as J, ref as r, watch as Q, onMounted as X, computed as $, openBlock as s, createElementBlock as i, createElementVNode as l, createCommentVNode as p, Fragment as g, renderList as j, createTextVNode as Y, toDisplayString as A, createVNode as v, unref as k, withCtx as Z, normalizeClass as ee, createBlock as te } from "vue";
import { Icon as f } from "@iconify/vue";
import { api as L, define as ae } from "@wippy-fe/proxy";
import { l as se, _ as ne } from "./toolCatalog-W6OjlU7E.js";
import { _ as ie } from "./trait-presentation-B3J8cp5c.js";
import { s as le } from "./styles-DLfU4ZNr.js";
const oe = { class: "kx-ns" }, re = {
  key: 0,
  class: "kx-ns-toggle"
}, ce = ["checked"], ue = {
  key: 1,
  class: "kx-ns-section"
}, pe = { class: "kx-ns-chips" }, de = ["aria-label", "onClick"], me = {
  key: 0,
  class: "kx-ns-empty"
}, ve = { class: "kx-ns-add" }, _e = ["aria-expanded"], he = {
  class: "kx-ns-menu",
  role: "listbox"
}, ge = { class: "kx-ns-group" }, ke = ["aria-selected", "onClick"], fe = { class: "kx-ns-opt-label" }, be = {
  key: 0,
  class: "kx-ns-menu-empty"
}, xe = {
  key: 3,
  class: "kx-ns-hint"
}, ye = /* @__PURE__ */ J({
  __name: "MasterNamespacePicker",
  setup(T) {
    const _ = H(), S = z();
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
    const x = N(_.value.config), n = r(x.namespaces || []), u = r(x.trait_ids || []), d = r(!!x.inject_trait_catalog), y = r([]), C = r([]), P = r([]), m = r(!1), E = r(null);
    Q(() => _.value.config, (e) => {
      const t = N(e);
      n.value = t.namespaces || [], u.value = t.trait_ids || [], d.value = !!t.inject_trait_catalog;
    }), X(async () => {
      const [e, t, a] = await Promise.all([
        L.get("/api/v1/agents/namespaces"),
        L.get("/api/v1/agents/traits"),
        se()
      ]);
      y.value = e.data.namespaces, C.value = t.data.traits, P.value = a;
    });
    const B = { agent: "Agents", trait: "Capabilities" }, O = $(
      () => ["agent", "trait"].map((e) => ({ kind: e, label: B[e] || e, items: y.value.filter((t) => t.kind === e) })).filter((e) => e.items.length)
    );
    function I(e) {
      const t = e.lastIndexOf(":");
      return t > 0 ? e.slice(0, t) : "";
    }
    function M(e) {
      if (!n.value.length || n.value.includes("*")) return !0;
      const t = I(e);
      return t ? n.value.some((a) => t === a || t.startsWith(`${a}.`)) : !1;
    }
    const R = $(() => [
      ...C.value.filter((e) => M(e.id) || u.value.includes(e.id)),
      ...u.value.filter((e) => !C.value.some((t) => t.id === e)).map((e) => ({ id: e }))
    ]), V = (e) => y.value.find((t) => t.id === e)?.label || e, w = (e) => n.value.includes(e);
    function h() {
      S("config-changed", {
        ...c("namespaces") ? { namespaces: [...n.value] } : {},
        ...c("trait_ids") ? { trait_ids: [...u.value] } : {},
        ...c("inject_trait_catalog") ? { inject_trait_catalog: d.value } : {}
      });
    }
    function K(e) {
      const t = n.value.indexOf(e);
      t >= 0 ? n.value.splice(t, 1) : n.value.push(e), h();
    }
    function U(e) {
      u.value = e, h();
    }
    function W(e) {
      n.value.splice(e, 1), h();
    }
    function q() {
      d.value = !d.value, h();
    }
    return (e, t) => (s(), i("div", oe, [
      c("inject_trait_catalog") ? (s(), i("label", re, [
        l("input", {
          class: "kx-ns-switch-input",
          type: "checkbox",
          checked: d.value,
          onChange: q
        }, null, 40, ce),
        t[2] || (t[2] = l("span", {
          class: "kx-ns-switch",
          "aria-hidden": "true"
        }, null, -1)),
        t[3] || (t[3] = l("span", null, "Show available capabilities in the prompt", -1))
      ])) : p("", !0),
      c("namespaces") ? (s(), i("div", ue, [
        t[5] || (t[5] = l("div", { class: "kx-ns-label" }, "Limit which packages it can use", -1)),
        l("div", pe, [
          (s(!0), i(g, null, j(n.value, (a, o) => (s(), i("span", {
            key: a,
            class: "kx-ns-chip"
          }, [
            Y(A(V(a)) + " ", 1),
            l("button", {
              type: "button",
              class: "kx-ns-x",
              "aria-label": `Remove ${V(a)} package limit`,
              onClick: (D) => W(o)
            }, [
              v(k(f), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, de)
          ]))), 128)),
          n.value.length === 0 ? (s(), i("span", me, "All packages")) : p("", !0)
        ]),
        l("div", ve, [
          l("button", {
            ref_key: "nsAnchorEl",
            ref: E,
            type: "button",
            class: "kx-ns-btn",
            "aria-haspopup": "listbox",
            "aria-expanded": m.value,
            onClick: t[0] || (t[0] = (a) => m.value = !m.value)
          }, [
            v(k(f), {
              icon: "tabler:plus",
              "aria-hidden": "true"
            }),
            t[4] || (t[4] = l("span", null, "Choose packages", -1)),
            v(k(f), {
              icon: "tabler:chevron-down",
              class: "kx-ns-caret",
              "aria-hidden": "true"
            })
          ], 8, _e),
          v(ie, {
            open: m.value,
            "onUpdate:open": t[1] || (t[1] = (a) => m.value = a),
            anchor: E.value,
            "min-width": 240
          }, {
            default: Z(() => [
              l("div", he, [
                (s(!0), i(g, null, j(O.value, (a) => (s(), i(g, {
                  key: a.kind
                }, [
                  l("div", ge, A(a.label), 1),
                  (s(!0), i(g, null, j(a.items, (o) => (s(), i("button", {
                    key: o.id,
                    type: "button",
                    class: ee(["kx-ns-opt", w(o.id) && "kx-ns-opt-on"]),
                    role: "option",
                    "aria-selected": w(o.id),
                    onClick: (D) => K(o.id)
                  }, [
                    v(k(f), {
                      icon: w(o.id) ? "tabler:square-check-filled" : "tabler:square",
                      class: "kx-ns-check",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    l("span", fe, A(o.label), 1)
                  ], 10, ke))), 128))
                ], 64))), 128)),
                O.value.length ? p("", !0) : (s(), i("div", be, "No packages available."))
              ])
            ]),
            _: 1
          }, 8, ["open", "anchor"])
        ])
      ])) : p("", !0),
      c("trait_ids") ? (s(), te(ne, {
        key: 2,
        traits: R.value,
        tools: P.value,
        selected: u.value,
        label: "Limit which capabilities it can turn on",
        "empty-message": "All available capabilities are allowed.",
        onChange: U
      }, null, 8, ["traits", "tools", "selected"])) : p("", !0),
      c("trait_ids") ? (s(), i("p", xe, "Leave the limits empty to allow all available capabilities.")) : p("", !0)
    ]));
  }
}), Ce = {
  type: "object",
  properties: {
    schema: {
      type: "object",
      description: "Capability context schema; controls the available configuration fields."
    },
    config: {
      type: "object",
      description: "Capability context: { namespaces: string[], trait_ids: string[], inject_trait_catalog: boolean }"
    }
  }
};
class we extends F {
  static get wippyConfig() {
    return {
      propsSchema: Ce,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: le
    };
  }
  static get vueConfig() {
    return { rootComponent: ye, plugins: [G] };
  }
}
ae(import.meta.url, we);
//# sourceMappingURL=master_picker.js.map
