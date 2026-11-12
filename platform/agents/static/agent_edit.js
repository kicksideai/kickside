import { W as e, u as o } from "./wc-runtime-KO3cNuNo.js";
import { P as i } from "./primevue-plugin-CaP7wV_M.js";
import { l as n } from "./lazy-Cfv2E3SG.js";
import { s as r } from "./styles-C5MTfWEG.js";
import "@iconify/vue";
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
}, m = n(
  () => import("./AgentEdit-DbW3Doro.js"),
  { loading: "Loading agent editor…", failed: "Could not load the agent editor. Reload the page to try again." },
  o
);
class t extends e {
  static get wippyConfig() {
    return {
      propsSchema: p,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return { rootComponent: m, plugins: [i] };
  }
}
async function f() {
  return t;
}
s(import.meta.url, t);
export {
  f as webComponent
};
//# sourceMappingURL=agent_edit.js.map
