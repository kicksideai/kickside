import { W as e, u as o } from "./wc-runtime-KO3cNuNo.js";
import { P as r } from "./primevue-plugin-CaP7wV_M.js";
import { l as s } from "./lazy-Cfv2E3SG.js";
import { p as n, w as i } from "./wc-mount-N7h56Ydz.js";
import { s as p } from "./workflow-embed-BX8EY-U_.js";
import "@iconify/vue";
import { define as a } from "@wippy-fe/proxy";
const m = s(
  () => import("./WorkflowPicker-BkUxrKTV.js"),
  { loading: "Loading the Workflow picker…", failed: "Could not load the Workflow picker. Reload the page to try again." },
  o
), l = {
  type: "object",
  properties: {
    config: { type: "string", default: "{}" },
    schema: { type: "string", default: "" },
    "source-context": { type: "string" },
    "source-schema": { type: "string" },
    "return-route": { type: "string" }
  }
};
class t extends e {
  static get wippyConfig() {
    return {
      propsSchema: l,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: [n, i, p].join(`
`)
    };
  }
  static get vueConfig() {
    return { rootComponent: m, plugins: [r] };
  }
}
async function k() {
  return t;
}
a(import.meta.url, t);
export {
  k as webComponent
};
