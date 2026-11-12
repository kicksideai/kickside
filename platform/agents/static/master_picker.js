import { W as t, u as i } from "./wc-runtime-KO3cNuNo.js";
import { P as o } from "./primevue-plugin-CaP7wV_M.js";
import { l as a } from "./lazy-Cfv2E3SG.js";
import { s } from "./styles-C5MTfWEG.js";
import "@iconify/vue";
import { define as r } from "@wippy-fe/proxy";
const n = {
  type: "object",
  properties: {
    schema: {
      type: "object",
      description: "Capability context schema; controls the available configuration fields."
    },
    config: {
      type: "object",
      description: "Capability context: { namespaces: string[], trait_ids: string[], inject_trait_catalog: boolean }"
    }
  }
}, p = a(
  () => import("./MasterNamespacePicker-CbuPfeY2.js"),
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
async function d() {
  return e;
}
r(import.meta.url, e);
export {
  d as webComponent
};
//# sourceMappingURL=master_picker.js.map
