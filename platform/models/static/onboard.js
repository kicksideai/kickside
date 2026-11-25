import { W as o, l as s, P as i } from "./wc-runtime-DYOSFvWw.js";
import { s as r } from "./styles-JRSdLrvT.js";
import { define as n } from "@wippy-fe/proxy";
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl", "iframeCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return s(() => import("./Onboard-pnGjbhxJ.js").then((t) => ({ rootComponent: t.default, plugins: [i] })), { surface: "compact", loading: "Loading model setup…", failed: "Could not load the model setup. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function u() {
  return e;
}
n(import.meta.url, e);
export {
  u as webComponent
};
//# sourceMappingURL=onboard.js.map
