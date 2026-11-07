import { computed as g, defineComponent as v, ref as d, onMounted as f, openBlock as w, createBlock as _, unref as r } from "vue";
import { api as u } from "@wippy-fe/proxy";
import { b as k, u as C } from "./wc-runtime-ClNbKZcC.js";
import { _ as y, e as E } from "./KbDialog.vue_vue_type_script_setup_true_lang-CKB3002V.js";
function I(i) {
  return g(() => {
    const n = i.value;
    return n ? (typeof n.parentId == "string" ? n.parentId : "").trim() : "";
  });
}
const B = /* @__PURE__ */ v({
  __name: "KbCreate",
  setup(i) {
    const n = k(), t = C(), m = I(n), a = d([]), s = d([]), l = d("");
    async function p() {
      l.value = "";
      try {
        const [o, e] = await Promise.all([
          u.get("/api/v1/knowledge/engines"),
          u.get("/api/v1/knowledge/models")
        ]);
        if (!o.data?.success) throw new Error(o.data?.error || "Could not load knowledge engines.");
        if (!e.data?.success) throw new Error(e.data?.error || "Could not load embedding models.");
        a.value = o.data.engines || [], s.value = e.data.models || [];
      } catch (o) {
        a.value = [], s.value = [], l.value = E(o, "Could not load knowledge engines.");
      }
    }
    return f(p), (o, e) => (w(), _(y, {
      open: !0,
      api: r(u),
      engines: a.value,
      models: s.value,
      target: null,
      "parent-id": r(m).value,
      "load-error": l.value,
      onRetry: p,
      onClose: e[0] || (e[0] = (c) => r(t)("close", {})),
      onSaved: e[1] || (e[1] = (c) => r(t)("created", {}))
    }, null, 8, ["api", "engines", "models", "parent-id", "load-error"]));
  }
});
export {
  B as default
};
//# sourceMappingURL=KbCreate-DuJ_tz-m.js.map
