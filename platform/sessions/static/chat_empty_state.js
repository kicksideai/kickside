import { W as o, c as r } from "./wc-runtime-BJD-5iaH.js";
import { l as s } from "./lazy-DX8B4FNv.js";
import { s as i } from "./styles-BfuGB-97.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
class t extends o {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: s(
        () => import("./chat_empty_state-mount-qlEp1gLJ.js").then((e) => e.mountConfig),
        "Could not load the chat start screen. Reload the page to try again.",
        r
      )
    };
  }
}
async function u() {
  return t;
}
n(import.meta.url, t);
export {
  u as webComponent
};
//# sourceMappingURL=chat_empty_state.js.map
