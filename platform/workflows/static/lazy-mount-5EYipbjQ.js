import { u as hd, b as pd, a as Mm, P as Om } from "./wc-runtime-BGqR6wyP.js";
import Rm from "primevue/confirmationservice";
import Dm from "primevue/toastservice";
import { watch as ke, onBeforeUnmount as Qe, defineComponent as we, computed as W, openBlock as $, createElementBlock as R, createElementVNode as x, createVNode as z, unref as f, withCtx as ie, createCommentVNode as Q, normalizeClass as Ie, toDisplayString as Z, withModifiers as Fe, Fragment as de, createTextVNode as he, ref as j, nextTick as ze, normalizeStyle as He, renderSlot as Ve, renderList as Oe, withKeys as tt, createBlock as se, createPropsRestProxy as Pm, toRef as Ne, onMounted as Ue, getCurrentScope as vd, inject as Ht, effectScope as md, provide as Zt, getCurrentInstance as Ln, useAttrs as Es, mergeProps as oo, Teleport as Lm, useSlots as gd, onUnmounted as zm, reactive as xs, onScopeDispose as ri, resolveDynamicComponent as Xt, onBeforeMount as Vm, shallowRef as nt, isMemoSame as Bm, toValue as Ae, isRef as $s, toRefs as Fm, customRef as Hm, resolveComponent as yd, h as Pe, markRaw as et, readonly as qm, watchEffect as wd, normalizeProps as Um, withDirectives as bd, vShow as Wm, vModelText as Ym, proxyRefs as _d, createStaticVNode as Gm } from "vue";
import { on as gi, api as zn, loadByTagName as Ki } from "@wippy-fe/proxy";
import rt from "primevue/inputtext";
import pe from "primevue/button";
import Be from "primevue/message";
import Al from "primevue/skeleton";
import { Icon as ae } from "@iconify/vue";
import Jt from "primevue/dialog";
import { n as io, p as jm, a as yi, s as Xm, g as kd, b as Zi, h as qe, l as Ed, d as Tl, c as xd, e as Km, f as $d, i as Ml, t as Zm, F as Nt, o as Ji, j as wi, k as Sd, m as bi, q as Ss, r as Fa, u as Cs, v as Qi, w as Ns, x as Ol, y as Jm, z as Qm, A as Rl, K as Ze, B as eg, C as tg, _ as ng, D as og, E as ig, G as rg, H as ag, I as Dl, J as sg, L as lg, M as ug, N as cg, O as dg, P as fg, Q as Cd, R as hg } from "./WorkflowSearchList.vue_vue_type_script_setup_true_lang-1g5-myn1.js";
import { r as Qt, a as Is, b as ro, c as As, i as pg, s as vg, g as xr, d as mg, e as $r, f as gg, l as Nd, h as Id, p as Pl, n as yg, j as wg, k as Ad, m as Qn, o as ao, q as Ts, _ as Fn, t as Td, u as bg, v as _g, w as kg, x as Md, y as Eg } from "./http-error-hXuGxpYD.js";
import Od from "primevue/iconfield";
import Rd from "primevue/inputicon";
import St from "primevue/select";
import Ms from "primevue/selectbutton";
import yt from "primevue/progressspinner";
import gt from "primevue/tag";
import xg from "primevue/fileupload";
import Os from "primevue/textarea";
import { useConfirm as Dd } from "primevue/useconfirm";
import { useToast as $g } from "primevue/usetoast";
import { p as Sg, P as Cg, l as Pd, g as Ld, a as Ng, r as Ig } from "./versions-BxnHuhqm.js";
import zd from "primevue/confirmdialog";
import Ag from "primevue/drawer";
import Tg from "primevue/toast";
import Ll from "primevue/tab";
import Mg from "primevue/tablist";
import Og from "primevue/tabs";
import { _ as ai } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { e as Rg } from "./errMsg-CxKGcp1F.js";
import { _ as Rs, h as En, A as zl } from "./SchemaEditor.vue_vue_type_script_setup_true_lang-Bqtnrqhr.js";
import so from "primevue/inputnumber";
import Dg from "primevue/panel";
import Pg from "primevue/buttongroup";
function Hn(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Lg(e, t) {
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
      meta: Lg(Hn(r.meta) ? r.meta : {}),
      deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
    };
  }
  return null;
}
function Vg(e, t) {
  const n = zg(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function Bg(e, t, n, i) {
  const o = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
  function a(c, u) {
    const d = e.value.find((_) => t(_) === c), h = r.get(c), p = u?.job_id || h?.state.deletion_job_id || d?.deletion_job_id, v = h ? h.state.deletion_job_id : d?.deleting_at ? d.deletion_job_id : void 0;
    if ((h || d?.deleting_at) && p === v || p && h?.superseded.has(p)) return;
    const g = {
      deleting_at: h?.state.deleting_at || d?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: p
    }, m = new Set(h?.superseded);
    for (const _ of [h?.state.deletion_job_id, d?.deletion_job_id])
      _ && _ !== p && m.add(_);
    r.set(c, { state: g, superseded: m }), d && (Object.assign(d, g), d.deletion_job = void 0);
  }
  const s = ke(() => e.value, (c, u = []) => {
    const d = c.filter((h) => !o.has(t(h)));
    for (const h of u)
      o.has(t(h)) || d.some((p) => t(p) === t(h)) || h.deleting_at && i?.(t(h));
    if (d.length !== c.length) {
      e.value = d;
      return;
    }
    for (const h of c) {
      h.deleting_at && h.deletion_job === void 0 && !u.includes(h) && (h.deletion_job = null);
      const p = r.get(t(h));
      if (p) {
        const g = h.deletion_job_id;
        h.deleting_at && g && g !== p.state.deletion_job_id && !p.superseded.has(g) && (p.state.deletion_job_id && p.superseded.add(p.state.deletion_job_id), p.state.deletion_job_id = g), g !== p.state.deletion_job_id && (h.deletion_job = void 0), Object.assign(h, p.state);
      }
      const v = u.find((g) => t(g) === t(h));
      h.deletion_job === void 0 && v?.deletion_job_id === h.deletion_job_id && (h.deletion_job = v?.deletion_job);
    }
  }, { immediate: !0 }), l = gi("@message", (c) => {
    const u = Vg(c);
    if (!u) return;
    const d = e.value.find((h) => t(h) === u.component_id);
    u.event === "component.deleted" ? (d && !o.has(u.component_id) && i?.(u.component_id), o.add(u.component_id), r.delete(u.component_id), e.value = e.value.filter((h) => t(h) !== u.component_id)) : d && a(u.component_id, { job_id: u.deletion_job_id });
  });
  return Qe(() => {
    s(), typeof l == "function" && l();
  }), { acceptDeletion: a };
}
function Fg() {
  let e = 0;
  return () => {
    const t = ++e;
    return () => t === e;
  };
}
async function Vd(e, t) {
  const n = io(t), i = await jm(`/api/v1/workflows/${encodeURIComponent(e)}/labels`, { labels: n }), o = yi(i.state), r = Array.isArray(o.labels) ? o.labels : Array.isArray(i.labels) ? i.labels : n;
  return io(r);
}
function Vl(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Hg(e) {
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
async function Bd(e) {
  const t = await kd(`/api/v1/workflows/${encodeURIComponent(e)}/export`);
  return Hg(t.flow);
}
async function qg(e) {
  let t;
  try {
    t = (await zn.post("/api/v1/workflows/import", { flow: e, bindings: {} })).data;
  } catch (r) {
    const a = Xm(r);
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
async function Fd({
  root: e,
  target: t,
  fallback: n,
  isCurrent: i,
  delayMs: o = 500
}) {
  return await new Promise((r) => window.setTimeout(r, o)), i() ? (Bo(e?.activeElement ?? null) || (t && Bo(t) && t.focus(), !Bo(e?.activeElement ?? null) && n && Bo(n) && n.focus()), !0) : !1;
}
const Ug = {
  ok: "tabler:circle-check",
  error: "tabler:alert-triangle",
  pending: "tabler:loader-2"
};
function Wg(e, t) {
  const n = [];
  return e > 0 && n.push(`${e} step${e === 1 ? "" : "s"}`), t > 0 && n.push(`${t} run${t === 1 ? "" : "s"}`), n.join(" · ");
}
function Yg(e) {
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
function Gg(e) {
  const t = (e.breadcrumb || e.parent_name || "").trim();
  return t ? { present: !0, label: t, title: `In ${t}` } : { present: !1, label: "", title: "" };
}
function jg(e, t = Date.now()) {
  const n = e.last_run;
  if (!n || !n.status)
    return { present: !1, tone: "pending", icon: "tabler:minus", label: "No runs", status: "", cause: "", title: "No runs yet" };
  const i = Is(n.status), o = n.started_at || n.finished_at || null, r = Qt(o, t), a = ro(n.status), s = As(n);
  return {
    present: !0,
    tone: i,
    icon: Ug[i],
    label: o ? r : a,
    status: n.status,
    cause: s,
    title: [a, o ? r : "", s].filter(Boolean).join(" · ")
  };
}
function Xg(e, t = Date.now()) {
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
    location: Gg(e),
    subline: Wg(n, i),
    status: Yg(e),
    lastRun: jg(e, t),
    updated: e.updated_at ? Qt(e.updated_at, t) : "No edits"
  };
}
function Kg(e, t = Date.now()) {
  return e.map((n) => Xg(n, t));
}
const er = "", Zg = "No label";
function Jg(e) {
  const t = [];
  for (const n of e)
    for (const i of n.labels)
      t.some((o) => Zi(o, i)) || t.push(i);
  return t.sort((n, i) => n.localeCompare(i, void 0, { sensitivity: "base" }));
}
function Qg(e, t) {
  const n = t.trim();
  return !n || e.some((i) => Zi(i, n)) ? e : [...e, n];
}
function ey(e, t) {
  const n = t.trim();
  return n ? e.filter((i) => !Zi(i, n)) : e;
}
function ty(e, t) {
  return e.labels.some((n) => Zi(n, t));
}
function ny(e, t) {
  return t === er ? e.filter((n) => n.labels.length === 0) : e.filter((n) => ty(n, t));
}
function oy(e) {
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
  return n.length && i.push({ key: er, header: Zg, rows: n }), i;
}
class iy {
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
const Re = {
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
}, Hd = {
  [Re.NODE_ADD]: Te.NODE_ADDED,
  [Re.NODE_UPDATE]: Te.NODE_UPDATED,
  [Re.NODE_REMOVE]: Te.NODE_REMOVED,
  [Re.EDGE_ADD]: Te.EDGE_ADDED,
  [Re.EDGE_UPDATE]: Te.EDGE_UPDATED,
  [Re.EDGE_REMOVE]: Te.EDGE_REMOVED,
  [Re.NOTE_ADD]: Te.NOTE_ADDED,
  [Re.NOTE_UPDATE]: Te.NOTE_UPDATED,
  [Re.NOTE_REMOVE]: Te.NOTE_REMOVED,
  [Re.LAYOUT_SET_POSITION]: Te.LAYOUT_POSITION_SET,
  [Re.LAYOUT_CLEAR_POSITION]: Te.LAYOUT_POSITION_CLEARED,
  [Re.LAYOUT_SET_VIEWPORT]: Te.LAYOUT_VIEWPORT_SET,
  [Re.LAYOUT_SET_DIRECTION]: Te.LAYOUT_DIRECTION_SET,
  [Re.PARAM_SET]: Te.PARAM_SET,
  [Re.LABELS_SET]: Te.LABELS_SET
}, Ds = ["retry_policy", "start_to_close_timeout", "schedule_to_close_timeout"];
function mt() {
  const e = globalThis.crypto;
  return e && typeof e.randomUUID == "function" ? e.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function _i(e) {
  const t = { id: e.id || mt(), kind: e.kind, title: e.title };
  e.ref && (t.ref = e.ref), e.config && (t.config = e.config);
  for (const n of Ds) e[n] !== void 0 && (t[n] = e[n]);
  return { type: Re.NODE_ADD, body: t };
}
function qd(e, t) {
  return { type: Re.NODE_UPDATE, body: { id: e, ...t } };
}
function ry(e) {
  return { type: Re.NODE_REMOVE, body: { id: e } };
}
function ki(e) {
  const t = { id: e.id || mt(), source_id: e.source_id, target_id: e.target_id };
  return e.source_port && (t.source_port = e.source_port), e.target_port && (t.target_port = e.target_port), e.transform && (t.transform = e.transform), { type: Re.EDGE_ADD, body: t };
}
function Ei(e, t) {
  return { type: Re.EDGE_UPDATE, body: { id: e, ...t } };
}
function xi(e) {
  return { type: Re.EDGE_REMOVE, body: { id: e } };
}
function Bl(e) {
  const t = { id: e.id || mt(), body: e.text };
  return e.kind && (t.kind = e.kind), e.width && (t.width = e.width), e.height && (t.height = e.height), e.color && (t.color = e.color), { type: Re.NOTE_ADD, body: t };
}
function ay(e, t) {
  const n = { id: e };
  return t.text !== void 0 && (n.body = t.text), t.kind !== void 0 && (n.kind = t.kind), t.width !== void 0 && (n.width = t.width), t.height !== void 0 && (n.height = t.height), t.color !== void 0 && (n.color = t.color), { type: Re.NOTE_UPDATE, body: n };
}
function sy(e) {
  return { type: Re.NOTE_REMOVE, body: { id: e } };
}
function Ct(e, t, n, i, o) {
  const r = { node_id: e, x: Math.round(t), y: Math.round(n) };
  return Number.isFinite(i) && i && (r.width = Math.round(i)), Number.isFinite(o) && o && (r.height = Math.round(o)), { type: Re.LAYOUT_SET_POSITION, body: r };
}
function ly(e) {
  return { type: Re.LAYOUT_SET_DIRECTION, body: { direction: e } };
}
const Fl = { type: "object", properties: {} };
function uy() {
  const e = mt(), t = mt();
  return [
    _i({ id: e, kind: "start", title: "Start", config: { input_schema: Fl } }),
    Ct(e, 240, 80),
    _i({ id: t, kind: "finish", title: "Finish", config: { output_schema: Fl } }),
    Ct(t, 240, 340)
  ];
}
const cy = { class: "kx-head" }, dy = { class: "kx-head-icon" }, fy = { class: "kx-head-actions" }, hy = {
  key: 0,
  class: "wf-label-filter"
}, py = "Build Workflows from steps, tools, and AI agents. Publish them to use them in Automations, other Workflows, or agents.", Sr = "__all__", vy = /* @__PURE__ */ we({
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
    ], r = W(() => [
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
    return (c, u) => ($(), R("header", cy, [
      x("div", dy, [
        z(f(ae), {
          icon: "tabler:route",
          "aria-hidden": "true"
        })
      ]),
      x("div", { class: "kx-head-text" }, [
        x("h1", {
          class: "kx-title",
          title: py
        }, "Workflows")
      ]),
      x("div", fy, [
        z(f(Od), { class: "kx-search" }, {
          default: ie(() => [
            z(f(Rd), null, {
              default: ie(() => [
                z(f(ae), {
                  icon: "tabler:search",
                  class: "kx-search-ico",
                  "aria-hidden": "true"
                })
              ]),
              _: 1
            }),
            z(f(rt), {
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
        e.labelVocab.length ? ($(), R("div", hy, [
          z(f(ae), {
            icon: "tabler:tag",
            class: "wf-label-filter-ico",
            "aria-hidden": "true"
          }),
          z(f(St), {
            class: "wf-label-select",
            "model-value": e.labelFilter === null ? Sr : e.labelFilter,
            options: r.value,
            "option-label": "label",
            "option-value": "value",
            "aria-label": "Filter by label",
            "onUpdate:modelValue": a
          }, null, 8, ["model-value", "options"])
        ])) : Q("", !0),
        z(f(Ms), {
          class: "kx-seg",
          "model-value": e.groupBy,
          options: [...o],
          "option-label": "label",
          "option-value": "value",
          "aria-label": "Group by label",
          "allow-empty": !1,
          "onUpdate:modelValue": s
        }, null, 8, ["model-value", "options"]),
        z(f(pe), {
          "data-testid": "import-workflow",
          severity: "secondary",
          outlined: "",
          title: "Import a Workflow JSON file",
          onClick: u[1] || (u[1] = (d) => i("import", l(d)))
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:file-import",
              "aria-hidden": "true"
            }),
            u[3] || (u[3] = x("span", null, "Import", -1))
          ]),
          _: 1
        }),
        x("span", {
          class: Ie(["kx-count", { "kx-count--pending": e.totalCount === null }])
        }, Z(e.totalCount ?? 0) + " Workflow" + Z(e.totalCount === 1 ? "" : "s"), 3),
        z(f(pe), {
          "data-testid": "create-workflow",
          onClick: u[2] || (u[2] = (d) => i("create", l(d)))
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:plus",
              "aria-hidden": "true"
            }),
            u[4] || (u[4] = x("span", null, "New Workflow", -1))
          ]),
          _: 1
        })
      ])
    ]));
  }
}), my = { key: 0 }, gy = /* @__PURE__ */ we({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, n = W(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (i, o) => e.state.deleting_at ? ($(), R("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: o[1] || (o[1] = Fe(() => {
      }, ["stop"])),
      onKeydown: o[2] || (o[2] = Fe(() => {
      }, ["stop"]))
    }, [
      n.value ? ($(), R(de, { key: 0 }, [
        x("span", null, [
          o[3] || (o[3] = he("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? ($(), R("span", my, ": " + Z(e.state.deletion_job.last_error), 1)) : Q("", !0)
        ]),
        z(f(pe), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: o[0] || (o[0] = Fe((r) => i.$emit("retry"), ["stop"]))
        })
      ], 64)) : ($(), R(de, { key: 1 }, [
        z(f(yt), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        o[4] || (o[4] = x("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : Q("", !0);
  }
}), yy = 2e3;
function Hl(e) {
  const t = e.margin ?? 8, n = e.gap ?? 4, i = Math.max(0, e.viewportWidth), o = Math.max(0, e.viewportHeight), r = Math.max(0, i - t * 2), a = Math.min(Math.max(0, e.requestedWidth), r), s = e.align === "right" ? e.anchor.right - a : e.anchor.left, l = Math.max(t, Math.min(s, i - t - a)), c = Math.max(0, o - e.anchor.bottom - n - t), u = Math.max(0, e.anchor.top - n - t), d = c < e.requestedMaxHeight && u > c ? "above" : "below", h = d === "above" ? u : c, p = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), h)), v = Math.min(Math.max(0, e.panelHeight ?? p), p), g = d === "above" ? e.anchor.top - n - v : e.anchor.bottom + n, m = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(l - m.left),
    width: Math.round(a),
    maxHeight: p,
    side: d,
    top: Math.round(g - m.top)
  };
}
const wy = /* @__PURE__ */ we({
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
    const n = e, i = t, o = j(null), r = j({ position: "fixed", visibility: "hidden" });
    function a() {
      const g = n.anchor, m = o.value;
      if (!g || !m) return;
      const _ = g.getBoundingClientRect(), E = n.width === "anchor" ? Math.max(n.minWidth, _.width) : Math.max(n.minWidth, n.width), w = {
        anchor: _,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: E,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, b = Hl(w);
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
      const S = m.getBoundingClientRect(), N = Hl({
        ...w,
        containingBlockOrigin: { left: S.left, top: S.top },
        panelHeight: S.height
      }), V = {
        position: "fixed",
        left: `${N.left}px`,
        top: `${N.top}px`,
        width: `${N.width}px`,
        maxHeight: `${N.maxHeight}px`,
        "--anchored-panel-available-height": `${N.maxHeight}px`,
        margin: "0",
        zIndex: String(n.zIndex),
        visibility: "visible"
      };
      r.value = V;
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
    ke(() => n.open, async (g) => {
      d(), g && (r.value = { position: "fixed", visibility: "hidden" }, await ze(), a(), u());
    }, { immediate: !0 });
    function h(g) {
      if (!n.open) return;
      const m = g.composedPath();
      o.value && m.includes(o.value) || n.anchor && m.includes(n.anchor) || i("update:open", !1);
    }
    function p(g) {
      !n.open || g.key !== "Escape" || (g.preventDefault(), g.stopImmediatePropagation(), i("update:open", !1));
    }
    function v() {
      n.open && a();
    }
    return document.addEventListener("click", h), document.addEventListener("keydown", p, !0), window.addEventListener("resize", v), window.addEventListener("scroll", v, !0), Qe(() => {
      d(), document.removeEventListener("click", h), document.removeEventListener("keydown", p, !0), window.removeEventListener("resize", v), window.removeEventListener("scroll", v, !0);
    }), (g, m) => e.open ? ($(), R("div", {
      key: 0,
      ref_key: "panel",
      ref: o,
      class: "anchored-panel",
      style: He(r.value)
    }, [
      Ve(g.$slots, "default")
    ], 4)) : Q("", !0);
  }
});
function Ud(e) {
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
}, zy = {
  key: 0,
  class: "wf-row-menu-sep",
  role: "separator"
}, Vy = ["title", "disabled", "aria-label", "onClick"], By = /* @__PURE__ */ we({
  __name: "WorkflowTable",
  props: {
    items: {}
  },
  emits: ["open", "labels-saved", "label-error", "export-error", "share", "ask-delete"],
  setup(e, { emit: t }) {
    function n(k) {
      return k === "published" ? "success" : "warn";
    }
    function i(k) {
      return k.lastRun.present ? k.lastRun.tone === "ok" ? "success" : k.lastRun.tone === "error" ? "danger" : "info" : "secondary";
    }
    const o = e, r = t, a = j(null), s = j(""), l = j(""), c = j(null), u = j(null), d = j(""), h = j(null), p = W({
      get: () => u.value !== null,
      set: (k) => {
        k || N();
      }
    }), v = W(() => {
      const k = u.value;
      if (!k) return null;
      const B = o.items.find((y) => y.kind === "row" && y.row.id === k);
      return B?.kind === "row" ? B.row : null;
    });
    function g(k, B) {
      B.stopPropagation();
      const y = a.value !== k;
      a.value = y ? k : null, s.value = "", r("label-error", ""), y && ze(m);
    }
    function m() {
      const k = c.value?.$el;
      k instanceof HTMLInputElement && k.focus();
    }
    function _() {
      a.value = null, s.value = "";
    }
    async function E(k, B) {
      l.value = k, r("label-error", "");
      try {
        const y = await Vd(k, B);
        r("labels-saved", k, y);
      } catch (y) {
        r("label-error", qe(y, "Couldn’t update labels."));
      } finally {
        l.value = "";
      }
    }
    async function w(k) {
      const B = io(k.labels), y = Qg(B, s.value);
      s.value = "", y !== B && await E(k.id, y);
    }
    async function b(k, B, y) {
      y.stopPropagation(), await E(k.id, ey(io(k.labels), B));
    }
    function S(k, B) {
      if (B.stopPropagation(), u.value === k) {
        N();
        return;
      }
      u.value = k, h.value = B.currentTarget instanceof HTMLElement ? B.currentTarget : null;
    }
    function N() {
      u.value = null, h.value = null;
    }
    function V(k) {
      k.disabled || !k.command || k.command();
    }
    async function A(k) {
      if (!(!k.status.published || d.value)) {
        d.value = k.id, r("export-error", "");
        try {
          const B = await Bd(k.id);
          Ps(Ud(B.title), B), N();
        } catch (B) {
          r("export-error", qe(B, "Couldn’t export this Workflow."));
        } finally {
          d.value = "";
        }
      }
    }
    function T(k) {
      const B = h.value;
      N(), r("ask-delete", k, B);
    }
    function L(k) {
      const B = h.value;
      N(), r("share", k, B);
    }
    const M = W(() => {
      const k = v.value;
      if (!k) return [];
      const B = k.status.published && d.value !== k.id, y = k.status.published ? "Export" : "Export unavailable. Publish this Workflow before exporting it.";
      return [
        {
          label: "Share",
          icon: "tabler:share",
          title: "Share this Workflow",
          command: () => L(k)
        },
        { separator: !0 },
        {
          label: y,
          visibleLabel: "Export",
          icon: "tabler:download",
          disabled: !B,
          title: k.status.published ? "Download this published Workflow as JSON" : "Publish this Workflow before exporting it",
          command: () => A(k)
        },
        { separator: !0 },
        {
          label: "Delete",
          icon: "tabler:trash",
          title: "Delete this Workflow",
          danger: !0,
          command: () => T(k)
        }
      ];
    });
    return (k, B) => ($(), R(de, null, [
      x("div", by, [
        B[5] || (B[5] = x("div", {
          class: "wf-table-head",
          role: "row"
        }, [
          x("span", { role: "columnheader" }, "Name"),
          x("span", { role: "columnheader" }, "Labels"),
          x("span", { role: "columnheader" }, "Location"),
          x("span", { role: "columnheader" }, "Status"),
          x("span", { role: "columnheader" }, "Last run"),
          x("span", { role: "columnheader" }, "Updated"),
          x("span", {
            role: "columnheader",
            class: "wf-sr-only"
          }, "Actions")
        ], -1)),
        ($(!0), R(de, null, Oe(e.items, (y) => ($(), R(de, {
          key: y.key
        }, [
          y.kind === "header" ? ($(), R("div", _y, [
            z(f(ae), {
              icon: y.empty ? "tabler:tag-off" : "tabler:tag",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            x("span", ky, Z(y.header), 1),
            x("span", Ey, Z(y.count), 1)
          ])) : ($(), R("div", {
            key: 1,
            class: "kx-row wf-row",
            role: "row",
            tabindex: "0",
            onClick: (I) => !y.row.deleting_at && r("open", y.row.id),
            onKeydown: [
              tt(Fe((I) => !y.row.deleting_at && r("open", y.row.id), ["self"]), ["enter"]),
              tt(Fe((I) => !y.row.deleting_at && r("open", y.row.id), ["self", "prevent"]), ["space"])
            ]
          }, [
            x("span", $y, [
              x("span", Sy, [
                z(f(ae), {
                  icon: "tabler:route",
                  "aria-hidden": "true"
                })
              ]),
              x("span", Cy, [
                z(gy, {
                  state: y.row,
                  onRetry: (I) => T(y.row)
                }, null, 8, ["state", "onRetry"]),
                x("span", Ny, [
                  x("strong", null, Z(y.row.title), 1)
                ]),
                y.row.subline ? ($(), R("span", Iy, Z(y.row.subline), 1)) : Q("", !0)
              ])
            ]),
            x("span", {
              class: "wf-labels-cell",
              role: "cell",
              "data-label": "Labels",
              onClick: B[2] || (B[2] = Fe(() => {
              }, ["stop"]))
            }, [
              ($(!0), R(de, null, Oe(y.row.labels, (I) => ($(), R("span", {
                key: I,
                class: "wf-label-chip"
              }, [
                x("span", Ay, Z(I), 1),
                z(f(pe), {
                  class: "wf-label-x",
                  text: "",
                  rounded: "",
                  severity: "secondary",
                  "aria-label": `Remove label ${I}`,
                  disabled: !!y.row.deleting_at || l.value === y.row.id,
                  onClick: Fe((C) => b(y.row, I, C), ["stop"])
                }, {
                  default: ie(() => [
                    z(f(ae), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ]))), 128)),
              a.value === y.row.id ? ($(), R(de, { key: 0 }, [
                z(f(rt), {
                  ref_for: !0,
                  ref_key: "labelInputRef",
                  ref: c,
                  modelValue: s.value,
                  "onUpdate:modelValue": B[0] || (B[0] = (I) => s.value = I),
                  class: "wf-label-input",
                  type: "text",
                  placeholder: "Add label…",
                  "aria-label": `Add a label to ${y.row.title}`,
                  onClick: B[1] || (B[1] = Fe(() => {
                  }, ["stop"])),
                  onKeydown: [
                    tt(Fe((I) => w(y.row), ["stop", "prevent"]), ["enter"]),
                    tt(Fe(_, ["stop"]), ["escape"])
                  ]
                }, null, 8, ["modelValue", "aria-label", "onKeydown"]),
                z(f(pe), {
                  class: "wf-label-done",
                  text: "",
                  rounded: "",
                  severity: "secondary",
                  "aria-label": "Done editing labels",
                  onClick: Fe(_, ["stop"])
                }, {
                  default: ie(() => [
                    z(f(ae), {
                      icon: "tabler:check",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                })
              ], 64)) : ($(), se(f(pe), {
                key: 1,
                class: "wf-label-add",
                text: "",
                severity: "secondary",
                "aria-label": `Add a label to ${y.row.title}`,
                disabled: !!y.row.deleting_at || l.value === y.row.id,
                loading: l.value === y.row.id,
                onClick: Fe((I) => g(y.row.id, I), ["stop"])
              }, {
                default: ie(() => [
                  l.value !== y.row.id ? ($(), se(f(ae), {
                    key: 0,
                    icon: "tabler:plus",
                    "aria-hidden": "true"
                  })) : Q("", !0),
                  y.row.labels.length ? Q("", !0) : ($(), R("span", Ty, "Label"))
                ]),
                _: 2
              }, 1032, ["aria-label", "disabled", "loading", "onClick"]))
            ]),
            x("span", {
              class: Ie(["wf-loc-cell", !y.row.location.present && "is-empty"]),
              role: "cell",
              "data-label": "Location"
            }, [
              y.row.location.present ? ($(), R(de, { key: 0 }, [
                z(f(ae), {
                  icon: "tabler:folder",
                  class: "wf-loc-ico",
                  "aria-hidden": "true"
                }),
                x("span", {
                  class: "wf-loc-name",
                  title: y.row.location.title
                }, Z(y.row.location.label), 9, My)
              ], 64)) : Q("", !0)
            ], 2),
            x("span", Oy, [
              z(f(gt), {
                class: "wf-status-tag",
                severity: n(y.row.status.tone),
                title: y.row.status.hasDraft && y.row.status.published ? "Published, with unpublished draft edits" : y.row.status.published ? "Published" : "Not published yet"
              }, {
                default: ie(() => [
                  y.row.status.hasDraft && y.row.status.published ? ($(), se(f(ae), {
                    key: 0,
                    icon: "tabler:pencil",
                    class: "wf-pill-ico",
                    "aria-hidden": "true"
                  })) : Q("", !0),
                  he(" " + Z(y.row.status.label), 1)
                ]),
                _: 2
              }, 1032, ["severity", "title"])
            ]),
            x("span", Ry, [
              z(f(gt), {
                class: "wf-last-run-tag",
                severity: i(y.row),
                title: y.row.lastRun.title
              }, {
                default: ie(() => [
                  y.row.lastRun.present && y.row.lastRun.tone === "pending" ? ($(), se(f(yt), {
                    key: 0,
                    class: "wf-status-spinner",
                    "stroke-width": "4",
                    "aria-label": "Run in progress"
                  })) : ($(), se(f(ae), {
                    key: 1,
                    icon: y.row.lastRun.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])),
                  x("span", null, Z(y.row.lastRun.label), 1)
                ]),
                _: 2
              }, 1032, ["severity", "title"]),
              y.row.lastRun.cause ? ($(), R("span", {
                key: 0,
                class: "wf-last-run-cause",
                title: y.row.lastRun.cause
              }, Z(y.row.lastRun.cause), 9, Dy)) : Q("", !0)
            ]),
            x("span", Py, Z(y.row.updated), 1),
            x("span", {
              class: "wf-row-actions",
              role: "cell",
              onClick: B[3] || (B[3] = Fe(() => {
              }, ["stop"]))
            }, [
              z(f(pe), {
                class: Ie(["wf-row-menu-btn", u.value === y.row.id && "is-open"]),
                disabled: !!y.row.deleting_at,
                text: "",
                rounded: "",
                severity: "secondary",
                "aria-label": `Actions for ${y.row.title}`,
                "aria-expanded": u.value === y.row.id,
                onClick: Fe((I) => S(y.row.id, I), ["stop"])
              }, {
                default: ie(() => [
                  z(f(ae), {
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
        "onUpdate:open": B[4] || (B[4] = (y) => p.value = y),
        anchor: h.value,
        align: "right",
        width: 190
      }, {
        default: ie(() => [
          x("div", Ly, [
            ($(!0), R(de, null, Oe(M.value, (y, I) => ($(), R(de, { key: I }, [
              y.separator ? ($(), R("div", zy)) : ($(), R("button", {
                key: 1,
                type: "button",
                class: Ie(["wf-row-menu-item", y.danger && "wf-row-menu-item--danger"]),
                role: "menuitem",
                title: y.title,
                disabled: y.disabled,
                "aria-label": y.label,
                onClick: (C) => V(y)
              }, [
                y.icon ? ($(), se(f(ae), {
                  key: 0,
                  icon: y.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : Q("", !0),
                x("span", null, Z(y.visibleLabel || y.label), 1)
              ], 10, Vy))
            ], 64))), 128))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), Fy = { class: "kx-modal-head-icon" }, Hy = { class: "kx-modal-body" }, qy = { class: "kx-field" }, Uy = { class: "kx-field" }, Wy = /* @__PURE__ */ we({
  __name: "ImportModal",
  props: {
    open: { type: Boolean }
  },
  emits: ["close", "open"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = j(""), r = j(!1), a = j(""), s = j(null), l = { severity: "secondary", outlined: !0 }, c = {
      header: { class: "kx-modal-head" },
      content: { style: "padding: 0" },
      footer: { class: "kx-modal-foot" }
    };
    ke(() => n.open, (p) => {
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
        const { flowId: g } = await qg(v);
        i("open", g);
      } catch (g) {
        a.value = qe(g, "Couldn’t import this Workflow.");
      } finally {
        r.value = !1;
      }
    }
    return (p, v) => ($(), se(f(Jt), {
      visible: e.open,
      modal: !0,
      "dismissable-mask": !0,
      class: "kx-modal",
      pt: c,
      "aria-label": "Import Workflow",
      "onUpdate:visible": u
    }, {
      header: ie(() => [
        x("span", Fy, [
          z(f(ae), {
            icon: "tabler:file-import",
            "aria-hidden": "true"
          })
        ]),
        v[2] || (v[2] = x("div", {
          class: "kx-modal-head-text",
          style: { flex: "1" }
        }, [
          x("div", { class: "kx-modal-head-title" }, "Import a Workflow"),
          x("div", { class: "kx-modal-head-sub" }, "Paste an exported Workflow or choose a file. We’ll create a draft copy.")
        ], -1))
      ]),
      footer: ie(() => [
        z(f(pe), {
          severity: "secondary",
          text: "",
          onClick: v[1] || (v[1] = (g) => i("close"))
        }, {
          default: ie(() => [...v[4] || (v[4] = [
            he("Cancel", -1)
          ])]),
          _: 1
        }),
        z(f(pe), {
          disabled: r.value,
          loading: r.value,
          onClick: h
        }, {
          default: ie(() => [
            r.value ? Q("", !0) : ($(), se(f(ae), {
              key: 0,
              icon: "tabler:file-import",
              "aria-hidden": "true"
            })),
            v[5] || (v[5] = x("span", null, "Import", -1))
          ]),
          _: 1
        }, 8, ["disabled", "loading"])
      ]),
      default: ie(() => [
        x("div", Hy, [
          x("div", qy, [
            z(f(xg), {
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
              chooseicon: ie(() => [
                z(f(ae), {
                  icon: "tabler:upload",
                  "aria-hidden": "true"
                })
              ]),
              _: 1
            }, 512)
          ]),
          x("div", Uy, [
            v[3] || (v[3] = x("label", { class: "kx-field-lbl" }, "Exported Workflow JSON", -1)),
            z(f(Os), {
              modelValue: o.value,
              "onUpdate:modelValue": v[0] || (v[0] = (g) => o.value = g),
              class: "kx-input wf-import-text wf-mono",
              rows: "9",
              placeholder: '{ "title": "My Workflow", "spec": { … } }',
              "aria-label": "Exported Workflow JSON"
            }, null, 8, ["modelValue"])
          ]),
          a.value ? ($(), se(f(Be), {
            key: 0,
            class: "wf-setup-error",
            severity: "error",
            closable: !1
          }, {
            default: ie(() => [
              he(Z(a.value), 1)
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
async function Wd(e, t, n, i) {
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
}, Jy = { class: "kx-modal-head-icon wf-del-icon" }, Qy = { class: "kx-modal-body" }, ew = { class: "wf-del-note" }, tw = {
  key: 1,
  role: "status",
  "aria-label": "Loading Workflows"
}, nw = {
  class: "wf-list-skeleton",
  "aria-hidden": "true"
}, ow = {
  key: 2,
  class: "kx-empty",
  role: "alert"
}, iw = { class: "kx-empty-sub" }, rw = {
  key: 3,
  class: "kx-empty"
}, aw = { class: "kx-empty-ico" }, sw = {
  key: 4,
  class: "kx-empty"
}, lw = { class: "kx-empty-ico" }, uw = { class: "kx-empty-title" }, cw = { class: "kx-empty-sub" }, dw = /* @__PURE__ */ we({
  __name: "WorkflowList",
  emits: ["open"],
  setup(e, { emit: t }) {
    const n = t, i = hd(), o = W(() => {
      const re = i.value || {};
      return (typeof re.parentId == "string" ? re.parentId : "").trim();
    }), r = j([]), a = j(!0), s = j(""), l = j(!1), c = W(() => a.value && r.value.length === 0), u = j(""), d = j(""), h = j(""), p = j(""), v = j(!1), g = j(null), m = j("flat"), _ = j(""), E = j(!1), w = j(!1), b = j(null), S = j(null), N = j(null), V = j(null), A = j(null);
    let T = 0;
    function L(re = null) {
      T += 1;
      const te = N.value?.getRootNode();
      V.value = te?.activeElement instanceof HTMLElement ? te.activeElement : null, A.value = re;
    }
    async function M() {
      const re = T, te = V.value, ce = A.value;
      await ze();
      const be = N.value?.getRootNode();
      await Fd({
        root: be ?? null,
        target: te,
        fallback: ce,
        isCurrent: () => re === T
      }) && (T += 1, V.value = null, A.value = null);
    }
    const k = new iy({
      createWorkflow: (re, te) => Km(re, te),
      applyScaffold: (re) => xd(re, uy()).then(() => {
      }),
      setLabels: (re, te) => Vd(re, te).then(() => {
      }),
      deleteWorkflow: (re) => Tl(re)
    }), B = W(() => Kg(r.value)), y = W(() => Jg(B.value)), I = W(() => {
      const re = d.value.trim().toLowerCase();
      let te = B.value.filter((ce) => re ? `${ce.title} ${ce.id}`.toLowerCase().includes(re) : !0);
      return g.value !== null && (te = ny(te, g.value)), te;
    }), C = W(() => oy(I.value)), H = W(() => {
      if (m.value !== "label") return I.value.map((te) => ({ kind: "row", key: te.id, row: te }));
      const re = [];
      for (const te of C.value) {
        re.push({ kind: "header", key: `h:${te.key}`, header: te.header, empty: te.key === er, count: te.rows.length });
        for (const ce of te.rows) re.push({ kind: "row", key: `${te.key}:${ce.id}`, row: ce });
      }
      return re;
    }), F = W(() => r.value.length);
    function q(re, te) {
      r.value = r.value.map((ce) => ce.id === re ? { ...ce, labels: te } : ce);
    }
    const U = Fg();
    async function ne() {
      const re = U();
      a.value = !0, s.value = "";
      try {
        const te = await Ed();
        re() && (r.value = te, l.value = !0);
      } catch (te) {
        re() && (s.value = qe(te, "Couldn’t load your Workflows."));
      } finally {
        re() && (a.value = !1);
      }
    }
    const ue = W(() => !!h.value.trim() && !v.value);
    function G() {
      L(), h.value = "", p.value = "", u.value = "", E.value = !0;
    }
    function J() {
      E.value = !1, M(), k.pendingDraftId && k.abandon().then(ne);
    }
    async function K() {
      if (!E.value || v.value) return;
      const re = h.value.trim();
      if (!re) {
        u.value = "Name your Workflow first.";
        return;
      }
      v.value = !0, u.value = "";
      try {
        const te = await k.create(re, p.value, o.value || void 0);
        E.value = !1, n("open", te);
      } catch (te) {
        u.value = qe(te, "Couldn’t create the Workflow.");
      } finally {
        v.value = !1;
      }
    }
    const X = j(null), oe = j(!1), le = j(!1), fe = {
      header: { class: "kx-modal-head" },
      content: { style: "padding: 0" },
      footer: { class: "kx-modal-foot" }
    };
    function _e() {
      L(), w.value = !0;
    }
    function $e() {
      w.value = !1, M();
    }
    function me(re) {
      const te = Array.from(N.value?.querySelectorAll("button[aria-label]") ?? []).find((ce) => ce.getAttribute("aria-label") === `Actions for ${re.title}`) ?? null;
      L(te), le.value = !1, X.value = re;
    }
    function ge() {
      le.value = !1, X.value = null, M();
    }
    async function P() {
      le.value && (le.value = !1, await ze(), N.value?.querySelector('button[aria-label^="Actions for"]')?.focus(), T += 1, V.value = null, A.value = null);
    }
    async function O() {
      const re = X.value;
      if (!(!re || oe.value)) {
        oe.value = !0, u.value = "";
        try {
          await Tl(re.id), ee(re.id), await ne(), le.value = !0, X.value = null;
        } catch (te) {
          u.value = qe(te, "Couldn’t delete this Workflow.");
        } finally {
          oe.value = !1;
        }
      }
    }
    async function D(re) {
      const te = Array.from(N.value?.querySelectorAll("button[aria-label]") ?? []).find((ce) => ce.getAttribute("aria-label") === `Actions for ${re.title}`) ?? null;
      L(te), b.value = re, await ze(), S.value && await Wd(S.value, re.id, re.title, Y);
    }
    function Y() {
      b.value = null, M();
    }
    pd(ne);
    const { acceptDeletion: ee } = Bg(r, (re) => re.id, void 0, ne);
    return (re, te) => ($(), R("div", {
      ref_key: "rootEl",
      ref: N,
      class: "wf-list kx"
    }, [
      z(vy, {
        "total-count": l.value ? F.value : null,
        "label-vocab": y.value,
        q: d.value,
        "onUpdate:q": te[0] || (te[0] = (ce) => d.value = ce),
        "label-filter": g.value,
        "onUpdate:labelFilter": te[1] || (te[1] = (ce) => g.value = ce),
        "group-by": m.value,
        "onUpdate:groupBy": te[2] || (te[2] = (ce) => m.value = ce),
        onImport: _e,
        onCreate: G
      }, null, 8, ["total-count", "label-vocab", "q", "label-filter", "group-by"]),
      u.value ? ($(), se(f(Be), {
        key: 0,
        class: "wf-banner",
        severity: "error",
        onClose: te[3] || (te[3] = (ce) => u.value = "")
      }, {
        default: ie(() => [
          he(Z(u.value), 1)
        ]),
        _: 1
      })) : Q("", !0),
      _.value ? ($(), se(f(Be), {
        key: 1,
        class: "wf-banner",
        severity: "error",
        onClose: te[4] || (te[4] = (ce) => _.value = "")
      }, {
        default: ie(() => [
          he(Z(_.value), 1)
        ]),
        _: 1
      })) : Q("", !0),
      z(f(Jt), {
        visible: E.value,
        modal: !0,
        "dismissable-mask": !0,
        class: "kx-modal",
        pt: fe,
        "aria-label": "New Workflow",
        "onUpdate:visible": te[7] || (te[7] = (ce) => {
          ce || J();
        })
      }, {
        header: ie(() => [
          x("span", Gy, [
            z(f(ae), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          te[13] || (te[13] = x("div", {
            class: "kx-modal-head-text",
            style: { flex: "1" }
          }, [
            x("div", { class: "kx-modal-head-title" }, "New Workflow"),
            x("div", { class: "kx-modal-head-sub" }, "Start with inputs and a result. Add an Error exit only when you need one.")
          ], -1))
        ]),
        footer: ie(() => [
          z(f(pe), {
            severity: "secondary",
            text: "",
            onClick: J
          }, {
            default: ie(() => [...te[17] || (te[17] = [
              he("Cancel", -1)
            ])]),
            _: 1
          }),
          z(f(pe), {
            disabled: !ue.value,
            loading: v.value,
            onClick: K
          }, {
            default: ie(() => [
              v.value ? Q("", !0) : ($(), se(f(ae), {
                key: 0,
                icon: "tabler:check",
                "aria-hidden": "true"
              })),
              te[18] || (te[18] = x("span", null, "Create", -1))
            ]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        default: ie(() => [
          x("div", jy, [
            x("div", Xy, [
              te[14] || (te[14] = x("label", { class: "kx-field-lbl" }, "Name", -1)),
              z(f(rt), {
                modelValue: h.value,
                "onUpdate:modelValue": te[5] || (te[5] = (ce) => h.value = ce),
                class: "kx-input",
                type: "text",
                placeholder: "Name your Workflow",
                "aria-label": "Workflow name",
                autofocus: "",
                onKeydown: tt(K, ["enter"])
              }, null, 8, ["modelValue"])
            ]),
            x("div", Ky, [
              te[15] || (te[15] = x("label", { class: "kx-field-lbl" }, [
                he("Label "),
                x("span", { class: "kx-field-opt" }, "optional")
              ], -1)),
              z(f(rt), {
                modelValue: p.value,
                "onUpdate:modelValue": te[6] || (te[6] = (ce) => p.value = ce),
                class: "kx-input",
                type: "text",
                placeholder: "e.g. sales",
                "aria-label": "Workflow label",
                onKeydown: tt(K, ["enter"])
              }, null, 8, ["modelValue"])
            ]),
            o.value ? ($(), R("p", Zy, [
              z(f(ae), {
                icon: "tabler:folder",
                "aria-hidden": "true"
              }),
              te[16] || (te[16] = x("span", null, "Placed in the selected folder.", -1))
            ])) : Q("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      z(Wy, {
        open: w.value,
        onClose: $e,
        onOpen: te[8] || (te[8] = (ce) => n("open", ce))
      }, null, 8, ["open"]),
      z(f(Jt), {
        visible: !!X.value,
        modal: !0,
        "dismissable-mask": !0,
        class: "kx-modal wf-del-modal",
        pt: fe,
        "aria-label": "Delete Workflow",
        "onUpdate:visible": te[9] || (te[9] = (ce) => {
          ce || ge();
        }),
        onAfterHide: P
      }, {
        header: ie(() => [
          x("span", Jy, [
            z(f(ae), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            })
          ]),
          te[19] || (te[19] = x("div", {
            class: "kx-modal-head-text",
            style: { flex: "1" }
          }, [
            x("div", { class: "kx-modal-head-title" }, "Delete Workflow"),
            x("div", { class: "kx-modal-head-sub" }, "This removes the Workflow and its history. It can’t be undone.")
          ], -1))
        ]),
        footer: ie(() => [
          z(f(pe), {
            severity: "secondary",
            text: "",
            onClick: ge
          }, {
            default: ie(() => [...te[22] || (te[22] = [
              he("Cancel", -1)
            ])]),
            _: 1
          }),
          z(f(pe), {
            severity: "danger",
            disabled: oe.value,
            loading: oe.value,
            onClick: O
          }, {
            default: ie(() => [
              oe.value ? Q("", !0) : ($(), se(f(ae), {
                key: 0,
                icon: "tabler:trash",
                "aria-hidden": "true"
              })),
              te[23] || (te[23] = x("span", null, "Delete", -1))
            ]),
            _: 1
          }, 8, ["disabled", "loading"])
        ]),
        default: ie(() => [
          x("div", Qy, [
            x("p", ew, [
              te[20] || (te[20] = he("Delete ", -1)),
              x("strong", null, Z(X.value?.title), 1),
              te[21] || (te[21] = he("?", -1))
            ])
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      x("main", {
        class: Ie(["kx-body", { "kx-body--state": !c.value && !I.value.length }])
      }, [
        s.value && r.value.length ? ($(), se(f(Be), {
          key: 0,
          class: "wf-banner",
          severity: "error"
        }, {
          default: ie(() => [
            he(Z(s.value) + " ", 1),
            z(f(pe), {
              label: "Retry",
              size: "small",
              text: "",
              onClick: ne
            })
          ]),
          _: 1
        })) : Q("", !0),
        c.value ? ($(), R("div", tw, [
          x("div", nw, [
            ($(), R(de, null, Oe(3, (ce) => x("div", {
              key: ce,
              class: "wf-list-skeleton-row"
            }, [
              z(f(Al), {
                width: "2rem",
                height: "2rem",
                animation: "none"
              }),
              z(f(Al), {
                width: "min(12rem, 45%)",
                height: "0.875rem",
                animation: "none"
              })
            ])), 64))
          ])
        ])) : s.value && !r.value.length ? ($(), R("div", ow, [
          te[24] || (te[24] = x("p", { class: "kx-empty-title" }, "Couldn’t load Workflows", -1)),
          x("p", iw, Z(s.value), 1),
          z(f(pe), {
            label: "Retry",
            onClick: ne
          })
        ])) : !I.value.length && !d.value.trim() && g.value === null ? ($(), R("div", rw, [
          x("div", aw, [
            z(f(ae), {
              icon: "tabler:route",
              "aria-hidden": "true"
            })
          ]),
          te[26] || (te[26] = x("p", { class: "kx-empty-title" }, "No Workflows yet", -1)),
          te[27] || (te[27] = x("p", { class: "kx-empty-sub" }, "Create a Workflow from typed Blocks, then publish it when it’s ready.", -1)),
          z(f(pe), { onClick: G }, {
            default: ie(() => [
              z(f(ae), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              }),
              te[25] || (te[25] = x("span", null, "New Workflow", -1))
            ]),
            _: 1
          })
        ])) : I.value.length ? ($(), se(By, {
          key: 5,
          items: H.value,
          onOpen: te[10] || (te[10] = (ce) => n("open", ce)),
          onLabelsSaved: q,
          onLabelError: te[11] || (te[11] = (ce) => _.value = ce),
          onExportError: te[12] || (te[12] = (ce) => u.value = ce),
          onShare: D,
          onAskDelete: me
        }, null, 8, ["items"])) : ($(), R("div", sw, [
          x("div", lw, [
            z(f(ae), {
              icon: "tabler:search",
              "aria-hidden": "true"
            })
          ]),
          x("p", uw, Z(g.value !== null ? "No Workflows with this label" : "No matches"), 1),
          x("p", cw, Z(g.value !== null ? "No Workflows carry this label yet — add it to a Workflow from its row." : `Nothing matches "${d.value}".`), 1)
        ]))
      ], 2),
      b.value ? ($(), R("div", {
        key: 2,
        ref_key: "shareHost",
        ref: S
      }, null, 512)) : Q("", !0)
    ], 512));
  }
});
function lo(e) {
  return vd() ? (ri(e), !0) : !1;
}
function Dt(e) {
  return typeof e == "function" ? e() : f(e);
}
const fw = typeof window < "u" && typeof document < "u", hw = (e) => typeof e < "u", pw = Object.prototype.toString, vw = (e) => pw.call(e) === "[object Object]", mw = () => {
};
function gw(e, t) {
  function n(...i) {
    return new Promise((o, r) => {
      Promise.resolve(e(() => t.apply(this, i), { fn: t, thisArg: this, args: i })).then(o).catch(r);
    });
  }
  return n;
}
const Yd = (e) => e();
function yw(e = Yd) {
  const t = j(!0);
  function n() {
    t.value = !1;
  }
  function i() {
    t.value = !0;
  }
  const o = (...r) => {
    t.value && e(...r);
  };
  return { isActive: qm(t), pause: n, resume: i, eventFilter: o };
}
function ql(e, t = !1, n = "Timeout") {
  return new Promise((i, o) => {
    setTimeout(t ? () => o(n) : i, e);
  });
}
function ww(e, t, n = {}) {
  const {
    eventFilter: i = Yd,
    ...o
  } = n;
  return ke(
    e,
    gw(
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
  } = n, { eventFilter: r, pause: a, resume: s, isActive: l } = yw(i);
  return { stop: ww(
    e,
    t,
    {
      ...o,
      eventFilter: r
    }
  ), pause: a, resume: s, isActive: l };
}
function bw(e, t = {}) {
  if (!$s(e))
    return Fm(e);
  const n = Array.isArray(e.value) ? Array.from({ length: e.value.length }) : {};
  for (const i in e.value)
    n[i] = Hm(() => ({
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
  function n(d, { flush: h = "sync", deep: p = !1, timeout: v, throwOnTimeout: g } = {}) {
    let m = null;
    const E = [new Promise((w) => {
      m = ke(
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
    return v != null && E.push(
      ql(v, g).then(() => Dt(e)).finally(() => m?.())
    ), Promise.race(E);
  }
  function i(d, h) {
    if (!$s(d))
      return n((b) => b === d, h);
    const { flush: p = "sync", deep: v = !1, timeout: g, throwOnTimeout: m } = h ?? {};
    let _ = null;
    const w = [new Promise((b) => {
      _ = ke(
        [e, d],
        ([S, N]) => {
          t !== (S === N) && (_?.(), b(S));
        },
        {
          flush: p,
          deep: v,
          immediate: !0
        }
      );
    })];
    return g != null && w.push(
      ql(g, m).then(() => Dt(e)).finally(() => (_?.(), Dt(e)))
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
function _w(e) {
  var t;
  const n = Dt(e);
  return (t = n?.$el) != null ? t : n;
}
const Gd = fw ? window : void 0;
function jd(...e) {
  let t, n, i, o;
  if (typeof e[0] == "string" || Array.isArray(e[0]) ? ([n, i, o] = e, t = Gd) : [t, n, i, o] = e, !t)
    return mw;
  Array.isArray(n) || (n = [n]), Array.isArray(i) || (i = [i]);
  const r = [], a = () => {
    r.forEach((u) => u()), r.length = 0;
  }, s = (u, d, h, p) => (u.addEventListener(d, h, p), () => u.removeEventListener(d, h, p)), l = ke(
    () => [_w(t), Dt(o)],
    ([u, d]) => {
      if (a(), !u)
        return;
      const h = vw(d) ? { ...d } : d;
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
function kw(e) {
  return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function Ul(...e) {
  let t, n, i = {};
  e.length === 3 ? (t = e[0], n = e[1], i = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], i = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
  const {
    target: o = Gd,
    eventName: r = "keydown",
    passive: a = !1,
    dedupe: s = !1
  } = i, l = kw(t);
  return jd(o, r, (u) => {
    u.repeat && Dt(s) || l(u) && n(u);
  }, a);
}
function Ew(e) {
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
  } = i, p = Ln(), v = n || p?.emit || ((o = p?.$emit) == null ? void 0 : o.bind(p)) || ((a = (r = p?.proxy) == null ? void 0 : r.$emit) == null ? void 0 : a.bind(p?.proxy));
  let g = c;
  t || (t = "modelValue"), g = g || `update:${t.toString()}`;
  const m = (w) => s ? typeof s == "function" ? s(w) : Ew(w) : w, _ = () => hw(e[t]) ? m(e[t]) : d, E = (w) => {
    h ? h(w) && v(g, w) : v(g, w);
  };
  if (l) {
    const w = _(), b = j(w);
    let S = !1;
    return ke(
      () => e[t],
      (N) => {
        S || (S = !0, b.value = m(N), ze(() => S = !1));
      }
    ), ke(
      b,
      (N) => {
        !S && (N !== e[t] || u) && E(N);
      },
      { deep: u }
    ), b;
  } else
    return W({
      get() {
        return _();
      },
      set(w) {
        E(w);
      }
    });
}
var xw = { value: () => {
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
function $w(e, t) {
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
    var n = this._, i = $w(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; )
        if ((o = (e = i[r]).type) && (o = Sw(n[o], e.name)))
          return o;
      return;
    }
    if (t != null && typeof t != "function")
      throw new Error("invalid callback: " + t);
    for (; ++r < a; )
      if (o = (e = i[r]).type)
        n[o] = Wl(n[o], e.name, t);
      else if (t == null)
        for (o in n)
          n[o] = Wl(n[o], e.name, null);
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
function Sw(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function Wl(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = xw, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var Ua = "http://www.w3.org/1999/xhtml";
const Yl = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Ua,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function nr(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Yl.hasOwnProperty(t) ? { space: Yl[t], local: e } : e;
}
function Cw(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === Ua && t.documentElement.namespaceURI === Ua ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function Nw(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function Xd(e) {
  var t = nr(e);
  return (t.local ? Nw : Cw)(t);
}
function Iw() {
}
function Ls(e) {
  return e == null ? Iw : function() {
    return this.querySelector(e);
  };
}
function Aw(e) {
  typeof e != "function" && (e = Ls(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = new Array(a), l, c, u = 0; u < a; ++u)
      (l = r[u]) && (c = e.call(l, l.__data__, u, r)) && ("__data__" in l && (c.__data__ = l.__data__), s[u] = c);
  return new at(i, this._parents);
}
function Tw(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function Mw() {
  return [];
}
function Kd(e) {
  return e == null ? Mw : function() {
    return this.querySelectorAll(e);
  };
}
function Ow(e) {
  return function() {
    return Tw(e.apply(this, arguments));
  };
}
function Rw(e) {
  typeof e == "function" ? e = Ow(e) : e = Kd(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), o.push(l));
  return new at(i, o);
}
function Zd(e) {
  return function() {
    return this.matches(e);
  };
}
function Jd(e) {
  return function(t) {
    return t.matches(e);
  };
}
var Dw = Array.prototype.find;
function Pw(e) {
  return function() {
    return Dw.call(this.children, e);
  };
}
function Lw() {
  return this.firstElementChild;
}
function zw(e) {
  return this.select(e == null ? Lw : Pw(typeof e == "function" ? e : Jd(e)));
}
var Vw = Array.prototype.filter;
function Bw() {
  return Array.from(this.children);
}
function Fw(e) {
  return function() {
    return Vw.call(this.children, e);
  };
}
function Hw(e) {
  return this.selectAll(e == null ? Bw : Fw(typeof e == "function" ? e : Jd(e)));
}
function qw(e) {
  typeof e != "function" && (e = Zd(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new at(i, this._parents);
}
function Qd(e) {
  return new Array(e.length);
}
function Uw() {
  return new at(this._enter || this._groups.map(Qd), this._parents);
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
function Ww(e) {
  return function() {
    return e;
  };
}
function Yw(e, t, n, i, o, r) {
  for (var a = 0, s, l = t.length, c = r.length; a < c; ++a)
    (s = t[a]) ? (s.__data__ = r[a], i[a] = s) : n[a] = new $i(e, r[a]);
  for (; a < l; ++a)
    (s = t[a]) && (o[a] = s);
}
function Gw(e, t, n, i, o, r, a) {
  var s, l, c = /* @__PURE__ */ new Map(), u = t.length, d = r.length, h = new Array(u), p;
  for (s = 0; s < u; ++s)
    (l = t[s]) && (h[s] = p = a.call(l, l.__data__, s, t) + "", c.has(p) ? o[s] = l : c.set(p, l));
  for (s = 0; s < d; ++s)
    p = a.call(e, r[s], s, r) + "", (l = c.get(p)) ? (i[s] = l, l.__data__ = r[s], c.delete(p)) : n[s] = new $i(e, r[s]);
  for (s = 0; s < u; ++s)
    (l = t[s]) && c.get(h[s]) === l && (o[s] = l);
}
function jw(e) {
  return e.__data__;
}
function Xw(e, t) {
  if (!arguments.length)
    return Array.from(this, jw);
  var n = t ? Gw : Yw, i = this._parents, o = this._groups;
  typeof e != "function" && (e = Ww(e));
  for (var r = o.length, a = new Array(r), s = new Array(r), l = new Array(r), c = 0; c < r; ++c) {
    var u = i[c], d = o[c], h = d.length, p = Kw(e.call(u, u && u.__data__, c, i)), v = p.length, g = s[c] = new Array(v), m = a[c] = new Array(v), _ = l[c] = new Array(h);
    n(u, d, g, m, _, p, t);
    for (var E = 0, w = 0, b, S; E < v; ++E)
      if (b = g[E]) {
        for (E >= w && (w = E + 1); !(S = m[w]) && ++w < v; )
          ;
        b._next = S || null;
      }
  }
  return a = new at(a, i), a._enter = s, a._exit = l, a;
}
function Kw(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Zw() {
  return new at(this._exit || this._groups.map(Qd), this._parents);
}
function Jw(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function Qw(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), s = new Array(o), l = 0; l < a; ++l)
    for (var c = n[l], u = i[l], d = c.length, h = s[l] = new Array(d), p, v = 0; v < d; ++v)
      (p = c[v] || u[v]) && (h[v] = p);
  for (; l < o; ++l)
    s[l] = n[l];
  return new at(s, this._parents);
}
function eb() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function tb(e) {
  e || (e = nb);
  function t(d, h) {
    return d && h ? e(d.__data__, h.__data__) : !d - !h;
  }
  for (var n = this._groups, i = n.length, o = new Array(i), r = 0; r < i; ++r) {
    for (var a = n[r], s = a.length, l = o[r] = new Array(s), c, u = 0; u < s; ++u)
      (c = a[u]) && (l[u] = c);
    l.sort(t);
  }
  return new at(o, this._parents).order();
}
function nb(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function ob() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function ib() {
  return Array.from(this);
}
function rb() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a)
        return a;
    }
  return null;
}
function ab() {
  let e = 0;
  for (const t of this)
    ++e;
  return e;
}
function sb() {
  return !this.node();
}
function lb(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, s; r < a; ++r)
      (s = o[r]) && e.call(s, s.__data__, r, o);
  return this;
}
function ub(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function cb(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function db(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function fb(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function hb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function pb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function vb(e, t) {
  var n = nr(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? cb : ub : typeof t == "function" ? n.local ? pb : hb : n.local ? fb : db)(n, t));
}
function ef(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function mb(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function gb(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function yb(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function wb(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? mb : typeof t == "function" ? yb : gb)(e, t, n ?? "")) : An(this.node(), e);
}
function An(e, t) {
  return e.style.getPropertyValue(t) || ef(e).getComputedStyle(e, null).getPropertyValue(t);
}
function bb(e) {
  return function() {
    delete this[e];
  };
}
function _b(e, t) {
  return function() {
    this[e] = t;
  };
}
function kb(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function Eb(e, t) {
  return arguments.length > 1 ? this.each((t == null ? bb : typeof t == "function" ? kb : _b)(e, t)) : this.node()[e];
}
function tf(e) {
  return e.trim().split(/^|\s+/);
}
function zs(e) {
  return e.classList || new nf(e);
}
function nf(e) {
  this._node = e, this._names = tf(e.getAttribute("class") || "");
}
nf.prototype = {
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
function of(e, t) {
  for (var n = zs(e), i = -1, o = t.length; ++i < o; )
    n.add(t[i]);
}
function rf(e, t) {
  for (var n = zs(e), i = -1, o = t.length; ++i < o; )
    n.remove(t[i]);
}
function xb(e) {
  return function() {
    of(this, e);
  };
}
function $b(e) {
  return function() {
    rf(this, e);
  };
}
function Sb(e, t) {
  return function() {
    (t.apply(this, arguments) ? of : rf)(this, e);
  };
}
function Cb(e, t) {
  var n = tf(e + "");
  if (arguments.length < 2) {
    for (var i = zs(this.node()), o = -1, r = n.length; ++o < r; )
      if (!i.contains(n[o]))
        return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? Sb : t ? xb : $b)(n, t));
}
function Nb() {
  this.textContent = "";
}
function Ib(e) {
  return function() {
    this.textContent = e;
  };
}
function Ab(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function Tb(e) {
  return arguments.length ? this.each(e == null ? Nb : (typeof e == "function" ? Ab : Ib)(e)) : this.node().textContent;
}
function Mb() {
  this.innerHTML = "";
}
function Ob(e) {
  return function() {
    this.innerHTML = e;
  };
}
function Rb(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function Db(e) {
  return arguments.length ? this.each(e == null ? Mb : (typeof e == "function" ? Rb : Ob)(e)) : this.node().innerHTML;
}
function Pb() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Lb() {
  return this.each(Pb);
}
function zb() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Vb() {
  return this.each(zb);
}
function Bb(e) {
  var t = typeof e == "function" ? e : Xd(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function Fb() {
  return null;
}
function Hb(e, t) {
  var n = typeof e == "function" ? e : Xd(e), i = t == null ? Fb : typeof t == "function" ? t : Ls(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function qb() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function Ub() {
  return this.each(qb);
}
function Wb() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Yb() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Gb(e) {
  return this.select(e ? Yb : Wb);
}
function jb(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function Xb(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function Kb(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function Zb(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function Jb(e, t, n) {
  return function() {
    var i = this.__on, o, r = Xb(t);
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
function Qb(e, t, n) {
  var i = Kb(e + ""), o, r = i.length, a;
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
  for (s = t ? Jb : Zb, o = 0; o < r; ++o)
    this.each(s(i[o], t, n));
  return this;
}
function af(e, t, n) {
  var i = ef(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function e1(e, t) {
  return function() {
    return af(this, e, t);
  };
}
function t1(e, t) {
  return function() {
    return af(this, e, t.apply(this, arguments));
  };
}
function n1(e, t) {
  return this.each((typeof t == "function" ? t1 : e1)(e, t));
}
function* o1() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var sf = [null];
function at(e, t) {
  this._groups = e, this._parents = t;
}
function So() {
  return new at([[document.documentElement]], sf);
}
function i1() {
  return this;
}
at.prototype = So.prototype = {
  constructor: at,
  select: Aw,
  selectAll: Rw,
  selectChild: zw,
  selectChildren: Hw,
  filter: qw,
  data: Xw,
  enter: Uw,
  exit: Zw,
  join: Jw,
  merge: Qw,
  selection: i1,
  order: eb,
  sort: tb,
  call: ob,
  nodes: ib,
  node: rb,
  size: ab,
  empty: sb,
  each: lb,
  attr: vb,
  style: wb,
  property: Eb,
  classed: Cb,
  text: Tb,
  html: Db,
  raise: Lb,
  lower: Vb,
  append: Bb,
  insert: Hb,
  remove: Ub,
  clone: Gb,
  datum: jb,
  on: Qb,
  dispatch: n1,
  [Symbol.iterator]: o1
};
function ht(e) {
  return typeof e == "string" ? new at([[document.querySelector(e)]], [document.documentElement]) : new at([[e]], sf);
}
function r1(e) {
  let t;
  for (; t = e.sourceEvent; )
    e = t;
  return e;
}
function kt(e, t) {
  if (e = r1(e), t === void 0 && (t = e.currentTarget), t) {
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
const a1 = { passive: !1 }, uo = { capture: !0, passive: !1 };
function Ir(e) {
  e.stopImmediatePropagation();
}
function xn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function lf(e) {
  var t = e.document.documentElement, n = ht(e).on("dragstart.drag", xn, uo);
  "onselectstart" in t ? n.on("selectstart.drag", xn, uo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function uf(e, t) {
  var n = e.document.documentElement, i = ht(e).on("dragstart.drag", null);
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
function s1(e) {
  return !e.ctrlKey && !e.button;
}
function l1() {
  return this.parentNode;
}
function u1(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function c1() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function d1() {
  var e = s1, t = l1, n = u1, i = c1, o = {}, r = tr("start", "drag", "end"), a = 0, s, l, c, u, d = 0;
  function h(b) {
    b.on("mousedown.drag", p).filter(i).on("touchstart.drag", m).on("touchmove.drag", _, a1).on("touchend.drag touchcancel.drag", E).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function p(b, S) {
    if (!(u || !e.call(this, b, S))) {
      var N = w(this, t.call(this, b, S), b, S, "mouse");
      N && (ht(b.view).on("mousemove.drag", v, uo).on("mouseup.drag", g, uo), lf(b.view), Ir(b), c = !1, s = b.clientX, l = b.clientY, N("start", b));
    }
  }
  function v(b) {
    if (xn(b), !c) {
      var S = b.clientX - s, N = b.clientY - l;
      c = S * S + N * N > d;
    }
    o.mouse("drag", b);
  }
  function g(b) {
    ht(b.view).on("mousemove.drag mouseup.drag", null), uf(b.view, c), xn(b), o.mouse("end", b);
  }
  function m(b, S) {
    if (e.call(this, b, S)) {
      var N = b.changedTouches, V = t.call(this, b, S), A = N.length, T, L;
      for (T = 0; T < A; ++T)
        (L = w(this, V, b, S, N[T].identifier, N[T])) && (Ir(b), L("start", b, N[T]));
    }
  }
  function _(b) {
    var S = b.changedTouches, N = S.length, V, A;
    for (V = 0; V < N; ++V)
      (A = o[S[V].identifier]) && (xn(b), A("drag", b, S[V]));
  }
  function E(b) {
    var S = b.changedTouches, N = S.length, V, A;
    for (u && clearTimeout(u), u = setTimeout(function() {
      u = null;
    }, 500), V = 0; V < N; ++V)
      (A = o[S[V].identifier]) && (Ir(b), A("end", b, S[V]));
  }
  function w(b, S, N, V, A, T) {
    var L = r.copy(), M = kt(T || N, S), k, B, y;
    if ((y = n.call(b, new Wa("beforestart", {
      sourceEvent: N,
      target: h,
      identifier: A,
      active: a,
      x: M[0],
      y: M[1],
      dx: 0,
      dy: 0,
      dispatch: L
    }), V)) != null)
      return k = y.x - M[0] || 0, B = y.y - M[1] || 0, function I(C, H, F) {
        var q = M, U;
        switch (C) {
          case "start":
            o[A] = I, U = a++;
            break;
          case "end":
            delete o[A], --a;
          case "drag":
            M = kt(F || H, S), U = a;
            break;
        }
        L.call(
          C,
          b,
          new Wa(C, {
            sourceEvent: H,
            subject: y,
            target: h,
            identifier: A,
            active: U,
            x: M[0] + k,
            y: M[1] + B,
            dx: M[0] - q[0],
            dy: M[1] - q[1],
            dispatch: L
          }),
          V
        );
      };
  }
  return h.filter = function(b) {
    return arguments.length ? (e = typeof b == "function" ? b : Fo(!!b), h) : e;
  }, h.container = function(b) {
    return arguments.length ? (t = typeof b == "function" ? b : Fo(b), h) : t;
  }, h.subject = function(b) {
    return arguments.length ? (n = typeof b == "function" ? b : Fo(b), h) : n;
  }, h.touchable = function(b) {
    return arguments.length ? (i = typeof b == "function" ? b : Fo(!!b), h) : i;
  }, h.on = function() {
    var b = r.on.apply(r, arguments);
    return b === r ? h : b;
  }, h.clickDistance = function(b) {
    return arguments.length ? (d = (b = +b) * b, h) : Math.sqrt(d);
  }, h;
}
function Vs(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function cf(e, t) {
  var n = Object.create(e.prototype);
  for (var i in t)
    n[i] = t[i];
  return n;
}
function Co() {
}
var co = 0.7, Si = 1 / co, $n = "\\s*([+-]?\\d+)\\s*", fo = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", It = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", f1 = /^#([0-9a-f]{3,8})$/, h1 = new RegExp(`^rgb\\(${$n},${$n},${$n}\\)$`), p1 = new RegExp(`^rgb\\(${It},${It},${It}\\)$`), v1 = new RegExp(`^rgba\\(${$n},${$n},${$n},${fo}\\)$`), m1 = new RegExp(`^rgba\\(${It},${It},${It},${fo}\\)$`), g1 = new RegExp(`^hsl\\(${fo},${It},${It}\\)$`), y1 = new RegExp(`^hsla\\(${fo},${It},${It},${fo}\\)$`), Gl = {
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
Vs(Co, dn, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: jl,
  // Deprecated! Use color.formatHex.
  formatHex: jl,
  formatHex8: w1,
  formatHsl: b1,
  formatRgb: Xl,
  toString: Xl
});
function jl() {
  return this.rgb().formatHex();
}
function w1() {
  return this.rgb().formatHex8();
}
function b1() {
  return df(this).formatHsl();
}
function Xl() {
  return this.rgb().formatRgb();
}
function dn(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = f1.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? Kl(t) : n === 3 ? new ot(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Ho(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Ho(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = h1.exec(e)) ? new ot(t[1], t[2], t[3], 1) : (t = p1.exec(e)) ? new ot(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = v1.exec(e)) ? Ho(t[1], t[2], t[3], t[4]) : (t = m1.exec(e)) ? Ho(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = g1.exec(e)) ? Ql(t[1], t[2] / 100, t[3] / 100, 1) : (t = y1.exec(e)) ? Ql(t[1], t[2] / 100, t[3] / 100, t[4]) : Gl.hasOwnProperty(e) ? Kl(Gl[e]) : e === "transparent" ? new ot(NaN, NaN, NaN, 0) : null;
}
function Kl(e) {
  return new ot(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Ho(e, t, n, i) {
  return i <= 0 && (e = t = n = NaN), new ot(e, t, n, i);
}
function _1(e) {
  return e instanceof Co || (e = dn(e)), e ? (e = e.rgb(), new ot(e.r, e.g, e.b, e.opacity)) : new ot();
}
function Ya(e, t, n, i) {
  return arguments.length === 1 ? _1(e) : new ot(e, t, n, i ?? 1);
}
function ot(e, t, n, i) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +i;
}
Vs(ot, Ya, cf(Co, {
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
  hex: Zl,
  // Deprecated! Use color.formatHex.
  formatHex: Zl,
  formatHex8: k1,
  formatRgb: Jl,
  toString: Jl
}));
function Zl() {
  return `#${an(this.r)}${an(this.g)}${an(this.b)}`;
}
function k1() {
  return `#${an(this.r)}${an(this.g)}${an(this.b)}${an((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Jl() {
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
function Ql(e, t, n, i) {
  return i <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new pt(e, t, n, i);
}
function df(e) {
  if (e instanceof pt)
    return new pt(e.h, e.s, e.l, e.opacity);
  if (e instanceof Co || (e = dn(e)), !e)
    return new pt();
  if (e instanceof pt)
    return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, i = e.b / 255, o = Math.min(t, n, i), r = Math.max(t, n, i), a = NaN, s = r - o, l = (r + o) / 2;
  return s ? (t === r ? a = (n - i) / s + (n < i) * 6 : n === r ? a = (i - t) / s + 2 : a = (t - n) / s + 4, s /= l < 0.5 ? r + o : 2 - r - o, a *= 60) : s = l > 0 && l < 1 ? 0 : a, new pt(a, s, l, e.opacity);
}
function E1(e, t, n, i) {
  return arguments.length === 1 ? df(e) : new pt(e, t, n, i ?? 1);
}
function pt(e, t, n, i) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +i;
}
Vs(pt, E1, cf(Co, {
  brighter(e) {
    return e = e == null ? Si : Math.pow(Si, e), new pt(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? co : Math.pow(co, e), new pt(this.h, this.s, this.l * e, this.opacity);
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
    return new pt(eu(this.h), qo(this.s), qo(this.l), Ci(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Ci(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${eu(this.h)}, ${qo(this.s) * 100}%, ${qo(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function eu(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function qo(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Ar(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const Bs = (e) => () => e;
function x1(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function $1(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(i) {
    return Math.pow(e + i * t, n);
  };
}
function S1(e) {
  return (e = +e) == 1 ? ff : function(t, n) {
    return n - t ? $1(t, n, e) : Bs(isNaN(t) ? n : t);
  };
}
function ff(e, t) {
  var n = t - e;
  return n ? x1(e, n) : Bs(isNaN(e) ? t : e);
}
const Ni = (function e(t) {
  var n = S1(t);
  function i(o, r) {
    var a = n((o = Ya(o)).r, (r = Ya(r)).r), s = n(o.g, r.g), l = n(o.b, r.b), c = ff(o.opacity, r.opacity);
    return function(u) {
      return o.r = a(u), o.g = s(u), o.b = l(u), o.opacity = c(u), o + "";
    };
  }
  return i.gamma = e, i;
})(1);
function C1(e, t) {
  t || (t = []);
  var n = e ? Math.min(t.length, e.length) : 0, i = t.slice(), o;
  return function(r) {
    for (o = 0; o < n; ++o)
      i[o] = e[o] * (1 - r) + t[o] * r;
    return i;
  };
}
function N1(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function I1(e, t) {
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
function A1(e, t) {
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
var Ga = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Tr = new RegExp(Ga.source, "g");
function M1(e) {
  return function() {
    return e;
  };
}
function O1(e) {
  return function(t) {
    return e(t) + "";
  };
}
function hf(e, t) {
  var n = Ga.lastIndex = Tr.lastIndex = 0, i, o, r, a = -1, s = [], l = [];
  for (e = e + "", t = t + ""; (i = Ga.exec(e)) && (o = Tr.exec(t)); )
    (r = o.index) > n && (r = t.slice(n, r), s[a] ? s[a] += r : s[++a] = r), (i = i[0]) === (o = o[0]) ? s[a] ? s[a] += o : s[++a] = o : (s[++a] = null, l.push({ i: a, x: Et(i, o) })), n = Tr.lastIndex;
  return n < t.length && (r = t.slice(n), s[a] ? s[a] += r : s[++a] = r), s.length < 2 ? l[0] ? O1(l[0].x) : M1(t) : (t = l.length, function(c) {
    for (var u = 0, d; u < t; ++u)
      s[(d = l[u]).i] = d.x(c);
    return s.join("");
  });
}
function eo(e, t) {
  var n = typeof t, i;
  return t == null || n === "boolean" ? Bs(t) : (n === "number" ? Et : n === "string" ? (i = dn(t)) ? (t = i, Ni) : hf : t instanceof dn ? Ni : t instanceof Date ? A1 : N1(t) ? C1 : Array.isArray(t) ? I1 : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? T1 : Et)(e, t);
}
var tu = 180 / Math.PI, ja = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function pf(e, t, n, i, o, r) {
  var a, s, l;
  return (a = Math.sqrt(e * e + t * t)) && (e /= a, t /= a), (l = e * n + t * i) && (n -= e * l, i -= t * l), (s = Math.sqrt(n * n + i * i)) && (n /= s, i /= s, l /= s), e * i < t * n && (e = -e, t = -t, l = -l, a = -a), {
    translateX: o,
    translateY: r,
    rotate: Math.atan2(t, e) * tu,
    skewX: Math.atan(l) * tu,
    scaleX: a,
    scaleY: s
  };
}
var Uo;
function R1(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? ja : pf(t.a, t.b, t.c, t.d, t.e, t.f);
}
function D1(e) {
  return e == null || (Uo || (Uo = document.createElementNS("http://www.w3.org/2000/svg", "g")), Uo.setAttribute("transform", e), !(e = Uo.transform.baseVal.consolidate())) ? ja : (e = e.matrix, pf(e.a, e.b, e.c, e.d, e.e, e.f));
}
function vf(e, t, n, i) {
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
var P1 = vf(R1, "px, ", "px)", "deg)"), L1 = vf(D1, ", ", ")", ")"), z1 = 1e-12;
function nu(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function V1(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function B1(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const li = (function e(t, n, i) {
  function o(r, a) {
    var s = r[0], l = r[1], c = r[2], u = a[0], d = a[1], h = a[2], p = u - s, v = d - l, g = p * p + v * v, m, _;
    if (g < z1)
      _ = Math.log(h / c) / t, m = function(V) {
        return [
          s + V * p,
          l + V * v,
          c * Math.exp(t * V * _)
        ];
      };
    else {
      var E = Math.sqrt(g), w = (h * h - c * c + i * g) / (2 * c * n * E), b = (h * h - c * c - i * g) / (2 * h * n * E), S = Math.log(Math.sqrt(w * w + 1) - w), N = Math.log(Math.sqrt(b * b + 1) - b);
      _ = (N - S) / t, m = function(V) {
        var A = V * _, T = nu(S), L = c / (n * E) * (T * B1(t * A + S) - V1(S));
        return [
          s + L * p,
          l + L * v,
          c * T / nu(t * A + S)
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
var Tn = 0, Gn = 0, qn = 0, mf = 1e3, Ii, jn, Ai = 0, fn = 0, or = 0, ho = typeof performance == "object" && performance.now ? performance : Date, gf = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Fs() {
  return fn || (gf(F1), fn = ho.now() + or);
}
function F1() {
  fn = 0;
}
function Ti() {
  this._call = this._time = this._next = null;
}
Ti.prototype = yf.prototype = {
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
function yf(e, t, n) {
  var i = new Ti();
  return i.restart(e, t, n), i;
}
function H1() {
  Fs(), ++Tn;
  for (var e = Ii, t; e; )
    (t = fn - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Tn;
}
function ou() {
  fn = (Ai = ho.now()) + or, Tn = Gn = 0;
  try {
    H1();
  } finally {
    Tn = 0, U1(), fn = 0;
  }
}
function q1() {
  var e = ho.now(), t = e - Ai;
  t > mf && (or -= t, Ai = e);
}
function U1() {
  for (var e, t = Ii, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Ii = n);
  jn = e, Xa(i);
}
function Xa(e) {
  if (!Tn) {
    Gn && (Gn = clearTimeout(Gn));
    var t = e - fn;
    t > 24 ? (e < 1 / 0 && (Gn = setTimeout(ou, e - ho.now() - or)), qn && (qn = clearInterval(qn))) : (qn || (Ai = ho.now(), qn = setInterval(q1, mf)), Tn = 1, gf(ou));
  }
}
function iu(e, t, n) {
  var i = new Ti();
  return t = t == null ? 0 : +t, i.restart((o) => {
    i.stop(), e(o + t);
  }, t, n), i;
}
var W1 = tr("start", "end", "cancel", "interrupt"), Y1 = [], wf = 0, ru = 1, Ka = 2, ui = 3, au = 4, Za = 5, ci = 6;
function ir(e, t, n, i, o, r) {
  var a = e.__transition;
  if (!a)
    e.__transition = {};
  else if (n in a)
    return;
  G1(e, n, {
    name: t,
    index: i,
    // For context during callback.
    group: o,
    // For context during callback.
    on: W1,
    tween: Y1,
    time: r.time,
    delay: r.delay,
    duration: r.duration,
    ease: r.ease,
    timer: null,
    state: wf
  });
}
function Hs(e, t) {
  var n = bt(e, t);
  if (n.state > wf)
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
function G1(e, t, n) {
  var i = e.__transition, o;
  i[t] = n, n.timer = yf(r, 0, n.time);
  function r(c) {
    n.state = ru, n.timer.restart(a, n.delay, n.time), n.delay <= c && a(c - n.delay);
  }
  function a(c) {
    var u, d, h, p;
    if (n.state !== ru)
      return l();
    for (u in i)
      if (p = i[u], p.name === n.name) {
        if (p.state === ui)
          return iu(a);
        p.state === au ? (p.state = ci, p.timer.stop(), p.on.call("interrupt", e, e.__data__, p.index, p.group), delete i[u]) : +u < t && (p.state = ci, p.timer.stop(), p.on.call("cancel", e, e.__data__, p.index, p.group), delete i[u]);
      }
    if (iu(function() {
      n.state === ui && (n.state = au, n.timer.restart(s, n.delay, n.time), s(c));
    }), n.state = Ka, n.on.call("start", e, e.__data__, n.index, n.group), n.state === Ka) {
      for (n.state = ui, o = new Array(h = n.tween.length), u = 0, d = -1; u < h; ++u)
        (p = n.tween[u].value.call(e, e.__data__, n.index, n.group)) && (o[++d] = p);
      o.length = d + 1;
    }
  }
  function s(c) {
    for (var u = c < n.duration ? n.ease.call(null, c / n.duration) : (n.timer.restart(l), n.state = Za, 1), d = -1, h = o.length; ++d < h; )
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
function j1(e) {
  return this.each(function() {
    di(this, e);
  });
}
function X1(e, t) {
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
function K1(e, t, n) {
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
function Z1(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var i = bt(this.node(), n).tween, o = 0, r = i.length, a; o < r; ++o)
      if ((a = i[o]).name === e)
        return a.value;
    return null;
  }
  return this.each((t == null ? X1 : K1)(n, e, t));
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
function bf(e, t) {
  var n;
  return (typeof t == "number" ? Et : t instanceof dn ? Ni : (n = dn(t)) ? (t = n, Ni) : hf)(e, t);
}
function J1(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Q1(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function e0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttribute(e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function t0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttributeNS(e.space, e.local);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function n0(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttribute(e) : (a = this.getAttribute(e), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function o0(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttributeNS(e.space, e.local) : (a = this.getAttributeNS(e.space, e.local), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function i0(e, t) {
  var n = nr(e), i = n === "transform" ? L1 : bf;
  return this.attrTween(e, typeof t == "function" ? (n.local ? o0 : n0)(n, i, qs(this, "attr." + e, t)) : t == null ? (n.local ? Q1 : J1)(n) : (n.local ? t0 : e0)(n, i, t));
}
function r0(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function a0(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function s0(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && a0(e, r)), n;
  }
  return o._value = t, o;
}
function l0(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && r0(e, r)), n;
  }
  return o._value = t, o;
}
function u0(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2)
    return (n = this.tween(n)) && n._value;
  if (t == null)
    return this.tween(n, null);
  if (typeof t != "function")
    throw new Error();
  var i = nr(e);
  return this.tween(n, (i.local ? s0 : l0)(i, t));
}
function c0(e, t) {
  return function() {
    Hs(this, e).delay = +t.apply(this, arguments);
  };
}
function d0(e, t) {
  return t = +t, function() {
    Hs(this, e).delay = t;
  };
}
function f0(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? c0 : d0)(t, e)) : bt(this.node(), t).delay;
}
function h0(e, t) {
  return function() {
    Tt(this, e).duration = +t.apply(this, arguments);
  };
}
function p0(e, t) {
  return t = +t, function() {
    Tt(this, e).duration = t;
  };
}
function v0(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? h0 : p0)(t, e)) : bt(this.node(), t).duration;
}
function m0(e, t) {
  if (typeof t != "function")
    throw new Error();
  return function() {
    Tt(this, e).ease = t;
  };
}
function g0(e) {
  var t = this._id;
  return arguments.length ? this.each(m0(t, e)) : bt(this.node(), t).ease;
}
function y0(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function")
      throw new Error();
    Tt(this, e).ease = n;
  };
}
function w0(e) {
  if (typeof e != "function")
    throw new Error();
  return this.each(y0(this._id, e));
}
function b0(e) {
  typeof e != "function" && (e = Zd(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new Vt(i, this._parents, this._name, this._id);
}
function _0(e) {
  if (e._id !== this._id)
    throw new Error();
  for (var t = this._groups, n = e._groups, i = t.length, o = n.length, r = Math.min(i, o), a = new Array(i), s = 0; s < r; ++s)
    for (var l = t[s], c = n[s], u = l.length, d = a[s] = new Array(u), h, p = 0; p < u; ++p)
      (h = l[p] || c[p]) && (d[p] = h);
  for (; s < i; ++s)
    a[s] = t[s];
  return new Vt(a, this._parents, this._name, this._id);
}
function k0(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function E0(e, t, n) {
  var i, o, r = k0(t) ? Hs : Tt;
  return function() {
    var a = r(this, e), s = a.on;
    s !== i && (o = (i = s).copy()).on(t, n), a.on = o;
  };
}
function x0(e, t) {
  var n = this._id;
  return arguments.length < 2 ? bt(this.node(), n).on.on(e) : this.each(E0(n, e, t));
}
function $0(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition)
      if (+n !== e)
        return;
    t && t.removeChild(this);
  };
}
function S0() {
  return this.on("end.remove", $0(this._id));
}
function C0(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Ls(e));
  for (var i = this._groups, o = i.length, r = new Array(o), a = 0; a < o; ++a)
    for (var s = i[a], l = s.length, c = r[a] = new Array(l), u, d, h = 0; h < l; ++h)
      (u = s[h]) && (d = e.call(u, u.__data__, h, s)) && ("__data__" in u && (d.__data__ = u.__data__), c[h] = d, ir(c[h], t, n, h, c, bt(u, n)));
  return new Vt(r, this._parents, t, n);
}
function N0(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Kd(e));
  for (var i = this._groups, o = i.length, r = [], a = [], s = 0; s < o; ++s)
    for (var l = i[s], c = l.length, u, d = 0; d < c; ++d)
      if (u = l[d]) {
        for (var h = e.call(u, u.__data__, d, l), p, v = bt(u, n), g = 0, m = h.length; g < m; ++g)
          (p = h[g]) && ir(p, t, n, g, h, v);
        r.push(h), a.push(u);
      }
  return new Vt(r, a, t, n);
}
var I0 = So.prototype.constructor;
function A0() {
  return new I0(this._groups, this._parents);
}
function T0(e, t) {
  var n, i, o;
  return function() {
    var r = An(this, e), a = (this.style.removeProperty(e), An(this, e));
    return r === a ? null : r === n && a === i ? o : o = t(n = r, i = a);
  };
}
function _f(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function M0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = An(this, e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function O0(e, t, n) {
  var i, o, r;
  return function() {
    var a = An(this, e), s = n(this), l = s + "";
    return s == null && (l = s = (this.style.removeProperty(e), An(this, e))), a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s));
  };
}
function R0(e, t) {
  var n, i, o, r = "style." + t, a = "end." + r, s;
  return function() {
    var l = Tt(this, e), c = l.on, u = l.value[r] == null ? s || (s = _f(t)) : void 0;
    (c !== n || o !== u) && (i = (n = c).copy()).on(a, o = u), l.on = i;
  };
}
function D0(e, t, n) {
  var i = (e += "") == "transform" ? P1 : bf;
  return t == null ? this.styleTween(e, T0(e, i)).on("end.style." + e, _f(e)) : typeof t == "function" ? this.styleTween(e, O0(e, i, qs(this, "style." + e, t))).each(R0(this._id, e)) : this.styleTween(e, M0(e, i, t), n).on("end.style." + e, null);
}
function P0(e, t, n) {
  return function(i) {
    this.style.setProperty(e, t.call(this, i), n);
  };
}
function L0(e, t, n) {
  var i, o;
  function r() {
    var a = t.apply(this, arguments);
    return a !== o && (i = (o = a) && P0(e, a, n)), i;
  }
  return r._value = t, r;
}
function z0(e, t, n) {
  var i = "style." + (e += "");
  if (arguments.length < 2)
    return (i = this.tween(i)) && i._value;
  if (t == null)
    return this.tween(i, null);
  if (typeof t != "function")
    throw new Error();
  return this.tween(i, L0(e, t, n ?? ""));
}
function V0(e) {
  return function() {
    this.textContent = e;
  };
}
function B0(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function F0(e) {
  return this.tween("text", typeof e == "function" ? B0(qs(this, "text", e)) : V0(e == null ? "" : e + ""));
}
function H0(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function q0(e) {
  var t, n;
  function i() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && H0(o)), t;
  }
  return i._value = e, i;
}
function U0(e) {
  var t = "text";
  if (arguments.length < 1)
    return (t = this.tween(t)) && t._value;
  if (e == null)
    return this.tween(t, null);
  if (typeof e != "function")
    throw new Error();
  return this.tween(t, q0(e));
}
function W0() {
  for (var e = this._name, t = this._id, n = kf(), i = this._groups, o = i.length, r = 0; r < o; ++r)
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
  return new Vt(i, this._parents, e, n);
}
function Y0() {
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
var G0 = 0;
function Vt(e, t, n, i) {
  this._groups = e, this._parents = t, this._name = n, this._id = i;
}
function kf() {
  return ++G0;
}
var Ot = So.prototype;
Vt.prototype = {
  constructor: Vt,
  select: C0,
  selectAll: N0,
  selectChild: Ot.selectChild,
  selectChildren: Ot.selectChildren,
  filter: b0,
  merge: _0,
  selection: A0,
  transition: W0,
  call: Ot.call,
  nodes: Ot.nodes,
  node: Ot.node,
  size: Ot.size,
  empty: Ot.empty,
  each: Ot.each,
  on: x0,
  attr: i0,
  attrTween: u0,
  style: D0,
  styleTween: z0,
  text: F0,
  textTween: U0,
  remove: S0,
  tween: Z1,
  delay: f0,
  duration: v0,
  ease: g0,
  easeVarying: w0,
  end: Y0,
  [Symbol.iterator]: Ot[Symbol.iterator]
};
function j0(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var X0 = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: j0
};
function K0(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function Z0(e) {
  var t, n;
  e instanceof Vt ? (t = e._id, e = e._name) : (t = kf(), (n = X0).time = Fs(), e = e == null ? null : e + "");
  for (var i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && ir(l, e, t, c, a, n || K0(l, t));
  return new Vt(i, this._parents, e, t);
}
So.prototype.interrupt = j1;
So.prototype.transition = Z0;
const Wo = (e) => () => e;
function J0(e, {
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
function Q0(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function e_() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function su() {
  return this.__zoom || Mn;
}
function t_(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function n_() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function o_(e, t, n) {
  var i = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], r = e.invertY(t[0][1]) - n[0][1], a = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > i ? (i + o) / 2 : Math.min(0, i) || Math.max(0, o),
    a > r ? (r + a) / 2 : Math.min(0, r) || Math.max(0, a)
  );
}
function i_() {
  var e = Q0, t = e_, n = o_, i = t_, o = n_, r = [0, 1 / 0], a = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], s = 250, l = li, c = tr("start", "zoom", "end"), u, d, h, p = 500, v = 150, g = 0, m = 10;
  function _(y) {
    y.property("__zoom", su).on("wheel.zoom", A, { passive: !1 }).on("mousedown.zoom", T).on("dblclick.zoom", L).filter(o).on("touchstart.zoom", M).on("touchmove.zoom", k).on("touchend.zoom touchcancel.zoom", B).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  _.transform = function(y, I, C, H) {
    var F = y.selection ? y.selection() : y;
    F.property("__zoom", su), y !== F ? S(y, I, C, H) : F.interrupt().each(function() {
      N(this, arguments).event(H).start().zoom(null, typeof I == "function" ? I.apply(this, arguments) : I).end();
    });
  }, _.scaleBy = function(y, I, C, H) {
    _.scaleTo(y, function() {
      var F = this.__zoom.k, q = typeof I == "function" ? I.apply(this, arguments) : I;
      return F * q;
    }, C, H);
  }, _.scaleTo = function(y, I, C, H) {
    _.transform(y, function() {
      var F = t.apply(this, arguments), q = this.__zoom, U = C == null ? b(F) : typeof C == "function" ? C.apply(this, arguments) : C, ne = q.invert(U), ue = typeof I == "function" ? I.apply(this, arguments) : I;
      return n(w(E(q, ue), U, ne), F, a);
    }, C, H);
  }, _.translateBy = function(y, I, C, H) {
    _.transform(y, function() {
      return n(this.__zoom.translate(
        typeof I == "function" ? I.apply(this, arguments) : I,
        typeof C == "function" ? C.apply(this, arguments) : C
      ), t.apply(this, arguments), a);
    }, null, H);
  }, _.translateTo = function(y, I, C, H, F) {
    _.transform(y, function() {
      var q = t.apply(this, arguments), U = this.__zoom, ne = H == null ? b(q) : typeof H == "function" ? H.apply(this, arguments) : H;
      return n(Mn.translate(ne[0], ne[1]).scale(U.k).translate(
        typeof I == "function" ? -I.apply(this, arguments) : -I,
        typeof C == "function" ? -C.apply(this, arguments) : -C
      ), q, a);
    }, H, F);
  };
  function E(y, I) {
    return I = Math.max(r[0], Math.min(r[1], I)), I === y.k ? y : new Pt(I, y.x, y.y);
  }
  function w(y, I, C) {
    var H = I[0] - C[0] * y.k, F = I[1] - C[1] * y.k;
    return H === y.x && F === y.y ? y : new Pt(y.k, H, F);
  }
  function b(y) {
    return [(+y[0][0] + +y[1][0]) / 2, (+y[0][1] + +y[1][1]) / 2];
  }
  function S(y, I, C, H) {
    y.on("start.zoom", function() {
      N(this, arguments).event(H).start();
    }).on("interrupt.zoom end.zoom", function() {
      N(this, arguments).event(H).end();
    }).tween("zoom", function() {
      var F = this, q = arguments, U = N(F, q).event(H), ne = t.apply(F, q), ue = C == null ? b(ne) : typeof C == "function" ? C.apply(F, q) : C, G = Math.max(ne[1][0] - ne[0][0], ne[1][1] - ne[0][1]), J = F.__zoom, K = typeof I == "function" ? I.apply(F, q) : I, X = l(J.invert(ue).concat(G / J.k), K.invert(ue).concat(G / K.k));
      return function(oe) {
        if (oe === 1)
          oe = K;
        else {
          var le = X(oe), fe = G / le[2];
          oe = new Pt(fe, ue[0] - le[0] * fe, ue[1] - le[1] * fe);
        }
        U.zoom(null, oe);
      };
    });
  }
  function N(y, I, C) {
    return !C && y.__zooming || new V(y, I);
  }
  function V(y, I) {
    this.that = y, this.args = I, this.active = 0, this.sourceEvent = null, this.extent = t.apply(y, I), this.taps = 0;
  }
  V.prototype = {
    event: function(y) {
      return y && (this.sourceEvent = y), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(y, I) {
      return this.mouse && y !== "mouse" && (this.mouse[1] = I.invert(this.mouse[0])), this.touch0 && y !== "touch" && (this.touch0[1] = I.invert(this.touch0[0])), this.touch1 && y !== "touch" && (this.touch1[1] = I.invert(this.touch1[0])), this.that.__zoom = I, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(y) {
      var I = ht(this.that).datum();
      c.call(
        y,
        this.that,
        new J0(y, {
          sourceEvent: this.sourceEvent,
          target: _,
          transform: this.that.__zoom,
          dispatch: c
        }),
        I
      );
    }
  };
  function A(y, ...I) {
    if (!e.apply(this, arguments))
      return;
    var C = N(this, I).event(y), H = this.__zoom, F = Math.max(r[0], Math.min(r[1], H.k * Math.pow(2, i.apply(this, arguments)))), q = kt(y);
    if (C.wheel)
      (C.mouse[0][0] !== q[0] || C.mouse[0][1] !== q[1]) && (C.mouse[1] = H.invert(C.mouse[0] = q)), clearTimeout(C.wheel);
    else {
      if (H.k === F)
        return;
      C.mouse = [q, H.invert(q)], di(this), C.start();
    }
    Un(y), C.wheel = setTimeout(U, v), C.zoom("mouse", n(w(E(H, F), C.mouse[0], C.mouse[1]), C.extent, a));
    function U() {
      C.wheel = null, C.end();
    }
  }
  function T(y, ...I) {
    if (h || !e.apply(this, arguments))
      return;
    var C = y.currentTarget, H = N(this, I, !0).event(y), F = ht(y.view).on("mousemove.zoom", ue, !0).on("mouseup.zoom", G, !0), q = kt(y, C), U = y.clientX, ne = y.clientY;
    lf(y.view), Mr(y), H.mouse = [q, this.__zoom.invert(q)], di(this), H.start();
    function ue(J) {
      if (Un(J), !H.moved) {
        var K = J.clientX - U, X = J.clientY - ne;
        H.moved = K * K + X * X > g;
      }
      H.event(J).zoom("mouse", n(w(H.that.__zoom, H.mouse[0] = kt(J, C), H.mouse[1]), H.extent, a));
    }
    function G(J) {
      F.on("mousemove.zoom mouseup.zoom", null), uf(J.view, H.moved), Un(J), H.event(J).end();
    }
  }
  function L(y, ...I) {
    if (e.apply(this, arguments)) {
      var C = this.__zoom, H = kt(y.changedTouches ? y.changedTouches[0] : y, this), F = C.invert(H), q = C.k * (y.shiftKey ? 0.5 : 2), U = n(w(E(C, q), H, F), t.apply(this, I), a);
      Un(y), s > 0 ? ht(this).transition().duration(s).call(S, U, H, y) : ht(this).call(_.transform, U, H, y);
    }
  }
  function M(y, ...I) {
    if (e.apply(this, arguments)) {
      var C = y.touches, H = C.length, F = N(this, I, y.changedTouches.length === H).event(y), q, U, ne, ue;
      for (Mr(y), U = 0; U < H; ++U)
        ne = C[U], ue = kt(ne, this), ue = [ue, this.__zoom.invert(ue), ne.identifier], F.touch0 ? !F.touch1 && F.touch0[2] !== ue[2] && (F.touch1 = ue, F.taps = 0) : (F.touch0 = ue, q = !0, F.taps = 1 + !!u);
      u && (u = clearTimeout(u)), q && (F.taps < 2 && (d = ue[0], u = setTimeout(function() {
        u = null;
      }, p)), di(this), F.start());
    }
  }
  function k(y, ...I) {
    if (this.__zooming) {
      var C = N(this, I).event(y), H = y.changedTouches, F = H.length, q, U, ne, ue;
      for (Un(y), q = 0; q < F; ++q)
        U = H[q], ne = kt(U, this), C.touch0 && C.touch0[2] === U.identifier ? C.touch0[0] = ne : C.touch1 && C.touch1[2] === U.identifier && (C.touch1[0] = ne);
      if (U = C.that.__zoom, C.touch1) {
        var G = C.touch0[0], J = C.touch0[1], K = C.touch1[0], X = C.touch1[1], oe = (oe = K[0] - G[0]) * oe + (oe = K[1] - G[1]) * oe, le = (le = X[0] - J[0]) * le + (le = X[1] - J[1]) * le;
        U = E(U, Math.sqrt(oe / le)), ne = [(G[0] + K[0]) / 2, (G[1] + K[1]) / 2], ue = [(J[0] + X[0]) / 2, (J[1] + X[1]) / 2];
      } else if (C.touch0)
        ne = C.touch0[0], ue = C.touch0[1];
      else
        return;
      C.zoom("touch", n(w(U, ne, ue), C.extent, a));
    }
  }
  function B(y, ...I) {
    if (this.__zooming) {
      var C = N(this, I).event(y), H = y.changedTouches, F = H.length, q, U;
      for (Mr(y), h && clearTimeout(h), h = setTimeout(function() {
        h = null;
      }, p), q = 0; q < F; ++q)
        U = H[q], C.touch0 && C.touch0[2] === U.identifier ? delete C.touch0 : C.touch1 && C.touch1[2] === U.identifier && delete C.touch1;
      if (C.touch1 && !C.touch0 && (C.touch0 = C.touch1, delete C.touch1), C.touch0)
        C.touch0[1] = this.__zoom.invert(C.touch0[0]);
      else if (C.end(), C.taps === 2 && (U = kt(U, this), Math.hypot(d[0] - U[0], d[1] - U[1]) < m)) {
        var ne = ht(this).on("dblclick.zoom");
        ne && ne.apply(this, arguments);
      }
    }
  }
  return _.wheelDelta = function(y) {
    return arguments.length ? (i = typeof y == "function" ? y : Wo(+y), _) : i;
  }, _.filter = function(y) {
    return arguments.length ? (e = typeof y == "function" ? y : Wo(!!y), _) : e;
  }, _.touchable = function(y) {
    return arguments.length ? (o = typeof y == "function" ? y : Wo(!!y), _) : o;
  }, _.extent = function(y) {
    return arguments.length ? (t = typeof y == "function" ? y : Wo([[+y[0][0], +y[0][1]], [+y[1][0], +y[1][1]]]), _) : t;
  }, _.scaleExtent = function(y) {
    return arguments.length ? (r[0] = +y[0], r[1] = +y[1], _) : [r[0], r[1]];
  }, _.translateExtent = function(y) {
    return arguments.length ? (a[0][0] = +y[0][0], a[1][0] = +y[1][0], a[0][1] = +y[0][1], a[1][1] = +y[1][1], _) : [[a[0][0], a[0][1]], [a[1][0], a[1][1]]];
  }, _.constrain = function(y) {
    return arguments.length ? (n = y, _) : n;
  }, _.duration = function(y) {
    return arguments.length ? (s = +y, _) : s;
  }, _.interpolate = function(y) {
    return arguments.length ? (l = y, _) : l;
  }, _.on = function() {
    var y = c.on.apply(c, arguments);
    return y === c ? _ : y;
  }, _.clickDistance = function(y) {
    return arguments.length ? (g = (y = +y) * y, _) : Math.sqrt(g);
  }, _.tapDistance = function(y) {
    return arguments.length ? (m = +y, _) : m;
  }, _;
}
var ye = /* @__PURE__ */ ((e) => (e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom", e))(ye || {}), Us = /* @__PURE__ */ ((e) => (e.Partial = "partial", e.Full = "full", e))(Us || {}), nn = /* @__PURE__ */ ((e) => (e.Bezier = "default", e.SimpleBezier = "simple-bezier", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e))(nn || {}), en = /* @__PURE__ */ ((e) => (e.Strict = "strict", e.Loose = "loose", e))(en || {}), Mi = /* @__PURE__ */ ((e) => (e.Arrow = "arrow", e.ArrowClosed = "arrowclosed", e))(Mi || {}), to = /* @__PURE__ */ ((e) => (e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal", e))(to || {}), Ef = /* @__PURE__ */ ((e) => (e.TopLeft = "top-left", e.TopCenter = "top-center", e.TopRight = "top-right", e.BottomLeft = "bottom-left", e.BottomCenter = "bottom-center", e.BottomRight = "bottom-right", e))(Ef || {});
const r_ = ["INPUT", "SELECT", "TEXTAREA"], a_ = typeof document < "u" ? document : null;
function Ja(e) {
  var t, n;
  const i = ((n = (t = e.composedPath) == null ? void 0 : t.call(e)) == null ? void 0 : n[0]) || e.target, o = typeof i?.hasAttribute == "function" ? i.hasAttribute("contenteditable") : !1, r = typeof i?.closest == "function" ? i.closest(".nokey") : null;
  return r_.includes(i?.nodeName) || o || !!r;
}
function s_(e) {
  return e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
}
function lu(e, t, n, i) {
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
function l_(e, t) {
  return (n) => {
    if (!n.code && !n.key)
      return !1;
    const i = u_(n.code, e);
    return Array.isArray(e) ? e.some((o) => lu(n[i], o, t, n.type === "keyup")) : lu(n[i], e, t, n.type === "keyup");
  };
}
function u_(e, t) {
  return t.includes(e) ? "code" : "key";
}
function no(e, t) {
  const n = W(() => Ae(t?.target) ?? a_), i = nt(Ae(e) === !0);
  let o = !1;
  const r = /* @__PURE__ */ new Set();
  let a = l(Ae(e));
  ke(
    () => Ae(e),
    (c, u) => {
      typeof u == "boolean" && typeof c != "boolean" && s(), a = l(c);
    },
    {
      immediate: !0
    }
  ), jd(["blur", "contextmenu"], s), Ul(
    (...c) => a(...c),
    (c) => {
      var u, d;
      const h = Ae(t?.actInsideInputWithModifier) ?? !0, p = Ae(t?.preventDefault) ?? !1;
      if (o = s_(c), (!o || o && !h) && Ja(c))
        return;
      const g = ((d = (u = c.composedPath) == null ? void 0 : u.call(c)) == null ? void 0 : d[0]) || c.target, m = g?.nodeName === "BUTTON" || g?.nodeName === "A";
      !p && (o || !m) && c.preventDefault(), i.value = !0;
    },
    { eventName: "keydown", target: n }
  ), Ul(
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
    return c === null ? (s(), () => !1) : typeof c == "boolean" ? (s(), i.value = c, () => !1) : Array.isArray(c) || typeof c == "string" ? l_(c, r) : c;
  }
  return i;
}
const xf = "vue-flow__node-desc", $f = "vue-flow__edge-desc", c_ = "vue-flow__aria-live", Sf = ["Enter", " ", "Escape"], Sn = {
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
function Cf(e, t) {
  return {
    x: Bt(e.x, t[0][0], t[1][0]),
    y: Bt(e.y, t[0][1], t[1][1])
  };
}
function uu(e) {
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
function d_(e) {
  return Yo(e.width) && Yo(e.height) && Yo(e.x) && Yo(e.y);
}
function f_(e, t, n) {
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
function Nf(e, t, n) {
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
function If(e, t, n, i) {
  const o = typeof e == "string" ? e : e.id, r = /* @__PURE__ */ new Set(), a = i === "source" ? "target" : "source";
  for (const s of n)
    s[a] === o && r.add(s[i]);
  return t.filter((s) => r.has(s.id));
}
function h_(...e) {
  if (e.length === 3) {
    const [r, a, s] = e;
    return If(r, a, s, "target");
  }
  const [t, n] = e, i = typeof t == "string" ? t : t.id;
  return n.filter((r) => tn(r) && r.source === i).map((r) => n.find((a) => un(a) && a.id === r.target));
}
function p_(...e) {
  if (e.length === 3) {
    const [r, a, s] = e;
    return If(r, a, s, "source");
  }
  const [t, n] = e, i = typeof t == "string" ? t : t.id;
  return n.filter((r) => tn(r) && r.target === i).map((r) => n.find((a) => un(a) && a.id === r.source));
}
function Af({ source: e, sourceHandle: t, target: n, targetHandle: i }) {
  return `vueflow__edge-${e}${t ?? ""}-${n}${i ?? ""}`;
}
function v_(e, t) {
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
function Tf(e, t) {
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
function Mf({ x: e, y: t, x2: n, y2: i }) {
  return {
    x: e,
    y: t,
    width: n - e,
    height: i - t
  };
}
function m_(e, t) {
  return Mf(Tf(Di(e), Di(t)));
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
    t = Tf(
      t,
      Di({
        ...i.computedPosition,
        ...i.dimensions
      })
    );
  }
  return Mf(t);
}
function Of(e, t, n = { x: 0, y: 0, zoom: 1 }, i = !1, o = !1) {
  const r = {
    ...vo(t, n),
    width: t.width / n.zoom,
    height: t.height / n.zoom
  }, a = [];
  for (const s of e) {
    const { dimensions: l, selectable: c = !0, hidden: u = !1 } = s, d = l.width ?? s.width ?? null, h = l.height ?? s.height ?? null;
    if (o && !c || u)
      continue;
    const p = Ri(r, Oi(s)), v = d === null || h === null, g = i && p > 0, m = (d ?? 0) * (h ?? 0);
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
function g_(e, t, n) {
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
function y_(e, t, n, i, o, r) {
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
function cu(e, t, n, i, o, r = 0.1) {
  const a = g_(r, t, n), s = (t - a.x) / e.width, l = (n - a.y) / e.height, c = Math.min(s, l), u = Bt(c, i, o), d = e.x + e.width / 2, h = e.y + e.height / 2, p = t / 2 - d * u, v = n / 2 - h * u, g = y_(e, p, v, u, t, n), m = {
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
function w_(e, t) {
  return {
    x: t.x + e.x,
    y: t.y + e.y,
    z: (e.z > t.z ? e.z : t.z) + 1
  };
}
function Rf(e, t) {
  if (!e.parentNode)
    return !1;
  const n = t.get(e.parentNode);
  return n ? n.selected ? !0 : Rf(n, t) : !1;
}
function mo(e, t) {
  return typeof e > "u" ? "" : typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((i) => `${i}=${e[i]}`).join("&")}`;
}
function Qa(e) {
  const t = e.ctrlKey && go() ? 10 : 1;
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * t;
}
function du(e, t, n) {
  return e < t ? Bt(Math.abs(e - t), 1, t) / t : e > n ? -Bt(Math.abs(e - n), 1, t) / t : 0;
}
function Df(e, t, n = 15, i = 40) {
  const o = du(e.x, i, t.width - i) * n, r = du(e.y, i, t.height - i) * n;
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
function fu(e, t) {
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
              l && Xn(l) && (!!l.dimensions.width && !!l.dimensions.height ? Or(a, l) : ze(() => {
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
function hu(e) {
  return {
    item: e,
    type: "add"
  };
}
function pu(e) {
  return {
    id: e,
    type: "remove"
  };
}
function vu(e, t, n, i, o) {
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
const mu = () => {
};
function ve(e) {
  const t = /* @__PURE__ */ new Set();
  let n = mu, i = () => !1;
  const o = () => t.size > 0 || i(), r = (h) => {
    n = h;
  }, a = () => {
    n = mu;
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
function gu(e, t, n) {
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
function b_(e, t, n, i) {
  var o, r;
  const a = /* @__PURE__ */ new Map();
  for (const [s, l] of e)
    (l.selected || l.id === i) && (!l.parentNode || !Rf(l, e)) && (l.draggable || t && typeof l.draggable > "u") && e.get(s) && a.set(s, {
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
function Pf(e) {
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
function __(e, t, n) {
  const [i, o, r, a] = typeof e != "string" ? Pf(e.padding) : [0, 0, 0, 0];
  return n && typeof n.computedPosition.x < "u" && typeof n.computedPosition.y < "u" && typeof n.dimensions.width < "u" && typeof n.dimensions.height < "u" ? [
    [n.computedPosition.x + a, n.computedPosition.y + i],
    [
      n.computedPosition.x + n.dimensions.width - o,
      n.computedPosition.y + n.dimensions.height - r
    ]
  ] : !1;
}
function k_(e, t, n, i) {
  let o = e.extent || n;
  if ((o === "parent" || !Array.isArray(o) && o?.range === "parent") && !e.expandParent)
    if (e.parentNode && i && e.dimensions.width && e.dimensions.height) {
      const r = __(o, e, i);
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
    const [r, a, s, l] = Pf(o.padding), c = i?.computedPosition.x || 0, u = i?.computedPosition.y || 0;
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
function E_({ width: e, height: t }, n) {
  return [n[0], [n[1][0] - (e || 0), n[1][1] - (t || 0)]];
}
function Ys(e, t, n, i, o) {
  const r = E_(e.dimensions, k_(e, n, i, o)), a = Cf(t, r);
  return {
    position: {
      x: a.x - (o?.computedPosition.x || 0),
      y: a.y - (o?.computedPosition.y || 0)
    },
    computedPosition: a
  };
}
function On(e, t, n = ye.Left, i = !1) {
  const o = (t?.x ?? 0) + e.computedPosition.x, r = (t?.y ?? 0) + e.computedPosition.y, { width: a, height: s } = t ?? C_(e);
  if (i)
    return { x: o + a / 2, y: r + s / 2 };
  switch (t?.position ?? n) {
    case ye.Top:
      return { x: o + a / 2, y: r };
    case ye.Right:
      return { x: o + a, y: r + s / 2 };
    case ye.Bottom:
      return { x: o + a / 2, y: r + s };
    case ye.Left:
      return { x: o, y: r + s / 2 };
  }
}
function yu(e, t) {
  return e && (t ? e.find((n) => n.id === t) : e[0]) || null;
}
function x_({
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
  }), d = Math.max(0, Math.min(u.x2, c.x2) - Math.max(u.x, c.x)), h = Math.max(0, Math.min(u.y2, c.y2) - Math.max(u.y, c.y));
  return Math.ceil(d * h) > 0;
}
function $_(e, t, n = !1) {
  const i = typeof e.zIndex == "number";
  let o = i ? e.zIndex : 0;
  const r = t(e.source), a = t(e.target);
  return !r || !a ? 0 : (n && (o = i ? e.zIndex : Math.max(r.computedPosition.z || 0, a.computedPosition.z || 0)), o);
}
var Ye = /* @__PURE__ */ ((e) => (e.MISSING_STYLES = "MISSING_STYLES", e.MISSING_VIEWPORT_DIMENSIONS = "MISSING_VIEWPORT_DIMENSIONS", e.NODE_INVALID = "NODE_INVALID", e.NODE_NOT_FOUND = "NODE_NOT_FOUND", e.NODE_MISSING_PARENT = "NODE_MISSING_PARENT", e.NODE_TYPE_MISSING = "NODE_TYPE_MISSING", e.NODE_EXTENT_INVALID = "NODE_EXTENT_INVALID", e.EDGE_INVALID = "EDGE_INVALID", e.EDGE_NOT_FOUND = "EDGE_NOT_FOUND", e.EDGE_SOURCE_MISSING = "EDGE_SOURCE_MISSING", e.EDGE_TARGET_MISSING = "EDGE_TARGET_MISSING", e.EDGE_TYPE_MISSING = "EDGE_TYPE_MISSING", e.EDGE_SOURCE_TARGET_SAME = "EDGE_SOURCE_TARGET_SAME", e.EDGE_SOURCE_TARGET_MISSING = "EDGE_SOURCE_TARGET_MISSING", e.EDGE_ORPHANED = "EDGE_ORPHANED", e.USEVUEFLOW_OPTIONS = "USEVUEFLOW_OPTIONS", e))(Ye || {});
const wu = {
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
    super((i = wu[t]) == null ? void 0 : i.call(wu, ...n)), this.name = "VueFlowError", this.code = t, this.args = n;
  }
}
function Gs(e) {
  return "clientX" in e;
}
function S_(e) {
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
function C_(e) {
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
const N_ = () => !0;
function Dr(e) {
  e?.classList.remove("valid", "connecting", "vue-flow__handle-valid", "vue-flow__handle-connecting");
}
function I_(e, t, n) {
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
const A_ = 250;
function T_(e, t, n, i) {
  var o, r;
  let a = [], s = Number.POSITIVE_INFINITY;
  const l = I_(e, n, t + A_);
  for (const c of l) {
    const u = [...((o = c.handleBounds) == null ? void 0 : o.source) ?? [], ...((r = c.handleBounds) == null ? void 0 : r.target) ?? []];
    for (const d of u) {
      if (i.nodeId === d.nodeId && i.type === d.type && i.id === d.id)
        continue;
      const { x: h, y: p } = On(c, d, d.position, !0), v = Math.sqrt((h - e.x) ** 2 + (p - e.y) ** 2);
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
function bu(e, {
  handle: t,
  connectionMode: n,
  fromNodeId: i,
  fromHandleId: o,
  fromType: r,
  doc: a,
  lib: s,
  flowId: l,
  isValidConnection: c = N_
}, u, d, h, p) {
  const v = r === "target", g = t ? a.querySelector(`.${s}-flow__handle[data-id="${l}-${t?.nodeId}-${t?.id}-${t?.type}"]`) : null, { x: m, y: _ } = $t(e), E = a.elementFromPoint(m, _), w = E?.classList.contains(`${s}-flow__handle`) ? E : g, b = {
    handleDomNode: w,
    isValid: !1,
    connection: null,
    toHandle: null
  };
  if (w) {
    const S = Lf(void 0, w), N = w.getAttribute("data-nodeid"), V = w.getAttribute("data-handleid"), A = w.classList.contains("connectable"), T = w.classList.contains("connectableend");
    if (!N || !S)
      return b;
    const L = {
      source: v ? N : i,
      sourceHandle: v ? V : o,
      target: v ? i : N,
      targetHandle: v ? o : V
    };
    b.connection = L;
    const k = A && T && (n === en.Strict ? v && S === "source" || !v && S === "target" : N !== i || V !== o);
    b.isValid = k && c(L, {
      nodes: d,
      edges: u,
      sourceNode: h(L.source),
      targetNode: h(L.target)
    }), b.toHandle = zf(N, S, V, p, n, !0);
  }
  return b;
}
function Lf(e, t) {
  return e || (t?.classList.contains("target") ? "target" : t?.classList.contains("source") ? "source" : null);
}
function M_(e, t) {
  let n = null;
  return t ? n = "valid" : e && !t && (n = "invalid"), n;
}
function O_(e, t) {
  let n = null;
  return t ? n = !0 : e && !t && (n = !1), n;
}
function zf(e, t, n, i, o, r = !1) {
  var a, s, l;
  const c = i.get(e);
  if (!c)
    return null;
  const u = o === en.Strict ? (a = c.handleBounds) == null ? void 0 : a[t] : [...((s = c.handleBounds) == null ? void 0 : s.source) ?? [], ...((l = c.handleBounds) == null ? void 0 : l.target) ?? []], d = (n ? u?.find((h) => h.id === n) : u?.[0]) ?? null;
  return d && r ? { ...d, ...On(c, d, d.position, !0) } : d;
}
const es = {
  [ye.Left]: ye.Right,
  [ye.Right]: ye.Left,
  [ye.Top]: ye.Bottom,
  [ye.Bottom]: ye.Top
}, R_ = ["production", "prod"];
function No(e, ...t) {
  Vf() && console.warn(`[Vue Flow]: ${e}`, ...t);
}
function Vf() {
  return !R_.includes("production");
}
function _u(e, t, n, i, o) {
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
  o.value = !1, e.selected ? (r || e.selected && t) && (i([e]), ze(() => {
    a.blur();
  })) : n([e]);
}
function We(e) {
  return typeof f(e) < "u";
}
function D_(e, t, n, i) {
  if (!e || !e.source || !e.target)
    return n(new je(Ye.EDGE_INVALID, e?.id ?? "[ID UNKNOWN]")), !1;
  let o;
  return tn(e) ? o = e : o = {
    ...e,
    id: Af(e)
  }, o = Nf(o, void 0, i), v_(o, t) ? !1 : o;
}
function P_(e, t, n, i, o) {
  if (!t.source || !t.target)
    return o(new je(Ye.EDGE_INVALID, e.id)), !1;
  if (!n)
    return o(new je(Ye.EDGE_NOT_FOUND, e.id)), !1;
  const { id: r, ...a } = e;
  return {
    ...a,
    id: i ? Af(t) : r,
    source: t.source,
    target: t.target,
    sourceHandle: t.sourceHandle,
    targetHandle: t.targetHandle
  };
}
function ku(e, t, n) {
  const i = {}, o = [];
  for (let r = 0; r < e.length; ++r) {
    const a = e[r];
    if (!un(a)) {
      n(
        new je(Ye.NODE_INVALID, a?.id) || `[ID UNKNOWN|INDEX ${r}]`
      );
      continue;
    }
    const s = f_(a, t(a.id), a.parentNode);
    a.parentNode && (i[a.parentNode] = !0), o[r] = s;
  }
  for (const r of o) {
    const a = t(r.parentNode) || o.find((s) => s.id === r.parentNode);
    r.parentNode && !a && n(new je(Ye.NODE_MISSING_PARENT, r.id, r.parentNode)), (r.parentNode || i[r.id]) && (i[r.id] && (r.isParent = !0), a && (a.isParent = !0));
  }
  return o;
}
function Eu(e, t, n, i, o, r) {
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
    Eu("source", l, u, e, o, a), Eu("target", l, c, e, r, s);
  }
}
function xu(e, t) {
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
    const u = tn(c) ? c : D_(c, s, o, r);
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
      ...Nf(u, p, r),
      sourceNode: d,
      targetNode: h
    });
  }
  return l;
}
const $u = Symbol("vueFlow"), js = Symbol("nodeId"), Bf = Symbol("nodeRef"), L_ = Symbol("edgeId"), z_ = Symbol("edgeRef"), sr = Symbol("slots");
function Ff(e) {
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
    removeSelectedElements: _,
    addSelectedNodes: E,
    updateNodePositions: w,
    emits: b
  } = De(), { onStart: S, onDrag: N, onStop: V, onClick: A, el: T, disabled: L, id: M, selectable: k, dragHandle: B } = e, y = nt(!1);
  let I = [], C, H = null, F = { x: void 0, y: void 0 }, q = { x: 0, y: 0 }, U = null, ne = !1, ue = !1, G = 0, J = !1;
  const K = Hf(), X = ({ x: me, y: ge }) => {
    F = { x: me, y: ge };
    let P = !1;
    if (I = I.map((O) => {
      const D = { x: me - O.distance.x, y: ge - O.distance.y }, { computedPosition: Y } = Ys(
        O,
        n.value ? ar(D, i.value) : D,
        b.error,
        a.value,
        O.parentNode ? p(O.parentNode) : void 0
      );
      return P = P || O.position.x !== Y.x || O.position.y !== Y.y, O.position = Y, O;
    }), ue = ue || P, !!P && (w(I, !0, !0), y.value = !0, U)) {
      const [O, D] = Rr({
        id: M,
        dragItems: I,
        findNode: p
      });
      N({ event: U, node: O, nodes: D });
    }
  }, oe = () => {
    if (!H)
      return;
    const [me, ge] = Df(q, H, u.value);
    if (me !== 0 || ge !== 0) {
      const P = {
        x: (F.x ?? 0) - me / l.value.zoom,
        y: (F.y ?? 0) - ge / l.value.zoom
      };
      h({ x: me, y: ge }) && X(P);
    }
    G = requestAnimationFrame(oe);
  }, le = (me, ge) => {
    ne = !0;
    const P = p(M);
    !m.value && !v.value && P && (P.selected || _()), P && Ae(k) && m.value && ts(
      P,
      v.value,
      E,
      _,
      g,
      !1,
      ge
    );
    const O = K(me.sourceEvent);
    if (F = O, I = b_(r.value, d.value, O, M), I.length) {
      const [D, Y] = Rr({
        id: M,
        dragItems: I,
        findNode: p
      });
      S({ event: me.sourceEvent, node: D, nodes: Y });
    }
  }, fe = (me, ge) => {
    var P;
    me.sourceEvent.type === "touchmove" && me.sourceEvent.touches.length > 1 || (ue = !1, s.value === 0 && le(me, ge), F = K(me.sourceEvent), H = ((P = t.value) == null ? void 0 : P.getBoundingClientRect()) || null, q = $t(me.sourceEvent, H));
  }, _e = (me, ge) => {
    const P = K(me.sourceEvent);
    if (!J && ne && c.value && (J = !0, oe()), !ne) {
      const O = P.xSnapped - (F.x ?? 0), D = P.ySnapped - (F.y ?? 0);
      Math.sqrt(O * O + D * D) > s.value && le(me, ge);
    }
    (F.x !== P.xSnapped || F.y !== P.ySnapped) && I.length && ne && (U = me.sourceEvent, q = $t(me.sourceEvent, H), X(P));
  }, $e = (me) => {
    let ge = !1;
    if (!ne && !y.value && !v.value) {
      const P = me.sourceEvent, O = K(P), D = O.xSnapped - (F.x ?? 0), Y = O.ySnapped - (F.y ?? 0), ee = Math.sqrt(D * D + Y * Y);
      ee !== 0 && ee <= s.value && (A?.(P), ge = !0);
    }
    if (I.length && !ge) {
      ue && (w(I, !1, !1), ue = !1);
      const [P, O] = Rr({
        id: M,
        dragItems: I,
        findNode: p
      });
      V({ event: me.sourceEvent, node: P, nodes: O });
    }
    I = [], y.value = !1, J = !1, ne = !1, F = { x: void 0, y: void 0 }, cancelAnimationFrame(G);
  };
  return ke([() => Ae(L), T], ([me, ge], P, O) => {
    if (ge) {
      const D = ht(ge);
      me || (C = d1().on("start", (Y) => fe(Y, ge)).on("drag", (Y) => _e(Y, ge)).on("end", (Y) => $e(Y)).filter((Y) => {
        const ee = Y.target, re = Ae(B);
        return !Y.button && (!o.value || !gu(ee, `.${o.value}`, ge) && (!re || gu(ee, re, ge)));
      }), D.call(C)), O(() => {
        D.on(".drag", null), C && (C.on("start", null), C.on("drag", null), C.on("end", null));
      });
    }
  }), y;
}
function V_() {
  return {
    doubleClick: ve(),
    click: ve(),
    mouseEnter: ve(),
    mouseMove: ve(),
    mouseLeave: ve(),
    contextMenu: ve(),
    updateStart: ve(),
    update: ve(),
    updateEnd: ve()
  };
}
function B_(e, t) {
  const n = V_();
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
function Hf() {
  const { viewport: e, snapGrid: t, snapToGrid: n, vueFlowRef: i } = De();
  return (o) => {
    var r;
    const a = ((r = i.value) == null ? void 0 : r.getBoundingClientRect()) ?? { left: 0, top: 0 }, s = S_(o) ? o.sourceEvent : o, { x: l, y: c } = $t(s, a), u = vo({ x: l, y: c }, e.value), { x: d, y: h } = n.value ? ar(u, t.value) : u;
    return {
      xSnapped: d,
      ySnapped: h,
      ...u
    };
  };
}
function Go() {
  return !0;
}
function qf({
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
    panBy: _,
    startConnection: E,
    updateConnection: w,
    endConnection: b,
    emits: S,
    viewport: N,
    edges: V,
    nodes: A,
    isValidConnection: T,
    nodeLookup: L
  } = De();
  let M = null, k = !1, B = null;
  function y(C) {
    var H;
    const F = Ae(n) === "target", q = Gs(C), U = uu(C.target), ne = C.currentTarget;
    if (ne && (q && C.button === 0 || !q)) {
      let ue = function(be) {
        P = $t(be, $e), X = T_(
          vo(P, N.value, !1, [1, 1]),
          u.value,
          L.value,
          Y
        ), O || (D(), O = !0);
        const Ee = bu(
          be,
          {
            handle: X,
            connectionMode: c.value,
            fromNodeId: Ae(t),
            fromHandleId: Ae(e),
            fromType: F ? "target" : "source",
            isValidConnection: K,
            doc: U,
            lib: "vue",
            flowId: s,
            nodeLookup: L.value
          },
          V.value,
          A.value,
          m,
          L.value
        );
        B = Ee.handleDomNode, M = Ee.connection, k = O_(!!X, Ee.isValid);
        const Se = {
          // from stays the same
          ...ce,
          isValid: k,
          to: Ee.toHandle && k ? po({ x: Ee.toHandle.x, y: Ee.toHandle.y }, N.value) : P,
          toHandle: Ee.toHandle,
          toPosition: k && Ee.toHandle ? Ee.toHandle.position : es[Y.position],
          toNode: Ee.toHandle ? L.value.get(Ee.toHandle.nodeId) : null
        };
        if (k && X && ce?.toHandle && Se.toHandle && ce.toHandle.type === Se.toHandle.type && ce.toHandle.nodeId === Se.toHandle.nodeId && ce.toHandle.id === Se.toHandle.id && ce.to.x === Se.to.x && ce.to.y === Se.to.y)
          return;
        const Me = X ?? Ee.toHandle;
        if (w(
          Me && k ? po(
            {
              x: Me.x,
              y: Me.y
            },
            N.value
          ) : P,
          Me,
          M_(!!Me, k)
        ), ce = Se, !X && !k && !B)
          return Dr(ge);
        M && M.source !== M.target && B && (Dr(ge), ge = B, B.classList.add("connecting", "vue-flow__handle-connecting"), B.classList.toggle("valid", !!k), B.classList.toggle("vue-flow__handle-valid", !!k));
      }, G = function(be) {
        "touches" in be && be.touches.length > 0 || ((X || B) && M && k && (r ? r(be, M) : S.connect(M)), S.connectEnd(be), o && a?.(be), Dr(ge), cancelAnimationFrame(oe), b(be), O = !1, k = !1, M = null, B = null, U.removeEventListener("mousemove", ue), U.removeEventListener("mouseup", G), U.removeEventListener("touchmove", ue), U.removeEventListener("touchend", G));
      };
      const J = m(Ae(t));
      let K = Ae(i) || T.value || Go;
      !K && J && (K = (F ? J.isValidSourcePos : J.isValidTargetPos) || Go);
      let X, oe = 0;
      const { x: le, y: fe } = $t(C), _e = Lf(Ae(o), ne), $e = (H = l.value) == null ? void 0 : H.getBoundingClientRect();
      if (!$e || !_e)
        return;
      const me = zf(Ae(t), _e, Ae(e), L.value, c.value);
      if (!me)
        return;
      let ge, P = $t(C, $e), O = !1;
      const D = () => {
        if (!v.value)
          return;
        const [be, Ee] = Df(P, $e, g.value);
        _({ x: be, y: Ee }), oe = requestAnimationFrame(D);
      }, Y = {
        ...me,
        nodeId: Ae(t),
        type: _e,
        position: me.position
      }, ee = L.value.get(Ae(t)), te = {
        inProgress: !0,
        isValid: null,
        from: On(ee, Y, ye.Left, !0),
        fromHandle: Y,
        fromPosition: Y.position,
        fromNode: ee,
        to: P,
        toHandle: null,
        toPosition: es[Y.position],
        toNode: null
      };
      E(
        {
          nodeId: Ae(t),
          id: Ae(e),
          type: _e,
          position: ne?.getAttribute("data-handlepos") || ye.Top,
          ...P
        },
        {
          x: le - $e.left,
          y: fe - $e.top
        }
      ), S.connectStart({ event: C, nodeId: Ae(t), handleId: Ae(e), handleType: _e });
      let ce = te;
      U.addEventListener("mousemove", ue), U.addEventListener("mouseup", G), U.addEventListener("touchmove", ue), U.addEventListener("touchend", G);
    }
  }
  function I(C) {
    var H, F;
    if (!d.value)
      return;
    const q = Ae(n) === "target";
    if (!h.value) {
      S.clickConnectStart({ event: C, nodeId: Ae(t), handleId: Ae(e) }), E(
        {
          nodeId: Ae(t),
          type: Ae(n),
          id: Ae(e),
          position: ye.Top,
          ...$t(C)
        },
        void 0,
        !0
      );
      return;
    }
    let U = Ae(i) || T.value || Go;
    const ne = m(Ae(t));
    if (!U && ne && (U = (q ? ne.isValidSourcePos : ne.isValidTargetPos) || Go), ne && (typeof ne.connectable > "u" ? p.value : ne.connectable) === !1)
      return;
    const ue = uu(C.target), G = bu(
      C,
      {
        handle: {
          nodeId: Ae(t),
          id: Ae(e),
          type: Ae(n),
          position: ye.Top,
          ...$t(C)
        },
        connectionMode: c.value,
        fromNodeId: h.value.nodeId,
        fromHandleId: h.value.id ?? null,
        fromType: h.value.type,
        isValidConnection: U,
        doc: ue,
        lib: "vue",
        flowId: s,
        nodeLookup: L.value
      },
      V.value,
      A.value,
      m,
      L.value
    ), J = ((H = G.connection) == null ? void 0 : H.source) === ((F = G.connection) == null ? void 0 : F.target);
    G.isValid && G.connection && !J && S.connect(G.connection), S.clickConnectEnd(C), b(C, !0);
  }
  return {
    handlePointerDown: y,
    handleClick: I
  };
}
function F_() {
  return Ht(js, "");
}
function Uf(e) {
  const t = e ?? F_() ?? "", n = Ht(Bf, j(null)), { findNode: i, edges: o, emits: r } = De(), a = i(t);
  return a || r.error(new je(Ye.NODE_NOT_FOUND, t)), {
    id: t,
    nodeEl: n,
    node: a,
    parentNode: W(() => i(a.parentNode)),
    connectedEdges: W(() => on([a], o.value))
  };
}
function H_() {
  return {
    doubleClick: ve(),
    click: ve(),
    mouseEnter: ve(),
    mouseMove: ve(),
    mouseLeave: ve(),
    contextMenu: ve(),
    dragStart: ve(),
    drag: ve(),
    dragStop: ve()
  };
}
function q_(e, t) {
  const n = H_();
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
function Wf() {
  const { getSelectedNodes: e, nodeExtent: t, updateNodePositions: n, findNode: i, snapGrid: o, snapToGrid: r, nodesDraggable: a, emits: s } = De();
  return (l, c = !1) => {
    const u = r.value ? o.value[0] : 5, d = r.value ? o.value[1] : 5, h = c ? 4 : 1, p = l.x * u * h, v = l.y * d * h, g = [];
    for (const m of e.value)
      if (m.draggable || a && typeof m.draggable > "u") {
        const _ = { x: m.computedPosition.x + p, y: m.computedPosition.y + v }, { position: E } = Ys(
          m,
          _,
          s.error,
          t.value,
          m.parentNode ? i(m.parentNode) : void 0
        );
        g.push({
          id: m.id,
          position: E,
          from: m.position,
          distance: { x: l.x, y: l.y },
          dimensions: m.dimensions
        });
      }
    n(g, !0, !1);
  };
}
const jo = 0.1, U_ = (e) => ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
function Ut() {
  return No("Viewport not initialized yet."), Promise.resolve(!1);
}
const W_ = {
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
function Y_(e) {
  function t(i, o) {
    return new Promise((r) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.interpolate(o?.interpolate === "linear" ? eo : li).scaleBy(
        zr(e.d3Selection, o?.duration, o?.ease, () => {
          r(!0);
        }),
        i
      ) : r(!1);
    });
  }
  function n(i, o, r, a) {
    return new Promise((s) => {
      var l;
      const { x: c, y: u } = Cf({ x: -i, y: -o }, e.translateExtent), d = Mn.translate(-c, -u).scale(r);
      e.d3Selection && e.d3Zoom ? (l = e.d3Zoom) == null || l.interpolate(a?.interpolate === "linear" ? eo : li).transform(
        zr(e.d3Selection, a?.duration, a?.ease, () => {
          s(!0);
        }),
        d
      ) : s(!1);
    });
  }
  return W(() => e.d3Zoom && e.d3Selection && e.dimensions.width && e.dimensions.height ? {
    viewportInitialized: !0,
    // todo: allow passing scale as option
    zoomIn: (o) => t(1.2, o),
    zoomOut: (o) => t(1 / 1.2, o),
    zoomTo: (o, r) => new Promise((a) => {
      e.d3Selection && e.d3Zoom ? e.d3Zoom.interpolate(r?.interpolate === "linear" ? eo : li).scaleTo(
        zr(e.d3Selection, r?.duration, r?.ease, () => {
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
      for (const h of e.nodes)
        h.dimensions.width && h.dimensions.height && (o?.includeHiddenNodes || !h.hidden) && (!((r = o.nodes) != null && r.length) || (a = o.nodes) != null && a.length && o.nodes.includes(h.id)) && s.push(h);
      if (!s.length)
        return Promise.resolve(!1);
      const l = Ws(s), { x: c, y: u, zoom: d } = cu(
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
      const { x: a, y: s, zoom: l } = cu(
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
  } : W_);
}
function zr(e, t = 0, n = U_, i = () => {
}) {
  const o = typeof t == "number" && t > 0;
  return o || i(), o ? e.transition().duration(t).ease(n).on("end", i) : e;
}
function G_(e, t, n) {
  const i = md(!0);
  return i.run(() => {
    const o = () => {
      i.run(() => {
        let g, m, _ = !!(n.nodes.value.length || n.edges.value.length);
        g = bn([e.modelValue, () => {
          var E, w;
          return (w = (E = e.modelValue) == null ? void 0 : E.value) == null ? void 0 : w.length;
        }], ([E]) => {
          E && Array.isArray(E) && (m?.pause(), n.setElements(E), !m && !_ && E.length ? _ = !0 : m?.resume());
        }), m = bn(
          [n.nodes, n.edges, () => n.edges.value.length, () => n.nodes.value.length],
          ([E, w]) => {
            var b;
            (b = e.modelValue) != null && b.value && Array.isArray(e.modelValue.value) && (g?.pause(), e.modelValue.value = [...E, ...w], ze(() => {
              g?.resume();
            }));
          },
          { immediate: _ }
        ), ri(() => {
          g?.stop(), m?.stop();
        });
      });
    }, r = () => {
      i.run(() => {
        let g, m, _ = !!n.nodes.value.length;
        g = bn([e.nodes, () => {
          var E, w;
          return (w = (E = e.nodes) == null ? void 0 : E.value) == null ? void 0 : w.length;
        }], ([E]) => {
          E && Array.isArray(E) && (m?.pause(), n.setNodes(E), !m && !_ && E.length ? _ = !0 : m?.resume());
        }), m = bn(
          [n.nodes, () => n.nodes.value.length],
          ([E]) => {
            var w;
            (w = e.nodes) != null && w.value && Array.isArray(e.nodes.value) && (g?.pause(), e.nodes.value = [...E], ze(() => {
              g?.resume();
            }));
          },
          { immediate: _ }
        ), ri(() => {
          g?.stop(), m?.stop();
        });
      });
    }, a = () => {
      i.run(() => {
        let g, m, _ = !!n.edges.value.length;
        g = bn([e.edges, () => {
          var E, w;
          return (w = (E = e.edges) == null ? void 0 : E.value) == null ? void 0 : w.length;
        }], ([E]) => {
          E && Array.isArray(E) && (m?.pause(), n.setEdges(E), !m && !_ && E.length ? _ = !0 : m?.resume());
        }), m = bn(
          [n.edges, () => n.edges.value.length],
          ([E]) => {
            var w;
            (w = e.edges) != null && w.value && Array.isArray(e.edges.value) && (g?.pause(), e.edges.value = [...E], ze(() => {
              g?.resume();
            }));
          },
          { immediate: _ }
        ), ri(() => {
          g?.stop(), m?.stop();
        });
      });
    }, s = () => {
      i.run(() => {
        ke(
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
        ke(
          () => t.minZoom,
          () => {
            t.minZoom && We(t.minZoom) && n.setMinZoom(t.minZoom);
          },
          { immediate: !0 }
        );
      });
    }, c = () => {
      i.run(() => {
        ke(
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
        ke(
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
        ke(
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
          let _ = m;
          typeof t.autoConnect == "function" && (_ = await t.autoConnect(m)), _ !== !1 && n.addEdges([_]);
        };
        ke(
          () => t.autoConnect,
          () => {
            We(t.autoConnect) && (n.autoConnect.value = t.autoConnect);
          },
          { immediate: !0 }
        ), ke(
          n.autoConnect,
          (m, _, E) => {
            m ? n.onConnect(g) : n.hooks.value.connect.off(g), E(() => {
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
        const _ = m;
        if (!g.includes(_)) {
          const E = Ne(() => t[_]), w = n[_];
          $s(w) && i.run(() => {
            ke(
              E,
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
function j_() {
  return {
    edgesChange: ve(),
    nodesChange: ve(),
    nodeDoubleClick: ve(),
    nodeClick: ve(),
    nodeMouseEnter: ve(),
    nodeMouseMove: ve(),
    nodeMouseLeave: ve(),
    nodeContextMenu: ve(),
    nodeDragStart: ve(),
    nodeDrag: ve(),
    nodeDragStop: ve(),
    nodesInitialized: ve(),
    miniMapNodeClick: ve(),
    miniMapNodeDoubleClick: ve(),
    miniMapNodeMouseEnter: ve(),
    miniMapNodeMouseMove: ve(),
    miniMapNodeMouseLeave: ve(),
    connect: ve(),
    connectStart: ve(),
    connectEnd: ve(),
    clickConnectStart: ve(),
    clickConnectEnd: ve(),
    paneReady: ve(),
    init: ve(),
    move: ve(),
    moveStart: ve(),
    moveEnd: ve(),
    selectionDragStart: ve(),
    selectionDrag: ve(),
    selectionDragStop: ve(),
    selectionContextMenu: ve(),
    selectionStart: ve(),
    selectionEnd: ve(),
    viewportChangeStart: ve(),
    viewportChange: ve(),
    viewportChangeEnd: ve(),
    paneScroll: ve(),
    paneClick: ve(),
    paneContextMenu: ve(),
    paneMouseEnter: ve(),
    paneMouseMove: ve(),
    paneMouseLeave: ve(),
    edgeContextMenu: ve(),
    edgeMouseEnter: ve(),
    edgeMouseMove: ve(),
    edgeMouseLeave: ve(),
    edgeDoubleClick: ve(),
    edgeClick: ve(),
    edgeUpdateStart: ve(),
    edgeUpdate: ve(),
    edgeUpdateEnd: ve(),
    updateNodeInternals: ve(),
    error: ve((e) => No(e.message))
  };
}
function X_(e, t) {
  const n = Ln();
  Vm(() => {
    for (const [o, r] of Object.entries(t.value)) {
      const a = (s) => {
        e(o, s);
      };
      r.setEmitter(a), lo(r.removeEmitter), r.setHasEmitListeners(() => i(o)), lo(r.removeHasEmitListeners);
    }
  });
  function i(o) {
    var r;
    const a = K_(o);
    return !!((r = n?.vnode.props) == null ? void 0 : r[a]);
  }
}
function K_(e) {
  const [t, ...n] = e.split(":");
  return `on${t.replace(/(?:^|-)(\w)/g, (o, r) => r.toUpperCase())}${n.length ? `:${n.join(":")}` : ""}`;
}
function Yf() {
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
    hooks: j_(),
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
const Z_ = [
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
function J_(e, t, n) {
  const i = Y_(e), o = (P) => {
    const O = P ?? [];
    e.hooks.updateNodeInternals.trigger(O);
  }, r = (P) => p_(P, e.nodes, e.edges), a = (P) => h_(P, e.nodes, e.edges), s = (P) => on(P, e.edges), l = ({ id: P, type: O, nodeId: D }) => {
    var Y;
    const ee = P ? `-${O}-${P}` : `-${O}`;
    return Array.from(((Y = e.connectionLookup.get(`${D}${ee}`)) == null ? void 0 : Y.values()) ?? []);
  }, c = (P) => {
    if (P)
      return t.value.get(P);
  }, u = (P) => {
    if (P)
      return n.value.get(P);
  }, d = (P, O, D) => {
    var Y, ee;
    const re = [];
    for (const te of P) {
      const ce = {
        id: te.id,
        type: "position",
        dragging: D,
        from: te.from
      };
      if (O && (ce.position = te.position, te.parentNode)) {
        const be = c(te.parentNode);
        ce.position = {
          x: ce.position.x - (((Y = be?.computedPosition) == null ? void 0 : Y.x) ?? 0),
          y: ce.position.y - (((ee = be?.computedPosition) == null ? void 0 : ee.y) ?? 0)
        };
      }
      re.push(ce);
    }
    re?.length && e.hooks.nodesChange.trigger(re);
  }, h = (P) => {
    if (!e.vueFlowRef)
      return;
    const O = e.vueFlowRef.querySelector(".vue-flow__transformationpane");
    if (!O)
      return;
    const D = window.getComputedStyle(O), { m22: Y } = new window.DOMMatrixReadOnly(D.transform), ee = [];
    for (const re of P) {
      const te = re, ce = c(te.id);
      if (ce) {
        const be = rr(te.nodeElement);
        if (!!(be.width && be.height && (ce.dimensions.width !== be.width || ce.dimensions.height !== be.height || te.forceUpdate))) {
          const Se = te.nodeElement.getBoundingClientRect();
          ce.dimensions = be, ce.handleBounds.source = _u("source", te.nodeElement, Se, Y, ce.id), ce.handleBounds.target = _u("target", te.nodeElement, Se, Y, ce.id), ee.push({
            id: ce.id,
            type: "dimensions",
            dimensions: be
          });
        }
      }
    }
    !e.fitViewOnInitDone && e.fitViewOnInit && i.value.fitView().then(() => {
      e.fitViewOnInitDone = !0;
    }), ee.length && e.hooks.nodesChange.trigger(ee);
  }, p = (P, O) => {
    const D = /* @__PURE__ */ new Set(), Y = /* @__PURE__ */ new Set();
    for (const te of P)
      un(te) ? D.add(te.id) : tn(te) && Y.add(te.id);
    const ee = Gt(t.value, D, !0), re = Gt(n.value, Y);
    if (e.multiSelectionActive) {
      for (const te of D)
        ee.push(Wt(te, O));
      for (const te of Y)
        re.push(Wt(te, O));
    }
    ee.length && e.hooks.nodesChange.trigger(ee), re.length && e.hooks.edgesChange.trigger(re);
  }, v = (P) => {
    if (e.multiSelectionActive) {
      const O = P.map((D) => Wt(D.id, !0));
      e.hooks.nodesChange.trigger(O);
      return;
    }
    e.hooks.nodesChange.trigger(Gt(t.value, new Set(P.map((O) => O.id)), !0)), e.hooks.edgesChange.trigger(Gt(n.value));
  }, g = (P) => {
    if (e.multiSelectionActive) {
      const O = P.map((D) => Wt(D.id, !0));
      e.hooks.edgesChange.trigger(O);
      return;
    }
    e.hooks.edgesChange.trigger(Gt(n.value, new Set(P.map((O) => O.id)))), e.hooks.nodesChange.trigger(Gt(t.value, /* @__PURE__ */ new Set(), !0));
  }, m = (P) => {
    p(P, !0);
  }, _ = (P) => {
    const D = (P || e.nodes).map((Y) => (Y.selected = !1, Wt(Y.id, !1)));
    e.hooks.nodesChange.trigger(D);
  }, E = (P) => {
    const D = (P || e.edges).map((Y) => (Y.selected = !1, Wt(Y.id, !1)));
    e.hooks.edgesChange.trigger(D);
  }, w = (P) => {
    if (!P || !P.length)
      return p([], !1);
    const O = P.reduce(
      (D, Y) => {
        const ee = Wt(Y.id, !1);
        return un(Y) ? D.nodes.push(ee) : D.edges.push(ee), D;
      },
      { nodes: [], edges: [] }
    );
    O.nodes.length && e.hooks.nodesChange.trigger(O.nodes), O.edges.length && e.hooks.edgesChange.trigger(O.edges);
  }, b = (P) => {
    var O;
    (O = e.d3Zoom) == null || O.scaleExtent([P, e.maxZoom]), e.minZoom = P;
  }, S = (P) => {
    var O;
    (O = e.d3Zoom) == null || O.scaleExtent([e.minZoom, P]), e.maxZoom = P;
  }, N = (P) => {
    var O;
    (O = e.d3Zoom) == null || O.translateExtent(P), e.translateExtent = P;
  }, V = (P) => {
    e.nodeExtent = P, o();
  }, A = (P) => {
    var O;
    (O = e.d3Zoom) == null || O.clickDistance(P);
  }, T = (P) => {
    e.nodesDraggable = P, e.nodesConnectable = P, e.elementsSelectable = P;
  }, L = (P) => {
    const O = P instanceof Function ? P(e.nodes) : P;
    !e.initialized && !O.length || (e.nodes = ku(O, c, e.hooks.error.trigger));
  }, M = (P) => {
    const O = P instanceof Function ? P(e.edges) : P;
    if (!e.initialized && !O.length)
      return;
    const D = Lr(
      O,
      e.isValidConnection,
      c,
      u,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    );
    Pr(e.connectionLookup, n.value, D), e.edges = D;
  }, k = (P) => {
    const O = P instanceof Function ? P([...e.nodes, ...e.edges]) : P;
    !e.initialized && !O.length || (L(O.filter(un)), M(O.filter(tn)));
  }, B = (P) => {
    let O = P instanceof Function ? P(e.nodes) : P;
    O = Array.isArray(O) ? O : [O];
    const D = ku(O, c, e.hooks.error.trigger), Y = [];
    for (const ee of D)
      Y.push(hu(ee));
    Y.length && e.hooks.nodesChange.trigger(Y);
  }, y = (P) => {
    let O = P instanceof Function ? P(e.edges) : P;
    O = Array.isArray(O) ? O : [O];
    const D = Lr(
      O,
      e.isValidConnection,
      c,
      u,
      e.hooks.error.trigger,
      e.defaultEdgeOptions,
      e.nodes,
      e.edges
    ), Y = [];
    for (const ee of D)
      Y.push(hu(ee));
    Y.length && e.hooks.edgesChange.trigger(Y);
  }, I = (P, O = !0, D = !1) => {
    const Y = P instanceof Function ? P(e.nodes) : P, ee = Array.isArray(Y) ? Y : [Y], re = [], te = [];
    function ce(Ee) {
      const Se = s(Ee);
      for (const Me of Se)
        (!We(Me.deletable) || Me.deletable) && te.push(vu(Me.id, Me.source, Me.target, Me.sourceHandle, Me.targetHandle));
    }
    function be(Ee) {
      const Se = [];
      for (const Me of e.nodes)
        Me.parentNode === Ee && Se.push(Me);
      if (Se.length) {
        for (const Me of Se)
          re.push(pu(Me.id));
        O && ce(Se);
        for (const Me of Se)
          be(Me.id);
      }
    }
    for (const Ee of ee) {
      const Se = typeof Ee == "string" ? c(Ee) : Ee;
      Se && (We(Se.deletable) && !Se.deletable || (re.push(pu(Se.id)), O && ce([Se]), D && be(Se.id)));
    }
    te.length && e.hooks.edgesChange.trigger(te), re.length && e.hooks.nodesChange.trigger(re);
  }, C = (P) => {
    const O = P instanceof Function ? P(e.edges) : P, D = Array.isArray(O) ? O : [O], Y = [];
    for (const ee of D) {
      const re = typeof ee == "string" ? u(ee) : ee;
      re && (We(re.deletable) && !re.deletable || Y.push(
        vu(
          typeof ee == "string" ? ee : ee.id,
          re.source,
          re.target,
          re.sourceHandle,
          re.targetHandle
        )
      ));
    }
    e.hooks.edgesChange.trigger(Y);
  }, H = (P, O, D = !0) => {
    const Y = u(P.id);
    if (!Y)
      return !1;
    const ee = e.edges.indexOf(Y), re = P_(P, O, Y, D, e.hooks.error.trigger);
    if (re) {
      const [te] = Lr(
        [re],
        e.isValidConnection,
        c,
        u,
        e.hooks.error.trigger,
        e.defaultEdgeOptions,
        e.nodes,
        e.edges
      );
      return e.edges = e.edges.map((ce, be) => be === ee ? te : ce), Pr(e.connectionLookup, n.value, [te]), te;
    }
    return !1;
  }, F = (P, O, D = { replace: !1 }) => {
    const Y = u(P);
    if (!Y)
      return;
    const ee = typeof O == "function" ? O(Y) : O;
    Y.data = D.replace ? ee : { ...Y.data, ...ee };
  }, q = (P) => fu(P, e.nodes), U = (P) => {
    const O = fu(P, e.edges);
    return Pr(e.connectionLookup, n.value, O), O;
  }, ne = (P, O, D = { replace: !1 }) => {
    const Y = c(P);
    if (!Y)
      return;
    const ee = typeof O == "function" ? O(Y) : O;
    D.replace ? e.nodes.splice(e.nodes.indexOf(Y), 1, ee) : Object.assign(Y, ee);
  }, ue = (P, O, D = { replace: !1 }) => {
    const Y = c(P);
    if (!Y)
      return;
    const ee = typeof O == "function" ? O(Y) : O;
    Y.data = D.replace ? ee : { ...Y.data, ...ee };
  }, G = (P, O, D = !1) => {
    D ? e.connectionClickStartHandle = P : e.connectionStartHandle = P, e.connectionEndHandle = null, e.connectionStatus = null, O && (e.connectionPosition = O);
  }, J = (P, O = null, D = null) => {
    e.connectionStartHandle && (e.connectionPosition = P, e.connectionEndHandle = O, e.connectionStatus = D);
  }, K = (P, O) => {
    e.connectionPosition = { x: Number.NaN, y: Number.NaN }, e.connectionEndHandle = null, e.connectionStatus = null, O ? e.connectionClickStartHandle = null : e.connectionStartHandle = null;
  }, X = (P) => {
    const O = d_(P), D = O ? null : Xn(P) ? P : c(P.id);
    return !O && !D ? [null, null, O] : [O ? P : Oi(D), D, O];
  }, oe = (P, O = !0, D = e.nodes) => {
    const [Y, ee, re] = X(P);
    if (!Y)
      return [];
    const te = [];
    for (const ce of D || e.nodes) {
      if (!re && (ce.id === ee.id || !ce.computedPosition))
        continue;
      const be = Oi(ce), Ee = Ri(be, Y);
      (O && Ee > 0 || Ee >= be.width * be.height || Ee >= Number(Y.width) * Number(Y.height)) && te.push(ce);
    }
    return te;
  }, le = (P, O, D = !0) => {
    const [Y] = X(P);
    if (!Y)
      return !1;
    const ee = Ri(Y, O);
    return D && ee > 0 || ee >= Number(Y.width) * Number(Y.height);
  }, fe = (P) => {
    const { viewport: O, dimensions: D, d3Zoom: Y, d3Selection: ee, translateExtent: re } = e;
    if (!Y || !ee || !P.x && !P.y)
      return !1;
    const te = Mn.translate(O.x + P.x, O.y + P.y).scale(O.zoom), ce = [
      [0, 0],
      [D.width, D.height]
    ], be = Y.constrain()(te, ce, re), Ee = e.viewport.x !== be.x || e.viewport.y !== be.y || e.viewport.zoom !== be.k;
    return Y.transform(ee, be), Ee;
  }, _e = (P) => {
    const O = P instanceof Function ? P(e) : P, D = [
      "d3Zoom",
      "d3Selection",
      "d3ZoomHandler",
      "viewportRef",
      "vueFlowRef",
      "dimensions",
      "hooks"
    ];
    We(O.defaultEdgeOptions) && (e.defaultEdgeOptions = O.defaultEdgeOptions);
    const Y = O.modelValue || O.nodes || O.edges ? [] : void 0;
    Y && (O.modelValue && Y.push(...O.modelValue), O.nodes && Y.push(...O.nodes), O.edges && Y.push(...O.edges), k(Y));
    const ee = () => {
      We(O.maxZoom) && S(O.maxZoom), We(O.minZoom) && b(O.minZoom), We(O.translateExtent) && N(O.translateExtent);
    };
    for (const re of Object.keys(O)) {
      const te = re, ce = O[te];
      ![...Z_, ...D].includes(te) && We(ce) && (e[te] = ce);
    }
    qa(() => e.d3Zoom).not.toBeNull().then(ee), e.initialized || (e.initialized = !0);
  };
  return {
    updateNodePositions: d,
    updateNodeDimensions: h,
    setElements: k,
    setNodes: L,
    setEdges: M,
    addNodes: B,
    addEdges: y,
    removeNodes: I,
    removeEdges: C,
    findNode: c,
    findEdge: u,
    updateEdge: H,
    updateEdgeData: F,
    updateNode: ne,
    updateNodeData: ue,
    applyEdgeChanges: U,
    applyNodeChanges: q,
    addSelectedElements: m,
    addSelectedNodes: v,
    addSelectedEdges: g,
    setMinZoom: b,
    setMaxZoom: S,
    setTranslateExtent: N,
    setNodeExtent: V,
    setPaneClickDistance: A,
    removeSelectedElements: w,
    removeSelectedNodes: _,
    removeSelectedEdges: E,
    startConnection: G,
    updateConnection: J,
    endConnection: K,
    setInteractive: T,
    setState: _e,
    getIntersectingNodes: oe,
    getIncomers: r,
    getOutgoers: a,
    getConnectedEdges: s,
    getHandleConnections: l,
    isNodeIntersecting: le,
    panBy: fe,
    fitView: (P) => i.value.fitView(P),
    zoomIn: (P) => i.value.zoomIn(P),
    zoomOut: (P) => i.value.zoomOut(P),
    zoomTo: (P, O) => i.value.zoomTo(P, O),
    setViewport: (P, O) => i.value.setViewport(P, O),
    setTransform: (P, O) => i.value.setTransform(P, O),
    getViewport: () => i.value.getViewport(),
    getTransform: () => i.value.getTransform(),
    setCenter: (P, O, D) => i.value.setCenter(P, O, D),
    fitBounds: (P, O) => i.value.fitBounds(P, O),
    project: (P) => i.value.project(P),
    screenToFlowCoordinate: (P) => i.value.screenToFlowCoordinate(P),
    flowToScreenCoordinate: (P) => i.value.flowToScreenCoordinate(P),
    toObject: () => {
      const P = [], O = [];
      for (const D of e.nodes) {
        const {
          computedPosition: Y,
          handleBounds: ee,
          selected: re,
          dimensions: te,
          isParent: ce,
          resizing: be,
          dragging: Ee,
          events: Se,
          ...Me
        } = D;
        P.push(Me);
      }
      for (const D of e.edges) {
        const { selected: Y, sourceNode: ee, targetNode: re, events: te, ...ce } = D;
        O.push(ce);
      }
      return JSON.parse(
        JSON.stringify({
          nodes: P,
          edges: O,
          position: [e.viewport.x, e.viewport.y],
          zoom: e.viewport.zoom,
          viewport: e.viewport
        })
      );
    },
    fromObject: (P) => new Promise((O) => {
      const { nodes: D, edges: Y, position: ee, zoom: re, viewport: te } = P;
      D && L(D), Y && M(Y);
      const [ce, be] = te?.x && te?.y ? [te.x, te.y] : ee ?? [null, null];
      if (ce && be) {
        const Ee = te?.zoom || re || e.viewport.zoom;
        return qa(() => i.value.viewportInitialized).toBe(!0).then(() => {
          i.value.setViewport({
            x: ce,
            y: be,
            zoom: Ee
          }).then(() => {
            O(!0);
          });
        });
      } else
        O(!0);
    }),
    updateNodeInternals: o,
    viewportHelper: i,
    $reset: () => {
      const P = Yf();
      if (e.edges = [], e.nodes = [], e.d3Zoom && e.d3Selection) {
        const O = Mn.translate(P.defaultViewport.x ?? 0, P.defaultViewport.y ?? 0).scale(Bt(P.defaultViewport.zoom ?? 1, P.minZoom, P.maxZoom)), D = e.viewportRef.getBoundingClientRect(), Y = [
          [0, 0],
          [D.width, D.height]
        ], ee = e.d3Zoom.constrain()(O, Y, P.translateExtent);
        e.d3Zoom.transform(e.d3Selection, ee);
      }
      _e(P);
    },
    $destroy: () => {
    }
  };
}
const Q_ = ["data-id", "data-handleid", "data-nodeid", "data-handlepos"], ek = {
  name: "Handle",
  compatConfig: { MODE: 3 }
}, xt = /* @__PURE__ */ we({
  ...ek,
  props: {
    id: { default: null },
    type: {},
    position: { default: () => ye.Top },
    isValidConnection: { type: Function },
    connectable: { type: [Boolean, Number, String, Function], default: void 0 },
    connectableStart: { type: Boolean, default: !0 },
    connectableEnd: { type: Boolean, default: !0 }
  },
  setup(e, { expose: t }) {
    const n = Pm(e, ["position", "connectable", "connectableStart", "connectableEnd", "id"]), i = Ne(() => n.type ?? "source"), o = Ne(() => n.isValidConnection ?? null), {
      id: r,
      connectionStartHandle: a,
      connectionClickStartHandle: s,
      connectionEndHandle: l,
      vueFlowRef: c,
      nodesConnectable: u,
      noDragClassName: d,
      noPanClassName: h
    } = De(), { id: p, node: v, nodeEl: g, connectedEdges: m } = Uf(), _ = j(), E = Ne(() => typeof e.connectableStart < "u" ? e.connectableStart : !0), w = Ne(() => typeof e.connectableEnd < "u" ? e.connectableEnd : !0), b = Ne(
      () => {
        var M, k, B, y, I, C;
        return ((M = a.value) == null ? void 0 : M.nodeId) === p && ((k = a.value) == null ? void 0 : k.id) === e.id && ((B = a.value) == null ? void 0 : B.type) === i.value || ((y = l.value) == null ? void 0 : y.nodeId) === p && ((I = l.value) == null ? void 0 : I.id) === e.id && ((C = l.value) == null ? void 0 : C.type) === i.value;
      }
    ), S = Ne(
      () => {
        var M, k, B;
        return ((M = s.value) == null ? void 0 : M.nodeId) === p && ((k = s.value) == null ? void 0 : k.id) === e.id && ((B = s.value) == null ? void 0 : B.type) === i.value;
      }
    ), { handlePointerDown: N, handleClick: V } = qf({
      nodeId: p,
      handleId: e.id,
      isValidConnection: o,
      type: i
    }), A = W(() => typeof e.connectable == "string" && e.connectable === "single" ? !m.value.some((M) => {
      const k = M[`${i.value}Handle`];
      return M[i.value] !== p ? !1 : k ? k === e.id : !0;
    }) : typeof e.connectable == "number" ? m.value.filter((M) => {
      const k = M[`${i.value}Handle`];
      return M[i.value] !== p ? !1 : k ? k === e.id : !0;
    }).length < e.connectable : typeof e.connectable == "function" ? e.connectable(v, m.value) : We(e.connectable) ? e.connectable : u.value);
    Ue(() => {
      var M;
      if (!v.dimensions.width || !v.dimensions.height)
        return;
      const k = (M = v.handleBounds[i.value]) == null ? void 0 : M.find((q) => q.id === e.id);
      if (!c.value || k)
        return;
      const B = c.value.querySelector(".vue-flow__transformationpane");
      if (!g.value || !_.value || !B || !e.id)
        return;
      const y = g.value.getBoundingClientRect(), I = _.value.getBoundingClientRect(), C = window.getComputedStyle(B), { m22: H } = new window.DOMMatrixReadOnly(C.transform), F = {
        id: e.id,
        position: e.position,
        x: (I.left - y.left) / H,
        y: (I.top - y.top) / H,
        type: i.value,
        nodeId: p,
        ...rr(_.value)
      };
      v.handleBounds[i.value] = [...v.handleBounds[i.value] ?? [], F];
    });
    function T(M) {
      const k = Gs(M);
      A.value && E.value && (k && M.button === 0 || !k) && N(M);
    }
    function L(M) {
      !p || !s.value && !E.value || A.value && V(M);
    }
    return t({
      handleClick: V,
      handlePointerDown: N,
      onClick: L,
      onPointerDown: T
    }), (M, k) => ($(), R("div", {
      ref_key: "handle",
      ref: _,
      "data-id": `${f(r)}-${f(p)}-${e.id}-${i.value}`,
      "data-handleid": e.id,
      "data-nodeid": f(p),
      "data-handlepos": M.position,
      class: Ie(["vue-flow__handle", [
        `vue-flow__handle-${M.position}`,
        `vue-flow__handle-${e.id}`,
        f(d),
        f(h),
        i.value,
        {
          connectable: A.value,
          connecting: S.value,
          connectablestart: E.value,
          connectableend: w.value,
          connectionindicator: A.value && (E.value && !b.value || w.value && b.value)
        }
      ]]),
      onMousedown: T,
      onTouchstartPassive: T,
      onClick: L
    }, [
      Ve(M.$slots, "default", { id: M.id })
    ], 42, Q_));
  }
}), lr = function({
  sourcePosition: e = ye.Bottom,
  targetPosition: t = ye.Top,
  label: n,
  connectable: i = !0,
  isValidTargetPos: o,
  isValidSourcePos: r,
  data: a
}) {
  const s = a.label ?? n;
  return [
    Pe(xt, { type: "target", position: t, connectable: i, isValidConnection: o }),
    typeof s != "string" && s ? Pe(s) : Pe(de, [s]),
    Pe(xt, { type: "source", position: e, connectable: i, isValidConnection: r })
  ];
};
lr.props = ["sourcePosition", "targetPosition", "label", "isValidTargetPos", "isValidSourcePos", "connectable", "data"];
lr.inheritAttrs = !1;
lr.compatConfig = { MODE: 3 };
const tk = lr, ur = function({
  targetPosition: e = ye.Top,
  label: t,
  connectable: n = !0,
  isValidTargetPos: i,
  data: o
}) {
  const r = o.label ?? t;
  return [
    Pe(xt, { type: "target", position: e, connectable: n, isValidConnection: i }),
    typeof r != "string" && r ? Pe(r) : Pe(de, [r])
  ];
};
ur.props = ["targetPosition", "label", "isValidTargetPos", "connectable", "data"];
ur.inheritAttrs = !1;
ur.compatConfig = { MODE: 3 };
const nk = ur, cr = function({
  sourcePosition: e = ye.Bottom,
  label: t,
  connectable: n = !0,
  isValidSourcePos: i,
  data: o
}) {
  const r = o.label ?? t;
  return [
    typeof r != "string" && r ? Pe(r) : Pe(de, [r]),
    Pe(xt, { type: "source", position: e, connectable: n, isValidConnection: i })
  ];
};
cr.props = ["sourcePosition", "label", "isValidSourcePos", "connectable", "data"];
cr.inheritAttrs = !1;
cr.compatConfig = { MODE: 3 };
const ok = cr, ik = ["transform"], rk = ["width", "height", "x", "y", "rx", "ry"], ak = ["y"], sk = {
  name: "EdgeText",
  compatConfig: { MODE: 3 }
}, lk = /* @__PURE__ */ we({
  ...sk,
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
    const t = j({ x: 0, y: 0, width: 0, height: 0 }), n = j(null), i = W(() => `translate(${e.x - t.value.width / 2} ${e.y - t.value.height / 2})`);
    Ue(o), ke([() => e.x, () => e.y, n, () => e.label], o);
    function o() {
      if (!n.value)
        return;
      const r = n.value.getBBox();
      (r.width !== t.value.width || r.height !== t.value.height) && (t.value = r);
    }
    return (r, a) => ($(), R("g", {
      transform: i.value,
      class: "vue-flow__edge-textwrapper"
    }, [
      r.labelShowBg ? ($(), R("rect", {
        key: 0,
        class: "vue-flow__edge-textbg",
        width: `${t.value.width + 2 * r.labelBgPadding[0]}px`,
        height: `${t.value.height + 2 * r.labelBgPadding[1]}px`,
        x: -r.labelBgPadding[0],
        y: -r.labelBgPadding[1],
        style: He(r.labelBgStyle),
        rx: r.labelBgBorderRadius,
        ry: r.labelBgBorderRadius
      }, null, 12, rk)) : Q("", !0),
      x("text", oo(r.$attrs, {
        ref_key: "el",
        ref: n,
        class: "vue-flow__edge-text",
        y: t.value.height / 2,
        dy: "0.3em",
        style: r.labelStyle
      }), [
        Ve(r.$slots, "default", {}, () => [
          typeof r.label != "string" ? ($(), se(Xt(r.label), { key: 0 })) : ($(), R(de, { key: 1 }, [
            he(Z(r.label), 1)
          ], 64))
        ])
      ], 16, ak)
    ], 8, ik));
  }
}), uk = ["id", "d", "marker-end", "marker-start"], ck = ["d", "stroke-width"], dk = {
  name: "BaseEdge",
  inheritAttrs: !1,
  compatConfig: { MODE: 3 }
}, Io = /* @__PURE__ */ we({
  ...dk,
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
    const n = j(null), i = j(null), o = j(null), r = Es();
    return t({
      pathEl: n,
      interactionEl: i,
      labelEl: o
    }), (a, s) => ($(), R(de, null, [
      x("path", oo(f(r), {
        id: a.id,
        ref_key: "pathEl",
        ref: n,
        d: a.path,
        class: "vue-flow__edge-path",
        "marker-end": a.markerEnd,
        "marker-start": a.markerStart
      }), null, 16, uk),
      a.interactionWidth ? ($(), R("path", {
        key: 0,
        ref_key: "interactionEl",
        ref: i,
        fill: "none",
        d: a.path,
        "stroke-width": a.interactionWidth,
        "stroke-opacity": 0,
        class: "vue-flow__edge-interaction"
      }, null, 8, ck)) : Q("", !0),
      a.label && a.labelX && a.labelY ? ($(), se(lk, {
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
function Gf({
  sourceX: e,
  sourceY: t,
  targetX: n,
  targetY: i
}) {
  const o = Math.abs(n - e) / 2, r = n < e ? n + o : n - o, a = Math.abs(i - t) / 2, s = i < t ? i + a : i - a;
  return [r, s, o, a];
}
function jf({
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
function Su({ pos: e, x1: t, y1: n, x2: i, y2: o, c: r }) {
  let a, s;
  switch (e) {
    case ye.Left:
      a = t - Xo(t - i, r), s = n;
      break;
    case ye.Right:
      a = t + Xo(i - t, r), s = n;
      break;
    case ye.Top:
      a = t, s = n - Xo(n - o, r);
      break;
    case ye.Bottom:
      a = t, s = n + Xo(o - n, r);
      break;
  }
  return [a, s];
}
function Xs(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: i = ye.Bottom,
    targetX: o,
    targetY: r,
    targetPosition: a = ye.Top,
    curvature: s = 0.25
  } = e, [l, c] = Su({
    pos: i,
    x1: t,
    y1: n,
    x2: o,
    y2: r,
    c: s
  }), [u, d] = Su({
    pos: a,
    x1: o,
    y1: r,
    x2: t,
    y2: n,
    c: s
  }), [h, p, v, g] = jf({
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
function Cu({ pos: e, x1: t, y1: n, x2: i, y2: o }) {
  let r, a;
  switch (e) {
    case ye.Left:
    case ye.Right:
      r = 0.5 * (t + i), a = n;
      break;
    case ye.Top:
    case ye.Bottom:
      r = t, a = 0.5 * (n + o);
      break;
  }
  return [r, a];
}
function Xf(e) {
  const {
    sourceX: t,
    sourceY: n,
    sourcePosition: i = ye.Bottom,
    targetX: o,
    targetY: r,
    targetPosition: a = ye.Top
  } = e, [s, l] = Cu({
    pos: i,
    x1: t,
    y1: n,
    x2: o,
    y2: r
  }), [c, u] = Cu({
    pos: a,
    x1: o,
    y1: r,
    x2: t,
    y2: n
  }), [d, h, p, v] = jf({
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
const Nu = {
  [ye.Left]: { x: -1, y: 0 },
  [ye.Right]: { x: 1, y: 0 },
  [ye.Top]: { x: 0, y: -1 },
  [ye.Bottom]: { x: 0, y: 1 }
};
function fk({
  source: e,
  sourcePosition: t = ye.Bottom,
  target: n
}) {
  return t === ye.Left || t === ye.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
}
function Iu(e, t) {
  return Math.sqrt((t.x - e.x) ** 2 + (t.y - e.y) ** 2);
}
function hk({
  source: e,
  sourcePosition: t = ye.Bottom,
  target: n,
  targetPosition: i = ye.Top,
  center: o,
  offset: r
}) {
  const a = Nu[t], s = Nu[i], l = { x: e.x + a.x * r, y: e.y + a.y * r }, c = { x: n.x + s.x * r, y: n.y + s.y * r }, u = fk({
    source: l,
    sourcePosition: t,
    target: c
  }), d = u.x !== 0 ? "x" : "y", h = u[d];
  let p, v, g;
  const m = { x: 0, y: 0 }, _ = { x: 0, y: 0 }, [E, w, b, S] = Gf({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (a[d] * s[d] === -1) {
    v = o.x ?? E, g = o.y ?? w;
    const V = [
      { x: v, y: l.y },
      { x: v, y: c.y }
    ], A = [
      { x: l.x, y: g },
      { x: c.x, y: g }
    ];
    a[d] === h ? p = d === "x" ? V : A : p = d === "x" ? A : V;
  } else {
    const V = [{ x: l.x, y: c.y }], A = [{ x: c.x, y: l.y }];
    if (d === "x" ? p = a.x === h ? A : V : p = a.y === h ? V : A, t === i) {
      const B = Math.abs(e[d] - n[d]);
      if (B <= r) {
        const y = Math.min(r - 1, r - B);
        a[d] === h ? m[d] = (l[d] > e[d] ? -1 : 1) * y : _[d] = (c[d] > n[d] ? -1 : 1) * y;
      }
    }
    if (t !== i) {
      const B = d === "x" ? "y" : "x", y = a[d] === s[B], I = l[B] > c[B], C = l[B] < c[B];
      (a[d] === 1 && (!y && I || y && C) || a[d] !== 1 && (!y && C || y && I)) && (p = d === "x" ? V : A);
    }
    const T = { x: l.x + m.x, y: l.y + m.y }, L = { x: c.x + _.x, y: c.y + _.y }, M = Math.max(Math.abs(T.x - p[0].x), Math.abs(L.x - p[0].x)), k = Math.max(Math.abs(T.y - p[0].y), Math.abs(L.y - p[0].y));
    M >= k ? (v = (T.x + L.x) / 2, g = p[0].y) : (v = p[0].x, g = (T.y + L.y) / 2);
  }
  return [[
    e,
    { x: l.x + m.x, y: l.y + m.y },
    ...p,
    { x: c.x + _.x, y: c.y + _.y },
    n
  ], v, g, b, S];
}
function pk(e, t, n, i) {
  const o = Math.min(Iu(e, t) / 2, Iu(t, n) / 2, i), { x: r, y: a } = t;
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
    sourcePosition: i = ye.Bottom,
    targetX: o,
    targetY: r,
    targetPosition: a = ye.Top,
    borderRadius: s = 5,
    centerX: l,
    centerY: c,
    offset: u = 20
  } = e, [d, h, p, v, g] = hk({
    source: { x: t, y: n },
    sourcePosition: i,
    target: { x: o, y: r },
    targetPosition: a,
    center: { x: l, y: c },
    offset: u
  });
  return [d.reduce((_, E, w) => {
    let b;
    return w > 0 && w < d.length - 1 ? b = pk(d[w - 1], E, d[w + 1], s) : b = `${w === 0 ? "M" : "L"}${E.x} ${E.y}`, _ += b, _;
  }, ""), h, p, v, g];
}
function vk(e) {
  const { sourceX: t, sourceY: n, targetX: i, targetY: o } = e, [r, a, s, l] = Gf({
    sourceX: t,
    sourceY: n,
    targetX: i,
    targetY: o
  });
  return [`M ${t},${n}L ${i},${o}`, r, a, s, l];
}
const mk = we({
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
      const [n, i, o] = vk(e);
      return Pe(Io, {
        path: n,
        labelX: i,
        labelY: o,
        ...t,
        ...e
      });
    };
  }
}), gk = mk, yk = we({
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
        sourcePosition: e.sourcePosition ?? ye.Bottom,
        targetPosition: e.targetPosition ?? ye.Top
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
}), Kf = yk, wk = we({
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
    return () => Pe(Kf, { ...e, ...t, borderRadius: 0 });
  }
}), bk = wk, _k = we({
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
        sourcePosition: e.sourcePosition ?? ye.Bottom,
        targetPosition: e.targetPosition ?? ye.Top
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
}), kk = _k, Ek = we({
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
      const [n, i, o] = Xf({
        ...e,
        sourcePosition: e.sourcePosition ?? ye.Bottom,
        targetPosition: e.targetPosition ?? ye.Top
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
}), xk = Ek, $k = {
  input: ok,
  default: tk,
  output: nk
}, Sk = {
  default: kk,
  straight: gk,
  step: bk,
  smoothstep: Kf,
  simplebezier: xk
};
function Ck(e, t, n) {
  const i = W(() => (g) => t.value.get(g)), o = W(() => (g) => n.value.get(g)), r = W(() => {
    const g = {
      ...Sk,
      ...e.edgeTypes
    }, m = Object.keys(g);
    for (const _ of e.edges)
      _.type && !m.includes(_.type) && (g[_.type] = _.type);
    return g;
  }), a = W(() => {
    const g = {
      ...$k,
      ...e.nodeTypes
    }, m = Object.keys(g);
    for (const _ of e.nodes)
      _.type && !m.includes(_.type) && (g[_.type] = _.type);
    return g;
  }), s = W(() => e.onlyRenderVisibleElements ? Of(
    e.nodes,
    {
      x: 0,
      y: 0,
      width: e.dimensions.width,
      height: e.dimensions.height
    },
    e.viewport,
    !0
  ) : e.nodes), l = W(() => {
    if (e.onlyRenderVisibleElements) {
      const g = [];
      for (const m of e.edges) {
        const _ = t.value.get(m.source), E = t.value.get(m.target);
        x_({
          sourcePos: _.computedPosition || { x: 0, y: 0 },
          targetPos: E.computedPosition || { x: 0, y: 0 },
          sourceWidth: _.dimensions.width,
          sourceHeight: _.dimensions.height,
          targetWidth: E.dimensions.width,
          targetHeight: E.dimensions.height,
          width: e.dimensions.width,
          height: e.dimensions.height,
          viewport: e.viewport
        }) && g.push(m);
      }
      return g;
    }
    return e.edges;
  }), c = W(() => [...s.value, ...l.value]), u = W(() => {
    const g = [];
    for (const m of e.nodes)
      m.selected && g.push(m);
    return g;
  }), d = W(() => {
    const g = [];
    for (const m of e.edges)
      m.selected && g.push(m);
    return g;
  }), h = W(() => [
    ...u.value,
    ...d.value
  ]), p = W(() => {
    const g = [];
    for (const m of e.nodes)
      m.dimensions.width && m.dimensions.height && m.handleBounds !== void 0 && g.push(m);
    return g;
  }), v = W(
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
    const i = Yf(), o = xs(i), r = {};
    for (const [h, p] of Object.entries(o.hooks)) {
      const v = `on${h.charAt(0).toUpperCase() + h.slice(1)}`;
      r[v] = p.on;
    }
    const a = {};
    for (const [h, p] of Object.entries(o.hooks))
      a[h] = p.trigger;
    const s = W(() => {
      const h = /* @__PURE__ */ new Map();
      for (const p of o.nodes)
        h.set(p.id, p);
      return h;
    }), l = W(() => {
      const h = /* @__PURE__ */ new Map();
      for (const p of o.edges)
        h.set(p.id, p);
      return h;
    }), c = Ck(o, s, l), u = J_(o, s, l);
    u.setState({ ...o, ...n });
    const d = {
      ...r,
      ...c,
      ...u,
      ...bw(o),
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
  const t = rn.getInstance(), n = vd(), i = typeof e == "object", o = i ? e : { id: e }, r = o.id, a = r ?? n?.vueFlowId;
  let s;
  if (n) {
    const l = Ht($u, null);
    typeof l < "u" && l !== null && (!a || l.id === a) && (s = l);
  }
  if (s || a && (s = t.get(a)), !s || a && s.id !== a) {
    const l = r ?? t.getId(), c = t.create(l, o);
    s = c, (n ?? md(!0)).run(() => {
      ke(
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
  if (n && (Zt($u, s), n.vueFlowId = s.id), i) {
    const l = Ln();
    l?.type.name !== "VueFlow" && s.emits.error(new je(Ye.USEVUEFLOW_OPTIONS));
  }
  return s;
}
function Nk(e) {
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
const Ik = {
  name: "UserSelection",
  compatConfig: { MODE: 3 }
}, Ak = /* @__PURE__ */ we({
  ...Ik,
  props: {
    userSelectionRect: {}
  },
  setup(e) {
    return (t, n) => ($(), R("div", {
      class: "vue-flow__selection vue-flow__container",
      style: He({
        width: `${t.userSelectionRect.width}px`,
        height: `${t.userSelectionRect.height}px`,
        transform: `translate(${t.userSelectionRect.x}px, ${t.userSelectionRect.y}px)`
      })
    }, null, 4));
  }
}), Tk = ["tabIndex"], Mk = {
  name: "NodesSelection",
  compatConfig: { MODE: 3 }
}, Ok = /* @__PURE__ */ we({
  ...Mk,
  setup(e) {
    const { emits: t, viewport: n, getSelectedNodes: i, noPanClassName: o, disableKeyboardA11y: r, userSelectionActive: a } = De(), s = Wf(), l = j(null), c = Ff({
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
    const u = W(() => Ws(i.value)), d = W(() => ({
      width: `${u.value.width}px`,
      height: `${u.value.height}px`,
      top: `${u.value.y}px`,
      left: `${u.value.x}px`
    }));
    function h(v) {
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
    return (v, g) => !f(a) && u.value.width && u.value.height ? ($(), R("div", {
      key: 0,
      class: Ie(["vue-flow__nodesselection vue-flow__container", f(o)]),
      style: He({ transform: `translate(${f(n).x}px,${f(n).y}px) scale(${f(n).zoom})` })
    }, [
      x("div", {
        ref_key: "el",
        ref: l,
        class: Ie([{ dragging: f(c) }, "vue-flow__nodesselection-rect"]),
        style: He(d.value),
        tabIndex: f(r) ? void 0 : -1,
        onContextmenu: h,
        onKeydown: p
      }, null, 46, Tk)
    ], 6)) : Q("", !0);
  }
});
function Rk(e, t) {
  return {
    x: e.clientX - t.left,
    y: e.clientY - t.top
  };
}
const Dk = {
  name: "Pane",
  compatConfig: { MODE: 3 }
}, Pk = /* @__PURE__ */ we({
  ...Dk,
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
      multiSelectionActive: _,
      edgeLookup: E,
      nodeLookup: w,
      connectionLookup: b,
      defaultEdgeOptions: S,
      connectionStartHandle: N,
      panOnDrag: V
    } = De(), A = nt(null), T = nt(/* @__PURE__ */ new Set()), L = nt(/* @__PURE__ */ new Set()), M = nt(null), k = Ne(() => l.value && (e.isSelecting || r.value)), B = Ne(() => N.value !== null);
    let y = !1, I = !1;
    const C = no(g, { actInsideInputWithModifier: !1 }), H = no(m);
    ke(C, (K) => {
      K && (h(d.value), p(u.value), c.value = !1);
    }), ke(H, (K) => {
      _.value = K;
    });
    function F(K, X) {
      return (oe) => {
        oe.target === X && K?.(oe);
      };
    }
    function q(K) {
      if (y || B.value) {
        y = !1;
        return;
      }
      o.paneClick(K), a(), c.value = !1;
    }
    function U(K) {
      var X;
      if (Array.isArray(V.value) && ((X = V.value) != null && X.includes(2))) {
        K.preventDefault();
        return;
      }
      o.paneContextMenu(K);
    }
    function ne(K) {
      o.paneScroll(K);
    }
    function ue(K) {
      var X, oe, le;
      if (M.value = ((X = t.value) == null ? void 0 : X.getBoundingClientRect()) ?? null, !l.value || !e.isSelecting || K.button !== 0 || K.target !== A.value || !M.value)
        return;
      (le = (oe = K.target) == null ? void 0 : oe.setPointerCapture) == null || le.call(oe, K.pointerId);
      const { x: fe, y: _e } = Rk(K, M.value);
      I = !0, y = !1, a(), s.value = {
        width: 0,
        height: 0,
        startX: fe,
        startY: _e,
        x: fe,
        y: _e
      }, o.selectionStart(K);
    }
    function G(K) {
      var X;
      if (!M.value || !s.value)
        return;
      y = !0;
      const { x: oe, y: le } = $t(K, M.value), { startX: fe = 0, startY: _e = 0 } = s.value, $e = {
        startX: fe,
        startY: _e,
        x: oe < fe ? oe : fe,
        y: le < _e ? le : _e,
        width: Math.abs(oe - fe),
        height: Math.abs(le - _e)
      }, me = T.value, ge = L.value;
      T.value = new Set(
        Of(n.value, $e, i.value, v.value === Us.Partial, !0).map(
          (O) => O.id
        )
      ), L.value = /* @__PURE__ */ new Set();
      const P = ((X = S.value) == null ? void 0 : X.selectable) ?? !0;
      for (const O of T.value) {
        const D = b.value.get(O);
        if (D)
          for (const { edgeId: Y } of D.values()) {
            const ee = E.value.get(Y);
            ee && (ee.selectable ?? P) && L.value.add(Y);
          }
      }
      if (!xu(me, T.value)) {
        const O = Gt(w.value, T.value, !0);
        o.nodesChange(O);
      }
      if (!xu(ge, L.value)) {
        const O = Gt(E.value, L.value);
        o.edgesChange(O);
      }
      s.value = $e, r.value = !0, c.value = !1;
    }
    function J(K) {
      var X;
      K.button !== 0 || !I || ((X = K.target) == null || X.releasePointerCapture(K.pointerId), !r.value && s.value && K.target === A.value && q(K), r.value = !1, s.value = null, c.value = T.value.size > 0, o.selectionEnd(K), e.selectionKeyPressed && (y = !1), I = !1);
    }
    return (K, X) => ($(), R("div", {
      ref_key: "container",
      ref: A,
      class: Ie(["vue-flow__pane vue-flow__container", { selection: K.isSelecting }]),
      onClick: X[0] || (X[0] = (oe) => k.value ? void 0 : F(q, A.value)(oe)),
      onContextmenu: X[1] || (X[1] = (oe) => F(U, A.value)(oe)),
      onWheelPassive: X[2] || (X[2] = (oe) => F(ne, A.value)(oe)),
      onPointerenter: X[3] || (X[3] = (oe) => k.value ? void 0 : f(o).paneMouseEnter(oe)),
      onPointerdown: X[4] || (X[4] = (oe) => k.value ? ue(oe) : f(o).paneMouseMove(oe)),
      onPointermove: X[5] || (X[5] = (oe) => k.value ? G(oe) : f(o).paneMouseMove(oe)),
      onPointerup: X[6] || (X[6] = (oe) => k.value ? J(oe) : void 0),
      onPointerleave: X[7] || (X[7] = (oe) => f(o).paneMouseLeave(oe))
    }, [
      Ve(K.$slots, "default"),
      f(r) && f(s) ? ($(), se(Ak, {
        key: 0,
        "user-selection-rect": f(s)
      }, null, 8, ["user-selection-rect"])) : Q("", !0),
      f(c) && f(d).length ? ($(), se(Ok, { key: 1 })) : Q("", !0)
    ], 34));
  }
}), Lk = {
  name: "Transform",
  compatConfig: { MODE: 3 }
}, zk = /* @__PURE__ */ we({
  ...Lk,
  setup(e) {
    const { viewport: t, fitViewOnInit: n, fitViewOnInitDone: i } = De(), o = W(() => n.value ? !i.value : !1), r = W(() => `translate(${t.value.x}px,${t.value.y}px) scale(${t.value.zoom})`);
    return (a, s) => ($(), R("div", {
      class: "vue-flow__transformationpane vue-flow__container",
      style: He({ transform: r.value, opacity: o.value ? 0 : void 0 })
    }, [
      Ve(a.$slots, "default")
    ], 4));
  }
}), Vk = {
  name: "Viewport",
  compatConfig: { MODE: 3 }
}, Bk = /* @__PURE__ */ we({
  ...Vk,
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
      noPanClassName: _,
      emits: E,
      connectionStartHandle: w,
      userSelectionActive: b,
      paneDragging: S,
      d3Zoom: N,
      d3Selection: V,
      d3ZoomHandler: A,
      viewport: T,
      viewportRef: L,
      paneClickDistance: M
    } = De();
    Nk(L);
    const k = nt(!1), B = nt(!1);
    let y = null, I = !1, C = 0, H = {
      x: 0,
      y: 0,
      zoom: 0
    };
    const F = no(s), q = no(a), U = no(r), ne = Ne(
      () => (!q.value || q.value && a.value === !0) && (F.value || d.value)
    ), ue = Ne(() => F.value || l.value), G = Ne(() => a.value === !0 && ne.value !== !0), J = Ne(
      () => q.value && a.value !== !0 || b.value || G.value
    ), K = Ne(() => w.value !== null);
    Ue(() => {
      if (!L.value) {
        No("Viewport element is missing");
        return;
      }
      const _e = L.value, $e = _e.getBoundingClientRect(), me = i_().clickDistance(M.value).scaleExtent([t.value, n.value]).translateExtent(o.value), ge = ht(_e).call(me), P = ge.on("wheel.zoom"), O = Mn.translate(i.value.x ?? 0, i.value.y ?? 0).scale(Bt(i.value.zoom ?? 1, t.value, n.value)), D = [
        [0, 0],
        [$e.width, $e.height]
      ], Y = me.constrain()(O, D, o.value);
      me.transform(ge, Y), me.wheelDelta(Qa), N.value = me, V.value = ge, A.value = P, T.value = { x: Y.x, y: Y.y, zoom: Y.k }, me.on("start", (ee) => {
        var re;
        if (!ee.sourceEvent)
          return null;
        C = ee.sourceEvent.button, k.value = !0;
        const te = le(ee.transform);
        ((re = ee.sourceEvent) == null ? void 0 : re.type) === "mousedown" && (S.value = !0), H = te, E.viewportChangeStart(te), E.moveStart({ event: ee, flowTransform: te });
      }), me.on("end", (ee) => {
        if (!ee.sourceEvent)
          return null;
        if (k.value = !1, S.value = !1, X(ne.value, C ?? 0) && !I && E.paneContextMenu(ee.sourceEvent), I = !1, oe(H, ee.transform)) {
          const re = le(ee.transform);
          H = re, E.viewportChangeEnd(re), E.moveEnd({ event: ee, flowTransform: re });
        }
      }), me.filter((ee) => {
        var re;
        const te = U.value || v.value, ce = p.value && ee.ctrlKey, be = ee.button, Ee = ee.type === "wheel";
        if (be === 1 && ee.type === "mousedown" && (fe(ee, "vue-flow__node") || fe(ee, "vue-flow__edge")))
          return !0;
        if (!ne.value && !te && !ue.value && !h.value && !p.value || b.value || K.value && !Ee || !h.value && ee.type === "dblclick" || fe(ee, m.value) && Ee || fe(ee, _.value) && (!Ee || ue.value && Ee && !U.value) || !p.value && ee.ctrlKey && Ee || !te && !ue.value && !ce && Ee)
          return !1;
        if (!p && ee.type === "touchstart" && ((re = ee.touches) == null ? void 0 : re.length) > 1)
          return ee.preventDefault(), !1;
        if (!ne.value && (ee.type === "mousedown" || ee.type === "touchstart") || G.value && Array.isArray(d.value) && d.value.includes(0) && be === 0 || Array.isArray(d.value) && !d.value.includes(be) && (ee.type === "mousedown" || ee.type === "touchstart"))
          return !1;
        const Se = Array.isArray(d.value) && d.value.includes(be) || a.value === !0 && Array.isArray(d.value) && !d.value.includes(0) || !be || be <= 1;
        return (!ee.ctrlKey || F.value || Ee) && Se;
      }), ke(
        [b, ne],
        () => {
          b.value && !k.value ? me.on("zoom", null) : b.value || me.on("zoom", (ee) => {
            T.value = { x: ee.transform.x, y: ee.transform.y, zoom: ee.transform.k };
            const re = le(ee.transform);
            I = X(ne.value, C ?? 0), E.viewportChange(re), E.move({ event: ee, flowTransform: re });
          });
        },
        { immediate: !0 }
      ), ke(
        [b, ue, c, U, p, g, m],
        () => {
          ue.value && !U.value && !b.value ? ge.on(
            "wheel.zoom",
            (ee) => {
              if (fe(ee, m.value))
                return !1;
              const re = U.value || v.value, te = p.value && ee.ctrlKey;
              if (!(!g.value || ue.value || re || te))
                return !1;
              ee.preventDefault(), ee.stopImmediatePropagation();
              const be = ge.property("__zoom").k || 1, Ee = go();
              if (!F.value && ee.ctrlKey && p.value && Ee) {
                const mr = kt(ee), gr = Qa(ee), Ro = be * 2 ** gr;
                me.scaleTo(ge, Ro, mr, ee);
                return;
              }
              const Se = ee.deltaMode === 1 ? 20 : 1;
              let Me = c.value === to.Vertical ? 0 : ee.deltaX * Se, ft = c.value === to.Horizontal ? 0 : ee.deltaY * Se;
              !Ee && ee.shiftKey && c.value !== to.Vertical && !Me && ft && (Me = ft, ft = 0), me.translateBy(
                ge,
                -(Me / be) * u.value,
                -(ft / be) * u.value
              );
              const lt = le(ge.property("__zoom"));
              y && clearTimeout(y), B.value ? (E.move({ event: ee, flowTransform: lt }), E.viewportChange(lt), y = setTimeout(() => {
                E.moveEnd({ event: ee, flowTransform: lt }), E.viewportChangeEnd(lt), B.value = !1;
              }, 150)) : (B.value = !0, E.moveStart({ event: ee, flowTransform: lt }), E.viewportChangeStart(lt));
            },
            { passive: !1 }
          ) : typeof P < "u" && ge.on(
            "wheel.zoom",
            function(ee, re) {
              const te = !g.value && ee.type === "wheel" && !ee.ctrlKey, ce = U.value || v.value, be = p.value && ee.ctrlKey;
              if (!ce && !l.value && !be && ee.type === "wheel" || te || fe(ee, m.value))
                return null;
              ee.preventDefault(), P.call(this, ee, re);
            },
            { passive: !1 }
          );
        },
        { immediate: !0 }
      );
    });
    function X(_e, $e) {
      return $e === 2 && Array.isArray(_e) && _e.includes(2);
    }
    function oe(_e, $e) {
      return _e.x !== $e.x && !Number.isNaN($e.x) || _e.y !== $e.y && !Number.isNaN($e.y) || _e.zoom !== $e.k && !Number.isNaN($e.k);
    }
    function le(_e) {
      return {
        x: _e.x,
        y: _e.y,
        zoom: _e.k
      };
    }
    function fe(_e, $e) {
      return _e.target.closest(`.${$e}`);
    }
    return (_e, $e) => ($(), R("div", {
      ref_key: "viewportRef",
      ref: L,
      class: "vue-flow__viewport vue-flow__container"
    }, [
      z(Pk, {
        "is-selecting": J.value,
        "selection-key-pressed": f(q),
        class: Ie({
          connecting: K.value,
          dragging: f(S),
          draggable: f(d) === !0 || Array.isArray(f(d)) && f(d).includes(0)
        })
      }, {
        default: ie(() => [
          z(zk, null, {
            default: ie(() => [
              Ve(_e.$slots, "default")
            ]),
            _: 3
          })
        ]),
        _: 3
      }, 8, ["is-selecting", "selection-key-pressed", "class"])
    ], 512));
  }
}), Fk = ["id"], Hk = ["id"], qk = ["id"], Uk = {
  name: "A11yDescriptions",
  compatConfig: { MODE: 3 }
}, Wk = /* @__PURE__ */ we({
  ...Uk,
  setup(e) {
    const { id: t, disableKeyboardA11y: n, ariaLiveMessage: i } = De();
    return (o, r) => ($(), R(de, null, [
      x("div", {
        id: `${f(xf)}-${f(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select a node. " + Z(f(n) ? "" : "You can then use the arrow keys to move the node around.") + " You can then use the arrow keys to move the node around, press delete to remove it and press escape to cancel. ", 9, Fk),
      x("div", {
        id: `${f($f)}-${f(t)}`,
        style: { display: "none" }
      }, " Press enter or space to select an edge. You can then press delete to remove it or press escape to cancel. ", 8, Hk),
      f(n) ? Q("", !0) : ($(), R("div", {
        key: 0,
        id: `${f(c_)}-${f(t)}`,
        "aria-live": "assertive",
        "aria-atomic": "true",
        style: { position: "absolute", width: "1px", height: "1px", margin: "-1px", border: "0", padding: "0", overflow: "hidden", clip: "rect(0px, 0px, 0px, 0px)", "clip-path": "inset(100%)" }
      }, Z(f(i)), 9, qk))
    ], 64));
  }
});
function Yk() {
  const e = De();
  ke(
    () => e.viewportHelper.value.viewportInitialized,
    (t) => {
      t && setTimeout(() => {
        e.emits.init(e), e.emits.paneReady(e);
      }, 1);
    }
  );
}
function Gk(e, t, n) {
  return n === ye.Left ? e - t : n === ye.Right ? e + t : e;
}
function jk(e, t, n) {
  return n === ye.Top ? e - t : n === ye.Bottom ? e + t : e;
}
const Ks = function({
  radius: e = 10,
  centerX: t = 0,
  centerY: n = 0,
  position: i = ye.Top,
  type: o
}) {
  return Pe("circle", {
    class: `vue-flow__edgeupdater vue-flow__edgeupdater-${o}`,
    cx: Gk(t, e, i),
    cy: jk(n, e, i),
    r: e,
    stroke: "transparent",
    fill: "transparent"
  });
};
Ks.props = ["radius", "centerX", "centerY", "position", "type"];
Ks.compatConfig = { MODE: 3 };
const Au = Ks, Xk = we({
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
      edgesFocusable: _,
      hooks: E
    } = De(), w = W(() => u(e.id)), { emit: b, on: S } = B_(w.value, r), N = Ht(sr), V = Ln(), A = j(!1), T = j(!1), L = j(""), M = j(null), k = j("source"), B = j(null), y = Ne(
      () => typeof w.value.selectable > "u" ? g.value : w.value.selectable
    ), I = Ne(() => typeof w.value.updatable > "u" ? m.value : w.value.updatable), C = Ne(() => typeof w.value.focusable > "u" ? _.value : w.value.focusable);
    Zt(L_, e.id), Zt(z_, B);
    const H = W(() => w.value.class instanceof Function ? w.value.class(w.value) : w.value.class), F = W(() => w.value.style instanceof Function ? w.value.style(w.value) : w.value.style), q = W(() => {
      const O = w.value.type || "default", D = N?.[`edge-${O}`];
      if (D)
        return D;
      let Y = w.value.template ?? l.value[O];
      if (typeof Y == "string" && V) {
        const ee = Object.keys(V.appContext.components);
        ee && ee.includes(O) && (Y = yd(O, !1));
      }
      return Y && typeof Y != "string" ? Y : (r.error(new je(Ye.EDGE_TYPE_MISSING, Y)), !1);
    }), { handlePointerDown: U } = qf({
      nodeId: L,
      handleId: M,
      type: k,
      isValidConnection: h,
      edgeUpdaterType: k,
      onEdgeUpdate: G,
      onEdgeUpdateEnd: J
    });
    return () => {
      const O = d(w.value.source), D = d(w.value.target), Y = "pathOptions" in w.value ? w.value.pathOptions : {};
      if (!O && !D)
        return r.error(new je(Ye.EDGE_SOURCE_TARGET_MISSING, w.value.id, w.value.source, w.value.target)), null;
      if (!O)
        return r.error(new je(Ye.EDGE_SOURCE_MISSING, w.value.id, w.value.source)), null;
      if (!D)
        return r.error(new je(Ye.EDGE_TARGET_MISSING, w.value.id, w.value.target)), null;
      if (!w.value || w.value.hidden || O.hidden || D.hidden)
        return null;
      let ee;
      i.value === en.Strict ? ee = O.handleBounds.source : ee = [...O.handleBounds.source || [], ...O.handleBounds.target || []];
      const re = yu(ee, w.value.sourceHandle);
      let te;
      i.value === en.Strict ? te = D.handleBounds.target : te = [...D.handleBounds.target || [], ...D.handleBounds.source || []];
      const ce = yu(te, w.value.targetHandle), be = re?.position || ye.Bottom, Ee = ce?.position || ye.Top, { x: Se, y: Me } = On(O, re, be), { x: ft, y: lt } = On(D, ce, Ee);
      return w.value.sourceX = Se, w.value.sourceY = Me, w.value.targetX = ft, w.value.targetY = lt, Pe(
        "g",
        {
          ref: B,
          key: e.id,
          "data-id": e.id,
          class: [
            "vue-flow__edge",
            `vue-flow__edge-${q.value === !1 ? "default" : w.value.type || "default"}`,
            s.value,
            H.value,
            {
              updating: A.value,
              selected: w.value.selected,
              animated: w.value.animated,
              inactive: !y.value && !E.value.edgeClick.hasListeners()
            }
          ],
          tabIndex: C.value ? 0 : void 0,
          "aria-label": w.value.ariaLabel === null ? void 0 : w.value.ariaLabel ?? `Edge from ${w.value.source} to ${w.value.target}`,
          "aria-describedby": C.value ? `${$f}-${t}` : void 0,
          "aria-roledescription": "edge",
          role: C.value ? "group" : "img",
          ...w.value.domAttributes,
          onClick: X,
          onContextmenu: oe,
          onDblclick: le,
          onMouseenter: fe,
          onMousemove: _e,
          onMouseleave: $e,
          onKeyDown: C.value ? P : void 0
        },
        [
          T.value ? null : Pe(q.value === !1 ? l.value.default : q.value, {
            id: e.id,
            sourceNode: O,
            targetNode: D,
            source: w.value.source,
            target: w.value.target,
            type: w.value.type,
            updatable: I.value,
            selected: w.value.selected,
            animated: w.value.animated,
            label: w.value.label,
            labelStyle: w.value.labelStyle,
            labelShowBg: w.value.labelShowBg,
            labelBgStyle: w.value.labelBgStyle,
            labelBgPadding: w.value.labelBgPadding,
            labelBgBorderRadius: w.value.labelBgBorderRadius,
            data: w.value.data,
            events: { ...w.value.events, ...S },
            style: F.value,
            markerStart: `url('#${mo(w.value.markerStart, t)}')`,
            markerEnd: `url('#${mo(w.value.markerEnd, t)}')`,
            sourcePosition: be,
            targetPosition: Ee,
            sourceX: Se,
            sourceY: Me,
            targetX: ft,
            targetY: lt,
            sourceHandleId: w.value.sourceHandle,
            targetHandleId: w.value.targetHandle,
            interactionWidth: w.value.interactionWidth,
            ...Y
          }),
          [
            I.value === "source" || I.value === !0 ? [
              Pe(
                "g",
                {
                  onMousedown: me,
                  onMouseenter: ne,
                  onMouseout: ue
                },
                Pe(Au, {
                  position: be,
                  centerX: Se,
                  centerY: Me,
                  radius: o.value,
                  type: "source",
                  "data-type": "source"
                })
              )
            ] : null,
            I.value === "target" || I.value === !0 ? [
              Pe(
                "g",
                {
                  onMousedown: ge,
                  onMouseenter: ne,
                  onMouseout: ue
                },
                Pe(Au, {
                  position: Ee,
                  centerX: ft,
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
    function ne() {
      A.value = !0;
    }
    function ue() {
      A.value = !1;
    }
    function G(O, D) {
      b.update({ event: O, edge: w.value, connection: D });
    }
    function J(O) {
      b.updateEnd({ event: O, edge: w.value }), T.value = !1;
    }
    function K(O, D) {
      O.button === 0 && (T.value = !0, L.value = D ? w.value.target : w.value.source, M.value = (D ? w.value.targetHandle : w.value.sourceHandle) ?? null, k.value = D ? "target" : "source", b.updateStart({ event: O, edge: w.value }), U(O));
    }
    function X(O) {
      var D;
      const Y = { event: O, edge: w.value };
      y.value && (a.value = !1, w.value.selected && p.value ? (c([w.value]), (D = B.value) == null || D.blur()) : n([w.value])), b.click(Y);
    }
    function oe(O) {
      b.contextMenu({ event: O, edge: w.value });
    }
    function le(O) {
      b.doubleClick({ event: O, edge: w.value });
    }
    function fe(O) {
      b.mouseEnter({ event: O, edge: w.value });
    }
    function _e(O) {
      b.mouseMove({ event: O, edge: w.value });
    }
    function $e(O) {
      b.mouseLeave({ event: O, edge: w.value });
    }
    function me(O) {
      K(O, !0);
    }
    function ge(O) {
      K(O, !1);
    }
    function P(O) {
      var D;
      !v.value && Sf.includes(O.key) && y.value && (O.key === "Escape" ? ((D = B.value) == null || D.blur(), c([u(e.id)])) : n([u(e.id)]));
    }
  }
}), Kk = Xk, Zk = we({
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
    } = De(), h = (e = Ht(sr)) == null ? void 0 : e["connection-line"], p = W(() => {
      var E;
      return d((E = i.value) == null ? void 0 : E.nodeId);
    }), v = W(() => {
      var E;
      return d((E = o.value) == null ? void 0 : E.nodeId) ?? null;
    }), g = W(() => ({
      x: (r.value.x - u.value.x) / u.value.zoom,
      y: (r.value.y - u.value.y) / u.value.zoom
    })), m = W(
      () => l.value.markerStart ? `url(#${mo(l.value.markerStart, t)})` : ""
    ), _ = W(
      () => l.value.markerEnd ? `url(#${mo(l.value.markerEnd, t)})` : ""
    );
    return () => {
      var E, w, b;
      if (!p.value || !i.value)
        return null;
      const S = i.value.id, N = i.value.type, V = p.value.handleBounds;
      let A = V?.[N] ?? [];
      if (n.value === en.Loose) {
        const F = V?.[N === "source" ? "target" : "source"] ?? [];
        A = [...A, ...F];
      }
      if (!A)
        return null;
      const T = (S ? A.find((F) => F.id === S) : A[0]) ?? null, L = T?.position ?? ye.Top, { x: M, y: k } = On(p.value, T, L);
      let B = null;
      v.value && (n.value === en.Strict ? B = ((E = v.value.handleBounds[N === "source" ? "target" : "source"]) == null ? void 0 : E.find(
        (F) => {
          var q;
          return F.id === ((q = o.value) == null ? void 0 : q.id);
        }
      )) || null : B = ((w = [...v.value.handleBounds.source ?? [], ...v.value.handleBounds.target ?? []]) == null ? void 0 : w.find(
        (F) => {
          var q;
          return F.id === ((q = o.value) == null ? void 0 : q.id);
        }
      )) || null);
      const y = ((b = o.value) == null ? void 0 : b.position) ?? (L ? es[L] : null);
      if (!L || !y)
        return null;
      const I = a.value ?? l.value.type ?? nn.Bezier;
      let C = "";
      const H = {
        sourceX: M,
        sourceY: k,
        sourcePosition: L,
        targetX: g.value.x,
        targetY: g.value.y,
        targetPosition: y
      };
      return I === nn.Bezier ? [C] = Xs(H) : I === nn.Step ? [C] = ns({
        ...H,
        borderRadius: 0
      }) : I === nn.SmoothStep ? [C] = ns(H) : I === nn.SimpleBezier ? [C] = Xf(H) : C = `M${M},${k} ${g.value.x},${g.value.y}`, Pe(
        "svg",
        { class: "vue-flow__edges vue-flow__connectionline vue-flow__container" },
        Pe(
          "g",
          { class: "vue-flow__connection" },
          h ? Pe(h, {
            sourceX: M,
            sourceY: k,
            sourcePosition: L,
            targetX: g.value.x,
            targetY: g.value.y,
            targetPosition: y,
            sourceNode: p.value,
            sourceHandle: T,
            targetNode: v.value,
            targetHandle: B,
            markerEnd: _.value,
            markerStart: m.value,
            connectionStatus: c.value
          }) : Pe("path", {
            d: C,
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
}), Jk = Zk, Qk = ["id", "markerWidth", "markerHeight", "markerUnits", "orient"], eE = {
  name: "MarkerType",
  compatConfig: { MODE: 3 }
}, tE = /* @__PURE__ */ we({
  ...eE,
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
    return (t, n) => ($(), R("marker", {
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
      t.type === f(Mi).ArrowClosed ? ($(), R("polyline", {
        key: 0,
        style: He({
          stroke: t.color,
          fill: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        points: "-5,-4 0,0 -5,4 -5,-4"
      }, null, 4)) : Q("", !0),
      t.type === f(Mi).Arrow ? ($(), R("polyline", {
        key: 1,
        style: He({
          stroke: t.color,
          strokeWidth: t.strokeWidth
        }),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        fill: "none",
        points: "-5,-4 0,0 -5,4"
      }, null, 4)) : Q("", !0)
    ], 8, Qk));
  }
}), nE = {
  class: "vue-flow__marker vue-flow__container",
  "aria-hidden": "true"
}, oE = {
  name: "MarkerDefinitions",
  compatConfig: { MODE: 3 }
}, iE = /* @__PURE__ */ we({
  ...oE,
  setup(e) {
    const { id: t, edges: n, connectionLineOptions: i, defaultMarkerColor: o } = De(), r = W(() => {
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
    return (a, s) => ($(), R("svg", nE, [
      x("defs", null, [
        ($(!0), R(de, null, Oe(r.value, (l) => ($(), se(tE, {
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
}), rE = {
  name: "Edges",
  compatConfig: { MODE: 3 }
}, aE = /* @__PURE__ */ we({
  ...rE,
  setup(e) {
    const { findNode: t, getEdges: n, elevateEdgesOnSelect: i } = De();
    return (o, r) => ($(), R(de, null, [
      z(iE),
      ($(!0), R(de, null, Oe(f(n), (a) => ($(), R("svg", {
        key: a.id,
        class: "vue-flow__edges vue-flow__container",
        style: He({ zIndex: f($_)(a, f(t), f(i)) })
      }, [
        z(f(Kk), {
          id: a.id
        }, null, 8, ["id"])
      ], 4))), 128)),
      z(f(Jk))
    ], 64));
  }
}), sE = we({
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
      snapGrid: _,
      nodeDragThreshold: E,
      nodesDraggable: w,
      elementsSelectable: b,
      nodesConnectable: S,
      nodesFocusable: N,
      hooks: V
    } = De(), A = j(null);
    Zt(Bf, A), Zt(js, e.id);
    const T = Ht(sr), L = Ln(), M = Wf(), { node: k, parentNode: B } = Uf(e.id), { emit: y, on: I } = q_(k, a), C = Ne(() => typeof k.draggable > "u" ? w.value : k.draggable), H = Ne(() => typeof k.selectable > "u" ? b.value : k.selectable), F = Ne(() => typeof k.connectable > "u" ? S.value : k.connectable), q = Ne(() => typeof k.focusable > "u" ? N.value : k.focusable), U = W(
      () => H.value || C.value || V.value.nodeClick.hasListeners() || V.value.nodeDoubleClick.hasListeners() || V.value.nodeMouseEnter.hasListeners() || V.value.nodeMouseMove.hasListeners() || V.value.nodeMouseLeave.hasListeners()
    ), ne = Ne(() => !!k.dimensions.width && !!k.dimensions.height), ue = W(() => {
      const D = k.type || "default", Y = T?.[`node-${D}`];
      if (Y)
        return Y;
      let ee = k.template || d.value[D];
      if (typeof ee == "string" && L) {
        const re = Object.keys(L.appContext.components);
        re && re.includes(D) && (ee = yd(D, !1));
      }
      return ee && typeof ee != "string" ? ee : (a.error(new je(Ye.NODE_TYPE_MISSING, ee)), !1);
    }), G = Ff({
      id: e.id,
      el: A,
      disabled: () => !C.value,
      selectable: H,
      dragHandle: () => k.dragHandle,
      onStart(D) {
        y.dragStart(D);
      },
      onDrag(D) {
        y.drag(D);
      },
      onStop(D) {
        y.dragStop(D);
      },
      onClick(D) {
        P(D);
      }
    }), J = W(() => k.class instanceof Function ? k.class(k) : k.class), K = W(() => {
      const D = (k.style instanceof Function ? k.style(k) : k.style) || {}, Y = k.width instanceof Function ? k.width(k) : k.width, ee = k.height instanceof Function ? k.height(k) : k.height;
      return !D.width && Y && (D.width = typeof Y == "string" ? Y : `${Y}px`), !D.height && ee && (D.height = typeof ee == "string" ? ee : `${ee}px`), D;
    }), X = Ne(() => Number(k.zIndex ?? K.value.zIndex ?? 0));
    return u((D) => {
      (D.includes(e.id) || !D.length) && le();
    }), Ue(() => {
      ke(
        () => k.hidden,
        (D = !1, Y, ee) => {
          !D && A.value && (e.resizeObserver.observe(A.value), ee(() => {
            A.value && e.resizeObserver.unobserve(A.value);
          }));
        },
        { immediate: !0, flush: "post" }
      );
    }), ke([() => k.type, () => k.sourcePosition, () => k.targetPosition], () => {
      ze(() => {
        c([{ id: e.id, nodeElement: A.value, forceUpdate: !0 }]);
      });
    }), ke(
      [
        () => k.position.x,
        () => k.position.y,
        () => {
          var D;
          return (D = B.value) == null ? void 0 : D.computedPosition.x;
        },
        () => {
          var D;
          return (D = B.value) == null ? void 0 : D.computedPosition.y;
        },
        () => {
          var D;
          return (D = B.value) == null ? void 0 : D.computedPosition.z;
        },
        X,
        () => k.selected,
        () => k.dimensions.height,
        () => k.dimensions.width,
        () => {
          var D;
          return (D = B.value) == null ? void 0 : D.dimensions.height;
        },
        () => {
          var D;
          return (D = B.value) == null ? void 0 : D.dimensions.width;
        }
      ],
      ([D, Y, ee, re, te, ce]) => {
        const be = {
          x: D,
          y: Y,
          z: ce + (p.value && k.selected ? 1e3 : 0)
        };
        typeof ee < "u" && typeof re < "u" ? k.computedPosition = w_({ x: ee, y: re, z: te }, be) : k.computedPosition = be;
      },
      { flush: "post", immediate: !0 }
    ), ke([() => k.extent, h], ([D, Y], [ee, re]) => {
      (D !== ee || Y !== re) && oe();
    }), k.extent === "parent" || typeof k.extent == "object" && "range" in k.extent && k.extent.range === "parent" ? qa(() => ne).toBe(!0).then(oe) : oe(), () => k.hidden ? null : Pe(
      "div",
      {
        ref: A,
        "data-id": k.id,
        class: [
          "vue-flow__node",
          `vue-flow__node-${ue.value === !1 ? "default" : k.type || "default"}`,
          {
            [n.value]: C.value,
            dragging: G?.value,
            draggable: C.value,
            selected: k.selected,
            selectable: H.value,
            parent: k.isParent
          },
          J.value
        ],
        style: {
          visibility: ne.value ? "visible" : "hidden",
          zIndex: k.computedPosition.z ?? X.value,
          transform: `translate(${k.computedPosition.x}px,${k.computedPosition.y}px)`,
          pointerEvents: U.value ? "all" : "none",
          ...K.value
        },
        tabIndex: q.value ? 0 : void 0,
        role: q.value ? "group" : void 0,
        "aria-describedby": v.value ? void 0 : `${xf}-${t}`,
        "aria-label": k.ariaLabel,
        "aria-roledescription": "node",
        ...k.domAttributes,
        onMouseenter: fe,
        onMousemove: _e,
        onMouseleave: $e,
        onContextmenu: me,
        onClick: P,
        onDblclick: ge,
        onKeydown: O
      },
      [
        Pe(ue.value === !1 ? d.value.default : ue.value, {
          id: k.id,
          type: k.type,
          data: k.data,
          events: { ...k.events, ...I },
          selected: k.selected,
          resizing: k.resizing,
          dragging: G.value,
          connectable: F.value,
          position: k.computedPosition,
          dimensions: k.dimensions,
          isValidTargetPos: k.isValidTargetPos,
          isValidSourcePos: k.isValidSourcePos,
          parent: k.parentNode,
          parentNodeId: k.parentNode,
          zIndex: k.computedPosition.z ?? X.value,
          targetPosition: k.targetPosition,
          sourcePosition: k.sourcePosition,
          label: k.label,
          dragHandle: k.dragHandle,
          onUpdateNodeInternals: le
        })
      ]
    );
    function oe() {
      const D = k.computedPosition, { computedPosition: Y, position: ee } = Ys(
        k,
        m.value ? ar(D, _.value) : D,
        a.error,
        h.value,
        B.value
      );
      (k.computedPosition.x !== Y.x || k.computedPosition.y !== Y.y) && (k.computedPosition = { ...k.computedPosition, ...Y }), (k.position.x !== ee.x || k.position.y !== ee.y) && (k.position = ee);
    }
    function le() {
      A.value && c([{ id: e.id, nodeElement: A.value, forceUpdate: !0 }]);
    }
    function fe(D) {
      G?.value || y.mouseEnter({ event: D, node: k });
    }
    function _e(D) {
      G?.value || y.mouseMove({ event: D, node: k });
    }
    function $e(D) {
      G?.value || y.mouseLeave({ event: D, node: k });
    }
    function me(D) {
      return y.contextMenu({ event: D, node: k });
    }
    function ge(D) {
      return y.doubleClick({ event: D, node: k });
    }
    function P(D) {
      H.value && (!i.value || !C.value || E.value > 0) && ts(
        k,
        r.value,
        l,
        s,
        o,
        !1,
        A.value
      ), y.click({ event: D, node: k });
    }
    function O(D) {
      if (!(Ja(D) || v.value))
        if (Sf.includes(D.key) && H.value) {
          const Y = D.key === "Escape";
          ts(
            k,
            r.value,
            l,
            s,
            o,
            Y,
            A.value
          );
        } else C.value && k.selected && Sn[D.key] && (D.preventDefault(), g.value = `Moved selected node ${D.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~k.position.x}, y: ${~~k.position.y}`, M(
          {
            x: Sn[D.key].x,
            y: Sn[D.key].y
          },
          D.shiftKey
        ));
    }
  }
}), lE = sE, uE = {
  height: "0",
  width: "0"
}, cE = {
  name: "EdgeLabelRenderer",
  compatConfig: { MODE: 3 }
}, dE = /* @__PURE__ */ we({
  ...cE,
  setup(e) {
    const { viewportRef: t } = De(), n = Ne(() => {
      var i;
      return (i = t.value) == null ? void 0 : i.getElementsByClassName("vue-flow__edge-labels")[0];
    });
    return (i, o) => ($(), R("svg", null, [
      ($(), R("foreignObject", uE, [
        ($(), se(Lm, {
          to: n.value,
          disabled: !n.value
        }, [
          Ve(i.$slots, "default")
        ], 8, ["to", "disabled"]))
      ]))
    ]));
  }
});
function fE(e = { includeHiddenNodes: !1 }) {
  const { nodes: t } = De();
  return W(() => {
    if (t.value.length === 0)
      return !1;
    for (const n of t.value)
      if ((e.includeHiddenNodes || !n.hidden) && (n?.handleBounds === void 0 || n.dimensions.width === 0 || n.dimensions.height === 0))
        return !1;
    return !0;
  });
}
const hE = { class: "vue-flow__nodes vue-flow__container" }, pE = {
  name: "Nodes",
  compatConfig: { MODE: 3 }
}, vE = /* @__PURE__ */ we({
  ...pE,
  setup(e) {
    const { getNodes: t, updateNodeDimensions: n, emits: i } = De(), o = fE(), r = j();
    return ke(
      o,
      (a) => {
        a && ze(() => {
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
        ze(() => n(s));
      });
    }), Qe(() => {
      var a;
      return (a = r.value) == null ? void 0 : a.disconnect();
    }), (a, s) => ($(), R("div", hE, [
      r.value ? ($(!0), R(de, { key: 0 }, Oe(f(t), (l, c, u, d) => {
        const h = [l.id];
        if (d && d.key === l.id && Bm(d, h))
          return d;
        const p = ($(), se(f(lE), {
          id: l.id,
          key: l.id,
          "resize-observer": r.value
        }, null, 8, ["id", "resize-observer"]));
        return p.memo = h, p;
      }, s, 0), 128)) : Q("", !0)
    ]));
  }
});
function mE() {
  const { emits: e } = De();
  Ue(() => {
    if (Vf()) {
      const t = document.querySelector(".vue-flow__pane");
      t && window.getComputedStyle(t).zIndex !== "1" && e.error(new je(Ye.MISSING_STYLES));
    }
  });
}
const gE = /* @__PURE__ */ x("div", { class: "vue-flow__edge-labels" }, null, -1), yE = {
  name: "VueFlow",
  compatConfig: { MODE: 3 }
}, Zf = /* @__PURE__ */ we({
  ...yE,
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
    const i = e, o = gd(), r = Nr(i, "modelValue", n), a = Nr(i, "nodes", n), s = Nr(i, "edges", n), l = De(i), c = G_({ modelValue: r, nodes: a, edges: s }, i, l);
    return X_(n, l.hooks), Yk(), mE(), Zt(sr, o), zm(c), t(l), (u, d) => ($(), R("div", {
      ref: f(l).vueFlowRef,
      class: "vue-flow"
    }, [
      z(Bk, null, {
        default: ie(() => [
          z(aE),
          gE,
          z(vE),
          Ve(u.$slots, "zoom-pane")
        ]),
        _: 3
      }),
      Ve(u.$slots, "default"),
      z(Wk)
    ], 512));
  }
}), wE = {
  name: "Panel",
  compatConfig: { MODE: 3 }
}, Jf = /* @__PURE__ */ we({
  ...wE,
  props: {
    position: {}
  },
  setup(e) {
    const t = e, { userSelectionActive: n } = De(), i = W(() => `${t.position}`.split("-"));
    return (o, r) => ($(), R("div", {
      class: Ie(["vue-flow__panel", i.value]),
      style: He({ pointerEvents: f(n) ? "none" : "all" })
    }, [
      Ve(o.$slots, "default")
    ], 6));
  }
}), yo = 216, Ao = 76, os = 64, Kn = 6, is = 10, Vr = is * 2, Qf = 34, bE = 4, rs = 26, Pi = 304, _E = 20;
function eh(e, t = !1) {
  const i = e.length > 1 || (e[0]?.id ?? "") !== "" ? Math.max(e.length, 1) : 0, o = t ? Qf : 0, r = Math.max(1, Math.floor((Pi - Vr - o + Kn) / (os + Kn))), a = i ? Math.min(i, bE, r) : 0, s = i ? Math.ceil(i / a) : 0, l = i <= 2 ? yo : Vr + o + a * os + (a - 1) * Kn, c = Math.min(Pi, Math.max(yo, l)), u = a ? Math.floor((c - Vr - o - (a - 1) * Kn) / a) : 0;
  return {
    width: c,
    height: Ao + Math.max(0, s - 1) * rs,
    columns: a,
    rows: s,
    cellWidth: u
  };
}
const kE = ["title", "aria-label"], EE = ["title"], xE = {
  key: 2,
  class: "wfn-lock",
  title: "Workflow input/output step — locked and can’t be deleted"
}, $E = { class: "wfn-well" }, SE = {
  key: 0,
  class: "wfn-status wfn-status--ok",
  "aria-hidden": "true"
}, CE = {
  key: 1,
  class: "wfn-status wfn-status--fail",
  "aria-hidden": "true"
}, NE = { class: "wfn-body" }, IE = { class: "wfn-kind" }, AE = { class: "wfn-title" }, TE = {
  key: 0,
  class: "wfn-sub"
}, ME = {
  key: 3,
  class: "wfn-await"
}, OE = {
  key: 0,
  class: "wfn-portrow",
  role: "group",
  "aria-label": "Outputs"
}, RE = ["title"], DE = {
  key: 2,
  class: "wfn-failport"
}, PE = {
  key: 0,
  class: "wfn-faillabel"
}, th = /* @__PURE__ */ we({
  __name: "WorkflowNode",
  props: {
    data: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, n = W(() => t.data.outPorts.length > 1 || (t.data.outPorts[0]?.id ?? "") !== ""), i = W(() => t.data.boundaryRole), o = W(() => i.value !== "start"), r = W(() => i.value !== "finish" && i.value !== "error"), a = { position: "relative", transform: "none", left: "auto", top: "auto" }, s = { position: "relative", transform: "none", left: "auto", top: "auto", width: "9px", height: "9px" }, l = W(() => eh(t.data.outPorts, t.data.failedPort)), c = W(() => ({
      width: `${l.value.width}px`,
      minHeight: `${l.value.height}px`,
      "--wfn-port-columns": String(l.value.columns),
      "--wfn-port-rows": String(l.value.rows),
      "--wfn-port-cell-width": `${l.value.cellWidth}px`,
      "--wfn-port-row-height": `${rs}px`,
      "--wfn-port-left": `${is}px`,
      "--wfn-port-right": `${is + (t.data.failedPort ? Qf : 0)}px`,
      "--wfn-port-gap": `${Kn}px`,
      "--wfn-port-min-width": `${os}px`,
      ...n.value ? {
        paddingBottom: `${_E + Math.max(0, l.value.rows - 1) * rs}px`
      } : {}
    }));
    return (u, d) => ($(), R("div", {
      class: Ie(["wfn", [
        `wfn--${e.data.kind}`,
        f($d)(e.data.hueVar),
        e.selected && "wfn--selected",
        `is-${e.data.runStatus}`,
        n.value && "wfn--ports",
        e.data.failedPort && "wfn--has-failport",
        e.data.pinned && "wfn--pinned",
        e.data.failedWired && "wfn--failwired",
        e.data.issue && "wfn--issue",
        i.value && `wfn--boundary wfn--boundary-${i.value}`
      ]]),
      style: He(c.value),
      title: e.data.issue || e.data.ref || e.data.title,
      role: "group",
      "aria-label": `${e.data.kindLabel}: ${e.data.title}${e.data.runStatus !== "idle" ? `, ${e.data.runStatus}` : ""}`
    }, [
      e.data.issue ? ($(), R("span", {
        key: 0,
        class: "wfn-issue",
        title: e.data.issue,
        "aria-hidden": "true"
      }, [
        z(f(ae), { icon: "tabler:alert-triangle" })
      ], 8, EE)) : Q("", !0),
      o.value ? ($(), R(de, { key: 1 }, [
        z(f(xt), {
          id: "in-top",
          type: "target",
          position: f(ye).Top,
          class: "wfn-port",
          "aria-label": "Connect into step",
          title: "Connect into step"
        }, null, 8, ["position"]),
        z(f(xt), {
          id: "in-left",
          type: "target",
          position: f(ye).Left,
          class: "wfn-port",
          "aria-label": "Connect into step",
          title: "Connect into step"
        }, null, 8, ["position"])
      ], 64)) : Q("", !0),
      d[1] || (d[1] = x("span", {
        class: "wfn-ring",
        "aria-hidden": "true"
      }, null, -1)),
      e.data.pinned ? ($(), R("span", xE, [
        z(f(ae), {
          icon: "tabler:lock",
          "aria-hidden": "true"
        })
      ])) : Q("", !0),
      x("div", $E, [
        z(f(ae), {
          icon: e.data.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        e.data.runStatus === "completed" ? ($(), R("span", SE, [
          z(f(ae), { icon: "tabler:check" })
        ])) : e.data.runStatus === "failed" ? ($(), R("span", CE, [
          z(f(ae), { icon: "tabler:x" })
        ])) : Q("", !0)
      ]),
      x("div", NE, [
        x("div", IE, Z(e.data.kindLabel), 1),
        x("div", AE, Z(e.data.title), 1),
        e.data.sub ? ($(), R("div", TE, Z(e.data.sub), 1)) : Q("", !0)
      ]),
      e.data.runStatus === "awaiting" ? ($(), R("span", ME, [
        d[0] || (d[0] = x("span", {
          class: "wfn-await-pulse",
          "aria-hidden": "true"
        }, null, -1)),
        x("span", null, Z(e.data.awaitingLabel || "Waiting for review"), 1)
      ])) : Q("", !0),
      r.value ? ($(), R(de, { key: 4 }, [
        n.value ? ($(), R("span", OE, [
          ($(!0), R(de, null, Oe(e.data.outPorts, (h) => ($(), R("span", {
            key: h.id,
            class: "wfn-portslot"
          }, [
            z(f(xt), {
              id: h.id,
              type: "source",
              position: f(ye).Bottom,
              class: Ie(["wfn-port wfn-port--named", `wfn-port--${h.id}`]),
              style: a,
              "aria-label": `Connect from ${h.label}`,
              title: `Connect from ${h.label}`
            }, null, 8, ["id", "position", "class", "aria-label", "title"]),
            x("span", {
              class: "wfn-portlabel",
              title: h.label
            }, Z(h.label), 9, RE)
          ]))), 128))
        ])) : ($(), R(de, { key: 1 }, [
          z(f(xt), {
            id: "out-bottom",
            type: "source",
            position: f(ye).Bottom,
            class: "wfn-port",
            "aria-label": "Connect from output",
            title: "Connect from output"
          }, null, 8, ["position"]),
          z(f(xt), {
            id: "out-right",
            type: "source",
            position: f(ye).Right,
            class: "wfn-port",
            "aria-label": "Connect from output",
            title: "Connect from output"
          }, null, 8, ["position"])
        ], 64)),
        e.data.failedPort ? ($(), R("span", DE, [
          z(f(xt), {
            id: "failed",
            type: "source",
            position: f(ye).Right,
            class: "wfn-port wfn-port--failed wfn-port--failaff",
            style: s,
            "aria-label": "Connect from Failed",
            title: "Connect from Failed"
          }, null, 8, ["position"]),
          e.data.failedWired ? ($(), R("span", PE, "Failed")) : Q("", !0)
        ])) : Q("", !0)
      ], 64)) : Q("", !0)
    ], 14, kE));
  }
});
var as = "http://www.w3.org/1999/xhtml";
const Tu = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: as,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function nh(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Tu.hasOwnProperty(t) ? { space: Tu[t], local: e } : e;
}
function LE(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === as && t.documentElement.namespaceURI === as ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function zE(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function oh(e) {
  var t = nh(e);
  return (t.local ? zE : LE)(t);
}
function VE() {
}
function ih(e) {
  return e == null ? VE : function() {
    return this.querySelector(e);
  };
}
function BE(e) {
  typeof e != "function" && (e = ih(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = new Array(a), l, c, u = 0; u < a; ++u)
      (l = r[u]) && (c = e.call(l, l.__data__, u, r)) && ("__data__" in l && (c.__data__ = l.__data__), s[u] = c);
  return new dt(i, this._parents);
}
function FE(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function HE() {
  return [];
}
function qE(e) {
  return e == null ? HE : function() {
    return this.querySelectorAll(e);
  };
}
function UE(e) {
  return function() {
    return FE(e.apply(this, arguments));
  };
}
function WE(e) {
  typeof e == "function" ? e = UE(e) : e = qE(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), o.push(l));
  return new dt(i, o);
}
function YE(e) {
  return function() {
    return this.matches(e);
  };
}
function rh(e) {
  return function(t) {
    return t.matches(e);
  };
}
var GE = Array.prototype.find;
function jE(e) {
  return function() {
    return GE.call(this.children, e);
  };
}
function XE() {
  return this.firstElementChild;
}
function KE(e) {
  return this.select(e == null ? XE : jE(typeof e == "function" ? e : rh(e)));
}
var ZE = Array.prototype.filter;
function JE() {
  return Array.from(this.children);
}
function QE(e) {
  return function() {
    return ZE.call(this.children, e);
  };
}
function ex(e) {
  return this.selectAll(e == null ? JE : QE(typeof e == "function" ? e : rh(e)));
}
function tx(e) {
  typeof e != "function" && (e = YE(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new dt(i, this._parents);
}
function ah(e) {
  return new Array(e.length);
}
function nx() {
  return new dt(this._enter || this._groups.map(ah), this._parents);
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
function ox(e) {
  return function() {
    return e;
  };
}
function ix(e, t, n, i, o, r) {
  for (var a = 0, s, l = t.length, c = r.length; a < c; ++a)
    (s = t[a]) ? (s.__data__ = r[a], i[a] = s) : n[a] = new Li(e, r[a]);
  for (; a < l; ++a)
    (s = t[a]) && (o[a] = s);
}
function rx(e, t, n, i, o, r, a) {
  var s, l, c = /* @__PURE__ */ new Map(), u = t.length, d = r.length, h = new Array(u), p;
  for (s = 0; s < u; ++s)
    (l = t[s]) && (h[s] = p = a.call(l, l.__data__, s, t) + "", c.has(p) ? o[s] = l : c.set(p, l));
  for (s = 0; s < d; ++s)
    p = a.call(e, r[s], s, r) + "", (l = c.get(p)) ? (i[s] = l, l.__data__ = r[s], c.delete(p)) : n[s] = new Li(e, r[s]);
  for (s = 0; s < u; ++s)
    (l = t[s]) && c.get(h[s]) === l && (o[s] = l);
}
function ax(e) {
  return e.__data__;
}
function sx(e, t) {
  if (!arguments.length) return Array.from(this, ax);
  var n = t ? rx : ix, i = this._parents, o = this._groups;
  typeof e != "function" && (e = ox(e));
  for (var r = o.length, a = new Array(r), s = new Array(r), l = new Array(r), c = 0; c < r; ++c) {
    var u = i[c], d = o[c], h = d.length, p = lx(e.call(u, u && u.__data__, c, i)), v = p.length, g = s[c] = new Array(v), m = a[c] = new Array(v), _ = l[c] = new Array(h);
    n(u, d, g, m, _, p, t);
    for (var E = 0, w = 0, b, S; E < v; ++E)
      if (b = g[E]) {
        for (E >= w && (w = E + 1); !(S = m[w]) && ++w < v; ) ;
        b._next = S || null;
      }
  }
  return a = new dt(a, i), a._enter = s, a._exit = l, a;
}
function lx(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function ux() {
  return new dt(this._exit || this._groups.map(ah), this._parents);
}
function cx(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function dx(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), s = new Array(o), l = 0; l < a; ++l)
    for (var c = n[l], u = i[l], d = c.length, h = s[l] = new Array(d), p, v = 0; v < d; ++v)
      (p = c[v] || u[v]) && (h[v] = p);
  for (; l < o; ++l)
    s[l] = n[l];
  return new dt(s, this._parents);
}
function fx() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function hx(e) {
  e || (e = px);
  function t(d, h) {
    return d && h ? e(d.__data__, h.__data__) : !d - !h;
  }
  for (var n = this._groups, i = n.length, o = new Array(i), r = 0; r < i; ++r) {
    for (var a = n[r], s = a.length, l = o[r] = new Array(s), c, u = 0; u < s; ++u)
      (c = a[u]) && (l[u] = c);
    l.sort(t);
  }
  return new dt(o, this._parents).order();
}
function px(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function vx() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function mx() {
  return Array.from(this);
}
function gx() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a) return a;
    }
  return null;
}
function yx() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function wx() {
  return !this.node();
}
function bx(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, s; r < a; ++r)
      (s = o[r]) && e.call(s, s.__data__, r, o);
  return this;
}
function _x(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function kx(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function Ex(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function xx(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function $x(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function Sx(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function Cx(e, t) {
  var n = nh(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? kx : _x : typeof t == "function" ? n.local ? Sx : $x : n.local ? xx : Ex)(n, t));
}
function sh(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function Nx(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Ix(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function Ax(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function Tx(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? Nx : typeof t == "function" ? Ax : Ix)(e, t, n ?? "")) : Mx(this.node(), e);
}
function Mx(e, t) {
  return e.style.getPropertyValue(t) || sh(e).getComputedStyle(e, null).getPropertyValue(t);
}
function Ox(e) {
  return function() {
    delete this[e];
  };
}
function Rx(e, t) {
  return function() {
    this[e] = t;
  };
}
function Dx(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function Px(e, t) {
  return arguments.length > 1 ? this.each((t == null ? Ox : typeof t == "function" ? Dx : Rx)(e, t)) : this.node()[e];
}
function lh(e) {
  return e.trim().split(/^|\s+/);
}
function Zs(e) {
  return e.classList || new uh(e);
}
function uh(e) {
  this._node = e, this._names = lh(e.getAttribute("class") || "");
}
uh.prototype = {
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
function ch(e, t) {
  for (var n = Zs(e), i = -1, o = t.length; ++i < o; ) n.add(t[i]);
}
function dh(e, t) {
  for (var n = Zs(e), i = -1, o = t.length; ++i < o; ) n.remove(t[i]);
}
function Lx(e) {
  return function() {
    ch(this, e);
  };
}
function zx(e) {
  return function() {
    dh(this, e);
  };
}
function Vx(e, t) {
  return function() {
    (t.apply(this, arguments) ? ch : dh)(this, e);
  };
}
function Bx(e, t) {
  var n = lh(e + "");
  if (arguments.length < 2) {
    for (var i = Zs(this.node()), o = -1, r = n.length; ++o < r; ) if (!i.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? Vx : t ? Lx : zx)(n, t));
}
function Fx() {
  this.textContent = "";
}
function Hx(e) {
  return function() {
    this.textContent = e;
  };
}
function qx(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function Ux(e) {
  return arguments.length ? this.each(e == null ? Fx : (typeof e == "function" ? qx : Hx)(e)) : this.node().textContent;
}
function Wx() {
  this.innerHTML = "";
}
function Yx(e) {
  return function() {
    this.innerHTML = e;
  };
}
function Gx(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function jx(e) {
  return arguments.length ? this.each(e == null ? Wx : (typeof e == "function" ? Gx : Yx)(e)) : this.node().innerHTML;
}
function Xx() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Kx() {
  return this.each(Xx);
}
function Zx() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Jx() {
  return this.each(Zx);
}
function Qx(e) {
  var t = typeof e == "function" ? e : oh(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function e$() {
  return null;
}
function t$(e, t) {
  var n = typeof e == "function" ? e : oh(e), i = t == null ? e$ : typeof t == "function" ? t : ih(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function n$() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function o$() {
  return this.each(n$);
}
function i$() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function r$() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function a$(e) {
  return this.select(e ? r$ : i$);
}
function s$(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function l$(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function u$(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function c$(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function d$(e, t, n) {
  return function() {
    var i = this.__on, o, r = l$(t);
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
function f$(e, t, n) {
  var i = u$(e + ""), o, r = i.length, a;
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
  for (s = t ? d$ : c$, o = 0; o < r; ++o) this.each(s(i[o], t, n));
  return this;
}
function fh(e, t, n) {
  var i = sh(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function h$(e, t) {
  return function() {
    return fh(this, e, t);
  };
}
function p$(e, t) {
  return function() {
    return fh(this, e, t.apply(this, arguments));
  };
}
function v$(e, t) {
  return this.each((typeof t == "function" ? p$ : h$)(e, t));
}
function* m$() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var g$ = [null];
function dt(e, t) {
  this._groups = e, this._parents = t;
}
function y$() {
  return this;
}
dt.prototype = {
  constructor: dt,
  select: BE,
  selectAll: WE,
  selectChild: KE,
  selectChildren: ex,
  filter: tx,
  data: sx,
  enter: nx,
  exit: ux,
  join: cx,
  merge: dx,
  selection: y$,
  order: fx,
  sort: hx,
  call: vx,
  nodes: mx,
  node: gx,
  size: yx,
  empty: wx,
  each: bx,
  attr: Cx,
  style: Tx,
  property: Px,
  classed: Bx,
  text: Ux,
  html: jx,
  raise: Kx,
  lower: Jx,
  append: Qx,
  insert: t$,
  remove: o$,
  clone: a$,
  datum: s$,
  on: f$,
  dispatch: v$,
  [Symbol.iterator]: m$
};
function wo(e) {
  return typeof e == "string" ? new dt([[document.querySelector(e)]], [document.documentElement]) : new dt([[e]], g$);
}
function w$(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Mu(e, t) {
  if (e = w$(e), t === void 0 && (t = e.currentTarget), t) {
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
var b$ = { value: () => {
} };
function hh() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new fi(n);
}
function fi(e) {
  this._ = e;
}
function _$(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", o = n.indexOf(".");
    if (o >= 0 && (i = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
fi.prototype = hh.prototype = {
  constructor: fi,
  on: function(e, t) {
    var n = this._, i = _$(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; ) if ((o = (e = i[r]).type) && (o = k$(n[o], e.name))) return o;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++r < a; )
      if (o = (e = i[r]).type) n[o] = Ou(n[o], e.name, t);
      else if (t == null) for (o in n) n[o] = Ou(n[o], e.name, null);
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
function k$(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function Ou(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = b$, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
const E$ = { passive: !1 }, bo = { capture: !0, passive: !1 };
function Br(e) {
  e.stopImmediatePropagation();
}
function Cn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function x$(e) {
  var t = e.document.documentElement, n = wo(e).on("dragstart.drag", Cn, bo);
  "onselectstart" in t ? n.on("selectstart.drag", Cn, bo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function $$(e, t) {
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
function S$(e) {
  return !e.ctrlKey && !e.button;
}
function C$() {
  return this.parentNode;
}
function N$(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function I$() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function A$() {
  var e = S$, t = C$, n = N$, i = I$, o = {}, r = hh("start", "drag", "end"), a = 0, s, l, c, u, d = 0;
  function h(b) {
    b.on("mousedown.drag", p).filter(i).on("touchstart.drag", m).on("touchmove.drag", _, E$).on("touchend.drag touchcancel.drag", E).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function p(b, S) {
    if (!(u || !e.call(this, b, S))) {
      var N = w(this, t.call(this, b, S), b, S, "mouse");
      N && (wo(b.view).on("mousemove.drag", v, bo).on("mouseup.drag", g, bo), x$(b.view), Br(b), c = !1, s = b.clientX, l = b.clientY, N("start", b));
    }
  }
  function v(b) {
    if (Cn(b), !c) {
      var S = b.clientX - s, N = b.clientY - l;
      c = S * S + N * N > d;
    }
    o.mouse("drag", b);
  }
  function g(b) {
    wo(b.view).on("mousemove.drag mouseup.drag", null), $$(b.view, c), Cn(b), o.mouse("end", b);
  }
  function m(b, S) {
    if (e.call(this, b, S)) {
      var N = b.changedTouches, V = t.call(this, b, S), A = N.length, T, L;
      for (T = 0; T < A; ++T)
        (L = w(this, V, b, S, N[T].identifier, N[T])) && (Br(b), L("start", b, N[T]));
    }
  }
  function _(b) {
    var S = b.changedTouches, N = S.length, V, A;
    for (V = 0; V < N; ++V)
      (A = o[S[V].identifier]) && (Cn(b), A("drag", b, S[V]));
  }
  function E(b) {
    var S = b.changedTouches, N = S.length, V, A;
    for (u && clearTimeout(u), u = setTimeout(function() {
      u = null;
    }, 500), V = 0; V < N; ++V)
      (A = o[S[V].identifier]) && (Br(b), A("end", b, S[V]));
  }
  function w(b, S, N, V, A, T) {
    var L = r.copy(), M = Mu(T || N, S), k, B, y;
    if ((y = n.call(b, new ss("beforestart", {
      sourceEvent: N,
      target: h,
      identifier: A,
      active: a,
      x: M[0],
      y: M[1],
      dx: 0,
      dy: 0,
      dispatch: L
    }), V)) != null)
      return k = y.x - M[0] || 0, B = y.y - M[1] || 0, function I(C, H, F) {
        var q = M, U;
        switch (C) {
          case "start":
            o[A] = I, U = a++;
            break;
          case "end":
            delete o[A], --a;
          case "drag":
            M = Mu(F || H, S), U = a;
            break;
        }
        L.call(
          C,
          b,
          new ss(C, {
            sourceEvent: H,
            subject: y,
            target: h,
            identifier: A,
            active: U,
            x: M[0] + k,
            y: M[1] + B,
            dx: M[0] - q[0],
            dy: M[1] - q[1],
            dispatch: L
          }),
          V
        );
      };
  }
  return h.filter = function(b) {
    return arguments.length ? (e = typeof b == "function" ? b : Ko(!!b), h) : e;
  }, h.container = function(b) {
    return arguments.length ? (t = typeof b == "function" ? b : Ko(b), h) : t;
  }, h.subject = function(b) {
    return arguments.length ? (n = typeof b == "function" ? b : Ko(b), h) : n;
  }, h.touchable = function(b) {
    return arguments.length ? (i = typeof b == "function" ? b : Ko(!!b), h) : i;
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
const M$ = {
  [hn.Line]: "right",
  [hn.Handle]: "bottom-right"
}, O$ = {
  [hn.Line]: "borderColor",
  [hn.Handle]: "backgroundColor"
}, R$ = {
  name: "ResizeControl",
  compatConfig: { MODE: 3 }
}, Ru = /* @__PURE__ */ we({
  ...R$,
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
    }, { findNode: r, emits: a, viewport: s, noDragClassName: l } = De(), c = Hf(), u = j();
    let d = o, h = i;
    const p = Ne(() => n.position ?? M$[n.variant]), v = W(() => p.value.split("-")), g = Ne(() => n.color ? { [O$[n.variant]]: n.color } : {}), m = Ne(() => n.variant === hn.Handle), _ = W(() => m.value && n.autoScale ? `${Math.max(1 / s.value.zoom, 1)}` : void 0);
    return wd((E) => {
      if (!u.value || !n.nodeId)
        return;
      const w = wo(u.value), b = p.value.includes("right") || p.value.includes("left"), S = p.value.includes("bottom") || p.value.includes("top"), N = p.value.includes("left"), V = p.value.includes("top"), A = A$().on("start", (T) => {
        const L = r(n.nodeId), { xSnapped: M, ySnapped: k } = c(T);
        h = {
          width: L?.dimensions.width ?? 0,
          height: L?.dimensions.height ?? 0,
          x: L?.position.x ?? 0,
          y: L?.position.y ?? 0
        }, d = {
          ...h,
          pointerX: M,
          pointerY: k,
          aspectRatio: h.width / h.height
        }, t("resizeStart", { event: T, params: h });
      }).on("drag", (T) => {
        var L;
        const { xSnapped: M, ySnapped: k } = c(T), B = r(n.nodeId);
        if (B) {
          const y = [], {
            pointerX: I,
            pointerY: C,
            width: H,
            height: F,
            x: q,
            y: U,
            aspectRatio: ne
          } = d, { x: ue, y: G, width: J, height: K } = h, X = Math.floor(b ? M - I : 0), oe = Math.floor(S ? k - C : 0);
          let le = Bt(H + (N ? -X : X), n.minWidth, n.maxWidth), fe = Bt(F + (V ? -oe : oe), n.minHeight, n.maxHeight);
          if (n.keepAspectRatio) {
            const O = le / fe;
            let D = ne;
            typeof n.keepAspectRatio == "number" && O !== n.keepAspectRatio && (D = n.keepAspectRatio);
            const Y = b && S, ee = b && !S, re = S && !b;
            le = O <= D && Y || re ? fe * D : le, fe = O > D && Y || ee ? le / D : fe, le >= n.maxWidth ? (le = n.maxWidth, fe = n.maxWidth / D) : le <= n.minWidth && (le = n.minWidth, fe = n.minWidth / D), fe >= n.maxHeight ? (fe = n.maxHeight, le = n.maxHeight * D) : fe <= n.minHeight && (fe = n.minHeight, le = n.minHeight * D);
          }
          const _e = le !== J, $e = fe !== K;
          if (N || V) {
            const O = N ? q - (le - H) : q, D = V ? U - (fe - F) : U, Y = O !== ue && _e, ee = D !== G && $e;
            if (Y || ee) {
              const re = {
                id: B.id,
                type: "position",
                from: B.position,
                position: {
                  x: Y ? O : ue,
                  y: ee ? D : G
                }
              };
              y.push(re), h.x = re.position.x, h.y = re.position.y;
            }
          }
          if (n.nodeId && (_e || $e)) {
            const O = {
              id: n.nodeId,
              type: "dimensions",
              updateStyle: !0,
              resizing: !0,
              dimensions: {
                width: le,
                height: fe
              }
            };
            y.push(O), h.width = le, h.height = fe;
          }
          if (y.length === 0)
            return;
          const me = T$({
            width: h.width,
            prevWidth: J,
            height: h.height,
            prevHeight: K,
            invertX: N,
            invertY: V
          }), ge = { ...h, direction: me };
          if (((L = n.shouldResize) == null ? void 0 : L.call(n, T, ge)) === !1)
            return;
          t("resize", { event: T, params: ge }), a.nodesChange(y);
        }
      }).on("end", (T) => {
        if (n.nodeId) {
          const L = {
            id: n.nodeId,
            type: "dimensions",
            resizing: !1
          };
          t("resizeEnd", { event: T, params: h }), a.nodesChange([L]);
        }
      });
      w.call(A), E(() => {
        w.on(".drag", null);
      });
    }), (E, w) => ($(), R("div", {
      ref_key: "resizeControlRef",
      ref: u,
      class: Ie(["vue-flow__resize-control", [...v.value, E.variant, f(l)]]),
      style: He({
        ...g.value,
        scale: _.value
      })
    }, [
      Ve(E.$slots, "default")
    ], 6));
  }
}), D$ = {
  name: "NodeResizer",
  compatConfig: { MODE: 3 },
  inheritAttrs: !1
}, ph = /* @__PURE__ */ we({
  ...D$,
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
    const n = e, { findNode: i, emits: o } = De(), r = ["top-left", "top-right", "bottom-left", "bottom-right"], a = ["top", "right", "bottom", "left"], s = Ht(js, null), l = Ne(() => typeof n.nodeId == "string" ? n.nodeId : s), c = W(() => i(l.value));
    return ke(
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
    ), (u, d) => u.isVisible ? ($(), R(de, { key: 0 }, [
      ($(), R(de, null, Oe(a, (h) => z(Ru, {
        key: h,
        class: Ie(u.lineClassName),
        style: He(u.lineStyle),
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
      ($(), R(de, null, Oe(r, (h) => z(Ru, {
        key: h,
        class: Ie(u.handleClassName),
        style: He(u.handleStyle),
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
function P$(e) {
  return Js.find((t) => t.key === e)?.hue || "var(--wf-amber)";
}
function Qs(e) {
  return `wf-note--${Js.find((n) => n.key === e)?.key || "amber"}`;
}
const vh = 200, mh = 120, gh = "wfPersistNoteSize";
function yh(e, t) {
  const n = W(() => P$(t().color)), i = Ht(gh, null);
  function o(r) {
    const a = r.params;
    i?.(e, a.x, a.y, a.width, a.height);
  }
  return { hue: n, onResizeEnd: o };
}
const L$ = ["source"], z$ = {
  key: 1,
  class: "wf-note-empty"
}, wh = /* @__PURE__ */ we({
  __name: "NoteNode",
  props: {
    id: {},
    data: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, { hue: n, onResizeEnd: i } = yh(t.id, () => t.data);
    return Ue(() => {
      Ki("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (o, r) => ($(), R(de, null, [
      z(f(ph), {
        "min-width": f(vh),
        "min-height": f(mh),
        "is-visible": !!e.selected,
        color: f(n),
        onResizeEnd: f(i)
      }, null, 8, ["min-width", "min-height", "is-visible", "color", "onResizeEnd"]),
      x("div", {
        class: Ie(["wf-note", [e.selected && "wf-note--selected", f(Qs)(e.data.color)]])
      }, [
        t.data.text ? ($(), R("wc-render-markdown", {
          key: 0,
          class: "wf-note-md",
          source: t.data.text
        }, null, 8, L$)) : ($(), R("div", z$, "Empty note — write markdown in the panel"))
      ], 2)
    ], 64));
  }
}), V$ = { class: "wf-frame-title" }, bh = /* @__PURE__ */ we({
  __name: "FrameNode",
  props: {
    id: {},
    data: {},
    selected: { type: Boolean }
  },
  setup(e) {
    const t = e, { hue: n, onResizeEnd: i } = yh(t.id, () => t.data), o = W(() => (t.data.text || "").split(`
`)[0]?.trim() || "");
    return (r, a) => ($(), R(de, null, [
      z(f(ph), {
        "min-width": f(vh),
        "min-height": f(mh),
        "is-visible": !!e.selected,
        color: f(n),
        onResizeEnd: f(i)
      }, null, 8, ["min-width", "min-height", "is-visible", "color", "onResizeEnd"]),
      x("div", {
        class: Ie(["wf-frame", [e.selected && "wf-frame--selected", f(Qs)(e.data.color)]])
      }, [
        x("div", V$, Z(o.value || "Frame"), 1)
      ], 2)
    ], 64));
  }
}), B$ = { class: "wf-container-head" }, F$ = { class: "wf-container-kind" }, H$ = {
  key: 0,
  class: "wf-container-label"
}, _h = /* @__PURE__ */ we({
  __name: "ContainerNode",
  props: {
    data: {}
  },
  setup(e) {
    return (t, n) => ($(), R("div", {
      class: Ie(["wf-container", `wf-container--${e.data.kind}`])
    }, [
      x("div", B$, [
        z(f(ae), {
          icon: e.data.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        x("span", F$, Z(e.data.kind === "cycle" ? "Loop" : "For each"), 1),
        e.data.label ? ($(), R("span", H$, Z(e.data.label), 1)) : Q("", !0)
      ])
    ], 2));
  }
});
function q$(e, t, n, i, o, r, a = 1) {
  const s = n - e, l = i - t, c = Math.max(Math.hypot(s, l), 1);
  let u = -l / c, d = s / c;
  d > 0 && (u = -u, d = -d);
  const h = 48 / Math.max(a, 0.1);
  return {
    x: e + s * 0.35 + u * h,
    y: t + l * 0.35 + d * h
  };
}
const U$ = ["title"], kh = /* @__PURE__ */ we({
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
    const t = e, { getViewport: n } = De(), i = W(() => Xs({
      sourceX: t.sourceX,
      sourceY: t.sourceY,
      sourcePosition: t.sourcePosition || ye.Bottom,
      targetX: t.targetX,
      targetY: t.targetY,
      targetPosition: t.targetPosition || ye.Top,
      curvature: t.curvature
    })), o = W(() => t.data?.unmappedRequired?.length || 0), r = W(() => t.data?.contractUnavailable === !0), a = W(() => q$(
      t.sourceX,
      t.sourceY,
      t.targetX,
      t.targetY,
      i.value[1],
      i.value[2],
      n().zoom
    ));
    return (s, l) => ($(), R(de, null, [
      z(f(Io), {
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
      o.value || r.value ? ($(), se(f(dE), { key: 0 }, {
        default: ie(() => [
          x("span", {
            class: Ie(["wf-edge-completeness-badge", r.value && "is-contract-unavailable"]),
            title: r.value ? "This step’s input fields are unavailable" : `${o.value} required field${o.value === 1 ? "" : "s"} need mapping`,
            style: He({ transform: `translate(-50%, -50%) translate(${a.value.x}px, ${a.value.y}px)` })
          }, Z(r.value ? "!" : o.value), 15, U$)
        ]),
        _: 1
      })) : Q("", !0)
    ], 64));
  }
});
function ct(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Vn(e) {
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
function Eh(e, t, n, i, o) {
  const r = ct(e.properties);
  if (!r) return [];
  const a = [];
  for (const [s, l] of Object.entries(r)) {
    const c = ct(l) || {}, u = n ? `${n}.${s}` : s, d = el(c), h = d === "object" && ct(c.properties) && i + 1 < o ? Eh(c, t, u, i + 1, o) : [];
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
function xh(e, t = "output", n = 4) {
  const i = Vn(e);
  return i ? Eh(i, t, "", 0, n) : [];
}
function W$(e, t = "output") {
  const n = Vn(e);
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
  const t = Vn(e);
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
function Y$(e, t) {
  const n = e ?? "";
  if (t === "number" || t === "integer") {
    const i = Number(n);
    return Number.isFinite(i) && n.trim() !== "" ? String(i) : "0";
  }
  return t === "boolean" ? n === "true" || n === "1" ? "true" : "false" : JSON.stringify(String(n));
}
function $h(e) {
  return e.mode === "skip" ? null : e.mode === "expr" ? (e.value || "").trim() || null : (e.value ?? "") === "" ? null : Y$(e.value, e.type);
}
function ls(e) {
  const t = [];
  for (const n of e) {
    if (!n.key) continue;
    const i = $h(n);
    i !== null && t.push(`${n.key}: ${i}`);
  }
  return t.length ? `{ ${t.join(", ")} }` : "";
}
function G$(e) {
  return e.map((t) => ({ key: t.key, mode: t.required ? "static" : "skip", value: "", type: t.type }));
}
function tl(e, t) {
  const n = new Map(t.map((o) => [o.key, o])), i = [];
  for (const o of e) {
    if (!o.required) continue;
    const r = n.get(o.key);
    (!r || $h(r) === null) && i.push(o.title || o.key);
  }
  return i;
}
function j$(e, t) {
  const n = tl(e, t);
  return n.length ? `${n.length} required field${n.length === 1 ? "" : "s"} unmapped` : "";
}
function Sh(e, t, n = "output") {
  const i = Vn(e), o = i ? ct(i.properties) : null;
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
function X$(e, t) {
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
function K$(e, t, n) {
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
function Z$(e, t) {
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
function J$(e) {
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
function Ch(e) {
  const t = (e || "").trim();
  if (!t.startsWith("{") || !t.endsWith("}")) return null;
  const n = t.slice(1, -1).trim();
  if (!n) return [];
  const i = Z$(n, ",");
  if (i === null) return null;
  const o = [];
  for (const r of i) {
    const a = r.trim();
    if (!a) continue;
    const s = J$(a);
    if (s < 0) return null;
    let l = a.slice(0, s).trim();
    const c = a.slice(s + 1).trim();
    if (!c || ((l.startsWith('"') && l.endsWith('"') || l.startsWith("'") && l.endsWith("'")) && (l = l.slice(1, -1)), !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(l))) return null;
    o.push({ key: l, rhs: c });
  }
  return o;
}
function us(e, t) {
  const n = To(e), i = G$(n), o = (t || "").trim();
  if (!o) return { rows: i, raw: "" };
  const r = Ch(o);
  if (!r) return { rows: i, raw: o };
  if (n.length) {
    const a = new Set(n.map((c) => c.key));
    if (r.some((c) => !a.has(c.key))) return { rows: i, raw: o };
    const s = new Map(r.map((c) => [c.key, c.rhs]));
    return { rows: i.map((c) => s.has(c.key) ? { key: c.key, mode: "expr", value: s.get(c.key), type: c.type } : c), raw: "" };
  }
  return { rows: r.map((a) => ({ key: a.key, mode: "expr", value: a.rhs })), raw: "" };
}
const Du = 500, Q$ = new Set(Object.values(Hd));
function Nh(e) {
  const t = ol(e);
  return t ? K$(t, "input", "output") : "";
}
function Ih() {
  return { nodes: {}, edges: {}, notes: {}, positions: {}, viewport: null, direction: "TB", params: {}, labels: [], headSeq: 0, definitionEditSeq: 0, canUndo: !1, canRedo: !1 };
}
function ut(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Xe(e, t = 0) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
const eS = /* @__PURE__ */ new Set([
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
function tS(e) {
  return typeof e == "string" && eS.has(e) ? e : null;
}
function Ah(e) {
  const t = ut(e), n = Ih();
  for (const a of Array.isArray(t.nodes) ? t.nodes : []) {
    const s = Th(ut(a));
    s && (n.nodes[s.id] = s);
  }
  for (const a of Array.isArray(t.edges) ? t.edges : []) {
    const s = Mh(ut(a));
    s && (n.edges[s.id] = s);
  }
  for (const a of Array.isArray(t.notes) ? t.notes : []) {
    const s = Oh(ut(a));
    s && (n.notes[s.id] = s);
  }
  const i = ut(t.layout), o = ut(i.positions ?? t.layout);
  for (const [a, s] of Object.entries(o)) {
    const l = ut(s);
    "x" in l && "y" in l && (n.positions[a] = Rh(l));
  }
  const r = ut(t.viewport ?? i.viewport);
  return ("zoom" in r || "x" in r && "y" in r) && (n.viewport = { x: Xe(r.x), y: Xe(r.y), zoom: Xe(r.zoom, 1) }), n.direction = i.direction === "LR" ? "LR" : "TB", n.params = ut(t.params), n.labels = Array.isArray(t.labels) ? t.labels.filter((a) => typeof a == "string") : [], n.headSeq = Xe(t.head_seq), n.definitionEditSeq = Xe(t.definition_edit_seq), n.canUndo = t.can_undo === !0, n.canRedo = t.can_redo === !0, n;
}
function Th(e) {
  const t = String(e.id || ""), n = tS(e.kind);
  if (!t || !n) return null;
  const i = { id: t, kind: n, title: String(e.title ?? "Step") };
  e.ref != null && (i.ref = String(e.ref)), e.ref_label != null && (i.ref_label = String(e.ref_label)), e.config != null && (i.config = ut(e.config));
  for (const o of Ds)
    e[o] !== void 0 && e[o] !== !1 && (i[o] = e[o]);
  return e.input_schema !== void 0 && (i.input_schema = e.input_schema), e.output_schema !== void 0 && (i.output_schema = e.output_schema), e.config_schema !== void 0 && (i.config_schema = e.config_schema), e.icon != null && (i.icon = String(e.icon)), e.pinned != null && (i.pinned = e.pinned === !0), e.deletable != null && (i.deletable = e.deletable === !0), e.boundary != null && typeof e.boundary == "object" && (i.boundary = e.boundary), e.child_interface != null && typeof e.child_interface == "object" && (i.child_interface = e.child_interface), Array.isArray(e.ports) && (i.ports = e.ports), i;
}
function Mh(e) {
  const t = String(e.id || ""), n = String(e.source_id || ""), i = String(e.target_id || "");
  if (!t || !n || !i) return null;
  const o = { id: t, source_id: n, target_id: i };
  return e.source_port != null && (o.source_port = String(e.source_port)), e.target_port != null && (o.target_port = String(e.target_port)), e.transform != null && (o.transform = Nh(e.transform)), o;
}
function Oh(e) {
  const t = String(e.id || "");
  if (!t) return null;
  const n = { id: t, text: String(e.body ?? "") };
  return e.kind === "frame" ? n.kind = "frame" : e.kind === "note" && (n.kind = "note"), e.width != null && (n.width = Xe(e.width)), e.height != null && (n.height = Xe(e.height)), e.color != null && e.color !== "" && (n.color = String(e.color)), n;
}
function Rh(e) {
  const t = { x: Xe(e.x), y: Xe(e.y) };
  return e.width != null && (t.width = Xe(e.width)), e.height != null && (t.height = Xe(e.height)), t;
}
function cs(e, t) {
  const n = ut(t.body);
  switch (t.type) {
    case Te.NODE_ADDED: {
      const i = Th(n);
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
      const i = Mh(n);
      return i ? (e.edges = { ...e.edges, [i.id]: i }, { changed: !0, unknown: !1 }) : { changed: !1, unknown: !1 };
    }
    case Te.EDGE_UPDATED: {
      const i = String(n.id || ""), o = e.edges[i];
      if (!o) return { changed: !1, unknown: !1 };
      const r = {};
      for (const a of ["source_id", "target_id", "source_port", "target_port"])
        a in n && (r[a] = n[a]);
      return "transform" in n && (r.transform = Nh(n.transform)), e.edges = { ...e.edges, [i]: { ...o, ...r } }, { changed: !0, unknown: !1 };
    }
    case Te.EDGE_REMOVED: {
      const i = String(n.id || "");
      if (!e.edges[i]) return { changed: !1, unknown: !1 };
      const o = { ...e.edges };
      return delete o[i], e.edges = o, { changed: !0, unknown: !1 };
    }
    case Te.NOTE_ADDED: {
      const i = Oh(n);
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
      const o = e.positions[i], r = Rh(n);
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
function zi(e, t) {
  for (const n of t) cs(e, { type: Hd[n.type], body: n.body });
}
class nS {
  doc = Ih();
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
      for (const t of this.pending.values()) zi(this.doc, t);
      this.pending.size || (this.confirmed = null);
    }
  }
  // Reset to a freshly fetched /state snapshot. Everything at or below head_seq is,
  // by definition, already reflected.
  reset(t) {
    this.doc = Ah(t), this.lastAppliedSeq = this.doc.headSeq, this.echoes = [], this.historySeq = this.doc.headSeq, this.confirmed = this.pending.size ? this.doc : null, this.projectPending();
  }
  // Record that the local user just committed a node to (x, y), so the matching
  // broadcast echo is suppressed. Coordinates are rounded to match the command.
  recordLayoutEcho(t, n, i, o = Date.now()) {
    this.echoes.push({ nodeId: t, x: Math.round(n), y: Math.round(i), ts: o });
  }
  pruneEchoes(t) {
    this.echoes.length && (this.echoes = this.echoes.filter((n) => t - n.ts <= Du));
  }
  matchEcho(t, n, i, o) {
    const r = this.echoes.findIndex(
      (a) => a.nodeId === t && a.x === Math.round(n) && a.y === Math.round(i) && o - a.ts <= Du
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
      this.lastAppliedSeq = l.seq, l.seq > this.doc.headSeq && (this.doc.headSeq = l.seq), Q$.has(l.type) && l.seq > this.doc.definitionEditSeq && (this.doc.definitionEditSeq = l.seq), c.unknown || l.type === Te.VERSION_PUBLISHED || l.type === Te.VERSION_RESTORED ? a = !0 : c.changed && (r.push(l), s = !0);
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
function Pu(e) {
  const t = e.length === 1 ? e[0] : null;
  return t?.type === "node.update" && typeof t.body.id == "string" ? t.body.id : null;
}
function oS({ engine: e, request: t, rebuild: n, recover: i, checkpoint: o }) {
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
  const v = Object.assign((g, m = !1) => {
    if (!g.length) return Promise.resolve();
    const _ = Pu(g);
    let E;
    if (_) {
      for (let w = r.length - 1; w >= 0; w--) {
        const b = Pu(r[w].commands);
        if (!b) break;
        if (b === _) {
          E = r[w];
          break;
        }
      }
      if (!E && !r.length && a && _o(a.commands, g)) return a.done;
    }
    if (E) {
      const w = [{ ...g[0], body: { ...E.commands[0].body, ...g[0].body } }];
      if (_o(E.commands, w)) return E.done;
      e.rejectCommands(E.stage), E.commands = w, E.stage = e.stageCommands(w);
    } else {
      let w;
      const b = new Promise((S) => {
        w = S;
      });
      E = { commands: g, stage: e.stageCommands(g), done: b, resolve: w }, r.push(E);
    }
    try {
      c();
    } catch (w) {
      return l = !0, i(w).then(() => {
        for (const b of r) b.resolve();
      }), E.done;
    }
    return n(m), l ? E.resolve() : d(), E.done;
  }, { flush: async () => {
    do
      if (!await d()) return !1;
    while (a || r.length);
    return !0;
  }, pending: !1 });
  return Object.defineProperty(v, "pending", { get: () => !!a || r.length > 0 }), v;
}
function Lu(e) {
  const t = [];
  for (const n of e) {
    const i = n.length === 1 ? n[0] : null;
    let o = !1;
    if (i?.type === Re.NODE_UPDATE)
      for (let r = t.length - 1; r >= 0; r--) {
        const a = t[r].length === 1 ? t[r][0] : null;
        if (a?.type !== Re.NODE_UPDATE) break;
        if (a.body.id === i.body.id) {
          t[r] = [{ ...i, body: { ...a.body, ...i.body } }], o = !0;
          break;
        }
      }
    o || t.push(n);
  }
  return t;
}
const iS = new Set(Object.values(Re));
function rS(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.type == "string" && iS.has(t.type) && !!t.body && typeof t.body == "object" && !Array.isArray(t.body);
}
class aS {
  constructor(t, n, i) {
    this.storage = i, this.key = `kickside.workflow-edits.v1:${encodeURIComponent(t)}:${encodeURIComponent(n)}`;
  }
  key;
  write(t) {
    t.length ? this.storage.setItem(this.key, JSON.stringify(Lu(t))) : this.storage.removeItem(this.key);
  }
  read(t) {
    const n = JSON.parse(this.storage.getItem(this.key) ?? "[]");
    if (!Array.isArray(n) || !n.every((o) => Array.isArray(o) && o.every(rS)))
      throw new Error("Invalid pending Workflow edits. The recovery record has been retained.");
    const i = JSON.parse(JSON.stringify(t));
    return Lu(n).flatMap((o) => {
      const r = o.filter((s) => {
        const l = String(s.body.id || "");
        return s.type === Re.NODE_ADD ? !i.nodes[l] : s.type === Re.EDGE_ADD ? !i.edges[l] : s.type === Re.NOTE_ADD ? !i.notes[l] : !0;
      }), a = JSON.parse(JSON.stringify(i));
      return zi(i, r), _o(a, i) ? [] : [r];
    });
  }
}
const Vi = /* @__PURE__ */ new Map();
async function sS(e) {
  const t = Vi.get(e);
  t && await t.flush();
}
function lS(e, t) {
  Vi.set(e, t);
}
function uS(e, t) {
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
function Dh(e) {
  const t = e.trim();
  return !t || /\s/.test(t) ? !1 : t.includes(":") ? !0 : /^[a-z0-9_-]+(\.[a-z0-9_-]+){2,}$/i.test(t);
}
function cS(e) {
  const t = e.split(":").pop() || e, n = t.split(".").pop() || t;
  return n.split("/").pop() || n;
}
function il(e) {
  return e.replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim().split(" ").map((t) => t && t[0].toUpperCase() + t.slice(1)).join(" ");
}
function Je(e, t) {
  const n = (e || "").trim();
  if (n && !Dh(n)) return n;
  const i = n || (t || "").trim();
  return i ? il(cS(i)) || i : "";
}
function zu(e) {
  return !!e && (typeof e.type == "string" || !!e.properties && typeof e.properties == "object");
}
function rl(e, t) {
  const n = Ml(e), i = Ml(t);
  if (!zu(n) || !zu(i)) return { status: "neutral" };
  const o = n.type, r = i.type;
  if (o && r && !Zm(o, r))
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
function dS(e, t) {
  return rl(e, t).status === "error" ? "needs-mapping" : "ok";
}
const Ph = /* @__PURE__ */ new Set(["out-bottom", "out-right", "in-top", "in-left"]);
function Vu(e) {
  return !!e && Ph.has(e);
}
function kn(e) {
  const t = e || void 0;
  return t && !Ph.has(t) ? t : void 0;
}
function Lh(e, t) {
  if (!e.source || !e.target || e.source === e.target) return !1;
  const n = kn(e.sourceHandle), i = kn(e.targetHandle);
  return !t.some((o) => !(e.id != null && o.id === e.id) && o.source_id === e.source && o.target_id === e.target && kn(o.source_port) === n && kn(o.target_port) === i);
}
function fS(e, t, n) {
  const i = To(t), o = i.filter((u) => u.required).map((u) => u.title || u.key);
  if (!o.length) return { required: o, unmappedRequired: [] };
  const r = ol(e.transform), a = us(t, r), s = r.trim() ? [] : Sh(n, t), l = new Map(s.map((u) => [u.key, u])), c = a.rows.map((u) => l.get(u.key) || u);
  return {
    required: o,
    unmappedRequired: a.raw ? [] : tl(i, c)
  };
}
function hS(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Fr, Bu;
function al() {
  if (Bu) return Fr;
  Bu = 1;
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
      var _ = s(this._isDirected, u, d, h);
      return u = _.v, d = _.w, Object.freeze(_), this._edgeObjs[m] = _, o(this._preds[d], u), o(this._sucs[u], d), this._in[d][m] = _, this._out[u][m] = _, this._edgeCount++, this;
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
var Hr, Fu;
function pS() {
  return Fu || (Fu = 1, Hr = "2.2.4"), Hr;
}
var qr, Hu;
function vS() {
  return Hu || (Hu = 1, qr = {
    Graph: al(),
    version: pS()
  }), qr;
}
var Ur, qu;
function mS() {
  if (qu) return Ur;
  qu = 1;
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
var Wr, Uu;
function gS() {
  if (Uu) return Wr;
  Uu = 1, Wr = e;
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
var Yr, Wu;
function zh() {
  if (Wu) return Yr;
  Wu = 1;
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
var Gr, Yu;
function Vh() {
  if (Yu) return Gr;
  Yu = 1;
  var e = zh();
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
      var v = p.v !== u ? p.v : p.w, g = l[v], m = a(p), _ = d.distance + m;
      if (m < 0)
        throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + p + " Weight: " + m);
      _ < g.distance && (g.distance = _, g.predecessor = u, c.decrease(v, _));
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
var jr, Gu;
function yS() {
  if (Gu) return jr;
  Gu = 1;
  var e = Vh();
  jr = t;
  function t(n, i, o) {
    return n.nodes().reduce(function(r, a) {
      return r[a] = e(n, a, i, o), r;
    }, {});
  }
  return jr;
}
var Xr, ju;
function Bh() {
  if (ju) return Xr;
  ju = 1, Xr = e;
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
var Kr, Xu;
function wS() {
  if (Xu) return Kr;
  Xu = 1;
  var e = Bh();
  Kr = t;
  function t(n) {
    return e(n).filter(function(i) {
      return i.length > 1 || i.length === 1 && n.hasEdge(i[0], i[0]);
    });
  }
  return Kr;
}
var Zr, Ku;
function bS() {
  if (Ku) return Zr;
  Ku = 1, Zr = t;
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
var Jr, Zu;
function Fh() {
  if (Zu) return Jr;
  Zu = 1;
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
var Qr, Ju;
function _S() {
  if (Ju) return Qr;
  Ju = 1;
  var e = Fh();
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
var ea, Qu;
function Hh() {
  if (Qu) return ea;
  Qu = 1, ea = e;
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
var ta, ec;
function kS() {
  if (ec) return ta;
  ec = 1;
  var e = Hh();
  ta = t;
  function t(n, i) {
    return e(n, i, "post");
  }
  return ta;
}
var na, tc;
function ES() {
  if (tc) return na;
  tc = 1;
  var e = Hh();
  na = t;
  function t(n, i) {
    return e(n, i, "pre");
  }
  return na;
}
var oa, nc;
function xS() {
  if (nc) return oa;
  nc = 1;
  var e = al(), t = zh();
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
var ia, oc;
function $S() {
  return oc || (oc = 1, ia = {
    components: gS(),
    dijkstra: Vh(),
    dijkstraAll: yS(),
    findCycles: wS(),
    floydWarshall: bS(),
    isAcyclic: _S(),
    postorder: kS(),
    preorder: ES(),
    prim: xS(),
    tarjan: Bh(),
    topsort: Fh()
  }), ia;
}
var ra, ic;
function wt() {
  if (ic) return ra;
  ic = 1;
  var e = vS();
  return ra = {
    Graph: e.Graph,
    json: mS(),
    alg: $S(),
    version: e.version
  }, ra;
}
var aa, rc;
function SS() {
  if (rc) return aa;
  rc = 1;
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
var sa, ac;
function CS() {
  if (ac) return sa;
  ac = 1;
  let e = wt().Graph, t = SS();
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
      let m = c.edge(g), _ = c.node(g.v);
      p && v.push({ v: g.v, w: g.w }), _.out -= m, s(u, d, _);
    }), c.outEdges(h.v).forEach((g) => {
      let m = c.edge(g), _ = g.w, E = c.node(_);
      E.in -= m, s(u, d, E);
    }), c.removeNode(h.v), v;
  }
  function a(c, u) {
    let d = new e(), h = 0, p = 0;
    c.nodes().forEach((m) => {
      d.setNode(m, { v: m, in: 0, out: 0 });
    }), c.edges().forEach((m) => {
      let _ = d.edge(m.v, m.w) || 0, E = u(m), w = _ + E;
      d.setEdge(m.v, m.w, w), p = Math.max(p, d.node(m.v).out += E), h = Math.max(h, d.node(m.w).in += E);
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
var la, sc;
function Ge() {
  if (sc) return la;
  sc = 1;
  let e = wt().Graph;
  la = {
    addBorderNode: u,
    addDummyNode: t,
    applyWithChunking: p,
    asNonCompoundGraph: i,
    buildLayerMatrix: s,
    intersectRect: a,
    mapValues: N,
    maxRank: v,
    normalizeRanks: l,
    notime: _,
    partition: g,
    pick: S,
    predecessorWeights: r,
    range: b,
    removeEmptyRanks: c,
    simplify: n,
    successorWeights: o,
    time: m,
    uniqueId: w,
    zipObject: V
  };
  function t(A, T, L, M) {
    for (var k = M; A.hasNode(k); )
      k = w(M);
    return L.dummy = T, A.setNode(k, L), k;
  }
  function n(A) {
    let T = new e().setGraph(A.graph());
    return A.nodes().forEach((L) => T.setNode(L, A.node(L))), A.edges().forEach((L) => {
      let M = T.edge(L.v, L.w) || { weight: 0, minlen: 1 }, k = A.edge(L);
      T.setEdge(L.v, L.w, {
        weight: M.weight + k.weight,
        minlen: Math.max(M.minlen, k.minlen)
      });
    }), T;
  }
  function i(A) {
    let T = new e({ multigraph: A.isMultigraph() }).setGraph(A.graph());
    return A.nodes().forEach((L) => {
      A.children(L).length || T.setNode(L, A.node(L));
    }), A.edges().forEach((L) => {
      T.setEdge(L, A.edge(L));
    }), T;
  }
  function o(A) {
    let T = A.nodes().map((L) => {
      let M = {};
      return A.outEdges(L).forEach((k) => {
        M[k.w] = (M[k.w] || 0) + A.edge(k).weight;
      }), M;
    });
    return V(A.nodes(), T);
  }
  function r(A) {
    let T = A.nodes().map((L) => {
      let M = {};
      return A.inEdges(L).forEach((k) => {
        M[k.v] = (M[k.v] || 0) + A.edge(k).weight;
      }), M;
    });
    return V(A.nodes(), T);
  }
  function a(A, T) {
    let L = A.x, M = A.y, k = T.x - L, B = T.y - M, y = A.width / 2, I = A.height / 2;
    if (!k && !B)
      throw new Error("Not possible to find intersection inside of the rectangle");
    let C, H;
    return Math.abs(B) * y > Math.abs(k) * I ? (B < 0 && (I = -I), C = I * k / B, H = I) : (k < 0 && (y = -y), C = y, H = y * B / k), { x: L + C, y: M + H };
  }
  function s(A) {
    let T = b(v(A) + 1).map(() => []);
    return A.nodes().forEach((L) => {
      let M = A.node(L), k = M.rank;
      k !== void 0 && (T[k][M.order] = L);
    }), T;
  }
  function l(A) {
    let T = A.nodes().map((M) => {
      let k = A.node(M).rank;
      return k === void 0 ? Number.MAX_VALUE : k;
    }), L = p(Math.min, T);
    A.nodes().forEach((M) => {
      let k = A.node(M);
      Object.hasOwn(k, "rank") && (k.rank -= L);
    });
  }
  function c(A) {
    let T = A.nodes().map((y) => A.node(y).rank), L = p(Math.min, T), M = [];
    A.nodes().forEach((y) => {
      let I = A.node(y).rank - L;
      M[I] || (M[I] = []), M[I].push(y);
    });
    let k = 0, B = A.graph().nodeRankFactor;
    Array.from(M).forEach((y, I) => {
      y === void 0 && I % B !== 0 ? --k : y !== void 0 && k && y.forEach((C) => A.node(C).rank += k);
    });
  }
  function u(A, T, L, M) {
    let k = {
      width: 0,
      height: 0
    };
    return arguments.length >= 4 && (k.rank = L, k.order = M), t(A, "border", k, T);
  }
  function d(A, T = h) {
    const L = [];
    for (let M = 0; M < A.length; M += T) {
      const k = A.slice(M, M + T);
      L.push(k);
    }
    return L;
  }
  const h = 65535;
  function p(A, T) {
    if (T.length > h) {
      const L = d(T);
      return A.apply(null, L.map((M) => A.apply(null, M)));
    } else
      return A.apply(null, T);
  }
  function v(A) {
    const L = A.nodes().map((M) => {
      let k = A.node(M).rank;
      return k === void 0 ? Number.MIN_VALUE : k;
    });
    return p(Math.max, L);
  }
  function g(A, T) {
    let L = { lhs: [], rhs: [] };
    return A.forEach((M) => {
      T(M) ? L.lhs.push(M) : L.rhs.push(M);
    }), L;
  }
  function m(A, T) {
    let L = Date.now();
    try {
      return T();
    } finally {
      console.log(A + " time: " + (Date.now() - L) + "ms");
    }
  }
  function _(A, T) {
    return T();
  }
  let E = 0;
  function w(A) {
    var T = ++E;
    return A + ("" + T);
  }
  function b(A, T, L = 1) {
    T == null && (T = A, A = 0);
    let M = (B) => B < T;
    L < 0 && (M = (B) => T < B);
    const k = [];
    for (let B = A; M(B); B += L)
      k.push(B);
    return k;
  }
  function S(A, T) {
    const L = {};
    for (const M of T)
      A[M] !== void 0 && (L[M] = A[M]);
    return L;
  }
  function N(A, T) {
    let L = T;
    return typeof T == "string" && (L = (M) => M[T]), Object.entries(A).reduce((M, [k, B]) => (M[k] = L(B, k), M), {});
  }
  function V(A, T) {
    return A.reduce((L, M, k) => (L[M] = T[k], L), {});
  }
  return la;
}
var ua, lc;
function NS() {
  if (lc) return ua;
  lc = 1;
  let e = CS(), t = Ge().uniqueId;
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
var ca, uc;
function IS() {
  if (uc) return ca;
  uc = 1;
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
var da, cc;
function Bi() {
  if (cc) return da;
  cc = 1;
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
var fa, dc;
function qh() {
  if (dc) return fa;
  dc = 1;
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
var ha, fc;
function AS() {
  if (fc) return ha;
  fc = 1;
  var e = qh(), t = Bi().slack, n = Bi().longestPath, i = wt().alg.preorder, o = wt().alg.postorder, r = Ge().simplify;
  ha = a, a.initLowLimValues = u, a.initCutValues = s, a.calcCutValue = c, a.leaveEdge = h, a.enterEdge = p, a.exchangeEdges = v;
  function a(E) {
    E = r(E), n(E);
    var w = e(E);
    u(w), s(w, E);
    for (var b, S; b = h(w); )
      S = p(w, E, b), v(w, E, b, S);
  }
  function s(E, w) {
    var b = o(E, E.nodes());
    b = b.slice(0, b.length - 1), b.forEach((S) => l(E, w, S));
  }
  function l(E, w, b) {
    var S = E.node(b), N = S.parent;
    E.edge(b, N).cutvalue = c(E, w, b);
  }
  function c(E, w, b) {
    var S = E.node(b), N = S.parent, V = !0, A = w.edge(b, N), T = 0;
    return A || (V = !1, A = w.edge(N, b)), T = A.weight, w.nodeEdges(b).forEach((L) => {
      var M = L.v === b, k = M ? L.w : L.v;
      if (k !== N) {
        var B = M === V, y = w.edge(L).weight;
        if (T += B ? y : -y, m(E, b, k)) {
          var I = E.edge(b, k).cutvalue;
          T += B ? -I : I;
        }
      }
    }), T;
  }
  function u(E, w) {
    arguments.length < 2 && (w = E.nodes()[0]), d(E, {}, 1, w);
  }
  function d(E, w, b, S, N) {
    var V = b, A = E.node(S);
    return w[S] = !0, E.neighbors(S).forEach((T) => {
      Object.hasOwn(w, T) || (b = d(E, w, b, T, S));
    }), A.low = V, A.lim = b++, N ? A.parent = N : delete A.parent, b;
  }
  function h(E) {
    return E.edges().find((w) => E.edge(w).cutvalue < 0);
  }
  function p(E, w, b) {
    var S = b.v, N = b.w;
    w.hasEdge(S, N) || (S = b.w, N = b.v);
    var V = E.node(S), A = E.node(N), T = V, L = !1;
    V.lim > A.lim && (T = A, L = !0);
    var M = w.edges().filter((k) => L === _(E, E.node(k.v), T) && L !== _(E, E.node(k.w), T));
    return M.reduce((k, B) => t(w, B) < t(w, k) ? B : k);
  }
  function v(E, w, b, S) {
    var N = b.v, V = b.w;
    E.removeEdge(N, V), E.setEdge(S.v, S.w, {}), u(E), s(E, w), g(E, w);
  }
  function g(E, w) {
    var b = E.nodes().find((N) => !w.node(N).parent), S = i(E, b);
    S = S.slice(1), S.forEach((N) => {
      var V = E.node(N).parent, A = w.edge(N, V), T = !1;
      A || (A = w.edge(V, N), T = !0), w.node(N).rank = w.node(V).rank + (T ? A.minlen : -A.minlen);
    });
  }
  function m(E, w, b) {
    return E.hasEdge(w, b);
  }
  function _(E, w, b) {
    return b.low <= w.lim && w.lim <= b.lim;
  }
  return ha;
}
var pa, hc;
function TS() {
  if (hc) return pa;
  hc = 1;
  var e = Bi(), t = e.longestPath, n = qh(), i = AS();
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
var va, pc;
function MS() {
  if (pc) return va;
  pc = 1, va = e;
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
var ma, vc;
function OS() {
  if (vc) return ma;
  vc = 1;
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
    a.setParent(v, h), m.borderTop = v, a.setParent(g, h), m.borderBottom = g, p.forEach((_) => {
      n(a, s, l, c, u, d, _);
      let E = a.node(_), w = E.borderTop ? E.borderTop : _, b = E.borderBottom ? E.borderBottom : _, S = E.borderTop ? c : 2 * c, N = w !== b ? 1 : u - d[h] + 1;
      a.setEdge(v, w, {
        weight: S,
        minlen: N,
        nestingEdge: !0
      }), a.setEdge(b, g, {
        weight: S,
        minlen: N,
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
var ga, mc;
function RS() {
  if (mc) return ga;
  mc = 1;
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
var ya, gc;
function DS() {
  if (gc) return ya;
  gc = 1, ya = {
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
var wa, yc;
function PS() {
  if (yc) return wa;
  yc = 1;
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
var ba, wc;
function LS() {
  if (wc) return ba;
  wc = 1;
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
var _a, bc;
function zS() {
  if (bc) return _a;
  bc = 1, _a = e;
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
var ka, _c;
function VS() {
  if (_c) return ka;
  _c = 1;
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
var Ea, kc;
function BS() {
  if (kc) return Ea;
  kc = 1;
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
var xa, Ec;
function FS() {
  if (Ec) return xa;
  Ec = 1;
  let e = zS(), t = VS(), n = BS();
  xa = i;
  function i(a, s, l, c) {
    let u = a.children(s), d = a.node(s), h = d ? d.borderLeft : void 0, p = d ? d.borderRight : void 0, v = {};
    h && (u = u.filter((E) => E !== h && E !== p));
    let g = e(a, u);
    g.forEach((E) => {
      if (a.children(E.v).length) {
        let w = i(a, E.v, l, c);
        v[E.v] = w, Object.hasOwn(w, "barycenter") && r(E, w);
      }
    });
    let m = t(g, l);
    o(m, v);
    let _ = n(m, c);
    if (h && (_.vs = [h, _.vs, p].flat(!0), a.predecessors(h).length)) {
      let E = a.node(a.predecessors(h)[0]), w = a.node(a.predecessors(p)[0]);
      Object.hasOwn(_, "barycenter") || (_.barycenter = 0, _.weight = 0), _.barycenter = (_.barycenter * _.weight + E.order + w.order) / (_.weight + 2), _.weight += 2;
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
var $a, xc;
function HS() {
  if (xc) return $a;
  xc = 1;
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
var Sa, $c;
function qS() {
  if ($c) return Sa;
  $c = 1, Sa = e;
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
var Ca, Sc;
function US() {
  if (Sc) return Ca;
  Sc = 1;
  let e = PS(), t = LS(), n = FS(), i = HS(), o = qS(), r = wt().Graph, a = Ge();
  Ca = s;
  function s(d, h) {
    if (h && typeof h.customOrder == "function") {
      h.customOrder(d, s);
      return;
    }
    let p = a.maxRank(d), v = l(d, a.range(1, p + 1), "inEdges"), g = l(d, a.range(p - 1, -1, -1), "outEdges"), m = e(d);
    if (u(d, m), h && h.disableOptimalOrderHeuristic)
      return;
    let _ = Number.POSITIVE_INFINITY, E;
    for (let w = 0, b = 0; b < 4; ++w, ++b) {
      c(w % 2 ? v : g, w % 4 >= 2), m = a.buildLayerMatrix(d);
      let S = t(d, m);
      S < _ && (b = 0, E = Object.assign({}, m), _ = S);
    }
    u(d, E);
  }
  function l(d, h, p) {
    const v = /* @__PURE__ */ new Map(), g = (m, _) => {
      v.has(m) || v.set(m, []), v.get(m).push(_);
    };
    for (const m of d.nodes()) {
      const _ = d.node(m);
      if (typeof _.rank == "number" && g(_.rank, m), typeof _.minRank == "number" && typeof _.maxRank == "number")
        for (let E = _.minRank; E <= _.maxRank; E++)
          E !== _.rank && g(E, m);
    }
    return h.map(function(m) {
      return i(d, m, p, v.get(m) || []);
    });
  }
  function c(d, h) {
    let p = new r();
    d.forEach(function(v) {
      let g = v.graph().root, m = n(v, g, p, h);
      m.vs.forEach((_, E) => v.node(_).order = E), o(v, p, m.vs);
    });
  }
  function u(d, h) {
    Object.values(h).forEach((p) => p.forEach((v, g) => d.node(v).order = g));
  }
  return Ca;
}
var Na, Cc;
function WS() {
  if (Cc) return Na;
  Cc = 1;
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
  function n(m, _) {
    let E = {};
    function w(b, S) {
      let N = 0, V = 0, A = b.length, T = S[S.length - 1];
      return S.forEach((L, M) => {
        let k = o(m, L), B = k ? m.node(k).order : A;
        (k || L === T) && (S.slice(V, M + 1).forEach((y) => {
          m.predecessors(y).forEach((I) => {
            let C = m.node(I), H = C.order;
            (H < N || B < H) && !(C.dummy && m.node(y).dummy) && r(E, I, y);
          });
        }), V = M + 1, N = B);
      }), S;
    }
    return _.length && _.reduce(w), E;
  }
  function i(m, _) {
    let E = {};
    function w(S, N, V, A, T) {
      let L;
      t.range(N, V).forEach((M) => {
        L = S[M], m.node(L).dummy && m.predecessors(L).forEach((k) => {
          let B = m.node(k);
          B.dummy && (B.order < A || B.order > T) && r(E, k, L);
        });
      });
    }
    function b(S, N) {
      let V = -1, A, T = 0;
      return N.forEach((L, M) => {
        if (m.node(L).dummy === "border") {
          let k = m.predecessors(L);
          k.length && (A = m.node(k[0]).order, w(N, T, M, V, A), T = M, V = A);
        }
        w(N, T, N.length, A, S.length);
      }), N;
    }
    return _.length && _.reduce(b), E;
  }
  function o(m, _) {
    if (m.node(_).dummy)
      return m.predecessors(_).find((E) => m.node(E).dummy);
  }
  function r(m, _, E) {
    if (_ > E) {
      let b = _;
      _ = E, E = b;
    }
    let w = m[_];
    w || (m[_] = w = {}), w[E] = !0;
  }
  function a(m, _, E) {
    if (_ > E) {
      let w = _;
      _ = E, E = w;
    }
    return !!m[_] && Object.hasOwn(m[_], E);
  }
  function s(m, _, E, w) {
    let b = {}, S = {}, N = {};
    return _.forEach((V) => {
      V.forEach((A, T) => {
        b[A] = A, S[A] = A, N[A] = T;
      });
    }), _.forEach((V) => {
      let A = -1;
      V.forEach((T) => {
        let L = w(T);
        if (L.length) {
          L = L.sort((k, B) => N[k] - N[B]);
          let M = (L.length - 1) / 2;
          for (let k = Math.floor(M), B = Math.ceil(M); k <= B; ++k) {
            let y = L[k];
            S[T] === T && A < N[y] && !a(E, T, y) && (S[y] = T, S[T] = b[T] = b[y], A = N[y]);
          }
        }
      });
    }), { root: b, align: S };
  }
  function l(m, _, E, w, b) {
    let S = {}, N = c(m, _, E, b), V = b ? "borderLeft" : "borderRight";
    function A(M, k) {
      let B = N.nodes(), y = B.pop(), I = {};
      for (; y; )
        I[y] ? M(y) : (I[y] = !0, B.push(y), B = B.concat(k(y))), y = B.pop();
    }
    function T(M) {
      S[M] = N.inEdges(M).reduce((k, B) => Math.max(k, S[B.v] + N.edge(B)), 0);
    }
    function L(M) {
      let k = N.outEdges(M).reduce((y, I) => Math.min(y, S[I.w] - N.edge(I)), Number.POSITIVE_INFINITY), B = m.node(M);
      k !== Number.POSITIVE_INFINITY && B.borderType !== V && (S[M] = Math.max(S[M], k));
    }
    return A(T, N.predecessors.bind(N)), A(L, N.successors.bind(N)), Object.keys(w).forEach((M) => S[M] = S[E[M]]), S;
  }
  function c(m, _, E, w) {
    let b = new e(), S = m.graph(), N = v(S.nodesep, S.edgesep, w);
    return _.forEach((V) => {
      let A;
      V.forEach((T) => {
        let L = E[T];
        if (b.setNode(L), A) {
          var M = E[A], k = b.edge(M, L);
          b.setEdge(M, L, Math.max(N(m, T, A), k || 0));
        }
        A = T;
      });
    }), b;
  }
  function u(m, _) {
    return Object.values(_).reduce((E, w) => {
      let b = Number.NEGATIVE_INFINITY, S = Number.POSITIVE_INFINITY;
      Object.entries(w).forEach(([V, A]) => {
        let T = g(m, V) / 2;
        b = Math.max(A + T, b), S = Math.min(A - T, S);
      });
      const N = b - S;
      return N < E[0] && (E = [N, w]), E;
    }, [Number.POSITIVE_INFINITY, null])[1];
  }
  function d(m, _) {
    let E = Object.values(_), w = t.applyWithChunking(Math.min, E), b = t.applyWithChunking(Math.max, E);
    ["u", "d"].forEach((S) => {
      ["l", "r"].forEach((N) => {
        let V = S + N, A = m[V];
        if (A === _) return;
        let T = Object.values(A), L = w - t.applyWithChunking(Math.min, T);
        N !== "l" && (L = b - t.applyWithChunking(Math.max, T)), L && (m[V] = t.mapValues(A, (M) => M + L));
      });
    });
  }
  function h(m, _) {
    return t.mapValues(m.ul, (E, w) => {
      if (_)
        return m[_.toLowerCase()][w];
      {
        let b = Object.values(m).map((S) => S[w]).sort((S, N) => S - N);
        return (b[1] + b[2]) / 2;
      }
    });
  }
  function p(m) {
    let _ = t.buildLayerMatrix(m), E = Object.assign(
      n(m, _),
      i(m, _)
    ), w = {}, b;
    ["u", "d"].forEach((N) => {
      b = N === "u" ? _ : Object.values(_).reverse(), ["l", "r"].forEach((V) => {
        V === "r" && (b = b.map((M) => Object.values(M).reverse()));
        let A = (N === "u" ? m.predecessors : m.successors).bind(m), T = s(m, b, E, A), L = l(
          m,
          b,
          T.root,
          T.align,
          V === "r"
        );
        V === "r" && (L = t.mapValues(L, (M) => -M)), w[N + V] = L;
      });
    });
    let S = u(m, w);
    return d(w, S), h(w, m.graph().align);
  }
  function v(m, _, E) {
    return (w, b, S) => {
      let N = w.node(b), V = w.node(S), A = 0, T;
      if (A += N.width / 2, Object.hasOwn(N, "labelpos"))
        switch (N.labelpos.toLowerCase()) {
          case "l":
            T = -N.width / 2;
            break;
          case "r":
            T = N.width / 2;
            break;
        }
      if (T && (A += E ? T : -T), T = 0, A += (N.dummy ? _ : m) / 2, A += (V.dummy ? _ : m) / 2, A += V.width / 2, Object.hasOwn(V, "labelpos"))
        switch (V.labelpos.toLowerCase()) {
          case "l":
            T = V.width / 2;
            break;
          case "r":
            T = -V.width / 2;
            break;
        }
      return T && (A += E ? T : -T), T = 0, A;
    };
  }
  function g(m, _) {
    return m.node(_).width;
  }
  return Na;
}
var Ia, Nc;
function YS() {
  if (Nc) return Ia;
  Nc = 1;
  let e = Ge(), t = WS().positionX;
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
var Aa, Ic;
function GS() {
  if (Ic) return Aa;
  Ic = 1;
  let e = NS(), t = IS(), n = TS(), i = Ge().normalizeRanks, o = MS(), r = Ge().removeEmptyRanks, a = OS(), s = RS(), l = DS(), c = US(), u = YS(), d = Ge(), h = wt().Graph;
  Aa = p;
  function p(G, J) {
    let K = J && J.debugTiming ? d.time : d.notime;
    K("layout", () => {
      let X = K("  buildLayoutGraph", () => A(G));
      K("  runLayout", () => v(X, K, J)), K("  updateInputGraph", () => g(G, X));
    });
  }
  function v(G, J, K) {
    J("    makeSpaceForEdgeLabels", () => T(G)), J("    removeSelfEdges", () => F(G)), J("    acyclic", () => e.run(G)), J("    nestingGraph.run", () => a.run(G)), J("    rank", () => n(d.asNonCompoundGraph(G))), J("    injectEdgeLabelProxies", () => L(G)), J("    removeEmptyRanks", () => r(G)), J("    nestingGraph.cleanup", () => a.cleanup(G)), J("    normalizeRanks", () => i(G)), J("    assignRankMinMax", () => M(G)), J("    removeEdgeLabelProxies", () => k(G)), J("    normalize.run", () => t.run(G)), J("    parentDummyChains", () => o(G)), J("    addBorderSegments", () => s(G)), J("    order", () => c(G, K)), J("    insertSelfEdges", () => q(G)), J("    adjustCoordinateSystem", () => l.adjust(G)), J("    position", () => u(G)), J("    positionSelfEdges", () => U(G)), J("    removeBorderNodes", () => H(G)), J("    normalize.undo", () => t.undo(G)), J("    fixupEdgeLabelCoords", () => I(G)), J("    undoCoordinateSystem", () => l.undo(G)), J("    translateGraph", () => B(G)), J("    assignNodeIntersects", () => y(G)), J("    reversePoints", () => C(G)), J("    acyclic.undo", () => e.undo(G));
  }
  function g(G, J) {
    G.nodes().forEach((K) => {
      let X = G.node(K), oe = J.node(K);
      X && (X.x = oe.x, X.y = oe.y, X.rank = oe.rank, J.children(K).length && (X.width = oe.width, X.height = oe.height));
    }), G.edges().forEach((K) => {
      let X = G.edge(K), oe = J.edge(K);
      X.points = oe.points, Object.hasOwn(oe, "x") && (X.x = oe.x, X.y = oe.y);
    }), G.graph().width = J.graph().width, G.graph().height = J.graph().height;
  }
  let m = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"], _ = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" }, E = ["acyclicer", "ranker", "rankdir", "align"], w = ["width", "height", "rank"], b = { width: 0, height: 0 }, S = ["minlen", "weight", "width", "height", "labeloffset"], N = {
    minlen: 1,
    weight: 1,
    width: 0,
    height: 0,
    labeloffset: 10,
    labelpos: "r"
  }, V = ["labelpos"];
  function A(G) {
    let J = new h({ multigraph: !0, compound: !0 }), K = ue(G.graph());
    return J.setGraph(Object.assign(
      {},
      _,
      ne(K, m),
      d.pick(K, E)
    )), G.nodes().forEach((X) => {
      let oe = ue(G.node(X));
      const le = ne(oe, w);
      Object.keys(b).forEach((fe) => {
        le[fe] === void 0 && (le[fe] = b[fe]);
      }), J.setNode(X, le), J.setParent(X, G.parent(X));
    }), G.edges().forEach((X) => {
      let oe = ue(G.edge(X));
      J.setEdge(X, Object.assign(
        {},
        N,
        ne(oe, S),
        d.pick(oe, V)
      ));
    }), J;
  }
  function T(G) {
    let J = G.graph();
    J.ranksep /= 2, G.edges().forEach((K) => {
      let X = G.edge(K);
      X.minlen *= 2, X.labelpos.toLowerCase() !== "c" && (J.rankdir === "TB" || J.rankdir === "BT" ? X.width += X.labeloffset : X.height += X.labeloffset);
    });
  }
  function L(G) {
    G.edges().forEach((J) => {
      let K = G.edge(J);
      if (K.width && K.height) {
        let X = G.node(J.v), le = { rank: (G.node(J.w).rank - X.rank) / 2 + X.rank, e: J };
        d.addDummyNode(G, "edge-proxy", le, "_ep");
      }
    });
  }
  function M(G) {
    let J = 0;
    G.nodes().forEach((K) => {
      let X = G.node(K);
      X.borderTop && (X.minRank = G.node(X.borderTop).rank, X.maxRank = G.node(X.borderBottom).rank, J = Math.max(J, X.maxRank));
    }), G.graph().maxRank = J;
  }
  function k(G) {
    G.nodes().forEach((J) => {
      let K = G.node(J);
      K.dummy === "edge-proxy" && (G.edge(K.e).labelRank = K.rank, G.removeNode(J));
    });
  }
  function B(G) {
    let J = Number.POSITIVE_INFINITY, K = 0, X = Number.POSITIVE_INFINITY, oe = 0, le = G.graph(), fe = le.marginx || 0, _e = le.marginy || 0;
    function $e(me) {
      let ge = me.x, P = me.y, O = me.width, D = me.height;
      J = Math.min(J, ge - O / 2), K = Math.max(K, ge + O / 2), X = Math.min(X, P - D / 2), oe = Math.max(oe, P + D / 2);
    }
    G.nodes().forEach((me) => $e(G.node(me))), G.edges().forEach((me) => {
      let ge = G.edge(me);
      Object.hasOwn(ge, "x") && $e(ge);
    }), J -= fe, X -= _e, G.nodes().forEach((me) => {
      let ge = G.node(me);
      ge.x -= J, ge.y -= X;
    }), G.edges().forEach((me) => {
      let ge = G.edge(me);
      ge.points.forEach((P) => {
        P.x -= J, P.y -= X;
      }), Object.hasOwn(ge, "x") && (ge.x -= J), Object.hasOwn(ge, "y") && (ge.y -= X);
    }), le.width = K - J + fe, le.height = oe - X + _e;
  }
  function y(G) {
    G.edges().forEach((J) => {
      let K = G.edge(J), X = G.node(J.v), oe = G.node(J.w), le, fe;
      K.points ? (le = K.points[0], fe = K.points[K.points.length - 1]) : (K.points = [], le = oe, fe = X), K.points.unshift(d.intersectRect(X, le)), K.points.push(d.intersectRect(oe, fe));
    });
  }
  function I(G) {
    G.edges().forEach((J) => {
      let K = G.edge(J);
      if (Object.hasOwn(K, "x"))
        switch ((K.labelpos === "l" || K.labelpos === "r") && (K.width -= K.labeloffset), K.labelpos) {
          case "l":
            K.x -= K.width / 2 + K.labeloffset;
            break;
          case "r":
            K.x += K.width / 2 + K.labeloffset;
            break;
        }
    });
  }
  function C(G) {
    G.edges().forEach((J) => {
      let K = G.edge(J);
      K.reversed && K.points.reverse();
    });
  }
  function H(G) {
    G.nodes().forEach((J) => {
      if (G.children(J).length) {
        let K = G.node(J), X = G.node(K.borderTop), oe = G.node(K.borderBottom), le = G.node(K.borderLeft[K.borderLeft.length - 1]), fe = G.node(K.borderRight[K.borderRight.length - 1]);
        K.width = Math.abs(fe.x - le.x), K.height = Math.abs(oe.y - X.y), K.x = le.x + K.width / 2, K.y = X.y + K.height / 2;
      }
    }), G.nodes().forEach((J) => {
      G.node(J).dummy === "border" && G.removeNode(J);
    });
  }
  function F(G) {
    G.edges().forEach((J) => {
      if (J.v === J.w) {
        var K = G.node(J.v);
        K.selfEdges || (K.selfEdges = []), K.selfEdges.push({ e: J, label: G.edge(J) }), G.removeEdge(J);
      }
    });
  }
  function q(G) {
    var J = d.buildLayerMatrix(G);
    J.forEach((K) => {
      var X = 0;
      K.forEach((oe, le) => {
        var fe = G.node(oe);
        fe.order = le + X, (fe.selfEdges || []).forEach((_e) => {
          d.addDummyNode(G, "selfedge", {
            width: _e.label.width,
            height: _e.label.height,
            rank: fe.rank,
            order: le + ++X,
            e: _e.e,
            label: _e.label
          }, "_se");
        }), delete fe.selfEdges;
      });
    });
  }
  function U(G) {
    G.nodes().forEach((J) => {
      var K = G.node(J);
      if (K.dummy === "selfedge") {
        var X = G.node(K.e.v), oe = X.x + X.width / 2, le = X.y, fe = K.x - oe, _e = X.height / 2;
        G.setEdge(K.e, K.label), G.removeNode(J), K.label.points = [
          { x: oe + 2 * fe / 3, y: le - _e },
          { x: oe + 5 * fe / 6, y: le - _e },
          { x: oe + fe, y: le },
          { x: oe + 5 * fe / 6, y: le + _e },
          { x: oe + 2 * fe / 3, y: le + _e }
        ], K.label.x = K.x, K.label.y = K.y;
      }
    });
  }
  function ne(G, J) {
    return d.mapValues(d.pick(G, J), Number);
  }
  function ue(G) {
    var J = {};
    return G && Object.entries(G).forEach(([K, X]) => {
      typeof K == "string" && (K = K.toLowerCase()), J[K] = X;
    }), J;
  }
  return Aa;
}
var Ta, Ac;
function jS() {
  if (Ac) return Ta;
  Ac = 1;
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
var Ma, Tc;
function XS() {
  return Tc || (Tc = 1, Ma = "1.1.8"), Ma;
}
var Oa, Mc;
function KS() {
  return Mc || (Mc = 1, Oa = {
    graphlib: wt(),
    layout: GS(),
    debug: jS(),
    util: {
      time: Ge().time,
      notime: Ge().notime
    },
    version: XS()
  }), Oa;
}
var ZS = KS();
const Oc = /* @__PURE__ */ hS(ZS), Zo = 26, Rc = 26, JS = 120;
function Uh(e) {
  const t = [{ id: "result", label: "Finished" }];
  return (e.child_interface?.error_schema != null || e.error_schema != null) && t.push({ id: "failed", label: "Failed" }), t;
}
function dr(e) {
  if (!Sd(e.kind)) return !1;
  const n = (e.config || {}).flow_ref;
  if (!n || typeof n != "object" || Array.isArray(n)) return !1;
  const i = n;
  return i.kind === "flow" && typeof i.id == "string" && i.id.length > 0 && typeof i.version == "number" && Number.isInteger(i.version) && i.version > 0;
}
function Rn(e) {
  return dr(e) ? Uh(e).filter((t) => t.id !== Nt.id) : Ji(e.kind, e.ref).filter((t) => t.id !== Nt.id);
}
function QS(e) {
  return (dr(e) ? void 0 : bi(e.kind, e.ref).continuation) || Rn(e)[0]?.id || void 0;
}
function sl(e) {
  return dr(e) ? Uh(e).some((t) => t.id === Nt.id) : Ji(e.kind, e.ref).some((t) => t.id === Nt.id);
}
function pn(e) {
  const t = Rn(e);
  return eh(t, sl(e));
}
function Wh(e) {
  return !!e && Number.isFinite(e.x) && Number.isFinite(e.y);
}
function ds(e, t, n, i) {
  const o = e.positions[t];
  return Wh(o) ? o : i[t] ? i[t] : { x: 60 + n % 4 * 280, y: 60 + Math.floor(n / 4) * 170 };
}
function Nn(e, t = "TB") {
  const i = Object.keys(e.nodes).some((r) => !Wh(e.positions[r])) ? Gh(e, t) : {}, o = {};
  return Object.values(e.nodes).forEach((r, a) => {
    o[r.id] = ds(e, r.id, a, i);
  }), o;
}
function eC(e) {
  const t = {};
  for (const n of Object.values(e.edges)) (t[n.source_id] ||= []).push(n);
  return t;
}
function tC(e, t, n) {
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
    y: o - Zo - Rc,
    width: r - i + Zo * 2,
    height: a - o + Zo * 2 + Rc
  };
}
function fr(e, t, n) {
  const i = n || eC(e), o = {}, r = [], a = Object.values(e.nodes).filter((s) => wi(s.kind) || s.kind === "cycle").map((s) => s.id).sort();
  for (const s of a) {
    const l = [], c = /* @__PURE__ */ new Set(), u = (i[s] || []).filter((d) => d.source_port === "body").map((d) => d.target_id);
    for (; u.length; ) {
      const d = u.pop();
      if (!(d === s || c.has(d) || !e.nodes[d]) && (c.add(d), !o[d])) {
        o[d] = s, l.push(d);
        for (const h of i[d] || []) u.push(h.target_id);
      }
    }
    l.length && r.push({ id: s, kind: e.nodes[s].kind, members: l, box: tC(e, l, t) });
  }
  return { containers: r, parentOf: o };
}
function nC(e, t, n, i, o, r = JS) {
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
function oC(e, t, n, i = { width: yo, height: Ao }) {
  const o = Math.max(n.x, n.x + n.width - i.width), r = Math.max(n.y, n.y + n.height - i.height);
  return {
    x: Math.min(Math.max(e, n.x), o),
    y: Math.min(Math.max(t, n.y), r)
  };
}
function Yh(e, t, n, i) {
  const { containers: o } = fr(e, n, i);
  let r = null;
  for (const a of o) {
    const s = a.box;
    t.x < s.x || t.x > s.x + s.width || t.y < s.y || t.y > s.y + s.height || (!r || s.width * s.height < r.box.width * r.box.height) && (r = a);
  }
  return r?.id ?? null;
}
function iC(e, t) {
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
function Gh(e, t, n) {
  const i = Object.keys(e.nodes);
  if (!i.length) return {};
  const o = {}, r = iC(e, i).map((p) => {
    const v = new Set(p), g = new Oc.graphlib.Graph();
    g.setGraph({ rankdir: t, nodesep: 48, ranksep: 84, marginx: 0, marginy: 0 }), g.setDefaultEdgeLabel(() => ({}));
    for (const N of p) g.setNode(N, pn(e.nodes[N]));
    const m = /* @__PURE__ */ new Set();
    for (const N of Object.values(e.edges)) {
      if (!v.has(N.source_id) || !v.has(N.target_id)) continue;
      const V = `${N.source_id}->${N.target_id}`;
      m.has(V) || (m.add(V), g.setEdge(N.source_id, N.target_id));
    }
    Oc.layout(g);
    let _ = 1 / 0, E = 1 / 0, w = -1 / 0, b = -1 / 0;
    const S = {};
    for (const N of p) {
      const V = g.node(N);
      if (!V) continue;
      const A = V.x - V.width / 2, T = V.y - V.height / 2;
      S[N] = { x: A, y: T }, _ = Math.min(_, A), E = Math.min(E, T), w = Math.max(w, A + V.width), b = Math.max(b, T + V.height);
    }
    for (const N of Object.values(S))
      N.x -= _, N.y -= E;
    return { ids: p, local: S, width: w - _, height: b - E };
  }), a = Math.max(0.01, n?.minZoom || 1), s = Math.max(Pi, (n?.width || 1200) / a - 80), l = Math.max(Ao, (n?.height || 800) / a - 80), c = s <= Pi + 8 ? 6 : Math.max(12, Math.min(48, Math.floor(Math.min(s, l) * 0.04)));
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
const rC = 200, aC = 120, sC = 420, lC = 280;
function uC(e) {
  const t = e.child_interface, n = t?.input_schema ?? e.input_schema, i = t?.output_schema ?? e.output_schema;
  if (!(n == null && i == null))
    return `${Ol(n)} → ${Ol(i)}`;
}
function jh(e, t, n = "TB", i, o = !1) {
  const r = [], a = Object.values(e.nodes), s = Nn(e, n), l = {};
  for (const v of Object.values(e.edges)) (l[v.source_id] ||= []).push(v);
  const c = Object.values(e.notes);
  c.forEach((v, g) => {
    if (v.kind !== "frame") return;
    const m = ds(e, v.id, g, {}), _ = m.width || v.width || sC, E = m.height || v.height || lC;
    r.push({
      id: v.id,
      type: "wfFrame",
      ariaLabel: `Frame: ${v.text || "Untitled frame"}`,
      focusable: !0,
      position: { x: m.x, y: m.y },
      data: { text: v.text, kind: "frame", width: _, height: E, color: v.color },
      zIndex: 0,
      style: { width: `${_}px`, height: `${E}px` }
    });
  });
  const { containers: u } = fr(e, s, l);
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
  c.forEach((v, g) => {
    if (v.kind === "frame") return;
    const m = ds(e, v.id, g, {}), _ = m.width || v.width || rC, E = m.height || v.height || aC;
    r.push({
      id: v.id,
      type: "wfNote",
      ariaLabel: `Note: ${v.text || "Empty note"}`,
      focusable: !0,
      position: { x: m.x, y: m.y },
      data: { text: v.text, kind: "note", width: _, height: E, color: v.color },
      zIndex: 0,
      style: { width: `${_}px`, height: `${E}px` }
    });
  });
  const d = {};
  a.forEach((v) => {
    const g = bi(v.kind, v.ref), m = s[v.id], _ = Ss(v.kind) ? v.kind : void 0, E = !!_ || v.pinned === !0 || !!v.boundary, w = dr(v), b = Rn(v), S = sl(v), N = S && (l[v.id] || []).some((T) => Fa(T.source_port)), V = Je(v.title, v.ref), A = t?.node[v.id] || "idle";
    d[v.id] = cC(b, _, S), r.push({
      id: v.id,
      type: "wfNode",
      ariaLabel: `${g.label} step: ${V}${A === "idle" ? "" : `, status ${A}`}`,
      focusable: !0,
      position: { x: m.x, y: m.y },
      zIndex: 1,
      data: {
        kind: v.kind,
        kindLabel: g.label,
        title: V,
        ref: v.ref_label || v.ref || "",
        icon: v.icon || g.icon,
        hueVar: g.hueVar,
        runStatus: A,
        outPorts: b,
        failedPort: S,
        failedWired: N,
        pinned: E,
        boundaryRole: _,
        awaitingLabel: "Waiting",
        awaitingIcon: "tabler:hourglass",
        sub: w ? uC(v) : void 0,
        issue: i?.get(v.id)
      }
    });
  });
  const h = new Set(a.map((v) => v.id)), p = [];
  for (const v of Object.values(e.edges)) {
    if (!h.has(v.source_id) || !h.has(v.target_id)) continue;
    const g = e.nodes[v.source_id], m = e.nodes[v.target_id], _ = Cs(e, v), E = Qi(m), w = Ns(m, E), b = !v.transform && dS(_, E) === "needs-mapping", S = fS(v, E, _), N = Je(g.title, g.ref), V = Je(m.title, m.ref), A = Fa(v.source_port) ? "Failed" : Rn(g).find((L) => L.id === (v.source_port || ""))?.label, T = `Connection from ${N}${A ? `, ${A} output` : ""} to ${V}`;
    p.push(dC(
      v,
      t,
      !o && b,
      o ? [] : S.unmappedRequired,
      n,
      {
        sources: d[v.source_id]?.sources,
        targets: d[v.target_id]?.targets
      },
      !o && w,
      T
    ));
  }
  return { flowNodes: r, flowEdges: p };
}
function cC(e, t, n = !1) {
  const i = t === "start" ? [] : ["in-top", "in-left"], o = e.length > 1 || (e[0]?.id ?? "") !== "", r = t !== "finish" && t !== "error", a = r ? o ? e.map((s) => s.id) : ["out-bottom", "out-right"] : [];
  return r && n && a.push(Nt.id), { sources: a, targets: i };
}
function Dc(e, t, n) {
  const i = e || n;
  return !t || t.includes(i) ? i : t.includes(n) ? n : t[0] ?? n;
}
function dC(e, t, n = !1, i = [], o = "TB", r, a = !1, s) {
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
  return d.sourceHandle = Dc(
    e.source_port,
    r?.sources,
    o === "LR" ? "out-right" : "out-bottom"
  ), d.targetHandle = Dc(
    e.target_port,
    r?.targets,
    o === "LR" ? "in-left" : "in-top"
  ), d;
}
function Fi(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function fC(e) {
  const t = e.match === "exact" ? "the names match" : `“${e.sourceName}” is the same field name`, n = e.typed ? "the types are compatible" : "the upstream type isn’t declared, so type wasn’t checked";
  return `${e.title} ← ${e.expr} · ${t} and ${n}.`;
}
function hC(e, t) {
  return xh(e, t).map((i) => ({ name: i.name, expr: i.expr, type: i.type || "any" }));
}
function Pc(e, t) {
  const n = Fi(e.key), i = e.type || "any";
  return t.filter((o) => Fi(o.name) === n && nl(o.type, i));
}
function pC(e, t) {
  const n = Fi(e.key);
  return t.some((o) => Fi(o.name) === n) ? "type" : "none";
}
function vC(e, t) {
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
    why: fC({ title: e.title || e.key, expr: t.expr, sourceName: t.name, match: n, typed: i })
  };
}
function mC(e, t, n = "output") {
  const i = To(t);
  if (!i.length || !Vn(t))
    return { status: "skip", fields: [], transform: "", unresolved: [] };
  const o = hC(e, n), r = [], a = [];
  for (const l of i) {
    const c = Pc(l, o);
    if (c.length === 1) {
      a.push(vC(l, c[0]));
      continue;
    }
    if (l.required) {
      const u = c.length > 1 ? "multiple" : pC(l, o);
      r.push({
        key: l.key,
        title: l.title || l.key,
        reason: u,
        candidates: (c.length > 1 ? c : Pc(l, o)).map((d) => d.expr)
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
function gC(e, t) {
  const n = e.nodes[t];
  return n ? Ji(n.kind, n.ref).some((o) => o.id === "failed") : !1;
}
function yC(e, t, n, i = mt) {
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
    return !n.available || !r || !gC(e, r.id) ? null : {
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
function wC(e, t, n) {
  const i = t.source, o = t.target;
  if (!i || !o) return null;
  const r = Nn(e, n), { parentOf: a } = fr(e, r), s = t.sourceHandle === "body" ? i : a[i];
  if (!s || a[o] === s || Yh(e, r[o], r) === s) return null;
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
  if (!Lh(s, Object.values(e.edges))) return null;
  const l = mt(), c = [ki({
    id: l,
    source_id: t.source,
    target_id: t.target,
    source_port: r,
    target_port: a
  })], u = wC(e, t, n);
  u && c.push(Ct(t.target, u.x, u.y));
  const d = e.nodes[t.source], h = e.nodes[t.target], p = Cs(e, { source_id: t.source, source_port: t.sourceHandle || void 0 });
  let v = Qi(h);
  const g = Jm(p, h);
  g && h && (c.push(qd(h.id, { config: { ...h.config || {}, output_schema: g } })), v = g);
  const m = mC(p, v, "output"), _ = d ? Ji(d.kind, d.ref) : [], E = !!d && _.some((b) => b.id === "failed");
  let w = g ? "adopt-finish" : Ns(h, v) ? "contract-unavailable" : "plain";
  return !g && w !== "contract-unavailable" && m.status === "auto" ? (c.push(Ei(l, { transform: m.transform })), w = "auto") : !g && w !== "contract-unavailable" && m.status === "ambiguous" && (w = "ambiguous"), { edgeId: l, cmds: c, action: w, result: m, sourceId: t.source, targetId: t.target, sourceSchema: p, targetSchema: v, sourceFailureAvailable: E };
}
function bC(e, t, n, i, o) {
  const r = e.edges[t];
  if (!r) return null;
  const a = { ...e }, s = [...i, xi(t)];
  zi(a, s);
  const l = a.nodes[n];
  if (!l || Ss(l.kind)) return null;
  const c = fs(a, {
    source: r.source_id,
    sourceHandle: r.source_port ?? null,
    target: n,
    targetHandle: null
  }, o);
  if (!c) return null;
  zi(a, c.cmds);
  const u = fs(a, {
    source: n,
    sourceHandle: QS(l) ?? null,
    target: r.target_id,
    targetHandle: r.target_port ?? null
  }, o);
  return u ? [...s, ...c.cmds, ...u.cmds] : null;
}
function _C(e) {
  const { engine: t, apply: n, select: i, layoutDir: o, viewingRun: r } = e, a = j(null), s = j(""), l = j(null), c = j(null), u = xs(/* @__PURE__ */ new Map()), d = j(0);
  function h() {
    d.value++;
  }
  function p() {
    return { stroke: a.value === "error" ? "var(--wf-danger)" : a.value === "warn" ? "var(--wf-amber)" : a.value === "ok" ? "var(--p-success-500)" : "var(--wf-line-strong)", strokeWidth: 2, strokeDasharray: "4 3" };
  }
  function v(k) {
    if (!Lh(k, Object.values(t.doc.edges)))
      return a.value = "error", s.value = k.source && k.source === k.target ? "A step can’t connect to itself." : "These steps are already connected.", "error";
    const B = t.doc.nodes[k.target || ""], y = Cs(t.doc, { source_id: k.source || "", source_port: k.sourceHandle || void 0 }), I = Qi(B);
    if (Ns(B, I))
      return a.value = "warn", s.value = "Input fields are still loading — connect to keep the route visible.", "warn";
    const C = rl(y, I);
    return C.status === "error" ? (a.value = "warn", s.value = "Needs a mapping — connect, then describe what flows here.", "warn") : (a.value = C.status, s.value = "", C.status);
  }
  function g(k) {
    return "id" in k ? !0 : r.value ? !1 : v(k) !== "error";
  }
  function m() {
    a.value = null, s.value = "", l.value = null;
  }
  function _(k) {
    if (m(), r.value) return;
    const B = fs(t.doc, k, o.value);
    B && (u.clear(), c.value = null, n(B.cmds), B.action === "auto" ? (u.set(B.edgeId, { id: B.edgeId, sourceId: B.sourceId, targetId: B.targetId, result: B.result }), c.value = null, h()) : B.action === "ambiguous" ? (c.value = {
      id: B.edgeId,
      sourceId: B.sourceId,
      targetId: B.targetId,
      sourceSchema: B.sourceSchema,
      targetSchema: B.targetSchema,
      sourceRoot: "output",
      sourceFailureAvailable: B.sourceFailureAvailable,
      unresolved: B.result.unresolved
    }, h()) : (B.action === "plain" || B.action === "contract-unavailable") && i("edge", B.edgeId));
  }
  function E() {
    c.value = null, h();
  }
  function w() {
    const k = !!c.value || u.size > 0;
    c.value = null, u.clear(), k && h();
  }
  function b(k) {
    const B = c.value;
    if (!B) return;
    const y = yC(t.doc, B, k);
    y && (y.commands.length && n(y.commands, y.refit), y.select && i(y.select.kind, y.select.id), c.value = null, h());
  }
  function S() {
    const k = c.value;
    k && (i("edge", k.id), c.value = null, h());
  }
  function N(k) {
    u.delete(k) && h();
  }
  function V(k) {
    i("edge", k), u.delete(k) && h();
  }
  function A(k) {
    for (const B of [...u.keys()])
      k.has(B) || u.delete(B);
    c.value && !k.has(c.value.id) && (c.value = null);
  }
  function T(k) {
    for (const B of k) {
      const y = String(B.id), I = c.value?.id === y ? "wf-edge--pending" : u.has(y) ? "wf-edge--auto" : "";
      if (!I) continue;
      const C = typeof B.class == "string" ? B.class : "";
      B.class = C ? `${C} ${I}` : I;
    }
  }
  function L() {
    m();
  }
  function M(k) {
    a.value && (l.value = { x: k.clientX, y: k.clientY });
  }
  return Ue(() => window.addEventListener("pointerup", m)), Qe(() => window.removeEventListener("pointerup", m)), {
    connectStatus: a,
    connectMessage: s,
    connectXY: l,
    connectLineStyle: p,
    isValidConnection: g,
    resetConnectHint: m,
    onConnect: _,
    onConnectEnd: L,
    onCanvasMouseMove: M,
    // intent-edge
    pendingEdge: c,
    autoMapped: u,
    intentRev: d,
    dismissPending: E,
    clearIntentOverlays: w,
    acceptPending: b,
    openPendingMapper: S,
    dismissAutoMapped: N,
    openAutoMapped: V,
    pruneIntent: A,
    decorateEdges: T
  };
}
const ll = 28, Xh = 8;
function kC(e, t = ll, n = Xh) {
  const i = (e % n + n) % n;
  return { dx: i * t, dy: i * t };
}
const Kh = 64;
function EC(e, t, n = Kh) {
  return Math.abs(e.x - t.x) < n && Math.abs(e.y - t.y) < n;
}
function xC(e, t, n = ll, i = Kh, o = 40) {
  let r = { x: e.x, y: e.y }, a = 0;
  for (; a < o && t.some((s) => EC(r, s, i)); )
    r = { x: r.x + n, y: r.y + n }, a++;
  return r;
}
function $C(e, t, n = 20) {
  return e.x < t.x + t.width + n && e.x + e.width + n > t.x && e.y < t.y + t.height + n && e.y + e.height + n > t.y;
}
function SC(e, t, n, i = ll, o = 20, r = 24) {
  const a = (s) => !n.some((l) => $C({ ...s, ...t }, l, o));
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
function CC(e) {
  return (e instanceof Element ? e.closest(".vue-flow__edge") : null)?.getAttribute("data-id") || null;
}
function NC(e) {
  const { engine: t, layoutDir: n, apply: i, select: o, catalog: r, getViewport: a, screenToFlowCoordinate: s } = e, l = j(null);
  function c() {
    try {
      const b = a(), S = l.value?.getBoundingClientRect(), N = S ? S.width / 2 : 400, V = S ? S.height / 2 : 260;
      return { x: Math.round((N - b.x) / b.zoom), y: Math.round((V - b.y) / b.zoom) };
    } catch {
      return { x: 200, y: 160 };
    }
  }
  const u = j(0);
  function d() {
    return Object.values(Nn(t.doc, n.value));
  }
  function h(b = Nn(t.doc, n.value)) {
    return Object.entries(b).flatMap(([S, N]) => {
      const V = t.doc.nodes[S];
      if (!V) return [];
      const A = pn(V);
      return [{ x: N.x, y: N.y, width: A.width, height: A.height }];
    });
  }
  function p() {
    const b = c(), { dx: S, dy: N } = kC(u.value);
    return u.value = (u.value + 1) % Xh, xC({ x: b.x + S, y: b.y + N }, d());
  }
  function v(b, S, N = {}) {
    const V = S ? (u.value = 0, S) : p(), A = mt(), T = [
      _i({
        id: A,
        kind: b.kind,
        title: b.title,
        ref: b.ref
      }),
      Ct(A, V.x, V.y)
    ], M = (N.edge ? bC(t.doc, N.edge, A, T, n.value) : null) ?? (N.bodyParent ? [...T, ki({ id: mt(), source_id: N.bodyParent, target_id: A, source_port: "body" })] : T);
    return i(M), o("node", A), A;
  }
  function g(b) {
    const S = b ? (u.value = 0, b) : p(), N = mt();
    i([Bl({ id: N, text: "" }), Ct(N, S.x, S.y)]), o("note", N);
  }
  function m(b) {
    const S = b ? (u.value = 0, b) : p(), N = mt();
    i([
      Bl({ id: N, text: "Frame", kind: "frame", color: "slate" }),
      Ct(N, S.x, S.y, 420, 280)
    ]), o("note", N);
  }
  Zt(gh, (b, S, N, V, A) => {
    t.recordLayoutEcho(b, S, N), i([Ct(b, S, N, V, A)]);
  });
  function E(b) {
    b.preventDefault();
    const S = b.dataTransfer?.getData("application/wf-item");
    if (!S) return;
    let N = { x: 200, y: 160 };
    try {
      N = s({ x: b.clientX, y: b.clientY });
    } catch {
    }
    if (S === "note:new") {
      g(N);
      return;
    }
    if (S === "frame:new") {
      m(N);
      return;
    }
    const V = r.value.find((k) => k.paletteId === S);
    if (!V) return;
    const A = Nn(t.doc, n.value), T = Yh(t.doc, N, A), L = pn({ kind: V.kind, title: V.title }), M = T ? N : SC(N, L, h(A));
    v(V, M, { edge: CC(b.target) ?? void 0, bodyParent: T || void 0 });
  }
  function w(b) {
    b.preventDefault(), b.dataTransfer && (b.dataTransfer.dropEffect = "copy");
  }
  return { canvasEl: l, placeItem: v, placeNote: g, placeFrame: m, onDrop: E, onDragOver: w };
}
const IC = /* @__PURE__ */ new Set(["INPUT", "TEXTAREA", "SELECT"]);
function Zh(e) {
  const t = e;
  if (!t) return !1;
  if (t.isContentEditable) return !0;
  const n = t.tagName;
  return typeof n == "string" && IC.has(n.toUpperCase());
}
function AC(e) {
  const t = !!(e.ctrlKey || e.metaKey);
  return t && (e.key === "k" || e.key === "K") ? "palette" : Zh(e.target) ? null : t && (e.key === "z" || e.key === "Z") ? e.shiftKey ? "redo" : "undo" : t && (e.key === "y" || e.key === "Y") ? "redo" : e.shiftKey && !t && (e.key === "1" || e.key === "!") ? "fit" : e.shiftKey && !t && (e.key === "2" || e.key === "@") ? "zoom-selection" : e.key === "Delete" || e.key === "Backspace" ? "delete" : e.key === "Escape" ? "escape" : null;
}
function TC(e) {
  const { deleteSelection: t, runHistory: n, paletteOpen: i, hasSelection: o, clearSelection: r, fit: a, zoomSelection: s } = e, l = j(null);
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
    ze(() => {
      l.value?.querySelector(".wf-palette-search input")?.focus();
    });
  }
  function h(p) {
    if (u(p)) return;
    if (Zh(p.target)) {
      p.key === "Escape" && (p.target.blur?.(), c(p));
      return;
    }
    const v = AC({ key: p.key, ctrlKey: p.ctrlKey, metaKey: p.metaKey, shiftKey: p.shiftKey, target: p.target });
    v === "delete" ? (c(p), t()) : v === "undo" ? (c(p), n("undo")) : v === "redo" ? (c(p), n("redo")) : v === "palette" ? (c(p), i.value = !0, d()) : v === "fit" ? a && (c(p), a()) : v === "zoom-selection" ? s && o.value && (c(p), s()) : v === "escape" && o.value && (c(p), r());
  }
  return { rootEl: l, onKeyDown: h, focusPaletteSearch: d };
}
function MC(e) {
  const { engine: t, workflowId: n, rev: i, runState: o, viewingRun: r, viewingNodeHeaders: a, rebuild: s, clearSelection: l, error: c, panelOpen: u, historyOpen: d } = e, h = j(null);
  let p = !1;
  function v() {
    h.value = null, r.value = null, a.value = [], o.value = Id(), l(), s();
  }
  async function g() {
    const X = h.value;
    if (!(!X || p)) {
      p = !0;
      try {
        const { run: oe, nodes: le, errorRouted: fe } = await xr(n, X);
        if (h.value !== X) return;
        const _e = mg(oe.status);
        o.value = $r(t.doc, le, oe.status, fe), s(), !_e && oe.status !== "completed" && (c.value = oe.error || `Run ${oe.status}.`);
      } catch (oe) {
        c.value = qe(oe, "Couldn’t refresh this run.");
      } finally {
        p = !1;
      }
    }
  }
  const m = [];
  try {
    const X = gi(`kickside.thread.${n}`, (le) => {
      pg(le, n) && g();
    });
    typeof X == "function" && m.push(X);
    const oe = gi("@visibility", (le) => {
      le === !0 && g();
    });
    typeof oe == "function" && m.push(oe);
  } catch {
  }
  const _ = j(!1), E = j([]), w = j(!1), b = j("");
  async function S() {
    w.value = !0, b.value = "";
    try {
      E.value = await Nd(n, 20);
    } catch (X) {
      b.value = qe(X, "Couldn’t load runs.");
    } finally {
      w.value = !1;
    }
  }
  function N() {
    _.value = !_.value, _.value && (A.value = !1, d.value = !1, S());
  }
  async function V(X) {
    _.value = !1, v(), r.value = X, u.value = !0;
    try {
      const { run: oe, nodes: le, errorRouted: fe } = await xr(n, X.run_id);
      if (r.value?.run_id !== X.run_id) return;
      r.value = oe, a.value = le, o.value = $r(t.doc, le, oe.status, fe), s();
    } catch (oe) {
      c.value = qe(oe, "Couldn’t load this run.");
    }
  }
  const A = j(!1), T = j(!1), L = j({}), M = j(0), k = j(""), B = j(!0), y = W(() => {
    i.value;
    const X = vg(t.doc);
    return X && t.doc.nodes[X] || null;
  }), I = W(() => {
    const X = y.value;
    return X ? (X.config || {}).input_schema ?? X.input_schema : void 0;
  });
  function C(X) {
    if (!X || typeof X != "object") return !1;
    const oe = X.properties;
    return !!oe && typeof oe == "object" && Object.keys(oe).length > 0;
  }
  const H = W(() => C(I.value)), F = W(() => !T.value && B.value);
  function q(X) {
    r.value && v(), _.value = !1, d.value = !1, c.value = "", k.value = "", L.value = X, B.value = !0, M.value++, A.value = !0;
  }
  function U() {
    if (o.value.active) {
      v();
      return;
    }
    q({});
  }
  function ne() {
    A.value = !1;
  }
  async function ue(X) {
    let oe = {};
    try {
      const le = await xr(n, X.run_id);
      le.input && (oe = le.input);
    } catch {
    }
    q(oe);
  }
  function G(X) {
    L.value = X || {};
  }
  function J(X) {
    B.value = X;
  }
  async function K() {
    const X = {};
    X.input = L.value || {}, k.value = "", T.value = !0;
    try {
      h.value = await gg(n, X), o.value = $r(t.doc, [], "running"), A.value = !1, s(), await g();
    } catch (oe) {
      k.value = qe(oe, "Couldn’t start the run.");
    } finally {
      T.value = !1;
    }
  }
  return Qe(() => {
    for (const X of m) X();
  }), {
    runId: h,
    runsOpen: _,
    runRows: E,
    runsLoading: w,
    runsError: b,
    simOpen: A,
    simBusy: T,
    simInput: L,
    simInputKey: M,
    simError: k,
    simInputValid: B,
    startInputSchema: I,
    startHasFields: H,
    canRunSimulate: F,
    stopRun: v,
    loadRuns: S,
    toggleRuns: N,
    viewRun: V,
    openSim: U,
    closeSim: ne,
    rerunSameInput: ue,
    onSimInput: G,
    onSimValid: J,
    runSimulate: K
  };
}
function OC(e) {
  const { rootEl: t, panelOpen: n, paletteOpen: i, hasSelection: o, viewingRun: r, reframe: a } = e, s = j(!1), l = j(!1), c = W(() => n.value && (o.value || !!r.value));
  let u = null, d = 0, h = !1;
  function p() {
    const E = ++d;
    ze(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      E === d && a();
    })));
  }
  function v() {
    const E = !i.value;
    E && s.value && c.value && (n.value = !1), i.value = E;
  }
  function g() {
    s.value && (i.value = !1), n.value = !0;
  }
  function m() {
    n.value = !1;
  }
  async function _() {
    return !s.value || !i.value ? !1 : (h = !0, i.value = !1, await ze(), await new Promise((E) => requestAnimationFrame(() => requestAnimationFrame(() => E()))), h = !1, !0);
  }
  return ke([s, c], ([E, w], b) => {
    E && w && i.value && (i.value = !1), b && b[1] !== w && p();
  }), ke(i, (E, w) => {
    E && s.value && c.value && (n.value = !1), E !== w && !h && p();
  }), Ue(() => {
    const E = t.value;
    if (!E || typeof ResizeObserver > "u") return;
    const w = (b) => {
      b <= 0 || (s.value = b <= 1180, l.value = b <= 640);
    };
    w(E.getBoundingClientRect().width), u = new ResizeObserver((b) => w(b[0]?.contentRect.width || 0)), u.observe(E);
  }), Qe(() => {
    u?.disconnect(), u = null;
  }), { compact: s, narrow: l, inspectorVisible: c, togglePalette: v, openInspector: g, closeInspector: m, prepareCanvasAction: _ };
}
const Jh = 0.7;
function Qh(e = 250, t = 0.2, n = 1) {
  const i = Number.isFinite(n) ? Math.max(1, n) : 1;
  return { padding: t, minZoom: Jh / i, maxZoom: 1 / i, duration: e };
}
function RC(e) {
  const t = j(null), n = j(null), i = j(null), o = W(() => (e.revision.value, t.value && e.doc().nodes[t.value] || null)), r = W(() => (e.revision.value, n.value && e.doc().edges[n.value] || null)), a = W(() => (e.revision.value, i.value && e.doc().notes[i.value] || null)), s = W(() => !!(o.value || r.value || a.value));
  function l(S, N) {
    t.value = S === "node" ? N : null, n.value = S === "edge" ? N : null, i.value = S === "note" ? N : null, e.openInspector();
  }
  function c() {
    t.value = null, n.value = null, i.value = null;
  }
  function u(S) {
    if (S.node.type === "wfContainer") return;
    const N = S.node.type === "wfNote" || S.node.type === "wfFrame";
    if (e.readOnly()) {
      N || l("node", S.node.id);
      return;
    }
    l(N ? "note" : "node", S.node.id);
  }
  function d(S) {
    e.readOnly() || l("edge", S.edge.id);
  }
  function h(S) {
    o.value && e.apply([qd(o.value.id, S)]);
  }
  function p(S) {
    r.value && e.apply([Ei(r.value.id, S)]);
  }
  function v(S) {
    a.value && e.apply([ay(a.value.id, S)]);
  }
  function g(S) {
    return S ? S.kind === "start" || S.kind === "finish" || S.kind === "error" || S.pinned === !0 || !!S.boundary : !1;
  }
  function m() {
    const S = o.value;
    if (S) {
      if (g(S)) {
        e.reportError("Start, Finish, and Error steps are locked and can’t be deleted.");
        return;
      }
      e.confirmNodeRemoval(S, () => {
        e.readOnly() || !e.doc().nodes[S.id] || (t.value === S.id && c(), e.apply([ry(S.id)]));
      });
    }
  }
  function _() {
    const S = r.value;
    S && (c(), e.apply([xi(S.id)]));
  }
  function E(S) {
    e.readOnly() || !e.doc().edges[S] || (n.value === S && c(), e.apply([xi(S)]));
  }
  function w() {
    const S = a.value;
    S && (c(), e.apply([sy(S.id)]));
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
    updateNode: h,
    updateEdge: p,
    updateNote: v,
    removeSelectedNode: m,
    removeSelectedEdge: _,
    removeEdge: E,
    removeSelectedNote: w,
    deleteSelection: b
  };
}
function DC() {
  const e = j(!0), t = j(!0), n = j(!1), i = j(!1), o = j(!1), r = j(null);
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
function PC(e) {
  return ul(e).mode === "first_wins" ? "first_wins" : "wait_all";
}
function LC(e, t) {
  return PC(t);
}
function zC(e) {
  return ul(e).output_mode === "array" ? "array" : "object";
}
function VC(e, t, n) {
  return { kind: "combine", config: { ...ul(e), mode: t, output_mode: n } };
}
function BC(e, t) {
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
function FC(e) {
  return `These are the True and False arms of “${e}” — only one ever runs, so wait-all would wait forever for the other. Use first-wins here.`;
}
function HC(e) {
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
  } = e, d = W(() => {
    n.value;
    const y = o.value;
    if (y)
      return Fa(y.source_port) ? Qm : Rl(t.doc.nodes[y.source_id]);
  }), h = W(() => {
    n.value;
    const y = o.value;
    return y ? Qi(t.doc.nodes[y.target_id], d.value) : void 0;
  }), p = W(() => {
    n.value;
    const y = o.value, I = y ? t.doc.nodes[y.source_id] : null;
    return I ? Je(I.title, I.ref) : "";
  }), v = W(() => {
    n.value;
    const y = o.value, I = y ? t.doc.nodes[y.target_id] : null;
    return I ? Je(I.title, I.ref) : "";
  }), g = W(() => {
    n.value;
    const y = i.value;
    if (!y) return;
    const I = Object.values(t.doc.edges).filter((C) => C.target_id === y.id);
    if (I.length === 1)
      return Rl(t.doc.nodes[I[0].source_id]);
  }), m = W(() => {
    n.value;
    const y = i.value;
    if (!y) return null;
    const I = BC(t.doc, y.id);
    if (!I) return null;
    const C = t.doc.nodes[I];
    return Je(C?.title, C?.ref) || "a Condition";
  }), _ = W(() => (n.value, i.value ? r.value.node[i.value.id] : void 0)), E = W(() => {
    n.value;
    const y = r.value.node;
    for (const I of Object.keys(t.doc.nodes))
      if (y[I] === "failed") return t.doc.nodes[I] || null;
    return null;
  }), w = W(() => {
    const y = E.value;
    return y ? Je(y.title, y.ref) || "A step" : "";
  }), b = W(() => Pl(a.value?.error)), S = W(() => b.value.generic ? "" : b.value.message), N = W(() => Pl(s.value));
  function V() {
    const y = E.value;
    y && (u("node", y.id), c.value = !0);
  }
  const A = W(() => (n.value, { nodes: Object.keys(t.doc.nodes).length, edges: Object.keys(t.doc.edges).length }));
  function T(y, I) {
    return `${y} ${I}${y === 1 ? "" : "s"}`;
  }
  const L = W(() => `${T(A.value.nodes, "step")} · ${T(A.value.edges, "connection")}`), M = W(() => (n.value, t.doc.canUndo)), k = W(() => (n.value, t.doc.canRedo)), B = W(() => (n.value, !l.value && A.value.nodes === 0 && Object.keys(t.doc.notes).length === 0));
  return {
    selectedEdgeUpstream: d,
    selectedEdgeDownstream: h,
    selectedEdgeSourceTitle: p,
    selectedEdgeTargetTitle: v,
    selectedNodeUpstream: g,
    selectedCombineConflict: m,
    selectedRunStatus: _,
    failedNode: E,
    failedNodeTitle: w,
    failedReason: S,
    runErrorView: b,
    errorView: N,
    openFailedDetails: V,
    counts: A,
    countLabel: L,
    canUndo: M,
    canRedo: k,
    isEmpty: B
  };
}
const qC = "Set a value or make it an input.", Lc = {
  node_config_missing: `This step is missing required configuration. ${qC}`,
  branch_predicate_missing: "Set the condition."
};
function UC(e) {
  if (e.code === "branch_predicate_missing") return Lc.branch_predicate_missing;
  const t = (e.message || "").trim();
  return t ? t.replace(/^node\s+\S+\s+/i, "").trim() || t : Lc[e.code] || "This step isn’t ready to publish yet.";
}
function WC(e) {
  return e.find((t) => !!t.nodeId)?.nodeId || "";
}
function YC(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    if (!n.nodeId) continue;
    const i = t.get(n.nodeId);
    i ? i.push(n) : t.set(n.nodeId, [n]);
  }
  return t;
}
function GC(e) {
  const { engine: t, workflowId: n, revision: i, error: o, notice: r, historyOpen: a, publishIssues: s, rebuild: l, select: c } = e, u = j(!1), d = j(0), h = j(!1);
  async function p() {
    try {
      const _ = await Pd(n);
      d.value = _.reduce((E, w) => Math.max(E, w.version), 0);
    } catch {
    }
  }
  async function v() {
    if (!(!d.value || h.value)) {
      h.value = !0, o.value = "";
      try {
        const _ = await Bd(n);
        Ps(Ud(_.title), _);
      } catch (_) {
        o.value = qe(_, "Couldn’t export this Workflow.");
      } finally {
        h.value = !1;
      }
    }
  }
  const g = W(() => (i.value, t.doc.definitionEditSeq));
  async function m() {
    a.value = !1, u.value = !0, o.value = "", r.value = "";
    try {
      const _ = await Sg(n);
      s.value.size && (s.value = /* @__PURE__ */ new Map(), l()), _.version && (d.value = Math.max(d.value, _.version)), r.value = _.version ? `Published version ${_.version}. You can now use it in an Automation, another Workflow, or an agent.` : "Published. You can now use it in an Automation, another Workflow, or an agent.", _.version && e.published?.(_.version);
    } catch (_) {
      o.value = qe(_, "Couldn’t publish this Workflow.");
      const E = /* @__PURE__ */ new Map();
      if (_ instanceof Cg) {
        for (const [b, S] of YC(_.issues)) E.set(b, UC(S[0]));
        const w = WC(_.issues);
        w && t.doc.nodes[w] && c("node", w);
      }
      s.value = E, l();
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
const jC = "kickside-automation-manager", XC = "Triggers", KC = "Automations that run this Workflow. Add one, or pause and edit the ones already here.", hs = "Publish this Workflow before adding a trigger";
function ep(e) {
  return Number.isFinite(e) && e > 0;
}
function ZC(e, t) {
  return {
    tag: jC,
    attrs: {
      "component-id": e,
      mode: "component",
      input: JSON.stringify({ sink_port: "kickside.workflows:run_sink", sink_config: { flow_ref: { kind: "flow", id: e, version: t } } })
    }
  };
}
function JC(e) {
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
  async function m(L = null) {
    u(), d(L), n.value = !0, await ze(), i.value && await Wd(i.value, t, "Workflow", _);
  }
  function _() {
    n.value = !1, h();
  }
  function E(L = null) {
    u(), o.value || d(L), o.value = !o.value, o.value && (a.value = !1, s.value = !1);
  }
  function w() {
    o.value = !1, h();
  }
  function b(L = null) {
    if (!ep(l.value)) {
      c.value = `${hs}.`;
      return;
    }
    u(), d(L), r.value = !0, o.value = !1, a.value = !1, s.value = !1;
  }
  function S() {
    r.value = !1, h();
  }
  function N(L = null) {
    u(), d(L), p();
  }
  function V() {
    v(), h();
  }
  function A(L = null) {
    u(), a.value || d(L), g();
  }
  function T() {
    a.value = !1, h();
  }
  return {
    openShare: m,
    closeShare: _,
    toggleHistory: E,
    closeHistory: w,
    openAddTrigger: b,
    closeAddTrigger: S,
    openSim: N,
    closeRunDialog: V,
    toggleRuns: A,
    closeRuns: T
  };
}
function QC(e) {
  const { engine: t, layoutDir: n, viewingRun: i, canvasEl: o, apply: r, prepareCanvasAction: a, fitView: s, canvasFitOptions: l } = e;
  function c(p) {
    const v = p.nodes?.length ? p.nodes : [p.node], g = Nn(t.doc, n.value), { parentOf: m, containers: _ } = fr(t.doc, g), E = [];
    for (const w of v) {
      if (!w) continue;
      let { x: b, y: S } = w.position;
      const N = m[String(w.id)];
      if (N) {
        const V = _.find((A) => A.id === N);
        if (V) {
          const A = nC(t.doc, N, V.members, g, String(w.id)), T = t.doc.nodes[String(w.id)];
          ({ x: b, y: S } = oC(b, S, A, T ? pn(T) : void 0));
        }
      }
      t.recordLayoutEcho(String(w.id), b, S), E.push(Ct(String(w.id), b, S));
    }
    r(E);
  }
  async function u(p = t.doc.direction) {
    if (i.value) return;
    await a();
    const v = o.value?.getBoundingClientRect(), g = Gh(t.doc, p, v ? {
      width: v.width,
      height: v.height,
      minZoom: Jh
    } : void 0), m = Object.entries(g).map(([_, E]) => Ct(_, E.x, E.y));
    p !== t.doc.direction && m.unshift(ly(p)), m.length && await r(m, !0);
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
function eN(e) {
  return Object.values(e.edges).map((t) => {
    const n = e.nodes[t.source_id], i = e.nodes[t.target_id], o = n ? Je(n.title, n.ref) : "Missing source step", r = i ? Je(i.title, i.ref) : "Missing destination step", a = t.source_port ? t.source_port === Nt.id ? Nt.label : (n ? Rn(n).find((s) => s.id === t.source_port)?.label : void 0) || t.source_port : "Output";
    return {
      id: t.id,
      label: `${o} — ${a} to ${r}`
    };
  });
}
function tN(e) {
  const { engine: t, revision: n, layoutDir: i, clearIntentOverlays: o, rememberOverlayInvoker: r, restoreOverlayFocusFallback: a, onConnect: s } = e, l = j(!1), c = W(() => {
    n.value;
    const m = [];
    for (const _ of Object.values(t.doc.nodes)) {
      if (_.kind === "finish" || _.kind === "error") continue;
      const E = Je(_.title, _.ref), w = Rn(_), b = w.length > 1 || (w[0]?.id ?? "") !== "";
      for (const S of w) {
        const N = b ? S.id : i.value === "LR" ? "out-right" : "out-bottom";
        m.push({
          key: JSON.stringify([_.id, N]),
          nodeId: _.id,
          handle: N,
          label: `${E} — ${S.label || "Output"}`
        });
      }
      sl(_) && m.push({
        key: JSON.stringify([_.id, Nt.id]),
        nodeId: _.id,
        handle: Nt.id,
        label: `${E} — ${Nt.label}`
      });
    }
    return m;
  }), u = W(() => (n.value, Object.values(t.doc.nodes).filter((m) => m.kind !== "start").map((m) => ({ nodeId: m.id, label: Je(m.title, m.ref) })))), d = W(() => (n.value, eN(t.doc))), h = W(() => i.value === "LR" ? "in-left" : "in-top");
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
function nN(e) {
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
  } = e, u = j(null), d = j(null);
  let h = null, p = !1;
  function v(M) {
    t.value || (M.preventDefault(), M.stopPropagation(), u.value = { x: M.clientX, y: M.clientY });
  }
  function g(M) {
    v(M);
  }
  function m(M) {
    M.event instanceof MouseEvent && (M.node.type === "wfFrame" || M.node.type === "wfNote") && v(M.event);
  }
  function _() {
    u.value = null;
  }
  function E() {
    const M = u.value;
    if (!M) return { x: 0, y: 0 };
    const k = i({ x: M.x, y: M.y });
    return { x: Math.round(k.x), y: Math.round(k.y) };
  }
  function w() {
    _(), n.value = !0, s();
  }
  function b() {
    const M = E();
    _(), r(M);
  }
  function S() {
    const M = E();
    _(), a(M);
  }
  function N(M) {
    p = !1, h = M?.nodeId && M?.handleType === "source" ? { node: M.nodeId, handle: M.handleId ?? void 0 } : null;
  }
  function V(M) {
    p = !0, l(M);
  }
  function A(M) {
    c();
    const k = h;
    if (h = null, p || !k || t.value || !(M instanceof MouseEvent)) return;
    const B = M.target;
    !B || !B.classList.contains("vue-flow__pane") || (d.value = { x: M.clientX, y: M.clientY, source: k.node, sourceHandle: k.handle });
  }
  function T() {
    d.value = null;
  }
  function L(M) {
    const k = d.value;
    if (!k) return;
    T();
    const B = i({ x: k.x, y: k.y }), y = o(M, { x: Math.round(B.x), y: Math.round(B.y) });
    l({ source: k.source, sourceHandle: k.sourceHandle ?? null, target: y, targetHandle: null });
  }
  return {
    paneMenu: u,
    openPaneMenu: v,
    onPaneContextMenu: g,
    onNodeContextMenu: m,
    closePaneMenu: _,
    menuAddStep: w,
    menuAddNote: b,
    menuAddFrame: S,
    dropPicker: d,
    onConnectStart: N,
    onConnect: V,
    onConnectEnd: A,
    closeDropPicker: T,
    dropPickerPick: L
  };
}
function zc(e, t, n, i, o = 12, r = 14) {
  const a = t.left + n / 2 + o, s = t.right - n / 2 - o, l = a <= s ? Math.min(Math.max(e.left, a), s) : (t.left + t.right) / 2, c = t.top + i + r + o, u = t.bottom - o, d = c <= u ? Math.min(Math.max(e.top, c), u) : Math.max(t.top + o, u);
  return { left: l, top: d };
}
function oN(e, t, n, i) {
  return {
    left: e.left - t / 2,
    right: e.left + t / 2,
    top: e.top - i - n,
    bottom: e.top - i
  };
}
function iN(e, t) {
  const n = Math.max(0, Math.min(e.right, t.right) - Math.max(e.left, t.left)), i = Math.max(0, Math.min(e.bottom, t.bottom) - Math.max(e.top, t.top));
  return n * i;
}
function rN(e, t, n, i, o, r = 12, a = 14) {
  const s = [e];
  for (const u of o)
    s.push(
      { left: e.left, top: u.top - r },
      { left: e.left, top: u.bottom + i + a + r },
      { left: u.left - n / 2 - r, top: e.top },
      { left: u.right + n / 2 + r, top: e.top }
    );
  let l = zc(s[0], t, n, i, r, a), c = Number.POSITIVE_INFINITY;
  for (const u of s) {
    const d = zc(u, t, n, i, r, a), h = oN(d, n, i, a), p = o.reduce((m, _) => m + iN(h, _), 0), v = (d.left - e.left) ** 2 + (d.top - e.top) ** 2, g = p * 1e6 + v;
    g < c && (l = d, c = g);
  }
  return l;
}
function aN(e, t, n) {
  return {
    left: Math.min(Math.max(e.left + 14, 8), Math.max(8, t - 190)),
    top: Math.min(Math.max(e.top + 14, 8), Math.max(8, n - 44))
  };
}
function sN(e) {
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
  } = e, p = j(null), v = xs(/* @__PURE__ */ new Map()), g = j(0);
  ke(l, () => {
    for (const T of [...v.keys()]) u.has(T) || v.delete(T);
    c.value || (p.value = null), h();
  }), ke(() => c.value?.id, () => {
    p.value = null;
  });
  function m(T, L) {
    return !!T && Math.abs(T.width - L.width) < 0.5 && Math.abs(T.height - L.height) < 0.5;
  }
  function _(T) {
    m(p.value, T) || (p.value = T, g.value++);
  }
  function E(T, L) {
    m(v.get(T), L) || (v.set(T, L), g.value++);
  }
  function w(T) {
    const L = o(T);
    if (!L) return null;
    const M = L.computedPosition || L.position, k = L.dimensions || { width: 180, height: 64 };
    return M ? { x: M.x + (k.width || 180) / 2, y: M.y + (k.height || 64) / 2 } : null;
  }
  function b(T) {
    const L = r();
    return n.value.flatMap((M) => {
      const k = o(M.id);
      if (!k) return [];
      const B = k.computedPosition || k.position, y = k.dimensions || { width: 180, height: 64 };
      if (!B) return [];
      const I = T.left + L.x + B.x * L.zoom, C = T.top + L.y + B.y * L.zoom;
      return [{
        left: I,
        top: C,
        right: I + (y.width || 180) * L.zoom,
        bottom: C + (y.height || 64) * L.zoom
      }];
    });
  }
  function S(T, L, M) {
    const k = w(T), B = w(L);
    if (!k || !B) return null;
    const y = i.value?.getBoundingClientRect(), I = r(), C = (k.x + B.x) / 2, H = (k.y + B.y) / 2, F = { left: (y?.left || 0) + I.x + C * I.zoom, top: (y?.top || 0) + I.y + H * I.zoom };
    return y ? {
      ...rN(F, y, M.width, M.height, b(y)),
      maxHeight: Math.max(80, y.height - 24)
    } : { ...F, maxHeight: Math.max(80, window.innerHeight - 24) };
  }
  const N = W(() => {
    a.value, s.value, l.value, g.value;
    const T = c.value;
    return T ? S(T.sourceId, T.targetId, p.value || { width: 300, height: 1 }) : null;
  }), V = W(() => {
    a.value, s.value, l.value, g.value;
    const T = [];
    for (const L of u.values()) {
      if (!t.doc.edges[L.id]) continue;
      const M = v.get(L.id), k = S(L.sourceId, L.targetId, M || { width: 300, height: 1 });
      k && T.push({ id: L.id, entry: L, left: k.left, top: k.top, maxHeight: k.maxHeight, placed: !!M });
    }
    return T;
  }), A = W(() => d.value ? aN(
    { left: d.value.x, top: d.value.y },
    window.innerWidth,
    window.innerHeight
  ) : null);
  return {
    pendingOverlaySize: p,
    autoOverlaySizes: v,
    pendingAnchor: N,
    autoMapAnchored: V,
    connectHintPosition: A,
    measurePending: _,
    measureAuto: E
  };
}
function lN(e) {
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
async function uN(e, t) {
  try {
    const n = [];
    let i = 0;
    do {
      const o = e.includes("?") ? "&" : "?", a = (await zn.get(`${e}${o}limit=100&offset=${i}`)).data;
      if (a && a.success === !1) return { rows: [], error: Ke(a.error) || `${e} failed` };
      n.push(...lN(a?.[t]));
      const s = a?.next_offset;
      if (s != null && (typeof s != "number" || !Number.isSafeInteger(s) || s <= i)) return { rows: [], error: `${e} returns an invalid offset` };
      i = s ?? void 0;
    } while (i !== void 0);
    return { rows: n };
  } catch (n) {
    return { rows: [], error: n instanceof Error ? n.message : `couldn’t load ${e}` };
  }
}
function cN(e) {
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
function dN(e) {
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
const fN = [
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
], hN = [
  { paletteId: "boundary:start", kind: "start", category: "Structure", title: Ze.start.label, subtitle: "Declares the run input", icon: Ze.start.icon },
  { paletteId: "boundary:finish", kind: "finish", category: "Structure", title: Ze.finish.label, subtitle: "Declares the successful output", icon: Ze.finish.icon },
  { paletteId: "boundary:error", kind: "error", category: "Structure", title: Ze.error.label, subtitle: "Declares the failed output", icon: Ze.error.icon }
], pN = 12;
function vN(e) {
  const n = (e || "").split(":")[0].split(".").filter(Boolean), i = n.length >= 2 ? n[1] : n[0];
  return i ? il(i) : "Other";
}
function mN(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const i = vN(n.ref);
    t.has(i) || t.set(i, []), t.get(i).push(n);
  }
  return [...t.entries()].sort((n, i) => n[0].localeCompare(i[0])).map(([n, i]) => ({ module: n, items: [...i].sort((o, r) => o.title.localeCompare(r.title)) }));
}
const gN = "Notes";
function yN(e, t, n) {
  const i = t.trim().toLowerCase(), o = /* @__PURE__ */ new Map(), r = [...n];
  for (const a of n) o.set(a, []);
  for (const a of e)
    i && !`${a.title} ${a.subtitle} ${a.ref || ""} ${a.kind} ${a.category}`.toLowerCase().includes(i) || (o.has(a.category) || (o.set(a.category, []), r.push(a.category)), o.get(a.category).push(a));
  return r.filter((a) => a === gN || (o.get(a)?.length ?? 0) > 0).map((a) => ({ cat: a, items: o.get(a) || [] }));
}
async function wN() {
  const e = await uN("/api/v1/workflows/blocks?fields=blurb,input_schema,config_schema,config_wc,output_schema,error_schema,ports,execution", "blocks"), t = e.rows.map(cN).filter((i) => i.id && i.public === !0);
  return eg(t), { items: [
    ...hN,
    ...t.map(dN),
    ...fN
  ], errors: e.error ? [e.error] : [] };
}
function bN(e) {
  const { workflowId: t, engine: n, catalog: i, catalogErrors: o, catalogLoading: r, load: a, loadPublishedState: s, rebuild: l } = e;
  async function c() {
    try {
      const d = await wN();
      i.value = d.items, o.value = d.errors;
    } catch (d) {
      i.value = [], o.value = [qe(d, "Couldn’t load Workflow steps.")];
    } finally {
      r.value = !1;
    }
    await a(!0), s();
  }
  pd(c);
  let u = [];
  Ue(() => {
    try {
      u.push(
        gi(`workflow.${t}`, (d) => {
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
const tp = function({ dimensions: e, size: t, color: n }) {
  return Pe("path", {
    stroke: n,
    "stroke-width": t,
    d: `M${e[0] / 2} 0 V${e[1]} M0 ${e[1] / 2} H${e[0]}`
  });
}, np = function({ radius: e, color: t }) {
  return Pe("circle", { cx: e, cy: e, r: e, fill: t });
};
Lt.Lines + "", Lt.Dots + "";
const _N = {
  [Lt.Dots]: "#81818a",
  [Lt.Lines]: "#eee"
}, kN = ["id", "x", "y", "width", "height", "patternTransform"], EN = {
  key: 2,
  height: "100",
  width: "100"
}, xN = ["fill"], $N = ["x", "y", "fill"], SN = {
  name: "Background",
  compatConfig: { MODE: 3 }
}, op = /* @__PURE__ */ we({
  ...SN,
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
    const { id: t, viewport: n } = De(), i = W(() => {
      const a = n.value.zoom, [s, l] = Array.isArray(e.gap) ? e.gap : [e.gap, e.gap], c = [s * a || 1, l * a || 1], u = e.size * a, [d, h] = Array.isArray(e.offset) ? e.offset : [e.offset, e.offset], p = [d * a || 1 + c[0] / 2, h * a || 1 + c[1] / 2];
      return {
        scaledGap: c,
        offset: p,
        size: u
      };
    }), o = Ne(() => `pattern-${t}${e.id ? `-${e.id}` : ""}`), r = Ne(() => e.color || e.patternColor || _N[e.variant || Lt.Dots]);
    return (a, s) => ($(), R("svg", {
      class: "vue-flow__background vue-flow__container",
      style: He({
        height: `${a.height > 100 ? 100 : a.height}%`,
        width: `${a.width > 100 ? 100 : a.width}%`
      })
    }, [
      Ve(a.$slots, "pattern-container", { id: o.value }, () => [
        x("pattern", {
          id: o.value,
          x: f(n).x % i.value.scaledGap[0],
          y: f(n).y % i.value.scaledGap[1],
          width: i.value.scaledGap[0],
          height: i.value.scaledGap[1],
          patternTransform: `translate(-${i.value.offset[0]},-${i.value.offset[1]})`,
          patternUnits: "userSpaceOnUse"
        }, [
          Ve(a.$slots, "pattern", {}, () => [
            a.variant === f(Lt).Lines ? ($(), se(f(tp), {
              key: 0,
              size: a.lineWidth,
              color: r.value,
              dimensions: i.value.scaledGap
            }, null, 8, ["size", "color", "dimensions"])) : a.variant === f(Lt).Dots ? ($(), se(f(np), {
              key: 1,
              color: r.value,
              radius: i.value.size / 2
            }, null, 8, ["color", "radius"])) : Q("", !0),
            a.bgColor ? ($(), R("svg", EN, [
              x("rect", {
                width: "100%",
                height: "100%",
                fill: a.bgColor
              }, null, 8, xN)
            ])) : Q("", !0)
          ])
        ], 8, kN)
      ]),
      x("rect", {
        x: a.x,
        y: a.y,
        width: "100%",
        height: "100%",
        fill: `url(#${o.value})`
      }, null, 8, $N),
      Ve(a.$slots, "default", { id: o.value })
    ], 4));
  }
}), CN = {
  name: "ControlButton",
  compatConfig: { MODE: 3 }
}, NN = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [i, o] of t)
    n[i] = o;
  return n;
}, IN = {
  type: "button",
  class: "vue-flow__controls-button"
};
function AN(e, t, n, i, o, r) {
  return $(), R("button", IN, [
    Ve(e.$slots, "default")
  ]);
}
const Jo = /* @__PURE__ */ NN(CN, [["render", AN]]), TN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32"
}, MN = /* @__PURE__ */ x("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" }, null, -1), ON = [
  MN
];
function RN(e, t) {
  return $(), R("svg", TN, ON);
}
const DN = { render: RN }, PN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 5"
}, LN = /* @__PURE__ */ x("path", { d: "M0 0h32v4.2H0z" }, null, -1), zN = [
  LN
];
function VN(e, t) {
  return $(), R("svg", PN, zN);
}
const BN = { render: VN }, FN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 30"
}, HN = /* @__PURE__ */ x("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0 0 27.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94a.919.919 0 0 1-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" }, null, -1), qN = [
  HN
];
function UN(e, t) {
  return $(), R("svg", FN, qN);
}
const WN = { render: UN }, YN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 25 32"
}, GN = /* @__PURE__ */ x("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 0 0 0 13.714v15.238A3.056 3.056 0 0 0 3.048 32h18.285a3.056 3.056 0 0 0 3.048-3.048V13.714a3.056 3.056 0 0 0-3.048-3.047zM12.19 24.533a3.056 3.056 0 0 1-3.047-3.047 3.056 3.056 0 0 1 3.047-3.048 3.056 3.056 0 0 1 3.048 3.048 3.056 3.056 0 0 1-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" }, null, -1), jN = [
  GN
];
function XN(e, t) {
  return $(), R("svg", YN, jN);
}
const KN = { render: XN }, ZN = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 25 32"
}, JN = /* @__PURE__ */ x("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 0 0 0 13.714v15.238A3.056 3.056 0 0 0 3.048 32h18.285a3.056 3.056 0 0 0 3.048-3.048V13.714a3.056 3.056 0 0 0-3.048-3.047zM12.19 24.533a3.056 3.056 0 0 1-3.047-3.047 3.056 3.056 0 0 1 3.047-3.048 3.056 3.056 0 0 1 3.048 3.048 3.056 3.056 0 0 1-3.048 3.047z" }, null, -1), QN = [
  JN
];
function e2(e, t) {
  return $(), R("svg", ZN, QN);
}
const t2 = { render: e2 }, n2 = {
  name: "Controls",
  compatConfig: { MODE: 3 }
}, o2 = /* @__PURE__ */ we({
  ...n2,
  props: {
    showZoom: { type: Boolean, default: !0 },
    showFitView: { type: Boolean, default: !0 },
    showInteractive: { type: Boolean, default: !0 },
    fitViewParams: {},
    position: { default: () => Ef.BottomLeft }
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
    function _() {
      l(e.fitViewParams), t("fitView");
    }
    function E() {
      r(!h.value), t("interactionChange", !h.value);
    }
    return (w, b) => ($(), se(f(Jf), {
      class: "vue-flow__controls",
      position: w.position
    }, {
      default: ie(() => [
        Ve(w.$slots, "top"),
        w.showZoom ? ($(), R(de, { key: 0 }, [
          Ve(w.$slots, "control-zoom-in", {}, () => [
            z(Jo, {
              class: "vue-flow__controls-zoomin",
              disabled: v.value,
              onClick: g
            }, {
              default: ie(() => [
                Ve(w.$slots, "icon-zoom-in", {}, () => [
                  ($(), se(Xt(f(DN))))
                ])
              ]),
              _: 3
            }, 8, ["disabled"])
          ]),
          Ve(w.$slots, "control-zoom-out", {}, () => [
            z(Jo, {
              class: "vue-flow__controls-zoomout",
              disabled: p.value,
              onClick: m
            }, {
              default: ie(() => [
                Ve(w.$slots, "icon-zoom-out", {}, () => [
                  ($(), se(Xt(f(BN))))
                ])
              ]),
              _: 3
            }, 8, ["disabled"])
          ])
        ], 64)) : Q("", !0),
        w.showFitView ? Ve(w.$slots, "control-fit-view", { key: 1 }, () => [
          z(Jo, {
            class: "vue-flow__controls-fitview",
            onClick: _
          }, {
            default: ie(() => [
              Ve(w.$slots, "icon-fit-view", {}, () => [
                ($(), se(Xt(f(WN))))
              ])
            ]),
            _: 3
          })
        ]) : Q("", !0),
        w.showInteractive ? Ve(w.$slots, "control-interactive", { key: 2 }, () => [
          w.showInteractive ? ($(), se(Jo, {
            key: 0,
            class: "vue-flow__controls-interactive",
            onClick: E
          }, {
            default: ie(() => [
              h.value ? Ve(w.$slots, "icon-unlock", { key: 0 }, () => [
                ($(), se(Xt(f(t2))))
              ]) : Q("", !0),
              h.value ? Q("", !0) : Ve(w.$slots, "icon-lock", { key: 1 }, () => [
                ($(), se(Xt(f(KN))))
              ])
            ]),
            _: 3
          })) : Q("", !0)
        ]) : Q("", !0),
        Ve(w.$slots, "default")
      ]),
      _: 3
    }, 8, ["position"]));
  }
});
var i2 = { value: () => {
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
function r2(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", o = n.indexOf(".");
    if (o >= 0 && (i = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
hi.prototype = cl.prototype = {
  constructor: hi,
  on: function(e, t) {
    var n = this._, i = r2(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; ) if ((o = (e = i[r]).type) && (o = a2(n[o], e.name))) return o;
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
function a2(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function Vc(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = i2, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var ps = "http://www.w3.org/1999/xhtml";
const Bc = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: ps,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function hr(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Bc.hasOwnProperty(t) ? { space: Bc[t], local: e } : e;
}
function s2(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === ps && t.documentElement.namespaceURI === ps ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function l2(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function ip(e) {
  var t = hr(e);
  return (t.local ? l2 : s2)(t);
}
function u2() {
}
function dl(e) {
  return e == null ? u2 : function() {
    return this.querySelector(e);
  };
}
function c2(e) {
  typeof e != "function" && (e = dl(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = new Array(a), l, c, u = 0; u < a; ++u)
      (l = r[u]) && (c = e.call(l, l.__data__, u, r)) && ("__data__" in l && (c.__data__ = l.__data__), s[u] = c);
  return new st(i, this._parents);
}
function d2(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function f2() {
  return [];
}
function rp(e) {
  return e == null ? f2 : function() {
    return this.querySelectorAll(e);
  };
}
function h2(e) {
  return function() {
    return d2(e.apply(this, arguments));
  };
}
function p2(e) {
  typeof e == "function" ? e = h2(e) : e = rp(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), o.push(l));
  return new st(i, o);
}
function ap(e) {
  return function() {
    return this.matches(e);
  };
}
function sp(e) {
  return function(t) {
    return t.matches(e);
  };
}
var v2 = Array.prototype.find;
function m2(e) {
  return function() {
    return v2.call(this.children, e);
  };
}
function g2() {
  return this.firstElementChild;
}
function y2(e) {
  return this.select(e == null ? g2 : m2(typeof e == "function" ? e : sp(e)));
}
var w2 = Array.prototype.filter;
function b2() {
  return Array.from(this.children);
}
function _2(e) {
  return function() {
    return w2.call(this.children, e);
  };
}
function k2(e) {
  return this.selectAll(e == null ? b2 : _2(typeof e == "function" ? e : sp(e)));
}
function E2(e) {
  typeof e != "function" && (e = ap(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new st(i, this._parents);
}
function lp(e) {
  return new Array(e.length);
}
function x2() {
  return new st(this._enter || this._groups.map(lp), this._parents);
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
function $2(e) {
  return function() {
    return e;
  };
}
function S2(e, t, n, i, o, r) {
  for (var a = 0, s, l = t.length, c = r.length; a < c; ++a)
    (s = t[a]) ? (s.__data__ = r[a], i[a] = s) : n[a] = new qi(e, r[a]);
  for (; a < l; ++a)
    (s = t[a]) && (o[a] = s);
}
function C2(e, t, n, i, o, r, a) {
  var s, l, c = /* @__PURE__ */ new Map(), u = t.length, d = r.length, h = new Array(u), p;
  for (s = 0; s < u; ++s)
    (l = t[s]) && (h[s] = p = a.call(l, l.__data__, s, t) + "", c.has(p) ? o[s] = l : c.set(p, l));
  for (s = 0; s < d; ++s)
    p = a.call(e, r[s], s, r) + "", (l = c.get(p)) ? (i[s] = l, l.__data__ = r[s], c.delete(p)) : n[s] = new qi(e, r[s]);
  for (s = 0; s < u; ++s)
    (l = t[s]) && c.get(h[s]) === l && (o[s] = l);
}
function N2(e) {
  return e.__data__;
}
function I2(e, t) {
  if (!arguments.length) return Array.from(this, N2);
  var n = t ? C2 : S2, i = this._parents, o = this._groups;
  typeof e != "function" && (e = $2(e));
  for (var r = o.length, a = new Array(r), s = new Array(r), l = new Array(r), c = 0; c < r; ++c) {
    var u = i[c], d = o[c], h = d.length, p = A2(e.call(u, u && u.__data__, c, i)), v = p.length, g = s[c] = new Array(v), m = a[c] = new Array(v), _ = l[c] = new Array(h);
    n(u, d, g, m, _, p, t);
    for (var E = 0, w = 0, b, S; E < v; ++E)
      if (b = g[E]) {
        for (E >= w && (w = E + 1); !(S = m[w]) && ++w < v; ) ;
        b._next = S || null;
      }
  }
  return a = new st(a, i), a._enter = s, a._exit = l, a;
}
function A2(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function T2() {
  return new st(this._exit || this._groups.map(lp), this._parents);
}
function M2(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function O2(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), s = new Array(o), l = 0; l < a; ++l)
    for (var c = n[l], u = i[l], d = c.length, h = s[l] = new Array(d), p, v = 0; v < d; ++v)
      (p = c[v] || u[v]) && (h[v] = p);
  for (; l < o; ++l)
    s[l] = n[l];
  return new st(s, this._parents);
}
function R2() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function D2(e) {
  e || (e = P2);
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
function P2(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function L2() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function z2() {
  return Array.from(this);
}
function V2() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a) return a;
    }
  return null;
}
function B2() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function F2() {
  return !this.node();
}
function H2(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, s; r < a; ++r)
      (s = o[r]) && e.call(s, s.__data__, r, o);
  return this;
}
function q2(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function U2(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function W2(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function Y2(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function G2(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function j2(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function X2(e, t) {
  var n = hr(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? U2 : q2 : typeof t == "function" ? n.local ? j2 : G2 : n.local ? Y2 : W2)(n, t));
}
function up(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function K2(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Z2(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function J2(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function Q2(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? K2 : typeof t == "function" ? J2 : Z2)(e, t, n ?? "")) : Dn(this.node(), e);
}
function Dn(e, t) {
  return e.style.getPropertyValue(t) || up(e).getComputedStyle(e, null).getPropertyValue(t);
}
function eI(e) {
  return function() {
    delete this[e];
  };
}
function tI(e, t) {
  return function() {
    this[e] = t;
  };
}
function nI(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function oI(e, t) {
  return arguments.length > 1 ? this.each((t == null ? eI : typeof t == "function" ? nI : tI)(e, t)) : this.node()[e];
}
function cp(e) {
  return e.trim().split(/^|\s+/);
}
function fl(e) {
  return e.classList || new dp(e);
}
function dp(e) {
  this._node = e, this._names = cp(e.getAttribute("class") || "");
}
dp.prototype = {
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
function fp(e, t) {
  for (var n = fl(e), i = -1, o = t.length; ++i < o; ) n.add(t[i]);
}
function hp(e, t) {
  for (var n = fl(e), i = -1, o = t.length; ++i < o; ) n.remove(t[i]);
}
function iI(e) {
  return function() {
    fp(this, e);
  };
}
function rI(e) {
  return function() {
    hp(this, e);
  };
}
function aI(e, t) {
  return function() {
    (t.apply(this, arguments) ? fp : hp)(this, e);
  };
}
function sI(e, t) {
  var n = cp(e + "");
  if (arguments.length < 2) {
    for (var i = fl(this.node()), o = -1, r = n.length; ++o < r; ) if (!i.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? aI : t ? iI : rI)(n, t));
}
function lI() {
  this.textContent = "";
}
function uI(e) {
  return function() {
    this.textContent = e;
  };
}
function cI(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function dI(e) {
  return arguments.length ? this.each(e == null ? lI : (typeof e == "function" ? cI : uI)(e)) : this.node().textContent;
}
function fI() {
  this.innerHTML = "";
}
function hI(e) {
  return function() {
    this.innerHTML = e;
  };
}
function pI(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function vI(e) {
  return arguments.length ? this.each(e == null ? fI : (typeof e == "function" ? pI : hI)(e)) : this.node().innerHTML;
}
function mI() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function gI() {
  return this.each(mI);
}
function yI() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function wI() {
  return this.each(yI);
}
function bI(e) {
  var t = typeof e == "function" ? e : ip(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function _I() {
  return null;
}
function kI(e, t) {
  var n = typeof e == "function" ? e : ip(e), i = t == null ? _I : typeof t == "function" ? t : dl(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function EI() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function xI() {
  return this.each(EI);
}
function $I() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function SI() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function CI(e) {
  return this.select(e ? SI : $I);
}
function NI(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function II(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function AI(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function TI(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function MI(e, t, n) {
  return function() {
    var i = this.__on, o, r = II(t);
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
function OI(e, t, n) {
  var i = AI(e + ""), o, r = i.length, a;
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
  for (s = t ? MI : TI, o = 0; o < r; ++o) this.each(s(i[o], t, n));
  return this;
}
function pp(e, t, n) {
  var i = up(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function RI(e, t) {
  return function() {
    return pp(this, e, t);
  };
}
function DI(e, t) {
  return function() {
    return pp(this, e, t.apply(this, arguments));
  };
}
function PI(e, t) {
  return this.each((typeof t == "function" ? DI : RI)(e, t));
}
function* LI() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var vp = [null];
function st(e, t) {
  this._groups = e, this._parents = t;
}
function Mo() {
  return new st([[document.documentElement]], vp);
}
function zI() {
  return this;
}
st.prototype = Mo.prototype = {
  constructor: st,
  select: c2,
  selectAll: p2,
  selectChild: y2,
  selectChildren: k2,
  filter: E2,
  data: I2,
  enter: x2,
  exit: T2,
  join: M2,
  merge: O2,
  selection: zI,
  order: R2,
  sort: D2,
  call: L2,
  nodes: z2,
  node: V2,
  size: B2,
  empty: F2,
  each: H2,
  attr: X2,
  style: Q2,
  property: oI,
  classed: sI,
  text: dI,
  html: vI,
  raise: gI,
  lower: wI,
  append: bI,
  insert: kI,
  remove: xI,
  clone: CI,
  datum: NI,
  on: OI,
  dispatch: PI,
  [Symbol.iterator]: LI
};
function Kt(e) {
  return typeof e == "string" ? new st([[document.querySelector(e)]], [document.documentElement]) : new st([[e]], vp);
}
function VI(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Yt(e, t) {
  if (e = VI(e), t === void 0 && (t = e.currentTarget), t) {
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
function BI(e) {
  var t = e.document.documentElement, n = Kt(e).on("dragstart.drag", ms, vs);
  "onselectstart" in t ? n.on("selectstart.drag", ms, vs) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function FI(e, t) {
  var n = e.document.documentElement, i = Kt(e).on("dragstart.drag", null);
  t && (i.on("click.drag", ms, vs), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
function hl(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function mp(e, t) {
  var n = Object.create(e.prototype);
  for (var i in t) n[i] = t[i];
  return n;
}
function Oo() {
}
var ko = 0.7, Ui = 1 / ko, In = "\\s*([+-]?\\d+)\\s*", Eo = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", At = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", HI = /^#([0-9a-f]{3,8})$/, qI = new RegExp(`^rgb\\(${In},${In},${In}\\)$`), UI = new RegExp(`^rgb\\(${At},${At},${At}\\)$`), WI = new RegExp(`^rgba\\(${In},${In},${In},${Eo}\\)$`), YI = new RegExp(`^rgba\\(${At},${At},${At},${Eo}\\)$`), GI = new RegExp(`^hsl\\(${Eo},${At},${At}\\)$`), jI = new RegExp(`^hsla\\(${Eo},${At},${At},${Eo}\\)$`), Fc = {
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
  hex: Hc,
  // Deprecated! Use color.formatHex.
  formatHex: Hc,
  formatHex8: XI,
  formatHsl: KI,
  formatRgb: qc,
  toString: qc
});
function Hc() {
  return this.rgb().formatHex();
}
function XI() {
  return this.rgb().formatHex8();
}
function KI() {
  return gp(this).formatHsl();
}
function qc() {
  return this.rgb().formatRgb();
}
function xo(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = HI.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? Uc(t) : n === 3 ? new it(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Qo(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Qo(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = qI.exec(e)) ? new it(t[1], t[2], t[3], 1) : (t = UI.exec(e)) ? new it(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = WI.exec(e)) ? Qo(t[1], t[2], t[3], t[4]) : (t = YI.exec(e)) ? Qo(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = GI.exec(e)) ? Gc(t[1], t[2] / 100, t[3] / 100, 1) : (t = jI.exec(e)) ? Gc(t[1], t[2] / 100, t[3] / 100, t[4]) : Fc.hasOwnProperty(e) ? Uc(Fc[e]) : e === "transparent" ? new it(NaN, NaN, NaN, 0) : null;
}
function Uc(e) {
  return new it(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Qo(e, t, n, i) {
  return i <= 0 && (e = t = n = NaN), new it(e, t, n, i);
}
function ZI(e) {
  return e instanceof Oo || (e = xo(e)), e ? (e = e.rgb(), new it(e.r, e.g, e.b, e.opacity)) : new it();
}
function gs(e, t, n, i) {
  return arguments.length === 1 ? ZI(e) : new it(e, t, n, i ?? 1);
}
function it(e, t, n, i) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +i;
}
hl(it, gs, mp(Oo, {
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
  hex: Wc,
  // Deprecated! Use color.formatHex.
  formatHex: Wc,
  formatHex8: JI,
  formatRgb: Yc,
  toString: Yc
}));
function Wc() {
  return `#${sn(this.r)}${sn(this.g)}${sn(this.b)}`;
}
function JI() {
  return `#${sn(this.r)}${sn(this.g)}${sn(this.b)}${sn((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Yc() {
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
function Gc(e, t, n, i) {
  return i <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new vt(e, t, n, i);
}
function gp(e) {
  if (e instanceof vt) return new vt(e.h, e.s, e.l, e.opacity);
  if (e instanceof Oo || (e = xo(e)), !e) return new vt();
  if (e instanceof vt) return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, i = e.b / 255, o = Math.min(t, n, i), r = Math.max(t, n, i), a = NaN, s = r - o, l = (r + o) / 2;
  return s ? (t === r ? a = (n - i) / s + (n < i) * 6 : n === r ? a = (i - t) / s + 2 : a = (t - n) / s + 4, s /= l < 0.5 ? r + o : 2 - r - o, a *= 60) : s = l > 0 && l < 1 ? 0 : a, new vt(a, s, l, e.opacity);
}
function QI(e, t, n, i) {
  return arguments.length === 1 ? gp(e) : new vt(e, t, n, i ?? 1);
}
function vt(e, t, n, i) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +i;
}
hl(vt, QI, mp(Oo, {
  brighter(e) {
    return e = e == null ? Ui : Math.pow(Ui, e), new vt(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? ko : Math.pow(ko, e), new vt(this.h, this.s, this.l * e, this.opacity);
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
    return new vt(jc(this.h), ei(this.s), ei(this.l), Wi(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Wi(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${jc(this.h)}, ${ei(this.s) * 100}%, ${ei(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function jc(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function ei(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Ra(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const yp = (e) => () => e;
function eA(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function tA(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(i) {
    return Math.pow(e + i * t, n);
  };
}
function nA(e) {
  return (e = +e) == 1 ? wp : function(t, n) {
    return n - t ? tA(t, n, e) : yp(isNaN(t) ? n : t);
  };
}
function wp(e, t) {
  var n = t - e;
  return n ? eA(e, n) : yp(isNaN(e) ? t : e);
}
const Xc = (function e(t) {
  var n = nA(t);
  function i(o, r) {
    var a = n((o = gs(o)).r, (r = gs(r)).r), s = n(o.g, r.g), l = n(o.b, r.b), c = wp(o.opacity, r.opacity);
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
function oA(e) {
  return function() {
    return e;
  };
}
function iA(e) {
  return function(t) {
    return e(t) + "";
  };
}
function rA(e, t) {
  var n = ys.lastIndex = Da.lastIndex = 0, i, o, r, a = -1, s = [], l = [];
  for (e = e + "", t = t + ""; (i = ys.exec(e)) && (o = Da.exec(t)); )
    (r = o.index) > n && (r = t.slice(n, r), s[a] ? s[a] += r : s[++a] = r), (i = i[0]) === (o = o[0]) ? s[a] ? s[a] += o : s[++a] = o : (s[++a] = null, l.push({ i: a, x: jt(i, o) })), n = Da.lastIndex;
  return n < t.length && (r = t.slice(n), s[a] ? s[a] += r : s[++a] = r), s.length < 2 ? l[0] ? iA(l[0].x) : oA(t) : (t = l.length, function(c) {
    for (var u = 0, d; u < t; ++u) s[(d = l[u]).i] = d.x(c);
    return s.join("");
  });
}
var Kc = 180 / Math.PI, ws = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function bp(e, t, n, i, o, r) {
  var a, s, l;
  return (a = Math.sqrt(e * e + t * t)) && (e /= a, t /= a), (l = e * n + t * i) && (n -= e * l, i -= t * l), (s = Math.sqrt(n * n + i * i)) && (n /= s, i /= s, l /= s), e * i < t * n && (e = -e, t = -t, l = -l, a = -a), {
    translateX: o,
    translateY: r,
    rotate: Math.atan2(t, e) * Kc,
    skewX: Math.atan(l) * Kc,
    scaleX: a,
    scaleY: s
  };
}
var ti;
function aA(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? ws : bp(t.a, t.b, t.c, t.d, t.e, t.f);
}
function sA(e) {
  return e == null || (ti || (ti = document.createElementNS("http://www.w3.org/2000/svg", "g")), ti.setAttribute("transform", e), !(e = ti.transform.baseVal.consolidate())) ? ws : (e = e.matrix, bp(e.a, e.b, e.c, e.d, e.e, e.f));
}
function _p(e, t, n, i) {
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
var lA = _p(aA, "px, ", "px)", "deg)"), uA = _p(sA, ", ", ")", ")"), cA = 1e-12;
function Zc(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function dA(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function fA(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const hA = (function e(t, n, i) {
  function o(r, a) {
    var s = r[0], l = r[1], c = r[2], u = a[0], d = a[1], h = a[2], p = u - s, v = d - l, g = p * p + v * v, m, _;
    if (g < cA)
      _ = Math.log(h / c) / t, m = function(V) {
        return [
          s + V * p,
          l + V * v,
          c * Math.exp(t * V * _)
        ];
      };
    else {
      var E = Math.sqrt(g), w = (h * h - c * c + i * g) / (2 * c * n * E), b = (h * h - c * c - i * g) / (2 * h * n * E), S = Math.log(Math.sqrt(w * w + 1) - w), N = Math.log(Math.sqrt(b * b + 1) - b);
      _ = (N - S) / t, m = function(V) {
        var A = V * _, T = Zc(S), L = c / (n * E) * (T * fA(t * A + S) - dA(S));
        return [
          s + L * p,
          l + L * v,
          c * T / Zc(t * A + S)
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
var Pn = 0, Zn = 0, Wn = 0, kp = 1e3, Yi, Jn, Gi = 0, vn = 0, pr = 0, $o = typeof performance == "object" && performance.now ? performance : Date, Ep = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function pl() {
  return vn || (Ep(pA), vn = $o.now() + pr);
}
function pA() {
  vn = 0;
}
function ji() {
  this._call = this._time = this._next = null;
}
ji.prototype = xp.prototype = {
  constructor: ji,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? pl() : +n) + (t == null ? 0 : +t), !this._next && Jn !== this && (Jn ? Jn._next = this : Yi = this, Jn = this), this._call = e, this._time = n, bs();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, bs());
  }
};
function xp(e, t, n) {
  var i = new ji();
  return i.restart(e, t, n), i;
}
function vA() {
  pl(), ++Pn;
  for (var e = Yi, t; e; )
    (t = vn - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Pn;
}
function Jc() {
  vn = (Gi = $o.now()) + pr, Pn = Zn = 0;
  try {
    vA();
  } finally {
    Pn = 0, gA(), vn = 0;
  }
}
function mA() {
  var e = $o.now(), t = e - Gi;
  t > kp && (pr -= t, Gi = e);
}
function gA() {
  for (var e, t = Yi, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Yi = n);
  Jn = e, bs(i);
}
function bs(e) {
  if (!Pn) {
    Zn && (Zn = clearTimeout(Zn));
    var t = e - vn;
    t > 24 ? (e < 1 / 0 && (Zn = setTimeout(Jc, e - $o.now() - pr)), Wn && (Wn = clearInterval(Wn))) : (Wn || (Gi = $o.now(), Wn = setInterval(mA, kp)), Pn = 1, Ep(Jc));
  }
}
function Qc(e, t, n) {
  var i = new ji();
  return t = t == null ? 0 : +t, i.restart((o) => {
    i.stop(), e(o + t);
  }, t, n), i;
}
var yA = cl("start", "end", "cancel", "interrupt"), wA = [], $p = 0, ed = 1, _s = 2, pi = 3, td = 4, ks = 5, vi = 6;
function vr(e, t, n, i, o, r) {
  var a = e.__transition;
  if (!a) e.__transition = {};
  else if (n in a) return;
  bA(e, n, {
    name: t,
    index: i,
    // For context during callback.
    group: o,
    // For context during callback.
    on: yA,
    tween: wA,
    time: r.time,
    delay: r.delay,
    duration: r.duration,
    ease: r.ease,
    timer: null,
    state: $p
  });
}
function vl(e, t) {
  var n = _t(e, t);
  if (n.state > $p) throw new Error("too late; already scheduled");
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
function bA(e, t, n) {
  var i = e.__transition, o;
  i[t] = n, n.timer = xp(r, 0, n.time);
  function r(c) {
    n.state = ed, n.timer.restart(a, n.delay, n.time), n.delay <= c && a(c - n.delay);
  }
  function a(c) {
    var u, d, h, p;
    if (n.state !== ed) return l();
    for (u in i)
      if (p = i[u], p.name === n.name) {
        if (p.state === pi) return Qc(a);
        p.state === td ? (p.state = vi, p.timer.stop(), p.on.call("interrupt", e, e.__data__, p.index, p.group), delete i[u]) : +u < t && (p.state = vi, p.timer.stop(), p.on.call("cancel", e, e.__data__, p.index, p.group), delete i[u]);
      }
    if (Qc(function() {
      n.state === pi && (n.state = td, n.timer.restart(s, n.delay, n.time), s(c));
    }), n.state = _s, n.on.call("start", e, e.__data__, n.index, n.group), n.state === _s) {
      for (n.state = pi, o = new Array(h = n.tween.length), u = 0, d = -1; u < h; ++u)
        (p = n.tween[u].value.call(e, e.__data__, n.index, n.group)) && (o[++d] = p);
      o.length = d + 1;
    }
  }
  function s(c) {
    for (var u = c < n.duration ? n.ease.call(null, c / n.duration) : (n.timer.restart(l), n.state = ks, 1), d = -1, h = o.length; ++d < h; )
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
function _A(e) {
  return this.each(function() {
    mi(this, e);
  });
}
function kA(e, t) {
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
function EA(e, t, n) {
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
function xA(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var i = _t(this.node(), n).tween, o = 0, r = i.length, a; o < r; ++o)
      if ((a = i[o]).name === e)
        return a.value;
    return null;
  }
  return this.each((t == null ? kA : EA)(n, e, t));
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
function Sp(e, t) {
  var n;
  return (typeof t == "number" ? jt : t instanceof xo ? Xc : (n = xo(t)) ? (t = n, Xc) : rA)(e, t);
}
function $A(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function SA(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function CA(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttribute(e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function NA(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttributeNS(e.space, e.local);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function IA(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttribute(e) : (a = this.getAttribute(e), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function AA(e, t, n) {
  var i, o, r;
  return function() {
    var a, s = n(this), l;
    return s == null ? void this.removeAttributeNS(e.space, e.local) : (a = this.getAttributeNS(e.space, e.local), l = s + "", a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s)));
  };
}
function TA(e, t) {
  var n = hr(e), i = n === "transform" ? uA : Sp;
  return this.attrTween(e, typeof t == "function" ? (n.local ? AA : IA)(n, i, ml(this, "attr." + e, t)) : t == null ? (n.local ? SA : $A)(n) : (n.local ? NA : CA)(n, i, t));
}
function MA(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function OA(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function RA(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && OA(e, r)), n;
  }
  return o._value = t, o;
}
function DA(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && MA(e, r)), n;
  }
  return o._value = t, o;
}
function PA(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  var i = hr(e);
  return this.tween(n, (i.local ? RA : DA)(i, t));
}
function LA(e, t) {
  return function() {
    vl(this, e).delay = +t.apply(this, arguments);
  };
}
function zA(e, t) {
  return t = +t, function() {
    vl(this, e).delay = t;
  };
}
function VA(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? LA : zA)(t, e)) : _t(this.node(), t).delay;
}
function BA(e, t) {
  return function() {
    Mt(this, e).duration = +t.apply(this, arguments);
  };
}
function FA(e, t) {
  return t = +t, function() {
    Mt(this, e).duration = t;
  };
}
function HA(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? BA : FA)(t, e)) : _t(this.node(), t).duration;
}
function qA(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    Mt(this, e).ease = t;
  };
}
function UA(e) {
  var t = this._id;
  return arguments.length ? this.each(qA(t, e)) : _t(this.node(), t).ease;
}
function WA(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    Mt(this, e).ease = n;
  };
}
function YA(e) {
  if (typeof e != "function") throw new Error();
  return this.each(WA(this._id, e));
}
function GA(e) {
  typeof e != "function" && (e = ap(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, s = i[o] = [], l, c = 0; c < a; ++c)
      (l = r[c]) && e.call(l, l.__data__, c, r) && s.push(l);
  return new Ft(i, this._parents, this._name, this._id);
}
function jA(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, n = e._groups, i = t.length, o = n.length, r = Math.min(i, o), a = new Array(i), s = 0; s < r; ++s)
    for (var l = t[s], c = n[s], u = l.length, d = a[s] = new Array(u), h, p = 0; p < u; ++p)
      (h = l[p] || c[p]) && (d[p] = h);
  for (; s < i; ++s)
    a[s] = t[s];
  return new Ft(a, this._parents, this._name, this._id);
}
function XA(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function KA(e, t, n) {
  var i, o, r = XA(t) ? vl : Mt;
  return function() {
    var a = r(this, e), s = a.on;
    s !== i && (o = (i = s).copy()).on(t, n), a.on = o;
  };
}
function ZA(e, t) {
  var n = this._id;
  return arguments.length < 2 ? _t(this.node(), n).on.on(e) : this.each(KA(n, e, t));
}
function JA(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition) if (+n !== e) return;
    t && t.removeChild(this);
  };
}
function QA() {
  return this.on("end.remove", JA(this._id));
}
function eT(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = dl(e));
  for (var i = this._groups, o = i.length, r = new Array(o), a = 0; a < o; ++a)
    for (var s = i[a], l = s.length, c = r[a] = new Array(l), u, d, h = 0; h < l; ++h)
      (u = s[h]) && (d = e.call(u, u.__data__, h, s)) && ("__data__" in u && (d.__data__ = u.__data__), c[h] = d, vr(c[h], t, n, h, c, _t(u, n)));
  return new Ft(r, this._parents, t, n);
}
function tT(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = rp(e));
  for (var i = this._groups, o = i.length, r = [], a = [], s = 0; s < o; ++s)
    for (var l = i[s], c = l.length, u, d = 0; d < c; ++d)
      if (u = l[d]) {
        for (var h = e.call(u, u.__data__, d, l), p, v = _t(u, n), g = 0, m = h.length; g < m; ++g)
          (p = h[g]) && vr(p, t, n, g, h, v);
        r.push(h), a.push(u);
      }
  return new Ft(r, a, t, n);
}
var nT = Mo.prototype.constructor;
function oT() {
  return new nT(this._groups, this._parents);
}
function iT(e, t) {
  var n, i, o;
  return function() {
    var r = Dn(this, e), a = (this.style.removeProperty(e), Dn(this, e));
    return r === a ? null : r === n && a === i ? o : o = t(n = r, i = a);
  };
}
function Cp(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function rT(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = Dn(this, e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function aT(e, t, n) {
  var i, o, r;
  return function() {
    var a = Dn(this, e), s = n(this), l = s + "";
    return s == null && (l = s = (this.style.removeProperty(e), Dn(this, e))), a === l ? null : a === i && l === o ? r : (o = l, r = t(i = a, s));
  };
}
function sT(e, t) {
  var n, i, o, r = "style." + t, a = "end." + r, s;
  return function() {
    var l = Mt(this, e), c = l.on, u = l.value[r] == null ? s || (s = Cp(t)) : void 0;
    (c !== n || o !== u) && (i = (n = c).copy()).on(a, o = u), l.on = i;
  };
}
function lT(e, t, n) {
  var i = (e += "") == "transform" ? lA : Sp;
  return t == null ? this.styleTween(e, iT(e, i)).on("end.style." + e, Cp(e)) : typeof t == "function" ? this.styleTween(e, aT(e, i, ml(this, "style." + e, t))).each(sT(this._id, e)) : this.styleTween(e, rT(e, i, t), n).on("end.style." + e, null);
}
function uT(e, t, n) {
  return function(i) {
    this.style.setProperty(e, t.call(this, i), n);
  };
}
function cT(e, t, n) {
  var i, o;
  function r() {
    var a = t.apply(this, arguments);
    return a !== o && (i = (o = a) && uT(e, a, n)), i;
  }
  return r._value = t, r;
}
function dT(e, t, n) {
  var i = "style." + (e += "");
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (t == null) return this.tween(i, null);
  if (typeof t != "function") throw new Error();
  return this.tween(i, cT(e, t, n ?? ""));
}
function fT(e) {
  return function() {
    this.textContent = e;
  };
}
function hT(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function pT(e) {
  return this.tween("text", typeof e == "function" ? hT(ml(this, "text", e)) : fT(e == null ? "" : e + ""));
}
function vT(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function mT(e) {
  var t, n;
  function i() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && vT(o)), t;
  }
  return i._value = e, i;
}
function gT(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, mT(e));
}
function yT() {
  for (var e = this._name, t = this._id, n = Np(), i = this._groups, o = i.length, r = 0; r < o; ++r)
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
function wT() {
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
var bT = 0;
function Ft(e, t, n, i) {
  this._groups = e, this._parents = t, this._name = n, this._id = i;
}
function Np() {
  return ++bT;
}
var Rt = Mo.prototype;
Ft.prototype = {
  constructor: Ft,
  select: eT,
  selectAll: tT,
  selectChild: Rt.selectChild,
  selectChildren: Rt.selectChildren,
  filter: GA,
  merge: jA,
  selection: oT,
  transition: yT,
  call: Rt.call,
  nodes: Rt.nodes,
  node: Rt.node,
  size: Rt.size,
  empty: Rt.empty,
  each: Rt.each,
  on: ZA,
  attr: TA,
  attrTween: PA,
  style: lT,
  styleTween: dT,
  text: pT,
  textTween: gT,
  remove: QA,
  tween: xA,
  delay: VA,
  duration: HA,
  ease: UA,
  easeVarying: YA,
  end: wT,
  [Symbol.iterator]: Rt[Symbol.iterator]
};
function _T(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var kT = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: _T
};
function ET(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function xT(e) {
  var t, n;
  e instanceof Ft ? (t = e._id, e = e._name) : (t = Np(), (n = kT).time = pl(), e = e == null ? null : e + "");
  for (var i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], s = a.length, l, c = 0; c < s; ++c)
      (l = a[c]) && vr(l, e, t, c, a, n || ET(l, t));
  return new Ft(i, this._parents, e, t);
}
Mo.prototype.interrupt = _A;
Mo.prototype.transition = xT;
const ni = (e) => () => e;
function $T(e, {
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
function zt(e, t, n) {
  this.k = e, this.x = t, this.y = n;
}
zt.prototype = {
  constructor: zt,
  scale: function(e) {
    return e === 1 ? this : new zt(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new zt(this.k, this.x + this.k * e, this.y + this.k * t);
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
var gl = new zt(1, 0, 0);
zt.prototype;
function Pa(e) {
  e.stopImmediatePropagation();
}
function Yn(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function ST(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function CT() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function nd() {
  return this.__zoom || gl;
}
function NT(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function IT() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function AT(e, t, n) {
  var i = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], r = e.invertY(t[0][1]) - n[0][1], a = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > i ? (i + o) / 2 : Math.min(0, i) || Math.max(0, o),
    a > r ? (r + a) / 2 : Math.min(0, r) || Math.max(0, a)
  );
}
function TT() {
  var e = ST, t = CT, n = AT, i = NT, o = IT, r = [0, 1 / 0], a = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], s = 250, l = hA, c = cl("start", "zoom", "end"), u, d, h, p = 500, v = 150, g = 0, m = 10;
  function _(y) {
    y.property("__zoom", nd).on("wheel.zoom", A, { passive: !1 }).on("mousedown.zoom", T).on("dblclick.zoom", L).filter(o).on("touchstart.zoom", M).on("touchmove.zoom", k).on("touchend.zoom touchcancel.zoom", B).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  _.transform = function(y, I, C, H) {
    var F = y.selection ? y.selection() : y;
    F.property("__zoom", nd), y !== F ? S(y, I, C, H) : F.interrupt().each(function() {
      N(this, arguments).event(H).start().zoom(null, typeof I == "function" ? I.apply(this, arguments) : I).end();
    });
  }, _.scaleBy = function(y, I, C, H) {
    _.scaleTo(y, function() {
      var F = this.__zoom.k, q = typeof I == "function" ? I.apply(this, arguments) : I;
      return F * q;
    }, C, H);
  }, _.scaleTo = function(y, I, C, H) {
    _.transform(y, function() {
      var F = t.apply(this, arguments), q = this.__zoom, U = C == null ? b(F) : typeof C == "function" ? C.apply(this, arguments) : C, ne = q.invert(U), ue = typeof I == "function" ? I.apply(this, arguments) : I;
      return n(w(E(q, ue), U, ne), F, a);
    }, C, H);
  }, _.translateBy = function(y, I, C, H) {
    _.transform(y, function() {
      return n(this.__zoom.translate(
        typeof I == "function" ? I.apply(this, arguments) : I,
        typeof C == "function" ? C.apply(this, arguments) : C
      ), t.apply(this, arguments), a);
    }, null, H);
  }, _.translateTo = function(y, I, C, H, F) {
    _.transform(y, function() {
      var q = t.apply(this, arguments), U = this.__zoom, ne = H == null ? b(q) : typeof H == "function" ? H.apply(this, arguments) : H;
      return n(gl.translate(ne[0], ne[1]).scale(U.k).translate(
        typeof I == "function" ? -I.apply(this, arguments) : -I,
        typeof C == "function" ? -C.apply(this, arguments) : -C
      ), q, a);
    }, H, F);
  };
  function E(y, I) {
    return I = Math.max(r[0], Math.min(r[1], I)), I === y.k ? y : new zt(I, y.x, y.y);
  }
  function w(y, I, C) {
    var H = I[0] - C[0] * y.k, F = I[1] - C[1] * y.k;
    return H === y.x && F === y.y ? y : new zt(y.k, H, F);
  }
  function b(y) {
    return [(+y[0][0] + +y[1][0]) / 2, (+y[0][1] + +y[1][1]) / 2];
  }
  function S(y, I, C, H) {
    y.on("start.zoom", function() {
      N(this, arguments).event(H).start();
    }).on("interrupt.zoom end.zoom", function() {
      N(this, arguments).event(H).end();
    }).tween("zoom", function() {
      var F = this, q = arguments, U = N(F, q).event(H), ne = t.apply(F, q), ue = C == null ? b(ne) : typeof C == "function" ? C.apply(F, q) : C, G = Math.max(ne[1][0] - ne[0][0], ne[1][1] - ne[0][1]), J = F.__zoom, K = typeof I == "function" ? I.apply(F, q) : I, X = l(J.invert(ue).concat(G / J.k), K.invert(ue).concat(G / K.k));
      return function(oe) {
        if (oe === 1) oe = K;
        else {
          var le = X(oe), fe = G / le[2];
          oe = new zt(fe, ue[0] - le[0] * fe, ue[1] - le[1] * fe);
        }
        U.zoom(null, oe);
      };
    });
  }
  function N(y, I, C) {
    return !C && y.__zooming || new V(y, I);
  }
  function V(y, I) {
    this.that = y, this.args = I, this.active = 0, this.sourceEvent = null, this.extent = t.apply(y, I), this.taps = 0;
  }
  V.prototype = {
    event: function(y) {
      return y && (this.sourceEvent = y), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(y, I) {
      return this.mouse && y !== "mouse" && (this.mouse[1] = I.invert(this.mouse[0])), this.touch0 && y !== "touch" && (this.touch0[1] = I.invert(this.touch0[0])), this.touch1 && y !== "touch" && (this.touch1[1] = I.invert(this.touch1[0])), this.that.__zoom = I, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(y) {
      var I = Kt(this.that).datum();
      c.call(
        y,
        this.that,
        new $T(y, {
          sourceEvent: this.sourceEvent,
          target: _,
          transform: this.that.__zoom,
          dispatch: c
        }),
        I
      );
    }
  };
  function A(y, ...I) {
    if (!e.apply(this, arguments)) return;
    var C = N(this, I).event(y), H = this.__zoom, F = Math.max(r[0], Math.min(r[1], H.k * Math.pow(2, i.apply(this, arguments)))), q = Yt(y);
    if (C.wheel)
      (C.mouse[0][0] !== q[0] || C.mouse[0][1] !== q[1]) && (C.mouse[1] = H.invert(C.mouse[0] = q)), clearTimeout(C.wheel);
    else {
      if (H.k === F) return;
      C.mouse = [q, H.invert(q)], mi(this), C.start();
    }
    Yn(y), C.wheel = setTimeout(U, v), C.zoom("mouse", n(w(E(H, F), C.mouse[0], C.mouse[1]), C.extent, a));
    function U() {
      C.wheel = null, C.end();
    }
  }
  function T(y, ...I) {
    if (h || !e.apply(this, arguments)) return;
    var C = y.currentTarget, H = N(this, I, !0).event(y), F = Kt(y.view).on("mousemove.zoom", ue, !0).on("mouseup.zoom", G, !0), q = Yt(y, C), U = y.clientX, ne = y.clientY;
    BI(y.view), Pa(y), H.mouse = [q, this.__zoom.invert(q)], mi(this), H.start();
    function ue(J) {
      if (Yn(J), !H.moved) {
        var K = J.clientX - U, X = J.clientY - ne;
        H.moved = K * K + X * X > g;
      }
      H.event(J).zoom("mouse", n(w(H.that.__zoom, H.mouse[0] = Yt(J, C), H.mouse[1]), H.extent, a));
    }
    function G(J) {
      F.on("mousemove.zoom mouseup.zoom", null), FI(J.view, H.moved), Yn(J), H.event(J).end();
    }
  }
  function L(y, ...I) {
    if (e.apply(this, arguments)) {
      var C = this.__zoom, H = Yt(y.changedTouches ? y.changedTouches[0] : y, this), F = C.invert(H), q = C.k * (y.shiftKey ? 0.5 : 2), U = n(w(E(C, q), H, F), t.apply(this, I), a);
      Yn(y), s > 0 ? Kt(this).transition().duration(s).call(S, U, H, y) : Kt(this).call(_.transform, U, H, y);
    }
  }
  function M(y, ...I) {
    if (e.apply(this, arguments)) {
      var C = y.touches, H = C.length, F = N(this, I, y.changedTouches.length === H).event(y), q, U, ne, ue;
      for (Pa(y), U = 0; U < H; ++U)
        ne = C[U], ue = Yt(ne, this), ue = [ue, this.__zoom.invert(ue), ne.identifier], F.touch0 ? !F.touch1 && F.touch0[2] !== ue[2] && (F.touch1 = ue, F.taps = 0) : (F.touch0 = ue, q = !0, F.taps = 1 + !!u);
      u && (u = clearTimeout(u)), q && (F.taps < 2 && (d = ue[0], u = setTimeout(function() {
        u = null;
      }, p)), mi(this), F.start());
    }
  }
  function k(y, ...I) {
    if (this.__zooming) {
      var C = N(this, I).event(y), H = y.changedTouches, F = H.length, q, U, ne, ue;
      for (Yn(y), q = 0; q < F; ++q)
        U = H[q], ne = Yt(U, this), C.touch0 && C.touch0[2] === U.identifier ? C.touch0[0] = ne : C.touch1 && C.touch1[2] === U.identifier && (C.touch1[0] = ne);
      if (U = C.that.__zoom, C.touch1) {
        var G = C.touch0[0], J = C.touch0[1], K = C.touch1[0], X = C.touch1[1], oe = (oe = K[0] - G[0]) * oe + (oe = K[1] - G[1]) * oe, le = (le = X[0] - J[0]) * le + (le = X[1] - J[1]) * le;
        U = E(U, Math.sqrt(oe / le)), ne = [(G[0] + K[0]) / 2, (G[1] + K[1]) / 2], ue = [(J[0] + X[0]) / 2, (J[1] + X[1]) / 2];
      } else if (C.touch0) ne = C.touch0[0], ue = C.touch0[1];
      else return;
      C.zoom("touch", n(w(U, ne, ue), C.extent, a));
    }
  }
  function B(y, ...I) {
    if (this.__zooming) {
      var C = N(this, I).event(y), H = y.changedTouches, F = H.length, q, U;
      for (Pa(y), h && clearTimeout(h), h = setTimeout(function() {
        h = null;
      }, p), q = 0; q < F; ++q)
        U = H[q], C.touch0 && C.touch0[2] === U.identifier ? delete C.touch0 : C.touch1 && C.touch1[2] === U.identifier && delete C.touch1;
      if (C.touch1 && !C.touch0 && (C.touch0 = C.touch1, delete C.touch1), C.touch0) C.touch0[1] = this.__zoom.invert(C.touch0[0]);
      else if (C.end(), C.taps === 2 && (U = Yt(U, this), Math.hypot(d[0] - U[0], d[1] - U[1]) < m)) {
        var ne = Kt(this).on("dblclick.zoom");
        ne && ne.apply(this, arguments);
      }
    }
  }
  return _.wheelDelta = function(y) {
    return arguments.length ? (i = typeof y == "function" ? y : ni(+y), _) : i;
  }, _.filter = function(y) {
    return arguments.length ? (e = typeof y == "function" ? y : ni(!!y), _) : e;
  }, _.touchable = function(y) {
    return arguments.length ? (o = typeof y == "function" ? y : ni(!!y), _) : o;
  }, _.extent = function(y) {
    return arguments.length ? (t = typeof y == "function" ? y : ni([[+y[0][0], +y[0][1]], [+y[1][0], +y[1][1]]]), _) : t;
  }, _.scaleExtent = function(y) {
    return arguments.length ? (r[0] = +y[0], r[1] = +y[1], _) : [r[0], r[1]];
  }, _.translateExtent = function(y) {
    return arguments.length ? (a[0][0] = +y[0][0], a[1][0] = +y[1][0], a[0][1] = +y[0][1], a[1][1] = +y[1][1], _) : [[a[0][0], a[0][1]], [a[1][0], a[1][1]]];
  }, _.constrain = function(y) {
    return arguments.length ? (n = y, _) : n;
  }, _.duration = function(y) {
    return arguments.length ? (s = +y, _) : s;
  }, _.interpolate = function(y) {
    return arguments.length ? (l = y, _) : l;
  }, _.on = function() {
    var y = c.on.apply(c, arguments);
    return y === c ? _ : y;
  }, _.clickDistance = function(y) {
    return arguments.length ? (g = (y = +y) * y, _) : Math.sqrt(g);
  }, _.tapDistance = function(y) {
    return arguments.length ? (m = +y, _) : m;
  }, _;
}
const Ip = Symbol("MiniMapSlots"), MT = ["id", "x", "y", "rx", "ry", "width", "height", "fill", "stroke", "stroke-width", "shape-rendering"], OT = {
  name: "MiniMapNode",
  compatConfig: { MODE: 3 },
  inheritAttrs: !1
}, RT = /* @__PURE__ */ we({
  ...OT,
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
    const n = e, i = Ht(Ip), o = Es(), r = Ne(() => o.style ?? {});
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
    return (d, h) => !d.hidden && d.dimensions.width !== 0 && d.dimensions.height !== 0 ? ($(), R(de, { key: 0 }, [
      f(i)[`node-${n.type}`] ? ($(), se(Xt(f(i)[`node-${n.type}`]), Um(oo({ key: 0 }, { ...n, ...d.$attrs })), null, 16)) : ($(), R("rect", oo({
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
      }), null, 16, MT))
    ], 64)) : Q("", !0);
  }
}), DT = ["width", "height", "viewBox", "aria-labelledby"], PT = ["id"], LT = ["d", "fill", "stroke", "stroke-width"], zT = {
  name: "MiniMap",
  compatConfig: { MODE: 3 }
}, VT = /* @__PURE__ */ we({
  ...zT,
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
    const n = gd(), i = Es(), o = 200, r = 150, { id: a, edges: s, viewport: l, translateExtent: c, dimensions: u, emits: d, d3Selection: h, d3Zoom: p, getNodesInitialized: v } = De(), g = j();
    Zt(Ip, n);
    const m = Ne(() => {
      var F;
      return e.width ?? ((F = i.style) == null ? void 0 : F.width) ?? o;
    }), _ = Ne(() => {
      var F;
      return e.height ?? ((F = i.style) == null ? void 0 : F.height) ?? r;
    }), E = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision", w = W(() => typeof e.nodeColor == "string" ? () => e.nodeColor : e.nodeColor), b = W(
      () => typeof e.nodeStrokeColor == "string" ? () => e.nodeStrokeColor : e.nodeStrokeColor
    ), S = W(
      () => typeof e.nodeClassName == "string" ? () => e.nodeClassName : typeof e.nodeClassName == "function" ? e.nodeClassName : () => ""
    ), N = W(() => Ws(v.value.filter((F) => !F.hidden))), V = W(() => ({
      x: -l.value.x / l.value.zoom,
      y: -l.value.y / l.value.zoom,
      width: u.value.width / l.value.zoom,
      height: u.value.height / l.value.zoom
    })), A = W(
      () => v.value && v.value.length ? m_(N.value, V.value) : V.value
    ), T = W(() => {
      const F = A.value.width / m.value, q = A.value.height / _.value;
      return Math.max(F, q);
    }), L = W(() => {
      const F = T.value * m.value, q = T.value * _.value, U = e.offsetScale * T.value;
      return {
        offset: U,
        x: A.value.x - (F - A.value.width) / 2 - U,
        y: A.value.y - (q - A.value.height) / 2 - U,
        width: F + U * 2,
        height: q + U * 2
      };
    }), M = W(() => !L.value.x || !L.value.y ? "" : `
    M${L.value.x - L.value.offset},${L.value.y - L.value.offset}
    h${L.value.width + L.value.offset * 2}
    v${L.value.height + L.value.offset * 2}
    h${-L.value.width - L.value.offset * 2}z
    M${V.value.x + e.maskBorderRadius},${V.value.y}
    h${V.value.width - 2 * e.maskBorderRadius}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 ${e.maskBorderRadius},${e.maskBorderRadius}
    v${V.value.height - 2 * e.maskBorderRadius}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 -${e.maskBorderRadius},${e.maskBorderRadius}
    h${-(V.value.width - 2 * e.maskBorderRadius)}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 -${e.maskBorderRadius},-${e.maskBorderRadius}
    v${-(V.value.height - 2 * e.maskBorderRadius)}
    a${e.maskBorderRadius},${e.maskBorderRadius} 0 0 1 ${e.maskBorderRadius},-${e.maskBorderRadius}z`);
    wd(
      (F) => {
        if (g.value) {
          const q = Kt(g.value), U = (G) => {
            if (G.sourceEvent.type !== "wheel" || !h.value || !p.value)
              return;
            const J = G.sourceEvent.ctrlKey && go() ? 10 : 1, K = -G.sourceEvent.deltaY * (G.sourceEvent.deltaMode === 1 ? 0.05 : G.sourceEvent.deltaMode ? 1 : 2e-3) * e.zoomStep, X = l.value.zoom * 2 ** (K * J);
            p.value.scaleTo(h.value, X);
          }, ne = (G) => {
            if (G.sourceEvent.type !== "mousemove" || !h.value || !p.value)
              return;
            const J = T.value * Math.max(1, l.value.zoom) * (e.inversePan ? -1 : 1), K = {
              x: l.value.x - G.sourceEvent.movementX * J,
              y: l.value.y - G.sourceEvent.movementY * J
            }, X = [
              [0, 0],
              [u.value.width, u.value.height]
            ], oe = gl.translate(K.x, K.y).scale(l.value.zoom), le = p.value.constrain()(oe, X, c.value);
            p.value.transform(h.value, le);
          }, ue = TT().wheelDelta((G) => Qa(G) * (e.zoomStep / 10)).on("zoom", e.pannable ? ne : () => {
          }).on("zoom.wheel", e.zoomable ? U : () => {
          });
          q.call(ue), F(() => {
            q.on("zoom", null);
          });
        }
      },
      { flush: "post" }
    );
    function k(F) {
      const [q, U] = Yt(F);
      t("click", { event: F, position: { x: q, y: U } });
    }
    function B(F, q) {
      const U = { event: F, node: q, connectedEdges: on([q], s.value) };
      d.miniMapNodeClick(U), t("nodeClick", U);
    }
    function y(F, q) {
      const U = { event: F, node: q, connectedEdges: on([q], s.value) };
      d.miniMapNodeDoubleClick(U), t("nodeDblclick", U);
    }
    function I(F, q) {
      const U = { event: F, node: q, connectedEdges: on([q], s.value) };
      d.miniMapNodeMouseEnter(U), t("nodeMouseenter", U);
    }
    function C(F, q) {
      const U = { event: F, node: q, connectedEdges: on([q], s.value) };
      d.miniMapNodeMouseMove(U), t("nodeMousemove", U);
    }
    function H(F, q) {
      const U = { event: F, node: q, connectedEdges: on([q], s.value) };
      d.miniMapNodeMouseLeave(U), t("nodeMouseleave", U);
    }
    return (F, q) => ($(), se(f(Jf), {
      position: F.position,
      class: Ie(["vue-flow__minimap", { pannable: F.pannable, zoomable: F.zoomable }])
    }, {
      default: ie(() => [
        ($(), R("svg", {
          ref_key: "el",
          ref: g,
          width: m.value,
          height: _.value,
          viewBox: [L.value.x, L.value.y, L.value.width, L.value.height].join(" "),
          role: "img",
          "aria-labelledby": `vue-flow__minimap-${f(a)}`,
          onClick: k
        }, [
          F.ariaLabel ? ($(), R("title", {
            key: 0,
            id: `vue-flow__minimap-${f(a)}`
          }, Z(F.ariaLabel), 9, PT)) : Q("", !0),
          ($(!0), R(de, null, Oe(f(v), (U) => ($(), se(RT, {
            id: U.id,
            key: U.id,
            f: "",
            position: U.computedPosition,
            dimensions: U.dimensions,
            selected: U.selected,
            dragging: U.dragging,
            style: He(U.style),
            class: Ie(S.value(U)),
            color: w.value(U),
            "border-radius": F.nodeBorderRadius,
            "stroke-color": b.value(U),
            "stroke-width": F.nodeStrokeWidth,
            "shape-rendering": f(E),
            type: U.type,
            hidden: U.hidden,
            onClick: (ne) => B(ne, U),
            onDblclick: (ne) => y(ne, U),
            onMouseenter: (ne) => I(ne, U),
            onMousemove: (ne) => C(ne, U),
            onMouseleave: (ne) => H(ne, U)
          }, null, 8, ["id", "position", "dimensions", "selected", "dragging", "style", "class", "color", "border-radius", "stroke-color", "stroke-width", "shape-rendering", "type", "hidden", "onClick", "onDblclick", "onMouseenter", "onMousemove", "onMouseleave"]))), 128)),
          x("path", {
            class: "vue-flow__minimap-mask",
            d: M.value,
            fill: F.maskColor,
            stroke: F.maskStrokeColor,
            "stroke-width": F.maskStrokeWidth,
            "fill-rule": "evenodd"
          }, null, 8, LT)
        ], 8, DT))
      ]),
      _: 1
    }, 8, ["position", "class"]));
  }
}), BT = {
  id: "workflow-step-palette",
  class: "wf-palette"
}, FT = { class: "wf-palette-scroll" }, HT = {
  key: 0,
  class: "wf-palette-loading"
}, qT = ["id"], UT = { class: "wf-palette-ico wf-palette-ico--note" }, WT = { class: "wf-palette-ico wf-palette-ico--note" }, YT = { class: "wf-palette-count" }, GT = ["id"], jT = { class: "wf-palette-count" }, XT = { class: "wf-palette-item-body" }, KT = { class: "wf-palette-item-t" }, ZT = {
  key: 0,
  class: "wf-palette-item-s"
}, JT = /* @__PURE__ */ we({
  __name: "Palette",
  props: {
    items: {},
    loading: { type: Boolean },
    errors: {}
  },
  emits: ["place", "place-note", "place-frame"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = j(""), r = j(/* @__PURE__ */ new Set(["Tools", "Destinations", "Notes"])), a = W(() => o.value.trim().length > 0);
    function s(w) {
      return a.value || !r.value.has(w);
    }
    const l = W(() => yN(n.items, o.value, tg));
    function c(w) {
      const b = new Set(r.value);
      b.has(w) ? b.delete(w) : b.add(w), r.value = b;
    }
    function u(w) {
      return `palette-group-${w.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    }
    const d = j(/* @__PURE__ */ new Set());
    function h(w, b) {
      return `${w}::${b}`;
    }
    function p(w, b) {
      return a.value || d.value.has(h(w, b));
    }
    function v(w, b) {
      const S = h(w, b), N = new Set(d.value);
      N.has(S) ? N.delete(S) : N.add(S), d.value = N;
    }
    function g(w) {
      if (w.items.length < pN)
        return w.items.map((S) => ({ kind: "item", key: S.paletteId, item: S }));
      const b = [];
      for (const S of mN(w.items)) {
        const N = p(w.cat, S.module);
        if (b.push({ kind: "sub", key: `s:${S.module}`, module: S.module, count: S.items.length, open: N }), N) for (const V of S.items) b.push({ kind: "item", key: `${S.module}:${V.paletteId}`, item: V });
      }
      return b;
    }
    function m(w, b) {
      w.dataTransfer && (w.dataTransfer.setData("application/wf-item", b.paletteId), w.dataTransfer.effectAllowed = "copy");
    }
    function _(w) {
      w.dataTransfer && (w.dataTransfer.setData("application/wf-item", "note:new"), w.dataTransfer.effectAllowed = "copy");
    }
    function E(w) {
      w.dataTransfer && (w.dataTransfer.setData("application/wf-item", "frame:new"), w.dataTransfer.effectAllowed = "copy");
    }
    return (w, b) => ($(), R("div", BT, [
      z(f(Od), { class: "wf-palette-search" }, {
        default: ie(() => [
          z(f(Rd), null, {
            default: ie(() => [
              z(f(ae), {
                icon: "tabler:search",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }),
          z(f(rt), {
            modelValue: o.value,
            "onUpdate:modelValue": b[0] || (b[0] = (S) => o.value = S),
            type: "text",
            placeholder: "Search steps  (⌘K)",
            "aria-label": "Search steps"
          }, null, 8, ["modelValue"])
        ]),
        _: 1
      }),
      x("div", FT, [
        e.loading ? ($(), R("div", HT, [
          z(f(yt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading catalog"
          }),
          b[3] || (b[3] = x("span", null, "Loading the catalog…", -1))
        ])) : Q("", !0),
        ($(!0), R(de, null, Oe(l.value, (S) => ($(), R("div", {
          key: S.cat,
          class: "wf-palette-group"
        }, [
          S.cat === "Notes" ? ($(), R(de, { key: 0 }, [
            z(f(pe), {
              class: "wf-palette-cat",
              severity: "secondary",
              text: "",
              "aria-expanded": s(S.cat),
              "aria-controls": u(S.cat),
              onClick: (N) => c(S.cat)
            }, {
              default: ie(() => [
                z(f(ae), {
                  icon: s(S.cat) ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                b[4] || (b[4] = x("span", null, "Notes", -1))
              ]),
              _: 2
            }, 1032, ["aria-expanded", "aria-controls", "onClick"]),
            s(S.cat) ? ($(), R("div", {
              key: 0,
              id: u(S.cat)
            }, [
              z(f(pe), {
                class: "wf-palette-item",
                severity: "secondary",
                text: "",
                draggable: "true",
                onClick: b[1] || (b[1] = (N) => i("place-note")),
                onDragstart: _
              }, {
                default: ie(() => [
                  x("span", UT, [
                    z(f(ae), {
                      icon: "tabler:note",
                      "aria-hidden": "true"
                    })
                  ]),
                  b[5] || (b[5] = x("span", { class: "wf-palette-item-body" }, [
                    x("span", { class: "wf-palette-item-t" }, "Sticky Note"),
                    x("span", { class: "wf-palette-item-s" }, "Annotate the canvas")
                  ], -1))
                ]),
                _: 1
              }),
              s(S.cat) ? ($(), se(f(pe), {
                key: 0,
                class: "wf-palette-item",
                severity: "secondary",
                text: "",
                draggable: "true",
                onClick: b[2] || (b[2] = (N) => i("place-frame")),
                onDragstart: E
              }, {
                default: ie(() => [
                  x("span", WT, [
                    z(f(ae), {
                      icon: "tabler:box",
                      "aria-hidden": "true"
                    })
                  ]),
                  b[6] || (b[6] = x("span", { class: "wf-palette-item-body" }, [
                    x("span", { class: "wf-palette-item-t" }, "Frame"),
                    x("span", { class: "wf-palette-item-s" }, "Group nodes in a colored region")
                  ], -1))
                ]),
                _: 1
              })) : Q("", !0)
            ], 8, qT)) : Q("", !0)
          ], 64)) : ($(), R(de, { key: 1 }, [
            z(f(pe), {
              class: "wf-palette-cat",
              severity: "secondary",
              text: "",
              "aria-expanded": s(S.cat),
              "aria-controls": u(S.cat),
              onClick: (N) => c(S.cat)
            }, {
              default: ie(() => [
                z(f(ae), {
                  icon: s(S.cat) ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                x("span", null, Z(S.cat), 1),
                x("span", YT, Z(S.items.length), 1)
              ]),
              _: 2
            }, 1032, ["aria-expanded", "aria-controls", "onClick"]),
            s(S.cat) ? ($(), R("div", {
              key: 0,
              id: u(S.cat)
            }, [
              ($(!0), R(de, null, Oe(g(S), (N) => ($(), R(de, {
                key: N.key
              }, [
                N.kind === "sub" ? ($(), se(f(pe), {
                  key: 0,
                  class: "wf-palette-subcat",
                  severity: "secondary",
                  text: "",
                  "aria-expanded": N.open,
                  onClick: (V) => v(S.cat, N.module)
                }, {
                  default: ie(() => [
                    z(f(ae), {
                      icon: N.open ? "tabler:chevron-down" : "tabler:chevron-right",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    x("span", null, Z(N.module), 1),
                    x("span", jT, Z(N.count), 1)
                  ]),
                  _: 2
                }, 1032, ["aria-expanded", "onClick"])) : ($(), se(f(pe), {
                  key: 1,
                  class: "wf-palette-item",
                  severity: "secondary",
                  text: "",
                  draggable: "true",
                  onClick: (V) => i("place", N.item),
                  onDragstart: (V) => m(V, N.item)
                }, {
                  default: ie(() => [
                    x("span", {
                      class: Ie(["wf-palette-ico", `wf-palette-ico--${N.item.kind}`])
                    }, [
                      z(f(ae), {
                        icon: N.item.icon,
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ], 2),
                    x("span", XT, [
                      x("span", KT, Z(N.item.title), 1),
                      N.item.subtitle ? ($(), R("span", ZT, Z(N.item.subtitle), 1)) : Q("", !0)
                    ])
                  ]),
                  _: 2
                }, 1032, ["onClick", "onDragstart"]))
              ], 64))), 128))
            ], 8, GT)) : Q("", !0)
          ], 64))
        ]))), 128)),
        e.errors.length ? ($(), se(f(Be), {
          key: 1,
          class: "wf-palette-errors",
          severity: "warn",
          closable: !1
        }, {
          default: ie(() => [
            he(" Some catalogs couldn’t load. " + Z(e.errors[0]), 1)
          ]),
          _: 1
        })) : Q("", !0)
      ])
    ]));
  }
});
function QT(e) {
  return `flow-run-${(e || "run").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "run"}.redacted.json`;
}
const eM = {
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
function tM(e, t = []) {
  const n = new Map(t.map((o) => [o.engine_node_id, o]));
  function i(o) {
    const r = /* @__PURE__ */ new Set();
    let a = n.get(o);
    for (; a && !r.has(a.engine_node_id); ) {
      r.add(a.engine_node_id);
      const s = a.title.trim();
      if (s && !Dh(s)) return s;
      a = n.get(a.parent_engine_node_id || "");
    }
    return "Step";
  }
  return e.map((o, r) => {
    const a = o.raw && typeof o.raw == "object" && !Array.isArray(o.raw) ? o.raw : {};
    let s = eM[o.type] || "Activity recorded";
    if (o.type === "node.updated") {
      const l = typeof a.status == "string" ? a.status : "", c = yg(l);
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
const nM = {
  class: "wf-run-timeline",
  "aria-label": "Run timeline"
}, oM = { class: "wf-run-section-h" }, iM = {
  key: 0,
  class: "wf-panel-note"
}, rM = {
  key: 2,
  class: "wf-panel-hint"
}, aM = {
  key: 3,
  class: "wf-timeline-list"
}, sM = { class: "wf-timeline-head" }, lM = { class: "wf-timeline-type" }, uM = { class: "wf-timeline-when" }, cM = { class: "wf-timeline-outcome" }, dM = /* @__PURE__ */ we({
  __name: "RunTimeline",
  props: {
    workflowId: {},
    runId: {},
    nodeHeaders: {}
  },
  setup(e) {
    const t = e, n = j(!1), i = j(!1), o = j(""), r = j(null);
    async function a(s = !0) {
      s ? (n.value = !0, o.value = "", r.value = null) : i.value = !0;
      try {
        const l = s ? 0 : r.value?.next_offset ?? 0, c = await wg(t.workflowId, t.runId, 100, l);
        !s && r.value && (c.events = [...r.value.events, ...c.events]), r.value = c;
      } catch (l) {
        o.value = qe(l, "Couldn’t load this run’s timeline. Try again.");
      } finally {
        n.value = !1, i.value = !1;
      }
    }
    return ke(() => [t.workflowId, t.runId], () => {
      a();
    }), Ue(() => {
      a();
    }), (s, l) => ($(), R("section", nM, [
      x("div", oM, [
        z(f(ae), {
          icon: "tabler:timeline-event",
          "aria-hidden": "true"
        }),
        l[2] || (l[2] = x("span", null, "Timeline", -1))
      ]),
      l[5] || (l[5] = x("p", { class: "wf-panel-hint" }, "Steps and outcomes recorded for this run.", -1)),
      n.value ? ($(), R("div", iM, [
        z(f(yt), {
          class: "wf-status-spinner",
          "stroke-width": "4",
          "aria-label": "Loading timeline"
        }),
        l[3] || (l[3] = x("span", null, "Loading timeline…", -1))
      ])) : o.value ? ($(), se(f(Be), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: ie(() => [
          he(Z(o.value) + " ", 1),
          z(f(pe), {
            label: "Try again",
            link: "",
            size: "small",
            onClick: l[0] || (l[0] = (c) => a())
          })
        ]),
        _: 1
      })) : r.value?.events.length ? ($(), R("ol", aM, [
        ($(!0), R(de, null, Oe(f(tM)(r.value.events, e.nodeHeaders), (c) => ($(), R("li", {
          key: c.key,
          class: "wf-timeline-event"
        }, [
          x("div", sM, [
            x("span", lM, Z(c.title), 1)
          ]),
          x("span", uM, Z(f(Qt)(c.occurredAt)), 1),
          x("p", cM, Z(c.outcome), 1)
        ]))), 128))
      ])) : ($(), R("p", rM, "No activity was recorded for this run.")),
      r.value?.next_offset != null ? ($(), se(f(pe), {
        key: 4,
        severity: "secondary",
        outlined: "",
        disabled: i.value,
        loading: i.value,
        onClick: l[1] || (l[1] = (c) => a(!1))
      }, {
        default: ie(() => [
          i.value ? Q("", !0) : ($(), se(f(ae), {
            key: 0,
            icon: "tabler:plus",
            "aria-hidden": "true"
          })),
          l[4] || (l[4] = x("span", null, "Load more activity", -1))
        ]),
        _: 1
      }, 8, ["disabled", "loading"])) : Q("", !0)
    ]));
  }
}), fM = { class: "wf-panel wf-panel--run" }, hM = { class: "wf-panel-hdr wf-panel-hdr--run" }, pM = { class: "wf-panel-how" }, vM = { key: 0 }, mM = { class: "wf-run-actions" }, gM = { class: "wf-run-actions" }, yM = {
  key: 2,
  class: "wf-panel-hint wf-run-select-hint"
}, wM = { class: "wf-panel-label" }, bM = {
  key: 0,
  class: "wf-run-status"
}, _M = {
  key: 0,
  class: "wf-run-timing"
}, kM = {
  key: 1,
  class: "wf-panel-note"
}, EM = {
  key: 0,
  class: "wf-run-fail"
}, xM = { class: "wf-run-fail-h" }, $M = {
  key: 0,
  class: "wf-run-fail-code"
}, SM = {
  key: 1,
  class: "wf-run-fail-note"
}, CM = { key: 0 }, NM = {
  key: 4,
  class: "wf-run-trace"
}, IM = { class: "wf-run-section-h" }, AM = { class: "wf-panel-hint" }, TM = {
  class: "wf-run-tool-list",
  "aria-label": "Tools called"
}, MM = { key: 0 }, OM = {
  key: 1,
  class: "wf-run-tool-id"
}, RM = {
  key: 5,
  class: "wf-panel-hint"
}, od = /* @__PURE__ */ we({
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
    const n = e, i = t, o = j(!1), r = j(null), a = j(""), s = j({});
    let l = 0;
    function c(M) {
      return M && typeof M == "object" && !Array.isArray(M) ? M : {};
    }
    function u(M) {
      return typeof M == "string" ? M.trim() : "";
    }
    function d(M) {
      return u(c(M).registry_id);
    }
    function h(M) {
      const k = c(M);
      return s.value[d(M)] || u(k.title) || u(k.name) || "Tool";
    }
    function p(M) {
      return u(c(M).name);
    }
    async function v(M, k) {
      const B = [...new Set(M.flatMap((y) => y.toolCalls.map(d).filter(Boolean)))];
      if (B.length)
        try {
          const { data: y } = await zn.get(`/api/v1/agents/tools?ids=${encodeURIComponent(B.join(","))}`);
          if (k !== l) return;
          const I = {}, C = Array.isArray(y?.tools) ? y.tools : [];
          for (const H of C) {
            const F = u(H?.id), q = u(H?.title);
            F && q && (I[F] = q);
          }
          s.value = I;
        } catch {
        }
    }
    async function g() {
      const M = ++l;
      r.value = null, s.value = {}, a.value = "";
      const k = n.node;
      if (k) {
        o.value = !0;
        try {
          const B = await Td(n.workflowId, n.run.run_id, k.id), y = bg(B, {
            failed: n.nodeStatus === "failed",
            runError: n.run.error
          });
          if (M !== l) return;
          r.value = y, v(y.agentActions, M);
        } catch {
          a.value = "Couldn’t load this step’s data.";
        } finally {
          o.value = !1;
        }
      }
    }
    ke(() => [n.run.run_id, n.node?.id, n.nodeStatus], g, { immediate: !0 }), Ue(() => {
      Ki("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    const m = W(() => Je(n.node?.title, n.node?.ref) || "Step"), _ = W(() => {
      const M = r.value?.timing.durationMs;
      return M != null ? Ad(M) : "";
    }), E = W(() => {
      const M = r.value;
      return !!M && (M.input != null || M.output != null || M.error != null || M.agentActions.length > 0);
    }), w = W(() => r.value?.dataUnavailable || n.run.step_data_retention_days != null && ["completed", "failed", "cancelled", "terminated"].includes(n.run.status) && r.value?.input == null && r.value?.output == null), b = W(() => r.value?.output != null), S = W(() => Qn(n.run.flow_ref?.version ?? 0)), N = j("overview"), V = j(!1), A = j("");
    function T(M) {
      const k = Is(M);
      return k === "ok" ? "success" : k === "error" ? "danger" : "info";
    }
    async function L() {
      if (!V.value) {
        V.value = !0, A.value = "";
        try {
          Ps(QT(n.run.run_id), await _g(n.workflowId, n.run.run_id));
        } catch {
          A.value = "Couldn’t download the run details. Try again.";
        } finally {
          V.value = !1;
        }
      }
    }
    return (M, k) => ($(), R("aside", fM, [
      z(f(pe), {
        class: "wf-panel-close",
        text: "",
        rounded: "",
        severity: "secondary",
        title: "Close inspector",
        "aria-label": "Close inspector",
        onClick: k[0] || (k[0] = (B) => i("close"))
      }, {
        default: ie(() => [
          z(f(ae), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }),
      x("div", hM, [
        z(f(ae), {
          icon: "tabler:history",
          "aria-hidden": "true"
        }),
        k[4] || (k[4] = x("span", { class: "wf-panel-hdr-kind" }, "Viewing run", -1))
      ]),
      x("p", pM, [
        z(f(gt), {
          class: "wf-run-status-tag",
          severity: T(f(ao)(e.run)),
          value: f(ro)(f(ao)(e.run))
        }, null, 8, ["severity", "value"]),
        z(f(gt), {
          class: "wf-run-version-tag",
          severity: S.value.kind === "published" ? "secondary" : "warn",
          value: S.value.label,
          title: S.value.title
        }, null, 8, ["severity", "value", "title"]),
        x("span", null, [
          he(" Run " + Z(f(Ts)(e.run.run_id)) + " · started " + Z(f(Qt)(e.run.started_at)), 1),
          e.run.finished_at ? ($(), R("span", vM, " · finished " + Z(f(Qt)(e.run.finished_at)), 1)) : Q("", !0),
          k[5] || (k[5] = he(". Read-only — nothing here can be edited.", -1))
        ])
      ]),
      x("div", mM, [
        z(f(pe), {
          severity: "secondary",
          outlined: "",
          onClick: k[1] || (k[1] = (B) => i("rerun"))
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            k[6] || (k[6] = x("span", null, "Re-run with same input", -1))
          ]),
          _: 1
        }),
        z(f(pe), {
          severity: "secondary",
          outlined: "",
          onClick: k[2] || (k[2] = (B) => i("exit-run"))
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:pencil",
              "aria-hidden": "true"
            }),
            k[7] || (k[7] = x("span", null, "Back to editing", -1))
          ]),
          _: 1
        })
      ]),
      x("div", gM, [
        z(f(pe), {
          severity: "secondary",
          outlined: "",
          disabled: V.value,
          loading: V.value,
          onClick: L
        }, {
          default: ie(() => [
            V.value ? Q("", !0) : ($(), se(f(ae), {
              key: 0,
              icon: "tabler:download",
              "aria-hidden": "true"
            })),
            k[8] || (k[8] = x("span", null, "Download run details", -1))
          ]),
          _: 1
        }, 8, ["disabled", "loading"])
      ]),
      A.value ? ($(), se(f(Be), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: ie(() => [
          he(Z(A.value), 1)
        ]),
        _: 1
      })) : Q("", !0),
      z(f(Og), {
        value: N.value,
        "onUpdate:value": k[3] || (k[3] = (B) => N.value = B),
        class: "wf-run-tabs"
      }, {
        default: ie(() => [
          z(f(Mg), { "aria-label": "Run inspector sections" }, {
            default: ie(() => [
              z(f(Ll), { value: "overview" }, {
                default: ie(() => [...k[9] || (k[9] = [
                  he("Overview", -1)
                ])]),
                _: 1
              }),
              z(f(Ll), { value: "timeline" }, {
                default: ie(() => [...k[10] || (k[10] = [
                  he("Timeline", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      N.value === "timeline" ? ($(), se(dM, {
        key: 1,
        "workflow-id": e.workflowId,
        "run-id": e.run.run_id,
        "node-headers": e.nodeHeaders
      }, null, 8, ["workflow-id", "run-id", "node-headers"])) : e.node ? ($(), R(de, { key: 3 }, [
        x("div", wM, Z(m.value), 1),
        e.nodeStatus ? ($(), R("p", bM, [
          z(f(gt), {
            class: "wf-run-status-tag",
            severity: T(e.nodeStatus),
            value: f(ro)(e.nodeStatus)
          }, null, 8, ["severity", "value"]),
          _.value ? ($(), R("span", _M, [
            z(f(ae), {
              icon: "tabler:clock",
              "aria-hidden": "true"
            }),
            he(Z(_.value), 1)
          ])) : Q("", !0)
        ])) : Q("", !0),
        o.value ? ($(), R("div", kM, [
          z(f(yt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading step data"
          }),
          k[11] || (k[11] = x("span", null, "Loading this step’s data…", -1))
        ])) : a.value ? ($(), se(f(Be), {
          key: 2,
          severity: "error",
          closable: !1
        }, {
          default: ie(() => [
            he(Z(a.value), 1)
          ]),
          _: 1
        })) : r.value ? ($(), R(de, { key: 3 }, [
          r.value.error ? ($(), R("div", EM, [
            x("div", xM, [
              z(f(ae), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              x("span", null, Z(r.value.error.message), 1)
            ]),
            r.value.error.code ? ($(), R("span", $M, Z(r.value.error.code), 1)) : Q("", !0),
            r.value.error.hasDetail ? r.value.error.detail != null ? ($(), se(Fn, {
              key: 2,
              value: r.value.error.detail,
              label: "Error detail",
              icon: "tabler:alert-triangle",
              open: !1
            }, null, 8, ["value"])) : Q("", !0) : ($(), R("p", SM, "No further detail was recorded for this failure. Re-run with the same input to try again, or open the step to adjust it."))
          ])) : Q("", !0),
          w.value ? ($(), se(f(Be), {
            key: 1,
            severity: "info",
            closable: !1
          }, {
            default: ie(() => [
              k[12] || (k[12] = he("Step data is no longer available", -1)),
              e.run.step_data_retention_days != null ? ($(), R("span", CM, ". Step data is kept for " + Z(e.run.step_data_retention_days) + " days.", 1)) : Q("", !0)
            ]),
            _: 1
          })) : Q("", !0),
          r.value.input != null ? ($(), se(Fn, {
            key: 2,
            value: r.value.input,
            label: "Input",
            icon: "tabler:login-2"
          }, null, 8, ["value"])) : Q("", !0),
          b.value ? ($(), se(Fn, {
            key: 3,
            value: r.value.output,
            label: "Output",
            icon: "tabler:logout-2"
          }, null, 8, ["value"])) : Q("", !0),
          r.value.agentActions.length ? ($(), R("section", NM, [
            x("div", IM, [
              z(f(ae), {
                icon: "tabler:robot",
                "aria-hidden": "true"
              }),
              k[13] || (k[13] = x("span", null, "Agent trace", -1))
            ]),
            ($(!0), R(de, null, Oe(r.value.agentActions, (B, y) => ($(), R("div", {
              key: y,
              class: "wf-run-trace-item"
            }, [
              x("p", AM, Z(B.toolCalls.length ? `Called ${B.toolCalls.length} tool${B.toolCalls.length === 1 ? "" : "s"}` : "No tools were called — the model answered directly."), 1),
              B.toolCalls.length ? ($(), R(de, { key: 0 }, [
                x("ul", TM, [
                  ($(!0), R(de, null, Oe(B.toolCalls, (I, C) => ($(), R("li", { key: C }, [
                    x("strong", null, Z(h(I)), 1),
                    p(I) && p(I) !== h(I) ? ($(), R("span", MM, " · " + Z(p(I)), 1)) : Q("", !0),
                    d(I) ? ($(), R("code", OM, Z(d(I)), 1)) : Q("", !0)
                  ]))), 128))
                ]),
                z(Fn, {
                  value: B.toolCalls,
                  label: "Tool call details",
                  icon: "tabler:tool",
                  open: !1
                }, null, 8, ["value"])
              ], 64)) : Q("", !0),
              z(Fn, {
                value: B.raw,
                label: "Generation",
                icon: "tabler:sparkles",
                open: !1
              }, null, 8, ["value"])
            ]))), 128))
          ])) : Q("", !0),
          !E.value && !w.value ? ($(), R("p", RM, "This step recorded no input or output in this run.")) : Q("", !0)
        ], 64)) : Q("", !0)
      ], 64)) : ($(), R("p", yM, "Click a step on the canvas to see what it received and produced in this run."))
    ]));
  }
}), DM = {
  key: 0,
  class: "wf-runs-loading"
}, PM = {
  key: 2,
  class: "wf-sim-note"
}, LM = {
  key: 3,
  class: "wf-runs-list"
}, zM = { class: "wf-runs-meta" }, VM = { class: "wf-runs-time" }, BM = { class: "wf-runs-id" }, FM = ["title"], HM = {
  class: "wf-runs-duration",
  title: "Duration"
}, qM = /* @__PURE__ */ we({
  __name: "RunsPanel",
  props: {
    rows: {},
    loading: { type: Boolean },
    error: {}
  },
  emits: ["select", "close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = W(() => kg(n.rows).map((s) => ({
      row: s,
      ver: Qn(s.flow_ref?.version ?? 0),
      cause: As(s),
      duration: s.started_at && s.finished_at ? Ad(Date.parse(s.finished_at) - Date.parse(s.started_at)) : "—"
    })));
    function r(s) {
      const l = Is(s);
      return l === "ok" ? "success" : l === "error" ? "danger" : "info";
    }
    function a(s) {
      s || i("close");
    }
    return (s, l) => ($(), se(f(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      header: "Runs",
      class: "wf-sim-pop wf-runs-pop",
      "onUpdate:visible": a
    }, {
      default: ie(() => [
        e.loading ? ($(), R("div", DM, [
          z(f(yt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Loading runs"
          }),
          l[0] || (l[0] = x("span", null, "Loading runs…", -1))
        ])) : e.error ? ($(), se(f(Be), {
          key: 1,
          severity: "error",
          closable: !1
        }, {
          default: ie(() => [
            he(Z(e.error), 1)
          ]),
          _: 1
        })) : o.value.length ? ($(), R("div", LM, [
          ($(!0), R(de, null, Oe(o.value, ({ row: c, ver: u, cause: d, duration: h }) => ($(), se(f(pe), {
            key: c.run_id,
            class: "wf-runs-row",
            text: "",
            severity: "secondary",
            onClick: (p) => i("select", c)
          }, {
            default: ie(() => [
              z(f(gt), {
                class: "wf-run-status-tag",
                severity: r(f(ao)(c)),
                value: f(ro)(f(ao)(c))
              }, null, 8, ["severity", "value"]),
              x("span", zM, [
                x("span", VM, "Started " + Z(f(Qt)(c.started_at || c.finished_at)), 1),
                x("span", BM, Z(f(Ts)(c.run_id)), 1),
                d ? ($(), R("span", {
                  key: 0,
                  class: "wf-runs-cause",
                  title: d
                }, Z(d), 9, FM)) : Q("", !0)
              ]),
              x("span", HM, Z(h), 1),
              z(f(gt), {
                class: "wf-run-version-tag",
                severity: u.kind === "published" ? "secondary" : "warn",
                value: u.label,
                title: u.title
              }, null, 8, ["severity", "value", "title"]),
              z(f(ae), {
                icon: "tabler:chevron-right",
                class: "wf-runs-go",
                "aria-hidden": "true"
              })
            ]),
            _: 2
          }, 1032, ["onClick"]))), 128))
        ])) : ($(), R("p", PM, "No runs yet. Choose “Run with an input”, or publish and trigger this Workflow, to see runs here."))
      ]),
      _: 1
    }));
  }
});
function UM(e, t) {
  return t == null ? !1 : e > t;
}
function La(e, t) {
  return t ?? e.length;
}
function WM(e) {
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
function za(e, t) {
  return e.length ? e.join(", ") : t > 0 ? `${t} field${t === 1 ? "" : "s"}` : "none";
}
function YM(e) {
  return `Restore v${e} as a new unpublished draft. This never changes version history.`;
}
function GM(e, t) {
  if (!e) return t;
  for (const o of ["title", "name", "label"])
    if (typeof e[o] == "string" && e[o]) return e[o];
  const n = typeof e.source_id == "string" ? e.source_id : "", i = typeof e.target_id == "string" ? e.target_id : "";
  return n && i ? `${n} → ${i}` : t;
}
function jM(e) {
  return e.map((t) => ({ id: t.id, name: GM(t.after || t.before, t.id) }));
}
function XM(e) {
  if (typeof e == "string" && e) return e;
  if (!e || typeof e != "object" || Array.isArray(e)) return "Input or result changed.";
  const t = e, n = typeof t.field == "string" ? t.field : typeof t.key == "string" ? t.key : "Input or result", i = typeof t.type == "string" ? t.type : typeof t.kind == "string" ? t.kind : "changed";
  return `${n}: ${i}`;
}
function KM(e) {
  const t = e.graph;
  return e.interface.changes.length > 0 || Object.values(t.nodes).some((n) => n.length > 0) || Object.values(t.edges).some((n) => n.length > 0);
}
const ZM = {
  key: 0,
  class: "wf-runs-loading"
}, JM = {
  key: 0,
  class: "wf-sim-note"
}, QM = { key: 0 }, eO = { key: 1 }, tO = { class: "wf-vers-list" }, nO = { class: "wf-vers-meta" }, oO = { class: "wf-vers-when" }, iO = {
  key: 0,
  class: "wf-vers-current"
}, rO = { class: "wf-vers-who" }, aO = {
  key: 0,
  class: "wf-vers-detail"
}, sO = {
  key: 0,
  class: "wf-runs-loading"
}, lO = { class: "wf-vers-detail-h" }, uO = { class: "wf-vers-detail-title" }, cO = {
  key: 0,
  class: "wf-sim-note"
}, dO = {
  key: 1,
  class: "wf-vers-io"
}, fO = { class: "wf-vers-io-row" }, hO = { class: "wf-vers-io-row" }, pO = { class: "wf-vers-io-row" }, vO = { class: "wf-vers-actions" }, mO = {
  key: 0,
  class: "wf-vers-compare"
}, gO = {
  key: 3,
  class: "wf-vers-diff",
  "aria-label": "Changes between versions"
}, yO = { class: "wf-vers-detail-h" }, wO = { class: "wf-vers-detail-title" }, bO = {
  key: 0,
  class: "wf-panel-hint"
}, _O = /* @__PURE__ */ we({
  __name: "VersionHistoryPanel",
  props: {
    workflowId: {},
    definitionEditSeq: {}
  },
  emits: ["close", "restore"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = j(!1), r = j(""), a = j([]), s = j(null), l = j(null), c = j(!1), u = j(""), d = j(null), h = j(null), p = j(!1), v = j(""), g = j(!1), m = j(""), _ = Dd();
    async function E() {
      o.value = !0, r.value = "";
      try {
        a.value = await Pd(n.workflowId), a.value.length && w(a.value[0].version);
      } catch (I) {
        r.value = qe(I, "Couldn’t load version history.");
      } finally {
        o.value = !1;
      }
    }
    async function w(I) {
      s.value = I, l.value = null, u.value = "", h.value = null, v.value = "", c.value = !0;
      try {
        const C = await Ld(n.workflowId, I);
        if (s.value !== I) return;
        l.value = C;
      } catch (C) {
        u.value = qe(C, "Couldn’t load this version.");
      } finally {
        s.value === I && (c.value = !1);
      }
    }
    Ue(E), ke(() => n.workflowId, () => {
      s.value = null, l.value = null, E();
    });
    const b = W(() => a.value[0] ?? null), S = W(() => UM(n.definitionEditSeq, b.value?.def_seq)), N = W(() => l.value ? WM(l.value.interface) : null), V = W(() => {
      const I = a.value.findIndex((C) => C.version === s.value);
      return I >= 0 ? a.value[I + 1]?.version ?? null : null;
    }), A = W(() => d.value || V.value), T = W(() => a.value.filter((I) => I.version !== s.value)), L = W(() => [
      { label: "previous version", value: null },
      ...T.value.map((I) => ({ label: `v${I.version}`, value: I.version }))
    ]);
    async function M() {
      if (!(s.value == null || A.value == null || p.value)) {
        p.value = !0, v.value = "", h.value = null;
        try {
          const I = Math.min(s.value, A.value), C = Math.max(s.value, A.value);
          h.value = await Ng(n.workflowId, I, C);
        } catch (I) {
          v.value = qe(I, "Couldn’t load this version diff.");
        } finally {
          p.value = !1;
        }
      }
    }
    async function k() {
      if (!(s.value == null || g.value)) {
        g.value = !0, m.value = "";
        try {
          i("restore", await Ig(n.workflowId, s.value));
        } catch (I) {
          m.value = qe(I, "Couldn’t restore this version as a new draft.");
        } finally {
          g.value = !1;
        }
      }
    }
    function B() {
      if (s.value == null || g.value) return;
      const I = {
        group: "version-restore",
        header: "Restore as new draft",
        message: YM(s.value),
        rejectLabel: "Cancel",
        acceptLabel: "Create new draft",
        accept: () => {
          k();
        }
      };
      _.require(I);
    }
    function y(I) {
      I || i("close");
    }
    return (I, C) => ($(), R(de, null, [
      z(f(zd), { group: "version-restore" }),
      z(f(Jt), {
        visible: !0,
        modal: "",
        "dismissable-mask": "",
        header: "Version history",
        class: "wf-sim-pop wf-vers-pop",
        "onUpdate:visible": y
      }, {
        default: ie(() => [
          o.value ? ($(), R("div", ZM, [
            z(f(yt), {
              class: "wf-status-spinner",
              "stroke-width": "4",
              "aria-label": "Loading versions"
            }),
            C[1] || (C[1] = x("span", null, "Loading versions…", -1))
          ])) : r.value ? ($(), se(f(Be), {
            key: 1,
            severity: "error",
            closable: !1
          }, {
            default: ie(() => [
              he(Z(r.value), 1)
            ]),
            _: 1
          })) : ($(), R(de, { key: 2 }, [
            a.value.length ? ($(), R(de, { key: 1 }, [
              x("p", {
                class: Ie(["wf-vers-draft", S.value ? "is-pending" : "is-clean"]),
                role: "status"
              }, [
                z(f(ae), {
                  icon: S.value ? "tabler:pencil" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                S.value ? ($(), R("span", QM, "Draft has unpublished edits since v" + Z(b.value?.version) + ".", 1)) : ($(), R("span", eO, "Draft matches v" + Z(b.value?.version) + " — nothing to publish.", 1))
              ], 2),
              x("div", tO, [
                ($(!0), R(de, null, Oe(a.value, (H, F) => ($(), se(f(pe), {
                  key: H.version,
                  class: Ie(["wf-vers-row", H.version === s.value && "is-selected"]),
                  text: "",
                  severity: "secondary",
                  onClick: (q) => w(H.version)
                }, {
                  default: ie(() => [
                    z(f(gt), {
                      class: "wf-version-tag",
                      severity: "secondary",
                      value: `v${H.version}`
                    }, null, 8, ["value"]),
                    x("span", nO, [
                      x("span", oO, [
                        he(Z(f(Qt)(H.created_at)), 1),
                        F === 0 ? ($(), R("span", iO, "Current")) : Q("", !0)
                      ]),
                      x("span", rO, Z(H.created_by || "Unknown"), 1)
                    ]),
                    z(f(ae), {
                      icon: "tabler:chevron-right",
                      class: "wf-runs-go",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 2
                }, 1032, ["class", "onClick"]))), 128))
              ]),
              s.value != null ? ($(), R("section", aO, [
                c.value ? ($(), R("div", sO, [
                  z(f(yt), {
                    class: "wf-status-spinner",
                    "stroke-width": "4",
                    "aria-label": `Loading version ${s.value}`
                  }, null, 8, ["aria-label"]),
                  x("span", null, "Loading v" + Z(s.value) + "…", 1)
                ])) : u.value ? ($(), se(f(Be), {
                  key: 1,
                  severity: "error",
                  closable: !1
                }, {
                  default: ie(() => [
                    he(Z(u.value), 1)
                  ]),
                  _: 1
                })) : l.value && N.value ? ($(), R(de, { key: 2 }, [
                  x("div", lO, [
                    x("span", uO, "v" + Z(l.value.version) + " inputs and results", 1),
                    C[2] || (C[2] = x("span", { class: "wf-vers-detail-note" }, "Read-only", -1))
                  ]),
                  N.value.empty ? ($(), R("p", cO, "This version does not define expected input, a result, or error details.")) : ($(), R("dl", dO, [
                    x("div", fO, [
                      C[3] || (C[3] = x("dt", null, "In", -1)),
                      x("dd", null, Z(f(za)(N.value.input, N.value.inputCount)), 1)
                    ]),
                    x("div", hO, [
                      C[4] || (C[4] = x("dt", null, "Out", -1)),
                      x("dd", null, Z(f(za)(N.value.output, N.value.outputCount)), 1)
                    ]),
                    x("div", pO, [
                      C[5] || (C[5] = x("dt", null, "Error", -1)),
                      x("dd", null, Z(f(za)(N.value.error, N.value.errorCount)), 1)
                    ])
                  ])),
                  x("div", vO, [
                    T.value.length ? ($(), R("label", mO, [
                      C[6] || (C[6] = he("Compare with ", -1)),
                      z(f(St), {
                        modelValue: d.value,
                        "onUpdate:modelValue": C[0] || (C[0] = (H) => d.value = H),
                        options: L.value,
                        "option-label": "label",
                        "option-value": "value",
                        "aria-label": "Compare with version"
                      }, null, 8, ["modelValue", "options"])
                    ])) : Q("", !0),
                    z(f(pe), {
                      severity: "secondary",
                      outlined: "",
                      disabled: !A.value || p.value,
                      loading: p.value,
                      onClick: M
                    }, {
                      default: ie(() => [
                        p.value ? Q("", !0) : ($(), se(f(ae), {
                          key: 0,
                          icon: "tabler:git-compare",
                          "aria-hidden": "true"
                        })),
                        C[7] || (C[7] = x("span", null, "Compare", -1))
                      ]),
                      _: 1
                    }, 8, ["disabled", "loading"]),
                    z(f(pe), {
                      disabled: g.value,
                      loading: g.value,
                      onClick: B
                    }, {
                      default: ie(() => [
                        g.value ? Q("", !0) : ($(), se(f(ae), {
                          key: 0,
                          icon: "tabler:history-up",
                          "aria-hidden": "true"
                        })),
                        C[8] || (C[8] = x("span", null, "Restore as new draft", -1))
                      ]),
                      _: 1
                    }, 8, ["disabled", "loading"])
                  ]),
                  m.value ? ($(), se(f(Be), {
                    key: 2,
                    severity: "error",
                    closable: !1
                  }, {
                    default: ie(() => [
                      he(Z(m.value), 1)
                    ]),
                    _: 1
                  })) : Q("", !0),
                  h.value ? ($(), R("section", gO, [
                    x("div", yO, [
                      x("span", wO, "Changes from v" + Z(h.value.from_version) + " to v" + Z(h.value.to_version), 1),
                      C[9] || (C[9] = x("span", { class: "wf-vers-detail-note" }, "Read-only", -1))
                    ]),
                    f(KM)(h.value) ? ($(), R(de, { key: 1 }, [
                      h.value.interface.changes.length ? ($(), se(f(Be), {
                        key: 0,
                        class: "wf-vers-compat",
                        severity: "warn",
                        closable: !1
                      }, {
                        default: ie(() => [
                          z(f(ae), {
                            icon: "tabler:alert-triangle",
                            "aria-hidden": "true"
                          }),
                          x("div", null, [
                            C[10] || (C[10] = x("strong", null, "Expected input or result changed", -1)),
                            ($(!0), R(de, null, Oe(h.value.interface.changes, (H, F) => ($(), R("span", { key: F }, Z(f(XM)(H)), 1))), 128))
                          ])
                        ]),
                        _: 1
                      })) : Q("", !0),
                      ($(!0), R(de, null, Oe([{ label: "Steps added", rows: h.value.graph.nodes.added }, { label: "Steps removed", rows: h.value.graph.nodes.removed }, { label: "Steps changed", rows: h.value.graph.nodes.changed }, { label: "Connections added", rows: h.value.graph.edges.added }, { label: "Connections removed", rows: h.value.graph.edges.removed }, { label: "Connections changed", rows: h.value.graph.edges.changed }], (H) => bd(($(), R("div", {
                        key: H.label,
                        class: "wf-vers-diff-group"
                      }, [
                        x("strong", null, Z(H.label), 1),
                        ($(!0), R(de, null, Oe(f(jM)(H.rows), (F) => ($(), R("span", {
                          key: F.id
                        }, Z(F.name), 1))), 128))
                      ])), [
                        [Wm, H.rows.length]
                      ])), 128))
                    ], 64)) : ($(), R("p", bO, "No input, result, step, or connection changes were recorded."))
                  ])) : Q("", !0)
                ], 64)) : Q("", !0)
              ])) : Q("", !0)
            ], 64)) : ($(), R("p", JM, " No versions published yet. Publish to save the current Workflow as v1; you can keep editing it as a draft. "))
          ], 64))
        ]),
        _: 1
      })
    ], 64));
  }
}), kO = {
  "aria-label": "Run published Workflow",
  class: "wf-published-run"
}, EO = {
  key: 0,
  role: "alert"
}, xO = {
  key: 1,
  role: "status"
}, $O = {
  key: 0,
  role: "alert"
}, SO = /* @__PURE__ */ we({
  __name: "PublishedRunPanel",
  props: {
    workflowId: {},
    publishedVersion: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = j(null), r = j({}), a = j(!0), s = j(!1), l = j("");
    let c = 0;
    const u = W(() => JSON.stringify({ kind: "workflow", flow_ref: { kind: "flow", id: n.workflowId, version: n.publishedVersion }, input: r.value }));
    async function d() {
      const h = ++c;
      s.value = !1, l.value = "", r.value = {}, a.value = !0;
      try {
        if (!n.workflowId || !Number.isInteger(n.publishedVersion) || n.publishedVersion < 1) throw new Error("Publish this Workflow before running a published version");
        const p = await Ld(n.workflowId, n.publishedVersion);
        if (h !== c) return;
        if (p.version !== n.publishedVersion) throw new Error("Published version does not match the request");
        o.value = p.input_schema, s.value = !0;
      } catch (p) {
        h === c && (l.value = Rg(p, "Could not read the published Workflow"));
      }
    }
    return ke(() => [n.workflowId, n.publishedVersion], () => {
      d();
    }, { immediate: !0 }), Qe(() => {
      c += 1;
    }), (h, p) => ($(), R("section", kO, [
      x("header", null, [
        p[3] || (p[3] = x("h2", null, "Run published Workflow", -1)),
        x("button", {
          type: "button",
          class: "p-button p-button-secondary",
          onClick: p[0] || (p[0] = (v) => i("close"))
        }, "Close published run")
      ]),
      x("p", null, "Run published version " + Z(e.publishedVersion) + " with the selected account. Follow its progress in Past runs.", 1),
      l.value ? ($(), R("p", EO, Z(l.value), 1)) : s.value ? ($(), R(de, { key: 2 }, [
        z(Rs, {
          mode: "value",
          schema: o.value,
          "model-value": r.value,
          "reset-key": f(c),
          rows: 5,
          "onUpdate:modelValue": p[1] || (p[1] = (v) => r.value = v),
          onValid: p[2] || (p[2] = (v) => a.value = v)
        }, null, 8, ["schema", "model-value", "reset-key"]),
        a.value ? Q("", !0) : ($(), R("p", $O, "Fix the input before queuing a run.")),
        a.value ? ($(), se(ai, {
          key: 1,
          tag: "wc-manual-task-launcher",
          attrs: { target: u.value, parent: e.workflowId, title: "Published Workflow run" }
        }, null, 8, ["attrs"])) : Q("", !0)
      ], 64)) : ($(), R("p", xO, "Loading published input…"))
    ]));
  }
}), CO = { class: "wf-trigger-description" }, NO = { class: "wf-trigger-body" }, IO = {
  key: 2,
  class: "wf-trigger-loading"
}, AO = /* @__PURE__ */ we({
  __name: "AddTriggerPanel",
  props: {
    workflowId: {},
    publishedVersion: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = W(() => ZC(n.workflowId, n.publishedVersion)), r = j(!1), a = j("");
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
    return (l, c) => ($(), se(f(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      header: f(XC),
      class: "wf-trigger-modal",
      "onUpdate:visible": s
    }, {
      default: ie(() => [
        x("p", CO, Z(f(KC)), 1),
        x("div", NO, [
          r.value ? ($(), se(Xt(o.value.tag), oo({ key: 0 }, o.value.attrs, {
            onClose: c[0] || (c[0] = (u) => i("close"))
          }), null, 16)) : a.value ? ($(), se(f(Be), {
            key: 1,
            class: "wf-setup-error",
            severity: "error",
            closable: !1
          }, {
            default: ie(() => [
              he(Z(a.value), 1)
            ]),
            _: 1
          })) : ($(), R("div", IO, [
            z(f(yt), {
              class: "wf-status-spinner",
              "stroke-width": "4",
              "aria-label": "Loading triggers"
            }),
            c[1] || (c[1] = x("span", null, "Loading triggers…", -1))
          ]))
        ])
      ]),
      _: 1
    }, 8, ["header"]));
  }
}), TO = {
  key: 0,
  class: "wf-callpick-selected"
}, MO = { class: "wf-callpick-selected-top" }, OO = { class: "wf-callpick-badges" }, RO = { class: "wf-callpick-io" }, DO = { class: "wf-callpick-ico" }, PO = { class: "wf-callpick-main" }, LO = { class: "wf-callpick-title" }, zO = { class: "wf-callpick-meta" }, VO = { key: 0 }, BO = { key: 1 }, FO = { class: "wf-callpick-schema" }, HO = ["title"], qO = /* @__PURE__ */ we({
  __name: "FlowPicker",
  props: {
    workflowId: {},
    selectedId: {},
    upstreamSchema: {}
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = j(!1), r = j(""), a = j([]);
    async function s() {
      o.value = !0, r.value = "";
      try {
        const m = await Ed({ filter: "published" });
        a.value = m.map((_) => og(_, {}, [], n.workflowId)).filter((_) => _.callable && !!_.published_version);
      } catch (m) {
        r.value = m instanceof Error ? m.message : "Could not load Workflows.";
      } finally {
        o.value = !1;
      }
    }
    Ue(s), ke(() => n.workflowId, s);
    function l(m, _) {
      return m.title.toLowerCase().includes(_) || m.trigger_label.toLowerCase().includes(_) || m.id.toLowerCase().includes(_);
    }
    const c = W(() => a.value.find((m) => m.id === n.selectedId) || null);
    function u(m) {
      return rl(n.upstreamSchema, m.input_schema);
    }
    function d(m) {
      const _ = u(m).status;
      return _ === "error" ? "tabler:alert-triangle" : _ === "ok" ? "tabler:circle-check" : "tabler:circle-dashed";
    }
    function h(m) {
      const _ = u(m);
      return _.status === "error" ? _.message || "Needs mapping" : _.status === "ok" ? "Input matches" : "Input unknown";
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
    return (m, _) => ($(), se(ng, {
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
      onSelect: _[0] || (_[0] = (E) => i("select", E))
    }, {
      "before-list": ie(() => [
        c.value ? ($(), R("div", TO, [
          x("div", MO, [
            z(f(ae), {
              icon: "tabler:route",
              "aria-hidden": "true"
            }),
            x("span", null, Z(c.value.title), 1)
          ]),
          x("div", OO, [
            z(f(gt), {
              class: "wf-callpick-badge",
              severity: "success",
              value: `Published v${c.value.published_version}`
            }, null, 8, ["value"]),
            c.value.has_draft_changes ? ($(), se(f(gt), {
              key: 0,
              class: "wf-callpick-badge",
              severity: "warn",
              value: "Draft changes"
            })) : Q("", !0)
          ]),
          x("div", RO, [
            x("span", null, [
              _[1] || (_[1] = x("strong", null, "In", -1)),
              he(Z(c.value.input_summary), 1)
            ]),
            x("span", null, [
              _[2] || (_[2] = x("strong", null, "Child out", -1)),
              he(Z(c.value.output_summary), 1)
            ]),
            _[3] || (_[3] = x("span", null, [
              x("strong", null, "Step out"),
              he("Run details")
            ], -1))
          ])
        ])) : Q("", !0)
      ]),
      row: ie(({ item: E }) => [
        x("span", DO, [
          z(f(ae), {
            icon: "tabler:route",
            "aria-hidden": "true"
          })
        ]),
        x("span", PO, [
          x("span", LO, Z(E.title), 1),
          x("span", zO, [
            E.is_current ? ($(), R("span", VO, "Current")) : Q("", !0),
            x("span", null, "v" + Z(E.published_version), 1),
            E.has_draft_changes ? ($(), R("span", BO, "Draft")) : Q("", !0)
          ]),
          x("span", FO, [
            x("span", null, [
              _[4] || (_[4] = x("strong", null, "In", -1)),
              he(Z(E.input_summary), 1)
            ]),
            x("span", null, [
              _[5] || (_[5] = x("strong", null, "Out", -1)),
              he(Z(E.output_summary), 1)
            ])
          ])
        ]),
        x("span", {
          class: Ie(["wf-callpick-compat", `is-${u(E).status}`]),
          title: h(E)
        }, [
          z(f(ae), {
            icon: d(E),
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ], 10, HO)
      ]),
      _: 1
    }, 8, ["rows", "loading", "error"]));
  }
}), UO = {
  class: "wf-retries",
  "aria-label": "Retries"
}, WO = { class: "wf-retry-heading" }, YO = { class: "wf-panel-hint" }, GO = { class: "wf-retry-field" }, jO = { class: "wf-panel-hint" }, XO = ["for"], KO = { class: "wf-panel-hint" }, ZO = { class: "wf-retry-field" }, JO = { class: "wf-panel-hint" }, QO = { class: "wf-retry-field" }, eR = { class: "wf-panel-hint" }, tR = { class: "wf-retry-heading" }, nR = ["for"], oR = {
  key: 0,
  class: "wf-panel-hint",
  role: "alert"
}, iR = { class: "wf-panel-hint" }, rR = /* @__PURE__ */ we({
  __name: "RetryPolicyPanel",
  props: {
    node: {},
    execution: {}
  },
  emits: ["update-node"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = W(() => n.node.retry_policy || n.execution.retry_policy || void 0), r = W(() => n.execution.retry_policy || void 0), a = W(() => o.value?.maximum_attempts === 0), s = W(() => a.value && !h(n.node.schedule_to_close_timeout || n.execution.schedule_to_close_timeout).trim()), l = ["NotFound", "AlreadyExists", "Invalid", "PermissionDenied", "Unavailable", "Internal", "Canceled", "Conflict", "Timeout", "RateLimited"], c = [
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
    return (v, g) => ($(), R("section", UO, [
      x("div", WO, [
        g[5] || (g[5] = x("h3", { class: "wf-panel-label" }, "Retries", -1)),
        e.node.retry_policy ? ($(), se(f(pe), {
          key: 1,
          label: "Reset",
          "aria-label": "Reset retry policy",
          size: "small",
          text: "",
          onClick: g[1] || (g[1] = (m) => i("update-node", { retry_policy: !1 }))
        })) : ($(), se(f(pe), {
          key: 0,
          label: "Override",
          "aria-label": "Override retry policy",
          size: "small",
          text: "",
          onClick: g[0] || (g[0] = (m) => i("update-node", { retry_policy: { ...r.value } }))
        }))
      ]),
      x("p", YO, Z(o.value ? "Maximum attempts includes the first attempt and defaults to 3. A zero attempt limit requires a total window." : "One attempt. Override the retry policy to retry failed attempts."), 1),
      o.value ? ($(), R(de, { key: 0 }, [
        x("div", GO, [
          g[6] || (g[6] = x("label", {
            class: "wf-retry-label",
            for: "wf-retry-attempts"
          }, "Maximum attempts", -1)),
          z(f(so), {
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
          x("p", jO, "Block default: " + Z(r.value ? r.value.maximum_attempts ?? 3 : "one attempt"), 1)
        ]),
        ($(), R(de, null, Oe(c, (m) => x("div", {
          key: m.field,
          class: "wf-retry-field"
        }, [
          x("label", {
            class: "wf-retry-label",
            for: `wf-retry-${m.field}`
          }, Z(m.label), 9, XO),
          z(f(rt), {
            id: `wf-retry-${m.field}`,
            class: "wf-input",
            "model-value": h(o.value[m.field]),
            "aria-label": m.label,
            placeholder: m.default,
            onChange: (_) => d(m.field, p(_) || void 0)
          }, null, 8, ["id", "model-value", "aria-label", "placeholder", "onChange"]),
          x("p", KO, "Block default: " + Z(h(r.value?.[m.field]) || (r.value ? m.default : "no policy")), 1)
        ])), 64)),
        x("div", ZO, [
          g[7] || (g[7] = x("label", {
            class: "wf-retry-label",
            for: "wf-retry-backoff"
          }, "Backoff coefficient", -1)),
          z(f(so), {
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
          x("p", JO, "Block default: " + Z(r.value ? r.value.backoff_coefficient ?? 2 : "no policy"), 1)
        ]),
        x("div", QO, [
          g[8] || (g[8] = x("span", {
            id: "wf-retry-kinds-label",
            class: "wf-retry-label"
          }, "Non-retryable error kinds", -1)),
          z(f(Ms), {
            class: "wf-retry-kinds",
            "model-value": o.value.non_retryable_error_types || [],
            options: l,
            multiple: "",
            "aria-labelledby": "wf-retry-kinds-label",
            "onUpdate:modelValue": g[4] || (g[4] = (m) => d("non_retryable_error_types", m ?? []))
          }, null, 8, ["model-value"]),
          x("p", eR, "Block default: " + Z(r.value?.non_retryable_error_types?.join(", ") || "none"), 1)
        ])
      ], 64)) : Q("", !0),
      ($(), R(de, null, Oe(u, (m) => x("div", {
        key: m.field,
        class: "wf-retry-field"
      }, [
        x("div", tR, [
          x("label", {
            class: "wf-retry-label",
            for: `wf-retry-${m.field}`
          }, Z(m.label), 9, nR),
          e.node[m.field] !== void 0 && e.node[m.field] !== !1 ? ($(), se(f(pe), {
            key: 0,
            label: "Reset",
            "aria-label": `Reset ${m.label.toLowerCase()}`,
            text: "",
            size: "small",
            onClick: (_) => i("update-node", { [m.field]: !1 })
          }, null, 8, ["aria-label", "onClick"])) : Q("", !0)
        ]),
        z(f(rt), {
          id: `wf-retry-${m.field}`,
          class: "wf-input",
          "model-value": h(e.node[m.field] || e.execution[m.field]),
          "aria-label": m.label,
          "aria-required": m.field === "schedule_to_close_timeout" && a.value,
          invalid: m.field === "schedule_to_close_timeout" && s.value,
          placeholder: "No timeout",
          onChange: (_) => i("update-node", { [m.field]: p(_) || !1 })
        }, null, 8, ["id", "model-value", "aria-label", "aria-required", "invalid", "onChange"]),
        m.field === "schedule_to_close_timeout" && s.value ? ($(), R("p", oR, "A zero attempt limit requires a positive total window.")) : Q("", !0),
        x("p", iR, "Block default: " + Z(h(e.execution[m.field]) || "no timeout") + ". Use durations such as 500ms or 30s.", 1)
      ])), 64))
    ]));
  }
});
function Ap(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
const aR = 8;
function sR(e, t) {
  const n = Ap(t), i = Number(n.batch_size), o = Number.isFinite(i) && i > 0 ? i : aR, r = n.continue_on_error === !0;
  return { sourceKey: String(n.source_array_key || ""), batchSize: o, continueOnError: r };
}
function lR(e, t) {
  return { kind: "for_each", config: {
    ...Ap(e),
    source_array_key: t.sourceKey.trim(),
    batch_size: Math.max(1, Math.round(t.batchSize) || 1),
    continue_on_error: t.continueOnError
  } };
}
const uR = "Checked after every pass. Reference result (the last pass’s output), state or iteration — a bare name reads from state.", cR = "Safety cap. If the condition still holds after this many passes, the step fails with MAX_ITERATIONS_EXCEEDED — wire its Failed port to recover instead of ending the run. 0 uses the default (8).", dR = "Runs the same steps once per item of a list. Wire those steps from the “each item” port; the collected results continue from “all results”. How many run at the same time is the batch size below.", fR = "How many items run at the same time. Default 8.", hR = "Attempts every item and keeps going when one fails. The output is one entry per item, each carrying its result or its error { code, message }.", pR = "Stops at the first item that fails — that failure becomes this step’s failure (route it with the Failed port). The output is the results array in source order.", vR = "Runs the selected Workflow and waits for it to finish. Its result continues from the Finished port; if it fails, the Failed port carries { code, message }.";
function mR(e) {
  const t = e && typeof e == "object" && !Array.isArray(e) ? e : {};
  return typeof t.predicate == "string" ? t.predicate : "";
}
function gR(e, t) {
  return { ...e && typeof e == "object" && !Array.isArray(e) ? e : {}, predicate: t.trim() };
}
function yR(e) {
  return "config" in e;
}
const oi = "The assistant couldn’t draft these settings.";
async function wR(e) {
  let t;
  try {
    t = (await zn.post(`/api/v1/workflows/${encodeURIComponent(e.workflowId)}/assist/config`, {
      intent: e.intent,
      node_id: e.nodeId,
      ...e.upstreamSchema ? { upstream_schema: e.upstreamSchema } : {}
    }, { timeout: 105e3 })).data;
  } catch (i) {
    const o = i?.response?.data;
    return o && typeof o == "object" && (typeof o.message == "string" || typeof o.code == "string") ? { error: En(o, oi) } : Md(i) === 404 ? { error: zl, unavailable: !0 } : o ? { error: En(o, oi) } : { error: i instanceof Error && i.message ? i.message : oi };
  }
  if (!t || typeof t != "object") return { error: zl, unavailable: !0 };
  const n = t;
  return n.success === !1 ? { error: En(n, oi) } : !n.config || typeof n.config != "object" || Array.isArray(n.config) ? { error: "The assistant returned no settings." } : {
    config: n.config,
    notes: typeof n.notes == "string" && n.notes.trim() ? n.notes.trim() : void 0,
    ...n.config_schema && typeof n.config_schema == "object" && !Array.isArray(n.config_schema) ? { configSchema: n.config_schema } : {}
  };
}
const bR = {
  class: "wf-config-assist",
  "aria-label": "Describe this step"
}, _R = ["for"], kR = { class: "wf-config-assist__compose" }, ER = {
  key: 1,
  class: "wf-config-assist__preview",
  role: "region",
  "aria-label": "Drafted settings"
}, xR = { class: "wf-config-assist__preview-head" }, $R = {
  key: 0,
  class: "wf-config-assist__notes"
}, SR = { class: "wf-config-assist__changes" }, CR = {
  key: 0,
  class: "wf-config-assist__before"
}, NR = { class: "wf-config-assist__after" }, IR = { class: "wf-config-assist__actions" }, Va = "This step changed while the draft was being prepared. Review the current settings and draft again.", Tp = /* @__PURE__ */ we({
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
    const n = e, i = t, o = j(""), r = j(!1), a = j(""), s = j(""), l = j(null), c = j(null), u = j(null), d = j(!1);
    let h = 0, p = "";
    function v(I) {
      const C = /* @__PURE__ */ new WeakSet();
      function H(F, q) {
        if (q > 20) return "[max-depth]";
        if (!F || typeof F != "object") return F;
        if (C.has(F)) return "[cycle]";
        if (C.add(F), Array.isArray(F)) {
          const ne = F.map((ue) => H(ue, q + 1));
          return C.delete(F), ne;
        }
        const U = {};
        for (const ne of Object.keys(F).sort())
          U[ne] = H(F[ne], q + 1);
        return C.delete(F), U;
      }
      try {
        return JSON.stringify(H(I, 0));
      } catch {
        return "[unserializable]";
      }
    }
    const g = W(() => v([
      n.workflowId,
      n.resetKey,
      n.configSchema || {}
    ])), m = W(() => c.value || n.configSchema || {}), _ = W(() => v(n.currentConfig)), E = W(() => v([
      n.workflowId,
      n.resetKey,
      n.configSchema,
      n.currentConfig
    ]));
    function w() {
      const I = r.value || l.value !== null;
      h += 1, p = "", o.value = "", r.value = !1, a.value = I ? Va : "", s.value = "", l.value = null, c.value = null, u.value = null, d.value = !1;
    }
    ke(g, w, { flush: "sync" }), ke(_, (I) => {
      if (p && I === p) {
        p = "";
        return;
      }
      const C = r.value || l.value !== null;
      h += 1, r.value = !1, l.value = null, s.value = "", u.value = null, d.value = !1, C && (a.value = Va);
    }, { flush: "sync" }), Qe(() => {
      h += 1;
    });
    function b(I, C) {
      return v(I) === v(C);
    }
    function S(I) {
      const C = m.value.properties;
      if (C && typeof C == "object" && !Array.isArray(C)) {
        const H = C[I];
        if (H && typeof H == "object" && !Array.isArray(H)) {
          const F = H.title;
          if (typeof F == "string" && F.trim()) return F.trim();
        }
      }
      return I.replace(/_/g, " ").replace(/^./, (H) => H.toUpperCase());
    }
    function N(I) {
      if (I === void 0) return "Not set";
      if (typeof I == "string") return I || "Empty";
      if (Array.isArray(I)) return `${I.length} item${I.length === 1 ? "" : "s"}`;
      if (I && typeof I == "object") {
        const C = I, H = C.properties && typeof C.properties == "object" && !Array.isArray(C.properties) ? Object.keys(C.properties) : [];
        if (C.type === "object" || H.length) {
          const F = Array.isArray(C.required) ? C.required.length : 0;
          return `${H.length} field${H.length === 1 ? "" : "s"}${F ? ` · ${F} required` : ""}`;
        }
        try {
          return JSON.stringify(C, null, 2);
        } catch {
          return "Settings";
        }
      }
      try {
        return JSON.stringify(I);
      } catch {
        return String(I);
      }
    }
    const V = W(() => Array.from(/* @__PURE__ */ new Set([
      ...Object.keys(n.currentConfig),
      ...Object.keys(l.value || {})
    ])).sort().map((I) => ({
      key: I,
      label: S(I),
      before: n.currentConfig[I],
      after: l.value?.[I],
      changed: !b(n.currentConfig[I], l.value?.[I])
    })));
    function A(I, C = 0) {
      if (!I || typeof I != "object" || Array.isArray(I) || C > 12) return C > 12;
      const H = I;
      if (H.picker != null || H.class != null) return !0;
      const F = H.properties;
      return F && typeof F == "object" && !Array.isArray(F) && Object.values(F).some((q) => A(q, C + 1)) || A(H.items, C + 1) ? !0 : A(H.additionalProperties, C + 1);
    }
    function T(I, C, H) {
      const F = H && typeof H == "object" && !Array.isArray(H) ? H : {};
      if (!(F.type === "object" || !!F.properties && typeof F.properties == "object" && !Array.isArray(F.properties)) || !I || typeof I != "object" || Array.isArray(I) || !C || typeof C != "object" || Array.isArray(C)) return C;
      const U = F.properties && typeof F.properties == "object" && !Array.isArray(F.properties) ? F.properties : {}, ne = { ...I };
      for (const [ue, G] of Object.entries(C)) {
        const J = U[ue] ?? (F.additionalProperties && typeof F.additionalProperties == "object" ? F.additionalProperties : void 0);
        ne[ue] = T(ne[ue], G, J);
      }
      return ne;
    }
    function L(I) {
      const C = m.value.properties, H = C && typeof C == "object" && !Array.isArray(C) ? C : {};
      if (!Object.keys(H).length) return { ...n.currentConfig, ...I };
      const F = {};
      for (const [q, U] of Object.entries(I)) {
        const ne = H[q], ue = ne && typeof ne == "object" && !Array.isArray(ne) ? ne : {};
        A(ue) || (F[q] = U);
      }
      return T(n.currentConfig, F, m.value);
    }
    async function M() {
      const I = o.value.trim();
      if (!I || r.value) return;
      r.value = !0;
      const C = ++h, H = E.value;
      a.value = "", d.value = !1;
      const F = await wR({
        workflowId: n.workflowId,
        nodeId: n.resetKey,
        intent: I,
        ...n.upstreamSchema ? { upstreamSchema: n.upstreamSchema } : {}
      });
      if (C === h) {
        if (H !== E.value) {
          r.value = !1, l.value = null, s.value = "", a.value = Va;
          return;
        }
        if (r.value = !1, !yR(F)) {
          a.value = F.error, l.value = null, s.value = "";
          return;
        }
        F.configSchema && (c.value = F.configSchema), l.value = L(F.config), s.value = F.notes || "";
      }
    }
    function k() {
      l.value = null, s.value = "", a.value = "";
    }
    function B() {
      if (!l.value) return;
      u.value = { ...n.currentConfig };
      const I = { ...l.value };
      p = v(I), i("accept", I), l.value = null, s.value = "", d.value = !0;
    }
    function y() {
      if (!u.value) return;
      const I = { ...u.value };
      p = v(I), i("undo", I), u.value = null, d.value = !1;
    }
    return (I, C) => ($(), R("section", bR, [
      x("label", {
        class: "wf-config-assist__label",
        for: `wf-config-intent-${e.resetKey}`
      }, "Describe this step", 8, _R),
      x("div", kR, [
        z(f(Os), {
          id: `wf-config-intent-${e.resetKey}`,
          modelValue: o.value,
          "onUpdate:modelValue": C[0] || (C[0] = (H) => o.value = H),
          class: "wf-textarea",
          rows: "2",
          placeholder: "Explain how this step should behave…",
          onKeydown: [
            tt(Fe(M, ["meta", "prevent"]), ["enter"]),
            tt(Fe(M, ["ctrl", "prevent"]), ["enter"])
          ]
        }, null, 8, ["id", "modelValue", "onKeydown"]),
        z(f(pe), {
          class: "wf-config-assist__draft",
          disabled: !o.value.trim() || r.value,
          loading: r.value,
          onClick: M
        }, {
          default: ie(() => [
            r.value ? Q("", !0) : ($(), se(f(ae), {
              key: 0,
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            })),
            x("span", null, Z(r.value ? "Drafting…" : "Draft with AI"), 1)
          ]),
          _: 1
        }, 8, ["disabled", "loading"])
      ]),
      a.value ? ($(), se(f(Be), {
        key: 0,
        class: "wf-config-assist__error",
        severity: "error",
        closable: !1
      }, {
        default: ie(() => [
          he(Z(a.value), 1)
        ]),
        _: 1
      })) : Q("", !0),
      l.value ? ($(), R("div", ER, [
        x("div", xR, [
          C[1] || (C[1] = x("strong", null, "Review drafted settings", -1)),
          x("span", null, Z(V.value.filter((H) => H.changed).length) + " changed", 1)
        ]),
        s.value ? ($(), R("p", $R, Z(s.value), 1)) : Q("", !0),
        x("dl", SR, [
          ($(!0), R(de, null, Oe(V.value, (H) => ($(), R("div", {
            key: H.key,
            class: Ie({ "is-unchanged": !H.changed })
          }, [
            x("dt", null, Z(H.label), 1),
            x("dd", null, [
              H.changed ? ($(), R("span", CR, Z(N(H.before)), 1)) : Q("", !0),
              x("span", NR, Z(N(H.after)), 1)
            ])
          ], 2))), 128))
        ]),
        x("div", IR, [
          z(f(pe), {
            class: "wf-config-assist__accept",
            onClick: B
          }, {
            default: ie(() => [...C[2] || (C[2] = [
              he("Accept", -1)
            ])]),
            _: 1
          }),
          z(f(pe), {
            severity: "secondary",
            text: "",
            onClick: k
          }, {
            default: ie(() => [...C[3] || (C[3] = [
              he("Cancel", -1)
            ])]),
            _: 1
          })
        ])
      ])) : d.value ? ($(), se(f(Be), {
        key: 2,
        class: "wf-config-assist__applied",
        severity: "success",
        closable: !1
      }, {
        default: ie(() => [
          C[5] || (C[5] = x("span", null, "Draft applied. You can edit every field below.", -1)),
          z(f(pe), {
            severity: "secondary",
            outlined: "",
            onClick: y
          }, {
            default: ie(() => [...C[4] || (C[4] = [
              he("Undo", -1)
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
function AR(e) {
  const t = Array.isArray(e.type) ? e.type.find((n) => n !== "null") : e.type;
  return t === "string" || t === "number" || t === "integer" || t === "boolean" || t === "array" ? t === "integer" ? "number" : t : "unknown";
}
function Mp(e, t = !1) {
  const n = [];
  function i(o, r = "", a = 0) {
    if (a > 10) return;
    const s = ii(o), l = ii(s.properties);
    for (const [c, u] of Object.entries(l)) {
      const d = ii(u), h = r ? `${r}.${c}` : c, p = AR(d), v = typeof d.title == "string" && d.title.trim() ? d.title.trim() : c.replace(/_/g, " ");
      p === "array" ? t && n.push({ path: h, label: v, type: p }) : p === "unknown" && Object.keys(ii(d.properties)).length ? i(d, h, a + 1) : t || n.push({ path: h, label: v, type: p });
    }
  }
  return i(e), n;
}
function id(e) {
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
function TR(e) {
  return `'${e.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}
function MR(e, t, n = "output") {
  const i = e.field.trim();
  if (!i) return "";
  const o = `${n}.${i}`;
  if (e.operator === "truthy") return `${o} == true`;
  if (e.operator === "falsy") return `${o} == false`;
  const r = { eq: "==", neq: "!=", gt: ">", gte: ">=", lt: "<", lte: "<=" }[e.operator];
  if (!r) return "";
  const a = e.value.trim();
  if (!a) return "";
  const s = t === "number" && Number.isFinite(Number(a)) ? String(Number(a)) : TR(a);
  return `${o} ${r} ${s}`;
}
function OR(e, t = "output") {
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
const RR = ["aria-label"], DR = {
  key: 0,
  class: "wf-predicate-row"
}, PR = { key: 0 }, LR = {
  key: 1,
  class: "wf-panel-hint wf-panel-hint--warn"
}, zR = { class: "wf-predicate-advanced" }, rd = /* @__PURE__ */ we({
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
    const n = e, i = t, o = W(() => Mp(n.schema)), r = j({ field: "", operator: "eq", value: "" }), a = j(!0), s = j("");
    let l = !1;
    const c = W(() => o.value.find((b) => b.path === r.value.field)), u = W(() => id(c.value?.type || "unknown")), d = W(() => r.value.operator !== "truthy" && r.value.operator !== "falsy"), h = W(() => c.value?.type === "number" ? "number" : "text"), p = W(() => {
      const b = Number(r.value.value);
      return r.value.value.trim() !== "" && Number.isFinite(b) ? b : null;
    });
    function v(b) {
      s.value = b || "";
      const S = OR(b || "", n.root);
      S && o.value.some((N) => N.path === S.field) ? (r.value = S, a.value = !0) : (r.value = { field: "", operator: "eq", value: "" }, a.value = !b);
    }
    ke(() => [n.modelValue, n.root, n.schema], () => {
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
      const b = MR(r.value, c.value?.type || "unknown", n.root);
      g(b);
    }
    function _(b) {
      r.value.value = b == null ? "" : String(b), m();
    }
    function E(b) {
      r.value.field = b || "";
      const S = id(c.value?.type || "unknown").map((N) => N.value);
      S.includes(r.value.operator) || (r.value.operator = S[0] || "eq"), r.value.value = "", m();
    }
    function w(b) {
      b && (r.value.operator = b, m());
    }
    return (b, S) => ($(), R("section", {
      class: Ie(["wf-predicate", { "is-compact": e.compact }]),
      "aria-label": e.label
    }, [
      o.value.length ? ($(), R("div", DR, [
        x("label", null, [
          S[4] || (S[4] = x("span", null, "Field", -1)),
          z(f(St), {
            "model-value": r.value.field || null,
            options: o.value,
            "option-label": "label",
            "option-value": "path",
            placeholder: "Choose a field…",
            "aria-label": "Condition field",
            "onUpdate:modelValue": E
          }, null, 8, ["model-value", "options"])
        ]),
        x("label", null, [
          S[5] || (S[5] = x("span", null, "Check", -1)),
          z(f(St), {
            "model-value": r.value.operator,
            options: u.value,
            "option-label": "label",
            "option-value": "value",
            disabled: !r.value.field,
            "aria-label": "Condition operator",
            "onUpdate:modelValue": w
          }, null, 8, ["model-value", "options", "disabled"])
        ]),
        d.value ? ($(), R("label", PR, [
          S[6] || (S[6] = x("span", null, "Value", -1)),
          h.value === "number" ? ($(), se(f(so), {
            key: 0,
            "model-value": p.value,
            disabled: !r.value.field,
            "use-grouping": !1,
            "aria-label": "Condition value",
            placeholder: "Enter a value",
            "onUpdate:modelValue": _
          }, null, 8, ["model-value", "disabled"])) : ($(), se(f(rt), {
            key: 1,
            modelValue: r.value.value,
            "onUpdate:modelValue": S[0] || (S[0] = (N) => r.value.value = N),
            disabled: !r.value.field,
            "aria-label": "Condition value",
            placeholder: "Enter a value",
            onChange: m
          }, null, 8, ["modelValue", "disabled"]))
        ])) : Q("", !0)
      ])) : ($(), R("p", LR, "Connect a step with declared output fields to build this visually.")),
      z(f(Dg), {
        collapsed: a.value,
        "onUpdate:collapsed": S[3] || (S[3] = (N) => a.value = N),
        class: "wf-predicate-disclosure",
        header: "Advanced expression",
        toggleable: ""
      }, {
        default: ie(() => [
          x("div", zR, [
            z(f(rt), {
              modelValue: s.value,
              "onUpdate:modelValue": S[1] || (S[1] = (N) => s.value = N),
              class: "wf-input wf-mono",
              "aria-label": "Condition expression",
              placeholder: "output.status == 'ready'",
              onChange: S[2] || (S[2] = (N) => g(s.value.trim()))
            }, null, 8, ["modelValue"]),
            S[7] || (S[7] = x("p", { class: "wf-panel-hint" }, "Use expr-lang only when the visual controls cannot express the rule.", -1))
          ])
        ]),
        _: 1
      }, 8, ["collapsed"])
    ], 10, RR));
  }
}), VR = { class: "wf-panel-hint" }, BR = { class: "wf-panel-hint" }, FR = { class: "wf-panel-hint" }, HR = { class: "wf-panel-hint" }, qR = { class: "wf-panel-hint" }, UR = { class: "wf-panel-hint" }, WR = {
  key: 0,
  class: "wf-panel-hint wf-panel-hint--warn"
}, YR = /* @__PURE__ */ we({
  __name: "LogicNodePanel",
  props: {
    workflowId: {},
    node: {},
    upstreamSchema: {},
    combineBranchConflict: {}
  },
  emits: ["update-node"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = W(() => n.node?.config || {}), r = j("");
    ke(() => n.node?.id, () => {
      n.node?.kind === "branch" && (r.value = mR(o.value));
    }, { immediate: !0 });
    function a() {
      i("update-node", { config: gR(o.value, r.value) });
    }
    function s(I) {
      r.value = I, a();
    }
    function l(I) {
      s(typeof I.predicate == "string" ? I.predicate : "");
    }
    const c = j(""), u = j(0);
    ke(() => n.node?.id, () => {
      c.value = String(o.value.continue_condition || "");
      const I = Number(o.value.max_iterations);
      u.value = Number.isFinite(I) && I > 0 ? I : 0;
    }, { immediate: !0 });
    function d() {
      const I = { ...o.value, continue_condition: c.value.trim() };
      u.value > 0 ? I.max_iterations = Math.round(u.value) : delete I.max_iterations, i("update-node", { config: I });
    }
    function h(I) {
      const C = Number(I);
      u.value = Number.isFinite(C) ? C : 0, d();
    }
    function p(I) {
      c.value = I, d();
    }
    const v = j(""), g = j(8), m = j(!1), _ = W(() => Mp(n.upstreamSchema, !0)), E = [
      { label: "Stop — fail this step at the first failed item", value: !1 },
      { label: "Continue — attempt every item, collect each result or error", value: !0 }
    ];
    ke(() => n.node?.id, () => {
      if (!wi(n.node?.kind)) return;
      const I = sR(n.node?.kind, o.value);
      v.value = I.sourceKey, g.value = I.batchSize, m.value = I.continueOnError;
    }, { immediate: !0 });
    function w() {
      i("update-node", lR(o.value, {
        sourceKey: v.value,
        batchSize: g.value,
        continueOnError: m.value
      }));
    }
    function b(I) {
      v.value = I || "", w();
    }
    function S(I) {
      m.value = I, w();
    }
    function N(I) {
      const C = Number(I);
      g.value = Math.max(1, Math.round(Number.isFinite(C) ? C : 1)), w();
    }
    const V = j("wait_all"), A = j("object"), T = [
      { label: "Wait for all — every incoming path must finish first", value: "wait_all" },
      { label: "First wins — continue as soon as one path arrives", value: "first_wins" }
    ], L = [
      { label: "Object — merge each path’s output by key", value: "object" },
      { label: "Array — collect each path’s output as a list", value: "array" }
    ];
    ke(() => n.node?.id, () => {
      Hi(n.node?.kind) && (V.value = LC(n.node?.kind, o.value), A.value = zC(o.value));
    }, { immediate: !0 });
    const M = W(
      () => V.value === "wait_all" && n.combineBranchConflict ? FC(n.combineBranchConflict) : ""
    );
    function k() {
      i("update-node", VC(o.value, V.value, A.value));
    }
    function B(I) {
      I && (V.value = I, k());
    }
    function y(I) {
      I && (A.value = I, k());
    }
    return (I, C) => e.node.kind === "branch" ? ($(), R(de, { key: 0 }, [
      C[1] || (C[1] = x("p", { class: "wf-panel-hint" }, [
        he("Set the condition, then connect "),
        x("strong", null, "True"),
        he(" and "),
        x("strong", null, "False"),
        he(" to the steps that should run. Exactly one path runs.")
      ], -1)),
      C[2] || (C[2] = x("div", { class: "wf-panel-label" }, "Condition", -1)),
      z(rd, {
        "model-value": r.value,
        schema: e.upstreamSchema,
        "onUpdate:modelValue": s
      }, null, 8, ["model-value", "schema"]),
      z(Tp, {
        "workflow-id": e.workflowId,
        "reset-key": e.node.id,
        "current-config": { predicate: r.value },
        "upstream-schema": e.upstreamSchema,
        onAccept: l,
        onUndo: l
      }, null, 8, ["workflow-id", "reset-key", "current-config", "upstream-schema"]),
      C[3] || (C[3] = x("div", {
        class: "wf-branch-outcomes",
        "aria-label": "Condition outcomes"
      }, [
        x("p", null, [
          x("strong", null, "True"),
          x("span", null, "runs when the condition matches")
        ]),
        x("p", null, [
          x("strong", null, "False"),
          x("span", null, "runs when it does not")
        ])
      ], -1))
    ], 64)) : e.node.kind === "cycle" ? ($(), R(de, { key: 1 }, [
      C[4] || (C[4] = x("p", { class: "wf-panel-hint" }, [
        he("Use it when one step needs to run more than once — retrying a bounded operation or working through repeated passes — until the condition below stops holding. Wire the repeated steps from the "),
        x("strong", null, "each pass"),
        he(" port; the "),
        x("strong", null, "when done"),
        he(" port continues after the loop.")
      ], -1)),
      C[5] || (C[5] = x("div", { class: "wf-panel-label" }, "Repeat while", -1)),
      z(rd, {
        "model-value": c.value,
        schema: e.upstreamSchema,
        root: "input",
        label: "Repeat while",
        "onUpdate:modelValue": p
      }, null, 8, ["model-value", "schema"]),
      x("p", VR, Z(f(uR)), 1),
      C[6] || (C[6] = x("div", { class: "wf-panel-label" }, "Max iterations", -1)),
      z(f(so), {
        "model-value": u.value,
        min: 0,
        "use-grouping": !1,
        class: "wf-input",
        placeholder: "8",
        "aria-label": "Max iterations",
        "onUpdate:modelValue": h
      }, null, 8, ["model-value"]),
      x("p", BR, Z(f(cR)), 1)
    ], 64)) : f(wi)(e.node.kind) ? ($(), R(de, { key: 2 }, [
      x("p", FR, Z(f(dR)), 1),
      C[7] || (C[7] = x("div", { class: "wf-panel-label" }, "Items to iterate", -1)),
      _.value.length ? ($(), se(f(St), {
        key: 0,
        "model-value": v.value || null,
        options: _.value,
        "option-label": "label",
        "option-value": "path",
        class: "wf-input",
        placeholder: "Choose an array field…",
        "aria-label": "Items to iterate",
        "onUpdate:modelValue": b
      }, null, 8, ["model-value", "options"])) : ($(), se(f(rt), {
        key: 1,
        modelValue: v.value,
        "onUpdate:modelValue": C[0] || (C[0] = (H) => v.value = H),
        class: "wf-input wf-mono",
        placeholder: "items",
        "aria-label": "Source array key",
        onChange: w
      }, null, 8, ["modelValue"])),
      C[8] || (C[8] = x("p", { class: "wf-panel-hint" }, "The upstream field holding the array to fan out over — one run of the body per item.", -1)),
      C[9] || (C[9] = x("div", { class: "wf-panel-label" }, "Batch size", -1)),
      z(f(so), {
        "model-value": g.value,
        min: 1,
        "use-grouping": !1,
        class: "wf-input",
        "aria-label": "Batch size",
        "onUpdate:modelValue": N
      }, null, 8, ["model-value"]),
      x("p", HR, Z(f(fR)), 1),
      C[10] || (C[10] = x("div", { class: "wf-panel-label" }, "If an item fails", -1)),
      z(f(St), {
        "model-value": m.value,
        options: E,
        "option-label": "label",
        "option-value": "value",
        class: "wf-input",
        "aria-label": "If an item fails",
        "onUpdate:modelValue": S
      }, null, 8, ["model-value"]),
      x("p", qR, Z(m.value ? f(hR) : f(pR)), 1)
    ], 64)) : f(Hi)(e.node.kind) ? ($(), R(de, { key: 3 }, [
      C[11] || (C[11] = x("p", { class: "wf-panel-hint" }, "Use it to bring several paths back into one. Choose below whether it waits for every path to finish or continues on the first to arrive.", -1)),
      C[12] || (C[12] = x("div", { class: "wf-panel-label" }, "When to continue", -1)),
      z(f(St), {
        "model-value": V.value,
        options: T,
        "option-label": "label",
        "option-value": "value",
        class: "wf-input",
        "aria-label": "When to continue",
        "onUpdate:modelValue": B
      }, null, 8, ["model-value"]),
      x("p", UR, Z(V.value === "wait_all" ? "Waits for every incoming path to finish, then continues once. Use it when parallel work must all complete before the next step." : "Continues the moment the first path arrives, without waiting for the rest. Use it to bring Condition paths back together, where only one ever runs."), 1),
      M.value ? ($(), R("p", WR, [
        z(f(ae), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        he(" " + Z(M.value), 1)
      ])) : Q("", !0),
      C[13] || (C[13] = x("div", { class: "wf-panel-label" }, "Combine as", -1)),
      z(f(St), {
        "model-value": A.value,
        options: L,
        "option-label": "label",
        "option-value": "value",
        class: "wf-input",
        "aria-label": "Combine as",
        "onUpdate:modelValue": y
      }, null, 8, ["model-value"]),
      C[14] || (C[14] = x("p", { class: "wf-panel-hint" }, "How the arriving outputs are shaped before they continue.", -1))
    ], 64)) : Q("", !0);
  }
}), GR = { class: "fm-top" }, jR = {
  key: 0,
  class: "fm-note"
}, XR = {
  key: 1,
  class: "fm-err"
}, KR = {
  key: 2,
  class: "fm-armbar"
}, ZR = {
  key: 3,
  class: "fm-contract-missing"
}, JR = {
  key: 4,
  class: "fm-empty fm-no-mapping"
}, QR = {
  key: 5,
  class: "fm-cols"
}, eD = {
  class: "fm-col fm-col--src",
  "aria-label": "Source fields"
}, tD = { class: "fm-col-hd" }, nD = { class: "fm-pills" }, oD = ["aria-expanded", "aria-label", "onClick"], iD = {
  key: 1,
  class: "fm-twist-sp",
  "aria-hidden": "true"
}, rD = ["title", "onClick", "onDragstart"], aD = { class: "fm-pill-name" }, sD = { class: "fm-pill-type" }, lD = {
  key: 0,
  class: "fm-empty"
}, uD = {
  class: "fm-col fm-col--tgt",
  "aria-label": "Target fields"
}, cD = { class: "fm-col-hd" }, dD = { class: "fm-raw" }, fD = ["value", "placeholder"], hD = {
  key: 1,
  class: "fm-rows"
}, pD = {
  key: 0,
  class: "fm-empty"
}, vD = ["data-test", "onDragover", "onDragleave", "onDrop"], mD = ["aria-label", "onClick"], gD = { class: "fm-row-name" }, yD = {
  key: 0,
  class: "fm-req"
}, wD = { class: "fm-row-type" }, bD = {
  key: 1,
  class: "fm-compat fm-compat--warn",
  title: "This field's type may not match the target"
}, _D = {
  key: 0,
  class: "fm-simple-row"
}, kD = ["value", "aria-label", "onChange"], ED = { value: "" }, xD = ["value"], $D = ["aria-label", "onClick"], SD = {
  key: 1,
  class: "fm-row-body"
}, CD = ["value", "aria-label", "onChange"], ND = {
  key: 0,
  value: "skip"
}, ID = ["onClick"], AD = ["value", "placeholder", "aria-label", "onInput"], TD = ["value", "placeholder", "aria-label", "onInput"], MD = ["aria-label", "onClick"], OD = {
  key: 2,
  class: "fm-empty"
}, RD = /* @__PURE__ */ we({
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
    const n = e, i = t, o = j([]), r = j(!1), a = j(""), s = j(null), l = j({}), c = j(null), u = j(!1), d = j(!1), h = W(() => n.sourceRoot || "output"), p = W(() => xh(n.sourceSchema, h.value)), v = W(() => W$(n.sourceSchema, h.value)), g = W(() => p.value.length ? p.value : v.value ? [v.value] : []), m = W(() => To(n.targetSchema)), _ = W(() => m.value.length > 0), E = W(() => !!s.value), w = W(() => {
      const P = /* @__PURE__ */ new Map(), O = (D) => D.forEach((Y) => {
        P.set(Y.expr, Y), Y.children.length && O(Y.children);
      });
      return O(g.value), P;
    }), b = W(() => {
      const P = [], O = (D) => {
        for (const Y of D)
          P.push(Y), Y.expandable && l.value[Y.path] && O(Y.children);
      };
      return O(g.value), P;
    }), S = W(() => {
      const P = [], O = (D) => D.forEach((Y) => {
        P.push(Y), O(Y.children);
      });
      return O(g.value), P;
    }), N = W(() => r.value ? a.value.trim() ? [] : m.value.filter((P) => P.required).map((P) => P.title || P.key) : tl(m.value, o.value)), V = W(() => r.value ? "" : j$(m.value, o.value)), A = W(() => Vn(n.targetSchema)), T = W(() => A.value ? !_.value && !r.value ? "No mapping needed" : _.value ? V.value || (d.value ? "Required fields pass through unchanged" : "All required fields mapped") : "Custom mapping" : "Input fields unavailable"), L = W(() => !!V.value || !A.value), M = W(() => d.value ? "" : r.value ? a.value.trim() : ls(o.value));
    function k() {
      if (s.value = null, d.value = !1, !_.value) {
        a.value = ol(n.modelValue), r.value = a.value !== "", o.value = [];
        return;
      }
      const P = us(n.targetSchema, n.modelValue), O = (n.modelValue || "").trim() ? [] : Sh(n.sourceSchema, n.targetSchema, h.value), D = new Map(O.map((Y) => [Y.key, Y]));
      o.value = P.rows.map((Y) => D.get(Y.key) || Y), d.value = O.length > 0, a.value = P.raw, r.value = P.raw !== "";
    }
    ke(() => n.resetKey, k, { immediate: !0 }), ke(M, (P) => i("update:modelValue", P)), ke(N, (P) => i("update:missing", P), { immediate: !0 });
    function B(P) {
      return o.value.find((O) => O.key === P) || { key: P, mode: "skip", value: "" };
    }
    function y(P) {
      return (P.mode === "expr" || P.mode === "static") && (P.value ?? "") !== "";
    }
    function I(P) {
      const O = B(P.key);
      if (O.mode !== "expr" || !O.value) return "neutral";
      const D = w.value.get(O.value.trim());
      return D ? X$(D.type, P.type) : "neutral";
    }
    function C(P) {
      s.value = s.value === P ? null : P;
    }
    function H(P) {
      l.value = { ...l.value, [P]: !l.value[P] };
    }
    function F(P, O) {
      d.value = !1, o.value = o.value.map((D) => D.key === P ? { ...D, mode: "expr", value: O } : D);
    }
    function q(P) {
      s.value && (F(P, s.value), s.value = null);
    }
    function U(P, O) {
      O ? F(P, O) : G(P), s.value = null;
    }
    function ne(P, O) {
      d.value = !1, o.value = o.value.map((D) => D.key === P ? { ...D, mode: O } : D);
    }
    function ue(P, O) {
      d.value = !1, o.value = o.value.map((D) => D.key === P ? { ...D, value: O } : D);
    }
    function G(P) {
      d.value = !1;
      const O = m.value.find((D) => D.key === P);
      o.value = o.value.map((D) => D.key === P ? { key: P, mode: O?.required ? "static" : "skip", value: "", type: D.type } : D), s.value = null;
    }
    function J(P, O) {
      P.dataTransfer && (P.dataTransfer.setData("text/plain", O), P.dataTransfer.effectAllowed = "copy"), s.value = O;
    }
    function K(P, O) {
      P.preventDefault(), c.value = O;
    }
    function X(P) {
      c.value === P && (c.value = null);
    }
    function oe(P, O) {
      P.preventDefault();
      const D = P.dataTransfer?.getData("text/plain") || s.value;
      D && (F(O, D), s.value = null), c.value = null;
    }
    function le() {
      d.value = !1, a.value = ls(o.value), r.value = !0, s.value = null;
    }
    function fe() {
      const P = us(n.targetSchema, a.value);
      o.value = P.rows, P.raw === "" && (r.value = !1);
    }
    function _e(P) {
      a.value = P.target.value;
    }
    function $e(P) {
      P.key === "Escape" && s.value && (s.value = null, P.stopPropagation());
    }
    function me(P) {
      if (P.mode === "static" && P.value) return `Fixed value: ${P.value}`;
      if (P.mode === "expr" && P.value) {
        const O = `${h.value}.`;
        return P.value.startsWith(O) ? `From ${P.value.slice(O.length)}` : "Custom mapping";
      }
      return "Choose a field";
    }
    const ge = W(() => `{ field: ${h.value}.value }`);
    return (P, O) => ($(), R("div", {
      class: Ie(["fm", { "fm--armed": E.value }]),
      onKeydown: $e
    }, [
      x("div", GR, [
        x("span", {
          class: Ie(["fm-status", L.value ? "fm-status--warn" : "fm-status--ok"])
        }, [
          z(f(ae), {
            icon: L.value ? "tabler:alert-triangle" : "tabler:circle-check",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          x("span", null, Z(T.value), 1)
        ], 2),
        e.showAssist && A.value ? ($(), R("button", {
          key: 0,
          type: "button",
          class: "fm-ai",
          onClick: O[0] || (O[0] = (D) => e.assistPending ? i("cancel-assist") : i("assist"))
        }, [
          z(f(ae), {
            icon: e.assistPending ? "tabler:x" : "tabler:wand",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          x("span", null, Z(e.assistPending ? "Cancel" : "Draft with AI"), 1)
        ])) : Q("", !0)
      ]),
      e.assistPending ? ($(), R("p", jR, "Drafting a field mapping…")) : e.assistError ? ($(), R("p", XR, [
        z(f(ae), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        he(" " + Z(e.assistError), 1)
      ])) : Q("", !0),
      E.value ? ($(), R("div", KR, [
        z(f(ae), {
          icon: "tabler:pointer",
          "aria-hidden": "true"
        }),
        x("span", null, [
          O[2] || (O[2] = he("Mapping ", -1)),
          x("code", null, Z(s.value), 1),
          O[3] || (O[3] = he(" — pick a target field, or press Esc.", -1))
        ])
      ])) : Q("", !0),
      e.simple && !A.value ? ($(), R("div", ZR, [
        z(f(ae), {
          icon: "tabler:alert-triangle",
          "aria-hidden": "true"
        }),
        O[4] || (O[4] = x("span", null, "This step’s input fields didn’t load. Refresh the step before mapping it.", -1))
      ])) : !_.value && !r.value ? ($(), R("p", JR, " This step takes no input fields, so the connection passes through without a mapping. ")) : ($(), R("div", QR, [
        x("section", eD, [
          x("div", tD, Z(e.sourceTitle || "From"), 1),
          x("div", nD, [
            ($(!0), R(de, null, Oe(b.value, (D) => ($(), R("div", {
              key: D.expr,
              class: "fm-pill-row",
              style: He({ "--fm-depth": `${D.depth * 14}px` })
            }, [
              D.expandable ? ($(), R("button", {
                key: 0,
                type: "button",
                class: "fm-twist",
                "aria-expanded": !!l.value[D.path],
                "aria-label": `Expand ${D.name}`,
                onClick: (Y) => H(D.path)
              }, [
                z(f(ae), {
                  icon: l.value[D.path] ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, oD)) : ($(), R("span", iD)),
              x("button", {
                type: "button",
                class: Ie(["fm-pill", { "is-sel": s.value === D.expr }]),
                draggable: "true",
                title: D.description || D.expr,
                onClick: (Y) => C(D.expr),
                onDragstart: (Y) => J(Y, D.expr)
              }, [
                x("span", aD, Z(D.name), 1),
                x("span", sD, Z(D.type), 1)
              ], 42, rD)
            ], 4))), 128)),
            b.value.length ? Q("", !0) : ($(), R("p", lD, " No fields are available from the previous step yet. "))
          ])
        ]),
        x("section", uD, [
          x("div", cD, Z(e.targetTitle || "To"), 1),
          r.value && (!e.simple || u.value) ? ($(), R(de, { key: 0 }, [
            x("label", dD, [
              O[5] || (O[5] = x("span", { class: "fm-raw-lbl" }, "Expression", -1)),
              x("textarea", {
                class: "fm-raw-input",
                value: a.value,
                rows: "4",
                spellcheck: "false",
                placeholder: ge.value,
                "aria-label": "Mapping expression",
                onInput: _e
              }, null, 40, fD)
            ]),
            O[6] || (O[6] = x("p", { class: "fm-hint" }, "Build the complete input with one expression.", -1))
          ], 64)) : r.value ? ($(), R("p", OD, "A custom mapping is configured. Open Advanced mapping to inspect it.")) : ($(), R("div", hD, [
            m.value.length ? Q("", !0) : ($(), R("p", pD, "This target takes no input — nothing to map.")),
            ($(!0), R(de, null, Oe(m.value, (D) => ($(), R("div", {
              key: D.key,
              class: Ie(["fm-row", {
                "fm-row--needed": D.required && N.value.includes(D.title || D.key),
                "is-drop": c.value === D.key,
                "is-mapped": y(B(D.key))
              }]),
              "data-test": `fm-row-${D.key}`,
              onDragover: (Y) => K(Y, D.key),
              onDragleave: (Y) => X(D.key),
              onDrop: (Y) => oe(Y, D.key)
            }, [
              x("button", {
                type: "button",
                class: "fm-row-hd",
                "aria-label": E.value ? `Map ${s.value} into ${D.title}` : D.title,
                onClick: (Y) => q(D.key)
              }, [
                x("span", gD, Z(D.title), 1),
                D.required ? ($(), R("span", yD, "required")) : Q("", !0),
                x("span", wD, Z(D.type || "any"), 1),
                I(D) === "mismatch" ? ($(), R("span", bD, "type?")) : Q("", !0),
                E.value ? ($(), se(f(ae), {
                  key: 2,
                  class: "fm-row-drop",
                  icon: "tabler:arrow-bar-to-down",
                  "aria-hidden": "true"
                })) : Q("", !0)
              ], 8, mD),
              e.simple && !u.value ? ($(), R("div", _D, [
                x("select", {
                  class: "fm-simple-value",
                  value: B(D.key).mode === "expr" ? B(D.key).value : "",
                  "aria-label": `Choose a source field for ${D.title}`,
                  onChange: (Y) => U(D.key, Y.target.value)
                }, [
                  x("option", ED, Z(me(B(D.key))), 1),
                  ($(!0), R(de, null, Oe(S.value, (Y) => ($(), R("option", {
                    key: Y.expr,
                    value: Y.expr
                  }, Z(Y.name), 9, xD))), 128))
                ], 40, kD),
                y(B(D.key)) ? ($(), R("button", {
                  key: 0,
                  type: "button",
                  class: "fm-clear",
                  "aria-label": `Clear ${D.title}`,
                  title: "Clear",
                  onClick: (Y) => G(D.key)
                }, [
                  z(f(ae), {
                    icon: "tabler:x",
                    "aria-hidden": "true"
                  })
                ], 8, $D)) : Q("", !0)
              ])) : ($(), R("div", SD, [
                x("select", {
                  class: "fm-mode",
                  value: B(D.key).mode,
                  "aria-label": `How to fill ${D.title}`,
                  onChange: (Y) => ne(D.key, Y.target.value)
                }, [
                  O[7] || (O[7] = x("option", { value: "expr" }, "Field / expression", -1)),
                  O[8] || (O[8] = x("option", { value: "static" }, "Fixed value", -1)),
                  D.required ? Q("", !0) : ($(), R("option", ND, "Leave empty"))
                ], 40, CD),
                B(D.key).mode === "skip" ? ($(), R("button", {
                  key: 0,
                  type: "button",
                  class: "fm-cell fm-cell--empty",
                  onClick: (Y) => q(D.key)
                }, Z(E.value ? "Drop it here" : "Left empty"), 9, ID)) : B(D.key).mode === "static" ? ($(), R("input", {
                  key: 1,
                  class: "fm-cell fm-input",
                  value: B(D.key).value,
                  placeholder: D.description || "value",
                  "aria-label": `${D.title} fixed value`,
                  onInput: (Y) => ue(D.key, Y.target.value)
                }, null, 40, AD)) : ($(), R("input", {
                  key: 2,
                  class: "fm-cell fm-input fm-mono",
                  value: B(D.key).value,
                  placeholder: s.value || `${h.value}.field`,
                  "aria-label": `${D.title} expression`,
                  onInput: (Y) => ue(D.key, Y.target.value)
                }, null, 40, TD)),
                y(B(D.key)) ? ($(), R("button", {
                  key: 3,
                  type: "button",
                  class: "fm-clear",
                  "aria-label": `Clear ${D.title}`,
                  title: "Clear",
                  onClick: (Y) => G(D.key)
                }, [
                  z(f(ae), {
                    icon: "tabler:x",
                    "aria-hidden": "true"
                  })
                ], 8, MD)) : Q("", !0)
              ]))
            ], 42, vD))), 128))
          ]))
        ])
      ])),
      e.simple && (_.value || r.value) ? ($(), R("button", {
        key: 6,
        type: "button",
        class: "fm-linkbtn",
        onClick: O[1] || (O[1] = (D) => u.value = !u.value)
      }, Z(u.value ? "Hide advanced mapping" : "Advanced mapping"), 1)) : _.value && !r.value ? ($(), R("button", {
        key: 7,
        type: "button",
        class: "fm-linkbtn",
        onClick: le
      }, " Write the whole expression myself ")) : _.value && r.value ? ($(), R("button", {
        key: 8,
        type: "button",
        class: "fm-linkbtn",
        onClick: fe
      }, " Back to fields ")) : Q("", !0),
      e.simple && u.value && _.value && !r.value ? ($(), R("button", {
        key: 9,
        type: "button",
        class: "fm-linkbtn",
        onClick: le
      }, " Edit the complete expression ")) : Q("", !0),
      e.simple && u.value && _.value && r.value ? ($(), R("button", {
        key: 10,
        type: "button",
        class: "fm-linkbtn",
        onClick: fe
      }, " Back to field mapping ")) : Q("", !0)
    ], 34));
  }
}), Xi = "The assistant couldn’t generate a mapping.", Op = 11e4;
function Rp(e) {
  if (Md(e) === 404) return "The mapping assistant isn’t available yet.";
  const t = e?.response?.data;
  return t ? En(t, e instanceof Error && e.message ? e.message : Xi) : e instanceof Error && e.message ? e.message : Xi;
}
async function DD(e, t, n, i, o = {}, r) {
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
    const { data: s } = await zn.post(`/api/v1/workflows/${encodeURIComponent(e)}/assist/edge`, a, { timeout: Op, signal: r });
    return s && s.success === !1 ? { error: En(s, Xi) } : s && typeof s.transform == "string" ? { transform: s.transform } : { error: "The assistant returned no mapping." };
  } catch (a) {
    return { error: Rp(a) };
  }
}
async function PD(e, t, n, i, o, r, a, s = {}, l) {
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
    const { data: u } = await zn.post(`/api/v1/workflows/${encodeURIComponent(e)}/assist/edge`, c, { timeout: Op, signal: l });
    return u && u.success === !1 ? { error: En(u, Xi) } : u?.kind === "mapping" && typeof u.transform == "string" ? { kind: "mapping", transform: u.transform, summary: typeof u.summary == "string" ? u.summary : "" } : u?.kind === "condition" && typeof u.predicate == "string" ? { kind: "condition", predicate: u.predicate, summary: typeof u.summary == "string" ? u.summary : "" } : u?.kind === "failure_route" && typeof u.available == "boolean" && u.source_port === "failed" ? { kind: "failure_route", available: u.available, source_port: "failed", summary: typeof u.summary == "string" ? u.summary : "" } : u?.kind === "insert_node" && typeof u.block_id == "string" && typeof u.block_title == "string" ? { kind: "insert_node", block_id: u.block_id, block_title: u.block_title, summary: typeof u.summary == "string" ? u.summary : "" } : { error: "The assistant returned no usable connection preview." };
  } catch (c) {
    return { error: Rp(c) };
  }
}
function LD(e) {
  return "transform" in e && typeof e.transform == "string";
}
function zD(e) {
  return "kind" in e;
}
const VD = { class: "wf-edge-route" }, BD = ["title"], FD = ["title"], HD = { class: "wf-panel-foot" }, qD = /* @__PURE__ */ we({
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
    const n = e, i = t, o = j(""), r = j(null), a = j(0);
    let s = null;
    function l() {
      s?.abort(), s = null, r.value = null;
    }
    ke(() => n.edge?.id, () => {
      l(), o.value = n.edge?.transform || "", r.value = null;
    }, { immediate: !0 });
    const c = W(() => `${n.edge?.id || ""}:${a.value}`);
    function u(v) {
      o.value = v, i("update-edge", { transform: v });
    }
    async function d(v) {
      try {
        const g = await Nd(n.workflowId, 5);
        for (const m of g) {
          const _ = await Td(n.workflowId, m.run_id, v), E = Eg(_);
          if (E != null) return E;
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
      const _ = await DD(
        n.workflowId,
        { id: n.edge.id, source_id: n.edge.source_id, target_id: n.edge.target_id, transform: o.value },
        n.edgeUpstreamSchema,
        n.edgeDownstreamSchema,
        m != null ? { upstreamSample: m } : {},
        v.signal
      );
      v.signal.aborted || s !== v || n.edge.id !== g || (s = null, LD(_) ? (o.value = _.transform, i("update-edge", { transform: _.transform }), r.value = null, a.value++) : r.value = { kind: "error", message: _.error });
    }
    function p() {
      l();
    }
    return Qe(l), (v, g) => ($(), R(de, null, [
      g[2] || (g[2] = x("div", { class: "wf-panel-hdr wf-panel-hdr--edge" }, [
        x("span", { class: "wf-panel-hdr-kind" }, "Connection")
      ], -1)),
      x("h3", VD, [
        x("span", {
          class: "wf-edge-route-name",
          title: e.sourceTitle || "Previous step"
        }, Z(e.sourceTitle || "Previous step"), 9, BD),
        z(f(ae), {
          icon: "tabler:arrow-right",
          "aria-hidden": "true"
        }),
        x("span", {
          class: "wf-edge-route-name",
          title: e.targetTitle || "Next step"
        }, Z(e.targetTitle || "Next step"), 9, FD)
      ]),
      g[3] || (g[3] = x("p", { class: "wf-panel-how" }, "Choose what the next step receives. Matching fields are connected automatically.", -1)),
      g[4] || (g[4] = x("div", { class: "wf-panel-label" }, "Data", -1)),
      z(RD, {
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
      g[5] || (g[5] = x("p", { class: "wf-panel-hint" }, "Select a field on the left, then the field it should fill on the right. Matching names need no setup.", -1)),
      x("div", HD, [
        z(f(pe), {
          severity: "danger",
          onClick: g[0] || (g[0] = (m) => i("remove-edge"))
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            }),
            g[1] || (g[1] = x("span", null, "Delete connection", -1))
          ]),
          _: 1
        })
      ])
    ], 64));
  }
}), UD = { class: "wf-panel-hdr wf-panel-hdr--note" }, WD = { class: "wf-panel-hdr-kind" }, YD = { class: "wf-sr-only" }, GD = { class: "wf-panel-foot" }, jD = /* @__PURE__ */ we({
  __name: "NotePanel",
  props: {
    note: {}
  },
  emits: ["update-note", "remove-note"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = W(() => n.note?.kind === "frame"), r = [...Js], a = W({
      get: () => n.note?.color || "amber",
      set: (l) => i("update-note", { color: l })
    }), s = j("");
    return ke(() => n.note?.id, () => {
      s.value = n.note?.text || "";
    }, { immediate: !0 }), (l, c) => ($(), R(de, null, [
      x("div", UD, [
        x("span", WD, Z(o.value ? "Frame" : "Note"), 1)
      ]),
      z(f(Ms), {
        modelValue: a.value,
        "onUpdate:modelValue": c[0] || (c[0] = (u) => a.value = u),
        class: "wf-note-colors",
        options: r,
        "option-label": "key",
        "option-value": "key",
        "aria-label": o.value ? "Frame color" : "Note color"
      }, {
        option: ie(({ option: u }) => [
          x("span", {
            class: Ie(["wf-note-color-dot", f(Qs)(u.key).replace("wf-note--", "wf-swatch--")]),
            "aria-hidden": "true"
          }, null, 2),
          x("span", YD, Z(u.key), 1)
        ]),
        _: 1
      }, 8, ["modelValue", "aria-label"]),
      o.value ? ($(), R(de, { key: 0 }, [
        c[7] || (c[7] = x("div", { class: "wf-panel-label" }, "Title", -1)),
        z(f(rt), {
          modelValue: s.value,
          "onUpdate:modelValue": c[1] || (c[1] = (u) => s.value = u),
          class: "wf-input",
          placeholder: "Frame title",
          "aria-label": "Frame title",
          onChange: c[2] || (c[2] = (u) => i("update-note", { text: s.value })),
          onKeydown: c[3] || (c[3] = tt((u) => i("update-note", { text: s.value }), ["enter"]))
        }, null, 8, ["modelValue"]),
        c[8] || (c[8] = x("p", { class: "wf-panel-hint" }, "A colored background region — drag steps onto it to group them, and resize it from its corners.", -1))
      ], 64)) : ($(), R(de, { key: 1 }, [
        z(f(Os), {
          modelValue: s.value,
          "onUpdate:modelValue": c[4] || (c[4] = (u) => s.value = u),
          class: "wf-textarea",
          rows: "6",
          placeholder: "Write a note… markdown supported",
          "aria-label": "Note text",
          onChange: c[5] || (c[5] = (u) => i("update-note", { text: s.value }))
        }, null, 8, ["modelValue"]),
        c[9] || (c[9] = x("p", { class: "wf-panel-hint" }, "Markdown supported — headings, lists, links, and code.", -1))
      ], 64)),
      x("div", GD, [
        z(f(pe), {
          severity: "danger",
          onClick: c[6] || (c[6] = (u) => i("remove-note"))
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            }),
            x("span", null, "Delete " + Z(o.value ? "frame" : "note"), 1)
          ]),
          _: 1
        })
      ])
    ], 64));
  }
});
function XD(e) {
  const t = ig(e), n = t?.properties;
  if (!n || typeof n != "object") return;
  const i = new Set(Array.isArray(t.required) ? t.required.map(String) : []), o = {};
  for (const [r, a] of Object.entries(n)) {
    const s = a && typeof a == "object" ? { ...a } : {};
    i.has(r) && (s.required = !0), o[r] = s;
  }
  return Object.keys(o).length ? o : void 0;
}
function KD(e) {
  const t = XD(e);
  return t ? { config_schema: t } : null;
}
const ZD = { class: "wf-panel" }, JD = { class: "wf-panel-hdr-kind" }, QD = { class: "wf-panel-how" }, eP = { class: "wf-boundary-tag" }, tP = { class: "wf-panel-hint" }, nP = {
  key: 0,
  class: "wf-panel-hint"
}, oP = { class: "wf-panel-label" }, iP = {
  key: 0,
  class: "wf-panel-hint"
}, rP = {
  key: 0,
  class: "wf-panel-label"
}, aP = {
  key: 1,
  class: "wf-panel-hint"
}, sP = { class: "wf-panel-hint" }, lP = {
  key: 5,
  class: "wf-panel-foot"
}, uP = { class: "wf-panel-hint wf-panel-pinned-note" }, cP = {
  key: 6,
  class: "wf-panel-foot"
}, dP = "wc-schema-form", ad = /* @__PURE__ */ we({
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
    const n = e, i = t, o = W(() => n.node ? bi(n.node.kind, n.node.ref) : null), r = j({});
    ke(() => [n.node?.id, n.node?.config], () => {
      r.value = { ...n.node?.config };
    }, { immediate: !0, flush: "sync" });
    function a(q) {
      r.value = q, i("update-node", { config: q });
    }
    const s = W(() => n.node?.kind === "block" && !!n.node.ref), l = W(() => n.node?.ref ? rg[n.node.ref]?.execution : void 0), c = W(() => s.value && ["function", "tool"].includes(l.value?.kind || "")), u = W(() => s.value && ag(n.node?.ref)), d = W(() => !n.node || !s.value ? null : KD(Dl(n.node.ref))), h = W(() => n.node?.ref === "kickside.inbox:block.review" && d.value?.config_schema.assignee?.readOnly === !0), p = W(() => h.value && typeof r.value.assignee == "string" && r.value.assignee !== ""), v = W(() => {
      const q = d.value;
      if (!q || !h.value) return q;
      const U = { ...q.config_schema };
      return delete U.assignee, { config_schema: U };
    });
    function g() {
      if (!p.value) return;
      const q = { ...r.value };
      delete q.assignee, a(q);
    }
    const m = W(() => n.node && s.value ? sg(n.node.ref) : void 0), _ = W(() => lg(v.value, "workflow-extension-node")), E = W(() => ug(v.value, "workflow-extension-node")), w = W(() => {
      const q = E.value && typeof E.value == "object" ? E.value.properties : null;
      return q && typeof q == "object" && !Array.isArray(q) ? Object.keys(q) : [];
    }), b = W(() => Object.fromEntries(
      w.value.filter((q) => r.value[q] !== void 0).map((q) => [q, r.value[q]])
    )), S = W(() => !!n.node && Ss(n.node.kind)), N = W(() => !!n.node && (S.value || n.node.pinned === !0 || !!n.node.boundary)), V = W(() => n.node && S.value ? cg[n.node.kind] : ""), A = W(() => {
      const q = r.value[V.value];
      return q && typeof q == "object" && !Array.isArray(q) ? q : { type: "object", properties: {} };
    }), T = W(() => n.node?.kind === "start" ? "Expected input" : n.node?.kind === "finish" ? "Result" : "Error details");
    function L(q) {
      V.value && a({ ...r.value, [V.value]: q });
    }
    function M(q) {
      !n.node || !q || typeof q != "object" || Array.isArray(q) || a({ ...r.value, ...q });
    }
    function k(q) {
      if (!_.value || !q || typeof q != "object" || Array.isArray(q)) return;
      const U = _.value.key;
      U in q && a({ ...r.value, [U]: q[U] });
    }
    function B(q) {
      if (!n.node) return;
      const U = { ...r.value };
      for (const ne of w.value) delete U[ne];
      Object.assign(U, q), a(U);
    }
    const y = W(() => {
      const q = r.value.flow_ref;
      return q && typeof q == "object" && !Array.isArray(q) ? String(q.id || n.node?.ref || "") : String(n.node?.ref || "");
    });
    function I(q) {
      n.node && i("update-node", {
        title: q.title,
        config: {
          flow_ref: {
            kind: "flow",
            id: q.id,
            version: q.published_version
          }
        }
      });
    }
    const C = W(() => {
      const q = n.node?.kind;
      return q === "branch" || q === "cycle" || wi(q) || Hi(q);
    }), H = j("");
    ke(() => n.node?.id, () => {
      H.value = Je(n.node?.title, n.node?.ref);
    }, { immediate: !0 });
    function F() {
      const q = H.value.trim();
      n.node && q && q !== n.node.title && i("update-node", { title: q });
    }
    return (q, U) => ($(), R("aside", ZD, [
      z(f(pe), {
        class: "wf-panel-close",
        text: "",
        rounded: "",
        severity: "secondary",
        title: "Close",
        "aria-label": "Close inspector",
        onClick: U[0] || (U[0] = (ne) => i("close"))
      }, {
        default: ie(() => [
          z(f(ae), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }),
      e.node && o.value ? ($(), R(de, { key: 0 }, [
        x("div", {
          class: Ie(["wf-panel-hdr", f($d)(o.value.hueVar)])
        }, [
          U[9] || (U[9] = x("span", { class: "wf-panel-hdr-dot" }, null, -1)),
          x("span", JD, Z(o.value.label), 1)
        ], 2),
        z(f(rt), {
          modelValue: H.value,
          "onUpdate:modelValue": U[1] || (U[1] = (ne) => H.value = ne),
          class: "wf-panel-title-input",
          "aria-label": "Step title",
          onChange: F,
          onKeydown: tt(F, ["enter"])
        }, null, 8, ["modelValue"]),
        x("p", QD, Z(o.value.blurb), 1),
        S.value ? ($(), R(de, { key: 0 }, [
          x("div", eP, [
            z(f(ae), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            U[10] || (U[10] = x("span", null, "Workflow boundary · can’t be removed", -1))
          ]),
          z(Rs, {
            mode: "schema",
            "model-value": A.value,
            "reset-key": e.node.id,
            surface: `workflow.boundary.${e.node.kind}`,
            label: T.value,
            onChange: L
          }, null, 8, ["model-value", "reset-key", "surface", "label"]),
          x("p", tP, Z(e.node.kind === "start" ? "Describe what someone provides when this Workflow starts." : e.node.kind === "finish" ? "Describe what a successful run returns." : "Describe what a failed run returns."), 1)
        ], 64)) : Q("", !0),
        s.value ? ($(), R(de, { key: 1 }, [
          h.value ? ($(), R(de, { key: 0 }, [
            U[12] || (U[12] = x("p", { class: "wf-panel-hint" }, "Review goes to the person running this Flow.", -1)),
            p.value ? ($(), R("p", nP, "This step has a saved assignee from an earlier version.")) : Q("", !0),
            p.value ? ($(), se(f(pe), {
              key: 1,
              severity: "secondary",
              text: "",
              onClick: g
            }, {
              default: ie(() => [...U[11] || (U[11] = [
                he("Use Flow runner", -1)
              ])]),
              _: 1
            })) : Q("", !0)
          ], 64)) : Q("", !0),
          m.value ? ($(), R(de, { key: 1 }, [
            U[13] || (U[13] = x("div", { class: "wf-panel-label" }, "Configuration", -1)),
            z(ai, {
              tag: m.value,
              schema: f(Dl)(e.node.ref),
              config: r.value,
              onChange: M
            }, null, 8, ["tag", "schema", "config"])
          ], 64)) : _.value ? ($(), R(de, { key: 2 }, [
            x("div", oP, Z(u.value ? "Fixed input overrides" : _.value.title || "Configuration"), 1),
            u.value ? ($(), R("p", iP, " Optional fixed values override matching inputs from the connection. Leave them empty to use incoming data. ")) : Q("", !0),
            z(ai, {
              tag: _.value.tag,
              schema: _.value.schema,
              config: r.value,
              attrs: { value: r.value },
              onChange: k
            }, null, 8, ["tag", "schema", "config", "attrs"])
          ], 64)) : Q("", !0),
          !m.value && E.value ? ($(), R(de, { key: 3 }, [
            _.value ? Q("", !0) : ($(), R("div", rP, Z(u.value ? "Fixed input overrides" : "Configuration"), 1)),
            u.value && !_.value ? ($(), R("p", aP, " Optional fixed values override matching inputs from the connection. Leave them empty to use incoming data. ")) : Q("", !0),
            z(Tp, {
              "workflow-id": e.workflowId,
              "reset-key": e.node.id,
              "config-schema": E.value,
              "current-config": b.value,
              "upstream-schema": e.nodeUpstreamSchema,
              onAccept: B,
              onUndo: B
            }, null, 8, ["workflow-id", "reset-key", "config-schema", "current-config", "upstream-schema"]),
            z(ai, {
              tag: dP,
              schema: E.value,
              config: r.value,
              onChange: M
            }, null, 8, ["schema", "config"])
          ], 64)) : Q("", !0)
        ], 64)) : Q("", !0),
        e.node && c.value && l.value ? ($(), se(rR, {
          key: e.node.id,
          node: e.node,
          execution: l.value,
          onUpdateNode: U[2] || (U[2] = (ne) => i("update-node", ne))
        }, null, 8, ["node", "execution"])) : Q("", !0),
        f(Sd)(e.node.kind) ? ($(), R(de, { key: 3 }, [
          U[14] || (U[14] = x("div", { class: "wf-panel-label" }, "Workflow", -1)),
          z(qO, {
            "workflow-id": n.workflowId,
            "selected-id": y.value,
            "upstream-schema": n.nodeUpstreamSchema,
            onSelect: I
          }, null, 8, ["workflow-id", "selected-id", "upstream-schema"]),
          x("p", sP, Z(f(vR)), 1)
        ], 64)) : Q("", !0),
        C.value ? ($(), se(YR, {
          key: 4,
          "workflow-id": e.workflowId,
          node: e.node,
          "upstream-schema": e.nodeUpstreamSchema,
          "combine-branch-conflict": e.combineBranchConflict,
          onUpdateNode: U[3] || (U[3] = (ne) => i("update-node", ne))
        }, null, 8, ["workflow-id", "node", "upstream-schema", "combine-branch-conflict"])) : Q("", !0),
        N.value ? ($(), R("div", lP, [
          x("p", uP, [
            z(f(ae), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            U[15] || (U[15] = x("span", null, "This step is required and can’t be deleted.", -1))
          ])
        ])) : ($(), R("div", cP, [
          z(f(pe), {
            severity: "danger",
            onClick: U[4] || (U[4] = (ne) => i("remove-node"))
          }, {
            default: ie(() => [
              z(f(ae), {
                icon: "tabler:trash",
                "aria-hidden": "true"
              }),
              U[16] || (U[16] = x("span", null, "Delete step", -1))
            ]),
            _: 1
          })
        ]))
      ], 64)) : e.edge ? ($(), se(qD, {
        key: 1,
        "workflow-id": n.workflowId,
        edge: e.edge,
        "edge-upstream-schema": e.edgeUpstreamSchema,
        "edge-downstream-schema": e.edgeDownstreamSchema,
        "source-title": e.edgeSourceTitle,
        "target-title": e.edgeTargetTitle,
        onUpdateEdge: U[5] || (U[5] = (ne) => i("update-edge", ne)),
        onRemoveEdge: U[6] || (U[6] = (ne) => i("remove-edge"))
      }, null, 8, ["workflow-id", "edge", "edge-upstream-schema", "edge-downstream-schema", "source-title", "target-title"])) : e.note ? ($(), se(jD, {
        key: 2,
        note: e.note,
        onUpdateNote: U[7] || (U[7] = (ne) => i("update-note", ne)),
        onRemoveNote: U[8] || (U[8] = (ne) => i("remove-note"))
      }, null, 8, ["note"])) : Q("", !0)
    ]));
  }
}), fP = {
  key: 0,
  class: "wf-sim-field"
}, hP = {
  key: 1,
  class: "wf-sim-note"
}, pP = /* @__PURE__ */ we({
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
    return (o, r) => ($(), se(f(Jt), {
      visible: !0,
      modal: "",
      "dismissable-mask": "",
      header: "Run with input",
      class: "wf-sim-pop",
      "onUpdate:visible": i
    }, {
      footer: ie(() => [
        z(f(pe), {
          label: "Cancel",
          severity: "secondary",
          text: "",
          onClick: r[2] || (r[2] = (a) => n("close"))
        }),
        z(f(pe), {
          disabled: !e.canRun,
          onClick: r[3] || (r[3] = (a) => n("run"))
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:player-play",
              "aria-hidden": "true"
            }),
            r[6] || (r[6] = x("span", null, "Run", -1))
          ]),
          _: 1
        }, 8, ["disabled"])
      ]),
      default: ie(() => [
        r[7] || (r[7] = x("p", { class: "wf-sim-hint" }, "Try this Workflow with the input below. It checks the expected input and does not publish your changes.", -1)),
        e.hasFields ? ($(), R("div", fP, [
          r[4] || (r[4] = x("span", { class: "wf-sim-label" }, "Input", -1)),
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
        ])) : ($(), R("p", hP, "This Workflow needs no input.")),
        e.valid ? Q("", !0) : ($(), se(f(Be), {
          key: 2,
          class: "wf-sim-err",
          severity: "error",
          closable: !1
        }, {
          default: ie(() => [...r[5] || (r[5] = [
            he("Fix the JSON above before running.", -1)
          ])]),
          _: 1
        })),
        e.errorMessage ? ($(), se(f(Be), {
          key: 3,
          class: "wf-sim-err",
          severity: "error",
          closable: !1
        }, {
          default: ie(() => [
            he(Z(e.errorMessage), 1)
          ]),
          _: 1
        })) : Q("", !0)
      ]),
      _: 1
    }));
  }
});
function Dp(e) {
  const t = j(null);
  let n = null;
  function i() {
    const o = t.value?.getBoundingClientRect();
    !o || o.width <= 0 || o.height <= 0 || e({ width: o.width, height: o.height });
  }
  return Ue(async () => {
    await ze(), i(), !(typeof ResizeObserver > "u" || !t.value) && (n = new ResizeObserver(i), n.observe(t.value));
  }), Qe(() => {
    n?.disconnect(), n = null;
  }), { overlayEl: t };
}
const sd = "Mapped automatically", Ba = "Mapped automatically — view", vP = "Click to open the full mapper.";
function mP(e) {
  return `Mapped ${e} field${e === 1 ? "" : "s"} by name and type.`;
}
const gP = "What should flow here?", ld = "e.g. use the first search result’s link", yP = "Describe what should happen — mapping, branching and failure routes are previewed before anything changes.", wP = "Draft", bP = "Drafting from your description — this can take up to a minute.", _P = "Here’s the mapping I drafted", kP = "Apply", ud = "Open mapper", cd = "Redraft", dd = "Dismiss", fd = "I couldn’t draft that connection — edit your description and try again, or open the mapper to continue by hand.", EP = "The connection stays — it needs a mapping before this Workflow can run.", xP = { class: "wf-intent-hd" }, $P = {
  key: 0,
  class: "wf-intent-needs"
}, SP = {
  key: 1,
  class: "wf-intent-note"
}, CP = {
  key: 2,
  class: "wf-intent-help"
}, NP = { class: "wf-intent-foot" }, IP = { class: "wf-intent-hd" }, AP = {
  key: 0,
  class: "wf-intent-summary"
}, TP = {
  key: 1,
  class: "wf-intent-rows"
}, MP = { class: "wf-intent-src" }, OP = { class: "wf-intent-tgt" }, RP = {
  key: 1,
  class: "wf-intent-raw"
}, DP = {
  key: 2,
  class: "wf-intent-topology"
}, PP = { class: "wf-intent-step" }, LP = { class: "wf-intent-raw" }, zP = {
  key: 3,
  class: "wf-intent-topology"
}, VP = {
  key: 4,
  class: "wf-intent-topology"
}, BP = { class: "wf-intent-step" }, FP = { class: "wf-intent-foot" }, HP = { class: "wf-intent-hd wf-intent-hd--err" }, qP = { class: "wf-intent-help" }, UP = { class: "wf-intent-foot" }, WP = /* @__PURE__ */ we({
  __name: "EdgeIntentPopover",
  props: {
    workflowId: {},
    edge: {},
    availableSteps: {}
  },
  emits: ["accept", "suggest-node", "open-mapper", "dismiss", "measure"],
  setup(e, { emit: t }) {
    const n = e, i = t, { overlayEl: o } = Dp((S) => i("measure", S)), r = j("intent"), a = j(""), s = j(null), l = j(""), c = j(null);
    let u = null;
    function d() {
      const S = c.value?.$el;
      S instanceof HTMLInputElement && S.focus();
    }
    Ue(() => ze(d));
    function h() {
      u?.abort(), u = null, r.value = "intent", a.value = "", s.value = null, l.value = "", ze(d);
    }
    ke(() => n.edge.id, h), Qe(() => u?.abort());
    const p = W(() => n.edge.unresolved.map((S) => S.title).filter(Boolean)), v = W(() => {
      const S = s.value?.kind === "mapping" ? s.value.transform : "", N = Ch(S);
      return N && N.length ? N : null;
    }), g = W(() => s.value?.kind === "condition" ? "Add a Condition?" : s.value?.kind === "failure_route" ? "Use the Failed route?" : s.value?.kind === "insert_node" ? "Suggested step" : _P), m = W(() => s.value?.kind === "condition" ? "tabler:arrows-split-2" : s.value?.kind === "failure_route" ? "tabler:route-x-2" : s.value?.kind === "insert_node" ? "tabler:box-padding" : "tabler:sparkles"), _ = W(() => s.value?.kind === "condition" ? "Add Condition" : s.value?.kind === "failure_route" ? "Use Failed route" : s.value?.kind === "insert_node" ? "Show in palette" : kP);
    async function E() {
      const S = a.value.trim();
      if (!S || r.value === "drafting") return;
      u?.abort();
      const N = new AbortController(), V = n.edge.id;
      u = N, r.value = "drafting", l.value = "";
      const A = await PD(
        n.workflowId,
        { id: n.edge.id, source_id: n.edge.sourceId, target_id: n.edge.targetId },
        n.edge.sourceSchema,
        n.edge.targetSchema,
        S,
        n.edge.sourceFailureAvailable,
        n.availableSteps,
        {},
        N.signal
      );
      N.signal.aborted || u !== N || n.edge.id !== V || (u = null, zD(A) ? (s.value = A, r.value = "preview") : (l.value = A.error || fd, r.value = "error"));
    }
    function w() {
      const S = s.value;
      S && (S.kind === "insert_node" ? i("suggest-node", S.block_id) : (S.kind !== "failure_route" || S.available) && i("accept", S));
    }
    function b() {
      r.value = "intent", ze(d);
    }
    return (S, N) => ($(), R("div", {
      ref_key: "overlayEl",
      ref: o,
      class: "wf-intent",
      role: "region",
      "aria-label": "Describe this connection",
      onKeydown: N[6] || (N[6] = tt(Fe((V) => i("dismiss"), ["stop", "prevent"]), ["esc"])),
      onPointerdown: N[7] || (N[7] = Fe(() => {
      }, ["stop"]))
    }, [
      z(f(pe), {
        class: "wf-intent-x",
        text: "",
        rounded: "",
        severity: "secondary",
        "aria-label": "Dismiss",
        title: f(dd),
        onClick: N[0] || (N[0] = (V) => i("dismiss"))
      }, {
        default: ie(() => [
          z(f(ae), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }, 8, ["title"]),
      r.value === "intent" || r.value === "drafting" ? ($(), R(de, { key: 0 }, [
        x("div", xP, [
          z(f(ae), {
            icon: "tabler:wand",
            "aria-hidden": "true"
          }),
          x("span", null, Z(f(gP)), 1)
        ]),
        p.value.length ? ($(), R("p", $P, [
          N[8] || (N[8] = he("Needs ", -1)),
          x("strong", null, Z(p.value.join(", ")), 1),
          N[9] || (N[9] = he(".", -1))
        ])) : Q("", !0),
        z(f(rt), {
          ref_key: "inputEl",
          ref: c,
          modelValue: a.value,
          "onUpdate:modelValue": N[1] || (N[1] = (V) => a.value = V),
          class: "wf-intent-input",
          placeholder: f(ld),
          disabled: r.value === "drafting",
          "aria-label": "What should flow across this connection",
          onKeydown: tt(Fe(E, ["prevent"]), ["enter"])
        }, null, 8, ["modelValue", "placeholder", "disabled", "onKeydown"]),
        r.value === "drafting" ? ($(), R("p", SP, [
          z(f(yt), {
            class: "wf-status-spinner",
            "stroke-width": "4",
            "aria-label": "Drafting connection"
          }),
          he(" " + Z(f(bP)), 1)
        ])) : ($(), R("p", CP, Z(f(yP)), 1)),
        x("div", NP, [
          z(f(pe), {
            severity: "secondary",
            outlined: "",
            onClick: N[2] || (N[2] = (V) => i("dismiss"))
          }, {
            default: ie(() => [
              he(Z(f(dd)), 1)
            ]),
            _: 1
          }),
          z(f(pe), {
            class: "wf-intent-submit",
            disabled: !a.value.trim() || r.value === "drafting",
            loading: r.value === "drafting",
            onClick: E
          }, {
            default: ie(() => [
              r.value !== "drafting" ? ($(), se(f(ae), {
                key: 0,
                icon: "tabler:sparkles",
                "aria-hidden": "true"
              })) : Q("", !0),
              x("span", null, Z(f(wP)), 1)
            ]),
            _: 1
          }, 8, ["disabled", "loading"])
        ])
      ], 64)) : r.value === "preview" ? ($(), R(de, { key: 1 }, [
        x("div", IP, [
          z(f(ae), {
            icon: m.value,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          x("span", null, Z(g.value), 1)
        ]),
        s.value?.summary ? ($(), R("p", AP, Z(s.value.summary), 1)) : Q("", !0),
        s.value?.kind === "mapping" ? ($(), R("div", TP, [
          v.value && v.value.length ? ($(!0), R(de, { key: 0 }, Oe(v.value, (V) => ($(), R("div", {
            key: V.key,
            class: "wf-intent-row"
          }, [
            x("code", MP, Z(V.rhs), 1),
            z(f(ae), {
              icon: "tabler:arrow-right",
              "aria-hidden": "true"
            }),
            x("code", OP, Z(V.key), 1)
          ]))), 128)) : ($(), R("code", RP, Z(s.value.transform), 1))
        ])) : s.value?.kind === "condition" ? ($(), R("div", DP, [
          x("span", PP, [
            z(f(ae), {
              icon: "tabler:arrows-split-2",
              "aria-hidden": "true"
            }),
            N[10] || (N[10] = he("Condition", -1))
          ]),
          x("code", LP, Z(s.value.predicate), 1),
          N[11] || (N[11] = x("p", { class: "wf-intent-help" }, "The current connection becomes the True path. The False path stays visible for you to connect.", -1))
        ])) : s.value?.kind === "failure_route" ? ($(), R("div", zP, [
          x("span", {
            class: Ie(["wf-intent-step", !s.value.available && "is-unavailable"])
          }, [
            z(f(ae), {
              icon: "tabler:route-x-2",
              "aria-hidden": "true"
            }),
            N[12] || (N[12] = he("Failed", -1))
          ], 2),
          s.value.available ? Q("", !0) : ($(), se(f(Be), {
            key: 0,
            class: "wf-intent-err",
            severity: "warn",
            closable: !1
          }, {
            default: ie(() => [...N[13] || (N[13] = [
              he("This step has no Failed output to connect.", -1)
            ])]),
            _: 1
          }))
        ])) : s.value?.kind === "insert_node" ? ($(), R("div", VP, [
          x("span", BP, [
            z(f(ae), {
              icon: "tabler:box-padding",
              "aria-hidden": "true"
            }),
            he(Z(s.value.block_title), 1)
          ]),
          N[14] || (N[14] = x("p", { class: "wf-intent-help" }, "This is an existing Workflow step. Choose it from the palette before the graph changes.", -1))
        ])) : Q("", !0),
        x("div", FP, [
          z(f(pe), {
            severity: "secondary",
            outlined: "",
            onClick: b
          }, {
            default: ie(() => [
              he(Z(f(cd)), 1)
            ]),
            _: 1
          }),
          s.value?.kind === "mapping" ? ($(), se(f(pe), {
            key: 0,
            severity: "secondary",
            outlined: "",
            onClick: N[3] || (N[3] = (V) => i("open-mapper"))
          }, {
            default: ie(() => [
              he(Z(f(ud)), 1)
            ]),
            _: 1
          })) : Q("", !0),
          z(f(pe), {
            class: "wf-intent-submit",
            disabled: s.value?.kind === "failure_route" && !s.value.available,
            onClick: w
          }, {
            default: ie(() => [
              z(f(ae), {
                icon: "tabler:check",
                "aria-hidden": "true"
              }),
              x("span", null, Z(_.value), 1)
            ]),
            _: 1
          }, 8, ["disabled"])
        ])
      ], 64)) : ($(), R(de, { key: 2 }, [
        x("div", HP, [
          z(f(ae), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          N[15] || (N[15] = x("span", null, "Couldn’t draft that", -1))
        ]),
        z(f(Be), {
          class: "wf-intent-err",
          severity: "error",
          closable: !1
        }, {
          default: ie(() => [
            he(Z(l.value || f(fd)), 1)
          ]),
          _: 1
        }),
        z(f(rt), {
          ref_key: "inputEl",
          ref: c,
          modelValue: a.value,
          "onUpdate:modelValue": N[4] || (N[4] = (V) => a.value = V),
          class: "wf-intent-input",
          placeholder: f(ld),
          "aria-label": "What should flow across this connection",
          onKeydown: tt(Fe(E, ["prevent"]), ["enter"])
        }, null, 8, ["modelValue", "placeholder", "onKeydown"]),
        x("p", qP, Z(f(EP)), 1),
        x("div", UP, [
          z(f(pe), {
            severity: "secondary",
            outlined: "",
            onClick: N[5] || (N[5] = (V) => i("open-mapper"))
          }, {
            default: ie(() => [
              he(Z(f(ud)), 1)
            ]),
            _: 1
          }),
          z(f(pe), {
            class: "wf-intent-submit",
            disabled: !a.value.trim(),
            onClick: E
          }, {
            default: ie(() => [
              z(f(ae), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              }),
              x("span", null, Z(f(cd)), 1)
            ]),
            _: 1
          }, 8, ["disabled"])
        ])
      ], 64))
    ], 544));
  }
}), YP = { class: "wf-automap-hd" }, GP = { class: "wf-automap-title" }, jP = { class: "wf-automap-count" }, XP = { class: "wf-automap-pairs" }, KP = ["title"], ZP = { class: "wf-automap-src" }, JP = { class: "wf-automap-tgt" }, QP = { class: "wf-automap-hint" }, e3 = { class: "wf-automap-tracelbl" }, t3 = {
  key: 0,
  class: "wf-automap-why"
}, n3 = 2600, o3 = 1200, i3 = /* @__PURE__ */ we({
  __name: "AutoMapReveal",
  props: {
    entry: {}
  },
  emits: ["open", "dismiss", "measure"],
  setup(e, { emit: t }) {
    const n = e, i = t, { overlayEl: o } = Dp((p) => i("measure", p)), r = j("reveal"), a = j(!1);
    let s = null;
    const l = W(() => n.entry.result.fields), c = W(() => mP(l.value.length));
    function u(p) {
      s && clearTimeout(s), s = setTimeout(() => {
        r.value = "trace";
      }, p);
    }
    function d() {
      s && (clearTimeout(s), s = null);
    }
    function h() {
      r.value === "reveal" && u(o3);
    }
    return Ue(() => u(n3)), Qe(() => {
      s && clearTimeout(s);
    }), (p, v) => ($(), R("div", {
      ref_key: "overlayEl",
      ref: o,
      class: "wf-automap",
      onPointerdown: v[7] || (v[7] = Fe(() => {
      }, ["stop"]))
    }, [
      r.value === "reveal" ? ($(), se(f(pe), {
        key: 0,
        class: "wf-automap-card",
        severity: "secondary",
        outlined: "",
        "aria-label": `${f(sd)}. ${c.value}. Open mapping`,
        onMouseenter: d,
        onMouseleave: h,
        onClick: v[0] || (v[0] = (g) => i("open", e.entry.id))
      }, {
        default: ie(() => [
          x("span", YP, [
            z(f(ae), {
              icon: "tabler:wand",
              "aria-hidden": "true"
            }),
            x("span", GP, Z(f(sd)), 1),
            x("span", jP, Z(c.value), 1)
          ]),
          x("span", XP, [
            ($(!0), R(de, null, Oe(l.value, (g) => ($(), R("span", {
              key: g.key,
              class: "wf-automap-pair",
              title: g.why
            }, [
              x("code", ZP, Z(g.sourceName), 1),
              z(f(ae), {
                icon: "tabler:arrow-right",
                "aria-hidden": "true"
              }),
              x("code", JP, Z(g.title), 1)
            ], 8, KP))), 128))
          ]),
          x("span", QP, Z(f(vP)), 1)
        ]),
        _: 1
      }, 8, ["aria-label"])) : ($(), R("div", {
        key: 1,
        class: Ie(["wf-automap-trace", { "is-open": a.value }]),
        onMouseenter: v[3] || (v[3] = (g) => a.value = !0),
        onMouseleave: v[4] || (v[4] = (g) => a.value = !1),
        onFocusin: v[5] || (v[5] = (g) => a.value = !0),
        onFocusout: v[6] || (v[6] = (g) => a.value = !1)
      }, [
        z(f(pe), {
          class: "wf-automap-tracebtn",
          text: "",
          rounded: "",
          severity: "secondary",
          "aria-label": f(Ba),
          title: f(Ba),
          onClick: v[1] || (v[1] = (g) => i("open", e.entry.id))
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:wand",
              "aria-hidden": "true"
            }),
            x("span", e3, Z(f(Ba)), 1)
          ]),
          _: 1
        }, 8, ["aria-label", "title"]),
        z(f(pe), {
          class: "wf-automap-tracex",
          text: "",
          rounded: "",
          severity: "secondary",
          "aria-label": "Dismiss automatic mapping explanation",
          onClick: v[2] || (v[2] = (g) => i("dismiss", e.entry.id))
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }),
        a.value ? ($(), R("div", t3, [
          ($(!0), R(de, null, Oe(l.value, (g) => ($(), R("p", {
            key: g.key,
            class: "wf-automap-whyline"
          }, Z(g.why), 1))), 128))
        ])) : Q("", !0)
      ], 34))
    ], 544));
  }
}), r3 = { class: "wf-top" }, a3 = { class: "wf-top-count" }, s3 = { class: "wf-toolbar-menu-wrap" }, l3 = ["disabled"], u3 = ["aria-pressed"], c3 = { class: "wf-toolbar-menu-wrap" }, d3 = ["disabled"], f3 = /* @__PURE__ */ we({
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
    const n = e, i = W(() => ep(n.publishedVersion)), o = W(() => i.value ? "Choose when this Workflow runs" : hs), r = W(() => i.value ? "Add trigger" : `Add trigger unavailable. ${hs}.`), a = t;
    function s(E) {
      return E.currentTarget instanceof HTMLElement ? E.currentTarget : null;
    }
    function l() {
      const E = j(!1), w = j(null), b = j(null);
      async function S() {
        E.value = !E.value, E.value && (await ze(), b.value?.querySelector("button:not(:disabled)")?.focus());
      }
      function N(T = !1) {
        E.value && (E.value = !1, T && ze(() => w.value?.focus()));
      }
      async function V(T) {
        E.value = !1, await ze(), w.value?.focus(), T();
      }
      function A(T) {
        if (T.key === "Escape") {
          T.preventDefault(), N(!0);
          return;
        }
        if (T.key !== "ArrowDown" && T.key !== "ArrowUp" && T.key !== "Home" && T.key !== "End") return;
        const L = Array.from(b.value?.querySelectorAll("button:not(:disabled)") || []);
        if (!L.length) return;
        T.preventDefault();
        const M = L.indexOf(document.activeElement), k = T.key === "Home" ? 0 : T.key === "End" ? L.length - 1 : T.key === "ArrowDown" ? (M + 1 + L.length) % L.length : (M - 1 + L.length) % L.length;
        L[k].focus();
      }
      return { open: E, button: w, menu: b, toggle: S, close: N, choose: V, onKeydown: A };
    }
    const c = l(), u = l();
    async function d() {
      u.close(), await c.toggle();
    }
    async function h() {
      c.close(), await u.toggle();
    }
    function p(E) {
      if (E instanceof HTMLElement) return E;
      const w = E?.$el;
      return w instanceof HTMLElement ? w : null;
    }
    function v(E) {
      c.button.value = p(E);
    }
    function g(E) {
      c.menu.value = p(E);
    }
    function m(E) {
      u.button.value = p(E);
    }
    function _(E) {
      u.menu.value = p(E);
    }
    return (E, w) => ($(), R("header", r3, [
      z(f(pe), {
        text: "",
        rounded: "",
        title: "Back to Workflows",
        "aria-label": "Back to Workflows",
        onClick: w[0] || (w[0] = (b) => a("back"))
      }, {
        default: ie(() => [
          z(f(ae), {
            icon: "tabler:arrow-left",
            "aria-hidden": "true"
          })
        ]),
        _: 1
      }),
      x("span", a3, Z(e.countLabel), 1),
      w[31] || (w[31] = x("div", { class: "wf-top-spacer" }, null, -1)),
      z(f(Pg), { class: "wf-edit-actions" }, {
        default: ie(() => [
          z(f(pe), {
            severity: "secondary",
            outlined: "",
            disabled: !e.canUndo || e.viewingRun,
            title: "Undo (⌘Z)",
            "aria-label": "Undo",
            onClick: w[1] || (w[1] = (b) => a("undo"))
          }, {
            default: ie(() => [
              z(f(ae), {
                icon: "tabler:arrow-back-up",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }, 8, ["disabled"]),
          z(f(pe), {
            severity: "secondary",
            outlined: "",
            disabled: !e.canRedo || e.viewingRun,
            title: "Redo (⌘⇧Z)",
            "aria-label": "Redo",
            onClick: w[2] || (w[2] = (b) => a("redo"))
          }, {
            default: ie(() => [
              z(f(ae), {
                icon: "tabler:arrow-forward-up",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }, 8, ["disabled"]),
          z(f(pe), {
            severity: "secondary",
            outlined: "",
            disabled: e.viewingRun,
            title: "Edit connections",
            "aria-label": "Edit connections",
            onClick: w[3] || (w[3] = (b) => a("edit-connections", s(b)))
          }, {
            default: ie(() => [
              z(f(ae), {
                icon: "tabler:arrows-join-2",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }, 8, ["disabled"])
        ]),
        _: 1
      }),
      w[32] || (w[32] = x("span", { class: "wf-vsep" }, null, -1)),
      x("div", s3, [
        z(f(pe), {
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
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:layout-grid",
              "aria-hidden": "true"
            }),
            w[20] || (w[20] = x("span", null, "View", -1))
          ]),
          _: 1
        }, 8, ["outlined", "aria-expanded"]),
        f(c).open.value ? ($(), R("div", {
          key: 0,
          class: "wf-toolbar-menu-backdrop",
          onClick: w[4] || (w[4] = (b) => f(c).close())
        })) : Q("", !0),
        f(c).open.value ? ($(), R("div", {
          key: 1,
          ref: g,
          class: "wf-toolbar-menu",
          role: "menu",
          "aria-label": "View controls",
          onKeydown: w[9] || (w[9] = //@ts-ignore
          (...b) => f(c).onKeydown && f(c).onKeydown(...b))
        }, [
          x("button", {
            role: "menuitem",
            onClick: w[5] || (w[5] = (b) => f(c).choose(() => a("fit")))
          }, [
            z(f(ae), {
              icon: "tabler:maximize",
              "aria-hidden": "true"
            }),
            w[21] || (w[21] = he("Fit view", -1))
          ]),
          x("button", {
            role: "menuitem",
            disabled: e.viewingRun,
            onClick: w[6] || (w[6] = (b) => f(c).choose(() => a("auto-layout")))
          }, [
            z(f(ae), {
              icon: "tabler:layout-distribute-vertical",
              "aria-hidden": "true"
            }),
            w[22] || (w[22] = he("Auto layout", -1))
          ], 8, l3),
          x("button", {
            role: "menuitem",
            onClick: w[7] || (w[7] = (b) => f(c).choose(() => a("toggle-direction")))
          }, [
            z(f(ae), {
              icon: e.layoutDir === "TB" ? "tabler:arrow-right" : "tabler:arrow-down",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            he("Lay out " + Z(e.layoutDir === "TB" ? "left to right" : "top to bottom"), 1)
          ]),
          w[23] || (w[23] = x("span", {
            class: "wf-toolbar-menu-sep",
            role: "separator"
          }, null, -1)),
          x("button", {
            role: "menuitem",
            "data-testid": "palette-toggle",
            "aria-pressed": e.paletteOpen,
            onClick: w[8] || (w[8] = (b) => f(c).choose(() => a("toggle-palette")))
          }, [
            z(f(ae), {
              icon: e.paletteOpen ? "tabler:layout-sidebar-left-collapse" : "tabler:layout-sidebar-left-expand",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            he(Z(e.paletteOpen ? "Hide steps" : "Show steps"), 1)
          ], 8, u3)
        ], 544)) : Q("", !0)
      ]),
      z(f(pe), {
        class: "wf-toolbar-compactable",
        severity: "secondary",
        outlined: !(e.runsOpen || e.viewingRun),
        title: "Past runs",
        "aria-label": "Past runs",
        onClick: w[10] || (w[10] = (b) => a("toggle-runs", s(b)))
      }, {
        default: ie(() => [
          z(f(ae), {
            icon: "tabler:history",
            "aria-hidden": "true"
          }),
          w[24] || (w[24] = x("span", null, "Past runs", -1))
        ]),
        _: 1
      }, 8, ["outlined"]),
      z(f(pe), {
        class: "wf-toolbar-compactable",
        severity: "secondary",
        outlined: !e.historyOpen,
        title: "Version history",
        "aria-label": "Versions",
        onClick: w[11] || (w[11] = (b) => a("toggle-history", s(b)))
      }, {
        default: ie(() => [
          z(f(ae), {
            icon: "tabler:versions",
            "aria-hidden": "true"
          }),
          w[25] || (w[25] = x("span", null, "Versions", -1))
        ]),
        _: 1
      }, 8, ["outlined"]),
      w[33] || (w[33] = x("span", { class: "wf-vsep" }, null, -1)),
      z(f(pe), {
        class: "wf-toolbar-compactable",
        severity: "secondary",
        outlined: "",
        disabled: !i.value,
        title: o.value,
        "aria-label": r.value,
        onClick: w[12] || (w[12] = (b) => a("add-trigger", s(b)))
      }, {
        default: ie(() => [
          z(f(ae), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          }),
          w[26] || (w[26] = x("span", null, "Add trigger", -1))
        ]),
        _: 1
      }, 8, ["disabled", "title", "aria-label"]),
      w[34] || (w[34] = x("div", { class: "wf-top-spacer" }, null, -1)),
      z(f(pe), {
        severity: e.runActive ? "danger" : void 0,
        disabled: e.simBusy,
        loading: e.simBusy,
        title: e.runActive ? "Stop the running workflow" : "Run with an input",
        onClick: w[13] || (w[13] = (b) => a("run", s(b)))
      }, {
        default: ie(() => [
          e.simBusy ? Q("", !0) : ($(), se(f(ae), {
            key: 0,
            icon: e.runActive ? "tabler:player-stop" : "tabler:player-play",
            "aria-hidden": "true"
          }, null, 8, ["icon"])),
          x("span", null, Z(e.runActive ? "Stop" : "Run"), 1)
        ]),
        _: 1
      }, 8, ["severity", "disabled", "loading", "title"]),
      z(f(pe), {
        severity: "secondary",
        outlined: "",
        "aria-label": "Run published",
        disabled: !e.publishedVersion || e.viewingRun,
        title: "Run a published version with a selected account",
        onClick: w[14] || (w[14] = (b) => a("run-published", s(b)))
      }, {
        default: ie(() => [...w[27] || (w[27] = [
          he("Run published", -1)
        ])]),
        _: 1
      }, 8, ["disabled"]),
      x("div", c3, [
        z(f(pe), {
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
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:dots",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["severity", "aria-expanded"]),
        f(u).open.value ? ($(), R("div", {
          key: 0,
          class: "wf-toolbar-menu-backdrop",
          onClick: w[15] || (w[15] = (b) => f(u).close())
        })) : Q("", !0),
        f(u).open.value ? ($(), R("div", {
          key: 1,
          ref: _,
          class: "wf-toolbar-menu",
          role: "menu",
          "aria-label": "More workflow actions",
          onKeydown: w[18] || (w[18] = //@ts-ignore
          (...b) => f(u).onKeydown && f(u).onKeydown(...b))
        }, [
          x("button", {
            role: "menuitem",
            onClick: w[16] || (w[16] = (b) => f(u).choose(() => a("share", f(u).button.value)))
          }, [
            z(f(ae), {
              icon: "tabler:share",
              "aria-hidden": "true"
            }),
            w[28] || (w[28] = he("Share", -1))
          ]),
          x("button", {
            role: "menuitem",
            disabled: !e.publishedVersion || e.exportBusy,
            onClick: w[17] || (w[17] = (b) => f(u).choose(() => a("export")))
          }, [
            z(f(ae), {
              icon: "tabler:download",
              "aria-hidden": "true"
            }),
            w[29] || (w[29] = he("Export", -1))
          ], 8, d3)
        ], 544)) : Q("", !0)
      ]),
      z(f(pe), {
        severity: "secondary",
        outlined: "",
        disabled: e.publishBusy,
        loading: e.publishBusy,
        title: "Publish this workflow",
        onClick: w[19] || (w[19] = (b) => a("publish"))
      }, {
        default: ie(() => [
          e.publishBusy ? Q("", !0) : ($(), se(f(ae), {
            key: 0,
            icon: "tabler:rocket",
            "aria-hidden": "true"
          })),
          w[30] || (w[30] = x("span", null, "Publish", -1))
        ]),
        _: 1
      }, 8, ["disabled", "loading"])
    ]));
  }
}), h3 = { class: "kx-modal-head-icon" }, p3 = { class: "kx-modal-body" }, v3 = {
  class: "wf-connections-form",
  "aria-describedby": "wf-connection-help"
}, m3 = { class: "wf-connections-field" }, g3 = {
  key: 0,
  id: "wf-connection-source-error",
  role: "alert"
}, y3 = { class: "wf-connections-field" }, w3 = {
  key: 0,
  id: "wf-connection-target-error",
  role: "alert"
}, b3 = {
  class: "wf-connections-existing",
  "aria-labelledby": "wf-connections-existing-title"
}, _3 = { key: 1 }, k3 = /* @__PURE__ */ we({
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
    }, r = j(null), a = j(null), s = j(!1), l = W(() => n.sources.find((g) => g.key === r.value)), c = W(() => n.targets.filter((g) => g.nodeId !== l.value?.nodeId)), u = W(() => s.value && !l.value), d = W(() => s.value && !a.value);
    ke(r, () => {
      c.value.some((g) => g.nodeId === a.value) || (a.value = null);
    });
    function h(g) {
      g || i("close");
    }
    function p(g) {
      g.composedPath().find((_) => _ instanceof HTMLElement && _.getAttribute("role") === "combobox")?.getAttribute("aria-expanded") !== "true" && i("close");
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
    return (g, m) => ($(), se(f(Jt), {
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
      header: ie(() => [
        x("span", h3, [
          z(f(ae), {
            icon: "tabler:arrows-join-2",
            "aria-hidden": "true"
          })
        ]),
        m[3] || (m[3] = x("div", { class: "kx-modal-head-text" }, [
          x("div", { class: "kx-modal-head-title" }, "Edit connections"),
          x("div", {
            id: "wf-connection-help",
            class: "kx-modal-head-sub"
          }, " Create a connection without dragging on the canvas, or remove an existing connection below. ")
        ], -1))
      ]),
      footer: ie(() => [
        z(f(pe), {
          severity: "secondary",
          text: "",
          onClick: m[2] || (m[2] = (_) => i("close"))
        }, {
          default: ie(() => [...m[8] || (m[8] = [
            he("Close", -1)
          ])]),
          _: 1
        }),
        z(f(pe), {
          disabled: e.disabled,
          onClick: v
        }, {
          default: ie(() => [...m[9] || (m[9] = [
            he("Create connection", -1)
          ])]),
          _: 1
        }, 8, ["disabled"])
      ]),
      default: ie(() => [
        x("div", p3, [
          x("div", v3, [
            x("div", m3, [
              m[4] || (m[4] = x("label", { for: "wf-connection-source" }, [
                he("From "),
                x("span", { "aria-hidden": "true" }, "*")
              ], -1)),
              z(f(St), {
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
              u.value ? ($(), R("small", g3, "Choose a source step and output.")) : Q("", !0)
            ]),
            x("div", y3, [
              m[5] || (m[5] = x("label", { for: "wf-connection-target" }, [
                he("To "),
                x("span", { "aria-hidden": "true" }, "*")
              ], -1)),
              z(f(St), {
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
              d.value ? ($(), R("small", w3, "Choose a destination step.")) : Q("", !0)
            ])
          ]),
          x("section", b3, [
            m[7] || (m[7] = x("h3", { id: "wf-connections-existing-title" }, "Existing connections", -1)),
            e.edges.length ? ($(), R("ul", _3, [
              ($(!0), R(de, null, Oe(e.edges, (_) => ($(), R("li", {
                key: _.id
              }, [
                x("span", null, Z(_.label), 1),
                z(f(pe), {
                  text: "",
                  rounded: "",
                  severity: "danger",
                  disabled: e.disabled,
                  "aria-label": `Delete ${_.label}`,
                  title: "Delete connection",
                  onClick: (E) => i("remove", _.id)
                }, {
                  default: ie(() => [
                    z(f(ae), {
                      icon: "tabler:trash",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }, 8, ["disabled", "aria-label", "onClick"])
              ]))), 128))
            ])) : ($(), se(f(Be), {
              key: 0,
              severity: "info",
              closable: !1
            }, {
              default: ie(() => [...m[6] || (m[6] = [
                he("There are no connections yet.", -1)
              ])]),
              _: 1
            }))
          ])
        ])
      ]),
      _: 1
    }));
  }
}), E3 = { class: "wf-drop-search" }, x3 = {
  class: "wf-drop-list",
  role: "listbox"
}, $3 = ["aria-selected", "onMouseenter", "onClick"], S3 = { class: "wf-drop-title" }, C3 = { class: "wf-drop-cat" }, N3 = {
  key: 0,
  class: "wf-drop-empty"
}, I3 = /* @__PURE__ */ we({
  __name: "ConnectDropPicker",
  props: {
    items: {},
    x: {},
    y: {}
  },
  emits: ["pick", "close"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = j(""), r = j(0), a = j(null), s = W(() => {
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
      ze(() => a.value?.focus());
    }), (d, h) => ($(), R(de, null, [
      x("div", {
        class: "wf-ctx-backdrop",
        onClick: h[0] || (h[0] = (p) => i("close")),
        onContextmenu: h[1] || (h[1] = Fe((p) => i("close"), ["prevent"]))
      }, null, 32),
      x("div", {
        class: "wf-drop-picker",
        role: "dialog",
        "aria-label": "Add a connected step",
        style: He({ left: e.x + "px", top: e.y + "px" })
      }, [
        x("div", E3, [
          z(f(ae), {
            icon: "tabler:search",
            "aria-hidden": "true"
          }),
          bd(x("input", {
            ref_key: "inputEl",
            ref: a,
            "onUpdate:modelValue": h[2] || (h[2] = (p) => o.value = p),
            placeholder: "Add a step…",
            onKeydown: u
          }, null, 544), [
            [Ym, o.value]
          ])
        ]),
        x("ul", x3, [
          ($(!0), R(de, null, Oe(s.value, (p, v) => ($(), R("li", {
            key: p.paletteId
          }, [
            x("button", {
              class: Ie(["wf-drop-item", { on: v === r.value }]),
              role: "option",
              "aria-selected": v === r.value,
              onMouseenter: (g) => r.value = v,
              onClick: (g) => i("pick", p)
            }, [
              z(f(ae), {
                icon: p.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              x("span", S3, Z(p.title), 1),
              x("span", C3, Z(p.category), 1)
            ], 42, $3)
          ]))), 128)),
          s.value.length ? Q("", !0) : ($(), R("li", N3, "No steps match."))
        ])
      ], 4)
    ], 64));
  }
}), A3 = { class: "wf-run-notice-text" }, T3 = {
  key: 0,
  class: "wf-err-code"
}, M3 = { class: "wf-body" }, O3 = {
  key: 0,
  class: "wf-empty-canvas"
}, R3 = {
  key: 1,
  class: "wf-run-fail-strip",
  role: "status"
}, D3 = { class: "wf-run-fail-strip-txt" }, P3 = { key: 0 }, L3 = {
  key: 4,
  class: "wf-canvas-loading"
}, z3 = /* @__PURE__ */ we({
  __name: "WorkflowCanvasView",
  props: {
    workflowId: {},
    model: {}
  },
  emits: ["back", "open-workflow"],
  setup(e, { emit: t }) {
    const n = e, i = n.workflowId, o = _d(n.model), r = Ne(o, "rootEl"), a = Ne(o, "canvasEl"), s = Ne(o, "shareHost"), l = t;
    return (c, u) => ($(), R("div", {
      ref_key: "rootEl",
      ref: r,
      class: Ie(["wf-canvas-root", { "wf--run": f(o).runState.active || !!f(o).viewingRun }]),
      tabindex: "0",
      onKeydown: u[21] || (u[21] = //@ts-ignore
      (...d) => f(o).onKeyDown && f(o).onKeyDown(...d))
    }, [
      z(f(zd), { group: "node-delete" }),
      z(f3, {
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
      f(o).publishedRunOpen ? ($(), se(SO, {
        key: 0,
        "workflow-id": f(i),
        "published-version": f(o).publishedVersion,
        onClose: f(o).closePublishedRun
      }, null, 8, ["workflow-id", "published-version", "onClose"])) : Q("", !0),
      f(o).connectionsOpen ? ($(), se(k3, {
        key: 1,
        sources: f(o).connectionSources,
        targets: f(o).connectionTargets,
        edges: f(o).connectionEdges,
        "target-handle": f(o).connectionTargetHandle,
        disabled: !!f(o).viewingRun,
        onClose: f(o).closeConnections,
        onCreate: f(o).createConnection,
        onRemove: f(o).removeEdge
      }, null, 8, ["sources", "targets", "edges", "target-handle", "disabled", "onClose", "onCreate", "onRemove"])) : Q("", !0),
      f(o).runsOpen ? ($(), se(qM, {
        key: 2,
        rows: f(o).runRows,
        loading: f(o).runsLoading,
        error: f(o).runsError,
        onSelect: f(o).viewRun,
        onClose: f(o).closeRuns
      }, null, 8, ["rows", "loading", "error", "onSelect", "onClose"])) : Q("", !0),
      f(o).simOpen ? ($(), se(pP, {
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
      }, null, 8, ["schema", "model-value", "reset-key", "has-fields", "valid", "error-message", "can-run", "onClose", "onRun", "onUpdate:modelValue", "onValid"])) : Q("", !0),
      f(o).historyOpen ? ($(), se(_O, {
        key: 4,
        "workflow-id": f(i),
        "definition-edit-seq": f(o).definitionEditSeq,
        onClose: f(o).closeHistory,
        onRestore: u[4] || (u[4] = (d) => l("open-workflow", d))
      }, null, 8, ["workflow-id", "definition-edit-seq", "onClose"])) : Q("", !0),
      f(o).addTriggerOpen ? ($(), se(AO, {
        key: 5,
        "workflow-id": f(i),
        "published-version": f(o).publishedVersion,
        onClose: f(o).closeAddTrigger
      }, null, 8, ["workflow-id", "published-version", "onClose"])) : Q("", !0),
      f(o).shareOpen ? ($(), R("div", {
        key: 6,
        ref_key: "shareHost",
        ref: s
      }, null, 512)) : Q("", !0),
      f(o).dropPicker ? ($(), se(I3, {
        key: 7,
        items: f(o).catalog,
        x: f(o).dropPicker.x,
        y: f(o).dropPicker.y,
        onPick: f(o).dropPickerPick,
        onClose: f(o).closeDropPicker
      }, null, 8, ["items", "x", "y", "onPick", "onClose"])) : Q("", !0),
      f(o).paneMenu ? ($(), R(de, { key: 8 }, [
        x("div", {
          class: "wf-ctx-backdrop",
          onClick: u[5] || (u[5] = //@ts-ignore
          (...d) => f(o).closePaneMenu && f(o).closePaneMenu(...d)),
          onContextmenu: u[6] || (u[6] = Fe(
            //@ts-ignore
            (...d) => f(o).closePaneMenu && f(o).closePaneMenu(...d),
            ["prevent"]
          ))
        }, null, 32),
        x("div", {
          class: "wf-ctx",
          role: "menu",
          style: He({ left: f(o).paneMenu.x + "px", top: f(o).paneMenu.y + "px" })
        }, [
          x("button", {
            class: "wf-ctx-item",
            role: "menuitem",
            onClick: u[7] || (u[7] = //@ts-ignore
            (...d) => f(o).menuAddStep && f(o).menuAddStep(...d))
          }, [
            z(f(ae), {
              icon: "tabler:search",
              "aria-hidden": "true"
            }),
            u[22] || (u[22] = he(" Add step…", -1))
          ]),
          x("button", {
            class: "wf-ctx-item",
            role: "menuitem",
            onClick: u[8] || (u[8] = //@ts-ignore
            (...d) => f(o).menuAddNote && f(o).menuAddNote(...d))
          }, [
            z(f(ae), {
              icon: "tabler:note",
              "aria-hidden": "true"
            }),
            u[23] || (u[23] = he(" Add note", -1))
          ]),
          x("button", {
            class: "wf-ctx-item",
            role: "menuitem",
            onClick: u[9] || (u[9] = //@ts-ignore
            (...d) => f(o).menuAddFrame && f(o).menuAddFrame(...d))
          }, [
            z(f(ae), {
              icon: "tabler:frame",
              "aria-hidden": "true"
            }),
            u[24] || (u[24] = he(" Add frame", -1))
          ])
        ], 4)
      ], 64)) : Q("", !0),
      z(f(Tg), { position: "top-center" }),
      f(o).viewingRun ? ($(), se(f(Be), {
        key: 9,
        class: "wf-banner wf-banner--run",
        pt: { content: { class: "wf-run-notice-content" }, text: { class: "wf-run-notice-body" } },
        severity: "info",
        closable: !1
      }, {
        default: ie(() => [
          z(f(gt), {
            class: "wf-run-version-tag",
            severity: f(Qn)(f(o).viewingRun.flow_ref?.version ?? 0).kind === "published" ? "secondary" : "warn",
            value: f(Qn)(f(o).viewingRun.flow_ref?.version ?? 0).label,
            title: f(Qn)(f(o).viewingRun.flow_ref?.version ?? 0).title
          }, null, 8, ["severity", "value", "title"]),
          x("span", A3, "Viewing run " + Z(f(Ts)(f(o).viewingRun.run_id)) + " · " + Z(f(ro)(f(ao)(f(o).viewingRun))) + " · started " + Z(f(Qt)(f(o).viewingRun.started_at)) + " — read-only.", 1),
          z(f(pe), {
            class: "wf-run-notice-action",
            onClick: f(o).stopRun
          }, {
            default: ie(() => [...u[25] || (u[25] = [
              he("Back to editing", -1)
            ])]),
            _: 1
          }, 8, ["onClick"])
        ]),
        _: 1
      })) : Q("", !0),
      f(o).error ? ($(), se(f(Be), {
        key: 10,
        class: "wf-banner wf-banner--error",
        severity: "error",
        onClose: u[10] || (u[10] = (d) => f(o).error = "")
      }, {
        default: ie(() => [
          x("span", null, Z(f(o).errorView.message), 1),
          f(o).errorView.code ? ($(), R("span", T3, Z(f(o).errorView.code), 1)) : Q("", !0)
        ]),
        _: 1
      })) : Q("", !0),
      x("div", M3, [
        f(o).paletteOpen && !f(o).viewingRun ? ($(), se(JT, {
          key: 0,
          items: f(o).catalog,
          loading: f(o).catalogLoading,
          errors: f(o).catalogErrors,
          onPlace: f(o).placeItem,
          onPlaceNote: u[11] || (u[11] = () => f(o).placeNote()),
          onPlaceFrame: u[12] || (u[12] = () => f(o).placeFrame())
        }, null, 8, ["items", "loading", "errors", "onPlace"])) : Q("", !0),
        x("main", {
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
          z(f(Zf), {
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
            default: ie(() => [
              z(f(op), {
                "pattern-color": "var(--wf-dot)",
                gap: 20,
                size: 1.2
              }),
              z(f(o2), {
                position: "bottom-left",
                "show-interactive": !1
              }),
              z(f(VT), {
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
          f(o).isEmpty ? ($(), R("div", O3, [...u[26] || (u[26] = [
            Gm('<div class="wf-empty-flow" aria-hidden="true"><span class="wf-gnode wf-gnode--start"></span><span class="wf-gwire"></span><span class="wf-gnode wf-gnode--block"></span><span class="wf-gwire"></span><span class="wf-gnode wf-gnode--block"></span></div><p class="wf-empty-title">Add your first step</p><p class="wf-empty-sub">Drag a Start or Block from the left — or press ⌘K to search.</p>', 3)
          ])])) : Q("", !0),
          f(o).viewingRun && f(o).failedNode ? ($(), R("div", R3, [
            z(f(ae), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            }),
            x("span", D3, [
              x("strong", null, Z(f(o).failedNodeTitle), 1),
              u[27] || (u[27] = he(" failed", -1)),
              f(o).failedReason ? ($(), R("span", P3, ": " + Z(f(o).failedReason), 1)) : Q("", !0),
              u[28] || (u[28] = he(".", -1))
            ]),
            z(f(pe), {
              severity: "secondary",
              outlined: "",
              onClick: f(o).openFailedDetails
            }, {
              default: ie(() => [
                z(f(ae), {
                  icon: "tabler:list-search",
                  "aria-hidden": "true"
                }),
                u[29] || (u[29] = x("span", null, "View details", -1))
              ]),
              _: 1
            }, 8, ["onClick"])
          ])) : Q("", !0),
          f(o).connectStatus && f(o).connectStatus !== "neutral" && f(o).connectHintPosition ? ($(), R("div", {
            key: 2,
            class: Ie(["wf-connect-hint", `is-${f(o).connectStatus}`]),
            style: He({ left: f(o).connectHintPosition.left + "px", top: f(o).connectHintPosition.top + "px" })
          }, [
            z(f(ae), {
              icon: f(o).connectStatus === "ok" ? "tabler:plug-connected" : f(o).connectStatus === "warn" ? "tabler:wand" : "tabler:plug-connected-x",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            x("span", null, Z(f(o).connectStatus === "ok" ? "Compatible" : f(o).connectStatus === "warn" ? f(o).connectMessage || "Needs a mapping" : f(o).connectMessage || "Incompatible"), 1)
          ], 6)) : Q("", !0),
          ($(!0), R(de, null, Oe(f(o).autoMapAnchored, (d) => ($(), se(i3, {
            key: d.id,
            entry: d.entry,
            style: He({ left: d.left + "px", top: d.top + "px", visibility: d.placed ? "visible" : "hidden", "--wf-overlay-max-height": d.maxHeight + "px" }),
            onMeasure: (h) => f(o).measureAuto(d.id, h),
            onOpen: f(o).openAutoMapped,
            onDismiss: f(o).dismissAutoMapped
          }, null, 8, ["entry", "style", "onMeasure", "onOpen", "onDismiss"]))), 128)),
          f(o).pendingEdge && f(o).pendingAnchor ? ($(), se(WP, {
            key: f(o).pendingEdge.id,
            "workflow-id": f(i),
            edge: f(o).pendingEdge,
            "available-steps": f(o).availableSteps,
            style: He({ left: f(o).pendingAnchor.left + "px", top: f(o).pendingAnchor.top + "px", visibility: f(o).pendingOverlaySize ? "visible" : "hidden", "--wf-overlay-max-height": f(o).pendingAnchor.maxHeight + "px" }),
            onMeasure: f(o).measurePending,
            onAccept: f(o).acceptPending,
            onSuggestNode: f(o).showSuggestedNode,
            onOpenMapper: f(o).openPendingMapper,
            onDismiss: f(o).dismissPending
          }, null, 8, ["workflow-id", "edge", "available-steps", "style", "onMeasure", "onAccept", "onSuggestNode", "onOpenMapper", "onDismiss"])) : Q("", !0),
          f(o).loading ? ($(), R("div", L3, [
            z(f(yt), {
              class: "wf-status-spinner",
              "stroke-width": "4",
              "aria-label": "Loading workflow canvas"
            })
          ])) : Q("", !0)
        ], 544),
        !f(o).panelOpen && (f(o).hasSelection || f(o).viewingRun) ? ($(), se(f(pe), {
          key: 1,
          class: "wf-panel-rail",
          text: "",
          rounded: "",
          severity: "secondary",
          title: "Show inspector",
          "aria-label": "Show inspector",
          onClick: f(o).openInspector
        }, {
          default: ie(() => [
            z(f(ae), {
              icon: "tabler:chevron-left",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["onClick"])) : Q("", !0),
        f(o).narrowEditor ? ($(), se(f(Ag), {
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
          default: ie(() => [
            f(o).viewingRun ? ($(), se(od, {
              key: 0,
              "workflow-id": f(i),
              run: f(o).viewingRun,
              node: f(o).selectedNode,
              "node-status": f(o).selectedRunStatus,
              "node-headers": f(o).viewingNodeHeaders,
              onClose: f(o).clearSelection,
              onExitRun: f(o).stopRun,
              onRerun: u[18] || (u[18] = (d) => f(o).rerunSameInput(f(o).viewingRun))
            }, null, 8, ["workflow-id", "run", "node", "node-status", "node-headers", "onClose", "onExitRun"])) : f(o).hasSelection ? ($(), se(ad, {
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
            }, null, 8, ["workflow-id", "node", "edge", "note", "catalog", "edge-upstream-schema", "edge-downstream-schema", "edge-source-title", "edge-target-title", "node-upstream-schema", "combine-branch-conflict", "onUpdateNode", "onRemoveNode", "onUpdateEdge", "onRemoveEdge", "onUpdateNote", "onRemoveNote", "onClose"])) : Q("", !0)
          ]),
          _: 1
        }, 8, ["visible"])) : ($(), R(de, { key: 3 }, [
          f(o).panelOpen && f(o).viewingRun ? ($(), se(od, {
            key: 0,
            "workflow-id": f(i),
            run: f(o).viewingRun,
            node: f(o).selectedNode,
            "node-status": f(o).selectedRunStatus,
            "node-headers": f(o).viewingNodeHeaders,
            onClose: f(o).clearSelection,
            onExitRun: f(o).stopRun,
            onRerun: u[20] || (u[20] = (d) => f(o).rerunSameInput(f(o).viewingRun))
          }, null, 8, ["workflow-id", "run", "node", "node-status", "node-headers", "onClose", "onExitRun"])) : f(o).panelOpen && f(o).hasSelection ? ($(), se(ad, {
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
          }, null, 8, ["workflow-id", "node", "edge", "note", "catalog", "edge-upstream-schema", "edge-downstream-schema", "edge-source-title", "edge-target-title", "node-upstream-schema", "combine-branch-conflict", "onUpdateNode", "onRemoveNode", "onUpdateEdge", "onRemoveEdge", "onUpdateNote", "onRemoveNote", "onClose"])) : Q("", !0)
        ], 64))
      ])
    ], 34));
  }
}), V3 = /* @__PURE__ */ we({
  __name: "WorkflowCanvas",
  props: {
    workflowId: {}
  },
  emits: ["back", "open-workflow", "published"],
  setup(e, { emit: t }) {
    const n = e, i = t, o = new nS(), r = j(0), a = j(!0), s = j(""), l = nt(null), c = nt(null);
    let u = 0;
    function d(xe = null) {
      u += 1;
      const Ce = wn.value?.getRootNode();
      l.value = Ce?.activeElement instanceof HTMLElement ? Ce.activeElement : null, c.value = xe ?? wn.value?.querySelector(
        'button[aria-label="More workflow actions"]'
      ) ?? null;
    }
    async function h() {
      const xe = u, Ce = l.value, Le = c.value ?? wn.value?.querySelector(
        'button[aria-label="More workflow actions"]'
      ) ?? null;
      await ze();
      const qt = wn.value?.getRootNode();
      await Fd({
        root: qt ?? null,
        target: Ce,
        fallback: Le,
        isCurrent: () => xe === u
      }) && (u += 1, l.value = null, c.value = null);
    }
    const p = nt([]), v = nt([]), g = j(/* @__PURE__ */ new Map()), m = W(() => (r.value, o.doc.direction)), _ = j([]), E = j([]), w = j(!0), b = W(() => {
      const xe = /* @__PURE__ */ new Map();
      for (const Ce of _.value) {
        const Le = String(Ce.kind);
        Ce.ref || Le === "start" || Le === "finish" || Le === "error" || xe.has(Le) || xe.set(Le, Ce.title);
      }
      return [...xe].map(([Ce, Le]) => ({ kind: Ce, title: Le }));
    }), S = j(Id()), N = j(""), V = $g(), A = Dd();
    ke(N, (xe) => {
      xe && (V.add({ severity: "success", summary: "Workflow updated", detail: xe, life: 5e3 }), N.value = "");
    });
    const T = j(null), L = j([]), {
      panelOpen: M,
      paletteOpen: k,
      historyOpen: B,
      addTriggerOpen: y,
      shareOpen: I,
      shareHost: C
    } = DC(), {
      selectedNode: H,
      selectedEdge: F,
      selectedNote: q,
      hasSelection: U,
      select: ne,
      clearSelection: ue,
      onNodeClick: G,
      onEdgeClick: J,
      onPaneClick: K,
      updateNode: X,
      updateEdge: oe,
      updateNote: le,
      removeSelectedNode: fe,
      removeSelectedEdge: _e,
      removeEdge: $e,
      removeSelectedNote: me,
      deleteSelection: ge
    } = RC({
      doc: () => o.doc,
      revision: r,
      readOnly: () => !!T.value,
      apply: (xe) => Po(xe),
      openInspector: () => {
        M.value = !0;
      },
      reportError: (xe) => {
        s.value = xe;
      },
      confirmNodeRemoval: (xe, Ce) => {
        A.require({
          group: "node-delete",
          header: "Delete step?",
          message: `Delete “${Je(xe.title, xe.ref)}” and its connections? You can undo this change.`,
          rejectLabel: "Cancel",
          acceptLabel: "Delete step",
          accept: Ce
        });
      }
    }), {
      publishBusy: P,
      publishedVersion: O,
      exportBusy: D,
      loadPublishedState: Y,
      exportDefinition: ee,
      definitionEditSeq: re,
      doPublish: te
    } = GC({
      engine: o,
      workflowId: n.workflowId,
      revision: r,
      error: s,
      notice: N,
      historyOpen: B,
      publishIssues: g,
      rebuild: mn,
      select: ne,
      published: (xe) => i("published", { kind: "flow", id: n.workflowId, version: xe })
    }), ce = { wfNode: et(th), wfNote: et(wh), wfFrame: et(bh), wfContainer: et(_h) }, be = { "mapping-completeness": et(kh) }, Ee = `wf-${n.workflowId}`, { fitView: Se, screenToFlowCoordinate: Me, getViewport: ft, onNodesInitialized: lt, findNode: mr, getSelectedNodes: gr } = De(Ee), Ro = j(0);
    function Pp() {
      Ro.value++;
    }
    let yl = !1;
    lt(() => {
      yl || a.value || (yl = !0, ze(() => Se(zo())));
    });
    const Lp = HC({
      engine: o,
      revision: r,
      selectedNode: H,
      selectedEdge: F,
      runState: S,
      viewingRun: T,
      error: s,
      loading: a,
      panelOpen: M,
      select: ne
    }), {
      selectedEdgeUpstream: zp,
      selectedEdgeDownstream: Vp,
      selectedEdgeSourceTitle: Bp,
      selectedEdgeTargetTitle: Fp,
      selectedNodeUpstream: Hp,
      selectedCombineConflict: qp,
      selectedRunStatus: Up,
      failedNode: Wp,
      failedNodeTitle: Yp,
      failedReason: Gp,
      errorView: jp,
      openFailedDetails: Xp,
      countLabel: Kp,
      canUndo: Zp,
      canRedo: Jp,
      isEmpty: Qp
    } = Lp;
    function mn(xe = !1) {
      hg(o.doc.nodes, _.value);
      const Ce = S.value.active || !!T.value, Le = jh(o.doc, Ce ? S.value : void 0, m.value, g.value, !!T.value);
      yv(new Set(Le.flowEdges.map((qt) => String(qt.id)))), wv(Le.flowEdges), p.value = Le.flowNodes, v.value = Le.flowEdges, r.value++, xe && ze(() => requestAnimationFrame(() => requestAnimationFrame(() => {
        try {
          Se(zo());
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
            const Le = await kd("/api/v1/user/me"), qt = yi(Le.user), Vo = String(qt.id || qt.email || "");
            if (!Vo) throw new Error("Unable to identify the Workflow editor session.");
            Do = `${Vo}:${n.workflowId}`, await sS(Do), gn = new aS(Vo, n.workflowId, localStorage);
          }
          const Ce = await Cd(n.workflowId);
          if (o.reset(Ce), !wr) {
            const Le = gn.read(o.doc);
            gn.write(Le), wr = !0, lS(Do, yn);
            for (const qt of Le) yn(qt);
          }
          g.value = /* @__PURE__ */ new Map(), s.value = "", mn(xe);
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
    const yn = oS({
      checkpoint: (xe) => {
        if (!gn) throw new Error("Workflow edits are not ready to save.");
        gn.write(xe);
      },
      engine: o,
      request: async (xe) => {
        const Ce = await xd(n.workflowId, xe);
        return s.value = "", Ce;
      },
      rebuild: mn,
      recover: async (xe) => {
        const Ce = qe(xe, "Couldn’t save the change.");
        await yr(), s.value = Ce;
      }
    });
    uS(yn, () => Do);
    async function wl(xe) {
      await yn.flush() && xe();
    }
    async function Po(xe, Ce = !1) {
      if (T.value) {
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
      if (!T.value && !(xe === "undo" && !o.doc.canUndo) && !(xe === "redo" && !o.doc.canRedo))
        try {
          if (!await yn.flush()) return;
          await (xe === "undo" ? dg : fg)(n.workflowId), await yr();
        } catch (Ce) {
          s.value = qe(Ce, xe === "undo" ? "Nothing to undo." : "Nothing to redo.");
        }
    }
    let _l = async () => !1;
    const { canvasEl: Lo, placeItem: kl, placeNote: El, placeFrame: xl, onDrop: ev, onDragOver: tv } = NC({
      engine: o,
      layoutDir: m,
      apply: Po,
      select: ne,
      catalog: _,
      getViewport: ft,
      screenToFlowCoordinate: Me
    }), { onNodeDragStop: nv, runAutoLayout: ov, toggleDir: iv, fit: $l } = QC({
      engine: o,
      layoutDir: m,
      viewingRun: T,
      canvasEl: Lo,
      apply: Po,
      prepareCanvasAction: () => _l(),
      fitView: Se,
      canvasFitOptions: zo
    });
    function zo(xe = 250) {
      const Ce = Lo.value?.getBoundingClientRect().width || 0, Le = typeof document > "u" ? 1 : Number.parseFloat(getComputedStyle(document.documentElement).zoom || "1") || 1;
      return Qh(xe, Ce > 0 && Ce <= 640 ? 0.02 : 0.2, Le);
    }
    const {
      connectStatus: rv,
      connectMessage: av,
      connectXY: sv,
      connectLineStyle: lv,
      isValidConnection: uv,
      onConnect: Sl,
      onConnectEnd: cv,
      onCanvasMouseMove: dv,
      pendingEdge: Cl,
      autoMapped: fv,
      intentRev: hv,
      dismissPending: Nl,
      acceptPending: pv,
      openPendingMapper: vv,
      dismissAutoMapped: mv,
      openAutoMapped: gv,
      clearIntentOverlays: br,
      pruneIntent: yv,
      decorateEdges: wv
    } = _C({
      engine: o,
      apply: Po,
      select: ne,
      layoutDir: m,
      viewingRun: T
    }), {
      connectionsOpen: bv,
      connectionSources: _v,
      connectionTargets: kv,
      connectionEdges: Ev,
      connectionTargetHandle: xv,
      openConnections: $v,
      closeConnections: Sv,
      createConnection: Cv
    } = tN({
      engine: o,
      revision: r,
      layoutDir: m,
      clearIntentOverlays: br,
      rememberOverlayInvoker: d,
      restoreOverlayFocusFallback: h,
      onConnect: Sl
    }), {
      pendingOverlaySize: Nv,
      pendingAnchor: Iv,
      autoMapAnchored: Av,
      connectHintPosition: Tv,
      measurePending: Mv,
      measureAuto: Ov
    } = sN({
      engine: o,
      flowNodes: p,
      canvasEl: Lo,
      findNode: mr,
      getViewport: ft,
      revision: r,
      viewportRevision: Ro,
      intentRevision: hv,
      pendingEdge: Cl,
      autoMapped: fv,
      connectXY: sv,
      rebuild: mn
    }), {
      runsOpen: _r,
      runRows: Rv,
      runsLoading: Dv,
      runsError: Pv,
      simOpen: kr,
      simBusy: Lv,
      simInput: zv,
      simInputKey: Vv,
      simError: Bv,
      simInputValid: Fv,
      startInputSchema: Hv,
      startHasFields: qv,
      canRunSimulate: Uv,
      stopRun: Wv,
      toggleRuns: Yv,
      viewRun: Gv,
      openSim: jv,
      closeSim: Xv,
      rerunSameInput: Kv,
      onSimInput: Zv,
      onSimValid: Jv,
      runSimulate: Qv
    } = MC({
      engine: o,
      workflowId: n.workflowId,
      rev: r,
      runState: S,
      viewingRun: T,
      viewingNodeHeaders: L,
      rebuild: mn,
      clearSelection: ue,
      error: s,
      panelOpen: M,
      historyOpen: B
    }), {
      openShare: em,
      toggleHistory: tm,
      closeHistory: nm,
      openAddTrigger: om,
      closeAddTrigger: im,
      openSim: rm,
      closeRunDialog: am,
      toggleRuns: sm,
      closeRuns: lm
    } = JC({
      workflowId: n.workflowId,
      shareOpen: I,
      shareHost: C,
      historyOpen: B,
      addTriggerOpen: y,
      runsOpen: _r,
      simOpen: kr,
      publishedVersion: O,
      error: s,
      clearIntentOverlays: br,
      rememberOverlayInvoker: d,
      restoreOverlayFocusFallback: h,
      openRunDialog: jv,
      closeSim: Xv,
      toggleRunsPanel: Yv
    }), Er = j(!1);
    function um(xe = null) {
      !O.value || T.value || (br(), d(xe), Er.value = !0, B.value = !1, _r.value = !1, kr.value = !1, y.value = !1);
    }
    function cm() {
      Er.value = !1, h();
    }
    const { rootEl: wn, onKeyDown: dm, focusPaletteSearch: fm } = TC({
      deleteSelection: ge,
      runHistory: bl,
      paletteOpen: k,
      hasSelection: U,
      clearSelection: ue,
      fit: () => $l(),
      zoomSelection: () => {
        const xe = gr.value.map((Ce) => Ce.id);
        xe.length && Se({ nodes: xe, padding: 0.4, duration: 200, maxZoom: 1.2 });
      }
    }), {
      paneMenu: hm,
      onPaneContextMenu: pm,
      onNodeContextMenu: vm,
      closePaneMenu: mm,
      menuAddStep: gm,
      menuAddNote: ym,
      menuAddFrame: wm,
      dropPicker: bm,
      onConnectStart: _m,
      onConnect: km,
      onConnectEnd: Em,
      closeDropPicker: xm,
      dropPickerPick: $m
    } = nN({
      viewingRun: T,
      paletteOpen: k,
      screenToFlowCoordinate: Me,
      placeItem: kl,
      placeNote: El,
      placeFrame: xl,
      focusPaletteSearch: fm,
      onConnect: Sl,
      settleConnectHint: cv
    }), Il = OC({
      rootEl: wn,
      panelOpen: M,
      paletteOpen: k,
      hasSelection: U,
      viewingRun: T,
      reframe: () => {
        try {
          Se(zo(180));
        } catch {
        }
      }
    }), { narrow: Sm, togglePalette: Cm, openInspector: Nm, closeInspector: Im } = Il;
    _l = Il.prepareCanvasAction;
    function Am(xe) {
      const Ce = _.value.find((Le) => !Le.ref && String(Le.kind) === xe);
      Nl(), k.value = !0, N.value = Ce ? `Suggested step: ${Ce.title}. Choose it from the palette.` : "Choose the suggested step from the palette.";
    }
    bN({
      workflowId: n.workflowId,
      engine: o,
      catalog: _,
      catalogErrors: E,
      catalogLoading: w,
      load: yr,
      loadPublishedState: Y,
      rebuild: mn
    });
    const Tm = _d({
      rootEl: wn,
      canvasEl: Lo,
      shareHost: C,
      runState: S,
      viewingRun: T,
      onKeyDown: dm,
      paletteOpen: k,
      countLabel: Kp,
      canUndo: Zp,
      canRedo: Jp,
      layoutDir: m,
      runsOpen: _r,
      simBusy: Lv,
      publishedVersion: O,
      exportBusy: D,
      historyOpen: B,
      publishBusy: P,
      publishedRunOpen: Er,
      openPublishedRun: um,
      closePublishedRun: cm,
      togglePalette: Cm,
      runHistory: bl,
      fit: $l,
      runAutoLayout: ov,
      toggleDir: iv,
      openConnections: $v,
      toggleRuns: sm,
      openAddTrigger: om,
      openShare: em,
      openSim: rm,
      exportDefinition: ee,
      toggleHistory: tm,
      doPublish: te,
      connectionsOpen: bv,
      connectionSources: _v,
      connectionTargets: kv,
      connectionEdges: Ev,
      connectionTargetHandle: xv,
      removeEdge: $e,
      closeConnections: Sv,
      createConnection: Cv,
      runRows: Rv,
      runsLoading: Dv,
      runsError: Pv,
      viewRun: Gv,
      closeRuns: lm,
      simOpen: kr,
      startInputSchema: Hv,
      simInput: zv,
      simInputKey: Vv,
      startHasFields: qv,
      simInputValid: Fv,
      simError: Bv,
      canRunSimulate: Uv,
      closeRunDialog: am,
      runSimulate: Qv,
      onSimInput: Zv,
      onSimValid: Jv,
      definitionEditSeq: re,
      closeHistory: nm,
      addTriggerOpen: y,
      closeAddTrigger: im,
      shareOpen: I,
      dropPicker: bm,
      catalog: _,
      dropPickerPick: $m,
      closeDropPicker: xm,
      paneMenu: hm,
      closePaneMenu: mm,
      menuAddStep: gm,
      menuAddNote: ym,
      menuAddFrame: wm,
      stopRun: Wv,
      error: s,
      errorView: jp,
      catalogLoading: w,
      catalogErrors: E,
      placeItem: kl,
      placeNote: El,
      placeFrame: xl,
      onDrop: ev,
      onDragOver: tv,
      onCanvasMouseMove: dv,
      flowId: Ee,
      flowNodes: p,
      flowEdges: v,
      nodeTypes: ce,
      edgeTypes: be,
      connectLineStyle: lv,
      isValidConnection: uv,
      onNodeClick: G,
      onEdgeClick: J,
      onPaneClick: K,
      onPaneContextMenu: pm,
      onNodeContextMenu: vm,
      onConnectStart: _m,
      onConnect: km,
      onConnectEnd: Em,
      onNodeDragStop: nv,
      onViewportMove: Pp,
      isEmpty: Qp,
      failedNode: Wp,
      failedNodeTitle: Yp,
      failedReason: Gp,
      openFailedDetails: Xp,
      connectStatus: rv,
      connectHintPosition: Tv,
      connectMessage: av,
      autoMapAnchored: Av,
      measureAuto: Ov,
      openAutoMapped: gv,
      dismissAutoMapped: mv,
      pendingEdge: Cl,
      pendingAnchor: Iv,
      availableSteps: b,
      pendingOverlaySize: Nv,
      measurePending: Mv,
      acceptPending: pv,
      showSuggestedNode: Am,
      openPendingMapper: vv,
      dismissPending: Nl,
      loading: a,
      panelOpen: M,
      hasSelection: U,
      openInspector: Nm,
      narrowEditor: Sm,
      closeInspector: Im,
      selectedNode: H,
      selectedRunStatus: Up,
      viewingNodeHeaders: L,
      clearSelection: ue,
      rerunSameInput: Kv,
      selectedEdge: F,
      selectedNote: q,
      selectedEdgeUpstream: zp,
      selectedEdgeDownstream: Vp,
      selectedEdgeSourceTitle: Bp,
      selectedEdgeTargetTitle: Fp,
      selectedNodeUpstream: Hp,
      selectedCombineConflict: qp,
      updateNode: X,
      removeSelectedNode: fe,
      updateEdge: oe,
      removeSelectedEdge: _e,
      updateNote: le,
      removeSelectedNote: me
    });
    return (xe, Ce) => ($(), se(z3, {
      "workflow-id": n.workflowId,
      model: f(Tm),
      onBack: Ce[0] || (Ce[0] = (Le) => wl(() => i("back"))),
      onOpenWorkflow: Ce[1] || (Ce[1] = (Le) => wl(() => i("open-workflow", Le)))
    }, null, 8, ["workflow-id", "model"]));
  }
}), B3 = { class: "wfp" }, F3 = {
  key: 0,
  class: "wfp-state"
}, H3 = {
  key: 1,
  class: "wfp-state wfp-error",
  role: "alert"
}, q3 = /* @__PURE__ */ we({
  __name: "WorkflowPreview",
  props: {
    workflowId: {}
  },
  setup(e) {
    const t = e, n = { wfNode: et(th), wfNote: et(wh), wfFrame: et(bh), wfContainer: et(_h) }, i = { "mapping-completeness": et(kh) }, o = `wf-preview-${t.workflowId}`, { fitView: r, onNodesInitialized: a } = De(o);
    a(() => {
      r(Qh(0));
    });
    const s = nt([]), l = nt([]), c = j(!0), u = j("");
    async function d() {
      c.value = !0, u.value = "";
      try {
        const h = Ah(await Cd(t.workflowId)), p = jh(h);
        s.value = p.flowNodes, l.value = p.flowEdges;
      } catch (h) {
        u.value = h instanceof Error ? h.message : "The workflow could not load.";
      } finally {
        c.value = !1;
      }
    }
    return ke(() => t.workflowId, d, { immediate: !0 }), (h, p) => ($(), R("div", B3, [
      c.value ? ($(), R("div", F3, [
        z(f(ae), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        p[0] || (p[0] = he(" Loading workflow…", -1))
      ])) : u.value ? ($(), R("div", H3, Z(u.value), 1)) : ($(), se(f(Zf), {
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
        default: ie(() => [
          z(f(op), {
            "pattern-color": "var(--wf-dot)",
            gap: 20,
            size: 1.2
          })
        ]),
        _: 1
      }, 8, ["nodes", "edges"]))
    ]));
  }
}), U3 = /* @__PURE__ */ we({
  __name: "WorkflowBuilder",
  setup(e) {
    const t = hd(), n = Mm(), i = j(null);
    ke(
      () => t.value?.route,
      () => {
        i.value = null;
      }
    );
    const o = W(() => i.value ?? t.value?.route ?? ""), r = W(() => o.value.replace(/^\//, "").split("/")), a = W(() => r.value[1] === "return" ? decodeURIComponent(r.value[2] || "") : ""), s = W(() => {
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
    const d = j(null), h = W(() => t.value?.mode === "preview");
    return (p, v) => ($(), R("div", {
      ref_key: "rootEl",
      ref: d,
      class: "wf"
    }, [
      h.value && s.value ? ($(), se(q3, {
        key: 0,
        "workflow-id": s.value
      }, null, 8, ["workflow-id"])) : s.value ? ($(), se(V3, {
        key: 1,
        "workflow-id": s.value,
        onBack: c,
        onOpenWorkflow: l,
        onPublished: u
      }, null, 8, ["workflow-id"])) : ($(), se(dw, {
        key: 2,
        onOpen: v[0] || (v[0] = (g) => l(g))
      }))
    ], 512));
  }
}), W3 = {
  install(e) {
    e.use(Rm), e.use(Dm);
  }
}, N4 = {
  rootComponent: U3,
  plugins: [Om, W3]
};
export {
  N4 as mountConfig
};
