import { W as o, l as r, P as s } from "./wc-runtime-BGqR6wyP.js";
import { p as n, w as i } from "./wc-mount-N7h56Ydz.js";
import { s as p } from "./workflow-embed-Cq35e5M9.js";
import { define as a } from "@wippy-fe/proxy";
const c = r(
  () => import("./WorkflowPicker-CFDEwwv6.js").then(({ default: e }) => ({ rootComponent: e, plugins: [s] })),
  { surface: "compact", loading: "Loading the Workflow picker…", failed: "Could not load the Workflow picker. Reload the page to try again." }
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
class t extends o {
  static get wippyConfig() {
    return {
      propsSchema: l,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: [n, i, p].join(`
`)
    };
  }
  static get vueConfig() {
    return c;
  }
}
async function y() {
  return t;
}
a(import.meta.url, t);
export {
  y as webComponent
};
