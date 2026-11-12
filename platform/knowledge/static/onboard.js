import { u as t, W as o } from "./wc-runtime-ClNbKZcC.js";
import { a as n } from "./lazy-ZWC1tvFC.js";
import { s as r } from "./styles-BshrLSUT.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const i = n(
  () => import("./Onboard-CEn_zJSv.js"),
  { loading: "Loading the knowledge step…", failed: "Could not load the knowledge step. Reload the page to try again." },
  t
);
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "iframeCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return { rootComponent: i };
  }
}
async function f() {
  return e;
}
s(import.meta.url, e);
export {
  f as webComponent
};
//# sourceMappingURL=onboard.js.map
