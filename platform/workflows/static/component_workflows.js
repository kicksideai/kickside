import { u as _, a as E, s as S, W, P as N } from "./index-BhiG6P-P.js";
import { defineComponent as j, ref as c, onMounted as M, onBeforeUnmount as V, openBlock as a, createElementBlock as l, createElementVNode as o, createVNode as g, unref as p, createBlock as B, withCtx as I, createTextVNode as P, toDisplayString as A, createCommentVNode as L, nextTick as m } from "vue";
import { Icon as T } from "@iconify/vue";
import { loadByTagName as U, define as H } from "@wippy-fe/proxy";
import { s as q } from "./index-BpA9WGJi.js";
const K = { class: "cw-root" }, O = { class: "cw-head" }, R = { class: "cw-head-icon" }, D = {
  key: 1,
  class: "cw-state"
}, F = {
  key: 2,
  class: "cw-section",
  "aria-label": "Event Workflows"
}, $ = /* @__PURE__ */ j({
  __name: "ComponentWorkflows",
  setup(f) {
    const d = _(), b = E(), w = c(null), n = c(!0), r = c("");
    let s = null;
    function h() {
      return String(d.value?.componentInstanceId || d.value?.["component-instance-id"] || "").trim();
    }
    function u(e) {
      const t = e.detail;
      t?.route && b("navigate", { route: t.route });
    }
    async function x(e, t, v) {
      if (!e) return null;
      await U(t, { timeoutMs: 8e3 });
      const i = document.createElement(t);
      for (const [z, C] of Object.entries(v)) i.setAttribute(z, C);
      return i.addEventListener("navigate", u), i.style.display = "block", e.replaceChildren(i), i;
    }
    async function y() {
      if (!h()) {
        r.value = "Component is required.", n.value = !1;
        return;
      }
      n.value = !1, await m(), await k();
    }
    async function k() {
      const e = h();
      if (!(!e || n.value))
        try {
          await m(), s || (s = await x(w.value, "kickside-automation-manager", {
            "component-id": e,
            mode: "component"
          }));
        } catch {
          r.value = "Workflow controls could not load. Try refreshing this page.";
        }
    }
    return M(y), V(() => {
      s?.removeEventListener("navigate", u);
    }), (e, t) => (a(), l("div", K, [
      o("header", O, [
        o("span", R, [
          g(p(T), {
            icon: "tabler:route",
            "aria-hidden": "true"
          })
        ]),
        t[0] || (t[0] = o("span", { class: "cw-head-copy" }, [
          o("h1", null, "Workflows"),
          o("p", null, "Connect component events to typed Blocks or published Workflows.")
        ], -1))
      ]),
      r.value ? (a(), B(p(S), {
        key: 0,
        class: "cw-feedback",
        severity: "error",
        closable: !1
      }, {
        default: I(() => [
          P(A(r.value), 1)
        ]),
        _: 1
      })) : L("", !0),
      n.value ? (a(), l("div", D, [
        g(p(q), {
          class: "cw-spinner",
          "stroke-width": "4",
          "aria-label": "Loading Workflows"
        }),
        t[1] || (t[1] = o("span", null, "Loading Workflows…", -1))
      ])) : (a(), l("section", F, [
        o("div", {
          ref_key: "automationsHost",
          ref: w,
          class: "cw-host"
        }, null, 512)
      ]))
    ]));
  }
}), G = '*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;color:var(--p-text-color);font-family:inherit}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.cw-root{display:flex;flex-direction:column;min-width:0;min-height:100%;background:var(--p-content-background)}.cw-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px}.cw-head-icon{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:11px;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.cw-head-icon svg{width:22px;height:22px}.cw-head-copy{min-width:0}.cw-head h1{margin:0;color:var(--p-text-color);font-size:18px;line-height:1.3;font-weight:700;letter-spacing:-.015em}.cw-head p{margin:2px 0 0;color:var(--p-text-muted-color);font-size:13px;line-height:1.45}.cw-section{min-width:0;flex:1}.cw-host{min-height:180px}.cw-host>*{display:block;min-height:180px}.cw-state{display:flex;align-items:center;gap:8px;padding:30px 24px;color:var(--p-text-muted-color);font-size:13px}.cw-spinner{width:18px;height:18px}.cw-feedback{margin:0 24px 10px}@media(max-width:640px){.cw-head{padding:16px 16px 12px}.cw-feedback{margin-inline:16px}}', J = {
  type: "object",
  properties: { "component-instance-id": { type: "string", description: "Component whose defaults and event Automations are managed." } }
};
class Q extends W {
  static get wippyConfig() {
    return {
      propsSchema: J,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: G
    };
  }
  static get vueConfig() {
    return { rootComponent: $, plugins: [N] };
  }
}
H(import.meta.url, Q);
