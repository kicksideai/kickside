import { W as o, u as t } from "./wc-runtime-BOOCbdbY.js";
import { l as r } from "./lazy-BTFbj8TG.js";
import { s as i } from "./styles-DF6UJ6bF.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const n = r(
  () => import("./SchemaForm-B8irWK-G.js"),
  { loading: "Loading schema form…", failed: "Could not load the schema form. Reload the page to try again." },
  t
), a = {
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
class e extends o {
  reportValidity() {
    return this.shadowRoot?.querySelector("form.sf")?.dispatchEvent(new Event("schema-form-report", { cancelable: !0 })) ?? !1;
  }
  static get wippyConfig() {
    return {
      propsSchema: a,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return { rootComponent: n };
  }
}
async function y() {
  return e;
}
s(import.meta.url, e);
export {
  y as webComponent
};
//# sourceMappingURL=schema_form.js.map
