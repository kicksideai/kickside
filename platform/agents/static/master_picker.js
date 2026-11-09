import { u as D, g as H, W as z, P as F } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as G, ref as r, watch as J, onMounted as Q, computed as V, openBlock as i, createElementBlock as l, createElementVNode as s, Fragment as v, renderList as y, createTextVNode as X, toDisplayString as C, createVNode as u, unref as _, createCommentVNode as $, withCtx as Y, normalizeClass as Z } from "vue";
import { Icon as g } from "@iconify/vue";
import { api as L, define as ee } from "@wippy-fe/proxy";
import { l as te, _ as ae } from "./toolCatalog-zaiNPgZH.js";
import { _ as se } from "./trait-presentation-SeG51N48.js";
import { s as ne } from "./styles-Bc_MQ_X7.js";
const ie = { class: "kx-ns" }, le = { class: "kx-ns-toggle" }, oe = ["checked"], re = { class: "kx-ns-section" }, ce = { class: "kx-ns-chips" }, ue = ["aria-label", "onClick"], pe = {
  key: 0,
  class: "kx-ns-empty"
}, de = { class: "kx-ns-add" }, me = ["aria-expanded"], ve = {
  class: "kx-ns-menu",
  role: "listbox"
}, _e = { class: "kx-ns-group" }, ge = ["aria-selected", "onClick"], fe = { class: "kx-ns-opt-label" }, ke = {
  key: 0,
  class: "kx-ns-menu-empty"
}, he = /* @__PURE__ */ G({
  __name: "MasterNamespacePicker",
  setup(O) {
    const w = D(), T = H();
    function f(e) {
      return Array.isArray(e) ? e.filter((t) => typeof t == "string" && t !== "") : [];
    }
    function A(e) {
      return Array.isArray(e) ? { namespaces: f(e), trait_ids: [], inject_trait_catalog: !1 } : {
        namespaces: f(e?.namespaces),
        trait_ids: f(e?.trait_ids),
        inject_trait_catalog: e?.inject_trait_catalog === !0
      };
    }
    const k = A(w.value.config), n = r(k.namespaces || []), c = r(k.trait_ids || []), p = r(!!k.inject_trait_catalog), h = r([]), b = r([]), N = r([]), d = r(!1), j = r(null);
    J(() => w.value.config, (e) => {
      const t = A(e);
      n.value = t.namespaces || [], c.value = t.trait_ids || [], p.value = !!t.inject_trait_catalog;
    }), Q(async () => {
      const [e, t, a] = await Promise.all([
        L.get("/api/v1/agents/namespaces"),
        L.get("/api/v1/agents/traits"),
        te()
      ]);
      h.value = e.data.namespaces, b.value = t.data.traits, N.value = a;
    });
    const S = { agent: "Agents", trait: "Capabilities" }, E = V(
      () => ["agent", "trait"].map((e) => ({ kind: e, label: S[e] || e, items: h.value.filter((t) => t.kind === e) })).filter((e) => e.items.length)
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
    const R = V(() => [
      ...b.value.filter((e) => M(e.id) || c.value.includes(e.id)),
      ...c.value.filter((e) => !b.value.some((t) => t.id === e)).map((e) => ({ id: e }))
    ]), P = (e) => h.value.find((t) => t.id === e)?.label || e, x = (e) => n.value.includes(e);
    function m() {
      T("config-changed", {
        namespaces: [...n.value],
        trait_ids: [...c.value],
        inject_trait_catalog: p.value
      });
    }
    function B(e) {
      const t = n.value.indexOf(e);
      t >= 0 ? n.value.splice(t, 1) : n.value.push(e), m();
    }
    function K(e) {
      c.value = e, m();
    }
    function U(e) {
      n.value.splice(e, 1), m();
    }
    function W() {
      p.value = !p.value, m();
    }
    return (e, t) => (i(), l("div", ie, [
      s("label", le, [
        s("input", {
          class: "kx-ns-switch-input",
          type: "checkbox",
          checked: p.value,
          onChange: W
        }, null, 40, oe),
        t[2] || (t[2] = s("span", {
          class: "kx-ns-switch",
          "aria-hidden": "true"
        }, null, -1)),
        t[3] || (t[3] = s("span", null, "Show available capabilities in the prompt", -1))
      ]),
      s("div", re, [
        t[5] || (t[5] = s("div", { class: "kx-ns-label" }, "Limit which packages it can use", -1)),
        s("div", ce, [
          (i(!0), l(v, null, y(n.value, (a, o) => (i(), l("span", {
            key: a,
            class: "kx-ns-chip"
          }, [
            X(C(P(a)) + " ", 1),
            s("button", {
              type: "button",
              class: "kx-ns-x",
              "aria-label": `Remove ${P(a)} package limit`,
              onClick: (q) => U(o)
            }, [
              u(_(g), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ], 8, ue)
          ]))), 128)),
          n.value.length === 0 ? (i(), l("span", pe, "All packages")) : $("", !0)
        ]),
        s("div", de, [
          s("button", {
            ref_key: "nsAnchorEl",
            ref: j,
            type: "button",
            class: "kx-ns-btn",
            "aria-haspopup": "listbox",
            "aria-expanded": d.value,
            onClick: t[0] || (t[0] = (a) => d.value = !d.value)
          }, [
            u(_(g), {
              icon: "tabler:plus",
              "aria-hidden": "true"
            }),
            t[4] || (t[4] = s("span", null, "Choose packages", -1)),
            u(_(g), {
              icon: "tabler:chevron-down",
              class: "kx-ns-caret",
              "aria-hidden": "true"
            })
          ], 8, me),
          u(se, {
            open: d.value,
            "onUpdate:open": t[1] || (t[1] = (a) => d.value = a),
            anchor: j.value,
            "min-width": 240
          }, {
            default: Y(() => [
              s("div", ve, [
                (i(!0), l(v, null, y(E.value, (a) => (i(), l(v, {
                  key: a.kind
                }, [
                  s("div", _e, C(a.label), 1),
                  (i(!0), l(v, null, y(a.items, (o) => (i(), l("button", {
                    key: o.id,
                    type: "button",
                    class: Z(["kx-ns-opt", x(o.id) && "kx-ns-opt-on"]),
                    role: "option",
                    "aria-selected": x(o.id),
                    onClick: (q) => B(o.id)
                  }, [
                    u(_(g), {
                      icon: x(o.id) ? "tabler:square-check-filled" : "tabler:square",
                      class: "kx-ns-check",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    s("span", fe, C(o.label), 1)
                  ], 10, ge))), 128))
                ], 64))), 128)),
                E.value.length ? $("", !0) : (i(), l("div", ke, "No packages available."))
              ])
            ]),
            _: 1
          }, 8, ["open", "anchor"])
        ])
      ]),
      u(ae, {
        traits: R.value,
        tools: N.value,
        selected: c.value,
        label: "Limit which capabilities it can turn on",
        "empty-message": "All available capabilities are allowed.",
        onChange: K
      }, null, 8, ["traits", "tools", "selected"]),
      t[6] || (t[6] = s("p", { class: "kx-ns-hint" }, "Leave the limits empty to allow all available capabilities.", -1))
    ]));
  }
}), be = {
  type: "object",
  properties: {
    config: {
      type: "object",
      description: "Capability context: { namespaces: string[], trait_ids: string[], inject_trait_catalog: boolean }"
    }
  }
};
class xe extends z {
  static get wippyConfig() {
    return {
      propsSchema: be,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ne
    };
  }
  static get vueConfig() {
    return { rootComponent: he, plugins: [F] };
  }
}
ee(import.meta.url, xe);
//# sourceMappingURL=master_picker.js.map
