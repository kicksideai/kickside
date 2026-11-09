import { W as t, u as o } from "./wc-runtime-KO3cNuNo.js";
import { P as r } from "./primevue-plugin-CaP7wV_M.js";
import { l as s } from "./lazy-Cfv2E3SG.js";
import { p as i } from "./pickerselect-CshmdhGQ.js";
import { s as n } from "./workflow-embed-DqDlVIkB.js";
import "@iconify/vue";
import { define as p } from "@wippy-fe/proxy";
const m = s(
  () => import("./WorkflowPicker-P9ppG2XT.js"),
  { loading: "Loading the Workflow picker…", failed: "Could not load the Workflow picker. Reload the page to try again." },
  o
), a = {
  type: "object",
  properties: {
    config: { type: "string", default: "{}" },
    schema: { type: "string", default: "" },
    "source-context": { type: "string" },
    "source-schema": { type: "string" },
    "return-route": { type: "string" }
  }
};
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: a,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: [i, n].join(`
`)
    };
  }
  static get vueConfig() {
    return { rootComponent: m, plugins: [r] };
  }
}
async function h() {
  return e;
}
p(import.meta.url, e);
export {
  h as webComponent
};
