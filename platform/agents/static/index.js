import { g as G, h as Q, W as X, P as Y } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as Z, ref as r, computed as ee, watch as te, openBlock as c, createElementBlock as d, createElementVNode as a, createVNode as n, unref as i, createTextVNode as C, toDisplayString as h, withDirectives as se, vModelText as ae, withCtx as g, normalizeClass as f, createCommentVNode as V, Fragment as ne, renderList as ie, withKeys as K, withModifiers as D } from "vue";
import { Icon as l } from "@iconify/vue";
import { s as y, _ as le, e as M, l as oe } from "./toolCatalog-B7JOn9aF.js";
import { host as re, api as x, loadByTagName as ce, define as de } from "@wippy-fe/proxy";
import { s as ue } from "./styles-DLTipENZ.js";
const pe = () => G(), ve = { class: "kx" }, he = { class: "kx-head" }, me = { class: "kx-head-icon" }, ke = { class: "kx-head-actions" }, ge = { class: "kx-count" }, fe = { class: "kx-search" }, ye = {
  key: 0,
  class: "kx-err"
}, be = { class: "kx-body" }, _e = {
  key: 0,
  class: "kx-loading"
}, Ce = {
  key: 1,
  class: "kx-empty"
}, xe = { class: "kx-empty-ico" }, we = {
  key: 2,
  class: "kx-empty"
}, $e = {
  key: 3,
  class: "kx-grid"
}, Ee = ["onClick", "onKeydown"], Ne = { class: "kx-card-head" }, Le = { class: "kx-ficon" }, Se = { class: "kx-card-id" }, Te = ["title"], Ve = {
  key: 0,
  class: "kx-card-meta"
}, De = ["title"], Ae = { class: "kx-card-desc" }, Ue = ["disabled", "onClick", "title"], Ke = /* @__PURE__ */ Z({
  __name: "agents",
  setup(P) {
    const w = r(!1), p = r(""), u = r([]), $ = r(""), E = r([]), N = r([]), b = r([]), z = pe();
    function H(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function I(e) {
      return e ? e.startsWith("class:") ? H(e.slice(6)) : b.value.find((s) => s.name === e)?.title || e : "";
    }
    function O(e) {
      return !!e && e.startsWith("class:");
    }
    const A = ee(() => {
      const e = $.value.trim().toLowerCase();
      return e ? u.value.filter(
        (s) => (s.title || "").toLowerCase().includes(e) || (s.description || "").toLowerCase().includes(e)
      ) : u.value;
    });
    async function L() {
      w.value = !0, p.value = "";
      try {
        const { data: e } = await x.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        u.value = e.agents || [];
      } catch (e) {
        u.value = [], p.value = M(e, "could not load agents");
      } finally {
        w.value = !1;
      }
    }
    async function R() {
      try {
        const { data: e } = await x.get("/api/v1/agents/traits");
        E.value = e?.success ? e.traits || [] : [];
      } catch {
        E.value = [];
      }
      try {
        N.value = await oe();
      } catch {
        N.value = [];
      }
      try {
        const { data: e } = await x.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        b.value = e?.success ? e.models || [] : [];
      } catch {
        b.value = [];
      }
    }
    function W(e) {
      e.start_token && z("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const m = r(!1), S = r(null);
    function U() {
      S.value = null, m.value = !0;
    }
    function _(e) {
      S.value = e.id, m.value = !0;
    }
    function B() {
      m.value = !1, L();
    }
    async function j(e) {
      if (await re.confirm({
        header: "Delete agent",
        message: `Delete “${e.title || "(untitled)"}”? This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        p.value = "";
        try {
          const { data: t } = await x.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          await L();
        } catch (t) {
          p.value = M(t, "delete failed");
        }
      }
    }
    const k = r(!1), T = r(null), v = r(null);
    function q(e) {
      T.value = e, k.value = !0;
    }
    function F() {
      k.value = !1, T.value = null;
    }
    async function J() {
      const e = T.value;
      if (!v.value || !e) return;
      if (v.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await ce("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const s = document.createElement("kickside-share");
      s.setAttribute("config", JSON.stringify({
        resource_id: e.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(e.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(e.id)}`,
        title: e.title || ""
      })), s.style.display = "block", s.addEventListener("close", F), v.value.appendChild(s);
    }
    return te([k, v], async () => {
      k.value && v.value && await J();
    }), Q(async () => {
      await Promise.all([L(), R()]);
    }), (e, s) => (c(), d("div", ve, [
      a("header", he, [
        a("div", me, [
          n(i(l), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        s[3] || (s[3] = a("div", { class: "kx-head-text" }, [
          a("h1", { class: "kx-title" }, "Agents"),
          a("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        a("div", ke, [
          a("span", ge, [
            n(i(l), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            C(" " + h(u.value.length) + " agent" + h(u.value.length !== 1 ? "s" : ""), 1)
          ]),
          a("div", fe, [
            n(i(l), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            se(a("input", {
              "onUpdate:modelValue": s[0] || (s[0] = (t) => $.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [ae, $.value]
            ])
          ]),
          n(i(y), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: U
          }, {
            icon: g(({ class: t }) => [
              n(i(l), {
                icon: "tabler:plus",
                class: f(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      p.value ? (c(), d("div", ye, h(p.value), 1)) : V("", !0),
      a("div", be, [
        w.value && !u.value.length ? (c(), d("div", _e, [
          n(i(l), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          s[4] || (s[4] = C(" Loading… ", -1))
        ])) : u.value.length ? A.value.length ? (c(), d("div", $e, [
          (c(!0), d(ne, null, ie(A.value, (t) => (c(), d("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (o) => _(t),
            onKeydown: [
              K((o) => _(t), ["enter"]),
              K(D((o) => _(t), ["prevent"]), ["space"])
            ]
          }, [
            a("div", Ne, [
              a("span", Le, [
                n(i(l), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              a("div", Se, [
                a("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, h(t.title || "(untitled)"), 9, Te),
                t.model ? (c(), d("div", Ve, [
                  a("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    n(i(l), {
                      icon: O(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    C(" " + h(I(t.model)), 1)
                  ], 8, De)
                ])) : V("", !0)
              ]),
              a("div", {
                class: "kx-card-actions",
                onClick: s[1] || (s[1] = D(() => {
                }, ["stop"]))
              }, [
                n(i(y), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (o) => _(t)
                }, {
                  icon: g(({ class: o }) => [
                    n(i(l), {
                      icon: "tabler:pencil",
                      class: f(o),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"]),
                n(i(y), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.title}`,
                  onClick: (o) => q(t)
                }, {
                  icon: g(({ class: o }) => [
                    n(i(l), {
                      icon: "tabler:share",
                      class: f(o),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"]),
                n(i(y), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.title}`,
                  onClick: (o) => j(t)
                }, {
                  icon: g(({ class: o }) => [
                    n(i(l), {
                      icon: "tabler:trash",
                      class: f(o),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"])
              ])
            ]),
            a("div", Ae, h(t.description || "No description"), 1),
            a("button", {
              class: "kx-card-chat",
              disabled: !t.start_token,
              onClick: D((o) => W(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              n(i(l), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              s[8] || (s[8] = C(" Chat ", -1))
            ], 8, Ue)
          ], 40, Ee))), 128))
        ])) : (c(), d("div", we, [...s[7] || (s[7] = [
          a("div", { class: "kx-empty-title" }, "No matches", -1),
          a("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (c(), d("div", Ce, [
          a("div", xe, [
            n(i(l), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          s[5] || (s[5] = a("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          s[6] || (s[6] = a("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          n(i(y), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: U
          }, {
            icon: g(({ class: t }) => [
              n(i(l), {
                icon: "tabler:plus",
                class: f(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      n(le, {
        open: m.value,
        "agent-id": S.value,
        traits: E.value,
        tools: N.value,
        models: b.value,
        agents: u.value,
        onClose: s[2] || (s[2] = (t) => m.value = !1),
        onSaved: B
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      k.value ? (c(), d("div", {
        key: 1,
        ref_key: "shareHost",
        ref: v
      }, null, 512)) : V("", !0)
    ]));
  }
}), Me = { props: { type: "object", properties: {} } }, Pe = {
  wippy: Me
};
class ze extends X {
  static get wippyConfig() {
    return {
      propsSchema: Pe.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ue
    };
  }
  static get vueConfig() {
    return { rootComponent: Ke, plugins: [Y] };
  }
}
de(import.meta.url, ze);
//# sourceMappingURL=index.js.map
