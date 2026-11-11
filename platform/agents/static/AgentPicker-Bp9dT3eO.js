import { defineComponent as p, computed as o, openBlock as m, createBlock as g } from "vue";
import { a as d, u as y } from "./wc-runtime-KO3cNuNo.js";
import { _ as h } from "./MultiSelectField.vue_vue_type_script_setup_true_lang-NJY5V1IZ.js";
function v(e, t) {
  if (typeof e != "string" || !e.trim()) return "";
  const r = e.trim();
  if (r.startsWith("{"))
    try {
      const a = JSON.parse(r)[t];
      return typeof a == "string" ? a : a == null ? "" : String(a);
    } catch {
      return "";
    }
  return r;
}
function _(e) {
  if (Array.isArray(e)) return e.map(String).filter(Boolean);
  if (typeof e == "string") {
    const t = e.trim();
    if (!t) return [];
    if (t.startsWith("["))
      try {
        const r = JSON.parse(t);
        if (Array.isArray(r)) return r.map(String).filter(Boolean);
      } catch {
      }
    return t.split(",").map((r) => r.trim()).filter(Boolean);
  }
  return [];
}
function S(e) {
  if (!e) return null;
  if (typeof e == "string")
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  return e;
}
const O = /* @__PURE__ */ p({
  __name: "AgentPicker",
  setup(e) {
    const t = d(), r = y(), s = o(() => {
      const n = t.value?.config;
      return typeof n == "string" && n.trim() !== "";
    }), a = o(() => Object.keys(S(t.value?.schema)?.properties || {})[0] || "agent_id"), i = o(() => {
      if (!s.value) return _(t.value?.selected);
      const n = v(t.value?.config, a.value);
      return n ? [n] : [];
    }), l = o(() => s.value ? !1 : t.value?.multi !== !1), u = o(() => t.value?.placeholder || "Search agents…");
    function f(n, c) {
      if (s.value) {
        r("change", { [a.value]: n[0] || "" });
        return;
      }
      r("change", { selected: n, labels: c });
    }
    return (n, c) => (m(), g(h, {
      source: "/api/v1/agents/list",
      "response-key": "agents",
      "id-key": "name",
      "label-key": "title",
      "desc-key": "comment",
      "icon-key": "icon",
      multi: l.value,
      placeholder: u.value,
      selected: i.value,
      onChange: f
    }, null, 8, ["multi", "placeholder", "selected"]));
  }
});
export {
  O as default
};
//# sourceMappingURL=AgentPicker-Bp9dT3eO.js.map
