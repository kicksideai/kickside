import { defineComponent as r, openBlock as t, createBlock as n } from "vue";
import "@iconify/vue";
import { define as o } from "@wippy-fe/proxy";
import { P as m } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DNnuyvEa.js";
import { _ as i, T as a } from "./TaskCreate.vue_vue_type_script_setup_true_lang-CVpjt1q3.js";
const s = /* @__PURE__ */ r({
  __name: "RecurringTaskCreate",
  setup(e) {
    return (p, u) => (t(), n(i, { recurring: !0 }));
  }
});
class c extends a {
  static get vueConfig() {
    return { rootComponent: s, plugins: [m] };
  }
}
o(import.meta.url, c);
//# sourceMappingURL=recurring_task_create.js.map
