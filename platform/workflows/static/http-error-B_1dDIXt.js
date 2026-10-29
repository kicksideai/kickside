import { g as k, p as M, Y as G, f as E } from "./pickerselect-CbBE-k9N.js";
import { B as U, d as F, i as O, c as W, h as Z } from "./index-BhiG6P-P.js";
import { openBlock as p, createElementBlock as g, mergeProps as u, createBlock as C, resolveDynamicComponent as z, createCommentVNode as w, renderSlot as m, createElementVNode as c, toDisplayString as b, resolveComponent as Q, normalizeClass as X, createVNode as v, withCtx as y, Transition as ee, withDirectives as te, vShow as ne, defineComponent as re, computed as R, ref as N, unref as h, Fragment as oe } from "vue";
import { Icon as T } from "@iconify/vue";
function ae(e, t) {
  if (typeof e == "string" && String(t || "").includes("json"))
    try {
      return JSON.parse(e);
    } catch {
      return e;
    }
  return e;
}
function ie(e) {
  return e.map((t) => ({
    data_id: String(t.data_id || ""),
    node_id: String(t.node_id || ""),
    type: String(t.type || t.data_type || ""),
    content: ae(t.content, t.content_type),
    content_type: t.content_type != null ? String(t.content_type) : void 0,
    discriminator: t.discriminator != null ? String(t.discriminator) : void 0,
    created_at: t.created_at != null ? String(t.created_at) : void 0
  }));
}
async function ut(e, t = 20) {
  const n = await k(`/api/v1/workflows/${encodeURIComponent(e)}/runs?limit=${t}`);
  return (Array.isArray(n.runs) ? n.runs : []).map(H);
}
async function ct(e, t) {
  const n = await k(`/api/v1/workflows/${encodeURIComponent(e)}/runs/${encodeURIComponent(t)}`), r = H(n.run || {}), o = (Array.isArray(n.nodes) ? n.nodes : []).map((i) => ({
    engine_node_id: String(i.engine_node_id || ""),
    parent_engine_node_id: i.parent_engine_node_id != null ? String(i.parent_engine_node_id) : void 0,
    def_node_id: String(i.def_node_id || ""),
    type: String(i.type || ""),
    status: String(i.status || ""),
    title: String(i.title || "")
  })), a = n.input && typeof n.input == "object" && !Array.isArray(n.input) ? n.input : void 0;
  return { run: r, input: a, errorRouted: n.error_routed === !0, nodes: o, execution: ce(n.execution) };
}
async function pt(e, t, n = 100, r = 0) {
  const o = Math.max(1, Math.min(200, n)), a = Math.max(0, r), i = await k(`/api/v1/workflows/${encodeURIComponent(e)}/runs/${encodeURIComponent(t)}/events?limit=${o}&offset=${a}`), d = i.timeline && typeof i.timeline == "object" ? i.timeline : {};
  return {
    events: (Array.isArray(d.events) ? d.events : []).map((l) => ({
      seq: Number(l.seq || 0),
      occurred_at: l.occurred_at != null ? String(l.occurred_at) : void 0,
      source: String(l.source || "engine"),
      type: String(l.type || "event"),
      engine_node_id: l.engine_node_id != null ? String(l.engine_node_id) : void 0,
      ...l.raw !== void 0 ? { raw: l.raw } : {}
    })),
    count: Number(d.count || 0),
    limit: Number(d.limit || o),
    offset: Number(d.offset || a),
    next_offset: d.next_offset != null ? Number(d.next_offset) : null
  };
}
async function ft(e, t) {
  const n = await k(`/api/v1/workflows/${encodeURIComponent(e)}/runs/${encodeURIComponent(t)}/export`);
  if (n.export === void 0) throw new Error("the server did not return a run export");
  return n.export;
}
async function gt(e, t, n) {
  if (!e || !t || !n) return [];
  const r = await k(`/api/v1/workflows/${encodeURIComponent(e)}/runs/${encodeURIComponent(t)}/nodes/${encodeURIComponent(n)}/data`), o = Array.isArray(r.data) ? r.data : [];
  return ie(o);
}
function H(e) {
  const t = ue(e), n = e.automation_ref == null ? void 0 : le(e.automation_ref);
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
function se(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = typeof t.id == "string" ? t.id : "", r = Number(t.version);
  if (t.kind !== "flow" || !n || !Number.isInteger(r) || r < 1)
    throw new Error("the server returned an invalid Workflow reference");
  return { kind: "flow", id: n, version: r };
}
function de(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = typeof t.id == "string" ? t.id : "", r = Number(t.def_seq);
  if (t.kind !== "flow" || !n || !Number.isInteger(r) || r < 0)
    throw new Error("the server returned an invalid Workflow draft reference");
  return { kind: "flow", id: n, def_seq: r };
}
function le(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {}, n = typeof t.id == "string" ? t.id : "", r = Number(t.revision);
  if (t.kind !== "automation" || !n || !Number.isInteger(r) || r < 1)
    throw new Error("the server returned an invalid Automation reference");
  return { kind: "automation", id: n, revision: r };
}
function ue(e) {
  if (e.flow_ref != null && e.draft_ref == null) return { flow_ref: se(e.flow_ref) };
  if (e.draft_ref != null && e.flow_ref == null) return { draft_ref: de(e.draft_ref) };
  throw new Error("the server must return exactly one Workflow run reference");
}
function ce(e) {
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
async function mt(e, t = {}) {
  const n = {};
  t.input !== void 0 && (n.input = t.input);
  const r = await M(`/api/v1/workflows/${encodeURIComponent(e)}/simulate`, n), o = String(r.run_id || "");
  if (!o) throw new Error("the server did not return a run id");
  return o;
}
async function yt(e, t, n = {}) {
  if (!Number.isInteger(t) || t < 1) throw new Error("a published Workflow version is required");
  const r = await M(`/api/v1/workflows/${encodeURIComponent(e)}/run`, { version: t, input: n }), o = String(r.run_id || "");
  if (!o) throw new Error("the server did not return a run id");
  return o;
}
function _(e, t) {
  for (let n = e.length - 1; n >= 0; n--)
    if (e[n].type === t && e[n].content != null) return e[n];
}
function pe(e) {
  const t = _(e, "node.input");
  return t ? t.content : null;
}
function fe(e) {
  const t = _(e, "node.output");
  if (t) return t.content;
  const n = _(e, "node.result")?.content;
  if (n && typeof n == "object" && "data_ids" in n && "output" in n)
    return n.output ?? null;
  const r = _(e, "agent.action");
  if (r) {
    const a = r.content;
    if (a && typeof a == "object" && "result" in a) {
      const i = a.result;
      if (i != null) return i;
    }
    return a;
  }
  const o = _(e, "node.result");
  if (o) {
    const a = o.content;
    return a && typeof a == "object" && "data_ids" in a && "success" in a ? a.output ?? null : a;
  }
  return null;
}
const V = /^(failed|failure|error|node failed|step failed)\.?$/i, S = "This step failed.";
function A(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function I(...e) {
  for (const t of e) if (typeof t == "string" && t.trim()) return t.trim();
}
function ge(e) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t];
    if (n.type === "node.error" || n.type === "node.result" && (n.discriminator || "").startsWith("result.error")) return n;
  }
}
function me(e) {
  if (!A(e)) return { message: S, hasDetail: !1 };
  const t = I(e.code), n = I(e.message);
  return { message: n || S, code: t, detail: e, hasDetail: !!n };
}
function ye(e) {
  const t = ge(e);
  return t ? me(t.content) : null;
}
function he(e) {
  const t = e.trim();
  if (t.startsWith("{") || t.startsWith("["))
    try {
      return JSON.parse(t);
    } catch {
      return;
    }
}
function D(e) {
  const t = I(e.code), n = I(e.message);
  return n && !V.test(n) ? { message: n, code: t, generic: !1 } : { message: S, code: t, generic: !0 };
}
function be(e) {
  if (e == null) return { message: "", generic: !0 };
  if (A(e)) return D(e);
  const t = String(e).trim();
  if (!t) return { message: "", generic: !0 };
  const n = t.match(/^Node\s+\[[^\]]+\]\s+failed:\s*(.*)$/i), r = (n ? n[1] : t).trim(), o = he(r);
  return A(o) ? D(o) : !r || V.test(r) ? { message: S, generic: !0 } : { message: r, generic: !1 };
}
function q(e) {
  const t = be(e);
  return t.generic ? "" : t.message;
}
function ve(e) {
  const t = [];
  for (const n of e) {
    if (n.type !== "agent.action" || n.content == null) continue;
    const r = n.content, o = A(r) ? r : {};
    t.push({
      result: "result" in o ? o.result : void 0,
      toolCalls: Array.isArray(o.tool_calls) ? o.tool_calls : [],
      raw: r
    });
  }
  return t;
}
function we(e) {
  let t = Number.POSITIVE_INFINITY, n = Number.NEGATIVE_INFINITY, r, o;
  for (const a of e) {
    if (!a.created_at) continue;
    const i = Date.parse(a.created_at);
    Number.isFinite(i) && (i < t && (t = i, r = a.created_at), i > n && (n = i, o = a.created_at));
  }
  return !Number.isFinite(t) || !Number.isFinite(n) ? {} : { startedAt: r, finishedAt: o, durationMs: Math.max(0, n - t) };
}
function ht(e) {
  if (!Number.isFinite(e) || e < 0) return "—";
  if (e < 1e3) return `${Math.round(e)}ms`;
  if (e < 6e4) return `${(e / 1e3).toFixed(1)}s`;
  const t = Math.round(e / 1e3), n = Math.floor(t / 60), r = t % 60;
  return `${n}m ${r}s`;
}
function _e(e) {
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function Se(e, t = 40) {
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
function bt(e, t = {}) {
  let n = ye(e);
  if (!n && t.failed) {
    const r = q(t.runError);
    n = r ? { message: r, hasDetail: !0 } : { message: S, hasDetail: !1 };
  }
  return {
    input: pe(e),
    output: fe(e),
    error: n,
    agentActions: ve(e),
    timing: we(e)
  };
}
function x(e) {
  const t = e.toLowerCase();
  return t === "completed" || t === "complete" || t === "success" || t === "succeeded" ? "ok" : t === "failed" || t === "error" || t === "cancelled" || t === "canceled" || t === "terminated" ? "error" : "pending";
}
function vt(e) {
  return x(e.status) === "pending" && e.dataflow_status === "waiting" ? "waiting" : e.status;
}
function wt(e) {
  return x(e.status) === "error" ? q(e.error) : "";
}
function _t(e) {
  const t = e.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Pending";
}
function St(e) {
  return [...e].sort((t, n) => {
    const r = Date.parse(t.started_at || t.finished_at || "") || 0, o = Date.parse(n.started_at || n.finished_at || "") || 0;
    return o !== r ? o - r : n.run_id.localeCompare(t.run_id);
  });
}
function $t(e, t = Date.now()) {
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
function kt(e) {
  return e.length > 8 ? e.slice(0, 8) : e;
}
function Ct(e) {
  const t = Number(e) || 0;
  return t > 0 ? { label: `v${t}`, kind: "published", title: `Ran published version ${t}` } : { label: "Draft run", kind: "draft", title: "Ran your current draft — not a published version" };
}
var $e = `
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`, ke = {
  root: function(t) {
    var n = t.props;
    return ["p-tag p-component", {
      "p-tag-info": n.severity === "info",
      "p-tag-success": n.severity === "success",
      "p-tag-warn": n.severity === "warn",
      "p-tag-danger": n.severity === "danger",
      "p-tag-secondary": n.severity === "secondary",
      "p-tag-contrast": n.severity === "contrast",
      "p-tag-rounded": n.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, Ce = U.extend({
  name: "tag",
  style: $e,
  classes: ke
}), Ae = {
  name: "BaseTag",
  extends: F,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Ce,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function $(e) {
  "@babel/helpers - typeof";
  return $ = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $(e);
}
function Ie(e, t, n) {
  return (t = Re(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Re(e) {
  var t = Ne(e, "string");
  return $(t) == "symbol" ? t : t + "";
}
function Ne(e, t) {
  if ($(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Te = {
  name: "Tag",
  extends: Ae,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return O(Ie({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Ee = ["data-p"];
function Pe(e, t, n, r, o, a) {
  return p(), g("span", u({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (p(), C(z(e.$slots.icon), u({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (p(), g("span", u({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : w("", !0), e.value != null || e.$slots.default ? m(e.$slots, "default", {
    key: 2
  }, function() {
    return [c("span", u({
      class: e.cx("label")
    }, e.ptm("label")), b(e.value), 17)];
  }) : w("", !0)], 16, Ee);
}
Te.render = Pe;
var K = {
  name: "PlusIcon",
  extends: W
};
function je(e) {
  return Me(e) || Le(e) || De(e) || Be();
}
function Be() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function De(e, t) {
  if (e) {
    if (typeof e == "string") return P(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? P(e, t) : void 0;
  }
}
function Le(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Me(e) {
  if (Array.isArray(e)) return P(e);
}
function P(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ue(e, t, n, r, o, a) {
  return p(), g("svg", u({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), je(t[0] || (t[0] = [c("path", {
    d: "M7.67742 6.32258V0.677419C7.67742 0.497757 7.60605 0.325452 7.47901 0.198411C7.35197 0.0713707 7.17966 0 7 0C6.82034 0 6.64803 0.0713707 6.52099 0.198411C6.39395 0.325452 6.32258 0.497757 6.32258 0.677419V6.32258H0.677419C0.497757 6.32258 0.325452 6.39395 0.198411 6.52099C0.0713707 6.64803 0 6.82034 0 7C0 7.17966 0.0713707 7.35197 0.198411 7.47901C0.325452 7.60605 0.497757 7.67742 0.677419 7.67742H6.32258V13.3226C6.32492 13.5015 6.39704 13.6725 6.52358 13.799C6.65012 13.9255 6.82106 13.9977 7 14C7.17966 14 7.35197 13.9286 7.47901 13.8016C7.60605 13.6745 7.67742 13.5022 7.67742 13.3226V7.67742H13.3226C13.5022 7.67742 13.6745 7.60605 13.8016 7.47901C13.9286 7.35197 14 7.17966 14 7C13.9977 6.82106 13.9255 6.65012 13.799 6.52358C13.6725 6.39704 13.5015 6.32492 13.3226 6.32258H7.67742Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
K.render = Ue;
const Fe = /* @__PURE__ */ new Set(["completed", "failed", "cancelled", "canceled", "terminated"]);
function L(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function At(e, t) {
  if (!t) return !1;
  const n = L(e), r = L(n.data), o = Object.keys(r).length ? r : n, a = String(o.thread_id || n.thread_id || ""), i = String(n.topic || o.topic || "");
  return String(o.event_type || n.event_type || "") === "events.appended" && (a === t || !a && i === `kickside.thread.${t}`);
}
function Oe(e) {
  return !Fe.has(e.toLowerCase());
}
function We(e) {
  const t = e.toLowerCase();
  return t === "completed" || t === "complete" || t === "done" || t === "success" || t === "succeeded" ? "completed" : t === "failed" || t === "error" || t === "cancelled" || t === "canceled" || t === "terminated" ? "failed" : t === "running" || t === "active" || t === "executing" || t === "started" ? "running" : t === "pending" || t === "queued" || t === "waiting" || t === "blocked" || t === "ready" ? "pending" : "idle";
}
function It(e, t, n, r = !1) {
  const o = n.toLowerCase(), a = Oe(o), i = {};
  for (const s of Object.keys(e.nodes)) i[s] = "idle";
  for (const s of t) {
    if (!s.def_node_id || !(s.def_node_id in e.nodes)) continue;
    let l = We(s.status);
    a && G(e.nodes[s.def_node_id].kind, e.nodes[s.def_node_id].ref) && (l === "running" || l === "pending") && (l = "awaiting"), i[s.def_node_id] = l;
  }
  for (const s of Object.values(e.nodes))
    s.kind === "start" && n ? i[s.id] = "completed" : s.kind === "finish" ? o === "completed" ? i[s.id] = "completed" : a && (i[s.id] = "pending") : s.kind === "error" && o === "failed" && r && (i[s.id] = "failed");
  const d = {};
  for (const s of Object.values(e.edges)) {
    const l = i[s.source_id] || "idle", f = i[s.target_id] || "idle";
    l === "completed" && (f === "completed" || f === "failed") || l === "failed" && f === "failed" ? d[s.id] = "done" : l === "completed" && (f === "running" || f === "pending" || f === "awaiting") ? d[s.id] = "active" : d[s.id] = "idle";
  }
  return { active: a, node: i, edge: d };
}
function Rt() {
  return { active: !1, node: {}, edge: {} };
}
function Nt(e) {
  return Object.values(e.nodes).find((t) => t.kind === "start")?.id || "";
}
var J = {
  name: "MinusIcon",
  extends: W
};
function ze(e) {
  return xe(e) || qe(e) || Ve(e) || He();
}
function He() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ve(e, t) {
  if (e) {
    if (typeof e == "string") return j(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? j(e, t) : void 0;
  }
}
function qe(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function xe(e) {
  if (Array.isArray(e)) return j(e);
}
function j(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ke(e, t, n, r, o, a) {
  return p(), g("svg", u({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ze(t[0] || (t[0] = [c("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
J.render = Ke;
var Je = `
    .p-panel {
        display: block;
        border: 1px solid dt('panel.border.color');
        border-radius: dt('panel.border.radius');
        background: dt('panel.background');
        color: dt('panel.color');
    }

    .p-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: dt('panel.header.padding');
        background: dt('panel.header.background');
        color: dt('panel.header.color');
        border-style: solid;
        border-width: dt('panel.header.border.width');
        border-color: dt('panel.header.border.color');
        border-radius: dt('panel.header.border.radius');
    }

    .p-panel-toggleable .p-panel-header {
        padding: dt('panel.toggleable.header.padding');
    }

    .p-panel-title {
        line-height: 1;
        font-weight: dt('panel.title.font.weight');
    }

    .p-panel-content-container {
        display: grid;
        grid-template-rows: 1fr;
    }

    .p-panel-content-wrapper {
        min-height: 0;
    }

    .p-panel-content {
        padding: dt('panel.content.padding');
    }

    .p-panel-footer {
        padding: dt('panel.footer.padding');
    }
`, Ye = {
  root: function(t) {
    var n = t.props;
    return ["p-panel p-component", {
      "p-panel-toggleable": n.toggleable
    }];
  },
  header: "p-panel-header",
  title: "p-panel-title",
  headerActions: "p-panel-header-actions",
  pcToggleButton: "p-panel-toggle-button",
  contentContainer: "p-panel-content-container",
  contentWrapper: "p-panel-content-wrapper",
  content: "p-panel-content",
  footer: "p-panel-footer"
}, Ge = U.extend({
  name: "panel",
  style: Je,
  classes: Ye
}), Ze = {
  name: "BasePanel",
  extends: F,
  props: {
    header: String,
    toggleable: Boolean,
    collapsed: Boolean,
    toggleButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    }
  },
  style: Ge,
  provide: function() {
    return {
      $pcPanel: this,
      $parentInstance: this
    };
  }
}, Y = {
  name: "Panel",
  extends: Ze,
  inheritAttrs: !1,
  emits: ["update:collapsed", "toggle"],
  data: function() {
    return {
      d_collapsed: this.collapsed
    };
  },
  watch: {
    collapsed: function(t) {
      this.d_collapsed = t;
    }
  },
  methods: {
    toggle: function(t) {
      this.d_collapsed = !this.d_collapsed, this.$emit("update:collapsed", this.d_collapsed), this.$emit("toggle", {
        originalEvent: t,
        value: this.d_collapsed
      });
    },
    onKeyDown: function(t) {
      (t.code === "Enter" || t.code === "NumpadEnter" || t.code === "Space") && (this.toggle(t), t.preventDefault());
    }
  },
  computed: {
    buttonAriaLabel: function() {
      return this.toggleButtonProps && this.toggleButtonProps.ariaLabel ? this.toggleButtonProps.ariaLabel : this.header;
    },
    dataP: function() {
      return O({
        toggleable: this.toggleable
      });
    }
  },
  components: {
    PlusIcon: K,
    MinusIcon: J,
    Button: E
  },
  directives: {
    ripple: Z
  }
}, Qe = ["data-p"], Xe = ["data-p"], et = ["id"], tt = ["id", "aria-labelledby"];
function nt(e, t, n, r, o, a) {
  var i = Q("Button");
  return p(), g("div", u({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [c("div", u({
    class: e.cx("header"),
    "data-p": a.dataP
  }, e.ptm("header")), [m(e.$slots, "header", {
    id: e.$id + "_header",
    class: X(e.cx("title")),
    collapsed: o.d_collapsed
  }, function() {
    return [e.header ? (p(), g("span", u({
      key: 0,
      id: e.$id + "_header",
      class: e.cx("title")
    }, e.ptm("title")), b(e.header), 17, et)) : w("", !0)];
  }), c("div", u({
    class: e.cx("headerActions")
  }, e.ptm("headerActions")), [m(e.$slots, "icons"), e.toggleable ? m(e.$slots, "togglebutton", {
    key: 0,
    collapsed: o.d_collapsed,
    toggleCallback: function(s) {
      return a.toggle(s);
    },
    keydownCallback: function(s) {
      return a.onKeyDown(s);
    }
  }, function() {
    return [v(i, u({
      id: e.$id + "_header",
      class: e.cx("pcToggleButton"),
      "aria-label": a.buttonAriaLabel,
      "aria-controls": e.$id + "_content",
      "aria-expanded": !o.d_collapsed,
      unstyled: e.unstyled,
      onClick: t[0] || (t[0] = function(d) {
        return a.toggle(d);
      }),
      onKeydown: t[1] || (t[1] = function(d) {
        return a.onKeyDown(d);
      })
    }, e.toggleButtonProps, {
      pt: e.ptm("pcToggleButton")
    }), {
      icon: y(function(d) {
        return [m(e.$slots, e.$slots.toggleicon ? "toggleicon" : "togglericon", {
          collapsed: o.d_collapsed
        }, function() {
          return [(p(), C(z(o.d_collapsed ? "PlusIcon" : "MinusIcon"), u({
            class: d.class
          }, e.ptm("pcToggleButton").icon), null, 16, ["class"]))];
        })];
      }),
      _: 3
    }, 16, ["id", "class", "aria-label", "aria-controls", "aria-expanded", "unstyled", "pt"])];
  }) : w("", !0)], 16)], 16, Xe), v(ee, u({
    name: "p-collapsible"
  }, e.ptm("transition")), {
    default: y(function() {
      return [te(c("div", u({
        id: e.$id + "_content",
        class: e.cx("contentContainer"),
        role: "region",
        "aria-labelledby": e.$id + "_header"
      }, e.ptm("contentContainer")), [c("div", u({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [c("div", u({
        class: e.cx("content")
      }, e.ptm("content")), [m(e.$slots, "default")], 16), e.$slots.footer ? (p(), g("div", u({
        key: 0,
        class: e.cx("footer")
      }, e.ptm("footer")), [m(e.$slots, "footer")], 16)) : w("", !0)], 16)], 16, tt), [[ne, !o.d_collapsed]])];
    }),
    _: 3
  }, 16)], 16, Qe);
}
Y.render = nt;
const rt = { class: "wf-payload-title" }, ot = ["source"], at = { class: "wf-run-output wf-mono" }, Tt = /* @__PURE__ */ re({
  __name: "RunPayload",
  props: {
    value: {},
    label: {},
    icon: { default: "tabler:code" },
    open: { type: Boolean, default: !0 },
    maxLines: { default: 40 }
  },
  setup(e) {
    const t = e, n = R(() => typeof t.value == "string"), r = R(() => _e(t.value)), o = R(() => Se(r.value, t.maxLines)), a = N(!t.open), i = N(!1), d = N(!1);
    async function s() {
      try {
        await navigator.clipboard.writeText(r.value), d.value = !0, setTimeout(() => {
          d.value = !1;
        }, 1400);
      } catch {
      }
    }
    return (l, f) => (p(), C(h(Y), {
      collapsed: a.value,
      "onUpdate:collapsed": f[1] || (f[1] = (B) => a.value = B),
      class: "wf-payload",
      toggleable: ""
    }, {
      header: y(() => [
        c("span", rt, [
          v(h(T), {
            icon: e.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          c("span", null, b(e.label), 1)
        ])
      ]),
      icons: y(() => [
        v(h(E), {
          class: "wf-payload-copy",
          severity: "secondary",
          outlined: "",
          size: "small",
          title: d.value ? "Copied" : "Copy to clipboard",
          onClick: s
        }, {
          default: y(() => [
            v(h(T), {
              icon: d.value ? "tabler:check" : "tabler:copy",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            c("span", null, b(d.value ? "Copied" : "Copy"), 1)
          ]),
          _: 1
        }, 8, ["title"])
      ]),
      default: y(() => [
        n.value ? (p(), g("wc-render-markdown", {
          key: 0,
          class: "wf-run-md",
          source: String(e.value)
        }, null, 8, ot)) : (p(), g(oe, { key: 1 }, [
          c("pre", at, b(i.value || !o.value.truncated ? r.value : o.value.preview), 1),
          o.value.truncated ? (p(), C(h(E), {
            key: 0,
            class: "wf-payload-more",
            severity: "secondary",
            outlined: "",
            size: "small",
            onClick: f[0] || (f[0] = (B) => i.value = !i.value)
          }, {
            default: y(() => [
              v(h(T), {
                icon: i.value ? "tabler:chevrons-up" : "tabler:chevrons-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              c("span", null, b(i.value ? "Show less" : `Show ${o.value.hiddenLines} more lines`), 1)
            ]),
            _: 1
          })) : w("", !0)
        ], 64))
      ]),
      _: 1
    }, 8, ["collapsed"]));
  }
});
function Et(e) {
  const t = e;
  return Number(t?.response?.status ?? t?.status ?? 0);
}
export {
  Et as A,
  fe as B,
  q as C,
  yt as D,
  Tt as _,
  x as a,
  _t as b,
  wt as c,
  K as d,
  Nt as e,
  Oe as f,
  ct as g,
  It as h,
  At as i,
  mt as j,
  Rt as k,
  ut as l,
  Y as m,
  _e as n,
  pt as o,
  be as p,
  ht as q,
  $t as r,
  Te as s,
  Ct as t,
  vt as u,
  kt as v,
  gt as w,
  bt as x,
  ft as y,
  St as z
};
