import { W as t, u as o } from "./wc-runtime-KO3cNuNo.js";
import { P as n } from "./primevue-plugin-CaP7wV_M.js";
import { l as i, s as r } from "./styles-LyS_4lzj.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const p = i(
  () => import("./ConnectionTraitPicker-3eGysQg5.js"),
  { loading: "Loading connection picker…", failed: "Could not load the connection picker. Reload the page to try again." },
  o
), a = {
  type: "object",
  properties: {
    // config carries { connection_id } as a JSON object; the host parser only
    // needs the top-level type here (WippyPropDefinition has no nested schema).
    config: { type: "object" },
    provider: { type: "string" },
    label: { type: "string" }
  }
};
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: a,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return { rootComponent: p, plugins: [n] };
  }
}
async function y() {
  return e;
}
s(import.meta.url, e);
export {
  y as webComponent
};
//# sourceMappingURL=connection_trait_picker.js.map
