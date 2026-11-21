import { W as i, l as o, P as a } from "./wc-runtime-BREvwtdZ.js";
import { s } from "./styles-5upERzQv.js";
import { define as n } from "@wippy-fe/proxy";
const r = {
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
};
class e extends i {
  static get wippyConfig() {
    return {
      propsSchema: r,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return o(() => import("./MasterNamespacePicker-C5SdUgDW.js").then((t) => ({ rootComponent: t.default, plugins: [a] })), { surface: "compact", loading: "Loading capability scope picker…", failed: "Could not load the capability scope picker. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function g() {
  return e;
}
n(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=master_picker.js.map
