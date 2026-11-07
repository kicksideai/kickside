import { W as t, u as o } from "./wc-runtime-KO3cNuNo.js";
import { P as n } from "./primevue-plugin-CaP7wV_M.js";
import { l as s, s as r } from "./styles-Bk4mTgjb.js";
import "@iconify/vue";
import { define as i } from "@wippy-fe/proxy";
const a = s(
  () => import("./Onboard-DKSyiYo4.js"),
  { loading: "Loading services…", failed: "Could not load the connections step. Reload the page to try again." },
  o
);
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "iframeCssUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [n] };
  }
}
async function d() {
  return e;
}
i(import.meta.url, e);
export {
  d as webComponent
};
//# sourceMappingURL=onboard.js.map
