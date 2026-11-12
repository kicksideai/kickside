import { W as e, u as t } from "./wc-runtime-KO3cNuNo.js";
import { P as r } from "./primevue-plugin-CaP7wV_M.js";
import { l as i, s } from "./styles-CeBRcDSy.js";
import { p as n } from "./package-CCTUAjDf.js";
import "@iconify/vue";
import { define as p } from "@wippy-fe/proxy";
const m = i(
  () => import("./WebhookCreate-D8bf9cyr.js"),
  { loading: "Loading webhook form…", failed: "Could not load the webhook form. Reload the page to try again." },
  t
);
class o extends e {
  static get wippyConfig() {
    return {
      propsSchema: n.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return { rootComponent: m, plugins: [r] };
  }
}
async function c() {
  return o;
}
p(import.meta.url, o);
export {
  c as webComponent
};
//# sourceMappingURL=create.js.map
