import { defineComponent as n, openBlock as t, createBlock as o } from "vue";
import { P as m } from "./wc-runtime-CFU5M_Nd.js";
import { _ as i, T as a } from "./TaskCreate.vue_vue_type_script_setup_true_lang-P91X4u3F.js";
import { define as s } from "@wippy-fe/proxy";
const c = /* @__PURE__ */ n({
  __name: "RecurringTaskCreate",
  setup(r) {
    return (u, p) => (t(), o(i, { recurring: !0 }));
  }
});
class e extends a {
  static get vueConfig() {
    return { rootComponent: c, plugins: [m] };
  }
}
async function C() {
  return e;
}
s(import.meta.url, e);
export {
  C as webComponent
};
//# sourceMappingURL=recurring_task_create.js.map
