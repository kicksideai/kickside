import { W as o, l as s } from "./wc-runtime-4lROyJyk.js";
import { s as i } from "./styles-Bjo2-V-d.js";
import { define as n } from "@wippy-fe/proxy";
const p = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link to a settings block by key. Unset selects the first block." } } } }, r = {
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
      ...s(() => import("./lazy-mount-BY-M8ZX8.js").then((t) => t.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load Settings. Reload the page to try again.", timeout: 3e4 })
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
