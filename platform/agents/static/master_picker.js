import { W as t, u as i } from "./wc-runtime-KO3cNuNo.js";
import { P as o } from "./primevue-plugin-CaP7wV_M.js";
import { l as r } from "./lazy-CHftQ23z.js";
import { s } from "./styles-CWcqMiwK.js";
import "@iconify/vue";
import { define as a } from "@wippy-fe/proxy";
const n = {
  type: "object",
  properties: {
    config: {
      type: "object",
      description: "Capability context: { namespaces: string[], trait_ids: string[], inject_trait_catalog: boolean }"
    }
  }
}, p = r(
  () => import("./MasterNamespacePicker-CUrceSK3.js"),
  { loading: "Loading capability scope picker…", failed: "Could not load the capability scope picker. Reload the page to try again." },
  i
);
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: n,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return { rootComponent: p, plugins: [o] };
  }
}
async function C() {
  return e;
}
a(import.meta.url, e);
export {
  C as webComponent
};
//# sourceMappingURL=master_picker.js.map
