import { W as o, u as t } from "./wc-runtime-BOOCbdbY.js";
import { l as r } from "./lazy-BTFbj8TG.js";
import { s as i } from "./styles-u6QaslH2.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const n = r(
  () => import("./SchemaForm-Cjz2rnMg.js"),
  { loading: "Loading schema form…", failed: "Could not load the schema form. Reload the page to try again." },
  t
), a = {
  type: "object",
  properties: {
    schema: { type: "object", description: "JSON Schema describing the config fields (object or JSON string)." },
    config: { type: "object", description: "Current config values." },
    "field-errors": { type: "object", description: "Server validation messages by field key." },
    "allow-unset": { type: "boolean", description: "Allow missing overrides to inherit from the host." }
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
async function g() {
  return e;
}
s(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=schema_form.js.map
