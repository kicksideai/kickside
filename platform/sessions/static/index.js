import { W as s, m as o } from "./wc-runtime-D-UdhneU.js";
import { s as i } from "./styles-Dhq3lUU_.js";
import { define as n } from "@wippy-fe/proxy";
const r = { props: { type: "object", properties: { mode: { type: "string", default: "manager", description: "manager (default) or sidebar" }, "active-session-id": { type: "string", description: "Session currently rendered by the app-owned chat panel.", default: "" }, "artifacts-active": { type: "boolean", default: !1, description: "Whether the cross-session artifact gallery owns the adjacent workspace." } } } }, a = {
  wippy: r
};
class e extends s {
  static get wippyConfig() {
    return {
      propsSchema: a.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return {
      ...o(() => import("./index-mount-BZvtMgN4.js").then((t) => t.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load the sessions list. Reload the page to try again.", timeout: 3e4 })
    };
  }
}
async function m() {
  return e;
}
n(import.meta.url, e);
export {
  m as webComponent
};
//# sourceMappingURL=index.js.map
