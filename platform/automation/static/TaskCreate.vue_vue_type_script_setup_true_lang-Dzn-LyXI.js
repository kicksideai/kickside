import { b as ee, e as _, W as j, u as te, a as oe } from "./errMsg-CFwf-kA2.js";
import { watch as U, defineComponent as J, ref as u, computed as k, openBlock as s, createElementBlock as f, createElementVNode as m, createTextVNode as F, createCommentVNode as C, Fragment as B, createVNode as $, toDisplayString as P, createBlock as K, unref as D, onMounted as ae, withModifiers as ie, withDirectives as O, vModelText as re, vModelCheckbox as ne } from "vue";
import { api as N } from "@wippy-fe/proxy";
import { v as le, u as se, c as H } from "./install-form-Ce0pU51G.js";
import { p as pe, s as ce, a as de, _ as ue, b as G, c as fe, d as ge, t as xe, f as me } from "./source-instance-BWCuScFJ.js";
const we = '.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;font-size:13px;color:var(--p-text-color)}*,*:before,*:after{box-sizing:border-box}.kx-tc{display:flex;flex-direction:column;gap:16px;min-width:0}.kx-tc-field,.kx-tc-sub{min-width:0}.kx-tc-off{opacity:.6;pointer-events:none}.kx-tc-field{display:flex;flex-direction:column;gap:7px}.kx-tc-sub{display:flex;flex-direction:column;gap:5px;margin-top:8px}.kx-tc-lbl{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:650;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-tc-lbl svg{width:13px;height:13px;opacity:.85}.kx-tc-desc{margin:0;font-size:12px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-hint{font-size:11px;line-height:1.45;color:var(--p-text-muted-color)}.kx-tc-input{width:100%;height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s,box-shadow .15s}.kx-tc-input:disabled{opacity:.6}.kx-tc-textarea{height:auto;min-height:56px;padding:8px 10px;line-height:1.45;resize:vertical;font-family:ui-monospace,monospace;font-size:12px}.kx-tc-code{font-family:ui-monospace,monospace;font-size:12px}.kx-tc-row{display:grid;grid-template-columns:max-content minmax(72px,96px) minmax(120px,1fr);align-items:center;gap:8px}.kx-tc-num,.kx-tc-unit{width:100%;min-width:0}.kx-tc-check{display:inline-flex;align-items:center;gap:8px;width:fit-content;font-size:12px;color:var(--p-text-color);cursor:pointer}.kx-tc-check input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-tc-check input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-tc-check input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-tc-check input:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset)}.kx-tc-check input:checked:before{transform:rotate(45deg) scale(1)}.kx-tc-check input:disabled{opacity:.55;cursor:not-allowed}.kx-tc-check:has(input:disabled){cursor:not-allowed}.kx-tc-specific{display:grid;grid-template-columns:minmax(160px,1fr) minmax(112px,140px) minmax(112px,140px);gap:8px;align-items:start}.kx-tc-specific .kx-tc-sub{grid-column:1 / -1;margin-top:0}.kx-tc-select{width:100%;min-width:0}.kx-tc-locked{pointer-events:none;opacity:.6}.kx-tc-static{display:flex;align-items:center;min-height:36px;font-size:13px;color:var(--p-text-color)}.kx-tc-field[data-test=tc-instance]{gap:9px;padding:12px;border-radius:10px;border:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 2.5%,transparent)}.kx-tc-note{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-tc-note svg{width:15px;height:15px;flex:none}.kx-tc-note>span,.kx-tc-warn>span,.kx-tc-gate>span{min-width:0;flex:1}.kx-tc-warn{display:flex;align-items:center;flex-wrap:wrap;gap:7px;font-size:11.5px;line-height:1.4;padding:8px 10px;border-radius:10px;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-tc-warn svg{width:15px;height:15px;flex:none}.kx-tc-retry{margin-left:auto;padding:8px 10px;font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;color:inherit;background:transparent;border:1px solid currentColor;border-radius:8px}.kx-tc-gate{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.4;color:var(--p-text-muted-color);padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--p-text-color) 4%,transparent)}.kx-tc-gate svg{width:15px;height:15px;flex:none}.kx-tc-opts{display:flex;flex-direction:column;gap:6px;margin-top:6px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-tc-detail{margin-top:2px}.kx-tc-adv summary{display:flex;align-items:center;gap:6px;cursor:pointer;list-style:none;font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.kx-tc-adv summary::-webkit-details-marker{display:none}.kx-tc-adv summary:hover{color:var(--p-text-color)}.kx-tc-caret{width:14px;height:14px;transition:transform .15s}.kx-tc-adv[open] .kx-tc-caret{transform:rotate(90deg)}.kx-tc-adv-body{margin-top:8px}@media(max-width:520px){.kx-tc-row,.kx-tc-specific{grid-template-columns:1fr}}.task-form,.task-target{display:flex;flex-direction:column;gap:16px;min-width:0}.task-form{padding:2px}.task-field{display:flex;flex-direction:column;gap:7px;min-width:0;font-weight:600}.task-field input,.task-field select,.task-field textarea,.task-form .kx-tc-select{box-sizing:border-box;width:100%;min-width:0;padding:9px 10px;font:inherit;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px}.task-field textarea{resize:vertical;font-weight:400}.task-check{display:flex;align-items:center;gap:8px}.task-check input{accent-color:var(--p-primary-color)}.task-hint{margin:0 0 7px;color:var(--p-text-muted-color);font-size:12px}.task-error,.task-target [role=alert]{color:var(--p-danger-500)}.task-actions{display:flex;justify-content:flex-end;gap:8px}.task-actions button{padding:8px 14px;border:1px solid var(--p-content-border-color);border-radius:8px;font:inherit;color:var(--p-text-color);background:var(--p-content-background);cursor:pointer}.task-actions button[type=submit]{color:var(--p-primary-contrast-color);background:var(--p-primary-color)}.task-form :disabled{opacity:.6;cursor:default}.task-form :is(input,select,textarea,button):focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:var(--p-focus-ring-shadow)}.task-target .wf-embed-list{display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto}.task-target .wf-embed-row{display:flex;gap:10px;width:100%;text-align:left;padding:10px;border-radius:8px}.task-target .wf-embed-main{display:flex;flex:1;flex-direction:column;gap:4px;min-width:0}.task-target .wf-embed-meta{display:flex;flex-wrap:wrap;gap:10px;color:var(--p-text-muted-color);font-size:12px}.task-target .wf-embed-io{display:flex;gap:6px}.task-target .wf-search{margin-bottom:8px}.task-target .wf-search input{width:100%}';
class Ke extends ee {
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
      inlineCss: we
    };
  }
}
function he(c, T, r) {
  U(
    () => c.value?.submitNonce,
    (i, E) => {
      i == null || i === "" || i === E || r?.value || T();
    }
  );
}
const ke = { class: "task-target" }, ve = { class: "task-field" }, be = ["value", "disabled"], ye = {
  key: 0,
  value: "agent"
}, ze = { class: "task-field" }, Ce = ["value", "disabled"], Ve = {
  key: 0,
  role: "alert"
}, _e = {
  key: 0,
  class: "task-hint"
}, Ee = {
  key: 3,
  "data-test": "task-target-input",
  class: "task-field"
}, Te = /* @__PURE__ */ J({
  __name: "TaskTargetEditor",
  props: {
    modelValue: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue", "validation"],
  setup(c, { emit: T }) {
    const r = c, i = T, E = u([]), d = u(""), y = u(!1), V = u(null), g = u(""), z = u(!1), w = k(() => r.modelValue.kind), p = k(() => E.value.find((e) => e.id === r.modelValue.port) || null), S = k(() => E.value.map((e) => ({
      id: e.id,
      title: e.title || e.name || e.id,
      icon: e.icon,
      group: e.group,
      subtitle: e.description
    }))), n = k(() => pe(p.value, "TaskTarget")), x = k(() => ce(p.value, "TaskTarget")), I = k(() => de(p.value, n.value)), q = { properties: { agent_id: { picker: "wc-agent-picker", title: "Agent", required: !0 } } }, R = k(() => r.modelValue.agent_id ? { agent_id: r.modelValue.agent_id } : {}), M = k(() => w.value === "workflow" ? V.value : p.value?.input_schema);
    function a(e) {
      i("update:modelValue", { ...r.modelValue, ...e });
    }
    function t(e) {
      i("update:modelValue", { kind: e.target.value });
    }
    const h = { properties: { flow_ref: { picker: "wc-workflow-picker", title: "Published workflow", required: !0 } } }, Q = k(() => r.modelValue.flow_ref ? { flow_ref: r.modelValue.flow_ref } : {});
    function X(e) {
      const o = A(e).flow_ref;
      i("update:modelValue", { kind: "workflow", flow_ref: o, input: {} });
    }
    function A(e) {
      return e && typeof e == "object" && !Array.isArray(e) ? e : {};
    }
    function Y(e) {
      a({ agent_id: String(A(e).agent_id || "") });
    }
    function L(e, o) {
      const l = fe(e);
      return l ? le({ inputs: l }, o) : "";
    }
    const Z = k(() => {
      const e = r.modelValue;
      if (w.value === "agent")
        return e.agent_id?.trim() ? e.prompt?.trim() ? "" : "Enter a prompt." : "Choose an agent.";
      if (w.value === "workflow")
        return z.value ? "Loading the published workflow…" : g.value ? g.value : !e.flow_ref?.id || !Number.isInteger(e.flow_ref.version) || e.flow_ref.version < 1 ? "Choose a published workflow." : L(V.value, e.input || {});
      if (y.value) return "Loading destinations…";
      if (d.value) return d.value;
      if (!p.value) return "Choose a writable action.";
      const o = p.value.config_schema || {};
      return L({ properties: o, required: Object.keys(o).filter((v) => o[v].required) }, e.config || {}) || L(p.value.input_schema, e.input || {});
    });
    return U(Z, (e) => i("validation", e), { immediate: !0 }), U(w, async (e, o, l) => {
      if (e !== "action") return;
      let v = !0;
      l(() => {
        v = !1;
      }), y.value = !0, d.value = "";
      try {
        const { data: b } = await N.get("/api/v1/automations/sinks");
        if (!Array.isArray(b.sinks)) throw new Error("The destination catalog is unavailable.");
        v && (E.value = b.sinks);
      } catch (b) {
        v && (d.value = _(b, "Could not load destinations."));
      } finally {
        v && (y.value = !1);
      }
    }, { immediate: !0 }), U(() => r.modelValue.flow_ref, async (e, o, l) => {
      if (z.value = !1, g.value = "", !e) return;
      let v = !0;
      l(() => {
        v = !1;
      }), z.value = !0, g.value = "";
      try {
        const { data: b } = await N.get(`/api/v1/workflows/${encodeURIComponent(e.id)}/versions/${e.version}`);
        if (!b.success || !b.version) throw new Error(_(b.error, "Could not read the published workflow."));
        const W = b.version;
        if (W.version !== e.version) throw new Error("The published workflow version is unavailable.");
        v && (V.value = W.interface?.input_schema ?? W.input_schema);
      } catch (b) {
        v && (g.value = _(b, "Could not read the published workflow."));
      } finally {
        v && (z.value = !1);
      }
    }, { immediate: !0 }), (e, o) => (s(), f("div", ke, [
      m("label", ve, [
        o[7] || (o[7] = F("Target ", -1)),
        m("select", {
          value: w.value,
          "aria-label": "Target kind",
          disabled: c.disabled,
          onChange: t
        }, [
          w.value === "agent" ? (s(), f("option", ye, "Agent prompt (existing task)")) : C("", !0),
          o[5] || (o[5] = m("option", { value: "workflow" }, "Published workflow", -1)),
          o[6] || (o[6] = m("option", { value: "action" }, "Writable action", -1))
        ], 40, be)
      ]),
      w.value === "agent" ? (s(), f(B, { key: 0 }, [
        $(j, {
          tag: "wc-agent-picker",
          config: R.value,
          schema: q,
          onChange: Y
        }, null, 8, ["config"]),
        m("label", ze, [
          o[8] || (o[8] = F("Prompt ", -1)),
          m("textarea", {
            value: c.modelValue.prompt || "",
            "aria-label": "Prompt",
            rows: "4",
            disabled: c.disabled,
            onInput: o[0] || (o[0] = (l) => a({ prompt: l.target.value }))
          }, null, 40, Ce)
        ])
      ], 64)) : w.value === "workflow" ? (s(), f(B, { key: 1 }, [
        $(j, {
          tag: "wc-workflow-picker",
          config: Q.value,
          schema: h,
          onChange: X
        }, null, 8, ["config"]),
        g.value ? (s(), f("p", Ve, P(g.value), 1)) : C("", !0)
      ], 64)) : (s(), f(B, { key: 2 }, [
        $(ue, {
          items: S.value,
          "model-value": c.modelValue.port || "",
          loading: y.value,
          error: d.value,
          disabled: c.disabled,
          "aria-label": "Writable action",
          placeholder: "Pick a writable action…",
          "onUpdate:modelValue": o[1] || (o[1] = (l) => i("update:modelValue", { kind: "action", port: l, config: {}, input: {} }))
        }, null, 8, ["items", "model-value", "loading", "error", "disabled"]),
        p.value ? (s(), f(B, { key: 0 }, [
          p.value.description ? (s(), f("p", _e, P(p.value.description), 1)) : C("", !0),
          (s(), K(j, {
            key: p.value.id,
            tag: n.value?.tag || "wc-schema-form",
            schema: n.value?.schema || x.value,
            config: c.modelValue.config || {},
            meta: I.value,
            provider: p.value.provider,
            onChange: o[2] || (o[2] = (l) => a({ config: A(l) }))
          }, null, 8, ["tag", "schema", "config", "meta", "provider"])),
          n.value && D(G)(x.value) ? (s(), K(j, {
            key: 1,
            tag: "wc-schema-form",
            schema: x.value,
            config: c.modelValue.config || {},
            onChange: o[3] || (o[3] = (l) => a({ config: A(l) }))
          }, null, 8, ["schema", "config"])) : C("", !0)
        ], 64)) : C("", !0)
      ], 64)),
      w.value !== "agent" && D(G)(M.value) ? (s(), f("div", Ee, [
        o[9] || (o[9] = m("span", null, "Input", -1)),
        $(j, {
          tag: "wc-schema-form",
          schema: M.value,
          config: c.modelValue.input || {},
          onChange: o[4] || (o[4] = (l) => a({ input: A(l) }))
        }, null, 8, ["schema", "config"])
      ])) : C("", !0)
    ]));
  }
}), Se = {
  key: 0,
  class: "task-hint"
}, $e = {
  key: 1,
  role: "alert"
}, Ue = { class: "task-field" }, Ie = ["disabled"], Me = { class: "task-check" }, Ae = ["disabled"], je = {
  key: 0,
  "aria-label": "Schedule (UTC)"
}, Pe = {
  key: 1,
  class: "task-error",
  role: "alert"
}, Ne = {
  key: 2,
  class: "task-actions"
}, qe = ["disabled"], Re = ["disabled"], Oe = /* @__PURE__ */ J({
  __name: "TaskCreate",
  props: {
    recurring: { type: Boolean }
  },
  setup(c) {
    const T = c, r = te(), i = oe(), E = se(r), d = k(() => String(H(r.value.config).id || "")), y = u(""), V = u(!0), g = u(null), z = u({ kind: "workflow" }), w = u("Choose a target."), p = u(!0), S = u(!1), n = u(!1), x = u("");
    U(n, (a) => i("submit-state", { saving: a })), he(r, M, n);
    const I = k(() => T.recurring && !g.value ? "Complete the UTC schedule." : w.value);
    function q(a) {
      y.value = typeof a.title == "string" ? a.title : "", V.value = a.enabled !== !1, g.value = me(a.schedule || null), z.value = a.target || { kind: "workflow" };
    }
    async function R() {
      p.value = !0, S.value = !1, x.value = "";
      try {
        if (d.value) {
          const { data: a } = await N.get(
            `/api/v1/automations/${encodeURIComponent(d.value)}/config`
          );
          if (!a.success) throw new Error(_(a.error, "Could not load the task."));
          const t = a.config?._portable_input;
          if (!t || typeof t != "object" || Array.isArray(t) || typeof a.config?.enabled != "boolean")
            throw new Error("The task has no stored declaration.");
          q({ ...t, enabled: a.config?.enabled });
        } else q(H(r.value.input));
        S.value = !0;
      } catch (a) {
        x.value = _(a, "Could not load the task.");
      } finally {
        p.value = !1;
      }
    }
    async function M() {
      if (!S.value || n.value) return;
      if (I.value) {
        x.value = I.value, d.value || i("automation-installed", { success: !1, error: x.value });
        return;
      }
      n.value = !0, x.value = "";
      const a = {
        title: y.value,
        enabled: V.value,
        target: z.value,
        ...T.recurring && g.value ? { schedule: xe(g.value) } : {}
      };
      try {
        if (d.value) {
          const { data: t } = await N.put(`/api/v1/automations/${encodeURIComponent(d.value)}`, { input: a });
          if (!t.success) throw new Error(_(t.error, "Could not save the task."));
          i("change", { id: d.value }), i("close", {});
        } else {
          const { data: t } = await N.post("/api/v1/automations", {
            type: r.value.typeId,
            parent_id: E.value || void 0,
            input: a
          });
          if (!t.success) throw new Error(_(t.error, "Could not create the task."));
          i("automation-installed", { success: !0, id: t.id }), i("created", { id: t.id });
        }
      } catch (t) {
        x.value = _(t, "Could not save the task."), d.value || i("automation-installed", { success: !1, error: x.value });
      } finally {
        n.value = !1;
      }
    }
    return ae(R), U(d, R), (a, t) => p.value ? (s(), f("p", Se, "Loading task…")) : S.value ? (s(), f("form", {
      key: 2,
      class: "task-form",
      onSubmit: ie(M, ["prevent"])
    }, [
      m("label", Ue, [
        t[6] || (t[6] = F("Title ", -1)),
        O(m("input", {
          "onUpdate:modelValue": t[0] || (t[0] = (h) => y.value = h),
          "aria-label": "Title",
          disabled: n.value
        }, null, 8, Ie), [
          [re, y.value]
        ])
      ]),
      m("label", Me, [
        O(m("input", {
          "onUpdate:modelValue": t[1] || (t[1] = (h) => V.value = h),
          type: "checkbox",
          disabled: n.value
        }, null, 8, Ae), [
          [ne, V.value]
        ]),
        t[7] || (t[7] = F(" Enabled", -1))
      ]),
      c.recurring ? (s(), f("section", je, [
        t[8] || (t[8] = m("p", { class: "task-hint" }, "All times are UTC.", -1)),
        $(ge, {
          modelValue: g.value,
          "onUpdate:modelValue": t[2] || (t[2] = (h) => g.value = h),
          "default-preset": "daily",
          disabled: n.value
        }, null, 8, ["modelValue", "disabled"])
      ])) : C("", !0),
      $(Te, {
        modelValue: z.value,
        "onUpdate:modelValue": t[3] || (t[3] = (h) => z.value = h),
        disabled: n.value,
        onValidation: t[4] || (t[4] = (h) => w.value = h)
      }, null, 8, ["modelValue", "disabled"]),
      x.value ? (s(), f("p", Pe, P(x.value), 1)) : C("", !0),
      d.value ? (s(), f("div", Ne, [
        m("button", {
          type: "button",
          disabled: n.value,
          onClick: t[5] || (t[5] = (h) => D(i)("close", {}))
        }, "Cancel", 8, qe),
        m("button", {
          type: "submit",
          disabled: n.value || !!I.value
        }, P(n.value ? "Saving…" : "Save"), 9, Re)
      ])) : C("", !0)
    ], 32)) : (s(), f("p", $e, P(x.value), 1));
  }
});
export {
  Ke as T,
  Oe as _
};
//# sourceMappingURL=TaskCreate.vue_vue_type_script_setup_true_lang-Dzn-LyXI.js.map
