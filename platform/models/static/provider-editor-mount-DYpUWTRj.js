import { b as r, u as i } from "./wc-runtime-ClNbKZcC.js";
import { P as s } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as m, h as u } from "vue";
import { e as p } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-hzoWyiBh.js";
function a(o) {
  return m({
    name: `provider-editor-${o}`,
    setup() {
      const n = r(), e = i();
      return () => u(p, {
        ...n.value,
        specKey: o,
        onSave: (t) => e("save", t),
        onCancel: () => e("cancel", void 0),
        onTest: () => e("test", void 0)
      });
    }
  });
}
function l(o) {
  return { rootComponent: a(o), plugins: [s] };
}
export {
  l as editorMountConfig
};
//# sourceMappingURL=provider-editor-mount-DYpUWTRj.js.map
