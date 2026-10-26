import { u as Ve, W as qe } from "./index-D52CRMw6.js";
import { B as We, s as Ue, f as Fe, e as ie, a as ne, _ as Ge, P as Je } from "./KbDialog.vue_vue_type_script_setup_true_lang-CICQRGnH.js";
import { openBlock as f, createElementBlock as m, mergeProps as ye, createBlock as pe, resolveDynamicComponent as Ye, createCommentVNode as S, renderSlot as Ke, createElementVNode as y, toDisplayString as O, defineComponent as ze, ref as w, watch as ve, nextTick as xe, onBeforeUnmount as fe, normalizeStyle as Qe, computed as ue, onMounted as Xe, Fragment as oe, createVNode as h, unref as s, withDirectives as Ze, isRef as et, vModelText as tt, withCtx as U, normalizeClass as F, createTextVNode as Y, renderList as me, withKeys as Pe, withModifiers as he } from "vue";
import { Icon as C } from "@iconify/vue";
import { api as Q, loadByTagName as Ie, host as nt, define as at } from "@wippy-fe/proxy";
import { s as Re, u as ot, a as it } from "./componentRealtime-Bs_cyDpl.js";
import { s as st } from "./styles-DqTthkup.js";
var lt = `
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
`, rt = {
  root: function(c) {
    var r = c.props;
    return ["p-tag p-component", {
      "p-tag-info": r.severity === "info",
      "p-tag-success": r.severity === "success",
      "p-tag-warn": r.severity === "warn",
      "p-tag-danger": r.severity === "danger",
      "p-tag-secondary": r.severity === "secondary",
      "p-tag-contrast": r.severity === "contrast",
      "p-tag-rounded": r.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, ct = We.extend({
  name: "tag",
  style: lt,
  classes: rt
}), ut = {
  name: "BaseTag",
  extends: Ue,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: ct,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function ge(e) {
  "@babel/helpers - typeof";
  return ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(c) {
    return typeof c;
  } : function(c) {
    return c && typeof Symbol == "function" && c.constructor === Symbol && c !== Symbol.prototype ? "symbol" : typeof c;
  }, ge(e);
}
function dt(e, c, r) {
  return (c = pt(c)) in e ? Object.defineProperty(e, c, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[c] = r, e;
}
function pt(e) {
  var c = vt(e, "string");
  return ge(c) == "symbol" ? c : c + "";
}
function vt(e, c) {
  if (ge(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var l = r.call(e, c);
    if (ge(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (c === "string" ? String : Number)(e);
}
var Ce = {
  name: "Tag",
  extends: ut,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Fe(dt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, ft = ["data-p"];
function gt(e, c, r, l, k, I) {
  return f(), m("span", ye({
    class: e.cx("root"),
    "data-p": I.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (f(), pe(Ye(e.$slots.icon), ye({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (f(), m("span", ye({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : S("", !0), e.value != null || e.$slots.default ? Ke(e.$slots, "default", {
    key: 2
  }, function() {
    return [y("span", ye({
      class: e.cx("label")
    }, e.ptm("label")), O(e.value), 17)];
  }) : S("", !0)], 16, ft);
}
Ce.render = gt;
const yt = 2e3;
function Ne(e) {
  const c = e.margin ?? 8, r = e.gap ?? 4, l = Math.max(0, e.viewportWidth), k = Math.max(0, e.viewportHeight), I = Math.max(0, l - c * 2), $ = Math.min(Math.max(0, e.requestedWidth), I), H = e.align === "right" ? e.anchor.right - $ : e.anchor.left, D = Math.max(c, Math.min(H, l - c - $)), z = Math.max(0, k - e.anchor.bottom - r - c), P = Math.max(0, e.anchor.top - r - c), R = z < e.requestedMaxHeight && P > z ? "above" : "below", M = R === "above" ? P : z, T = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), M)), N = Math.min(Math.max(0, e.panelHeight ?? T), T), E = R === "above" ? e.anchor.top - r - N : e.anchor.bottom + r, L = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(D - L.left),
    width: Math.round($),
    maxHeight: T,
    side: R,
    top: Math.round(E - L.top)
  };
}
const mt = /* @__PURE__ */ ze({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: yt }
  },
  emits: ["update:open"],
  setup(e, { emit: c }) {
    const r = e, l = c, k = w(null), I = w({ position: "fixed", visibility: "hidden" });
    function $() {
      const E = r.anchor, L = k.value;
      if (!E || !L) return;
      const Z = E.getBoundingClientRect(), j = r.width === "anchor" ? Math.max(r.minWidth, Z.width) : Math.max(r.minWidth, r.width), B = {
        anchor: Z,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: j,
        requestedMaxHeight: r.maxHeight,
        align: r.align,
        gap: r.gap
      }, A = Ne(B);
      Object.assign(L.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${A.width}px`,
        maxHeight: `${A.maxHeight}px`,
        visibility: "hidden"
      });
      const q = L.getBoundingClientRect(), W = Ne({
        ...B,
        containingBlockOrigin: { left: q.left, top: q.top },
        panelHeight: q.height
      }), G = {
        position: "fixed",
        left: `${W.left}px`,
        top: `${W.top}px`,
        width: `${W.width}px`,
        maxHeight: `${W.maxHeight}px`,
        "--anchored-panel-available-height": `${W.maxHeight}px`,
        margin: "0",
        zIndex: String(r.zIndex),
        visibility: "visible"
      };
      I.value = G;
    }
    let H = null, D = !1;
    function z() {
      D || !r.open || (D = !0, requestAnimationFrame(() => {
        D = !1, r.open && $();
      }));
    }
    function P() {
      typeof ResizeObserver > "u" || (H = new ResizeObserver(z), k.value && H.observe(k.value), r.anchor && H.observe(r.anchor));
    }
    function R() {
      H?.disconnect(), H = null, D = !1;
    }
    ve(() => r.open, async (E) => {
      R(), E && (I.value = { position: "fixed", visibility: "hidden" }, await xe(), $(), P());
    }, { immediate: !0 });
    function M(E) {
      if (!r.open) return;
      const L = E.composedPath();
      k.value && L.includes(k.value) || r.anchor && L.includes(r.anchor) || l("update:open", !1);
    }
    function T(E) {
      r.open && E.key === "Escape" && l("update:open", !1);
    }
    function N() {
      r.open && $();
    }
    return document.addEventListener("click", M), document.addEventListener("keydown", T), window.addEventListener("resize", N), window.addEventListener("scroll", N, !0), fe(() => {
      R(), document.removeEventListener("click", M), document.removeEventListener("keydown", T), window.removeEventListener("resize", N), window.removeEventListener("scroll", N, !0);
    }), (E, L) => e.open ? (f(), m("div", {
      key: 0,
      ref_key: "panel",
      ref: k,
      class: "anchored-panel",
      style: Qe(I.value)
    }, [
      Ke(E.$slots, "default")
    ], 4)) : S("", !0);
  }
}), $e = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Te = Object.keys($e), Ae = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function ht({ detail: e }) {
  const c = w(!1), r = w(""), l = w(""), k = w([]), I = w(""), $ = w([]), H = w([]), D = w(""), z = ue(() => {
    const o = I.value.trim().toLowerCase();
    return o ? k.value.filter(
      (a) => (a.name || "").toLowerCase().includes(o) || (a.description || "").toLowerCase().includes(o)
    ) : k.value;
  });
  function P(o) {
    const a = o.toLowerCase();
    return a.includes("no implementation") || a.includes("no engine") || a.includes("contract unavailable") || a.includes("not found") && a.includes("binding");
  }
  async function R({ preserve: o = !1 } = {}) {
    c.value = !0, r.value = "", l.value = "";
    try {
      const { data: a } = await Q.get("/api/v1/knowledge/list");
      if (!a?.success) {
        const d = a?.error || "failed to load knowledge bases";
        if (P(d))
          return o || (k.value = []), l.value = Ae, !1;
        throw new Error(d);
      }
      return k.value = a.items || [], K(), !0;
    } catch (a) {
      o || (k.value = []), o || K();
      const d = ie(a, "could not load knowledge bases");
      return P(d) ? l.value = Ae : r.value = d, !1;
    } finally {
      c.value = !1;
    }
  }
  async function M() {
    try {
      const { data: o } = await Q.get("/api/v1/knowledge/models");
      $.value = o?.success ? o.models || [] : [];
    } catch {
      $.value = [];
    }
  }
  async function T() {
    try {
      const { data: o } = await Q.get("/api/v1/knowledge/engines");
      H.value = o?.success ? o.engines || [] : [];
    } catch {
      H.value = [];
    }
  }
  function N(o) {
    return H.value.find((a) => a.kb_type === o);
  }
  async function E() {
    D.value = "";
    try {
      const [o, a] = await Promise.all([
        Q.get("/api/v1/knowledge/engines"),
        Q.get("/api/v1/knowledge/models")
      ]);
      if (!o.data?.success) throw new Error(o.data?.error || "Could not load knowledge engines.");
      if (!a.data?.success) throw new Error(a.data?.error || "Could not load embedding models.");
      H.value = o.data.engines || [], $.value = a.data.models || [];
    } catch (o) {
      H.value = [], $.value = [], D.value = ie(o, "Could not load knowledge engines.");
    }
  }
  function L(o) {
    return !!o && typeof o == "object" && !Array.isArray(o);
  }
  function Z(o) {
    if (L(o)) return o;
    if (!(typeof o != "string" || !o))
      try {
        const a = JSON.parse(o);
        return L(a) ? a : void 0;
      } catch {
        return;
      }
  }
  function j(o, a) {
    if (!a) return;
    let d = o;
    for (const g of a.split(".")) {
      if (!L(d)) return;
      d = d[g];
    }
    return d;
  }
  function B(o, a) {
    if (!Array.isArray(a)) return [];
    const d = [];
    for (const g of a) {
      const n = j(o, g.path), p = typeof n == "number" ? n : Number(n || 0);
      p < (g.min ?? 0) || d.push({ icon: g.icon, value: p, label: String(p === 1 ? g.singular : g.plural) });
    }
    return d;
  }
  function A(o, a) {
    return Object.prototype.hasOwnProperty.call(o, a);
  }
  function q(o, a) {
    return Te.some((d) => A(o, d)) ? !0 : Array.isArray(a) ? a.some((d) => {
      const g = d.path || "";
      return g !== "" && A(o, g.split(".")[0]);
    }) : !1;
  }
  function W(o, a, d) {
    const g = String(a.kb_type || d || ""), n = N(g), p = {
      kb_type: g || d,
      badge: n?.badge
    };
    for (const v of Te) {
      const b = a[v];
      A(a, v) && typeof b == "number" && (p[v] = b);
    }
    return (q(a, n?.stats_spec) || A(a, "kb_type")) && (p.stat_items = B({ ...o, ...a }, n?.stats_spec)), p;
  }
  function G(o, a, d = []) {
    const g = {};
    typeof a.title == "string" && (g.name = a.title), typeof a.comment == "string" && (g.description = a.comment), typeof a.icon == "string" && (g.icon = a.icon), typeof a.status == "string" && (g.status = a.status), typeof a.auto_summary == "string" && (g.auto_summary = a.auto_summary), typeof a.auto_description == "string" && (g.auto_description = a.auto_description), typeof a.kb_type == "string" && (g.kb_type = a.kb_type), Object.assign(g, W(o, a, g.kb_type || o.kb_type));
    const n = { ...o, ...g };
    for (const p of d) {
      const v = p === "title" ? "name" : p;
      delete n[v];
    }
    return n;
  }
  const V = /* @__PURE__ */ new Map(), ee = /* @__PURE__ */ new Set();
  let te = 0;
  const J = w(null);
  function se(o, a) {
    const d = Z(a.meta) || {}, g = a.deleted || [];
    k.value = k.value.map((n) => n.id === o ? G(n, d, g) : n), e.value?.id === o && (e.value = G(e.value, d, g));
  }
  function X() {
    te++, ee.clear();
    for (const o of V.values()) o();
    V.clear(), J.value?.(), J.value = null;
  }
  function K() {
    const o = new Set(k.value.map((d) => d.id).filter(Boolean));
    for (const [d, g] of V)
      o.has(d) || (g(), V.delete(d));
    const a = te;
    for (const d of o) {
      if (V.has(d) || ee.has(d)) continue;
      ee.add(d);
      const g = Re(d, (n) => se(d, n), $e);
      if (ee.delete(d), !!g) {
        if (a !== te || !k.value.some((n) => n.id === d)) {
          g();
          continue;
        }
        V.set(d, g);
      }
    }
  }
  return ve(() => k.value.map((o) => o.id).join(`
`), () => K()), fe(X), {
    loading: c,
    error: r,
    notice: l,
    kbs: k,
    query: I,
    filtered: z,
    models: $,
    engines: H,
    dialogLoadError: D,
    load: R,
    loadModels: M,
    loadEngines: T,
    engineFor: N,
    loadDialogCatalog: E,
    detailUnsub: J,
    applyComponentMetaEvent: se,
    clearComponentSubscriptions: X
  };
}
function bt({ detail: e, detailUnsub: c, kbs: r, engines: l, engineFor: k, applyComponentMetaEvent: I, route: $, navigate: H, loadEngines: D }) {
  const z = w(!1), P = w(""), R = w(null);
  let M = null, T = 0, N = 0;
  const E = ue(() => e.value ? k(e.value.kb_type || "")?.manage_ui_id : void 0), L = ue(() => (e.value ? k(e.value.kb_type || "")?.manage_views : void 0) || []), Z = ue(() => L.value.length > 1), j = w(""), B = w("");
  let A = !1, q = 0;
  function W() {
    const n = e.value?.kb_type;
    return n ? `kx:kb:detail-view:${n}` : null;
  }
  ve(L, (n) => {
    if (!n.length) {
      j.value = "";
      return;
    }
    const p = n.map((_) => _.id);
    let v = "";
    try {
      const _ = W();
      v = _ && localStorage.getItem(_) || "";
    } catch {
    }
    const b = p.includes(v) ? v : p[0];
    b !== j.value && (j.value = b);
  }, { immediate: !0 });
  function G() {
    const n = { kb_id: e.value?.id, route: B.value };
    return j.value && (n.view = j.value), JSON.stringify(n);
  }
  function V(n) {
    if (n !== j.value) {
      j.value = n;
      try {
        const p = W();
        p && localStorage.setItem(p, n);
      } catch {
      }
      try {
        M?.setAttribute("config", G());
      } catch {
      }
    }
  }
  function ee(n) {
    n.stopPropagation();
    const p = e.value?.id;
    if (!p || A) return;
    const v = typeof n.detail == "string" ? n.detail : n.detail?.path ?? n.detail?.route ?? "", b = String(v || "").replace(/^\/+/, "");
    B.value = b, X(b ? `${p}/${b}` : p);
  }
  function te(n) {
    n.stopPropagation();
  }
  function J(n = !0) {
    n && N++, M && (M.removeEventListener("kb-changed", te), M.removeEventListener("navigate", ee), M.remove(), M = null);
  }
  async function se() {
    const n = ++N;
    J(!1);
    const p = E.value, v = R.value, b = e.value?.id;
    if (!p || !v || !b) return;
    try {
      await Ie(p, { timeoutMs: 8e3 });
    } catch {
    }
    if (n !== N || e.value?.id !== b || E.value !== p || R.value !== v) return;
    v.replaceChildren();
    const _ = document.createElement(p);
    try {
      _.setAttribute("config", G());
    } catch {
    }
    _.addEventListener("kb-changed", te), _.addEventListener("navigate", ee), v.appendChild(_), M = _;
  }
  function X(n) {
    A || H(n);
  }
  function K(n, p) {
    return T === n && e.value?.id === p;
  }
  async function o(n, p = !0) {
    const v = ++T, b = n.id;
    e.value = { ...n }, c.value?.(), c.value = b ? Re(b, (_) => I(b, _), $e) : null, P.value = "", z.value = !0, J(), p && X(b);
    try {
      const { data: _ } = await Q.get(`/api/v1/knowledge/${b}`);
      if (!K(v, b)) return;
      _?.success ? e.value = { ...e.value, ..._ } : P.value = _?.error || "could not load knowledge base";
    } catch (_) {
      if (!K(v, b)) return;
      P.value = ie(_, "could not load knowledge base");
    } finally {
      K(v, b) && (z.value = !1);
    }
    K(v, b) && (l.value.length || await D(), K(v, b) && (await xe(), K(v, b) && await se()));
  }
  async function a() {
    const n = e.value?.id;
    if (!n) return;
    const p = ++T;
    P.value = "";
    try {
      const { data: v } = await Q.get(`/api/v1/knowledge/${n}`);
      if (!K(p, n)) return;
      v?.success ? e.value = { ...e.value, ...v } : P.value = v?.error || "could not load knowledge base";
    } catch (v) {
      if (!K(p, n)) return;
      P.value = ie(v, "could not load knowledge base");
    }
    if (K(p, n) && (await xe(), !!K(p, n)))
      try {
        M?.setAttribute("config", G());
      } catch {
      }
  }
  function d(n = !0) {
    T++, J(), c.value?.(), c.value = null, e.value = null, B.value = "", n && X("");
  }
  async function g(n) {
    const p = ++q, v = String(n || "").split("/").filter(Boolean), b = v[0] || "", _ = v.slice(1).join("/");
    A = !0;
    try {
      if (p !== q) return;
      if (!b)
        e.value && d(!1);
      else if (e.value?.id !== b) {
        B.value = _;
        const be = r.value.find((ae) => ae.id === b);
        if (await o(be || { id: b }, !1), p !== q) return;
      } else if (_ !== B.value) {
        B.value = _;
        try {
          M?.setAttribute("config", G());
        } catch {
        }
      }
    } finally {
      p === q && (A = !1);
    }
  }
  return ve($, (n) => {
    g(n);
  }), fe(() => {
    J(), c.value?.(), c.value = null;
  }), {
    detailLoading: z,
    detailError: P,
    detailHost: R,
    detailManageTag: E,
    detailViews: L,
    detailHasViews: Z,
    detailView: j,
    innerRoute: B,
    setDetailView: V,
    openDetail: o,
    refreshOpenDetail: a,
    closeDetail: d,
    applyRoute: g,
    pushRoute: X,
    unmountDetailWc: J
  };
}
const kt = { class: "kx" }, wt = {
  key: 0,
  class: "kx-notice",
  role: "status"
}, _t = { class: "kx-head" }, xt = { class: "kx-head-icon" }, Ct = { class: "kx-head-actions" }, $t = { class: "kx-count" }, Et = { class: "kx-search" }, St = {
  key: 0,
  class: "kx-err"
}, Mt = {
  key: 1,
  class: "kx-notice"
}, Lt = { class: "kx-body" }, Dt = {
  key: 0,
  class: "kx-loading"
}, Ot = {
  key: 1,
  class: "kx-empty"
}, Ht = { class: "kx-empty-ico" }, Pt = {
  key: 2,
  class: "kx-empty"
}, Nt = {
  key: 3,
  class: "kx-grid"
}, Tt = ["aria-label", "onClick", "onKeydown"], At = { class: "kx-card-head" }, Kt = { class: "kx-ficon" }, zt = { class: "kx-card-id" }, It = ["title"], Rt = {
  key: 0,
  class: "kx-card-meta"
}, jt = { class: "kx-card-desc" }, Bt = {
  key: 0,
  class: "kx-stats"
}, Vt = ["title", "aria-label"], qt = { class: "kx-bar" }, Wt = { class: "kx-bar-l" }, Ut = { class: "kx-title" }, Ft = {
  key: 1,
  class: "kx-summary"
}, Gt = { class: "kx-summary-pop-h" }, Jt = {
  key: 0,
  class: "kx-summary-pop-sum"
}, Yt = {
  key: 1,
  class: "kx-summary-pop-desc"
}, Qt = { class: "kx-bar-r" }, Xt = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, Zt = ["aria-selected", "onClick"], en = {
  key: 0,
  class: "kx-err"
}, tn = {
  key: 0,
  class: "kx-loading"
}, nn = { class: "kx-detail-meta" }, an = {
  key: 0,
  class: "kx-detail-desc"
}, on = { class: "kx-stats" }, sn = {
  key: 0,
  class: "kx-stat"
}, ln = ["title", "aria-label"], rn = {
  key: 0,
  class: "kx-detail-summary"
}, cn = /* @__PURE__ */ ze({
  __name: "knowledge",
  setup(e) {
    const c = (u) => (u ?? 0).toLocaleString();
    function r(u) {
      if (u === "neutral") return "secondary";
      if (u === "warning") return "warn";
      if (u === "info" || u === "success" || u === "danger") return u;
    }
    const l = w(null), k = ht({ detail: l }), {
      loading: I,
      error: $,
      notice: H,
      kbs: D,
      query: z,
      filtered: P,
      models: R,
      engines: M,
      dialogLoadError: T,
      load: N,
      loadEngines: E,
      engineFor: L,
      loadDialogCatalog: Z,
      detailUnsub: j,
      applyComponentMetaEvent: B
    } = k, A = ot(), q = it(), W = bt({
      detail: l,
      detailUnsub: j,
      kbs: D,
      engines: M,
      engineFor: L,
      applyComponentMetaEvent: B,
      route: ue(() => A.value.route),
      navigate: (u) => q("navigate", u),
      loadEngines: E
    }), {
      detailLoading: G,
      detailError: V,
      detailHost: ee,
      detailManageTag: te,
      detailViews: J,
      detailHasViews: se,
      detailView: X,
      setDetailView: K,
      openDetail: o,
      refreshOpenDetail: a,
      closeDetail: d,
      applyRoute: g
    } = W;
    function n(u) {
      l.value ? V.value = u : $.value = u;
    }
    const p = w(!1), v = w(null);
    async function b() {
      v.value = null, await Z(), p.value = !0;
    }
    async function _(u) {
      $.value = "", V.value = "", T.value = "", M.value.length || await E();
      try {
        const { data: i } = await Q.get(`/api/v1/knowledge/${u.id}`);
        if (!i?.success) throw new Error(i?.error || "could not load knowledge base settings");
        v.value = {
          id: u.id,
          name: i.name ?? u.name,
          description: i.description ?? u.description,
          icon: i.icon ?? u.icon,
          kb_type: i.kb_type ?? u.kb_type,
          embedding_model: i.embedding_model,
          config: i.config && typeof i.config == "object" ? i.config : {}
        }, p.value = !0;
      } catch (i) {
        v.value = null, p.value = !1, n(ie(i, "could not load knowledge base settings"));
      }
    }
    async function be() {
      p.value = !1;
      const u = l.value?.id;
      if (await N(), u && v.value && v.value.id === u)
        try {
          const { data: i } = await Q.get(`/api/v1/knowledge/${u}`);
          i?.success && l.value && l.value.id === u && (l.value = { ...l.value, ...i });
        } catch {
        }
      v.value = null;
    }
    const ae = w({}), ke = w(""), Ee = ue(() => Object.keys(ae.value).length ? `Deleting ${Object.values(ae.value).join(", ")}: cleanup is in progress and continues in the background.` : ke.value);
    let de, we = !1;
    function Se() {
      we || de !== void 0 || !Object.keys(ae.value).length || (de = setTimeout(async () => {
        de = void 0;
        const u = await N({ preserve: !0 });
        if (!we) {
          if (u)
            for (const [i, t] of Object.entries(ae.value))
              D.value.some((x) => x.id === i) || (delete ae.value[i], ke.value = `Deletion complete: ${t}.`);
          Se();
        }
      }, 1e3));
    }
    fe(() => {
      we = !0, de !== void 0 && clearTimeout(de);
    });
    async function Me(u) {
      if (await nt.confirm({
        header: "Delete knowledge base",
        message: `Delete “${u.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        n(""), $.value = "";
        try {
          const { data: t } = await Q.delete(`/api/v1/knowledge/${u.id}`);
          if (!t?.success) throw new Error(t?.error || "delete failed");
          ke.value = "", t.in_progress === !0 && (ae.value[u.id] = u.name || "(untitled)", Se()), l.value?.id === u.id && d(), await N({ preserve: t.in_progress === !0 });
        } catch (t) {
          n(ie(t, "delete failed"));
        }
      }
    }
    const le = w(!1), _e = w(null), re = w(null);
    function Le(u) {
      _e.value = u, le.value = !0;
    }
    function De() {
      le.value = !1, _e.value = null;
    }
    const ce = w(!1), Oe = w(null);
    function He(u) {
      u.key === "Escape" && le.value && De();
    }
    Xe(() => {
      window.addEventListener("keydown", He);
    }), fe(() => {
      window.removeEventListener("keydown", He);
    });
    async function je() {
      const u = _e.value;
      if (!re.value || !u) return;
      if (re.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Ie("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const i = document.createElement("kickside-share");
      i.setAttribute("config", JSON.stringify({
        resource_id: u.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(u.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(u.id)}`,
        title: u.name || ""
      })), i.style.display = "block", i.addEventListener("close", De), re.value.appendChild(i);
    }
    return ve([le, re], async () => {
      le.value && re.value && await je();
    }), Ve(async () => {
      try {
        await Promise.all([N(), E(), a()]), !l.value && A.value.route && await g(A.value.route);
      } catch (u) {
        $.value = ie(u, "host API unavailable");
      }
    }), (u, i) => (f(), m("div", kt, [
      Ee.value ? (f(), m("div", wt, O(Ee.value), 1)) : S("", !0),
      l.value ? (f(), m(oe, { key: 2 }, [
        y("div", qt, [
          y("div", Wt, [
            y("button", {
              class: "kx-back",
              onClick: i[2] || (i[2] = (t) => s(d)())
            }, [
              h(s(C), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              i[16] || (i[16] = Y(" Back", -1))
            ]),
            y("h1", Ut, O(l.value.name || "(untitled)"), 1),
            l.value.badge ? (f(), pe(s(Ce), {
              key: 0,
              severity: r(l.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: U(() => [
                h(s(C), {
                  icon: l.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                Y(O(l.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : S("", !0),
            l.value.auto_summary || l.value.auto_description ? (f(), m("span", Ft, [
              h(s(ne), {
                ref_key: "summaryAnchor",
                ref: Oe,
                severity: "secondary",
                outlined: "",
                class: F(["kx-summary-btn", { on: ce.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ce.value,
                onClick: i[3] || (i[3] = he((t) => ce.value = !ce.value, ["stop"]))
              }, {
                icon: U(({ class: t }) => [
                  h(s(C), {
                    icon: "tabler:sparkles",
                    class: F(t),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              h(mt, {
                open: ce.value,
                "onUpdate:open": i[5] || (i[5] = (t) => ce.value = t),
                anchor: Oe.value,
                width: 340
              }, {
                default: U(() => [
                  y("div", {
                    class: "kx-summary-pop",
                    onClick: i[4] || (i[4] = he(() => {
                    }, ["stop"]))
                  }, [
                    y("div", Gt, [
                      h(s(C), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      i[17] || (i[17] = y("span", null, "About this knowledge base", -1))
                    ]),
                    l.value.auto_summary ? (f(), m("p", Jt, O(l.value.auto_summary), 1)) : S("", !0),
                    l.value.auto_description ? (f(), m("p", Yt, O(l.value.auto_description), 1)) : S("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : S("", !0)
          ]),
          y("div", Qt, [
            s(se) ? (f(), m("div", Xt, [
              (f(!0), m(oe, null, me(s(J), (t) => (f(), m("button", {
                key: t.id,
                class: F(["kx-viewseg-btn", { on: s(X) === t.id }]),
                role: "tab",
                "aria-selected": s(X) === t.id,
                onClick: (x) => s(K)(t.id)
              }, [
                t.icon ? (f(), pe(s(C), {
                  key: 0,
                  icon: t.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : S("", !0),
                Y(" " + O(t.label), 1)
              ], 10, Zt))), 128))
            ])) : S("", !0),
            h(s(ne), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: i[6] || (i[6] = (t) => _(l.value))
            }, {
              icon: U(({ class: t }) => [
                h(s(C), {
                  icon: "tabler:pencil",
                  class: F(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(s(ne), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: i[7] || (i[7] = (t) => Le(l.value))
            }, {
              icon: U(({ class: t }) => [
                h(s(C), {
                  icon: "tabler:share",
                  class: F(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(s(ne), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: i[8] || (i[8] = (t) => Me(l.value))
            }, {
              icon: U(({ class: t }) => [
                h(s(C), {
                  icon: "tabler:trash",
                  class: F(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        s(V) ? (f(), m("div", en, O(s(V)), 1)) : S("", !0),
        y("div", {
          class: F(["kx-body", { "kx-body-bleed": s(te) }])
        }, [
          s(G) ? (f(), m("div", tn, [
            h(s(C), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[18] || (i[18] = Y(" Loading… ", -1))
          ])) : (f(), m(oe, { key: 1 }, [
            s(te) ? S("", !0) : (f(), m(oe, { key: 0 }, [
              y("div", nn, [
                l.value.description ? (f(), m("div", an, O(l.value.description), 1)) : S("", !0),
                y("div", on, [
                  l.value.embedding_model ? (f(), m("span", sn, [
                    h(s(C), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    Y(O(l.value.embedding_model), 1)
                  ])) : S("", !0),
                  (f(!0), m(oe, null, me(l.value.stat_items || [], (t, x) => (f(), m("span", {
                    key: x,
                    class: "kx-stat",
                    title: `${c(t.value)} ${t.label}`,
                    "aria-label": `${c(t.value)} ${t.label}`
                  }, [
                    t.icon ? (f(), pe(s(C), {
                      key: 0,
                      icon: t.icon,
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])) : S("", !0),
                    Y(O(c(t.value)), 1)
                  ], 8, ln))), 128))
                ])
              ]),
              l.value.auto_summary ? (f(), m("div", rn, [
                i[19] || (i[19] = y("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                Y(" " + O(l.value.auto_summary), 1)
              ])) : S("", !0)
            ], 64)),
            y("div", {
              ref_key: "detailHost",
              ref: ee,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (f(), m(oe, { key: 1 }, [
        y("header", _t, [
          y("div", xt, [
            h(s(C), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          i[10] || (i[10] = y("div", { class: "kx-head-text" }, [
            y("h1", { class: "kx-head-title" }, "Knowledge"),
            y("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          y("div", Ct, [
            y("span", $t, O(s(D).length) + " knowledge base" + O(s(D).length !== 1 ? "s" : ""), 1),
            y("div", Et, [
              h(s(C), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Ze(y("input", {
                "onUpdate:modelValue": i[0] || (i[0] = (t) => et(z) ? z.value = t : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [tt, s(z)]
              ])
            ]),
            h(s(ne), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: b
            }, {
              icon: U(({ class: t }) => [
                h(s(C), {
                  icon: "tabler:plus",
                  class: F(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        s($) ? (f(), m("div", St, O(s($)), 1)) : S("", !0),
        s(H) ? (f(), m("div", Mt, [
          h(s(C), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          i[11] || (i[11] = y("span", null, [
            y("strong", null, "No knowledge engine installed."),
            Y(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : S("", !0),
        y("div", Lt, [
          s(I) && !s(D).length ? (f(), m("div", Dt, [
            h(s(C), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[12] || (i[12] = Y(" Loading… ", -1))
          ])) : s(D).length ? s(P).length ? (f(), m("div", Nt, [
            (f(!0), m(oe, null, me(s(P), (t) => (f(), m("div", {
              key: t.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${t.name || "knowledge base"}`,
              onClick: (x) => s(o)(t),
              onKeydown: [
                Pe((x) => s(o)(t), ["enter"]),
                Pe(he((x) => s(o)(t), ["prevent"]), ["space"])
              ]
            }, [
              y("div", At, [
                y("span", Kt, [
                  h(s(C), {
                    icon: t.icon || t.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                y("div", zt, [
                  y("div", {
                    class: "kx-card-name",
                    title: t.name || "(untitled)"
                  }, O(t.name || "(untitled)"), 9, It),
                  t.badge ? (f(), m("div", Rt, [
                    h(s(Ce), {
                      severity: r(t.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: U(() => [
                        h(s(C), {
                          icon: t.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        Y(O(t.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : S("", !0)
                ]),
                y("div", {
                  class: "kx-card-actions",
                  onClick: i[1] || (i[1] = he(() => {
                  }, ["stop"]))
                }, [
                  h(s(ne), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${t.name}`,
                    onClick: (x) => _(t)
                  }, {
                    icon: U(({ class: x }) => [
                      h(s(C), {
                        icon: "tabler:pencil",
                        class: F(x),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  h(s(ne), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${t.name}`,
                    onClick: (x) => Le(t)
                  }, {
                    icon: U(({ class: x }) => [
                      h(s(C), {
                        icon: "tabler:share",
                        class: F(x),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  h(s(ne), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${t.name}`,
                    onClick: (x) => Me(t)
                  }, {
                    icon: U(({ class: x }) => [
                      h(s(C), {
                        icon: "tabler:trash",
                        class: F(x),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"])
                ])
              ]),
              y("div", jt, O(t.description || "No description"), 1),
              t.stat_items && t.stat_items.length ? (f(), m("div", Bt, [
                (f(!0), m(oe, null, me(t.stat_items, (x, Be) => (f(), m("span", {
                  key: Be,
                  class: "kx-stat",
                  title: `${c(x.value)} ${x.label}`,
                  "aria-label": `${c(x.value)} ${x.label}`
                }, [
                  x.icon ? (f(), pe(s(C), {
                    key: 0,
                    icon: x.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : S("", !0),
                  Y(O(c(x.value)), 1)
                ], 8, Vt))), 128))
              ])) : S("", !0)
            ], 40, Tt))), 128))
          ])) : (f(), m("div", Pt, [...i[15] || (i[15] = [
            y("div", { class: "kx-empty-title" }, "No matches", -1),
            y("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (f(), m("div", Ot, [
            y("div", Ht, [
              h(s(C), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            i[13] || (i[13] = y("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            i[14] || (i[14] = y("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            h(s(ne), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: b
            }, {
              icon: U(({ class: t }) => [
                h(s(C), {
                  icon: "tabler:plus",
                  class: F(t),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      h(Ge, {
        open: p.value,
        api: s(Q),
        engines: s(M),
        models: s(R),
        target: v.value,
        "load-error": s(T),
        onRetry: s(Z),
        onClose: i[9] || (i[9] = (t) => p.value = !1),
        onSaved: be
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (f(), m("div", {
        key: 3,
        ref_key: "shareHost",
        ref: re
      }, null, 512)) : S("", !0)
    ]));
  }
}), un = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, dn = {
  wippy: un
};
class pn extends qe {
  static get wippyConfig() {
    return {
      propsSchema: dn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: st
    };
  }
  static get vueConfig() {
    return { rootComponent: cn, plugins: [Je] };
  }
}
at(import.meta.url, pn);
//# sourceMappingURL=index.js.map
