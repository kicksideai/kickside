import { W as o, l as i } from "./wc-runtime-Vcu3yWjv.js";
import { s as n } from "./styles-Bly5VSV3.js";
import { define as r } from "@wippy-fe/proxy";
const s = {
  type: "object",
  properties: {
    schema: { type: "object", description: "JSON Schema describing the config fields (object or JSON string)." },
    config: { type: "object", description: "Current config values." }
  }
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: s,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: n
    };
  }
  static get vueConfig() {
    return i(() => import("./SchemaForm-BV12HZUk.js").then((t) => ({ rootComponent: t.default })), { surface: "compact", loading: "Loading schema form…", failed: "Could not load the schema form. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function f() {
  return e;
}
r(import.meta.url, e);
export {
  f as webComponent
};
//# sourceMappingURL=schema_form.js.map
