import { W as t, l as i, P as r } from "./wc-runtime-BQHcLGi8.js";
import { s as n } from "./styles-DkVjMRNl.js";
import { p as s } from "./package-CCTUAjDf.js";
import { define as a } from "@wippy-fe/proxy";
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: s.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: n
    };
  }
  static get vueConfig() {
    return i(() => import("./WebhookCreate-Ut85Oh7O.js").then((o) => ({ rootComponent: o.default, plugins: [r] })), { surface: "compact", loading: "Loading webhook form…", failed: "Could not load the webhook form. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function g() {
  return e;
}
a(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=create.js.map
