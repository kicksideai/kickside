import { defineComponent as Ce, computed as f, openBlock as m, createElementBlock as _, withModifiers as L, Fragment as F, createElementVNode as j, createTextVNode as ke, toDisplayString as V, createCommentVNode as M, createVNode as y, unref as w, watch as ae, onBeforeUnmount as Be, ref as k, withKeys as ye, normalizeClass as oe, withCtx as Pe, renderList as Ve, createBlock as Fe } from "vue";
import { Icon as E } from "@iconify/vue";
import { on as Me, api as le, host as We } from "@wippy-fe/proxy";
import { a as Ke, u as qe } from "./wc-runtime-CNDpK4lj.js";
import { p as ze } from "./pickerValue-SPnnNBeX.js";
import { _ as Je, W as Ge } from "./WcMount-N7EOK1cC.js";
import He from "primevue/button";
import Qe from "primevue/progressspinner";
import { e as je } from "./errMsg-CxKGcp1F.js";
import { _ as Xe } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
const Ye = () => Ke(), Ze = () => qe(), et = { key: 0 }, tt = /* @__PURE__ */ Ce({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(c) {
    const o = c, g = f(() => o.state.deletion_job === null || ["dead", "cancelled"].includes(o.state.deletion_job?.status || ""));
    return (a, s) => c.state.deleting_at ? (m(), _("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: s[1] || (s[1] = L(() => {
      }, ["stop"])),
      onKeydown: s[2] || (s[2] = L(() => {
      }, ["stop"]))
    }, [
      g.value ? (m(), _(F, { key: 0 }, [
        j("span", null, [
          s[3] || (s[3] = ke("Deletion failed", -1)),
          c.state.deletion_job?.last_error ? (m(), _("span", et, ": " + V(c.state.deletion_job.last_error), 1)) : M("", !0)
        ]),
        y(w(He), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: s[0] || (s[0] = L((u) => a.$emit("retry"), ["stop"]))
        })
      ], 64)) : (m(), _(F, { key: 1 }, [
        y(w(Qe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        s[4] || (s[4] = j("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : M("", !0);
  }
}), nt = /* @__PURE__ */ Je(tt, [["__scopeId", "data-v-da5a9464"]]);
function Y(c) {
  return !!c && typeof c == "object" && !Array.isArray(c);
}
function ot(c, o) {
  return c;
}
function at(c, o, g) {
  const a = Y(c) ? c : {}, s = [
    a,
    Y(a.data) ? a.data : null,
    Y(a.payload) ? a.payload : null,
    Y(a.detail) ? a.detail : null
  ].filter(Boolean);
  for (const u of s) {
    if (u.event !== "component.meta.changed" && u.event !== "component.deleting" && u.event !== "component.deleted") continue;
    const S = String(u.component_id || ""), N = String(a.topic || u.topic || "");
    if (!S && (!N.startsWith("component.") || N === "component.")) continue;
    const U = S || o || N.slice(10);
    return u.event === "component.deleting" && typeof u.deletion_job_id == "string" && u.deletion_job_id ? { event: u.event, component_id: U, deletion_job_id: u.deletion_job_id } : u.event !== "component.meta.changed" ? { event: u.event, component_id: U } : {
      event: "component.meta.changed",
      component_id: U,
      meta: ot(Y(u.meta) ? u.meta : {}),
      deleted: Array.isArray(u.deleted) ? u.deleted.map(String) : []
    };
  }
  return null;
}
function lt(c, o) {
  const g = at(c, o);
  return g && g.event !== "component.meta.changed" ? g : null;
}
function it(c, o, g, a) {
  let s = !0;
  const u = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Map();
  function N(p, d) {
    const r = c.value.find((I) => o(I) === p), l = S.get(p), v = d?.job_id || l?.deletion_job_id || r?.deletion_job_id, A = l ? l.deletion_job_id : r?.deleting_at ? r.deletion_job_id : void 0;
    if ((l || r?.deleting_at) && v === A) return;
    const O = {
      deleting_at: l?.deleting_at || r?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: v
    };
    S.set(p, O), r && (Object.assign(r, O), r.deletion_job = void 0);
  }
  async function U(p) {
    const d = o(p), r = S.get(d), l = () => s && c.value.includes(p) && S.get(d) === r;
    try {
      const { data: v } = await le.get(`/api/v1/components/${encodeURIComponent(d)}`);
      if (!v?.success) throw new Error(je(v, "Could not read deletion progress"));
      l() && (p.deleting_at = r?.deleting_at || v.deleting_at, p.deletion_job_id = v.deletion_job_id, r && (r.deletion_job_id = p.deletion_job_id), p.deletion_job = v.deletion_job ?? null);
    } catch (v) {
      l() && We.handleError("other", { message: je(v, "Could not read deletion progress") });
    }
  }
  let W = [];
  const ie = ae(() => c.value, (p, d = []) => {
    const r = p.filter((l) => !u.has(o(l)));
    for (const l of d)
      u.has(o(l)) || r.some((v) => o(v) === o(l)) || l.deleting_at && a?.(o(l));
    if (r.length !== p.length) {
      c.value = r;
      return;
    }
    for (const l of p) {
      const v = S.get(o(l));
      v && (l.deletion_job_id !== v.deletion_job_id && (l.deletion_job = void 0), Object.assign(l, v));
      const A = d.find((O) => o(O) === o(l));
      l.deletion_job === void 0 && A?.deletion_job_id === l.deletion_job_id && (l.deletion_job = A?.deletion_job), l.deleting_at && !W.includes(l) && U(l);
    }
    W = p;
  }, { immediate: !0 }), J = Me("@message", (p) => {
    const d = lt(p);
    if (!d) return;
    const r = c.value.find((l) => o(l) === d.component_id);
    d.event === "component.deleted" ? (r && !u.has(d.component_id) && a?.(d.component_id), u.add(d.component_id), S.delete(d.component_id), c.value = c.value.filter((l) => o(l) !== d.component_id)) : r && N(d.component_id, { job_id: d.deletion_job_id });
  });
  return Be(() => {
    s = !1, ie(), typeof J == "function" && J();
  }), { acceptDeletion: N };
}
const rt = ["aria-expanded", "onKeydown"], st = { class: "cp-pop" }, ct = {
  key: 0,
  class: "cp-state"
}, ut = {
  key: 1,
  class: "cp-create"
}, dt = {
  key: 2,
  class: "cp-state cp-state--stack"
}, pt = { class: "cp-list" }, vt = ["disabled", "onClick"], ft = { class: "cp-label" }, mt = ["disabled", "onClick"], _t = ["onClick"], bt = {
  key: 0,
  class: "cp-del-err",
  "data-test": "cp-del-err"
}, Dt = /* @__PURE__ */ Ce({
  __name: "ComponentPicker",
  setup(c) {
    const o = Ye(), g = Ze();
    function a(e) {
      return typeof e == "string" ? e : e == null ? "" : String(e);
    }
    function s(e) {
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
    function u(e) {
      return a(e.id || e.thread_id || e.component_id || e.webhook_id).trim();
    }
    function S(e) {
      const t = s(e.attrs);
      return a(
        e.label || e.title || e.name || e.component_title || t && (t.label || t.title || t.name)
      ).trim();
    }
    function N(e) {
      return a(e.icon || e.component_icon).trim() || "tabler:message-circle";
    }
    function U(e, t) {
      const n = s(e);
      if (!n) return "";
      const i = a(n[t]).trim();
      if (i) return i;
      const h = s(n.properties);
      if (!h) return "";
      for (const ne of Object.values(h)) {
        const Q = s(ne), X = a(Q?.[t]).trim();
        if (X) return X;
      }
      return "";
    }
    const W = f(() => {
      const e = s(s(o.value?.schema)?.properties);
      for (const [t, n] of Object.entries(e || {})) {
        const i = s(n);
        if (typeof i?.value_field == "string" && i.value_field) return { key: t, valueField: i.value_field };
      }
      return null;
    });
    function ie(e, t) {
      const n = W.value;
      if (!n) return { thread_id: t };
      if (!(n.valueField in e)) throw new Error("Catalog item is missing its declared selection value.");
      return { [n.key]: e[n.valueField] };
    }
    function J(e) {
      const t = W.value;
      if (!t) return ze(e, "thread_id");
      const n = s(e)?.[t.key];
      if (typeof n == "string") return n;
      const i = s(n);
      return typeof i?.id == "string" ? i.id : "";
    }
    const p = f(() => a(o.value?.source).trim() || U(o.value?.schema, "source") || "/api/v1/threads"), d = f(() => p.value.split("?")[0] === "/api/v1/threads"), r = f(() => {
      const e = a(o.value?.meta).trim();
      if (e.startsWith("{"))
        try {
          return JSON.parse(e);
        } catch {
          return {};
        }
      return {};
    }), l = f(() => a(o.value?.threadClass).trim() || a(r.value.thread_class).trim()), v = f(() => a(o.value?.implId).trim() || a(r.value.impl_id).trim() || U(o.value?.schema, "impl_id")), A = f(() => a(o.value?.deleteEndpoint).trim() || a(r.value.delete_endpoint).trim()), O = f(() => {
      if (!d.value) return null;
      const e = r.value?.component?.create_ui;
      return e && typeof e == "object" ? e : null;
    }), I = k(null), Z = f(() => a(O.value?.tag_name).trim() || a(I.value?.tag_name).trim()), we = f(() => a(O.value?.title).trim() || a(I.value?.title).trim()), B = f(() => (a(o.value?.title).trim() || a(r.value.title).trim()).toLowerCase()), ce = f(() => o.value?.placeholder || (B.value ? `Select a ${B.value}…` : "Select…")), Se = f(() => B.value || we.value.toLowerCase() || "one"), ue = f(() => `Create new ${Se.value}`), re = f(() => B.value ? `Untitled ${B.value}` : "Untitled"), $e = f(() => B.value ? `No ${B.value} available yet — create one first, then return here.` : "Nothing available yet — create one first, then return here."), $ = k([]), K = k(!1), q = k(!1), D = k(!1), ee = k(!1), C = k(""), G = k(""), z = k(""), R = k(""), de = k(null);
    async function Ie() {
      if (!d.value) {
        I.value = null;
        return;
      }
      if (O.value) {
        I.value = null;
        return;
      }
      const e = l.value;
      if (!e) {
        I.value = null;
        return;
      }
      try {
        const { data: t } = await le.get(`/api/v1/component-kinds/create-view?class=${encodeURIComponent(e)}`), n = t?.create_view;
        I.value = n && a(n.tag_name).trim() ? n : null;
      } catch {
        I.value = null;
      }
    }
    async function H() {
      if (!q.value) {
        q.value = !0;
        try {
          const [e, t = ""] = p.value.split("?"), n = new URLSearchParams(t);
          d.value && (l.value && n.set("thread_class", l.value), v.value && n.set("impl_id", v.value), n.set("limit", "100"));
          const i = d.value ? `${e}?${n}` : p.value, h = [];
          let ne = i, Q = 0;
          for (; ; ) {
            const { data: b } = await le.get(ne);
            if (b?.success === !1) throw new Error(String(b.error || "Could not load components"));
            const T = Array.isArray(b?.items) ? b.items : Array.isArray(b?.threads) ? b.threads : [];
            h.push(...T);
            const x = b?.next_offset;
            if (x == null) break;
            if (typeof x != "number" || !Number.isSafeInteger(x) || x <= Q)
              throw new Error("The server returns an invalid component offset.");
            Q = x;
            const [Te, Ae = ""] = i.split("?"), ge = new URLSearchParams(Ae);
            ge.set("offset", String(Q)), ne = `${Te}?${ge}`;
          }
          const X = /* @__PURE__ */ new Set(), he = [];
          for (const b of h) {
            const T = u(b);
            if (!T || X.has(T)) continue;
            X.add(T);
            const x = S(b);
            he.push({
              id: T,
              label: x && x !== T ? x : re.value,
              icon: N(b),
              selection: ie(b, T),
              deleting_at: typeof b.deleting_at == "string" ? b.deleting_at : void 0,
              deletion_job_id: typeof b.deletion_job_id == "string" ? b.deletion_job_id : void 0
            });
          }
          $.value = he, K.value = !0, g("load", void 0);
        } catch (e) {
          g("error", { message: "failed to list options", error: e });
        } finally {
          q.value = !1;
        }
        Ie();
      }
    }
    const te = f(() => $.value.find((e) => e.id === C.value) || null), P = k(null);
    function pe(e, t) {
      e && t && (P.value = { id: e, label: t });
    }
    const De = f(() => {
      const e = te.value;
      return e ? e.label : P.value && P.value.id === C.value ? P.value.label : q.value || !K.value ? ce.value : re.value;
    });
    ae([te, C], ([e, t]) => {
      e ? pe(t, e.label) : P.value && P.value.id !== t && (P.value = null);
    }, { immediate: !0 });
    async function Ee() {
      !C.value || te.value || q.value || await H();
    }
    function ve(e) {
      C.value = e.id, pe(e.id, e.label), g("change", e.selection), g("config-changed", e.selection), D.value = !1;
    }
    function xe(e) {
      R.value = "", G.value = e.id;
    }
    function Le() {
      G.value = "", R.value = "";
    }
    function fe(e, t) {
      const n = e && typeof e == "object" ? e : t && typeof t == "object" && t.response?.data && typeof t.response.data == "object" ? t.response.data : null;
      if (n) {
        const i = a(n.error).trim();
        if (i) return i;
        const h = Number(n.subscriber_count);
        if (h > 0) return `In use by ${h} — remove those first.`;
      }
      return t instanceof Error && t.message ? t.message : "Could not delete.";
    }
    async function me(e) {
      const t = A.value;
      if (!(!t || z.value)) {
        z.value = e.id, R.value = "";
        try {
          const n = `${t.replace(/\/+$/, "")}/${encodeURIComponent(e.id)}`, { data: i } = await le.delete(n);
          if (i && typeof i == "object" && i.success === !1) {
            R.value = fe(i, null);
            return;
          }
          Re(e.id, i), G.value = "", K.value = !1, await H();
        } catch (n) {
          R.value = fe(null, n);
        } finally {
          z.value = "";
        }
      }
    }
    function Ne(e) {
      if (typeof e == "string") return e;
      if (!e || typeof e != "object") return "";
      const t = e;
      return a(t.thread_id || t.webhook_id || t.component_id || t.id).trim();
    }
    function Ue(e) {
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
    async function Oe(e) {
      const t = Ne(e);
      if (ee.value = !1, K.value = !1, await H(), t) {
        const n = $.value.find((h) => h.id === t);
        if (!n && W.value) {
          const h = "The created item has no published selection value in the catalog.";
          g("error", { message: h, error: new Error(h) });
          return;
        }
        const i = n || { id: t, label: Ue(e) || re.value, icon: "tabler:components", selection: { thread_id: t } };
        $.value.find((h) => h.id === t) || ($.value = [i, ...$.value]), ve(i), g("created", { thread_id: t });
      }
    }
    ae(() => [o.value?.value, o.value?.config, o.value?.schema], () => {
      C.value = J(o.value?.config) || J(o.value?.value), Ee();
    }, { immediate: !0 }), ae(() => [o.value?.threadClass, o.value?.implId, o.value?.meta, o.value?.source, o.value?.schema], () => {
      K.value = !1, $.value = [], I.value = null, G.value = "", R.value = "", be(), D.value && H();
    });
    function se() {
      D.value = !D.value, D.value && !K.value && H();
    }
    const { acceptDeletion: Re } = it($, (e) => e.id, void 0, (e) => {
      e === C.value && (C.value = "");
    });
    return (e, t) => (m(), _(F, null, [
      j("div", {
        ref_key: "ctrl",
        ref: de,
        class: oe(["cp", D.value && "cp-open"]),
        role: "button",
        tabindex: "0",
        "aria-expanded": D.value,
        onClick: se,
        onKeydown: [
          ye(se, ["enter"]),
          ye(L(se, ["prevent"]), ["space"])
        ]
      }, [
        y(w(E), {
          icon: te.value?.icon || "tabler:message-circle",
          class: "cp-lead",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        j("span", {
          class: oe(["cp-value", !C.value && "cp-ph"])
        }, V(C.value ? De.value : ce.value), 3),
        y(w(E), {
          icon: D.value ? "tabler:chevron-up" : "tabler:chevron-down",
          class: "cp-caret",
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 42, rt),
      y(Xe, {
        open: D.value,
        "onUpdate:open": t[0] || (t[0] = (n) => D.value = n),
        anchor: de.value,
        "min-width": 260,
        "max-height": 320
      }, {
        default: Pe(() => [
          j("div", st, [
            q.value && !$.value.length ? (m(), _("div", ct, [
              y(w(E), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              t[1] || (t[1] = ke(" Loading…", -1))
            ])) : ee.value ? (m(), _("div", ut, [
              y(Ge, {
                tag: Z.value,
                onCreated: Oe,
                onClose: be
              }, null, 8, ["tag"])
            ])) : $.value.length ? (m(), _(F, { key: 3 }, [
              j("div", pt, [
                (m(!0), _(F, null, Ve($.value, (n) => (m(), _("div", {
                  key: n.id,
                  class: oe(["cp-row cp-row--compound", n.id === C.value && "cp-row-on"])
                }, [
                  j("button", {
                    type: "button",
                    class: "cp-row-main",
                    disabled: !!n.deleting_at,
                    onClick: (i) => ve(n)
                  }, [
                    y(w(E), {
                      icon: n.icon,
                      class: "cp-ico",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    j("span", ft, V(n.label), 1),
                    n.id === C.value ? (m(), Fe(w(E), {
                      key: 0,
                      icon: "tabler:check",
                      class: "cp-check",
                      "aria-hidden": "true"
                    })) : M("", !0)
                  ], 8, vt),
                  y(nt, {
                    state: n,
                    onRetry: (i) => me(n)
                  }, null, 8, ["state", "onRetry"]),
                  A.value && !n.deleting_at ? (m(), _(F, { key: 0 }, [
                    G.value === n.id ? (m(), _(F, { key: 0 }, [
                      j("button", {
                        type: "button",
                        class: "cp-row-del cp-row-del-yes",
                        disabled: z.value === n.id,
                        title: "Confirm delete",
                        "aria-label": "Confirm delete",
                        "data-test": "cp-del-confirm",
                        onClick: L((i) => me(n), ["stop"])
                      }, [
                        y(w(E), {
                          icon: z.value === n.id ? "tabler:loader-2" : "tabler:check",
                          class: oe(z.value === n.id && "spin"),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"])
                      ], 8, mt),
                      j("button", {
                        type: "button",
                        class: "cp-row-del",
                        title: "Cancel",
                        "aria-label": "Cancel delete",
                        onClick: L(Le, ["stop"])
                      }, [
                        y(w(E), {
                          icon: "tabler:x",
                          "aria-hidden": "true"
                        })
                      ])
                    ], 64)) : (m(), _("button", {
                      key: 1,
                      type: "button",
                      class: "cp-row-del",
                      title: "Delete",
                      "aria-label": "Delete",
                      "data-test": "cp-del",
                      onClick: L((i) => xe(n), ["stop"])
                    }, [
                      y(w(E), {
                        icon: "tabler:trash",
                        "aria-hidden": "true"
                      })
                    ], 8, _t))
                  ], 64)) : M("", !0)
                ], 2))), 128)),
                R.value ? (m(), _("div", bt, V(R.value), 1)) : M("", !0)
              ]),
              Z.value ? (m(), _("button", {
                key: 0,
                type: "button",
                class: "cp-create-foot",
                "data-test": "cp-create-foot",
                onClick: L(_e, ["stop"])
              }, [
                y(w(E), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                j("span", null, V(ue.value), 1)
              ])) : M("", !0)
            ], 64)) : (m(), _("div", dt, [
              j("span", null, V($e.value), 1),
              Z.value ? (m(), _("button", {
                key: 0,
                type: "button",
                class: "cp-create-btn",
                "data-test": "cp-create",
                onClick: L(_e, ["stop"])
              }, [
                y(w(E), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                j("span", null, V(ue.value), 1)
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
  Dt as default
};
//# sourceMappingURL=ComponentPicker-Bn9VTJIe.js.map
