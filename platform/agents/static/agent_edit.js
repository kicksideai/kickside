import { W as i, l as n, P as o } from "./wc-runtime-BREvwtdZ.js";
import { s as r } from "./styles-5upERzQv.js";
import { define as s } from "@wippy-fe/proxy";
const p = {
  type: "object",
  properties: {
    route: { type: "string" },
    "parent-id": { type: "string" },
    "component-id": { type: "string" },
    "entry-id": { type: "string" },
    mode: { type: "string" }
  }
};
class e extends i {
  static get wippyConfig() {
    return {
      propsSchema: p,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return n(() => import("./AgentEdit-BcbogHVc.js").then((t) => ({ rootComponent: t.default, plugins: [o] })), { surface: "compact", loading: "Loading agent editor…", failed: "Could not load the agent editor. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function d() {
  return e;
}
s(import.meta.url, e);
export {
  d as webComponent
};
//# sourceMappingURL=agent_edit.js.map
