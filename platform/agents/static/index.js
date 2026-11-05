import { g as ne, h as se, W as oe, P as ae } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as H, computed as q, openBlock as h, createElementBlock as g, withModifiers as E, Fragment as B, createElementVNode as o, createTextVNode as R, toDisplayString as w, createCommentVNode as U, createVNode as i, unref as d, watch as F, onBeforeUnmount as ie, ref as k, withDirectives as le, vModelText as re, withCtx as T, normalizeClass as A, renderList as ce, withKeys as W } from "vue";
import { s as D, e as K, _ as de, l as ue } from "./toolCatalog-BlyBDd4C.js";
import { s as pe } from "./index-BvJc5yvO.js";
import { _ as ve } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as me, api as V, host as J, loadByTagName as fe, define as he } from "@wippy-fe/proxy";
import { Icon as _ } from "@iconify/vue";
import { s as ge } from "./styles-CN0_5BM1.js";
const ye = { key: 0 }, _e = /* @__PURE__ */ H({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(s) {
    const c = s, f = q(() => c.state.deletion_job === null || ["dead", "cancelled"].includes(c.state.deletion_job?.status || ""));
    return (a, l) => s.state.deleting_at ? (h(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: l[1] || (l[1] = E(() => {
      }, ["stop"])),
      onKeydown: l[2] || (l[2] = E(() => {
      }, ["stop"]))
    }, [
      f.value ? (h(), g(B, { key: 0 }, [
        o("span", null, [
          l[3] || (l[3] = R("Deletion failed", -1)),
          s.state.deletion_job?.last_error ? (h(), g("span", ye, ": " + w(s.state.deletion_job.last_error), 1)) : U("", !0)
        ]),
        i(d(D), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: l[0] || (l[0] = E((u) => a.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), g(B, { key: 1 }, [
        i(d(pe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        l[4] || (l[4] = o("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : U("", !0);
  }
}), ke = /* @__PURE__ */ ve(_e, [["__scopeId", "data-v-69a579d4"]]);
function L(s) {
  return !!s && typeof s == "object" && !Array.isArray(s);
}
function be(s, c) {
  return s;
}
function Ce(s, c, f) {
  const a = L(s) ? s : {}, l = [
    a,
    L(a.data) ? a.data : null,
    L(a.payload) ? a.payload : null,
    L(a.detail) ? a.detail : null
  ].filter(Boolean);
  for (const u of l) {
    if (u.event !== "component.meta.changed" && u.event !== "component.deleting" && u.event !== "component.deleted") continue;
    const C = String(u.component_id || ""), b = String(a.topic || u.topic || "");
    if (!C && (!b.startsWith("component.") || b === "component.")) continue;
    const x = C || c || b.slice(10);
    return u.event !== "component.meta.changed" ? { event: u.event, component_id: x } : {
      event: "component.meta.changed",
      component_id: x,
      meta: be(L(u.meta) ? u.meta : {}),
      deleted: Array.isArray(u.deleted) ? u.deleted.map(String) : []
    };
  }
  return null;
}
function xe(s, c) {
  const f = Ce(s, c);
  return f && f.event !== "component.meta.changed" ? f : null;
}
function we(s, c, f) {
  let a = !0;
  const l = /* @__PURE__ */ new Set();
  function u(p, r) {
    const v = s.value.find((m) => c(m) === p);
    v && (v.deleting_at = v.deleting_at || (/* @__PURE__ */ new Date()).toISOString(), v.deletion_job_id = r?.job_id || v.deletion_job_id, v.deletion_job = void 0);
  }
  async function C(p) {
    p.deletion_job = void 0;
    try {
      const { data: r } = await V.get(`/api/v1/components/${encodeURIComponent(c(p))}`);
      if (!r?.success) throw new Error(K(r, "Could not read deletion progress"));
      a && s.value.includes(p) && (p.deleting_at = r.deleting_at, p.deletion_job_id = r.deletion_job_id, p.deletion_job = r.deletion_job ?? null);
    } catch (r) {
      a && s.value.includes(p) && J.handleError("other", { message: K(r, "Could not read deletion progress") });
    }
  }
  const b = F(() => s.value, (p, r = []) => {
    const v = p.filter((m) => !l.has(c(m)));
    for (const m of r) !l.has(c(m)) && v.some((j) => c(j) === c(m));
    if (v.length !== p.length) {
      s.value = v;
      return;
    }
    for (const m of p) m.deleting_at && C(m);
  }, { immediate: !0 }), x = me("@message", (p) => {
    const r = xe(p);
    if (!r) return;
    const v = s.value.find((m) => c(m) === r.component_id);
    r.event === "component.deleted" ? (v && l.has(r.component_id), l.add(r.component_id), s.value = s.value.filter((m) => c(m) !== r.component_id)) : v && (u(r.component_id), C(v));
  });
  return ie(() => {
    a = !1, b(), typeof x == "function" && x();
  }), { acceptDeletion: u };
}
const $e = () => ne(), De = { class: "kx" }, Ee = { class: "kx-head" }, je = { class: "kx-head-icon" }, Se = { class: "kx-head-actions" }, Ne = { class: "kx-count" }, Te = { class: "kx-search" }, Ae = {
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
}, Ke = {
  key: 3,
  class: "kx-grid"
}, Me = ["onClick", "onKeydown"], ze = { class: "kx-card-head" }, Be = { class: "kx-ficon" }, Oe = { class: "kx-card-id" }, Pe = ["title"], We = {
  key: 0,
  class: "kx-card-meta"
}, He = ["title"], qe = { class: "kx-card-desc" }, Fe = ["disabled", "onClick", "title"], Je = /* @__PURE__ */ H({
  __name: "agents",
  setup(s) {
    const c = k(!1), f = k(""), a = k([]), l = k(""), u = k([]), C = k([]), b = k([]), x = $e();
    function p(e) {
      return e && e.charAt(0).toUpperCase() + e.slice(1);
    }
    function r(e) {
      return e ? e.startsWith("class:") ? p(e.slice(6)) : b.value.find((n) => n.name === e)?.title || e : "";
    }
    function v(e) {
      return !!e && e.startsWith("class:");
    }
    const m = q(() => {
      const e = l.value.trim().toLowerCase();
      return e ? a.value.filter(
        (n) => (n.title || "").toLowerCase().includes(e) || (n.description || "").toLowerCase().includes(e)
      ) : a.value;
    });
    async function j() {
      c.value = !0, f.value = "";
      try {
        const { data: e } = await V.get("/api/v1/user-agents");
        if (!e?.success) throw new Error(e?.error || "failed to load agents");
        a.value = e.agents || [];
      } catch (e) {
        f.value = K(e, "could not load agents");
      } finally {
        c.value = !1;
      }
    }
    async function G() {
      try {
        const { data: e } = await V.get("/api/v1/agents/traits");
        u.value = e?.success ? e.traits || [] : [];
      } catch {
        u.value = [];
      }
      try {
        C.value = await ue();
      } catch {
        C.value = [];
      }
      try {
        const { data: e } = await V.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        b.value = e?.success ? e.models || [] : [];
      } catch {
        b.value = [];
      }
    }
    function Q(e) {
      e.start_token && x("kickside-chat-open", { kind: "start", startToken: e.start_token });
    }
    const S = k(!1), M = k(null);
    function O() {
      M.value = null, S.value = !0;
    }
    function I(e) {
      M.value = e.id, S.value = !0;
    }
    function X() {
      S.value = !1, j();
    }
    async function P(e) {
      if (await J.confirm({
        header: "Delete agent",
        message: `Delete “${e.title || "(untitled)"}”? This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        f.value = "";
        try {
          const { data: t } = await V.delete(`/api/v1/user-agents/${e.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          te(e.id, t), await j();
        } catch (t) {
          f.value = K(t, "delete failed");
        }
      }
    }
    const N = k(!1), z = k(null), $ = k(null);
    function Y(e) {
      z.value = e, N.value = !0;
    }
    function Z() {
      N.value = !1, z.value = null;
    }
    async function ee() {
      const e = z.value;
      if (!$.value || !e) return;
      if ($.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await fe("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const n = document.createElement("kickside-share");
      n.setAttribute("config", JSON.stringify({
        resource_id: e.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(e.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(e.id)}`,
        title: e.title || ""
      })), n.style.display = "block", n.addEventListener("close", Z), $.value.appendChild(n);
    }
    F([N, $], async () => {
      N.value && $.value && await ee();
    }), se(async () => {
      await Promise.all([j(), G()]);
    });
    const { acceptDeletion: te } = we(a, (e) => e.id);
    return (e, n) => (h(), g("div", De, [
      o("header", Ee, [
        o("div", je, [
          i(d(_), {
            icon: "tabler:robot",
            "aria-hidden": "true"
          })
        ]),
        n[3] || (n[3] = o("div", { class: "kx-head-text" }, [
          o("h1", { class: "kx-title" }, "Agents"),
          o("p", { class: "kx-head-sub" }, "Configured assistants — a model, a prompt, and the capabilities and tools they use.")
        ], -1)),
        o("div", Se, [
          o("span", Ne, [
            i(d(_), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            }),
            R(" " + w(a.value.length) + " agent" + w(a.value.length !== 1 ? "s" : ""), 1)
          ]),
          o("div", Te, [
            i(d(_), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            le(o("input", {
              "onUpdate:modelValue": n[0] || (n[0] = (t) => l.value = t),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search agents…"
            }, null, 512), [
              [re, l.value]
            ])
          ]),
          i(d(D), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: O
          }, {
            icon: T(({ class: t }) => [
              i(d(_), {
                icon: "tabler:plus",
                class: A(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      f.value ? (h(), g("div", Ae, w(f.value), 1)) : U("", !0),
      o("div", Le, [
        c.value && !a.value.length ? (h(), g("div", Re, [
          i(d(_), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          n[4] || (n[4] = R(" Loading… ", -1))
        ])) : a.value.length ? m.value.length ? (h(), g("div", Ke, [
          (h(!0), g(B, null, ce(m.value, (t) => (h(), g("div", {
            key: t.id,
            class: "kx-card kx-focus-halo",
            tabindex: "0",
            onClick: (y) => !t.deleting_at && I(t),
            onKeydown: [
              W((y) => !t.deleting_at && I(t), ["enter"]),
              W(E((y) => !t.deleting_at && I(t), ["prevent"]), ["space"])
            ]
          }, [
            i(ke, {
              state: t,
              onRetry: (y) => P(t)
            }, null, 8, ["state", "onRetry"]),
            o("div", ze, [
              o("span", Be, [
                i(d(_), {
                  icon: t.icon || "tabler:robot",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              o("div", Oe, [
                o("div", {
                  class: "kx-card-name",
                  title: t.title || "(untitled)"
                }, w(t.title || "(untitled)"), 9, Pe),
                t.model ? (h(), g("div", We, [
                  o("span", {
                    class: "kx-model",
                    title: t.model
                  }, [
                    i(d(_), {
                      icon: v(t.model) ? "tabler:category" : "tabler:cpu",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    R(" " + w(r(t.model)), 1)
                  ], 8, He)
                ])) : U("", !0)
              ]),
              o("div", {
                class: "kx-card-actions",
                onClick: n[1] || (n[1] = E(() => {
                }, ["stop"]))
              }, [
                i(d(D), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit",
                  "aria-label": `Edit ${t.title}`,
                  onClick: (y) => !t.deleting_at && I(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: T(({ class: y }) => [
                    i(d(_), {
                      icon: "tabler:pencil",
                      class: A(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                i(d(D), {
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
                    i(d(_), {
                      icon: "tabler:share",
                      class: A(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                i(d(D), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${t.title}`,
                  onClick: (y) => P(t),
                  disabled: !!t.deleting_at
                }, {
                  icon: T(({ class: y }) => [
                    i(d(_), {
                      icon: "tabler:trash",
                      class: A(y),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            o("div", qe, w(t.description || "No description"), 1),
            o("button", {
              class: "kx-card-chat",
              disabled: !!t.deleting_at || !t.start_token,
              onClick: E((y) => Q(t), ["stop"]),
              title: t.start_token ? "Chat with this agent" : "Chat unavailable"
            }, [
              i(d(_), {
                icon: "tabler:message",
                "aria-hidden": "true"
              }),
              n[8] || (n[8] = R(" Chat ", -1))
            ], 8, Fe)
          ], 40, Me))), 128))
        ])) : (h(), g("div", Ie, [...n[7] || (n[7] = [
          o("div", { class: "kx-empty-title" }, "No matches", -1),
          o("div", { class: "kx-empty-sub" }, "No agents match the current search.", -1)
        ])])) : (h(), g("div", Ve, [
          o("div", Ue, [
            i(d(_), {
              icon: "tabler:robot",
              "aria-hidden": "true"
            })
          ]),
          n[5] || (n[5] = o("div", { class: "kx-empty-title" }, "No agents yet", -1)),
          n[6] || (n[6] = o("div", { class: "kx-empty-sub" }, "Agents are configured assistants — a model, a prompt, and the capabilities and tools they can use. Create one to get started.", -1)),
          i(d(D), {
            type: "button",
            "data-testid": "agents-create",
            label: "New agent",
            onClick: O
          }, {
            icon: T(({ class: t }) => [
              i(d(_), {
                icon: "tabler:plus",
                class: A(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ]),
      i(de, {
        open: S.value,
        "agent-id": M.value,
        traits: u.value,
        tools: C.value,
        models: b.value,
        agents: a.value,
        onClose: n[2] || (n[2] = (t) => S.value = !1),
        onSaved: X
      }, null, 8, ["open", "agent-id", "traits", "tools", "models", "agents"]),
      N.value ? (h(), g("div", {
        key: 1,
        ref_key: "shareHost",
        ref: $
      }, null, 512)) : U("", !0)
    ]));
  }
}), Ge = { props: { type: "object", properties: {} } }, Qe = {
  wippy: Ge
};
class Xe extends oe {
  static get wippyConfig() {
    return {
      propsSchema: Qe.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ge
    };
  }
  static get vueConfig() {
    return { rootComponent: Je, plugins: [ae] };
  }
}
he(import.meta.url, Xe);
//# sourceMappingURL=index.js.map
