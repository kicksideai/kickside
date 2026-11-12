import { W as t, u as o } from "./wc-runtime-ClNbKZcC.js";
import { P as n } from "./primevue-plugin-CaP7wV_M.js";
import { a as i } from "./lazy-ZWC1tvFC.js";
import { s as r } from "./styles-CHMxyTb6.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const a = i(
  () => import("./KbCreate-CK3HEYIr.js"),
  { loading: "Loading the new knowledge base dialog…", failed: "Could not load the new knowledge base dialog. Reload the page to try again." },
  o
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
      inlineCss: r
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [n] };
  }
}
async function c() {
  return e;
}
s(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=kb_create.js.map
