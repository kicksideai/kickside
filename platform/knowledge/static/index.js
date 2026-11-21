import { W as o, l as n } from "./wc-runtime-CPT3aEO7.js";
import { s as i } from "./styles-BmRm32vY.js";
import { define as p } from "@wippy-fe/proxy";
const s = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, r = {
  wippy: s
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
      ...n(() => import("./lazy-mount-DZ7wwJ5Y.js").then((t) => t.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load Knowledge. Reload the page to try again.", timeout: 3e4 })
    };
  }
}
async function m() {
  return e;
}
p(import.meta.url, e);
export {
  m as webComponent
};
//# sourceMappingURL=index.js.map
