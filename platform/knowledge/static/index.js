import { u as Ve, W as qe } from "./index-D52CRMw6.js";
import { B as We, s as Ue, f as Fe, e as ie, a as ne, _ as Ge, P as Je } from "./KbDialog.vue_vue_type_script_setup_true_lang-CICQRGnH.js";
import { openBlock as v, createElementBlock as m, mergeProps as ye, createBlock as pe, resolveDynamicComponent as Ye, createCommentVNode as C, renderSlot as Ie, createElementVNode as y, toDisplayString as D, defineComponent as $e, Fragment as ae, renderList as he, unref as i, createTextVNode as Y, ref as w, watch as ve, nextTick as xe, onBeforeUnmount as ge, normalizeStyle as Qe, computed as ue, onMounted as Xe, createVNode as h, withDirectives as Ze, isRef as et, vModelText as tt, withCtx as U, normalizeClass as F, withKeys as Ke, withModifiers as me } from "vue";
import { Icon as x } from "@iconify/vue";
import { api as Q, loadByTagName as ze, host as nt, define as at } from "@wippy-fe/proxy";
import { _ as ot } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { s as Re, u as it, a as st } from "./componentRealtime-Bs_cyDpl.js";
import { s as lt } from "./styles-BFEJ_PLH.js";
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
}, ut = We.extend({
  name: "tag",
  style: rt,
  classes: ct
}), dt = {
  name: "BaseTag",
  extends: Ue,
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
function fe(e) {
  "@babel/helpers - typeof";
  return fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(u) {
    return typeof u;
  } : function(u) {
    return u && typeof Symbol == "function" && u.constructor === Symbol && u !== Symbol.prototype ? "symbol" : typeof u;
  }, fe(e);
}
function pt(e, u, r) {
  return (u = vt(u)) in e ? Object.defineProperty(e, u, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[u] = r, e;
}
function vt(e) {
  var u = gt(e, "string");
  return fe(u) == "symbol" ? u : u + "";
}
function gt(e, u) {
  if (fe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var l = r.call(e, u);
    if (fe(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (u === "string" ? String : Number)(e);
}
var Ce = {
  name: "Tag",
  extends: dt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Fe(pt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, ft = ["data-p"];
function yt(e, u, r, l, k, z) {
  return v(), m("span", ye({
    class: e.cx("root"),
    "data-p": z.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (v(), pe(Ye(e.$slots.icon), ye({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (v(), m("span", ye({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : C("", !0), e.value != null || e.$slots.default ? Ie(e.$slots, "default", {
    key: 2
  }, function() {
    return [y("span", ye({
      class: e.cx("label")
    }, e.ptm("label")), D(e.value), 17)];
  }) : C("", !0)], 16, ft);
}
Ce.render = yt;
const mt = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, ht = {
  key: 0,
  "aria-hidden": "true"
}, bt = { class: "kx-stat" }, kt = /* @__PURE__ */ $e({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (u, r) => e.items.length ? (v(), m("span", mt, [
      (v(!0), m(ae, null, he(e.items, (l, k) => (v(), m(ae, { key: k }, [
        k ? (v(), m("span", ht, " · ")) : C("", !0),
        y("span", bt, [
          l.icon ? (v(), pe(i(x), {
            key: 0,
            icon: l.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : C("", !0),
          Y(D(l.value.toLocaleString()) + " " + D(l.label), 1)
        ])
      ], 64))), 128))
    ])) : C("", !0);
  }
}), wt = /* @__PURE__ */ ot(kt, [["__scopeId", "data-v-06c3e2f6"]]), _t = 2e3;
function Ne(e) {
  const u = e.margin ?? 8, r = e.gap ?? 4, l = Math.max(0, e.viewportWidth), k = Math.max(0, e.viewportHeight), z = Math.max(0, l - u * 2), $ = Math.min(Math.max(0, e.requestedWidth), z), H = e.align === "right" ? e.anchor.right - $ : e.anchor.left, O = Math.max(u, Math.min(H, l - u - $)), I = Math.max(0, k - e.anchor.bottom - r - u), P = Math.max(0, e.anchor.top - r - u), R = I < e.requestedMaxHeight && P > I ? "above" : "below", M = R === "above" ? P : I, N = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), M)), K = Math.min(Math.max(0, e.panelHeight ?? N), N), E = R === "above" ? e.anchor.top - r - K : e.anchor.bottom + r, L = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(O - L.left),
    width: Math.round($),
    maxHeight: N,
    side: R,
    top: Math.round(E - L.top)
  };
}
const xt = /* @__PURE__ */ $e({
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
    const r = e, l = u, k = w(null), z = w({ position: "fixed", visibility: "hidden" });
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
      }, T = Ne(B);
      Object.assign(L.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${T.width}px`,
        maxHeight: `${T.maxHeight}px`,
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
      z.value = G;
    }
    let H = null, O = !1;
    function I() {
      O || !r.open || (O = !0, requestAnimationFrame(() => {
        O = !1, r.open && $();
      }));
    }
    function P() {
      typeof ResizeObserver > "u" || (H = new ResizeObserver(I), k.value && H.observe(k.value), r.anchor && H.observe(r.anchor));
    }
    function R() {
      H?.disconnect(), H = null, O = !1;
    }
    ve(() => r.open, async (E) => {
      R(), E && (z.value = { position: "fixed", visibility: "hidden" }, await xe(), $(), P());
    }, { immediate: !0 });
    function M(E) {
      if (!r.open) return;
      const L = E.composedPath();
      k.value && L.includes(k.value) || r.anchor && L.includes(r.anchor) || l("update:open", !1);
    }
    function N(E) {
      r.open && E.key === "Escape" && l("update:open", !1);
    }
    function K() {
      r.open && $();
    }
    return document.addEventListener("click", M), document.addEventListener("keydown", N), window.addEventListener("resize", K), window.addEventListener("scroll", K, !0), ge(() => {
      R(), document.removeEventListener("click", M), document.removeEventListener("keydown", N), window.removeEventListener("resize", K), window.removeEventListener("scroll", K, !0);
    }), (E, L) => e.open ? (v(), m("div", {
      key: 0,
      ref_key: "panel",
      ref: k,
      class: "anchored-panel",
      style: Qe(z.value)
    }, [
      Ie(E.$slots, "default")
    ], 4)) : C("", !0);
  }
}), Ee = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Te = Object.keys(Ee), Ae = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Ct({ detail: e }) {
  const u = w(!1), r = w(""), l = w(""), k = w([]), z = w(""), $ = w([]), H = w([]), O = w(""), I = ue(() => {
    const a = z.value.trim().toLowerCase();
    return a ? k.value.filter(
      (n) => (n.name || "").toLowerCase().includes(a) || (n.description || "").toLowerCase().includes(a)
    ) : k.value;
  });
  function P(a) {
    const n = a.toLowerCase();
    return n.includes("no implementation") || n.includes("no engine") || n.includes("contract unavailable") || n.includes("not found") && n.includes("binding");
  }
  async function R({ preserve: a = !1 } = {}) {
    u.value = !0, r.value = "", l.value = "";
    try {
      const { data: n } = await Q.get("/api/v1/knowledge/list");
      if (!n?.success) {
        const d = n?.error || "failed to load knowledge bases";
        if (P(d))
          return a || (k.value = []), l.value = Ae, !1;
        throw new Error(d);
      }
      return k.value = n.items || [], A(), !0;
    } catch (n) {
      a || (k.value = []), a || A();
      const d = ie(n, "could not load knowledge bases");
      return P(d) ? l.value = Ae : r.value = d, !1;
    } finally {
      u.value = !1;
    }
  }
  async function M() {
    try {
      const { data: a } = await Q.get("/api/v1/knowledge/models");
      $.value = a?.success ? a.models || [] : [];
    } catch {
      $.value = [];
    }
  }
  async function N() {
    try {
      const { data: a } = await Q.get("/api/v1/knowledge/engines");
      H.value = a?.success ? a.engines || [] : [];
    } catch {
      H.value = [];
    }
  }
  function K(a) {
    return H.value.find((n) => n.kb_type === a);
  }
  async function E() {
    O.value = "";
    try {
      const [a, n] = await Promise.all([
        Q.get("/api/v1/knowledge/engines"),
        Q.get("/api/v1/knowledge/models")
      ]);
      if (!a.data?.success) throw new Error(a.data?.error || "Could not load knowledge engines.");
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load embedding models.");
      H.value = a.data.engines || [], $.value = n.data.models || [];
    } catch (a) {
      H.value = [], $.value = [], O.value = ie(a, "Could not load knowledge engines.");
    }
  }
  function L(a) {
    return !!a && typeof a == "object" && !Array.isArray(a);
  }
  function Z(a) {
    if (L(a)) return a;
    if (!(typeof a != "string" || !a))
      try {
        const n = JSON.parse(a);
        return L(n) ? n : void 0;
      } catch {
        return;
      }
  }
  function j(a, n) {
    if (!n) return;
    let d = a;
    for (const f of n.split(".")) {
      if (!L(d)) return;
      d = d[f];
    }
    return d;
  }
  function B(a, n) {
    if (!Array.isArray(n)) return [];
    const d = [];
    for (const f of n) {
      const t = j(a, f.path), p = typeof t == "number" ? t : Number(t || 0);
      p < (f.min ?? 0) || d.push({ icon: f.icon, value: p, label: String(p === 1 ? f.singular : f.plural) });
    }
    return d;
  }
  function T(a, n) {
    return Object.prototype.hasOwnProperty.call(a, n);
  }
  function q(a, n) {
    return Te.some((d) => T(a, d)) ? !0 : Array.isArray(n) ? n.some((d) => {
      const f = d.path || "";
      return f !== "" && T(a, f.split(".")[0]);
    }) : !1;
  }
  function W(a, n, d) {
    const f = String(n.kb_type || d || ""), t = K(f), p = {
      kb_type: f || d,
      badge: t?.badge
    };
    for (const g of Te) {
      const b = n[g];
      T(n, g) && typeof b == "number" && (p[g] = b);
    }
    return (q(n, t?.stats_spec) || T(n, "kb_type")) && (p.stat_items = B({ ...a, ...n }, t?.stats_spec)), p;
  }
  function G(a, n, d = []) {
    const f = {};
    typeof n.title == "string" && (f.name = n.title), typeof n.comment == "string" && (f.description = n.comment), typeof n.icon == "string" && (f.icon = n.icon), typeof n.status == "string" && (f.status = n.status), typeof n.auto_summary == "string" && (f.auto_summary = n.auto_summary), typeof n.auto_description == "string" && (f.auto_description = n.auto_description), typeof n.kb_type == "string" && (f.kb_type = n.kb_type), Object.assign(f, W(a, n, f.kb_type || a.kb_type));
    const t = { ...a, ...f };
    for (const p of d) {
      const g = p === "title" ? "name" : p;
      delete t[g];
    }
    return t;
  }
  const V = /* @__PURE__ */ new Map(), ee = /* @__PURE__ */ new Set();
  let te = 0;
  const J = w(null);
  function se(a, n) {
    const d = Z(n.meta) || {}, f = n.deleted || [];
    k.value = k.value.map((t) => t.id === a ? G(t, d, f) : t), e.value?.id === a && (e.value = G(e.value, d, f));
  }
  function X() {
    te++, ee.clear();
    for (const a of V.values()) a();
    V.clear(), J.value?.(), J.value = null;
  }
  function A() {
    const a = new Set(k.value.map((d) => d.id).filter(Boolean));
    for (const [d, f] of V)
      a.has(d) || (f(), V.delete(d));
    const n = te;
    for (const d of a) {
      if (V.has(d) || ee.has(d)) continue;
      ee.add(d);
      const f = Re(d, (t) => se(d, t), Ee);
      if (ee.delete(d), !!f) {
        if (n !== te || !k.value.some((t) => t.id === d)) {
          f();
          continue;
        }
        V.set(d, f);
      }
    }
  }
  return ve(() => k.value.map((a) => a.id).join(`
`), () => A()), ge(X), {
    loading: u,
    error: r,
    notice: l,
    kbs: k,
    query: z,
    filtered: I,
    models: $,
    engines: H,
    dialogLoadError: O,
    load: R,
    loadModels: M,
    loadEngines: N,
    engineFor: K,
    loadDialogCatalog: E,
    detailUnsub: J,
    applyComponentMetaEvent: se,
    clearComponentSubscriptions: X
  };
}
function $t({ detail: e, detailUnsub: u, kbs: r, engines: l, engineFor: k, applyComponentMetaEvent: z, route: $, navigate: H, loadEngines: O }) {
  const I = w(!1), P = w(""), R = w(null);
  let M = null, N = 0, K = 0;
  const E = ue(() => e.value ? k(e.value.kb_type || "")?.manage_ui_id : void 0), L = ue(() => (e.value ? k(e.value.kb_type || "")?.manage_views : void 0) || []), Z = ue(() => L.value.length > 1), j = w(""), B = w("");
  let T = !1, q = 0;
  function W() {
    const t = e.value?.kb_type;
    return t ? `kx:kb:detail-view:${t}` : null;
  }
  ve(L, (t) => {
    if (!t.length) {
      j.value = "";
      return;
    }
    const p = t.map((_) => _.id);
    let g = "";
    try {
      const _ = W();
      g = _ && localStorage.getItem(_) || "";
    } catch {
    }
    const b = p.includes(g) ? g : p[0];
    b !== j.value && (j.value = b);
  }, { immediate: !0 });
  function G() {
    const t = { kb_id: e.value?.id, route: B.value };
    return j.value && (t.view = j.value), JSON.stringify(t);
  }
  function V(t) {
    if (t !== j.value) {
      j.value = t;
      try {
        const p = W();
        p && localStorage.setItem(p, t);
      } catch {
      }
      try {
        M?.setAttribute("config", G());
      } catch {
      }
    }
  }
  function ee(t) {
    t.stopPropagation();
    const p = e.value?.id;
    if (!p || T) return;
    const g = typeof t.detail == "string" ? t.detail : t.detail?.path ?? t.detail?.route ?? "", b = String(g || "").replace(/^\/+/, "");
    B.value = b, X(b ? `${p}/${b}` : p);
  }
  function te(t) {
    t.stopPropagation();
  }
  function J(t = !0) {
    t && K++, M && (M.removeEventListener("kb-changed", te), M.removeEventListener("navigate", ee), M.remove(), M = null);
  }
  async function se() {
    const t = ++K;
    J(!1);
    const p = E.value, g = R.value, b = e.value?.id;
    if (!p || !g || !b) return;
    try {
      await ze(p, { timeoutMs: 8e3 });
    } catch {
    }
    if (t !== K || e.value?.id !== b || E.value !== p || R.value !== g) return;
    g.replaceChildren();
    const _ = document.createElement(p);
    try {
      _.setAttribute("config", G());
    } catch {
    }
    _.addEventListener("kb-changed", te), _.addEventListener("navigate", ee), g.appendChild(_), M = _;
  }
  function X(t) {
    T || H(t);
  }
  function A(t, p) {
    return N === t && e.value?.id === p;
  }
  async function a(t, p = !0) {
    const g = ++N, b = t.id;
    e.value = { ...t }, u.value?.(), u.value = b ? Re(b, (_) => z(b, _), Ee) : null, P.value = "", I.value = !0, J(), p && X(b);
    try {
      const { data: _ } = await Q.get(`/api/v1/knowledge/${b}`);
      if (!A(g, b)) return;
      _?.success ? e.value = { ...e.value, ..._ } : P.value = _?.error || "could not load knowledge base";
    } catch (_) {
      if (!A(g, b)) return;
      P.value = ie(_, "could not load knowledge base");
    } finally {
      A(g, b) && (I.value = !1);
    }
    A(g, b) && (l.value.length || await O(), A(g, b) && (await xe(), A(g, b) && await se()));
  }
  async function n() {
    const t = e.value?.id;
    if (!t) return;
    const p = ++N;
    P.value = "";
    try {
      const { data: g } = await Q.get(`/api/v1/knowledge/${t}`);
      if (!A(p, t)) return;
      g?.success ? e.value = { ...e.value, ...g } : P.value = g?.error || "could not load knowledge base";
    } catch (g) {
      if (!A(p, t)) return;
      P.value = ie(g, "could not load knowledge base");
    }
    if (A(p, t) && (await xe(), !!A(p, t)))
      try {
        M?.setAttribute("config", G());
      } catch {
      }
  }
  function d(t = !0) {
    N++, J(), u.value?.(), u.value = null, e.value = null, B.value = "", t && X("");
  }
  async function f(t) {
    const p = ++q, g = String(t || "").split("/").filter(Boolean), b = g[0] || "", _ = g.slice(1).join("/");
    T = !0;
    try {
      if (p !== q) return;
      if (!b)
        e.value && d(!1);
      else if (e.value?.id !== b) {
        B.value = _;
        const be = r.value.find((oe) => oe.id === b);
        if (await a(be || { id: b }, !1), p !== q) return;
      } else if (_ !== B.value) {
        B.value = _;
        try {
          M?.setAttribute("config", G());
        } catch {
        }
      }
    } finally {
      p === q && (T = !1);
    }
  }
  return ve($, (t) => {
    f(t);
  }), ge(() => {
    J(), u.value?.(), u.value = null;
  }), {
    detailLoading: I,
    detailError: P,
    detailHost: R,
    detailManageTag: E,
    detailViews: L,
    detailHasViews: Z,
    detailView: j,
    innerRoute: B,
    setDetailView: V,
    openDetail: a,
    refreshOpenDetail: n,
    closeDetail: d,
    applyRoute: f,
    pushRoute: X,
    unmountDetailWc: J
  };
}
const Et = { class: "kx" }, St = {
  key: 0,
  class: "kx-notice",
  role: "status"
}, Mt = { class: "kx-head" }, Lt = { class: "kx-head-icon" }, Dt = { class: "kx-head-actions" }, Ot = { class: "kx-count" }, Ht = { class: "kx-search" }, Pt = {
  key: 0,
  class: "kx-err"
}, Kt = {
  key: 1,
  class: "kx-notice"
}, Nt = { class: "kx-body" }, Tt = {
  key: 0,
  class: "kx-loading"
}, At = {
  key: 1,
  class: "kx-empty"
}, It = { class: "kx-empty-ico" }, zt = {
  key: 2,
  class: "kx-empty"
}, Rt = {
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
}, gn = /* @__PURE__ */ $e({
  __name: "knowledge",
  setup(e) {
    const u = (c) => (c ?? 0).toLocaleString();
    function r(c) {
      if (c === "neutral") return "secondary";
      if (c === "warning") return "warn";
      if (c === "info" || c === "success" || c === "danger") return c;
    }
    const l = w(null), k = Ct({ detail: l }), {
      loading: z,
      error: $,
      notice: H,
      kbs: O,
      query: I,
      filtered: P,
      models: R,
      engines: M,
      dialogLoadError: N,
      load: K,
      loadEngines: E,
      engineFor: L,
      loadDialogCatalog: Z,
      detailUnsub: j,
      applyComponentMetaEvent: B
    } = k, T = it(), q = st(), W = $t({
      detail: l,
      detailUnsub: j,
      kbs: O,
      engines: M,
      engineFor: L,
      applyComponentMetaEvent: B,
      route: ue(() => T.value.route),
      navigate: (c) => q("navigate", c),
      loadEngines: E
    }), {
      detailLoading: G,
      detailError: V,
      detailHost: ee,
      detailManageTag: te,
      detailViews: J,
      detailHasViews: se,
      detailView: X,
      setDetailView: A,
      openDetail: a,
      refreshOpenDetail: n,
      closeDetail: d,
      applyRoute: f
    } = W;
    function t(c) {
      l.value ? V.value = c : $.value = c;
    }
    const p = w(!1), g = w(null);
    async function b() {
      g.value = null, await Z(), p.value = !0;
    }
    async function _(c) {
      $.value = "", V.value = "", N.value = "", M.value.length || await E();
      try {
        const { data: o } = await Q.get(`/api/v1/knowledge/${c.id}`);
        if (!o?.success) throw new Error(o?.error || "could not load knowledge base settings");
        g.value = {
          id: c.id,
          name: o.name ?? c.name,
          description: o.description ?? c.description,
          icon: o.icon ?? c.icon,
          kb_type: o.kb_type ?? c.kb_type,
          embedding_model: o.embedding_model,
          config: o.config && typeof o.config == "object" ? o.config : {}
        }, p.value = !0;
      } catch (o) {
        g.value = null, p.value = !1, t(ie(o, "could not load knowledge base settings"));
      }
    }
    async function be() {
      p.value = !1;
      const c = l.value?.id;
      if (await K(), c && g.value && g.value.id === c)
        try {
          const { data: o } = await Q.get(`/api/v1/knowledge/${c}`);
          o?.success && l.value && l.value.id === c && (l.value = { ...l.value, ...o });
        } catch {
        }
      g.value = null;
    }
    const oe = w({}), ke = w(""), Se = ue(() => Object.keys(oe.value).length ? `Deleting ${Object.values(oe.value).join(", ")}: cleanup is in progress and continues in the background.` : ke.value);
    let de, we = !1;
    function Me() {
      we || de !== void 0 || !Object.keys(oe.value).length || (de = setTimeout(async () => {
        de = void 0;
        const c = await K({ preserve: !0 });
        if (!we) {
          if (c)
            for (const [o, s] of Object.entries(oe.value))
              O.value.some((S) => S.id === o) || (delete oe.value[o], ke.value = `Deletion complete: ${s}.`);
          Me();
        }
      }, 1e3));
    }
    ge(() => {
      we = !0, de !== void 0 && clearTimeout(de);
    });
    async function Le(c) {
      if (await nt.confirm({
        header: "Delete knowledge base",
        message: `Delete “${c.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        t(""), $.value = "";
        try {
          const { data: s } = await Q.delete(`/api/v1/knowledge/${c.id}`);
          if (!s?.success) throw new Error(s?.error || "delete failed");
          ke.value = "", s.in_progress === !0 && (oe.value[c.id] = c.name || "(untitled)", Me()), l.value?.id === c.id && d(), await K({ preserve: s.in_progress === !0 });
        } catch (s) {
          t(ie(s, "delete failed"));
        }
      }
    }
    const le = w(!1), _e = w(null), re = w(null);
    function De(c) {
      _e.value = c, le.value = !0;
    }
    function Oe() {
      le.value = !1, _e.value = null;
    }
    const ce = w(!1), He = w(null);
    function Pe(c) {
      c.key === "Escape" && le.value && Oe();
    }
    Xe(() => {
      window.addEventListener("keydown", Pe);
    }), ge(() => {
      window.removeEventListener("keydown", Pe);
    });
    async function je() {
      const c = _e.value;
      if (!re.value || !c) return;
      if (re.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await ze("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const o = document.createElement("kickside-share");
      o.setAttribute("config", JSON.stringify({
        resource_id: c.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(c.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(c.id)}`,
        title: c.name || ""
      })), o.style.display = "block", o.addEventListener("close", Oe), re.value.appendChild(o);
    }
    return ve([le, re], async () => {
      le.value && re.value && await je();
    }), Ve(async () => {
      try {
        await Promise.all([K(), E(), n()]), !l.value && T.value.route && await f(T.value.route);
      } catch (c) {
        $.value = ie(c, "host API unavailable");
      }
    }), (c, o) => (v(), m("div", Et, [
      Se.value ? (v(), m("div", St, D(Se.value), 1)) : C("", !0),
      l.value ? (v(), m(ae, { key: 2 }, [
        y("div", Yt, [
          y("div", Qt, [
            y("button", {
              class: "kx-back",
              onClick: o[2] || (o[2] = (s) => i(d)())
            }, [
              h(i(x), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              o[16] || (o[16] = Y(" Back", -1))
            ]),
            y("h1", {
              class: "kx-title",
              title: l.value.name || "(untitled)"
            }, D(l.value.name || "(untitled)"), 9, Xt),
            l.value.badge ? (v(), pe(i(Ce), {
              key: 0,
              severity: r(l.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: U(() => [
                h(i(x), {
                  icon: l.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                Y(D(l.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : C("", !0),
            h(wt, {
              items: l.value.stat_items || []
            }, null, 8, ["items"]),
            l.value.auto_summary || l.value.auto_description ? (v(), m("span", Zt, [
              h(i(ne), {
                ref_key: "summaryAnchor",
                ref: He,
                severity: "secondary",
                outlined: "",
                class: F(["kx-summary-btn", { on: ce.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ce.value,
                onClick: o[3] || (o[3] = me((s) => ce.value = !ce.value, ["stop"]))
              }, {
                icon: U(({ class: s }) => [
                  h(i(x), {
                    icon: "tabler:sparkles",
                    class: F(s),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              h(xt, {
                open: ce.value,
                "onUpdate:open": o[5] || (o[5] = (s) => ce.value = s),
                anchor: He.value,
                width: 340
              }, {
                default: U(() => [
                  y("div", {
                    class: "kx-summary-pop",
                    onClick: o[4] || (o[4] = me(() => {
                    }, ["stop"]))
                  }, [
                    y("div", en, [
                      h(i(x), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      o[17] || (o[17] = y("span", null, "About this knowledge base", -1))
                    ]),
                    l.value.auto_summary ? (v(), m("p", tn, D(l.value.auto_summary), 1)) : C("", !0),
                    l.value.auto_description ? (v(), m("p", nn, D(l.value.auto_description), 1)) : C("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : C("", !0)
          ]),
          y("div", an, [
            i(se) ? (v(), m("div", on, [
              (v(!0), m(ae, null, he(i(J), (s) => (v(), m("button", {
                key: s.id,
                class: F(["kx-viewseg-btn", { on: i(X) === s.id }]),
                role: "tab",
                "aria-selected": i(X) === s.id,
                onClick: (S) => i(A)(s.id)
              }, [
                s.icon ? (v(), pe(i(x), {
                  key: 0,
                  icon: s.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : C("", !0),
                Y(" " + D(s.label), 1)
              ], 10, sn))), 128))
            ])) : C("", !0),
            h(i(ne), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: o[6] || (o[6] = (s) => _(l.value))
            }, {
              icon: U(({ class: s }) => [
                h(i(x), {
                  icon: "tabler:pencil",
                  class: F(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(i(ne), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: o[7] || (o[7] = (s) => De(l.value))
            }, {
              icon: U(({ class: s }) => [
                h(i(x), {
                  icon: "tabler:share",
                  class: F(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(i(ne), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: o[8] || (o[8] = (s) => Le(l.value))
            }, {
              icon: U(({ class: s }) => [
                h(i(x), {
                  icon: "tabler:trash",
                  class: F(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        i(V) ? (v(), m("div", ln, D(i(V)), 1)) : C("", !0),
        y("div", {
          class: F(["kx-body", { "kx-body-bleed": i(te) }])
        }, [
          i(G) ? (v(), m("div", rn, [
            h(i(x), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            o[18] || (o[18] = Y(" Loading… ", -1))
          ])) : (v(), m(ae, { key: 1 }, [
            i(te) ? C("", !0) : (v(), m(ae, { key: 0 }, [
              y("div", cn, [
                l.value.description ? (v(), m("div", un, D(l.value.description), 1)) : C("", !0),
                y("div", dn, [
                  l.value.embedding_model ? (v(), m("span", pn, [
                    h(i(x), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    Y(D(l.value.embedding_model), 1)
                  ])) : C("", !0)
                ])
              ]),
              l.value.auto_summary ? (v(), m("div", vn, [
                o[19] || (o[19] = y("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                Y(" " + D(l.value.auto_summary), 1)
              ])) : C("", !0)
            ], 64)),
            y("div", {
              ref_key: "detailHost",
              ref: ee,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (v(), m(ae, { key: 1 }, [
        y("header", Mt, [
          y("div", Lt, [
            h(i(x), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          o[10] || (o[10] = y("div", { class: "kx-head-text" }, [
            y("h1", { class: "kx-head-title" }, "Knowledge"),
            y("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          y("div", Dt, [
            y("span", Ot, D(i(O).length) + " knowledge base" + D(i(O).length !== 1 ? "s" : ""), 1),
            y("div", Ht, [
              h(i(x), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Ze(y("input", {
                "onUpdate:modelValue": o[0] || (o[0] = (s) => et(I) ? I.value = s : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [tt, i(I)]
              ])
            ]),
            h(i(ne), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: b
            }, {
              icon: U(({ class: s }) => [
                h(i(x), {
                  icon: "tabler:plus",
                  class: F(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        i($) ? (v(), m("div", Pt, D(i($)), 1)) : C("", !0),
        i(H) ? (v(), m("div", Kt, [
          h(i(x), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          o[11] || (o[11] = y("span", null, [
            y("strong", null, "No knowledge engine installed."),
            Y(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : C("", !0),
        y("div", Nt, [
          i(z) && !i(O).length ? (v(), m("div", Tt, [
            h(i(x), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            o[12] || (o[12] = Y(" Loading… ", -1))
          ])) : i(O).length ? i(P).length ? (v(), m("div", Rt, [
            (v(!0), m(ae, null, he(i(P), (s) => (v(), m("div", {
              key: s.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${s.name || "knowledge base"}`,
              onClick: (S) => i(a)(s),
              onKeydown: [
                Ke((S) => i(a)(s), ["enter"]),
                Ke(me((S) => i(a)(s), ["prevent"]), ["space"])
              ]
            }, [
              y("div", Bt, [
                y("span", Vt, [
                  h(i(x), {
                    icon: s.icon || s.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                y("div", qt, [
                  y("div", {
                    class: "kx-card-name",
                    title: s.name || "(untitled)"
                  }, D(s.name || "(untitled)"), 9, Wt),
                  s.badge ? (v(), m("div", Ut, [
                    h(i(Ce), {
                      severity: r(s.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: U(() => [
                        h(i(x), {
                          icon: s.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        Y(D(s.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : C("", !0)
                ]),
                y("div", {
                  class: "kx-card-actions",
                  onClick: o[1] || (o[1] = me(() => {
                  }, ["stop"]))
                }, [
                  h(i(ne), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${s.name}`,
                    onClick: (S) => _(s)
                  }, {
                    icon: U(({ class: S }) => [
                      h(i(x), {
                        icon: "tabler:pencil",
                        class: F(S),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  h(i(ne), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${s.name}`,
                    onClick: (S) => De(s)
                  }, {
                    icon: U(({ class: S }) => [
                      h(i(x), {
                        icon: "tabler:share",
                        class: F(S),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  h(i(ne), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${s.name}`,
                    onClick: (S) => Le(s)
                  }, {
                    icon: U(({ class: S }) => [
                      h(i(x), {
                        icon: "tabler:trash",
                        class: F(S),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"])
                ])
              ]),
              y("div", Ft, D(s.description || "No description"), 1),
              s.stat_items && s.stat_items.length ? (v(), m("div", Gt, [
                (v(!0), m(ae, null, he(s.stat_items, (S, Be) => (v(), m("span", {
                  key: Be,
                  class: "kx-stat",
                  title: `${u(S.value)} ${S.label}`,
                  "aria-label": `${u(S.value)} ${S.label}`
                }, [
                  S.icon ? (v(), pe(i(x), {
                    key: 0,
                    icon: S.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : C("", !0),
                  Y(D(u(S.value)), 1)
                ], 8, Jt))), 128))
              ])) : C("", !0)
            ], 40, jt))), 128))
          ])) : (v(), m("div", zt, [...o[15] || (o[15] = [
            y("div", { class: "kx-empty-title" }, "No matches", -1),
            y("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (v(), m("div", At, [
            y("div", It, [
              h(i(x), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            o[13] || (o[13] = y("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            o[14] || (o[14] = y("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            h(i(ne), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: b
            }, {
              icon: U(({ class: s }) => [
                h(i(x), {
                  icon: "tabler:plus",
                  class: F(s),
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
        api: i(Q),
        engines: i(M),
        models: i(R),
        target: g.value,
        "load-error": i(N),
        onRetry: i(Z),
        onClose: o[9] || (o[9] = (s) => p.value = !1),
        onSaved: be
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (v(), m("div", {
        key: 3,
        ref_key: "shareHost",
        ref: re
      }, null, 512)) : C("", !0)
    ]));
  }
}), fn = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, yn = {
  wippy: fn
};
class mn extends qe {
  static get wippyConfig() {
    return {
      propsSchema: yn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: lt
    };
  }
  static get vueConfig() {
    return { rootComponent: gn, plugins: [Je] };
  }
}
at(import.meta.url, mn);
//# sourceMappingURL=index.js.map
