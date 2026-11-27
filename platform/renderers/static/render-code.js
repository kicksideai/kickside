import { W as o, l as i } from "./wc-runtime-soyJW63L.js";
import { s as n } from "./styles-HTuIrRec.js";
import { define as s } from "@wippy-fe/proxy";
const r = ":host > div:empty, :host > div:has(> [data-lazy-state]) { min-height: 96px; }", a = {
  type: "object",
  properties: {
    source: { type: "string", default: "", description: "Inline source/data text to render." },
    "source-url": { type: "string", default: "", description: "URL to fetch the text from (auth via proxy) when source is empty." },
    "content-type": { type: "string", default: "", description: "MIME type, used to pick the highlight language / table mode." },
    filename: { type: "string", default: "", description: "Filename, used to infer language from the extension." }
  }
};
class e extends o {
  static get wippyConfig() {
    return {
      propsSchema: a,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: `${n}
${r}`
    };
  }
  static get vueConfig() {
    return i(() => import("./RenderCode-BW8HRBaY.js").then((t) => ({ rootComponent: t.default })), { surface: "compact", loading: "Loading the code viewer…", failed: "Could not load the code viewer. Reload the page to try again.", delay: 200, timeout: 3e4 });
  }
}
async function c() {
  return e;
}
s(import.meta.url, e);
export {
  c as webComponent
};
//# sourceMappingURL=render-code.js.map
