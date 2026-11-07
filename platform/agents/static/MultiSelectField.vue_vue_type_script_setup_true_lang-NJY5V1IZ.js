import { defineComponent as A, ref as y, watch as m, onMounted as _, onBeforeUnmount as S, openBlock as u, createElementBlock as d, createElementVNode as f, nextTick as E } from "vue";
import { loadByTagName as w } from "@wippy-fe/proxy";
const T = { class: "kx-msfield" }, x = {
  key: 0,
  class: "kx-msfield-fail",
  role: "alert"
}, C = /* @__PURE__ */ A({
  __name: "MultiSelectField",
  props: {
    source: {},
    connectionId: {},
    discoverPath: {},
    search: {},
    pageSize: {},
    drillKey: {},
    unselectableHint: {},
    selected: {},
    idKey: {},
    labelKey: {},
    descKey: {},
    iconKey: {},
    metaKey: {},
    responseKey: {},
    multi: { type: Boolean, default: !0 },
    placeholder: {},
    tag: {}
  },
  emits: ["change"],
  setup(p, { emit: h }) {
    const e = p, g = h, a = e.tag || "wc-multiselect", c = y(null), i = y(!1);
    let t = null;
    function o(s) {
      const l = s.detail, b = l && Array.isArray(l.selected) ? l.selected.map(String) : [], K = l && Array.isArray(l.labels) ? l.labels.map(String) : void 0;
      g("change", b, K);
    }
    async function v() {
      if (!customElements.get(a))
        try {
          await w(a, { timeoutMs: 8e3 });
        } catch {
        }
    }
    function n(s, l) {
      t && l != null && l !== "" && t.setAttribute(s, l);
    }
    async function r() {
      if (i.value = !1, !!c.value) {
        t && (t.removeEventListener("change", o), t = null), c.value.innerHTML = "";
        try {
          await v(), t = document.createElement(a), n("source", e.source), n("connection-id", e.connectionId), n("discover-path", e.discoverPath), n("search", e.search), n("page-size", e.pageSize == null ? void 0 : String(e.pageSize)), n("drill-key", e.drillKey), n("unselectable-hint", e.unselectableHint), n("id-key", e.idKey), n("label-key", e.labelKey), n("desc-key", e.descKey), n("icon-key", e.iconKey), n("meta-key", e.metaKey), n("response-key", e.responseKey), n("placeholder", e.placeholder), t.setAttribute("multi", e.multi === !1 ? "false" : "true"), t.setAttribute("selected", JSON.stringify(e.selected || [])), t.addEventListener("change", o), t.style.display = "block", c.value.appendChild(t), i.value = !customElements.get(a);
        } catch {
          i.value = !0;
        }
      }
    }
    async function k() {
      i.value = !1, await E(), await r();
    }
    return m(() => e.selected, (s) => {
      t && t.setAttribute("selected", JSON.stringify(s || []));
    }, { deep: !0 }), m(() => [e.source, e.connectionId], r), _(r), S(() => {
      t && t.removeEventListener("change", o);
    }), (s, l) => (u(), d("div", T, [
      i.value ? (u(), d("div", x, [
        l[0] || (l[0] = f("span", null, "This picker couldn’t load.", -1)),
        f("button", {
          type: "button",
          onClick: k
        }, "Try again")
      ])) : (u(), d("div", {
        key: 1,
        ref_key: "host",
        ref: c
      }, null, 512))
    ]));
  }
});
export {
  C as _
};
//# sourceMappingURL=MultiSelectField.vue_vue_type_script_setup_true_lang-NJY5V1IZ.js.map
