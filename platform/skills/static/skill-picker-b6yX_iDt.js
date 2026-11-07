import { defineComponent as v, ref as k, watch as h, onMounted as K, onBeforeUnmount as S, openBlock as r, createElementBlock as c, createElementVNode as m, nextTick as E, computed as x, createVNode as w, unref as I } from "vue";
import { b as T, u as B } from "./wc-runtime-ClNbKZcC.js";
import { loadByTagName as C } from "@wippy-fe/proxy";
import { _ as M } from "./_plugin-vue_export-helper-CHgC5LLL.js";
const N = { class: "kx-msfield" }, z = {
  key: 0,
  class: "kx-msfield-fail",
  role: "alert"
}, L = /* @__PURE__ */ v({
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
  setup(f, { emit: d }) {
    const e = f, u = d, a = e.tag || "wc-multiselect", l = k(null), i = k(!1);
    let t = null;
    function p(o) {
      const n = o.detail, b = n && Array.isArray(n.selected) ? n.selected.map(String) : [], A = n && Array.isArray(n.labels) ? n.labels.map(String) : void 0;
      u("change", b, A);
    }
    async function _() {
      if (!customElements.get(a))
        try {
          await C(a, { timeoutMs: 8e3 });
        } catch {
        }
    }
    function s(o, n) {
      t && n != null && n !== "" && t.setAttribute(o, n);
    }
    async function y() {
      if (i.value = !1, !!l.value) {
        t && (t.removeEventListener("change", p), t = null), l.value.innerHTML = "";
        try {
          await _(), t = document.createElement(a), s("source", e.source), s("connection-id", e.connectionId), s("discover-path", e.discoverPath), s("search", e.search), s("page-size", e.pageSize == null ? void 0 : String(e.pageSize)), s("drill-key", e.drillKey), s("unselectable-hint", e.unselectableHint), s("id-key", e.idKey), s("label-key", e.labelKey), s("desc-key", e.descKey), s("icon-key", e.iconKey), s("meta-key", e.metaKey), s("response-key", e.responseKey), s("placeholder", e.placeholder), t.setAttribute("multi", e.multi === !1 ? "false" : "true"), t.setAttribute("selected", JSON.stringify(e.selected || [])), t.addEventListener("change", p), t.style.display = "block", l.value.appendChild(t), i.value = !customElements.get(a);
        } catch {
          i.value = !0;
        }
      }
    }
    async function g() {
      i.value = !1, await E(), await y();
    }
    return h(() => e.selected, (o) => {
      t && t.setAttribute("selected", JSON.stringify(o || []));
    }, { deep: !0 }), h(() => [e.source, e.connectionId], y), K(y), S(() => {
      t && t.removeEventListener("change", p);
    }), (o, n) => (r(), c("div", N, [
      i.value ? (r(), c("div", z, [
        n[0] || (n[0] = m("span", null, "This picker couldn’t load.", -1)),
        m("button", {
          type: "button",
          onClick: g
        }, "Try again")
      ])) : (r(), c("div", {
        key: 1,
        ref_key: "host",
        ref: l
      }, null, 512))
    ]));
  }
}), P = /* @__PURE__ */ M(L, [["__scopeId", "data-v-06a6a02e"]]), H = { class: "sp" }, $ = /* @__PURE__ */ v({
  __name: "skill-picker",
  setup(f) {
    const d = T(), e = B();
    function u(l) {
      return Array.isArray(l) ? [...l] : l && Array.isArray(l.skill_ids) ? [...l.skill_ids] : [];
    }
    const a = x(() => u(d.value.config));
    return (l, i) => (r(), c("div", H, [
      w(P, {
        source: "/api/v1/skills",
        "response-key": "skills",
        "id-key": "skill_id",
        "label-key": "name",
        "desc-key": "description",
        "icon-key": "icon",
        placeholder: "Search skills to pin…",
        selected: a.value,
        onChange: i[0] || (i[0] = (t) => I(e)("config-changed", { skill_ids: t }))
      }, null, 8, ["selected"]),
      i[1] || (i[1] = m("p", { class: "sp-hint" }, "Pinned skills are loaded into the agent's prompt automatically. It can still discover and load others on demand.", -1))
    ]));
  }
});
export {
  $ as default
};
//# sourceMappingURL=skill-picker-b6yX_iDt.js.map
