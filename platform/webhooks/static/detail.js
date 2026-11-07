import { W as t, u as o } from "./wc-runtime-KO3cNuNo.js";
import { l as i, s } from "./styles-BIC5lYg4.js";
import "@iconify/vue";
import { define as n } from "@wippy-fe/proxy";
const a = i(
  () => import("./WebhookSourceDetail-DnzEXrUF.js"),
  { loading: "Loading webhook details…", failed: "Could not load the webhook details. Reload the page to try again." },
  o
), r = {
  type: "object",
  properties: {
    value: { type: "string", default: "", description: "Selected webhook: a JSON object string {thread_id} or a bare id." },
    config: { type: "string", default: "", description: "Alias of value used by the data-flow config form." }
  }
};
class e extends t {
  static get wippyConfig() {
    return {
      propsSchema: r,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return { rootComponent: a };
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
