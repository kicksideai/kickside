import { W as o, u as e } from "./wc-runtime-KO3cNuNo.js";
import { P as r } from "./primevue-plugin-CaP7wV_M.js";
import { l as s } from "./lazy-Cfv2E3SG.js";
import { p as n, w as i } from "./wc-mount-N7h56Ydz.js";
import { s as p } from "./workflow-embed-BX8EY-U_.js";
import "@iconify/vue";
import { define as l } from "@wippy-fe/proxy";
const m = [n, i, p].join(`
`), a = s(
  () => import("./EmbedWorkflow-06aY-bS8.js"),
  { loading: "Loading the Workflow panel…", failed: "Could not load the Workflow panel. Reload the page to try again." },
  e
), f = {
  type: "object",
  properties: {
    "flow-id": { type: "string" },
    input: { type: "string" },
    mode: { type: "string" },
    label: { type: "string" }
  }
};
class t extends o {
  static get wippyConfig() {
    return {
      propsSchema: f,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: m
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [r] };
  }
}
async function k() {
  return t;
}
l(import.meta.url, t);
export {
  k as webComponent
};
