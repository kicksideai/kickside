import { W as o, l as s } from "./wc-runtime-BREvwtdZ.js";
import { s as i } from "./styles-5upERzQv.js";
import { define as n } from "@wippy-fe/proxy";
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
      ...s(() => import("./lazy-mount-B6kci4qV.js").then((t) => t.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load Agents. Reload the page to try again.", timeout: 3e4 })
    };
  }
}
async function u() {
  return e;
}
n(import.meta.url, e);
export {
  u as webComponent
};
//# sourceMappingURL=index.js.map
