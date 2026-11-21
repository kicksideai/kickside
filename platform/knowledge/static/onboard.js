import { W as o, l as n } from "./wc-runtime-CPT3aEO7.js";
import { s as i } from "./styles-BmRm32vY.js";
import { define as r } from "@wippy-fe/proxy";
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "iframeCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return n(() => import("./Onboard-ByvwY2DX.js").then((t) => ({ rootComponent: t.default })), { surface: "compact", loading: "Loading the knowledge step…", failed: "Could not load the knowledge step. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function m() {
  return e;
}
r(import.meta.url, e);
export {
  m as webComponent
};
//# sourceMappingURL=onboard.js.map
