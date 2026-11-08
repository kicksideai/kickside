import { g as oe, h as se, W as ie, P as ae } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as F, computed as G, openBlock as g, createElementBlock as h, withModifiers as N, Fragment as H, createElementVNode as r, createTextVNode as V, toDisplayString as E, createCommentVNode as M, createVNode as c, unref as v, watch as Q, onBeforeUnmount as le, ref as C, withDirectives as re, vModelText as de, withCtx as T, normalizeClass as A, renderList as ce, withKeys as J } from "vue";
import { s as S, e as B, _ as ue } from "./AgentForm.vue_vue_type_script_setup_true_lang-CndyLk_q.js";
import { s as pe } from "./index-BvJc5yvO.js";
import { on as ve, api as U, host as X, loadByTagName as me, define as fe } from "@wippy-fe/proxy";
import { Icon as k } from "@iconify/vue";
import { l as _e } from "./toolCatalog-zaiNPgZH.js";
import { s as ge } from "./styles-Bc_MQ_X7.js";
const he = { key: 0 }, be = /* @__PURE__ */ F({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(s) {
    const i = s, _ = G(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (d, m) => s.state.deleting_at ? (g(), h("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: m[1] || (m[1] = N(() => {
      }, ["stop"])),
      onKeydown: m[2] || (m[2] = N(() => {
      }, ["stop"]))
    }, [
      _.value ? (g(), h(H, { key: 0 }, [
        r("span", null, [
          m[3] || (m[3] = V("Deletion failed", -1)),
          s.state.deletion_job?.last_error ? (g(), h("span", he, ": " + E(s.state.deletion_job.last_error), 1)) : M("", !0)
        ]),
        c(v(S), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: m[0] || (m[0] = N((a) => d.$emit("retry"), ["stop"]))
        })
      ], 64)) : (g(), h(H, { key: 1 }, [
        c(v(pe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        m[4] || (m[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : M("", !0);
  }
});
function R(s) {
  return !!s && typeof s == "object" && !Array.isArray(s);
}
function ye(s, i) {
  return s;
}
function ke(s, i, _) {
  const d = R(s) ? s : {}, m = [
    d,
    R(d.data) ? d.data : null,
    R(d.payload) ? d.payload : null,
    R(d.detail) ? d.detail : null
  ].filter(Boolean);
  for (const a of m) {
    if (a.event !== "component.meta.changed" && a.event !== "component.deleting" && a.event !== "component.deleted") continue;
    const b = String(a.component_id || ""), x = String(d.topic || a.topic || "");
    if (!b && (!x.startsWith("component.") || x === "component.")) continue;
    const $ = b || i || x.slice(10);
    return a.event === "component.deleting" && typeof a.deletion_job_id == "string" && a.deletion_job_id ? { event: a.event, component_id: $, deletion_job_id: a.deletion_job_id } : a.event !== "component.meta.changed" ? { event: a.event, component_id: $ } : {
      event: "component.meta.changed",
      component_id: $,
      meta: ye(R(a.meta) ? a.meta : {}),
      deleted: Array.isArray(a.deleted) ? a.deleted.map(String) : []
    };
  }
  return null;
}
function Ce(s, i) {
  const _ = ke(s, i);
  return _ && _.event !== "component.meta.changed" ? _ : null;
}
function xe(s, i, _, d) {
  let m = !0;
  const a = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Map();
  function x(p, u) {
    const l = s.value.find((K) => i(K) === p), o = b.get(p), f = u?.job_id || o?.deletion_job_id || l?.deletion_job_id, j = o ? o.deletion_job_id : l?.deleting_at ? l.deletion_job_id : void 0;
    if ((o || l?.deleting_at) && f === j) return;
    const w = {
      deleting_at: o?.deleting_at || l?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: f
    };
    b.set(p, w), l && (Object.assign(l, w), l.deletion_job = void 0);
  }
  async function $(p) {
    const u = i(p), l = b.get(u), o = () => m && s.value.includes(p) && b.get(u) === l;
    try {
      const { data: f } = await U.get(`/api/v1/components/${encodeURIComponent(u)}`);
      if (!f?.success) throw new Error(B(f, "Could not read deletion progress"));
      o() && (p.deleting_at = l?.deleting_at || f.deleting_at, p.deletion_job_id = f.deletion_job_id, l && (l.deletion_job_id = p.deletion_job_id), p.deletion_job = f.deletion_job ?? null);
    } catch (f) {
      o() && X.handleError("other", { message: B(f, "Could not read deletion progress") });
    }
  }
  let O = [];
  const P = Q(() => s.value, (p, u = []) => {
    const l = p.filter((o) => !a.has(i(o)));
    for (const o of u)
      a.has(i(o)) || l.some((f) => i(f) === i(o)) || o.deleting_at && d?.(i(o));
    if (l.length !== p.length) {
      s.value = l;
      return;
    }
    for (const o of p) {
      const f = b.get(i(o));
      f && (o.deletion_job_id !== f.deletion_job_id && (o.deletion_job = void 0), Object.assign(o, f));
      const j = u.find((w) => i(w) === i(o));
      o.deletion_job === void 0 && j?.deletion_job_id === o.deletion_job_id && (o.deletion_job = j?.deletion_job), o.deleting_at && !O.includes(o) && $(o);
    }
    O = p;
  }, { immediate: !0 }), I = ve("@message", (p) => {
    const u = Ce(p);
    if (!u) return;
    const l = s.value.find((o) => i(o) === u.component_id);
    u.event === "component.deleted" ? (l && !a.has(u.component_id) && d?.(u.component_id), a.add(u.component_id), b.delete(u.component_id), s.value = s.value.filter((o) => i(o) !== u.component_id)) : l && x(u.component_id, { job_id: u.deletion_job_id });
  });
  return le(() => {
    m = !1, P(), typeof I == "function" && I();
  }), { acceptDeletion: x };
}
const je = () => oe();
function we() {
  let s = 0;
  return () => {
    const i = ++s;
    return () => i === s;
  };
}
const $e = { class: "kx" }, Ee = { class: "kx-head" }, De = { class: "kx-head-icon" }, Se = { class: "kx-head-actions" }, Ne = { class: "kx-count" }, Le = { class: "kx-search" }, Te = {
  key: 0,
  class: "kx-err"
}, Ae = { class: "kx-body" }, Re = {
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
}, He = ["title"], qe = { class: "kx-card-desc" }, Je = ["disabled", "onClick", "title"], Fe = /* @__PURE__ */ F({
  __name: "agents",
  setup(s) {
    const i = C(!1), _ = C(""), d = C([]), m = C(""), a = C([]), b = C([]), x = C([]), $ = je();
    function O(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function P(e) {
      return e ? e.startsWith("class:") ? O(e.slice(6)) : x.value.find((n) => n.name === e)?.title || e : "";
    }
    function I(e) {
      return !!e && e.startsWith("class:");
    }
    const p = G(() => {
      const e = m.value.trim().toLowerCase();
      return e ? d.value.filter(
        (n) => (n.title || "").toLowerCase().includes(e) || (n.description || "").toLowerCase().includes(e)
      ) : d.value;
    }), u = we();
    async function l() {
      const e = u();
      i.value = !0, _.value = "";
      try {
        const { data: n } = await U.get("/api/v1/user-agents");
        if (!n?.success) throw new Error(n?.error || "failed to load agents");
        e() && (d.value = n.agents || []);
      } catch (n) {
        e() && (_.value = B(n, "could not load agents"));
      } finally {
        e() && (i.value = !1);
      }
    }
    async function o() {
      try {
        const { data: e } = await U.get("/api/v1/agents/traits");
        a.value = e?.success ? e.traits || [] : [];
      } catch {
        a.value = [];
      }
      try {
        b.value = await _e();
      } catch {
        b.value = [];
      }
      try {
        const { data: e } = await U.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        x.value = e?.success ? e.models || [] : [];
      } catch {
        x.value = [];
      }
    }
    function f(e) {
      e.start_token && $("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const j = C(!1), w = C(null);
    function K() {
      w.value = null, j.value = !0;
    }
    function z(e) {
      w.value = e.id, j.value = !0;
    }
    function Y() {
      j.value = !1, l();
    }
    async function q(e) {
      if (await X.confirm({
        header: "Delete agent",
        message: `Delete “${e.title || "(untitled)"}”? This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        _.value = "";
        try {
          const { data: t } = await U.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          ne(e.id, t), await l();
        } catch (t) {
          _.value = B(t, "delete failed");
        }
      }
    }
    const L = C(!1), W = C(null), D = C(null);
    function Z(e) {
      W.value = e, L.value = !0;
    }
    function ee() {
      L.value = !1, W.value = null;
    }
    async function te() {
      const e = W.value;
      if (!D.value || !e) return;
      if (D.value.innerHTML = "", !customElements.get("kickside-share"))
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
      })), n.style.display = "block", n.addEventListener("close", ee), D.value.appendChild(n);
    }
    Q([L, D], async () => {
      L.value && D.value && await te();
    }), se(async () => {
      await Promise.all([l(), o()]);
    });
    const { acceptDeletion: ne } = xe(d, (e) => e.id, void 0, l);
    return (e, n) => (g(), h("div", $e, [
      r("header", Ee, [
        r("div", De, [
          c(v(k), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        n[3] || (n[3] = r("div", { class: "kx-head-text" }, [
          r("h1", { class: "kx-title" }, "Agents"),
          r("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        r("div", Se, [
          r("span", Ne, [
            c(v(k), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            V(" " + E(d.value.length) + " agent" + E(d.value.length !== 1 ? "s" : ""), 1)
          ]),
          r("div", Le, [
            c(v(k), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            re(r("input", {
              "onUpdate:modelValue": n[0] || (n[0] = (t) => m.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [de, m.value]
            ])
          ]),
          c(v(S), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: K
          }, {
            icon: T(({ class: t }) => [
              c(v(k), {
                icon: "tabler:plus",
                class: A(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      _.value ? (g(), h("div", Te, E(_.value), 1)) : M("", !0),
      r("div", Ae, [
        i.value && !d.value.length ? (g(), h("div", Re, [
          c(v(k), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          n[4] || (n[4] = V(" Loading… ", -1))
        ])) : d.value.length ? p.value.length ? (g(), h("div", Oe, [
          (g(!0), h(H, null, ce(p.value, (t) => (g(), h("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (y) => !t.deleting_at && z(t),
            onKeydown: [
              J((y) => !t.deleting_at && z(t), ["enter"]),
              J(N((y) => !t.deleting_at && z(t), ["prevent"]), ["space"])
            ]
          }, [
            c(be, {
              state: t,
              onRetry: (y) => q(t)
            }, null, 8, ["state", "onRetry"]),
            r("div", Ke, [
              r("span", ze, [
                c(v(k), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              r("div", Be, [
                r("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, E(t.title || "(untitled)"), 9, Pe),
                t.model ? (g(), h("div", We, [
                  r("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    c(v(k), {
                      icon: I(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    V(" " + E(P(t.model)), 1)
                  ], 8, He)
                ])) : M("", !0)
              ]),
              r("div", {
                class: "kx-card-actions",
                onClick: n[1] || (n[1] = N(() => {
                }, ["stop"]))
              }, [
                c(v(S), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (y) => !t.deleting_at && z(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: T(({ class: y }) => [
                    c(v(k), {
                      icon: "tabler:pencil",
                      class: A(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                c(v(S), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.title}`,
                  onClick: (y) => Z(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: T(({ class: y }) => [
                    c(v(k), {
                      icon: "tabler:share",
                      class: A(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                c(v(S), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.title}`,
                  onClick: (y) => q(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: T(({ class: y }) => [
                    c(v(k), {
                      icon: "tabler:trash",
                      class: A(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            r("div", qe, E(t.description || "No description"), 1),
            r("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: N((y) => f(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              c(v(k), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              n[8] || (n[8] = V(" Chat ", -1))
            ], 8, Je)
          ], 40, Ie))), 128))
        ])) : (g(), h("div", Me, [...n[7] || (n[7] = [
          r("div", { class: "kx-empty-title" }, "No matches", -1),
          r("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (g(), h("div", Ve, [
          r("div", Ue, [
            c(v(k), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          n[5] || (n[5] = r("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          n[6] || (n[6] = r("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          c(v(S), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: K
          }, {
            icon: T(({ class: t }) => [
              c(v(k), {
                icon: "tabler:plus",
                class: A(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      c(ue, {
        open: j.value,
        "agent-id": w.value,
        traits: a.value,
        tools: b.value,
        models: x.value,
        agents: d.value,
        onClose: n[2] || (n[2] = (t) => j.value = !1),
        onSaved: Y
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      L.value ? (g(), h("div", {
        key: 1,
        ref_key: "shareHost",
        ref: D
      }, null, 512)) : M("", !0)
    ]));
  }
}), Ge = { props: { type: "object", properties: {} } }, Qe = {
  wippy: Ge
};
class Xe extends ie {
  static get wippyConfig() {
    return {
      propsSchema: Qe.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ge
    };
  }
  static get vueConfig() {
    return { rootComponent: Fe, plugins: [ae] };
  }
}
fe(import.meta.url, Xe);
//# sourceMappingURL=index.js.map
