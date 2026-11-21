import { W as o, l as i } from "./wc-runtime-Chhe4T5p.js";
import { s as p } from "./styles-CWE-Yg9I.js";
import { define as s } from "@wippy-fe/proxy";
const n = { props: { type: "object", properties: {} } }, r = {
  wippy: n
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: r.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: p
    };
  }
  static get vueConfig() {
    return {
      ...i(() => import("./lazy-mount-C-7Te4jf.js").then((t) => t.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load the Modules page. Reload the page to try again.", timeout: 3e4 })
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
