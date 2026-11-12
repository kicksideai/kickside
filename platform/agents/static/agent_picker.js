import { W as t, u as o } from "./wc-runtime-KO3cNuNo.js";
import { P as r } from "./primevue-plugin-CaP7wV_M.js";
import { l as i } from "./lazy-Cfv2E3SG.js";
import { s as n } from "./styles-DyVDM2ng.js";
import "@iconify/vue";
import { define as s } from "@wippy-fe/proxy";
const p = {
  type: "object",
  properties: {
    selected: { type: "array", items: { type: "string" }, default: [] },
    multi: { type: "boolean", default: !0 },
    placeholder: { type: "string" },
    config: { type: "string", default: "" },
    schema: { type: "string", default: "" }
  }
}, a = i(
  () => import("./AgentPicker-Bp9dT3eO.js"),
  { loading: "Loading agent picker…", failed: "Could not load the agent picker. Reload the page to try again.", iconOnly: !0 },
  o
);
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: p,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: n
    };
  }
  static get vueConfig() {
    return { rootComponent: a, plugins: [r] };
  }
}
async function d() {
  return e;
}
s(import.meta.url, e);
export {
  d as webComponent
};
//# sourceMappingURL=agent_picker.js.map
