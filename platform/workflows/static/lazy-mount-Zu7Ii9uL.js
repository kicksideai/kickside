import { P as Tm } from "./primevue-plugin-CaP7wV_M.js";
import Mm from "primevue/confirmationservice";
import Om from "primevue/toastservice";
import { watch as _e, onBeforeUnmount as Qe, defineComponent as ye, computed as U, openBlock as N, createElementBlock as D, createElementVNode as S, createVNode as z, unref as h, withCtx as ne, createCommentVNode as Q, toDisplayString as K, withModifiers as He, Fragment as le, createTextVNode as ce, ref as G, nextTick as Ve, normalizeStyle as Be, renderSlot as ze, renderList as Re, withKeys as tt, createBlock as re, normalizeClass as Ie, createPropsRestProxy as Rm, toRef as Ne, onMounted as Ue, getCurrentScope as fd, inject as Ht, effectScope as hd, provide as Zt, getCurrentInstance as Ln, useAttrs as Es, mergeProps as oo, Teleport as Dm, useSlots as pd, onUnmounted as Pm, reactive as xs, onScopeDispose as ri, resolveDynamicComponent as Xt, onBeforeMount as Lm, shallowRef as nt, isMemoSame as Vm, toValue as Ae, isRef as $s, toRefs as zm, customRef as Bm, resolveComponent as vd, h as Pe, markRaw as et, readonly as Fm, watchEffect as md, normalizeProps as Hm, withDirectives as gd, vShow as qm, vModelText as Um, proxyRefs as yd, createStaticVNode as Wm } from "vue";
import { a as wd, b as bd, u as Ym } from "./wc-runtime-KO3cNuNo.js";
import { on as gi, api as Vn, loadByTagName as Ki } from "@wippy-fe/proxy";
import rt from "primevue/inputtext";
import fe from "primevue/button";
import Fe from "primevue/message";
import dt from "primevue/progressspinner";
import { Icon as ie } from "@iconify/vue";
import Jt from "primevue/dialog";
import { n as io, p as Gm, a as yi, s as jm, g as _d, b as Zi, h as qe, d as Al, c as kd, e as Xm, l as Ed, f as xd, i as Tl, t as Km, F as Nt, o as Ji, j as wi, k as $d, m as bi, q as Ss, r as Fa, u as Cs, v as Qi, w as Ns, x as Ml, y as Zm, z as Jm, A as Ol, K as Ze, B as Qm, C as eg, _ as tg, D as ng, E as og, G as ig, H as rg, I as Rl, J as ag, L as sg, M as lg, N as ug, O as cg, P as dg, Q as Sd, R as fg } from "./WorkflowSearchList.vue_vue_type_script_setup_true_lang-1g5-myn1.js";
import { r as Qt, a as Is, b as ro, c as As, i as hg, s as pg, g as xr, d as vg, e as $r, f as mg, l as Cd, h as Nd, p as Dl, n as gg, j as yg, k as Id, m as Qn, o as ao, q as Ts, _ as Fn, t as Ad, u as wg, v as bg, w as _g, x as Td, y as kg } from "./http-error-hXuGxpYD.js";
import Md from "primevue/iconfield";
import Od from "primevue/inputicon";
import St from "primevue/select";
import Ms from "primevue/selectbutton";
import yt from "primevue/tag";
import Eg from "primevue/fileupload";
import Os from "primevue/textarea";
import { useConfirm as Rd } from "primevue/useconfirm";
import { useToast as xg } from "primevue/usetoast";
import { p as $g, P as Sg, l as Dd, g as Pd, a as Cg, r as Ng } from "./versions-BxnHuhqm.js";
import Ld from "primevue/confirmdialog";
import Ig from "primevue/drawer";
import Ag from "primevue/toast";
import Pl from "primevue/tab";
import Tg from "primevue/tablist";
import Mg from "primevue/tabs";
import { _ as ai } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { e as Og } from "./errMsg-CxKGcp1F.js";
import { _ as Rs, h as En, A as Ll } from "./SchemaEditor.vue_vue_type_script_setup_true_lang-Bqtnrqhr.js";
import so from "primevue/inputnumber";
import Rg from "primevue/panel";
import Dg from "primevue/buttongroup";
function Hn(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Pg(e, t) {
  return e;
}
function Lg(e, t, n) {
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
      meta: Pg(Hn(r.meta) ? r.meta : {}),
      deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
    };
  }
  return null;
}
function Vg(e, t) {
  const n = Lg(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function zg(e, t, n, i) {
  const o = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  function a(c, u) {
    const d = e.value.find((_) => t(_) === c), f = r.get(c), p = u?.job_id || f?.state.deletion_job_id || d?.deletion_job_id, v = f ? f.state.deletion_job_id : d?.deleting_at ? d.deletion_job_id : void 0;
    if ((f || d?.deleting_at) && p === v || p && f?.superseded.has(p)) return;
    const y = {
      deleting_at: f?.state.deleting_at || d?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: p
    }, m = new Set(f?.superseded);
    for (const _ of [f?.state.deletion_job_id, d?.deletion_job_id])
      _ && _ !== p && m.add(_);
    r.set(c, { state: y, superseded: m }), d && (Object.assign(d, y), d.deletion_job = void 0);
  }
  const s = _e(() => e.value, (c, u = []) => {
    const d = c.filter((f) => !o.has(t(f)));
    for (const f of u)
      o.has(t(f)) || d.some((p) => t(p) === t(f)) || f.deleting_at && i?.(t(f));
    if (d.length !== c.length) {
      e.value = d;
      return;
    }
    for (const f of c) {
      f.deleting_at && f.deletion_job === void 0 && !u.includes(f) && (f.deletion_job = null);
      const p = r.get(t(f));
      if (p) {
        const y = f.deletion_job_id;
        f.deleting_at && y && y !== p.state.deletion_job_id && !p.superseded.has(y) && (p.state.deletion_job_id && p.superseded.add(p.state.deletion_job_id), p.state.deletion_job_id = y), y !== p.state.deletion_job_id && (f.deletion_job = void 0), Object.assign(f, p.state);
      }
      const v = u.find((y) => t(y) === t(f));
      f.deletion_job === void 0 && v?.deletion_job_id === f.deletion_job_id && (f.deletion_job = v?.deletion_job);
    }
  }, { immediate: !0 }), l = gi("@message", (c) => {
    const u = Vg(c);
    if (!u) return;
    const d = e.value.find((f) => t(f) === u.component_id);
    u.event === "component.deleted" ? (d && !o.has(u.component_id) && i?.(u.component_id), o.add(u.component_id), r.delete(u.component_id), e.value = e.value.filter((f) => t(f) !== u.component_id)) : d && a(u.component_id, { job_id: u.deletion_job_id });
  });
  return Qe(() => {
    s(), typeof l == "function" && l();
  }), { acceptDeletion: a };
}
function Bg() {
  let e = 0;
  return () => {
    const t = ++e;
    return () => t === e;
  };
}
async function Vd(e, t) {
  const n = io(t), i = await Gm(`/api/v1/workflows/${encodeURIComponent(e)}/labels`, { labels: n }), o = yi(i.state), r = Array.isArray(o.labels) ? o.labels : Array.isArray(i.labels) ? i.labels : n;
  return io(r);
}
function Vl(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Fg(e) {
  const t = Vl(e), n = Vl(t.document);
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
async function zd(e) {
  const t = await _d(`/api/v1/workflows/${encodeURIComponent(e)}/export`);
  return Fg(t.flow);
}
async function Hg(e) {
  let t;
  try {
    t = (await Vn.post("/api/v1/workflows/import", { flow: e, bindings: {} })).data;
  } catch (r) {
    const a = jm(r);
    throw a ? new Error(a) : r;
  }
  const n = yi(t);
  if (n.success === !1) throw new Error(String(n.error || "import failed"));
  const i = yi(n.flow), o = String(i.flow_id || "");
  if (!o) throw new Error("the server did not return a flow id");
  return { flowId: o, title: String(i.title || "Imported Workflow") };
}
function Bo(e) {
  return e instanceof HTMLElement && e.isConnected && e.getClientRects().length > 0 && !e.closest(
    '[hidden], [inert], [aria-hidden="true"], [role="dialog"], [role="menu"], [role="menuitem"]'
  );
}
async function Bd({
  root: e,
  target: t,
  fallback: n,
  isCurrent: i,
  delayMs: o = 500
}) {
  return await new Promise((r) => window.setTimeout(r, o)), i() ? (Bo(e?.activeElement ?? null) || (t && Bo(t) && t.focus(), !Bo(e?.activeElement ?? null) && n && Bo(n) && n.focus()), !0) : !1;
}
const qg = {
  ok: "tabler:circle-check",
  error: "tabler:alert-triangle",
  pending: "tabler:loader-2"
};
function Ug(e, t) {
  const n = [];
  return e > 0 && n.push(`${e} step${e === 1 ? "" : "s"}`), t > 0 && n.push(`${t} run${t === 1 ? "" : "s"}`), n.join(" · ");
}
function Wg(e) {
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
function Yg(e) {
  const t = (e.breadcrumb || e.parent_name || "").trim();
  return t ? { present: !0, label: t, title: `In ${t}` } : { present: !1, label: "", title: "" };
}
function Gg(e, t = Date.now()) {
  const n = e.last_run;
  if (!n || !n.status)
    return { present: !1, tone: "pending", icon: "tabler:minus", label: "No runs", status: "", cause: "", title: "No runs yet" };
  const i = Is(n.status), o = n.started_at || n.finished_at || null, r = Qt(o, t), a = ro(n.status), s = As(n);
  return {
    present: !0,
    tone: i,
    icon: qg[i],
    label: o ? r : a,
    status: n.status,
    cause: s,
    title: [a, o ? r : "", s].filter(Boolean).join(" · ")
  };
}
function jg(e, t = Date.now()) {
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
    location: Yg(e),
    subline: Ug(n, i),
    status: Wg(e),
    lastRun: Gg(e, t),
    updated: e.updated_at ? Qt(e.updated_at, t) : "No edits"
  };
}
function Xg(e, t = Date.now()) {
  return e.map((n) => jg(n, t));
}
const er = "", Kg = "No label";
function Zg(e) {
  const t = [];
  for (const n of e)
    for (const i of n.labels)
      t.some((o) => Zi(o, i)) || t.push(i);
  return t.sort((n, i) => n.localeCompare(i, void 0, { sensitivity: "base" }));
}
function Jg(e, t) {
  const n = t.trim();
  return !n || e.some((i) => Zi(i, n)) ? e : [...e, n];
}
function Qg(e, t) {
  const n = t.trim();
  return n ? e.filter((i) => !Zi(i, n)) : e;
}
function ey(e, t) {
  return e.labels.some((n) => Zi(n, t));
}
function ty(e, t) {
  return t === er ? e.filter((n) => n.labels.length === 0) : e.filter((n) => ey(n, t));
}
function ny(e) {
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
  return n.length && i.push({ key: er, header: Kg, rows: n }), i;
}
class oy {
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
}, Fd = {
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
}, Ds = ["retry_policy", "start_to_close_timeout", "schedule_to_close_timeout"];
function gt() {
  const e = globalThis.crypto;
  return e && typeof e.randomUUID == "function" ? e.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function _i(e) {
  const t = { id: e.id || gt(), kind: e.kind, title: e.title };
  e.ref && (t.ref = e.ref), e.config && (t.config = e.config);
  for (const n of Ds) e[n] !== void 0 && (t[n] = e[n]);
  return { type: Oe.NODE_ADD, body: t };
}
function Hd(e, t) {
  return { type: Oe.NODE_UPDATE, body: { id: e, ...t } };
}
function iy(e) {
  return { type: Oe.NODE_REMOVE, body: { id: e } };
}
function ki(e) {
  const t = { id: e.id || gt(), source_id: e.source_id, target_id: e.target_id };
  return e.source_port && (t.source_port = e.source_port), e.target_port && (t.target_port = e.target_port), e.transform && (t.transform = e.transform), { type: Oe.EDGE_ADD, body: t };
}
function Ei(e, t) {
  return { type: Oe.EDGE_UPDATE, body: { id: e, ...t } };
}
function xi(e) {
  return { type: Oe.EDGE_REMOVE, body: { id: e } };
}
function zl(e) {
  const t = { id: e.id || gt(), body: e.text };
  return e.kind && (t.kind = e.kind), e.width && (t.width = e.width), e.height && (t.height = e.height), e.color && (t.color = e.color), { type: Oe.NOTE_ADD, body: t };
}
function ry(e, t) {
  const n = { id: e };
  return t.text !== void 0 && (n.body = t.text), t.kind !== void 0 && (n.kind = t.kind), t.width !== void 0 && (n.width = t.width), t.height !== void 0 && (n.height = t.height), t.color !== void 0 && (n.color = t.color), { type: Oe.NOTE_UPDATE, body: n };
}
function ay(e) {
  return { type: Oe.NOTE_REMOVE, body: { id: e } };
}
function Ct(e, t, n, i, o) {
  const r = { node_id: e, x: Math.round(t), y: Math.round(n) };
  return Number.isFinite(i) && i && (r.width = Math.round(i)), Number.isFinite(o) && o && (r.height = Math.round(o)), { type: Oe.LAYOUT_SET_POSITION, body: r };
}
function sy(e) {
  return { type: Oe.LAYOUT_SET_DIRECTION, body: { direction: e } };
}
const Bl = { type: "object", properties: {} };
function ly() {
  const e = gt(), t = gt();
  return [
    _i({ id: e, kind: "start", title: "Start", config: { input_schema: Bl } }),
    Ct(e, 240, 80),
    _i({ id: t, kind: "finish", title: "Finish", config: { output_schema: Bl } }),
    Ct(t, 240, 340)
  ];
}
const uy = { class: "kx-head" }, cy = { class: "kx-head-icon" }, dy = { class: "kx-head-actions" }, fy = {
  key: 0,
  class: "wf-label-filter"
}, hy = { class: "kx-count" }, py = "Build Workflows from steps, tools, and AI agents. Publish them to use them in Automations, other Workflows, or agents.", Sr = "__all__", vy = /* @__PURE__ */ ye({
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
      { label: "No label", value: er }
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
    return (c, u) => (N(), D("header", uy, [
      S("div", cy, [
        z(h(ie), {
          icon: "tabler:route",
          "aria-hidden": "true"
        })
      ]),
      S("div", { class: "kx-head-text" }, [
        S("h1", {
          class: "kx-title",
          title: py
        }, "Workflows")
      ]),
      S("div", dy, [
        z(h(Md), { class: "kx-search" }, {
          default: ne(() => [
            z(h(Od), null, {
              default: ne(() => [
                z(h(ie), {
                  icon: "tabler:search",
                  class: "kx-search-ico",
                  "aria-hidden": "true"
                })
              ]),
              _: 1
            }),
            z(h(rt), {
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
        e.labelVocab.length ? (N(), D("div", fy, [
          z(h(ie), {
            icon: "tabler:tag",
            class: "wf-label-filter-ico",
            "aria-hidden": "true"
          }),
          z(h(St), {
            class: "wf-label-select",
            "model-value": e.labelFilter === null ? Sr : e.labelFilter,
            options: r.value,
            "option-label": "label",
            "option-value": "value",
            "aria-label": "Filter by label",
            "onUpdate:modelValue": a
          }, null, 8, ["model-value", "options"])
        ])) : Q("", !0),
        z(h(Ms), {
          class: "kx-seg",
          "model-value": e.groupBy,
          options: [...o],
          "option-label": "label",
          "option-value": "value",
          "aria-label": "Group by label",
          "allow-empty": !1,
          "onUpdate:modelValue": s
        }, null, 8, ["model-value", "options"]),
        z(h(fe), {
          "data-testid": "import-workflow",
          severity: "secondary",
          outlined: "",
          title: "Import a Workflow JSON file",
          onClick: u[1] || (u[1] = (d) => i("import", l(d)))
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:file-import",
              "aria-hidden": "true"
            }),
            u[3] || (u[3] = S("span", null, "Import", -1))
          ]),
          _: 1
        }),
        S("span", hy, K(e.totalCount) + " Workflow" + K(e.totalCount === 1 ? "" : "s"), 1),
        z(h(fe), {
          "data-testid": "create-workflow",
          onClick: u[2] || (u[2] = (d) => i("create", l(d)))
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:plus",
              "aria-hidden": "true"
            }),
            u[4] || (u[4] = S("span", null, "New Workflow", -1))
          ]),
          _: 1
        })
      ])
    ]));
  }
}), my = { key: 0 }, gy = /* @__PURE__ */ ye({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, n = U(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (i, o) => e.state.deleting_at ? (N(), D("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: o[1] || (o[1] = He(() => {
      }, ["stop"])),
      onKeydown: o[2] || (o[2] = He(() => {
      }, ["stop"]))
    }, [
      n.value ? (N(), D(le, { key: 0 }, [
        S("span", null, [
          o[3] || (o[3] = ce("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (N(), D("span", my, ": " + K(e.state.deletion_job.last_error), 1)) : Q("", !0)
        ]),
        z(h(fe), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: o[0] || (o[0] = He((r) => i.$emit("retry"), ["stop"]))
        })
      ], 64)) : (N(), D(le, { key: 1 }, [
        z(h(dt), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        o[4] || (o[4] = S("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : Q("", !0);
  }
}), yy = 2e3;
function Fl(e) {
  const t = e.margin ?? 8, n = e.gap ?? 4, i = Math.max(0, e.viewportWidth), o = Math.max(0, e.viewportHeight), r = Math.max(0, i - t * 2), a = Math.min(Math.max(0, e.requestedWidth), r), s = e.align === "right" ? e.anchor.right - a : e.anchor.left, l = Math.max(t, Math.min(s, i - t - a)), c = Math.max(0, o - e.anchor.bottom - n - t), u = Math.max(0, e.anchor.top - n - t), d = c < e.requestedMaxHeight && u > c ? "above" : "below", f = d === "above" ? u : c, p = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), f)), v = Math.min(Math.max(0, e.panelHeight ?? p), p), y = d === "above" ? e.anchor.top - n - v : e.anchor.bottom + n, m = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(l - m.left),
    width: Math.round(a),
    maxHeight: p,
    side: d,
    top: Math.round(y - m.top)
  };
}
const wy = /* @__PURE__ */ ye({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: yy }
  },
  emits: ["update:open"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = G(null), r = G({ position: "fixed", visibility: "hidden" });
    function a() {
      const y = n.anchor, m = o.value;
      if (!y || !m) return;
      const _ = y.getBoundingClientRect(), x = n.width === "anchor" ? Math.max(n.minWidth, _.width) : Math.max(n.minWidth, n.width), w = {
        anchor: _,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: x,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, b = Fl(w);
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
      const C = m.getBoundingClientRect(), I = Fl({
        ...w,
        containingBlockOrigin: { left: C.left, top: C.top },
        panelHeight: C.height
      }), B = {
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
      r.value = B;
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
    _e(() => n.open, async (y) => {
      d(), y && (r.value = { position: "fixed", visibility: "hidden" }, await Ve(), a(), u());
    }, { immediate: !0 });
    function f(y) {
      if (!n.open) return;
      const m = y.composedPath();
      o.value && m.includes(o.value) || n.anchor && m.includes(n.anchor) || i("update:open", !1);
    }
    function p(y) {
      !n.open || y.key !== "Escape" || (y.preventDefault(), y.stopImmediatePropagation(), i("update:open", !1));
    }
    function v() {
      n.open && a();
    }
    return document.addEventListener("click", f), document.addEventListener("keydown", p, !0), window.addEventListener("resize", v), window.addEventListener("scroll", v, !0), Qe(() => {
      d(), document.removeEventListener("click", f), document.removeEventListener("keydown", p, !0), window.removeEventListener("resize", v), window.removeEventListener("scroll", v, !0);
    }), (y, m) => e.open ? (N(), D("div", {
      key: 0,
      ref_key: "panel",
      ref: o,
      class: "anchored-panel",
      style: Be(r.value)
    }, [
      ze(y.$slots, "default")
    ], 4)) : Q("", !0);
  }
});
function qd(e) {
  return `${(e || "").normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "flow"}.flow.json`;
}
function Ps(e, t) {
  if (typeof document > "u") return;
  const n = new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), i = URL.createObjectURL(n), o = document.createElement("a");
  o.href = i, o.download = e, document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(i);
}
const by = {
  class: "kx-list wf-table",
  role: "table",
  "aria-label": "Workflows"
}, _y = {
  key: 0,
  class: "wf-group-head",
  role: "row"
}, ky = { class: "wf-group-title" }, Ey = { class: "wf-group-count" }, xy = ["onClick", "onKeydown"], $y = {
  class: "wf-row-main",
  role: "cell"
}, Sy = { class: "wf-row-icon" }, Cy = { class: "wf-row-text" }, Ny = { class: "wf-row-name" }, Iy = {
  key: 0,
  class: "wf-row-sub"
}, Ay = { class: "wf-label-chip-text" }, Ty = { key: 1 }, My = ["title"], Oy = {
  class: "wf-status-cell",
  role: "cell",
  "data-label": "Status"
}, Ry = {
  class: "wf-lastrun",
  role: "cell",
  "data-label": "Last run"
}, Dy = ["title"], Py = {
  class: "wf-row-updated",
  role: "cell",
  "data-label": "Updated"
}, Ly = {
  class: "wf-row-menu",
  role: "menu",
  "aria-label": "Workflow actions"
}, Vy = {
  key: 0,
  class: "wf-row-menu-sep",
  role: "separator"
}, zy = ["title", "disabled", "aria-label", "onClick"], By = /* @__PURE__ */ ye({
  __name: "WorkflowTable",
  props: {
    items: {}
  },
  emits: ["open", "labels-saved", "label-error", "export-error", "share", "ask-delete"],
  setup(e, { emit: t }) {
    function n(E) {
      return E === "published" ? "success" : "warn";
    }
    function i(E) {
      return E.lastRun.present ? E.lastRun.tone === "ok" ? "success" : E.lastRun.tone === "error" ? "danger" : "info" : "secondary";
    }
    const o = e, r = t, a = G(null), s = G(""), l = G(""), c = G(null), u = G(null), d = G(""), f = G(null), p = U({
      get: () => u.value !== null,
      set: (E) => {
        E || I();
      }
    }), v = U(() => {
      const E = u.value;
      if (!E) return null;
      const F = o.items.find((g) => g.kind === "row" && g.row.id === E);
      return F?.kind === "row" ? F.row : null;
    });
    function y(E, F) {
      F.stopPropagation();
      const g = a.value !== E;
      a.value = g ? E : null, s.value = "", r("label-error", ""), g && Ve(m);
    }
    function m() {
      const E = c.value?.$el;
      E instanceof HTMLInputElement && E.focus();
    }
    function _() {
      a.value = null, s.value = "";
    }
    async function x(E, F) {
      l.value = E, r("label-error", "");
      try {
        const g = await Vd(E, F);
        r("labels-saved", E, g);
      } catch (g) {
        r("label-error", qe(g, "Couldn’t update labels."));
      } finally {
        l.value = "";
      }
    }
    async function w(E) {
      const F = io(E.labels), g = Jg(F, s.value);
      s.value = "", g !== F && await x(E.id, g);
    }
    async function b(E, F, g) {
      g.stopPropagation(), await x(E.id, Qg(io(E.labels), F));
    }
    function C(E, F) {
      if (F.stopPropagation(), u.value === E) {
        I();
        return;
      }
      u.value = E, f.value = F.currentTarget instanceof HTMLElement ? F.currentTarget : null;
    }
    function I() {
      u.value = null, f.value = null;
    }
    function B(E) {
      E.disabled || !E.command || E.command();
    }
    async function T(E) {
      if (!(!E.status.published || d.value)) {
        d.value = E.id, r("export-error", "");
        try {
          const F = await zd(E.id);
          Ps(qd(F.title), F), I();
        } catch (F) {
          r("export-error", qe(F, "Couldn’t export this Workflow."));
        } finally {
          d.value = "";
        }
      }
    }
    function M(E) {
      const F = f.value;
      I(), r("ask-delete", E, F);
    }
    function V(E) {
      const F = f.value;
      I(), r("share", E, F);
    }
    const O = U(() => {
      const E = v.value;
      if (!E) return [];
      const F = E.status.published && d.value !== E.id, g = E.status.published ? "Export" : "Export unavailable. Publish this Workflow before exporting it.";
      return [
        {
          label: "Share",
          icon: "tabler:share",
          title: "Share this Workflow",
          command: () => V(E)
        },
        { separator: !0 },
        {
          label: g,
          visibleLabel: "Export",
          icon: "tabler:download",
          disabled: !F,
          title: E.status.published ? "Download this published Workflow as JSON" : "Publish this Workflow before exporting it",
          command: () => T(E)
        },
        { separator: !0 },
        {
          label: "Delete",
          icon: "tabler:trash",
          title: "Delete this Workflow",
          danger: !0,
          command: () => M(E)
        }
      ];
    });
    return (E, F) => (N(), D(le, null, [
      S("div", by, [
        F[5] || (F[5] = S("div", {
          class: "wf-table-head",
          role: "row"
        }, [
          S("span", { role: "columnheader" }, "Name"),
          S("span", { role: "columnheader" }, "Labels"),
          S("span", { role: "columnheader" }, "Location"),
          S("span", { role: "columnheader" }, "Status"),
          S("span", { role: "columnheader" }, "Last run"),
          S("span", { role: "columnheader" }, "Updated"),
          S("span", {
            role: "columnheader",
            class: "wf-sr-only"
          }, "Actions")
        ], -1)),
        (N(!0), D(le, null, Re(e.items, (g) => (N(), D(le, {
          key: g.key
        }, [
          g.kind === "header" ? (N(), D("div", _y, [
            z(h(ie), {
              icon: g.empty ? "tabler:tag-off" : "tabler:tag",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            S("span", ky, K(g.header), 1),
            S("span", Ey, K(g.count), 1)
          ])) : (N(), D("div", {
            key: 1,
            class: "kx-row wf-row",
            role: "row",
            tabindex: "0",
            onClick: ($) => !g.row.deleting_at && r("open", g.row.id),
            onKeydown: [
              tt(($) => !g.row.deleting_at && r("open", g.row.id), ["enter"]),
              tt(He(($) => !g.row.deleting_at && r("open", g.row.id), ["prevent"]), ["space"])
            ]
          }, [
            S("span", $y, [
              S("span", Sy, [
                z(h(ie), {
                  icon: "tabler:route",
                  "aria-hidden": "true"
                })
              ]),
              S("span", Cy, [
                z(gy, {
                  state: g.row,
                  onRetry: ($) => M(g.row)
                }, null, 8, ["state", "onRetry"]),
                S("span", Ny, [
                  S("strong", null, K(g.row.title), 1)
                ]),
                g.row.subline ? (N(), D("span", Iy, K(g.row.subline), 1)) : Q("", !0)
              ])
            ]),
            S("span", {
              class: "wf-labels-cell",
              role: "cell",
              "data-label": "Labels",
              onClick: F[2] || (F[2] = He(() => {
              }, ["stop"]))
            }, [
              (N(!0), D(le, null, Re(g.row.labels, ($) => (N(), D("span", {
                key: $,
                class: "wf-label-chip"
              }, [
                S("span", Ay, K($), 1),
                z(h(fe), {
                  class: "wf-label-x",
                  text: "",
                  rounded: "",
                  severity: "secondary",
                  "aria-label": `Remove label ${$}`,
                  disabled: !!g.row.deleting_at || l.value === g.row.id,
                  onClick: He((k) => b(g.row, $, k), ["stop"])
                }, {
                  default: ne(() => [
                    z(h(ie), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ]))), 128)),
              a.value === g.row.id ? (N(), D(le, { key: 0 }, [
                z(h(rt), {
                  ref_for: !0,
                  ref_key: "labelInputRef",
                  ref: c,
                  modelValue: s.value,
                  "onUpdate:modelValue": F[0] || (F[0] = ($) => s.value = $),
                  class: "wf-label-input",
                  type: "text",
                  placeholder: "Add label…",
                  "aria-label": `Add a label to ${g.row.title}`,
                  onClick: F[1] || (F[1] = He(() => {
                  }, ["stop"])),
                  onKeydown: [
                    tt(He(($) => w(g.row), ["stop", "prevent"]), ["enter"]),
                    tt(He(_, ["stop"]), ["escape"])
                  ]
                }, null, 8, ["modelValue", "aria-label", "onKeydown"]),
                z(h(fe), {
                  class: "wf-label-done",
                  text: "",
                  rounded: "",
                  severity: "secondary",
                  "aria-label": "Done editing labels",
                  onClick: He(_, ["stop"])
                }, {
                  default: ne(() => [
                    z(h(ie), {
                      icon: "tabler:check",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                })
              ], 64)) : (N(), re(h(fe), {
                key: 1,
                class: "wf-label-add",
                text: "",
                severity: "secondary",
                "aria-label": `Add a label to ${g.row.title}`,
                disabled: !!g.row.deleting_at || l.value === g.row.id,
                loading: l.value === g.row.id,
                onClick: He(($) => y(g.row.id, $), ["stop"])
              }, {
                default: ne(() => [
                  l.value !== g.row.id ? (N(), re(h(ie), {
                    key: 0,
                    icon: "tabler:plus",
                    "aria-hidden": "true"
                  })) : Q("", !0),
                  g.row.labels.length ? Q("", !0) : (N(), D("span", Ty, "Label"))
                ]),
                _: 2
              }, 1032, ["aria-label", "disabled", "loading", "onClick"]))
            ]),
            S("span", {
              class: Ie(["wf-loc-cell", !g.row.location.present && "is-empty"]),
              role: "cell",
              "data-label": "Location"
            }, [
              g.row.location.present ? (N(), D(le, { key: 0 }, [
                z(h(ie), {
                  icon: "tabler:folder",
                  class: "wf-loc-ico",
                  "aria-hidden": "true"
                }),
                S("span", {
                  class: "wf-loc-name",
                  title: g.row.location.title
                }, K(g.row.location.label), 9, My)
              ], 64)) : Q("", !0)
            ], 2),
            S("span", Oy, [
              z(h(yt), {
                class: "wf-status-tag",
                severity: n(g.row.status.tone),
                title: g.row.status.hasDraft && g.row.status.published ? "Published, with unpublished draft edits" : g.row.status.published ? "Published" : "Not published yet"
              }, {
                default: ne(() => [
                  g.row.status.hasDraft && g.row.status.published ? (N(), re(h(ie), {
                    key: 0,
                    icon: "tabler:pencil",
                    class: "wf-pill-ico",
                    "aria-hidden": "true"
                  })) : Q("", !0),
                  ce(" " + K(g.row.status.label), 1)
                ]),
                _: 2
              }, 1032, ["severity", "title"])
            ]),
            S("span", Ry, [
              z(h(yt), {
                class: "wf-last-run-tag",
                severity: i(g.row),
                title: g.row.lastRun.title
              }, {
                default: ne(() => [
                  g.row.lastRun.present && g.row.lastRun.tone === "pending" ? (N(), re(h(dt), {
                    key: 0,
                    class: "wf-status-spinner",
                    "stroke-width": "4",
                    "aria-label": "Run in progress"
                  })) : (N(), re(h(ie), {
                    key: 1,
                    icon: g.row.lastRun.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])),
                  S("span", null, K(g.row.lastRun.label), 1)
                ]),
                _: 2
              }, 1032, ["severity", "title"]),
              g.row.lastRun.cause ? (N(), D("span", {
                key: 0,
                class: "wf-last-run-cause",
                title: g.row.lastRun.cause
              }, K(g.row.lastRun.cause), 9, Dy)) : Q("", !0)
            ]),
            S("span", Py, K(g.row.updated), 1),
            S("span", {
              class: "wf-row-actions",
              role: "cell",
              onClick: F[3] || (F[3] = He(() => {
              }, ["stop"]))
            }, [
              z(h(fe), {
                class: Ie(["wf-row-menu-btn", u.value === g.row.id && "is-open"]),
                disabled: !!g.row.deleting_at,
                text: "",
                rounded: "",
                severity: "secondary",
                "aria-label": `Actions for ${g.row.title}`,
                "aria-expanded": u.value === g.row.id,
                onClick: He(($) => C(g.row.id, $), ["stop"])
              }, {
                default: ne(() => [
                  z(h(ie), {
                    icon: "tabler:dots-vertical",
                    "aria-hidden": "true"
                  })
                ]),
                _: 1
              }, 8, ["disabled", "class", "aria-label", "aria-expanded", "onClick"])
            ])
          ], 40, xy))
        ], 64))), 128))
      ]),
      z(wy, {
        open: p.value,
        "onUpdate:open": F[4] || (F[4] = (g) => p.value = g),
        anchor: f.value,
        align: "right",
        width: 190
      }, {
        default: ne(() => [
          S("div", Ly, [
            (N(!0), D(le, null, Re(O.value, (g, $) => (N(), D(le, { key: $ }, [
              g.separator ? (N(), D("div", Vy)) : (N(), D("button", {
                key: 1,
                type: "button",
                class: Ie(["wf-row-menu-item", g.danger && "wf-row-menu-item--danger"]),
                role: "menuitem",
                title: g.title,
                disabled: g.disabled,
                "aria-label": g.label,
                onClick: (k) => B(g)
              }, [
                g.icon ? (N(), re(h(ie), {
                  key: 0,
                  icon: g.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : Q("", !0),
                S("span", null, K(g.visibleLabel || g.label), 1)
              ], 10, zy))
            ], 64))), 128))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), Fy = { class: "kx-modal-head-icon" }, Hy = { class: "kx-modal-body" }, qy = { class: "kx-field" }, Uy = { class: "kx-field" }, Wy = /* @__PURE__ */ ye({
  __name: "ImportModal",
  props: {
    open: { type: Boolean }
  },
  emits: ["close", "open"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = G(""), r = G(!1), a = G(""), s = G(null), l = { severity: "secondary", outlined: !0 }, c = {
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
    async function f() {
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
        const { flowId: y } = await Hg(v);
        i("open", y);
      } catch (y) {
        a.value = qe(y, "Couldn’t import this Workflow.");
      } finally {
        r.value = !1;
      }
    }
    return (p, v) => (N(), re(h(Jt), {
      visible: e.open,
      modal: !0,
      "dismissable-mask": !0,
      class: "kx-modal",
      pt: c,
      "aria-label": "Import Workflow",
      "onUpdate:visible": u
    }, {
      header: ne(() => [
        S("span", Fy, [
          z(h(ie), {
            icon: "tabler:file-import",
            "aria-hidden": "true"
          })
        ]),
        v[2] || (v[2] = S("div", {
          class: "kx-modal-head-text",
          style: { flex: "1" }
        }, [
          S("div", { class: "kx-modal-head-title" }, "Import a Workflow"),
          S("div", { class: "kx-modal-head-sub" }, "Paste an exported Workflow or choose a file. We’ll create a draft copy.")
        ], -1))
      ]),
      footer: ne(() => [
        z(h(fe), {
          severity: "secondary",
          text: "",
          onClick: v[1] || (v[1] = (y) => i("close"))
        }, {
          default: ne(() => [...v[4] || (v[4] = [
            ce("Cancel", -1)
          ])]),
          _: 1
        }),
        z(h(fe), {
          disabled: r.value,
          loading: r.value,
          onClick: f
        }, {
          default: ne(() => [
            r.value ? Q("", !0) : (N(), re(h(ie), {
              key: 0,
              icon: "tabler:file-import",
              "aria-hidden": "true"
            })),
            v[5] || (v[5] = S("span", null, "Import", -1))
          ]),
          _: 1
        }, 8, ["disabled", "loading"])
      ]),
      default: ne(() => [
        S("div", Hy, [
          S("div", qy, [
            z(h(Eg), {
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
                z(h(ie), {
                  icon: "tabler:upload",
                  "aria-hidden": "true"
                })
              ]),
              _: 1
            }, 512)
          ]),
          S("div", Uy, [
            v[3] || (v[3] = S("label", { class: "kx-field-lbl" }, "Exported Workflow JSON", -1)),
            z(h(Os), {
              modelValue: o.value,
              "onUpdate:modelValue": v[0] || (v[0] = (y) => o.value = y),
              class: "kx-input wf-import-text wf-mono",
              rows: "9",
              placeholder: '{ "title": "My Workflow", "spec": { … } }',
              "aria-label": "Exported Workflow JSON"
            }, null, 8, ["modelValue"])
          ]),
          a.value ? (N(), re(h(Fe), {
            key: 0,
            class: "wf-setup-error",
            severity: "error",
            closable: !1
          }, {
            default: ne(() => [
              ce(K(a.value), 1)
            ]),
            _: 1
          })) : Q("", !0)
        ])
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}), Cr = "kickside-share";
function Yy(e, t = "Workflow") {
  return {
    resource_id: e,
    access_url: `/api/v1/component-access/grants/${encodeURIComponent(e)}`,
    share_url: `/api/v1/component-access/share/${encodeURIComponent(e)}`,
    title: t.trim() || "Workflow"
  };
}
async function Ud(e, t, n, i) {
  if (e.innerHTML = "", !customElements.get(Cr))
    try {
      await Ki(Cr, { timeoutMs: 8e3 });
    } catch {
    }
  const o = document.createElement(Cr);
  o.setAttribute("config", JSON.stringify(Yy(t, n))), o.style.display = "block";
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
const Gy = { class: "kx-modal-head-icon" }, jy = { class: "kx-modal-body" }, Xy = { class: "kx-field" }, Ky = { class: "kx-field" }, Zy = {
  key: 0,
  class: "wf-create-place"
}, Jy = { class: "kx-modal-head-icon wf-del-icon" }, Qy = { class: "kx-modal-body" }, ew = { class: "wf-del-note" }, tw = { class: "kx-body" }, nw = {
  key: 0,
  class: "kx-list wf-runs-loading"
}, ow = {
  key: 1,
  class: "kx-empty"
}, iw = { class: "kx-empty-ico" }, rw = {
  key: 2,
  class: "kx-empty"
}, aw = { class: "kx-empty-ico" }, sw = { class: "kx-empty-title" }, lw = { class: "kx-empty-sub" }, uw = /* @__PURE__ */ ye({
  __name: "WorkflowList",
  emits: ["open"],
  setup(e, { emit: t }) {
    const n = t, i = wd(), o = U(() => {
      const A = i.value || {};
      return (typeof A.parentId == "string" ? A.parentId : "").trim();
    }), r = G([]), a = G(!0), s = G(""), l = G(""), c = G(""), u = G(""), d = G(!1), f = G(null), p = G("flat"), v = G(""), y = G(!1), m = G(!1), _ = G(null), x = G(null), w = G(null), b = G(null), C = G(null);
    let I = 0;
    function B(A = null) {
      I += 1;
      const P = w.value?.getRootNode();
      b.value = P?.activeElement instanceof HTMLElement ? P.activeElement : null, C.value = A;
    }
    async function T() {
      const A = I, P = b.value, W = C.value;
      await Ve();
      const de = w.value?.getRootNode();
      await Bd({
        root: de ?? null,
        target: P,
        fallback: W,
        isCurrent: () => A === I
      }) && (I += 1, b.value = null, C.value = null);
    }
    const M = new oy({
      createWorkflow: (A, P) => Xm(A, P),
      applyScaffold: (A) => kd(A, ly()).then(() => {
      }),
      setLabels: (A, P) => Vd(A, P).then(() => {
      }),
      deleteWorkflow: (A) => Al(A)
    }), V = U(() => Xg(r.value)), O = U(() => Zg(V.value)), E = U(() => {
      const A = l.value.trim().toLowerCase();
      let P = V.value.filter((W) => A ? `${W.title} ${W.id}`.toLowerCase().includes(A) : !0);
      return f.value !== null && (P = ty(P, f.value)), P;
    }), F = U(() => ny(E.value)), g = U(() => {
      if (p.value !== "label") return E.value.map((P) => ({ kind: "row", key: P.id, row: P }));
      const A = [];
      for (const P of F.value) {
        A.push({ kind: "header", key: `h:${P.key}`, header: P.header, empty: P.key === er, count: P.rows.length });
        for (const W of P.rows) A.push({ kind: "row", key: `${P.key}:${W.id}`, row: W });
      }
      return A;
    }), $ = U(() => r.value.length);
    function k(A, P) {
      r.value = r.value.map((W) => W.id === A ? { ...W, labels: P } : W);
    }
    const H = Bg();
    async function q() {
      const A = H();
      a.value = !0, s.value = "";
      try {
        const P = await Ed();
        A() && (r.value = P);
      } catch (P) {
        A() && (s.value = qe(P, "Couldn’t load your Workflows."));
      } finally {
        A() && (a.value = !1);
      }
    }
    const ee = U(() => !!c.value.trim() && !d.value);
    function Z() {
      B(), c.value = "", u.value = "", s.value = "", y.value = !0;
    }
    function oe() {
      y.value = !1, T(), M.pendingDraftId && M.abandon().then(q);
    }
    async function se() {
      if (!y.value || d.value) return;
      const A = c.value.trim();
      if (!A) {
        s.value = "Name your Workflow first.";
        return;
      }
      d.value = !0, s.value = "";
      try {
        const P = await M.create(A, u.value, o.value || void 0);
        y.value = !1, n("open", P);
      } catch (P) {
        s.value = qe(P, "Couldn’t create the Workflow.");
      } finally {
        d.value = !1;
      }
    }
    const Y = G(null), J = G(!1), j = G(!1), X = {
      header: { class: "kx-modal-head" },
      content: { style: "padding: 0" },
      footer: { class: "kx-modal-foot" }
    };
    function te() {
      B(), m.value = !0;
    }
    function ae() {
      m.value = !1, T();
    }
    function ue(A) {
      const P = Array.from(w.value?.querySelectorAll("button[aria-label]") ?? []).find((W) => W.getAttribute("aria-label") === `Actions for ${A.title}`) ?? null;
      B(P), j.value = !1, Y.value = A;
    }
    function we() {
      j.value = !1, Y.value = null, T();
    }
    async function $e() {
      j.value && (j.value = !1, await Ve(), w.value?.querySelector('button[aria-label^="Actions for"]')?.focus(), I += 1, b.value = null, C.value = null);
    }
    async function ve() {
      const A = Y.value;
      if (!(!A || J.value)) {
        J.value = !0, s.value = "";
        try {
          await Al(A.id), R(A.id), await q(), j.value = !0, Y.value = null;
        } catch (P) {
          s.value = qe(P, "Couldn’t delete this Workflow.");
        } finally {
          J.value = !1;
        }
      }
    }
    async function me(A) {
      const P = Array.from(w.value?.querySelectorAll("button[aria-label]") ?? []).find((W) => W.getAttribute("aria-label") === `Actions for ${A.title}`) ?? null;
      B(P), _.value = A, await Ve(), x.value && await Ud(x.value, A.id, A.title, L);
    }
    function L() {
      _.value = null, T();
    }
    bd(q);
    const { acceptDeletion: R } = zg(r, (A) => A.id, void 0, q);
    return (A, P) => (N(), D("div", {
      ref_key: "rootEl",
      ref: w,
      class: "wf-list kx"
    }, [
      z(vy, {
        "total-count": $.value,
        "label-vocab": O.value,
        q: l.value,
        "onUpdate:q": P[0] || (P[0] = (W) => l.value = W),
        "label-filter": f.value,
        "onUpdate:labelFilter": P[1] || (P[1] = (W) => f.value = W),
        "group-by": p.value,
        "onUpdate:groupBy": P[2] || (P[2] = (W) => p.value = W),
        onImport: te,
        onCreate: Z
      }, null, 8, ["total-count", "label-vocab", "q", "label-filter", "group-by"]),
      s.value ? (N(), re(h(Fe), {
        key: 0,
        class: "wf-banner",
        severity: "error",
        onClose: P[3] || (P[3] = (W) => s.value = "")
      }, {
        default: ne(() => [
          ce(K(s.value), 1)
        ]),
        _: 1
      })) : Q("", !0),
      v.value ? (N(), re(h(Fe), {
        key: 1,
        class: "wf-banner",
        severity: "error",
        onClose: P[4] || (P[4] = (W) => v.value = "")
      }, {
        default: ne(() => [
          ce(K(v.value), 1)
        ]),
        _: 1
      })) : Q("", !0),
      z(h(Jt), {
        visible: y.value,
        modal: !0,
        "dismissable-mask": !0,
        class: "kx-modal",
        pt: X,
        "aria-label": "New Workflow",
        "onUpdate:visible": P[7] || (P[7] = (W) => {
          W || oe();
        })
      }, {
        header: ne(() => [
          S("span", Gy, [
            z(h(ie), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          P[13] || (P[13] = S("div", {
            class: "kx-modal-head-text",
            style: { flex: "1" }
          }, [
            S("div", { class: "kx-modal-head-title" }, "New Workflow"),
            S("div", { class: "kx-modal-head-sub" }, "Start with inputs and a result. Add an Error exit only when you need one.")
          ], -1))
        ]),
        footer: ne(() => [
          z(h(fe), {
            severity: "secondary",
            text: "",
            onClick: oe
          }, {
            default: ne(() => [...P[17] || (P[17] = [
              ce("Cancel", -1)
            ])]),
            _: 1
          }),
          z(h(fe), {
            disabled: !ee.value,
            loading: d.value,
            onClick: se
          }, {
            default: ne(() => [
              d.value ? Q("", !0) : (N(), re(h(ie), {
                key: 0,
                icon: "tabler:check",
                "aria-hidden": "true"
              })),
              P[18] || (P[18] = S("span", null, "Create", -1))
            ]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        default: ne(() => [
          S("div", jy, [
            S("div", Xy, [
              P[14] || (P[14] = S("label", { class: "kx-field-lbl" }, "Name", -1)),
              z(h(rt), {
                modelValue: c.value,
                "onUpdate:modelValue": P[5] || (P[5] = (W) => c.value = W),
                class: "kx-input",
                type: "text",
                placeholder: "Name your Workflow",
                "aria-label": "Workflow name",
                autofocus: "",
                onKeydown: tt(se, ["enter"])
              }, null, 8, ["modelValue"])
            ]),
            S("div", Ky, [
              P[15] || (P[15] = S("label", { class: "kx-field-lbl" }, [
                ce("Label "),
                S("span", { class: "kx-field-opt" }, "optional")
              ], -1)),
              z(h(rt), {
                modelValue: u.value,
                "onUpdate:modelValue": P[6] || (P[6] = (W) => u.value = W),
                class: "kx-input",
                type: "text",
                placeholder: "e.g. sales",
                "aria-label": "Workflow label",
                onKeydown: tt(se, ["enter"])
              }, null, 8, ["modelValue"])
            ]),
            o.value ? (N(), D("p", Zy, [
              z(h(ie), {
                icon: "tabler:folder",
                "aria-hidden": "true"
              }),
              P[16] || (P[16] = S("span", null, "Placed in the selected folder.", -1))
            ])) : Q("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      z(Wy, {
        open: m.value,
        onClose: ae,
        onOpen: P[8] || (P[8] = (W) => n("open", W))
      }, null, 8, ["open"]),
      z(h(Jt), {
        visible: !!Y.value,
        modal: !0,
        "dismissable-mask": !0,
        class: "kx-modal wf-del-modal",
        pt: X,
        "aria-label": "Delete Workflow",
        "onUpdate:visible": P[9] || (P[9] = (W) => {
          W || we();
        }),
        onAfterHide: $e
      }, {
        header: ne(() => [
          S("span", Jy, [
            z(h(ie), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            })
          ]),
          P[19] || (P[19] = S("div", {
            class: "kx-modal-head-text",
            style: { flex: "1" }
          }, [
            S("div", { class: "kx-modal-head-title" }, "Delete Workflow"),
            S("div", { class: "kx-modal-head-sub" }, "This removes the Workflow and its history. It can’t be undone.")
          ], -1))
        ]),
        footer: ne(() => [
          z(h(fe), {
            severity: "secondary",
            text: "",
            onClick: we
          }, {
            default: ne(() => [...P[22] || (P[22] = [
              ce("Cancel", -1)
            ])]),
            _: 1
          }),
          z(h(fe), {
            severity: "danger",
            disabled: J.value,
            loading: J.value,
            onClick: ve
          }, {
            default: ne(() => [
              J.value ? Q("", !0) : (N(), re(h(ie), {
                key: 0,
                icon: "tabler:trash",
                "aria-hidden": "true"
              })),
              P[23] || (P[23] = S("span", null, "Delete", -1))
            ]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        default: ne(() => [
          S("div", Qy, [
            S("p", ew, [
              P[20] || (P[20] = ce("Delete ", -1)),
              S("strong", null, K(Y.value?.title), 1),
              P[21] || (P[21] = ce("?", -1))
            ])
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      S("main", tw, [
        a.value && !r.value.length ? (N(), D("div", nw, [
          z(h(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading Workflows"
          }),
          P[24] || (P[24] = S("span", null, "Loading Workflows…", -1))
        ])) : !E.value.length && !l.value && f.value === null ? (N(), D("div", ow, [
          S("div", iw, [
            z(h(ie), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          P[26] || (P[26] = S("p", { class: "kx-empty-title" }, "No Workflows yet", -1)),
          P[27] || (P[27] = S("p", { class: "kx-empty-sub" }, "Create a Workflow from typed Blocks, then publish it when it’s ready.", -1)),
          z(h(fe), { onClick: Z }, {
            default: ne(() => [
              z(h(ie), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              }),
              P[25] || (P[25] = S("span", null, "New Workflow", -1))
            ]),
            _: 1
          })
        ])) : E.value.length ? (N(), re(By, {
          key: 3,
          items: g.value,
          onOpen: P[10] || (P[10] = (W) => n("open", W)),
          onLabelsSaved: k,
          onLabelError: P[11] || (P[11] = (W) => v.value = W),
          onExportError: P[12] || (P[12] = (W) => s.value = W),
          onShare: me,
          onAskDelete: ue
        }, null, 8, ["items"])) : (N(), D("div", rw, [
          S("div", aw, [
            z(h(ie), {
              icon: "tabler:search",
              "aria-hidden": "true"
            })
          ]),
          S("p", sw, K(f.value !== null ? "No Workflows with this label" : "No matches"), 1),
          S("p", lw, K(f.value !== null ? "No Workflows carry this label yet — add it to a Workflow from its row." : `Nothing matches "${l.value}".`), 1)
        ]))
      ]),
      _.value ? (N(), D("div", {
        key: 2,
        ref_key: "shareHost",
        ref: x
      }, null, 512)) : Q("", !0)
    ], 512));
  }
});
function lo(e) {
  return fd() ? (ri(e), !0) : !1;
}
function Dt(e) {
  return typeof e == "function" ? e() : h(e);
}
const cw = typeof window < "u" && typeof document < "u", dw = (e) => typeof e < "u", fw = Object.prototype.toString, hw = (e) => fw.call(e) === "[object Object]", pw = () => {
};
function vw(e, t) {
  function n(...i) {
    return new Promise((o, r) => {
      Promise.resolve(e(() => t.apply(this, i), { fn: t, thisArg: this, args: i })).then(o).catch(r);
    });
  }
  return n;
}
const Wd = (e) => e();
function mw(e = Wd) {
  const t = G(!0);
  function n() {
    t.value = !1;
  }
  function i() {
    t.value = !0;
  }
  const o = (...r) => {
    t.value && e(...r);
  };
  return { isActive: Fm(t), pause: n, resume: i, eventFilter: o };
}
function Hl(e, t = !1, n = "Timeout") {
  return new Promise((i, o) => {
    setTimeout(t ? () => o(n) : i, e);
  });
}
function gw(e, t, n = {}) {
  const {
    eventFilter: i = Wd,
    ...o
  } = n;
  return _e(
    e,
    vw(
      i,
      t
    ),
    o
  );
}
function bn(e, t, n = {}) {
  const {
    eventFilter: i,
    ...o
  } = n, { eventFilter: r, pause: a, resume: s, isActive: l } = mw(i);
  return { stop: gw(
    e,
    t,
    {
      ...o,
      eventFilter: r
    }
  ), pause: a, resume: s, isActive: l };
}
function yw(e, t = {}) {
  if (!$s(e))
    return zm(e);
  const n = Array.isArray(e.value) ? Array.from({ length: e.value.length }) : {};
  for (const i in e.value)
    n[i] = Bm(() => ({
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
function Ha(e, t = !1) {
  function n(d, { flush: f = "sync", deep: p = !1, timeout: v, throwOnTimeout: y } = {}) {
    let m = null;
    const x = [new Promise((w) => {
      m = _e(
        e,
        (b) => {
          d(b) !== t && (m?.(), w(b));
        },
        {
          flush: f,
          deep: p,
          immediate: !0
        }
      );
    })];
    return v != null && x.push(
      Hl(v, y).then(() => Dt(e)).finally(() => m?.())
    ), Promise.race(x);
  }
  function i(d, f) {
    if (!$s(d))
      return n((b) => b === d, f);
    const { flush: p = "sync", deep: v = !1, timeout: y, throwOnTimeout: m } = f ?? {};
    let _ = null;
    const w = [new Promise((b) => {
      _ = _e(
        [e, d],
        ([C, I]) => {
          t !== (C === I) && (_?.(), b(C));
        },
        {
          flush: p,
          deep: v,
          immediate: !0
        }
      );
    })];
    return y != null && w.push(
      Hl(y, m).then(() => Dt(e)).finally(() => (_?.(), Dt(e)))
    ), Promise.race(w);
  }
  function o(d) {
    return n((f) => !!f, d);
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
  function l(d, f) {
    return n((p) => {
      const v = Array.from(p);
      return v.includes(d) || v.includes(Dt(d));
    }, f);
  }
  function c(d) {
    return u(1, d);
  }
  function u(d = 1, f) {
    let p = -1;
    return n(() => (p += 1, p >= d), f);
  }
  return Array.isArray(Dt(e)) ? {
    toMatch: n,
    toContains: l,
    changed: c,
    changedTimes: u,
    get not() {
      return Ha(e, !t);
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
      return Ha(e, !t);
    }
  };
}
function qa(e) {
  return Ha(e);
}
function ww(e) {
  var t;
  const n = Dt(e);
  return (t = n?.$el) != null ? t : n;
}
const Yd = cw ? window : void 0;
function Gd(...e) {
  let t, n, i, o;
  if (typeof e[0] == "string" || Array.isArray(e[0]) ? ([n, i, o] = e, t = Yd) : [t, n, i, o] = e, !t)
    return pw;
  Array.isArray(n) || (n = [n]), Array.isArray(i) || (i = [i]);
  const r = [], a = () => {
    r.forEach((u) => u()), r.length = 0;
  }, s = (u, d, f, p) => (u.addEventListener(d, f, p), () => u.removeEventListener(d, f, p)), l = _e(
    () => [ww(t), Dt(o)],
    ([u, d]) => {
      if (a(), !u)
        return;
      const f = hw(d) ? { ...d } : d;
      r.push(
        ...n.flatMap((p) => i.map((v) => s(u, p, v, f)))
      );
    },
    { immediate: !0, flush: "post" }
  ), c = () => {
    l(), a();
  };
  return lo(c), c;
}
function bw(e) {
  return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function ql(...e) {
  let t, n, i = {};
  e.length === 3 ? (t = e[0], n = e[1], i = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], i = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
  const {
    target: o = Yd,
    eventName: r = "keydown",
    passive: a = !1,
    dedupe: s = !1
  } = i, l = bw(t);
  return Gd(o, r, (u) => {
    u.repeat && Dt(s) || l(u) && n(u);
  }, a);
}
function _w(e) {
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
    shouldEmit: f
  } = i, p = Ln(), v = n || p?.emit || ((o = p?.$emit) == null ? void 0 : o.bind(p)) || ((a = (r = p?.proxy) == null ? void 0 : r.$emit) == null ? void 0 : a.bind(p?.proxy));
  let y = c;
  t || (t = "modelValue"), y = y || `update:${t.toString()}`;
  const m = (w) => s ? typeof s == "function" ? s(w) : _w(w) : w, _ = () => dw(e[t]) ? m(e[t]) : d, x = (w) => {
    f ? f(w) && v(y, w) : v(y, w);
  };
  if (l) {
    const w = _(), b = G(w);
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
        return _();
      },
      set(w) {
        x(w);
      }
    });
}
var kw = { value: () => {
} };
function tr() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i))
      throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new si(n);
}
function si(e) {
  this._ = e;
}
function Ew(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", o = n.indexOf(".");
    if (o >= 0 && (i = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n))
      throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
si.prototype = tr.prototype = {
  constructor: si,
  on: function(e, t) {
    var n = this._, i = Ew(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; )
        if ((o = (e = i[r]).type) && (o = xw(n[o], e.name)))
          return o;
      return;
    }
    if (t != null && typeof t != "function")
      throw new Error("invalid callback: " + t);
    for (; ++r < a; )
      if (o = (e = i[r]).type)
        n[o] = Ul(n[o], e.name, t);
      else if (t == null)
        for (o in n)
          n[o] = Ul(n[o], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t)
      e[n] = t[n].slice();
    return new si(e);
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
function xw(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function Ul(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = kw, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var Ua = "http://www.w3.org/1999/xhtml";
const Wl = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Ua,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function nr(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Wl.hasOwnProperty(t) ? { space: Wl[t], local: e } : e;
}
function $w(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === Ua && t.documentElement.namespaceURI === Ua ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function Sw(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function jd(e) {
  var t = nr(e);
  return (t.local ? Sw : $w)(t);
}
function Cw() {
}
function Ls(e) {
  return e == null ? Cw : function() {
    return this.querySelector(e);
  };
}
function Nw(e) {
  typeof e != "function" && (e = Ls(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = new Array(a), l, c, u = 0; u < a; ++u)
      (l = r[u]) && (c = e.call(l, l.__data__, u, r)) && ("__data__" in l && (c.__data__ = l.__data__), s[u] = c);
  return new at(i, this._parents);
}
function Iw(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function Aw() {
  return [];
}
function Xd(e) {
  return e == null ? Aw : function() {
    return this.querySelectorAll(e);
  };
}
function Tw(e) {
  return function() {
    return Iw(e.apply(this, arguments));
  };
}
function Mw(e) {
  typeof e == "function" ? e = Tw(e) : e = Xd(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), o.push(l));
  return new at(i, o);
}
function Kd(e) {
  return function() {
    return this.matches(e);
  };
}
function Zd(e) {
  return function(t) {
    return t.matches(e);
  };
}
var Ow = Array.prototype.find;
function Rw(e) {
  return function() {
    return Ow.call(this.children, e);
  };
}
function Dw() {
  return this.firstElementChild;
}
function Pw(e) {
  return this.select(e == null ? Dw : Rw(typeof e == "function" ? e : Zd(e)));
}
var Lw = Array.prototype.filter;
function Vw() {
  return Array.from(this.children);
}
function zw(e) {
  return function() {
    return Lw.call(this.children, e);
  };
}
function Bw(e) {
  return this.selectAll(e == null ? Vw : zw(typeof e == "function" ? e : Zd(e)));
}
function Fw(e) {
  typeof e != "function" && (e = Kd(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new at(i, this._parents);
}
function Jd(e) {
  return new Array(e.length);
}
function Hw() {
  return new at(this._enter || this._groups.map(Jd), this._parents);
}
function $i(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
$i.prototype = {
  constructor: $i,
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
function qw(e) {
  return function() {
    return e;
  };
}
function Uw(e, t, n, i, o, r) {
  for (var a = 0, s, l = t.length, c = r.length; a < c; ++a)
    (s = t[a]) ? (s.__data__ = r[a], i[a] = s) : n[a] = new $i(e, r[a]);
  for (; a < l; ++a)
    (s = t[a]) && (o[a] = s);
}
function Ww(e, t, n, i, o, r, a) {
  var s, l, c = /* @__PURE__ */ new Map(), u = t.length, d = r.length, f = new Array(u), p;
  for (s = 0; s < u; ++s)
    (l = t[s]) && (f[s] = p = a.call(l, l.__data__, s, t) + "", c.has(p) ? o[s] = l : c.set(p, l));
  for (s = 0; s < d; ++s)
    p = a.call(e, r[s], s, r) + "", (l = c.get(p)) ? (i[s] = l, l.__data__ = r[s], c.delete(p)) : n[s] = new $i(e, r[s]);
  for (s = 0; s < u; ++s)
    (l = t[s]) && c.get(f[s]) === l && (o[s] = l);
}
function Yw(e) {
  return e.__data__;
}
function Gw(e, t) {
  if (!arguments.length)
    return Array.from(this, Yw);
  var n = t ? Ww : Uw, i = this._parents, o = this._groups;
  typeof e != "function" && (e = qw(e));
  for (var r = o.length, a = new Array(r), s = new Array(r), l = new Array(r), c = 0; c < r; ++c) {
    var u = i[c], d = o[c], f = d.length, p = jw(e.call(u, u && u.__data__, c, i)), v = p.length, y = s[c] = new Array(v), m = a[c] = new Array(v), _ = l[c] = new Array(f);
    n(u, d, y, m, _, p, t);
    for (var x = 0, w = 0, b, C; x < v; ++x)
      if (b = y[x]) {
        for (x >= w && (w = x + 1); !(C = m[w]) && ++w < v; )
          ;
        b._next = C || null;
      }
  }
  return a = new at(a, i), a._enter = s, a._exit = l, a;
}
function jw(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Xw() {
  return new at(this._exit || this._groups.map(Jd), this._parents);
}
function Kw(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function Zw(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), s = new Array(o), l = 0; l < a; ++l)
    for (var c = n[l], u = i[l], d = c.length, f = s[l] = new Array(d), p, v = 0; v < d; ++v)
      (p = c[v] || u[v]) && (f[v] = p);
  for (; l < o; ++l)
    s[l] = n[l];
  return new at(s, this._parents);
}
function Jw() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function Qw(e) {
  e || (e = eb);
  function t(d, f) {
    return d && f ? e(d.__data__, f.__data__) : !d - !f;
  }
  for (var n = this._groups, i = n.length, o = new Array(i), r = 0; r < i; ++r) {
    for (var a = n[r], s = a.length, l = o[r] = new Array(s), c, u = 0; u < s; ++u)
      (c = a[u]) && (l[u] = c);
    l.sort(t);
  }
  return new at(o, this._parents).order();
}
function eb(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function tb() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function nb() {
  return Array.from(this);
}
function ob() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a)
        return a;
    }
  return null;
}
function ib() {
  let e = 0;
  for (const t of this)
    ++e;
  return e;
}
function rb() {
  return !this.node();
}
function ab(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, s; r < a; ++r)
      (s = o[r]) && e.call(s, s.__data__, r, o);
  return this;
}
function sb(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function lb(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function ub(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function cb(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function db(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function fb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function hb(e, t) {
  var n = nr(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? lb : sb : typeof t == "function" ? n.local ? fb : db : n.local ? cb : ub)(n, t));
}
function Qd(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function pb(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function vb(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function mb(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function gb(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? pb : typeof t == "function" ? mb : vb)(e, t, n ?? "")) : An(this.node(), e);
}
function An(e, t) {
  return e.style.getPropertyValue(t) || Qd(e).getComputedStyle(e, null).getPropertyValue(t);
}
function yb(e) {
  return function() {
    delete this[e];
  };
}
function wb(e, t) {
  return function() {
    this[e] = t;
  };
}
function bb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function _b(e, t) {
  return arguments.length > 1 ? this.each((t == null ? yb : typeof t == "function" ? bb : wb)(e, t)) : this.node()[e];
}
function ef(e) {
  return e.trim().split(/^|\s+/);
}
function Vs(e) {
  return e.classList || new tf(e);
}
function tf(e) {
  this._node = e, this._names = ef(e.getAttribute("class") || "");
}
tf.prototype = {
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
function nf(e, t) {
  for (var n = Vs(e), i = -1, o = t.length; ++i < o; )
    n.add(t[i]);
}
function of(e, t) {
  for (var n = Vs(e), i = -1, o = t.length; ++i < o; )
    n.remove(t[i]);
}
function kb(e) {
  return function() {
    nf(this, e);
  };
}
function Eb(e) {
  return function() {
    of(this, e);
  };
}
function xb(e, t) {
  return function() {
    (t.apply(this, arguments) ? nf : of)(this, e);
  };
}
function $b(e, t) {
  var n = ef(e + "");
  if (arguments.length < 2) {
    for (var i = Vs(this.node()), o = -1, r = n.length; ++o < r; )
      if (!i.contains(n[o]))
        return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? xb : t ? kb : Eb)(n, t));
}
function Sb() {
  this.textContent = "";
}
function Cb(e) {
  return function() {
    this.textContent = e;
  };
}
function Nb(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function Ib(e) {
  return arguments.length ? this.each(e == null ? Sb : (typeof e == "function" ? Nb : Cb)(e)) : this.node().textContent;
}
function Ab() {
  this.innerHTML = "";
}
function Tb(e) {
  return function() {
    this.innerHTML = e;
  };
}
function Mb(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function Ob(e) {
  return arguments.length ? this.each(e == null ? Ab : (typeof e == "function" ? Mb : Tb)(e)) : this.node().innerHTML;
}
function Rb() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Db() {
  return this.each(Rb);
}
function Pb() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Lb() {
  return this.each(Pb);
}
function Vb(e) {
  var t = typeof e == "function" ? e : jd(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function zb() {
  return null;
}
function Bb(e, t) {
  var n = typeof e == "function" ? e : jd(e), i = t == null ? zb : typeof t == "function" ? t : Ls(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function Fb() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function Hb() {
  return this.each(Fb);
}
function qb() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Ub() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Wb(e) {
  return this.select(e ? Ub : qb);
}
function Yb(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function Gb(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function jb(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function Xb(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function Kb(e, t, n) {
  return function() {
    var i = this.__on, o, r = Gb(t);
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
function Zb(e, t, n) {
  var i = jb(e + ""), o, r = i.length, a;
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
  for (s = t ? Kb : Xb, o = 0; o < r; ++o)
    this.each(s(i[o], t, n));
  return this;
}
function rf(e, t, n) {
  var i = Qd(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function Jb(e, t) {
  return function() {
    return rf(this, e, t);
  };
}
function Qb(e, t) {
  return function() {
    return rf(this, e, t.apply(this, arguments));
  };
}
function e1(e, t) {
  return this.each((typeof t == "function" ? Qb : Jb)(e, t));
}
function* t1() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var af = [null];
function at(e, t) {
  this._groups = e, this._parents = t;
}
function So() {
  return new at([[document.documentElement]], af);
}
function n1() {
  return this;
}
at.prototype = So.prototype = {
  constructor: at,
  select: Nw,
  selectAll: Mw,
  selectChild: Pw,
  selectChildren: Bw,
  filter: Fw,
  data: Gw,
  enter: Hw,
  exit: Xw,
  join: Kw,
  merge: Zw,
  selection: n1,
  order: Jw,
  sort: Qw,
  call: tb,
  nodes: nb,
  node: ob,
  size: ib,
  empty: rb,
  each: ab,
  attr: hb,
  style: gb,
  property: _b,
  classed: $b,
  text: Ib,
  html: Ob,
  raise: Db,
  lower: Lb,
  append: Vb,
  insert: Bb,
  remove: Hb,
  clone: Wb,
  datum: Yb,
  on: Zb,
  dispatch: e1,
  [Symbol.iterator]: t1
};
function pt(e) {
  return typeof e == "string" ? new at([[document.querySelector(e)]], [document.documentElement]) : new at([[e]], af);
}
function o1(e) {
  let t;
  for (; t = e.sourceEvent; )
    e = t;
  return e;
}
function kt(e, t) {
  if (e = o1(e), t === void 0 && (t = e.currentTarget), t) {
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
const i1 = { passive: !1 }, uo = { capture: !0, passive: !1 };
function Ir(e) {
  e.stopImmediatePropagation();
}
function xn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function sf(e) {
  var t = e.document.documentElement, n = pt(e).on("dragstart.drag", xn, uo);
  "onselectstart" in t ? n.on("selectstart.drag", xn, uo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function lf(e, t) {
  var n = e.document.documentElement, i = pt(e).on("dragstart.drag", null);
  t && (i.on("click.drag", xn, uo), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const Fo = (e) => () => e;
function Wa(e, {
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
Wa.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function r1(e) {
  return !e.ctrlKey && !e.button;
}
function a1() {
  return this.parentNode;
}
function s1(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function l1() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function u1() {
  var e = r1, t = a1, n = s1, i = l1, o = {}, r = tr("start", "drag", "end"), a = 0, s, l, c, u, d = 0;
  function f(b) {
    b.on("mousedown.drag", p).filter(i).on("touchstart.drag", m).on("touchmove.drag", _, i1).on("touchend.drag touchcancel.drag", x).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function p(b, C) {
    if (!(u || !e.call(this, b, C))) {
      var I = w(this, t.call(this, b, C), b, C, "mouse");
      I && (pt(b.view).on("mousemove.drag", v, uo).on("mouseup.drag", y, uo), sf(b.view), Ir(b), c = !1, s = b.clientX, l = b.clientY, I("start", b));
    }
  }
  function v(b) {
    if (xn(b), !c) {
      var C = b.clientX - s, I = b.clientY - l;
      c = C * C + I * I > d;
    }
    o.mouse("drag", b);
  }
  function y(b) {
    pt(b.view).on("mousemove.drag mouseup.drag", null), lf(b.view, c), xn(b), o.mouse("end", b);
  }
  function m(b, C) {
    if (e.call(this, b, C)) {
      var I = b.changedTouches, B = t.call(this, b, C), T = I.length, M, V;
      for (M = 0; M < T; ++M)
        (V = w(this, B, b, C, I[M].identifier, I[M])) && (Ir(b), V("start", b, I[M]));
    }
  }
  function _(b) {
    var C = b.changedTouches, I = C.length, B, T;
    for (B = 0; B < I; ++B)
      (T = o[C[B].identifier]) && (xn(b), T("drag", b, C[B]));
  }
  function x(b) {
    var C = b.changedTouches, I = C.length, B, T;
    for (u && clearTimeout(u), u = setTimeout(function() {
      u = null;
    }, 500), B = 0; B < I; ++B)
      (T = o[C[B].identifier]) && (Ir(b), T("end", b, C[B]));
  }
  function w(b, C, I, B, T, M) {
    var V = r.copy(), O = kt(M || I, C), E, F, g;
    if ((g = n.call(b, new Wa("beforestart", {
      sourceEvent: I,
      target: f,
      identifier: T,
      active: a,
      x: O[0],
      y: O[1],
      dx: 0,
      dy: 0,
      dispatch: V
    }), B)) != null)
      return E = g.x - O[0] || 0, F = g.y - O[1] || 0, function $(k, H, q) {
        var ee = O, Z;
        switch (k) {
          case "start":
            o[T] = $, Z = a++;
            break;
          case "end":
            delete o[T], --a;
          case "drag":
            O = kt(q || H, C), Z = a;
            break;
        }
        V.call(
          k,
          b,
          new Wa(k, {
            sourceEvent: H,
            subject: g,
            target: f,
            identifier: T,
            active: Z,
            x: O[0] + E,
            y: O[1] + F,
            dx: O[0] - ee[0],
            dy: O[1] - ee[1],
            dispatch: V
          }),
          B
        );
      };
  }
  return f.filter = function(b) {
    return arguments.length ? (e = typeof b == "function" ? b : Fo(!!b), f) : e;
  }, f.container = function(b) {
    return arguments.length ? (t = typeof b == "function" ? b : Fo(b), f) : t;
  }, f.subject = function(b) {
    return arguments.length ? (n = typeof b == "function" ? b : Fo(b), f) : n;
  }, f.touchable = function(b) {
    return arguments.length ? (i = typeof b == "function" ? b : Fo(!!b), f) : i;
  }, f.on = function() {
    var b = r.on.apply(r, arguments);
    return b === r ? f : b;
  }, f.clickDistance = function(b) {
    return arguments.length ? (d = (b = +b) * b, f) : Math.sqrt(d);
  }, f;
}
function zs(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function uf(e, t) {
  var n = Object.create(e.prototype);
  for (var i in t)
    n[i] = t[i];
  return n;
}
function Co() {
}
var co = 0.7, Si = 1 / co, $n = "\\s*([+-]?\\d+)\\s*", fo = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", It = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", c1 = /^#([0-9a-f]{3,8})$/, d1 = new RegExp(`^rgb\\(${$n},${$n},${$n}\\)$`), f1 = new RegExp(`^rgb\\(${It},${It},${It}\\)$`), h1 = new RegExp(`^rgba\\(${$n},${$n},${$n},${fo}\\)$`), p1 = new RegExp(`^rgba\\(${It},${It},${It},${fo}\\)$`), v1 = new RegExp(`^hsl\\(${fo},${It},${It}\\)$`), m1 = new RegExp(`^hsla\\(${fo},${It},${It},${fo}\\)$`), Yl = {
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
  hex: Gl,
  // Deprecated! Use color.formatHex.
  formatHex: Gl,
  formatHex8: g1,
  formatHsl: y1,
  formatRgb: jl,
  toString: jl
});
function Gl() {
  return this.rgb().formatHex();
}
function g1() {
  return this.rgb().formatHex8();
}
function y1() {
  return cf(this).formatHsl();
}
function jl() {
  return this.rgb().formatRgb();
}
function dn(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = c1.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? Xl(t) : n === 3 ? new ot(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Ho(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Ho(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = d1.exec(e)) ? new ot(t[1], t[2], t[3], 1) : (t = f1.exec(e)) ? new ot(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = h1.exec(e)) ? Ho(t[1], t[2], t[3], t[4]) : (t = p1.exec(e)) ? Ho(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = v1.exec(e)) ? Jl(t[1], t[2] / 100, t[3] / 100, 1) : (t = m1.exec(e)) ? Jl(t[1], t[2] / 100, t[3] / 100, t[4]) : Yl.hasOwnProperty(e) ? Xl(Yl[e]) : e === "transparent" ? new ot(NaN, NaN, NaN, 0) : null;
}
function Xl(e) {
  return new ot(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Ho(e, t, n, i) {
  return i <= 0 && (e = t = n = NaN), new ot(e, t, n, i);
}
function w1(e) {
  return e instanceof Co || (e = dn(e)), e ? (e = e.rgb(), new ot(e.r, e.g, e.b, e.opacity)) : new ot();
}
function Ya(e, t, n, i) {
  return arguments.length === 1 ? w1(e) : new ot(e, t, n, i ?? 1);
}
function ot(e, t, n, i) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +i;
}
zs(ot, Ya, uf(Co, {
  brighter(e) {
    return e = e == null ? Si : Math.pow(Si, e), new ot(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? co : Math.pow(co, e), new ot(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new ot(ln(this.r), ln(this.g), ln(this.b), Ci(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Kl,
  // Deprecated! Use color.formatHex.
  formatHex: Kl,
  formatHex8: b1,
  formatRgb: Zl,
  toString: Zl
}));
function Kl() {
  return `#${an(this.r)}${an(this.g)}${an(this.b)}`;
}
function b1() {
  return `#${an(this.r)}${an(this.g)}${an(this.b)}${an((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Zl() {
  const e = Ci(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${ln(this.r)}, ${ln(this.g)}, ${ln(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function Ci(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function ln(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function an(e) {
  return e = ln(e), (e < 16 ? "0" : "") + e.toString(16);
}
function Jl(e, t, n, i) {
  return i <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new vt(e, t, n, i);
}
function cf(e) {
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
function _1(e, t, n, i) {
  return arguments.length === 1 ? cf(e) : new vt(e, t, n, i ?? 1);
}
function vt(e, t, n, i) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +i;
}
zs(vt, _1, uf(Co, {
  brighter(e) {
    return e = e == null ? Si : Math.pow(Si, e), new vt(this.h, this.s, this.l * e, this.opacity);
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
    return new vt(Ql(this.h), qo(this.s), qo(this.l), Ci(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Ci(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${Ql(this.h)}, ${qo(this.s) * 100}%, ${qo(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function Ql(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function qo(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Ar(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const Bs = (e) => () => e;
function k1(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function E1(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(i) {
    return Math.pow(e + i * t, n);
  };
}
function x1(e) {
  return (e = +e) == 1 ? df : function(t, n) {
    return n - t ? E1(t, n, e) : Bs(isNaN(t) ? n : t);
  };
}
function df(e, t) {
  var n = t - e;
  return n ? k1(e, n) : Bs(isNaN(e) ? t : e);
}
const Ni = (function e(t) {
  var n = x1(t);
  function i(o, r) {
    var a = n((o = Ya(o)).r, (r = Ya(r)).r), s = n(o.g, r.g), l = n(o.b, r.b), c = df(o.opacity, r.opacity);
    return function(u) {
      return o.r = a(u), o.g = s(u), o.b = l(u), o.opacity = c(u), o + "";
    };
  }
  return i.gamma = e, i;
})(1);
function $1(e, t) {
  t || (t = []);
  var n = e ? Math.min(t.length, e.length) : 0, i = t.slice(), o;
  return function(r) {
    for (o = 0; o < n; ++o)
      i[o] = e[o] * (1 - r) + t[o] * r;
    return i;
  };
}
function S1(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function C1(e, t) {
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
function N1(e, t) {
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
function I1(e, t) {
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
var Ga = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Tr = new RegExp(Ga.source, "g");
function A1(e) {
  return function() {
    return e;
  };
}
function T1(e) {
  return function(t) {
    return e(t) + "";
  };
}
function ff(e, t) {
  var n = Ga.lastIndex = Tr.lastIndex = 0, i, o, r, a = -1, s = [], l = [];
  for (e = e + "", t = t + ""; (i = Ga.exec(e)) && (o = Tr.exec(t)); )
    (r = o.index) > n && (r = t.slice(n, r), s[a] ? s[a] += r : s[++a] = r), (i = i[0]) === (o = o[0]) ? s[a] ? s[a] += o : s[++a] = o : (s[++a] = null, l.push({ i: a, x: Et(i, o) })), n = Tr.lastIndex;
  return n < t.length && (r = t.slice(n), s[a] ? s[a] += r : s[++a] = r), s.length < 2 ? l[0] ? T1(l[0].x) : A1(t) : (t = l.length, function(c) {
    for (var u = 0, d; u < t; ++u)
      s[(d = l[u]).i] = d.x(c);
    return s.join("");
  });
}
function eo(e, t) {
  var n = typeof t, i;
  return t == null || n === "boolean" ? Bs(t) : (n === "number" ? Et : n === "string" ? (i = dn(t)) ? (t = i, Ni) : ff : t instanceof dn ? Ni : t instanceof Date ? N1 : S1(t) ? $1 : Array.isArray(t) ? C1 : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? I1 : Et)(e, t);
}
var eu = 180 / Math.PI, ja = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function hf(e, t, n, i, o, r) {
  var a, s, l;
  return (a = Math.sqrt(e * e + t * t)) && (e /= a, t /= a), (l = e * n + t * i) && (n -= e * l, i -= t * l), (s = Math.sqrt(n * n + i * i)) && (n /= s, i /= s, l /= s), e * i < t * n && (e = -e, t = -t, l = -l, a = -a), {
    translateX: o,
    translateY: r,
    rotate: Math.atan2(t, e) * eu,
    skewX: Math.atan(l) * eu,
    scaleX: a,
    scaleY: s
  };
}
var Uo;
function M1(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? ja : hf(t.a, t.b, t.c, t.d, t.e, t.f);
}
function O1(e) {
  return e == null || (Uo || (Uo = document.createElementNS("http://www.w3.org/2000/svg", "g")), Uo.setAttribute("transform", e), !(e = Uo.transform.baseVal.consolidate())) ? ja : (e = e.matrix, hf(e.a, e.b, e.c, e.d, e.e, e.f));
}
function pf(e, t, n, i) {
  function o(c) {
    return c.length ? c.pop() + " " : "";
  }
  function r(c, u, d, f, p, v) {
    if (c !== d || u !== f) {
      var y = p.push("translate(", null, t, null, n);
      v.push({ i: y - 4, x: Et(c, d) }, { i: y - 2, x: Et(u, f) });
    } else (d || f) && p.push("translate(" + d + t + f + n);
  }
  function a(c, u, d, f) {
    c !== u ? (c - u > 180 ? u += 360 : u - c > 180 && (c += 360), f.push({ i: d.push(o(d) + "rotate(", null, i) - 2, x: Et(c, u) })) : u && d.push(o(d) + "rotate(" + u + i);
  }
  function s(c, u, d, f) {
    c !== u ? f.push({ i: d.push(o(d) + "skewX(", null, i) - 2, x: Et(c, u) }) : u && d.push(o(d) + "skewX(" + u + i);
  }
  function l(c, u, d, f, p, v) {
    if (c !== d || u !== f) {
      var y = p.push(o(p) + "scale(", null, ",", null, ")");
      v.push({ i: y - 4, x: Et(c, d) }, { i: y - 2, x: Et(u, f) });
    } else (d !== 1 || f !== 1) && p.push(o(p) + "scale(" + d + "," + f + ")");
  }
  return function(c, u) {
    var d = [], f = [];
    return c = e(c), u = e(u), r(c.translateX, c.translateY, u.translateX, u.translateY, d, f), a(c.rotate, u.rotate, d, f), s(c.skewX, u.skewX, d, f), l(c.scaleX, c.scaleY, u.scaleX, u.scaleY, d, f), c = u = null, function(p) {
      for (var v = -1, y = f.length, m; ++v < y; )
        d[(m = f[v]).i] = m.x(p);
      return d.join("");
    };
  };
}
var R1 = pf(M1, "px, ", "px)", "deg)"), D1 = pf(O1, ", ", ")", ")"), P1 = 1e-12;
function tu(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function L1(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function V1(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const li = (function e(t, n, i) {
  function o(r, a) {
    var s = r[0], l = r[1], c = r[2], u = a[0], d = a[1], f = a[2], p = u - s, v = d - l, y = p * p + v * v, m, _;
    if (y < P1)
      _ = Math.log(f / c) / t, m = function(B) {
        return [
          s + B * p,
          l + B * v,
          c * Math.exp(t * B * _)
        ];
      };
    else {
      var x = Math.sqrt(y), w = (f * f - c * c + i * y) / (2 * c * n * x), b = (f * f - c * c - i * y) / (2 * f * n * x), C = Math.log(Math.sqrt(w * w + 1) - w), I = Math.log(Math.sqrt(b * b + 1) - b);
      _ = (I - C) / t, m = function(B) {
        var T = B * _, M = tu(C), V = c / (n * x) * (M * V1(t * T + C) - L1(C));
        return [
          s + V * p,
          l + V * v,
          c * M / tu(t * T + C)
        ];
      };
    }
    return m.duration = _ * 1e3 * t / Math.SQRT2, m;
  }
  return o.rho = function(r) {
    var a = Math.max(1e-3, +r), s = a * a, l = s * s;
    return e(a, s, l);
  }, o;
})(Math.SQRT2, 2, 4);
var Tn = 0, Gn = 0, qn = 0, vf = 1e3, Ii, jn, Ai = 0, fn = 0, or = 0, ho = typeof performance == "object" && performance.now ? performance : Date, mf = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Fs() {
  return fn || (mf(z1), fn = ho.now() + or);
}
function z1() {
  fn = 0;
}
function Ti() {
  this._call = this._time = this._next = null;
}
Ti.prototype = gf.prototype = {
  constructor: Ti,
  restart: function(e, t, n) {
    if (typeof e != "function")
      throw new TypeError("callback is not a function");
    n = (n == null ? Fs() : +n) + (t == null ? 0 : +t), !this._next && jn !== this && (jn ? jn._next = this : Ii = this, jn = this), this._call = e, this._time = n, Xa();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Xa());
  }
};
function gf(e, t, n) {
  var i = new Ti();
  return i.restart(e, t, n), i;
}
function B1() {
  Fs(), ++Tn;
  for (var e = Ii, t; e; )
    (t = fn - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Tn;
}
function nu() {
  fn = (Ai = ho.now()) + or, Tn = Gn = 0;
  try {
    B1();
  } finally {
    Tn = 0, H1(), fn = 0;
  }
}
function F1() {
  var e = ho.now(), t = e - Ai;
  t > vf && (or -= t, Ai = e);
}
function H1() {
  for (var e, t = Ii, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Ii = n);
  jn = e, Xa(i);
}
function Xa(e) {
  if (!Tn) {
    Gn && (Gn = clearTimeout(Gn));
    var t = e - fn;
    t > 24 ? (e < 1 / 0 && (Gn = setTimeout(nu, e - ho.now() - or)), qn && (qn = clearInterval(qn))) : (qn || (Ai = ho.now(), qn = setInterval(F1, vf)), Tn = 1, mf(nu));
  }
}
function ou(e, t, n) {
  var i = new Ti();
  return t = t == null ? 0 : +t, i.restart((o) => {
    i.stop(), e(o + t);
  }, t, n), i;
}
var q1 = tr("start", "end", "cancel", "interrupt"), U1 = [], yf = 0, iu = 1, Ka = 2, ui = 3, ru = 4, Za = 5, ci = 6;
function ir(e, t, n, i, o, r) {
  var a = e.__transition;
  if (!a)
    e.__transition = {};
  else if (n in a)
    return;
  W1(e, n, {
    name: t,
    index: i,
    // For context during callback.
    group: o,
    // For context during callback.
    on: q1,
    tween: U1,
    time: r.time,
    delay: r.delay,
    duration: r.duration,
    ease: r.ease,
    timer: null,
    state: yf
  });
}
function Hs(e, t) {
  var n = bt(e, t);
  if (n.state > yf)
    throw new Error("too late; already scheduled");
  return n;
}
function Tt(e, t) {
  var n = bt(e, t);
  if (n.state > ui)
    throw new Error("too late; already running");
  return n;
}
function bt(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t]))
    throw new Error("transition not found");
  return n;
}
function W1(e, t, n) {
  var i = e.__transition, o;
  i[t] = n, n.timer = gf(r, 0, n.time);
  function r(c) {
    n.state = iu, n.timer.restart(a, n.delay, n.time), n.delay <= c && a(c - n.delay);
  }
  function a(c) {
    var u, d, f, p;
    if (n.state !== iu)
      return l();
    for (u in i)
      if (p = i[u], p.name === n.name) {
        if (p.state === ui)
          return ou(a);
        p.state === ru ? (p.state = ci, p.timer.stop(), p.on.call("interrupt", e, e.__data__, p.index, p.group), delete i[u]) : +u < t && (p.state = ci, p.timer.stop(), p.on.call("cancel", e, e.__data__, p.index, p.group), delete i[u]);
      }
    if (ou(function() {
      n.state === ui && (n.state = ru, n.timer.restart(s, n.delay, n.time), s(c));
    }), n.state = Ka, n.on.call("start", e, e.__data__, n.index, n.group), n.state === Ka) {
      for (n.state = ui, o = new Array(f = n.tween.length), u = 0, d = -1; u < f; ++u)
        (p = n.tween[u].value.call(e, e.__data__, n.index, n.group)) && (o[++d] = p);
      o.length = d + 1;
    }
  }
  function s(c) {
    for (var u = c < n.duration ? n.ease.call(null, c / n.duration) : (n.timer.restart(l), n.state = Za, 1), d = -1, f = o.length; ++d < f; )
      o[d].call(e, u);
    n.state === Za && (n.on.call("end", e, e.__data__, n.index, n.group), l());
  }
  function l() {
    n.state = ci, n.timer.stop(), delete i[t];
    for (var c in i)
      return;
    delete e.__transition;
  }
}
function di(e, t) {
  var n = e.__transition, i, o, r = !0, a;
  if (n) {
    t = t == null ? null : t + "";
    for (a in n) {
      if ((i = n[a]).name !== t) {
        r = !1;
        continue;
      }
      o = i.state > Ka && i.state < Za, i.state = ci, i.timer.stop(), i.on.call(o ? "interrupt" : "cancel", e, e.__data__, i.index, i.group), delete n[a];
    }
    r && delete e.__transition;
  }
}
function Y1(e) {
  return this.each(function() {
    di(this, e);
  });
}
function G1(e, t) {
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
function j1(e, t, n) {
  var i, o;
  if (typeof n != "function")
    throw new Error();
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
function X1(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var i = bt(this.node(), n).tween, o = 0, r = i.length, a; o < r; ++o)
      if ((a = i[o]).name === e)
        return a.value;
    return null;
  }
  return this.each((t == null ? G1 : j1)(n, e, t));
}
function qs(e, t, n) {
  var i = e._id;
  return e.each(function() {
    var o = Tt(this, i);
    (o.value || (o.value = {}))[t] = n.apply(this, arguments);
  }), function(o) {
    return bt(o, i).value[t];
  };
}
function wf(e, t) {
  var n;
  return (typeof t == "number" ? Et : t instanceof dn ? Ni : (n = dn(t)) ? (t = n, Ni) : ff)(e, t);
}
function K1(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Z1(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function J1(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttribute(e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function Q1(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttributeNS(e.space, e.local);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function e0(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttribute(e) : (a = this.getAttribute(e), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function t0(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttributeNS(e.space, e.local) : (a = this.getAttributeNS(e.space, e.local), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function n0(e, t) {
  var n = nr(e), i = n === "transform" ? D1 : wf;
  return this.attrTween(e, typeof t == "function" ? (n.local ? t0 : e0)(n, i, qs(this, "attr." + e, t)) : t == null ? (n.local ? Z1 : K1)(n) : (n.local ? Q1 : J1)(n, i, t));
}
function o0(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function i0(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function r0(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && i0(e, r)), n;
  }
  return o._value = t, o;
}
function a0(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && o0(e, r)), n;
  }
  return o._value = t, o;
}
function s0(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2)
    return (n = this.tween(n)) && n._value;
  if (t == null)
    return this.tween(n, null);
  if (typeof t != "function")
    throw new Error();
  var i = nr(e);
  return this.tween(n, (i.local ? r0 : a0)(i, t));
}
function l0(e, t) {
  return function() {
    Hs(this, e).delay = +t.apply(this, arguments);
  };
}
function u0(e, t) {
  return t = +t, function() {
    Hs(this, e).delay = t;
  };
}
function c0(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? l0 : u0)(t, e)) : bt(this.node(), t).delay;
}
function d0(e, t) {
  return function() {
    Tt(this, e).duration = +t.apply(this, arguments);
  };
}
function f0(e, t) {
  return t = +t, function() {
    Tt(this, e).duration = t;
  };
}
function h0(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? d0 : f0)(t, e)) : bt(this.node(), t).duration;
}
function p0(e, t) {
  if (typeof t != "function")
    throw new Error();
  return function() {
    Tt(this, e).ease = t;
  };
}
function v0(e) {
  var t = this._id;
  return arguments.length ? this.each(p0(t, e)) : bt(this.node(), t).ease;
}
function m0(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function")
      throw new Error();
    Tt(this, e).ease = n;
  };
}
function g0(e) {
  if (typeof e != "function")
    throw new Error();
  return this.each(m0(this._id, e));
}
function y0(e) {
  typeof e != "function" && (e = Kd(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new zt(i, this._parents, this._name, this._id);
}
function w0(e) {
  if (e._id !== this._id)
    throw new Error();
  for (var t = this._groups, n = e._groups, i = t.length, o = n.length, r = Math.min(i, o), a = new Array(i), s = 0; s < r; ++s)
    for (var l = t[s], c = n[s], u = l.length, d = a[s] = new Array(u), f, p = 0; p < u; ++p)
      (f = l[p] || c[p]) && (d[p] = f);
  for (; s < i; ++s)
    a[s] = t[s];
  return new zt(a, this._parents, this._name, this._id);
}
function b0(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function _0(e, t, n) {
  var i, o, r = b0(t) ? Hs : Tt;
  return function() {
    var a = r(this, e), s = a.on;
    s !== i && (o = (i = s).copy()).on(t, n), a.on = o;
  };
}
function k0(e, t) {
  var n = this._id;
  return arguments.length < 2 ? bt(this.node(), n).on.on(e) : this.each(_0(n, e, t));
}
function E0(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition)
      if (+n !== e)
        return;
    t && t.removeChild(this);
  };
}
function x0() {
  return this.on("end.remove", E0(this._id));
}
function $0(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Ls(e));
  for (var i = this._groups, o = i.length, r = new Array(o), a = 0; a < o; ++a)
    for (var s = i[a], l = s.length, c = r[a] = new Array(l), u, d, f = 0; f < l; ++f)
      (u = s[f]) && (d = e.call(u, u.__data__, f, s)) && ("__data__" in u && (d.__data__ = u.__data__), c[f] = d, ir(c[f], t, n, f, c, bt(u, n)));
  return new zt(r, this._parents, t, n);
}
function S0(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Xd(e));
  for (var i = this._groups, o = i.length, r = [], a = [], s = 0; s < o; ++s)
    for (var l = i[s], c = l.length, u, d = 0; d < c; ++d)
      if (u = l[d]) {
        for (var f = e.call(u, u.__data__, d, l), p, v = bt(u, n), y = 0, m = f.length; y < m; ++y)
          (p = f[y]) && ir(p, t, n, y, f, v);
        r.push(f), a.push(u);
      }
  return new zt(r, a, t, n);
}
var C0 = So.prototype.constructor;
function N0() {
  return new C0(this._groups, this._parents);
}
function I0(e, t) {
  var n, i, o;
  return function() {
    var r = An(this, e), a = (this.style.removeProperty(e), An(this, e));
    return r === a ? null : r === n && a === i ? o : o = t(n = r, i = a);
  };
}
function bf(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function A0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = An(this, e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function T0(e, t, n) {
  var i, o, r;
  return function() {
    var a = An(this, e), s = n(this), l = s + "";
    return s == null && (l = s = (this.style.removeProperty(e), An(this, e))), a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s));
  };
}
function M0(e, t) {
  var n, i, o, r = "style." + t, a = "end." + r, s;
  return function() {
    var l = Tt(this, e), c = l.on, u = l.value[r] == null ? s || (s = bf(t)) : void 0;
    (c !== n || o !== u) && (i = (n = c).copy()).on(a, o = u), l.on = i;
  };
}
function O0(e, t, n) {
  var i = (e += "") == "transform" ? R1 : wf;
  return t == null ? this.styleTween(e, I0(e, i)).on("end.style." + e, bf(e)) : typeof t == "function" ? this.styleTween(e, T0(e, i, qs(this, "style." + e, t))).each(M0(this._id, e)) : this.styleTween(e, A0(e, i, t), n).on("end.style." + e, null);
}
function R0(e, t, n) {
  return function(i) {
    this.style.setProperty(e, t.call(this, i), n);
  };
}
function D0(e, t, n) {
  var i, o;
  function r() {
    var a = t.apply(this, arguments);
    return a !== o && (i = (o = a) && R0(e, a, n)), i;
  }
  return r._value = t, r;
}
function P0(e, t, n) {
  var i = "style." + (e += "");
  if (arguments.length < 2)
    return (i = this.tween(i)) && i._value;
  if (t == null)
    return this.tween(i, null);
  if (typeof t != "function")
    throw new Error();
  return this.tween(i, D0(e, t, n ?? ""));
}
function L0(e) {
  return function() {
    this.textContent = e;
  };
}
function V0(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function z0(e) {
  return this.tween("text", typeof e == "function" ? V0(qs(this, "text", e)) : L0(e == null ? "" : e + ""));
}
function B0(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function F0(e) {
  var t, n;
  function i() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && B0(o)), t;
  }
  return i._value = e, i;
}
function H0(e) {
  var t = "text";
  if (arguments.length < 1)
    return (t = this.tween(t)) && t._value;
  if (e == null)
    return this.tween(t, null);
  if (typeof e != "function")
    throw new Error();
  return this.tween(t, F0(e));
}
function q0() {
  for (var e = this._name, t = this._id, n = _f(), i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      if (l = a[c]) {
        var u = bt(l, t);
        ir(l, e, n, c, a, {
          time: u.time + u.delay + u.duration,
          delay: 0,
          duration: u.duration,
          ease: u.ease
        });
      }
  return new zt(i, this._parents, e, n);
}
function U0() {
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
var W0 = 0;
function zt(e, t, n, i) {
  this._groups = e, this._parents = t, this._name = n, this._id = i;
}
function _f() {
  return ++W0;
}
var Ot = So.prototype;
zt.prototype = {
  constructor: zt,
  select: $0,
  selectAll: S0,
  selectChild: Ot.selectChild,
  selectChildren: Ot.selectChildren,
  filter: y0,
  merge: w0,
  selection: N0,
  transition: q0,
  call: Ot.call,
  nodes: Ot.nodes,
  node: Ot.node,
  size: Ot.size,
  empty: Ot.empty,
  each: Ot.each,
  on: k0,
  attr: n0,
  attrTween: s0,
  style: O0,
  styleTween: P0,
  text: z0,
  textTween: H0,
  remove: x0,
  tween: X1,
  delay: c0,
  duration: h0,
  ease: v0,
  easeVarying: g0,
  end: U0,
  [Symbol.iterator]: Ot[Symbol.iterator]
};
function Y0(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var G0 = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Y0
};
function j0(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function X0(e) {
  var t, n;
  e instanceof zt ? (t = e._id, e = e._name) : (t = _f(), (n = G0).time = Fs(), e = e == null ? null : e + "");
  for (var i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && ir(l, e, t, c, a, n || j0(l, t));
  return new zt(i, this._parents, e, t);
}
So.prototype.interrupt = Y1;
So.prototype.transition = X0;
const Wo = (e) => () => e;
function K0(e, {
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
var Mn = new Pt(1, 0, 0);
Pt.prototype;
function Mr(e) {
  e.stopImmediatePropagation();
}
function Un(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Z0(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function J0() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function au() {
  return this.__zoom || Mn;
}
function Q0(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function e_() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function t_(e, t, n) {
  var i = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], r = e.invertY(t[0][1]) - n[0][1], a = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > i ? (i + o) / 2 : Math.min(0, i) || Math.max(0, o),
    a > r ? (r + a) / 2 : Math.min(0, r) || Math.max(0, a)
  );
}
function n_() {
  var e = Z0, t = J0, n = t_, i = Q0, o = e_, r = [0, 1 / 0], a = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], s = 250, l = li, c = tr("start", "zoom", "end"), u, d, f, p = 500, v = 150, y = 0, m = 10;
  function _(g) {
    g.property("__zoom", au).on("wheel.zoom", T, { passive: !1 }).on("mousedown.zoom", M).on("dblclick.zoom", V).filter(o).on("touchstart.zoom", O).on("touchmove.zoom", E).on("touchend.zoom touchcancel.zoom", F).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  _.transform = function(g, $, k, H) {
    var q = g.selection ? g.selection() : g;
    q.property("__zoom", au), g !== q ? C(g, $, k, H) : q.interrupt().each(function() {
      I(this, arguments).event(H).start().zoom(null, typeof $ == "function" ? $.apply(this, arguments) : $).end();
    });
  }, _.scaleBy = function(g, $, k, H) {
    _.scaleTo(g, function() {
      var q = this.__zoom.k, ee = typeof $ == "function" ? $.apply(this, arguments) : $;
      return q * ee;
    }, k, H);
  }, _.scaleTo = function(g, $, k, H) {
    _.transform(g, function() {
      var q = t.apply(this, arguments), ee = this.__zoom, Z = k == null ? b(q) : typeof k == "function" ? k.apply(this, arguments) : k, oe = ee.invert(Z), se = typeof $ == "function" ? $.apply(this, arguments) : $;
      return n(w(x(ee, se), Z, oe), q, a);
    }, k, H);
  }, _.translateBy = function(g, $, k, H) {
    _.transform(g, function() {
      return n(this.__zoom.translate(
        typeof $ == "function" ? $.apply(this, arguments) : $,
        typeof k == "function" ? k.apply(this, arguments) : k
      ), t.apply(this, arguments), a);
    }, null, H);
  }, _.translateTo = function(g, $, k, H, q) {
    _.transform(g, function() {
      var ee = t.apply(this, arguments), Z = this.__zoom, oe = H == null ? b(ee) : typeof H == "function" ? H.apply(this, arguments) : H;
      return n(Mn.translate(oe[0], oe[1]).scale(Z.k).translate(
        typeof $ == "function" ? -$.apply(this, arguments) : -$,
        typeof k == "function" ? -k.apply(this, arguments) : -k
      ), ee, a);
    }, H, q);
  };
  function x(g, $) {
    return $ = Math.max(r[0], Math.min(r[1], $)), $ === g.k ? g : new Pt($, g.x, g.y);
  }
  function w(g, $, k) {
    var H = $[0] - k[0] * g.k, q = $[1] - k[1] * g.k;
    return H === g.x && q === g.y ? g : new Pt(g.k, H, q);
  }
  function b(g) {
    return [(+g[0][0] + +g[1][0]) / 2, (+g[0][1] + +g[1][1]) / 2];
  }
  function C(g, $, k, H) {
    g.on("start.zoom", function() {
      I(this, arguments).event(H).start();
    }).on("interrupt.zoom end.zoom", function() {
      I(this, arguments).event(H).end();
    }).tween("zoom", function() {
      var q = this, ee = arguments, Z = I(q, ee).event(H), oe = t.apply(q, ee), se = k == null ? b(oe) : typeof k == "function" ? k.apply(q, ee) : k, Y = Math.max(oe[1][0] - oe[0][0], oe[1][1] - oe[0][1]), J = q.__zoom, j = typeof $ == "function" ? $.apply(q, ee) : $, X = l(J.invert(se).concat(Y / J.k), j.invert(se).concat(Y / j.k));
      return function(te) {
        if (te === 1)
          te = j;
        else {
          var ae = X(te), ue = Y / ae[2];
          te = new Pt(ue, se[0] - ae[0] * ue, se[1] - ae[1] * ue);
        }
        Z.zoom(null, te);
      };
    });
  }
  function I(g, $, k) {
    return !k && g.__zooming || new B(g, $);
  }
  function B(g, $) {
    this.that = g, this.args = $, this.active = 0, this.sourceEvent = null, this.extent = t.apply(g, $), this.taps = 0;
  }
  B.prototype = {
    event: function(g) {
      return g && (this.sourceEvent = g), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(g, $) {
      return this.mouse && g !== "mouse" && (this.mouse[1] = $.invert(this.mouse[0])), this.touch0 && g !== "touch" && (this.touch0[1] = $.invert(this.touch0[0])), this.touch1 && g !== "touch" && (this.touch1[1] = $.invert(this.touch1[0])), this.that.__zoom = $, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(g) {
      var $ = pt(this.that).datum();
      c.call(
        g,
        this.that,
        new K0(g, {
          sourceEvent: this.sourceEvent,
          target: _,
          transform: this.that.__zoom,
          dispatch: c
        }),
        $
      );
    }
  };
  function T(g, ...$) {
    if (!e.apply(this, arguments))
      return;
    var k = I(this, $).event(g), H = this.__zoom, q = Math.max(r[0], Math.min(r[1], H.k * Math.pow(2, i.apply(this, arguments)))), ee = kt(g);
    if (k.wheel)
      (k.mouse[0][0] !== ee[0] || k.mouse[0][1] !== ee[1]) && (k.mouse[1] = H.invert(k.mouse[0] = ee)), clearTimeout(k.wheel);
    else {
      if (H.k === q)
        return;
      k.mouse = [ee, H.invert(ee)], di(this), k.start();
    }
    Un(g), k.wheel = setTimeout(Z, v), k.zoom("mouse", n(w(x(H, q), k.mouse[0], k.mouse[1]), k.extent, a));
    function Z() {
      k.wheel = null, k.end();
    }
  }
  function M(g, ...$) {
    if (f || !e.apply(this, arguments))
      return;
    var k = g.currentTarget, H = I(this, $, !0).event(g), q = pt(g.view).on("mousemove.zoom", se, !0).on("mouseup.zoom", Y, !0), ee = kt(g, k), Z = g.clientX, oe = g.clientY;
    sf(g.view), Mr(g), H.mouse = [ee, this.__zoom.invert(ee)], di(this), H.start();
    function se(J) {
      if (Un(J), !H.moved) {
        var j = J.clientX - Z, X = J.clientY - oe;
        H.moved = j * j + X * X > y;
      }
      H.event(J).zoom("mouse", n(w(H.that.__zoom, H.mouse[0] = kt(J, k), H.mouse[1]), H.extent, a));
    }
    function Y(J) {
      q.on("mousemove.zoom mouseup.zoom", null), lf(J.view, H.moved), Un(J), H.event(J).end();
    }
  }
  function V(g, ...$) {
    if (e.apply(this, arguments)) {
      var k = this.__zoom, H = kt(g.changedTouches ? g.changedTouches[0] : g, this), q = k.invert(H), ee = k.k * (g.shiftKey ? 0.5 : 2), Z = n(w(x(k, ee), H, q), t.apply(this, $), a);
      Un(g), s > 0 ? pt(this).transition().duration(s).call(C, Z, H, g) : pt(this).call(_.transform, Z, H, g);
    }
  }
  function O(g, ...$) {
    if (e.apply(this, arguments)) {
      var k = g.touches, H = k.length, q = I(this, $, g.changedTouches.length === H).event(g), ee, Z, oe, se;
      for (Mr(g), Z = 0; Z < H; ++Z)
        oe = k[Z], se = kt(oe, this), se = [se, this.__zoom.invert(se), oe.identifier], q.touch0 ? !q.touch1 && q.touch0[2] !== se[2] && (q.touch1 = se, q.taps = 0) : (q.touch0 = se, ee = !0, q.taps = 1 + !!u);
      u && (u = clearTimeout(u)), ee && (q.taps < 2 && (d = se[0], u = setTimeout(function() {
        u = null;
      }, p)), di(this), q.start());
    }
  }
  function E(g, ...$) {
    if (this.__zooming) {
      var k = I(this, $).event(g), H = g.changedTouches, q = H.length, ee, Z, oe, se;
      for (Un(g), ee = 0; ee < q; ++ee)
        Z = H[ee], oe = kt(Z, this), k.touch0 && k.touch0[2] === Z.identifier ? k.touch0[0] = oe : k.touch1 && k.touch1[2] === Z.identifier && (k.touch1[0] = oe);
      if (Z = k.that.__zoom, k.touch1) {
        var Y = k.touch0[0], J = k.touch0[1], j = k.touch1[0], X = k.touch1[1], te = (te = j[0] - Y[0]) * te + (te = j[1] - Y[1]) * te, ae = (ae = X[0] - J[0]) * ae + (ae = X[1] - J[1]) * ae;
        Z = x(Z, Math.sqrt(te / ae)), oe = [(Y[0] + j[0]) / 2, (Y[1] + j[1]) / 2], se = [(J[0] + X[0]) / 2, (J[1] + X[1]) / 2];
      } else if (k.touch0)
        oe = k.touch0[0], se = k.touch0[1];
      else
        return;
      k.zoom("touch", n(w(Z, oe, se), k.extent, a));
    }
  }
  function F(g, ...$) {
    if (this.__zooming) {
      var k = I(this, $).event(g), H = g.changedTouches, q = H.length, ee, Z;
      for (Mr(g), f && clearTimeout(f), f = setTimeout(function() {
        f = null;
      }, p), ee = 0; ee < q; ++ee)
        Z = H[ee], k.touch0 && k.touch0[2] === Z.identifier ? delete k.touch0 : k.touch1 && k.touch1[2] === Z.identifier && delete k.touch1;
      if (k.touch1 && !k.touch0 && (k.touch0 = k.touch1, delete k.touch1), k.touch0)
        k.touch0[1] = this.__zoom.invert(k.touch0[0]);
      else if (k.end(), k.taps === 2 && (Z = kt(Z, this), Math.hypot(d[0] - Z[0], d[1] - Z[1]) < m)) {
        var oe = pt(this).on("dblclick.zoom");
        oe && oe.apply(this, arguments);
      }
    }
  }
  return _.wheelDelta = function(g) {
    return arguments.length ? (i = typeof g == "function" ? g : Wo(+g), _) : i;
  }, _.filter = function(g) {
    return arguments.length ? (e = typeof g == "function" ? g : Wo(!!g), _) : e;
  }, _.touchable = function(g) {
    return arguments.length ? (o = typeof g == "function" ? g : Wo(!!g), _) : o;
  }, _.extent = function(g) {
    return arguments.length ? (t = typeof g == "function" ? g : Wo([[+g[0][0], +g[0][1]], [+g[1][0], +g[1][1]]]), _) : t;
  }, _.scaleExtent = function(g) {
    return arguments.length ? (r[0] = +g[0], r[1] = +g[1], _) : [r[0], r[1]];
  }, _.translateExtent = function(g) {
    return arguments.length ? (a[0][0] = +g[0][0], a[1][0] = +g[1][0], a[0][1] = +g[0][1], a[1][1] = +g[1][1], _) : [[a[0][0], a[0][1]], [a[1][0], a[1][1]]];
  }, _.constrain = function(g) {
    return arguments.length ? (n = g, _) : n;
  }, _.duration = function(g) {
    return arguments.length ? (s = +g, _) : s;
  }, _.interpolate = function(g) {
    return arguments.length ? (l = g, _) : l;
  }, _.on = function() {
    var g = c.on.apply(c, arguments);
    return g === c ? _ : g;
  }, _.clickDistance = function(g) {
    return arguments.length ? (y = (g = +g) * g, _) : Math.sqrt(y);
  }, _.tapDistance = function(g) {
    return arguments.length ? (m = +g, _) : m;
  }, _;
}
var ge = /* @__PURE__ */ ((e) => (e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom", e))(ge || {}), Us = /* @__PURE__ */ ((e) => (e.Partial = "partial", e.Full = "full", e))(Us || {}), nn = /* @__PURE__ */ ((e) => (e.Bezier = "default", e.SimpleBezier = "simple-bezier", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e))(nn || {}), en = /* @__PURE__ */ ((e) => (e.Strict = "strict", e.Loose = "loose", e))(en || {}), Mi = /* @__PURE__ */ ((e) => (e.Arrow = "arrow", e.ArrowClosed = "arrowclosed", e))(Mi || {}), to = /* @__PURE__ */ ((e) => (e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal", e))(to || {}), kf = /* @__PURE__ */ ((e) => (e.TopLeft = "top-left", e.TopCenter = "top-center", e.TopRight = "top-right", e.BottomLeft = "bottom-left", e.BottomCenter = "bottom-center", e.BottomRight = "bottom-right", e))(kf || {});
const o_ = ["INPUT", "SELECT", "TEXTAREA"], i_ = typeof document < "u" ? document : null;
function Ja(e) {
  var t, n;
  const i = ((n = (t = e.composedPath) == null ? void 0 : t.call(e)) == null ? void 0 : n[0]) || e.target, o = typeof i?.hasAttribute == "function" ? i.hasAttribute("contenteditable") : !1, r = typeof i?.closest == "function" ? i.closest(".nokey") : null;
  return o_.includes(i?.nodeName) || o || !!r;
}
function r_(e) {
  return e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
}
function su(e, t, n, i) {
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
function a_(e, t) {
  return (n) => {
    if (!n.code && !n.key)
      return !1;
    const i = s_(n.code, e);
    return Array.isArray(e) ? e.some((o) => su(n[i], o, t, n.type === "keyup")) : su(n[i], e, t, n.type === "keyup");
  };
}
function s_(e, t) {
  return t.includes(e) ? "code" : "key";
}
function no(e, t) {
  const n = U(() => Ae(t?.target) ?? i_), i = nt(Ae(e) === !0);
  let o = !1;
  const r = /* @__PURE__ */ new Set();
  let a = l(Ae(e));
  _e(
    () => Ae(e),
    (c, u) => {
      typeof u == "boolean" && typeof c != "boolean" && s(), a = l(c);
    },
    {
      immediate: !0
    }
  ), Gd(["blur", "contextmenu"], s), ql(
    (...c) => a(...c),
    (c) => {
      var u, d;
      const f = Ae(t?.actInsideInputWithModifier) ?? !0, p = Ae(t?.preventDefault) ?? !1;
      if (o = r_(c), (!o || o && !f) && Ja(c))
        return;
      const y = ((d = (u = c.composedPath) == null ? void 0 : u.call(c)) == null ? void 0 : d[0]) || c.target, m = y?.nodeName === "BUTTON" || y?.nodeName === "A";
      !p && (o || !m) && c.preventDefault(), i.value = !0;
    },
    { eventName: "keydown", target: n }
  ), ql(
    (...c) => a(...c),
    (c) => {
      const u = Ae(t?.actInsideInputWithModifier) ?? !0;
      if (i.value) {
        if ((!o || o && !u) && Ja(c))
          return;
        o = !1, i.value = !1;
      }
    },
    { eventName: "keyup", target: n }
  );
  function s() {
    o = !1, r.clear(), i.value = Ae(e) === !0;
  }
  function l(c) {
    return c === null ? (s(), () => !1) : typeof c == "boolean" ? (s(), i.value = c, () => !1) : Array.isArray(c) || typeof c == "string" ? a_(c, r) : c;
  }
  return i;
}
const Ef = "vue-flow__node-desc", xf = "vue-flow__edge-desc", l_ = "vue-flow__aria-live", $f = ["Enter", " ", "Escape"], Sn = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};
function Oi(e) {
  return {
    ...e.computedPosition || { x: 0, y: 0 },
    width: e.dimensions.width || 0,
    height: e.dimensions.height || 0
  };
}
function Ri(e, t) {
  const n = Math.max(0, Math.min(e.x + e.width, t.x + t.width) - Math.max(e.x, t.x)), i = Math.max(0, Math.min(e.y + e.height, t.y + t.height) - Math.max(e.y, t.y));
  return Math.ceil(n * i);
}
function rr(e) {
  return {
    width: e.offsetWidth,
    height: e.offsetHeight
  };
}
function Bt(e, t = 0, n = 1) {
  return Math.min(Math.max(e, t), n);
}
function Sf(e, t) {
  return {
    x: Bt(e.x, t[0][0], t[1][0]),
    y: Bt(e.y, t[0][1], t[1][1])
  };
}
function lu(e) {
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
function Yo(e) {
  return !Number.isNaN(e) && Number.isFinite(e);
}
function u_(e) {
  return Yo(e.width) && Yo(e.height) && Yo(e.x) && Yo(e.y);
}
function c_(e, t, n) {
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
function Cf(e, t, n) {
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
function Nf(e, t, n, i) {
  const o = typeof e == "string" ? e : e.id, r = /* @__PURE__ */ new Set(), a = i === "source" ? "target" : "source";
  for (const s of n)
    s[a] === o && r.add(s[i]);
  return t.filter((s) => r.has(s.id));
}
function d_(...e) {
  if (e.length === 3) {
    const [r, a, s] = e;
    return Nf(r, a, s, "target");
  }
  const [t, n] = e, i = typeof t == "string" ? t : t.id;
  return n.filter((r) => tn(r) && r.source === i).map((r) => n.find((a) => un(a) && a.id === r.target));
}
function f_(...e) {
  if (e.length === 3) {
    const [r, a, s] = e;
    return Nf(r, a, s, "source");
  }
  const [t, n] = e, i = typeof t == "string" ? t : t.id;
  return n.filter((r) => tn(r) && r.target === i).map((r) => n.find((a) => un(a) && a.id === r.source));
}
function If({ source: e, sourceHandle: t, target: n, targetHandle: i }) {
  return `vueflow__edge-${e}${t ?? ""}-${n}${i ?? ""}`;
}
function h_(e, t) {
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
  return r ? ar(s, a) : s;
}
function Af(e, t) {
  return {
    x: Math.min(e.x, t.x),
    y: Math.min(e.y, t.y),
    x2: Math.max(e.x2, t.x2),
    y2: Math.max(e.y2, t.y2)
  };
}
function Di({ x: e, y: t, width: n, height: i }) {
  return {
    x: e,
    y: t,
    x2: e + n,
    y2: t + i
  };
}
function Tf({ x: e, y: t, x2: n, y2: i }) {
  return {
    x: e,
    y: t,
    width: n - e,
    height: i - t
  };
}
function p_(e, t) {
  return Tf(Af(Di(e), Di(t)));
}
function Ws(e) {
  let t = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY,
    x2: Number.NEGATIVE_INFINITY,
    y2: Number.NEGATIVE_INFINITY
  };
  for (let n = 0; n < e.length; n++) {
    const i = e[n];
    t = Af(
      t,
      Di({
        ...i.computedPosition,
        ...i.dimensions
      })
    );
  }
  return Tf(t);
}
function Mf(e, t, n = { x: 0, y: 0, zoom: 1 }, i = !1, o = !1) {
  const r = {
    ...vo(t, n),
    width: t.width / n.zoom,
    height: t.height / n.zoom
  }, a = [];
  for (const s of e) {
    const { dimensions: l, selectable: c = !0, hidden: u = !1 } = s, d = l.width ?? s.width ?? null, f = l.height ?? s.height ?? null;
    if (o && !c || u)
      continue;
    const p = Ri(r, Oi(s)), v = d === null || f === null, y = i && p > 0, m = (d ?? 0) * (f ?? 0);
    (v || y || p >= m || s.dragging) && a.push(s);
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
function _n(e, t) {
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
function v_(e, t, n) {
  if (typeof e == "string" || typeof e == "number") {
    const i = _n(e, n), o = _n(e, t);
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
    const i = _n(e.top ?? e.y ?? 0, n), o = _n(e.bottom ?? e.y ?? 0, n), r = _n(e.left ?? e.x ?? 0, t), a = _n(e.right ?? e.x ?? 0, t);
    return { top: i, right: a, bottom: o, left: r, x: r + a, y: i + o };
  }
  return { top: 0, right: 0, bottom: 0, left: 0, x: 0, y: 0 };
}
function m_(e, t, n, i, o, r) {
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
function uu(e, t, n, i, o, r = 0.1) {
  const a = v_(r, t, n), s = (t - a.x) / e.width, l = (n - a.y) / e.height, c = Math.min(s, l), u = Bt(c, i, o), d = e.x + e.width / 2, f = e.y + e.height / 2, p = t / 2 - d * u, v = n / 2 - f * u, y = m_(e, p, v, u, t, n), m = {
    left: Math.min(y.left - a.left, 0),
    top: Math.min(y.top - a.top, 0),
    right: Math.min(y.right - a.right, 0),
    bottom: Math.min(y.bottom - a.bottom, 0)
  };
  return {
    x: p - m.left + m.right,
    y: v - m.top + m.bottom,
    zoom: u
  };
}
function g_(e, t) {
  return {
    x: t.x + e.x,
    y: t.y + e.y,
    z: (e.z > t.z ? e.z : t.z) + 1
  };
}
function Of(e, t) {
  if (!e.parentNode)
    return !1;
  const n = t.get(e.parentNode);
  return n ? n.selected ? !0 : Of(n, t) : !1;
}
function mo(e, t) {
  return typeof e > "u" ? "" : typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((i) => `${i}=${e[i]}`).join("&")}`;
}
function Qa(e) {
  const t = e.ctrlKey && go() ? 10 : 1;
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * t;
}
function cu(e, t, n) {
  return e < t ? Bt(Math.abs(e - t), 1, t) / t : e > n ? -Bt(Math.abs(e - n), 1, t) / t : 0;
}
function Rf(e, t, n = 15, i = 40) {
  const o = cu(e.x, i, t.width - i) * n, r = cu(e.y, i, t.height - i) * n;
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
function du(e, t) {
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
function fu(e) {
  return {
    item: e,
    type: "add"
  };
}
function hu(e) {
  return {
    id: e,
    type: "remove"
  };
}
function pu(e, t, n, i, o) {
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
const vu = () => {
};
function pe(e) {
  const t = /* @__PURE__ */ new Set();
  let n = vu, i = () => !1;
  const o = () => t.size > 0 || i(), r = (f) => {
    n = f;
  }, a = () => {
    n = vu;
  }, s = (f) => {
    i = f;
  }, l = () => {
    i = () => !1;
  }, c = (f) => {
    t.delete(f);
  };
  return {
    on: (f) => {
      t.add(f);
      const p = () => c(f);
      return lo(p), { off: p };
    },
    off: c,
    trigger: (f) => {
      const p = [n];
      return o() ? p.push(...t) : e && p.push(e), Promise.allSettled(p.map((v) => v(f)));
    },
    hasListeners: o,
    listeners: t,
    setEmitter: r,
    removeEmitter: a,
    setHasEmitListeners: s,
    removeHasEmitListeners: l
  };
}
function mu(e, t, n) {
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
function y_(e, t, n, i) {
  var o, r;
  const a = /* @__PURE__ */ new Map();
  for (const [s, l] of e)
    (l.selected || l.id === i) && (!l.parentNode || !Of(l, e)) && (l.draggable || t && typeof l.draggable > "u") && e.get(s) && a.set(s, {
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
function Df(e) {
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
function w_(e, t, n) {
  const [i, o, r, a] = typeof e != "string" ? Df(e.padding) : [0, 0, 0, 0];
  return n && typeof n.computedPosition.x < "u" && typeof n.computedPosition.y < "u" && typeof n.dimensions.width < "u" && typeof n.dimensions.height < "u" ? [
    [n.computedPosition.x + a, n.computedPosition.y + i],
    [
      n.computedPosition.x + n.dimensions.width - o,
      n.computedPosition.y + n.dimensions.height - r
    ]
  ] : !1;
}
function b_(e, t, n, i) {
  let o = e.extent || n;
  if ((o === "parent" || !Array.isArray(o) && o?.range === "parent") && !e.expandParent)
    if (e.parentNode && i && e.dimensions.width && e.dimensions.height) {
      const r = w_(o, e, i);
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
    const [r, a, s, l] = Df(o.padding), c = i?.computedPosition.x || 0, u = i?.computedPosition.y || 0;
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
function __({ width: e, height: t }, n) {
  return [n[0], [n[1][0] - (e || 0), n[1][1] - (t || 0)]];
}
function Ys(e, t, n, i, o) {
  const r = __(e.dimensions, b_(e, n, i, o)), a = Sf(t, r);
  return {
    position: {
      x: a.x - (o?.computedPosition.x || 0),
      y: a.y - (o?.computedPosition.y || 0)
    },
    computedPosition: a
  };
}
function On(e, t, n = ge.Left, i = !1) {
  const o = (t?.x ?? 0) + e.computedPosition.x, r = (t?.y ?? 0) + e.computedPosition.y, { width: a, height: s } = t ?? $_(e);
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
function gu(e, t) {
  return e && (t ? e.find((n) => n.id === t) : e[0]) || null;
}
function k_({
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
  const u = Di({
    x: (0 - l.x) / l.zoom,
    y: (0 - l.y) / l.zoom,
    width: a / l.zoom,
    height: s / l.zoom
  }), d = Math.max(0, Math.min(u.x2, c.x2) - Math.max(u.x, c.x)), f = Math.max(0, Math.min(u.y2, c.y2) - Math.max(u.y, c.y));
  return Math.ceil(d * f) > 0;
}
function E_(e, t, n = !1) {
  const i = typeof e.zIndex == "number";
  let o = i ? e.zIndex : 0;
  const r = t(e.source), a = t(e.target);
  return !r || !a ? 0 : (n && (o = i ? e.zIndex : Math.max(r.computedPosition.z || 0, a.computedPosition.z || 0)), o);
}
var Ye = /* @__PURE__ */ ((e) => (e.MISSING_STYLES = "MISSING_STYLES", e.MISSING_VIEWPORT_DIMENSIONS = "MISSING_VIEWPORT_DIMENSIONS", e.NODE_INVALID = "NODE_INVALID", e.NODE_NOT_FOUND = "NODE_NOT_FOUND", e.NODE_MISSING_PARENT = "NODE_MISSING_PARENT", e.NODE_TYPE_MISSING = "NODE_TYPE_MISSING", e.NODE_EXTENT_INVALID = "NODE_EXTENT_INVALID", e.EDGE_INVALID = "EDGE_INVALID", e.EDGE_NOT_FOUND = "EDGE_NOT_FOUND", e.EDGE_SOURCE_MISSING = "EDGE_SOURCE_MISSING", e.EDGE_TARGET_MISSING = "EDGE_TARGET_MISSING", e.EDGE_TYPE_MISSING = "EDGE_TYPE_MISSING", e.EDGE_SOURCE_TARGET_SAME = "EDGE_SOURCE_TARGET_SAME", e.EDGE_SOURCE_TARGET_MISSING = "EDGE_SOURCE_TARGET_MISSING", e.EDGE_ORPHANED = "EDGE_ORPHANED", e.USEVUEFLOW_OPTIONS = "USEVUEFLOW_OPTIONS", e))(Ye || {});
const yu = {
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
    super((i = yu[t]) == null ? void 0 : i.call(yu, ...n)), this.name = "VueFlowError", this.code = t, this.args = n;
  }
}
function Gs(e) {
  return "clientX" in e;
}
function x_(e) {
  return "sourceEvent" in e;
}
function $t(e, t) {
  const n = Gs(e);
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
function $_(e) {
  var t, n;
  return {
    width: ((t = e.dimensions) == null ? void 0 : t.width) ?? e.width ?? 0,
    height: ((n = e.dimensions) == null ? void 0 : n.height) ?? e.height ?? 0
  };
}
function ar(e, t = [1, 1]) {
  return {
    x: t[0] * Math.round(e.x / t[0]),
    y: t[1] * Math.round(e.y / t[1])
  };
}
const S_ = () => !0;
function Dr(e) {
  e?.classList.remove("valid", "connecting", "vue-flow__handle-valid", "vue-flow__handle-connecting");
}
function C_(e, t, n) {
  const i = [], o = {
    x: e.x - n,
    y: e.y - n,
    width: n * 2,
    height: n * 2
  };
  for (const r of t.values())
    Ri(o, Oi(r)) > 0 && i.push(r);
  return i;
}
const N_ = 250;
function I_(e, t, n, i) {
  var o, r;
  let a = [], s = Number.POSITIVE_INFINITY;
  const l = C_(e, n, t + N_);
  for (const c of l) {
    const u = [...((o = c.handleBounds) == null ? void 0 : o.source) ?? [], ...((r = c.handleBounds) == null ? void 0 : r.target) ?? []];
    for (const d of u) {
      if (i.nodeId === d.nodeId && i.type === d.type && i.id === d.id)
        continue;
      const { x: f, y: p } = On(c, d, d.position, !0), v = Math.sqrt((f - e.x) ** 2 + (p - e.y) ** 2);
      v > t || (v < s ? (a = [{ ...d, x: f, y: p }], s = v) : v === s && a.push({ ...d, x: f, y: p }));
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
function wu(e, {
  handle: t,
  connectionMode: n,
  fromNodeId: i,
  fromHandleId: o,
  fromType: r,
  doc: a,
  lib: s,
  flowId: l,
  isValidConnection: c = S_
}, u, d, f, p) {
  const v = r === "target", y = t ? a.querySelector(`.${s}-flow__handle[data-id="${l}-${t?.nodeId}-${t?.id}-${t?.type}"]`) : null, { x: m, y: _ } = $t(e), x = a.elementFromPoint(m, _), w = x?.classList.contains(`${s}-flow__handle`) ? x : y, b = {
    handleDomNode: w,
    isValid: !1,
    connection: null,
    toHandle: null
  };
  if (w) {
    const C = Pf(void 0, w), I = w.getAttribute("data-nodeid"), B = w.getAttribute("data-handleid"), T = w.classList.contains("connectable"), M = w.classList.contains("connectableend");
    if (!I || !C)
      return b;
    const V = {
      source: v ? I : i,
      sourceHandle: v ? B : o,
      target: v ? i : I,
      targetHandle: v ? o : B
    };
    b.connection = V;
    const E = T && M && (n === en.Strict ? v && C === "source" || !v && C === "target" : I !== i || B !== o);
    b.isValid = E && c(V, {
      nodes: d,
      edges: u,
      sourceNode: f(V.source),
      targetNode: f(V.target)
    }), b.toHandle = Lf(I, C, B, p, n, !0);
  }
  return b;
}
function Pf(e, t) {
  return e || (t?.classList.contains("target") ? "target" : t?.classList.contains("source") ? "source" : null);
}
function A_(e, t) {
  let n = null;
  return t ? n = "valid" : e && !t && (n = "invalid"), n;
}
function T_(e, t) {
  let n = null;
  return t ? n = !0 : e && !t && (n = !1), n;
}
function Lf(e, t, n, i, o, r = !1) {
  var a, s, l;
  const c = i.get(e);
  if (!c)
    return null;
  const u = o === en.Strict ? (a = c.handleBounds) == null ? void 0 : a[t] : [...((s = c.handleBounds) == null ? void 0 : s.source) ?? [], ...((l = c.handleBounds) == null ? void 0 : l.target) ?? []], d = (n ? u?.find((f) => f.id === n) : u?.[0]) ?? null;
  return d && r ? { ...d, ...On(c, d, d.position, !0) } : d;
}
const es = {
  [ge.Left]: ge.Right,
  [ge.Right]: ge.Left,
  [ge.Top]: ge.Bottom,
  [ge.Bottom]: ge.Top
}, M_ = ["production", "prod"];
function No(e, ...t) {
  Vf() && console.warn(`[Vue Flow]: ${e}`, ...t);
}
function Vf() {
  return !M_.includes("production");
}
function bu(e, t, n, i, o) {
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
      ...rr(a)
    };
  }) : null;
}
function ts(e, t, n, i, o, r = !1, a) {
  o.value = !1, e.selected ? (r || e.selected && t) && (i([e]), Ve(() => {
    a.blur();
  })) : n([e]);
}
function We(e) {
  return typeof h(e) < "u";
}
function O_(e, t, n, i) {
  if (!e || !e.source || !e.target)
    return n(new je(Ye.EDGE_INVALID, e?.id ?? "[ID UNKNOWN]")), !1;
  let o;
  return tn(e) ? o = e : o = {
    ...e,
    id: If(e)
  }, o = Cf(o, void 0, i), h_(o, t) ? !1 : o;
}
function R_(e, t, n, i, o) {
  if (!t.source || !t.target)
    return o(new je(Ye.EDGE_INVALID, e.id)), !1;
  if (!n)
    return o(new je(Ye.EDGE_NOT_FOUND, e.id)), !1;
  const { id: r, ...a } = e;
  return {
    ...a,
    id: i ? If(t) : r,
    source: t.source,
    target: t.target,
    sourceHandle: t.sourceHandle,
    targetHandle: t.targetHandle
  };
}
function _u(e, t, n) {
  const i = {}, o = [];
  for (let r = 0; r < e.length; ++r) {
    const a = e[r];
    if (!un(a)) {
      n(
        new je(Ye.NODE_INVALID, a?.id) || `[ID UNKNOWN|INDEX ${r}]`
      );
      continue;
    }
    const s = c_(a, t(a.id), a.parentNode);
    a.parentNode && (i[a.parentNode] = !0), o[r] = s;
  }
  for (const r of o) {
    const a = t(r.parentNode) || o.find((s) => s.id === r.parentNode);
    r.parentNode && !a && n(new je(Ye.NODE_MISSING_PARENT, r.id, r.parentNode)), (r.parentNode || i[r.id]) && (i[r.id] && (r.isParent = !0), a && (a.isParent = !0));
  }
  return o;
}
function ku(e, t, n, i, o, r) {
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
    ku("source", l, u, e, o, a), ku("target", l, c, e, r, s);
  }
}
function Eu(e, t) {
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
    const u = tn(c) ? c : O_(c, s, o, r);
    if (!u)
      continue;
    const d = n(u.source), f = n(u.target);
    if (!d || !f) {
      o(new je(Ye.EDGE_SOURCE_TARGET_MISSING, u.id, u.source, u.target));
      continue;
    }
    if (!d) {
      o(new je(Ye.EDGE_SOURCE_MISSING, u.id, u.source));
      continue;
    }
    if (!f) {
      o(new je(Ye.EDGE_TARGET_MISSING, u.id, u.target));
      continue;
    }
    if (t && !t(u, {
      edges: s,
      nodes: a,
      sourceNode: d,
      targetNode: f
    })) {
      o(new je(Ye.EDGE_INVALID, u.id));
      continue;
    }
    const p = i(u.id);
    l.push({
      ...Cf(u, p, r),
      sourceNode: d,
      targetNode: f
    });
  }
  return l;
}
const xu = Symbol("vueFlow"), js = Symbol("nodeId"), zf = Symbol("nodeRef"), D_ = Symbol("edgeId"), P_ = Symbol("edgeRef"), sr = Symbol("slots");
function Bf(e) {
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
    panBy: f,
    findNode: p,
    multiSelectionActive: v,
    nodesSelectionActive: y,
    selectNodesOnDrag: m,
    removeSelectedElements: _,
    addSelectedNodes: x,
    updateNodePositions: w,
    emits: b
  } = De(), { onStart: C, onDrag: I, onStop: B, onClick: T, el: M, disabled: V, id: O, selectable: E, dragHandle: F } = e, g = nt(!1);
  let $ = [], k, H = null, q = { x: void 0, y: void 0 }, ee = { x: 0, y: 0 }, Z = null, oe = !1, se = !1, Y = 0, J = !1;
  const j = Ff(), X = ({ x: ve, y: me }) => {
    q = { x: ve, y: me };
    let L = !1;
    if ($ = $.map((R) => {
      const A = { x: ve - R.distance.x, y: me - R.distance.y }, { computedPosition: P } = Ys(
        R,
        n.value ? ar(A, i.value) : A,
        b.error,
        a.value,
        R.parentNode ? p(R.parentNode) : void 0
      );
      return L = L || R.position.x !== P.x || R.position.y !== P.y, R.position = P, R;
    }), se = se || L, !!L && (w($, !0, !0), g.value = !0, Z)) {
      const [R, A] = Rr({
        id: O,
        dragItems: $,
        findNode: p
      });
      I({ event: Z, node: R, nodes: A });
    }
  }, te = () => {
    if (!H)
      return;
    const [ve, me] = Rf(ee, H, u.value);
    if (ve !== 0 || me !== 0) {
      const L = {
        x: (q.x ?? 0) - ve / l.value.zoom,
        y: (q.y ?? 0) - me / l.value.zoom
      };
      f({ x: ve, y: me }) && X(L);
    }
    Y = requestAnimationFrame(te);
  }, ae = (ve, me) => {
    oe = !0;
    const L = p(O);
    !m.value && !v.value && L && (L.selected || _()), L && Ae(E) && m.value && ts(
      L,
      v.value,
      x,
      _,
      y,
      !1,
      me
    );
    const R = j(ve.sourceEvent);
    if (q = R, $ = y_(r.value, d.value, R, O), $.length) {
      const [A, P] = Rr({
        id: O,
        dragItems: $,
        findNode: p
      });
      C({ event: ve.sourceEvent, node: A, nodes: P });
    }
  }, ue = (ve, me) => {
    var L;
    ve.sourceEvent.type === "touchmove" && ve.sourceEvent.touches.length > 1 || (se = !1, s.value === 0 && ae(ve, me), q = j(ve.sourceEvent), H = ((L = t.value) == null ? void 0 : L.getBoundingClientRect()) || null, ee = $t(ve.sourceEvent, H));
  }, we = (ve, me) => {
    const L = j(ve.sourceEvent);
    if (!J && oe && c.value && (J = !0, te()), !oe) {
      const R = L.xSnapped - (q.x ?? 0), A = L.ySnapped - (q.y ?? 0);
      Math.sqrt(R * R + A * A) > s.value && ae(ve, me);
    }
    (q.x !== L.xSnapped || q.y !== L.ySnapped) && $.length && oe && (Z = ve.sourceEvent, ee = $t(ve.sourceEvent, H), X(L));
  }, $e = (ve) => {
    let me = !1;
    if (!oe && !g.value && !v.value) {
      const L = ve.sourceEvent, R = j(L), A = R.xSnapped - (q.x ?? 0), P = R.ySnapped - (q.y ?? 0), W = Math.sqrt(A * A + P * P);
      W !== 0 && W <= s.value && (T?.(L), me = !0);
    }
    if ($.length && !me) {
      se && (w($, !1, !1), se = !1);
      const [L, R] = Rr({
        id: O,
        dragItems: $,
        findNode: p
      });
      B({ event: ve.sourceEvent, node: L, nodes: R });
    }
    $ = [], g.value = !1, J = !1, oe = !1, q = { x: void 0, y: void 0 }, cancelAnimationFrame(Y);
  };
  return _e([() => Ae(V), M], ([ve, me], L, R) => {
    if (me) {
      const A = pt(me);
      ve || (k = u1().on("start", (P) => ue(P, me)).on("drag", (P) => we(P, me)).on("end", (P) => $e(P)).filter((P) => {
        const W = P.target, de = Ae(F);
        return !P.button && (!o.value || !mu(W, `.${o.value}`, me) && (!de || mu(W, de, me)));
      }), A.call(k)), R(() => {
        A.on(".drag", null), k && (k.on("start", null), k.on("drag", null), k.on("end", null));
      });
    }
  }), g;
}
function L_() {
  return {
    doubleClick: pe(),
    click: pe(),
    mouseEnter: pe(),
    mouseMove: pe(),
    mouseLeave: pe(),
    contextMenu: pe(),
    updateStart: pe(),
    update: pe(),
    updateEnd: pe()
  };
}
function V_(e, t) {
  const n = L_();
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
function Ff() {
  const { viewport: e, snapGrid: t, snapToGrid: n, vueFlowRef: i } = De();
  return (o) => {
    var r;
    const a = ((r = i.value) == null ? void 0 : r.getBoundingClientRect()) ?? { left: 0, top: 0 }, s = x_(o) ? o.sourceEvent : o, { x: l, y: c } = $t(s, a), u = vo({ x: l, y: c }, e.value), { x: d, y: f } = n.value ? ar(u, t.value) : u;
    return {
      xSnapped: d,
      ySnapped: f,
      ...u
    };
  };
}
function Go() {
  return !0;
}
function Hf({
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
    connectionClickStartHandle: f,
    nodesConnectable: p,
    autoPanOnConnect: v,
    autoPanSpeed: y,
    findNode: m,
    panBy: _,
    startConnection: x,
    updateConnection: w,
    endConnection: b,
    emits: C,
    viewport: I,
    edges: B,
    nodes: T,
    isValidConnection: M,
    nodeLookup: V
  } = De();
  let O = null, E = !1, F = null;
  function g(k) {
    var H;
    const q = Ae(n) === "target", ee = Gs(k), Z = lu(k.target), oe = k.currentTarget;
    if (oe && (ee && k.button === 0 || !ee)) {
      let se = function(be) {
        L = $t(be, $e), X = I_(
          vo(L, I.value, !1, [1, 1]),
          u.value,
          V.value,
          P
        ), R || (A(), R = !0);
        const Ee = wu(
          be,
          {
            handle: X,
            connectionMode: c.value,
            fromNodeId: Ae(t),
            fromHandleId: Ae(e),
            fromType: q ? "target" : "source",
            isValidConnection: j,
            doc: Z,
            lib: "vue",
            flowId: s,
            nodeLookup: V.value
          },
          B.value,
          T.value,
          m,
          V.value
        );
        F = Ee.handleDomNode, O = Ee.connection, E = T_(!!X, Ee.isValid);
        const Se = {
          // from stays the same
          ...ke,
          isValid: E,
          to: Ee.toHandle && E ? po({ x: Ee.toHandle.x, y: Ee.toHandle.y }, I.value) : L,
          toHandle: Ee.toHandle,
          toPosition: E && Ee.toHandle ? Ee.toHandle.position : es[P.position],
          toNode: Ee.toHandle ? V.value.get(Ee.toHandle.nodeId) : null
        };
        if (E && X && ke?.toHandle && Se.toHandle && ke.toHandle.type === Se.toHandle.type && ke.toHandle.nodeId === Se.toHandle.nodeId && ke.toHandle.id === Se.toHandle.id && ke.to.x === Se.to.x && ke.to.y === Se.to.y)
          return;
        const Me = X ?? Ee.toHandle;
        if (w(
          Me && E ? po(
            {
              x: Me.x,
              y: Me.y
            },
            I.value
          ) : L,
          Me,
          A_(!!Me, E)
        ), ke = Se, !X && !E && !F)
          return Dr(me);
        O && O.source !== O.target && F && (Dr(me), me = F, F.classList.add("connecting", "vue-flow__handle-connecting"), F.classList.toggle("valid", !!E), F.classList.toggle("vue-flow__handle-valid", !!E));
      }, Y = function(be) {
        "touches" in be && be.touches.length > 0 || ((X || F) && O && E && (r ? r(be, O) : C.connect(O)), C.connectEnd(be), o && a?.(be), Dr(me), cancelAnimationFrame(te), b(be), R = !1, E = !1, O = null, F = null, Z.removeEventListener("mousemove", se), Z.removeEventListener("mouseup", Y), Z.removeEventListener("touchmove", se), Z.removeEventListener("touchend", Y));
      };
      const J = m(Ae(t));
      let j = Ae(i) || M.value || Go;
      !j && J && (j = (q ? J.isValidSourcePos : J.isValidTargetPos) || Go);
      let X, te = 0;
      const { x: ae, y: ue } = $t(k), we = Pf(Ae(o), oe), $e = (H = l.value) == null ? void 0 : H.getBoundingClientRect();
      if (!$e || !we)
        return;
      const ve = Lf(Ae(t), we, Ae(e), V.value, c.value);
      if (!ve)
        return;
      let me, L = $t(k, $e), R = !1;
      const A = () => {
        if (!v.value)
          return;
        const [be, Ee] = Rf(L, $e, y.value);
        _({ x: be, y: Ee }), te = requestAnimationFrame(A);
      }, P = {
        ...ve,
        nodeId: Ae(t),
        type: we,
        position: ve.position
      }, W = V.value.get(Ae(t)), he = {
        inProgress: !0,
        isValid: null,
        from: On(W, P, ge.Left, !0),
        fromHandle: P,
        fromPosition: P.position,
        fromNode: W,
        to: L,
        toHandle: null,
        toPosition: es[P.position],
        toNode: null
      };
      x(
        {
          nodeId: Ae(t),
          id: Ae(e),
          type: we,
          position: oe?.getAttribute("data-handlepos") || ge.Top,
          ...L
        },
        {
          x: ae - $e.left,
          y: ue - $e.top
        }
      ), C.connectStart({ event: k, nodeId: Ae(t), handleId: Ae(e), handleType: we });
      let ke = he;
      Z.addEventListener("mousemove", se), Z.addEventListener("mouseup", Y), Z.addEventListener("touchmove", se), Z.addEventListener("touchend", Y);
    }
  }
  function $(k) {
    var H, q;
    if (!d.value)
      return;
    const ee = Ae(n) === "target";
    if (!f.value) {
      C.clickConnectStart({ event: k, nodeId: Ae(t), handleId: Ae(e) }), x(
        {
          nodeId: Ae(t),
          type: Ae(n),
          id: Ae(e),
          position: ge.Top,
          ...$t(k)
        },
        void 0,
        !0
      );
      return;
    }
    let Z = Ae(i) || M.value || Go;
    const oe = m(Ae(t));
    if (!Z && oe && (Z = (ee ? oe.isValidSourcePos : oe.isValidTargetPos) || Go), oe && (typeof oe.connectable > "u" ? p.value : oe.connectable) === !1)
      return;
    const se = lu(k.target), Y = wu(
      k,
      {
        handle: {
          nodeId: Ae(t),
          id: Ae(e),
          type: Ae(n),
          position: ge.Top,
          ...$t(k)
        },
        connectionMode: c.value,
        fromNodeId: f.value.nodeId,
        fromHandleId: f.value.id ?? null,
        fromType: f.value.type,
        isValidConnection: Z,
        doc: se,
        lib: "vue",
        flowId: s,
        nodeLookup: V.value
      },
      B.value,
      T.value,
      m,
      V.value
    ), J = ((H = Y.connection) == null ? void 0 : H.source) === ((q = Y.connection) == null ? void 0 : q.target);
    Y.isValid && Y.connection && !J && C.connect(Y.connection), C.clickConnectEnd(k), b(k, !0);
  }
  return {
    handlePointerDown: g,
    handleClick: $
  };
}
function z_() {
  return Ht(js, "");
}
function qf(e) {
  const t = e ?? z_() ?? "", n = Ht(zf, G(null)), { findNode: i, edges: o, emits: r } = De(), a = i(t);
  return a || r.error(new je(Ye.NODE_NOT_FOUND, t)), {
    id: t,
    nodeEl: n,
    node: a,
    parentNode: U(() => i(a.parentNode)),
    connectedEdges: U(() => on([a], o.value))
  };
}
function B_() {
  return {
    doubleClick: pe(),
    click: pe(),
    mouseEnter: pe(),
    mouseMove: pe(),
    mouseLeave: pe(),
    contextMenu: pe(),
    dragStart: pe(),
    drag: pe(),
    dragStop: pe()
  };
}
function F_(e, t) {
  const n = B_();
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
function Uf() {
  const { getSelectedNodes: e, nodeExtent: t, updateNodePositions: n, findNode: i, snapGrid: o, snapToGrid: r, nodesDraggable: a, emits: s } = De();
  return (l, c = !1) => {
    const u = r.value ? o.value[0] : 5, d = r.value ? o.value[1] : 5, f = c ? 4 : 1, p = l.x * u * f, v = l.y * d * f, y = [];
    for (const m of e.value)
      if (m.draggable || a && typeof m.draggable > "u") {
        const _ = { x: m.computedPosition.x + p, y: m.computedPosition.y + v }, { position: x } = Ys(
          m,
          _,
          s.error,
          t.value,
          m.parentNode ? i(m.parentNode) : void 0
        );
        y.push({
          id: m.id,
          position: x,
          from: m.position,
          distance: { x: l.x, y: l.y },
          dimensions: m.dimensions
        });
      }
    n(y, !0, !1);
  };
}
const jo = 0.1, H_ = (e) => ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
function Ut() {
  return No("Viewport not initialized yet."), Promise.resolve(!1);
}
const q_ = {
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
function U_(e) {
  function t(i, o) {
    return new Promise((r) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.interpolate(o?.interpolate === "linear" ? eo : li).scaleBy(
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
      const { x: c, y: u } = Sf({ x: -i, y: -o }, e.translateExtent), d = Mn.translate(-c, -u).scale(r);
      e.d3Selection && e.d3Zoom ? (l = e.d3Zoom) == null || l.interpolate(a?.interpolate === "linear" ? eo : li).transform(
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
      e.d3Selection && e.d3Zoom ? e.d3Zoom.interpolate(r?.interpolate === "linear" ? eo : li).scaleTo(
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
      padding: jo,
      includeHiddenNodes: !1,
      duration: 0
    }) => {
      var r, a;
      const s = [];
      for (const f of e.nodes)
        f.dimensions.width && f.dimensions.height && (o?.includeHiddenNodes || !f.hidden) && (!((r = o.nodes) != null && r.length) || (a = o.nodes) != null && a.length && o.nodes.includes(f.id)) && s.push(f);
      if (!s.length)
        return Promise.resolve(!1);
      const l = Ws(s), { x: c, y: u, zoom: d } = uu(
        l,
        e.dimensions.width,
        e.dimensions.height,
        o.minZoom ?? e.minZoom,
        o.maxZoom ?? e.maxZoom,
        o.padding ?? jo
      );
      return n(c, u, d, o);
    },
    setCenter: (o, r, a) => {
      const s = typeof a?.zoom < "u" ? a.zoom : e.maxZoom, l = e.dimensions.width / 2 - o * s, c = e.dimensions.height / 2 - r * s;
      return n(l, c, s, a);
    },
    fitBounds: (o, r = { padding: jo }) => {
      const { x: a, y: s, zoom: l } = uu(
        o,
        e.dimensions.width,
        e.dimensions.height,
        e.minZoom,
        e.maxZoom,
        r.padding ?? jo
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
  } : q_);
}
function Vr(e, t = 0, n = H_, i = () => {
}) {
  const o = typeof t == "number" && t > 0;
  return o || i(), o ? e.transition().duration(t).ease(n).on("end", i) : e;
}
function W_(e, t, n) {
  const i = hd(!0);
  return i.run(() => {
    const o = () => {
      i.run(() => {
        let y, m, _ = !!(n.nodes.value.length || n.edges.value.length);
        y = bn([e.modelValue, () => {
          var x, w;
          return (w = (x = e.modelValue) == null ? void 0 : x.value) == null ? void 0 : w.length;
        }], ([x]) => {
          x && Array.isArray(x) && (m?.pause(), n.setElements(x), !m && !_ && x.length ? _ = !0 : m?.resume());
        }), m = bn(
          [n.nodes, n.edges, () => n.edges.value.length, () => n.nodes.value.length],
          ([x, w]) => {
            var b;
            (b = e.modelValue) != null && b.value && Array.isArray(e.modelValue.value) && (y?.pause(), e.modelValue.value = [...x, ...w], Ve(() => {
              y?.resume();
            }));
          },
          { immediate: _ }
        ), ri(() => {
          y?.stop(), m?.stop();
        });
      });
    }, r = () => {
      i.run(() => {
        let y, m, _ = !!n.nodes.value.length;
        y = bn([e.nodes, () => {
          var x, w;
          return (w = (x = e.nodes) == null ? void 0 : x.value) == null ? void 0 : w.length;
        }], ([x]) => {
          x && Array.isArray(x) && (m?.pause(), n.setNodes(x), !m && !_ && x.length ? _ = !0 : m?.resume());
        }), m = bn(
          [n.nodes, () => n.nodes.value.length],
          ([x]) => {
            var w;
            (w = e.nodes) != null && w.value && Array.isArray(e.nodes.value) && (y?.pause(), e.nodes.value = [...x], Ve(() => {
              y?.resume();
            }));
          },
          { immediate: _ }
        ), ri(() => {
          y?.stop(), m?.stop();
        });
      });
    }, a = () => {
      i.run(() => {
        let y, m, _ = !!n.edges.value.length;
        y = bn([e.edges, () => {
          var x, w;
          return (w = (x = e.edges) == null ? void 0 : x.value) == null ? void 0 : w.length;
        }], ([x]) => {
          x && Array.isArray(x) && (m?.pause(), n.setEdges(x), !m && !_ && x.length ? _ = !0 : m?.resume());
        }), m = bn(
          [n.edges, () => n.edges.value.length],
          ([x]) => {
            var w;
            (w = e.edges) != null && w.value && Array.isArray(e.edges.value) && (y?.pause(), e.edges.value = [...x], Ve(() => {
              y?.resume();
            }));
          },
          { immediate: _ }
        ), ri(() => {
          y?.stop(), m?.stop();
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
    }, f = () => {
      i.run(() => {
        const y = async (m) => {
          let _ = m;
          typeof t.autoConnect == "function" && (_ = await t.autoConnect(m)), _ !== !1 && n.addEdges([_]);
        };
        _e(
          () => t.autoConnect,
          () => {
            We(t.autoConnect) && (n.autoConnect.value = t.autoConnect);
          },
          { immediate: !0 }
        ), _e(
          n.autoConnect,
          (m, _, x) => {
            m ? n.onConnect(y) : n.hooks.value.connect.off(y), x(() => {
              n.hooks.value.connect.off(y);
            });
          },
          { immediate: !0 }
        );
      });
    }, p = () => {
      const y = [
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
        const _ = m;
        if (!y.includes(_)) {
          const x = Ne(() => t[_]), w = n[_];
          $s(w) && i.run(() => {
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
      o(), r(), a(), l(), s(), c(), u(), d(), f(), p();
    })();
  }), () => i.stop();
}
function Y_() {
  return {
    edgesChange: pe(),
    nodesChange: pe(),
    nodeDoubleClick: pe(),
    nodeClick: pe(),
    nodeMouseEnter: pe(),
    nodeMouseMove: pe(),
    nodeMouseLeave: pe(),
    nodeContextMenu: pe(),
    nodeDragStart: pe(),
    nodeDrag: pe(),
    nodeDragStop: pe(),
    nodesInitialized: pe(),
    miniMapNodeClick: pe(),
    miniMapNodeDoubleClick: pe(),
    miniMapNodeMouseEnter: pe(),
    miniMapNodeMouseMove: pe(),
    miniMapNodeMouseLeave: pe(),
    connect: pe(),
    connectStart: pe(),
    connectEnd: pe(),
    clickConnectStart: pe(),
    clickConnectEnd: pe(),
    paneReady: pe(),
    init: pe(),
    move: pe(),
    moveStart: pe(),
    moveEnd: pe(),
    selectionDragStart: pe(),
    selectionDrag: pe(),
    selectionDragStop: pe(),
    selectionContextMenu: pe(),
    selectionStart: pe(),
    selectionEnd: pe(),
    viewportChangeStart: pe(),
    viewportChange: pe(),
    viewportChangeEnd: pe(),
    paneScroll: pe(),
    paneClick: pe(),
    paneContextMenu: pe(),
    paneMouseEnter: pe(),
    paneMouseMove: pe(),
    paneMouseLeave: pe(),
    edgeContextMenu: pe(),
    edgeMouseEnter: pe(),
    edgeMouseMove: pe(),
    edgeMouseLeave: pe(),
    edgeDoubleClick: pe(),
    edgeClick: pe(),
    edgeUpdateStart: pe(),
    edgeUpdate: pe(),
    edgeUpdateEnd: pe(),
    updateNodeInternals: pe(),
    error: pe((e) => No(e.message))
  };
}
function G_(e, t) {
  const n = Ln();
  Lm(() => {
    for (const [o, r] of Object.entries(t.value)) {
      const a = (s) => {
        e(o, s);
      };
      r.setEmitter(a), lo(r.removeEmitter), r.setHasEmitListeners(() => i(o)), lo(r.removeHasEmitListeners);
    }
  });
  function i(o) {
    var r;
    const a = j_(o);
    return !!((r = n?.vnode.props) == null ? void 0 : r[a]);
  }
}
function j_(e) {
  const [t, ...n] = e.split(":");
  return `on${t.replace(/(?:^|-)(\w)/g, (o, r) => r.toUpperCase())}${n.length ? `:${n.join(":")}` : ""}`;
}
function Wf() {
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
    selectionMode: Us.Full,
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
    hooks: Y_(),
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
const X_ = [
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
function K_(e, t, n) {
  const i = U_(e), o = (L) => {
    const R = L ?? [];
    e.hooks.updateNodeInternals.trigger(R);
  }, r = (L) => f_(L, e.nodes, e.edges), a = (L) => d_(L, e.nodes, e.edges), s = (L) => on(L, e.edges), l = ({ id: L, type: R, nodeId: A }) => {
    var P;
    const W = L ? `-${R}-${L}` : `-${R}`;
    return Array.from(((P = e.connectionLookup.get(`${A}${W}`)) == null ? void 0 : P.values()) ?? []);
  }, c = (L) => {
    if (L)
      return t.value.get(L);
  }, u = (L) => {
    if (L)
      return n.value.get(L);
  }, d = (L, R, A) => {
    var P, W;
    const de = [];
    for (const he of L) {
      const ke = {
        id: he.id,
        type: "position",
        dragging: A,
        from: he.from
      };
      if (R && (ke.position = he.position, he.parentNode)) {
        const be = c(he.parentNode);
        ke.position = {
          x: ke.position.x - (((P = be?.computedPosition) == null ? void 0 : P.x) ?? 0),
          y: ke.position.y - (((W = be?.computedPosition) == null ? void 0 : W.y) ?? 0)
        };
      }
      de.push(ke);
    }
    de?.length && e.hooks.nodesChange.trigger(de);
  }, f = (L) => {
    if (!e.vueFlowRef)
      return;
    const R = e.vueFlowRef.querySelector(".vue-flow__transformationpane");
    if (!R)
      return;
    const A = window.getComputedStyle(R), { m22: P } = new window.DOMMatrixReadOnly(A.transform), W = [];
    for (const de of L) {
      const he = de, ke = c(he.id);
      if (ke) {
        const be = rr(he.nodeElement);
        if (!!(be.width && be.height && (ke.dimensions.width !== be.width || ke.dimensions.height !== be.height || he.forceUpdate))) {
          const Se = he.nodeElement.getBoundingClientRect();
          ke.dimensions = be, ke.handleBounds.source = bu("source", he.nodeElement, Se, P, ke.id), ke.handleBounds.target = bu("target", he.nodeElement, Se, P, ke.id), W.push({
            id: ke.id,
            type: "dimensions",
            dimensions: be
          });
        }
      }
    }
    !e.fitViewOnInitDone && e.fitViewOnInit && i.value.fitView().then(() => {
      e.fitViewOnInitDone = !0;
    }), W.length && e.hooks.nodesChange.trigger(W);
  }, p = (L, R) => {
    const A = /* @__PURE__ */ new Set(), P = /* @__PURE__ */ new Set();
    for (const he of L)
      un(he) ? A.add(he.id) : tn(he) && P.add(he.id);
    const W = Gt(t.value, A, !0), de = Gt(n.value, P);
    if (e.multiSelectionActive) {
      for (const he of A)
        W.push(Wt(he, R));
      for (const he of P)
        de.push(Wt(he, R));
    }
    W.length && e.hooks.nodesChange.trigger(W), de.length && e.hooks.edgesChange.trigger(de);
  }, v = (L) => {
    if (e.multiSelectionActive) {
      const R = L.map((A) => Wt(A.id, !0));
      e.hooks.nodesChange.trigger(R);
      return;
    }
    e.hooks.nodesChange.trigger(Gt(t.value, new Set(L.map((R) => R.id)), !0)), e.hooks.edgesChange.trigger(Gt(n.value));
  }, y = (L) => {
    if (e.multiSelectionActive) {
      const R = L.map((A) => Wt(A.id, !0));
      e.hooks.edgesChange.trigger(R);
      return;
    }
    e.hooks.edgesChange.trigger(Gt(n.value, new Set(L.map((R) => R.id)))), e.hooks.nodesChange.trigger(Gt(t.value, /* @__PURE__ */ new Set(), !0));
  }, m = (L) => {
    p(L, !0);
  }, _ = (L) => {
    const A = (L || e.nodes).map((P) => (P.selected = !1, Wt(P.id, !1)));
    e.hooks.nodesChange.trigger(A);
  }, x = (L) => {
    const A = (L || e.edges).map((P) => (P.selected = !1, Wt(P.id, !1)));
    e.hooks.edgesChange.trigger(A);
  }, w = (L) => {
    if (!L || !L.length)
      return p([], !1);
    const R = L.reduce(
      (A, P) => {
        const W = Wt(P.id, !1);
        return un(P) ? A.nodes.push(W) : A.edges.push(W), A;
      },
      { nodes: [], edges: [] }
    );
    R.nodes.length && e.hooks.nodesChange.trigger(R.nodes), R.edges.length && e.hooks.edgesChange.trigger(R.edges);
  }, b = (L) => {
    var R;
    (R = e.d3Zoom) == null || R.scaleExtent([L, e.maxZoom]), e.minZoom = L;
  }, C = (L) => {
    var R;
    (R = e.d3Zoom) == null || R.scaleExtent([e.minZoom, L]), e.maxZoom = L;
  }, I = (L) => {
    var R;
    (R = e.d3Zoom) == null || R.translateExtent(L), e.translateExtent = L;
  }, B = (L) => {
    e.nodeExtent = L, o();
  }, T = (L) => {
    var R;
    (R = e.d3Zoom) == null || R.clickDistance(L);
  }, M = (L) => {
    e.nodesDraggable = L, e.nodesConnectable = L, e.elementsSelectable = L;
  }, V = (L) => {
    const R = L instanceof Function ? L(e.nodes) : L;
    !e.initialized && !R.length || (e.nodes = _u(R, c, e.hooks.error.trigger));
  }, O = (L) => {
    const R = L instanceof Function ? L(e.edges) : L;
    if (!e.initialized && !R.length)
      return;
    const A = Lr(
      R,
      e.isValidConnection,
      c,
      u,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    );
    Pr(e.connectionLookup, n.value, A), e.edges = A;
  }, E = (L) => {
    const R = L instanceof Function ? L([...e.nodes, ...e.edges]) : L;
    !e.initialized && !R.length || (V(R.filter(un)), O(R.filter(tn)));
  }, F = (L) => {
    let R = L instanceof Function ? L(e.nodes) : L;
    R = Array.isArray(R) ? R : [R];
    const A = _u(R, c, e.hooks.error.trigger), P = [];
    for (const W of A)
      P.push(fu(W));
    P.length && e.hooks.nodesChange.trigger(P);
  }, g = (L) => {
    let R = L instanceof Function ? L(e.edges) : L;
    R = Array.isArray(R) ? R : [R];
    const A = Lr(
      R,
      e.isValidConnection,
      c,
      u,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    ), P = [];
    for (const W of A)
      P.push(fu(W));
    P.length && e.hooks.edgesChange.trigger(P);
  }, $ = (L, R = !0, A = !1) => {
    const P = L instanceof Function ? L(e.nodes) : L, W = Array.isArray(P) ? P : [P], de = [], he = [];
    function ke(Ee) {
      const Se = s(Ee);
      for (const Me of Se)
        (!We(Me.deletable) || Me.deletable) && he.push(pu(Me.id, Me.source, Me.target, Me.sourceHandle, Me.targetHandle));
    }
    function be(Ee) {
      const Se = [];
      for (const Me of e.nodes)
        Me.parentNode === Ee && Se.push(Me);
      if (Se.length) {
        for (const Me of Se)
          de.push(hu(Me.id));
        R && ke(Se);
        for (const Me of Se)
          be(Me.id);
      }
    }
    for (const Ee of W) {
      const Se = typeof Ee == "string" ? c(Ee) : Ee;
      Se && (We(Se.deletable) && !Se.deletable || (de.push(hu(Se.id)), R && ke([Se]), A && be(Se.id)));
    }
    he.length && e.hooks.edgesChange.trigger(he), de.length && e.hooks.nodesChange.trigger(de);
  }, k = (L) => {
    const R = L instanceof Function ? L(e.edges) : L, A = Array.isArray(R) ? R : [R], P = [];
    for (const W of A) {
      const de = typeof W == "string" ? u(W) : W;
      de && (We(de.deletable) && !de.deletable || P.push(
        pu(
          typeof W == "string" ? W : W.id,
          de.source,
          de.target,
          de.sourceHandle,
          de.targetHandle
        )
      ));
    }
    e.hooks.edgesChange.trigger(P);
  }, H = (L, R, A = !0) => {
    const P = u(L.id);
    if (!P)
      return !1;
    const W = e.edges.indexOf(P), de = R_(L, R, P, A, e.hooks.error.trigger);
    if (de) {
      const [he] = Lr(
        [de],
        e.isValidConnection,
        c,
        u,
        e.hooks.error.trigger,
        e.defaultEdgeOptions,
        e.nodes,
        e.edges
      );
      return e.edges = e.edges.map((ke, be) => be === W ? he : ke), Pr(e.connectionLookup, n.value, [he]), he;
    }
    return !1;
  }, q = (L, R, A = { replace: !1 }) => {
    const P = u(L);
    if (!P)
      return;
    const W = typeof R == "function" ? R(P) : R;
    P.data = A.replace ? W : { ...P.data, ...W };
  }, ee = (L) => du(L, e.nodes), Z = (L) => {
    const R = du(L, e.edges);
    return Pr(e.connectionLookup, n.value, R), R;
  }, oe = (L, R, A = { replace: !1 }) => {
    const P = c(L);
    if (!P)
      return;
    const W = typeof R == "function" ? R(P) : R;
    A.replace ? e.nodes.splice(e.nodes.indexOf(P), 1, W) : Object.assign(P, W);
  }, se = (L, R, A = { replace: !1 }) => {
    const P = c(L);
    if (!P)
      return;
    const W = typeof R == "function" ? R(P) : R;
    P.data = A.replace ? W : { ...P.data, ...W };
  }, Y = (L, R, A = !1) => {
    A ? e.connectionClickStartHandle = L : e.connectionStartHandle = L, e.connectionEndHandle = null, e.connectionStatus = null, R && (e.connectionPosition = R);
  }, J = (L, R = null, A = null) => {
    e.connectionStartHandle && (e.connectionPosition = L, e.connectionEndHandle = R, e.connectionStatus = A);
  }, j = (L, R) => {
    e.connectionPosition = { x: Number.NaN, y: Number.NaN }, e.connectionEndHandle = null, e.connectionStatus = null, R ? e.connectionClickStartHandle = null : e.connectionStartHandle = null;
  }, X = (L) => {
    const R = u_(L), A = R ? null : Xn(L) ? L : c(L.id);
    return !R && !A ? [null, null, R] : [R ? L : Oi(A), A, R];
  }, te = (L, R = !0, A = e.nodes) => {
    const [P, W, de] = X(L);
    if (!P)
      return [];
    const he = [];
    for (const ke of A || e.nodes) {
      if (!de && (ke.id === W.id || !ke.computedPosition))
        continue;
      const be = Oi(ke), Ee = Ri(be, P);
      (R && Ee > 0 || Ee >= be.width * be.height || Ee >= Number(P.width) * Number(P.height)) && he.push(ke);
    }
    return he;
  }, ae = (L, R, A = !0) => {
    const [P] = X(L);
    if (!P)
      return !1;
    const W = Ri(P, R);
    return A && W > 0 || W >= Number(P.width) * Number(P.height);
  }, ue = (L) => {
    const { viewport: R, dimensions: A, d3Zoom: P, d3Selection: W, translateExtent: de } = e;
    if (!P || !W || !L.x && !L.y)
      return !1;
    const he = Mn.translate(R.x + L.x, R.y + L.y).scale(R.zoom), ke = [
      [0, 0],
      [A.width, A.height]
    ], be = P.constrain()(he, ke, de), Ee = e.viewport.x !== be.x || e.viewport.y !== be.y || e.viewport.zoom !== be.k;
    return P.transform(W, be), Ee;
  }, we = (L) => {
    const R = L instanceof Function ? L(e) : L, A = [
      "d3Zoom",
      "d3Selection",
      "d3ZoomHandler",
      "viewportRef",
      "vueFlowRef",
      "dimensions",
      "hooks"
    ];
    We(R.defaultEdgeOptions) && (e.defaultEdgeOptions = R.defaultEdgeOptions);
    const P = R.modelValue || R.nodes || R.edges ? [] : void 0;
    P && (R.modelValue && P.push(...R.modelValue), R.nodes && P.push(...R.nodes), R.edges && P.push(...R.edges), E(P));
    const W = () => {
      We(R.maxZoom) && C(R.maxZoom), We(R.minZoom) && b(R.minZoom), We(R.translateExtent) && I(R.translateExtent);
    };
    for (const de of Object.keys(R)) {
      const he = de, ke = R[he];
      ![...X_, ...A].includes(he) && We(ke) && (e[he] = ke);
    }
    qa(() => e.d3Zoom).not.toBeNull().then(W), e.initialized || (e.initialized = !0);
  };
  return {
    updateNodePositions: d,
    updateNodeDimensions: f,
    setElements: E,
    setNodes: V,
    setEdges: O,
    addNodes: F,
    addEdges: g,
    removeNodes: $,
    removeEdges: k,
    findNode: c,
    findEdge: u,
    updateEdge: H,
    updateEdgeData: q,
    updateNode: oe,
    updateNodeData: se,
    applyEdgeChanges: Z,
    applyNodeChanges: ee,
    addSelectedElements: m,
    addSelectedNodes: v,
    addSelectedEdges: y,
    setMinZoom: b,
    setMaxZoom: C,
    setTranslateExtent: I,
    setNodeExtent: B,
    setPaneClickDistance: T,
    removeSelectedElements: w,
    removeSelectedNodes: _,
    removeSelectedEdges: x,
    startConnection: Y,
    updateConnection: J,
    endConnection: j,
    setInteractive: M,
    setState: we,
    getIntersectingNodes: te,
    getIncomers: r,
    getOutgoers: a,
    getConnectedEdges: s,
    getHandleConnections: l,
    isNodeIntersecting: ae,
    panBy: ue,
    fitView: (L) => i.value.fitView(L),
    zoomIn: (L) => i.value.zoomIn(L),
    zoomOut: (L) => i.value.zoomOut(L),
    zoomTo: (L, R) => i.value.zoomTo(L, R),
    setViewport: (L, R) => i.value.setViewport(L, R),
    setTransform: (L, R) => i.value.setTransform(L, R),
    getViewport: () => i.value.getViewport(),
    getTransform: () => i.value.getTransform(),
    setCenter: (L, R, A) => i.value.setCenter(L, R, A),
    fitBounds: (L, R) => i.value.fitBounds(L, R),
    project: (L) => i.value.project(L),
    screenToFlowCoordinate: (L) => i.value.screenToFlowCoordinate(L),
    flowToScreenCoordinate: (L) => i.value.flowToScreenCoordinate(L),
    toObject: () => {
      const L = [], R = [];
      for (const A of e.nodes) {
        const {
          computedPosition: P,
          handleBounds: W,
          selected: de,
          dimensions: he,
          isParent: ke,
          resizing: be,
          dragging: Ee,
          events: Se,
          ...Me
        } = A;
        L.push(Me);
      }
      for (const A of e.edges) {
        const { selected: P, sourceNode: W, targetNode: de, events: he, ...ke } = A;
        R.push(ke);
      }
      return JSON.parse(
        JSON.stringify({
          nodes: L,
          edges: R,
          position: [e.viewport.x, e.viewport.y],
          zoom: e.viewport.zoom,
          viewport: e.viewport
        })
      );
    },
    fromObject: (L) => new Promise((R) => {
      const { nodes: A, edges: P, position: W, zoom: de, viewport: he } = L;
      A && V(A), P && O(P);
      const [ke, be] = he?.x && he?.y ? [he.x, he.y] : W ?? [null, null];
      if (ke && be) {
        const Ee = he?.zoom || de || e.viewport.zoom;
        return qa(() => i.value.viewportInitialized).toBe(!0).then(() => {
          i.value.setViewport({
            x: ke,
            y: be,
            zoom: Ee
          }).then(() => {
            R(!0);
          });
        });
      } else
        R(!0);
    }),
    updateNodeInternals: o,
    viewportHelper: i,
    $reset: () => {
      const L = Wf();
      if (e.edges = [], e.nodes = [], e.d3Zoom && e.d3Selection) {
        const R = Mn.translate(L.defaultViewport.x ?? 0, L.defaultViewport.y ?? 0).scale(Bt(L.defaultViewport.zoom ?? 1, L.minZoom, L.maxZoom)), A = e.viewportRef.getBoundingClientRect(), P = [
          [0, 0],
          [A.width, A.height]
        ], W = e.d3Zoom.constrain()(R, P, L.translateExtent);
        e.d3Zoom.transform(e.d3Selection, W);
      }
      we(L);
    },
    $destroy: () => {
    }
  };
}
const Z_ = ["data-id", "data-handleid", "data-nodeid", "data-handlepos"], J_ = {
  name: "Handle",
  compatConfig: { MODE: 3 }
}, xt = /* @__PURE__ */ ye({
  ...J_,
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
    const n = Rm(e, ["position", "connectable", "connectableStart", "connectableEnd", "id"]), i = Ne(() => n.type ?? "source"), o = Ne(() => n.isValidConnection ?? null), {
      id: r,
      connectionStartHandle: a,
      connectionClickStartHandle: s,
      connectionEndHandle: l,
      vueFlowRef: c,
      nodesConnectable: u,
      noDragClassName: d,
      noPanClassName: f
    } = De(), { id: p, node: v, nodeEl: y, connectedEdges: m } = qf(), _ = G(), x = Ne(() => typeof e.connectableStart < "u" ? e.connectableStart : !0), w = Ne(() => typeof e.connectableEnd < "u" ? e.connectableEnd : !0), b = Ne(
      () => {
        var O, E, F, g, $, k;
        return ((O = a.value) == null ? void 0 : O.nodeId) === p && ((E = a.value) == null ? void 0 : E.id) === e.id && ((F = a.value) == null ? void 0 : F.type) === i.value || ((g = l.value) == null ? void 0 : g.nodeId) === p && (($ = l.value) == null ? void 0 : $.id) === e.id && ((k = l.value) == null ? void 0 : k.type) === i.value;
      }
    ), C = Ne(
      () => {
        var O, E, F;
        return ((O = s.value) == null ? void 0 : O.nodeId) === p && ((E = s.value) == null ? void 0 : E.id) === e.id && ((F = s.value) == null ? void 0 : F.type) === i.value;
      }
    ), { handlePointerDown: I, handleClick: B } = Hf({
      nodeId: p,
      handleId: e.id,
      isValidConnection: o,
      type: i
    }), T = U(() => typeof e.connectable == "string" && e.connectable === "single" ? !m.value.some((O) => {
      const E = O[`${i.value}Handle`];
      return O[i.value] !== p ? !1 : E ? E === e.id : !0;
    }) : typeof e.connectable == "number" ? m.value.filter((O) => {
      const E = O[`${i.value}Handle`];
      return O[i.value] !== p ? !1 : E ? E === e.id : !0;
    }).length < e.connectable : typeof e.connectable == "function" ? e.connectable(v, m.value) : We(e.connectable) ? e.connectable : u.value);
    Ue(() => {
      var O;
      if (!v.dimensions.width || !v.dimensions.height)
        return;
      const E = (O = v.handleBounds[i.value]) == null ? void 0 : O.find((ee) => ee.id === e.id);
      if (!c.value || E)
        return;
      const F = c.value.querySelector(".vue-flow__transformationpane");
      if (!y.value || !_.value || !F || !e.id)
        return;
      const g = y.value.getBoundingClientRect(), $ = _.value.getBoundingClientRect(), k = window.getComputedStyle(F), { m22: H } = new window.DOMMatrixReadOnly(k.transform), q = {
        id: e.id,
        position: e.position,
        x: ($.left - g.left) / H,
        y: ($.top - g.top) / H,
        type: i.value,
        nodeId: p,
        ...rr(_.value)
      };
      v.handleBounds[i.value] = [...v.handleBounds[i.value] ?? [], q];
    });
    function M(O) {
      const E = Gs(O);
      T.value && x.value && (E && O.button === 0 || !E) && I(O);
    }
    function V(O) {
      !p || !s.value && !x.value || T.value && B(O);
    }
    return t({
      handleClick: B,
      handlePointerDown: I,
      onClick: V,
      onPointerDown: M
    }), (O, E) => (N(), D("div", {
      ref_key: "handle",
      ref: _,
      "data-id": `${h(r)}-${h(p)}-${e.id}-${i.value}`,
      "data-handleid": e.id,
      "data-nodeid": h(p),
      "data-handlepos": O.position,
      class: Ie(["vue-flow__handle", [
        `vue-flow__handle-${O.position}`,
        `vue-flow__handle-${e.id}`,
        h(d),
        h(f),
        i.value,
        {
          connectable: T.value,
          connecting: C.value,
          connectablestart: x.value,
          connectableend: w.value,
          connectionindicator: T.value && (x.value && !b.value || w.value && b.value)
        }
      ]]),
      onMousedown: M,
      onTouchstartPassive: M,
      onClick: V
    }, [
      ze(O.$slots, "default", { id: O.id })
    ], 42, Z_));
  }
}), lr = function({
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
    typeof s != "string" && s ? Pe(s) : Pe(le, [s]),
    Pe(xt, { type: "source", position: e, connectable: i, isValidConnection: r })
  ];
};
lr.props = ["sourcePosition", "targetPosition", "label", "isValidTargetPos", "isValidSourcePos", "connectable", "data"];
lr.inheritAttrs = !1;
lr.compatConfig = { MODE: 3 };
const Q_ = lr, ur = function({
  targetPosition: e = ge.Top,
  label: t,
  connectable: n = !0,
  isValidTargetPos: i,
  data: o
}) {
  const r = o.label ?? t;
  return [
    Pe(xt, { type: "target", position: e, connectable: n, isValidConnection: i }),
    typeof r != "string" && r ? Pe(r) : Pe(le, [r])
  ];
};
ur.props = ["targetPosition", "label", "isValidTargetPos", "connectable", "data"];
ur.inheritAttrs = !1;
ur.compatConfig = { MODE: 3 };
const ek = ur, cr = function({
  sourcePosition: e = ge.Bottom,
  label: t,
  connectable: n = !0,
  isValidSourcePos: i,
  data: o
}) {
  const r = o.label ?? t;
  return [
    typeof r != "string" && r ? Pe(r) : Pe(le, [r]),
    Pe(xt, { type: "source", position: e, connectable: n, isValidConnection: i })
  ];
};
cr.props = ["sourcePosition", "label", "isValidSourcePos", "connectable", "data"];
cr.inheritAttrs = !1;
cr.compatConfig = { MODE: 3 };
const tk = cr, nk = ["transform"], ok = ["width", "height", "x", "y", "rx", "ry"], ik = ["y"], rk = {
  name: "EdgeText",
  compatConfig: { MODE: 3 }
}, ak = /* @__PURE__ */ ye({
  ...rk,
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
    const t = G({ x: 0, y: 0, width: 0, height: 0 }), n = G(null), i = U(() => `translate(${e.x - t.value.width / 2} ${e.y - t.value.height / 2})`);
    Ue(o), _e([() => e.x, () => e.y, n, () => e.label], o);
    function o() {
      if (!n.value)
        return;
      const r = n.value.getBBox();
      (r.width !== t.value.width || r.height !== t.value.height) && (t.value = r);
    }
    return (r, a) => (N(), D("g", {
      transform: i.value,
      class: "vue-flow__edge-textwrapper"
    }, [
      r.labelShowBg ? (N(), D("rect", {
        key: 0,
        class: "vue-flow__edge-textbg",
        width: `${t.value.width + 2 * r.labelBgPadding[0]}px`,
        height: `${t.value.height + 2 * r.labelBgPadding[1]}px`,
        x: -r.labelBgPadding[0],
        y: -r.labelBgPadding[1],
        style: Be(r.labelBgStyle),
        rx: r.labelBgBorderRadius,
        ry: r.labelBgBorderRadius
      }, null, 12, ok)) : Q("", !0),
      S("text", oo(r.$attrs, {
        ref_key: "el",
        ref: n,
        class: "vue-flow__edge-text",
        y: t.value.height / 2,
        dy: "0.3em",
        style: r.labelStyle
      }), [
        ze(r.$slots, "default", {}, () => [
          typeof r.label != "string" ? (N(), re(Xt(r.label), { key: 0 })) : (N(), D(le, { key: 1 }, [
            ce(K(r.label), 1)
          ], 64))
        ])
      ], 16, ik)
    ], 8, nk));
  }
}), sk = ["id", "d", "marker-end", "marker-start"], lk = ["d", "stroke-width"], uk = {
  name: "BaseEdge",
  inheritAttrs: !1,
  compatConfig: { MODE: 3 }
}, Io = /* @__PURE__ */ ye({
  ...uk,
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
    const n = G(null), i = G(null), o = G(null), r = Es();
    return t({
      pathEl: n,
      interactionEl: i,
      labelEl: o
    }), (a, s) => (N(), D(le, null, [
      S("path", oo(h(r), {
        id: a.id,
        ref_key: "pathEl",
        ref: n,
        d: a.path,
        class: "vue-flow__edge-path",
        "marker-end": a.markerEnd,
        "marker-start": a.markerStart
      }), null, 16, sk),
      a.interactionWidth ? (N(), D("path", {
        key: 0,
        ref_key: "interactionEl",
        ref: i,
        fill: "none",
        d: a.path,
        "stroke-width": a.interactionWidth,
        "stroke-opacity": 0,
        class: "vue-flow__edge-interaction"
      }, null, 8, lk)) : Q("", !0),
      a.label && a.labelX && a.labelY ? (N(), re(ak, {
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
      }, null, 8, ["x", "y", "label", "label-show-bg", "label-bg-style", "label-bg-padding", "label-bg-border-radius", "label-style"])) : Q("", !0)
    ], 64));
  }
});
function Yf({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: i
}) {
  const o = Math.abs(n - e) / 2, r = n < e ? n + o : n - o, a = Math.abs(i - t) / 2, s = i < t ? i + a : i - a;
  return [r, s, o, a];
}
function Gf({
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
function Xo(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function $u({ pos: e, x1: t, y1: n, x2: i, y2: o, c: r }) {
  let a, s;
  switch (e) {
    case ge.Left:
      a = t - Xo(t - i, r), s = n;
      break;
    case ge.Right:
      a = t + Xo(i - t, r), s = n;
      break;
    case ge.Top:
      a = t, s = n - Xo(n - o, r);
      break;
    case ge.Bottom:
      a = t, s = n + Xo(o - n, r);
      break;
  }
  return [a, s];
}
function Xs(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: i = ge.Bottom,
    targetX: o,
    targetY: r,
    targetPosition: a = ge.Top,
    curvature: s = 0.25
  } = e, [l, c] = $u({
    pos: i,
    x1: t,
    y1: n,
    x2: o,
    y2: r,
    c: s
  }), [u, d] = $u({
    pos: a,
    x1: o,
    y1: r,
    x2: t,
    y2: n,
    c: s
  }), [f, p, v, y] = Gf({
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
    f,
    p,
    v,
    y
  ];
}
function Su({ pos: e, x1: t, y1: n, x2: i, y2: o }) {
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
function jf(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: i = ge.Bottom,
    targetX: o,
    targetY: r,
    targetPosition: a = ge.Top
  } = e, [s, l] = Su({
    pos: i,
    x1: t,
    y1: n,
    x2: o,
    y2: r
  }), [c, u] = Su({
    pos: a,
    x1: o,
    y1: r,
    x2: t,
    y2: n
  }), [d, f, p, v] = Gf({
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
    f,
    p,
    v
  ];
}
const Cu = {
  [ge.Left]: { x: -1, y: 0 },
  [ge.Right]: { x: 1, y: 0 },
  [ge.Top]: { x: 0, y: -1 },
  [ge.Bottom]: { x: 0, y: 1 }
};
function ck({
  source: e,
  sourcePosition: t = ge.Bottom,
  target: n
}) {
  return t === ge.Left || t === ge.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
}
function Nu(e, t) {
  return Math.sqrt((t.x - e.x) ** 2 + (t.y - e.y) ** 2);
}
function dk({
  source: e,
  sourcePosition: t = ge.Bottom,
  target: n,
  targetPosition: i = ge.Top,
  center: o,
  offset: r
}) {
  const a = Cu[t], s = Cu[i], l = { x: e.x + a.x * r, y: e.y + a.y * r }, c = { x: n.x + s.x * r, y: n.y + s.y * r }, u = ck({
    source: l,
    sourcePosition: t,
    target: c
  }), d = u.x !== 0 ? "x" : "y", f = u[d];
  let p, v, y;
  const m = { x: 0, y: 0 }, _ = { x: 0, y: 0 }, [x, w, b, C] = Yf({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (a[d] * s[d] === -1) {
    v = o.x ?? x, y = o.y ?? w;
    const B = [
      { x: v, y: l.y },
      { x: v, y: c.y }
    ], T = [
      { x: l.x, y },
      { x: c.x, y }
    ];
    a[d] === f ? p = d === "x" ? B : T : p = d === "x" ? T : B;
  } else {
    const B = [{ x: l.x, y: c.y }], T = [{ x: c.x, y: l.y }];
    if (d === "x" ? p = a.x === f ? T : B : p = a.y === f ? B : T, t === i) {
      const F = Math.abs(e[d] - n[d]);
      if (F <= r) {
        const g = Math.min(r - 1, r - F);
        a[d] === f ? m[d] = (l[d] > e[d] ? -1 : 1) * g : _[d] = (c[d] > n[d] ? -1 : 1) * g;
      }
    }
    if (t !== i) {
      const F = d === "x" ? "y" : "x", g = a[d] === s[F], $ = l[F] > c[F], k = l[F] < c[F];
      (a[d] === 1 && (!g && $ || g && k) || a[d] !== 1 && (!g && k || g && $)) && (p = d === "x" ? B : T);
    }
    const M = { x: l.x + m.x, y: l.y + m.y }, V = { x: c.x + _.x, y: c.y + _.y }, O = Math.max(Math.abs(M.x - p[0].x), Math.abs(V.x - p[0].x)), E = Math.max(Math.abs(M.y - p[0].y), Math.abs(V.y - p[0].y));
    O >= E ? (v = (M.x + V.x) / 2, y = p[0].y) : (v = p[0].x, y = (M.y + V.y) / 2);
  }
  return [[
    e,
    { x: l.x + m.x, y: l.y + m.y },
    ...p,
    { x: c.x + _.x, y: c.y + _.y },
    n
  ], v, y, b, C];
}
function fk(e, t, n, i) {
  const o = Math.min(Nu(e, t) / 2, Nu(t, n) / 2, i), { x: r, y: a } = t;
  if (e.x === r && r === n.x || e.y === a && a === n.y)
    return `L${r} ${a}`;
  if (e.y === a) {
    const c = e.x < n.x ? -1 : 1, u = e.y < n.y ? 1 : -1;
    return `L ${r + o * c},${a}Q ${r},${a} ${r},${a + o * u}`;
  }
  const s = e.x < n.x ? 1 : -1, l = e.y < n.y ? -1 : 1;
  return `L ${r},${a + o * l}Q ${r},${a} ${r + o * s},${a}`;
}
function ns(e) {
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
  } = e, [d, f, p, v, y] = dk({
    source: { x: t, y: n },
    sourcePosition: i,
    target: { x: o, y: r },
    targetPosition: a,
    center: { x: l, y: c },
    offset: u
  });
  return [d.reduce((_, x, w) => {
    let b;
    return w > 0 && w < d.length - 1 ? b = fk(d[w - 1], x, d[w + 1], s) : b = `${w === 0 ? "M" : "L"}${x.x} ${x.y}`, _ += b, _;
  }, ""), f, p, v, y];
}
function hk(e) {
  const { sourceX: t, sourceY: n, targetX: i, targetY: o } = e, [r, a, s, l] = Yf({
    sourceX: t,
    sourceY: n,
    targetX: i,
    targetY: o
  });
  return [`M ${t},${n}L ${i},${o}`, r, a, s, l];
}
const pk = ye({
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
      const [n, i, o] = hk(e);
      return Pe(Io, {
        path: n,
        labelX: i,
        labelY: o,
        ...t,
        ...e
      });
    };
  }
}), vk = pk, mk = ye({
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
      const [n, i, o] = ns({
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
}), Xf = mk, gk = ye({
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
    return () => Pe(Xf, { ...e, ...t, borderRadius: 0 });
  }
}), yk = gk, wk = ye({
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
      const [n, i, o] = Xs({
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
}), bk = wk, _k = ye({
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
      const [n, i, o] = jf({
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
}), kk = _k, Ek = {
  input: tk,
  default: Q_,
  output: ek
}, xk = {
  default: bk,
  straight: vk,
  step: yk,
  smoothstep: Xf,
  simplebezier: kk
};
function $k(e, t, n) {
  const i = U(() => (y) => t.value.get(y)), o = U(() => (y) => n.value.get(y)), r = U(() => {
    const y = {
      ...xk,
      ...e.edgeTypes
    }, m = Object.keys(y);
    for (const _ of e.edges)
      _.type && !m.includes(_.type) && (y[_.type] = _.type);
    return y;
  }), a = U(() => {
    const y = {
      ...Ek,
      ...e.nodeTypes
    }, m = Object.keys(y);
    for (const _ of e.nodes)
      _.type && !m.includes(_.type) && (y[_.type] = _.type);
    return y;
  }), s = U(() => e.onlyRenderVisibleElements ? Mf(
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
      const y = [];
      for (const m of e.edges) {
        const _ = t.value.get(m.source), x = t.value.get(m.target);
        k_({
          sourcePos: _.computedPosition || { x: 0, y: 0 },
          targetPos: x.computedPosition || { x: 0, y: 0 },
          sourceWidth: _.dimensions.width,
          sourceHeight: _.dimensions.height,
          targetWidth: x.dimensions.width,
          targetHeight: x.dimensions.height,
          width: e.dimensions.width,
          height: e.dimensions.height,
          viewport: e.viewport
        }) && y.push(m);
      }
      return y;
    }
    return e.edges;
  }), c = U(() => [...s.value, ...l.value]), u = U(() => {
    const y = [];
    for (const m of e.nodes)
      m.selected && y.push(m);
    return y;
  }), d = U(() => {
    const y = [];
    for (const m of e.edges)
      m.selected && y.push(m);
    return y;
  }), f = U(() => [
    ...u.value,
    ...d.value
  ]), p = U(() => {
    const y = [];
    for (const m of e.nodes)
      m.dimensions.width && m.dimensions.height && m.handleBounds !== void 0 && y.push(m);
    return y;
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
    getSelectedElements: f,
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
    const n = (t = Ln()) == null ? void 0 : t.appContext.app, i = n?.config.globalProperties.$vueFlowStorage ?? rn.instance;
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
    const i = Wf(), o = xs(i), r = {};
    for (const [f, p] of Object.entries(o.hooks)) {
      const v = `on${f.charAt(0).toUpperCase() + f.slice(1)}`;
      r[v] = p.on;
    }
    const a = {};
    for (const [f, p] of Object.entries(o.hooks))
      a[f] = p.trigger;
    const s = U(() => {
      const f = /* @__PURE__ */ new Map();
      for (const p of o.nodes)
        f.set(p.id, p);
      return f;
    }), l = U(() => {
      const f = /* @__PURE__ */ new Map();
      for (const p of o.edges)
        f.set(p.id, p);
      return f;
    }), c = $k(o, s, l), u = K_(o, s, l);
    u.setState({ ...o, ...n });
    const d = {
      ...r,
      ...c,
      ...u,
      ...yw(o),
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
  const t = rn.getInstance(), n = fd(), i = typeof e == "object", o = i ? e : { id: e }, r = o.id, a = r ?? n?.vueFlowId;
  let s;
  if (n) {
    const l = Ht(xu, null);
    typeof l < "u" && l !== null && (!a || l.id === a) && (s = l);
  }
  if (s || a && (s = t.get(a)), !s || a && s.id !== a) {
    const l = r ?? t.getId(), c = t.create(l, o);
    s = c, (n ?? hd(!0)).run(() => {
      _e(
        c.applyDefault,
        (d, f, p) => {
          const v = (m) => {
            c.applyNodeChanges(m);
          }, y = (m) => {
            c.applyEdgeChanges(m);
          };
          d ? (c.onNodesChange(v), c.onEdgesChange(y)) : (c.hooks.value.nodesChange.off(v), c.hooks.value.edgesChange.off(y)), p(() => {
            c.hooks.value.nodesChange.off(v), c.hooks.value.edgesChange.off(y);
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
  if (n && (Zt(xu, s), n.vueFlowId = s.id), i) {
    const l = Ln();
    l?.type.name !== "VueFlow" && s.emits.error(new je(Ye.USEVUEFLOW_OPTIONS));
  }
  return s;
}
function Sk(e) {
  const { emits: t, dimensions: n } = De();
  let i;
  Ue(() => {
    const o = () => {
      var r, a;
      if (!e.value || !(((a = (r = e.value).checkVisibility) == null ? void 0 : a.call(r)) ?? !0))
        return;
      const s = rr(e.value);
      (s.width === 0 || s.height === 0) && t.error(new je(Ye.MISSING_VIEWPORT_DIMENSIONS)), n.value = { width: s.width || 500, height: s.height || 500 };
    };
    o(), window.addEventListener("resize", o), e.value && (i = new ResizeObserver(() => o()), i.observe(e.value)), Qe(() => {
      window.removeEventListener("resize", o), i && e.value && i.unobserve(e.value);
    });
  });
}
const Ck = {
  name: "UserSelection",
  compatConfig: { MODE: 3 }
}, Nk = /* @__PURE__ */ ye({
  ...Ck,
  props: {
    userSelectionRect: {}
  },
  setup(e) {
    return (t, n) => (N(), D("div", {
      class: "vue-flow__selection vue-flow__container",
      style: Be({
        width: `${t.userSelectionRect.width}px`,
        height: `${t.userSelectionRect.height}px`,
        transform: `translate(${t.userSelectionRect.x}px, ${t.userSelectionRect.y}px)`
      })
    }, null, 4));
  }
}), Ik = ["tabIndex"], Ak = {
  name: "NodesSelection",
  compatConfig: { MODE: 3 }
}, Tk = /* @__PURE__ */ ye({
  ...Ak,
  setup(e) {
    const { emits: t, viewport: n, getSelectedNodes: i, noPanClassName: o, disableKeyboardA11y: r, userSelectionActive: a } = De(), s = Uf(), l = G(null), c = Bf({
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
    const u = U(() => Ws(i.value)), d = U(() => ({
      width: `${u.value.width}px`,
      height: `${u.value.height}px`,
      top: `${u.value.y}px`,
      left: `${u.value.x}px`
    }));
    function f(v) {
      t.selectionContextMenu({ event: v, nodes: i.value });
    }
    function p(v) {
      r.value || Sn[v.key] && (v.preventDefault(), s(
        {
          x: Sn[v.key].x,
          y: Sn[v.key].y
        },
        v.shiftKey
      ));
    }
    return (v, y) => !h(a) && u.value.width && u.value.height ? (N(), D("div", {
      key: 0,
      class: Ie(["vue-flow__nodesselection vue-flow__container", h(o)]),
      style: Be({ transform: `translate(${h(n).x}px,${h(n).y}px) scale(${h(n).zoom})` })
    }, [
      S("div", {
        ref_key: "el",
        ref: l,
        class: Ie([{ dragging: h(c) }, "vue-flow__nodesselection-rect"]),
        style: Be(d.value),
        tabIndex: h(r) ? void 0 : -1,
        onContextmenu: f,
        onKeydown: p
      }, null, 46, Ik)
    ], 6)) : Q("", !0);
  }
});
function Mk(e, t) {
  return {
    x: e.clientX - t.left,
    y: e.clientY - t.top
  };
}
const Ok = {
  name: "Pane",
  compatConfig: { MODE: 3 }
}, Rk = /* @__PURE__ */ ye({
  ...Ok,
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
      removeNodes: f,
      removeEdges: p,
      selectionMode: v,
      deleteKeyCode: y,
      multiSelectionKeyCode: m,
      multiSelectionActive: _,
      edgeLookup: x,
      nodeLookup: w,
      connectionLookup: b,
      defaultEdgeOptions: C,
      connectionStartHandle: I,
      panOnDrag: B
    } = De(), T = nt(null), M = nt(/* @__PURE__ */ new Set()), V = nt(/* @__PURE__ */ new Set()), O = nt(null), E = Ne(() => l.value && (e.isSelecting || r.value)), F = Ne(() => I.value !== null);
    let g = !1, $ = !1;
    const k = no(y, { actInsideInputWithModifier: !1 }), H = no(m);
    _e(k, (j) => {
      j && (f(d.value), p(u.value), c.value = !1);
    }), _e(H, (j) => {
      _.value = j;
    });
    function q(j, X) {
      return (te) => {
        te.target === X && j?.(te);
      };
    }
    function ee(j) {
      if (g || F.value) {
        g = !1;
        return;
      }
      o.paneClick(j), a(), c.value = !1;
    }
    function Z(j) {
      var X;
      if (Array.isArray(B.value) && ((X = B.value) != null && X.includes(2))) {
        j.preventDefault();
        return;
      }
      o.paneContextMenu(j);
    }
    function oe(j) {
      o.paneScroll(j);
    }
    function se(j) {
      var X, te, ae;
      if (O.value = ((X = t.value) == null ? void 0 : X.getBoundingClientRect()) ?? null, !l.value || !e.isSelecting || j.button !== 0 || j.target !== T.value || !O.value)
        return;
      (ae = (te = j.target) == null ? void 0 : te.setPointerCapture) == null || ae.call(te, j.pointerId);
      const { x: ue, y: we } = Mk(j, O.value);
      $ = !0, g = !1, a(), s.value = {
        width: 0,
        height: 0,
        startX: ue,
        startY: we,
        x: ue,
        y: we
      }, o.selectionStart(j);
    }
    function Y(j) {
      var X;
      if (!O.value || !s.value)
        return;
      g = !0;
      const { x: te, y: ae } = $t(j, O.value), { startX: ue = 0, startY: we = 0 } = s.value, $e = {
        startX: ue,
        startY: we,
        x: te < ue ? te : ue,
        y: ae < we ? ae : we,
        width: Math.abs(te - ue),
        height: Math.abs(ae - we)
      }, ve = M.value, me = V.value;
      M.value = new Set(
        Mf(n.value, $e, i.value, v.value === Us.Partial, !0).map(
          (R) => R.id
        )
      ), V.value = /* @__PURE__ */ new Set();
      const L = ((X = C.value) == null ? void 0 : X.selectable) ?? !0;
      for (const R of M.value) {
        const A = b.value.get(R);
        if (A)
          for (const { edgeId: P } of A.values()) {
            const W = x.value.get(P);
            W && (W.selectable ?? L) && V.value.add(P);
          }
      }
      if (!Eu(ve, M.value)) {
        const R = Gt(w.value, M.value, !0);
        o.nodesChange(R);
      }
      if (!Eu(me, V.value)) {
        const R = Gt(x.value, V.value);
        o.edgesChange(R);
      }
      s.value = $e, r.value = !0, c.value = !1;
    }
    function J(j) {
      var X;
      j.button !== 0 || !$ || ((X = j.target) == null || X.releasePointerCapture(j.pointerId), !r.value && s.value && j.target === T.value && ee(j), r.value = !1, s.value = null, c.value = M.value.size > 0, o.selectionEnd(j), e.selectionKeyPressed && (g = !1), $ = !1);
    }
    return (j, X) => (N(), D("div", {
      ref_key: "container",
      ref: T,
      class: Ie(["vue-flow__pane vue-flow__container", { selection: j.isSelecting }]),
      onClick: X[0] || (X[0] = (te) => E.value ? void 0 : q(ee, T.value)(te)),
      onContextmenu: X[1] || (X[1] = (te) => q(Z, T.value)(te)),
      onWheelPassive: X[2] || (X[2] = (te) => q(oe, T.value)(te)),
      onPointerenter: X[3] || (X[3] = (te) => E.value ? void 0 : h(o).paneMouseEnter(te)),
      onPointerdown: X[4] || (X[4] = (te) => E.value ? se(te) : h(o).paneMouseMove(te)),
      onPointermove: X[5] || (X[5] = (te) => E.value ? Y(te) : h(o).paneMouseMove(te)),
      onPointerup: X[6] || (X[6] = (te) => E.value ? J(te) : void 0),
      onPointerleave: X[7] || (X[7] = (te) => h(o).paneMouseLeave(te))
    }, [
      ze(j.$slots, "default"),
      h(r) && h(s) ? (N(), re(Nk, {
        key: 0,
        "user-selection-rect": h(s)
      }, null, 8, ["user-selection-rect"])) : Q("", !0),
      h(c) && h(d).length ? (N(), re(Tk, { key: 1 })) : Q("", !0)
    ], 34));
  }
}), Dk = {
  name: "Transform",
  compatConfig: { MODE: 3 }
}, Pk = /* @__PURE__ */ ye({
  ...Dk,
  setup(e) {
    const { viewport: t, fitViewOnInit: n, fitViewOnInitDone: i } = De(), o = U(() => n.value ? !i.value : !1), r = U(() => `translate(${t.value.x}px,${t.value.y}px) scale(${t.value.zoom})`);
    return (a, s) => (N(), D("div", {
      class: "vue-flow__transformationpane vue-flow__container",
      style: Be({ transform: r.value, opacity: o.value ? 0 : void 0 })
    }, [
      ze(a.$slots, "default")
    ], 4));
  }
}), Lk = {
  name: "Viewport",
  compatConfig: { MODE: 3 }
}, Vk = /* @__PURE__ */ ye({
  ...Lk,
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
      zoomOnDoubleClick: f,
      zoomOnPinch: p,
      zoomOnScroll: v,
      preventScrolling: y,
      noWheelClassName: m,
      noPanClassName: _,
      emits: x,
      connectionStartHandle: w,
      userSelectionActive: b,
      paneDragging: C,
      d3Zoom: I,
      d3Selection: B,
      d3ZoomHandler: T,
      viewport: M,
      viewportRef: V,
      paneClickDistance: O
    } = De();
    Sk(V);
    const E = nt(!1), F = nt(!1);
    let g = null, $ = !1, k = 0, H = {
      x: 0,
      y: 0,
      zoom: 0
    };
    const q = no(s), ee = no(a), Z = no(r), oe = Ne(
      () => (!ee.value || ee.value && a.value === !0) && (q.value || d.value)
    ), se = Ne(() => q.value || l.value), Y = Ne(() => a.value === !0 && oe.value !== !0), J = Ne(
      () => ee.value && a.value !== !0 || b.value || Y.value
    ), j = Ne(() => w.value !== null);
    Ue(() => {
      if (!V.value) {
        No("Viewport element is missing");
        return;
      }
      const we = V.value, $e = we.getBoundingClientRect(), ve = n_().clickDistance(O.value).scaleExtent([t.value, n.value]).translateExtent(o.value), me = pt(we).call(ve), L = me.on("wheel.zoom"), R = Mn.translate(i.value.x ?? 0, i.value.y ?? 0).scale(Bt(i.value.zoom ?? 1, t.value, n.value)), A = [
        [0, 0],
        [$e.width, $e.height]
      ], P = ve.constrain()(R, A, o.value);
      ve.transform(me, P), ve.wheelDelta(Qa), I.value = ve, B.value = me, T.value = L, M.value = { x: P.x, y: P.y, zoom: P.k }, ve.on("start", (W) => {
        var de;
        if (!W.sourceEvent)
          return null;
        k = W.sourceEvent.button, E.value = !0;
        const he = ae(W.transform);
        ((de = W.sourceEvent) == null ? void 0 : de.type) === "mousedown" && (C.value = !0), H = he, x.viewportChangeStart(he), x.moveStart({ event: W, flowTransform: he });
      }), ve.on("end", (W) => {
        if (!W.sourceEvent)
          return null;
        if (E.value = !1, C.value = !1, X(oe.value, k ?? 0) && !$ && x.paneContextMenu(W.sourceEvent), $ = !1, te(H, W.transform)) {
          const de = ae(W.transform);
          H = de, x.viewportChangeEnd(de), x.moveEnd({ event: W, flowTransform: de });
        }
      }), ve.filter((W) => {
        var de;
        const he = Z.value || v.value, ke = p.value && W.ctrlKey, be = W.button, Ee = W.type === "wheel";
        if (be === 1 && W.type === "mousedown" && (ue(W, "vue-flow__node") || ue(W, "vue-flow__edge")))
          return !0;
        if (!oe.value && !he && !se.value && !f.value && !p.value || b.value || j.value && !Ee || !f.value && W.type === "dblclick" || ue(W, m.value) && Ee || ue(W, _.value) && (!Ee || se.value && Ee && !Z.value) || !p.value && W.ctrlKey && Ee || !he && !se.value && !ke && Ee)
          return !1;
        if (!p && W.type === "touchstart" && ((de = W.touches) == null ? void 0 : de.length) > 1)
          return W.preventDefault(), !1;
        if (!oe.value && (W.type === "mousedown" || W.type === "touchstart") || Y.value && Array.isArray(d.value) && d.value.includes(0) && be === 0 || Array.isArray(d.value) && !d.value.includes(be) && (W.type === "mousedown" || W.type === "touchstart"))
          return !1;
        const Se = Array.isArray(d.value) && d.value.includes(be) || a.value === !0 && Array.isArray(d.value) && !d.value.includes(0) || !be || be <= 1;
        return (!W.ctrlKey || q.value || Ee) && Se;
      }), _e(
        [b, oe],
        () => {
          b.value && !E.value ? ve.on("zoom", null) : b.value || ve.on("zoom", (W) => {
            M.value = { x: W.transform.x, y: W.transform.y, zoom: W.transform.k };
            const de = ae(W.transform);
            $ = X(oe.value, k ?? 0), x.viewportChange(de), x.move({ event: W, flowTransform: de });
          });
        },
        { immediate: !0 }
      ), _e(
        [b, se, c, Z, p, y, m],
        () => {
          se.value && !Z.value && !b.value ? me.on(
            "wheel.zoom",
            (W) => {
              if (ue(W, m.value))
                return !1;
              const de = Z.value || v.value, he = p.value && W.ctrlKey;
              if (!(!y.value || se.value || de || he))
                return !1;
              W.preventDefault(), W.stopImmediatePropagation();
              const be = me.property("__zoom").k || 1, Ee = go();
              if (!q.value && W.ctrlKey && p.value && Ee) {
                const mr = kt(W), gr = Qa(W), Ro = be * 2 ** gr;
                ve.scaleTo(me, Ro, mr, W);
                return;
              }
              const Se = W.deltaMode === 1 ? 20 : 1;
              let Me = c.value === to.Vertical ? 0 : W.deltaX * Se, ht = c.value === to.Horizontal ? 0 : W.deltaY * Se;
              !Ee && W.shiftKey && c.value !== to.Vertical && !Me && ht && (Me = ht, ht = 0), ve.translateBy(
                me,
                -(Me / be) * u.value,
                -(ht / be) * u.value
              );
              const lt = ae(me.property("__zoom"));
              g && clearTimeout(g), F.value ? (x.move({ event: W, flowTransform: lt }), x.viewportChange(lt), g = setTimeout(() => {
                x.moveEnd({ event: W, flowTransform: lt }), x.viewportChangeEnd(lt), F.value = !1;
              }, 150)) : (F.value = !0, x.moveStart({ event: W, flowTransform: lt }), x.viewportChangeStart(lt));
            },
            { passive: !1 }
          ) : typeof L < "u" && me.on(
            "wheel.zoom",
            function(W, de) {
              const he = !y.value && W.type === "wheel" && !W.ctrlKey, ke = Z.value || v.value, be = p.value && W.ctrlKey;
              if (!ke && !l.value && !be && W.type === "wheel" || he || ue(W, m.value))
                return null;
              W.preventDefault(), L.call(this, W, de);
            },
            { passive: !1 }
          );
        },
        { immediate: !0 }
      );
    });
    function X(we, $e) {
      return $e === 2 && Array.isArray(we) && we.includes(2);
    }
    function te(we, $e) {
      return we.x !== $e.x && !Number.isNaN($e.x) || we.y !== $e.y && !Number.isNaN($e.y) || we.zoom !== $e.k && !Number.isNaN($e.k);
    }
    function ae(we) {
      return {
        x: we.x,
        y: we.y,
        zoom: we.k
      };
    }
    function ue(we, $e) {
      return we.target.closest(`.${$e}`);
    }
    return (we, $e) => (N(), D("div", {
      ref_key: "viewportRef",
      ref: V,
      class: "vue-flow__viewport vue-flow__container"
    }, [
      z(Rk, {
        "is-selecting": J.value,
        "selection-key-pressed": h(ee),
        class: Ie({
          connecting: j.value,
          dragging: h(C),
          draggable: h(d) === !0 || Array.isArray(h(d)) && h(d).includes(0)
        })
      }, {
        default: ne(() => [
          z(Pk, null, {
            default: ne(() => [
              ze(we.$slots, "default")
            ]),
            _: 3
          })
        ]),
        _: 3
      }, 8, ["is-selecting", "selection-key-pressed", "class"])
    ], 512));
  }
}), zk = ["id"], Bk = ["id"], Fk = ["id"], Hk = {
  name: "A11yDescriptions",
  compatConfig: { MODE: 3 }
}, qk = /* @__PURE__ */ ye({
  ...Hk,
  setup(e) {
    const { id: t, disableKeyboardA11y: n, ariaLiveMessage: i } = De();
    return (o, r) => (N(), D(le, null, [
      S("div", {
        id: `${h(Ef)}-${h(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select a node. " + K(h(n) ? "" : "You can then use the arrow keys to move the node around.") + " You can then use the arrow keys to move the node around, press delete to remove it and press escape to cancel. ", 9, zk),
      S("div", {
        id: `${h(xf)}-${h(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select an edge. You can then press delete to remove it or press escape to cancel. ", 8, Bk),
      h(n) ? Q("", !0) : (N(), D("div", {
        key: 0,
        id: `${h(l_)}-${h(t)}`,
        "aria-live": "assertive",
        "aria-atomic": "true",
        style: { position: "absolute", width: "1px", height: "1px", margin: "-1px", border: "0", padding: "0", overflow: "hidden", clip: "rect(0px, 0px, 0px, 0px)", "clip-path": "inset(100%)" }
      }, K(h(i)), 9, Fk))
    ], 64));
  }
});
function Uk() {
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
function Wk(e, t, n) {
  return n === ge.Left ? e - t : n === ge.Right ? e + t : e;
}
function Yk(e, t, n) {
  return n === ge.Top ? e - t : n === ge.Bottom ? e + t : e;
}
const Ks = function({
  radius: e = 10,
  centerX: t = 0,
  centerY: n = 0,
  position: i = ge.Top,
  type: o
}) {
  return Pe("circle", {
    class: `vue-flow__edgeupdater vue-flow__edgeupdater-${o}`,
    cx: Wk(t, e, i),
    cy: Yk(n, e, i),
    r: e,
    stroke: "transparent",
    fill: "transparent"
  });
};
Ks.props = ["radius", "centerX", "centerY", "position", "type"];
Ks.compatConfig = { MODE: 3 };
const Iu = Ks, Gk = ye({
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
      isValidConnection: f,
      multiSelectionActive: p,
      disableKeyboardA11y: v,
      elementsSelectable: y,
      edgesUpdatable: m,
      edgesFocusable: _,
      hooks: x
    } = De(), w = U(() => u(e.id)), { emit: b, on: C } = V_(w.value, r), I = Ht(sr), B = Ln(), T = G(!1), M = G(!1), V = G(""), O = G(null), E = G("source"), F = G(null), g = Ne(
      () => typeof w.value.selectable > "u" ? y.value : w.value.selectable
    ), $ = Ne(() => typeof w.value.updatable > "u" ? m.value : w.value.updatable), k = Ne(() => typeof w.value.focusable > "u" ? _.value : w.value.focusable);
    Zt(D_, e.id), Zt(P_, F);
    const H = U(() => w.value.class instanceof Function ? w.value.class(w.value) : w.value.class), q = U(() => w.value.style instanceof Function ? w.value.style(w.value) : w.value.style), ee = U(() => {
      const R = w.value.type || "default", A = I?.[`edge-${R}`];
      if (A)
        return A;
      let P = w.value.template ?? l.value[R];
      if (typeof P == "string" && B) {
        const W = Object.keys(B.appContext.components);
        W && W.includes(R) && (P = vd(R, !1));
      }
      return P && typeof P != "string" ? P : (r.error(new je(Ye.EDGE_TYPE_MISSING, P)), !1);
    }), { handlePointerDown: Z } = Hf({
      nodeId: V,
      handleId: O,
      type: E,
      isValidConnection: f,
      edgeUpdaterType: E,
      onEdgeUpdate: Y,
      onEdgeUpdateEnd: J
    });
    return () => {
      const R = d(w.value.source), A = d(w.value.target), P = "pathOptions" in w.value ? w.value.pathOptions : {};
      if (!R && !A)
        return r.error(new je(Ye.EDGE_SOURCE_TARGET_MISSING, w.value.id, w.value.source, w.value.target)), null;
      if (!R)
        return r.error(new je(Ye.EDGE_SOURCE_MISSING, w.value.id, w.value.source)), null;
      if (!A)
        return r.error(new je(Ye.EDGE_TARGET_MISSING, w.value.id, w.value.target)), null;
      if (!w.value || w.value.hidden || R.hidden || A.hidden)
        return null;
      let W;
      i.value === en.Strict ? W = R.handleBounds.source : W = [...R.handleBounds.source || [], ...R.handleBounds.target || []];
      const de = gu(W, w.value.sourceHandle);
      let he;
      i.value === en.Strict ? he = A.handleBounds.target : he = [...A.handleBounds.target || [], ...A.handleBounds.source || []];
      const ke = gu(he, w.value.targetHandle), be = de?.position || ge.Bottom, Ee = ke?.position || ge.Top, { x: Se, y: Me } = On(R, de, be), { x: ht, y: lt } = On(A, ke, Ee);
      return w.value.sourceX = Se, w.value.sourceY = Me, w.value.targetX = ht, w.value.targetY = lt, Pe(
        "g",
        {
          ref: F,
          key: e.id,
          "data-id": e.id,
          class: [
            "vue-flow__edge",
            `vue-flow__edge-${ee.value === !1 ? "default" : w.value.type || "default"}`,
            s.value,
            H.value,
            {
              updating: T.value,
              selected: w.value.selected,
              animated: w.value.animated,
              inactive: !g.value && !x.value.edgeClick.hasListeners()
            }
          ],
          tabIndex: k.value ? 0 : void 0,
          "aria-label": w.value.ariaLabel === null ? void 0 : w.value.ariaLabel ?? `Edge from ${w.value.source} to ${w.value.target}`,
          "aria-describedby": k.value ? `${xf}-${t}` : void 0,
          "aria-roledescription": "edge",
          role: k.value ? "group" : "img",
          ...w.value.domAttributes,
          onClick: X,
          onContextmenu: te,
          onDblclick: ae,
          onMouseenter: ue,
          onMousemove: we,
          onMouseleave: $e,
          onKeyDown: k.value ? L : void 0
        },
        [
          M.value ? null : Pe(ee.value === !1 ? l.value.default : ee.value, {
            id: e.id,
            sourceNode: R,
            targetNode: A,
            source: w.value.source,
            target: w.value.target,
            type: w.value.type,
            updatable: $.value,
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
            style: q.value,
            markerStart: `url('#${mo(w.value.markerStart, t)}')`,
            markerEnd: `url('#${mo(w.value.markerEnd, t)}')`,
            sourcePosition: be,
            targetPosition: Ee,
            sourceX: Se,
            sourceY: Me,
            targetX: ht,
            targetY: lt,
            sourceHandleId: w.value.sourceHandle,
            targetHandleId: w.value.targetHandle,
            interactionWidth: w.value.interactionWidth,
            ...P
          }),
          [
            $.value === "source" || $.value === !0 ? [
              Pe(
                "g",
                {
                  onMousedown: ve,
                  onMouseenter: oe,
                  onMouseout: se
                },
                Pe(Iu, {
                  position: be,
                  centerX: Se,
                  centerY: Me,
                  radius: o.value,
                  type: "source",
                  "data-type": "source"
                })
              )
            ] : null,
            $.value === "target" || $.value === !0 ? [
              Pe(
                "g",
                {
                  onMousedown: me,
                  onMouseenter: oe,
                  onMouseout: se
                },
                Pe(Iu, {
                  position: Ee,
                  centerX: ht,
                  centerY: lt,
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
    function Y(R, A) {
      b.update({ event: R, edge: w.value, connection: A });
    }
    function J(R) {
      b.updateEnd({ event: R, edge: w.value }), M.value = !1;
    }
    function j(R, A) {
      R.button === 0 && (M.value = !0, V.value = A ? w.value.target : w.value.source, O.value = (A ? w.value.targetHandle : w.value.sourceHandle) ?? null, E.value = A ? "target" : "source", b.updateStart({ event: R, edge: w.value }), Z(R));
    }
    function X(R) {
      var A;
      const P = { event: R, edge: w.value };
      g.value && (a.value = !1, w.value.selected && p.value ? (c([w.value]), (A = F.value) == null || A.blur()) : n([w.value])), b.click(P);
    }
    function te(R) {
      b.contextMenu({ event: R, edge: w.value });
    }
    function ae(R) {
      b.doubleClick({ event: R, edge: w.value });
    }
    function ue(R) {
      b.mouseEnter({ event: R, edge: w.value });
    }
    function we(R) {
      b.mouseMove({ event: R, edge: w.value });
    }
    function $e(R) {
      b.mouseLeave({ event: R, edge: w.value });
    }
    function ve(R) {
      j(R, !0);
    }
    function me(R) {
      j(R, !1);
    }
    function L(R) {
      var A;
      !v.value && $f.includes(R.key) && g.value && (R.key === "Escape" ? ((A = F.value) == null || A.blur(), c([u(e.id)])) : n([u(e.id)]));
    }
  }
}), jk = Gk, Xk = ye({
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
    } = De(), f = (e = Ht(sr)) == null ? void 0 : e["connection-line"], p = U(() => {
      var x;
      return d((x = i.value) == null ? void 0 : x.nodeId);
    }), v = U(() => {
      var x;
      return d((x = o.value) == null ? void 0 : x.nodeId) ?? null;
    }), y = U(() => ({
      x: (r.value.x - u.value.x) / u.value.zoom,
      y: (r.value.y - u.value.y) / u.value.zoom
    })), m = U(
      () => l.value.markerStart ? `url(#${mo(l.value.markerStart, t)})` : ""
    ), _ = U(
      () => l.value.markerEnd ? `url(#${mo(l.value.markerEnd, t)})` : ""
    );
    return () => {
      var x, w, b;
      if (!p.value || !i.value)
        return null;
      const C = i.value.id, I = i.value.type, B = p.value.handleBounds;
      let T = B?.[I] ?? [];
      if (n.value === en.Loose) {
        const q = B?.[I === "source" ? "target" : "source"] ?? [];
        T = [...T, ...q];
      }
      if (!T)
        return null;
      const M = (C ? T.find((q) => q.id === C) : T[0]) ?? null, V = M?.position ?? ge.Top, { x: O, y: E } = On(p.value, M, V);
      let F = null;
      v.value && (n.value === en.Strict ? F = ((x = v.value.handleBounds[I === "source" ? "target" : "source"]) == null ? void 0 : x.find(
        (q) => {
          var ee;
          return q.id === ((ee = o.value) == null ? void 0 : ee.id);
        }
      )) || null : F = ((w = [...v.value.handleBounds.source ?? [], ...v.value.handleBounds.target ?? []]) == null ? void 0 : w.find(
        (q) => {
          var ee;
          return q.id === ((ee = o.value) == null ? void 0 : ee.id);
        }
      )) || null);
      const g = ((b = o.value) == null ? void 0 : b.position) ?? (V ? es[V] : null);
      if (!V || !g)
        return null;
      const $ = a.value ?? l.value.type ?? nn.Bezier;
      let k = "";
      const H = {
        sourceX: O,
        sourceY: E,
        sourcePosition: V,
        targetX: y.value.x,
        targetY: y.value.y,
        targetPosition: g
      };
      return $ === nn.Bezier ? [k] = Xs(H) : $ === nn.Step ? [k] = ns({
        ...H,
        borderRadius: 0
      }) : $ === nn.SmoothStep ? [k] = ns(H) : $ === nn.SimpleBezier ? [k] = jf(H) : k = `M${O},${E} ${y.value.x},${y.value.y}`, Pe(
        "svg",
        { class: "vue-flow__edges vue-flow__connectionline vue-flow__container" },
        Pe(
          "g",
          { class: "vue-flow__connection" },
          f ? Pe(f, {
            sourceX: O,
            sourceY: E,
            sourcePosition: V,
            targetX: y.value.x,
            targetY: y.value.y,
            targetPosition: g,
            sourceNode: p.value,
            sourceHandle: M,
            targetNode: v.value,
            targetHandle: F,
            markerEnd: _.value,
            markerStart: m.value,
            connectionStatus: c.value
          }) : Pe("path", {
            d: k,
            class: [l.value.class, c.value, "vue-flow__connection-path"],
            style: {
              ...s.value,
              ...l.value.style
            },
            "marker-end": _.value,
            "marker-start": m.value
          })
        )
      );
    };
  }
}), Kk = Xk, Zk = ["id", "markerWidth", "markerHeight", "markerUnits", "orient"], Jk = {
  name: "MarkerType",
  compatConfig: { MODE: 3 }
}, Qk = /* @__PURE__ */ ye({
  ...Jk,
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
    return (t, n) => (N(), D("marker", {
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
      t.type === h(Mi).ArrowClosed ? (N(), D("polyline", {
        key: 0,
        style: Be({
          stroke: t.color,
          fill: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        points: "-5,-4 0,0 -5,4 -5,-4"
      }, null, 4)) : Q("", !0),
      t.type === h(Mi).Arrow ? (N(), D("polyline", {
        key: 1,
        style: Be({
          stroke: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        fill: "none",
        points: "-5,-4 0,0 -5,4"
      }, null, 4)) : Q("", !0)
    ], 8, Zk));
  }
}), eE = {
  class: "vue-flow__marker vue-flow__container",
  "aria-hidden": "true"
}, tE = {
  name: "MarkerDefinitions",
  compatConfig: { MODE: 3 }
}, nE = /* @__PURE__ */ ye({
  ...tE,
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
    return (a, s) => (N(), D("svg", eE, [
      S("defs", null, [
        (N(!0), D(le, null, Re(r.value, (l) => (N(), re(Qk, {
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
}), oE = {
  name: "Edges",
  compatConfig: { MODE: 3 }
}, iE = /* @__PURE__ */ ye({
  ...oE,
  setup(e) {
    const { findNode: t, getEdges: n, elevateEdgesOnSelect: i } = De();
    return (o, r) => (N(), D(le, null, [
      z(nE),
      (N(!0), D(le, null, Re(h(n), (a) => (N(), D("svg", {
        key: a.id,
        class: "vue-flow__edges vue-flow__container",
        style: Be({ zIndex: h(E_)(a, h(t), h(i)) })
      }, [
        z(h(jk), {
          id: a.id
        }, null, 8, ["id"])
      ], 4))), 128)),
      z(h(Kk))
    ], 64));
  }
}), rE = ye({
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
      nodeExtent: f,
      elevateNodesOnSelect: p,
      disableKeyboardA11y: v,
      ariaLiveMessage: y,
      snapToGrid: m,
      snapGrid: _,
      nodeDragThreshold: x,
      nodesDraggable: w,
      elementsSelectable: b,
      nodesConnectable: C,
      nodesFocusable: I,
      hooks: B
    } = De(), T = G(null);
    Zt(zf, T), Zt(js, e.id);
    const M = Ht(sr), V = Ln(), O = Uf(), { node: E, parentNode: F } = qf(e.id), { emit: g, on: $ } = F_(E, a), k = Ne(() => typeof E.draggable > "u" ? w.value : E.draggable), H = Ne(() => typeof E.selectable > "u" ? b.value : E.selectable), q = Ne(() => typeof E.connectable > "u" ? C.value : E.connectable), ee = Ne(() => typeof E.focusable > "u" ? I.value : E.focusable), Z = U(
      () => H.value || k.value || B.value.nodeClick.hasListeners() || B.value.nodeDoubleClick.hasListeners() || B.value.nodeMouseEnter.hasListeners() || B.value.nodeMouseMove.hasListeners() || B.value.nodeMouseLeave.hasListeners()
    ), oe = Ne(() => !!E.dimensions.width && !!E.dimensions.height), se = U(() => {
      const A = E.type || "default", P = M?.[`node-${A}`];
      if (P)
        return P;
      let W = E.template || d.value[A];
      if (typeof W == "string" && V) {
        const de = Object.keys(V.appContext.components);
        de && de.includes(A) && (W = vd(A, !1));
      }
      return W && typeof W != "string" ? W : (a.error(new je(Ye.NODE_TYPE_MISSING, W)), !1);
    }), Y = Bf({
      id: e.id,
      el: T,
      disabled: () => !k.value,
      selectable: H,
      dragHandle: () => E.dragHandle,
      onStart(A) {
        g.dragStart(A);
      },
      onDrag(A) {
        g.drag(A);
      },
      onStop(A) {
        g.dragStop(A);
      },
      onClick(A) {
        L(A);
      }
    }), J = U(() => E.class instanceof Function ? E.class(E) : E.class), j = U(() => {
      const A = (E.style instanceof Function ? E.style(E) : E.style) || {}, P = E.width instanceof Function ? E.width(E) : E.width, W = E.height instanceof Function ? E.height(E) : E.height;
      return !A.width && P && (A.width = typeof P == "string" ? P : `${P}px`), !A.height && W && (A.height = typeof W == "string" ? W : `${W}px`), A;
    }), X = Ne(() => Number(E.zIndex ?? j.value.zIndex ?? 0));
    return u((A) => {
      (A.includes(e.id) || !A.length) && ae();
    }), Ue(() => {
      _e(
        () => E.hidden,
        (A = !1, P, W) => {
          !A && T.value && (e.resizeObserver.observe(T.value), W(() => {
            T.value && e.resizeObserver.unobserve(T.value);
          }));
        },
        { immediate: !0, flush: "post" }
      );
    }), _e([() => E.type, () => E.sourcePosition, () => E.targetPosition], () => {
      Ve(() => {
        c([{ id: e.id, nodeElement: T.value, forceUpdate: !0 }]);
      });
    }), _e(
      [
        () => E.position.x,
        () => E.position.y,
        () => {
          var A;
          return (A = F.value) == null ? void 0 : A.computedPosition.x;
        },
        () => {
          var A;
          return (A = F.value) == null ? void 0 : A.computedPosition.y;
        },
        () => {
          var A;
          return (A = F.value) == null ? void 0 : A.computedPosition.z;
        },
        X,
        () => E.selected,
        () => E.dimensions.height,
        () => E.dimensions.width,
        () => {
          var A;
          return (A = F.value) == null ? void 0 : A.dimensions.height;
        },
        () => {
          var A;
          return (A = F.value) == null ? void 0 : A.dimensions.width;
        }
      ],
      ([A, P, W, de, he, ke]) => {
        const be = {
          x: A,
          y: P,
          z: ke + (p.value && E.selected ? 1e3 : 0)
        };
        typeof W < "u" && typeof de < "u" ? E.computedPosition = g_({ x: W, y: de, z: he }, be) : E.computedPosition = be;
      },
      { flush: "post", immediate: !0 }
    ), _e([() => E.extent, f], ([A, P], [W, de]) => {
      (A !== W || P !== de) && te();
    }), E.extent === "parent" || typeof E.extent == "object" && "range" in E.extent && E.extent.range === "parent" ? qa(() => oe).toBe(!0).then(te) : te(), () => E.hidden ? null : Pe(
      "div",
      {
        ref: T,
        "data-id": E.id,
        class: [
          "vue-flow__node",
          `vue-flow__node-${se.value === !1 ? "default" : E.type || "default"}`,
          {
            [n.value]: k.value,
            dragging: Y?.value,
            draggable: k.value,
            selected: E.selected,
            selectable: H.value,
            parent: E.isParent
          },
          J.value
        ],
        style: {
          visibility: oe.value ? "visible" : "hidden",
          zIndex: E.computedPosition.z ?? X.value,
          transform: `translate(${E.computedPosition.x}px,${E.computedPosition.y}px)`,
          pointerEvents: Z.value ? "all" : "none",
          ...j.value
        },
        tabIndex: ee.value ? 0 : void 0,
        role: ee.value ? "group" : void 0,
        "aria-describedby": v.value ? void 0 : `${Ef}-${t}`,
        "aria-label": E.ariaLabel,
        "aria-roledescription": "node",
        ...E.domAttributes,
        onMouseenter: ue,
        onMousemove: we,
        onMouseleave: $e,
        onContextmenu: ve,
        onClick: L,
        onDblclick: me,
        onKeydown: R
      },
      [
        Pe(se.value === !1 ? d.value.default : se.value, {
          id: E.id,
          type: E.type,
          data: E.data,
          events: { ...E.events, ...$ },
          selected: E.selected,
          resizing: E.resizing,
          dragging: Y.value,
          connectable: q.value,
          position: E.computedPosition,
          dimensions: E.dimensions,
          isValidTargetPos: E.isValidTargetPos,
          isValidSourcePos: E.isValidSourcePos,
          parent: E.parentNode,
          parentNodeId: E.parentNode,
          zIndex: E.computedPosition.z ?? X.value,
          targetPosition: E.targetPosition,
          sourcePosition: E.sourcePosition,
          label: E.label,
          dragHandle: E.dragHandle,
          onUpdateNodeInternals: ae
        })
      ]
    );
    function te() {
      const A = E.computedPosition, { computedPosition: P, position: W } = Ys(
        E,
        m.value ? ar(A, _.value) : A,
        a.error,
        f.value,
        F.value
      );
      (E.computedPosition.x !== P.x || E.computedPosition.y !== P.y) && (E.computedPosition = { ...E.computedPosition, ...P }), (E.position.x !== W.x || E.position.y !== W.y) && (E.position = W);
    }
    function ae() {
      T.value && c([{ id: e.id, nodeElement: T.value, forceUpdate: !0 }]);
    }
    function ue(A) {
      Y?.value || g.mouseEnter({ event: A, node: E });
    }
    function we(A) {
      Y?.value || g.mouseMove({ event: A, node: E });
    }
    function $e(A) {
      Y?.value || g.mouseLeave({ event: A, node: E });
    }
    function ve(A) {
      return g.contextMenu({ event: A, node: E });
    }
    function me(A) {
      return g.doubleClick({ event: A, node: E });
    }
    function L(A) {
      H.value && (!i.value || !k.value || x.value > 0) && ts(
        E,
        r.value,
        l,
        s,
        o,
        !1,
        T.value
      ), g.click({ event: A, node: E });
    }
    function R(A) {
      if (!(Ja(A) || v.value))
        if ($f.includes(A.key) && H.value) {
          const P = A.key === "Escape";
          ts(
            E,
            r.value,
            l,
            s,
            o,
            P,
            T.value
          );
        } else k.value && E.selected && Sn[A.key] && (A.preventDefault(), y.value = `Moved selected node ${A.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~E.position.x}, y: ${~~E.position.y}`, O(
          {
            x: Sn[A.key].x,
            y: Sn[A.key].y
          },
          A.shiftKey
        ));
    }
  }
}), aE = rE, sE = {
  height: "0",
  width: "0"
}, lE = {
  name: "EdgeLabelRenderer",
  compatConfig: { MODE: 3 }
}, uE = /* @__PURE__ */ ye({
  ...lE,
  setup(e) {
    const { viewportRef: t } = De(), n = Ne(() => {
      var i;
      return (i = t.value) == null ? void 0 : i.getElementsByClassName("vue-flow__edge-labels")[0];
    });
    return (i, o) => (N(), D("svg", null, [
      (N(), D("foreignObject", sE, [
        (N(), re(Dm, {
          to: n.value,
          disabled: !n.value
        }, [
          ze(i.$slots, "default")
        ], 8, ["to", "disabled"]))
      ]))
    ]));
  }
});
function cE(e = { includeHiddenNodes: !1 }) {
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
const dE = { class: "vue-flow__nodes vue-flow__container" }, fE = {
  name: "Nodes",
  compatConfig: { MODE: 3 }
}, hE = /* @__PURE__ */ ye({
  ...fE,
  setup(e) {
    const { getNodes: t, updateNodeDimensions: n, emits: i } = De(), o = cE(), r = G();
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
    }), (a, s) => (N(), D("div", dE, [
      r.value ? (N(!0), D(le, { key: 0 }, Re(h(t), (l, c, u, d) => {
        const f = [l.id];
        if (d && d.key === l.id && Vm(d, f))
          return d;
        const p = (N(), re(h(aE), {
          id: l.id,
          key: l.id,
          "resize-observer": r.value
        }, null, 8, ["id", "resize-observer"]));
        return p.memo = f, p;
      }, s, 0), 128)) : Q("", !0)
    ]));
  }
});
function pE() {
  const { emits: e } = De();
  Ue(() => {
    if (Vf()) {
      const t = document.querySelector(".vue-flow__pane");
      t && window.getComputedStyle(t).zIndex !== "1" && e.error(new je(Ye.MISSING_STYLES));
    }
  });
}
const vE = /* @__PURE__ */ S("div", { class: "vue-flow__edge-labels" }, null, -1), mE = {
  name: "VueFlow",
  compatConfig: { MODE: 3 }
}, Kf = /* @__PURE__ */ ye({
  ...mE,
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
    const i = e, o = pd(), r = Nr(i, "modelValue", n), a = Nr(i, "nodes", n), s = Nr(i, "edges", n), l = De(i), c = W_({ modelValue: r, nodes: a, edges: s }, i, l);
    return G_(n, l.hooks), Uk(), pE(), Zt(sr, o), Pm(c), t(l), (u, d) => (N(), D("div", {
      ref: h(l).vueFlowRef,
      class: "vue-flow"
    }, [
      z(Vk, null, {
        default: ne(() => [
          z(iE),
          vE,
          z(hE),
          ze(u.$slots, "zoom-pane")
        ]),
        _: 3
      }),
      ze(u.$slots, "default"),
      z(qk)
    ], 512));
  }
}), gE = {
  name: "Panel",
  compatConfig: { MODE: 3 }
}, Zf = /* @__PURE__ */ ye({
  ...gE,
  props: {
    position: {}
  },
  setup(e) {
    const t = e, { userSelectionActive: n } = De(), i = U(() => `${t.position}`.split("-"));
    return (o, r) => (N(), D("div", {
      class: Ie(["vue-flow__panel", i.value]),
      style: Be({ pointerEvents: h(n) ? "none" : "all" })
    }, [
      ze(o.$slots, "default")
    ], 6));
  }
}), yo = 216, Ao = 76, os = 64, Kn = 6, is = 10, zr = is * 2, Jf = 34, yE = 4, rs = 26, Pi = 304, wE = 20;
function Qf(e, t = !1) {
  const i = e.length > 1 || (e[0]?.id ?? "") !== "" ? Math.max(e.length, 1) : 0, o = t ? Jf : 0, r = Math.max(1, Math.floor((Pi - zr - o + Kn) / (os + Kn))), a = i ? Math.min(i, yE, r) : 0, s = i ? Math.ceil(i / a) : 0, l = i <= 2 ? yo : zr + o + a * os + (a - 1) * Kn, c = Math.min(Pi, Math.max(yo, l)), u = a ? Math.floor((c - zr - o - (a - 1) * Kn) / a) : 0;
  return {
    width: c,
    height: Ao + Math.max(0, s - 1) * rs,
    columns: a,
    rows: s,
    cellWidth: u
  };
}
const bE = ["title", "aria-label"], _E = ["title"], kE = {
  key: 2,
  class: "wfn-lock",
  title: "Workflow input/output step — locked and can’t be deleted"
}, EE = { class: "wfn-well" }, xE = {
  key: 0,
  class: "wfn-status wfn-status--ok",
  "aria-hidden": "true"
}, $E = {
  key: 1,
  class: "wfn-status wfn-status--fail",
  "aria-hidden": "true"
}, SE = { class: "wfn-body" }, CE = { class: "wfn-kind" }, NE = { class: "wfn-title" }, IE = {
  key: 0,
  class: "wfn-sub"
}, AE = {
  key: 3,
  class: "wfn-await"
}, TE = {
  key: 0,
  class: "wfn-portrow",
  role: "group",
  "aria-label": "Outputs"
}, ME = ["title"], OE = {
  key: 2,
  class: "wfn-failport"
}, RE = {
  key: 0,
  class: "wfn-faillabel"
}, eh = /* @__PURE__ */ ye({
  __name: "WorkflowNode",
  props: {
    data: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, n = U(() => t.data.outPorts.length > 1 || (t.data.outPorts[0]?.id ?? "") !== ""), i = U(() => t.data.boundaryRole), o = U(() => i.value !== "start"), r = U(() => i.value !== "finish" && i.value !== "error"), a = { position: "relative", transform: "none", left: "auto", top: "auto" }, s = { position: "relative", transform: "none", left: "auto", top: "auto", width: "9px", height: "9px" }, l = U(() => Qf(t.data.outPorts, t.data.failedPort)), c = U(() => ({
      width: `${l.value.width}px`,
      minHeight: `${l.value.height}px`,
      "--wfn-port-columns": String(l.value.columns),
      "--wfn-port-rows": String(l.value.rows),
      "--wfn-port-cell-width": `${l.value.cellWidth}px`,
      "--wfn-port-row-height": `${rs}px`,
      "--wfn-port-left": `${is}px`,
      "--wfn-port-right": `${is + (t.data.failedPort ? Jf : 0)}px`,
      "--wfn-port-gap": `${Kn}px`,
      "--wfn-port-min-width": `${os}px`,
      ...n.value ? {
        paddingBottom: `${wE + Math.max(0, l.value.rows - 1) * rs}px`
      } : {}
    }));
    return (u, d) => (N(), D("div", {
      class: Ie(["wfn", [
        `wfn--${e.data.kind}`,
        h(xd)(e.data.hueVar),
        e.selected && "wfn--selected",
        `is-${e.data.runStatus}`,
        n.value && "wfn--ports",
        e.data.failedPort && "wfn--has-failport",
        e.data.pinned && "wfn--pinned",
        e.data.failedWired && "wfn--failwired",
        e.data.issue && "wfn--issue",
        i.value && `wfn--boundary wfn--boundary-${i.value}`
      ]]),
      style: Be(c.value),
      title: e.data.issue || e.data.ref || e.data.title,
      role: "group",
      "aria-label": `${e.data.kindLabel}: ${e.data.title}${e.data.runStatus !== "idle" ? `, ${e.data.runStatus}` : ""}`
    }, [
      e.data.issue ? (N(), D("span", {
        key: 0,
        class: "wfn-issue",
        title: e.data.issue,
        "aria-hidden": "true"
      }, [
        z(h(ie), { icon: "tabler:alert-triangle" })
      ], 8, _E)) : Q("", !0),
      o.value ? (N(), D(le, { key: 1 }, [
        z(h(xt), {
          id: "in-top",
          type: "target",
          position: h(ge).Top,
          class: "wfn-port",
          "aria-label": "Connect into step",
          title: "Connect into step"
        }, null, 8, ["position"]),
        z(h(xt), {
          id: "in-left",
          type: "target",
          position: h(ge).Left,
          class: "wfn-port",
          "aria-label": "Connect into step",
          title: "Connect into step"
        }, null, 8, ["position"])
      ], 64)) : Q("", !0),
      d[1] || (d[1] = S("span", {
        class: "wfn-ring",
        "aria-hidden": "true"
      }, null, -1)),
      e.data.pinned ? (N(), D("span", kE, [
        z(h(ie), {
          icon: "tabler:lock",
          "aria-hidden": "true"
        })
      ])) : Q("", !0),
      S("div", EE, [
        z(h(ie), {
          icon: e.data.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        e.data.runStatus === "completed" ? (N(), D("span", xE, [
          z(h(ie), { icon: "tabler:check" })
        ])) : e.data.runStatus === "failed" ? (N(), D("span", $E, [
          z(h(ie), { icon: "tabler:x" })
        ])) : Q("", !0)
      ]),
      S("div", SE, [
        S("div", CE, K(e.data.kindLabel), 1),
        S("div", NE, K(e.data.title), 1),
        e.data.sub ? (N(), D("div", IE, K(e.data.sub), 1)) : Q("", !0)
      ]),
      e.data.runStatus === "awaiting" ? (N(), D("span", AE, [
        d[0] || (d[0] = S("span", {
          class: "wfn-await-pulse",
          "aria-hidden": "true"
        }, null, -1)),
        S("span", null, K(e.data.awaitingLabel || "Waiting for review"), 1)
      ])) : Q("", !0),
      r.value ? (N(), D(le, { key: 4 }, [
        n.value ? (N(), D("span", TE, [
          (N(!0), D(le, null, Re(e.data.outPorts, (f) => (N(), D("span", {
            key: f.id,
            class: "wfn-portslot"
          }, [
            z(h(xt), {
              id: f.id,
              type: "source",
              position: h(ge).Bottom,
              class: Ie(["wfn-port wfn-port--named", `wfn-port--${f.id}`]),
              style: a,
              "aria-label": `Connect from ${f.label}`,
              title: `Connect from ${f.label}`
            }, null, 8, ["id", "position", "class", "aria-label", "title"]),
            S("span", {
              class: "wfn-portlabel",
              title: f.label
            }, K(f.label), 9, ME)
          ]))), 128))
        ])) : (N(), D(le, { key: 1 }, [
          z(h(xt), {
            id: "out-bottom",
            type: "source",
            position: h(ge).Bottom,
            class: "wfn-port",
            "aria-label": "Connect from output",
            title: "Connect from output"
          }, null, 8, ["position"]),
          z(h(xt), {
            id: "out-right",
            type: "source",
            position: h(ge).Right,
            class: "wfn-port",
            "aria-label": "Connect from output",
            title: "Connect from output"
          }, null, 8, ["position"])
        ], 64)),
        e.data.failedPort ? (N(), D("span", OE, [
          z(h(xt), {
            id: "failed",
            type: "source",
            position: h(ge).Right,
            class: "wfn-port wfn-port--failed wfn-port--failaff",
            style: s,
            "aria-label": "Connect from Failed",
            title: "Connect from Failed"
          }, null, 8, ["position"]),
          e.data.failedWired ? (N(), D("span", RE, "Failed")) : Q("", !0)
        ])) : Q("", !0)
      ], 64)) : Q("", !0)
    ], 14, bE));
  }
});
var as = "http://www.w3.org/1999/xhtml";
const Au = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: as,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function th(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Au.hasOwnProperty(t) ? { space: Au[t], local: e } : e;
}
function DE(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === as && t.documentElement.namespaceURI === as ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function PE(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function nh(e) {
  var t = th(e);
  return (t.local ? PE : DE)(t);
}
function LE() {
}
function oh(e) {
  return e == null ? LE : function() {
    return this.querySelector(e);
  };
}
function VE(e) {
  typeof e != "function" && (e = oh(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = new Array(a), l, c, u = 0; u < a; ++u)
      (l = r[u]) && (c = e.call(l, l.__data__, u, r)) && ("__data__" in l && (c.__data__ = l.__data__), s[u] = c);
  return new ft(i, this._parents);
}
function zE(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function BE() {
  return [];
}
function FE(e) {
  return e == null ? BE : function() {
    return this.querySelectorAll(e);
  };
}
function HE(e) {
  return function() {
    return zE(e.apply(this, arguments));
  };
}
function qE(e) {
  typeof e == "function" ? e = HE(e) : e = FE(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), o.push(l));
  return new ft(i, o);
}
function UE(e) {
  return function() {
    return this.matches(e);
  };
}
function ih(e) {
  return function(t) {
    return t.matches(e);
  };
}
var WE = Array.prototype.find;
function YE(e) {
  return function() {
    return WE.call(this.children, e);
  };
}
function GE() {
  return this.firstElementChild;
}
function jE(e) {
  return this.select(e == null ? GE : YE(typeof e == "function" ? e : ih(e)));
}
var XE = Array.prototype.filter;
function KE() {
  return Array.from(this.children);
}
function ZE(e) {
  return function() {
    return XE.call(this.children, e);
  };
}
function JE(e) {
  return this.selectAll(e == null ? KE : ZE(typeof e == "function" ? e : ih(e)));
}
function QE(e) {
  typeof e != "function" && (e = UE(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new ft(i, this._parents);
}
function rh(e) {
  return new Array(e.length);
}
function ex() {
  return new ft(this._enter || this._groups.map(rh), this._parents);
}
function Li(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Li.prototype = {
  constructor: Li,
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
function tx(e) {
  return function() {
    return e;
  };
}
function nx(e, t, n, i, o, r) {
  for (var a = 0, s, l = t.length, c = r.length; a < c; ++a)
    (s = t[a]) ? (s.__data__ = r[a], i[a] = s) : n[a] = new Li(e, r[a]);
  for (; a < l; ++a)
    (s = t[a]) && (o[a] = s);
}
function ox(e, t, n, i, o, r, a) {
  var s, l, c = /* @__PURE__ */ new Map(), u = t.length, d = r.length, f = new Array(u), p;
  for (s = 0; s < u; ++s)
    (l = t[s]) && (f[s] = p = a.call(l, l.__data__, s, t) + "", c.has(p) ? o[s] = l : c.set(p, l));
  for (s = 0; s < d; ++s)
    p = a.call(e, r[s], s, r) + "", (l = c.get(p)) ? (i[s] = l, l.__data__ = r[s], c.delete(p)) : n[s] = new Li(e, r[s]);
  for (s = 0; s < u; ++s)
    (l = t[s]) && c.get(f[s]) === l && (o[s] = l);
}
function ix(e) {
  return e.__data__;
}
function rx(e, t) {
  if (!arguments.length) return Array.from(this, ix);
  var n = t ? ox : nx, i = this._parents, o = this._groups;
  typeof e != "function" && (e = tx(e));
  for (var r = o.length, a = new Array(r), s = new Array(r), l = new Array(r), c = 0; c < r; ++c) {
    var u = i[c], d = o[c], f = d.length, p = ax(e.call(u, u && u.__data__, c, i)), v = p.length, y = s[c] = new Array(v), m = a[c] = new Array(v), _ = l[c] = new Array(f);
    n(u, d, y, m, _, p, t);
    for (var x = 0, w = 0, b, C; x < v; ++x)
      if (b = y[x]) {
        for (x >= w && (w = x + 1); !(C = m[w]) && ++w < v; ) ;
        b._next = C || null;
      }
  }
  return a = new ft(a, i), a._enter = s, a._exit = l, a;
}
function ax(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function sx() {
  return new ft(this._exit || this._groups.map(rh), this._parents);
}
function lx(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function ux(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), s = new Array(o), l = 0; l < a; ++l)
    for (var c = n[l], u = i[l], d = c.length, f = s[l] = new Array(d), p, v = 0; v < d; ++v)
      (p = c[v] || u[v]) && (f[v] = p);
  for (; l < o; ++l)
    s[l] = n[l];
  return new ft(s, this._parents);
}
function cx() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function dx(e) {
  e || (e = fx);
  function t(d, f) {
    return d && f ? e(d.__data__, f.__data__) : !d - !f;
  }
  for (var n = this._groups, i = n.length, o = new Array(i), r = 0; r < i; ++r) {
    for (var a = n[r], s = a.length, l = o[r] = new Array(s), c, u = 0; u < s; ++u)
      (c = a[u]) && (l[u] = c);
    l.sort(t);
  }
  return new ft(o, this._parents).order();
}
function fx(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function hx() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function px() {
  return Array.from(this);
}
function vx() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a) return a;
    }
  return null;
}
function mx() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function gx() {
  return !this.node();
}
function yx(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, s; r < a; ++r)
      (s = o[r]) && e.call(s, s.__data__, r, o);
  return this;
}
function wx(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function bx(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function _x(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function kx(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function Ex(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function xx(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function $x(e, t) {
  var n = th(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? bx : wx : typeof t == "function" ? n.local ? xx : Ex : n.local ? kx : _x)(n, t));
}
function ah(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function Sx(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Cx(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function Nx(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function Ix(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? Sx : typeof t == "function" ? Nx : Cx)(e, t, n ?? "")) : Ax(this.node(), e);
}
function Ax(e, t) {
  return e.style.getPropertyValue(t) || ah(e).getComputedStyle(e, null).getPropertyValue(t);
}
function Tx(e) {
  return function() {
    delete this[e];
  };
}
function Mx(e, t) {
  return function() {
    this[e] = t;
  };
}
function Ox(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function Rx(e, t) {
  return arguments.length > 1 ? this.each((t == null ? Tx : typeof t == "function" ? Ox : Mx)(e, t)) : this.node()[e];
}
function sh(e) {
  return e.trim().split(/^|\s+/);
}
function Zs(e) {
  return e.classList || new lh(e);
}
function lh(e) {
  this._node = e, this._names = sh(e.getAttribute("class") || "");
}
lh.prototype = {
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
function uh(e, t) {
  for (var n = Zs(e), i = -1, o = t.length; ++i < o; ) n.add(t[i]);
}
function ch(e, t) {
  for (var n = Zs(e), i = -1, o = t.length; ++i < o; ) n.remove(t[i]);
}
function Dx(e) {
  return function() {
    uh(this, e);
  };
}
function Px(e) {
  return function() {
    ch(this, e);
  };
}
function Lx(e, t) {
  return function() {
    (t.apply(this, arguments) ? uh : ch)(this, e);
  };
}
function Vx(e, t) {
  var n = sh(e + "");
  if (arguments.length < 2) {
    for (var i = Zs(this.node()), o = -1, r = n.length; ++o < r; ) if (!i.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? Lx : t ? Dx : Px)(n, t));
}
function zx() {
  this.textContent = "";
}
function Bx(e) {
  return function() {
    this.textContent = e;
  };
}
function Fx(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function Hx(e) {
  return arguments.length ? this.each(e == null ? zx : (typeof e == "function" ? Fx : Bx)(e)) : this.node().textContent;
}
function qx() {
  this.innerHTML = "";
}
function Ux(e) {
  return function() {
    this.innerHTML = e;
  };
}
function Wx(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function Yx(e) {
  return arguments.length ? this.each(e == null ? qx : (typeof e == "function" ? Wx : Ux)(e)) : this.node().innerHTML;
}
function Gx() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function jx() {
  return this.each(Gx);
}
function Xx() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Kx() {
  return this.each(Xx);
}
function Zx(e) {
  var t = typeof e == "function" ? e : nh(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function Jx() {
  return null;
}
function Qx(e, t) {
  var n = typeof e == "function" ? e : nh(e), i = t == null ? Jx : typeof t == "function" ? t : oh(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function e$() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function t$() {
  return this.each(e$);
}
function n$() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function o$() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function i$(e) {
  return this.select(e ? o$ : n$);
}
function r$(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function a$(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function s$(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function l$(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function u$(e, t, n) {
  return function() {
    var i = this.__on, o, r = a$(t);
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
function c$(e, t, n) {
  var i = s$(e + ""), o, r = i.length, a;
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
  for (s = t ? u$ : l$, o = 0; o < r; ++o) this.each(s(i[o], t, n));
  return this;
}
function dh(e, t, n) {
  var i = ah(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function d$(e, t) {
  return function() {
    return dh(this, e, t);
  };
}
function f$(e, t) {
  return function() {
    return dh(this, e, t.apply(this, arguments));
  };
}
function h$(e, t) {
  return this.each((typeof t == "function" ? f$ : d$)(e, t));
}
function* p$() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var v$ = [null];
function ft(e, t) {
  this._groups = e, this._parents = t;
}
function m$() {
  return this;
}
ft.prototype = {
  constructor: ft,
  select: VE,
  selectAll: qE,
  selectChild: jE,
  selectChildren: JE,
  filter: QE,
  data: rx,
  enter: ex,
  exit: sx,
  join: lx,
  merge: ux,
  selection: m$,
  order: cx,
  sort: dx,
  call: hx,
  nodes: px,
  node: vx,
  size: mx,
  empty: gx,
  each: yx,
  attr: $x,
  style: Ix,
  property: Rx,
  classed: Vx,
  text: Hx,
  html: Yx,
  raise: jx,
  lower: Kx,
  append: Zx,
  insert: Qx,
  remove: t$,
  clone: i$,
  datum: r$,
  on: c$,
  dispatch: h$,
  [Symbol.iterator]: p$
};
function wo(e) {
  return typeof e == "string" ? new ft([[document.querySelector(e)]], [document.documentElement]) : new ft([[e]], v$);
}
function g$(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Tu(e, t) {
  if (e = g$(e), t === void 0 && (t = e.currentTarget), t) {
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
var y$ = { value: () => {
} };
function fh() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new fi(n);
}
function fi(e) {
  this._ = e;
}
function w$(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", o = n.indexOf(".");
    if (o >= 0 && (i = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
fi.prototype = fh.prototype = {
  constructor: fi,
  on: function(e, t) {
    var n = this._, i = w$(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; ) if ((o = (e = i[r]).type) && (o = b$(n[o], e.name))) return o;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++r < a; )
      if (o = (e = i[r]).type) n[o] = Mu(n[o], e.name, t);
      else if (t == null) for (o in n) n[o] = Mu(n[o], e.name, null);
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
function b$(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function Mu(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = y$, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
const _$ = { passive: !1 }, bo = { capture: !0, passive: !1 };
function Br(e) {
  e.stopImmediatePropagation();
}
function Cn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function k$(e) {
  var t = e.document.documentElement, n = wo(e).on("dragstart.drag", Cn, bo);
  "onselectstart" in t ? n.on("selectstart.drag", Cn, bo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function E$(e, t) {
  var n = e.document.documentElement, i = wo(e).on("dragstart.drag", null);
  t && (i.on("click.drag", Cn, bo), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const Ko = (e) => () => e;
function ss(e, {
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
ss.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function x$(e) {
  return !e.ctrlKey && !e.button;
}
function $$() {
  return this.parentNode;
}
function S$(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function C$() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function N$() {
  var e = x$, t = $$, n = S$, i = C$, o = {}, r = fh("start", "drag", "end"), a = 0, s, l, c, u, d = 0;
  function f(b) {
    b.on("mousedown.drag", p).filter(i).on("touchstart.drag", m).on("touchmove.drag", _, _$).on("touchend.drag touchcancel.drag", x).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function p(b, C) {
    if (!(u || !e.call(this, b, C))) {
      var I = w(this, t.call(this, b, C), b, C, "mouse");
      I && (wo(b.view).on("mousemove.drag", v, bo).on("mouseup.drag", y, bo), k$(b.view), Br(b), c = !1, s = b.clientX, l = b.clientY, I("start", b));
    }
  }
  function v(b) {
    if (Cn(b), !c) {
      var C = b.clientX - s, I = b.clientY - l;
      c = C * C + I * I > d;
    }
    o.mouse("drag", b);
  }
  function y(b) {
    wo(b.view).on("mousemove.drag mouseup.drag", null), E$(b.view, c), Cn(b), o.mouse("end", b);
  }
  function m(b, C) {
    if (e.call(this, b, C)) {
      var I = b.changedTouches, B = t.call(this, b, C), T = I.length, M, V;
      for (M = 0; M < T; ++M)
        (V = w(this, B, b, C, I[M].identifier, I[M])) && (Br(b), V("start", b, I[M]));
    }
  }
  function _(b) {
    var C = b.changedTouches, I = C.length, B, T;
    for (B = 0; B < I; ++B)
      (T = o[C[B].identifier]) && (Cn(b), T("drag", b, C[B]));
  }
  function x(b) {
    var C = b.changedTouches, I = C.length, B, T;
    for (u && clearTimeout(u), u = setTimeout(function() {
      u = null;
    }, 500), B = 0; B < I; ++B)
      (T = o[C[B].identifier]) && (Br(b), T("end", b, C[B]));
  }
  function w(b, C, I, B, T, M) {
    var V = r.copy(), O = Tu(M || I, C), E, F, g;
    if ((g = n.call(b, new ss("beforestart", {
      sourceEvent: I,
      target: f,
      identifier: T,
      active: a,
      x: O[0],
      y: O[1],
      dx: 0,
      dy: 0,
      dispatch: V
    }), B)) != null)
      return E = g.x - O[0] || 0, F = g.y - O[1] || 0, function $(k, H, q) {
        var ee = O, Z;
        switch (k) {
          case "start":
            o[T] = $, Z = a++;
            break;
          case "end":
            delete o[T], --a;
          case "drag":
            O = Tu(q || H, C), Z = a;
            break;
        }
        V.call(
          k,
          b,
          new ss(k, {
            sourceEvent: H,
            subject: g,
            target: f,
            identifier: T,
            active: Z,
            x: O[0] + E,
            y: O[1] + F,
            dx: O[0] - ee[0],
            dy: O[1] - ee[1],
            dispatch: V
          }),
          B
        );
      };
  }
  return f.filter = function(b) {
    return arguments.length ? (e = typeof b == "function" ? b : Ko(!!b), f) : e;
  }, f.container = function(b) {
    return arguments.length ? (t = typeof b == "function" ? b : Ko(b), f) : t;
  }, f.subject = function(b) {
    return arguments.length ? (n = typeof b == "function" ? b : Ko(b), f) : n;
  }, f.touchable = function(b) {
    return arguments.length ? (i = typeof b == "function" ? b : Ko(!!b), f) : i;
  }, f.on = function() {
    var b = r.on.apply(r, arguments);
    return b === r ? f : b;
  }, f.clickDistance = function(b) {
    return arguments.length ? (d = (b = +b) * b, f) : Math.sqrt(d);
  }, f;
}
var hn = /* @__PURE__ */ ((e) => (e.Line = "line", e.Handle = "handle", e))(hn || {});
function I$({ width: e, prevWidth: t, height: n, prevHeight: i, invertX: o, invertY: r }) {
  const a = e - t, s = n - i, l = [a > 0 ? 1 : a < 0 ? -1 : 0, s > 0 ? 1 : s < 0 ? -1 : 0];
  return a && o && (l[0] = l[0] * -1), s && r && (l[1] = l[1] * -1), l;
}
const A$ = {
  [hn.Line]: "right",
  [hn.Handle]: "bottom-right"
}, T$ = {
  [hn.Line]: "borderColor",
  [hn.Handle]: "backgroundColor"
}, M$ = {
  name: "ResizeControl",
  compatConfig: { MODE: 3 }
}, Ou = /* @__PURE__ */ ye({
  ...M$,
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
    }, { findNode: r, emits: a, viewport: s, noDragClassName: l } = De(), c = Ff(), u = G();
    let d = o, f = i;
    const p = Ne(() => n.position ?? A$[n.variant]), v = U(() => p.value.split("-")), y = Ne(() => n.color ? { [T$[n.variant]]: n.color } : {}), m = Ne(() => n.variant === hn.Handle), _ = U(() => m.value && n.autoScale ? `${Math.max(1 / s.value.zoom, 1)}` : void 0);
    return md((x) => {
      if (!u.value || !n.nodeId)
        return;
      const w = wo(u.value), b = p.value.includes("right") || p.value.includes("left"), C = p.value.includes("bottom") || p.value.includes("top"), I = p.value.includes("left"), B = p.value.includes("top"), T = N$().on("start", (M) => {
        const V = r(n.nodeId), { xSnapped: O, ySnapped: E } = c(M);
        f = {
          width: V?.dimensions.width ?? 0,
          height: V?.dimensions.height ?? 0,
          x: V?.position.x ?? 0,
          y: V?.position.y ?? 0
        }, d = {
          ...f,
          pointerX: O,
          pointerY: E,
          aspectRatio: f.width / f.height
        }, t("resizeStart", { event: M, params: f });
      }).on("drag", (M) => {
        var V;
        const { xSnapped: O, ySnapped: E } = c(M), F = r(n.nodeId);
        if (F) {
          const g = [], {
            pointerX: $,
            pointerY: k,
            width: H,
            height: q,
            x: ee,
            y: Z,
            aspectRatio: oe
          } = d, { x: se, y: Y, width: J, height: j } = f, X = Math.floor(b ? O - $ : 0), te = Math.floor(C ? E - k : 0);
          let ae = Bt(H + (I ? -X : X), n.minWidth, n.maxWidth), ue = Bt(q + (B ? -te : te), n.minHeight, n.maxHeight);
          if (n.keepAspectRatio) {
            const R = ae / ue;
            let A = oe;
            typeof n.keepAspectRatio == "number" && R !== n.keepAspectRatio && (A = n.keepAspectRatio);
            const P = b && C, W = b && !C, de = C && !b;
            ae = R <= A && P || de ? ue * A : ae, ue = R > A && P || W ? ae / A : ue, ae >= n.maxWidth ? (ae = n.maxWidth, ue = n.maxWidth / A) : ae <= n.minWidth && (ae = n.minWidth, ue = n.minWidth / A), ue >= n.maxHeight ? (ue = n.maxHeight, ae = n.maxHeight * A) : ue <= n.minHeight && (ue = n.minHeight, ae = n.minHeight * A);
          }
          const we = ae !== J, $e = ue !== j;
          if (I || B) {
            const R = I ? ee - (ae - H) : ee, A = B ? Z - (ue - q) : Z, P = R !== se && we, W = A !== Y && $e;
            if (P || W) {
              const de = {
                id: F.id,
                type: "position",
                from: F.position,
                position: {
                  x: P ? R : se,
                  y: W ? A : Y
                }
              };
              g.push(de), f.x = de.position.x, f.y = de.position.y;
            }
          }
          if (n.nodeId && (we || $e)) {
            const R = {
              id: n.nodeId,
              type: "dimensions",
              updateStyle: !0,
              resizing: !0,
              dimensions: {
                width: ae,
                height: ue
              }
            };
            g.push(R), f.width = ae, f.height = ue;
          }
          if (g.length === 0)
            return;
          const ve = I$({
            width: f.width,
            prevWidth: J,
            height: f.height,
            prevHeight: j,
            invertX: I,
            invertY: B
          }), me = { ...f, direction: ve };
          if (((V = n.shouldResize) == null ? void 0 : V.call(n, M, me)) === !1)
            return;
          t("resize", { event: M, params: me }), a.nodesChange(g);
        }
      }).on("end", (M) => {
        if (n.nodeId) {
          const V = {
            id: n.nodeId,
            type: "dimensions",
            resizing: !1
          };
          t("resizeEnd", { event: M, params: f }), a.nodesChange([V]);
        }
      });
      w.call(T), x(() => {
        w.on(".drag", null);
      });
    }), (x, w) => (N(), D("div", {
      ref_key: "resizeControlRef",
      ref: u,
      class: Ie(["vue-flow__resize-control", [...v.value, x.variant, h(l)]]),
      style: Be({
        ...y.value,
        scale: _.value
      })
    }, [
      ze(x.$slots, "default")
    ], 6));
  }
}), O$ = {
  name: "NodeResizer",
  compatConfig: { MODE: 3 },
  inheritAttrs: !1
}, hh = /* @__PURE__ */ ye({
  ...O$,
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
    const n = e, { findNode: i, emits: o } = De(), r = ["top-left", "top-right", "bottom-left", "bottom-right"], a = ["top", "right", "bottom", "left"], s = Ht(js, null), l = Ne(() => typeof n.nodeId == "string" ? n.nodeId : s), c = U(() => i(l.value));
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
      ([u, d, f, p, v]) => {
        const y = c.value;
        if (y && v) {
          const m = {
            id: y.id,
            type: "dimensions",
            updateStyle: !0,
            dimensions: {
              width: y.dimensions.width,
              height: y.dimensions.height
            }
          };
          u && y.dimensions.width < u && (m.dimensions.width = u), d && y.dimensions.height < d && (m.dimensions.height = d), f && y.dimensions.width > f && (m.dimensions.width = f), p && y.dimensions.height > p && (m.dimensions.height = p), (m.dimensions.width !== y.dimensions.width || m.dimensions.height !== y.dimensions.height) && o.nodesChange([m]);
        }
      },
      { flush: "post", immediate: !0 }
    ), (u, d) => u.isVisible ? (N(), D(le, { key: 0 }, [
      (N(), D(le, null, Re(a, (f) => z(Ou, {
        key: f,
        class: Ie(u.lineClassName),
        style: Be(u.lineStyle),
        "node-id": l.value,
        position: f,
        variant: h(hn).Line,
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
      (N(), D(le, null, Re(r, (f) => z(Ou, {
        key: f,
        class: Ie(u.handleClassName),
        style: Be(u.handleStyle),
        "node-id": l.value,
        position: f,
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
    ], 64)) : Q("", !0);
  }
}), Js = [
  { key: "amber", hue: "var(--wf-amber)" },
  { key: "teal", hue: "var(--wf-teal)" },
  { key: "blue", hue: "var(--wf-blue)" },
  { key: "violet", hue: "var(--wf-violet)" },
  { key: "rose", hue: "var(--wf-rose)" },
  { key: "slate", hue: "var(--wf-muted)" }
];
function R$(e) {
  return Js.find((t) => t.key === e)?.hue || "var(--wf-amber)";
}
function Qs(e) {
  return `wf-note--${Js.find((n) => n.key === e)?.key || "amber"}`;
}
const ph = 200, vh = 120, mh = "wfPersistNoteSize";
function gh(e, t) {
  const n = U(() => R$(t().color)), i = Ht(mh, null);
  function o(r) {
    const a = r.params;
    i?.(e, a.x, a.y, a.width, a.height);
  }
  return { hue: n, onResizeEnd: o };
}
const D$ = ["source"], P$ = {
  key: 1,
  class: "wf-note-empty"
}, yh = /* @__PURE__ */ ye({
  __name: "NoteNode",
  props: {
    id: {},
    data: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, { hue: n, onResizeEnd: i } = gh(t.id, () => t.data);
    return Ue(() => {
      Ki("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (o, r) => (N(), D(le, null, [
      z(h(hh), {
        "min-width": h(ph),
        "min-height": h(vh),
        "is-visible": !!e.selected,
        color: h(n),
        onResizeEnd: h(i)
      }, null, 8, ["min-width", "min-height", "is-visible", "color", "onResizeEnd"]),
      S("div", {
        class: Ie(["wf-note", [e.selected && "wf-note--selected", h(Qs)(e.data.color)]])
      }, [
        t.data.text ? (N(), D("wc-render-markdown", {
          key: 0,
          class: "wf-note-md",
          source: t.data.text
        }, null, 8, D$)) : (N(), D("div", P$, "Empty note — write markdown in the panel"))
      ], 2)
    ], 64));
  }
}), L$ = { class: "wf-frame-title" }, wh = /* @__PURE__ */ ye({
  __name: "FrameNode",
  props: {
    id: {},
    data: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, { hue: n, onResizeEnd: i } = gh(t.id, () => t.data), o = U(() => (t.data.text || "").split(`
`)[0]?.trim() || "");
    return (r, a) => (N(), D(le, null, [
      z(h(hh), {
        "min-width": h(ph),
        "min-height": h(vh),
        "is-visible": !!e.selected,
        color: h(n),
        onResizeEnd: h(i)
      }, null, 8, ["min-width", "min-height", "is-visible", "color", "onResizeEnd"]),
      S("div", {
        class: Ie(["wf-frame", [e.selected && "wf-frame--selected", h(Qs)(e.data.color)]])
      }, [
        S("div", L$, K(o.value || "Frame"), 1)
      ], 2)
    ], 64));
  }
}), V$ = { class: "wf-container-head" }, z$ = { class: "wf-container-kind" }, B$ = {
  key: 0,
  class: "wf-container-label"
}, bh = /* @__PURE__ */ ye({
  __name: "ContainerNode",
  props: {
    data: {}
  },
  setup(e) {
    return (t, n) => (N(), D("div", {
      class: Ie(["wf-container", `wf-container--${e.data.kind}`])
    }, [
      S("div", V$, [
        z(h(ie), {
          icon: e.data.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        S("span", z$, K(e.data.kind === "cycle" ? "Loop" : "For each"), 1),
        e.data.label ? (N(), D("span", B$, K(e.data.label), 1)) : Q("", !0)
      ])
    ], 2));
  }
});
function F$(e, t, n, i, o, r, a = 1) {
  const s = n - e, l = i - t, c = Math.max(Math.hypot(s, l), 1);
  let u = -l / c, d = s / c;
  d > 0 && (u = -u, d = -d);
  const f = 48 / Math.max(a, 0.1);
  return {
    x: e + s * 0.35 + u * f,
    y: t + l * 0.35 + d * f
  };
}
const H$ = ["title"], _h = /* @__PURE__ */ ye({
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
    const t = e, { getViewport: n } = De(), i = U(() => Xs({
      sourceX: t.sourceX,
      sourceY: t.sourceY,
      sourcePosition: t.sourcePosition || ge.Bottom,
      targetX: t.targetX,
      targetY: t.targetY,
      targetPosition: t.targetPosition || ge.Top,
      curvature: t.curvature
    })), o = U(() => t.data?.unmappedRequired?.length || 0), r = U(() => t.data?.contractUnavailable === !0), a = U(() => F$(
      t.sourceX,
      t.sourceY,
      t.targetX,
      t.targetY,
      i.value[1],
      i.value[2],
      n().zoom
    ));
    return (s, l) => (N(), D(le, null, [
      z(h(Io), {
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
      o.value || r.value ? (N(), re(h(uE), { key: 0 }, {
        default: ne(() => [
          S("span", {
            class: Ie(["wf-edge-completeness-badge", r.value && "is-contract-unavailable"]),
            title: r.value ? "This step’s input fields are unavailable" : `${o.value} required field${o.value === 1 ? "" : "s"} need mapping`,
            style: Be({ transform: `translate(-50%, -50%) translate(${a.value.x}px, ${a.value.y}px)` })
          }, K(r.value ? "!" : o.value), 15, H$)
        ]),
        _: 1
      })) : Q("", !0)
    ], 64));
  }
});
function ct(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function zn(e) {
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
function el(e) {
  const t = e.type;
  return typeof t == "string" && t ? t : Array.isArray(t) && t.length && typeof t[0] == "string" ? t[0] : ct(e.properties) ? "object" : "any";
}
function kh(e, t, n, i, o) {
  const r = ct(e.properties);
  if (!r) return [];
  const a = [];
  for (const [s, l] of Object.entries(r)) {
    const c = ct(l) || {}, u = n ? `${n}.${s}` : s, d = el(c), f = d === "object" && ct(c.properties) && i + 1 < o ? kh(c, t, u, i + 1, o) : [];
    a.push({
      name: s,
      path: u,
      expr: `${t}.${u}`,
      type: d,
      description: typeof c.description == "string" ? c.description : void 0,
      depth: i,
      children: f,
      expandable: f.length > 0
    });
  }
  return a;
}
function Eh(e, t = "output", n = 4) {
  const i = zn(e);
  return i ? kh(i, t, "", 0, n) : [];
}
function q$(e, t = "output") {
  const n = zn(e);
  if (!n || ct(n.properties)) return null;
  const i = el(n);
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
function To(e) {
  const t = zn(e);
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
function U$(e, t) {
  const n = e ?? "";
  if (t === "number" || t === "integer") {
    const i = Number(n);
    return Number.isFinite(i) && n.trim() !== "" ? String(i) : "0";
  }
  return t === "boolean" ? n === "true" || n === "1" ? "true" : "false" : JSON.stringify(String(n));
}
function xh(e) {
  return e.mode === "skip" ? null : e.mode === "expr" ? (e.value || "").trim() || null : (e.value ?? "") === "" ? null : U$(e.value, e.type);
}
function ls(e) {
  const t = [];
  for (const n of e) {
    if (!n.key) continue;
    const i = xh(n);
    i !== null && t.push(`${n.key}: ${i}`);
  }
  return t.length ? `{ ${t.join(", ")} }` : "";
}
function W$(e) {
  return e.map((t) => ({ key: t.key, mode: t.required ? "static" : "skip", value: "", type: t.type }));
}
function tl(e, t) {
  const n = new Map(t.map((o) => [o.key, o])), i = [];
  for (const o of e) {
    if (!o.required) continue;
    const r = n.get(o.key);
    (!r || xh(r) === null) && i.push(o.title || o.key);
  }
  return i;
}
function Y$(e, t) {
  const n = tl(e, t);
  return n.length ? `${n.length} required field${n.length === 1 ? "" : "s"} unmapped` : "";
}
function $h(e, t, n = "output") {
  const i = zn(e), o = i ? ct(i.properties) : null;
  if (!o) return [];
  const r = [];
  for (const a of To(t)) {
    const s = ct(o[a.key]);
    if (!s) continue;
    const l = el(s), c = a.type || "any";
    nl(l, c) && r.push({ key: a.key, mode: "expr", value: `${n}.${a.key}`, type: a.type });
  }
  return r;
}
function nl(e, t) {
  if (e === t) return !0;
  const n = /* @__PURE__ */ new Set(["number", "integer"]);
  return !!(n.has(e) && n.has(t) || e === "any" || t === "any");
}
function G$(e, t) {
  return !e || !t || e === "any" || t === "any" ? "neutral" : nl(e, t) ? "ok" : "mismatch";
}
function ol(e) {
  const t = (i) => {
    const o = i.trim();
    return !o || o === "input" || o === "output" ? "" : o;
  };
  if (typeof e == "string") return t(e);
  const n = ct(e);
  return n && typeof n.expr == "string" ? t(n.expr) : "";
}
function j$(e, t, n) {
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
function X$(e, t) {
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
function K$(e) {
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
function Sh(e) {
  const t = (e || "").trim();
  if (!t.startsWith("{") || !t.endsWith("}")) return null;
  const n = t.slice(1, -1).trim();
  if (!n) return [];
  const i = X$(n, ",");
  if (i === null) return null;
  const o = [];
  for (const r of i) {
    const a = r.trim();
    if (!a) continue;
    const s = K$(a);
    if (s < 0) return null;
    let l = a.slice(0, s).trim();
    const c = a.slice(s + 1).trim();
    if (!c || ((l.startsWith('"') && l.endsWith('"') || l.startsWith("'") && l.endsWith("'")) && (l = l.slice(1, -1)), !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(l))) return null;
    o.push({ key: l, rhs: c });
  }
  return o;
}
function us(e, t) {
  const n = To(e), i = W$(n), o = (t || "").trim();
  if (!o) return { rows: i, raw: "" };
  const r = Sh(o);
  if (!r) return { rows: i, raw: o };
  if (n.length) {
    const a = new Set(n.map((c) => c.key));
    if (r.some((c) => !a.has(c.key))) return { rows: i, raw: o };
    const s = new Map(r.map((c) => [c.key, c.rhs]));
    return { rows: i.map((c) => s.has(c.key) ? { key: c.key, mode: "expr", value: s.get(c.key), type: c.type } : c), raw: "" };
  }
  return { rows: r.map((a) => ({ key: a.key, mode: "expr", value: a.rhs })), raw: "" };
}
const Ru = 500, Z$ = new Set(Object.values(Fd));
function Ch(e) {
  const t = ol(e);
  return t ? j$(t, "input", "output") : "";
}
function Nh() {
  return { nodes: {}, edges: {}, notes: {}, positions: {}, viewport: null, direction: "TB", params: {}, labels: [], headSeq: 0, definitionEditSeq: 0, canUndo: !1, canRedo: !1 };
}
function ut(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Xe(e, t = 0) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
const J$ = /* @__PURE__ */ new Set([
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
function Q$(e) {
  return typeof e == "string" && J$.has(e) ? e : null;
}
function Ih(e) {
  const t = ut(e), n = Nh();
  for (const a of Array.isArray(t.nodes) ? t.nodes : []) {
    const s = Ah(ut(a));
    s && (n.nodes[s.id] = s);
  }
  for (const a of Array.isArray(t.edges) ? t.edges : []) {
    const s = Th(ut(a));
    s && (n.edges[s.id] = s);
  }
  for (const a of Array.isArray(t.notes) ? t.notes : []) {
    const s = Mh(ut(a));
    s && (n.notes[s.id] = s);
  }
  const i = ut(t.layout), o = ut(i.positions ?? t.layout);
  for (const [a, s] of Object.entries(o)) {
    const l = ut(s);
    "x" in l && "y" in l && (n.positions[a] = Oh(l));
  }
  const r = ut(t.viewport ?? i.viewport);
  return ("zoom" in r || "x" in r && "y" in r) && (n.viewport = { x: Xe(r.x), y: Xe(r.y), zoom: Xe(r.zoom, 1) }), n.direction = i.direction === "LR" ? "LR" : "TB", n.params = ut(t.params), n.labels = Array.isArray(t.labels) ? t.labels.filter((a) => typeof a == "string") : [], n.headSeq = Xe(t.head_seq), n.definitionEditSeq = Xe(t.definition_edit_seq), n.canUndo = t.can_undo === !0, n.canRedo = t.can_redo === !0, n;
}
function Ah(e) {
  const t = String(e.id || ""), n = Q$(e.kind);
  if (!t || !n) return null;
  const i = { id: t, kind: n, title: String(e.title ?? "Step") };
  e.ref != null && (i.ref = String(e.ref)), e.ref_label != null && (i.ref_label = String(e.ref_label)), e.config != null && (i.config = ut(e.config));
  for (const o of Ds)
    e[o] !== void 0 && e[o] !== !1 && (i[o] = e[o]);
  return e.input_schema !== void 0 && (i.input_schema = e.input_schema), e.output_schema !== void 0 && (i.output_schema = e.output_schema), e.config_schema !== void 0 && (i.config_schema = e.config_schema), e.icon != null && (i.icon = String(e.icon)), e.pinned != null && (i.pinned = e.pinned === !0), e.deletable != null && (i.deletable = e.deletable === !0), e.boundary != null && typeof e.boundary == "object" && (i.boundary = e.boundary), e.child_interface != null && typeof e.child_interface == "object" && (i.child_interface = e.child_interface), Array.isArray(e.ports) && (i.ports = e.ports), i;
}
function Th(e) {
  const t = String(e.id || ""), n = String(e.source_id || ""), i = String(e.target_id || "");
  if (!t || !n || !i) return null;
  const o = { id: t, source_id: n, target_id: i };
  return e.source_port != null && (o.source_port = String(e.source_port)), e.target_port != null && (o.target_port = String(e.target_port)), e.transform != null && (o.transform = Ch(e.transform)), o;
}
function Mh(e) {
  const t = String(e.id || "");
  if (!t) return null;
  const n = { id: t, text: String(e.body ?? "") };
  return e.kind === "frame" ? n.kind = "frame" : e.kind === "note" && (n.kind = "note"), e.width != null && (n.width = Xe(e.width)), e.height != null && (n.height = Xe(e.height)), e.color != null && e.color !== "" && (n.color = String(e.color)), n;
}
function Oh(e) {
  const t = { x: Xe(e.x), y: Xe(e.y) };
  return e.width != null && (t.width = Xe(e.width)), e.height != null && (t.height = Xe(e.height)), t;
}
function cs(e, t) {
  const n = ut(t.body);
  switch (t.type) {
    case Te.NODE_ADDED: {
      const i = Ah(n);
      return i ? (e.nodes = { ...e.nodes, [i.id]: i }, { changed: !0, unknown: !1 }) : { changed: !1, unknown: !1 };
    }
    case Te.NODE_UPDATED: {
      const i = String(n.id || ""), o = e.nodes[i];
      if (!o) return { changed: !1, unknown: !1 };
      const r = {};
      for (const a of ["kind", "title", "ref", "ref_label", "config", "input_schema", "output_schema", "config_schema", "icon", "pinned", "deletable", "boundary", "child_interface", "ports"])
        a in n && (r[a] = n[a]);
      for (const a of Ds)
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
      const i = Th(n);
      return i ? (e.edges = { ...e.edges, [i.id]: i }, { changed: !0, unknown: !1 }) : { changed: !1, unknown: !1 };
    }
    case Te.EDGE_UPDATED: {
      const i = String(n.id || ""), o = e.edges[i];
      if (!o) return { changed: !1, unknown: !1 };
      const r = {};
      for (const a of ["source_id", "target_id", "source_port", "target_port"])
        a in n && (r[a] = n[a]);
      return "transform" in n && (r.transform = Ch(n.transform)), e.edges = { ...e.edges, [i]: { ...o, ...r } }, { changed: !0, unknown: !1 };
    }
    case Te.EDGE_REMOVED: {
      const i = String(n.id || "");
      if (!e.edges[i]) return { changed: !1, unknown: !1 };
      const o = { ...e.edges };
      return delete o[i], e.edges = o, { changed: !0, unknown: !1 };
    }
    case Te.NOTE_ADDED: {
      const i = Mh(n);
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
      const o = e.positions[i], r = Oh(n);
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
function Vi(e, t) {
  for (const n of t) cs(e, { type: Fd[n.type], body: n.body });
}
class eS {
  doc = Nh();
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
      for (const t of this.pending.values()) Vi(this.doc, t);
      this.pending.size || (this.confirmed = null);
    }
  }
  // Reset to a freshly fetched /state snapshot. Everything at or below head_seq is,
  // by definition, already reflected.
  reset(t) {
    this.doc = Ih(t), this.lastAppliedSeq = this.doc.headSeq, this.echoes = [], this.historySeq = this.doc.headSeq, this.confirmed = this.pending.size ? this.doc : null, this.projectPending();
  }
  // Record that the local user just committed a node to (x, y), so the matching
  // broadcast echo is suppressed. Coordinates are rounded to match the command.
  recordLayoutEcho(t, n, i, o = Date.now()) {
    this.echoes.push({ nodeId: t, x: Math.round(n), y: Math.round(i), ts: o });
  }
  pruneEchoes(t) {
    this.echoes.length && (this.echoes = this.echoes.filter((n) => t - n.ts <= Ru));
  }
  matchEcho(t, n, i, o) {
    const r = this.echoes.findIndex(
      (a) => a.nodeId === t && a.x === Math.round(n) && a.y === Math.round(i) && o - a.ts <= Ru
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
          this.confirmed && cs(this.doc, l), this.lastAppliedSeq = l.seq, l.seq > this.doc.headSeq && (this.doc.headSeq = l.seq), l.seq > this.doc.definitionEditSeq && (this.doc.definitionEditSeq = l.seq);
          continue;
        }
      }
      const c = cs(this.doc, l);
      this.lastAppliedSeq = l.seq, l.seq > this.doc.headSeq && (this.doc.headSeq = l.seq), Z$.has(l.type) && l.seq > this.doc.definitionEditSeq && (this.doc.definitionEditSeq = l.seq), c.unknown || l.type === Te.VERSION_PUBLISHED || l.type === Te.VERSION_RESTORED ? a = !0 : c.changed && (r.push(l), s = !0);
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
function Du(e) {
  const t = e.length === 1 ? e[0] : null;
  return t?.type === "node.update" && typeof t.body.id == "string" ? t.body.id : null;
}
function tS({ engine: e, request: t, rebuild: n, recover: i, checkpoint: o }) {
  const r = [];
  let a = null, s = null, l = !1;
  const c = () => o?.([...a ? [a.commands] : [], ...r.map((y) => y.commands)]);
  async function u() {
    for (; r.length; ) {
      const y = r.shift();
      a = y;
      try {
        c(), e.applyResponse(await t(y.commands), Date.now(), y.stage), y.resolve(), a = null, c(), n();
      } catch (m) {
        l = !0, r.unshift(y), a = null, await i(m);
        for (const _ of r) _.resolve();
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
  const v = Object.assign((y, m = !1) => {
    if (!y.length) return Promise.resolve();
    const _ = Du(y);
    let x;
    if (_) {
      for (let w = r.length - 1; w >= 0; w--) {
        const b = Du(r[w].commands);
        if (!b) break;
        if (b === _) {
          x = r[w];
          break;
        }
      }
      if (!x && !r.length && a && _o(a.commands, y)) return a.done;
    }
    if (x) {
      const w = [{ ...y[0], body: { ...x.commands[0].body, ...y[0].body } }];
      if (_o(x.commands, w)) return x.done;
      e.rejectCommands(x.stage), x.commands = w, x.stage = e.stageCommands(w);
    } else {
      let w;
      const b = new Promise((C) => {
        w = C;
      });
      x = { commands: y, stage: e.stageCommands(y), done: b, resolve: w }, r.push(x);
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
function Pu(e) {
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
const nS = new Set(Object.values(Oe));
function oS(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.type == "string" && nS.has(t.type) && !!t.body && typeof t.body == "object" && !Array.isArray(t.body);
}
class iS {
  constructor(t, n, i) {
    this.storage = i, this.key = `kickside.workflow-edits.v1:${encodeURIComponent(t)}:${encodeURIComponent(n)}`;
  }
  key;
  write(t) {
    t.length ? this.storage.setItem(this.key, JSON.stringify(Pu(t))) : this.storage.removeItem(this.key);
  }
  read(t) {
    const n = JSON.parse(this.storage.getItem(this.key) ?? "[]");
    if (!Array.isArray(n) || !n.every((o) => Array.isArray(o) && o.every(oS)))
      throw new Error("Invalid pending Workflow edits. The recovery record has been retained.");
    const i = JSON.parse(JSON.stringify(t));
    return Pu(n).flatMap((o) => {
      const r = o.filter((s) => {
        const l = String(s.body.id || "");
        return s.type === Oe.NODE_ADD ? !i.nodes[l] : s.type === Oe.EDGE_ADD ? !i.edges[l] : s.type === Oe.NOTE_ADD ? !i.notes[l] : !0;
      }), a = JSON.parse(JSON.stringify(i));
      return Vi(i, r), _o(a, i) ? [] : [r];
    });
  }
}
const zi = /* @__PURE__ */ new Map();
async function rS(e) {
  const t = zi.get(e);
  t && await t.flush();
}
function aS(e, t) {
  zi.set(e, t);
}
function sS(e, t) {
  const n = () => {
    e.flush();
  }, i = () => {
    document.visibilityState === "hidden" && n();
  };
  Ue(() => {
    window.addEventListener("pagehide", n), document.addEventListener("visibilitychange", i);
  }), Qe(() => {
    window.removeEventListener("pagehide", n), document.removeEventListener("visibilitychange", i), e.flush().then(() => {
      zi.get(t()) === e && zi.delete(t());
    });
  });
}
function Rh(e) {
  const t = e.trim();
  return !t || /\s/.test(t) ? !1 : t.includes(":") ? !0 : /^[a-z0-9_-]+(\.[a-z0-9_-]+){2,}$/i.test(t);
}
function lS(e) {
  const t = e.split(":").pop() || e, n = t.split(".").pop() || t;
  return n.split("/").pop() || n;
}
function il(e) {
  return e.replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim().split(" ").map((t) => t && t[0].toUpperCase() + t.slice(1)).join(" ");
}
function Je(e, t) {
  const n = (e || "").trim();
  if (n && !Rh(n)) return n;
  const i = n || (t || "").trim();
  return i ? il(lS(i)) || i : "";
}
function Lu(e) {
  return !!e && (typeof e.type == "string" || !!e.properties && typeof e.properties == "object");
}
function rl(e, t) {
  const n = Tl(e), i = Tl(t);
  if (!Lu(n) || !Lu(i)) return { status: "neutral" };
  const o = n.type, r = i.type;
  if (o && r && !Km(o, r))
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
function uS(e, t) {
  return rl(e, t).status === "error" ? "needs-mapping" : "ok";
}
const Dh = /* @__PURE__ */ new Set(["out-bottom", "out-right", "in-top", "in-left"]);
function Vu(e) {
  return !!e && Dh.has(e);
}
function kn(e) {
  const t = e || void 0;
  return t && !Dh.has(t) ? t : void 0;
}
function Ph(e, t) {
  if (!e.source || !e.target || e.source === e.target) return !1;
  const n = kn(e.sourceHandle), i = kn(e.targetHandle);
  return !t.some((o) => !(e.id != null && o.id === e.id) && o.source_id === e.source && o.target_id === e.target && kn(o.source_port) === n && kn(o.target_port) === i);
}
function cS(e, t, n) {
  const i = To(t), o = i.filter((u) => u.required).map((u) => u.title || u.key);
  if (!o.length) return { required: o, unmappedRequired: [] };
  const r = ol(e.transform), a = us(t, r), s = r.trim() ? [] : $h(n, t), l = new Map(s.map((u) => [u.key, u])), c = a.rows.map((u) => l.get(u.key) || u);
  return {
    required: o,
    unmappedRequired: a.raw ? [] : tl(i, c)
  };
}
function dS(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Fr, zu;
function al() {
  if (zu) return Fr;
  zu = 1;
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
      var f = arguments, p = this;
      return u.forEach(function(v) {
        f.length > 1 ? p.setNode(v, d) : p.setNode(v);
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
        var f = (p) => d.removeEdge(d._edgeObjs[p]);
        delete this._nodes[u], this._isCompound && (this._removeFromParentsChildList(u), delete this._parent[u], this.children(u).forEach(function(p) {
          d.setParent(p);
        }), delete this._children[u]), Object.keys(this._in[u]).forEach(f), delete this._in[u], delete this._preds[u], Object.keys(this._out[u]).forEach(f), delete this._out[u], delete this._sucs[u], --this._nodeCount;
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
        for (var f = d; f !== void 0; f = this.parent(f))
          if (f === u)
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
        for (var f of this.successors(u))
          p.add(f);
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
      var f = this;
      Object.entries(this._nodes).forEach(function([y, m]) {
        u(y) && d.setNode(y, m);
      }), Object.values(this._edgeObjs).forEach(function(y) {
        d.hasNode(y.v) && d.hasNode(y.w) && d.setEdge(y, f.edge(y));
      });
      var p = {};
      function v(y) {
        var m = f.parent(y);
        return m === void 0 || d.hasNode(m) ? (p[y] = m, m) : m in p ? p[m] : v(m);
      }
      return this._isCompound && d.nodes().forEach((y) => d.setParent(y, v(y))), d;
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
      var f = this, p = arguments;
      return u.reduce(function(v, y) {
        return p.length > 1 ? f.setEdge(v, y, d) : f.setEdge(v, y), y;
      }), this;
    }
    /**
     * Creates or updates the label for the edge (v, w) with the optionally supplied
     * name. If label is supplied it is set as the value for the edge. If label is not
     * supplied and the edge was created by this call then the default edge label will
     * be assigned. The name parameter is only useful with multigraphs.
     */
    setEdge() {
      var u, d, f, p, v = !1, y = arguments[0];
      typeof y == "object" && y !== null && "v" in y ? (u = y.v, d = y.w, f = y.name, arguments.length === 2 && (p = arguments[1], v = !0)) : (u = y, d = arguments[1], f = arguments[3], arguments.length > 2 && (p = arguments[2], v = !0)), u = "" + u, d = "" + d, f !== void 0 && (f = "" + f);
      var m = a(this._isDirected, u, d, f);
      if (Object.hasOwn(this._edgeLabels, m))
        return v && (this._edgeLabels[m] = p), this;
      if (f !== void 0 && !this._isMultigraph)
        throw new Error("Cannot set a named edge when isMultigraph = false");
      this.setNode(u), this.setNode(d), this._edgeLabels[m] = v ? p : this._defaultEdgeLabelFn(u, d, f);
      var _ = s(this._isDirected, u, d, f);
      return u = _.v, d = _.w, Object.freeze(_), this._edgeObjs[m] = _, o(this._preds[d], u), o(this._sucs[u], d), this._in[d][m] = _, this._out[u][m] = _, this._edgeCount++, this;
    }
    /**
     * Gets the label for the specified edge.
     * Complexity: O(1).
     */
    edge(u, d, f) {
      var p = arguments.length === 1 ? l(this._isDirected, arguments[0]) : a(this._isDirected, u, d, f);
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
    hasEdge(u, d, f) {
      var p = arguments.length === 1 ? l(this._isDirected, arguments[0]) : a(this._isDirected, u, d, f);
      return Object.hasOwn(this._edgeLabels, p);
    }
    /**
     * Removes the specified edge from the graph. No subgraphs are considered.
     * Complexity: O(1).
     */
    removeEdge(u, d, f) {
      var p = arguments.length === 1 ? l(this._isDirected, arguments[0]) : a(this._isDirected, u, d, f), v = this._edgeObjs[p];
      return v && (u = v.v, d = v.w, delete this._edgeLabels[p], delete this._edgeObjs[p], r(this._preds[d], u), r(this._sucs[u], d), delete this._in[d][p], delete this._out[u][p], this._edgeCount--), this;
    }
    /**
     * Return all edges that point to the node v. Optionally filters those edges down to just those
     * coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead.
     * Complexity: O(|E|).
     */
    inEdges(u, d) {
      var f = this._in[u];
      if (f) {
        var p = Object.values(f);
        return d ? p.filter((v) => v.v === d) : p;
      }
    }
    /**
     * Return all edges that are pointed at by node v. Optionally filters those edges down to just
     * those point to w. Behavior is undefined for undirected graphs - use nodeEdges instead.
     * Complexity: O(|E|).
     */
    outEdges(u, d) {
      var f = this._out[u];
      if (f) {
        var p = Object.values(f);
        return d ? p.filter((v) => v.w === d) : p;
      }
    }
    /**
     * Returns all edges to or from node v regardless of direction. Optionally filters those edges
     * down to just those between nodes v and w regardless of direction.
     * Complexity: O(|E|).
     */
    nodeEdges(u, d) {
      var f = this.inEdges(u, d);
      if (f)
        return f.concat(this.outEdges(u, d));
    }
  }
  function o(c, u) {
    c[u] ? c[u]++ : c[u] = 1;
  }
  function r(c, u) {
    --c[u] || delete c[u];
  }
  function a(c, u, d, f) {
    var p = "" + u, v = "" + d;
    if (!c && p > v) {
      var y = p;
      p = v, v = y;
    }
    return p + n + v + n + (f === void 0 ? e : f);
  }
  function s(c, u, d, f) {
    var p = "" + u, v = "" + d;
    if (!c && p > v) {
      var y = p;
      p = v, v = y;
    }
    var m = { v: p, w: v };
    return f && (m.name = f), m;
  }
  function l(c, u) {
    return a(c, u.v, u.w, u.name);
  }
  return Fr = i, Fr;
}
var Hr, Bu;
function fS() {
  return Bu || (Bu = 1, Hr = "2.2.4"), Hr;
}
var qr, Fu;
function hS() {
  return Fu || (Fu = 1, qr = {
    Graph: al(),
    version: fS()
  }), qr;
}
var Ur, Hu;
function pS() {
  if (Hu) return Ur;
  Hu = 1;
  var e = al();
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
var Wr, qu;
function vS() {
  if (qu) return Wr;
  qu = 1, Wr = e;
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
var Yr, Uu;
function Lh() {
  if (Uu) return Yr;
  Uu = 1;
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
var Gr, Wu;
function Vh() {
  if (Wu) return Gr;
  Wu = 1;
  var e = Lh();
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
    var l = {}, c = new e(), u, d, f = function(p) {
      var v = p.v !== u ? p.v : p.w, y = l[v], m = a(p), _ = d.distance + m;
      if (m < 0)
        throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + p + " Weight: " + m);
      _ < y.distance && (y.distance = _, y.predecessor = u, c.decrease(v, _));
    };
    for (o.nodes().forEach(function(p) {
      var v = p === r ? 0 : Number.POSITIVE_INFINITY;
      l[p] = { distance: v }, c.add(p, v);
    }); c.size() > 0 && (u = c.removeMin(), d = l[u], d.distance !== Number.POSITIVE_INFINITY); )
      s(u).forEach(f);
    return l;
  }
  return Gr;
}
var jr, Yu;
function mS() {
  if (Yu) return jr;
  Yu = 1;
  var e = Vh();
  jr = t;
  function t(n, i, o) {
    return n.nodes().reduce(function(r, a) {
      return r[a] = e(n, a, i, o), r;
    }, {});
  }
  return jr;
}
var Xr, Gu;
function zh() {
  if (Gu) return Xr;
  Gu = 1, Xr = e;
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
var Kr, ju;
function gS() {
  if (ju) return Kr;
  ju = 1;
  var e = zh();
  Kr = t;
  function t(n) {
    return e(n).filter(function(i) {
      return i.length > 1 || i.length === 1 && n.hasEdge(i[0], i[0]);
    });
  }
  return Kr;
}
var Zr, Xu;
function yS() {
  if (Xu) return Zr;
  Xu = 1, Zr = t;
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
        s.forEach(function(f) {
          var p = d[l], v = c[f], y = d[f], m = p.distance + v.distance;
          m < y.distance && (y.distance = m, y.predecessor = v.predecessor);
        });
      });
    }), a;
  }
  return Zr;
}
var Jr, Ku;
function Bh() {
  if (Ku) return Jr;
  Ku = 1;
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
var Qr, Zu;
function wS() {
  if (Zu) return Qr;
  Zu = 1;
  var e = Bh();
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
var ea, Ju;
function Fh() {
  if (Ju) return ea;
  Ju = 1, ea = e;
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
var ta, Qu;
function bS() {
  if (Qu) return ta;
  Qu = 1;
  var e = Fh();
  ta = t;
  function t(n, i) {
    return e(n, i, "post");
  }
  return ta;
}
var na, ec;
function _S() {
  if (ec) return na;
  ec = 1;
  var e = Fh();
  na = t;
  function t(n, i) {
    return e(n, i, "pre");
  }
  return na;
}
var oa, tc;
function kS() {
  if (tc) return oa;
  tc = 1;
  var e = al(), t = Lh();
  oa = n;
  function n(i, o) {
    var r = new e(), a = {}, s = new t(), l;
    function c(d) {
      var f = d.v === l ? d.w : d.v, p = s.priority(f);
      if (p !== void 0) {
        var v = o(d);
        v < p && (a[f] = l, s.decrease(f, v));
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
var ia, nc;
function ES() {
  return nc || (nc = 1, ia = {
    components: vS(),
    dijkstra: Vh(),
    dijkstraAll: mS(),
    findCycles: gS(),
    floydWarshall: yS(),
    isAcyclic: wS(),
    postorder: bS(),
    preorder: _S(),
    prim: kS(),
    tarjan: zh(),
    topsort: Bh()
  }), ia;
}
var ra, oc;
function wt() {
  if (oc) return ra;
  oc = 1;
  var e = hS();
  return ra = {
    Graph: e.Graph,
    json: pS(),
    alg: ES(),
    version: e.version
  }, ra;
}
var aa, ic;
function xS() {
  if (ic) return aa;
  ic = 1;
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
var sa, rc;
function $S() {
  if (rc) return sa;
  rc = 1;
  let e = wt().Graph, t = xS();
  sa = i;
  let n = () => 1;
  function i(c, u) {
    if (c.nodeCount() <= 1)
      return [];
    let d = a(c, u || n);
    return o(d.graph, d.buckets, d.zeroIdx).flatMap((p) => c.outEdges(p.v, p.w));
  }
  function o(c, u, d) {
    let f = [], p = u[u.length - 1], v = u[0], y;
    for (; c.nodeCount(); ) {
      for (; y = v.dequeue(); )
        r(c, u, d, y);
      for (; y = p.dequeue(); )
        r(c, u, d, y);
      if (c.nodeCount()) {
        for (let m = u.length - 2; m > 0; --m)
          if (y = u[m].dequeue(), y) {
            f = f.concat(r(c, u, d, y, !0));
            break;
          }
      }
    }
    return f;
  }
  function r(c, u, d, f, p) {
    let v = p ? [] : void 0;
    return c.inEdges(f.v).forEach((y) => {
      let m = c.edge(y), _ = c.node(y.v);
      p && v.push({ v: y.v, w: y.w }), _.out -= m, s(u, d, _);
    }), c.outEdges(f.v).forEach((y) => {
      let m = c.edge(y), _ = y.w, x = c.node(_);
      x.in -= m, s(u, d, x);
    }), c.removeNode(f.v), v;
  }
  function a(c, u) {
    let d = new e(), f = 0, p = 0;
    c.nodes().forEach((m) => {
      d.setNode(m, { v: m, in: 0, out: 0 });
    }), c.edges().forEach((m) => {
      let _ = d.edge(m.v, m.w) || 0, x = u(m), w = _ + x;
      d.setEdge(m.v, m.w, w), p = Math.max(p, d.node(m.v).out += x), f = Math.max(f, d.node(m.w).in += x);
    });
    let v = l(p + f + 3).map(() => new t()), y = f + 1;
    return d.nodes().forEach((m) => {
      s(v, y, d.node(m));
    }), { graph: d, buckets: v, zeroIdx: y };
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
var la, ac;
function Ge() {
  if (ac) return la;
  ac = 1;
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
    notime: _,
    partition: y,
    pick: C,
    predecessorWeights: r,
    range: b,
    removeEmptyRanks: c,
    simplify: n,
    successorWeights: o,
    time: m,
    uniqueId: w,
    zipObject: B
  };
  function t(T, M, V, O) {
    for (var E = O; T.hasNode(E); )
      E = w(O);
    return V.dummy = M, T.setNode(E, V), E;
  }
  function n(T) {
    let M = new e().setGraph(T.graph());
    return T.nodes().forEach((V) => M.setNode(V, T.node(V))), T.edges().forEach((V) => {
      let O = M.edge(V.v, V.w) || { weight: 0, minlen: 1 }, E = T.edge(V);
      M.setEdge(V.v, V.w, {
        weight: O.weight + E.weight,
        minlen: Math.max(O.minlen, E.minlen)
      });
    }), M;
  }
  function i(T) {
    let M = new e({ multigraph: T.isMultigraph() }).setGraph(T.graph());
    return T.nodes().forEach((V) => {
      T.children(V).length || M.setNode(V, T.node(V));
    }), T.edges().forEach((V) => {
      M.setEdge(V, T.edge(V));
    }), M;
  }
  function o(T) {
    let M = T.nodes().map((V) => {
      let O = {};
      return T.outEdges(V).forEach((E) => {
        O[E.w] = (O[E.w] || 0) + T.edge(E).weight;
      }), O;
    });
    return B(T.nodes(), M);
  }
  function r(T) {
    let M = T.nodes().map((V) => {
      let O = {};
      return T.inEdges(V).forEach((E) => {
        O[E.v] = (O[E.v] || 0) + T.edge(E).weight;
      }), O;
    });
    return B(T.nodes(), M);
  }
  function a(T, M) {
    let V = T.x, O = T.y, E = M.x - V, F = M.y - O, g = T.width / 2, $ = T.height / 2;
    if (!E && !F)
      throw new Error("Not possible to find intersection inside of the rectangle");
    let k, H;
    return Math.abs(F) * g > Math.abs(E) * $ ? (F < 0 && ($ = -$), k = $ * E / F, H = $) : (E < 0 && (g = -g), k = g, H = g * F / E), { x: V + k, y: O + H };
  }
  function s(T) {
    let M = b(v(T) + 1).map(() => []);
    return T.nodes().forEach((V) => {
      let O = T.node(V), E = O.rank;
      E !== void 0 && (M[E][O.order] = V);
    }), M;
  }
  function l(T) {
    let M = T.nodes().map((O) => {
      let E = T.node(O).rank;
      return E === void 0 ? Number.MAX_VALUE : E;
    }), V = p(Math.min, M);
    T.nodes().forEach((O) => {
      let E = T.node(O);
      Object.hasOwn(E, "rank") && (E.rank -= V);
    });
  }
  function c(T) {
    let M = T.nodes().map((g) => T.node(g).rank), V = p(Math.min, M), O = [];
    T.nodes().forEach((g) => {
      let $ = T.node(g).rank - V;
      O[$] || (O[$] = []), O[$].push(g);
    });
    let E = 0, F = T.graph().nodeRankFactor;
    Array.from(O).forEach((g, $) => {
      g === void 0 && $ % F !== 0 ? --E : g !== void 0 && E && g.forEach((k) => T.node(k).rank += E);
    });
  }
  function u(T, M, V, O) {
    let E = {
      width: 0,
      height: 0
    };
    return arguments.length >= 4 && (E.rank = V, E.order = O), t(T, "border", E, M);
  }
  function d(T, M = f) {
    const V = [];
    for (let O = 0; O < T.length; O += M) {
      const E = T.slice(O, O + M);
      V.push(E);
    }
    return V;
  }
  const f = 65535;
  function p(T, M) {
    if (M.length > f) {
      const V = d(M);
      return T.apply(null, V.map((O) => T.apply(null, O)));
    } else
      return T.apply(null, M);
  }
  function v(T) {
    const V = T.nodes().map((O) => {
      let E = T.node(O).rank;
      return E === void 0 ? Number.MIN_VALUE : E;
    });
    return p(Math.max, V);
  }
  function y(T, M) {
    let V = { lhs: [], rhs: [] };
    return T.forEach((O) => {
      M(O) ? V.lhs.push(O) : V.rhs.push(O);
    }), V;
  }
  function m(T, M) {
    let V = Date.now();
    try {
      return M();
    } finally {
      console.log(T + " time: " + (Date.now() - V) + "ms");
    }
  }
  function _(T, M) {
    return M();
  }
  let x = 0;
  function w(T) {
    var M = ++x;
    return T + ("" + M);
  }
  function b(T, M, V = 1) {
    M == null && (M = T, T = 0);
    let O = (F) => F < M;
    V < 0 && (O = (F) => M < F);
    const E = [];
    for (let F = T; O(F); F += V)
      E.push(F);
    return E;
  }
  function C(T, M) {
    const V = {};
    for (const O of M)
      T[O] !== void 0 && (V[O] = T[O]);
    return V;
  }
  function I(T, M) {
    let V = M;
    return typeof M == "string" && (V = (O) => O[M]), Object.entries(T).reduce((O, [E, F]) => (O[E] = V(F, E), O), {});
  }
  function B(T, M) {
    return T.reduce((V, O, E) => (V[O] = M[E], V), {});
  }
  return la;
}
var ua, sc;
function SS() {
  if (sc) return ua;
  sc = 1;
  let e = $S(), t = Ge().uniqueId;
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
var ca, lc;
function CS() {
  if (lc) return ca;
  lc = 1;
  let e = Ge();
  ca = {
    run: t,
    undo: i
  };
  function t(o) {
    o.graph().dummyChains = [], o.edges().forEach((r) => n(o, r));
  }
  function n(o, r) {
    let a = r.v, s = o.node(a).rank, l = r.w, c = o.node(l).rank, u = r.name, d = o.edge(r), f = d.labelRank;
    if (c === s + 1) return;
    o.removeEdge(r);
    let p, v, y;
    for (y = 0, ++s; s < c; ++y, ++s)
      d.points = [], v = {
        width: 0,
        height: 0,
        edgeLabel: d,
        edgeObj: r,
        rank: s
      }, p = e.addDummyNode(o, "edge", v, "_d"), s === f && (v.width = d.width, v.height = d.height, v.dummy = "edge-label", v.labelpos = d.labelpos), o.setEdge(a, p, { weight: d.weight }, u), y === 0 && o.graph().dummyChains.push(p), a = p;
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
var da, uc;
function Bi() {
  if (uc) return da;
  uc = 1;
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
var fa, cc;
function Hh() {
  if (cc) return fa;
  cc = 1;
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
        var d = u.v, f = c === d ? u.w : d;
        !a.hasNode(f) && !t(s, u) && (a.setNode(f, {}), a.setEdge(c, f, {}), l(f));
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
var ha, dc;
function NS() {
  if (dc) return ha;
  dc = 1;
  var e = Hh(), t = Bi().slack, n = Bi().longestPath, i = wt().alg.preorder, o = wt().alg.postorder, r = Ge().simplify;
  ha = a, a.initLowLimValues = u, a.initCutValues = s, a.calcCutValue = c, a.leaveEdge = f, a.enterEdge = p, a.exchangeEdges = v;
  function a(x) {
    x = r(x), n(x);
    var w = e(x);
    u(w), s(w, x);
    for (var b, C; b = f(w); )
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
    var C = x.node(b), I = C.parent, B = !0, T = w.edge(b, I), M = 0;
    return T || (B = !1, T = w.edge(I, b)), M = T.weight, w.nodeEdges(b).forEach((V) => {
      var O = V.v === b, E = O ? V.w : V.v;
      if (E !== I) {
        var F = O === B, g = w.edge(V).weight;
        if (M += F ? g : -g, m(x, b, E)) {
          var $ = x.edge(b, E).cutvalue;
          M += F ? -$ : $;
        }
      }
    }), M;
  }
  function u(x, w) {
    arguments.length < 2 && (w = x.nodes()[0]), d(x, {}, 1, w);
  }
  function d(x, w, b, C, I) {
    var B = b, T = x.node(C);
    return w[C] = !0, x.neighbors(C).forEach((M) => {
      Object.hasOwn(w, M) || (b = d(x, w, b, M, C));
    }), T.low = B, T.lim = b++, I ? T.parent = I : delete T.parent, b;
  }
  function f(x) {
    return x.edges().find((w) => x.edge(w).cutvalue < 0);
  }
  function p(x, w, b) {
    var C = b.v, I = b.w;
    w.hasEdge(C, I) || (C = b.w, I = b.v);
    var B = x.node(C), T = x.node(I), M = B, V = !1;
    B.lim > T.lim && (M = T, V = !0);
    var O = w.edges().filter((E) => V === _(x, x.node(E.v), M) && V !== _(x, x.node(E.w), M));
    return O.reduce((E, F) => t(w, F) < t(w, E) ? F : E);
  }
  function v(x, w, b, C) {
    var I = b.v, B = b.w;
    x.removeEdge(I, B), x.setEdge(C.v, C.w, {}), u(x), s(x, w), y(x, w);
  }
  function y(x, w) {
    var b = x.nodes().find((I) => !w.node(I).parent), C = i(x, b);
    C = C.slice(1), C.forEach((I) => {
      var B = x.node(I).parent, T = w.edge(I, B), M = !1;
      T || (T = w.edge(B, I), M = !0), w.node(I).rank = w.node(B).rank + (M ? T.minlen : -T.minlen);
    });
  }
  function m(x, w, b) {
    return x.hasEdge(w, b);
  }
  function _(x, w, b) {
    return b.low <= w.lim && w.lim <= b.lim;
  }
  return ha;
}
var pa, fc;
function IS() {
  if (fc) return pa;
  fc = 1;
  var e = Bi(), t = e.longestPath, n = Hh(), i = NS();
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
var va, hc;
function AS() {
  if (hc) return va;
  hc = 1, va = e;
  function e(i) {
    let o = n(i);
    i.graph().dummyChains.forEach((r) => {
      let a = i.node(r), s = a.edgeObj, l = t(i, o, s.v, s.w), c = l.path, u = l.lca, d = 0, f = c[d], p = !0;
      for (; r !== s.w; ) {
        if (a = i.node(r), p) {
          for (; (f = c[d]) !== u && i.node(f).maxRank < a.rank; )
            d++;
          f === u && (p = !1);
        }
        if (!p) {
          for (; d < c.length - 1 && i.node(f = c[d + 1]).minRank <= a.rank; )
            d++;
          f = c[d];
        }
        i.setParent(r, f), r = i.successors(r)[0];
      }
    });
  }
  function t(i, o, r, a) {
    let s = [], l = [], c = Math.min(o[r].low, o[a].low), u = Math.max(o[r].lim, o[a].lim), d, f;
    d = r;
    do
      d = i.parent(d), s.push(d);
    while (d && (o[d].low > c || u > o[d].lim));
    for (f = d, d = a; (d = i.parent(d)) !== f; )
      l.push(d);
    return { path: s.concat(l.reverse()), lca: f };
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
var ma, pc;
function TS() {
  if (pc) return ma;
  pc = 1;
  let e = Ge();
  ma = {
    run: t,
    cleanup: r
  };
  function t(a) {
    let s = e.addDummyNode(a, "root", {}, "_root"), l = i(a), c = Object.values(l), u = e.applyWithChunking(Math.max, c) - 1, d = 2 * u + 1;
    a.graph().nestingRoot = s, a.edges().forEach((p) => a.edge(p).minlen *= d);
    let f = o(a) + 1;
    a.children().forEach((p) => n(a, s, d, f, u, l, p)), a.graph().nodeRankFactor = d;
  }
  function n(a, s, l, c, u, d, f) {
    let p = a.children(f);
    if (!p.length) {
      f !== s && a.setEdge(s, f, { weight: 0, minlen: l });
      return;
    }
    let v = e.addBorderNode(a, "_bt"), y = e.addBorderNode(a, "_bb"), m = a.node(f);
    a.setParent(v, f), m.borderTop = v, a.setParent(y, f), m.borderBottom = y, p.forEach((_) => {
      n(a, s, l, c, u, d, _);
      let x = a.node(_), w = x.borderTop ? x.borderTop : _, b = x.borderBottom ? x.borderBottom : _, C = x.borderTop ? c : 2 * c, I = w !== b ? 1 : u - d[f] + 1;
      a.setEdge(v, w, {
        weight: C,
        minlen: I,
        nestingEdge: !0
      }), a.setEdge(b, y, {
        weight: C,
        minlen: I,
        nestingEdge: !0
      });
    }), a.parent(f) || a.setEdge(s, v, { weight: 0, minlen: u + d[f] });
  }
  function i(a) {
    var s = {};
    function l(c, u) {
      var d = a.children(c);
      d && d.length && d.forEach((f) => l(f, u + 1)), s[c] = u;
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
var ga, vc;
function MS() {
  if (vc) return ga;
  vc = 1;
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
var ya, mc;
function OS() {
  if (mc) return ya;
  mc = 1, ya = {
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
var wa, gc;
function RS() {
  if (gc) return wa;
  gc = 1;
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
var ba, yc;
function DS() {
  if (yc) return ba;
  yc = 1;
  let e = Ge().zipObject;
  ba = t;
  function t(i, o) {
    let r = 0;
    for (let a = 1; a < o.length; ++a)
      r += n(i, o[a - 1], o[a]);
    return r;
  }
  function n(i, o, r) {
    let a = e(r, r.map((f, p) => p)), s = o.flatMap((f) => i.outEdges(f).map((p) => ({ pos: a[p.w], weight: i.edge(p).weight })).sort((p, v) => p.pos - v.pos)), l = 1;
    for (; l < r.length; ) l <<= 1;
    let c = 2 * l - 1;
    l -= 1;
    let u = new Array(c).fill(0), d = 0;
    return s.forEach((f) => {
      let p = f.pos + l;
      u[p] += f.weight;
      let v = 0;
      for (; p > 0; )
        p % 2 && (v += u[p + 1]), p = p - 1 >> 1, u[p] += f.weight;
      d += f.weight * v;
    }), d;
  }
  return ba;
}
var _a, wc;
function PS() {
  if (wc) return _a;
  wc = 1, _a = e;
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
var ka, bc;
function LS() {
  if (bc) return ka;
  bc = 1;
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
var Ea, _c;
function VS() {
  if (_c) return Ea;
  _c = 1;
  let e = Ge();
  Ea = t;
  function t(o, r) {
    let a = e.partition(o, (v) => Object.hasOwn(v, "barycenter")), s = a.lhs, l = a.rhs.sort((v, y) => y.i - v.i), c = [], u = 0, d = 0, f = 0;
    s.sort(i(!!r)), f = n(c, l, f), s.forEach((v) => {
      f += v.vs.length, c.push(v.vs), u += v.barycenter * v.weight, d += v.weight, f = n(c, l, f);
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
var xa, kc;
function zS() {
  if (kc) return xa;
  kc = 1;
  let e = PS(), t = LS(), n = VS();
  xa = i;
  function i(a, s, l, c) {
    let u = a.children(s), d = a.node(s), f = d ? d.borderLeft : void 0, p = d ? d.borderRight : void 0, v = {};
    f && (u = u.filter((x) => x !== f && x !== p));
    let y = e(a, u);
    y.forEach((x) => {
      if (a.children(x.v).length) {
        let w = i(a, x.v, l, c);
        v[x.v] = w, Object.hasOwn(w, "barycenter") && r(x, w);
      }
    });
    let m = t(y, l);
    o(m, v);
    let _ = n(m, c);
    if (f && (_.vs = [f, _.vs, p].flat(!0), a.predecessors(f).length)) {
      let x = a.node(a.predecessors(f)[0]), w = a.node(a.predecessors(p)[0]);
      Object.hasOwn(_, "barycenter") || (_.barycenter = 0, _.weight = 0), _.barycenter = (_.barycenter * _.weight + x.order + w.order) / (_.weight + 2), _.weight += 2;
    }
    return _;
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
var $a, Ec;
function BS() {
  if (Ec) return $a;
  Ec = 1;
  let e = wt().Graph, t = Ge();
  $a = n;
  function n(o, r, a, s) {
    s || (s = o.nodes());
    let l = i(o), c = new e({ compound: !0 }).setGraph({ root: l }).setDefaultNodeLabel((u) => o.node(u));
    return s.forEach((u) => {
      let d = o.node(u), f = o.parent(u);
      (d.rank === r || d.minRank <= r && r <= d.maxRank) && (c.setNode(u), c.setParent(u, f || l), o[a](u).forEach((p) => {
        let v = p.v === u ? p.w : p.v, y = c.edge(v, u), m = y !== void 0 ? y.weight : 0;
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
var Sa, xc;
function FS() {
  if (xc) return Sa;
  xc = 1, Sa = e;
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
var Ca, $c;
function HS() {
  if ($c) return Ca;
  $c = 1;
  let e = RS(), t = DS(), n = zS(), i = BS(), o = FS(), r = wt().Graph, a = Ge();
  Ca = s;
  function s(d, f) {
    if (f && typeof f.customOrder == "function") {
      f.customOrder(d, s);
      return;
    }
    let p = a.maxRank(d), v = l(d, a.range(1, p + 1), "inEdges"), y = l(d, a.range(p - 1, -1, -1), "outEdges"), m = e(d);
    if (u(d, m), f && f.disableOptimalOrderHeuristic)
      return;
    let _ = Number.POSITIVE_INFINITY, x;
    for (let w = 0, b = 0; b < 4; ++w, ++b) {
      c(w % 2 ? v : y, w % 4 >= 2), m = a.buildLayerMatrix(d);
      let C = t(d, m);
      C < _ && (b = 0, x = Object.assign({}, m), _ = C);
    }
    u(d, x);
  }
  function l(d, f, p) {
    const v = /* @__PURE__ */ new Map(), y = (m, _) => {
      v.has(m) || v.set(m, []), v.get(m).push(_);
    };
    for (const m of d.nodes()) {
      const _ = d.node(m);
      if (typeof _.rank == "number" && y(_.rank, m), typeof _.minRank == "number" && typeof _.maxRank == "number")
        for (let x = _.minRank; x <= _.maxRank; x++)
          x !== _.rank && y(x, m);
    }
    return f.map(function(m) {
      return i(d, m, p, v.get(m) || []);
    });
  }
  function c(d, f) {
    let p = new r();
    d.forEach(function(v) {
      let y = v.graph().root, m = n(v, y, p, f);
      m.vs.forEach((_, x) => v.node(_).order = x), o(v, p, m.vs);
    });
  }
  function u(d, f) {
    Object.values(f).forEach((p) => p.forEach((v, y) => d.node(v).order = y));
  }
  return Ca;
}
var Na, Sc;
function qS() {
  if (Sc) return Na;
  Sc = 1;
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
    balance: f
  };
  function n(m, _) {
    let x = {};
    function w(b, C) {
      let I = 0, B = 0, T = b.length, M = C[C.length - 1];
      return C.forEach((V, O) => {
        let E = o(m, V), F = E ? m.node(E).order : T;
        (E || V === M) && (C.slice(B, O + 1).forEach((g) => {
          m.predecessors(g).forEach(($) => {
            let k = m.node($), H = k.order;
            (H < I || F < H) && !(k.dummy && m.node(g).dummy) && r(x, $, g);
          });
        }), B = O + 1, I = F);
      }), C;
    }
    return _.length && _.reduce(w), x;
  }
  function i(m, _) {
    let x = {};
    function w(C, I, B, T, M) {
      let V;
      t.range(I, B).forEach((O) => {
        V = C[O], m.node(V).dummy && m.predecessors(V).forEach((E) => {
          let F = m.node(E);
          F.dummy && (F.order < T || F.order > M) && r(x, E, V);
        });
      });
    }
    function b(C, I) {
      let B = -1, T, M = 0;
      return I.forEach((V, O) => {
        if (m.node(V).dummy === "border") {
          let E = m.predecessors(V);
          E.length && (T = m.node(E[0]).order, w(I, M, O, B, T), M = O, B = T);
        }
        w(I, M, I.length, T, C.length);
      }), I;
    }
    return _.length && _.reduce(b), x;
  }
  function o(m, _) {
    if (m.node(_).dummy)
      return m.predecessors(_).find((x) => m.node(x).dummy);
  }
  function r(m, _, x) {
    if (_ > x) {
      let b = _;
      _ = x, x = b;
    }
    let w = m[_];
    w || (m[_] = w = {}), w[x] = !0;
  }
  function a(m, _, x) {
    if (_ > x) {
      let w = _;
      _ = x, x = w;
    }
    return !!m[_] && Object.hasOwn(m[_], x);
  }
  function s(m, _, x, w) {
    let b = {}, C = {}, I = {};
    return _.forEach((B) => {
      B.forEach((T, M) => {
        b[T] = T, C[T] = T, I[T] = M;
      });
    }), _.forEach((B) => {
      let T = -1;
      B.forEach((M) => {
        let V = w(M);
        if (V.length) {
          V = V.sort((E, F) => I[E] - I[F]);
          let O = (V.length - 1) / 2;
          for (let E = Math.floor(O), F = Math.ceil(O); E <= F; ++E) {
            let g = V[E];
            C[M] === M && T < I[g] && !a(x, M, g) && (C[g] = M, C[M] = b[M] = b[g], T = I[g]);
          }
        }
      });
    }), { root: b, align: C };
  }
  function l(m, _, x, w, b) {
    let C = {}, I = c(m, _, x, b), B = b ? "borderLeft" : "borderRight";
    function T(O, E) {
      let F = I.nodes(), g = F.pop(), $ = {};
      for (; g; )
        $[g] ? O(g) : ($[g] = !0, F.push(g), F = F.concat(E(g))), g = F.pop();
    }
    function M(O) {
      C[O] = I.inEdges(O).reduce((E, F) => Math.max(E, C[F.v] + I.edge(F)), 0);
    }
    function V(O) {
      let E = I.outEdges(O).reduce((g, $) => Math.min(g, C[$.w] - I.edge($)), Number.POSITIVE_INFINITY), F = m.node(O);
      E !== Number.POSITIVE_INFINITY && F.borderType !== B && (C[O] = Math.max(C[O], E));
    }
    return T(M, I.predecessors.bind(I)), T(V, I.successors.bind(I)), Object.keys(w).forEach((O) => C[O] = C[x[O]]), C;
  }
  function c(m, _, x, w) {
    let b = new e(), C = m.graph(), I = v(C.nodesep, C.edgesep, w);
    return _.forEach((B) => {
      let T;
      B.forEach((M) => {
        let V = x[M];
        if (b.setNode(V), T) {
          var O = x[T], E = b.edge(O, V);
          b.setEdge(O, V, Math.max(I(m, M, T), E || 0));
        }
        T = M;
      });
    }), b;
  }
  function u(m, _) {
    return Object.values(_).reduce((x, w) => {
      let b = Number.NEGATIVE_INFINITY, C = Number.POSITIVE_INFINITY;
      Object.entries(w).forEach(([B, T]) => {
        let M = y(m, B) / 2;
        b = Math.max(T + M, b), C = Math.min(T - M, C);
      });
      const I = b - C;
      return I < x[0] && (x = [I, w]), x;
    }, [Number.POSITIVE_INFINITY, null])[1];
  }
  function d(m, _) {
    let x = Object.values(_), w = t.applyWithChunking(Math.min, x), b = t.applyWithChunking(Math.max, x);
    ["u", "d"].forEach((C) => {
      ["l", "r"].forEach((I) => {
        let B = C + I, T = m[B];
        if (T === _) return;
        let M = Object.values(T), V = w - t.applyWithChunking(Math.min, M);
        I !== "l" && (V = b - t.applyWithChunking(Math.max, M)), V && (m[B] = t.mapValues(T, (O) => O + V));
      });
    });
  }
  function f(m, _) {
    return t.mapValues(m.ul, (x, w) => {
      if (_)
        return m[_.toLowerCase()][w];
      {
        let b = Object.values(m).map((C) => C[w]).sort((C, I) => C - I);
        return (b[1] + b[2]) / 2;
      }
    });
  }
  function p(m) {
    let _ = t.buildLayerMatrix(m), x = Object.assign(
      n(m, _),
      i(m, _)
    ), w = {}, b;
    ["u", "d"].forEach((I) => {
      b = I === "u" ? _ : Object.values(_).reverse(), ["l", "r"].forEach((B) => {
        B === "r" && (b = b.map((O) => Object.values(O).reverse()));
        let T = (I === "u" ? m.predecessors : m.successors).bind(m), M = s(m, b, x, T), V = l(
          m,
          b,
          M.root,
          M.align,
          B === "r"
        );
        B === "r" && (V = t.mapValues(V, (O) => -O)), w[I + B] = V;
      });
    });
    let C = u(m, w);
    return d(w, C), f(w, m.graph().align);
  }
  function v(m, _, x) {
    return (w, b, C) => {
      let I = w.node(b), B = w.node(C), T = 0, M;
      if (T += I.width / 2, Object.hasOwn(I, "labelpos"))
        switch (I.labelpos.toLowerCase()) {
          case "l":
            M = -I.width / 2;
            break;
          case "r":
            M = I.width / 2;
            break;
        }
      if (M && (T += x ? M : -M), M = 0, T += (I.dummy ? _ : m) / 2, T += (B.dummy ? _ : m) / 2, T += B.width / 2, Object.hasOwn(B, "labelpos"))
        switch (B.labelpos.toLowerCase()) {
          case "l":
            M = B.width / 2;
            break;
          case "r":
            M = -B.width / 2;
            break;
        }
      return M && (T += x ? M : -M), M = 0, T;
    };
  }
  function y(m, _) {
    return m.node(_).width;
  }
  return Na;
}
var Ia, Cc;
function US() {
  if (Cc) return Ia;
  Cc = 1;
  let e = Ge(), t = qS().positionX;
  Ia = n;
  function n(o) {
    o = e.asNonCompoundGraph(o), i(o), Object.entries(t(o)).forEach(([r, a]) => o.node(r).x = a);
  }
  function i(o) {
    let r = e.buildLayerMatrix(o), a = o.graph().ranksep, s = 0;
    r.forEach((l) => {
      const c = l.reduce((u, d) => {
        const f = o.node(d).height;
        return u > f ? u : f;
      }, 0);
      l.forEach((u) => o.node(u).y = s + c / 2), s += c + a;
    });
  }
  return Ia;
}
var Aa, Nc;
function WS() {
  if (Nc) return Aa;
  Nc = 1;
  let e = SS(), t = CS(), n = IS(), i = Ge().normalizeRanks, o = AS(), r = Ge().removeEmptyRanks, a = TS(), s = MS(), l = OS(), c = HS(), u = US(), d = Ge(), f = wt().Graph;
  Aa = p;
  function p(Y, J) {
    let j = J && J.debugTiming ? d.time : d.notime;
    j("layout", () => {
      let X = j("  buildLayoutGraph", () => T(Y));
      j("  runLayout", () => v(X, j, J)), j("  updateInputGraph", () => y(Y, X));
    });
  }
  function v(Y, J, j) {
    J("    makeSpaceForEdgeLabels", () => M(Y)), J("    removeSelfEdges", () => q(Y)), J("    acyclic", () => e.run(Y)), J("    nestingGraph.run", () => a.run(Y)), J("    rank", () => n(d.asNonCompoundGraph(Y))), J("    injectEdgeLabelProxies", () => V(Y)), J("    removeEmptyRanks", () => r(Y)), J("    nestingGraph.cleanup", () => a.cleanup(Y)), J("    normalizeRanks", () => i(Y)), J("    assignRankMinMax", () => O(Y)), J("    removeEdgeLabelProxies", () => E(Y)), J("    normalize.run", () => t.run(Y)), J("    parentDummyChains", () => o(Y)), J("    addBorderSegments", () => s(Y)), J("    order", () => c(Y, j)), J("    insertSelfEdges", () => ee(Y)), J("    adjustCoordinateSystem", () => l.adjust(Y)), J("    position", () => u(Y)), J("    positionSelfEdges", () => Z(Y)), J("    removeBorderNodes", () => H(Y)), J("    normalize.undo", () => t.undo(Y)), J("    fixupEdgeLabelCoords", () => $(Y)), J("    undoCoordinateSystem", () => l.undo(Y)), J("    translateGraph", () => F(Y)), J("    assignNodeIntersects", () => g(Y)), J("    reversePoints", () => k(Y)), J("    acyclic.undo", () => e.undo(Y));
  }
  function y(Y, J) {
    Y.nodes().forEach((j) => {
      let X = Y.node(j), te = J.node(j);
      X && (X.x = te.x, X.y = te.y, X.rank = te.rank, J.children(j).length && (X.width = te.width, X.height = te.height));
    }), Y.edges().forEach((j) => {
      let X = Y.edge(j), te = J.edge(j);
      X.points = te.points, Object.hasOwn(te, "x") && (X.x = te.x, X.y = te.y);
    }), Y.graph().width = J.graph().width, Y.graph().height = J.graph().height;
  }
  let m = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"], _ = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" }, x = ["acyclicer", "ranker", "rankdir", "align"], w = ["width", "height", "rank"], b = { width: 0, height: 0 }, C = ["minlen", "weight", "width", "height", "labeloffset"], I = {
    minlen: 1,
    weight: 1,
    width: 0,
    height: 0,
    labeloffset: 10,
    labelpos: "r"
  }, B = ["labelpos"];
  function T(Y) {
    let J = new f({ multigraph: !0, compound: !0 }), j = se(Y.graph());
    return J.setGraph(Object.assign(
      {},
      _,
      oe(j, m),
      d.pick(j, x)
    )), Y.nodes().forEach((X) => {
      let te = se(Y.node(X));
      const ae = oe(te, w);
      Object.keys(b).forEach((ue) => {
        ae[ue] === void 0 && (ae[ue] = b[ue]);
      }), J.setNode(X, ae), J.setParent(X, Y.parent(X));
    }), Y.edges().forEach((X) => {
      let te = se(Y.edge(X));
      J.setEdge(X, Object.assign(
        {},
        I,
        oe(te, C),
        d.pick(te, B)
      ));
    }), J;
  }
  function M(Y) {
    let J = Y.graph();
    J.ranksep /= 2, Y.edges().forEach((j) => {
      let X = Y.edge(j);
      X.minlen *= 2, X.labelpos.toLowerCase() !== "c" && (J.rankdir === "TB" || J.rankdir === "BT" ? X.width += X.labeloffset : X.height += X.labeloffset);
    });
  }
  function V(Y) {
    Y.edges().forEach((J) => {
      let j = Y.edge(J);
      if (j.width && j.height) {
        let X = Y.node(J.v), ae = { rank: (Y.node(J.w).rank - X.rank) / 2 + X.rank, e: J };
        d.addDummyNode(Y, "edge-proxy", ae, "_ep");
      }
    });
  }
  function O(Y) {
    let J = 0;
    Y.nodes().forEach((j) => {
      let X = Y.node(j);
      X.borderTop && (X.minRank = Y.node(X.borderTop).rank, X.maxRank = Y.node(X.borderBottom).rank, J = Math.max(J, X.maxRank));
    }), Y.graph().maxRank = J;
  }
  function E(Y) {
    Y.nodes().forEach((J) => {
      let j = Y.node(J);
      j.dummy === "edge-proxy" && (Y.edge(j.e).labelRank = j.rank, Y.removeNode(J));
    });
  }
  function F(Y) {
    let J = Number.POSITIVE_INFINITY, j = 0, X = Number.POSITIVE_INFINITY, te = 0, ae = Y.graph(), ue = ae.marginx || 0, we = ae.marginy || 0;
    function $e(ve) {
      let me = ve.x, L = ve.y, R = ve.width, A = ve.height;
      J = Math.min(J, me - R / 2), j = Math.max(j, me + R / 2), X = Math.min(X, L - A / 2), te = Math.max(te, L + A / 2);
    }
    Y.nodes().forEach((ve) => $e(Y.node(ve))), Y.edges().forEach((ve) => {
      let me = Y.edge(ve);
      Object.hasOwn(me, "x") && $e(me);
    }), J -= ue, X -= we, Y.nodes().forEach((ve) => {
      let me = Y.node(ve);
      me.x -= J, me.y -= X;
    }), Y.edges().forEach((ve) => {
      let me = Y.edge(ve);
      me.points.forEach((L) => {
        L.x -= J, L.y -= X;
      }), Object.hasOwn(me, "x") && (me.x -= J), Object.hasOwn(me, "y") && (me.y -= X);
    }), ae.width = j - J + ue, ae.height = te - X + we;
  }
  function g(Y) {
    Y.edges().forEach((J) => {
      let j = Y.edge(J), X = Y.node(J.v), te = Y.node(J.w), ae, ue;
      j.points ? (ae = j.points[0], ue = j.points[j.points.length - 1]) : (j.points = [], ae = te, ue = X), j.points.unshift(d.intersectRect(X, ae)), j.points.push(d.intersectRect(te, ue));
    });
  }
  function $(Y) {
    Y.edges().forEach((J) => {
      let j = Y.edge(J);
      if (Object.hasOwn(j, "x"))
        switch ((j.labelpos === "l" || j.labelpos === "r") && (j.width -= j.labeloffset), j.labelpos) {
          case "l":
            j.x -= j.width / 2 + j.labeloffset;
            break;
          case "r":
            j.x += j.width / 2 + j.labeloffset;
            break;
        }
    });
  }
  function k(Y) {
    Y.edges().forEach((J) => {
      let j = Y.edge(J);
      j.reversed && j.points.reverse();
    });
  }
  function H(Y) {
    Y.nodes().forEach((J) => {
      if (Y.children(J).length) {
        let j = Y.node(J), X = Y.node(j.borderTop), te = Y.node(j.borderBottom), ae = Y.node(j.borderLeft[j.borderLeft.length - 1]), ue = Y.node(j.borderRight[j.borderRight.length - 1]);
        j.width = Math.abs(ue.x - ae.x), j.height = Math.abs(te.y - X.y), j.x = ae.x + j.width / 2, j.y = X.y + j.height / 2;
      }
    }), Y.nodes().forEach((J) => {
      Y.node(J).dummy === "border" && Y.removeNode(J);
    });
  }
  function q(Y) {
    Y.edges().forEach((J) => {
      if (J.v === J.w) {
        var j = Y.node(J.v);
        j.selfEdges || (j.selfEdges = []), j.selfEdges.push({ e: J, label: Y.edge(J) }), Y.removeEdge(J);
      }
    });
  }
  function ee(Y) {
    var J = d.buildLayerMatrix(Y);
    J.forEach((j) => {
      var X = 0;
      j.forEach((te, ae) => {
        var ue = Y.node(te);
        ue.order = ae + X, (ue.selfEdges || []).forEach((we) => {
          d.addDummyNode(Y, "selfedge", {
            width: we.label.width,
            height: we.label.height,
            rank: ue.rank,
            order: ae + ++X,
            e: we.e,
            label: we.label
          }, "_se");
        }), delete ue.selfEdges;
      });
    });
  }
  function Z(Y) {
    Y.nodes().forEach((J) => {
      var j = Y.node(J);
      if (j.dummy === "selfedge") {
        var X = Y.node(j.e.v), te = X.x + X.width / 2, ae = X.y, ue = j.x - te, we = X.height / 2;
        Y.setEdge(j.e, j.label), Y.removeNode(J), j.label.points = [
          { x: te + 2 * ue / 3, y: ae - we },
          { x: te + 5 * ue / 6, y: ae - we },
          { x: te + ue, y: ae },
          { x: te + 5 * ue / 6, y: ae + we },
          { x: te + 2 * ue / 3, y: ae + we }
        ], j.label.x = j.x, j.label.y = j.y;
      }
    });
  }
  function oe(Y, J) {
    return d.mapValues(d.pick(Y, J), Number);
  }
  function se(Y) {
    var J = {};
    return Y && Object.entries(Y).forEach(([j, X]) => {
      typeof j == "string" && (j = j.toLowerCase()), J[j] = X;
    }), J;
  }
  return Aa;
}
var Ta, Ic;
function YS() {
  if (Ic) return Ta;
  Ic = 1;
  let e = Ge(), t = wt().Graph;
  Ta = {
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
  return Ta;
}
var Ma, Ac;
function GS() {
  return Ac || (Ac = 1, Ma = "1.1.8"), Ma;
}
var Oa, Tc;
function jS() {
  return Tc || (Tc = 1, Oa = {
    graphlib: wt(),
    layout: WS(),
    debug: YS(),
    util: {
      time: Ge().time,
      notime: Ge().notime
    },
    version: GS()
  }), Oa;
}
var XS = jS();
const Mc = /* @__PURE__ */ dS(XS), Zo = 26, Oc = 26, KS = 120;
function qh(e) {
  const t = [{ id: "result", label: "Finished" }];
  return (e.child_interface?.error_schema != null || e.error_schema != null) && t.push({ id: "failed", label: "Failed" }), t;
}
function dr(e) {
  if (!$d(e.kind)) return !1;
  const n = (e.config || {}).flow_ref;
  if (!n || typeof n != "object" || Array.isArray(n)) return !1;
  const i = n;
  return i.kind === "flow" && typeof i.id == "string" && i.id.length > 0 && typeof i.version == "number" && Number.isInteger(i.version) && i.version > 0;
}
function Rn(e) {
  return dr(e) ? qh(e).filter((t) => t.id !== Nt.id) : Ji(e.kind, e.ref).filter((t) => t.id !== Nt.id);
}
function ZS(e) {
  return (dr(e) ? void 0 : bi(e.kind, e.ref).continuation) || Rn(e)[0]?.id || void 0;
}
function sl(e) {
  return dr(e) ? qh(e).some((t) => t.id === Nt.id) : Ji(e.kind, e.ref).some((t) => t.id === Nt.id);
}
function pn(e) {
  const t = Rn(e);
  return Qf(t, sl(e));
}
function Uh(e) {
  return !!e && Number.isFinite(e.x) && Number.isFinite(e.y);
}
function ds(e, t, n, i) {
  const o = e.positions[t];
  return Uh(o) ? o : i[t] ? i[t] : { x: 60 + n % 4 * 280, y: 60 + Math.floor(n / 4) * 170 };
}
function Nn(e, t = "TB") {
  const i = Object.keys(e.nodes).some((r) => !Uh(e.positions[r])) ? Yh(e, t) : {}, o = {};
  return Object.values(e.nodes).forEach((r, a) => {
    o[r.id] = ds(e, r.id, a, i);
  }), o;
}
function JS(e) {
  const t = {};
  for (const n of Object.values(e.edges)) (t[n.source_id] ||= []).push(n);
  return t;
}
function QS(e, t, n) {
  let i = 1 / 0, o = 1 / 0, r = -1 / 0, a = -1 / 0;
  for (const s of t) {
    const l = n[s];
    if (!l) continue;
    i = Math.min(i, l.x), o = Math.min(o, l.y);
    const c = pn(e.nodes[s]);
    r = Math.max(r, l.x + c.width), a = Math.max(a, l.y + c.height);
  }
  return Number.isFinite(i) || (i = 0, o = 0, r = yo, a = Ao), {
    x: i - Zo,
    y: o - Zo - Oc,
    width: r - i + Zo * 2,
    height: a - o + Zo * 2 + Oc
  };
}
function fr(e, t, n) {
  const i = n || JS(e), o = {}, r = [], a = Object.values(e.nodes).filter((s) => wi(s.kind) || s.kind === "cycle").map((s) => s.id).sort();
  for (const s of a) {
    const l = [], c = /* @__PURE__ */ new Set(), u = (i[s] || []).filter((d) => d.source_port === "body").map((d) => d.target_id);
    for (; u.length; ) {
      const d = u.pop();
      if (!(d === s || c.has(d) || !e.nodes[d]) && (c.add(d), !o[d])) {
        o[d] = s, l.push(d);
        for (const f of i[d] || []) u.push(f.target_id);
      }
    }
    l.length && r.push({ id: s, kind: e.nodes[s].kind, members: l, box: QS(e, l, t) });
  }
  return { containers: r, parentOf: o };
}
function eC(e, t, n, i, o, r = KS) {
  let a = 1 / 0, s = 1 / 0, l = -1 / 0, c = -1 / 0;
  const u = i[t], d = (p, v, y) => {
    const m = pn(e.nodes[p]);
    a = Math.min(a, v), s = Math.min(s, y), l = Math.max(l, v + m.width), c = Math.max(c, y + m.height);
  };
  u && d(t, u.x, u.y);
  for (const p of n) {
    if (p === o) continue;
    const v = i[p];
    v && d(p, v.x, v.y);
  }
  Number.isFinite(a) || (a = 0, s = 0, l = yo, c = Ao);
  const f = o && e.nodes[o] ? pn(e.nodes[o]) : null;
  return {
    x: a - r,
    y: s - r,
    width: Math.max(l - a + r * 2, f?.width || 0),
    height: Math.max(c - s + r * 2, f?.height || 0)
  };
}
function tC(e, t, n, i = { width: yo, height: Ao }) {
  const o = Math.max(n.x, n.x + n.width - i.width), r = Math.max(n.y, n.y + n.height - i.height);
  return {
    x: Math.min(Math.max(e, n.x), o),
    y: Math.min(Math.max(t, n.y), r)
  };
}
function Wh(e, t, n, i) {
  const { containers: o } = fr(e, n, i);
  let r = null;
  for (const a of o) {
    const s = a.box;
    t.x < s.x || t.x > s.x + s.width || t.y < s.y || t.y > s.y + s.height || (!r || s.width * s.height < r.box.width * r.box.height) && (r = a);
  }
  return r?.id ?? null;
}
function nC(e, t) {
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
function Yh(e, t, n) {
  const i = Object.keys(e.nodes);
  if (!i.length) return {};
  const o = {}, r = nC(e, i).map((p) => {
    const v = new Set(p), y = new Mc.graphlib.Graph();
    y.setGraph({ rankdir: t, nodesep: 48, ranksep: 84, marginx: 0, marginy: 0 }), y.setDefaultEdgeLabel(() => ({}));
    for (const I of p) y.setNode(I, pn(e.nodes[I]));
    const m = /* @__PURE__ */ new Set();
    for (const I of Object.values(e.edges)) {
      if (!v.has(I.source_id) || !v.has(I.target_id)) continue;
      const B = `${I.source_id}->${I.target_id}`;
      m.has(B) || (m.add(B), y.setEdge(I.source_id, I.target_id));
    }
    Mc.layout(y);
    let _ = 1 / 0, x = 1 / 0, w = -1 / 0, b = -1 / 0;
    const C = {};
    for (const I of p) {
      const B = y.node(I);
      if (!B) continue;
      const T = B.x - B.width / 2, M = B.y - B.height / 2;
      C[I] = { x: T, y: M }, _ = Math.min(_, T), x = Math.min(x, M), w = Math.max(w, T + B.width), b = Math.max(b, M + B.height);
    }
    for (const I of Object.values(C))
      I.x -= _, I.y -= x;
    return { ids: p, local: C, width: w - _, height: b - x };
  }), a = Math.max(0.01, n?.minZoom || 1), s = Math.max(Pi, (n?.width || 1200) / a - 80), l = Math.max(Ao, (n?.height || 800) / a - 80), c = s <= Pi + 8 ? 6 : Math.max(12, Math.min(48, Math.floor(Math.min(s, l) * 0.04)));
  let u = 40, d = 40, f = 0;
  for (const p of r)
    if (t === "TB") {
      u > 40 && u + p.width > 40 + s && (u = 40, d += f + c, f = 0);
      for (const v of p.ids) o[v] = { x: Math.round(u + p.local[v].x), y: Math.round(d + p.local[v].y) };
      u += p.width + c, f = Math.max(f, p.height);
    } else {
      d > 40 && d + p.height > 40 + l && (d = 40, u += f + c, f = 0);
      for (const v of p.ids) o[v] = { x: Math.round(u + p.local[v].x), y: Math.round(d + p.local[v].y) };
      d += p.height + c, f = Math.max(f, p.width);
    }
  return o;
}
const oC = 200, iC = 120, rC = 420, aC = 280;
function sC(e) {
  const t = e.child_interface, n = t?.input_schema ?? e.input_schema, i = t?.output_schema ?? e.output_schema;
  if (!(n == null && i == null))
    return `${Ml(n)} → ${Ml(i)}`;
}
function Gh(e, t, n = "TB", i, o = !1) {
  const r = [], a = Object.values(e.nodes), s = Nn(e, n), l = {};
  for (const v of Object.values(e.edges)) (l[v.source_id] ||= []).push(v);
  const c = Object.values(e.notes);
  c.forEach((v, y) => {
    if (v.kind !== "frame") return;
    const m = ds(e, v.id, y, {}), _ = m.width || v.width || rC, x = m.height || v.height || aC;
    r.push({
      id: v.id,
      type: "wfFrame",
      ariaLabel: `Frame: ${v.text || "Untitled frame"}`,
      focusable: !0,
      position: { x: m.x, y: m.y },
      data: { text: v.text, kind: "frame", width: _, height: x, color: v.color },
      zIndex: 0,
      style: { width: `${_}px`, height: `${x}px` }
    });
  });
  const { containers: u } = fr(e, s, l);
  for (const v of u) {
    const y = e.nodes[v.id];
    r.push({
      id: `__box_${v.id}`,
      type: "wfContainer",
      position: { x: v.box.x, y: v.box.y },
      class: "wf-container-node",
      data: {
        kind: v.kind,
        label: Je(y.title, y.ref),
        icon: bi(v.kind).icon
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
  c.forEach((v, y) => {
    if (v.kind === "frame") return;
    const m = ds(e, v.id, y, {}), _ = m.width || v.width || oC, x = m.height || v.height || iC;
    r.push({
      id: v.id,
      type: "wfNote",
      ariaLabel: `Note: ${v.text || "Empty note"}`,
      focusable: !0,
      position: { x: m.x, y: m.y },
      data: { text: v.text, kind: "note", width: _, height: x, color: v.color },
      zIndex: 0,
      style: { width: `${_}px`, height: `${x}px` }
    });
  });
  const d = {};
  a.forEach((v) => {
    const y = bi(v.kind, v.ref), m = s[v.id], _ = Ss(v.kind) ? v.kind : void 0, x = !!_ || v.pinned === !0 || !!v.boundary, w = dr(v), b = Rn(v), C = sl(v), I = C && (l[v.id] || []).some((M) => Fa(M.source_port)), B = Je(v.title, v.ref), T = t?.node[v.id] || "idle";
    d[v.id] = lC(b, _, C), r.push({
      id: v.id,
      type: "wfNode",
      ariaLabel: `${y.label} step: ${B}${T === "idle" ? "" : `, status ${T}`}`,
      focusable: !0,
      position: { x: m.x, y: m.y },
      zIndex: 1,
      data: {
        kind: v.kind,
        kindLabel: y.label,
        title: B,
        ref: v.ref_label || v.ref || "",
        icon: v.icon || y.icon,
        hueVar: y.hueVar,
        runStatus: T,
        outPorts: b,
        failedPort: C,
        failedWired: I,
        pinned: x,
        boundaryRole: _,
        awaitingLabel: "Waiting",
        awaitingIcon: "tabler:hourglass",
        sub: w ? sC(v) : void 0,
        issue: i?.get(v.id)
      }
    });
  });
  const f = new Set(a.map((v) => v.id)), p = [];
  for (const v of Object.values(e.edges)) {
    if (!f.has(v.source_id) || !f.has(v.target_id)) continue;
    const y = e.nodes[v.source_id], m = e.nodes[v.target_id], _ = Cs(e, v), x = Qi(m), w = Ns(m, x), b = !v.transform && uS(_, x) === "needs-mapping", C = cS(v, x, _), I = Je(y.title, y.ref), B = Je(m.title, m.ref), T = Fa(v.source_port) ? "Failed" : Rn(y).find((V) => V.id === (v.source_port || ""))?.label, M = `Connection from ${I}${T ? `, ${T} output` : ""} to ${B}`;
    p.push(uC(
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
      M
    ));
  }
  return { flowNodes: r, flowEdges: p };
}
function lC(e, t, n = !1) {
  const i = t === "start" ? [] : ["in-top", "in-left"], o = e.length > 1 || (e[0]?.id ?? "") !== "", r = t !== "finish" && t !== "error", a = r ? o ? e.map((s) => s.id) : ["out-bottom", "out-right"] : [];
  return r && n && a.push(Nt.id), { sources: a, targets: i };
}
function Rc(e, t, n) {
  const i = e || n;
  return !t || t.includes(i) ? i : t.includes(n) ? n : t[0] ?? n;
}
function uC(e, t, n = !1, i = [], o = "TB", r, a = !1, s) {
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
  return d.sourceHandle = Rc(
    e.source_port,
    r?.sources,
    o === "LR" ? "out-right" : "out-bottom"
  ), d.targetHandle = Rc(
    e.target_port,
    r?.targets,
    o === "LR" ? "in-left" : "in-top"
  ), d;
}
function Fi(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function cC(e) {
  const t = e.match === "exact" ? "the names match" : `“${e.sourceName}” is the same field name`, n = e.typed ? "the types are compatible" : "the upstream type isn’t declared, so type wasn’t checked";
  return `${e.title} ← ${e.expr} · ${t} and ${n}.`;
}
function dC(e, t) {
  return Eh(e, t).map((i) => ({ name: i.name, expr: i.expr, type: i.type || "any" }));
}
function Dc(e, t) {
  const n = Fi(e.key), i = e.type || "any";
  return t.filter((o) => Fi(o.name) === n && nl(o.type, i));
}
function fC(e, t) {
  const n = Fi(e.key);
  return t.some((o) => Fi(o.name) === n) ? "type" : "none";
}
function hC(e, t) {
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
    why: cC({ title: e.title || e.key, expr: t.expr, sourceName: t.name, match: n, typed: i })
  };
}
function pC(e, t, n = "output") {
  const i = To(t);
  if (!i.length || !zn(t))
    return { status: "skip", fields: [], transform: "", unresolved: [] };
  const o = dC(e, n), r = [], a = [];
  for (const l of i) {
    const c = Dc(l, o);
    if (c.length === 1) {
      a.push(hC(l, c[0]));
      continue;
    }
    if (l.required) {
      const u = c.length > 1 ? "multiple" : fC(l, o);
      r.push({
        key: l.key,
        title: l.title || l.key,
        reason: u,
        candidates: (c.length > 1 ? c : Dc(l, o)).map((d) => d.expr)
      });
    }
  }
  if (r.length)
    return { status: "ambiguous", fields: [], transform: "", unresolved: r };
  if (!a.length)
    return { status: "skip", fields: [], transform: "", unresolved: [] };
  const s = a.map((l) => ({ key: l.key, mode: "expr", value: l.expr }));
  return { status: "auto", fields: a, transform: ls(s), unresolved: [] };
}
function vC(e, t) {
  const n = e.nodes[t];
  return n ? Ji(n.kind, n.ref).some((o) => o.id === "failed") : !1;
}
function mC(e, t, n, i = gt) {
  const o = e.edges[t.id];
  if (!o) return null;
  if (n.kind === "mapping")
    return {
      commands: [Ei(o.id, { transform: n.transform })],
      select: { kind: "edge", id: o.id },
      refit: !1
    };
  if (n.kind === "failure_route") {
    const r = e.nodes[o.source_id];
    return !n.available || !r || !vC(e, r.id) ? null : {
      commands: [
        // A success-path transform is not valid for the stable {code,message} failure
        // envelope. Clear it and let the normal mapper loudness guide any recovery input.
        Ei(o.id, { source_port: "failed", transform: "" })
      ],
      select: { kind: "edge", id: o.id },
      refit: !1
    };
  }
  if (n.kind === "condition") {
    const r = i(), a = i(), s = i(), l = [
      xi(o.id),
      _i({
        id: r,
        kind: "branch",
        title: "Condition",
        config: { predicate: n.predicate }
      }),
      ki({
        id: a,
        source_id: o.source_id,
        target_id: r,
        source_port: o.source_port
      }),
      ki({
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
function gC(e, t, n) {
  const i = t.source, o = t.target;
  if (!i || !o) return null;
  const r = Nn(e, n), { parentOf: a } = fr(e, r), s = t.sourceHandle === "body" ? i : a[i];
  if (!s || a[o] === s || Wh(e, r[o], r) === s) return null;
  const l = r[i];
  return l ? { x: l.x, y: l.y + 120 } : null;
}
function fs(e, t, n) {
  const i = e.nodes[t.source], o = e.nodes[t.target], r = Vu(t.sourceHandle) && i?.kind === "start" ? "out" : kn(t.sourceHandle), a = Vu(t.targetHandle) && (o?.kind === "finish" || o?.kind === "error") ? "in" : kn(t.targetHandle), s = {
    source: t.source,
    target: t.target,
    sourceHandle: r,
    targetHandle: a
  };
  if (!Ph(s, Object.values(e.edges))) return null;
  const l = gt(), c = [ki({
    id: l,
    source_id: t.source,
    target_id: t.target,
    source_port: r,
    target_port: a
  })], u = gC(e, t, n);
  u && c.push(Ct(t.target, u.x, u.y));
  const d = e.nodes[t.source], f = e.nodes[t.target], p = Cs(e, { source_id: t.source, source_port: t.sourceHandle || void 0 });
  let v = Qi(f);
  const y = Zm(p, f);
  y && f && (c.push(Hd(f.id, { config: { ...f.config || {}, output_schema: y } })), v = y);
  const m = pC(p, v, "output"), _ = d ? Ji(d.kind, d.ref) : [], x = !!d && _.some((b) => b.id === "failed");
  let w = y ? "adopt-finish" : Ns(f, v) ? "contract-unavailable" : "plain";
  return !y && w !== "contract-unavailable" && m.status === "auto" ? (c.push(Ei(l, { transform: m.transform })), w = "auto") : !y && w !== "contract-unavailable" && m.status === "ambiguous" && (w = "ambiguous"), { edgeId: l, cmds: c, action: w, result: m, sourceId: t.source, targetId: t.target, sourceSchema: p, targetSchema: v, sourceFailureAvailable: x };
}
function yC(e, t, n, i, o) {
  const r = e.edges[t];
  if (!r) return null;
  const a = { ...e }, s = [...i, xi(t)];
  Vi(a, s);
  const l = a.nodes[n];
  if (!l || Ss(l.kind)) return null;
  const c = fs(a, {
    source: r.source_id,
    sourceHandle: r.source_port ?? null,
    target: n,
    targetHandle: null
  }, o);
  if (!c) return null;
  Vi(a, c.cmds);
  const u = fs(a, {
    source: n,
    sourceHandle: ZS(l) ?? null,
    target: r.target_id,
    targetHandle: r.target_port ?? null
  }, o);
  return u ? [...s, ...c.cmds, ...u.cmds] : null;
}
function wC(e) {
  const { engine: t, apply: n, select: i, layoutDir: o, viewingRun: r } = e, a = G(null), s = G(""), l = G(null), c = G(null), u = xs(/* @__PURE__ */ new Map()), d = G(0);
  function f() {
    d.value++;
  }
  function p() {
    return { stroke: a.value === "error" ? "var(--wf-danger)" : a.value === "warn" ? "var(--wf-amber)" : a.value === "ok" ? "var(--p-success-500)" : "var(--wf-line-strong)", strokeWidth: 2, strokeDasharray: "4 3" };
  }
  function v(E) {
    if (!Ph(E, Object.values(t.doc.edges)))
      return a.value = "error", s.value = E.source && E.source === E.target ? "A step can’t connect to itself." : "These steps are already connected.", "error";
    const F = t.doc.nodes[E.target || ""], g = Cs(t.doc, { source_id: E.source || "", source_port: E.sourceHandle || void 0 }), $ = Qi(F);
    if (Ns(F, $))
      return a.value = "warn", s.value = "Input fields are still loading — connect to keep the route visible.", "warn";
    const k = rl(g, $);
    return k.status === "error" ? (a.value = "warn", s.value = "Needs a mapping — connect, then describe what flows here.", "warn") : (a.value = k.status, s.value = "", k.status);
  }
  function y(E) {
    return "id" in E ? !0 : r.value ? !1 : v(E) !== "error";
  }
  function m() {
    a.value = null, s.value = "", l.value = null;
  }
  function _(E) {
    if (m(), r.value) return;
    const F = fs(t.doc, E, o.value);
    F && (u.clear(), c.value = null, n(F.cmds), F.action === "auto" ? (u.set(F.edgeId, { id: F.edgeId, sourceId: F.sourceId, targetId: F.targetId, result: F.result }), c.value = null, f()) : F.action === "ambiguous" ? (c.value = {
      id: F.edgeId,
      sourceId: F.sourceId,
      targetId: F.targetId,
      sourceSchema: F.sourceSchema,
      targetSchema: F.targetSchema,
      sourceRoot: "output",
      sourceFailureAvailable: F.sourceFailureAvailable,
      unresolved: F.result.unresolved
    }, f()) : (F.action === "plain" || F.action === "contract-unavailable") && i("edge", F.edgeId));
  }
  function x() {
    c.value = null, f();
  }
  function w() {
    const E = !!c.value || u.size > 0;
    c.value = null, u.clear(), E && f();
  }
  function b(E) {
    const F = c.value;
    if (!F) return;
    const g = mC(t.doc, F, E);
    g && (g.commands.length && n(g.commands, g.refit), g.select && i(g.select.kind, g.select.id), c.value = null, f());
  }
  function C() {
    const E = c.value;
    E && (i("edge", E.id), c.value = null, f());
  }
  function I(E) {
    u.delete(E) && f();
  }
  function B(E) {
    i("edge", E), u.delete(E) && f();
  }
  function T(E) {
    for (const F of [...u.keys()])
      E.has(F) || u.delete(F);
    c.value && !E.has(c.value.id) && (c.value = null);
  }
  function M(E) {
    for (const F of E) {
      const g = String(F.id), $ = c.value?.id === g ? "wf-edge--pending" : u.has(g) ? "wf-edge--auto" : "";
      if (!$) continue;
      const k = typeof F.class == "string" ? F.class : "";
      F.class = k ? `${k} ${$}` : $;
    }
  }
  function V() {
    m();
  }
  function O(E) {
    a.value && (l.value = { x: E.clientX, y: E.clientY });
  }
  return Ue(() => window.addEventListener("pointerup", m)), Qe(() => window.removeEventListener("pointerup", m)), {
    connectStatus: a,
    connectMessage: s,
    connectXY: l,
    connectLineStyle: p,
    isValidConnection: y,
    resetConnectHint: m,
    onConnect: _,
    onConnectEnd: V,
    onCanvasMouseMove: O,
    // intent-edge
    pendingEdge: c,
    autoMapped: u,
    intentRev: d,
    dismissPending: x,
    clearIntentOverlays: w,
    acceptPending: b,
    openPendingMapper: C,
    dismissAutoMapped: I,
    openAutoMapped: B,
    pruneIntent: T,
    decorateEdges: M
  };
}
const ll = 28, jh = 8;
function bC(e, t = ll, n = jh) {
  const i = (e % n + n) % n;
  return { dx: i * t, dy: i * t };
}
const Xh = 64;
function _C(e, t, n = Xh) {
  return Math.abs(e.x - t.x) < n && Math.abs(e.y - t.y) < n;
}
function kC(e, t, n = ll, i = Xh, o = 40) {
  let r = { x: e.x, y: e.y }, a = 0;
  for (; a < o && t.some((s) => _C(r, s, i)); )
    r = { x: r.x + n, y: r.y + n }, a++;
  return r;
}
function EC(e, t, n = 20) {
  return e.x < t.x + t.width + n && e.x + e.width + n > t.x && e.y < t.y + t.height + n && e.y + e.height + n > t.y;
}
function xC(e, t, n, i = ll, o = 20, r = 24) {
  const a = (s) => !n.some((l) => EC({ ...s, ...t }, l, o));
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
function $C(e) {
  return (e instanceof Element ? e.closest(".vue-flow__edge") : null)?.getAttribute("data-id") || null;
}
function SC(e) {
  const { engine: t, layoutDir: n, apply: i, select: o, catalog: r, getViewport: a, screenToFlowCoordinate: s } = e, l = G(null);
  function c() {
    try {
      const b = a(), C = l.value?.getBoundingClientRect(), I = C ? C.width / 2 : 400, B = C ? C.height / 2 : 260;
      return { x: Math.round((I - b.x) / b.zoom), y: Math.round((B - b.y) / b.zoom) };
    } catch {
      return { x: 200, y: 160 };
    }
  }
  const u = G(0);
  function d() {
    return Object.values(Nn(t.doc, n.value));
  }
  function f(b = Nn(t.doc, n.value)) {
    return Object.entries(b).flatMap(([C, I]) => {
      const B = t.doc.nodes[C];
      if (!B) return [];
      const T = pn(B);
      return [{ x: I.x, y: I.y, width: T.width, height: T.height }];
    });
  }
  function p() {
    const b = c(), { dx: C, dy: I } = bC(u.value);
    return u.value = (u.value + 1) % jh, kC({ x: b.x + C, y: b.y + I }, d());
  }
  function v(b, C, I = {}) {
    const B = C ? (u.value = 0, C) : p(), T = gt(), M = [
      _i({
        id: T,
        kind: b.kind,
        title: b.title,
        ref: b.ref
      }),
      Ct(T, B.x, B.y)
    ], O = (I.edge ? yC(t.doc, I.edge, T, M, n.value) : null) ?? (I.bodyParent ? [...M, ki({ id: gt(), source_id: I.bodyParent, target_id: T, source_port: "body" })] : M);
    return i(O), o("node", T), T;
  }
  function y(b) {
    const C = b ? (u.value = 0, b) : p(), I = gt();
    i([zl({ id: I, text: "" }), Ct(I, C.x, C.y)]), o("note", I);
  }
  function m(b) {
    const C = b ? (u.value = 0, b) : p(), I = gt();
    i([
      zl({ id: I, text: "Frame", kind: "frame", color: "slate" }),
      Ct(I, C.x, C.y, 420, 280)
    ]), o("note", I);
  }
  Zt(mh, (b, C, I, B, T) => {
    t.recordLayoutEcho(b, C, I), i([Ct(b, C, I, B, T)]);
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
      y(I);
      return;
    }
    if (C === "frame:new") {
      m(I);
      return;
    }
    const B = r.value.find((E) => E.paletteId === C);
    if (!B) return;
    const T = Nn(t.doc, n.value), M = Wh(t.doc, I, T), V = pn({ kind: B.kind, title: B.title }), O = M ? I : xC(I, V, f(T));
    v(B, O, { edge: $C(b.target) ?? void 0, bodyParent: M || void 0 });
  }
  function w(b) {
    b.preventDefault(), b.dataTransfer && (b.dataTransfer.dropEffect = "copy");
  }
  return { canvasEl: l, placeItem: v, placeNote: y, placeFrame: m, onDrop: x, onDragOver: w };
}
const CC = /* @__PURE__ */ new Set(["INPUT", "TEXTAREA", "SELECT"]);
function Kh(e) {
  const t = e;
  if (!t) return !1;
  if (t.isContentEditable) return !0;
  const n = t.tagName;
  return typeof n == "string" && CC.has(n.toUpperCase());
}
function NC(e) {
  const t = !!(e.ctrlKey || e.metaKey);
  return t && (e.key === "k" || e.key === "K") ? "palette" : Kh(e.target) ? null : t && (e.key === "z" || e.key === "Z") ? e.shiftKey ? "redo" : "undo" : t && (e.key === "y" || e.key === "Y") ? "redo" : e.shiftKey && !t && (e.key === "1" || e.key === "!") ? "fit" : e.shiftKey && !t && (e.key === "2" || e.key === "@") ? "zoom-selection" : e.key === "Delete" || e.key === "Backspace" ? "delete" : e.key === "Escape" ? "escape" : null;
}
function IC(e) {
  const { deleteSelection: t, runHistory: n, paletteOpen: i, hasSelection: o, clearSelection: r, fit: a, zoomSelection: s } = e, l = G(null);
  function c(p) {
    p.preventDefault(), p.stopPropagation();
  }
  function u(p) {
    return p.composedPath().some((v) => {
      const y = v;
      return typeof y.getAttribute == "function" && y.getAttribute("role") === "dialog";
    });
  }
  function d() {
    Ve(() => {
      l.value?.querySelector(".wf-palette-search input")?.focus();
    });
  }
  function f(p) {
    if (u(p)) return;
    if (Kh(p.target)) {
      p.key === "Escape" && (p.target.blur?.(), c(p));
      return;
    }
    const v = NC({ key: p.key, ctrlKey: p.ctrlKey, metaKey: p.metaKey, shiftKey: p.shiftKey, target: p.target });
    v === "delete" ? (c(p), t()) : v === "undo" ? (c(p), n("undo")) : v === "redo" ? (c(p), n("redo")) : v === "palette" ? (c(p), i.value = !0, d()) : v === "fit" ? a && (c(p), a()) : v === "zoom-selection" ? s && o.value && (c(p), s()) : v === "escape" && o.value && (c(p), r());
  }
  return { rootEl: l, onKeyDown: f, focusPaletteSearch: d };
}
function AC(e) {
  const { engine: t, workflowId: n, rev: i, runState: o, viewingRun: r, viewingNodeHeaders: a, rebuild: s, clearSelection: l, error: c, panelOpen: u, historyOpen: d } = e, f = G(null);
  let p = !1;
  function v() {
    f.value = null, r.value = null, a.value = [], o.value = Nd(), l(), s();
  }
  async function y() {
    const X = f.value;
    if (!(!X || p)) {
      p = !0;
      try {
        const { run: te, nodes: ae, errorRouted: ue } = await xr(n, X);
        if (f.value !== X) return;
        const we = vg(te.status);
        o.value = $r(t.doc, ae, te.status, ue), s(), !we && te.status !== "completed" && (c.value = te.error || `Run ${te.status}.`);
      } catch (te) {
        c.value = qe(te, "Couldn’t refresh this run.");
      } finally {
        p = !1;
      }
    }
  }
  const m = [];
  try {
    const X = gi(`kickside.thread.${n}`, (ae) => {
      hg(ae, n) && y();
    });
    typeof X == "function" && m.push(X);
    const te = gi("@visibility", (ae) => {
      ae === !0 && y();
    });
    typeof te == "function" && m.push(te);
  } catch {
  }
  const _ = G(!1), x = G([]), w = G(!1), b = G("");
  async function C() {
    w.value = !0, b.value = "";
    try {
      x.value = await Cd(n, 20);
    } catch (X) {
      b.value = qe(X, "Couldn’t load runs.");
    } finally {
      w.value = !1;
    }
  }
  function I() {
    _.value = !_.value, _.value && (T.value = !1, d.value = !1, C());
  }
  async function B(X) {
    _.value = !1, v(), r.value = X, u.value = !0;
    try {
      const { run: te, nodes: ae, errorRouted: ue } = await xr(n, X.run_id);
      if (r.value?.run_id !== X.run_id) return;
      r.value = te, a.value = ae, o.value = $r(t.doc, ae, te.status, ue), s();
    } catch (te) {
      c.value = qe(te, "Couldn’t load this run.");
    }
  }
  const T = G(!1), M = G(!1), V = G({}), O = G(0), E = G(""), F = G(!0), g = U(() => {
    i.value;
    const X = pg(t.doc);
    return X && t.doc.nodes[X] || null;
  }), $ = U(() => {
    const X = g.value;
    return X ? (X.config || {}).input_schema ?? X.input_schema : void 0;
  });
  function k(X) {
    if (!X || typeof X != "object") return !1;
    const te = X.properties;
    return !!te && typeof te == "object" && Object.keys(te).length > 0;
  }
  const H = U(() => k($.value)), q = U(() => !M.value && F.value);
  function ee(X) {
    r.value && v(), _.value = !1, d.value = !1, c.value = "", E.value = "", V.value = X, F.value = !0, O.value++, T.value = !0;
  }
  function Z() {
    if (o.value.active) {
      v();
      return;
    }
    ee({});
  }
  function oe() {
    T.value = !1;
  }
  async function se(X) {
    let te = {};
    try {
      const ae = await xr(n, X.run_id);
      ae.input && (te = ae.input);
    } catch {
    }
    ee(te);
  }
  function Y(X) {
    V.value = X || {};
  }
  function J(X) {
    F.value = X;
  }
  async function j() {
    const X = {};
    X.input = V.value || {}, E.value = "", M.value = !0;
    try {
      f.value = await mg(n, X), o.value = $r(t.doc, [], "running"), T.value = !1, s(), await y();
    } catch (te) {
      E.value = qe(te, "Couldn’t start the run.");
    } finally {
      M.value = !1;
    }
  }
  return Qe(() => {
    for (const X of m) X();
  }), {
    runId: f,
    runsOpen: _,
    runRows: x,
    runsLoading: w,
    runsError: b,
    simOpen: T,
    simBusy: M,
    simInput: V,
    simInputKey: O,
    simError: E,
    simInputValid: F,
    startInputSchema: $,
    startHasFields: H,
    canRunSimulate: q,
    stopRun: v,
    loadRuns: C,
    toggleRuns: I,
    viewRun: B,
    openSim: Z,
    closeSim: oe,
    rerunSameInput: se,
    onSimInput: Y,
    onSimValid: J,
    runSimulate: j
  };
}
function TC(e) {
  const { rootEl: t, panelOpen: n, paletteOpen: i, hasSelection: o, viewingRun: r, reframe: a } = e, s = G(!1), l = G(!1), c = U(() => n.value && (o.value || !!r.value));
  let u = null, d = 0, f = !1;
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
  function y() {
    s.value && (i.value = !1), n.value = !0;
  }
  function m() {
    n.value = !1;
  }
  async function _() {
    return !s.value || !i.value ? !1 : (f = !0, i.value = !1, await Ve(), await new Promise((x) => requestAnimationFrame(() => requestAnimationFrame(() => x()))), f = !1, !0);
  }
  return _e([s, c], ([x, w], b) => {
    x && w && i.value && (i.value = !1), b && b[1] !== w && p();
  }), _e(i, (x, w) => {
    x && s.value && c.value && (n.value = !1), x !== w && !f && p();
  }), Ue(() => {
    const x = t.value;
    if (!x || typeof ResizeObserver > "u") return;
    const w = (b) => {
      b <= 0 || (s.value = b <= 1180, l.value = b <= 640);
    };
    w(x.getBoundingClientRect().width), u = new ResizeObserver((b) => w(b[0]?.contentRect.width || 0)), u.observe(x);
  }), Qe(() => {
    u?.disconnect(), u = null;
  }), { compact: s, narrow: l, inspectorVisible: c, togglePalette: v, openInspector: y, closeInspector: m, prepareCanvasAction: _ };
}
const Zh = 0.7;
function Jh(e = 250, t = 0.2, n = 1) {
  const i = Number.isFinite(n) ? Math.max(1, n) : 1;
  return { padding: t, minZoom: Zh / i, maxZoom: 1 / i, duration: e };
}
function MC(e) {
  const t = G(null), n = G(null), i = G(null), o = U(() => (e.revision.value, t.value && e.doc().nodes[t.value] || null)), r = U(() => (e.revision.value, n.value && e.doc().edges[n.value] || null)), a = U(() => (e.revision.value, i.value && e.doc().notes[i.value] || null)), s = U(() => !!(o.value || r.value || a.value));
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
  function f(C) {
    o.value && e.apply([Hd(o.value.id, C)]);
  }
  function p(C) {
    r.value && e.apply([Ei(r.value.id, C)]);
  }
  function v(C) {
    a.value && e.apply([ry(a.value.id, C)]);
  }
  function y(C) {
    return C ? C.kind === "start" || C.kind === "finish" || C.kind === "error" || C.pinned === !0 || !!C.boundary : !1;
  }
  function m() {
    const C = o.value;
    if (C) {
      if (y(C)) {
        e.reportError("Start, Finish, and Error steps are locked and can’t be deleted.");
        return;
      }
      e.confirmNodeRemoval(C, () => {
        e.readOnly() || !e.doc().nodes[C.id] || (t.value === C.id && c(), e.apply([iy(C.id)]));
      });
    }
  }
  function _() {
    const C = r.value;
    C && (c(), e.apply([xi(C.id)]));
  }
  function x(C) {
    e.readOnly() || !e.doc().edges[C] || (n.value === C && c(), e.apply([xi(C)]));
  }
  function w() {
    const C = a.value;
    C && (c(), e.apply([ay(C.id)]));
  }
  function b() {
    e.readOnly() || (r.value ? _() : a.value ? w() : o.value && m());
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
    updateNode: f,
    updateEdge: p,
    updateNote: v,
    removeSelectedNode: m,
    removeSelectedEdge: _,
    removeEdge: x,
    removeSelectedNote: w,
    deleteSelection: b
  };
}
function OC() {
  const e = G(!0), t = G(!0), n = G(!1), i = G(!1), o = G(!1), r = G(null);
  return {
    panelOpen: e,
    paletteOpen: t,
    historyOpen: n,
    addTriggerOpen: i,
    shareOpen: o,
    shareHost: r
  };
}
function Hi(e) {
  return e === "combine";
}
function ul(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function RC(e) {
  return ul(e).mode === "first_wins" ? "first_wins" : "wait_all";
}
function DC(e, t) {
  return RC(t);
}
function PC(e) {
  return ul(e).output_mode === "array" ? "array" : "object";
}
function LC(e, t, n) {
  return { kind: "combine", config: { ...ul(e), mode: t, output_mode: n } };
}
function VC(e, t) {
  const n = e.nodes[t];
  if (!n || !Hi(n.kind)) return null;
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
function zC(e) {
  return `These are the True and False arms of “${e}” — only one ever runs, so wait-all would wait forever for the other. Use first-wins here.`;
}
function BC(e) {
  const {
    engine: t,
    revision: n,
    selectedNode: i,
    selectedEdge: o,
    runState: r,
    viewingRun: a,
    error: s,
    loading: l,
    panelOpen: c,
    select: u
  } = e, d = U(() => {
    n.value;
    const g = o.value;
    if (g)
      return Fa(g.source_port) ? Jm : Ol(t.doc.nodes[g.source_id]);
  }), f = U(() => {
    n.value;
    const g = o.value;
    return g ? Qi(t.doc.nodes[g.target_id], d.value) : void 0;
  }), p = U(() => {
    n.value;
    const g = o.value, $ = g ? t.doc.nodes[g.source_id] : null;
    return $ ? Je($.title, $.ref) : "";
  }), v = U(() => {
    n.value;
    const g = o.value, $ = g ? t.doc.nodes[g.target_id] : null;
    return $ ? Je($.title, $.ref) : "";
  }), y = U(() => {
    n.value;
    const g = i.value;
    if (!g) return;
    const $ = Object.values(t.doc.edges).filter((k) => k.target_id === g.id);
    if ($.length === 1)
      return Ol(t.doc.nodes[$[0].source_id]);
  }), m = U(() => {
    n.value;
    const g = i.value;
    if (!g) return null;
    const $ = VC(t.doc, g.id);
    if (!$) return null;
    const k = t.doc.nodes[$];
    return Je(k?.title, k?.ref) || "a Condition";
  }), _ = U(() => (n.value, i.value ? r.value.node[i.value.id] : void 0)), x = U(() => {
    n.value;
    const g = r.value.node;
    for (const $ of Object.keys(t.doc.nodes))
      if (g[$] === "failed") return t.doc.nodes[$] || null;
    return null;
  }), w = U(() => {
    const g = x.value;
    return g ? Je(g.title, g.ref) || "A step" : "";
  }), b = U(() => Dl(a.value?.error)), C = U(() => b.value.generic ? "" : b.value.message), I = U(() => Dl(s.value));
  function B() {
    const g = x.value;
    g && (u("node", g.id), c.value = !0);
  }
  const T = U(() => (n.value, { nodes: Object.keys(t.doc.nodes).length, edges: Object.keys(t.doc.edges).length }));
  function M(g, $) {
    return `${g} ${$}${g === 1 ? "" : "s"}`;
  }
  const V = U(() => `${M(T.value.nodes, "step")} · ${M(T.value.edges, "connection")}`), O = U(() => (n.value, t.doc.canUndo)), E = U(() => (n.value, t.doc.canRedo)), F = U(() => (n.value, !l.value && T.value.nodes === 0 && Object.keys(t.doc.notes).length === 0));
  return {
    selectedEdgeUpstream: d,
    selectedEdgeDownstream: f,
    selectedEdgeSourceTitle: p,
    selectedEdgeTargetTitle: v,
    selectedNodeUpstream: y,
    selectedCombineConflict: m,
    selectedRunStatus: _,
    failedNode: x,
    failedNodeTitle: w,
    failedReason: C,
    runErrorView: b,
    errorView: I,
    openFailedDetails: B,
    counts: T,
    countLabel: V,
    canUndo: O,
    canRedo: E,
    isEmpty: F
  };
}
const FC = "Set a value or make it an input.", Pc = {
  node_config_missing: `This step is missing required configuration. ${FC}`,
  branch_predicate_missing: "Set the condition."
};
function HC(e) {
  if (e.code === "branch_predicate_missing") return Pc.branch_predicate_missing;
  const t = (e.message || "").trim();
  return t ? t.replace(/^node\s+\S+\s+/i, "").trim() || t : Pc[e.code] || "This step isn’t ready to publish yet.";
}
function qC(e) {
  return e.find((t) => !!t.nodeId)?.nodeId || "";
}
function UC(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    if (!n.nodeId) continue;
    const i = t.get(n.nodeId);
    i ? i.push(n) : t.set(n.nodeId, [n]);
  }
  return t;
}
function WC(e) {
  const { engine: t, workflowId: n, revision: i, error: o, notice: r, historyOpen: a, publishIssues: s, rebuild: l, select: c } = e, u = G(!1), d = G(0), f = G(!1);
  async function p() {
    try {
      const _ = await Dd(n);
      d.value = _.reduce((x, w) => Math.max(x, w.version), 0);
    } catch {
    }
  }
  async function v() {
    if (!(!d.value || f.value)) {
      f.value = !0, o.value = "";
      try {
        const _ = await zd(n);
        Ps(qd(_.title), _);
      } catch (_) {
        o.value = qe(_, "Couldn’t export this Workflow.");
      } finally {
        f.value = !1;
      }
    }
  }
  const y = U(() => (i.value, t.doc.definitionEditSeq));
  async function m() {
    a.value = !1, u.value = !0, o.value = "", r.value = "";
    try {
      const _ = await $g(n);
      s.value.size && (s.value = /* @__PURE__ */ new Map(), l()), _.version && (d.value = Math.max(d.value, _.version)), r.value = _.version ? `Published version ${_.version}. You can now use it in an Automation, another Workflow, or an agent.` : "Published. You can now use it in an Automation, another Workflow, or an agent.", _.version && e.published?.(_.version);
    } catch (_) {
      o.value = qe(_, "Couldn’t publish this Workflow.");
      const x = /* @__PURE__ */ new Map();
      if (_ instanceof Sg) {
        for (const [b, C] of UC(_.issues)) x.set(b, HC(C[0]));
        const w = qC(_.issues);
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
    exportBusy: f,
    loadPublishedState: p,
    exportDefinition: v,
    definitionEditSeq: y,
    doPublish: m
  };
}
const YC = "kickside-automation-manager", GC = "Triggers", jC = "Automations that run this Workflow. Add one, or pause and edit the ones already here.", hs = "Publish this Workflow before adding a trigger";
function Qh(e) {
  return Number.isFinite(e) && e > 0;
}
function XC(e, t) {
  return {
    tag: YC,
    attrs: {
      "component-id": e,
      mode: "component",
      input: JSON.stringify({ sink_port: "kickside.workflows:run_sink", sink_config: { flow_ref: { kind: "flow", id: e, version: t } } })
    }
  };
}
function KC(e) {
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
    restoreOverlayFocusFallback: f,
    openRunDialog: p,
    closeSim: v,
    toggleRunsPanel: y
  } = e;
  async function m(V = null) {
    u(), d(V), n.value = !0, await Ve(), i.value && await Ud(i.value, t, "Workflow", _);
  }
  function _() {
    n.value = !1, f();
  }
  function x(V = null) {
    u(), o.value || d(V), o.value = !o.value, o.value && (a.value = !1, s.value = !1);
  }
  function w() {
    o.value = !1, f();
  }
  function b(V = null) {
    if (!Qh(l.value)) {
      c.value = `${hs}.`;
      return;
    }
    u(), d(V), r.value = !0, o.value = !1, a.value = !1, s.value = !1;
  }
  function C() {
    r.value = !1, f();
  }
  function I(V = null) {
    u(), d(V), p();
  }
  function B() {
    v(), f();
  }
  function T(V = null) {
    u(), a.value || d(V), y();
  }
  function M() {
    a.value = !1, f();
  }
  return {
    openShare: m,
    closeShare: _,
    toggleHistory: x,
    closeHistory: w,
    openAddTrigger: b,
    closeAddTrigger: C,
    openSim: I,
    closeRunDialog: B,
    toggleRuns: T,
    closeRuns: M
  };
}
function ZC(e) {
  const { engine: t, layoutDir: n, viewingRun: i, canvasEl: o, apply: r, prepareCanvasAction: a, fitView: s, canvasFitOptions: l } = e;
  function c(p) {
    const v = p.nodes?.length ? p.nodes : [p.node], y = Nn(t.doc, n.value), { parentOf: m, containers: _ } = fr(t.doc, y), x = [];
    for (const w of v) {
      if (!w) continue;
      let { x: b, y: C } = w.position;
      const I = m[String(w.id)];
      if (I) {
        const B = _.find((T) => T.id === I);
        if (B) {
          const T = eC(t.doc, I, B.members, y, String(w.id)), M = t.doc.nodes[String(w.id)];
          ({ x: b, y: C } = tC(b, C, T, M ? pn(M) : void 0));
        }
      }
      t.recordLayoutEcho(String(w.id), b, C), x.push(Ct(String(w.id), b, C));
    }
    r(x);
  }
  async function u(p = t.doc.direction) {
    if (i.value) return;
    await a();
    const v = o.value?.getBoundingClientRect(), y = Yh(t.doc, p, v ? {
      width: v.width,
      height: v.height,
      minZoom: Zh
    } : void 0), m = Object.entries(y).map(([_, x]) => Ct(_, x.x, x.y));
    p !== t.doc.direction && m.unshift(sy(p)), m.length && await r(m, !0);
  }
  function d() {
    u(t.doc.direction === "TB" ? "LR" : "TB");
  }
  async function f() {
    await a();
    try {
      s(l());
    } catch {
    }
  }
  return { onNodeDragStop: c, runAutoLayout: u, toggleDir: d, fit: f };
}
function JC(e) {
  return Object.values(e.edges).map((t) => {
    const n = e.nodes[t.source_id], i = e.nodes[t.target_id], o = n ? Je(n.title, n.ref) : "Missing source step", r = i ? Je(i.title, i.ref) : "Missing destination step", a = t.source_port ? t.source_port === Nt.id ? Nt.label : (n ? Rn(n).find((s) => s.id === t.source_port)?.label : void 0) || t.source_port : "Output";
    return {
      id: t.id,
      label: `${o} — ${a} to ${r}`
    };
  });
}
function QC(e) {
  const { engine: t, revision: n, layoutDir: i, clearIntentOverlays: o, rememberOverlayInvoker: r, restoreOverlayFocusFallback: a, onConnect: s } = e, l = G(!1), c = U(() => {
    n.value;
    const m = [];
    for (const _ of Object.values(t.doc.nodes)) {
      if (_.kind === "finish" || _.kind === "error") continue;
      const x = Je(_.title, _.ref), w = Rn(_), b = w.length > 1 || (w[0]?.id ?? "") !== "";
      for (const C of w) {
        const I = b ? C.id : i.value === "LR" ? "out-right" : "out-bottom";
        m.push({
          key: JSON.stringify([_.id, I]),
          nodeId: _.id,
          handle: I,
          label: `${x} — ${C.label || "Output"}`
        });
      }
      sl(_) && m.push({
        key: JSON.stringify([_.id, Nt.id]),
        nodeId: _.id,
        handle: Nt.id,
        label: `${x} — ${Nt.label}`
      });
    }
    return m;
  }), u = U(() => (n.value, Object.values(t.doc.nodes).filter((m) => m.kind !== "start").map((m) => ({ nodeId: m.id, label: Je(m.title, m.ref) })))), d = U(() => (n.value, JC(t.doc))), f = U(() => i.value === "LR" ? "in-left" : "in-top");
  function p(m = null) {
    o(), r(m), l.value = !0;
  }
  function v() {
    l.value = !1, a();
  }
  function y(m) {
    s(m);
  }
  return {
    connectionsOpen: l,
    connectionSources: c,
    connectionTargets: u,
    connectionEdges: d,
    connectionTargetHandle: f,
    openConnections: p,
    closeConnections: v,
    createConnection: y
  };
}
function eN(e) {
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
  } = e, u = G(null), d = G(null);
  let f = null, p = !1;
  function v(O) {
    t.value || (O.preventDefault(), O.stopPropagation(), u.value = { x: O.clientX, y: O.clientY });
  }
  function y(O) {
    v(O);
  }
  function m(O) {
    O.event instanceof MouseEvent && (O.node.type === "wfFrame" || O.node.type === "wfNote") && v(O.event);
  }
  function _() {
    u.value = null;
  }
  function x() {
    const O = u.value;
    if (!O) return { x: 0, y: 0 };
    const E = i({ x: O.x, y: O.y });
    return { x: Math.round(E.x), y: Math.round(E.y) };
  }
  function w() {
    _(), n.value = !0, s();
  }
  function b() {
    const O = x();
    _(), r(O);
  }
  function C() {
    const O = x();
    _(), a(O);
  }
  function I(O) {
    p = !1, f = O?.nodeId && O?.handleType === "source" ? { node: O.nodeId, handle: O.handleId ?? void 0 } : null;
  }
  function B(O) {
    p = !0, l(O);
  }
  function T(O) {
    c();
    const E = f;
    if (f = null, p || !E || t.value || !(O instanceof MouseEvent)) return;
    const F = O.target;
    !F || !F.classList.contains("vue-flow__pane") || (d.value = { x: O.clientX, y: O.clientY, source: E.node, sourceHandle: E.handle });
  }
  function M() {
    d.value = null;
  }
  function V(O) {
    const E = d.value;
    if (!E) return;
    M();
    const F = i({ x: E.x, y: E.y }), g = o(O, { x: Math.round(F.x), y: Math.round(F.y) });
    l({ source: E.source, sourceHandle: E.sourceHandle ?? null, target: g, targetHandle: null });
  }
  return {
    paneMenu: u,
    openPaneMenu: v,
    onPaneContextMenu: y,
    onNodeContextMenu: m,
    closePaneMenu: _,
    menuAddStep: w,
    menuAddNote: b,
    menuAddFrame: C,
    dropPicker: d,
    onConnectStart: I,
    onConnect: B,
    onConnectEnd: T,
    closeDropPicker: M,
    dropPickerPick: V
  };
}
function Lc(e, t, n, i, o = 12, r = 14) {
  const a = t.left + n / 2 + o, s = t.right - n / 2 - o, l = a <= s ? Math.min(Math.max(e.left, a), s) : (t.left + t.right) / 2, c = t.top + i + r + o, u = t.bottom - o, d = c <= u ? Math.min(Math.max(e.top, c), u) : Math.max(t.top + o, u);
  return { left: l, top: d };
}
function tN(e, t, n, i) {
  return {
    left: e.left - t / 2,
    right: e.left + t / 2,
    top: e.top - i - n,
    bottom: e.top - i
  };
}
function nN(e, t) {
  const n = Math.max(0, Math.min(e.right, t.right) - Math.max(e.left, t.left)), i = Math.max(0, Math.min(e.bottom, t.bottom) - Math.max(e.top, t.top));
  return n * i;
}
function oN(e, t, n, i, o, r = 12, a = 14) {
  const s = [e];
  for (const u of o)
    s.push(
      { left: e.left, top: u.top - r },
      { left: e.left, top: u.bottom + i + a + r },
      { left: u.left - n / 2 - r, top: e.top },
      { left: u.right + n / 2 + r, top: e.top }
    );
  let l = Lc(s[0], t, n, i, r, a), c = Number.POSITIVE_INFINITY;
  for (const u of s) {
    const d = Lc(u, t, n, i, r, a), f = tN(d, n, i, a), p = o.reduce((m, _) => m + nN(f, _), 0), v = (d.left - e.left) ** 2 + (d.top - e.top) ** 2, y = p * 1e6 + v;
    y < c && (l = d, c = y);
  }
  return l;
}
function iN(e, t, n) {
  return {
    left: Math.min(Math.max(e.left + 14, 8), Math.max(8, t - 190)),
    top: Math.min(Math.max(e.top + 14, 8), Math.max(8, n - 44))
  };
}
function rN(e) {
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
    rebuild: f
  } = e, p = G(null), v = xs(/* @__PURE__ */ new Map()), y = G(0);
  _e(l, () => {
    for (const M of [...v.keys()]) u.has(M) || v.delete(M);
    c.value || (p.value = null), f();
  }), _e(() => c.value?.id, () => {
    p.value = null;
  });
  function m(M, V) {
    return !!M && Math.abs(M.width - V.width) < 0.5 && Math.abs(M.height - V.height) < 0.5;
  }
  function _(M) {
    m(p.value, M) || (p.value = M, y.value++);
  }
  function x(M, V) {
    m(v.get(M), V) || (v.set(M, V), y.value++);
  }
  function w(M) {
    const V = o(M);
    if (!V) return null;
    const O = V.computedPosition || V.position, E = V.dimensions || { width: 180, height: 64 };
    return O ? { x: O.x + (E.width || 180) / 2, y: O.y + (E.height || 64) / 2 } : null;
  }
  function b(M) {
    const V = r();
    return n.value.flatMap((O) => {
      const E = o(O.id);
      if (!E) return [];
      const F = E.computedPosition || E.position, g = E.dimensions || { width: 180, height: 64 };
      if (!F) return [];
      const $ = M.left + V.x + F.x * V.zoom, k = M.top + V.y + F.y * V.zoom;
      return [{
        left: $,
        top: k,
        right: $ + (g.width || 180) * V.zoom,
        bottom: k + (g.height || 64) * V.zoom
      }];
    });
  }
  function C(M, V, O) {
    const E = w(M), F = w(V);
    if (!E || !F) return null;
    const g = i.value?.getBoundingClientRect(), $ = r(), k = (E.x + F.x) / 2, H = (E.y + F.y) / 2, q = { left: (g?.left || 0) + $.x + k * $.zoom, top: (g?.top || 0) + $.y + H * $.zoom };
    return g ? {
      ...oN(q, g, O.width, O.height, b(g)),
      maxHeight: Math.max(80, g.height - 24)
    } : { ...q, maxHeight: Math.max(80, window.innerHeight - 24) };
  }
  const I = U(() => {
    a.value, s.value, l.value, y.value;
    const M = c.value;
    return M ? C(M.sourceId, M.targetId, p.value || { width: 300, height: 1 }) : null;
  }), B = U(() => {
    a.value, s.value, l.value, y.value;
    const M = [];
    for (const V of u.values()) {
      if (!t.doc.edges[V.id]) continue;
      const O = v.get(V.id), E = C(V.sourceId, V.targetId, O || { width: 300, height: 1 });
      E && M.push({ id: V.id, entry: V, left: E.left, top: E.top, maxHeight: E.maxHeight, placed: !!O });
    }
    return M;
  }), T = U(() => d.value ? iN(
    { left: d.value.x, top: d.value.y },
    window.innerWidth,
    window.innerHeight
  ) : null);
  return {
    pendingOverlaySize: p,
    autoOverlaySizes: v,
    pendingAnchor: I,
    autoMapAnchored: B,
    connectHintPosition: T,
    measurePending: _,
    measureAuto: x
  };
}
function aN(e) {
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
async function sN(e, t) {
  try {
    const n = [];
    let i = 0;
    do {
      const o = e.includes("?") ? "&" : "?", a = (await Vn.get(`${e}${o}limit=100&offset=${i}`)).data;
      if (a && a.success === !1) return { rows: [], error: Ke(a.error) || `${e} failed` };
      n.push(...aN(a?.[t]));
      const s = a?.next_offset;
      if (s != null && (typeof s != "number" || !Number.isSafeInteger(s) || s <= i)) return { rows: [], error: `${e} returns an invalid offset` };
      i = s ?? void 0;
    } while (i !== void 0);
    return { rows: n };
  } catch (n) {
    return { rows: [], error: n instanceof Error ? n.message : `couldn’t load ${e}` };
  }
}
function lN(e) {
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
      label: Ke(t.label) || il(Ke(t.id)) || "Output",
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
function uN(e) {
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
const cN = [
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
], dN = [
  { paletteId: "boundary:start", kind: "start", category: "Structure", title: Ze.start.label, subtitle: "Declares the run input", icon: Ze.start.icon },
  { paletteId: "boundary:finish", kind: "finish", category: "Structure", title: Ze.finish.label, subtitle: "Declares the successful output", icon: Ze.finish.icon },
  { paletteId: "boundary:error", kind: "error", category: "Structure", title: Ze.error.label, subtitle: "Declares the failed output", icon: Ze.error.icon }
], fN = 12;
function hN(e) {
  const n = (e || "").split(":")[0].split(".").filter(Boolean), i = n.length >= 2 ? n[1] : n[0];
  return i ? il(i) : "Other";
}
function pN(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const i = hN(n.ref);
    t.has(i) || t.set(i, []), t.get(i).push(n);
  }
  return [...t.entries()].sort((n, i) => n[0].localeCompare(i[0])).map(([n, i]) => ({ module: n, items: [...i].sort((o, r) => o.title.localeCompare(r.title)) }));
}
const vN = "Notes";
function mN(e, t, n) {
  const i = t.trim().toLowerCase(), o = /* @__PURE__ */ new Map(), r = [...n];
  for (const a of n) o.set(a, []);
  for (const a of e)
    i && !`${a.title} ${a.subtitle} ${a.ref || ""} ${a.kind} ${a.category}`.toLowerCase().includes(i) || (o.has(a.category) || (o.set(a.category, []), r.push(a.category)), o.get(a.category).push(a));
  return r.filter((a) => a === vN || (o.get(a)?.length ?? 0) > 0).map((a) => ({ cat: a, items: o.get(a) || [] }));
}
async function gN() {
  const e = await sN("/api/v1/workflows/blocks?fields=blurb,input_schema,config_schema,config_wc,output_schema,error_schema,ports,execution", "blocks"), t = e.rows.map(lN).filter((i) => i.id && i.public === !0);
  return Qm(t), { items: [
    ...dN,
    ...t.map(uN),
    ...cN
  ], errors: e.error ? [e.error] : [] };
}
function yN(e) {
  const { workflowId: t, engine: n, catalog: i, catalogErrors: o, catalogLoading: r, load: a, loadPublishedState: s, rebuild: l } = e;
  async function c() {
    try {
      const d = await gN();
      i.value = d.items, o.value = d.errors;
    } catch (d) {
      i.value = [], o.value = [qe(d, "Couldn’t load Workflow steps.")];
    } finally {
      r.value = !1;
    }
    await a(!0), s();
  }
  bd(c);
  let u = [];
  Ue(() => {
    try {
      u.push(
        gi(`workflow.${t}`, (d) => {
          const f = d && typeof d == "object" ? d : {}, p = f.data && typeof f.data == "object" ? f.data : f;
          if (p.workflow_id && String(p.workflow_id) !== t) return;
          const v = Array.isArray(p.events) ? p.events : [];
          if (!v.length) return;
          const y = n.ingest(v);
          if (y.needsRefetch) {
            a();
            return;
          }
          y.changed && l();
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
const ep = function({ dimensions: e, size: t, color: n }) {
  return Pe("path", {
    stroke: n,
    "stroke-width": t,
    d: `M${e[0] / 2} 0 V${e[1]} M0 ${e[1] / 2} H${e[0]}`
  });
}, tp = function({ radius: e, color: t }) {
  return Pe("circle", { cx: e, cy: e, r: e, fill: t });
};
Lt.Lines + "", Lt.Dots + "";
const wN = {
  [Lt.Dots]: "#81818a",
  [Lt.Lines]: "#eee"
}, bN = ["id", "x", "y", "width", "height", "patternTransform"], _N = {
  key: 2,
  height: "100",
  width: "100"
}, kN = ["fill"], EN = ["x", "y", "fill"], xN = {
  name: "Background",
  compatConfig: { MODE: 3 }
}, np = /* @__PURE__ */ ye({
  ...xN,
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
      const a = n.value.zoom, [s, l] = Array.isArray(e.gap) ? e.gap : [e.gap, e.gap], c = [s * a || 1, l * a || 1], u = e.size * a, [d, f] = Array.isArray(e.offset) ? e.offset : [e.offset, e.offset], p = [d * a || 1 + c[0] / 2, f * a || 1 + c[1] / 2];
      return {
        scaledGap: c,
        offset: p,
        size: u
      };
    }), o = Ne(() => `pattern-${t}${e.id ? `-${e.id}` : ""}`), r = Ne(() => e.color || e.patternColor || wN[e.variant || Lt.Dots]);
    return (a, s) => (N(), D("svg", {
      class: "vue-flow__background vue-flow__container",
      style: Be({
        height: `${a.height > 100 ? 100 : a.height}%`,
        width: `${a.width > 100 ? 100 : a.width}%`
      })
    }, [
      ze(a.$slots, "pattern-container", { id: o.value }, () => [
        S("pattern", {
          id: o.value,
          x: h(n).x % i.value.scaledGap[0],
          y: h(n).y % i.value.scaledGap[1],
          width: i.value.scaledGap[0],
          height: i.value.scaledGap[1],
          patternTransform: `translate(-${i.value.offset[0]},-${i.value.offset[1]})`,
          patternUnits: "userSpaceOnUse"
        }, [
          ze(a.$slots, "pattern", {}, () => [
            a.variant === h(Lt).Lines ? (N(), re(h(ep), {
              key: 0,
              size: a.lineWidth,
              color: r.value,
              dimensions: i.value.scaledGap
            }, null, 8, ["size", "color", "dimensions"])) : a.variant === h(Lt).Dots ? (N(), re(h(tp), {
              key: 1,
              color: r.value,
              radius: i.value.size / 2
            }, null, 8, ["color", "radius"])) : Q("", !0),
            a.bgColor ? (N(), D("svg", _N, [
              S("rect", {
                width: "100%",
                height: "100%",
                fill: a.bgColor
              }, null, 8, kN)
            ])) : Q("", !0)
          ])
        ], 8, bN)
      ]),
      S("rect", {
        x: a.x,
        y: a.y,
        width: "100%",
        height: "100%",
        fill: `url(#${o.value})`
      }, null, 8, EN),
      ze(a.$slots, "default", { id: o.value })
    ], 4));
  }
}), $N = {
  name: "ControlButton",
  compatConfig: { MODE: 3 }
}, SN = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [i, o] of t)
    n[i] = o;
  return n;
}, CN = {
  type: "button",
  class: "vue-flow__controls-button"
};
function NN(e, t, n, i, o, r) {
  return N(), D("button", CN, [
    ze(e.$slots, "default")
  ]);
}
const Jo = /* @__PURE__ */ SN($N, [["render", NN]]), IN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32"
}, AN = /* @__PURE__ */ S("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" }, null, -1), TN = [
  AN
];
function MN(e, t) {
  return N(), D("svg", IN, TN);
}
const ON = { render: MN }, RN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 5"
}, DN = /* @__PURE__ */ S("path", { d: "M0 0h32v4.2H0z" }, null, -1), PN = [
  DN
];
function LN(e, t) {
  return N(), D("svg", RN, PN);
}
const VN = { render: LN }, zN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 30"
}, BN = /* @__PURE__ */ S("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0 0 27.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94a.919.919 0 0 1-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" }, null, -1), FN = [
  BN
];
function HN(e, t) {
  return N(), D("svg", zN, FN);
}
const qN = { render: HN }, UN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 25 32"
}, WN = /* @__PURE__ */ S("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 0 0 0 13.714v15.238A3.056 3.056 0 0 0 3.048 32h18.285a3.056 3.056 0 0 0 3.048-3.048V13.714a3.056 3.056 0 0 0-3.048-3.047zM12.19 24.533a3.056 3.056 0 0 1-3.047-3.047 3.056 3.056 0 0 1 3.047-3.048 3.056 3.056 0 0 1 3.048 3.048 3.056 3.056 0 0 1-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" }, null, -1), YN = [
  WN
];
function GN(e, t) {
  return N(), D("svg", UN, YN);
}
const jN = { render: GN }, XN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 25 32"
}, KN = /* @__PURE__ */ S("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 0 0 0 13.714v15.238A3.056 3.056 0 0 0 3.048 32h18.285a3.056 3.056 0 0 0 3.048-3.048V13.714a3.056 3.056 0 0 0-3.048-3.047zM12.19 24.533a3.056 3.056 0 0 1-3.047-3.047 3.056 3.056 0 0 1 3.047-3.048 3.056 3.056 0 0 1 3.048 3.048 3.056 3.056 0 0 1-3.048 3.047z" }, null, -1), ZN = [
  KN
];
function JN(e, t) {
  return N(), D("svg", XN, ZN);
}
const QN = { render: JN }, e2 = {
  name: "Controls",
  compatConfig: { MODE: 3 }
}, t2 = /* @__PURE__ */ ye({
  ...e2,
  props: {
    showZoom: { type: Boolean, default: !0 },
    showFitView: { type: Boolean, default: !0 },
    showInteractive: { type: Boolean, default: !0 },
    fitViewParams: {},
    position: { default: () => kf.BottomLeft }
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
    } = De(), f = Ne(() => n.value || i.value || o.value), p = Ne(() => c.value.zoom <= u.value), v = Ne(() => c.value.zoom >= d.value);
    function y() {
      a(), t("zoomIn");
    }
    function m() {
      s(), t("zoomOut");
    }
    function _() {
      l(e.fitViewParams), t("fitView");
    }
    function x() {
      r(!f.value), t("interactionChange", !f.value);
    }
    return (w, b) => (N(), re(h(Zf), {
      class: "vue-flow__controls",
      position: w.position
    }, {
      default: ne(() => [
        ze(w.$slots, "top"),
        w.showZoom ? (N(), D(le, { key: 0 }, [
          ze(w.$slots, "control-zoom-in", {}, () => [
            z(Jo, {
              class: "vue-flow__controls-zoomin",
              disabled: v.value,
              onClick: y
            }, {
              default: ne(() => [
                ze(w.$slots, "icon-zoom-in", {}, () => [
                  (N(), re(Xt(h(ON))))
                ])
              ]),
              _: 3
            }, 8, ["disabled"])
          ]),
          ze(w.$slots, "control-zoom-out", {}, () => [
            z(Jo, {
              class: "vue-flow__controls-zoomout",
              disabled: p.value,
              onClick: m
            }, {
              default: ne(() => [
                ze(w.$slots, "icon-zoom-out", {}, () => [
                  (N(), re(Xt(h(VN))))
                ])
              ]),
              _: 3
            }, 8, ["disabled"])
          ])
        ], 64)) : Q("", !0),
        w.showFitView ? ze(w.$slots, "control-fit-view", { key: 1 }, () => [
          z(Jo, {
            class: "vue-flow__controls-fitview",
            onClick: _
          }, {
            default: ne(() => [
              ze(w.$slots, "icon-fit-view", {}, () => [
                (N(), re(Xt(h(qN))))
              ])
            ]),
            _: 3
          })
        ]) : Q("", !0),
        w.showInteractive ? ze(w.$slots, "control-interactive", { key: 2 }, () => [
          w.showInteractive ? (N(), re(Jo, {
            key: 0,
            class: "vue-flow__controls-interactive",
            onClick: x
          }, {
            default: ne(() => [
              f.value ? ze(w.$slots, "icon-unlock", { key: 0 }, () => [
                (N(), re(Xt(h(QN))))
              ]) : Q("", !0),
              f.value ? Q("", !0) : ze(w.$slots, "icon-lock", { key: 1 }, () => [
                (N(), re(Xt(h(jN))))
              ])
            ]),
            _: 3
          })) : Q("", !0)
        ]) : Q("", !0),
        ze(w.$slots, "default")
      ]),
      _: 3
    }, 8, ["position"]));
  }
});
var n2 = { value: () => {
} };
function cl() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new hi(n);
}
function hi(e) {
  this._ = e;
}
function o2(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", o = n.indexOf(".");
    if (o >= 0 && (i = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
hi.prototype = cl.prototype = {
  constructor: hi,
  on: function(e, t) {
    var n = this._, i = o2(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; ) if ((o = (e = i[r]).type) && (o = i2(n[o], e.name))) return o;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++r < a; )
      if (o = (e = i[r]).type) n[o] = Vc(n[o], e.name, t);
      else if (t == null) for (o in n) n[o] = Vc(n[o], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new hi(e);
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
function i2(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function Vc(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = n2, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var ps = "http://www.w3.org/1999/xhtml";
const zc = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: ps,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function hr(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), zc.hasOwnProperty(t) ? { space: zc[t], local: e } : e;
}
function r2(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === ps && t.documentElement.namespaceURI === ps ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function a2(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function op(e) {
  var t = hr(e);
  return (t.local ? a2 : r2)(t);
}
function s2() {
}
function dl(e) {
  return e == null ? s2 : function() {
    return this.querySelector(e);
  };
}
function l2(e) {
  typeof e != "function" && (e = dl(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = new Array(a), l, c, u = 0; u < a; ++u)
      (l = r[u]) && (c = e.call(l, l.__data__, u, r)) && ("__data__" in l && (c.__data__ = l.__data__), s[u] = c);
  return new st(i, this._parents);
}
function u2(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function c2() {
  return [];
}
function ip(e) {
  return e == null ? c2 : function() {
    return this.querySelectorAll(e);
  };
}
function d2(e) {
  return function() {
    return u2(e.apply(this, arguments));
  };
}
function f2(e) {
  typeof e == "function" ? e = d2(e) : e = ip(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), o.push(l));
  return new st(i, o);
}
function rp(e) {
  return function() {
    return this.matches(e);
  };
}
function ap(e) {
  return function(t) {
    return t.matches(e);
  };
}
var h2 = Array.prototype.find;
function p2(e) {
  return function() {
    return h2.call(this.children, e);
  };
}
function v2() {
  return this.firstElementChild;
}
function m2(e) {
  return this.select(e == null ? v2 : p2(typeof e == "function" ? e : ap(e)));
}
var g2 = Array.prototype.filter;
function y2() {
  return Array.from(this.children);
}
function w2(e) {
  return function() {
    return g2.call(this.children, e);
  };
}
function b2(e) {
  return this.selectAll(e == null ? y2 : w2(typeof e == "function" ? e : ap(e)));
}
function _2(e) {
  typeof e != "function" && (e = rp(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new st(i, this._parents);
}
function sp(e) {
  return new Array(e.length);
}
function k2() {
  return new st(this._enter || this._groups.map(sp), this._parents);
}
function qi(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
qi.prototype = {
  constructor: qi,
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
function E2(e) {
  return function() {
    return e;
  };
}
function x2(e, t, n, i, o, r) {
  for (var a = 0, s, l = t.length, c = r.length; a < c; ++a)
    (s = t[a]) ? (s.__data__ = r[a], i[a] = s) : n[a] = new qi(e, r[a]);
  for (; a < l; ++a)
    (s = t[a]) && (o[a] = s);
}
function $2(e, t, n, i, o, r, a) {
  var s, l, c = /* @__PURE__ */ new Map(), u = t.length, d = r.length, f = new Array(u), p;
  for (s = 0; s < u; ++s)
    (l = t[s]) && (f[s] = p = a.call(l, l.__data__, s, t) + "", c.has(p) ? o[s] = l : c.set(p, l));
  for (s = 0; s < d; ++s)
    p = a.call(e, r[s], s, r) + "", (l = c.get(p)) ? (i[s] = l, l.__data__ = r[s], c.delete(p)) : n[s] = new qi(e, r[s]);
  for (s = 0; s < u; ++s)
    (l = t[s]) && c.get(f[s]) === l && (o[s] = l);
}
function S2(e) {
  return e.__data__;
}
function C2(e, t) {
  if (!arguments.length) return Array.from(this, S2);
  var n = t ? $2 : x2, i = this._parents, o = this._groups;
  typeof e != "function" && (e = E2(e));
  for (var r = o.length, a = new Array(r), s = new Array(r), l = new Array(r), c = 0; c < r; ++c) {
    var u = i[c], d = o[c], f = d.length, p = N2(e.call(u, u && u.__data__, c, i)), v = p.length, y = s[c] = new Array(v), m = a[c] = new Array(v), _ = l[c] = new Array(f);
    n(u, d, y, m, _, p, t);
    for (var x = 0, w = 0, b, C; x < v; ++x)
      if (b = y[x]) {
        for (x >= w && (w = x + 1); !(C = m[w]) && ++w < v; ) ;
        b._next = C || null;
      }
  }
  return a = new st(a, i), a._enter = s, a._exit = l, a;
}
function N2(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function I2() {
  return new st(this._exit || this._groups.map(sp), this._parents);
}
function A2(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function T2(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), s = new Array(o), l = 0; l < a; ++l)
    for (var c = n[l], u = i[l], d = c.length, f = s[l] = new Array(d), p, v = 0; v < d; ++v)
      (p = c[v] || u[v]) && (f[v] = p);
  for (; l < o; ++l)
    s[l] = n[l];
  return new st(s, this._parents);
}
function M2() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function O2(e) {
  e || (e = R2);
  function t(d, f) {
    return d && f ? e(d.__data__, f.__data__) : !d - !f;
  }
  for (var n = this._groups, i = n.length, o = new Array(i), r = 0; r < i; ++r) {
    for (var a = n[r], s = a.length, l = o[r] = new Array(s), c, u = 0; u < s; ++u)
      (c = a[u]) && (l[u] = c);
    l.sort(t);
  }
  return new st(o, this._parents).order();
}
function R2(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function D2() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function P2() {
  return Array.from(this);
}
function L2() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a) return a;
    }
  return null;
}
function V2() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function z2() {
  return !this.node();
}
function B2(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, s; r < a; ++r)
      (s = o[r]) && e.call(s, s.__data__, r, o);
  return this;
}
function F2(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function H2(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function q2(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function U2(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function W2(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function Y2(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function G2(e, t) {
  var n = hr(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? H2 : F2 : typeof t == "function" ? n.local ? Y2 : W2 : n.local ? U2 : q2)(n, t));
}
function lp(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function j2(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function X2(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function K2(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function Z2(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? j2 : typeof t == "function" ? K2 : X2)(e, t, n ?? "")) : Dn(this.node(), e);
}
function Dn(e, t) {
  return e.style.getPropertyValue(t) || lp(e).getComputedStyle(e, null).getPropertyValue(t);
}
function J2(e) {
  return function() {
    delete this[e];
  };
}
function Q2(e, t) {
  return function() {
    this[e] = t;
  };
}
function eI(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function tI(e, t) {
  return arguments.length > 1 ? this.each((t == null ? J2 : typeof t == "function" ? eI : Q2)(e, t)) : this.node()[e];
}
function up(e) {
  return e.trim().split(/^|\s+/);
}
function fl(e) {
  return e.classList || new cp(e);
}
function cp(e) {
  this._node = e, this._names = up(e.getAttribute("class") || "");
}
cp.prototype = {
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
function dp(e, t) {
  for (var n = fl(e), i = -1, o = t.length; ++i < o; ) n.add(t[i]);
}
function fp(e, t) {
  for (var n = fl(e), i = -1, o = t.length; ++i < o; ) n.remove(t[i]);
}
function nI(e) {
  return function() {
    dp(this, e);
  };
}
function oI(e) {
  return function() {
    fp(this, e);
  };
}
function iI(e, t) {
  return function() {
    (t.apply(this, arguments) ? dp : fp)(this, e);
  };
}
function rI(e, t) {
  var n = up(e + "");
  if (arguments.length < 2) {
    for (var i = fl(this.node()), o = -1, r = n.length; ++o < r; ) if (!i.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? iI : t ? nI : oI)(n, t));
}
function aI() {
  this.textContent = "";
}
function sI(e) {
  return function() {
    this.textContent = e;
  };
}
function lI(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function uI(e) {
  return arguments.length ? this.each(e == null ? aI : (typeof e == "function" ? lI : sI)(e)) : this.node().textContent;
}
function cI() {
  this.innerHTML = "";
}
function dI(e) {
  return function() {
    this.innerHTML = e;
  };
}
function fI(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function hI(e) {
  return arguments.length ? this.each(e == null ? cI : (typeof e == "function" ? fI : dI)(e)) : this.node().innerHTML;
}
function pI() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function vI() {
  return this.each(pI);
}
function mI() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function gI() {
  return this.each(mI);
}
function yI(e) {
  var t = typeof e == "function" ? e : op(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function wI() {
  return null;
}
function bI(e, t) {
  var n = typeof e == "function" ? e : op(e), i = t == null ? wI : typeof t == "function" ? t : dl(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function _I() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function kI() {
  return this.each(_I);
}
function EI() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function xI() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function $I(e) {
  return this.select(e ? xI : EI);
}
function SI(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function CI(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function NI(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function II(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function AI(e, t, n) {
  return function() {
    var i = this.__on, o, r = CI(t);
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
function TI(e, t, n) {
  var i = NI(e + ""), o, r = i.length, a;
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
  for (s = t ? AI : II, o = 0; o < r; ++o) this.each(s(i[o], t, n));
  return this;
}
function hp(e, t, n) {
  var i = lp(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function MI(e, t) {
  return function() {
    return hp(this, e, t);
  };
}
function OI(e, t) {
  return function() {
    return hp(this, e, t.apply(this, arguments));
  };
}
function RI(e, t) {
  return this.each((typeof t == "function" ? OI : MI)(e, t));
}
function* DI() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var pp = [null];
function st(e, t) {
  this._groups = e, this._parents = t;
}
function Mo() {
  return new st([[document.documentElement]], pp);
}
function PI() {
  return this;
}
st.prototype = Mo.prototype = {
  constructor: st,
  select: l2,
  selectAll: f2,
  selectChild: m2,
  selectChildren: b2,
  filter: _2,
  data: C2,
  enter: k2,
  exit: I2,
  join: A2,
  merge: T2,
  selection: PI,
  order: M2,
  sort: O2,
  call: D2,
  nodes: P2,
  node: L2,
  size: V2,
  empty: z2,
  each: B2,
  attr: G2,
  style: Z2,
  property: tI,
  classed: rI,
  text: uI,
  html: hI,
  raise: vI,
  lower: gI,
  append: yI,
  insert: bI,
  remove: kI,
  clone: $I,
  datum: SI,
  on: TI,
  dispatch: RI,
  [Symbol.iterator]: DI
};
function Kt(e) {
  return typeof e == "string" ? new st([[document.querySelector(e)]], [document.documentElement]) : new st([[e]], pp);
}
function LI(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Yt(e, t) {
  if (e = LI(e), t === void 0 && (t = e.currentTarget), t) {
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
const vs = { capture: !0, passive: !1 };
function ms(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function VI(e) {
  var t = e.document.documentElement, n = Kt(e).on("dragstart.drag", ms, vs);
  "onselectstart" in t ? n.on("selectstart.drag", ms, vs) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function zI(e, t) {
  var n = e.document.documentElement, i = Kt(e).on("dragstart.drag", null);
  t && (i.on("click.drag", ms, vs), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
function hl(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function vp(e, t) {
  var n = Object.create(e.prototype);
  for (var i in t) n[i] = t[i];
  return n;
}
function Oo() {
}
var ko = 0.7, Ui = 1 / ko, In = "\\s*([+-]?\\d+)\\s*", Eo = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", At = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", BI = /^#([0-9a-f]{3,8})$/, FI = new RegExp(`^rgb\\(${In},${In},${In}\\)$`), HI = new RegExp(`^rgb\\(${At},${At},${At}\\)$`), qI = new RegExp(`^rgba\\(${In},${In},${In},${Eo}\\)$`), UI = new RegExp(`^rgba\\(${At},${At},${At},${Eo}\\)$`), WI = new RegExp(`^hsl\\(${Eo},${At},${At}\\)$`), YI = new RegExp(`^hsla\\(${Eo},${At},${At},${Eo}\\)$`), Bc = {
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
hl(Oo, xo, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: Fc,
  // Deprecated! Use color.formatHex.
  formatHex: Fc,
  formatHex8: GI,
  formatHsl: jI,
  formatRgb: Hc,
  toString: Hc
});
function Fc() {
  return this.rgb().formatHex();
}
function GI() {
  return this.rgb().formatHex8();
}
function jI() {
  return mp(this).formatHsl();
}
function Hc() {
  return this.rgb().formatRgb();
}
function xo(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = BI.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? qc(t) : n === 3 ? new it(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Qo(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Qo(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = FI.exec(e)) ? new it(t[1], t[2], t[3], 1) : (t = HI.exec(e)) ? new it(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = qI.exec(e)) ? Qo(t[1], t[2], t[3], t[4]) : (t = UI.exec(e)) ? Qo(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = WI.exec(e)) ? Yc(t[1], t[2] / 100, t[3] / 100, 1) : (t = YI.exec(e)) ? Yc(t[1], t[2] / 100, t[3] / 100, t[4]) : Bc.hasOwnProperty(e) ? qc(Bc[e]) : e === "transparent" ? new it(NaN, NaN, NaN, 0) : null;
}
function qc(e) {
  return new it(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Qo(e, t, n, i) {
  return i <= 0 && (e = t = n = NaN), new it(e, t, n, i);
}
function XI(e) {
  return e instanceof Oo || (e = xo(e)), e ? (e = e.rgb(), new it(e.r, e.g, e.b, e.opacity)) : new it();
}
function gs(e, t, n, i) {
  return arguments.length === 1 ? XI(e) : new it(e, t, n, i ?? 1);
}
function it(e, t, n, i) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +i;
}
hl(it, gs, vp(Oo, {
  brighter(e) {
    return e = e == null ? Ui : Math.pow(Ui, e), new it(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? ko : Math.pow(ko, e), new it(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new it(cn(this.r), cn(this.g), cn(this.b), Wi(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Uc,
  // Deprecated! Use color.formatHex.
  formatHex: Uc,
  formatHex8: KI,
  formatRgb: Wc,
  toString: Wc
}));
function Uc() {
  return `#${sn(this.r)}${sn(this.g)}${sn(this.b)}`;
}
function KI() {
  return `#${sn(this.r)}${sn(this.g)}${sn(this.b)}${sn((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Wc() {
  const e = Wi(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${cn(this.r)}, ${cn(this.g)}, ${cn(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function Wi(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function cn(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function sn(e) {
  return e = cn(e), (e < 16 ? "0" : "") + e.toString(16);
}
function Yc(e, t, n, i) {
  return i <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new mt(e, t, n, i);
}
function mp(e) {
  if (e instanceof mt) return new mt(e.h, e.s, e.l, e.opacity);
  if (e instanceof Oo || (e = xo(e)), !e) return new mt();
  if (e instanceof mt) return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, i = e.b / 255, o = Math.min(t, n, i), r = Math.max(t, n, i), a = NaN, s = r - o, l = (r + o) / 2;
  return s ? (t === r ? a = (n - i) / s + (n < i) * 6 : n === r ? a = (i - t) / s + 2 : a = (t - n) / s + 4, s /= l < 0.5 ? r + o : 2 - r - o, a *= 60) : s = l > 0 && l < 1 ? 0 : a, new mt(a, s, l, e.opacity);
}
function ZI(e, t, n, i) {
  return arguments.length === 1 ? mp(e) : new mt(e, t, n, i ?? 1);
}
function mt(e, t, n, i) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +i;
}
hl(mt, ZI, vp(Oo, {
  brighter(e) {
    return e = e == null ? Ui : Math.pow(Ui, e), new mt(this.h, this.s, this.l * e, this.opacity);
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
    return new mt(Gc(this.h), ei(this.s), ei(this.l), Wi(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Wi(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${Gc(this.h)}, ${ei(this.s) * 100}%, ${ei(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function Gc(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function ei(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Ra(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const gp = (e) => () => e;
function JI(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function QI(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(i) {
    return Math.pow(e + i * t, n);
  };
}
function eA(e) {
  return (e = +e) == 1 ? yp : function(t, n) {
    return n - t ? QI(t, n, e) : gp(isNaN(t) ? n : t);
  };
}
function yp(e, t) {
  var n = t - e;
  return n ? JI(e, n) : gp(isNaN(e) ? t : e);
}
const jc = (function e(t) {
  var n = eA(t);
  function i(o, r) {
    var a = n((o = gs(o)).r, (r = gs(r)).r), s = n(o.g, r.g), l = n(o.b, r.b), c = yp(o.opacity, r.opacity);
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
var ys = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Da = new RegExp(ys.source, "g");
function tA(e) {
  return function() {
    return e;
  };
}
function nA(e) {
  return function(t) {
    return e(t) + "";
  };
}
function oA(e, t) {
  var n = ys.lastIndex = Da.lastIndex = 0, i, o, r, a = -1, s = [], l = [];
  for (e = e + "", t = t + ""; (i = ys.exec(e)) && (o = Da.exec(t)); )
    (r = o.index) > n && (r = t.slice(n, r), s[a] ? s[a] += r : s[++a] = r), (i = i[0]) === (o = o[0]) ? s[a] ? s[a] += o : s[++a] = o : (s[++a] = null, l.push({ i: a, x: jt(i, o) })), n = Da.lastIndex;
  return n < t.length && (r = t.slice(n), s[a] ? s[a] += r : s[++a] = r), s.length < 2 ? l[0] ? nA(l[0].x) : tA(t) : (t = l.length, function(c) {
    for (var u = 0, d; u < t; ++u) s[(d = l[u]).i] = d.x(c);
    return s.join("");
  });
}
var Xc = 180 / Math.PI, ws = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function wp(e, t, n, i, o, r) {
  var a, s, l;
  return (a = Math.sqrt(e * e + t * t)) && (e /= a, t /= a), (l = e * n + t * i) && (n -= e * l, i -= t * l), (s = Math.sqrt(n * n + i * i)) && (n /= s, i /= s, l /= s), e * i < t * n && (e = -e, t = -t, l = -l, a = -a), {
    translateX: o,
    translateY: r,
    rotate: Math.atan2(t, e) * Xc,
    skewX: Math.atan(l) * Xc,
    scaleX: a,
    scaleY: s
  };
}
var ti;
function iA(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? ws : wp(t.a, t.b, t.c, t.d, t.e, t.f);
}
function rA(e) {
  return e == null || (ti || (ti = document.createElementNS("http://www.w3.org/2000/svg", "g")), ti.setAttribute("transform", e), !(e = ti.transform.baseVal.consolidate())) ? ws : (e = e.matrix, wp(e.a, e.b, e.c, e.d, e.e, e.f));
}
function bp(e, t, n, i) {
  function o(c) {
    return c.length ? c.pop() + " " : "";
  }
  function r(c, u, d, f, p, v) {
    if (c !== d || u !== f) {
      var y = p.push("translate(", null, t, null, n);
      v.push({ i: y - 4, x: jt(c, d) }, { i: y - 2, x: jt(u, f) });
    } else (d || f) && p.push("translate(" + d + t + f + n);
  }
  function a(c, u, d, f) {
    c !== u ? (c - u > 180 ? u += 360 : u - c > 180 && (c += 360), f.push({ i: d.push(o(d) + "rotate(", null, i) - 2, x: jt(c, u) })) : u && d.push(o(d) + "rotate(" + u + i);
  }
  function s(c, u, d, f) {
    c !== u ? f.push({ i: d.push(o(d) + "skewX(", null, i) - 2, x: jt(c, u) }) : u && d.push(o(d) + "skewX(" + u + i);
  }
  function l(c, u, d, f, p, v) {
    if (c !== d || u !== f) {
      var y = p.push(o(p) + "scale(", null, ",", null, ")");
      v.push({ i: y - 4, x: jt(c, d) }, { i: y - 2, x: jt(u, f) });
    } else (d !== 1 || f !== 1) && p.push(o(p) + "scale(" + d + "," + f + ")");
  }
  return function(c, u) {
    var d = [], f = [];
    return c = e(c), u = e(u), r(c.translateX, c.translateY, u.translateX, u.translateY, d, f), a(c.rotate, u.rotate, d, f), s(c.skewX, u.skewX, d, f), l(c.scaleX, c.scaleY, u.scaleX, u.scaleY, d, f), c = u = null, function(p) {
      for (var v = -1, y = f.length, m; ++v < y; ) d[(m = f[v]).i] = m.x(p);
      return d.join("");
    };
  };
}
var aA = bp(iA, "px, ", "px)", "deg)"), sA = bp(rA, ", ", ")", ")"), lA = 1e-12;
function Kc(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function uA(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function cA(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const dA = (function e(t, n, i) {
  function o(r, a) {
    var s = r[0], l = r[1], c = r[2], u = a[0], d = a[1], f = a[2], p = u - s, v = d - l, y = p * p + v * v, m, _;
    if (y < lA)
      _ = Math.log(f / c) / t, m = function(B) {
        return [
          s + B * p,
          l + B * v,
          c * Math.exp(t * B * _)
        ];
      };
    else {
      var x = Math.sqrt(y), w = (f * f - c * c + i * y) / (2 * c * n * x), b = (f * f - c * c - i * y) / (2 * f * n * x), C = Math.log(Math.sqrt(w * w + 1) - w), I = Math.log(Math.sqrt(b * b + 1) - b);
      _ = (I - C) / t, m = function(B) {
        var T = B * _, M = Kc(C), V = c / (n * x) * (M * cA(t * T + C) - uA(C));
        return [
          s + V * p,
          l + V * v,
          c * M / Kc(t * T + C)
        ];
      };
    }
    return m.duration = _ * 1e3 * t / Math.SQRT2, m;
  }
  return o.rho = function(r) {
    var a = Math.max(1e-3, +r), s = a * a, l = s * s;
    return e(a, s, l);
  }, o;
})(Math.SQRT2, 2, 4);
var Pn = 0, Zn = 0, Wn = 0, _p = 1e3, Yi, Jn, Gi = 0, vn = 0, pr = 0, $o = typeof performance == "object" && performance.now ? performance : Date, kp = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function pl() {
  return vn || (kp(fA), vn = $o.now() + pr);
}
function fA() {
  vn = 0;
}
function ji() {
  this._call = this._time = this._next = null;
}
ji.prototype = Ep.prototype = {
  constructor: ji,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? pl() : +n) + (t == null ? 0 : +t), !this._next && Jn !== this && (Jn ? Jn._next = this : Yi = this, Jn = this), this._call = e, this._time = n, bs();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, bs());
  }
};
function Ep(e, t, n) {
  var i = new ji();
  return i.restart(e, t, n), i;
}
function hA() {
  pl(), ++Pn;
  for (var e = Yi, t; e; )
    (t = vn - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Pn;
}
function Zc() {
  vn = (Gi = $o.now()) + pr, Pn = Zn = 0;
  try {
    hA();
  } finally {
    Pn = 0, vA(), vn = 0;
  }
}
function pA() {
  var e = $o.now(), t = e - Gi;
  t > _p && (pr -= t, Gi = e);
}
function vA() {
  for (var e, t = Yi, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Yi = n);
  Jn = e, bs(i);
}
function bs(e) {
  if (!Pn) {
    Zn && (Zn = clearTimeout(Zn));
    var t = e - vn;
    t > 24 ? (e < 1 / 0 && (Zn = setTimeout(Zc, e - $o.now() - pr)), Wn && (Wn = clearInterval(Wn))) : (Wn || (Gi = $o.now(), Wn = setInterval(pA, _p)), Pn = 1, kp(Zc));
  }
}
function Jc(e, t, n) {
  var i = new ji();
  return t = t == null ? 0 : +t, i.restart((o) => {
    i.stop(), e(o + t);
  }, t, n), i;
}
var mA = cl("start", "end", "cancel", "interrupt"), gA = [], xp = 0, Qc = 1, _s = 2, pi = 3, ed = 4, ks = 5, vi = 6;
function vr(e, t, n, i, o, r) {
  var a = e.__transition;
  if (!a) e.__transition = {};
  else if (n in a) return;
  yA(e, n, {
    name: t,
    index: i,
    // For context during callback.
    group: o,
    // For context during callback.
    on: mA,
    tween: gA,
    time: r.time,
    delay: r.delay,
    duration: r.duration,
    ease: r.ease,
    timer: null,
    state: xp
  });
}
function vl(e, t) {
  var n = _t(e, t);
  if (n.state > xp) throw new Error("too late; already scheduled");
  return n;
}
function Mt(e, t) {
  var n = _t(e, t);
  if (n.state > pi) throw new Error("too late; already running");
  return n;
}
function _t(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t])) throw new Error("transition not found");
  return n;
}
function yA(e, t, n) {
  var i = e.__transition, o;
  i[t] = n, n.timer = Ep(r, 0, n.time);
  function r(c) {
    n.state = Qc, n.timer.restart(a, n.delay, n.time), n.delay <= c && a(c - n.delay);
  }
  function a(c) {
    var u, d, f, p;
    if (n.state !== Qc) return l();
    for (u in i)
      if (p = i[u], p.name === n.name) {
        if (p.state === pi) return Jc(a);
        p.state === ed ? (p.state = vi, p.timer.stop(), p.on.call("interrupt", e, e.__data__, p.index, p.group), delete i[u]) : +u < t && (p.state = vi, p.timer.stop(), p.on.call("cancel", e, e.__data__, p.index, p.group), delete i[u]);
      }
    if (Jc(function() {
      n.state === pi && (n.state = ed, n.timer.restart(s, n.delay, n.time), s(c));
    }), n.state = _s, n.on.call("start", e, e.__data__, n.index, n.group), n.state === _s) {
      for (n.state = pi, o = new Array(f = n.tween.length), u = 0, d = -1; u < f; ++u)
        (p = n.tween[u].value.call(e, e.__data__, n.index, n.group)) && (o[++d] = p);
      o.length = d + 1;
    }
  }
  function s(c) {
    for (var u = c < n.duration ? n.ease.call(null, c / n.duration) : (n.timer.restart(l), n.state = ks, 1), d = -1, f = o.length; ++d < f; )
      o[d].call(e, u);
    n.state === ks && (n.on.call("end", e, e.__data__, n.index, n.group), l());
  }
  function l() {
    n.state = vi, n.timer.stop(), delete i[t];
    for (var c in i) return;
    delete e.__transition;
  }
}
function mi(e, t) {
  var n = e.__transition, i, o, r = !0, a;
  if (n) {
    t = t == null ? null : t + "";
    for (a in n) {
      if ((i = n[a]).name !== t) {
        r = !1;
        continue;
      }
      o = i.state > _s && i.state < ks, i.state = vi, i.timer.stop(), i.on.call(o ? "interrupt" : "cancel", e, e.__data__, i.index, i.group), delete n[a];
    }
    r && delete e.__transition;
  }
}
function wA(e) {
  return this.each(function() {
    mi(this, e);
  });
}
function bA(e, t) {
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
function _A(e, t, n) {
  var i, o;
  if (typeof n != "function") throw new Error();
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
function kA(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var i = _t(this.node(), n).tween, o = 0, r = i.length, a; o < r; ++o)
      if ((a = i[o]).name === e)
        return a.value;
    return null;
  }
  return this.each((t == null ? bA : _A)(n, e, t));
}
function ml(e, t, n) {
  var i = e._id;
  return e.each(function() {
    var o = Mt(this, i);
    (o.value || (o.value = {}))[t] = n.apply(this, arguments);
  }), function(o) {
    return _t(o, i).value[t];
  };
}
function $p(e, t) {
  var n;
  return (typeof t == "number" ? jt : t instanceof xo ? jc : (n = xo(t)) ? (t = n, jc) : oA)(e, t);
}
function EA(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function xA(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function $A(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttribute(e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function SA(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttributeNS(e.space, e.local);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function CA(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttribute(e) : (a = this.getAttribute(e), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function NA(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttributeNS(e.space, e.local) : (a = this.getAttributeNS(e.space, e.local), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function IA(e, t) {
  var n = hr(e), i = n === "transform" ? sA : $p;
  return this.attrTween(e, typeof t == "function" ? (n.local ? NA : CA)(n, i, ml(this, "attr." + e, t)) : t == null ? (n.local ? xA : EA)(n) : (n.local ? SA : $A)(n, i, t));
}
function AA(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function TA(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function MA(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && TA(e, r)), n;
  }
  return o._value = t, o;
}
function OA(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && AA(e, r)), n;
  }
  return o._value = t, o;
}
function RA(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  var i = hr(e);
  return this.tween(n, (i.local ? MA : OA)(i, t));
}
function DA(e, t) {
  return function() {
    vl(this, e).delay = +t.apply(this, arguments);
  };
}
function PA(e, t) {
  return t = +t, function() {
    vl(this, e).delay = t;
  };
}
function LA(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? DA : PA)(t, e)) : _t(this.node(), t).delay;
}
function VA(e, t) {
  return function() {
    Mt(this, e).duration = +t.apply(this, arguments);
  };
}
function zA(e, t) {
  return t = +t, function() {
    Mt(this, e).duration = t;
  };
}
function BA(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? VA : zA)(t, e)) : _t(this.node(), t).duration;
}
function FA(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    Mt(this, e).ease = t;
  };
}
function HA(e) {
  var t = this._id;
  return arguments.length ? this.each(FA(t, e)) : _t(this.node(), t).ease;
}
function qA(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    Mt(this, e).ease = n;
  };
}
function UA(e) {
  if (typeof e != "function") throw new Error();
  return this.each(qA(this._id, e));
}
function WA(e) {
  typeof e != "function" && (e = rp(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new Ft(i, this._parents, this._name, this._id);
}
function YA(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, n = e._groups, i = t.length, o = n.length, r = Math.min(i, o), a = new Array(i), s = 0; s < r; ++s)
    for (var l = t[s], c = n[s], u = l.length, d = a[s] = new Array(u), f, p = 0; p < u; ++p)
      (f = l[p] || c[p]) && (d[p] = f);
  for (; s < i; ++s)
    a[s] = t[s];
  return new Ft(a, this._parents, this._name, this._id);
}
function GA(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function jA(e, t, n) {
  var i, o, r = GA(t) ? vl : Mt;
  return function() {
    var a = r(this, e), s = a.on;
    s !== i && (o = (i = s).copy()).on(t, n), a.on = o;
  };
}
function XA(e, t) {
  var n = this._id;
  return arguments.length < 2 ? _t(this.node(), n).on.on(e) : this.each(jA(n, e, t));
}
function KA(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition) if (+n !== e) return;
    t && t.removeChild(this);
  };
}
function ZA() {
  return this.on("end.remove", KA(this._id));
}
function JA(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = dl(e));
  for (var i = this._groups, o = i.length, r = new Array(o), a = 0; a < o; ++a)
    for (var s = i[a], l = s.length, c = r[a] = new Array(l), u, d, f = 0; f < l; ++f)
      (u = s[f]) && (d = e.call(u, u.__data__, f, s)) && ("__data__" in u && (d.__data__ = u.__data__), c[f] = d, vr(c[f], t, n, f, c, _t(u, n)));
  return new Ft(r, this._parents, t, n);
}
function QA(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = ip(e));
  for (var i = this._groups, o = i.length, r = [], a = [], s = 0; s < o; ++s)
    for (var l = i[s], c = l.length, u, d = 0; d < c; ++d)
      if (u = l[d]) {
        for (var f = e.call(u, u.__data__, d, l), p, v = _t(u, n), y = 0, m = f.length; y < m; ++y)
          (p = f[y]) && vr(p, t, n, y, f, v);
        r.push(f), a.push(u);
      }
  return new Ft(r, a, t, n);
}
var eT = Mo.prototype.constructor;
function tT() {
  return new eT(this._groups, this._parents);
}
function nT(e, t) {
  var n, i, o;
  return function() {
    var r = Dn(this, e), a = (this.style.removeProperty(e), Dn(this, e));
    return r === a ? null : r === n && a === i ? o : o = t(n = r, i = a);
  };
}
function Sp(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function oT(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = Dn(this, e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function iT(e, t, n) {
  var i, o, r;
  return function() {
    var a = Dn(this, e), s = n(this), l = s + "";
    return s == null && (l = s = (this.style.removeProperty(e), Dn(this, e))), a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s));
  };
}
function rT(e, t) {
  var n, i, o, r = "style." + t, a = "end." + r, s;
  return function() {
    var l = Mt(this, e), c = l.on, u = l.value[r] == null ? s || (s = Sp(t)) : void 0;
    (c !== n || o !== u) && (i = (n = c).copy()).on(a, o = u), l.on = i;
  };
}
function aT(e, t, n) {
  var i = (e += "") == "transform" ? aA : $p;
  return t == null ? this.styleTween(e, nT(e, i)).on("end.style." + e, Sp(e)) : typeof t == "function" ? this.styleTween(e, iT(e, i, ml(this, "style." + e, t))).each(rT(this._id, e)) : this.styleTween(e, oT(e, i, t), n).on("end.style." + e, null);
}
function sT(e, t, n) {
  return function(i) {
    this.style.setProperty(e, t.call(this, i), n);
  };
}
function lT(e, t, n) {
  var i, o;
  function r() {
    var a = t.apply(this, arguments);
    return a !== o && (i = (o = a) && sT(e, a, n)), i;
  }
  return r._value = t, r;
}
function uT(e, t, n) {
  var i = "style." + (e += "");
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (t == null) return this.tween(i, null);
  if (typeof t != "function") throw new Error();
  return this.tween(i, lT(e, t, n ?? ""));
}
function cT(e) {
  return function() {
    this.textContent = e;
  };
}
function dT(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function fT(e) {
  return this.tween("text", typeof e == "function" ? dT(ml(this, "text", e)) : cT(e == null ? "" : e + ""));
}
function hT(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function pT(e) {
  var t, n;
  function i() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && hT(o)), t;
  }
  return i._value = e, i;
}
function vT(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, pT(e));
}
function mT() {
  for (var e = this._name, t = this._id, n = Cp(), i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      if (l = a[c]) {
        var u = _t(l, t);
        vr(l, e, n, c, a, {
          time: u.time + u.delay + u.duration,
          delay: 0,
          duration: u.duration,
          ease: u.ease
        });
      }
  return new Ft(i, this._parents, e, n);
}
function gT() {
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
var yT = 0;
function Ft(e, t, n, i) {
  this._groups = e, this._parents = t, this._name = n, this._id = i;
}
function Cp() {
  return ++yT;
}
var Rt = Mo.prototype;
Ft.prototype = {
  constructor: Ft,
  select: JA,
  selectAll: QA,
  selectChild: Rt.selectChild,
  selectChildren: Rt.selectChildren,
  filter: WA,
  merge: YA,
  selection: tT,
  transition: mT,
  call: Rt.call,
  nodes: Rt.nodes,
  node: Rt.node,
  size: Rt.size,
  empty: Rt.empty,
  each: Rt.each,
  on: XA,
  attr: IA,
  attrTween: RA,
  style: aT,
  styleTween: uT,
  text: fT,
  textTween: vT,
  remove: ZA,
  tween: kA,
  delay: LA,
  duration: BA,
  ease: HA,
  easeVarying: UA,
  end: gT,
  [Symbol.iterator]: Rt[Symbol.iterator]
};
function wT(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var bT = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: wT
};
function _T(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function kT(e) {
  var t, n;
  e instanceof Ft ? (t = e._id, e = e._name) : (t = Cp(), (n = bT).time = pl(), e = e == null ? null : e + "");
  for (var i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && vr(l, e, t, c, a, n || _T(l, t));
  return new Ft(i, this._parents, e, t);
}
Mo.prototype.interrupt = wA;
Mo.prototype.transition = kT;
const ni = (e) => () => e;
function ET(e, {
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
var gl = new Vt(1, 0, 0);
Vt.prototype;
function Pa(e) {
  e.stopImmediatePropagation();
}
function Yn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function xT(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function $T() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function td() {
  return this.__zoom || gl;
}
function ST(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function CT() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function NT(e, t, n) {
  var i = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], r = e.invertY(t[0][1]) - n[0][1], a = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > i ? (i + o) / 2 : Math.min(0, i) || Math.max(0, o),
    a > r ? (r + a) / 2 : Math.min(0, r) || Math.max(0, a)
  );
}
function IT() {
  var e = xT, t = $T, n = NT, i = ST, o = CT, r = [0, 1 / 0], a = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], s = 250, l = dA, c = cl("start", "zoom", "end"), u, d, f, p = 500, v = 150, y = 0, m = 10;
  function _(g) {
    g.property("__zoom", td).on("wheel.zoom", T, { passive: !1 }).on("mousedown.zoom", M).on("dblclick.zoom", V).filter(o).on("touchstart.zoom", O).on("touchmove.zoom", E).on("touchend.zoom touchcancel.zoom", F).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  _.transform = function(g, $, k, H) {
    var q = g.selection ? g.selection() : g;
    q.property("__zoom", td), g !== q ? C(g, $, k, H) : q.interrupt().each(function() {
      I(this, arguments).event(H).start().zoom(null, typeof $ == "function" ? $.apply(this, arguments) : $).end();
    });
  }, _.scaleBy = function(g, $, k, H) {
    _.scaleTo(g, function() {
      var q = this.__zoom.k, ee = typeof $ == "function" ? $.apply(this, arguments) : $;
      return q * ee;
    }, k, H);
  }, _.scaleTo = function(g, $, k, H) {
    _.transform(g, function() {
      var q = t.apply(this, arguments), ee = this.__zoom, Z = k == null ? b(q) : typeof k == "function" ? k.apply(this, arguments) : k, oe = ee.invert(Z), se = typeof $ == "function" ? $.apply(this, arguments) : $;
      return n(w(x(ee, se), Z, oe), q, a);
    }, k, H);
  }, _.translateBy = function(g, $, k, H) {
    _.transform(g, function() {
      return n(this.__zoom.translate(
        typeof $ == "function" ? $.apply(this, arguments) : $,
        typeof k == "function" ? k.apply(this, arguments) : k
      ), t.apply(this, arguments), a);
    }, null, H);
  }, _.translateTo = function(g, $, k, H, q) {
    _.transform(g, function() {
      var ee = t.apply(this, arguments), Z = this.__zoom, oe = H == null ? b(ee) : typeof H == "function" ? H.apply(this, arguments) : H;
      return n(gl.translate(oe[0], oe[1]).scale(Z.k).translate(
        typeof $ == "function" ? -$.apply(this, arguments) : -$,
        typeof k == "function" ? -k.apply(this, arguments) : -k
      ), ee, a);
    }, H, q);
  };
  function x(g, $) {
    return $ = Math.max(r[0], Math.min(r[1], $)), $ === g.k ? g : new Vt($, g.x, g.y);
  }
  function w(g, $, k) {
    var H = $[0] - k[0] * g.k, q = $[1] - k[1] * g.k;
    return H === g.x && q === g.y ? g : new Vt(g.k, H, q);
  }
  function b(g) {
    return [(+g[0][0] + +g[1][0]) / 2, (+g[0][1] + +g[1][1]) / 2];
  }
  function C(g, $, k, H) {
    g.on("start.zoom", function() {
      I(this, arguments).event(H).start();
    }).on("interrupt.zoom end.zoom", function() {
      I(this, arguments).event(H).end();
    }).tween("zoom", function() {
      var q = this, ee = arguments, Z = I(q, ee).event(H), oe = t.apply(q, ee), se = k == null ? b(oe) : typeof k == "function" ? k.apply(q, ee) : k, Y = Math.max(oe[1][0] - oe[0][0], oe[1][1] - oe[0][1]), J = q.__zoom, j = typeof $ == "function" ? $.apply(q, ee) : $, X = l(J.invert(se).concat(Y / J.k), j.invert(se).concat(Y / j.k));
      return function(te) {
        if (te === 1) te = j;
        else {
          var ae = X(te), ue = Y / ae[2];
          te = new Vt(ue, se[0] - ae[0] * ue, se[1] - ae[1] * ue);
        }
        Z.zoom(null, te);
      };
    });
  }
  function I(g, $, k) {
    return !k && g.__zooming || new B(g, $);
  }
  function B(g, $) {
    this.that = g, this.args = $, this.active = 0, this.sourceEvent = null, this.extent = t.apply(g, $), this.taps = 0;
  }
  B.prototype = {
    event: function(g) {
      return g && (this.sourceEvent = g), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(g, $) {
      return this.mouse && g !== "mouse" && (this.mouse[1] = $.invert(this.mouse[0])), this.touch0 && g !== "touch" && (this.touch0[1] = $.invert(this.touch0[0])), this.touch1 && g !== "touch" && (this.touch1[1] = $.invert(this.touch1[0])), this.that.__zoom = $, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(g) {
      var $ = Kt(this.that).datum();
      c.call(
        g,
        this.that,
        new ET(g, {
          sourceEvent: this.sourceEvent,
          target: _,
          transform: this.that.__zoom,
          dispatch: c
        }),
        $
      );
    }
  };
  function T(g, ...$) {
    if (!e.apply(this, arguments)) return;
    var k = I(this, $).event(g), H = this.__zoom, q = Math.max(r[0], Math.min(r[1], H.k * Math.pow(2, i.apply(this, arguments)))), ee = Yt(g);
    if (k.wheel)
      (k.mouse[0][0] !== ee[0] || k.mouse[0][1] !== ee[1]) && (k.mouse[1] = H.invert(k.mouse[0] = ee)), clearTimeout(k.wheel);
    else {
      if (H.k === q) return;
      k.mouse = [ee, H.invert(ee)], mi(this), k.start();
    }
    Yn(g), k.wheel = setTimeout(Z, v), k.zoom("mouse", n(w(x(H, q), k.mouse[0], k.mouse[1]), k.extent, a));
    function Z() {
      k.wheel = null, k.end();
    }
  }
  function M(g, ...$) {
    if (f || !e.apply(this, arguments)) return;
    var k = g.currentTarget, H = I(this, $, !0).event(g), q = Kt(g.view).on("mousemove.zoom", se, !0).on("mouseup.zoom", Y, !0), ee = Yt(g, k), Z = g.clientX, oe = g.clientY;
    VI(g.view), Pa(g), H.mouse = [ee, this.__zoom.invert(ee)], mi(this), H.start();
    function se(J) {
      if (Yn(J), !H.moved) {
        var j = J.clientX - Z, X = J.clientY - oe;
        H.moved = j * j + X * X > y;
      }
      H.event(J).zoom("mouse", n(w(H.that.__zoom, H.mouse[0] = Yt(J, k), H.mouse[1]), H.extent, a));
    }
    function Y(J) {
      q.on("mousemove.zoom mouseup.zoom", null), zI(J.view, H.moved), Yn(J), H.event(J).end();
    }
  }
  function V(g, ...$) {
    if (e.apply(this, arguments)) {
      var k = this.__zoom, H = Yt(g.changedTouches ? g.changedTouches[0] : g, this), q = k.invert(H), ee = k.k * (g.shiftKey ? 0.5 : 2), Z = n(w(x(k, ee), H, q), t.apply(this, $), a);
      Yn(g), s > 0 ? Kt(this).transition().duration(s).call(C, Z, H, g) : Kt(this).call(_.transform, Z, H, g);
    }
  }
  function O(g, ...$) {
    if (e.apply(this, arguments)) {
      var k = g.touches, H = k.length, q = I(this, $, g.changedTouches.length === H).event(g), ee, Z, oe, se;
      for (Pa(g), Z = 0; Z < H; ++Z)
        oe = k[Z], se = Yt(oe, this), se = [se, this.__zoom.invert(se), oe.identifier], q.touch0 ? !q.touch1 && q.touch0[2] !== se[2] && (q.touch1 = se, q.taps = 0) : (q.touch0 = se, ee = !0, q.taps = 1 + !!u);
      u && (u = clearTimeout(u)), ee && (q.taps < 2 && (d = se[0], u = setTimeout(function() {
        u = null;
      }, p)), mi(this), q.start());
    }
  }
  function E(g, ...$) {
    if (this.__zooming) {
      var k = I(this, $).event(g), H = g.changedTouches, q = H.length, ee, Z, oe, se;
      for (Yn(g), ee = 0; ee < q; ++ee)
        Z = H[ee], oe = Yt(Z, this), k.touch0 && k.touch0[2] === Z.identifier ? k.touch0[0] = oe : k.touch1 && k.touch1[2] === Z.identifier && (k.touch1[0] = oe);
      if (Z = k.that.__zoom, k.touch1) {
        var Y = k.touch0[0], J = k.touch0[1], j = k.touch1[0], X = k.touch1[1], te = (te = j[0] - Y[0]) * te + (te = j[1] - Y[1]) * te, ae = (ae = X[0] - J[0]) * ae + (ae = X[1] - J[1]) * ae;
        Z = x(Z, Math.sqrt(te / ae)), oe = [(Y[0] + j[0]) / 2, (Y[1] + j[1]) / 2], se = [(J[0] + X[0]) / 2, (J[1] + X[1]) / 2];
      } else if (k.touch0) oe = k.touch0[0], se = k.touch0[1];
      else return;
      k.zoom("touch", n(w(Z, oe, se), k.extent, a));
    }
  }
  function F(g, ...$) {
    if (this.__zooming) {
      var k = I(this, $).event(g), H = g.changedTouches, q = H.length, ee, Z;
      for (Pa(g), f && clearTimeout(f), f = setTimeout(function() {
        f = null;
      }, p), ee = 0; ee < q; ++ee)
        Z = H[ee], k.touch0 && k.touch0[2] === Z.identifier ? delete k.touch0 : k.touch1 && k.touch1[2] === Z.identifier && delete k.touch1;
      if (k.touch1 && !k.touch0 && (k.touch0 = k.touch1, delete k.touch1), k.touch0) k.touch0[1] = this.__zoom.invert(k.touch0[0]);
      else if (k.end(), k.taps === 2 && (Z = Yt(Z, this), Math.hypot(d[0] - Z[0], d[1] - Z[1]) < m)) {
        var oe = Kt(this).on("dblclick.zoom");
        oe && oe.apply(this, arguments);
      }
    }
  }
  return _.wheelDelta = function(g) {
    return arguments.length ? (i = typeof g == "function" ? g : ni(+g), _) : i;
  }, _.filter = function(g) {
    return arguments.length ? (e = typeof g == "function" ? g : ni(!!g), _) : e;
  }, _.touchable = function(g) {
    return arguments.length ? (o = typeof g == "function" ? g : ni(!!g), _) : o;
  }, _.extent = function(g) {
    return arguments.length ? (t = typeof g == "function" ? g : ni([[+g[0][0], +g[0][1]], [+g[1][0], +g[1][1]]]), _) : t;
  }, _.scaleExtent = function(g) {
    return arguments.length ? (r[0] = +g[0], r[1] = +g[1], _) : [r[0], r[1]];
  }, _.translateExtent = function(g) {
    return arguments.length ? (a[0][0] = +g[0][0], a[1][0] = +g[1][0], a[0][1] = +g[0][1], a[1][1] = +g[1][1], _) : [[a[0][0], a[0][1]], [a[1][0], a[1][1]]];
  }, _.constrain = function(g) {
    return arguments.length ? (n = g, _) : n;
  }, _.duration = function(g) {
    return arguments.length ? (s = +g, _) : s;
  }, _.interpolate = function(g) {
    return arguments.length ? (l = g, _) : l;
  }, _.on = function() {
    var g = c.on.apply(c, arguments);
    return g === c ? _ : g;
  }, _.clickDistance = function(g) {
    return arguments.length ? (y = (g = +g) * g, _) : Math.sqrt(y);
  }, _.tapDistance = function(g) {
    return arguments.length ? (m = +g, _) : m;
  }, _;
}
const Np = Symbol("MiniMapSlots"), AT = ["id", "x", "y", "rx", "ry", "width", "height", "fill", "stroke", "stroke-width", "shape-rendering"], TT = {
  name: "MiniMapNode",
  compatConfig: { MODE: 3 },
  inheritAttrs: !1
}, MT = /* @__PURE__ */ ye({
  ...TT,
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
    const n = e, i = Ht(Np), o = Es(), r = Ne(() => o.style ?? {});
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
    return (d, f) => !d.hidden && d.dimensions.width !== 0 && d.dimensions.height !== 0 ? (N(), D(le, { key: 0 }, [
      h(i)[`node-${n.type}`] ? (N(), re(Xt(h(i)[`node-${n.type}`]), Hm(oo({ key: 0 }, { ...n, ...d.$attrs })), null, 16)) : (N(), D("rect", oo({
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
      }), null, 16, AT))
    ], 64)) : Q("", !0);
  }
}), OT = ["width", "height", "viewBox", "aria-labelledby"], RT = ["id"], DT = ["d", "fill", "stroke", "stroke-width"], PT = {
  name: "MiniMap",
  compatConfig: { MODE: 3 }
}, LT = /* @__PURE__ */ ye({
  ...PT,
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
    const n = pd(), i = Es(), o = 200, r = 150, { id: a, edges: s, viewport: l, translateExtent: c, dimensions: u, emits: d, d3Selection: f, d3Zoom: p, getNodesInitialized: v } = De(), y = G();
    Zt(Np, n);
    const m = Ne(() => {
      var q;
      return e.width ?? ((q = i.style) == null ? void 0 : q.width) ?? o;
    }), _ = Ne(() => {
      var q;
      return e.height ?? ((q = i.style) == null ? void 0 : q.height) ?? r;
    }), x = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision", w = U(() => typeof e.nodeColor == "string" ? () => e.nodeColor : e.nodeColor), b = U(
      () => typeof e.nodeStrokeColor == "string" ? () => e.nodeStrokeColor : e.nodeStrokeColor
    ), C = U(
      () => typeof e.nodeClassName == "string" ? () => e.nodeClassName : typeof e.nodeClassName == "function" ? e.nodeClassName : () => ""
    ), I = U(() => Ws(v.value.filter((q) => !q.hidden))), B = U(() => ({
      x: -l.value.x / l.value.zoom,
      y: -l.value.y / l.value.zoom,
      width: u.value.width / l.value.zoom,
      height: u.value.height / l.value.zoom
    })), T = U(
      () => v.value && v.value.length ? p_(I.value, B.value) : B.value
    ), M = U(() => {
      const q = T.value.width / m.value, ee = T.value.height / _.value;
      return Math.max(q, ee);
    }), V = U(() => {
      const q = M.value * m.value, ee = M.value * _.value, Z = e.offsetScale * M.value;
      return {
        offset: Z,
        x: T.value.x - (q - T.value.width) / 2 - Z,
        y: T.value.y - (ee - T.value.height) / 2 - Z,
        width: q + Z * 2,
        height: ee + Z * 2
      };
    }), O = U(() => !V.value.x || !V.value.y ? "" : `
    M${V.value.x - V.value.offset},${V.value.y - V.value.offset}
    h${V.value.width + V.value.offset * 2}
    v${V.value.height + V.value.offset * 2}
    h${-V.value.width - V.value.offset * 2}z
    M${B.value.x + e.maskBorderRadius},${B.value.y}
    h${B.value.width - 2 * e.maskBorderRadius}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 ${e.maskBorderRadius},${e.maskBorderRadius}
    v${B.value.height - 2 * e.maskBorderRadius}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 -${e.maskBorderRadius},${e.maskBorderRadius}
    h${-(B.value.width - 2 * e.maskBorderRadius)}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 -${e.maskBorderRadius},-${e.maskBorderRadius}
    v${-(B.value.height - 2 * e.maskBorderRadius)}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 ${e.maskBorderRadius},-${e.maskBorderRadius}z`);
    md(
      (q) => {
        if (y.value) {
          const ee = Kt(y.value), Z = (Y) => {
            if (Y.sourceEvent.type !== "wheel" || !f.value || !p.value)
              return;
            const J = Y.sourceEvent.ctrlKey && go() ? 10 : 1, j = -Y.sourceEvent.deltaY * (Y.sourceEvent.deltaMode === 1 ? 0.05 : Y.sourceEvent.deltaMode ? 1 : 2e-3) * e.zoomStep, X = l.value.zoom * 2 ** (j * J);
            p.value.scaleTo(f.value, X);
          }, oe = (Y) => {
            if (Y.sourceEvent.type !== "mousemove" || !f.value || !p.value)
              return;
            const J = M.value * Math.max(1, l.value.zoom) * (e.inversePan ? -1 : 1), j = {
              x: l.value.x - Y.sourceEvent.movementX * J,
              y: l.value.y - Y.sourceEvent.movementY * J
            }, X = [
              [0, 0],
              [u.value.width, u.value.height]
            ], te = gl.translate(j.x, j.y).scale(l.value.zoom), ae = p.value.constrain()(te, X, c.value);
            p.value.transform(f.value, ae);
          }, se = IT().wheelDelta((Y) => Qa(Y) * (e.zoomStep / 10)).on("zoom", e.pannable ? oe : () => {
          }).on("zoom.wheel", e.zoomable ? Z : () => {
          });
          ee.call(se), q(() => {
            ee.on("zoom", null);
          });
        }
      },
      { flush: "post" }
    );
    function E(q) {
      const [ee, Z] = Yt(q);
      t("click", { event: q, position: { x: ee, y: Z } });
    }
    function F(q, ee) {
      const Z = { event: q, node: ee, connectedEdges: on([ee], s.value) };
      d.miniMapNodeClick(Z), t("nodeClick", Z);
    }
    function g(q, ee) {
      const Z = { event: q, node: ee, connectedEdges: on([ee], s.value) };
      d.miniMapNodeDoubleClick(Z), t("nodeDblclick", Z);
    }
    function $(q, ee) {
      const Z = { event: q, node: ee, connectedEdges: on([ee], s.value) };
      d.miniMapNodeMouseEnter(Z), t("nodeMouseenter", Z);
    }
    function k(q, ee) {
      const Z = { event: q, node: ee, connectedEdges: on([ee], s.value) };
      d.miniMapNodeMouseMove(Z), t("nodeMousemove", Z);
    }
    function H(q, ee) {
      const Z = { event: q, node: ee, connectedEdges: on([ee], s.value) };
      d.miniMapNodeMouseLeave(Z), t("nodeMouseleave", Z);
    }
    return (q, ee) => (N(), re(h(Zf), {
      position: q.position,
      class: Ie(["vue-flow__minimap", { pannable: q.pannable, zoomable: q.zoomable }])
    }, {
      default: ne(() => [
        (N(), D("svg", {
          ref_key: "el",
          ref: y,
          width: m.value,
          height: _.value,
          viewBox: [V.value.x, V.value.y, V.value.width, V.value.height].join(" "),
          role: "img",
          "aria-labelledby": `vue-flow__minimap-${h(a)}`,
          onClick: E
        }, [
          q.ariaLabel ? (N(), D("title", {
            key: 0,
            id: `vue-flow__minimap-${h(a)}`
          }, K(q.ariaLabel), 9, RT)) : Q("", !0),
          (N(!0), D(le, null, Re(h(v), (Z) => (N(), re(MT, {
            id: Z.id,
            key: Z.id,
            f: "",
            position: Z.computedPosition,
            dimensions: Z.dimensions,
            selected: Z.selected,
            dragging: Z.dragging,
            style: Be(Z.style),
            class: Ie(C.value(Z)),
            color: w.value(Z),
            "border-radius": q.nodeBorderRadius,
            "stroke-color": b.value(Z),
            "stroke-width": q.nodeStrokeWidth,
            "shape-rendering": h(x),
            type: Z.type,
            hidden: Z.hidden,
            onClick: (oe) => F(oe, Z),
            onDblclick: (oe) => g(oe, Z),
            onMouseenter: (oe) => $(oe, Z),
            onMousemove: (oe) => k(oe, Z),
            onMouseleave: (oe) => H(oe, Z)
          }, null, 8, ["id", "position", "dimensions", "selected", "dragging", "style", "class", "color", "border-radius", "stroke-color", "stroke-width", "shape-rendering", "type", "hidden", "onClick", "onDblclick", "onMouseenter", "onMousemove", "onMouseleave"]))), 128)),
          S("path", {
            class: "vue-flow__minimap-mask",
            d: O.value,
            fill: q.maskColor,
            stroke: q.maskStrokeColor,
            "stroke-width": q.maskStrokeWidth,
            "fill-rule": "evenodd"
          }, null, 8, DT)
        ], 8, OT))
      ]),
      _: 1
    }, 8, ["position", "class"]));
  }
}), VT = {
  id: "workflow-step-palette",
  class: "wf-palette"
}, zT = { class: "wf-palette-scroll" }, BT = {
  key: 0,
  class: "wf-palette-loading"
}, FT = ["id"], HT = { class: "wf-palette-ico wf-palette-ico--note" }, qT = { class: "wf-palette-ico wf-palette-ico--note" }, UT = { class: "wf-palette-count" }, WT = ["id"], YT = { class: "wf-palette-count" }, GT = { class: "wf-palette-item-body" }, jT = { class: "wf-palette-item-t" }, XT = {
  key: 0,
  class: "wf-palette-item-s"
}, KT = /* @__PURE__ */ ye({
  __name: "Palette",
  props: {
    items: {},
    loading: { type: Boolean },
    errors: {}
  },
  emits: ["place", "place-note", "place-frame"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = G(""), r = G(/* @__PURE__ */ new Set(["Tools", "Destinations", "Notes"])), a = U(() => o.value.trim().length > 0);
    function s(w) {
      return a.value || !r.value.has(w);
    }
    const l = U(() => mN(n.items, o.value, eg));
    function c(w) {
      const b = new Set(r.value);
      b.has(w) ? b.delete(w) : b.add(w), r.value = b;
    }
    function u(w) {
      return `palette-group-${w.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }
    const d = G(/* @__PURE__ */ new Set());
    function f(w, b) {
      return `${w}::${b}`;
    }
    function p(w, b) {
      return a.value || d.value.has(f(w, b));
    }
    function v(w, b) {
      const C = f(w, b), I = new Set(d.value);
      I.has(C) ? I.delete(C) : I.add(C), d.value = I;
    }
    function y(w) {
      if (w.items.length < fN)
        return w.items.map((C) => ({ kind: "item", key: C.paletteId, item: C }));
      const b = [];
      for (const C of pN(w.items)) {
        const I = p(w.cat, C.module);
        if (b.push({ kind: "sub", key: `s:${C.module}`, module: C.module, count: C.items.length, open: I }), I) for (const B of C.items) b.push({ kind: "item", key: `${C.module}:${B.paletteId}`, item: B });
      }
      return b;
    }
    function m(w, b) {
      w.dataTransfer && (w.dataTransfer.setData("application/wf-item", b.paletteId), w.dataTransfer.effectAllowed = "copy");
    }
    function _(w) {
      w.dataTransfer && (w.dataTransfer.setData("application/wf-item", "note:new"), w.dataTransfer.effectAllowed = "copy");
    }
    function x(w) {
      w.dataTransfer && (w.dataTransfer.setData("application/wf-item", "frame:new"), w.dataTransfer.effectAllowed = "copy");
    }
    return (w, b) => (N(), D("div", VT, [
      z(h(Md), { class: "wf-palette-search" }, {
        default: ne(() => [
          z(h(Od), null, {
            default: ne(() => [
              z(h(ie), {
                icon: "tabler:search",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }),
          z(h(rt), {
            modelValue: o.value,
            "onUpdate:modelValue": b[0] || (b[0] = (C) => o.value = C),
            type: "text",
            placeholder: "Search steps  (⌘K)",
            "aria-label": "Search steps"
          }, null, 8, ["modelValue"])
        ]),
        _: 1
      }),
      S("div", zT, [
        e.loading ? (N(), D("div", BT, [
          z(h(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading catalog"
          }),
          b[3] || (b[3] = S("span", null, "Loading the catalog…", -1))
        ])) : Q("", !0),
        (N(!0), D(le, null, Re(l.value, (C) => (N(), D("div", {
          key: C.cat,
          class: "wf-palette-group"
        }, [
          C.cat === "Notes" ? (N(), D(le, { key: 0 }, [
            z(h(fe), {
              class: "wf-palette-cat",
              severity: "secondary",
              text: "",
              "aria-expanded": s(C.cat),
              "aria-controls": u(C.cat),
              onClick: (I) => c(C.cat)
            }, {
              default: ne(() => [
                z(h(ie), {
                  icon: s(C.cat) ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                b[4] || (b[4] = S("span", null, "Notes", -1))
              ]),
              _: 2
            }, 1032, ["aria-expanded", "aria-controls", "onClick"]),
            s(C.cat) ? (N(), D("div", {
              key: 0,
              id: u(C.cat)
            }, [
              z(h(fe), {
                class: "wf-palette-item",
                severity: "secondary",
                text: "",
                draggable: "true",
                onClick: b[1] || (b[1] = (I) => i("place-note")),
                onDragstart: _
              }, {
                default: ne(() => [
                  S("span", HT, [
                    z(h(ie), {
                      icon: "tabler:note",
                      "aria-hidden": "true"
                    })
                  ]),
                  b[5] || (b[5] = S("span", { class: "wf-palette-item-body" }, [
                    S("span", { class: "wf-palette-item-t" }, "Sticky Note"),
                    S("span", { class: "wf-palette-item-s" }, "Annotate the canvas")
                  ], -1))
                ]),
                _: 1
              }),
              s(C.cat) ? (N(), re(h(fe), {
                key: 0,
                class: "wf-palette-item",
                severity: "secondary",
                text: "",
                draggable: "true",
                onClick: b[2] || (b[2] = (I) => i("place-frame")),
                onDragstart: x
              }, {
                default: ne(() => [
                  S("span", qT, [
                    z(h(ie), {
                      icon: "tabler:box",
                      "aria-hidden": "true"
                    })
                  ]),
                  b[6] || (b[6] = S("span", { class: "wf-palette-item-body" }, [
                    S("span", { class: "wf-palette-item-t" }, "Frame"),
                    S("span", { class: "wf-palette-item-s" }, "Group nodes in a colored region")
                  ], -1))
                ]),
                _: 1
              })) : Q("", !0)
            ], 8, FT)) : Q("", !0)
          ], 64)) : (N(), D(le, { key: 1 }, [
            z(h(fe), {
              class: "wf-palette-cat",
              severity: "secondary",
              text: "",
              "aria-expanded": s(C.cat),
              "aria-controls": u(C.cat),
              onClick: (I) => c(C.cat)
            }, {
              default: ne(() => [
                z(h(ie), {
                  icon: s(C.cat) ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                S("span", null, K(C.cat), 1),
                S("span", UT, K(C.items.length), 1)
              ]),
              _: 2
            }, 1032, ["aria-expanded", "aria-controls", "onClick"]),
            s(C.cat) ? (N(), D("div", {
              key: 0,
              id: u(C.cat)
            }, [
              (N(!0), D(le, null, Re(y(C), (I) => (N(), D(le, {
                key: I.key
              }, [
                I.kind === "sub" ? (N(), re(h(fe), {
                  key: 0,
                  class: "wf-palette-subcat",
                  severity: "secondary",
                  text: "",
                  "aria-expanded": I.open,
                  onClick: (B) => v(C.cat, I.module)
                }, {
                  default: ne(() => [
                    z(h(ie), {
                      icon: I.open ? "tabler:chevron-down" : "tabler:chevron-right",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    S("span", null, K(I.module), 1),
                    S("span", YT, K(I.count), 1)
                  ]),
                  _: 2
                }, 1032, ["aria-expanded", "onClick"])) : (N(), re(h(fe), {
                  key: 1,
                  class: "wf-palette-item",
                  severity: "secondary",
                  text: "",
                  draggable: "true",
                  onClick: (B) => i("place", I.item),
                  onDragstart: (B) => m(B, I.item)
                }, {
                  default: ne(() => [
                    S("span", {
                      class: Ie(["wf-palette-ico", `wf-palette-ico--${I.item.kind}`])
                    }, [
                      z(h(ie), {
                        icon: I.item.icon,
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ], 2),
                    S("span", GT, [
                      S("span", jT, K(I.item.title), 1),
                      I.item.subtitle ? (N(), D("span", XT, K(I.item.subtitle), 1)) : Q("", !0)
                    ])
                  ]),
                  _: 2
                }, 1032, ["onClick", "onDragstart"]))
              ], 64))), 128))
            ], 8, WT)) : Q("", !0)
          ], 64))
        ]))), 128)),
        e.errors.length ? (N(), re(h(Fe), {
          key: 1,
          class: "wf-palette-errors",
          severity: "warn",
          closable: !1
        }, {
          default: ne(() => [
            ce(" Some catalogs couldn’t load. " + K(e.errors[0]), 1)
          ]),
          _: 1
        })) : Q("", !0)
      ])
    ]));
  }
});
function ZT(e) {
  return `flow-run-${(e || "run").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "run"}.redacted.json`;
}
const JT = {
  "flow.started": "Started",
  "flow.finished": "Completed",
  "flow.failed": "Failed",
  "node.created": "Ready",
  "data.dataflow.input": "Input received",
  "data.dataflow.output": "Output recorded",
  "data.node.input": "Input received",
  "data.node.result": "Output recorded",
  "data.node.error": "Failure recorded",
  "data.agent.action": "Agent activity recorded"
};
function QT(e, t = []) {
  const n = new Map(t.map((o) => [o.engine_node_id, o]));
  function i(o) {
    const r = /* @__PURE__ */ new Set();
    let a = n.get(o);
    for (; a && !r.has(a.engine_node_id); ) {
      r.add(a.engine_node_id);
      const s = a.title.trim();
      if (s && !Rh(s)) return s;
      a = n.get(a.parent_engine_node_id || "");
    }
    return "Step";
  }
  return e.map((o, r) => {
    const a = o.raw && typeof o.raw == "object" && !Array.isArray(o.raw) ? o.raw : {};
    let s = JT[o.type] || "Activity recorded";
    if (o.type === "node.updated") {
      const l = typeof a.status == "string" ? a.status : "", c = gg(l);
      s = l === "waiting" ? "Waiting" : c === "idle" ? "Updated" : c.charAt(0).toUpperCase() + c.slice(1);
    }
    if (o.type === "flow.failed") {
      const l = As({ status: "failed", error: typeof a.error == "string" ? a.error : void 0 });
      l && (s += `: ${l}`);
    }
    return {
      key: `${o.seq || r}:${o.type}:${o.engine_node_id || ""}`,
      occurredAt: o.occurred_at,
      title: o.engine_node_id ? i(o.engine_node_id) : "Workflow",
      outcome: s
    };
  });
}
const eM = {
  class: "wf-run-timeline",
  "aria-label": "Run timeline"
}, tM = { class: "wf-run-section-h" }, nM = {
  key: 0,
  class: "wf-panel-note"
}, oM = {
  key: 2,
  class: "wf-panel-hint"
}, iM = {
  key: 3,
  class: "wf-timeline-list"
}, rM = { class: "wf-timeline-head" }, aM = { class: "wf-timeline-type" }, sM = { class: "wf-timeline-when" }, lM = { class: "wf-timeline-outcome" }, uM = /* @__PURE__ */ ye({
  __name: "RunTimeline",
  props: {
    workflowId: {},
    runId: {},
    nodeHeaders: {}
  },
  setup(e) {
    const t = e, n = G(!1), i = G(!1), o = G(""), r = G(null);
    async function a(s = !0) {
      s ? (n.value = !0, o.value = "", r.value = null) : i.value = !0;
      try {
        const l = s ? 0 : r.value?.next_offset ?? 0, c = await yg(t.workflowId, t.runId, 100, l);
        !s && r.value && (c.events = [...r.value.events, ...c.events]), r.value = c;
      } catch (l) {
        o.value = qe(l, "Couldn’t load this run’s timeline. Try again.");
      } finally {
        n.value = !1, i.value = !1;
      }
    }
    return _e(() => [t.workflowId, t.runId], () => {
      a();
    }), Ue(() => {
      a();
    }), (s, l) => (N(), D("section", eM, [
      S("div", tM, [
        z(h(ie), {
          icon: "tabler:timeline-event",
          "aria-hidden": "true"
        }),
        l[2] || (l[2] = S("span", null, "Timeline", -1))
      ]),
      l[5] || (l[5] = S("p", { class: "wf-panel-hint" }, "Steps and outcomes recorded for this run.", -1)),
      n.value ? (N(), D("div", nM, [
        z(h(dt), {
          class: "wf-status-spinner",
          "stroke-width": "4",
          "aria-label": "Loading timeline"
        }),
        l[3] || (l[3] = S("span", null, "Loading timeline…", -1))
      ])) : o.value ? (N(), re(h(Fe), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          ce(K(o.value) + " ", 1),
          z(h(fe), {
            label: "Try again",
            link: "",
            size: "small",
            onClick: l[0] || (l[0] = (c) => a())
          })
        ]),
        _: 1
      })) : r.value?.events.length ? (N(), D("ol", iM, [
        (N(!0), D(le, null, Re(h(QT)(r.value.events, e.nodeHeaders), (c) => (N(), D("li", {
          key: c.key,
          class: "wf-timeline-event"
        }, [
          S("div", rM, [
            S("span", aM, K(c.title), 1)
          ]),
          S("span", sM, K(h(Qt)(c.occurredAt)), 1),
          S("p", lM, K(c.outcome), 1)
        ]))), 128))
      ])) : (N(), D("p", oM, "No activity was recorded for this run.")),
      r.value?.next_offset != null ? (N(), re(h(fe), {
        key: 4,
        severity: "secondary",
        outlined: "",
        disabled: i.value,
        loading: i.value,
        onClick: l[1] || (l[1] = (c) => a(!1))
      }, {
        default: ne(() => [
          i.value ? Q("", !0) : (N(), re(h(ie), {
            key: 0,
            icon: "tabler:plus",
            "aria-hidden": "true"
          })),
          l[4] || (l[4] = S("span", null, "Load more activity", -1))
        ]),
        _: 1
      }, 8, ["disabled", "loading"])) : Q("", !0)
    ]));
  }
}), cM = { class: "wf-panel wf-panel--run" }, dM = { class: "wf-panel-hdr wf-panel-hdr--run" }, fM = { class: "wf-panel-how" }, hM = { key: 0 }, pM = { class: "wf-run-actions" }, vM = { class: "wf-run-actions" }, mM = {
  key: 2,
  class: "wf-panel-hint wf-run-select-hint"
}, gM = { class: "wf-panel-label" }, yM = {
  key: 0,
  class: "wf-run-status"
}, wM = {
  key: 0,
  class: "wf-run-timing"
}, bM = {
  key: 1,
  class: "wf-panel-note"
}, _M = {
  key: 0,
  class: "wf-run-fail"
}, kM = { class: "wf-run-fail-h" }, EM = {
  key: 0,
  class: "wf-run-fail-code"
}, xM = {
  key: 1,
  class: "wf-run-fail-note"
}, $M = { key: 0 }, SM = {
  key: 4,
  class: "wf-run-trace"
}, CM = { class: "wf-run-section-h" }, NM = { class: "wf-panel-hint" }, IM = {
  class: "wf-run-tool-list",
  "aria-label": "Tools called"
}, AM = { key: 0 }, TM = {
  key: 1,
  class: "wf-run-tool-id"
}, MM = {
  key: 5,
  class: "wf-panel-hint"
}, nd = /* @__PURE__ */ ye({
  __name: "RunNodeOutput",
  props: {
    workflowId: {},
    run: {},
    node: {},
    nodeStatus: {},
    nodeHeaders: {}
  },
  emits: ["close", "exit-run", "rerun"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = G(!1), r = G(null), a = G(""), s = G({});
    let l = 0;
    function c(O) {
      return O && typeof O == "object" && !Array.isArray(O) ? O : {};
    }
    function u(O) {
      return typeof O == "string" ? O.trim() : "";
    }
    function d(O) {
      return u(c(O).registry_id);
    }
    function f(O) {
      const E = c(O);
      return s.value[d(O)] || u(E.title) || u(E.name) || "Tool";
    }
    function p(O) {
      return u(c(O).name);
    }
    async function v(O, E) {
      const F = [...new Set(O.flatMap((g) => g.toolCalls.map(d).filter(Boolean)))];
      if (F.length)
        try {
          const { data: g } = await Vn.get(`/api/v1/agents/tools?ids=${encodeURIComponent(F.join(","))}`);
          if (E !== l) return;
          const $ = {}, k = Array.isArray(g?.tools) ? g.tools : [];
          for (const H of k) {
            const q = u(H?.id), ee = u(H?.title);
            q && ee && ($[q] = ee);
          }
          s.value = $;
        } catch {
        }
    }
    async function y() {
      const O = ++l;
      r.value = null, s.value = {}, a.value = "";
      const E = n.node;
      if (E) {
        o.value = !0;
        try {
          const F = await Ad(n.workflowId, n.run.run_id, E.id), g = wg(F, {
            failed: n.nodeStatus === "failed",
            runError: n.run.error
          });
          if (O !== l) return;
          r.value = g, v(g.agentActions, O);
        } catch {
          a.value = "Couldn’t load this step’s data.";
        } finally {
          o.value = !1;
        }
      }
    }
    _e(() => [n.run.run_id, n.node?.id, n.nodeStatus], y, { immediate: !0 }), Ue(() => {
      Ki("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    const m = U(() => Je(n.node?.title, n.node?.ref) || "Step"), _ = U(() => {
      const O = r.value?.timing.durationMs;
      return O != null ? Id(O) : "";
    }), x = U(() => {
      const O = r.value;
      return !!O && (O.input != null || O.output != null || O.error != null || O.agentActions.length > 0);
    }), w = U(() => r.value?.dataUnavailable || n.run.step_data_retention_days != null && ["completed", "failed", "cancelled", "terminated"].includes(n.run.status) && r.value?.input == null && r.value?.output == null), b = U(() => r.value?.output != null), C = U(() => Qn(n.run.flow_ref?.version ?? 0)), I = G("overview"), B = G(!1), T = G("");
    function M(O) {
      const E = Is(O);
      return E === "ok" ? "success" : E === "error" ? "danger" : "info";
    }
    async function V() {
      if (!B.value) {
        B.value = !0, T.value = "";
        try {
          Ps(ZT(n.run.run_id), await bg(n.workflowId, n.run.run_id));
        } catch {
          T.value = "Couldn’t download the run details. Try again.";
        } finally {
          B.value = !1;
        }
      }
    }
    return (O, E) => (N(), D("aside", cM, [
      z(h(fe), {
        class: "wf-panel-close",
        text: "",
        rounded: "",
        severity: "secondary",
        title: "Close inspector",
        "aria-label": "Close inspector",
        onClick: E[0] || (E[0] = (F) => i("close"))
      }, {
        default: ne(() => [
          z(h(ie), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }),
      S("div", dM, [
        z(h(ie), {
          icon: "tabler:history",
          "aria-hidden": "true"
        }),
        E[4] || (E[4] = S("span", { class: "wf-panel-hdr-kind" }, "Viewing run", -1))
      ]),
      S("p", fM, [
        z(h(yt), {
          class: "wf-run-status-tag",
          severity: M(h(ao)(e.run)),
          value: h(ro)(h(ao)(e.run))
        }, null, 8, ["severity", "value"]),
        z(h(yt), {
          class: "wf-run-version-tag",
          severity: C.value.kind === "published" ? "secondary" : "warn",
          value: C.value.label,
          title: C.value.title
        }, null, 8, ["severity", "value", "title"]),
        S("span", null, [
          ce(" Run " + K(h(Ts)(e.run.run_id)) + " · started " + K(h(Qt)(e.run.started_at)), 1),
          e.run.finished_at ? (N(), D("span", hM, " · finished " + K(h(Qt)(e.run.finished_at)), 1)) : Q("", !0),
          E[5] || (E[5] = ce(". Read-only — nothing here can be edited.", -1))
        ])
      ]),
      S("div", pM, [
        z(h(fe), {
          severity: "secondary",
          outlined: "",
          onClick: E[1] || (E[1] = (F) => i("rerun"))
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            E[6] || (E[6] = S("span", null, "Re-run with same input", -1))
          ]),
          _: 1
        }),
        z(h(fe), {
          severity: "secondary",
          outlined: "",
          onClick: E[2] || (E[2] = (F) => i("exit-run"))
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:pencil",
              "aria-hidden": "true"
            }),
            E[7] || (E[7] = S("span", null, "Back to editing", -1))
          ]),
          _: 1
        })
      ]),
      S("div", vM, [
        z(h(fe), {
          severity: "secondary",
          outlined: "",
          disabled: B.value,
          loading: B.value,
          onClick: V
        }, {
          default: ne(() => [
            B.value ? Q("", !0) : (N(), re(h(ie), {
              key: 0,
              icon: "tabler:download",
              "aria-hidden": "true"
            })),
            E[8] || (E[8] = S("span", null, "Download run details", -1))
          ]),
          _: 1
        }, 8, ["disabled", "loading"])
      ]),
      T.value ? (N(), re(h(Fe), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          ce(K(T.value), 1)
        ]),
        _: 1
      })) : Q("", !0),
      z(h(Mg), {
        value: I.value,
        "onUpdate:value": E[3] || (E[3] = (F) => I.value = F),
        class: "wf-run-tabs"
      }, {
        default: ne(() => [
          z(h(Tg), { "aria-label": "Run inspector sections" }, {
            default: ne(() => [
              z(h(Pl), { value: "overview" }, {
                default: ne(() => [...E[9] || (E[9] = [
                  ce("Overview", -1)
                ])]),
                _: 1
              }),
              z(h(Pl), { value: "timeline" }, {
                default: ne(() => [...E[10] || (E[10] = [
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
      I.value === "timeline" ? (N(), re(uM, {
        key: 1,
        "workflow-id": e.workflowId,
        "run-id": e.run.run_id,
        "node-headers": e.nodeHeaders
      }, null, 8, ["workflow-id", "run-id", "node-headers"])) : e.node ? (N(), D(le, { key: 3 }, [
        S("div", gM, K(m.value), 1),
        e.nodeStatus ? (N(), D("p", yM, [
          z(h(yt), {
            class: "wf-run-status-tag",
            severity: M(e.nodeStatus),
            value: h(ro)(e.nodeStatus)
          }, null, 8, ["severity", "value"]),
          _.value ? (N(), D("span", wM, [
            z(h(ie), {
              icon: "tabler:clock",
              "aria-hidden": "true"
            }),
            ce(K(_.value), 1)
          ])) : Q("", !0)
        ])) : Q("", !0),
        o.value ? (N(), D("div", bM, [
          z(h(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading step data"
          }),
          E[11] || (E[11] = S("span", null, "Loading this step’s data…", -1))
        ])) : a.value ? (N(), re(h(Fe), {
          key: 2,
          severity: "error",
          closable: !1
        }, {
          default: ne(() => [
            ce(K(a.value), 1)
          ]),
          _: 1
        })) : r.value ? (N(), D(le, { key: 3 }, [
          r.value.error ? (N(), D("div", _M, [
            S("div", kM, [
              z(h(ie), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              S("span", null, K(r.value.error.message), 1)
            ]),
            r.value.error.code ? (N(), D("span", EM, K(r.value.error.code), 1)) : Q("", !0),
            r.value.error.hasDetail ? r.value.error.detail != null ? (N(), re(Fn, {
              key: 2,
              value: r.value.error.detail,
              label: "Error detail",
              icon: "tabler:alert-triangle",
              open: !1
            }, null, 8, ["value"])) : Q("", !0) : (N(), D("p", xM, "No further detail was recorded for this failure. Re-run with the same input to try again, or open the step to adjust it."))
          ])) : Q("", !0),
          w.value ? (N(), re(h(Fe), {
            key: 1,
            severity: "info",
            closable: !1
          }, {
            default: ne(() => [
              E[12] || (E[12] = ce("Step data is no longer available", -1)),
              e.run.step_data_retention_days != null ? (N(), D("span", $M, ". Step data is kept for " + K(e.run.step_data_retention_days) + " days.", 1)) : Q("", !0)
            ]),
            _: 1
          })) : Q("", !0),
          r.value.input != null ? (N(), re(Fn, {
            key: 2,
            value: r.value.input,
            label: "Input",
            icon: "tabler:login-2"
          }, null, 8, ["value"])) : Q("", !0),
          b.value ? (N(), re(Fn, {
            key: 3,
            value: r.value.output,
            label: "Output",
            icon: "tabler:logout-2"
          }, null, 8, ["value"])) : Q("", !0),
          r.value.agentActions.length ? (N(), D("section", SM, [
            S("div", CM, [
              z(h(ie), {
                icon: "tabler:robot",
                "aria-hidden": "true"
              }),
              E[13] || (E[13] = S("span", null, "Agent trace", -1))
            ]),
            (N(!0), D(le, null, Re(r.value.agentActions, (F, g) => (N(), D("div", {
              key: g,
              class: "wf-run-trace-item"
            }, [
              S("p", NM, K(F.toolCalls.length ? `Called ${F.toolCalls.length} tool${F.toolCalls.length === 1 ? "" : "s"}` : "No tools were called — the model answered directly."), 1),
              F.toolCalls.length ? (N(), D(le, { key: 0 }, [
                S("ul", IM, [
                  (N(!0), D(le, null, Re(F.toolCalls, ($, k) => (N(), D("li", { key: k }, [
                    S("strong", null, K(f($)), 1),
                    p($) && p($) !== f($) ? (N(), D("span", AM, " · " + K(p($)), 1)) : Q("", !0),
                    d($) ? (N(), D("code", TM, K(d($)), 1)) : Q("", !0)
                  ]))), 128))
                ]),
                z(Fn, {
                  value: F.toolCalls,
                  label: "Tool call details",
                  icon: "tabler:tool",
                  open: !1
                }, null, 8, ["value"])
              ], 64)) : Q("", !0),
              z(Fn, {
                value: F.raw,
                label: "Generation",
                icon: "tabler:sparkles",
                open: !1
              }, null, 8, ["value"])
            ]))), 128))
          ])) : Q("", !0),
          !x.value && !w.value ? (N(), D("p", MM, "This step recorded no input or output in this run.")) : Q("", !0)
        ], 64)) : Q("", !0)
      ], 64)) : (N(), D("p", mM, "Click a step on the canvas to see what it received and produced in this run."))
    ]));
  }
}), OM = {
  key: 0,
  class: "wf-runs-loading"
}, RM = {
  key: 2,
  class: "wf-sim-note"
}, DM = {
  key: 3,
  class: "wf-runs-list"
}, PM = { class: "wf-runs-meta" }, LM = { class: "wf-runs-time" }, VM = { class: "wf-runs-id" }, zM = ["title"], BM = {
  class: "wf-runs-duration",
  title: "Duration"
}, FM = /* @__PURE__ */ ye({
  __name: "RunsPanel",
  props: {
    rows: {},
    loading: { type: Boolean },
    error: {}
  },
  emits: ["select", "close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => _g(n.rows).map((s) => ({
      row: s,
      ver: Qn(s.flow_ref?.version ?? 0),
      cause: As(s),
      duration: s.started_at && s.finished_at ? Id(Date.parse(s.finished_at) - Date.parse(s.started_at)) : "—"
    })));
    function r(s) {
      const l = Is(s);
      return l === "ok" ? "success" : l === "error" ? "danger" : "info";
    }
    function a(s) {
      s || i("close");
    }
    return (s, l) => (N(), re(h(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      header: "Runs",
      class: "wf-sim-pop wf-runs-pop",
      "onUpdate:visible": a
    }, {
      default: ne(() => [
        e.loading ? (N(), D("div", OM, [
          z(h(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading runs"
          }),
          l[0] || (l[0] = S("span", null, "Loading runs…", -1))
        ])) : e.error ? (N(), re(h(Fe), {
          key: 1,
          severity: "error",
          closable: !1
        }, {
          default: ne(() => [
            ce(K(e.error), 1)
          ]),
          _: 1
        })) : o.value.length ? (N(), D("div", DM, [
          (N(!0), D(le, null, Re(o.value, ({ row: c, ver: u, cause: d, duration: f }) => (N(), re(h(fe), {
            key: c.run_id,
            class: "wf-runs-row",
            text: "",
            severity: "secondary",
            onClick: (p) => i("select", c)
          }, {
            default: ne(() => [
              z(h(yt), {
                class: "wf-run-status-tag",
                severity: r(h(ao)(c)),
                value: h(ro)(h(ao)(c))
              }, null, 8, ["severity", "value"]),
              S("span", PM, [
                S("span", LM, "Started " + K(h(Qt)(c.started_at || c.finished_at)), 1),
                S("span", VM, K(h(Ts)(c.run_id)), 1),
                d ? (N(), D("span", {
                  key: 0,
                  class: "wf-runs-cause",
                  title: d
                }, K(d), 9, zM)) : Q("", !0)
              ]),
              S("span", BM, K(f), 1),
              z(h(yt), {
                class: "wf-run-version-tag",
                severity: u.kind === "published" ? "secondary" : "warn",
                value: u.label,
                title: u.title
              }, null, 8, ["severity", "value", "title"]),
              z(h(ie), {
                icon: "tabler:chevron-right",
                class: "wf-runs-go",
                "aria-hidden": "true"
              })
            ]),
            _: 2
          }, 1032, ["onClick"]))), 128))
        ])) : (N(), D("p", RM, "No runs yet. Choose “Run with an input”, or publish and trigger this Workflow, to see runs here."))
      ]),
      _: 1
    }));
  }
});
function HM(e, t) {
  return t == null ? !1 : e > t;
}
function La(e, t) {
  return t ?? e.length;
}
function qM(e) {
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
function UM(e) {
  return `Restore v${e} as a new unpublished draft. This never changes version history.`;
}
function WM(e, t) {
  if (!e) return t;
  for (const o of ["title", "name", "label"])
    if (typeof e[o] == "string" && e[o]) return e[o];
  const n = typeof e.source_id == "string" ? e.source_id : "", i = typeof e.target_id == "string" ? e.target_id : "";
  return n && i ? `${n} → ${i}` : t;
}
function YM(e) {
  return e.map((t) => ({ id: t.id, name: WM(t.after || t.before, t.id) }));
}
function GM(e) {
  if (typeof e == "string" && e) return e;
  if (!e || typeof e != "object" || Array.isArray(e)) return "Input or result changed.";
  const t = e, n = typeof t.field == "string" ? t.field : typeof t.key == "string" ? t.key : "Input or result", i = typeof t.type == "string" ? t.type : typeof t.kind == "string" ? t.kind : "changed";
  return `${n}: ${i}`;
}
function jM(e) {
  const t = e.graph;
  return e.interface.changes.length > 0 || Object.values(t.nodes).some((n) => n.length > 0) || Object.values(t.edges).some((n) => n.length > 0);
}
const XM = {
  key: 0,
  class: "wf-runs-loading"
}, KM = {
  key: 0,
  class: "wf-sim-note"
}, ZM = { key: 0 }, JM = { key: 1 }, QM = { class: "wf-vers-list" }, eO = { class: "wf-vers-meta" }, tO = { class: "wf-vers-when" }, nO = {
  key: 0,
  class: "wf-vers-current"
}, oO = { class: "wf-vers-who" }, iO = {
  key: 0,
  class: "wf-vers-detail"
}, rO = {
  key: 0,
  class: "wf-runs-loading"
}, aO = { class: "wf-vers-detail-h" }, sO = { class: "wf-vers-detail-title" }, lO = {
  key: 0,
  class: "wf-sim-note"
}, uO = {
  key: 1,
  class: "wf-vers-io"
}, cO = { class: "wf-vers-io-row" }, dO = { class: "wf-vers-io-row" }, fO = { class: "wf-vers-io-row" }, hO = { class: "wf-vers-actions" }, pO = {
  key: 0,
  class: "wf-vers-compare"
}, vO = {
  key: 3,
  class: "wf-vers-diff",
  "aria-label": "Changes between versions"
}, mO = { class: "wf-vers-detail-h" }, gO = { class: "wf-vers-detail-title" }, yO = {
  key: 0,
  class: "wf-panel-hint"
}, wO = /* @__PURE__ */ ye({
  __name: "VersionHistoryPanel",
  props: {
    workflowId: {},
    definitionEditSeq: {}
  },
  emits: ["close", "restore"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = G(!1), r = G(""), a = G([]), s = G(null), l = G(null), c = G(!1), u = G(""), d = G(null), f = G(null), p = G(!1), v = G(""), y = G(!1), m = G(""), _ = Rd();
    async function x() {
      o.value = !0, r.value = "";
      try {
        a.value = await Dd(n.workflowId), a.value.length && w(a.value[0].version);
      } catch ($) {
        r.value = qe($, "Couldn’t load version history.");
      } finally {
        o.value = !1;
      }
    }
    async function w($) {
      s.value = $, l.value = null, u.value = "", f.value = null, v.value = "", c.value = !0;
      try {
        const k = await Pd(n.workflowId, $);
        if (s.value !== $) return;
        l.value = k;
      } catch (k) {
        u.value = qe(k, "Couldn’t load this version.");
      } finally {
        s.value === $ && (c.value = !1);
      }
    }
    Ue(x), _e(() => n.workflowId, () => {
      s.value = null, l.value = null, x();
    });
    const b = U(() => a.value[0] ?? null), C = U(() => HM(n.definitionEditSeq, b.value?.def_seq)), I = U(() => l.value ? qM(l.value.interface) : null), B = U(() => {
      const $ = a.value.findIndex((k) => k.version === s.value);
      return $ >= 0 ? a.value[$ + 1]?.version ?? null : null;
    }), T = U(() => d.value || B.value), M = U(() => a.value.filter(($) => $.version !== s.value)), V = U(() => [
      { label: "previous version", value: null },
      ...M.value.map(($) => ({ label: `v${$.version}`, value: $.version }))
    ]);
    async function O() {
      if (!(s.value == null || T.value == null || p.value)) {
        p.value = !0, v.value = "", f.value = null;
        try {
          const $ = Math.min(s.value, T.value), k = Math.max(s.value, T.value);
          f.value = await Cg(n.workflowId, $, k);
        } catch ($) {
          v.value = qe($, "Couldn’t load this version diff.");
        } finally {
          p.value = !1;
        }
      }
    }
    async function E() {
      if (!(s.value == null || y.value)) {
        y.value = !0, m.value = "";
        try {
          i("restore", await Ng(n.workflowId, s.value));
        } catch ($) {
          m.value = qe($, "Couldn’t restore this version as a new draft.");
        } finally {
          y.value = !1;
        }
      }
    }
    function F() {
      if (s.value == null || y.value) return;
      const $ = {
        group: "version-restore",
        header: "Restore as new draft",
        message: UM(s.value),
        rejectLabel: "Cancel",
        acceptLabel: "Create new draft",
        accept: () => {
          E();
        }
      };
      _.require($);
    }
    function g($) {
      $ || i("close");
    }
    return ($, k) => (N(), D(le, null, [
      z(h(Ld), { group: "version-restore" }),
      z(h(Jt), {
        visible: !0,
        modal: "",
        "dismissable-mask": "",
        header: "Version history",
        class: "wf-sim-pop wf-vers-pop",
        "onUpdate:visible": g
      }, {
        default: ne(() => [
          o.value ? (N(), D("div", XM, [
            z(h(dt), {
              class: "wf-status-spinner",
              "stroke-width": "4",
              "aria-label": "Loading versions"
            }),
            k[1] || (k[1] = S("span", null, "Loading versions…", -1))
          ])) : r.value ? (N(), re(h(Fe), {
            key: 1,
            severity: "error",
            closable: !1
          }, {
            default: ne(() => [
              ce(K(r.value), 1)
            ]),
            _: 1
          })) : (N(), D(le, { key: 2 }, [
            a.value.length ? (N(), D(le, { key: 1 }, [
              S("p", {
                class: Ie(["wf-vers-draft", C.value ? "is-pending" : "is-clean"]),
                role: "status"
              }, [
                z(h(ie), {
                  icon: C.value ? "tabler:pencil" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                C.value ? (N(), D("span", ZM, "Draft has unpublished edits since v" + K(b.value?.version) + ".", 1)) : (N(), D("span", JM, "Draft matches v" + K(b.value?.version) + " — nothing to publish.", 1))
              ], 2),
              S("div", QM, [
                (N(!0), D(le, null, Re(a.value, (H, q) => (N(), re(h(fe), {
                  key: H.version,
                  class: Ie(["wf-vers-row", H.version === s.value && "is-selected"]),
                  text: "",
                  severity: "secondary",
                  onClick: (ee) => w(H.version)
                }, {
                  default: ne(() => [
                    z(h(yt), {
                      class: "wf-version-tag",
                      severity: "secondary",
                      value: `v${H.version}`
                    }, null, 8, ["value"]),
                    S("span", eO, [
                      S("span", tO, [
                        ce(K(h(Qt)(H.created_at)), 1),
                        q === 0 ? (N(), D("span", nO, "Current")) : Q("", !0)
                      ]),
                      S("span", oO, K(H.created_by || "Unknown"), 1)
                    ]),
                    z(h(ie), {
                      icon: "tabler:chevron-right",
                      class: "wf-runs-go",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 2
                }, 1032, ["class", "onClick"]))), 128))
              ]),
              s.value != null ? (N(), D("section", iO, [
                c.value ? (N(), D("div", rO, [
                  z(h(dt), {
                    class: "wf-status-spinner",
                    "stroke-width": "4",
                    "aria-label": `Loading version ${s.value}`
                  }, null, 8, ["aria-label"]),
                  S("span", null, "Loading v" + K(s.value) + "…", 1)
                ])) : u.value ? (N(), re(h(Fe), {
                  key: 1,
                  severity: "error",
                  closable: !1
                }, {
                  default: ne(() => [
                    ce(K(u.value), 1)
                  ]),
                  _: 1
                })) : l.value && I.value ? (N(), D(le, { key: 2 }, [
                  S("div", aO, [
                    S("span", sO, "v" + K(l.value.version) + " inputs and results", 1),
                    k[2] || (k[2] = S("span", { class: "wf-vers-detail-note" }, "Read-only", -1))
                  ]),
                  I.value.empty ? (N(), D("p", lO, "This version does not define expected input, a result, or error details.")) : (N(), D("dl", uO, [
                    S("div", cO, [
                      k[3] || (k[3] = S("dt", null, "In", -1)),
                      S("dd", null, K(h(Va)(I.value.input, I.value.inputCount)), 1)
                    ]),
                    S("div", dO, [
                      k[4] || (k[4] = S("dt", null, "Out", -1)),
                      S("dd", null, K(h(Va)(I.value.output, I.value.outputCount)), 1)
                    ]),
                    S("div", fO, [
                      k[5] || (k[5] = S("dt", null, "Error", -1)),
                      S("dd", null, K(h(Va)(I.value.error, I.value.errorCount)), 1)
                    ])
                  ])),
                  S("div", hO, [
                    M.value.length ? (N(), D("label", pO, [
                      k[6] || (k[6] = ce("Compare with ", -1)),
                      z(h(St), {
                        modelValue: d.value,
                        "onUpdate:modelValue": k[0] || (k[0] = (H) => d.value = H),
                        options: V.value,
                        "option-label": "label",
                        "option-value": "value",
                        "aria-label": "Compare with version"
                      }, null, 8, ["modelValue", "options"])
                    ])) : Q("", !0),
                    z(h(fe), {
                      severity: "secondary",
                      outlined: "",
                      disabled: !T.value || p.value,
                      loading: p.value,
                      onClick: O
                    }, {
                      default: ne(() => [
                        p.value ? Q("", !0) : (N(), re(h(ie), {
                          key: 0,
                          icon: "tabler:git-compare",
                          "aria-hidden": "true"
                        })),
                        k[7] || (k[7] = S("span", null, "Compare", -1))
                      ]),
                      _: 1
                    }, 8, ["disabled", "loading"]),
                    z(h(fe), {
                      disabled: y.value,
                      loading: y.value,
                      onClick: F
                    }, {
                      default: ne(() => [
                        y.value ? Q("", !0) : (N(), re(h(ie), {
                          key: 0,
                          icon: "tabler:history-up",
                          "aria-hidden": "true"
                        })),
                        k[8] || (k[8] = S("span", null, "Restore as new draft", -1))
                      ]),
                      _: 1
                    }, 8, ["disabled", "loading"])
                  ]),
                  m.value ? (N(), re(h(Fe), {
                    key: 2,
                    severity: "error",
                    closable: !1
                  }, {
                    default: ne(() => [
                      ce(K(m.value), 1)
                    ]),
                    _: 1
                  })) : Q("", !0),
                  f.value ? (N(), D("section", vO, [
                    S("div", mO, [
                      S("span", gO, "Changes from v" + K(f.value.from_version) + " to v" + K(f.value.to_version), 1),
                      k[9] || (k[9] = S("span", { class: "wf-vers-detail-note" }, "Read-only", -1))
                    ]),
                    h(jM)(f.value) ? (N(), D(le, { key: 1 }, [
                      f.value.interface.changes.length ? (N(), re(h(Fe), {
                        key: 0,
                        class: "wf-vers-compat",
                        severity: "warn",
                        closable: !1
                      }, {
                        default: ne(() => [
                          z(h(ie), {
                            icon: "tabler:alert-triangle",
                            "aria-hidden": "true"
                          }),
                          S("div", null, [
                            k[10] || (k[10] = S("strong", null, "Expected input or result changed", -1)),
                            (N(!0), D(le, null, Re(f.value.interface.changes, (H, q) => (N(), D("span", { key: q }, K(h(GM)(H)), 1))), 128))
                          ])
                        ]),
                        _: 1
                      })) : Q("", !0),
                      (N(!0), D(le, null, Re([{ label: "Steps added", rows: f.value.graph.nodes.added }, { label: "Steps removed", rows: f.value.graph.nodes.removed }, { label: "Steps changed", rows: f.value.graph.nodes.changed }, { label: "Connections added", rows: f.value.graph.edges.added }, { label: "Connections removed", rows: f.value.graph.edges.removed }, { label: "Connections changed", rows: f.value.graph.edges.changed }], (H) => gd((N(), D("div", {
                        key: H.label,
                        class: "wf-vers-diff-group"
                      }, [
                        S("strong", null, K(H.label), 1),
                        (N(!0), D(le, null, Re(h(YM)(H.rows), (q) => (N(), D("span", {
                          key: q.id
                        }, K(q.name), 1))), 128))
                      ])), [
                        [qm, H.rows.length]
                      ])), 128))
                    ], 64)) : (N(), D("p", yO, "No input, result, step, or connection changes were recorded."))
                  ])) : Q("", !0)
                ], 64)) : Q("", !0)
              ])) : Q("", !0)
            ], 64)) : (N(), D("p", KM, " No versions published yet. Publish to save the current Workflow as v1; you can keep editing it as a draft. "))
          ], 64))
        ]),
        _: 1
      })
    ], 64));
  }
}), bO = {
  "aria-label": "Run published Workflow",
  class: "wf-published-run"
}, _O = {
  key: 0,
  role: "alert"
}, kO = {
  key: 1,
  role: "status"
}, EO = {
  key: 0,
  role: "alert"
}, xO = /* @__PURE__ */ ye({
  __name: "PublishedRunPanel",
  props: {
    workflowId: {},
    publishedVersion: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = G(null), r = G({}), a = G(!0), s = G(!1), l = G("");
    let c = 0;
    const u = U(() => JSON.stringify({ kind: "workflow", flow_ref: { kind: "flow", id: n.workflowId, version: n.publishedVersion }, input: r.value }));
    async function d() {
      const f = ++c;
      s.value = !1, l.value = "", r.value = {}, a.value = !0;
      try {
        if (!n.workflowId || !Number.isInteger(n.publishedVersion) || n.publishedVersion < 1) throw new Error("Publish this Workflow before running a published version");
        const p = await Pd(n.workflowId, n.publishedVersion);
        if (f !== c) return;
        if (p.version !== n.publishedVersion) throw new Error("Published version does not match the request");
        o.value = p.input_schema, s.value = !0;
      } catch (p) {
        f === c && (l.value = Og(p, "Could not read the published Workflow"));
      }
    }
    return _e(() => [n.workflowId, n.publishedVersion], () => {
      d();
    }, { immediate: !0 }), Qe(() => {
      c += 1;
    }), (f, p) => (N(), D("section", bO, [
      S("header", null, [
        p[3] || (p[3] = S("h2", null, "Run published Workflow", -1)),
        S("button", {
          type: "button",
          class: "p-button p-button-secondary",
          onClick: p[0] || (p[0] = (v) => i("close"))
        }, "Close published run")
      ]),
      S("p", null, "Run published version " + K(e.publishedVersion) + " with the selected account. Follow its progress in Past runs.", 1),
      l.value ? (N(), D("p", _O, K(l.value), 1)) : s.value ? (N(), D(le, { key: 2 }, [
        z(Rs, {
          mode: "value",
          schema: o.value,
          "model-value": r.value,
          "reset-key": h(c),
          rows: 5,
          "onUpdate:modelValue": p[1] || (p[1] = (v) => r.value = v),
          onValid: p[2] || (p[2] = (v) => a.value = v)
        }, null, 8, ["schema", "model-value", "reset-key"]),
        a.value ? Q("", !0) : (N(), D("p", EO, "Fix the input before queuing a run.")),
        a.value ? (N(), re(ai, {
          key: 1,
          tag: "wc-manual-task-launcher",
          attrs: { target: u.value, parent: e.workflowId, title: "Published Workflow run" }
        }, null, 8, ["attrs"])) : Q("", !0)
      ], 64)) : (N(), D("p", kO, "Loading published input…"))
    ]));
  }
}), $O = { class: "wf-trigger-description" }, SO = { class: "wf-trigger-body" }, CO = {
  key: 2,
  class: "wf-trigger-loading"
}, NO = /* @__PURE__ */ ye({
  __name: "AddTriggerPanel",
  props: {
    workflowId: {},
    publishedVersion: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => XC(n.workflowId, n.publishedVersion)), r = G(!1), a = G("");
    Ue(async () => {
      try {
        await Ki(o.value.tag, { timeoutMs: 8e3 }), r.value = !0;
      } catch {
        a.value = "Couldn’t load the triggers. Try again from Automations.";
      }
    });
    function s(l) {
      l || i("close");
    }
    return (l, c) => (N(), re(h(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      header: h(GC),
      class: "wf-trigger-modal",
      "onUpdate:visible": s
    }, {
      default: ne(() => [
        S("p", $O, K(h(jC)), 1),
        S("div", SO, [
          r.value ? (N(), re(Xt(o.value.tag), oo({ key: 0 }, o.value.attrs, {
            onClose: c[0] || (c[0] = (u) => i("close"))
          }), null, 16)) : a.value ? (N(), re(h(Fe), {
            key: 1,
            class: "wf-setup-error",
            severity: "error",
            closable: !1
          }, {
            default: ne(() => [
              ce(K(a.value), 1)
            ]),
            _: 1
          })) : (N(), D("div", CO, [
            z(h(dt), {
              class: "wf-status-spinner",
              "stroke-width": "4",
              "aria-label": "Loading triggers"
            }),
            c[1] || (c[1] = S("span", null, "Loading triggers…", -1))
          ]))
        ])
      ]),
      _: 1
    }, 8, ["header"]));
  }
}), IO = {
  key: 0,
  class: "wf-callpick-selected"
}, AO = { class: "wf-callpick-selected-top" }, TO = { class: "wf-callpick-badges" }, MO = { class: "wf-callpick-io" }, OO = { class: "wf-callpick-ico" }, RO = { class: "wf-callpick-main" }, DO = { class: "wf-callpick-title" }, PO = { class: "wf-callpick-meta" }, LO = { key: 0 }, VO = { key: 1 }, zO = { class: "wf-callpick-schema" }, BO = ["title"], FO = /* @__PURE__ */ ye({
  __name: "FlowPicker",
  props: {
    workflowId: {},
    selectedId: {},
    upstreamSchema: {}
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = G(!1), r = G(""), a = G([]);
    async function s() {
      o.value = !0, r.value = "";
      try {
        const m = await Ed({ filter: "published" });
        a.value = m.map((_) => ng(_, {}, [], n.workflowId)).filter((_) => _.callable && !!_.published_version);
      } catch (m) {
        r.value = m instanceof Error ? m.message : "Could not load Workflows.";
      } finally {
        o.value = !1;
      }
    }
    Ue(s), _e(() => n.workflowId, s);
    function l(m, _) {
      return m.title.toLowerCase().includes(_) || m.trigger_label.toLowerCase().includes(_) || m.id.toLowerCase().includes(_);
    }
    const c = U(() => a.value.find((m) => m.id === n.selectedId) || null);
    function u(m) {
      return rl(n.upstreamSchema, m.input_schema);
    }
    function d(m) {
      const _ = u(m).status;
      return _ === "error" ? "tabler:alert-triangle" : _ === "ok" ? "tabler:circle-check" : "tabler:circle-dashed";
    }
    function f(m) {
      const _ = u(m);
      return _.status === "error" ? _.message || "Needs mapping" : _.status === "ok" ? "Input matches" : "Input unknown";
    }
    function p(m) {
      return [m.id === n.selectedId && "is-selected", m.is_current && "is-current"];
    }
    function v(m) {
      return m.is_current;
    }
    function y(m) {
      return m.id === n.selectedId;
    }
    return (m, _) => (N(), re(tg, {
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
      "is-emphasized": y,
      "empty-class": "wf-palette-empty",
      onSelect: _[0] || (_[0] = (x) => i("select", x))
    }, {
      "before-list": ne(() => [
        c.value ? (N(), D("div", IO, [
          S("div", AO, [
            z(h(ie), {
              icon: "tabler:route",
              "aria-hidden": "true"
            }),
            S("span", null, K(c.value.title), 1)
          ]),
          S("div", TO, [
            z(h(yt), {
              class: "wf-callpick-badge",
              severity: "success",
              value: `Published v${c.value.published_version}`
            }, null, 8, ["value"]),
            c.value.has_draft_changes ? (N(), re(h(yt), {
              key: 0,
              class: "wf-callpick-badge",
              severity: "warn",
              value: "Draft changes"
            })) : Q("", !0)
          ]),
          S("div", MO, [
            S("span", null, [
              _[1] || (_[1] = S("strong", null, "In", -1)),
              ce(K(c.value.input_summary), 1)
            ]),
            S("span", null, [
              _[2] || (_[2] = S("strong", null, "Child out", -1)),
              ce(K(c.value.output_summary), 1)
            ]),
            _[3] || (_[3] = S("span", null, [
              S("strong", null, "Step out"),
              ce("Run details")
            ], -1))
          ])
        ])) : Q("", !0)
      ]),
      row: ne(({ item: x }) => [
        S("span", OO, [
          z(h(ie), {
            icon: "tabler:route",
            "aria-hidden": "true"
          })
        ]),
        S("span", RO, [
          S("span", DO, K(x.title), 1),
          S("span", PO, [
            x.is_current ? (N(), D("span", LO, "Current")) : Q("", !0),
            S("span", null, "v" + K(x.published_version), 1),
            x.has_draft_changes ? (N(), D("span", VO, "Draft")) : Q("", !0)
          ]),
          S("span", zO, [
            S("span", null, [
              _[4] || (_[4] = S("strong", null, "In", -1)),
              ce(K(x.input_summary), 1)
            ]),
            S("span", null, [
              _[5] || (_[5] = S("strong", null, "Out", -1)),
              ce(K(x.output_summary), 1)
            ])
          ])
        ]),
        S("span", {
          class: Ie(["wf-callpick-compat", `is-${u(x).status}`]),
          title: f(x)
        }, [
          z(h(ie), {
            icon: d(x),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ], 10, BO)
      ]),
      _: 1
    }, 8, ["rows", "loading", "error"]));
  }
}), HO = {
  class: "wf-retries",
  "aria-label": "Retries"
}, qO = { class: "wf-retry-heading" }, UO = { class: "wf-panel-hint" }, WO = { class: "wf-retry-field" }, YO = { class: "wf-panel-hint" }, GO = ["for"], jO = { class: "wf-panel-hint" }, XO = { class: "wf-retry-field" }, KO = { class: "wf-panel-hint" }, ZO = { class: "wf-retry-field" }, JO = { class: "wf-panel-hint" }, QO = { class: "wf-retry-heading" }, eR = ["for"], tR = {
  key: 0,
  class: "wf-panel-hint",
  role: "alert"
}, nR = { class: "wf-panel-hint" }, oR = /* @__PURE__ */ ye({
  __name: "RetryPolicyPanel",
  props: {
    node: {},
    execution: {}
  },
  emits: ["update-node"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => n.node.retry_policy || n.execution.retry_policy || void 0), r = U(() => n.execution.retry_policy || void 0), a = U(() => o.value?.maximum_attempts === 0), s = U(() => a.value && !f(n.node.schedule_to_close_timeout || n.execution.schedule_to_close_timeout).trim()), l = ["NotFound", "AlreadyExists", "Invalid", "PermissionDenied", "Unavailable", "Internal", "Canceled", "Conflict", "Timeout", "RateLimited"], c = [
      { field: "initial_interval", label: "Initial interval", default: "1s" },
      { field: "maximum_interval", label: "Maximum interval", default: "100 × initial interval" }
    ], u = [
      { field: "start_to_close_timeout", label: "Per-attempt timeout" },
      { field: "schedule_to_close_timeout", label: "Total window" }
    ];
    function d(v, y) {
      const m = { ...o.value, [v]: y };
      y === void 0 && delete m[v], i("update-node", { retry_policy: m });
    }
    function f(v) {
      return typeof v == "number" ? `${v}ms` : String(v ?? "");
    }
    function p(v) {
      return v.target.value.trim();
    }
    return (v, y) => (N(), D("section", HO, [
      S("div", qO, [
        y[5] || (y[5] = S("h3", { class: "wf-panel-label" }, "Retries", -1)),
        e.node.retry_policy ? (N(), re(h(fe), {
          key: 1,
          label: "Reset",
          "aria-label": "Reset retry policy",
          size: "small",
          text: "",
          onClick: y[1] || (y[1] = (m) => i("update-node", { retry_policy: !1 }))
        })) : (N(), re(h(fe), {
          key: 0,
          label: "Override",
          "aria-label": "Override retry policy",
          size: "small",
          text: "",
          onClick: y[0] || (y[0] = (m) => i("update-node", { retry_policy: { ...r.value } }))
        }))
      ]),
      S("p", UO, K(o.value ? "Maximum attempts includes the first attempt and defaults to 3. A zero attempt limit requires a total window." : "One attempt. Override the retry policy to retry failed attempts."), 1),
      o.value ? (N(), D(le, { key: 0 }, [
        S("div", WO, [
          y[6] || (y[6] = S("label", {
            class: "wf-retry-label",
            for: "wf-retry-attempts"
          }, "Maximum attempts", -1)),
          z(h(so), {
            "input-id": "wf-retry-attempts",
            class: "wf-input",
            "input-class": "wf-input",
            "model-value": o.value.maximum_attempts ?? 3,
            "aria-label": "Maximum attempts",
            "use-grouping": !1,
            min: 0,
            max: Number.MAX_SAFE_INTEGER,
            "max-fraction-digits": 0,
            "onUpdate:modelValue": y[2] || (y[2] = (m) => d("maximum_attempts", m ?? void 0))
          }, null, 8, ["model-value", "max"]),
          S("p", YO, "Block default: " + K(r.value ? r.value.maximum_attempts ?? 3 : "one attempt"), 1)
        ]),
        (N(), D(le, null, Re(c, (m) => S("div", {
          key: m.field,
          class: "wf-retry-field"
        }, [
          S("label", {
            class: "wf-retry-label",
            for: `wf-retry-${m.field}`
          }, K(m.label), 9, GO),
          z(h(rt), {
            id: `wf-retry-${m.field}`,
            class: "wf-input",
            "model-value": f(o.value[m.field]),
            "aria-label": m.label,
            placeholder: m.default,
            onChange: (_) => d(m.field, p(_) || void 0)
          }, null, 8, ["id", "model-value", "aria-label", "placeholder", "onChange"]),
          S("p", jO, "Block default: " + K(f(r.value?.[m.field]) || (r.value ? m.default : "no policy")), 1)
        ])), 64)),
        S("div", XO, [
          y[7] || (y[7] = S("label", {
            class: "wf-retry-label",
            for: "wf-retry-backoff"
          }, "Backoff coefficient", -1)),
          z(h(so), {
            "input-id": "wf-retry-backoff",
            class: "wf-input",
            "input-class": "wf-input",
            "model-value": o.value.backoff_coefficient ?? 2,
            "aria-label": "Backoff coefficient",
            min: 1,
            "max-fraction-digits": 6,
            "use-grouping": !1,
            "onUpdate:modelValue": y[3] || (y[3] = (m) => d("backoff_coefficient", m ?? void 0))
          }, null, 8, ["model-value"]),
          S("p", KO, "Block default: " + K(r.value ? r.value.backoff_coefficient ?? 2 : "no policy"), 1)
        ]),
        S("div", ZO, [
          y[8] || (y[8] = S("span", {
            id: "wf-retry-kinds-label",
            class: "wf-retry-label"
          }, "Non-retryable error kinds", -1)),
          z(h(Ms), {
            class: "wf-retry-kinds",
            "model-value": o.value.non_retryable_error_types || [],
            options: l,
            multiple: "",
            "aria-labelledby": "wf-retry-kinds-label",
            "onUpdate:modelValue": y[4] || (y[4] = (m) => d("non_retryable_error_types", m ?? []))
          }, null, 8, ["model-value"]),
          S("p", JO, "Block default: " + K(r.value?.non_retryable_error_types?.join(", ") || "none"), 1)
        ])
      ], 64)) : Q("", !0),
      (N(), D(le, null, Re(u, (m) => S("div", {
        key: m.field,
        class: "wf-retry-field"
      }, [
        S("div", QO, [
          S("label", {
            class: "wf-retry-label",
            for: `wf-retry-${m.field}`
          }, K(m.label), 9, eR),
          e.node[m.field] !== void 0 && e.node[m.field] !== !1 ? (N(), re(h(fe), {
            key: 0,
            label: "Reset",
            "aria-label": `Reset ${m.label.toLowerCase()}`,
            text: "",
            size: "small",
            onClick: (_) => i("update-node", { [m.field]: !1 })
          }, null, 8, ["aria-label", "onClick"])) : Q("", !0)
        ]),
        z(h(rt), {
          id: `wf-retry-${m.field}`,
          class: "wf-input",
          "model-value": f(e.node[m.field] || e.execution[m.field]),
          "aria-label": m.label,
          "aria-required": m.field === "schedule_to_close_timeout" && a.value,
          invalid: m.field === "schedule_to_close_timeout" && s.value,
          placeholder: "No timeout",
          onChange: (_) => i("update-node", { [m.field]: p(_) || !1 })
        }, null, 8, ["id", "model-value", "aria-label", "aria-required", "invalid", "onChange"]),
        m.field === "schedule_to_close_timeout" && s.value ? (N(), D("p", tR, "A zero attempt limit requires a positive total window.")) : Q("", !0),
        S("p", nR, "Block default: " + K(f(e.execution[m.field]) || "no timeout") + ". Use durations such as 500ms or 30s.", 1)
      ])), 64))
    ]));
  }
});
function Ip(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
const iR = 8;
function rR(e, t) {
  const n = Ip(t), i = Number(n.batch_size), o = Number.isFinite(i) && i > 0 ? i : iR, r = n.continue_on_error === !0;
  return { sourceKey: String(n.source_array_key || ""), batchSize: o, continueOnError: r };
}
function aR(e, t) {
  return { kind: "for_each", config: {
    ...Ip(e),
    source_array_key: t.sourceKey.trim(),
    batch_size: Math.max(1, Math.round(t.batchSize) || 1),
    continue_on_error: t.continueOnError
  } };
}
const sR = "Checked after every pass. Reference result (the last pass’s output), state or iteration — a bare name reads from state.", lR = "Safety cap. If the condition still holds after this many passes, the step fails with MAX_ITERATIONS_EXCEEDED — wire its Failed port to recover instead of ending the run. 0 uses the default (8).", uR = "Runs the same steps once per item of a list. Wire those steps from the “each item” port; the collected results continue from “all results”. How many run at the same time is the batch size below.", cR = "How many items run at the same time. Default 8.", dR = "Attempts every item and keeps going when one fails. The output is one entry per item, each carrying its result or its error { code, message }.", fR = "Stops at the first item that fails — that failure becomes this step’s failure (route it with the Failed port). The output is the results array in source order.", hR = "Runs the selected Workflow and waits for it to finish. Its result continues from the Finished port; if it fails, the Failed port carries { code, message }.";
function pR(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {};
  return typeof t.predicate == "string" ? t.predicate : "";
}
function vR(e, t) {
  return { ...e && typeof e == "object" && !Array.isArray(e) ? e : {}, predicate: t.trim() };
}
function mR(e) {
  return "config" in e;
}
const oi = "The assistant couldn’t draft these settings.";
async function gR(e) {
  let t;
  try {
    t = (await Vn.post(`/api/v1/workflows/${encodeURIComponent(e.workflowId)}/assist/config`, {
      intent: e.intent,
      node_id: e.nodeId,
      ...e.upstreamSchema ? { upstream_schema: e.upstreamSchema } : {}
    }, { timeout: 105e3 })).data;
  } catch (i) {
    const o = i?.response?.data;
    return o && typeof o == "object" && (typeof o.message == "string" || typeof o.code == "string") ? { error: En(o, oi) } : Td(i) === 404 ? { error: Ll, unavailable: !0 } : o ? { error: En(o, oi) } : { error: i instanceof Error && i.message ? i.message : oi };
  }
  if (!t || typeof t != "object") return { error: Ll, unavailable: !0 };
  const n = t;
  return n.success === !1 ? { error: En(n, oi) } : !n.config || typeof n.config != "object" || Array.isArray(n.config) ? { error: "The assistant returned no settings." } : {
    config: n.config,
    notes: typeof n.notes == "string" && n.notes.trim() ? n.notes.trim() : void 0,
    ...n.config_schema && typeof n.config_schema == "object" && !Array.isArray(n.config_schema) ? { configSchema: n.config_schema } : {}
  };
}
const yR = {
  class: "wf-config-assist",
  "aria-label": "Describe this step"
}, wR = ["for"], bR = { class: "wf-config-assist__compose" }, _R = {
  key: 1,
  class: "wf-config-assist__preview",
  role: "region",
  "aria-label": "Drafted settings"
}, kR = { class: "wf-config-assist__preview-head" }, ER = {
  key: 0,
  class: "wf-config-assist__notes"
}, xR = { class: "wf-config-assist__changes" }, $R = {
  key: 0,
  class: "wf-config-assist__before"
}, SR = { class: "wf-config-assist__after" }, CR = { class: "wf-config-assist__actions" }, za = "This step changed while the draft was being prepared. Review the current settings and draft again.", Ap = /* @__PURE__ */ ye({
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
    const n = e, i = t, o = G(""), r = G(!1), a = G(""), s = G(""), l = G(null), c = G(null), u = G(null), d = G(!1);
    let f = 0, p = "";
    function v($) {
      const k = /* @__PURE__ */ new WeakSet();
      function H(q, ee) {
        if (ee > 20) return "[max-depth]";
        if (!q || typeof q != "object") return q;
        if (k.has(q)) return "[cycle]";
        if (k.add(q), Array.isArray(q)) {
          const oe = q.map((se) => H(se, ee + 1));
          return k.delete(q), oe;
        }
        const Z = {};
        for (const oe of Object.keys(q).sort())
          Z[oe] = H(q[oe], ee + 1);
        return k.delete(q), Z;
      }
      try {
        return JSON.stringify(H($, 0));
      } catch {
        return "[unserializable]";
      }
    }
    const y = U(() => v([
      n.workflowId,
      n.resetKey,
      n.configSchema || {}
    ])), m = U(() => c.value || n.configSchema || {}), _ = U(() => v(n.currentConfig)), x = U(() => v([
      n.workflowId,
      n.resetKey,
      n.configSchema,
      n.currentConfig
    ]));
    function w() {
      const $ = r.value || l.value !== null;
      f += 1, p = "", o.value = "", r.value = !1, a.value = $ ? za : "", s.value = "", l.value = null, c.value = null, u.value = null, d.value = !1;
    }
    _e(y, w, { flush: "sync" }), _e(_, ($) => {
      if (p && $ === p) {
        p = "";
        return;
      }
      const k = r.value || l.value !== null;
      f += 1, r.value = !1, l.value = null, s.value = "", u.value = null, d.value = !1, k && (a.value = za);
    }, { flush: "sync" }), Qe(() => {
      f += 1;
    });
    function b($, k) {
      return v($) === v(k);
    }
    function C($) {
      const k = m.value.properties;
      if (k && typeof k == "object" && !Array.isArray(k)) {
        const H = k[$];
        if (H && typeof H == "object" && !Array.isArray(H)) {
          const q = H.title;
          if (typeof q == "string" && q.trim()) return q.trim();
        }
      }
      return $.replace(/_/g, " ").replace(/^./, (H) => H.toUpperCase());
    }
    function I($) {
      if ($ === void 0) return "Not set";
      if (typeof $ == "string") return $ || "Empty";
      if (Array.isArray($)) return `${$.length} item${$.length === 1 ? "" : "s"}`;
      if ($ && typeof $ == "object") {
        const k = $, H = k.properties && typeof k.properties == "object" && !Array.isArray(k.properties) ? Object.keys(k.properties) : [];
        if (k.type === "object" || H.length) {
          const q = Array.isArray(k.required) ? k.required.length : 0;
          return `${H.length} field${H.length === 1 ? "" : "s"}${q ? ` · ${q} required` : ""}`;
        }
        try {
          return JSON.stringify(k, null, 2);
        } catch {
          return "Settings";
        }
      }
      try {
        return JSON.stringify($);
      } catch {
        return String($);
      }
    }
    const B = U(() => Array.from(/* @__PURE__ */ new Set([
      ...Object.keys(n.currentConfig),
      ...Object.keys(l.value || {})
    ])).sort().map(($) => ({
      key: $,
      label: C($),
      before: n.currentConfig[$],
      after: l.value?.[$],
      changed: !b(n.currentConfig[$], l.value?.[$])
    })));
    function T($, k = 0) {
      if (!$ || typeof $ != "object" || Array.isArray($) || k > 12) return k > 12;
      const H = $;
      if (H.picker != null || H.class != null) return !0;
      const q = H.properties;
      return q && typeof q == "object" && !Array.isArray(q) && Object.values(q).some((ee) => T(ee, k + 1)) || T(H.items, k + 1) ? !0 : T(H.additionalProperties, k + 1);
    }
    function M($, k, H) {
      const q = H && typeof H == "object" && !Array.isArray(H) ? H : {};
      if (!(q.type === "object" || !!q.properties && typeof q.properties == "object" && !Array.isArray(q.properties)) || !$ || typeof $ != "object" || Array.isArray($) || !k || typeof k != "object" || Array.isArray(k)) return k;
      const Z = q.properties && typeof q.properties == "object" && !Array.isArray(q.properties) ? q.properties : {}, oe = { ...$ };
      for (const [se, Y] of Object.entries(k)) {
        const J = Z[se] ?? (q.additionalProperties && typeof q.additionalProperties == "object" ? q.additionalProperties : void 0);
        oe[se] = M(oe[se], Y, J);
      }
      return oe;
    }
    function V($) {
      const k = m.value.properties, H = k && typeof k == "object" && !Array.isArray(k) ? k : {};
      if (!Object.keys(H).length) return { ...n.currentConfig, ...$ };
      const q = {};
      for (const [ee, Z] of Object.entries($)) {
        const oe = H[ee], se = oe && typeof oe == "object" && !Array.isArray(oe) ? oe : {};
        T(se) || (q[ee] = Z);
      }
      return M(n.currentConfig, q, m.value);
    }
    async function O() {
      const $ = o.value.trim();
      if (!$ || r.value) return;
      r.value = !0;
      const k = ++f, H = x.value;
      a.value = "", d.value = !1;
      const q = await gR({
        workflowId: n.workflowId,
        nodeId: n.resetKey,
        intent: $,
        ...n.upstreamSchema ? { upstreamSchema: n.upstreamSchema } : {}
      });
      if (k === f) {
        if (H !== x.value) {
          r.value = !1, l.value = null, s.value = "", a.value = za;
          return;
        }
        if (r.value = !1, !mR(q)) {
          a.value = q.error, l.value = null, s.value = "";
          return;
        }
        q.configSchema && (c.value = q.configSchema), l.value = V(q.config), s.value = q.notes || "";
      }
    }
    function E() {
      l.value = null, s.value = "", a.value = "";
    }
    function F() {
      if (!l.value) return;
      u.value = { ...n.currentConfig };
      const $ = { ...l.value };
      p = v($), i("accept", $), l.value = null, s.value = "", d.value = !0;
    }
    function g() {
      if (!u.value) return;
      const $ = { ...u.value };
      p = v($), i("undo", $), u.value = null, d.value = !1;
    }
    return ($, k) => (N(), D("section", yR, [
      S("label", {
        class: "wf-config-assist__label",
        for: `wf-config-intent-${e.resetKey}`
      }, "Describe this step", 8, wR),
      S("div", bR, [
        z(h(Os), {
          id: `wf-config-intent-${e.resetKey}`,
          modelValue: o.value,
          "onUpdate:modelValue": k[0] || (k[0] = (H) => o.value = H),
          class: "wf-textarea",
          rows: "2",
          placeholder: "Explain how this step should behave…",
          onKeydown: [
            tt(He(O, ["meta", "prevent"]), ["enter"]),
            tt(He(O, ["ctrl", "prevent"]), ["enter"])
          ]
        }, null, 8, ["id", "modelValue", "onKeydown"]),
        z(h(fe), {
          class: "wf-config-assist__draft",
          disabled: !o.value.trim() || r.value,
          loading: r.value,
          onClick: O
        }, {
          default: ne(() => [
            r.value ? Q("", !0) : (N(), re(h(ie), {
              key: 0,
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            })),
            S("span", null, K(r.value ? "Drafting…" : "Draft with AI"), 1)
          ]),
          _: 1
        }, 8, ["disabled", "loading"])
      ]),
      a.value ? (N(), re(h(Fe), {
        key: 0,
        class: "wf-config-assist__error",
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          ce(K(a.value), 1)
        ]),
        _: 1
      })) : Q("", !0),
      l.value ? (N(), D("div", _R, [
        S("div", kR, [
          k[1] || (k[1] = S("strong", null, "Review drafted settings", -1)),
          S("span", null, K(B.value.filter((H) => H.changed).length) + " changed", 1)
        ]),
        s.value ? (N(), D("p", ER, K(s.value), 1)) : Q("", !0),
        S("dl", xR, [
          (N(!0), D(le, null, Re(B.value, (H) => (N(), D("div", {
            key: H.key,
            class: Ie({ "is-unchanged": !H.changed })
          }, [
            S("dt", null, K(H.label), 1),
            S("dd", null, [
              H.changed ? (N(), D("span", $R, K(I(H.before)), 1)) : Q("", !0),
              S("span", SR, K(I(H.after)), 1)
            ])
          ], 2))), 128))
        ]),
        S("div", CR, [
          z(h(fe), {
            class: "wf-config-assist__accept",
            onClick: F
          }, {
            default: ne(() => [...k[2] || (k[2] = [
              ce("Accept", -1)
            ])]),
            _: 1
          }),
          z(h(fe), {
            severity: "secondary",
            text: "",
            onClick: E
          }, {
            default: ne(() => [...k[3] || (k[3] = [
              ce("Cancel", -1)
            ])]),
            _: 1
          })
        ])
      ])) : d.value ? (N(), re(h(Fe), {
        key: 2,
        class: "wf-config-assist__applied",
        severity: "success",
        closable: !1
      }, {
        default: ne(() => [
          k[5] || (k[5] = S("span", null, "Draft applied. You can edit every field below.", -1)),
          z(h(fe), {
            severity: "secondary",
            outlined: "",
            onClick: g
          }, {
            default: ne(() => [...k[4] || (k[4] = [
              ce("Undo", -1)
            ])]),
            _: 1
          })
        ]),
        _: 1
      })) : Q("", !0)
    ]));
  }
});
function ii(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function NR(e) {
  const t = Array.isArray(e.type) ? e.type.find((n) => n !== "null") : e.type;
  return t === "string" || t === "number" || t === "integer" || t === "boolean" || t === "array" ? t === "integer" ? "number" : t : "unknown";
}
function Tp(e, t = !1) {
  const n = [];
  function i(o, r = "", a = 0) {
    if (a > 10) return;
    const s = ii(o), l = ii(s.properties);
    for (const [c, u] of Object.entries(l)) {
      const d = ii(u), f = r ? `${r}.${c}` : c, p = NR(d), v = typeof d.title == "string" && d.title.trim() ? d.title.trim() : c.replace(/_/g, " ");
      p === "array" ? t && n.push({ path: f, label: v, type: p }) : p === "unknown" && Object.keys(ii(d.properties)).length ? i(d, f, a + 1) : t || n.push({ path: f, label: v, type: p });
    }
  }
  return i(e), n;
}
function od(e) {
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
function IR(e) {
  return `'${e.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}
function AR(e, t, n = "output") {
  const i = e.field.trim();
  if (!i) return "";
  const o = `${n}.${i}`;
  if (e.operator === "truthy") return `${o} == true`;
  if (e.operator === "falsy") return `${o} == false`;
  const r = { eq: "==", neq: "!=", gt: ">", gte: ">=", lt: "<", lte: "<=" }[e.operator];
  if (!r) return "";
  const a = e.value.trim();
  if (!a) return "";
  const s = t === "number" && Number.isFinite(Number(a)) ? String(Number(a)) : IR(a);
  return `${o} ${r} ${s}`;
}
function TR(e, t = "output") {
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
const MR = ["aria-label"], OR = {
  key: 0,
  class: "wf-predicate-row"
}, RR = { key: 0 }, DR = {
  key: 1,
  class: "wf-panel-hint wf-panel-hint--warn"
}, PR = { class: "wf-predicate-advanced" }, id = /* @__PURE__ */ ye({
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
    const n = e, i = t, o = U(() => Tp(n.schema)), r = G({ field: "", operator: "eq", value: "" }), a = G(!0), s = G("");
    let l = !1;
    const c = U(() => o.value.find((b) => b.path === r.value.field)), u = U(() => od(c.value?.type || "unknown")), d = U(() => r.value.operator !== "truthy" && r.value.operator !== "falsy"), f = U(() => c.value?.type === "number" ? "number" : "text"), p = U(() => {
      const b = Number(r.value.value);
      return r.value.value.trim() !== "" && Number.isFinite(b) ? b : null;
    });
    function v(b) {
      s.value = b || "";
      const C = TR(b || "", n.root);
      C && o.value.some((I) => I.path === C.field) ? (r.value = C, a.value = !0) : (r.value = { field: "", operator: "eq", value: "" }, a.value = !b);
    }
    _e(() => [n.modelValue, n.root, n.schema], () => {
      if (l) {
        l = !1;
        return;
      }
      v(n.modelValue);
    }, { immediate: !0, deep: !0 });
    function y(b) {
      l = !0, s.value = b, i("update:modelValue", b);
    }
    function m() {
      const b = AR(r.value, c.value?.type || "unknown", n.root);
      y(b);
    }
    function _(b) {
      r.value.value = b == null ? "" : String(b), m();
    }
    function x(b) {
      r.value.field = b || "";
      const C = od(c.value?.type || "unknown").map((I) => I.value);
      C.includes(r.value.operator) || (r.value.operator = C[0] || "eq"), r.value.value = "", m();
    }
    function w(b) {
      b && (r.value.operator = b, m());
    }
    return (b, C) => (N(), D("section", {
      class: Ie(["wf-predicate", { "is-compact": e.compact }]),
      "aria-label": e.label
    }, [
      o.value.length ? (N(), D("div", OR, [
        S("label", null, [
          C[4] || (C[4] = S("span", null, "Field", -1)),
          z(h(St), {
            "model-value": r.value.field || null,
            options: o.value,
            "option-label": "label",
            "option-value": "path",
            placeholder: "Choose a field…",
            "aria-label": "Condition field",
            "onUpdate:modelValue": x
          }, null, 8, ["model-value", "options"])
        ]),
        S("label", null, [
          C[5] || (C[5] = S("span", null, "Check", -1)),
          z(h(St), {
            "model-value": r.value.operator,
            options: u.value,
            "option-label": "label",
            "option-value": "value",
            disabled: !r.value.field,
            "aria-label": "Condition operator",
            "onUpdate:modelValue": w
          }, null, 8, ["model-value", "options", "disabled"])
        ]),
        d.value ? (N(), D("label", RR, [
          C[6] || (C[6] = S("span", null, "Value", -1)),
          f.value === "number" ? (N(), re(h(so), {
            key: 0,
            "model-value": p.value,
            disabled: !r.value.field,
            "use-grouping": !1,
            "aria-label": "Condition value",
            placeholder: "Enter a value",
            "onUpdate:modelValue": _
          }, null, 8, ["model-value", "disabled"])) : (N(), re(h(rt), {
            key: 1,
            modelValue: r.value.value,
            "onUpdate:modelValue": C[0] || (C[0] = (I) => r.value.value = I),
            disabled: !r.value.field,
            "aria-label": "Condition value",
            placeholder: "Enter a value",
            onChange: m
          }, null, 8, ["modelValue", "disabled"]))
        ])) : Q("", !0)
      ])) : (N(), D("p", DR, "Connect a step with declared output fields to build this visually.")),
      z(h(Rg), {
        collapsed: a.value,
        "onUpdate:collapsed": C[3] || (C[3] = (I) => a.value = I),
        class: "wf-predicate-disclosure",
        header: "Advanced expression",
        toggleable: ""
      }, {
        default: ne(() => [
          S("div", PR, [
            z(h(rt), {
              modelValue: s.value,
              "onUpdate:modelValue": C[1] || (C[1] = (I) => s.value = I),
              class: "wf-input wf-mono",
              "aria-label": "Condition expression",
              placeholder: "output.status == 'ready'",
              onChange: C[2] || (C[2] = (I) => y(s.value.trim()))
            }, null, 8, ["modelValue"]),
            C[7] || (C[7] = S("p", { class: "wf-panel-hint" }, "Use expr-lang only when the visual controls cannot express the rule.", -1))
          ])
        ]),
        _: 1
      }, 8, ["collapsed"])
    ], 10, MR));
  }
}), LR = { class: "wf-panel-hint" }, VR = { class: "wf-panel-hint" }, zR = { class: "wf-panel-hint" }, BR = { class: "wf-panel-hint" }, FR = { class: "wf-panel-hint" }, HR = { class: "wf-panel-hint" }, qR = {
  key: 0,
  class: "wf-panel-hint wf-panel-hint--warn"
}, UR = /* @__PURE__ */ ye({
  __name: "LogicNodePanel",
  props: {
    workflowId: {},
    node: {},
    upstreamSchema: {},
    combineBranchConflict: {}
  },
  emits: ["update-node"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => n.node?.config || {}), r = G("");
    _e(() => n.node?.id, () => {
      n.node?.kind === "branch" && (r.value = pR(o.value));
    }, { immediate: !0 });
    function a() {
      i("update-node", { config: vR(o.value, r.value) });
    }
    function s($) {
      r.value = $, a();
    }
    function l($) {
      s(typeof $.predicate == "string" ? $.predicate : "");
    }
    const c = G(""), u = G(0);
    _e(() => n.node?.id, () => {
      c.value = String(o.value.continue_condition || "");
      const $ = Number(o.value.max_iterations);
      u.value = Number.isFinite($) && $ > 0 ? $ : 0;
    }, { immediate: !0 });
    function d() {
      const $ = { ...o.value, continue_condition: c.value.trim() };
      u.value > 0 ? $.max_iterations = Math.round(u.value) : delete $.max_iterations, i("update-node", { config: $ });
    }
    function f($) {
      const k = Number($);
      u.value = Number.isFinite(k) ? k : 0, d();
    }
    function p($) {
      c.value = $, d();
    }
    const v = G(""), y = G(8), m = G(!1), _ = U(() => Tp(n.upstreamSchema, !0)), x = [
      { label: "Stop — fail this step at the first failed item", value: !1 },
      { label: "Continue — attempt every item, collect each result or error", value: !0 }
    ];
    _e(() => n.node?.id, () => {
      if (!wi(n.node?.kind)) return;
      const $ = rR(n.node?.kind, o.value);
      v.value = $.sourceKey, y.value = $.batchSize, m.value = $.continueOnError;
    }, { immediate: !0 });
    function w() {
      i("update-node", aR(o.value, {
        sourceKey: v.value,
        batchSize: y.value,
        continueOnError: m.value
      }));
    }
    function b($) {
      v.value = $ || "", w();
    }
    function C($) {
      m.value = $, w();
    }
    function I($) {
      const k = Number($);
      y.value = Math.max(1, Math.round(Number.isFinite(k) ? k : 1)), w();
    }
    const B = G("wait_all"), T = G("object"), M = [
      { label: "Wait for all — every incoming path must finish first", value: "wait_all" },
      { label: "First wins — continue as soon as one path arrives", value: "first_wins" }
    ], V = [
      { label: "Object — merge each path’s output by key", value: "object" },
      { label: "Array — collect each path’s output as a list", value: "array" }
    ];
    _e(() => n.node?.id, () => {
      Hi(n.node?.kind) && (B.value = DC(n.node?.kind, o.value), T.value = PC(o.value));
    }, { immediate: !0 });
    const O = U(
      () => B.value === "wait_all" && n.combineBranchConflict ? zC(n.combineBranchConflict) : ""
    );
    function E() {
      i("update-node", LC(o.value, B.value, T.value));
    }
    function F($) {
      $ && (B.value = $, E());
    }
    function g($) {
      $ && (T.value = $, E());
    }
    return ($, k) => e.node.kind === "branch" ? (N(), D(le, { key: 0 }, [
      k[1] || (k[1] = S("p", { class: "wf-panel-hint" }, [
        ce("Set the condition, then connect "),
        S("strong", null, "True"),
        ce(" and "),
        S("strong", null, "False"),
        ce(" to the steps that should run. Exactly one path runs.")
      ], -1)),
      k[2] || (k[2] = S("div", { class: "wf-panel-label" }, "Condition", -1)),
      z(id, {
        "model-value": r.value,
        schema: e.upstreamSchema,
        "onUpdate:modelValue": s
      }, null, 8, ["model-value", "schema"]),
      z(Ap, {
        "workflow-id": e.workflowId,
        "reset-key": e.node.id,
        "current-config": { predicate: r.value },
        "upstream-schema": e.upstreamSchema,
        onAccept: l,
        onUndo: l
      }, null, 8, ["workflow-id", "reset-key", "current-config", "upstream-schema"]),
      k[3] || (k[3] = S("div", {
        class: "wf-branch-outcomes",
        "aria-label": "Condition outcomes"
      }, [
        S("p", null, [
          S("strong", null, "True"),
          S("span", null, "runs when the condition matches")
        ]),
        S("p", null, [
          S("strong", null, "False"),
          S("span", null, "runs when it does not")
        ])
      ], -1))
    ], 64)) : e.node.kind === "cycle" ? (N(), D(le, { key: 1 }, [
      k[4] || (k[4] = S("p", { class: "wf-panel-hint" }, [
        ce("Use it when one step needs to run more than once — retrying a bounded operation or working through repeated passes — until the condition below stops holding. Wire the repeated steps from the "),
        S("strong", null, "each pass"),
        ce(" port; the "),
        S("strong", null, "when done"),
        ce(" port continues after the loop.")
      ], -1)),
      k[5] || (k[5] = S("div", { class: "wf-panel-label" }, "Repeat while", -1)),
      z(id, {
        "model-value": c.value,
        schema: e.upstreamSchema,
        root: "input",
        label: "Repeat while",
        "onUpdate:modelValue": p
      }, null, 8, ["model-value", "schema"]),
      S("p", LR, K(h(sR)), 1),
      k[6] || (k[6] = S("div", { class: "wf-panel-label" }, "Max iterations", -1)),
      z(h(so), {
        "model-value": u.value,
        min: 0,
        "use-grouping": !1,
        class: "wf-input",
        placeholder: "8",
        "aria-label": "Max iterations",
        "onUpdate:modelValue": f
      }, null, 8, ["model-value"]),
      S("p", VR, K(h(lR)), 1)
    ], 64)) : h(wi)(e.node.kind) ? (N(), D(le, { key: 2 }, [
      S("p", zR, K(h(uR)), 1),
      k[7] || (k[7] = S("div", { class: "wf-panel-label" }, "Items to iterate", -1)),
      _.value.length ? (N(), re(h(St), {
        key: 0,
        "model-value": v.value || null,
        options: _.value,
        "option-label": "label",
        "option-value": "path",
        class: "wf-input",
        placeholder: "Choose an array field…",
        "aria-label": "Items to iterate",
        "onUpdate:modelValue": b
      }, null, 8, ["model-value", "options"])) : (N(), re(h(rt), {
        key: 1,
        modelValue: v.value,
        "onUpdate:modelValue": k[0] || (k[0] = (H) => v.value = H),
        class: "wf-input wf-mono",
        placeholder: "items",
        "aria-label": "Source array key",
        onChange: w
      }, null, 8, ["modelValue"])),
      k[8] || (k[8] = S("p", { class: "wf-panel-hint" }, "The upstream field holding the array to fan out over — one run of the body per item.", -1)),
      k[9] || (k[9] = S("div", { class: "wf-panel-label" }, "Batch size", -1)),
      z(h(so), {
        "model-value": y.value,
        min: 1,
        "use-grouping": !1,
        class: "wf-input",
        "aria-label": "Batch size",
        "onUpdate:modelValue": I
      }, null, 8, ["model-value"]),
      S("p", BR, K(h(cR)), 1),
      k[10] || (k[10] = S("div", { class: "wf-panel-label" }, "If an item fails", -1)),
      z(h(St), {
        "model-value": m.value,
        options: x,
        "option-label": "label",
        "option-value": "value",
        class: "wf-input",
        "aria-label": "If an item fails",
        "onUpdate:modelValue": C
      }, null, 8, ["model-value"]),
      S("p", FR, K(m.value ? h(dR) : h(fR)), 1)
    ], 64)) : h(Hi)(e.node.kind) ? (N(), D(le, { key: 3 }, [
      k[11] || (k[11] = S("p", { class: "wf-panel-hint" }, "Use it to bring several paths back into one. Choose below whether it waits for every path to finish or continues on the first to arrive.", -1)),
      k[12] || (k[12] = S("div", { class: "wf-panel-label" }, "When to continue", -1)),
      z(h(St), {
        "model-value": B.value,
        options: M,
        "option-label": "label",
        "option-value": "value",
        class: "wf-input",
        "aria-label": "When to continue",
        "onUpdate:modelValue": F
      }, null, 8, ["model-value"]),
      S("p", HR, K(B.value === "wait_all" ? "Waits for every incoming path to finish, then continues once. Use it when parallel work must all complete before the next step." : "Continues the moment the first path arrives, without waiting for the rest. Use it to bring Condition paths back together, where only one ever runs."), 1),
      O.value ? (N(), D("p", qR, [
        z(h(ie), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        ce(" " + K(O.value), 1)
      ])) : Q("", !0),
      k[13] || (k[13] = S("div", { class: "wf-panel-label" }, "Combine as", -1)),
      z(h(St), {
        "model-value": T.value,
        options: V,
        "option-label": "label",
        "option-value": "value",
        class: "wf-input",
        "aria-label": "Combine as",
        "onUpdate:modelValue": g
      }, null, 8, ["model-value"]),
      k[14] || (k[14] = S("p", { class: "wf-panel-hint" }, "How the arriving outputs are shaped before they continue.", -1))
    ], 64)) : Q("", !0);
  }
}), WR = { class: "fm-top" }, YR = {
  key: 0,
  class: "fm-note"
}, GR = {
  key: 1,
  class: "fm-err"
}, jR = {
  key: 2,
  class: "fm-armbar"
}, XR = {
  key: 3,
  class: "fm-contract-missing"
}, KR = {
  key: 4,
  class: "fm-empty fm-no-mapping"
}, ZR = {
  key: 5,
  class: "fm-cols"
}, JR = {
  class: "fm-col fm-col--src",
  "aria-label": "Source fields"
}, QR = { class: "fm-col-hd" }, eD = { class: "fm-pills" }, tD = ["aria-expanded", "aria-label", "onClick"], nD = {
  key: 1,
  class: "fm-twist-sp",
  "aria-hidden": "true"
}, oD = ["title", "onClick", "onDragstart"], iD = { class: "fm-pill-name" }, rD = { class: "fm-pill-type" }, aD = {
  key: 0,
  class: "fm-empty"
}, sD = {
  class: "fm-col fm-col--tgt",
  "aria-label": "Target fields"
}, lD = { class: "fm-col-hd" }, uD = { class: "fm-raw" }, cD = ["value", "placeholder"], dD = {
  key: 1,
  class: "fm-rows"
}, fD = {
  key: 0,
  class: "fm-empty"
}, hD = ["data-test", "onDragover", "onDragleave", "onDrop"], pD = ["aria-label", "onClick"], vD = { class: "fm-row-name" }, mD = {
  key: 0,
  class: "fm-req"
}, gD = { class: "fm-row-type" }, yD = {
  key: 1,
  class: "fm-compat fm-compat--warn",
  title: "This field's type may not match the target"
}, wD = {
  key: 0,
  class: "fm-simple-row"
}, bD = ["value", "aria-label", "onChange"], _D = { value: "" }, kD = ["value"], ED = ["aria-label", "onClick"], xD = {
  key: 1,
  class: "fm-row-body"
}, $D = ["value", "aria-label", "onChange"], SD = {
  key: 0,
  value: "skip"
}, CD = ["onClick"], ND = ["value", "placeholder", "aria-label", "onInput"], ID = ["value", "placeholder", "aria-label", "onInput"], AD = ["aria-label", "onClick"], TD = {
  key: 2,
  class: "fm-empty"
}, MD = /* @__PURE__ */ ye({
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
    const n = e, i = t, o = G([]), r = G(!1), a = G(""), s = G(null), l = G({}), c = G(null), u = G(!1), d = G(!1), f = U(() => n.sourceRoot || "output"), p = U(() => Eh(n.sourceSchema, f.value)), v = U(() => q$(n.sourceSchema, f.value)), y = U(() => p.value.length ? p.value : v.value ? [v.value] : []), m = U(() => To(n.targetSchema)), _ = U(() => m.value.length > 0), x = U(() => !!s.value), w = U(() => {
      const L = /* @__PURE__ */ new Map(), R = (A) => A.forEach((P) => {
        L.set(P.expr, P), P.children.length && R(P.children);
      });
      return R(y.value), L;
    }), b = U(() => {
      const L = [], R = (A) => {
        for (const P of A)
          L.push(P), P.expandable && l.value[P.path] && R(P.children);
      };
      return R(y.value), L;
    }), C = U(() => {
      const L = [], R = (A) => A.forEach((P) => {
        L.push(P), R(P.children);
      });
      return R(y.value), L;
    }), I = U(() => r.value ? a.value.trim() ? [] : m.value.filter((L) => L.required).map((L) => L.title || L.key) : tl(m.value, o.value)), B = U(() => r.value ? "" : Y$(m.value, o.value)), T = U(() => zn(n.targetSchema)), M = U(() => T.value ? !_.value && !r.value ? "No mapping needed" : _.value ? B.value || (d.value ? "Required fields pass through unchanged" : "All required fields mapped") : "Custom mapping" : "Input fields unavailable"), V = U(() => !!B.value || !T.value), O = U(() => d.value ? "" : r.value ? a.value.trim() : ls(o.value));
    function E() {
      if (s.value = null, d.value = !1, !_.value) {
        a.value = ol(n.modelValue), r.value = a.value !== "", o.value = [];
        return;
      }
      const L = us(n.targetSchema, n.modelValue), R = (n.modelValue || "").trim() ? [] : $h(n.sourceSchema, n.targetSchema, f.value), A = new Map(R.map((P) => [P.key, P]));
      o.value = L.rows.map((P) => A.get(P.key) || P), d.value = R.length > 0, a.value = L.raw, r.value = L.raw !== "";
    }
    _e(() => n.resetKey, E, { immediate: !0 }), _e(O, (L) => i("update:modelValue", L)), _e(I, (L) => i("update:missing", L), { immediate: !0 });
    function F(L) {
      return o.value.find((R) => R.key === L) || { key: L, mode: "skip", value: "" };
    }
    function g(L) {
      return (L.mode === "expr" || L.mode === "static") && (L.value ?? "") !== "";
    }
    function $(L) {
      const R = F(L.key);
      if (R.mode !== "expr" || !R.value) return "neutral";
      const A = w.value.get(R.value.trim());
      return A ? G$(A.type, L.type) : "neutral";
    }
    function k(L) {
      s.value = s.value === L ? null : L;
    }
    function H(L) {
      l.value = { ...l.value, [L]: !l.value[L] };
    }
    function q(L, R) {
      d.value = !1, o.value = o.value.map((A) => A.key === L ? { ...A, mode: "expr", value: R } : A);
    }
    function ee(L) {
      s.value && (q(L, s.value), s.value = null);
    }
    function Z(L, R) {
      R ? q(L, R) : Y(L), s.value = null;
    }
    function oe(L, R) {
      d.value = !1, o.value = o.value.map((A) => A.key === L ? { ...A, mode: R } : A);
    }
    function se(L, R) {
      d.value = !1, o.value = o.value.map((A) => A.key === L ? { ...A, value: R } : A);
    }
    function Y(L) {
      d.value = !1;
      const R = m.value.find((A) => A.key === L);
      o.value = o.value.map((A) => A.key === L ? { key: L, mode: R?.required ? "static" : "skip", value: "", type: A.type } : A), s.value = null;
    }
    function J(L, R) {
      L.dataTransfer && (L.dataTransfer.setData("text/plain", R), L.dataTransfer.effectAllowed = "copy"), s.value = R;
    }
    function j(L, R) {
      L.preventDefault(), c.value = R;
    }
    function X(L) {
      c.value === L && (c.value = null);
    }
    function te(L, R) {
      L.preventDefault();
      const A = L.dataTransfer?.getData("text/plain") || s.value;
      A && (q(R, A), s.value = null), c.value = null;
    }
    function ae() {
      d.value = !1, a.value = ls(o.value), r.value = !0, s.value = null;
    }
    function ue() {
      const L = us(n.targetSchema, a.value);
      o.value = L.rows, L.raw === "" && (r.value = !1);
    }
    function we(L) {
      a.value = L.target.value;
    }
    function $e(L) {
      L.key === "Escape" && s.value && (s.value = null, L.stopPropagation());
    }
    function ve(L) {
      if (L.mode === "static" && L.value) return `Fixed value: ${L.value}`;
      if (L.mode === "expr" && L.value) {
        const R = `${f.value}.`;
        return L.value.startsWith(R) ? `From ${L.value.slice(R.length)}` : "Custom mapping";
      }
      return "Choose a field";
    }
    const me = U(() => `{ field: ${f.value}.value }`);
    return (L, R) => (N(), D("div", {
      class: Ie(["fm", { "fm--armed": x.value }]),
      onKeydown: $e
    }, [
      S("div", WR, [
        S("span", {
          class: Ie(["fm-status", V.value ? "fm-status--warn" : "fm-status--ok"])
        }, [
          z(h(ie), {
            icon: V.value ? "tabler:alert-triangle" : "tabler:circle-check",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          S("span", null, K(M.value), 1)
        ], 2),
        e.showAssist && T.value ? (N(), D("button", {
          key: 0,
          type: "button",
          class: "fm-ai",
          onClick: R[0] || (R[0] = (A) => e.assistPending ? i("cancel-assist") : i("assist"))
        }, [
          z(h(ie), {
            icon: e.assistPending ? "tabler:x" : "tabler:wand",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          S("span", null, K(e.assistPending ? "Cancel" : "Draft with AI"), 1)
        ])) : Q("", !0)
      ]),
      e.assistPending ? (N(), D("p", YR, "Drafting a field mapping…")) : e.assistError ? (N(), D("p", GR, [
        z(h(ie), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        ce(" " + K(e.assistError), 1)
      ])) : Q("", !0),
      x.value ? (N(), D("div", jR, [
        z(h(ie), {
          icon: "tabler:pointer",
          "aria-hidden": "true"
        }),
        S("span", null, [
          R[2] || (R[2] = ce("Mapping ", -1)),
          S("code", null, K(s.value), 1),
          R[3] || (R[3] = ce(" — pick a target field, or press Esc.", -1))
        ])
      ])) : Q("", !0),
      e.simple && !T.value ? (N(), D("div", XR, [
        z(h(ie), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        R[4] || (R[4] = S("span", null, "This step’s input fields didn’t load. Refresh the step before mapping it.", -1))
      ])) : !_.value && !r.value ? (N(), D("p", KR, " This step takes no input fields, so the connection passes through without a mapping. ")) : (N(), D("div", ZR, [
        S("section", JR, [
          S("div", QR, K(e.sourceTitle || "From"), 1),
          S("div", eD, [
            (N(!0), D(le, null, Re(b.value, (A) => (N(), D("div", {
              key: A.expr,
              class: "fm-pill-row",
              style: Be({ "--fm-depth": `${A.depth * 14}px` })
            }, [
              A.expandable ? (N(), D("button", {
                key: 0,
                type: "button",
                class: "fm-twist",
                "aria-expanded": !!l.value[A.path],
                "aria-label": `Expand ${A.name}`,
                onClick: (P) => H(A.path)
              }, [
                z(h(ie), {
                  icon: l.value[A.path] ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, tD)) : (N(), D("span", nD)),
              S("button", {
                type: "button",
                class: Ie(["fm-pill", { "is-sel": s.value === A.expr }]),
                draggable: "true",
                title: A.description || A.expr,
                onClick: (P) => k(A.expr),
                onDragstart: (P) => J(P, A.expr)
              }, [
                S("span", iD, K(A.name), 1),
                S("span", rD, K(A.type), 1)
              ], 42, oD)
            ], 4))), 128)),
            b.value.length ? Q("", !0) : (N(), D("p", aD, " No fields are available from the previous step yet. "))
          ])
        ]),
        S("section", sD, [
          S("div", lD, K(e.targetTitle || "To"), 1),
          r.value && (!e.simple || u.value) ? (N(), D(le, { key: 0 }, [
            S("label", uD, [
              R[5] || (R[5] = S("span", { class: "fm-raw-lbl" }, "Expression", -1)),
              S("textarea", {
                class: "fm-raw-input",
                value: a.value,
                rows: "4",
                spellcheck: "false",
                placeholder: me.value,
                "aria-label": "Mapping expression",
                onInput: we
              }, null, 40, cD)
            ]),
            R[6] || (R[6] = S("p", { class: "fm-hint" }, "Build the complete input with one expression.", -1))
          ], 64)) : r.value ? (N(), D("p", TD, "A custom mapping is configured. Open Advanced mapping to inspect it.")) : (N(), D("div", dD, [
            m.value.length ? Q("", !0) : (N(), D("p", fD, "This target takes no input — nothing to map.")),
            (N(!0), D(le, null, Re(m.value, (A) => (N(), D("div", {
              key: A.key,
              class: Ie(["fm-row", {
                "fm-row--needed": A.required && I.value.includes(A.title || A.key),
                "is-drop": c.value === A.key,
                "is-mapped": g(F(A.key))
              }]),
              "data-test": `fm-row-${A.key}`,
              onDragover: (P) => j(P, A.key),
              onDragleave: (P) => X(A.key),
              onDrop: (P) => te(P, A.key)
            }, [
              S("button", {
                type: "button",
                class: "fm-row-hd",
                "aria-label": x.value ? `Map ${s.value} into ${A.title}` : A.title,
                onClick: (P) => ee(A.key)
              }, [
                S("span", vD, K(A.title), 1),
                A.required ? (N(), D("span", mD, "required")) : Q("", !0),
                S("span", gD, K(A.type || "any"), 1),
                $(A) === "mismatch" ? (N(), D("span", yD, "type?")) : Q("", !0),
                x.value ? (N(), re(h(ie), {
                  key: 2,
                  class: "fm-row-drop",
                  icon: "tabler:arrow-bar-to-down",
                  "aria-hidden": "true"
                })) : Q("", !0)
              ], 8, pD),
              e.simple && !u.value ? (N(), D("div", wD, [
                S("select", {
                  class: "fm-simple-value",
                  value: F(A.key).mode === "expr" ? F(A.key).value : "",
                  "aria-label": `Choose a source field for ${A.title}`,
                  onChange: (P) => Z(A.key, P.target.value)
                }, [
                  S("option", _D, K(ve(F(A.key))), 1),
                  (N(!0), D(le, null, Re(C.value, (P) => (N(), D("option", {
                    key: P.expr,
                    value: P.expr
                  }, K(P.name), 9, kD))), 128))
                ], 40, bD),
                g(F(A.key)) ? (N(), D("button", {
                  key: 0,
                  type: "button",
                  class: "fm-clear",
                  "aria-label": `Clear ${A.title}`,
                  title: "Clear",
                  onClick: (P) => Y(A.key)
                }, [
                  z(h(ie), {
                    icon: "tabler:x",
                    "aria-hidden": "true"
                  })
                ], 8, ED)) : Q("", !0)
              ])) : (N(), D("div", xD, [
                S("select", {
                  class: "fm-mode",
                  value: F(A.key).mode,
                  "aria-label": `How to fill ${A.title}`,
                  onChange: (P) => oe(A.key, P.target.value)
                }, [
                  R[7] || (R[7] = S("option", { value: "expr" }, "Field / expression", -1)),
                  R[8] || (R[8] = S("option", { value: "static" }, "Fixed value", -1)),
                  A.required ? Q("", !0) : (N(), D("option", SD, "Leave empty"))
                ], 40, $D),
                F(A.key).mode === "skip" ? (N(), D("button", {
                  key: 0,
                  type: "button",
                  class: "fm-cell fm-cell--empty",
                  onClick: (P) => ee(A.key)
                }, K(x.value ? "Drop it here" : "Left empty"), 9, CD)) : F(A.key).mode === "static" ? (N(), D("input", {
                  key: 1,
                  class: "fm-cell fm-input",
                  value: F(A.key).value,
                  placeholder: A.description || "value",
                  "aria-label": `${A.title} fixed value`,
                  onInput: (P) => se(A.key, P.target.value)
                }, null, 40, ND)) : (N(), D("input", {
                  key: 2,
                  class: "fm-cell fm-input fm-mono",
                  value: F(A.key).value,
                  placeholder: s.value || `${f.value}.field`,
                  "aria-label": `${A.title} expression`,
                  onInput: (P) => se(A.key, P.target.value)
                }, null, 40, ID)),
                g(F(A.key)) ? (N(), D("button", {
                  key: 3,
                  type: "button",
                  class: "fm-clear",
                  "aria-label": `Clear ${A.title}`,
                  title: "Clear",
                  onClick: (P) => Y(A.key)
                }, [
                  z(h(ie), {
                    icon: "tabler:x",
                    "aria-hidden": "true"
                  })
                ], 8, AD)) : Q("", !0)
              ]))
            ], 42, hD))), 128))
          ]))
        ])
      ])),
      e.simple && (_.value || r.value) ? (N(), D("button", {
        key: 6,
        type: "button",
        class: "fm-linkbtn",
        onClick: R[1] || (R[1] = (A) => u.value = !u.value)
      }, K(u.value ? "Hide advanced mapping" : "Advanced mapping"), 1)) : _.value && !r.value ? (N(), D("button", {
        key: 7,
        type: "button",
        class: "fm-linkbtn",
        onClick: ae
      }, " Write the whole expression myself ")) : _.value && r.value ? (N(), D("button", {
        key: 8,
        type: "button",
        class: "fm-linkbtn",
        onClick: ue
      }, " Back to fields ")) : Q("", !0),
      e.simple && u.value && _.value && !r.value ? (N(), D("button", {
        key: 9,
        type: "button",
        class: "fm-linkbtn",
        onClick: ae
      }, " Edit the complete expression ")) : Q("", !0),
      e.simple && u.value && _.value && r.value ? (N(), D("button", {
        key: 10,
        type: "button",
        class: "fm-linkbtn",
        onClick: ue
      }, " Back to field mapping ")) : Q("", !0)
    ], 34));
  }
}), Xi = "The assistant couldn’t generate a mapping.", Mp = 11e4;
function Op(e) {
  if (Td(e) === 404) return "The mapping assistant isn’t available yet.";
  const t = e?.response?.data;
  return t ? En(t, e instanceof Error && e.message ? e.message : Xi) : e instanceof Error && e.message ? e.message : Xi;
}
async function OD(e, t, n, i, o = {}, r) {
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
    const { data: s } = await Vn.post(`/api/v1/workflows/${encodeURIComponent(e)}/assist/edge`, a, { timeout: Mp, signal: r });
    return s && s.success === !1 ? { error: En(s, Xi) } : s && typeof s.transform == "string" ? { transform: s.transform } : { error: "The assistant returned no mapping." };
  } catch (a) {
    return { error: Op(a) };
  }
}
async function RD(e, t, n, i, o, r, a, s = {}, l) {
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
    const { data: u } = await Vn.post(`/api/v1/workflows/${encodeURIComponent(e)}/assist/edge`, c, { timeout: Mp, signal: l });
    return u && u.success === !1 ? { error: En(u, Xi) } : u?.kind === "mapping" && typeof u.transform == "string" ? { kind: "mapping", transform: u.transform, summary: typeof u.summary == "string" ? u.summary : "" } : u?.kind === "condition" && typeof u.predicate == "string" ? { kind: "condition", predicate: u.predicate, summary: typeof u.summary == "string" ? u.summary : "" } : u?.kind === "failure_route" && typeof u.available == "boolean" && u.source_port === "failed" ? { kind: "failure_route", available: u.available, source_port: "failed", summary: typeof u.summary == "string" ? u.summary : "" } : u?.kind === "insert_node" && typeof u.block_id == "string" && typeof u.block_title == "string" ? { kind: "insert_node", block_id: u.block_id, block_title: u.block_title, summary: typeof u.summary == "string" ? u.summary : "" } : { error: "The assistant returned no usable connection preview." };
  } catch (c) {
    return { error: Op(c) };
  }
}
function DD(e) {
  return "transform" in e && typeof e.transform == "string";
}
function PD(e) {
  return "kind" in e;
}
const LD = { class: "wf-edge-route" }, VD = ["title"], zD = ["title"], BD = { class: "wf-panel-foot" }, FD = /* @__PURE__ */ ye({
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
    const n = e, i = t, o = G(""), r = G(null), a = G(0);
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
        const y = await Cd(n.workflowId, 5);
        for (const m of y) {
          const _ = await Ad(n.workflowId, m.run_id, v), x = kg(_);
          if (x != null) return x;
        }
      } catch {
      }
      return null;
    }
    async function f() {
      if (!n.edge) return;
      l();
      const v = new AbortController(), y = n.edge.id;
      s = v, r.value = { kind: "loading" };
      const m = await d(n.edge.source_id);
      if (v.signal.aborted || s !== v || n.edge.id !== y) return;
      const _ = await OD(
        n.workflowId,
        { id: n.edge.id, source_id: n.edge.source_id, target_id: n.edge.target_id, transform: o.value },
        n.edgeUpstreamSchema,
        n.edgeDownstreamSchema,
        m != null ? { upstreamSample: m } : {},
        v.signal
      );
      v.signal.aborted || s !== v || n.edge.id !== y || (s = null, DD(_) ? (o.value = _.transform, i("update-edge", { transform: _.transform }), r.value = null, a.value++) : r.value = { kind: "error", message: _.error });
    }
    function p() {
      l();
    }
    return Qe(l), (v, y) => (N(), D(le, null, [
      y[2] || (y[2] = S("div", { class: "wf-panel-hdr wf-panel-hdr--edge" }, [
        S("span", { class: "wf-panel-hdr-kind" }, "Connection")
      ], -1)),
      S("h3", LD, [
        S("span", {
          class: "wf-edge-route-name",
          title: e.sourceTitle || "Previous step"
        }, K(e.sourceTitle || "Previous step"), 9, VD),
        z(h(ie), {
          icon: "tabler:arrow-right",
          "aria-hidden": "true"
        }),
        S("span", {
          class: "wf-edge-route-name",
          title: e.targetTitle || "Next step"
        }, K(e.targetTitle || "Next step"), 9, zD)
      ]),
      y[3] || (y[3] = S("p", { class: "wf-panel-how" }, "Choose what the next step receives. Matching fields are connected automatically.", -1)),
      y[4] || (y[4] = S("div", { class: "wf-panel-label" }, "Data", -1)),
      z(MD, {
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
        onAssist: f,
        onCancelAssist: p
      }, null, 8, ["source-schema", "target-schema", "source-title", "target-title", "model-value", "reset-key", "assist-pending", "assist-error"]),
      y[5] || (y[5] = S("p", { class: "wf-panel-hint" }, "Select a field on the left, then the field it should fill on the right. Matching names need no setup.", -1)),
      S("div", BD, [
        z(h(fe), {
          severity: "danger",
          onClick: y[0] || (y[0] = (m) => i("remove-edge"))
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            }),
            y[1] || (y[1] = S("span", null, "Delete connection", -1))
          ]),
          _: 1
        })
      ])
    ], 64));
  }
}), HD = { class: "wf-panel-hdr wf-panel-hdr--note" }, qD = { class: "wf-panel-hdr-kind" }, UD = { class: "wf-sr-only" }, WD = { class: "wf-panel-foot" }, YD = /* @__PURE__ */ ye({
  __name: "NotePanel",
  props: {
    note: {}
  },
  emits: ["update-note", "remove-note"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = U(() => n.note?.kind === "frame"), r = [...Js], a = U({
      get: () => n.note?.color || "amber",
      set: (l) => i("update-note", { color: l })
    }), s = G("");
    return _e(() => n.note?.id, () => {
      s.value = n.note?.text || "";
    }, { immediate: !0 }), (l, c) => (N(), D(le, null, [
      S("div", HD, [
        S("span", qD, K(o.value ? "Frame" : "Note"), 1)
      ]),
      z(h(Ms), {
        modelValue: a.value,
        "onUpdate:modelValue": c[0] || (c[0] = (u) => a.value = u),
        class: "wf-note-colors",
        options: r,
        "option-label": "key",
        "option-value": "key",
        "aria-label": o.value ? "Frame color" : "Note color"
      }, {
        option: ne(({ option: u }) => [
          S("span", {
            class: Ie(["wf-note-color-dot", h(Qs)(u.key).replace("wf-note--", "wf-swatch--")]),
            "aria-hidden": "true"
          }, null, 2),
          S("span", UD, K(u.key), 1)
        ]),
        _: 1
      }, 8, ["modelValue", "aria-label"]),
      o.value ? (N(), D(le, { key: 0 }, [
        c[7] || (c[7] = S("div", { class: "wf-panel-label" }, "Title", -1)),
        z(h(rt), {
          modelValue: s.value,
          "onUpdate:modelValue": c[1] || (c[1] = (u) => s.value = u),
          class: "wf-input",
          placeholder: "Frame title",
          "aria-label": "Frame title",
          onChange: c[2] || (c[2] = (u) => i("update-note", { text: s.value })),
          onKeydown: c[3] || (c[3] = tt((u) => i("update-note", { text: s.value }), ["enter"]))
        }, null, 8, ["modelValue"]),
        c[8] || (c[8] = S("p", { class: "wf-panel-hint" }, "A colored background region — drag steps onto it to group them, and resize it from its corners.", -1))
      ], 64)) : (N(), D(le, { key: 1 }, [
        z(h(Os), {
          modelValue: s.value,
          "onUpdate:modelValue": c[4] || (c[4] = (u) => s.value = u),
          class: "wf-textarea",
          rows: "6",
          placeholder: "Write a note… markdown supported",
          "aria-label": "Note text",
          onChange: c[5] || (c[5] = (u) => i("update-note", { text: s.value }))
        }, null, 8, ["modelValue"]),
        c[9] || (c[9] = S("p", { class: "wf-panel-hint" }, "Markdown supported — headings, lists, links, and code.", -1))
      ], 64)),
      S("div", WD, [
        z(h(fe), {
          severity: "danger",
          onClick: c[6] || (c[6] = (u) => i("remove-note"))
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            }),
            S("span", null, "Delete " + K(o.value ? "frame" : "note"), 1)
          ]),
          _: 1
        })
      ])
    ], 64));
  }
});
function GD(e) {
  const t = og(e), n = t?.properties;
  if (!n || typeof n != "object") return;
  const i = new Set(Array.isArray(t.required) ? t.required.map(String) : []), o = {};
  for (const [r, a] of Object.entries(n)) {
    const s = a && typeof a == "object" ? { ...a } : {};
    i.has(r) && (s.required = !0), o[r] = s;
  }
  return Object.keys(o).length ? o : void 0;
}
function jD(e) {
  const t = GD(e);
  return t ? { config_schema: t } : null;
}
const XD = { class: "wf-panel" }, KD = { class: "wf-panel-hdr-kind" }, ZD = { class: "wf-panel-how" }, JD = { class: "wf-boundary-tag" }, QD = { class: "wf-panel-hint" }, eP = { class: "wf-panel-label" }, tP = {
  key: 0,
  class: "wf-panel-hint"
}, nP = {
  key: 0,
  class: "wf-panel-label"
}, oP = {
  key: 1,
  class: "wf-panel-hint"
}, iP = { class: "wf-panel-hint" }, rP = {
  key: 5,
  class: "wf-panel-foot"
}, aP = { class: "wf-panel-hint wf-panel-pinned-note" }, sP = {
  key: 6,
  class: "wf-panel-foot"
}, lP = "wc-schema-form", rd = /* @__PURE__ */ ye({
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
    const n = e, i = t, o = U(() => n.node ? bi(n.node.kind, n.node.ref) : null), r = G({});
    _e(() => [n.node?.id, n.node?.config], () => {
      r.value = { ...n.node?.config };
    }, { immediate: !0, flush: "sync" });
    function a($) {
      r.value = $, i("update-node", { config: $ });
    }
    const s = U(() => n.node?.kind === "block" && !!n.node.ref), l = U(() => n.node?.ref ? ig[n.node.ref]?.execution : void 0), c = U(() => s.value && ["function", "tool"].includes(l.value?.kind || "")), u = U(() => s.value && rg(n.node?.ref)), d = U(() => !n.node || !s.value ? null : jD(Rl(n.node.ref))), f = U(() => n.node && s.value ? ag(n.node.ref) : void 0), p = U(() => sg(d.value, "workflow-extension-node")), v = U(() => lg(d.value, "workflow-extension-node")), y = U(() => {
      const $ = v.value && typeof v.value == "object" ? v.value.properties : null;
      return $ && typeof $ == "object" && !Array.isArray($) ? Object.keys($) : [];
    }), m = U(() => Object.fromEntries(
      y.value.filter(($) => r.value[$] !== void 0).map(($) => [$, r.value[$]])
    )), _ = U(() => !!n.node && Ss(n.node.kind)), x = U(() => !!n.node && (_.value || n.node.pinned === !0 || !!n.node.boundary)), w = U(() => n.node && _.value ? ug[n.node.kind] : ""), b = U(() => {
      const $ = r.value[w.value];
      return $ && typeof $ == "object" && !Array.isArray($) ? $ : { type: "object", properties: {} };
    }), C = U(() => n.node?.kind === "start" ? "Expected input" : n.node?.kind === "finish" ? "Result" : "Error details");
    function I($) {
      w.value && a({ ...r.value, [w.value]: $ });
    }
    function B($) {
      !n.node || !$ || typeof $ != "object" || Array.isArray($) || a({ ...r.value, ...$ });
    }
    function T($) {
      if (!p.value || !$ || typeof $ != "object" || Array.isArray($)) return;
      const k = p.value.key;
      k in $ && a({ ...r.value, [k]: $[k] });
    }
    function M($) {
      if (!n.node) return;
      const k = { ...r.value };
      for (const H of y.value) delete k[H];
      Object.assign(k, $), a(k);
    }
    const V = U(() => {
      const $ = r.value.flow_ref;
      return $ && typeof $ == "object" && !Array.isArray($) ? String($.id || n.node?.ref || "") : String(n.node?.ref || "");
    });
    function O($) {
      n.node && i("update-node", {
        title: $.title,
        config: {
          flow_ref: {
            kind: "flow",
            id: $.id,
            version: $.published_version
          }
        }
      });
    }
    const E = U(() => {
      const $ = n.node?.kind;
      return $ === "branch" || $ === "cycle" || wi($) || Hi($);
    }), F = G("");
    _e(() => n.node?.id, () => {
      F.value = Je(n.node?.title, n.node?.ref);
    }, { immediate: !0 });
    function g() {
      const $ = F.value.trim();
      n.node && $ && $ !== n.node.title && i("update-node", { title: $ });
    }
    return ($, k) => (N(), D("aside", XD, [
      z(h(fe), {
        class: "wf-panel-close",
        text: "",
        rounded: "",
        severity: "secondary",
        title: "Close",
        "aria-label": "Close inspector",
        onClick: k[0] || (k[0] = (H) => i("close"))
      }, {
        default: ne(() => [
          z(h(ie), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }),
      e.node && o.value ? (N(), D(le, { key: 0 }, [
        S("div", {
          class: Ie(["wf-panel-hdr", h(xd)(o.value.hueVar)])
        }, [
          k[9] || (k[9] = S("span", { class: "wf-panel-hdr-dot" }, null, -1)),
          S("span", KD, K(o.value.label), 1)
        ], 2),
        z(h(rt), {
          modelValue: F.value,
          "onUpdate:modelValue": k[1] || (k[1] = (H) => F.value = H),
          class: "wf-panel-title-input",
          "aria-label": "Step title",
          onChange: g,
          onKeydown: tt(g, ["enter"])
        }, null, 8, ["modelValue"]),
        S("p", ZD, K(o.value.blurb), 1),
        _.value ? (N(), D(le, { key: 0 }, [
          S("div", JD, [
            z(h(ie), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            k[10] || (k[10] = S("span", null, "Workflow boundary · can’t be removed", -1))
          ]),
          z(Rs, {
            mode: "schema",
            "model-value": b.value,
            "reset-key": e.node.id,
            surface: `workflow.boundary.${e.node.kind}`,
            label: C.value,
            onChange: I
          }, null, 8, ["model-value", "reset-key", "surface", "label"]),
          S("p", QD, K(e.node.kind === "start" ? "Describe what someone provides when this Workflow starts." : e.node.kind === "finish" ? "Describe what a successful run returns." : "Describe what a failed run returns."), 1)
        ], 64)) : Q("", !0),
        s.value ? (N(), D(le, { key: 1 }, [
          f.value ? (N(), D(le, { key: 0 }, [
            k[11] || (k[11] = S("div", { class: "wf-panel-label" }, "Configuration", -1)),
            z(ai, {
              tag: f.value,
              schema: h(Rl)(e.node.ref),
              config: r.value,
              onChange: B
            }, null, 8, ["tag", "schema", "config"])
          ], 64)) : p.value ? (N(), D(le, { key: 1 }, [
            S("div", eP, K(u.value ? "Fixed input overrides" : p.value.title || "Configuration"), 1),
            u.value ? (N(), D("p", tP, " Optional fixed values override matching inputs from the connection. Leave them empty to use incoming data. ")) : Q("", !0),
            z(ai, {
              tag: p.value.tag,
              schema: p.value.schema,
              config: r.value,
              attrs: { value: r.value },
              onChange: T
            }, null, 8, ["tag", "schema", "config", "attrs"])
          ], 64)) : Q("", !0),
          !f.value && v.value ? (N(), D(le, { key: 2 }, [
            p.value ? Q("", !0) : (N(), D("div", nP, K(u.value ? "Fixed input overrides" : "Configuration"), 1)),
            u.value && !p.value ? (N(), D("p", oP, " Optional fixed values override matching inputs from the connection. Leave them empty to use incoming data. ")) : Q("", !0),
            z(Ap, {
              "workflow-id": e.workflowId,
              "reset-key": e.node.id,
              "config-schema": v.value,
              "current-config": m.value,
              "upstream-schema": e.nodeUpstreamSchema,
              onAccept: M,
              onUndo: M
            }, null, 8, ["workflow-id", "reset-key", "config-schema", "current-config", "upstream-schema"]),
            z(ai, {
              tag: lP,
              schema: v.value,
              config: r.value,
              onChange: B
            }, null, 8, ["schema", "config"])
          ], 64)) : Q("", !0)
        ], 64)) : Q("", !0),
        e.node && c.value && l.value ? (N(), re(oR, {
          key: e.node.id,
          node: e.node,
          execution: l.value,
          onUpdateNode: k[2] || (k[2] = (H) => i("update-node", H))
        }, null, 8, ["node", "execution"])) : Q("", !0),
        h($d)(e.node.kind) ? (N(), D(le, { key: 3 }, [
          k[12] || (k[12] = S("div", { class: "wf-panel-label" }, "Workflow", -1)),
          z(FO, {
            "workflow-id": n.workflowId,
            "selected-id": V.value,
            "upstream-schema": n.nodeUpstreamSchema,
            onSelect: O
          }, null, 8, ["workflow-id", "selected-id", "upstream-schema"]),
          S("p", iP, K(h(hR)), 1)
        ], 64)) : Q("", !0),
        E.value ? (N(), re(UR, {
          key: 4,
          "workflow-id": e.workflowId,
          node: e.node,
          "upstream-schema": e.nodeUpstreamSchema,
          "combine-branch-conflict": e.combineBranchConflict,
          onUpdateNode: k[3] || (k[3] = (H) => i("update-node", H))
        }, null, 8, ["workflow-id", "node", "upstream-schema", "combine-branch-conflict"])) : Q("", !0),
        x.value ? (N(), D("div", rP, [
          S("p", aP, [
            z(h(ie), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            k[13] || (k[13] = S("span", null, "This step is required and can’t be deleted.", -1))
          ])
        ])) : (N(), D("div", sP, [
          z(h(fe), {
            severity: "danger",
            onClick: k[4] || (k[4] = (H) => i("remove-node"))
          }, {
            default: ne(() => [
              z(h(ie), {
                icon: "tabler:trash",
                "aria-hidden": "true"
              }),
              k[14] || (k[14] = S("span", null, "Delete step", -1))
            ]),
            _: 1
          })
        ]))
      ], 64)) : e.edge ? (N(), re(FD, {
        key: 1,
        "workflow-id": n.workflowId,
        edge: e.edge,
        "edge-upstream-schema": e.edgeUpstreamSchema,
        "edge-downstream-schema": e.edgeDownstreamSchema,
        "source-title": e.edgeSourceTitle,
        "target-title": e.edgeTargetTitle,
        onUpdateEdge: k[5] || (k[5] = (H) => i("update-edge", H)),
        onRemoveEdge: k[6] || (k[6] = (H) => i("remove-edge"))
      }, null, 8, ["workflow-id", "edge", "edge-upstream-schema", "edge-downstream-schema", "source-title", "target-title"])) : e.note ? (N(), re(YD, {
        key: 2,
        note: e.note,
        onUpdateNote: k[7] || (k[7] = (H) => i("update-note", H)),
        onRemoveNote: k[8] || (k[8] = (H) => i("remove-note"))
      }, null, 8, ["note"])) : Q("", !0)
    ]));
  }
}), uP = {
  key: 0,
  class: "wf-sim-field"
}, cP = {
  key: 1,
  class: "wf-sim-note"
}, dP = /* @__PURE__ */ ye({
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
    return (o, r) => (N(), re(h(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      header: "Run with input",
      class: "wf-sim-pop",
      "onUpdate:visible": i
    }, {
      footer: ne(() => [
        z(h(fe), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: r[2] || (r[2] = (a) => n("close"))
        }),
        z(h(fe), {
          disabled: !e.canRun,
          onClick: r[3] || (r[3] = (a) => n("run"))
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:player-play",
              "aria-hidden": "true"
            }),
            r[6] || (r[6] = S("span", null, "Run", -1))
          ]),
          _: 1
        }, 8, ["disabled"])
      ]),
      default: ne(() => [
        r[7] || (r[7] = S("p", { class: "wf-sim-hint" }, "Try this Workflow with the input below. It checks the expected input and does not publish your changes.", -1)),
        e.hasFields ? (N(), D("div", uP, [
          r[4] || (r[4] = S("span", { class: "wf-sim-label" }, "Input", -1)),
          z(Rs, {
            mode: "value",
            schema: e.schema,
            "model-value": e.modelValue,
            "reset-key": e.resetKey,
            rows: 7,
            placeholder: '{ "key": "value" }',
            "onUpdate:modelValue": r[0] || (r[0] = (a) => n("update:modelValue", a)),
            onValid: r[1] || (r[1] = (a) => n("valid", a))
          }, null, 8, ["schema", "model-value", "reset-key"])
        ])) : (N(), D("p", cP, "This Workflow needs no input.")),
        e.valid ? Q("", !0) : (N(), re(h(Fe), {
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
        e.errorMessage ? (N(), re(h(Fe), {
          key: 3,
          class: "wf-sim-err",
          severity: "error",
          closable: !1
        }, {
          default: ne(() => [
            ce(K(e.errorMessage), 1)
          ]),
          _: 1
        })) : Q("", !0)
      ]),
      _: 1
    }));
  }
});
function Rp(e) {
  const t = G(null);
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
const ad = "Mapped automatically", Ba = "Mapped automatically — view", fP = "Click to open the full mapper.";
function hP(e) {
  return `Mapped ${e} field${e === 1 ? "" : "s"} by name and type.`;
}
const pP = "What should flow here?", sd = "e.g. use the first search result’s link", vP = "Describe what should happen — mapping, branching and failure routes are previewed before anything changes.", mP = "Draft", gP = "Drafting from your description — this can take up to a minute.", yP = "Here’s the mapping I drafted", wP = "Apply", ld = "Open mapper", ud = "Redraft", cd = "Dismiss", dd = "I couldn’t draft that connection — edit your description and try again, or open the mapper to continue by hand.", bP = "The connection stays — it needs a mapping before this Workflow can run.", _P = { class: "wf-intent-hd" }, kP = {
  key: 0,
  class: "wf-intent-needs"
}, EP = {
  key: 1,
  class: "wf-intent-note"
}, xP = {
  key: 2,
  class: "wf-intent-help"
}, $P = { class: "wf-intent-foot" }, SP = { class: "wf-intent-hd" }, CP = {
  key: 0,
  class: "wf-intent-summary"
}, NP = {
  key: 1,
  class: "wf-intent-rows"
}, IP = { class: "wf-intent-src" }, AP = { class: "wf-intent-tgt" }, TP = {
  key: 1,
  class: "wf-intent-raw"
}, MP = {
  key: 2,
  class: "wf-intent-topology"
}, OP = { class: "wf-intent-step" }, RP = { class: "wf-intent-raw" }, DP = {
  key: 3,
  class: "wf-intent-topology"
}, PP = {
  key: 4,
  class: "wf-intent-topology"
}, LP = { class: "wf-intent-step" }, VP = { class: "wf-intent-foot" }, zP = { class: "wf-intent-hd wf-intent-hd--err" }, BP = { class: "wf-intent-help" }, FP = { class: "wf-intent-foot" }, HP = /* @__PURE__ */ ye({
  __name: "EdgeIntentPopover",
  props: {
    workflowId: {},
    edge: {},
    availableSteps: {}
  },
  emits: ["accept", "suggest-node", "open-mapper", "dismiss", "measure"],
  setup(e, { emit: t }) {
    const n = e, i = t, { overlayEl: o } = Rp((C) => i("measure", C)), r = G("intent"), a = G(""), s = G(null), l = G(""), c = G(null);
    let u = null;
    function d() {
      const C = c.value?.$el;
      C instanceof HTMLInputElement && C.focus();
    }
    Ue(() => Ve(d));
    function f() {
      u?.abort(), u = null, r.value = "intent", a.value = "", s.value = null, l.value = "", Ve(d);
    }
    _e(() => n.edge.id, f), Qe(() => u?.abort());
    const p = U(() => n.edge.unresolved.map((C) => C.title).filter(Boolean)), v = U(() => {
      const C = s.value?.kind === "mapping" ? s.value.transform : "", I = Sh(C);
      return I && I.length ? I : null;
    }), y = U(() => s.value?.kind === "condition" ? "Add a Condition?" : s.value?.kind === "failure_route" ? "Use the Failed route?" : s.value?.kind === "insert_node" ? "Suggested step" : yP), m = U(() => s.value?.kind === "condition" ? "tabler:arrows-split-2" : s.value?.kind === "failure_route" ? "tabler:route-x-2" : s.value?.kind === "insert_node" ? "tabler:box-padding" : "tabler:sparkles"), _ = U(() => s.value?.kind === "condition" ? "Add Condition" : s.value?.kind === "failure_route" ? "Use Failed route" : s.value?.kind === "insert_node" ? "Show in palette" : wP);
    async function x() {
      const C = a.value.trim();
      if (!C || r.value === "drafting") return;
      u?.abort();
      const I = new AbortController(), B = n.edge.id;
      u = I, r.value = "drafting", l.value = "";
      const T = await RD(
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
      I.signal.aborted || u !== I || n.edge.id !== B || (u = null, PD(T) ? (s.value = T, r.value = "preview") : (l.value = T.error || dd, r.value = "error"));
    }
    function w() {
      const C = s.value;
      C && (C.kind === "insert_node" ? i("suggest-node", C.block_id) : (C.kind !== "failure_route" || C.available) && i("accept", C));
    }
    function b() {
      r.value = "intent", Ve(d);
    }
    return (C, I) => (N(), D("div", {
      ref_key: "overlayEl",
      ref: o,
      class: "wf-intent",
      role: "region",
      "aria-label": "Describe this connection",
      onKeydown: I[6] || (I[6] = tt(He((B) => i("dismiss"), ["stop", "prevent"]), ["esc"])),
      onPointerdown: I[7] || (I[7] = He(() => {
      }, ["stop"]))
    }, [
      z(h(fe), {
        class: "wf-intent-x",
        text: "",
        rounded: "",
        severity: "secondary",
        "aria-label": "Dismiss",
        title: h(cd),
        onClick: I[0] || (I[0] = (B) => i("dismiss"))
      }, {
        default: ne(() => [
          z(h(ie), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }, 8, ["title"]),
      r.value === "intent" || r.value === "drafting" ? (N(), D(le, { key: 0 }, [
        S("div", _P, [
          z(h(ie), {
            icon: "tabler:wand",
            "aria-hidden": "true"
          }),
          S("span", null, K(h(pP)), 1)
        ]),
        p.value.length ? (N(), D("p", kP, [
          I[8] || (I[8] = ce("Needs ", -1)),
          S("strong", null, K(p.value.join(", ")), 1),
          I[9] || (I[9] = ce(".", -1))
        ])) : Q("", !0),
        z(h(rt), {
          ref_key: "inputEl",
          ref: c,
          modelValue: a.value,
          "onUpdate:modelValue": I[1] || (I[1] = (B) => a.value = B),
          class: "wf-intent-input",
          placeholder: h(sd),
          disabled: r.value === "drafting",
          "aria-label": "What should flow across this connection",
          onKeydown: tt(He(x, ["prevent"]), ["enter"])
        }, null, 8, ["modelValue", "placeholder", "disabled", "onKeydown"]),
        r.value === "drafting" ? (N(), D("p", EP, [
          z(h(dt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Drafting connection"
          }),
          ce(" " + K(h(gP)), 1)
        ])) : (N(), D("p", xP, K(h(vP)), 1)),
        S("div", $P, [
          z(h(fe), {
            severity: "secondary",
            outlined: "",
            onClick: I[2] || (I[2] = (B) => i("dismiss"))
          }, {
            default: ne(() => [
              ce(K(h(cd)), 1)
            ]),
            _: 1
          }),
          z(h(fe), {
            class: "wf-intent-submit",
            disabled: !a.value.trim() || r.value === "drafting",
            loading: r.value === "drafting",
            onClick: x
          }, {
            default: ne(() => [
              r.value !== "drafting" ? (N(), re(h(ie), {
                key: 0,
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              })) : Q("", !0),
              S("span", null, K(h(mP)), 1)
            ]),
            _: 1
          }, 8, ["disabled", "loading"])
        ])
      ], 64)) : r.value === "preview" ? (N(), D(le, { key: 1 }, [
        S("div", SP, [
          z(h(ie), {
            icon: m.value,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          S("span", null, K(y.value), 1)
        ]),
        s.value?.summary ? (N(), D("p", CP, K(s.value.summary), 1)) : Q("", !0),
        s.value?.kind === "mapping" ? (N(), D("div", NP, [
          v.value && v.value.length ? (N(!0), D(le, { key: 0 }, Re(v.value, (B) => (N(), D("div", {
            key: B.key,
            class: "wf-intent-row"
          }, [
            S("code", IP, K(B.rhs), 1),
            z(h(ie), {
              icon: "tabler:arrow-right",
              "aria-hidden": "true"
            }),
            S("code", AP, K(B.key), 1)
          ]))), 128)) : (N(), D("code", TP, K(s.value.transform), 1))
        ])) : s.value?.kind === "condition" ? (N(), D("div", MP, [
          S("span", OP, [
            z(h(ie), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            I[10] || (I[10] = ce("Condition", -1))
          ]),
          S("code", RP, K(s.value.predicate), 1),
          I[11] || (I[11] = S("p", { class: "wf-intent-help" }, "The current connection becomes the True path. The False path stays visible for you to connect.", -1))
        ])) : s.value?.kind === "failure_route" ? (N(), D("div", DP, [
          S("span", {
            class: Ie(["wf-intent-step", !s.value.available && "is-unavailable"])
          }, [
            z(h(ie), {
              icon: "tabler:route-x-2",
              "aria-hidden": "true"
            }),
            I[12] || (I[12] = ce("Failed", -1))
          ], 2),
          s.value.available ? Q("", !0) : (N(), re(h(Fe), {
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
        ])) : s.value?.kind === "insert_node" ? (N(), D("div", PP, [
          S("span", LP, [
            z(h(ie), {
              icon: "tabler:box-padding",
              "aria-hidden": "true"
            }),
            ce(K(s.value.block_title), 1)
          ]),
          I[14] || (I[14] = S("p", { class: "wf-intent-help" }, "This is an existing Workflow step. Choose it from the palette before the graph changes.", -1))
        ])) : Q("", !0),
        S("div", VP, [
          z(h(fe), {
            severity: "secondary",
            outlined: "",
            onClick: b
          }, {
            default: ne(() => [
              ce(K(h(ud)), 1)
            ]),
            _: 1
          }),
          s.value?.kind === "mapping" ? (N(), re(h(fe), {
            key: 0,
            severity: "secondary",
            outlined: "",
            onClick: I[3] || (I[3] = (B) => i("open-mapper"))
          }, {
            default: ne(() => [
              ce(K(h(ld)), 1)
            ]),
            _: 1
          })) : Q("", !0),
          z(h(fe), {
            class: "wf-intent-submit",
            disabled: s.value?.kind === "failure_route" && !s.value.available,
            onClick: w
          }, {
            default: ne(() => [
              z(h(ie), {
                icon: "tabler:check",
                "aria-hidden": "true"
              }),
              S("span", null, K(_.value), 1)
            ]),
            _: 1
          }, 8, ["disabled"])
        ])
      ], 64)) : (N(), D(le, { key: 2 }, [
        S("div", zP, [
          z(h(ie), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          I[15] || (I[15] = S("span", null, "Couldn’t draft that", -1))
        ]),
        z(h(Fe), {
          class: "wf-intent-err",
          severity: "error",
          closable: !1
        }, {
          default: ne(() => [
            ce(K(l.value || h(dd)), 1)
          ]),
          _: 1
        }),
        z(h(rt), {
          ref_key: "inputEl",
          ref: c,
          modelValue: a.value,
          "onUpdate:modelValue": I[4] || (I[4] = (B) => a.value = B),
          class: "wf-intent-input",
          placeholder: h(sd),
          "aria-label": "What should flow across this connection",
          onKeydown: tt(He(x, ["prevent"]), ["enter"])
        }, null, 8, ["modelValue", "placeholder", "onKeydown"]),
        S("p", BP, K(h(bP)), 1),
        S("div", FP, [
          z(h(fe), {
            severity: "secondary",
            outlined: "",
            onClick: I[5] || (I[5] = (B) => i("open-mapper"))
          }, {
            default: ne(() => [
              ce(K(h(ld)), 1)
            ]),
            _: 1
          }),
          z(h(fe), {
            class: "wf-intent-submit",
            disabled: !a.value.trim(),
            onClick: x
          }, {
            default: ne(() => [
              z(h(ie), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              }),
              S("span", null, K(h(ud)), 1)
            ]),
            _: 1
          }, 8, ["disabled"])
        ])
      ], 64))
    ], 544));
  }
}), qP = { class: "wf-automap-hd" }, UP = { class: "wf-automap-title" }, WP = { class: "wf-automap-count" }, YP = { class: "wf-automap-pairs" }, GP = ["title"], jP = { class: "wf-automap-src" }, XP = { class: "wf-automap-tgt" }, KP = { class: "wf-automap-hint" }, ZP = { class: "wf-automap-tracelbl" }, JP = {
  key: 0,
  class: "wf-automap-why"
}, QP = 2600, e3 = 1200, t3 = /* @__PURE__ */ ye({
  __name: "AutoMapReveal",
  props: {
    entry: {}
  },
  emits: ["open", "dismiss", "measure"],
  setup(e, { emit: t }) {
    const n = e, i = t, { overlayEl: o } = Rp((p) => i("measure", p)), r = G("reveal"), a = G(!1);
    let s = null;
    const l = U(() => n.entry.result.fields), c = U(() => hP(l.value.length));
    function u(p) {
      s && clearTimeout(s), s = setTimeout(() => {
        r.value = "trace";
      }, p);
    }
    function d() {
      s && (clearTimeout(s), s = null);
    }
    function f() {
      r.value === "reveal" && u(e3);
    }
    return Ue(() => u(QP)), Qe(() => {
      s && clearTimeout(s);
    }), (p, v) => (N(), D("div", {
      ref_key: "overlayEl",
      ref: o,
      class: "wf-automap",
      onPointerdown: v[7] || (v[7] = He(() => {
      }, ["stop"]))
    }, [
      r.value === "reveal" ? (N(), re(h(fe), {
        key: 0,
        class: "wf-automap-card",
        severity: "secondary",
        outlined: "",
        "aria-label": `${h(ad)}. ${c.value}. Open mapping`,
        onMouseenter: d,
        onMouseleave: f,
        onClick: v[0] || (v[0] = (y) => i("open", e.entry.id))
      }, {
        default: ne(() => [
          S("span", qP, [
            z(h(ie), {
              icon: "tabler:wand",
              "aria-hidden": "true"
            }),
            S("span", UP, K(h(ad)), 1),
            S("span", WP, K(c.value), 1)
          ]),
          S("span", YP, [
            (N(!0), D(le, null, Re(l.value, (y) => (N(), D("span", {
              key: y.key,
              class: "wf-automap-pair",
              title: y.why
            }, [
              S("code", jP, K(y.sourceName), 1),
              z(h(ie), {
                icon: "tabler:arrow-right",
                "aria-hidden": "true"
              }),
              S("code", XP, K(y.title), 1)
            ], 8, GP))), 128))
          ]),
          S("span", KP, K(h(fP)), 1)
        ]),
        _: 1
      }, 8, ["aria-label"])) : (N(), D("div", {
        key: 1,
        class: Ie(["wf-automap-trace", { "is-open": a.value }]),
        onMouseenter: v[3] || (v[3] = (y) => a.value = !0),
        onMouseleave: v[4] || (v[4] = (y) => a.value = !1),
        onFocusin: v[5] || (v[5] = (y) => a.value = !0),
        onFocusout: v[6] || (v[6] = (y) => a.value = !1)
      }, [
        z(h(fe), {
          class: "wf-automap-tracebtn",
          text: "",
          rounded: "",
          severity: "secondary",
          "aria-label": h(Ba),
          title: h(Ba),
          onClick: v[1] || (v[1] = (y) => i("open", e.entry.id))
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:wand",
              "aria-hidden": "true"
            }),
            S("span", ZP, K(h(Ba)), 1)
          ]),
          _: 1
        }, 8, ["aria-label", "title"]),
        z(h(fe), {
          class: "wf-automap-tracex",
          text: "",
          rounded: "",
          severity: "secondary",
          "aria-label": "Dismiss automatic mapping explanation",
          onClick: v[2] || (v[2] = (y) => i("dismiss", e.entry.id))
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }),
        a.value ? (N(), D("div", JP, [
          (N(!0), D(le, null, Re(l.value, (y) => (N(), D("p", {
            key: y.key,
            class: "wf-automap-whyline"
          }, K(y.why), 1))), 128))
        ])) : Q("", !0)
      ], 34))
    ], 544));
  }
}), n3 = { class: "wf-top" }, o3 = { class: "wf-top-count" }, i3 = { class: "wf-toolbar-menu-wrap" }, r3 = ["disabled"], a3 = ["aria-pressed"], s3 = { class: "wf-toolbar-menu-wrap" }, l3 = ["disabled"], u3 = /* @__PURE__ */ ye({
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
    const n = e, i = U(() => Qh(n.publishedVersion)), o = U(() => i.value ? "Choose when this Workflow runs" : hs), r = U(() => i.value ? "Add trigger" : `Add trigger unavailable. ${hs}.`), a = t;
    function s(x) {
      return x.currentTarget instanceof HTMLElement ? x.currentTarget : null;
    }
    function l() {
      const x = G(!1), w = G(null), b = G(null);
      async function C() {
        x.value = !x.value, x.value && (await Ve(), b.value?.querySelector("button:not(:disabled)")?.focus());
      }
      function I(M = !1) {
        x.value && (x.value = !1, M && Ve(() => w.value?.focus()));
      }
      async function B(M) {
        x.value = !1, await Ve(), w.value?.focus(), M();
      }
      function T(M) {
        if (M.key === "Escape") {
          M.preventDefault(), I(!0);
          return;
        }
        if (M.key !== "ArrowDown" && M.key !== "ArrowUp" && M.key !== "Home" && M.key !== "End") return;
        const V = Array.from(b.value?.querySelectorAll("button:not(:disabled)") || []);
        if (!V.length) return;
        M.preventDefault();
        const O = V.indexOf(document.activeElement), E = M.key === "Home" ? 0 : M.key === "End" ? V.length - 1 : M.key === "ArrowDown" ? (O + 1 + V.length) % V.length : (O - 1 + V.length) % V.length;
        V[E].focus();
      }
      return { open: x, button: w, menu: b, toggle: C, close: I, choose: B, onKeydown: T };
    }
    const c = l(), u = l();
    async function d() {
      u.close(), await c.toggle();
    }
    async function f() {
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
    function y(x) {
      c.menu.value = p(x);
    }
    function m(x) {
      u.button.value = p(x);
    }
    function _(x) {
      u.menu.value = p(x);
    }
    return (x, w) => (N(), D("header", n3, [
      z(h(fe), {
        text: "",
        rounded: "",
        title: "Back to Workflows",
        "aria-label": "Back to Workflows",
        onClick: w[0] || (w[0] = (b) => a("back"))
      }, {
        default: ne(() => [
          z(h(ie), {
            icon: "tabler:arrow-left",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }),
      S("span", o3, K(e.countLabel), 1),
      w[31] || (w[31] = S("div", { class: "wf-top-spacer" }, null, -1)),
      z(h(Dg), { class: "wf-edit-actions" }, {
        default: ne(() => [
          z(h(fe), {
            severity: "secondary",
            outlined: "",
            disabled: !e.canUndo || e.viewingRun,
            title: "Undo (⌘Z)",
            "aria-label": "Undo",
            onClick: w[1] || (w[1] = (b) => a("undo"))
          }, {
            default: ne(() => [
              z(h(ie), {
                icon: "tabler:arrow-back-up",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }, 8, ["disabled"]),
          z(h(fe), {
            severity: "secondary",
            outlined: "",
            disabled: !e.canRedo || e.viewingRun,
            title: "Redo (⌘⇧Z)",
            "aria-label": "Redo",
            onClick: w[2] || (w[2] = (b) => a("redo"))
          }, {
            default: ne(() => [
              z(h(ie), {
                icon: "tabler:arrow-forward-up",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }, 8, ["disabled"]),
          z(h(fe), {
            severity: "secondary",
            outlined: "",
            disabled: e.viewingRun,
            title: "Edit connections",
            "aria-label": "Edit connections",
            onClick: w[3] || (w[3] = (b) => a("edit-connections", s(b)))
          }, {
            default: ne(() => [
              z(h(ie), {
                icon: "tabler:arrows-join-2",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }, 8, ["disabled"])
        ]),
        _: 1
      }),
      w[32] || (w[32] = S("span", { class: "wf-vsep" }, null, -1)),
      S("div", i3, [
        z(h(fe), {
          ref: v,
          class: "wf-toolbar-compactable",
          severity: "secondary",
          outlined: !h(c).open.value,
          title: "View controls",
          "aria-label": "View controls",
          "aria-haspopup": "menu",
          "aria-expanded": h(c).open.value,
          onClick: d
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            w[20] || (w[20] = S("span", null, "View", -1))
          ]),
          _: 1
        }, 8, ["outlined", "aria-expanded"]),
        h(c).open.value ? (N(), D("div", {
          key: 0,
          class: "wf-toolbar-menu-backdrop",
          onClick: w[4] || (w[4] = (b) => h(c).close())
        })) : Q("", !0),
        h(c).open.value ? (N(), D("div", {
          key: 1,
          ref: y,
          class: "wf-toolbar-menu",
          role: "menu",
          "aria-label": "View controls",
          onKeydown: w[9] || (w[9] = //@ts-ignore
          (...b) => h(c).onKeydown && h(c).onKeydown(...b))
        }, [
          S("button", {
            role: "menuitem",
            onClick: w[5] || (w[5] = (b) => h(c).choose(() => a("fit")))
          }, [
            z(h(ie), {
              icon: "tabler:maximize",
              "aria-hidden": "true"
            }),
            w[21] || (w[21] = ce("Fit view", -1))
          ]),
          S("button", {
            role: "menuitem",
            disabled: e.viewingRun,
            onClick: w[6] || (w[6] = (b) => h(c).choose(() => a("auto-layout")))
          }, [
            z(h(ie), {
              icon: "tabler:layout-distribute-vertical",
              "aria-hidden": "true"
            }),
            w[22] || (w[22] = ce("Auto layout", -1))
          ], 8, r3),
          S("button", {
            role: "menuitem",
            onClick: w[7] || (w[7] = (b) => h(c).choose(() => a("toggle-direction")))
          }, [
            z(h(ie), {
              icon: e.layoutDir === "TB" ? "tabler:arrow-right" : "tabler:arrow-down",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ce("Lay out " + K(e.layoutDir === "TB" ? "left to right" : "top to bottom"), 1)
          ]),
          w[23] || (w[23] = S("span", {
            class: "wf-toolbar-menu-sep",
            role: "separator"
          }, null, -1)),
          S("button", {
            role: "menuitem",
            "data-testid": "palette-toggle",
            "aria-pressed": e.paletteOpen,
            onClick: w[8] || (w[8] = (b) => h(c).choose(() => a("toggle-palette")))
          }, [
            z(h(ie), {
              icon: e.paletteOpen ? "tabler:layout-sidebar-left-collapse" : "tabler:layout-sidebar-left-expand",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ce(K(e.paletteOpen ? "Hide steps" : "Show steps"), 1)
          ], 8, a3)
        ], 544)) : Q("", !0)
      ]),
      z(h(fe), {
        class: "wf-toolbar-compactable",
        severity: "secondary",
        outlined: !(e.runsOpen || e.viewingRun),
        title: "Past runs",
        "aria-label": "Past runs",
        onClick: w[10] || (w[10] = (b) => a("toggle-runs", s(b)))
      }, {
        default: ne(() => [
          z(h(ie), {
            icon: "tabler:history",
            "aria-hidden": "true"
          }),
          w[24] || (w[24] = S("span", null, "Past runs", -1))
        ]),
        _: 1
      }, 8, ["outlined"]),
      z(h(fe), {
        class: "wf-toolbar-compactable",
        severity: "secondary",
        outlined: !e.historyOpen,
        title: "Version history",
        "aria-label": "Versions",
        onClick: w[11] || (w[11] = (b) => a("toggle-history", s(b)))
      }, {
        default: ne(() => [
          z(h(ie), {
            icon: "tabler:versions",
            "aria-hidden": "true"
          }),
          w[25] || (w[25] = S("span", null, "Versions", -1))
        ]),
        _: 1
      }, 8, ["outlined"]),
      w[33] || (w[33] = S("span", { class: "wf-vsep" }, null, -1)),
      z(h(fe), {
        class: "wf-toolbar-compactable",
        severity: "secondary",
        outlined: "",
        disabled: !i.value,
        title: o.value,
        "aria-label": r.value,
        onClick: w[12] || (w[12] = (b) => a("add-trigger", s(b)))
      }, {
        default: ne(() => [
          z(h(ie), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          }),
          w[26] || (w[26] = S("span", null, "Add trigger", -1))
        ]),
        _: 1
      }, 8, ["disabled", "title", "aria-label"]),
      w[34] || (w[34] = S("div", { class: "wf-top-spacer" }, null, -1)),
      z(h(fe), {
        severity: e.runActive ? "danger" : void 0,
        disabled: e.simBusy,
        loading: e.simBusy,
        title: e.runActive ? "Stop the running workflow" : "Run with an input",
        onClick: w[13] || (w[13] = (b) => a("run", s(b)))
      }, {
        default: ne(() => [
          e.simBusy ? Q("", !0) : (N(), re(h(ie), {
            key: 0,
            icon: e.runActive ? "tabler:player-stop" : "tabler:player-play",
            "aria-hidden": "true"
          }, null, 8, ["icon"])),
          S("span", null, K(e.runActive ? "Stop" : "Run"), 1)
        ]),
        _: 1
      }, 8, ["severity", "disabled", "loading", "title"]),
      z(h(fe), {
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
      S("div", s3, [
        z(h(fe), {
          ref: m,
          text: "",
          rounded: "",
          severity: h(u).open.value ? void 0 : "secondary",
          title: "More workflow actions",
          "aria-label": "More workflow actions",
          "aria-haspopup": "menu",
          "aria-expanded": h(u).open.value,
          onClick: f
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:dots",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["severity", "aria-expanded"]),
        h(u).open.value ? (N(), D("div", {
          key: 0,
          class: "wf-toolbar-menu-backdrop",
          onClick: w[15] || (w[15] = (b) => h(u).close())
        })) : Q("", !0),
        h(u).open.value ? (N(), D("div", {
          key: 1,
          ref: _,
          class: "wf-toolbar-menu",
          role: "menu",
          "aria-label": "More workflow actions",
          onKeydown: w[18] || (w[18] = //@ts-ignore
          (...b) => h(u).onKeydown && h(u).onKeydown(...b))
        }, [
          S("button", {
            role: "menuitem",
            onClick: w[16] || (w[16] = (b) => h(u).choose(() => a("share", h(u).button.value)))
          }, [
            z(h(ie), {
              icon: "tabler:share",
              "aria-hidden": "true"
            }),
            w[28] || (w[28] = ce("Share", -1))
          ]),
          S("button", {
            role: "menuitem",
            disabled: !e.publishedVersion || e.exportBusy,
            onClick: w[17] || (w[17] = (b) => h(u).choose(() => a("export")))
          }, [
            z(h(ie), {
              icon: "tabler:download",
              "aria-hidden": "true"
            }),
            w[29] || (w[29] = ce("Export", -1))
          ], 8, l3)
        ], 544)) : Q("", !0)
      ]),
      z(h(fe), {
        severity: "secondary",
        outlined: "",
        disabled: e.publishBusy,
        loading: e.publishBusy,
        title: "Publish this workflow",
        onClick: w[19] || (w[19] = (b) => a("publish"))
      }, {
        default: ne(() => [
          e.publishBusy ? Q("", !0) : (N(), re(h(ie), {
            key: 0,
            icon: "tabler:rocket",
            "aria-hidden": "true"
          })),
          w[30] || (w[30] = S("span", null, "Publish", -1))
        ]),
        _: 1
      }, 8, ["disabled", "loading"])
    ]));
  }
}), c3 = { class: "kx-modal-head-icon" }, d3 = { class: "kx-modal-body" }, f3 = {
  class: "wf-connections-form",
  "aria-describedby": "wf-connection-help"
}, h3 = { class: "wf-connections-field" }, p3 = {
  key: 0,
  id: "wf-connection-source-error",
  role: "alert"
}, v3 = { class: "wf-connections-field" }, m3 = {
  key: 0,
  id: "wf-connection-target-error",
  role: "alert"
}, g3 = {
  class: "wf-connections-existing",
  "aria-labelledby": "wf-connections-existing-title"
}, y3 = { key: 1 }, w3 = /* @__PURE__ */ ye({
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
    }, r = G(null), a = G(null), s = G(!1), l = U(() => n.sources.find((y) => y.key === r.value)), c = U(() => n.targets.filter((y) => y.nodeId !== l.value?.nodeId)), u = U(() => s.value && !l.value), d = U(() => s.value && !a.value);
    _e(r, () => {
      c.value.some((y) => y.nodeId === a.value) || (a.value = null);
    });
    function f(y) {
      y || i("close");
    }
    function p(y) {
      y.composedPath().find((_) => _ instanceof HTMLElement && _.getAttribute("role") === "combobox")?.getAttribute("aria-expanded") !== "true" && i("close");
    }
    function v() {
      s.value = !0;
      const y = l.value;
      !y || !a.value || (i("create", {
        source: y.nodeId,
        sourceHandle: y.handle,
        target: a.value,
        targetHandle: n.targetHandle
      }), i("close"));
    }
    return (y, m) => (N(), re(h(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      class: "kx-modal wf-connections-modal",
      pt: o,
      "aria-label": "Edit connections",
      "aria-labelledby": null,
      "onUpdate:visible": f,
      onKeydownCapture: tt(p, ["esc"])
    }, {
      header: ne(() => [
        S("span", c3, [
          z(h(ie), {
            icon: "tabler:arrows-join-2",
            "aria-hidden": "true"
          })
        ]),
        m[3] || (m[3] = S("div", { class: "kx-modal-head-text" }, [
          S("div", { class: "kx-modal-head-title" }, "Edit connections"),
          S("div", {
            id: "wf-connection-help",
            class: "kx-modal-head-sub"
          }, " Create a connection without dragging on the canvas, or remove an existing connection below. ")
        ], -1))
      ]),
      footer: ne(() => [
        z(h(fe), {
          severity: "secondary",
          text: "",
          onClick: m[2] || (m[2] = (_) => i("close"))
        }, {
          default: ne(() => [...m[8] || (m[8] = [
            ce("Close", -1)
          ])]),
          _: 1
        }),
        z(h(fe), {
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
        S("div", d3, [
          S("div", f3, [
            S("div", h3, [
              m[4] || (m[4] = S("label", { for: "wf-connection-source" }, [
                ce("From "),
                S("span", { "aria-hidden": "true" }, "*")
              ], -1)),
              z(h(St), {
                modelValue: r.value,
                "onUpdate:modelValue": m[0] || (m[0] = (_) => r.value = _),
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
              u.value ? (N(), D("small", p3, "Choose a source step and output.")) : Q("", !0)
            ]),
            S("div", v3, [
              m[5] || (m[5] = S("label", { for: "wf-connection-target" }, [
                ce("To "),
                S("span", { "aria-hidden": "true" }, "*")
              ], -1)),
              z(h(St), {
                modelValue: a.value,
                "onUpdate:modelValue": m[1] || (m[1] = (_) => a.value = _),
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
              d.value ? (N(), D("small", m3, "Choose a destination step.")) : Q("", !0)
            ])
          ]),
          S("section", g3, [
            m[7] || (m[7] = S("h3", { id: "wf-connections-existing-title" }, "Existing connections", -1)),
            e.edges.length ? (N(), D("ul", y3, [
              (N(!0), D(le, null, Re(e.edges, (_) => (N(), D("li", {
                key: _.id
              }, [
                S("span", null, K(_.label), 1),
                z(h(fe), {
                  text: "",
                  rounded: "",
                  severity: "danger",
                  disabled: e.disabled,
                  "aria-label": `Delete ${_.label}`,
                  title: "Delete connection",
                  onClick: (x) => i("remove", _.id)
                }, {
                  default: ne(() => [
                    z(h(ie), {
                      icon: "tabler:trash",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }, 8, ["disabled", "aria-label", "onClick"])
              ]))), 128))
            ])) : (N(), re(h(Fe), {
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
}), b3 = { class: "wf-drop-search" }, _3 = {
  class: "wf-drop-list",
  role: "listbox"
}, k3 = ["aria-selected", "onMouseenter", "onClick"], E3 = { class: "wf-drop-title" }, x3 = { class: "wf-drop-cat" }, $3 = {
  key: 0,
  class: "wf-drop-empty"
}, S3 = /* @__PURE__ */ ye({
  __name: "ConnectDropPicker",
  props: {
    items: {},
    x: {},
    y: {}
  },
  emits: ["pick", "close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = G(""), r = G(0), a = G(null), s = U(() => {
      const d = o.value.trim().toLowerCase();
      return (d ? n.items.filter((p) => `${p.title} ${p.subtitle} ${p.category}`.toLowerCase().includes(d)) : n.items).slice(0, 12);
    });
    function l(d) {
      const f = s.value.length;
      f && (r.value = (r.value + d + f) % f);
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
    }), (d, f) => (N(), D(le, null, [
      S("div", {
        class: "wf-ctx-backdrop",
        onClick: f[0] || (f[0] = (p) => i("close")),
        onContextmenu: f[1] || (f[1] = He((p) => i("close"), ["prevent"]))
      }, null, 32),
      S("div", {
        class: "wf-drop-picker",
        role: "dialog",
        "aria-label": "Add a connected step",
        style: Be({ left: e.x + "px", top: e.y + "px" })
      }, [
        S("div", b3, [
          z(h(ie), {
            icon: "tabler:search",
            "aria-hidden": "true"
          }),
          gd(S("input", {
            ref_key: "inputEl",
            ref: a,
            "onUpdate:modelValue": f[2] || (f[2] = (p) => o.value = p),
            placeholder: "Add a step…",
            onKeydown: u
          }, null, 544), [
            [Um, o.value]
          ])
        ]),
        S("ul", _3, [
          (N(!0), D(le, null, Re(s.value, (p, v) => (N(), D("li", {
            key: p.paletteId
          }, [
            S("button", {
              class: Ie(["wf-drop-item", { on: v === r.value }]),
              role: "option",
              "aria-selected": v === r.value,
              onMouseenter: (y) => r.value = v,
              onClick: (y) => i("pick", p)
            }, [
              z(h(ie), {
                icon: p.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              S("span", E3, K(p.title), 1),
              S("span", x3, K(p.category), 1)
            ], 42, k3)
          ]))), 128)),
          s.value.length ? Q("", !0) : (N(), D("li", $3, "No steps match."))
        ])
      ], 4)
    ], 64));
  }
}), C3 = { class: "wf-run-notice-text" }, N3 = {
  key: 0,
  class: "wf-err-code"
}, I3 = { class: "wf-body" }, A3 = {
  key: 0,
  class: "wf-empty-canvas"
}, T3 = {
  key: 1,
  class: "wf-run-fail-strip",
  role: "status"
}, M3 = { class: "wf-run-fail-strip-txt" }, O3 = { key: 0 }, R3 = {
  key: 4,
  class: "wf-canvas-loading"
}, D3 = /* @__PURE__ */ ye({
  __name: "WorkflowCanvasView",
  props: {
    workflowId: {},
    model: {}
  },
  emits: ["back", "open-workflow"],
  setup(e, { emit: t }) {
    const n = e, i = n.workflowId, o = yd(n.model), r = Ne(o, "rootEl"), a = Ne(o, "canvasEl"), s = Ne(o, "shareHost"), l = t;
    return (c, u) => (N(), D("div", {
      ref_key: "rootEl",
      ref: r,
      class: Ie(["wf-canvas-root", { "wf--run": h(o).runState.active || !!h(o).viewingRun }]),
      tabindex: "0",
      onKeydown: u[21] || (u[21] = //@ts-ignore
      (...d) => h(o).onKeyDown && h(o).onKeyDown(...d))
    }, [
      z(h(Ld), { group: "node-delete" }),
      z(u3, {
        "palette-open": h(o).paletteOpen,
        "count-label": h(o).countLabel,
        "can-undo": h(o).canUndo,
        "can-redo": h(o).canRedo,
        "viewing-run": !!h(o).viewingRun,
        "layout-dir": h(o).layoutDir,
        "runs-open": h(o).runsOpen,
        "run-active": h(o).runState.active,
        "sim-busy": h(o).simBusy,
        "published-version": h(o).publishedVersion,
        "export-busy": h(o).exportBusy,
        "history-open": h(o).historyOpen,
        "publish-busy": h(o).publishBusy,
        onBack: u[0] || (u[0] = (d) => l("back")),
        onTogglePalette: h(o).togglePalette,
        onUndo: u[1] || (u[1] = (d) => h(o).runHistory("undo")),
        onRedo: u[2] || (u[2] = (d) => h(o).runHistory("redo")),
        onFit: h(o).fit,
        onAutoLayout: u[3] || (u[3] = (d) => h(o).runAutoLayout()),
        onToggleDirection: h(o).toggleDir,
        onEditConnections: h(o).openConnections,
        onToggleRuns: h(o).toggleRuns,
        onAddTrigger: h(o).openAddTrigger,
        onShare: h(o).openShare,
        onRun: h(o).openSim,
        onRunPublished: h(o).openPublishedRun,
        onExport: h(o).exportDefinition,
        onToggleHistory: h(o).toggleHistory,
        onPublish: h(o).doPublish
      }, null, 8, ["palette-open", "count-label", "can-undo", "can-redo", "viewing-run", "layout-dir", "runs-open", "run-active", "sim-busy", "published-version", "export-busy", "history-open", "publish-busy", "onTogglePalette", "onFit", "onToggleDirection", "onEditConnections", "onToggleRuns", "onAddTrigger", "onShare", "onRun", "onRunPublished", "onExport", "onToggleHistory", "onPublish"]),
      h(o).publishedRunOpen ? (N(), re(xO, {
        key: 0,
        "workflow-id": h(i),
        "published-version": h(o).publishedVersion,
        onClose: h(o).closePublishedRun
      }, null, 8, ["workflow-id", "published-version", "onClose"])) : Q("", !0),
      h(o).connectionsOpen ? (N(), re(w3, {
        key: 1,
        sources: h(o).connectionSources,
        targets: h(o).connectionTargets,
        edges: h(o).connectionEdges,
        "target-handle": h(o).connectionTargetHandle,
        disabled: !!h(o).viewingRun,
        onClose: h(o).closeConnections,
        onCreate: h(o).createConnection,
        onRemove: h(o).removeEdge
      }, null, 8, ["sources", "targets", "edges", "target-handle", "disabled", "onClose", "onCreate", "onRemove"])) : Q("", !0),
      h(o).runsOpen ? (N(), re(FM, {
        key: 2,
        rows: h(o).runRows,
        loading: h(o).runsLoading,
        error: h(o).runsError,
        onSelect: h(o).viewRun,
        onClose: h(o).closeRuns
      }, null, 8, ["rows", "loading", "error", "onSelect", "onClose"])) : Q("", !0),
      h(o).simOpen ? (N(), re(dP, {
        key: 3,
        schema: h(o).startInputSchema,
        "model-value": h(o).simInput,
        "reset-key": h(o).simInputKey,
        "has-fields": h(o).startHasFields,
        valid: h(o).simInputValid,
        "error-message": h(o).simError,
        "can-run": h(o).canRunSimulate,
        onClose: h(o).closeRunDialog,
        onRun: h(o).runSimulate,
        "onUpdate:modelValue": h(o).onSimInput,
        onValid: h(o).onSimValid
      }, null, 8, ["schema", "model-value", "reset-key", "has-fields", "valid", "error-message", "can-run", "onClose", "onRun", "onUpdate:modelValue", "onValid"])) : Q("", !0),
      h(o).historyOpen ? (N(), re(wO, {
        key: 4,
        "workflow-id": h(i),
        "definition-edit-seq": h(o).definitionEditSeq,
        onClose: h(o).closeHistory,
        onRestore: u[4] || (u[4] = (d) => l("open-workflow", d))
      }, null, 8, ["workflow-id", "definition-edit-seq", "onClose"])) : Q("", !0),
      h(o).addTriggerOpen ? (N(), re(NO, {
        key: 5,
        "workflow-id": h(i),
        "published-version": h(o).publishedVersion,
        onClose: h(o).closeAddTrigger
      }, null, 8, ["workflow-id", "published-version", "onClose"])) : Q("", !0),
      h(o).shareOpen ? (N(), D("div", {
        key: 6,
        ref_key: "shareHost",
        ref: s
      }, null, 512)) : Q("", !0),
      h(o).dropPicker ? (N(), re(S3, {
        key: 7,
        items: h(o).catalog,
        x: h(o).dropPicker.x,
        y: h(o).dropPicker.y,
        onPick: h(o).dropPickerPick,
        onClose: h(o).closeDropPicker
      }, null, 8, ["items", "x", "y", "onPick", "onClose"])) : Q("", !0),
      h(o).paneMenu ? (N(), D(le, { key: 8 }, [
        S("div", {
          class: "wf-ctx-backdrop",
          onClick: u[5] || (u[5] = //@ts-ignore
          (...d) => h(o).closePaneMenu && h(o).closePaneMenu(...d)),
          onContextmenu: u[6] || (u[6] = He(
            //@ts-ignore
            (...d) => h(o).closePaneMenu && h(o).closePaneMenu(...d),
            ["prevent"]
          ))
        }, null, 32),
        S("div", {
          class: "wf-ctx",
          role: "menu",
          style: Be({ left: h(o).paneMenu.x + "px", top: h(o).paneMenu.y + "px" })
        }, [
          S("button", {
            class: "wf-ctx-item",
            role: "menuitem",
            onClick: u[7] || (u[7] = //@ts-ignore
            (...d) => h(o).menuAddStep && h(o).menuAddStep(...d))
          }, [
            z(h(ie), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            u[22] || (u[22] = ce(" Add step…", -1))
          ]),
          S("button", {
            class: "wf-ctx-item",
            role: "menuitem",
            onClick: u[8] || (u[8] = //@ts-ignore
            (...d) => h(o).menuAddNote && h(o).menuAddNote(...d))
          }, [
            z(h(ie), {
              icon: "tabler:note",
              "aria-hidden": "true"
            }),
            u[23] || (u[23] = ce(" Add note", -1))
          ]),
          S("button", {
            class: "wf-ctx-item",
            role: "menuitem",
            onClick: u[9] || (u[9] = //@ts-ignore
            (...d) => h(o).menuAddFrame && h(o).menuAddFrame(...d))
          }, [
            z(h(ie), {
              icon: "tabler:frame",
              "aria-hidden": "true"
            }),
            u[24] || (u[24] = ce(" Add frame", -1))
          ])
        ], 4)
      ], 64)) : Q("", !0),
      z(h(Ag), { position: "top-center" }),
      h(o).viewingRun ? (N(), re(h(Fe), {
        key: 9,
        class: "wf-banner wf-banner--run",
        pt: { content: { class: "wf-run-notice-content" }, text: { class: "wf-run-notice-body" } },
        severity: "info",
        closable: !1
      }, {
        default: ne(() => [
          z(h(yt), {
            class: "wf-run-version-tag",
            severity: h(Qn)(h(o).viewingRun.flow_ref?.version ?? 0).kind === "published" ? "secondary" : "warn",
            value: h(Qn)(h(o).viewingRun.flow_ref?.version ?? 0).label,
            title: h(Qn)(h(o).viewingRun.flow_ref?.version ?? 0).title
          }, null, 8, ["severity", "value", "title"]),
          S("span", C3, "Viewing run " + K(h(Ts)(h(o).viewingRun.run_id)) + " · " + K(h(ro)(h(ao)(h(o).viewingRun))) + " · started " + K(h(Qt)(h(o).viewingRun.started_at)) + " — read-only.", 1),
          z(h(fe), {
            class: "wf-run-notice-action",
            onClick: h(o).stopRun
          }, {
            default: ne(() => [...u[25] || (u[25] = [
              ce("Back to editing", -1)
            ])]),
            _: 1
          }, 8, ["onClick"])
        ]),
        _: 1
      })) : Q("", !0),
      h(o).error ? (N(), re(h(Fe), {
        key: 10,
        class: "wf-banner wf-banner--error",
        severity: "error",
        onClose: u[10] || (u[10] = (d) => h(o).error = "")
      }, {
        default: ne(() => [
          S("span", null, K(h(o).errorView.message), 1),
          h(o).errorView.code ? (N(), D("span", N3, K(h(o).errorView.code), 1)) : Q("", !0)
        ]),
        _: 1
      })) : Q("", !0),
      S("div", I3, [
        h(o).paletteOpen && !h(o).viewingRun ? (N(), re(KT, {
          key: 0,
          items: h(o).catalog,
          loading: h(o).catalogLoading,
          errors: h(o).catalogErrors,
          onPlace: h(o).placeItem,
          onPlaceNote: u[11] || (u[11] = () => h(o).placeNote()),
          onPlaceFrame: u[12] || (u[12] = () => h(o).placeFrame())
        }, null, 8, ["items", "loading", "errors", "onPlace"])) : Q("", !0),
        S("main", {
          ref_key: "canvasEl",
          ref: a,
          class: "wf-canvas",
          onDrop: u[15] || (u[15] = //@ts-ignore
          (...d) => h(o).onDrop && h(o).onDrop(...d)),
          onDragover: u[16] || (u[16] = //@ts-ignore
          (...d) => h(o).onDragOver && h(o).onDragOver(...d)),
          onMousemove: u[17] || (u[17] = //@ts-ignore
          (...d) => h(o).onCanvasMouseMove && h(o).onCanvasMouseMove(...d))
        }, [
          z(h(Kf), {
            id: h(o).flowId,
            nodes: h(o).flowNodes,
            "onUpdate:nodes": u[13] || (u[13] = (d) => h(o).flowNodes = d),
            edges: h(o).flowEdges,
            "onUpdate:edges": u[14] || (u[14] = (d) => h(o).flowEdges = d),
            "node-types": h(o).nodeTypes,
            "edge-types": h(o).edgeTypes,
            "connection-line-style": h(o).connectLineStyle(),
            "is-valid-connection": h(o).isValidConnection,
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
            onNodeClick: h(o).onNodeClick,
            onEdgeClick: h(o).onEdgeClick,
            onPaneClick: h(o).onPaneClick,
            onPaneContextMenu: h(o).onPaneContextMenu,
            onNodeContextMenu: h(o).onNodeContextMenu,
            onConnectStart: h(o).onConnectStart,
            onConnect: h(o).onConnect,
            onConnectEnd: h(o).onConnectEnd,
            onNodeDragStop: h(o).onNodeDragStop,
            onMove: h(o).onViewportMove
          }, {
            default: ne(() => [
              z(h(np), {
                "pattern-color": "var(--wf-dot)",
                gap: 20,
                size: 1.2
              }),
              z(h(t2), {
                position: "bottom-left",
                "show-interactive": !1
              }),
              z(h(LT), {
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
          h(o).isEmpty ? (N(), D("div", A3, [...u[26] || (u[26] = [
            Wm('<div class="wf-empty-flow" aria-hidden="true"><span class="wf-gnode wf-gnode--start"></span><span class="wf-gwire"></span><span class="wf-gnode wf-gnode--block"></span><span class="wf-gwire"></span><span class="wf-gnode wf-gnode--block"></span></div><p class="wf-empty-title">Add your first step</p><p class="wf-empty-sub">Drag a Start or Block from the left — or press ⌘K to search.</p>', 3)
          ])])) : Q("", !0),
          h(o).viewingRun && h(o).failedNode ? (N(), D("div", T3, [
            z(h(ie), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            }),
            S("span", M3, [
              S("strong", null, K(h(o).failedNodeTitle), 1),
              u[27] || (u[27] = ce(" failed", -1)),
              h(o).failedReason ? (N(), D("span", O3, ": " + K(h(o).failedReason), 1)) : Q("", !0),
              u[28] || (u[28] = ce(".", -1))
            ]),
            z(h(fe), {
              severity: "secondary",
              outlined: "",
              onClick: h(o).openFailedDetails
            }, {
              default: ne(() => [
                z(h(ie), {
                  icon: "tabler:list-search",
                  "aria-hidden": "true"
                }),
                u[29] || (u[29] = S("span", null, "View details", -1))
              ]),
              _: 1
            }, 8, ["onClick"])
          ])) : Q("", !0),
          h(o).connectStatus && h(o).connectStatus !== "neutral" && h(o).connectHintPosition ? (N(), D("div", {
            key: 2,
            class: Ie(["wf-connect-hint", `is-${h(o).connectStatus}`]),
            style: Be({ left: h(o).connectHintPosition.left + "px", top: h(o).connectHintPosition.top + "px" })
          }, [
            z(h(ie), {
              icon: h(o).connectStatus === "ok" ? "tabler:plug-connected" : h(o).connectStatus === "warn" ? "tabler:wand" : "tabler:plug-connected-x",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            S("span", null, K(h(o).connectStatus === "ok" ? "Compatible" : h(o).connectStatus === "warn" ? h(o).connectMessage || "Needs a mapping" : h(o).connectMessage || "Incompatible"), 1)
          ], 6)) : Q("", !0),
          (N(!0), D(le, null, Re(h(o).autoMapAnchored, (d) => (N(), re(t3, {
            key: d.id,
            entry: d.entry,
            style: Be({ left: d.left + "px", top: d.top + "px", visibility: d.placed ? "visible" : "hidden", "--wf-overlay-max-height": d.maxHeight + "px" }),
            onMeasure: (f) => h(o).measureAuto(d.id, f),
            onOpen: h(o).openAutoMapped,
            onDismiss: h(o).dismissAutoMapped
          }, null, 8, ["entry", "style", "onMeasure", "onOpen", "onDismiss"]))), 128)),
          h(o).pendingEdge && h(o).pendingAnchor ? (N(), re(HP, {
            key: h(o).pendingEdge.id,
            "workflow-id": h(i),
            edge: h(o).pendingEdge,
            "available-steps": h(o).availableSteps,
            style: Be({ left: h(o).pendingAnchor.left + "px", top: h(o).pendingAnchor.top + "px", visibility: h(o).pendingOverlaySize ? "visible" : "hidden", "--wf-overlay-max-height": h(o).pendingAnchor.maxHeight + "px" }),
            onMeasure: h(o).measurePending,
            onAccept: h(o).acceptPending,
            onSuggestNode: h(o).showSuggestedNode,
            onOpenMapper: h(o).openPendingMapper,
            onDismiss: h(o).dismissPending
          }, null, 8, ["workflow-id", "edge", "available-steps", "style", "onMeasure", "onAccept", "onSuggestNode", "onOpenMapper", "onDismiss"])) : Q("", !0),
          h(o).loading ? (N(), D("div", R3, [
            z(h(dt), {
              class: "wf-status-spinner",
              "stroke-width": "4",
              "aria-label": "Loading workflow canvas"
            })
          ])) : Q("", !0)
        ], 544),
        !h(o).panelOpen && (h(o).hasSelection || h(o).viewingRun) ? (N(), re(h(fe), {
          key: 1,
          class: "wf-panel-rail",
          text: "",
          rounded: "",
          severity: "secondary",
          title: "Show inspector",
          "aria-label": "Show inspector",
          onClick: h(o).openInspector
        }, {
          default: ne(() => [
            z(h(ie), {
              icon: "tabler:chevron-left",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["onClick"])) : Q("", !0),
        h(o).narrowEditor ? (N(), re(h(Ig), {
          key: 2,
          class: "wf-inspector-drawer",
          visible: h(o).panelOpen,
          position: "right",
          modal: !0,
          dismissable: !0,
          "close-on-escape": !0,
          "show-close-icon": !1,
          style: { width: "min(312px, calc(100vw - 44px))" },
          "aria-label": "Workflow inspector",
          "onUpdate:visible": u[19] || (u[19] = (d) => {
            d || h(o).closeInspector();
          })
        }, {
          default: ne(() => [
            h(o).viewingRun ? (N(), re(nd, {
              key: 0,
              "workflow-id": h(i),
              run: h(o).viewingRun,
              node: h(o).selectedNode,
              "node-status": h(o).selectedRunStatus,
              "node-headers": h(o).viewingNodeHeaders,
              onClose: h(o).clearSelection,
              onExitRun: h(o).stopRun,
              onRerun: u[18] || (u[18] = (d) => h(o).rerunSameInput(h(o).viewingRun))
            }, null, 8, ["workflow-id", "run", "node", "node-status", "node-headers", "onClose", "onExitRun"])) : h(o).hasSelection ? (N(), re(rd, {
              key: 1,
              "workflow-id": h(i),
              node: h(o).selectedNode,
              edge: h(o).selectedEdge,
              note: h(o).selectedNote,
              catalog: h(o).catalog,
              "edge-upstream-schema": h(o).selectedEdgeUpstream,
              "edge-downstream-schema": h(o).selectedEdgeDownstream,
              "edge-source-title": h(o).selectedEdgeSourceTitle,
              "edge-target-title": h(o).selectedEdgeTargetTitle,
              "node-upstream-schema": h(o).selectedNodeUpstream,
              "combine-branch-conflict": h(o).selectedCombineConflict,
              onUpdateNode: h(o).updateNode,
              onRemoveNode: h(o).removeSelectedNode,
              onUpdateEdge: h(o).updateEdge,
              onRemoveEdge: h(o).removeSelectedEdge,
              onUpdateNote: h(o).updateNote,
              onRemoveNote: h(o).removeSelectedNote,
              onClose: h(o).clearSelection
            }, null, 8, ["workflow-id", "node", "edge", "note", "catalog", "edge-upstream-schema", "edge-downstream-schema", "edge-source-title", "edge-target-title", "node-upstream-schema", "combine-branch-conflict", "onUpdateNode", "onRemoveNode", "onUpdateEdge", "onRemoveEdge", "onUpdateNote", "onRemoveNote", "onClose"])) : Q("", !0)
          ]),
          _: 1
        }, 8, ["visible"])) : (N(), D(le, { key: 3 }, [
          h(o).panelOpen && h(o).viewingRun ? (N(), re(nd, {
            key: 0,
            "workflow-id": h(i),
            run: h(o).viewingRun,
            node: h(o).selectedNode,
            "node-status": h(o).selectedRunStatus,
            "node-headers": h(o).viewingNodeHeaders,
            onClose: h(o).clearSelection,
            onExitRun: h(o).stopRun,
            onRerun: u[20] || (u[20] = (d) => h(o).rerunSameInput(h(o).viewingRun))
          }, null, 8, ["workflow-id", "run", "node", "node-status", "node-headers", "onClose", "onExitRun"])) : h(o).panelOpen && h(o).hasSelection ? (N(), re(rd, {
            key: 1,
            "workflow-id": h(i),
            node: h(o).selectedNode,
            edge: h(o).selectedEdge,
            note: h(o).selectedNote,
            catalog: h(o).catalog,
            "edge-upstream-schema": h(o).selectedEdgeUpstream,
            "edge-downstream-schema": h(o).selectedEdgeDownstream,
            "edge-source-title": h(o).selectedEdgeSourceTitle,
            "edge-target-title": h(o).selectedEdgeTargetTitle,
            "node-upstream-schema": h(o).selectedNodeUpstream,
            "combine-branch-conflict": h(o).selectedCombineConflict,
            onUpdateNode: h(o).updateNode,
            onRemoveNode: h(o).removeSelectedNode,
            onUpdateEdge: h(o).updateEdge,
            onRemoveEdge: h(o).removeSelectedEdge,
            onUpdateNote: h(o).updateNote,
            onRemoveNote: h(o).removeSelectedNote,
            onClose: h(o).clearSelection
          }, null, 8, ["workflow-id", "node", "edge", "note", "catalog", "edge-upstream-schema", "edge-downstream-schema", "edge-source-title", "edge-target-title", "node-upstream-schema", "combine-branch-conflict", "onUpdateNode", "onRemoveNode", "onUpdateEdge", "onRemoveEdge", "onUpdateNote", "onRemoveNote", "onClose"])) : Q("", !0)
        ], 64))
      ])
    ], 34));
  }
}), P3 = /* @__PURE__ */ ye({
  __name: "WorkflowCanvas",
  props: {
    workflowId: {}
  },
  emits: ["back", "open-workflow", "published"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = new eS(), r = G(0), a = G(!0), s = G(""), l = nt(null), c = nt(null);
    let u = 0;
    function d(xe = null) {
      u += 1;
      const Ce = wn.value?.getRootNode();
      l.value = Ce?.activeElement instanceof HTMLElement ? Ce.activeElement : null, c.value = xe ?? wn.value?.querySelector(
        'button[aria-label="More workflow actions"]'
      ) ?? null;
    }
    async function f() {
      const xe = u, Ce = l.value, Le = c.value ?? wn.value?.querySelector(
        'button[aria-label="More workflow actions"]'
      ) ?? null;
      await Ve();
      const qt = wn.value?.getRootNode();
      await Bd({
        root: qt ?? null,
        target: Ce,
        fallback: Le,
        isCurrent: () => xe === u
      }) && (u += 1, l.value = null, c.value = null);
    }
    const p = nt([]), v = nt([]), y = G(/* @__PURE__ */ new Map()), m = U(() => (r.value, o.doc.direction)), _ = G([]), x = G([]), w = G(!0), b = U(() => {
      const xe = /* @__PURE__ */ new Map();
      for (const Ce of _.value) {
        const Le = String(Ce.kind);
        Ce.ref || Le === "start" || Le === "finish" || Le === "error" || xe.has(Le) || xe.set(Le, Ce.title);
      }
      return [...xe].map(([Ce, Le]) => ({ kind: Ce, title: Le }));
    }), C = G(Nd()), I = G(""), B = xg(), T = Rd();
    _e(I, (xe) => {
      xe && (B.add({ severity: "success", summary: "Workflow updated", detail: xe, life: 5e3 }), I.value = "");
    });
    const M = G(null), V = G([]), {
      panelOpen: O,
      paletteOpen: E,
      historyOpen: F,
      addTriggerOpen: g,
      shareOpen: $,
      shareHost: k
    } = OC(), {
      selectedNode: H,
      selectedEdge: q,
      selectedNote: ee,
      hasSelection: Z,
      select: oe,
      clearSelection: se,
      onNodeClick: Y,
      onEdgeClick: J,
      onPaneClick: j,
      updateNode: X,
      updateEdge: te,
      updateNote: ae,
      removeSelectedNode: ue,
      removeSelectedEdge: we,
      removeEdge: $e,
      removeSelectedNote: ve,
      deleteSelection: me
    } = MC({
      doc: () => o.doc,
      revision: r,
      readOnly: () => !!M.value,
      apply: (xe) => Po(xe),
      openInspector: () => {
        O.value = !0;
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
      publishBusy: L,
      publishedVersion: R,
      exportBusy: A,
      loadPublishedState: P,
      exportDefinition: W,
      definitionEditSeq: de,
      doPublish: he
    } = WC({
      engine: o,
      workflowId: n.workflowId,
      revision: r,
      error: s,
      notice: I,
      historyOpen: F,
      publishIssues: y,
      rebuild: mn,
      select: oe,
      published: (xe) => i("published", { kind: "flow", id: n.workflowId, version: xe })
    }), ke = { wfNode: et(eh), wfNote: et(yh), wfFrame: et(wh), wfContainer: et(bh) }, be = { "mapping-completeness": et(_h) }, Ee = `wf-${n.workflowId}`, { fitView: Se, screenToFlowCoordinate: Me, getViewport: ht, onNodesInitialized: lt, findNode: mr, getSelectedNodes: gr } = De(Ee), Ro = G(0);
    function Dp() {
      Ro.value++;
    }
    let yl = !1;
    lt(() => {
      yl || a.value || (yl = !0, Ve(() => Se(Vo())));
    });
    const Pp = BC({
      engine: o,
      revision: r,
      selectedNode: H,
      selectedEdge: q,
      runState: C,
      viewingRun: M,
      error: s,
      loading: a,
      panelOpen: O,
      select: oe
    }), {
      selectedEdgeUpstream: Lp,
      selectedEdgeDownstream: Vp,
      selectedEdgeSourceTitle: zp,
      selectedEdgeTargetTitle: Bp,
      selectedNodeUpstream: Fp,
      selectedCombineConflict: Hp,
      selectedRunStatus: qp,
      failedNode: Up,
      failedNodeTitle: Wp,
      failedReason: Yp,
      errorView: Gp,
      openFailedDetails: jp,
      countLabel: Xp,
      canUndo: Kp,
      canRedo: Zp,
      isEmpty: Jp
    } = Pp;
    function mn(xe = !1) {
      fg(o.doc.nodes, _.value);
      const Ce = C.value.active || !!M.value, Le = Gh(o.doc, Ce ? C.value : void 0, m.value, y.value, !!M.value);
      gv(new Set(Le.flowEdges.map((qt) => String(qt.id)))), yv(Le.flowEdges), p.value = Le.flowNodes, v.value = Le.flowEdges, r.value++, xe && Ve(() => requestAnimationFrame(() => requestAnimationFrame(() => {
        try {
          Se(Vo());
        } catch {
        }
      })));
    }
    let Bn = null, gn = null, Do = "";
    async function yr(xe = !1) {
      if (Bn) return Bn;
      Bn = (async () => {
        a.value = !0;
        try {
          if (!gn) {
            const Le = await _d("/api/v1/user/me"), qt = yi(Le.user), zo = String(qt.id || qt.email || "");
            if (!zo) throw new Error("Unable to identify the Workflow editor session.");
            Do = `${zo}:${n.workflowId}`, await rS(Do), gn = new iS(zo, n.workflowId, localStorage);
          }
          const Ce = await Sd(n.workflowId);
          if (o.reset(Ce), !wr) {
            const Le = gn.read(o.doc);
            gn.write(Le), wr = !0, aS(Do, yn);
            for (const qt of Le) yn(qt);
          }
          y.value = /* @__PURE__ */ new Map(), s.value = "", mn(xe);
        } catch (Ce) {
          s.value = qe(Ce, "Couldn’t load this Workflow.");
        } finally {
          a.value = !1;
        }
      })();
      try {
        await Bn;
      } finally {
        Bn = null;
      }
    }
    let wr = !1;
    const yn = tS({
      checkpoint: (xe) => {
        if (!gn) throw new Error("Workflow edits are not ready to save.");
        gn.write(xe);
      },
      engine: o,
      request: async (xe) => {
        const Ce = await kd(n.workflowId, xe);
        return s.value = "", Ce;
      },
      rebuild: mn,
      recover: async (xe) => {
        const Ce = qe(xe, "Couldn’t save the change.");
        await yr(), s.value = Ce;
      }
    });
    sS(yn, () => Do);
    async function wl(xe) {
      await yn.flush() && xe();
    }
    async function Po(xe, Ce = !1) {
      if (M.value) {
        s.value = "Exit run view to edit this Workflow.";
        return;
      }
      if (xe.length) {
        if (!wr || a.value) {
          s.value = "Wait for Workflow edits to finish loading.";
          return;
        }
        try {
          await yn(xe, Ce);
        } catch (Le) {
          s.value = qe(Le, "Couldn’t preserve the pending change.");
        }
      }
    }
    async function bl(xe) {
      if (!M.value && !(xe === "undo" && !o.doc.canUndo) && !(xe === "redo" && !o.doc.canRedo))
        try {
          if (!await yn.flush()) return;
          await (xe === "undo" ? cg : dg)(n.workflowId), await yr();
        } catch (Ce) {
          s.value = qe(Ce, xe === "undo" ? "Nothing to undo." : "Nothing to redo.");
        }
    }
    let _l = async () => !1;
    const { canvasEl: Lo, placeItem: kl, placeNote: El, placeFrame: xl, onDrop: Qp, onDragOver: ev } = SC({
      engine: o,
      layoutDir: m,
      apply: Po,
      select: oe,
      catalog: _,
      getViewport: ht,
      screenToFlowCoordinate: Me
    }), { onNodeDragStop: tv, runAutoLayout: nv, toggleDir: ov, fit: $l } = ZC({
      engine: o,
      layoutDir: m,
      viewingRun: M,
      canvasEl: Lo,
      apply: Po,
      prepareCanvasAction: () => _l(),
      fitView: Se,
      canvasFitOptions: Vo
    });
    function Vo(xe = 250) {
      const Ce = Lo.value?.getBoundingClientRect().width || 0, Le = typeof document > "u" ? 1 : Number.parseFloat(getComputedStyle(document.documentElement).zoom || "1") || 1;
      return Jh(xe, Ce > 0 && Ce <= 640 ? 0.02 : 0.2, Le);
    }
    const {
      connectStatus: iv,
      connectMessage: rv,
      connectXY: av,
      connectLineStyle: sv,
      isValidConnection: lv,
      onConnect: Sl,
      onConnectEnd: uv,
      onCanvasMouseMove: cv,
      pendingEdge: Cl,
      autoMapped: dv,
      intentRev: fv,
      dismissPending: Nl,
      acceptPending: hv,
      openPendingMapper: pv,
      dismissAutoMapped: vv,
      openAutoMapped: mv,
      clearIntentOverlays: br,
      pruneIntent: gv,
      decorateEdges: yv
    } = wC({
      engine: o,
      apply: Po,
      select: oe,
      layoutDir: m,
      viewingRun: M
    }), {
      connectionsOpen: wv,
      connectionSources: bv,
      connectionTargets: _v,
      connectionEdges: kv,
      connectionTargetHandle: Ev,
      openConnections: xv,
      closeConnections: $v,
      createConnection: Sv
    } = QC({
      engine: o,
      revision: r,
      layoutDir: m,
      clearIntentOverlays: br,
      rememberOverlayInvoker: d,
      restoreOverlayFocusFallback: f,
      onConnect: Sl
    }), {
      pendingOverlaySize: Cv,
      pendingAnchor: Nv,
      autoMapAnchored: Iv,
      connectHintPosition: Av,
      measurePending: Tv,
      measureAuto: Mv
    } = rN({
      engine: o,
      flowNodes: p,
      canvasEl: Lo,
      findNode: mr,
      getViewport: ht,
      revision: r,
      viewportRevision: Ro,
      intentRevision: fv,
      pendingEdge: Cl,
      autoMapped: dv,
      connectXY: av,
      rebuild: mn
    }), {
      runsOpen: _r,
      runRows: Ov,
      runsLoading: Rv,
      runsError: Dv,
      simOpen: kr,
      simBusy: Pv,
      simInput: Lv,
      simInputKey: Vv,
      simError: zv,
      simInputValid: Bv,
      startInputSchema: Fv,
      startHasFields: Hv,
      canRunSimulate: qv,
      stopRun: Uv,
      toggleRuns: Wv,
      viewRun: Yv,
      openSim: Gv,
      closeSim: jv,
      rerunSameInput: Xv,
      onSimInput: Kv,
      onSimValid: Zv,
      runSimulate: Jv
    } = AC({
      engine: o,
      workflowId: n.workflowId,
      rev: r,
      runState: C,
      viewingRun: M,
      viewingNodeHeaders: V,
      rebuild: mn,
      clearSelection: se,
      error: s,
      panelOpen: O,
      historyOpen: F
    }), {
      openShare: Qv,
      toggleHistory: em,
      closeHistory: tm,
      openAddTrigger: nm,
      closeAddTrigger: om,
      openSim: im,
      closeRunDialog: rm,
      toggleRuns: am,
      closeRuns: sm
    } = KC({
      workflowId: n.workflowId,
      shareOpen: $,
      shareHost: k,
      historyOpen: F,
      addTriggerOpen: g,
      runsOpen: _r,
      simOpen: kr,
      publishedVersion: R,
      error: s,
      clearIntentOverlays: br,
      rememberOverlayInvoker: d,
      restoreOverlayFocusFallback: f,
      openRunDialog: Gv,
      closeSim: jv,
      toggleRunsPanel: Wv
    }), Er = G(!1);
    function lm(xe = null) {
      !R.value || M.value || (br(), d(xe), Er.value = !0, F.value = !1, _r.value = !1, kr.value = !1, g.value = !1);
    }
    function um() {
      Er.value = !1, f();
    }
    const { rootEl: wn, onKeyDown: cm, focusPaletteSearch: dm } = IC({
      deleteSelection: me,
      runHistory: bl,
      paletteOpen: E,
      hasSelection: Z,
      clearSelection: se,
      fit: () => $l(),
      zoomSelection: () => {
        const xe = gr.value.map((Ce) => Ce.id);
        xe.length && Se({ nodes: xe, padding: 0.4, duration: 200, maxZoom: 1.2 });
      }
    }), {
      paneMenu: fm,
      onPaneContextMenu: hm,
      onNodeContextMenu: pm,
      closePaneMenu: vm,
      menuAddStep: mm,
      menuAddNote: gm,
      menuAddFrame: ym,
      dropPicker: wm,
      onConnectStart: bm,
      onConnect: _m,
      onConnectEnd: km,
      closeDropPicker: Em,
      dropPickerPick: xm
    } = eN({
      viewingRun: M,
      paletteOpen: E,
      screenToFlowCoordinate: Me,
      placeItem: kl,
      placeNote: El,
      placeFrame: xl,
      focusPaletteSearch: dm,
      onConnect: Sl,
      settleConnectHint: uv
    }), Il = TC({
      rootEl: wn,
      panelOpen: O,
      paletteOpen: E,
      hasSelection: Z,
      viewingRun: M,
      reframe: () => {
        try {
          Se(Vo(180));
        } catch {
        }
      }
    }), { narrow: $m, togglePalette: Sm, openInspector: Cm, closeInspector: Nm } = Il;
    _l = Il.prepareCanvasAction;
    function Im(xe) {
      const Ce = _.value.find((Le) => !Le.ref && String(Le.kind) === xe);
      Nl(), E.value = !0, I.value = Ce ? `Suggested step: ${Ce.title}. Choose it from the palette.` : "Choose the suggested step from the palette.";
    }
    yN({
      workflowId: n.workflowId,
      engine: o,
      catalog: _,
      catalogErrors: x,
      catalogLoading: w,
      load: yr,
      loadPublishedState: P,
      rebuild: mn
    });
    const Am = yd({
      rootEl: wn,
      canvasEl: Lo,
      shareHost: k,
      runState: C,
      viewingRun: M,
      onKeyDown: cm,
      paletteOpen: E,
      countLabel: Xp,
      canUndo: Kp,
      canRedo: Zp,
      layoutDir: m,
      runsOpen: _r,
      simBusy: Pv,
      publishedVersion: R,
      exportBusy: A,
      historyOpen: F,
      publishBusy: L,
      publishedRunOpen: Er,
      openPublishedRun: lm,
      closePublishedRun: um,
      togglePalette: Sm,
      runHistory: bl,
      fit: $l,
      runAutoLayout: nv,
      toggleDir: ov,
      openConnections: xv,
      toggleRuns: am,
      openAddTrigger: nm,
      openShare: Qv,
      openSim: im,
      exportDefinition: W,
      toggleHistory: em,
      doPublish: he,
      connectionsOpen: wv,
      connectionSources: bv,
      connectionTargets: _v,
      connectionEdges: kv,
      connectionTargetHandle: Ev,
      removeEdge: $e,
      closeConnections: $v,
      createConnection: Sv,
      runRows: Ov,
      runsLoading: Rv,
      runsError: Dv,
      viewRun: Yv,
      closeRuns: sm,
      simOpen: kr,
      startInputSchema: Fv,
      simInput: Lv,
      simInputKey: Vv,
      startHasFields: Hv,
      simInputValid: Bv,
      simError: zv,
      canRunSimulate: qv,
      closeRunDialog: rm,
      runSimulate: Jv,
      onSimInput: Kv,
      onSimValid: Zv,
      definitionEditSeq: de,
      closeHistory: tm,
      addTriggerOpen: g,
      closeAddTrigger: om,
      shareOpen: $,
      dropPicker: wm,
      catalog: _,
      dropPickerPick: xm,
      closeDropPicker: Em,
      paneMenu: fm,
      closePaneMenu: vm,
      menuAddStep: mm,
      menuAddNote: gm,
      menuAddFrame: ym,
      stopRun: Uv,
      error: s,
      errorView: Gp,
      catalogLoading: w,
      catalogErrors: x,
      placeItem: kl,
      placeNote: El,
      placeFrame: xl,
      onDrop: Qp,
      onDragOver: ev,
      onCanvasMouseMove: cv,
      flowId: Ee,
      flowNodes: p,
      flowEdges: v,
      nodeTypes: ke,
      edgeTypes: be,
      connectLineStyle: sv,
      isValidConnection: lv,
      onNodeClick: Y,
      onEdgeClick: J,
      onPaneClick: j,
      onPaneContextMenu: hm,
      onNodeContextMenu: pm,
      onConnectStart: bm,
      onConnect: _m,
      onConnectEnd: km,
      onNodeDragStop: tv,
      onViewportMove: Dp,
      isEmpty: Jp,
      failedNode: Up,
      failedNodeTitle: Wp,
      failedReason: Yp,
      openFailedDetails: jp,
      connectStatus: iv,
      connectHintPosition: Av,
      connectMessage: rv,
      autoMapAnchored: Iv,
      measureAuto: Mv,
      openAutoMapped: mv,
      dismissAutoMapped: vv,
      pendingEdge: Cl,
      pendingAnchor: Nv,
      availableSteps: b,
      pendingOverlaySize: Cv,
      measurePending: Tv,
      acceptPending: hv,
      showSuggestedNode: Im,
      openPendingMapper: pv,
      dismissPending: Nl,
      loading: a,
      panelOpen: O,
      hasSelection: Z,
      openInspector: Cm,
      narrowEditor: $m,
      closeInspector: Nm,
      selectedNode: H,
      selectedRunStatus: qp,
      viewingNodeHeaders: V,
      clearSelection: se,
      rerunSameInput: Xv,
      selectedEdge: q,
      selectedNote: ee,
      selectedEdgeUpstream: Lp,
      selectedEdgeDownstream: Vp,
      selectedEdgeSourceTitle: zp,
      selectedEdgeTargetTitle: Bp,
      selectedNodeUpstream: Fp,
      selectedCombineConflict: Hp,
      updateNode: X,
      removeSelectedNode: ue,
      updateEdge: te,
      removeSelectedEdge: we,
      updateNote: ae,
      removeSelectedNote: ve
    });
    return (xe, Ce) => (N(), re(D3, {
      "workflow-id": n.workflowId,
      model: h(Am),
      onBack: Ce[0] || (Ce[0] = (Le) => wl(() => i("back"))),
      onOpenWorkflow: Ce[1] || (Ce[1] = (Le) => wl(() => i("open-workflow", Le)))
    }, null, 8, ["workflow-id", "model"]));
  }
}), L3 = { class: "wfp" }, V3 = {
  key: 0,
  class: "wfp-state"
}, z3 = {
  key: 1,
  class: "wfp-state wfp-error",
  role: "alert"
}, B3 = /* @__PURE__ */ ye({
  __name: "WorkflowPreview",
  props: {
    workflowId: {}
  },
  setup(e) {
    const t = e, n = { wfNode: et(eh), wfNote: et(yh), wfFrame: et(wh), wfContainer: et(bh) }, i = { "mapping-completeness": et(_h) }, o = `wf-preview-${t.workflowId}`, { fitView: r, onNodesInitialized: a } = De(o);
    a(() => {
      r(Jh(0));
    });
    const s = nt([]), l = nt([]), c = G(!0), u = G("");
    async function d() {
      c.value = !0, u.value = "";
      try {
        const f = Ih(await Sd(t.workflowId)), p = Gh(f);
        s.value = p.flowNodes, l.value = p.flowEdges;
      } catch (f) {
        u.value = f instanceof Error ? f.message : "The workflow could not load.";
      } finally {
        c.value = !1;
      }
    }
    return _e(() => t.workflowId, d, { immediate: !0 }), (f, p) => (N(), D("div", L3, [
      c.value ? (N(), D("div", V3, [
        z(h(ie), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        p[0] || (p[0] = ce(" Loading workflow…", -1))
      ])) : u.value ? (N(), D("div", z3, K(u.value), 1)) : (N(), re(h(Kf), {
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
          z(h(np), {
            "pattern-color": "var(--wf-dot)",
            gap: 20,
            size: 1.2
          })
        ]),
        _: 1
      }, 8, ["nodes", "edges"]))
    ]));
  }
}), F3 = /* @__PURE__ */ ye({
  __name: "WorkflowBuilder",
  setup(e) {
    const t = wd(), n = Ym(), i = G(null);
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
    const d = G(null), f = U(() => t.value?.mode === "preview");
    return (p, v) => (N(), D("div", {
      ref_key: "rootEl",
      ref: d,
      class: "wf"
    }, [
      f.value && s.value ? (N(), re(B3, {
        key: 0,
        "workflow-id": s.value
      }, null, 8, ["workflow-id"])) : s.value ? (N(), re(P3, {
        key: 1,
        "workflow-id": s.value,
        onBack: c,
        onOpenWorkflow: l,
        onPublished: u
      }, null, 8, ["workflow-id"])) : (N(), re(uw, {
        key: 2,
        onOpen: v[0] || (v[0] = (y) => l(y))
      }))
    ], 512));
  }
}), H3 = {
  install(e) {
    e.use(Mm), e.use(Om);
  }
}, $4 = {
  rootComponent: F3,
  plugins: [Tm, H3]
};
export {
  $4 as mountConfig
};
