import { defineComponent as t, openBlock as n, createBlock as o } from "vue";
import "@iconify/vue";
import { define as a } from "@wippy-fe/proxy";
import "pinia";
import { P as m } from "./primevue-plugin-CaP7wV_M.js";
import { _ as i, T as s } from "./TaskCreate.vue_vue_type_script_setup_true_lang-bKVmUXdZ.js";
const p = /* @__PURE__ */ t({
  __name: "ManualTaskCreate",
  setup(r) {
    return (c, u) => (n(), o(i, { recurring: !1 }));
  }
});
class e extends s {
  static get vueConfig() {
    return { rootComponent: p, plugins: [m] };
  }
}
async function T() {
  return e;
}
a(import.meta.url, e);
export {
  T as webComponent
};
//# sourceMappingURL=manual_task_create.js.map
