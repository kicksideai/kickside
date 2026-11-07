import { P as ne } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as F, computed as J, openBlock as g, createElementBlock as h, withModifiers as L, Fragment as K, createElementVNode as a, createTextVNode as M, toDisplayString as D, createCommentVNode as V, createVNode as u, unref as m, watch as G, onBeforeUnmount as oe, ref as C, withDirectives as ie, vModelText as ae, withCtx as A, normalizeClass as R, renderList as se, withKeys as q } from "vue";
import N from "primevue/button";
import le from "primevue/progressspinner";
import { _ as de } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as re, api as O, host as Q, loadByTagName as ce } from "@wippy-fe/proxy";
import { e as U, _ as ue, l as pe } from "./toolCatalog-Du07yUyf.js";
import { Icon as y } from "@iconify/vue";
import { u as ve, b as me } from "./wc-runtime-KO3cNuNo.js";
const _e = { key: 0 }, fe = /* @__PURE__ */ F({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(s) {
    const l = s, f = J(() => l.state.deletion_job === null || ["dead", "cancelled"].includes(l.state.deletion_job?.status || ""));
    return (p, _) => s.state.deleting_at ? (g(), h("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: _[1] || (_[1] = L(() => {
      }, ["stop"])),
      onKeydown: _[2] || (_[2] = L(() => {
      }, ["stop"]))
    }, [
      f.value ? (g(), h(K, { key: 0 }, [
        a("span", null, [
          _[3] || (_[3] = M("Deletion failed", -1)),
          s.state.deletion_job?.last_error ? (g(), h("span", _e, ": " + D(s.state.deletion_job.last_error), 1)) : V("", !0)
        ]),
        u(m(N), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: _[0] || (_[0] = L((i) => p.$emit("retry"), ["stop"]))
        })
      ], 64)) : (g(), h(K, { key: 1 }, [
        u(m(le), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        _[4] || (_[4] = a("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : V("", !0);
  }
}), ge = /* @__PURE__ */ de(fe, [["__scopeId", "data-v-63c136c7"]]);
function I(s) {
  return !!s && typeof s == "object" && !Array.isArray(s);
}
function he(s, l) {
  return s;
}
function be(s, l, f) {
  const p = I(s) ? s : {}, _ = [
    p,
    I(p.data) ? p.data : null,
    I(p.payload) ? p.payload : null,
    I(p.detail) ? p.detail : null
  ].filter(Boolean);
  for (const i of _) {
    if (i.event !== "component.meta.changed" && i.event !== "component.deleting" && i.event !== "component.deleted") continue;
    const b = String(i.component_id || ""), x = String(p.topic || i.topic || "");
    if (!b && (!x.startsWith("component.") || x === "component.")) continue;
    const w = b || l || x.slice(10);
    return i.event === "component.deleting" && typeof i.deletion_job_id == "string" && i.deletion_job_id ? { event: i.event, component_id: w, deletion_job_id: i.deletion_job_id } : i.event !== "component.meta.changed" ? { event: i.event, component_id: w } : {
      event: "component.meta.changed",
      component_id: w,
      meta: he(I(i.meta) ? i.meta : {}),
      deleted: Array.isArray(i.deleted) ? i.deleted.map(String) : []
    };
  }
  return null;
}
function ke(s, l) {
  const f = be(s, l);
  return f && f.event !== "component.meta.changed" ? f : null;
}
function ye(s, l, f, p) {
  let _ = !0;
  const i = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Map();
  function x(v, d) {
    const r = s.value.find((E) => l(E) === v), n = b.get(v), c = d?.job_id || n?.deletion_job_id || r?.deletion_job_id, j = n ? n.deletion_job_id : r?.deleting_at ? r.deletion_job_id : void 0;
    if ((n || r?.deleting_at) && c === j) return;
    const $ = {
      deleting_at: n?.deleting_at || r?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: c
    };
    b.set(v, $), r && (Object.assign(r, $), r.deletion_job = void 0);
  }
  async function w(v) {
    const d = l(v), r = b.get(d), n = () => _ && s.value.includes(v) && b.get(d) === r;
    try {
      const { data: c } = await O.get(`/api/v1/components/${encodeURIComponent(d)}`);
      if (!c?.success) throw new Error(U(c, "Could not read deletion progress"));
      n() && (v.deleting_at = r?.deleting_at || c.deleting_at, v.deletion_job_id = c.deletion_job_id, r && (r.deletion_job_id = v.deletion_job_id), v.deletion_job = c.deletion_job ?? null);
    } catch (c) {
      n() && Q.handleError("other", { message: U(c, "Could not read deletion progress") });
    }
  }
  let B = [];
  const z = G(() => s.value, (v, d = []) => {
    const r = v.filter((n) => !i.has(l(n)));
    for (const n of d)
      i.has(l(n)) || r.some((c) => l(c) === l(n)) || n.deleting_at;
    if (r.length !== v.length) {
      s.value = r;
      return;
    }
    for (const n of v) {
      const c = b.get(l(n));
      c && (n.deletion_job_id !== c.deletion_job_id && (n.deletion_job = void 0), Object.assign(n, c));
      const j = d.find(($) => l($) === l(n));
      n.deletion_job === void 0 && j?.deletion_job_id === n.deletion_job_id && (n.deletion_job = j?.deletion_job), n.deleting_at && !B.includes(n) && w(n);
    }
    B = v;
  }, { immediate: !0 }), P = re("@message", (v) => {
    const d = ke(v);
    if (!d) return;
    const r = s.value.find((n) => l(n) === d.component_id);
    d.event === "component.deleted" ? (r && i.has(d.component_id), i.add(d.component_id), b.delete(d.component_id), s.value = s.value.filter((n) => l(n) !== d.component_id)) : r && x(d.component_id, { job_id: d.deletion_job_id });
  });
  return oe(() => {
    _ = !1, z(), typeof P == "function" && P();
  }), { acceptDeletion: x };
}
const Ce = () => ve(), xe = { class: "kx" }, je = { class: "kx-head" }, we = { class: "kx-head-icon" }, $e = { class: "kx-head-actions" }, De = { class: "kx-count" }, Ee = { class: "kx-search" }, Se = {
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
}, Ie = {
  key: 3,
  class: "kx-grid"
}, Me = ["onClick", "onKeydown"], Oe = { class: "kx-card-head" }, Ve = { class: "kx-ficon" }, Be = { class: "kx-card-id" }, Pe = ["title"], Ue = {
  key: 0,
  class: "kx-card-meta"
}, ze = ["title"], He = { class: "kx-card-desc" }, Ke = ["disabled", "onClick", "title"], We = /* @__PURE__ */ F({
  __name: "agents",
  setup(s) {
    const l = C(!1), f = C(""), p = C([]), _ = C(""), i = C([]), b = C([]), x = C([]), w = Ce();
    function B(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function z(e) {
      return e ? e.startsWith("class:") ? B(e.slice(6)) : x.value.find((o) => o.name === e)?.title || e : "";
    }
    function P(e) {
      return !!e && e.startsWith("class:");
    }
    const v = J(() => {
      const e = _.value.trim().toLowerCase();
      return e ? p.value.filter(
        (o) => (o.title || "").toLowerCase().includes(e) || (o.description || "").toLowerCase().includes(e)
      ) : p.value;
    });
    async function d() {
      l.value = !0, f.value = "";
      try {
        const { data: e } = await O.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        p.value = e.agents || [];
      } catch (e) {
        f.value = U(e, "could not load agents");
      } finally {
        l.value = !1;
      }
    }
    async function r() {
      try {
        const { data: e } = await O.get("/api/v1/agents/traits");
        i.value = e?.success ? e.traits || [] : [];
      } catch {
        i.value = [];
      }
      try {
        b.value = await pe();
      } catch {
        b.value = [];
      }
      try {
        const { data: e } = await O.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        x.value = e?.success ? e.models || [] : [];
      } catch {
        x.value = [];
      }
    }
    function n(e) {
      e.start_token && w("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const c = C(!1), j = C(null);
    function $() {
      j.value = null, c.value = !0;
    }
    function E(e) {
      j.value = e.id, c.value = !0;
    }
    function X() {
      c.value = !1, d();
    }
    async function W(e) {
      if (await Q.confirm({
        header: "Delete agent",
        message: `Delete “${e.title || "(untitled)"}”? This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        f.value = "";
        try {
          const { data: t } = await O.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          te(e.id, t), await d();
        } catch (t) {
          f.value = U(t, "delete failed");
        }
      }
    }
    const T = C(!1), H = C(null), S = C(null);
    function Y(e) {
      H.value = e, T.value = !0;
    }
    function Z() {
      T.value = !1, H.value = null;
    }
    async function ee() {
      const e = H.value;
      if (!S.value || !e) return;
      if (S.value.innerHTML = "", !customElements.get("kickside-share"))
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
      })), o.style.display = "block", o.addEventListener("close", Z), S.value.appendChild(o);
    }
    G([T, S], async () => {
      T.value && S.value && await ee();
    }), me(async () => {
      await Promise.all([d(), r()]);
    });
    const { acceptDeletion: te } = ye(p, (e) => e.id);
    return (e, o) => (g(), h("div", xe, [
      a("header", je, [
        a("div", we, [
          u(m(y), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = a("div", { class: "kx-head-text" }, [
          a("h1", { class: "kx-title" }, "Agents"),
          a("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        a("div", $e, [
          a("span", De, [
            u(m(y), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            M(" " + D(p.value.length) + " agent" + D(p.value.length !== 1 ? "s" : ""), 1)
          ]),
          a("div", Ee, [
            u(m(y), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            ie(a("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (t) => _.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [ae, _.value]
            ])
          ]),
          u(m(N), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: $
          }, {
            icon: A(({ class: t }) => [
              u(m(y), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      f.value ? (g(), h("div", Se, D(f.value), 1)) : V("", !0),
      a("div", Ne, [
        l.value && !p.value.length ? (g(), h("div", Le, [
          u(m(y), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[4] || (o[4] = M(" Loading… ", -1))
        ])) : p.value.length ? v.value.length ? (g(), h("div", Ie, [
          (g(!0), h(K, null, se(v.value, (t) => (g(), h("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (k) => !t.deleting_at && E(t),
            onKeydown: [
              q((k) => !t.deleting_at && E(t), ["enter"]),
              q(L((k) => !t.deleting_at && E(t), ["prevent"]), ["space"])
            ]
          }, [
            u(ge, {
              state: t,
              onRetry: (k) => W(t)
            }, null, 8, ["state", "onRetry"]),
            a("div", Oe, [
              a("span", Ve, [
                u(m(y), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              a("div", Be, [
                a("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, D(t.title || "(untitled)"), 9, Pe),
                t.model ? (g(), h("div", Ue, [
                  a("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    u(m(y), {
                      icon: P(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    M(" " + D(z(t.model)), 1)
                  ], 8, ze)
                ])) : V("", !0)
              ]),
              a("div", {
                class: "kx-card-actions",
                onClick: o[1] || (o[1] = L(() => {
                }, ["stop"]))
              }, [
                u(m(N), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (k) => !t.deleting_at && E(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: k }) => [
                    u(m(y), {
                      icon: "tabler:pencil",
                      class: R(k),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                u(m(N), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${t.title}`,
                  onClick: (k) => Y(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: k }) => [
                    u(m(y), {
                      icon: "tabler:share",
                      class: R(k),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                u(m(N), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.title}`,
                  onClick: (k) => W(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: A(({ class: k }) => [
                    u(m(y), {
                      icon: "tabler:trash",
                      class: R(k),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            a("div", He, D(t.description || "No description"), 1),
            a("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: L((k) => n(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              u(m(y), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              o[8] || (o[8] = M(" Chat ", -1))
            ], 8, Ke)
          ], 40, Me))), 128))
        ])) : (g(), h("div", Re, [...o[7] || (o[7] = [
          a("div", { class: "kx-empty-title" }, "No matches", -1),
          a("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (g(), h("div", Te, [
          a("div", Ae, [
            u(m(y), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          o[5] || (o[5] = a("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          o[6] || (o[6] = a("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          u(m(N), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: $
          }, {
            icon: A(({ class: t }) => [
              u(m(y), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      u(ue, {
        open: c.value,
        "agent-id": j.value,
        traits: i.value,
        tools: b.value,
        models: x.value,
        agents: p.value,
        onClose: o[2] || (o[2] = (t) => c.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      T.value ? (g(), h("div", {
        key: 1,
        ref_key: "shareHost",
        ref: S
      }, null, 512)) : V("", !0)
    ]));
  }
}), tt = {
  rootComponent: We,
  plugins: [ne]
};
export {
  tt as mountConfig
};
//# sourceMappingURL=lazy-mount-EpZPRSvA.js.map
