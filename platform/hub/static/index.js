import { W as o, u as s } from "./wc-runtime-BMe_f3Uc.js";
import { s as p, l as i } from "./styles-kyFtUd6n.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
const r = { props: { type: "object", properties: {} } }, a = {
  wippy: r
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: a.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: p
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: i(
        () => import("./lazy-mount-CZnH5BHj.js").then((t) => t.mountConfig),
        "Could not load the Modules page. Reload the page to try again.",
        s
      )
    };
  }
}
async function c() {
  return e;
}
n(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=index.js.map
