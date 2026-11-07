import { g as ne, h as oe, W as se, P as ie } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as F, computed as J, openBlock as g, createElementBlock as h, withModifiers as T, Fragment as W, createElementVNode as a, createTextVNode as U, toDisplayString as D, createCommentVNode as M, createVNode as u, unref as m, watch as G, onBeforeUnmount as ae, ref as C, withDirectives as le, vModelText as re, withCtx as L, normalizeClass as R, renderList as de, withKeys as q } from "vue";
import { s as N, e as z, _ as ce, l as ue } from "./toolCatalog-BlyBDd4C.js";
import { s as pe } from "./index-BvJc5yvO.js";
import { _ as ve } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as me, api as I, host as Q, loadByTagName as _e, define as fe } from "@wippy-fe/proxy";
import { Icon as k } from "@iconify/vue";
import { s as ge } from "./styles-CN0_5BM1.js";
const he = { key: 0 }, be = /* @__PURE__ */ F({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(i) {
    const l = i, f = J(() => l.state.deletion_job === null || ["dead", "cancelled"].includes(l.state.deletion_job?.status || ""));
    return (p, _) => i.state.deleting_at ? (g(), h("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: _[1] || (_[1] = T(() => {
      }, ["stop"])),
      onKeydown: _[2] || (_[2] = T(() => {
      }, ["stop"]))
    }, [
      f.value ? (g(), h(W, { key: 0 }, [
        a("span", null, [
          _[3] || (_[3] = U("Deletion failed", -1)),
          i.state.deletion_job?.last_error ? (g(), h("span", he, ": " + D(i.state.deletion_job.last_error), 1)) : M("", !0)
        ]),
        u(m(N), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: _[0] || (_[0] = T((s) => p.$emit("retry"), ["stop"]))
        })
      ], 64)) : (g(), h(W, { key: 1 }, [
        u(m(pe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        _[4] || (_[4] = a("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : M("", !0);
  }
}), ye = /* @__PURE__ */ ve(be, [["__scopeId", "data-v-63c136c7"]]);
function V(i) {
  return !!i && typeof i == "object" && !Array.isArray(i);
}
function ke(i, l) {
  return i;
}
function Ce(i, l, f) {
  const p = V(i) ? i : {}, _ = [
    p,
    V(p.data) ? p.data : null,
    V(p.payload) ? p.payload : null,
    V(p.detail) ? p.detail : null
  ].filter(Boolean);
  for (const s of _) {
    if (s.event !== "component.meta.changed" && s.event !== "component.deleting" && s.event !== "component.deleted") continue;
    const b = String(s.component_id || ""), x = String(p.topic || s.topic || "");
    if (!b && (!x.startsWith("component.") || x === "component.")) continue;
    const w = b || l || x.slice(10);
    return s.event === "component.deleting" && typeof s.deletion_job_id == "string" && s.deletion_job_id ? { event: s.event, component_id: w, deletion_job_id: s.deletion_job_id } : s.event !== "component.meta.changed" ? { event: s.event, component_id: w } : {
      event: "component.meta.changed",
      component_id: w,
      meta: ke(V(s.meta) ? s.meta : {}),
      deleted: Array.isArray(s.deleted) ? s.deleted.map(String) : []
    };
  }
  return null;
}
function xe(i, l) {
  const f = Ce(i, l);
  return f && f.event !== "component.meta.changed" ? f : null;
}
function je(i, l, f, p) {
  let _ = !0;
  const s = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Map();
  function x(v, r) {
    const d = i.value.find((E) => l(E) === v), n = b.get(v), c = r?.job_id || n?.deletion_job_id || d?.deletion_job_id, j = n ? n.deletion_job_id : d?.deleting_at ? d.deletion_job_id : void 0;
    if ((n || d?.deleting_at) && c === j) return;
    const $ = {
      deleting_at: n?.deleting_at || d?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: c
    };
    b.set(v, $), d && (Object.assign(d, $), d.deletion_job = void 0);
  }
  async function w(v) {
    const r = l(v), d = b.get(r), n = () => _ && i.value.includes(v) && b.get(r) === d;
    try {
      const { data: c } = await I.get(`/api/v1/components/${encodeURIComponent(r)}`);
      if (!c?.success) throw new Error(z(c, "Could not read deletion progress"));
      n() && (v.deleting_at = d?.deleting_at || c.deleting_at, v.deletion_job_id = c.deletion_job_id, d && (d.deletion_job_id = v.deletion_job_id), v.deletion_job = c.deletion_job ?? null);
    } catch (c) {
      n() && Q.handleError("other", { message: z(c, "Could not read deletion progress") });
    }
  }
  let O = [];
  const B = G(() => i.value, (v, r = []) => {
    const d = v.filter((n) => !s.has(l(n)));
    for (const n of r)
      s.has(l(n)) || d.some((c) => l(c) === l(n)) || n.deleting_at;
    if (d.length !== v.length) {
      i.value = d;
      return;
    }
    for (const n of v) {
      const c = b.get(l(n));
      c && (n.deletion_job_id !== c.deletion_job_id && (n.deletion_job = void 0), Object.assign(n, c));
      const j = r.find(($) => l($) === l(n));
      n.deletion_job === void 0 && j?.deletion_job_id === n.deletion_job_id && (n.deletion_job = j?.deletion_job), n.deleting_at && !O.includes(n) && w(n);
    }
    O = v;
  }, { immediate: !0 }), K = me("@message", (v) => {
    const r = xe(v);
    if (!r) return;
    const d = i.value.find((n) => l(n) === r.component_id);
    r.event === "component.deleted" ? (d && s.has(r.component_id), s.add(r.component_id), b.delete(r.component_id), i.value = i.value.filter((n) => l(n) !== r.component_id)) : d && x(r.component_id, { job_id: r.deletion_job_id });
  });
  return ae(() => {
    _ = !1, B(), typeof K == "function" && K();
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
  setup(i) {
    const l = C(!1), f = C(""), p = C([]), _ = C(""), s = C([]), b = C([]), x = C([]), w = we();
    function O(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function B(e) {
      return e ? e.startsWith("class:") ? O(e.slice(6)) : x.value.find((o) => o.name === e)?.title || e : "";
    }
    function K(e) {
      return !!e && e.startsWith("class:");
    }
    const v = J(() => {
      const e = _.value.trim().toLowerCase();
      return e ? p.value.filter(
        (o) => (o.title || "").toLowerCase().includes(e) || (o.description || "").toLowerCase().includes(e)
      ) : p.value;
    });
    async function r() {
      l.value = !0, f.value = "";
      try {
        const { data: e } = await I.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        p.value = e.agents || [];
      } catch (e) {
        f.value = z(e, "could not load agents");
      } finally {
        l.value = !1;
      }
    }
    async function d() {
      try {
        const { data: e } = await I.get("/api/v1/agents/traits");
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
        const { data: e } = await I.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
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
      c.value = !1, r();
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
        f.value = "";
        try {
          const { data: t } = await I.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          te(e.id, t), await r();
        } catch (t) {
          f.value = z(t, "delete failed");
        }
      }
    }
    const A = C(!1), P = C(null), S = C(null);
    function Y(e) {
      P.value = e, A.value = !0;
    }
    function Z() {
      A.value = !1, P.value = null;
    }
    async function ee() {
      const e = P.value;
      if (!S.value || !e) return;
      if (S.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await _e("kickside-share", { timeoutMs: 8e3 });
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
    G([A, S], async () => {
      A.value && S.value && await ee();
    }), oe(async () => {
      await Promise.all([r(), d()]);
    });
    const { acceptDeletion: te } = je(p, (e) => e.id);
    return (e, o) => (g(), h("div", $e, [
      a("header", De, [
        a("div", Ee, [
          u(m(k), {
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
            u(m(k), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            U(" " + D(p.value.length) + " agent" + D(p.value.length !== 1 ? "s" : ""), 1)
          ]),
          a("div", Te, [
            u(m(k), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            le(a("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (t) => _.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [re, _.value]
            ])
          ]),
          u(m(N), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: $
          }, {
            icon: L(({ class: t }) => [
              u(m(k), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      f.value ? (g(), h("div", Ae, D(f.value), 1)) : M("", !0),
      a("div", Le, [
        l.value && !p.value.length ? (g(), h("div", Re, [
          u(m(k), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[4] || (o[4] = U(" Loading… ", -1))
        ])) : p.value.length ? v.value.length ? (g(), h("div", Me, [
          (g(!0), h(W, null, de(v.value, (t) => (g(), h("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (y) => !t.deleting_at && E(t),
            onKeydown: [
              q((y) => !t.deleting_at && E(t), ["enter"]),
              q(T((y) => !t.deleting_at && E(t), ["prevent"]), ["space"])
            ]
          }, [
            u(ye, {
              state: t,
              onRetry: (y) => H(t)
            }, null, 8, ["state", "onRetry"]),
            a("div", Ke, [
              a("span", ze, [
                u(m(k), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              a("div", Be, [
                a("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, D(t.title || "(untitled)"), 9, Pe),
                t.model ? (g(), h("div", We, [
                  a("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    u(m(k), {
                      icon: K(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    U(" " + D(B(t.model)), 1)
                  ], 8, He)
                ])) : M("", !0)
              ]),
              a("div", {
                class: "kx-card-actions",
                onClick: o[1] || (o[1] = T(() => {
                }, ["stop"]))
              }, [
                u(m(N), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (y) => !t.deleting_at && E(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: L(({ class: y }) => [
                    u(m(k), {
                      icon: "tabler:pencil",
                      class: R(y),
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
                  onClick: (y) => Y(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: L(({ class: y }) => [
                    u(m(k), {
                      icon: "tabler:share",
                      class: R(y),
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
                  onClick: (y) => H(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: L(({ class: y }) => [
                    u(m(k), {
                      icon: "tabler:trash",
                      class: R(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            a("div", qe, D(t.description || "No description"), 1),
            a("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: T((y) => n(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              u(m(k), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              o[8] || (o[8] = U(" Chat ", -1))
            ], 8, Fe)
          ], 40, Oe))), 128))
        ])) : (g(), h("div", Ie, [...o[7] || (o[7] = [
          a("div", { class: "kx-empty-title" }, "No matches", -1),
          a("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (g(), h("div", Ve, [
          a("div", Ue, [
            u(m(k), {
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
            icon: L(({ class: t }) => [
              u(m(k), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      u(ce, {
        open: c.value,
        "agent-id": j.value,
        traits: s.value,
        tools: b.value,
        models: x.value,
        agents: p.value,
        onClose: o[2] || (o[2] = (t) => c.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      A.value ? (g(), h("div", {
        key: 1,
        ref_key: "shareHost",
        ref: S
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
      inlineCss: ge
    };
  }
  static get vueConfig() {
    return { rootComponent: Je, plugins: [ie] };
  }
}
fe(import.meta.url, Xe);
//# sourceMappingURL=index.js.map
