import { W as t, P as o, u as n } from "./wc-runtime-Bcuhsx-0.js";
import { l as s, s as i } from "./styles-UELhE1cW.js";
import "@iconify/vue";
import { define as r } from "@wippy-fe/proxy";
const a = s(
  () => import("./Onboard-Mutx3bgb.js"),
  { loading: "Loading services…", failed: "Could not load the connections step. Reload the page to try again." },
  n
);
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "iframeCssUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [o] };
  }
}
async function C() {
  return e;
}
r(import.meta.url, e);
export {
  C as webComponent
};
//# sourceMappingURL=onboard.js.map
