import { W as o, l as i } from "./wc-runtime-BQHcLGi8.js";
import { s as a } from "./styles-DkVjMRNl.js";
import { define as n } from "@wippy-fe/proxy";
const r = {
  type: "object",
  properties: {
    value: { type: "string", default: "", description: "Selected webhook: a JSON object string {thread_id} or a bare id." },
    config: { type: "string", default: "", description: "Alias of value used by the data-flow config form." }
  }
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: r,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: a
    };
  }
  static get vueConfig() {
    return i(() => import("./WebhookSourceDetail-BsexOJ-g.js").then((t) => ({ rootComponent: t.default })), { surface: "compact", loading: "Loading webhook details…", failed: "Could not load the webhook details. Reload the page to try again.", delay: 0, timeout: 3e4 });
  }
}
async function f() {
  return e;
}
n(import.meta.url, e);
export {
  f as webComponent
};
//# sourceMappingURL=detail.js.map
