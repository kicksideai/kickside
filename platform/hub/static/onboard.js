import { W as o, P as t, u as n } from "./wc-runtime-Bo_8bBDp.js";
import { a as s, s as i } from "./styles-DWmFMkWO.js";
import "@iconify/vue";
import { define as r } from "@wippy-fe/proxy";
const a = s(
  () => import("./OnboardRecommendations-TyHKWOcM.js"),
  { loading: "Loading module recommendations…", failed: "Could not load module recommendations. Reload the page to try again." },
  n
);
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [t] };
  }
}
async function c() {
  return e;
}
r(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=onboard.js.map
