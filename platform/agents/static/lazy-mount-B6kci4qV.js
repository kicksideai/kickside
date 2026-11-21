import { j as ne, m as oe, P as se } from "./wc-runtime-BREvwtdZ.js";
import { defineComponent as F, computed as G, openBlock as m, createElementBlock as g, withModifiers as L, Fragment as H, createElementVNode as l, createTextVNode as O, toDisplayString as S, createCommentVNode as V, createVNode as r, unref as u, watch as Q, onBeforeUnmount as ae, ref as y, withDirectives as ie, vModelText as le, withCtx as A, normalizeClass as R, renderList as de, withKeys as W } from "vue";
import { s as N, _ as re, e as J } from "./AgentForm.vue_vue_type_script_setup_true_lang-BUpruGfm.js";
import { s as ce } from "./index-C6kCivCd.js";
import { on as ue, host as pe, api as I, loadByTagName as ve } from "@wippy-fe/proxy";
import { Icon as b } from "@iconify/vue";
import { l as _e } from "./toolCatalog-W6OjlU7E.js";
const fe = { key: 0 }, me = /* @__PURE__ */ F({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(s) {
    const i = s, f = G(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (d, c) => s.state.deleting_at ? (m(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: c[1] || (c[1] = L(() => {
      }, ["stop"])),
      onKeydown: c[2] || (c[2] = L(() => {
      }, ["stop"]))
    }, [
      f.value ? (m(), g(H, { key: 0 }, [
        l("span", null, [
          c[3] || (c[3] = O("Deletion failed", -1)),
          s.state.deletion_job?.last_error ? (m(), g("span", fe, ": " + S(s.state.deletion_job.last_error), 1)) : V("", !0)
        ]),
        r(u(N), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: c[0] || (c[0] = L((a) => d.$emit("retry"), ["stop"]))
        })
      ], 64)) : (m(), g(H, { key: 1 }, [
        r(u(ce), {
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
function ge(s, i) {
  return s;
}
function he(s, i, f) {
  const d = M(s) ? s : {}, c = [
    d,
    M(d.data) ? d.data : null,
    M(d.payload) ? d.payload : null,
    M(d.detail) ? d.detail : null
  ].filter(Boolean);
  for (const a of c) {
    if (a.event !== "component.meta.changed" && a.event !== "component.deleting" && a.event !== "component.deleted") continue;
    const w = String(a.component_id || ""), j = String(d.topic || a.topic || "");
    if (!w && (!j.startsWith("component.") || j === "component.")) continue;
    const D = w || i || j.slice(10);
    return a.event === "component.deleting" && typeof a.deletion_job_id == "string" && a.deletion_job_id ? { event: a.event, component_id: D, deletion_job_id: a.deletion_job_id } : a.event !== "component.meta.changed" ? { event: a.event, component_id: D } : {
      event: "component.meta.changed",
      component_id: D,
      meta: ge(M(a.meta) ? a.meta : {}),
      deleted: Array.isArray(a.deleted) ? a.deleted.map(String) : []
    };
  }
  return null;
}
function be(s, i) {
  const f = he(s, i);
  return f && f.event !== "component.meta.changed" ? f : null;
}
function ke(s, i, f, d) {
  const c = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
  function w(C, v) {
    const _ = s.value.find((x) => i(x) === C), n = a.get(C), p = v?.job_id || n?.state.deletion_job_id || _?.deletion_job_id, $ = n ? n.state.deletion_job_id : _?.deleting_at ? _.deletion_job_id : void 0;
    if ((n || _?.deleting_at) && p === $ || p && n?.superseded.has(p)) return;
    const k = {
      deleting_at: n?.state.deleting_at || _?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: p
    }, z = new Set(n?.superseded);
    for (const x of [n?.state.deletion_job_id, _?.deletion_job_id])
      x && x !== p && z.add(x);
    a.set(C, { state: k, superseded: z }), _ && (Object.assign(_, k), _.deletion_job = void 0);
  }
  const j = Q(() => s.value, (C, v = []) => {
    const _ = C.filter((n) => !c.has(i(n)));
    for (const n of v)
      c.has(i(n)) || _.some((p) => i(p) === i(n)) || n.deleting_at && d?.(i(n));
    if (_.length !== C.length) {
      s.value = _;
      return;
    }
    for (const n of C) {
      n.deleting_at && n.deletion_job === void 0 && !v.includes(n) && (n.deletion_job = null);
      const p = a.get(i(n));
      if (p) {
        const k = n.deletion_job_id;
        n.deleting_at && k && k !== p.state.deletion_job_id && !p.superseded.has(k) && (p.state.deletion_job_id && p.superseded.add(p.state.deletion_job_id), p.state.deletion_job_id = k), k !== p.state.deletion_job_id && (n.deletion_job = void 0), Object.assign(n, p.state);
      }
      const $ = v.find((k) => i(k) === i(n));
      n.deletion_job === void 0 && $?.deletion_job_id === n.deletion_job_id && (n.deletion_job = $?.deletion_job);
    }
  }, { immediate: !0 }), D = ue("@message", (C) => {
    const v = be(C);
    if (!v) return;
    const _ = s.value.find((n) => i(n) === v.component_id);
    v.event === "component.deleted" ? (_ && !c.has(v.component_id) && d?.(v.component_id), c.add(v.component_id), a.delete(v.component_id), s.value = s.value.filter((n) => i(n) !== v.component_id)) : _ && w(v.component_id, { job_id: v.deletion_job_id });
  });
  return ae(() => {
    j(), typeof D == "function" && D();
  }), { acceptDeletion: w };
}
const ye = () => ne();
function Ce() {
  let s = 0;
  return () => {
    const i = ++s;
    return () => i === s;
  };
}
const xe = { class: "kx" }, je = { class: "kx-head" }, we = { class: "kx-head-icon" }, $e = { class: "kx-head-actions" }, De = { class: "kx-count" }, Se = { class: "kx-search" }, Ee = {
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
}, Oe = ["onClick", "onKeydown"], Ve = { class: "kx-card-head" }, ze = { class: "kx-ficon" }, Be = { class: "kx-card-id" }, Ie = ["title"], Pe = {
  key: 0,
  class: "kx-card-meta"
}, Ue = ["title"], He = { class: "kx-card-desc" }, Ke = ["disabled", "onClick", "title"], qe = /* @__PURE__ */ F({
  __name: "agents",
  setup(s) {
    const i = y(!1), f = y(""), d = y([]), c = y(""), a = y([]), w = y([]), j = y([]), D = ye();
    function C(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function v(e) {
      return e ? e.startsWith("class:") ? C(e.slice(6)) : j.value.find((o) => o.name === e)?.title || e : "";
    }
    function _(e) {
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
      i.value = !0, f.value = "";
      try {
        const { data: o } = await I.get("/api/v1/user-agents");
        if (!o?.success) throw new Error(o?.error || "failed to load agents");
        e() && (d.value = o.agents || []);
      } catch (o) {
        e() && (f.value = J(o, "could not load agents"));
      } finally {
        e() && (i.value = !1);
      }
    }
    async function k() {
      try {
        const { data: e } = await I.get("/api/v1/agents/traits");
        a.value = e?.success ? e.traits || [] : [];
      } catch {
        a.value = [];
      }
      try {
        w.value = await _e();
      } catch {
        w.value = [];
      }
      try {
        const { data: e } = await I.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        j.value = e?.success ? e.models || [] : [];
      } catch {
        j.value = [];
      }
    }
    function z(e) {
      e.start_token && D("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const x = y(!1), P = y(null);
    function K() {
      P.value = null, x.value = !0;
    }
    function B(e) {
      P.value = e.id, x.value = !0;
    }
    function X() {
      x.value = !1, $();
    }
    async function q(e) {
      if (await pe.confirm({
        header: "Delete agent",
        message: `Delete “${e.title || "(untitled)"}”? This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        f.value = "";
        try {
          const { data: t } = await I.delete(`/api/v1/user-agents/${e.id}`);
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
          await ve("kickside-share", { timeoutMs: 8e3 });
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
      await Promise.all([$(), k()]);
    });
    const { acceptDeletion: te } = ke(d, (e) => e.id, void 0, $);
    return (e, o) => (m(), g("div", xe, [
      l("header", je, [
        l("div", we, [
          r(u(b), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = l("div", { class: "kx-head-text" }, [
          l("h1", { class: "kx-title" }, "Agents"),
          l("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        l("div", $e, [
          l("span", De, [
            r(u(b), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            O(" " + S(d.value.length) + " agent" + S(d.value.length !== 1 ? "s" : ""), 1)
          ]),
          l("div", Se, [
            r(u(b), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            ie(l("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (t) => c.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [le, c.value]
            ])
          ]),
          r(u(N), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: K
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
      f.value ? (m(), g("div", Ee, S(f.value), 1)) : V("", !0),
      l("div", Ne, [
        i.value && !d.value.length ? (m(), g("div", Le, [
          r(u(b), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[4] || (o[4] = O(" Loading… ", -1))
        ])) : d.value.length ? n.value.length ? (m(), g("div", Me, [
          (m(!0), g(H, null, de(n.value, (t) => (m(), g("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (h) => !t.deleting_at && B(t),
            onKeydown: [
              W((h) => !t.deleting_at && B(t), ["enter"]),
              W(L((h) => !t.deleting_at && B(t), ["prevent"]), ["space"])
            ]
          }, [
            r(me, {
              state: t,
              onRetry: (h) => q(t)
            }, null, 8, ["state", "onRetry"]),
            l("div", Ve, [
              l("span", ze, [
                r(u(b), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              l("div", Be, [
                l("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, S(t.title || "(untitled)"), 9, Ie),
                t.model ? (m(), g("div", Pe, [
                  l("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    r(u(b), {
                      icon: _(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    O(" " + S(v(t.model)), 1)
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
                  onClick: (h) => !t.deleting_at && B(t),
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
                  onClick: (h) => q(t),
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
            l("div", He, S(t.description || "No description"), 1),
            l("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: L((h) => z(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              r(u(b), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              o[8] || (o[8] = O(" Chat ", -1))
            ], 8, Ke)
          ], 40, Oe))), 128))
        ])) : (m(), g("div", Re, [...o[7] || (o[7] = [
          l("div", { class: "kx-empty-title" }, "No matches", -1),
          l("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (m(), g("div", Te, [
          l("div", Ae, [
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
            onClick: K
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
      r(re, {
        open: x.value,
        "agent-id": P.value,
        traits: a.value,
        tools: w.value,
        models: j.value,
        agents: d.value,
        onClose: o[2] || (o[2] = (t) => x.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      T.value ? (m(), g("div", {
        key: 1,
        ref_key: "shareHost",
        ref: E
      }, null, 512)) : V("", !0)
    ]));
  }
}), Ze = {
  rootComponent: qe,
  plugins: [se]
};
export {
  Ze as mountConfig
};
//# sourceMappingURL=lazy-mount-B6kci4qV.js.map
