import { g as ne, h as oe, W as se, P as ae } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as F, computed as J, openBlock as h, createElementBlock as _, withModifiers as N, Fragment as P, createElementVNode as a, createTextVNode as V, toDisplayString as j, createCommentVNode as M, createVNode as d, unref as p, watch as G, onBeforeUnmount as ie, ref as k, withDirectives as le, vModelText as re, withCtx as A, normalizeClass as L, renderList as de, withKeys as q } from "vue";
import { s as S, e as K, _ as ce, l as ue } from "./toolCatalog-BlyBDd4C.js";
import { s as pe } from "./index-BvJc5yvO.js";
import { _ as ve } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as me, api as U, host as Q, loadByTagName as fe, define as ge } from "@wippy-fe/proxy";
import { Icon as y } from "@iconify/vue";
import { s as he } from "./styles-CN0_5BM1.js";
const _e = { key: 0 }, be = /* @__PURE__ */ F({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(s) {
    const i = s, g = J(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (l, c) => s.state.deleting_at ? (h(), _("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: c[1] || (c[1] = N(() => {
      }, ["stop"])),
      onKeydown: c[2] || (c[2] = N(() => {
      }, ["stop"]))
    }, [
      g.value ? (h(), _(P, { key: 0 }, [
        a("span", null, [
          c[3] || (c[3] = V("Deletion failed", -1)),
          s.state.deletion_job?.last_error ? (h(), _("span", _e, ": " + j(s.state.deletion_job.last_error), 1)) : M("", !0)
        ]),
        d(p(S), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: c[0] || (c[0] = N((r) => l.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), _(P, { key: 1 }, [
        d(p(pe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        c[4] || (c[4] = a("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : M("", !0);
  }
}), ye = /* @__PURE__ */ ve(be, [["__scopeId", "data-v-69a579d4"]]);
function R(s) {
  return !!s && typeof s == "object" && !Array.isArray(s);
}
function ke(s, i) {
  return s;
}
function Ce(s, i, g) {
  const l = R(s) ? s : {}, c = [
    l,
    R(l.data) ? l.data : null,
    R(l.payload) ? l.payload : null,
    R(l.detail) ? l.detail : null
  ].filter(Boolean);
  for (const r of c) {
    if (r.event !== "component.meta.changed" && r.event !== "component.deleting" && r.event !== "component.deleted") continue;
    const x = String(r.component_id || ""), C = String(l.topic || r.topic || "");
    if (!x && (!C.startsWith("component.") || C === "component.")) continue;
    const $ = x || i || C.slice(10);
    return r.event !== "component.meta.changed" ? { event: r.event, component_id: $ } : {
      event: "component.meta.changed",
      component_id: $,
      meta: ke(R(r.meta) ? r.meta : {}),
      deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
    };
  }
  return null;
}
function xe(s, i) {
  const g = Ce(s, i);
  return g && g.event !== "component.meta.changed" ? g : null;
}
function we(s, i, g) {
  let l = !0;
  const c = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  function x(m, v) {
    const u = s.value.find((D) => i(D) === m), n = r.get(m), f = {
      deleting_at: n?.deleting_at || u?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: v?.job_id || n?.deletion_job_id || u?.deletion_job_id
    };
    r.set(m, f), u && (Object.assign(u, f), u.deletion_job = void 0);
  }
  async function C(m) {
    const v = i(m), u = r.get(v), n = () => l && s.value.includes(m) && r.get(v) === u;
    try {
      const { data: f } = await U.get(`/api/v1/components/${encodeURIComponent(v)}`);
      if (!f?.success) throw new Error(K(f, "Could not read deletion progress"));
      n() && (m.deleting_at = u?.deleting_at || f.deleting_at, m.deletion_job_id = f.deletion_job_id, u && (u.deletion_job_id = m.deletion_job_id), m.deletion_job = f.deletion_job ?? null);
    } catch (f) {
      n() && Q.handleError("other", { message: K(f, "Could not read deletion progress") });
    }
  }
  const $ = G(() => s.value, (m, v = []) => {
    const u = m.filter((n) => !c.has(i(n)));
    for (const n of v) !c.has(i(n)) && u.some((f) => i(f) === i(n));
    if (u.length !== m.length) {
      s.value = u;
      return;
    }
    for (const n of m) {
      const f = r.get(i(n));
      f && (n.deletion_job_id !== f.deletion_job_id && (n.deletion_job = void 0), Object.assign(n, f));
      const D = v.find((w) => i(w) === i(n));
      n.deletion_job === void 0 && D?.deletion_job_id === n.deletion_job_id && (n.deletion_job = D?.deletion_job), n.deleting_at && C(n);
    }
  }, { immediate: !0 }), O = me("@message", (m) => {
    const v = xe(m);
    if (!v) return;
    const u = s.value.find((n) => i(n) === v.component_id);
    v.event === "component.deleted" ? (u && c.has(v.component_id), c.add(v.component_id), r.delete(v.component_id), s.value = s.value.filter((n) => i(n) !== v.component_id)) : u && (x(v.component_id), C(u));
  });
  return ie(() => {
    l = !1, $(), typeof O == "function" && O();
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
}, Ue = { class: "kx-empty-ico" }, Me = {
  key: 2,
  class: "kx-empty"
}, Oe = {
  key: 3,
  class: "kx-grid"
}, Ie = ["onClick", "onKeydown"], Ke = { class: "kx-card-head" }, ze = { class: "kx-ficon" }, Be = { class: "kx-card-id" }, Pe = ["title"], We = {
  key: 0,
  class: "kx-card-meta"
}, He = ["title"], qe = { class: "kx-card-desc" }, Fe = ["disabled", "onClick", "title"], Je = /* @__PURE__ */ F({
  __name: "agents",
  setup(s) {
    const i = k(!1), g = k(""), l = k([]), c = k(""), r = k([]), x = k([]), C = k([]), $ = je();
    function O(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function m(e) {
      return e ? e.startsWith("class:") ? O(e.slice(6)) : C.value.find((o) => o.name === e)?.title || e : "";
    }
    function v(e) {
      return !!e && e.startsWith("class:");
    }
    const u = J(() => {
      const e = c.value.trim().toLowerCase();
      return e ? l.value.filter(
        (o) => (o.title || "").toLowerCase().includes(e) || (o.description || "").toLowerCase().includes(e)
      ) : l.value;
    });
    async function n() {
      i.value = !0, g.value = "";
      try {
        const { data: e } = await U.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        l.value = e.agents || [];
      } catch (e) {
        g.value = K(e, "could not load agents");
      } finally {
        i.value = !1;
      }
    }
    async function f() {
      try {
        const { data: e } = await U.get("/api/v1/agents/traits");
        r.value = e?.success ? e.traits || [] : [];
      } catch {
        r.value = [];
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
    function I(e) {
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
      await Promise.all([n(), f()]);
    });
    const { acceptDeletion: te } = we(l, (e) => e.id);
    return (e, o) => (h(), _("div", $e, [
      a("header", De, [
        a("div", Ee, [
          d(p(y), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = a("div", { class: "kx-head-text" }, [
          a("h1", { class: "kx-title" }, "Agents"),
          a("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        a("div", Se, [
          a("span", Ne, [
            d(p(y), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            V(" " + j(l.value.length) + " agent" + j(l.value.length !== 1 ? "s" : ""), 1)
          ]),
          a("div", Te, [
            d(p(y), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            le(a("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (t) => c.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [re, c.value]
            ])
          ]),
          d(p(S), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: W
          }, {
            icon: A(({ class: t }) => [
              d(p(y), {
                icon: "tabler:plus",
                class: L(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      g.value ? (h(), _("div", Ae, j(g.value), 1)) : M("", !0),
      a("div", Le, [
        i.value && !l.value.length ? (h(), _("div", Re, [
          d(p(y), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[4] || (o[4] = V(" Loading… ", -1))
        ])) : l.value.length ? u.value.length ? (h(), _("div", Oe, [
          (h(!0), _(P, null, de(u.value, (t) => (h(), _("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (b) => !t.deleting_at && I(t),
            onKeydown: [
              q((b) => !t.deleting_at && I(t), ["enter"]),
              q(N((b) => !t.deleting_at && I(t), ["prevent"]), ["space"])
            ]
          }, [
            d(ye, {
              state: t,
              onRetry: (b) => H(t)
            }, null, 8, ["state", "onRetry"]),
            a("div", Ke, [
              a("span", ze, [
                d(p(y), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              a("div", Be, [
                a("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, j(t.title || "(untitled)"), 9, Pe),
                t.model ? (h(), _("div", We, [
                  a("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    d(p(y), {
                      icon: v(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    V(" " + j(m(t.model)), 1)
                  ], 8, He)
                ])) : M("", !0)
              ]),
              a("div", {
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
                  onClick: (b) => !t.deleting_at && I(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: b }) => [
                    d(p(y), {
                      icon: "tabler:pencil",
                      class: L(b),
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
                  onClick: (b) => Y(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: b }) => [
                    d(p(y), {
                      icon: "tabler:share",
                      class: L(b),
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
                  onClick: (b) => H(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: b }) => [
                    d(p(y), {
                      icon: "tabler:trash",
                      class: L(b),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            a("div", qe, j(t.description || "No description"), 1),
            a("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: N((b) => D(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              d(p(y), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              o[8] || (o[8] = V(" Chat ", -1))
            ], 8, Fe)
          ], 40, Ie))), 128))
        ])) : (h(), _("div", Me, [...o[7] || (o[7] = [
          a("div", { class: "kx-empty-title" }, "No matches", -1),
          a("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (h(), _("div", Ve, [
          a("div", Ue, [
            d(p(y), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          o[5] || (o[5] = a("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          o[6] || (o[6] = a("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          d(p(S), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: W
          }, {
            icon: A(({ class: t }) => [
              d(p(y), {
                icon: "tabler:plus",
                class: L(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      d(ce, {
        open: w.value,
        "agent-id": z.value,
        traits: r.value,
        tools: x.value,
        models: C.value,
        agents: l.value,
        onClose: o[2] || (o[2] = (t) => w.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      T.value ? (h(), _("div", {
        key: 1,
        ref_key: "shareHost",
        ref: E
      }, null, 512)) : M("", !0)
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
