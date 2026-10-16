import { u as y, g as C, W as h, P as _ } from "./primevue-plugin-Dn0ACs8V.js";
import { computed as p, defineComponent as I, ref as s, onMounted as P, openBlock as w, createBlock as E, unref as S } from "vue";
import { api as u, define as b } from "@wippy-fe/proxy";
import { _ as k, l as x } from "./toolCatalog-B7JOn9aF.js";
import { s as A } from "./styles-CiCzyjUM.js";
import "@iconify/vue";
function V(o) {
  return p(() => {
    const t = o.value;
    return t ? (typeof t.parentId == "string" ? t.parentId : "").trim() : "";
  });
}
const B = /* @__PURE__ */ I({
  __name: "AgentEdit",
  setup(o) {
    const t = y(), a = C(), d = p(() => {
      const e = t.value;
      return e.componentId || e.entryId || (e.parentId ? "" : e.route || "");
    }), n = p(() => d.value || null), m = V(t), r = s([]), i = s([]), c = s([]), l = s([]);
    async function g() {
      try {
        const { data: e } = await u.get("/api/v1/agents/traits");
        r.value = e?.success ? e.traits || [] : [];
      } catch {
        r.value = [];
      }
      try {
        i.value = await x();
      } catch {
        i.value = [];
      }
      try {
        const { data: e } = await u.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        c.value = e?.success ? e.models || [] : [];
      } catch {
        c.value = [];
      }
      try {
        const { data: e } = await u.get("/api/v1/user-agents");
        l.value = e?.success ? e.agents || [] : [];
      } catch {
        l.value = [];
      }
    }
    P(g);
    function v(e) {
      n.value ? a("saved", { id: e || n.value }) : a("created", { id: e || "" });
    }
    function f() {
      a("close", { id: n.value || "" });
    }
    return (e, O) => (w(), E(k, {
      open: !0,
      embedded: !0,
      "agent-id": n.value,
      "parent-id": S(m).value,
      traits: r.value,
      tools: i.value,
      models: c.value,
      agents: l.value,
      onSaved: v,
      onClose: f
    }, null, 8, ["agent-id", "parent-id", "traits", "tools", "models", "agents"]));
  }
}), K = {
  type: "object",
  properties: {
    route: { type: "string" },
    "parent-id": { type: "string" },
    "component-id": { type: "string" },
    "entry-id": { type: "string" },
    mode: { type: "string" }
  }
};
class M extends h {
  static get wippyConfig() {
    return {
      propsSchema: K,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: A
    };
  }
  static get vueConfig() {
    return { rootComponent: B, plugins: [_] };
  }
}
b(import.meta.url, M);
//# sourceMappingURL=agent_edit.js.map
