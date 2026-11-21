import { W as t, l as n, P as i } from "./wc-runtime-Chhe4T5p.js";
import { s as r } from "./styles-CWE-Yg9I.js";
import { define as s } from "@wippy-fe/proxy";
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return n(() => import("./OnboardRecommendations-BSCtc2H3.js").then((o) => ({ rootComponent: o.default, plugins: [i] })), { surface: "compact", loading: "Loading module recommendations…", failed: "Could not load module recommendations. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function u() {
  return e;
}
s(import.meta.url, e);
export {
  u as webComponent
};
//# sourceMappingURL=onboard.js.map
