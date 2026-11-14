import { api as r } from "@wippy-fe/proxy";
const a = "/api/v1";
function F() {
  async function u(s, e) {
    const { data: t } = await r.get(`${a}/sessions?limit=${s}&offset=${e}`);
    if (!t?.success) throw new Error(t?.error || "Failed to load sessions");
    return { sessions: t.sessions || [], total: t.count || 0 };
  }
  async function d() {
    try {
      const { data: s } = await r.get(`${a}/user-agents`), e = {};
      for (const t of s?.agents || [])
        t.id && t.title && (e[t.id] = t.title);
      return e;
    } catch {
      return {};
    }
  }
  async function f() {
    const { data: s } = await r.get(`${a}/agents/list`);
    if (!s?.success) throw new Error(s?.error || "Failed to load agents");
    const e = (n) => (n || []).filter((c) => c.name && c.start_token), t = (s.grouped || []).map((n) => ({ title: n.title || "", agents: e(n.agents) })).filter((n) => n.agents.length > 0), o = new Set(t.flatMap((n) => n.agents.map((c) => c.name))), i = e(s.agents).filter((n) => !o.has(n.name));
    return i.length > 0 && t.push({ title: t.length > 0 ? "Other" : "", agents: i }), t;
  }
  async function l() {
    try {
      const { data: s } = await r.get(`${a}/connections/providers/badges`), e = /* @__PURE__ */ Object.create(null);
      for (const t of s?.providers || []) {
        const o = typeof t.provider == "string" ? t.provider.trim().toLowerCase() : "";
        if (!o) continue;
        const i = typeof t.title == "string" && t.title.trim() ? t.title.trim() : o, n = typeof t.icon == "string" && t.icon.trim() ? t.icon.trim() : "tabler:plug-connected";
        e[o] = { icon: n, label: i };
      }
      return e;
    } catch {
      return /* @__PURE__ */ Object.create(null);
    }
  }
  async function g(s, e = 30) {
    const t = `${a}/sessions/messages?session_id=${encodeURIComponent(s)}&limit=${e}`, { data: o } = await r.get(t);
    if (!o?.success) throw new Error(o?.error || "Failed to load messages");
    return o.messages || [];
  }
  async function w(s, e) {
    const { data: t } = await r.post(`${a}/sessions/rename`, {
      session_id: s,
      title: e
    });
    if (!t?.success) throw new Error(t?.error || "Failed to rename session");
  }
  async function m(s) {
    const e = `${a}/sessions/delete?session_id=${encodeURIComponent(s)}`, { data: t } = await r.delete(e);
    if (!t?.success) throw new Error(t?.error || "Failed to delete session");
  }
  async function p(s, e) {
    const { data: t } = await r.post(`${a}/sessions/favorite`, {
      session_id: s,
      favorite: e
    });
    if (!t?.success) throw new Error(t?.error || "Failed to update favorite");
  }
  async function h(s, e) {
    const { data: t } = await r.post(`${a}/sessions/start-token`, { agent: s, model: e });
    if (!t?.success || !t.token) throw new Error(t?.error || "Failed to start a new chat");
    return t.token;
  }
  async function y(s = {}) {
    const e = new URLSearchParams();
    e.set("limit", String(s.limit || 48)), s.sessionId && e.set("session_id", s.sessionId), s.cursor && e.set("cursor", s.cursor);
    const { data: t } = await r.get(`${a}/artifacts?${e.toString()}`);
    if (!t?.success) throw new Error(t?.error || "Failed to load artifacts");
    return {
      artifacts: t.artifacts || [],
      hasMore: t.pagination?.has_more === !0,
      nextCursor: t.pagination?.next_cursor || ""
    };
  }
  async function $(s) {
    const { data: e } = await r.get(`${a}/artifact/${encodeURIComponent(s)}`);
    if (!e?.uuid) throw new Error(e?.error || "Failed to load artifact");
    return { ...e, artifact_id: e.artifact_id || e.uuid };
  }
  async function v(s) {
    const { data: e } = await r.get(`${a}/artifact/${encodeURIComponent(s)}/content`, {
      responseType: "text"
    });
    return typeof e == "string" ? e : JSON.stringify(e, null, 2);
  }
  return { list: u, messages: g, rename: w, remove: m, setFavorite: p, startToken: h, agentTitles: d, chatAgents: f, providerBadges: l, artifacts: y, artifact: $, artifactContent: v };
}
export {
  F as u
};
//# sourceMappingURL=useSessionsApi-BQAm970o.js.map
