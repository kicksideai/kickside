import { P as Rm } from "./primevue-plugin-CaP7wV_M.js";
import Dm from "primevue/confirmationservice";
import Pm from "primevue/toastservice";
import { watch as _e, onBeforeUnmount as Qe, defineComponent as ye, computed as U, openBlock as S, createElementBlock as R, createElementVNode as $, createVNode as V, unref as f, withCtx as ne, createCommentVNode as Z, toDisplayString as j, withModifiers as Fe, Fragment as ue, createTextVNode as ce, ref as Y, nextTick as Ve, normalizeStyle as ze, renderSlot as Be, renderList as Re, withKeys as tt, createBlock as ae, normalizeClass as Ie, createPropsRestProxy as Lm, toRef as Ne, onMounted as Ue, getCurrentScope as pd, inject as Ht, effectScope as vd, provide as Zt, getCurrentInstance as Vn, useAttrs as xs, mergeProps as oo, Teleport as Vm, useSlots as md, onUnmounted as Bm, reactive as $s, onScopeDispose as ii, resolveDynamicComponent as Xt, onBeforeMount as zm, shallowRef as nt, isMemoSame as Fm, toValue as Me, isRef as Ss, toRefs as Hm, customRef as qm, resolveComponent as gd, h as Pe, markRaw as et, readonly as Um, watchEffect as yd, normalizeProps as Wm, withDirectives as wd, vShow as Ym, vModelText as Gm, proxyRefs as bd, createStaticVNode as jm } from "vue";
import { a as _d, b as kd, u as Xm } from "./wc-runtime-KO3cNuNo.js";
import { on as mi, api as mn, host as Km, loadByTagName as Xi } from "@wippy-fe/proxy";
import { e as Fa } from "./errMsg-CxKGcp1F.js";
import rt from "primevue/inputtext";
import fe from "primevue/button";
import He from "primevue/message";
import dt from "primevue/progressspinner";
import { Icon as ie } from "@iconify/vue";
import Jt from "primevue/dialog";
import { n as io, p as Zm, a as gi, s as Jm, g as Ed, b as Ki, h as qe, d as Tl, c as xd, e as Qm, l as $d, f as Sd, i as Ol, t as eg, F as Nt, o as Zi, j as yi, k as Cd, m as wi, q as Cs, r as Ha, u as Ns, v as Ji, w as Is, x as Rl, y as tg, z as ng, A as Dl, K as Ze, B as og, C as ig, _ as rg, D as ag, E as sg, G as lg, H as ug, I as Pl, J as cg, L as dg, M as fg, N as hg, O as pg, P as vg, Q as Nd, R as mg } from "./WorkflowSearchList.vue_vue_type_script_setup_true_lang-1g5-myn1.js";
import { r as Qt, a as As, b as ro, c as Id, i as gg, s as yg, g as xr, d as wg, e as $r, f as bg, l as Ad, h as Md, p as Ll, j as _g, k as kg, m as Td, n as Qn, o as ao, q as Ms, _ as Fn, t as Od, u as Eg, v as xg, w as $g, x as Rd, y as Sg } from "./http-error-BhV_7v-3.js";
import Dd from "primevue/iconfield";
import Pd from "primevue/inputicon";
import St from "primevue/select";
import Ts from "primevue/selectbutton";
import { _ as Cg, W as ri } from "./WcMount-uWtDjrEa.js";
import yt from "primevue/tag";
import Ng from "primevue/fileupload";
import Os from "primevue/textarea";
import { useConfirm as Ld } from "primevue/useconfirm";
import { useToast as Ig } from "primevue/usetoast";
import { p as Ag, P as Mg, l as Vd, g as Bd, a as Tg, r as Og } from "./versions-BxnHuhqm.js";
import zd from "primevue/confirmdialog";
import Rg from "primevue/drawer";
import Dg from "primevue/toast";
import Rs from "primevue/panel";
import Vl from "primevue/tab";
import Pg from "primevue/tablist";
import Lg from "primevue/tabs";
import { _ as Ds, h as xn, A as Bl } from "./SchemaEditor.vue_vue_type_script_setup_true_lang-Y9zDSojj.js";
import so from "primevue/inputnumber";
import Vg from "primevue/buttongroup";
function Hn(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Bg(e, t) {
  return e;
}
function zg(e, t, n) {
  const i = Hn(e) ? e : {}, o = [
    i,
    Hn(i.data) ? i.data : null,
    Hn(i.payload) ? i.payload : null,
    Hn(i.detail) ? i.detail : null
  ].filter(Boolean);
  for (const r of o) {
    if (r.event !== "component.meta.changed" && r.event !== "component.deleting" && r.event !== "component.deleted") continue;
    const a = String(r.component_id || ""), s = String(i.topic || r.topic || "");
    if (!a && (!s.startsWith("component.") || s === "component.")) continue;
    const l = a || t || s.slice(10);
    return r.event === "component.deleting" && typeof r.deletion_job_id == "string" && r.deletion_job_id ? { event: r.event, component_id: l, deletion_job_id: r.deletion_job_id } : r.event !== "component.meta.changed" ? { event: r.event, component_id: l } : {
      event: "component.meta.changed",
      component_id: l,
      meta: Bg(Hn(r.meta) ? r.meta : {}),
      deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
    };
  }
  return null;
}
function Fg(e, t) {
  const n = zg(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function Hg(e, t, n, i) {
  let o = !0;
  const r = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
  function s(h, p) {
    const v = e.value.find((w) => t(w) === h), g = a.get(h), m = p?.job_id || g?.deletion_job_id || v?.deletion_job_id, k = g ? g.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((g || v?.deleting_at) && m === k) return;
    const x = {
      deleting_at: g?.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: m
    };
    a.set(h, x), v && (Object.assign(v, x), v.deletion_job = void 0);
  }
  async function l(h) {
    const p = t(h), v = a.get(p), g = () => o && e.value.includes(h) && a.get(p) === v;
    try {
      const { data: m } = await mn.get(`/api/v1/components/${encodeURIComponent(p)}`);
      if (!m?.success) throw new Error(Fa(m, "Could not read deletion progress"));
      g() && (h.deleting_at = v?.deleting_at || m.deleting_at, h.deletion_job_id = m.deletion_job_id, v && (v.deletion_job_id = h.deletion_job_id), h.deletion_job = m.deletion_job ?? null);
    } catch (m) {
      g() && Km.handleError("other", { message: Fa(m, "Could not read deletion progress") });
    }
  }
  let c = [];
  const u = _e(() => e.value, (h, p = []) => {
    const v = h.filter((g) => !r.has(t(g)));
    for (const g of p)
      r.has(t(g)) || v.some((m) => t(m) === t(g)) || g.deleting_at;
    if (v.length !== h.length) {
      e.value = v;
      return;
    }
    for (const g of h) {
      const m = a.get(t(g));
      m && (g.deletion_job_id !== m.deletion_job_id && (g.deletion_job = void 0), Object.assign(g, m));
      const k = p.find((x) => t(x) === t(g));
      g.deletion_job === void 0 && k?.deletion_job_id === g.deletion_job_id && (g.deletion_job = k?.deletion_job), g.deleting_at && !c.includes(g) && l(g);
    }
    c = h;
  }, { immediate: !0 }), d = mi("@message", (h) => {
    const p = Fg(h);
    if (!p) return;
    const v = e.value.find((g) => t(g) === p.component_id);
    p.event === "component.deleted" ? (v && r.has(p.component_id), r.add(p.component_id), a.delete(p.component_id), e.value = e.value.filter((g) => t(g) !== p.component_id)) : v && s(p.component_id, { job_id: p.deletion_job_id });
  });
  return Qe(() => {
    o = !1, u(), typeof d == "function" && d();
  }), { acceptDeletion: s };
}
async function Fd(e, t) {
  const n = io(t), i = await Zm(`/api/v1/workflows/${encodeURIComponent(e)}/labels`, { labels: n }), o = gi(i.state), r = Array.isArray(o.labels) ? o.labels : Array.isArray(i.labels) ? i.labels : n;
  return io(r);
}
function zl(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function qg(e) {
  const t = zl(e), n = zl(t.document);
  if (t.api_version !== "kickside.flow/v1" || t.kind !== "flow" || typeof t.key != "string" || !t.key.trim() || typeof t.title != "string" || !t.title.trim() || !Number.isInteger(t.version) || Number(t.version) < 1 || !Array.isArray(t.refs) || !Object.keys(n).length || typeof t.checksum != "string" || !/^[0-9a-f]{64}$/.test(t.checksum)) throw new Error("The server returned an invalid Workflow artifact.");
  return {
    api_version: "kickside.flow/v1",
    key: t.key,
    kind: "flow",
    title: t.title,
    version: Number(t.version),
    refs: t.refs,
    document: n,
    checksum: t.checksum
  };
}
async function Hd(e) {
  const t = await Ed(`/api/v1/workflows/${encodeURIComponent(e)}/export`);
  return qg(t.flow);
}
async function Ug(e) {
  let t;
  try {
    t = (await mn.post("/api/v1/workflows/import", { flow: e, bindings: {} })).data;
  } catch (r) {
    const a = Jm(r);
    throw a ? new Error(a) : r;
  }
  const n = gi(t);
  if (n.success === !1) throw new Error(String(n.error || "import failed"));
  const i = gi(n.flow), o = String(i.flow_id || "");
  if (!o) throw new Error("the server did not return a flow id");
  return { flowId: o, title: String(i.title || "Imported Workflow") };
}
function Bo(e) {
  return e instanceof HTMLElement && e.isConnected && e.getClientRects().length > 0 && !e.closest(
    '[hidden], [inert], [aria-hidden="true"], [role="dialog"], [role="menu"], [role="menuitem"]'
  );
}
async function qd({
  root: e,
  target: t,
  fallback: n,
  isCurrent: i,
  delayMs: o = 500
}) {
  return await new Promise((r) => window.setTimeout(r, o)), i() ? (Bo(e?.activeElement ?? null) || (t && Bo(t) && t.focus(), !Bo(e?.activeElement ?? null) && n && Bo(n) && n.focus()), !0) : !1;
}
const Wg = {
  ok: "tabler:circle-check",
  error: "tabler:alert-triangle",
  pending: "tabler:loader-2"
};
function Yg(e, t) {
  const n = [];
  return e > 0 && n.push(`${e} step${e === 1 ? "" : "s"}`), t > 0 && n.push(`${t} run${t === 1 ? "" : "s"}`), n.join(" · ");
}
function Gg(e) {
  const t = Number(e.published_version) || 0;
  if (t > 0) {
    const n = e.has_draft_changes === !0;
    return {
      published: !0,
      publishedVersion: t,
      version: `v${t}`,
      hasDraft: n,
      label: n ? `v${t} · draft` : `v${t}`,
      tone: n ? "draft" : "published"
    };
  }
  return { published: !1, publishedVersion: 0, version: null, hasDraft: !0, label: "Draft", tone: "draft" };
}
function jg(e) {
  const t = (e.breadcrumb || e.parent_name || "").trim();
  return t ? { present: !0, label: t, title: `In ${t}` } : { present: !1, label: "", title: "" };
}
function Xg(e, t = Date.now()) {
  const n = e.last_run;
  if (!n || !n.status)
    return { present: !1, tone: "pending", icon: "tabler:minus", label: "No runs", status: "", cause: "", title: "No runs yet" };
  const i = As(n.status), o = n.started_at || n.finished_at || null, r = Qt(o, t), a = ro(n.status), s = Id(n);
  return {
    present: !0,
    tone: i,
    icon: Wg[i],
    label: o ? r : a,
    status: n.status,
    cause: s,
    title: [a, o ? r : "", s].filter(Boolean).join(" · ")
  };
}
function Kg(e, t = Date.now()) {
  const n = Number(e.node_count) || 0, i = Number(e.run_count) || 0;
  return {
    id: e.id,
    deleting_at: e.deleting_at,
    deletion_job_id: e.deletion_job_id,
    deletion_job: e.deletion_job,
    title: e.title,
    steps: n,
    runs: i,
    labels: io(e.labels),
    location: jg(e),
    subline: Yg(n, i),
    status: Gg(e),
    lastRun: Xg(e, t),
    updated: e.updated_at ? Qt(e.updated_at, t) : "No edits"
  };
}
function Zg(e, t = Date.now()) {
  return e.map((n) => Kg(n, t));
}
const Qi = "", Jg = "No label";
function Qg(e) {
  const t = [];
  for (const n of e)
    for (const i of n.labels)
      t.some((o) => Ki(o, i)) || t.push(i);
  return t.sort((n, i) => n.localeCompare(i, void 0, { sensitivity: "base" }));
}
function ey(e, t) {
  const n = t.trim();
  return !n || e.some((i) => Ki(i, n)) ? e : [...e, n];
}
function ty(e, t) {
  const n = t.trim();
  return n ? e.filter((i) => !Ki(i, n)) : e;
}
function ny(e, t) {
  return e.labels.some((n) => Ki(n, t));
}
function oy(e, t) {
  return t === Qi ? e.filter((n) => n.labels.length === 0) : e.filter((n) => ny(n, t));
}
function iy(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  for (const o of e) {
    if (o.labels.length === 0) {
      n.push(o);
      continue;
    }
    for (const r of o.labels) {
      const a = r.toLowerCase(), s = t.get(a);
      s ? s.rows.push(o) : t.set(a, { key: r, header: r, rows: [o] });
    }
  }
  const i = Array.from(t.values()).sort(
    (o, r) => o.header.localeCompare(r.header, void 0, { sensitivity: "base" })
  );
  return n.length && i.push({ key: Qi, header: Jg, rows: n }), i;
}
class ry {
  constructor(t) {
    this.deps = t;
  }
  draft = "";
  // The id of a workflow created but not yet fully scaffolded — non-empty only between a
  // failed create() and its retry or abandon().
  get pendingDraftId() {
    return this.draft;
  }
  // Create (or reuse a prior draft), scaffold, then apply an optional label. On any failure
  // before scaffolding completes, the draft id is retained so the next call reuses it rather
  // than minting a second workflow. A label failure is soft: the workflow still opens.
  async create(t, n, i) {
    this.draft || (this.draft = await this.deps.createWorkflow(t, i)), await this.deps.applyScaffold(this.draft);
    const o = n.trim();
    if (o)
      try {
        await this.deps.setLabels(this.draft, [o]);
      } catch {
      }
    const r = this.draft;
    return this.draft = "", r;
  }
  // Best-effort teardown of a draft that was created but never scaffolded (the user closed
  // the dialog after a failed create). Clearing the id first means a delete failure leaves
  // nothing pending to retry — the row can still be removed from the list later.
  async abandon() {
    if (!this.draft) return;
    const t = this.draft;
    this.draft = "";
    try {
      await this.deps.deleteWorkflow(t);
    } catch {
    }
  }
}
const Oe = {
  NODE_ADD: "node.add",
  NODE_UPDATE: "node.update",
  NODE_REMOVE: "node.remove",
  EDGE_ADD: "edge.add",
  EDGE_UPDATE: "edge.update",
  EDGE_REMOVE: "edge.remove",
  NOTE_ADD: "note.add",
  NOTE_UPDATE: "note.update",
  NOTE_REMOVE: "note.remove",
  LAYOUT_SET_POSITION: "layout.set-position",
  LAYOUT_CLEAR_POSITION: "layout.clear-position",
  LAYOUT_SET_VIEWPORT: "layout.set-viewport",
  LAYOUT_SET_DIRECTION: "layout.set-direction",
  PARAM_SET: "param.set",
  LABELS_SET: "labels.set"
}, Te = {
  NODE_ADDED: "kickside.workflows.events:node.added",
  NODE_UPDATED: "kickside.workflows.events:node.updated",
  NODE_REMOVED: "kickside.workflows.events:node.removed",
  EDGE_ADDED: "kickside.workflows.events:edge.added",
  EDGE_UPDATED: "kickside.workflows.events:edge.updated",
  EDGE_REMOVED: "kickside.workflows.events:edge.removed",
  NOTE_ADDED: "kickside.workflows.events:note.added",
  NOTE_UPDATED: "kickside.workflows.events:note.updated",
  NOTE_REMOVED: "kickside.workflows.events:note.removed",
  LAYOUT_POSITION_SET: "kickside.workflows.events:layout.position-set",
  LAYOUT_POSITION_CLEARED: "kickside.workflows.events:layout.position-cleared",
  LAYOUT_VIEWPORT_SET: "kickside.workflows.events:layout.viewport-set",
  LAYOUT_DIRECTION_SET: "kickside.workflows.events:layout.direction-set",
  PARAM_SET: "kickside.workflows.events:param.set",
  LABELS_SET: "kickside.workflows.events:labels.set",
  VERSION_PUBLISHED: "kickside.workflows.events:version.published",
  VERSION_RESTORED: "kickside.workflows.events:version.restored"
}, Ud = {
  [Oe.NODE_ADD]: Te.NODE_ADDED,
  [Oe.NODE_UPDATE]: Te.NODE_UPDATED,
  [Oe.NODE_REMOVE]: Te.NODE_REMOVED,
  [Oe.EDGE_ADD]: Te.EDGE_ADDED,
  [Oe.EDGE_UPDATE]: Te.EDGE_UPDATED,
  [Oe.EDGE_REMOVE]: Te.EDGE_REMOVED,
  [Oe.NOTE_ADD]: Te.NOTE_ADDED,
  [Oe.NOTE_UPDATE]: Te.NOTE_UPDATED,
  [Oe.NOTE_REMOVE]: Te.NOTE_REMOVED,
  [Oe.LAYOUT_SET_POSITION]: Te.LAYOUT_POSITION_SET,
  [Oe.LAYOUT_CLEAR_POSITION]: Te.LAYOUT_POSITION_CLEARED,
  [Oe.LAYOUT_SET_VIEWPORT]: Te.LAYOUT_VIEWPORT_SET,
  [Oe.LAYOUT_SET_DIRECTION]: Te.LAYOUT_DIRECTION_SET,
  [Oe.PARAM_SET]: Te.PARAM_SET,
  [Oe.LABELS_SET]: Te.LABELS_SET
}, Ps = ["retry_policy", "start_to_close_timeout", "schedule_to_close_timeout"];
function gt() {
  const e = globalThis.crypto;
  return e && typeof e.randomUUID == "function" ? e.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function bi(e) {
  const t = { id: e.id || gt(), kind: e.kind, title: e.title };
  e.ref && (t.ref = e.ref), e.config && (t.config = e.config);
  for (const n of Ps) e[n] !== void 0 && (t[n] = e[n]);
  return { type: Oe.NODE_ADD, body: t };
}
function Wd(e, t) {
  return { type: Oe.NODE_UPDATE, body: { id: e, ...t } };
}
function ay(e) {
  return { type: Oe.NODE_REMOVE, body: { id: e } };
}
function _i(e) {
  const t = { id: e.id || gt(), source_id: e.source_id, target_id: e.target_id };
  return e.source_port && (t.source_port = e.source_port), e.target_port && (t.target_port = e.target_port), e.transform && (t.transform = e.transform), { type: Oe.EDGE_ADD, body: t };
}
function ki(e, t) {
  return { type: Oe.EDGE_UPDATE, body: { id: e, ...t } };
}
function Ei(e) {
  return { type: Oe.EDGE_REMOVE, body: { id: e } };
}
function Fl(e) {
  const t = { id: e.id || gt(), body: e.text };
  return e.kind && (t.kind = e.kind), e.width && (t.width = e.width), e.height && (t.height = e.height), e.color && (t.color = e.color), { type: Oe.NOTE_ADD, body: t };
}
function sy(e, t) {
  const n = { id: e };
  return t.text !== void 0 && (n.body = t.text), t.kind !== void 0 && (n.kind = t.kind), t.width !== void 0 && (n.width = t.width), t.height !== void 0 && (n.height = t.height), t.color !== void 0 && (n.color = t.color), { type: Oe.NOTE_UPDATE, body: n };
}
function ly(e) {
  return { type: Oe.NOTE_REMOVE, body: { id: e } };
}
function Ct(e, t, n, i, o) {
  const r = { node_id: e, x: Math.round(t), y: Math.round(n) };
  return Number.isFinite(i) && i && (r.width = Math.round(i)), Number.isFinite(o) && o && (r.height = Math.round(o)), { type: Oe.LAYOUT_SET_POSITION, body: r };
}
function uy(e) {
  return { type: Oe.LAYOUT_SET_DIRECTION, body: { direction: e } };
}
const Hl = { type: "object", properties: {} };
function cy() {
  const e = gt(), t = gt();
  return [
    bi({ id: e, kind: "start", title: "Start", config: { input_schema: Hl } }),
    Ct(e, 240, 80),
    bi({ id: t, kind: "finish", title: "Finish", config: { output_schema: Hl } }),
    Ct(t, 240, 340)
  ];
}
const dy = { class: "kx-head" }, fy = { class: "kx-head-icon" }, hy = { class: "kx-head-actions" }, py = {
  key: 0,
  class: "wf-label-filter"
}, vy = { class: "kx-count" }, my = "Build Workflows from steps, tools, and AI agents. Publish them to use them in Automations, other Workflows, or agents.", Sr = "__all__", gy = /* @__PURE__ */ ye({
  __name: "WorkflowListHeader",
  props: {
    totalCount: {},
    labelVocab: {},
    q: {},
    labelFilter: {},
    groupBy: {}
  },
  emits: ["update:q", "update:labelFilter", "update:groupBy", "import", "create"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = [
      { label: "Flat", value: "flat" },
      { label: "Grouped", value: "label" }
    ], r = U(() => [
      { label: "All labels", value: Sr },
      ...n.labelVocab.map((c) => ({ label: c, value: c })),
      { label: "No label", value: Qi }
    ]);
    function a(c) {
      i("update:labelFilter", c === Sr || c === null ? null : c);
    }
    function s(c) {
      c && i("update:groupBy", c);
    }
    function l(c) {
      return c.currentTarget instanceof HTMLElement ? c.currentTarget : null;
    }
    return (c, u) => (S(), R("header", dy, [
      $("div", fy, [
        V(f(ie), {
          icon: "tabler:route",
          "aria-hidden": "true"
        })
      ]),
      $("div", { class: "kx-head-text" }, [
        $("h1", {
          class: "kx-title",
          title: my
        }, "Workflows")
      ]),
      $("div", hy, [
        V(f(Dd), { class: "kx-search" }, {
          default: ne(() => [
            V(f(Pd), null, {
              default: ne(() => [
                V(f(ie), {
                  icon: "tabler:search",
                  class: "kx-search-ico",
                  "aria-hidden": "true"
                })
              ]),
              _: 1
            }),
            V(f(rt), {
              value: e.q,
              class: "kx-search-input",
              type: "text",
              placeholder: "Search Workflows…",
              "aria-label": "Search Workflows",
              onInput: u[0] || (u[0] = (d) => i("update:q", d.target.value))
            }, null, 8, ["value"])
          ]),
          _: 1
        }),
        e.labelVocab.length ? (S(), R("div", py, [
          V(f(ie), {
            icon: "tabler:tag",
            class: "wf-label-filter-ico",
            "aria-hidden": "true"
          }),
          V(f(St), {
            class: "wf-label-select",
            "model-value": e.labelFilter === null ? Sr : e.labelFilter,
            options: r.value,
            "option-label": "label",
            "option-value": "value",
            "aria-label": "Filter by label",
            "onUpdate:modelValue": a
          }, null, 8, ["model-value", "options"])
        ])) : Z("", !0),
        V(f(Ts), {
          class: "kx-seg",
          "model-value": e.groupBy,
          options: [...o],
          "option-label": "label",
          "option-value": "value",
          "aria-label": "Group by label",
          "allow-empty": !1,
          "onUpdate:modelValue": s
        }, null, 8, ["model-value", "options"]),
        V(f(fe), {
          "data-testid": "import-workflow",
          severity: "secondary",
          outlined: "",
          title: "Import a Workflow JSON file",
          onClick: u[1] || (u[1] = (d) => i("import", l(d)))
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:file-import",
              "aria-hidden": "true"
            }),
            u[3] || (u[3] = $("span", null, "Import", -1))
          ]),
          _: 1
        }),
        $("span", vy, j(e.totalCount) + " Workflow" + j(e.totalCount === 1 ? "" : "s"), 1),
        V(f(fe), {
          "data-testid": "create-workflow",
          onClick: u[2] || (u[2] = (d) => i("create", l(d)))
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:plus",
              "aria-hidden": "true"
            }),
            u[4] || (u[4] = $("span", null, "New Workflow", -1))
          ]),
          _: 1
        })
      ])
    ]));
  }
}), yy = { key: 0 }, wy = /* @__PURE__ */ ye({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, n = U(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (i, o) => e.state.deleting_at ? (S(), R("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: o[1] || (o[1] = Fe(() => {
      }, ["stop"])),
      onKeydown: o[2] || (o[2] = Fe(() => {
      }, ["stop"]))
    }, [
      n.value ? (S(), R(ue, { key: 0 }, [
        $("span", null, [
          o[3] || (o[3] = ce("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (S(), R("span", yy, ": " + j(e.state.deletion_job.last_error), 1)) : Z("", !0)
        ]),
        V(f(fe), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: o[0] || (o[0] = Fe((r) => i.$emit("retry"), ["stop"]))
        })
      ], 64)) : (S(), R(ue, { key: 1 }, [
        V(f(dt), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        o[4] || (o[4] = $("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : Z("", !0);
  }
}), by = /* @__PURE__ */ Cg(wy, [["__scopeId", "data-v-63c136c7"]]), _y = 2e3;
function ql(e) {
  const t = e.margin ?? 8, n = e.gap ?? 4, i = Math.max(0, e.viewportWidth), o = Math.max(0, e.viewportHeight), r = Math.max(0, i - t * 2), a = Math.min(Math.max(0, e.requestedWidth), r), s = e.align === "right" ? e.anchor.right - a : e.anchor.left, l = Math.max(t, Math.min(s, i - t - a)), c = Math.max(0, o - e.anchor.bottom - n - t), u = Math.max(0, e.anchor.top - n - t), d = c < e.requestedMaxHeight && u > c ? "above" : "below", h = d === "above" ? u : c, p = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), h)), v = Math.min(Math.max(0, e.panelHeight ?? p), p), g = d === "above" ? e.anchor.top - n - v : e.anchor.bottom + n, m = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(l - m.left),
    width: Math.round(a),
    maxHeight: p,
    side: d,
    top: Math.round(g - m.top)
  };
}
const ky = /* @__PURE__ */ ye({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: _y }
  },
  emits: ["update:open"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(null), r = Y({ position: "fixed", visibility: "hidden" });
    function a() {
      const g = n.anchor, m = o.value;
      if (!g || !m) return;
      const k = g.getBoundingClientRect(), x = n.width === "anchor" ? Math.max(n.minWidth, k.width) : Math.max(n.minWidth, n.width), w = {
        anchor: k,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: x,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, b = ql(w);
      Object.assign(m.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${b.width}px`,
        maxHeight: `${b.maxHeight}px`,
        visibility: "hidden"
      });
      const C = m.getBoundingClientRect(), I = ql({
        ...w,
        containingBlockOrigin: { left: C.left, top: C.top },
        panelHeight: C.height
      }), z = {
        position: "fixed",
        left: `${I.left}px`,
        top: `${I.top}px`,
        width: `${I.width}px`,
        maxHeight: `${I.maxHeight}px`,
        "--anchored-panel-available-height": `${I.maxHeight}px`,
        margin: "0",
        zIndex: String(n.zIndex),
        visibility: "visible"
      };
      r.value = z;
    }
    let s = null, l = !1;
    function c() {
      l || !n.open || (l = !0, requestAnimationFrame(() => {
        l = !1, n.open && a();
      }));
    }
    function u() {
      typeof ResizeObserver > "u" || (s = new ResizeObserver(c), o.value && s.observe(o.value), n.anchor && s.observe(n.anchor));
    }
    function d() {
      s?.disconnect(), s = null, l = !1;
    }
    _e(() => n.open, async (g) => {
      d(), g && (r.value = { position: "fixed", visibility: "hidden" }, await Ve(), a(), u());
    }, { immediate: !0 });
    function h(g) {
      if (!n.open) return;
      const m = g.composedPath();
      o.value && m.includes(o.value) || n.anchor && m.includes(n.anchor) || i("update:open", !1);
    }
    function p(g) {
      n.open && g.key === "Escape" && i("update:open", !1);
    }
    function v() {
      n.open && a();
    }
    return document.addEventListener("click", h), document.addEventListener("keydown", p), window.addEventListener("resize", v), window.addEventListener("scroll", v, !0), Qe(() => {
      d(), document.removeEventListener("click", h), document.removeEventListener("keydown", p), window.removeEventListener("resize", v), window.removeEventListener("scroll", v, !0);
    }), (g, m) => e.open ? (S(), R("div", {
      key: 0,
      ref_key: "panel",
      ref: o,
      class: "anchored-panel",
      style: ze(r.value)
    }, [
      Be(g.$slots, "default")
    ], 4)) : Z("", !0);
  }
});
function Yd(e) {
  return `${(e || "").normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "flow"}.flow.json`;
}
function Ls(e, t) {
  if (typeof document > "u") return;
  const n = new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), i = URL.createObjectURL(n), o = document.createElement("a");
  o.href = i, o.download = e, document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(i);
}
const Ey = {
  class: "kx-list wf-table",
  role: "table",
  "aria-label": "Workflows"
}, xy = {
  key: 0,
  class: "wf-group-head",
  role: "row"
}, $y = { class: "wf-group-title" }, Sy = { class: "wf-group-count" }, Cy = ["onClick", "onKeydown"], Ny = {
  class: "wf-row-main",
  role: "cell"
}, Iy = { class: "wf-row-icon" }, Ay = { class: "wf-row-text" }, My = { class: "wf-row-name" }, Ty = {
  key: 0,
  class: "wf-row-sub"
}, Oy = { class: "wf-label-chip-text" }, Ry = { key: 1 }, Dy = ["title"], Py = {
  class: "wf-status-cell",
  role: "cell",
  "data-label": "Status"
}, Ly = {
  class: "wf-lastrun",
  role: "cell",
  "data-label": "Last run"
}, Vy = ["title"], By = {
  class: "wf-row-updated",
  role: "cell",
  "data-label": "Updated"
}, zy = {
  class: "wf-row-menu",
  role: "menu",
  "aria-label": "Workflow actions"
}, Fy = {
  key: 0,
  class: "wf-row-menu-sep",
  role: "separator"
}, Hy = ["title", "disabled", "aria-label", "onClick"], qy = /* @__PURE__ */ ye({
  __name: "WorkflowTable",
  props: {
    items: {}
  },
  emits: ["open", "labels-saved", "label-error", "export-error", "share", "ask-delete"],
  setup(e, { emit: t }) {
    function n(N) {
      return N === "published" ? "success" : "warn";
    }
    function i(N) {
      return N.lastRun.present ? N.lastRun.tone === "ok" ? "success" : N.lastRun.tone === "error" ? "danger" : "info" : "secondary";
    }
    const o = e, r = t, a = Y(null), s = Y(""), l = Y(""), c = Y(null), u = Y(null), d = Y(""), h = Y(null), p = U({
      get: () => u.value !== null,
      set: (N) => {
        N || I();
      }
    }), v = U(() => {
      const N = u.value;
      if (!N) return null;
      const H = o.items.find((y) => y.kind === "row" && y.row.id === N);
      return H?.kind === "row" ? H.row : null;
    });
    function g(N, H) {
      H.stopPropagation();
      const y = a.value !== N;
      a.value = y ? N : null, s.value = "", r("label-error", ""), y && Ve(m);
    }
    function m() {
      const N = c.value?.$el;
      N instanceof HTMLInputElement && N.focus();
    }
    function k() {
      a.value = null, s.value = "";
    }
    async function x(N, H) {
      l.value = N, r("label-error", "");
      try {
        const y = await Fd(N, H);
        r("labels-saved", N, y);
      } catch (y) {
        r("label-error", qe(y, "Couldn’t update labels."));
      } finally {
        l.value = "";
      }
    }
    async function w(N) {
      const H = io(N.labels), y = ey(H, s.value);
      s.value = "", y !== H && await x(N.id, y);
    }
    async function b(N, H, y) {
      y.stopPropagation(), await x(N.id, ty(io(N.labels), H));
    }
    function C(N, H) {
      if (H.stopPropagation(), u.value === N) {
        I();
        return;
      }
      u.value = N, h.value = H.currentTarget instanceof HTMLElement ? H.currentTarget : null;
    }
    function I() {
      u.value = null, h.value = null;
    }
    function z(N) {
      N.disabled || !N.command || N.command();
    }
    async function T(N) {
      if (!(!N.status.published || d.value)) {
        d.value = N.id, r("export-error", "");
        try {
          const H = await Hd(N.id);
          Ls(Yd(H.title), H), I();
        } catch (H) {
          r("export-error", qe(H, "Couldn’t export this Workflow."));
        } finally {
          d.value = "";
        }
      }
    }
    function O(N) {
      const H = h.value;
      I(), r("ask-delete", N, H);
    }
    function D(N) {
      const H = h.value;
      I(), r("share", N, H);
    }
    const B = U(() => {
      const N = v.value;
      if (!N) return [];
      const H = N.status.published && d.value !== N.id, y = N.status.published ? "Export" : "Export unavailable. Publish this Workflow before exporting it.";
      return [
        {
          label: "Share",
          icon: "tabler:share",
          title: "Share this Workflow",
          command: () => D(N)
        },
        { separator: !0 },
        {
          label: y,
          visibleLabel: "Export",
          icon: "tabler:download",
          disabled: !H,
          title: N.status.published ? "Download this published Workflow as JSON" : "Publish this Workflow before exporting it",
          command: () => T(N)
        },
        { separator: !0 },
        {
          label: "Delete",
          icon: "tabler:trash",
          title: "Delete this Workflow",
          danger: !0,
          command: () => O(N)
        }
      ];
    });
    return (N, H) => (S(), R(ue, null, [
      $("div", Ey, [
        H[5] || (H[5] = $("div", {
          class: "wf-table-head",
          role: "row"
        }, [
          $("span", { role: "columnheader" }, "Name"),
          $("span", { role: "columnheader" }, "Labels"),
          $("span", { role: "columnheader" }, "Location"),
          $("span", { role: "columnheader" }, "Status"),
          $("span", { role: "columnheader" }, "Last run"),
          $("span", { role: "columnheader" }, "Updated"),
          $("span", {
            role: "columnheader",
            class: "wf-sr-only"
          }, "Actions")
        ], -1)),
        (S(!0), R(ue, null, Re(e.items, (y) => (S(), R(ue, {
          key: y.key
        }, [
          y.kind === "header" ? (S(), R("div", xy, [
            V(f(ie), {
              icon: y.empty ? "tabler:tag-off" : "tabler:tag",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            $("span", $y, j(y.header), 1),
            $("span", Sy, j(y.count), 1)
          ])) : (S(), R("div", {
            key: 1,
            class: "kx-row wf-row",
            role: "row",
            tabindex: "0",
            onClick: (E) => !y.row.deleting_at && r("open", y.row.id),
            onKeydown: [
              tt((E) => !y.row.deleting_at && r("open", y.row.id), ["enter"]),
              tt(Fe((E) => !y.row.deleting_at && r("open", y.row.id), ["prevent"]), ["space"])
            ]
          }, [
            $("span", Ny, [
              $("span", Iy, [
                V(f(ie), {
                  icon: "tabler:route",
                  "aria-hidden": "true"
                })
              ]),
              $("span", Ay, [
                V(by, {
                  state: y.row,
                  onRetry: (E) => O(y.row)
                }, null, 8, ["state", "onRetry"]),
                $("span", My, [
                  $("strong", null, j(y.row.title), 1)
                ]),
                y.row.subline ? (S(), R("span", Ty, j(y.row.subline), 1)) : Z("", !0)
              ])
            ]),
            $("span", {
              class: "wf-labels-cell",
              role: "cell",
              "data-label": "Labels",
              onClick: H[2] || (H[2] = Fe(() => {
              }, ["stop"]))
            }, [
              (S(!0), R(ue, null, Re(y.row.labels, (E) => (S(), R("span", {
                key: E,
                class: "wf-label-chip"
              }, [
                $("span", Oy, j(E), 1),
                V(f(fe), {
                  class: "wf-label-x",
                  text: "",
                  rounded: "",
                  severity: "secondary",
                  "aria-label": `Remove label ${E}`,
                  disabled: !!y.row.deleting_at || l.value === y.row.id,
                  onClick: Fe((_) => b(y.row, E, _), ["stop"])
                }, {
                  default: ne(() => [
                    V(f(ie), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ]))), 128)),
              a.value === y.row.id ? (S(), R(ue, { key: 0 }, [
                V(f(rt), {
                  ref_for: !0,
                  ref_key: "labelInputRef",
                  ref: c,
                  modelValue: s.value,
                  "onUpdate:modelValue": H[0] || (H[0] = (E) => s.value = E),
                  class: "wf-label-input",
                  type: "text",
                  placeholder: "Add label…",
                  "aria-label": `Add a label to ${y.row.title}`,
                  onClick: H[1] || (H[1] = Fe(() => {
                  }, ["stop"])),
                  onKeydown: [
                    tt(Fe((E) => w(y.row), ["stop", "prevent"]), ["enter"]),
                    tt(Fe(k, ["stop"]), ["escape"])
                  ]
                }, null, 8, ["modelValue", "aria-label", "onKeydown"]),
                V(f(fe), {
                  class: "wf-label-done",
                  text: "",
                  rounded: "",
                  severity: "secondary",
                  "aria-label": "Done editing labels",
                  onClick: Fe(k, ["stop"])
                }, {
                  default: ne(() => [
                    V(f(ie), {
                      icon: "tabler:check",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                })
              ], 64)) : (S(), ae(f(fe), {
                key: 1,
                class: "wf-label-add",
                text: "",
                severity: "secondary",
                "aria-label": `Add a label to ${y.row.title}`,
                disabled: !!y.row.deleting_at || l.value === y.row.id,
                loading: l.value === y.row.id,
                onClick: Fe((E) => g(y.row.id, E), ["stop"])
              }, {
                default: ne(() => [
                  l.value !== y.row.id ? (S(), ae(f(ie), {
                    key: 0,
                    icon: "tabler:plus",
                    "aria-hidden": "true"
                  })) : Z("", !0),
                  y.row.labels.length ? Z("", !0) : (S(), R("span", Ry, "Label"))
                ]),
                _: 2
              }, 1032, ["aria-label", "disabled", "loading", "onClick"]))
            ]),
            $("span", {
              class: Ie(["wf-loc-cell", !y.row.location.present && "is-empty"]),
              role: "cell",
              "data-label": "Location"
            }, [
              y.row.location.present ? (S(), R(ue, { key: 0 }, [
                V(f(ie), {
                  icon: "tabler:folder",
                  class: "wf-loc-ico",
                  "aria-hidden": "true"
                }),
                $("span", {
                  class: "wf-loc-name",
                  title: y.row.location.title
                }, j(y.row.location.label), 9, Dy)
              ], 64)) : Z("", !0)
            ], 2),
            $("span", Py, [
              V(f(yt), {
                class: "wf-status-tag",
                severity: n(y.row.status.tone),
                title: y.row.status.hasDraft && y.row.status.published ? "Published, with unpublished draft edits" : y.row.status.published ? "Published" : "Not published yet"
              }, {
                default: ne(() => [
                  y.row.status.hasDraft && y.row.status.published ? (S(), ae(f(ie), {
                    key: 0,
                    icon: "tabler:pencil",
                    class: "wf-pill-ico",
                    "aria-hidden": "true"
                  })) : Z("", !0),
                  ce(" " + j(y.row.status.label), 1)
                ]),
                _: 2
              }, 1032, ["severity", "title"])
            ]),
            $("span", Ly, [
              V(f(yt), {
                class: "wf-last-run-tag",
                severity: i(y.row),
                title: y.row.lastRun.title
              }, {
                default: ne(() => [
                  y.row.lastRun.present && y.row.lastRun.tone === "pending" ? (S(), ae(f(dt), {
                    key: 0,
                    class: "wf-status-spinner",
                    "stroke-width": "4",
                    "aria-label": "Run in progress"
                  })) : (S(), ae(f(ie), {
                    key: 1,
                    icon: y.row.lastRun.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])),
                  $("span", null, j(y.row.lastRun.label), 1)
                ]),
                _: 2
              }, 1032, ["severity", "title"]),
              y.row.lastRun.cause ? (S(), R("span", {
                key: 0,
                class: "wf-last-run-cause",
                title: y.row.lastRun.cause
              }, j(y.row.lastRun.cause), 9, Vy)) : Z("", !0)
            ]),
            $("span", By, j(y.row.updated), 1),
            $("span", {
              class: "wf-row-actions",
              role: "cell",
              onClick: H[3] || (H[3] = Fe(() => {
              }, ["stop"]))
            }, [
              V(f(fe), {
                class: Ie(["wf-row-menu-btn", u.value === y.row.id && "is-open"]),
                disabled: !!y.row.deleting_at,
                text: "",
                rounded: "",
                severity: "secondary",
                "aria-label": `Actions for ${y.row.title}`,
                "aria-expanded": u.value === y.row.id,
                onClick: Fe((E) => C(y.row.id, E), ["stop"])
              }, {
                default: ne(() => [
                  V(f(ie), {
                    icon: "tabler:dots-vertical",
                    "aria-hidden": "true"
                  })
                ]),
                _: 1
              }, 8, ["disabled", "class", "aria-label", "aria-expanded", "onClick"])
            ])
          ], 40, Cy))
        ], 64))), 128))
      ]),
      V(ky, {
        open: p.value,
        "onUpdate:open": H[4] || (H[4] = (y) => p.value = y),
        anchor: h.value,
        align: "right",
        width: 190
      }, {
        default: ne(() => [
          $("div", zy, [
            (S(!0), R(ue, null, Re(B.value, (y, E) => (S(), R(ue, { key: E }, [
              y.separator ? (S(), R("div", Fy)) : (S(), R("button", {
                key: 1,
                type: "button",
                class: Ie(["wf-row-menu-item", y.danger && "wf-row-menu-item--danger"]),
                role: "menuitem",
                title: y.title,
                disabled: y.disabled,
                "aria-label": y.label,
                onClick: (_) => z(y)
              }, [
                y.icon ? (S(), ae(f(ie), {
                  key: 0,
                  icon: y.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : Z("", !0),
                $("span", null, j(y.visibleLabel || y.label), 1)
              ], 10, Hy))
            ], 64))), 128))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), Uy = { class: "kx-modal-head-icon" }, Wy = { class: "kx-modal-body" }, Yy = { class: "kx-field" }, Gy = { class: "kx-field" }, jy = /* @__PURE__ */ ye({
  __name: "ImportModal",
  props: {
    open: { type: Boolean }
  },
  emits: ["close", "open"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(""), r = Y(!1), a = Y(""), s = Y(null), l = { severity: "secondary", outlined: !0 }, c = {
      header: { class: "kx-modal-head" },
      content: { style: "padding: 0" },
      footer: { class: "kx-modal-foot" }
    };
    _e(() => n.open, (p) => {
      p && (o.value = "", a.value = "", s.value?.clear());
    });
    function u(p) {
      p || i("close");
    }
    async function d(p) {
      const v = Array.isArray(p.files) ? p.files[0] : void 0;
      if (v) {
        a.value = "";
        try {
          o.value = await v.text();
        } catch {
          a.value = "Couldn’t read that file.";
        } finally {
          s.value?.clear();
        }
      }
    }
    async function h() {
      if (r.value) return;
      const p = o.value.trim();
      if (!p) {
        a.value = "Paste a Workflow export, or choose a file.";
        return;
      }
      let v;
      try {
        v = JSON.parse(p);
      } catch {
        a.value = "That isn’t valid JSON — paste a Workflow export.";
        return;
      }
      r.value = !0, a.value = "";
      try {
        const { flowId: g } = await Ug(v);
        i("open", g);
      } catch (g) {
        a.value = qe(g, "Couldn’t import this Workflow.");
      } finally {
        r.value = !1;
      }
    }
    return (p, v) => (S(), ae(f(Jt), {
      visible: e.open,
      modal: !0,
      "dismissable-mask": !0,
      class: "kx-modal",
      pt: c,
      "aria-label": "Import Workflow",
      "onUpdate:visible": u
    }, {
      header: ne(() => [
        $("span", Uy, [
          V(f(ie), {
            icon: "tabler:file-import",
            "aria-hidden": "true"
          })
        ]),
        v[2] || (v[2] = $("div", {
          class: "kx-modal-head-text",
          style: { flex: "1" }
        }, [
          $("div", { class: "kx-modal-head-title" }, "Import a Workflow"),
          $("div", { class: "kx-modal-head-sub" }, "Paste an exported Workflow or choose a file. We’ll create a draft copy.")
        ], -1))
      ]),
      footer: ne(() => [
        V(f(fe), {
          severity: "secondary",
          text: "",
          onClick: v[1] || (v[1] = (g) => i("close"))
        }, {
          default: ne(() => [...v[4] || (v[4] = [
            ce("Cancel", -1)
          ])]),
          _: 1
        }),
        V(f(fe), {
          disabled: r.value,
          loading: r.value,
          onClick: h
        }, {
          default: ne(() => [
            r.value ? Z("", !0) : (S(), ae(f(ie), {
              key: 0,
              icon: "tabler:file-import",
              "aria-hidden": "true"
            })),
            v[5] || (v[5] = $("span", null, "Import", -1))
          ]),
          _: 1
        }, 8, ["disabled", "loading"])
      ]),
      default: ne(() => [
        $("div", Wy, [
          $("div", Yy, [
            V(f(Ng), {
              ref_key: "importUploadRef",
              ref: s,
              mode: "basic",
              name: "workflow",
              accept: "application/json,.json",
              "choose-label": "Choose file…",
              class: "wf-import-upload",
              multiple: !1,
              auto: !1,
              "choose-button-props": l,
              onSelect: d
            }, {
              chooseicon: ne(() => [
                V(f(ie), {
                  icon: "tabler:upload",
                  "aria-hidden": "true"
                })
              ]),
              _: 1
            }, 512)
          ]),
          $("div", Gy, [
            v[3] || (v[3] = $("label", { class: "kx-field-lbl" }, "Exported Workflow JSON", -1)),
            V(f(Os), {
              modelValue: o.value,
              "onUpdate:modelValue": v[0] || (v[0] = (g) => o.value = g),
              class: "kx-input wf-import-text wf-mono",
              rows: "9",
              placeholder: '{ "title": "My Workflow", "spec": { … } }',
              "aria-label": "Exported Workflow JSON"
            }, null, 8, ["modelValue"])
          ]),
          a.value ? (S(), ae(f(He), {
            key: 0,
            class: "wf-setup-error",
            severity: "error",
            closable: !1
          }, {
            default: ne(() => [
              ce(j(a.value), 1)
            ]),
            _: 1
          })) : Z("", !0)
        ])
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}), Cr = "kickside-share";
function Xy(e, t = "Workflow") {
  return {
    resource_id: e,
    access_url: `/api/v1/component-access/grants/${encodeURIComponent(e)}`,
    share_url: `/api/v1/component-access/share/${encodeURIComponent(e)}`,
    title: t.trim() || "Workflow"
  };
}
async function Gd(e, t, n, i) {
  if (e.innerHTML = "", !customElements.get(Cr))
    try {
      await Xi(Cr, { timeoutMs: 8e3 });
    } catch {
    }
  const o = document.createElement(Cr);
  o.setAttribute("config", JSON.stringify(Xy(t, n))), o.style.display = "block";
  let r = null, a = !1, s = !1;
  const l = () => {
    s || (s = !0, r?.disconnect(), i());
  }, c = () => {
    !!o.shadowRoot?.querySelector('[role="dialog"]') ? a = !0 : a && l();
  };
  return o.addEventListener("close", l), e.appendChild(o), queueMicrotask(() => {
    o.shadowRoot && (r = new MutationObserver(c), r.observe(o.shadowRoot, { childList: !0, subtree: !0 }), c());
  }), o;
}
const Ky = { class: "kx-modal-head-icon" }, Zy = { class: "kx-modal-body" }, Jy = { class: "kx-field" }, Qy = { class: "kx-field" }, ew = {
  key: 0,
  class: "wf-create-place"
}, tw = { class: "kx-modal-head-icon wf-del-icon" }, nw = { class: "kx-modal-body" }, ow = { class: "wf-del-note" }, iw = { class: "kx-body" }, rw = {
  key: 0,
  class: "kx-list wf-runs-loading"
}, aw = {
  key: 1,
  class: "kx-empty"
}, sw = { class: "kx-empty-ico" }, lw = {
  key: 2,
  class: "kx-empty"
}, uw = { class: "kx-empty-ico" }, cw = { class: "kx-empty-title" }, dw = { class: "kx-empty-sub" }, fw = /* @__PURE__ */ ye({
  __name: "WorkflowList",
  emits: ["open"],
  setup(e, { emit: t }) {
    const n = t, i = _d(), o = U(() => {
      const M = i.value || {};
      return (typeof M.parentId == "string" ? M.parentId : "").trim();
    }), r = Y([]), a = Y(!0), s = Y(""), l = Y(""), c = Y(""), u = Y(""), d = Y(!1), h = Y(null), p = Y("flat"), v = Y(""), g = Y(!1), m = Y(!1), k = Y(null), x = Y(null), w = Y(null), b = Y(null), C = Y(null);
    let I = 0;
    function z(M = null) {
      I += 1;
      const A = w.value?.getRootNode();
      b.value = A?.activeElement instanceof HTMLElement ? A.activeElement : null, C.value = M;
    }
    async function T() {
      const M = I, A = b.value, q = C.value;
      await Ve();
      const Q = w.value?.getRootNode();
      await qd({
        root: Q ?? null,
        target: A,
        fallback: q,
        isCurrent: () => M === I
      }) && (I += 1, b.value = null, C.value = null);
    }
    const O = new ry({
      createWorkflow: (M, A) => Qm(M, A),
      applyScaffold: (M) => xd(M, cy()).then(() => {
      }),
      setLabels: (M, A) => Fd(M, A).then(() => {
      }),
      deleteWorkflow: (M) => Tl(M)
    }), D = U(() => Zg(r.value)), B = U(() => Qg(D.value)), N = U(() => {
      const M = l.value.trim().toLowerCase();
      let A = D.value.filter((q) => M ? `${q.title} ${q.id}`.toLowerCase().includes(M) : !0);
      return h.value !== null && (A = oy(A, h.value)), A;
    }), H = U(() => iy(N.value)), y = U(() => {
      if (p.value !== "label") return N.value.map((A) => ({ kind: "row", key: A.id, row: A }));
      const M = [];
      for (const A of H.value) {
        M.push({ kind: "header", key: `h:${A.key}`, header: A.header, empty: A.key === Qi, count: A.rows.length });
        for (const q of A.rows) M.push({ kind: "row", key: `${A.key}:${q.id}`, row: q });
      }
      return M;
    }), E = U(() => r.value.length);
    function _(M, A) {
      r.value = r.value.map((q) => q.id === M ? { ...q, labels: A } : q);
    }
    async function L() {
      a.value = !0, s.value = "";
      try {
        r.value = await $d();
      } catch (M) {
        s.value = qe(M, "Couldn’t load your Workflows.");
      } finally {
        a.value = !1;
      }
    }
    const F = U(() => !!c.value.trim() && !d.value);
    function J() {
      z(), c.value = "", u.value = "", s.value = "", g.value = !0;
    }
    function X() {
      g.value = !1, T(), O.pendingDraftId && O.abandon().then(L);
    }
    async function oe() {
      if (!g.value || d.value) return;
      const M = c.value.trim();
      if (!M) {
        s.value = "Name your Workflow first.";
        return;
      }
      d.value = !0, s.value = "";
      try {
        const A = await O.create(M, u.value, o.value || void 0);
        g.value = !1, n("open", A);
      } catch (A) {
        s.value = qe(A, "Couldn’t create the Workflow.");
      } finally {
        d.value = !1;
      }
    }
    const se = Y(null), W = Y(!1), K = Y(!1), G = {
      header: { class: "kx-modal-head" },
      content: { style: "padding: 0" },
      footer: { class: "kx-modal-foot" }
    };
    function ee() {
      z(), m.value = !0;
    }
    function te() {
      m.value = !1, T();
    }
    function re(M) {
      const A = Array.from(w.value?.querySelectorAll("button[aria-label]") ?? []).find((q) => q.getAttribute("aria-label") === `Actions for ${M.title}`) ?? null;
      z(A), K.value = !1, se.value = M;
    }
    function le() {
      K.value = !1, se.value = null, T();
    }
    async function we() {
      K.value && (K.value = !1, await Ve(), w.value?.querySelector('button[aria-label^="Actions for"]')?.focus(), I += 1, b.value = null, C.value = null);
    }
    async function $e() {
      const M = se.value;
      if (!(!M || W.value)) {
        W.value = !0, s.value = "";
        try {
          await Tl(M.id), P(M.id), await L(), K.value = !0, se.value = null;
        } catch (A) {
          s.value = qe(A, "Couldn’t delete this Workflow.");
        } finally {
          W.value = !1;
        }
      }
    }
    async function pe(M) {
      const A = Array.from(w.value?.querySelectorAll("button[aria-label]") ?? []).find((q) => q.getAttribute("aria-label") === `Actions for ${M.title}`) ?? null;
      z(A), k.value = M, await Ve(), x.value && await Gd(x.value, M.id, M.title, me);
    }
    function me() {
      k.value = null, T();
    }
    kd(L);
    const { acceptDeletion: P } = Hg(r, (M) => M.id);
    return (M, A) => (S(), R("div", {
      ref_key: "rootEl",
      ref: w,
      class: "wf-list kx"
    }, [
      V(gy, {
        "total-count": E.value,
        "label-vocab": B.value,
        q: l.value,
        "onUpdate:q": A[0] || (A[0] = (q) => l.value = q),
        "label-filter": h.value,
        "onUpdate:labelFilter": A[1] || (A[1] = (q) => h.value = q),
        "group-by": p.value,
        "onUpdate:groupBy": A[2] || (A[2] = (q) => p.value = q),
        onImport: ee,
        onCreate: J
      }, null, 8, ["total-count", "label-vocab", "q", "label-filter", "group-by"]),
      s.value ? (S(), ae(f(He), {
        key: 0,
        class: "wf-banner",
        severity: "error",
        onClose: A[3] || (A[3] = (q) => s.value = "")
      }, {
        default: ne(() => [
          ce(j(s.value), 1)
        ]),
        _: 1
      })) : Z("", !0),
      v.value ? (S(), ae(f(He), {
        key: 1,
        class: "wf-banner",
        severity: "error",
        onClose: A[4] || (A[4] = (q) => v.value = "")
      }, {
        default: ne(() => [
          ce(j(v.value), 1)
        ]),
        _: 1
      })) : Z("", !0),
      V(f(Jt), {
        visible: g.value,
        modal: !0,
        "dismissable-mask": !0,
        class: "kx-modal",
        pt: G,
        "aria-label": "New Workflow",
        "onUpdate:visible": A[7] || (A[7] = (q) => {
          q || X();
        })
      }, {
        header: ne(() => [
          $("span", Ky, [
            V(f(ie), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          A[13] || (A[13] = $("div", {
            class: "kx-modal-head-text",
            style: { flex: "1" }
          }, [
            $("div", { class: "kx-modal-head-title" }, "New Workflow"),
            $("div", { class: "kx-modal-head-sub" }, "Start with inputs and a result. Add an Error exit only when you need one.")
          ], -1))
        ]),
        footer: ne(() => [
          V(f(fe), {
            severity: "secondary",
            text: "",
            onClick: X
          }, {
            default: ne(() => [...A[17] || (A[17] = [
              ce("Cancel", -1)
            ])]),
            _: 1
          }),
          V(f(fe), {
            disabled: !F.value,
            loading: d.value,
            onClick: oe
          }, {
            default: ne(() => [
              d.value ? Z("", !0) : (S(), ae(f(ie), {
                key: 0,
                icon: "tabler:check",
                "aria-hidden": "true"
              })),
              A[18] || (A[18] = $("span", null, "Create", -1))
            ]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        default: ne(() => [
          $("div", Zy, [
            $("div", Jy, [
              A[14] || (A[14] = $("label", { class: "kx-field-lbl" }, "Name", -1)),
              V(f(rt), {
                modelValue: c.value,
                "onUpdate:modelValue": A[5] || (A[5] = (q) => c.value = q),
                class: "kx-input",
                type: "text",
                placeholder: "Name your Workflow",
                "aria-label": "Workflow name",
                autofocus: "",
                onKeydown: tt(oe, ["enter"])
              }, null, 8, ["modelValue"])
            ]),
            $("div", Qy, [
              A[15] || (A[15] = $("label", { class: "kx-field-lbl" }, [
                ce("Label "),
                $("span", { class: "kx-field-opt" }, "optional")
              ], -1)),
              V(f(rt), {
                modelValue: u.value,
                "onUpdate:modelValue": A[6] || (A[6] = (q) => u.value = q),
                class: "kx-input",
                type: "text",
                placeholder: "e.g. sales",
                "aria-label": "Workflow label",
                onKeydown: tt(oe, ["enter"])
              }, null, 8, ["modelValue"])
            ]),
            o.value ? (S(), R("p", ew, [
              V(f(ie), {
                icon: "tabler:folder",
                "aria-hidden": "true"
              }),
              A[16] || (A[16] = $("span", null, "Placed in the selected folder.", -1))
            ])) : Z("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      V(jy, {
        open: m.value,
        onClose: te,
        onOpen: A[8] || (A[8] = (q) => n("open", q))
      }, null, 8, ["open"]),
      V(f(Jt), {
        visible: !!se.value,
        modal: !0,
        "dismissable-mask": !0,
        class: "kx-modal wf-del-modal",
        pt: G,
        "aria-label": "Delete Workflow",
        "onUpdate:visible": A[9] || (A[9] = (q) => {
          q || le();
        }),
        onAfterHide: we
      }, {
        header: ne(() => [
          $("span", tw, [
            V(f(ie), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            })
          ]),
          A[19] || (A[19] = $("div", {
            class: "kx-modal-head-text",
            style: { flex: "1" }
          }, [
            $("div", { class: "kx-modal-head-title" }, "Delete Workflow"),
            $("div", { class: "kx-modal-head-sub" }, "This removes the Workflow and its history. It can’t be undone.")
          ], -1))
        ]),
        footer: ne(() => [
          V(f(fe), {
            severity: "secondary",
            text: "",
            onClick: le
          }, {
            default: ne(() => [...A[22] || (A[22] = [
              ce("Cancel", -1)
            ])]),
            _: 1
          }),
          V(f(fe), {
            severity: "danger",
            disabled: W.value,
            loading: W.value,
            onClick: $e
          }, {
            default: ne(() => [
              W.value ? Z("", !0) : (S(), ae(f(ie), {
                key: 0,
                icon: "tabler:trash",
                "aria-hidden": "true"
              })),
              A[23] || (A[23] = $("span", null, "Delete", -1))
            ]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        default: ne(() => [
          $("div", nw, [
            $("p", ow, [
              A[20] || (A[20] = ce("Delete ", -1)),
              $("strong", null, j(se.value?.title), 1),
              A[21] || (A[21] = ce("?", -1))
            ])
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      $("main", iw, [
        a.value && !r.value.length ? (S(), R("div", rw, [
          V(f(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading Workflows"
          }),
          A[24] || (A[24] = $("span", null, "Loading Workflows…", -1))
        ])) : !N.value.length && !l.value && h.value === null ? (S(), R("div", aw, [
          $("div", sw, [
            V(f(ie), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          A[26] || (A[26] = $("p", { class: "kx-empty-title" }, "No Workflows yet", -1)),
          A[27] || (A[27] = $("p", { class: "kx-empty-sub" }, "Create a Workflow from typed Blocks, then publish it when it’s ready.", -1)),
          V(f(fe), { onClick: J }, {
            default: ne(() => [
              V(f(ie), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              }),
              A[25] || (A[25] = $("span", null, "New Workflow", -1))
            ]),
            _: 1
          })
        ])) : N.value.length ? (S(), ae(qy, {
          key: 3,
          items: y.value,
          onOpen: A[10] || (A[10] = (q) => n("open", q)),
          onLabelsSaved: _,
          onLabelError: A[11] || (A[11] = (q) => v.value = q),
          onExportError: A[12] || (A[12] = (q) => s.value = q),
          onShare: pe,
          onAskDelete: re
        }, null, 8, ["items"])) : (S(), R("div", lw, [
          $("div", uw, [
            V(f(ie), {
              icon: "tabler:search",
              "aria-hidden": "true"
            })
          ]),
          $("p", cw, j(h.value !== null ? "No Workflows with this label" : "No matches"), 1),
          $("p", dw, j(h.value !== null ? "No Workflows carry this label yet — add it to a Workflow from its row." : `Nothing matches "${l.value}".`), 1)
        ]))
      ]),
      k.value ? (S(), R("div", {
        key: 2,
        ref_key: "shareHost",
        ref: x
      }, null, 512)) : Z("", !0)
    ], 512));
  }
});
function lo(e) {
  return pd() ? (ii(e), !0) : !1;
}
function Dt(e) {
  return typeof e == "function" ? e() : f(e);
}
const hw = typeof window < "u" && typeof document < "u", pw = (e) => typeof e < "u", vw = Object.prototype.toString, mw = (e) => vw.call(e) === "[object Object]", gw = () => {
};
function yw(e, t) {
  function n(...i) {
    return new Promise((o, r) => {
      Promise.resolve(e(() => t.apply(this, i), { fn: t, thisArg: this, args: i })).then(o).catch(r);
    });
  }
  return n;
}
const jd = (e) => e();
function ww(e = jd) {
  const t = Y(!0);
  function n() {
    t.value = !1;
  }
  function i() {
    t.value = !0;
  }
  const o = (...r) => {
    t.value && e(...r);
  };
  return { isActive: Um(t), pause: n, resume: i, eventFilter: o };
}
function Ul(e, t = !1, n = "Timeout") {
  return new Promise((i, o) => {
    setTimeout(t ? () => o(n) : i, e);
  });
}
function bw(e, t, n = {}) {
  const {
    eventFilter: i = jd,
    ...o
  } = n;
  return _e(
    e,
    yw(
      i,
      t
    ),
    o
  );
}
function _n(e, t, n = {}) {
  const {
    eventFilter: i,
    ...o
  } = n, { eventFilter: r, pause: a, resume: s, isActive: l } = ww(i);
  return { stop: bw(
    e,
    t,
    {
      ...o,
      eventFilter: r
    }
  ), pause: a, resume: s, isActive: l };
}
function _w(e, t = {}) {
  if (!Ss(e))
    return Hm(e);
  const n = Array.isArray(e.value) ? Array.from({ length: e.value.length }) : {};
  for (const i in e.value)
    n[i] = qm(() => ({
      get() {
        return e.value[i];
      },
      set(o) {
        var r;
        if ((r = Dt(t.replaceRef)) != null ? r : !0)
          if (Array.isArray(e.value)) {
            const s = [...e.value];
            s[i] = o, e.value = s;
          } else {
            const s = { ...e.value, [i]: o };
            Object.setPrototypeOf(s, Object.getPrototypeOf(e.value)), e.value = s;
          }
        else
          e.value[i] = o;
      }
    }));
  return n;
}
function qa(e, t = !1) {
  function n(d, { flush: h = "sync", deep: p = !1, timeout: v, throwOnTimeout: g } = {}) {
    let m = null;
    const x = [new Promise((w) => {
      m = _e(
        e,
        (b) => {
          d(b) !== t && (m?.(), w(b));
        },
        {
          flush: h,
          deep: p,
          immediate: !0
        }
      );
    })];
    return v != null && x.push(
      Ul(v, g).then(() => Dt(e)).finally(() => m?.())
    ), Promise.race(x);
  }
  function i(d, h) {
    if (!Ss(d))
      return n((b) => b === d, h);
    const { flush: p = "sync", deep: v = !1, timeout: g, throwOnTimeout: m } = h ?? {};
    let k = null;
    const w = [new Promise((b) => {
      k = _e(
        [e, d],
        ([C, I]) => {
          t !== (C === I) && (k?.(), b(C));
        },
        {
          flush: p,
          deep: v,
          immediate: !0
        }
      );
    })];
    return g != null && w.push(
      Ul(g, m).then(() => Dt(e)).finally(() => (k?.(), Dt(e)))
    ), Promise.race(w);
  }
  function o(d) {
    return n((h) => !!h, d);
  }
  function r(d) {
    return i(null, d);
  }
  function a(d) {
    return i(void 0, d);
  }
  function s(d) {
    return n(Number.isNaN, d);
  }
  function l(d, h) {
    return n((p) => {
      const v = Array.from(p);
      return v.includes(d) || v.includes(Dt(d));
    }, h);
  }
  function c(d) {
    return u(1, d);
  }
  function u(d = 1, h) {
    let p = -1;
    return n(() => (p += 1, p >= d), h);
  }
  return Array.isArray(Dt(e)) ? {
    toMatch: n,
    toContains: l,
    changed: c,
    changedTimes: u,
    get not() {
      return qa(e, !t);
    }
  } : {
    toMatch: n,
    toBe: i,
    toBeTruthy: o,
    toBeNull: r,
    toBeNaN: s,
    toBeUndefined: a,
    changed: c,
    changedTimes: u,
    get not() {
      return qa(e, !t);
    }
  };
}
function Ua(e) {
  return qa(e);
}
function kw(e) {
  var t;
  const n = Dt(e);
  return (t = n?.$el) != null ? t : n;
}
const Xd = hw ? window : void 0;
function Kd(...e) {
  let t, n, i, o;
  if (typeof e[0] == "string" || Array.isArray(e[0]) ? ([n, i, o] = e, t = Xd) : [t, n, i, o] = e, !t)
    return gw;
  Array.isArray(n) || (n = [n]), Array.isArray(i) || (i = [i]);
  const r = [], a = () => {
    r.forEach((u) => u()), r.length = 0;
  }, s = (u, d, h, p) => (u.addEventListener(d, h, p), () => u.removeEventListener(d, h, p)), l = _e(
    () => [kw(t), Dt(o)],
    ([u, d]) => {
      if (a(), !u)
        return;
      const h = mw(d) ? { ...d } : d;
      r.push(
        ...n.flatMap((p) => i.map((v) => s(u, p, v, h)))
      );
    },
    { immediate: !0, flush: "post" }
  ), c = () => {
    l(), a();
  };
  return lo(c), c;
}
function Ew(e) {
  return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function Wl(...e) {
  let t, n, i = {};
  e.length === 3 ? (t = e[0], n = e[1], i = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], i = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
  const {
    target: o = Xd,
    eventName: r = "keydown",
    passive: a = !1,
    dedupe: s = !1
  } = i, l = Ew(t);
  return Kd(o, r, (u) => {
    u.repeat && Dt(s) || l(u) && n(u);
  }, a);
}
function xw(e) {
  return JSON.parse(JSON.stringify(e));
}
function Nr(e, t, n, i = {}) {
  var o, r, a;
  const {
    clone: s = !1,
    passive: l = !1,
    eventName: c,
    deep: u = !1,
    defaultValue: d,
    shouldEmit: h
  } = i, p = Vn(), v = n || p?.emit || ((o = p?.$emit) == null ? void 0 : o.bind(p)) || ((a = (r = p?.proxy) == null ? void 0 : r.$emit) == null ? void 0 : a.bind(p?.proxy));
  let g = c;
  t || (t = "modelValue"), g = g || `update:${t.toString()}`;
  const m = (w) => s ? typeof s == "function" ? s(w) : xw(w) : w, k = () => pw(e[t]) ? m(e[t]) : d, x = (w) => {
    h ? h(w) && v(g, w) : v(g, w);
  };
  if (l) {
    const w = k(), b = Y(w);
    let C = !1;
    return _e(
      () => e[t],
      (I) => {
        C || (C = !0, b.value = m(I), Ve(() => C = !1));
      }
    ), _e(
      b,
      (I) => {
        !C && (I !== e[t] || u) && x(I);
      },
      { deep: u }
    ), b;
  } else
    return U({
      get() {
        return k();
      },
      set(w) {
        x(w);
      }
    });
}
var $w = { value: () => {
} };
function er() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i))
      throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new ai(n);
}
function ai(e) {
  this._ = e;
}
function Sw(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", o = n.indexOf(".");
    if (o >= 0 && (i = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n))
      throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
ai.prototype = er.prototype = {
  constructor: ai,
  on: function(e, t) {
    var n = this._, i = Sw(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; )
        if ((o = (e = i[r]).type) && (o = Cw(n[o], e.name)))
          return o;
      return;
    }
    if (t != null && typeof t != "function")
      throw new Error("invalid callback: " + t);
    for (; ++r < a; )
      if (o = (e = i[r]).type)
        n[o] = Yl(n[o], e.name, t);
      else if (t == null)
        for (o in n)
          n[o] = Yl(n[o], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t)
      e[n] = t[n].slice();
    return new ai(e);
  },
  call: function(e, t) {
    if ((o = arguments.length - 2) > 0)
      for (var n = new Array(o), i = 0, o, r; i < o; ++i)
        n[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(e))
      throw new Error("unknown type: " + e);
    for (r = this._[e], i = 0, o = r.length; i < o; ++i)
      r[i].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e))
      throw new Error("unknown type: " + e);
    for (var i = this._[e], o = 0, r = i.length; o < r; ++o)
      i[o].value.apply(t, n);
  }
};
function Cw(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function Yl(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = $w, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var Wa = "http://www.w3.org/1999/xhtml";
const Gl = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Wa,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function tr(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Gl.hasOwnProperty(t) ? { space: Gl[t], local: e } : e;
}
function Nw(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === Wa && t.documentElement.namespaceURI === Wa ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function Iw(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function Zd(e) {
  var t = tr(e);
  return (t.local ? Iw : Nw)(t);
}
function Aw() {
}
function Vs(e) {
  return e == null ? Aw : function() {
    return this.querySelector(e);
  };
}
function Mw(e) {
  typeof e != "function" && (e = Vs(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = new Array(a), l, c, u = 0; u < a; ++u)
      (l = r[u]) && (c = e.call(l, l.__data__, u, r)) && ("__data__" in l && (c.__data__ = l.__data__), s[u] = c);
  return new st(i, this._parents);
}
function Tw(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function Ow() {
  return [];
}
function Jd(e) {
  return e == null ? Ow : function() {
    return this.querySelectorAll(e);
  };
}
function Rw(e) {
  return function() {
    return Tw(e.apply(this, arguments));
  };
}
function Dw(e) {
  typeof e == "function" ? e = Rw(e) : e = Jd(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), o.push(l));
  return new st(i, o);
}
function Qd(e) {
  return function() {
    return this.matches(e);
  };
}
function ef(e) {
  return function(t) {
    return t.matches(e);
  };
}
var Pw = Array.prototype.find;
function Lw(e) {
  return function() {
    return Pw.call(this.children, e);
  };
}
function Vw() {
  return this.firstElementChild;
}
function Bw(e) {
  return this.select(e == null ? Vw : Lw(typeof e == "function" ? e : ef(e)));
}
var zw = Array.prototype.filter;
function Fw() {
  return Array.from(this.children);
}
function Hw(e) {
  return function() {
    return zw.call(this.children, e);
  };
}
function qw(e) {
  return this.selectAll(e == null ? Fw : Hw(typeof e == "function" ? e : ef(e)));
}
function Uw(e) {
  typeof e != "function" && (e = Qd(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new st(i, this._parents);
}
function tf(e) {
  return new Array(e.length);
}
function Ww() {
  return new st(this._enter || this._groups.map(tf), this._parents);
}
function xi(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
xi.prototype = {
  constructor: xi,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function Yw(e) {
  return function() {
    return e;
  };
}
function Gw(e, t, n, i, o, r) {
  for (var a = 0, s, l = t.length, c = r.length; a < c; ++a)
    (s = t[a]) ? (s.__data__ = r[a], i[a] = s) : n[a] = new xi(e, r[a]);
  for (; a < l; ++a)
    (s = t[a]) && (o[a] = s);
}
function jw(e, t, n, i, o, r, a) {
  var s, l, c = /* @__PURE__ */ new Map(), u = t.length, d = r.length, h = new Array(u), p;
  for (s = 0; s < u; ++s)
    (l = t[s]) && (h[s] = p = a.call(l, l.__data__, s, t) + "", c.has(p) ? o[s] = l : c.set(p, l));
  for (s = 0; s < d; ++s)
    p = a.call(e, r[s], s, r) + "", (l = c.get(p)) ? (i[s] = l, l.__data__ = r[s], c.delete(p)) : n[s] = new xi(e, r[s]);
  for (s = 0; s < u; ++s)
    (l = t[s]) && c.get(h[s]) === l && (o[s] = l);
}
function Xw(e) {
  return e.__data__;
}
function Kw(e, t) {
  if (!arguments.length)
    return Array.from(this, Xw);
  var n = t ? jw : Gw, i = this._parents, o = this._groups;
  typeof e != "function" && (e = Yw(e));
  for (var r = o.length, a = new Array(r), s = new Array(r), l = new Array(r), c = 0; c < r; ++c) {
    var u = i[c], d = o[c], h = d.length, p = Zw(e.call(u, u && u.__data__, c, i)), v = p.length, g = s[c] = new Array(v), m = a[c] = new Array(v), k = l[c] = new Array(h);
    n(u, d, g, m, k, p, t);
    for (var x = 0, w = 0, b, C; x < v; ++x)
      if (b = g[x]) {
        for (x >= w && (w = x + 1); !(C = m[w]) && ++w < v; )
          ;
        b._next = C || null;
      }
  }
  return a = new st(a, i), a._enter = s, a._exit = l, a;
}
function Zw(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Jw() {
  return new st(this._exit || this._groups.map(tf), this._parents);
}
function Qw(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function eb(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), s = new Array(o), l = 0; l < a; ++l)
    for (var c = n[l], u = i[l], d = c.length, h = s[l] = new Array(d), p, v = 0; v < d; ++v)
      (p = c[v] || u[v]) && (h[v] = p);
  for (; l < o; ++l)
    s[l] = n[l];
  return new st(s, this._parents);
}
function tb() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function nb(e) {
  e || (e = ob);
  function t(d, h) {
    return d && h ? e(d.__data__, h.__data__) : !d - !h;
  }
  for (var n = this._groups, i = n.length, o = new Array(i), r = 0; r < i; ++r) {
    for (var a = n[r], s = a.length, l = o[r] = new Array(s), c, u = 0; u < s; ++u)
      (c = a[u]) && (l[u] = c);
    l.sort(t);
  }
  return new st(o, this._parents).order();
}
function ob(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function ib() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function rb() {
  return Array.from(this);
}
function ab() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a)
        return a;
    }
  return null;
}
function sb() {
  let e = 0;
  for (const t of this)
    ++e;
  return e;
}
function lb() {
  return !this.node();
}
function ub(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, s; r < a; ++r)
      (s = o[r]) && e.call(s, s.__data__, r, o);
  return this;
}
function cb(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function db(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function fb(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function hb(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function pb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function vb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function mb(e, t) {
  var n = tr(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? db : cb : typeof t == "function" ? n.local ? vb : pb : n.local ? hb : fb)(n, t));
}
function nf(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function gb(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function yb(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function wb(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function bb(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? gb : typeof t == "function" ? wb : yb)(e, t, n ?? "")) : Mn(this.node(), e);
}
function Mn(e, t) {
  return e.style.getPropertyValue(t) || nf(e).getComputedStyle(e, null).getPropertyValue(t);
}
function _b(e) {
  return function() {
    delete this[e];
  };
}
function kb(e, t) {
  return function() {
    this[e] = t;
  };
}
function Eb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function xb(e, t) {
  return arguments.length > 1 ? this.each((t == null ? _b : typeof t == "function" ? Eb : kb)(e, t)) : this.node()[e];
}
function of(e) {
  return e.trim().split(/^|\s+/);
}
function Bs(e) {
  return e.classList || new rf(e);
}
function rf(e) {
  this._node = e, this._names = of(e.getAttribute("class") || "");
}
rf.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function af(e, t) {
  for (var n = Bs(e), i = -1, o = t.length; ++i < o; )
    n.add(t[i]);
}
function sf(e, t) {
  for (var n = Bs(e), i = -1, o = t.length; ++i < o; )
    n.remove(t[i]);
}
function $b(e) {
  return function() {
    af(this, e);
  };
}
function Sb(e) {
  return function() {
    sf(this, e);
  };
}
function Cb(e, t) {
  return function() {
    (t.apply(this, arguments) ? af : sf)(this, e);
  };
}
function Nb(e, t) {
  var n = of(e + "");
  if (arguments.length < 2) {
    for (var i = Bs(this.node()), o = -1, r = n.length; ++o < r; )
      if (!i.contains(n[o]))
        return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? Cb : t ? $b : Sb)(n, t));
}
function Ib() {
  this.textContent = "";
}
function Ab(e) {
  return function() {
    this.textContent = e;
  };
}
function Mb(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function Tb(e) {
  return arguments.length ? this.each(e == null ? Ib : (typeof e == "function" ? Mb : Ab)(e)) : this.node().textContent;
}
function Ob() {
  this.innerHTML = "";
}
function Rb(e) {
  return function() {
    this.innerHTML = e;
  };
}
function Db(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function Pb(e) {
  return arguments.length ? this.each(e == null ? Ob : (typeof e == "function" ? Db : Rb)(e)) : this.node().innerHTML;
}
function Lb() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Vb() {
  return this.each(Lb);
}
function Bb() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function zb() {
  return this.each(Bb);
}
function Fb(e) {
  var t = typeof e == "function" ? e : Zd(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function Hb() {
  return null;
}
function qb(e, t) {
  var n = typeof e == "function" ? e : Zd(e), i = t == null ? Hb : typeof t == "function" ? t : Vs(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function Ub() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function Wb() {
  return this.each(Ub);
}
function Yb() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Gb() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function jb(e) {
  return this.select(e ? Gb : Yb);
}
function Xb(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function Kb(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function Zb(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function Jb(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function Qb(e, t, n) {
  return function() {
    var i = this.__on, o, r = Kb(t);
    if (i) {
      for (var a = 0, s = i.length; a < s; ++a)
        if ((o = i[a]).type === e.type && o.name === e.name) {
          this.removeEventListener(o.type, o.listener, o.options), this.addEventListener(o.type, o.listener = r, o.options = n), o.value = t;
          return;
        }
    }
    this.addEventListener(e.type, r, n), o = { type: e.type, name: e.name, value: t, listener: r, options: n }, i ? i.push(o) : this.__on = [o];
  };
}
function e1(e, t, n) {
  var i = Zb(e + ""), o, r = i.length, a;
  if (arguments.length < 2) {
    var s = this.node().__on;
    if (s) {
      for (var l = 0, c = s.length, u; l < c; ++l)
        for (o = 0, u = s[l]; o < r; ++o)
          if ((a = i[o]).type === u.type && a.name === u.name)
            return u.value;
    }
    return;
  }
  for (s = t ? Qb : Jb, o = 0; o < r; ++o)
    this.each(s(i[o], t, n));
  return this;
}
function lf(e, t, n) {
  var i = nf(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function t1(e, t) {
  return function() {
    return lf(this, e, t);
  };
}
function n1(e, t) {
  return function() {
    return lf(this, e, t.apply(this, arguments));
  };
}
function o1(e, t) {
  return this.each((typeof t == "function" ? n1 : t1)(e, t));
}
function* i1() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var uf = [null];
function st(e, t) {
  this._groups = e, this._parents = t;
}
function So() {
  return new st([[document.documentElement]], uf);
}
function r1() {
  return this;
}
st.prototype = So.prototype = {
  constructor: st,
  select: Mw,
  selectAll: Dw,
  selectChild: Bw,
  selectChildren: qw,
  filter: Uw,
  data: Kw,
  enter: Ww,
  exit: Jw,
  join: Qw,
  merge: eb,
  selection: r1,
  order: tb,
  sort: nb,
  call: ib,
  nodes: rb,
  node: ab,
  size: sb,
  empty: lb,
  each: ub,
  attr: mb,
  style: bb,
  property: xb,
  classed: Nb,
  text: Tb,
  html: Pb,
  raise: Vb,
  lower: zb,
  append: Fb,
  insert: qb,
  remove: Wb,
  clone: jb,
  datum: Xb,
  on: e1,
  dispatch: o1,
  [Symbol.iterator]: i1
};
function pt(e) {
  return typeof e == "string" ? new st([[document.querySelector(e)]], [document.documentElement]) : new st([[e]], uf);
}
function a1(e) {
  let t;
  for (; t = e.sourceEvent; )
    e = t;
  return e;
}
function kt(e, t) {
  if (e = a1(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var i = n.createSVGPoint();
      return i.x = e.clientX, i.y = e.clientY, i = i.matrixTransform(t.getScreenCTM().inverse()), [i.x, i.y];
    }
    if (t.getBoundingClientRect) {
      var o = t.getBoundingClientRect();
      return [e.clientX - o.left - t.clientLeft, e.clientY - o.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
const s1 = { passive: !1 }, uo = { capture: !0, passive: !1 };
function Ir(e) {
  e.stopImmediatePropagation();
}
function $n(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function cf(e) {
  var t = e.document.documentElement, n = pt(e).on("dragstart.drag", $n, uo);
  "onselectstart" in t ? n.on("selectstart.drag", $n, uo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function df(e, t) {
  var n = e.document.documentElement, i = pt(e).on("dragstart.drag", null);
  t && (i.on("click.drag", $n, uo), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const zo = (e) => () => e;
function Ya(e, {
  sourceEvent: t,
  subject: n,
  target: i,
  identifier: o,
  active: r,
  x: a,
  y: s,
  dx: l,
  dy: c,
  dispatch: u
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    subject: { value: n, enumerable: !0, configurable: !0 },
    target: { value: i, enumerable: !0, configurable: !0 },
    identifier: { value: o, enumerable: !0, configurable: !0 },
    active: { value: r, enumerable: !0, configurable: !0 },
    x: { value: a, enumerable: !0, configurable: !0 },
    y: { value: s, enumerable: !0, configurable: !0 },
    dx: { value: l, enumerable: !0, configurable: !0 },
    dy: { value: c, enumerable: !0, configurable: !0 },
    _: { value: u }
  });
}
Ya.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function l1(e) {
  return !e.ctrlKey && !e.button;
}
function u1() {
  return this.parentNode;
}
function c1(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function d1() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function f1() {
  var e = l1, t = u1, n = c1, i = d1, o = {}, r = er("start", "drag", "end"), a = 0, s, l, c, u, d = 0;
  function h(b) {
    b.on("mousedown.drag", p).filter(i).on("touchstart.drag", m).on("touchmove.drag", k, s1).on("touchend.drag touchcancel.drag", x).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function p(b, C) {
    if (!(u || !e.call(this, b, C))) {
      var I = w(this, t.call(this, b, C), b, C, "mouse");
      I && (pt(b.view).on("mousemove.drag", v, uo).on("mouseup.drag", g, uo), cf(b.view), Ir(b), c = !1, s = b.clientX, l = b.clientY, I("start", b));
    }
  }
  function v(b) {
    if ($n(b), !c) {
      var C = b.clientX - s, I = b.clientY - l;
      c = C * C + I * I > d;
    }
    o.mouse("drag", b);
  }
  function g(b) {
    pt(b.view).on("mousemove.drag mouseup.drag", null), df(b.view, c), $n(b), o.mouse("end", b);
  }
  function m(b, C) {
    if (e.call(this, b, C)) {
      var I = b.changedTouches, z = t.call(this, b, C), T = I.length, O, D;
      for (O = 0; O < T; ++O)
        (D = w(this, z, b, C, I[O].identifier, I[O])) && (Ir(b), D("start", b, I[O]));
    }
  }
  function k(b) {
    var C = b.changedTouches, I = C.length, z, T;
    for (z = 0; z < I; ++z)
      (T = o[C[z].identifier]) && ($n(b), T("drag", b, C[z]));
  }
  function x(b) {
    var C = b.changedTouches, I = C.length, z, T;
    for (u && clearTimeout(u), u = setTimeout(function() {
      u = null;
    }, 500), z = 0; z < I; ++z)
      (T = o[C[z].identifier]) && (Ir(b), T("end", b, C[z]));
  }
  function w(b, C, I, z, T, O) {
    var D = r.copy(), B = kt(O || I, C), N, H, y;
    if ((y = n.call(b, new Ya("beforestart", {
      sourceEvent: I,
      target: h,
      identifier: T,
      active: a,
      x: B[0],
      y: B[1],
      dx: 0,
      dy: 0,
      dispatch: D
    }), z)) != null)
      return N = y.x - B[0] || 0, H = y.y - B[1] || 0, function E(_, L, F) {
        var J = B, X;
        switch (_) {
          case "start":
            o[T] = E, X = a++;
            break;
          case "end":
            delete o[T], --a;
          case "drag":
            B = kt(F || L, C), X = a;
            break;
        }
        D.call(
          _,
          b,
          new Ya(_, {
            sourceEvent: L,
            subject: y,
            target: h,
            identifier: T,
            active: X,
            x: B[0] + N,
            y: B[1] + H,
            dx: B[0] - J[0],
            dy: B[1] - J[1],
            dispatch: D
          }),
          z
        );
      };
  }
  return h.filter = function(b) {
    return arguments.length ? (e = typeof b == "function" ? b : zo(!!b), h) : e;
  }, h.container = function(b) {
    return arguments.length ? (t = typeof b == "function" ? b : zo(b), h) : t;
  }, h.subject = function(b) {
    return arguments.length ? (n = typeof b == "function" ? b : zo(b), h) : n;
  }, h.touchable = function(b) {
    return arguments.length ? (i = typeof b == "function" ? b : zo(!!b), h) : i;
  }, h.on = function() {
    var b = r.on.apply(r, arguments);
    return b === r ? h : b;
  }, h.clickDistance = function(b) {
    return arguments.length ? (d = (b = +b) * b, h) : Math.sqrt(d);
  }, h;
}
function zs(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function ff(e, t) {
  var n = Object.create(e.prototype);
  for (var i in t)
    n[i] = t[i];
  return n;
}
function Co() {
}
var co = 0.7, $i = 1 / co, Sn = "\\s*([+-]?\\d+)\\s*", fo = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", It = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", h1 = /^#([0-9a-f]{3,8})$/, p1 = new RegExp(`^rgb\\(${Sn},${Sn},${Sn}\\)$`), v1 = new RegExp(`^rgb\\(${It},${It},${It}\\)$`), m1 = new RegExp(`^rgba\\(${Sn},${Sn},${Sn},${fo}\\)$`), g1 = new RegExp(`^rgba\\(${It},${It},${It},${fo}\\)$`), y1 = new RegExp(`^hsl\\(${fo},${It},${It}\\)$`), w1 = new RegExp(`^hsla\\(${fo},${It},${It},${fo}\\)$`), jl = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
zs(Co, dn, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: Xl,
  // Deprecated! Use color.formatHex.
  formatHex: Xl,
  formatHex8: b1,
  formatHsl: _1,
  formatRgb: Kl,
  toString: Kl
});
function Xl() {
  return this.rgb().formatHex();
}
function b1() {
  return this.rgb().formatHex8();
}
function _1() {
  return hf(this).formatHsl();
}
function Kl() {
  return this.rgb().formatRgb();
}
function dn(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = h1.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? Zl(t) : n === 3 ? new ot(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Fo(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Fo(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = p1.exec(e)) ? new ot(t[1], t[2], t[3], 1) : (t = v1.exec(e)) ? new ot(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = m1.exec(e)) ? Fo(t[1], t[2], t[3], t[4]) : (t = g1.exec(e)) ? Fo(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = y1.exec(e)) ? eu(t[1], t[2] / 100, t[3] / 100, 1) : (t = w1.exec(e)) ? eu(t[1], t[2] / 100, t[3] / 100, t[4]) : jl.hasOwnProperty(e) ? Zl(jl[e]) : e === "transparent" ? new ot(NaN, NaN, NaN, 0) : null;
}
function Zl(e) {
  return new ot(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Fo(e, t, n, i) {
  return i <= 0 && (e = t = n = NaN), new ot(e, t, n, i);
}
function k1(e) {
  return e instanceof Co || (e = dn(e)), e ? (e = e.rgb(), new ot(e.r, e.g, e.b, e.opacity)) : new ot();
}
function Ga(e, t, n, i) {
  return arguments.length === 1 ? k1(e) : new ot(e, t, n, i ?? 1);
}
function ot(e, t, n, i) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +i;
}
zs(ot, Ga, ff(Co, {
  brighter(e) {
    return e = e == null ? $i : Math.pow($i, e), new ot(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? co : Math.pow(co, e), new ot(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new ot(ln(this.r), ln(this.g), ln(this.b), Si(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Jl,
  // Deprecated! Use color.formatHex.
  formatHex: Jl,
  formatHex8: E1,
  formatRgb: Ql,
  toString: Ql
}));
function Jl() {
  return `#${an(this.r)}${an(this.g)}${an(this.b)}`;
}
function E1() {
  return `#${an(this.r)}${an(this.g)}${an(this.b)}${an((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Ql() {
  const e = Si(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${ln(this.r)}, ${ln(this.g)}, ${ln(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function Si(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function ln(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function an(e) {
  return e = ln(e), (e < 16 ? "0" : "") + e.toString(16);
}
function eu(e, t, n, i) {
  return i <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new vt(e, t, n, i);
}
function hf(e) {
  if (e instanceof vt)
    return new vt(e.h, e.s, e.l, e.opacity);
  if (e instanceof Co || (e = dn(e)), !e)
    return new vt();
  if (e instanceof vt)
    return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, i = e.b / 255, o = Math.min(t, n, i), r = Math.max(t, n, i), a = NaN, s = r - o, l = (r + o) / 2;
  return s ? (t === r ? a = (n - i) / s + (n < i) * 6 : n === r ? a = (i - t) / s + 2 : a = (t - n) / s + 4, s /= l < 0.5 ? r + o : 2 - r - o, a *= 60) : s = l > 0 && l < 1 ? 0 : a, new vt(a, s, l, e.opacity);
}
function x1(e, t, n, i) {
  return arguments.length === 1 ? hf(e) : new vt(e, t, n, i ?? 1);
}
function vt(e, t, n, i) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +i;
}
zs(vt, x1, ff(Co, {
  brighter(e) {
    return e = e == null ? $i : Math.pow($i, e), new vt(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? co : Math.pow(co, e), new vt(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, i = n + (n < 0.5 ? n : 1 - n) * t, o = 2 * n - i;
    return new ot(
      Ar(e >= 240 ? e - 240 : e + 120, o, i),
      Ar(e, o, i),
      Ar(e < 120 ? e + 240 : e - 120, o, i),
      this.opacity
    );
  },
  clamp() {
    return new vt(tu(this.h), Ho(this.s), Ho(this.l), Si(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Si(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${tu(this.h)}, ${Ho(this.s) * 100}%, ${Ho(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function tu(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function Ho(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Ar(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const Fs = (e) => () => e;
function $1(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function S1(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(i) {
    return Math.pow(e + i * t, n);
  };
}
function C1(e) {
  return (e = +e) == 1 ? pf : function(t, n) {
    return n - t ? S1(t, n, e) : Fs(isNaN(t) ? n : t);
  };
}
function pf(e, t) {
  var n = t - e;
  return n ? $1(e, n) : Fs(isNaN(e) ? t : e);
}
const Ci = (function e(t) {
  var n = C1(t);
  function i(o, r) {
    var a = n((o = Ga(o)).r, (r = Ga(r)).r), s = n(o.g, r.g), l = n(o.b, r.b), c = pf(o.opacity, r.opacity);
    return function(u) {
      return o.r = a(u), o.g = s(u), o.b = l(u), o.opacity = c(u), o + "";
    };
  }
  return i.gamma = e, i;
})(1);
function N1(e, t) {
  t || (t = []);
  var n = e ? Math.min(t.length, e.length) : 0, i = t.slice(), o;
  return function(r) {
    for (o = 0; o < n; ++o)
      i[o] = e[o] * (1 - r) + t[o] * r;
    return i;
  };
}
function I1(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function A1(e, t) {
  var n = t ? t.length : 0, i = e ? Math.min(n, e.length) : 0, o = new Array(i), r = new Array(n), a;
  for (a = 0; a < i; ++a)
    o[a] = eo(e[a], t[a]);
  for (; a < n; ++a)
    r[a] = t[a];
  return function(s) {
    for (a = 0; a < i; ++a)
      r[a] = o[a](s);
    return r;
  };
}
function M1(e, t) {
  var n = /* @__PURE__ */ new Date();
  return e = +e, t = +t, function(i) {
    return n.setTime(e * (1 - i) + t * i), n;
  };
}
function Et(e, t) {
  return e = +e, t = +t, function(n) {
    return e * (1 - n) + t * n;
  };
}
function T1(e, t) {
  var n = {}, i = {}, o;
  (e === null || typeof e != "object") && (e = {}), (t === null || typeof t != "object") && (t = {});
  for (o in t)
    o in e ? n[o] = eo(e[o], t[o]) : i[o] = t[o];
  return function(r) {
    for (o in n)
      i[o] = n[o](r);
    return i;
  };
}
var ja = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Mr = new RegExp(ja.source, "g");
function O1(e) {
  return function() {
    return e;
  };
}
function R1(e) {
  return function(t) {
    return e(t) + "";
  };
}
function vf(e, t) {
  var n = ja.lastIndex = Mr.lastIndex = 0, i, o, r, a = -1, s = [], l = [];
  for (e = e + "", t = t + ""; (i = ja.exec(e)) && (o = Mr.exec(t)); )
    (r = o.index) > n && (r = t.slice(n, r), s[a] ? s[a] += r : s[++a] = r), (i = i[0]) === (o = o[0]) ? s[a] ? s[a] += o : s[++a] = o : (s[++a] = null, l.push({ i: a, x: Et(i, o) })), n = Mr.lastIndex;
  return n < t.length && (r = t.slice(n), s[a] ? s[a] += r : s[++a] = r), s.length < 2 ? l[0] ? R1(l[0].x) : O1(t) : (t = l.length, function(c) {
    for (var u = 0, d; u < t; ++u)
      s[(d = l[u]).i] = d.x(c);
    return s.join("");
  });
}
function eo(e, t) {
  var n = typeof t, i;
  return t == null || n === "boolean" ? Fs(t) : (n === "number" ? Et : n === "string" ? (i = dn(t)) ? (t = i, Ci) : vf : t instanceof dn ? Ci : t instanceof Date ? M1 : I1(t) ? N1 : Array.isArray(t) ? A1 : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? T1 : Et)(e, t);
}
var nu = 180 / Math.PI, Xa = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function mf(e, t, n, i, o, r) {
  var a, s, l;
  return (a = Math.sqrt(e * e + t * t)) && (e /= a, t /= a), (l = e * n + t * i) && (n -= e * l, i -= t * l), (s = Math.sqrt(n * n + i * i)) && (n /= s, i /= s, l /= s), e * i < t * n && (e = -e, t = -t, l = -l, a = -a), {
    translateX: o,
    translateY: r,
    rotate: Math.atan2(t, e) * nu,
    skewX: Math.atan(l) * nu,
    scaleX: a,
    scaleY: s
  };
}
var qo;
function D1(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? Xa : mf(t.a, t.b, t.c, t.d, t.e, t.f);
}
function P1(e) {
  return e == null || (qo || (qo = document.createElementNS("http://www.w3.org/2000/svg", "g")), qo.setAttribute("transform", e), !(e = qo.transform.baseVal.consolidate())) ? Xa : (e = e.matrix, mf(e.a, e.b, e.c, e.d, e.e, e.f));
}
function gf(e, t, n, i) {
  function o(c) {
    return c.length ? c.pop() + " " : "";
  }
  function r(c, u, d, h, p, v) {
    if (c !== d || u !== h) {
      var g = p.push("translate(", null, t, null, n);
      v.push({ i: g - 4, x: Et(c, d) }, { i: g - 2, x: Et(u, h) });
    } else (d || h) && p.push("translate(" + d + t + h + n);
  }
  function a(c, u, d, h) {
    c !== u ? (c - u > 180 ? u += 360 : u - c > 180 && (c += 360), h.push({ i: d.push(o(d) + "rotate(", null, i) - 2, x: Et(c, u) })) : u && d.push(o(d) + "rotate(" + u + i);
  }
  function s(c, u, d, h) {
    c !== u ? h.push({ i: d.push(o(d) + "skewX(", null, i) - 2, x: Et(c, u) }) : u && d.push(o(d) + "skewX(" + u + i);
  }
  function l(c, u, d, h, p, v) {
    if (c !== d || u !== h) {
      var g = p.push(o(p) + "scale(", null, ",", null, ")");
      v.push({ i: g - 4, x: Et(c, d) }, { i: g - 2, x: Et(u, h) });
    } else (d !== 1 || h !== 1) && p.push(o(p) + "scale(" + d + "," + h + ")");
  }
  return function(c, u) {
    var d = [], h = [];
    return c = e(c), u = e(u), r(c.translateX, c.translateY, u.translateX, u.translateY, d, h), a(c.rotate, u.rotate, d, h), s(c.skewX, u.skewX, d, h), l(c.scaleX, c.scaleY, u.scaleX, u.scaleY, d, h), c = u = null, function(p) {
      for (var v = -1, g = h.length, m; ++v < g; )
        d[(m = h[v]).i] = m.x(p);
      return d.join("");
    };
  };
}
var L1 = gf(D1, "px, ", "px)", "deg)"), V1 = gf(P1, ", ", ")", ")"), B1 = 1e-12;
function ou(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function z1(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function F1(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const si = (function e(t, n, i) {
  function o(r, a) {
    var s = r[0], l = r[1], c = r[2], u = a[0], d = a[1], h = a[2], p = u - s, v = d - l, g = p * p + v * v, m, k;
    if (g < B1)
      k = Math.log(h / c) / t, m = function(z) {
        return [
          s + z * p,
          l + z * v,
          c * Math.exp(t * z * k)
        ];
      };
    else {
      var x = Math.sqrt(g), w = (h * h - c * c + i * g) / (2 * c * n * x), b = (h * h - c * c - i * g) / (2 * h * n * x), C = Math.log(Math.sqrt(w * w + 1) - w), I = Math.log(Math.sqrt(b * b + 1) - b);
      k = (I - C) / t, m = function(z) {
        var T = z * k, O = ou(C), D = c / (n * x) * (O * F1(t * T + C) - z1(C));
        return [
          s + D * p,
          l + D * v,
          c * O / ou(t * T + C)
        ];
      };
    }
    return m.duration = k * 1e3 * t / Math.SQRT2, m;
  }
  return o.rho = function(r) {
    var a = Math.max(1e-3, +r), s = a * a, l = s * s;
    return e(a, s, l);
  }, o;
})(Math.SQRT2, 2, 4);
var Tn = 0, Gn = 0, qn = 0, yf = 1e3, Ni, jn, Ii = 0, fn = 0, nr = 0, ho = typeof performance == "object" && performance.now ? performance : Date, wf = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Hs() {
  return fn || (wf(H1), fn = ho.now() + nr);
}
function H1() {
  fn = 0;
}
function Ai() {
  this._call = this._time = this._next = null;
}
Ai.prototype = bf.prototype = {
  constructor: Ai,
  restart: function(e, t, n) {
    if (typeof e != "function")
      throw new TypeError("callback is not a function");
    n = (n == null ? Hs() : +n) + (t == null ? 0 : +t), !this._next && jn !== this && (jn ? jn._next = this : Ni = this, jn = this), this._call = e, this._time = n, Ka();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Ka());
  }
};
function bf(e, t, n) {
  var i = new Ai();
  return i.restart(e, t, n), i;
}
function q1() {
  Hs(), ++Tn;
  for (var e = Ni, t; e; )
    (t = fn - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Tn;
}
function iu() {
  fn = (Ii = ho.now()) + nr, Tn = Gn = 0;
  try {
    q1();
  } finally {
    Tn = 0, W1(), fn = 0;
  }
}
function U1() {
  var e = ho.now(), t = e - Ii;
  t > yf && (nr -= t, Ii = e);
}
function W1() {
  for (var e, t = Ni, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Ni = n);
  jn = e, Ka(i);
}
function Ka(e) {
  if (!Tn) {
    Gn && (Gn = clearTimeout(Gn));
    var t = e - fn;
    t > 24 ? (e < 1 / 0 && (Gn = setTimeout(iu, e - ho.now() - nr)), qn && (qn = clearInterval(qn))) : (qn || (Ii = ho.now(), qn = setInterval(U1, yf)), Tn = 1, wf(iu));
  }
}
function ru(e, t, n) {
  var i = new Ai();
  return t = t == null ? 0 : +t, i.restart((o) => {
    i.stop(), e(o + t);
  }, t, n), i;
}
var Y1 = er("start", "end", "cancel", "interrupt"), G1 = [], _f = 0, au = 1, Za = 2, li = 3, su = 4, Ja = 5, ui = 6;
function or(e, t, n, i, o, r) {
  var a = e.__transition;
  if (!a)
    e.__transition = {};
  else if (n in a)
    return;
  j1(e, n, {
    name: t,
    index: i,
    // For context during callback.
    group: o,
    // For context during callback.
    on: Y1,
    tween: G1,
    time: r.time,
    delay: r.delay,
    duration: r.duration,
    ease: r.ease,
    timer: null,
    state: _f
  });
}
function qs(e, t) {
  var n = bt(e, t);
  if (n.state > _f)
    throw new Error("too late; already scheduled");
  return n;
}
function Mt(e, t) {
  var n = bt(e, t);
  if (n.state > li)
    throw new Error("too late; already running");
  return n;
}
function bt(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t]))
    throw new Error("transition not found");
  return n;
}
function j1(e, t, n) {
  var i = e.__transition, o;
  i[t] = n, n.timer = bf(r, 0, n.time);
  function r(c) {
    n.state = au, n.timer.restart(a, n.delay, n.time), n.delay <= c && a(c - n.delay);
  }
  function a(c) {
    var u, d, h, p;
    if (n.state !== au)
      return l();
    for (u in i)
      if (p = i[u], p.name === n.name) {
        if (p.state === li)
          return ru(a);
        p.state === su ? (p.state = ui, p.timer.stop(), p.on.call("interrupt", e, e.__data__, p.index, p.group), delete i[u]) : +u < t && (p.state = ui, p.timer.stop(), p.on.call("cancel", e, e.__data__, p.index, p.group), delete i[u]);
      }
    if (ru(function() {
      n.state === li && (n.state = su, n.timer.restart(s, n.delay, n.time), s(c));
    }), n.state = Za, n.on.call("start", e, e.__data__, n.index, n.group), n.state === Za) {
      for (n.state = li, o = new Array(h = n.tween.length), u = 0, d = -1; u < h; ++u)
        (p = n.tween[u].value.call(e, e.__data__, n.index, n.group)) && (o[++d] = p);
      o.length = d + 1;
    }
  }
  function s(c) {
    for (var u = c < n.duration ? n.ease.call(null, c / n.duration) : (n.timer.restart(l), n.state = Ja, 1), d = -1, h = o.length; ++d < h; )
      o[d].call(e, u);
    n.state === Ja && (n.on.call("end", e, e.__data__, n.index, n.group), l());
  }
  function l() {
    n.state = ui, n.timer.stop(), delete i[t];
    for (var c in i)
      return;
    delete e.__transition;
  }
}
function ci(e, t) {
  var n = e.__transition, i, o, r = !0, a;
  if (n) {
    t = t == null ? null : t + "";
    for (a in n) {
      if ((i = n[a]).name !== t) {
        r = !1;
        continue;
      }
      o = i.state > Za && i.state < Ja, i.state = ui, i.timer.stop(), i.on.call(o ? "interrupt" : "cancel", e, e.__data__, i.index, i.group), delete n[a];
    }
    r && delete e.__transition;
  }
}
function X1(e) {
  return this.each(function() {
    ci(this, e);
  });
}
function K1(e, t) {
  var n, i;
  return function() {
    var o = Mt(this, e), r = o.tween;
    if (r !== n) {
      i = n = r;
      for (var a = 0, s = i.length; a < s; ++a)
        if (i[a].name === t) {
          i = i.slice(), i.splice(a, 1);
          break;
        }
    }
    o.tween = i;
  };
}
function Z1(e, t, n) {
  var i, o;
  if (typeof n != "function")
    throw new Error();
  return function() {
    var r = Mt(this, e), a = r.tween;
    if (a !== i) {
      o = (i = a).slice();
      for (var s = { name: t, value: n }, l = 0, c = o.length; l < c; ++l)
        if (o[l].name === t) {
          o[l] = s;
          break;
        }
      l === c && o.push(s);
    }
    r.tween = o;
  };
}
function J1(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var i = bt(this.node(), n).tween, o = 0, r = i.length, a; o < r; ++o)
      if ((a = i[o]).name === e)
        return a.value;
    return null;
  }
  return this.each((t == null ? K1 : Z1)(n, e, t));
}
function Us(e, t, n) {
  var i = e._id;
  return e.each(function() {
    var o = Mt(this, i);
    (o.value || (o.value = {}))[t] = n.apply(this, arguments);
  }), function(o) {
    return bt(o, i).value[t];
  };
}
function kf(e, t) {
  var n;
  return (typeof t == "number" ? Et : t instanceof dn ? Ci : (n = dn(t)) ? (t = n, Ci) : vf)(e, t);
}
function Q1(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function e0(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function t0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttribute(e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function n0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttributeNS(e.space, e.local);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function o0(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttribute(e) : (a = this.getAttribute(e), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function i0(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttributeNS(e.space, e.local) : (a = this.getAttributeNS(e.space, e.local), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function r0(e, t) {
  var n = tr(e), i = n === "transform" ? V1 : kf;
  return this.attrTween(e, typeof t == "function" ? (n.local ? i0 : o0)(n, i, Us(this, "attr." + e, t)) : t == null ? (n.local ? e0 : Q1)(n) : (n.local ? n0 : t0)(n, i, t));
}
function a0(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function s0(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function l0(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && s0(e, r)), n;
  }
  return o._value = t, o;
}
function u0(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && a0(e, r)), n;
  }
  return o._value = t, o;
}
function c0(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2)
    return (n = this.tween(n)) && n._value;
  if (t == null)
    return this.tween(n, null);
  if (typeof t != "function")
    throw new Error();
  var i = tr(e);
  return this.tween(n, (i.local ? l0 : u0)(i, t));
}
function d0(e, t) {
  return function() {
    qs(this, e).delay = +t.apply(this, arguments);
  };
}
function f0(e, t) {
  return t = +t, function() {
    qs(this, e).delay = t;
  };
}
function h0(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? d0 : f0)(t, e)) : bt(this.node(), t).delay;
}
function p0(e, t) {
  return function() {
    Mt(this, e).duration = +t.apply(this, arguments);
  };
}
function v0(e, t) {
  return t = +t, function() {
    Mt(this, e).duration = t;
  };
}
function m0(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? p0 : v0)(t, e)) : bt(this.node(), t).duration;
}
function g0(e, t) {
  if (typeof t != "function")
    throw new Error();
  return function() {
    Mt(this, e).ease = t;
  };
}
function y0(e) {
  var t = this._id;
  return arguments.length ? this.each(g0(t, e)) : bt(this.node(), t).ease;
}
function w0(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function")
      throw new Error();
    Mt(this, e).ease = n;
  };
}
function b0(e) {
  if (typeof e != "function")
    throw new Error();
  return this.each(w0(this._id, e));
}
function _0(e) {
  typeof e != "function" && (e = Qd(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new Bt(i, this._parents, this._name, this._id);
}
function k0(e) {
  if (e._id !== this._id)
    throw new Error();
  for (var t = this._groups, n = e._groups, i = t.length, o = n.length, r = Math.min(i, o), a = new Array(i), s = 0; s < r; ++s)
    for (var l = t[s], c = n[s], u = l.length, d = a[s] = new Array(u), h, p = 0; p < u; ++p)
      (h = l[p] || c[p]) && (d[p] = h);
  for (; s < i; ++s)
    a[s] = t[s];
  return new Bt(a, this._parents, this._name, this._id);
}
function E0(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function x0(e, t, n) {
  var i, o, r = E0(t) ? qs : Mt;
  return function() {
    var a = r(this, e), s = a.on;
    s !== i && (o = (i = s).copy()).on(t, n), a.on = o;
  };
}
function $0(e, t) {
  var n = this._id;
  return arguments.length < 2 ? bt(this.node(), n).on.on(e) : this.each(x0(n, e, t));
}
function S0(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition)
      if (+n !== e)
        return;
    t && t.removeChild(this);
  };
}
function C0() {
  return this.on("end.remove", S0(this._id));
}
function N0(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Vs(e));
  for (var i = this._groups, o = i.length, r = new Array(o), a = 0; a < o; ++a)
    for (var s = i[a], l = s.length, c = r[a] = new Array(l), u, d, h = 0; h < l; ++h)
      (u = s[h]) && (d = e.call(u, u.__data__, h, s)) && ("__data__" in u && (d.__data__ = u.__data__), c[h] = d, or(c[h], t, n, h, c, bt(u, n)));
  return new Bt(r, this._parents, t, n);
}
function I0(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Jd(e));
  for (var i = this._groups, o = i.length, r = [], a = [], s = 0; s < o; ++s)
    for (var l = i[s], c = l.length, u, d = 0; d < c; ++d)
      if (u = l[d]) {
        for (var h = e.call(u, u.__data__, d, l), p, v = bt(u, n), g = 0, m = h.length; g < m; ++g)
          (p = h[g]) && or(p, t, n, g, h, v);
        r.push(h), a.push(u);
      }
  return new Bt(r, a, t, n);
}
var A0 = So.prototype.constructor;
function M0() {
  return new A0(this._groups, this._parents);
}
function T0(e, t) {
  var n, i, o;
  return function() {
    var r = Mn(this, e), a = (this.style.removeProperty(e), Mn(this, e));
    return r === a ? null : r === n && a === i ? o : o = t(n = r, i = a);
  };
}
function Ef(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function O0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = Mn(this, e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function R0(e, t, n) {
  var i, o, r;
  return function() {
    var a = Mn(this, e), s = n(this), l = s + "";
    return s == null && (l = s = (this.style.removeProperty(e), Mn(this, e))), a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s));
  };
}
function D0(e, t) {
  var n, i, o, r = "style." + t, a = "end." + r, s;
  return function() {
    var l = Mt(this, e), c = l.on, u = l.value[r] == null ? s || (s = Ef(t)) : void 0;
    (c !== n || o !== u) && (i = (n = c).copy()).on(a, o = u), l.on = i;
  };
}
function P0(e, t, n) {
  var i = (e += "") == "transform" ? L1 : kf;
  return t == null ? this.styleTween(e, T0(e, i)).on("end.style." + e, Ef(e)) : typeof t == "function" ? this.styleTween(e, R0(e, i, Us(this, "style." + e, t))).each(D0(this._id, e)) : this.styleTween(e, O0(e, i, t), n).on("end.style." + e, null);
}
function L0(e, t, n) {
  return function(i) {
    this.style.setProperty(e, t.call(this, i), n);
  };
}
function V0(e, t, n) {
  var i, o;
  function r() {
    var a = t.apply(this, arguments);
    return a !== o && (i = (o = a) && L0(e, a, n)), i;
  }
  return r._value = t, r;
}
function B0(e, t, n) {
  var i = "style." + (e += "");
  if (arguments.length < 2)
    return (i = this.tween(i)) && i._value;
  if (t == null)
    return this.tween(i, null);
  if (typeof t != "function")
    throw new Error();
  return this.tween(i, V0(e, t, n ?? ""));
}
function z0(e) {
  return function() {
    this.textContent = e;
  };
}
function F0(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function H0(e) {
  return this.tween("text", typeof e == "function" ? F0(Us(this, "text", e)) : z0(e == null ? "" : e + ""));
}
function q0(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function U0(e) {
  var t, n;
  function i() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && q0(o)), t;
  }
  return i._value = e, i;
}
function W0(e) {
  var t = "text";
  if (arguments.length < 1)
    return (t = this.tween(t)) && t._value;
  if (e == null)
    return this.tween(t, null);
  if (typeof e != "function")
    throw new Error();
  return this.tween(t, U0(e));
}
function Y0() {
  for (var e = this._name, t = this._id, n = xf(), i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      if (l = a[c]) {
        var u = bt(l, t);
        or(l, e, n, c, a, {
          time: u.time + u.delay + u.duration,
          delay: 0,
          duration: u.duration,
          ease: u.ease
        });
      }
  return new Bt(i, this._parents, e, n);
}
function G0() {
  var e, t, n = this, i = n._id, o = n.size();
  return new Promise(function(r, a) {
    var s = { value: a }, l = { value: function() {
      --o === 0 && r();
    } };
    n.each(function() {
      var c = Mt(this, i), u = c.on;
      u !== e && (t = (e = u).copy(), t._.cancel.push(s), t._.interrupt.push(s), t._.end.push(l)), c.on = t;
    }), o === 0 && r();
  });
}
var j0 = 0;
function Bt(e, t, n, i) {
  this._groups = e, this._parents = t, this._name = n, this._id = i;
}
function xf() {
  return ++j0;
}
var Ot = So.prototype;
Bt.prototype = {
  constructor: Bt,
  select: N0,
  selectAll: I0,
  selectChild: Ot.selectChild,
  selectChildren: Ot.selectChildren,
  filter: _0,
  merge: k0,
  selection: M0,
  transition: Y0,
  call: Ot.call,
  nodes: Ot.nodes,
  node: Ot.node,
  size: Ot.size,
  empty: Ot.empty,
  each: Ot.each,
  on: $0,
  attr: r0,
  attrTween: c0,
  style: P0,
  styleTween: B0,
  text: H0,
  textTween: W0,
  remove: C0,
  tween: J1,
  delay: h0,
  duration: m0,
  ease: y0,
  easeVarying: b0,
  end: G0,
  [Symbol.iterator]: Ot[Symbol.iterator]
};
function X0(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var K0 = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: X0
};
function Z0(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function J0(e) {
  var t, n;
  e instanceof Bt ? (t = e._id, e = e._name) : (t = xf(), (n = K0).time = Hs(), e = e == null ? null : e + "");
  for (var i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && or(l, e, t, c, a, n || Z0(l, t));
  return new Bt(i, this._parents, e, t);
}
So.prototype.interrupt = X1;
So.prototype.transition = J0;
const Uo = (e) => () => e;
function Q0(e, {
  sourceEvent: t,
  target: n,
  transform: i,
  dispatch: o
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    target: { value: n, enumerable: !0, configurable: !0 },
    transform: { value: i, enumerable: !0, configurable: !0 },
    _: { value: o }
  });
}
function Pt(e, t, n) {
  this.k = e, this.x = t, this.y = n;
}
Pt.prototype = {
  constructor: Pt,
  scale: function(e) {
    return e === 1 ? this : new Pt(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new Pt(this.k, this.x + this.k * e, this.y + this.k * t);
  },
  apply: function(e) {
    return [e[0] * this.k + this.x, e[1] * this.k + this.y];
  },
  applyX: function(e) {
    return e * this.k + this.x;
  },
  applyY: function(e) {
    return e * this.k + this.y;
  },
  invert: function(e) {
    return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
  },
  invertX: function(e) {
    return (e - this.x) / this.k;
  },
  invertY: function(e) {
    return (e - this.y) / this.k;
  },
  rescaleX: function(e) {
    return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
  },
  rescaleY: function(e) {
    return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var On = new Pt(1, 0, 0);
Pt.prototype;
function Tr(e) {
  e.stopImmediatePropagation();
}
function Un(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function e_(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function t_() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function lu() {
  return this.__zoom || On;
}
function n_(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function o_() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function i_(e, t, n) {
  var i = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], r = e.invertY(t[0][1]) - n[0][1], a = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > i ? (i + o) / 2 : Math.min(0, i) || Math.max(0, o),
    a > r ? (r + a) / 2 : Math.min(0, r) || Math.max(0, a)
  );
}
function r_() {
  var e = e_, t = t_, n = i_, i = n_, o = o_, r = [0, 1 / 0], a = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], s = 250, l = si, c = er("start", "zoom", "end"), u, d, h, p = 500, v = 150, g = 0, m = 10;
  function k(y) {
    y.property("__zoom", lu).on("wheel.zoom", T, { passive: !1 }).on("mousedown.zoom", O).on("dblclick.zoom", D).filter(o).on("touchstart.zoom", B).on("touchmove.zoom", N).on("touchend.zoom touchcancel.zoom", H).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  k.transform = function(y, E, _, L) {
    var F = y.selection ? y.selection() : y;
    F.property("__zoom", lu), y !== F ? C(y, E, _, L) : F.interrupt().each(function() {
      I(this, arguments).event(L).start().zoom(null, typeof E == "function" ? E.apply(this, arguments) : E).end();
    });
  }, k.scaleBy = function(y, E, _, L) {
    k.scaleTo(y, function() {
      var F = this.__zoom.k, J = typeof E == "function" ? E.apply(this, arguments) : E;
      return F * J;
    }, _, L);
  }, k.scaleTo = function(y, E, _, L) {
    k.transform(y, function() {
      var F = t.apply(this, arguments), J = this.__zoom, X = _ == null ? b(F) : typeof _ == "function" ? _.apply(this, arguments) : _, oe = J.invert(X), se = typeof E == "function" ? E.apply(this, arguments) : E;
      return n(w(x(J, se), X, oe), F, a);
    }, _, L);
  }, k.translateBy = function(y, E, _, L) {
    k.transform(y, function() {
      return n(this.__zoom.translate(
        typeof E == "function" ? E.apply(this, arguments) : E,
        typeof _ == "function" ? _.apply(this, arguments) : _
      ), t.apply(this, arguments), a);
    }, null, L);
  }, k.translateTo = function(y, E, _, L, F) {
    k.transform(y, function() {
      var J = t.apply(this, arguments), X = this.__zoom, oe = L == null ? b(J) : typeof L == "function" ? L.apply(this, arguments) : L;
      return n(On.translate(oe[0], oe[1]).scale(X.k).translate(
        typeof E == "function" ? -E.apply(this, arguments) : -E,
        typeof _ == "function" ? -_.apply(this, arguments) : -_
      ), J, a);
    }, L, F);
  };
  function x(y, E) {
    return E = Math.max(r[0], Math.min(r[1], E)), E === y.k ? y : new Pt(E, y.x, y.y);
  }
  function w(y, E, _) {
    var L = E[0] - _[0] * y.k, F = E[1] - _[1] * y.k;
    return L === y.x && F === y.y ? y : new Pt(y.k, L, F);
  }
  function b(y) {
    return [(+y[0][0] + +y[1][0]) / 2, (+y[0][1] + +y[1][1]) / 2];
  }
  function C(y, E, _, L) {
    y.on("start.zoom", function() {
      I(this, arguments).event(L).start();
    }).on("interrupt.zoom end.zoom", function() {
      I(this, arguments).event(L).end();
    }).tween("zoom", function() {
      var F = this, J = arguments, X = I(F, J).event(L), oe = t.apply(F, J), se = _ == null ? b(oe) : typeof _ == "function" ? _.apply(F, J) : _, W = Math.max(oe[1][0] - oe[0][0], oe[1][1] - oe[0][1]), K = F.__zoom, G = typeof E == "function" ? E.apply(F, J) : E, ee = l(K.invert(se).concat(W / K.k), G.invert(se).concat(W / G.k));
      return function(te) {
        if (te === 1)
          te = G;
        else {
          var re = ee(te), le = W / re[2];
          te = new Pt(le, se[0] - re[0] * le, se[1] - re[1] * le);
        }
        X.zoom(null, te);
      };
    });
  }
  function I(y, E, _) {
    return !_ && y.__zooming || new z(y, E);
  }
  function z(y, E) {
    this.that = y, this.args = E, this.active = 0, this.sourceEvent = null, this.extent = t.apply(y, E), this.taps = 0;
  }
  z.prototype = {
    event: function(y) {
      return y && (this.sourceEvent = y), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(y, E) {
      return this.mouse && y !== "mouse" && (this.mouse[1] = E.invert(this.mouse[0])), this.touch0 && y !== "touch" && (this.touch0[1] = E.invert(this.touch0[0])), this.touch1 && y !== "touch" && (this.touch1[1] = E.invert(this.touch1[0])), this.that.__zoom = E, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(y) {
      var E = pt(this.that).datum();
      c.call(
        y,
        this.that,
        new Q0(y, {
          sourceEvent: this.sourceEvent,
          target: k,
          transform: this.that.__zoom,
          dispatch: c
        }),
        E
      );
    }
  };
  function T(y, ...E) {
    if (!e.apply(this, arguments))
      return;
    var _ = I(this, E).event(y), L = this.__zoom, F = Math.max(r[0], Math.min(r[1], L.k * Math.pow(2, i.apply(this, arguments)))), J = kt(y);
    if (_.wheel)
      (_.mouse[0][0] !== J[0] || _.mouse[0][1] !== J[1]) && (_.mouse[1] = L.invert(_.mouse[0] = J)), clearTimeout(_.wheel);
    else {
      if (L.k === F)
        return;
      _.mouse = [J, L.invert(J)], ci(this), _.start();
    }
    Un(y), _.wheel = setTimeout(X, v), _.zoom("mouse", n(w(x(L, F), _.mouse[0], _.mouse[1]), _.extent, a));
    function X() {
      _.wheel = null, _.end();
    }
  }
  function O(y, ...E) {
    if (h || !e.apply(this, arguments))
      return;
    var _ = y.currentTarget, L = I(this, E, !0).event(y), F = pt(y.view).on("mousemove.zoom", se, !0).on("mouseup.zoom", W, !0), J = kt(y, _), X = y.clientX, oe = y.clientY;
    cf(y.view), Tr(y), L.mouse = [J, this.__zoom.invert(J)], ci(this), L.start();
    function se(K) {
      if (Un(K), !L.moved) {
        var G = K.clientX - X, ee = K.clientY - oe;
        L.moved = G * G + ee * ee > g;
      }
      L.event(K).zoom("mouse", n(w(L.that.__zoom, L.mouse[0] = kt(K, _), L.mouse[1]), L.extent, a));
    }
    function W(K) {
      F.on("mousemove.zoom mouseup.zoom", null), df(K.view, L.moved), Un(K), L.event(K).end();
    }
  }
  function D(y, ...E) {
    if (e.apply(this, arguments)) {
      var _ = this.__zoom, L = kt(y.changedTouches ? y.changedTouches[0] : y, this), F = _.invert(L), J = _.k * (y.shiftKey ? 0.5 : 2), X = n(w(x(_, J), L, F), t.apply(this, E), a);
      Un(y), s > 0 ? pt(this).transition().duration(s).call(C, X, L, y) : pt(this).call(k.transform, X, L, y);
    }
  }
  function B(y, ...E) {
    if (e.apply(this, arguments)) {
      var _ = y.touches, L = _.length, F = I(this, E, y.changedTouches.length === L).event(y), J, X, oe, se;
      for (Tr(y), X = 0; X < L; ++X)
        oe = _[X], se = kt(oe, this), se = [se, this.__zoom.invert(se), oe.identifier], F.touch0 ? !F.touch1 && F.touch0[2] !== se[2] && (F.touch1 = se, F.taps = 0) : (F.touch0 = se, J = !0, F.taps = 1 + !!u);
      u && (u = clearTimeout(u)), J && (F.taps < 2 && (d = se[0], u = setTimeout(function() {
        u = null;
      }, p)), ci(this), F.start());
    }
  }
  function N(y, ...E) {
    if (this.__zooming) {
      var _ = I(this, E).event(y), L = y.changedTouches, F = L.length, J, X, oe, se;
      for (Un(y), J = 0; J < F; ++J)
        X = L[J], oe = kt(X, this), _.touch0 && _.touch0[2] === X.identifier ? _.touch0[0] = oe : _.touch1 && _.touch1[2] === X.identifier && (_.touch1[0] = oe);
      if (X = _.that.__zoom, _.touch1) {
        var W = _.touch0[0], K = _.touch0[1], G = _.touch1[0], ee = _.touch1[1], te = (te = G[0] - W[0]) * te + (te = G[1] - W[1]) * te, re = (re = ee[0] - K[0]) * re + (re = ee[1] - K[1]) * re;
        X = x(X, Math.sqrt(te / re)), oe = [(W[0] + G[0]) / 2, (W[1] + G[1]) / 2], se = [(K[0] + ee[0]) / 2, (K[1] + ee[1]) / 2];
      } else if (_.touch0)
        oe = _.touch0[0], se = _.touch0[1];
      else
        return;
      _.zoom("touch", n(w(X, oe, se), _.extent, a));
    }
  }
  function H(y, ...E) {
    if (this.__zooming) {
      var _ = I(this, E).event(y), L = y.changedTouches, F = L.length, J, X;
      for (Tr(y), h && clearTimeout(h), h = setTimeout(function() {
        h = null;
      }, p), J = 0; J < F; ++J)
        X = L[J], _.touch0 && _.touch0[2] === X.identifier ? delete _.touch0 : _.touch1 && _.touch1[2] === X.identifier && delete _.touch1;
      if (_.touch1 && !_.touch0 && (_.touch0 = _.touch1, delete _.touch1), _.touch0)
        _.touch0[1] = this.__zoom.invert(_.touch0[0]);
      else if (_.end(), _.taps === 2 && (X = kt(X, this), Math.hypot(d[0] - X[0], d[1] - X[1]) < m)) {
        var oe = pt(this).on("dblclick.zoom");
        oe && oe.apply(this, arguments);
      }
    }
  }
  return k.wheelDelta = function(y) {
    return arguments.length ? (i = typeof y == "function" ? y : Uo(+y), k) : i;
  }, k.filter = function(y) {
    return arguments.length ? (e = typeof y == "function" ? y : Uo(!!y), k) : e;
  }, k.touchable = function(y) {
    return arguments.length ? (o = typeof y == "function" ? y : Uo(!!y), k) : o;
  }, k.extent = function(y) {
    return arguments.length ? (t = typeof y == "function" ? y : Uo([[+y[0][0], +y[0][1]], [+y[1][0], +y[1][1]]]), k) : t;
  }, k.scaleExtent = function(y) {
    return arguments.length ? (r[0] = +y[0], r[1] = +y[1], k) : [r[0], r[1]];
  }, k.translateExtent = function(y) {
    return arguments.length ? (a[0][0] = +y[0][0], a[1][0] = +y[1][0], a[0][1] = +y[0][1], a[1][1] = +y[1][1], k) : [[a[0][0], a[0][1]], [a[1][0], a[1][1]]];
  }, k.constrain = function(y) {
    return arguments.length ? (n = y, k) : n;
  }, k.duration = function(y) {
    return arguments.length ? (s = +y, k) : s;
  }, k.interpolate = function(y) {
    return arguments.length ? (l = y, k) : l;
  }, k.on = function() {
    var y = c.on.apply(c, arguments);
    return y === c ? k : y;
  }, k.clickDistance = function(y) {
    return arguments.length ? (g = (y = +y) * y, k) : Math.sqrt(g);
  }, k.tapDistance = function(y) {
    return arguments.length ? (m = +y, k) : m;
  }, k;
}
var ge = /* @__PURE__ */ ((e) => (e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom", e))(ge || {}), Ws = /* @__PURE__ */ ((e) => (e.Partial = "partial", e.Full = "full", e))(Ws || {}), nn = /* @__PURE__ */ ((e) => (e.Bezier = "default", e.SimpleBezier = "simple-bezier", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e))(nn || {}), en = /* @__PURE__ */ ((e) => (e.Strict = "strict", e.Loose = "loose", e))(en || {}), Mi = /* @__PURE__ */ ((e) => (e.Arrow = "arrow", e.ArrowClosed = "arrowclosed", e))(Mi || {}), to = /* @__PURE__ */ ((e) => (e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal", e))(to || {}), $f = /* @__PURE__ */ ((e) => (e.TopLeft = "top-left", e.TopCenter = "top-center", e.TopRight = "top-right", e.BottomLeft = "bottom-left", e.BottomCenter = "bottom-center", e.BottomRight = "bottom-right", e))($f || {});
const a_ = ["INPUT", "SELECT", "TEXTAREA"], s_ = typeof document < "u" ? document : null;
function Qa(e) {
  var t, n;
  const i = ((n = (t = e.composedPath) == null ? void 0 : t.call(e)) == null ? void 0 : n[0]) || e.target, o = typeof i?.hasAttribute == "function" ? i.hasAttribute("contenteditable") : !1, r = typeof i?.closest == "function" ? i.closest(".nokey") : null;
  return a_.includes(i?.nodeName) || o || !!r;
}
function l_(e) {
  return e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
}
function uu(e, t, n, i) {
  const o = t.replace("+", `
`).replace(`

`, `
+`).split(`
`).map((a) => a.trim().toLowerCase());
  if (o.length === 1)
    return e.toLowerCase() === t.toLowerCase();
  i || n.add(e.toLowerCase());
  const r = o.every(
    (a, s) => n.has(a) && Array.from(n.values())[s] === o[s]
  );
  return i && n.delete(e.toLowerCase()), r;
}
function u_(e, t) {
  return (n) => {
    if (!n.code && !n.key)
      return !1;
    const i = c_(n.code, e);
    return Array.isArray(e) ? e.some((o) => uu(n[i], o, t, n.type === "keyup")) : uu(n[i], e, t, n.type === "keyup");
  };
}
function c_(e, t) {
  return t.includes(e) ? "code" : "key";
}
function no(e, t) {
  const n = U(() => Me(t?.target) ?? s_), i = nt(Me(e) === !0);
  let o = !1;
  const r = /* @__PURE__ */ new Set();
  let a = l(Me(e));
  _e(
    () => Me(e),
    (c, u) => {
      typeof u == "boolean" && typeof c != "boolean" && s(), a = l(c);
    },
    {
      immediate: !0
    }
  ), Kd(["blur", "contextmenu"], s), Wl(
    (...c) => a(...c),
    (c) => {
      var u, d;
      const h = Me(t?.actInsideInputWithModifier) ?? !0, p = Me(t?.preventDefault) ?? !1;
      if (o = l_(c), (!o || o && !h) && Qa(c))
        return;
      const g = ((d = (u = c.composedPath) == null ? void 0 : u.call(c)) == null ? void 0 : d[0]) || c.target, m = g?.nodeName === "BUTTON" || g?.nodeName === "A";
      !p && (o || !m) && c.preventDefault(), i.value = !0;
    },
    { eventName: "keydown", target: n }
  ), Wl(
    (...c) => a(...c),
    (c) => {
      const u = Me(t?.actInsideInputWithModifier) ?? !0;
      if (i.value) {
        if ((!o || o && !u) && Qa(c))
          return;
        o = !1, i.value = !1;
      }
    },
    { eventName: "keyup", target: n }
  );
  function s() {
    o = !1, r.clear(), i.value = Me(e) === !0;
  }
  function l(c) {
    return c === null ? (s(), () => !1) : typeof c == "boolean" ? (s(), i.value = c, () => !1) : Array.isArray(c) || typeof c == "string" ? u_(c, r) : c;
  }
  return i;
}
const Sf = "vue-flow__node-desc", Cf = "vue-flow__edge-desc", d_ = "vue-flow__aria-live", Nf = ["Enter", " ", "Escape"], Cn = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};
function Ti(e) {
  return {
    ...e.computedPosition || { x: 0, y: 0 },
    width: e.dimensions.width || 0,
    height: e.dimensions.height || 0
  };
}
function Oi(e, t) {
  const n = Math.max(0, Math.min(e.x + e.width, t.x + t.width) - Math.max(e.x, t.x)), i = Math.max(0, Math.min(e.y + e.height, t.y + t.height) - Math.max(e.y, t.y));
  return Math.ceil(n * i);
}
function ir(e) {
  return {
    width: e.offsetWidth,
    height: e.offsetHeight
  };
}
function zt(e, t = 0, n = 1) {
  return Math.min(Math.max(e, t), n);
}
function If(e, t) {
  return {
    x: zt(e.x, t[0][0], t[1][0]),
    y: zt(e.y, t[0][1], t[1][1])
  };
}
function cu(e) {
  const t = e.getRootNode();
  return "elementFromPoint" in t ? t : window.document;
}
function tn(e) {
  return e && typeof e == "object" && "id" in e && "source" in e && "target" in e;
}
function un(e) {
  return e && typeof e == "object" && "id" in e && "position" in e && !tn(e);
}
function Xn(e) {
  return un(e) && "computedPosition" in e;
}
function Wo(e) {
  return !Number.isNaN(e) && Number.isFinite(e);
}
function f_(e) {
  return Wo(e.width) && Wo(e.height) && Wo(e.x) && Wo(e.y);
}
function h_(e, t, n) {
  const i = {
    id: e.id.toString(),
    type: e.type ?? "default",
    dimensions: et({
      width: 0,
      height: 0
    }),
    computedPosition: et({
      z: 0,
      ...e.position
    }),
    // todo: shouldn't be defined initially, as we want to use handleBounds to check if a node was actually initialized or not
    handleBounds: {
      source: [],
      target: []
    },
    draggable: void 0,
    selectable: void 0,
    connectable: void 0,
    focusable: void 0,
    selected: !1,
    dragging: !1,
    resizing: !1,
    initialized: !1,
    isParent: !1,
    position: {
      x: 0,
      y: 0
    },
    data: We(e.data) ? e.data : {},
    events: et(We(e.events) ? e.events : {})
  };
  return Object.assign(t ?? i, e, { id: e.id.toString(), parentNode: n });
}
function Af(e, t, n) {
  var i, o;
  const r = {
    id: e.id.toString(),
    type: e.type ?? t?.type ?? "default",
    source: e.source.toString(),
    target: e.target.toString(),
    sourceHandle: (i = e.sourceHandle) == null ? void 0 : i.toString(),
    targetHandle: (o = e.targetHandle) == null ? void 0 : o.toString(),
    updatable: e.updatable ?? n?.updatable,
    selectable: e.selectable ?? n?.selectable,
    focusable: e.focusable ?? n?.focusable,
    data: We(e.data) ? e.data : {},
    events: et(We(e.events) ? e.events : {}),
    label: e.label ?? "",
    interactionWidth: e.interactionWidth ?? n?.interactionWidth,
    ...n ?? {}
  };
  return Object.assign(t ?? r, e, { id: e.id.toString() });
}
function Mf(e, t, n, i) {
  const o = typeof e == "string" ? e : e.id, r = /* @__PURE__ */ new Set(), a = i === "source" ? "target" : "source";
  for (const s of n)
    s[a] === o && r.add(s[i]);
  return t.filter((s) => r.has(s.id));
}
function p_(...e) {
  if (e.length === 3) {
    const [r, a, s] = e;
    return Mf(r, a, s, "target");
  }
  const [t, n] = e, i = typeof t == "string" ? t : t.id;
  return n.filter((r) => tn(r) && r.source === i).map((r) => n.find((a) => un(a) && a.id === r.target));
}
function v_(...e) {
  if (e.length === 3) {
    const [r, a, s] = e;
    return Mf(r, a, s, "source");
  }
  const [t, n] = e, i = typeof t == "string" ? t : t.id;
  return n.filter((r) => tn(r) && r.target === i).map((r) => n.find((a) => un(a) && a.id === r.source));
}
function Tf({ source: e, sourceHandle: t, target: n, targetHandle: i }) {
  return `vueflow__edge-${e}${t ?? ""}-${n}${i ?? ""}`;
}
function m_(e, t) {
  return t.some(
    (n) => tn(n) && n.source === e.source && n.target === e.target && (n.sourceHandle === e.sourceHandle || !n.sourceHandle && !e.sourceHandle) && (n.targetHandle === e.targetHandle || !n.targetHandle && !e.targetHandle)
  );
}
function po({ x: e, y: t }, { x: n, y: i, zoom: o }) {
  return {
    x: e * o + n,
    y: t * o + i
  };
}
function vo({ x: e, y: t }, { x: n, y: i, zoom: o }, r = !1, a = [1, 1]) {
  const s = {
    x: (e - n) / o,
    y: (t - i) / o
  };
  return r ? rr(s, a) : s;
}
function Of(e, t) {
  return {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x2, t.x2),
    y2: Math.max(e.y2, t.y2)
  };
}
function Ri({ x: e, y: t, width: n, height: i }) {
  return {
    x: e,
    y: t,
    x2: e + n,
    y2: t + i
  };
}
function Rf({ x: e, y: t, x2: n, y2: i }) {
  return {
    x: e,
    y: t,
    width: n - e,
    height: i - t
  };
}
function g_(e, t) {
  return Rf(Of(Ri(e), Ri(t)));
}
function Ys(e) {
  let t = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY,
    x2: Number.NEGATIVE_INFINITY,
    y2: Number.NEGATIVE_INFINITY
  };
  for (let n = 0; n < e.length; n++) {
    const i = e[n];
    t = Of(
      t,
      Ri({
        ...i.computedPosition,
        ...i.dimensions
      })
    );
  }
  return Rf(t);
}
function Df(e, t, n = { x: 0, y: 0, zoom: 1 }, i = !1, o = !1) {
  const r = {
    ...vo(t, n),
    width: t.width / n.zoom,
    height: t.height / n.zoom
  }, a = [];
  for (const s of e) {
    const { dimensions: l, selectable: c = !0, hidden: u = !1 } = s, d = l.width ?? s.width ?? null, h = l.height ?? s.height ?? null;
    if (o && !c || u)
      continue;
    const p = Oi(r, Ti(s)), v = d === null || h === null, g = i && p > 0, m = (d ?? 0) * (h ?? 0);
    (v || g || p >= m || s.dragging) && a.push(s);
  }
  return a;
}
function on(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (typeof e == "string")
    n.add(e);
  else if (e.length >= 1)
    for (const i of e)
      n.add(i.id);
  return t.filter((i) => n.has(i.source) || n.has(i.target));
}
function kn(e, t) {
  if (typeof e == "number")
    return Math.floor((t - t / (1 + e)) * 0.5);
  if (typeof e == "string" && e.endsWith("px")) {
    const n = Number.parseFloat(e);
    if (!Number.isNaN(n))
      return Math.floor(n);
  }
  if (typeof e == "string" && e.endsWith("%")) {
    const n = Number.parseFloat(e);
    if (!Number.isNaN(n))
      return Math.floor(t * n * 0.01);
  }
  return No(`The padding value "${e}" is invalid. Please provide a number or a string with a valid unit (px or %).`), 0;
}
function y_(e, t, n) {
  if (typeof e == "string" || typeof e == "number") {
    const i = kn(e, n), o = kn(e, t);
    return {
      top: i,
      right: o,
      bottom: i,
      left: o,
      x: o * 2,
      y: i * 2
    };
  }
  if (typeof e == "object") {
    const i = kn(e.top ?? e.y ?? 0, n), o = kn(e.bottom ?? e.y ?? 0, n), r = kn(e.left ?? e.x ?? 0, t), a = kn(e.right ?? e.x ?? 0, t);
    return { top: i, right: a, bottom: o, left: r, x: r + a, y: i + o };
  }
  return { top: 0, right: 0, bottom: 0, left: 0, x: 0, y: 0 };
}
function w_(e, t, n, i, o, r) {
  const { x: a, y: s } = po(e, { x: t, y: n, zoom: i }), { x: l, y: c } = po(
    { x: e.x + e.width, y: e.y + e.height },
    {
      x: t,
      y: n,
      zoom: i
    }
  ), u = o - l, d = r - c;
  return {
    left: Math.floor(a),
    top: Math.floor(s),
    right: Math.floor(u),
    bottom: Math.floor(d)
  };
}
function du(e, t, n, i, o, r = 0.1) {
  const a = y_(r, t, n), s = (t - a.x) / e.width, l = (n - a.y) / e.height, c = Math.min(s, l), u = zt(c, i, o), d = e.x + e.width / 2, h = e.y + e.height / 2, p = t / 2 - d * u, v = n / 2 - h * u, g = w_(e, p, v, u, t, n), m = {
    left: Math.min(g.left - a.left, 0),
    top: Math.min(g.top - a.top, 0),
    right: Math.min(g.right - a.right, 0),
    bottom: Math.min(g.bottom - a.bottom, 0)
  };
  return {
    x: p - m.left + m.right,
    y: v - m.top + m.bottom,
    zoom: u
  };
}
function b_(e, t) {
  return {
    x: t.x + e.x,
    y: t.y + e.y,
    z: (e.z > t.z ? e.z : t.z) + 1
  };
}
function Pf(e, t) {
  if (!e.parentNode)
    return !1;
  const n = t.get(e.parentNode);
  return n ? n.selected ? !0 : Pf(n, t) : !1;
}
function mo(e, t) {
  return typeof e > "u" ? "" : typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((i) => `${i}=${e[i]}`).join("&")}`;
}
function es(e) {
  const t = e.ctrlKey && go() ? 10 : 1;
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * t;
}
function fu(e, t, n) {
  return e < t ? zt(Math.abs(e - t), 1, t) / t : e > n ? -zt(Math.abs(e - n), 1, t) / t : 0;
}
function Lf(e, t, n = 15, i = 40) {
  const o = fu(e.x, i, t.width - i) * n, r = fu(e.y, i, t.height - i) * n;
  return [o, r];
}
function Or(e, t) {
  if (t) {
    const n = e.position.x + e.dimensions.width - t.dimensions.width, i = e.position.y + e.dimensions.height - t.dimensions.height;
    if (n > 0 || i > 0 || e.position.x < 0 || e.position.y < 0) {
      let o = {};
      if (typeof t.style == "function" ? o = { ...t.style(t) } : t.style && (o = { ...t.style }), o.width = o.width ?? `${t.dimensions.width}px`, o.height = o.height ?? `${t.dimensions.height}px`, n > 0)
        if (typeof o.width == "string") {
          const r = Number(o.width.replace("px", ""));
          o.width = `${r + n}px`;
        } else
          o.width += n;
      if (i > 0)
        if (typeof o.height == "string") {
          const r = Number(o.height.replace("px", ""));
          o.height = `${r + i}px`;
        } else
          o.height += i;
      if (e.position.x < 0) {
        const r = Math.abs(e.position.x);
        if (t.position.x = t.position.x - r, typeof o.width == "string") {
          const a = Number(o.width.replace("px", ""));
          o.width = `${a + r}px`;
        } else
          o.width += r;
        e.position.x = 0;
      }
      if (e.position.y < 0) {
        const r = Math.abs(e.position.y);
        if (t.position.y = t.position.y - r, typeof o.height == "string") {
          const a = Number(o.height.replace("px", ""));
          o.height = `${a + r}px`;
        } else
          o.height += r;
        e.position.y = 0;
      }
      t.dimensions.width = Number(o.width.toString().replace("px", "")), t.dimensions.height = Number(o.height.toString().replace("px", "")), typeof t.style == "function" ? t.style = (r) => {
        const a = t.style;
        return {
          ...a(r),
          ...o
        };
      } : t.style = {
        ...t.style,
        ...o
      };
    }
  }
}
function hu(e, t) {
  var n, i;
  const o = e.filter((a) => a.type === "add" || a.type === "remove");
  for (const a of o)
    if (a.type === "add")
      t.findIndex((l) => l.id === a.item.id) === -1 && t.push(a.item);
    else if (a.type === "remove") {
      const s = t.findIndex((l) => l.id === a.id);
      s !== -1 && t.splice(s, 1);
    }
  const r = t.map((a) => a.id);
  for (const a of t)
    for (const s of e)
      if (s.id === a.id)
        switch (s.type) {
          case "select":
            a.selected = s.selected;
            break;
          case "position":
            if (Xn(a) && (typeof s.position < "u" && (a.position = s.position), typeof s.dragging < "u" && (a.dragging = s.dragging), a.expandParent && a.parentNode)) {
              const l = t[r.indexOf(a.parentNode)];
              l && Xn(l) && Or(a, l);
            }
            break;
          case "dimensions":
            if (Xn(a) && (typeof s.dimensions < "u" && (a.dimensions = s.dimensions), typeof s.updateStyle < "u" && s.updateStyle && (a.style = {
              ...a.style || {},
              width: `${(n = s.dimensions) == null ? void 0 : n.width}px`,
              height: `${(i = s.dimensions) == null ? void 0 : i.height}px`
            }), typeof s.resizing < "u" && (a.resizing = s.resizing), a.expandParent && a.parentNode)) {
              const l = t[r.indexOf(a.parentNode)];
              l && Xn(l) && (!!l.dimensions.width && !!l.dimensions.height ? Or(a, l) : Ve(() => {
                Or(a, l);
              }));
            }
            break;
        }
  return t;
}
function Wt(e, t) {
  return {
    id: e,
    type: "select",
    selected: t
  };
}
function pu(e) {
  return {
    item: e,
    type: "add"
  };
}
function vu(e) {
  return {
    id: e,
    type: "remove"
  };
}
function mu(e, t, n, i, o) {
  return {
    id: e,
    source: t,
    target: n,
    sourceHandle: i || null,
    targetHandle: o || null,
    type: "remove"
  };
}
function Gt(e, t = /* @__PURE__ */ new Set(), n = !1) {
  const i = [];
  for (const [o, r] of e) {
    const a = t.has(o);
    !(r.selected === void 0 && !a) && r.selected !== a && (n && (r.selected = a), i.push(Wt(r.id, a)));
  }
  return i;
}
const gu = () => {
};
function he(e) {
  const t = /* @__PURE__ */ new Set();
  let n = gu, i = () => !1;
  const o = () => t.size > 0 || i(), r = (h) => {
    n = h;
  }, a = () => {
    n = gu;
  }, s = (h) => {
    i = h;
  }, l = () => {
    i = () => !1;
  }, c = (h) => {
    t.delete(h);
  };
  return {
    on: (h) => {
      t.add(h);
      const p = () => c(h);
      return lo(p), { off: p };
    },
    off: c,
    trigger: (h) => {
      const p = [n];
      return o() ? p.push(...t) : e && p.push(e), Promise.allSettled(p.map((v) => v(h)));
    },
    hasListeners: o,
    listeners: t,
    setEmitter: r,
    removeEmitter: a,
    setHasEmitListeners: s,
    removeHasEmitListeners: l
  };
}
function yu(e, t, n) {
  let i = e;
  do {
    if (i && i.matches(t))
      return !0;
    if (i === n)
      return !1;
    i = i.parentElement;
  } while (i);
  return !1;
}
function __(e, t, n, i) {
  var o, r;
  const a = /* @__PURE__ */ new Map();
  for (const [s, l] of e)
    (l.selected || l.id === i) && (!l.parentNode || !Pf(l, e)) && (l.draggable || t && typeof l.draggable > "u") && e.get(s) && a.set(s, {
      id: l.id,
      position: l.position || { x: 0, y: 0 },
      distance: {
        x: n.x - ((o = l.computedPosition) == null ? void 0 : o.x) || 0,
        y: n.y - ((r = l.computedPosition) == null ? void 0 : r.y) || 0
      },
      from: { x: l.computedPosition.x, y: l.computedPosition.y },
      extent: l.extent,
      parentNode: l.parentNode,
      dimensions: { ...l.dimensions },
      expandParent: l.expandParent
    });
  return Array.from(a.values());
}
function Rr({
  id: e,
  dragItems: t,
  findNode: n
}) {
  const i = [];
  for (const o of t) {
    const r = n(o.id);
    r && i.push(r);
  }
  return [e ? i.find((o) => o.id === e) : i[0], i];
}
function Vf(e) {
  if (Array.isArray(e))
    switch (e.length) {
      case 1:
        return [e[0], e[0], e[0], e[0]];
      case 2:
        return [e[0], e[1], e[0], e[1]];
      case 3:
        return [e[0], e[1], e[2], e[1]];
      case 4:
        return e;
      default:
        return [0, 0, 0, 0];
    }
  return [e, e, e, e];
}
function k_(e, t, n) {
  const [i, o, r, a] = typeof e != "string" ? Vf(e.padding) : [0, 0, 0, 0];
  return n && typeof n.computedPosition.x < "u" && typeof n.computedPosition.y < "u" && typeof n.dimensions.width < "u" && typeof n.dimensions.height < "u" ? [
    [n.computedPosition.x + a, n.computedPosition.y + i],
    [
      n.computedPosition.x + n.dimensions.width - o,
      n.computedPosition.y + n.dimensions.height - r
    ]
  ] : !1;
}
function E_(e, t, n, i) {
  let o = e.extent || n;
  if ((o === "parent" || !Array.isArray(o) && o?.range === "parent") && !e.expandParent)
    if (e.parentNode && i && e.dimensions.width && e.dimensions.height) {
      const r = k_(o, e, i);
      r && (o = r);
    } else
      t(new je(Ye.NODE_EXTENT_INVALID, e.id)), o = n;
  else if (Array.isArray(o)) {
    const r = i?.computedPosition.x || 0, a = i?.computedPosition.y || 0;
    o = [
      [o[0][0] + r, o[0][1] + a],
      [o[1][0] + r, o[1][1] + a]
    ];
  } else if (o !== "parent" && o?.range && Array.isArray(o.range)) {
    const [r, a, s, l] = Vf(o.padding), c = i?.computedPosition.x || 0, u = i?.computedPosition.y || 0;
    o = [
      [o.range[0][0] + c + l, o.range[0][1] + u + r],
      [o.range[1][0] + c - a, o.range[1][1] + u - s]
    ];
  }
  return o === "parent" ? [
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
  ] : o;
}
function x_({ width: e, height: t }, n) {
  return [n[0], [n[1][0] - (e || 0), n[1][1] - (t || 0)]];
}
function Gs(e, t, n, i, o) {
  const r = x_(e.dimensions, E_(e, n, i, o)), a = If(t, r);
  return {
    position: {
      x: a.x - (o?.computedPosition.x || 0),
      y: a.y - (o?.computedPosition.y || 0)
    },
    computedPosition: a
  };
}
function Rn(e, t, n = ge.Left, i = !1) {
  const o = (t?.x ?? 0) + e.computedPosition.x, r = (t?.y ?? 0) + e.computedPosition.y, { width: a, height: s } = t ?? N_(e);
  if (i)
    return { x: o + a / 2, y: r + s / 2 };
  switch (t?.position ?? n) {
    case ge.Top:
      return { x: o + a / 2, y: r };
    case ge.Right:
      return { x: o + a, y: r + s / 2 };
    case ge.Bottom:
      return { x: o + a / 2, y: r + s };
    case ge.Left:
      return { x: o, y: r + s / 2 };
  }
}
function wu(e, t) {
  return e && (t ? e.find((n) => n.id === t) : e[0]) || null;
}
function $_({
  sourcePos: e,
  targetPos: t,
  sourceWidth: n,
  sourceHeight: i,
  targetWidth: o,
  targetHeight: r,
  width: a,
  height: s,
  viewport: l
}) {
  const c = {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x + n, t.x + o),
    y2: Math.max(e.y + i, t.y + r)
  };
  c.x === c.x2 && (c.x2 += 1), c.y === c.y2 && (c.y2 += 1);
  const u = Ri({
    x: (0 - l.x) / l.zoom,
    y: (0 - l.y) / l.zoom,
    width: a / l.zoom,
    height: s / l.zoom
  }), d = Math.max(0, Math.min(u.x2, c.x2) - Math.max(u.x, c.x)), h = Math.max(0, Math.min(u.y2, c.y2) - Math.max(u.y, c.y));
  return Math.ceil(d * h) > 0;
}
function S_(e, t, n = !1) {
  const i = typeof e.zIndex == "number";
  let o = i ? e.zIndex : 0;
  const r = t(e.source), a = t(e.target);
  return !r || !a ? 0 : (n && (o = i ? e.zIndex : Math.max(r.computedPosition.z || 0, a.computedPosition.z || 0)), o);
}
var Ye = /* @__PURE__ */ ((e) => (e.MISSING_STYLES = "MISSING_STYLES", e.MISSING_VIEWPORT_DIMENSIONS = "MISSING_VIEWPORT_DIMENSIONS", e.NODE_INVALID = "NODE_INVALID", e.NODE_NOT_FOUND = "NODE_NOT_FOUND", e.NODE_MISSING_PARENT = "NODE_MISSING_PARENT", e.NODE_TYPE_MISSING = "NODE_TYPE_MISSING", e.NODE_EXTENT_INVALID = "NODE_EXTENT_INVALID", e.EDGE_INVALID = "EDGE_INVALID", e.EDGE_NOT_FOUND = "EDGE_NOT_FOUND", e.EDGE_SOURCE_MISSING = "EDGE_SOURCE_MISSING", e.EDGE_TARGET_MISSING = "EDGE_TARGET_MISSING", e.EDGE_TYPE_MISSING = "EDGE_TYPE_MISSING", e.EDGE_SOURCE_TARGET_SAME = "EDGE_SOURCE_TARGET_SAME", e.EDGE_SOURCE_TARGET_MISSING = "EDGE_SOURCE_TARGET_MISSING", e.EDGE_ORPHANED = "EDGE_ORPHANED", e.USEVUEFLOW_OPTIONS = "USEVUEFLOW_OPTIONS", e))(Ye || {});
const bu = {
  MISSING_STYLES: () => "It seems that you haven't loaded the necessary styles. Please import '@vue-flow/core/dist/style.css' to ensure that the graph is rendered correctly",
  MISSING_VIEWPORT_DIMENSIONS: () => "The Vue Flow parent container needs a width and a height to render the graph",
  NODE_INVALID: (e) => `Node is invalid
Node: ${e}`,
  NODE_NOT_FOUND: (e) => `Node not found
Node: ${e}`,
  NODE_MISSING_PARENT: (e, t) => `Node is missing a parent
Node: ${e}
Parent: ${t}`,
  NODE_TYPE_MISSING: (e) => `Node type is missing
Type: ${e}`,
  NODE_EXTENT_INVALID: (e) => `Only child nodes can use a parent extent
Node: ${e}`,
  EDGE_INVALID: (e) => `An edge needs a source and a target
Edge: ${e}`,
  EDGE_SOURCE_MISSING: (e, t) => `Edge source is missing
Edge: ${e}
Source: ${t}`,
  EDGE_TARGET_MISSING: (e, t) => `Edge target is missing
Edge: ${e}
Target: ${t}`,
  EDGE_TYPE_MISSING: (e) => `Edge type is missing
Type: ${e}`,
  EDGE_SOURCE_TARGET_SAME: (e, t, n) => `Edge source and target are the same
Edge: ${e}
Source: ${t}
Target: ${n}`,
  EDGE_SOURCE_TARGET_MISSING: (e, t, n) => `Edge source or target is missing
Edge: ${e}
Source: ${t}
Target: ${n}`,
  EDGE_ORPHANED: (e) => `Edge was orphaned (suddenly missing source or target) and has been removed
Edge: ${e}`,
  EDGE_NOT_FOUND: (e) => `Edge not found
Edge: ${e}`,
  // deprecation errors
  USEVUEFLOW_OPTIONS: () => "The options parameter is deprecated and will be removed in the next major version. Please use the id parameter instead"
};
class je extends Error {
  constructor(t, ...n) {
    var i;
    super((i = bu[t]) == null ? void 0 : i.call(bu, ...n)), this.name = "VueFlowError", this.code = t, this.args = n;
  }
}
function js(e) {
  return "clientX" in e;
}
function C_(e) {
  return "sourceEvent" in e;
}
function $t(e, t) {
  const n = js(e);
  let i, o;
  return n ? (i = e.clientX, o = e.clientY) : "touches" in e && e.touches.length > 0 ? (i = e.touches[0].clientX, o = e.touches[0].clientY) : "changedTouches" in e && e.changedTouches.length > 0 ? (i = e.changedTouches[0].clientX, o = e.changedTouches[0].clientY) : (i = 0, o = 0), {
    x: i - (t?.left ?? 0),
    y: o - (t?.top ?? 0)
  };
}
const go = () => {
  var e;
  return typeof navigator < "u" && ((e = navigator?.userAgent) == null ? void 0 : e.indexOf("Mac")) >= 0;
};
function N_(e) {
  var t, n;
  return {
    width: ((t = e.dimensions) == null ? void 0 : t.width) ?? e.width ?? 0,
    height: ((n = e.dimensions) == null ? void 0 : n.height) ?? e.height ?? 0
  };
}
function rr(e, t = [1, 1]) {
  return {
    x: t[0] * Math.round(e.x / t[0]),
    y: t[1] * Math.round(e.y / t[1])
  };
}
const I_ = () => !0;
function Dr(e) {
  e?.classList.remove("valid", "connecting", "vue-flow__handle-valid", "vue-flow__handle-connecting");
}
function A_(e, t, n) {
  const i = [], o = {
    x: e.x - n,
    y: e.y - n,
    width: n * 2,
    height: n * 2
  };
  for (const r of t.values())
    Oi(o, Ti(r)) > 0 && i.push(r);
  return i;
}
const M_ = 250;
function T_(e, t, n, i) {
  var o, r;
  let a = [], s = Number.POSITIVE_INFINITY;
  const l = A_(e, n, t + M_);
  for (const c of l) {
    const u = [...((o = c.handleBounds) == null ? void 0 : o.source) ?? [], ...((r = c.handleBounds) == null ? void 0 : r.target) ?? []];
    for (const d of u) {
      if (i.nodeId === d.nodeId && i.type === d.type && i.id === d.id)
        continue;
      const { x: h, y: p } = Rn(c, d, d.position, !0), v = Math.sqrt((h - e.x) ** 2 + (p - e.y) ** 2);
      v > t || (v < s ? (a = [{ ...d, x: h, y: p }], s = v) : v === s && a.push({ ...d, x: h, y: p }));
    }
  }
  if (!a.length)
    return null;
  if (a.length > 1) {
    const c = i.type === "source" ? "target" : "source";
    return a.find((u) => u.type === c) ?? a[0];
  }
  return a[0];
}
function _u(e, {
  handle: t,
  connectionMode: n,
  fromNodeId: i,
  fromHandleId: o,
  fromType: r,
  doc: a,
  lib: s,
  flowId: l,
  isValidConnection: c = I_
}, u, d, h, p) {
  const v = r === "target", g = t ? a.querySelector(`.${s}-flow__handle[data-id="${l}-${t?.nodeId}-${t?.id}-${t?.type}"]`) : null, { x: m, y: k } = $t(e), x = a.elementFromPoint(m, k), w = x?.classList.contains(`${s}-flow__handle`) ? x : g, b = {
    handleDomNode: w,
    isValid: !1,
    connection: null,
    toHandle: null
  };
  if (w) {
    const C = Bf(void 0, w), I = w.getAttribute("data-nodeid"), z = w.getAttribute("data-handleid"), T = w.classList.contains("connectable"), O = w.classList.contains("connectableend");
    if (!I || !C)
      return b;
    const D = {
      source: v ? I : i,
      sourceHandle: v ? z : o,
      target: v ? i : I,
      targetHandle: v ? o : z
    };
    b.connection = D;
    const N = T && O && (n === en.Strict ? v && C === "source" || !v && C === "target" : I !== i || z !== o);
    b.isValid = N && c(D, {
      nodes: d,
      edges: u,
      sourceNode: h(D.source),
      targetNode: h(D.target)
    }), b.toHandle = zf(I, C, z, p, n, !0);
  }
  return b;
}
function Bf(e, t) {
  return e || (t?.classList.contains("target") ? "target" : t?.classList.contains("source") ? "source" : null);
}
function O_(e, t) {
  let n = null;
  return t ? n = "valid" : e && !t && (n = "invalid"), n;
}
function R_(e, t) {
  let n = null;
  return t ? n = !0 : e && !t && (n = !1), n;
}
function zf(e, t, n, i, o, r = !1) {
  var a, s, l;
  const c = i.get(e);
  if (!c)
    return null;
  const u = o === en.Strict ? (a = c.handleBounds) == null ? void 0 : a[t] : [...((s = c.handleBounds) == null ? void 0 : s.source) ?? [], ...((l = c.handleBounds) == null ? void 0 : l.target) ?? []], d = (n ? u?.find((h) => h.id === n) : u?.[0]) ?? null;
  return d && r ? { ...d, ...Rn(c, d, d.position, !0) } : d;
}
const ts = {
  [ge.Left]: ge.Right,
  [ge.Right]: ge.Left,
  [ge.Top]: ge.Bottom,
  [ge.Bottom]: ge.Top
}, D_ = ["production", "prod"];
function No(e, ...t) {
  Ff() && console.warn(`[Vue Flow]: ${e}`, ...t);
}
function Ff() {
  return !D_.includes("production");
}
function ku(e, t, n, i, o) {
  const r = t.querySelectorAll(`.vue-flow__handle.${e}`);
  return r?.length ? Array.from(r).map((a) => {
    const s = a.getBoundingClientRect();
    return {
      id: a.getAttribute("data-handleid"),
      type: e,
      nodeId: o,
      position: a.getAttribute("data-handlepos"),
      x: (s.left - n.left) / i,
      y: (s.top - n.top) / i,
      ...ir(a)
    };
  }) : null;
}
function ns(e, t, n, i, o, r = !1, a) {
  o.value = !1, e.selected ? (r || e.selected && t) && (i([e]), Ve(() => {
    a.blur();
  })) : n([e]);
}
function We(e) {
  return typeof f(e) < "u";
}
function P_(e, t, n, i) {
  if (!e || !e.source || !e.target)
    return n(new je(Ye.EDGE_INVALID, e?.id ?? "[ID UNKNOWN]")), !1;
  let o;
  return tn(e) ? o = e : o = {
    ...e,
    id: Tf(e)
  }, o = Af(o, void 0, i), m_(o, t) ? !1 : o;
}
function L_(e, t, n, i, o) {
  if (!t.source || !t.target)
    return o(new je(Ye.EDGE_INVALID, e.id)), !1;
  if (!n)
    return o(new je(Ye.EDGE_NOT_FOUND, e.id)), !1;
  const { id: r, ...a } = e;
  return {
    ...a,
    id: i ? Tf(t) : r,
    source: t.source,
    target: t.target,
    sourceHandle: t.sourceHandle,
    targetHandle: t.targetHandle
  };
}
function Eu(e, t, n) {
  const i = {}, o = [];
  for (let r = 0; r < e.length; ++r) {
    const a = e[r];
    if (!un(a)) {
      n(
        new je(Ye.NODE_INVALID, a?.id) || `[ID UNKNOWN|INDEX ${r}]`
      );
      continue;
    }
    const s = h_(a, t(a.id), a.parentNode);
    a.parentNode && (i[a.parentNode] = !0), o[r] = s;
  }
  for (const r of o) {
    const a = t(r.parentNode) || o.find((s) => s.id === r.parentNode);
    r.parentNode && !a && n(new je(Ye.NODE_MISSING_PARENT, r.id, r.parentNode)), (r.parentNode || i[r.id]) && (i[r.id] && (r.isParent = !0), a && (a.isParent = !0));
  }
  return o;
}
function xu(e, t, n, i, o, r) {
  let a = o;
  const s = i.get(a) || /* @__PURE__ */ new Map();
  i.set(a, s.set(n, t)), a = `${o}-${e}`;
  const l = i.get(a) || /* @__PURE__ */ new Map();
  if (i.set(a, l.set(n, t)), r) {
    a = `${o}-${e}-${r}`;
    const c = i.get(a) || /* @__PURE__ */ new Map();
    i.set(a, c.set(n, t));
  }
}
function Pr(e, t, n) {
  e.clear();
  for (const i of n) {
    const { source: o, target: r, sourceHandle: a = null, targetHandle: s = null } = i, l = { edgeId: i.id, source: o, target: r, sourceHandle: a, targetHandle: s }, c = `${o}-${a}--${r}-${s}`, u = `${r}-${s}--${o}-${a}`;
    xu("source", l, u, e, o, a), xu("target", l, c, e, r, s);
  }
}
function $u(e, t) {
  if (e.size !== t.size)
    return !1;
  for (const n of e)
    if (!t.has(n))
      return !1;
  return !0;
}
function Lr(e, t, n, i, o, r, a, s) {
  const l = [];
  for (const c of e) {
    const u = tn(c) ? c : P_(c, s, o, r);
    if (!u)
      continue;
    const d = n(u.source), h = n(u.target);
    if (!d || !h) {
      o(new je(Ye.EDGE_SOURCE_TARGET_MISSING, u.id, u.source, u.target));
      continue;
    }
    if (!d) {
      o(new je(Ye.EDGE_SOURCE_MISSING, u.id, u.source));
      continue;
    }
    if (!h) {
      o(new je(Ye.EDGE_TARGET_MISSING, u.id, u.target));
      continue;
    }
    if (t && !t(u, {
      edges: s,
      nodes: a,
      sourceNode: d,
      targetNode: h
    })) {
      o(new je(Ye.EDGE_INVALID, u.id));
      continue;
    }
    const p = i(u.id);
    l.push({
      ...Af(u, p, r),
      sourceNode: d,
      targetNode: h
    });
  }
  return l;
}
const Su = Symbol("vueFlow"), Xs = Symbol("nodeId"), Hf = Symbol("nodeRef"), V_ = Symbol("edgeId"), B_ = Symbol("edgeRef"), ar = Symbol("slots");
function qf(e) {
  const {
    vueFlowRef: t,
    snapToGrid: n,
    snapGrid: i,
    noDragClassName: o,
    nodeLookup: r,
    nodeExtent: a,
    nodeDragThreshold: s,
    viewport: l,
    autoPanOnNodeDrag: c,
    autoPanSpeed: u,
    nodesDraggable: d,
    panBy: h,
    findNode: p,
    multiSelectionActive: v,
    nodesSelectionActive: g,
    selectNodesOnDrag: m,
    removeSelectedElements: k,
    addSelectedNodes: x,
    updateNodePositions: w,
    emits: b
  } = De(), { onStart: C, onDrag: I, onStop: z, onClick: T, el: O, disabled: D, id: B, selectable: N, dragHandle: H } = e, y = nt(!1);
  let E = [], _, L = null, F = { x: void 0, y: void 0 }, J = { x: 0, y: 0 }, X = null, oe = !1, se = !1, W = 0, K = !1;
  const G = Uf(), ee = ({ x: pe, y: me }) => {
    F = { x: pe, y: me };
    let P = !1;
    if (E = E.map((M) => {
      const A = { x: pe - M.distance.x, y: me - M.distance.y }, { computedPosition: q } = Gs(
        M,
        n.value ? rr(A, i.value) : A,
        b.error,
        a.value,
        M.parentNode ? p(M.parentNode) : void 0
      );
      return P = P || M.position.x !== q.x || M.position.y !== q.y, M.position = q, M;
    }), se = se || P, !!P && (w(E, !0, !0), y.value = !0, X)) {
      const [M, A] = Rr({
        id: B,
        dragItems: E,
        findNode: p
      });
      I({ event: X, node: M, nodes: A });
    }
  }, te = () => {
    if (!L)
      return;
    const [pe, me] = Lf(J, L, u.value);
    if (pe !== 0 || me !== 0) {
      const P = {
        x: (F.x ?? 0) - pe / l.value.zoom,
        y: (F.y ?? 0) - me / l.value.zoom
      };
      h({ x: pe, y: me }) && ee(P);
    }
    W = requestAnimationFrame(te);
  }, re = (pe, me) => {
    oe = !0;
    const P = p(B);
    !m.value && !v.value && P && (P.selected || k()), P && Me(N) && m.value && ns(
      P,
      v.value,
      x,
      k,
      g,
      !1,
      me
    );
    const M = G(pe.sourceEvent);
    if (F = M, E = __(r.value, d.value, M, B), E.length) {
      const [A, q] = Rr({
        id: B,
        dragItems: E,
        findNode: p
      });
      C({ event: pe.sourceEvent, node: A, nodes: q });
    }
  }, le = (pe, me) => {
    var P;
    pe.sourceEvent.type === "touchmove" && pe.sourceEvent.touches.length > 1 || (se = !1, s.value === 0 && re(pe, me), F = G(pe.sourceEvent), L = ((P = t.value) == null ? void 0 : P.getBoundingClientRect()) || null, J = $t(pe.sourceEvent, L));
  }, we = (pe, me) => {
    const P = G(pe.sourceEvent);
    if (!K && oe && c.value && (K = !0, te()), !oe) {
      const M = P.xSnapped - (F.x ?? 0), A = P.ySnapped - (F.y ?? 0);
      Math.sqrt(M * M + A * A) > s.value && re(pe, me);
    }
    (F.x !== P.xSnapped || F.y !== P.ySnapped) && E.length && oe && (X = pe.sourceEvent, J = $t(pe.sourceEvent, L), ee(P));
  }, $e = (pe) => {
    let me = !1;
    if (!oe && !y.value && !v.value) {
      const P = pe.sourceEvent, M = G(P), A = M.xSnapped - (F.x ?? 0), q = M.ySnapped - (F.y ?? 0), Q = Math.sqrt(A * A + q * q);
      Q !== 0 && Q <= s.value && (T?.(P), me = !0);
    }
    if (E.length && !me) {
      se && (w(E, !1, !1), se = !1);
      const [P, M] = Rr({
        id: B,
        dragItems: E,
        findNode: p
      });
      z({ event: pe.sourceEvent, node: P, nodes: M });
    }
    E = [], y.value = !1, K = !1, oe = !1, F = { x: void 0, y: void 0 }, cancelAnimationFrame(W);
  };
  return _e([() => Me(D), O], ([pe, me], P, M) => {
    if (me) {
      const A = pt(me);
      pe || (_ = f1().on("start", (q) => le(q, me)).on("drag", (q) => we(q, me)).on("end", (q) => $e(q)).filter((q) => {
        const Q = q.target, de = Me(H);
        return !q.button && (!o.value || !yu(Q, `.${o.value}`, me) && (!de || yu(Q, de, me)));
      }), A.call(_)), M(() => {
        A.on(".drag", null), _ && (_.on("start", null), _.on("drag", null), _.on("end", null));
      });
    }
  }), y;
}
function z_() {
  return {
    doubleClick: he(),
    click: he(),
    mouseEnter: he(),
    mouseMove: he(),
    mouseLeave: he(),
    contextMenu: he(),
    updateStart: he(),
    update: he(),
    updateEnd: he()
  };
}
function F_(e, t) {
  const n = z_();
  return n.doubleClick.on((i) => {
    var o, r;
    t.edgeDoubleClick(i), (r = (o = e.events) == null ? void 0 : o.doubleClick) == null || r.call(o, i);
  }), n.click.on((i) => {
    var o, r;
    t.edgeClick(i), (r = (o = e.events) == null ? void 0 : o.click) == null || r.call(o, i);
  }), n.mouseEnter.on((i) => {
    var o, r;
    t.edgeMouseEnter(i), (r = (o = e.events) == null ? void 0 : o.mouseEnter) == null || r.call(o, i);
  }), n.mouseMove.on((i) => {
    var o, r;
    t.edgeMouseMove(i), (r = (o = e.events) == null ? void 0 : o.mouseMove) == null || r.call(o, i);
  }), n.mouseLeave.on((i) => {
    var o, r;
    t.edgeMouseLeave(i), (r = (o = e.events) == null ? void 0 : o.mouseLeave) == null || r.call(o, i);
  }), n.contextMenu.on((i) => {
    var o, r;
    t.edgeContextMenu(i), (r = (o = e.events) == null ? void 0 : o.contextMenu) == null || r.call(o, i);
  }), n.updateStart.on((i) => {
    var o, r;
    t.edgeUpdateStart(i), (r = (o = e.events) == null ? void 0 : o.updateStart) == null || r.call(o, i);
  }), n.update.on((i) => {
    var o, r;
    t.edgeUpdate(i), (r = (o = e.events) == null ? void 0 : o.update) == null || r.call(o, i);
  }), n.updateEnd.on((i) => {
    var o, r;
    t.edgeUpdateEnd(i), (r = (o = e.events) == null ? void 0 : o.updateEnd) == null || r.call(o, i);
  }), Object.entries(n).reduce(
    (i, [o, r]) => (i.emit[o] = r.trigger, i.on[o] = r.on, i),
    { emit: {}, on: {} }
  );
}
function Uf() {
  const { viewport: e, snapGrid: t, snapToGrid: n, vueFlowRef: i } = De();
  return (o) => {
    var r;
    const a = ((r = i.value) == null ? void 0 : r.getBoundingClientRect()) ?? { left: 0, top: 0 }, s = C_(o) ? o.sourceEvent : o, { x: l, y: c } = $t(s, a), u = vo({ x: l, y: c }, e.value), { x: d, y: h } = n.value ? rr(u, t.value) : u;
    return {
      xSnapped: d,
      ySnapped: h,
      ...u
    };
  };
}
function Yo() {
  return !0;
}
function Wf({
  handleId: e,
  nodeId: t,
  type: n,
  isValidConnection: i,
  edgeUpdaterType: o,
  onEdgeUpdate: r,
  onEdgeUpdateEnd: a
}) {
  const {
    id: s,
    vueFlowRef: l,
    connectionMode: c,
    connectionRadius: u,
    connectOnClick: d,
    connectionClickStartHandle: h,
    nodesConnectable: p,
    autoPanOnConnect: v,
    autoPanSpeed: g,
    findNode: m,
    panBy: k,
    startConnection: x,
    updateConnection: w,
    endConnection: b,
    emits: C,
    viewport: I,
    edges: z,
    nodes: T,
    isValidConnection: O,
    nodeLookup: D
  } = De();
  let B = null, N = !1, H = null;
  function y(_) {
    var L;
    const F = Me(n) === "target", J = js(_), X = cu(_.target), oe = _.currentTarget;
    if (oe && (J && _.button === 0 || !J)) {
      let se = function(be) {
        P = $t(be, $e), ee = T_(
          vo(P, I.value, !1, [1, 1]),
          u.value,
          D.value,
          q
        ), M || (A(), M = !0);
        const Ee = _u(
          be,
          {
            handle: ee,
            connectionMode: c.value,
            fromNodeId: Me(t),
            fromHandleId: Me(e),
            fromType: F ? "target" : "source",
            isValidConnection: G,
            doc: X,
            lib: "vue",
            flowId: s,
            nodeLookup: D.value
          },
          z.value,
          T.value,
          m,
          D.value
        );
        H = Ee.handleDomNode, B = Ee.connection, N = R_(!!ee, Ee.isValid);
        const Se = {
          // from stays the same
          ...ke,
          isValid: N,
          to: Ee.toHandle && N ? po({ x: Ee.toHandle.x, y: Ee.toHandle.y }, I.value) : P,
          toHandle: Ee.toHandle,
          toPosition: N && Ee.toHandle ? Ee.toHandle.position : ts[q.position],
          toNode: Ee.toHandle ? D.value.get(Ee.toHandle.nodeId) : null
        };
        if (N && ee && ke?.toHandle && Se.toHandle && ke.toHandle.type === Se.toHandle.type && ke.toHandle.nodeId === Se.toHandle.nodeId && ke.toHandle.id === Se.toHandle.id && ke.to.x === Se.to.x && ke.to.y === Se.to.y)
          return;
        const Ae = ee ?? Ee.toHandle;
        if (w(
          Ae && N ? po(
            {
              x: Ae.x,
              y: Ae.y
            },
            I.value
          ) : P,
          Ae,
          O_(!!Ae, N)
        ), ke = Se, !ee && !N && !H)
          return Dr(me);
        B && B.source !== B.target && H && (Dr(me), me = H, H.classList.add("connecting", "vue-flow__handle-connecting"), H.classList.toggle("valid", !!N), H.classList.toggle("vue-flow__handle-valid", !!N));
      }, W = function(be) {
        "touches" in be && be.touches.length > 0 || ((ee || H) && B && N && (r ? r(be, B) : C.connect(B)), C.connectEnd(be), o && a?.(be), Dr(me), cancelAnimationFrame(te), b(be), M = !1, N = !1, B = null, H = null, X.removeEventListener("mousemove", se), X.removeEventListener("mouseup", W), X.removeEventListener("touchmove", se), X.removeEventListener("touchend", W));
      };
      const K = m(Me(t));
      let G = Me(i) || O.value || Yo;
      !G && K && (G = (F ? K.isValidSourcePos : K.isValidTargetPos) || Yo);
      let ee, te = 0;
      const { x: re, y: le } = $t(_), we = Bf(Me(o), oe), $e = (L = l.value) == null ? void 0 : L.getBoundingClientRect();
      if (!$e || !we)
        return;
      const pe = zf(Me(t), we, Me(e), D.value, c.value);
      if (!pe)
        return;
      let me, P = $t(_, $e), M = !1;
      const A = () => {
        if (!v.value)
          return;
        const [be, Ee] = Lf(P, $e, g.value);
        k({ x: be, y: Ee }), te = requestAnimationFrame(A);
      }, q = {
        ...pe,
        nodeId: Me(t),
        type: we,
        position: pe.position
      }, Q = D.value.get(Me(t)), ve = {
        inProgress: !0,
        isValid: null,
        from: Rn(Q, q, ge.Left, !0),
        fromHandle: q,
        fromPosition: q.position,
        fromNode: Q,
        to: P,
        toHandle: null,
        toPosition: ts[q.position],
        toNode: null
      };
      x(
        {
          nodeId: Me(t),
          id: Me(e),
          type: we,
          position: oe?.getAttribute("data-handlepos") || ge.Top,
          ...P
        },
        {
          x: re - $e.left,
          y: le - $e.top
        }
      ), C.connectStart({ event: _, nodeId: Me(t), handleId: Me(e), handleType: we });
      let ke = ve;
      X.addEventListener("mousemove", se), X.addEventListener("mouseup", W), X.addEventListener("touchmove", se), X.addEventListener("touchend", W);
    }
  }
  function E(_) {
    var L, F;
    if (!d.value)
      return;
    const J = Me(n) === "target";
    if (!h.value) {
      C.clickConnectStart({ event: _, nodeId: Me(t), handleId: Me(e) }), x(
        {
          nodeId: Me(t),
          type: Me(n),
          id: Me(e),
          position: ge.Top,
          ...$t(_)
        },
        void 0,
        !0
      );
      return;
    }
    let X = Me(i) || O.value || Yo;
    const oe = m(Me(t));
    if (!X && oe && (X = (J ? oe.isValidSourcePos : oe.isValidTargetPos) || Yo), oe && (typeof oe.connectable > "u" ? p.value : oe.connectable) === !1)
      return;
    const se = cu(_.target), W = _u(
      _,
      {
        handle: {
          nodeId: Me(t),
          id: Me(e),
          type: Me(n),
          position: ge.Top,
          ...$t(_)
        },
        connectionMode: c.value,
        fromNodeId: h.value.nodeId,
        fromHandleId: h.value.id ?? null,
        fromType: h.value.type,
        isValidConnection: X,
        doc: se,
        lib: "vue",
        flowId: s,
        nodeLookup: D.value
      },
      z.value,
      T.value,
      m,
      D.value
    ), K = ((L = W.connection) == null ? void 0 : L.source) === ((F = W.connection) == null ? void 0 : F.target);
    W.isValid && W.connection && !K && C.connect(W.connection), C.clickConnectEnd(_), b(_, !0);
  }
  return {
    handlePointerDown: y,
    handleClick: E
  };
}
function H_() {
  return Ht(Xs, "");
}
function Yf(e) {
  const t = e ?? H_() ?? "", n = Ht(Hf, Y(null)), { findNode: i, edges: o, emits: r } = De(), a = i(t);
  return a || r.error(new je(Ye.NODE_NOT_FOUND, t)), {
    id: t,
    nodeEl: n,
    node: a,
    parentNode: U(() => i(a.parentNode)),
    connectedEdges: U(() => on([a], o.value))
  };
}
function q_() {
  return {
    doubleClick: he(),
    click: he(),
    mouseEnter: he(),
    mouseMove: he(),
    mouseLeave: he(),
    contextMenu: he(),
    dragStart: he(),
    drag: he(),
    dragStop: he()
  };
}
function U_(e, t) {
  const n = q_();
  return n.doubleClick.on((i) => {
    var o, r;
    t.nodeDoubleClick(i), (r = (o = e.events) == null ? void 0 : o.doubleClick) == null || r.call(o, i);
  }), n.click.on((i) => {
    var o, r;
    t.nodeClick(i), (r = (o = e.events) == null ? void 0 : o.click) == null || r.call(o, i);
  }), n.mouseEnter.on((i) => {
    var o, r;
    t.nodeMouseEnter(i), (r = (o = e.events) == null ? void 0 : o.mouseEnter) == null || r.call(o, i);
  }), n.mouseMove.on((i) => {
    var o, r;
    t.nodeMouseMove(i), (r = (o = e.events) == null ? void 0 : o.mouseMove) == null || r.call(o, i);
  }), n.mouseLeave.on((i) => {
    var o, r;
    t.nodeMouseLeave(i), (r = (o = e.events) == null ? void 0 : o.mouseLeave) == null || r.call(o, i);
  }), n.contextMenu.on((i) => {
    var o, r;
    t.nodeContextMenu(i), (r = (o = e.events) == null ? void 0 : o.contextMenu) == null || r.call(o, i);
  }), n.dragStart.on((i) => {
    var o, r;
    t.nodeDragStart(i), (r = (o = e.events) == null ? void 0 : o.dragStart) == null || r.call(o, i);
  }), n.drag.on((i) => {
    var o, r;
    t.nodeDrag(i), (r = (o = e.events) == null ? void 0 : o.drag) == null || r.call(o, i);
  }), n.dragStop.on((i) => {
    var o, r;
    t.nodeDragStop(i), (r = (o = e.events) == null ? void 0 : o.dragStop) == null || r.call(o, i);
  }), Object.entries(n).reduce(
    (i, [o, r]) => (i.emit[o] = r.trigger, i.on[o] = r.on, i),
    { emit: {}, on: {} }
  );
}
function Gf() {
  const { getSelectedNodes: e, nodeExtent: t, updateNodePositions: n, findNode: i, snapGrid: o, snapToGrid: r, nodesDraggable: a, emits: s } = De();
  return (l, c = !1) => {
    const u = r.value ? o.value[0] : 5, d = r.value ? o.value[1] : 5, h = c ? 4 : 1, p = l.x * u * h, v = l.y * d * h, g = [];
    for (const m of e.value)
      if (m.draggable || a && typeof m.draggable > "u") {
        const k = { x: m.computedPosition.x + p, y: m.computedPosition.y + v }, { position: x } = Gs(
          m,
          k,
          s.error,
          t.value,
          m.parentNode ? i(m.parentNode) : void 0
        );
        g.push({
          id: m.id,
          position: x,
          from: m.position,
          distance: { x: l.x, y: l.y },
          dimensions: m.dimensions
        });
      }
    n(g, !0, !1);
  };
}
const Go = 0.1, W_ = (e) => ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
function Ut() {
  return No("Viewport not initialized yet."), Promise.resolve(!1);
}
const Y_ = {
  zoomIn: Ut,
  zoomOut: Ut,
  zoomTo: Ut,
  fitView: Ut,
  setCenter: Ut,
  fitBounds: Ut,
  project: (e) => e,
  screenToFlowCoordinate: (e) => e,
  flowToScreenCoordinate: (e) => e,
  setViewport: Ut,
  setTransform: Ut,
  getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
  getTransform: () => ({ x: 0, y: 0, zoom: 1 }),
  viewportInitialized: !1
};
function G_(e) {
  function t(i, o) {
    return new Promise((r) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.interpolate(o?.interpolate === "linear" ? eo : si).scaleBy(
        Vr(e.d3Selection, o?.duration, o?.ease, () => {
          r(!0);
        }),
        i
      ) : r(!1);
    });
  }
  function n(i, o, r, a) {
    return new Promise((s) => {
      var l;
      const { x: c, y: u } = If({ x: -i, y: -o }, e.translateExtent), d = On.translate(-c, -u).scale(r);
      e.d3Selection && e.d3Zoom ? (l = e.d3Zoom) == null || l.interpolate(a?.interpolate === "linear" ? eo : si).transform(
        Vr(e.d3Selection, a?.duration, a?.ease, () => {
          s(!0);
        }),
        d
      ) : s(!1);
    });
  }
  return U(() => e.d3Zoom && e.d3Selection && e.dimensions.width && e.dimensions.height ? {
    viewportInitialized: !0,
    // todo: allow passing scale as option
    zoomIn: (o) => t(1.2, o),
    zoomOut: (o) => t(1 / 1.2, o),
    zoomTo: (o, r) => new Promise((a) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.interpolate(r?.interpolate === "linear" ? eo : si).scaleTo(
        Vr(e.d3Selection, r?.duration, r?.ease, () => {
          a(!0);
        }),
        o
      ) : a(!1);
    }),
    setViewport: (o, r) => n(o.x, o.y, o.zoom, r),
    setTransform: (o, r) => n(o.x, o.y, o.zoom, r),
    getViewport: () => ({
      x: e.viewport.x,
      y: e.viewport.y,
      zoom: e.viewport.zoom
    }),
    getTransform: () => ({
      x: e.viewport.x,
      y: e.viewport.y,
      zoom: e.viewport.zoom
    }),
    fitView: (o = {
      padding: Go,
      includeHiddenNodes: !1,
      duration: 0
    }) => {
      var r, a;
      const s = [];
      for (const h of e.nodes)
        h.dimensions.width && h.dimensions.height && (o?.includeHiddenNodes || !h.hidden) && (!((r = o.nodes) != null && r.length) || (a = o.nodes) != null && a.length && o.nodes.includes(h.id)) && s.push(h);
      if (!s.length)
        return Promise.resolve(!1);
      const l = Ys(s), { x: c, y: u, zoom: d } = du(
        l,
        e.dimensions.width,
        e.dimensions.height,
        o.minZoom ?? e.minZoom,
        o.maxZoom ?? e.maxZoom,
        o.padding ?? Go
      );
      return n(c, u, d, o);
    },
    setCenter: (o, r, a) => {
      const s = typeof a?.zoom < "u" ? a.zoom : e.maxZoom, l = e.dimensions.width / 2 - o * s, c = e.dimensions.height / 2 - r * s;
      return n(l, c, s, a);
    },
    fitBounds: (o, r = { padding: Go }) => {
      const { x: a, y: s, zoom: l } = du(
        o,
        e.dimensions.width,
        e.dimensions.height,
        e.minZoom,
        e.maxZoom,
        r.padding ?? Go
      );
      return n(a, s, l, r);
    },
    project: (o) => vo(o, e.viewport, e.snapToGrid, e.snapGrid),
    screenToFlowCoordinate: (o) => {
      if (e.vueFlowRef) {
        const { x: r, y: a } = e.vueFlowRef.getBoundingClientRect(), s = {
          x: o.x - r,
          y: o.y - a
        };
        return vo(s, e.viewport, e.snapToGrid, e.snapGrid);
      }
      return { x: 0, y: 0 };
    },
    flowToScreenCoordinate: (o) => {
      if (e.vueFlowRef) {
        const { x: r, y: a } = e.vueFlowRef.getBoundingClientRect(), s = {
          x: o.x + r,
          y: o.y + a
        };
        return po(s, e.viewport);
      }
      return { x: 0, y: 0 };
    }
  } : Y_);
}
function Vr(e, t = 0, n = W_, i = () => {
}) {
  const o = typeof t == "number" && t > 0;
  return o || i(), o ? e.transition().duration(t).ease(n).on("end", i) : e;
}
function j_(e, t, n) {
  const i = vd(!0);
  return i.run(() => {
    const o = () => {
      i.run(() => {
        let g, m, k = !!(n.nodes.value.length || n.edges.value.length);
        g = _n([e.modelValue, () => {
          var x, w;
          return (w = (x = e.modelValue) == null ? void 0 : x.value) == null ? void 0 : w.length;
        }], ([x]) => {
          x && Array.isArray(x) && (m?.pause(), n.setElements(x), !m && !k && x.length ? k = !0 : m?.resume());
        }), m = _n(
          [n.nodes, n.edges, () => n.edges.value.length, () => n.nodes.value.length],
          ([x, w]) => {
            var b;
            (b = e.modelValue) != null && b.value && Array.isArray(e.modelValue.value) && (g?.pause(), e.modelValue.value = [...x, ...w], Ve(() => {
              g?.resume();
            }));
          },
          { immediate: k }
        ), ii(() => {
          g?.stop(), m?.stop();
        });
      });
    }, r = () => {
      i.run(() => {
        let g, m, k = !!n.nodes.value.length;
        g = _n([e.nodes, () => {
          var x, w;
          return (w = (x = e.nodes) == null ? void 0 : x.value) == null ? void 0 : w.length;
        }], ([x]) => {
          x && Array.isArray(x) && (m?.pause(), n.setNodes(x), !m && !k && x.length ? k = !0 : m?.resume());
        }), m = _n(
          [n.nodes, () => n.nodes.value.length],
          ([x]) => {
            var w;
            (w = e.nodes) != null && w.value && Array.isArray(e.nodes.value) && (g?.pause(), e.nodes.value = [...x], Ve(() => {
              g?.resume();
            }));
          },
          { immediate: k }
        ), ii(() => {
          g?.stop(), m?.stop();
        });
      });
    }, a = () => {
      i.run(() => {
        let g, m, k = !!n.edges.value.length;
        g = _n([e.edges, () => {
          var x, w;
          return (w = (x = e.edges) == null ? void 0 : x.value) == null ? void 0 : w.length;
        }], ([x]) => {
          x && Array.isArray(x) && (m?.pause(), n.setEdges(x), !m && !k && x.length ? k = !0 : m?.resume());
        }), m = _n(
          [n.edges, () => n.edges.value.length],
          ([x]) => {
            var w;
            (w = e.edges) != null && w.value && Array.isArray(e.edges.value) && (g?.pause(), e.edges.value = [...x], Ve(() => {
              g?.resume();
            }));
          },
          { immediate: k }
        ), ii(() => {
          g?.stop(), m?.stop();
        });
      });
    }, s = () => {
      i.run(() => {
        _e(
          () => t.maxZoom,
          () => {
            t.maxZoom && We(t.maxZoom) && n.setMaxZoom(t.maxZoom);
          },
          {
            immediate: !0
          }
        );
      });
    }, l = () => {
      i.run(() => {
        _e(
          () => t.minZoom,
          () => {
            t.minZoom && We(t.minZoom) && n.setMinZoom(t.minZoom);
          },
          { immediate: !0 }
        );
      });
    }, c = () => {
      i.run(() => {
        _e(
          () => t.translateExtent,
          () => {
            t.translateExtent && We(t.translateExtent) && n.setTranslateExtent(t.translateExtent);
          },
          {
            immediate: !0
          }
        );
      });
    }, u = () => {
      i.run(() => {
        _e(
          () => t.nodeExtent,
          () => {
            t.nodeExtent && We(t.nodeExtent) && n.setNodeExtent(t.nodeExtent);
          },
          {
            immediate: !0
          }
        );
      });
    }, d = () => {
      i.run(() => {
        _e(
          () => t.applyDefault,
          () => {
            We(t.applyDefault) && (n.applyDefault.value = t.applyDefault);
          },
          {
            immediate: !0
          }
        );
      });
    }, h = () => {
      i.run(() => {
        const g = async (m) => {
          let k = m;
          typeof t.autoConnect == "function" && (k = await t.autoConnect(m)), k !== !1 && n.addEdges([k]);
        };
        _e(
          () => t.autoConnect,
          () => {
            We(t.autoConnect) && (n.autoConnect.value = t.autoConnect);
          },
          { immediate: !0 }
        ), _e(
          n.autoConnect,
          (m, k, x) => {
            m ? n.onConnect(g) : n.hooks.value.connect.off(g), x(() => {
              n.hooks.value.connect.off(g);
            });
          },
          { immediate: !0 }
        );
      });
    }, p = () => {
      const g = [
        "id",
        "modelValue",
        "translateExtent",
        "nodeExtent",
        "edges",
        "nodes",
        "maxZoom",
        "minZoom",
        "applyDefault",
        "autoConnect"
      ];
      for (const m of Object.keys(t)) {
        const k = m;
        if (!g.includes(k)) {
          const x = Ne(() => t[k]), w = n[k];
          Ss(w) && i.run(() => {
            _e(
              x,
              (b) => {
                We(b) && (w.value = b);
              },
              { immediate: !0 }
            );
          });
        }
      }
    };
    (() => {
      o(), r(), a(), l(), s(), c(), u(), d(), h(), p();
    })();
  }), () => i.stop();
}
function X_() {
  return {
    edgesChange: he(),
    nodesChange: he(),
    nodeDoubleClick: he(),
    nodeClick: he(),
    nodeMouseEnter: he(),
    nodeMouseMove: he(),
    nodeMouseLeave: he(),
    nodeContextMenu: he(),
    nodeDragStart: he(),
    nodeDrag: he(),
    nodeDragStop: he(),
    nodesInitialized: he(),
    miniMapNodeClick: he(),
    miniMapNodeDoubleClick: he(),
    miniMapNodeMouseEnter: he(),
    miniMapNodeMouseMove: he(),
    miniMapNodeMouseLeave: he(),
    connect: he(),
    connectStart: he(),
    connectEnd: he(),
    clickConnectStart: he(),
    clickConnectEnd: he(),
    paneReady: he(),
    init: he(),
    move: he(),
    moveStart: he(),
    moveEnd: he(),
    selectionDragStart: he(),
    selectionDrag: he(),
    selectionDragStop: he(),
    selectionContextMenu: he(),
    selectionStart: he(),
    selectionEnd: he(),
    viewportChangeStart: he(),
    viewportChange: he(),
    viewportChangeEnd: he(),
    paneScroll: he(),
    paneClick: he(),
    paneContextMenu: he(),
    paneMouseEnter: he(),
    paneMouseMove: he(),
    paneMouseLeave: he(),
    edgeContextMenu: he(),
    edgeMouseEnter: he(),
    edgeMouseMove: he(),
    edgeMouseLeave: he(),
    edgeDoubleClick: he(),
    edgeClick: he(),
    edgeUpdateStart: he(),
    edgeUpdate: he(),
    edgeUpdateEnd: he(),
    updateNodeInternals: he(),
    error: he((e) => No(e.message))
  };
}
function K_(e, t) {
  const n = Vn();
  zm(() => {
    for (const [o, r] of Object.entries(t.value)) {
      const a = (s) => {
        e(o, s);
      };
      r.setEmitter(a), lo(r.removeEmitter), r.setHasEmitListeners(() => i(o)), lo(r.removeHasEmitListeners);
    }
  });
  function i(o) {
    var r;
    const a = Z_(o);
    return !!((r = n?.vnode.props) == null ? void 0 : r[a]);
  }
}
function Z_(e) {
  const [t, ...n] = e.split(":");
  return `on${t.replace(/(?:^|-)(\w)/g, (o, r) => r.toUpperCase())}${n.length ? `:${n.join(":")}` : ""}`;
}
function jf() {
  return {
    vueFlowRef: null,
    viewportRef: null,
    nodes: [],
    edges: [],
    connectionLookup: /* @__PURE__ */ new Map(),
    nodeTypes: {},
    edgeTypes: {},
    initialized: !1,
    dimensions: {
      width: 0,
      height: 0
    },
    viewport: { x: 0, y: 0, zoom: 1 },
    d3Zoom: null,
    d3Selection: null,
    d3ZoomHandler: null,
    minZoom: 0.5,
    maxZoom: 2,
    translateExtent: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    ],
    nodeExtent: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    ],
    selectionMode: Ws.Full,
    paneDragging: !1,
    preventScrolling: !0,
    zoomOnScroll: !0,
    zoomOnPinch: !0,
    zoomOnDoubleClick: !0,
    panOnScroll: !1,
    panOnScrollSpeed: 0.5,
    panOnScrollMode: to.Free,
    paneClickDistance: 0,
    panOnDrag: !0,
    edgeUpdaterRadius: 10,
    onlyRenderVisibleElements: !1,
    defaultViewport: { x: 0, y: 0, zoom: 1 },
    nodesSelectionActive: !1,
    userSelectionActive: !1,
    userSelectionRect: null,
    defaultMarkerColor: "#b1b1b7",
    connectionLineStyle: {},
    connectionLineType: null,
    connectionLineOptions: {
      type: nn.Bezier,
      style: {}
    },
    connectionMode: en.Loose,
    connectionStartHandle: null,
    connectionEndHandle: null,
    connectionClickStartHandle: null,
    connectionPosition: { x: Number.NaN, y: Number.NaN },
    connectionRadius: 20,
    connectOnClick: !0,
    connectionStatus: null,
    isValidConnection: null,
    snapGrid: [15, 15],
    snapToGrid: !1,
    edgesUpdatable: !1,
    edgesFocusable: !0,
    nodesFocusable: !0,
    nodesConnectable: !0,
    nodesDraggable: !0,
    nodeDragThreshold: 1,
    elementsSelectable: !0,
    selectNodesOnDrag: !0,
    multiSelectionActive: !1,
    selectionKeyCode: "Shift",
    multiSelectionKeyCode: go() ? "Meta" : "Control",
    zoomActivationKeyCode: go() ? "Meta" : "Control",
    deleteKeyCode: "Backspace",
    panActivationKeyCode: "Space",
    hooks: X_(),
    applyDefault: !0,
    autoConnect: !1,
    fitViewOnInit: !1,
    fitViewOnInitDone: !1,
    noDragClassName: "nodrag",
    noWheelClassName: "nowheel",
    noPanClassName: "nopan",
    defaultEdgeOptions: void 0,
    elevateEdgesOnSelect: !1,
    elevateNodesOnSelect: !0,
    autoPanOnNodeDrag: !0,
    autoPanOnConnect: !0,
    autoPanSpeed: 15,
    disableKeyboardA11y: !1,
    ariaLiveMessage: ""
  };
}
const J_ = [
  "id",
  "vueFlowRef",
  "viewportRef",
  "initialized",
  "modelValue",
  "nodes",
  "edges",
  "maxZoom",
  "minZoom",
  "translateExtent",
  "hooks",
  "defaultEdgeOptions"
];
function Q_(e, t, n) {
  const i = G_(e), o = (P) => {
    const M = P ?? [];
    e.hooks.updateNodeInternals.trigger(M);
  }, r = (P) => v_(P, e.nodes, e.edges), a = (P) => p_(P, e.nodes, e.edges), s = (P) => on(P, e.edges), l = ({ id: P, type: M, nodeId: A }) => {
    var q;
    const Q = P ? `-${M}-${P}` : `-${M}`;
    return Array.from(((q = e.connectionLookup.get(`${A}${Q}`)) == null ? void 0 : q.values()) ?? []);
  }, c = (P) => {
    if (P)
      return t.value.get(P);
  }, u = (P) => {
    if (P)
      return n.value.get(P);
  }, d = (P, M, A) => {
    var q, Q;
    const de = [];
    for (const ve of P) {
      const ke = {
        id: ve.id,
        type: "position",
        dragging: A,
        from: ve.from
      };
      if (M && (ke.position = ve.position, ve.parentNode)) {
        const be = c(ve.parentNode);
        ke.position = {
          x: ke.position.x - (((q = be?.computedPosition) == null ? void 0 : q.x) ?? 0),
          y: ke.position.y - (((Q = be?.computedPosition) == null ? void 0 : Q.y) ?? 0)
        };
      }
      de.push(ke);
    }
    de?.length && e.hooks.nodesChange.trigger(de);
  }, h = (P) => {
    if (!e.vueFlowRef)
      return;
    const M = e.vueFlowRef.querySelector(".vue-flow__transformationpane");
    if (!M)
      return;
    const A = window.getComputedStyle(M), { m22: q } = new window.DOMMatrixReadOnly(A.transform), Q = [];
    for (const de of P) {
      const ve = de, ke = c(ve.id);
      if (ke) {
        const be = ir(ve.nodeElement);
        if (!!(be.width && be.height && (ke.dimensions.width !== be.width || ke.dimensions.height !== be.height || ve.forceUpdate))) {
          const Se = ve.nodeElement.getBoundingClientRect();
          ke.dimensions = be, ke.handleBounds.source = ku("source", ve.nodeElement, Se, q, ke.id), ke.handleBounds.target = ku("target", ve.nodeElement, Se, q, ke.id), Q.push({
            id: ke.id,
            type: "dimensions",
            dimensions: be
          });
        }
      }
    }
    !e.fitViewOnInitDone && e.fitViewOnInit && i.value.fitView().then(() => {
      e.fitViewOnInitDone = !0;
    }), Q.length && e.hooks.nodesChange.trigger(Q);
  }, p = (P, M) => {
    const A = /* @__PURE__ */ new Set(), q = /* @__PURE__ */ new Set();
    for (const ve of P)
      un(ve) ? A.add(ve.id) : tn(ve) && q.add(ve.id);
    const Q = Gt(t.value, A, !0), de = Gt(n.value, q);
    if (e.multiSelectionActive) {
      for (const ve of A)
        Q.push(Wt(ve, M));
      for (const ve of q)
        de.push(Wt(ve, M));
    }
    Q.length && e.hooks.nodesChange.trigger(Q), de.length && e.hooks.edgesChange.trigger(de);
  }, v = (P) => {
    if (e.multiSelectionActive) {
      const M = P.map((A) => Wt(A.id, !0));
      e.hooks.nodesChange.trigger(M);
      return;
    }
    e.hooks.nodesChange.trigger(Gt(t.value, new Set(P.map((M) => M.id)), !0)), e.hooks.edgesChange.trigger(Gt(n.value));
  }, g = (P) => {
    if (e.multiSelectionActive) {
      const M = P.map((A) => Wt(A.id, !0));
      e.hooks.edgesChange.trigger(M);
      return;
    }
    e.hooks.edgesChange.trigger(Gt(n.value, new Set(P.map((M) => M.id)))), e.hooks.nodesChange.trigger(Gt(t.value, /* @__PURE__ */ new Set(), !0));
  }, m = (P) => {
    p(P, !0);
  }, k = (P) => {
    const A = (P || e.nodes).map((q) => (q.selected = !1, Wt(q.id, !1)));
    e.hooks.nodesChange.trigger(A);
  }, x = (P) => {
    const A = (P || e.edges).map((q) => (q.selected = !1, Wt(q.id, !1)));
    e.hooks.edgesChange.trigger(A);
  }, w = (P) => {
    if (!P || !P.length)
      return p([], !1);
    const M = P.reduce(
      (A, q) => {
        const Q = Wt(q.id, !1);
        return un(q) ? A.nodes.push(Q) : A.edges.push(Q), A;
      },
      { nodes: [], edges: [] }
    );
    M.nodes.length && e.hooks.nodesChange.trigger(M.nodes), M.edges.length && e.hooks.edgesChange.trigger(M.edges);
  }, b = (P) => {
    var M;
    (M = e.d3Zoom) == null || M.scaleExtent([P, e.maxZoom]), e.minZoom = P;
  }, C = (P) => {
    var M;
    (M = e.d3Zoom) == null || M.scaleExtent([e.minZoom, P]), e.maxZoom = P;
  }, I = (P) => {
    var M;
    (M = e.d3Zoom) == null || M.translateExtent(P), e.translateExtent = P;
  }, z = (P) => {
    e.nodeExtent = P, o();
  }, T = (P) => {
    var M;
    (M = e.d3Zoom) == null || M.clickDistance(P);
  }, O = (P) => {
    e.nodesDraggable = P, e.nodesConnectable = P, e.elementsSelectable = P;
  }, D = (P) => {
    const M = P instanceof Function ? P(e.nodes) : P;
    !e.initialized && !M.length || (e.nodes = Eu(M, c, e.hooks.error.trigger));
  }, B = (P) => {
    const M = P instanceof Function ? P(e.edges) : P;
    if (!e.initialized && !M.length)
      return;
    const A = Lr(
      M,
      e.isValidConnection,
      c,
      u,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    );
    Pr(e.connectionLookup, n.value, A), e.edges = A;
  }, N = (P) => {
    const M = P instanceof Function ? P([...e.nodes, ...e.edges]) : P;
    !e.initialized && !M.length || (D(M.filter(un)), B(M.filter(tn)));
  }, H = (P) => {
    let M = P instanceof Function ? P(e.nodes) : P;
    M = Array.isArray(M) ? M : [M];
    const A = Eu(M, c, e.hooks.error.trigger), q = [];
    for (const Q of A)
      q.push(pu(Q));
    q.length && e.hooks.nodesChange.trigger(q);
  }, y = (P) => {
    let M = P instanceof Function ? P(e.edges) : P;
    M = Array.isArray(M) ? M : [M];
    const A = Lr(
      M,
      e.isValidConnection,
      c,
      u,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    ), q = [];
    for (const Q of A)
      q.push(pu(Q));
    q.length && e.hooks.edgesChange.trigger(q);
  }, E = (P, M = !0, A = !1) => {
    const q = P instanceof Function ? P(e.nodes) : P, Q = Array.isArray(q) ? q : [q], de = [], ve = [];
    function ke(Ee) {
      const Se = s(Ee);
      for (const Ae of Se)
        (!We(Ae.deletable) || Ae.deletable) && ve.push(mu(Ae.id, Ae.source, Ae.target, Ae.sourceHandle, Ae.targetHandle));
    }
    function be(Ee) {
      const Se = [];
      for (const Ae of e.nodes)
        Ae.parentNode === Ee && Se.push(Ae);
      if (Se.length) {
        for (const Ae of Se)
          de.push(vu(Ae.id));
        M && ke(Se);
        for (const Ae of Se)
          be(Ae.id);
      }
    }
    for (const Ee of Q) {
      const Se = typeof Ee == "string" ? c(Ee) : Ee;
      Se && (We(Se.deletable) && !Se.deletable || (de.push(vu(Se.id)), M && ke([Se]), A && be(Se.id)));
    }
    ve.length && e.hooks.edgesChange.trigger(ve), de.length && e.hooks.nodesChange.trigger(de);
  }, _ = (P) => {
    const M = P instanceof Function ? P(e.edges) : P, A = Array.isArray(M) ? M : [M], q = [];
    for (const Q of A) {
      const de = typeof Q == "string" ? u(Q) : Q;
      de && (We(de.deletable) && !de.deletable || q.push(
        mu(
          typeof Q == "string" ? Q : Q.id,
          de.source,
          de.target,
          de.sourceHandle,
          de.targetHandle
        )
      ));
    }
    e.hooks.edgesChange.trigger(q);
  }, L = (P, M, A = !0) => {
    const q = u(P.id);
    if (!q)
      return !1;
    const Q = e.edges.indexOf(q), de = L_(P, M, q, A, e.hooks.error.trigger);
    if (de) {
      const [ve] = Lr(
        [de],
        e.isValidConnection,
        c,
        u,
        e.hooks.error.trigger,
        e.defaultEdgeOptions,
        e.nodes,
        e.edges
      );
      return e.edges = e.edges.map((ke, be) => be === Q ? ve : ke), Pr(e.connectionLookup, n.value, [ve]), ve;
    }
    return !1;
  }, F = (P, M, A = { replace: !1 }) => {
    const q = u(P);
    if (!q)
      return;
    const Q = typeof M == "function" ? M(q) : M;
    q.data = A.replace ? Q : { ...q.data, ...Q };
  }, J = (P) => hu(P, e.nodes), X = (P) => {
    const M = hu(P, e.edges);
    return Pr(e.connectionLookup, n.value, M), M;
  }, oe = (P, M, A = { replace: !1 }) => {
    const q = c(P);
    if (!q)
      return;
    const Q = typeof M == "function" ? M(q) : M;
    A.replace ? e.nodes.splice(e.nodes.indexOf(q), 1, Q) : Object.assign(q, Q);
  }, se = (P, M, A = { replace: !1 }) => {
    const q = c(P);
    if (!q)
      return;
    const Q = typeof M == "function" ? M(q) : M;
    q.data = A.replace ? Q : { ...q.data, ...Q };
  }, W = (P, M, A = !1) => {
    A ? e.connectionClickStartHandle = P : e.connectionStartHandle = P, e.connectionEndHandle = null, e.connectionStatus = null, M && (e.connectionPosition = M);
  }, K = (P, M = null, A = null) => {
    e.connectionStartHandle && (e.connectionPosition = P, e.connectionEndHandle = M, e.connectionStatus = A);
  }, G = (P, M) => {
    e.connectionPosition = { x: Number.NaN, y: Number.NaN }, e.connectionEndHandle = null, e.connectionStatus = null, M ? e.connectionClickStartHandle = null : e.connectionStartHandle = null;
  }, ee = (P) => {
    const M = f_(P), A = M ? null : Xn(P) ? P : c(P.id);
    return !M && !A ? [null, null, M] : [M ? P : Ti(A), A, M];
  }, te = (P, M = !0, A = e.nodes) => {
    const [q, Q, de] = ee(P);
    if (!q)
      return [];
    const ve = [];
    for (const ke of A || e.nodes) {
      if (!de && (ke.id === Q.id || !ke.computedPosition))
        continue;
      const be = Ti(ke), Ee = Oi(be, q);
      (M && Ee > 0 || Ee >= be.width * be.height || Ee >= Number(q.width) * Number(q.height)) && ve.push(ke);
    }
    return ve;
  }, re = (P, M, A = !0) => {
    const [q] = ee(P);
    if (!q)
      return !1;
    const Q = Oi(q, M);
    return A && Q > 0 || Q >= Number(q.width) * Number(q.height);
  }, le = (P) => {
    const { viewport: M, dimensions: A, d3Zoom: q, d3Selection: Q, translateExtent: de } = e;
    if (!q || !Q || !P.x && !P.y)
      return !1;
    const ve = On.translate(M.x + P.x, M.y + P.y).scale(M.zoom), ke = [
      [0, 0],
      [A.width, A.height]
    ], be = q.constrain()(ve, ke, de), Ee = e.viewport.x !== be.x || e.viewport.y !== be.y || e.viewport.zoom !== be.k;
    return q.transform(Q, be), Ee;
  }, we = (P) => {
    const M = P instanceof Function ? P(e) : P, A = [
      "d3Zoom",
      "d3Selection",
      "d3ZoomHandler",
      "viewportRef",
      "vueFlowRef",
      "dimensions",
      "hooks"
    ];
    We(M.defaultEdgeOptions) && (e.defaultEdgeOptions = M.defaultEdgeOptions);
    const q = M.modelValue || M.nodes || M.edges ? [] : void 0;
    q && (M.modelValue && q.push(...M.modelValue), M.nodes && q.push(...M.nodes), M.edges && q.push(...M.edges), N(q));
    const Q = () => {
      We(M.maxZoom) && C(M.maxZoom), We(M.minZoom) && b(M.minZoom), We(M.translateExtent) && I(M.translateExtent);
    };
    for (const de of Object.keys(M)) {
      const ve = de, ke = M[ve];
      ![...J_, ...A].includes(ve) && We(ke) && (e[ve] = ke);
    }
    Ua(() => e.d3Zoom).not.toBeNull().then(Q), e.initialized || (e.initialized = !0);
  };
  return {
    updateNodePositions: d,
    updateNodeDimensions: h,
    setElements: N,
    setNodes: D,
    setEdges: B,
    addNodes: H,
    addEdges: y,
    removeNodes: E,
    removeEdges: _,
    findNode: c,
    findEdge: u,
    updateEdge: L,
    updateEdgeData: F,
    updateNode: oe,
    updateNodeData: se,
    applyEdgeChanges: X,
    applyNodeChanges: J,
    addSelectedElements: m,
    addSelectedNodes: v,
    addSelectedEdges: g,
    setMinZoom: b,
    setMaxZoom: C,
    setTranslateExtent: I,
    setNodeExtent: z,
    setPaneClickDistance: T,
    removeSelectedElements: w,
    removeSelectedNodes: k,
    removeSelectedEdges: x,
    startConnection: W,
    updateConnection: K,
    endConnection: G,
    setInteractive: O,
    setState: we,
    getIntersectingNodes: te,
    getIncomers: r,
    getOutgoers: a,
    getConnectedEdges: s,
    getHandleConnections: l,
    isNodeIntersecting: re,
    panBy: le,
    fitView: (P) => i.value.fitView(P),
    zoomIn: (P) => i.value.zoomIn(P),
    zoomOut: (P) => i.value.zoomOut(P),
    zoomTo: (P, M) => i.value.zoomTo(P, M),
    setViewport: (P, M) => i.value.setViewport(P, M),
    setTransform: (P, M) => i.value.setTransform(P, M),
    getViewport: () => i.value.getViewport(),
    getTransform: () => i.value.getTransform(),
    setCenter: (P, M, A) => i.value.setCenter(P, M, A),
    fitBounds: (P, M) => i.value.fitBounds(P, M),
    project: (P) => i.value.project(P),
    screenToFlowCoordinate: (P) => i.value.screenToFlowCoordinate(P),
    flowToScreenCoordinate: (P) => i.value.flowToScreenCoordinate(P),
    toObject: () => {
      const P = [], M = [];
      for (const A of e.nodes) {
        const {
          computedPosition: q,
          handleBounds: Q,
          selected: de,
          dimensions: ve,
          isParent: ke,
          resizing: be,
          dragging: Ee,
          events: Se,
          ...Ae
        } = A;
        P.push(Ae);
      }
      for (const A of e.edges) {
        const { selected: q, sourceNode: Q, targetNode: de, events: ve, ...ke } = A;
        M.push(ke);
      }
      return JSON.parse(
        JSON.stringify({
          nodes: P,
          edges: M,
          position: [e.viewport.x, e.viewport.y],
          zoom: e.viewport.zoom,
          viewport: e.viewport
        })
      );
    },
    fromObject: (P) => new Promise((M) => {
      const { nodes: A, edges: q, position: Q, zoom: de, viewport: ve } = P;
      A && D(A), q && B(q);
      const [ke, be] = ve?.x && ve?.y ? [ve.x, ve.y] : Q ?? [null, null];
      if (ke && be) {
        const Ee = ve?.zoom || de || e.viewport.zoom;
        return Ua(() => i.value.viewportInitialized).toBe(!0).then(() => {
          i.value.setViewport({
            x: ke,
            y: be,
            zoom: Ee
          }).then(() => {
            M(!0);
          });
        });
      } else
        M(!0);
    }),
    updateNodeInternals: o,
    viewportHelper: i,
    $reset: () => {
      const P = jf();
      if (e.edges = [], e.nodes = [], e.d3Zoom && e.d3Selection) {
        const M = On.translate(P.defaultViewport.x ?? 0, P.defaultViewport.y ?? 0).scale(zt(P.defaultViewport.zoom ?? 1, P.minZoom, P.maxZoom)), A = e.viewportRef.getBoundingClientRect(), q = [
          [0, 0],
          [A.width, A.height]
        ], Q = e.d3Zoom.constrain()(M, q, P.translateExtent);
        e.d3Zoom.transform(e.d3Selection, Q);
      }
      we(P);
    },
    $destroy: () => {
    }
  };
}
const ek = ["data-id", "data-handleid", "data-nodeid", "data-handlepos"], tk = {
  name: "Handle",
  compatConfig: { MODE: 3 }
}, xt = /* @__PURE__ */ ye({
  ...tk,
  props: {
    id: { default: null },
    type: {},
    position: { default: () => ge.Top },
    isValidConnection: { type: Function },
    connectable: { type: [Boolean, Number, String, Function], default: void 0 },
    connectableStart: { type: Boolean, default: !0 },
    connectableEnd: { type: Boolean, default: !0 }
  },
  setup(e, { expose: t }) {
    const n = Lm(e, ["position", "connectable", "connectableStart", "connectableEnd", "id"]), i = Ne(() => n.type ?? "source"), o = Ne(() => n.isValidConnection ?? null), {
      id: r,
      connectionStartHandle: a,
      connectionClickStartHandle: s,
      connectionEndHandle: l,
      vueFlowRef: c,
      nodesConnectable: u,
      noDragClassName: d,
      noPanClassName: h
    } = De(), { id: p, node: v, nodeEl: g, connectedEdges: m } = Yf(), k = Y(), x = Ne(() => typeof e.connectableStart < "u" ? e.connectableStart : !0), w = Ne(() => typeof e.connectableEnd < "u" ? e.connectableEnd : !0), b = Ne(
      () => {
        var B, N, H, y, E, _;
        return ((B = a.value) == null ? void 0 : B.nodeId) === p && ((N = a.value) == null ? void 0 : N.id) === e.id && ((H = a.value) == null ? void 0 : H.type) === i.value || ((y = l.value) == null ? void 0 : y.nodeId) === p && ((E = l.value) == null ? void 0 : E.id) === e.id && ((_ = l.value) == null ? void 0 : _.type) === i.value;
      }
    ), C = Ne(
      () => {
        var B, N, H;
        return ((B = s.value) == null ? void 0 : B.nodeId) === p && ((N = s.value) == null ? void 0 : N.id) === e.id && ((H = s.value) == null ? void 0 : H.type) === i.value;
      }
    ), { handlePointerDown: I, handleClick: z } = Wf({
      nodeId: p,
      handleId: e.id,
      isValidConnection: o,
      type: i
    }), T = U(() => typeof e.connectable == "string" && e.connectable === "single" ? !m.value.some((B) => {
      const N = B[`${i.value}Handle`];
      return B[i.value] !== p ? !1 : N ? N === e.id : !0;
    }) : typeof e.connectable == "number" ? m.value.filter((B) => {
      const N = B[`${i.value}Handle`];
      return B[i.value] !== p ? !1 : N ? N === e.id : !0;
    }).length < e.connectable : typeof e.connectable == "function" ? e.connectable(v, m.value) : We(e.connectable) ? e.connectable : u.value);
    Ue(() => {
      var B;
      if (!v.dimensions.width || !v.dimensions.height)
        return;
      const N = (B = v.handleBounds[i.value]) == null ? void 0 : B.find((J) => J.id === e.id);
      if (!c.value || N)
        return;
      const H = c.value.querySelector(".vue-flow__transformationpane");
      if (!g.value || !k.value || !H || !e.id)
        return;
      const y = g.value.getBoundingClientRect(), E = k.value.getBoundingClientRect(), _ = window.getComputedStyle(H), { m22: L } = new window.DOMMatrixReadOnly(_.transform), F = {
        id: e.id,
        position: e.position,
        x: (E.left - y.left) / L,
        y: (E.top - y.top) / L,
        type: i.value,
        nodeId: p,
        ...ir(k.value)
      };
      v.handleBounds[i.value] = [...v.handleBounds[i.value] ?? [], F];
    });
    function O(B) {
      const N = js(B);
      T.value && x.value && (N && B.button === 0 || !N) && I(B);
    }
    function D(B) {
      !p || !s.value && !x.value || T.value && z(B);
    }
    return t({
      handleClick: z,
      handlePointerDown: I,
      onClick: D,
      onPointerDown: O
    }), (B, N) => (S(), R("div", {
      ref_key: "handle",
      ref: k,
      "data-id": `${f(r)}-${f(p)}-${e.id}-${i.value}`,
      "data-handleid": e.id,
      "data-nodeid": f(p),
      "data-handlepos": B.position,
      class: Ie(["vue-flow__handle", [
        `vue-flow__handle-${B.position}`,
        `vue-flow__handle-${e.id}`,
        f(d),
        f(h),
        i.value,
        {
          connectable: T.value,
          connecting: C.value,
          connectablestart: x.value,
          connectableend: w.value,
          connectionindicator: T.value && (x.value && !b.value || w.value && b.value)
        }
      ]]),
      onMousedown: O,
      onTouchstartPassive: O,
      onClick: D
    }, [
      Be(B.$slots, "default", { id: B.id })
    ], 42, ek));
  }
}), sr = function({
  sourcePosition: e = ge.Bottom,
  targetPosition: t = ge.Top,
  label: n,
  connectable: i = !0,
  isValidTargetPos: o,
  isValidSourcePos: r,
  data: a
}) {
  const s = a.label ?? n;
  return [
    Pe(xt, { type: "target", position: t, connectable: i, isValidConnection: o }),
    typeof s != "string" && s ? Pe(s) : Pe(ue, [s]),
    Pe(xt, { type: "source", position: e, connectable: i, isValidConnection: r })
  ];
};
sr.props = ["sourcePosition", "targetPosition", "label", "isValidTargetPos", "isValidSourcePos", "connectable", "data"];
sr.inheritAttrs = !1;
sr.compatConfig = { MODE: 3 };
const nk = sr, lr = function({
  targetPosition: e = ge.Top,
  label: t,
  connectable: n = !0,
  isValidTargetPos: i,
  data: o
}) {
  const r = o.label ?? t;
  return [
    Pe(xt, { type: "target", position: e, connectable: n, isValidConnection: i }),
    typeof r != "string" && r ? Pe(r) : Pe(ue, [r])
  ];
};
lr.props = ["targetPosition", "label", "isValidTargetPos", "connectable", "data"];
lr.inheritAttrs = !1;
lr.compatConfig = { MODE: 3 };
const ok = lr, ur = function({
  sourcePosition: e = ge.Bottom,
  label: t,
  connectable: n = !0,
  isValidSourcePos: i,
  data: o
}) {
  const r = o.label ?? t;
  return [
    typeof r != "string" && r ? Pe(r) : Pe(ue, [r]),
    Pe(xt, { type: "source", position: e, connectable: n, isValidConnection: i })
  ];
};
ur.props = ["sourcePosition", "label", "isValidSourcePos", "connectable", "data"];
ur.inheritAttrs = !1;
ur.compatConfig = { MODE: 3 };
const ik = ur, rk = ["transform"], ak = ["width", "height", "x", "y", "rx", "ry"], sk = ["y"], lk = {
  name: "EdgeText",
  compatConfig: { MODE: 3 }
}, uk = /* @__PURE__ */ ye({
  ...lk,
  props: {
    x: {},
    y: {},
    label: {},
    labelStyle: { default: () => ({}) },
    labelShowBg: { type: Boolean, default: !0 },
    labelBgStyle: { default: () => ({}) },
    labelBgPadding: { default: () => [2, 4] },
    labelBgBorderRadius: { default: 2 }
  },
  setup(e) {
    const t = Y({ x: 0, y: 0, width: 0, height: 0 }), n = Y(null), i = U(() => `translate(${e.x - t.value.width / 2} ${e.y - t.value.height / 2})`);
    Ue(o), _e([() => e.x, () => e.y, n, () => e.label], o);
    function o() {
      if (!n.value)
        return;
      const r = n.value.getBBox();
      (r.width !== t.value.width || r.height !== t.value.height) && (t.value = r);
    }
    return (r, a) => (S(), R("g", {
      transform: i.value,
      class: "vue-flow__edge-textwrapper"
    }, [
      r.labelShowBg ? (S(), R("rect", {
        key: 0,
        class: "vue-flow__edge-textbg",
        width: `${t.value.width + 2 * r.labelBgPadding[0]}px`,
        height: `${t.value.height + 2 * r.labelBgPadding[1]}px`,
        x: -r.labelBgPadding[0],
        y: -r.labelBgPadding[1],
        style: ze(r.labelBgStyle),
        rx: r.labelBgBorderRadius,
        ry: r.labelBgBorderRadius
      }, null, 12, ak)) : Z("", !0),
      $("text", oo(r.$attrs, {
        ref_key: "el",
        ref: n,
        class: "vue-flow__edge-text",
        y: t.value.height / 2,
        dy: "0.3em",
        style: r.labelStyle
      }), [
        Be(r.$slots, "default", {}, () => [
          typeof r.label != "string" ? (S(), ae(Xt(r.label), { key: 0 })) : (S(), R(ue, { key: 1 }, [
            ce(j(r.label), 1)
          ], 64))
        ])
      ], 16, sk)
    ], 8, rk));
  }
}), ck = ["id", "d", "marker-end", "marker-start"], dk = ["d", "stroke-width"], fk = {
  name: "BaseEdge",
  inheritAttrs: !1,
  compatConfig: { MODE: 3 }
}, Io = /* @__PURE__ */ ye({
  ...fk,
  props: {
    id: {},
    labelX: {},
    labelY: {},
    path: {},
    label: {},
    markerStart: {},
    markerEnd: {},
    interactionWidth: { default: 20 },
    labelStyle: {},
    labelShowBg: { type: Boolean },
    labelBgStyle: {},
    labelBgPadding: {},
    labelBgBorderRadius: {}
  },
  setup(e, { expose: t }) {
    const n = Y(null), i = Y(null), o = Y(null), r = xs();
    return t({
      pathEl: n,
      interactionEl: i,
      labelEl: o
    }), (a, s) => (S(), R(ue, null, [
      $("path", oo(f(r), {
        id: a.id,
        ref_key: "pathEl",
        ref: n,
        d: a.path,
        class: "vue-flow__edge-path",
        "marker-end": a.markerEnd,
        "marker-start": a.markerStart
      }), null, 16, ck),
      a.interactionWidth ? (S(), R("path", {
        key: 0,
        ref_key: "interactionEl",
        ref: i,
        fill: "none",
        d: a.path,
        "stroke-width": a.interactionWidth,
        "stroke-opacity": 0,
        class: "vue-flow__edge-interaction"
      }, null, 8, dk)) : Z("", !0),
      a.label && a.labelX && a.labelY ? (S(), ae(uk, {
        key: 1,
        ref_key: "labelEl",
        ref: o,
        x: a.labelX,
        y: a.labelY,
        label: a.label,
        "label-show-bg": a.labelShowBg,
        "label-bg-style": a.labelBgStyle,
        "label-bg-padding": a.labelBgPadding,
        "label-bg-border-radius": a.labelBgBorderRadius,
        "label-style": a.labelStyle
      }, null, 8, ["x", "y", "label", "label-show-bg", "label-bg-style", "label-bg-padding", "label-bg-border-radius", "label-style"])) : Z("", !0)
    ], 64));
  }
});
function Xf({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: i
}) {
  const o = Math.abs(n - e) / 2, r = n < e ? n + o : n - o, a = Math.abs(i - t) / 2, s = i < t ? i + a : i - a;
  return [r, s, o, a];
}
function Kf({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: i,
  sourceControlX: o,
  sourceControlY: r,
  targetControlX: a,
  targetControlY: s
}) {
  const l = e * 0.125 + o * 0.375 + a * 0.375 + n * 0.125, c = t * 0.125 + r * 0.375 + s * 0.375 + i * 0.125, u = Math.abs(l - e), d = Math.abs(c - t);
  return [l, c, u, d];
}
function jo(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function Cu({ pos: e, x1: t, y1: n, x2: i, y2: o, c: r }) {
  let a, s;
  switch (e) {
    case ge.Left:
      a = t - jo(t - i, r), s = n;
      break;
    case ge.Right:
      a = t + jo(i - t, r), s = n;
      break;
    case ge.Top:
      a = t, s = n - jo(n - o, r);
      break;
    case ge.Bottom:
      a = t, s = n + jo(o - n, r);
      break;
  }
  return [a, s];
}
function Ks(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: i = ge.Bottom,
    targetX: o,
    targetY: r,
    targetPosition: a = ge.Top,
    curvature: s = 0.25
  } = e, [l, c] = Cu({
    pos: i,
    x1: t,
    y1: n,
    x2: o,
    y2: r,
    c: s
  }), [u, d] = Cu({
    pos: a,
    x1: o,
    y1: r,
    x2: t,
    y2: n,
    c: s
  }), [h, p, v, g] = Kf({
    sourceX: t,
    sourceY: n,
    targetX: o,
    targetY: r,
    sourceControlX: l,
    sourceControlY: c,
    targetControlX: u,
    targetControlY: d
  });
  return [
    `M${t},${n} C${l},${c} ${u},${d} ${o},${r}`,
    h,
    p,
    v,
    g
  ];
}
function Nu({ pos: e, x1: t, y1: n, x2: i, y2: o }) {
  let r, a;
  switch (e) {
    case ge.Left:
    case ge.Right:
      r = 0.5 * (t + i), a = n;
      break;
    case ge.Top:
    case ge.Bottom:
      r = t, a = 0.5 * (n + o);
      break;
  }
  return [r, a];
}
function Zf(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: i = ge.Bottom,
    targetX: o,
    targetY: r,
    targetPosition: a = ge.Top
  } = e, [s, l] = Nu({
    pos: i,
    x1: t,
    y1: n,
    x2: o,
    y2: r
  }), [c, u] = Nu({
    pos: a,
    x1: o,
    y1: r,
    x2: t,
    y2: n
  }), [d, h, p, v] = Kf({
    sourceX: t,
    sourceY: n,
    targetX: o,
    targetY: r,
    sourceControlX: s,
    sourceControlY: l,
    targetControlX: c,
    targetControlY: u
  });
  return [
    `M${t},${n} C${s},${l} ${c},${u} ${o},${r}`,
    d,
    h,
    p,
    v
  ];
}
const Iu = {
  [ge.Left]: { x: -1, y: 0 },
  [ge.Right]: { x: 1, y: 0 },
  [ge.Top]: { x: 0, y: -1 },
  [ge.Bottom]: { x: 0, y: 1 }
};
function hk({
  source: e,
  sourcePosition: t = ge.Bottom,
  target: n
}) {
  return t === ge.Left || t === ge.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
}
function Au(e, t) {
  return Math.sqrt((t.x - e.x) ** 2 + (t.y - e.y) ** 2);
}
function pk({
  source: e,
  sourcePosition: t = ge.Bottom,
  target: n,
  targetPosition: i = ge.Top,
  center: o,
  offset: r
}) {
  const a = Iu[t], s = Iu[i], l = { x: e.x + a.x * r, y: e.y + a.y * r }, c = { x: n.x + s.x * r, y: n.y + s.y * r }, u = hk({
    source: l,
    sourcePosition: t,
    target: c
  }), d = u.x !== 0 ? "x" : "y", h = u[d];
  let p, v, g;
  const m = { x: 0, y: 0 }, k = { x: 0, y: 0 }, [x, w, b, C] = Xf({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (a[d] * s[d] === -1) {
    v = o.x ?? x, g = o.y ?? w;
    const z = [
      { x: v, y: l.y },
      { x: v, y: c.y }
    ], T = [
      { x: l.x, y: g },
      { x: c.x, y: g }
    ];
    a[d] === h ? p = d === "x" ? z : T : p = d === "x" ? T : z;
  } else {
    const z = [{ x: l.x, y: c.y }], T = [{ x: c.x, y: l.y }];
    if (d === "x" ? p = a.x === h ? T : z : p = a.y === h ? z : T, t === i) {
      const H = Math.abs(e[d] - n[d]);
      if (H <= r) {
        const y = Math.min(r - 1, r - H);
        a[d] === h ? m[d] = (l[d] > e[d] ? -1 : 1) * y : k[d] = (c[d] > n[d] ? -1 : 1) * y;
      }
    }
    if (t !== i) {
      const H = d === "x" ? "y" : "x", y = a[d] === s[H], E = l[H] > c[H], _ = l[H] < c[H];
      (a[d] === 1 && (!y && E || y && _) || a[d] !== 1 && (!y && _ || y && E)) && (p = d === "x" ? z : T);
    }
    const O = { x: l.x + m.x, y: l.y + m.y }, D = { x: c.x + k.x, y: c.y + k.y }, B = Math.max(Math.abs(O.x - p[0].x), Math.abs(D.x - p[0].x)), N = Math.max(Math.abs(O.y - p[0].y), Math.abs(D.y - p[0].y));
    B >= N ? (v = (O.x + D.x) / 2, g = p[0].y) : (v = p[0].x, g = (O.y + D.y) / 2);
  }
  return [[
    e,
    { x: l.x + m.x, y: l.y + m.y },
    ...p,
    { x: c.x + k.x, y: c.y + k.y },
    n
  ], v, g, b, C];
}
function vk(e, t, n, i) {
  const o = Math.min(Au(e, t) / 2, Au(t, n) / 2, i), { x: r, y: a } = t;
  if (e.x === r && r === n.x || e.y === a && a === n.y)
    return `L${r} ${a}`;
  if (e.y === a) {
    const c = e.x < n.x ? -1 : 1, u = e.y < n.y ? 1 : -1;
    return `L ${r + o * c},${a}Q ${r},${a} ${r},${a + o * u}`;
  }
  const s = e.x < n.x ? 1 : -1, l = e.y < n.y ? -1 : 1;
  return `L ${r},${a + o * l}Q ${r},${a} ${r + o * s},${a}`;
}
function os(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: i = ge.Bottom,
    targetX: o,
    targetY: r,
    targetPosition: a = ge.Top,
    borderRadius: s = 5,
    centerX: l,
    centerY: c,
    offset: u = 20
  } = e, [d, h, p, v, g] = pk({
    source: { x: t, y: n },
    sourcePosition: i,
    target: { x: o, y: r },
    targetPosition: a,
    center: { x: l, y: c },
    offset: u
  });
  return [d.reduce((k, x, w) => {
    let b;
    return w > 0 && w < d.length - 1 ? b = vk(d[w - 1], x, d[w + 1], s) : b = `${w === 0 ? "M" : "L"}${x.x} ${x.y}`, k += b, k;
  }, ""), h, p, v, g];
}
function mk(e) {
  const { sourceX: t, sourceY: n, targetX: i, targetY: o } = e, [r, a, s, l] = Xf({
    sourceX: t,
    sourceY: n,
    targetX: i,
    targetY: o
  });
  return [`M ${t},${n}L ${i},${o}`, r, a, s, l];
}
const gk = ye({
  name: "StraightEdge",
  props: [
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "markerEnd",
    "markerStart",
    "interactionWidth"
  ],
  compatConfig: { MODE: 3 },
  setup(e, { attrs: t }) {
    return () => {
      const [n, i, o] = mk(e);
      return Pe(Io, {
        path: n,
        labelX: i,
        labelY: o,
        ...t,
        ...e
      });
    };
  }
}), yk = gk, wk = ye({
  name: "SmoothStepEdge",
  props: [
    "sourcePosition",
    "targetPosition",
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "borderRadius",
    "markerEnd",
    "markerStart",
    "interactionWidth",
    "offset"
  ],
  compatConfig: { MODE: 3 },
  setup(e, { attrs: t }) {
    return () => {
      const [n, i, o] = os({
        ...e,
        sourcePosition: e.sourcePosition ?? ge.Bottom,
        targetPosition: e.targetPosition ?? ge.Top
      });
      return Pe(Io, {
        path: n,
        labelX: i,
        labelY: o,
        ...t,
        ...e
      });
    };
  }
}), Jf = wk, bk = ye({
  name: "StepEdge",
  props: [
    "sourcePosition",
    "targetPosition",
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "markerEnd",
    "markerStart",
    "interactionWidth"
  ],
  setup(e, { attrs: t }) {
    return () => Pe(Jf, { ...e, ...t, borderRadius: 0 });
  }
}), _k = bk, kk = ye({
  name: "BezierEdge",
  props: [
    "sourcePosition",
    "targetPosition",
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "curvature",
    "markerEnd",
    "markerStart",
    "interactionWidth"
  ],
  compatConfig: { MODE: 3 },
  setup(e, { attrs: t }) {
    return () => {
      const [n, i, o] = Ks({
        ...e,
        sourcePosition: e.sourcePosition ?? ge.Bottom,
        targetPosition: e.targetPosition ?? ge.Top
      });
      return Pe(Io, {
        path: n,
        labelX: i,
        labelY: o,
        ...t,
        ...e
      });
    };
  }
}), Ek = kk, xk = ye({
  name: "SimpleBezierEdge",
  props: [
    "sourcePosition",
    "targetPosition",
    "label",
    "labelStyle",
    "labelShowBg",
    "labelBgStyle",
    "labelBgPadding",
    "labelBgBorderRadius",
    "sourceY",
    "sourceX",
    "targetX",
    "targetY",
    "markerEnd",
    "markerStart",
    "interactionWidth"
  ],
  compatConfig: { MODE: 3 },
  setup(e, { attrs: t }) {
    return () => {
      const [n, i, o] = Zf({
        ...e,
        sourcePosition: e.sourcePosition ?? ge.Bottom,
        targetPosition: e.targetPosition ?? ge.Top
      });
      return Pe(Io, {
        path: n,
        labelX: i,
        labelY: o,
        ...t,
        ...e
      });
    };
  }
}), $k = xk, Sk = {
  input: ik,
  default: nk,
  output: ok
}, Ck = {
  default: Ek,
  straight: yk,
  step: _k,
  smoothstep: Jf,
  simplebezier: $k
};
function Nk(e, t, n) {
  const i = U(() => (g) => t.value.get(g)), o = U(() => (g) => n.value.get(g)), r = U(() => {
    const g = {
      ...Ck,
      ...e.edgeTypes
    }, m = Object.keys(g);
    for (const k of e.edges)
      k.type && !m.includes(k.type) && (g[k.type] = k.type);
    return g;
  }), a = U(() => {
    const g = {
      ...Sk,
      ...e.nodeTypes
    }, m = Object.keys(g);
    for (const k of e.nodes)
      k.type && !m.includes(k.type) && (g[k.type] = k.type);
    return g;
  }), s = U(() => e.onlyRenderVisibleElements ? Df(
    e.nodes,
    {
      x: 0,
      y: 0,
      width: e.dimensions.width,
      height: e.dimensions.height
    },
    e.viewport,
    !0
  ) : e.nodes), l = U(() => {
    if (e.onlyRenderVisibleElements) {
      const g = [];
      for (const m of e.edges) {
        const k = t.value.get(m.source), x = t.value.get(m.target);
        $_({
          sourcePos: k.computedPosition || { x: 0, y: 0 },
          targetPos: x.computedPosition || { x: 0, y: 0 },
          sourceWidth: k.dimensions.width,
          sourceHeight: k.dimensions.height,
          targetWidth: x.dimensions.width,
          targetHeight: x.dimensions.height,
          width: e.dimensions.width,
          height: e.dimensions.height,
          viewport: e.viewport
        }) && g.push(m);
      }
      return g;
    }
    return e.edges;
  }), c = U(() => [...s.value, ...l.value]), u = U(() => {
    const g = [];
    for (const m of e.nodes)
      m.selected && g.push(m);
    return g;
  }), d = U(() => {
    const g = [];
    for (const m of e.edges)
      m.selected && g.push(m);
    return g;
  }), h = U(() => [
    ...u.value,
    ...d.value
  ]), p = U(() => {
    const g = [];
    for (const m of e.nodes)
      m.dimensions.width && m.dimensions.height && m.handleBounds !== void 0 && g.push(m);
    return g;
  }), v = U(
    () => s.value.length > 0 && p.value.length === s.value.length
  );
  return {
    getNode: i,
    getEdge: o,
    getElements: c,
    getEdgeTypes: r,
    getNodeTypes: a,
    getEdges: l,
    getNodes: s,
    getSelectedElements: h,
    getSelectedNodes: u,
    getSelectedEdges: d,
    getNodesInitialized: p,
    areNodesInitialized: v
  };
}
class rn {
  constructor() {
    this.currentId = 0, this.flows = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    var t;
    const n = (t = Vn()) == null ? void 0 : t.appContext.app, i = n?.config.globalProperties.$vueFlowStorage ?? rn.instance;
    return rn.instance = i ?? new rn(), n && (n.config.globalProperties.$vueFlowStorage = rn.instance), rn.instance;
  }
  set(t, n) {
    return this.flows.set(t, n);
  }
  get(t) {
    return this.flows.get(t);
  }
  remove(t) {
    return this.flows.delete(t);
  }
  create(t, n) {
    const i = jf(), o = $s(i), r = {};
    for (const [h, p] of Object.entries(o.hooks)) {
      const v = `on${h.charAt(0).toUpperCase() + h.slice(1)}`;
      r[v] = p.on;
    }
    const a = {};
    for (const [h, p] of Object.entries(o.hooks))
      a[h] = p.trigger;
    const s = U(() => {
      const h = /* @__PURE__ */ new Map();
      for (const p of o.nodes)
        h.set(p.id, p);
      return h;
    }), l = U(() => {
      const h = /* @__PURE__ */ new Map();
      for (const p of o.edges)
        h.set(p.id, p);
      return h;
    }), c = Nk(o, s, l), u = Q_(o, s, l);
    u.setState({ ...o, ...n });
    const d = {
      ...r,
      ...c,
      ...u,
      ..._w(o),
      nodeLookup: s,
      edgeLookup: l,
      emits: a,
      id: t,
      vueFlowVersion: "1.48.2",
      $destroy: () => {
        this.remove(t);
      }
    };
    return this.set(t, d), d;
  }
  getId() {
    return `vue-flow-${this.currentId++}`;
  }
}
function De(e) {
  const t = rn.getInstance(), n = pd(), i = typeof e == "object", o = i ? e : { id: e }, r = o.id, a = r ?? n?.vueFlowId;
  let s;
  if (n) {
    const l = Ht(Su, null);
    typeof l < "u" && l !== null && (!a || l.id === a) && (s = l);
  }
  if (s || a && (s = t.get(a)), !s || a && s.id !== a) {
    const l = r ?? t.getId(), c = t.create(l, o);
    s = c, (n ?? vd(!0)).run(() => {
      _e(
        c.applyDefault,
        (d, h, p) => {
          const v = (m) => {
            c.applyNodeChanges(m);
          }, g = (m) => {
            c.applyEdgeChanges(m);
          };
          d ? (c.onNodesChange(v), c.onEdgesChange(g)) : (c.hooks.value.nodesChange.off(v), c.hooks.value.edgesChange.off(g)), p(() => {
            c.hooks.value.nodesChange.off(v), c.hooks.value.edgesChange.off(g);
          });
        },
        { immediate: !0 }
      ), lo(() => {
        if (s) {
          const d = t.get(s.id);
          d ? d.$destroy() : No(`No store instance found for id ${s.id} in storage.`);
        }
      });
    });
  } else
    i && s.setState(o);
  if (n && (Zt(Su, s), n.vueFlowId = s.id), i) {
    const l = Vn();
    l?.type.name !== "VueFlow" && s.emits.error(new je(Ye.USEVUEFLOW_OPTIONS));
  }
  return s;
}
function Ik(e) {
  const { emits: t, dimensions: n } = De();
  let i;
  Ue(() => {
    const o = () => {
      var r, a;
      if (!e.value || !(((a = (r = e.value).checkVisibility) == null ? void 0 : a.call(r)) ?? !0))
        return;
      const s = ir(e.value);
      (s.width === 0 || s.height === 0) && t.error(new je(Ye.MISSING_VIEWPORT_DIMENSIONS)), n.value = { width: s.width || 500, height: s.height || 500 };
    };
    o(), window.addEventListener("resize", o), e.value && (i = new ResizeObserver(() => o()), i.observe(e.value)), Qe(() => {
      window.removeEventListener("resize", o), i && e.value && i.unobserve(e.value);
    });
  });
}
const Ak = {
  name: "UserSelection",
  compatConfig: { MODE: 3 }
}, Mk = /* @__PURE__ */ ye({
  ...Ak,
  props: {
    userSelectionRect: {}
  },
  setup(e) {
    return (t, n) => (S(), R("div", {
      class: "vue-flow__selection vue-flow__container",
      style: ze({
        width: `${t.userSelectionRect.width}px`,
        height: `${t.userSelectionRect.height}px`,
        transform: `translate(${t.userSelectionRect.x}px, ${t.userSelectionRect.y}px)`
      })
    }, null, 4));
  }
}), Tk = ["tabIndex"], Ok = {
  name: "NodesSelection",
  compatConfig: { MODE: 3 }
}, Rk = /* @__PURE__ */ ye({
  ...Ok,
  setup(e) {
    const { emits: t, viewport: n, getSelectedNodes: i, noPanClassName: o, disableKeyboardA11y: r, userSelectionActive: a } = De(), s = Gf(), l = Y(null), c = qf({
      el: l,
      onStart(v) {
        t.selectionDragStart(v), t.nodeDragStart(v);
      },
      onDrag(v) {
        t.selectionDrag(v), t.nodeDrag(v);
      },
      onStop(v) {
        t.selectionDragStop(v), t.nodeDragStop(v);
      }
    });
    Ue(() => {
      var v;
      r.value || (v = l.value) == null || v.focus({ preventScroll: !0 });
    });
    const u = U(() => Ys(i.value)), d = U(() => ({
      width: `${u.value.width}px`,
      height: `${u.value.height}px`,
      top: `${u.value.y}px`,
      left: `${u.value.x}px`
    }));
    function h(v) {
      t.selectionContextMenu({ event: v, nodes: i.value });
    }
    function p(v) {
      r.value || Cn[v.key] && (v.preventDefault(), s(
        {
          x: Cn[v.key].x,
          y: Cn[v.key].y
        },
        v.shiftKey
      ));
    }
    return (v, g) => !f(a) && u.value.width && u.value.height ? (S(), R("div", {
      key: 0,
      class: Ie(["vue-flow__nodesselection vue-flow__container", f(o)]),
      style: ze({ transform: `translate(${f(n).x}px,${f(n).y}px) scale(${f(n).zoom})` })
    }, [
      $("div", {
        ref_key: "el",
        ref: l,
        class: Ie([{ dragging: f(c) }, "vue-flow__nodesselection-rect"]),
        style: ze(d.value),
        tabIndex: f(r) ? void 0 : -1,
        onContextmenu: h,
        onKeydown: p
      }, null, 46, Tk)
    ], 6)) : Z("", !0);
  }
});
function Dk(e, t) {
  return {
    x: e.clientX - t.left,
    y: e.clientY - t.top
  };
}
const Pk = {
  name: "Pane",
  compatConfig: { MODE: 3 }
}, Lk = /* @__PURE__ */ ye({
  ...Pk,
  props: {
    isSelecting: { type: Boolean },
    selectionKeyPressed: { type: Boolean }
  },
  setup(e) {
    const {
      vueFlowRef: t,
      nodes: n,
      viewport: i,
      emits: o,
      userSelectionActive: r,
      removeSelectedElements: a,
      userSelectionRect: s,
      elementsSelectable: l,
      nodesSelectionActive: c,
      getSelectedEdges: u,
      getSelectedNodes: d,
      removeNodes: h,
      removeEdges: p,
      selectionMode: v,
      deleteKeyCode: g,
      multiSelectionKeyCode: m,
      multiSelectionActive: k,
      edgeLookup: x,
      nodeLookup: w,
      connectionLookup: b,
      defaultEdgeOptions: C,
      connectionStartHandle: I,
      panOnDrag: z
    } = De(), T = nt(null), O = nt(/* @__PURE__ */ new Set()), D = nt(/* @__PURE__ */ new Set()), B = nt(null), N = Ne(() => l.value && (e.isSelecting || r.value)), H = Ne(() => I.value !== null);
    let y = !1, E = !1;
    const _ = no(g, { actInsideInputWithModifier: !1 }), L = no(m);
    _e(_, (G) => {
      G && (h(d.value), p(u.value), c.value = !1);
    }), _e(L, (G) => {
      k.value = G;
    });
    function F(G, ee) {
      return (te) => {
        te.target === ee && G?.(te);
      };
    }
    function J(G) {
      if (y || H.value) {
        y = !1;
        return;
      }
      o.paneClick(G), a(), c.value = !1;
    }
    function X(G) {
      var ee;
      if (Array.isArray(z.value) && ((ee = z.value) != null && ee.includes(2))) {
        G.preventDefault();
        return;
      }
      o.paneContextMenu(G);
    }
    function oe(G) {
      o.paneScroll(G);
    }
    function se(G) {
      var ee, te, re;
      if (B.value = ((ee = t.value) == null ? void 0 : ee.getBoundingClientRect()) ?? null, !l.value || !e.isSelecting || G.button !== 0 || G.target !== T.value || !B.value)
        return;
      (re = (te = G.target) == null ? void 0 : te.setPointerCapture) == null || re.call(te, G.pointerId);
      const { x: le, y: we } = Dk(G, B.value);
      E = !0, y = !1, a(), s.value = {
        width: 0,
        height: 0,
        startX: le,
        startY: we,
        x: le,
        y: we
      }, o.selectionStart(G);
    }
    function W(G) {
      var ee;
      if (!B.value || !s.value)
        return;
      y = !0;
      const { x: te, y: re } = $t(G, B.value), { startX: le = 0, startY: we = 0 } = s.value, $e = {
        startX: le,
        startY: we,
        x: te < le ? te : le,
        y: re < we ? re : we,
        width: Math.abs(te - le),
        height: Math.abs(re - we)
      }, pe = O.value, me = D.value;
      O.value = new Set(
        Df(n.value, $e, i.value, v.value === Ws.Partial, !0).map(
          (M) => M.id
        )
      ), D.value = /* @__PURE__ */ new Set();
      const P = ((ee = C.value) == null ? void 0 : ee.selectable) ?? !0;
      for (const M of O.value) {
        const A = b.value.get(M);
        if (A)
          for (const { edgeId: q } of A.values()) {
            const Q = x.value.get(q);
            Q && (Q.selectable ?? P) && D.value.add(q);
          }
      }
      if (!$u(pe, O.value)) {
        const M = Gt(w.value, O.value, !0);
        o.nodesChange(M);
      }
      if (!$u(me, D.value)) {
        const M = Gt(x.value, D.value);
        o.edgesChange(M);
      }
      s.value = $e, r.value = !0, c.value = !1;
    }
    function K(G) {
      var ee;
      G.button !== 0 || !E || ((ee = G.target) == null || ee.releasePointerCapture(G.pointerId), !r.value && s.value && G.target === T.value && J(G), r.value = !1, s.value = null, c.value = O.value.size > 0, o.selectionEnd(G), e.selectionKeyPressed && (y = !1), E = !1);
    }
    return (G, ee) => (S(), R("div", {
      ref_key: "container",
      ref: T,
      class: Ie(["vue-flow__pane vue-flow__container", { selection: G.isSelecting }]),
      onClick: ee[0] || (ee[0] = (te) => N.value ? void 0 : F(J, T.value)(te)),
      onContextmenu: ee[1] || (ee[1] = (te) => F(X, T.value)(te)),
      onWheelPassive: ee[2] || (ee[2] = (te) => F(oe, T.value)(te)),
      onPointerenter: ee[3] || (ee[3] = (te) => N.value ? void 0 : f(o).paneMouseEnter(te)),
      onPointerdown: ee[4] || (ee[4] = (te) => N.value ? se(te) : f(o).paneMouseMove(te)),
      onPointermove: ee[5] || (ee[5] = (te) => N.value ? W(te) : f(o).paneMouseMove(te)),
      onPointerup: ee[6] || (ee[6] = (te) => N.value ? K(te) : void 0),
      onPointerleave: ee[7] || (ee[7] = (te) => f(o).paneMouseLeave(te))
    }, [
      Be(G.$slots, "default"),
      f(r) && f(s) ? (S(), ae(Mk, {
        key: 0,
        "user-selection-rect": f(s)
      }, null, 8, ["user-selection-rect"])) : Z("", !0),
      f(c) && f(d).length ? (S(), ae(Rk, { key: 1 })) : Z("", !0)
    ], 34));
  }
}), Vk = {
  name: "Transform",
  compatConfig: { MODE: 3 }
}, Bk = /* @__PURE__ */ ye({
  ...Vk,
  setup(e) {
    const { viewport: t, fitViewOnInit: n, fitViewOnInitDone: i } = De(), o = U(() => n.value ? !i.value : !1), r = U(() => `translate(${t.value.x}px,${t.value.y}px) scale(${t.value.zoom})`);
    return (a, s) => (S(), R("div", {
      class: "vue-flow__transformationpane vue-flow__container",
      style: ze({ transform: r.value, opacity: o.value ? 0 : void 0 })
    }, [
      Be(a.$slots, "default")
    ], 4));
  }
}), zk = {
  name: "Viewport",
  compatConfig: { MODE: 3 }
}, Fk = /* @__PURE__ */ ye({
  ...zk,
  setup(e) {
    const {
      minZoom: t,
      maxZoom: n,
      defaultViewport: i,
      translateExtent: o,
      zoomActivationKeyCode: r,
      selectionKeyCode: a,
      panActivationKeyCode: s,
      panOnScroll: l,
      panOnScrollMode: c,
      panOnScrollSpeed: u,
      panOnDrag: d,
      zoomOnDoubleClick: h,
      zoomOnPinch: p,
      zoomOnScroll: v,
      preventScrolling: g,
      noWheelClassName: m,
      noPanClassName: k,
      emits: x,
      connectionStartHandle: w,
      userSelectionActive: b,
      paneDragging: C,
      d3Zoom: I,
      d3Selection: z,
      d3ZoomHandler: T,
      viewport: O,
      viewportRef: D,
      paneClickDistance: B
    } = De();
    Ik(D);
    const N = nt(!1), H = nt(!1);
    let y = null, E = !1, _ = 0, L = {
      x: 0,
      y: 0,
      zoom: 0
    };
    const F = no(s), J = no(a), X = no(r), oe = Ne(
      () => (!J.value || J.value && a.value === !0) && (F.value || d.value)
    ), se = Ne(() => F.value || l.value), W = Ne(() => a.value === !0 && oe.value !== !0), K = Ne(
      () => J.value && a.value !== !0 || b.value || W.value
    ), G = Ne(() => w.value !== null);
    Ue(() => {
      if (!D.value) {
        No("Viewport element is missing");
        return;
      }
      const we = D.value, $e = we.getBoundingClientRect(), pe = r_().clickDistance(B.value).scaleExtent([t.value, n.value]).translateExtent(o.value), me = pt(we).call(pe), P = me.on("wheel.zoom"), M = On.translate(i.value.x ?? 0, i.value.y ?? 0).scale(zt(i.value.zoom ?? 1, t.value, n.value)), A = [
        [0, 0],
        [$e.width, $e.height]
      ], q = pe.constrain()(M, A, o.value);
      pe.transform(me, q), pe.wheelDelta(es), I.value = pe, z.value = me, T.value = P, O.value = { x: q.x, y: q.y, zoom: q.k }, pe.on("start", (Q) => {
        var de;
        if (!Q.sourceEvent)
          return null;
        _ = Q.sourceEvent.button, N.value = !0;
        const ve = re(Q.transform);
        ((de = Q.sourceEvent) == null ? void 0 : de.type) === "mousedown" && (C.value = !0), L = ve, x.viewportChangeStart(ve), x.moveStart({ event: Q, flowTransform: ve });
      }), pe.on("end", (Q) => {
        if (!Q.sourceEvent)
          return null;
        if (N.value = !1, C.value = !1, ee(oe.value, _ ?? 0) && !E && x.paneContextMenu(Q.sourceEvent), E = !1, te(L, Q.transform)) {
          const de = re(Q.transform);
          L = de, x.viewportChangeEnd(de), x.moveEnd({ event: Q, flowTransform: de });
        }
      }), pe.filter((Q) => {
        var de;
        const ve = X.value || v.value, ke = p.value && Q.ctrlKey, be = Q.button, Ee = Q.type === "wheel";
        if (be === 1 && Q.type === "mousedown" && (le(Q, "vue-flow__node") || le(Q, "vue-flow__edge")))
          return !0;
        if (!oe.value && !ve && !se.value && !h.value && !p.value || b.value || G.value && !Ee || !h.value && Q.type === "dblclick" || le(Q, m.value) && Ee || le(Q, k.value) && (!Ee || se.value && Ee && !X.value) || !p.value && Q.ctrlKey && Ee || !ve && !se.value && !ke && Ee)
          return !1;
        if (!p && Q.type === "touchstart" && ((de = Q.touches) == null ? void 0 : de.length) > 1)
          return Q.preventDefault(), !1;
        if (!oe.value && (Q.type === "mousedown" || Q.type === "touchstart") || W.value && Array.isArray(d.value) && d.value.includes(0) && be === 0 || Array.isArray(d.value) && !d.value.includes(be) && (Q.type === "mousedown" || Q.type === "touchstart"))
          return !1;
        const Se = Array.isArray(d.value) && d.value.includes(be) || a.value === !0 && Array.isArray(d.value) && !d.value.includes(0) || !be || be <= 1;
        return (!Q.ctrlKey || F.value || Ee) && Se;
      }), _e(
        [b, oe],
        () => {
          b.value && !N.value ? pe.on("zoom", null) : b.value || pe.on("zoom", (Q) => {
            O.value = { x: Q.transform.x, y: Q.transform.y, zoom: Q.transform.k };
            const de = re(Q.transform);
            E = ee(oe.value, _ ?? 0), x.viewportChange(de), x.move({ event: Q, flowTransform: de });
          });
        },
        { immediate: !0 }
      ), _e(
        [b, se, c, X, p, g, m],
        () => {
          se.value && !X.value && !b.value ? me.on(
            "wheel.zoom",
            (Q) => {
              if (le(Q, m.value))
                return !1;
              const de = X.value || v.value, ve = p.value && Q.ctrlKey;
              if (!(!g.value || se.value || de || ve))
                return !1;
              Q.preventDefault(), Q.stopImmediatePropagation();
              const be = me.property("__zoom").k || 1, Ee = go();
              if (!F.value && Q.ctrlKey && p.value && Ee) {
                const vr = kt(Q), mr = es(Q), gr = be * 2 ** mr;
                pe.scaleTo(me, gr, vr, Q);
                return;
              }
              const Se = Q.deltaMode === 1 ? 20 : 1;
              let Ae = c.value === to.Vertical ? 0 : Q.deltaX * Se, ht = c.value === to.Horizontal ? 0 : Q.deltaY * Se;
              !Ee && Q.shiftKey && c.value !== to.Vertical && !Ae && ht && (Ae = ht, ht = 0), pe.translateBy(
                me,
                -(Ae / be) * u.value,
                -(ht / be) * u.value
              );
              const at = re(me.property("__zoom"));
              y && clearTimeout(y), H.value ? (x.move({ event: Q, flowTransform: at }), x.viewportChange(at), y = setTimeout(() => {
                x.moveEnd({ event: Q, flowTransform: at }), x.viewportChangeEnd(at), H.value = !1;
              }, 150)) : (H.value = !0, x.moveStart({ event: Q, flowTransform: at }), x.viewportChangeStart(at));
            },
            { passive: !1 }
          ) : typeof P < "u" && me.on(
            "wheel.zoom",
            function(Q, de) {
              const ve = !g.value && Q.type === "wheel" && !Q.ctrlKey, ke = X.value || v.value, be = p.value && Q.ctrlKey;
              if (!ke && !l.value && !be && Q.type === "wheel" || ve || le(Q, m.value))
                return null;
              Q.preventDefault(), P.call(this, Q, de);
            },
            { passive: !1 }
          );
        },
        { immediate: !0 }
      );
    });
    function ee(we, $e) {
      return $e === 2 && Array.isArray(we) && we.includes(2);
    }
    function te(we, $e) {
      return we.x !== $e.x && !Number.isNaN($e.x) || we.y !== $e.y && !Number.isNaN($e.y) || we.zoom !== $e.k && !Number.isNaN($e.k);
    }
    function re(we) {
      return {
        x: we.x,
        y: we.y,
        zoom: we.k
      };
    }
    function le(we, $e) {
      return we.target.closest(`.${$e}`);
    }
    return (we, $e) => (S(), R("div", {
      ref_key: "viewportRef",
      ref: D,
      class: "vue-flow__viewport vue-flow__container"
    }, [
      V(Lk, {
        "is-selecting": K.value,
        "selection-key-pressed": f(J),
        class: Ie({
          connecting: G.value,
          dragging: f(C),
          draggable: f(d) === !0 || Array.isArray(f(d)) && f(d).includes(0)
        })
      }, {
        default: ne(() => [
          V(Bk, null, {
            default: ne(() => [
              Be(we.$slots, "default")
            ]),
            _: 3
          })
        ]),
        _: 3
      }, 8, ["is-selecting", "selection-key-pressed", "class"])
    ], 512));
  }
}), Hk = ["id"], qk = ["id"], Uk = ["id"], Wk = {
  name: "A11yDescriptions",
  compatConfig: { MODE: 3 }
}, Yk = /* @__PURE__ */ ye({
  ...Wk,
  setup(e) {
    const { id: t, disableKeyboardA11y: n, ariaLiveMessage: i } = De();
    return (o, r) => (S(), R(ue, null, [
      $("div", {
        id: `${f(Sf)}-${f(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select a node. " + j(f(n) ? "" : "You can then use the arrow keys to move the node around.") + " You can then use the arrow keys to move the node around, press delete to remove it and press escape to cancel. ", 9, Hk),
      $("div", {
        id: `${f(Cf)}-${f(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select an edge. You can then press delete to remove it or press escape to cancel. ", 8, qk),
      f(n) ? Z("", !0) : (S(), R("div", {
        key: 0,
        id: `${f(d_)}-${f(t)}`,
        "aria-live": "assertive",
        "aria-atomic": "true",
        style: { position: "absolute", width: "1px", height: "1px", margin: "-1px", border: "0", padding: "0", overflow: "hidden", clip: "rect(0px, 0px, 0px, 0px)", "clip-path": "inset(100%)" }
      }, j(f(i)), 9, Uk))
    ], 64));
  }
});
function Gk() {
  const e = De();
  _e(
    () => e.viewportHelper.value.viewportInitialized,
    (t) => {
      t && setTimeout(() => {
        e.emits.init(e), e.emits.paneReady(e);
      }, 1);
    }
  );
}
function jk(e, t, n) {
  return n === ge.Left ? e - t : n === ge.Right ? e + t : e;
}
function Xk(e, t, n) {
  return n === ge.Top ? e - t : n === ge.Bottom ? e + t : e;
}
const Zs = function({
  radius: e = 10,
  centerX: t = 0,
  centerY: n = 0,
  position: i = ge.Top,
  type: o
}) {
  return Pe("circle", {
    class: `vue-flow__edgeupdater vue-flow__edgeupdater-${o}`,
    cx: jk(t, e, i),
    cy: Xk(n, e, i),
    r: e,
    stroke: "transparent",
    fill: "transparent"
  });
};
Zs.props = ["radius", "centerX", "centerY", "position", "type"];
Zs.compatConfig = { MODE: 3 };
const Mu = Zs, Kk = ye({
  name: "Edge",
  compatConfig: { MODE: 3 },
  props: ["id"],
  setup(e) {
    const {
      id: t,
      addSelectedEdges: n,
      connectionMode: i,
      edgeUpdaterRadius: o,
      emits: r,
      nodesSelectionActive: a,
      noPanClassName: s,
      getEdgeTypes: l,
      removeSelectedEdges: c,
      findEdge: u,
      findNode: d,
      isValidConnection: h,
      multiSelectionActive: p,
      disableKeyboardA11y: v,
      elementsSelectable: g,
      edgesUpdatable: m,
      edgesFocusable: k,
      hooks: x
    } = De(), w = U(() => u(e.id)), { emit: b, on: C } = F_(w.value, r), I = Ht(ar), z = Vn(), T = Y(!1), O = Y(!1), D = Y(""), B = Y(null), N = Y("source"), H = Y(null), y = Ne(
      () => typeof w.value.selectable > "u" ? g.value : w.value.selectable
    ), E = Ne(() => typeof w.value.updatable > "u" ? m.value : w.value.updatable), _ = Ne(() => typeof w.value.focusable > "u" ? k.value : w.value.focusable);
    Zt(V_, e.id), Zt(B_, H);
    const L = U(() => w.value.class instanceof Function ? w.value.class(w.value) : w.value.class), F = U(() => w.value.style instanceof Function ? w.value.style(w.value) : w.value.style), J = U(() => {
      const M = w.value.type || "default", A = I?.[`edge-${M}`];
      if (A)
        return A;
      let q = w.value.template ?? l.value[M];
      if (typeof q == "string" && z) {
        const Q = Object.keys(z.appContext.components);
        Q && Q.includes(M) && (q = gd(M, !1));
      }
      return q && typeof q != "string" ? q : (r.error(new je(Ye.EDGE_TYPE_MISSING, q)), !1);
    }), { handlePointerDown: X } = Wf({
      nodeId: D,
      handleId: B,
      type: N,
      isValidConnection: h,
      edgeUpdaterType: N,
      onEdgeUpdate: W,
      onEdgeUpdateEnd: K
    });
    return () => {
      const M = d(w.value.source), A = d(w.value.target), q = "pathOptions" in w.value ? w.value.pathOptions : {};
      if (!M && !A)
        return r.error(new je(Ye.EDGE_SOURCE_TARGET_MISSING, w.value.id, w.value.source, w.value.target)), null;
      if (!M)
        return r.error(new je(Ye.EDGE_SOURCE_MISSING, w.value.id, w.value.source)), null;
      if (!A)
        return r.error(new je(Ye.EDGE_TARGET_MISSING, w.value.id, w.value.target)), null;
      if (!w.value || w.value.hidden || M.hidden || A.hidden)
        return null;
      let Q;
      i.value === en.Strict ? Q = M.handleBounds.source : Q = [...M.handleBounds.source || [], ...M.handleBounds.target || []];
      const de = wu(Q, w.value.sourceHandle);
      let ve;
      i.value === en.Strict ? ve = A.handleBounds.target : ve = [...A.handleBounds.target || [], ...A.handleBounds.source || []];
      const ke = wu(ve, w.value.targetHandle), be = de?.position || ge.Bottom, Ee = ke?.position || ge.Top, { x: Se, y: Ae } = Rn(M, de, be), { x: ht, y: at } = Rn(A, ke, Ee);
      return w.value.sourceX = Se, w.value.sourceY = Ae, w.value.targetX = ht, w.value.targetY = at, Pe(
        "g",
        {
          ref: H,
          key: e.id,
          "data-id": e.id,
          class: [
            "vue-flow__edge",
            `vue-flow__edge-${J.value === !1 ? "default" : w.value.type || "default"}`,
            s.value,
            L.value,
            {
              updating: T.value,
              selected: w.value.selected,
              animated: w.value.animated,
              inactive: !y.value && !x.value.edgeClick.hasListeners()
            }
          ],
          tabIndex: _.value ? 0 : void 0,
          "aria-label": w.value.ariaLabel === null ? void 0 : w.value.ariaLabel ?? `Edge from ${w.value.source} to ${w.value.target}`,
          "aria-describedby": _.value ? `${Cf}-${t}` : void 0,
          "aria-roledescription": "edge",
          role: _.value ? "group" : "img",
          ...w.value.domAttributes,
          onClick: ee,
          onContextmenu: te,
          onDblclick: re,
          onMouseenter: le,
          onMousemove: we,
          onMouseleave: $e,
          onKeyDown: _.value ? P : void 0
        },
        [
          O.value ? null : Pe(J.value === !1 ? l.value.default : J.value, {
            id: e.id,
            sourceNode: M,
            targetNode: A,
            source: w.value.source,
            target: w.value.target,
            type: w.value.type,
            updatable: E.value,
            selected: w.value.selected,
            animated: w.value.animated,
            label: w.value.label,
            labelStyle: w.value.labelStyle,
            labelShowBg: w.value.labelShowBg,
            labelBgStyle: w.value.labelBgStyle,
            labelBgPadding: w.value.labelBgPadding,
            labelBgBorderRadius: w.value.labelBgBorderRadius,
            data: w.value.data,
            events: { ...w.value.events, ...C },
            style: F.value,
            markerStart: `url('#${mo(w.value.markerStart, t)}')`,
            markerEnd: `url('#${mo(w.value.markerEnd, t)}')`,
            sourcePosition: be,
            targetPosition: Ee,
            sourceX: Se,
            sourceY: Ae,
            targetX: ht,
            targetY: at,
            sourceHandleId: w.value.sourceHandle,
            targetHandleId: w.value.targetHandle,
            interactionWidth: w.value.interactionWidth,
            ...q
          }),
          [
            E.value === "source" || E.value === !0 ? [
              Pe(
                "g",
                {
                  onMousedown: pe,
                  onMouseenter: oe,
                  onMouseout: se
                },
                Pe(Mu, {
                  position: be,
                  centerX: Se,
                  centerY: Ae,
                  radius: o.value,
                  type: "source",
                  "data-type": "source"
                })
              )
            ] : null,
            E.value === "target" || E.value === !0 ? [
              Pe(
                "g",
                {
                  onMousedown: me,
                  onMouseenter: oe,
                  onMouseout: se
                },
                Pe(Mu, {
                  position: Ee,
                  centerX: ht,
                  centerY: at,
                  radius: o.value,
                  type: "target",
                  "data-type": "target"
                })
              )
            ] : null
          ]
        ]
      );
    };
    function oe() {
      T.value = !0;
    }
    function se() {
      T.value = !1;
    }
    function W(M, A) {
      b.update({ event: M, edge: w.value, connection: A });
    }
    function K(M) {
      b.updateEnd({ event: M, edge: w.value }), O.value = !1;
    }
    function G(M, A) {
      M.button === 0 && (O.value = !0, D.value = A ? w.value.target : w.value.source, B.value = (A ? w.value.targetHandle : w.value.sourceHandle) ?? null, N.value = A ? "target" : "source", b.updateStart({ event: M, edge: w.value }), X(M));
    }
    function ee(M) {
      var A;
      const q = { event: M, edge: w.value };
      y.value && (a.value = !1, w.value.selected && p.value ? (c([w.value]), (A = H.value) == null || A.blur()) : n([w.value])), b.click(q);
    }
    function te(M) {
      b.contextMenu({ event: M, edge: w.value });
    }
    function re(M) {
      b.doubleClick({ event: M, edge: w.value });
    }
    function le(M) {
      b.mouseEnter({ event: M, edge: w.value });
    }
    function we(M) {
      b.mouseMove({ event: M, edge: w.value });
    }
    function $e(M) {
      b.mouseLeave({ event: M, edge: w.value });
    }
    function pe(M) {
      G(M, !0);
    }
    function me(M) {
      G(M, !1);
    }
    function P(M) {
      var A;
      !v.value && Nf.includes(M.key) && y.value && (M.key === "Escape" ? ((A = H.value) == null || A.blur(), c([u(e.id)])) : n([u(e.id)]));
    }
  }
}), Zk = Kk, Jk = ye({
  name: "ConnectionLine",
  compatConfig: { MODE: 3 },
  setup() {
    var e;
    const {
      id: t,
      connectionMode: n,
      connectionStartHandle: i,
      connectionEndHandle: o,
      connectionPosition: r,
      connectionLineType: a,
      connectionLineStyle: s,
      connectionLineOptions: l,
      connectionStatus: c,
      viewport: u,
      findNode: d
    } = De(), h = (e = Ht(ar)) == null ? void 0 : e["connection-line"], p = U(() => {
      var x;
      return d((x = i.value) == null ? void 0 : x.nodeId);
    }), v = U(() => {
      var x;
      return d((x = o.value) == null ? void 0 : x.nodeId) ?? null;
    }), g = U(() => ({
      x: (r.value.x - u.value.x) / u.value.zoom,
      y: (r.value.y - u.value.y) / u.value.zoom
    })), m = U(
      () => l.value.markerStart ? `url(#${mo(l.value.markerStart, t)})` : ""
    ), k = U(
      () => l.value.markerEnd ? `url(#${mo(l.value.markerEnd, t)})` : ""
    );
    return () => {
      var x, w, b;
      if (!p.value || !i.value)
        return null;
      const C = i.value.id, I = i.value.type, z = p.value.handleBounds;
      let T = z?.[I] ?? [];
      if (n.value === en.Loose) {
        const F = z?.[I === "source" ? "target" : "source"] ?? [];
        T = [...T, ...F];
      }
      if (!T)
        return null;
      const O = (C ? T.find((F) => F.id === C) : T[0]) ?? null, D = O?.position ?? ge.Top, { x: B, y: N } = Rn(p.value, O, D);
      let H = null;
      v.value && (n.value === en.Strict ? H = ((x = v.value.handleBounds[I === "source" ? "target" : "source"]) == null ? void 0 : x.find(
        (F) => {
          var J;
          return F.id === ((J = o.value) == null ? void 0 : J.id);
        }
      )) || null : H = ((w = [...v.value.handleBounds.source ?? [], ...v.value.handleBounds.target ?? []]) == null ? void 0 : w.find(
        (F) => {
          var J;
          return F.id === ((J = o.value) == null ? void 0 : J.id);
        }
      )) || null);
      const y = ((b = o.value) == null ? void 0 : b.position) ?? (D ? ts[D] : null);
      if (!D || !y)
        return null;
      const E = a.value ?? l.value.type ?? nn.Bezier;
      let _ = "";
      const L = {
        sourceX: B,
        sourceY: N,
        sourcePosition: D,
        targetX: g.value.x,
        targetY: g.value.y,
        targetPosition: y
      };
      return E === nn.Bezier ? [_] = Ks(L) : E === nn.Step ? [_] = os({
        ...L,
        borderRadius: 0
      }) : E === nn.SmoothStep ? [_] = os(L) : E === nn.SimpleBezier ? [_] = Zf(L) : _ = `M${B},${N} ${g.value.x},${g.value.y}`, Pe(
        "svg",
        { class: "vue-flow__edges vue-flow__connectionline vue-flow__container" },
        Pe(
          "g",
          { class: "vue-flow__connection" },
          h ? Pe(h, {
            sourceX: B,
            sourceY: N,
            sourcePosition: D,
            targetX: g.value.x,
            targetY: g.value.y,
            targetPosition: y,
            sourceNode: p.value,
            sourceHandle: O,
            targetNode: v.value,
            targetHandle: H,
            markerEnd: k.value,
            markerStart: m.value,
            connectionStatus: c.value
          }) : Pe("path", {
            d: _,
            class: [l.value.class, c.value, "vue-flow__connection-path"],
            style: {
              ...s.value,
              ...l.value.style
            },
            "marker-end": k.value,
            "marker-start": m.value
          })
        )
      );
    };
  }
}), Qk = Jk, eE = ["id", "markerWidth", "markerHeight", "markerUnits", "orient"], tE = {
  name: "MarkerType",
  compatConfig: { MODE: 3 }
}, nE = /* @__PURE__ */ ye({
  ...tE,
  props: {
    id: {},
    type: {},
    color: { default: "none" },
    width: { default: 12.5 },
    height: { default: 12.5 },
    markerUnits: { default: "strokeWidth" },
    orient: { default: "auto-start-reverse" },
    strokeWidth: { default: 1 }
  },
  setup(e) {
    return (t, n) => (S(), R("marker", {
      id: t.id,
      class: "vue-flow__arrowhead",
      viewBox: "-10 -10 20 20",
      refX: "0",
      refY: "0",
      markerWidth: `${t.width}`,
      markerHeight: `${t.height}`,
      markerUnits: t.markerUnits,
      orient: t.orient
    }, [
      t.type === f(Mi).ArrowClosed ? (S(), R("polyline", {
        key: 0,
        style: ze({
          stroke: t.color,
          fill: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        points: "-5,-4 0,0 -5,4 -5,-4"
      }, null, 4)) : Z("", !0),
      t.type === f(Mi).Arrow ? (S(), R("polyline", {
        key: 1,
        style: ze({
          stroke: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        fill: "none",
        points: "-5,-4 0,0 -5,4"
      }, null, 4)) : Z("", !0)
    ], 8, eE));
  }
}), oE = {
  class: "vue-flow__marker vue-flow__container",
  "aria-hidden": "true"
}, iE = {
  name: "MarkerDefinitions",
  compatConfig: { MODE: 3 }
}, rE = /* @__PURE__ */ ye({
  ...iE,
  setup(e) {
    const { id: t, edges: n, connectionLineOptions: i, defaultMarkerColor: o } = De(), r = U(() => {
      const a = /* @__PURE__ */ new Set(), s = [], l = (c) => {
        if (c) {
          const u = mo(c, t);
          a.has(u) || (typeof c == "object" ? s.push({ ...c, id: u, color: c.color || o.value }) : s.push({ id: u, color: o.value, type: c }), a.add(u));
        }
      };
      for (const c of [i.value.markerEnd, i.value.markerStart])
        l(c);
      for (const c of n.value)
        for (const u of [c.markerStart, c.markerEnd])
          l(u);
      return s.sort((c, u) => c.id.localeCompare(u.id));
    });
    return (a, s) => (S(), R("svg", oE, [
      $("defs", null, [
        (S(!0), R(ue, null, Re(r.value, (l) => (S(), ae(nE, {
          id: l.id,
          key: l.id,
          type: l.type,
          color: l.color,
          width: l.width,
          height: l.height,
          markerUnits: l.markerUnits,
          "stroke-width": l.strokeWidth,
          orient: l.orient
        }, null, 8, ["id", "type", "color", "width", "height", "markerUnits", "stroke-width", "orient"]))), 128))
      ])
    ]));
  }
}), aE = {
  name: "Edges",
  compatConfig: { MODE: 3 }
}, sE = /* @__PURE__ */ ye({
  ...aE,
  setup(e) {
    const { findNode: t, getEdges: n, elevateEdgesOnSelect: i } = De();
    return (o, r) => (S(), R(ue, null, [
      V(rE),
      (S(!0), R(ue, null, Re(f(n), (a) => (S(), R("svg", {
        key: a.id,
        class: "vue-flow__edges vue-flow__container",
        style: ze({ zIndex: f(S_)(a, f(t), f(i)) })
      }, [
        V(f(Zk), {
          id: a.id
        }, null, 8, ["id"])
      ], 4))), 128)),
      V(f(Qk))
    ], 64));
  }
}), lE = ye({
  name: "Node",
  compatConfig: { MODE: 3 },
  props: ["id", "resizeObserver"],
  setup(e) {
    const {
      id: t,
      noPanClassName: n,
      selectNodesOnDrag: i,
      nodesSelectionActive: o,
      multiSelectionActive: r,
      emits: a,
      removeSelectedNodes: s,
      addSelectedNodes: l,
      updateNodeDimensions: c,
      onUpdateNodeInternals: u,
      getNodeTypes: d,
      nodeExtent: h,
      elevateNodesOnSelect: p,
      disableKeyboardA11y: v,
      ariaLiveMessage: g,
      snapToGrid: m,
      snapGrid: k,
      nodeDragThreshold: x,
      nodesDraggable: w,
      elementsSelectable: b,
      nodesConnectable: C,
      nodesFocusable: I,
      hooks: z
    } = De(), T = Y(null);
    Zt(Hf, T), Zt(Xs, e.id);
    const O = Ht(ar), D = Vn(), B = Gf(), { node: N, parentNode: H } = Yf(e.id), { emit: y, on: E } = U_(N, a), _ = Ne(() => typeof N.draggable > "u" ? w.value : N.draggable), L = Ne(() => typeof N.selectable > "u" ? b.value : N.selectable), F = Ne(() => typeof N.connectable > "u" ? C.value : N.connectable), J = Ne(() => typeof N.focusable > "u" ? I.value : N.focusable), X = U(
      () => L.value || _.value || z.value.nodeClick.hasListeners() || z.value.nodeDoubleClick.hasListeners() || z.value.nodeMouseEnter.hasListeners() || z.value.nodeMouseMove.hasListeners() || z.value.nodeMouseLeave.hasListeners()
    ), oe = Ne(() => !!N.dimensions.width && !!N.dimensions.height), se = U(() => {
      const A = N.type || "default", q = O?.[`node-${A}`];
      if (q)
        return q;
      let Q = N.template || d.value[A];
      if (typeof Q == "string" && D) {
        const de = Object.keys(D.appContext.components);
        de && de.includes(A) && (Q = gd(A, !1));
      }
      return Q && typeof Q != "string" ? Q : (a.error(new je(Ye.NODE_TYPE_MISSING, Q)), !1);
    }), W = qf({
      id: e.id,
      el: T,
      disabled: () => !_.value,
      selectable: L,
      dragHandle: () => N.dragHandle,
      onStart(A) {
        y.dragStart(A);
      },
      onDrag(A) {
        y.drag(A);
      },
      onStop(A) {
        y.dragStop(A);
      },
      onClick(A) {
        P(A);
      }
    }), K = U(() => N.class instanceof Function ? N.class(N) : N.class), G = U(() => {
      const A = (N.style instanceof Function ? N.style(N) : N.style) || {}, q = N.width instanceof Function ? N.width(N) : N.width, Q = N.height instanceof Function ? N.height(N) : N.height;
      return !A.width && q && (A.width = typeof q == "string" ? q : `${q}px`), !A.height && Q && (A.height = typeof Q == "string" ? Q : `${Q}px`), A;
    }), ee = Ne(() => Number(N.zIndex ?? G.value.zIndex ?? 0));
    return u((A) => {
      (A.includes(e.id) || !A.length) && re();
    }), Ue(() => {
      _e(
        () => N.hidden,
        (A = !1, q, Q) => {
          !A && T.value && (e.resizeObserver.observe(T.value), Q(() => {
            T.value && e.resizeObserver.unobserve(T.value);
          }));
        },
        { immediate: !0, flush: "post" }
      );
    }), _e([() => N.type, () => N.sourcePosition, () => N.targetPosition], () => {
      Ve(() => {
        c([{ id: e.id, nodeElement: T.value, forceUpdate: !0 }]);
      });
    }), _e(
      [
        () => N.position.x,
        () => N.position.y,
        () => {
          var A;
          return (A = H.value) == null ? void 0 : A.computedPosition.x;
        },
        () => {
          var A;
          return (A = H.value) == null ? void 0 : A.computedPosition.y;
        },
        () => {
          var A;
          return (A = H.value) == null ? void 0 : A.computedPosition.z;
        },
        ee,
        () => N.selected,
        () => N.dimensions.height,
        () => N.dimensions.width,
        () => {
          var A;
          return (A = H.value) == null ? void 0 : A.dimensions.height;
        },
        () => {
          var A;
          return (A = H.value) == null ? void 0 : A.dimensions.width;
        }
      ],
      ([A, q, Q, de, ve, ke]) => {
        const be = {
          x: A,
          y: q,
          z: ke + (p.value && N.selected ? 1e3 : 0)
        };
        typeof Q < "u" && typeof de < "u" ? N.computedPosition = b_({ x: Q, y: de, z: ve }, be) : N.computedPosition = be;
      },
      { flush: "post", immediate: !0 }
    ), _e([() => N.extent, h], ([A, q], [Q, de]) => {
      (A !== Q || q !== de) && te();
    }), N.extent === "parent" || typeof N.extent == "object" && "range" in N.extent && N.extent.range === "parent" ? Ua(() => oe).toBe(!0).then(te) : te(), () => N.hidden ? null : Pe(
      "div",
      {
        ref: T,
        "data-id": N.id,
        class: [
          "vue-flow__node",
          `vue-flow__node-${se.value === !1 ? "default" : N.type || "default"}`,
          {
            [n.value]: _.value,
            dragging: W?.value,
            draggable: _.value,
            selected: N.selected,
            selectable: L.value,
            parent: N.isParent
          },
          K.value
        ],
        style: {
          visibility: oe.value ? "visible" : "hidden",
          zIndex: N.computedPosition.z ?? ee.value,
          transform: `translate(${N.computedPosition.x}px,${N.computedPosition.y}px)`,
          pointerEvents: X.value ? "all" : "none",
          ...G.value
        },
        tabIndex: J.value ? 0 : void 0,
        role: J.value ? "group" : void 0,
        "aria-describedby": v.value ? void 0 : `${Sf}-${t}`,
        "aria-label": N.ariaLabel,
        "aria-roledescription": "node",
        ...N.domAttributes,
        onMouseenter: le,
        onMousemove: we,
        onMouseleave: $e,
        onContextmenu: pe,
        onClick: P,
        onDblclick: me,
        onKeydown: M
      },
      [
        Pe(se.value === !1 ? d.value.default : se.value, {
          id: N.id,
          type: N.type,
          data: N.data,
          events: { ...N.events, ...E },
          selected: N.selected,
          resizing: N.resizing,
          dragging: W.value,
          connectable: F.value,
          position: N.computedPosition,
          dimensions: N.dimensions,
          isValidTargetPos: N.isValidTargetPos,
          isValidSourcePos: N.isValidSourcePos,
          parent: N.parentNode,
          parentNodeId: N.parentNode,
          zIndex: N.computedPosition.z ?? ee.value,
          targetPosition: N.targetPosition,
          sourcePosition: N.sourcePosition,
          label: N.label,
          dragHandle: N.dragHandle,
          onUpdateNodeInternals: re
        })
      ]
    );
    function te() {
      const A = N.computedPosition, { computedPosition: q, position: Q } = Gs(
        N,
        m.value ? rr(A, k.value) : A,
        a.error,
        h.value,
        H.value
      );
      (N.computedPosition.x !== q.x || N.computedPosition.y !== q.y) && (N.computedPosition = { ...N.computedPosition, ...q }), (N.position.x !== Q.x || N.position.y !== Q.y) && (N.position = Q);
    }
    function re() {
      T.value && c([{ id: e.id, nodeElement: T.value, forceUpdate: !0 }]);
    }
    function le(A) {
      W?.value || y.mouseEnter({ event: A, node: N });
    }
    function we(A) {
      W?.value || y.mouseMove({ event: A, node: N });
    }
    function $e(A) {
      W?.value || y.mouseLeave({ event: A, node: N });
    }
    function pe(A) {
      return y.contextMenu({ event: A, node: N });
    }
    function me(A) {
      return y.doubleClick({ event: A, node: N });
    }
    function P(A) {
      L.value && (!i.value || !_.value || x.value > 0) && ns(
        N,
        r.value,
        l,
        s,
        o,
        !1,
        T.value
      ), y.click({ event: A, node: N });
    }
    function M(A) {
      if (!(Qa(A) || v.value))
        if (Nf.includes(A.key) && L.value) {
          const q = A.key === "Escape";
          ns(
            N,
            r.value,
            l,
            s,
            o,
            q,
            T.value
          );
        } else _.value && N.selected && Cn[A.key] && (A.preventDefault(), g.value = `Moved selected node ${A.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~N.position.x}, y: ${~~N.position.y}`, B(
          {
            x: Cn[A.key].x,
            y: Cn[A.key].y
          },
          A.shiftKey
        ));
    }
  }
}), uE = lE, cE = {
  height: "0",
  width: "0"
}, dE = {
  name: "EdgeLabelRenderer",
  compatConfig: { MODE: 3 }
}, fE = /* @__PURE__ */ ye({
  ...dE,
  setup(e) {
    const { viewportRef: t } = De(), n = Ne(() => {
      var i;
      return (i = t.value) == null ? void 0 : i.getElementsByClassName("vue-flow__edge-labels")[0];
    });
    return (i, o) => (S(), R("svg", null, [
      (S(), R("foreignObject", cE, [
        (S(), ae(Vm, {
          to: n.value,
          disabled: !n.value
        }, [
          Be(i.$slots, "default")
        ], 8, ["to", "disabled"]))
      ]))
    ]));
  }
});
function hE(e = { includeHiddenNodes: !1 }) {
  const { nodes: t } = De();
  return U(() => {
    if (t.value.length === 0)
      return !1;
    for (const n of t.value)
      if ((e.includeHiddenNodes || !n.hidden) && (n?.handleBounds === void 0 || n.dimensions.width === 0 || n.dimensions.height === 0))
        return !1;
    return !0;
  });
}
const pE = { class: "vue-flow__nodes vue-flow__container" }, vE = {
  name: "Nodes",
  compatConfig: { MODE: 3 }
}, mE = /* @__PURE__ */ ye({
  ...vE,
  setup(e) {
    const { getNodes: t, updateNodeDimensions: n, emits: i } = De(), o = hE(), r = Y();
    return _e(
      o,
      (a) => {
        a && Ve(() => {
          i.nodesInitialized(t.value);
        });
      },
      { immediate: !0 }
    ), Ue(() => {
      r.value = new ResizeObserver((a) => {
        const s = a.map((l) => ({
          id: l.target.getAttribute("data-id"),
          nodeElement: l.target,
          forceUpdate: !0
        }));
        Ve(() => n(s));
      });
    }), Qe(() => {
      var a;
      return (a = r.value) == null ? void 0 : a.disconnect();
    }), (a, s) => (S(), R("div", pE, [
      r.value ? (S(!0), R(ue, { key: 0 }, Re(f(t), (l, c, u, d) => {
        const h = [l.id];
        if (d && d.key === l.id && Fm(d, h))
          return d;
        const p = (S(), ae(f(uE), {
          id: l.id,
          key: l.id,
          "resize-observer": r.value
        }, null, 8, ["id", "resize-observer"]));
        return p.memo = h, p;
      }, s, 0), 128)) : Z("", !0)
    ]));
  }
});
function gE() {
  const { emits: e } = De();
  Ue(() => {
    if (Ff()) {
      const t = document.querySelector(".vue-flow__pane");
      t && window.getComputedStyle(t).zIndex !== "1" && e.error(new je(Ye.MISSING_STYLES));
    }
  });
}
const yE = /* @__PURE__ */ $("div", { class: "vue-flow__edge-labels" }, null, -1), wE = {
  name: "VueFlow",
  compatConfig: { MODE: 3 }
}, Qf = /* @__PURE__ */ ye({
  ...wE,
  props: {
    id: {},
    modelValue: {},
    nodes: {},
    edges: {},
    edgeTypes: {},
    nodeTypes: {},
    connectionMode: {},
    connectionLineType: {},
    connectionLineStyle: { default: void 0 },
    connectionLineOptions: { default: void 0 },
    connectionRadius: {},
    isValidConnection: { type: [Function, null], default: void 0 },
    deleteKeyCode: { default: void 0 },
    selectionKeyCode: { type: [Boolean, null], default: void 0 },
    multiSelectionKeyCode: { default: void 0 },
    zoomActivationKeyCode: { default: void 0 },
    panActivationKeyCode: { default: void 0 },
    snapToGrid: { type: Boolean, default: void 0 },
    snapGrid: {},
    onlyRenderVisibleElements: { type: Boolean, default: void 0 },
    edgesUpdatable: { type: [Boolean, String], default: void 0 },
    nodesDraggable: { type: Boolean, default: void 0 },
    nodesConnectable: { type: Boolean, default: void 0 },
    nodeDragThreshold: {},
    elementsSelectable: { type: Boolean, default: void 0 },
    selectNodesOnDrag: { type: Boolean, default: void 0 },
    panOnDrag: { type: [Boolean, Array], default: void 0 },
    minZoom: {},
    maxZoom: {},
    defaultViewport: {},
    translateExtent: {},
    nodeExtent: {},
    defaultMarkerColor: {},
    zoomOnScroll: { type: Boolean, default: void 0 },
    zoomOnPinch: { type: Boolean, default: void 0 },
    panOnScroll: { type: Boolean, default: void 0 },
    panOnScrollSpeed: {},
    panOnScrollMode: {},
    paneClickDistance: {},
    zoomOnDoubleClick: { type: Boolean, default: void 0 },
    preventScrolling: { type: Boolean, default: void 0 },
    selectionMode: {},
    edgeUpdaterRadius: {},
    fitViewOnInit: { type: Boolean, default: void 0 },
    connectOnClick: { type: Boolean, default: void 0 },
    applyDefault: { type: Boolean, default: void 0 },
    autoConnect: { type: [Boolean, Function], default: void 0 },
    noDragClassName: {},
    noWheelClassName: {},
    noPanClassName: {},
    defaultEdgeOptions: {},
    elevateEdgesOnSelect: { type: Boolean, default: void 0 },
    elevateNodesOnSelect: { type: Boolean, default: void 0 },
    disableKeyboardA11y: { type: Boolean, default: void 0 },
    edgesFocusable: { type: Boolean, default: void 0 },
    nodesFocusable: { type: Boolean, default: void 0 },
    autoPanOnConnect: { type: Boolean, default: void 0 },
    autoPanOnNodeDrag: { type: Boolean, default: void 0 },
    autoPanSpeed: {}
  },
  emits: ["nodesChange", "edgesChange", "nodesInitialized", "paneReady", "init", "updateNodeInternals", "error", "connect", "connectStart", "connectEnd", "clickConnectStart", "clickConnectEnd", "moveStart", "move", "moveEnd", "selectionDragStart", "selectionDrag", "selectionDragStop", "selectionContextMenu", "selectionStart", "selectionEnd", "viewportChangeStart", "viewportChange", "viewportChangeEnd", "paneScroll", "paneClick", "paneContextMenu", "paneMouseEnter", "paneMouseMove", "paneMouseLeave", "edgeUpdate", "edgeContextMenu", "edgeMouseEnter", "edgeMouseMove", "edgeMouseLeave", "edgeDoubleClick", "edgeClick", "edgeUpdateStart", "edgeUpdateEnd", "nodeContextMenu", "nodeMouseEnter", "nodeMouseMove", "nodeMouseLeave", "nodeDoubleClick", "nodeClick", "nodeDragStart", "nodeDrag", "nodeDragStop", "miniMapNodeClick", "miniMapNodeDoubleClick", "miniMapNodeMouseEnter", "miniMapNodeMouseMove", "miniMapNodeMouseLeave", "update:modelValue", "update:nodes", "update:edges"],
  setup(e, { expose: t, emit: n }) {
    const i = e, o = md(), r = Nr(i, "modelValue", n), a = Nr(i, "nodes", n), s = Nr(i, "edges", n), l = De(i), c = j_({ modelValue: r, nodes: a, edges: s }, i, l);
    return K_(n, l.hooks), Gk(), gE(), Zt(ar, o), Bm(c), t(l), (u, d) => (S(), R("div", {
      ref: f(l).vueFlowRef,
      class: "vue-flow"
    }, [
      V(Fk, null, {
        default: ne(() => [
          V(sE),
          yE,
          V(mE),
          Be(u.$slots, "zoom-pane")
        ]),
        _: 3
      }),
      Be(u.$slots, "default"),
      V(Yk)
    ], 512));
  }
}), bE = {
  name: "Panel",
  compatConfig: { MODE: 3 }
}, eh = /* @__PURE__ */ ye({
  ...bE,
  props: {
    position: {}
  },
  setup(e) {
    const t = e, { userSelectionActive: n } = De(), i = U(() => `${t.position}`.split("-"));
    return (o, r) => (S(), R("div", {
      class: Ie(["vue-flow__panel", i.value]),
      style: ze({ pointerEvents: f(n) ? "none" : "all" })
    }, [
      Be(o.$slots, "default")
    ], 6));
  }
}), yo = 216, Ao = 76, is = 64, Kn = 6, rs = 10, Br = rs * 2, th = 34, _E = 4, as = 26, Di = 304, kE = 20;
function nh(e, t = !1) {
  const i = e.length > 1 || (e[0]?.id ?? "") !== "" ? Math.max(e.length, 1) : 0, o = t ? th : 0, r = Math.max(1, Math.floor((Di - Br - o + Kn) / (is + Kn))), a = i ? Math.min(i, _E, r) : 0, s = i ? Math.ceil(i / a) : 0, l = i <= 2 ? yo : Br + o + a * is + (a - 1) * Kn, c = Math.min(Di, Math.max(yo, l)), u = a ? Math.floor((c - Br - o - (a - 1) * Kn) / a) : 0;
  return {
    width: c,
    height: Ao + Math.max(0, s - 1) * as,
    columns: a,
    rows: s,
    cellWidth: u
  };
}
const EE = ["title", "aria-label"], xE = ["title"], $E = {
  key: 2,
  class: "wfn-lock",
  title: "Workflow input/output step — locked and can’t be deleted"
}, SE = { class: "wfn-well" }, CE = {
  key: 0,
  class: "wfn-status wfn-status--ok",
  "aria-hidden": "true"
}, NE = {
  key: 1,
  class: "wfn-status wfn-status--fail",
  "aria-hidden": "true"
}, IE = { class: "wfn-body" }, AE = { class: "wfn-kind" }, ME = { class: "wfn-title" }, TE = {
  key: 0,
  class: "wfn-sub"
}, OE = {
  key: 3,
  class: "wfn-await"
}, RE = {
  key: 0,
  class: "wfn-portrow",
  role: "group",
  "aria-label": "Outputs"
}, DE = ["title"], PE = {
  key: 2,
  class: "wfn-failport"
}, LE = {
  key: 0,
  class: "wfn-faillabel"
}, oh = /* @__PURE__ */ ye({
  __name: "WorkflowNode",
  props: {
    data: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, n = U(() => t.data.outPorts.length > 1 || (t.data.outPorts[0]?.id ?? "") !== ""), i = U(() => t.data.boundaryRole), o = U(() => i.value !== "start"), r = U(() => i.value !== "finish" && i.value !== "error"), a = { position: "relative", transform: "none", left: "auto", top: "auto" }, s = { position: "relative", transform: "none", left: "auto", top: "auto", width: "9px", height: "9px" }, l = U(() => nh(t.data.outPorts, t.data.failedPort)), c = U(() => ({
      width: `${l.value.width}px`,
      minHeight: `${l.value.height}px`,
      "--wfn-port-columns": String(l.value.columns),
      "--wfn-port-rows": String(l.value.rows),
      "--wfn-port-cell-width": `${l.value.cellWidth}px`,
      "--wfn-port-row-height": `${as}px`,
      "--wfn-port-left": `${rs}px`,
      "--wfn-port-right": `${rs + (t.data.failedPort ? th : 0)}px`,
      "--wfn-port-gap": `${Kn}px`,
      "--wfn-port-min-width": `${is}px`,
      ...n.value ? {
        paddingBottom: `${kE + Math.max(0, l.value.rows - 1) * as}px`
      } : {}
    }));
    return (u, d) => (S(), R("div", {
      class: Ie(["wfn", [
        `wfn--${e.data.kind}`,
        f(Sd)(e.data.hueVar),
        e.selected && "wfn--selected",
        `is-${e.data.runStatus}`,
        n.value && "wfn--ports",
        e.data.failedPort && "wfn--has-failport",
        e.data.pinned && "wfn--pinned",
        e.data.failedWired && "wfn--failwired",
        e.data.issue && "wfn--issue",
        i.value && `wfn--boundary wfn--boundary-${i.value}`
      ]]),
      style: ze(c.value),
      title: e.data.issue || e.data.ref || e.data.title,
      role: "group",
      "aria-label": `${e.data.kindLabel}: ${e.data.title}${e.data.runStatus !== "idle" ? `, ${e.data.runStatus}` : ""}`
    }, [
      e.data.issue ? (S(), R("span", {
        key: 0,
        class: "wfn-issue",
        title: e.data.issue,
        "aria-hidden": "true"
      }, [
        V(f(ie), { icon: "tabler:alert-triangle" })
      ], 8, xE)) : Z("", !0),
      o.value ? (S(), R(ue, { key: 1 }, [
        V(f(xt), {
          id: "in-top",
          type: "target",
          position: f(ge).Top,
          class: "wfn-port",
          "aria-label": "Connect into step",
          title: "Connect into step"
        }, null, 8, ["position"]),
        V(f(xt), {
          id: "in-left",
          type: "target",
          position: f(ge).Left,
          class: "wfn-port",
          "aria-label": "Connect into step",
          title: "Connect into step"
        }, null, 8, ["position"])
      ], 64)) : Z("", !0),
      d[1] || (d[1] = $("span", {
        class: "wfn-ring",
        "aria-hidden": "true"
      }, null, -1)),
      e.data.pinned ? (S(), R("span", $E, [
        V(f(ie), {
          icon: "tabler:lock",
          "aria-hidden": "true"
        })
      ])) : Z("", !0),
      $("div", SE, [
        V(f(ie), {
          icon: e.data.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        e.data.runStatus === "completed" ? (S(), R("span", CE, [
          V(f(ie), { icon: "tabler:check" })
        ])) : e.data.runStatus === "failed" ? (S(), R("span", NE, [
          V(f(ie), { icon: "tabler:x" })
        ])) : Z("", !0)
      ]),
      $("div", IE, [
        $("div", AE, j(e.data.kindLabel), 1),
        $("div", ME, j(e.data.title), 1),
        e.data.sub ? (S(), R("div", TE, j(e.data.sub), 1)) : Z("", !0)
      ]),
      e.data.runStatus === "awaiting" ? (S(), R("span", OE, [
        d[0] || (d[0] = $("span", {
          class: "wfn-await-pulse",
          "aria-hidden": "true"
        }, null, -1)),
        $("span", null, j(e.data.awaitingLabel || "Waiting for review"), 1)
      ])) : Z("", !0),
      r.value ? (S(), R(ue, { key: 4 }, [
        n.value ? (S(), R("span", RE, [
          (S(!0), R(ue, null, Re(e.data.outPorts, (h) => (S(), R("span", {
            key: h.id,
            class: "wfn-portslot"
          }, [
            V(f(xt), {
              id: h.id,
              type: "source",
              position: f(ge).Bottom,
              class: Ie(["wfn-port wfn-port--named", `wfn-port--${h.id}`]),
              style: a,
              "aria-label": `Connect from ${h.label}`,
              title: `Connect from ${h.label}`
            }, null, 8, ["id", "position", "class", "aria-label", "title"]),
            $("span", {
              class: "wfn-portlabel",
              title: h.label
            }, j(h.label), 9, DE)
          ]))), 128))
        ])) : (S(), R(ue, { key: 1 }, [
          V(f(xt), {
            id: "out-bottom",
            type: "source",
            position: f(ge).Bottom,
            class: "wfn-port",
            "aria-label": "Connect from output",
            title: "Connect from output"
          }, null, 8, ["position"]),
          V(f(xt), {
            id: "out-right",
            type: "source",
            position: f(ge).Right,
            class: "wfn-port",
            "aria-label": "Connect from output",
            title: "Connect from output"
          }, null, 8, ["position"])
        ], 64)),
        e.data.failedPort ? (S(), R("span", PE, [
          V(f(xt), {
            id: "failed",
            type: "source",
            position: f(ge).Right,
            class: "wfn-port wfn-port--failed wfn-port--failaff",
            style: s,
            "aria-label": "Connect from Failed",
            title: "Connect from Failed"
          }, null, 8, ["position"]),
          e.data.failedWired ? (S(), R("span", LE, "Failed")) : Z("", !0)
        ])) : Z("", !0)
      ], 64)) : Z("", !0)
    ], 14, EE));
  }
});
var ss = "http://www.w3.org/1999/xhtml";
const Tu = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: ss,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function ih(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Tu.hasOwnProperty(t) ? { space: Tu[t], local: e } : e;
}
function VE(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === ss && t.documentElement.namespaceURI === ss ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function BE(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function rh(e) {
  var t = ih(e);
  return (t.local ? BE : VE)(t);
}
function zE() {
}
function ah(e) {
  return e == null ? zE : function() {
    return this.querySelector(e);
  };
}
function FE(e) {
  typeof e != "function" && (e = ah(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = new Array(a), l, c, u = 0; u < a; ++u)
      (l = r[u]) && (c = e.call(l, l.__data__, u, r)) && ("__data__" in l && (c.__data__ = l.__data__), s[u] = c);
  return new ft(i, this._parents);
}
function HE(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function qE() {
  return [];
}
function UE(e) {
  return e == null ? qE : function() {
    return this.querySelectorAll(e);
  };
}
function WE(e) {
  return function() {
    return HE(e.apply(this, arguments));
  };
}
function YE(e) {
  typeof e == "function" ? e = WE(e) : e = UE(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), o.push(l));
  return new ft(i, o);
}
function GE(e) {
  return function() {
    return this.matches(e);
  };
}
function sh(e) {
  return function(t) {
    return t.matches(e);
  };
}
var jE = Array.prototype.find;
function XE(e) {
  return function() {
    return jE.call(this.children, e);
  };
}
function KE() {
  return this.firstElementChild;
}
function ZE(e) {
  return this.select(e == null ? KE : XE(typeof e == "function" ? e : sh(e)));
}
var JE = Array.prototype.filter;
function QE() {
  return Array.from(this.children);
}
function ex(e) {
  return function() {
    return JE.call(this.children, e);
  };
}
function tx(e) {
  return this.selectAll(e == null ? QE : ex(typeof e == "function" ? e : sh(e)));
}
function nx(e) {
  typeof e != "function" && (e = GE(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new ft(i, this._parents);
}
function lh(e) {
  return new Array(e.length);
}
function ox() {
  return new ft(this._enter || this._groups.map(lh), this._parents);
}
function Pi(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Pi.prototype = {
  constructor: Pi,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function ix(e) {
  return function() {
    return e;
  };
}
function rx(e, t, n, i, o, r) {
  for (var a = 0, s, l = t.length, c = r.length; a < c; ++a)
    (s = t[a]) ? (s.__data__ = r[a], i[a] = s) : n[a] = new Pi(e, r[a]);
  for (; a < l; ++a)
    (s = t[a]) && (o[a] = s);
}
function ax(e, t, n, i, o, r, a) {
  var s, l, c = /* @__PURE__ */ new Map(), u = t.length, d = r.length, h = new Array(u), p;
  for (s = 0; s < u; ++s)
    (l = t[s]) && (h[s] = p = a.call(l, l.__data__, s, t) + "", c.has(p) ? o[s] = l : c.set(p, l));
  for (s = 0; s < d; ++s)
    p = a.call(e, r[s], s, r) + "", (l = c.get(p)) ? (i[s] = l, l.__data__ = r[s], c.delete(p)) : n[s] = new Pi(e, r[s]);
  for (s = 0; s < u; ++s)
    (l = t[s]) && c.get(h[s]) === l && (o[s] = l);
}
function sx(e) {
  return e.__data__;
}
function lx(e, t) {
  if (!arguments.length) return Array.from(this, sx);
  var n = t ? ax : rx, i = this._parents, o = this._groups;
  typeof e != "function" && (e = ix(e));
  for (var r = o.length, a = new Array(r), s = new Array(r), l = new Array(r), c = 0; c < r; ++c) {
    var u = i[c], d = o[c], h = d.length, p = ux(e.call(u, u && u.__data__, c, i)), v = p.length, g = s[c] = new Array(v), m = a[c] = new Array(v), k = l[c] = new Array(h);
    n(u, d, g, m, k, p, t);
    for (var x = 0, w = 0, b, C; x < v; ++x)
      if (b = g[x]) {
        for (x >= w && (w = x + 1); !(C = m[w]) && ++w < v; ) ;
        b._next = C || null;
      }
  }
  return a = new ft(a, i), a._enter = s, a._exit = l, a;
}
function ux(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function cx() {
  return new ft(this._exit || this._groups.map(lh), this._parents);
}
function dx(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function fx(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), s = new Array(o), l = 0; l < a; ++l)
    for (var c = n[l], u = i[l], d = c.length, h = s[l] = new Array(d), p, v = 0; v < d; ++v)
      (p = c[v] || u[v]) && (h[v] = p);
  for (; l < o; ++l)
    s[l] = n[l];
  return new ft(s, this._parents);
}
function hx() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function px(e) {
  e || (e = vx);
  function t(d, h) {
    return d && h ? e(d.__data__, h.__data__) : !d - !h;
  }
  for (var n = this._groups, i = n.length, o = new Array(i), r = 0; r < i; ++r) {
    for (var a = n[r], s = a.length, l = o[r] = new Array(s), c, u = 0; u < s; ++u)
      (c = a[u]) && (l[u] = c);
    l.sort(t);
  }
  return new ft(o, this._parents).order();
}
function vx(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function mx() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function gx() {
  return Array.from(this);
}
function yx() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a) return a;
    }
  return null;
}
function wx() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function bx() {
  return !this.node();
}
function _x(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, s; r < a; ++r)
      (s = o[r]) && e.call(s, s.__data__, r, o);
  return this;
}
function kx(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Ex(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function xx(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function $x(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function Sx(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function Cx(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function Nx(e, t) {
  var n = ih(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? Ex : kx : typeof t == "function" ? n.local ? Cx : Sx : n.local ? $x : xx)(n, t));
}
function uh(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function Ix(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Ax(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function Mx(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function Tx(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? Ix : typeof t == "function" ? Mx : Ax)(e, t, n ?? "")) : Ox(this.node(), e);
}
function Ox(e, t) {
  return e.style.getPropertyValue(t) || uh(e).getComputedStyle(e, null).getPropertyValue(t);
}
function Rx(e) {
  return function() {
    delete this[e];
  };
}
function Dx(e, t) {
  return function() {
    this[e] = t;
  };
}
function Px(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function Lx(e, t) {
  return arguments.length > 1 ? this.each((t == null ? Rx : typeof t == "function" ? Px : Dx)(e, t)) : this.node()[e];
}
function ch(e) {
  return e.trim().split(/^|\s+/);
}
function Js(e) {
  return e.classList || new dh(e);
}
function dh(e) {
  this._node = e, this._names = ch(e.getAttribute("class") || "");
}
dh.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function fh(e, t) {
  for (var n = Js(e), i = -1, o = t.length; ++i < o; ) n.add(t[i]);
}
function hh(e, t) {
  for (var n = Js(e), i = -1, o = t.length; ++i < o; ) n.remove(t[i]);
}
function Vx(e) {
  return function() {
    fh(this, e);
  };
}
function Bx(e) {
  return function() {
    hh(this, e);
  };
}
function zx(e, t) {
  return function() {
    (t.apply(this, arguments) ? fh : hh)(this, e);
  };
}
function Fx(e, t) {
  var n = ch(e + "");
  if (arguments.length < 2) {
    for (var i = Js(this.node()), o = -1, r = n.length; ++o < r; ) if (!i.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? zx : t ? Vx : Bx)(n, t));
}
function Hx() {
  this.textContent = "";
}
function qx(e) {
  return function() {
    this.textContent = e;
  };
}
function Ux(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function Wx(e) {
  return arguments.length ? this.each(e == null ? Hx : (typeof e == "function" ? Ux : qx)(e)) : this.node().textContent;
}
function Yx() {
  this.innerHTML = "";
}
function Gx(e) {
  return function() {
    this.innerHTML = e;
  };
}
function jx(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function Xx(e) {
  return arguments.length ? this.each(e == null ? Yx : (typeof e == "function" ? jx : Gx)(e)) : this.node().innerHTML;
}
function Kx() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Zx() {
  return this.each(Kx);
}
function Jx() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Qx() {
  return this.each(Jx);
}
function e$(e) {
  var t = typeof e == "function" ? e : rh(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function t$() {
  return null;
}
function n$(e, t) {
  var n = typeof e == "function" ? e : rh(e), i = t == null ? t$ : typeof t == "function" ? t : ah(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function o$() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function i$() {
  return this.each(o$);
}
function r$() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function a$() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function s$(e) {
  return this.select(e ? a$ : r$);
}
function l$(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function u$(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function c$(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function d$(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function f$(e, t, n) {
  return function() {
    var i = this.__on, o, r = u$(t);
    if (i) {
      for (var a = 0, s = i.length; a < s; ++a)
        if ((o = i[a]).type === e.type && o.name === e.name) {
          this.removeEventListener(o.type, o.listener, o.options), this.addEventListener(o.type, o.listener = r, o.options = n), o.value = t;
          return;
        }
    }
    this.addEventListener(e.type, r, n), o = { type: e.type, name: e.name, value: t, listener: r, options: n }, i ? i.push(o) : this.__on = [o];
  };
}
function h$(e, t, n) {
  var i = c$(e + ""), o, r = i.length, a;
  if (arguments.length < 2) {
    var s = this.node().__on;
    if (s) {
      for (var l = 0, c = s.length, u; l < c; ++l)
        for (o = 0, u = s[l]; o < r; ++o)
          if ((a = i[o]).type === u.type && a.name === u.name)
            return u.value;
    }
    return;
  }
  for (s = t ? f$ : d$, o = 0; o < r; ++o) this.each(s(i[o], t, n));
  return this;
}
function ph(e, t, n) {
  var i = uh(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function p$(e, t) {
  return function() {
    return ph(this, e, t);
  };
}
function v$(e, t) {
  return function() {
    return ph(this, e, t.apply(this, arguments));
  };
}
function m$(e, t) {
  return this.each((typeof t == "function" ? v$ : p$)(e, t));
}
function* g$() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var y$ = [null];
function ft(e, t) {
  this._groups = e, this._parents = t;
}
function w$() {
  return this;
}
ft.prototype = {
  constructor: ft,
  select: FE,
  selectAll: YE,
  selectChild: ZE,
  selectChildren: tx,
  filter: nx,
  data: lx,
  enter: ox,
  exit: cx,
  join: dx,
  merge: fx,
  selection: w$,
  order: hx,
  sort: px,
  call: mx,
  nodes: gx,
  node: yx,
  size: wx,
  empty: bx,
  each: _x,
  attr: Nx,
  style: Tx,
  property: Lx,
  classed: Fx,
  text: Wx,
  html: Xx,
  raise: Zx,
  lower: Qx,
  append: e$,
  insert: n$,
  remove: i$,
  clone: s$,
  datum: l$,
  on: h$,
  dispatch: m$,
  [Symbol.iterator]: g$
};
function wo(e) {
  return typeof e == "string" ? new ft([[document.querySelector(e)]], [document.documentElement]) : new ft([[e]], y$);
}
function b$(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Ou(e, t) {
  if (e = b$(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var i = n.createSVGPoint();
      return i.x = e.clientX, i.y = e.clientY, i = i.matrixTransform(t.getScreenCTM().inverse()), [i.x, i.y];
    }
    if (t.getBoundingClientRect) {
      var o = t.getBoundingClientRect();
      return [e.clientX - o.left - t.clientLeft, e.clientY - o.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
var _$ = { value: () => {
} };
function vh() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new di(n);
}
function di(e) {
  this._ = e;
}
function k$(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", o = n.indexOf(".");
    if (o >= 0 && (i = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
di.prototype = vh.prototype = {
  constructor: di,
  on: function(e, t) {
    var n = this._, i = k$(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; ) if ((o = (e = i[r]).type) && (o = E$(n[o], e.name))) return o;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++r < a; )
      if (o = (e = i[r]).type) n[o] = Ru(n[o], e.name, t);
      else if (t == null) for (o in n) n[o] = Ru(n[o], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new di(e);
  },
  call: function(e, t) {
    if ((o = arguments.length - 2) > 0) for (var n = new Array(o), i = 0, o, r; i < o; ++i) n[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (r = this._[e], i = 0, o = r.length; i < o; ++i) r[i].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (var i = this._[e], o = 0, r = i.length; o < r; ++o) i[o].value.apply(t, n);
  }
};
function E$(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function Ru(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = _$, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
const x$ = { passive: !1 }, bo = { capture: !0, passive: !1 };
function zr(e) {
  e.stopImmediatePropagation();
}
function Nn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function $$(e) {
  var t = e.document.documentElement, n = wo(e).on("dragstart.drag", Nn, bo);
  "onselectstart" in t ? n.on("selectstart.drag", Nn, bo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function S$(e, t) {
  var n = e.document.documentElement, i = wo(e).on("dragstart.drag", null);
  t && (i.on("click.drag", Nn, bo), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const Xo = (e) => () => e;
function ls(e, {
  sourceEvent: t,
  subject: n,
  target: i,
  identifier: o,
  active: r,
  x: a,
  y: s,
  dx: l,
  dy: c,
  dispatch: u
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    subject: { value: n, enumerable: !0, configurable: !0 },
    target: { value: i, enumerable: !0, configurable: !0 },
    identifier: { value: o, enumerable: !0, configurable: !0 },
    active: { value: r, enumerable: !0, configurable: !0 },
    x: { value: a, enumerable: !0, configurable: !0 },
    y: { value: s, enumerable: !0, configurable: !0 },
    dx: { value: l, enumerable: !0, configurable: !0 },
    dy: { value: c, enumerable: !0, configurable: !0 },
    _: { value: u }
  });
}
ls.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function C$(e) {
  return !e.ctrlKey && !e.button;
}
function N$() {
  return this.parentNode;
}
function I$(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function A$() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function M$() {
  var e = C$, t = N$, n = I$, i = A$, o = {}, r = vh("start", "drag", "end"), a = 0, s, l, c, u, d = 0;
  function h(b) {
    b.on("mousedown.drag", p).filter(i).on("touchstart.drag", m).on("touchmove.drag", k, x$).on("touchend.drag touchcancel.drag", x).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function p(b, C) {
    if (!(u || !e.call(this, b, C))) {
      var I = w(this, t.call(this, b, C), b, C, "mouse");
      I && (wo(b.view).on("mousemove.drag", v, bo).on("mouseup.drag", g, bo), $$(b.view), zr(b), c = !1, s = b.clientX, l = b.clientY, I("start", b));
    }
  }
  function v(b) {
    if (Nn(b), !c) {
      var C = b.clientX - s, I = b.clientY - l;
      c = C * C + I * I > d;
    }
    o.mouse("drag", b);
  }
  function g(b) {
    wo(b.view).on("mousemove.drag mouseup.drag", null), S$(b.view, c), Nn(b), o.mouse("end", b);
  }
  function m(b, C) {
    if (e.call(this, b, C)) {
      var I = b.changedTouches, z = t.call(this, b, C), T = I.length, O, D;
      for (O = 0; O < T; ++O)
        (D = w(this, z, b, C, I[O].identifier, I[O])) && (zr(b), D("start", b, I[O]));
    }
  }
  function k(b) {
    var C = b.changedTouches, I = C.length, z, T;
    for (z = 0; z < I; ++z)
      (T = o[C[z].identifier]) && (Nn(b), T("drag", b, C[z]));
  }
  function x(b) {
    var C = b.changedTouches, I = C.length, z, T;
    for (u && clearTimeout(u), u = setTimeout(function() {
      u = null;
    }, 500), z = 0; z < I; ++z)
      (T = o[C[z].identifier]) && (zr(b), T("end", b, C[z]));
  }
  function w(b, C, I, z, T, O) {
    var D = r.copy(), B = Ou(O || I, C), N, H, y;
    if ((y = n.call(b, new ls("beforestart", {
      sourceEvent: I,
      target: h,
      identifier: T,
      active: a,
      x: B[0],
      y: B[1],
      dx: 0,
      dy: 0,
      dispatch: D
    }), z)) != null)
      return N = y.x - B[0] || 0, H = y.y - B[1] || 0, function E(_, L, F) {
        var J = B, X;
        switch (_) {
          case "start":
            o[T] = E, X = a++;
            break;
          case "end":
            delete o[T], --a;
          case "drag":
            B = Ou(F || L, C), X = a;
            break;
        }
        D.call(
          _,
          b,
          new ls(_, {
            sourceEvent: L,
            subject: y,
            target: h,
            identifier: T,
            active: X,
            x: B[0] + N,
            y: B[1] + H,
            dx: B[0] - J[0],
            dy: B[1] - J[1],
            dispatch: D
          }),
          z
        );
      };
  }
  return h.filter = function(b) {
    return arguments.length ? (e = typeof b == "function" ? b : Xo(!!b), h) : e;
  }, h.container = function(b) {
    return arguments.length ? (t = typeof b == "function" ? b : Xo(b), h) : t;
  }, h.subject = function(b) {
    return arguments.length ? (n = typeof b == "function" ? b : Xo(b), h) : n;
  }, h.touchable = function(b) {
    return arguments.length ? (i = typeof b == "function" ? b : Xo(!!b), h) : i;
  }, h.on = function() {
    var b = r.on.apply(r, arguments);
    return b === r ? h : b;
  }, h.clickDistance = function(b) {
    return arguments.length ? (d = (b = +b) * b, h) : Math.sqrt(d);
  }, h;
}
var hn = /* @__PURE__ */ ((e) => (e.Line = "line", e.Handle = "handle", e))(hn || {});
function T$({ width: e, prevWidth: t, height: n, prevHeight: i, invertX: o, invertY: r }) {
  const a = e - t, s = n - i, l = [a > 0 ? 1 : a < 0 ? -1 : 0, s > 0 ? 1 : s < 0 ? -1 : 0];
  return a && o && (l[0] = l[0] * -1), s && r && (l[1] = l[1] * -1), l;
}
const O$ = {
  [hn.Line]: "right",
  [hn.Handle]: "bottom-right"
}, R$ = {
  [hn.Line]: "borderColor",
  [hn.Handle]: "backgroundColor"
}, D$ = {
  name: "ResizeControl",
  compatConfig: { MODE: 3 }
}, Du = /* @__PURE__ */ ye({
  ...D$,
  props: {
    nodeId: {},
    color: {},
    minWidth: { default: 10 },
    minHeight: { default: 10 },
    maxWidth: { default: Number.MAX_VALUE },
    maxHeight: { default: Number.MAX_VALUE },
    position: {},
    variant: { default: "handle" },
    shouldResize: {},
    keepAspectRatio: { type: [Boolean, Number], default: !1 },
    autoScale: { type: Boolean, default: !0 },
    handleClassName: {},
    handleStyle: {},
    lineClassName: {},
    lineStyle: {},
    isVisible: { type: Boolean }
  },
  emits: ["resizeStart", "resize", "resizeEnd"],
  setup(e, { emit: t }) {
    const n = e, i = { width: 0, height: 0, x: 0, y: 0 }, o = {
      ...i,
      pointerX: 0,
      pointerY: 0,
      aspectRatio: 1
    }, { findNode: r, emits: a, viewport: s, noDragClassName: l } = De(), c = Uf(), u = Y();
    let d = o, h = i;
    const p = Ne(() => n.position ?? O$[n.variant]), v = U(() => p.value.split("-")), g = Ne(() => n.color ? { [R$[n.variant]]: n.color } : {}), m = Ne(() => n.variant === hn.Handle), k = U(() => m.value && n.autoScale ? `${Math.max(1 / s.value.zoom, 1)}` : void 0);
    return yd((x) => {
      if (!u.value || !n.nodeId)
        return;
      const w = wo(u.value), b = p.value.includes("right") || p.value.includes("left"), C = p.value.includes("bottom") || p.value.includes("top"), I = p.value.includes("left"), z = p.value.includes("top"), T = M$().on("start", (O) => {
        const D = r(n.nodeId), { xSnapped: B, ySnapped: N } = c(O);
        h = {
          width: D?.dimensions.width ?? 0,
          height: D?.dimensions.height ?? 0,
          x: D?.position.x ?? 0,
          y: D?.position.y ?? 0
        }, d = {
          ...h,
          pointerX: B,
          pointerY: N,
          aspectRatio: h.width / h.height
        }, t("resizeStart", { event: O, params: h });
      }).on("drag", (O) => {
        var D;
        const { xSnapped: B, ySnapped: N } = c(O), H = r(n.nodeId);
        if (H) {
          const y = [], {
            pointerX: E,
            pointerY: _,
            width: L,
            height: F,
            x: J,
            y: X,
            aspectRatio: oe
          } = d, { x: se, y: W, width: K, height: G } = h, ee = Math.floor(b ? B - E : 0), te = Math.floor(C ? N - _ : 0);
          let re = zt(L + (I ? -ee : ee), n.minWidth, n.maxWidth), le = zt(F + (z ? -te : te), n.minHeight, n.maxHeight);
          if (n.keepAspectRatio) {
            const M = re / le;
            let A = oe;
            typeof n.keepAspectRatio == "number" && M !== n.keepAspectRatio && (A = n.keepAspectRatio);
            const q = b && C, Q = b && !C, de = C && !b;
            re = M <= A && q || de ? le * A : re, le = M > A && q || Q ? re / A : le, re >= n.maxWidth ? (re = n.maxWidth, le = n.maxWidth / A) : re <= n.minWidth && (re = n.minWidth, le = n.minWidth / A), le >= n.maxHeight ? (le = n.maxHeight, re = n.maxHeight * A) : le <= n.minHeight && (le = n.minHeight, re = n.minHeight * A);
          }
          const we = re !== K, $e = le !== G;
          if (I || z) {
            const M = I ? J - (re - L) : J, A = z ? X - (le - F) : X, q = M !== se && we, Q = A !== W && $e;
            if (q || Q) {
              const de = {
                id: H.id,
                type: "position",
                from: H.position,
                position: {
                  x: q ? M : se,
                  y: Q ? A : W
                }
              };
              y.push(de), h.x = de.position.x, h.y = de.position.y;
            }
          }
          if (n.nodeId && (we || $e)) {
            const M = {
              id: n.nodeId,
              type: "dimensions",
              updateStyle: !0,
              resizing: !0,
              dimensions: {
                width: re,
                height: le
              }
            };
            y.push(M), h.width = re, h.height = le;
          }
          if (y.length === 0)
            return;
          const pe = T$({
            width: h.width,
            prevWidth: K,
            height: h.height,
            prevHeight: G,
            invertX: I,
            invertY: z
          }), me = { ...h, direction: pe };
          if (((D = n.shouldResize) == null ? void 0 : D.call(n, O, me)) === !1)
            return;
          t("resize", { event: O, params: me }), a.nodesChange(y);
        }
      }).on("end", (O) => {
        if (n.nodeId) {
          const D = {
            id: n.nodeId,
            type: "dimensions",
            resizing: !1
          };
          t("resizeEnd", { event: O, params: h }), a.nodesChange([D]);
        }
      });
      w.call(T), x(() => {
        w.on(".drag", null);
      });
    }), (x, w) => (S(), R("div", {
      ref_key: "resizeControlRef",
      ref: u,
      class: Ie(["vue-flow__resize-control", [...v.value, x.variant, f(l)]]),
      style: ze({
        ...g.value,
        scale: k.value
      })
    }, [
      Be(x.$slots, "default")
    ], 6));
  }
}), P$ = {
  name: "NodeResizer",
  compatConfig: { MODE: 3 },
  inheritAttrs: !1
}, mh = /* @__PURE__ */ ye({
  ...P$,
  props: {
    nodeId: {},
    color: {},
    handleClassName: {},
    handleStyle: {},
    lineClassName: {},
    lineStyle: {},
    isVisible: { type: Boolean, default: !0 },
    minWidth: {},
    minHeight: {},
    maxWidth: {},
    maxHeight: {},
    shouldResize: {},
    keepAspectRatio: { type: [Boolean, Number] },
    autoScale: { type: Boolean, default: !0 }
  },
  emits: ["resizeStart", "resize", "resizeEnd"],
  setup(e, { emit: t }) {
    const n = e, { findNode: i, emits: o } = De(), r = ["top-left", "top-right", "bottom-left", "bottom-right"], a = ["top", "right", "bottom", "left"], s = Ht(Xs, null), l = Ne(() => typeof n.nodeId == "string" ? n.nodeId : s), c = U(() => i(l.value));
    return _e(
      [
        () => n.minWidth,
        () => n.minHeight,
        () => n.maxWidth,
        () => n.maxHeight,
        () => {
          var u;
          return !!((u = c.value) != null && u.dimensions.width) && !!c.value.dimensions.height;
        }
      ],
      ([u, d, h, p, v]) => {
        const g = c.value;
        if (g && v) {
          const m = {
            id: g.id,
            type: "dimensions",
            updateStyle: !0,
            dimensions: {
              width: g.dimensions.width,
              height: g.dimensions.height
            }
          };
          u && g.dimensions.width < u && (m.dimensions.width = u), d && g.dimensions.height < d && (m.dimensions.height = d), h && g.dimensions.width > h && (m.dimensions.width = h), p && g.dimensions.height > p && (m.dimensions.height = p), (m.dimensions.width !== g.dimensions.width || m.dimensions.height !== g.dimensions.height) && o.nodesChange([m]);
        }
      },
      { flush: "post", immediate: !0 }
    ), (u, d) => u.isVisible ? (S(), R(ue, { key: 0 }, [
      (S(), R(ue, null, Re(a, (h) => V(Du, {
        key: h,
        class: Ie(u.lineClassName),
        style: ze(u.lineStyle),
        "node-id": l.value,
        position: h,
        variant: f(hn).Line,
        color: u.color,
        "min-width": u.minWidth,
        "min-height": u.minHeight,
        "max-width": u.maxWidth,
        "max-height": u.maxHeight,
        "should-resize": u.shouldResize,
        "keep-aspect-ratio": u.keepAspectRatio,
        "auto-scale": u.autoScale,
        onResizeStart: d[0] || (d[0] = (p) => t("resizeStart", p)),
        onResize: d[1] || (d[1] = (p) => t("resize", p)),
        onResizeEnd: d[2] || (d[2] = (p) => t("resizeEnd", p))
      }, null, 8, ["class", "style", "node-id", "position", "variant", "color", "min-width", "min-height", "max-width", "max-height", "should-resize", "keep-aspect-ratio", "auto-scale"])), 64)),
      (S(), R(ue, null, Re(r, (h) => V(Du, {
        key: h,
        class: Ie(u.handleClassName),
        style: ze(u.handleStyle),
        "node-id": l.value,
        position: h,
        color: u.color,
        "min-width": u.minWidth,
        "min-height": u.minHeight,
        "max-width": u.maxWidth,
        "max-height": u.maxHeight,
        "should-resize": u.shouldResize,
        "keep-aspect-ratio": u.keepAspectRatio,
        "auto-scale": u.autoScale,
        onResizeStart: d[3] || (d[3] = (p) => t("resizeStart", p)),
        onResize: d[4] || (d[4] = (p) => t("resize", p)),
        onResizeEnd: d[5] || (d[5] = (p) => t("resizeEnd", p))
      }, null, 8, ["class", "style", "node-id", "position", "color", "min-width", "min-height", "max-width", "max-height", "should-resize", "keep-aspect-ratio", "auto-scale"])), 64))
    ], 64)) : Z("", !0);
  }
}), Qs = [
  { key: "amber", hue: "var(--wf-amber)" },
  { key: "teal", hue: "var(--wf-teal)" },
  { key: "blue", hue: "var(--wf-blue)" },
  { key: "violet", hue: "var(--wf-violet)" },
  { key: "rose", hue: "var(--wf-rose)" },
  { key: "slate", hue: "var(--wf-muted)" }
];
function L$(e) {
  return Qs.find((t) => t.key === e)?.hue || "var(--wf-amber)";
}
function el(e) {
  return `wf-note--${Qs.find((n) => n.key === e)?.key || "amber"}`;
}
const gh = 200, yh = 120, wh = "wfPersistNoteSize";
function bh(e, t) {
  const n = U(() => L$(t().color)), i = Ht(wh, null);
  function o(r) {
    const a = r.params;
    i?.(e, a.x, a.y, a.width, a.height);
  }
  return { hue: n, onResizeEnd: o };
}
const V$ = ["source"], B$ = {
  key: 1,
  class: "wf-note-empty"
}, _h = /* @__PURE__ */ ye({
  __name: "NoteNode",
  props: {
    id: {},
    data: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, { hue: n, onResizeEnd: i } = bh(t.id, () => t.data);
    return Ue(() => {
      Xi("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (o, r) => (S(), R(ue, null, [
      V(f(mh), {
        "min-width": f(gh),
        "min-height": f(yh),
        "is-visible": !!e.selected,
        color: f(n),
        onResizeEnd: f(i)
      }, null, 8, ["min-width", "min-height", "is-visible", "color", "onResizeEnd"]),
      $("div", {
        class: Ie(["wf-note", [e.selected && "wf-note--selected", f(el)(e.data.color)]])
      }, [
        t.data.text ? (S(), R("wc-render-markdown", {
          key: 0,
          class: "wf-note-md",
          source: t.data.text
        }, null, 8, V$)) : (S(), R("div", B$, "Empty note — write markdown in the panel"))
      ], 2)
    ], 64));
  }
}), z$ = { class: "wf-frame-title" }, kh = /* @__PURE__ */ ye({
  __name: "FrameNode",
  props: {
    id: {},
    data: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, { hue: n, onResizeEnd: i } = bh(t.id, () => t.data), o = U(() => (t.data.text || "").split(`
`)[0]?.trim() || "");
    return (r, a) => (S(), R(ue, null, [
      V(f(mh), {
        "min-width": f(gh),
        "min-height": f(yh),
        "is-visible": !!e.selected,
        color: f(n),
        onResizeEnd: f(i)
      }, null, 8, ["min-width", "min-height", "is-visible", "color", "onResizeEnd"]),
      $("div", {
        class: Ie(["wf-frame", [e.selected && "wf-frame--selected", f(el)(e.data.color)]])
      }, [
        $("div", z$, j(o.value || "Frame"), 1)
      ], 2)
    ], 64));
  }
}), F$ = { class: "wf-container-head" }, H$ = { class: "wf-container-kind" }, q$ = {
  key: 0,
  class: "wf-container-label"
}, Eh = /* @__PURE__ */ ye({
  __name: "ContainerNode",
  props: {
    data: {}
  },
  setup(e) {
    return (t, n) => (S(), R("div", {
      class: Ie(["wf-container", `wf-container--${e.data.kind}`])
    }, [
      $("div", F$, [
        V(f(ie), {
          icon: e.data.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        $("span", H$, j(e.data.kind === "cycle" ? "Loop" : "For each"), 1),
        e.data.label ? (S(), R("span", q$, j(e.data.label), 1)) : Z("", !0)
      ])
    ], 2));
  }
});
function U$(e, t, n, i, o, r, a = 1) {
  const s = n - e, l = i - t, c = Math.max(Math.hypot(s, l), 1);
  let u = -l / c, d = s / c;
  d > 0 && (u = -u, d = -d);
  const h = 48 / Math.max(a, 0.1);
  return {
    x: e + s * 0.35 + u * h,
    y: t + l * 0.35 + d * h
  };
}
const W$ = ["title"], xh = /* @__PURE__ */ ye({
  __name: "MappingCompletenessEdge",
  props: {
    id: {},
    sourceNode: {},
    targetNode: {},
    source: {},
    target: {},
    type: {},
    label: { type: [String, Object, Function] },
    style: {},
    selected: { type: Boolean },
    sourcePosition: {},
    targetPosition: {},
    sourceHandleId: {},
    targetHandleId: {},
    animated: { type: Boolean },
    updatable: { type: Boolean },
    markerStart: {},
    markerEnd: {},
    curvature: {},
    interactionWidth: {},
    data: {},
    events: {},
    labelStyle: {},
    labelShowBg: { type: Boolean },
    labelBgStyle: {},
    labelBgPadding: {},
    labelBgBorderRadius: {},
    sourceX: {},
    sourceY: {},
    targetX: {},
    targetY: {}
  },
  setup(e) {
    const t = e, { getViewport: n } = De(), i = U(() => Ks({
      sourceX: t.sourceX,
      sourceY: t.sourceY,
      sourcePosition: t.sourcePosition || ge.Bottom,
      targetX: t.targetX,
      targetY: t.targetY,
      targetPosition: t.targetPosition || ge.Top,
      curvature: t.curvature
    })), o = U(() => t.data?.unmappedRequired?.length || 0), r = U(() => t.data?.contractUnavailable === !0), a = U(() => U$(
      t.sourceX,
      t.sourceY,
      t.targetX,
      t.targetY,
      i.value[1],
      i.value[2],
      n().zoom
    ));
    return (s, l) => (S(), R(ue, null, [
      V(f(Io), {
        id: e.id,
        path: i.value[0],
        label: e.label,
        "label-x": i.value[1],
        "label-y": i.value[2],
        "label-style": e.labelStyle,
        "label-show-bg": e.labelShowBg,
        "label-bg-style": e.labelBgStyle,
        "label-bg-padding": e.labelBgPadding,
        "label-bg-border-radius": e.labelBgBorderRadius,
        "marker-start": e.markerStart,
        "marker-end": e.markerEnd,
        "interaction-width": e.interactionWidth
      }, null, 8, ["id", "path", "label", "label-x", "label-y", "label-style", "label-show-bg", "label-bg-style", "label-bg-padding", "label-bg-border-radius", "marker-start", "marker-end", "interaction-width"]),
      o.value || r.value ? (S(), ae(f(fE), { key: 0 }, {
        default: ne(() => [
          $("span", {
            class: Ie(["wf-edge-completeness-badge", r.value && "is-contract-unavailable"]),
            title: r.value ? "This step’s input fields are unavailable" : `${o.value} required field${o.value === 1 ? "" : "s"} need mapping`,
            style: ze({ transform: `translate(-50%, -50%) translate(${a.value.x}px, ${a.value.y}px)` })
          }, j(r.value ? "!" : o.value), 15, W$)
        ]),
        _: 1
      })) : Z("", !0)
    ], 64));
  }
});
function ct(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Bn(e) {
  if (typeof e == "string") {
    const t = e.trim();
    if (!t) return null;
    try {
      return ct(JSON.parse(t));
    } catch {
      return null;
    }
  }
  return ct(e);
}
function tl(e) {
  const t = e.type;
  return typeof t == "string" && t ? t : Array.isArray(t) && t.length && typeof t[0] == "string" ? t[0] : ct(e.properties) ? "object" : "any";
}
function $h(e, t, n, i, o) {
  const r = ct(e.properties);
  if (!r) return [];
  const a = [];
  for (const [s, l] of Object.entries(r)) {
    const c = ct(l) || {}, u = n ? `${n}.${s}` : s, d = tl(c), h = d === "object" && ct(c.properties) && i + 1 < o ? $h(c, t, u, i + 1, o) : [];
    a.push({
      name: s,
      path: u,
      expr: `${t}.${u}`,
      type: d,
      description: typeof c.description == "string" ? c.description : void 0,
      depth: i,
      children: h,
      expandable: h.length > 0
    });
  }
  return a;
}
function Sh(e, t = "output", n = 4) {
  const i = Bn(e);
  return i ? $h(i, t, "", 0, n) : [];
}
function Y$(e, t = "output") {
  const n = Bn(e);
  if (!n || ct(n.properties)) return null;
  const i = tl(n);
  return i === "object" ? null : {
    name: t,
    path: "",
    expr: t,
    type: i,
    description: typeof n.description == "string" ? n.description : void 0,
    depth: 0,
    children: [],
    expandable: !1
  };
}
function Mo(e) {
  const t = Bn(e);
  if (!t) return [];
  const n = ct(t.properties);
  if (!n) return [];
  const i = new Set(Array.isArray(t.required) ? t.required.map(String) : []), o = [];
  for (const [r, a] of Object.entries(n)) {
    const s = ct(a) || {};
    o.push({
      key: r,
      title: typeof s.title == "string" && s.title ? s.title : r,
      type: typeof s.type == "string" ? s.type : void 0,
      required: i.has(r),
      description: typeof s.description == "string" ? s.description : void 0
    });
  }
  return o;
}
function G$(e, t) {
  const n = e ?? "";
  if (t === "number" || t === "integer") {
    const i = Number(n);
    return Number.isFinite(i) && n.trim() !== "" ? String(i) : "0";
  }
  return t === "boolean" ? n === "true" || n === "1" ? "true" : "false" : JSON.stringify(String(n));
}
function Ch(e) {
  return e.mode === "skip" ? null : e.mode === "expr" ? (e.value || "").trim() || null : (e.value ?? "") === "" ? null : G$(e.value, e.type);
}
function us(e) {
  const t = [];
  for (const n of e) {
    if (!n.key) continue;
    const i = Ch(n);
    i !== null && t.push(`${n.key}: ${i}`);
  }
  return t.length ? `{ ${t.join(", ")} }` : "";
}
function j$(e) {
  return e.map((t) => ({ key: t.key, mode: t.required ? "static" : "skip", value: "", type: t.type }));
}
function nl(e, t) {
  const n = new Map(t.map((o) => [o.key, o])), i = [];
  for (const o of e) {
    if (!o.required) continue;
    const r = n.get(o.key);
    (!r || Ch(r) === null) && i.push(o.title || o.key);
  }
  return i;
}
function X$(e, t) {
  const n = nl(e, t);
  return n.length ? `${n.length} required field${n.length === 1 ? "" : "s"} unmapped` : "";
}
function Nh(e, t, n = "output") {
  const i = Bn(e), o = i ? ct(i.properties) : null;
  if (!o) return [];
  const r = [];
  for (const a of Mo(t)) {
    const s = ct(o[a.key]);
    if (!s) continue;
    const l = tl(s), c = a.type || "any";
    ol(l, c) && r.push({ key: a.key, mode: "expr", value: `${n}.${a.key}`, type: a.type });
  }
  return r;
}
function ol(e, t) {
  if (e === t) return !0;
  const n = /* @__PURE__ */ new Set(["number", "integer"]);
  return !!(n.has(e) && n.has(t) || e === "any" || t === "any");
}
function K$(e, t) {
  return !e || !t || e === "any" || t === "any" ? "neutral" : ol(e, t) ? "ok" : "mismatch";
}
function il(e) {
  const t = (i) => {
    const o = i.trim();
    return !o || o === "input" || o === "output" ? "" : o;
  };
  if (typeof e == "string") return t(e);
  const n = ct(e);
  return n && typeof n.expr == "string" ? t(n.expr) : "";
}
function Z$(e, t, n) {
  if (!e || !t) return e;
  const i = (s) => /[A-Za-z0-9_$]/.test(s);
  let o = "", r = "", a = 0;
  for (; a < e.length; ) {
    const s = e[a];
    if (r) {
      o += s, s === r && e[a - 1] !== "\\" && (r = ""), a++;
      continue;
    }
    if (s === '"' || s === "'" || s === "`") {
      r = s, o += s, a++;
      continue;
    }
    if (e.startsWith(t, a) && (a === 0 || !i(e[a - 1])) && (a + t.length >= e.length || !i(e[a + t.length]))) {
      o += n, a += t.length;
      continue;
    }
    o += s, a++;
  }
  return o;
}
function J$(e, t) {
  const n = [];
  let i = 0, o = "", r = 0;
  for (let a = 0; a < e.length; a++) {
    const s = e[a];
    if (o) {
      if (s === "\\") {
        a++;
        continue;
      }
      s === o && (o = "");
      continue;
    }
    if (s === '"' || s === "'" || s === "`") {
      o = s;
      continue;
    }
    if (s === "(" || s === "[" || s === "{") {
      i++;
      continue;
    }
    if (s === ")" || s === "]" || s === "}") {
      if (i--, i < 0) return null;
      continue;
    }
    s === t && i === 0 && (n.push(e.slice(r, a)), r = a + 1);
  }
  return i !== 0 || o ? null : (n.push(e.slice(r)), n);
}
function Q$(e) {
  let t = 0, n = "";
  for (let i = 0; i < e.length; i++) {
    const o = e[i];
    if (n) {
      if (o === "\\") {
        i++;
        continue;
      }
      o === n && (n = "");
      continue;
    }
    if (o === '"' || o === "'" || o === "`") {
      n = o;
      continue;
    }
    if (o === "(" || o === "[" || o === "{") {
      t++;
      continue;
    }
    if (o === ")" || o === "]" || o === "}") {
      t--;
      continue;
    }
    if (o === ":" && t === 0) return i;
  }
  return -1;
}
function Ih(e) {
  const t = (e || "").trim();
  if (!t.startsWith("{") || !t.endsWith("}")) return null;
  const n = t.slice(1, -1).trim();
  if (!n) return [];
  const i = J$(n, ",");
  if (i === null) return null;
  const o = [];
  for (const r of i) {
    const a = r.trim();
    if (!a) continue;
    const s = Q$(a);
    if (s < 0) return null;
    let l = a.slice(0, s).trim();
    const c = a.slice(s + 1).trim();
    if (!c || ((l.startsWith('"') && l.endsWith('"') || l.startsWith("'") && l.endsWith("'")) && (l = l.slice(1, -1)), !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(l))) return null;
    o.push({ key: l, rhs: c });
  }
  return o;
}
function cs(e, t) {
  const n = Mo(e), i = j$(n), o = (t || "").trim();
  if (!o) return { rows: i, raw: "" };
  const r = Ih(o);
  if (!r) return { rows: i, raw: o };
  if (n.length) {
    const a = new Set(n.map((c) => c.key));
    if (r.some((c) => !a.has(c.key))) return { rows: i, raw: o };
    const s = new Map(r.map((c) => [c.key, c.rhs]));
    return { rows: i.map((c) => s.has(c.key) ? { key: c.key, mode: "expr", value: s.get(c.key), type: c.type } : c), raw: "" };
  }
  return { rows: r.map((a) => ({ key: a.key, mode: "expr", value: a.rhs })), raw: "" };
}
const Pu = 500, eS = new Set(Object.values(Ud));
function Ah(e) {
  const t = il(e);
  return t ? Z$(t, "input", "output") : "";
}
function Mh() {
  return { nodes: {}, edges: {}, notes: {}, positions: {}, viewport: null, direction: "TB", params: {}, labels: [], headSeq: 0, definitionEditSeq: 0, canUndo: !1, canRedo: !1 };
}
function ut(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Xe(e, t = 0) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
const tS = /* @__PURE__ */ new Set([
  "block",
  "branch",
  "cycle",
  "combine",
  "for_each",
  "flow",
  "start",
  "finish",
  "error"
]);
function nS(e) {
  return typeof e == "string" && tS.has(e) ? e : null;
}
function Th(e) {
  const t = ut(e), n = Mh();
  for (const a of Array.isArray(t.nodes) ? t.nodes : []) {
    const s = Oh(ut(a));
    s && (n.nodes[s.id] = s);
  }
  for (const a of Array.isArray(t.edges) ? t.edges : []) {
    const s = Rh(ut(a));
    s && (n.edges[s.id] = s);
  }
  for (const a of Array.isArray(t.notes) ? t.notes : []) {
    const s = Dh(ut(a));
    s && (n.notes[s.id] = s);
  }
  const i = ut(t.layout), o = ut(i.positions ?? t.layout);
  for (const [a, s] of Object.entries(o)) {
    const l = ut(s);
    "x" in l && "y" in l && (n.positions[a] = Ph(l));
  }
  const r = ut(t.viewport ?? i.viewport);
  return ("zoom" in r || "x" in r && "y" in r) && (n.viewport = { x: Xe(r.x), y: Xe(r.y), zoom: Xe(r.zoom, 1) }), n.direction = i.direction === "LR" ? "LR" : "TB", n.params = ut(t.params), n.labels = Array.isArray(t.labels) ? t.labels.filter((a) => typeof a == "string") : [], n.headSeq = Xe(t.head_seq), n.definitionEditSeq = Xe(t.definition_edit_seq), n.canUndo = t.can_undo === !0, n.canRedo = t.can_redo === !0, n;
}
function Oh(e) {
  const t = String(e.id || ""), n = nS(e.kind);
  if (!t || !n) return null;
  const i = { id: t, kind: n, title: String(e.title ?? "Step") };
  e.ref != null && (i.ref = String(e.ref)), e.ref_label != null && (i.ref_label = String(e.ref_label)), e.config != null && (i.config = ut(e.config));
  for (const o of Ps)
    e[o] !== void 0 && e[o] !== !1 && (i[o] = e[o]);
  return e.input_schema !== void 0 && (i.input_schema = e.input_schema), e.output_schema !== void 0 && (i.output_schema = e.output_schema), e.config_schema !== void 0 && (i.config_schema = e.config_schema), e.icon != null && (i.icon = String(e.icon)), e.pinned != null && (i.pinned = e.pinned === !0), e.deletable != null && (i.deletable = e.deletable === !0), e.boundary != null && typeof e.boundary == "object" && (i.boundary = e.boundary), e.child_interface != null && typeof e.child_interface == "object" && (i.child_interface = e.child_interface), Array.isArray(e.ports) && (i.ports = e.ports), i;
}
function Rh(e) {
  const t = String(e.id || ""), n = String(e.source_id || ""), i = String(e.target_id || "");
  if (!t || !n || !i) return null;
  const o = { id: t, source_id: n, target_id: i };
  return e.source_port != null && (o.source_port = String(e.source_port)), e.target_port != null && (o.target_port = String(e.target_port)), e.transform != null && (o.transform = Ah(e.transform)), o;
}
function Dh(e) {
  const t = String(e.id || "");
  if (!t) return null;
  const n = { id: t, text: String(e.body ?? "") };
  return e.kind === "frame" ? n.kind = "frame" : e.kind === "note" && (n.kind = "note"), e.width != null && (n.width = Xe(e.width)), e.height != null && (n.height = Xe(e.height)), e.color != null && e.color !== "" && (n.color = String(e.color)), n;
}
function Ph(e) {
  const t = { x: Xe(e.x), y: Xe(e.y) };
  return e.width != null && (t.width = Xe(e.width)), e.height != null && (t.height = Xe(e.height)), t;
}
function ds(e, t) {
  const n = ut(t.body);
  switch (t.type) {
    case Te.NODE_ADDED: {
      const i = Oh(n);
      return i ? (e.nodes = { ...e.nodes, [i.id]: i }, { changed: !0, unknown: !1 }) : { changed: !1, unknown: !1 };
    }
    case Te.NODE_UPDATED: {
      const i = String(n.id || ""), o = e.nodes[i];
      if (!o) return { changed: !1, unknown: !1 };
      const r = {};
      for (const a of ["kind", "title", "ref", "ref_label", "config", "input_schema", "output_schema", "config_schema", "icon", "pinned", "deletable", "boundary", "child_interface", "ports"])
        a in n && (r[a] = n[a]);
      for (const a of Ps)
        a in n && (r[a] = n[a] === !1 ? void 0 : n[a]);
      return e.nodes = { ...e.nodes, [i]: { ...o, ...r } }, { changed: !0, unknown: !1 };
    }
    case Te.NODE_REMOVED: {
      const i = String(n.id || "");
      if (!e.nodes[i]) return { changed: !1, unknown: !1 };
      const o = { ...e.nodes };
      delete o[i], e.nodes = o;
      const r = { ...e.positions };
      return delete r[i], e.positions = r, e.edges = Object.fromEntries(
        Object.entries(e.edges).filter(([, a]) => a.source_id !== i && a.target_id !== i)
      ), { changed: !0, unknown: !1 };
    }
    case Te.EDGE_ADDED: {
      const i = Rh(n);
      return i ? (e.edges = { ...e.edges, [i.id]: i }, { changed: !0, unknown: !1 }) : { changed: !1, unknown: !1 };
    }
    case Te.EDGE_UPDATED: {
      const i = String(n.id || ""), o = e.edges[i];
      if (!o) return { changed: !1, unknown: !1 };
      const r = {};
      for (const a of ["source_id", "target_id", "source_port", "target_port"])
        a in n && (r[a] = n[a]);
      return "transform" in n && (r.transform = Ah(n.transform)), e.edges = { ...e.edges, [i]: { ...o, ...r } }, { changed: !0, unknown: !1 };
    }
    case Te.EDGE_REMOVED: {
      const i = String(n.id || "");
      if (!e.edges[i]) return { changed: !1, unknown: !1 };
      const o = { ...e.edges };
      return delete o[i], e.edges = o, { changed: !0, unknown: !1 };
    }
    case Te.NOTE_ADDED: {
      const i = Dh(n);
      return i ? (e.notes = { ...e.notes, [i.id]: i }, { changed: !0, unknown: !1 }) : { changed: !1, unknown: !1 };
    }
    case Te.NOTE_UPDATED: {
      const i = String(n.id || ""), o = e.notes[i];
      if (!o) return { changed: !1, unknown: !1 };
      const r = {};
      return "body" in n ? r.text = String(n.body ?? "") : "text" in n && (r.text = String(n.text ?? "")), (n.kind === "frame" || n.kind === "note") && (r.kind = n.kind), "width" in n && (r.width = Xe(n.width)), "height" in n && (r.height = Xe(n.height)), "color" in n && (r.color = String(n.color ?? "")), e.notes = { ...e.notes, [i]: { ...o, ...r } }, { changed: !0, unknown: !1 };
    }
    case Te.NOTE_REMOVED: {
      const i = String(n.id || "");
      if (!e.notes[i]) return { changed: !1, unknown: !1 };
      const o = { ...e.notes };
      return delete o[i], e.notes = o, { changed: !0, unknown: !1 };
    }
    case Te.LAYOUT_POSITION_SET: {
      const i = String(n.node_id || "");
      if (!i) return { changed: !1, unknown: !1 };
      const o = e.positions[i], r = Ph(n);
      return o && (r.width == null && o.width != null && (r.width = o.width), r.height == null && o.height != null && (r.height = o.height)), e.positions = { ...e.positions, [i]: r }, { changed: !0, unknown: !1 };
    }
    case Te.LAYOUT_POSITION_CLEARED: {
      const i = String(n.node_id || "");
      if (!e.positions[i]) return { changed: !1, unknown: !1 };
      const o = { ...e.positions };
      return delete o[i], e.positions = o, { changed: !0, unknown: !1 };
    }
    case Te.LAYOUT_VIEWPORT_SET:
      return e.viewport = { x: Xe(n.x), y: Xe(n.y), zoom: Xe(n.zoom, 1) }, { changed: !0, unknown: !1 };
    case Te.LAYOUT_DIRECTION_SET:
      return e.direction = n.direction === "LR" ? "LR" : "TB", { changed: !0, unknown: !1 };
    case Te.PARAM_SET: {
      const i = String(n.key || "");
      return i ? (e.params = { ...e.params, [i]: n.value }, { changed: !0, unknown: !1 }) : { changed: !1, unknown: !1 };
    }
    case Te.LABELS_SET:
      return e.labels = Array.isArray(n.labels) ? n.labels.filter((i) => typeof i == "string") : [], { changed: !0, unknown: !1 };
    case Te.VERSION_PUBLISHED:
    case Te.VERSION_RESTORED:
      return { changed: !1, unknown: !1 };
    default:
      return { changed: !1, unknown: !0 };
  }
}
function Li(e, t) {
  for (const n of t) ds(e, { type: Ud[n.type], body: n.body });
}
class oS {
  doc = Mh();
  lastAppliedSeq = 0;
  echoes = [];
  confirmed = null;
  pending = /* @__PURE__ */ new Map();
  nextEdit = 0;
  historySeq = 0;
  // Pending edits are an ordered projection over the sequenced server document.
  // Both HTTP and realtime fold into the same base; neither can replace an edit
  // that has not yet been acknowledged by its HTTP response.
  stageCommands(t) {
    this.confirmed || (this.confirmed = this.copyDoc(this.doc));
    const n = ++this.nextEdit;
    return this.pending.set(n, t), this.projectPending(), n;
  }
  rejectCommands(t) {
    this.pending.delete(t), this.projectPending();
  }
  copyDoc(t) {
    return { ...t, nodes: Object.fromEntries(Object.entries(t.nodes).map(([n, i]) => [n, { ...i }])) };
  }
  projectPending() {
    if (this.confirmed) {
      this.doc = this.copyDoc(this.confirmed);
      for (const t of this.pending.values()) Li(this.doc, t);
      this.pending.size || (this.confirmed = null);
    }
  }
  // Reset to a freshly fetched /state snapshot. Everything at or below head_seq is,
  // by definition, already reflected.
  reset(t) {
    this.doc = Th(t), this.lastAppliedSeq = this.doc.headSeq, this.echoes = [], this.historySeq = this.doc.headSeq, this.confirmed = this.pending.size ? this.doc : null, this.projectPending();
  }
  // Record that the local user just committed a node to (x, y), so the matching
  // broadcast echo is suppressed. Coordinates are rounded to match the command.
  recordLayoutEcho(t, n, i, o = Date.now()) {
    this.echoes.push({ nodeId: t, x: Math.round(n), y: Math.round(i), ts: o });
  }
  pruneEchoes(t) {
    this.echoes.length && (this.echoes = this.echoes.filter((n) => t - n.ts <= Pu));
  }
  matchEcho(t, n, i, o) {
    const r = this.echoes.findIndex(
      (a) => a.nodeId === t && a.x === Math.round(n) && a.y === Math.round(i) && o - a.ts <= Pu
    );
    return r < 0 ? !1 : (this.echoes.splice(r, 1), !0);
  }
  // Apply a batch of events (from an apply response or the topic). Events are
  // ordered by seq; duplicates and own echoes are handled per the invariants above.
  ingest(t, n = {}) {
    this.confirmed && (this.doc = this.confirmed);
    const i = n.now ?? Date.now();
    this.pruneEchoes(i);
    const o = [...t].sort((l, c) => l.seq - c.seq), r = [];
    let a = !1, s = !1;
    for (const l of o) {
      if (l.seq <= this.lastAppliedSeq) continue;
      if (l.type === Te.LAYOUT_POSITION_SET) {
        const u = ut(l.body), d = String(u.node_id || "");
        if (d && this.matchEcho(d, Xe(u.x), Xe(u.y), i)) {
          this.confirmed && ds(this.doc, l), this.lastAppliedSeq = l.seq, l.seq > this.doc.headSeq && (this.doc.headSeq = l.seq), l.seq > this.doc.definitionEditSeq && (this.doc.definitionEditSeq = l.seq);
          continue;
        }
      }
      const c = ds(this.doc, l);
      this.lastAppliedSeq = l.seq, l.seq > this.doc.headSeq && (this.doc.headSeq = l.seq), eS.has(l.type) && l.seq > this.doc.definitionEditSeq && (this.doc.definitionEditSeq = l.seq), c.unknown || l.type === Te.VERSION_PUBLISHED || l.type === Te.VERSION_RESTORED ? a = !0 : c.changed && (r.push(l), s = !0);
    }
    return this.projectPending(), { applied: r, needsRefetch: a, changed: s };
  }
  // Fold an apply/undo/redo response: patch the doc from its events, then take the
  // authoritative undo/redo/head cursors from the envelope.
  applyResponse(t, n = Date.now(), i) {
    i !== void 0 && this.pending.delete(i);
    const o = this.ingest(t.events || [], { now: n });
    return this.confirmed && (this.doc = this.confirmed), Number.isFinite(t.head_seq) && (this.doc.headSeq = Math.max(this.doc.headSeq, t.head_seq), this.doc.definitionEditSeq = Math.max(this.doc.definitionEditSeq, t.head_seq), this.lastAppliedSeq = Math.max(this.lastAppliedSeq, t.head_seq)), t.head_seq >= this.historySeq && (this.historySeq = t.head_seq, this.doc.canUndo = t.can_undo === !0, this.doc.canRedo = t.can_redo === !0), this.projectPending(), o;
  }
}
function _o(e, t) {
  if (Object.is(e, t)) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object") return !1;
  if (Array.isArray(e) || Array.isArray(t))
    return Array.isArray(e) && Array.isArray(t) && e.length === t.length && e.every((r, a) => _o(r, t[a]));
  const n = e, i = t, o = Object.keys(n);
  return o.length === Object.keys(i).length && o.every((r) => Object.hasOwn(i, r) && _o(n[r], i[r]));
}
function Lu(e) {
  const t = e.length === 1 ? e[0] : null;
  return t?.type === "node.update" && typeof t.body.id == "string" ? t.body.id : null;
}
function iS({ engine: e, request: t, rebuild: n, recover: i, checkpoint: o }) {
  const r = [];
  let a = null, s = null, l = !1;
  const c = () => o?.([...a ? [a.commands] : [], ...r.map((g) => g.commands)]);
  async function u() {
    for (; r.length; ) {
      const g = r.shift();
      a = g;
      try {
        c(), e.applyResponse(await t(g.commands), Date.now(), g.stage), g.resolve(), a = null, c(), n();
      } catch (m) {
        l = !0, r.unshift(g), a = null, await i(m);
        for (const k of r) k.resolve();
        return !1;
      }
    }
    return !0;
  }
  function d() {
    return !s && !l && (s = Promise.resolve().then(u).finally(() => {
      s = null, r.length && !l && d();
    })), s ?? Promise.resolve(!l);
  }
  const v = Object.assign((g, m = !1) => {
    if (!g.length) return Promise.resolve();
    const k = Lu(g);
    let x;
    if (k) {
      for (let w = r.length - 1; w >= 0; w--) {
        const b = Lu(r[w].commands);
        if (!b) break;
        if (b === k) {
          x = r[w];
          break;
        }
      }
      if (!x && !r.length && a && _o(a.commands, g)) return a.done;
    }
    if (x) {
      const w = [{ ...g[0], body: { ...x.commands[0].body, ...g[0].body } }];
      if (_o(x.commands, w)) return x.done;
      e.rejectCommands(x.stage), x.commands = w, x.stage = e.stageCommands(w);
    } else {
      let w;
      const b = new Promise((C) => {
        w = C;
      });
      x = { commands: g, stage: e.stageCommands(g), done: b, resolve: w }, r.push(x);
    }
    try {
      c();
    } catch (w) {
      return l = !0, i(w).then(() => {
        for (const b of r) b.resolve();
      }), x.done;
    }
    return n(m), l ? x.resolve() : d(), x.done;
  }, { flush: async () => {
    do
      if (!await d()) return !1;
    while (a || r.length);
    return !0;
  }, pending: !1 });
  return Object.defineProperty(v, "pending", { get: () => !!a || r.length > 0 }), v;
}
function Vu(e) {
  const t = [];
  for (const n of e) {
    const i = n.length === 1 ? n[0] : null;
    let o = !1;
    if (i?.type === Oe.NODE_UPDATE)
      for (let r = t.length - 1; r >= 0; r--) {
        const a = t[r].length === 1 ? t[r][0] : null;
        if (a?.type !== Oe.NODE_UPDATE) break;
        if (a.body.id === i.body.id) {
          t[r] = [{ ...i, body: { ...a.body, ...i.body } }], o = !0;
          break;
        }
      }
    o || t.push(n);
  }
  return t;
}
const rS = new Set(Object.values(Oe));
function aS(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.type == "string" && rS.has(t.type) && !!t.body && typeof t.body == "object" && !Array.isArray(t.body);
}
class sS {
  constructor(t, n, i) {
    this.storage = i, this.key = `kickside.workflow-edits.v1:${encodeURIComponent(t)}:${encodeURIComponent(n)}`;
  }
  key;
  write(t) {
    t.length ? this.storage.setItem(this.key, JSON.stringify(Vu(t))) : this.storage.removeItem(this.key);
  }
  read(t) {
    const n = JSON.parse(this.storage.getItem(this.key) ?? "[]");
    if (!Array.isArray(n) || !n.every((o) => Array.isArray(o) && o.every(aS)))
      throw new Error("Invalid pending Workflow edits. The recovery record has been retained.");
    const i = JSON.parse(JSON.stringify(t));
    return Vu(n).flatMap((o) => {
      const r = o.filter((s) => {
        const l = String(s.body.id || "");
        return s.type === Oe.NODE_ADD ? !i.nodes[l] : s.type === Oe.EDGE_ADD ? !i.edges[l] : s.type === Oe.NOTE_ADD ? !i.notes[l] : !0;
      }), a = JSON.parse(JSON.stringify(i));
      return Li(i, r), _o(a, i) ? [] : [r];
    });
  }
}
const Vi = /* @__PURE__ */ new Map();
async function lS(e) {
  const t = Vi.get(e);
  t && await t.flush();
}
function uS(e, t) {
  Vi.set(e, t);
}
function cS(e, t) {
  const n = () => {
    e.flush();
  }, i = () => {
    document.visibilityState === "hidden" && n();
  };
  Ue(() => {
    window.addEventListener("pagehide", n), document.addEventListener("visibilitychange", i);
  }), Qe(() => {
    window.removeEventListener("pagehide", n), document.removeEventListener("visibilitychange", i), e.flush().then(() => {
      Vi.get(t()) === e && Vi.delete(t());
    });
  });
}
function dS(e) {
  const t = e.trim();
  return !t || /\s/.test(t) ? !1 : t.includes(":") ? !0 : /^[a-z0-9_-]+(\.[a-z0-9_-]+){2,}$/i.test(t);
}
function fS(e) {
  const t = e.split(":").pop() || e, n = t.split(".").pop() || t;
  return n.split("/").pop() || n;
}
function rl(e) {
  return e.replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim().split(" ").map((t) => t && t[0].toUpperCase() + t.slice(1)).join(" ");
}
function Je(e, t) {
  const n = (e || "").trim();
  if (n && !dS(n)) return n;
  const i = n || (t || "").trim();
  return i ? rl(fS(i)) || i : "";
}
function Bu(e) {
  return !!e && (typeof e.type == "string" || !!e.properties && typeof e.properties == "object");
}
function al(e, t) {
  const n = Ol(e), i = Ol(t);
  if (!Bu(n) || !Bu(i)) return { status: "neutral" };
  const o = n.type, r = i.type;
  if (o && r && !eg(o, r))
    return { status: "error", message: `Type mismatch: upstream emits ${o}, this step expects ${r}.` };
  if (o === "any" || r === "any") return { status: "ok" };
  if (r === "object" || !!i.properties && !r) {
    const s = n.properties || {};
    for (const l of i.required || [])
      if (!(l in s))
        return { status: "error", message: `Missing field “${l}”: upstream output has no “${l}”.` };
  }
  return { status: "ok" };
}
function hS(e, t) {
  return al(e, t).status === "error" ? "needs-mapping" : "ok";
}
const Lh = /* @__PURE__ */ new Set(["out-bottom", "out-right", "in-top", "in-left"]);
function zu(e) {
  return !!e && Lh.has(e);
}
function En(e) {
  const t = e || void 0;
  return t && !Lh.has(t) ? t : void 0;
}
function Vh(e, t) {
  if (!e.source || !e.target || e.source === e.target) return !1;
  const n = En(e.sourceHandle), i = En(e.targetHandle);
  return !t.some((o) => !(e.id != null && o.id === e.id) && o.source_id === e.source && o.target_id === e.target && En(o.source_port) === n && En(o.target_port) === i);
}
function pS(e, t, n) {
  const i = Mo(t), o = i.filter((u) => u.required).map((u) => u.title || u.key);
  if (!o.length) return { required: o, unmappedRequired: [] };
  const r = il(e.transform), a = cs(t, r), s = r.trim() ? [] : Nh(n, t), l = new Map(s.map((u) => [u.key, u])), c = a.rows.map((u) => l.get(u.key) || u);
  return {
    required: o,
    unmappedRequired: a.raw ? [] : nl(i, c)
  };
}
function vS(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Fr, Fu;
function sl() {
  if (Fu) return Fr;
  Fu = 1;
  var e = "\0", t = "\0", n = "";
  class i {
    _isDirected = !0;
    _isMultigraph = !1;
    _isCompound = !1;
    // Label for the graph itself
    _label;
    // Defaults to be set when creating a new node
    _defaultNodeLabelFn = () => {
    };
    // Defaults to be set when creating a new edge
    _defaultEdgeLabelFn = () => {
    };
    // v -> label
    _nodes = {};
    // v -> edgeObj
    _in = {};
    // u -> v -> Number
    _preds = {};
    // v -> edgeObj
    _out = {};
    // v -> w -> Number
    _sucs = {};
    // e -> edgeObj
    _edgeObjs = {};
    // e -> label
    _edgeLabels = {};
    /* Number of nodes in the graph. Should only be changed by the implementation. */
    _nodeCount = 0;
    /* Number of edges in the graph. Should only be changed by the implementation. */
    _edgeCount = 0;
    _parent;
    _children;
    constructor(u) {
      u && (this._isDirected = Object.hasOwn(u, "directed") ? u.directed : !0, this._isMultigraph = Object.hasOwn(u, "multigraph") ? u.multigraph : !1, this._isCompound = Object.hasOwn(u, "compound") ? u.compound : !1), this._isCompound && (this._parent = {}, this._children = {}, this._children[t] = {});
    }
    /* === Graph functions ========= */
    /**
     * Whether graph was created with 'directed' flag set to true or not.
     */
    isDirected() {
      return this._isDirected;
    }
    /**
     * Whether graph was created with 'multigraph' flag set to true or not.
     */
    isMultigraph() {
      return this._isMultigraph;
    }
    /**
     * Whether graph was created with 'compound' flag set to true or not.
     */
    isCompound() {
      return this._isCompound;
    }
    /**
     * Sets the label of the graph.
     */
    setGraph(u) {
      return this._label = u, this;
    }
    /**
     * Gets the graph label.
     */
    graph() {
      return this._label;
    }
    /* === Node functions ========== */
    /**
     * Sets the default node label. If newDefault is a function, it will be
     * invoked ach time when setting a label for a node. Otherwise, this label
     * will be assigned as default label in case if no label was specified while
     * setting a node.
     * Complexity: O(1).
     */
    setDefaultNodeLabel(u) {
      return this._defaultNodeLabelFn = u, typeof u != "function" && (this._defaultNodeLabelFn = () => u), this;
    }
    /**
     * Gets the number of nodes in the graph.
     * Complexity: O(1).
     */
    nodeCount() {
      return this._nodeCount;
    }
    /**
     * Gets all nodes of the graph. Note, the in case of compound graph subnodes are
     * not included in list.
     * Complexity: O(1).
     */
    nodes() {
      return Object.keys(this._nodes);
    }
    /**
     * Gets list of nodes without in-edges.
     * Complexity: O(|V|).
     */
    sources() {
      var u = this;
      return this.nodes().filter((d) => Object.keys(u._in[d]).length === 0);
    }
    /**
     * Gets list of nodes without out-edges.
     * Complexity: O(|V|).
     */
    sinks() {
      var u = this;
      return this.nodes().filter((d) => Object.keys(u._out[d]).length === 0);
    }
    /**
     * Invokes setNode method for each node in names list.
     * Complexity: O(|names|).
     */
    setNodes(u, d) {
      var h = arguments, p = this;
      return u.forEach(function(v) {
        h.length > 1 ? p.setNode(v, d) : p.setNode(v);
      }), this;
    }
    /**
     * Creates or updates the value for the node v in the graph. If label is supplied
     * it is set as the value for the node. If label is not supplied and the node was
     * created by this call then the default node label will be assigned.
     * Complexity: O(1).
     */
    setNode(u, d) {
      return Object.hasOwn(this._nodes, u) ? (arguments.length > 1 && (this._nodes[u] = d), this) : (this._nodes[u] = arguments.length > 1 ? d : this._defaultNodeLabelFn(u), this._isCompound && (this._parent[u] = t, this._children[u] = {}, this._children[t][u] = !0), this._in[u] = {}, this._preds[u] = {}, this._out[u] = {}, this._sucs[u] = {}, ++this._nodeCount, this);
    }
    /**
     * Gets the label of node with specified name.
     * Complexity: O(|V|).
     */
    node(u) {
      return this._nodes[u];
    }
    /**
     * Detects whether graph has a node with specified name or not.
     */
    hasNode(u) {
      return Object.hasOwn(this._nodes, u);
    }
    /**
     * Remove the node with the name from the graph or do nothing if the node is not in
     * the graph. If the node was removed this function also removes any incident
     * edges.
     * Complexity: O(1).
     */
    removeNode(u) {
      var d = this;
      if (Object.hasOwn(this._nodes, u)) {
        var h = (p) => d.removeEdge(d._edgeObjs[p]);
        delete this._nodes[u], this._isCompound && (this._removeFromParentsChildList(u), delete this._parent[u], this.children(u).forEach(function(p) {
          d.setParent(p);
        }), delete this._children[u]), Object.keys(this._in[u]).forEach(h), delete this._in[u], delete this._preds[u], Object.keys(this._out[u]).forEach(h), delete this._out[u], delete this._sucs[u], --this._nodeCount;
      }
      return this;
    }
    /**
     * Sets node p as a parent for node v if it is defined, or removes the
     * parent for v if p is undefined. Method throws an exception in case of
     * invoking it in context of noncompound graph.
     * Average-case complexity: O(1).
     */
    setParent(u, d) {
      if (!this._isCompound)
        throw new Error("Cannot set parent in a non-compound graph");
      if (d === void 0)
        d = t;
      else {
        d += "";
        for (var h = d; h !== void 0; h = this.parent(h))
          if (h === u)
            throw new Error("Setting " + d + " as parent of " + u + " would create a cycle");
        this.setNode(d);
      }
      return this.setNode(u), this._removeFromParentsChildList(u), this._parent[u] = d, this._children[d][u] = !0, this;
    }
    _removeFromParentsChildList(u) {
      delete this._children[this._parent[u]][u];
    }
    /**
     * Gets parent node for node v.
     * Complexity: O(1).
     */
    parent(u) {
      if (this._isCompound) {
        var d = this._parent[u];
        if (d !== t)
          return d;
      }
    }
    /**
     * Gets list of direct children of node v.
     * Complexity: O(1).
     */
    children(u = t) {
      if (this._isCompound) {
        var d = this._children[u];
        if (d)
          return Object.keys(d);
      } else {
        if (u === t)
          return this.nodes();
        if (this.hasNode(u))
          return [];
      }
    }
    /**
     * Return all nodes that are predecessors of the specified node or undefined if node v is not in
     * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
     * Complexity: O(|V|).
     */
    predecessors(u) {
      var d = this._preds[u];
      if (d)
        return Object.keys(d);
    }
    /**
     * Return all nodes that are successors of the specified node or undefined if node v is not in
     * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
     * Complexity: O(|V|).
     */
    successors(u) {
      var d = this._sucs[u];
      if (d)
        return Object.keys(d);
    }
    /**
     * Return all nodes that are predecessors or successors of the specified node or undefined if
     * node v is not in the graph.
     * Complexity: O(|V|).
     */
    neighbors(u) {
      var d = this.predecessors(u);
      if (d) {
        const p = new Set(d);
        for (var h of this.successors(u))
          p.add(h);
        return Array.from(p.values());
      }
    }
    isLeaf(u) {
      var d;
      return this.isDirected() ? d = this.successors(u) : d = this.neighbors(u), d.length === 0;
    }
    /**
     * Creates new graph with nodes filtered via filter. Edges incident to rejected node
     * are also removed. In case of compound graph, if parent is rejected by filter,
     * than all its children are rejected too.
     * Average-case complexity: O(|E|+|V|).
     */
    filterNodes(u) {
      var d = new this.constructor({
        directed: this._isDirected,
        multigraph: this._isMultigraph,
        compound: this._isCompound
      });
      d.setGraph(this.graph());
      var h = this;
      Object.entries(this._nodes).forEach(function([g, m]) {
        u(g) && d.setNode(g, m);
      }), Object.values(this._edgeObjs).forEach(function(g) {
        d.hasNode(g.v) && d.hasNode(g.w) && d.setEdge(g, h.edge(g));
      });
      var p = {};
      function v(g) {
        var m = h.parent(g);
        return m === void 0 || d.hasNode(m) ? (p[g] = m, m) : m in p ? p[m] : v(m);
      }
      return this._isCompound && d.nodes().forEach((g) => d.setParent(g, v(g))), d;
    }
    /* === Edge functions ========== */
    /**
     * Sets the default edge label or factory function. This label will be
     * assigned as default label in case if no label was specified while setting
     * an edge or this function will be invoked each time when setting an edge
     * with no label specified and returned value * will be used as a label for edge.
     * Complexity: O(1).
     */
    setDefaultEdgeLabel(u) {
      return this._defaultEdgeLabelFn = u, typeof u != "function" && (this._defaultEdgeLabelFn = () => u), this;
    }
    /**
     * Gets the number of edges in the graph.
     * Complexity: O(1).
     */
    edgeCount() {
      return this._edgeCount;
    }
    /**
     * Gets edges of the graph. In case of compound graph subgraphs are not considered.
     * Complexity: O(|E|).
     */
    edges() {
      return Object.values(this._edgeObjs);
    }
    /**
     * Establish an edges path over the nodes in nodes list. If some edge is already
     * exists, it will update its label, otherwise it will create an edge between pair
     * of nodes with label provided or default label if no label provided.
     * Complexity: O(|nodes|).
     */
    setPath(u, d) {
      var h = this, p = arguments;
      return u.reduce(function(v, g) {
        return p.length > 1 ? h.setEdge(v, g, d) : h.setEdge(v, g), g;
      }), this;
    }
    /**
     * Creates or updates the label for the edge (v, w) with the optionally supplied
     * name. If label is supplied it is set as the value for the edge. If label is not
     * supplied and the edge was created by this call then the default edge label will
     * be assigned. The name parameter is only useful with multigraphs.
     */
    setEdge() {
      var u, d, h, p, v = !1, g = arguments[0];
      typeof g == "object" && g !== null && "v" in g ? (u = g.v, d = g.w, h = g.name, arguments.length === 2 && (p = arguments[1], v = !0)) : (u = g, d = arguments[1], h = arguments[3], arguments.length > 2 && (p = arguments[2], v = !0)), u = "" + u, d = "" + d, h !== void 0 && (h = "" + h);
      var m = a(this._isDirected, u, d, h);
      if (Object.hasOwn(this._edgeLabels, m))
        return v && (this._edgeLabels[m] = p), this;
      if (h !== void 0 && !this._isMultigraph)
        throw new Error("Cannot set a named edge when isMultigraph = false");
      this.setNode(u), this.setNode(d), this._edgeLabels[m] = v ? p : this._defaultEdgeLabelFn(u, d, h);
      var k = s(this._isDirected, u, d, h);
      return u = k.v, d = k.w, Object.freeze(k), this._edgeObjs[m] = k, o(this._preds[d], u), o(this._sucs[u], d), this._in[d][m] = k, this._out[u][m] = k, this._edgeCount++, this;
    }
    /**
     * Gets the label for the specified edge.
     * Complexity: O(1).
     */
    edge(u, d, h) {
      var p = arguments.length === 1 ? l(this._isDirected, arguments[0]) : a(this._isDirected, u, d, h);
      return this._edgeLabels[p];
    }
    /**
     * Gets the label for the specified edge and converts it to an object.
     * Complexity: O(1)
     */
    edgeAsObj() {
      const u = this.edge(...arguments);
      return typeof u != "object" ? { label: u } : u;
    }
    /**
     * Detects whether the graph contains specified edge or not. No subgraphs are considered.
     * Complexity: O(1).
     */
    hasEdge(u, d, h) {
      var p = arguments.length === 1 ? l(this._isDirected, arguments[0]) : a(this._isDirected, u, d, h);
      return Object.hasOwn(this._edgeLabels, p);
    }
    /**
     * Removes the specified edge from the graph. No subgraphs are considered.
     * Complexity: O(1).
     */
    removeEdge(u, d, h) {
      var p = arguments.length === 1 ? l(this._isDirected, arguments[0]) : a(this._isDirected, u, d, h), v = this._edgeObjs[p];
      return v && (u = v.v, d = v.w, delete this._edgeLabels[p], delete this._edgeObjs[p], r(this._preds[d], u), r(this._sucs[u], d), delete this._in[d][p], delete this._out[u][p], this._edgeCount--), this;
    }
    /**
     * Return all edges that point to the node v. Optionally filters those edges down to just those
     * coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead.
     * Complexity: O(|E|).
     */
    inEdges(u, d) {
      var h = this._in[u];
      if (h) {
        var p = Object.values(h);
        return d ? p.filter((v) => v.v === d) : p;
      }
    }
    /**
     * Return all edges that are pointed at by node v. Optionally filters those edges down to just
     * those point to w. Behavior is undefined for undirected graphs - use nodeEdges instead.
     * Complexity: O(|E|).
     */
    outEdges(u, d) {
      var h = this._out[u];
      if (h) {
        var p = Object.values(h);
        return d ? p.filter((v) => v.w === d) : p;
      }
    }
    /**
     * Returns all edges to or from node v regardless of direction. Optionally filters those edges
     * down to just those between nodes v and w regardless of direction.
     * Complexity: O(|E|).
     */
    nodeEdges(u, d) {
      var h = this.inEdges(u, d);
      if (h)
        return h.concat(this.outEdges(u, d));
    }
  }
  function o(c, u) {
    c[u] ? c[u]++ : c[u] = 1;
  }
  function r(c, u) {
    --c[u] || delete c[u];
  }
  function a(c, u, d, h) {
    var p = "" + u, v = "" + d;
    if (!c && p > v) {
      var g = p;
      p = v, v = g;
    }
    return p + n + v + n + (h === void 0 ? e : h);
  }
  function s(c, u, d, h) {
    var p = "" + u, v = "" + d;
    if (!c && p > v) {
      var g = p;
      p = v, v = g;
    }
    var m = { v: p, w: v };
    return h && (m.name = h), m;
  }
  function l(c, u) {
    return a(c, u.v, u.w, u.name);
  }
  return Fr = i, Fr;
}
var Hr, Hu;
function mS() {
  return Hu || (Hu = 1, Hr = "2.2.4"), Hr;
}
var qr, qu;
function gS() {
  return qu || (qu = 1, qr = {
    Graph: sl(),
    version: mS()
  }), qr;
}
var Ur, Uu;
function yS() {
  if (Uu) return Ur;
  Uu = 1;
  var e = sl();
  Ur = {
    write: t,
    read: o
  };
  function t(r) {
    var a = {
      options: {
        directed: r.isDirected(),
        multigraph: r.isMultigraph(),
        compound: r.isCompound()
      },
      nodes: n(r),
      edges: i(r)
    };
    return r.graph() !== void 0 && (a.value = structuredClone(r.graph())), a;
  }
  function n(r) {
    return r.nodes().map(function(a) {
      var s = r.node(a), l = r.parent(a), c = { v: a };
      return s !== void 0 && (c.value = s), l !== void 0 && (c.parent = l), c;
    });
  }
  function i(r) {
    return r.edges().map(function(a) {
      var s = r.edge(a), l = { v: a.v, w: a.w };
      return a.name !== void 0 && (l.name = a.name), s !== void 0 && (l.value = s), l;
    });
  }
  function o(r) {
    var a = new e(r.options).setGraph(r.value);
    return r.nodes.forEach(function(s) {
      a.setNode(s.v, s.value), s.parent && a.setParent(s.v, s.parent);
    }), r.edges.forEach(function(s) {
      a.setEdge({ v: s.v, w: s.w, name: s.name }, s.value);
    }), a;
  }
  return Ur;
}
var Wr, Wu;
function wS() {
  if (Wu) return Wr;
  Wu = 1, Wr = e;
  function e(t) {
    var n = {}, i = [], o;
    function r(a) {
      Object.hasOwn(n, a) || (n[a] = !0, o.push(a), t.successors(a).forEach(r), t.predecessors(a).forEach(r));
    }
    return t.nodes().forEach(function(a) {
      o = [], r(a), o.length && i.push(o);
    }), i;
  }
  return Wr;
}
var Yr, Yu;
function Bh() {
  if (Yu) return Yr;
  Yu = 1;
  class e {
    _arr = [];
    _keyIndices = {};
    /**
     * Returns the number of elements in the queue. Takes `O(1)` time.
     */
    size() {
      return this._arr.length;
    }
    /**
     * Returns the keys that are in the queue. Takes `O(n)` time.
     */
    keys() {
      return this._arr.map(function(n) {
        return n.key;
      });
    }
    /**
     * Returns `true` if **key** is in the queue and `false` if not.
     */
    has(n) {
      return Object.hasOwn(this._keyIndices, n);
    }
    /**
     * Returns the priority for **key**. If **key** is not present in the queue
     * then this function returns `undefined`. Takes `O(1)` time.
     *
     * @param {Object} key
     */
    priority(n) {
      var i = this._keyIndices[n];
      if (i !== void 0)
        return this._arr[i].priority;
    }
    /**
     * Returns the key for the minimum element in this queue. If the queue is
     * empty this function throws an Error. Takes `O(1)` time.
     */
    min() {
      if (this.size() === 0)
        throw new Error("Queue underflow");
      return this._arr[0].key;
    }
    /**
     * Inserts a new key into the priority queue. If the key already exists in
     * the queue this function returns `false`; otherwise it will return `true`.
     * Takes `O(n)` time.
     *
     * @param {Object} key the key to add
     * @param {Number} priority the initial priority for the key
     */
    add(n, i) {
      var o = this._keyIndices;
      if (n = String(n), !Object.hasOwn(o, n)) {
        var r = this._arr, a = r.length;
        return o[n] = a, r.push({ key: n, priority: i }), this._decrease(a), !0;
      }
      return !1;
    }
    /**
     * Removes and returns the smallest key in the queue. Takes `O(log n)` time.
     */
    removeMin() {
      this._swap(0, this._arr.length - 1);
      var n = this._arr.pop();
      return delete this._keyIndices[n.key], this._heapify(0), n.key;
    }
    /**
     * Decreases the priority for **key** to **priority**. If the new priority is
     * greater than the previous priority, this function will throw an Error.
     *
     * @param {Object} key the key for which to raise priority
     * @param {Number} priority the new priority for the key
     */
    decrease(n, i) {
      var o = this._keyIndices[n];
      if (i > this._arr[o].priority)
        throw new Error("New priority is greater than current priority. Key: " + n + " Old: " + this._arr[o].priority + " New: " + i);
      this._arr[o].priority = i, this._decrease(o);
    }
    _heapify(n) {
      var i = this._arr, o = 2 * n, r = o + 1, a = n;
      o < i.length && (a = i[o].priority < i[a].priority ? o : a, r < i.length && (a = i[r].priority < i[a].priority ? r : a), a !== n && (this._swap(n, a), this._heapify(a)));
    }
    _decrease(n) {
      for (var i = this._arr, o = i[n].priority, r; n !== 0 && (r = n >> 1, !(i[r].priority < o)); )
        this._swap(n, r), n = r;
    }
    _swap(n, i) {
      var o = this._arr, r = this._keyIndices, a = o[n], s = o[i];
      o[n] = s, o[i] = a, r[s.key] = n, r[a.key] = i;
    }
  }
  return Yr = e, Yr;
}
var Gr, Gu;
function zh() {
  if (Gu) return Gr;
  Gu = 1;
  var e = Bh();
  Gr = n;
  var t = () => 1;
  function n(o, r, a, s) {
    return i(
      o,
      String(r),
      a || t,
      s || function(l) {
        return o.outEdges(l);
      }
    );
  }
  function i(o, r, a, s) {
    var l = {}, c = new e(), u, d, h = function(p) {
      var v = p.v !== u ? p.v : p.w, g = l[v], m = a(p), k = d.distance + m;
      if (m < 0)
        throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + p + " Weight: " + m);
      k < g.distance && (g.distance = k, g.predecessor = u, c.decrease(v, k));
    };
    for (o.nodes().forEach(function(p) {
      var v = p === r ? 0 : Number.POSITIVE_INFINITY;
      l[p] = { distance: v }, c.add(p, v);
    }); c.size() > 0 && (u = c.removeMin(), d = l[u], d.distance !== Number.POSITIVE_INFINITY); )
      s(u).forEach(h);
    return l;
  }
  return Gr;
}
var jr, ju;
function bS() {
  if (ju) return jr;
  ju = 1;
  var e = zh();
  jr = t;
  function t(n, i, o) {
    return n.nodes().reduce(function(r, a) {
      return r[a] = e(n, a, i, o), r;
    }, {});
  }
  return jr;
}
var Xr, Xu;
function Fh() {
  if (Xu) return Xr;
  Xu = 1, Xr = e;
  function e(t) {
    var n = 0, i = [], o = {}, r = [];
    function a(s) {
      var l = o[s] = {
        onStack: !0,
        lowlink: n,
        index: n++
      };
      if (i.push(s), t.successors(s).forEach(function(d) {
        Object.hasOwn(o, d) ? o[d].onStack && (l.lowlink = Math.min(l.lowlink, o[d].index)) : (a(d), l.lowlink = Math.min(l.lowlink, o[d].lowlink));
      }), l.lowlink === l.index) {
        var c = [], u;
        do
          u = i.pop(), o[u].onStack = !1, c.push(u);
        while (s !== u);
        r.push(c);
      }
    }
    return t.nodes().forEach(function(s) {
      Object.hasOwn(o, s) || a(s);
    }), r;
  }
  return Xr;
}
var Kr, Ku;
function _S() {
  if (Ku) return Kr;
  Ku = 1;
  var e = Fh();
  Kr = t;
  function t(n) {
    return e(n).filter(function(i) {
      return i.length > 1 || i.length === 1 && n.hasEdge(i[0], i[0]);
    });
  }
  return Kr;
}
var Zr, Zu;
function kS() {
  if (Zu) return Zr;
  Zu = 1, Zr = t;
  var e = () => 1;
  function t(i, o, r) {
    return n(
      i,
      o || e,
      r || function(a) {
        return i.outEdges(a);
      }
    );
  }
  function n(i, o, r) {
    var a = {}, s = i.nodes();
    return s.forEach(function(l) {
      a[l] = {}, a[l][l] = { distance: 0 }, s.forEach(function(c) {
        l !== c && (a[l][c] = { distance: Number.POSITIVE_INFINITY });
      }), r(l).forEach(function(c) {
        var u = c.v === l ? c.w : c.v, d = o(c);
        a[l][u] = { distance: d, predecessor: l };
      });
    }), s.forEach(function(l) {
      var c = a[l];
      s.forEach(function(u) {
        var d = a[u];
        s.forEach(function(h) {
          var p = d[l], v = c[h], g = d[h], m = p.distance + v.distance;
          m < g.distance && (g.distance = m, g.predecessor = v.predecessor);
        });
      });
    }), a;
  }
  return Zr;
}
var Jr, Ju;
function Hh() {
  if (Ju) return Jr;
  Ju = 1;
  function e(n) {
    var i = {}, o = {}, r = [];
    function a(s) {
      if (Object.hasOwn(o, s))
        throw new t();
      Object.hasOwn(i, s) || (o[s] = !0, i[s] = !0, n.predecessors(s).forEach(a), delete o[s], r.push(s));
    }
    if (n.sinks().forEach(a), Object.keys(i).length !== n.nodeCount())
      throw new t();
    return r;
  }
  class t extends Error {
    constructor() {
      super(...arguments);
    }
  }
  return Jr = e, e.CycleException = t, Jr;
}
var Qr, Qu;
function ES() {
  if (Qu) return Qr;
  Qu = 1;
  var e = Hh();
  Qr = t;
  function t(n) {
    try {
      e(n);
    } catch (i) {
      if (i instanceof e.CycleException)
        return !1;
      throw i;
    }
    return !0;
  }
  return Qr;
}
var ea, ec;
function qh() {
  if (ec) return ea;
  ec = 1, ea = e;
  function e(o, r, a) {
    Array.isArray(r) || (r = [r]);
    var s = o.isDirected() ? (d) => o.successors(d) : (d) => o.neighbors(d), l = a === "post" ? t : n, c = [], u = {};
    return r.forEach((d) => {
      if (!o.hasNode(d))
        throw new Error("Graph does not have node: " + d);
      l(d, s, u, c);
    }), c;
  }
  function t(o, r, a, s) {
    for (var l = [[o, !1]]; l.length > 0; ) {
      var c = l.pop();
      c[1] ? s.push(c[0]) : Object.hasOwn(a, c[0]) || (a[c[0]] = !0, l.push([c[0], !0]), i(r(c[0]), (u) => l.push([u, !1])));
    }
  }
  function n(o, r, a, s) {
    for (var l = [o]; l.length > 0; ) {
      var c = l.pop();
      Object.hasOwn(a, c) || (a[c] = !0, s.push(c), i(r(c), (u) => l.push(u)));
    }
  }
  function i(o, r) {
    for (var a = o.length; a--; )
      r(o[a], a, o);
    return o;
  }
  return ea;
}
var ta, tc;
function xS() {
  if (tc) return ta;
  tc = 1;
  var e = qh();
  ta = t;
  function t(n, i) {
    return e(n, i, "post");
  }
  return ta;
}
var na, nc;
function $S() {
  if (nc) return na;
  nc = 1;
  var e = qh();
  na = t;
  function t(n, i) {
    return e(n, i, "pre");
  }
  return na;
}
var oa, oc;
function SS() {
  if (oc) return oa;
  oc = 1;
  var e = sl(), t = Bh();
  oa = n;
  function n(i, o) {
    var r = new e(), a = {}, s = new t(), l;
    function c(d) {
      var h = d.v === l ? d.w : d.v, p = s.priority(h);
      if (p !== void 0) {
        var v = o(d);
        v < p && (a[h] = l, s.decrease(h, v));
      }
    }
    if (i.nodeCount() === 0)
      return r;
    i.nodes().forEach(function(d) {
      s.add(d, Number.POSITIVE_INFINITY), r.setNode(d);
    }), s.decrease(i.nodes()[0], 0);
    for (var u = !1; s.size() > 0; ) {
      if (l = s.removeMin(), Object.hasOwn(a, l))
        r.setEdge(l, a[l]);
      else {
        if (u)
          throw new Error("Input graph is not connected: " + i);
        u = !0;
      }
      i.nodeEdges(l).forEach(c);
    }
    return r;
  }
  return oa;
}
var ia, ic;
function CS() {
  return ic || (ic = 1, ia = {
    components: wS(),
    dijkstra: zh(),
    dijkstraAll: bS(),
    findCycles: _S(),
    floydWarshall: kS(),
    isAcyclic: ES(),
    postorder: xS(),
    preorder: $S(),
    prim: SS(),
    tarjan: Fh(),
    topsort: Hh()
  }), ia;
}
var ra, rc;
function wt() {
  if (rc) return ra;
  rc = 1;
  var e = gS();
  return ra = {
    Graph: e.Graph,
    json: yS(),
    alg: CS(),
    version: e.version
  }, ra;
}
var aa, ac;
function NS() {
  if (ac) return aa;
  ac = 1;
  class e {
    constructor() {
      let o = {};
      o._next = o._prev = o, this._sentinel = o;
    }
    dequeue() {
      let o = this._sentinel, r = o._prev;
      if (r !== o)
        return t(r), r;
    }
    enqueue(o) {
      let r = this._sentinel;
      o._prev && o._next && t(o), o._next = r._next, r._next._prev = o, r._next = o, o._prev = r;
    }
    toString() {
      let o = [], r = this._sentinel, a = r._prev;
      for (; a !== r; )
        o.push(JSON.stringify(a, n)), a = a._prev;
      return "[" + o.join(", ") + "]";
    }
  }
  function t(i) {
    i._prev._next = i._next, i._next._prev = i._prev, delete i._next, delete i._prev;
  }
  function n(i, o) {
    if (i !== "_next" && i !== "_prev")
      return o;
  }
  return aa = e, aa;
}
var sa, sc;
function IS() {
  if (sc) return sa;
  sc = 1;
  let e = wt().Graph, t = NS();
  sa = i;
  let n = () => 1;
  function i(c, u) {
    if (c.nodeCount() <= 1)
      return [];
    let d = a(c, u || n);
    return o(d.graph, d.buckets, d.zeroIdx).flatMap((p) => c.outEdges(p.v, p.w));
  }
  function o(c, u, d) {
    let h = [], p = u[u.length - 1], v = u[0], g;
    for (; c.nodeCount(); ) {
      for (; g = v.dequeue(); )
        r(c, u, d, g);
      for (; g = p.dequeue(); )
        r(c, u, d, g);
      if (c.nodeCount()) {
        for (let m = u.length - 2; m > 0; --m)
          if (g = u[m].dequeue(), g) {
            h = h.concat(r(c, u, d, g, !0));
            break;
          }
      }
    }
    return h;
  }
  function r(c, u, d, h, p) {
    let v = p ? [] : void 0;
    return c.inEdges(h.v).forEach((g) => {
      let m = c.edge(g), k = c.node(g.v);
      p && v.push({ v: g.v, w: g.w }), k.out -= m, s(u, d, k);
    }), c.outEdges(h.v).forEach((g) => {
      let m = c.edge(g), k = g.w, x = c.node(k);
      x.in -= m, s(u, d, x);
    }), c.removeNode(h.v), v;
  }
  function a(c, u) {
    let d = new e(), h = 0, p = 0;
    c.nodes().forEach((m) => {
      d.setNode(m, { v: m, in: 0, out: 0 });
    }), c.edges().forEach((m) => {
      let k = d.edge(m.v, m.w) || 0, x = u(m), w = k + x;
      d.setEdge(m.v, m.w, w), p = Math.max(p, d.node(m.v).out += x), h = Math.max(h, d.node(m.w).in += x);
    });
    let v = l(p + h + 3).map(() => new t()), g = h + 1;
    return d.nodes().forEach((m) => {
      s(v, g, d.node(m));
    }), { graph: d, buckets: v, zeroIdx: g };
  }
  function s(c, u, d) {
    d.out ? d.in ? c[d.out - d.in + u].enqueue(d) : c[c.length - 1].enqueue(d) : c[0].enqueue(d);
  }
  function l(c) {
    const u = [];
    for (let d = 0; d < c; d++)
      u.push(d);
    return u;
  }
  return sa;
}
var la, lc;
function Ge() {
  if (lc) return la;
  lc = 1;
  let e = wt().Graph;
  la = {
    addBorderNode: u,
    addDummyNode: t,
    applyWithChunking: p,
    asNonCompoundGraph: i,
    buildLayerMatrix: s,
    intersectRect: a,
    mapValues: I,
    maxRank: v,
    normalizeRanks: l,
    notime: k,
    partition: g,
    pick: C,
    predecessorWeights: r,
    range: b,
    removeEmptyRanks: c,
    simplify: n,
    successorWeights: o,
    time: m,
    uniqueId: w,
    zipObject: z
  };
  function t(T, O, D, B) {
    for (var N = B; T.hasNode(N); )
      N = w(B);
    return D.dummy = O, T.setNode(N, D), N;
  }
  function n(T) {
    let O = new e().setGraph(T.graph());
    return T.nodes().forEach((D) => O.setNode(D, T.node(D))), T.edges().forEach((D) => {
      let B = O.edge(D.v, D.w) || { weight: 0, minlen: 1 }, N = T.edge(D);
      O.setEdge(D.v, D.w, {
        weight: B.weight + N.weight,
        minlen: Math.max(B.minlen, N.minlen)
      });
    }), O;
  }
  function i(T) {
    let O = new e({ multigraph: T.isMultigraph() }).setGraph(T.graph());
    return T.nodes().forEach((D) => {
      T.children(D).length || O.setNode(D, T.node(D));
    }), T.edges().forEach((D) => {
      O.setEdge(D, T.edge(D));
    }), O;
  }
  function o(T) {
    let O = T.nodes().map((D) => {
      let B = {};
      return T.outEdges(D).forEach((N) => {
        B[N.w] = (B[N.w] || 0) + T.edge(N).weight;
      }), B;
    });
    return z(T.nodes(), O);
  }
  function r(T) {
    let O = T.nodes().map((D) => {
      let B = {};
      return T.inEdges(D).forEach((N) => {
        B[N.v] = (B[N.v] || 0) + T.edge(N).weight;
      }), B;
    });
    return z(T.nodes(), O);
  }
  function a(T, O) {
    let D = T.x, B = T.y, N = O.x - D, H = O.y - B, y = T.width / 2, E = T.height / 2;
    if (!N && !H)
      throw new Error("Not possible to find intersection inside of the rectangle");
    let _, L;
    return Math.abs(H) * y > Math.abs(N) * E ? (H < 0 && (E = -E), _ = E * N / H, L = E) : (N < 0 && (y = -y), _ = y, L = y * H / N), { x: D + _, y: B + L };
  }
  function s(T) {
    let O = b(v(T) + 1).map(() => []);
    return T.nodes().forEach((D) => {
      let B = T.node(D), N = B.rank;
      N !== void 0 && (O[N][B.order] = D);
    }), O;
  }
  function l(T) {
    let O = T.nodes().map((B) => {
      let N = T.node(B).rank;
      return N === void 0 ? Number.MAX_VALUE : N;
    }), D = p(Math.min, O);
    T.nodes().forEach((B) => {
      let N = T.node(B);
      Object.hasOwn(N, "rank") && (N.rank -= D);
    });
  }
  function c(T) {
    let O = T.nodes().map((y) => T.node(y).rank), D = p(Math.min, O), B = [];
    T.nodes().forEach((y) => {
      let E = T.node(y).rank - D;
      B[E] || (B[E] = []), B[E].push(y);
    });
    let N = 0, H = T.graph().nodeRankFactor;
    Array.from(B).forEach((y, E) => {
      y === void 0 && E % H !== 0 ? --N : y !== void 0 && N && y.forEach((_) => T.node(_).rank += N);
    });
  }
  function u(T, O, D, B) {
    let N = {
      width: 0,
      height: 0
    };
    return arguments.length >= 4 && (N.rank = D, N.order = B), t(T, "border", N, O);
  }
  function d(T, O = h) {
    const D = [];
    for (let B = 0; B < T.length; B += O) {
      const N = T.slice(B, B + O);
      D.push(N);
    }
    return D;
  }
  const h = 65535;
  function p(T, O) {
    if (O.length > h) {
      const D = d(O);
      return T.apply(null, D.map((B) => T.apply(null, B)));
    } else
      return T.apply(null, O);
  }
  function v(T) {
    const D = T.nodes().map((B) => {
      let N = T.node(B).rank;
      return N === void 0 ? Number.MIN_VALUE : N;
    });
    return p(Math.max, D);
  }
  function g(T, O) {
    let D = { lhs: [], rhs: [] };
    return T.forEach((B) => {
      O(B) ? D.lhs.push(B) : D.rhs.push(B);
    }), D;
  }
  function m(T, O) {
    let D = Date.now();
    try {
      return O();
    } finally {
      console.log(T + " time: " + (Date.now() - D) + "ms");
    }
  }
  function k(T, O) {
    return O();
  }
  let x = 0;
  function w(T) {
    var O = ++x;
    return T + ("" + O);
  }
  function b(T, O, D = 1) {
    O == null && (O = T, T = 0);
    let B = (H) => H < O;
    D < 0 && (B = (H) => O < H);
    const N = [];
    for (let H = T; B(H); H += D)
      N.push(H);
    return N;
  }
  function C(T, O) {
    const D = {};
    for (const B of O)
      T[B] !== void 0 && (D[B] = T[B]);
    return D;
  }
  function I(T, O) {
    let D = O;
    return typeof O == "string" && (D = (B) => B[O]), Object.entries(T).reduce((B, [N, H]) => (B[N] = D(H, N), B), {});
  }
  function z(T, O) {
    return T.reduce((D, B, N) => (D[B] = O[N], D), {});
  }
  return la;
}
var ua, uc;
function AS() {
  if (uc) return ua;
  uc = 1;
  let e = IS(), t = Ge().uniqueId;
  ua = {
    run: n,
    undo: o
  };
  function n(r) {
    (r.graph().acyclicer === "greedy" ? e(r, s(r)) : i(r)).forEach((l) => {
      let c = r.edge(l);
      r.removeEdge(l), c.forwardName = l.name, c.reversed = !0, r.setEdge(l.w, l.v, c, t("rev"));
    });
    function s(l) {
      return (c) => l.edge(c).weight;
    }
  }
  function i(r) {
    let a = [], s = {}, l = {};
    function c(u) {
      Object.hasOwn(l, u) || (l[u] = !0, s[u] = !0, r.outEdges(u).forEach((d) => {
        Object.hasOwn(s, d.w) ? a.push(d) : c(d.w);
      }), delete s[u]);
    }
    return r.nodes().forEach(c), a;
  }
  function o(r) {
    r.edges().forEach((a) => {
      let s = r.edge(a);
      if (s.reversed) {
        r.removeEdge(a);
        let l = s.forwardName;
        delete s.reversed, delete s.forwardName, r.setEdge(a.w, a.v, s, l);
      }
    });
  }
  return ua;
}
var ca, cc;
function MS() {
  if (cc) return ca;
  cc = 1;
  let e = Ge();
  ca = {
    run: t,
    undo: i
  };
  function t(o) {
    o.graph().dummyChains = [], o.edges().forEach((r) => n(o, r));
  }
  function n(o, r) {
    let a = r.v, s = o.node(a).rank, l = r.w, c = o.node(l).rank, u = r.name, d = o.edge(r), h = d.labelRank;
    if (c === s + 1) return;
    o.removeEdge(r);
    let p, v, g;
    for (g = 0, ++s; s < c; ++g, ++s)
      d.points = [], v = {
        width: 0,
        height: 0,
        edgeLabel: d,
        edgeObj: r,
        rank: s
      }, p = e.addDummyNode(o, "edge", v, "_d"), s === h && (v.width = d.width, v.height = d.height, v.dummy = "edge-label", v.labelpos = d.labelpos), o.setEdge(a, p, { weight: d.weight }, u), g === 0 && o.graph().dummyChains.push(p), a = p;
    o.setEdge(a, l, { weight: d.weight }, u);
  }
  function i(o) {
    o.graph().dummyChains.forEach((r) => {
      let a = o.node(r), s = a.edgeLabel, l;
      for (o.setEdge(a.edgeObj, s); a.dummy; )
        l = o.successors(r)[0], o.removeNode(r), s.points.push({ x: a.x, y: a.y }), a.dummy === "edge-label" && (s.x = a.x, s.y = a.y, s.width = a.width, s.height = a.height), r = l, a = o.node(r);
    });
  }
  return ca;
}
var da, dc;
function Bi() {
  if (dc) return da;
  dc = 1;
  const { applyWithChunking: e } = Ge();
  da = {
    longestPath: t,
    slack: n
  };
  function t(i) {
    var o = {};
    function r(a) {
      var s = i.node(a);
      if (Object.hasOwn(o, a))
        return s.rank;
      o[a] = !0;
      let l = i.outEdges(a).map((u) => u == null ? Number.POSITIVE_INFINITY : r(u.w) - i.edge(u).minlen);
      var c = e(Math.min, l);
      return c === Number.POSITIVE_INFINITY && (c = 0), s.rank = c;
    }
    i.sources().forEach(r);
  }
  function n(i, o) {
    return i.node(o.w).rank - i.node(o.v).rank - i.edge(o).minlen;
  }
  return da;
}
var fa, fc;
function Uh() {
  if (fc) return fa;
  fc = 1;
  var e = wt().Graph, t = Bi().slack;
  fa = n;
  function n(a) {
    var s = new e({ directed: !1 }), l = a.nodes()[0], c = a.nodeCount();
    s.setNode(l, {});
    for (var u, d; i(s, a) < c; )
      u = o(s, a), d = s.hasNode(u.v) ? t(a, u) : -t(a, u), r(s, a, d);
    return s;
  }
  function i(a, s) {
    function l(c) {
      s.nodeEdges(c).forEach((u) => {
        var d = u.v, h = c === d ? u.w : d;
        !a.hasNode(h) && !t(s, u) && (a.setNode(h, {}), a.setEdge(c, h, {}), l(h));
      });
    }
    return a.nodes().forEach(l), a.nodeCount();
  }
  function o(a, s) {
    return s.edges().reduce((c, u) => {
      let d = Number.POSITIVE_INFINITY;
      return a.hasNode(u.v) !== a.hasNode(u.w) && (d = t(s, u)), d < c[0] ? [d, u] : c;
    }, [Number.POSITIVE_INFINITY, null])[1];
  }
  function r(a, s, l) {
    a.nodes().forEach((c) => s.node(c).rank += l);
  }
  return fa;
}
var ha, hc;
function TS() {
  if (hc) return ha;
  hc = 1;
  var e = Uh(), t = Bi().slack, n = Bi().longestPath, i = wt().alg.preorder, o = wt().alg.postorder, r = Ge().simplify;
  ha = a, a.initLowLimValues = u, a.initCutValues = s, a.calcCutValue = c, a.leaveEdge = h, a.enterEdge = p, a.exchangeEdges = v;
  function a(x) {
    x = r(x), n(x);
    var w = e(x);
    u(w), s(w, x);
    for (var b, C; b = h(w); )
      C = p(w, x, b), v(w, x, b, C);
  }
  function s(x, w) {
    var b = o(x, x.nodes());
    b = b.slice(0, b.length - 1), b.forEach((C) => l(x, w, C));
  }
  function l(x, w, b) {
    var C = x.node(b), I = C.parent;
    x.edge(b, I).cutvalue = c(x, w, b);
  }
  function c(x, w, b) {
    var C = x.node(b), I = C.parent, z = !0, T = w.edge(b, I), O = 0;
    return T || (z = !1, T = w.edge(I, b)), O = T.weight, w.nodeEdges(b).forEach((D) => {
      var B = D.v === b, N = B ? D.w : D.v;
      if (N !== I) {
        var H = B === z, y = w.edge(D).weight;
        if (O += H ? y : -y, m(x, b, N)) {
          var E = x.edge(b, N).cutvalue;
          O += H ? -E : E;
        }
      }
    }), O;
  }
  function u(x, w) {
    arguments.length < 2 && (w = x.nodes()[0]), d(x, {}, 1, w);
  }
  function d(x, w, b, C, I) {
    var z = b, T = x.node(C);
    return w[C] = !0, x.neighbors(C).forEach((O) => {
      Object.hasOwn(w, O) || (b = d(x, w, b, O, C));
    }), T.low = z, T.lim = b++, I ? T.parent = I : delete T.parent, b;
  }
  function h(x) {
    return x.edges().find((w) => x.edge(w).cutvalue < 0);
  }
  function p(x, w, b) {
    var C = b.v, I = b.w;
    w.hasEdge(C, I) || (C = b.w, I = b.v);
    var z = x.node(C), T = x.node(I), O = z, D = !1;
    z.lim > T.lim && (O = T, D = !0);
    var B = w.edges().filter((N) => D === k(x, x.node(N.v), O) && D !== k(x, x.node(N.w), O));
    return B.reduce((N, H) => t(w, H) < t(w, N) ? H : N);
  }
  function v(x, w, b, C) {
    var I = b.v, z = b.w;
    x.removeEdge(I, z), x.setEdge(C.v, C.w, {}), u(x), s(x, w), g(x, w);
  }
  function g(x, w) {
    var b = x.nodes().find((I) => !w.node(I).parent), C = i(x, b);
    C = C.slice(1), C.forEach((I) => {
      var z = x.node(I).parent, T = w.edge(I, z), O = !1;
      T || (T = w.edge(z, I), O = !0), w.node(I).rank = w.node(z).rank + (O ? T.minlen : -T.minlen);
    });
  }
  function m(x, w, b) {
    return x.hasEdge(w, b);
  }
  function k(x, w, b) {
    return b.low <= w.lim && w.lim <= b.lim;
  }
  return ha;
}
var pa, pc;
function OS() {
  if (pc) return pa;
  pc = 1;
  var e = Bi(), t = e.longestPath, n = Uh(), i = TS();
  pa = o;
  function o(l) {
    var c = l.graph().ranker;
    if (c instanceof Function)
      return c(l);
    switch (l.graph().ranker) {
      case "network-simplex":
        s(l);
        break;
      case "tight-tree":
        a(l);
        break;
      case "longest-path":
        r(l);
        break;
      case "none":
        break;
      default:
        s(l);
    }
  }
  var r = t;
  function a(l) {
    t(l), n(l);
  }
  function s(l) {
    i(l);
  }
  return pa;
}
var va, vc;
function RS() {
  if (vc) return va;
  vc = 1, va = e;
  function e(i) {
    let o = n(i);
    i.graph().dummyChains.forEach((r) => {
      let a = i.node(r), s = a.edgeObj, l = t(i, o, s.v, s.w), c = l.path, u = l.lca, d = 0, h = c[d], p = !0;
      for (; r !== s.w; ) {
        if (a = i.node(r), p) {
          for (; (h = c[d]) !== u && i.node(h).maxRank < a.rank; )
            d++;
          h === u && (p = !1);
        }
        if (!p) {
          for (; d < c.length - 1 && i.node(h = c[d + 1]).minRank <= a.rank; )
            d++;
          h = c[d];
        }
        i.setParent(r, h), r = i.successors(r)[0];
      }
    });
  }
  function t(i, o, r, a) {
    let s = [], l = [], c = Math.min(o[r].low, o[a].low), u = Math.max(o[r].lim, o[a].lim), d, h;
    d = r;
    do
      d = i.parent(d), s.push(d);
    while (d && (o[d].low > c || u > o[d].lim));
    for (h = d, d = a; (d = i.parent(d)) !== h; )
      l.push(d);
    return { path: s.concat(l.reverse()), lca: h };
  }
  function n(i) {
    let o = {}, r = 0;
    function a(s) {
      let l = r;
      i.children(s).forEach(a), o[s] = { low: l, lim: r++ };
    }
    return i.children().forEach(a), o;
  }
  return va;
}
var ma, mc;
function DS() {
  if (mc) return ma;
  mc = 1;
  let e = Ge();
  ma = {
    run: t,
    cleanup: r
  };
  function t(a) {
    let s = e.addDummyNode(a, "root", {}, "_root"), l = i(a), c = Object.values(l), u = e.applyWithChunking(Math.max, c) - 1, d = 2 * u + 1;
    a.graph().nestingRoot = s, a.edges().forEach((p) => a.edge(p).minlen *= d);
    let h = o(a) + 1;
    a.children().forEach((p) => n(a, s, d, h, u, l, p)), a.graph().nodeRankFactor = d;
  }
  function n(a, s, l, c, u, d, h) {
    let p = a.children(h);
    if (!p.length) {
      h !== s && a.setEdge(s, h, { weight: 0, minlen: l });
      return;
    }
    let v = e.addBorderNode(a, "_bt"), g = e.addBorderNode(a, "_bb"), m = a.node(h);
    a.setParent(v, h), m.borderTop = v, a.setParent(g, h), m.borderBottom = g, p.forEach((k) => {
      n(a, s, l, c, u, d, k);
      let x = a.node(k), w = x.borderTop ? x.borderTop : k, b = x.borderBottom ? x.borderBottom : k, C = x.borderTop ? c : 2 * c, I = w !== b ? 1 : u - d[h] + 1;
      a.setEdge(v, w, {
        weight: C,
        minlen: I,
        nestingEdge: !0
      }), a.setEdge(b, g, {
        weight: C,
        minlen: I,
        nestingEdge: !0
      });
    }), a.parent(h) || a.setEdge(s, v, { weight: 0, minlen: u + d[h] });
  }
  function i(a) {
    var s = {};
    function l(c, u) {
      var d = a.children(c);
      d && d.length && d.forEach((h) => l(h, u + 1)), s[c] = u;
    }
    return a.children().forEach((c) => l(c, 1)), s;
  }
  function o(a) {
    return a.edges().reduce((s, l) => s + a.edge(l).weight, 0);
  }
  function r(a) {
    var s = a.graph();
    a.removeNode(s.nestingRoot), delete s.nestingRoot, a.edges().forEach((l) => {
      var c = a.edge(l);
      c.nestingEdge && a.removeEdge(l);
    });
  }
  return ma;
}
var ga, gc;
function PS() {
  if (gc) return ga;
  gc = 1;
  let e = Ge();
  ga = t;
  function t(i) {
    function o(r) {
      let a = i.children(r), s = i.node(r);
      if (a.length && a.forEach(o), Object.hasOwn(s, "minRank")) {
        s.borderLeft = [], s.borderRight = [];
        for (let l = s.minRank, c = s.maxRank + 1; l < c; ++l)
          n(i, "borderLeft", "_bl", r, s, l), n(i, "borderRight", "_br", r, s, l);
      }
    }
    i.children().forEach(o);
  }
  function n(i, o, r, a, s, l) {
    let c = { width: 0, height: 0, rank: l, borderType: o }, u = s[o][l - 1], d = e.addDummyNode(i, "border", c, r);
    s[o][l] = d, i.setParent(d, a), u && i.setEdge(u, d, { weight: 1 });
  }
  return ga;
}
var ya, yc;
function LS() {
  if (yc) return ya;
  yc = 1, ya = {
    adjust: e,
    undo: t
  };
  function e(l) {
    let c = l.graph().rankdir.toLowerCase();
    (c === "lr" || c === "rl") && n(l);
  }
  function t(l) {
    let c = l.graph().rankdir.toLowerCase();
    (c === "bt" || c === "rl") && o(l), (c === "lr" || c === "rl") && (a(l), n(l));
  }
  function n(l) {
    l.nodes().forEach((c) => i(l.node(c))), l.edges().forEach((c) => i(l.edge(c)));
  }
  function i(l) {
    let c = l.width;
    l.width = l.height, l.height = c;
  }
  function o(l) {
    l.nodes().forEach((c) => r(l.node(c))), l.edges().forEach((c) => {
      let u = l.edge(c);
      u.points.forEach(r), Object.hasOwn(u, "y") && r(u);
    });
  }
  function r(l) {
    l.y = -l.y;
  }
  function a(l) {
    l.nodes().forEach((c) => s(l.node(c))), l.edges().forEach((c) => {
      let u = l.edge(c);
      u.points.forEach(s), Object.hasOwn(u, "x") && s(u);
    });
  }
  function s(l) {
    let c = l.x;
    l.x = l.y, l.y = c;
  }
  return ya;
}
var wa, wc;
function VS() {
  if (wc) return wa;
  wc = 1;
  let e = Ge();
  wa = t;
  function t(n) {
    let i = {}, o = n.nodes().filter((u) => !n.children(u).length), r = o.map((u) => n.node(u).rank), a = e.applyWithChunking(Math.max, r), s = e.range(a + 1).map(() => []);
    function l(u) {
      if (i[u]) return;
      i[u] = !0;
      let d = n.node(u);
      s[d.rank].push(u), n.successors(u).forEach(l);
    }
    return o.sort((u, d) => n.node(u).rank - n.node(d).rank).forEach(l), s;
  }
  return wa;
}
var ba, bc;
function BS() {
  if (bc) return ba;
  bc = 1;
  let e = Ge().zipObject;
  ba = t;
  function t(i, o) {
    let r = 0;
    for (let a = 1; a < o.length; ++a)
      r += n(i, o[a - 1], o[a]);
    return r;
  }
  function n(i, o, r) {
    let a = e(r, r.map((h, p) => p)), s = o.flatMap((h) => i.outEdges(h).map((p) => ({ pos: a[p.w], weight: i.edge(p).weight })).sort((p, v) => p.pos - v.pos)), l = 1;
    for (; l < r.length; ) l <<= 1;
    let c = 2 * l - 1;
    l -= 1;
    let u = new Array(c).fill(0), d = 0;
    return s.forEach((h) => {
      let p = h.pos + l;
      u[p] += h.weight;
      let v = 0;
      for (; p > 0; )
        p % 2 && (v += u[p + 1]), p = p - 1 >> 1, u[p] += h.weight;
      d += h.weight * v;
    }), d;
  }
  return ba;
}
var _a, _c;
function zS() {
  if (_c) return _a;
  _c = 1, _a = e;
  function e(t, n = []) {
    return n.map((i) => {
      let o = t.inEdges(i);
      if (o.length) {
        let r = o.reduce((a, s) => {
          let l = t.edge(s), c = t.node(s.v);
          return {
            sum: a.sum + l.weight * c.order,
            weight: a.weight + l.weight
          };
        }, { sum: 0, weight: 0 });
        return {
          v: i,
          barycenter: r.sum / r.weight,
          weight: r.weight
        };
      } else
        return { v: i };
    });
  }
  return _a;
}
var ka, kc;
function FS() {
  if (kc) return ka;
  kc = 1;
  let e = Ge();
  ka = t;
  function t(o, r) {
    let a = {};
    o.forEach((l, c) => {
      let u = a[l.v] = {
        indegree: 0,
        in: [],
        out: [],
        vs: [l.v],
        i: c
      };
      l.barycenter !== void 0 && (u.barycenter = l.barycenter, u.weight = l.weight);
    }), r.edges().forEach((l) => {
      let c = a[l.v], u = a[l.w];
      c !== void 0 && u !== void 0 && (u.indegree++, c.out.push(a[l.w]));
    });
    let s = Object.values(a).filter((l) => !l.indegree);
    return n(s);
  }
  function n(o) {
    let r = [];
    function a(l) {
      return (c) => {
        c.merged || (c.barycenter === void 0 || l.barycenter === void 0 || c.barycenter >= l.barycenter) && i(l, c);
      };
    }
    function s(l) {
      return (c) => {
        c.in.push(l), --c.indegree === 0 && o.push(c);
      };
    }
    for (; o.length; ) {
      let l = o.pop();
      r.push(l), l.in.reverse().forEach(a(l)), l.out.forEach(s(l));
    }
    return r.filter((l) => !l.merged).map((l) => e.pick(l, ["vs", "i", "barycenter", "weight"]));
  }
  function i(o, r) {
    let a = 0, s = 0;
    o.weight && (a += o.barycenter * o.weight, s += o.weight), r.weight && (a += r.barycenter * r.weight, s += r.weight), o.vs = r.vs.concat(o.vs), o.barycenter = a / s, o.weight = s, o.i = Math.min(r.i, o.i), r.merged = !0;
  }
  return ka;
}
var Ea, Ec;
function HS() {
  if (Ec) return Ea;
  Ec = 1;
  let e = Ge();
  Ea = t;
  function t(o, r) {
    let a = e.partition(o, (v) => Object.hasOwn(v, "barycenter")), s = a.lhs, l = a.rhs.sort((v, g) => g.i - v.i), c = [], u = 0, d = 0, h = 0;
    s.sort(i(!!r)), h = n(c, l, h), s.forEach((v) => {
      h += v.vs.length, c.push(v.vs), u += v.barycenter * v.weight, d += v.weight, h = n(c, l, h);
    });
    let p = { vs: c.flat(!0) };
    return d && (p.barycenter = u / d, p.weight = d), p;
  }
  function n(o, r, a) {
    let s;
    for (; r.length && (s = r[r.length - 1]).i <= a; )
      r.pop(), o.push(s.vs), a++;
    return a;
  }
  function i(o) {
    return (r, a) => r.barycenter < a.barycenter ? -1 : r.barycenter > a.barycenter ? 1 : o ? a.i - r.i : r.i - a.i;
  }
  return Ea;
}
var xa, xc;
function qS() {
  if (xc) return xa;
  xc = 1;
  let e = zS(), t = FS(), n = HS();
  xa = i;
  function i(a, s, l, c) {
    let u = a.children(s), d = a.node(s), h = d ? d.borderLeft : void 0, p = d ? d.borderRight : void 0, v = {};
    h && (u = u.filter((x) => x !== h && x !== p));
    let g = e(a, u);
    g.forEach((x) => {
      if (a.children(x.v).length) {
        let w = i(a, x.v, l, c);
        v[x.v] = w, Object.hasOwn(w, "barycenter") && r(x, w);
      }
    });
    let m = t(g, l);
    o(m, v);
    let k = n(m, c);
    if (h && (k.vs = [h, k.vs, p].flat(!0), a.predecessors(h).length)) {
      let x = a.node(a.predecessors(h)[0]), w = a.node(a.predecessors(p)[0]);
      Object.hasOwn(k, "barycenter") || (k.barycenter = 0, k.weight = 0), k.barycenter = (k.barycenter * k.weight + x.order + w.order) / (k.weight + 2), k.weight += 2;
    }
    return k;
  }
  function o(a, s) {
    a.forEach((l) => {
      l.vs = l.vs.flatMap((c) => s[c] ? s[c].vs : c);
    });
  }
  function r(a, s) {
    a.barycenter !== void 0 ? (a.barycenter = (a.barycenter * a.weight + s.barycenter * s.weight) / (a.weight + s.weight), a.weight += s.weight) : (a.barycenter = s.barycenter, a.weight = s.weight);
  }
  return xa;
}
var $a, $c;
function US() {
  if ($c) return $a;
  $c = 1;
  let e = wt().Graph, t = Ge();
  $a = n;
  function n(o, r, a, s) {
    s || (s = o.nodes());
    let l = i(o), c = new e({ compound: !0 }).setGraph({ root: l }).setDefaultNodeLabel((u) => o.node(u));
    return s.forEach((u) => {
      let d = o.node(u), h = o.parent(u);
      (d.rank === r || d.minRank <= r && r <= d.maxRank) && (c.setNode(u), c.setParent(u, h || l), o[a](u).forEach((p) => {
        let v = p.v === u ? p.w : p.v, g = c.edge(v, u), m = g !== void 0 ? g.weight : 0;
        c.setEdge(v, u, { weight: o.edge(p).weight + m });
      }), Object.hasOwn(d, "minRank") && c.setNode(u, {
        borderLeft: d.borderLeft[r],
        borderRight: d.borderRight[r]
      }));
    }), c;
  }
  function i(o) {
    for (var r; o.hasNode(r = t.uniqueId("_root")); ) ;
    return r;
  }
  return $a;
}
var Sa, Sc;
function WS() {
  if (Sc) return Sa;
  Sc = 1, Sa = e;
  function e(t, n, i) {
    let o = {}, r;
    i.forEach((a) => {
      let s = t.parent(a), l, c;
      for (; s; ) {
        if (l = t.parent(s), l ? (c = o[l], o[l] = s) : (c = r, r = s), c && c !== s) {
          n.setEdge(c, s);
          return;
        }
        s = l;
      }
    });
  }
  return Sa;
}
var Ca, Cc;
function YS() {
  if (Cc) return Ca;
  Cc = 1;
  let e = VS(), t = BS(), n = qS(), i = US(), o = WS(), r = wt().Graph, a = Ge();
  Ca = s;
  function s(d, h) {
    if (h && typeof h.customOrder == "function") {
      h.customOrder(d, s);
      return;
    }
    let p = a.maxRank(d), v = l(d, a.range(1, p + 1), "inEdges"), g = l(d, a.range(p - 1, -1, -1), "outEdges"), m = e(d);
    if (u(d, m), h && h.disableOptimalOrderHeuristic)
      return;
    let k = Number.POSITIVE_INFINITY, x;
    for (let w = 0, b = 0; b < 4; ++w, ++b) {
      c(w % 2 ? v : g, w % 4 >= 2), m = a.buildLayerMatrix(d);
      let C = t(d, m);
      C < k && (b = 0, x = Object.assign({}, m), k = C);
    }
    u(d, x);
  }
  function l(d, h, p) {
    const v = /* @__PURE__ */ new Map(), g = (m, k) => {
      v.has(m) || v.set(m, []), v.get(m).push(k);
    };
    for (const m of d.nodes()) {
      const k = d.node(m);
      if (typeof k.rank == "number" && g(k.rank, m), typeof k.minRank == "number" && typeof k.maxRank == "number")
        for (let x = k.minRank; x <= k.maxRank; x++)
          x !== k.rank && g(x, m);
    }
    return h.map(function(m) {
      return i(d, m, p, v.get(m) || []);
    });
  }
  function c(d, h) {
    let p = new r();
    d.forEach(function(v) {
      let g = v.graph().root, m = n(v, g, p, h);
      m.vs.forEach((k, x) => v.node(k).order = x), o(v, p, m.vs);
    });
  }
  function u(d, h) {
    Object.values(h).forEach((p) => p.forEach((v, g) => d.node(v).order = g));
  }
  return Ca;
}
var Na, Nc;
function GS() {
  if (Nc) return Na;
  Nc = 1;
  let e = wt().Graph, t = Ge();
  Na = {
    positionX: p,
    findType1Conflicts: n,
    findType2Conflicts: i,
    addConflict: r,
    hasConflict: a,
    verticalAlignment: s,
    horizontalCompaction: l,
    alignCoordinates: d,
    findSmallestWidthAlignment: u,
    balance: h
  };
  function n(m, k) {
    let x = {};
    function w(b, C) {
      let I = 0, z = 0, T = b.length, O = C[C.length - 1];
      return C.forEach((D, B) => {
        let N = o(m, D), H = N ? m.node(N).order : T;
        (N || D === O) && (C.slice(z, B + 1).forEach((y) => {
          m.predecessors(y).forEach((E) => {
            let _ = m.node(E), L = _.order;
            (L < I || H < L) && !(_.dummy && m.node(y).dummy) && r(x, E, y);
          });
        }), z = B + 1, I = H);
      }), C;
    }
    return k.length && k.reduce(w), x;
  }
  function i(m, k) {
    let x = {};
    function w(C, I, z, T, O) {
      let D;
      t.range(I, z).forEach((B) => {
        D = C[B], m.node(D).dummy && m.predecessors(D).forEach((N) => {
          let H = m.node(N);
          H.dummy && (H.order < T || H.order > O) && r(x, N, D);
        });
      });
    }
    function b(C, I) {
      let z = -1, T, O = 0;
      return I.forEach((D, B) => {
        if (m.node(D).dummy === "border") {
          let N = m.predecessors(D);
          N.length && (T = m.node(N[0]).order, w(I, O, B, z, T), O = B, z = T);
        }
        w(I, O, I.length, T, C.length);
      }), I;
    }
    return k.length && k.reduce(b), x;
  }
  function o(m, k) {
    if (m.node(k).dummy)
      return m.predecessors(k).find((x) => m.node(x).dummy);
  }
  function r(m, k, x) {
    if (k > x) {
      let b = k;
      k = x, x = b;
    }
    let w = m[k];
    w || (m[k] = w = {}), w[x] = !0;
  }
  function a(m, k, x) {
    if (k > x) {
      let w = k;
      k = x, x = w;
    }
    return !!m[k] && Object.hasOwn(m[k], x);
  }
  function s(m, k, x, w) {
    let b = {}, C = {}, I = {};
    return k.forEach((z) => {
      z.forEach((T, O) => {
        b[T] = T, C[T] = T, I[T] = O;
      });
    }), k.forEach((z) => {
      let T = -1;
      z.forEach((O) => {
        let D = w(O);
        if (D.length) {
          D = D.sort((N, H) => I[N] - I[H]);
          let B = (D.length - 1) / 2;
          for (let N = Math.floor(B), H = Math.ceil(B); N <= H; ++N) {
            let y = D[N];
            C[O] === O && T < I[y] && !a(x, O, y) && (C[y] = O, C[O] = b[O] = b[y], T = I[y]);
          }
        }
      });
    }), { root: b, align: C };
  }
  function l(m, k, x, w, b) {
    let C = {}, I = c(m, k, x, b), z = b ? "borderLeft" : "borderRight";
    function T(B, N) {
      let H = I.nodes(), y = H.pop(), E = {};
      for (; y; )
        E[y] ? B(y) : (E[y] = !0, H.push(y), H = H.concat(N(y))), y = H.pop();
    }
    function O(B) {
      C[B] = I.inEdges(B).reduce((N, H) => Math.max(N, C[H.v] + I.edge(H)), 0);
    }
    function D(B) {
      let N = I.outEdges(B).reduce((y, E) => Math.min(y, C[E.w] - I.edge(E)), Number.POSITIVE_INFINITY), H = m.node(B);
      N !== Number.POSITIVE_INFINITY && H.borderType !== z && (C[B] = Math.max(C[B], N));
    }
    return T(O, I.predecessors.bind(I)), T(D, I.successors.bind(I)), Object.keys(w).forEach((B) => C[B] = C[x[B]]), C;
  }
  function c(m, k, x, w) {
    let b = new e(), C = m.graph(), I = v(C.nodesep, C.edgesep, w);
    return k.forEach((z) => {
      let T;
      z.forEach((O) => {
        let D = x[O];
        if (b.setNode(D), T) {
          var B = x[T], N = b.edge(B, D);
          b.setEdge(B, D, Math.max(I(m, O, T), N || 0));
        }
        T = O;
      });
    }), b;
  }
  function u(m, k) {
    return Object.values(k).reduce((x, w) => {
      let b = Number.NEGATIVE_INFINITY, C = Number.POSITIVE_INFINITY;
      Object.entries(w).forEach(([z, T]) => {
        let O = g(m, z) / 2;
        b = Math.max(T + O, b), C = Math.min(T - O, C);
      });
      const I = b - C;
      return I < x[0] && (x = [I, w]), x;
    }, [Number.POSITIVE_INFINITY, null])[1];
  }
  function d(m, k) {
    let x = Object.values(k), w = t.applyWithChunking(Math.min, x), b = t.applyWithChunking(Math.max, x);
    ["u", "d"].forEach((C) => {
      ["l", "r"].forEach((I) => {
        let z = C + I, T = m[z];
        if (T === k) return;
        let O = Object.values(T), D = w - t.applyWithChunking(Math.min, O);
        I !== "l" && (D = b - t.applyWithChunking(Math.max, O)), D && (m[z] = t.mapValues(T, (B) => B + D));
      });
    });
  }
  function h(m, k) {
    return t.mapValues(m.ul, (x, w) => {
      if (k)
        return m[k.toLowerCase()][w];
      {
        let b = Object.values(m).map((C) => C[w]).sort((C, I) => C - I);
        return (b[1] + b[2]) / 2;
      }
    });
  }
  function p(m) {
    let k = t.buildLayerMatrix(m), x = Object.assign(
      n(m, k),
      i(m, k)
    ), w = {}, b;
    ["u", "d"].forEach((I) => {
      b = I === "u" ? k : Object.values(k).reverse(), ["l", "r"].forEach((z) => {
        z === "r" && (b = b.map((B) => Object.values(B).reverse()));
        let T = (I === "u" ? m.predecessors : m.successors).bind(m), O = s(m, b, x, T), D = l(
          m,
          b,
          O.root,
          O.align,
          z === "r"
        );
        z === "r" && (D = t.mapValues(D, (B) => -B)), w[I + z] = D;
      });
    });
    let C = u(m, w);
    return d(w, C), h(w, m.graph().align);
  }
  function v(m, k, x) {
    return (w, b, C) => {
      let I = w.node(b), z = w.node(C), T = 0, O;
      if (T += I.width / 2, Object.hasOwn(I, "labelpos"))
        switch (I.labelpos.toLowerCase()) {
          case "l":
            O = -I.width / 2;
            break;
          case "r":
            O = I.width / 2;
            break;
        }
      if (O && (T += x ? O : -O), O = 0, T += (I.dummy ? k : m) / 2, T += (z.dummy ? k : m) / 2, T += z.width / 2, Object.hasOwn(z, "labelpos"))
        switch (z.labelpos.toLowerCase()) {
          case "l":
            O = z.width / 2;
            break;
          case "r":
            O = -z.width / 2;
            break;
        }
      return O && (T += x ? O : -O), O = 0, T;
    };
  }
  function g(m, k) {
    return m.node(k).width;
  }
  return Na;
}
var Ia, Ic;
function jS() {
  if (Ic) return Ia;
  Ic = 1;
  let e = Ge(), t = GS().positionX;
  Ia = n;
  function n(o) {
    o = e.asNonCompoundGraph(o), i(o), Object.entries(t(o)).forEach(([r, a]) => o.node(r).x = a);
  }
  function i(o) {
    let r = e.buildLayerMatrix(o), a = o.graph().ranksep, s = 0;
    r.forEach((l) => {
      const c = l.reduce((u, d) => {
        const h = o.node(d).height;
        return u > h ? u : h;
      }, 0);
      l.forEach((u) => o.node(u).y = s + c / 2), s += c + a;
    });
  }
  return Ia;
}
var Aa, Ac;
function XS() {
  if (Ac) return Aa;
  Ac = 1;
  let e = AS(), t = MS(), n = OS(), i = Ge().normalizeRanks, o = RS(), r = Ge().removeEmptyRanks, a = DS(), s = PS(), l = LS(), c = YS(), u = jS(), d = Ge(), h = wt().Graph;
  Aa = p;
  function p(W, K) {
    let G = K && K.debugTiming ? d.time : d.notime;
    G("layout", () => {
      let ee = G("  buildLayoutGraph", () => T(W));
      G("  runLayout", () => v(ee, G, K)), G("  updateInputGraph", () => g(W, ee));
    });
  }
  function v(W, K, G) {
    K("    makeSpaceForEdgeLabels", () => O(W)), K("    removeSelfEdges", () => F(W)), K("    acyclic", () => e.run(W)), K("    nestingGraph.run", () => a.run(W)), K("    rank", () => n(d.asNonCompoundGraph(W))), K("    injectEdgeLabelProxies", () => D(W)), K("    removeEmptyRanks", () => r(W)), K("    nestingGraph.cleanup", () => a.cleanup(W)), K("    normalizeRanks", () => i(W)), K("    assignRankMinMax", () => B(W)), K("    removeEdgeLabelProxies", () => N(W)), K("    normalize.run", () => t.run(W)), K("    parentDummyChains", () => o(W)), K("    addBorderSegments", () => s(W)), K("    order", () => c(W, G)), K("    insertSelfEdges", () => J(W)), K("    adjustCoordinateSystem", () => l.adjust(W)), K("    position", () => u(W)), K("    positionSelfEdges", () => X(W)), K("    removeBorderNodes", () => L(W)), K("    normalize.undo", () => t.undo(W)), K("    fixupEdgeLabelCoords", () => E(W)), K("    undoCoordinateSystem", () => l.undo(W)), K("    translateGraph", () => H(W)), K("    assignNodeIntersects", () => y(W)), K("    reversePoints", () => _(W)), K("    acyclic.undo", () => e.undo(W));
  }
  function g(W, K) {
    W.nodes().forEach((G) => {
      let ee = W.node(G), te = K.node(G);
      ee && (ee.x = te.x, ee.y = te.y, ee.rank = te.rank, K.children(G).length && (ee.width = te.width, ee.height = te.height));
    }), W.edges().forEach((G) => {
      let ee = W.edge(G), te = K.edge(G);
      ee.points = te.points, Object.hasOwn(te, "x") && (ee.x = te.x, ee.y = te.y);
    }), W.graph().width = K.graph().width, W.graph().height = K.graph().height;
  }
  let m = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"], k = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" }, x = ["acyclicer", "ranker", "rankdir", "align"], w = ["width", "height", "rank"], b = { width: 0, height: 0 }, C = ["minlen", "weight", "width", "height", "labeloffset"], I = {
    minlen: 1,
    weight: 1,
    width: 0,
    height: 0,
    labeloffset: 10,
    labelpos: "r"
  }, z = ["labelpos"];
  function T(W) {
    let K = new h({ multigraph: !0, compound: !0 }), G = se(W.graph());
    return K.setGraph(Object.assign(
      {},
      k,
      oe(G, m),
      d.pick(G, x)
    )), W.nodes().forEach((ee) => {
      let te = se(W.node(ee));
      const re = oe(te, w);
      Object.keys(b).forEach((le) => {
        re[le] === void 0 && (re[le] = b[le]);
      }), K.setNode(ee, re), K.setParent(ee, W.parent(ee));
    }), W.edges().forEach((ee) => {
      let te = se(W.edge(ee));
      K.setEdge(ee, Object.assign(
        {},
        I,
        oe(te, C),
        d.pick(te, z)
      ));
    }), K;
  }
  function O(W) {
    let K = W.graph();
    K.ranksep /= 2, W.edges().forEach((G) => {
      let ee = W.edge(G);
      ee.minlen *= 2, ee.labelpos.toLowerCase() !== "c" && (K.rankdir === "TB" || K.rankdir === "BT" ? ee.width += ee.labeloffset : ee.height += ee.labeloffset);
    });
  }
  function D(W) {
    W.edges().forEach((K) => {
      let G = W.edge(K);
      if (G.width && G.height) {
        let ee = W.node(K.v), re = { rank: (W.node(K.w).rank - ee.rank) / 2 + ee.rank, e: K };
        d.addDummyNode(W, "edge-proxy", re, "_ep");
      }
    });
  }
  function B(W) {
    let K = 0;
    W.nodes().forEach((G) => {
      let ee = W.node(G);
      ee.borderTop && (ee.minRank = W.node(ee.borderTop).rank, ee.maxRank = W.node(ee.borderBottom).rank, K = Math.max(K, ee.maxRank));
    }), W.graph().maxRank = K;
  }
  function N(W) {
    W.nodes().forEach((K) => {
      let G = W.node(K);
      G.dummy === "edge-proxy" && (W.edge(G.e).labelRank = G.rank, W.removeNode(K));
    });
  }
  function H(W) {
    let K = Number.POSITIVE_INFINITY, G = 0, ee = Number.POSITIVE_INFINITY, te = 0, re = W.graph(), le = re.marginx || 0, we = re.marginy || 0;
    function $e(pe) {
      let me = pe.x, P = pe.y, M = pe.width, A = pe.height;
      K = Math.min(K, me - M / 2), G = Math.max(G, me + M / 2), ee = Math.min(ee, P - A / 2), te = Math.max(te, P + A / 2);
    }
    W.nodes().forEach((pe) => $e(W.node(pe))), W.edges().forEach((pe) => {
      let me = W.edge(pe);
      Object.hasOwn(me, "x") && $e(me);
    }), K -= le, ee -= we, W.nodes().forEach((pe) => {
      let me = W.node(pe);
      me.x -= K, me.y -= ee;
    }), W.edges().forEach((pe) => {
      let me = W.edge(pe);
      me.points.forEach((P) => {
        P.x -= K, P.y -= ee;
      }), Object.hasOwn(me, "x") && (me.x -= K), Object.hasOwn(me, "y") && (me.y -= ee);
    }), re.width = G - K + le, re.height = te - ee + we;
  }
  function y(W) {
    W.edges().forEach((K) => {
      let G = W.edge(K), ee = W.node(K.v), te = W.node(K.w), re, le;
      G.points ? (re = G.points[0], le = G.points[G.points.length - 1]) : (G.points = [], re = te, le = ee), G.points.unshift(d.intersectRect(ee, re)), G.points.push(d.intersectRect(te, le));
    });
  }
  function E(W) {
    W.edges().forEach((K) => {
      let G = W.edge(K);
      if (Object.hasOwn(G, "x"))
        switch ((G.labelpos === "l" || G.labelpos === "r") && (G.width -= G.labeloffset), G.labelpos) {
          case "l":
            G.x -= G.width / 2 + G.labeloffset;
            break;
          case "r":
            G.x += G.width / 2 + G.labeloffset;
            break;
        }
    });
  }
  function _(W) {
    W.edges().forEach((K) => {
      let G = W.edge(K);
      G.reversed && G.points.reverse();
    });
  }
  function L(W) {
    W.nodes().forEach((K) => {
      if (W.children(K).length) {
        let G = W.node(K), ee = W.node(G.borderTop), te = W.node(G.borderBottom), re = W.node(G.borderLeft[G.borderLeft.length - 1]), le = W.node(G.borderRight[G.borderRight.length - 1]);
        G.width = Math.abs(le.x - re.x), G.height = Math.abs(te.y - ee.y), G.x = re.x + G.width / 2, G.y = ee.y + G.height / 2;
      }
    }), W.nodes().forEach((K) => {
      W.node(K).dummy === "border" && W.removeNode(K);
    });
  }
  function F(W) {
    W.edges().forEach((K) => {
      if (K.v === K.w) {
        var G = W.node(K.v);
        G.selfEdges || (G.selfEdges = []), G.selfEdges.push({ e: K, label: W.edge(K) }), W.removeEdge(K);
      }
    });
  }
  function J(W) {
    var K = d.buildLayerMatrix(W);
    K.forEach((G) => {
      var ee = 0;
      G.forEach((te, re) => {
        var le = W.node(te);
        le.order = re + ee, (le.selfEdges || []).forEach((we) => {
          d.addDummyNode(W, "selfedge", {
            width: we.label.width,
            height: we.label.height,
            rank: le.rank,
            order: re + ++ee,
            e: we.e,
            label: we.label
          }, "_se");
        }), delete le.selfEdges;
      });
    });
  }
  function X(W) {
    W.nodes().forEach((K) => {
      var G = W.node(K);
      if (G.dummy === "selfedge") {
        var ee = W.node(G.e.v), te = ee.x + ee.width / 2, re = ee.y, le = G.x - te, we = ee.height / 2;
        W.setEdge(G.e, G.label), W.removeNode(K), G.label.points = [
          { x: te + 2 * le / 3, y: re - we },
          { x: te + 5 * le / 6, y: re - we },
          { x: te + le, y: re },
          { x: te + 5 * le / 6, y: re + we },
          { x: te + 2 * le / 3, y: re + we }
        ], G.label.x = G.x, G.label.y = G.y;
      }
    });
  }
  function oe(W, K) {
    return d.mapValues(d.pick(W, K), Number);
  }
  function se(W) {
    var K = {};
    return W && Object.entries(W).forEach(([G, ee]) => {
      typeof G == "string" && (G = G.toLowerCase()), K[G] = ee;
    }), K;
  }
  return Aa;
}
var Ma, Mc;
function KS() {
  if (Mc) return Ma;
  Mc = 1;
  let e = Ge(), t = wt().Graph;
  Ma = {
    debugOrdering: n
  };
  function n(i) {
    let o = e.buildLayerMatrix(i), r = new t({ compound: !0, multigraph: !0 }).setGraph({});
    return i.nodes().forEach((a) => {
      r.setNode(a, { label: a }), r.setParent(a, "layer" + i.node(a).rank);
    }), i.edges().forEach((a) => r.setEdge(a.v, a.w, {}, a.name)), o.forEach((a, s) => {
      let l = "layer" + s;
      r.setNode(l, { rank: "same" }), a.reduce((c, u) => (r.setEdge(c, u, { style: "invis" }), u));
    }), r;
  }
  return Ma;
}
var Ta, Tc;
function ZS() {
  return Tc || (Tc = 1, Ta = "1.1.8"), Ta;
}
var Oa, Oc;
function JS() {
  return Oc || (Oc = 1, Oa = {
    graphlib: wt(),
    layout: XS(),
    debug: KS(),
    util: {
      time: Ge().time,
      notime: Ge().notime
    },
    version: ZS()
  }), Oa;
}
var QS = JS();
const Rc = /* @__PURE__ */ vS(QS), Ko = 26, Dc = 26, eC = 120;
function Wh(e) {
  const t = [{ id: "result", label: "Finished" }];
  return (e.child_interface?.error_schema != null || e.error_schema != null) && t.push({ id: "failed", label: "Failed" }), t;
}
function cr(e) {
  if (!Cd(e.kind)) return !1;
  const n = (e.config || {}).flow_ref;
  if (!n || typeof n != "object" || Array.isArray(n)) return !1;
  const i = n;
  return i.kind === "flow" && typeof i.id == "string" && i.id.length > 0 && typeof i.version == "number" && Number.isInteger(i.version) && i.version > 0;
}
function Dn(e) {
  return cr(e) ? Wh(e).filter((t) => t.id !== Nt.id) : Zi(e.kind, e.ref).filter((t) => t.id !== Nt.id);
}
function tC(e) {
  return (cr(e) ? void 0 : wi(e.kind, e.ref).continuation) || Dn(e)[0]?.id || void 0;
}
function ll(e) {
  return cr(e) ? Wh(e).some((t) => t.id === Nt.id) : Zi(e.kind, e.ref).some((t) => t.id === Nt.id);
}
function pn(e) {
  const t = Dn(e);
  return nh(t, ll(e));
}
function Yh(e) {
  return !!e && Number.isFinite(e.x) && Number.isFinite(e.y);
}
function fs(e, t, n, i) {
  const o = e.positions[t];
  return Yh(o) ? o : i[t] ? i[t] : { x: 60 + n % 4 * 280, y: 60 + Math.floor(n / 4) * 170 };
}
function In(e, t = "TB") {
  const i = Object.keys(e.nodes).some((r) => !Yh(e.positions[r])) ? jh(e, t) : {}, o = {};
  return Object.values(e.nodes).forEach((r, a) => {
    o[r.id] = fs(e, r.id, a, i);
  }), o;
}
function nC(e) {
  const t = {};
  for (const n of Object.values(e.edges)) (t[n.source_id] ||= []).push(n);
  return t;
}
function oC(e, t, n) {
  let i = 1 / 0, o = 1 / 0, r = -1 / 0, a = -1 / 0;
  for (const s of t) {
    const l = n[s];
    if (!l) continue;
    i = Math.min(i, l.x), o = Math.min(o, l.y);
    const c = pn(e.nodes[s]);
    r = Math.max(r, l.x + c.width), a = Math.max(a, l.y + c.height);
  }
  return Number.isFinite(i) || (i = 0, o = 0, r = yo, a = Ao), {
    x: i - Ko,
    y: o - Ko - Dc,
    width: r - i + Ko * 2,
    height: a - o + Ko * 2 + Dc
  };
}
function dr(e, t, n) {
  const i = n || nC(e), o = {}, r = [], a = Object.values(e.nodes).filter((s) => yi(s.kind) || s.kind === "cycle").map((s) => s.id).sort();
  for (const s of a) {
    const l = [], c = /* @__PURE__ */ new Set(), u = (i[s] || []).filter((d) => d.source_port === "body").map((d) => d.target_id);
    for (; u.length; ) {
      const d = u.pop();
      if (!(d === s || c.has(d) || !e.nodes[d]) && (c.add(d), !o[d])) {
        o[d] = s, l.push(d);
        for (const h of i[d] || []) u.push(h.target_id);
      }
    }
    l.length && r.push({ id: s, kind: e.nodes[s].kind, members: l, box: oC(e, l, t) });
  }
  return { containers: r, parentOf: o };
}
function iC(e, t, n, i, o, r = eC) {
  let a = 1 / 0, s = 1 / 0, l = -1 / 0, c = -1 / 0;
  const u = i[t], d = (p, v, g) => {
    const m = pn(e.nodes[p]);
    a = Math.min(a, v), s = Math.min(s, g), l = Math.max(l, v + m.width), c = Math.max(c, g + m.height);
  };
  u && d(t, u.x, u.y);
  for (const p of n) {
    if (p === o) continue;
    const v = i[p];
    v && d(p, v.x, v.y);
  }
  Number.isFinite(a) || (a = 0, s = 0, l = yo, c = Ao);
  const h = o && e.nodes[o] ? pn(e.nodes[o]) : null;
  return {
    x: a - r,
    y: s - r,
    width: Math.max(l - a + r * 2, h?.width || 0),
    height: Math.max(c - s + r * 2, h?.height || 0)
  };
}
function rC(e, t, n, i = { width: yo, height: Ao }) {
  const o = Math.max(n.x, n.x + n.width - i.width), r = Math.max(n.y, n.y + n.height - i.height);
  return {
    x: Math.min(Math.max(e, n.x), o),
    y: Math.min(Math.max(t, n.y), r)
  };
}
function Gh(e, t, n, i) {
  const { containers: o } = dr(e, n, i);
  let r = null;
  for (const a of o) {
    const s = a.box;
    t.x < s.x || t.x > s.x + s.width || t.y < s.y || t.y > s.y + s.height || (!r || s.width * s.height < r.box.width * r.box.height) && (r = a);
  }
  return r?.id ?? null;
}
function aC(e, t) {
  const n = new Map(t.map((r) => [r, /* @__PURE__ */ new Set()]));
  for (const r of Object.values(e.edges))
    !n.has(r.source_id) || !n.has(r.target_id) || (n.get(r.source_id)?.add(r.target_id), n.get(r.target_id)?.add(r.source_id));
  const i = /* @__PURE__ */ new Set(), o = [];
  for (const r of t) {
    if (i.has(r)) continue;
    const a = [], s = [r];
    for (i.add(r); s.length; ) {
      const l = s.pop();
      a.push(l);
      for (const c of n.get(l) || []) i.has(c) || (i.add(c), s.push(c));
    }
    o.push(a);
  }
  return o;
}
function jh(e, t, n) {
  const i = Object.keys(e.nodes);
  if (!i.length) return {};
  const o = {}, r = aC(e, i).map((p) => {
    const v = new Set(p), g = new Rc.graphlib.Graph();
    g.setGraph({ rankdir: t, nodesep: 48, ranksep: 84, marginx: 0, marginy: 0 }), g.setDefaultEdgeLabel(() => ({}));
    for (const I of p) g.setNode(I, pn(e.nodes[I]));
    const m = /* @__PURE__ */ new Set();
    for (const I of Object.values(e.edges)) {
      if (!v.has(I.source_id) || !v.has(I.target_id)) continue;
      const z = `${I.source_id}->${I.target_id}`;
      m.has(z) || (m.add(z), g.setEdge(I.source_id, I.target_id));
    }
    Rc.layout(g);
    let k = 1 / 0, x = 1 / 0, w = -1 / 0, b = -1 / 0;
    const C = {};
    for (const I of p) {
      const z = g.node(I);
      if (!z) continue;
      const T = z.x - z.width / 2, O = z.y - z.height / 2;
      C[I] = { x: T, y: O }, k = Math.min(k, T), x = Math.min(x, O), w = Math.max(w, T + z.width), b = Math.max(b, O + z.height);
    }
    for (const I of Object.values(C))
      I.x -= k, I.y -= x;
    return { ids: p, local: C, width: w - k, height: b - x };
  }), a = Math.max(0.01, n?.minZoom || 1), s = Math.max(Di, (n?.width || 1200) / a - 80), l = Math.max(Ao, (n?.height || 800) / a - 80), c = s <= Di + 8 ? 6 : Math.max(12, Math.min(48, Math.floor(Math.min(s, l) * 0.04)));
  let u = 40, d = 40, h = 0;
  for (const p of r)
    if (t === "TB") {
      u > 40 && u + p.width > 40 + s && (u = 40, d += h + c, h = 0);
      for (const v of p.ids) o[v] = { x: Math.round(u + p.local[v].x), y: Math.round(d + p.local[v].y) };
      u += p.width + c, h = Math.max(h, p.height);
    } else {
      d > 40 && d + p.height > 40 + l && (d = 40, u += h + c, h = 0);
      for (const v of p.ids) o[v] = { x: Math.round(u + p.local[v].x), y: Math.round(d + p.local[v].y) };
      d += p.height + c, h = Math.max(h, p.width);
    }
  return o;
}
const sC = 200, lC = 120, uC = 420, cC = 280;
function dC(e) {
  const t = e.child_interface, n = t?.input_schema ?? e.input_schema, i = t?.output_schema ?? e.output_schema;
  if (!(n == null && i == null))
    return `${Rl(n)} → ${Rl(i)}`;
}
function Xh(e, t, n = "TB", i, o = !1) {
  const r = [], a = Object.values(e.nodes), s = In(e, n), l = {};
  for (const v of Object.values(e.edges)) (l[v.source_id] ||= []).push(v);
  const c = Object.values(e.notes);
  c.forEach((v, g) => {
    if (v.kind !== "frame") return;
    const m = fs(e, v.id, g, {}), k = m.width || v.width || uC, x = m.height || v.height || cC;
    r.push({
      id: v.id,
      type: "wfFrame",
      ariaLabel: `Frame: ${v.text || "Untitled frame"}`,
      focusable: !0,
      position: { x: m.x, y: m.y },
      data: { text: v.text, kind: "frame", width: k, height: x, color: v.color },
      zIndex: 0,
      style: { width: `${k}px`, height: `${x}px` }
    });
  });
  const { containers: u } = dr(e, s, l);
  for (const v of u) {
    const g = e.nodes[v.id];
    r.push({
      id: `__box_${v.id}`,
      type: "wfContainer",
      position: { x: v.box.x, y: v.box.y },
      class: "wf-container-node",
      data: {
        kind: v.kind,
        label: Je(g.title, g.ref),
        icon: wi(v.kind).icon
      },
      zIndex: 0,
      selectable: !1,
      draggable: !1,
      focusable: !1,
      style: {
        width: `${v.box.width}px`,
        height: `${v.box.height}px`,
        pointerEvents: "none"
      }
    });
  }
  c.forEach((v, g) => {
    if (v.kind === "frame") return;
    const m = fs(e, v.id, g, {}), k = m.width || v.width || sC, x = m.height || v.height || lC;
    r.push({
      id: v.id,
      type: "wfNote",
      ariaLabel: `Note: ${v.text || "Empty note"}`,
      focusable: !0,
      position: { x: m.x, y: m.y },
      data: { text: v.text, kind: "note", width: k, height: x, color: v.color },
      zIndex: 0,
      style: { width: `${k}px`, height: `${x}px` }
    });
  });
  const d = {};
  a.forEach((v) => {
    const g = wi(v.kind, v.ref), m = s[v.id], k = Cs(v.kind) ? v.kind : void 0, x = !!k || v.pinned === !0 || !!v.boundary, w = cr(v), b = Dn(v), C = ll(v), I = C && (l[v.id] || []).some((O) => Ha(O.source_port)), z = Je(v.title, v.ref), T = t?.node[v.id] || "idle";
    d[v.id] = fC(b, k, C), r.push({
      id: v.id,
      type: "wfNode",
      ariaLabel: `${g.label} step: ${z}${T === "idle" ? "" : `, status ${T}`}`,
      focusable: !0,
      position: { x: m.x, y: m.y },
      zIndex: 1,
      data: {
        kind: v.kind,
        kindLabel: g.label,
        title: z,
        ref: v.ref_label || v.ref || "",
        icon: v.icon || g.icon,
        hueVar: g.hueVar,
        runStatus: T,
        outPorts: b,
        failedPort: C,
        failedWired: I,
        pinned: x,
        boundaryRole: k,
        awaitingLabel: "Waiting",
        awaitingIcon: "tabler:hourglass",
        sub: w ? dC(v) : void 0,
        issue: i?.get(v.id)
      }
    });
  });
  const h = new Set(a.map((v) => v.id)), p = [];
  for (const v of Object.values(e.edges)) {
    if (!h.has(v.source_id) || !h.has(v.target_id)) continue;
    const g = e.nodes[v.source_id], m = e.nodes[v.target_id], k = Ns(e, v), x = Ji(m), w = Is(m, x), b = !v.transform && hS(k, x) === "needs-mapping", C = pS(v, x, k), I = Je(g.title, g.ref), z = Je(m.title, m.ref), T = Ha(v.source_port) ? "Failed" : Dn(g).find((D) => D.id === (v.source_port || ""))?.label, O = `Connection from ${I}${T ? `, ${T} output` : ""} to ${z}`;
    p.push(hC(
      v,
      t,
      !o && b,
      o ? [] : C.unmappedRequired,
      n,
      {
        sources: d[v.source_id]?.sources,
        targets: d[v.target_id]?.targets
      },
      !o && w,
      O
    ));
  }
  return { flowNodes: r, flowEdges: p };
}
function fC(e, t, n = !1) {
  const i = t === "start" ? [] : ["in-top", "in-left"], o = e.length > 1 || (e[0]?.id ?? "") !== "", r = t !== "finish" && t !== "error", a = r ? o ? e.map((s) => s.id) : ["out-bottom", "out-right"] : [];
  return r && n && a.push(Nt.id), { sources: a, targets: i };
}
function Pc(e, t, n) {
  const i = e || n;
  return !t || t.includes(i) ? i : t.includes(n) ? n : t[0] ?? n;
}
function hC(e, t, n = !1, i = [], o = "TB", r, a = !1, s) {
  const l = t?.edge[e.id] === "active", c = t?.edge[e.id] === "done", u = ["wf-edge"];
  l ? u.push("wf-edge--active") : c ? u.push("wf-edge--done") : n && u.push("wf-edge--needs-map"), i.length && u.push("wf-edge--unmapped-required"), a && u.push("wf-edge--contract-unavailable");
  const d = {
    id: e.id,
    source: e.source_id,
    target: e.target_id,
    type: "mapping-completeness",
    ariaLabel: s,
    focusable: !0,
    animated: l,
    data: {
      active: l,
      done: c,
      needsMapping: n,
      unmappedRequired: i,
      contractUnavailable: a,
      transform: e.transform || ""
    },
    class: u.join(" "),
    style: { strokeWidth: l ? 2 : 1.5 },
    markerEnd: { type: Mi.ArrowClosed, width: 14, height: 12 },
    labelBgPadding: [5, 3],
    labelBgBorderRadius: 4
  };
  return d.sourceHandle = Pc(
    e.source_port,
    r?.sources,
    o === "LR" ? "out-right" : "out-bottom"
  ), d.targetHandle = Pc(
    e.target_port,
    r?.targets,
    o === "LR" ? "in-left" : "in-top"
  ), d;
}
function zi(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function pC(e) {
  const t = e.match === "exact" ? "the names match" : `“${e.sourceName}” is the same field name`, n = e.typed ? "the types are compatible" : "the upstream type isn’t declared, so type wasn’t checked";
  return `${e.title} ← ${e.expr} · ${t} and ${n}.`;
}
function vC(e, t) {
  return Sh(e, t).map((i) => ({ name: i.name, expr: i.expr, type: i.type || "any" }));
}
function Lc(e, t) {
  const n = zi(e.key), i = e.type || "any";
  return t.filter((o) => zi(o.name) === n && ol(o.type, i));
}
function mC(e, t) {
  const n = zi(e.key);
  return t.some((o) => zi(o.name) === n) ? "type" : "none";
}
function gC(e, t) {
  const n = t.name === e.key ? "exact" : "canonical", i = t.type !== "any" && !!e.type && e.type !== "any";
  return {
    key: e.key,
    title: e.title || e.key,
    expr: t.expr,
    sourceName: t.name,
    sourceType: t.type,
    targetType: e.type || "any",
    required: e.required,
    match: n,
    typed: i,
    why: pC({ title: e.title || e.key, expr: t.expr, sourceName: t.name, match: n, typed: i })
  };
}
function yC(e, t, n = "output") {
  const i = Mo(t);
  if (!i.length || !Bn(t))
    return { status: "skip", fields: [], transform: "", unresolved: [] };
  const o = vC(e, n), r = [], a = [];
  for (const l of i) {
    const c = Lc(l, o);
    if (c.length === 1) {
      a.push(gC(l, c[0]));
      continue;
    }
    if (l.required) {
      const u = c.length > 1 ? "multiple" : mC(l, o);
      r.push({
        key: l.key,
        title: l.title || l.key,
        reason: u,
        candidates: (c.length > 1 ? c : Lc(l, o)).map((d) => d.expr)
      });
    }
  }
  if (r.length)
    return { status: "ambiguous", fields: [], transform: "", unresolved: r };
  if (!a.length)
    return { status: "skip", fields: [], transform: "", unresolved: [] };
  const s = a.map((l) => ({ key: l.key, mode: "expr", value: l.expr }));
  return { status: "auto", fields: a, transform: us(s), unresolved: [] };
}
function wC(e, t) {
  const n = e.nodes[t];
  return n ? Zi(n.kind, n.ref).some((o) => o.id === "failed") : !1;
}
function bC(e, t, n, i = gt) {
  const o = e.edges[t.id];
  if (!o) return null;
  if (n.kind === "mapping")
    return {
      commands: [ki(o.id, { transform: n.transform })],
      select: { kind: "edge", id: o.id },
      refit: !1
    };
  if (n.kind === "failure_route") {
    const r = e.nodes[o.source_id];
    return !n.available || !r || !wC(e, r.id) ? null : {
      commands: [
        // A success-path transform is not valid for the stable {code,message} failure
        // envelope. Clear it and let the normal mapper loudness guide any recovery input.
        ki(o.id, { source_port: "failed", transform: "" })
      ],
      select: { kind: "edge", id: o.id },
      refit: !1
    };
  }
  if (n.kind === "condition") {
    const r = i(), a = i(), s = i(), l = [
      Ei(o.id),
      bi({
        id: r,
        kind: "branch",
        title: "Condition",
        config: { predicate: n.predicate }
      }),
      _i({
        id: a,
        source_id: o.source_id,
        target_id: r,
        source_port: o.source_port
      }),
      _i({
        id: s,
        source_id: r,
        target_id: o.target_id,
        source_port: "true",
        target_port: o.target_port,
        transform: o.transform
      })
    ], c = e.positions[o.source_id], u = e.positions[o.target_id];
    return c && u && l.push(Ct(
      r,
      (c.x + u.x) / 2,
      (c.y + u.y) / 2
    )), {
      commands: l,
      select: { kind: "node", id: r },
      refit: !0
    };
  }
  return { commands: [], select: null, refit: !1 };
}
function _C(e, t, n) {
  const i = t.source, o = t.target;
  if (!i || !o) return null;
  const r = In(e, n), { parentOf: a } = dr(e, r), s = t.sourceHandle === "body" ? i : a[i];
  if (!s || a[o] === s || Gh(e, r[o], r) === s) return null;
  const l = r[i];
  return l ? { x: l.x, y: l.y + 120 } : null;
}
function hs(e, t, n) {
  const i = e.nodes[t.source], o = e.nodes[t.target], r = zu(t.sourceHandle) && i?.kind === "start" ? "out" : En(t.sourceHandle), a = zu(t.targetHandle) && (o?.kind === "finish" || o?.kind === "error") ? "in" : En(t.targetHandle), s = {
    source: t.source,
    target: t.target,
    sourceHandle: r,
    targetHandle: a
  };
  if (!Vh(s, Object.values(e.edges))) return null;
  const l = gt(), c = [_i({
    id: l,
    source_id: t.source,
    target_id: t.target,
    source_port: r,
    target_port: a
  })], u = _C(e, t, n);
  u && c.push(Ct(t.target, u.x, u.y));
  const d = e.nodes[t.source], h = e.nodes[t.target], p = Ns(e, { source_id: t.source, source_port: t.sourceHandle || void 0 });
  let v = Ji(h);
  const g = tg(p, h);
  g && h && (c.push(Wd(h.id, { config: { ...h.config || {}, output_schema: g } })), v = g);
  const m = yC(p, v, "output"), k = d ? Zi(d.kind, d.ref) : [], x = !!d && k.some((b) => b.id === "failed");
  let w = g ? "adopt-finish" : Is(h, v) ? "contract-unavailable" : "plain";
  return !g && w !== "contract-unavailable" && m.status === "auto" ? (c.push(ki(l, { transform: m.transform })), w = "auto") : !g && w !== "contract-unavailable" && m.status === "ambiguous" && (w = "ambiguous"), { edgeId: l, cmds: c, action: w, result: m, sourceId: t.source, targetId: t.target, sourceSchema: p, targetSchema: v, sourceFailureAvailable: x };
}
function kC(e, t, n, i, o) {
  const r = e.edges[t];
  if (!r) return null;
  const a = { ...e }, s = [...i, Ei(t)];
  Li(a, s);
  const l = a.nodes[n];
  if (!l || Cs(l.kind)) return null;
  const c = hs(a, {
    source: r.source_id,
    sourceHandle: r.source_port ?? null,
    target: n,
    targetHandle: null
  }, o);
  if (!c) return null;
  Li(a, c.cmds);
  const u = hs(a, {
    source: n,
    sourceHandle: tC(l) ?? null,
    target: r.target_id,
    targetHandle: r.target_port ?? null
  }, o);
  return u ? [...s, ...c.cmds, ...u.cmds] : null;
}
function EC(e) {
  const { engine: t, apply: n, select: i, layoutDir: o, viewingRun: r } = e, a = Y(null), s = Y(""), l = Y(null), c = Y(null), u = $s(/* @__PURE__ */ new Map()), d = Y(0);
  function h() {
    d.value++;
  }
  function p() {
    return { stroke: a.value === "error" ? "var(--wf-danger)" : a.value === "warn" ? "var(--wf-amber)" : a.value === "ok" ? "var(--p-success-500)" : "var(--wf-line-strong)", strokeWidth: 2, strokeDasharray: "4 3" };
  }
  function v(N) {
    if (!Vh(N, Object.values(t.doc.edges)))
      return a.value = "error", s.value = N.source && N.source === N.target ? "A step can’t connect to itself." : "These steps are already connected.", "error";
    const H = t.doc.nodes[N.target || ""], y = Ns(t.doc, { source_id: N.source || "", source_port: N.sourceHandle || void 0 }), E = Ji(H);
    if (Is(H, E))
      return a.value = "warn", s.value = "Input fields are still loading — connect to keep the route visible.", "warn";
    const _ = al(y, E);
    return _.status === "error" ? (a.value = "warn", s.value = "Needs a mapping — connect, then describe what flows here.", "warn") : (a.value = _.status, s.value = "", _.status);
  }
  function g(N) {
    return "id" in N ? !0 : r.value ? !1 : v(N) !== "error";
  }
  function m() {
    a.value = null, s.value = "", l.value = null;
  }
  function k(N) {
    if (m(), r.value) return;
    const H = hs(t.doc, N, o.value);
    H && (u.clear(), c.value = null, n(H.cmds), H.action === "auto" ? (u.set(H.edgeId, { id: H.edgeId, sourceId: H.sourceId, targetId: H.targetId, result: H.result }), c.value = null, h()) : H.action === "ambiguous" ? (c.value = {
      id: H.edgeId,
      sourceId: H.sourceId,
      targetId: H.targetId,
      sourceSchema: H.sourceSchema,
      targetSchema: H.targetSchema,
      sourceRoot: "output",
      sourceFailureAvailable: H.sourceFailureAvailable,
      unresolved: H.result.unresolved
    }, h()) : (H.action === "plain" || H.action === "contract-unavailable") && i("edge", H.edgeId));
  }
  function x() {
    c.value = null, h();
  }
  function w() {
    const N = !!c.value || u.size > 0;
    c.value = null, u.clear(), N && h();
  }
  function b(N) {
    const H = c.value;
    if (!H) return;
    const y = bC(t.doc, H, N);
    y && (y.commands.length && n(y.commands, y.refit), y.select && i(y.select.kind, y.select.id), c.value = null, h());
  }
  function C() {
    const N = c.value;
    N && (i("edge", N.id), c.value = null, h());
  }
  function I(N) {
    u.delete(N) && h();
  }
  function z(N) {
    i("edge", N), u.delete(N) && h();
  }
  function T(N) {
    for (const H of [...u.keys()])
      N.has(H) || u.delete(H);
    c.value && !N.has(c.value.id) && (c.value = null);
  }
  function O(N) {
    for (const H of N) {
      const y = String(H.id), E = c.value?.id === y ? "wf-edge--pending" : u.has(y) ? "wf-edge--auto" : "";
      if (!E) continue;
      const _ = typeof H.class == "string" ? H.class : "";
      H.class = _ ? `${_} ${E}` : E;
    }
  }
  function D() {
    m();
  }
  function B(N) {
    a.value && (l.value = { x: N.clientX, y: N.clientY });
  }
  return Ue(() => window.addEventListener("pointerup", m)), Qe(() => window.removeEventListener("pointerup", m)), {
    connectStatus: a,
    connectMessage: s,
    connectXY: l,
    connectLineStyle: p,
    isValidConnection: g,
    resetConnectHint: m,
    onConnect: k,
    onConnectEnd: D,
    onCanvasMouseMove: B,
    // intent-edge
    pendingEdge: c,
    autoMapped: u,
    intentRev: d,
    dismissPending: x,
    clearIntentOverlays: w,
    acceptPending: b,
    openPendingMapper: C,
    dismissAutoMapped: I,
    openAutoMapped: z,
    pruneIntent: T,
    decorateEdges: O
  };
}
const ul = 28, Kh = 8;
function xC(e, t = ul, n = Kh) {
  const i = (e % n + n) % n;
  return { dx: i * t, dy: i * t };
}
const Zh = 64;
function $C(e, t, n = Zh) {
  return Math.abs(e.x - t.x) < n && Math.abs(e.y - t.y) < n;
}
function SC(e, t, n = ul, i = Zh, o = 40) {
  let r = { x: e.x, y: e.y }, a = 0;
  for (; a < o && t.some((s) => $C(r, s, i)); )
    r = { x: r.x + n, y: r.y + n }, a++;
  return r;
}
function CC(e, t, n = 20) {
  return e.x < t.x + t.width + n && e.x + e.width + n > t.x && e.y < t.y + t.height + n && e.y + e.height + n > t.y;
}
function NC(e, t, n, i = ul, o = 20, r = 24) {
  const a = (s) => !n.some((l) => CC({ ...s, ...t }, l, o));
  if (a(e)) return { ...e };
  for (let s = 1; s <= r; s++) {
    const l = s * i, u = [
      { x: e.x + l, y: e.y },
      { x: e.x, y: e.y + l },
      { x: e.x - l, y: e.y },
      { x: e.x, y: e.y - l },
      { x: e.x + l, y: e.y + l },
      { x: e.x - l, y: e.y + l },
      { x: e.x + l, y: e.y - l },
      { x: e.x - l, y: e.y - l }
    ].find(a);
    if (u) return u;
  }
  return { x: e.x + r * i, y: e.y + r * i };
}
function IC(e) {
  return (e instanceof Element ? e.closest(".vue-flow__edge") : null)?.getAttribute("data-id") || null;
}
function AC(e) {
  const { engine: t, layoutDir: n, apply: i, select: o, catalog: r, getViewport: a, screenToFlowCoordinate: s } = e, l = Y(null);
  function c() {
    try {
      const b = a(), C = l.value?.getBoundingClientRect(), I = C ? C.width / 2 : 400, z = C ? C.height / 2 : 260;
      return { x: Math.round((I - b.x) / b.zoom), y: Math.round((z - b.y) / b.zoom) };
    } catch {
      return { x: 200, y: 160 };
    }
  }
  const u = Y(0);
  function d() {
    return Object.values(In(t.doc, n.value));
  }
  function h(b = In(t.doc, n.value)) {
    return Object.entries(b).flatMap(([C, I]) => {
      const z = t.doc.nodes[C];
      if (!z) return [];
      const T = pn(z);
      return [{ x: I.x, y: I.y, width: T.width, height: T.height }];
    });
  }
  function p() {
    const b = c(), { dx: C, dy: I } = xC(u.value);
    return u.value = (u.value + 1) % Kh, SC({ x: b.x + C, y: b.y + I }, d());
  }
  function v(b, C, I = {}) {
    const z = C ? (u.value = 0, C) : p(), T = gt(), O = [
      bi({
        id: T,
        kind: b.kind,
        title: b.title,
        ref: b.ref
      }),
      Ct(T, z.x, z.y)
    ], B = (I.edge ? kC(t.doc, I.edge, T, O, n.value) : null) ?? (I.bodyParent ? [...O, _i({ id: gt(), source_id: I.bodyParent, target_id: T, source_port: "body" })] : O);
    return i(B), o("node", T), T;
  }
  function g(b) {
    const C = b ? (u.value = 0, b) : p(), I = gt();
    i([Fl({ id: I, text: "" }), Ct(I, C.x, C.y)]), o("note", I);
  }
  function m(b) {
    const C = b ? (u.value = 0, b) : p(), I = gt();
    i([
      Fl({ id: I, text: "Frame", kind: "frame", color: "slate" }),
      Ct(I, C.x, C.y, 420, 280)
    ]), o("note", I);
  }
  Zt(wh, (b, C, I, z, T) => {
    t.recordLayoutEcho(b, C, I), i([Ct(b, C, I, z, T)]);
  });
  function x(b) {
    b.preventDefault();
    const C = b.dataTransfer?.getData("application/wf-item");
    if (!C) return;
    let I = { x: 200, y: 160 };
    try {
      I = s({ x: b.clientX, y: b.clientY });
    } catch {
    }
    if (C === "note:new") {
      g(I);
      return;
    }
    if (C === "frame:new") {
      m(I);
      return;
    }
    const z = r.value.find((N) => N.paletteId === C);
    if (!z) return;
    const T = In(t.doc, n.value), O = Gh(t.doc, I, T), D = pn({ kind: z.kind, title: z.title }), B = O ? I : NC(I, D, h(T));
    v(z, B, { edge: IC(b.target) ?? void 0, bodyParent: O || void 0 });
  }
  function w(b) {
    b.preventDefault(), b.dataTransfer && (b.dataTransfer.dropEffect = "copy");
  }
  return { canvasEl: l, placeItem: v, placeNote: g, placeFrame: m, onDrop: x, onDragOver: w };
}
const MC = /* @__PURE__ */ new Set(["INPUT", "TEXTAREA", "SELECT"]);
function Jh(e) {
  const t = e;
  if (!t) return !1;
  if (t.isContentEditable) return !0;
  const n = t.tagName;
  return typeof n == "string" && MC.has(n.toUpperCase());
}
function TC(e) {
  const t = !!(e.ctrlKey || e.metaKey);
  return t && (e.key === "k" || e.key === "K") ? "palette" : Jh(e.target) ? null : t && (e.key === "z" || e.key === "Z") ? e.shiftKey ? "redo" : "undo" : t && (e.key === "y" || e.key === "Y") ? "redo" : e.shiftKey && !t && (e.key === "1" || e.key === "!") ? "fit" : e.shiftKey && !t && (e.key === "2" || e.key === "@") ? "zoom-selection" : e.key === "Delete" || e.key === "Backspace" ? "delete" : e.key === "Escape" ? "escape" : null;
}
function OC(e) {
  const { deleteSelection: t, runHistory: n, paletteOpen: i, hasSelection: o, clearSelection: r, fit: a, zoomSelection: s } = e, l = Y(null);
  function c(p) {
    p.preventDefault(), p.stopPropagation();
  }
  function u(p) {
    return p.composedPath().some((v) => {
      const g = v;
      return typeof g.getAttribute == "function" && g.getAttribute("role") === "dialog";
    });
  }
  function d() {
    Ve(() => {
      l.value?.querySelector(".wf-palette-search input")?.focus();
    });
  }
  function h(p) {
    if (u(p)) return;
    if (Jh(p.target)) {
      p.key === "Escape" && (p.target.blur?.(), c(p));
      return;
    }
    const v = TC({ key: p.key, ctrlKey: p.ctrlKey, metaKey: p.metaKey, shiftKey: p.shiftKey, target: p.target });
    v === "delete" ? (c(p), t()) : v === "undo" ? (c(p), n("undo")) : v === "redo" ? (c(p), n("redo")) : v === "palette" ? (c(p), i.value = !0, d()) : v === "fit" ? a && (c(p), a()) : v === "zoom-selection" ? s && o.value && (c(p), s()) : v === "escape" && o.value && (c(p), r());
  }
  return { rootEl: l, onKeyDown: h, focusPaletteSearch: d };
}
function RC(e) {
  const { engine: t, workflowId: n, rev: i, runState: o, viewingRun: r, viewingExecution: a, viewingNodeHeaders: s, rebuild: l, clearSelection: c, error: u, panelOpen: d, historyOpen: h } = e, p = Y(null);
  let v = !1;
  function g() {
    p.value = null, r.value = null, a.value = null, s.value = [], o.value = Md(), c(), l();
  }
  async function m() {
    const te = p.value;
    if (!(!te || v)) {
      v = !0;
      try {
        const { run: re, nodes: le, errorRouted: we } = await xr(n, te);
        if (p.value !== te) return;
        const $e = wg(re.status);
        o.value = $r(t.doc, le, re.status, we), l(), !$e && re.status !== "completed" && (u.value = re.error || `Run ${re.status}.`);
      } catch (re) {
        u.value = qe(re, "Couldn’t refresh this run.");
      } finally {
        v = !1;
      }
    }
  }
  const k = [];
  try {
    const te = mi(`kickside.thread.${n}`, (le) => {
      gg(le, n) && m();
    });
    typeof te == "function" && k.push(te);
    const re = mi("@visibility", (le) => {
      le === !0 && m();
    });
    typeof re == "function" && k.push(re);
  } catch {
  }
  const x = Y(!1), w = Y([]), b = Y(!1), C = Y("");
  async function I() {
    b.value = !0, C.value = "";
    try {
      w.value = await Ad(n, 20);
    } catch (te) {
      C.value = qe(te, "Couldn’t load runs.");
    } finally {
      b.value = !1;
    }
  }
  function z() {
    x.value = !x.value, x.value && (O.value = !1, h.value = !1, I());
  }
  async function T(te) {
    x.value = !1, g(), r.value = te, d.value = !0;
    try {
      const { run: re, nodes: le, execution: we, errorRouted: $e } = await xr(n, te.run_id);
      if (r.value?.run_id !== te.run_id) return;
      r.value = re, a.value = we, s.value = le, o.value = $r(t.doc, le, re.status, $e), l();
    } catch (re) {
      u.value = qe(re, "Couldn’t load this run.");
    }
  }
  const O = Y(!1), D = Y(!1), B = Y({}), N = Y(0), H = Y(""), y = Y(!0), E = U(() => {
    i.value;
    const te = yg(t.doc);
    return te && t.doc.nodes[te] || null;
  }), _ = U(() => {
    const te = E.value;
    return te ? (te.config || {}).input_schema ?? te.input_schema : void 0;
  });
  function L(te) {
    if (!te || typeof te != "object") return !1;
    const re = te.properties;
    return !!re && typeof re == "object" && Object.keys(re).length > 0;
  }
  const F = U(() => L(_.value)), J = U(() => !D.value && y.value);
  function X(te) {
    r.value && g(), x.value = !1, h.value = !1, u.value = "", H.value = "", B.value = te, y.value = !0, N.value++, O.value = !0;
  }
  function oe() {
    if (o.value.active) {
      g();
      return;
    }
    X({});
  }
  function se() {
    O.value = !1;
  }
  async function W(te) {
    let re = {};
    try {
      const le = await xr(n, te.run_id);
      le.input && (re = le.input);
    } catch {
    }
    X(re);
  }
  function K(te) {
    B.value = te || {};
  }
  function G(te) {
    y.value = te;
  }
  async function ee() {
    const te = {};
    te.input = B.value || {}, H.value = "", D.value = !0;
    try {
      p.value = await bg(n, te), o.value = $r(t.doc, [], "running"), O.value = !1, l(), await m();
    } catch (re) {
      H.value = qe(re, "Couldn’t start the run.");
    } finally {
      D.value = !1;
    }
  }
  return Qe(() => {
    for (const te of k) te();
  }), {
    runId: p,
    runsOpen: x,
    runRows: w,
    runsLoading: b,
    runsError: C,
    simOpen: O,
    simBusy: D,
    simInput: B,
    simInputKey: N,
    simError: H,
    simInputValid: y,
    startInputSchema: _,
    startHasFields: F,
    canRunSimulate: J,
    stopRun: g,
    loadRuns: I,
    toggleRuns: z,
    viewRun: T,
    openSim: oe,
    closeSim: se,
    rerunSameInput: W,
    onSimInput: K,
    onSimValid: G,
    runSimulate: ee
  };
}
function DC(e) {
  const { rootEl: t, panelOpen: n, paletteOpen: i, hasSelection: o, viewingRun: r, reframe: a } = e, s = Y(!1), l = Y(!1), c = U(() => n.value && (o.value || !!r.value));
  let u = null, d = 0, h = !1;
  function p() {
    const x = ++d;
    Ve(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      x === d && a();
    })));
  }
  function v() {
    const x = !i.value;
    x && s.value && c.value && (n.value = !1), i.value = x;
  }
  function g() {
    s.value && (i.value = !1), n.value = !0;
  }
  function m() {
    n.value = !1;
  }
  async function k() {
    return !s.value || !i.value ? !1 : (h = !0, i.value = !1, await Ve(), await new Promise((x) => requestAnimationFrame(() => requestAnimationFrame(() => x()))), h = !1, !0);
  }
  return _e([s, c], ([x, w], b) => {
    x && w && i.value && (i.value = !1), b && b[1] !== w && p();
  }), _e(i, (x, w) => {
    x && s.value && c.value && (n.value = !1), x !== w && !h && p();
  }), Ue(() => {
    const x = t.value;
    if (!x || typeof ResizeObserver > "u") return;
    const w = (b) => {
      b <= 0 || (s.value = b <= 1180, l.value = b <= 640);
    };
    w(x.getBoundingClientRect().width), u = new ResizeObserver((b) => w(b[0]?.contentRect.width || 0)), u.observe(x);
  }), Qe(() => {
    u?.disconnect(), u = null;
  }), { compact: s, narrow: l, inspectorVisible: c, togglePalette: v, openInspector: g, closeInspector: m, prepareCanvasAction: k };
}
const Qh = 0.7;
function ep(e = 250, t = 0.2, n = 1) {
  const i = Number.isFinite(n) ? Math.max(1, n) : 1;
  return { padding: t, minZoom: Qh / i, maxZoom: 1 / i, duration: e };
}
function PC(e) {
  const t = Y(null), n = Y(null), i = Y(null), o = U(() => (e.revision.value, t.value && e.doc().nodes[t.value] || null)), r = U(() => (e.revision.value, n.value && e.doc().edges[n.value] || null)), a = U(() => (e.revision.value, i.value && e.doc().notes[i.value] || null)), s = U(() => !!(o.value || r.value || a.value));
  function l(C, I) {
    t.value = C === "node" ? I : null, n.value = C === "edge" ? I : null, i.value = C === "note" ? I : null, e.openInspector();
  }
  function c() {
    t.value = null, n.value = null, i.value = null;
  }
  function u(C) {
    if (C.node.type === "wfContainer") return;
    const I = C.node.type === "wfNote" || C.node.type === "wfFrame";
    if (e.readOnly()) {
      I || l("node", C.node.id);
      return;
    }
    l(I ? "note" : "node", C.node.id);
  }
  function d(C) {
    e.readOnly() || l("edge", C.edge.id);
  }
  function h(C) {
    o.value && e.apply([Wd(o.value.id, C)]);
  }
  function p(C) {
    r.value && e.apply([ki(r.value.id, C)]);
  }
  function v(C) {
    a.value && e.apply([sy(a.value.id, C)]);
  }
  function g(C) {
    return C ? C.kind === "start" || C.kind === "finish" || C.kind === "error" || C.pinned === !0 || !!C.boundary : !1;
  }
  function m() {
    const C = o.value;
    if (C) {
      if (g(C)) {
        e.reportError("Start, Finish, and Error steps are locked and can’t be deleted.");
        return;
      }
      e.confirmNodeRemoval(C, () => {
        e.readOnly() || !e.doc().nodes[C.id] || (t.value === C.id && c(), e.apply([ay(C.id)]));
      });
    }
  }
  function k() {
    const C = r.value;
    C && (c(), e.apply([Ei(C.id)]));
  }
  function x(C) {
    e.readOnly() || !e.doc().edges[C] || (n.value === C && c(), e.apply([Ei(C)]));
  }
  function w() {
    const C = a.value;
    C && (c(), e.apply([ly(C.id)]));
  }
  function b() {
    e.readOnly() || (r.value ? k() : a.value ? w() : o.value && m());
  }
  return {
    selectedNodeId: t,
    selectedEdgeId: n,
    selectedNoteId: i,
    selectedNode: o,
    selectedEdge: r,
    selectedNote: a,
    hasSelection: s,
    select: l,
    clearSelection: c,
    onNodeClick: u,
    onEdgeClick: d,
    onPaneClick: c,
    updateNode: h,
    updateEdge: p,
    updateNote: v,
    removeSelectedNode: m,
    removeSelectedEdge: k,
    removeEdge: x,
    removeSelectedNote: w,
    deleteSelection: b
  };
}
function LC() {
  const e = Y(!0), t = Y(!0), n = Y(!1), i = Y(!1), o = Y(!1), r = Y(null);
  return {
    panelOpen: e,
    paletteOpen: t,
    historyOpen: n,
    addTriggerOpen: i,
    shareOpen: o,
    shareHost: r
  };
}
function Fi(e) {
  return e === "combine";
}
function cl(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function VC(e) {
  return cl(e).mode === "first_wins" ? "first_wins" : "wait_all";
}
function BC(e, t) {
  return VC(t);
}
function zC(e) {
  return cl(e).output_mode === "array" ? "array" : "object";
}
function FC(e, t, n) {
  return { kind: "combine", config: { ...cl(e), mode: t, output_mode: n } };
}
function HC(e, t) {
  const n = e.nodes[t];
  if (!n || !Fi(n.kind)) return null;
  const i = Object.values(e.edges).filter((a) => a.target_id === t);
  if (i.length < 2) return null;
  let o = null;
  const r = /* @__PURE__ */ new Set();
  for (const a of i) {
    const s = e.nodes[a.source_id];
    if (!s || s.kind !== "branch") return null;
    const l = a.source_port;
    if (l !== "true" && l !== "false") return null;
    if (o === null) o = a.source_id;
    else if (o !== a.source_id) return null;
    r.add(l);
  }
  return o && r.has("true") && r.has("false") ? o : null;
}
function qC(e) {
  return `These are the True and False arms of “${e}” — only one ever runs, so wait-all would wait forever for the other. Use first-wins here.`;
}
function UC(e) {
  const {
    engine: t,
    revision: n,
    selectedNode: i,
    selectedEdge: o,
    runState: r,
    viewingRun: a,
    viewingNodeHeaders: s,
    error: l,
    loading: c,
    panelOpen: u,
    select: d
  } = e, h = U(() => {
    n.value;
    const _ = o.value;
    if (_)
      return Ha(_.source_port) ? ng : Dl(t.doc.nodes[_.source_id]);
  }), p = U(() => {
    n.value;
    const _ = o.value;
    return _ ? Ji(t.doc.nodes[_.target_id], h.value) : void 0;
  }), v = U(() => {
    n.value;
    const _ = o.value, L = _ ? t.doc.nodes[_.source_id] : null;
    return L ? Je(L.title, L.ref) : "";
  }), g = U(() => {
    n.value;
    const _ = o.value, L = _ ? t.doc.nodes[_.target_id] : null;
    return L ? Je(L.title, L.ref) : "";
  }), m = U(() => {
    n.value;
    const _ = i.value;
    if (!_) return;
    const L = Object.values(t.doc.edges).filter((F) => F.target_id === _.id);
    if (L.length === 1)
      return Dl(t.doc.nodes[L[0].source_id]);
  }), k = U(() => {
    n.value;
    const _ = i.value;
    if (!_) return null;
    const L = HC(t.doc, _.id);
    if (!L) return null;
    const F = t.doc.nodes[L];
    return Je(F?.title, F?.ref) || "a Condition";
  }), x = U(() => (n.value, i.value ? r.value.node[i.value.id] : void 0)), w = U(() => i.value && s.value.find((_) => _.def_node_id === i.value?.id) || null), b = U(() => {
    n.value;
    const _ = r.value.node;
    for (const L of Object.keys(t.doc.nodes))
      if (_[L] === "failed") return t.doc.nodes[L] || null;
    return null;
  }), C = U(() => {
    const _ = b.value;
    return _ ? Je(_.title, _.ref) || "A step" : "";
  }), I = U(() => Ll(a.value?.error)), z = U(() => I.value.generic ? "" : I.value.message), T = U(() => Ll(l.value));
  function O() {
    const _ = b.value;
    _ && (d("node", _.id), u.value = !0);
  }
  const D = U(() => (n.value, { nodes: Object.keys(t.doc.nodes).length, edges: Object.keys(t.doc.edges).length }));
  function B(_, L) {
    return `${_} ${L}${_ === 1 ? "" : "s"}`;
  }
  const N = U(() => `${B(D.value.nodes, "step")} · ${B(D.value.edges, "connection")}`), H = U(() => (n.value, t.doc.canUndo)), y = U(() => (n.value, t.doc.canRedo)), E = U(() => (n.value, !c.value && D.value.nodes === 0 && Object.keys(t.doc.notes).length === 0));
  return {
    selectedEdgeUpstream: h,
    selectedEdgeDownstream: p,
    selectedEdgeSourceTitle: v,
    selectedEdgeTargetTitle: g,
    selectedNodeUpstream: m,
    selectedCombineConflict: k,
    selectedRunStatus: x,
    selectedRunHeader: w,
    failedNode: b,
    failedNodeTitle: C,
    failedReason: z,
    runErrorView: I,
    errorView: T,
    openFailedDetails: O,
    counts: D,
    countLabel: N,
    canUndo: H,
    canRedo: y,
    isEmpty: E
  };
}
const WC = "Set a value or make it an input.", Vc = {
  node_config_missing: `This step is missing required configuration. ${WC}`,
  branch_predicate_missing: "Set the condition."
};
function YC(e) {
  if (e.code === "branch_predicate_missing") return Vc.branch_predicate_missing;
  const t = (e.message || "").trim();
  return t ? t.replace(/^node\s+\S+\s+/i, "").trim() || t : Vc[e.code] || "This step isn’t ready to publish yet.";
}
function GC(e) {
  return e.find((t) => !!t.nodeId)?.nodeId || "";
}
function jC(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    if (!n.nodeId) continue;
    const i = t.get(n.nodeId);
    i ? i.push(n) : t.set(n.nodeId, [n]);
  }
  return t;
}
function XC(e) {
  const { engine: t, workflowId: n, revision: i, error: o, notice: r, historyOpen: a, publishIssues: s, rebuild: l, select: c } = e, u = Y(!1), d = Y(0), h = Y(!1);
  async function p() {
    try {
      const k = await Vd(n);
      d.value = k.reduce((x, w) => Math.max(x, w.version), 0);
    } catch {
    }
  }
  async function v() {
    if (!(!d.value || h.value)) {
      h.value = !0, o.value = "";
      try {
        const k = await Hd(n);
        Ls(Yd(k.title), k);
      } catch (k) {
        o.value = qe(k, "Couldn’t export this Workflow.");
      } finally {
        h.value = !1;
      }
    }
  }
  const g = U(() => (i.value, t.doc.definitionEditSeq));
  async function m() {
    a.value = !1, u.value = !0, o.value = "", r.value = "";
    try {
      const k = await Ag(n);
      s.value.size && (s.value = /* @__PURE__ */ new Map(), l()), k.version && (d.value = Math.max(d.value, k.version)), r.value = k.version ? `Published version ${k.version}. You can now use it in an Automation, another Workflow, or an agent.` : "Published. You can now use it in an Automation, another Workflow, or an agent.", k.version && e.published?.(k.version);
    } catch (k) {
      o.value = qe(k, "Couldn’t publish this Workflow.");
      const x = /* @__PURE__ */ new Map();
      if (k instanceof Mg) {
        for (const [b, C] of jC(k.issues)) x.set(b, YC(C[0]));
        const w = GC(k.issues);
        w && t.doc.nodes[w] && c("node", w);
      }
      s.value = x, l();
    } finally {
      u.value = !1;
    }
  }
  return {
    publishBusy: u,
    publishedVersion: d,
    exportBusy: h,
    loadPublishedState: p,
    exportDefinition: v,
    definitionEditSeq: g,
    doPublish: m
  };
}
const KC = "kickside-automation-manager", ZC = "Triggers", JC = "Automations that run this Workflow. Add one, or pause and edit the ones already here.", ps = "Publish this Workflow before adding a trigger";
function tp(e) {
  return Number.isFinite(e) && e > 0;
}
function QC(e, t) {
  return {
    tag: KC,
    attrs: {
      "component-id": e,
      mode: "component",
      input: JSON.stringify({ sink_port: "kickside.workflows:run_sink", sink_config: { flow_ref: { kind: "flow", id: e, version: t } } })
    }
  };
}
function eN(e) {
  const {
    workflowId: t,
    shareOpen: n,
    shareHost: i,
    historyOpen: o,
    addTriggerOpen: r,
    runsOpen: a,
    simOpen: s,
    publishedVersion: l,
    error: c,
    clearIntentOverlays: u,
    rememberOverlayInvoker: d,
    restoreOverlayFocusFallback: h,
    openRunDialog: p,
    closeSim: v,
    toggleRunsPanel: g
  } = e;
  async function m(D = null) {
    u(), d(D), n.value = !0, await Ve(), i.value && await Gd(i.value, t, "Workflow", k);
  }
  function k() {
    n.value = !1, h();
  }
  function x(D = null) {
    u(), o.value || d(D), o.value = !o.value, o.value && (a.value = !1, s.value = !1);
  }
  function w() {
    o.value = !1, h();
  }
  function b(D = null) {
    if (!tp(l.value)) {
      c.value = `${ps}.`;
      return;
    }
    u(), d(D), r.value = !0, o.value = !1, a.value = !1, s.value = !1;
  }
  function C() {
    r.value = !1, h();
  }
  function I(D = null) {
    u(), d(D), p();
  }
  function z() {
    v(), h();
  }
  function T(D = null) {
    u(), a.value || d(D), g();
  }
  function O() {
    a.value = !1, h();
  }
  return {
    openShare: m,
    closeShare: k,
    toggleHistory: x,
    closeHistory: w,
    openAddTrigger: b,
    closeAddTrigger: C,
    openSim: I,
    closeRunDialog: z,
    toggleRuns: T,
    closeRuns: O
  };
}
function tN(e) {
  const { engine: t, layoutDir: n, viewingRun: i, canvasEl: o, apply: r, prepareCanvasAction: a, fitView: s, canvasFitOptions: l } = e;
  function c(p) {
    const v = p.nodes?.length ? p.nodes : [p.node], g = In(t.doc, n.value), { parentOf: m, containers: k } = dr(t.doc, g), x = [];
    for (const w of v) {
      if (!w) continue;
      let { x: b, y: C } = w.position;
      const I = m[String(w.id)];
      if (I) {
        const z = k.find((T) => T.id === I);
        if (z) {
          const T = iC(t.doc, I, z.members, g, String(w.id)), O = t.doc.nodes[String(w.id)];
          ({ x: b, y: C } = rC(b, C, T, O ? pn(O) : void 0));
        }
      }
      t.recordLayoutEcho(String(w.id), b, C), x.push(Ct(String(w.id), b, C));
    }
    r(x);
  }
  async function u(p = t.doc.direction) {
    if (i.value) return;
    await a();
    const v = o.value?.getBoundingClientRect(), g = jh(t.doc, p, v ? {
      width: v.width,
      height: v.height,
      minZoom: Qh
    } : void 0), m = Object.entries(g).map(([k, x]) => Ct(k, x.x, x.y));
    p !== t.doc.direction && m.unshift(uy(p)), m.length && await r(m, !0);
  }
  function d() {
    u(t.doc.direction === "TB" ? "LR" : "TB");
  }
  async function h() {
    await a();
    try {
      s(l());
    } catch {
    }
  }
  return { onNodeDragStop: c, runAutoLayout: u, toggleDir: d, fit: h };
}
function nN(e) {
  return Object.values(e.edges).map((t) => {
    const n = e.nodes[t.source_id], i = e.nodes[t.target_id], o = n ? Je(n.title, n.ref) : "Missing source step", r = i ? Je(i.title, i.ref) : "Missing destination step", a = t.source_port ? t.source_port === Nt.id ? Nt.label : (n ? Dn(n).find((s) => s.id === t.source_port)?.label : void 0) || t.source_port : "Output";
    return {
      id: t.id,
      label: `${o} — ${a} to ${r}`
    };
  });
}
function oN(e) {
  const { engine: t, revision: n, layoutDir: i, clearIntentOverlays: o, rememberOverlayInvoker: r, restoreOverlayFocusFallback: a, onConnect: s } = e, l = Y(!1), c = U(() => {
    n.value;
    const m = [];
    for (const k of Object.values(t.doc.nodes)) {
      if (k.kind === "finish" || k.kind === "error") continue;
      const x = Je(k.title, k.ref), w = Dn(k), b = w.length > 1 || (w[0]?.id ?? "") !== "";
      for (const C of w) {
        const I = b ? C.id : i.value === "LR" ? "out-right" : "out-bottom";
        m.push({
          key: JSON.stringify([k.id, I]),
          nodeId: k.id,
          handle: I,
          label: `${x} — ${C.label || "Output"}`
        });
      }
      ll(k) && m.push({
        key: JSON.stringify([k.id, Nt.id]),
        nodeId: k.id,
        handle: Nt.id,
        label: `${x} — ${Nt.label}`
      });
    }
    return m;
  }), u = U(() => (n.value, Object.values(t.doc.nodes).filter((m) => m.kind !== "start").map((m) => ({ nodeId: m.id, label: Je(m.title, m.ref) })))), d = U(() => (n.value, nN(t.doc))), h = U(() => i.value === "LR" ? "in-left" : "in-top");
  function p(m = null) {
    o(), r(m), l.value = !0;
  }
  function v() {
    l.value = !1, a();
  }
  function g(m) {
    s(m);
  }
  return {
    connectionsOpen: l,
    connectionSources: c,
    connectionTargets: u,
    connectionEdges: d,
    connectionTargetHandle: h,
    openConnections: p,
    closeConnections: v,
    createConnection: g
  };
}
function iN(e) {
  const {
    viewingRun: t,
    paletteOpen: n,
    screenToFlowCoordinate: i,
    placeItem: o,
    placeNote: r,
    placeFrame: a,
    focusPaletteSearch: s,
    onConnect: l,
    settleConnectHint: c
  } = e, u = Y(null), d = Y(null);
  let h = null, p = !1;
  function v(B) {
    t.value || (B.preventDefault(), B.stopPropagation(), u.value = { x: B.clientX, y: B.clientY });
  }
  function g(B) {
    v(B);
  }
  function m(B) {
    B.event instanceof MouseEvent && (B.node.type === "wfFrame" || B.node.type === "wfNote") && v(B.event);
  }
  function k() {
    u.value = null;
  }
  function x() {
    const B = u.value;
    if (!B) return { x: 0, y: 0 };
    const N = i({ x: B.x, y: B.y });
    return { x: Math.round(N.x), y: Math.round(N.y) };
  }
  function w() {
    k(), n.value = !0, s();
  }
  function b() {
    const B = x();
    k(), r(B);
  }
  function C() {
    const B = x();
    k(), a(B);
  }
  function I(B) {
    p = !1, h = B?.nodeId && B?.handleType === "source" ? { node: B.nodeId, handle: B.handleId ?? void 0 } : null;
  }
  function z(B) {
    p = !0, l(B);
  }
  function T(B) {
    c();
    const N = h;
    if (h = null, p || !N || t.value || !(B instanceof MouseEvent)) return;
    const H = B.target;
    !H || !H.classList.contains("vue-flow__pane") || (d.value = { x: B.clientX, y: B.clientY, source: N.node, sourceHandle: N.handle });
  }
  function O() {
    d.value = null;
  }
  function D(B) {
    const N = d.value;
    if (!N) return;
    O();
    const H = i({ x: N.x, y: N.y }), y = o(B, { x: Math.round(H.x), y: Math.round(H.y) });
    l({ source: N.source, sourceHandle: N.sourceHandle ?? null, target: y, targetHandle: null });
  }
  return {
    paneMenu: u,
    openPaneMenu: v,
    onPaneContextMenu: g,
    onNodeContextMenu: m,
    closePaneMenu: k,
    menuAddStep: w,
    menuAddNote: b,
    menuAddFrame: C,
    dropPicker: d,
    onConnectStart: I,
    onConnect: z,
    onConnectEnd: T,
    closeDropPicker: O,
    dropPickerPick: D
  };
}
function Bc(e, t, n, i, o = 12, r = 14) {
  const a = t.left + n / 2 + o, s = t.right - n / 2 - o, l = a <= s ? Math.min(Math.max(e.left, a), s) : (t.left + t.right) / 2, c = t.top + i + r + o, u = t.bottom - o, d = c <= u ? Math.min(Math.max(e.top, c), u) : Math.max(t.top + o, u);
  return { left: l, top: d };
}
function rN(e, t, n, i) {
  return {
    left: e.left - t / 2,
    right: e.left + t / 2,
    top: e.top - i - n,
    bottom: e.top - i
  };
}
function aN(e, t) {
  const n = Math.max(0, Math.min(e.right, t.right) - Math.max(e.left, t.left)), i = Math.max(0, Math.min(e.bottom, t.bottom) - Math.max(e.top, t.top));
  return n * i;
}
function sN(e, t, n, i, o, r = 12, a = 14) {
  const s = [e];
  for (const u of o)
    s.push(
      { left: e.left, top: u.top - r },
      { left: e.left, top: u.bottom + i + a + r },
      { left: u.left - n / 2 - r, top: e.top },
      { left: u.right + n / 2 + r, top: e.top }
    );
  let l = Bc(s[0], t, n, i, r, a), c = Number.POSITIVE_INFINITY;
  for (const u of s) {
    const d = Bc(u, t, n, i, r, a), h = rN(d, n, i, a), p = o.reduce((m, k) => m + aN(h, k), 0), v = (d.left - e.left) ** 2 + (d.top - e.top) ** 2, g = p * 1e6 + v;
    g < c && (l = d, c = g);
  }
  return l;
}
function lN(e, t, n) {
  return {
    left: Math.min(Math.max(e.left + 14, 8), Math.max(8, t - 190)),
    top: Math.min(Math.max(e.top + 14, 8), Math.max(8, n - 44))
  };
}
function uN(e) {
  const {
    engine: t,
    flowNodes: n,
    canvasEl: i,
    findNode: o,
    getViewport: r,
    revision: a,
    viewportRevision: s,
    intentRevision: l,
    pendingEdge: c,
    autoMapped: u,
    connectXY: d,
    rebuild: h
  } = e, p = Y(null), v = $s(/* @__PURE__ */ new Map()), g = Y(0);
  _e(l, () => {
    for (const O of [...v.keys()]) u.has(O) || v.delete(O);
    c.value || (p.value = null), h();
  }), _e(() => c.value?.id, () => {
    p.value = null;
  });
  function m(O, D) {
    return !!O && Math.abs(O.width - D.width) < 0.5 && Math.abs(O.height - D.height) < 0.5;
  }
  function k(O) {
    m(p.value, O) || (p.value = O, g.value++);
  }
  function x(O, D) {
    m(v.get(O), D) || (v.set(O, D), g.value++);
  }
  function w(O) {
    const D = o(O);
    if (!D) return null;
    const B = D.computedPosition || D.position, N = D.dimensions || { width: 180, height: 64 };
    return B ? { x: B.x + (N.width || 180) / 2, y: B.y + (N.height || 64) / 2 } : null;
  }
  function b(O) {
    const D = r();
    return n.value.flatMap((B) => {
      const N = o(B.id);
      if (!N) return [];
      const H = N.computedPosition || N.position, y = N.dimensions || { width: 180, height: 64 };
      if (!H) return [];
      const E = O.left + D.x + H.x * D.zoom, _ = O.top + D.y + H.y * D.zoom;
      return [{
        left: E,
        top: _,
        right: E + (y.width || 180) * D.zoom,
        bottom: _ + (y.height || 64) * D.zoom
      }];
    });
  }
  function C(O, D, B) {
    const N = w(O), H = w(D);
    if (!N || !H) return null;
    const y = i.value?.getBoundingClientRect(), E = r(), _ = (N.x + H.x) / 2, L = (N.y + H.y) / 2, F = { left: (y?.left || 0) + E.x + _ * E.zoom, top: (y?.top || 0) + E.y + L * E.zoom };
    return y ? {
      ...sN(F, y, B.width, B.height, b(y)),
      maxHeight: Math.max(80, y.height - 24)
    } : { ...F, maxHeight: Math.max(80, window.innerHeight - 24) };
  }
  const I = U(() => {
    a.value, s.value, l.value, g.value;
    const O = c.value;
    return O ? C(O.sourceId, O.targetId, p.value || { width: 300, height: 1 }) : null;
  }), z = U(() => {
    a.value, s.value, l.value, g.value;
    const O = [];
    for (const D of u.values()) {
      if (!t.doc.edges[D.id]) continue;
      const B = v.get(D.id), N = C(D.sourceId, D.targetId, B || { width: 300, height: 1 });
      N && O.push({ id: D.id, entry: D, left: N.left, top: N.top, maxHeight: N.maxHeight, placed: !!B });
    }
    return O;
  }), T = U(() => d.value ? lN(
    { left: d.value.x, top: d.value.y },
    window.innerWidth,
    window.innerHeight
  ) : null);
  return {
    pendingOverlaySize: p,
    autoOverlaySizes: v,
    pendingAnchor: I,
    autoMapAnchored: z,
    connectHintPosition: T,
    measurePending: k,
    measureAuto: x
  };
}
function cN(e) {
  return Array.isArray(e) ? e : [];
}
function Ke(e) {
  if (e == null) return "";
  if (typeof e == "string" || typeof e == "number" || typeof e == "boolean") return String(e);
  if (e && typeof e == "object" && !Array.isArray(e)) {
    const t = e;
    return Ke(t.message ?? t.error ?? t.code);
  }
  return "";
}
async function dN(e, t) {
  try {
    const n = [];
    let i = 0;
    do {
      const o = e.includes("?") ? "&" : "?", a = (await mn.get(`${e}${o}limit=100&offset=${i}`)).data;
      if (a && a.success === !1) return { rows: [], error: Ke(a.error) || `${e} failed` };
      n.push(...cN(a?.[t]));
      const s = a?.next_offset;
      if (s != null && (typeof s != "number" || !Number.isSafeInteger(s) || s <= i)) return { rows: [], error: `${e} returns an invalid offset` };
      i = s ?? void 0;
    } while (i !== void 0);
    return { rows: n };
  } catch (n) {
    return { rows: [], error: n instanceof Error ? n.message : `couldn’t load ${e}` };
  }
}
function fN(e) {
  return {
    id: Ke(e.id),
    label: Ke(e.label) || Ke(e.id),
    category: e.category ? Ke(e.category) : void 0,
    icon: e.icon ? Ke(e.icon) : void 0,
    hue: e.hue ? Ke(e.hue) : void 0,
    blurb: Ke(e.blurb),
    waits: e.waits === !0,
    ports: Array.isArray(e.ports) ? e.ports.map((t) => ({
      id: Ke(t.id),
      label: Ke(t.label) || rl(Ke(t.id)) || "Output",
      condition: t.condition != null ? Ke(t.condition) : void 0,
      direction: t.direction != null ? Ke(t.direction) : void 0,
      schema: t.schema
    })) : void 0,
    input_schema: e.input_schema,
    config_schema: e.config_schema,
    config_wc: e.config_wc ? Ke(e.config_wc) : void 0,
    output_schema: e.output_schema,
    error_schema: e.error_schema,
    source_kind: Ke(e.source_kind) === "tool" ? "tool" : "block",
    tool: e.tool === !0 || Ke(e.source_kind) === "tool",
    public: e.public === !0,
    execution: e.execution
  };
}
function hN(e) {
  return {
    paletteId: `block:${e.id}`,
    kind: "block",
    category: e.category || "Blocks",
    title: e.label,
    subtitle: e.blurb || "",
    icon: e.icon || "tabler:puzzle",
    ref: e.id,
    config_schema: e.config_schema,
    config_wc: e.config_wc,
    input_schema: e.input_schema,
    output_schema: e.output_schema,
    error_schema: e.error_schema,
    source_kind: e.source_kind,
    tool: e.tool
  };
}
const pN = [
  { paletteId: "logic:branch", kind: "branch", category: "Logic", title: Ze.branch.label, subtitle: "Choose a path from a condition", icon: Ze.branch.icon },
  { paletteId: "logic:combine", kind: "combine", category: "Logic", title: Ze.combine.label, subtitle: "Bring several paths back into one", icon: Ze.combine.icon },
  { paletteId: "logic:for-each", kind: "for_each", category: "Logic", title: Ze.for_each.label, subtitle: "Run the same steps once per array item", icon: Ze.for_each.icon },
  { paletteId: "logic:cycle", kind: "cycle", category: "Logic", title: Ze.cycle.label, subtitle: "Repeat while a condition holds", icon: Ze.cycle.icon },
  {
    paletteId: "flow:published",
    kind: "flow",
    category: "Workflows",
    title: Ze.flow.label,
    subtitle: "Compose an exact published Workflow",
    icon: Ze.flow.icon
  }
], vN = [
  { paletteId: "boundary:start", kind: "start", category: "Structure", title: Ze.start.label, subtitle: "Declares the run input", icon: Ze.start.icon },
  { paletteId: "boundary:finish", kind: "finish", category: "Structure", title: Ze.finish.label, subtitle: "Declares the successful output", icon: Ze.finish.icon },
  { paletteId: "boundary:error", kind: "error", category: "Structure", title: Ze.error.label, subtitle: "Declares the failed output", icon: Ze.error.icon }
], mN = 12;
function gN(e) {
  const n = (e || "").split(":")[0].split(".").filter(Boolean), i = n.length >= 2 ? n[1] : n[0];
  return i ? rl(i) : "Other";
}
function yN(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const i = gN(n.ref);
    t.has(i) || t.set(i, []), t.get(i).push(n);
  }
  return [...t.entries()].sort((n, i) => n[0].localeCompare(i[0])).map(([n, i]) => ({ module: n, items: [...i].sort((o, r) => o.title.localeCompare(r.title)) }));
}
const wN = "Notes";
function bN(e, t, n) {
  const i = t.trim().toLowerCase(), o = /* @__PURE__ */ new Map(), r = [...n];
  for (const a of n) o.set(a, []);
  for (const a of e)
    i && !`${a.title} ${a.subtitle} ${a.ref || ""} ${a.kind} ${a.category}`.toLowerCase().includes(i) || (o.has(a.category) || (o.set(a.category, []), r.push(a.category)), o.get(a.category).push(a));
  return r.filter((a) => a === wN || (o.get(a)?.length ?? 0) > 0).map((a) => ({ cat: a, items: o.get(a) || [] }));
}
async function _N() {
  const e = await dN("/api/v1/workflows/blocks?fields=blurb,input_schema,config_schema,config_wc,output_schema,error_schema,ports,execution", "blocks"), t = e.rows.map(fN).filter((i) => i.id && i.public === !0);
  return og(t), { items: [
    ...vN,
    ...t.map(hN),
    ...pN
  ], errors: e.error ? [e.error] : [] };
}
function kN(e) {
  const { workflowId: t, engine: n, catalog: i, catalogErrors: o, catalogLoading: r, load: a, loadPublishedState: s, rebuild: l } = e;
  async function c() {
    try {
      const d = await _N();
      i.value = d.items, o.value = d.errors;
    } catch (d) {
      i.value = [], o.value = [qe(d, "Couldn’t load Workflow steps.")];
    } finally {
      r.value = !1;
    }
    await a(!0), s();
  }
  kd(c);
  let u = [];
  Ue(() => {
    try {
      u.push(
        mi(`workflow.${t}`, (d) => {
          const h = d && typeof d == "object" ? d : {}, p = h.data && typeof h.data == "object" ? h.data : h;
          if (p.workflow_id && String(p.workflow_id) !== t) return;
          const v = Array.isArray(p.events) ? p.events : [];
          if (!v.length) return;
          const g = n.ingest(v);
          if (g.needsRefetch) {
            a();
            return;
          }
          g.changed && l();
        })
      );
    } catch {
    }
  }), Qe(() => {
    for (const d of u)
      try {
        d();
      } catch {
      }
    u = [];
  });
}
var Lt = /* @__PURE__ */ ((e) => (e.Lines = "lines", e.Dots = "dots", e))(Lt || {});
const np = function({ dimensions: e, size: t, color: n }) {
  return Pe("path", {
    stroke: n,
    "stroke-width": t,
    d: `M${e[0] / 2} 0 V${e[1]} M0 ${e[1] / 2} H${e[0]}`
  });
}, op = function({ radius: e, color: t }) {
  return Pe("circle", { cx: e, cy: e, r: e, fill: t });
};
Lt.Lines + "", Lt.Dots + "";
const EN = {
  [Lt.Dots]: "#81818a",
  [Lt.Lines]: "#eee"
}, xN = ["id", "x", "y", "width", "height", "patternTransform"], $N = {
  key: 2,
  height: "100",
  width: "100"
}, SN = ["fill"], CN = ["x", "y", "fill"], NN = {
  name: "Background",
  compatConfig: { MODE: 3 }
}, ip = /* @__PURE__ */ ye({
  ...NN,
  props: {
    id: {},
    variant: { default: () => Lt.Dots },
    gap: { default: 20 },
    size: { default: 1 },
    lineWidth: { default: 1 },
    patternColor: {},
    color: {},
    bgColor: {},
    height: { default: 100 },
    width: { default: 100 },
    x: { default: 0 },
    y: { default: 0 },
    offset: { default: 0 }
  },
  setup(e) {
    const { id: t, viewport: n } = De(), i = U(() => {
      const a = n.value.zoom, [s, l] = Array.isArray(e.gap) ? e.gap : [e.gap, e.gap], c = [s * a || 1, l * a || 1], u = e.size * a, [d, h] = Array.isArray(e.offset) ? e.offset : [e.offset, e.offset], p = [d * a || 1 + c[0] / 2, h * a || 1 + c[1] / 2];
      return {
        scaledGap: c,
        offset: p,
        size: u
      };
    }), o = Ne(() => `pattern-${t}${e.id ? `-${e.id}` : ""}`), r = Ne(() => e.color || e.patternColor || EN[e.variant || Lt.Dots]);
    return (a, s) => (S(), R("svg", {
      class: "vue-flow__background vue-flow__container",
      style: ze({
        height: `${a.height > 100 ? 100 : a.height}%`,
        width: `${a.width > 100 ? 100 : a.width}%`
      })
    }, [
      Be(a.$slots, "pattern-container", { id: o.value }, () => [
        $("pattern", {
          id: o.value,
          x: f(n).x % i.value.scaledGap[0],
          y: f(n).y % i.value.scaledGap[1],
          width: i.value.scaledGap[0],
          height: i.value.scaledGap[1],
          patternTransform: `translate(-${i.value.offset[0]},-${i.value.offset[1]})`,
          patternUnits: "userSpaceOnUse"
        }, [
          Be(a.$slots, "pattern", {}, () => [
            a.variant === f(Lt).Lines ? (S(), ae(f(np), {
              key: 0,
              size: a.lineWidth,
              color: r.value,
              dimensions: i.value.scaledGap
            }, null, 8, ["size", "color", "dimensions"])) : a.variant === f(Lt).Dots ? (S(), ae(f(op), {
              key: 1,
              color: r.value,
              radius: i.value.size / 2
            }, null, 8, ["color", "radius"])) : Z("", !0),
            a.bgColor ? (S(), R("svg", $N, [
              $("rect", {
                width: "100%",
                height: "100%",
                fill: a.bgColor
              }, null, 8, SN)
            ])) : Z("", !0)
          ])
        ], 8, xN)
      ]),
      $("rect", {
        x: a.x,
        y: a.y,
        width: "100%",
        height: "100%",
        fill: `url(#${o.value})`
      }, null, 8, CN),
      Be(a.$slots, "default", { id: o.value })
    ], 4));
  }
}), IN = {
  name: "ControlButton",
  compatConfig: { MODE: 3 }
}, AN = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [i, o] of t)
    n[i] = o;
  return n;
}, MN = {
  type: "button",
  class: "vue-flow__controls-button"
};
function TN(e, t, n, i, o, r) {
  return S(), R("button", MN, [
    Be(e.$slots, "default")
  ]);
}
const Zo = /* @__PURE__ */ AN(IN, [["render", TN]]), ON = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32"
}, RN = /* @__PURE__ */ $("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" }, null, -1), DN = [
  RN
];
function PN(e, t) {
  return S(), R("svg", ON, DN);
}
const LN = { render: PN }, VN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 5"
}, BN = /* @__PURE__ */ $("path", { d: "M0 0h32v4.2H0z" }, null, -1), zN = [
  BN
];
function FN(e, t) {
  return S(), R("svg", VN, zN);
}
const HN = { render: FN }, qN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 30"
}, UN = /* @__PURE__ */ $("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0 0 27.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94a.919.919 0 0 1-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" }, null, -1), WN = [
  UN
];
function YN(e, t) {
  return S(), R("svg", qN, WN);
}
const GN = { render: YN }, jN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 25 32"
}, XN = /* @__PURE__ */ $("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 0 0 0 13.714v15.238A3.056 3.056 0 0 0 3.048 32h18.285a3.056 3.056 0 0 0 3.048-3.048V13.714a3.056 3.056 0 0 0-3.048-3.047zM12.19 24.533a3.056 3.056 0 0 1-3.047-3.047 3.056 3.056 0 0 1 3.047-3.048 3.056 3.056 0 0 1 3.048 3.048 3.056 3.056 0 0 1-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" }, null, -1), KN = [
  XN
];
function ZN(e, t) {
  return S(), R("svg", jN, KN);
}
const JN = { render: ZN }, QN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 25 32"
}, e2 = /* @__PURE__ */ $("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 0 0 0 13.714v15.238A3.056 3.056 0 0 0 3.048 32h18.285a3.056 3.056 0 0 0 3.048-3.048V13.714a3.056 3.056 0 0 0-3.048-3.047zM12.19 24.533a3.056 3.056 0 0 1-3.047-3.047 3.056 3.056 0 0 1 3.047-3.048 3.056 3.056 0 0 1 3.048 3.048 3.056 3.056 0 0 1-3.048 3.047z" }, null, -1), t2 = [
  e2
];
function n2(e, t) {
  return S(), R("svg", QN, t2);
}
const o2 = { render: n2 }, i2 = {
  name: "Controls",
  compatConfig: { MODE: 3 }
}, r2 = /* @__PURE__ */ ye({
  ...i2,
  props: {
    showZoom: { type: Boolean, default: !0 },
    showFitView: { type: Boolean, default: !0 },
    showInteractive: { type: Boolean, default: !0 },
    fitViewParams: {},
    position: { default: () => $f.BottomLeft }
  },
  emits: ["zoomIn", "zoomOut", "fitView", "interactionChange"],
  setup(e, { emit: t }) {
    const {
      nodesDraggable: n,
      nodesConnectable: i,
      elementsSelectable: o,
      setInteractive: r,
      zoomIn: a,
      zoomOut: s,
      fitView: l,
      viewport: c,
      minZoom: u,
      maxZoom: d
    } = De(), h = Ne(() => n.value || i.value || o.value), p = Ne(() => c.value.zoom <= u.value), v = Ne(() => c.value.zoom >= d.value);
    function g() {
      a(), t("zoomIn");
    }
    function m() {
      s(), t("zoomOut");
    }
    function k() {
      l(e.fitViewParams), t("fitView");
    }
    function x() {
      r(!h.value), t("interactionChange", !h.value);
    }
    return (w, b) => (S(), ae(f(eh), {
      class: "vue-flow__controls",
      position: w.position
    }, {
      default: ne(() => [
        Be(w.$slots, "top"),
        w.showZoom ? (S(), R(ue, { key: 0 }, [
          Be(w.$slots, "control-zoom-in", {}, () => [
            V(Zo, {
              class: "vue-flow__controls-zoomin",
              disabled: v.value,
              onClick: g
            }, {
              default: ne(() => [
                Be(w.$slots, "icon-zoom-in", {}, () => [
                  (S(), ae(Xt(f(LN))))
                ])
              ]),
              _: 3
            }, 8, ["disabled"])
          ]),
          Be(w.$slots, "control-zoom-out", {}, () => [
            V(Zo, {
              class: "vue-flow__controls-zoomout",
              disabled: p.value,
              onClick: m
            }, {
              default: ne(() => [
                Be(w.$slots, "icon-zoom-out", {}, () => [
                  (S(), ae(Xt(f(HN))))
                ])
              ]),
              _: 3
            }, 8, ["disabled"])
          ])
        ], 64)) : Z("", !0),
        w.showFitView ? Be(w.$slots, "control-fit-view", { key: 1 }, () => [
          V(Zo, {
            class: "vue-flow__controls-fitview",
            onClick: k
          }, {
            default: ne(() => [
              Be(w.$slots, "icon-fit-view", {}, () => [
                (S(), ae(Xt(f(GN))))
              ])
            ]),
            _: 3
          })
        ]) : Z("", !0),
        w.showInteractive ? Be(w.$slots, "control-interactive", { key: 2 }, () => [
          w.showInteractive ? (S(), ae(Zo, {
            key: 0,
            class: "vue-flow__controls-interactive",
            onClick: x
          }, {
            default: ne(() => [
              h.value ? Be(w.$slots, "icon-unlock", { key: 0 }, () => [
                (S(), ae(Xt(f(o2))))
              ]) : Z("", !0),
              h.value ? Z("", !0) : Be(w.$slots, "icon-lock", { key: 1 }, () => [
                (S(), ae(Xt(f(JN))))
              ])
            ]),
            _: 3
          })) : Z("", !0)
        ]) : Z("", !0),
        Be(w.$slots, "default")
      ]),
      _: 3
    }, 8, ["position"]));
  }
});
var a2 = { value: () => {
} };
function dl() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new fi(n);
}
function fi(e) {
  this._ = e;
}
function s2(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", o = n.indexOf(".");
    if (o >= 0 && (i = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
fi.prototype = dl.prototype = {
  constructor: fi,
  on: function(e, t) {
    var n = this._, i = s2(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; ) if ((o = (e = i[r]).type) && (o = l2(n[o], e.name))) return o;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++r < a; )
      if (o = (e = i[r]).type) n[o] = zc(n[o], e.name, t);
      else if (t == null) for (o in n) n[o] = zc(n[o], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new fi(e);
  },
  call: function(e, t) {
    if ((o = arguments.length - 2) > 0) for (var n = new Array(o), i = 0, o, r; i < o; ++i) n[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (r = this._[e], i = 0, o = r.length; i < o; ++i) r[i].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (var i = this._[e], o = 0, r = i.length; o < r; ++o) i[o].value.apply(t, n);
  }
};
function l2(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function zc(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = a2, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var vs = "http://www.w3.org/1999/xhtml";
const Fc = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: vs,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function fr(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Fc.hasOwnProperty(t) ? { space: Fc[t], local: e } : e;
}
function u2(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === vs && t.documentElement.namespaceURI === vs ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function c2(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function rp(e) {
  var t = fr(e);
  return (t.local ? c2 : u2)(t);
}
function d2() {
}
function fl(e) {
  return e == null ? d2 : function() {
    return this.querySelector(e);
  };
}
function f2(e) {
  typeof e != "function" && (e = fl(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = new Array(a), l, c, u = 0; u < a; ++u)
      (l = r[u]) && (c = e.call(l, l.__data__, u, r)) && ("__data__" in l && (c.__data__ = l.__data__), s[u] = c);
  return new lt(i, this._parents);
}
function h2(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function p2() {
  return [];
}
function ap(e) {
  return e == null ? p2 : function() {
    return this.querySelectorAll(e);
  };
}
function v2(e) {
  return function() {
    return h2(e.apply(this, arguments));
  };
}
function m2(e) {
  typeof e == "function" ? e = v2(e) : e = ap(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), o.push(l));
  return new lt(i, o);
}
function sp(e) {
  return function() {
    return this.matches(e);
  };
}
function lp(e) {
  return function(t) {
    return t.matches(e);
  };
}
var g2 = Array.prototype.find;
function y2(e) {
  return function() {
    return g2.call(this.children, e);
  };
}
function w2() {
  return this.firstElementChild;
}
function b2(e) {
  return this.select(e == null ? w2 : y2(typeof e == "function" ? e : lp(e)));
}
var _2 = Array.prototype.filter;
function k2() {
  return Array.from(this.children);
}
function E2(e) {
  return function() {
    return _2.call(this.children, e);
  };
}
function x2(e) {
  return this.selectAll(e == null ? k2 : E2(typeof e == "function" ? e : lp(e)));
}
function $2(e) {
  typeof e != "function" && (e = sp(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new lt(i, this._parents);
}
function up(e) {
  return new Array(e.length);
}
function S2() {
  return new lt(this._enter || this._groups.map(up), this._parents);
}
function Hi(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Hi.prototype = {
  constructor: Hi,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function C2(e) {
  return function() {
    return e;
  };
}
function N2(e, t, n, i, o, r) {
  for (var a = 0, s, l = t.length, c = r.length; a < c; ++a)
    (s = t[a]) ? (s.__data__ = r[a], i[a] = s) : n[a] = new Hi(e, r[a]);
  for (; a < l; ++a)
    (s = t[a]) && (o[a] = s);
}
function I2(e, t, n, i, o, r, a) {
  var s, l, c = /* @__PURE__ */ new Map(), u = t.length, d = r.length, h = new Array(u), p;
  for (s = 0; s < u; ++s)
    (l = t[s]) && (h[s] = p = a.call(l, l.__data__, s, t) + "", c.has(p) ? o[s] = l : c.set(p, l));
  for (s = 0; s < d; ++s)
    p = a.call(e, r[s], s, r) + "", (l = c.get(p)) ? (i[s] = l, l.__data__ = r[s], c.delete(p)) : n[s] = new Hi(e, r[s]);
  for (s = 0; s < u; ++s)
    (l = t[s]) && c.get(h[s]) === l && (o[s] = l);
}
function A2(e) {
  return e.__data__;
}
function M2(e, t) {
  if (!arguments.length) return Array.from(this, A2);
  var n = t ? I2 : N2, i = this._parents, o = this._groups;
  typeof e != "function" && (e = C2(e));
  for (var r = o.length, a = new Array(r), s = new Array(r), l = new Array(r), c = 0; c < r; ++c) {
    var u = i[c], d = o[c], h = d.length, p = T2(e.call(u, u && u.__data__, c, i)), v = p.length, g = s[c] = new Array(v), m = a[c] = new Array(v), k = l[c] = new Array(h);
    n(u, d, g, m, k, p, t);
    for (var x = 0, w = 0, b, C; x < v; ++x)
      if (b = g[x]) {
        for (x >= w && (w = x + 1); !(C = m[w]) && ++w < v; ) ;
        b._next = C || null;
      }
  }
  return a = new lt(a, i), a._enter = s, a._exit = l, a;
}
function T2(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function O2() {
  return new lt(this._exit || this._groups.map(up), this._parents);
}
function R2(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function D2(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), s = new Array(o), l = 0; l < a; ++l)
    for (var c = n[l], u = i[l], d = c.length, h = s[l] = new Array(d), p, v = 0; v < d; ++v)
      (p = c[v] || u[v]) && (h[v] = p);
  for (; l < o; ++l)
    s[l] = n[l];
  return new lt(s, this._parents);
}
function P2() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function L2(e) {
  e || (e = V2);
  function t(d, h) {
    return d && h ? e(d.__data__, h.__data__) : !d - !h;
  }
  for (var n = this._groups, i = n.length, o = new Array(i), r = 0; r < i; ++r) {
    for (var a = n[r], s = a.length, l = o[r] = new Array(s), c, u = 0; u < s; ++u)
      (c = a[u]) && (l[u] = c);
    l.sort(t);
  }
  return new lt(o, this._parents).order();
}
function V2(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function B2() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function z2() {
  return Array.from(this);
}
function F2() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a) return a;
    }
  return null;
}
function H2() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function q2() {
  return !this.node();
}
function U2(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, s; r < a; ++r)
      (s = o[r]) && e.call(s, s.__data__, r, o);
  return this;
}
function W2(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Y2(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function G2(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function j2(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function X2(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function K2(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function Z2(e, t) {
  var n = fr(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? Y2 : W2 : typeof t == "function" ? n.local ? K2 : X2 : n.local ? j2 : G2)(n, t));
}
function cp(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function J2(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Q2(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function eI(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function tI(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? J2 : typeof t == "function" ? eI : Q2)(e, t, n ?? "")) : Pn(this.node(), e);
}
function Pn(e, t) {
  return e.style.getPropertyValue(t) || cp(e).getComputedStyle(e, null).getPropertyValue(t);
}
function nI(e) {
  return function() {
    delete this[e];
  };
}
function oI(e, t) {
  return function() {
    this[e] = t;
  };
}
function iI(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function rI(e, t) {
  return arguments.length > 1 ? this.each((t == null ? nI : typeof t == "function" ? iI : oI)(e, t)) : this.node()[e];
}
function dp(e) {
  return e.trim().split(/^|\s+/);
}
function hl(e) {
  return e.classList || new fp(e);
}
function fp(e) {
  this._node = e, this._names = dp(e.getAttribute("class") || "");
}
fp.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function hp(e, t) {
  for (var n = hl(e), i = -1, o = t.length; ++i < o; ) n.add(t[i]);
}
function pp(e, t) {
  for (var n = hl(e), i = -1, o = t.length; ++i < o; ) n.remove(t[i]);
}
function aI(e) {
  return function() {
    hp(this, e);
  };
}
function sI(e) {
  return function() {
    pp(this, e);
  };
}
function lI(e, t) {
  return function() {
    (t.apply(this, arguments) ? hp : pp)(this, e);
  };
}
function uI(e, t) {
  var n = dp(e + "");
  if (arguments.length < 2) {
    for (var i = hl(this.node()), o = -1, r = n.length; ++o < r; ) if (!i.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? lI : t ? aI : sI)(n, t));
}
function cI() {
  this.textContent = "";
}
function dI(e) {
  return function() {
    this.textContent = e;
  };
}
function fI(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function hI(e) {
  return arguments.length ? this.each(e == null ? cI : (typeof e == "function" ? fI : dI)(e)) : this.node().textContent;
}
function pI() {
  this.innerHTML = "";
}
function vI(e) {
  return function() {
    this.innerHTML = e;
  };
}
function mI(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function gI(e) {
  return arguments.length ? this.each(e == null ? pI : (typeof e == "function" ? mI : vI)(e)) : this.node().innerHTML;
}
function yI() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function wI() {
  return this.each(yI);
}
function bI() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function _I() {
  return this.each(bI);
}
function kI(e) {
  var t = typeof e == "function" ? e : rp(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function EI() {
  return null;
}
function xI(e, t) {
  var n = typeof e == "function" ? e : rp(e), i = t == null ? EI : typeof t == "function" ? t : fl(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function $I() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function SI() {
  return this.each($I);
}
function CI() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function NI() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function II(e) {
  return this.select(e ? NI : CI);
}
function AI(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function MI(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function TI(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function OI(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function RI(e, t, n) {
  return function() {
    var i = this.__on, o, r = MI(t);
    if (i) {
      for (var a = 0, s = i.length; a < s; ++a)
        if ((o = i[a]).type === e.type && o.name === e.name) {
          this.removeEventListener(o.type, o.listener, o.options), this.addEventListener(o.type, o.listener = r, o.options = n), o.value = t;
          return;
        }
    }
    this.addEventListener(e.type, r, n), o = { type: e.type, name: e.name, value: t, listener: r, options: n }, i ? i.push(o) : this.__on = [o];
  };
}
function DI(e, t, n) {
  var i = TI(e + ""), o, r = i.length, a;
  if (arguments.length < 2) {
    var s = this.node().__on;
    if (s) {
      for (var l = 0, c = s.length, u; l < c; ++l)
        for (o = 0, u = s[l]; o < r; ++o)
          if ((a = i[o]).type === u.type && a.name === u.name)
            return u.value;
    }
    return;
  }
  for (s = t ? RI : OI, o = 0; o < r; ++o) this.each(s(i[o], t, n));
  return this;
}
function vp(e, t, n) {
  var i = cp(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function PI(e, t) {
  return function() {
    return vp(this, e, t);
  };
}
function LI(e, t) {
  return function() {
    return vp(this, e, t.apply(this, arguments));
  };
}
function VI(e, t) {
  return this.each((typeof t == "function" ? LI : PI)(e, t));
}
function* BI() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var mp = [null];
function lt(e, t) {
  this._groups = e, this._parents = t;
}
function To() {
  return new lt([[document.documentElement]], mp);
}
function zI() {
  return this;
}
lt.prototype = To.prototype = {
  constructor: lt,
  select: f2,
  selectAll: m2,
  selectChild: b2,
  selectChildren: x2,
  filter: $2,
  data: M2,
  enter: S2,
  exit: O2,
  join: R2,
  merge: D2,
  selection: zI,
  order: P2,
  sort: L2,
  call: B2,
  nodes: z2,
  node: F2,
  size: H2,
  empty: q2,
  each: U2,
  attr: Z2,
  style: tI,
  property: rI,
  classed: uI,
  text: hI,
  html: gI,
  raise: wI,
  lower: _I,
  append: kI,
  insert: xI,
  remove: SI,
  clone: II,
  datum: AI,
  on: DI,
  dispatch: VI,
  [Symbol.iterator]: BI
};
function Kt(e) {
  return typeof e == "string" ? new lt([[document.querySelector(e)]], [document.documentElement]) : new lt([[e]], mp);
}
function FI(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Yt(e, t) {
  if (e = FI(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var i = n.createSVGPoint();
      return i.x = e.clientX, i.y = e.clientY, i = i.matrixTransform(t.getScreenCTM().inverse()), [i.x, i.y];
    }
    if (t.getBoundingClientRect) {
      var o = t.getBoundingClientRect();
      return [e.clientX - o.left - t.clientLeft, e.clientY - o.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
const ms = { capture: !0, passive: !1 };
function gs(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function HI(e) {
  var t = e.document.documentElement, n = Kt(e).on("dragstart.drag", gs, ms);
  "onselectstart" in t ? n.on("selectstart.drag", gs, ms) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function qI(e, t) {
  var n = e.document.documentElement, i = Kt(e).on("dragstart.drag", null);
  t && (i.on("click.drag", gs, ms), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
function pl(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function gp(e, t) {
  var n = Object.create(e.prototype);
  for (var i in t) n[i] = t[i];
  return n;
}
function Oo() {
}
var ko = 0.7, qi = 1 / ko, An = "\\s*([+-]?\\d+)\\s*", Eo = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", At = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", UI = /^#([0-9a-f]{3,8})$/, WI = new RegExp(`^rgb\\(${An},${An},${An}\\)$`), YI = new RegExp(`^rgb\\(${At},${At},${At}\\)$`), GI = new RegExp(`^rgba\\(${An},${An},${An},${Eo}\\)$`), jI = new RegExp(`^rgba\\(${At},${At},${At},${Eo}\\)$`), XI = new RegExp(`^hsl\\(${Eo},${At},${At}\\)$`), KI = new RegExp(`^hsla\\(${Eo},${At},${At},${Eo}\\)$`), Hc = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
pl(Oo, xo, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: qc,
  // Deprecated! Use color.formatHex.
  formatHex: qc,
  formatHex8: ZI,
  formatHsl: JI,
  formatRgb: Uc,
  toString: Uc
});
function qc() {
  return this.rgb().formatHex();
}
function ZI() {
  return this.rgb().formatHex8();
}
function JI() {
  return yp(this).formatHsl();
}
function Uc() {
  return this.rgb().formatRgb();
}
function xo(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = UI.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? Wc(t) : n === 3 ? new it(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Jo(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Jo(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = WI.exec(e)) ? new it(t[1], t[2], t[3], 1) : (t = YI.exec(e)) ? new it(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = GI.exec(e)) ? Jo(t[1], t[2], t[3], t[4]) : (t = jI.exec(e)) ? Jo(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = XI.exec(e)) ? jc(t[1], t[2] / 100, t[3] / 100, 1) : (t = KI.exec(e)) ? jc(t[1], t[2] / 100, t[3] / 100, t[4]) : Hc.hasOwnProperty(e) ? Wc(Hc[e]) : e === "transparent" ? new it(NaN, NaN, NaN, 0) : null;
}
function Wc(e) {
  return new it(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Jo(e, t, n, i) {
  return i <= 0 && (e = t = n = NaN), new it(e, t, n, i);
}
function QI(e) {
  return e instanceof Oo || (e = xo(e)), e ? (e = e.rgb(), new it(e.r, e.g, e.b, e.opacity)) : new it();
}
function ys(e, t, n, i) {
  return arguments.length === 1 ? QI(e) : new it(e, t, n, i ?? 1);
}
function it(e, t, n, i) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +i;
}
pl(it, ys, gp(Oo, {
  brighter(e) {
    return e = e == null ? qi : Math.pow(qi, e), new it(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? ko : Math.pow(ko, e), new it(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new it(cn(this.r), cn(this.g), cn(this.b), Ui(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Yc,
  // Deprecated! Use color.formatHex.
  formatHex: Yc,
  formatHex8: eA,
  formatRgb: Gc,
  toString: Gc
}));
function Yc() {
  return `#${sn(this.r)}${sn(this.g)}${sn(this.b)}`;
}
function eA() {
  return `#${sn(this.r)}${sn(this.g)}${sn(this.b)}${sn((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Gc() {
  const e = Ui(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${cn(this.r)}, ${cn(this.g)}, ${cn(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function Ui(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function cn(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function sn(e) {
  return e = cn(e), (e < 16 ? "0" : "") + e.toString(16);
}
function jc(e, t, n, i) {
  return i <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new mt(e, t, n, i);
}
function yp(e) {
  if (e instanceof mt) return new mt(e.h, e.s, e.l, e.opacity);
  if (e instanceof Oo || (e = xo(e)), !e) return new mt();
  if (e instanceof mt) return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, i = e.b / 255, o = Math.min(t, n, i), r = Math.max(t, n, i), a = NaN, s = r - o, l = (r + o) / 2;
  return s ? (t === r ? a = (n - i) / s + (n < i) * 6 : n === r ? a = (i - t) / s + 2 : a = (t - n) / s + 4, s /= l < 0.5 ? r + o : 2 - r - o, a *= 60) : s = l > 0 && l < 1 ? 0 : a, new mt(a, s, l, e.opacity);
}
function tA(e, t, n, i) {
  return arguments.length === 1 ? yp(e) : new mt(e, t, n, i ?? 1);
}
function mt(e, t, n, i) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +i;
}
pl(mt, tA, gp(Oo, {
  brighter(e) {
    return e = e == null ? qi : Math.pow(qi, e), new mt(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? ko : Math.pow(ko, e), new mt(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, i = n + (n < 0.5 ? n : 1 - n) * t, o = 2 * n - i;
    return new it(
      Ra(e >= 240 ? e - 240 : e + 120, o, i),
      Ra(e, o, i),
      Ra(e < 120 ? e + 240 : e - 120, o, i),
      this.opacity
    );
  },
  clamp() {
    return new mt(Xc(this.h), Qo(this.s), Qo(this.l), Ui(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Ui(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${Xc(this.h)}, ${Qo(this.s) * 100}%, ${Qo(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function Xc(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function Qo(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Ra(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const wp = (e) => () => e;
function nA(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function oA(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(i) {
    return Math.pow(e + i * t, n);
  };
}
function iA(e) {
  return (e = +e) == 1 ? bp : function(t, n) {
    return n - t ? oA(t, n, e) : wp(isNaN(t) ? n : t);
  };
}
function bp(e, t) {
  var n = t - e;
  return n ? nA(e, n) : wp(isNaN(e) ? t : e);
}
const Kc = (function e(t) {
  var n = iA(t);
  function i(o, r) {
    var a = n((o = ys(o)).r, (r = ys(r)).r), s = n(o.g, r.g), l = n(o.b, r.b), c = bp(o.opacity, r.opacity);
    return function(u) {
      return o.r = a(u), o.g = s(u), o.b = l(u), o.opacity = c(u), o + "";
    };
  }
  return i.gamma = e, i;
})(1);
function jt(e, t) {
  return e = +e, t = +t, function(n) {
    return e * (1 - n) + t * n;
  };
}
var ws = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Da = new RegExp(ws.source, "g");
function rA(e) {
  return function() {
    return e;
  };
}
function aA(e) {
  return function(t) {
    return e(t) + "";
  };
}
function sA(e, t) {
  var n = ws.lastIndex = Da.lastIndex = 0, i, o, r, a = -1, s = [], l = [];
  for (e = e + "", t = t + ""; (i = ws.exec(e)) && (o = Da.exec(t)); )
    (r = o.index) > n && (r = t.slice(n, r), s[a] ? s[a] += r : s[++a] = r), (i = i[0]) === (o = o[0]) ? s[a] ? s[a] += o : s[++a] = o : (s[++a] = null, l.push({ i: a, x: jt(i, o) })), n = Da.lastIndex;
  return n < t.length && (r = t.slice(n), s[a] ? s[a] += r : s[++a] = r), s.length < 2 ? l[0] ? aA(l[0].x) : rA(t) : (t = l.length, function(c) {
    for (var u = 0, d; u < t; ++u) s[(d = l[u]).i] = d.x(c);
    return s.join("");
  });
}
var Zc = 180 / Math.PI, bs = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function _p(e, t, n, i, o, r) {
  var a, s, l;
  return (a = Math.sqrt(e * e + t * t)) && (e /= a, t /= a), (l = e * n + t * i) && (n -= e * l, i -= t * l), (s = Math.sqrt(n * n + i * i)) && (n /= s, i /= s, l /= s), e * i < t * n && (e = -e, t = -t, l = -l, a = -a), {
    translateX: o,
    translateY: r,
    rotate: Math.atan2(t, e) * Zc,
    skewX: Math.atan(l) * Zc,
    scaleX: a,
    scaleY: s
  };
}
var ei;
function lA(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? bs : _p(t.a, t.b, t.c, t.d, t.e, t.f);
}
function uA(e) {
  return e == null || (ei || (ei = document.createElementNS("http://www.w3.org/2000/svg", "g")), ei.setAttribute("transform", e), !(e = ei.transform.baseVal.consolidate())) ? bs : (e = e.matrix, _p(e.a, e.b, e.c, e.d, e.e, e.f));
}
function kp(e, t, n, i) {
  function o(c) {
    return c.length ? c.pop() + " " : "";
  }
  function r(c, u, d, h, p, v) {
    if (c !== d || u !== h) {
      var g = p.push("translate(", null, t, null, n);
      v.push({ i: g - 4, x: jt(c, d) }, { i: g - 2, x: jt(u, h) });
    } else (d || h) && p.push("translate(" + d + t + h + n);
  }
  function a(c, u, d, h) {
    c !== u ? (c - u > 180 ? u += 360 : u - c > 180 && (c += 360), h.push({ i: d.push(o(d) + "rotate(", null, i) - 2, x: jt(c, u) })) : u && d.push(o(d) + "rotate(" + u + i);
  }
  function s(c, u, d, h) {
    c !== u ? h.push({ i: d.push(o(d) + "skewX(", null, i) - 2, x: jt(c, u) }) : u && d.push(o(d) + "skewX(" + u + i);
  }
  function l(c, u, d, h, p, v) {
    if (c !== d || u !== h) {
      var g = p.push(o(p) + "scale(", null, ",", null, ")");
      v.push({ i: g - 4, x: jt(c, d) }, { i: g - 2, x: jt(u, h) });
    } else (d !== 1 || h !== 1) && p.push(o(p) + "scale(" + d + "," + h + ")");
  }
  return function(c, u) {
    var d = [], h = [];
    return c = e(c), u = e(u), r(c.translateX, c.translateY, u.translateX, u.translateY, d, h), a(c.rotate, u.rotate, d, h), s(c.skewX, u.skewX, d, h), l(c.scaleX, c.scaleY, u.scaleX, u.scaleY, d, h), c = u = null, function(p) {
      for (var v = -1, g = h.length, m; ++v < g; ) d[(m = h[v]).i] = m.x(p);
      return d.join("");
    };
  };
}
var cA = kp(lA, "px, ", "px)", "deg)"), dA = kp(uA, ", ", ")", ")"), fA = 1e-12;
function Jc(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function hA(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function pA(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const vA = (function e(t, n, i) {
  function o(r, a) {
    var s = r[0], l = r[1], c = r[2], u = a[0], d = a[1], h = a[2], p = u - s, v = d - l, g = p * p + v * v, m, k;
    if (g < fA)
      k = Math.log(h / c) / t, m = function(z) {
        return [
          s + z * p,
          l + z * v,
          c * Math.exp(t * z * k)
        ];
      };
    else {
      var x = Math.sqrt(g), w = (h * h - c * c + i * g) / (2 * c * n * x), b = (h * h - c * c - i * g) / (2 * h * n * x), C = Math.log(Math.sqrt(w * w + 1) - w), I = Math.log(Math.sqrt(b * b + 1) - b);
      k = (I - C) / t, m = function(z) {
        var T = z * k, O = Jc(C), D = c / (n * x) * (O * pA(t * T + C) - hA(C));
        return [
          s + D * p,
          l + D * v,
          c * O / Jc(t * T + C)
        ];
      };
    }
    return m.duration = k * 1e3 * t / Math.SQRT2, m;
  }
  return o.rho = function(r) {
    var a = Math.max(1e-3, +r), s = a * a, l = s * s;
    return e(a, s, l);
  }, o;
})(Math.SQRT2, 2, 4);
var Ln = 0, Zn = 0, Wn = 0, Ep = 1e3, Wi, Jn, Yi = 0, vn = 0, hr = 0, $o = typeof performance == "object" && performance.now ? performance : Date, xp = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function vl() {
  return vn || (xp(mA), vn = $o.now() + hr);
}
function mA() {
  vn = 0;
}
function Gi() {
  this._call = this._time = this._next = null;
}
Gi.prototype = $p.prototype = {
  constructor: Gi,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? vl() : +n) + (t == null ? 0 : +t), !this._next && Jn !== this && (Jn ? Jn._next = this : Wi = this, Jn = this), this._call = e, this._time = n, _s();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, _s());
  }
};
function $p(e, t, n) {
  var i = new Gi();
  return i.restart(e, t, n), i;
}
function gA() {
  vl(), ++Ln;
  for (var e = Wi, t; e; )
    (t = vn - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Ln;
}
function Qc() {
  vn = (Yi = $o.now()) + hr, Ln = Zn = 0;
  try {
    gA();
  } finally {
    Ln = 0, wA(), vn = 0;
  }
}
function yA() {
  var e = $o.now(), t = e - Yi;
  t > Ep && (hr -= t, Yi = e);
}
function wA() {
  for (var e, t = Wi, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Wi = n);
  Jn = e, _s(i);
}
function _s(e) {
  if (!Ln) {
    Zn && (Zn = clearTimeout(Zn));
    var t = e - vn;
    t > 24 ? (e < 1 / 0 && (Zn = setTimeout(Qc, e - $o.now() - hr)), Wn && (Wn = clearInterval(Wn))) : (Wn || (Yi = $o.now(), Wn = setInterval(yA, Ep)), Ln = 1, xp(Qc));
  }
}
function ed(e, t, n) {
  var i = new Gi();
  return t = t == null ? 0 : +t, i.restart((o) => {
    i.stop(), e(o + t);
  }, t, n), i;
}
var bA = dl("start", "end", "cancel", "interrupt"), _A = [], Sp = 0, td = 1, ks = 2, hi = 3, nd = 4, Es = 5, pi = 6;
function pr(e, t, n, i, o, r) {
  var a = e.__transition;
  if (!a) e.__transition = {};
  else if (n in a) return;
  kA(e, n, {
    name: t,
    index: i,
    // For context during callback.
    group: o,
    // For context during callback.
    on: bA,
    tween: _A,
    time: r.time,
    delay: r.delay,
    duration: r.duration,
    ease: r.ease,
    timer: null,
    state: Sp
  });
}
function ml(e, t) {
  var n = _t(e, t);
  if (n.state > Sp) throw new Error("too late; already scheduled");
  return n;
}
function Tt(e, t) {
  var n = _t(e, t);
  if (n.state > hi) throw new Error("too late; already running");
  return n;
}
function _t(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t])) throw new Error("transition not found");
  return n;
}
function kA(e, t, n) {
  var i = e.__transition, o;
  i[t] = n, n.timer = $p(r, 0, n.time);
  function r(c) {
    n.state = td, n.timer.restart(a, n.delay, n.time), n.delay <= c && a(c - n.delay);
  }
  function a(c) {
    var u, d, h, p;
    if (n.state !== td) return l();
    for (u in i)
      if (p = i[u], p.name === n.name) {
        if (p.state === hi) return ed(a);
        p.state === nd ? (p.state = pi, p.timer.stop(), p.on.call("interrupt", e, e.__data__, p.index, p.group), delete i[u]) : +u < t && (p.state = pi, p.timer.stop(), p.on.call("cancel", e, e.__data__, p.index, p.group), delete i[u]);
      }
    if (ed(function() {
      n.state === hi && (n.state = nd, n.timer.restart(s, n.delay, n.time), s(c));
    }), n.state = ks, n.on.call("start", e, e.__data__, n.index, n.group), n.state === ks) {
      for (n.state = hi, o = new Array(h = n.tween.length), u = 0, d = -1; u < h; ++u)
        (p = n.tween[u].value.call(e, e.__data__, n.index, n.group)) && (o[++d] = p);
      o.length = d + 1;
    }
  }
  function s(c) {
    for (var u = c < n.duration ? n.ease.call(null, c / n.duration) : (n.timer.restart(l), n.state = Es, 1), d = -1, h = o.length; ++d < h; )
      o[d].call(e, u);
    n.state === Es && (n.on.call("end", e, e.__data__, n.index, n.group), l());
  }
  function l() {
    n.state = pi, n.timer.stop(), delete i[t];
    for (var c in i) return;
    delete e.__transition;
  }
}
function vi(e, t) {
  var n = e.__transition, i, o, r = !0, a;
  if (n) {
    t = t == null ? null : t + "";
    for (a in n) {
      if ((i = n[a]).name !== t) {
        r = !1;
        continue;
      }
      o = i.state > ks && i.state < Es, i.state = pi, i.timer.stop(), i.on.call(o ? "interrupt" : "cancel", e, e.__data__, i.index, i.group), delete n[a];
    }
    r && delete e.__transition;
  }
}
function EA(e) {
  return this.each(function() {
    vi(this, e);
  });
}
function xA(e, t) {
  var n, i;
  return function() {
    var o = Tt(this, e), r = o.tween;
    if (r !== n) {
      i = n = r;
      for (var a = 0, s = i.length; a < s; ++a)
        if (i[a].name === t) {
          i = i.slice(), i.splice(a, 1);
          break;
        }
    }
    o.tween = i;
  };
}
function $A(e, t, n) {
  var i, o;
  if (typeof n != "function") throw new Error();
  return function() {
    var r = Tt(this, e), a = r.tween;
    if (a !== i) {
      o = (i = a).slice();
      for (var s = { name: t, value: n }, l = 0, c = o.length; l < c; ++l)
        if (o[l].name === t) {
          o[l] = s;
          break;
        }
      l === c && o.push(s);
    }
    r.tween = o;
  };
}
function SA(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var i = _t(this.node(), n).tween, o = 0, r = i.length, a; o < r; ++o)
      if ((a = i[o]).name === e)
        return a.value;
    return null;
  }
  return this.each((t == null ? xA : $A)(n, e, t));
}
function gl(e, t, n) {
  var i = e._id;
  return e.each(function() {
    var o = Tt(this, i);
    (o.value || (o.value = {}))[t] = n.apply(this, arguments);
  }), function(o) {
    return _t(o, i).value[t];
  };
}
function Cp(e, t) {
  var n;
  return (typeof t == "number" ? jt : t instanceof xo ? Kc : (n = xo(t)) ? (t = n, Kc) : sA)(e, t);
}
function CA(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function NA(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function IA(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttribute(e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function AA(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttributeNS(e.space, e.local);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function MA(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttribute(e) : (a = this.getAttribute(e), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function TA(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttributeNS(e.space, e.local) : (a = this.getAttributeNS(e.space, e.local), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function OA(e, t) {
  var n = fr(e), i = n === "transform" ? dA : Cp;
  return this.attrTween(e, typeof t == "function" ? (n.local ? TA : MA)(n, i, gl(this, "attr." + e, t)) : t == null ? (n.local ? NA : CA)(n) : (n.local ? AA : IA)(n, i, t));
}
function RA(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function DA(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function PA(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && DA(e, r)), n;
  }
  return o._value = t, o;
}
function LA(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && RA(e, r)), n;
  }
  return o._value = t, o;
}
function VA(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  var i = fr(e);
  return this.tween(n, (i.local ? PA : LA)(i, t));
}
function BA(e, t) {
  return function() {
    ml(this, e).delay = +t.apply(this, arguments);
  };
}
function zA(e, t) {
  return t = +t, function() {
    ml(this, e).delay = t;
  };
}
function FA(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? BA : zA)(t, e)) : _t(this.node(), t).delay;
}
function HA(e, t) {
  return function() {
    Tt(this, e).duration = +t.apply(this, arguments);
  };
}
function qA(e, t) {
  return t = +t, function() {
    Tt(this, e).duration = t;
  };
}
function UA(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? HA : qA)(t, e)) : _t(this.node(), t).duration;
}
function WA(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    Tt(this, e).ease = t;
  };
}
function YA(e) {
  var t = this._id;
  return arguments.length ? this.each(WA(t, e)) : _t(this.node(), t).ease;
}
function GA(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    Tt(this, e).ease = n;
  };
}
function jA(e) {
  if (typeof e != "function") throw new Error();
  return this.each(GA(this._id, e));
}
function XA(e) {
  typeof e != "function" && (e = sp(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new Ft(i, this._parents, this._name, this._id);
}
function KA(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, n = e._groups, i = t.length, o = n.length, r = Math.min(i, o), a = new Array(i), s = 0; s < r; ++s)
    for (var l = t[s], c = n[s], u = l.length, d = a[s] = new Array(u), h, p = 0; p < u; ++p)
      (h = l[p] || c[p]) && (d[p] = h);
  for (; s < i; ++s)
    a[s] = t[s];
  return new Ft(a, this._parents, this._name, this._id);
}
function ZA(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function JA(e, t, n) {
  var i, o, r = ZA(t) ? ml : Tt;
  return function() {
    var a = r(this, e), s = a.on;
    s !== i && (o = (i = s).copy()).on(t, n), a.on = o;
  };
}
function QA(e, t) {
  var n = this._id;
  return arguments.length < 2 ? _t(this.node(), n).on.on(e) : this.each(JA(n, e, t));
}
function eM(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition) if (+n !== e) return;
    t && t.removeChild(this);
  };
}
function tM() {
  return this.on("end.remove", eM(this._id));
}
function nM(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = fl(e));
  for (var i = this._groups, o = i.length, r = new Array(o), a = 0; a < o; ++a)
    for (var s = i[a], l = s.length, c = r[a] = new Array(l), u, d, h = 0; h < l; ++h)
      (u = s[h]) && (d = e.call(u, u.__data__, h, s)) && ("__data__" in u && (d.__data__ = u.__data__), c[h] = d, pr(c[h], t, n, h, c, _t(u, n)));
  return new Ft(r, this._parents, t, n);
}
function oM(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = ap(e));
  for (var i = this._groups, o = i.length, r = [], a = [], s = 0; s < o; ++s)
    for (var l = i[s], c = l.length, u, d = 0; d < c; ++d)
      if (u = l[d]) {
        for (var h = e.call(u, u.__data__, d, l), p, v = _t(u, n), g = 0, m = h.length; g < m; ++g)
          (p = h[g]) && pr(p, t, n, g, h, v);
        r.push(h), a.push(u);
      }
  return new Ft(r, a, t, n);
}
var iM = To.prototype.constructor;
function rM() {
  return new iM(this._groups, this._parents);
}
function aM(e, t) {
  var n, i, o;
  return function() {
    var r = Pn(this, e), a = (this.style.removeProperty(e), Pn(this, e));
    return r === a ? null : r === n && a === i ? o : o = t(n = r, i = a);
  };
}
function Np(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function sM(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = Pn(this, e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function lM(e, t, n) {
  var i, o, r;
  return function() {
    var a = Pn(this, e), s = n(this), l = s + "";
    return s == null && (l = s = (this.style.removeProperty(e), Pn(this, e))), a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s));
  };
}
function uM(e, t) {
  var n, i, o, r = "style." + t, a = "end." + r, s;
  return function() {
    var l = Tt(this, e), c = l.on, u = l.value[r] == null ? s || (s = Np(t)) : void 0;
    (c !== n || o !== u) && (i = (n = c).copy()).on(a, o = u), l.on = i;
  };
}
function cM(e, t, n) {
  var i = (e += "") == "transform" ? cA : Cp;
  return t == null ? this.styleTween(e, aM(e, i)).on("end.style." + e, Np(e)) : typeof t == "function" ? this.styleTween(e, lM(e, i, gl(this, "style." + e, t))).each(uM(this._id, e)) : this.styleTween(e, sM(e, i, t), n).on("end.style." + e, null);
}
function dM(e, t, n) {
  return function(i) {
    this.style.setProperty(e, t.call(this, i), n);
  };
}
function fM(e, t, n) {
  var i, o;
  function r() {
    var a = t.apply(this, arguments);
    return a !== o && (i = (o = a) && dM(e, a, n)), i;
  }
  return r._value = t, r;
}
function hM(e, t, n) {
  var i = "style." + (e += "");
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (t == null) return this.tween(i, null);
  if (typeof t != "function") throw new Error();
  return this.tween(i, fM(e, t, n ?? ""));
}
function pM(e) {
  return function() {
    this.textContent = e;
  };
}
function vM(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function mM(e) {
  return this.tween("text", typeof e == "function" ? vM(gl(this, "text", e)) : pM(e == null ? "" : e + ""));
}
function gM(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function yM(e) {
  var t, n;
  function i() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && gM(o)), t;
  }
  return i._value = e, i;
}
function wM(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, yM(e));
}
function bM() {
  for (var e = this._name, t = this._id, n = Ip(), i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      if (l = a[c]) {
        var u = _t(l, t);
        pr(l, e, n, c, a, {
          time: u.time + u.delay + u.duration,
          delay: 0,
          duration: u.duration,
          ease: u.ease
        });
      }
  return new Ft(i, this._parents, e, n);
}
function _M() {
  var e, t, n = this, i = n._id, o = n.size();
  return new Promise(function(r, a) {
    var s = { value: a }, l = { value: function() {
      --o === 0 && r();
    } };
    n.each(function() {
      var c = Tt(this, i), u = c.on;
      u !== e && (t = (e = u).copy(), t._.cancel.push(s), t._.interrupt.push(s), t._.end.push(l)), c.on = t;
    }), o === 0 && r();
  });
}
var kM = 0;
function Ft(e, t, n, i) {
  this._groups = e, this._parents = t, this._name = n, this._id = i;
}
function Ip() {
  return ++kM;
}
var Rt = To.prototype;
Ft.prototype = {
  constructor: Ft,
  select: nM,
  selectAll: oM,
  selectChild: Rt.selectChild,
  selectChildren: Rt.selectChildren,
  filter: XA,
  merge: KA,
  selection: rM,
  transition: bM,
  call: Rt.call,
  nodes: Rt.nodes,
  node: Rt.node,
  size: Rt.size,
  empty: Rt.empty,
  each: Rt.each,
  on: QA,
  attr: OA,
  attrTween: VA,
  style: cM,
  styleTween: hM,
  text: mM,
  textTween: wM,
  remove: tM,
  tween: SA,
  delay: FA,
  duration: UA,
  ease: YA,
  easeVarying: jA,
  end: _M,
  [Symbol.iterator]: Rt[Symbol.iterator]
};
function EM(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var xM = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: EM
};
function $M(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function SM(e) {
  var t, n;
  e instanceof Ft ? (t = e._id, e = e._name) : (t = Ip(), (n = xM).time = vl(), e = e == null ? null : e + "");
  for (var i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && pr(l, e, t, c, a, n || $M(l, t));
  return new Ft(i, this._parents, e, t);
}
To.prototype.interrupt = EA;
To.prototype.transition = SM;
const ti = (e) => () => e;
function CM(e, {
  sourceEvent: t,
  target: n,
  transform: i,
  dispatch: o
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    target: { value: n, enumerable: !0, configurable: !0 },
    transform: { value: i, enumerable: !0, configurable: !0 },
    _: { value: o }
  });
}
function Vt(e, t, n) {
  this.k = e, this.x = t, this.y = n;
}
Vt.prototype = {
  constructor: Vt,
  scale: function(e) {
    return e === 1 ? this : new Vt(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new Vt(this.k, this.x + this.k * e, this.y + this.k * t);
  },
  apply: function(e) {
    return [e[0] * this.k + this.x, e[1] * this.k + this.y];
  },
  applyX: function(e) {
    return e * this.k + this.x;
  },
  applyY: function(e) {
    return e * this.k + this.y;
  },
  invert: function(e) {
    return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
  },
  invertX: function(e) {
    return (e - this.x) / this.k;
  },
  invertY: function(e) {
    return (e - this.y) / this.k;
  },
  rescaleX: function(e) {
    return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
  },
  rescaleY: function(e) {
    return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var yl = new Vt(1, 0, 0);
Vt.prototype;
function Pa(e) {
  e.stopImmediatePropagation();
}
function Yn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function NM(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function IM() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function od() {
  return this.__zoom || yl;
}
function AM(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function MM() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function TM(e, t, n) {
  var i = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], r = e.invertY(t[0][1]) - n[0][1], a = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > i ? (i + o) / 2 : Math.min(0, i) || Math.max(0, o),
    a > r ? (r + a) / 2 : Math.min(0, r) || Math.max(0, a)
  );
}
function OM() {
  var e = NM, t = IM, n = TM, i = AM, o = MM, r = [0, 1 / 0], a = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], s = 250, l = vA, c = dl("start", "zoom", "end"), u, d, h, p = 500, v = 150, g = 0, m = 10;
  function k(y) {
    y.property("__zoom", od).on("wheel.zoom", T, { passive: !1 }).on("mousedown.zoom", O).on("dblclick.zoom", D).filter(o).on("touchstart.zoom", B).on("touchmove.zoom", N).on("touchend.zoom touchcancel.zoom", H).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  k.transform = function(y, E, _, L) {
    var F = y.selection ? y.selection() : y;
    F.property("__zoom", od), y !== F ? C(y, E, _, L) : F.interrupt().each(function() {
      I(this, arguments).event(L).start().zoom(null, typeof E == "function" ? E.apply(this, arguments) : E).end();
    });
  }, k.scaleBy = function(y, E, _, L) {
    k.scaleTo(y, function() {
      var F = this.__zoom.k, J = typeof E == "function" ? E.apply(this, arguments) : E;
      return F * J;
    }, _, L);
  }, k.scaleTo = function(y, E, _, L) {
    k.transform(y, function() {
      var F = t.apply(this, arguments), J = this.__zoom, X = _ == null ? b(F) : typeof _ == "function" ? _.apply(this, arguments) : _, oe = J.invert(X), se = typeof E == "function" ? E.apply(this, arguments) : E;
      return n(w(x(J, se), X, oe), F, a);
    }, _, L);
  }, k.translateBy = function(y, E, _, L) {
    k.transform(y, function() {
      return n(this.__zoom.translate(
        typeof E == "function" ? E.apply(this, arguments) : E,
        typeof _ == "function" ? _.apply(this, arguments) : _
      ), t.apply(this, arguments), a);
    }, null, L);
  }, k.translateTo = function(y, E, _, L, F) {
    k.transform(y, function() {
      var J = t.apply(this, arguments), X = this.__zoom, oe = L == null ? b(J) : typeof L == "function" ? L.apply(this, arguments) : L;
      return n(yl.translate(oe[0], oe[1]).scale(X.k).translate(
        typeof E == "function" ? -E.apply(this, arguments) : -E,
        typeof _ == "function" ? -_.apply(this, arguments) : -_
      ), J, a);
    }, L, F);
  };
  function x(y, E) {
    return E = Math.max(r[0], Math.min(r[1], E)), E === y.k ? y : new Vt(E, y.x, y.y);
  }
  function w(y, E, _) {
    var L = E[0] - _[0] * y.k, F = E[1] - _[1] * y.k;
    return L === y.x && F === y.y ? y : new Vt(y.k, L, F);
  }
  function b(y) {
    return [(+y[0][0] + +y[1][0]) / 2, (+y[0][1] + +y[1][1]) / 2];
  }
  function C(y, E, _, L) {
    y.on("start.zoom", function() {
      I(this, arguments).event(L).start();
    }).on("interrupt.zoom end.zoom", function() {
      I(this, arguments).event(L).end();
    }).tween("zoom", function() {
      var F = this, J = arguments, X = I(F, J).event(L), oe = t.apply(F, J), se = _ == null ? b(oe) : typeof _ == "function" ? _.apply(F, J) : _, W = Math.max(oe[1][0] - oe[0][0], oe[1][1] - oe[0][1]), K = F.__zoom, G = typeof E == "function" ? E.apply(F, J) : E, ee = l(K.invert(se).concat(W / K.k), G.invert(se).concat(W / G.k));
      return function(te) {
        if (te === 1) te = G;
        else {
          var re = ee(te), le = W / re[2];
          te = new Vt(le, se[0] - re[0] * le, se[1] - re[1] * le);
        }
        X.zoom(null, te);
      };
    });
  }
  function I(y, E, _) {
    return !_ && y.__zooming || new z(y, E);
  }
  function z(y, E) {
    this.that = y, this.args = E, this.active = 0, this.sourceEvent = null, this.extent = t.apply(y, E), this.taps = 0;
  }
  z.prototype = {
    event: function(y) {
      return y && (this.sourceEvent = y), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(y, E) {
      return this.mouse && y !== "mouse" && (this.mouse[1] = E.invert(this.mouse[0])), this.touch0 && y !== "touch" && (this.touch0[1] = E.invert(this.touch0[0])), this.touch1 && y !== "touch" && (this.touch1[1] = E.invert(this.touch1[0])), this.that.__zoom = E, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(y) {
      var E = Kt(this.that).datum();
      c.call(
        y,
        this.that,
        new CM(y, {
          sourceEvent: this.sourceEvent,
          target: k,
          transform: this.that.__zoom,
          dispatch: c
        }),
        E
      );
    }
  };
  function T(y, ...E) {
    if (!e.apply(this, arguments)) return;
    var _ = I(this, E).event(y), L = this.__zoom, F = Math.max(r[0], Math.min(r[1], L.k * Math.pow(2, i.apply(this, arguments)))), J = Yt(y);
    if (_.wheel)
      (_.mouse[0][0] !== J[0] || _.mouse[0][1] !== J[1]) && (_.mouse[1] = L.invert(_.mouse[0] = J)), clearTimeout(_.wheel);
    else {
      if (L.k === F) return;
      _.mouse = [J, L.invert(J)], vi(this), _.start();
    }
    Yn(y), _.wheel = setTimeout(X, v), _.zoom("mouse", n(w(x(L, F), _.mouse[0], _.mouse[1]), _.extent, a));
    function X() {
      _.wheel = null, _.end();
    }
  }
  function O(y, ...E) {
    if (h || !e.apply(this, arguments)) return;
    var _ = y.currentTarget, L = I(this, E, !0).event(y), F = Kt(y.view).on("mousemove.zoom", se, !0).on("mouseup.zoom", W, !0), J = Yt(y, _), X = y.clientX, oe = y.clientY;
    HI(y.view), Pa(y), L.mouse = [J, this.__zoom.invert(J)], vi(this), L.start();
    function se(K) {
      if (Yn(K), !L.moved) {
        var G = K.clientX - X, ee = K.clientY - oe;
        L.moved = G * G + ee * ee > g;
      }
      L.event(K).zoom("mouse", n(w(L.that.__zoom, L.mouse[0] = Yt(K, _), L.mouse[1]), L.extent, a));
    }
    function W(K) {
      F.on("mousemove.zoom mouseup.zoom", null), qI(K.view, L.moved), Yn(K), L.event(K).end();
    }
  }
  function D(y, ...E) {
    if (e.apply(this, arguments)) {
      var _ = this.__zoom, L = Yt(y.changedTouches ? y.changedTouches[0] : y, this), F = _.invert(L), J = _.k * (y.shiftKey ? 0.5 : 2), X = n(w(x(_, J), L, F), t.apply(this, E), a);
      Yn(y), s > 0 ? Kt(this).transition().duration(s).call(C, X, L, y) : Kt(this).call(k.transform, X, L, y);
    }
  }
  function B(y, ...E) {
    if (e.apply(this, arguments)) {
      var _ = y.touches, L = _.length, F = I(this, E, y.changedTouches.length === L).event(y), J, X, oe, se;
      for (Pa(y), X = 0; X < L; ++X)
        oe = _[X], se = Yt(oe, this), se = [se, this.__zoom.invert(se), oe.identifier], F.touch0 ? !F.touch1 && F.touch0[2] !== se[2] && (F.touch1 = se, F.taps = 0) : (F.touch0 = se, J = !0, F.taps = 1 + !!u);
      u && (u = clearTimeout(u)), J && (F.taps < 2 && (d = se[0], u = setTimeout(function() {
        u = null;
      }, p)), vi(this), F.start());
    }
  }
  function N(y, ...E) {
    if (this.__zooming) {
      var _ = I(this, E).event(y), L = y.changedTouches, F = L.length, J, X, oe, se;
      for (Yn(y), J = 0; J < F; ++J)
        X = L[J], oe = Yt(X, this), _.touch0 && _.touch0[2] === X.identifier ? _.touch0[0] = oe : _.touch1 && _.touch1[2] === X.identifier && (_.touch1[0] = oe);
      if (X = _.that.__zoom, _.touch1) {
        var W = _.touch0[0], K = _.touch0[1], G = _.touch1[0], ee = _.touch1[1], te = (te = G[0] - W[0]) * te + (te = G[1] - W[1]) * te, re = (re = ee[0] - K[0]) * re + (re = ee[1] - K[1]) * re;
        X = x(X, Math.sqrt(te / re)), oe = [(W[0] + G[0]) / 2, (W[1] + G[1]) / 2], se = [(K[0] + ee[0]) / 2, (K[1] + ee[1]) / 2];
      } else if (_.touch0) oe = _.touch0[0], se = _.touch0[1];
      else return;
      _.zoom("touch", n(w(X, oe, se), _.extent, a));
    }
  }
  function H(y, ...E) {
    if (this.__zooming) {
      var _ = I(this, E).event(y), L = y.changedTouches, F = L.length, J, X;
      for (Pa(y), h && clearTimeout(h), h = setTimeout(function() {
        h = null;
      }, p), J = 0; J < F; ++J)
        X = L[J], _.touch0 && _.touch0[2] === X.identifier ? delete _.touch0 : _.touch1 && _.touch1[2] === X.identifier && delete _.touch1;
      if (_.touch1 && !_.touch0 && (_.touch0 = _.touch1, delete _.touch1), _.touch0) _.touch0[1] = this.__zoom.invert(_.touch0[0]);
      else if (_.end(), _.taps === 2 && (X = Yt(X, this), Math.hypot(d[0] - X[0], d[1] - X[1]) < m)) {
        var oe = Kt(this).on("dblclick.zoom");
        oe && oe.apply(this, arguments);
      }
    }
  }
  return k.wheelDelta = function(y) {
    return arguments.length ? (i = typeof y == "function" ? y : ti(+y), k) : i;
  }, k.filter = function(y) {
    return arguments.length ? (e = typeof y == "function" ? y : ti(!!y), k) : e;
  }, k.touchable = function(y) {
    return arguments.length ? (o = typeof y == "function" ? y : ti(!!y), k) : o;
  }, k.extent = function(y) {
    return arguments.length ? (t = typeof y == "function" ? y : ti([[+y[0][0], +y[0][1]], [+y[1][0], +y[1][1]]]), k) : t;
  }, k.scaleExtent = function(y) {
    return arguments.length ? (r[0] = +y[0], r[1] = +y[1], k) : [r[0], r[1]];
  }, k.translateExtent = function(y) {
    return arguments.length ? (a[0][0] = +y[0][0], a[1][0] = +y[1][0], a[0][1] = +y[0][1], a[1][1] = +y[1][1], k) : [[a[0][0], a[0][1]], [a[1][0], a[1][1]]];
  }, k.constrain = function(y) {
    return arguments.length ? (n = y, k) : n;
  }, k.duration = function(y) {
    return arguments.length ? (s = +y, k) : s;
  }, k.interpolate = function(y) {
    return arguments.length ? (l = y, k) : l;
  }, k.on = function() {
    var y = c.on.apply(c, arguments);
    return y === c ? k : y;
  }, k.clickDistance = function(y) {
    return arguments.length ? (g = (y = +y) * y, k) : Math.sqrt(g);
  }, k.tapDistance = function(y) {
    return arguments.length ? (m = +y, k) : m;
  }, k;
}
const Ap = Symbol("MiniMapSlots"), RM = ["id", "x", "y", "rx", "ry", "width", "height", "fill", "stroke", "stroke-width", "shape-rendering"], DM = {
  name: "MiniMapNode",
  compatConfig: { MODE: 3 },
  inheritAttrs: !1
}, PM = /* @__PURE__ */ ye({
  ...DM,
  props: {
    id: {},
    type: {},
    selected: { type: Boolean },
    dragging: { type: Boolean },
    position: {},
    dimensions: {},
    borderRadius: {},
    color: {},
    shapeRendering: {},
    strokeColor: {},
    strokeWidth: {},
    hidden: { type: Boolean }
  },
  emits: ["click", "dblclick", "mouseenter", "mousemove", "mouseleave"],
  setup(e, { emit: t }) {
    const n = e, i = Ht(Ap), o = xs(), r = Ne(() => o.style ?? {});
    function a(d) {
      t("click", d);
    }
    function s(d) {
      t("dblclick", d);
    }
    function l(d) {
      t("mouseenter", d);
    }
    function c(d) {
      t("mousemove", d);
    }
    function u(d) {
      t("mouseleave", d);
    }
    return (d, h) => !d.hidden && d.dimensions.width !== 0 && d.dimensions.height !== 0 ? (S(), R(ue, { key: 0 }, [
      f(i)[`node-${n.type}`] ? (S(), ae(Xt(f(i)[`node-${n.type}`]), Wm(oo({ key: 0 }, { ...n, ...d.$attrs })), null, 16)) : (S(), R("rect", oo({
        key: 1,
        id: d.id
      }, d.$attrs, {
        class: ["vue-flow__minimap-node", { selected: d.selected, dragging: d.dragging }],
        x: d.position.x,
        y: d.position.y,
        rx: d.borderRadius,
        ry: d.borderRadius,
        width: d.dimensions.width,
        height: d.dimensions.height,
        fill: d.color || r.value.background || r.value.backgroundColor,
        stroke: d.strokeColor,
        "stroke-width": d.strokeWidth,
        "shape-rendering": d.shapeRendering,
        onClick: a,
        onDblclick: s,
        onMouseenter: l,
        onMousemove: c,
        onMouseleave: u
      }), null, 16, RM))
    ], 64)) : Z("", !0);
  }
}), LM = ["width", "height", "viewBox", "aria-labelledby"], VM = ["id"], BM = ["d", "fill", "stroke", "stroke-width"], zM = {
  name: "MiniMap",
  compatConfig: { MODE: 3 }
}, FM = /* @__PURE__ */ ye({
  ...zM,
  props: {
    nodeColor: { type: [String, Function], default: "#e2e2e2" },
    nodeStrokeColor: { type: [String, Function], default: "transparent" },
    nodeClassName: { type: [String, Function] },
    nodeBorderRadius: { default: 5 },
    nodeStrokeWidth: { default: 2 },
    maskColor: { default: "rgb(240, 240, 240, 0.6)" },
    maskStrokeColor: { default: "none" },
    maskStrokeWidth: { default: 1 },
    position: { default: "bottom-right" },
    pannable: { type: Boolean, default: !1 },
    zoomable: { type: Boolean, default: !1 },
    width: {},
    height: {},
    ariaLabel: { default: "Vue Flow mini map" },
    inversePan: { type: Boolean, default: !1 },
    zoomStep: { default: 1 },
    offsetScale: { default: 5 },
    maskBorderRadius: { default: 0 }
  },
  emits: ["click", "nodeClick", "nodeDblclick", "nodeMouseenter", "nodeMousemove", "nodeMouseleave"],
  setup(e, { emit: t }) {
    const n = md(), i = xs(), o = 200, r = 150, { id: a, edges: s, viewport: l, translateExtent: c, dimensions: u, emits: d, d3Selection: h, d3Zoom: p, getNodesInitialized: v } = De(), g = Y();
    Zt(Ap, n);
    const m = Ne(() => {
      var F;
      return e.width ?? ((F = i.style) == null ? void 0 : F.width) ?? o;
    }), k = Ne(() => {
      var F;
      return e.height ?? ((F = i.style) == null ? void 0 : F.height) ?? r;
    }), x = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision", w = U(() => typeof e.nodeColor == "string" ? () => e.nodeColor : e.nodeColor), b = U(
      () => typeof e.nodeStrokeColor == "string" ? () => e.nodeStrokeColor : e.nodeStrokeColor
    ), C = U(
      () => typeof e.nodeClassName == "string" ? () => e.nodeClassName : typeof e.nodeClassName == "function" ? e.nodeClassName : () => ""
    ), I = U(() => Ys(v.value.filter((F) => !F.hidden))), z = U(() => ({
      x: -l.value.x / l.value.zoom,
      y: -l.value.y / l.value.zoom,
      width: u.value.width / l.value.zoom,
      height: u.value.height / l.value.zoom
    })), T = U(
      () => v.value && v.value.length ? g_(I.value, z.value) : z.value
    ), O = U(() => {
      const F = T.value.width / m.value, J = T.value.height / k.value;
      return Math.max(F, J);
    }), D = U(() => {
      const F = O.value * m.value, J = O.value * k.value, X = e.offsetScale * O.value;
      return {
        offset: X,
        x: T.value.x - (F - T.value.width) / 2 - X,
        y: T.value.y - (J - T.value.height) / 2 - X,
        width: F + X * 2,
        height: J + X * 2
      };
    }), B = U(() => !D.value.x || !D.value.y ? "" : `
    M${D.value.x - D.value.offset},${D.value.y - D.value.offset}
    h${D.value.width + D.value.offset * 2}
    v${D.value.height + D.value.offset * 2}
    h${-D.value.width - D.value.offset * 2}z
    M${z.value.x + e.maskBorderRadius},${z.value.y}
    h${z.value.width - 2 * e.maskBorderRadius}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 ${e.maskBorderRadius},${e.maskBorderRadius}
    v${z.value.height - 2 * e.maskBorderRadius}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 -${e.maskBorderRadius},${e.maskBorderRadius}
    h${-(z.value.width - 2 * e.maskBorderRadius)}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 -${e.maskBorderRadius},-${e.maskBorderRadius}
    v${-(z.value.height - 2 * e.maskBorderRadius)}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 ${e.maskBorderRadius},-${e.maskBorderRadius}z`);
    yd(
      (F) => {
        if (g.value) {
          const J = Kt(g.value), X = (W) => {
            if (W.sourceEvent.type !== "wheel" || !h.value || !p.value)
              return;
            const K = W.sourceEvent.ctrlKey && go() ? 10 : 1, G = -W.sourceEvent.deltaY * (W.sourceEvent.deltaMode === 1 ? 0.05 : W.sourceEvent.deltaMode ? 1 : 2e-3) * e.zoomStep, ee = l.value.zoom * 2 ** (G * K);
            p.value.scaleTo(h.value, ee);
          }, oe = (W) => {
            if (W.sourceEvent.type !== "mousemove" || !h.value || !p.value)
              return;
            const K = O.value * Math.max(1, l.value.zoom) * (e.inversePan ? -1 : 1), G = {
              x: l.value.x - W.sourceEvent.movementX * K,
              y: l.value.y - W.sourceEvent.movementY * K
            }, ee = [
              [0, 0],
              [u.value.width, u.value.height]
            ], te = yl.translate(G.x, G.y).scale(l.value.zoom), re = p.value.constrain()(te, ee, c.value);
            p.value.transform(h.value, re);
          }, se = OM().wheelDelta((W) => es(W) * (e.zoomStep / 10)).on("zoom", e.pannable ? oe : () => {
          }).on("zoom.wheel", e.zoomable ? X : () => {
          });
          J.call(se), F(() => {
            J.on("zoom", null);
          });
        }
      },
      { flush: "post" }
    );
    function N(F) {
      const [J, X] = Yt(F);
      t("click", { event: F, position: { x: J, y: X } });
    }
    function H(F, J) {
      const X = { event: F, node: J, connectedEdges: on([J], s.value) };
      d.miniMapNodeClick(X), t("nodeClick", X);
    }
    function y(F, J) {
      const X = { event: F, node: J, connectedEdges: on([J], s.value) };
      d.miniMapNodeDoubleClick(X), t("nodeDblclick", X);
    }
    function E(F, J) {
      const X = { event: F, node: J, connectedEdges: on([J], s.value) };
      d.miniMapNodeMouseEnter(X), t("nodeMouseenter", X);
    }
    function _(F, J) {
      const X = { event: F, node: J, connectedEdges: on([J], s.value) };
      d.miniMapNodeMouseMove(X), t("nodeMousemove", X);
    }
    function L(F, J) {
      const X = { event: F, node: J, connectedEdges: on([J], s.value) };
      d.miniMapNodeMouseLeave(X), t("nodeMouseleave", X);
    }
    return (F, J) => (S(), ae(f(eh), {
      position: F.position,
      class: Ie(["vue-flow__minimap", { pannable: F.pannable, zoomable: F.zoomable }])
    }, {
      default: ne(() => [
        (S(), R("svg", {
          ref_key: "el",
          ref: g,
          width: m.value,
          height: k.value,
          viewBox: [D.value.x, D.value.y, D.value.width, D.value.height].join(" "),
          role: "img",
          "aria-labelledby": `vue-flow__minimap-${f(a)}`,
          onClick: N
        }, [
          F.ariaLabel ? (S(), R("title", {
            key: 0,
            id: `vue-flow__minimap-${f(a)}`
          }, j(F.ariaLabel), 9, VM)) : Z("", !0),
          (S(!0), R(ue, null, Re(f(v), (X) => (S(), ae(PM, {
            id: X.id,
            key: X.id,
            f: "",
            position: X.computedPosition,
            dimensions: X.dimensions,
            selected: X.selected,
            dragging: X.dragging,
            style: ze(X.style),
            class: Ie(C.value(X)),
            color: w.value(X),
            "border-radius": F.nodeBorderRadius,
            "stroke-color": b.value(X),
            "stroke-width": F.nodeStrokeWidth,
            "shape-rendering": f(x),
            type: X.type,
            hidden: X.hidden,
            onClick: (oe) => H(oe, X),
            onDblclick: (oe) => y(oe, X),
            onMouseenter: (oe) => E(oe, X),
            onMousemove: (oe) => _(oe, X),
            onMouseleave: (oe) => L(oe, X)
          }, null, 8, ["id", "position", "dimensions", "selected", "dragging", "style", "class", "color", "border-radius", "stroke-color", "stroke-width", "shape-rendering", "type", "hidden", "onClick", "onDblclick", "onMouseenter", "onMousemove", "onMouseleave"]))), 128)),
          $("path", {
            class: "vue-flow__minimap-mask",
            d: B.value,
            fill: F.maskColor,
            stroke: F.maskStrokeColor,
            "stroke-width": F.maskStrokeWidth,
            "fill-rule": "evenodd"
          }, null, 8, BM)
        ], 8, LM))
      ]),
      _: 1
    }, 8, ["position", "class"]));
  }
}), HM = {
  id: "workflow-step-palette",
  class: "wf-palette"
}, qM = { class: "wf-palette-scroll" }, UM = {
  key: 0,
  class: "wf-palette-loading"
}, WM = ["id"], YM = { class: "wf-palette-ico wf-palette-ico--note" }, GM = { class: "wf-palette-ico wf-palette-ico--note" }, jM = { class: "wf-palette-count" }, XM = ["id"], KM = { class: "wf-palette-count" }, ZM = { class: "wf-palette-item-body" }, JM = { class: "wf-palette-item-t" }, QM = {
  key: 0,
  class: "wf-palette-item-s"
}, eT = /* @__PURE__ */ ye({
  __name: "Palette",
  props: {
    items: {},
    loading: { type: Boolean },
    errors: {}
  },
  emits: ["place", "place-note", "place-frame"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(""), r = Y(/* @__PURE__ */ new Set(["Tools", "Destinations", "Notes"])), a = U(() => o.value.trim().length > 0);
    function s(w) {
      return a.value || !r.value.has(w);
    }
    const l = U(() => bN(n.items, o.value, ig));
    function c(w) {
      const b = new Set(r.value);
      b.has(w) ? b.delete(w) : b.add(w), r.value = b;
    }
    function u(w) {
      return `palette-group-${w.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }
    const d = Y(/* @__PURE__ */ new Set());
    function h(w, b) {
      return `${w}::${b}`;
    }
    function p(w, b) {
      return a.value || d.value.has(h(w, b));
    }
    function v(w, b) {
      const C = h(w, b), I = new Set(d.value);
      I.has(C) ? I.delete(C) : I.add(C), d.value = I;
    }
    function g(w) {
      if (w.items.length < mN)
        return w.items.map((C) => ({ kind: "item", key: C.paletteId, item: C }));
      const b = [];
      for (const C of yN(w.items)) {
        const I = p(w.cat, C.module);
        if (b.push({ kind: "sub", key: `s:${C.module}`, module: C.module, count: C.items.length, open: I }), I) for (const z of C.items) b.push({ kind: "item", key: `${C.module}:${z.paletteId}`, item: z });
      }
      return b;
    }
    function m(w, b) {
      w.dataTransfer && (w.dataTransfer.setData("application/wf-item", b.paletteId), w.dataTransfer.effectAllowed = "copy");
    }
    function k(w) {
      w.dataTransfer && (w.dataTransfer.setData("application/wf-item", "note:new"), w.dataTransfer.effectAllowed = "copy");
    }
    function x(w) {
      w.dataTransfer && (w.dataTransfer.setData("application/wf-item", "frame:new"), w.dataTransfer.effectAllowed = "copy");
    }
    return (w, b) => (S(), R("div", HM, [
      V(f(Dd), { class: "wf-palette-search" }, {
        default: ne(() => [
          V(f(Pd), null, {
            default: ne(() => [
              V(f(ie), {
                icon: "tabler:search",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }),
          V(f(rt), {
            modelValue: o.value,
            "onUpdate:modelValue": b[0] || (b[0] = (C) => o.value = C),
            type: "text",
            placeholder: "Search steps  (⌘K)",
            "aria-label": "Search steps"
          }, null, 8, ["modelValue"])
        ]),
        _: 1
      }),
      $("div", qM, [
        e.loading ? (S(), R("div", UM, [
          V(f(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading catalog"
          }),
          b[3] || (b[3] = $("span", null, "Loading the catalog…", -1))
        ])) : Z("", !0),
        (S(!0), R(ue, null, Re(l.value, (C) => (S(), R("div", {
          key: C.cat,
          class: "wf-palette-group"
        }, [
          C.cat === "Notes" ? (S(), R(ue, { key: 0 }, [
            V(f(fe), {
              class: "wf-palette-cat",
              severity: "secondary",
              text: "",
              "aria-expanded": s(C.cat),
              "aria-controls": u(C.cat),
              onClick: (I) => c(C.cat)
            }, {
              default: ne(() => [
                V(f(ie), {
                  icon: s(C.cat) ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                b[4] || (b[4] = $("span", null, "Notes", -1))
              ]),
              _: 2
            }, 1032, ["aria-expanded", "aria-controls", "onClick"]),
            s(C.cat) ? (S(), R("div", {
              key: 0,
              id: u(C.cat)
            }, [
              V(f(fe), {
                class: "wf-palette-item",
                severity: "secondary",
                text: "",
                draggable: "true",
                onClick: b[1] || (b[1] = (I) => i("place-note")),
                onDragstart: k
              }, {
                default: ne(() => [
                  $("span", YM, [
                    V(f(ie), {
                      icon: "tabler:note",
                      "aria-hidden": "true"
                    })
                  ]),
                  b[5] || (b[5] = $("span", { class: "wf-palette-item-body" }, [
                    $("span", { class: "wf-palette-item-t" }, "Sticky Note"),
                    $("span", { class: "wf-palette-item-s" }, "Annotate the canvas")
                  ], -1))
                ]),
                _: 1
              }),
              s(C.cat) ? (S(), ae(f(fe), {
                key: 0,
                class: "wf-palette-item",
                severity: "secondary",
                text: "",
                draggable: "true",
                onClick: b[2] || (b[2] = (I) => i("place-frame")),
                onDragstart: x
              }, {
                default: ne(() => [
                  $("span", GM, [
                    V(f(ie), {
                      icon: "tabler:box",
                      "aria-hidden": "true"
                    })
                  ]),
                  b[6] || (b[6] = $("span", { class: "wf-palette-item-body" }, [
                    $("span", { class: "wf-palette-item-t" }, "Frame"),
                    $("span", { class: "wf-palette-item-s" }, "Group nodes in a colored region")
                  ], -1))
                ]),
                _: 1
              })) : Z("", !0)
            ], 8, WM)) : Z("", !0)
          ], 64)) : (S(), R(ue, { key: 1 }, [
            V(f(fe), {
              class: "wf-palette-cat",
              severity: "secondary",
              text: "",
              "aria-expanded": s(C.cat),
              "aria-controls": u(C.cat),
              onClick: (I) => c(C.cat)
            }, {
              default: ne(() => [
                V(f(ie), {
                  icon: s(C.cat) ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                $("span", null, j(C.cat), 1),
                $("span", jM, j(C.items.length), 1)
              ]),
              _: 2
            }, 1032, ["aria-expanded", "aria-controls", "onClick"]),
            s(C.cat) ? (S(), R("div", {
              key: 0,
              id: u(C.cat)
            }, [
              (S(!0), R(ue, null, Re(g(C), (I) => (S(), R(ue, {
                key: I.key
              }, [
                I.kind === "sub" ? (S(), ae(f(fe), {
                  key: 0,
                  class: "wf-palette-subcat",
                  severity: "secondary",
                  text: "",
                  "aria-expanded": I.open,
                  onClick: (z) => v(C.cat, I.module)
                }, {
                  default: ne(() => [
                    V(f(ie), {
                      icon: I.open ? "tabler:chevron-down" : "tabler:chevron-right",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    $("span", null, j(I.module), 1),
                    $("span", KM, j(I.count), 1)
                  ]),
                  _: 2
                }, 1032, ["aria-expanded", "onClick"])) : (S(), ae(f(fe), {
                  key: 1,
                  class: "wf-palette-item",
                  severity: "secondary",
                  text: "",
                  draggable: "true",
                  onClick: (z) => i("place", I.item),
                  onDragstart: (z) => m(z, I.item)
                }, {
                  default: ne(() => [
                    $("span", {
                      class: Ie(["wf-palette-ico", `wf-palette-ico--${I.item.kind}`])
                    }, [
                      V(f(ie), {
                        icon: I.item.icon,
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ], 2),
                    $("span", ZM, [
                      $("span", JM, j(I.item.title), 1),
                      I.item.subtitle ? (S(), R("span", QM, j(I.item.subtitle), 1)) : Z("", !0)
                    ])
                  ]),
                  _: 2
                }, 1032, ["onClick", "onDragstart"]))
              ], 64))), 128))
            ], 8, XM)) : Z("", !0)
          ], 64))
        ]))), 128)),
        e.errors.length ? (S(), ae(f(He), {
          key: 1,
          class: "wf-palette-errors",
          severity: "warn",
          closable: !1
        }, {
          default: ne(() => [
            ce(" Some catalogs couldn’t load. " + j(e.errors[0]), 1)
          ]),
          _: 1
        })) : Z("", !0)
      ])
    ]));
  }
});
function tT(e) {
  return e ? `/api/v1/dataflows/${encodeURIComponent(e)}` : null;
}
function nT(e) {
  return `flow-run-${(e || "run").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "run"}.redacted.json`;
}
function oT(e) {
  return e.map((t, n) => ({
    key: `${t.seq || n}:${t.type}:${t.engine_node_id || ""}`,
    occurredAt: t.occurred_at,
    source: t.source || "engine",
    type: t.type || "event",
    engineNodeId: t.engine_node_id,
    ...t.raw !== void 0 ? { raw: t.raw } : {}
  }));
}
function iT(e) {
  const t = e?.process;
  return t ? [t.id, t.host, t.pid ? `pid ${t.pid}` : ""].filter(Boolean).join(" · ") : "";
}
const rT = {
  class: "wf-run-timeline",
  "aria-label": "Run timeline"
}, aT = { class: "wf-run-section-h" }, sT = {
  key: 0,
  class: "wf-panel-note"
}, lT = {
  key: 2,
  class: "wf-panel-hint"
}, uT = {
  key: 3,
  class: "wf-timeline-list"
}, cT = { class: "wf-timeline-head" }, dT = { class: "wf-timeline-type" }, fT = { class: "wf-timeline-source" }, hT = { class: "wf-timeline-when" }, pT = { key: 0 }, vT = /* @__PURE__ */ ye({
  __name: "RunTimeline",
  props: {
    workflowId: {},
    runId: {}
  },
  setup(e) {
    const t = e, n = Y(!1), i = Y(!1), o = Y(""), r = Y(null);
    async function a(s = !0) {
      s ? (n.value = !0, o.value = "", r.value = null) : i.value = !0;
      try {
        const l = s ? 0 : r.value?.next_offset ?? 0, c = await kg(t.workflowId, t.runId, 100, l);
        !s && r.value && (c.events = [...r.value.events, ...c.events]), r.value = c;
      } catch (l) {
        o.value = qe(l, "Couldn’t load this run’s timeline. Try again, or open Keeper when it is available.");
      } finally {
        n.value = !1, i.value = !1;
      }
    }
    return _e(() => [t.workflowId, t.runId], () => {
      a();
    }), Ue(() => {
      a();
    }), (s, l) => (S(), R("section", rT, [
      $("div", aT, [
        V(f(ie), {
          icon: "tabler:timeline-event",
          "aria-hidden": "true"
        }),
        l[2] || (l[2] = $("span", null, "Timeline", -1))
      ]),
      l[5] || (l[5] = $("p", { class: "wf-panel-hint" }, "Activity recorded for this run. Details stay collapsed.", -1)),
      n.value ? (S(), R("div", sT, [
        V(f(dt), {
          class: "wf-status-spinner",
          "stroke-width": "4",
          "aria-label": "Loading timeline"
        }),
        l[3] || (l[3] = $("span", null, "Loading timeline…", -1))
      ])) : o.value ? (S(), ae(f(He), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          ce(j(o.value) + " ", 1),
          V(f(fe), {
            label: "Try again",
            link: "",
            size: "small",
            onClick: l[0] || (l[0] = (c) => a())
          })
        ]),
        _: 1
      })) : r.value?.events.length ? (S(), R("ol", uT, [
        (S(!0), R(ue, null, Re(f(oT)(r.value.events), (c) => (S(), R("li", {
          key: c.key,
          class: "wf-timeline-event"
        }, [
          $("div", cT, [
            $("span", dT, j(c.type), 1),
            $("span", fT, j(c.source), 1)
          ]),
          $("span", hT, [
            ce(j(f(Qt)(c.occurredAt)), 1),
            c.engineNodeId ? (S(), R("span", pT, " · " + j(c.engineNodeId), 1)) : Z("", !0)
          ]),
          c.raw !== void 0 ? (S(), ae(f(Rs), {
            key: 0,
            header: "Event details",
            toggleable: "",
            collapsed: "",
            class: "wf-timeline-raw"
          }, {
            default: ne(() => [
              $("pre", null, j(f(_g)(c.raw)), 1)
            ]),
            _: 2
          }, 1024)) : Z("", !0)
        ]))), 128))
      ])) : (S(), R("p", lT, "No activity was recorded for this run.")),
      r.value?.next_offset != null ? (S(), ae(f(fe), {
        key: 4,
        severity: "secondary",
        outlined: "",
        disabled: i.value,
        loading: i.value,
        onClick: l[1] || (l[1] = (c) => a(!1))
      }, {
        default: ne(() => [
          i.value ? Z("", !0) : (S(), ae(f(ie), {
            key: 0,
            icon: "tabler:plus",
            "aria-hidden": "true"
          })),
          l[4] || (l[4] = $("span", null, "Load more activity", -1))
        ]),
        _: 1
      }, 8, ["disabled", "loading"])) : Z("", !0)
    ]));
  }
}), mT = { class: "wf-panel wf-panel--run" }, gT = { class: "wf-panel-hdr wf-panel-hdr--run" }, yT = { class: "wf-panel-how" }, wT = { key: 0 }, bT = { class: "wf-run-actions" }, _T = { class: "wf-run-actions" }, kT = {
  key: 2,
  class: "wf-panel-hint wf-run-select-hint"
}, ET = { class: "wf-panel-label" }, xT = { class: "wf-run-engine-meta" }, $T = { key: 0 }, ST = { key: 1 }, CT = { key: 2 }, NT = {
  key: 1,
  class: "wf-run-status"
}, IT = {
  key: 0,
  class: "wf-run-timing"
}, AT = {
  key: 2,
  class: "wf-panel-note"
}, MT = {
  key: 0,
  class: "wf-run-fail"
}, TT = { class: "wf-run-fail-h" }, OT = {
  key: 0,
  class: "wf-run-fail-code"
}, RT = {
  key: 1,
  class: "wf-run-fail-note"
}, DT = {
  key: 3,
  class: "wf-run-trace"
}, PT = { class: "wf-run-section-h" }, LT = { class: "wf-panel-hint" }, VT = {
  class: "wf-run-tool-list",
  "aria-label": "Tools called"
}, BT = { key: 0 }, zT = {
  key: 1,
  class: "wf-run-tool-id"
}, FT = {
  key: 4,
  class: "wf-panel-hint"
}, id = /* @__PURE__ */ ye({
  __name: "RunNodeOutput",
  props: {
    workflowId: {},
    run: {},
    node: {},
    nodeStatus: {},
    nodeHeader: {},
    execution: {}
  },
  emits: ["close", "exit-run", "rerun"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(!1), r = Y(null), a = Y(""), s = Y({});
    let l = 0;
    function c(y) {
      return y && typeof y == "object" && !Array.isArray(y) ? y : {};
    }
    function u(y) {
      return typeof y == "string" ? y.trim() : "";
    }
    function d(y) {
      return u(c(y).registry_id);
    }
    function h(y) {
      const E = c(y);
      return s.value[d(y)] || u(E.title) || u(E.name) || "Tool";
    }
    function p(y) {
      return u(c(y).name);
    }
    async function v(y, E) {
      const _ = [...new Set(y.flatMap((L) => L.toolCalls.map(d).filter(Boolean)))];
      if (_.length)
        try {
          const { data: L } = await mn.get(`/api/v1/agents/tools?ids=${encodeURIComponent(_.join(","))}`);
          if (E !== l) return;
          const F = {}, J = Array.isArray(L?.tools) ? L.tools : [];
          for (const X of J) {
            const oe = u(X?.id), se = u(X?.title);
            oe && se && (F[oe] = se);
          }
          s.value = F;
        } catch {
        }
    }
    async function g() {
      const y = ++l;
      r.value = null, s.value = {}, a.value = "";
      const E = n.node;
      if (E) {
        o.value = !0;
        try {
          const _ = await Od(n.workflowId, n.run.run_id, E.id), L = Eg(_, {
            failed: n.nodeStatus === "failed",
            runError: n.run.error
          });
          if (y !== l) return;
          r.value = L, v(L.agentActions, y);
        } catch {
          a.value = "Couldn’t load this step’s data.";
        } finally {
          o.value = !1;
        }
      }
    }
    _e(() => [n.run.run_id, n.node?.id, n.nodeStatus], g, { immediate: !0 }), Ue(() => {
      Xi("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    const m = U(() => Je(n.node?.title, n.node?.ref) || "Step"), k = U(() => {
      const y = r.value?.timing.durationMs;
      return y != null ? Td(y) : "";
    }), x = U(() => {
      const y = r.value;
      return !!y && (y.input != null || y.output != null || y.error != null || y.agentActions.length > 0);
    }), w = U(() => r.value?.output != null), b = U(() => Qn(n.run.flow_ref?.version ?? 0)), C = Y("overview"), I = Y(!1), z = Y(""), T = U(() => n.run.dataflow_id || n.execution?.dataflow_id || ""), O = U(() => tT(T.value)), D = U(() => iT(n.execution));
    function B(y) {
      const E = As(y);
      return E === "ok" ? "success" : E === "error" ? "danger" : "info";
    }
    const N = U(() => {
      const y = n.nodeHeader;
      return y ? [y.engine_node_id && `engine ${y.engine_node_id}`, y.parent_engine_node_id && `parent ${y.parent_engine_node_id}`].filter(Boolean).join(" · ") : "";
    });
    async function H() {
      if (!I.value) {
        I.value = !0, z.value = "";
        try {
          Ls(nT(n.run.run_id), await xg(n.workflowId, n.run.run_id));
        } catch {
          z.value = "Couldn’t download the run details. Try again.";
        } finally {
          I.value = !1;
        }
      }
    }
    return (y, E) => (S(), R("aside", mT, [
      V(f(fe), {
        class: "wf-panel-close",
        text: "",
        rounded: "",
        severity: "secondary",
        title: "Close inspector",
        "aria-label": "Close inspector",
        onClick: E[0] || (E[0] = (_) => i("close"))
      }, {
        default: ne(() => [
          V(f(ie), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }),
      $("div", gT, [
        V(f(ie), {
          icon: "tabler:history",
          "aria-hidden": "true"
        }),
        E[4] || (E[4] = $("span", { class: "wf-panel-hdr-kind" }, "Viewing run", -1))
      ]),
      $("p", yT, [
        V(f(yt), {
          class: "wf-run-status-tag",
          severity: B(f(ao)(e.run)),
          value: f(ro)(f(ao)(e.run))
        }, null, 8, ["severity", "value"]),
        V(f(yt), {
          class: "wf-run-version-tag",
          severity: b.value.kind === "published" ? "secondary" : "warn",
          value: b.value.label,
          title: b.value.title
        }, null, 8, ["severity", "value", "title"]),
        $("span", null, [
          ce(" Run " + j(f(Ms)(e.run.run_id)) + " · started " + j(f(Qt)(e.run.started_at)), 1),
          e.run.finished_at ? (S(), R("span", wT, " · finished " + j(f(Qt)(e.run.finished_at)), 1)) : Z("", !0),
          E[5] || (E[5] = ce(". Read-only — nothing here can be edited.", -1))
        ])
      ]),
      $("div", bT, [
        V(f(fe), {
          severity: "secondary",
          outlined: "",
          onClick: E[1] || (E[1] = (_) => i("rerun"))
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            E[6] || (E[6] = $("span", null, "Re-run with same input", -1))
          ]),
          _: 1
        }),
        V(f(fe), {
          severity: "secondary",
          outlined: "",
          onClick: E[2] || (E[2] = (_) => i("exit-run"))
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:pencil",
              "aria-hidden": "true"
            }),
            E[7] || (E[7] = $("span", null, "Back to editing", -1))
          ]),
          _: 1
        })
      ]),
      $("div", _T, [
        V(f(fe), {
          severity: "secondary",
          outlined: "",
          disabled: I.value,
          loading: I.value,
          onClick: H
        }, {
          default: ne(() => [
            I.value ? Z("", !0) : (S(), ae(f(ie), {
              key: 0,
              icon: "tabler:download",
              "aria-hidden": "true"
            })),
            E[8] || (E[8] = $("span", null, "Download run details", -1))
          ]),
          _: 1
        }, 8, ["disabled", "loading"]),
        O.value ? (S(), ae(f(fe), {
          key: 0,
          as: "a",
          severity: "secondary",
          outlined: "",
          href: O.value,
          target: "_blank",
          rel: "noopener"
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:external-link",
              "aria-hidden": "true"
            }),
            E[9] || (E[9] = $("span", null, "View in Keeper", -1))
          ]),
          _: 1
        }, 8, ["href"])) : Z("", !0)
      ]),
      z.value ? (S(), ae(f(He), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          ce(j(z.value), 1)
        ]),
        _: 1
      })) : Z("", !0),
      V(f(Lg), {
        value: C.value,
        "onUpdate:value": E[3] || (E[3] = (_) => C.value = _),
        class: "wf-run-tabs"
      }, {
        default: ne(() => [
          V(f(Pg), { "aria-label": "Run inspector sections" }, {
            default: ne(() => [
              V(f(Vl), { value: "overview" }, {
                default: ne(() => [...E[10] || (E[10] = [
                  ce("Overview", -1)
                ])]),
                _: 1
              }),
              V(f(Vl), { value: "timeline" }, {
                default: ne(() => [...E[11] || (E[11] = [
                  ce("Timeline", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      C.value === "timeline" ? (S(), ae(vT, {
        key: 1,
        "workflow-id": e.workflowId,
        "run-id": e.run.run_id
      }, null, 8, ["workflow-id", "run-id"])) : e.node ? (S(), R(ue, { key: 3 }, [
        $("div", ET, j(m.value), 1),
        N.value || D.value ? (S(), ae(f(Rs), {
          key: 0,
          header: "Technical details",
          toggleable: "",
          collapsed: "",
          class: "wf-run-tech"
        }, {
          default: ne(() => [
            $("p", xT, [
              N.value ? (S(), R("span", $T, j(N.value), 1)) : Z("", !0),
              N.value && D.value ? (S(), R("span", ST, " · ")) : Z("", !0),
              D.value ? (S(), R("span", CT, "process " + j(D.value), 1)) : Z("", !0)
            ])
          ]),
          _: 1
        })) : Z("", !0),
        e.nodeStatus ? (S(), R("p", NT, [
          V(f(yt), {
            class: "wf-run-status-tag",
            severity: B(e.nodeStatus),
            value: f(ro)(e.nodeStatus)
          }, null, 8, ["severity", "value"]),
          k.value ? (S(), R("span", IT, [
            V(f(ie), {
              icon: "tabler:clock",
              "aria-hidden": "true"
            }),
            ce(j(k.value), 1)
          ])) : Z("", !0)
        ])) : Z("", !0),
        o.value ? (S(), R("div", AT, [
          V(f(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading step data"
          }),
          E[12] || (E[12] = $("span", null, "Loading this step’s data…", -1))
        ])) : a.value ? (S(), ae(f(He), {
          key: 3,
          severity: "error",
          closable: !1
        }, {
          default: ne(() => [
            ce(j(a.value), 1)
          ]),
          _: 1
        })) : r.value ? (S(), R(ue, { key: 4 }, [
          r.value.error ? (S(), R("div", MT, [
            $("div", TT, [
              V(f(ie), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              $("span", null, j(r.value.error.message), 1)
            ]),
            r.value.error.code ? (S(), R("span", OT, j(r.value.error.code), 1)) : Z("", !0),
            r.value.error.hasDetail ? r.value.error.detail != null ? (S(), ae(Fn, {
              key: 2,
              value: r.value.error.detail,
              label: "Error detail",
              icon: "tabler:alert-triangle",
              open: !1
            }, null, 8, ["value"])) : Z("", !0) : (S(), R("p", RT, "No further detail was recorded for this failure. Re-run with the same input to try again, or open the step to adjust it."))
          ])) : Z("", !0),
          r.value.input != null ? (S(), ae(Fn, {
            key: 1,
            value: r.value.input,
            label: "Input",
            icon: "tabler:login-2"
          }, null, 8, ["value"])) : Z("", !0),
          w.value ? (S(), ae(Fn, {
            key: 2,
            value: r.value.output,
            label: "Output",
            icon: "tabler:logout-2"
          }, null, 8, ["value"])) : Z("", !0),
          r.value.agentActions.length ? (S(), R("section", DT, [
            $("div", PT, [
              V(f(ie), {
                icon: "tabler:robot",
                "aria-hidden": "true"
              }),
              E[13] || (E[13] = $("span", null, "Agent trace", -1))
            ]),
            (S(!0), R(ue, null, Re(r.value.agentActions, (_, L) => (S(), R("div", {
              key: L,
              class: "wf-run-trace-item"
            }, [
              $("p", LT, j(_.toolCalls.length ? `Called ${_.toolCalls.length} tool${_.toolCalls.length === 1 ? "" : "s"}` : "No tools were called — the model answered directly."), 1),
              _.toolCalls.length ? (S(), R(ue, { key: 0 }, [
                $("ul", VT, [
                  (S(!0), R(ue, null, Re(_.toolCalls, (F, J) => (S(), R("li", { key: J }, [
                    $("strong", null, j(h(F)), 1),
                    p(F) && p(F) !== h(F) ? (S(), R("span", BT, " · " + j(p(F)), 1)) : Z("", !0),
                    d(F) ? (S(), R("code", zT, j(d(F)), 1)) : Z("", !0)
                  ]))), 128))
                ]),
                V(Fn, {
                  value: _.toolCalls,
                  label: "Tool call details",
                  icon: "tabler:tool",
                  open: !1
                }, null, 8, ["value"])
              ], 64)) : Z("", !0),
              V(Fn, {
                value: _.raw,
                label: "Generation",
                icon: "tabler:sparkles",
                open: !1
              }, null, 8, ["value"])
            ]))), 128))
          ])) : Z("", !0),
          x.value ? Z("", !0) : (S(), R("p", FT, "This step recorded no input or output in this run."))
        ], 64)) : Z("", !0)
      ], 64)) : (S(), R("p", kT, "Click a step on the canvas to see what it received and produced in this run."))
    ]));
  }
}), HT = {
  key: 0,
  class: "wf-runs-loading"
}, qT = {
  key: 2,
  class: "wf-sim-note"
}, UT = {
  key: 3,
  class: "wf-runs-list"
}, WT = { class: "wf-runs-meta" }, YT = { class: "wf-runs-time" }, GT = { class: "wf-runs-id" }, jT = ["title"], XT = {
  class: "wf-runs-duration",
  title: "Duration"
}, KT = /* @__PURE__ */ ye({
  __name: "RunsPanel",
  props: {
    rows: {},
    loading: { type: Boolean },
    error: {}
  },
  emits: ["select", "close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => $g(n.rows).map((s) => ({
      row: s,
      ver: Qn(s.flow_ref?.version ?? 0),
      cause: Id(s),
      duration: s.started_at && s.finished_at ? Td(Date.parse(s.finished_at) - Date.parse(s.started_at)) : "—"
    })));
    function r(s) {
      const l = As(s);
      return l === "ok" ? "success" : l === "error" ? "danger" : "info";
    }
    function a(s) {
      s || i("close");
    }
    return (s, l) => (S(), ae(f(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      header: "Runs",
      class: "wf-sim-pop wf-runs-pop",
      "onUpdate:visible": a
    }, {
      default: ne(() => [
        e.loading ? (S(), R("div", HT, [
          V(f(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading runs"
          }),
          l[0] || (l[0] = $("span", null, "Loading runs…", -1))
        ])) : e.error ? (S(), ae(f(He), {
          key: 1,
          severity: "error",
          closable: !1
        }, {
          default: ne(() => [
            ce(j(e.error), 1)
          ]),
          _: 1
        })) : o.value.length ? (S(), R("div", UT, [
          (S(!0), R(ue, null, Re(o.value, ({ row: c, ver: u, cause: d, duration: h }) => (S(), ae(f(fe), {
            key: c.run_id,
            class: "wf-runs-row",
            text: "",
            severity: "secondary",
            onClick: (p) => i("select", c)
          }, {
            default: ne(() => [
              V(f(yt), {
                class: "wf-run-status-tag",
                severity: r(f(ao)(c)),
                value: f(ro)(f(ao)(c))
              }, null, 8, ["severity", "value"]),
              $("span", WT, [
                $("span", YT, "Started " + j(f(Qt)(c.started_at || c.finished_at)), 1),
                $("span", GT, j(f(Ms)(c.run_id)), 1),
                d ? (S(), R("span", {
                  key: 0,
                  class: "wf-runs-cause",
                  title: d
                }, j(d), 9, jT)) : Z("", !0)
              ]),
              $("span", XT, j(h), 1),
              V(f(yt), {
                class: "wf-run-version-tag",
                severity: u.kind === "published" ? "secondary" : "warn",
                value: u.label,
                title: u.title
              }, null, 8, ["severity", "value", "title"]),
              V(f(ie), {
                icon: "tabler:chevron-right",
                class: "wf-runs-go",
                "aria-hidden": "true"
              })
            ]),
            _: 2
          }, 1032, ["onClick"]))), 128))
        ])) : (S(), R("p", qT, "No runs yet — Simulate, or publish and trigger this Workflow, to see runs here."))
      ]),
      _: 1
    }));
  }
});
function ZT(e, t) {
  return t == null ? !1 : e > t;
}
function La(e, t) {
  return t ?? e.length;
}
function JT(e) {
  const t = e?.input_keys ?? [], n = e?.output_keys ?? [], i = e?.error_keys ?? [], o = La(t, e?.input_count), r = La(n, e?.output_count), a = La(i, e?.error_count);
  return {
    input: t,
    output: n,
    error: i,
    inputCount: o,
    outputCount: r,
    errorCount: a,
    empty: o === 0 && r === 0 && a === 0
  };
}
function Va(e, t) {
  return e.length ? e.join(", ") : t > 0 ? `${t} field${t === 1 ? "" : "s"}` : "none";
}
function QT(e) {
  return `Restore v${e} as a new unpublished draft. This never changes version history.`;
}
function eO(e, t) {
  if (!e) return t;
  for (const o of ["title", "name", "label"])
    if (typeof e[o] == "string" && e[o]) return e[o];
  const n = typeof e.source_id == "string" ? e.source_id : "", i = typeof e.target_id == "string" ? e.target_id : "";
  return n && i ? `${n} → ${i}` : t;
}
function tO(e) {
  return e.map((t) => ({ id: t.id, name: eO(t.after || t.before, t.id) }));
}
function nO(e) {
  if (typeof e == "string" && e) return e;
  if (!e || typeof e != "object" || Array.isArray(e)) return "Input or result changed.";
  const t = e, n = typeof t.field == "string" ? t.field : typeof t.key == "string" ? t.key : "Input or result", i = typeof t.type == "string" ? t.type : typeof t.kind == "string" ? t.kind : "changed";
  return `${n}: ${i}`;
}
function oO(e) {
  const t = e.graph;
  return e.interface.changes.length > 0 || Object.values(t.nodes).some((n) => n.length > 0) || Object.values(t.edges).some((n) => n.length > 0);
}
const iO = {
  key: 0,
  class: "wf-runs-loading"
}, rO = {
  key: 0,
  class: "wf-sim-note"
}, aO = { key: 0 }, sO = { key: 1 }, lO = { class: "wf-vers-list" }, uO = { class: "wf-vers-meta" }, cO = { class: "wf-vers-when" }, dO = {
  key: 0,
  class: "wf-vers-current"
}, fO = { class: "wf-vers-who" }, hO = {
  key: 0,
  class: "wf-vers-detail"
}, pO = {
  key: 0,
  class: "wf-runs-loading"
}, vO = { class: "wf-vers-detail-h" }, mO = { class: "wf-vers-detail-title" }, gO = {
  key: 0,
  class: "wf-sim-note"
}, yO = {
  key: 1,
  class: "wf-vers-io"
}, wO = { class: "wf-vers-io-row" }, bO = { class: "wf-vers-io-row" }, _O = { class: "wf-vers-io-row" }, kO = { class: "wf-vers-actions" }, EO = {
  key: 0,
  class: "wf-vers-compare"
}, xO = {
  key: 3,
  class: "wf-vers-diff",
  "aria-label": "Changes between versions"
}, $O = { class: "wf-vers-detail-h" }, SO = { class: "wf-vers-detail-title" }, CO = {
  key: 0,
  class: "wf-panel-hint"
}, NO = /* @__PURE__ */ ye({
  __name: "VersionHistoryPanel",
  props: {
    workflowId: {},
    definitionEditSeq: {}
  },
  emits: ["close", "restore"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(!1), r = Y(""), a = Y([]), s = Y(null), l = Y(null), c = Y(!1), u = Y(""), d = Y(null), h = Y(null), p = Y(!1), v = Y(""), g = Y(!1), m = Y(""), k = Ld();
    async function x() {
      o.value = !0, r.value = "";
      try {
        a.value = await Vd(n.workflowId), a.value.length && w(a.value[0].version);
      } catch (E) {
        r.value = qe(E, "Couldn’t load version history.");
      } finally {
        o.value = !1;
      }
    }
    async function w(E) {
      s.value = E, l.value = null, u.value = "", h.value = null, v.value = "", c.value = !0;
      try {
        const _ = await Bd(n.workflowId, E);
        if (s.value !== E) return;
        l.value = _;
      } catch (_) {
        u.value = qe(_, "Couldn’t load this version.");
      } finally {
        s.value === E && (c.value = !1);
      }
    }
    Ue(x), _e(() => n.workflowId, () => {
      s.value = null, l.value = null, x();
    });
    const b = U(() => a.value[0] ?? null), C = U(() => ZT(n.definitionEditSeq, b.value?.def_seq)), I = U(() => l.value ? JT(l.value.interface) : null), z = U(() => {
      const E = a.value.findIndex((_) => _.version === s.value);
      return E >= 0 ? a.value[E + 1]?.version ?? null : null;
    }), T = U(() => d.value || z.value), O = U(() => a.value.filter((E) => E.version !== s.value)), D = U(() => [
      { label: "previous version", value: null },
      ...O.value.map((E) => ({ label: `v${E.version}`, value: E.version }))
    ]);
    async function B() {
      if (!(s.value == null || T.value == null || p.value)) {
        p.value = !0, v.value = "", h.value = null;
        try {
          const E = Math.min(s.value, T.value), _ = Math.max(s.value, T.value);
          h.value = await Tg(n.workflowId, E, _);
        } catch (E) {
          v.value = qe(E, "Couldn’t load this version diff.");
        } finally {
          p.value = !1;
        }
      }
    }
    async function N() {
      if (!(s.value == null || g.value)) {
        g.value = !0, m.value = "";
        try {
          i("restore", await Og(n.workflowId, s.value));
        } catch (E) {
          m.value = qe(E, "Couldn’t restore this version as a new draft.");
        } finally {
          g.value = !1;
        }
      }
    }
    function H() {
      if (s.value == null || g.value) return;
      const E = {
        group: "version-restore",
        header: "Restore as new draft",
        message: QT(s.value),
        rejectLabel: "Cancel",
        acceptLabel: "Create new draft",
        accept: () => {
          N();
        }
      };
      k.require(E);
    }
    function y(E) {
      E || i("close");
    }
    return (E, _) => (S(), R(ue, null, [
      V(f(zd), { group: "version-restore" }),
      V(f(Jt), {
        visible: !0,
        modal: "",
        "dismissable-mask": "",
        header: "Version history",
        class: "wf-sim-pop wf-vers-pop",
        "onUpdate:visible": y
      }, {
        default: ne(() => [
          o.value ? (S(), R("div", iO, [
            V(f(dt), {
              class: "wf-status-spinner",
              "stroke-width": "4",
              "aria-label": "Loading versions"
            }),
            _[1] || (_[1] = $("span", null, "Loading versions…", -1))
          ])) : r.value ? (S(), ae(f(He), {
            key: 1,
            severity: "error",
            closable: !1
          }, {
            default: ne(() => [
              ce(j(r.value), 1)
            ]),
            _: 1
          })) : (S(), R(ue, { key: 2 }, [
            a.value.length ? (S(), R(ue, { key: 1 }, [
              $("p", {
                class: Ie(["wf-vers-draft", C.value ? "is-pending" : "is-clean"]),
                role: "status"
              }, [
                V(f(ie), {
                  icon: C.value ? "tabler:pencil" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                C.value ? (S(), R("span", aO, "Draft has unpublished edits since v" + j(b.value?.version) + ".", 1)) : (S(), R("span", sO, "Draft matches v" + j(b.value?.version) + " — nothing to publish.", 1))
              ], 2),
              $("div", lO, [
                (S(!0), R(ue, null, Re(a.value, (L, F) => (S(), ae(f(fe), {
                  key: L.version,
                  class: Ie(["wf-vers-row", L.version === s.value && "is-selected"]),
                  text: "",
                  severity: "secondary",
                  onClick: (J) => w(L.version)
                }, {
                  default: ne(() => [
                    V(f(yt), {
                      class: "wf-version-tag",
                      severity: "secondary",
                      value: `v${L.version}`
                    }, null, 8, ["value"]),
                    $("span", uO, [
                      $("span", cO, [
                        ce(j(f(Qt)(L.created_at)), 1),
                        F === 0 ? (S(), R("span", dO, "Current")) : Z("", !0)
                      ]),
                      $("span", fO, j(L.created_by || "Unknown"), 1)
                    ]),
                    V(f(ie), {
                      icon: "tabler:chevron-right",
                      class: "wf-runs-go",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 2
                }, 1032, ["class", "onClick"]))), 128))
              ]),
              s.value != null ? (S(), R("section", hO, [
                c.value ? (S(), R("div", pO, [
                  V(f(dt), {
                    class: "wf-status-spinner",
                    "stroke-width": "4",
                    "aria-label": `Loading version ${s.value}`
                  }, null, 8, ["aria-label"]),
                  $("span", null, "Loading v" + j(s.value) + "…", 1)
                ])) : u.value ? (S(), ae(f(He), {
                  key: 1,
                  severity: "error",
                  closable: !1
                }, {
                  default: ne(() => [
                    ce(j(u.value), 1)
                  ]),
                  _: 1
                })) : l.value && I.value ? (S(), R(ue, { key: 2 }, [
                  $("div", vO, [
                    $("span", mO, "v" + j(l.value.version) + " inputs and results", 1),
                    _[2] || (_[2] = $("span", { class: "wf-vers-detail-note" }, "Read-only", -1))
                  ]),
                  I.value.empty ? (S(), R("p", gO, "This version does not define expected input, a result, or error details.")) : (S(), R("dl", yO, [
                    $("div", wO, [
                      _[3] || (_[3] = $("dt", null, "In", -1)),
                      $("dd", null, j(f(Va)(I.value.input, I.value.inputCount)), 1)
                    ]),
                    $("div", bO, [
                      _[4] || (_[4] = $("dt", null, "Out", -1)),
                      $("dd", null, j(f(Va)(I.value.output, I.value.outputCount)), 1)
                    ]),
                    $("div", _O, [
                      _[5] || (_[5] = $("dt", null, "Error", -1)),
                      $("dd", null, j(f(Va)(I.value.error, I.value.errorCount)), 1)
                    ])
                  ])),
                  $("div", kO, [
                    O.value.length ? (S(), R("label", EO, [
                      _[6] || (_[6] = ce("Compare with ", -1)),
                      V(f(St), {
                        modelValue: d.value,
                        "onUpdate:modelValue": _[0] || (_[0] = (L) => d.value = L),
                        options: D.value,
                        "option-label": "label",
                        "option-value": "value",
                        "aria-label": "Compare with version"
                      }, null, 8, ["modelValue", "options"])
                    ])) : Z("", !0),
                    V(f(fe), {
                      severity: "secondary",
                      outlined: "",
                      disabled: !T.value || p.value,
                      loading: p.value,
                      onClick: B
                    }, {
                      default: ne(() => [
                        p.value ? Z("", !0) : (S(), ae(f(ie), {
                          key: 0,
                          icon: "tabler:git-compare",
                          "aria-hidden": "true"
                        })),
                        _[7] || (_[7] = $("span", null, "Compare", -1))
                      ]),
                      _: 1
                    }, 8, ["disabled", "loading"]),
                    V(f(fe), {
                      disabled: g.value,
                      loading: g.value,
                      onClick: H
                    }, {
                      default: ne(() => [
                        g.value ? Z("", !0) : (S(), ae(f(ie), {
                          key: 0,
                          icon: "tabler:history-up",
                          "aria-hidden": "true"
                        })),
                        _[8] || (_[8] = $("span", null, "Restore as new draft", -1))
                      ]),
                      _: 1
                    }, 8, ["disabled", "loading"])
                  ]),
                  m.value ? (S(), ae(f(He), {
                    key: 2,
                    severity: "error",
                    closable: !1
                  }, {
                    default: ne(() => [
                      ce(j(m.value), 1)
                    ]),
                    _: 1
                  })) : Z("", !0),
                  h.value ? (S(), R("section", xO, [
                    $("div", $O, [
                      $("span", SO, "Changes from v" + j(h.value.from_version) + " to v" + j(h.value.to_version), 1),
                      _[9] || (_[9] = $("span", { class: "wf-vers-detail-note" }, "Read-only", -1))
                    ]),
                    f(oO)(h.value) ? (S(), R(ue, { key: 1 }, [
                      h.value.interface.changes.length ? (S(), ae(f(He), {
                        key: 0,
                        class: "wf-vers-compat",
                        severity: "warn",
                        closable: !1
                      }, {
                        default: ne(() => [
                          V(f(ie), {
                            icon: "tabler:alert-triangle",
                            "aria-hidden": "true"
                          }),
                          $("div", null, [
                            _[10] || (_[10] = $("strong", null, "Expected input or result changed", -1)),
                            (S(!0), R(ue, null, Re(h.value.interface.changes, (L, F) => (S(), R("span", { key: F }, j(f(nO)(L)), 1))), 128))
                          ])
                        ]),
                        _: 1
                      })) : Z("", !0),
                      (S(!0), R(ue, null, Re([{ label: "Steps added", rows: h.value.graph.nodes.added }, { label: "Steps removed", rows: h.value.graph.nodes.removed }, { label: "Steps changed", rows: h.value.graph.nodes.changed }, { label: "Connections added", rows: h.value.graph.edges.added }, { label: "Connections removed", rows: h.value.graph.edges.removed }, { label: "Connections changed", rows: h.value.graph.edges.changed }], (L) => wd((S(), R("div", {
                        key: L.label,
                        class: "wf-vers-diff-group"
                      }, [
                        $("strong", null, j(L.label), 1),
                        (S(!0), R(ue, null, Re(f(tO)(L.rows), (F) => (S(), R("span", {
                          key: F.id
                        }, j(F.name), 1))), 128))
                      ])), [
                        [Ym, L.rows.length]
                      ])), 128))
                    ], 64)) : (S(), R("p", CO, "No input, result, step, or connection changes were recorded."))
                  ])) : Z("", !0)
                ], 64)) : Z("", !0)
              ])) : Z("", !0)
            ], 64)) : (S(), R("p", rO, " No versions published yet. Publish to save the current Workflow as v1; you can keep editing it as a draft. "))
          ], 64))
        ]),
        _: 1
      })
    ], 64));
  }
}), IO = {
  "aria-label": "Run published Workflow",
  class: "wf-published-run"
}, AO = {
  key: 0,
  role: "alert"
}, MO = {
  key: 1,
  role: "status"
}, TO = {
  key: 0,
  role: "alert"
}, OO = /* @__PURE__ */ ye({
  __name: "PublishedRunPanel",
  props: {
    workflowId: {},
    publishedVersion: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(null), r = Y({}), a = Y(!0), s = Y(!1), l = Y("");
    let c = 0;
    const u = U(() => JSON.stringify({ kind: "workflow", flow_ref: { kind: "flow", id: n.workflowId, version: n.publishedVersion }, input: r.value }));
    async function d() {
      const h = ++c;
      s.value = !1, l.value = "", r.value = {}, a.value = !0;
      try {
        if (!n.workflowId || !Number.isInteger(n.publishedVersion) || n.publishedVersion < 1) throw new Error("Publish this Workflow before running a published version");
        const p = await Bd(n.workflowId, n.publishedVersion);
        if (h !== c) return;
        if (p.version !== n.publishedVersion) throw new Error("Published version does not match the request");
        o.value = p.input_schema, s.value = !0;
      } catch (p) {
        h === c && (l.value = Fa(p, "Could not read the published Workflow"));
      }
    }
    return _e(() => [n.workflowId, n.publishedVersion], () => {
      d();
    }, { immediate: !0 }), Qe(() => {
      c += 1;
    }), (h, p) => (S(), R("section", IO, [
      $("header", null, [
        p[3] || (p[3] = $("h2", null, "Run published Workflow", -1)),
        $("button", {
          type: "button",
          class: "p-button p-button-secondary",
          onClick: p[0] || (p[0] = (v) => i("close"))
        }, "Close published run")
      ]),
      $("p", null, "Run published version " + j(e.publishedVersion) + " with the selected account. Follow its progress in Past runs.", 1),
      l.value ? (S(), R("p", AO, j(l.value), 1)) : s.value ? (S(), R(ue, { key: 2 }, [
        V(Ds, {
          mode: "value",
          schema: o.value,
          "model-value": r.value,
          "reset-key": f(c),
          rows: 5,
          "onUpdate:modelValue": p[1] || (p[1] = (v) => r.value = v),
          onValid: p[2] || (p[2] = (v) => a.value = v)
        }, null, 8, ["schema", "model-value", "reset-key"]),
        a.value ? Z("", !0) : (S(), R("p", TO, "Fix the input before queuing a run.")),
        a.value ? (S(), ae(ri, {
          key: 1,
          tag: "wc-manual-task-launcher",
          attrs: { target: u.value, parent: e.workflowId, title: "Published Workflow run" }
        }, null, 8, ["attrs"])) : Z("", !0)
      ], 64)) : (S(), R("p", MO, "Loading published input…"))
    ]));
  }
}), RO = { class: "wf-trigger-description" }, DO = { class: "wf-trigger-body" }, PO = {
  key: 2,
  class: "wf-trigger-loading"
}, LO = /* @__PURE__ */ ye({
  __name: "AddTriggerPanel",
  props: {
    workflowId: {},
    publishedVersion: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => QC(n.workflowId, n.publishedVersion)), r = Y(!1), a = Y("");
    Ue(async () => {
      try {
        await Xi(o.value.tag, { timeoutMs: 8e3 }), r.value = !0;
      } catch {
        a.value = "Couldn’t load the triggers. Try again from Automations.";
      }
    });
    function s(l) {
      l || i("close");
    }
    return (l, c) => (S(), ae(f(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      header: f(ZC),
      class: "wf-trigger-modal",
      "onUpdate:visible": s
    }, {
      default: ne(() => [
        $("p", RO, j(f(JC)), 1),
        $("div", DO, [
          r.value ? (S(), ae(Xt(o.value.tag), oo({ key: 0 }, o.value.attrs, {
            onClose: c[0] || (c[0] = (u) => i("close"))
          }), null, 16)) : a.value ? (S(), ae(f(He), {
            key: 1,
            class: "wf-setup-error",
            severity: "error",
            closable: !1
          }, {
            default: ne(() => [
              ce(j(a.value), 1)
            ]),
            _: 1
          })) : (S(), R("div", PO, [
            V(f(dt), {
              class: "wf-status-spinner",
              "stroke-width": "4",
              "aria-label": "Loading triggers"
            }),
            c[1] || (c[1] = $("span", null, "Loading triggers…", -1))
          ]))
        ])
      ]),
      _: 1
    }, 8, ["header"]));
  }
}), VO = {
  key: 0,
  class: "wf-callpick-selected"
}, BO = { class: "wf-callpick-selected-top" }, zO = { class: "wf-callpick-badges" }, FO = { class: "wf-callpick-io" }, HO = { class: "wf-callpick-ico" }, qO = { class: "wf-callpick-main" }, UO = { class: "wf-callpick-title" }, WO = { class: "wf-callpick-meta" }, YO = { key: 0 }, GO = { key: 1 }, jO = { class: "wf-callpick-schema" }, XO = ["title"], KO = /* @__PURE__ */ ye({
  __name: "FlowPicker",
  props: {
    workflowId: {},
    selectedId: {},
    upstreamSchema: {}
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(!1), r = Y(""), a = Y([]);
    async function s() {
      o.value = !0, r.value = "";
      try {
        const m = await $d({ filter: "published" });
        a.value = m.map((k) => ag(k, {}, [], n.workflowId)).filter((k) => k.callable && !!k.published_version);
      } catch (m) {
        r.value = m instanceof Error ? m.message : "Could not load Workflows.";
      } finally {
        o.value = !1;
      }
    }
    Ue(s), _e(() => n.workflowId, s);
    function l(m, k) {
      return m.title.toLowerCase().includes(k) || m.trigger_label.toLowerCase().includes(k) || m.id.toLowerCase().includes(k);
    }
    const c = U(() => a.value.find((m) => m.id === n.selectedId) || null);
    function u(m) {
      return al(n.upstreamSchema, m.input_schema);
    }
    function d(m) {
      const k = u(m).status;
      return k === "error" ? "tabler:alert-triangle" : k === "ok" ? "tabler:circle-check" : "tabler:circle-dashed";
    }
    function h(m) {
      const k = u(m);
      return k.status === "error" ? k.message || "Needs mapping" : k.status === "ok" ? "Input matches" : "Input unknown";
    }
    function p(m) {
      return [m.id === n.selectedId && "is-selected", m.is_current && "is-current"];
    }
    function v(m) {
      return m.is_current;
    }
    function g(m) {
      return m.id === n.selectedId;
    }
    return (m, k) => (S(), ae(rg, {
      rows: a.value,
      loading: o.value,
      error: r.value,
      matches: l,
      placeholder: "Search published Workflows",
      "empty-message": "No published Workflows available.",
      "root-class": "wf-callpick",
      "search-class": "wf-callpick-search",
      "note-class": "wf-panel-note",
      "error-class": "wf-field-err",
      "list-class": "wf-callpick-list",
      "row-class": "wf-callpick-row",
      "row-extra-class": p,
      "is-disabled": v,
      "is-emphasized": g,
      "empty-class": "wf-palette-empty",
      onSelect: k[0] || (k[0] = (x) => i("select", x))
    }, {
      "before-list": ne(() => [
        c.value ? (S(), R("div", VO, [
          $("div", BO, [
            V(f(ie), {
              icon: "tabler:route",
              "aria-hidden": "true"
            }),
            $("span", null, j(c.value.title), 1)
          ]),
          $("div", zO, [
            V(f(yt), {
              class: "wf-callpick-badge",
              severity: "success",
              value: `Published v${c.value.published_version}`
            }, null, 8, ["value"]),
            c.value.has_draft_changes ? (S(), ae(f(yt), {
              key: 0,
              class: "wf-callpick-badge",
              severity: "warn",
              value: "Draft changes"
            })) : Z("", !0)
          ]),
          $("div", FO, [
            $("span", null, [
              k[1] || (k[1] = $("strong", null, "In", -1)),
              ce(j(c.value.input_summary), 1)
            ]),
            $("span", null, [
              k[2] || (k[2] = $("strong", null, "Child out", -1)),
              ce(j(c.value.output_summary), 1)
            ]),
            k[3] || (k[3] = $("span", null, [
              $("strong", null, "Step out"),
              ce("Run details")
            ], -1))
          ])
        ])) : Z("", !0)
      ]),
      row: ne(({ item: x }) => [
        $("span", HO, [
          V(f(ie), {
            icon: "tabler:route",
            "aria-hidden": "true"
          })
        ]),
        $("span", qO, [
          $("span", UO, j(x.title), 1),
          $("span", WO, [
            x.is_current ? (S(), R("span", YO, "Current")) : Z("", !0),
            $("span", null, "v" + j(x.published_version), 1),
            x.has_draft_changes ? (S(), R("span", GO, "Draft")) : Z("", !0)
          ]),
          $("span", jO, [
            $("span", null, [
              k[4] || (k[4] = $("strong", null, "In", -1)),
              ce(j(x.input_summary), 1)
            ]),
            $("span", null, [
              k[5] || (k[5] = $("strong", null, "Out", -1)),
              ce(j(x.output_summary), 1)
            ])
          ])
        ]),
        $("span", {
          class: Ie(["wf-callpick-compat", `is-${u(x).status}`]),
          title: h(x)
        }, [
          V(f(ie), {
            icon: d(x),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ], 10, XO)
      ]),
      _: 1
    }, 8, ["rows", "loading", "error"]));
  }
}), ZO = {
  class: "wf-retries",
  "aria-label": "Retries"
}, JO = { class: "wf-retry-heading" }, QO = { class: "wf-panel-hint" }, eR = { class: "wf-retry-field" }, tR = { class: "wf-panel-hint" }, nR = ["for"], oR = { class: "wf-panel-hint" }, iR = { class: "wf-retry-field" }, rR = { class: "wf-panel-hint" }, aR = { class: "wf-retry-field" }, sR = { class: "wf-panel-hint" }, lR = { class: "wf-retry-heading" }, uR = ["for"], cR = {
  key: 0,
  class: "wf-panel-hint",
  role: "alert"
}, dR = { class: "wf-panel-hint" }, fR = /* @__PURE__ */ ye({
  __name: "RetryPolicyPanel",
  props: {
    node: {},
    execution: {}
  },
  emits: ["update-node"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => n.node.retry_policy || n.execution.retry_policy || void 0), r = U(() => n.execution.retry_policy || void 0), a = U(() => o.value?.maximum_attempts === 0), s = U(() => a.value && !h(n.node.schedule_to_close_timeout || n.execution.schedule_to_close_timeout).trim()), l = ["NotFound", "AlreadyExists", "Invalid", "PermissionDenied", "Unavailable", "Internal", "Canceled", "Conflict", "Timeout", "RateLimited"], c = [
      { field: "initial_interval", label: "Initial interval", default: "1s" },
      { field: "maximum_interval", label: "Maximum interval", default: "100 × initial interval" }
    ], u = [
      { field: "start_to_close_timeout", label: "Per-attempt timeout" },
      { field: "schedule_to_close_timeout", label: "Total window" }
    ];
    function d(v, g) {
      const m = { ...o.value, [v]: g };
      g === void 0 && delete m[v], i("update-node", { retry_policy: m });
    }
    function h(v) {
      return typeof v == "number" ? `${v}ms` : String(v ?? "");
    }
    function p(v) {
      return v.target.value.trim();
    }
    return (v, g) => (S(), R("section", ZO, [
      $("div", JO, [
        g[5] || (g[5] = $("h3", { class: "wf-panel-label" }, "Retries", -1)),
        e.node.retry_policy ? (S(), ae(f(fe), {
          key: 1,
          label: "Reset",
          "aria-label": "Reset retry policy",
          size: "small",
          text: "",
          onClick: g[1] || (g[1] = (m) => i("update-node", { retry_policy: !1 }))
        })) : (S(), ae(f(fe), {
          key: 0,
          label: "Override",
          "aria-label": "Override retry policy",
          size: "small",
          text: "",
          onClick: g[0] || (g[0] = (m) => i("update-node", { retry_policy: { ...r.value } }))
        }))
      ]),
      $("p", QO, j(o.value ? "Maximum attempts includes the first attempt and defaults to 3. A zero attempt limit requires a total window." : "One attempt. Override the retry policy to retry failed attempts."), 1),
      o.value ? (S(), R(ue, { key: 0 }, [
        $("div", eR, [
          g[6] || (g[6] = $("label", {
            class: "wf-retry-label",
            for: "wf-retry-attempts"
          }, "Maximum attempts", -1)),
          V(f(so), {
            "input-id": "wf-retry-attempts",
            class: "wf-input",
            "input-class": "wf-input",
            "model-value": o.value.maximum_attempts ?? 3,
            "aria-label": "Maximum attempts",
            "use-grouping": !1,
            min: 0,
            max: Number.MAX_SAFE_INTEGER,
            "max-fraction-digits": 0,
            "onUpdate:modelValue": g[2] || (g[2] = (m) => d("maximum_attempts", m ?? void 0))
          }, null, 8, ["model-value", "max"]),
          $("p", tR, "Block default: " + j(r.value ? r.value.maximum_attempts ?? 3 : "one attempt"), 1)
        ]),
        (S(), R(ue, null, Re(c, (m) => $("div", {
          key: m.field,
          class: "wf-retry-field"
        }, [
          $("label", {
            class: "wf-retry-label",
            for: `wf-retry-${m.field}`
          }, j(m.label), 9, nR),
          V(f(rt), {
            id: `wf-retry-${m.field}`,
            class: "wf-input",
            "model-value": h(o.value[m.field]),
            "aria-label": m.label,
            placeholder: m.default,
            onChange: (k) => d(m.field, p(k) || void 0)
          }, null, 8, ["id", "model-value", "aria-label", "placeholder", "onChange"]),
          $("p", oR, "Block default: " + j(h(r.value?.[m.field]) || (r.value ? m.default : "no policy")), 1)
        ])), 64)),
        $("div", iR, [
          g[7] || (g[7] = $("label", {
            class: "wf-retry-label",
            for: "wf-retry-backoff"
          }, "Backoff coefficient", -1)),
          V(f(so), {
            "input-id": "wf-retry-backoff",
            class: "wf-input",
            "input-class": "wf-input",
            "model-value": o.value.backoff_coefficient ?? 2,
            "aria-label": "Backoff coefficient",
            min: 1,
            "max-fraction-digits": 6,
            "use-grouping": !1,
            "onUpdate:modelValue": g[3] || (g[3] = (m) => d("backoff_coefficient", m ?? void 0))
          }, null, 8, ["model-value"]),
          $("p", rR, "Block default: " + j(r.value ? r.value.backoff_coefficient ?? 2 : "no policy"), 1)
        ]),
        $("div", aR, [
          g[8] || (g[8] = $("span", {
            id: "wf-retry-kinds-label",
            class: "wf-retry-label"
          }, "Non-retryable error kinds", -1)),
          V(f(Ts), {
            class: "wf-retry-kinds",
            "model-value": o.value.non_retryable_error_types || [],
            options: l,
            multiple: "",
            "aria-labelledby": "wf-retry-kinds-label",
            "onUpdate:modelValue": g[4] || (g[4] = (m) => d("non_retryable_error_types", m ?? []))
          }, null, 8, ["model-value"]),
          $("p", sR, "Block default: " + j(r.value?.non_retryable_error_types?.join(", ") || "none"), 1)
        ])
      ], 64)) : Z("", !0),
      (S(), R(ue, null, Re(u, (m) => $("div", {
        key: m.field,
        class: "wf-retry-field"
      }, [
        $("div", lR, [
          $("label", {
            class: "wf-retry-label",
            for: `wf-retry-${m.field}`
          }, j(m.label), 9, uR),
          e.node[m.field] !== void 0 && e.node[m.field] !== !1 ? (S(), ae(f(fe), {
            key: 0,
            label: "Reset",
            "aria-label": `Reset ${m.label.toLowerCase()}`,
            text: "",
            size: "small",
            onClick: (k) => i("update-node", { [m.field]: !1 })
          }, null, 8, ["aria-label", "onClick"])) : Z("", !0)
        ]),
        V(f(rt), {
          id: `wf-retry-${m.field}`,
          class: "wf-input",
          "model-value": h(e.node[m.field] || e.execution[m.field]),
          "aria-label": m.label,
          "aria-required": m.field === "schedule_to_close_timeout" && a.value,
          invalid: m.field === "schedule_to_close_timeout" && s.value,
          placeholder: "No timeout",
          onChange: (k) => i("update-node", { [m.field]: p(k) || !1 })
        }, null, 8, ["id", "model-value", "aria-label", "aria-required", "invalid", "onChange"]),
        m.field === "schedule_to_close_timeout" && s.value ? (S(), R("p", cR, "A zero attempt limit requires a positive total window.")) : Z("", !0),
        $("p", dR, "Block default: " + j(h(e.execution[m.field]) || "no timeout") + ". Use durations such as 500ms or 30s.", 1)
      ])), 64))
    ]));
  }
});
function Mp(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
const hR = 8;
function pR(e, t) {
  const n = Mp(t), i = Number(n.batch_size), o = Number.isFinite(i) && i > 0 ? i : hR, r = n.continue_on_error === !0;
  return { sourceKey: String(n.source_array_key || ""), batchSize: o, continueOnError: r };
}
function vR(e, t) {
  return { kind: "for_each", config: {
    ...Mp(e),
    source_array_key: t.sourceKey.trim(),
    batch_size: Math.max(1, Math.round(t.batchSize) || 1),
    continue_on_error: t.continueOnError
  } };
}
const mR = "Checked after every pass. Reference result (the last pass’s output), state or iteration — a bare name reads from state.", gR = "Safety cap. If the condition still holds after this many passes, the step fails with MAX_ITERATIONS_EXCEEDED — wire its Failed port to recover instead of ending the run. 0 uses the default (8).", yR = "Runs the same steps once per item of a list. Wire those steps from the “each item” port; the collected results continue from “all results”. How many run at the same time is the batch size below.", wR = "How many items run at the same time. Default 8.", bR = "Attempts every item and keeps going when one fails. The output is one entry per item, each carrying its result or its error { code, message }.", _R = "Stops at the first item that fails — that failure becomes this step’s failure (route it with the Failed port). The output is the results array in source order.", kR = "Runs the selected Workflow and waits for it to finish. Its result continues from the Finished port; if it fails, the Failed port carries { code, message }.";
function ER(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {};
  return typeof t.predicate == "string" ? t.predicate : "";
}
function xR(e, t) {
  return { ...e && typeof e == "object" && !Array.isArray(e) ? e : {}, predicate: t.trim() };
}
function $R(e) {
  return "config" in e;
}
const ni = "The assistant couldn’t draft these settings.";
async function SR(e) {
  let t;
  try {
    t = (await mn.post(`/api/v1/workflows/${encodeURIComponent(e.workflowId)}/assist/config`, {
      intent: e.intent,
      node_id: e.nodeId,
      ...e.upstreamSchema ? { upstream_schema: e.upstreamSchema } : {}
    }, { timeout: 105e3 })).data;
  } catch (i) {
    const o = i?.response?.data;
    return o && typeof o == "object" && (typeof o.message == "string" || typeof o.code == "string") ? { error: xn(o, ni) } : Rd(i) === 404 ? { error: Bl, unavailable: !0 } : o ? { error: xn(o, ni) } : { error: i instanceof Error && i.message ? i.message : ni };
  }
  if (!t || typeof t != "object") return { error: Bl, unavailable: !0 };
  const n = t;
  return n.success === !1 ? { error: xn(n, ni) } : !n.config || typeof n.config != "object" || Array.isArray(n.config) ? { error: "The assistant returned no settings." } : {
    config: n.config,
    notes: typeof n.notes == "string" && n.notes.trim() ? n.notes.trim() : void 0,
    ...n.config_schema && typeof n.config_schema == "object" && !Array.isArray(n.config_schema) ? { configSchema: n.config_schema } : {}
  };
}
const CR = {
  class: "wf-config-assist",
  "aria-label": "Describe this step"
}, NR = ["for"], IR = { class: "wf-config-assist__compose" }, AR = {
  key: 1,
  class: "wf-config-assist__preview",
  role: "region",
  "aria-label": "Drafted settings"
}, MR = { class: "wf-config-assist__preview-head" }, TR = {
  key: 0,
  class: "wf-config-assist__notes"
}, OR = { class: "wf-config-assist__changes" }, RR = {
  key: 0,
  class: "wf-config-assist__before"
}, DR = { class: "wf-config-assist__after" }, PR = { class: "wf-config-assist__actions" }, Ba = "This step changed while the draft was being prepared. Review the current settings and draft again.", Tp = /* @__PURE__ */ ye({
  __name: "ConfigAssist",
  props: {
    workflowId: {},
    resetKey: {},
    configSchema: {},
    currentConfig: {},
    upstreamSchema: {}
  },
  emits: ["accept", "undo"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(""), r = Y(!1), a = Y(""), s = Y(""), l = Y(null), c = Y(null), u = Y(null), d = Y(!1);
    let h = 0, p = "";
    function v(E) {
      const _ = /* @__PURE__ */ new WeakSet();
      function L(F, J) {
        if (J > 20) return "[max-depth]";
        if (!F || typeof F != "object") return F;
        if (_.has(F)) return "[cycle]";
        if (_.add(F), Array.isArray(F)) {
          const oe = F.map((se) => L(se, J + 1));
          return _.delete(F), oe;
        }
        const X = {};
        for (const oe of Object.keys(F).sort())
          X[oe] = L(F[oe], J + 1);
        return _.delete(F), X;
      }
      try {
        return JSON.stringify(L(E, 0));
      } catch {
        return "[unserializable]";
      }
    }
    const g = U(() => v([
      n.workflowId,
      n.resetKey,
      n.configSchema || {}
    ])), m = U(() => c.value || n.configSchema || {}), k = U(() => v(n.currentConfig)), x = U(() => v([
      n.workflowId,
      n.resetKey,
      n.configSchema,
      n.currentConfig
    ]));
    function w() {
      const E = r.value || l.value !== null;
      h += 1, p = "", o.value = "", r.value = !1, a.value = E ? Ba : "", s.value = "", l.value = null, c.value = null, u.value = null, d.value = !1;
    }
    _e(g, w, { flush: "sync" }), _e(k, (E) => {
      if (p && E === p) {
        p = "";
        return;
      }
      const _ = r.value || l.value !== null;
      h += 1, r.value = !1, l.value = null, s.value = "", u.value = null, d.value = !1, _ && (a.value = Ba);
    }, { flush: "sync" }), Qe(() => {
      h += 1;
    });
    function b(E, _) {
      return v(E) === v(_);
    }
    function C(E) {
      const _ = m.value.properties;
      if (_ && typeof _ == "object" && !Array.isArray(_)) {
        const L = _[E];
        if (L && typeof L == "object" && !Array.isArray(L)) {
          const F = L.title;
          if (typeof F == "string" && F.trim()) return F.trim();
        }
      }
      return E.replace(/_/g, " ").replace(/^./, (L) => L.toUpperCase());
    }
    function I(E) {
      if (E === void 0) return "Not set";
      if (typeof E == "string") return E || "Empty";
      if (Array.isArray(E)) return `${E.length} item${E.length === 1 ? "" : "s"}`;
      if (E && typeof E == "object") {
        const _ = E, L = _.properties && typeof _.properties == "object" && !Array.isArray(_.properties) ? Object.keys(_.properties) : [];
        if (_.type === "object" || L.length) {
          const F = Array.isArray(_.required) ? _.required.length : 0;
          return `${L.length} field${L.length === 1 ? "" : "s"}${F ? ` · ${F} required` : ""}`;
        }
        try {
          return JSON.stringify(_, null, 2);
        } catch {
          return "Settings";
        }
      }
      try {
        return JSON.stringify(E);
      } catch {
        return String(E);
      }
    }
    const z = U(() => Array.from(/* @__PURE__ */ new Set([
      ...Object.keys(n.currentConfig),
      ...Object.keys(l.value || {})
    ])).sort().map((E) => ({
      key: E,
      label: C(E),
      before: n.currentConfig[E],
      after: l.value?.[E],
      changed: !b(n.currentConfig[E], l.value?.[E])
    })));
    function T(E, _ = 0) {
      if (!E || typeof E != "object" || Array.isArray(E) || _ > 12) return _ > 12;
      const L = E;
      if (L.picker != null || L.class != null) return !0;
      const F = L.properties;
      return F && typeof F == "object" && !Array.isArray(F) && Object.values(F).some((J) => T(J, _ + 1)) || T(L.items, _ + 1) ? !0 : T(L.additionalProperties, _ + 1);
    }
    function O(E, _, L) {
      const F = L && typeof L == "object" && !Array.isArray(L) ? L : {};
      if (!(F.type === "object" || !!F.properties && typeof F.properties == "object" && !Array.isArray(F.properties)) || !E || typeof E != "object" || Array.isArray(E) || !_ || typeof _ != "object" || Array.isArray(_)) return _;
      const X = F.properties && typeof F.properties == "object" && !Array.isArray(F.properties) ? F.properties : {}, oe = { ...E };
      for (const [se, W] of Object.entries(_)) {
        const K = X[se] ?? (F.additionalProperties && typeof F.additionalProperties == "object" ? F.additionalProperties : void 0);
        oe[se] = O(oe[se], W, K);
      }
      return oe;
    }
    function D(E) {
      const _ = m.value.properties, L = _ && typeof _ == "object" && !Array.isArray(_) ? _ : {};
      if (!Object.keys(L).length) return { ...n.currentConfig, ...E };
      const F = {};
      for (const [J, X] of Object.entries(E)) {
        const oe = L[J], se = oe && typeof oe == "object" && !Array.isArray(oe) ? oe : {};
        T(se) || (F[J] = X);
      }
      return O(n.currentConfig, F, m.value);
    }
    async function B() {
      const E = o.value.trim();
      if (!E || r.value) return;
      r.value = !0;
      const _ = ++h, L = x.value;
      a.value = "", d.value = !1;
      const F = await SR({
        workflowId: n.workflowId,
        nodeId: n.resetKey,
        intent: E,
        ...n.upstreamSchema ? { upstreamSchema: n.upstreamSchema } : {}
      });
      if (_ === h) {
        if (L !== x.value) {
          r.value = !1, l.value = null, s.value = "", a.value = Ba;
          return;
        }
        if (r.value = !1, !$R(F)) {
          a.value = F.error, l.value = null, s.value = "";
          return;
        }
        F.configSchema && (c.value = F.configSchema), l.value = D(F.config), s.value = F.notes || "";
      }
    }
    function N() {
      l.value = null, s.value = "", a.value = "";
    }
    function H() {
      if (!l.value) return;
      u.value = { ...n.currentConfig };
      const E = { ...l.value };
      p = v(E), i("accept", E), l.value = null, s.value = "", d.value = !0;
    }
    function y() {
      if (!u.value) return;
      const E = { ...u.value };
      p = v(E), i("undo", E), u.value = null, d.value = !1;
    }
    return (E, _) => (S(), R("section", CR, [
      $("label", {
        class: "wf-config-assist__label",
        for: `wf-config-intent-${e.resetKey}`
      }, "Describe this step", 8, NR),
      $("div", IR, [
        V(f(Os), {
          id: `wf-config-intent-${e.resetKey}`,
          modelValue: o.value,
          "onUpdate:modelValue": _[0] || (_[0] = (L) => o.value = L),
          class: "wf-textarea",
          rows: "2",
          placeholder: "Explain how this step should behave…",
          onKeydown: [
            tt(Fe(B, ["meta", "prevent"]), ["enter"]),
            tt(Fe(B, ["ctrl", "prevent"]), ["enter"])
          ]
        }, null, 8, ["id", "modelValue", "onKeydown"]),
        V(f(fe), {
          class: "wf-config-assist__draft",
          disabled: !o.value.trim() || r.value,
          loading: r.value,
          onClick: B
        }, {
          default: ne(() => [
            r.value ? Z("", !0) : (S(), ae(f(ie), {
              key: 0,
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            })),
            $("span", null, j(r.value ? "Drafting…" : "Draft with AI"), 1)
          ]),
          _: 1
        }, 8, ["disabled", "loading"])
      ]),
      a.value ? (S(), ae(f(He), {
        key: 0,
        class: "wf-config-assist__error",
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          ce(j(a.value), 1)
        ]),
        _: 1
      })) : Z("", !0),
      l.value ? (S(), R("div", AR, [
        $("div", MR, [
          _[1] || (_[1] = $("strong", null, "Review drafted settings", -1)),
          $("span", null, j(z.value.filter((L) => L.changed).length) + " changed", 1)
        ]),
        s.value ? (S(), R("p", TR, j(s.value), 1)) : Z("", !0),
        $("dl", OR, [
          (S(!0), R(ue, null, Re(z.value, (L) => (S(), R("div", {
            key: L.key,
            class: Ie({ "is-unchanged": !L.changed })
          }, [
            $("dt", null, j(L.label), 1),
            $("dd", null, [
              L.changed ? (S(), R("span", RR, j(I(L.before)), 1)) : Z("", !0),
              $("span", DR, j(I(L.after)), 1)
            ])
          ], 2))), 128))
        ]),
        $("div", PR, [
          V(f(fe), {
            class: "wf-config-assist__accept",
            onClick: H
          }, {
            default: ne(() => [..._[2] || (_[2] = [
              ce("Accept", -1)
            ])]),
            _: 1
          }),
          V(f(fe), {
            severity: "secondary",
            text: "",
            onClick: N
          }, {
            default: ne(() => [..._[3] || (_[3] = [
              ce("Cancel", -1)
            ])]),
            _: 1
          })
        ])
      ])) : d.value ? (S(), ae(f(He), {
        key: 2,
        class: "wf-config-assist__applied",
        severity: "success",
        closable: !1
      }, {
        default: ne(() => [
          _[5] || (_[5] = $("span", null, "Draft applied. You can edit every field below.", -1)),
          V(f(fe), {
            severity: "secondary",
            outlined: "",
            onClick: y
          }, {
            default: ne(() => [..._[4] || (_[4] = [
              ce("Undo", -1)
            ])]),
            _: 1
          })
        ]),
        _: 1
      })) : Z("", !0)
    ]));
  }
});
function oi(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function LR(e) {
  const t = Array.isArray(e.type) ? e.type.find((n) => n !== "null") : e.type;
  return t === "string" || t === "number" || t === "integer" || t === "boolean" || t === "array" ? t === "integer" ? "number" : t : "unknown";
}
function Op(e, t = !1) {
  const n = [];
  function i(o, r = "", a = 0) {
    if (a > 10) return;
    const s = oi(o), l = oi(s.properties);
    for (const [c, u] of Object.entries(l)) {
      const d = oi(u), h = r ? `${r}.${c}` : c, p = LR(d), v = typeof d.title == "string" && d.title.trim() ? d.title.trim() : c.replace(/_/g, " ");
      p === "array" ? t && n.push({ path: h, label: v, type: p }) : p === "unknown" && Object.keys(oi(d.properties)).length ? i(d, h, a + 1) : t || n.push({ path: h, label: v, type: p });
    }
  }
  return i(e), n;
}
function rd(e) {
  return e === "boolean" ? [
    { value: "truthy", label: "is true" },
    { value: "falsy", label: "is false" }
  ] : e === "number" ? [
    { value: "eq", label: "equals" },
    { value: "neq", label: "does not equal" },
    { value: "gt", label: "is greater than" },
    { value: "gte", label: "is at least" },
    { value: "lt", label: "is less than" },
    { value: "lte", label: "is at most" }
  ] : [{ value: "eq", label: "equals" }, { value: "neq", label: "does not equal" }];
}
function VR(e) {
  return `'${e.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}
function BR(e, t, n = "output") {
  const i = e.field.trim();
  if (!i) return "";
  const o = `${n}.${i}`;
  if (e.operator === "truthy") return `${o} == true`;
  if (e.operator === "falsy") return `${o} == false`;
  const r = { eq: "==", neq: "!=", gt: ">", gte: ">=", lt: "<", lte: "<=" }[e.operator];
  if (!r) return "";
  const a = e.value.trim();
  if (!a) return "";
  const s = t === "number" && Number.isFinite(Number(a)) ? String(Number(a)) : VR(a);
  return `${o} ${r} ${s}`;
}
function zR(e, t = "output") {
  const n = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), i = e.trim().match(new RegExp(`^${n}\\.([A-Za-z_][\\w.]*)\\s*(==|!=|>=|<=|>|<)\\s*(.+)$`));
  if (!i) return null;
  const [, o, r, a] = i;
  if ((r === "==" || r === "!=") && (a === "true" || a === "false"))
    return { field: o, operator: a === "true" === (r === "==") ? "truthy" : "falsy", value: "" };
  const s = { "==": "eq", "!=": "neq", ">": "gt", ">=": "gte", "<": "lt", "<=": "lte" }[r];
  if (!s) return null;
  let l = a.trim();
  return (l.startsWith("'") && l.endsWith("'") || l.startsWith('"') && l.endsWith('"')) && (l = l.slice(1, -1)), { field: o, operator: s, value: l };
}
const FR = ["aria-label"], HR = {
  key: 0,
  class: "wf-predicate-row"
}, qR = { key: 0 }, UR = {
  key: 1,
  class: "wf-panel-hint wf-panel-hint--warn"
}, WR = { class: "wf-predicate-advanced" }, ad = /* @__PURE__ */ ye({
  __name: "PredicateComposer",
  props: {
    modelValue: {},
    schema: {},
    root: { default: "output" },
    label: { default: "Condition" },
    compact: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => Op(n.schema)), r = Y({ field: "", operator: "eq", value: "" }), a = Y(!0), s = Y("");
    let l = !1;
    const c = U(() => o.value.find((b) => b.path === r.value.field)), u = U(() => rd(c.value?.type || "unknown")), d = U(() => r.value.operator !== "truthy" && r.value.operator !== "falsy"), h = U(() => c.value?.type === "number" ? "number" : "text"), p = U(() => {
      const b = Number(r.value.value);
      return r.value.value.trim() !== "" && Number.isFinite(b) ? b : null;
    });
    function v(b) {
      s.value = b || "";
      const C = zR(b || "", n.root);
      C && o.value.some((I) => I.path === C.field) ? (r.value = C, a.value = !0) : (r.value = { field: "", operator: "eq", value: "" }, a.value = !b);
    }
    _e(() => [n.modelValue, n.root, n.schema], () => {
      if (l) {
        l = !1;
        return;
      }
      v(n.modelValue);
    }, { immediate: !0, deep: !0 });
    function g(b) {
      l = !0, s.value = b, i("update:modelValue", b);
    }
    function m() {
      const b = BR(r.value, c.value?.type || "unknown", n.root);
      g(b);
    }
    function k(b) {
      r.value.value = b == null ? "" : String(b), m();
    }
    function x(b) {
      r.value.field = b || "";
      const C = rd(c.value?.type || "unknown").map((I) => I.value);
      C.includes(r.value.operator) || (r.value.operator = C[0] || "eq"), r.value.value = "", m();
    }
    function w(b) {
      b && (r.value.operator = b, m());
    }
    return (b, C) => (S(), R("section", {
      class: Ie(["wf-predicate", { "is-compact": e.compact }]),
      "aria-label": e.label
    }, [
      o.value.length ? (S(), R("div", HR, [
        $("label", null, [
          C[4] || (C[4] = $("span", null, "Field", -1)),
          V(f(St), {
            "model-value": r.value.field || null,
            options: o.value,
            "option-label": "label",
            "option-value": "path",
            placeholder: "Choose a field…",
            "aria-label": "Condition field",
            "onUpdate:modelValue": x
          }, null, 8, ["model-value", "options"])
        ]),
        $("label", null, [
          C[5] || (C[5] = $("span", null, "Check", -1)),
          V(f(St), {
            "model-value": r.value.operator,
            options: u.value,
            "option-label": "label",
            "option-value": "value",
            disabled: !r.value.field,
            "aria-label": "Condition operator",
            "onUpdate:modelValue": w
          }, null, 8, ["model-value", "options", "disabled"])
        ]),
        d.value ? (S(), R("label", qR, [
          C[6] || (C[6] = $("span", null, "Value", -1)),
          h.value === "number" ? (S(), ae(f(so), {
            key: 0,
            "model-value": p.value,
            disabled: !r.value.field,
            "use-grouping": !1,
            "aria-label": "Condition value",
            placeholder: "Enter a value",
            "onUpdate:modelValue": k
          }, null, 8, ["model-value", "disabled"])) : (S(), ae(f(rt), {
            key: 1,
            modelValue: r.value.value,
            "onUpdate:modelValue": C[0] || (C[0] = (I) => r.value.value = I),
            disabled: !r.value.field,
            "aria-label": "Condition value",
            placeholder: "Enter a value",
            onChange: m
          }, null, 8, ["modelValue", "disabled"]))
        ])) : Z("", !0)
      ])) : (S(), R("p", UR, "Connect a step with declared output fields to build this visually.")),
      V(f(Rs), {
        collapsed: a.value,
        "onUpdate:collapsed": C[3] || (C[3] = (I) => a.value = I),
        class: "wf-predicate-disclosure",
        header: "Advanced expression",
        toggleable: ""
      }, {
        default: ne(() => [
          $("div", WR, [
            V(f(rt), {
              modelValue: s.value,
              "onUpdate:modelValue": C[1] || (C[1] = (I) => s.value = I),
              class: "wf-input wf-mono",
              "aria-label": "Condition expression",
              placeholder: "output.status == 'ready'",
              onChange: C[2] || (C[2] = (I) => g(s.value.trim()))
            }, null, 8, ["modelValue"]),
            C[7] || (C[7] = $("p", { class: "wf-panel-hint" }, "Use expr-lang only when the visual controls cannot express the rule.", -1))
          ])
        ]),
        _: 1
      }, 8, ["collapsed"])
    ], 10, FR));
  }
}), YR = { class: "wf-panel-hint" }, GR = { class: "wf-panel-hint" }, jR = { class: "wf-panel-hint" }, XR = { class: "wf-panel-hint" }, KR = { class: "wf-panel-hint" }, ZR = { class: "wf-panel-hint" }, JR = {
  key: 0,
  class: "wf-panel-hint wf-panel-hint--warn"
}, QR = /* @__PURE__ */ ye({
  __name: "LogicNodePanel",
  props: {
    workflowId: {},
    node: {},
    upstreamSchema: {},
    combineBranchConflict: {}
  },
  emits: ["update-node"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => n.node?.config || {}), r = Y("");
    _e(() => n.node?.id, () => {
      n.node?.kind === "branch" && (r.value = ER(o.value));
    }, { immediate: !0 });
    function a() {
      i("update-node", { config: xR(o.value, r.value) });
    }
    function s(E) {
      r.value = E, a();
    }
    function l(E) {
      s(typeof E.predicate == "string" ? E.predicate : "");
    }
    const c = Y(""), u = Y(0);
    _e(() => n.node?.id, () => {
      c.value = String(o.value.continue_condition || "");
      const E = Number(o.value.max_iterations);
      u.value = Number.isFinite(E) && E > 0 ? E : 0;
    }, { immediate: !0 });
    function d() {
      const E = { ...o.value, continue_condition: c.value.trim() };
      u.value > 0 ? E.max_iterations = Math.round(u.value) : delete E.max_iterations, i("update-node", { config: E });
    }
    function h(E) {
      const _ = Number(E);
      u.value = Number.isFinite(_) ? _ : 0, d();
    }
    function p(E) {
      c.value = E, d();
    }
    const v = Y(""), g = Y(8), m = Y(!1), k = U(() => Op(n.upstreamSchema, !0)), x = [
      { label: "Stop — fail this step at the first failed item", value: !1 },
      { label: "Continue — attempt every item, collect each result or error", value: !0 }
    ];
    _e(() => n.node?.id, () => {
      if (!yi(n.node?.kind)) return;
      const E = pR(n.node?.kind, o.value);
      v.value = E.sourceKey, g.value = E.batchSize, m.value = E.continueOnError;
    }, { immediate: !0 });
    function w() {
      i("update-node", vR(o.value, {
        sourceKey: v.value,
        batchSize: g.value,
        continueOnError: m.value
      }));
    }
    function b(E) {
      v.value = E || "", w();
    }
    function C(E) {
      m.value = E, w();
    }
    function I(E) {
      const _ = Number(E);
      g.value = Math.max(1, Math.round(Number.isFinite(_) ? _ : 1)), w();
    }
    const z = Y("wait_all"), T = Y("object"), O = [
      { label: "Wait for all — every incoming path must finish first", value: "wait_all" },
      { label: "First wins — continue as soon as one path arrives", value: "first_wins" }
    ], D = [
      { label: "Object — merge each path’s output by key", value: "object" },
      { label: "Array — collect each path’s output as a list", value: "array" }
    ];
    _e(() => n.node?.id, () => {
      Fi(n.node?.kind) && (z.value = BC(n.node?.kind, o.value), T.value = zC(o.value));
    }, { immediate: !0 });
    const B = U(
      () => z.value === "wait_all" && n.combineBranchConflict ? qC(n.combineBranchConflict) : ""
    );
    function N() {
      i("update-node", FC(o.value, z.value, T.value));
    }
    function H(E) {
      E && (z.value = E, N());
    }
    function y(E) {
      E && (T.value = E, N());
    }
    return (E, _) => e.node.kind === "branch" ? (S(), R(ue, { key: 0 }, [
      _[1] || (_[1] = $("p", { class: "wf-panel-hint" }, [
        ce("Set the condition, then connect "),
        $("strong", null, "True"),
        ce(" and "),
        $("strong", null, "False"),
        ce(" to the steps that should run. Exactly one path runs.")
      ], -1)),
      _[2] || (_[2] = $("div", { class: "wf-panel-label" }, "Condition", -1)),
      V(ad, {
        "model-value": r.value,
        schema: e.upstreamSchema,
        "onUpdate:modelValue": s
      }, null, 8, ["model-value", "schema"]),
      V(Tp, {
        "workflow-id": e.workflowId,
        "reset-key": e.node.id,
        "current-config": { predicate: r.value },
        "upstream-schema": e.upstreamSchema,
        onAccept: l,
        onUndo: l
      }, null, 8, ["workflow-id", "reset-key", "current-config", "upstream-schema"]),
      _[3] || (_[3] = $("div", {
        class: "wf-branch-outcomes",
        "aria-label": "Condition outcomes"
      }, [
        $("p", null, [
          $("strong", null, "True"),
          $("span", null, "runs when the condition matches")
        ]),
        $("p", null, [
          $("strong", null, "False"),
          $("span", null, "runs when it does not")
        ])
      ], -1))
    ], 64)) : e.node.kind === "cycle" ? (S(), R(ue, { key: 1 }, [
      _[4] || (_[4] = $("p", { class: "wf-panel-hint" }, [
        ce("Use it when one step needs to run more than once — retrying a bounded operation or working through repeated passes — until the condition below stops holding. Wire the repeated steps from the "),
        $("strong", null, "each pass"),
        ce(" port; the "),
        $("strong", null, "when done"),
        ce(" port continues after the loop.")
      ], -1)),
      _[5] || (_[5] = $("div", { class: "wf-panel-label" }, "Repeat while", -1)),
      V(ad, {
        "model-value": c.value,
        schema: e.upstreamSchema,
        root: "input",
        label: "Repeat while",
        "onUpdate:modelValue": p
      }, null, 8, ["model-value", "schema"]),
      $("p", YR, j(f(mR)), 1),
      _[6] || (_[6] = $("div", { class: "wf-panel-label" }, "Max iterations", -1)),
      V(f(so), {
        "model-value": u.value,
        min: 0,
        "use-grouping": !1,
        class: "wf-input",
        placeholder: "8",
        "aria-label": "Max iterations",
        "onUpdate:modelValue": h
      }, null, 8, ["model-value"]),
      $("p", GR, j(f(gR)), 1)
    ], 64)) : f(yi)(e.node.kind) ? (S(), R(ue, { key: 2 }, [
      $("p", jR, j(f(yR)), 1),
      _[7] || (_[7] = $("div", { class: "wf-panel-label" }, "Items to iterate", -1)),
      k.value.length ? (S(), ae(f(St), {
        key: 0,
        "model-value": v.value || null,
        options: k.value,
        "option-label": "label",
        "option-value": "path",
        class: "wf-input",
        placeholder: "Choose an array field…",
        "aria-label": "Items to iterate",
        "onUpdate:modelValue": b
      }, null, 8, ["model-value", "options"])) : (S(), ae(f(rt), {
        key: 1,
        modelValue: v.value,
        "onUpdate:modelValue": _[0] || (_[0] = (L) => v.value = L),
        class: "wf-input wf-mono",
        placeholder: "items",
        "aria-label": "Source array key",
        onChange: w
      }, null, 8, ["modelValue"])),
      _[8] || (_[8] = $("p", { class: "wf-panel-hint" }, "The upstream field holding the array to fan out over — one run of the body per item.", -1)),
      _[9] || (_[9] = $("div", { class: "wf-panel-label" }, "Batch size", -1)),
      V(f(so), {
        "model-value": g.value,
        min: 1,
        "use-grouping": !1,
        class: "wf-input",
        "aria-label": "Batch size",
        "onUpdate:modelValue": I
      }, null, 8, ["model-value"]),
      $("p", XR, j(f(wR)), 1),
      _[10] || (_[10] = $("div", { class: "wf-panel-label" }, "If an item fails", -1)),
      V(f(St), {
        "model-value": m.value,
        options: x,
        "option-label": "label",
        "option-value": "value",
        class: "wf-input",
        "aria-label": "If an item fails",
        "onUpdate:modelValue": C
      }, null, 8, ["model-value"]),
      $("p", KR, j(m.value ? f(bR) : f(_R)), 1)
    ], 64)) : f(Fi)(e.node.kind) ? (S(), R(ue, { key: 3 }, [
      _[11] || (_[11] = $("p", { class: "wf-panel-hint" }, "Use it to bring several paths back into one. Choose below whether it waits for every path to finish or continues on the first to arrive.", -1)),
      _[12] || (_[12] = $("div", { class: "wf-panel-label" }, "When to continue", -1)),
      V(f(St), {
        "model-value": z.value,
        options: O,
        "option-label": "label",
        "option-value": "value",
        class: "wf-input",
        "aria-label": "When to continue",
        "onUpdate:modelValue": H
      }, null, 8, ["model-value"]),
      $("p", ZR, j(z.value === "wait_all" ? "Waits for every incoming path to finish, then continues once. Use it when parallel work must all complete before the next step." : "Continues the moment the first path arrives, without waiting for the rest. Use it to bring Condition paths back together, where only one ever runs."), 1),
      B.value ? (S(), R("p", JR, [
        V(f(ie), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        ce(" " + j(B.value), 1)
      ])) : Z("", !0),
      _[13] || (_[13] = $("div", { class: "wf-panel-label" }, "Combine as", -1)),
      V(f(St), {
        "model-value": T.value,
        options: D,
        "option-label": "label",
        "option-value": "value",
        class: "wf-input",
        "aria-label": "Combine as",
        "onUpdate:modelValue": y
      }, null, 8, ["model-value"]),
      _[14] || (_[14] = $("p", { class: "wf-panel-hint" }, "How the arriving outputs are shaped before they continue.", -1))
    ], 64)) : Z("", !0);
  }
}), eD = { class: "fm-top" }, tD = {
  key: 0,
  class: "fm-note"
}, nD = {
  key: 1,
  class: "fm-err"
}, oD = {
  key: 2,
  class: "fm-armbar"
}, iD = {
  key: 3,
  class: "fm-contract-missing"
}, rD = {
  key: 4,
  class: "fm-empty fm-no-mapping"
}, aD = {
  key: 5,
  class: "fm-cols"
}, sD = {
  class: "fm-col fm-col--src",
  "aria-label": "Source fields"
}, lD = { class: "fm-col-hd" }, uD = { class: "fm-pills" }, cD = ["aria-expanded", "aria-label", "onClick"], dD = {
  key: 1,
  class: "fm-twist-sp",
  "aria-hidden": "true"
}, fD = ["title", "onClick", "onDragstart"], hD = { class: "fm-pill-name" }, pD = { class: "fm-pill-type" }, vD = {
  key: 0,
  class: "fm-empty"
}, mD = {
  class: "fm-col fm-col--tgt",
  "aria-label": "Target fields"
}, gD = { class: "fm-col-hd" }, yD = { class: "fm-raw" }, wD = ["value", "placeholder"], bD = {
  key: 1,
  class: "fm-rows"
}, _D = {
  key: 0,
  class: "fm-empty"
}, kD = ["data-test", "onDragover", "onDragleave", "onDrop"], ED = ["aria-label", "onClick"], xD = { class: "fm-row-name" }, $D = {
  key: 0,
  class: "fm-req"
}, SD = { class: "fm-row-type" }, CD = {
  key: 1,
  class: "fm-compat fm-compat--warn",
  title: "This field's type may not match the target"
}, ND = {
  key: 0,
  class: "fm-simple-row"
}, ID = ["value", "aria-label", "onChange"], AD = { value: "" }, MD = ["value"], TD = ["aria-label", "onClick"], OD = {
  key: 1,
  class: "fm-row-body"
}, RD = ["value", "aria-label", "onChange"], DD = {
  key: 0,
  value: "skip"
}, PD = ["onClick"], LD = ["value", "placeholder", "aria-label", "onInput"], VD = ["value", "placeholder", "aria-label", "onInput"], BD = ["aria-label", "onClick"], zD = {
  key: 2,
  class: "fm-empty"
}, FD = /* @__PURE__ */ ye({
  __name: "FieldMapper",
  props: {
    sourceSchema: {},
    targetSchema: {},
    sourceRoot: {},
    sourceTitle: {},
    targetTitle: {},
    modelValue: {},
    resetKey: {},
    showAssist: { type: Boolean },
    assistPending: { type: Boolean },
    assistError: {},
    simple: { type: Boolean }
  },
  emits: ["update:modelValue", "update:missing", "assist", "cancel-assist"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y([]), r = Y(!1), a = Y(""), s = Y(null), l = Y({}), c = Y(null), u = Y(!1), d = Y(!1), h = U(() => n.sourceRoot || "output"), p = U(() => Sh(n.sourceSchema, h.value)), v = U(() => Y$(n.sourceSchema, h.value)), g = U(() => p.value.length ? p.value : v.value ? [v.value] : []), m = U(() => Mo(n.targetSchema)), k = U(() => m.value.length > 0), x = U(() => !!s.value), w = U(() => {
      const P = /* @__PURE__ */ new Map(), M = (A) => A.forEach((q) => {
        P.set(q.expr, q), q.children.length && M(q.children);
      });
      return M(g.value), P;
    }), b = U(() => {
      const P = [], M = (A) => {
        for (const q of A)
          P.push(q), q.expandable && l.value[q.path] && M(q.children);
      };
      return M(g.value), P;
    }), C = U(() => {
      const P = [], M = (A) => A.forEach((q) => {
        P.push(q), M(q.children);
      });
      return M(g.value), P;
    }), I = U(() => r.value ? a.value.trim() ? [] : m.value.filter((P) => P.required).map((P) => P.title || P.key) : nl(m.value, o.value)), z = U(() => r.value ? "" : X$(m.value, o.value)), T = U(() => Bn(n.targetSchema)), O = U(() => T.value ? !k.value && !r.value ? "No mapping needed" : k.value ? z.value || (d.value ? "Required fields pass through unchanged" : "All required fields mapped") : "Custom mapping" : "Input fields unavailable"), D = U(() => !!z.value || !T.value), B = U(() => d.value ? "" : r.value ? a.value.trim() : us(o.value));
    function N() {
      if (s.value = null, d.value = !1, !k.value) {
        a.value = il(n.modelValue), r.value = a.value !== "", o.value = [];
        return;
      }
      const P = cs(n.targetSchema, n.modelValue), M = (n.modelValue || "").trim() ? [] : Nh(n.sourceSchema, n.targetSchema, h.value), A = new Map(M.map((q) => [q.key, q]));
      o.value = P.rows.map((q) => A.get(q.key) || q), d.value = M.length > 0, a.value = P.raw, r.value = P.raw !== "";
    }
    _e(() => n.resetKey, N, { immediate: !0 }), _e(B, (P) => i("update:modelValue", P)), _e(I, (P) => i("update:missing", P), { immediate: !0 });
    function H(P) {
      return o.value.find((M) => M.key === P) || { key: P, mode: "skip", value: "" };
    }
    function y(P) {
      return (P.mode === "expr" || P.mode === "static") && (P.value ?? "") !== "";
    }
    function E(P) {
      const M = H(P.key);
      if (M.mode !== "expr" || !M.value) return "neutral";
      const A = w.value.get(M.value.trim());
      return A ? K$(A.type, P.type) : "neutral";
    }
    function _(P) {
      s.value = s.value === P ? null : P;
    }
    function L(P) {
      l.value = { ...l.value, [P]: !l.value[P] };
    }
    function F(P, M) {
      d.value = !1, o.value = o.value.map((A) => A.key === P ? { ...A, mode: "expr", value: M } : A);
    }
    function J(P) {
      s.value && (F(P, s.value), s.value = null);
    }
    function X(P, M) {
      M ? F(P, M) : W(P), s.value = null;
    }
    function oe(P, M) {
      d.value = !1, o.value = o.value.map((A) => A.key === P ? { ...A, mode: M } : A);
    }
    function se(P, M) {
      d.value = !1, o.value = o.value.map((A) => A.key === P ? { ...A, value: M } : A);
    }
    function W(P) {
      d.value = !1;
      const M = m.value.find((A) => A.key === P);
      o.value = o.value.map((A) => A.key === P ? { key: P, mode: M?.required ? "static" : "skip", value: "", type: A.type } : A), s.value = null;
    }
    function K(P, M) {
      P.dataTransfer && (P.dataTransfer.setData("text/plain", M), P.dataTransfer.effectAllowed = "copy"), s.value = M;
    }
    function G(P, M) {
      P.preventDefault(), c.value = M;
    }
    function ee(P) {
      c.value === P && (c.value = null);
    }
    function te(P, M) {
      P.preventDefault();
      const A = P.dataTransfer?.getData("text/plain") || s.value;
      A && (F(M, A), s.value = null), c.value = null;
    }
    function re() {
      d.value = !1, a.value = us(o.value), r.value = !0, s.value = null;
    }
    function le() {
      const P = cs(n.targetSchema, a.value);
      o.value = P.rows, P.raw === "" && (r.value = !1);
    }
    function we(P) {
      a.value = P.target.value;
    }
    function $e(P) {
      P.key === "Escape" && s.value && (s.value = null, P.stopPropagation());
    }
    function pe(P) {
      if (P.mode === "static" && P.value) return `Fixed value: ${P.value}`;
      if (P.mode === "expr" && P.value) {
        const M = `${h.value}.`;
        return P.value.startsWith(M) ? `From ${P.value.slice(M.length)}` : "Custom mapping";
      }
      return "Choose a field";
    }
    const me = U(() => `{ field: ${h.value}.value }`);
    return (P, M) => (S(), R("div", {
      class: Ie(["fm", { "fm--armed": x.value }]),
      onKeydown: $e
    }, [
      $("div", eD, [
        $("span", {
          class: Ie(["fm-status", D.value ? "fm-status--warn" : "fm-status--ok"])
        }, [
          V(f(ie), {
            icon: D.value ? "tabler:alert-triangle" : "tabler:circle-check",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          $("span", null, j(O.value), 1)
        ], 2),
        e.showAssist && T.value ? (S(), R("button", {
          key: 0,
          type: "button",
          class: "fm-ai",
          onClick: M[0] || (M[0] = (A) => e.assistPending ? i("cancel-assist") : i("assist"))
        }, [
          V(f(ie), {
            icon: e.assistPending ? "tabler:x" : "tabler:wand",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          $("span", null, j(e.assistPending ? "Cancel" : "Draft with AI"), 1)
        ])) : Z("", !0)
      ]),
      e.assistPending ? (S(), R("p", tD, "Drafting a field mapping…")) : e.assistError ? (S(), R("p", nD, [
        V(f(ie), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        ce(" " + j(e.assistError), 1)
      ])) : Z("", !0),
      x.value ? (S(), R("div", oD, [
        V(f(ie), {
          icon: "tabler:pointer",
          "aria-hidden": "true"
        }),
        $("span", null, [
          M[2] || (M[2] = ce("Mapping ", -1)),
          $("code", null, j(s.value), 1),
          M[3] || (M[3] = ce(" — pick a target field, or press Esc.", -1))
        ])
      ])) : Z("", !0),
      e.simple && !T.value ? (S(), R("div", iD, [
        V(f(ie), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        M[4] || (M[4] = $("span", null, "This step’s input fields didn’t load. Refresh the step before mapping it.", -1))
      ])) : !k.value && !r.value ? (S(), R("p", rD, " This step takes no input fields, so the connection passes through without a mapping. ")) : (S(), R("div", aD, [
        $("section", sD, [
          $("div", lD, j(e.sourceTitle || "From"), 1),
          $("div", uD, [
            (S(!0), R(ue, null, Re(b.value, (A) => (S(), R("div", {
              key: A.expr,
              class: "fm-pill-row",
              style: ze({ "--fm-depth": `${A.depth * 14}px` })
            }, [
              A.expandable ? (S(), R("button", {
                key: 0,
                type: "button",
                class: "fm-twist",
                "aria-expanded": !!l.value[A.path],
                "aria-label": `Expand ${A.name}`,
                onClick: (q) => L(A.path)
              }, [
                V(f(ie), {
                  icon: l.value[A.path] ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, cD)) : (S(), R("span", dD)),
              $("button", {
                type: "button",
                class: Ie(["fm-pill", { "is-sel": s.value === A.expr }]),
                draggable: "true",
                title: A.description || A.expr,
                onClick: (q) => _(A.expr),
                onDragstart: (q) => K(q, A.expr)
              }, [
                $("span", hD, j(A.name), 1),
                $("span", pD, j(A.type), 1)
              ], 42, fD)
            ], 4))), 128)),
            b.value.length ? Z("", !0) : (S(), R("p", vD, " No fields are available from the previous step yet. "))
          ])
        ]),
        $("section", mD, [
          $("div", gD, j(e.targetTitle || "To"), 1),
          r.value && (!e.simple || u.value) ? (S(), R(ue, { key: 0 }, [
            $("label", yD, [
              M[5] || (M[5] = $("span", { class: "fm-raw-lbl" }, "Expression", -1)),
              $("textarea", {
                class: "fm-raw-input",
                value: a.value,
                rows: "4",
                spellcheck: "false",
                placeholder: me.value,
                "aria-label": "Mapping expression",
                onInput: we
              }, null, 40, wD)
            ]),
            M[6] || (M[6] = $("p", { class: "fm-hint" }, "Build the complete input with one expression.", -1))
          ], 64)) : r.value ? (S(), R("p", zD, "A custom mapping is configured. Open Advanced mapping to inspect it.")) : (S(), R("div", bD, [
            m.value.length ? Z("", !0) : (S(), R("p", _D, "This target takes no input — nothing to map.")),
            (S(!0), R(ue, null, Re(m.value, (A) => (S(), R("div", {
              key: A.key,
              class: Ie(["fm-row", {
                "fm-row--needed": A.required && I.value.includes(A.title || A.key),
                "is-drop": c.value === A.key,
                "is-mapped": y(H(A.key))
              }]),
              "data-test": `fm-row-${A.key}`,
              onDragover: (q) => G(q, A.key),
              onDragleave: (q) => ee(A.key),
              onDrop: (q) => te(q, A.key)
            }, [
              $("button", {
                type: "button",
                class: "fm-row-hd",
                "aria-label": x.value ? `Map ${s.value} into ${A.title}` : A.title,
                onClick: (q) => J(A.key)
              }, [
                $("span", xD, j(A.title), 1),
                A.required ? (S(), R("span", $D, "required")) : Z("", !0),
                $("span", SD, j(A.type || "any"), 1),
                E(A) === "mismatch" ? (S(), R("span", CD, "type?")) : Z("", !0),
                x.value ? (S(), ae(f(ie), {
                  key: 2,
                  class: "fm-row-drop",
                  icon: "tabler:arrow-bar-to-down",
                  "aria-hidden": "true"
                })) : Z("", !0)
              ], 8, ED),
              e.simple && !u.value ? (S(), R("div", ND, [
                $("select", {
                  class: "fm-simple-value",
                  value: H(A.key).mode === "expr" ? H(A.key).value : "",
                  "aria-label": `Choose a source field for ${A.title}`,
                  onChange: (q) => X(A.key, q.target.value)
                }, [
                  $("option", AD, j(pe(H(A.key))), 1),
                  (S(!0), R(ue, null, Re(C.value, (q) => (S(), R("option", {
                    key: q.expr,
                    value: q.expr
                  }, j(q.name), 9, MD))), 128))
                ], 40, ID),
                y(H(A.key)) ? (S(), R("button", {
                  key: 0,
                  type: "button",
                  class: "fm-clear",
                  "aria-label": `Clear ${A.title}`,
                  title: "Clear",
                  onClick: (q) => W(A.key)
                }, [
                  V(f(ie), {
                    icon: "tabler:x",
                    "aria-hidden": "true"
                  })
                ], 8, TD)) : Z("", !0)
              ])) : (S(), R("div", OD, [
                $("select", {
                  class: "fm-mode",
                  value: H(A.key).mode,
                  "aria-label": `How to fill ${A.title}`,
                  onChange: (q) => oe(A.key, q.target.value)
                }, [
                  M[7] || (M[7] = $("option", { value: "expr" }, "Field / expression", -1)),
                  M[8] || (M[8] = $("option", { value: "static" }, "Fixed value", -1)),
                  A.required ? Z("", !0) : (S(), R("option", DD, "Leave empty"))
                ], 40, RD),
                H(A.key).mode === "skip" ? (S(), R("button", {
                  key: 0,
                  type: "button",
                  class: "fm-cell fm-cell--empty",
                  onClick: (q) => J(A.key)
                }, j(x.value ? "Drop it here" : "Left empty"), 9, PD)) : H(A.key).mode === "static" ? (S(), R("input", {
                  key: 1,
                  class: "fm-cell fm-input",
                  value: H(A.key).value,
                  placeholder: A.description || "value",
                  "aria-label": `${A.title} fixed value`,
                  onInput: (q) => se(A.key, q.target.value)
                }, null, 40, LD)) : (S(), R("input", {
                  key: 2,
                  class: "fm-cell fm-input fm-mono",
                  value: H(A.key).value,
                  placeholder: s.value || `${h.value}.field`,
                  "aria-label": `${A.title} expression`,
                  onInput: (q) => se(A.key, q.target.value)
                }, null, 40, VD)),
                y(H(A.key)) ? (S(), R("button", {
                  key: 3,
                  type: "button",
                  class: "fm-clear",
                  "aria-label": `Clear ${A.title}`,
                  title: "Clear",
                  onClick: (q) => W(A.key)
                }, [
                  V(f(ie), {
                    icon: "tabler:x",
                    "aria-hidden": "true"
                  })
                ], 8, BD)) : Z("", !0)
              ]))
            ], 42, kD))), 128))
          ]))
        ])
      ])),
      e.simple && (k.value || r.value) ? (S(), R("button", {
        key: 6,
        type: "button",
        class: "fm-linkbtn",
        onClick: M[1] || (M[1] = (A) => u.value = !u.value)
      }, j(u.value ? "Hide advanced mapping" : "Advanced mapping"), 1)) : k.value && !r.value ? (S(), R("button", {
        key: 7,
        type: "button",
        class: "fm-linkbtn",
        onClick: re
      }, " Write the whole expression myself ")) : k.value && r.value ? (S(), R("button", {
        key: 8,
        type: "button",
        class: "fm-linkbtn",
        onClick: le
      }, " Back to fields ")) : Z("", !0),
      e.simple && u.value && k.value && !r.value ? (S(), R("button", {
        key: 9,
        type: "button",
        class: "fm-linkbtn",
        onClick: re
      }, " Edit the complete expression ")) : Z("", !0),
      e.simple && u.value && k.value && r.value ? (S(), R("button", {
        key: 10,
        type: "button",
        class: "fm-linkbtn",
        onClick: le
      }, " Back to field mapping ")) : Z("", !0)
    ], 34));
  }
}), ji = "The assistant couldn’t generate a mapping.", Rp = 11e4;
function Dp(e) {
  if (Rd(e) === 404) return "The mapping assistant isn’t available yet.";
  const t = e?.response?.data;
  return t ? xn(t, e instanceof Error && e.message ? e.message : ji) : e instanceof Error && e.message ? e.message : ji;
}
async function HD(e, t, n, i, o = {}, r) {
  try {
    const a = {
      edge: {
        source_id: t.source_id,
        target_id: t.target_id,
        transform: t.transform || ""
      },
      upstream_schema: n ?? null,
      downstream_schema: i ?? null
    };
    o.upstreamSample !== void 0 && (a.upstream_sample = o.upstreamSample), o.downstreamSample !== void 0 && (a.downstream_sample = o.downstreamSample);
    const { data: s } = await mn.post(`/api/v1/workflows/${encodeURIComponent(e)}/assist/edge`, a, { timeout: Rp, signal: r });
    return s && s.success === !1 ? { error: xn(s, ji) } : s && typeof s.transform == "string" ? { transform: s.transform } : { error: "The assistant returned no mapping." };
  } catch (a) {
    return { error: Dp(a) };
  }
}
async function qD(e, t, n, i, o, r, a, s = {}, l) {
  try {
    const c = {
      mode: "intent",
      edge: {
        source_id: t.source_id,
        target_id: t.target_id,
        transform: t.transform || ""
      },
      intent: o,
      upstream_schema: n ?? null,
      downstream_schema: i ?? null,
      source_failure_available: r,
      available_steps: a
    };
    s.upstreamSample !== void 0 && (c.upstream_sample = s.upstreamSample), s.downstreamSample !== void 0 && (c.downstream_sample = s.downstreamSample);
    const { data: u } = await mn.post(`/api/v1/workflows/${encodeURIComponent(e)}/assist/edge`, c, { timeout: Rp, signal: l });
    return u && u.success === !1 ? { error: xn(u, ji) } : u?.kind === "mapping" && typeof u.transform == "string" ? { kind: "mapping", transform: u.transform, summary: typeof u.summary == "string" ? u.summary : "" } : u?.kind === "condition" && typeof u.predicate == "string" ? { kind: "condition", predicate: u.predicate, summary: typeof u.summary == "string" ? u.summary : "" } : u?.kind === "failure_route" && typeof u.available == "boolean" && u.source_port === "failed" ? { kind: "failure_route", available: u.available, source_port: "failed", summary: typeof u.summary == "string" ? u.summary : "" } : u?.kind === "insert_node" && typeof u.block_id == "string" && typeof u.block_title == "string" ? { kind: "insert_node", block_id: u.block_id, block_title: u.block_title, summary: typeof u.summary == "string" ? u.summary : "" } : { error: "The assistant returned no usable connection preview." };
  } catch (c) {
    return { error: Dp(c) };
  }
}
function UD(e) {
  return "transform" in e && typeof e.transform == "string";
}
function WD(e) {
  return "kind" in e;
}
const YD = { class: "wf-edge-route" }, GD = ["title"], jD = ["title"], XD = { class: "wf-panel-foot" }, KD = /* @__PURE__ */ ye({
  __name: "EdgePanel",
  props: {
    workflowId: {},
    edge: {},
    edgeUpstreamSchema: {},
    edgeDownstreamSchema: {},
    sourceTitle: {},
    targetTitle: {}
  },
  emits: ["update-edge", "remove-edge"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(""), r = Y(null), a = Y(0);
    let s = null;
    function l() {
      s?.abort(), s = null, r.value = null;
    }
    _e(() => n.edge?.id, () => {
      l(), o.value = n.edge?.transform || "", r.value = null;
    }, { immediate: !0 });
    const c = U(() => `${n.edge?.id || ""}:${a.value}`);
    function u(v) {
      o.value = v, i("update-edge", { transform: v });
    }
    async function d(v) {
      try {
        const g = await Ad(n.workflowId, 5);
        for (const m of g) {
          const k = await Od(n.workflowId, m.run_id, v), x = Sg(k);
          if (x != null) return x;
        }
      } catch {
      }
      return null;
    }
    async function h() {
      if (!n.edge) return;
      l();
      const v = new AbortController(), g = n.edge.id;
      s = v, r.value = { kind: "loading" };
      const m = await d(n.edge.source_id);
      if (v.signal.aborted || s !== v || n.edge.id !== g) return;
      const k = await HD(
        n.workflowId,
        { id: n.edge.id, source_id: n.edge.source_id, target_id: n.edge.target_id, transform: o.value },
        n.edgeUpstreamSchema,
        n.edgeDownstreamSchema,
        m != null ? { upstreamSample: m } : {},
        v.signal
      );
      v.signal.aborted || s !== v || n.edge.id !== g || (s = null, UD(k) ? (o.value = k.transform, i("update-edge", { transform: k.transform }), r.value = null, a.value++) : r.value = { kind: "error", message: k.error });
    }
    function p() {
      l();
    }
    return Qe(l), (v, g) => (S(), R(ue, null, [
      g[2] || (g[2] = $("div", { class: "wf-panel-hdr wf-panel-hdr--edge" }, [
        $("span", { class: "wf-panel-hdr-kind" }, "Connection")
      ], -1)),
      $("h3", YD, [
        $("span", {
          class: "wf-edge-route-name",
          title: e.sourceTitle || "Previous step"
        }, j(e.sourceTitle || "Previous step"), 9, GD),
        V(f(ie), {
          icon: "tabler:arrow-right",
          "aria-hidden": "true"
        }),
        $("span", {
          class: "wf-edge-route-name",
          title: e.targetTitle || "Next step"
        }, j(e.targetTitle || "Next step"), 9, jD)
      ]),
      g[3] || (g[3] = $("p", { class: "wf-panel-how" }, "Choose what the next step receives. Matching fields are connected automatically.", -1)),
      g[4] || (g[4] = $("div", { class: "wf-panel-label" }, "Data", -1)),
      V(FD, {
        "source-schema": e.edgeUpstreamSchema,
        "target-schema": e.edgeDownstreamSchema,
        "source-root": "output",
        "source-title": e.sourceTitle ? `From ${e.sourceTitle}` : "From previous step",
        "target-title": e.targetTitle ? `Into ${e.targetTitle}` : "Into next step",
        "model-value": o.value,
        "reset-key": c.value,
        "show-assist": "",
        simple: "",
        "assist-pending": r.value?.kind === "loading",
        "assist-error": r.value?.kind === "error" ? r.value.message : "",
        "onUpdate:modelValue": u,
        onAssist: h,
        onCancelAssist: p
      }, null, 8, ["source-schema", "target-schema", "source-title", "target-title", "model-value", "reset-key", "assist-pending", "assist-error"]),
      g[5] || (g[5] = $("p", { class: "wf-panel-hint" }, "Select a field on the left, then the field it should fill on the right. Matching names need no setup.", -1)),
      $("div", XD, [
        V(f(fe), {
          severity: "danger",
          onClick: g[0] || (g[0] = (m) => i("remove-edge"))
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            }),
            g[1] || (g[1] = $("span", null, "Delete connection", -1))
          ]),
          _: 1
        })
      ])
    ], 64));
  }
}), ZD = { class: "wf-panel-hdr wf-panel-hdr--note" }, JD = { class: "wf-panel-hdr-kind" }, QD = { class: "wf-sr-only" }, eP = { class: "wf-panel-foot" }, tP = /* @__PURE__ */ ye({
  __name: "NotePanel",
  props: {
    note: {}
  },
  emits: ["update-note", "remove-note"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => n.note?.kind === "frame"), r = [...Qs], a = U({
      get: () => n.note?.color || "amber",
      set: (l) => i("update-note", { color: l })
    }), s = Y("");
    return _e(() => n.note?.id, () => {
      s.value = n.note?.text || "";
    }, { immediate: !0 }), (l, c) => (S(), R(ue, null, [
      $("div", ZD, [
        $("span", JD, j(o.value ? "Frame" : "Note"), 1)
      ]),
      V(f(Ts), {
        modelValue: a.value,
        "onUpdate:modelValue": c[0] || (c[0] = (u) => a.value = u),
        class: "wf-note-colors",
        options: r,
        "option-label": "key",
        "option-value": "key",
        "aria-label": o.value ? "Frame color" : "Note color"
      }, {
        option: ne(({ option: u }) => [
          $("span", {
            class: Ie(["wf-note-color-dot", f(el)(u.key).replace("wf-note--", "wf-swatch--")]),
            "aria-hidden": "true"
          }, null, 2),
          $("span", QD, j(u.key), 1)
        ]),
        _: 1
      }, 8, ["modelValue", "aria-label"]),
      o.value ? (S(), R(ue, { key: 0 }, [
        c[7] || (c[7] = $("div", { class: "wf-panel-label" }, "Title", -1)),
        V(f(rt), {
          modelValue: s.value,
          "onUpdate:modelValue": c[1] || (c[1] = (u) => s.value = u),
          class: "wf-input",
          placeholder: "Frame title",
          "aria-label": "Frame title",
          onChange: c[2] || (c[2] = (u) => i("update-note", { text: s.value })),
          onKeydown: c[3] || (c[3] = tt((u) => i("update-note", { text: s.value }), ["enter"]))
        }, null, 8, ["modelValue"]),
        c[8] || (c[8] = $("p", { class: "wf-panel-hint" }, "A colored background region — drag steps onto it to group them, and resize it from its corners.", -1))
      ], 64)) : (S(), R(ue, { key: 1 }, [
        V(f(Os), {
          modelValue: s.value,
          "onUpdate:modelValue": c[4] || (c[4] = (u) => s.value = u),
          class: "wf-textarea",
          rows: "6",
          placeholder: "Write a note… markdown supported",
          "aria-label": "Note text",
          onChange: c[5] || (c[5] = (u) => i("update-note", { text: s.value }))
        }, null, 8, ["modelValue"]),
        c[9] || (c[9] = $("p", { class: "wf-panel-hint" }, "Markdown supported — headings, lists, links, and code.", -1))
      ], 64)),
      $("div", eP, [
        V(f(fe), {
          severity: "danger",
          onClick: c[6] || (c[6] = (u) => i("remove-note"))
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            }),
            $("span", null, "Delete " + j(o.value ? "frame" : "note"), 1)
          ]),
          _: 1
        })
      ])
    ], 64));
  }
});
function nP(e) {
  const t = sg(e), n = t?.properties;
  if (!n || typeof n != "object") return;
  const i = new Set(Array.isArray(t.required) ? t.required.map(String) : []), o = {};
  for (const [r, a] of Object.entries(n)) {
    const s = a && typeof a == "object" ? { ...a } : {};
    i.has(r) && (s.required = !0), o[r] = s;
  }
  return Object.keys(o).length ? o : void 0;
}
function oP(e) {
  const t = nP(e);
  return t ? { config_schema: t } : null;
}
const iP = { class: "wf-panel" }, rP = { class: "wf-panel-hdr-kind" }, aP = { class: "wf-panel-how" }, sP = { class: "wf-boundary-tag" }, lP = { class: "wf-panel-hint" }, uP = { class: "wf-panel-label" }, cP = {
  key: 0,
  class: "wf-panel-hint"
}, dP = {
  key: 0,
  class: "wf-panel-label"
}, fP = {
  key: 1,
  class: "wf-panel-hint"
}, hP = { class: "wf-panel-hint" }, pP = {
  key: 5,
  class: "wf-panel-foot"
}, vP = { class: "wf-panel-hint wf-panel-pinned-note" }, mP = {
  key: 6,
  class: "wf-panel-foot"
}, gP = "wc-schema-form", sd = /* @__PURE__ */ ye({
  __name: "NodeConfigPanel",
  props: {
    workflowId: {},
    node: {},
    edge: {},
    note: {},
    catalog: {},
    edgeUpstreamSchema: {},
    edgeDownstreamSchema: {},
    edgeSourceTitle: {},
    edgeTargetTitle: {},
    nodeUpstreamSchema: {},
    combineBranchConflict: {}
  },
  emits: ["update-node", "remove-node", "update-edge", "remove-edge", "update-note", "remove-note", "close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => n.node ? wi(n.node.kind, n.node.ref) : null), r = Y({});
    _e(() => [n.node?.id, n.node?.config], () => {
      r.value = { ...n.node?.config };
    }, { immediate: !0, flush: "sync" });
    function a(E) {
      r.value = E, i("update-node", { config: E });
    }
    const s = U(() => n.node?.kind === "block" && !!n.node.ref), l = U(() => n.node?.ref ? lg[n.node.ref]?.execution : void 0), c = U(() => s.value && ["function", "tool"].includes(l.value?.kind || "")), u = U(() => s.value && ug(n.node?.ref)), d = U(() => !n.node || !s.value ? null : oP(Pl(n.node.ref))), h = U(() => n.node && s.value ? cg(n.node.ref) : void 0), p = U(() => dg(d.value, "workflow-extension-node")), v = U(() => fg(d.value, "workflow-extension-node")), g = U(() => {
      const E = v.value && typeof v.value == "object" ? v.value.properties : null;
      return E && typeof E == "object" && !Array.isArray(E) ? Object.keys(E) : [];
    }), m = U(() => Object.fromEntries(
      g.value.filter((E) => r.value[E] !== void 0).map((E) => [E, r.value[E]])
    )), k = U(() => !!n.node && Cs(n.node.kind)), x = U(() => !!n.node && (k.value || n.node.pinned === !0 || !!n.node.boundary)), w = U(() => n.node && k.value ? hg[n.node.kind] : ""), b = U(() => {
      const E = r.value[w.value];
      return E && typeof E == "object" && !Array.isArray(E) ? E : { type: "object", properties: {} };
    }), C = U(() => n.node?.kind === "start" ? "Expected input" : n.node?.kind === "finish" ? "Result" : "Error details");
    function I(E) {
      w.value && a({ ...r.value, [w.value]: E });
    }
    function z(E) {
      !n.node || !E || typeof E != "object" || Array.isArray(E) || a({ ...r.value, ...E });
    }
    function T(E) {
      if (!p.value || !E || typeof E != "object" || Array.isArray(E)) return;
      const _ = p.value.key;
      _ in E && a({ ...r.value, [_]: E[_] });
    }
    function O(E) {
      if (!n.node) return;
      const _ = { ...r.value };
      for (const L of g.value) delete _[L];
      Object.assign(_, E), a(_);
    }
    const D = U(() => {
      const E = r.value.flow_ref;
      return E && typeof E == "object" && !Array.isArray(E) ? String(E.id || n.node?.ref || "") : String(n.node?.ref || "");
    });
    function B(E) {
      n.node && i("update-node", {
        title: E.title,
        config: {
          flow_ref: {
            kind: "flow",
            id: E.id,
            version: E.published_version
          }
        }
      });
    }
    const N = U(() => {
      const E = n.node?.kind;
      return E === "branch" || E === "cycle" || yi(E) || Fi(E);
    }), H = Y("");
    _e(() => n.node?.id, () => {
      H.value = Je(n.node?.title, n.node?.ref);
    }, { immediate: !0 });
    function y() {
      const E = H.value.trim();
      n.node && E && E !== n.node.title && i("update-node", { title: E });
    }
    return (E, _) => (S(), R("aside", iP, [
      V(f(fe), {
        class: "wf-panel-close",
        text: "",
        rounded: "",
        severity: "secondary",
        title: "Close",
        "aria-label": "Close inspector",
        onClick: _[0] || (_[0] = (L) => i("close"))
      }, {
        default: ne(() => [
          V(f(ie), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }),
      e.node && o.value ? (S(), R(ue, { key: 0 }, [
        $("div", {
          class: Ie(["wf-panel-hdr", f(Sd)(o.value.hueVar)])
        }, [
          _[9] || (_[9] = $("span", { class: "wf-panel-hdr-dot" }, null, -1)),
          $("span", rP, j(o.value.label), 1)
        ], 2),
        V(f(rt), {
          modelValue: H.value,
          "onUpdate:modelValue": _[1] || (_[1] = (L) => H.value = L),
          class: "wf-panel-title-input",
          "aria-label": "Step title",
          onChange: y,
          onKeydown: tt(y, ["enter"])
        }, null, 8, ["modelValue"]),
        $("p", aP, j(o.value.blurb), 1),
        k.value ? (S(), R(ue, { key: 0 }, [
          $("div", sP, [
            V(f(ie), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            _[10] || (_[10] = $("span", null, "Workflow boundary · can’t be removed", -1))
          ]),
          V(Ds, {
            mode: "schema",
            "model-value": b.value,
            "reset-key": e.node.id,
            surface: `workflow.boundary.${e.node.kind}`,
            label: C.value,
            onChange: I
          }, null, 8, ["model-value", "reset-key", "surface", "label"]),
          $("p", lP, j(e.node.kind === "start" ? "Describe what someone provides when this Workflow starts." : e.node.kind === "finish" ? "Describe what a successful run returns." : "Describe what a failed run returns."), 1)
        ], 64)) : Z("", !0),
        s.value ? (S(), R(ue, { key: 1 }, [
          h.value ? (S(), R(ue, { key: 0 }, [
            _[11] || (_[11] = $("div", { class: "wf-panel-label" }, "Configuration", -1)),
            V(ri, {
              tag: h.value,
              schema: f(Pl)(e.node.ref),
              config: r.value,
              onChange: z
            }, null, 8, ["tag", "schema", "config"])
          ], 64)) : p.value ? (S(), R(ue, { key: 1 }, [
            $("div", uP, j(u.value ? "Fixed input overrides" : p.value.title || "Configuration"), 1),
            u.value ? (S(), R("p", cP, " Optional fixed values override matching inputs from the connection. Leave them empty to use incoming data. ")) : Z("", !0),
            V(ri, {
              tag: p.value.tag,
              schema: p.value.schema,
              config: r.value,
              attrs: { value: r.value },
              onChange: T
            }, null, 8, ["tag", "schema", "config", "attrs"])
          ], 64)) : Z("", !0),
          !h.value && v.value ? (S(), R(ue, { key: 2 }, [
            p.value ? Z("", !0) : (S(), R("div", dP, j(u.value ? "Fixed input overrides" : "Configuration"), 1)),
            u.value && !p.value ? (S(), R("p", fP, " Optional fixed values override matching inputs from the connection. Leave them empty to use incoming data. ")) : Z("", !0),
            V(Tp, {
              "workflow-id": e.workflowId,
              "reset-key": e.node.id,
              "config-schema": v.value,
              "current-config": m.value,
              "upstream-schema": e.nodeUpstreamSchema,
              onAccept: O,
              onUndo: O
            }, null, 8, ["workflow-id", "reset-key", "config-schema", "current-config", "upstream-schema"]),
            V(ri, {
              tag: gP,
              schema: v.value,
              config: r.value,
              onChange: z
            }, null, 8, ["schema", "config"])
          ], 64)) : Z("", !0)
        ], 64)) : Z("", !0),
        e.node && c.value && l.value ? (S(), ae(fR, {
          key: e.node.id,
          node: e.node,
          execution: l.value,
          onUpdateNode: _[2] || (_[2] = (L) => i("update-node", L))
        }, null, 8, ["node", "execution"])) : Z("", !0),
        f(Cd)(e.node.kind) ? (S(), R(ue, { key: 3 }, [
          _[12] || (_[12] = $("div", { class: "wf-panel-label" }, "Workflow", -1)),
          V(KO, {
            "workflow-id": n.workflowId,
            "selected-id": D.value,
            "upstream-schema": n.nodeUpstreamSchema,
            onSelect: B
          }, null, 8, ["workflow-id", "selected-id", "upstream-schema"]),
          $("p", hP, j(f(kR)), 1)
        ], 64)) : Z("", !0),
        N.value ? (S(), ae(QR, {
          key: 4,
          "workflow-id": e.workflowId,
          node: e.node,
          "upstream-schema": e.nodeUpstreamSchema,
          "combine-branch-conflict": e.combineBranchConflict,
          onUpdateNode: _[3] || (_[3] = (L) => i("update-node", L))
        }, null, 8, ["workflow-id", "node", "upstream-schema", "combine-branch-conflict"])) : Z("", !0),
        x.value ? (S(), R("div", pP, [
          $("p", vP, [
            V(f(ie), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            _[13] || (_[13] = $("span", null, "This step is required and can’t be deleted.", -1))
          ])
        ])) : (S(), R("div", mP, [
          V(f(fe), {
            severity: "danger",
            onClick: _[4] || (_[4] = (L) => i("remove-node"))
          }, {
            default: ne(() => [
              V(f(ie), {
                icon: "tabler:trash",
                "aria-hidden": "true"
              }),
              _[14] || (_[14] = $("span", null, "Delete step", -1))
            ]),
            _: 1
          })
        ]))
      ], 64)) : e.edge ? (S(), ae(KD, {
        key: 1,
        "workflow-id": n.workflowId,
        edge: e.edge,
        "edge-upstream-schema": e.edgeUpstreamSchema,
        "edge-downstream-schema": e.edgeDownstreamSchema,
        "source-title": e.edgeSourceTitle,
        "target-title": e.edgeTargetTitle,
        onUpdateEdge: _[5] || (_[5] = (L) => i("update-edge", L)),
        onRemoveEdge: _[6] || (_[6] = (L) => i("remove-edge"))
      }, null, 8, ["workflow-id", "edge", "edge-upstream-schema", "edge-downstream-schema", "source-title", "target-title"])) : e.note ? (S(), ae(tP, {
        key: 2,
        note: e.note,
        onUpdateNote: _[7] || (_[7] = (L) => i("update-note", L)),
        onRemoveNote: _[8] || (_[8] = (L) => i("remove-note"))
      }, null, 8, ["note"])) : Z("", !0)
    ]));
  }
}), yP = {
  key: 0,
  class: "wf-sim-field"
}, wP = {
  key: 1,
  class: "wf-sim-note"
}, bP = /* @__PURE__ */ ye({
  __name: "RunWithInputDialog",
  props: {
    schema: {},
    modelValue: {},
    resetKey: {},
    hasFields: { type: Boolean },
    valid: { type: Boolean },
    errorMessage: {},
    canRun: { type: Boolean }
  },
  emits: ["close", "run", "update:modelValue", "valid"],
  setup(e, { emit: t }) {
    const n = t;
    function i(o) {
      o || n("close");
    }
    return (o, r) => (S(), ae(f(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      header: "Run with input",
      class: "wf-sim-pop",
      "onUpdate:visible": i
    }, {
      footer: ne(() => [
        V(f(fe), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: r[2] || (r[2] = (a) => n("close"))
        }),
        V(f(fe), {
          disabled: !e.canRun,
          onClick: r[3] || (r[3] = (a) => n("run"))
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:player-play",
              "aria-hidden": "true"
            }),
            r[6] || (r[6] = $("span", null, "Run", -1))
          ]),
          _: 1
        }, 8, ["disabled"])
      ]),
      default: ne(() => [
        r[7] || (r[7] = $("p", { class: "wf-sim-hint" }, "Try this Workflow with the input below. It checks the expected input and does not publish your changes.", -1)),
        e.hasFields ? (S(), R("div", yP, [
          r[4] || (r[4] = $("span", { class: "wf-sim-label" }, "Input", -1)),
          V(Ds, {
            mode: "value",
            schema: e.schema,
            "model-value": e.modelValue,
            "reset-key": e.resetKey,
            rows: 7,
            placeholder: '{ "key": "value" }',
            "onUpdate:modelValue": r[0] || (r[0] = (a) => n("update:modelValue", a)),
            onValid: r[1] || (r[1] = (a) => n("valid", a))
          }, null, 8, ["schema", "model-value", "reset-key"])
        ])) : (S(), R("p", wP, "This Workflow needs no input.")),
        e.valid ? Z("", !0) : (S(), ae(f(He), {
          key: 2,
          class: "wf-sim-err",
          severity: "error",
          closable: !1
        }, {
          default: ne(() => [...r[5] || (r[5] = [
            ce("Fix the JSON above before running.", -1)
          ])]),
          _: 1
        })),
        e.errorMessage ? (S(), ae(f(He), {
          key: 3,
          class: "wf-sim-err",
          severity: "error",
          closable: !1
        }, {
          default: ne(() => [
            ce(j(e.errorMessage), 1)
          ]),
          _: 1
        })) : Z("", !0)
      ]),
      _: 1
    }));
  }
});
function Pp(e) {
  const t = Y(null);
  let n = null;
  function i() {
    const o = t.value?.getBoundingClientRect();
    !o || o.width <= 0 || o.height <= 0 || e({ width: o.width, height: o.height });
  }
  return Ue(async () => {
    await Ve(), i(), !(typeof ResizeObserver > "u" || !t.value) && (n = new ResizeObserver(i), n.observe(t.value));
  }), Qe(() => {
    n?.disconnect(), n = null;
  }), { overlayEl: t };
}
const ld = "Mapped automatically", za = "Mapped automatically — view", _P = "Click to open the full mapper.";
function kP(e) {
  return `Mapped ${e} field${e === 1 ? "" : "s"} by name and type.`;
}
const EP = "What should flow here?", ud = "e.g. use the first search result’s link", xP = "Describe what should happen — mapping, branching and failure routes are previewed before anything changes.", $P = "Draft", SP = "Drafting from your description — this can take up to a minute.", CP = "Here’s the mapping I drafted", NP = "Apply", cd = "Open mapper", dd = "Redraft", fd = "Dismiss", hd = "I couldn’t draft that connection — edit your description and try again, or open the mapper to continue by hand.", IP = "The connection stays — it needs a mapping before this Workflow can run.", AP = { class: "wf-intent-hd" }, MP = {
  key: 0,
  class: "wf-intent-needs"
}, TP = {
  key: 1,
  class: "wf-intent-note"
}, OP = {
  key: 2,
  class: "wf-intent-help"
}, RP = { class: "wf-intent-foot" }, DP = { class: "wf-intent-hd" }, PP = {
  key: 0,
  class: "wf-intent-summary"
}, LP = {
  key: 1,
  class: "wf-intent-rows"
}, VP = { class: "wf-intent-src" }, BP = { class: "wf-intent-tgt" }, zP = {
  key: 1,
  class: "wf-intent-raw"
}, FP = {
  key: 2,
  class: "wf-intent-topology"
}, HP = { class: "wf-intent-step" }, qP = { class: "wf-intent-raw" }, UP = {
  key: 3,
  class: "wf-intent-topology"
}, WP = {
  key: 4,
  class: "wf-intent-topology"
}, YP = { class: "wf-intent-step" }, GP = { class: "wf-intent-foot" }, jP = { class: "wf-intent-hd wf-intent-hd--err" }, XP = { class: "wf-intent-help" }, KP = { class: "wf-intent-foot" }, ZP = /* @__PURE__ */ ye({
  __name: "EdgeIntentPopover",
  props: {
    workflowId: {},
    edge: {},
    availableSteps: {}
  },
  emits: ["accept", "suggest-node", "open-mapper", "dismiss", "measure"],
  setup(e, { emit: t }) {
    const n = e, i = t, { overlayEl: o } = Pp((C) => i("measure", C)), r = Y("intent"), a = Y(""), s = Y(null), l = Y(""), c = Y(null);
    let u = null;
    function d() {
      const C = c.value?.$el;
      C instanceof HTMLInputElement && C.focus();
    }
    Ue(() => Ve(d));
    function h() {
      u?.abort(), u = null, r.value = "intent", a.value = "", s.value = null, l.value = "", Ve(d);
    }
    _e(() => n.edge.id, h), Qe(() => u?.abort());
    const p = U(() => n.edge.unresolved.map((C) => C.title).filter(Boolean)), v = U(() => {
      const C = s.value?.kind === "mapping" ? s.value.transform : "", I = Ih(C);
      return I && I.length ? I : null;
    }), g = U(() => s.value?.kind === "condition" ? "Add a Condition?" : s.value?.kind === "failure_route" ? "Use the Failed route?" : s.value?.kind === "insert_node" ? "Suggested step" : CP), m = U(() => s.value?.kind === "condition" ? "tabler:arrows-split-2" : s.value?.kind === "failure_route" ? "tabler:route-x-2" : s.value?.kind === "insert_node" ? "tabler:box-padding" : "tabler:sparkles"), k = U(() => s.value?.kind === "condition" ? "Add Condition" : s.value?.kind === "failure_route" ? "Use Failed route" : s.value?.kind === "insert_node" ? "Show in palette" : NP);
    async function x() {
      const C = a.value.trim();
      if (!C || r.value === "drafting") return;
      u?.abort();
      const I = new AbortController(), z = n.edge.id;
      u = I, r.value = "drafting", l.value = "";
      const T = await qD(
        n.workflowId,
        { id: n.edge.id, source_id: n.edge.sourceId, target_id: n.edge.targetId },
        n.edge.sourceSchema,
        n.edge.targetSchema,
        C,
        n.edge.sourceFailureAvailable,
        n.availableSteps,
        {},
        I.signal
      );
      I.signal.aborted || u !== I || n.edge.id !== z || (u = null, WD(T) ? (s.value = T, r.value = "preview") : (l.value = T.error || hd, r.value = "error"));
    }
    function w() {
      const C = s.value;
      C && (C.kind === "insert_node" ? i("suggest-node", C.block_id) : (C.kind !== "failure_route" || C.available) && i("accept", C));
    }
    function b() {
      r.value = "intent", Ve(d);
    }
    return (C, I) => (S(), R("div", {
      ref_key: "overlayEl",
      ref: o,
      class: "wf-intent",
      role: "region",
      "aria-label": "Describe this connection",
      onKeydown: I[6] || (I[6] = tt(Fe((z) => i("dismiss"), ["stop", "prevent"]), ["esc"])),
      onPointerdown: I[7] || (I[7] = Fe(() => {
      }, ["stop"]))
    }, [
      V(f(fe), {
        class: "wf-intent-x",
        text: "",
        rounded: "",
        severity: "secondary",
        "aria-label": "Dismiss",
        title: f(fd),
        onClick: I[0] || (I[0] = (z) => i("dismiss"))
      }, {
        default: ne(() => [
          V(f(ie), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }, 8, ["title"]),
      r.value === "intent" || r.value === "drafting" ? (S(), R(ue, { key: 0 }, [
        $("div", AP, [
          V(f(ie), {
            icon: "tabler:wand",
            "aria-hidden": "true"
          }),
          $("span", null, j(f(EP)), 1)
        ]),
        p.value.length ? (S(), R("p", MP, [
          I[8] || (I[8] = ce("Needs ", -1)),
          $("strong", null, j(p.value.join(", ")), 1),
          I[9] || (I[9] = ce(".", -1))
        ])) : Z("", !0),
        V(f(rt), {
          ref_key: "inputEl",
          ref: c,
          modelValue: a.value,
          "onUpdate:modelValue": I[1] || (I[1] = (z) => a.value = z),
          class: "wf-intent-input",
          placeholder: f(ud),
          disabled: r.value === "drafting",
          "aria-label": "What should flow across this connection",
          onKeydown: tt(Fe(x, ["prevent"]), ["enter"])
        }, null, 8, ["modelValue", "placeholder", "disabled", "onKeydown"]),
        r.value === "drafting" ? (S(), R("p", TP, [
          V(f(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Drafting connection"
          }),
          ce(" " + j(f(SP)), 1)
        ])) : (S(), R("p", OP, j(f(xP)), 1)),
        $("div", RP, [
          V(f(fe), {
            severity: "secondary",
            outlined: "",
            onClick: I[2] || (I[2] = (z) => i("dismiss"))
          }, {
            default: ne(() => [
              ce(j(f(fd)), 1)
            ]),
            _: 1
          }),
          V(f(fe), {
            class: "wf-intent-submit",
            disabled: !a.value.trim() || r.value === "drafting",
            loading: r.value === "drafting",
            onClick: x
          }, {
            default: ne(() => [
              r.value !== "drafting" ? (S(), ae(f(ie), {
                key: 0,
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              })) : Z("", !0),
              $("span", null, j(f($P)), 1)
            ]),
            _: 1
          }, 8, ["disabled", "loading"])
        ])
      ], 64)) : r.value === "preview" ? (S(), R(ue, { key: 1 }, [
        $("div", DP, [
          V(f(ie), {
            icon: m.value,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          $("span", null, j(g.value), 1)
        ]),
        s.value?.summary ? (S(), R("p", PP, j(s.value.summary), 1)) : Z("", !0),
        s.value?.kind === "mapping" ? (S(), R("div", LP, [
          v.value && v.value.length ? (S(!0), R(ue, { key: 0 }, Re(v.value, (z) => (S(), R("div", {
            key: z.key,
            class: "wf-intent-row"
          }, [
            $("code", VP, j(z.rhs), 1),
            V(f(ie), {
              icon: "tabler:arrow-right",
              "aria-hidden": "true"
            }),
            $("code", BP, j(z.key), 1)
          ]))), 128)) : (S(), R("code", zP, j(s.value.transform), 1))
        ])) : s.value?.kind === "condition" ? (S(), R("div", FP, [
          $("span", HP, [
            V(f(ie), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            I[10] || (I[10] = ce("Condition", -1))
          ]),
          $("code", qP, j(s.value.predicate), 1),
          I[11] || (I[11] = $("p", { class: "wf-intent-help" }, "The current connection becomes the True path. The False path stays visible for you to connect.", -1))
        ])) : s.value?.kind === "failure_route" ? (S(), R("div", UP, [
          $("span", {
            class: Ie(["wf-intent-step", !s.value.available && "is-unavailable"])
          }, [
            V(f(ie), {
              icon: "tabler:route-x-2",
              "aria-hidden": "true"
            }),
            I[12] || (I[12] = ce("Failed", -1))
          ], 2),
          s.value.available ? Z("", !0) : (S(), ae(f(He), {
            key: 0,
            class: "wf-intent-err",
            severity: "warn",
            closable: !1
          }, {
            default: ne(() => [...I[13] || (I[13] = [
              ce("This step has no Failed output to connect.", -1)
            ])]),
            _: 1
          }))
        ])) : s.value?.kind === "insert_node" ? (S(), R("div", WP, [
          $("span", YP, [
            V(f(ie), {
              icon: "tabler:box-padding",
              "aria-hidden": "true"
            }),
            ce(j(s.value.block_title), 1)
          ]),
          I[14] || (I[14] = $("p", { class: "wf-intent-help" }, "This is an existing Workflow step. Choose it from the palette before the graph changes.", -1))
        ])) : Z("", !0),
        $("div", GP, [
          V(f(fe), {
            severity: "secondary",
            outlined: "",
            onClick: b
          }, {
            default: ne(() => [
              ce(j(f(dd)), 1)
            ]),
            _: 1
          }),
          s.value?.kind === "mapping" ? (S(), ae(f(fe), {
            key: 0,
            severity: "secondary",
            outlined: "",
            onClick: I[3] || (I[3] = (z) => i("open-mapper"))
          }, {
            default: ne(() => [
              ce(j(f(cd)), 1)
            ]),
            _: 1
          })) : Z("", !0),
          V(f(fe), {
            class: "wf-intent-submit",
            disabled: s.value?.kind === "failure_route" && !s.value.available,
            onClick: w
          }, {
            default: ne(() => [
              V(f(ie), {
                icon: "tabler:check",
                "aria-hidden": "true"
              }),
              $("span", null, j(k.value), 1)
            ]),
            _: 1
          }, 8, ["disabled"])
        ])
      ], 64)) : (S(), R(ue, { key: 2 }, [
        $("div", jP, [
          V(f(ie), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          I[15] || (I[15] = $("span", null, "Couldn’t draft that", -1))
        ]),
        V(f(He), {
          class: "wf-intent-err",
          severity: "error",
          closable: !1
        }, {
          default: ne(() => [
            ce(j(l.value || f(hd)), 1)
          ]),
          _: 1
        }),
        V(f(rt), {
          ref_key: "inputEl",
          ref: c,
          modelValue: a.value,
          "onUpdate:modelValue": I[4] || (I[4] = (z) => a.value = z),
          class: "wf-intent-input",
          placeholder: f(ud),
          "aria-label": "What should flow across this connection",
          onKeydown: tt(Fe(x, ["prevent"]), ["enter"])
        }, null, 8, ["modelValue", "placeholder", "onKeydown"]),
        $("p", XP, j(f(IP)), 1),
        $("div", KP, [
          V(f(fe), {
            severity: "secondary",
            outlined: "",
            onClick: I[5] || (I[5] = (z) => i("open-mapper"))
          }, {
            default: ne(() => [
              ce(j(f(cd)), 1)
            ]),
            _: 1
          }),
          V(f(fe), {
            class: "wf-intent-submit",
            disabled: !a.value.trim(),
            onClick: x
          }, {
            default: ne(() => [
              V(f(ie), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              }),
              $("span", null, j(f(dd)), 1)
            ]),
            _: 1
          }, 8, ["disabled"])
        ])
      ], 64))
    ], 544));
  }
}), JP = { class: "wf-automap-hd" }, QP = { class: "wf-automap-title" }, e3 = { class: "wf-automap-count" }, t3 = { class: "wf-automap-pairs" }, n3 = ["title"], o3 = { class: "wf-automap-src" }, i3 = { class: "wf-automap-tgt" }, r3 = { class: "wf-automap-hint" }, a3 = { class: "wf-automap-tracelbl" }, s3 = {
  key: 0,
  class: "wf-automap-why"
}, l3 = 2600, u3 = 1200, c3 = /* @__PURE__ */ ye({
  __name: "AutoMapReveal",
  props: {
    entry: {}
  },
  emits: ["open", "dismiss", "measure"],
  setup(e, { emit: t }) {
    const n = e, i = t, { overlayEl: o } = Pp((p) => i("measure", p)), r = Y("reveal"), a = Y(!1);
    let s = null;
    const l = U(() => n.entry.result.fields), c = U(() => kP(l.value.length));
    function u(p) {
      s && clearTimeout(s), s = setTimeout(() => {
        r.value = "trace";
      }, p);
    }
    function d() {
      s && (clearTimeout(s), s = null);
    }
    function h() {
      r.value === "reveal" && u(u3);
    }
    return Ue(() => u(l3)), Qe(() => {
      s && clearTimeout(s);
    }), (p, v) => (S(), R("div", {
      ref_key: "overlayEl",
      ref: o,
      class: "wf-automap",
      onPointerdown: v[7] || (v[7] = Fe(() => {
      }, ["stop"]))
    }, [
      r.value === "reveal" ? (S(), ae(f(fe), {
        key: 0,
        class: "wf-automap-card",
        severity: "secondary",
        outlined: "",
        "aria-label": `${f(ld)}. ${c.value}. Open mapping`,
        onMouseenter: d,
        onMouseleave: h,
        onClick: v[0] || (v[0] = (g) => i("open", e.entry.id))
      }, {
        default: ne(() => [
          $("span", JP, [
            V(f(ie), {
              icon: "tabler:wand",
              "aria-hidden": "true"
            }),
            $("span", QP, j(f(ld)), 1),
            $("span", e3, j(c.value), 1)
          ]),
          $("span", t3, [
            (S(!0), R(ue, null, Re(l.value, (g) => (S(), R("span", {
              key: g.key,
              class: "wf-automap-pair",
              title: g.why
            }, [
              $("code", o3, j(g.sourceName), 1),
              V(f(ie), {
                icon: "tabler:arrow-right",
                "aria-hidden": "true"
              }),
              $("code", i3, j(g.title), 1)
            ], 8, n3))), 128))
          ]),
          $("span", r3, j(f(_P)), 1)
        ]),
        _: 1
      }, 8, ["aria-label"])) : (S(), R("div", {
        key: 1,
        class: Ie(["wf-automap-trace", { "is-open": a.value }]),
        onMouseenter: v[3] || (v[3] = (g) => a.value = !0),
        onMouseleave: v[4] || (v[4] = (g) => a.value = !1),
        onFocusin: v[5] || (v[5] = (g) => a.value = !0),
        onFocusout: v[6] || (v[6] = (g) => a.value = !1)
      }, [
        V(f(fe), {
          class: "wf-automap-tracebtn",
          text: "",
          rounded: "",
          severity: "secondary",
          "aria-label": f(za),
          title: f(za),
          onClick: v[1] || (v[1] = (g) => i("open", e.entry.id))
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:wand",
              "aria-hidden": "true"
            }),
            $("span", a3, j(f(za)), 1)
          ]),
          _: 1
        }, 8, ["aria-label", "title"]),
        V(f(fe), {
          class: "wf-automap-tracex",
          text: "",
          rounded: "",
          severity: "secondary",
          "aria-label": "Dismiss automatic mapping explanation",
          onClick: v[2] || (v[2] = (g) => i("dismiss", e.entry.id))
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }),
        a.value ? (S(), R("div", s3, [
          (S(!0), R(ue, null, Re(l.value, (g) => (S(), R("p", {
            key: g.key,
            class: "wf-automap-whyline"
          }, j(g.why), 1))), 128))
        ])) : Z("", !0)
      ], 34))
    ], 544));
  }
}), d3 = { class: "wf-top" }, f3 = { class: "wf-top-count" }, h3 = { class: "wf-toolbar-menu-wrap" }, p3 = ["disabled"], v3 = ["aria-pressed"], m3 = { class: "wf-toolbar-menu-wrap" }, g3 = ["disabled"], y3 = /* @__PURE__ */ ye({
  __name: "CanvasToolbar",
  props: {
    paletteOpen: { type: Boolean },
    countLabel: {},
    canUndo: { type: Boolean },
    canRedo: { type: Boolean },
    viewingRun: { type: Boolean },
    layoutDir: {},
    runsOpen: { type: Boolean },
    runActive: { type: Boolean },
    simBusy: { type: Boolean },
    publishedVersion: {},
    exportBusy: { type: Boolean },
    historyOpen: { type: Boolean },
    publishBusy: { type: Boolean }
  },
  emits: ["back", "toggle-palette", "undo", "redo", "fit", "auto-layout", "toggle-direction", "edit-connections", "toggle-runs", "add-trigger", "share", "run-published", "run", "export", "toggle-history", "publish"],
  setup(e, { emit: t }) {
    const n = e, i = U(() => tp(n.publishedVersion)), o = U(() => i.value ? "Choose when this Workflow runs" : ps), r = U(() => i.value ? "Add trigger" : `Add trigger unavailable. ${ps}.`), a = t;
    function s(x) {
      return x.currentTarget instanceof HTMLElement ? x.currentTarget : null;
    }
    function l() {
      const x = Y(!1), w = Y(null), b = Y(null);
      async function C() {
        x.value = !x.value, x.value && (await Ve(), b.value?.querySelector("button:not(:disabled)")?.focus());
      }
      function I(O = !1) {
        x.value && (x.value = !1, O && Ve(() => w.value?.focus()));
      }
      async function z(O) {
        x.value = !1, await Ve(), w.value?.focus(), O();
      }
      function T(O) {
        if (O.key === "Escape") {
          O.preventDefault(), I(!0);
          return;
        }
        if (O.key !== "ArrowDown" && O.key !== "ArrowUp" && O.key !== "Home" && O.key !== "End") return;
        const D = Array.from(b.value?.querySelectorAll("button:not(:disabled)") || []);
        if (!D.length) return;
        O.preventDefault();
        const B = D.indexOf(document.activeElement), N = O.key === "Home" ? 0 : O.key === "End" ? D.length - 1 : O.key === "ArrowDown" ? (B + 1 + D.length) % D.length : (B - 1 + D.length) % D.length;
        D[N].focus();
      }
      return { open: x, button: w, menu: b, toggle: C, close: I, choose: z, onKeydown: T };
    }
    const c = l(), u = l();
    async function d() {
      u.close(), await c.toggle();
    }
    async function h() {
      c.close(), await u.toggle();
    }
    function p(x) {
      if (x instanceof HTMLElement) return x;
      const w = x?.$el;
      return w instanceof HTMLElement ? w : null;
    }
    function v(x) {
      c.button.value = p(x);
    }
    function g(x) {
      c.menu.value = p(x);
    }
    function m(x) {
      u.button.value = p(x);
    }
    function k(x) {
      u.menu.value = p(x);
    }
    return (x, w) => (S(), R("header", d3, [
      V(f(fe), {
        text: "",
        rounded: "",
        title: "Back to Workflows",
        "aria-label": "Back to Workflows",
        onClick: w[0] || (w[0] = (b) => a("back"))
      }, {
        default: ne(() => [
          V(f(ie), {
            icon: "tabler:arrow-left",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }),
      $("span", f3, j(e.countLabel), 1),
      w[31] || (w[31] = $("div", { class: "wf-top-spacer" }, null, -1)),
      V(f(Vg), { class: "wf-edit-actions" }, {
        default: ne(() => [
          V(f(fe), {
            severity: "secondary",
            outlined: "",
            disabled: !e.canUndo || e.viewingRun,
            title: "Undo (⌘Z)",
            "aria-label": "Undo",
            onClick: w[1] || (w[1] = (b) => a("undo"))
          }, {
            default: ne(() => [
              V(f(ie), {
                icon: "tabler:arrow-back-up",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }, 8, ["disabled"]),
          V(f(fe), {
            severity: "secondary",
            outlined: "",
            disabled: !e.canRedo || e.viewingRun,
            title: "Redo (⌘⇧Z)",
            "aria-label": "Redo",
            onClick: w[2] || (w[2] = (b) => a("redo"))
          }, {
            default: ne(() => [
              V(f(ie), {
                icon: "tabler:arrow-forward-up",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }, 8, ["disabled"]),
          V(f(fe), {
            severity: "secondary",
            outlined: "",
            disabled: e.viewingRun,
            title: "Edit connections",
            "aria-label": "Edit connections",
            onClick: w[3] || (w[3] = (b) => a("edit-connections", s(b)))
          }, {
            default: ne(() => [
              V(f(ie), {
                icon: "tabler:arrows-join-2",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }, 8, ["disabled"])
        ]),
        _: 1
      }),
      w[32] || (w[32] = $("span", { class: "wf-vsep" }, null, -1)),
      $("div", h3, [
        V(f(fe), {
          ref: v,
          class: "wf-toolbar-compactable",
          severity: "secondary",
          outlined: !f(c).open.value,
          title: "View controls",
          "aria-label": "View controls",
          "aria-haspopup": "menu",
          "aria-expanded": f(c).open.value,
          onClick: d
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            w[20] || (w[20] = $("span", null, "View", -1))
          ]),
          _: 1
        }, 8, ["outlined", "aria-expanded"]),
        f(c).open.value ? (S(), R("div", {
          key: 0,
          class: "wf-toolbar-menu-backdrop",
          onClick: w[4] || (w[4] = (b) => f(c).close())
        })) : Z("", !0),
        f(c).open.value ? (S(), R("div", {
          key: 1,
          ref: g,
          class: "wf-toolbar-menu",
          role: "menu",
          "aria-label": "View controls",
          onKeydown: w[9] || (w[9] = //@ts-ignore
          (...b) => f(c).onKeydown && f(c).onKeydown(...b))
        }, [
          $("button", {
            role: "menuitem",
            onClick: w[5] || (w[5] = (b) => f(c).choose(() => a("fit")))
          }, [
            V(f(ie), {
              icon: "tabler:maximize",
              "aria-hidden": "true"
            }),
            w[21] || (w[21] = ce("Fit view", -1))
          ]),
          $("button", {
            role: "menuitem",
            disabled: e.viewingRun,
            onClick: w[6] || (w[6] = (b) => f(c).choose(() => a("auto-layout")))
          }, [
            V(f(ie), {
              icon: "tabler:layout-distribute-vertical",
              "aria-hidden": "true"
            }),
            w[22] || (w[22] = ce("Auto layout", -1))
          ], 8, p3),
          $("button", {
            role: "menuitem",
            onClick: w[7] || (w[7] = (b) => f(c).choose(() => a("toggle-direction")))
          }, [
            V(f(ie), {
              icon: e.layoutDir === "TB" ? "tabler:arrow-right" : "tabler:arrow-down",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ce("Lay out " + j(e.layoutDir === "TB" ? "left to right" : "top to bottom"), 1)
          ]),
          w[23] || (w[23] = $("span", {
            class: "wf-toolbar-menu-sep",
            role: "separator"
          }, null, -1)),
          $("button", {
            role: "menuitem",
            "data-testid": "palette-toggle",
            "aria-pressed": e.paletteOpen,
            onClick: w[8] || (w[8] = (b) => f(c).choose(() => a("toggle-palette")))
          }, [
            V(f(ie), {
              icon: e.paletteOpen ? "tabler:layout-sidebar-left-collapse" : "tabler:layout-sidebar-left-expand",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ce(j(e.paletteOpen ? "Hide steps" : "Show steps"), 1)
          ], 8, v3)
        ], 544)) : Z("", !0)
      ]),
      V(f(fe), {
        class: "wf-toolbar-compactable",
        severity: "secondary",
        outlined: !(e.runsOpen || e.viewingRun),
        title: "Past runs",
        "aria-label": "Past runs",
        onClick: w[10] || (w[10] = (b) => a("toggle-runs", s(b)))
      }, {
        default: ne(() => [
          V(f(ie), {
            icon: "tabler:history",
            "aria-hidden": "true"
          }),
          w[24] || (w[24] = $("span", null, "Past runs", -1))
        ]),
        _: 1
      }, 8, ["outlined"]),
      V(f(fe), {
        class: "wf-toolbar-compactable",
        severity: "secondary",
        outlined: !e.historyOpen,
        title: "Version history",
        "aria-label": "Versions",
        onClick: w[11] || (w[11] = (b) => a("toggle-history", s(b)))
      }, {
        default: ne(() => [
          V(f(ie), {
            icon: "tabler:versions",
            "aria-hidden": "true"
          }),
          w[25] || (w[25] = $("span", null, "Versions", -1))
        ]),
        _: 1
      }, 8, ["outlined"]),
      w[33] || (w[33] = $("span", { class: "wf-vsep" }, null, -1)),
      V(f(fe), {
        class: "wf-toolbar-compactable",
        severity: "secondary",
        outlined: "",
        disabled: !i.value,
        title: o.value,
        "aria-label": r.value,
        onClick: w[12] || (w[12] = (b) => a("add-trigger", s(b)))
      }, {
        default: ne(() => [
          V(f(ie), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          }),
          w[26] || (w[26] = $("span", null, "Add trigger", -1))
        ]),
        _: 1
      }, 8, ["disabled", "title", "aria-label"]),
      w[34] || (w[34] = $("div", { class: "wf-top-spacer" }, null, -1)),
      V(f(fe), {
        severity: e.runActive ? "danger" : void 0,
        disabled: e.simBusy,
        loading: e.simBusy,
        title: e.runActive ? "Stop the running workflow" : "Run with an input",
        onClick: w[13] || (w[13] = (b) => a("run", s(b)))
      }, {
        default: ne(() => [
          e.simBusy ? Z("", !0) : (S(), ae(f(ie), {
            key: 0,
            icon: e.runActive ? "tabler:player-stop" : "tabler:player-play",
            "aria-hidden": "true"
          }, null, 8, ["icon"])),
          $("span", null, j(e.runActive ? "Stop" : "Run"), 1)
        ]),
        _: 1
      }, 8, ["severity", "disabled", "loading", "title"]),
      V(f(fe), {
        severity: "secondary",
        outlined: "",
        "aria-label": "Run published",
        disabled: !e.publishedVersion || e.viewingRun,
        title: "Run a published version with a selected account",
        onClick: w[14] || (w[14] = (b) => a("run-published", s(b)))
      }, {
        default: ne(() => [...w[27] || (w[27] = [
          ce("Run published", -1)
        ])]),
        _: 1
      }, 8, ["disabled"]),
      $("div", m3, [
        V(f(fe), {
          ref: m,
          text: "",
          rounded: "",
          severity: f(u).open.value ? void 0 : "secondary",
          title: "More workflow actions",
          "aria-label": "More workflow actions",
          "aria-haspopup": "menu",
          "aria-expanded": f(u).open.value,
          onClick: h
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:dots",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["severity", "aria-expanded"]),
        f(u).open.value ? (S(), R("div", {
          key: 0,
          class: "wf-toolbar-menu-backdrop",
          onClick: w[15] || (w[15] = (b) => f(u).close())
        })) : Z("", !0),
        f(u).open.value ? (S(), R("div", {
          key: 1,
          ref: k,
          class: "wf-toolbar-menu",
          role: "menu",
          "aria-label": "More workflow actions",
          onKeydown: w[18] || (w[18] = //@ts-ignore
          (...b) => f(u).onKeydown && f(u).onKeydown(...b))
        }, [
          $("button", {
            role: "menuitem",
            onClick: w[16] || (w[16] = (b) => f(u).choose(() => a("share", f(u).button.value)))
          }, [
            V(f(ie), {
              icon: "tabler:share",
              "aria-hidden": "true"
            }),
            w[28] || (w[28] = ce("Share", -1))
          ]),
          $("button", {
            role: "menuitem",
            disabled: !e.publishedVersion || e.exportBusy,
            onClick: w[17] || (w[17] = (b) => f(u).choose(() => a("export")))
          }, [
            V(f(ie), {
              icon: "tabler:download",
              "aria-hidden": "true"
            }),
            w[29] || (w[29] = ce("Export", -1))
          ], 8, g3)
        ], 544)) : Z("", !0)
      ]),
      V(f(fe), {
        severity: "secondary",
        outlined: "",
        disabled: e.publishBusy,
        loading: e.publishBusy,
        title: "Publish this workflow",
        onClick: w[19] || (w[19] = (b) => a("publish"))
      }, {
        default: ne(() => [
          e.publishBusy ? Z("", !0) : (S(), ae(f(ie), {
            key: 0,
            icon: "tabler:rocket",
            "aria-hidden": "true"
          })),
          w[30] || (w[30] = $("span", null, "Publish", -1))
        ]),
        _: 1
      }, 8, ["disabled", "loading"])
    ]));
  }
}), w3 = { class: "kx-modal-head-icon" }, b3 = { class: "kx-modal-body" }, _3 = {
  class: "wf-connections-form",
  "aria-describedby": "wf-connection-help"
}, k3 = { class: "wf-connections-field" }, E3 = {
  key: 0,
  id: "wf-connection-source-error",
  role: "alert"
}, x3 = { class: "wf-connections-field" }, $3 = {
  key: 0,
  id: "wf-connection-target-error",
  role: "alert"
}, S3 = {
  class: "wf-connections-existing",
  "aria-labelledby": "wf-connections-existing-title"
}, C3 = { key: 1 }, N3 = /* @__PURE__ */ ye({
  __name: "ConnectionEditorDialog",
  props: {
    sources: {},
    targets: {},
    edges: {},
    targetHandle: {},
    disabled: { type: Boolean }
  },
  emits: ["close", "create", "remove"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = {
      header: { class: "kx-modal-head" },
      content: { style: "padding: 0" },
      footer: { class: "kx-modal-foot" }
    }, r = Y(null), a = Y(null), s = Y(!1), l = U(() => n.sources.find((g) => g.key === r.value)), c = U(() => n.targets.filter((g) => g.nodeId !== l.value?.nodeId)), u = U(() => s.value && !l.value), d = U(() => s.value && !a.value);
    _e(r, () => {
      c.value.some((g) => g.nodeId === a.value) || (a.value = null);
    });
    function h(g) {
      g || i("close");
    }
    function p(g) {
      g.composedPath().find((k) => k instanceof HTMLElement && k.getAttribute("role") === "combobox")?.getAttribute("aria-expanded") !== "true" && i("close");
    }
    function v() {
      s.value = !0;
      const g = l.value;
      !g || !a.value || (i("create", {
        source: g.nodeId,
        sourceHandle: g.handle,
        target: a.value,
        targetHandle: n.targetHandle
      }), i("close"));
    }
    return (g, m) => (S(), ae(f(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      class: "kx-modal wf-connections-modal",
      pt: o,
      "aria-label": "Edit connections",
      "aria-labelledby": null,
      "onUpdate:visible": h,
      onKeydownCapture: tt(p, ["esc"])
    }, {
      header: ne(() => [
        $("span", w3, [
          V(f(ie), {
            icon: "tabler:arrows-join-2",
            "aria-hidden": "true"
          })
        ]),
        m[3] || (m[3] = $("div", { class: "kx-modal-head-text" }, [
          $("div", { class: "kx-modal-head-title" }, "Edit connections"),
          $("div", {
            id: "wf-connection-help",
            class: "kx-modal-head-sub"
          }, " Create a connection without dragging on the canvas, or remove an existing connection below. ")
        ], -1))
      ]),
      footer: ne(() => [
        V(f(fe), {
          severity: "secondary",
          text: "",
          onClick: m[2] || (m[2] = (k) => i("close"))
        }, {
          default: ne(() => [...m[8] || (m[8] = [
            ce("Close", -1)
          ])]),
          _: 1
        }),
        V(f(fe), {
          disabled: e.disabled,
          onClick: v
        }, {
          default: ne(() => [...m[9] || (m[9] = [
            ce("Create connection", -1)
          ])]),
          _: 1
        }, 8, ["disabled"])
      ]),
      default: ne(() => [
        $("div", b3, [
          $("div", _3, [
            $("div", k3, [
              m[4] || (m[4] = $("label", { for: "wf-connection-source" }, [
                ce("From "),
                $("span", { "aria-hidden": "true" }, "*")
              ], -1)),
              V(f(St), {
                modelValue: r.value,
                "onUpdate:modelValue": m[0] || (m[0] = (k) => r.value = k),
                "input-id": "wf-connection-source",
                options: e.sources,
                "option-label": "label",
                "option-value": "key",
                placeholder: "Choose a step and output",
                invalid: u.value,
                "aria-required": "true",
                "aria-invalid": u.value,
                "aria-describedby": u.value ? "wf-connection-source-error" : void 0,
                pt: { label: { autofocus: !0 } }
              }, null, 8, ["modelValue", "options", "invalid", "aria-invalid", "aria-describedby"]),
              u.value ? (S(), R("small", E3, "Choose a source step and output.")) : Z("", !0)
            ]),
            $("div", x3, [
              m[5] || (m[5] = $("label", { for: "wf-connection-target" }, [
                ce("To "),
                $("span", { "aria-hidden": "true" }, "*")
              ], -1)),
              V(f(St), {
                modelValue: a.value,
                "onUpdate:modelValue": m[1] || (m[1] = (k) => a.value = k),
                "input-id": "wf-connection-target",
                options: c.value,
                "option-label": "label",
                "option-value": "nodeId",
                placeholder: "Choose a destination step",
                disabled: !l.value,
                invalid: d.value,
                "aria-required": "true",
                "aria-invalid": d.value,
                "aria-describedby": d.value ? "wf-connection-target-error" : void 0
              }, null, 8, ["modelValue", "options", "disabled", "invalid", "aria-invalid", "aria-describedby"]),
              d.value ? (S(), R("small", $3, "Choose a destination step.")) : Z("", !0)
            ])
          ]),
          $("section", S3, [
            m[7] || (m[7] = $("h3", { id: "wf-connections-existing-title" }, "Existing connections", -1)),
            e.edges.length ? (S(), R("ul", C3, [
              (S(!0), R(ue, null, Re(e.edges, (k) => (S(), R("li", {
                key: k.id
              }, [
                $("span", null, j(k.label), 1),
                V(f(fe), {
                  text: "",
                  rounded: "",
                  severity: "danger",
                  disabled: e.disabled,
                  "aria-label": `Delete ${k.label}`,
                  title: "Delete connection",
                  onClick: (x) => i("remove", k.id)
                }, {
                  default: ne(() => [
                    V(f(ie), {
                      icon: "tabler:trash",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }, 8, ["disabled", "aria-label", "onClick"])
              ]))), 128))
            ])) : (S(), ae(f(He), {
              key: 0,
              severity: "info",
              closable: !1
            }, {
              default: ne(() => [...m[6] || (m[6] = [
                ce("There are no connections yet.", -1)
              ])]),
              _: 1
            }))
          ])
        ])
      ]),
      _: 1
    }));
  }
}), I3 = { class: "wf-drop-search" }, A3 = {
  class: "wf-drop-list",
  role: "listbox"
}, M3 = ["aria-selected", "onMouseenter", "onClick"], T3 = { class: "wf-drop-title" }, O3 = { class: "wf-drop-cat" }, R3 = {
  key: 0,
  class: "wf-drop-empty"
}, D3 = /* @__PURE__ */ ye({
  __name: "ConnectDropPicker",
  props: {
    items: {},
    x: {},
    y: {}
  },
  emits: ["pick", "close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = Y(""), r = Y(0), a = Y(null), s = U(() => {
      const d = o.value.trim().toLowerCase();
      return (d ? n.items.filter((p) => `${p.title} ${p.subtitle} ${p.category}`.toLowerCase().includes(d)) : n.items).slice(0, 12);
    });
    function l(d) {
      const h = s.value.length;
      h && (r.value = (r.value + d + h) % h);
    }
    function c() {
      const d = s.value[r.value];
      d && i("pick", d);
    }
    function u(d) {
      d.key === "ArrowDown" ? (d.preventDefault(), l(1)) : d.key === "ArrowUp" ? (d.preventDefault(), l(-1)) : d.key === "Enter" ? (d.preventDefault(), c()) : d.key === "Escape" ? (d.preventDefault(), d.stopPropagation(), i("close")) : r.value = 0;
    }
    return Ue(() => {
      Ve(() => a.value?.focus());
    }), (d, h) => (S(), R(ue, null, [
      $("div", {
        class: "wf-ctx-backdrop",
        onClick: h[0] || (h[0] = (p) => i("close")),
        onContextmenu: h[1] || (h[1] = Fe((p) => i("close"), ["prevent"]))
      }, null, 32),
      $("div", {
        class: "wf-drop-picker",
        role: "dialog",
        "aria-label": "Add a connected step",
        style: ze({ left: e.x + "px", top: e.y + "px" })
      }, [
        $("div", I3, [
          V(f(ie), {
            icon: "tabler:search",
            "aria-hidden": "true"
          }),
          wd($("input", {
            ref_key: "inputEl",
            ref: a,
            "onUpdate:modelValue": h[2] || (h[2] = (p) => o.value = p),
            placeholder: "Add a step…",
            onKeydown: u
          }, null, 544), [
            [Gm, o.value]
          ])
        ]),
        $("ul", A3, [
          (S(!0), R(ue, null, Re(s.value, (p, v) => (S(), R("li", {
            key: p.paletteId
          }, [
            $("button", {
              class: Ie(["wf-drop-item", { on: v === r.value }]),
              role: "option",
              "aria-selected": v === r.value,
              onMouseenter: (g) => r.value = v,
              onClick: (g) => i("pick", p)
            }, [
              V(f(ie), {
                icon: p.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              $("span", T3, j(p.title), 1),
              $("span", O3, j(p.category), 1)
            ], 42, M3)
          ]))), 128)),
          s.value.length ? Z("", !0) : (S(), R("li", R3, "No steps match."))
        ])
      ], 4)
    ], 64));
  }
}), P3 = { class: "wf-run-notice-text" }, L3 = {
  key: 0,
  class: "wf-err-code"
}, V3 = { class: "wf-body" }, B3 = {
  key: 0,
  class: "wf-empty-canvas"
}, z3 = {
  key: 1,
  class: "wf-run-fail-strip",
  role: "status"
}, F3 = { class: "wf-run-fail-strip-txt" }, H3 = { key: 0 }, q3 = {
  key: 4,
  class: "wf-canvas-loading"
}, U3 = /* @__PURE__ */ ye({
  __name: "WorkflowCanvasView",
  props: {
    workflowId: {},
    model: {}
  },
  emits: ["back", "open-workflow"],
  setup(e, { emit: t }) {
    const n = e, i = n.workflowId, o = bd(n.model), r = Ne(o, "rootEl"), a = Ne(o, "canvasEl"), s = Ne(o, "shareHost"), l = t;
    return (c, u) => (S(), R("div", {
      ref_key: "rootEl",
      ref: r,
      class: Ie(["wf-canvas-root", { "wf--run": f(o).runState.active || !!f(o).viewingRun }]),
      tabindex: "0",
      onKeydown: u[21] || (u[21] = //@ts-ignore
      (...d) => f(o).onKeyDown && f(o).onKeyDown(...d))
    }, [
      V(f(zd), { group: "node-delete" }),
      V(y3, {
        "palette-open": f(o).paletteOpen,
        "count-label": f(o).countLabel,
        "can-undo": f(o).canUndo,
        "can-redo": f(o).canRedo,
        "viewing-run": !!f(o).viewingRun,
        "layout-dir": f(o).layoutDir,
        "runs-open": f(o).runsOpen,
        "run-active": f(o).runState.active,
        "sim-busy": f(o).simBusy,
        "published-version": f(o).publishedVersion,
        "export-busy": f(o).exportBusy,
        "history-open": f(o).historyOpen,
        "publish-busy": f(o).publishBusy,
        onBack: u[0] || (u[0] = (d) => l("back")),
        onTogglePalette: f(o).togglePalette,
        onUndo: u[1] || (u[1] = (d) => f(o).runHistory("undo")),
        onRedo: u[2] || (u[2] = (d) => f(o).runHistory("redo")),
        onFit: f(o).fit,
        onAutoLayout: u[3] || (u[3] = (d) => f(o).runAutoLayout()),
        onToggleDirection: f(o).toggleDir,
        onEditConnections: f(o).openConnections,
        onToggleRuns: f(o).toggleRuns,
        onAddTrigger: f(o).openAddTrigger,
        onShare: f(o).openShare,
        onRun: f(o).openSim,
        onRunPublished: f(o).openPublishedRun,
        onExport: f(o).exportDefinition,
        onToggleHistory: f(o).toggleHistory,
        onPublish: f(o).doPublish
      }, null, 8, ["palette-open", "count-label", "can-undo", "can-redo", "viewing-run", "layout-dir", "runs-open", "run-active", "sim-busy", "published-version", "export-busy", "history-open", "publish-busy", "onTogglePalette", "onFit", "onToggleDirection", "onEditConnections", "onToggleRuns", "onAddTrigger", "onShare", "onRun", "onRunPublished", "onExport", "onToggleHistory", "onPublish"]),
      f(o).publishedRunOpen ? (S(), ae(OO, {
        key: 0,
        "workflow-id": f(i),
        "published-version": f(o).publishedVersion,
        onClose: f(o).closePublishedRun
      }, null, 8, ["workflow-id", "published-version", "onClose"])) : Z("", !0),
      f(o).connectionsOpen ? (S(), ae(N3, {
        key: 1,
        sources: f(o).connectionSources,
        targets: f(o).connectionTargets,
        edges: f(o).connectionEdges,
        "target-handle": f(o).connectionTargetHandle,
        disabled: !!f(o).viewingRun,
        onClose: f(o).closeConnections,
        onCreate: f(o).createConnection,
        onRemove: f(o).removeEdge
      }, null, 8, ["sources", "targets", "edges", "target-handle", "disabled", "onClose", "onCreate", "onRemove"])) : Z("", !0),
      f(o).runsOpen ? (S(), ae(KT, {
        key: 2,
        rows: f(o).runRows,
        loading: f(o).runsLoading,
        error: f(o).runsError,
        onSelect: f(o).viewRun,
        onClose: f(o).closeRuns
      }, null, 8, ["rows", "loading", "error", "onSelect", "onClose"])) : Z("", !0),
      f(o).simOpen ? (S(), ae(bP, {
        key: 3,
        schema: f(o).startInputSchema,
        "model-value": f(o).simInput,
        "reset-key": f(o).simInputKey,
        "has-fields": f(o).startHasFields,
        valid: f(o).simInputValid,
        "error-message": f(o).simError,
        "can-run": f(o).canRunSimulate,
        onClose: f(o).closeRunDialog,
        onRun: f(o).runSimulate,
        "onUpdate:modelValue": f(o).onSimInput,
        onValid: f(o).onSimValid
      }, null, 8, ["schema", "model-value", "reset-key", "has-fields", "valid", "error-message", "can-run", "onClose", "onRun", "onUpdate:modelValue", "onValid"])) : Z("", !0),
      f(o).historyOpen ? (S(), ae(NO, {
        key: 4,
        "workflow-id": f(i),
        "definition-edit-seq": f(o).definitionEditSeq,
        onClose: f(o).closeHistory,
        onRestore: u[4] || (u[4] = (d) => l("open-workflow", d))
      }, null, 8, ["workflow-id", "definition-edit-seq", "onClose"])) : Z("", !0),
      f(o).addTriggerOpen ? (S(), ae(LO, {
        key: 5,
        "workflow-id": f(i),
        "published-version": f(o).publishedVersion,
        onClose: f(o).closeAddTrigger
      }, null, 8, ["workflow-id", "published-version", "onClose"])) : Z("", !0),
      f(o).shareOpen ? (S(), R("div", {
        key: 6,
        ref_key: "shareHost",
        ref: s
      }, null, 512)) : Z("", !0),
      f(o).dropPicker ? (S(), ae(D3, {
        key: 7,
        items: f(o).catalog,
        x: f(o).dropPicker.x,
        y: f(o).dropPicker.y,
        onPick: f(o).dropPickerPick,
        onClose: f(o).closeDropPicker
      }, null, 8, ["items", "x", "y", "onPick", "onClose"])) : Z("", !0),
      f(o).paneMenu ? (S(), R(ue, { key: 8 }, [
        $("div", {
          class: "wf-ctx-backdrop",
          onClick: u[5] || (u[5] = //@ts-ignore
          (...d) => f(o).closePaneMenu && f(o).closePaneMenu(...d)),
          onContextmenu: u[6] || (u[6] = Fe(
            //@ts-ignore
            (...d) => f(o).closePaneMenu && f(o).closePaneMenu(...d),
            ["prevent"]
          ))
        }, null, 32),
        $("div", {
          class: "wf-ctx",
          role: "menu",
          style: ze({ left: f(o).paneMenu.x + "px", top: f(o).paneMenu.y + "px" })
        }, [
          $("button", {
            class: "wf-ctx-item",
            role: "menuitem",
            onClick: u[7] || (u[7] = //@ts-ignore
            (...d) => f(o).menuAddStep && f(o).menuAddStep(...d))
          }, [
            V(f(ie), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            u[22] || (u[22] = ce(" Add step…", -1))
          ]),
          $("button", {
            class: "wf-ctx-item",
            role: "menuitem",
            onClick: u[8] || (u[8] = //@ts-ignore
            (...d) => f(o).menuAddNote && f(o).menuAddNote(...d))
          }, [
            V(f(ie), {
              icon: "tabler:note",
              "aria-hidden": "true"
            }),
            u[23] || (u[23] = ce(" Add note", -1))
          ]),
          $("button", {
            class: "wf-ctx-item",
            role: "menuitem",
            onClick: u[9] || (u[9] = //@ts-ignore
            (...d) => f(o).menuAddFrame && f(o).menuAddFrame(...d))
          }, [
            V(f(ie), {
              icon: "tabler:frame",
              "aria-hidden": "true"
            }),
            u[24] || (u[24] = ce(" Add frame", -1))
          ])
        ], 4)
      ], 64)) : Z("", !0),
      V(f(Dg), { position: "top-center" }),
      f(o).viewingRun ? (S(), ae(f(He), {
        key: 9,
        class: "wf-banner wf-banner--run",
        pt: { content: { class: "wf-run-notice-content" }, text: { class: "wf-run-notice-body" } },
        severity: "info",
        closable: !1
      }, {
        default: ne(() => [
          V(f(yt), {
            class: "wf-run-version-tag",
            severity: f(Qn)(f(o).viewingRun.flow_ref?.version ?? 0).kind === "published" ? "secondary" : "warn",
            value: f(Qn)(f(o).viewingRun.flow_ref?.version ?? 0).label,
            title: f(Qn)(f(o).viewingRun.flow_ref?.version ?? 0).title
          }, null, 8, ["severity", "value", "title"]),
          $("span", P3, "Viewing run " + j(f(Ms)(f(o).viewingRun.run_id)) + " · " + j(f(ro)(f(ao)(f(o).viewingRun))) + " · started " + j(f(Qt)(f(o).viewingRun.started_at)) + " — read-only.", 1),
          V(f(fe), {
            class: "wf-run-notice-action",
            onClick: f(o).stopRun
          }, {
            default: ne(() => [...u[25] || (u[25] = [
              ce("Back to editing", -1)
            ])]),
            _: 1
          }, 8, ["onClick"])
        ]),
        _: 1
      })) : Z("", !0),
      f(o).error ? (S(), ae(f(He), {
        key: 10,
        class: "wf-banner wf-banner--error",
        severity: "error",
        onClose: u[10] || (u[10] = (d) => f(o).error = "")
      }, {
        default: ne(() => [
          $("span", null, j(f(o).errorView.message), 1),
          f(o).errorView.code ? (S(), R("span", L3, j(f(o).errorView.code), 1)) : Z("", !0)
        ]),
        _: 1
      })) : Z("", !0),
      $("div", V3, [
        f(o).paletteOpen && !f(o).viewingRun ? (S(), ae(eT, {
          key: 0,
          items: f(o).catalog,
          loading: f(o).catalogLoading,
          errors: f(o).catalogErrors,
          onPlace: f(o).placeItem,
          onPlaceNote: u[11] || (u[11] = () => f(o).placeNote()),
          onPlaceFrame: u[12] || (u[12] = () => f(o).placeFrame())
        }, null, 8, ["items", "loading", "errors", "onPlace"])) : Z("", !0),
        $("main", {
          ref_key: "canvasEl",
          ref: a,
          class: "wf-canvas",
          onDrop: u[15] || (u[15] = //@ts-ignore
          (...d) => f(o).onDrop && f(o).onDrop(...d)),
          onDragover: u[16] || (u[16] = //@ts-ignore
          (...d) => f(o).onDragOver && f(o).onDragOver(...d)),
          onMousemove: u[17] || (u[17] = //@ts-ignore
          (...d) => f(o).onCanvasMouseMove && f(o).onCanvasMouseMove(...d))
        }, [
          V(f(Qf), {
            id: f(o).flowId,
            nodes: f(o).flowNodes,
            "onUpdate:nodes": u[13] || (u[13] = (d) => f(o).flowNodes = d),
            edges: f(o).flowEdges,
            "onUpdate:edges": u[14] || (u[14] = (d) => f(o).flowEdges = d),
            "node-types": f(o).nodeTypes,
            "edge-types": f(o).edgeTypes,
            "connection-line-style": f(o).connectLineStyle(),
            "is-valid-connection": f(o).isValidConnection,
            "selection-key-code": "Shift",
            "multi-selection-key-code": "Shift",
            "delete-key-code": null,
            "nodes-focusable": !0,
            "edges-focusable": !0,
            "aria-label": "Workflow graph",
            "zoom-on-double-click": !1,
            "snap-to-grid": !0,
            "snap-grid": [10, 10],
            "min-zoom": 0.1,
            "max-zoom": 3,
            "connection-radius": 40,
            class: "wf-flow",
            onNodeClick: f(o).onNodeClick,
            onEdgeClick: f(o).onEdgeClick,
            onPaneClick: f(o).onPaneClick,
            onPaneContextMenu: f(o).onPaneContextMenu,
            onNodeContextMenu: f(o).onNodeContextMenu,
            onConnectStart: f(o).onConnectStart,
            onConnect: f(o).onConnect,
            onConnectEnd: f(o).onConnectEnd,
            onNodeDragStop: f(o).onNodeDragStop,
            onMove: f(o).onViewportMove
          }, {
            default: ne(() => [
              V(f(ip), {
                "pattern-color": "var(--wf-dot)",
                gap: 20,
                size: 1.2
              }),
              V(f(r2), {
                position: "bottom-left",
                "show-interactive": !1
              }),
              V(f(FM), {
                position: "bottom-right",
                pannable: !0,
                zoomable: !0,
                width: 150,
                height: 96,
                "node-color": "var(--wf-minimap-node)"
              })
            ]),
            _: 1
          }, 8, ["id", "nodes", "edges", "node-types", "edge-types", "connection-line-style", "is-valid-connection", "onNodeClick", "onEdgeClick", "onPaneClick", "onPaneContextMenu", "onNodeContextMenu", "onConnectStart", "onConnect", "onConnectEnd", "onNodeDragStop", "onMove"]),
          f(o).isEmpty ? (S(), R("div", B3, [...u[26] || (u[26] = [
            jm('<div class="wf-empty-flow" aria-hidden="true"><span class="wf-gnode wf-gnode--start"></span><span class="wf-gwire"></span><span class="wf-gnode wf-gnode--block"></span><span class="wf-gwire"></span><span class="wf-gnode wf-gnode--block"></span></div><p class="wf-empty-title">Add your first step</p><p class="wf-empty-sub">Drag a Start or Block from the left — or press ⌘K to search.</p>', 3)
          ])])) : Z("", !0),
          f(o).viewingRun && f(o).failedNode ? (S(), R("div", z3, [
            V(f(ie), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            }),
            $("span", F3, [
              $("strong", null, j(f(o).failedNodeTitle), 1),
              u[27] || (u[27] = ce(" failed", -1)),
              f(o).failedReason ? (S(), R("span", H3, ": " + j(f(o).failedReason), 1)) : Z("", !0),
              u[28] || (u[28] = ce(".", -1))
            ]),
            V(f(fe), {
              severity: "secondary",
              outlined: "",
              onClick: f(o).openFailedDetails
            }, {
              default: ne(() => [
                V(f(ie), {
                  icon: "tabler:list-search",
                  "aria-hidden": "true"
                }),
                u[29] || (u[29] = $("span", null, "View details", -1))
              ]),
              _: 1
            }, 8, ["onClick"])
          ])) : Z("", !0),
          f(o).connectStatus && f(o).connectStatus !== "neutral" && f(o).connectHintPosition ? (S(), R("div", {
            key: 2,
            class: Ie(["wf-connect-hint", `is-${f(o).connectStatus}`]),
            style: ze({ left: f(o).connectHintPosition.left + "px", top: f(o).connectHintPosition.top + "px" })
          }, [
            V(f(ie), {
              icon: f(o).connectStatus === "ok" ? "tabler:plug-connected" : f(o).connectStatus === "warn" ? "tabler:wand" : "tabler:plug-connected-x",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            $("span", null, j(f(o).connectStatus === "ok" ? "Compatible" : f(o).connectStatus === "warn" ? f(o).connectMessage || "Needs a mapping" : f(o).connectMessage || "Incompatible"), 1)
          ], 6)) : Z("", !0),
          (S(!0), R(ue, null, Re(f(o).autoMapAnchored, (d) => (S(), ae(c3, {
            key: d.id,
            entry: d.entry,
            style: ze({ left: d.left + "px", top: d.top + "px", visibility: d.placed ? "visible" : "hidden", "--wf-overlay-max-height": d.maxHeight + "px" }),
            onMeasure: (h) => f(o).measureAuto(d.id, h),
            onOpen: f(o).openAutoMapped,
            onDismiss: f(o).dismissAutoMapped
          }, null, 8, ["entry", "style", "onMeasure", "onOpen", "onDismiss"]))), 128)),
          f(o).pendingEdge && f(o).pendingAnchor ? (S(), ae(ZP, {
            key: f(o).pendingEdge.id,
            "workflow-id": f(i),
            edge: f(o).pendingEdge,
            "available-steps": f(o).availableSteps,
            style: ze({ left: f(o).pendingAnchor.left + "px", top: f(o).pendingAnchor.top + "px", visibility: f(o).pendingOverlaySize ? "visible" : "hidden", "--wf-overlay-max-height": f(o).pendingAnchor.maxHeight + "px" }),
            onMeasure: f(o).measurePending,
            onAccept: f(o).acceptPending,
            onSuggestNode: f(o).showSuggestedNode,
            onOpenMapper: f(o).openPendingMapper,
            onDismiss: f(o).dismissPending
          }, null, 8, ["workflow-id", "edge", "available-steps", "style", "onMeasure", "onAccept", "onSuggestNode", "onOpenMapper", "onDismiss"])) : Z("", !0),
          f(o).loading ? (S(), R("div", q3, [
            V(f(dt), {
              class: "wf-status-spinner",
              "stroke-width": "4",
              "aria-label": "Loading workflow canvas"
            })
          ])) : Z("", !0)
        ], 544),
        !f(o).panelOpen && (f(o).hasSelection || f(o).viewingRun) ? (S(), ae(f(fe), {
          key: 1,
          class: "wf-panel-rail",
          text: "",
          rounded: "",
          severity: "secondary",
          title: "Show inspector",
          "aria-label": "Show inspector",
          onClick: f(o).openInspector
        }, {
          default: ne(() => [
            V(f(ie), {
              icon: "tabler:chevron-left",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["onClick"])) : Z("", !0),
        f(o).narrowEditor ? (S(), ae(f(Rg), {
          key: 2,
          class: "wf-inspector-drawer",
          visible: f(o).panelOpen,
          position: "right",
          modal: !0,
          dismissable: !0,
          "close-on-escape": !0,
          "show-close-icon": !1,
          style: { width: "min(312px, calc(100vw - 44px))" },
          "aria-label": "Workflow inspector",
          "onUpdate:visible": u[19] || (u[19] = (d) => {
            d || f(o).closeInspector();
          })
        }, {
          default: ne(() => [
            f(o).viewingRun ? (S(), ae(id, {
              key: 0,
              "workflow-id": f(i),
              run: f(o).viewingRun,
              node: f(o).selectedNode,
              "node-status": f(o).selectedRunStatus,
              "node-header": f(o).selectedRunHeader,
              execution: f(o).viewingExecution,
              onClose: f(o).clearSelection,
              onExitRun: f(o).stopRun,
              onRerun: u[18] || (u[18] = (d) => f(o).rerunSameInput(f(o).viewingRun))
            }, null, 8, ["workflow-id", "run", "node", "node-status", "node-header", "execution", "onClose", "onExitRun"])) : f(o).hasSelection ? (S(), ae(sd, {
              key: 1,
              "workflow-id": f(i),
              node: f(o).selectedNode,
              edge: f(o).selectedEdge,
              note: f(o).selectedNote,
              catalog: f(o).catalog,
              "edge-upstream-schema": f(o).selectedEdgeUpstream,
              "edge-downstream-schema": f(o).selectedEdgeDownstream,
              "edge-source-title": f(o).selectedEdgeSourceTitle,
              "edge-target-title": f(o).selectedEdgeTargetTitle,
              "node-upstream-schema": f(o).selectedNodeUpstream,
              "combine-branch-conflict": f(o).selectedCombineConflict,
              onUpdateNode: f(o).updateNode,
              onRemoveNode: f(o).removeSelectedNode,
              onUpdateEdge: f(o).updateEdge,
              onRemoveEdge: f(o).removeSelectedEdge,
              onUpdateNote: f(o).updateNote,
              onRemoveNote: f(o).removeSelectedNote,
              onClose: f(o).clearSelection
            }, null, 8, ["workflow-id", "node", "edge", "note", "catalog", "edge-upstream-schema", "edge-downstream-schema", "edge-source-title", "edge-target-title", "node-upstream-schema", "combine-branch-conflict", "onUpdateNode", "onRemoveNode", "onUpdateEdge", "onRemoveEdge", "onUpdateNote", "onRemoveNote", "onClose"])) : Z("", !0)
          ]),
          _: 1
        }, 8, ["visible"])) : (S(), R(ue, { key: 3 }, [
          f(o).panelOpen && f(o).viewingRun ? (S(), ae(id, {
            key: 0,
            "workflow-id": f(i),
            run: f(o).viewingRun,
            node: f(o).selectedNode,
            "node-status": f(o).selectedRunStatus,
            "node-header": f(o).selectedRunHeader,
            execution: f(o).viewingExecution,
            onClose: f(o).clearSelection,
            onExitRun: f(o).stopRun,
            onRerun: u[20] || (u[20] = (d) => f(o).rerunSameInput(f(o).viewingRun))
          }, null, 8, ["workflow-id", "run", "node", "node-status", "node-header", "execution", "onClose", "onExitRun"])) : f(o).panelOpen && f(o).hasSelection ? (S(), ae(sd, {
            key: 1,
            "workflow-id": f(i),
            node: f(o).selectedNode,
            edge: f(o).selectedEdge,
            note: f(o).selectedNote,
            catalog: f(o).catalog,
            "edge-upstream-schema": f(o).selectedEdgeUpstream,
            "edge-downstream-schema": f(o).selectedEdgeDownstream,
            "edge-source-title": f(o).selectedEdgeSourceTitle,
            "edge-target-title": f(o).selectedEdgeTargetTitle,
            "node-upstream-schema": f(o).selectedNodeUpstream,
            "combine-branch-conflict": f(o).selectedCombineConflict,
            onUpdateNode: f(o).updateNode,
            onRemoveNode: f(o).removeSelectedNode,
            onUpdateEdge: f(o).updateEdge,
            onRemoveEdge: f(o).removeSelectedEdge,
            onUpdateNote: f(o).updateNote,
            onRemoveNote: f(o).removeSelectedNote,
            onClose: f(o).clearSelection
          }, null, 8, ["workflow-id", "node", "edge", "note", "catalog", "edge-upstream-schema", "edge-downstream-schema", "edge-source-title", "edge-target-title", "node-upstream-schema", "combine-branch-conflict", "onUpdateNode", "onRemoveNode", "onUpdateEdge", "onRemoveEdge", "onUpdateNote", "onRemoveNote", "onClose"])) : Z("", !0)
        ], 64))
      ])
    ], 34));
  }
}), W3 = /* @__PURE__ */ ye({
  __name: "WorkflowCanvas",
  props: {
    workflowId: {}
  },
  emits: ["back", "open-workflow", "published"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = new oS(), r = Y(0), a = Y(!0), s = Y(""), l = nt(null), c = nt(null);
    let u = 0;
    function d(xe = null) {
      u += 1;
      const Ce = bn.value?.getRootNode();
      l.value = Ce?.activeElement instanceof HTMLElement ? Ce.activeElement : null, c.value = xe ?? bn.value?.querySelector(
        'button[aria-label="More workflow actions"]'
      ) ?? null;
    }
    async function h() {
      const xe = u, Ce = l.value, Le = c.value ?? bn.value?.querySelector(
        'button[aria-label="More workflow actions"]'
      ) ?? null;
      await Ve();
      const qt = bn.value?.getRootNode();
      await qd({
        root: qt ?? null,
        target: Ce,
        fallback: Le,
        isCurrent: () => xe === u
      }) && (u += 1, l.value = null, c.value = null);
    }
    const p = nt([]), v = nt([]), g = Y(/* @__PURE__ */ new Map()), m = U(() => (r.value, o.doc.direction)), k = Y([]), x = Y([]), w = Y(!0), b = U(() => {
      const xe = /* @__PURE__ */ new Map();
      for (const Ce of k.value) {
        const Le = String(Ce.kind);
        Ce.ref || Le === "start" || Le === "finish" || Le === "error" || xe.has(Le) || xe.set(Le, Ce.title);
      }
      return [...xe].map(([Ce, Le]) => ({ kind: Ce, title: Le }));
    }), C = Y(Md()), I = Y(""), z = Ig(), T = Ld();
    _e(I, (xe) => {
      xe && (z.add({ severity: "success", summary: "Workflow updated", detail: xe, life: 5e3 }), I.value = "");
    });
    const O = Y(null), D = Y(null), B = Y([]), {
      panelOpen: N,
      paletteOpen: H,
      historyOpen: y,
      addTriggerOpen: E,
      shareOpen: _,
      shareHost: L
    } = LC(), {
      selectedNode: F,
      selectedEdge: J,
      selectedNote: X,
      hasSelection: oe,
      select: se,
      clearSelection: W,
      onNodeClick: K,
      onEdgeClick: G,
      onPaneClick: ee,
      updateNode: te,
      updateEdge: re,
      updateNote: le,
      removeSelectedNode: we,
      removeSelectedEdge: $e,
      removeEdge: pe,
      removeSelectedNote: me,
      deleteSelection: P
    } = PC({
      doc: () => o.doc,
      revision: r,
      readOnly: () => !!O.value,
      apply: (xe) => Do(xe),
      openInspector: () => {
        N.value = !0;
      },
      reportError: (xe) => {
        s.value = xe;
      },
      confirmNodeRemoval: (xe, Ce) => {
        T.require({
          group: "node-delete",
          header: "Delete step?",
          message: `Delete “${Je(xe.title, xe.ref)}” and its connections? You can undo this change.`,
          rejectLabel: "Cancel",
          acceptLabel: "Delete step",
          accept: Ce
        });
      }
    }), {
      publishBusy: M,
      publishedVersion: A,
      exportBusy: q,
      loadPublishedState: Q,
      exportDefinition: de,
      definitionEditSeq: ve,
      doPublish: ke
    } = XC({
      engine: o,
      workflowId: n.workflowId,
      revision: r,
      error: s,
      notice: I,
      historyOpen: y,
      publishIssues: g,
      rebuild: gn,
      select: se,
      published: (xe) => i("published", { kind: "flow", id: n.workflowId, version: xe })
    }), be = { wfNode: et(oh), wfNote: et(_h), wfFrame: et(kh), wfContainer: et(Eh) }, Ee = { "mapping-completeness": et(xh) }, Se = `wf-${n.workflowId}`, { fitView: Ae, screenToFlowCoordinate: ht, getViewport: at, onNodesInitialized: vr, findNode: mr, getSelectedNodes: gr } = De(Se), wl = Y(0);
    function Lp() {
      wl.value++;
    }
    let bl = !1;
    vr(() => {
      bl || a.value || (bl = !0, Ve(() => Ae(Lo())));
    });
    const Vp = UC({
      engine: o,
      revision: r,
      selectedNode: F,
      selectedEdge: J,
      runState: C,
      viewingRun: O,
      viewingNodeHeaders: B,
      error: s,
      loading: a,
      panelOpen: N,
      select: se
    }), {
      selectedEdgeUpstream: Bp,
      selectedEdgeDownstream: zp,
      selectedEdgeSourceTitle: Fp,
      selectedEdgeTargetTitle: Hp,
      selectedNodeUpstream: qp,
      selectedCombineConflict: Up,
      selectedRunStatus: Wp,
      selectedRunHeader: Yp,
      failedNode: Gp,
      failedNodeTitle: jp,
      failedReason: Xp,
      errorView: Kp,
      openFailedDetails: Zp,
      countLabel: Jp,
      canUndo: Qp,
      canRedo: ev,
      isEmpty: tv
    } = Vp;
    function gn(xe = !1) {
      mg(o.doc.nodes, k.value);
      const Ce = C.value.active || !!O.value, Le = Xh(o.doc, Ce ? C.value : void 0, m.value, g.value, !!O.value);
      bv(new Set(Le.flowEdges.map((qt) => String(qt.id)))), _v(Le.flowEdges), p.value = Le.flowNodes, v.value = Le.flowEdges, r.value++, xe && Ve(() => requestAnimationFrame(() => requestAnimationFrame(() => {
        try {
          Ae(Lo());
        } catch {
        }
      })));
    }
    let zn = null, yn = null, Ro = "";
    async function yr(xe = !1) {
      if (zn) return zn;
      zn = (async () => {
        a.value = !0;
        try {
          if (!yn) {
            const Le = await Ed("/api/v1/user/me"), qt = gi(Le.user), Vo = String(qt.id || qt.email || "");
            if (!Vo) throw new Error("Unable to identify the Workflow editor session.");
            Ro = `${Vo}:${n.workflowId}`, await lS(Ro), yn = new sS(Vo, n.workflowId, localStorage);
          }
          const Ce = await Nd(n.workflowId);
          if (o.reset(Ce), !wr) {
            const Le = yn.read(o.doc);
            yn.write(Le), wr = !0, uS(Ro, wn);
            for (const qt of Le) wn(qt);
          }
          g.value = /* @__PURE__ */ new Map(), s.value = "", gn(xe);
        } catch (Ce) {
          s.value = qe(Ce, "Couldn’t load this Workflow.");
        } finally {
          a.value = !1;
        }
      })();
      try {
        await zn;
      } finally {
        zn = null;
      }
    }
    let wr = !1;
    const wn = iS({
      checkpoint: (xe) => {
        if (!yn) throw new Error("Workflow edits are not ready to save.");
        yn.write(xe);
      },
      engine: o,
      request: async (xe) => {
        const Ce = await xd(n.workflowId, xe);
        return s.value = "", Ce;
      },
      rebuild: gn,
      recover: async (xe) => {
        const Ce = qe(xe, "Couldn’t save the change.");
        await yr(), s.value = Ce;
      }
    });
    cS(wn, () => Ro);
    async function _l(xe) {
      await wn.flush() && xe();
    }
    async function Do(xe, Ce = !1) {
      if (O.value) {
        s.value = "Exit run view to edit this Workflow.";
        return;
      }
      if (xe.length) {
        if (!wr || a.value) {
          s.value = "Wait for Workflow edits to finish loading.";
          return;
        }
        try {
          await wn(xe, Ce);
        } catch (Le) {
          s.value = qe(Le, "Couldn’t preserve the pending change.");
        }
      }
    }
    async function kl(xe) {
      if (!O.value && !(xe === "undo" && !o.doc.canUndo) && !(xe === "redo" && !o.doc.canRedo))
        try {
          if (!await wn.flush()) return;
          await (xe === "undo" ? pg : vg)(n.workflowId), await yr();
        } catch (Ce) {
          s.value = qe(Ce, xe === "undo" ? "Nothing to undo." : "Nothing to redo.");
        }
    }
    let El = async () => !1;
    const { canvasEl: Po, placeItem: xl, placeNote: $l, placeFrame: Sl, onDrop: nv, onDragOver: ov } = AC({
      engine: o,
      layoutDir: m,
      apply: Do,
      select: se,
      catalog: k,
      getViewport: at,
      screenToFlowCoordinate: ht
    }), { onNodeDragStop: iv, runAutoLayout: rv, toggleDir: av, fit: Cl } = tN({
      engine: o,
      layoutDir: m,
      viewingRun: O,
      canvasEl: Po,
      apply: Do,
      prepareCanvasAction: () => El(),
      fitView: Ae,
      canvasFitOptions: Lo
    });
    function Lo(xe = 250) {
      const Ce = Po.value?.getBoundingClientRect().width || 0, Le = typeof document > "u" ? 1 : Number.parseFloat(getComputedStyle(document.documentElement).zoom || "1") || 1;
      return ep(xe, Ce > 0 && Ce <= 640 ? 0.02 : 0.2, Le);
    }
    const {
      connectStatus: sv,
      connectMessage: lv,
      connectXY: uv,
      connectLineStyle: cv,
      isValidConnection: dv,
      onConnect: Nl,
      onConnectEnd: fv,
      onCanvasMouseMove: hv,
      pendingEdge: Il,
      autoMapped: pv,
      intentRev: vv,
      dismissPending: Al,
      acceptPending: mv,
      openPendingMapper: gv,
      dismissAutoMapped: yv,
      openAutoMapped: wv,
      clearIntentOverlays: br,
      pruneIntent: bv,
      decorateEdges: _v
    } = EC({
      engine: o,
      apply: Do,
      select: se,
      layoutDir: m,
      viewingRun: O
    }), {
      connectionsOpen: kv,
      connectionSources: Ev,
      connectionTargets: xv,
      connectionEdges: $v,
      connectionTargetHandle: Sv,
      openConnections: Cv,
      closeConnections: Nv,
      createConnection: Iv
    } = oN({
      engine: o,
      revision: r,
      layoutDir: m,
      clearIntentOverlays: br,
      rememberOverlayInvoker: d,
      restoreOverlayFocusFallback: h,
      onConnect: Nl
    }), {
      pendingOverlaySize: Av,
      pendingAnchor: Mv,
      autoMapAnchored: Tv,
      connectHintPosition: Ov,
      measurePending: Rv,
      measureAuto: Dv
    } = uN({
      engine: o,
      flowNodes: p,
      canvasEl: Po,
      findNode: mr,
      getViewport: at,
      revision: r,
      viewportRevision: wl,
      intentRevision: vv,
      pendingEdge: Il,
      autoMapped: pv,
      connectXY: uv,
      rebuild: gn
    }), {
      runsOpen: _r,
      runRows: Pv,
      runsLoading: Lv,
      runsError: Vv,
      simOpen: kr,
      simBusy: Bv,
      simInput: zv,
      simInputKey: Fv,
      simError: Hv,
      simInputValid: qv,
      startInputSchema: Uv,
      startHasFields: Wv,
      canRunSimulate: Yv,
      stopRun: Gv,
      toggleRuns: jv,
      viewRun: Xv,
      openSim: Kv,
      closeSim: Zv,
      rerunSameInput: Jv,
      onSimInput: Qv,
      onSimValid: em,
      runSimulate: tm
    } = RC({
      engine: o,
      workflowId: n.workflowId,
      rev: r,
      runState: C,
      viewingRun: O,
      viewingExecution: D,
      viewingNodeHeaders: B,
      rebuild: gn,
      clearSelection: W,
      error: s,
      panelOpen: N,
      historyOpen: y
    }), {
      openShare: nm,
      toggleHistory: om,
      closeHistory: im,
      openAddTrigger: rm,
      closeAddTrigger: am,
      openSim: sm,
      closeRunDialog: lm,
      toggleRuns: um,
      closeRuns: cm
    } = eN({
      workflowId: n.workflowId,
      shareOpen: _,
      shareHost: L,
      historyOpen: y,
      addTriggerOpen: E,
      runsOpen: _r,
      simOpen: kr,
      publishedVersion: A,
      error: s,
      clearIntentOverlays: br,
      rememberOverlayInvoker: d,
      restoreOverlayFocusFallback: h,
      openRunDialog: Kv,
      closeSim: Zv,
      toggleRunsPanel: jv
    }), Er = Y(!1);
    function dm(xe = null) {
      !A.value || O.value || (br(), d(xe), Er.value = !0, y.value = !1, _r.value = !1, kr.value = !1, E.value = !1);
    }
    function fm() {
      Er.value = !1, h();
    }
    const { rootEl: bn, onKeyDown: hm, focusPaletteSearch: pm } = OC({
      deleteSelection: P,
      runHistory: kl,
      paletteOpen: H,
      hasSelection: oe,
      clearSelection: W,
      fit: () => Cl(),
      zoomSelection: () => {
        const xe = gr.value.map((Ce) => Ce.id);
        xe.length && Ae({ nodes: xe, padding: 0.4, duration: 200, maxZoom: 1.2 });
      }
    }), {
      paneMenu: vm,
      onPaneContextMenu: mm,
      onNodeContextMenu: gm,
      closePaneMenu: ym,
      menuAddStep: wm,
      menuAddNote: bm,
      menuAddFrame: _m,
      dropPicker: km,
      onConnectStart: Em,
      onConnect: xm,
      onConnectEnd: $m,
      closeDropPicker: Sm,
      dropPickerPick: Cm
    } = iN({
      viewingRun: O,
      paletteOpen: H,
      screenToFlowCoordinate: ht,
      placeItem: xl,
      placeNote: $l,
      placeFrame: Sl,
      focusPaletteSearch: pm,
      onConnect: Nl,
      settleConnectHint: fv
    }), Ml = DC({
      rootEl: bn,
      panelOpen: N,
      paletteOpen: H,
      hasSelection: oe,
      viewingRun: O,
      reframe: () => {
        try {
          Ae(Lo(180));
        } catch {
        }
      }
    }), { narrow: Nm, togglePalette: Im, openInspector: Am, closeInspector: Mm } = Ml;
    El = Ml.prepareCanvasAction;
    function Tm(xe) {
      const Ce = k.value.find((Le) => !Le.ref && String(Le.kind) === xe);
      Al(), H.value = !0, I.value = Ce ? `Suggested step: ${Ce.title}. Choose it from the palette.` : "Choose the suggested step from the palette.";
    }
    kN({
      workflowId: n.workflowId,
      engine: o,
      catalog: k,
      catalogErrors: x,
      catalogLoading: w,
      load: yr,
      loadPublishedState: Q,
      rebuild: gn
    });
    const Om = bd({
      rootEl: bn,
      canvasEl: Po,
      shareHost: L,
      runState: C,
      viewingRun: O,
      onKeyDown: hm,
      paletteOpen: H,
      countLabel: Jp,
      canUndo: Qp,
      canRedo: ev,
      layoutDir: m,
      runsOpen: _r,
      simBusy: Bv,
      publishedVersion: A,
      exportBusy: q,
      historyOpen: y,
      publishBusy: M,
      publishedRunOpen: Er,
      openPublishedRun: dm,
      closePublishedRun: fm,
      togglePalette: Im,
      runHistory: kl,
      fit: Cl,
      runAutoLayout: rv,
      toggleDir: av,
      openConnections: Cv,
      toggleRuns: um,
      openAddTrigger: rm,
      openShare: nm,
      openSim: sm,
      exportDefinition: de,
      toggleHistory: om,
      doPublish: ke,
      connectionsOpen: kv,
      connectionSources: Ev,
      connectionTargets: xv,
      connectionEdges: $v,
      connectionTargetHandle: Sv,
      removeEdge: pe,
      closeConnections: Nv,
      createConnection: Iv,
      runRows: Pv,
      runsLoading: Lv,
      runsError: Vv,
      viewRun: Xv,
      closeRuns: cm,
      simOpen: kr,
      startInputSchema: Uv,
      simInput: zv,
      simInputKey: Fv,
      startHasFields: Wv,
      simInputValid: qv,
      simError: Hv,
      canRunSimulate: Yv,
      closeRunDialog: lm,
      runSimulate: tm,
      onSimInput: Qv,
      onSimValid: em,
      definitionEditSeq: ve,
      closeHistory: im,
      addTriggerOpen: E,
      closeAddTrigger: am,
      shareOpen: _,
      dropPicker: km,
      catalog: k,
      dropPickerPick: Cm,
      closeDropPicker: Sm,
      paneMenu: vm,
      closePaneMenu: ym,
      menuAddStep: wm,
      menuAddNote: bm,
      menuAddFrame: _m,
      stopRun: Gv,
      error: s,
      errorView: Kp,
      catalogLoading: w,
      catalogErrors: x,
      placeItem: xl,
      placeNote: $l,
      placeFrame: Sl,
      onDrop: nv,
      onDragOver: ov,
      onCanvasMouseMove: hv,
      flowId: Se,
      flowNodes: p,
      flowEdges: v,
      nodeTypes: be,
      edgeTypes: Ee,
      connectLineStyle: cv,
      isValidConnection: dv,
      onNodeClick: K,
      onEdgeClick: G,
      onPaneClick: ee,
      onPaneContextMenu: mm,
      onNodeContextMenu: gm,
      onConnectStart: Em,
      onConnect: xm,
      onConnectEnd: $m,
      onNodeDragStop: iv,
      onViewportMove: Lp,
      isEmpty: tv,
      failedNode: Gp,
      failedNodeTitle: jp,
      failedReason: Xp,
      openFailedDetails: Zp,
      connectStatus: sv,
      connectHintPosition: Ov,
      connectMessage: lv,
      autoMapAnchored: Tv,
      measureAuto: Dv,
      openAutoMapped: wv,
      dismissAutoMapped: yv,
      pendingEdge: Il,
      pendingAnchor: Mv,
      availableSteps: b,
      pendingOverlaySize: Av,
      measurePending: Rv,
      acceptPending: mv,
      showSuggestedNode: Tm,
      openPendingMapper: gv,
      dismissPending: Al,
      loading: a,
      panelOpen: N,
      hasSelection: oe,
      openInspector: Am,
      narrowEditor: Nm,
      closeInspector: Mm,
      selectedNode: F,
      selectedRunStatus: Wp,
      selectedRunHeader: Yp,
      viewingExecution: D,
      clearSelection: W,
      rerunSameInput: Jv,
      selectedEdge: J,
      selectedNote: X,
      selectedEdgeUpstream: Bp,
      selectedEdgeDownstream: zp,
      selectedEdgeSourceTitle: Fp,
      selectedEdgeTargetTitle: Hp,
      selectedNodeUpstream: qp,
      selectedCombineConflict: Up,
      updateNode: te,
      removeSelectedNode: we,
      updateEdge: re,
      removeSelectedEdge: $e,
      updateNote: le,
      removeSelectedNote: me
    });
    return (xe, Ce) => (S(), ae(U3, {
      "workflow-id": n.workflowId,
      model: f(Om),
      onBack: Ce[0] || (Ce[0] = (Le) => _l(() => i("back"))),
      onOpenWorkflow: Ce[1] || (Ce[1] = (Le) => _l(() => i("open-workflow", Le)))
    }, null, 8, ["workflow-id", "model"]));
  }
}), Y3 = { class: "wfp" }, G3 = {
  key: 0,
  class: "wfp-state"
}, j3 = {
  key: 1,
  class: "wfp-state wfp-error",
  role: "alert"
}, X3 = /* @__PURE__ */ ye({
  __name: "WorkflowPreview",
  props: {
    workflowId: {}
  },
  setup(e) {
    const t = e, n = { wfNode: et(oh), wfNote: et(_h), wfFrame: et(kh), wfContainer: et(Eh) }, i = { "mapping-completeness": et(xh) }, o = `wf-preview-${t.workflowId}`, { fitView: r, onNodesInitialized: a } = De(o);
    a(() => {
      r(ep(0));
    });
    const s = nt([]), l = nt([]), c = Y(!0), u = Y("");
    async function d() {
      c.value = !0, u.value = "";
      try {
        const h = Th(await Nd(t.workflowId)), p = Xh(h);
        s.value = p.flowNodes, l.value = p.flowEdges;
      } catch (h) {
        u.value = h instanceof Error ? h.message : "The workflow could not load.";
      } finally {
        c.value = !1;
      }
    }
    return _e(() => t.workflowId, d, { immediate: !0 }), (h, p) => (S(), R("div", Y3, [
      c.value ? (S(), R("div", G3, [
        V(f(ie), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        p[0] || (p[0] = ce(" Loading workflow…", -1))
      ])) : u.value ? (S(), R("div", j3, j(u.value), 1)) : (S(), ae(f(Qf), {
        key: 2,
        id: o,
        nodes: s.value,
        edges: l.value,
        "node-types": n,
        "edge-types": i,
        "nodes-draggable": !1,
        "nodes-connectable": !1,
        "edges-updatable": !1,
        "elements-selectable": !1,
        "zoom-on-double-click": !1,
        "delete-key-code": null,
        "min-zoom": 0.1,
        "max-zoom": 2,
        "fit-view-on-init": "",
        "aria-label": "Workflow graph preview",
        class: "wfp-flow"
      }, {
        default: ne(() => [
          V(f(ip), {
            "pattern-color": "var(--wf-dot)",
            gap: 20,
            size: 1.2
          })
        ]),
        _: 1
      }, 8, ["nodes", "edges"]))
    ]));
  }
}), K3 = /* @__PURE__ */ ye({
  __name: "WorkflowBuilder",
  setup(e) {
    const t = _d(), n = Xm(), i = Y(null);
    _e(
      () => t.value?.route,
      () => {
        i.value = null;
      }
    );
    const o = U(() => i.value ?? t.value?.route ?? ""), r = U(() => o.value.replace(/^\//, "").split("/")), a = U(() => r.value[1] === "return" ? decodeURIComponent(r.value[2] || "") : ""), s = U(() => {
      const p = /^\/?([^/]+)(?:\/return\/[^/]+)?\/?$/.exec(o.value.trim()), v = p ? p[1] : "";
      return v && v !== "/" ? v : "";
    });
    function l(p) {
      i.value = p, n("navigate", { route: p });
    }
    function c() {
      a.value ? n("navigate", { route: a.value }) : l("");
    }
    function u() {
      a.value && n("navigate", { route: a.value });
    }
    const d = Y(null), h = U(() => t.value?.mode === "preview");
    return (p, v) => (S(), R("div", {
      ref_key: "rootEl",
      ref: d,
      class: "wf"
    }, [
      h.value && s.value ? (S(), ae(X3, {
        key: 0,
        "workflow-id": s.value
      }, null, 8, ["workflow-id"])) : s.value ? (S(), ae(W3, {
        key: 1,
        "workflow-id": s.value,
        onBack: c,
        onOpenWorkflow: l,
        onPublished: u
      }, null, 8, ["workflow-id"])) : (S(), ae(fw, {
        key: 2,
        onOpen: v[0] || (v[0] = (g) => l(g))
      }))
    ], 512));
  }
}), Z3 = {
  install(e) {
    e.use(Dm), e.use(Pm);
  }
}, R4 = {
  rootComponent: K3,
  plugins: [Rm, Z3]
};
export {
  R4 as mountConfig
};
