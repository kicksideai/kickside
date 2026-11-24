import { W as t, P as o, u as s } from "./wc-runtime-CHL0PH8L.js";
import { a as r, s as n } from "./styles-Da9ZOhuE.js";
import "@iconify/vue";
import { define as i } from "@wippy-fe/proxy";
const a = r(
  () => import("./Onboard-CRyYyDhK.js"),
  { loading: "Loading model setup…", failed: "Could not load the model setup. Reload the page to try again." },
  s
);
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl", "iframeCssUrl"],
      inlineCss: n
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [o] };
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
