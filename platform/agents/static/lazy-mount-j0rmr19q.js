import { P as ne } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as F, computed as G, openBlock as _, createElementBlock as g, withModifiers as L, Fragment as H, createElementVNode as l, createTextVNode as O, toDisplayString as D, createCommentVNode as V, createVNode as r, unref as u, watch as Q, onBeforeUnmount as oe, ref as y, withDirectives as se, vModelText as ie, withCtx as A, normalizeClass as R, renderList as ae, withKeys as W } from "vue";
import N from "primevue/button";
import le from "primevue/progressspinner";
import { on as de, host as re, api as z, loadByTagName as ce } from "@wippy-fe/proxy";
import { Icon as h } from "@iconify/vue";
import { u as ue, b as pe } from "./wc-runtime-KO3cNuNo.js";
import { _ as ve, e as J } from "./AgentForm.vue_vue_type_script_setup_true_lang-BFkHUx4K.js";
import { l as me } from "./toolCatalog-W6OjlU7E.js";
const fe = { key: 0 }, _e = /* @__PURE__ */ F({
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
      f.value ? (_(), g(H, { key: 0 }, [
        l("span", null, [
          c[3] || (c[3] = O("Deletion failed", -1)),
          s.state.deletion_job?.last_error ? (_(), g("span", fe, ": " + D(s.state.deletion_job.last_error), 1)) : V("", !0)
        ]),
        r(u(N), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: c[0] || (c[0] = L((i) => d.$emit("retry"), ["stop"]))
        })
      ], 64)) : (_(), g(H, { key: 1 }, [
        r(u(le), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        c[4] || (c[4] = l("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : V("", !0);
  }
});
function M(s) {
  return !!s && typeof s == "object" && !Array.isArray(s);
}
function ge(s, a) {
  return s;
}
function be(s, a, f) {
  const d = M(s) ? s : {}, c = [
    d,
    M(d.data) ? d.data : null,
    M(d.payload) ? d.payload : null,
    M(d.detail) ? d.detail : null
  ].filter(Boolean);
  for (const i of c) {
    if (i.event !== "component.meta.changed" && i.event !== "component.deleting" && i.event !== "component.deleted") continue;
    const w = String(i.component_id || ""), j = String(d.topic || i.topic || "");
    if (!w && (!j.startsWith("component.") || j === "component.")) continue;
    const S = w || a || j.slice(10);
    return i.event === "component.deleting" && typeof i.deletion_job_id == "string" && i.deletion_job_id ? { event: i.event, component_id: S, deletion_job_id: i.deletion_job_id } : i.event !== "component.meta.changed" ? { event: i.event, component_id: S } : {
      event: "component.meta.changed",
      component_id: S,
      meta: ge(M(i.meta) ? i.meta : {}),
      deleted: Array.isArray(i.deleted) ? i.deleted.map(String) : []
    };
  }
  return null;
}
function he(s, a) {
  const f = be(s, a);
  return f && f.event !== "component.meta.changed" ? f : null;
}
function ke(s, a, f, d) {
  const c = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map();
  function w(C, v) {
    const m = s.value.find((x) => a(x) === C), n = i.get(C), p = v?.job_id || n?.state.deletion_job_id || m?.deletion_job_id, $ = n ? n.state.deletion_job_id : m?.deleting_at ? m.deletion_job_id : void 0;
    if ((n || m?.deleting_at) && p === $ || p && n?.superseded.has(p)) return;
    const k = {
      deleting_at: n?.state.deleting_at || m?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: p
    }, B = new Set(n?.superseded);
    for (const x of [n?.state.deletion_job_id, m?.deletion_job_id])
      x && x !== p && B.add(x);
    i.set(C, { state: k, superseded: B }), m && (Object.assign(m, k), m.deletion_job = void 0);
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
        const k = n.deletion_job_id;
        n.deleting_at && k && k !== p.state.deletion_job_id && !p.superseded.has(k) && (p.state.deletion_job_id && p.superseded.add(p.state.deletion_job_id), p.state.deletion_job_id = k), k !== p.state.deletion_job_id && (n.deletion_job = void 0), Object.assign(n, p.state);
      }
      const $ = v.find((k) => a(k) === a(n));
      n.deletion_job === void 0 && $?.deletion_job_id === n.deletion_job_id && (n.deletion_job = $?.deletion_job);
    }
  }, { immediate: !0 }), S = de("@message", (C) => {
    const v = he(C);
    if (!v) return;
    const m = s.value.find((n) => a(n) === v.component_id);
    v.event === "component.deleted" ? (m && !c.has(v.component_id) && d?.(v.component_id), c.add(v.component_id), i.delete(v.component_id), s.value = s.value.filter((n) => a(n) !== v.component_id)) : m && w(v.component_id, { job_id: v.deletion_job_id });
  });
  return oe(() => {
    j(), typeof S == "function" && S();
  }), { acceptDeletion: w };
}
const ye = () => ue();
function Ce() {
  let s = 0;
  return () => {
    const a = ++s;
    return () => a === s;
  };
}
const xe = { class: "kx" }, je = { class: "kx-head" }, we = { class: "kx-head-icon" }, $e = { class: "kx-head-actions" }, Se = { class: "kx-count" }, De = { class: "kx-search" }, Ee = {
  key: 0,
  class: "kx-err"
}, Ne = { class: "kx-body" }, Le = {
  key: 0,
  class: "kx-loading"
}, Te = {
  key: 1,
  class: "kx-empty"
}, Ae = { class: "kx-empty-ico" }, Re = {
  key: 2,
  class: "kx-empty"
}, Me = {
  key: 3,
  class: "kx-grid"
}, Oe = ["onClick", "onKeydown"], Ve = { class: "kx-card-head" }, Be = { class: "kx-ficon" }, Pe = { class: "kx-card-id" }, ze = ["title"], Ie = {
  key: 0,
  class: "kx-card-meta"
}, Ue = ["title"], He = { class: "kx-card-desc" }, Ke = ["disabled", "onClick", "title"], qe = /* @__PURE__ */ F({
  __name: "agents",
  setup(s) {
    const a = y(!1), f = y(""), d = y([]), c = y(""), i = y([]), w = y([]), j = y([]), S = ye();
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
    }), p = Ce();
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
    async function k() {
      try {
        const { data: e } = await z.get("/api/v1/agents/traits");
        i.value = e?.success ? e.traits || [] : [];
      } catch {
        i.value = [];
      }
      try {
        w.value = await me();
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
    function B(e) {
      e.start_token && S("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const x = y(!1), I = y(null);
    function K() {
      I.value = null, x.value = !0;
    }
    function P(e) {
      I.value = e.id, x.value = !0;
    }
    function X() {
      x.value = !1, $();
    }
    async function q(e) {
      if (await re.confirm({
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
    const T = y(!1), U = y(null), E = y(null);
    function Y(e) {
      U.value = e, T.value = !0;
    }
    function Z() {
      T.value = !1, U.value = null;
    }
    async function ee() {
      const e = U.value;
      if (!E.value || !e) return;
      if (E.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await ce("kickside-share", { timeoutMs: 8e3 });
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
    }), pe(async () => {
      await Promise.all([$(), k()]);
    });
    const { acceptDeletion: te } = ke(d, (e) => e.id, void 0, $);
    return (e, o) => (_(), g("div", xe, [
      l("header", je, [
        l("div", we, [
          r(u(h), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = l("div", { class: "kx-head-text" }, [
          l("h1", { class: "kx-title" }, "Agents"),
          l("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        l("div", $e, [
          l("span", Se, [
            r(u(h), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            O(" " + D(d.value.length) + " agent" + D(d.value.length !== 1 ? "s" : ""), 1)
          ]),
          l("div", De, [
            r(u(h), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            se(l("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (t) => c.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [ie, c.value]
            ])
          ]),
          r(u(N), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: K
          }, {
            icon: A(({ class: t }) => [
              r(u(h), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      f.value ? (_(), g("div", Ee, D(f.value), 1)) : V("", !0),
      l("div", Ne, [
        a.value && !d.value.length ? (_(), g("div", Le, [
          r(u(h), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[4] || (o[4] = O(" Loading… ", -1))
        ])) : d.value.length ? n.value.length ? (_(), g("div", Me, [
          (_(!0), g(H, null, ae(n.value, (t) => (_(), g("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (b) => !t.deleting_at && P(t),
            onKeydown: [
              W((b) => !t.deleting_at && P(t), ["enter"]),
              W(L((b) => !t.deleting_at && P(t), ["prevent"]), ["space"])
            ]
          }, [
            r(_e, {
              state: t,
              onRetry: (b) => q(t)
            }, null, 8, ["state", "onRetry"]),
            l("div", Ve, [
              l("span", Be, [
                r(u(h), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              l("div", Pe, [
                l("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, D(t.title || "(untitled)"), 9, ze),
                t.model ? (_(), g("div", Ie, [
                  l("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    r(u(h), {
                      icon: m(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    O(" " + D(v(t.model)), 1)
                  ], 8, Ue)
                ])) : V("", !0)
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
                  onClick: (b) => !t.deleting_at && P(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: b }) => [
                    r(u(h), {
                      icon: "tabler:pencil",
                      class: R(b),
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
                  onClick: (b) => Y(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: b }) => [
                    r(u(h), {
                      icon: "tabler:share",
                      class: R(b),
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
                  onClick: (b) => q(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: b }) => [
                    r(u(h), {
                      icon: "tabler:trash",
                      class: R(b),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            l("div", He, D(t.description || "No description"), 1),
            l("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: L((b) => B(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              r(u(h), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              o[8] || (o[8] = O(" Chat ", -1))
            ], 8, Ke)
          ], 40, Oe))), 128))
        ])) : (_(), g("div", Re, [...o[7] || (o[7] = [
          l("div", { class: "kx-empty-title" }, "No matches", -1),
          l("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (_(), g("div", Te, [
          l("div", Ae, [
            r(u(h), {
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
            onClick: K
          }, {
            icon: A(({ class: t }) => [
              r(u(h), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      r(ve, {
        open: x.value,
        "agent-id": I.value,
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
      }, null, 512)) : V("", !0)
    ]));
  }
}), tt = {
  rootComponent: qe,
  plugins: [ne]
};
export {
  tt as mountConfig
};
//# sourceMappingURL=lazy-mount-j0rmr19q.js.map
