import { api as h } from "@wippy-fe/proxy";
import { g as f, a as s, U as w, p } from "./WorkflowSearchList.vue_vue_type_script_setup_true_lang-1g5-myn1.js";
async function b(o, e, n) {
  const r = await p(`/api/v1/workflows/${encodeURIComponent(o)}/assist/binding`, {
    source_context_schema: e,
    target_start_schema: n,
    source_root: "payload",
    intent: "Map the source item to the Workflow Start input."
  });
  if (typeof r.transform != "string" || !r.transform) throw new Error("Binding assist returns no transform.");
  return r.transform;
}
async function y(o) {
  const e = await f(`/api/v1/workflows/${encodeURIComponent(o)}/versions`);
  return (Array.isArray(e.versions) ? e.versions : []).map((r) => ({
    version: Number(r.version || 0),
    def_seq: Number(r.def_seq || 0),
    created_at: r.created_at != null ? String(r.created_at) : void 0,
    created_by: r.created_by != null ? String(r.created_by) : void 0
  })).filter((r) => r.version > 0);
}
async function S(o, e) {
  const n = await f(`/api/v1/workflows/${encodeURIComponent(o)}/versions/${encodeURIComponent(String(e))}`), r = s(n.version);
  return {
    version: Number(r.version || 0),
    def_seq: Number(r.def_seq || 0),
    created_at: r.created_at != null ? String(r.created_at) : void 0,
    created_by: r.created_by != null ? String(r.created_by) : void 0,
    interface: w(r.interface) ?? null,
    input_schema: r.input_schema
  };
}
function a(o) {
  return Array.isArray(o) ? o.map((e) => {
    const n = s(e);
    return { id: String(n.id || ""), before: Object.keys(s(n.before)).length ? s(n.before) : void 0, after: Object.keys(s(n.after)).length ? s(n.after) : void 0 };
  }).filter((e) => !!e.id) : [];
}
async function k(o, e, n) {
  const r = await f(`/api/v1/workflows/${encodeURIComponent(o)}/versions/diff?from_version=${encodeURIComponent(String(e))}&to_version=${encodeURIComponent(String(n))}`), t = s(r.diff), u = s(t.graph), c = s(u.nodes), d = s(u.edges), i = s(t.interface);
  return {
    from_version: Number(t.from_version || e),
    to_version: Number(t.to_version || n),
    interface: { before: i.before, after: i.after, changes: Array.isArray(i.changes) ? i.changes : [] },
    graph: {
      nodes: { added: a(c.added), removed: a(c.removed), changed: a(c.changed) },
      edges: { added: a(d.added), removed: a(d.removed), changed: a(d.changed) }
    }
  };
}
async function I(o, e) {
  const n = await p(`/api/v1/workflows/${encodeURIComponent(o)}/versions/${encodeURIComponent(String(e))}/restore`, {}), r = s(n.flow), t = String(r.flow_id || "");
  if (!t) throw new Error("the server did not return the restored Workflow draft");
  return t;
}
class l extends Error {
  issues;
  constructor(e, n) {
    super(e), this.name = "PublishError", this.issues = n;
  }
}
function g(o) {
  return !o || !Array.isArray(o.errors) ? [] : o.errors.map((e) => ({
    code: e.code != null ? String(e.code) : "",
    message: e.message != null ? String(e.message) : "",
    nodeId: e.node_id != null ? String(e.node_id) : ""
  })).filter((e) => e.message || e.code);
}
function m(o) {
  if (!o || o.success !== !1) return "";
  const n = (Array.isArray(o.errors) ? o.errors : []).map((r) => String(r.message || r.code || "")).filter(Boolean);
  return n.length ? `Not publishable: ${n.join("; ")}` : String(o.error || "");
}
async function C(o) {
  let e;
  try {
    e = (await h.post(`/api/v1/workflows/${encodeURIComponent(o)}/publish`, {})).data;
  } catch (n) {
    const r = n?.response?.data, t = m(r);
    throw t ? new l(t, g(r)) : n;
  }
  if (e && e.success === !1) throw new l(m(e) || String(e.error || "publish refused"), g(e));
  return { version: Number(e.version || 0), hash: e.hash != null ? String(e.hash) : void 0 };
}
export {
  l as P,
  k as a,
  b,
  S as g,
  y as l,
  C as p,
  I as r
};
