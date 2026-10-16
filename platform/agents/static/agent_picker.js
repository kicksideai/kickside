import { u as d, g as y, W as h, P as v } from "./primevue-plugin-Dn0ACs8V.js";
import { defineComponent as _, computed as i, openBlock as k, createBlock as C } from "vue";
import { M as A } from "./MultiSelectField-CJKHhAnf.js";
import { s as S } from "./styles-CiCzyjUM.js";
import "@iconify/vue";
import { define as P } from "@wippy-fe/proxy";
const B = /* @__PURE__ */ _({
  __name: "AgentPicker",
  setup(l) {
    const n = d(), s = y();
    function c(e) {
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
    function u(e) {
      if (typeof e != "string") return "";
      const t = e.trim();
      if (!t) return "";
      if (t.startsWith("{"))
        try {
          const r = JSON.parse(t);
          return r && typeof r == "object" && typeof r.agent_id == "string" ? r.agent_id : "";
        } catch {
          return "";
        }
      return t.startsWith("[") ? "" : t;
    }
    const o = i(() => {
      const e = n.value?.value;
      return typeof e == "string" && e.trim() !== "";
    }), a = i(() => u(n.value?.value)), p = i(() => {
      const e = c(n.value?.selected);
      return e.length ? e : a.value ? [a.value] : [];
    }), f = i(() => o.value ? !1 : n.value?.multi !== !1), m = i(() => n.value?.placeholder || "Search agents…");
    function g(e, t) {
      if (o.value) {
        s("change", { selected: e, labels: t, agent_id: e[0] || "" });
        return;
      }
      s("change", { selected: e, labels: t });
    }
    return (e, t) => (k(), C(A, {
      source: "/api/v1/agents/list",
      "response-key": "agents",
      "id-key": "name",
      "label-key": "title",
      "desc-key": "comment",
      "icon-key": "icon",
      multi: f.value,
      placeholder: m.value,
      selected: p.value,
      onChange: g
    }, null, 8, ["multi", "placeholder", "selected"]));
  }
}), W = {
  type: "object",
  properties: {
    selected: { type: "array", items: { type: "string" }, default: [] },
    multi: { type: "boolean", default: !0 },
    placeholder: { type: "string" },
    // Config-host convention (WcMount): the current config as a JSON object string
    // whose agent_id names the selection, or a bare agent ref. Presence switches the
    // picker to single-select and adds agent_id to the change detail.
    value: { type: "string", default: "" }
  }
};
class x extends h {
  static get wippyConfig() {
    return {
      propsSchema: W,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: S
    };
  }
  static get vueConfig() {
    return { rootComponent: B, plugins: [v] };
  }
}
P(import.meta.url, x);
//# sourceMappingURL=agent_picker.js.map
