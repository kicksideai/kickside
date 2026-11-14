import { W as s, a as o } from "./wc-runtime-DjtZy7dL.js";
import { l as i } from "./lazy-ZWC1tvFC.js";
import { s as n } from "./styles-D9m6R71p.js";
import "@iconify/vue";
import { define as p } from "@wippy-fe/proxy";
const r = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link to a settings block by key. Unset selects the first block." } } } }, a = {
  wippy: r
};
class t extends s {
  static get wippyConfig() {
    return {
      propsSchema: a.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: n
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: i(
        () => import("./lazy-mount-D6foRIAw.js").then((e) => e.mountConfig),
        "Could not load Settings. Reload the page to try again.",
        o
      )
    };
  }
}
async function u() {
  return t;
}
p(import.meta.url, t);
export {
  u as webComponent
};
//# sourceMappingURL=index.js.map
