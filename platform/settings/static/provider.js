import { W as o, l as i, P as n } from "./wc-runtime-4lROyJyk.js";
import { s as r } from "./styles-Bjo2-V-d.js";
import { define as s } from "@wippy-fe/proxy";
const p = { type: "object", properties: { config: { type: "object" } } };
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: p,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return i(() => import("./provider-Da6WZHYM.js").then((t) => ({ rootComponent: t.default, plugins: [n] })), { surface: "compact", loading: "Loading provider settings…", failed: "Could not load the provider settings. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function u() {
  return e;
}
s(import.meta.url, e);
export {
  u as webComponent
};
//# sourceMappingURL=provider.js.map
