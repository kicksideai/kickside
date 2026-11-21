import { W as o, l as n, P as i } from "./wc-runtime-P07ojyjC.js";
import { s as r } from "./styles-DIj8rzS3.js";
import { define as s } from "@wippy-fe/proxy";
const p = {
  type: "object",
  properties: {
    // config carries { connection_id } as a JSON object; the host parser only
    // needs the top-level type here (WippyPropDefinition has no nested schema).
    config: { type: "object" },
    provider: { type: "string" },
    label: { type: "string" }
  }
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: p,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return n(() => import("./ConnectionTraitPicker-h60M9sAq.js").then((t) => ({ rootComponent: t.default, plugins: [i] })), { surface: "compact", loading: "Loading connection picker…", failed: "Could not load the connection picker. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function u() {
  return e;
}
s(import.meta.url, e);
export {
  u as webComponent
};
//# sourceMappingURL=connection_trait_picker.js.map
