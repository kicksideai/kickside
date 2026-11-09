import { W as o, u as s } from "./wc-runtime-KO3cNuNo.js";
import { s as i, a as r } from "./styles-BRRHt6og.js";
import { p as n } from "./package-CCTUAjDf.js";
import "@iconify/vue";
import { define as p } from "@wippy-fe/proxy";
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: n.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: r(
        () => import("./lazy-mount-S_NHlwab.js").then((t) => t.mountConfig),
        "Could not load the Webhooks page. Reload the page to try again.",
        s
      )
    };
  }
}
async function C() {
  return e;
}
p(import.meta.url, e);
export {
  C as webComponent
};
//# sourceMappingURL=index.js.map
