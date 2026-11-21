import { W as o, l as n, P as i } from "./wc-runtime-P07ojyjC.js";
import { s } from "./styles-DIj8rzS3.js";
import { define as r } from "@wippy-fe/proxy";
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "iframeCssUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return n(() => import("./Onboard-CMqiolRW.js").then((t) => ({ rootComponent: t.default, plugins: [i] })), { surface: "compact", loading: "Loading services…", failed: "Could not load the connections step. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function u() {
  return e;
}
r(import.meta.url, e);
export {
  u as webComponent
};
//# sourceMappingURL=onboard.js.map
