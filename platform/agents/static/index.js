import { g as te, h as ne, W as se, P as ae } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as H, computed as O, openBlock as m, createElementBlock as f, withModifiers as $, Fragment as M, createElementVNode as s, createTextVNode as T, toDisplayString as C, createCommentVNode as L, createVNode as i, unref as r, watch as q, onBeforeUnmount as oe, ref as y, withDirectives as ie, vModelText as le, withCtx as S, normalizeClass as N, renderList as re, withKeys as W } from "vue";
import { s as w, e as V, _ as ce, l as de } from "./toolCatalog-BlyBDd4C.js";
import { s as ue } from "./index-BvJc5yvO.js";
import { _ as pe } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as ve, api as A, host as F, loadByTagName as me, define as fe } from "@wippy-fe/proxy";
import { Icon as g } from "@iconify/vue";
import { s as he } from "./styles-CN0_5BM1.js";
const ge = { key: 0 }, ye = /* @__PURE__ */ H({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(a) {
    const p = a, v = O(() => !p.state.deletion_job || ["dead", "cancelled"].includes(p.state.deletion_job.status));
    return (o, c) => a.state.deleting_at ? (m(), f("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: c[1] || (c[1] = $(() => {
      }, ["stop"])),
      onKeydown: c[2] || (c[2] = $(() => {
      }, ["stop"]))
    }, [
      v.value ? (m(), f(M, { key: 0 }, [
        s("span", null, [
          c[3] || (c[3] = T("Deletion failed", -1)),
          a.state.deletion_job?.last_error ? (m(), f("span", ge, ": " + C(a.state.deletion_job.last_error), 1)) : L("", !0)
        ]),
        i(r(w), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: c[0] || (c[0] = $((u) => o.$emit("retry"), ["stop"]))
        })
      ], 64)) : (m(), f(M, { key: 1 }, [
        i(r(ue), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        c[4] || (c[4] = s("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : L("", !0);
  }
}), ke = /* @__PURE__ */ pe(ye, [["__scopeId", "data-v-13f5648e"]]);
function j(a) {
  return !!a && typeof a == "object" && !Array.isArray(a);
}
function _e(a, p) {
  return a;
}
function be(a, p, v) {
  const o = j(a) ? a : {}, c = [
    o,
    j(o.data) ? o.data : null,
    j(o.payload) ? o.payload : null,
    j(o.detail) ? o.detail : null
  ].filter(Boolean);
  for (const u of c) {
    if (u.event !== "component.meta.changed" && u.event !== "component.deleting" && u.event !== "component.deleted") continue;
    const k = String(u.component_id || ""), l = String(o.topic || u.topic || "");
    if (!k && (!l.startsWith("component.") || l === "component.")) continue;
    const d = k || p || l.slice(10);
    return u.event !== "component.meta.changed" ? { event: u.event, component_id: d } : {
      event: "component.meta.changed",
      component_id: d,
      meta: _e(j(u.meta) ? u.meta : {}),
      deleted: Array.isArray(u.deleted) ? u.deleted.map(String) : []
    };
  }
  return null;
}
function Ce(a, p) {
  const v = be(a, p);
  return v && v.event !== "component.meta.changed" ? v : null;
}
function xe(a, p, v) {
  let o = !0;
  async function c(l) {
    try {
      const { data: d } = await A.get(`/api/v1/components/${encodeURIComponent(p(l))}`);
      if (!d?.success) throw new Error(V(d, "Could not read deletion progress"));
      o && a.value.includes(l) && (l.deleting_at = d.deleting_at, l.deletion_job_id = d.deletion_job_id, l.deletion_job = d.deletion_job);
    } catch (d) {
      o && a.value.includes(l) && F.handleError("other", { message: V(d, "Could not read deletion progress") });
    }
  }
  const u = q(() => a.value, (l, d = []) => {
    for (const _ of d) l.some((b) => p(b) === p(_));
    for (const _ of l) _.deleting_at && c(_);
  }, { immediate: !0 }), k = ve("@message", (l) => {
    const d = Ce(l);
    if (!d) return;
    const _ = a.value.find((b) => p(b) === d.component_id);
    _ && (d.event === "component.deleted" ? a.value = a.value.filter((b) => p(b) !== d.component_id) : c(_));
  });
  oe(() => {
    o = !1, u(), typeof k == "function" && k();
  });
}
const we = () => te(), $e = { class: "kx" }, Ee = { class: "kx-head" }, De = { class: "kx-head-icon" }, Se = { class: "kx-head-actions" }, Ne = { class: "kx-count" }, je = { class: "kx-search" }, Te = {
  key: 0,
  class: "kx-err"
}, Ae = { class: "kx-body" }, Le = {
  key: 0,
  class: "kx-loading"
}, Re = {
  key: 1,
  class: "kx-empty"
}, Ve = { class: "kx-empty-ico" }, Ue = {
  key: 2,
  class: "kx-empty"
}, Ie = {
  key: 3,
  class: "kx-grid"
}, Ke = ["onClick", "onKeydown"], Me = { class: "kx-card-head" }, ze = { class: "kx-ficon" }, Be = { class: "kx-card-id" }, Pe = ["title"], We = {
  key: 0,
  class: "kx-card-meta"
}, He = ["title"], Oe = { class: "kx-card-desc" }, qe = ["disabled", "onClick", "title"], Fe = /* @__PURE__ */ H({
  __name: "agents",
  setup(a) {
    const p = y(!1), v = y(""), o = y([]), c = y(""), u = y([]), k = y([]), l = y([]), d = we();
    function _(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function b(e) {
      return e ? e.startsWith("class:") ? _(e.slice(6)) : l.value.find((n) => n.name === e)?.title || e : "";
    }
    function J(e) {
      return !!e && e.startsWith("class:");
    }
    const z = O(() => {
      const e = c.value.trim().toLowerCase();
      return e ? o.value.filter(
        (n) => (n.title || "").toLowerCase().includes(e) || (n.description || "").toLowerCase().includes(e)
      ) : o.value;
    });
    async function U() {
      p.value = !0, v.value = "";
      try {
        const { data: e } = await A.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        o.value = e.agents || [];
      } catch (e) {
        v.value = V(e, "could not load agents");
      } finally {
        p.value = !1;
      }
    }
    async function G() {
      try {
        const { data: e } = await A.get("/api/v1/agents/traits");
        u.value = e?.success ? e.traits || [] : [];
      } catch {
        u.value = [];
      }
      try {
        k.value = await de();
      } catch {
        k.value = [];
      }
      try {
        const { data: e } = await A.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        l.value = e?.success ? e.models || [] : [];
      } catch {
        l.value = [];
      }
    }
    function Q(e) {
      e.start_token && d("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const E = y(!1), I = y(null);
    function B() {
      I.value = null, E.value = !0;
    }
    function R(e) {
      I.value = e.id, E.value = !0;
    }
    function X() {
      E.value = !1, U();
    }
    async function P(e) {
      if (await F.confirm({
        header: "Delete agent",
        message: `Delete “${e.title || "(untitled)"}”? This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        v.value = "";
        try {
          const { data: t } = await A.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          await U();
        } catch (t) {
          v.value = V(t, "delete failed");
        }
      }
    }
    const D = y(!1), K = y(null), x = y(null);
    function Y(e) {
      K.value = e, D.value = !0;
    }
    function Z() {
      D.value = !1, K.value = null;
    }
    async function ee() {
      const e = K.value;
      if (!x.value || !e) return;
      if (x.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await me("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const n = document.createElement("kickside-share");
      n.setAttribute("config", JSON.stringify({
        resource_id: e.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(e.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(e.id)}`,
        title: e.title || ""
      })), n.style.display = "block", n.addEventListener("close", Z), x.value.appendChild(n);
    }
    return q([D, x], async () => {
      D.value && x.value && await ee();
    }), ne(async () => {
      await Promise.all([U(), G()]);
    }), xe(o, (e) => e.id), (e, n) => (m(), f("div", $e, [
      s("header", Ee, [
        s("div", De, [
          i(r(g), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        n[3] || (n[3] = s("div", { class: "kx-head-text" }, [
          s("h1", { class: "kx-title" }, "Agents"),
          s("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        s("div", Se, [
          s("span", Ne, [
            i(r(g), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            T(" " + C(o.value.length) + " agent" + C(o.value.length !== 1 ? "s" : ""), 1)
          ]),
          s("div", je, [
            i(r(g), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            ie(s("input", {
              "onUpdate:modelValue": n[0] || (n[0] = (t) => c.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [le, c.value]
            ])
          ]),
          i(r(w), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: B
          }, {
            icon: S(({ class: t }) => [
              i(r(g), {
                icon: "tabler:plus",
                class: N(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      v.value ? (m(), f("div", Te, C(v.value), 1)) : L("", !0),
      s("div", Ae, [
        p.value && !o.value.length ? (m(), f("div", Le, [
          i(r(g), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          n[4] || (n[4] = T(" Loading… ", -1))
        ])) : o.value.length ? z.value.length ? (m(), f("div", Ie, [
          (m(!0), f(M, null, re(z.value, (t) => (m(), f("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (h) => !t.deleting_at && R(t),
            onKeydown: [
              W((h) => !t.deleting_at && R(t), ["enter"]),
              W($((h) => !t.deleting_at && R(t), ["prevent"]), ["space"])
            ]
          }, [
            i(ke, {
              state: t,
              onRetry: (h) => P(t)
            }, null, 8, ["state", "onRetry"]),
            s("div", Me, [
              s("span", ze, [
                i(r(g), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              s("div", Be, [
                s("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, C(t.title || "(untitled)"), 9, Pe),
                t.model ? (m(), f("div", We, [
                  s("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    i(r(g), {
                      icon: J(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    T(" " + C(b(t.model)), 1)
                  ], 8, He)
                ])) : L("", !0)
              ]),
              s("div", {
                class: "kx-card-actions",
                onClick: n[1] || (n[1] = $(() => {
                }, ["stop"]))
              }, [
                i(r(w), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (h) => !t.deleting_at && R(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: S(({ class: h }) => [
                    i(r(g), {
                      icon: "tabler:pencil",
                      class: N(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                i(r(w), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.title}`,
                  onClick: (h) => Y(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: S(({ class: h }) => [
                    i(r(g), {
                      icon: "tabler:share",
                      class: N(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                i(r(w), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.title}`,
                  onClick: (h) => P(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: S(({ class: h }) => [
                    i(r(g), {
                      icon: "tabler:trash",
                      class: N(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            s("div", Oe, C(t.description || "No description"), 1),
            s("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: $((h) => Q(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              i(r(g), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              n[8] || (n[8] = T(" Chat ", -1))
            ], 8, qe)
          ], 40, Ke))), 128))
        ])) : (m(), f("div", Ue, [...n[7] || (n[7] = [
          s("div", { class: "kx-empty-title" }, "No matches", -1),
          s("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (m(), f("div", Re, [
          s("div", Ve, [
            i(r(g), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          n[5] || (n[5] = s("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          n[6] || (n[6] = s("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          i(r(w), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: B
          }, {
            icon: S(({ class: t }) => [
              i(r(g), {
                icon: "tabler:plus",
                class: N(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      i(ce, {
        open: E.value,
        "agent-id": I.value,
        traits: u.value,
        tools: k.value,
        models: l.value,
        agents: o.value,
        onClose: n[2] || (n[2] = (t) => E.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      D.value ? (m(), f("div", {
        key: 1,
        ref_key: "shareHost",
        ref: x
      }, null, 512)) : L("", !0)
    ]));
  }
}), Je = { props: { type: "object", properties: {} } }, Ge = {
  wippy: Je
};
class Qe extends se {
  static get wippyConfig() {
    return {
      propsSchema: Ge.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: he
    };
  }
  static get vueConfig() {
    return { rootComponent: Fe, plugins: [ae] };
  }
}
fe(import.meta.url, Qe);
//# sourceMappingURL=index.js.map
