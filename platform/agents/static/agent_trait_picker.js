import { u as Z, g as rr, W as ar, P as or } from "./primevue-plugin-BTxKP425.js";
import { defineComponent as er, ref as f, computed as A, watch as D, onMounted as tr, openBlock as t, createElementBlock as i, createElementVNode as p, toDisplayString as d, withDirectives as ir, vModelText as pr, createVNode as m, withCtx as cr, Fragment as b, renderList as y, normalizeClass as k, unref as l, createCommentVNode as u, createTextVNode as nr, nextTick as N } from "vue";
import { Icon as z } from "@iconify/vue";
import { api as sr, define as lr } from "@wippy-fe/proxy";
import { _ as vr } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { r as dr, u as ur, _ as fr, t as U, b as j } from "./trait-presentation-B3J8cp5c.js";
const gr = {
  class: "kx-agent-trait-picker",
  "data-testid": "agent-trait-picker"
}, mr = { class: "kx-group-head" }, xr = { class: "kx-group-meta" }, hr = ["aria-expanded", "aria-activedescendant"], br = ["id", "onMouseenter", "onClick"], yr = { class: "kx-trait-option-text" }, kr = { class: "kx-trait-name" }, wr = {
  key: 0,
  class: "kx-trait-description"
}, _r = { class: "kx-trait-badges" }, Cr = {
  key: 0,
  class: "kx-trait-empty"
}, Tr = {
  key: 0,
  class: "kx-trait-list"
}, Ar = ["data-trait-id"], zr = { class: "kx-trait-row" }, Or = { class: "kx-trait-text" }, $r = { class: "kx-trait-name" }, Er = {
  key: 0,
  class: "kx-trait-id"
}, Sr = { class: "kx-trait-badges" }, Dr = { class: "kx-trait-actions" }, Ir = ["aria-expanded", "aria-label", "onClick"], Mr = ["aria-label", "onClick"], Vr = {
  key: 0,
  class: "kx-trait-config kx-trait-details"
}, Pr = {
  key: 0,
  class: "kx-trait-description"
}, Lr = {
  key: 1,
  class: "kx-trait-description"
}, Nr = {
  key: 2,
  class: "kx-trait-tools",
  "aria-label": "Declared tools"
}, Ur = ["data-declared-tool-id"], jr = { class: "kx-trait-description" }, Hr = {
  key: 1,
  class: "kx-trait-config"
}, Kr = {
  key: 1,
  class: "kx-trait-empty-state"
}, H = "agent-trait-picker-listbox", Rr = /* @__PURE__ */ er({
  __name: "AgentTraitPicker",
  setup(K) {
    const x = Z(), R = rr(), h = f([]), q = A(() => new Map(h.value.map((r) => [r.id, dr(r, [])]))), c = f(V(x.value.value)), { isTraitOpen: w, toggleTraitOpen: Q } = ur(() => c.value.traits), O = A(() => h.value.filter((r) => c.value.traits.includes(r.id))), _ = (r) => c.value.traits.includes(r), C = f(""), n = f(!1), I = f(null), M = f(null), $ = f([]), v = f(-1);
    let E = 0;
    const g = A(() => {
      const r = C.value.trim().toLowerCase();
      return h.value.filter((o) => !_(o.id)).filter((o) => !r || (o.title || o.id).toLowerCase().includes(r) || (o.description || "").toLowerCase().includes(r));
    }), B = A(() => v.value >= 0 ? `agent-trait-picker-option-${v.value}` : void 0);
    D([n, g], ([r, o]) => {
      $.value = [], v.value = r && o.length ? 0 : -1;
    }), D(() => x.value.value, (r) => {
      c.value = V(r);
    }), D(() => x.value.refreshKey, (r, o) => {
      r !== o && L();
    });
    function V(r) {
      if (typeof r != "string" || r === "") return { traits: [], trait_contexts: {} };
      try {
        const o = JSON.parse(r);
        if (!o || typeof o != "object" || Array.isArray(o)) return { traits: [], trait_contexts: {} };
        const a = Array.isArray(o.traits) ? o.traits.filter((s) => typeof s == "string") : [], e = o.trait_contexts && typeof o.trait_contexts == "object" && !Array.isArray(o.trait_contexts) ? o.trait_contexts : {};
        return { traits: a, trait_contexts: { ...e } };
      } catch {
        return { traits: [], trait_contexts: {} };
      }
    }
    function T(r) {
      c.value = r, R("change", {
        traits: [...r.traits],
        trait_contexts: { ...r.trait_contexts }
      });
    }
    function F(r, o) {
      r instanceof HTMLElement && ($.value[o] = r);
    }
    function S(r, o = !1) {
      v.value = r, !(!o || r < 0) && N(() => $.value[r]?.scrollIntoView?.({ block: "nearest" }));
    }
    function P(r) {
      _(r) || T({ ...c.value, traits: [...c.value.traits, r] }), C.value = "", x.value.keepMenuOpenOnAdd || (v.value = -1), N(() => {
        M.value?.focus({ preventScroll: !0 }), x.value.keepMenuOpenOnAdd || (n.value = !1);
      });
    }
    function W(r) {
      const o = c.value.traits.filter((e) => e !== r);
      _(r) || o.push(r);
      const a = { ...c.value.trait_contexts };
      if (!_(r)) {
        T({ ...c.value, traits: o, trait_contexts: a });
        return;
      }
      delete a[r], T({ traits: o, trait_contexts: a });
    }
    function J(r, o) {
      T({
        ...c.value,
        trait_contexts: { ...c.value.trait_contexts, [r]: o }
      });
    }
    function G() {
      n.value = !0, S(g.value.length ? 0 : -1, !0);
    }
    function X(r) {
      const o = g.value.length;
      if (r.key === "Escape" || r.key === "Tab") {
        r.key === "Escape" && n.value && r.stopPropagation(), n.value = !1;
        return;
      }
      if (r.key === "ArrowDown" || r.key === "ArrowUp") {
        if (r.preventDefault(), n.value = !0, !o) return;
        const a = r.key === "ArrowDown" ? 1 : -1, e = v.value < 0 ? a > 0 ? -1 : 0 : v.value;
        S((e + a + o) % o, !0);
        return;
      }
      if (r.key === "Home" || r.key === "End") {
        if (!n.value || !o) return;
        r.preventDefault(), S(r.key === "Home" ? 0 : o - 1, !0);
        return;
      }
      if (r.key === "Enter" && n.value && v.value >= 0) {
        r.preventDefault();
        const a = g.value[v.value];
        a && P(a.id);
      }
    }
    function Y(r) {
      return typeof r.title == "string" && r.title.trim() ? r.title : "Unknown capability";
    }
    async function L() {
      const r = ++E;
      try {
        const { data: o } = await sr.get("/api/v1/agents/traits");
        r === E && (h.value = o?.success === !0 && Array.isArray(o.traits) ? o.traits : []);
      } catch {
        r === E && (h.value = []);
      }
    }
    return tr(() => {
      L();
    }), (r, o) => (t(), i("div", gr, [
      p("div", mr, [
        o[3] || (o[3] = p("span", { class: "kx-group-title" }, "Capabilities", -1)),
        p("span", xr, d(O.value.length) + " active", 1)
      ]),
      p("div", {
        ref_key: "traitAddRoot",
        ref: I,
        class: "kx-tadd"
      }, [
        ir(p("input", {
          ref_key: "traitSearchInput",
          ref: M,
          "onUpdate:modelValue": o[0] || (o[0] = (a) => C.value = a),
          class: "kx-trait-search kx-focus-halo",
          type: "text",
          role: "combobox",
          "aria-label": "Search capabilities to add",
          "aria-autocomplete": "list",
          "aria-expanded": n.value,
          "aria-controls": H,
          "aria-activedescendant": n.value ? B.value : void 0,
          placeholder: "Search capabilities to add…",
          onFocus: o[1] || (o[1] = (a) => n.value = !0),
          onInput: G,
          onKeydown: X
        }, null, 40, hr), [
          [pr, C.value]
        ]),
        m(fr, {
          open: n.value,
          "onUpdate:open": o[2] || (o[2] = (a) => n.value = a),
          anchor: I.value
        }, {
          default: cr(() => [
            p("div", {
              id: H,
              class: "kx-trait-menu",
              role: "listbox",
              "aria-label": "Available capabilities"
            }, [
              (t(!0), i(b, null, y(g.value, (a, e) => (t(), i("button", {
                key: a.id,
                id: `agent-trait-picker-option-${e}`,
                ref_for: !0,
                ref: (s) => F(s, e),
                type: "button",
                class: k(["kx-trait-option", e === v.value && "kx-trait-option-active"]),
                tabindex: "-1",
                role: "option",
                "aria-selected": !1,
                onMouseenter: (s) => v.value = e,
                onClick: (s) => P(a.id)
              }, [
                p("span", {
                  class: k(["kx-trait-icon", `kx-tint-${l(U)(a)}`])
                }, [
                  m(l(z), {
                    icon: a.icon || "tabler:puzzle",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ], 2),
                p("span", yr, [
                  p("span", kr, d(a.title || a.id), 1),
                  a.description ? (t(), i("span", wr, d(a.description), 1)) : u("", !0)
                ]),
                p("span", _r, [
                  (t(!0), i(b, null, y(l(j)(a), (s) => (t(), i("span", {
                    key: s.key,
                    class: k(["kx-trait-badge", `kx-badge-${s.key}`])
                  }, d(s.label), 3))), 128))
                ])
              ], 42, br))), 128)),
              g.value.length ? u("", !0) : (t(), i("div", Cr, "No matching capabilities."))
            ])
          ]),
          _: 1
        }, 8, ["open", "anchor"])
      ], 512),
      O.value.length ? (t(), i("ul", Tr, [
        (t(!0), i(b, null, y(O.value, (a) => (t(), i("li", {
          key: a.id,
          "data-trait-id": a.id,
          class: "kx-trait-row-wrap"
        }, [
          p("div", zr, [
            p("span", {
              class: k(["kx-trait-icon", `kx-tint-${l(U)(a)}`])
            }, [
              m(l(z), {
                icon: a.icon || "tabler:puzzle",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 2),
            p("span", Or, [
              p("span", $r, [
                nr(d(Y(a)), 1),
                a.title?.trim() ? u("", !0) : (t(), i("span", Er, d(a.id), 1))
              ])
            ]),
            p("span", Sr, [
              (t(!0), i(b, null, y(l(j)(a), (e) => (t(), i("span", {
                key: e.key,
                class: k(["kx-trait-badge", `kx-badge-${e.key}`])
              }, d(e.label), 3))), 128))
            ]),
            p("span", Dr, [
              a.description || a.prompt || a.tools?.length ? (t(), i("button", {
                key: 0,
                type: "button",
                class: "kx-trait-fold kx-focus-outline",
                "aria-expanded": l(w)(a.id),
                "aria-label": l(w)(a.id) ? "Hide details" : "Show details",
                onClick: (e) => l(Q)(a.id)
              }, [
                m(l(z), {
                  icon: l(w)(a.id) ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, Ir)) : u("", !0),
              p("button", {
                type: "button",
                class: "kx-trait-remove kx-focus-outline",
                "aria-label": `Remove ${a.title || a.id} capability`,
                onClick: (e) => W(a.id)
              }, [
                m(l(z), {
                  icon: "tabler:x",
                  "aria-hidden": "true"
                })
              ], 8, Mr)
            ])
          ]),
          l(w)(a.id) ? (t(), i("div", Vr, [
            a.description ? (t(), i("p", Pr, d(a.description), 1)) : u("", !0),
            a.prompt ? (t(), i("p", Lr, d(a.prompt), 1)) : u("", !0),
            a.tools?.length ? (t(), i("ul", Nr, [
              (t(!0), i(b, null, y(q.value.get(a.id), ({ id: e, tool: s }) => (t(), i("li", {
                key: e,
                "data-declared-tool-id": e
              }, [
                p("strong", null, d(s?.title || e), 1),
                p("p", jr, d(s?.llm_description || (s ? "No description declared." : "This tool is not in the available catalog.")), 1)
              ], 8, Ur))), 128))
            ])) : u("", !0)
          ])) : u("", !0),
          a.web_component ? (t(), i("div", Hr, [
            m(vr, {
              tag: a.web_component,
              config: c.value.trait_contexts[a.id] || {},
              schema: a.context_schema,
              provider: a.provider,
              onChange: (e) => J(a.id, e)
            }, null, 8, ["tag", "config", "schema", "provider", "onChange"])
          ])) : u("", !0)
        ], 8, Ar))), 128))
      ])) : (t(), i("p", Kr, "No capabilities yet."))
    ]));
  }
}), qr = ":root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.kx-focus-halo:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-focus-outline:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:none}:host,:root{--kx-tone-blue: #2563eb;--kx-tone-violet: #7c3aed;--kx-tone-amber: #b45309}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}}:host(.w-theme-dark),:root.w-theme-dark{--kx-tone-blue: #60a5fa;--kx-tone-violet: #a78bfa;--kx-tone-amber: #fbbf24}.kx-tone-blue{color:var(--kx-tone-blue);background-color:color-mix(in srgb,var(--kx-tone-blue) 13%,transparent)}.kx-tone-violet{color:var(--kx-tone-violet);background-color:color-mix(in srgb,var(--kx-tone-violet) 13%,transparent)}.kx-tone-amber{color:var(--kx-tone-amber);background-color:color-mix(in srgb,var(--kx-tone-amber) 13%,transparent)}.kx-tone-neutral{color:var(--p-text-muted-color);background-color:color-mix(in srgb,var(--p-text-color) 10%,transparent)}.kx-wcmount{display:block;width:100%;min-width:0;max-width:100%;overflow-x:clip;--p-border-radius: var(--wf-radius-sm, 8px);--p-content-border-radius: var(--wf-radius-sm, 8px)}.kx-wcmount .kx-wcmount-surface{display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;color:inherit}.kx-wcmount-fail{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--p-danger-600, var(--p-danger-500));padding:9px 10px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);border-radius:10px;background:color-mix(in srgb,var(--p-danger-500) 7%,transparent)}.kx-wcmount-fail>span{min-width:0;flex:1}.kx-wcmount-fail button{border:1px solid currentColor;border-radius:8px;padding:5px 9px;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}.anchored-panel{position:fixed;min-width:0;overflow:auto}.kx-agent-trait-picker{display:flex;flex-direction:column;gap:10px;color:var(--p-text-color);font:inherit}.kx-group-head{display:flex;align-items:center;gap:12px}.kx-group-title{color:var(--p-text-color);font-size:13.5px;font-weight:700}.kx-group-meta{color:var(--p-text-muted-color);font-size:11.5px;font-weight:600;margin-left:auto}.kx-tadd{position:relative}.kx-trait-search{box-sizing:border-box;width:100%;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.kx-trait-search::placeholder{color:var(--p-text-muted-color)}.kx-trait-menu{box-sizing:border-box;width:100%;max-height:300px;overflow-y:auto;padding:4px;border:1px solid var(--p-content-border-color);border-radius:10px;background:var(--p-content-background);box-shadow:var(--p-popover-shadow)}.kx-trait-option{display:flex;align-items:center;gap:10px;width:100%;padding:7px 8px;border:0;border-radius:6px;background:transparent;color:var(--p-text-color);cursor:pointer;font:inherit;text-align:left}.kx-trait-option:hover,.kx-trait-option-active{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.kx-trait-option-text,.kx-trait-text{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}.kx-trait-name{color:var(--p-text-color);font-size:13px;font-weight:600}.kx-trait-description{display:-webkit-box;overflow:hidden;color:var(--p-text-muted-color);font-size:11.5px;line-height:1.4;-webkit-box-orient:vertical;-webkit-line-clamp:1}.kx-trait-id{color:var(--p-text-muted-color);font-weight:400}.kx-trait-badges{display:inline-flex;flex:none;gap:4px}.kx-trait-badge{flex:none;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:600}.kx-tint-tools{--kx-cap: var(--kx-tone-blue)}.kx-tint-behavior{--kx-cap: var(--kx-tone-violet)}.kx-tint-memory{--kx-cap: var(--kx-tone-amber)}.kx-tint-plain{--kx-cap: var(--p-text-muted-color)}.kx-badge-tools{color:var(--kx-tone-blue);background:color-mix(in srgb,var(--kx-tone-blue) 13%,transparent)}.kx-badge-behavior{color:var(--kx-tone-violet);background:color-mix(in srgb,var(--kx-tone-violet) 13%,transparent)}.kx-badge-memory{color:var(--kx-tone-amber);background:color-mix(in srgb,var(--kx-tone-amber) 15%,transparent)}.kx-trait-icon{display:inline-flex;flex:none;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px}.kx-trait-icon svg{width:17px;height:17px}.kx-trait-icon{color:var(--kx-cap);background:color-mix(in srgb,var(--kx-cap) 14%,transparent)}.kx-trait-list{display:flex;flex-direction:column;margin:0;padding:0;border:1px solid var(--p-content-border-color);border-radius:14px;background:var(--p-content-background);list-style:none}.kx-trait-row-wrap+.kx-trait-row-wrap{border-top:1px solid color-mix(in srgb,var(--p-content-border-color) 60%,transparent)}.kx-trait-row{display:flex;align-items:center;gap:11px;padding:10px 12px}.kx-trait-actions{display:inline-flex;flex:none;align-items:center;gap:5px}.kx-trait-fold,.kx-trait-remove{display:inline-flex;flex:none;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.kx-trait-fold:hover{background:color-mix(in srgb,var(--p-text-color) 7%,transparent);color:var(--p-text-color)}.kx-trait-fold svg{width:16px;height:16px}.kx-trait-remove:hover{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-500)}.kx-trait-remove svg{width:15px;height:15px}.kx-trait-config{padding:2px 12px 12px 45px}.kx-trait-empty,.kx-trait-empty-state{margin:0;padding:10px 12px;color:var(--p-text-muted-color);font-size:12px}.kx-trait-empty-state{padding:0;font-size:12px;line-height:1.5}.kx-trait-details .kx-trait-description{display:block;overflow:visible;white-space:pre-wrap;overflow-wrap:anywhere;-webkit-line-clamp:unset}.kx-trait-tools{list-style:none;margin:.5rem 0;padding:0;display:grid;gap:.5rem}", Qr = {
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
class Br extends ar {
  static get wippyConfig() {
    return {
      propsSchema: Qr,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: qr
    };
  }
  static get vueConfig() {
    return { rootComponent: Rr, plugins: [or] };
  }
}
lr(import.meta.url, Br);
//# sourceMappingURL=agent_trait_picker.js.map
