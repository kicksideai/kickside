import { a as g, b as f, W as v } from "./index-D52CRMw6.js";
import { _ as C, e as w, P as y } from "./KbDialog.vue_vue_type_script_setup_true_lang-CICQRGnH.js";
import { computed as P, defineComponent as _, ref as d, onMounted as k, openBlock as E, createBlock as b, unref as o } from "vue";
import { api as p, define as I } from "@wippy-fe/proxy";
import { s as K } from "./styles-BFEJ_PLH.js";
import "@iconify/vue";
function S(r) {
  return P(() => {
    const n = r.value;
    return n ? (typeof n.parentId == "string" ? n.parentId : "").trim() : "";
  });
}
const h = /* @__PURE__ */ _({
  __name: "KbCreate",
  setup(r) {
    const n = g(), s = f(), m = S(n), a = d([]), i = d([]), l = d("");
    async function u() {
      l.value = "";
      try {
        const [t, e] = await Promise.all([
          p.get("/api/v1/knowledge/engines"),
          p.get("/api/v1/knowledge/models")
        ]);
        if (!t.data?.success) throw new Error(t.data?.error || "Could not load knowledge engines.");
        if (!e.data?.success) throw new Error(e.data?.error || "Could not load embedding models.");
        a.value = t.data.engines || [], i.value = e.data.models || [];
      } catch (t) {
        a.value = [], i.value = [], l.value = w(t, "Could not load knowledge engines.");
      }
    }
    return k(u), (t, e) => (E(), b(C, {
      open: !0,
      api: o(p),
      engines: a.value,
      models: i.value,
      target: null,
      "parent-id": o(m).value,
      "load-error": l.value,
      onRetry: u,
      onClose: e[0] || (e[0] = (c) => o(s)("close", {})),
      onSaved: e[1] || (e[1] = (c) => o(s)("created", {}))
    }, null, 8, ["api", "engines", "models", "parent-id", "load-error"]));
  }
}), x = {
  type: "object",
  properties: {
    "parent-id": { type: "string" }
  }
};
class M extends v {
  static get wippyConfig() {
    return {
      propsSchema: x,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: K
    };
  }
  static get vueConfig() {
    return { rootComponent: h, plugins: [y] };
  }
}
I(import.meta.url, M);
//# sourceMappingURL=kb_create.js.map
