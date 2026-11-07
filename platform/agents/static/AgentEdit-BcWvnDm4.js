import { computed as i, defineComponent as _, ref as o, onMounted as h, openBlock as I, createBlock as y, unref as w } from "vue";
import { api as u } from "@wippy-fe/proxy";
import { a as C, u as P } from "./wc-runtime-KO3cNuNo.js";
import { _ as b, l as k } from "./toolCatalog-Du07yUyf.js";
function x(d) {
  return i(() => {
    const e = d.value;
    return e ? (typeof e.parentId == "string" ? e.parentId : "").trim() : "";
  });
}
const S = /* @__PURE__ */ _({
  __name: "AgentEdit",
  setup(d) {
    const e = C(), a = P(), p = i(() => {
      const t = e.value;
      return t.componentId || t.entryId || (t.parentId ? "" : t.route || "");
    }), n = i(() => p.value || null), v = x(e), s = o([]), c = o([]), r = o([]), l = o([]);
    async function m() {
      try {
        const { data: t } = await u.get("/api/v1/agents/traits");
        s.value = t?.success ? t.traits || [] : [];
      } catch {
        s.value = [];
      }
      try {
        c.value = await k();
      } catch {
        c.value = [];
      }
      try {
        const { data: t } = await u.get("/api/v1/models/list?capability=generate", { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
        r.value = t?.success ? t.models || [] : [];
      } catch {
        r.value = [];
      }
      try {
        const { data: t } = await u.get("/api/v1/user-agents");
        l.value = t?.success ? t.agents || [] : [];
      } catch {
        l.value = [];
      }
    }
    h(m);
    function f(t) {
      n.value ? a("saved", { id: t || n.value }) : a("created", { id: t || "" });
    }
    function g() {
      a("close", { id: n.value || "" });
    }
    return (t, B) => (I(), y(b, {
      open: !0,
      embedded: !0,
      "agent-id": n.value,
      "parent-id": w(v).value,
      traits: s.value,
      tools: c.value,
      models: r.value,
      agents: l.value,
      onSaved: f,
      onClose: g
    }, null, 8, ["agent-id", "parent-id", "traits", "tools", "models", "agents"]));
  }
});
export {
  S as default
};
//# sourceMappingURL=AgentEdit-BcWvnDm4.js.map
