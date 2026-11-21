import { W as o, l as n, P as i } from "./wc-runtime-CPT3aEO7.js";
import { s } from "./styles-BmRm32vY.js";
import { define as a } from "@wippy-fe/proxy";
const r = {
  type: "object",
  properties: {
    "parent-id": { type: "string" }
  }
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: r,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return n(() => import("./KbCreate-BNMkotRw.js").then((t) => ({ rootComponent: t.default, plugins: [i] })), { surface: "compact", loading: "Loading the new knowledge base dialog…", failed: "Could not load the new knowledge base dialog. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function d() {
  return e;
}
a(import.meta.url, e);
export {
  d as webComponent
};
//# sourceMappingURL=kb_create.js.map
