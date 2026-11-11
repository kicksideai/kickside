import { defineComponent as v, ref as k, watch as h, onMounted as K, onBeforeUnmount as S, openBlock as o, createElementBlock as c, createElementVNode as m, nextTick as E, computed as w, createVNode as x, unref as T } from "vue";
import { b as B, u as C } from "./wc-runtime-ClNbKZcC.js";
import { loadByTagName as I } from "@wippy-fe/proxy";
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
    function y(r) {
      const s = r.detail, b = s && Array.isArray(s.selected) ? s.selected.map(String) : [], A = s && Array.isArray(s.labels) ? s.labels.map(String) : void 0;
      u("change", b, A);
    }
    async function g() {
      if (!customElements.get(a))
        try {
          await I(a, { timeoutMs: 8e3 });
        } catch {
        }
    }
    function n(r, s) {
      t && s != null && s !== "" && t.setAttribute(r, s);
    }
    async function p() {
      if (i.value = !1, !!l.value) {
        t && (t.removeEventListener("change", y), t = null), l.value.innerHTML = "";
        try {
          await g(), t = document.createElement(a), n("source", e.source), n("connection-id", e.connectionId), n("discover-path", e.discoverPath), n("search", e.search), n("page-size", e.pageSize == null ? void 0 : String(e.pageSize)), n("drill-key", e.drillKey), n("unselectable-hint", e.unselectableHint), n("id-key", e.idKey), n("label-key", e.labelKey), n("desc-key", e.descKey), n("icon-key", e.iconKey), n("meta-key", e.metaKey), n("response-key", e.responseKey), n("placeholder", e.placeholder), t.setAttribute("multi", e.multi === !1 ? "false" : "true"), t.setAttribute("selected", JSON.stringify(e.selected || [])), t.addEventListener("change", y), t.style.display = "block", l.value.appendChild(t), i.value = !customElements.get(a);
        } catch {
          i.value = !0;
        }
      }
    }
    async function _() {
      i.value = !1, await E(), await p();
    }
    return h(() => e.selected, (r) => {
      t && t.setAttribute("selected", JSON.stringify(r || []));
    }, { deep: !0 }), h(() => [e.source, e.connectionId], p), K(p), S(() => {
      t && t.removeEventListener("change", y);
    }), (r, s) => (o(), c("div", N, [
      i.value ? (o(), c("div", z, [
        s[0] || (s[0] = m("span", null, "This picker couldn’t load.", -1)),
        m("button", {
          type: "button",
          onClick: _
        }, "Try again")
      ])) : (o(), c("div", {
        key: 1,
        ref_key: "host",
        ref: l
      }, null, 512))
    ]));
  }
}), M = { class: "sp" }, O = /* @__PURE__ */ v({
  __name: "skill-picker",
  setup(f) {
    const d = B(), e = C();
    function u(l) {
      return Array.isArray(l) ? [...l] : l && Array.isArray(l.skill_ids) ? [...l.skill_ids] : [];
    }
    const a = w(() => u(d.value.config));
    return (l, i) => (o(), c("div", M, [
      x(L, {
        source: "/api/v1/skills",
        "response-key": "skills",
        "id-key": "skill_id",
        "label-key": "name",
        "desc-key": "description",
        "icon-key": "icon",
        placeholder: "Search skills to pin…",
        selected: a.value,
        onChange: i[0] || (i[0] = (t) => T(e)("config-changed", { skill_ids: t }))
      }, null, 8, ["selected"]),
      i[1] || (i[1] = m("p", { class: "sp-hint" }, "Pinned skills are loaded into the agent's prompt automatically. It can still discover and load others on demand.", -1))
    ]));
  }
});
export {
  O as default
};
//# sourceMappingURL=skill-picker-BsAwpVu9.js.map
