import { W as o, c as r } from "./wc-runtime-BJD-5iaH.js";
import { l as i } from "./lazy-DX8B4FNv.js";
import { s } from "./styles-CKLWbXzy.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: i(
        () => import("./artifacts-mount-DccQr7lc.js").then((t) => t.mountConfig),
        "Could not load the artifact gallery. Reload the page to try again.",
        r
      )
    };
  }
}
async function g() {
  return e;
}
n(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=artifacts.js.map
