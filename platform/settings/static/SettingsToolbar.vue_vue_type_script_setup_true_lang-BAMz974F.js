import { defineComponent as v, openBlock as t, createElementBlock as i, createCommentVNode as n, createElementVNode as c, createTextVNode as y, createVNode as l, unref as d, withCtx as m, createBlock as b } from "vue";
import { Icon as u } from "@iconify/vue";
import { s as o } from "./index-GXCRJfhs.js";
const g = { class: "ap-bar" }, k = {
  key: 0,
  class: "ap-dirty",
  role: "status"
}, B = {
  key: 1,
  class: "ks-saved",
  role: "status"
}, S = /* @__PURE__ */ v({
  __name: "SettingsToolbar",
  props: {
    dirty: { type: Boolean },
    saving: { type: Boolean },
    invalid: { type: Boolean },
    saved: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["discard", "save"],
  setup(e) {
    return (s, a) => (t(), i("header", g, [
      e.dirty ? (t(), i("span", k, "Unsaved changes")) : n("", !0),
      e.saved ? (t(), i("span", B, [...a[2] || (a[2] = [
        c("span", {
          class: "ks-saved-tick",
          "aria-hidden": "true"
        }, "✓", -1),
        y(" Saved", -1)
      ])])) : n("", !0),
      l(d(o), {
        type: "button",
        label: "Discard",
        severity: "secondary",
        outlined: "",
        disabled: e.disabled || !e.dirty || e.saving,
        onClick: a[0] || (a[0] = (r) => s.$emit("discard"))
      }, null, 8, ["disabled"]),
      l(d(o), {
        type: "button",
        label: e.saving ? "Saving…" : "Save",
        loading: e.saving,
        disabled: e.disabled || !e.dirty || e.saving || e.invalid,
        onClick: a[1] || (a[1] = (r) => s.$emit("save"))
      }, {
        icon: m(() => [
          e.saving ? n("", !0) : (t(), b(d(u), {
            key: 0,
            icon: "tabler:device-floppy",
            "aria-hidden": "true"
          }))
        ]),
        _: 1
      }, 8, ["label", "loading", "disabled"])
    ]));
  }
});
export {
  S as _
};
//# sourceMappingURL=SettingsToolbar.vue_vue_type_script_setup_true_lang-BAMz974F.js.map
