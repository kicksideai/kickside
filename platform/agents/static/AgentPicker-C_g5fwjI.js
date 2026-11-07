import { defineComponent as p, computed as o, openBlock as m, createBlock as d } from "vue";
import { a as g, u as y } from "./wc-runtime-KO3cNuNo.js";
import { M as h } from "./MultiSelectField-CJKHhAnf.js";
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
function S(e) {
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
function k(e) {
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
    const t = g(), r = y(), c = o(() => {
      const n = t.value?.config;
      return typeof n == "string" && n.trim() !== "";
    }), a = o(() => Object.keys(k(t.value?.schema)?.properties || {})[0] || "agent_id"), s = o(() => {
      if (!c.value) return S(t.value?.selected);
      const n = v(t.value?.config, a.value);
      return n ? [n] : [];
    }), l = o(() => c.value ? !1 : t.value?.multi !== !1), u = o(() => t.value?.placeholder || "Search agents…");
    function f(n, i) {
      if (c.value) {
        r("change", { [a.value]: n[0] || "" });
        return;
      }
      r("change", { selected: n, labels: i });
    }
    return (n, i) => (m(), d(h, {
      source: "/api/v1/agents/list",
      "response-key": "agents",
      "id-key": "name",
      "label-key": "title",
      "desc-key": "comment",
      "icon-key": "icon",
      multi: l.value,
      placeholder: u.value,
      selected: s.value,
      onChange: f
    }, null, 8, ["multi", "placeholder", "selected"]));
  }
});
export {
  O as default
};
//# sourceMappingURL=AgentPicker-C_g5fwjI.js.map
