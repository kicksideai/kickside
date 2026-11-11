import { W as o, u as t } from "./wc-runtime-BMe_f3Uc.js";
import { P as n } from "./primevue-plugin-CaP7wV_M.js";
import { a as r, s } from "./styles-DWmFMkWO.js";
import "@iconify/vue";
import { define as i } from "@wippy-fe/proxy";
const m = r(
  () => import("./OnboardRecommendations-IVfpor_r.js"),
  { loading: "Loading module recommendations…", failed: "Could not load module recommendations. Reload the page to try again." },
  t
);
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return { rootComponent: m, plugins: [n] };
  }
}
async function g() {
  return e;
}
i(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=onboard.js.map
