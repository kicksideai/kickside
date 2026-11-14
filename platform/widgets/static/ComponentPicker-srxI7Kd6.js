import { defineComponent as je, computed as p, openBlock as v, createElementBlock as _, withModifiers as N, Fragment as K, createElementVNode as k, createTextVNode as ke, toDisplayString as F, createCommentVNode as M, createVNode as g, unref as S, watch as ae, onBeforeUnmount as Re, ref as w, withKeys as ge, normalizeClass as oe, withCtx as Be, renderList as Pe, createBlock as Ve } from "vue";
import { Icon as E } from "@iconify/vue";
import { on as Fe, api as se } from "@wippy-fe/proxy";
import { a as Ke, u as Me } from "./wc-runtime-CNDpK4lj.js";
import { p as We } from "./pickerValue-SPnnNBeX.js";
import { _ as qe } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import ze from "primevue/button";
import Je from "primevue/progressspinner";
import { _ as Ge } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
const He = () => Ke(), Qe = () => Me(), Xe = { key: 0 }, Ye = /* @__PURE__ */ je({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(c) {
    const o = c, h = p(() => o.state.deletion_job === null || ["dead", "cancelled"].includes(o.state.deletion_job?.status || ""));
    return (a, r) => c.state.deleting_at ? (v(), _("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: r[1] || (r[1] = N(() => {
      }, ["stop"])),
      onKeydown: r[2] || (r[2] = N(() => {
      }, ["stop"]))
    }, [
      h.value ? (v(), _(K, { key: 0 }, [
        k("span", null, [
          r[3] || (r[3] = ke("Deletion failed", -1)),
          c.state.deletion_job?.last_error ? (v(), _("span", Xe, ": " + F(c.state.deletion_job.last_error), 1)) : M("", !0)
        ]),
        g(S(ze), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: r[0] || (r[0] = N((s) => a.$emit("retry"), ["stop"]))
        })
      ], 64)) : (v(), _(K, { key: 1 }, [
        g(S(Je), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        r[4] || (r[4] = k("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : M("", !0);
  }
});
function Y(c) {
  return !!c && typeof c == "object" && !Array.isArray(c);
}
function Ze(c, o) {
  return c;
}
function et(c, o, h) {
  const a = Y(c) ? c : {}, r = [
    a,
    Y(a.data) ? a.data : null,
    Y(a.payload) ? a.payload : null,
    Y(a.detail) ? a.detail : null
  ].filter(Boolean);
  for (const s of r) {
    if (s.event !== "component.meta.changed" && s.event !== "component.deleting" && s.event !== "component.deleted") continue;
    const R = String(s.component_id || ""), B = String(a.topic || s.topic || "");
    if (!R && (!B.startsWith("component.") || B === "component.")) continue;
    const L = R || o || B.slice(10);
    return s.event === "component.deleting" && typeof s.deletion_job_id == "string" && s.deletion_job_id ? { event: s.event, component_id: L, deletion_job_id: s.deletion_job_id } : s.event !== "component.meta.changed" ? { event: s.event, component_id: L } : {
      event: "component.meta.changed",
      component_id: L,
      meta: Ze(Y(s.meta) ? s.meta : {}),
      deleted: Array.isArray(s.deleted) ? s.deleted.map(String) : []
    };
  }
  return null;
}
function tt(c, o) {
  const h = et(c, o);
  return h && h.event !== "component.meta.changed" ? h : null;
}
function nt(c, o, h, a) {
  const r = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
  function R(j, f) {
    const d = c.value.find((U) => o(U) === j), l = s.get(j), u = f?.job_id || l?.state.deletion_job_id || d?.deletion_job_id, I = l ? l.state.deletion_job_id : d?.deleting_at ? d.deletion_job_id : void 0;
    if ((l || d?.deleting_at) && u === I || u && l?.superseded.has(u)) return;
    const y = {
      deleting_at: l?.state.deleting_at || d?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: u
    }, J = new Set(l?.superseded);
    for (const U of [l?.state.deletion_job_id, d?.deletion_job_id])
      U && U !== u && J.add(U);
    s.set(j, { state: y, superseded: J }), d && (Object.assign(d, y), d.deletion_job = void 0);
  }
  const B = ae(() => c.value, (j, f = []) => {
    const d = j.filter((l) => !r.has(o(l)));
    for (const l of f)
      r.has(o(l)) || d.some((u) => o(u) === o(l)) || l.deleting_at && a?.(o(l));
    if (d.length !== j.length) {
      c.value = d;
      return;
    }
    for (const l of j) {
      l.deleting_at && l.deletion_job === void 0 && !f.includes(l) && (l.deletion_job = null);
      const u = s.get(o(l));
      if (u) {
        const y = l.deletion_job_id;
        l.deleting_at && y && y !== u.state.deletion_job_id && !u.superseded.has(y) && (u.state.deletion_job_id && u.superseded.add(u.state.deletion_job_id), u.state.deletion_job_id = y), y !== u.state.deletion_job_id && (l.deletion_job = void 0), Object.assign(l, u.state);
      }
      const I = f.find((y) => o(y) === o(l));
      l.deletion_job === void 0 && I?.deletion_job_id === l.deletion_job_id && (l.deletion_job = I?.deletion_job);
    }
  }, { immediate: !0 }), L = Fe("@message", (j) => {
    const f = tt(j);
    if (!f) return;
    const d = c.value.find((l) => o(l) === f.component_id);
    f.event === "component.deleted" ? (d && !r.has(f.component_id) && a?.(f.component_id), r.add(f.component_id), s.delete(f.component_id), c.value = c.value.filter((l) => o(l) !== f.component_id)) : d && R(f.component_id, { job_id: f.deletion_job_id });
  });
  return Re(() => {
    B(), typeof L == "function" && L();
  }), { acceptDeletion: R };
}
const ot = ["aria-expanded", "onKeydown"], at = { class: "cp-pop" }, lt = {
  key: 0,
  class: "cp-state"
}, it = {
  key: 1,
  class: "cp-create"
}, rt = {
  key: 2,
  class: "cp-state cp-state--stack"
}, st = { class: "cp-list" }, ct = ["disabled", "onClick"], ut = { class: "cp-label" }, dt = ["disabled", "onClick"], pt = ["onClick"], ft = {
  key: 0,
  class: "cp-del-err",
  "data-test": "cp-del-err"
}, Ct = /* @__PURE__ */ je({
  __name: "ComponentPicker",
  setup(c) {
    const o = He(), h = Qe();
    function a(e) {
      return typeof e == "string" ? e : e == null ? "" : String(e);
    }
    function r(e) {
      if (e && typeof e == "object") return e;
      if (typeof e == "string" && e.trim().startsWith("{"))
        try {
          const t = JSON.parse(e);
          return t && typeof t == "object" ? t : null;
        } catch {
          return null;
        }
      return null;
    }
    function s(e) {
      return a(e.id || e.thread_id || e.component_id || e.webhook_id).trim();
    }
    function R(e) {
      const t = r(e.attrs);
      return a(
        e.label || e.title || e.name || e.component_title || t && (t.label || t.title || t.name)
      ).trim();
    }
    function B(e) {
      return a(e.icon || e.component_icon).trim() || "tabler:message-circle";
    }
    function L(e, t) {
      const n = r(e);
      if (!n) return "";
      const i = a(n[t]).trim();
      if (i) return i;
      const b = r(n.properties);
      if (!b) return "";
      for (const ne of Object.values(b)) {
        const Q = r(ne), X = a(Q?.[t]).trim();
        if (X) return X;
      }
      return "";
    }
    const j = p(() => {
      const e = r(r(o.value?.schema)?.properties);
      for (const [t, n] of Object.entries(e || {})) {
        const i = r(n);
        if (typeof i?.value_field == "string" && i.value_field) return { key: t, valueField: i.value_field };
      }
      return null;
    });
    function f(e, t) {
      const n = j.value;
      if (!n) return { thread_id: t };
      if (!(n.valueField in e)) throw new Error("Catalog item is missing its declared selection value.");
      return { [n.key]: e[n.valueField] };
    }
    function d(e) {
      const t = j.value;
      if (!t) return We(e, "thread_id");
      const n = r(e)?.[t.key];
      if (typeof n == "string") return n;
      const i = r(n);
      return typeof i?.id == "string" ? i.id : "";
    }
    const l = p(() => a(o.value?.source).trim() || L(o.value?.schema, "source") || "/api/v1/threads"), u = p(() => l.value.split("?")[0] === "/api/v1/threads"), I = p(() => {
      const e = a(o.value?.meta).trim();
      if (e.startsWith("{"))
        try {
          return JSON.parse(e);
        } catch {
          return {};
        }
      return {};
    }), y = p(() => a(o.value?.threadClass).trim() || a(I.value.thread_class).trim()), J = p(() => a(o.value?.implId).trim() || a(I.value.impl_id).trim() || L(o.value?.schema, "impl_id")), U = p(() => a(o.value?.deleteEndpoint).trim() || a(I.value.delete_endpoint).trim()), le = p(() => {
      if (!u.value) return null;
      const e = I.value?.component?.create_ui;
      return e && typeof e == "object" ? e : null;
    }), O = w(null), Z = p(() => a(le.value?.tag_name).trim() || a(O.value?.tag_name).trim()), Ce = p(() => a(le.value?.title).trim() || a(O.value?.title).trim()), P = p(() => (a(o.value?.title).trim() || a(I.value.title).trim()).toLowerCase()), ce = p(() => o.value?.placeholder || (P.value ? `Select a ${P.value}…` : "Select…")), we = p(() => P.value || Ce.value.toLowerCase() || "one"), ue = p(() => `Create new ${we.value}`), ie = p(() => P.value ? `Untitled ${P.value}` : "Untitled"), Se = p(() => P.value ? `No ${P.value} available yet — create one first, then return here.` : "Nothing available yet — create one first, then return here."), $ = w([]), W = w(!1), q = w(!1), D = w(!1), ee = w(!1), C = w(""), G = w(""), z = w(""), T = w(""), de = w(null);
    async function $e() {
      if (!u.value) {
        O.value = null;
        return;
      }
      if (le.value) {
        O.value = null;
        return;
      }
      const e = y.value;
      if (!e) {
        O.value = null;
        return;
      }
      try {
        const { data: t } = await se.get(`/api/v1/component-kinds/create-view?class=${encodeURIComponent(e)}`), n = t?.create_view;
        O.value = n && a(n.tag_name).trim() ? n : null;
      } catch {
        O.value = null;
      }
    }
    async function H() {
      if (!q.value) {
        q.value = !0;
        try {
          const [e, t = ""] = l.value.split("?"), n = new URLSearchParams(t);
          u.value && (y.value && n.set("thread_class", y.value), J.value && n.set("impl_id", J.value), n.set("limit", "100"));
          const i = u.value ? `${e}?${n}` : l.value, b = [];
          let ne = i, Q = 0;
          for (; ; ) {
            const { data: m } = await se.get(ne);
            if (m?.success === !1) throw new Error(String(m.error || "Could not load components"));
            const A = Array.isArray(m?.items) ? m.items : Array.isArray(m?.threads) ? m.threads : [];
            b.push(...A);
            const x = m?.next_offset;
            if (x == null) break;
            if (typeof x != "number" || !Number.isSafeInteger(x) || x <= Q)
              throw new Error("The server returns an invalid component offset.");
            Q = x;
            const [Te, Ae = ""] = i.split("?"), ye = new URLSearchParams(Ae);
            ye.set("offset", String(Q)), ne = `${Te}?${ye}`;
          }
          const X = /* @__PURE__ */ new Set(), he = [];
          for (const m of b) {
            const A = s(m);
            if (!A || X.has(A)) continue;
            X.add(A);
            const x = R(m);
            he.push({
              id: A,
              label: x && x !== A ? x : ie.value,
              icon: B(m),
              selection: f(m, A),
              deleting_at: typeof m.deleting_at == "string" ? m.deleting_at : void 0,
              deletion_job_id: typeof m.deletion_job_id == "string" ? m.deletion_job_id : void 0,
              deletion_job: m.deletion_job
            });
          }
          $.value = he, W.value = !0, h("load", void 0);
        } catch (e) {
          h("error", { message: "failed to list options", error: e });
        } finally {
          q.value = !1;
        }
        $e();
      }
    }
    const te = p(() => $.value.find((e) => e.id === C.value) || null), V = w(null);
    function pe(e, t) {
      e && t && (V.value = { id: e, label: t });
    }
    const Ie = p(() => {
      const e = te.value;
      return e ? e.label : V.value && V.value.id === C.value ? V.value.label : q.value || !W.value ? ce.value : ie.value;
    });
    ae([te, C], ([e, t]) => {
      e ? pe(t, e.label) : V.value && V.value.id !== t && (V.value = null);
    }, { immediate: !0 });
    async function De() {
      !C.value || te.value || q.value || await H();
    }
    function fe(e) {
      C.value = e.id, pe(e.id, e.label), h("change", e.selection), h("config-changed", e.selection), D.value = !1;
    }
    function Ee(e) {
      T.value = "", G.value = e.id;
    }
    function Le() {
      G.value = "", T.value = "";
    }
    function ve(e, t) {
      const n = e && typeof e == "object" ? e : t && typeof t == "object" && t.response?.data && typeof t.response.data == "object" ? t.response.data : null;
      if (n) {
        const i = a(n.error).trim();
        if (i) return i;
        const b = Number(n.subscriber_count);
        if (b > 0) return `In use by ${b} — remove those first.`;
      }
      return t instanceof Error && t.message ? t.message : "Could not delete.";
    }
    async function me(e) {
      const t = U.value;
      if (!(!t || z.value)) {
        z.value = e.id, T.value = "";
        try {
          const n = `${t.replace(/\/+$/, "")}/${encodeURIComponent(e.id)}`, { data: i } = await se.delete(n);
          if (i && typeof i == "object" && i.success === !1) {
            T.value = ve(i, null);
            return;
          }
          Oe(e.id, i), G.value = "", W.value = !1, await H();
        } catch (n) {
          T.value = ve(null, n);
        } finally {
          z.value = "";
        }
      }
    }
    function xe(e) {
      if (typeof e == "string") return e;
      if (!e || typeof e != "object") return "";
      const t = e;
      return a(t.thread_id || t.webhook_id || t.component_id || t.id).trim();
    }
    function Ne(e) {
      if (!e || typeof e != "object") return "";
      const t = e;
      return a(t.label || t.title || t.name).trim();
    }
    function _e() {
      Z.value && (ee.value = !0);
    }
    function be() {
      ee.value = !1;
    }
    async function Ue(e) {
      const t = xe(e);
      if (ee.value = !1, W.value = !1, await H(), t) {
        const n = $.value.find((b) => b.id === t);
        if (!n && j.value) {
          const b = "The created item has no published selection value in the catalog.";
          h("error", { message: b, error: new Error(b) });
          return;
        }
        const i = n || { id: t, label: Ne(e) || ie.value, icon: "tabler:components", selection: { thread_id: t } };
        $.value.find((b) => b.id === t) || ($.value = [i, ...$.value]), fe(i), h("created", { thread_id: t });
      }
    }
    ae(() => [o.value?.value, o.value?.config, o.value?.schema], () => {
      C.value = d(o.value?.config) || d(o.value?.value), De();
    }, { immediate: !0 }), ae(() => [o.value?.threadClass, o.value?.implId, o.value?.meta, o.value?.source, o.value?.schema], () => {
      W.value = !1, $.value = [], O.value = null, G.value = "", T.value = "", be(), D.value && H();
    });
    function re() {
      D.value = !D.value, D.value && !W.value && H();
    }
    const { acceptDeletion: Oe } = nt($, (e) => e.id, void 0, (e) => {
      e === C.value && (C.value = "");
    });
    return (e, t) => (v(), _(K, null, [
      k("div", {
        ref_key: "ctrl",
        ref: de,
        class: oe(["cp", D.value && "cp-open"]),
        role: "button",
        tabindex: "0",
        "aria-expanded": D.value,
        onClick: re,
        onKeydown: [
          ge(re, ["enter"]),
          ge(N(re, ["prevent"]), ["space"])
        ]
      }, [
        g(S(E), {
          icon: te.value?.icon || "tabler:message-circle",
          class: "cp-lead",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        k("span", {
          class: oe(["cp-value", !C.value && "cp-ph"])
        }, F(C.value ? Ie.value : ce.value), 3),
        g(S(E), {
          icon: D.value ? "tabler:chevron-up" : "tabler:chevron-down",
          class: "cp-caret",
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 42, ot),
      g(Ge, {
        open: D.value,
        "onUpdate:open": t[0] || (t[0] = (n) => D.value = n),
        anchor: de.value,
        "min-width": 260,
        "max-height": 320
      }, {
        default: Be(() => [
          k("div", at, [
            q.value && !$.value.length ? (v(), _("div", lt, [
              g(S(E), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              t[1] || (t[1] = ke(" Loading…", -1))
            ])) : ee.value ? (v(), _("div", it, [
              g(qe, {
                tag: Z.value,
                onCreated: Ue,
                onClose: be
              }, null, 8, ["tag"])
            ])) : $.value.length ? (v(), _(K, { key: 3 }, [
              k("div", st, [
                (v(!0), _(K, null, Pe($.value, (n) => (v(), _("div", {
                  key: n.id,
                  class: oe(["cp-row cp-row--compound", n.id === C.value && "cp-row-on"])
                }, [
                  k("button", {
                    type: "button",
                    class: "cp-row-main",
                    disabled: !!n.deleting_at,
                    onClick: (i) => fe(n)
                  }, [
                    g(S(E), {
                      icon: n.icon,
                      class: "cp-ico",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    k("span", ut, F(n.label), 1),
                    n.id === C.value ? (v(), Ve(S(E), {
                      key: 0,
                      icon: "tabler:check",
                      class: "cp-check",
                      "aria-hidden": "true"
                    })) : M("", !0)
                  ], 8, ct),
                  g(Ye, {
                    state: n,
                    onRetry: (i) => me(n)
                  }, null, 8, ["state", "onRetry"]),
                  U.value && !n.deleting_at ? (v(), _(K, { key: 0 }, [
                    G.value === n.id ? (v(), _(K, { key: 0 }, [
                      k("button", {
                        type: "button",
                        class: "cp-row-del cp-row-del-yes",
                        disabled: z.value === n.id,
                        title: "Confirm delete",
                        "aria-label": "Confirm delete",
                        "data-test": "cp-del-confirm",
                        onClick: N((i) => me(n), ["stop"])
                      }, [
                        g(S(E), {
                          icon: z.value === n.id ? "tabler:loader-2" : "tabler:check",
                          class: oe(z.value === n.id && "spin"),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"])
                      ], 8, dt),
                      k("button", {
                        type: "button",
                        class: "cp-row-del",
                        title: "Cancel",
                        "aria-label": "Cancel delete",
                        onClick: N(Le, ["stop"])
                      }, [
                        g(S(E), {
                          icon: "tabler:x",
                          "aria-hidden": "true"
                        })
                      ])
                    ], 64)) : (v(), _("button", {
                      key: 1,
                      type: "button",
                      class: "cp-row-del",
                      title: "Delete",
                      "aria-label": "Delete",
                      "data-test": "cp-del",
                      onClick: N((i) => Ee(n), ["stop"])
                    }, [
                      g(S(E), {
                        icon: "tabler:trash",
                        "aria-hidden": "true"
                      })
                    ], 8, pt))
                  ], 64)) : M("", !0)
                ], 2))), 128)),
                T.value ? (v(), _("div", ft, F(T.value), 1)) : M("", !0)
              ]),
              Z.value ? (v(), _("button", {
                key: 0,
                type: "button",
                class: "cp-create-foot",
                "data-test": "cp-create-foot",
                onClick: N(_e, ["stop"])
              }, [
                g(S(E), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                k("span", null, F(ue.value), 1)
              ])) : M("", !0)
            ], 64)) : (v(), _("div", rt, [
              k("span", null, F(Se.value), 1),
              Z.value ? (v(), _("button", {
                key: 0,
                type: "button",
                class: "cp-create-btn",
                "data-test": "cp-create",
                onClick: N(_e, ["stop"])
              }, [
                g(S(E), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                k("span", null, F(ue.value), 1)
              ])) : M("", !0)
            ]))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
export {
  Ct as default
};
//# sourceMappingURL=ComponentPicker-srxI7Kd6.js.map
