import { defineComponent as D, ref as l, computed as $, onMounted as M, openBlock as s, createElementBlock as r, createVNode as d, unref as a, createElementVNode as n, Fragment as f, toDisplayString as m, createTextVNode as j, renderList as x, normalizeClass as B, createCommentVNode as N, withDirectives as q, vModelText as z, createBlock as F } from "vue";
import { Icon as u } from "@iconify/vue";
import { api as w } from "@wippy-fe/proxy";
import { u as U, r as G, a as H } from "./status-BfNJewNy.js";
import { _ as J } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-qkDdnskl.js";
const Q = { class: "conn-page oc" }, R = {
  key: 0,
  class: "oc-loading"
}, W = {
  key: 0,
  class: "oc-error"
}, X = { class: "oc-error-body" }, Y = { class: "oc-error-sub" }, Z = {
  key: 0,
  class: "oc-block"
}, ee = { class: "oc-conns" }, oe = { class: "oc-conn-ico" }, te = { class: "oc-conn-name" }, ne = { class: "oc-block" }, se = { class: "oc-head-row" }, re = { class: "oc-head" }, ae = { class: "oc-search" }, ie = {
  key: 0,
  class: "oc-grid"
}, ce = ["onClick"], le = { class: "oc-tile-ico" }, de = { class: "oc-tile-body" }, ue = { class: "oc-tile-name" }, ve = { class: "oc-tile-auth" }, pe = {
  key: 1,
  class: "oc-empty"
}, me = { class: "oc-foot" }, ge = /* @__PURE__ */ D({
  __name: "Onboard",
  setup(_e) {
    const k = U(), i = l([]), p = l([]), y = l(!0), _ = l(""), g = l(""), h = l(!1), P = l(void 0), v = (o) => o.provider ?? "", b = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", O = (o) => o.icon || "tabler:plug", V = (o) => !!(o.credential_schema && !o.oauth_provider);
    function A(o) {
      const e = {};
      for (const t of o) {
        const c = v(t);
        c && (e[c] = e[c] ? { ...t, ...e[c] } : t);
      }
      return Object.values(e);
    }
    const L = $(() => new Set(i.value.map((o) => o.provider).filter(Boolean))), S = $(() => {
      const o = g.value.trim().toLowerCase();
      return p.value.filter((e) => !o || b(e).toLowerCase().includes(o) || (e.group || "").toLowerCase().includes(o)).sort((e, t) => b(e).localeCompare(b(t)));
    });
    function E(o) {
      return o.icon || p.value.find((e) => v(e) === o.provider)?.icon || "tabler:plug-connected";
    }
    function I(o) {
      return G(o.connection_state, o.expires_at) === "connected";
    }
    async function C() {
      y.value = !0, _.value = "";
      try {
        const [o, e, t] = await Promise.all([
          w.get("/api/v1/connections?limit=100&offset=0").then((c) => c.data),
          w.get("/api/v1/oauth/providers/discover"),
          w.get("/api/v1/connections/providers/discover")
        ]);
        i.value = o.connections ?? [], p.value = A([
          ...e.data?.providers ?? [],
          ...t.data?.providers ?? []
        ]);
      } catch (o) {
        _.value = H(o), i.value = [], p.value = [];
      } finally {
        y.value = !1;
      }
    }
    function K(o) {
      P.value = o, h.value = !0;
    }
    async function T() {
      h.value = !1, await C();
    }
    return M(C), (o, e) => (s(), r("div", Q, [
      y.value ? (s(), r("div", R, [
        d(a(u), {
          icon: "tabler:loader-2",
          class: "spin"
        }),
        e[5] || (e[5] = n("span", null, "Loading services…", -1))
      ])) : (s(), r(f, { key: 1 }, [
        _.value ? (s(), r("div", W, [
          d(a(u), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          n("div", X, [
            e[6] || (e[6] = n("div", { class: "oc-error-title" }, "Couldn't load services", -1)),
            n("div", Y, m(_.value), 1)
          ]),
          n("button", {
            type: "button",
            class: "oc-btn oc-primary",
            onClick: C
          }, [
            d(a(u), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            e[7] || (e[7] = j(" Try again ", -1))
          ])
        ])) : (s(), r(f, { key: 1 }, [
          i.value.length ? (s(), r("div", Z, [
            e[8] || (e[8] = n("div", { class: "oc-head" }, "Connected", -1)),
            n("div", ee, [
              (s(!0), r(f, null, x(i.value, (t) => (s(), r("div", {
                key: t.component_id,
                class: "oc-conn"
              }, [
                n("span", oe, [
                  d(a(u), {
                    icon: E(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                n("span", te, m(t.name || t.provider), 1),
                n("span", {
                  class: B(["oc-dot", { ok: I(t) }])
                }, null, 2)
              ]))), 128))
            ])
          ])) : N("", !0),
          n("div", ne, [
            n("div", se, [
              n("span", re, m(i.value.length ? "Add more" : "Available services"), 1),
              n("div", ae, [
                d(a(u), {
                  icon: "tabler:search",
                  class: "oc-search-ico",
                  "aria-hidden": "true"
                }),
                q(n("input", {
                  "onUpdate:modelValue": e[0] || (e[0] = (t) => g.value = t),
                  placeholder: "Search services",
                  "aria-label": "Search services"
                }, null, 512), [
                  [z, g.value]
                ])
              ])
            ]),
            S.value.length ? (s(), r("div", ie, [
              (s(!0), r(f, null, x(S.value, (t) => (s(), r("button", {
                key: v(t),
                type: "button",
                class: B(["oc-tile", { done: L.value.has(v(t)) }]),
                onClick: (c) => K(v(t))
              }, [
                n("span", le, [
                  d(a(u), {
                    icon: O(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                n("span", de, [
                  n("span", ue, m(b(t)), 1),
                  n("span", ve, m(V(t) ? "API key" : "OAuth"), 1)
                ]),
                d(a(u), {
                  icon: L.value.has(v(t)) ? "tabler:circle-check" : "tabler:plus",
                  class: "oc-tile-add",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 10, ce))), 128))
            ])) : (s(), r("div", pe, "No connectable services are configured yet."))
          ])
        ], 64)),
        n("div", me, [
          n("button", {
            type: "button",
            class: "oc-btn oc-ghost",
            onClick: e[1] || (e[1] = (t) => a(k)("back", void 0))
          }, "‹ Back"),
          e[9] || (e[9] = n("span", { class: "oc-foot-sp" }, null, -1)),
          i.value.length ? (s(), r("button", {
            key: 0,
            type: "button",
            class: "oc-btn oc-primary",
            onClick: e[2] || (e[2] = (t) => a(k)("done", void 0))
          }, "Continue ›")) : (s(), r("button", {
            key: 1,
            type: "button",
            class: "oc-btn oc-ghost",
            onClick: e[3] || (e[3] = (t) => a(k)("done", void 0))
          }, "Skip for now"))
        ])
      ], 64)),
      h.value ? (s(), F(J, {
        key: 2,
        providers: p.value,
        provider: P.value,
        onConnected: T,
        onClose: e[4] || (e[4] = (t) => h.value = !1)
      }, null, 8, ["providers", "provider"])) : N("", !0)
    ]));
  }
});
export {
  ge as default
};
//# sourceMappingURL=Onboard-DKSyiYo4.js.map
