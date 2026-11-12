import { defineComponent as v, ref as k, watch as f, onMounted as w, onBeforeUnmount as S, openBlock as u, createElementBlock as p, createElementVNode as m, nextTick as E, computed as b, createVNode as T, toDisplayString as x } from "vue";
import { b as C, u as B } from "./wc-runtime-ClNbKZcC.js";
import { loadByTagName as N } from "@wippy-fe/proxy";
const z = { class: "kx-msfield" }, I = {
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
  setup(h, { emit: d }) {
    const t = h, l = d, a = t.tag || "wc-multiselect", o = k(null), i = k(!1);
    let e = null;
    function r(c) {
      const s = c.detail, A = s && Array.isArray(s.selected) ? s.selected.map(String) : [], K = s && Array.isArray(s.labels) ? s.labels.map(String) : void 0;
      l("change", A, K);
    }
    async function _() {
      if (!customElements.get(a))
        try {
          await N(a, { timeoutMs: 8e3 });
        } catch {
        }
    }
    function n(c, s) {
      e && s != null && s !== "" && e.setAttribute(c, s);
    }
    async function y() {
      if (i.value = !1, !!o.value) {
        e && (e.removeEventListener("change", r), e = null), o.value.innerHTML = "";
        try {
          await _(), e = document.createElement(a), n("source", t.source), n("connection-id", t.connectionId), n("discover-path", t.discoverPath), n("search", t.search), n("page-size", t.pageSize == null ? void 0 : String(t.pageSize)), n("drill-key", t.drillKey), n("unselectable-hint", t.unselectableHint), n("id-key", t.idKey), n("label-key", t.labelKey), n("desc-key", t.descKey), n("icon-key", t.iconKey), n("meta-key", t.metaKey), n("response-key", t.responseKey), n("placeholder", t.placeholder), e.setAttribute("multi", t.multi === !1 ? "false" : "true"), e.setAttribute("selected", JSON.stringify(t.selected || [])), e.addEventListener("change", r), e.style.display = "block", o.value.appendChild(e), i.value = !customElements.get(a);
        } catch {
          i.value = !0;
        }
      }
    }
    async function g() {
      i.value = !1, await E(), await y();
    }
    return f(() => t.selected, (c) => {
      e && e.setAttribute("selected", JSON.stringify(c || []));
    }, { deep: !0 }), f(() => [t.source, t.connectionId], y), w(y), S(() => {
      e && e.removeEventListener("change", r);
    }), (c, s) => (u(), p("div", z, [
      i.value ? (u(), p("div", I, [
        s[0] || (s[0] = m("span", null, "This picker couldn’t load.", -1)),
        m("button", {
          type: "button",
          onClick: g
        }, "Try again")
      ])) : (u(), p("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
}), M = { class: "kp" }, H = { class: "kp-hint" }, O = /* @__PURE__ */ v({
  __name: "kb-picker",
  setup(h) {
    const d = C(), t = B(), l = b(() => !!d.value.schema?.properties?.kb_id);
    function a(e, r) {
      return Array.isArray(e) ? [...e] : r && e && typeof e.kb_id == "string" && e.kb_id ? [e.kb_id] : e && Array.isArray(e.kb_ids) ? [...e.kb_ids] : [];
    }
    const o = b(() => a(d.value.config, l.value));
    function i(e) {
      l.value ? t("config-changed", { kb_id: e[0] || "" }) : t("config-changed", { kb_ids: e });
    }
    return (e, r) => (u(), p("div", M, [
      T(L, {
        source: "/api/v1/knowledge/list",
        "id-key": "id",
        "label-key": "name",
        "desc-key": "description",
        "icon-key": "icon",
        "meta-key": "kb_type",
        placeholder: "Search knowledge bases…",
        multi: !l.value,
        selected: o.value,
        onChange: i
      }, null, 8, ["multi", "selected"]),
      m("p", H, x(l.value ? "Choose the knowledge base that receives this content." : "The agent's read/write tools are scoped to the selected knowledge bases. With none selected, the agent may pick a base per call."), 1)
    ]));
  }
});
export {
  O as default
};
//# sourceMappingURL=kb-picker-B39oteEG.js.map
