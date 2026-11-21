import { W as n, l as o, P as s } from "./wc-runtime-Vcu3yWjv.js";
import { s as i } from "./styles-Co3ikzd7.js";
import { define as r } from "@wippy-fe/proxy";
const a = {
  type: "object",
  properties: {
    config: { type: "object" },
    value: { type: "object" }
  }
};
class e extends n {
  static get wippyConfig() {
    return {
      propsSchema: a,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return o(() => import("./ChannelResponderManage-CEQ30pGi.js").then((t) => ({ rootComponent: t.default, plugins: [s] })), { surface: "compact", loading: "Loading channel responder settings…", failed: "Could not load the channel responder settings. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function u() {
  return e;
}
r(import.meta.url, e);
export {
  u as webComponent
};
//# sourceMappingURL=channel_responder_manage.js.map
