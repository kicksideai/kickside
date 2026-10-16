import { g as ie, h as re, W as ce, P as ue } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as de, ref as o, computed as ve, watch as pe, openBlock as r, createElementBlock as u, createElementVNode as s, createVNode as l, unref as n, createTextVNode as $, toDisplayString as p, withDirectives as K, vModelText as O, withCtx as f, normalizeClass as C, createCommentVNode as _, createBlock as P, Fragment as he, renderList as ke, withKeys as H, withModifiers as U } from "vue";
import { Icon as c } from "@iconify/vue";
import { s as h, _ as me, e as z, l as ge } from "./toolCatalog-B7JOn9aF.js";
import { host as ye, api as T, loadByTagName as be, define as fe } from "@wippy-fe/proxy";
import { W as Ce } from "./trait-presentation-BWGyO4dN.js";
import { s as _e } from "./styles-CiCzyjUM.js";
const xe = () => ie(), we = { class: "kx" }, $e = { class: "kx-head" }, Ee = { class: "kx-head-icon" }, Ne = { class: "kx-head-actions" }, Te = { class: "kx-count" }, Le = { class: "kx-search" }, Se = {
  key: 0,
  class: "kx-err"
}, Ve = {
  key: 1,
  class: "kx-background-run",
  "aria-label": "Background agent run"
}, Re = ["readonly"], Be = {
  key: 2,
  role: "alert"
}, Ae = { class: "kx-body" }, De = {
  key: 0,
  class: "kx-loading"
}, Pe = {
  key: 1,
  class: "kx-empty"
}, Ue = { class: "kx-empty-ico" }, ze = {
  key: 2,
  class: "kx-empty"
}, Me = {
  key: 3,
  class: "kx-grid"
}, We = ["onClick", "onKeydown"], Ie = { class: "kx-card-head" }, Ke = { class: "kx-ficon" }, Oe = { class: "kx-card-id" }, He = ["title"], je = {
  key: 0,
  class: "kx-card-meta"
}, qe = ["title"], Je = { class: "kx-card-desc" }, Fe = ["disabled", "onClick", "title"], Ge = /* @__PURE__ */ de({
  __name: "agents",
  setup(j) {
    const L = o(!1), m = o(""), d = o([]), S = o(""), V = o([]), R = o([]), E = o([]), q = xe();
    function J(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function F(e) {
      return e ? e.startsWith("class:") ? J(e.slice(6)) : E.value.find((a) => a.name === e)?.title || e : "";
    }
    function G(e) {
      return !!e && e.startsWith("class:");
    }
    const M = ve(() => {
      const e = S.value.trim().toLowerCase();
      return e ? d.value.filter(
        (a) => (a.title || "").toLowerCase().includes(e) || (a.description || "").toLowerCase().includes(e)
      ) : d.value;
    });
    async function B() {
      L.value = !0, m.value = "";
      try {
        const { data: e } = await T.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        d.value = e.agents || [];
      } catch (e) {
        d.value = [], m.value = z(e, "could not load agents");
      } finally {
        L.value = !1;
      }
    }
    async function Q() {
      try {
        const { data: e } = await T.get("/api/v1/agents/traits");
        V.value = e?.success ? e.traits || [] : [];
      } catch {
        V.value = [];
      }
      try {
        R.value = await ge();
      } catch {
        R.value = [];
      }
      try {
        const { data: e } = await T.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        E.value = e?.success ? e.models || [] : [];
      } catch {
        E.value = [];
      }
    }
    function X(e) {
      e.start_token && q("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const v = o(null), g = o(""), k = o(null), y = o("");
    function W(e) {
      return ((e.access_level || 0) & 2) !== 0;
    }
    function Y(e) {
      W(e) && (v.value = { ...e }, g.value = "", k.value = null, y.value = "");
    }
    function Z() {
      v.value = null, k.value = null, y.value = "";
    }
    function ee() {
      !v.value || !g.value.trim() || k.value || (k.value = {
        parent: v.value.id,
        title: `Run ${v.value.title || "agent"}`,
        target: JSON.stringify({ kind: "agent", agent_id: v.value.id, prompt: g.value })
      });
    }
    function te(e) {
      y.value = z(e, "Could not launch the background task");
    }
    const x = o(!1), A = o(null);
    function I() {
      A.value = null, x.value = !0;
    }
    function N(e) {
      A.value = e.id, x.value = !0;
    }
    function ae() {
      x.value = !1, B();
    }
    async function se(e) {
      if (await ye.confirm({
        header: "Delete agent",
        message: `Delete “${e.title || "(untitled)"}”? This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        m.value = "";
        try {
          const { data: t } = await T.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          await B();
        } catch (t) {
          m.value = z(t, "delete failed");
        }
      }
    }
    const w = o(!1), D = o(null), b = o(null);
    function ne(e) {
      D.value = e, w.value = !0;
    }
    function le() {
      w.value = !1, D.value = null;
    }
    async function oe() {
      const e = D.value;
      if (!b.value || !e) return;
      if (b.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await be("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const a = document.createElement("kickside-share");
      a.setAttribute("config", JSON.stringify({
        resource_id: e.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(e.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(e.id)}`,
        title: e.title || ""
      })), a.style.display = "block", a.addEventListener("close", le), b.value.appendChild(a);
    }
    return pe([w, b], async () => {
      w.value && b.value && await oe();
    }), re(async () => {
      await Promise.all([B(), Q()]);
    }), (e, a) => (r(), u("div", we, [
      s("header", $e, [
        s("div", Ee, [
          l(n(c), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        a[5] || (a[5] = s("div", { class: "kx-head-text" }, [
          s("h1", { class: "kx-title" }, "Agents"),
          s("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        s("div", Ne, [
          s("span", Te, [
            l(n(c), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            $(" " + p(d.value.length) + " agent" + p(d.value.length !== 1 ? "s" : ""), 1)
          ]),
          s("div", Le, [
            l(n(c), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            K(s("input", {
              "onUpdate:modelValue": a[0] || (a[0] = (t) => S.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [O, S.value]
            ])
          ]),
          l(n(h), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: I
          }, {
            icon: f(({ class: t }) => [
              l(n(c), {
                icon: "tabler:plus",
                class: C(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      m.value ? (r(), u("div", Se, p(m.value), 1)) : _("", !0),
      v.value ? (r(), u("section", Ve, [
        s("header", null, [
          s("h2", null, "Run " + p(v.value.title || "agent") + " in background", 1),
          l(n(h), {
            type: "button",
            label: "Close background run",
            severity: "secondary",
            outlined: "",
            onClick: Z
          })
        ]),
        a[7] || (a[7] = s("p", null, "The task runs with its selected account's current access. Its recorded human authorizer still needs access and permission to select that account.", -1)),
        s("label", null, [
          a[6] || (a[6] = $("Task prompt", -1)),
          K(s("textarea", {
            "onUpdate:modelValue": a[1] || (a[1] = (t) => g.value = t),
            "aria-label": "Task prompt",
            readonly: !!k.value,
            rows: "4"
          }, null, 8, Re), [
            [O, g.value]
          ])
        ]),
        k.value ? (r(), P(Ce, {
          key: 1,
          tag: "wc-manual-task-launcher",
          attrs: k.value,
          onError: te,
          onCreated: a[2] || (a[2] = (t) => y.value = "")
        }, null, 8, ["attrs"])) : (r(), P(n(h), {
          key: 0,
          type: "button",
          label: "Prepare background run",
          disabled: !g.value.trim(),
          onClick: ee
        }, null, 8, ["disabled"])),
        y.value ? (r(), u("p", Be, p(y.value), 1)) : _("", !0)
      ])) : _("", !0),
      s("div", Ae, [
        L.value && !d.value.length ? (r(), u("div", De, [
          l(n(c), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          a[8] || (a[8] = $(" Loading… ", -1))
        ])) : d.value.length ? M.value.length ? (r(), u("div", Me, [
          (r(!0), u(he, null, ke(M.value, (t) => (r(), u("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (i) => N(t),
            onKeydown: [
              H((i) => N(t), ["enter"]),
              H(U((i) => N(t), ["prevent"]), ["space"])
            ]
          }, [
            s("div", Ie, [
              s("span", Ke, [
                l(n(c), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              s("div", Oe, [
                s("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, p(t.title || "(untitled)"), 9, He),
                t.model ? (r(), u("div", je, [
                  s("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    l(n(c), {
                      icon: G(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    $(" " + p(F(t.model)), 1)
                  ], 8, qe)
                ])) : _("", !0)
              ]),
              s("div", {
                class: "kx-card-actions",
                onClick: a[3] || (a[3] = U(() => {
                }, ["stop"]))
              }, [
                W(t) ? (r(), P(n(h), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Run in background",
                  "aria-label": `Run ${t.title} in background`,
                  onClick: (i) => Y(t)
                }, {
                  icon: f(({ class: i }) => [
                    l(n(c), {
                      icon: "tabler:player-play",
                      class: C(i),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"])) : _("", !0),
                l(n(h), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (i) => N(t)
                }, {
                  icon: f(({ class: i }) => [
                    l(n(c), {
                      icon: "tabler:pencil",
                      class: C(i),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"]),
                l(n(h), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.title}`,
                  onClick: (i) => ne(t)
                }, {
                  icon: f(({ class: i }) => [
                    l(n(c), {
                      icon: "tabler:share",
                      class: C(i),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"]),
                l(n(h), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.title}`,
                  onClick: (i) => se(t)
                }, {
                  icon: f(({ class: i }) => [
                    l(n(c), {
                      icon: "tabler:trash",
                      class: C(i),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"])
              ])
            ]),
            s("div", Je, p(t.description || "No description"), 1),
            s("button", {
              class: "kx-card-chat",
              disabled: !t.start_token,
              onClick: U((i) => X(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              l(n(c), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              a[12] || (a[12] = $(" Chat ", -1))
            ], 8, Fe)
          ], 40, We))), 128))
        ])) : (r(), u("div", ze, [...a[11] || (a[11] = [
          s("div", { class: "kx-empty-title" }, "No matches", -1),
          s("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (r(), u("div", Pe, [
          s("div", Ue, [
            l(n(c), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          a[9] || (a[9] = s("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          a[10] || (a[10] = s("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          l(n(h), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: I
          }, {
            icon: f(({ class: t }) => [
              l(n(c), {
                icon: "tabler:plus",
                class: C(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      l(me, {
        open: x.value,
        "agent-id": A.value,
        traits: V.value,
        tools: R.value,
        models: E.value,
        agents: d.value,
        onClose: a[4] || (a[4] = (t) => x.value = !1),
        onSaved: ae
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      w.value ? (r(), u("div", {
        key: 2,
        ref_key: "shareHost",
        ref: b
      }, null, 512)) : _("", !0)
    ]));
  }
}), Qe = { props: { type: "object", properties: {} } }, Xe = {
  wippy: Qe
};
class Ye extends ce {
  static get wippyConfig() {
    return {
      propsSchema: Xe.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: _e
    };
  }
  static get vueConfig() {
    return { rootComponent: Ge, plugins: [ue] };
  }
}
fe(import.meta.url, Ye);
//# sourceMappingURL=index.js.map
