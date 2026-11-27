import { W as o, l as i } from "./wc-runtime-Vcu3yWjv.js";
import { s as r } from "./styles-CjMSijHF.js";
import { define as s } from "@wippy-fe/proxy";
const n = {
  type: "object",
  properties: {
    schema: { type: "object", description: "JSON Schema describing the config fields (object or JSON string)." },
    config: { type: "object", description: "Current config values." },
    "field-errors": { type: "object", description: "Server validation messages by field key." },
    "allow-unset": { type: "boolean", description: "Allow missing overrides to inherit from the host." },
    choices: { type: "object", description: "Named choice sets of {value, label} that fields select through x-choices." },
    disabled: { type: "boolean", description: "Disable every control." }
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
      inlineCss: r
    };
  }
  static get vueConfig() {
    return i(() => import("./SchemaForm-D6SdLeOR.js").then((e) => ({ rootComponent: e.default })), { surface: "compact", loading: "Loading schema form…", failed: "Could not load the schema form. Reload the page to try again.", delay: 200, timeout: 3e4 });
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
