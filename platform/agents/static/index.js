import { g as ne, h as oe, W as se, P as ie } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as F, computed as J, openBlock as g, createElementBlock as h, withModifiers as S, Fragment as W, createElementVNode as a, createTextVNode as R, toDisplayString as $, createCommentVNode as U, createVNode as c, unref as v, watch as G, onBeforeUnmount as ae, ref as C, withDirectives as le, vModelText as re, withCtx as T, normalizeClass as A, renderList as de, withKeys as q } from "vue";
import { s as E, e as z, _ as ce, l as ue } from "./toolCatalog-BlyBDd4C.js";
import { s as pe } from "./index-BvJc5yvO.js";
import { _ as ve } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as me, api as V, host as Q, loadByTagName as fe, define as _e } from "@wippy-fe/proxy";
import { Icon as k } from "@iconify/vue";
import { s as ge } from "./styles-CN0_5BM1.js";
const he = { key: 0 }, be = /* @__PURE__ */ F({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(i) {
    const l = i, _ = J(() => l.state.deletion_job === null || ["dead", "cancelled"].includes(l.state.deletion_job?.status || ""));
    return (u, m) => i.state.deleting_at ? (g(), h("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: m[1] || (m[1] = S(() => {
      }, ["stop"])),
      onKeydown: m[2] || (m[2] = S(() => {
      }, ["stop"]))
    }, [
      _.value ? (g(), h(W, { key: 0 }, [
        a("span", null, [
          m[3] || (m[3] = R("Deletion failed", -1)),
          i.state.deletion_job?.last_error ? (g(), h("span", he, ": " + $(i.state.deletion_job.last_error), 1)) : U("", !0)
        ]),
        c(v(E), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: m[0] || (m[0] = S((s) => u.$emit("retry"), ["stop"]))
        })
      ], 64)) : (g(), h(W, { key: 1 }, [
        c(v(pe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        m[4] || (m[4] = a("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : U("", !0);
  }
}), ye = /* @__PURE__ */ ve(be, [["__scopeId", "data-v-63c136c7"]]);
function L(i) {
  return !!i && typeof i == "object" && !Array.isArray(i);
}
function ke(i, l) {
  return i;
}
function Ce(i, l, _) {
  const u = L(i) ? i : {}, m = [
    u,
    L(u.data) ? u.data : null,
    L(u.payload) ? u.payload : null,
    L(u.detail) ? u.detail : null
  ].filter(Boolean);
  for (const s of m) {
    if (s.event !== "component.meta.changed" && s.event !== "component.deleting" && s.event !== "component.deleted") continue;
    const b = String(s.component_id || ""), x = String(u.topic || s.topic || "");
    if (!b && (!x.startsWith("component.") || x === "component.")) continue;
    const w = b || l || x.slice(10);
    return s.event === "component.deleting" && typeof s.deletion_job_id == "string" && s.deletion_job_id ? { event: s.event, component_id: w, deletion_job_id: s.deletion_job_id } : s.event !== "component.meta.changed" ? { event: s.event, component_id: w } : {
      event: "component.meta.changed",
      component_id: w,
      meta: ke(L(s.meta) ? s.meta : {}),
      deleted: Array.isArray(s.deleted) ? s.deleted.map(String) : []
    };
  }
  return null;
}
function xe(i, l) {
  const _ = Ce(i, l);
  return _ && _.event !== "component.meta.changed" ? _ : null;
}
function je(i, l, _, u) {
  let m = !0;
  const s = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Map();
  function x(p, r) {
    const f = i.value.find((j) => l(j) === p), n = b.get(p), d = {
      deleting_at: n?.deleting_at || f?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: r?.job_id || n?.deletion_job_id || f?.deletion_job_id
    };
    b.set(p, d), f && (Object.assign(f, d), f.deletion_job = void 0);
  }
  async function w(p) {
    const r = l(p), f = b.get(r), n = () => m && i.value.includes(p) && b.get(r) === f;
    try {
      const { data: d } = await V.get(`/api/v1/components/${encodeURIComponent(r)}`);
      if (!d?.success) throw new Error(z(d, "Could not read deletion progress"));
      n() && (p.deleting_at = f?.deleting_at || d.deleting_at, p.deletion_job_id = d.deletion_job_id, f && (f.deletion_job_id = p.deletion_job_id), p.deletion_job = d.deletion_job ?? null);
    } catch (d) {
      n() && Q.handleError("other", { message: z(d, "Could not read deletion progress") });
    }
  }
  let M = [];
  const B = G(() => i.value, (p, r = []) => {
    const f = p.filter((n) => !s.has(l(n)));
    for (const n of r)
      s.has(l(n)) || f.some((d) => l(d) === l(n)) || n.deleting_at;
    if (f.length !== p.length) {
      i.value = f;
      return;
    }
    for (const n of p) {
      const d = b.get(l(n));
      d && (n.deletion_job_id !== d.deletion_job_id && (n.deletion_job = void 0), Object.assign(n, d));
      const j = r.find((I) => l(I) === l(n));
      n.deletion_job === void 0 && j?.deletion_job_id === n.deletion_job_id && (n.deletion_job = j?.deletion_job), n.deleting_at && !M.includes(n) && w(n);
    }
    M = p;
  }, { immediate: !0 }), O = me("@message", (p) => {
    const r = xe(p);
    if (!r) return;
    const f = i.value.find((n) => l(n) === r.component_id);
    r.event === "component.deleted" ? (f && s.has(r.component_id), s.add(r.component_id), b.delete(r.component_id), i.value = i.value.filter((n) => l(n) !== r.component_id)) : f && x(r.component_id, { job_id: r.deletion_job_id });
  });
  return ae(() => {
    m = !1, B(), typeof O == "function" && O();
  }), { acceptDeletion: x };
}
const we = () => ne(), $e = { class: "kx" }, De = { class: "kx-head" }, Ee = { class: "kx-head-icon" }, Se = { class: "kx-head-actions" }, Ne = { class: "kx-count" }, Te = { class: "kx-search" }, Ae = {
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
  setup(i) {
    const l = C(!1), _ = C(""), u = C([]), m = C(""), s = C([]), b = C([]), x = C([]), w = we();
    function M(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function B(e) {
      return e ? e.startsWith("class:") ? M(e.slice(6)) : x.value.find((o) => o.name === e)?.title || e : "";
    }
    function O(e) {
      return !!e && e.startsWith("class:");
    }
    const p = J(() => {
      const e = m.value.trim().toLowerCase();
      return e ? u.value.filter(
        (o) => (o.title || "").toLowerCase().includes(e) || (o.description || "").toLowerCase().includes(e)
      ) : u.value;
    });
    async function r() {
      l.value = !0, _.value = "";
      try {
        const { data: e } = await V.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        u.value = e.agents || [];
      } catch (e) {
        _.value = z(e, "could not load agents");
      } finally {
        l.value = !1;
      }
    }
    async function f() {
      try {
        const { data: e } = await V.get("/api/v1/agents/traits");
        s.value = e?.success ? e.traits || [] : [];
      } catch {
        s.value = [];
      }
      try {
        b.value = await ue();
      } catch {
        b.value = [];
      }
      try {
        const { data: e } = await V.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        x.value = e?.success ? e.models || [] : [];
      } catch {
        x.value = [];
      }
    }
    function n(e) {
      e.start_token && w("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const d = C(!1), j = C(null);
    function I() {
      j.value = null, d.value = !0;
    }
    function K(e) {
      j.value = e.id, d.value = !0;
    }
    function X() {
      d.value = !1, r();
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
        _.value = "";
        try {
          const { data: t } = await V.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          te(e.id, t), await r();
        } catch (t) {
          _.value = z(t, "delete failed");
        }
      }
    }
    const N = C(!1), P = C(null), D = C(null);
    function Y(e) {
      P.value = e, N.value = !0;
    }
    function Z() {
      N.value = !1, P.value = null;
    }
    async function ee() {
      const e = P.value;
      if (!D.value || !e) return;
      if (D.value.innerHTML = "", !customElements.get("kickside-share"))
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
      })), o.style.display = "block", o.addEventListener("close", Z), D.value.appendChild(o);
    }
    G([N, D], async () => {
      N.value && D.value && await ee();
    }), oe(async () => {
      await Promise.all([r(), f()]);
    });
    const { acceptDeletion: te } = je(u, (e) => e.id);
    return (e, o) => (g(), h("div", $e, [
      a("header", De, [
        a("div", Ee, [
          c(v(k), {
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
            c(v(k), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            R(" " + $(u.value.length) + " agent" + $(u.value.length !== 1 ? "s" : ""), 1)
          ]),
          a("div", Te, [
            c(v(k), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            le(a("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (t) => m.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [re, m.value]
            ])
          ]),
          c(v(E), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: I
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
      _.value ? (g(), h("div", Ae, $(_.value), 1)) : U("", !0),
      a("div", Le, [
        l.value && !u.value.length ? (g(), h("div", Re, [
          c(v(k), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[4] || (o[4] = R(" Loading… ", -1))
        ])) : u.value.length ? p.value.length ? (g(), h("div", Oe, [
          (g(!0), h(W, null, de(p.value, (t) => (g(), h("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (y) => !t.deleting_at && K(t),
            onKeydown: [
              q((y) => !t.deleting_at && K(t), ["enter"]),
              q(S((y) => !t.deleting_at && K(t), ["prevent"]), ["space"])
            ]
          }, [
            c(ye, {
              state: t,
              onRetry: (y) => H(t)
            }, null, 8, ["state", "onRetry"]),
            a("div", Ke, [
              a("span", ze, [
                c(v(k), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              a("div", Be, [
                a("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, $(t.title || "(untitled)"), 9, Pe),
                t.model ? (g(), h("div", We, [
                  a("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    c(v(k), {
                      icon: O(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    R(" " + $(B(t.model)), 1)
                  ], 8, He)
                ])) : U("", !0)
              ]),
              a("div", {
                class: "kx-card-actions",
                onClick: o[1] || (o[1] = S(() => {
                }, ["stop"]))
              }, [
                c(v(E), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (y) => !t.deleting_at && K(t),
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
                c(v(E), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.title}`,
                  onClick: (y) => Y(t),
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
                c(v(E), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.title}`,
                  onClick: (y) => H(t),
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
            a("div", qe, $(t.description || "No description"), 1),
            a("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: S((y) => n(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              c(v(k), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              o[8] || (o[8] = R(" Chat ", -1))
            ], 8, Fe)
          ], 40, Ie))), 128))
        ])) : (g(), h("div", Me, [...o[7] || (o[7] = [
          a("div", { class: "kx-empty-title" }, "No matches", -1),
          a("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (g(), h("div", Ve, [
          a("div", Ue, [
            c(v(k), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          o[5] || (o[5] = a("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          o[6] || (o[6] = a("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          c(v(E), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: I
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
      c(ce, {
        open: d.value,
        "agent-id": j.value,
        traits: s.value,
        tools: b.value,
        models: x.value,
        agents: u.value,
        onClose: o[2] || (o[2] = (t) => d.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      N.value ? (g(), h("div", {
        key: 1,
        ref_key: "shareHost",
        ref: D
      }, null, 512)) : U("", !0)
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
      inlineCss: ge
    };
  }
  static get vueConfig() {
    return { rootComponent: Je, plugins: [ie] };
  }
}
_e(import.meta.url, Xe);
//# sourceMappingURL=index.js.map
