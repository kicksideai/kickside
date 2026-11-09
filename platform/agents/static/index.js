import { W as o, u as s } from "./wc-runtime-KO3cNuNo.js";
import { a as p } from "./lazy-Cfv2E3SG.js";
import { s as n } from "./styles-BD-XFZ4L.js";
import "@iconify/vue";
import { define as r } from "@wippy-fe/proxy";
const i = { props: { type: "object", properties: {} } }, a = {
  wippy: i
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: a.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: n
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: p(
        () => import("./lazy-mount-EpZPRSvA.js").then((t) => t.mountConfig),
        "Could not load Agents. Reload the page to try again.",
        s
      )
    };
  }
}
async function c() {
  return e;
}
r(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=index.js.map
