import { W as s, c as o } from "./wc-runtime-BJD-5iaH.js";
import { l as i } from "./lazy-DX8B4FNv.js";
import { s as r } from "./styles-CKLWbXzy.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
const a = { props: { type: "object", properties: { mode: { type: "string", default: "manager", description: "manager (default) or sidebar" }, "active-session-id": { type: "string", description: "Session currently rendered by the app-owned chat panel.", default: "" }, "artifacts-active": { type: "boolean", default: !1, description: "Whether the cross-session artifact gallery owns the adjacent workspace." } } } }, p = {
  wippy: a
};
class e extends s {
  static get wippyConfig() {
    return {
      propsSchema: p.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: i(
        () => import("./index-mount-Cjm-8Ijp.js").then((t) => t.mountConfig),
        "Could not load the sessions list. Reload the page to try again.",
        o
      )
    };
  }
}
async function g() {
  return e;
}
n(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=index.js.map
