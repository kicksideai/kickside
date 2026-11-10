import { api as r } from "@wippy-fe/proxy";
const n = "/api/v1";
function E() {
  async function a(s, e) {
    const { data: t } = await r.get(`${n}/sessions?limit=${s}&offset=${e}`);
    if (!t?.success) throw new Error(t?.error || "Failed to load sessions");
    return { sessions: t.sessions || [], total: t.count || 0 };
  }
  async function i() {
    try {
      const { data: s } = await r.get(`${n}/user-agents`), e = {};
      for (const t of s?.agents || [])
        t.id && t.title && (e[t.id] = t.title);
      return e;
    } catch {
      return {};
    }
  }
  async function c() {
    const { data: s } = await r.get(`${n}/agents/list`);
    if (!s?.success) throw new Error(s?.error || "Failed to load agents");
    return (s.agents || []).filter((e) => e.name && e.start_token);
  }
  async function d() {
    try {
      const { data: s } = await r.get(`${n}/connections/providers/badges`), e = /* @__PURE__ */ Object.create(null);
      for (const t of s?.providers || []) {
        const o = typeof t.provider == "string" ? t.provider.trim().toLowerCase() : "";
        if (!o) continue;
        const $ = typeof t.title == "string" && t.title.trim() ? t.title.trim() : o, h = typeof t.icon == "string" && t.icon.trim() ? t.icon.trim() : "tabler:plug-connected";
        e[o] = { icon: h, label: $ };
      }
      return e;
    } catch {
      return /* @__PURE__ */ Object.create(null);
    }
  }
  async function u(s, e = 30) {
    const t = `${n}/sessions/messages?session_id=${encodeURIComponent(s)}&limit=${e}`, { data: o } = await r.get(t);
    if (!o?.success) throw new Error(o?.error || "Failed to load messages");
    return o.messages || [];
  }
  async function f(s, e) {
    const { data: t } = await r.post(`${n}/sessions/rename`, {
      session_id: s,
      title: e
    });
    if (!t?.success) throw new Error(t?.error || "Failed to rename session");
  }
  async function l(s) {
    const e = `${n}/sessions/delete?session_id=${encodeURIComponent(s)}`, { data: t } = await r.delete(e);
    if (!t?.success) throw new Error(t?.error || "Failed to delete session");
  }
  async function w(s, e) {
    const { data: t } = await r.post(`${n}/sessions/favorite`, {
      session_id: s,
      favorite: e
    });
    if (!t?.success) throw new Error(t?.error || "Failed to update favorite");
  }
  async function g(s, e) {
    const { data: t } = await r.post(`${n}/sessions/start-token`, { agent: s, model: e });
    if (!t?.success || !t.token) throw new Error(t?.error || "Failed to start a new chat");
    return t.token;
  }
  async function m(s = {}) {
    const e = new URLSearchParams();
    e.set("limit", String(s.limit || 48)), s.sessionId && e.set("session_id", s.sessionId), s.cursor && e.set("cursor", s.cursor);
    const { data: t } = await r.get(`${n}/artifacts?${e.toString()}`);
    if (!t?.success) throw new Error(t?.error || "Failed to load artifacts");
    return {
      artifacts: t.artifacts || [],
      hasMore: t.pagination?.has_more === !0,
      nextCursor: t.pagination?.next_cursor || ""
    };
  }
  async function p(s) {
    const { data: e } = await r.get(`${n}/artifact/${encodeURIComponent(s)}`);
    if (!e?.uuid) throw new Error(e?.error || "Failed to load artifact");
    return { ...e, artifact_id: e.artifact_id || e.uuid };
  }
  async function y(s) {
    const { data: e } = await r.get(`${n}/artifact/${encodeURIComponent(s)}/content`, {
      responseType: "text"
    });
    return typeof e == "string" ? e : JSON.stringify(e, null, 2);
  }
  return { list: a, messages: u, rename: f, remove: l, setFavorite: w, startToken: g, agentTitles: i, chatAgents: c, providerBadges: d, artifacts: m, artifact: p, artifactContent: y };
}
export {
  E as u
};
//# sourceMappingURL=useSessionsApi-DkMU6ZyM.js.map
