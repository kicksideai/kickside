import { P as Ke } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as he, computed as ce, openBlock as f, createElementBlock as y, withModifiers as ie, Fragment as Y, createElementVNode as g, createTextVNode as J, toDisplayString as K, createCommentVNode as L, createVNode as _, unref as a, watch as fe, onBeforeUnmount as pe, renderList as ge, createBlock as me, ref as M, nextTick as _e, normalizeStyle as Ie, renderSlot as Pe, onMounted as qe, withDirectives as Te, isRef as Ve, vModelText as ze, withCtx as W, normalizeClass as F, withKeys as $e } from "vue";
import ee from "primevue/button";
import Be from "primevue/progressspinner";
import { _ as We } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as Le, api as U, host as Oe, loadByTagName as He } from "@wippy-fe/proxy";
import { c as Fe, a as Ue, s as Ge, u as Je, b as Ye } from "./constants-Yj74ScZp.js";
import { e as ne, _ as Qe } from "./KbDialog.vue_vue_type_script_setup_true_lang-CKB3002V.js";
import { Icon as D } from "@iconify/vue";
import Se from "primevue/tag";
import { a as Xe } from "./wc-runtime-ClNbKZcC.js";
const Ze = { key: 0 }, et = /* @__PURE__ */ he({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(o) {
    const p = o, m = ce(() => p.state.deletion_job === null || ["dead", "cancelled"].includes(p.state.deletion_job?.status || ""));
    return (l, h) => o.state.deleting_at ? (f(), y("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: h[1] || (h[1] = ie(() => {
      }, ["stop"])),
      onKeydown: h[2] || (h[2] = ie(() => {
      }, ["stop"]))
    }, [
      m.value ? (f(), y(Y, { key: 0 }, [
        g("span", null, [
          h[3] || (h[3] = J("Deletion failed", -1)),
          o.state.deletion_job?.last_error ? (f(), y("span", Ze, ": " + K(o.state.deletion_job.last_error), 1)) : L("", !0)
        ]),
        _(a(ee), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: h[0] || (h[0] = ie((I) => l.$emit("retry"), ["stop"]))
        })
      ], 64)) : (f(), y(Y, { key: 1 }, [
        _(a(Be), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        h[4] || (h[4] = g("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : L("", !0);
  }
}), tt = /* @__PURE__ */ We(et, [["__scopeId", "data-v-63c136c7"]]);
function nt(o, p, m, l) {
  let h = !0;
  const I = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Map();
  function O(v, k) {
    const b = o.value.find((P) => p(P) === v), r = E.get(v), w = k?.job_id || r?.deletion_job_id || b?.deletion_job_id, V = r ? r.deletion_job_id : b?.deleting_at ? b.deletion_job_id : void 0;
    if ((r || b?.deleting_at) && w === V) return;
    const R = {
      deleting_at: r?.deleting_at || b?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: w
    };
    E.set(v, R), b && (Object.assign(b, R), b.deletion_job = void 0);
  }
  async function H(v) {
    const k = p(v), b = E.get(k), r = () => h && o.value.includes(v) && E.get(k) === b;
    try {
      const { data: w } = await U.get(`/api/v1/components/${encodeURIComponent(k)}`);
      if (!w?.success) throw new Error(ne(w, "Could not read deletion progress"));
      r() && (v.deleting_at = b?.deleting_at || w.deleting_at, v.deletion_job_id = w.deletion_job_id, b && (b.deletion_job_id = v.deletion_job_id), v.deletion_job = w.deletion_job ?? null);
    } catch (w) {
      r() && Oe.handleError("other", { message: ne(w, "Could not read deletion progress") });
    }
  }
  let S = [];
  const j = fe(() => o.value, (v, k = []) => {
    const b = v.filter((r) => !I.has(p(r)));
    for (const r of k)
      I.has(p(r)) || b.some((w) => p(w) === p(r)) || (m?.(p(r)), r.deleting_at);
    if (b.length !== v.length) {
      o.value = b;
      return;
    }
    for (const r of v) {
      const w = E.get(p(r));
      w && (r.deletion_job_id !== w.deletion_job_id && (r.deletion_job = void 0), Object.assign(r, w));
      const V = k.find((R) => p(R) === p(r));
      r.deletion_job === void 0 && V?.deletion_job_id === r.deletion_job_id && (r.deletion_job = V?.deletion_job), r.deleting_at && !S.includes(r) && H(r);
    }
    S = v;
  }, { immediate: !0 }), N = Le("@message", (v) => {
    const k = Fe(v);
    if (!k) return;
    const b = o.value.find((r) => p(r) === k.component_id);
    k.event === "component.deleted" ? (b && !I.has(k.component_id) && m?.(k.component_id), I.add(k.component_id), E.delete(k.component_id), o.value = o.value.filter((r) => p(r) !== k.component_id)) : b && O(k.component_id, { job_id: k.deletion_job_id });
  });
  return pe(() => {
    h = !1, j(), typeof N == "function" && N();
  }), { acceptDeletion: O };
}
const at = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, ot = {
  key: 0,
  "aria-hidden": "true"
}, it = { class: "kx-header-stat" }, st = { class: "kx-header-stat-label" }, lt = /* @__PURE__ */ he({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(o) {
    return (p, m) => o.items.length ? (f(), y("span", at, [
      (f(!0), y(Y, null, ge(o.items, (l, h) => (f(), y(Y, { key: h }, [
        h ? (f(), y("span", ot, " · ")) : L("", !0),
        g("span", it, [
          l.icon ? (f(), me(a(D), {
            key: 0,
            icon: l.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : L("", !0),
          g("span", st, K(l.value.toLocaleString()) + " " + K(l.label), 1)
        ])
      ], 64))), 128))
    ])) : L("", !0);
  }
}), rt = 2e3;
function De(o) {
  const p = o.margin ?? 8, m = o.gap ?? 4, l = Math.max(0, o.viewportWidth), h = Math.max(0, o.viewportHeight), I = Math.max(0, l - p * 2), E = Math.min(Math.max(0, o.requestedWidth), I), O = o.align === "right" ? o.anchor.right - E : o.anchor.left, H = Math.max(p, Math.min(O, l - p - E)), S = Math.max(0, h - o.anchor.bottom - m - p), j = Math.max(0, o.anchor.top - m - p), N = S < o.requestedMaxHeight && j > S ? "above" : "below", v = N === "above" ? j : S, k = Math.round(Math.min(Math.max(0, o.requestedMaxHeight), v)), b = Math.min(Math.max(0, o.panelHeight ?? k), k), r = N === "above" ? o.anchor.top - m - b : o.anchor.bottom + m, w = o.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(H - w.left),
    width: Math.round(E),
    maxHeight: k,
    side: N,
    top: Math.round(r - w.top)
  };
}
const dt = /* @__PURE__ */ he({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: rt }
  },
  emits: ["update:open"],
  setup(o, { emit: p }) {
    const m = o, l = p, h = M(null), I = M({ position: "fixed", visibility: "hidden" });
    function E() {
      const r = m.anchor, w = h.value;
      if (!r || !w) return;
      const V = r.getBoundingClientRect(), R = m.width === "anchor" ? Math.max(m.minWidth, V.width) : Math.max(m.minWidth, m.width), P = {
        anchor: V,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: R,
        requestedMaxHeight: m.maxHeight,
        align: m.align,
        gap: m.gap
      }, q = De(P);
      Object.assign(w.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${q.width}px`,
        maxHeight: `${q.maxHeight}px`,
        visibility: "hidden"
      });
      const z = w.getBoundingClientRect(), B = De({
        ...P,
        containingBlockOrigin: { left: z.left, top: z.top },
        panelHeight: z.height
      }), Q = {
        position: "fixed",
        left: `${B.left}px`,
        top: `${B.top}px`,
        width: `${B.width}px`,
        maxHeight: `${B.maxHeight}px`,
        "--anchored-panel-available-height": `${B.maxHeight}px`,
        margin: "0",
        zIndex: String(m.zIndex),
        visibility: "visible"
      };
      I.value = Q;
    }
    let O = null, H = !1;
    function S() {
      H || !m.open || (H = !0, requestAnimationFrame(() => {
        H = !1, m.open && E();
      }));
    }
    function j() {
      typeof ResizeObserver > "u" || (O = new ResizeObserver(S), h.value && O.observe(h.value), m.anchor && O.observe(m.anchor));
    }
    function N() {
      O?.disconnect(), O = null, H = !1;
    }
    fe(() => m.open, async (r) => {
      N(), r && (I.value = { position: "fixed", visibility: "hidden" }, await _e(), E(), j());
    }, { immediate: !0 });
    function v(r) {
      if (!m.open) return;
      const w = r.composedPath();
      h.value && w.includes(h.value) || m.anchor && w.includes(m.anchor) || l("update:open", !1);
    }
    function k(r) {
      m.open && r.key === "Escape" && l("update:open", !1);
    }
    function b() {
      m.open && E();
    }
    return document.addEventListener("click", v), document.addEventListener("keydown", k), window.addEventListener("resize", b), window.addEventListener("scroll", b, !0), pe(() => {
      N(), document.removeEventListener("click", v), document.removeEventListener("keydown", k), window.removeEventListener("resize", b), window.removeEventListener("scroll", b, !0);
    }), (r, w) => o.open ? (f(), y("div", {
      key: 0,
      ref_key: "panel",
      ref: h,
      class: "anchored-panel",
      style: Ie(I.value)
    }, [
      Pe(r.$slots, "default")
    ], 4)) : L("", !0);
  }
}), ke = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Me = Object.keys(ke), je = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function ct({ detail: o }) {
  const p = M(!1), m = M(""), l = M(""), h = M([]), I = M(""), E = M([]), O = M([]), H = M("");
  let S = !0, j = 0, N = !1, v = !1;
  const k = ce(() => {
    const s = I.value.trim().toLowerCase();
    return s ? h.value.filter(
      (t) => (t.name || "").toLowerCase().includes(s) || (t.description || "").toLowerCase().includes(s)
    ) : h.value;
  });
  function b(s) {
    const t = s.toLowerCase();
    return t.includes("no implementation") || t.includes("no engine") || t.includes("contract unavailable") || t.includes("not found") && t.includes("binding");
  }
  async function r() {
    if (!S) return !1;
    const s = ++j;
    p.value = !0, m.value = "", l.value = "";
    try {
      const { data: t } = await U.get("/api/v1/knowledge/list");
      if (!t?.success) {
        const C = t?.error || "failed to load knowledge bases";
        if (b(C))
          return s === j && S && (l.value = je), !1;
        throw new Error(C);
      }
      return s === j && S && (h.value = t.items || []), !0;
    } catch (t) {
      const C = ne(t, "could not load knowledge bases");
      return s === j && S && (b(C) ? l.value = je : m.value = C), !1;
    } finally {
      s === j && (p.value = !1, S && v && !N && te());
    }
  }
  async function w() {
    try {
      const { data: s } = await U.get("/api/v1/knowledge/models");
      E.value = s?.success ? s.models || [] : [];
    } catch {
      E.value = [];
    }
  }
  async function V() {
    try {
      const { data: s } = await U.get("/api/v1/knowledge/engines");
      O.value = s?.success ? s.engines || [] : [];
    } catch {
      O.value = [];
    }
  }
  function R(s) {
    return O.value.find((t) => t.kb_type === s);
  }
  async function P() {
    H.value = "";
    try {
      const [s, t] = await Promise.all([
        U.get("/api/v1/knowledge/engines"),
        U.get("/api/v1/knowledge/models")
      ]);
      if (!s.data?.success) throw new Error(s.data?.error || "Could not load knowledge engines.");
      if (!t.data?.success) throw new Error(t.data?.error || "Could not load embedding models.");
      O.value = s.data.engines || [], E.value = t.data.models || [];
    } catch (s) {
      O.value = [], E.value = [], H.value = ne(s, "Could not load knowledge engines.");
    }
  }
  function q(s) {
    return !!s && typeof s == "object" && !Array.isArray(s);
  }
  function z(s) {
    if (q(s)) return s;
    if (!(typeof s != "string" || !s))
      try {
        const t = JSON.parse(s);
        return q(t) ? t : void 0;
      } catch {
        return;
      }
  }
  function B(s, t) {
    if (!t) return;
    let C = s;
    for (const e of t.split(".")) {
      if (!q(C)) return;
      C = C[e];
    }
    return C;
  }
  function Q(s, t) {
    if (!Array.isArray(t)) return [];
    const C = [];
    for (const e of t) {
      const d = B(s, e.path), u = typeof d == "number" ? d : Number(d || 0);
      u < (e.min ?? 0) || C.push({ icon: e.icon, value: u, label: String(u === 1 ? e.singular : e.plural) });
    }
    return C;
  }
  function G(s, t) {
    return Object.prototype.hasOwnProperty.call(s, t);
  }
  function se(s, t) {
    return Me.some((C) => G(s, C)) ? !0 : Array.isArray(t) ? t.some((C) => {
      const e = C.path || "";
      return e !== "" && G(s, e.split(".")[0]);
    }) : !1;
  }
  function ae(s, t, C) {
    const e = String(t.kb_type || C || ""), d = R(e), u = {
      kb_type: e || C,
      badge: d?.badge
    };
    for (const x of Me) {
      const $ = t[x];
      G(t, x) && typeof $ == "number" && (u[x] = $);
    }
    return (se(t, d?.stats_spec) || G(t, "kb_type")) && (u.stat_items = Q({ ...s, ...t }, d?.stats_spec)), u;
  }
  function X(s, t, C = []) {
    const e = {};
    typeof t.title == "string" && (e.name = t.title), typeof t.comment == "string" && (e.description = t.comment), typeof t.icon == "string" && (e.icon = t.icon), typeof t.status == "string" && (e.status = t.status), typeof t.auto_summary == "string" && (e.auto_summary = t.auto_summary), typeof t.auto_description == "string" && (e.auto_description = t.auto_description), typeof t.kb_type == "string" && (e.kb_type = t.kb_type), Object.assign(e, ae(s, t, e.kb_type || s.kb_type));
    const d = { ...s, ...e };
    for (const u of C) {
      const x = u === "title" ? "name" : u;
      delete d[x];
    }
    return d;
  }
  const oe = M(null);
  function Z(s, t) {
    const C = z(t.meta) || {}, e = t.deleted || [];
    h.value = h.value.map((d) => d.id === s ? X(d, C, e) : d), o.value?.id === s && (o.value = X(o.value, C, e));
  }
  function T() {
    S = !1, v = !1, ue?.(), oe.value?.(), oe.value = null;
  }
  async function te() {
    if (S) {
      if (N || p.value) {
        v = !0;
        return;
      }
      N = !0;
      try {
        do
          v = !1, await r();
        while (S && v);
      } finally {
        N = !1;
      }
    }
  }
  const ue = Le("@message", (s) => {
    const t = Ue(s, void 0, ke);
    if (!t) return;
    const C = h.value.some((e) => e.id === t.component_id);
    (C || o.value?.id === t.component_id) && Z(t.component_id, t), !C && typeof t.meta.kb_type == "string" && t.meta.kb_type && te();
  });
  return pe(T), {
    loading: p,
    error: m,
    notice: l,
    kbs: h,
    query: I,
    filtered: k,
    models: E,
    engines: O,
    dialogLoadError: H,
    load: r,
    loadModels: w,
    loadEngines: V,
    engineFor: R,
    loadDialogCatalog: P,
    detailUnsub: oe,
    applyComponentMetaEvent: Z,
    clearComponentSubscriptions: T
  };
}
function ut({ detail: o, detailUnsub: p, kbs: m, engines: l, engineFor: h, applyComponentMetaEvent: I, route: E, navigate: O, loadEngines: H }) {
  const S = M(!1), j = M(""), N = M(null);
  let v = null, k = 0, b = 0;
  const r = ce(() => o.value ? h(o.value.kb_type || "")?.manage_ui_id : void 0), w = ce(() => (o.value ? h(o.value.kb_type || "")?.manage_views : void 0) || []), V = ce(() => w.value.length > 1), R = M(""), P = M("");
  let q = !1, z = 0;
  function B() {
    const e = o.value?.kb_type;
    return e ? `kx:kb:detail-view:${e}` : null;
  }
  fe(w, (e) => {
    if (!e.length) {
      R.value = "";
      return;
    }
    const d = e.map(($) => $.id);
    let u = "";
    try {
      const $ = B();
      u = $ && localStorage.getItem($) || "";
    } catch {
    }
    const x = d.includes(u) ? u : d[0];
    x !== R.value && (R.value = x);
  }, { immediate: !0 });
  function Q() {
    const e = { kb_id: o.value?.id, route: P.value };
    return R.value && (e.view = R.value), JSON.stringify(e);
  }
  function G(e) {
    if (e !== R.value) {
      R.value = e;
      try {
        const d = B();
        d && localStorage.setItem(d, e);
      } catch {
      }
      try {
        v?.setAttribute("config", Q());
      } catch {
      }
    }
  }
  function se(e) {
    e.stopPropagation();
    const d = o.value?.id;
    if (!d || q) return;
    const u = typeof e.detail == "string" ? e.detail : e.detail?.path ?? e.detail?.route ?? "", x = String(u || "").replace(/^\/+/, "");
    P.value = x, Z(x ? `${d}/${x}` : d);
  }
  function ae(e) {
    e.stopPropagation();
  }
  function X(e = !0) {
    e && b++, v && (v.removeEventListener("kb-changed", ae), v.removeEventListener("navigate", se), v.remove(), v = null);
  }
  async function oe() {
    const e = ++b;
    X(!1);
    const d = r.value, u = N.value, x = o.value?.id;
    if (!d || !u || !x) return;
    try {
      await He(d, { timeoutMs: 8e3 });
    } catch {
    }
    if (e !== b || o.value?.id !== x || r.value !== d || N.value !== u) return;
    u.replaceChildren();
    const $ = document.createElement(d);
    try {
      $.setAttribute("config", Q());
    } catch {
    }
    $.addEventListener("kb-changed", ae), $.addEventListener("navigate", se), u.appendChild($), v = $;
  }
  function Z(e) {
    q || O(e);
  }
  function T(e, d) {
    return k === e && o.value?.id === d;
  }
  async function te(e, d = !0) {
    const u = ++k, x = e.id;
    o.value = { ...e }, p.value?.(), p.value = x ? Ge(x, ($) => I(x, $), ke) : null, j.value = "", S.value = !0, X(), d && Z(x);
    try {
      const { data: $ } = await U.get(`/api/v1/knowledge/${x}`);
      if (!T(u, x)) return;
      $?.success ? o.value = { ...o.value, ...$ } : j.value = $?.error || "could not load knowledge base";
    } catch ($) {
      if (!T(u, x)) return;
      j.value = ne($, "could not load knowledge base");
    } finally {
      T(u, x) && (S.value = !1);
    }
    T(u, x) && (l.value.length || await H(), T(u, x) && (await _e(), T(u, x) && await oe()));
  }
  async function ue() {
    const e = o.value?.id;
    if (!e) return;
    const d = ++k;
    j.value = "";
    try {
      const { data: u } = await U.get(`/api/v1/knowledge/${e}`);
      if (!T(d, e)) return;
      u?.success ? o.value = { ...o.value, ...u } : j.value = u?.error || "could not load knowledge base";
    } catch (u) {
      if (!T(d, e)) return;
      j.value = ne(u, "could not load knowledge base");
    }
    if (T(d, e) && (await _e(), !!T(d, e)))
      try {
        v?.setAttribute("config", Q());
      } catch {
      }
  }
  function s() {
    const e = o.value?.id;
    if (!e || !P.value) {
      t();
      return;
    }
    O({ path: e, back: { within: e } });
  }
  function t(e = !0) {
    k++, X(), p.value?.(), p.value = null, o.value = null, P.value = "", e && Z("");
  }
  async function C(e) {
    const d = ++z, u = String(e || "").split("/").filter(Boolean), x = u[0] || "", $ = u.slice(1).join("/");
    q = !0;
    try {
      if (d !== z) return;
      if (!x)
        o.value && t(!1);
      else if (o.value?.id !== x) {
        P.value = $;
        const be = m.value.find((ve) => ve.id === x);
        if (await te(be || { id: x }, !1), d !== z) return;
      } else if ($ !== P.value) {
        P.value = $;
        try {
          v?.setAttribute("config", Q());
        } catch {
        }
      }
    } finally {
      d === z && (q = !1);
    }
  }
  return fe(E, (e) => {
    C(e);
  }), pe(() => {
    X(), p.value?.(), p.value = null;
  }), {
    detailLoading: S,
    detailError: j,
    detailHost: N,
    detailManageTag: r,
    detailViews: w,
    detailHasViews: V,
    detailView: R,
    innerRoute: P,
    setDetailView: G,
    openDetail: te,
    refreshOpenDetail: ue,
    closeDetail: t,
    backDetail: s,
    applyRoute: C,
    pushRoute: Z,
    unmountDetailWc: X
  };
}
const vt = { class: "kx" }, ft = { class: "kx-head" }, pt = { class: "kx-head-icon" }, gt = { class: "kx-head-actions" }, mt = { class: "kx-count" }, ht = { class: "kx-search" }, bt = {
  key: 0,
  class: "kx-err"
}, yt = {
  key: 1,
  class: "kx-notice"
}, _t = { class: "kx-body" }, kt = {
  key: 0,
  class: "kx-loading"
}, wt = {
  key: 1,
  class: "kx-empty"
}, xt = { class: "kx-empty-ico" }, Ct = {
  key: 2,
  class: "kx-empty"
}, Et = {
  key: 3,
  class: "kx-grid"
}, $t = ["aria-label", "onClick", "onKeydown"], St = { class: "kx-card-head" }, Dt = { class: "kx-ficon" }, Mt = { class: "kx-card-id" }, jt = ["title"], Lt = {
  key: 0,
  class: "kx-card-meta"
}, Ot = { class: "kx-card-desc" }, Ht = {
  key: 0,
  class: "kx-stats"
}, At = ["title", "aria-label"], Nt = { class: "kx-bar" }, Rt = { class: "kx-bar-l" }, Kt = ["title"], It = {
  key: 1,
  class: "kx-summary"
}, Pt = { class: "kx-summary-pop-h" }, qt = {
  key: 0,
  class: "kx-summary-pop-sum"
}, Tt = {
  key: 1,
  class: "kx-summary-pop-desc"
}, Vt = { class: "kx-bar-r" }, zt = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, Bt = ["aria-selected", "onClick"], Wt = {
  key: 0,
  class: "kx-err"
}, Ft = {
  key: 0,
  class: "kx-loading"
}, Ut = { class: "kx-detail-meta" }, Gt = {
  key: 0,
  class: "kx-detail-desc"
}, Jt = { class: "kx-stats" }, Yt = {
  key: 0,
  class: "kx-stat"
}, Qt = {
  key: 0,
  class: "kx-detail-summary"
}, Xt = /* @__PURE__ */ he({
  __name: "knowledge",
  setup(o) {
    const p = (c) => (c ?? 0).toLocaleString();
    function m(c) {
      if (c === "neutral") return "secondary";
      if (c === "warning") return "warn";
      if (c === "info" || c === "success" || c === "danger") return c;
    }
    const l = M(null), h = ct({ detail: l }), {
      loading: I,
      error: E,
      notice: O,
      kbs: H,
      query: S,
      filtered: j,
      models: N,
      engines: v,
      dialogLoadError: k,
      load: b,
      loadEngines: r,
      engineFor: w,
      loadDialogCatalog: V,
      detailUnsub: R,
      applyComponentMetaEvent: P
    } = h, q = Je(), z = Ye(), B = ut({
      detail: l,
      detailUnsub: R,
      kbs: H,
      engines: v,
      engineFor: w,
      applyComponentMetaEvent: P,
      route: ce(() => q.value.route),
      navigate: (c) => z("navigate", c),
      loadEngines: r
    }), {
      detailLoading: Q,
      detailError: G,
      detailHost: se,
      detailManageTag: ae,
      detailViews: X,
      detailHasViews: oe,
      detailView: Z,
      setDetailView: T,
      openDetail: te,
      refreshOpenDetail: ue,
      closeDetail: s,
      backDetail: t,
      applyRoute: C
    } = B;
    function e(c) {
      l.value ? G.value = c : E.value = c;
    }
    const d = M(!1), u = M(null);
    async function x() {
      u.value = null, await V(), d.value = !0;
    }
    async function $(c) {
      E.value = "", G.value = "", k.value = "", v.value.length || await r();
      try {
        const { data: i } = await U.get(`/api/v1/knowledge/${c.id}`);
        if (!i?.success) throw new Error(i?.error || "could not load knowledge base settings");
        u.value = {
          id: c.id,
          name: i.name ?? c.name,
          description: i.description ?? c.description,
          icon: i.icon ?? c.icon,
          kb_type: i.kb_type ?? c.kb_type,
          embedding_model: i.embedding_model,
          config: i.config && typeof i.config == "object" ? i.config : {}
        }, d.value = !0;
      } catch (i) {
        u.value = null, d.value = !1, e(ne(i, "could not load knowledge base settings"));
      }
    }
    async function be() {
      d.value = !1;
      const c = l.value?.id;
      if (await b(), c && u.value && u.value.id === c)
        try {
          const { data: i } = await U.get(`/api/v1/knowledge/${c}`);
          i?.success && l.value && l.value.id === c && (l.value = { ...l.value, ...i });
        } catch {
        }
      u.value = null;
    }
    async function ve(c) {
      if (await Oe.confirm({
        header: "Delete knowledge base",
        message: `Delete “${c.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        e(""), E.value = "";
        try {
          const { data: n } = await U.delete(`/api/v1/knowledge/${c.id}`);
          if (!n?.success) throw new Error(n?.error || "delete failed");
          Ne(c.id, n), l.value?.id === c.id && s(), await b();
        } catch (n) {
          e(ne(n, "delete failed"));
        }
      }
    }
    const le = M(!1), ye = M(null), re = M(null);
    function we(c) {
      ye.value = c, le.value = !0;
    }
    function xe() {
      le.value = !1, ye.value = null;
    }
    const de = M(!1), Ce = M(null);
    function Ee(c) {
      c.key === "Escape" && le.value && xe();
    }
    qe(() => {
      window.addEventListener("keydown", Ee);
    }), pe(() => {
      window.removeEventListener("keydown", Ee);
    });
    async function Ae() {
      const c = ye.value;
      if (!re.value || !c) return;
      if (re.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await He("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const i = document.createElement("kickside-share");
      i.setAttribute("config", JSON.stringify({
        resource_id: c.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(c.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(c.id)}`,
        title: c.name || ""
      })), i.style.display = "block", i.addEventListener("close", xe), re.value.appendChild(i);
    }
    fe([le, re], async () => {
      le.value && re.value && await Ae();
    }), Xe(async () => {
      try {
        await Promise.all([b(), r(), ue()]), !l.value && q.value.route && await C(q.value.route);
      } catch (c) {
        E.value = ne(c, "host API unavailable");
      }
    });
    const { acceptDeletion: Ne } = nt(H, (c) => c.id, (c) => {
      l.value?.id === c && s();
    });
    return (c, i) => (f(), y("div", vt, [
      l.value ? (f(), y(Y, { key: 1 }, [
        g("div", Nt, [
          g("div", Rt, [
            g("button", {
              class: "kx-back",
              onClick: i[2] || (i[2] = (n) => a(t)())
            }, [
              _(a(D), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              i[16] || (i[16] = J(" Back", -1))
            ]),
            g("h1", {
              class: "kx-title",
              title: l.value.name || "(untitled)"
            }, K(l.value.name || "(untitled)"), 9, Kt),
            l.value.badge ? (f(), me(a(Se), {
              key: 0,
              severity: m(l.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: W(() => [
                _(a(D), {
                  icon: l.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                J(K(l.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : L("", !0),
            _(lt, {
              items: l.value.stat_items || []
            }, null, 8, ["items"]),
            l.value.auto_summary || l.value.auto_description ? (f(), y("span", It, [
              _(a(ee), {
                ref_key: "summaryAnchor",
                ref: Ce,
                severity: "secondary",
                outlined: "",
                class: F(["kx-summary-btn", { on: de.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": de.value,
                onClick: i[3] || (i[3] = ie((n) => de.value = !de.value, ["stop"]))
              }, {
                icon: W(({ class: n }) => [
                  _(a(D), {
                    icon: "tabler:sparkles",
                    class: F(n),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              _(dt, {
                open: de.value,
                "onUpdate:open": i[5] || (i[5] = (n) => de.value = n),
                anchor: Ce.value,
                width: 340
              }, {
                default: W(() => [
                  g("div", {
                    class: "kx-summary-pop",
                    onClick: i[4] || (i[4] = ie(() => {
                    }, ["stop"]))
                  }, [
                    g("div", Pt, [
                      _(a(D), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      i[17] || (i[17] = g("span", null, "About this knowledge base", -1))
                    ]),
                    l.value.auto_summary ? (f(), y("p", qt, K(l.value.auto_summary), 1)) : L("", !0),
                    l.value.auto_description ? (f(), y("p", Tt, K(l.value.auto_description), 1)) : L("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : L("", !0)
          ]),
          g("div", Vt, [
            a(oe) ? (f(), y("div", zt, [
              (f(!0), y(Y, null, ge(a(X), (n) => (f(), y("button", {
                key: n.id,
                class: F(["kx-viewseg-btn", { on: a(Z) === n.id }]),
                role: "tab",
                "aria-selected": a(Z) === n.id,
                onClick: (A) => a(T)(n.id)
              }, [
                n.icon ? (f(), me(a(D), {
                  key: 0,
                  icon: n.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : L("", !0),
                J(" " + K(n.label), 1)
              ], 10, Bt))), 128))
            ])) : L("", !0),
            _(a(ee), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: i[6] || (i[6] = (n) => $(l.value))
            }, {
              icon: W(({ class: n }) => [
                _(a(D), {
                  icon: "tabler:pencil",
                  class: F(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            _(a(ee), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: i[7] || (i[7] = (n) => we(l.value))
            }, {
              icon: W(({ class: n }) => [
                _(a(D), {
                  icon: "tabler:share",
                  class: F(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            _(a(ee), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: i[8] || (i[8] = (n) => ve(l.value))
            }, {
              icon: W(({ class: n }) => [
                _(a(D), {
                  icon: "tabler:trash",
                  class: F(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(G) ? (f(), y("div", Wt, K(a(G)), 1)) : L("", !0),
        g("div", {
          class: F(["kx-body", { "kx-body-bleed": a(ae) }])
        }, [
          a(Q) ? (f(), y("div", Ft, [
            _(a(D), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[18] || (i[18] = J(" Loading… ", -1))
          ])) : (f(), y(Y, { key: 1 }, [
            a(ae) ? L("", !0) : (f(), y(Y, { key: 0 }, [
              g("div", Ut, [
                l.value.description ? (f(), y("div", Gt, K(l.value.description), 1)) : L("", !0),
                g("div", Jt, [
                  l.value.embedding_model ? (f(), y("span", Yt, [
                    _(a(D), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    J(K(l.value.embedding_model), 1)
                  ])) : L("", !0)
                ])
              ]),
              l.value.auto_summary ? (f(), y("div", Qt, [
                i[19] || (i[19] = g("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                J(" " + K(l.value.auto_summary), 1)
              ])) : L("", !0)
            ], 64)),
            g("div", {
              ref_key: "detailHost",
              ref: se,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (f(), y(Y, { key: 0 }, [
        g("header", ft, [
          g("div", pt, [
            _(a(D), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          i[10] || (i[10] = g("div", { class: "kx-head-text" }, [
            g("h1", { class: "kx-head-title" }, "Knowledge"),
            g("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          g("div", gt, [
            g("span", mt, K(a(H).length) + " knowledge base" + K(a(H).length !== 1 ? "s" : ""), 1),
            g("div", ht, [
              _(a(D), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Te(g("input", {
                "onUpdate:modelValue": i[0] || (i[0] = (n) => Ve(S) ? S.value = n : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [ze, a(S)]
              ])
            ]),
            _(a(ee), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: x
            }, {
              icon: W(({ class: n }) => [
                _(a(D), {
                  icon: "tabler:plus",
                  class: F(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(E) ? (f(), y("div", bt, K(a(E)), 1)) : L("", !0),
        a(O) ? (f(), y("div", yt, [
          _(a(D), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          i[11] || (i[11] = g("span", null, [
            g("strong", null, "No knowledge engine installed."),
            J(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : L("", !0),
        g("div", _t, [
          a(I) && !a(H).length ? (f(), y("div", kt, [
            _(a(D), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[12] || (i[12] = J(" Loading… ", -1))
          ])) : a(H).length ? a(j).length ? (f(), y("div", Et, [
            (f(!0), y(Y, null, ge(a(j), (n) => (f(), y("div", {
              key: n.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${n.name || "knowledge base"}`,
              onClick: (A) => !n.deleting_at && a(te)(n),
              onKeydown: [
                $e((A) => !n.deleting_at && a(te)(n), ["enter"]),
                $e(ie((A) => !n.deleting_at && a(te)(n), ["prevent"]), ["space"])
              ]
            }, [
              _(tt, {
                state: n,
                onRetry: (A) => ve(n)
              }, null, 8, ["state", "onRetry"]),
              g("div", St, [
                g("span", Dt, [
                  _(a(D), {
                    icon: n.icon || n.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                g("div", Mt, [
                  g("div", {
                    class: "kx-card-name",
                    title: n.name || "(untitled)"
                  }, K(n.name || "(untitled)"), 9, jt),
                  n.badge ? (f(), y("div", Lt, [
                    _(a(Se), {
                      severity: m(n.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: W(() => [
                        _(a(D), {
                          icon: n.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        J(K(n.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : L("", !0)
                ]),
                g("div", {
                  class: "kx-card-actions",
                  onClick: i[1] || (i[1] = ie(() => {
                  }, ["stop"]))
                }, [
                  _(a(ee), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${n.name}`,
                    onClick: (A) => !n.deleting_at && $(n),
                    disabled: !!n.deleting_at
                  }, {
                    icon: W(({ class: A }) => [
                      _(a(D), {
                        icon: "tabler:pencil",
                        class: F(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  _(a(ee), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${n.name}`,
                    onClick: (A) => we(n),
                    disabled: !!n.deleting_at
                  }, {
                    icon: W(({ class: A }) => [
                      _(a(D), {
                        icon: "tabler:share",
                        class: F(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  _(a(ee), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${n.name}`,
                    onClick: (A) => ve(n),
                    disabled: !!n.deleting_at
                  }, {
                    icon: W(({ class: A }) => [
                      _(a(D), {
                        icon: "tabler:trash",
                        class: F(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              g("div", Ot, K(n.description || "No description"), 1),
              n.stat_items && n.stat_items.length ? (f(), y("div", Ht, [
                (f(!0), y(Y, null, ge(n.stat_items, (A, Re) => (f(), y("span", {
                  key: Re,
                  class: "kx-stat",
                  title: `${p(A.value)} ${A.label}`,
                  "aria-label": `${p(A.value)} ${A.label}`
                }, [
                  A.icon ? (f(), me(a(D), {
                    key: 0,
                    icon: A.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : L("", !0),
                  J(K(p(A.value)), 1)
                ], 8, At))), 128))
              ])) : L("", !0)
            ], 40, $t))), 128))
          ])) : (f(), y("div", Ct, [...i[15] || (i[15] = [
            g("div", { class: "kx-empty-title" }, "No matches", -1),
            g("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (f(), y("div", wt, [
            g("div", xt, [
              _(a(D), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            i[13] || (i[13] = g("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            i[14] || (i[14] = g("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            _(a(ee), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: x
            }, {
              icon: W(({ class: n }) => [
                _(a(D), {
                  icon: "tabler:plus",
                  class: F(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      _(Qe, {
        open: d.value,
        api: a(U),
        engines: a(v),
        models: a(N),
        target: u.value,
        "load-error": a(k),
        onRetry: a(V),
        onClose: i[9] || (i[9] = (n) => d.value = !1),
        onSaved: be
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (f(), y("div", {
        key: 2,
        ref_key: "shareHost",
        ref: re
      }, null, 512)) : L("", !0)
    ]));
  }
}), un = {
  rootComponent: Xt,
  plugins: [Ke]
};
export {
  un as mountConfig
};
//# sourceMappingURL=lazy-mount-s0eVFvy7.js.map
