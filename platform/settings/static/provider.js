import { W as t, a as o } from "./wc-runtime-DjtZy7dL.js";
import { P as r } from "./primevue-plugin-CaP7wV_M.js";
import { a as i } from "./lazy-ZWC1tvFC.js";
import { s } from "./styles-C0mQL9CY.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
const p = i(
  () => import("./provider--ubuNP59.js"),
  { loading: "Loading provider settings…", failed: "Could not load the provider settings. Reload the page to try again." },
  o
), a = { type: "object", properties: { config: { type: "object" } } };
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: a,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return { rootComponent: p, plugins: [r] };
  }
}
async function C() {
  return e;
}
n(import.meta.url, e);
export {
  C as webComponent
};
//# sourceMappingURL=provider.js.map
