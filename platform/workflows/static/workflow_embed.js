import { W as e, u as o } from "./wc-runtime-KO3cNuNo.js";
import { P as r } from "./primevue-plugin-CaP7wV_M.js";
import { l as n } from "./lazy-Cfv2E3SG.js";
import { p as s } from "./pickerselect-CshmdhGQ.js";
import { s as i } from "./workflow-embed-BX8EY-U_.js";
import "@iconify/vue";
import { define as p } from "@wippy-fe/proxy";
const l = [s, i].join(`
`), m = n(
  () => import("./EmbedWorkflow-Bb3YtGHU.js"),
  { loading: "Loading the Workflow panel…", failed: "Could not load the Workflow panel. Reload the page to try again." },
  o
), a = {
  type: "object",
  properties: {
    "flow-id": { type: "string" },
    input: { type: "string" },
    mode: { type: "string" },
    label: { type: "string" }
  }
};
class t extends e {
  static get wippyConfig() {
    return {
      propsSchema: a,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: l
    };
  }
  static get vueConfig() {
    return { rootComponent: m, plugins: [r] };
  }
}
async function h() {
  return t;
}
p(import.meta.url, t);
export {
  h as webComponent
};
