import { g as ne, h as oe, W as se, P as ie } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as J, computed as F, openBlock as g, createElementBlock as h, withModifiers as T, Fragment as W, createElementVNode as a, createTextVNode as U, toDisplayString as E, createCommentVNode as O, createVNode as p, unref as m, watch as G, onBeforeUnmount as ae, ref as C, withDirectives as le, vModelText as re, withCtx as L, normalizeClass as R, renderList as de, withKeys as q } from "vue";
import { s as N, e as z, _ as ce, l as ue } from "./toolCatalog-DTcZpeT0.js";
import { s as pe } from "./index-BvJc5yvO.js";
import { on as ve, api as M, host as Q, loadByTagName as me, define as fe } from "@wippy-fe/proxy";
import { Icon as k } from "@iconify/vue";
import { s as _e } from "./styles-BB131pAp.js";
const ge = { key: 0 }, he = /* @__PURE__ */ J({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(i) {
    const l = i, _ = F(() => l.state.deletion_job === null || ["dead", "cancelled"].includes(l.state.deletion_job?.status || ""));
    return (d, f) => i.state.deleting_at ? (g(), h("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = T(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = T(() => {
      }, ["stop"]))
    }, [
      _.value ? (g(), h(W, { key: 0 }, [
        a("span", null, [
          f[3] || (f[3] = U("Deletion failed", -1)),
          i.state.deletion_job?.last_error ? (g(), h("span", ge, ": " + E(i.state.deletion_job.last_error), 1)) : O("", !0)
        ]),
        p(m(N), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = T((s) => d.$emit("retry"), ["stop"]))
        })
      ], 64)) : (g(), h(W, { key: 1 }, [
        p(m(pe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = a("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : O("", !0);
  }
});
function V(i) {
  return !!i && typeof i == "object" && !Array.isArray(i);
}
function be(i, l) {
  return i;
}
function ye(i, l, _) {
  const d = V(i) ? i : {}, f = [
    d,
    V(d.data) ? d.data : null,
    V(d.payload) ? d.payload : null,
    V(d.detail) ? d.detail : null
  ].filter(Boolean);
  for (const s of f) {
    if (s.event !== "component.meta.changed" && s.event !== "component.deleting" && s.event !== "component.deleted") continue;
    const b = String(s.component_id || ""), x = String(d.topic || s.topic || "");
    if (!b && (!x.startsWith("component.") || x === "component.")) continue;
    const w = b || l || x.slice(10);
    return s.event === "component.deleting" && typeof s.deletion_job_id == "string" && s.deletion_job_id ? { event: s.event, component_id: w, deletion_job_id: s.deletion_job_id } : s.event !== "component.meta.changed" ? { event: s.event, component_id: w } : {
      event: "component.meta.changed",
      component_id: w,
      meta: be(V(s.meta) ? s.meta : {}),
      deleted: Array.isArray(s.deleted) ? s.deleted.map(String) : []
    };
  }
  return null;
}
function ke(i, l) {
  const _ = ye(i, l);
  return _ && _.event !== "component.meta.changed" ? _ : null;
}
function Ce(i, l, _, d) {
  let f = !0;
  const s = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Map();
  function x(v, r) {
    const c = i.value.find((D) => l(D) === v), n = b.get(v), u = r?.job_id || n?.deletion_job_id || c?.deletion_job_id, j = n ? n.deletion_job_id : c?.deleting_at ? c.deletion_job_id : void 0;
    if ((n || c?.deleting_at) && u === j) return;
    const $ = {
      deleting_at: n?.deleting_at || c?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: u
    };
    b.set(v, $), c && (Object.assign(c, $), c.deletion_job = void 0);
  }
  async function w(v) {
    const r = l(v), c = b.get(r), n = () => f && i.value.includes(v) && b.get(r) === c;
    try {
      const { data: u } = await M.get(`/api/v1/components/${encodeURIComponent(r)}`);
      if (!u?.success) throw new Error(z(u, "Could not read deletion progress"));
      n() && (v.deleting_at = c?.deleting_at || u.deleting_at, v.deletion_job_id = u.deletion_job_id, c && (c.deletion_job_id = v.deletion_job_id), v.deletion_job = u.deletion_job ?? null);
    } catch (u) {
      n() && Q.handleError("other", { message: z(u, "Could not read deletion progress") });
    }
  }
  let I = [];
  const B = G(() => i.value, (v, r = []) => {
    const c = v.filter((n) => !s.has(l(n)));
    for (const n of r)
      s.has(l(n)) || c.some((u) => l(u) === l(n)) || n.deleting_at && d?.(l(n));
    if (c.length !== v.length) {
      i.value = c;
      return;
    }
    for (const n of v) {
      const u = b.get(l(n));
      u && (n.deletion_job_id !== u.deletion_job_id && (n.deletion_job = void 0), Object.assign(n, u));
      const j = r.find(($) => l($) === l(n));
      n.deletion_job === void 0 && j?.deletion_job_id === n.deletion_job_id && (n.deletion_job = j?.deletion_job), n.deleting_at && !I.includes(n) && w(n);
    }
    I = v;
  }, { immediate: !0 }), K = ve("@message", (v) => {
    const r = ke(v);
    if (!r) return;
    const c = i.value.find((n) => l(n) === r.component_id);
    r.event === "component.deleted" ? (c && !s.has(r.component_id) && d?.(r.component_id), s.add(r.component_id), b.delete(r.component_id), i.value = i.value.filter((n) => l(n) !== r.component_id)) : c && x(r.component_id, { job_id: r.deletion_job_id });
  });
  return ae(() => {
    f = !1, B(), typeof K == "function" && K();
  }), { acceptDeletion: x };
}
const xe = () => ne(), je = { class: "kx" }, we = { class: "kx-head" }, $e = { class: "kx-head-icon" }, Ee = { class: "kx-head-actions" }, De = { class: "kx-count" }, Se = { class: "kx-search" }, Ne = {
  key: 0,
  class: "kx-err"
}, Te = { class: "kx-body" }, Ae = {
  key: 0,
  class: "kx-loading"
}, Le = {
  key: 1,
  class: "kx-empty"
}, Re = { class: "kx-empty-ico" }, Ve = {
  key: 2,
  class: "kx-empty"
}, Ue = {
  key: 3,
  class: "kx-grid"
}, Me = ["onClick", "onKeydown"], Oe = { class: "kx-card-head" }, Ie = { class: "kx-ficon" }, Ke = { class: "kx-card-id" }, ze = ["title"], Be = {
  key: 0,
  class: "kx-card-meta"
}, Pe = ["title"], We = { class: "kx-card-desc" }, He = ["disabled", "onClick", "title"], qe = /* @__PURE__ */ J({
  __name: "agents",
  setup(i) {
    const l = C(!1), _ = C(""), d = C([]), f = C(""), s = C([]), b = C([]), x = C([]), w = xe();
    function I(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function B(e) {
      return e ? e.startsWith("class:") ? I(e.slice(6)) : x.value.find((o) => o.name === e)?.title || e : "";
    }
    function K(e) {
      return !!e && e.startsWith("class:");
    }
    const v = F(() => {
      const e = f.value.trim().toLowerCase();
      return e ? d.value.filter(
        (o) => (o.title || "").toLowerCase().includes(e) || (o.description || "").toLowerCase().includes(e)
      ) : d.value;
    });
    async function r() {
      l.value = !0, _.value = "";
      try {
        const { data: e } = await M.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        d.value = e.agents || [];
      } catch (e) {
        _.value = z(e, "could not load agents");
      } finally {
        l.value = !1;
      }
    }
    async function c() {
      try {
        const { data: e } = await M.get("/api/v1/agents/traits");
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
        const { data: e } = await M.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        x.value = e?.success ? e.models || [] : [];
      } catch {
        x.value = [];
      }
    }
    function n(e) {
      e.start_token && w("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const u = C(!1), j = C(null);
    function $() {
      j.value = null, u.value = !0;
    }
    function D(e) {
      j.value = e.id, u.value = !0;
    }
    function X() {
      u.value = !1, r();
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
          const { data: t } = await M.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          te(e.id, t), await r();
        } catch (t) {
          _.value = z(t, "delete failed");
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
          await me("kickside-share", { timeoutMs: 8e3 });
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
      await Promise.all([r(), c()]);
    });
    const { acceptDeletion: te } = Ce(d, (e) => e.id, void 0, r);
    return (e, o) => (g(), h("div", je, [
      a("header", we, [
        a("div", $e, [
          p(m(k), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        o[3] || (o[3] = a("div", { class: "kx-head-text" }, [
          a("h1", { class: "kx-title" }, "Agents"),
          a("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        a("div", Ee, [
          a("span", De, [
            p(m(k), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            U(" " + E(d.value.length) + " agent" + E(d.value.length !== 1 ? "s" : ""), 1)
          ]),
          a("div", Se, [
            p(m(k), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            le(a("input", {
              "onUpdate:modelValue": o[0] || (o[0] = (t) => f.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [re, f.value]
            ])
          ]),
          p(m(N), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: $
          }, {
            icon: L(({ class: t }) => [
              p(m(k), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      _.value ? (g(), h("div", Ne, E(_.value), 1)) : O("", !0),
      a("div", Te, [
        l.value && !d.value.length ? (g(), h("div", Ae, [
          p(m(k), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          o[4] || (o[4] = U(" Loading… ", -1))
        ])) : d.value.length ? v.value.length ? (g(), h("div", Ue, [
          (g(!0), h(W, null, de(v.value, (t) => (g(), h("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (y) => !t.deleting_at && D(t),
            onKeydown: [
              q((y) => !t.deleting_at && D(t), ["enter"]),
              q(T((y) => !t.deleting_at && D(t), ["prevent"]), ["space"])
            ]
          }, [
            p(he, {
              state: t,
              onRetry: (y) => H(t)
            }, null, 8, ["state", "onRetry"]),
            a("div", Oe, [
              a("span", Ie, [
                p(m(k), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              a("div", Ke, [
                a("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, E(t.title || "(untitled)"), 9, ze),
                t.model ? (g(), h("div", Be, [
                  a("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    p(m(k), {
                      icon: K(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    U(" " + E(B(t.model)), 1)
                  ], 8, Pe)
                ])) : O("", !0)
              ]),
              a("div", {
                class: "kx-card-actions",
                onClick: o[1] || (o[1] = T(() => {
                }, ["stop"]))
              }, [
                p(m(N), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (y) => !t.deleting_at && D(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: L(({ class: y }) => [
                    p(m(k), {
                      icon: "tabler:pencil",
                      class: R(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                p(m(N), {
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
                    p(m(k), {
                      icon: "tabler:share",
                      class: R(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                p(m(N), {
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
                    p(m(k), {
                      icon: "tabler:trash",
                      class: R(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            a("div", We, E(t.description || "No description"), 1),
            a("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: T((y) => n(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              p(m(k), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              o[8] || (o[8] = U(" Chat ", -1))
            ], 8, He)
          ], 40, Me))), 128))
        ])) : (g(), h("div", Ve, [...o[7] || (o[7] = [
          a("div", { class: "kx-empty-title" }, "No matches", -1),
          a("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (g(), h("div", Le, [
          a("div", Re, [
            p(m(k), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          o[5] || (o[5] = a("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          o[6] || (o[6] = a("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          p(m(N), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: $
          }, {
            icon: L(({ class: t }) => [
              p(m(k), {
                icon: "tabler:plus",
                class: R(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      p(ce, {
        open: u.value,
        "agent-id": j.value,
        traits: s.value,
        tools: b.value,
        models: x.value,
        agents: d.value,
        onClose: o[2] || (o[2] = (t) => u.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      A.value ? (g(), h("div", {
        key: 1,
        ref_key: "shareHost",
        ref: S
      }, null, 512)) : O("", !0)
    ]));
  }
}), Je = { props: { type: "object", properties: {} } }, Fe = {
  wippy: Je
};
class Ge extends se {
  static get wippyConfig() {
    return {
      propsSchema: Fe.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: _e
    };
  }
  static get vueConfig() {
    return { rootComponent: qe, plugins: [ie] };
  }
}
fe(import.meta.url, Ge);
//# sourceMappingURL=index.js.map
