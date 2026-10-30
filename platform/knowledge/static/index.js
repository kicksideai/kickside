import { u as Ve, W as qe } from "./index-D52CRMw6.js";
import { B as We, s as Ue, f as Fe, e as le, a as te, _ as Je, P as Ge } from "./KbDialog.vue_vue_type_script_setup_true_lang-CICQRGnH.js";
import { openBlock as d, createElementBlock as g, mergeProps as ye, createBlock as ve, resolveDynamicComponent as Ye, createCommentVNode as C, renderSlot as Ie, createElementVNode as v, toDisplayString as D, defineComponent as Ee, Fragment as ne, renderList as he, unref as a, ref as w, watch as be, nextTick as Ce, onBeforeUnmount as ge, normalizeStyle as Qe, computed as de, onMounted as Xe, createVNode as h, withDirectives as Ze, isRef as et, vModelText as tt, withCtx as U, normalizeClass as F, createTextVNode as X, withKeys as Ke, withModifiers as me } from "vue";
import { Icon as x } from "@iconify/vue";
import { on as nt, api as Y, loadByTagName as Re, host as at, define as ot } from "@wippy-fe/proxy";
import { c as it, s as st, u as lt, a as rt } from "./componentRealtime-DGbE-Xic.js";
import { s as ct } from "./styles-Bn0s9kIq.js";
var ut = `
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
`, dt = {
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
}, pt = We.extend({
  name: "tag",
  style: ut,
  classes: dt
}), vt = {
  name: "BaseTag",
  extends: Ue,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: pt,
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
function gt(e, u, r) {
  return (u = ft(u)) in e ? Object.defineProperty(e, u, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[u] = r, e;
}
function ft(e) {
  var u = yt(e, "string");
  return fe(u) == "symbol" ? u : u + "";
}
function yt(e, u) {
  if (fe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var s = r.call(e, u);
    if (fe(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (u === "string" ? String : Number)(e);
}
var $e = {
  name: "Tag",
  extends: vt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Fe(gt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, mt = ["data-p"];
function ht(e, u, r, s, k, j) {
  return d(), g("span", ye({
    class: e.cx("root"),
    "data-p": j.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (d(), ve(Ye(e.$slots.icon), ye({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (d(), g("span", ye({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : C("", !0), e.value != null || e.$slots.default ? Ie(e.$slots, "default", {
    key: 2
  }, function() {
    return [v("span", ye({
      class: e.cx("label")
    }, e.ptm("label")), D(e.value), 17)];
  }) : C("", !0)], 16, mt);
}
$e.render = ht;
const bt = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, kt = {
  key: 0,
  "aria-hidden": "true"
}, wt = { class: "kx-header-stat" }, _t = { class: "kx-header-stat-label" }, xt = /* @__PURE__ */ Ee({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (u, r) => e.items.length ? (d(), g("span", bt, [
      (d(!0), g(ne, null, he(e.items, (s, k) => (d(), g(ne, { key: k }, [
        k ? (d(), g("span", kt, " · ")) : C("", !0),
        v("span", wt, [
          s.icon ? (d(), ve(a(x), {
            key: 0,
            icon: s.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : C("", !0),
          v("span", _t, D(s.value.toLocaleString()) + " " + D(s.label), 1)
        ])
      ], 64))), 128))
    ])) : C("", !0);
  }
}), Ct = 2e3;
function Te(e) {
  const u = e.margin ?? 8, r = e.gap ?? 4, s = Math.max(0, e.viewportWidth), k = Math.max(0, e.viewportHeight), j = Math.max(0, s - u * 2), $ = Math.min(Math.max(0, e.requestedWidth), j), O = e.align === "right" ? e.anchor.right - $ : e.anchor.left, H = Math.max(u, Math.min(O, s - u - $)), z = Math.max(0, k - e.anchor.bottom - r - u), N = Math.max(0, e.anchor.top - r - u), I = z < e.requestedMaxHeight && N > z ? "above" : "below", M = I === "above" ? N : z, T = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), M)), P = Math.min(Math.max(0, e.panelHeight ?? T), T), E = I === "above" ? e.anchor.top - r - P : e.anchor.bottom + r, L = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(H - L.left),
    width: Math.round($),
    maxHeight: T,
    side: I,
    top: Math.round(E - L.top)
  };
}
const $t = /* @__PURE__ */ Ee({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Ct }
  },
  emits: ["update:open"],
  setup(e, { emit: u }) {
    const r = e, s = u, k = w(null), j = w({ position: "fixed", visibility: "hidden" });
    function $() {
      const E = r.anchor, L = k.value;
      if (!E || !L) return;
      const Z = E.getBoundingClientRect(), B = r.width === "anchor" ? Math.max(r.minWidth, Z.width) : Math.max(r.minWidth, r.width), R = {
        anchor: Z,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: B,
        requestedMaxHeight: r.maxHeight,
        align: r.align,
        gap: r.gap
      }, A = Te(R);
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
      const q = L.getBoundingClientRect(), W = Te({
        ...R,
        containingBlockOrigin: { left: q.left, top: q.top },
        panelHeight: q.height
      }), J = {
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
      j.value = J;
    }
    let O = null, H = !1;
    function z() {
      H || !r.open || (H = !0, requestAnimationFrame(() => {
        H = !1, r.open && $();
      }));
    }
    function N() {
      typeof ResizeObserver > "u" || (O = new ResizeObserver(z), k.value && O.observe(k.value), r.anchor && O.observe(r.anchor));
    }
    function I() {
      O?.disconnect(), O = null, H = !1;
    }
    be(() => r.open, async (E) => {
      I(), E && (j.value = { position: "fixed", visibility: "hidden" }, await Ce(), $(), N());
    }, { immediate: !0 });
    function M(E) {
      if (!r.open) return;
      const L = E.composedPath();
      k.value && L.includes(k.value) || r.anchor && L.includes(r.anchor) || s("update:open", !1);
    }
    function T(E) {
      r.open && E.key === "Escape" && s("update:open", !1);
    }
    function P() {
      r.open && $();
    }
    return document.addEventListener("click", M), document.addEventListener("keydown", T), window.addEventListener("resize", P), window.addEventListener("scroll", P, !0), ge(() => {
      I(), document.removeEventListener("click", M), document.removeEventListener("keydown", T), window.removeEventListener("resize", P), window.removeEventListener("scroll", P, !0);
    }), (E, L) => e.open ? (d(), g("div", {
      key: 0,
      ref_key: "panel",
      ref: k,
      class: "anchored-panel",
      style: Qe(j.value)
    }, [
      Ie(E.$slots, "default")
    ], 4)) : C("", !0);
  }
}), Se = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Ae = Object.keys(Se), ze = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Et({ detail: e }) {
  const u = w(!1), r = w(""), s = w(""), k = w([]), j = w(""), $ = w([]), O = w([]), H = w(""), z = de(() => {
    const i = j.value.trim().toLowerCase();
    return i ? k.value.filter(
      (t) => (t.name || "").toLowerCase().includes(i) || (t.description || "").toLowerCase().includes(i)
    ) : k.value;
  });
  function N(i) {
    const t = i.toLowerCase();
    return t.includes("no implementation") || t.includes("no engine") || t.includes("contract unavailable") || t.includes("not found") && t.includes("binding");
  }
  async function I({ preserve: i = !1 } = {}) {
    u.value = !0, r.value = "", s.value = "";
    try {
      const { data: t } = await Y.get("/api/v1/knowledge/list");
      if (!t?.success) {
        const p = t?.error || "failed to load knowledge bases";
        if (N(p))
          return i || (k.value = []), s.value = ze, !1;
        throw new Error(p);
      }
      return k.value = t.items || [], !0;
    } catch (t) {
      i || (k.value = []);
      const p = le(t, "could not load knowledge bases");
      return N(p) ? s.value = ze : r.value = p, !1;
    } finally {
      u.value = !1;
    }
  }
  async function M() {
    try {
      const { data: i } = await Y.get("/api/v1/knowledge/models");
      $.value = i?.success ? i.models || [] : [];
    } catch {
      $.value = [];
    }
  }
  async function T() {
    try {
      const { data: i } = await Y.get("/api/v1/knowledge/engines");
      O.value = i?.success ? i.engines || [] : [];
    } catch {
      O.value = [];
    }
  }
  function P(i) {
    return O.value.find((t) => t.kb_type === i);
  }
  async function E() {
    H.value = "";
    try {
      const [i, t] = await Promise.all([
        Y.get("/api/v1/knowledge/engines"),
        Y.get("/api/v1/knowledge/models")
      ]);
      if (!i.data?.success) throw new Error(i.data?.error || "Could not load knowledge engines.");
      if (!t.data?.success) throw new Error(t.data?.error || "Could not load embedding models.");
      O.value = i.data.engines || [], $.value = t.data.models || [];
    } catch (i) {
      O.value = [], $.value = [], H.value = le(i, "Could not load knowledge engines.");
    }
  }
  function L(i) {
    return !!i && typeof i == "object" && !Array.isArray(i);
  }
  function Z(i) {
    if (L(i)) return i;
    if (!(typeof i != "string" || !i))
      try {
        const t = JSON.parse(i);
        return L(t) ? t : void 0;
      } catch {
        return;
      }
  }
  function B(i, t) {
    if (!t) return;
    let p = i;
    for (const f of t.split(".")) {
      if (!L(p)) return;
      p = p[f];
    }
    return p;
  }
  function R(i, t) {
    if (!Array.isArray(t)) return [];
    const p = [];
    for (const f of t) {
      const K = B(i, f.path), V = typeof K == "number" ? K : Number(K || 0);
      V < (f.min ?? 0) || p.push({ icon: f.icon, value: V, label: String(V === 1 ? f.singular : f.plural) });
    }
    return p;
  }
  function A(i, t) {
    return Object.prototype.hasOwnProperty.call(i, t);
  }
  function q(i, t) {
    return Ae.some((p) => A(i, p)) ? !0 : Array.isArray(t) ? t.some((p) => {
      const f = p.path || "";
      return f !== "" && A(i, f.split(".")[0]);
    }) : !1;
  }
  function W(i, t, p) {
    const f = String(t.kb_type || p || ""), K = P(f), V = {
      kb_type: f || p,
      badge: K?.badge
    };
    for (const G of Ae) {
      const se = t[G];
      A(t, G) && typeof se == "number" && (V[G] = se);
    }
    return (q(t, K?.stats_spec) || A(t, "kb_type")) && (V.stat_items = R({ ...i, ...t }, K?.stats_spec)), V;
  }
  function J(i, t, p = []) {
    const f = {};
    typeof t.title == "string" && (f.name = t.title), typeof t.comment == "string" && (f.description = t.comment), typeof t.icon == "string" && (f.icon = t.icon), typeof t.status == "string" && (f.status = t.status), typeof t.auto_summary == "string" && (f.auto_summary = t.auto_summary), typeof t.auto_description == "string" && (f.auto_description = t.auto_description), typeof t.kb_type == "string" && (f.kb_type = t.kb_type), Object.assign(f, W(i, t, f.kb_type || i.kb_type));
    const K = { ...i, ...f };
    for (const V of p) {
      const G = V === "title" ? "name" : V;
      delete K[G];
    }
    return K;
  }
  const Q = w(null);
  function ie(i, t) {
    const p = Z(t.meta) || {}, f = t.deleted || [];
    k.value = k.value.map((K) => K.id === i ? J(K, p, f) : K), e.value?.id === i && (e.value = J(e.value, p, f));
  }
  function ae() {
    ee?.(), Q.value?.(), Q.value = null;
  }
  const ee = nt("@message", (i) => {
    const t = it(i, void 0, Se);
    if (!t) return;
    const p = k.value.some((f) => f.id === t.component_id);
    ie(t.component_id, t), !p && typeof t.meta.kb_type == "string" && t.meta.kb_type && I({ preserve: !0 });
  });
  return ge(ae), {
    loading: u,
    error: r,
    notice: s,
    kbs: k,
    query: j,
    filtered: z,
    models: $,
    engines: O,
    dialogLoadError: H,
    load: I,
    loadModels: M,
    loadEngines: T,
    engineFor: P,
    loadDialogCatalog: E,
    detailUnsub: Q,
    applyComponentMetaEvent: ie,
    clearComponentSubscriptions: ae
  };
}
function St({ detail: e, detailUnsub: u, kbs: r, engines: s, engineFor: k, applyComponentMetaEvent: j, route: $, navigate: O, loadEngines: H }) {
  const z = w(!1), N = w(""), I = w(null);
  let M = null, T = 0, P = 0;
  const E = de(() => e.value ? k(e.value.kb_type || "")?.manage_ui_id : void 0), L = de(() => (e.value ? k(e.value.kb_type || "")?.manage_views : void 0) || []), Z = de(() => L.value.length > 1), B = w(""), R = w("");
  let A = !1, q = 0;
  function W() {
    const l = e.value?.kb_type;
    return l ? `kx:kb:detail-view:${l}` : null;
  }
  be(L, (l) => {
    if (!l.length) {
      B.value = "";
      return;
    }
    const y = l.map((_) => _.id);
    let m = "";
    try {
      const _ = W();
      m = _ && localStorage.getItem(_) || "";
    } catch {
    }
    const b = y.includes(m) ? m : y[0];
    b !== B.value && (B.value = b);
  }, { immediate: !0 });
  function J() {
    const l = { kb_id: e.value?.id, route: R.value };
    return B.value && (l.view = B.value), JSON.stringify(l);
  }
  function Q(l) {
    if (l !== B.value) {
      B.value = l;
      try {
        const y = W();
        y && localStorage.setItem(y, l);
      } catch {
      }
      try {
        M?.setAttribute("config", J());
      } catch {
      }
    }
  }
  function ie(l) {
    l.stopPropagation();
    const y = e.value?.id;
    if (!y || A) return;
    const m = typeof l.detail == "string" ? l.detail : l.detail?.path ?? l.detail?.route ?? "", b = String(m || "").replace(/^\/+/, "");
    R.value = b, t(b ? `${y}/${b}` : y);
  }
  function ae(l) {
    l.stopPropagation();
  }
  function ee(l = !0) {
    l && P++, M && (M.removeEventListener("kb-changed", ae), M.removeEventListener("navigate", ie), M.remove(), M = null);
  }
  async function i() {
    const l = ++P;
    ee(!1);
    const y = E.value, m = I.value, b = e.value?.id;
    if (!y || !m || !b) return;
    try {
      await Re(y, { timeoutMs: 8e3 });
    } catch {
    }
    if (l !== P || e.value?.id !== b || E.value !== y || I.value !== m) return;
    m.replaceChildren();
    const _ = document.createElement(y);
    try {
      _.setAttribute("config", J());
    } catch {
    }
    _.addEventListener("kb-changed", ae), _.addEventListener("navigate", ie), m.appendChild(_), M = _;
  }
  function t(l) {
    A || O(l);
  }
  function p(l, y) {
    return T === l && e.value?.id === y;
  }
  async function f(l, y = !0) {
    const m = ++T, b = l.id;
    e.value = { ...l }, u.value?.(), u.value = b ? st(b, (_) => j(b, _), Se) : null, N.value = "", z.value = !0, ee(), y && t(b);
    try {
      const { data: _ } = await Y.get(`/api/v1/knowledge/${b}`);
      if (!p(m, b)) return;
      _?.success ? e.value = { ...e.value, ..._ } : N.value = _?.error || "could not load knowledge base";
    } catch (_) {
      if (!p(m, b)) return;
      N.value = le(_, "could not load knowledge base");
    } finally {
      p(m, b) && (z.value = !1);
    }
    p(m, b) && (s.value.length || await H(), p(m, b) && (await Ce(), p(m, b) && await i()));
  }
  async function K() {
    const l = e.value?.id;
    if (!l) return;
    const y = ++T;
    N.value = "";
    try {
      const { data: m } = await Y.get(`/api/v1/knowledge/${l}`);
      if (!p(y, l)) return;
      m?.success ? e.value = { ...e.value, ...m } : N.value = m?.error || "could not load knowledge base";
    } catch (m) {
      if (!p(y, l)) return;
      N.value = le(m, "could not load knowledge base");
    }
    if (p(y, l) && (await Ce(), !!p(y, l)))
      try {
        M?.setAttribute("config", J());
      } catch {
      }
  }
  function V() {
    const l = e.value?.id;
    if (!l || !R.value) {
      G();
      return;
    }
    O({ path: l, back: { within: l } });
  }
  function G(l = !0) {
    T++, ee(), u.value?.(), u.value = null, e.value = null, R.value = "", l && t("");
  }
  async function se(l) {
    const y = ++q, m = String(l || "").split("/").filter(Boolean), b = m[0] || "", _ = m.slice(1).join("/");
    A = !0;
    try {
      if (y !== q) return;
      if (!b)
        e.value && G(!1);
      else if (e.value?.id !== b) {
        R.value = _;
        const ke = r.value.find((oe) => oe.id === b);
        if (await f(ke || { id: b }, !1), y !== q) return;
      } else if (_ !== R.value) {
        R.value = _;
        try {
          M?.setAttribute("config", J());
        } catch {
        }
      }
    } finally {
      y === q && (A = !1);
    }
  }
  return be($, (l) => {
    se(l);
  }), ge(() => {
    ee(), u.value?.(), u.value = null;
  }), {
    detailLoading: z,
    detailError: N,
    detailHost: I,
    detailManageTag: E,
    detailViews: L,
    detailHasViews: Z,
    detailView: B,
    innerRoute: R,
    setDetailView: Q,
    openDetail: f,
    refreshOpenDetail: K,
    closeDetail: G,
    backDetail: V,
    applyRoute: se,
    pushRoute: t,
    unmountDetailWc: ee
  };
}
const Mt = { class: "kx" }, Lt = {
  key: 0,
  class: "kx-notice",
  role: "status"
}, Dt = { class: "kx-head" }, Ot = { class: "kx-head-icon" }, Ht = { class: "kx-head-actions" }, Nt = { class: "kx-count" }, Pt = { class: "kx-search" }, Kt = {
  key: 0,
  class: "kx-err"
}, Tt = {
  key: 1,
  class: "kx-notice"
}, At = { class: "kx-body" }, zt = {
  key: 0,
  class: "kx-loading"
}, It = {
  key: 1,
  class: "kx-empty"
}, Rt = { class: "kx-empty-ico" }, jt = {
  key: 2,
  class: "kx-empty"
}, Bt = {
  key: 3,
  class: "kx-grid"
}, Vt = ["aria-label", "onClick", "onKeydown"], qt = { class: "kx-card-head" }, Wt = { class: "kx-ficon" }, Ut = { class: "kx-card-id" }, Ft = ["title"], Jt = {
  key: 0,
  class: "kx-card-meta"
}, Gt = { class: "kx-card-desc" }, Yt = {
  key: 0,
  class: "kx-stats"
}, Qt = ["title", "aria-label"], Xt = { class: "kx-bar" }, Zt = { class: "kx-bar-l" }, en = ["title"], tn = {
  key: 1,
  class: "kx-summary"
}, nn = { class: "kx-summary-pop-h" }, an = {
  key: 0,
  class: "kx-summary-pop-sum"
}, on = {
  key: 1,
  class: "kx-summary-pop-desc"
}, sn = { class: "kx-bar-r" }, ln = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, rn = ["aria-selected", "onClick"], cn = {
  key: 0,
  class: "kx-err"
}, un = {
  key: 0,
  class: "kx-loading"
}, dn = { class: "kx-detail-meta" }, pn = {
  key: 0,
  class: "kx-detail-desc"
}, vn = { class: "kx-stats" }, gn = {
  key: 0,
  class: "kx-stat"
}, fn = {
  key: 0,
  class: "kx-detail-summary"
}, yn = /* @__PURE__ */ Ee({
  __name: "knowledge",
  setup(e) {
    const u = (c) => (c ?? 0).toLocaleString();
    function r(c) {
      if (c === "neutral") return "secondary";
      if (c === "warning") return "warn";
      if (c === "info" || c === "success" || c === "danger") return c;
    }
    const s = w(null), k = Et({ detail: s }), {
      loading: j,
      error: $,
      notice: O,
      kbs: H,
      query: z,
      filtered: N,
      models: I,
      engines: M,
      dialogLoadError: T,
      load: P,
      loadEngines: E,
      engineFor: L,
      loadDialogCatalog: Z,
      detailUnsub: B,
      applyComponentMetaEvent: R
    } = k, A = lt(), q = rt(), W = St({
      detail: s,
      detailUnsub: B,
      kbs: H,
      engines: M,
      engineFor: L,
      applyComponentMetaEvent: R,
      route: de(() => A.value.route),
      navigate: (c) => q("navigate", c),
      loadEngines: E
    }), {
      detailLoading: J,
      detailError: Q,
      detailHost: ie,
      detailManageTag: ae,
      detailViews: ee,
      detailHasViews: i,
      detailView: t,
      setDetailView: p,
      openDetail: f,
      refreshOpenDetail: K,
      closeDetail: V,
      backDetail: G,
      applyRoute: se
    } = W;
    function l(c) {
      s.value ? Q.value = c : $.value = c;
    }
    const y = w(!1), m = w(null);
    async function b() {
      m.value = null, await Z(), y.value = !0;
    }
    async function _(c) {
      $.value = "", Q.value = "", T.value = "", M.value.length || await E();
      try {
        const { data: n } = await Y.get(`/api/v1/knowledge/${c.id}`);
        if (!n?.success) throw new Error(n?.error || "could not load knowledge base settings");
        m.value = {
          id: c.id,
          name: n.name ?? c.name,
          description: n.description ?? c.description,
          icon: n.icon ?? c.icon,
          kb_type: n.kb_type ?? c.kb_type,
          embedding_model: n.embedding_model,
          config: n.config && typeof n.config == "object" ? n.config : {}
        }, y.value = !0;
      } catch (n) {
        m.value = null, y.value = !1, l(le(n, "could not load knowledge base settings"));
      }
    }
    async function ke() {
      y.value = !1;
      const c = s.value?.id;
      if (await P(), c && m.value && m.value.id === c)
        try {
          const { data: n } = await Y.get(`/api/v1/knowledge/${c}`);
          n?.success && s.value && s.value.id === c && (s.value = { ...s.value, ...n });
        } catch {
        }
      m.value = null;
    }
    const oe = w({}), we = w(""), Me = de(() => Object.keys(oe.value).length ? `Deleting ${Object.values(oe.value).join(", ")}: cleanup is in progress and continues in the background.` : we.value);
    let pe, _e = !1;
    function Le() {
      _e || pe !== void 0 || !Object.keys(oe.value).length || (pe = setTimeout(async () => {
        pe = void 0;
        const c = await P({ preserve: !0 });
        if (!_e) {
          if (c)
            for (const [n, o] of Object.entries(oe.value))
              H.value.some((S) => S.id === n) || (delete oe.value[n], we.value = `Deletion complete: ${o}.`);
          Le();
        }
      }, 1e3));
    }
    ge(() => {
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
        l(""), $.value = "";
        try {
          const { data: o } = await Y.delete(`/api/v1/knowledge/${c.id}`);
          if (!o?.success) throw new Error(o?.error || "delete failed");
          we.value = "", o.in_progress === !0 && (oe.value[c.id] = c.name || "(untitled)", Le()), s.value?.id === c.id && V(), await P({ preserve: o.in_progress === !0 });
        } catch (o) {
          l(le(o, "delete failed"));
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
    const ue = w(!1), Ne = w(null);
    function Pe(c) {
      c.key === "Escape" && re.value && He();
    }
    Xe(() => {
      window.addEventListener("keydown", Pe);
    }), ge(() => {
      window.removeEventListener("keydown", Pe);
    });
    async function je() {
      const c = xe.value;
      if (!ce.value || !c) return;
      if (ce.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Re("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const n = document.createElement("kickside-share");
      n.setAttribute("config", JSON.stringify({
        resource_id: c.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(c.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(c.id)}`,
        title: c.name || ""
      })), n.style.display = "block", n.addEventListener("close", He), ce.value.appendChild(n);
    }
    return be([re, ce], async () => {
      re.value && ce.value && await je();
    }), Ve(async () => {
      try {
        await Promise.all([P(), E(), K()]), !s.value && A.value.route && await se(A.value.route);
      } catch (c) {
        $.value = le(c, "host API unavailable");
      }
    }), (c, n) => (d(), g("div", Mt, [
      Me.value ? (d(), g("div", Lt, D(Me.value), 1)) : C("", !0),
      s.value ? (d(), g(ne, { key: 2 }, [
        v("div", Xt, [
          v("div", Zt, [
            v("button", {
              class: "kx-back",
              onClick: n[2] || (n[2] = (o) => a(G)())
            }, [
              h(a(x), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              n[16] || (n[16] = X(" Back", -1))
            ]),
            v("h1", {
              class: "kx-title",
              title: s.value.name || "(untitled)"
            }, D(s.value.name || "(untitled)"), 9, en),
            s.value.badge ? (d(), ve(a($e), {
              key: 0,
              severity: r(s.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: U(() => [
                h(a(x), {
                  icon: s.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                X(D(s.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : C("", !0),
            h(xt, {
              items: s.value.stat_items || []
            }, null, 8, ["items"]),
            s.value.auto_summary || s.value.auto_description ? (d(), g("span", tn, [
              h(a(te), {
                ref_key: "summaryAnchor",
                ref: Ne,
                severity: "secondary",
                outlined: "",
                class: F(["kx-summary-btn", { on: ue.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ue.value,
                onClick: n[3] || (n[3] = me((o) => ue.value = !ue.value, ["stop"]))
              }, {
                icon: U(({ class: o }) => [
                  h(a(x), {
                    icon: "tabler:sparkles",
                    class: F(o),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              h($t, {
                open: ue.value,
                "onUpdate:open": n[5] || (n[5] = (o) => ue.value = o),
                anchor: Ne.value,
                width: 340
              }, {
                default: U(() => [
                  v("div", {
                    class: "kx-summary-pop",
                    onClick: n[4] || (n[4] = me(() => {
                    }, ["stop"]))
                  }, [
                    v("div", nn, [
                      h(a(x), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      n[17] || (n[17] = v("span", null, "About this knowledge base", -1))
                    ]),
                    s.value.auto_summary ? (d(), g("p", an, D(s.value.auto_summary), 1)) : C("", !0),
                    s.value.auto_description ? (d(), g("p", on, D(s.value.auto_description), 1)) : C("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : C("", !0)
          ]),
          v("div", sn, [
            a(i) ? (d(), g("div", ln, [
              (d(!0), g(ne, null, he(a(ee), (o) => (d(), g("button", {
                key: o.id,
                class: F(["kx-viewseg-btn", { on: a(t) === o.id }]),
                role: "tab",
                "aria-selected": a(t) === o.id,
                onClick: (S) => a(p)(o.id)
              }, [
                o.icon ? (d(), ve(a(x), {
                  key: 0,
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : C("", !0),
                X(" " + D(o.label), 1)
              ], 10, rn))), 128))
            ])) : C("", !0),
            h(a(te), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: n[6] || (n[6] = (o) => _(s.value))
            }, {
              icon: U(({ class: o }) => [
                h(a(x), {
                  icon: "tabler:pencil",
                  class: F(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(a(te), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: n[7] || (n[7] = (o) => Oe(s.value))
            }, {
              icon: U(({ class: o }) => [
                h(a(x), {
                  icon: "tabler:share",
                  class: F(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(a(te), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: n[8] || (n[8] = (o) => De(s.value))
            }, {
              icon: U(({ class: o }) => [
                h(a(x), {
                  icon: "tabler:trash",
                  class: F(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(Q) ? (d(), g("div", cn, D(a(Q)), 1)) : C("", !0),
        v("div", {
          class: F(["kx-body", { "kx-body-bleed": a(ae) }])
        }, [
          a(J) ? (d(), g("div", un, [
            h(a(x), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            n[18] || (n[18] = X(" Loading… ", -1))
          ])) : (d(), g(ne, { key: 1 }, [
            a(ae) ? C("", !0) : (d(), g(ne, { key: 0 }, [
              v("div", dn, [
                s.value.description ? (d(), g("div", pn, D(s.value.description), 1)) : C("", !0),
                v("div", vn, [
                  s.value.embedding_model ? (d(), g("span", gn, [
                    h(a(x), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    X(D(s.value.embedding_model), 1)
                  ])) : C("", !0)
                ])
              ]),
              s.value.auto_summary ? (d(), g("div", fn, [
                n[19] || (n[19] = v("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                X(" " + D(s.value.auto_summary), 1)
              ])) : C("", !0)
            ], 64)),
            v("div", {
              ref_key: "detailHost",
              ref: ie,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (d(), g(ne, { key: 1 }, [
        v("header", Dt, [
          v("div", Ot, [
            h(a(x), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          n[10] || (n[10] = v("div", { class: "kx-head-text" }, [
            v("h1", { class: "kx-head-title" }, "Knowledge"),
            v("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          v("div", Ht, [
            v("span", Nt, D(a(H).length) + " knowledge base" + D(a(H).length !== 1 ? "s" : ""), 1),
            v("div", Pt, [
              h(a(x), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Ze(v("input", {
                "onUpdate:modelValue": n[0] || (n[0] = (o) => et(z) ? z.value = o : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [tt, a(z)]
              ])
            ]),
            h(a(te), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: b
            }, {
              icon: U(({ class: o }) => [
                h(a(x), {
                  icon: "tabler:plus",
                  class: F(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a($) ? (d(), g("div", Kt, D(a($)), 1)) : C("", !0),
        a(O) ? (d(), g("div", Tt, [
          h(a(x), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          n[11] || (n[11] = v("span", null, [
            v("strong", null, "No knowledge engine installed."),
            X(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : C("", !0),
        v("div", At, [
          a(j) && !a(H).length ? (d(), g("div", zt, [
            h(a(x), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            n[12] || (n[12] = X(" Loading… ", -1))
          ])) : a(H).length ? a(N).length ? (d(), g("div", Bt, [
            (d(!0), g(ne, null, he(a(N), (o) => (d(), g("div", {
              key: o.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${o.name || "knowledge base"}`,
              onClick: (S) => a(f)(o),
              onKeydown: [
                Ke((S) => a(f)(o), ["enter"]),
                Ke(me((S) => a(f)(o), ["prevent"]), ["space"])
              ]
            }, [
              v("div", qt, [
                v("span", Wt, [
                  h(a(x), {
                    icon: o.icon || o.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                v("div", Ut, [
                  v("div", {
                    class: "kx-card-name",
                    title: o.name || "(untitled)"
                  }, D(o.name || "(untitled)"), 9, Ft),
                  o.badge ? (d(), g("div", Jt, [
                    h(a($e), {
                      severity: r(o.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: U(() => [
                        h(a(x), {
                          icon: o.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        X(D(o.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : C("", !0)
                ]),
                v("div", {
                  class: "kx-card-actions",
                  onClick: n[1] || (n[1] = me(() => {
                  }, ["stop"]))
                }, [
                  h(a(te), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${o.name}`,
                    onClick: (S) => _(o)
                  }, {
                    icon: U(({ class: S }) => [
                      h(a(x), {
                        icon: "tabler:pencil",
                        class: F(S),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  h(a(te), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${o.name}`,
                    onClick: (S) => Oe(o)
                  }, {
                    icon: U(({ class: S }) => [
                      h(a(x), {
                        icon: "tabler:share",
                        class: F(S),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  h(a(te), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${o.name}`,
                    onClick: (S) => De(o)
                  }, {
                    icon: U(({ class: S }) => [
                      h(a(x), {
                        icon: "tabler:trash",
                        class: F(S),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"])
                ])
              ]),
              v("div", Gt, D(o.description || "No description"), 1),
              o.stat_items && o.stat_items.length ? (d(), g("div", Yt, [
                (d(!0), g(ne, null, he(o.stat_items, (S, Be) => (d(), g("span", {
                  key: Be,
                  class: "kx-stat",
                  title: `${u(S.value)} ${S.label}`,
                  "aria-label": `${u(S.value)} ${S.label}`
                }, [
                  S.icon ? (d(), ve(a(x), {
                    key: 0,
                    icon: S.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : C("", !0),
                  X(D(u(S.value)), 1)
                ], 8, Qt))), 128))
              ])) : C("", !0)
            ], 40, Vt))), 128))
          ])) : (d(), g("div", jt, [...n[15] || (n[15] = [
            v("div", { class: "kx-empty-title" }, "No matches", -1),
            v("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (d(), g("div", It, [
            v("div", Rt, [
              h(a(x), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            n[13] || (n[13] = v("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            n[14] || (n[14] = v("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            h(a(te), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: b
            }, {
              icon: U(({ class: o }) => [
                h(a(x), {
                  icon: "tabler:plus",
                  class: F(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      h(Je, {
        open: y.value,
        api: a(Y),
        engines: a(M),
        models: a(I),
        target: m.value,
        "load-error": a(T),
        onRetry: a(Z),
        onClose: n[9] || (n[9] = (o) => y.value = !1),
        onSaved: ke
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      re.value ? (d(), g("div", {
        key: 3,
        ref_key: "shareHost",
        ref: ce
      }, null, 512)) : C("", !0)
    ]));
  }
}), mn = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, hn = {
  wippy: mn
};
class bn extends qe {
  static get wippyConfig() {
    return {
      propsSchema: hn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ct
    };
  }
  static get vueConfig() {
    return { rootComponent: yn, plugins: [Ge] };
  }
}
ot(import.meta.url, bn);
//# sourceMappingURL=index.js.map
