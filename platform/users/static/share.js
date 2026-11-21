import { u as nr, a as sr, W as lr, P as dr } from "./wc-runtime-Bo5yC9Bh.js";
import { defineComponent as ur, computed as q, ref as l, watch as Y, onMounted as vr, openBlock as t, createBlock as G, unref as u, withKeys as mr, withModifiers as U, withCtx as H, createElementVNode as c, createVNode as f, normalizeClass as N, createTextVNode as z, createElementBlock as i, Fragment as L, renderList as V, toDisplayString as x, createCommentVNode as C, nextTick as gr } from "vue";
import { Icon as h } from "@iconify/vue";
import { api as B, host as I, define as fr } from "@wippy-fe/proxy";
import { s as xr } from "./index-3UmdaoAP.js";
import { e as hr } from "./errMsg-CxKGcp1F.js";
import { _ as br, r as wr } from "./PrincipalPicker.vue_vue_type_script_setup_true_lang-CoSxbp_M.js";
const yr = { class: "kxs-head-text" }, kr = { class: "kxs-title" }, _r = { key: 0 }, zr = { class: "kxs" }, Cr = { class: "kxs-pick" }, jr = ["disabled"], Sr = ["title", "onClick"], Er = {
  key: 0,
  class: "kxs-err"
}, Mr = {
  key: 1,
  class: "kxs-err"
}, Nr = {
  key: 2,
  class: "kxs-loading"
}, Pr = {
  key: 3,
  class: "kxs-empty"
}, Rr = {
  key: 4,
  class: "kxs-list"
}, $r = { class: "kxs-row-text" }, Ar = { class: "kxs-row-name" }, Ur = ["title"], Lr = {
  key: 0,
  class: "kxs-id"
}, Vr = {
  key: 0,
  class: "kxs-owner"
}, Br = {
  key: 0,
  class: "kxs-row-sub"
}, Ir = { class: "kxs-caps" }, Kr = ["disabled", "title", "onClick"], Or = ["aria-label", "onClick"], Tr = {
  key: 1,
  class: "kxs-icon-btn kxs-icon-locked",
  title: "The owner can't be removed"
}, Dr = /* @__PURE__ */ ur({
  __name: "share",
  setup(Q) {
    const X = nr(), K = sr();
    function Z(r) {
      return r === "group" ? "Unknown group" : "Unknown user";
    }
    const v = q(() => X.value.config || {}), y = l([]), j = l(""), P = q(() => y.value.find((r) => r.key === "admin")?.bit ?? 8);
    function k(r, e) {
      return (r & e) === e;
    }
    function O(r, e) {
      return r ^ e;
    }
    function rr(r) {
      return k(r.access_mask, P.value) ? _.value.filter((e) => k(e.access_mask, P.value)).length <= 1 : !1;
    }
    const R = l(!1), b = l(""), _ = l([]);
    function er(r) {
      return r.includes(":") && !r.includes("@");
    }
    function $(r, e) {
      if (r && typeof r == "object") {
        const a = r;
        a.response?.status === 401 && I.handleError?.("auth-expired", a);
      }
      return hr(r, e);
    }
    async function ar() {
      j.value = "";
      try {
        const { data: r } = await B.get("/api/v1/components/access-model");
        if (r?.success && Array.isArray(r.capabilities) && r.capabilities.length) {
          y.value = r.capabilities;
          return;
        }
        y.value = [], j.value = "could not load permissions";
      } catch (r) {
        y.value = [], j.value = $(r, "could not load permissions");
      }
    }
    async function T() {
      const r = v.value.access_url;
      if (!r) {
        _.value = [];
        return;
      }
      R.value = !0, b.value = "";
      try {
        const { data: e } = await B.get(r), a = e?.success ? e.access || [] : [], p = e?.owner, s = a.map((o) => {
          const d = o.subject_id || o.user_id || o.id, n = o.subject_type || (er(d) ? "group" : "user");
          return { id: d, type: n, label: o.full_name || o.email || "", sublabel: o.email || "", access_mask: Number(o.access_mask) || 0, owner: o.owner === !0 || !!p && d === p, resolved: !0 };
        }), g = s.filter((o) => !o.label);
        if (g.length)
          try {
            const o = await wr(g.map((n) => ({ type: n.type, id: n.id }))), d = new Map(o.map((n) => [n.id, n]));
            for (const n of s)
              if (!n.label) {
                const W = d.get(n.id);
                n.label = W?.label || "", n.sublabel = n.sublabel || W?.sublabel || "";
              }
          } catch {
          }
        for (const o of s)
          o.label || (o.label = Z(o.type), o.resolved = !1);
        s.sort((o, d) => Number(d.owner) - Number(o.owner) || d.access_mask - o.access_mask || o.label.localeCompare(d.label)), _.value = s;
      } catch (e) {
        _.value = [], b.value = $(e, "could not load access");
      } finally {
        R.value = !1;
      }
    }
    const S = l(!0), M = l(!1);
    Y(S, (r) => {
      r || K("close", void 0);
    });
    function or() {
      S.value = !1;
    }
    vr(ar), Y(() => v.value.access_url, () => T(), { immediate: !0 });
    const w = l(null), m = l(1), E = l(!1), D = l(0);
    function tr(r) {
      w.value = { ...r };
    }
    function pr(r) {
      m.value = O(m.value, r);
    }
    async function A(r, e, a, p) {
      const s = v.value.share_url;
      if (!s) return !1;
      b.value = "";
      try {
        const g = p ? { subject_id: r, subject_type: e, action: "revoke" } : { subject_id: r, subject_type: e, access_mask: a }, { data: o } = await B.post(s, g);
        if (!o?.success) throw new Error(o?.error || "failed");
        return await T(), K("changed", { resource_id: v.value.resource_id }), !0;
      } catch (g) {
        return b.value = $(g, "change failed"), !1;
      }
    }
    async function ir() {
      if (!w.value || m.value === 0) return;
      E.value = !0;
      const r = w.value.label;
      await A(w.value.id, w.value.type, m.value) && (I.toast?.({ severity: "success", summary: "Shared", detail: r }), w.value = null, D.value += 1, m.value = 1), E.value = !1;
    }
    async function cr(r, e) {
      if (r.owner) return;
      if (k(r.access_mask, e) && e === P.value && rr(r)) {
        b.value = "At least one admin is required.";
        return;
      }
      const p = O(r.access_mask, e);
      if (p === 0) {
        await F(r);
        return;
      }
      await A(r.id, r.type, p);
    }
    async function F(r) {
      const { share_url: e, resource_id: a, title: p } = v.value;
      if (r.owner || !e) return;
      const s = p?.trim() || a, g = s ? `“${s}”` : "this resource";
      M.value = !0;
      try {
        await gr(), await I.confirm({
          header: "Remove access",
          message: `Remove ${r.label}’s access to ${g}?`,
          acceptLabel: "Remove access",
          rejectLabel: "Cancel",
          acceptClass: "p-button-danger kxs-revoke-accept",
          defaultFocus: "reject"
        }) && S.value && v.value.share_url === e && await A(r.id, r.type, 0, !0);
      } finally {
        M.value = !1;
      }
    }
    return (r, e) => (t(), G(u(xr), {
      visible: S.value,
      "onUpdate:visible": e[2] || (e[2] = (a) => S.value = a),
      modal: "",
      "dismissable-mask": !0,
      "close-on-escape": !1,
      "append-to": M.value ? "self" : "body",
      "auto-z-index": !M.value,
      style: { width: "560px", maxWidth: "calc(100vw - 48px)" },
      "aria-label": "Share",
      class: "kxs-dialog",
      onKeydown: mr(U(or, ["stop"]), ["esc"])
    }, {
      header: H(() => [
        f(u(h), {
          icon: "tabler:user-share",
          class: "kxs-head-ico",
          "aria-hidden": "true"
        }),
        c("div", yr, [
          c("div", kr, [
            e[3] || (e[3] = z("Share", -1)),
            v.value.title ? (t(), i("span", _r, " · " + x(v.value.title), 1)) : C("", !0)
          ]),
          e[4] || (e[4] = c("div", { class: "kxs-sub" }, "Choose people or groups and exactly what they can do.", -1))
        ])
      ]),
      default: H(() => [
        c("div", zr, [
          c("div", {
            class: "kxs-add",
            onClick: e[0] || (e[0] = U(() => {
            }, ["stop"]))
          }, [
            c("div", Cr, [
              (t(), G(br, {
                key: D.value,
                kinds: "user,group",
                onChange: tr
              }))
            ]),
            c("button", {
              class: "kxs-btn kxs-btn-primary",
              disabled: !w.value || m.value === 0 || E.value,
              onClick: ir
            }, [
              f(u(h), {
                icon: E.value ? "tabler:loader-2" : "tabler:plus",
                class: N(E.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              e[5] || (e[5] = z(" Share ", -1))
            ], 8, jr)
          ]),
          c("div", {
            class: "kxs-caps kxs-caps-new",
            onClick: e[1] || (e[1] = U(() => {
            }, ["stop"]))
          }, [
            (t(!0), i(L, null, V(y.value, (a) => (t(), i("button", {
              key: a.key,
              type: "button",
              class: N(["kxs-cap", k(m.value, a.bit) && "kxs-cap-on"]),
              title: a.description,
              onClick: (p) => pr(a.bit)
            }, [
              f(u(h), {
                icon: k(m.value, a.bit) ? "tabler:check" : "tabler:plus",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              z(" " + x(a.label), 1)
            ], 10, Sr))), 128))
          ]),
          j.value ? (t(), i("div", Er, x(j.value), 1)) : C("", !0),
          b.value ? (t(), i("div", Mr, x(b.value), 1)) : C("", !0),
          e[8] || (e[8] = c("div", { class: "kxs-list-head" }, "People with access", -1)),
          R.value ? (t(), i("div", Nr, [
            f(u(h), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[6] || (e[6] = z(" Loading…", -1))
          ])) : _.value.length ? (t(), i("div", Rr, [
            (t(!0), i(L, null, V(_.value, (a) => (t(), i("div", {
              key: a.type + ":" + a.id,
              class: "kxs-row"
            }, [
              c("span", {
                class: N(["kxs-ava", a.type === "group" && "kxs-ava-group"])
              }, [
                f(u(h), {
                  icon: a.type === "group" ? "tabler:users-group" : "tabler:user",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 2),
              c("div", $r, [
                c("div", Ar, [
                  c("span", {
                    class: "kxs-row-label",
                    title: a.label
                  }, [
                    z(x(a.label), 1),
                    a.resolved ? C("", !0) : (t(), i("span", Lr, x(a.id), 1))
                  ], 8, Ur),
                  a.owner ? (t(), i("span", Vr, "Owner")) : C("", !0)
                ]),
                a.sublabel ? (t(), i("span", Br, x(a.sublabel), 1)) : C("", !0)
              ]),
              c("div", Ir, [
                (t(!0), i(L, null, V(y.value, (p) => (t(), i("button", {
                  key: p.key,
                  type: "button",
                  class: N(["kxs-cap kxs-cap-sm", [k(a.access_mask, p.bit) && "kxs-cap-on", a.owner && "kxs-cap-locked"]]),
                  disabled: a.owner,
                  title: a.owner ? "The owner has full access" : p.description,
                  onClick: (s) => cr(a, p.bit)
                }, x(p.label), 11, Kr))), 128))
              ]),
              a.owner ? (t(), i("span", Tr, [
                f(u(h), {
                  icon: "tabler:lock",
                  "aria-hidden": "true"
                })
              ])) : (t(), i("button", {
                key: 0,
                class: "kxs-icon-btn",
                title: "Remove access",
                "aria-label": `Remove ${a.label}`,
                onClick: (p) => F(a)
              }, [
                f(u(h), {
                  icon: "tabler:x",
                  "aria-hidden": "true"
                })
              ], 8, Or))
            ]))), 128))
          ])) : (t(), i("div", Pr, [
            f(u(h), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            e[7] || (e[7] = z(" Not shared with anyone yet.", -1))
          ]))
        ])
      ]),
      _: 1
    }, 8, ["visible", "append-to", "auto-z-index", "onKeydown"]));
  }
}), Fr = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.anchored-panel{position:fixed;min-width:0;overflow:auto}@tailwind base;*,*:before,*:after{box-sizing:border-box}:host(wc-principal-picker)>div:empty,:host(wc-principal-picker)>div:has(>[data-lazy-state]){min-height:36px}.kpp-control{display:flex;align-items:center;gap:8px;width:100%;min-height:36px;padding:6px 10px;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer}.kpp-control:hover,.kpp-control.is-open{border-color:var(--p-primary-color)}.kpp-control>svg{width:16px;height:16px;flex:none;color:var(--p-text-muted-color)}.kpp-control>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}.kpp-control .is-placeholder{color:var(--p-text-muted-color)}.kpp-panel{display:flex;flex-direction:column;min-height:0;max-height:var(--anchored-panel-available-height,320px);padding:6px;overflow:hidden;border:1px solid var(--p-content-border-color);border-radius:14px;background:var(--p-content-background);box-shadow:0 14px 36px color-mix(in srgb,var(--p-text-color) 20%,transparent)}.kpp-search{display:flex;align-items:center;gap:7px;padding:5px 7px;border-bottom:1px solid var(--p-content-border-color)}.kpp-search svg{width:15px;height:15px;flex:none;color:var(--p-text-muted-color)}.kpp-search input{width:100%;min-width:0;border:0;outline:0;padding:6px 2px;color:var(--p-text-color);background:transparent;font:inherit;font-size:13px}.kpp-state{padding:18px;text-align:center;color:var(--p-text-muted-color);font-size:12.5px}.kpp-state.is-error{color:var(--p-danger-600,var(--p-danger-500))}.kpp-list{display:flex;flex-direction:column;min-height:0;overflow-y:auto}.kpp-row{display:flex;align-items:center;gap:8px;width:100%;padding:8px;border:0;border-radius:8px;background:transparent;color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer}.kpp-row:hover,.kpp-row.is-active{background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kpp-row.is-selected{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.kpp-row>svg{width:16px;height:16px;flex:none;color:var(--p-text-muted-color)}.kpp-copy{display:flex;flex:1;min-width:0;flex-direction:column}.kpp-copy strong,.kpp-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kpp-copy strong{font-size:13px}.kpp-copy small,.kpp-kind{color:var(--p-text-muted-color);font-size:11px}.kpp-kind{flex:none}.kpp-clear{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:4px;padding:8px;border:1px solid var(--p-content-border-color);border-radius:8px;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12px;font-weight:650;cursor:pointer}.kpp-clear:hover,.kpp-clear:focus-visible{color:var(--p-text-color)}.kpp-clear svg{width:14px;height:14px}@media(max-width:360px){.kpp-kind{display:none}.kpp-panel{max-width:calc(100vw - 16px)}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block}.kxs{width:100%;container-type:inline-size;display:flex;flex-direction:column;gap:12px;font-family:Inter,system-ui,sans-serif;color:var(--p-text-color)}.kxs *,.kxs *:before,.kxs *:after{box-sizing:border-box}.kxs-head-text{display:flex;flex-direction:column}.kxs-head-ico{width:22px;height:22px;color:var(--p-primary-color);flex:none;margin-top:1px}.kxs-title{font-size:14px;font-weight:800;letter-spacing:-.01em}.kxs-sub{font-size:12px;color:var(--p-text-muted-color);margin-top:1px}.kxs-add{display:flex;gap:8px;align-items:stretch}.kxs-pick{position:relative;flex:1;min-width:0}.kxs-search{position:relative}.kxs-search-ico{position:absolute;left:9px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kxs-input{width:100%;height:34px;padding:0 10px 0 30px;font-size:13px;background:var(--p-content-background);color:var(--p-text-color);border:1px solid var(--p-content-border-color);border-radius:8px;outline:none;transition:border-color .15s,box-shadow .15s}.kxs-input::placeholder{color:var(--p-text-muted-color)}.kxs-menu{width:100%;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;box-shadow:var(--p-popover-shadow);padding:4px;max-height:240px;overflow-y:auto}.kxs-menu-empty{padding:10px;font-size:12px;color:var(--p-text-muted-color);text-align:center}.kxs-opt{display:flex;align-items:center;gap:9px;width:100%;padding:6px 8px;border:0;background:transparent;border-radius:6px;cursor:pointer;text-align:left}.kxs-opt:hover{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.kxs-opt-ava,.kxs-ava{width:28px;height:28px;border-radius:50%;flex:none;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.kxs-ava svg{width:15px;height:15px}.kxs-ava-group{background:color-mix(in srgb,var(--p-text-color) 10%,transparent);color:var(--p-text-color)}.kxs-caps{display:flex;gap:5px;flex-wrap:wrap;align-items:center}.kxs-caps-new{margin-top:-4px}.kxs-cap{height:26px;padding:0 9px;font-size:11.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;background:transparent;color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color);border-radius:6px;transition:background .12s,color .12s,border-color .12s}.kxs-cap svg{width:12px;height:12px}.kxs-cap:hover:not(:disabled){border-color:var(--p-text-muted-color);color:var(--p-text-color)}.kxs-cap-on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);border-color:color-mix(in srgb,var(--p-primary-color) 45%,transparent);color:var(--p-primary-color)}.kxs-cap-sm{height:24px;padding:0 8px;font-size:11px}.kxs-cap-locked,.kxs-cap:disabled{cursor:default;opacity:.85}.kxs-cap-locked.kxs-cap-on{opacity:1}.kxs-owner{flex:none;margin-left:7px;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:1px 5px;border-radius:6px;vertical-align:middle}.kxs-icon-locked{color:var(--p-text-muted-color);cursor:default}.kxs-icon-locked:hover{background:transparent;color:var(--p-text-muted-color)}.kxs-btn{height:34px;padding:0 13px;font-size:13px;font-weight:700;border-radius:8px;border:1px solid transparent;display:inline-flex;align-items:center;gap:6px;cursor:pointer;flex:none;font-family:Outfit,Inter,sans-serif;transition:background .15s,transform .12s}.kxs-btn svg{width:15px;height:15px}.kxs-btn:disabled{opacity:.5;cursor:not-allowed}.kxs-btn-primary{background:var(--p-primary-color);color:var(--p-button-primary-color)}.kxs-btn-primary:not(:disabled):hover{background:var(--p-primary-hover-color);transform:translateY(-1px)}.kxs-err{font-size:12px;color:var(--p-danger-500);background:color-mix(in srgb,var(--p-danger-500) 8%,transparent);border-radius:6px;padding:6px 9px}.kxs-list-head{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--p-text-muted-color)}.kxs-loading,.kxs-empty{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--p-text-muted-color);padding:8px 0}.kxs-loading svg,.kxs-empty svg{width:15px;height:15px}.kxs-list{display:flex;flex-direction:column;gap:6px}.kxs-row{display:grid;grid-template-columns:auto minmax(11rem,1fr) minmax(0,auto) auto;align-items:center;gap:9px;padding:6px 8px;border-radius:8px;background:color-mix(in srgb,var(--p-text-color) 3.5%,transparent)}.kxs-row-text{display:flex;flex-direction:column;min-width:0}.kxs-row-name{display:flex;align-items:center}.kxs-row-label{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kxs-id{font-family:ui-monospace,Menlo,monospace;font-size:11px;font-weight:400;color:var(--p-text-muted-color)}.kxs-row-sub{font-size:11px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kxs-icon-btn{width:28px;height:28px;border-radius:8px;border:0;background:transparent;color:var(--p-text-muted-color);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:none;transition:background .15s,color .15s}.kxs-icon-btn svg{width:15px;height:15px}.kxs-icon-btn:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500)}@container (max-width: 27rem){.kxs-add{flex-direction:column}.kxs-pick{flex:none}.kxs-add .kxs-btn{justify-content:center}.kxs-row{grid-template-columns:auto minmax(0,1fr) auto;row-gap:4px}.kxs-row-text{grid-column:2 / -1}.kxs-row>.kxs-caps{grid-column:2}}', Wr = {
  type: "object",
  properties: {
    config: {
      type: "object",
      description: "Share target: { resource_id, access_url, share_url, title }"
    }
  }
};
class J extends lr {
  static get wippyConfig() {
    return {
      propsSchema: Wr,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Fr
    };
  }
  static get vueConfig() {
    return { rootComponent: Dr, plugins: [dr] };
  }
}
async function Zr() {
  return J;
}
fr(import.meta.url, J);
export {
  Zr as webComponent
};
//# sourceMappingURL=share.js.map
