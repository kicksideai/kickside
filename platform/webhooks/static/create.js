import { W as e, P as t, u as r } from "./wc-runtime-pqFrgqFa.js";
import { l as s, s as i } from "./styles-pKw_zLKY.js";
import { p as n } from "./package-CCTUAjDf.js";
import "@iconify/vue";
import { define as p } from "@wippy-fe/proxy";
const a = s(
  () => import("./WebhookCreate-BpKiX3XI.js"),
  { loading: "Loading webhook form…", failed: "Could not load the webhook form. Reload the page to try again." },
  r
);
class o extends e {
  static get wippyConfig() {
    return {
      propsSchema: n.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [t] };
  }
}
async function d() {
  return o;
}
p(import.meta.url, o);
export {
  d as webComponent
};
//# sourceMappingURL=create.js.map
