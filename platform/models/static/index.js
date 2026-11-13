import { W as o, u as s } from "./wc-runtime-ClNbKZcC.js";
import { s as r, l as i } from "./styles-BFjc2kK5.js";
import { E as p } from "./provider-tags-C0mtMONl.js";
import "@iconify/vue";
import { define as a } from "@wippy-fe/proxy";
const m = { props: { type: "object", properties: {} } }, l = {
  wippy: m
};
class n extends o {
  static get wippyConfig() {
    return {
      propsSchema: l.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: r
    };
  }
  static get vueConfig() {
    return {
      lazyConfig: i(
        () => import("./lazy-mount-Bepzz46I.js").then((t) => t.mountConfig),
        "Could not load Models. Reload the page to try again.",
        s
      )
    };
  }
}
const c = {
  type: "object",
  properties: {
    mode: { type: "string" },
    adapter: { type: "object" },
    preset: { type: "object" },
    profile: { type: "object" },
    saving: { type: "boolean" }
  }
};
function g(e) {
  return class extends o {
    static get wippyConfig() {
      return {
        propsSchema: c,
        hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
        inlineCss: r
      };
    }
    static get vueConfig() {
      return {
        lazyConfig: i(
          () => import("./provider-editor-mount-5E5ekf4Q.js").then((t) => t.editorMountConfig(e)),
          "Could not load the provider editor. Reload the page to try again.",
          s
        )
      };
    }
  };
}
async function h() {
  return n;
}
a(import.meta.url, n);
for (const [e, t] of Object.entries(p))
  customElements.get(e) || customElements.define(e, g(t));
export {
  h as webComponent
};
//# sourceMappingURL=index.js.map
