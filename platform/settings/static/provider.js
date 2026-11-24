import { W as t, P as o, a as i } from "./wc-runtime-56DLhE4T.js";
import { a as r } from "./lazy-ZWC1tvFC.js";
import { s } from "./styles-BwCnGIq7.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
const p = r(
  () => import("./provider-B9bfYYG6.js"),
  { loading: "Loading provider settings…", failed: "Could not load the provider settings. Reload the page to try again." },
  i
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
    return { rootComponent: p, plugins: [o] };
  }
}
async function f() {
  return e;
}
n(import.meta.url, e);
export {
  f as webComponent
};
//# sourceMappingURL=provider.js.map
