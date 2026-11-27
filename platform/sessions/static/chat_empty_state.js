import { W as s, m as o } from "./wc-runtime-D-UdhneU.js";
import { s as i } from "./styles-Dhq3lUU_.js";
import { define as r } from "@wippy-fe/proxy";
class e extends s {
  static get wippyConfig() {
    return {
      propsSchema: {
        type: "object",
        properties: {
          surface: {
            type: "string",
            enum: ["sessions", "sidebar"],
            default: "sidebar",
            description: "Selects the empty-chat profile for the Sessions page or the host sidebar."
          }
        }
      },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: i
    };
  }
  static get vueConfig() {
    return o(
      () => import("./chat_empty_state-mount-D39frekm.js").then((t) => t.mountConfig),
      {
        surface: "page",
        loading: "Loading…",
        failed: "Could not load the chat start screen. Reload the page to try again.",
        timeout: 3e4
      }
    );
  }
}
async function l() {
  return e;
}
r(import.meta.url, e);
export {
  l as webComponent
};
//# sourceMappingURL=chat_empty_state.js.map
