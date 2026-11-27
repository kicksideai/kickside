import { W as i, l as n, P as o } from "./wc-runtime-BREvwtdZ.js";
import { s as r } from "./styles-5upERzQv.js";
import { define as a } from "@wippy-fe/proxy";
const s = {
  type: "object",
  properties: {
    selected: { type: "array", items: { type: "string" }, default: [] },
    multi: { type: "boolean", default: !0 },
    placeholder: { type: "string" },
    config: { type: "string", default: "" },
    schema: { type: "string", default: "" }
  }
};
class e extends i {
  static get wippyConfig() {
    return {
      propsSchema: s,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return n(() => import("./AgentPicker-Dh8T0K-L.js").then((t) => ({ rootComponent: t.default, plugins: [o] })), { surface: "compact", loading: "Loading agent picker…", failed: "Could not load the agent picker. Reload the page to try again.", iconOnly: !0, delay: 200, timeout: 3e4 });
  }
}
async function c() {
  return e;
}
a(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=agent_picker.js.map
