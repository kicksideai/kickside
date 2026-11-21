import { W as o, l as n } from "./wc-runtime-P07ojyjC.js";
import { s as i } from "./styles-DIj8rzS3.js";
import { define as s } from "@wippy-fe/proxy";
const p = { props: { type: "object", properties: {} } }, r = {
  wippy: p
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: r.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return {
      ...n(() => import("./lazy-mount-Da0JsVGz.js").then((t) => t.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load the connections page. Reload the page to try again.", timeout: 3e4 })
    };
  }
}
async function g() {
  return e;
}
s(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=index.js.map
