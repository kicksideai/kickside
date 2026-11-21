import { W as o, l as n, P as a } from "./wc-runtime-B0OetHdg.js";
import { s as i } from "./styles-CAHyBPNr.js";
import { define as s } from "@wippy-fe/proxy";
const r = {
  type: "object",
  properties: {
    // Config-host convention: { id } names the installed data sync; value is its alias.
    config: { type: "object" },
    value: { type: "object" }
  }
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: r,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return n(() => import("./SyncManage-Bi-edJC0.js").then((t) => ({ rootComponent: t.default, plugins: [a] })), { surface: "compact", loading: "Loading data sync…", failed: "Could not load the data sync. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function u() {
  return e;
}
s(import.meta.url, e);
export {
  u as webComponent
};
//# sourceMappingURL=sync_manage.js.map
