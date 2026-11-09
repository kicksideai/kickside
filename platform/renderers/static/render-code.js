import { W as d, a as l } from "./wc-runtime-h8e5VJvv.js";
import { Icon as r } from "@iconify/vue";
import { defineAsyncComponent as p, defineComponent as c, h as o, onMounted as u } from "vue";
import { s as m } from "./styles-HTuIrRec.js";
import { define as f } from "@wippy-fe/proxy";
const h = 3e4, a = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", y = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function g(t) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || t.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function C(t, e, n) {
  const i = n();
  u(() => i("error", { message: t, error: e }));
}
function x(t, e, n) {
  return p({
    loader: t,
    loadingComponent: {
      render: () => o("span", {
        role: "status",
        "data-lazy-state": "loading",
        "aria-label": e.loading,
        style: `${a}color:var(--p-text-muted-color);`
      }, o("span", { style: "display:inline-flex;", onVnodeMounted: g }, o(r, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: c({
      props: { error: { type: Error, required: !0 } },
      setup(i) {
        return C(e.failed, i.error, n), () => o("span", {
          role: "alert",
          "data-lazy-state": "failed",
          title: e.iconOnly ? e.failed : void 0,
          style: `${a}color:var(--p-danger-500);`
        }, e.iconOnly ? [o(r, { icon: "tabler:alert-circle", "aria-hidden": "true" }), o("span", { style: y }, e.failed)] : e.failed);
      }
    }),
    delay: e.immediate ? 0 : 200,
    timeout: h,
    suspensible: !1
  });
}
const v = x(
  () => import("./RenderCode-jlZ7UAwM.js"),
  { loading: "Loading the code viewer…", failed: "Could not load the code viewer. Reload the page to try again." },
  l
), w = ":host > div:empty, :host > div:has(> [data-lazy-state]) { min-height: 96px; }", M = {
  type: "object",
  properties: {
    source: { type: "string", default: "", description: "Inline source/data text to render." },
    "source-url": { type: "string", default: "", description: "URL to fetch the text from (auth via proxy) when source is empty." },
    "content-type": { type: "string", default: "", description: "MIME type, used to pick the highlight language / table mode." },
    filename: { type: "string", default: "", description: "Filename, used to infer language from the extension." }
  }
};
class s extends d {
  static get wippyConfig() {
    return {
      propsSchema: M,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: `${m}
${w}`
    };
  }
  static get vueConfig() {
    return { rootComponent: v };
  }
}
async function S() {
  return s;
}
f(import.meta.url, s);
export {
  S as webComponent
};
//# sourceMappingURL=render-code.js.map
