import { api as r } from "@wippy-fe/proxy";
const n = "/api/v1";
function v() {
  async function a(e, s) {
    const { data: t } = await r.get(`${n}/sessions?limit=${e}&offset=${s}`);
    if (!t?.success) throw new Error(t?.error || "Failed to load sessions");
    return { sessions: t.sessions || [], total: t.count || 0 };
  }
  async function i() {
    try {
      const { data: e } = await r.get(`${n}/user-agents`), s = {};
      for (const t of e?.agents || [])
        t.id && t.title && (s[t.id] = t.title);
      return s;
    } catch {
      return {};
    }
  }
  async function c() {
    try {
      const { data: e } = await r.get(`${n}/connections/providers/badges`), s = /* @__PURE__ */ Object.create(null);
      for (const t of e?.providers || []) {
        const o = typeof t.provider == "string" ? t.provider.trim().toLowerCase() : "";
        if (!o) continue;
        const y = typeof t.title == "string" && t.title.trim() ? t.title.trim() : o, $ = typeof t.icon == "string" && t.icon.trim() ? t.icon.trim() : "tabler:plug-connected";
        s[o] = { icon: $, label: y };
      }
      return s;
    } catch {
      return /* @__PURE__ */ Object.create(null);
    }
  }
  async function d(e, s = 30) {
    const t = `${n}/sessions/messages?session_id=${encodeURIComponent(e)}&limit=${s}`, { data: o } = await r.get(t);
    if (!o?.success) throw new Error(o?.error || "Failed to load messages");
    return o.messages || [];
  }
  async function u(e, s) {
    const { data: t } = await r.post(`${n}/sessions/rename`, {
      session_id: e,
      title: s
    });
    if (!t?.success) throw new Error(t?.error || "Failed to rename session");
  }
  async function f(e) {
    const s = `${n}/sessions/delete?session_id=${encodeURIComponent(e)}`, { data: t } = await r.delete(s);
    if (!t?.success) throw new Error(t?.error || "Failed to delete session");
  }
  async function l(e, s) {
    const { data: t } = await r.post(`${n}/sessions/favorite`, {
      session_id: e,
      favorite: s
    });
    if (!t?.success) throw new Error(t?.error || "Failed to update favorite");
  }
  async function w(e, s) {
    const { data: t } = await r.post(`${n}/sessions/start-token`, { agent: e, model: s });
    if (!t?.success || !t.token) throw new Error(t?.error || "Failed to start a new chat");
    return t.token;
  }
  async function m(e = {}) {
    const s = new URLSearchParams();
    s.set("limit", String(e.limit || 48)), e.sessionId && s.set("session_id", e.sessionId), e.cursor && s.set("cursor", e.cursor);
    const { data: t } = await r.get(`${n}/artifacts?${s.toString()}`);
    if (!t?.success) throw new Error(t?.error || "Failed to load artifacts");
    return {
      artifacts: t.artifacts || [],
      hasMore: t.pagination?.has_more === !0,
      nextCursor: t.pagination?.next_cursor || ""
    };
  }
  async function g(e) {
    const { data: s } = await r.get(`${n}/artifact/${encodeURIComponent(e)}`);
    if (!s?.uuid) throw new Error(s?.error || "Failed to load artifact");
    return { ...s, artifact_id: s.artifact_id || s.uuid };
  }
  async function p(e) {
    const { data: s } = await r.get(`${n}/artifact/${encodeURIComponent(e)}/content`, {
      responseType: "text"
    });
    return typeof s == "string" ? s : JSON.stringify(s, null, 2);
  }
  return { list: a, messages: d, rename: u, remove: f, setFavorite: l, startToken: w, agentTitles: i, providerBadges: c, artifacts: m, artifact: g, artifactContent: p };
}
export {
  v as u
};
//# sourceMappingURL=useSessionsApi-P7vRdJK6.js.map
