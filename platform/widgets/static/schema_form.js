import { W as o, l as r } from "./wc-runtime-Vcu3yWjv.js";
import { s as i } from "./styles-ClsKOrU6.js";
import { define as s } from "@wippy-fe/proxy";
const n = {
  type: "object",
  properties: {
    schema: { type: "object", description: "JSON Schema describing the config fields (object or JSON string)." },
    config: { type: "object", description: "Current config values." },
    "field-errors": { type: "object", description: "Server validation messages by field key." },
    "allow-unset": { type: "boolean", description: "Allow missing overrides to inherit from the host." }
  }
};
class t extends o {
  reportValidity() {
    return this.shadowRoot?.querySelector("form.sf")?.dispatchEvent(new Event("schema-form-report", { cancelable: !0 })) ?? !1;
  }
  static get wippyConfig() {
    return {
      propsSchema: n,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return r(() => import("./SchemaForm-ByDx381X.js").then((e) => ({ rootComponent: e.default })), { surface: "compact", loading: "Loading schema form…", failed: "Could not load the schema form. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function p() {
  return t;
}
s(import.meta.url, t);
export {
  p as webComponent
};
//# sourceMappingURL=schema_form.js.map
