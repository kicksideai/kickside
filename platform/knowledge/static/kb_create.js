import { W as t, P as o, u as n } from "./wc-runtime-Bmxpx-Ro.js";
import { a as i } from "./lazy-ZWC1tvFC.js";
import { s } from "./styles-CmO1WNG3.js";
import "@iconify/vue";
import { define as r } from "@wippy-fe/proxy";
const a = i(
  () => import("./KbCreate-wzgAD-1i.js"),
  { loading: "Loading the new knowledge base dialog…", failed: "Could not load the new knowledge base dialog. Reload the page to try again." },
  n
), p = {
  type: "object",
  properties: {
    "parent-id": { type: "string" }
  }
};
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: p,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [o] };
  }
}
async function c() {
  return e;
}
r(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=kb_create.js.map
