import { P as r, n as i, o as s } from "./wc-runtime-DYOSFvWw.js";
import { defineComponent as u, h as m } from "vue";
import { c as a } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-Bk2OLic6.js";
function p(o) {
  return u({
    name: `provider-editor-${o}`,
    setup() {
      const e = i(), n = s();
      return () => m(a, {
        ...e.value,
        specKey: o,
        onSave: (t) => n("save", t),
        onCancel: () => n("cancel", void 0),
        onTest: () => n("test", void 0)
      });
    }
  });
}
function v(o) {
  return { rootComponent: p(o), plugins: [r] };
}
export {
  v as editorMountConfig
};
//# sourceMappingURL=provider-editor-mount-C9vVWd7m.js.map
