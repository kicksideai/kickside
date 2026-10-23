import { defineComponent as r, openBlock as t, createBlock as n } from "vue";
import "@iconify/vue";
import { define as o } from "@wippy-fe/proxy";
import { P as a } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DNnuyvEa.js";
import { _ as m, T as s } from "./TaskCreate.vue_vue_type_script_setup_true_lang-Dzn-LyXI.js";
const i = /* @__PURE__ */ r({
  __name: "ManualTaskCreate",
  setup(e) {
    return (c, u) => (t(), n(m, { recurring: !1 }));
  }
});
class p extends s {
  static get vueConfig() {
    return { rootComponent: i, plugins: [a] };
  }
}
o(import.meta.url, p);
//# sourceMappingURL=manual_task_create.js.map
