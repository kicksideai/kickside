import { defineComponent as y, ref as c, computed as k, onMounted as z, openBlock as f, createElementBlock as w, Fragment as _, toDisplayString as a, createCommentVNode as C, createVNode as d, withCtx as S, createElementVNode as o, unref as p, createTextVNode as M } from "vue";
import { Icon as m } from "@iconify/vue";
import "@wippy-fe/proxy";
import { _ as E, o as N, L as I } from "./pickerselect-BuC_5yaD.js";
const j = {
  key: 0,
  class: "wf-embed-note"
}, F = { class: "wf-embed-ico" }, W = { class: "wf-embed-main" }, B = { class: "wf-embed-title" }, L = { class: "wf-embed-meta" }, V = { class: "wf-embed-io" }, A = /* @__PURE__ */ y({
  __name: "EmbedWorkflowPicker",
  props: {
    selected: {}
  },
  emits: ["select"],
  setup(i, { emit: b }) {
    const g = i, u = b, n = c(!1), s = c(""), l = c([]), x = k(() => l.value.find((t) => t.id === g.selected?.id)?.title || "Selected workflow");
    async function h() {
      n.value = !0, s.value = "";
      try {
        const t = await N({ filter: "published" });
        l.value = t.map((e) => I(e, {}, [], "")).filter((e) => !!e.published_version);
      } catch (t) {
        s.value = t instanceof Error ? t.message : "Could not load Workflows.";
      } finally {
        n.value = !1;
      }
    }
    z(h);
    function v(t, e) {
      return t.title.toLowerCase().includes(e) || t.id.toLowerCase().includes(e);
    }
    return (t, e) => (f(), w(_, null, [
      i.selected ? (f(), w("p", j, a(x.value) + " · Published v" + a(i.selected.version), 1)) : C("", !0),
      d(E, {
        rows: l.value,
        loading: n.value,
        error: s.value,
        matches: v,
        placeholder: "Search published Workflows",
        "empty-message": "No published Workflows available.",
        "root-class": "wf-embed-pick",
        "search-class": "wf-embed-search",
        "note-class": "wf-embed-note",
        "error-class": "wf-embed-err",
        "list-class": "wf-embed-list",
        "row-class": "wf-embed-row",
        "quiet-rows": "",
        "empty-class": "wf-embed-empty",
        onSelect: e[0] || (e[0] = (r) => u("select", r))
      }, {
        row: S(({ item: r }) => [
          o("span", F, [
            d(p(m), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          o("span", W, [
            o("span", B, a(r.title), 1),
            o("span", L, [
              o("span", null, "v" + a(r.published_version), 1),
              o("span", V, [
                e[1] || (e[1] = o("strong", null, "In", -1)),
                M(a(r.input_summary), 1)
              ])
            ])
          ]),
          d(p(m), {
            icon: "tabler:chevron-right",
            class: "wf-embed-go",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }, 8, ["rows", "loading", "error"])
    ], 64));
  }
}), D = '.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host{--wf-surface: color-mix(in srgb, var(--p-content-background) 95%, var(--p-text-color));--wf-panel: color-mix(in srgb, var(--p-content-background) 97%, var(--p-text-color));--wf-elevated: color-mix(in srgb, var(--p-content-background) 88%, var(--p-text-color));--wf-line-soft: color-mix(in srgb, var(--p-content-border-color) 55%, transparent);--wf-line-strong: color-mix(in srgb, var(--p-text-color) 34%, transparent);--wf-muted: color-mix(in srgb, var(--p-text-muted-color) 55%, var(--p-text-color));--wf-faint: color-mix(in srgb, var(--p-text-muted-color) 40%, var(--p-text-color));--wf-accent-fg: color-mix(in srgb, var(--p-primary-color) 35%, var(--p-text-color));--wf-danger: color-mix(in srgb, var(--p-danger-500) 50%, var(--p-text-color));--wf-amber: color-mix(in srgb, #f5a623 60%, var(--p-text-color));--wf-violet: color-mix(in srgb, #8b5cf6 60%, var(--p-text-color));--wf-blue: color-mix(in srgb, #3b82f6 60%, var(--p-text-color));--wf-teal: color-mix(in srgb, #14b8a6 60%, var(--p-text-color));--wf-rose: color-mix(in srgb, #f43f5e 60%, var(--p-text-color));--wf-paper: color-mix(in srgb, #b6924a 60%, var(--p-text-color));--wf-contract-in: color-mix(in srgb, #5b8aa6 60%, var(--p-text-color));--wf-contract-out: color-mix(in srgb, #6d78b5 60%, var(--p-text-color));--wf-contract-err: color-mix(in srgb, #a3788f 60%, var(--p-text-color));--wf-dot: color-mix(in srgb, var(--p-text-muted-color) 26%, transparent);--wf-minimap-node: color-mix(in srgb, var(--p-text-muted-color) 40%, transparent);--wf-radius: 14px;--wf-radius-sm: 8px;--wf-mono: ui-monospace, "SF Mono", "JetBrains Mono", monospace;--wf-fs-label: 10.5px;--wf-fs-meta: 11.5px;--wf-fs-body: 13px;--wf-fs-title: 15px;--wf-ease: cubic-bezier(.22, .61, .36, 1);--wf-elev-1: 0 2px 8px color-mix(in srgb, var(--p-text-color) 14%, transparent);--wf-elev-2: 0 6px 18px color-mix(in srgb, var(--p-text-color) 18%, transparent);--wf-elev-3: 0 12px 32px color-mix(in srgb, var(--p-text-color) 22%, transparent);--wf-layer-panel-affordance: 1;--wf-layer-list-header: 1;--wf-layer-selection: 2;--wf-layer-node-label: 3;--wf-layer-edge-annotation: 4;--wf-layer-canvas-status: 5;--wf-layer-palette: 21;--wf-layer-toolbar: 30;--wf-layer-coordinate-hint: 40;--wf-layer-coordinate-trace: 41;--wf-layer-coordinate-editor: 42;--wf-layer-immersive-shell: 50;display:block;position:relative;width:100%;height:100%;color:var(--p-text-color);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}*{box-sizing:border-box}.wf{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--p-content-background);overflow:hidden}.wf-banner{margin:10px 14px;min-width:0;overflow-wrap:anywhere}.wf-banner.wf-banner--error{margin:0;border-radius:0}.wf-embed{display:flex;flex-direction:column;gap:12px;color:var(--p-text-color);background:var(--p-content-background);font-size:var(--wf-fs-body);line-height:1.45;padding:14px;border:1px solid var(--p-content-border-color);border-radius:var(--wf-radius)}.wf-embed-note{display:flex;align-items:center;gap:8px;color:var(--wf-muted);font-size:var(--wf-fs-meta)}.wf-embed-directed{display:flex;align-items:flex-start;gap:10px;padding:14px;border:1px solid color-mix(in srgb,var(--p-warn-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-warn-500) 7%,transparent);border-radius:10px}.wf-embed-directed p{margin:0;color:var(--p-text-color)}.wf-embed-directed-ico{color:var(--p-warn-500);flex:none;width:18px;height:18px;margin-top:1px}.wf-embed-err{margin:0;min-width:0;color:var(--wf-danger);font-size:var(--wf-fs-meta);overflow-wrap:anywhere}.wf-embed-subtle{margin:0;color:var(--wf-muted);font-size:var(--wf-fs-meta)}.wf-embed-pick{display:flex;flex-direction:column;gap:10px}.wf-embed-search{display:flex}.wf-embed-list{display:flex;flex-direction:column;gap:6px;max-height:320px;overflow:auto}.wf-embed-row{display:flex;align-items:center;gap:10px;width:100%;text-align:left}.wf-embed-ico{color:var(--wf-muted);display:inline-flex}.wf-embed-main{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}.wf-embed-title{font-weight:700}.wf-embed-meta{display:flex;gap:10px;font-size:var(--wf-fs-meta);color:var(--wf-muted);flex-wrap:wrap}.wf-embed-io strong{font-weight:700;color:var(--wf-faint);margin-right:4px;text-transform:uppercase;letter-spacing:.04em;font-size:var(--wf-fs-label)}.wf-embed-go{color:var(--wf-faint);flex:none}.wf-embed-empty{margin:0;color:var(--wf-muted);font-size:var(--wf-fs-meta);text-align:center;padding:12px}.wf-embed-run{display:flex;flex-direction:column;gap:12px}.wf-embed-hd{display:flex;align-items:center;gap:10px}.wf-embed-hd-ico{color:var(--wf-accent-fg);display:inline-flex}.wf-embed-hd-main{display:flex;flex-direction:column;gap:1px;flex:1;min-width:0}.wf-embed-hd-title{font-weight:750;font-size:var(--wf-fs-title)}.wf-embed-hd-sub{font-size:var(--wf-fs-meta);color:var(--wf-muted)}.wf-embed-open,.wf-embed-change{display:inline-flex;align-items:center;gap:5px;flex:none}.wf-embed-input{display:flex;flex-direction:column;gap:8px}.wf-embed-gate{margin:0;color:var(--p-warn-500);font-size:var(--wf-fs-meta)}.wf-embed-actions{display:flex;gap:8px}.wf-embed-status{display:flex;align-items:center;gap:8px;font-weight:700;font-size:var(--wf-fs-meta)}.wf-embed-status.is-running{color:var(--wf-muted)}.wf-embed-status.is-ok{color:var(--p-success-500)}.wf-embed-status.is-error{color:var(--wf-danger)}.wf-embed-runid{color:var(--wf-faint);font-weight:500;font-family:var(--wf-mono)}.wf-embed-result{display:flex;flex-direction:column;gap:10px}.wf-embed-reason{margin:0;min-width:0;color:var(--p-text-color);overflow-wrap:anywhere}@media(prefers-reduced-motion:reduce){:host *,:host *:before,:host *:after{scroll-behavior:auto;animation-duration:.01ms;animation-iteration-count:1;transition-duration:.01ms}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}';
export {
  A as _,
  D as s
};
