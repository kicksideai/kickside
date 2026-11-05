import { g as ne, h as oe, W as se, P as ae } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as F, computed as J, openBlock as h, createElementBlock as _, withModifiers as N, Fragment as P, createElementVNode as i, createTextVNode as V, toDisplayString as j, createCommentVNode as I, createVNode as d, unref as p, watch as G, onBeforeUnmount as ie, ref as k, withDirectives as le, vModelText as re, withCtx as A, normalizeClass as L, renderList as ce, withKeys as q } from "vue";
import { s as S, e as K, _ as de, l as ue } from "./toolCatalog-BlyBDd4C.js";
import { s as pe } from "./index-BvJc5yvO.js";
import { _ as me } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as ve, api as U, host as Q, loadByTagName as fe, define as ge } from "@wippy-fe/proxy";
import { Icon as b } from "@iconify/vue";
import { s as he } from "./styles-CN0_5BM1.js";
const _e = { key: 0 }, ye = /* @__PURE__ */ F({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(s) {
    const l = s, g = J(() => l.state.deletion_job === null || ["dead", "cancelled"].includes(l.state.deletion_job?.status || ""));
    return (r, u) => s.state.deleting_at ? (h(), _("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: u[1] || (u[1] = N(() => {
      }, ["stop"])),
      onKeydown: u[2] || (u[2] = N(() => {
      }, ["stop"]))
    }, [
      g.value ? (h(), _(P, { key: 0 }, [
        i("span", null, [
          u[3] || (u[3] = V("Deletion failed", -1)),
          s.state.deletion_job?.last_error ? (h(), _("span", _e, ": " + j(s.state.deletion_job.last_error), 1)) : I("", !0)
        ]),
        d(p(S), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: u[0] || (u[0] = N((a) => r.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), _(P, { key: 1 }, [
        d(p(pe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        u[4] || (u[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : I("", !0);
  }
}), be = /* @__PURE__ */ me(ye, [["__scopeId", "data-v-69a579d4"]]);
function R(s) {
  return !!s && typeof s == "object" && !Array.isArray(s);
}
function ke(s, l) {
  return s;
}
function Ce(s, l, g) {
  const r = R(s) ? s : {}, u = [
    r,
    R(r.data) ? r.data : null,
    R(r.payload) ? r.payload : null,
    R(r.detail) ? r.detail : null
  ].filter(Boolean);
  for (const a of u) {
    if (a.event !== "component.meta.changed" && a.event !== "component.deleting" && a.event !== "component.deleted") continue;
    const x = String(a.component_id || ""), C = String(r.topic || a.topic || "");
    if (!x && (!C.startsWith("component.") || C === "component.")) continue;
    const $ = x || l || C.slice(10);
    return a.event !== "component.meta.changed" ? { event: a.event, component_id: $ } : {
      event: "component.meta.changed",
      component_id: $,
      meta: ke(R(a.meta) ? a.meta : {}),
      deleted: Array.isArray(a.deleted) ? a.deleted.map(String) : []
    };
  }
  return null;
}
function xe(s, l) {
  const g = Ce(s, l);
  return g && g.event !== "component.meta.changed" ? g : null;
}
function we(s, l, g) {
  let r = !0;
  const u = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
  function x(f, m) {
    const c = s.value.find((D) => l(D) === f), n = a.get(f), v = {
      deleting_at: n?.deleting_at || c?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: m?.job_id || n?.deletion_job_id || c?.deletion_job_id
    };
    a.set(f, v), c && (Object.assign(c, v), c.deletion_job = void 0);
  }
  async function C(f) {
    const m = l(f), c = a.get(m), n = () => r && s.value.includes(f) && a.get(m) === c;
    try {
      const { data: v } = await U.get(`/api/v1/components/${encodeURIComponent(m)}`);
      if (!v?.success) throw new Error(K(v, "Could not read deletion progress"));
      n() && (f.deleting_at = c?.deleting_at || v.deleting_at, f.deletion_job_id = c?.deletion_job_id || v.deletion_job_id, c && (c.deletion_job_id = f.deletion_job_id), f.deletion_job = v.deletion_job ?? null);
    } catch (v) {
      n() && Q.handleError("other", { message: K(v, "Could not read deletion progress") });
    }
  }
  const $ = G(() => s.value, (f, m = []) => {
    const c = f.filter((n) => !u.has(l(n)));
    for (const n of m) !u.has(l(n)) && c.some((v) => l(v) === l(n));
    for (const n of a.keys()) c.some((v) => l(v) === n) || a.delete(n);
    if (c.length !== f.length) {
      s.value = c;
      return;
    }
    for (const n of f) {
      const v = a.get(l(n));
      v && Object.assign(n, v);
      const D = m.find((w) => l(w) === l(n));
      n.deletion_job === void 0 && D?.deletion_job_id === n.deletion_job_id && (n.deletion_job = D?.deletion_job), n.deleting_at && C(n);
    }
  }, { immediate: !0 }), M = ve("@message", (f) => {
    const m = xe(f);
    if (!m) return;
    const c = s.value.find((n) => l(n) === m.component_id);
    m.event === "component.deleted" ? (c && u.has(m.component_id), u.add(m.component_id), a.delete(m.component_id), s.value = s.value.filter((n) => l(n) !== m.component_id)) : c && (x(m.component_id), C(c));
  });
  return ie(() => {
    r = !1, $(), typeof M == "function" && M();
  }), { acceptDeletion: x };
}
const je = () => ne(), $e = { class: "kx" }, De = { class: "kx-head" }, Ee = { class: "kx-head-icon" }, Se = { class: "kx-head-actions" }, Ne = { class: "kx-count" }, Te = { class: "kx-search" }, Ae = {
  key: 0,
  class: "kx-err"
}, Le = { class: "kx-body" }, Re = {
  key: 0,
  class: "kx-loading"
}, Ve = {
  key: 1,
  class: "kx-empty"
}, Ue = { class: "kx-empty-ico" }, Ie = {
  key: 2,
  class: "kx-empty"
}, Me = {
  key: 3,
  class: "kx-grid"
}, Oe = ["onClick", "onKeydown"], Ke = { class: "kx-card-head" }, ze = { class: "kx-ficon" }, Be = { class: "kx-card-id" }, Pe = ["title"], We = {
  key: 0,
  class: "kx-card-meta"
}, He = ["title"], qe = { class: "kx-card-desc" }, Fe = ["disabled", "onClick", "title"], Je = /* @__PURE__ */ F({
  __name: "agents",
  setup(s) {
    const l = k(!1), g = k(""), r = k([]), u = k(""), a = k([]), x = k([]), C = k([]), $ = je();
    function M(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function f(e) {
      return e ? e.startsWith("class:") ? M(e.slice(6)) : C.value.find((o) => o.name === e)?.title || e : "";
    }
    function m(e) {
      return !!e && e.startsWith("class:");
    }
    const c = J(() => {
      const e = u.value.trim().toLowerCase();
      return e ? r.value.filter(
        (o) => (o.title || "").toLowerCase().includes(e) || (o.description || "").toLowerCase().includes(e)
      ) : r.value;
    });
    async function n() {
      l.value = !0, g.value = "";
      try {
        const { data: e } = await U.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        r.value = e.agents || [];
      } catch (e) {
        g.value = K(e, "could not load agents");
      } finally {
        l.value = !1;
      }
    }
    async function v() {
      try {
        const { data: e } = await U.get("/api/v1/agents/traits");
        a.value = e?.success ? e.traits || [] : [];
      } catch {
        a.value = [];
      }
      try {
        x.value = await ue();
      } catch {
        x.value = [];
      }
      try {
        const { data: e } = await U.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        C.value = e?.success ? e.models || [] : [];
      } catch {
        C.value = [];
      }
    }
    function D(e) {
      e.start_token && $("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const w = k(!1), z = k(null);
    function W() {
      z.value = null, w.value = !0;
    }
    function O(e) {
      z.value = e.id, w.value = !0;
    }
    function X() {
      w.value = !1, n();
    }
    async function H(e) {
      if (await Q.confirm({
        header: "Delete agent",
        message: `Delete “${e.title || "(untitled)"}”? This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        g.value = "";
        try {
          const { data: t } = await U.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          te(e.id, t), await n();
        } catch (t) {
          g.value = K(t, "delete failed");
        }
      }
    }
    const T = k(!1), B = k(null), E = k(null);
    function Y(e) {
      B.value = e, T.value = !0;
    }
    function Z() {
      T.value = !1, B.value = null;
    }
    async function ee() {
      const e = B.value;
      if (!E.value || !e) return;
      if (E.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await fe("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const o = document.createElement("kickside-share");
      o.setAttribute("config", JSON.stringify({
        resource_id: e.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(e.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(e.id)}`,
        title: e.title || ""
      })), o.style.display = "block", o.addEventListener("close", Z), E.value.appendChild(o);
    }
    G([T, E], async () => {
      T.value && E.value && await ee();
    }), oe(async () => {
      await Promise.all([n(), v()]);
    });
    const { acceptDeletion: te } = we(r, (e) => e.id);
    return (e, o) => (h(), _("div", $e, [
      i("header", De, [
        i("div", Ee, [
          d(p(b), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Agents"),
          i("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        i("div", Se, [
          i("span", Ne, [
            d(p(b), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            V(" " + j(r.value.length) + " agent" + j(r.value.length !== 1 ? "s" : ""), 1)
          ]),
          i("div", Te, [
            d(p(b), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            le(i("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (t) => u.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [re, u.value]
            ])
          ]),
          d(p(S), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: W
          }, {
            icon: A(({ class: t }) => [
              d(p(b), {
                icon: "tabler:plus",
                class: L(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      g.value ? (h(), _("div", Ae, j(g.value), 1)) : I("", !0),
      i("div", Le, [
        l.value && !r.value.length ? (h(), _("div", Re, [
          d(p(b), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[4] || (o[4] = V(" Loading… ", -1))
        ])) : r.value.length ? c.value.length ? (h(), _("div", Me, [
          (h(!0), _(P, null, ce(c.value, (t) => (h(), _("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (y) => !t.deleting_at && O(t),
            onKeydown: [
              q((y) => !t.deleting_at && O(t), ["enter"]),
              q(N((y) => !t.deleting_at && O(t), ["prevent"]), ["space"])
            ]
          }, [
            d(be, {
              state: t,
              onRetry: (y) => H(t)
            }, null, 8, ["state", "onRetry"]),
            i("div", Ke, [
              i("span", ze, [
                d(p(b), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              i("div", Be, [
                i("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, j(t.title || "(untitled)"), 9, Pe),
                t.model ? (h(), _("div", We, [
                  i("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    d(p(b), {
                      icon: m(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    V(" " + j(f(t.model)), 1)
                  ], 8, He)
                ])) : I("", !0)
              ]),
              i("div", {
                class: "kx-card-actions",
                onClick: o[1] || (o[1] = N(() => {
                }, ["stop"]))
              }, [
                d(p(S), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (y) => !t.deleting_at && O(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: y }) => [
                    d(p(b), {
                      icon: "tabler:pencil",
                      class: L(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                d(p(S), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.title}`,
                  onClick: (y) => Y(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: y }) => [
                    d(p(b), {
                      icon: "tabler:share",
                      class: L(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                d(p(S), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.title}`,
                  onClick: (y) => H(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: y }) => [
                    d(p(b), {
                      icon: "tabler:trash",
                      class: L(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            i("div", qe, j(t.description || "No description"), 1),
            i("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: N((y) => D(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              d(p(b), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              o[8] || (o[8] = V(" Chat ", -1))
            ], 8, Fe)
          ], 40, Oe))), 128))
        ])) : (h(), _("div", Ie, [...o[7] || (o[7] = [
          i("div", { class: "kx-empty-title" }, "No matches", -1),
          i("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (h(), _("div", Ve, [
          i("div", Ue, [
            d(p(b), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          o[5] || (o[5] = i("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          o[6] || (o[6] = i("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          d(p(S), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: W
          }, {
            icon: A(({ class: t }) => [
              d(p(b), {
                icon: "tabler:plus",
                class: L(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      d(de, {
        open: w.value,
        "agent-id": z.value,
        traits: a.value,
        tools: x.value,
        models: C.value,
        agents: r.value,
        onClose: o[2] || (o[2] = (t) => w.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      T.value ? (h(), _("div", {
        key: 1,
        ref_key: "shareHost",
        ref: E
      }, null, 512)) : I("", !0)
    ]));
  }
}), Ge = { props: { type: "object", properties: {} } }, Qe = {
  wippy: Ge
};
class Xe extends se {
  static get wippyConfig() {
    return {
      propsSchema: Qe.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: he
    };
  }
  static get vueConfig() {
    return { rootComponent: Je, plugins: [ae] };
  }
}
ge(import.meta.url, Xe);
//# sourceMappingURL=index.js.map
