import { f as j, r as D, b as M, W, s as q, P as z } from "./styles-FbmmpE4z.js";
import { defineComponent as F, ref as l, computed as x, onMounted as G, openBlock as s, createElementBlock as i, createVNode as d, unref as r, createElementVNode as n, Fragment as y, toDisplayString as m, createTextVNode as H, renderList as E, normalizeClass as L, createCommentVNode as O, withDirectives as J, vModelText as Q, createBlock as R } from "vue";
import { Icon as u } from "@iconify/vue";
import { api as P, define as X } from "@wippy-fe/proxy";
import { _ as Y } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-kTT7ighW.js";
const Z = { class: "conn-page oc" }, ee = {
  key: 0,
  class: "oc-loading"
}, oe = {
  key: 0,
  class: "oc-error"
}, te = { class: "oc-error-body" }, ne = { class: "oc-error-sub" }, se = {
  key: 0,
  class: "oc-block"
}, ie = { class: "oc-conns" }, re = { class: "oc-conn-ico" }, ae = { class: "oc-conn-name" }, ce = { class: "oc-block" }, le = { class: "oc-head-row" }, de = { class: "oc-head" }, ue = { class: "oc-search" }, ve = {
  key: 0,
  class: "oc-grid"
}, pe = ["onClick"], me = { class: "oc-tile-ico" }, he = { class: "oc-tile-body" }, fe = { class: "oc-tile-name" }, be = { class: "oc-tile-auth" }, ye = {
  key: 1,
  class: "oc-empty"
}, _e = { class: "oc-foot" }, ke = /* @__PURE__ */ F({
  __name: "Onboard",
  setup($) {
    const _ = j(), a = l([]), p = l([]), k = l(!0), h = l(""), g = l(""), f = l(!1), w = l(void 0), v = (o) => o.provider ?? "", b = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", B = (o) => o.icon || "tabler:plug", K = (o) => !!(o.credential_schema && !o.oauth_provider);
    function N(o) {
      const e = {};
      for (const t of o) {
        const c = v(t);
        c && (e[c] = e[c] ? { ...t, ...e[c] } : t);
      }
      return Object.values(e);
    }
    const V = x(() => new Set(a.value.map((o) => o.provider).filter(Boolean))), S = x(() => {
      const o = g.value.trim().toLowerCase();
      return p.value.filter((e) => !o || b(e).toLowerCase().includes(o) || (e.group || "").toLowerCase().includes(o)).sort((e, t) => b(e).localeCompare(b(t)));
    });
    function A(o) {
      return o.icon || p.value.find((e) => v(e) === o.provider)?.icon || "tabler:plug-connected";
    }
    function I(o) {
      return D(o.connection_state, o.expires_at) === "connected";
    }
    async function C() {
      k.value = !0, h.value = "";
      try {
        const [o, e, t] = await Promise.all([
          P.get("/api/v1/connections?limit=100&offset=0").then((c) => c.data),
          P.get("/api/v1/oauth/providers/discover"),
          P.get("/api/v1/connections/providers/discover")
        ]);
        a.value = o.connections ?? [], p.value = N([
          ...e.data?.providers ?? [],
          ...t.data?.providers ?? []
        ]);
      } catch (o) {
        h.value = M(o), a.value = [], p.value = [];
      } finally {
        k.value = !1;
      }
    }
    function T(o) {
      w.value = o, f.value = !0;
    }
    async function U() {
      f.value = !1, await C();
    }
    return G(C), (o, e) => (s(), i("div", Z, [
      k.value ? (s(), i("div", ee, [
        d(r(u), {
          icon: "tabler:loader-2",
          class: "spin"
        }),
        e[5] || (e[5] = n("span", null, "Loading services…", -1))
      ])) : (s(), i(y, { key: 1 }, [
        h.value ? (s(), i("div", oe, [
          d(r(u), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          n("div", te, [
            e[6] || (e[6] = n("div", { class: "oc-error-title" }, "Couldn't load services", -1)),
            n("div", ne, m(h.value), 1)
          ]),
          n("button", {
            type: "button",
            class: "oc-btn oc-primary",
            onClick: C
          }, [
            d(r(u), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            e[7] || (e[7] = H(" Try again ", -1))
          ])
        ])) : (s(), i(y, { key: 1 }, [
          a.value.length ? (s(), i("div", se, [
            e[8] || (e[8] = n("div", { class: "oc-head" }, "Connected", -1)),
            n("div", ie, [
              (s(!0), i(y, null, E(a.value, (t) => (s(), i("div", {
                key: t.component_id,
                class: "oc-conn"
              }, [
                n("span", re, [
                  d(r(u), {
                    icon: A(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                n("span", ae, m(t.name || t.provider), 1),
                n("span", {
                  class: L(["oc-dot", { ok: I(t) }])
                }, null, 2)
              ]))), 128))
            ])
          ])) : O("", !0),
          n("div", ce, [
            n("div", le, [
              n("span", de, m(a.value.length ? "Add more" : "Available services"), 1),
              n("div", ue, [
                d(r(u), {
                  icon: "tabler:search",
                  class: "oc-search-ico",
                  "aria-hidden": "true"
                }),
                J(n("input", {
                  "onUpdate:modelValue": e[0] || (e[0] = (t) => g.value = t),
                  placeholder: "Search services",
                  "aria-label": "Search services"
                }, null, 512), [
                  [Q, g.value]
                ])
              ])
            ]),
            S.value.length ? (s(), i("div", ve, [
              (s(!0), i(y, null, E(S.value, (t) => (s(), i("button", {
                key: v(t),
                type: "button",
                class: L(["oc-tile", { done: V.value.has(v(t)) }]),
                onClick: (c) => T(v(t))
              }, [
                n("span", me, [
                  d(r(u), {
                    icon: B(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                n("span", he, [
                  n("span", fe, m(b(t)), 1),
                  n("span", be, m(K(t) ? "API key" : "OAuth"), 1)
                ]),
                d(r(u), {
                  icon: V.value.has(v(t)) ? "tabler:circle-check" : "tabler:plus",
                  class: "oc-tile-add",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 10, pe))), 128))
            ])) : (s(), i("div", ye, "No connectable services are configured yet."))
          ])
        ], 64)),
        n("div", _e, [
          n("button", {
            type: "button",
            class: "oc-btn oc-ghost",
            onClick: e[1] || (e[1] = (t) => r(_)("back", void 0))
          }, "‹ Back"),
          e[9] || (e[9] = n("span", { class: "oc-foot-sp" }, null, -1)),
          a.value.length ? (s(), i("button", {
            key: 0,
            type: "button",
            class: "oc-btn oc-primary",
            onClick: e[2] || (e[2] = (t) => r(_)("done", void 0))
          }, "Continue ›")) : (s(), i("button", {
            key: 1,
            type: "button",
            class: "oc-btn oc-ghost",
            onClick: e[3] || (e[3] = (t) => r(_)("done", void 0))
          }, "Skip for now"))
        ])
      ], 64)),
      f.value ? (s(), R(Y, {
        key: 2,
        providers: p.value,
        provider: w.value,
        onConnected: U,
        onClose: e[4] || (e[4] = (t) => f.value = !1)
      }, null, 8, ["providers", "provider"])) : O("", !0)
    ]));
  }
});
class ge extends W {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "iframeCssUrl", "primeVueCssUrl"],
      inlineCss: q
    };
  }
  static get vueConfig() {
    return { rootComponent: ke, plugins: [z] };
  }
}
X(import.meta.url, ge);
//# sourceMappingURL=onboard.js.map
