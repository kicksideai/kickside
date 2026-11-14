import { defineComponent as i, computed as m, openBlock as u, createBlock as c, mergeProps as f, unref as t } from "vue";
import { a as l, u as d } from "./wc-runtime-KO3cNuNo.js";
import { _ } from "./PrincipalPicker.vue_vue_type_script_setup_true_lang-CoSxbp_M.js";
const E = /* @__PURE__ */ i({
  __name: "PrincipalPickerElement",
  setup(g) {
    const s = l(), e = d(), p = m(() => s.value ?? {});
    function a(r) {
      e("config-changed", r);
    }
    return (r, o) => (u(), c(_, f(p.value, {
      onChange: a,
      onLoad: o[0] || (o[0] = (n) => t(e)("load", void 0)),
      onError: o[1] || (o[1] = (n) => t(e)("error", n))
    }), null, 16));
  }
});
export {
  E as default
};
//# sourceMappingURL=PrincipalPickerElement-BrmqRyx_.js.map
