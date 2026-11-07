import { W as t, u as o } from "./wc-runtime-CNDpK4lj.js";
import { l as r } from "./lazy-DRdPm-qk.js";
import { s as i } from "./styles-D_0ec_X7.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
const s = r(
  () => import("./SchemaForm-BOpOPds7.js"),
  { loading: "Loading schema form…", failed: "Could not load the schema form. Reload the page to try again." },
  o
), m = {
  type: "object",
  properties: {
    schema: { type: "object", description: "JSON Schema describing the config fields (object or JSON string)." },
    config: { type: "object", description: "Current config values." }
  }
};
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: m,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return { rootComponent: s };
  }
}
async function d() {
  return e;
}
n(import.meta.url, e);
export {
  d as webComponent
};
//# sourceMappingURL=schema_form.js.map
