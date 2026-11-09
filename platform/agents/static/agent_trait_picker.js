import { u as Z, g as rr, W as ar, P as or } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as er, ref as d, computed as I, watch as V, onMounted as tr, openBlock as t, createElementBlock as i, createElementVNode as p, toDisplayString as u, withDirectives as ir, vModelText as pr, createVNode as g, withCtx as cr, Fragment as C, renderList as T, normalizeClass as m, unref as n, createCommentVNode as x, createTextVNode as nr, nextTick as j } from "vue";
import { Icon as A } from "@iconify/vue";
import { api as sr, define as lr } from "@wippy-fe/proxy";
import { _ as vr } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { u as dr, _ as ur, t as H, b as K } from "./trait-presentation-SeG51N48.js";
const fr = {
  class: "kx-agent-trait-picker",
  "data-testid": "agent-trait-picker"
}, gr = { class: "kx-group-head" }, xr = { class: "kx-group-meta" }, mr = ["aria-expanded", "aria-activedescendant"], br = ["id", "onMouseenter", "onClick"], hr = { class: "kx-trait-option-text" }, yr = { class: "kx-trait-name" }, kr = {
  key: 0,
  class: "kx-trait-description"
}, wr = { class: "kx-trait-badges" }, _r = {
  key: 0,
  class: "kx-trait-empty"
}, Cr = {
  key: 0,
  class: "kx-trait-list"
}, Tr = { class: "kx-trait-row" }, Ar = { class: "kx-trait-text" }, zr = { class: "kx-trait-name" }, $r = {
  key: 0,
  class: "kx-trait-id"
}, Sr = {
  key: 0,
  class: "kx-trait-description"
}, Er = { class: "kx-trait-badges" }, Or = { class: "kx-trait-actions" }, Ir = ["aria-expanded", "aria-label", "onClick"], Vr = ["aria-label", "onClick"], Dr = {
  key: 0,
  class: "kx-trait-config"
}, Lr = {
  key: 1,
  class: "kx-trait-empty-state"
}, R = "agent-trait-picker-listbox", Mr = /* @__PURE__ */ er({
  __name: "AgentTraitPicker",
  setup(q) {
    const b = Z(), Q = rr(), h = d([]), c = d(P(b.value.value)), { collapsedTraits: z, isTraitCollapsed: y, toggleTraitCollapsed: D } = dr(), $ = I(() => h.value.filter((r) => c.value.traits.includes(r.id))), k = (r) => c.value.traits.includes(r), w = d(""), s = d(!1), L = d(null), M = d(null), S = d([]), l = d(-1);
    let E = 0;
    const f = I(() => {
      const r = w.value.trim().toLowerCase();
      return h.value.filter((a) => !k(a.id)).filter((a) => !r || (a.title || a.id).toLowerCase().includes(r) || (a.description || "").toLowerCase().includes(r));
    }), B = I(() => l.value >= 0 ? `agent-trait-picker-option-${l.value}` : void 0);
    V([s, f], ([r, a]) => {
      S.value = [], l.value = r && a.length ? 0 : -1;
    }), V(() => b.value.value, (r) => {
      c.value = P(r), z.value = new Set([...z.value].filter((a) => c.value.traits.includes(a)));
    }), V(() => b.value.refreshKey, (r, a) => {
      r !== a && U();
    });
    function P(r) {
      if (typeof r != "string" || r === "") return { traits: [], trait_contexts: {} };
      try {
        const a = JSON.parse(r);
        if (!a || typeof a != "object" || Array.isArray(a)) return { traits: [], trait_contexts: {} };
        const o = Array.isArray(a.traits) ? a.traits.filter((v) => typeof v == "string") : [], e = a.trait_contexts && typeof a.trait_contexts == "object" && !Array.isArray(a.trait_contexts) ? a.trait_contexts : {};
        return { traits: o, trait_contexts: { ...e } };
      } catch {
        return { traits: [], trait_contexts: {} };
      }
    }
    function _(r) {
      c.value = r, Q("change", {
        traits: [...r.traits],
        trait_contexts: { ...r.trait_contexts }
      });
    }
    function F(r, a) {
      r instanceof HTMLElement && (S.value[a] = r);
    }
    function O(r, a = !1) {
      l.value = r, !(!a || r < 0) && j(() => S.value[r]?.scrollIntoView?.({ block: "nearest" }));
    }
    function N(r) {
      k(r) || _({ ...c.value, traits: [...c.value.traits, r] }), w.value = "", b.value.keepMenuOpenOnAdd || (s.value = !1, l.value = -1), j(() => M.value?.focus({ preventScroll: !0 }));
    }
    function W(r) {
      const a = c.value.traits.filter((e) => e !== r);
      k(r) || a.push(r);
      const o = { ...c.value.trait_contexts };
      if (!k(r)) {
        _({ ...c.value, traits: a, trait_contexts: o });
        return;
      }
      delete o[r], z.value.has(r) && D(r), _({ traits: a, trait_contexts: o });
    }
    function J(r, a) {
      _({
        ...c.value,
        trait_contexts: { ...c.value.trait_contexts, [r]: a }
      });
    }
    function G() {
      s.value = !0, O(f.value.length ? 0 : -1, !0);
    }
    function X(r) {
      const a = f.value.length;
      if (r.key === "Escape" || r.key === "Tab") {
        s.value = !1;
        return;
      }
      if (r.key === "ArrowDown" || r.key === "ArrowUp") {
        if (r.preventDefault(), s.value = !0, !a) return;
        const o = r.key === "ArrowDown" ? 1 : -1, e = l.value < 0 ? o > 0 ? -1 : 0 : l.value;
        O((e + o + a) % a, !0);
        return;
      }
      if (r.key === "Home" || r.key === "End") {
        if (!s.value || !a) return;
        r.preventDefault(), O(r.key === "Home" ? 0 : a - 1, !0);
        return;
      }
      if (r.key === "Enter" && s.value && l.value >= 0) {
        r.preventDefault();
        const o = f.value[l.value];
        o && N(o.id);
      }
    }
    function Y(r) {
      return typeof r.title == "string" && r.title.trim() ? r.title : "Unknown capability";
    }
    async function U() {
      const r = ++E;
      try {
        const { data: a } = await sr.get("/api/v1/agents/traits");
        r === E && (h.value = a?.success === !0 && Array.isArray(a.traits) ? a.traits : []);
      } catch {
        r === E && (h.value = []);
      }
    }
    return tr(() => {
      U();
    }), (r, a) => (t(), i("div", fr, [
      p("div", gr, [
        a[3] || (a[3] = p("span", { class: "kx-group-title" }, "Capabilities", -1)),
        p("span", xr, u($.value.length) + " active", 1)
      ]),
      p("div", {
        ref_key: "traitAddRoot",
        ref: L,
        class: "kx-tadd"
      }, [
        ir(p("input", {
          ref_key: "traitSearchInput",
          ref: M,
          "onUpdate:modelValue": a[0] || (a[0] = (o) => w.value = o),
          class: "kx-trait-search kx-focus-halo",
          type: "text",
          role: "combobox",
          "aria-label": "Search capabilities to add",
          "aria-autocomplete": "list",
          "aria-expanded": s.value,
          "aria-controls": R,
          "aria-activedescendant": s.value ? B.value : void 0,
          placeholder: "Search capabilities to add…",
          onFocus: a[1] || (a[1] = (o) => s.value = !0),
          onInput: G,
          onKeydown: X
        }, null, 40, mr), [
          [pr, w.value]
        ]),
        g(ur, {
          open: s.value,
          "onUpdate:open": a[2] || (a[2] = (o) => s.value = o),
          anchor: L.value
        }, {
          default: cr(() => [
            p("div", {
              id: R,
              class: "kx-trait-menu",
              role: "listbox",
              "aria-label": "Available capabilities"
            }, [
              (t(!0), i(C, null, T(f.value, (o, e) => (t(), i("button", {
                key: o.id,
                id: `agent-trait-picker-option-${e}`,
                ref_for: !0,
                ref: (v) => F(v, e),
                type: "button",
                class: m(["kx-trait-option", e === l.value && "kx-trait-option-active"]),
                tabindex: "-1",
                role: "option",
                "aria-selected": !1,
                onMouseenter: (v) => l.value = e,
                onClick: (v) => N(o.id)
              }, [
                p("span", {
                  class: m(["kx-trait-icon", `kx-tint-${n(H)(o)}`])
                }, [
                  g(n(A), {
                    icon: o.icon || "tabler:puzzle",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ], 2),
                p("span", hr, [
                  p("span", yr, u(o.title || o.id), 1),
                  o.description ? (t(), i("span", kr, u(o.description), 1)) : x("", !0)
                ]),
                p("span", wr, [
                  (t(!0), i(C, null, T(n(K)(o), (v) => (t(), i("span", {
                    key: v.key,
                    class: m(["kx-trait-badge", `kx-badge-${v.key}`])
                  }, u(v.label), 3))), 128))
                ])
              ], 42, br))), 128)),
              f.value.length ? x("", !0) : (t(), i("div", _r, "No matching capabilities."))
            ])
          ]),
          _: 1
        }, 8, ["open", "anchor"])
      ], 512),
      $.value.length ? (t(), i("ul", Cr, [
        (t(!0), i(C, null, T($.value, (o) => (t(), i("li", {
          key: o.id,
          class: "kx-trait-row-wrap"
        }, [
          p("div", Tr, [
            p("span", {
              class: m(["kx-trait-icon", `kx-tint-${n(H)(o)}`])
            }, [
              g(n(A), {
                icon: o.icon || "tabler:puzzle",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 2),
            p("span", Ar, [
              p("span", zr, [
                nr(u(Y(o)), 1),
                o.title?.trim() ? x("", !0) : (t(), i("span", $r, u(o.id), 1))
              ]),
              o.description ? (t(), i("span", Sr, u(o.description), 1)) : x("", !0)
            ]),
            p("span", Er, [
              (t(!0), i(C, null, T(n(K)(o), (e) => (t(), i("span", {
                key: e.key,
                class: m(["kx-trait-badge", `kx-badge-${e.key}`])
              }, u(e.label), 3))), 128))
            ]),
            p("span", Or, [
              o.web_component ? (t(), i("button", {
                key: 0,
                type: "button",
                class: "kx-trait-fold kx-focus-outline",
                "aria-expanded": !n(y)(o.id),
                "aria-label": n(y)(o.id) ? "Show settings" : "Hide settings",
                onClick: (e) => n(D)(o.id)
              }, [
                g(n(A), {
                  icon: n(y)(o.id) ? "tabler:chevron-right" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, Ir)) : x("", !0),
              p("button", {
                type: "button",
                class: "kx-trait-remove kx-focus-outline",
                "aria-label": `Remove ${o.title || o.id} capability`,
                onClick: (e) => W(o.id)
              }, [
                g(n(A), {
                  icon: "tabler:x",
                  "aria-hidden": "true"
                })
              ], 8, Vr)
            ])
          ]),
          o.web_component && !n(y)(o.id) ? (t(), i("div", Dr, [
            g(vr, {
              tag: o.web_component,
              config: c.value.trait_contexts[o.id] || {},
              provider: o.provider,
              onChange: (e) => J(o.id, e)
            }, null, 8, ["tag", "config", "provider", "onChange"])
          ])) : x("", !0)
        ]))), 128))
      ])) : (t(), i("p", Lr, "No capabilities yet."))
    ]));
  }
}), Pr = ":root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.kx-focus-halo:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-focus-outline:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:none}:host,:root{--kx-tone-blue: #2563eb;--kx-tone-violet: #7c3aed;--kx-tone-amber: #b45309}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}}:host(.w-theme-dark),:root.w-theme-dark{--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}.kx-tone-blue{color:var(--kx-tone-blue);background-color:color-mix(in srgb,var(--kx-tone-blue) 13%,transparent)}.kx-tone-violet{color:var(--kx-tone-violet);background-color:color-mix(in srgb,var(--kx-tone-violet) 13%,transparent)}.kx-tone-amber{color:var(--kx-tone-amber);background-color:color-mix(in srgb,var(--kx-tone-amber) 13%,transparent)}.kx-tone-neutral{color:var(--p-text-muted-color);background-color:color-mix(in srgb,var(--p-text-color) 10%,transparent)}.kx-wcmount{display:block;width:100%;min-width:0;max-width:100%;overflow-x:clip;--p-border-radius: var(--wf-radius-sm, 8px);--p-content-border-radius: var(--wf-radius-sm, 8px)}.kx-wcmount .kx-wcmount-surface{display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;color:inherit}.kx-wcmount-fail{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--p-danger-600, var(--p-danger-500));padding:9px 10px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);border-radius:10px;background:color-mix(in srgb,var(--p-danger-500) 7%,transparent)}.kx-wcmount-fail>span{min-width:0;flex:1}.kx-wcmount-fail button{border:1px solid currentColor;border-radius:8px;padding:5px 9px;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}.anchored-panel{position:fixed;min-width:0;overflow:auto}.kx-agent-trait-picker{display:flex;flex-direction:column;gap:10px;color:var(--p-text-color);font:inherit}.kx-group-head{display:flex;align-items:center;gap:12px}.kx-group-title{color:var(--p-text-color);font-size:13.5px;font-weight:700}.kx-group-meta{color:var(--p-text-muted-color);font-size:11.5px;font-weight:600;margin-left:auto}.kx-tadd{position:relative}.kx-trait-search{box-sizing:border-box;width:100%;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.kx-trait-search::placeholder{color:var(--p-text-muted-color)}.kx-trait-menu{box-sizing:border-box;width:100%;max-height:300px;overflow-y:auto;padding:4px;border:1px solid var(--p-content-border-color);border-radius:10px;background:var(--p-content-background);box-shadow:var(--p-popover-shadow)}.kx-trait-option{display:flex;align-items:center;gap:10px;width:100%;padding:7px 8px;border:0;border-radius:6px;background:transparent;color:var(--p-text-color);cursor:pointer;font:inherit;text-align:left}.kx-trait-option:hover,.kx-trait-option-active{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.kx-trait-option-text,.kx-trait-text{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}.kx-trait-name{color:var(--p-text-color);font-size:13px;font-weight:600}.kx-trait-description{display:-webkit-box;overflow:hidden;color:var(--p-text-muted-color);font-size:11.5px;line-height:1.4;-webkit-box-orient:vertical;-webkit-line-clamp:1}.kx-trait-id{color:var(--p-text-muted-color);font-weight:400}.kx-trait-badges{display:inline-flex;flex:none;gap:4px}.kx-trait-badge{flex:none;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:600}.kx-tint-tools{--kx-cap: var(--kx-tone-blue)}.kx-tint-behavior{--kx-cap: var(--kx-tone-violet)}.kx-tint-memory{--kx-cap: var(--kx-tone-amber)}.kx-tint-plain{--kx-cap: var(--p-text-muted-color)}.kx-badge-tools{color:var(--kx-tone-blue);background:color-mix(in srgb,var(--kx-tone-blue) 13%,transparent)}.kx-badge-behavior{color:var(--kx-tone-violet);background:color-mix(in srgb,var(--kx-tone-violet) 13%,transparent)}.kx-badge-memory{color:var(--kx-tone-amber);background:color-mix(in srgb,var(--kx-tone-amber) 15%,transparent)}.kx-trait-icon{display:inline-flex;flex:none;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px}.kx-trait-icon svg{width:17px;height:17px}.kx-trait-icon{color:var(--kx-cap);background:color-mix(in srgb,var(--kx-cap) 14%,transparent)}.kx-trait-list{display:flex;flex-direction:column;margin:0;padding:0;border:1px solid var(--p-content-border-color);border-radius:14px;background:var(--p-content-background);list-style:none}.kx-trait-row-wrap+.kx-trait-row-wrap{border-top:1px solid color-mix(in srgb,var(--p-content-border-color) 60%,transparent)}.kx-trait-row{display:flex;align-items:center;gap:11px;padding:10px 12px}.kx-trait-actions{display:inline-flex;flex:none;align-items:center;gap:5px}.kx-trait-fold,.kx-trait-remove{display:inline-flex;flex:none;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.kx-trait-fold:hover{background:color-mix(in srgb,var(--p-text-color) 7%,transparent);color:var(--p-text-color)}.kx-trait-fold svg{width:16px;height:16px}.kx-trait-remove:hover{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-500)}.kx-trait-remove svg{width:15px;height:15px}.kx-trait-config{padding:2px 12px 12px 45px}.kx-trait-empty,.kx-trait-empty-state{margin:0;padding:10px 12px;color:var(--p-text-muted-color);font-size:12px}.kx-trait-empty-state{padding:0;font-size:12px;line-height:1.5}", Nr = {
  type: "object",
  properties: {
    // JSON-encoded { traits: string[], trait_contexts: Record<string, unknown> }.
    value: { type: "string", default: '{"traits":[],"trait_contexts":{}}' },
    // Increment to reload the public trait catalog without remounting the picker.
    "refresh-key": { type: "integer", default: 0 },
    // Match consumers whose add flow keeps the filtered menu open after selection.
    "keep-menu-open-on-add": { type: "boolean", default: !1 }
  }
};
class Ur extends ar {
  static get wippyConfig() {
    return {
      propsSchema: Nr,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Pr
    };
  }
  static get vueConfig() {
    return { rootComponent: Mr, plugins: [or] };
  }
}
lr(import.meta.url, Ur);
//# sourceMappingURL=agent_trait_picker.js.map
