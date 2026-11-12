import { W as o, u as n } from "./wc-runtime-ClNbKZcC.js";
import { l as p } from "./lazy-ZWC1tvFC.js";
import { s as i } from "./styles-BDRVQk7J.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const r = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, a = {
  wippy: r
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: a.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: p(
        () => import("./lazy-mount-mKVD1SzE.js").then((t) => t.mountConfig),
        "Could not load Knowledge. Reload the page to try again.",
        n
      )
    };
  }
}
async function f() {
  return e;
}
s(import.meta.url, e);
export {
  f as webComponent
};
//# sourceMappingURL=index.js.map
