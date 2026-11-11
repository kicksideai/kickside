import { W as t, u as o } from "./wc-runtime-ClNbKZcC.js";
import { P as s } from "./primevue-plugin-CaP7wV_M.js";
import { a as r, s as i } from "./styles-BXel5-_o.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
const a = r(
  () => import("./Onboard-CUxWv_Nd.js"),
  { loading: "Loading model setup…", failed: "Could not load the model setup. Reload the page to try again." },
  o
);
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl", "iframeCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [s] };
  }
}
async function g() {
  return e;
}
n(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=onboard.js.map
