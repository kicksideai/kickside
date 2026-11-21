import { W as t, l as i } from "./wc-runtime-BQHcLGi8.js";
import { s } from "./styles-DkVjMRNl.js";
import { p as n } from "./package-CCTUAjDf.js";
import { define as r } from "@wippy-fe/proxy";
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: n.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return {
      ...i(() => import("./lazy-mount-DRd6B8d1.js").then((o) => o.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load the Webhooks page. Reload the page to try again.", timeout: 3e4 })
    };
  }
}
async function f() {
  return e;
}
r(import.meta.url, e);
export {
  f as webComponent
};
//# sourceMappingURL=index.js.map
