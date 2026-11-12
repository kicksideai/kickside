import { W as le, a as se, u as pe } from "./wc-runtime-KO3cNuNo.js";
import { watch as N, defineComponent as X, ref as d, computed as m, onMounted as Y, openBlock as r, createElementBlock as s, createElementVNode as v, createTextVNode as F, createCommentVNode as h, Fragment as q, renderList as de, toDisplayString as S, createVNode as M, createBlock as H, unref as D, withModifiers as ce, withDirectives as G, vModelText as ue, vModelCheckbox as fe } from "vue";
import { api as P } from "@wippy-fe/proxy";
import { v as ge, u as xe, i as J } from "./install-form-6s2z0ljk.js";
import { e as _, _ as R } from "./WcMount.vue_vue_type_script_setup_true_lang-DeFg3QZK.js";
import { p as me, s as we, a as he, _ as ve, b as Q, c as ke, d as be, t as ye, f as ze } from "./source-instance-D0VlTgSx.js";
const Ce = '.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-wcmount{display:block;width:100%;min-width:0;max-width:100%;overflow-x:clip;--p-border-radius: var(--wf-radius-sm, 8px);--p-content-border-radius: var(--wf-radius-sm, 8px)}.kx-wcmount .kx-wcmount-surface{display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;color:inherit}.kx-wcmount-fail{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--p-danger-600, var(--p-danger-500));padding:9px 10px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);border-radius:10px;background:color-mix(in srgb,var(--p-danger-500) 7%,transparent)}.kx-wcmount-fail>span{min-width:0;flex:1}.kx-wcmount-fail button{border:1px solid currentColor;border-radius:8px;padding:5px 9px;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}.anchored-panel{position:fixed;min-width:0;overflow:auto}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;font-size:13px;color:var(--p-text-color)}:host>div:empty,:host>div:has(>[data-lazy-state]){min-height:107px}*,*:before,*:after{box-sizing:border-box}.kx-tc{display:flex;flex-direction:column;gap:16px;min-width:0}.kx-tc:has(>.kx-tc-note[aria-live]){min-height:107px}.kx-tc-field,.kx-tc-sub{min-width:0}.kx-tc-off{opacity:.6;pointer-events:none}.kx-tc-field{display:flex;flex-direction:column;gap:7px}.kx-tc-sub{display:flex;flex-direction:column;gap:5px;margin-top:8px}.kx-tc-lbl{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:650;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-tc-lbl svg{width:13px;height:13px;opacity:.85}.kx-tc-desc{margin:0;font-size:12px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-hint{font-size:11px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-input{width:100%;height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s,box-shadow .15s}.kx-tc-input:disabled{opacity:.6}.kx-tc-textarea{height:auto;min-height:56px;padding:8px 10px;line-height:1.45;resize:vertical;font-family:ui-monospace,monospace;font-size:12px}.kx-tc-code{font-family:ui-monospace,monospace;font-size:12px}.kx-tc-row{display:grid;grid-template-columns:max-content minmax(72px,96px) minmax(120px,1fr);align-items:center;gap:8px}.kx-tc-num,.kx-tc-unit{width:100%;min-width:0}.kx-tc-check{display:inline-flex;align-items:center;gap:8px;width:fit-content;font-size:12px;color:var(--p-text-color);cursor:pointer}.kx-tc-check input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-tc-check input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-tc-check input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-tc-check input:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset)}.kx-tc-check input:checked:before{transform:rotate(45deg) scale(1)}.kx-tc-check input:disabled{opacity:.55;cursor:not-allowed}.kx-tc-check:has(input:disabled){cursor:not-allowed}.kx-tc-specific{display:grid;grid-template-columns:minmax(160px,1fr) minmax(112px,140px) minmax(112px,140px);gap:8px;align-items:start}.kx-tc-specific .kx-tc-sub{grid-column:1 / -1;margin-top:0}.kx-tc-select{width:100%;min-width:0}.kx-tc-locked{pointer-events:none;opacity:.6}.kx-tc-static{display:flex;align-items:center;min-height:36px;font-size:13px;color:var(--p-text-color)}.kx-tc-field[data-test=tc-instance]{gap:9px;padding:12px;border-radius:10px;border:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 2.5%,transparent)}.kx-tc-note{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-tc-note svg{width:15px;height:15px;flex:none}.kx-tc-note>span,.kx-tc-warn>span,.kx-tc-gate>span{min-width:0;flex:1}.kx-tc-warn{display:flex;align-items:center;flex-wrap:wrap;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-tc-warn svg{width:15px;height:15px;flex:none}.kx-tc-retry{margin-left:auto;padding:8px 10px;font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;color:inherit;background:transparent;border:1px solid currentColor;border-radius:8px}.kx-tc-gate{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;color:var(--p-text-muted-color);padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--p-text-color) 4%,transparent)}.kx-tc-gate svg{width:15px;height:15px;flex:none}.kx-tc-opts{display:flex;flex-direction:column;gap:6px;margin-top:6px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-tc-detail{margin-top:2px}.kx-tc-adv summary{display:flex;align-items:center;gap:6px;cursor:pointer;list-style:none;font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.kx-tc-adv summary::-webkit-details-marker{display:none}.kx-tc-adv summary:hover{color:var(--p-text-color)}.kx-tc-caret{width:14px;height:14px;transition:transform .15s}.kx-tc-adv[open] .kx-tc-caret{transform:rotate(90deg)}.kx-tc-adv-body{margin-top:8px}@media(max-width:520px){.kx-tc-row,.kx-tc-specific{grid-template-columns:1fr}}.task-form,.task-target{display:flex;flex-direction:column;gap:16px;min-width:0}.task-form{padding:2px}.task-field{display:flex;flex-direction:column;gap:7px;min-width:0;font-weight:600}.task-field input,.task-field select,.task-field textarea,.task-form .kx-tc-select{box-sizing:border-box;width:100%;min-width:0;padding:9px 10px;font:inherit;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px}.task-field textarea{resize:vertical;font-weight:400}.task-check{display:flex;align-items:center;gap:8px}.task-check input{accent-color:var(--p-primary-color)}.task-hint{margin:0 0 7px;color:var(--p-text-muted-color);font-size:12px}.task-error,.task-target [role=alert]{color:var(--p-danger-500)}.task-actions{display:flex;justify-content:flex-end;gap:8px}.task-actions button{padding:8px 14px;border:1px solid var(--p-content-border-color);border-radius:8px;font:inherit;color:var(--p-text-color);background:var(--p-content-background);cursor:pointer}.task-actions button[type=submit]{color:var(--p-primary-contrast-color);background:var(--p-primary-color)}.task-form :disabled{opacity:.6;cursor:default}.task-form :is(input,select,textarea,button):focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:var(--p-focus-ring-shadow)}.task-target .wf-embed-list{display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto}.task-target .wf-embed-row{display:flex;gap:10px;width:100%;text-align:left;padding:10px;border-radius:8px}.task-target .wf-embed-main{display:flex;flex:1;flex-direction:column;gap:4px;min-width:0}.task-target .wf-embed-meta{display:flex;flex-wrap:wrap;gap:10px;color:var(--p-text-muted-color);font-size:12px}.task-target .wf-embed-io{display:flex;gap:6px}.task-target .wf-search{margin-bottom:8px}.task-target .wf-search input{width:100%}';
class tt extends le {
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
      inlineCss: Ce
    };
  }
}
function Ve(u, $, n) {
  N(
    () => u.value?.submitNonce,
    (l, U) => {
      l == null || l === "" || l === U || n?.value || $();
    }
  );
}
const _e = { class: "task-target" }, Ee = { class: "task-field" }, Te = ["value", "disabled"], Se = {
  key: 0,
  value: "agent"
}, $e = ["value"], Ue = {
  key: 0,
  role: "alert"
}, Ae = { class: "task-field" }, Ie = ["value", "disabled"], Me = {
  key: 0,
  role: "alert"
}, Ne = {
  key: 0,
  class: "task-hint"
}, Pe = {
  key: 4,
  "data-test": "task-target-input",
  class: "task-field"
}, je = /* @__PURE__ */ X({
  __name: "TaskTargetEditor",
  props: {
    modelValue: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue", "validation"],
  setup(u, { emit: $ }) {
    const n = u, l = $, U = [
      { kind: "workflow", title: "Published workflow", tag: "wc-workflow-picker" },
      { kind: "action", title: "Writable action", tag: "wc-schema-form" }
    ], g = d([]), T = d(!0), y = d(""), z = m(() => U.filter((e) => g.value.includes(e.tag))), A = m(() => U.filter((e) => g.value.includes(e.tag) || e.kind === n.modelValue.kind));
    Y(async () => {
      try {
        const { data: e } = await P.get("/api/v1/views/components/list");
        if (!e.success || !Array.isArray(e.components)) throw new Error("The task target provider catalog is unavailable.");
        g.value = e.components.flatMap((o) => o.wippy?.tagName ? [o.wippy.tagName] : []), !n.modelValue.kind && z.value.length && l("update:modelValue", { kind: z.value[0].kind });
      } catch (e) {
        y.value = _(e, "Could not load task target providers.");
      } finally {
        T.value = !1;
      }
    });
    const I = d([]), C = d(""), V = d(!1), c = d(null), p = d(""), E = d(!1), x = m(() => n.modelValue.kind), f = m(() => I.value.find((e) => e.id === n.modelValue.port) || null), B = m(() => I.value.map((e) => ({
      id: e.id,
      title: e.title || e.name || e.id,
      icon: e.icon,
      group: e.group,
      subtitle: e.description
    }))), a = m(() => me(f.value, "TaskTarget")), t = m(() => we(f.value, "TaskTarget")), w = m(() => he(f.value, a.value)), Z = { properties: { agent_id: { picker: "wc-agent-picker", title: "Agent", required: !0 } } }, ee = m(() => n.modelValue.agent_id ? { agent_id: n.modelValue.agent_id } : {}), K = m(() => x.value === "workflow" ? c.value : f.value?.input_schema);
    function j(e) {
      l("update:modelValue", { ...n.modelValue, ...e });
    }
    function te(e) {
      l("update:modelValue", { kind: e.target.value });
    }
    const oe = { properties: { flow_ref: { picker: "wc-workflow-picker", title: "Published workflow", required: !0 } } }, ae = m(() => n.modelValue.flow_ref ? { flow_ref: n.modelValue.flow_ref } : {});
    function ie(e) {
      const o = L(e).flow_ref;
      l("update:modelValue", { kind: "workflow", flow_ref: o, input: {} });
    }
    function L(e) {
      return e && typeof e == "object" && !Array.isArray(e) ? e : {};
    }
    function re(e) {
      j({ agent_id: String(L(e).agent_id || "") });
    }
    function W(e, o) {
      const i = ke(e);
      return i ? ge({ inputs: i }, o) : "";
    }
    const ne = m(() => {
      const e = n.modelValue;
      if (!x.value)
        return T.value ? "Loading task target providers…" : y.value || "No task target providers are available.";
      if (x.value === "agent")
        return e.agent_id?.trim() ? e.prompt?.trim() ? "" : "Enter a prompt." : "Choose an agent.";
      if (x.value === "workflow")
        return E.value ? "Loading the published workflow…" : p.value ? p.value : !e.flow_ref?.id || !Number.isInteger(e.flow_ref.version) || e.flow_ref.version < 1 ? "Choose a published workflow." : W(c.value, e.input || {});
      if (V.value) return "Loading destinations…";
      if (C.value) return C.value;
      if (!f.value) return "Choose a writable action.";
      const o = f.value.config_schema || {};
      return W({ properties: o, required: Object.keys(o).filter((k) => o[k].required) }, e.config || {}) || W(f.value.input_schema, e.input || {});
    });
    return N(ne, (e) => l("validation", e), { immediate: !0 }), N(x, async (e, o, i) => {
      if (e !== "action") return;
      let k = !0;
      i(() => {
        k = !1;
      }), V.value = !0, C.value = "";
      try {
        const { data: b } = await P.get("/api/v1/automations/sinks");
        if (!Array.isArray(b.sinks)) throw new Error("The destination catalog is unavailable.");
        k && (I.value = b.sinks);
      } catch (b) {
        k && (C.value = _(b, "Could not load destinations."));
      } finally {
        k && (V.value = !1);
      }
    }, { immediate: !0 }), N(() => n.modelValue.flow_ref, async (e, o, i) => {
      if (E.value = !1, p.value = "", !e) return;
      let k = !0;
      i(() => {
        k = !1;
      }), E.value = !0, p.value = "";
      try {
        const { data: b } = await P.get(`/api/v1/workflows/${encodeURIComponent(e.id)}/versions/${e.version}`);
        if (!b.success || !b.version) throw new Error(_(b.error, "Could not read the published workflow."));
        const O = b.version;
        if (O.version !== e.version) throw new Error("The published workflow version is unavailable.");
        k && (c.value = O.interface?.input_schema ?? O.input_schema);
      } catch (b) {
        k && (p.value = _(b, "Could not read the published workflow."));
      } finally {
        k && (E.value = !1);
      }
    }, { immediate: !0 }), (e, o) => (r(), s("div", _e, [
      v("label", Ee, [
        o[6] || (o[6] = F("Target ", -1)),
        v("select", {
          value: x.value,
          "aria-label": "Target kind",
          disabled: u.disabled,
          onChange: te
        }, [
          o[5] || (o[5] = v("option", {
            value: "",
            disabled: ""
          }, "Choose a target…", -1)),
          x.value === "agent" ? (r(), s("option", Se, "Agent prompt")) : h("", !0),
          (r(!0), s(q, null, de(A.value, (i) => (r(), s("option", {
            key: i.kind,
            value: i.kind
          }, S(i.title), 9, $e))), 128))
        ], 40, Te)
      ]),
      y.value ? (r(), s("p", Ue, S(y.value), 1)) : h("", !0),
      x.value === "agent" ? (r(), s(q, { key: 1 }, [
        M(R, {
          tag: "wc-agent-picker",
          config: ee.value,
          schema: Z,
          onChange: re
        }, null, 8, ["config"]),
        v("label", Ae, [
          o[7] || (o[7] = F("Prompt ", -1)),
          v("textarea", {
            value: u.modelValue.prompt || "",
            "aria-label": "Prompt",
            rows: "4",
            disabled: u.disabled,
            onInput: o[0] || (o[0] = (i) => j({ prompt: i.target.value }))
          }, null, 40, Ie)
        ])
      ], 64)) : x.value === "workflow" ? (r(), s(q, { key: 2 }, [
        M(R, {
          tag: "wc-workflow-picker",
          config: ae.value,
          schema: oe,
          onChange: ie
        }, null, 8, ["config"]),
        p.value ? (r(), s("p", Me, S(p.value), 1)) : h("", !0)
      ], 64)) : x.value === "action" ? (r(), s(q, { key: 3 }, [
        M(ve, {
          items: B.value,
          "model-value": u.modelValue.port || "",
          loading: V.value,
          error: C.value,
          disabled: u.disabled,
          "aria-label": "Writable action",
          placeholder: "Pick a writable action…",
          "onUpdate:modelValue": o[1] || (o[1] = (i) => l("update:modelValue", { kind: "action", port: i, config: {}, input: {} }))
        }, null, 8, ["items", "model-value", "loading", "error", "disabled"]),
        f.value ? (r(), s(q, { key: 0 }, [
          f.value.description ? (r(), s("p", Ne, S(f.value.description), 1)) : h("", !0),
          (r(), H(R, {
            key: f.value.id,
            tag: a.value?.tag || "wc-schema-form",
            schema: a.value?.schema || t.value,
            config: u.modelValue.config || {},
            meta: w.value,
            provider: f.value.provider,
            onChange: o[2] || (o[2] = (i) => j({ config: L(i) }))
          }, null, 8, ["tag", "schema", "config", "meta", "provider"])),
          a.value && D(Q)(t.value) ? (r(), H(R, {
            key: 1,
            tag: "wc-schema-form",
            schema: t.value,
            config: u.modelValue.config || {},
            onChange: o[3] || (o[3] = (i) => j({ config: L(i) }))
          }, null, 8, ["schema", "config"])) : h("", !0)
        ], 64)) : h("", !0)
      ], 64)) : h("", !0),
      x.value !== "agent" && D(Q)(K.value) ? (r(), s("div", Pe, [
        o[8] || (o[8] = v("span", null, "Input", -1)),
        M(R, {
          tag: "wc-schema-form",
          schema: K.value,
          config: u.modelValue.input || {},
          onChange: o[4] || (o[4] = (i) => j({ input: L(i) }))
        }, null, 8, ["schema", "config"])
      ])) : h("", !0)
    ]));
  }
}), Le = {
  key: 0,
  class: "task-hint"
}, qe = {
  key: 1,
  role: "alert"
}, Re = { class: "task-field" }, Be = ["disabled"], Fe = {
  key: 0,
  class: "task-check"
}, We = ["disabled"], Oe = {
  key: 1,
  "aria-label": "Schedule (UTC)"
}, De = {
  key: 2,
  class: "task-error",
  role: "alert"
}, Ke = {
  key: 3,
  class: "task-actions"
}, He = ["disabled"], Ge = ["disabled"], ot = /* @__PURE__ */ X({
  __name: "TaskCreate",
  props: {
    recurring: { type: Boolean }
  },
  setup(u) {
    const $ = u, n = se(), l = pe(), U = xe(n), g = m(() => String(J(n.value.config).id || "")), T = d(""), y = d(!0), z = d(null), A = d({ kind: "" }), I = d("Choose a target."), C = d(!0), V = d(!1), c = d(!1), p = d("");
    N(c, (a) => l("submit-state", { saving: a })), Ve(n, B, c);
    const E = m(() => $.recurring && !z.value ? "Complete the UTC schedule." : I.value);
    function x(a) {
      T.value = typeof a.title == "string" ? a.title : "", y.value = a.enabled !== !1, z.value = ze(a.schedule || null), A.value = a.target || { kind: "" };
    }
    async function f() {
      C.value = !0, V.value = !1, p.value = "";
      try {
        if (g.value) {
          const { data: a } = await P.get(
            `/api/v1/automations/${encodeURIComponent(g.value)}/config`
          );
          if (!a.success) throw new Error(_(a.error, "Could not load the task."));
          const t = a.config?._portable_input;
          if (!t || typeof t != "object" || Array.isArray(t) || typeof a.config?.enabled != "boolean")
            throw new Error("The task has no stored declaration.");
          x({ ...t, enabled: a.config?.enabled });
        } else x(J(n.value.input));
        V.value = !0;
      } catch (a) {
        p.value = _(a, "Could not load the task.");
      } finally {
        C.value = !1;
      }
    }
    async function B() {
      if (!V.value || c.value) return;
      if (E.value) {
        p.value = E.value, g.value || l("automation-installed", { success: !1, error: p.value });
        return;
      }
      c.value = !0, p.value = "";
      const a = {
        title: T.value,
        enabled: y.value,
        target: A.value,
        ...$.recurring && z.value ? { schedule: ye(z.value) } : {}
      };
      try {
        if (g.value) {
          const { data: t } = await P.put(`/api/v1/automations/${encodeURIComponent(g.value)}`, { input: a });
          if (!t.success) throw new Error(_(t.error, "Could not save the task."));
          l("change", { id: g.value }), l("close", {});
        } else {
          const { data: t } = await P.post("/api/v1/automations", {
            type: n.value.typeId,
            parent_id: U.value || void 0,
            input: a
          });
          if (!t.success) throw new Error(_(t.error, "Could not create the task."));
          l("automation-installed", { success: !0, id: t.id }), l("created", { id: t.id });
        }
      } catch (t) {
        p.value = _(t, "Could not save the task."), g.value || l("automation-installed", { success: !1, error: p.value });
      } finally {
        c.value = !1;
      }
    }
    return Y(f), N(g, f), (a, t) => C.value ? (r(), s("p", Le, "Loading task…")) : V.value ? (r(), s("form", {
      key: 2,
      class: "task-form",
      onSubmit: ce(B, ["prevent"])
    }, [
      v("label", Re, [
        t[6] || (t[6] = F("Title ", -1)),
        G(v("input", {
          "onUpdate:modelValue": t[0] || (t[0] = (w) => T.value = w),
          "aria-label": "Title",
          disabled: c.value
        }, null, 8, Be), [
          [ue, T.value]
        ])
      ]),
      g.value ? h("", !0) : (r(), s("label", Fe, [
        G(v("input", {
          "onUpdate:modelValue": t[1] || (t[1] = (w) => y.value = w),
          type: "checkbox",
          disabled: c.value
        }, null, 8, We), [
          [fe, y.value]
        ]),
        t[7] || (t[7] = F(" Enabled", -1))
      ])),
      u.recurring ? (r(), s("section", Oe, [
        t[8] || (t[8] = v("p", { class: "task-hint" }, "All times are UTC.", -1)),
        M(be, {
          modelValue: z.value,
          "onUpdate:modelValue": t[2] || (t[2] = (w) => z.value = w),
          "default-preset": "daily",
          disabled: c.value
        }, null, 8, ["modelValue", "disabled"])
      ])) : h("", !0),
      M(je, {
        modelValue: A.value,
        "onUpdate:modelValue": t[3] || (t[3] = (w) => A.value = w),
        disabled: c.value,
        onValidation: t[4] || (t[4] = (w) => I.value = w)
      }, null, 8, ["modelValue", "disabled"]),
      p.value ? (r(), s("p", De, S(p.value), 1)) : h("", !0),
      g.value ? (r(), s("div", Ke, [
        v("button", {
          type: "button",
          disabled: c.value,
          onClick: t[5] || (t[5] = (w) => D(l)("close", {}))
        }, "Cancel", 8, He),
        v("button", {
          type: "submit",
          disabled: c.value || !!E.value
        }, S(c.value ? "Saving…" : "Save"), 9, Ge)
      ])) : h("", !0)
    ], 32)) : (r(), s("p", qe, S(p.value), 1));
  }
});
export {
  tt as T,
  ot as _
};
//# sourceMappingURL=TaskCreate.vue_vue_type_script_setup_true_lang-VIfIVdRx.js.map
