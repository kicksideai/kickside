import { defineComponent as t, openBlock as n, createBlock as o } from "vue";
import "@iconify/vue";
import { define as m } from "@wippy-fe/proxy";
import "pinia";
import { P as i } from "./primevue-plugin-CaP7wV_M.js";
import { _ as a, T as s } from "./TaskCreate.vue_vue_type_script_setup_true_lang-DwtklZsw.js";
const c = /* @__PURE__ */ t({
  __name: "RecurringTaskCreate",
  setup(r) {
    return (p, u) => (n(), o(a, { recurring: !0 }));
  }
});
class e extends s {
  static get vueConfig() {
    return { rootComponent: c, plugins: [i] };
  }
}
async function T() {
  return e;
}
m(import.meta.url, e);
export {
  T as webComponent
};
//# sourceMappingURL=recurring_task_create.js.map
