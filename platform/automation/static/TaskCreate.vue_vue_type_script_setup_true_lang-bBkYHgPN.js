import { b as X, e as V, W as q, u as Y, a as Z } from "./errMsg-CFwf-kA2.js";
import { watch as $, defineComponent as J, ref as c, computed as v, openBlock as d, createElementBlock as g, createElementVNode as w, createTextVNode as W, Fragment as L, createVNode as j, toDisplayString as N, createCommentVNode as _, createBlock as K, unref as D, onMounted as ee, withModifiers as te, withDirectives as O, vModelText as oe, vModelCheckbox as ae } from "vue";
import { api as A } from "@wippy-fe/proxy";
import { v as ie, u as re, c as H } from "./install-form-Ce0pU51G.js";
import { p as ne, s as le, a as se, _ as pe, b as G, c as ce, d as de, t as ue, f as fe } from "./source-instance-BWCuScFJ.js";
const xe = '.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;font-size:13px;color:var(--p-text-color)}*,*:before,*:after{box-sizing:border-box}.kx-tc{display:flex;flex-direction:column;gap:16px;min-width:0}.kx-tc-field,.kx-tc-sub{min-width:0}.kx-tc-off{opacity:.6;pointer-events:none}.kx-tc-field{display:flex;flex-direction:column;gap:7px}.kx-tc-sub{display:flex;flex-direction:column;gap:5px;margin-top:8px}.kx-tc-lbl{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:650;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-tc-lbl svg{width:13px;height:13px;opacity:.85}.kx-tc-desc{margin:0;font-size:12px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-hint{font-size:11px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-input{width:100%;height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s,box-shadow .15s}.kx-tc-input:disabled{opacity:.6}.kx-tc-textarea{height:auto;min-height:56px;padding:8px 10px;line-height:1.45;resize:vertical;font-family:ui-monospace,monospace;font-size:12px}.kx-tc-code{font-family:ui-monospace,monospace;font-size:12px}.kx-tc-row{display:grid;grid-template-columns:max-content minmax(72px,96px) minmax(120px,1fr);align-items:center;gap:8px}.kx-tc-num,.kx-tc-unit{width:100%;min-width:0}.kx-tc-check{display:inline-flex;align-items:center;gap:8px;width:fit-content;font-size:12px;color:var(--p-text-color);cursor:pointer}.kx-tc-check input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-tc-check input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-tc-check input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-tc-check input:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset)}.kx-tc-check input:checked:before{transform:rotate(45deg) scale(1)}.kx-tc-check input:disabled{opacity:.55;cursor:not-allowed}.kx-tc-check:has(input:disabled){cursor:not-allowed}.kx-tc-specific{display:grid;grid-template-columns:minmax(160px,1fr) minmax(112px,140px) minmax(112px,140px);gap:8px;align-items:start}.kx-tc-specific .kx-tc-sub{grid-column:1 / -1;margin-top:0}.kx-tc-select{width:100%;min-width:0}.kx-tc-locked{pointer-events:none;opacity:.6}.kx-tc-static{display:flex;align-items:center;min-height:36px;font-size:13px;color:var(--p-text-color)}.kx-tc-field[data-test=tc-instance]{gap:9px;padding:12px;border-radius:10px;border:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 2.5%,transparent)}.kx-tc-note{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-tc-note svg{width:15px;height:15px;flex:none}.kx-tc-note>span,.kx-tc-warn>span,.kx-tc-gate>span{min-width:0;flex:1}.kx-tc-warn{display:flex;align-items:center;flex-wrap:wrap;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-tc-warn svg{width:15px;height:15px;flex:none}.kx-tc-retry{margin-left:auto;padding:8px 10px;font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;color:inherit;background:transparent;border:1px solid currentColor;border-radius:8px}.kx-tc-gate{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;color:var(--p-text-muted-color);padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--p-text-color) 4%,transparent)}.kx-tc-gate svg{width:15px;height:15px;flex:none}.kx-tc-opts{display:flex;flex-direction:column;gap:6px;margin-top:6px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-tc-detail{margin-top:2px}.kx-tc-adv summary{display:flex;align-items:center;gap:6px;cursor:pointer;list-style:none;font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.kx-tc-adv summary::-webkit-details-marker{display:none}.kx-tc-adv summary:hover{color:var(--p-text-color)}.kx-tc-caret{width:14px;height:14px;transition:transform .15s}.kx-tc-adv[open] .kx-tc-caret{transform:rotate(90deg)}.kx-tc-adv-body{margin-top:8px}@media(max-width:520px){.kx-tc-row,.kx-tc-specific{grid-template-columns:1fr}}.task-form,.task-target{display:flex;flex-direction:column;gap:16px;min-width:0}.task-form{padding:2px}.task-field{display:flex;flex-direction:column;gap:7px;min-width:0;font-weight:600}.task-field input,.task-field select,.task-field textarea,.task-form .kx-tc-select{box-sizing:border-box;width:100%;min-width:0;padding:9px 10px;font:inherit;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px}.task-field textarea{resize:vertical;font-weight:400}.task-check{display:flex;align-items:center;gap:8px}.task-check input{accent-color:var(--p-primary-color)}.task-hint{margin:0 0 7px;color:var(--p-text-muted-color);font-size:12px}.task-error,.task-target [role=alert]{color:var(--p-danger-500)}.task-actions{display:flex;justify-content:flex-end;gap:8px}.task-actions button{padding:8px 14px;border:1px solid var(--p-content-border-color);border-radius:8px;font:inherit;color:var(--p-text-color);background:var(--p-content-background);cursor:pointer}.task-actions button[type=submit]{color:var(--p-primary-contrast-color);background:var(--p-primary-color)}.task-form :disabled{opacity:.6;cursor:default}.task-form :is(input,select,textarea,button):focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:var(--p-focus-ring-shadow)}.task-target .wf-embed-list{display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto}.task-target .wf-embed-row{display:flex;gap:10px;width:100%;text-align:left;padding:10px;border-radius:8px}.task-target .wf-embed-main{display:flex;flex:1;flex-direction:column;gap:4px;min-width:0}.task-target .wf-embed-meta{display:flex;flex-wrap:wrap;gap:10px;color:var(--p-text-muted-color);font-size:12px}.task-target .wf-embed-io{display:flex;gap:6px}.task-target .wf-search{margin-bottom:8px}.task-target .wf-search input{width:100%}';
class qe extends X {
  static get wippyConfig() {
    return {
      propsSchema: {
        type: "object",
        properties: {
          "type-id": { type: "string" },
          "parent-id": { type: "string" },
          "submit-nonce": { type: "string" },
          input: { type: "string" },
          config: { type: "string" }
        }
      },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: xe
    };
  }
}
function ge(x, T, l) {
  $(
    () => x.value?.submitNonce,
    (i, E) => {
      i == null || i === "" || i === E || l?.value || T();
    }
  );
}
const me = { class: "task-target" }, we = { class: "task-field" }, he = ["value", "disabled"], ke = {
  key: 0,
  role: "alert"
}, ve = {
  key: 0,
  class: "task-hint"
}, be = {
  key: 2,
  "data-test": "task-target-input",
  class: "task-field"
}, ye = /* @__PURE__ */ J({
  __name: "TaskTargetEditor",
  props: {
    modelValue: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue", "validation"],
  setup(x, { emit: T }) {
    const l = x, i = T, E = c([]), s = c(""), b = c(!1), z = c(null), u = c(""), y = c(!1), C = v(() => l.modelValue.kind), n = v(() => E.value.find((e) => e.id === l.modelValue.port) || null), S = v(() => E.value.map((e) => ({
      id: e.id,
      title: e.title || e.name || e.id,
      icon: e.icon,
      group: e.group,
      subtitle: e.description
    }))), r = v(() => ne(n.value, "TaskTarget")), f = v(() => le(n.value, "TaskTarget")), I = v(() => se(n.value, r.value)), M = v(() => C.value === "workflow" ? z.value : n.value?.input_schema);
    function U(e) {
      i("update:modelValue", { ...l.modelValue, ...e });
    }
    function P(e) {
      i("update:modelValue", { kind: e.target.value });
    }
    const a = { properties: { flow_ref: { picker: "wc-workflow-picker", title: "Published workflow", required: !0 } } }, t = v(() => l.modelValue.flow_ref ? { flow_ref: l.modelValue.flow_ref } : {});
    function m(e) {
      const o = R(e).flow_ref;
      i("update:modelValue", { kind: "workflow", flow_ref: o, input: {} });
    }
    function R(e) {
      return e && typeof e == "object" && !Array.isArray(e) ? e : {};
    }
    function B(e, o) {
      const p = ce(e);
      return p ? ie({ inputs: p }, o) : "";
    }
    const Q = v(() => {
      const e = l.modelValue;
      if (C.value === "workflow")
        return y.value ? "Loading the published workflow…" : u.value ? u.value : !e.flow_ref?.id || !Number.isInteger(e.flow_ref.version) || e.flow_ref.version < 1 ? "Choose a published workflow." : B(z.value, e.input || {});
      if (b.value) return "Loading destinations…";
      if (s.value) return s.value;
      if (!n.value) return "Choose a writable action.";
      const o = n.value.config_schema || {};
      return B({ properties: o, required: Object.keys(o).filter((h) => o[h].required) }, e.config || {}) || B(n.value.input_schema, e.input || {});
    });
    return $(Q, (e) => i("validation", e), { immediate: !0 }), $(C, async (e, o, p) => {
      if (e !== "action") return;
      let h = !0;
      p(() => {
        h = !1;
      }), b.value = !0, s.value = "";
      try {
        const { data: k } = await A.get("/api/v1/automations/sinks");
        if (!Array.isArray(k.sinks)) throw new Error("The destination catalog is unavailable.");
        h && (E.value = k.sinks);
      } catch (k) {
        h && (s.value = V(k, "Could not load destinations."));
      } finally {
        h && (b.value = !1);
      }
    }, { immediate: !0 }), $(() => l.modelValue.flow_ref, async (e, o, p) => {
      if (y.value = !1, u.value = "", !e) return;
      let h = !0;
      p(() => {
        h = !1;
      }), y.value = !0, u.value = "";
      try {
        const { data: k } = await A.get(`/api/v1/workflows/${encodeURIComponent(e.id)}/versions/${e.version}`);
        if (!k.success || !k.version) throw new Error(V(k.error, "Could not read the published workflow."));
        const F = k.version;
        if (F.version !== e.version) throw new Error("The published workflow version is unavailable.");
        h && (z.value = F.interface?.input_schema ?? F.input_schema);
      } catch (k) {
        h && (u.value = V(k, "Could not read the published workflow."));
      } finally {
        h && (y.value = !1);
      }
    }, { immediate: !0 }), (e, o) => (d(), g("div", me, [
      w("label", we, [
        o[5] || (o[5] = W("Target ", -1)),
        w("select", {
          value: C.value,
          "aria-label": "Target kind",
          disabled: x.disabled,
          onChange: P
        }, [...o[4] || (o[4] = [
          w("option", { value: "workflow" }, "Published workflow", -1),
          w("option", { value: "action" }, "Writable action", -1)
        ])], 40, he)
      ]),
      C.value === "workflow" ? (d(), g(L, { key: 0 }, [
        j(q, {
          tag: "wc-workflow-picker",
          config: t.value,
          schema: a,
          onChange: m
        }, null, 8, ["config"]),
        u.value ? (d(), g("p", ke, N(u.value), 1)) : _("", !0)
      ], 64)) : (d(), g(L, { key: 1 }, [
        j(pe, {
          items: S.value,
          "model-value": x.modelValue.port || "",
          loading: b.value,
          error: s.value,
          disabled: x.disabled,
          "aria-label": "Writable action",
          placeholder: "Pick a writable action…",
          "onUpdate:modelValue": o[0] || (o[0] = (p) => i("update:modelValue", { kind: "action", port: p, config: {}, input: {} }))
        }, null, 8, ["items", "model-value", "loading", "error", "disabled"]),
        n.value ? (d(), g(L, { key: 0 }, [
          n.value.description ? (d(), g("p", ve, N(n.value.description), 1)) : _("", !0),
          (d(), K(q, {
            key: n.value.id,
            tag: r.value?.tag || "wc-schema-form",
            schema: r.value?.schema || f.value,
            config: x.modelValue.config || {},
            meta: I.value,
            provider: n.value.provider,
            onChange: o[1] || (o[1] = (p) => U({ config: R(p) }))
          }, null, 8, ["tag", "schema", "config", "meta", "provider"])),
          r.value && D(G)(f.value) ? (d(), K(q, {
            key: 1,
            tag: "wc-schema-form",
            schema: f.value,
            config: x.modelValue.config || {},
            onChange: o[2] || (o[2] = (p) => U({ config: R(p) }))
          }, null, 8, ["schema", "config"])) : _("", !0)
        ], 64)) : _("", !0)
      ], 64)),
      D(G)(M.value) ? (d(), g("div", be, [
        o[6] || (o[6] = w("span", null, "Input", -1)),
        j(q, {
          tag: "wc-schema-form",
          schema: M.value,
          config: x.modelValue.input || {},
          onChange: o[3] || (o[3] = (p) => U({ input: R(p) }))
        }, null, 8, ["schema", "config"])
      ])) : _("", !0)
    ]));
  }
}), ze = {
  key: 0,
  class: "task-hint"
}, Ce = {
  key: 1,
  role: "alert"
}, Ve = { class: "task-field" }, _e = ["disabled"], Ee = { class: "task-check" }, Te = ["disabled"], Se = {
  key: 0,
  "aria-label": "Schedule (UTC)"
}, Ue = {
  key: 1,
  class: "task-error",
  role: "alert"
}, $e = {
  key: 2,
  class: "task-actions"
}, Ie = ["disabled"], Me = ["disabled"], Be = /* @__PURE__ */ J({
  __name: "TaskCreate",
  props: {
    recurring: { type: Boolean }
  },
  setup(x) {
    const T = x, l = Y(), i = Z(), E = re(l), s = v(() => String(H(l.value.config).id || "")), b = c(""), z = c(!0), u = c(null), y = c({ kind: "workflow" }), C = c("Choose a target."), n = c(!0), S = c(!1), r = c(!1), f = c("");
    $(r, (a) => i("submit-state", { saving: a })), ge(l, P, r);
    const I = v(() => T.recurring && !u.value ? "Complete the UTC schedule." : C.value);
    function M(a) {
      b.value = typeof a.title == "string" ? a.title : "", z.value = a.enabled !== !1, u.value = fe(a.schedule || null), y.value = a.target || { kind: "workflow" };
    }
    async function U() {
      n.value = !0, S.value = !1, f.value = "";
      try {
        if (s.value) {
          const { data: a } = await A.get(
            `/api/v1/automations/${encodeURIComponent(s.value)}/config`
          );
          if (!a.success) throw new Error(V(a.error, "Could not load the task."));
          const t = a.config?._portable_input;
          if (!t || typeof t != "object" || Array.isArray(t) || typeof a.config?.enabled != "boolean")
            throw new Error("The task has no stored declaration.");
          M({ ...t, enabled: a.config?.enabled });
        } else M(H(l.value.input));
        S.value = !0;
      } catch (a) {
        f.value = V(a, "Could not load the task.");
      } finally {
        n.value = !1;
      }
    }
    async function P() {
      if (!S.value || r.value) return;
      if (I.value) {
        f.value = I.value, s.value || i("automation-installed", { success: !1, error: f.value });
        return;
      }
      r.value = !0, f.value = "";
      const a = {
        title: b.value,
        enabled: z.value,
        target: y.value,
        ...T.recurring && u.value ? { schedule: ue(u.value) } : {}
      };
      try {
        if (s.value) {
          const { data: t } = await A.put(`/api/v1/automations/${encodeURIComponent(s.value)}`, { input: a });
          if (!t.success) throw new Error(V(t.error, "Could not save the task."));
          i("change", { id: s.value }), i("close", {});
        } else {
          const { data: t } = await A.post("/api/v1/automations", {
            type: l.value.typeId,
            parent_id: E.value || void 0,
            input: a
          });
          if (!t.success) throw new Error(V(t.error, "Could not create the task."));
          i("automation-installed", { success: !0, id: t.id }), i("created", { id: t.id });
        }
      } catch (t) {
        f.value = V(t, "Could not save the task."), s.value || i("automation-installed", { success: !1, error: f.value });
      } finally {
        r.value = !1;
      }
    }
    return ee(U), $(s, U), (a, t) => n.value ? (d(), g("p", ze, "Loading task…")) : S.value ? (d(), g("form", {
      key: 2,
      class: "task-form",
      onSubmit: te(P, ["prevent"])
    }, [
      w("label", Ve, [
        t[6] || (t[6] = W("Title ", -1)),
        O(w("input", {
          "onUpdate:modelValue": t[0] || (t[0] = (m) => b.value = m),
          "aria-label": "Title",
          disabled: r.value
        }, null, 8, _e), [
          [oe, b.value]
        ])
      ]),
      w("label", Ee, [
        O(w("input", {
          "onUpdate:modelValue": t[1] || (t[1] = (m) => z.value = m),
          type: "checkbox",
          disabled: r.value
        }, null, 8, Te), [
          [ae, z.value]
        ]),
        t[7] || (t[7] = W(" Enabled", -1))
      ]),
      x.recurring ? (d(), g("section", Se, [
        t[8] || (t[8] = w("p", { class: "task-hint" }, "All times are UTC.", -1)),
        j(de, {
          modelValue: u.value,
          "onUpdate:modelValue": t[2] || (t[2] = (m) => u.value = m),
          "default-preset": "daily",
          disabled: r.value
        }, null, 8, ["modelValue", "disabled"])
      ])) : _("", !0),
      j(ye, {
        modelValue: y.value,
        "onUpdate:modelValue": t[3] || (t[3] = (m) => y.value = m),
        disabled: r.value,
        onValidation: t[4] || (t[4] = (m) => C.value = m)
      }, null, 8, ["modelValue", "disabled"]),
      f.value ? (d(), g("p", Ue, N(f.value), 1)) : _("", !0),
      s.value ? (d(), g("div", $e, [
        w("button", {
          type: "button",
          disabled: r.value,
          onClick: t[5] || (t[5] = (m) => D(i)("close", {}))
        }, "Cancel", 8, Ie),
        w("button", {
          type: "submit",
          disabled: r.value || !!I.value
        }, N(r.value ? "Saving…" : "Save"), 9, Me)
      ])) : _("", !0)
    ], 32)) : (d(), g("p", Ce, N(f.value), 1));
  }
});
export {
  qe as T,
  Be as _
};
//# sourceMappingURL=TaskCreate.vue_vue_type_script_setup_true_lang-bBkYHgPN.js.map
