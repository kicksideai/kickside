import { W as H, P as z } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as F, ref as r, watch as G, onMounted as J, computed as $, openBlock as i, createElementBlock as l, createElementVNode as s, Fragment as v, renderList as y, createTextVNode as Q, toDisplayString as C, createVNode as u, unref as g, createCommentVNode as L, withCtx as X, normalizeClass as Y } from "vue";
import { Icon as _ } from "@iconify/vue";
import { api as O, define as Z } from "@wippy-fe/proxy";
import { l as ee, _ as te } from "./toolCatalog-zaiNPgZH.js";
import { _ as ae } from "./trait-presentation-SeG51N48.js";
import { s as se } from "./styles-Bc_MQ_X7.js";
const ne = { class: "kx-ns" }, ie = { class: "kx-ns-toggle" }, le = ["checked"], oe = { class: "kx-ns-section" }, re = { class: "kx-ns-chips" }, ce = ["aria-label", "onClick"], ue = {
  key: 0,
  class: "kx-ns-empty"
}, pe = { class: "kx-ns-add" }, de = ["aria-expanded"], me = {
  class: "kx-ns-menu",
  role: "listbox"
}, ve = { class: "kx-ns-group" }, ge = ["aria-selected", "onClick"], _e = { class: "kx-ns-opt-label" }, fe = {
  key: 0,
  class: "kx-ns-menu-empty"
}, he = /* @__PURE__ */ F({
  __name: "MasterNamespacePicker",
  props: {
    config: {}
  },
  emits: ["config-changed"],
  setup(w, { emit: T }) {
    const A = w, S = T;
    function f(e) {
      return Array.isArray(e) ? e.filter((t) => typeof t == "string" && t !== "") : [];
    }
    function N(e) {
      return Array.isArray(e) ? { namespaces: f(e), trait_ids: [], inject_trait_catalog: !1 } : {
        namespaces: f(e?.namespaces),
        trait_ids: f(e?.trait_ids),
        inject_trait_catalog: e?.inject_trait_catalog === !0
      };
    }
    const h = N(A.config), n = r(h.namespaces || []), c = r(h.trait_ids || []), p = r(!!h.inject_trait_catalog), k = r([]), b = r([]), j = r([]), d = r(!1), E = r(null);
    G(() => A.config, (e) => {
      const t = N(e);
      n.value = t.namespaces || [], c.value = t.trait_ids || [], p.value = !!t.inject_trait_catalog;
    }), J(async () => {
      const [e, t, a] = await Promise.all([
        O.get("/api/v1/agents/namespaces"),
        O.get("/api/v1/agents/traits"),
        ee()
      ]);
      k.value = e.data.namespaces, b.value = t.data.traits, j.value = a;
    });
    const I = { agent: "Agents", trait: "Capabilities" }, P = $(
      () => ["agent", "trait"].map((e) => ({ kind: e, label: I[e] || e, items: k.value.filter((t) => t.kind === e) })).filter((e) => e.items.length)
    );
    function M(e) {
      const t = e.lastIndexOf(":");
      return t > 0 ? e.slice(0, t) : "";
    }
    function R(e) {
      if (!n.value.length || n.value.includes("*")) return !0;
      const t = M(e);
      return t ? n.value.some((a) => t === a || t.startsWith(`${a}.`)) : !1;
    }
    const B = $(() => [
      ...b.value.filter((e) => R(e.id) || c.value.includes(e.id)),
      ...c.value.filter((e) => !b.value.some((t) => t.id === e)).map((e) => ({ id: e }))
    ]), V = (e) => k.value.find((t) => t.id === e)?.label || e, x = (e) => n.value.includes(e);
    function m() {
      S("config-changed", {
        namespaces: [...n.value],
        trait_ids: [...c.value],
        inject_trait_catalog: p.value
      });
    }
    function K(e) {
      const t = n.value.indexOf(e);
      t >= 0 ? n.value.splice(t, 1) : n.value.push(e), m();
    }
    function U(e) {
      c.value = e, m();
    }
    function W(e) {
      n.value.splice(e, 1), m();
    }
    function q() {
      p.value = !p.value, m();
    }
    return (e, t) => (i(), l("div", ne, [
      s("label", ie, [
        s("input", {
          class: "kx-ns-switch-input",
          type: "checkbox",
          checked: p.value,
          onChange: q
        }, null, 40, le),
        t[2] || (t[2] = s("span", {
          class: "kx-ns-switch",
          "aria-hidden": "true"
        }, null, -1)),
        t[3] || (t[3] = s("span", null, "Show available capabilities in the prompt", -1))
      ]),
      s("div", oe, [
        t[5] || (t[5] = s("div", { class: "kx-ns-label" }, "Limit which packages it can use", -1)),
        s("div", re, [
          (i(!0), l(v, null, y(n.value, (a, o) => (i(), l("span", {
            key: a,
            class: "kx-ns-chip"
          }, [
            Q(C(V(a)) + " ", 1),
            s("button", {
              type: "button",
              class: "kx-ns-x",
              "aria-label": `Remove ${V(a)} package limit`,
              onClick: (D) => W(o)
            }, [
              u(g(_), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, ce)
          ]))), 128)),
          n.value.length === 0 ? (i(), l("span", ue, "All packages")) : L("", !0)
        ]),
        s("div", pe, [
          s("button", {
            ref_key: "nsAnchorEl",
            ref: E,
            type: "button",
            class: "kx-ns-btn",
            "aria-haspopup": "listbox",
            "aria-expanded": d.value,
            onClick: t[0] || (t[0] = (a) => d.value = !d.value)
          }, [
            u(g(_), {
              icon: "tabler:plus",
              "aria-hidden": "true"
            }),
            t[4] || (t[4] = s("span", null, "Choose packages", -1)),
            u(g(_), {
              icon: "tabler:chevron-down",
              class: "kx-ns-caret",
              "aria-hidden": "true"
            })
          ], 8, de),
          u(ae, {
            open: d.value,
            "onUpdate:open": t[1] || (t[1] = (a) => d.value = a),
            anchor: E.value,
            "min-width": 240
          }, {
            default: X(() => [
              s("div", me, [
                (i(!0), l(v, null, y(P.value, (a) => (i(), l(v, {
                  key: a.kind
                }, [
                  s("div", ve, C(a.label), 1),
                  (i(!0), l(v, null, y(a.items, (o) => (i(), l("button", {
                    key: o.id,
                    type: "button",
                    class: Y(["kx-ns-opt", x(o.id) && "kx-ns-opt-on"]),
                    role: "option",
                    "aria-selected": x(o.id),
                    onClick: (D) => K(o.id)
                  }, [
                    u(g(_), {
                      icon: x(o.id) ? "tabler:square-check-filled" : "tabler:square",
                      class: "kx-ns-check",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    s("span", _e, C(o.label), 1)
                  ], 10, ge))), 128))
                ], 64))), 128)),
                P.value.length ? L("", !0) : (i(), l("div", fe, "No packages available."))
              ])
            ]),
            _: 1
          }, 8, ["open", "anchor"])
        ])
      ]),
      u(te, {
        traits: B.value,
        tools: j.value,
        selected: c.value,
        label: "Limit which capabilities it can turn on",
        "empty-message": "All available capabilities are allowed.",
        onChange: U
      }, null, 8, ["traits", "tools", "selected"]),
      t[6] || (t[6] = s("p", { class: "kx-ns-hint" }, "Leave the limits empty to allow all available capabilities.", -1))
    ]));
  }
}), ke = {
  type: "object",
  properties: {
    config: {
      type: "object",
      description: "Capability context: { namespaces: string[], trait_ids: string[], inject_trait_catalog: boolean }"
    }
  }
};
class be extends H {
  static get wippyConfig() {
    return {
      propsSchema: ke,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: se
    };
  }
  static get vueConfig() {
    return { rootComponent: he, plugins: [z] };
  }
}
Z(import.meta.url, be);
//# sourceMappingURL=master_picker.js.map
