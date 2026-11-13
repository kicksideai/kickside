import { W as o, u as n } from "./wc-runtime-KO3cNuNo.js";
import { s, a as p } from "./styles-LyS_4lzj.js";
import "@iconify/vue";
import { define as i } from "@wippy-fe/proxy";
const r = { props: { type: "object", properties: {} } }, a = {
  wippy: r
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: a.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: p(
        () => import("./lazy-mount-ketwsm4K.js").then((t) => t.mountConfig),
        "Could not load the connections page. Reload the page to try again.",
        n
      )
    };
  }
}
async function y() {
  return e;
}
i(import.meta.url, e);
export {
  y as webComponent
};
//# sourceMappingURL=index.js.map
