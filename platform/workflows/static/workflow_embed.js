import { W as o, l as s, P as n } from "./wc-runtime-BGqR6wyP.js";
import { p as i, w as r } from "./wc-mount-N7h56Ydz.js";
import { s as p } from "./workflow-embed-Cq35e5M9.js";
import { define as a } from "@wippy-fe/proxy";
const l = [i, r, p].join(`
`), m = s(
  () => import("./EmbedWorkflow-DqUTM308.js").then(({ default: e }) => ({ rootComponent: e, plugins: [n] })),
  { surface: "compact", loading: "Loading the Workflow panel…", failed: "Could not load the Workflow panel. Reload the page to try again." }
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
      inlineCss: l
    };
  }
  static get vueConfig() {
    return m;
  }
}
async function C() {
  return t;
}
a(import.meta.url, t);
export {
  C as webComponent
};
