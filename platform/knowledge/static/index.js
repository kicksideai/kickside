import { u as qe, W as We } from "./index-D52CRMw6.js";
import { B as Ue, s as Fe, f as Ge, e as se, a as ae, _ as Je, P as Ye } from "./KbDialog.vue_vue_type_script_setup_true_lang-CICQRGnH.js";
import { openBlock as v, createElementBlock as h, mergeProps as he, createBlock as ve, resolveDynamicComponent as Qe, createCommentVNode as C, renderSlot as Re, createElementVNode as y, toDisplayString as O, defineComponent as Ee, Fragment as oe, renderList as be, unref as o, ref as w, watch as ge, nextTick as Ce, onBeforeUnmount as fe, normalizeStyle as Xe, computed as de, onMounted as Ze, createVNode as m, withDirectives as et, isRef as tt, vModelText as nt, withCtx as F, normalizeClass as G, createTextVNode as Z, withKeys as Ke, withModifiers as me } from "vue";
import { Icon as x } from "@iconify/vue";
import { api as X, loadByTagName as ze, host as at, define as ot } from "@wippy-fe/proxy";
import { s as je, u as it, a as st } from "./componentRealtime-Bs_cyDpl.js";
import { s as lt } from "./styles-Bn0s9kIq.js";
var rt = `
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
`, ct = {
  root: function(u) {
    var r = u.props;
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
}, ut = Ue.extend({
  name: "tag",
  style: rt,
  classes: ct
}), dt = {
  name: "BaseTag",
  extends: Fe,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: ut,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function ye(e) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(u) {
    return typeof u;
  } : function(u) {
    return u && typeof Symbol == "function" && u.constructor === Symbol && u !== Symbol.prototype ? "symbol" : typeof u;
  }, ye(e);
}
function pt(e, u, r) {
  return (u = vt(u)) in e ? Object.defineProperty(e, u, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[u] = r, e;
}
function vt(e) {
  var u = gt(e, "string");
  return ye(u) == "symbol" ? u : u + "";
}
function gt(e, u) {
  if (ye(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var l = r.call(e, u);
    if (ye(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (u === "string" ? String : Number)(e);
}
var $e = {
  name: "Tag",
  extends: dt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ge(pt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, ft = ["data-p"];
function yt(e, u, r, l, k, j) {
  return v(), h("span", he({
    class: e.cx("root"),
    "data-p": j.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (v(), ve(Qe(e.$slots.icon), he({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (v(), h("span", he({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : C("", !0), e.value != null || e.$slots.default ? Re(e.$slots, "default", {
    key: 2
  }, function() {
    return [y("span", he({
      class: e.cx("label")
    }, e.ptm("label")), O(e.value), 17)];
  }) : C("", !0)], 16, ft);
}
$e.render = yt;
const ht = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, mt = {
  key: 0,
  "aria-hidden": "true"
}, bt = { class: "kx-header-stat" }, kt = { class: "kx-header-stat-label" }, wt = /* @__PURE__ */ Ee({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (u, r) => e.items.length ? (v(), h("span", ht, [
      (v(!0), h(oe, null, be(e.items, (l, k) => (v(), h(oe, { key: k }, [
        k ? (v(), h("span", mt, " · ")) : C("", !0),
        y("span", bt, [
          l.icon ? (v(), ve(o(x), {
            key: 0,
            icon: l.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : C("", !0),
          y("span", kt, O(l.value.toLocaleString()) + " " + O(l.label), 1)
        ])
      ], 64))), 128))
    ])) : C("", !0);
  }
}), _t = 2e3;
function Te(e) {
  const u = e.margin ?? 8, r = e.gap ?? 4, l = Math.max(0, e.viewportWidth), k = Math.max(0, e.viewportHeight), j = Math.max(0, l - u * 2), E = Math.min(Math.max(0, e.requestedWidth), j), P = e.align === "right" ? e.anchor.right - E : e.anchor.left, H = Math.max(u, Math.min(P, l - u - E)), R = Math.max(0, k - e.anchor.bottom - r - u), N = Math.max(0, e.anchor.top - r - u), B = R < e.requestedMaxHeight && N > R ? "above" : "below", L = B === "above" ? N : R, T = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), L)), K = Math.min(Math.max(0, e.panelHeight ?? T), T), S = B === "above" ? e.anchor.top - r - K : e.anchor.bottom + r, D = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(H - D.left),
    width: Math.round(E),
    maxHeight: T,
    side: B,
    top: Math.round(S - D.top)
  };
}
const xt = /* @__PURE__ */ Ee({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: _t }
  },
  emits: ["update:open"],
  setup(e, { emit: u }) {
    const r = e, l = u, k = w(null), j = w({ position: "fixed", visibility: "hidden" });
    function E() {
      const S = r.anchor, D = k.value;
      if (!S || !D) return;
      const ee = S.getBoundingClientRect(), V = r.width === "anchor" ? Math.max(r.minWidth, ee.width) : Math.max(r.minWidth, r.width), z = {
        anchor: ee,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: V,
        requestedMaxHeight: r.maxHeight,
        align: r.align,
        gap: r.gap
      }, A = Te(z);
      Object.assign(D.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${A.width}px`,
        maxHeight: `${A.maxHeight}px`,
        visibility: "hidden"
      });
      const W = D.getBoundingClientRect(), U = Te({
        ...z,
        containingBlockOrigin: { left: W.left, top: W.top },
        panelHeight: W.height
      }), J = {
        position: "fixed",
        left: `${U.left}px`,
        top: `${U.top}px`,
        width: `${U.width}px`,
        maxHeight: `${U.maxHeight}px`,
        "--anchored-panel-available-height": `${U.maxHeight}px`,
        margin: "0",
        zIndex: String(r.zIndex),
        visibility: "visible"
      };
      j.value = J;
    }
    let P = null, H = !1;
    function R() {
      H || !r.open || (H = !0, requestAnimationFrame(() => {
        H = !1, r.open && E();
      }));
    }
    function N() {
      typeof ResizeObserver > "u" || (P = new ResizeObserver(R), k.value && P.observe(k.value), r.anchor && P.observe(r.anchor));
    }
    function B() {
      P?.disconnect(), P = null, H = !1;
    }
    ge(() => r.open, async (S) => {
      B(), S && (j.value = { position: "fixed", visibility: "hidden" }, await Ce(), E(), N());
    }, { immediate: !0 });
    function L(S) {
      if (!r.open) return;
      const D = S.composedPath();
      k.value && D.includes(k.value) || r.anchor && D.includes(r.anchor) || l("update:open", !1);
    }
    function T(S) {
      r.open && S.key === "Escape" && l("update:open", !1);
    }
    function K() {
      r.open && E();
    }
    return document.addEventListener("click", L), document.addEventListener("keydown", T), window.addEventListener("resize", K), window.addEventListener("scroll", K, !0), fe(() => {
      B(), document.removeEventListener("click", L), document.removeEventListener("keydown", T), window.removeEventListener("resize", K), window.removeEventListener("scroll", K, !0);
    }), (S, D) => e.open ? (v(), h("div", {
      key: 0,
      ref_key: "panel",
      ref: k,
      class: "anchored-panel",
      style: Xe(j.value)
    }, [
      Re(S.$slots, "default")
    ], 4)) : C("", !0);
  }
}), Se = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Ae = Object.keys(Se), Ie = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Ct({ detail: e }) {
  const u = w(!1), r = w(""), l = w(""), k = w([]), j = w(""), E = w([]), P = w([]), H = w(""), R = de(() => {
    const n = j.value.trim().toLowerCase();
    return n ? k.value.filter(
      (t) => (t.name || "").toLowerCase().includes(n) || (t.description || "").toLowerCase().includes(n)
    ) : k.value;
  });
  function N(n) {
    const t = n.toLowerCase();
    return t.includes("no implementation") || t.includes("no engine") || t.includes("contract unavailable") || t.includes("not found") && t.includes("binding");
  }
  async function B({ preserve: n = !1 } = {}) {
    u.value = !0, r.value = "", l.value = "";
    try {
      const { data: t } = await X.get("/api/v1/knowledge/list");
      if (!t?.success) {
        const d = t?.error || "failed to load knowledge bases";
        if (N(d))
          return n || (k.value = []), l.value = Ie, !1;
        throw new Error(d);
      }
      return k.value = t.items || [], I(), !0;
    } catch (t) {
      n || (k.value = []), n || I();
      const d = se(t, "could not load knowledge bases");
      return N(d) ? l.value = Ie : r.value = d, !1;
    } finally {
      u.value = !1;
    }
  }
  async function L() {
    try {
      const { data: n } = await X.get("/api/v1/knowledge/models");
      E.value = n?.success ? n.models || [] : [];
    } catch {
      E.value = [];
    }
  }
  async function T() {
    try {
      const { data: n } = await X.get("/api/v1/knowledge/engines");
      P.value = n?.success ? n.engines || [] : [];
    } catch {
      P.value = [];
    }
  }
  function K(n) {
    return P.value.find((t) => t.kb_type === n);
  }
  async function S() {
    H.value = "";
    try {
      const [n, t] = await Promise.all([
        X.get("/api/v1/knowledge/engines"),
        X.get("/api/v1/knowledge/models")
      ]);
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load knowledge engines.");
      if (!t.data?.success) throw new Error(t.data?.error || "Could not load embedding models.");
      P.value = n.data.engines || [], E.value = t.data.models || [];
    } catch (n) {
      P.value = [], E.value = [], H.value = se(n, "Could not load knowledge engines.");
    }
  }
  function D(n) {
    return !!n && typeof n == "object" && !Array.isArray(n);
  }
  function ee(n) {
    if (D(n)) return n;
    if (!(typeof n != "string" || !n))
      try {
        const t = JSON.parse(n);
        return D(t) ? t : void 0;
      } catch {
        return;
      }
  }
  function V(n, t) {
    if (!t) return;
    let d = n;
    for (const f of t.split(".")) {
      if (!D(d)) return;
      d = d[f];
    }
    return d;
  }
  function z(n, t) {
    if (!Array.isArray(t)) return [];
    const d = [];
    for (const f of t) {
      const $ = V(n, f.path), i = typeof $ == "number" ? $ : Number($ || 0);
      i < (f.min ?? 0) || d.push({ icon: f.icon, value: i, label: String(i === 1 ? f.singular : f.plural) });
    }
    return d;
  }
  function A(n, t) {
    return Object.prototype.hasOwnProperty.call(n, t);
  }
  function W(n, t) {
    return Ae.some((d) => A(n, d)) ? !0 : Array.isArray(t) ? t.some((d) => {
      const f = d.path || "";
      return f !== "" && A(n, f.split(".")[0]);
    }) : !1;
  }
  function U(n, t, d) {
    const f = String(t.kb_type || d || ""), $ = K(f), i = {
      kb_type: f || d,
      badge: $?.badge
    };
    for (const p of Ae) {
      const g = t[p];
      A(t, p) && typeof g == "number" && (i[p] = g);
    }
    return (W(t, $?.stats_spec) || A(t, "kb_type")) && (i.stat_items = z({ ...n, ...t }, $?.stats_spec)), i;
  }
  function J(n, t, d = []) {
    const f = {};
    typeof t.title == "string" && (f.name = t.title), typeof t.comment == "string" && (f.description = t.comment), typeof t.icon == "string" && (f.icon = t.icon), typeof t.status == "string" && (f.status = t.status), typeof t.auto_summary == "string" && (f.auto_summary = t.auto_summary), typeof t.auto_description == "string" && (f.auto_description = t.auto_description), typeof t.kb_type == "string" && (f.kb_type = t.kb_type), Object.assign(f, U(n, t, f.kb_type || n.kb_type));
    const $ = { ...n, ...f };
    for (const i of d) {
      const p = i === "title" ? "name" : i;
      delete $[p];
    }
    return $;
  }
  const q = /* @__PURE__ */ new Map(), te = /* @__PURE__ */ new Set();
  let ne = 0;
  const Y = w(null);
  function le(n, t) {
    const d = ee(t.meta) || {}, f = t.deleted || [];
    k.value = k.value.map(($) => $.id === n ? J($, d, f) : $), e.value?.id === n && (e.value = J(e.value, d, f));
  }
  function Q() {
    ne++, te.clear();
    for (const n of q.values()) n();
    q.clear(), Y.value?.(), Y.value = null;
  }
  function I() {
    const n = new Set(k.value.map((d) => d.id).filter(Boolean));
    for (const [d, f] of q)
      n.has(d) || (f(), q.delete(d));
    const t = ne;
    for (const d of n) {
      if (q.has(d) || te.has(d)) continue;
      te.add(d);
      const f = je(d, ($) => le(d, $), Se);
      if (te.delete(d), !!f) {
        if (t !== ne || !k.value.some(($) => $.id === d)) {
          f();
          continue;
        }
        q.set(d, f);
      }
    }
  }
  return ge(() => k.value.map((n) => n.id).join(`
`), () => I()), fe(Q), {
    loading: u,
    error: r,
    notice: l,
    kbs: k,
    query: j,
    filtered: R,
    models: E,
    engines: P,
    dialogLoadError: H,
    load: B,
    loadModels: L,
    loadEngines: T,
    engineFor: K,
    loadDialogCatalog: S,
    detailUnsub: Y,
    applyComponentMetaEvent: le,
    clearComponentSubscriptions: Q
  };
}
function $t({ detail: e, detailUnsub: u, kbs: r, engines: l, engineFor: k, applyComponentMetaEvent: j, route: E, navigate: P, loadEngines: H }) {
  const R = w(!1), N = w(""), B = w(null);
  let L = null, T = 0, K = 0;
  const S = de(() => e.value ? k(e.value.kb_type || "")?.manage_ui_id : void 0), D = de(() => (e.value ? k(e.value.kb_type || "")?.manage_views : void 0) || []), ee = de(() => D.value.length > 1), V = w(""), z = w("");
  let A = !1, W = 0;
  function U() {
    const i = e.value?.kb_type;
    return i ? `kx:kb:detail-view:${i}` : null;
  }
  ge(D, (i) => {
    if (!i.length) {
      V.value = "";
      return;
    }
    const p = i.map((_) => _.id);
    let g = "";
    try {
      const _ = U();
      g = _ && localStorage.getItem(_) || "";
    } catch {
    }
    const b = p.includes(g) ? g : p[0];
    b !== V.value && (V.value = b);
  }, { immediate: !0 });
  function J() {
    const i = { kb_id: e.value?.id, route: z.value };
    return V.value && (i.view = V.value), JSON.stringify(i);
  }
  function q(i) {
    if (i !== V.value) {
      V.value = i;
      try {
        const p = U();
        p && localStorage.setItem(p, i);
      } catch {
      }
      try {
        L?.setAttribute("config", J());
      } catch {
      }
    }
  }
  function te(i) {
    i.stopPropagation();
    const p = e.value?.id;
    if (!p || A) return;
    const g = typeof i.detail == "string" ? i.detail : i.detail?.path ?? i.detail?.route ?? "", b = String(g || "").replace(/^\/+/, "");
    z.value = b, Q(b ? `${p}/${b}` : p);
  }
  function ne(i) {
    i.stopPropagation();
  }
  function Y(i = !0) {
    i && K++, L && (L.removeEventListener("kb-changed", ne), L.removeEventListener("navigate", te), L.remove(), L = null);
  }
  async function le() {
    const i = ++K;
    Y(!1);
    const p = S.value, g = B.value, b = e.value?.id;
    if (!p || !g || !b) return;
    try {
      await ze(p, { timeoutMs: 8e3 });
    } catch {
    }
    if (i !== K || e.value?.id !== b || S.value !== p || B.value !== g) return;
    g.replaceChildren();
    const _ = document.createElement(p);
    try {
      _.setAttribute("config", J());
    } catch {
    }
    _.addEventListener("kb-changed", ne), _.addEventListener("navigate", te), g.appendChild(_), L = _;
  }
  function Q(i) {
    A || P(i);
  }
  function I(i, p) {
    return T === i && e.value?.id === p;
  }
  async function n(i, p = !0) {
    const g = ++T, b = i.id;
    e.value = { ...i }, u.value?.(), u.value = b ? je(b, (_) => j(b, _), Se) : null, N.value = "", R.value = !0, Y(), p && Q(b);
    try {
      const { data: _ } = await X.get(`/api/v1/knowledge/${b}`);
      if (!I(g, b)) return;
      _?.success ? e.value = { ...e.value, ..._ } : N.value = _?.error || "could not load knowledge base";
    } catch (_) {
      if (!I(g, b)) return;
      N.value = se(_, "could not load knowledge base");
    } finally {
      I(g, b) && (R.value = !1);
    }
    I(g, b) && (l.value.length || await H(), I(g, b) && (await Ce(), I(g, b) && await le()));
  }
  async function t() {
    const i = e.value?.id;
    if (!i) return;
    const p = ++T;
    N.value = "";
    try {
      const { data: g } = await X.get(`/api/v1/knowledge/${i}`);
      if (!I(p, i)) return;
      g?.success ? e.value = { ...e.value, ...g } : N.value = g?.error || "could not load knowledge base";
    } catch (g) {
      if (!I(p, i)) return;
      N.value = se(g, "could not load knowledge base");
    }
    if (I(p, i) && (await Ce(), !!I(p, i)))
      try {
        L?.setAttribute("config", J());
      } catch {
      }
  }
  function d() {
    const i = e.value?.id;
    if (!i || !z.value) {
      f();
      return;
    }
    const p = `/knowledge/${encodeURIComponent(i)}`, g = window.parent.history, b = g.state?.back;
    typeof b == "string" && (b === p || b.startsWith(p + "/")) ? g.back() : Q(i);
  }
  function f(i = !0) {
    T++, Y(), u.value?.(), u.value = null, e.value = null, z.value = "", i && Q("");
  }
  async function $(i) {
    const p = ++W, g = String(i || "").split("/").filter(Boolean), b = g[0] || "", _ = g.slice(1).join("/");
    A = !0;
    try {
      if (p !== W) return;
      if (!b)
        e.value && f(!1);
      else if (e.value?.id !== b) {
        z.value = _;
        const ke = r.value.find((ie) => ie.id === b);
        if (await n(ke || { id: b }, !1), p !== W) return;
      } else if (_ !== z.value) {
        z.value = _;
        try {
          L?.setAttribute("config", J());
        } catch {
        }
      }
    } finally {
      p === W && (A = !1);
    }
  }
  return ge(E, (i) => {
    $(i);
  }), fe(() => {
    Y(), u.value?.(), u.value = null;
  }), {
    detailLoading: R,
    detailError: N,
    detailHost: B,
    detailManageTag: S,
    detailViews: D,
    detailHasViews: ee,
    detailView: V,
    innerRoute: z,
    setDetailView: q,
    openDetail: n,
    refreshOpenDetail: t,
    closeDetail: f,
    backDetail: d,
    applyRoute: $,
    pushRoute: Q,
    unmountDetailWc: Y
  };
}
const Et = { class: "kx" }, St = {
  key: 0,
  class: "kx-notice",
  role: "status"
}, Mt = { class: "kx-head" }, Lt = { class: "kx-head-icon" }, Dt = { class: "kx-head-actions" }, Ot = { class: "kx-count" }, Ht = { class: "kx-search" }, Pt = {
  key: 0,
  class: "kx-err"
}, Nt = {
  key: 1,
  class: "kx-notice"
}, Kt = { class: "kx-body" }, Tt = {
  key: 0,
  class: "kx-loading"
}, At = {
  key: 1,
  class: "kx-empty"
}, It = { class: "kx-empty-ico" }, Rt = {
  key: 2,
  class: "kx-empty"
}, zt = {
  key: 3,
  class: "kx-grid"
}, jt = ["aria-label", "onClick", "onKeydown"], Bt = { class: "kx-card-head" }, Vt = { class: "kx-ficon" }, qt = { class: "kx-card-id" }, Wt = ["title"], Ut = {
  key: 0,
  class: "kx-card-meta"
}, Ft = { class: "kx-card-desc" }, Gt = {
  key: 0,
  class: "kx-stats"
}, Jt = ["title", "aria-label"], Yt = { class: "kx-bar" }, Qt = { class: "kx-bar-l" }, Xt = ["title"], Zt = {
  key: 1,
  class: "kx-summary"
}, en = { class: "kx-summary-pop-h" }, tn = {
  key: 0,
  class: "kx-summary-pop-sum"
}, nn = {
  key: 1,
  class: "kx-summary-pop-desc"
}, an = { class: "kx-bar-r" }, on = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, sn = ["aria-selected", "onClick"], ln = {
  key: 0,
  class: "kx-err"
}, rn = {
  key: 0,
  class: "kx-loading"
}, cn = { class: "kx-detail-meta" }, un = {
  key: 0,
  class: "kx-detail-desc"
}, dn = { class: "kx-stats" }, pn = {
  key: 0,
  class: "kx-stat"
}, vn = {
  key: 0,
  class: "kx-detail-summary"
}, gn = /* @__PURE__ */ Ee({
  __name: "knowledge",
  setup(e) {
    const u = (c) => (c ?? 0).toLocaleString();
    function r(c) {
      if (c === "neutral") return "secondary";
      if (c === "warning") return "warn";
      if (c === "info" || c === "success" || c === "danger") return c;
    }
    const l = w(null), k = Ct({ detail: l }), {
      loading: j,
      error: E,
      notice: P,
      kbs: H,
      query: R,
      filtered: N,
      models: B,
      engines: L,
      dialogLoadError: T,
      load: K,
      loadEngines: S,
      engineFor: D,
      loadDialogCatalog: ee,
      detailUnsub: V,
      applyComponentMetaEvent: z
    } = k, A = it(), W = st(), U = $t({
      detail: l,
      detailUnsub: V,
      kbs: H,
      engines: L,
      engineFor: D,
      applyComponentMetaEvent: z,
      route: de(() => A.value.route),
      navigate: (c) => W("navigate", c),
      loadEngines: S
    }), {
      detailLoading: J,
      detailError: q,
      detailHost: te,
      detailManageTag: ne,
      detailViews: Y,
      detailHasViews: le,
      detailView: Q,
      setDetailView: I,
      openDetail: n,
      refreshOpenDetail: t,
      closeDetail: d,
      backDetail: f,
      applyRoute: $
    } = U;
    function i(c) {
      l.value ? q.value = c : E.value = c;
    }
    const p = w(!1), g = w(null);
    async function b() {
      g.value = null, await ee(), p.value = !0;
    }
    async function _(c) {
      E.value = "", q.value = "", T.value = "", L.value.length || await S();
      try {
        const { data: a } = await X.get(`/api/v1/knowledge/${c.id}`);
        if (!a?.success) throw new Error(a?.error || "could not load knowledge base settings");
        g.value = {
          id: c.id,
          name: a.name ?? c.name,
          description: a.description ?? c.description,
          icon: a.icon ?? c.icon,
          kb_type: a.kb_type ?? c.kb_type,
          embedding_model: a.embedding_model,
          config: a.config && typeof a.config == "object" ? a.config : {}
        }, p.value = !0;
      } catch (a) {
        g.value = null, p.value = !1, i(se(a, "could not load knowledge base settings"));
      }
    }
    async function ke() {
      p.value = !1;
      const c = l.value?.id;
      if (await K(), c && g.value && g.value.id === c)
        try {
          const { data: a } = await X.get(`/api/v1/knowledge/${c}`);
          a?.success && l.value && l.value.id === c && (l.value = { ...l.value, ...a });
        } catch {
        }
      g.value = null;
    }
    const ie = w({}), we = w(""), Me = de(() => Object.keys(ie.value).length ? `Deleting ${Object.values(ie.value).join(", ")}: cleanup is in progress and continues in the background.` : we.value);
    let pe, _e = !1;
    function Le() {
      _e || pe !== void 0 || !Object.keys(ie.value).length || (pe = setTimeout(async () => {
        pe = void 0;
        const c = await K({ preserve: !0 });
        if (!_e) {
          if (c)
            for (const [a, s] of Object.entries(ie.value))
              H.value.some((M) => M.id === a) || (delete ie.value[a], we.value = `Deletion complete: ${s}.`);
          Le();
        }
      }, 1e3));
    }
    fe(() => {
      _e = !0, pe !== void 0 && clearTimeout(pe);
    });
    async function De(c) {
      if (await at.confirm({
        header: "Delete knowledge base",
        message: `Delete “${c.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        i(""), E.value = "";
        try {
          const { data: s } = await X.delete(`/api/v1/knowledge/${c.id}`);
          if (!s?.success) throw new Error(s?.error || "delete failed");
          we.value = "", s.in_progress === !0 && (ie.value[c.id] = c.name || "(untitled)", Le()), l.value?.id === c.id && d(), await K({ preserve: s.in_progress === !0 });
        } catch (s) {
          i(se(s, "delete failed"));
        }
      }
    }
    const re = w(!1), xe = w(null), ce = w(null);
    function Oe(c) {
      xe.value = c, re.value = !0;
    }
    function He() {
      re.value = !1, xe.value = null;
    }
    const ue = w(!1), Pe = w(null);
    function Ne(c) {
      c.key === "Escape" && re.value && He();
    }
    Ze(() => {
      window.addEventListener("keydown", Ne);
    }), fe(() => {
      window.removeEventListener("keydown", Ne);
    });
    async function Be() {
      const c = xe.value;
      if (!ce.value || !c) return;
      if (ce.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await ze("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const a = document.createElement("kickside-share");
      a.setAttribute("config", JSON.stringify({
        resource_id: c.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(c.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(c.id)}`,
        title: c.name || ""
      })), a.style.display = "block", a.addEventListener("close", He), ce.value.appendChild(a);
    }
    return ge([re, ce], async () => {
      re.value && ce.value && await Be();
    }), qe(async () => {
      try {
        await Promise.all([K(), S(), t()]), !l.value && A.value.route && await $(A.value.route);
      } catch (c) {
        E.value = se(c, "host API unavailable");
      }
    }), (c, a) => (v(), h("div", Et, [
      Me.value ? (v(), h("div", St, O(Me.value), 1)) : C("", !0),
      l.value ? (v(), h(oe, { key: 2 }, [
        y("div", Yt, [
          y("div", Qt, [
            y("button", {
              class: "kx-back",
              onClick: a[2] || (a[2] = (s) => o(f)())
            }, [
              m(o(x), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              a[16] || (a[16] = Z(" Back", -1))
            ]),
            y("h1", {
              class: "kx-title",
              title: l.value.name || "(untitled)"
            }, O(l.value.name || "(untitled)"), 9, Xt),
            l.value.badge ? (v(), ve(o($e), {
              key: 0,
              severity: r(l.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: F(() => [
                m(o(x), {
                  icon: l.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                Z(O(l.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : C("", !0),
            m(wt, {
              items: l.value.stat_items || []
            }, null, 8, ["items"]),
            l.value.auto_summary || l.value.auto_description ? (v(), h("span", Zt, [
              m(o(ae), {
                ref_key: "summaryAnchor",
                ref: Pe,
                severity: "secondary",
                outlined: "",
                class: G(["kx-summary-btn", { on: ue.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ue.value,
                onClick: a[3] || (a[3] = me((s) => ue.value = !ue.value, ["stop"]))
              }, {
                icon: F(({ class: s }) => [
                  m(o(x), {
                    icon: "tabler:sparkles",
                    class: G(s),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              m(xt, {
                open: ue.value,
                "onUpdate:open": a[5] || (a[5] = (s) => ue.value = s),
                anchor: Pe.value,
                width: 340
              }, {
                default: F(() => [
                  y("div", {
                    class: "kx-summary-pop",
                    onClick: a[4] || (a[4] = me(() => {
                    }, ["stop"]))
                  }, [
                    y("div", en, [
                      m(o(x), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      a[17] || (a[17] = y("span", null, "About this knowledge base", -1))
                    ]),
                    l.value.auto_summary ? (v(), h("p", tn, O(l.value.auto_summary), 1)) : C("", !0),
                    l.value.auto_description ? (v(), h("p", nn, O(l.value.auto_description), 1)) : C("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : C("", !0)
          ]),
          y("div", an, [
            o(le) ? (v(), h("div", on, [
              (v(!0), h(oe, null, be(o(Y), (s) => (v(), h("button", {
                key: s.id,
                class: G(["kx-viewseg-btn", { on: o(Q) === s.id }]),
                role: "tab",
                "aria-selected": o(Q) === s.id,
                onClick: (M) => o(I)(s.id)
              }, [
                s.icon ? (v(), ve(o(x), {
                  key: 0,
                  icon: s.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : C("", !0),
                Z(" " + O(s.label), 1)
              ], 10, sn))), 128))
            ])) : C("", !0),
            m(o(ae), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: a[6] || (a[6] = (s) => _(l.value))
            }, {
              icon: F(({ class: s }) => [
                m(o(x), {
                  icon: "tabler:pencil",
                  class: G(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            m(o(ae), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: a[7] || (a[7] = (s) => Oe(l.value))
            }, {
              icon: F(({ class: s }) => [
                m(o(x), {
                  icon: "tabler:share",
                  class: G(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            m(o(ae), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: a[8] || (a[8] = (s) => De(l.value))
            }, {
              icon: F(({ class: s }) => [
                m(o(x), {
                  icon: "tabler:trash",
                  class: G(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(q) ? (v(), h("div", ln, O(o(q)), 1)) : C("", !0),
        y("div", {
          class: G(["kx-body", { "kx-body-bleed": o(ne) }])
        }, [
          o(J) ? (v(), h("div", rn, [
            m(o(x), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            a[18] || (a[18] = Z(" Loading… ", -1))
          ])) : (v(), h(oe, { key: 1 }, [
            o(ne) ? C("", !0) : (v(), h(oe, { key: 0 }, [
              y("div", cn, [
                l.value.description ? (v(), h("div", un, O(l.value.description), 1)) : C("", !0),
                y("div", dn, [
                  l.value.embedding_model ? (v(), h("span", pn, [
                    m(o(x), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    Z(O(l.value.embedding_model), 1)
                  ])) : C("", !0)
                ])
              ]),
              l.value.auto_summary ? (v(), h("div", vn, [
                a[19] || (a[19] = y("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                Z(" " + O(l.value.auto_summary), 1)
              ])) : C("", !0)
            ], 64)),
            y("div", {
              ref_key: "detailHost",
              ref: te,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (v(), h(oe, { key: 1 }, [
        y("header", Mt, [
          y("div", Lt, [
            m(o(x), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          a[10] || (a[10] = y("div", { class: "kx-head-text" }, [
            y("h1", { class: "kx-head-title" }, "Knowledge"),
            y("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          y("div", Dt, [
            y("span", Ot, O(o(H).length) + " knowledge base" + O(o(H).length !== 1 ? "s" : ""), 1),
            y("div", Ht, [
              m(o(x), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              et(y("input", {
                "onUpdate:modelValue": a[0] || (a[0] = (s) => tt(R) ? R.value = s : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [nt, o(R)]
              ])
            ]),
            m(o(ae), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: b
            }, {
              icon: F(({ class: s }) => [
                m(o(x), {
                  icon: "tabler:plus",
                  class: G(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(E) ? (v(), h("div", Pt, O(o(E)), 1)) : C("", !0),
        o(P) ? (v(), h("div", Nt, [
          m(o(x), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          a[11] || (a[11] = y("span", null, [
            y("strong", null, "No knowledge engine installed."),
            Z(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : C("", !0),
        y("div", Kt, [
          o(j) && !o(H).length ? (v(), h("div", Tt, [
            m(o(x), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            a[12] || (a[12] = Z(" Loading… ", -1))
          ])) : o(H).length ? o(N).length ? (v(), h("div", zt, [
            (v(!0), h(oe, null, be(o(N), (s) => (v(), h("div", {
              key: s.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${s.name || "knowledge base"}`,
              onClick: (M) => o(n)(s),
              onKeydown: [
                Ke((M) => o(n)(s), ["enter"]),
                Ke(me((M) => o(n)(s), ["prevent"]), ["space"])
              ]
            }, [
              y("div", Bt, [
                y("span", Vt, [
                  m(o(x), {
                    icon: s.icon || s.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                y("div", qt, [
                  y("div", {
                    class: "kx-card-name",
                    title: s.name || "(untitled)"
                  }, O(s.name || "(untitled)"), 9, Wt),
                  s.badge ? (v(), h("div", Ut, [
                    m(o($e), {
                      severity: r(s.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: F(() => [
                        m(o(x), {
                          icon: s.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        Z(O(s.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : C("", !0)
                ]),
                y("div", {
                  class: "kx-card-actions",
                  onClick: a[1] || (a[1] = me(() => {
                  }, ["stop"]))
                }, [
                  m(o(ae), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${s.name}`,
                    onClick: (M) => _(s)
                  }, {
                    icon: F(({ class: M }) => [
                      m(o(x), {
                        icon: "tabler:pencil",
                        class: G(M),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  m(o(ae), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${s.name}`,
                    onClick: (M) => Oe(s)
                  }, {
                    icon: F(({ class: M }) => [
                      m(o(x), {
                        icon: "tabler:share",
                        class: G(M),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  m(o(ae), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${s.name}`,
                    onClick: (M) => De(s)
                  }, {
                    icon: F(({ class: M }) => [
                      m(o(x), {
                        icon: "tabler:trash",
                        class: G(M),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"])
                ])
              ]),
              y("div", Ft, O(s.description || "No description"), 1),
              s.stat_items && s.stat_items.length ? (v(), h("div", Gt, [
                (v(!0), h(oe, null, be(s.stat_items, (M, Ve) => (v(), h("span", {
                  key: Ve,
                  class: "kx-stat",
                  title: `${u(M.value)} ${M.label}`,
                  "aria-label": `${u(M.value)} ${M.label}`
                }, [
                  M.icon ? (v(), ve(o(x), {
                    key: 0,
                    icon: M.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : C("", !0),
                  Z(O(u(M.value)), 1)
                ], 8, Jt))), 128))
              ])) : C("", !0)
            ], 40, jt))), 128))
          ])) : (v(), h("div", Rt, [...a[15] || (a[15] = [
            y("div", { class: "kx-empty-title" }, "No matches", -1),
            y("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (v(), h("div", At, [
            y("div", It, [
              m(o(x), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            a[13] || (a[13] = y("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            a[14] || (a[14] = y("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            m(o(ae), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: b
            }, {
              icon: F(({ class: s }) => [
                m(o(x), {
                  icon: "tabler:plus",
                  class: G(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      m(Je, {
        open: p.value,
        api: o(X),
        engines: o(L),
        models: o(B),
        target: g.value,
        "load-error": o(T),
        onRetry: o(ee),
        onClose: a[9] || (a[9] = (s) => p.value = !1),
        onSaved: ke
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      re.value ? (v(), h("div", {
        key: 3,
        ref_key: "shareHost",
        ref: ce
      }, null, 512)) : C("", !0)
    ]));
  }
}), fn = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, yn = {
  wippy: fn
};
class hn extends We {
  static get wippyConfig() {
    return {
      propsSchema: yn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: lt
    };
  }
  static get vueConfig() {
    return { rootComponent: gn, plugins: [Ye] };
  }
}
ot(import.meta.url, hn);
//# sourceMappingURL=index.js.map
