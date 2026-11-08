import { g as ne, h as oe, W as se, P as ie } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as F, computed as G, openBlock as _, createElementBlock as g, withModifiers as L, Fragment as P, createElementVNode as l, createTextVNode as M, toDisplayString as D, createCommentVNode as O, createVNode as r, unref as u, watch as Q, onBeforeUnmount as ae, ref as k, withDirectives as le, vModelText as de, withCtx as A, normalizeClass as R, renderList as re, withKeys as q } from "vue";
import { s as N, _ as ce, e as J, l as ue } from "./toolCatalog-DTcZpeT0.js";
import { s as pe } from "./index-BvJc5yvO.js";
import { on as ve, host as me, api as z, loadByTagName as fe, define as _e } from "@wippy-fe/proxy";
import { Icon as b } from "@iconify/vue";
import { s as ge } from "./styles-DOudO97m.js";
const he = { key: 0 }, be = /* @__PURE__ */ F({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(s) {
    const a = s, f = G(() => a.state.deletion_job === null || ["dead", "cancelled"].includes(a.state.deletion_job?.status || ""));
    return (d, c) => s.state.deleting_at ? (_(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: c[1] || (c[1] = L(() => {
      }, ["stop"])),
      onKeydown: c[2] || (c[2] = L(() => {
      }, ["stop"]))
    }, [
      f.value ? (_(), g(P, { key: 0 }, [
        l("span", null, [
          c[3] || (c[3] = M("Deletion failed", -1)),
          s.state.deletion_job?.last_error ? (_(), g("span", he, ": " + D(s.state.deletion_job.last_error), 1)) : O("", !0)
        ]),
        r(u(N), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: c[0] || (c[0] = L((i) => d.$emit("retry"), ["stop"]))
        })
      ], 64)) : (_(), g(P, { key: 1 }, [
        r(u(pe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        c[4] || (c[4] = l("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : O("", !0);
  }
});
function V(s) {
  return !!s && typeof s == "object" && !Array.isArray(s);
}
function ye(s, a) {
  return s;
}
function ke(s, a, f) {
  const d = V(s) ? s : {}, c = [
    d,
    V(d.data) ? d.data : null,
    V(d.payload) ? d.payload : null,
    V(d.detail) ? d.detail : null
  ].filter(Boolean);
  for (const i of c) {
    if (i.event !== "component.meta.changed" && i.event !== "component.deleting" && i.event !== "component.deleted") continue;
    const w = String(i.component_id || ""), j = String(d.topic || i.topic || "");
    if (!w && (!j.startsWith("component.") || j === "component.")) continue;
    const S = w || a || j.slice(10);
    return i.event === "component.deleting" && typeof i.deletion_job_id == "string" && i.deletion_job_id ? { event: i.event, component_id: S, deletion_job_id: i.deletion_job_id } : i.event !== "component.meta.changed" ? { event: i.event, component_id: S } : {
      event: "component.meta.changed",
      component_id: S,
      meta: ye(V(i.meta) ? i.meta : {}),
      deleted: Array.isArray(i.deleted) ? i.deleted.map(String) : []
    };
  }
  return null;
}
function Ce(s, a) {
  const f = ke(s, a);
  return f && f.event !== "component.meta.changed" ? f : null;
}
function xe(s, a, f, d) {
  const c = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map();
  function w(C, v) {
    const m = s.value.find((x) => a(x) === C), n = i.get(C), p = v?.job_id || n?.state.deletion_job_id || m?.deletion_job_id, $ = n ? n.state.deletion_job_id : m?.deleting_at ? m.deletion_job_id : void 0;
    if ((n || m?.deleting_at) && p === $ || p && n?.superseded.has(p)) return;
    const y = {
      deleting_at: n?.state.deleting_at || m?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: p
    }, U = new Set(n?.superseded);
    for (const x of [n?.state.deletion_job_id, m?.deletion_job_id])
      x && x !== p && U.add(x);
    i.set(C, { state: y, superseded: U }), m && (Object.assign(m, y), m.deletion_job = void 0);
  }
  const j = Q(() => s.value, (C, v = []) => {
    const m = C.filter((n) => !c.has(a(n)));
    for (const n of v)
      c.has(a(n)) || m.some((p) => a(p) === a(n)) || n.deleting_at && d?.(a(n));
    if (m.length !== C.length) {
      s.value = m;
      return;
    }
    for (const n of C) {
      n.deleting_at && n.deletion_job === void 0 && !v.includes(n) && (n.deletion_job = null);
      const p = i.get(a(n));
      if (p) {
        const y = n.deletion_job_id;
        n.deleting_at && y && y !== p.state.deletion_job_id && !p.superseded.has(y) && (p.state.deletion_job_id && p.superseded.add(p.state.deletion_job_id), p.state.deletion_job_id = y), y !== p.state.deletion_job_id && (n.deletion_job = void 0), Object.assign(n, p.state);
      }
      const $ = v.find((y) => a(y) === a(n));
      n.deletion_job === void 0 && $?.deletion_job_id === n.deletion_job_id && (n.deletion_job = $?.deletion_job);
    }
  }, { immediate: !0 }), S = ve("@message", (C) => {
    const v = Ce(C);
    if (!v) return;
    const m = s.value.find((n) => a(n) === v.component_id);
    v.event === "component.deleted" ? (m && !c.has(v.component_id) && d?.(v.component_id), c.add(v.component_id), i.delete(v.component_id), s.value = s.value.filter((n) => a(n) !== v.component_id)) : m && w(v.component_id, { job_id: v.deletion_job_id });
  });
  return ae(() => {
    j(), typeof S == "function" && S();
  }), { acceptDeletion: w };
}
const je = () => ne();
function we() {
  let s = 0;
  return () => {
    const a = ++s;
    return () => a === s;
  };
}
const $e = { class: "kx" }, Se = { class: "kx-head" }, De = { class: "kx-head-icon" }, Ee = { class: "kx-head-actions" }, Ne = { class: "kx-count" }, Le = { class: "kx-search" }, Te = {
  key: 0,
  class: "kx-err"
}, Ae = { class: "kx-body" }, Re = {
  key: 0,
  class: "kx-loading"
}, Ve = {
  key: 1,
  class: "kx-empty"
}, Me = { class: "kx-empty-ico" }, Oe = {
  key: 2,
  class: "kx-empty"
}, Ue = {
  key: 3,
  class: "kx-grid"
}, Ke = ["onClick", "onKeydown"], ze = { class: "kx-card-head" }, Be = { class: "kx-ficon" }, Ie = { class: "kx-card-id" }, Pe = ["title"], We = {
  key: 0,
  class: "kx-card-meta"
}, He = ["title"], qe = { class: "kx-card-desc" }, Je = ["disabled", "onClick", "title"], Fe = /* @__PURE__ */ F({
  __name: "agents",
  setup(s) {
    const a = k(!1), f = k(""), d = k([]), c = k(""), i = k([]), w = k([]), j = k([]), S = je();
    function C(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function v(e) {
      return e ? e.startsWith("class:") ? C(e.slice(6)) : j.value.find((o) => o.name === e)?.title || e : "";
    }
    function m(e) {
      return !!e && e.startsWith("class:");
    }
    const n = G(() => {
      const e = c.value.trim().toLowerCase();
      return e ? d.value.filter(
        (o) => (o.title || "").toLowerCase().includes(e) || (o.description || "").toLowerCase().includes(e)
      ) : d.value;
    }), p = we();
    async function $() {
      const e = p();
      a.value = !0, f.value = "";
      try {
        const { data: o } = await z.get("/api/v1/user-agents");
        if (!o?.success) throw new Error(o?.error || "failed to load agents");
        e() && (d.value = o.agents || []);
      } catch (o) {
        e() && (f.value = J(o, "could not load agents"));
      } finally {
        e() && (a.value = !1);
      }
    }
    async function y() {
      try {
        const { data: e } = await z.get("/api/v1/agents/traits");
        i.value = e?.success ? e.traits || [] : [];
      } catch {
        i.value = [];
      }
      try {
        w.value = await ue();
      } catch {
        w.value = [];
      }
      try {
        const { data: e } = await z.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        j.value = e?.success ? e.models || [] : [];
      } catch {
        j.value = [];
      }
    }
    function U(e) {
      e.start_token && S("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const x = k(!1), B = k(null);
    function W() {
      B.value = null, x.value = !0;
    }
    function K(e) {
      B.value = e.id, x.value = !0;
    }
    function X() {
      x.value = !1, $();
    }
    async function H(e) {
      if (await me.confirm({
        header: "Delete agent",
        message: `Delete “${e.title || "(untitled)"}”? This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        f.value = "";
        try {
          const { data: t } = await z.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          te(e.id, t), await $();
        } catch (t) {
          f.value = J(t, "delete failed");
        }
      }
    }
    const T = k(!1), I = k(null), E = k(null);
    function Y(e) {
      I.value = e, T.value = !0;
    }
    function Z() {
      T.value = !1, I.value = null;
    }
    async function ee() {
      const e = I.value;
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
    Q([T, E], async () => {
      T.value && E.value && await ee();
    }), oe(async () => {
      await Promise.all([$(), y()]);
    });
    const { acceptDeletion: te } = xe(d, (e) => e.id, void 0, $);
    return (e, o) => (_(), g("div", $e, [
      l("header", Se, [
        l("div", De, [
          r(u(b), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = l("div", { class: "kx-head-text" }, [
          l("h1", { class: "kx-title" }, "Agents"),
          l("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        l("div", Ee, [
          l("span", Ne, [
            r(u(b), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            M(" " + D(d.value.length) + " agent" + D(d.value.length !== 1 ? "s" : ""), 1)
          ]),
          l("div", Le, [
            r(u(b), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            le(l("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (t) => c.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [de, c.value]
            ])
          ]),
          r(u(N), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: W
          }, {
            icon: A(({ class: t }) => [
              r(u(b), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      f.value ? (_(), g("div", Te, D(f.value), 1)) : O("", !0),
      l("div", Ae, [
        a.value && !d.value.length ? (_(), g("div", Re, [
          r(u(b), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[4] || (o[4] = M(" Loading… ", -1))
        ])) : d.value.length ? n.value.length ? (_(), g("div", Ue, [
          (_(!0), g(P, null, re(n.value, (t) => (_(), g("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (h) => !t.deleting_at && K(t),
            onKeydown: [
              q((h) => !t.deleting_at && K(t), ["enter"]),
              q(L((h) => !t.deleting_at && K(t), ["prevent"]), ["space"])
            ]
          }, [
            r(be, {
              state: t,
              onRetry: (h) => H(t)
            }, null, 8, ["state", "onRetry"]),
            l("div", ze, [
              l("span", Be, [
                r(u(b), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              l("div", Ie, [
                l("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, D(t.title || "(untitled)"), 9, Pe),
                t.model ? (_(), g("div", We, [
                  l("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    r(u(b), {
                      icon: m(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    M(" " + D(v(t.model)), 1)
                  ], 8, He)
                ])) : O("", !0)
              ]),
              l("div", {
                class: "kx-card-actions",
                onClick: o[1] || (o[1] = L(() => {
                }, ["stop"]))
              }, [
                r(u(N), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (h) => !t.deleting_at && K(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: h }) => [
                    r(u(b), {
                      icon: "tabler:pencil",
                      class: R(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                r(u(N), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.title}`,
                  onClick: (h) => Y(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: h }) => [
                    r(u(b), {
                      icon: "tabler:share",
                      class: R(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                r(u(N), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.title}`,
                  onClick: (h) => H(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: h }) => [
                    r(u(b), {
                      icon: "tabler:trash",
                      class: R(h),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            l("div", qe, D(t.description || "No description"), 1),
            l("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: L((h) => U(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              r(u(b), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              o[8] || (o[8] = M(" Chat ", -1))
            ], 8, Je)
          ], 40, Ke))), 128))
        ])) : (_(), g("div", Oe, [...o[7] || (o[7] = [
          l("div", { class: "kx-empty-title" }, "No matches", -1),
          l("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (_(), g("div", Ve, [
          l("div", Me, [
            r(u(b), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          o[5] || (o[5] = l("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          o[6] || (o[6] = l("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          r(u(N), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: W
          }, {
            icon: A(({ class: t }) => [
              r(u(b), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      r(ce, {
        open: x.value,
        "agent-id": B.value,
        traits: i.value,
        tools: w.value,
        models: j.value,
        agents: d.value,
        onClose: o[2] || (o[2] = (t) => x.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      T.value ? (_(), g("div", {
        key: 1,
        ref_key: "shareHost",
        ref: E
      }, null, 512)) : O("", !0)
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
    return { rootComponent: Fe, plugins: [ie] };
  }
}
_e(import.meta.url, Xe);
//# sourceMappingURL=index.js.map
