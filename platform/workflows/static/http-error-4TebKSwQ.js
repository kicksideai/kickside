import { g as _, p as E, T as F } from "./WorkflowSearchList.vue_vue_type_script_setup_true_lang-1g5-myn1.js";
import { defineComponent as L, computed as b, ref as R, openBlock as y, createBlock as A, unref as l, withCtx as f, createElementBlock as I, Fragment as M, createElementVNode as p, toDisplayString as h, createVNode as w, createCommentVNode as O } from "vue";
import C from "primevue/button";
import W from "primevue/panel";
import { Icon as N } from "@iconify/vue";
function q(e, t) {
  if (typeof e == "string" && String(t || "").includes("json"))
    try {
      return JSON.parse(e);
    } catch {
      return e;
    }
  return e;
}
function B(e) {
  return e.map((t) => ({
    data_id: String(t.data_id || ""),
    node_id: String(t.node_id || ""),
    type: String(t.type || t.data_type || ""),
    content: q(t.content, t.content_type),
    content_type: t.content_type != null ? String(t.content_type) : void 0,
    discriminator: t.discriminator != null ? String(t.discriminator) : void 0,
    created_at: t.created_at != null ? String(t.created_at) : void 0
  }));
}
async function _e(e, t = 20) {
  const n = await _(`/api/v1/workflows/${encodeURIComponent(e)}/runs?limit=${t}`);
  return (Array.isArray(n.runs) ? n.runs : []).map(j);
}
async function ye(e, t) {
  const n = await _(`/api/v1/workflows/${encodeURIComponent(e)}/runs/${encodeURIComponent(t)}`), r = j(n.run || {}), o = (Array.isArray(n.nodes) ? n.nodes : []).map((i) => ({
    engine_node_id: String(i.engine_node_id || ""),
    parent_engine_node_id: i.parent_engine_node_id != null ? String(i.parent_engine_node_id) : void 0,
    def_node_id: String(i.def_node_id || ""),
    type: String(i.type || ""),
    status: String(i.status || ""),
    title: String(i.title || "")
  })), a = n.input && typeof n.input == "object" && !Array.isArray(n.input) ? n.input : void 0;
  return { run: r, input: a, errorRouted: n.error_routed === !0, nodes: o, execution: H(n.execution) };
}
async function he(e, t, n = 100, r = 0) {
  const o = Math.max(1, Math.min(200, n)), a = Math.max(0, r), i = await _(`/api/v1/workflows/${encodeURIComponent(e)}/runs/${encodeURIComponent(t)}/events?limit=${o}&offset=${a}`), u = i.timeline && typeof i.timeline == "object" ? i.timeline : {};
  return {
    events: (Array.isArray(u.events) ? u.events : []).map((d) => ({
      seq: Number(d.seq || 0),
      occurred_at: d.occurred_at != null ? String(d.occurred_at) : void 0,
      source: String(d.source || "engine"),
      type: String(d.type || "event"),
      engine_node_id: d.engine_node_id != null ? String(d.engine_node_id) : void 0,
      ...d.raw !== void 0 ? { raw: d.raw } : {}
    })),
    count: Number(u.count || 0),
    limit: Number(u.limit || o),
    offset: Number(u.offset || a),
    next_offset: u.next_offset != null ? Number(u.next_offset) : null
  };
}
async function we(e, t) {
  const n = await _(`/api/v1/workflows/${encodeURIComponent(e)}/runs/${encodeURIComponent(t)}/export`);
  if (n.export === void 0) throw new Error("the server did not return a run export");
  return n.export;
}
async function ve(e, t, n) {
  if (!e || !t || !n) return [];
  const r = await _(`/api/v1/workflows/${encodeURIComponent(e)}/runs/${encodeURIComponent(t)}/nodes/${encodeURIComponent(n)}/data`), o = Array.isArray(r.data) ? r.data : [];
  return B(o);
}
function j(e) {
  const t = J(e), n = e.automation_ref == null ? void 0 : z(e.automation_ref);
  return {
    run_id: String(e.run_id || ""),
    ...t,
    ...n ? { automation_ref: n } : {},
    origin: e.origin != null ? String(e.origin) : void 0,
    status: String(e.status || "pending"),
    error: e.error != null ? String(e.error) : null,
    started_at: e.started_at != null ? String(e.started_at) : null,
    finished_at: e.finished_at != null ? String(e.finished_at) : null,
    ...e.output !== void 0 ? { output: e.output } : {},
    dataflow_id: e.dataflow_id != null ? String(e.dataflow_id) : void 0,
    ...e.dataflow_status != null ? { dataflow_status: String(e.dataflow_status) } : {}
  };
}
function P(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = typeof t.id == "string" ? t.id : "", r = Number(t.version);
  if (t.kind !== "flow" || !n || !Number.isInteger(r) || r < 1)
    throw new Error("the server returned an invalid Workflow reference");
  return { kind: "flow", id: n, version: r };
}
function V(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = typeof t.id == "string" ? t.id : "", r = Number(t.def_seq);
  if (t.kind !== "flow" || !n || !Number.isInteger(r) || r < 0)
    throw new Error("the server returned an invalid Workflow draft reference");
  return { kind: "flow", id: n, def_seq: r };
}
function z(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = typeof t.id == "string" ? t.id : "", r = Number(t.revision);
  if (t.kind !== "automation" || !n || !Number.isInteger(r) || r < 1)
    throw new Error("the server returned an invalid Automation reference");
  return { kind: "automation", id: n, revision: r };
}
function J(e) {
  if (e.flow_ref != null && e.draft_ref == null) return { flow_ref: P(e.flow_ref) };
  if (e.draft_ref != null && e.flow_ref == null) return { draft_ref: V(e.draft_ref) };
  throw new Error("the server must return exactly one Workflow run reference");
}
function H(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = t.process && typeof t.process == "object" && !Array.isArray(t.process) ? t.process : null;
  return {
    dataflow_id: t.dataflow_id != null ? String(t.dataflow_id) : void 0,
    parent_dataflow_id: t.parent_dataflow_id != null ? String(t.parent_dataflow_id) : void 0,
    ...n ? { process: {
      id: n.id != null ? String(n.id) : void 0,
      host: n.host != null ? String(n.host) : void 0,
      pid: n.pid != null ? String(n.pid) : void 0
    } } : {}
  };
}
async function Se(e, t = {}) {
  const n = {};
  t.input !== void 0 && (n.input = t.input);
  const r = await E(`/api/v1/workflows/${encodeURIComponent(e)}/simulate`, n), o = String(r.run_id || "");
  if (!o) throw new Error("the server did not return a run id");
  return o;
}
async function be(e, t, n = {}) {
  if (!Number.isInteger(t) || t < 1) throw new Error("a published Workflow version is required");
  const r = await E(`/api/v1/workflows/${encodeURIComponent(e)}/run`, { version: t, input: n }), o = String(r.run_id || "");
  if (!o) throw new Error("the server did not return a run id");
  return o;
}
function m(e, t) {
  for (let n = e.length - 1; n >= 0; n--)
    if (e[n].type === t && e[n].content != null) return e[n];
}
function G(e) {
  const t = m(e, "node.input");
  return t ? t.content : null;
}
function Y(e) {
  const t = m(e, "node.output");
  if (t) return t.content;
  const n = m(e, "node.result")?.content;
  if (n && typeof n == "object" && "data_ids" in n && "output" in n)
    return n.output ?? null;
  const r = m(e, "agent.action");
  if (r) {
    const a = r.content;
    if (a && typeof a == "object" && "result" in a) {
      const i = a.result;
      if (i != null) return i;
    }
    return a;
  }
  const o = m(e, "node.result");
  if (o) {
    const a = o.content;
    return a && typeof a == "object" && "data_ids" in a && "success" in a ? a.output ?? null : a;
  }
  return null;
}
const D = /^(failed|failure|error|node failed|step failed)\.?$/i, g = "This step failed.";
function v(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function S(...e) {
  for (const t of e) if (typeof t == "string" && t.trim()) return t.trim();
}
function K(e) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t];
    if (n.type === "node.error" || n.type === "node.result" && (n.discriminator || "").startsWith("result.error")) return n;
  }
}
function Q(e) {
  if (!v(e)) return { message: g, hasDetail: !1 };
  const t = S(e.code), n = S(e.message);
  return { message: n || g, code: t, detail: e, hasDetail: !!n };
}
function X(e) {
  const t = K(e);
  return t ? Q(t.content) : null;
}
function Z(e) {
  const t = e.trim();
  if (t.startsWith("{") || t.startsWith("["))
    try {
      return JSON.parse(t);
    } catch {
      return;
    }
}
function x(e) {
  const t = S(e.code), n = S(e.message);
  return n && !D.test(n) ? { message: n, code: t, generic: !1 } : { message: g, code: t, generic: !0 };
}
function ee(e) {
  if (e == null) return { message: "", generic: !0 };
  if (v(e)) return x(e);
  const t = String(e).trim();
  if (!t) return { message: "", generic: !0 };
  const n = t.match(/^Node\s+\[[^\]]+\]\s+failed:\s*(.*)$/i), r = (n ? n[1] : t).trim(), o = Z(r);
  return v(o) ? x(o) : !r || D.test(r) ? { message: g, generic: !0 } : { message: r, generic: !1 };
}
function T(e) {
  const t = ee(e);
  return t.generic ? "" : t.message;
}
function te(e) {
  const t = [];
  for (const n of e) {
    if (n.type !== "agent.action" || n.content == null) continue;
    const r = n.content, o = v(r) ? r : {};
    t.push({
      result: "result" in o ? o.result : void 0,
      toolCalls: Array.isArray(o.tool_calls) ? o.tool_calls : [],
      raw: r
    });
  }
  return t;
}
function ne(e) {
  let t = Number.POSITIVE_INFINITY, n = Number.NEGATIVE_INFINITY, r, o;
  for (const a of e) {
    if (!a.created_at) continue;
    const i = Date.parse(a.created_at);
    Number.isFinite(i) && (i < t && (t = i, r = a.created_at), i > n && (n = i, o = a.created_at));
  }
  return !Number.isFinite(t) || !Number.isFinite(n) ? {} : { startedAt: r, finishedAt: o, durationMs: Math.max(0, n - t) };
}
function Re(e) {
  if (!Number.isFinite(e) || e < 0) return "—";
  if (e < 1e3) return `${Math.round(e)}ms`;
  if (e < 6e4) return `${(e / 1e3).toFixed(1)}s`;
  const t = Math.round(e / 1e3), n = Math.floor(t / 60), r = t % 60;
  return `${n}m ${r}s`;
}
function re(e) {
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function oe(e, t = 40) {
  const n = e.split(`
`);
  return n.length <= t ? { preview: e, truncated: !1, totalLines: n.length, hiddenLines: 0 } : {
    preview: n.slice(0, t).join(`
`),
    truncated: !0,
    totalLines: n.length,
    hiddenLines: n.length - t
  };
}
function Ne(e, t = {}) {
  let n = X(e);
  if (!n && t.failed) {
    const r = T(t.runError);
    n = r ? { message: r, hasDetail: !0 } : { message: g, hasDetail: !1 };
  }
  return {
    input: G(e),
    output: Y(e),
    error: n,
    agentActions: te(e),
    timing: ne(e)
  };
}
function U(e) {
  const t = e.toLowerCase();
  return t === "completed" || t === "complete" || t === "success" || t === "succeeded" ? "ok" : t === "failed" || t === "error" || t === "cancelled" || t === "canceled" || t === "terminated" ? "error" : "pending";
}
function ke(e) {
  return U(e.status) === "pending" && e.dataflow_status === "waiting" ? "waiting" : e.status;
}
function Ae(e) {
  return U(e.status) === "error" ? T(e.error) : "";
}
function Ie(e) {
  const t = e.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Pending";
}
function Ce(e) {
  return [...e].sort((t, n) => {
    const r = Date.parse(t.started_at || t.finished_at || "") || 0, o = Date.parse(n.started_at || n.finished_at || "") || 0;
    return o !== r ? o - r : n.run_id.localeCompare(t.run_id);
  });
}
function xe(e, t = Date.now()) {
  if (!e) return "—";
  const n = Date.parse(e);
  if (!Number.isFinite(n)) return "—";
  const r = Math.round((t - n) / 1e3);
  if (r < 5) return "just now";
  if (r < 60) return `${r}s ago`;
  const o = Math.round(r / 60);
  if (o < 60) return `${o}m ago`;
  const a = Math.round(o / 60);
  if (a < 24) return `${a}h ago`;
  const i = Math.round(a / 24);
  return i < 30 ? `${i}d ago` : new Date(n).toLocaleDateString();
}
function $e(e) {
  return e.length > 8 ? e.slice(0, 8) : e;
}
function Ee(e) {
  const t = Number(e) || 0;
  return t > 0 ? { label: `v${t}`, kind: "published", title: `Ran published version ${t}` } : { label: "Draft run", kind: "draft", title: "Ran your current draft — not a published version" };
}
const ie = /* @__PURE__ */ new Set(["completed", "failed", "cancelled", "canceled", "terminated"]);
function $(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function je(e, t) {
  if (!t) return !1;
  const n = $(e), r = $(n.data), o = Object.keys(r).length ? r : n, a = String(o.thread_id || n.thread_id || ""), i = String(n.topic || o.topic || "");
  return String(o.event_type || n.event_type || "") === "events.appended" && (a === t || !a && i === `kickside.thread.${t}`);
}
function ae(e) {
  return !ie.has(e.toLowerCase());
}
function se(e) {
  const t = e.toLowerCase();
  return t === "completed" || t === "complete" || t === "done" || t === "success" || t === "succeeded" ? "completed" : t === "failed" || t === "error" || t === "cancelled" || t === "canceled" || t === "terminated" ? "failed" : t === "running" || t === "active" || t === "executing" || t === "started" ? "running" : t === "pending" || t === "queued" || t === "waiting" || t === "blocked" || t === "ready" ? "pending" : "idle";
}
function De(e, t, n, r = !1) {
  const o = n.toLowerCase(), a = ae(o), i = {};
  for (const s of Object.keys(e.nodes)) i[s] = "idle";
  for (const s of t) {
    if (!s.def_node_id || !(s.def_node_id in e.nodes)) continue;
    let d = se(s.status);
    a && F(e.nodes[s.def_node_id].kind, e.nodes[s.def_node_id].ref) && (d === "running" || d === "pending") && (d = "awaiting"), i[s.def_node_id] = d;
  }
  for (const s of Object.values(e.nodes))
    s.kind === "start" && n ? i[s.id] = "completed" : s.kind === "finish" ? o === "completed" ? i[s.id] = "completed" : a && (i[s.id] = "pending") : s.kind === "error" && o === "failed" && r && (i[s.id] = "failed");
  const u = {};
  for (const s of Object.values(e.edges)) {
    const d = i[s.source_id] || "idle", c = i[s.target_id] || "idle";
    d === "completed" && (c === "completed" || c === "failed") || d === "failed" && c === "failed" ? u[s.id] = "done" : d === "completed" && (c === "running" || c === "pending" || c === "awaiting") ? u[s.id] = "active" : u[s.id] = "idle";
  }
  return { active: a, node: i, edge: u };
}
function Te() {
  return { active: !1, node: {}, edge: {} };
}
function Ue(e) {
  return Object.values(e.nodes).find((t) => t.kind === "start")?.id || "";
}
const ue = { class: "wf-payload-title" }, de = ["source"], ce = { class: "wf-run-output wf-mono" }, Fe = /* @__PURE__ */ L({
  __name: "RunPayload",
  props: {
    value: {},
    label: {},
    icon: { default: "tabler:code" },
    open: { type: Boolean, default: !0 },
    maxLines: { default: 40 }
  },
  setup(e) {
    const t = e, n = b(() => typeof t.value == "string"), r = b(() => re(t.value)), o = b(() => oe(r.value, t.maxLines)), a = R(!t.open), i = R(!1), u = R(!1);
    async function s() {
      try {
        await navigator.clipboard.writeText(r.value), u.value = !0, setTimeout(() => {
          u.value = !1;
        }, 1400);
      } catch {
      }
    }
    return (d, c) => (y(), A(l(W), {
      collapsed: a.value,
      "onUpdate:collapsed": c[1] || (c[1] = (k) => a.value = k),
      class: "wf-payload",
      toggleable: ""
    }, {
      header: f(() => [
        p("span", ue, [
          w(l(N), {
            icon: e.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          p("span", null, h(e.label), 1)
        ])
      ]),
      icons: f(() => [
        w(l(C), {
          class: "wf-payload-copy",
          severity: "secondary",
          outlined: "",
          size: "small",
          title: u.value ? "Copied" : "Copy to clipboard",
          onClick: s
        }, {
          default: f(() => [
            w(l(N), {
              icon: u.value ? "tabler:check" : "tabler:copy",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            p("span", null, h(u.value ? "Copied" : "Copy"), 1)
          ]),
          _: 1
        }, 8, ["title"])
      ]),
      default: f(() => [
        n.value ? (y(), I("wc-render-markdown", {
          key: 0,
          class: "wf-run-md",
          source: String(e.value)
        }, null, 8, de)) : (y(), I(M, { key: 1 }, [
          p("pre", ce, h(i.value || !o.value.truncated ? r.value : o.value.preview), 1),
          o.value.truncated ? (y(), A(l(C), {
            key: 0,
            class: "wf-payload-more",
            severity: "secondary",
            outlined: "",
            size: "small",
            onClick: c[0] || (c[0] = (k) => i.value = !i.value)
          }, {
            default: f(() => [
              w(l(N), {
                icon: i.value ? "tabler:chevrons-up" : "tabler:chevrons-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              p("span", null, h(i.value ? "Show less" : `Show ${o.value.hiddenLines} more lines`), 1)
            ]),
            _: 1
          })) : O("", !0)
        ], 64))
      ]),
      _: 1
    }, 8, ["collapsed"]));
  }
});
function Le(e) {
  const t = e;
  return Number(t?.response?.status ?? t?.status ?? 0);
}
export {
  be as A,
  Fe as _,
  U as a,
  Ie as b,
  Ae as c,
  ae as d,
  De as e,
  Se as f,
  ye as g,
  Te as h,
  je as i,
  he as j,
  Re as k,
  _e as l,
  Ee as m,
  se as n,
  ke as o,
  ee as p,
  $e as q,
  xe as r,
  Ue as s,
  ve as t,
  Ne as u,
  we as v,
  Ce as w,
  Le as x,
  Y as y,
  T as z
};
