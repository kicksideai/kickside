import { u as $r, a as Nr, W as Lr } from "./index-C70m2Vvt.js";
import { defineComponent as Ur, computed as i, ref as u, watch as G, openBlock as p, createElementBlock as s, Fragment as D, createElementVNode as v, withKeys as sr, withModifiers as $, normalizeClass as R, createVNode as f, unref as h, toDisplayString as N, withCtx as Tr, createTextVNode as Dr, createCommentVNode as O, renderList as Or, createBlock as Ar } from "vue";
import { Icon as g } from "@iconify/vue";
import { api as Q, define as Fr } from "@wippy-fe/proxy";
import { p as Mr } from "./pickerValue-SPnnNBeX.js";
import { W as Pr } from "./WcMount-Dheo0oY4.js";
import { _ as Vr } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
const Wr = () => $r(), Rr = () => Nr(), Jr = ["aria-expanded", "onKeydown"], Kr = { class: "cp-pop" }, Br = {
  key: 0,
  class: "cp-state"
}, qr = {
  key: 1,
  class: "cp-create"
}, Hr = {
  key: 2,
  class: "cp-state cp-state--stack"
}, Gr = { class: "cp-list" }, Qr = ["onClick"], Xr = { class: "cp-label" }, Yr = ["disabled", "onClick"], Zr = ["onClick"], re = {
  key: 0,
  class: "cp-del-err",
  "data-test": "cp-del-err"
}, ee = /* @__PURE__ */ Ur({
  __name: "ComponentPicker",
  setup(lr) {
    const c = Wr(), S = Rr();
    function t(r) {
      return typeof r == "string" ? r : r == null ? "" : String(r);
    }
    function b(r) {
      if (r && typeof r == "object") return r;
      if (typeof r == "string" && r.trim().startsWith("{"))
        try {
          const e = JSON.parse(r);
          return e && typeof e == "object" ? e : null;
        } catch {
          return null;
        }
      return null;
    }
    function dr(r) {
      return t(r.id || r.thread_id || r.component_id || r.webhook_id).trim();
    }
    function ur(r) {
      const e = b(r.attrs);
      return t(
        r.label || r.title || r.name || r.component_title || e && (e.label || e.title || e.name)
      ).trim();
    }
    function vr(r) {
      return t(r.icon || r.component_icon).trim() || "tabler:message-circle";
    }
    function fr(r) {
      const e = b(r);
      if (!e) return "";
      const a = t(e.source).trim();
      if (a) return a;
      const o = b(e.properties);
      if (!o) return "";
      for (const n of Object.values(o)) {
        const W = b(n), T = t(W?.source).trim();
        if (T) return T;
      }
      return "";
    }
    const J = i(() => {
      const r = b(b(c.value?.schema)?.properties);
      for (const [e, a] of Object.entries(r || {})) {
        const o = b(a);
        if (typeof o?.value_field == "string" && o.value_field) return { key: e, valueField: o.value_field };
      }
      return null;
    });
    function mr(r, e) {
      const a = J.value;
      if (!a) return { thread_id: e };
      if (!(a.valueField in r)) throw new Error("Catalog item is missing its declared selection value.");
      return { [a.key]: r[a.valueField] };
    }
    function X(r) {
      const e = J.value;
      if (!e) return Mr(r, "thread_id");
      const a = b(r)?.[e.key];
      if (typeof a == "string") return a;
      const o = b(a);
      return typeof o?.id == "string" ? o.id : "";
    }
    const A = i(() => t(c.value?.source).trim() || fr(c.value?.schema) || "/api/v1/threads"), K = i(() => A.value.split("?")[0] === "/api/v1/threads"), F = i(() => {
      const r = t(c.value?.meta).trim();
      if (r.startsWith("{"))
        try {
          return JSON.parse(r);
        } catch {
          return {};
        }
      return {};
    }), Y = i(() => t(c.value?.threadClass).trim() || t(F.value.thread_class).trim()), Z = i(() => t(c.value?.deleteEndpoint).trim() || t(F.value.delete_endpoint).trim()), B = i(() => {
      if (!K.value) return null;
      const r = F.value?.component?.create_ui;
      return r && typeof r == "object" ? r : null;
    }), x = u(null), M = i(() => t(B.value?.tag_name).trim() || t(x.value?.tag_name).trim()), hr = i(() => t(B.value?.title).trim() || t(x.value?.title).trim()), C = i(() => (t(c.value?.title).trim() || t(F.value.title).trim()).toLowerCase()), rr = i(() => c.value?.placeholder || (C.value ? `Select a ${C.value}…` : "Select…")), gr = i(() => C.value || hr.value.toLowerCase() || "one"), er = i(() => `Create new ${gr.value}`), q = i(() => C.value ? `Untitled ${C.value}` : "Untitled"), br = i(() => C.value ? `No ${C.value} available yet — create one first, then return here.` : "Nothing available yet — create one first, then return here."), w = u([]), j = u(!1), E = u(!1), m = u(!1), P = u(!1), l = u(""), L = u(""), I = u(""), k = u(""), ar = u(null);
    async function wr() {
      if (!K.value) {
        x.value = null;
        return;
      }
      if (B.value) {
        x.value = null;
        return;
      }
      const r = Y.value;
      if (!r) {
        x.value = null;
        return;
      }
      try {
        const { data: e } = await Q.get(`/api/v1/component-kinds/create-view?class=${encodeURIComponent(r)}`), a = e?.create_view;
        x.value = a && t(a.tag_name).trim() ? a : null;
      } catch {
        x.value = null;
      }
    }
    async function U() {
      if (!E.value) {
        E.value = !0;
        try {
          const r = Y.value, e = K.value ? r ? `${A.value}?thread_class=${encodeURIComponent(r)}&limit=100` : `${A.value}?limit=100` : A.value, a = [];
          let o = e, n = 0;
          for (; ; ) {
            const { data: d } = await Q.get(o);
            if (d?.success === !1) throw new Error(String(d.error || "Could not load components"));
            const _ = Array.isArray(d?.items) ? d.items : Array.isArray(d?.threads) ? d.threads : [];
            a.push(..._);
            const y = d?.next_offset;
            if (y == null) break;
            if (typeof y != "number" || !Number.isSafeInteger(y) || y <= n)
              throw new Error("The server returns an invalid component offset.");
            n = y;
            const [Er, Ir = ""] = e.split("?"), pr = new URLSearchParams(Ir);
            pr.set("offset", String(n)), o = `${Er}?${pr}`;
          }
          const W = /* @__PURE__ */ new Set(), T = [];
          for (const d of a) {
            const _ = dr(d);
            if (!_ || W.has(_)) continue;
            W.add(_);
            const y = ur(d);
            T.push({ id: _, label: y && y !== _ ? y : q.value, icon: vr(d), selection: mr(d, _) });
          }
          w.value = T, j.value = !0, S("load", void 0);
        } catch (r) {
          S("error", { message: "failed to list options", error: r });
        } finally {
          E.value = !1;
        }
        wr();
      }
    }
    const V = i(() => w.value.find((r) => r.id === l.value) || null), z = u(null);
    function or(r, e) {
      r && e && (z.value = { id: r, label: e });
    }
    const yr = i(() => {
      const r = V.value;
      return r ? r.label : z.value && z.value.id === l.value ? z.value.label : E.value || !j.value ? rr.value : q.value;
    });
    G([V, l], ([r, e]) => {
      r ? or(e, r.label) : z.value && z.value.id !== e && (z.value = null);
    }, { immediate: !0 });
    async function xr() {
      !l.value || V.value || E.value || await U();
    }
    function tr(r) {
      l.value = r.id, or(r.id, r.label), S("change", r.selection), S("config-changed", r.selection), m.value = !1;
    }
    function kr(r) {
      k.value = "", L.value = r.id;
    }
    function _r() {
      L.value = "", k.value = "";
    }
    function cr(r, e) {
      const a = r && typeof r == "object" ? r : e && typeof e == "object" && e.response?.data && typeof e.response.data == "object" ? e.response.data : null;
      if (a) {
        const o = t(a.error).trim();
        if (o) return o;
        const n = Number(a.subscriber_count);
        if (n > 0) return `In use by ${n} — remove those first.`;
      }
      return e instanceof Error && e.message ? e.message : "Could not delete.";
    }
    async function Cr(r) {
      const e = Z.value;
      if (!(!e || I.value)) {
        I.value = r.id, k.value = "";
        try {
          const a = `${e.replace(/\/+$/, "")}/${encodeURIComponent(r.id)}`, { data: o } = await Q.delete(a);
          if (o && typeof o == "object" && o.success === !1) {
            k.value = cr(o, null);
            return;
          }
          L.value = "", r.id === l.value && (l.value = ""), j.value = !1, await U();
        } catch (a) {
          k.value = cr(null, a);
        } finally {
          I.value = "";
        }
      }
    }
    function zr(r) {
      if (typeof r == "string") return r;
      if (!r || typeof r != "object") return "";
      const e = r;
      return t(e.thread_id || e.webhook_id || e.component_id || e.id).trim();
    }
    function Sr(r) {
      if (!r || typeof r != "object") return "";
      const e = r;
      return t(e.label || e.title || e.name).trim();
    }
    function ir() {
      M.value && (P.value = !0);
    }
    function nr() {
      P.value = !1;
    }
    async function jr(r) {
      const e = zr(r);
      if (P.value = !1, j.value = !1, await U(), e) {
        const a = w.value.find((n) => n.id === e);
        if (!a && J.value) {
          const n = "The created item has no published selection value in the catalog.";
          S("error", { message: n, error: new Error(n) });
          return;
        }
        const o = a || { id: e, label: Sr(r) || q.value, icon: "tabler:components", selection: { thread_id: e } };
        w.value.find((n) => n.id === e) || (w.value = [o, ...w.value]), tr(o), S("created", { thread_id: e });
      }
    }
    G(() => [c.value?.value, c.value?.config, c.value?.schema], () => {
      l.value = X(c.value?.config) || X(c.value?.value), xr();
    }, { immediate: !0 }), G(() => [c.value?.threadClass, c.value?.meta, c.value?.source, c.value?.schema], () => {
      j.value = !1, w.value = [], x.value = null, L.value = "", k.value = "", nr(), m.value && U();
    });
    function H() {
      m.value = !m.value, m.value && !j.value && U();
    }
    return (r, e) => (p(), s(D, null, [
      v("div", {
        ref_key: "ctrl",
        ref: ar,
        class: R(["cp", m.value && "cp-open"]),
        role: "button",
        tabindex: "0",
        "aria-expanded": m.value,
        onClick: H,
        onKeydown: [
          sr(H, ["enter"]),
          sr($(H, ["prevent"]), ["space"])
        ]
      }, [
        f(h(g), {
          icon: V.value?.icon || "tabler:message-circle",
          class: "cp-lead",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        v("span", {
          class: R(["cp-value", !l.value && "cp-ph"])
        }, N(l.value ? yr.value : rr.value), 3),
        f(h(g), {
          icon: m.value ? "tabler:chevron-up" : "tabler:chevron-down",
          class: "cp-caret",
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 42, Jr),
      f(Vr, {
        open: m.value,
        "onUpdate:open": e[0] || (e[0] = (a) => m.value = a),
        anchor: ar.value,
        "min-width": 260,
        "max-height": 320
      }, {
        default: Tr(() => [
          v("div", Kr, [
            E.value ? (p(), s("div", Br, [
              f(h(g), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              e[1] || (e[1] = Dr(" Loading…", -1))
            ])) : P.value ? (p(), s("div", qr, [
              f(Pr, {
                tag: M.value,
                onCreated: jr,
                onClose: nr
              }, null, 8, ["tag"])
            ])) : w.value.length ? (p(), s(D, { key: 3 }, [
              v("div", Gr, [
                (p(!0), s(D, null, Or(w.value, (a) => (p(), s("div", {
                  key: a.id,
                  class: R(["cp-row cp-row--compound", a.id === l.value && "cp-row-on"])
                }, [
                  v("button", {
                    type: "button",
                    class: "cp-row-main",
                    onClick: (o) => tr(a)
                  }, [
                    f(h(g), {
                      icon: a.icon,
                      class: "cp-ico",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    v("span", Xr, N(a.label), 1),
                    a.id === l.value ? (p(), Ar(h(g), {
                      key: 0,
                      icon: "tabler:check",
                      class: "cp-check",
                      "aria-hidden": "true"
                    })) : O("", !0)
                  ], 8, Qr),
                  Z.value ? (p(), s(D, { key: 0 }, [
                    L.value === a.id ? (p(), s(D, { key: 0 }, [
                      v("button", {
                        type: "button",
                        class: "cp-row-del cp-row-del-yes",
                        disabled: I.value === a.id,
                        title: "Confirm delete",
                        "aria-label": "Confirm delete",
                        "data-test": "cp-del-confirm",
                        onClick: $((o) => Cr(a), ["stop"])
                      }, [
                        f(h(g), {
                          icon: I.value === a.id ? "tabler:loader-2" : "tabler:check",
                          class: R(I.value === a.id && "spin"),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"])
                      ], 8, Yr),
                      v("button", {
                        type: "button",
                        class: "cp-row-del",
                        title: "Cancel",
                        "aria-label": "Cancel delete",
                        onClick: $(_r, ["stop"])
                      }, [
                        f(h(g), {
                          icon: "tabler:x",
                          "aria-hidden": "true"
                        })
                      ])
                    ], 64)) : (p(), s("button", {
                      key: 1,
                      type: "button",
                      class: "cp-row-del",
                      title: "Delete",
                      "aria-label": "Delete",
                      "data-test": "cp-del",
                      onClick: $((o) => kr(a), ["stop"])
                    }, [
                      f(h(g), {
                        icon: "tabler:trash",
                        "aria-hidden": "true"
                      })
                    ], 8, Zr))
                  ], 64)) : O("", !0)
                ], 2))), 128)),
                k.value ? (p(), s("div", re, N(k.value), 1)) : O("", !0)
              ]),
              M.value ? (p(), s("button", {
                key: 0,
                type: "button",
                class: "cp-create-foot",
                "data-test": "cp-create-foot",
                onClick: $(ir, ["stop"])
              }, [
                f(h(g), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                v("span", null, N(er.value), 1)
              ])) : O("", !0)
            ], 64)) : (p(), s("div", Hr, [
              v("span", null, N(br.value), 1),
              M.value ? (p(), s("button", {
                key: 0,
                type: "button",
                class: "cp-create-btn",
                "data-test": "cp-create",
                onClick: $(ir, ["stop"])
              }, [
                f(h(g), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                v("span", null, N(er.value), 1)
              ])) : O("", !0)
            ]))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), ae = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host{display:block}*,*:before,*:after{box-sizing:border-box}.cp{display:flex;align-items:center;gap:8px;width:100%;min-height:36px;padding:6px 10px;border:1px solid var(--p-content-border-color);background:var(--p-content-background);border-radius:8px;color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;transition:border-color .12s}.cp:hover,.cp-open{border-color:var(--p-primary-color)}.cp-lead{width:16px;height:16px;color:var(--p-text-muted-color);flex-shrink:0}.cp-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cp-ph{color:var(--p-text-muted-color)}.cp-caret{width:16px;height:16px;color:var(--p-text-muted-color);flex-shrink:0}.cp-pop{box-sizing:border-box;overflow:hidden;max-width:calc(100vw - 16px);max-height:var(--anchored-panel-available-height, 360px);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--p-select-overlay-border-radius);box-shadow:var(--p-select-overlay-shadow);padding:6px;display:flex;flex-direction:column;gap:2px;transition:height .2s ease,max-height .2s ease}.cp-state{display:flex;align-items:center;justify-content:center;gap:6px;padding:18px;font-size:12.5px;color:var(--p-text-muted-color)}.cp-list,.cp-tree{display:flex;flex-direction:column;gap:1px;flex:1 1 auto;min-height:0;overflow-y:auto}.cp-row{display:flex;align-items:center;gap:7px;width:100%;text-align:left;padding:8px;border:none;border-radius:8px;background:transparent;color:var(--p-text-color);cursor:pointer;outline:none;transition:background .1s}.cp-row:hover,.cp-row--compound:hover{background:var(--p-select-option-focus-background)}.cp-row:focus-visible,.cp-row--compound:focus-within{background:var(--p-select-option-focus-background);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--p-primary-color) 72%,transparent)}.cp-row-on{background:var(--p-select-option-selected-background)}.cp-row-main{display:flex;align-items:center;gap:7px;width:auto;min-width:0;flex:1;padding:8px;border:none;border-radius:8px;background:transparent;color:var(--p-text-color);cursor:pointer;outline:none;font:inherit;text-align:left}.cp-ico{width:16px;height:16px;color:var(--p-text-muted-color);flex-shrink:0}.cp-row-on .cp-ico{color:var(--p-primary-color)}.cp-label{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.cp-meta{font-size:11px;color:var(--p-text-muted-color);flex-shrink:0}.cp-check{width:16px;height:16px;color:var(--p-primary-color);flex-shrink:0}@media(prefers-reduced-motion:reduce){.cp-pop{transition:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.cp-state--stack{align-items:flex-start;flex-direction:column;gap:8px}.cp-create{padding:10px;overflow:auto}.kx-wcmount{display:block;width:100%}.kx-wcmount-fail{font-size:12px;color:var(--p-text-muted-color);padding:8px;border:1px dashed var(--p-content-border-color);border-radius:8px}.cp-create-btn{appearance:none;border:1px solid var(--p-primary-color);background:var(--p-primary-color);color:var(--p-button-primary-color);border-radius:8px;padding:8px 10px;font-size:12px;font-weight:650;display:inline-flex;align-items:center;gap:6px;cursor:pointer}.cp-create-foot{appearance:none;width:100%;margin-top:2px;border:1px dashed color-mix(in srgb,var(--p-primary-color) 55%,transparent);background:transparent;color:var(--p-primary-color);border-radius:8px;padding:8px;font-size:12.5px;font-weight:650;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}.cp-create-foot:hover{background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.cp-row--compound{gap:2px;padding:0}.cp-row-del{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin-right:4px;padding:0;border:none;border-radius:8px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;transition:background .1s,color .1s}.cp-row-del:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500)}.cp-row-del:disabled{opacity:.6;cursor:default}.cp-row-del-yes{color:var(--p-danger-500)}.cp-del-err{margin:4px 2px;padding:8px 10px;border-radius:10px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);background:color-mix(in srgb,var(--p-danger-500) 7%,transparent);font-size:12px;line-height:1.4;color:var(--p-danger-600, var(--p-danger-500))}', oe = {
  type: "object",
  properties: {
    source: { type: "string", description: "Endpoint listing the picker catalog. When absent, the field schema's declared source wins, then the thread endpoint default." },
    schema: { type: "string", default: "", description: "Field schema. Its primary field may declare source to select a non-thread picker catalog." },
    "thread-class": { type: "string", default: "", description: "The component class to scope the instance list to (meta.thread_class)." },
    meta: { type: "string", default: "", description: 'JSON object {type:"thread", thread_class}. Supplies thread_class when set; the poller mount passes it.' },
    value: { type: "string", default: "", description: "Current selection: a JSON object string {thread_id} or empty." },
    config: { type: "string", default: "", description: "Alias of value: a JSON object string {thread_id}. Used by the poller config form." },
    placeholder: { type: "string", default: "", description: 'Text shown when nothing is selected. Empty lets the field title drive the prompt ("Select a <noun>…"), falling back to a neutral "Select…".' },
    "delete-endpoint": { type: "string", default: "", description: "Base endpoint enabling per-row deletion (DELETE <endpoint>/<id>). Empty disables it. Also read from meta.delete_endpoint." }
  }
};
class te extends Lr {
  static get wippyConfig() {
    return {
      propsSchema: oe,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: ae
    };
  }
  static get vueConfig() {
    return { rootComponent: ee };
  }
}
Fr(import.meta.url, te);
//# sourceMappingURL=component_picker.js.map
