import { u as f, g as m, W as g, P as y } from "./primevue-plugin-BTxKP425.js";
import { defineComponent as d, computed as i, openBlock as h, createBlock as v } from "vue";
import { _ as S } from "./MultiSelectField.vue_vue_type_script_setup_true_lang-NJY5V1IZ.js";
import { s as _ } from "./styles-DLfU4ZNr.js";
import "@iconify/vue";
import { define as k } from "@wippy-fe/proxy";
function C(e, t) {
  if (typeof e != "string" || !e.trim()) return "";
  const r = e.trim();
  if (r.startsWith("{"))
    try {
      const s = JSON.parse(r)[t];
      return typeof s == "string" ? s : s == null ? "" : String(s);
    } catch {
      return "";
    }
  return r;
}
function P(e) {
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
function A(e) {
  if (!e) return null;
  if (typeof e == "string")
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  return e;
}
const B = /* @__PURE__ */ d({
  __name: "AgentPicker",
  setup(e) {
    const t = f(), r = m(), o = i(() => {
      const n = t.value?.config;
      return typeof n == "string" && n.trim() !== "";
    }), s = i(() => Object.keys(A(t.value?.schema)?.properties || {})[0] || "agent_id"), l = i(() => {
      if (!o.value) return P(t.value?.selected);
      const n = C(t.value?.config, s.value);
      return n ? [n] : [];
    }), c = i(() => o.value ? !1 : t.value?.multi !== !1), u = i(() => t.value?.placeholder || "Search agents…");
    function p(n, a) {
      if (o.value) {
        r("change", { [s.value]: n[0] || "" });
        return;
      }
      r("change", { selected: n, labels: a });
    }
    return (n, a) => (h(), v(S, {
      source: "/api/v1/agents/list",
      "response-key": "agents",
      "id-key": "name",
      "label-key": "title",
      "desc-key": "comment",
      "icon-key": "icon",
      multi: c.value,
      placeholder: u.value,
      selected: l.value,
      onChange: p
    }, null, 8, ["multi", "placeholder", "selected"]));
  }
}), O = {
  type: "object",
  properties: {
    selected: { type: "array", items: { type: "string" }, default: [] },
    multi: { type: "boolean", default: !0 },
    placeholder: { type: "string" },
    config: { type: "string", default: "" },
    schema: { type: "string", default: "" }
  }
};
class b extends g {
  static get wippyConfig() {
    return {
      propsSchema: O,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: _
    };
  }
  static get vueConfig() {
    return { rootComponent: B, plugins: [y] };
  }
}
k(import.meta.url, b);
//# sourceMappingURL=agent_picker.js.map
