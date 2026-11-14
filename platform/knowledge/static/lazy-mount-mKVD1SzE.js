import { P as Re } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as he, computed as ce, openBlock as f, createElementBlock as b, withModifiers as oe, Fragment as ee, createElementVNode as m, createTextVNode as X, toDisplayString as K, createCommentVNode as O, createVNode as h, unref as a, watch as fe, onBeforeUnmount as pe, renderList as ge, createBlock as me, ref as M, nextTick as _e, normalizeStyle as Ke, renderSlot as Ie, onMounted as Pe, withDirectives as qe, isRef as Te, vModelText as Ve, withCtx as W, normalizeClass as J, withKeys as $e } from "vue";
import Z from "primevue/button";
import ze from "primevue/progressspinner";
import { on as Le, api as F, loadByTagName as Oe, host as Be } from "@wippy-fe/proxy";
import { c as We, a as Je, s as Ue, u as Fe, b as Ge } from "./constants-Yj74ScZp.js";
import { Icon as j } from "@iconify/vue";
import Se from "primevue/tag";
import { a as Ye } from "./wc-runtime-ClNbKZcC.js";
import { e as ie, _ as Qe } from "./KbDialog.vue_vue_type_script_setup_true_lang-Blqn-_MG.js";
const Xe = { key: 0 }, Ze = /* @__PURE__ */ he({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(o) {
    const v = o, g = ce(() => v.state.deletion_job === null || ["dead", "cancelled"].includes(v.state.deletion_job?.status || ""));
    return (r, p) => o.state.deleting_at ? (f(), b("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: p[1] || (p[1] = oe(() => {
      }, ["stop"])),
      onKeydown: p[2] || (p[2] = oe(() => {
      }, ["stop"]))
    }, [
      g.value ? (f(), b(ee, { key: 0 }, [
        m("span", null, [
          p[3] || (p[3] = X("Deletion failed", -1)),
          o.state.deletion_job?.last_error ? (f(), b("span", Xe, ": " + K(o.state.deletion_job.last_error), 1)) : O("", !0)
        ]),
        h(a(Z), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: p[0] || (p[0] = oe((R) => r.$emit("retry"), ["stop"]))
        })
      ], 64)) : (f(), b(ee, { key: 1 }, [
        h(a(ze), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        p[4] || (p[4] = m("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : O("", !0);
  }
});
function et(o, v, g, r) {
  const p = /* @__PURE__ */ new Set(), R = /* @__PURE__ */ new Map();
  function S(E, _) {
    const w = o.value.find((I) => v(I) === E), s = R.get(E), x = _?.job_id || s?.state.deletion_job_id || w?.deletion_job_id, D = s ? s.state.deletion_job_id : w?.deleting_at ? w.deletion_job_id : void 0;
    if ((s || w?.deleting_at) && x === D || x && s?.superseded.has(x)) return;
    const y = {
      deleting_at: s?.state.deleting_at || w?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: x
    }, A = new Set(s?.superseded);
    for (const I of [s?.state.deletion_job_id, w?.deletion_job_id])
      I && I !== x && A.add(I);
    R.set(E, { state: y, superseded: A }), w && (Object.assign(w, y), w.deletion_job = void 0);
  }
  const H = fe(() => o.value, (E, _ = []) => {
    const w = E.filter((s) => !p.has(v(s)));
    for (const s of _)
      p.has(v(s)) || w.some((x) => v(x) === v(s)) || (g?.(v(s)), s.deleting_at && r?.(v(s)));
    if (w.length !== E.length) {
      o.value = w;
      return;
    }
    for (const s of E) {
      s.deleting_at && s.deletion_job === void 0 && !_.includes(s) && (s.deletion_job = null);
      const x = R.get(v(s));
      if (x) {
        const y = s.deletion_job_id;
        s.deleting_at && y && y !== x.state.deletion_job_id && !x.superseded.has(y) && (x.state.deletion_job_id && x.superseded.add(x.state.deletion_job_id), x.state.deletion_job_id = y), y !== x.state.deletion_job_id && (s.deletion_job = void 0), Object.assign(s, x.state);
      }
      const D = _.find((y) => v(y) === v(s));
      s.deletion_job === void 0 && D?.deletion_job_id === s.deletion_job_id && (s.deletion_job = D?.deletion_job);
    }
  }, { immediate: !0 }), L = Le("@message", (E) => {
    const _ = We(E);
    if (!_) return;
    const w = o.value.find((s) => v(s) === _.component_id);
    _.event === "component.deleted" ? (w && !p.has(_.component_id) && (g?.(_.component_id), r?.(_.component_id)), p.add(_.component_id), R.delete(_.component_id), o.value = o.value.filter((s) => v(s) !== _.component_id)) : w && S(_.component_id, { job_id: _.deletion_job_id });
  });
  return pe(() => {
    H(), typeof L == "function" && L();
  }), { acceptDeletion: S };
}
const tt = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, nt = {
  key: 0,
  "aria-hidden": "true"
}, at = { class: "kx-header-stat" }, ot = { class: "kx-header-stat-label" }, it = /* @__PURE__ */ he({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(o) {
    return (v, g) => o.items.length ? (f(), b("span", tt, [
      (f(!0), b(ee, null, ge(o.items, (r, p) => (f(), b(ee, { key: p }, [
        p ? (f(), b("span", nt, " · ")) : O("", !0),
        m("span", at, [
          r.icon ? (f(), me(a(j), {
            key: 0,
            icon: r.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : O("", !0),
          m("span", ot, K(r.value.toLocaleString()) + " " + K(r.label), 1)
        ])
      ], 64))), 128))
    ])) : O("", !0);
  }
}), st = 2e3;
function je(o) {
  const v = o.margin ?? 8, g = o.gap ?? 4, r = Math.max(0, o.viewportWidth), p = Math.max(0, o.viewportHeight), R = Math.max(0, r - v * 2), S = Math.min(Math.max(0, o.requestedWidth), R), H = o.align === "right" ? o.anchor.right - S : o.anchor.left, L = Math.max(v, Math.min(H, r - v - S)), E = Math.max(0, p - o.anchor.bottom - g - v), _ = Math.max(0, o.anchor.top - g - v), w = E < o.requestedMaxHeight && _ > E ? "above" : "below", s = w === "above" ? _ : E, x = Math.round(Math.min(Math.max(0, o.requestedMaxHeight), s)), D = Math.min(Math.max(0, o.panelHeight ?? x), x), y = w === "above" ? o.anchor.top - g - D : o.anchor.bottom + g, A = o.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(L - A.left),
    width: Math.round(S),
    maxHeight: x,
    side: w,
    top: Math.round(y - A.top)
  };
}
const lt = /* @__PURE__ */ he({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: st }
  },
  emits: ["update:open"],
  setup(o, { emit: v }) {
    const g = o, r = v, p = M(null), R = M({ position: "fixed", visibility: "hidden" });
    function S() {
      const y = g.anchor, A = p.value;
      if (!y || !A) return;
      const I = y.getBoundingClientRect(), P = g.width === "anchor" ? Math.max(g.minWidth, I.width) : Math.max(g.minWidth, g.width), q = {
        anchor: I,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: P,
        requestedMaxHeight: g.maxHeight,
        align: g.align,
        gap: g.gap
      }, T = je(q);
      Object.assign(A.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${T.width}px`,
        maxHeight: `${T.maxHeight}px`,
        visibility: "hidden"
      });
      const z = A.getBoundingClientRect(), B = je({
        ...q,
        containingBlockOrigin: { left: z.left, top: z.top },
        panelHeight: z.height
      }), G = {
        position: "fixed",
        left: `${B.left}px`,
        top: `${B.top}px`,
        width: `${B.width}px`,
        maxHeight: `${B.maxHeight}px`,
        "--anchored-panel-available-height": `${B.maxHeight}px`,
        margin: "0",
        zIndex: String(g.zIndex),
        visibility: "visible"
      };
      R.value = G;
    }
    let H = null, L = !1;
    function E() {
      L || !g.open || (L = !0, requestAnimationFrame(() => {
        L = !1, g.open && S();
      }));
    }
    function _() {
      typeof ResizeObserver > "u" || (H = new ResizeObserver(E), p.value && H.observe(p.value), g.anchor && H.observe(g.anchor));
    }
    function w() {
      H?.disconnect(), H = null, L = !1;
    }
    fe(() => g.open, async (y) => {
      w(), y && (R.value = { position: "fixed", visibility: "hidden" }, await _e(), S(), _());
    }, { immediate: !0 });
    function s(y) {
      if (!g.open) return;
      const A = y.composedPath();
      p.value && A.includes(p.value) || g.anchor && A.includes(g.anchor) || r("update:open", !1);
    }
    function x(y) {
      !g.open || y.key !== "Escape" || (y.preventDefault(), y.stopImmediatePropagation(), r("update:open", !1));
    }
    function D() {
      g.open && S();
    }
    return document.addEventListener("click", s), document.addEventListener("keydown", x, !0), window.addEventListener("resize", D), window.addEventListener("scroll", D, !0), pe(() => {
      w(), document.removeEventListener("click", s), document.removeEventListener("keydown", x, !0), window.removeEventListener("resize", D), window.removeEventListener("scroll", D, !0);
    }), (y, A) => o.open ? (f(), b("div", {
      key: 0,
      ref_key: "panel",
      ref: p,
      class: "anchored-panel",
      style: Ke(R.value)
    }, [
      Ie(y.$slots, "default")
    ], 4)) : O("", !0);
  }
});
function rt() {
  let o = 0;
  return () => {
    const v = ++o;
    return () => v === o;
  };
}
const ke = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Me = Object.keys(ke), De = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function dt({ detail: o }) {
  const v = M(!1), g = M(""), r = M(""), p = M([]), R = M(""), S = M([]), H = M([]), L = M("");
  let E = !0;
  const _ = rt();
  let w = !1, s = !1;
  const x = ce(() => {
    const l = R.value.trim().toLowerCase();
    return l ? p.value.filter(
      (t) => (t.name || "").toLowerCase().includes(l) || (t.description || "").toLowerCase().includes(l)
    ) : p.value;
  });
  function D(l) {
    const t = l.toLowerCase();
    return t.includes("no implementation") || t.includes("no engine") || t.includes("contract unavailable") || t.includes("not found") && t.includes("binding");
  }
  async function y() {
    if (!E) return !1;
    const l = _();
    v.value = !0, g.value = "", r.value = "";
    try {
      const { data: t } = await F.get("/api/v1/knowledge/list");
      if (!t?.success) {
        const C = t?.error || "failed to load knowledge bases";
        if (D(C))
          return l() && E && (r.value = De), !1;
        throw new Error(C);
      }
      return l() && E && (p.value = t.items || []), !0;
    } catch (t) {
      const C = ie(t, "could not load knowledge bases");
      return l() && E && (D(C) ? r.value = De : g.value = C), !1;
    } finally {
      l() && (v.value = !1, E && s && !w && te());
    }
  }
  async function A() {
    try {
      const { data: l } = await F.get("/api/v1/knowledge/models");
      S.value = l?.success ? l.models || [] : [];
    } catch {
      S.value = [];
    }
  }
  async function I() {
    try {
      const { data: l } = await F.get("/api/v1/knowledge/engines");
      H.value = l?.success ? l.engines || [] : [];
    } catch {
      H.value = [];
    }
  }
  function P(l) {
    return H.value.find((t) => t.kb_type === l);
  }
  async function q() {
    L.value = "";
    try {
      const [l, t] = await Promise.all([
        F.get("/api/v1/knowledge/engines"),
        F.get("/api/v1/knowledge/models")
      ]);
      if (!l.data?.success) throw new Error(l.data?.error || "Could not load knowledge engines.");
      if (!t.data?.success) throw new Error(t.data?.error || "Could not load embedding models.");
      H.value = l.data.engines || [], S.value = t.data.models || [];
    } catch (l) {
      H.value = [], S.value = [], L.value = ie(l, "Could not load knowledge engines.");
    }
  }
  function T(l) {
    return !!l && typeof l == "object" && !Array.isArray(l);
  }
  function z(l) {
    if (T(l)) return l;
    if (!(typeof l != "string" || !l))
      try {
        const t = JSON.parse(l);
        return T(t) ? t : void 0;
      } catch {
        return;
      }
  }
  function B(l, t) {
    if (!t) return;
    let C = l;
    for (const e of t.split(".")) {
      if (!T(C)) return;
      C = C[e];
    }
    return C;
  }
  function G(l, t) {
    if (!Array.isArray(t)) return [];
    const C = [];
    for (const e of t) {
      const d = B(l, e.path), u = typeof d == "number" ? d : Number(d || 0);
      u < (e.min ?? 0) || C.push({ icon: e.icon, value: u, label: String(u === 1 ? e.singular : e.plural) });
    }
    return C;
  }
  function U(l, t) {
    return Object.prototype.hasOwnProperty.call(l, t);
  }
  function se(l, t) {
    return Me.some((C) => U(l, C)) ? !0 : Array.isArray(t) ? t.some((C) => {
      const e = C.path || "";
      return e !== "" && U(l, e.split(".")[0]);
    }) : !1;
  }
  function ne(l, t, C) {
    const e = String(t.kb_type || C || ""), d = P(e), u = {
      kb_type: e || C,
      badge: d?.badge
    };
    for (const k of Me) {
      const $ = t[k];
      U(t, k) && typeof $ == "number" && (u[k] = $);
    }
    return (se(t, d?.stats_spec) || U(t, "kb_type")) && (u.stat_items = G({ ...l, ...t }, d?.stats_spec)), u;
  }
  function Y(l, t, C = []) {
    const e = {};
    typeof t.title == "string" && (e.name = t.title), typeof t.comment == "string" && (e.description = t.comment), typeof t.icon == "string" && (e.icon = t.icon), typeof t.status == "string" && (e.status = t.status), typeof t.auto_summary == "string" && (e.auto_summary = t.auto_summary), typeof t.auto_description == "string" && (e.auto_description = t.auto_description), typeof t.kb_type == "string" && (e.kb_type = t.kb_type), Object.assign(e, ne(l, t, e.kb_type || l.kb_type));
    const d = { ...l, ...e };
    for (const u of C) {
      const k = u === "title" ? "name" : u;
      delete d[k];
    }
    return d;
  }
  const ae = M(null);
  function Q(l, t) {
    const C = z(t.meta) || {}, e = t.deleted || [];
    p.value = p.value.map((d) => d.id === l ? Y(d, C, e) : d), o.value?.id === l && (o.value = Y(o.value, C, e));
  }
  function V() {
    E = !1, s = !1, ue?.(), ae.value?.(), ae.value = null;
  }
  async function te() {
    if (E) {
      if (w || v.value) {
        s = !0;
        return;
      }
      w = !0;
      try {
        do
          s = !1, await y();
        while (E && s);
      } finally {
        w = !1;
      }
    }
  }
  const ue = Le("@message", (l) => {
    const t = Je(l, void 0, ke);
    if (!t) return;
    const C = p.value.some((e) => e.id === t.component_id);
    (C || o.value?.id === t.component_id) && Q(t.component_id, t), !C && typeof t.meta.kb_type == "string" && t.meta.kb_type && te();
  });
  return pe(V), {
    loading: v,
    error: g,
    notice: r,
    kbs: p,
    query: R,
    filtered: x,
    models: S,
    engines: H,
    dialogLoadError: L,
    load: y,
    loadModels: A,
    loadEngines: I,
    engineFor: P,
    loadDialogCatalog: q,
    detailUnsub: ae,
    applyComponentMetaEvent: Q,
    clearComponentSubscriptions: V
  };
}
function ct({ detail: o, detailUnsub: v, kbs: g, engines: r, engineFor: p, applyComponentMetaEvent: R, route: S, navigate: H, loadEngines: L }) {
  const E = M(!1), _ = M(""), w = M(null);
  let s = null, x = 0, D = 0;
  const y = ce(() => o.value ? p(o.value.kb_type || "")?.manage_ui_id : void 0), A = ce(() => (o.value ? p(o.value.kb_type || "")?.manage_views : void 0) || []), I = ce(() => A.value.length > 1), P = M(""), q = M("");
  let T = !1, z = 0;
  function B() {
    const e = o.value?.kb_type;
    return e ? `kx:kb:detail-view:${e}` : null;
  }
  fe(A, (e) => {
    if (!e.length) {
      P.value = "";
      return;
    }
    const d = e.map(($) => $.id);
    let u = "";
    try {
      const $ = B();
      u = $ && localStorage.getItem($) || "";
    } catch {
    }
    const k = d.includes(u) ? u : d[0];
    k !== P.value && (P.value = k);
  }, { immediate: !0 });
  function G() {
    const e = { kb_id: o.value?.id, route: q.value };
    return P.value && (e.view = P.value), JSON.stringify(e);
  }
  function U(e) {
    if (e !== P.value) {
      P.value = e;
      try {
        const d = B();
        d && localStorage.setItem(d, e);
      } catch {
      }
      try {
        s?.setAttribute("config", G());
      } catch {
      }
    }
  }
  function se(e) {
    e.stopPropagation();
    const d = o.value?.id;
    if (!d || T) return;
    const u = typeof e.detail == "string" ? e.detail : e.detail?.path ?? e.detail?.route ?? "", k = String(u || "").replace(/^\/+/, "");
    q.value = k, Q(k ? `${d}/${k}` : d);
  }
  function ne(e) {
    e.stopPropagation();
  }
  function Y(e = !0) {
    e && D++, s && (s.removeEventListener("kb-changed", ne), s.removeEventListener("navigate", se), s.remove(), s = null);
  }
  async function ae() {
    const e = ++D;
    Y(!1);
    const d = y.value, u = w.value, k = o.value?.id;
    if (!d || !u || !k) return;
    try {
      await Oe(d, { timeoutMs: 8e3 });
    } catch {
    }
    if (e !== D || o.value?.id !== k || y.value !== d || w.value !== u) return;
    u.replaceChildren();
    const $ = document.createElement(d);
    try {
      $.setAttribute("config", G());
    } catch {
    }
    $.addEventListener("kb-changed", ne), $.addEventListener("navigate", se), u.appendChild($), s = $;
  }
  function Q(e) {
    T || H(e);
  }
  function V(e, d) {
    return x === e && o.value?.id === d;
  }
  async function te(e, d = !0) {
    const u = ++x, k = e.id;
    o.value = { ...e }, v.value?.(), v.value = k ? Ue(k, ($) => R(k, $), ke) : null, _.value = "", E.value = !0, Y(), d && Q(k);
    try {
      const { data: $ } = await F.get(`/api/v1/knowledge/${k}`);
      if (!V(u, k)) return;
      $?.success ? o.value = { ...o.value, ...$ } : _.value = $?.error || "could not load knowledge base";
    } catch ($) {
      if (!V(u, k)) return;
      _.value = ie($, "could not load knowledge base");
    } finally {
      V(u, k) && (E.value = !1);
    }
    V(u, k) && (r.value.length || await L(), V(u, k) && (await _e(), V(u, k) && await ae()));
  }
  async function ue() {
    const e = o.value?.id;
    if (!e) return;
    const d = ++x;
    _.value = "";
    try {
      const { data: u } = await F.get(`/api/v1/knowledge/${e}`);
      if (!V(d, e)) return;
      u?.success ? o.value = { ...o.value, ...u } : _.value = u?.error || "could not load knowledge base";
    } catch (u) {
      if (!V(d, e)) return;
      _.value = ie(u, "could not load knowledge base");
    }
    if (V(d, e) && (await _e(), !!V(d, e)))
      try {
        s?.setAttribute("config", G());
      } catch {
      }
  }
  function l() {
    const e = o.value?.id;
    if (!e || !q.value) {
      t();
      return;
    }
    H({ path: e, back: { within: e } });
  }
  function t(e = !0) {
    x++, Y(), v.value?.(), v.value = null, o.value = null, q.value = "", e && Q("");
  }
  async function C(e) {
    const d = ++z, u = String(e || "").split("/").filter(Boolean), k = u[0] || "", $ = u.slice(1).join("/");
    T = !0;
    try {
      if (d !== z) return;
      if (!k)
        o.value && t(!1);
      else if (o.value?.id !== k) {
        q.value = $;
        const be = g.value.find((ve) => ve.id === k);
        if (await te(be || { id: k }, !1), d !== z) return;
      } else if ($ !== q.value) {
        q.value = $;
        try {
          s?.setAttribute("config", G());
        } catch {
        }
      }
    } finally {
      d === z && (T = !1);
    }
  }
  return fe(S, (e) => {
    C(e);
  }), pe(() => {
    Y(), v.value?.(), v.value = null;
  }), {
    detailLoading: E,
    detailError: _,
    detailHost: w,
    detailManageTag: y,
    detailViews: A,
    detailHasViews: I,
    detailView: P,
    innerRoute: q,
    setDetailView: U,
    openDetail: te,
    refreshOpenDetail: ue,
    closeDetail: t,
    backDetail: l,
    applyRoute: C,
    pushRoute: Q,
    unmountDetailWc: Y
  };
}
const ut = { class: "kx" }, vt = { class: "kx-head" }, ft = { class: "kx-head-icon" }, pt = { class: "kx-head-actions" }, gt = { class: "kx-count" }, mt = { class: "kx-search" }, ht = {
  key: 0,
  class: "kx-err"
}, bt = {
  key: 1,
  class: "kx-notice"
}, yt = { class: "kx-body" }, _t = {
  key: 0,
  class: "kx-loading"
}, kt = {
  key: 1,
  class: "kx-empty"
}, wt = { class: "kx-empty-ico" }, xt = {
  key: 2,
  class: "kx-empty"
}, Ct = {
  key: 3,
  class: "kx-grid"
}, Et = ["aria-label", "onClick", "onKeydown"], $t = { class: "kx-card-head" }, St = { class: "kx-ficon" }, jt = { class: "kx-card-id" }, Mt = ["title"], Dt = {
  key: 0,
  class: "kx-card-meta"
}, Lt = { class: "kx-card-desc" }, Ot = {
  key: 0,
  class: "kx-stats"
}, Ht = ["title", "aria-label"], At = { class: "kx-bar" }, Nt = { class: "kx-bar-l" }, Rt = ["title"], Kt = { class: "kx-summary-pop-h" }, It = {
  key: 0,
  class: "kx-summary-pop-sum"
}, Pt = {
  key: 1,
  class: "kx-summary-pop-desc"
}, qt = { class: "kx-bar-r" }, Tt = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, Vt = ["aria-selected", "onClick"], zt = {
  key: 0,
  class: "kx-err"
}, Bt = {
  key: 0,
  class: "kx-loading"
}, Wt = {
  key: 0,
  class: "kx-detail-meta"
}, Jt = {
  key: 0,
  class: "kx-detail-desc"
}, Ut = { class: "kx-stats" }, Ft = {
  key: 0,
  class: "kx-stat"
}, Gt = /* @__PURE__ */ he({
  __name: "knowledge",
  setup(o) {
    const v = (c) => (c ?? 0).toLocaleString();
    function g(c) {
      if (c === "neutral") return "secondary";
      if (c === "warning") return "warn";
      if (c === "info" || c === "success" || c === "danger") return c;
    }
    const r = M(null), p = dt({ detail: r }), {
      loading: R,
      error: S,
      notice: H,
      kbs: L,
      query: E,
      filtered: _,
      models: w,
      engines: s,
      dialogLoadError: x,
      load: D,
      loadEngines: y,
      engineFor: A,
      loadDialogCatalog: I,
      detailUnsub: P,
      applyComponentMetaEvent: q
    } = p, T = Fe(), z = Ge(), B = ct({
      detail: r,
      detailUnsub: P,
      kbs: L,
      engines: s,
      engineFor: A,
      applyComponentMetaEvent: q,
      route: ce(() => T.value.route),
      navigate: (c) => z("navigate", c),
      loadEngines: y
    }), {
      detailLoading: G,
      detailError: U,
      detailHost: se,
      detailManageTag: ne,
      detailViews: Y,
      detailHasViews: ae,
      detailView: Q,
      setDetailView: V,
      openDetail: te,
      refreshOpenDetail: ue,
      closeDetail: l,
      backDetail: t,
      applyRoute: C
    } = B;
    function e(c) {
      r.value ? U.value = c : S.value = c;
    }
    const d = M(!1), u = M(null);
    async function k() {
      u.value = null, await I(), d.value = !0;
    }
    async function $(c) {
      S.value = "", U.value = "", x.value = "", s.value.length || await y();
      try {
        const { data: i } = await F.get(`/api/v1/knowledge/${c.id}`);
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
        u.value = null, d.value = !1, e(ie(i, "could not load knowledge base settings"));
      }
    }
    async function be() {
      d.value = !1;
      const c = r.value?.id;
      if (await D(), c && u.value && u.value.id === c)
        try {
          const { data: i } = await F.get(`/api/v1/knowledge/${c}`);
          i?.success && r.value && r.value.id === c && (r.value = { ...r.value, ...i });
        } catch {
        }
      u.value = null;
    }
    async function ve(c) {
      if (await Be.confirm({
        header: "Delete knowledge base",
        message: `Delete “${c.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        e(""), S.value = "";
        try {
          const { data: n } = await F.delete(`/api/v1/knowledge/${c.id}`);
          if (!n?.success) throw new Error(n?.error || "delete failed");
          Ae(c.id, n), r.value?.id === c.id && l(), await D();
        } catch (n) {
          e(ie(n, "delete failed"));
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
    Pe(() => {
      window.addEventListener("keydown", Ee);
    }), pe(() => {
      window.removeEventListener("keydown", Ee);
    });
    async function He() {
      const c = ye.value;
      if (!re.value || !c) return;
      if (re.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Oe("kickside-share", { timeoutMs: 8e3 });
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
      le.value && re.value && await He();
    }), Ye(async () => {
      try {
        await Promise.all([D(), y(), ue()]), !r.value && T.value.route && await C(T.value.route);
      } catch (c) {
        S.value = ie(c, "host API unavailable");
      }
    });
    const { acceptDeletion: Ae } = et(L, (c) => c.id, (c) => {
      r.value?.id === c && l();
    }, D);
    return (c, i) => (f(), b("div", ut, [
      r.value ? (f(), b(ee, { key: 1 }, [
        m("div", At, [
          m("div", Nt, [
            m("button", {
              class: "kx-back",
              onClick: i[2] || (i[2] = (n) => a(t)())
            }, [
              h(a(j), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              i[16] || (i[16] = X(" Back", -1))
            ]),
            m("h1", {
              class: "kx-title",
              title: r.value.name || "(untitled)"
            }, K(r.value.name || "(untitled)"), 9, Rt),
            r.value.badge ? (f(), me(a(Se), {
              key: 0,
              severity: g(r.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: W(() => [
                h(a(j), {
                  icon: r.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                X(K(r.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : O("", !0),
            h(it, {
              items: r.value.stat_items || []
            }, null, 8, ["items"]),
            r.value.auto_summary || r.value.auto_description ? (f(), b("span", {
              key: 1,
              ref_key: "summaryAnchor",
              ref: Ce,
              class: "kx-summary"
            }, [
              h(a(Z), {
                severity: "secondary",
                outlined: "",
                class: J(["kx-summary-btn", { on: de.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": de.value,
                onClick: i[3] || (i[3] = oe((n) => de.value = !de.value, ["stop"]))
              }, {
                icon: W(({ class: n }) => [
                  h(a(j), {
                    icon: "tabler:sparkles",
                    class: J(n),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              h(lt, {
                open: de.value,
                "onUpdate:open": i[5] || (i[5] = (n) => de.value = n),
                anchor: Ce.value,
                width: 340
              }, {
                default: W(() => [
                  m("div", {
                    class: "kx-summary-pop",
                    onClick: i[4] || (i[4] = oe(() => {
                    }, ["stop"]))
                  }, [
                    m("div", Kt, [
                      h(a(j), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      i[17] || (i[17] = m("span", null, "About this knowledge base", -1))
                    ]),
                    r.value.auto_summary ? (f(), b("p", It, K(r.value.auto_summary), 1)) : O("", !0),
                    r.value.auto_description ? (f(), b("p", Pt, K(r.value.auto_description), 1)) : O("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ], 512)) : O("", !0)
          ]),
          m("div", qt, [
            a(ae) ? (f(), b("div", Tt, [
              (f(!0), b(ee, null, ge(a(Y), (n) => (f(), b("button", {
                key: n.id,
                class: J(["kx-viewseg-btn", { on: a(Q) === n.id }]),
                role: "tab",
                "aria-selected": a(Q) === n.id,
                onClick: (N) => a(V)(n.id)
              }, [
                n.icon ? (f(), me(a(j), {
                  key: 0,
                  icon: n.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : O("", !0),
                X(" " + K(n.label), 1)
              ], 10, Vt))), 128))
            ])) : O("", !0),
            h(a(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: i[6] || (i[6] = (n) => $(r.value))
            }, {
              icon: W(({ class: n }) => [
                h(a(j), {
                  icon: "tabler:pencil",
                  class: J(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(a(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: i[7] || (i[7] = (n) => we(r.value))
            }, {
              icon: W(({ class: n }) => [
                h(a(j), {
                  icon: "tabler:share",
                  class: J(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(a(Z), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: i[8] || (i[8] = (n) => ve(r.value))
            }, {
              icon: W(({ class: n }) => [
                h(a(j), {
                  icon: "tabler:trash",
                  class: J(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(U) ? (f(), b("div", zt, K(a(U)), 1)) : O("", !0),
        m("div", {
          class: J(["kx-body", { "kx-body-bleed": a(ne) }])
        }, [
          a(G) ? (f(), b("div", Bt, [
            h(a(j), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[18] || (i[18] = X(" Loading… ", -1))
          ])) : (f(), b(ee, { key: 1 }, [
            a(ne) ? O("", !0) : (f(), b("div", Wt, [
              r.value.description ? (f(), b("div", Jt, K(r.value.description), 1)) : O("", !0),
              m("div", Ut, [
                r.value.embedding_model ? (f(), b("span", Ft, [
                  h(a(j), {
                    icon: "tabler:vector",
                    "aria-hidden": "true"
                  }),
                  X(K(r.value.embedding_model), 1)
                ])) : O("", !0)
              ])
            ])),
            m("div", {
              ref_key: "detailHost",
              ref: se,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (f(), b(ee, { key: 0 }, [
        m("header", vt, [
          m("div", ft, [
            h(a(j), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          i[10] || (i[10] = m("div", { class: "kx-head-text" }, [
            m("h1", { class: "kx-head-title" }, "Knowledge"),
            m("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          m("div", pt, [
            m("span", gt, K(a(L).length) + " knowledge base" + K(a(L).length !== 1 ? "s" : ""), 1),
            m("div", mt, [
              h(a(j), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              qe(m("input", {
                "onUpdate:modelValue": i[0] || (i[0] = (n) => Te(E) ? E.value = n : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Ve, a(E)]
              ])
            ]),
            h(a(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: k
            }, {
              icon: W(({ class: n }) => [
                h(a(j), {
                  icon: "tabler:plus",
                  class: J(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(S) ? (f(), b("div", ht, K(a(S)), 1)) : O("", !0),
        a(H) ? (f(), b("div", bt, [
          h(a(j), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          i[11] || (i[11] = m("span", null, [
            m("strong", null, "No knowledge engine installed."),
            X(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : O("", !0),
        m("div", yt, [
          a(R) && !a(L).length ? (f(), b("div", _t, [
            h(a(j), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[12] || (i[12] = X(" Loading… ", -1))
          ])) : a(L).length ? a(_).length ? (f(), b("div", Ct, [
            (f(!0), b(ee, null, ge(a(_), (n) => (f(), b("div", {
              key: n.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${n.name || "knowledge base"}`,
              onClick: (N) => !n.deleting_at && a(te)(n),
              onKeydown: [
                $e((N) => !n.deleting_at && a(te)(n), ["enter"]),
                $e(oe((N) => !n.deleting_at && a(te)(n), ["prevent"]), ["space"])
              ]
            }, [
              h(Ze, {
                state: n,
                onRetry: (N) => ve(n)
              }, null, 8, ["state", "onRetry"]),
              m("div", $t, [
                m("span", St, [
                  h(a(j), {
                    icon: n.icon || n.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                m("div", jt, [
                  m("div", {
                    class: "kx-card-name",
                    title: n.name || "(untitled)"
                  }, K(n.name || "(untitled)"), 9, Mt),
                  n.badge ? (f(), b("div", Dt, [
                    h(a(Se), {
                      severity: g(n.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: W(() => [
                        h(a(j), {
                          icon: n.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        X(K(n.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : O("", !0)
                ]),
                m("div", {
                  class: "kx-card-actions",
                  onClick: i[1] || (i[1] = oe(() => {
                  }, ["stop"]))
                }, [
                  h(a(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${n.name}`,
                    onClick: (N) => !n.deleting_at && $(n),
                    disabled: !!n.deleting_at
                  }, {
                    icon: W(({ class: N }) => [
                      h(a(j), {
                        icon: "tabler:pencil",
                        class: J(N),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  h(a(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${n.name}`,
                    onClick: (N) => we(n),
                    disabled: !!n.deleting_at
                  }, {
                    icon: W(({ class: N }) => [
                      h(a(j), {
                        icon: "tabler:share",
                        class: J(N),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  h(a(Z), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${n.name}`,
                    onClick: (N) => ve(n),
                    disabled: !!n.deleting_at
                  }, {
                    icon: W(({ class: N }) => [
                      h(a(j), {
                        icon: "tabler:trash",
                        class: J(N),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              m("div", Lt, K(n.description || "No description"), 1),
              n.stat_items && n.stat_items.length ? (f(), b("div", Ot, [
                (f(!0), b(ee, null, ge(n.stat_items, (N, Ne) => (f(), b("span", {
                  key: Ne,
                  class: "kx-stat",
                  title: `${v(N.value)} ${N.label}`,
                  "aria-label": `${v(N.value)} ${N.label}`
                }, [
                  N.icon ? (f(), me(a(j), {
                    key: 0,
                    icon: N.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : O("", !0),
                  X(K(v(N.value)), 1)
                ], 8, Ht))), 128))
              ])) : O("", !0)
            ], 40, Et))), 128))
          ])) : (f(), b("div", xt, [...i[15] || (i[15] = [
            m("div", { class: "kx-empty-title" }, "No matches", -1),
            m("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (f(), b("div", kt, [
            m("div", wt, [
              h(a(j), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            i[13] || (i[13] = m("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            i[14] || (i[14] = m("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            h(a(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: k
            }, {
              icon: W(({ class: n }) => [
                h(a(j), {
                  icon: "tabler:plus",
                  class: J(n),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      h(Qe, {
        open: d.value,
        api: a(F),
        engines: a(s),
        models: a(w),
        target: u.value,
        "load-error": a(x),
        onRetry: a(I),
        onClose: i[9] || (i[9] = (n) => d.value = !1),
        onSaved: be
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (f(), b("div", {
        key: 2,
        ref_key: "shareHost",
        ref: re
      }, null, 512)) : O("", !0)
    ]));
  }
}), ln = {
  rootComponent: Gt,
  plugins: [Re]
};
export {
  ln as mountConfig
};
//# sourceMappingURL=lazy-mount-mKVD1SzE.js.map
