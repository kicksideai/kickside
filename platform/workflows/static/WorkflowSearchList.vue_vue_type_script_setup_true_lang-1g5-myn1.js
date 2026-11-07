import { api as k } from "@wippy-fe/proxy";
import { defineComponent as B, ref as W, computed as x, openBlock as d, createElementBlock as m, normalizeClass as p, createVNode as b, unref as h, withCtx as _, renderSlot as j, createElementVNode as D, createBlock as E, createTextVNode as U, toDisplayString as N, Fragment as T, renderList as z, createCommentVNode as K } from "vue";
import M from "primevue/button";
import H from "primevue/iconfield";
import J from "primevue/inputicon";
import Y from "primevue/inputtext";
import G from "primevue/message";
import Q from "primevue/progressspinner";
import { Icon as X } from "@iconify/vue";
function F(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function w(e, t = "") {
  const r = F(e);
  if (!r) return t;
  if (typeof r.message == "string" && r.message.trim()) return r.message.trim();
  const n = F(r.error);
  return n && typeof n.message == "string" && n.message.trim() ? n.message.trim() : typeof r.error == "string" && r.error.trim() ? r.error.trim() : n && typeof n.code == "string" && n.code.trim() ? n.code.trim() : typeof r.code == "string" && r.code.trim() ? r.code.trim() : t;
}
function Z(e) {
  const t = e, r = w(t?.response?.data) || w(t?.data);
  return r || (e instanceof Error && e.message && e.message !== "[object Object]" && !/^request failed/i.test(e.message) && !/status code/i.test(e.message) ? e.message : "");
}
function Ne(e, t) {
  const r = Z(e);
  return r ? /nothing to undo/i.test(r) ? "Nothing to undo." : /nothing to redo/i.test(r) ? "Nothing to redo." : /boundary_node_remove_refused/i.test(r) ? "Start, Finish, and Error steps are locked and can’t be deleted." : r : t;
}
async function S(e, t) {
  const { data: r } = await k.post(e, t);
  if (r && r.success === !1) throw new Error(w(r, "request failed"));
  return r;
}
async function V(e) {
  const { data: t } = await k.get(e);
  if (t && t.success === !1) throw new Error(w(t, "request failed"));
  return t;
}
function I(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function O(e) {
  const t = I(e);
  return Object.keys(t).length ? {
    input_schema: t.input_schema,
    output_schema: t.output_schema,
    error_schema: t.error_schema,
    input_count: t.input_count != null ? Number(t.input_count) : void 0,
    output_count: t.output_count != null ? Number(t.output_count) : void 0,
    error_count: t.error_count != null ? Number(t.error_count) : void 0,
    input_keys: Array.isArray(t.input_keys) ? t.input_keys.map(String) : void 0,
    output_keys: Array.isArray(t.output_keys) ? t.output_keys.map(String) : void 0,
    error_keys: Array.isArray(t.error_keys) ? t.error_keys.map(String) : void 0
  } : null;
}
function ee(e, t) {
  return e.toLowerCase() === t.toLowerCase();
}
function te(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const r of e) {
    const n = String(r ?? "").trim();
    n && (t.some((o) => ee(o, n)) || t.push(n));
  }
  return t;
}
async function Fe(e = {}) {
  const t = [];
  let r = 0;
  do {
    const n = new URLSearchParams();
    e.filter === "published" && n.set("published", "true"), n.set("fields", "labels,head_seq,interface,published_interface,published_def_seq,has_draft_changes,parent_id,parent_name,breadcrumb,last_run,node_count,run_count"), n.set("limit", "100"), n.set("offset", String(r));
    const o = await V(`/api/v1/workflows?${n}`);
    if (!Array.isArray(o.workflows)) throw new Error("The server returns no workflow page.");
    t.push(...o.workflows);
    const s = o.next_offset;
    if (s != null && (typeof s != "number" || !Number.isSafeInteger(s) || s <= r))
      throw new Error("The server returns an invalid workflow offset.");
    r = s ?? void 0;
  } while (r !== void 0);
  return t.map((n) => {
    const o = I(n.last_run);
    return {
      id: String(n.id || ""),
      title: String(n.title || "Untitled Workflow"),
      deleting_at: n.deleting_at == null ? void 0 : String(n.deleting_at),
      deletion_job_id: n.deletion_job_id == null ? void 0 : String(n.deletion_job_id),
      status: n.status != null ? String(n.status) : void 0,
      labels: te(n.labels),
      updated_at: n.updated_at != null ? String(n.updated_at) : void 0,
      node_count: n.node_count != null ? Number(n.node_count) : void 0,
      run_count: n.run_count != null ? Number(n.run_count) : void 0,
      head_seq: n.head_seq != null ? Number(n.head_seq) : void 0,
      interface: O(n.interface),
      published_version: n.published_version != null ? Number(n.published_version) : void 0,
      published_def_seq: n.published_def_seq != null ? Number(n.published_def_seq) : void 0,
      published_interface: O(n.published_interface),
      has_draft_changes: n.has_draft_changes === !0,
      // Placement is present only on placed, actor-readable rows; a root or access-filtered
      // parent leaves all three absent (never a fabricated location).
      parent_id: n.parent_id != null ? String(n.parent_id) : void 0,
      parent_name: n.parent_name != null ? String(n.parent_name) : void 0,
      breadcrumb: n.breadcrumb != null ? String(n.breadcrumb) : void 0,
      last_run: Object.keys(o).length ? {
        run_id: String(o.run_id || ""),
        status: String(o.status || ""),
        error: o.error != null ? String(o.error) : null,
        started_at: o.started_at != null ? String(o.started_at) : null,
        finished_at: o.finished_at != null ? String(o.finished_at) : null
      } : null
    };
  });
}
async function Oe(e, t) {
  const r = await S("/api/v1/workflows", { title: e, parent_id: t || void 0 }), n = String(r.flow_id || "");
  if (!n) throw new Error("the server did not return a Workflow id");
  return n;
}
async function Re(e) {
  if (!e) return;
  const { data: t } = await k.delete(`/api/v1/workflows/${encodeURIComponent(e)}`);
  if (t && t.success === !1) throw new Error(String(t.error || "delete failed"));
}
async function Le(e) {
  const t = await V(`/api/v1/workflows/${encodeURIComponent(e)}/state`), r = t.state;
  return r && typeof r == "object" ? r : t;
}
function C(e) {
  return {
    events: Array.isArray(e.events) ? e.events : [],
    head_seq: Number(e.head_seq || 0),
    can_undo: e.can_undo === !0,
    can_redo: e.can_redo === !0
  };
}
async function qe(e, t) {
  const r = { commands: t }, n = new TextEncoder().encode(JSON.stringify(r)).byteLength < 60 * 1024, { data: o } = await k.post(`/api/v1/workflows/${encodeURIComponent(e)}/apply`, r, {
    adapter: "fetch",
    fetchOptions: { keepalive: n }
  });
  if (o && o.success === !1) throw new Error(w(o, "request failed"));
  return C(o);
}
async function Ve(e) {
  const t = await S(`/api/v1/workflows/${encodeURIComponent(e)}/undo`, {});
  return C(t);
}
async function Ie(e) {
  const t = await S(`/api/v1/workflows/${encodeURIComponent(e)}/redo`, {});
  return C(t);
}
function Pe(e) {
  return e === "flow";
}
function $e(e) {
  return e === "for_each";
}
const re = { id: "failed", label: "Failed" }, ne = {
  type: "object",
  required: ["code", "message"],
  additionalProperties: !1,
  properties: {
    code: { type: "string" },
    message: { type: "string" }
  }
};
function oe(e) {
  return e === re.id;
}
const R = {
  block: {
    kind: "block",
    label: "Block",
    hueVar: "--wf-violet",
    icon: "tabler:box",
    category: "Blocks",
    blurb: "Runs a typed reusable Block and continues with its result."
  },
  branch: {
    kind: "branch",
    label: "Condition",
    hueVar: "--wf-teal",
    icon: "tabler:arrows-split-2",
    category: "Logic",
    blurb: "Chooses between two paths: True runs when the condition holds, False otherwise.",
    // Compiler contract: the condition lives on the node (config.predicate) and the arms
    // leave the true/false ports (graph.lua rewrites them to the predicate and its negation).
    outPorts: [{ id: "true", label: "True" }, { id: "false", label: "False" }]
  },
  cycle: {
    kind: "cycle",
    label: "Loop",
    hueVar: "--wf-teal",
    icon: "tabler:rotate",
    category: "Logic",
    blurb: "Repeats the steps inside its body while its condition holds, then continues when it stops.",
    // Body wires the repeated subgraph (rendered as the loop container); done is the exit.
    // Directional labels so a first-timer sees which port is the loop and which is the exit.
    outPorts: [{ id: "body", label: "each pass →" }, { id: "done", label: "→ when done" }],
    continuation: "done"
  },
  // Combine is the one convergence kind, carrying both semantics through a mode toggle:
  // wait_all waits for every incoming path, first_wins continues on the first to arrive.
  combine: {
    kind: "combine",
    label: "Combine",
    hueVar: "--wf-teal",
    icon: "tabler:arrow-merge",
    category: "Logic",
    blurb: "Brings several incoming paths back into one — either waiting for every path or continuing on the first to arrive."
  },
  // For-each runs the body once per array item and continues with the collected results.
  for_each: {
    kind: "for_each",
    label: "For each",
    hueVar: "--wf-teal",
    icon: "tabler:arrows-split",
    category: "Logic",
    blurb: "Runs the steps inside its body once per array item, then continues with the collected results.",
    // Body wires the per-item subgraph (rendered as the container); the default continuation
    // carries the results array. Directional labels keep the per-item body apart from it.
    outPorts: [{ id: "body", label: "each item →" }, { id: "done", label: "→ all results" }],
    continuation: "done"
  },
  flow: {
    kind: "flow",
    label: "Workflow",
    hueVar: "--wf-violet",
    icon: "tabler:route",
    category: "Workflows",
    blurb: "Expands an exact published Workflow into this Workflow and continues with its result."
  },
  // Boundary nodes: the pinned workflow contract. Start declares the run input,
  // Finish the successful output, Error the failure output. These three — never
  // definition params — are the sole source of a workflow's interface.
  // Boundary nodes carry the "contract" palette (--wf-contract-*): a calm, desaturated
  // family set apart from the punchy per-kind data hues, so they read as the workflow's
  // interface, not another data step.
  start: {
    kind: "start",
    label: "Start",
    hueVar: "--wf-contract-in",
    icon: "tabler:player-play",
    category: "Structure",
    blurb: "Sets the input for each run. One Start step per Workflow."
  },
  finish: {
    kind: "finish",
    label: "Finish",
    hueVar: "--wf-contract-out",
    icon: "tabler:circle-check",
    category: "Structure",
    blurb: "Sets the result when a run succeeds."
  },
  error: {
    kind: "error",
    label: "Error",
    hueVar: "--wf-contract-err",
    icon: "tabler:circle-x",
    category: "Structure",
    blurb: "Sets the result when a run fails."
  }
}, se = {
  "--wf-amber": "wf-hue--amber",
  "--wf-violet": "wf-hue--violet",
  "--wf-blue": "wf-hue--blue",
  "--wf-teal": "wf-hue--teal",
  "--wf-rose": "wf-hue--rose",
  "--wf-muted": "wf-hue--slate",
  "--p-success-500": "wf-hue--ok",
  "--wf-danger": "wf-hue--danger",
  "--wf-contract-in": "wf-hue--contract-in",
  "--wf-contract-out": "wf-hue--contract-out",
  "--wf-contract-err": "wf-hue--contract-err"
};
function Be(e) {
  return se[e] || "wf-hue--violet";
}
const We = {
  start: "input_schema",
  finish: "output_schema",
  error: "error_schema"
};
function xe(e) {
  return e === "start" || e === "finish" || e === "error";
}
const De = ["Structure", "Blocks", "Workflows", "Logic", "Notes"], ie = {
  amber: "--wf-amber",
  violet: "--wf-violet",
  blue: "--wf-blue",
  teal: "--wf-teal",
  rose: "--wf-rose",
  emerald: "--p-success-500",
  green: "--p-success-500",
  red: "--wf-danger"
};
function ae(e) {
  return e && ie[e] || "--wf-violet";
}
const y = {}, f = {};
function Ue(e) {
  for (const t of Object.keys(f)) delete f[t];
  for (const t of Object.keys(y)) delete y[t];
  for (const t of e)
    !t || !t.id || (f[t.id] = t, y[t.id] = {
      kind: "block",
      label: t.label || t.id,
      hueVar: ae(t.hue),
      icon: t.icon || "tabler:puzzle",
      category: t.category || "Blocks",
      waits: t.waits === !0,
      blurb: t.blurb || "",
      outPorts: t.ports?.length ? t.ports.map((r) => ({ id: r.id, label: r.label })) : void 0
    });
}
function Te(e) {
  return e ? f[e]?.config_schema : void 0;
}
function ze(e) {
  return e ? f[e]?.config_wc : void 0;
}
function Ke(e) {
  const t = e ? f[e] : void 0;
  return t?.tool === !0 || t?.source_kind === "tool";
}
function ce(e, t) {
  if (!(!e || !t))
    return f[e]?.ports?.find((r) => r.id === t)?.schema;
}
function P(e, t) {
  return e === "block" && t && y[t] ? y[t] : R[e] || R.block;
}
function Me(e, t) {
  return P(e, t).waits === !0;
}
function He(e, t) {
  const r = e === "block" && t ? f[t] : void 0;
  if (r?.ports?.length) {
    const n = r.ports.filter((o) => !o.direction || o.direction === "out");
    return n.length ? n.map(({ id: o, label: s }) => ({ id: o, label: s })) : [{ id: "", label: "" }];
  }
  return P(e, t).outPorts || [{ id: "", label: "" }];
}
function v(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function l(e) {
  if (typeof e == "string") {
    const t = e.trim();
    if (!t) return null;
    try {
      return v(JSON.parse(t));
    } catch {
      return null;
    }
  }
  return v(e);
}
function Je(e, t) {
  if (e === t) return !0;
  const r = /* @__PURE__ */ new Set(["number", "integer"]);
  return r.has(e) && r.has(t) ? !0 : e === "any" || t === "any";
}
function ue(e) {
  const t = e.type;
  return typeof t == "string" && t ? t : Array.isArray(t) && typeof t[0] == "string" ? t[0] : e.properties && typeof e.properties == "object" ? "object" : "schema";
}
function L(e) {
  const t = l(e);
  if (!t) return "No schema";
  const r = ue(t), n = v(t.properties) || {}, o = Object.keys(n);
  if (!o.length) return r;
  const s = o.slice(0, 3).join(", ");
  return `${r}: ${s}${o.length > 3 ? ` +${o.length - 3}` : ""}`;
}
function le(e) {
  if (e)
    return e.kind === "start" ? e.config?.input_schema ?? e.output_schema : e.output_schema;
}
function fe(e, t) {
  if (e)
    return e.kind === "finish" ? e.config?.output_schema ?? e.input_schema : e.kind === "error" ? e.config?.error_schema ?? e.input_schema : e.input_schema;
}
function Ye(e, t) {
  return !e || t != null ? !1 : e.kind === "block" || e.kind === "flow";
}
function de(e, t, r = /* @__PURE__ */ new Set()) {
  const n = e.nodes[t.source_id], o = ce(n?.ref, t.source_port);
  if (o != null) return o;
  if (oe(t.source_port)) return ne;
  if (n?.kind === "branch") {
    if (r.has(n.id)) return;
    r.add(n.id);
    const s = Object.values(e.edges).find((i) => i.target_id === n.id);
    return s ? de(e, s, r) : void 0;
  }
  return le(n);
}
function Ge(e, t) {
  if (!t || t.kind !== "finish") return null;
  const r = l(fe(t)), n = r?.properties && typeof r.properties == "object" && !Array.isArray(r.properties) ? r.properties : {};
  if (!r || r.type !== "object" || Object.keys(n).length > 0) return null;
  const o = l(e);
  if (!o) return null;
  const s = o.properties && typeof o.properties == "object" && !Array.isArray(o.properties) ? o.properties : {};
  return o.type !== "object" || Object.keys(s).length > 0 ? o : null;
}
function Qe(e, t) {
  const r = new Map(t.filter((s) => !!s.ref).map((s) => [`${s.kind}:${s.ref}`, s])), n = new Map(t.filter((s) => !s.ref).map((s) => [String(s.kind), s]));
  let o = 0;
  for (const s of Object.values(e)) {
    const i = (s.ref ? r.get(`${s.kind}:${s.ref}`) : void 0) || n.get(String(s.kind));
    if (!i) continue;
    let c = !1;
    for (const a of ["input_schema", "output_schema", "config_schema"])
      i[a] !== void 0 && s[a] !== i[a] && (s[a] = i[a], c = !0);
    i.icon && s.icon !== i.icon && (s.icon = i.icon, c = !0), c && o++;
  }
  return o;
}
function pe(e) {
  return !!(e && typeof e.picker == "string" && e.picker && e.picker !== "wc-schema-form");
}
function $(e) {
  return e?.config_schema;
}
function he(e, t = "ports") {
  const r = $(e);
  if (!r) return null;
  const n = [];
  for (const [g, A] of Object.entries(r))
    pe(A) && n.push([g, A]);
  if (n.length === 0) return null;
  n.length > 1 && console.error(`${t}: port schema declares multiple picker fields`, n.map(([g]) => g));
  const [o, s] = n[0], i = typeof s.class == "string" ? s.class : "", c = typeof s.title == "string" ? s.title : "", a = typeof s.detail == "string" ? s.detail : "", u = typeof s.delete_endpoint == "string" ? s.delete_endpoint : "";
  return { key: o, tag: s.picker ?? "", threadClass: i, title: c, schema: { properties: { [o]: s } }, detail: a, deleteEndpoint: u };
}
function Xe(e, t = "ports") {
  const r = $(e);
  if (!r) return null;
  const n = he(e, t)?.key, o = {};
  for (const [s, i] of Object.entries(r))
    s !== n && (o[s] = i);
  return Object.keys(o).length ? { type: "object", properties: o } : null;
}
function me(e) {
  if (!e) return null;
  if (typeof e == "string")
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  return e;
}
function Ze(e) {
  const t = me(e);
  return !!(t && t.properties && Object.keys(t.properties).length);
}
function q(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function be(e) {
  return [...e].sort((t, r) => r.version - t.version)[0] || null;
}
function ye(e) {
  const t = q(e.params), r = q(t.interface), n = l(t.input_schema) || l(r.input_schema), o = l(t.output_schema) || l(r.output_schema);
  return n && o ? { input_schema: n, output_schema: o } : null;
}
function we(e) {
  const t = e.published_interface || e.interface;
  if (!t) return null;
  const r = l(t.input_schema), n = l(t.output_schema);
  return r && n ? { input_schema: r, output_schema: n } : null;
}
function et(e, t, r, n) {
  const o = be(r), s = we(e) || ye(t), i = e.published_version || o?.version, c = !!s, a = e.has_draft_changes === !0;
  return {
    ...e,
    is_current: e.id === n,
    callable: c,
    published_version: i,
    has_draft_changes: a,
    input_schema: s?.input_schema,
    output_schema: s?.output_schema,
    input_summary: L(s?.input_schema),
    output_summary: L(s?.output_schema),
    trigger_label: "Declared input",
    leaf_count: s ? 1 : 0
  };
}
const tt = /* @__PURE__ */ B({
  __name: "WorkflowSearchList",
  props: {
    rows: {},
    loading: { type: Boolean },
    error: {},
    matches: { type: Function },
    placeholder: {},
    emptyMessage: {},
    rootClass: {},
    searchClass: {},
    noteClass: {},
    errorClass: {},
    listClass: {},
    rowClass: {},
    rowExtraClass: { type: Function },
    isDisabled: { type: Function },
    isEmphasized: { type: Function },
    quietRows: { type: Boolean },
    emptyClass: {}
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const r = e, n = t, o = W(""), s = x(() => {
      const c = o.value.trim().toLowerCase();
      return c ? r.rows.filter((a) => r.matches(a, c)) : r.rows;
    });
    function i(c) {
      return r.isEmphasized?.(c) === !0;
    }
    return (c, a) => (d(), m("div", {
      class: p(e.rootClass)
    }, [
      b(h(H), {
        class: p(["wf-search", e.searchClass])
      }, {
        default: _(() => [
          b(h(J), null, {
            default: _(() => [
              b(h(X), {
                icon: "tabler:search",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }),
          b(h(Y), {
            modelValue: o.value,
            "onUpdate:modelValue": a[0] || (a[0] = (u) => o.value = u),
            placeholder: e.placeholder,
            "aria-label": e.placeholder
          }, null, 8, ["modelValue", "placeholder", "aria-label"])
        ]),
        _: 1
      }, 8, ["class"]),
      j(c.$slots, "before-list"),
      e.loading ? (d(), m("div", {
        key: 0,
        class: p(e.noteClass)
      }, [
        b(h(Q), {
          class: "wf-status-spinner",
          "stroke-width": "4",
          "aria-label": "Loading Workflows"
        }),
        a[1] || (a[1] = D("span", null, "Loading Workflows…", -1))
      ], 2)) : e.error ? (d(), E(h(G), {
        key: 1,
        class: p(e.errorClass),
        severity: "error",
        closable: !1
      }, {
        default: _(() => [
          U(N(e.error), 1)
        ]),
        _: 1
      }, 8, ["class"])) : (d(), m("div", {
        key: 2,
        class: p(e.listClass)
      }, [
        (d(!0), m(T, null, z(s.value, (u) => (d(), E(h(M), {
          key: u.id,
          type: "button",
          class: p([e.rowClass, e.rowExtraClass?.(u)]),
          severity: i(u) ? void 0 : "secondary",
          text: e.quietRows === !0,
          outlined: e.quietRows !== !0 && !i(u),
          disabled: e.isDisabled?.(u),
          onClick: (g) => n("select", u)
        }, {
          default: _(() => [
            j(c.$slots, "row", { item: u })
          ]),
          _: 2
        }, 1032, ["class", "severity", "text", "outlined", "disabled", "onClick"]))), 128)),
        s.value.length ? K("", !0) : (d(), m("p", {
          key: 0,
          class: p(e.emptyClass)
        }, N(e.rows.length ? "No matching Workflows." : e.emptyMessage), 3))
      ], 2))
    ], 2));
  }
});
export {
  le as A,
  Ue as B,
  De as C,
  et as D,
  me as E,
  re as F,
  f as G,
  Ke as H,
  Te as I,
  ze as J,
  R as K,
  he as L,
  Xe as M,
  We as N,
  Ve as O,
  Ie as P,
  Le as Q,
  Qe as R,
  Ze as S,
  Me as T,
  O as U,
  tt as _,
  I as a,
  ee as b,
  qe as c,
  Re as d,
  Oe as e,
  Be as f,
  V as g,
  Ne as h,
  l as i,
  $e as j,
  Pe as k,
  Fe as l,
  P as m,
  te as n,
  He as o,
  S as p,
  xe as q,
  oe as r,
  Z as s,
  Je as t,
  de as u,
  fe as v,
  Ye as w,
  L as x,
  Ge as y,
  ne as z
};
