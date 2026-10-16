import { defineComponent as _, ref as y, watch as m, onMounted as A, onBeforeUnmount as S, openBlock as u, createElementBlock as d, createElementVNode as p, nextTick as E } from "vue";
import { loadByTagName as w } from "@wippy-fe/proxy";
import { _ as x } from "./_plugin-vue_export-helper-CHgC5LLL.js";
const M = { class: "kx-msfield" }, T = {
  key: 0,
  class: "kx-msfield-fail",
  role: "alert"
}, B = /* @__PURE__ */ _({
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
  setup(f, { emit: h }) {
    const e = f, g = h, i = e.tag || "wc-multiselect", c = y(null), a = y(!1);
    let t = null;
    function o(s) {
      const l = s.detail, b = l && Array.isArray(l.selected) ? l.selected.map(String) : [], K = l && Array.isArray(l.labels) ? l.labels.map(String) : void 0;
      g("change", b, K);
    }
    async function v() {
      if (!customElements.get(i))
        try {
          await w(i, { timeoutMs: 8e3 });
        } catch {
        }
    }
    function n(s, l) {
      t && l != null && l !== "" && t.setAttribute(s, l);
    }
    async function r() {
      if (a.value = !1, !!c.value) {
        t && (t.removeEventListener("change", o), t = null), c.value.innerHTML = "";
        try {
          await v(), t = document.createElement(i), n("source", e.source), n("connection-id", e.connectionId), n("discover-path", e.discoverPath), n("search", e.search), n("page-size", e.pageSize == null ? void 0 : String(e.pageSize)), n("drill-key", e.drillKey), n("unselectable-hint", e.unselectableHint), n("id-key", e.idKey), n("label-key", e.labelKey), n("desc-key", e.descKey), n("icon-key", e.iconKey), n("meta-key", e.metaKey), n("response-key", e.responseKey), n("placeholder", e.placeholder), t.setAttribute("multi", e.multi === !1 ? "false" : "true"), t.setAttribute("selected", JSON.stringify(e.selected || [])), t.addEventListener("change", o), t.style.display = "block", c.value.appendChild(t), a.value = !customElements.get(i);
        } catch {
          a.value = !0;
        }
      }
    }
    async function k() {
      a.value = !1, await E(), await r();
    }
    return m(() => e.selected, (s) => {
      t && t.setAttribute("selected", JSON.stringify(s || []));
    }, { deep: !0 }), m(() => [e.source, e.connectionId], r), A(r), S(() => {
      t && t.removeEventListener("change", o);
    }), (s, l) => (u(), d("div", M, [
      a.value ? (u(), d("div", T, [
        l[0] || (l[0] = p("span", null, "This picker couldn’t load.", -1)),
        p("button", {
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
}), L = /* @__PURE__ */ x(B, [["__scopeId", "data-v-06a6a02e"]]);
export {
  L as M
};
//# sourceMappingURL=MultiSelectField-CJKHhAnf.js.map
