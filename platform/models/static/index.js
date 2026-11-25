import { W as o, l as i } from "./wc-runtime-DYOSFvWw.js";
import { E as n } from "./provider-tags-C0mtMONl.js";
import { s } from "./styles-JRSdLrvT.js";
import { define as p } from "@wippy-fe/proxy";
const a = { props: { type: "object", properties: {} } }, l = {
  wippy: a
};
class r extends o {
  static get wippyConfig() {
    return {
      propsSchema: l.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: s
    };
  }
  static get vueConfig() {
    return {
      ...i(() => import("./lazy-mount-gjLmW_Sl.js").then((t) => t.mountConfig), { surface: "page", loading: "Loading…", failed: "Could not load Models. Reload the page to try again.", timeout: 3e4 })
    };
  }
}
const m = {
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
        propsSchema: m,
        hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
        inlineCss: s
      };
    }
    static get vueConfig() {
      return {
        ...i(() => import("./provider-editor-mount-C9vVWd7m.js").then((t) => t.editorMountConfig(e)), { surface: "page", loading: "Loading…", failed: "Could not load the provider editor. Reload the page to try again.", timeout: 3e4 })
      };
    }
  };
}
async function y() {
  return r;
}
p(import.meta.url, r);
for (const [e, t] of Object.entries(n))
  customElements.get(e) || customElements.define(e, g(t));
export {
  y as webComponent
};
//# sourceMappingURL=index.js.map
