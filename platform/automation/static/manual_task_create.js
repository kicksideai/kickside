import { defineComponent as r, openBlock as t, createBlock as o } from "vue";
import { P as a } from "./wc-runtime-CFU5M_Nd.js";
import { _ as m, T as s } from "./TaskCreate.vue_vue_type_script_setup_true_lang-P91X4u3F.js";
import { define as i } from "@wippy-fe/proxy";
const c = /* @__PURE__ */ r({
  __name: "ManualTaskCreate",
  setup(n) {
    return (p, u) => (t(), o(m, { recurring: !1 }));
  }
});
class e extends s {
  static get vueConfig() {
    return { rootComponent: c, plugins: [a] };
  }
}
async function g() {
  return e;
}
i(import.meta.url, e);
export {
  g as webComponent
};
//# sourceMappingURL=manual_task_create.js.map
