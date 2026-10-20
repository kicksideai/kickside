import { u as a, a as l, W as m, P as u } from "./index-B9KLaL2S.js";
import { defineComponent as f, computed as o, openBlock as d, createBlock as _ } from "vue";
import { M as r, X as g } from "./pickerselect-Bt8Nl0Ia.js";
import { _ as k, s as C } from "./workflow-embed-CqSNuAGR.js";
import "@iconify/vue";
import { define as h } from "@wippy-fe/proxy";
const v = /* @__PURE__ */ f({
  __name: "WorkflowPicker",
  setup(n) {
    const s = a(), i = l(), t = o(() => Object.keys(r(s.value.schema)?.properties || {})[0] || "flow_ref"), c = o(() => r(s.value.config)?.[t.value]);
    function p(e) {
      e.published_version && i("change", { [t.value]: { kind: "flow", id: e.id, version: e.published_version } });
    }
    return (e, S) => (d(), _(k, {
      selected: c.value,
      onSelect: p
    }, null, 8, ["selected"]));
  }
}), y = {
  type: "object",
  properties: {
    config: { type: "string", default: "{}" },
    schema: { type: "string", default: "" }
  }
};
class P extends m {
  static get wippyConfig() {
    return {
      propsSchema: y,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: [g, C].join(`
`)
    };
  }
  static get vueConfig() {
    return { rootComponent: v, plugins: [u] };
  }
}
h(import.meta.url, P);
