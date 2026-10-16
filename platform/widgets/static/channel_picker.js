import { u as sr, a as lr, W as dr } from "./index-C70m2Vvt.js";
import { defineComponent as vr, computed as m, ref as h, watch as ur, openBlock as c, createElementBlock as t, Fragment as b, createElementVNode as x, withKeys as W, withModifiers as hr, normalizeClass as $, createVNode as k, unref as w, createTextVNode as _, toDisplayString as M, withCtx as fr, renderList as gr, normalizeStyle as mr, createBlock as H, createCommentVNode as br } from "vue";
import { Icon as y } from "@iconify/vue";
import { api as G, define as wr } from "@wippy-fe/proxy";
import { _ as yr } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
const xr = () => sr(), kr = () => lr(), _r = ["aria-expanded", "onKeydown"], zr = { class: "cp-value-id" }, Cr = { class: "cp-pop" }, Sr = {
  key: 0,
  class: "cp-state"
}, Er = {
  key: 1,
  class: "cp-state"
}, Nr = {
  key: 2,
  class: "cp-tree"
}, $r = ["onClick"], Mr = {
  key: 1,
  class: "cp-twist cp-twist-empty",
  "aria-hidden": "true"
}, Pr = { class: "cp-label" }, Rr = /* @__PURE__ */ vr({
  __name: "ChannelPicker",
  setup(Q) {
    const f = xr(), z = kr(), V = m(() => f.value?.connectionsSource || "/api/v1/connections"), X = m(() => f.value?.discoverPath || "/api/v1/connections/{id}/discover_resources"), K = m(() => (f.value?.providers || "").split(",").map((r) => r.trim()).filter(Boolean)), Y = m(() => f.value?.childArg || "parent_id"), Z = m(() => f.value?.placeholder || "Select a channel…"), C = h([]), P = h(!1), S = h(!1), s = h(!1), l = h(null), d = h(null), E = h(!1), L = h(null);
    function v(r) {
      return typeof r == "string" ? r : r == null ? "" : String(r);
    }
    function O(r) {
      return Array.isArray(r?.items) ? r.items : [];
    }
    async function F() {
      if (!S.value) {
        S.value = !0;
        try {
          const r = K.value.length ? K.value : [""], e = /* @__PURE__ */ new Set(), o = [];
          for (const i of r) {
            const p = i ? `${V.value}?provider=${encodeURIComponent(i)}&limit=100` : `${V.value}?limit=100`, { data: N } = await G.get(p);
            for (const g of O(N)) {
              if (g.reply_provider !== !0) continue;
              const a = v(g.id);
              !a || e.has(a) || (e.add(a), o.push({
                key: `c:${a}`,
                kind: "connection",
                label: v(g.label) || a,
                connection_id: a,
                channel_id: "",
                resource_id: "",
                expandable: !0,
                loaded: !1,
                loading: !1,
                expanded: !1,
                children: []
              }));
            }
          }
          C.value = o, P.value = !0, z("load", void 0);
        } catch (r) {
          z("error", { message: "failed to list connections", error: r });
        } finally {
          S.value = !1;
        }
      }
    }
    function rr(r) {
      return X.value.replace("{id}", encodeURIComponent(r));
    }
    function or(r, e, o) {
      const i = /* @__PURE__ */ new Map();
      for (const a of o) {
        const u = v(a.id);
        u && i.set(u, a);
      }
      const p = /* @__PURE__ */ new Map(), N = [];
      for (const a of o) {
        const u = v(a.id);
        if (!u) continue;
        const n = v(a.parent_id);
        if (n && i.has(n) && n !== u) {
          const j = p.get(n);
          j ? j.push(a) : p.set(n, [a]);
        } else
          N.push(a);
      }
      const g = (a, u) => {
        const n = v(a.id), D = (p.get(n) || []).map((pr) => g(pr, `${u}/${n}`)), U = D.length > 0, A = a.selectable === !0 && !U, q = a.drillable === !0, J = !A;
        return {
          key: `${u}/${n}`,
          kind: A ? "channel" : "container",
          label: v(a.label) || n,
          connection_id: r,
          channel_id: A ? n : "",
          resource_id: n,
          // A drillable container (a guild) loads its children on expand; a
          // non-drillable one (a category) already has them nested here, so an empty
          // category just shows empty rather than drilling and 404-ing.
          expandable: J && (q || U),
          loaded: U || J && !q,
          loading: !1,
          expanded: !1,
          children: D
        };
      };
      return N.map((a) => g(a, e));
    }
    async function I(r) {
      if (!(r.loaded || r.loading)) {
        r.loading = !0;
        try {
          const e = {};
          r.kind !== "connection" && r.resource_id && (e[Y.value] = r.resource_id);
          const { data: o } = await G.post(rr(r.connection_id), e);
          r.children = or(r.connection_id, r.key, O(o)), r.loaded = !0;
        } catch (e) {
          z("error", { message: "failed to load channels", error: e });
        } finally {
          r.loading = !1;
        }
      }
    }
    function er(r) {
      r.expandable && (r.expanded = !r.expanded, r.expanded && !r.loaded && I(r));
    }
    const ar = m(() => {
      const r = [], e = (o, i) => {
        for (const p of o)
          r.push({ node: p, depth: i }), p.expanded && p.children.length && e(p.children, i + 1);
      };
      return e(C.value, 0), r;
    });
    function cr(r) {
      return r === "connection" ? "tabler:plug-connected" : r === "container" ? "tabler:server" : "tabler:hash";
    }
    function B(r) {
      return r.kind === "channel" && !!l.value && l.value.connection_id === r.connection_id && l.value.channel_id === r.channel_id;
    }
    function ir(r) {
      r.kind === "channel" ? (l.value = { connection_id: r.connection_id, channel_id: r.channel_id }, d.value = r, z("change", { connection_id: r.connection_id, channel_id: r.channel_id, channel_name: r.label }), s.value = !1) : er(r);
    }
    function nr(r) {
      if (typeof r != "string" || !r.trim()) return null;
      try {
        const e = JSON.parse(r);
        if (e && e.channel_id) return { connection_id: v(e.connection_id), channel_id: v(e.channel_id) };
      } catch {
      }
      return null;
    }
    async function T(r, e) {
      r.loaded || await I(r);
      for (const o of r.children) {
        if (o.kind === "channel" && o.channel_id === e) return o;
        if (o.kind === "container") {
          const i = await T(o, e);
          if (i) return i;
        }
      }
      return null;
    }
    async function tr() {
      const r = l.value;
      if (!r) {
        d.value = null;
        return;
      }
      if (!(d.value && d.value.connection_id === r.connection_id && d.value.channel_id === r.channel_id) && !E.value) {
        d.value = null, E.value = !0;
        try {
          P.value || await F();
          const e = C.value.find((o) => o.kind === "connection" && o.connection_id === r.connection_id);
          d.value = e ? await T(e, r.channel_id) : null;
        } finally {
          E.value = !1;
        }
      }
    }
    ur(() => f.value?.value, (r) => {
      l.value = nr(r), tr();
    }, { immediate: !0 });
    function R() {
      s.value = !s.value, s.value && !P.value && F();
    }
    return (r, e) => (c(), t(b, null, [
      x("div", {
        ref_key: "ctrl",
        ref: L,
        class: $(["cp", s.value && "cp-open"]),
        role: "button",
        tabindex: "0",
        "aria-expanded": s.value,
        onClick: R,
        onKeydown: [
          W(R, ["enter"]),
          W(hr(R, ["prevent"]), ["space"])
        ]
      }, [
        k(w(y), {
          icon: "tabler:hash",
          class: "cp-lead",
          "aria-hidden": "true"
        }),
        x("span", {
          class: $(["cp-value", !l.value && "cp-ph"])
        }, [
          l.value ? d.value ? (c(), t(b, { key: 1 }, [
            _(M(d.value.label), 1)
          ], 64)) : E.value ? (c(), t(b, { key: 2 }, [
            _("Resolving…")
          ], 64)) : (c(), t(b, { key: 3 }, [
            e[1] || (e[1] = _("Unknown channel", -1)),
            x("span", zr, M(l.value.channel_id), 1)
          ], 64)) : (c(), t(b, { key: 0 }, [
            _(M(Z.value), 1)
          ], 64))
        ], 2),
        k(w(y), {
          icon: s.value ? "tabler:chevron-up" : "tabler:chevron-down",
          class: "cp-caret",
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 42, _r),
      k(yr, {
        open: s.value,
        "onUpdate:open": e[0] || (e[0] = (o) => s.value = o),
        anchor: L.value,
        "min-width": 280,
        "max-height": 360
      }, {
        default: fr(() => [
          x("div", Cr, [
            S.value ? (c(), t("div", Sr, [
              k(w(y), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              e[2] || (e[2] = _(" Loading connections…", -1))
            ])) : C.value.length ? (c(), t("div", Nr, [
              (c(!0), t(b, null, gr(ar.value, (o) => (c(), t("button", {
                key: o.node.key,
                type: "button",
                class: $(["cp-row", [`cp-${o.node.kind}`, B(o.node) && "cp-row-on"]]),
                style: mr({ "--cp-depth": `${o.depth * 16}px` }),
                onClick: (i) => ir(o.node)
              }, [
                o.node.expandable ? (c(), H(w(y), {
                  key: 0,
                  icon: o.node.loading ? "tabler:loader-2" : o.node.expanded ? "tabler:chevron-down" : "tabler:chevron-right",
                  class: $(["cp-twist", o.node.loading && "spin"]),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])) : (c(), t("span", Mr)),
                k(w(y), {
                  icon: cr(o.node.kind),
                  class: "cp-ico",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                x("span", Pr, M(o.node.label), 1),
                B(o.node) ? (c(), H(w(y), {
                  key: 2,
                  icon: "tabler:check",
                  class: "cp-check",
                  "aria-hidden": "true"
                })) : br("", !0)
              ], 14, $r))), 128))
            ])) : (c(), t("div", Er, "No connections."))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), jr = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.cp-pop{box-sizing:border-box;overflow:hidden;max-width:calc(100vw - 16px);max-height:var(--anchored-panel-available-height, 360px);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--p-select-overlay-border-radius);box-shadow:var(--p-select-overlay-shadow);padding:6px;display:flex;flex-direction:column;gap:2px;transition:height .2s ease,max-height .2s ease}.cp-list,.cp-tree{display:flex;flex-direction:column;gap:1px;flex:1 1 auto;min-height:0;overflow-y:auto}.cp-row{display:flex;align-items:center;gap:7px;width:100%;text-align:left;padding:8px;border:none;border-radius:8px;background:transparent;color:var(--p-text-color);cursor:pointer;outline:none;transition:background .1s}.cp-row:hover,.cp-row--compound:hover{background:var(--p-select-option-focus-background)}.cp-row:focus-visible,.cp-row--compound:focus-within{background:var(--p-select-option-focus-background);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--p-primary-color) 72%,transparent)}.cp-row-main{display:flex;align-items:center;gap:7px;width:auto;min-width:0;flex:1;padding:8px;border:none;border-radius:8px;background:transparent;color:var(--p-text-color);cursor:pointer;outline:none;font:inherit;text-align:left}.cp-ico{width:16px;height:16px;color:var(--p-text-muted-color);flex-shrink:0}.cp-row-on .cp-ico{color:var(--p-primary-color)}.cp-label{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.cp-meta{font-size:11px;color:var(--p-text-muted-color);flex-shrink:0}.cp-check{width:16px;height:16px;color:var(--p-primary-color);flex-shrink:0}@media(prefers-reduced-motion:reduce){.cp-pop{transition:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block}*,*:before,*:after{box-sizing:border-box}.cp{display:flex;align-items:center;gap:8px;width:100%;min-height:36px;padding:6px 10px;border:1px solid var(--p-content-border-color);background:var(--p-content-background);border-radius:8px;color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;transition:border-color .12s}.cp:hover,.cp-open{border-color:var(--p-primary-color)}.cp-lead{width:16px;height:16px;color:var(--p-text-muted-color);flex-shrink:0}.cp-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cp-ph{color:var(--p-text-muted-color)}.cp-value-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px}.cp-caret{width:16px;height:16px;color:var(--p-text-muted-color);flex-shrink:0}.cp-pop{box-sizing:border-box;overflow:hidden;max-width:calc(100vw - 16px);max-height:360px;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--p-select-overlay-border-radius);box-shadow:var(--p-select-overlay-shadow);padding:6px;display:flex;flex-direction:column;gap:2px;transition:height .2s ease,max-height .2s ease}.cp-state{display:flex;align-items:center;justify-content:center;gap:6px;padding:18px;font-size:12.5px;color:var(--p-text-muted-color)}.cp-tree{display:flex;flex-direction:column;gap:1px;flex:1 1 auto;min-height:0;overflow-y:auto}.cp-row{display:flex;align-items:center;gap:7px;width:100%;text-align:left;padding:7px 8px;border:none;border-radius:8px;background:transparent;color:var(--p-text-color);cursor:pointer;outline:none;transition:background .1s}.cp-row{padding-left:calc(10px + var(--cp-depth, 0px))}.cp-row:hover,.cp-row:focus-visible{background:var(--p-select-option-focus-background)}.cp-row-on{background:var(--p-select-option-selected-background)}.cp-channel{font-size:13px}.cp-connection,.cp-container{font-weight:600}.cp-twist{width:15px;height:15px;color:var(--p-text-muted-color);flex-shrink:0}.cp-twist-empty{display:inline-block}', Ur = {
  type: "object",
  properties: {
    "connections-source": { type: "string", default: "/api/v1/connections", description: "Endpoint listing connections (the tree roots). Filtered by ?provider= when 'providers' is set." },
    "discover-path": { type: "string", default: "/api/v1/connections/{id}/discover_resources", description: "POST endpoint template for a connection's resources. {id} is replaced by the connection component id; the request body carries drill-down args." },
    providers: { type: "string", default: "", description: "CSV of providers to show as roots (e.g. discord,slack). Empty shows every connection." },
    "child-arg": { type: "string", default: "parent_id", description: "discover_resources arg key used to drill into a container node (the parent's id)." },
    value: { type: "string", default: "", description: "Pre-selected channel: a JSON object string {connection_id, channel_id} or empty." },
    placeholder: { type: "string", default: "Select a channel…", description: "Text shown when nothing is selected." }
  }
};
class Ar extends dr {
  static get wippyConfig() {
    return {
      propsSchema: Ur,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: jr
    };
  }
  static get vueConfig() {
    return { rootComponent: Rr };
  }
}
wr(import.meta.url, Ar);
//# sourceMappingURL=channel_picker.js.map
