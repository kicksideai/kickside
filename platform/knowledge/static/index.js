import { u as Ve, W as qe } from "./index-D52CRMw6.js";
import { B as We, s as Ue, f as Fe, e as ie, a as ee, _ as Ge, P as Je } from "./KbDialog.vue_vue_type_script_setup_true_lang-CICQRGnH.js";
import { openBlock as v, createElementBlock as f, mergeProps as ye, createBlock as ve, resolveDynamicComponent as Ye, createCommentVNode as C, renderSlot as Ie, createElementVNode as g, toDisplayString as D, defineComponent as Ee, Fragment as te, renderList as he, unref as o, ref as w, watch as be, nextTick as Ce, onBeforeUnmount as ge, normalizeStyle as Qe, computed as ue, onMounted as Xe, createVNode as m, withDirectives as Ze, isRef as et, vModelText as tt, withCtx as q, normalizeClass as W, createTextVNode as Q, withKeys as Ae, withModifiers as me } from "vue";
import { Icon as x } from "@iconify/vue";
import { on as nt, api as F, loadByTagName as Re, host as at, define as ot } from "@wippy-fe/proxy";
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
function fe(t) {
  "@babel/helpers - typeof";
  return fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(u) {
    return typeof u;
  } : function(u) {
    return u && typeof Symbol == "function" && u.constructor === Symbol && u !== Symbol.prototype ? "symbol" : typeof u;
  }, fe(t);
}
function gt(t, u, r) {
  return (u = ft(u)) in t ? Object.defineProperty(t, u, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : t[u] = r, t;
}
function ft(t) {
  var u = yt(t, "string");
  return fe(u) == "symbol" ? u : u + "";
}
function yt(t, u) {
  if (fe(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var l = r.call(t, u);
    if (fe(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (u === "string" ? String : Number)(t);
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
function ht(t, u, r, l, k, j) {
  return v(), f("span", ye({
    class: t.cx("root"),
    "data-p": j.dataP
  }, t.ptmi("root")), [t.$slots.icon ? (v(), ve(Ye(t.$slots.icon), ye({
    key: 0,
    class: t.cx("icon")
  }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (v(), f("span", ye({
    key: 1,
    class: [t.cx("icon"), t.icon]
  }, t.ptm("icon")), null, 16)) : C("", !0), t.value != null || t.$slots.default ? Ie(t.$slots, "default", {
    key: 2
  }, function() {
    return [g("span", ye({
      class: t.cx("label")
    }, t.ptm("label")), D(t.value), 17)];
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
  setup(t) {
    return (u, r) => t.items.length ? (v(), f("span", bt, [
      (v(!0), f(te, null, he(t.items, (l, k) => (v(), f(te, { key: k }, [
        k ? (v(), f("span", kt, " · ")) : C("", !0),
        g("span", wt, [
          l.icon ? (v(), ve(o(x), {
            key: 0,
            icon: l.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : C("", !0),
          g("span", _t, D(l.value.toLocaleString()) + " " + D(l.label), 1)
        ])
      ], 64))), 128))
    ])) : C("", !0);
  }
}), Ct = 2e3;
function Ke(t) {
  const u = t.margin ?? 8, r = t.gap ?? 4, l = Math.max(0, t.viewportWidth), k = Math.max(0, t.viewportHeight), j = Math.max(0, l - u * 2), E = Math.min(Math.max(0, t.requestedWidth), j), O = t.align === "right" ? t.anchor.right - E : t.anchor.left, H = Math.max(u, Math.min(O, l - u - E)), S = Math.max(0, k - t.anchor.bottom - r - u), L = Math.max(0, t.anchor.top - r - u), A = S < t.requestedMaxHeight && L > S ? "above" : "below", _ = A === "above" ? L : S, K = Math.round(Math.min(Math.max(0, t.requestedMaxHeight), _)), P = Math.min(Math.max(0, t.panelHeight ?? K), K), $ = A === "above" ? t.anchor.top - r - P : t.anchor.bottom + r, N = t.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(H - N.left),
    width: Math.round(E),
    maxHeight: K,
    side: A,
    top: Math.round($ - N.top)
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
  setup(t, { emit: u }) {
    const r = t, l = u, k = w(null), j = w({ position: "fixed", visibility: "hidden" });
    function E() {
      const $ = r.anchor, N = k.value;
      if (!$ || !N) return;
      const X = $.getBoundingClientRect(), T = r.width === "anchor" ? Math.max(r.minWidth, X.width) : Math.max(r.minWidth, r.width), z = {
        anchor: X,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: T,
        requestedMaxHeight: r.maxHeight,
        align: r.align,
        gap: r.gap
      }, I = Ke(z);
      Object.assign(N.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${I.width}px`,
        maxHeight: `${I.maxHeight}px`,
        visibility: "hidden"
      });
      const B = N.getBoundingClientRect(), V = Ke({
        ...z,
        containingBlockOrigin: { left: B.left, top: B.top },
        panelHeight: B.height
      }), G = {
        position: "fixed",
        left: `${V.left}px`,
        top: `${V.top}px`,
        width: `${V.width}px`,
        maxHeight: `${V.maxHeight}px`,
        "--anchored-panel-available-height": `${V.maxHeight}px`,
        margin: "0",
        zIndex: String(r.zIndex),
        visibility: "visible"
      };
      j.value = G;
    }
    let O = null, H = !1;
    function S() {
      H || !r.open || (H = !0, requestAnimationFrame(() => {
        H = !1, r.open && E();
      }));
    }
    function L() {
      typeof ResizeObserver > "u" || (O = new ResizeObserver(S), k.value && O.observe(k.value), r.anchor && O.observe(r.anchor));
    }
    function A() {
      O?.disconnect(), O = null, H = !1;
    }
    be(() => r.open, async ($) => {
      A(), $ && (j.value = { position: "fixed", visibility: "hidden" }, await Ce(), E(), L());
    }, { immediate: !0 });
    function _($) {
      if (!r.open) return;
      const N = $.composedPath();
      k.value && N.includes(k.value) || r.anchor && N.includes(r.anchor) || l("update:open", !1);
    }
    function K($) {
      r.open && $.key === "Escape" && l("update:open", !1);
    }
    function P() {
      r.open && E();
    }
    return document.addEventListener("click", _), document.addEventListener("keydown", K), window.addEventListener("resize", P), window.addEventListener("scroll", P, !0), ge(() => {
      A(), document.removeEventListener("click", _), document.removeEventListener("keydown", K), window.removeEventListener("resize", P), window.removeEventListener("scroll", P, !0);
    }), ($, N) => t.open ? (v(), f("div", {
      key: 0,
      ref_key: "panel",
      ref: k,
      class: "anchored-panel",
      style: Qe(j.value)
    }, [
      Ie($.$slots, "default")
    ], 4)) : C("", !0);
  }
}), Se = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Te = Object.keys(Se), ze = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Et({ detail: t }) {
  const u = w(!1), r = w(""), l = w(""), k = w([]), j = w(""), E = w([]), O = w([]), H = w("");
  let S = !0, L = 0, A = !1, _ = !1;
  const K = ue(() => {
    const s = j.value.trim().toLowerCase();
    return s ? k.value.filter(
      (n) => (n.name || "").toLowerCase().includes(s) || (n.description || "").toLowerCase().includes(s)
    ) : k.value;
  });
  function P(s) {
    const n = s.toLowerCase();
    return n.includes("no implementation") || n.includes("no engine") || n.includes("contract unavailable") || n.includes("not found") && n.includes("binding");
  }
  async function $({ preserve: s = !1 } = {}) {
    if (!S) return !1;
    const n = ++L;
    u.value = !0, r.value = "", l.value = "";
    try {
      const { data: h } = await F.get("/api/v1/knowledge/list");
      if (!h?.success) {
        const e = h?.error || "failed to load knowledge bases";
        if (P(e))
          return n === L && S && (s || (k.value = []), l.value = ze), !1;
        throw new Error(e);
      }
      return n === L && S && (k.value = h.items || []), !0;
    } catch (h) {
      const e = ie(h, "could not load knowledge bases");
      return n === L && S && (s || (k.value = []), P(e) ? l.value = ze : r.value = e), !1;
    } finally {
      n === L && (u.value = !1, S && _ && !A && Z());
    }
  }
  async function N() {
    try {
      const { data: s } = await F.get("/api/v1/knowledge/models");
      E.value = s?.success ? s.models || [] : [];
    } catch {
      E.value = [];
    }
  }
  async function X() {
    try {
      const { data: s } = await F.get("/api/v1/knowledge/engines");
      O.value = s?.success ? s.engines || [] : [];
    } catch {
      O.value = [];
    }
  }
  function T(s) {
    return O.value.find((n) => n.kb_type === s);
  }
  async function z() {
    H.value = "";
    try {
      const [s, n] = await Promise.all([
        F.get("/api/v1/knowledge/engines"),
        F.get("/api/v1/knowledge/models")
      ]);
      if (!s.data?.success) throw new Error(s.data?.error || "Could not load knowledge engines.");
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load embedding models.");
      O.value = s.data.engines || [], E.value = n.data.models || [];
    } catch (s) {
      O.value = [], E.value = [], H.value = ie(s, "Could not load knowledge engines.");
    }
  }
  function I(s) {
    return !!s && typeof s == "object" && !Array.isArray(s);
  }
  function B(s) {
    if (I(s)) return s;
    if (!(typeof s != "string" || !s))
      try {
        const n = JSON.parse(s);
        return I(n) ? n : void 0;
      } catch {
        return;
      }
  }
  function V(s, n) {
    if (!n) return;
    let h = s;
    for (const e of n.split(".")) {
      if (!I(h)) return;
      h = h[e];
    }
    return h;
  }
  function G(s, n) {
    if (!Array.isArray(n)) return [];
    const h = [];
    for (const e of n) {
      const c = V(s, e.path), p = typeof c == "number" ? c : Number(c || 0);
      p < (e.min ?? 0) || h.push({ icon: e.icon, value: p, label: String(p === 1 ? e.singular : e.plural) });
    }
    return h;
  }
  function U(s, n) {
    return Object.prototype.hasOwnProperty.call(s, n);
  }
  function se(s, n) {
    return Te.some((h) => U(s, h)) ? !0 : Array.isArray(n) ? n.some((h) => {
      const e = h.path || "";
      return e !== "" && U(s, e.split(".")[0]);
    }) : !1;
  }
  function ae(s, n, h) {
    const e = String(n.kb_type || h || ""), c = T(e), p = {
      kb_type: e || h,
      badge: c?.badge
    };
    for (const y of Te) {
      const b = n[y];
      U(n, y) && typeof b == "number" && (p[y] = b);
    }
    return (se(n, c?.stats_spec) || U(n, "kb_type")) && (p.stat_items = G({ ...s, ...n }, c?.stats_spec)), p;
  }
  function J(s, n, h = []) {
    const e = {};
    typeof n.title == "string" && (e.name = n.title), typeof n.comment == "string" && (e.description = n.comment), typeof n.icon == "string" && (e.icon = n.icon), typeof n.status == "string" && (e.status = n.status), typeof n.auto_summary == "string" && (e.auto_summary = n.auto_summary), typeof n.auto_description == "string" && (e.auto_description = n.auto_description), typeof n.kb_type == "string" && (e.kb_type = n.kb_type), Object.assign(e, ae(s, n, e.kb_type || s.kb_type));
    const c = { ...s, ...e };
    for (const p of h) {
      const y = p === "title" ? "name" : p;
      delete c[y];
    }
    return c;
  }
  const oe = w(null);
  function Y(s, n) {
    const h = B(n.meta) || {}, e = n.deleted || [];
    k.value = k.value.map((c) => c.id === s ? J(c, h, e) : c), t.value?.id === s && (t.value = J(t.value, h, e));
  }
  function R() {
    S = !1, _ = !1, de?.(), oe.value?.(), oe.value = null;
  }
  async function Z() {
    if (S) {
      if (A || u.value) {
        _ = !0;
        return;
      }
      A = !0;
      try {
        do
          _ = !1, await $({ preserve: !0 });
        while (S && _);
      } finally {
        A = !1;
      }
    }
  }
  const de = nt("@message", (s) => {
    const n = it(s, void 0, Se);
    if (!n) return;
    const h = k.value.some((e) => e.id === n.component_id);
    Y(n.component_id, n), !h && typeof n.meta.kb_type == "string" && n.meta.kb_type && Z();
  });
  return ge(R), {
    loading: u,
    error: r,
    notice: l,
    kbs: k,
    query: j,
    filtered: K,
    models: E,
    engines: O,
    dialogLoadError: H,
    load: $,
    loadModels: N,
    loadEngines: X,
    engineFor: T,
    loadDialogCatalog: z,
    detailUnsub: oe,
    applyComponentMetaEvent: Y,
    clearComponentSubscriptions: R
  };
}
function St({ detail: t, detailUnsub: u, kbs: r, engines: l, engineFor: k, applyComponentMetaEvent: j, route: E, navigate: O, loadEngines: H }) {
  const S = w(!1), L = w(""), A = w(null);
  let _ = null, K = 0, P = 0;
  const $ = ue(() => t.value ? k(t.value.kb_type || "")?.manage_ui_id : void 0), N = ue(() => (t.value ? k(t.value.kb_type || "")?.manage_views : void 0) || []), X = ue(() => N.value.length > 1), T = w(""), z = w("");
  let I = !1, B = 0;
  function V() {
    const e = t.value?.kb_type;
    return e ? `kx:kb:detail-view:${e}` : null;
  }
  be(N, (e) => {
    if (!e.length) {
      T.value = "";
      return;
    }
    const c = e.map((b) => b.id);
    let p = "";
    try {
      const b = V();
      p = b && localStorage.getItem(b) || "";
    } catch {
    }
    const y = c.includes(p) ? p : c[0];
    y !== T.value && (T.value = y);
  }, { immediate: !0 });
  function G() {
    const e = { kb_id: t.value?.id, route: z.value };
    return T.value && (e.view = T.value), JSON.stringify(e);
  }
  function U(e) {
    if (e !== T.value) {
      T.value = e;
      try {
        const c = V();
        c && localStorage.setItem(c, e);
      } catch {
      }
      try {
        _?.setAttribute("config", G());
      } catch {
      }
    }
  }
  function se(e) {
    e.stopPropagation();
    const c = t.value?.id;
    if (!c || I) return;
    const p = typeof e.detail == "string" ? e.detail : e.detail?.path ?? e.detail?.route ?? "", y = String(p || "").replace(/^\/+/, "");
    z.value = y, Y(y ? `${c}/${y}` : c);
  }
  function ae(e) {
    e.stopPropagation();
  }
  function J(e = !0) {
    e && P++, _ && (_.removeEventListener("kb-changed", ae), _.removeEventListener("navigate", se), _.remove(), _ = null);
  }
  async function oe() {
    const e = ++P;
    J(!1);
    const c = $.value, p = A.value, y = t.value?.id;
    if (!c || !p || !y) return;
    try {
      await Re(c, { timeoutMs: 8e3 });
    } catch {
    }
    if (e !== P || t.value?.id !== y || $.value !== c || A.value !== p) return;
    p.replaceChildren();
    const b = document.createElement(c);
    try {
      b.setAttribute("config", G());
    } catch {
    }
    b.addEventListener("kb-changed", ae), b.addEventListener("navigate", se), p.appendChild(b), _ = b;
  }
  function Y(e) {
    I || O(e);
  }
  function R(e, c) {
    return K === e && t.value?.id === c;
  }
  async function Z(e, c = !0) {
    const p = ++K, y = e.id;
    t.value = { ...e }, u.value?.(), u.value = y ? st(y, (b) => j(y, b), Se) : null, L.value = "", S.value = !0, J(), c && Y(y);
    try {
      const { data: b } = await F.get(`/api/v1/knowledge/${y}`);
      if (!R(p, y)) return;
      b?.success ? t.value = { ...t.value, ...b } : L.value = b?.error || "could not load knowledge base";
    } catch (b) {
      if (!R(p, y)) return;
      L.value = ie(b, "could not load knowledge base");
    } finally {
      R(p, y) && (S.value = !1);
    }
    R(p, y) && (l.value.length || await H(), R(p, y) && (await Ce(), R(p, y) && await oe()));
  }
  async function de() {
    const e = t.value?.id;
    if (!e) return;
    const c = ++K;
    L.value = "";
    try {
      const { data: p } = await F.get(`/api/v1/knowledge/${e}`);
      if (!R(c, e)) return;
      p?.success ? t.value = { ...t.value, ...p } : L.value = p?.error || "could not load knowledge base";
    } catch (p) {
      if (!R(c, e)) return;
      L.value = ie(p, "could not load knowledge base");
    }
    if (R(c, e) && (await Ce(), !!R(c, e)))
      try {
        _?.setAttribute("config", G());
      } catch {
      }
  }
  function s() {
    const e = t.value?.id;
    if (!e || !z.value) {
      n();
      return;
    }
    O({ path: e, back: { within: e } });
  }
  function n(e = !0) {
    K++, J(), u.value?.(), u.value = null, t.value = null, z.value = "", e && Y("");
  }
  async function h(e) {
    const c = ++B, p = String(e || "").split("/").filter(Boolean), y = p[0] || "", b = p.slice(1).join("/");
    I = !0;
    try {
      if (c !== B) return;
      if (!y)
        t.value && n(!1);
      else if (t.value?.id !== y) {
        z.value = b;
        const ke = r.value.find((ne) => ne.id === y);
        if (await Z(ke || { id: y }, !1), c !== B) return;
      } else if (b !== z.value) {
        z.value = b;
        try {
          _?.setAttribute("config", G());
        } catch {
        }
      }
    } finally {
      c === B && (I = !1);
    }
  }
  return be(E, (e) => {
    h(e);
  }), ge(() => {
    J(), u.value?.(), u.value = null;
  }), {
    detailLoading: S,
    detailError: L,
    detailHost: A,
    detailManageTag: $,
    detailViews: N,
    detailHasViews: X,
    detailView: T,
    innerRoute: z,
    setDetailView: U,
    openDetail: Z,
    refreshOpenDetail: de,
    closeDetail: n,
    backDetail: s,
    applyRoute: h,
    pushRoute: Y,
    unmountDetailWc: J
  };
}
const Mt = { class: "kx" }, Lt = {
  key: 0,
  class: "kx-notice",
  role: "status"
}, Dt = { class: "kx-head" }, Ot = { class: "kx-head-icon" }, Ht = { class: "kx-head-actions" }, Pt = { class: "kx-count" }, Nt = { class: "kx-search" }, At = {
  key: 0,
  class: "kx-err"
}, Kt = {
  key: 1,
  class: "kx-notice"
}, Tt = { class: "kx-body" }, zt = {
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
}, Vt = ["aria-label", "onClick", "onKeydown"], qt = { class: "kx-card-head" }, Wt = { class: "kx-ficon" }, Ut = { class: "kx-card-id" }, Ft = ["title"], Gt = {
  key: 0,
  class: "kx-card-meta"
}, Jt = { class: "kx-card-desc" }, Yt = {
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
  setup(t) {
    const u = (d) => (d ?? 0).toLocaleString();
    function r(d) {
      if (d === "neutral") return "secondary";
      if (d === "warning") return "warn";
      if (d === "info" || d === "success" || d === "danger") return d;
    }
    const l = w(null), k = Et({ detail: l }), {
      loading: j,
      error: E,
      notice: O,
      kbs: H,
      query: S,
      filtered: L,
      models: A,
      engines: _,
      dialogLoadError: K,
      load: P,
      loadEngines: $,
      engineFor: N,
      loadDialogCatalog: X,
      detailUnsub: T,
      applyComponentMetaEvent: z
    } = k, I = lt(), B = rt(), V = St({
      detail: l,
      detailUnsub: T,
      kbs: H,
      engines: _,
      engineFor: N,
      applyComponentMetaEvent: z,
      route: ue(() => I.value.route),
      navigate: (d) => B("navigate", d),
      loadEngines: $
    }), {
      detailLoading: G,
      detailError: U,
      detailHost: se,
      detailManageTag: ae,
      detailViews: J,
      detailHasViews: oe,
      detailView: Y,
      setDetailView: R,
      openDetail: Z,
      refreshOpenDetail: de,
      closeDetail: s,
      backDetail: n,
      applyRoute: h
    } = V;
    function e(d) {
      l.value ? U.value = d : E.value = d;
    }
    const c = w(!1), p = w(null);
    async function y() {
      p.value = null, await X(), c.value = !0;
    }
    async function b(d) {
      E.value = "", U.value = "", K.value = "", _.value.length || await $();
      try {
        const { data: a } = await F.get(`/api/v1/knowledge/${d.id}`);
        if (!a?.success) throw new Error(a?.error || "could not load knowledge base settings");
        p.value = {
          id: d.id,
          name: a.name ?? d.name,
          description: a.description ?? d.description,
          icon: a.icon ?? d.icon,
          kb_type: a.kb_type ?? d.kb_type,
          embedding_model: a.embedding_model,
          config: a.config && typeof a.config == "object" ? a.config : {}
        }, c.value = !0;
      } catch (a) {
        p.value = null, c.value = !1, e(ie(a, "could not load knowledge base settings"));
      }
    }
    async function ke() {
      c.value = !1;
      const d = l.value?.id;
      if (await P(), d && p.value && p.value.id === d)
        try {
          const { data: a } = await F.get(`/api/v1/knowledge/${d}`);
          a?.success && l.value && l.value.id === d && (l.value = { ...l.value, ...a });
        } catch {
        }
      p.value = null;
    }
    const ne = w({}), we = w(""), Me = ue(() => Object.keys(ne.value).length ? `Deleting ${Object.values(ne.value).join(", ")}: cleanup is in progress and continues in the background.` : we.value);
    let pe, _e = !1;
    function Le() {
      _e || pe !== void 0 || !Object.keys(ne.value).length || (pe = setTimeout(async () => {
        pe = void 0;
        const d = await P({ preserve: !0 });
        if (!_e) {
          if (d)
            for (const [a, i] of Object.entries(ne.value))
              H.value.some((M) => M.id === a) || (delete ne.value[a], we.value = `Deletion complete: ${i}.`);
          Le();
        }
      }, 1e3));
    }
    ge(() => {
      _e = !0, pe !== void 0 && clearTimeout(pe);
    });
    async function De(d) {
      if (await at.confirm({
        header: "Delete knowledge base",
        message: `Delete “${d.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        e(""), E.value = "";
        try {
          const { data: i } = await F.delete(`/api/v1/knowledge/${d.id}`);
          if (!i?.success) throw new Error(i?.error || "delete failed");
          we.value = "", i.in_progress === !0 && (ne.value[d.id] = d.name || "(untitled)", Le()), l.value?.id === d.id && s(), await P({ preserve: i.in_progress === !0 });
        } catch (i) {
          e(ie(i, "delete failed"));
        }
      }
    }
    const le = w(!1), xe = w(null), re = w(null);
    function Oe(d) {
      xe.value = d, le.value = !0;
    }
    function He() {
      le.value = !1, xe.value = null;
    }
    const ce = w(!1), Pe = w(null);
    function Ne(d) {
      d.key === "Escape" && le.value && He();
    }
    Xe(() => {
      window.addEventListener("keydown", Ne);
    }), ge(() => {
      window.removeEventListener("keydown", Ne);
    });
    async function je() {
      const d = xe.value;
      if (!re.value || !d) return;
      if (re.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Re("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const a = document.createElement("kickside-share");
      a.setAttribute("config", JSON.stringify({
        resource_id: d.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(d.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(d.id)}`,
        title: d.name || ""
      })), a.style.display = "block", a.addEventListener("close", He), re.value.appendChild(a);
    }
    return be([le, re], async () => {
      le.value && re.value && await je();
    }), Ve(async () => {
      try {
        await Promise.all([P(), $(), de()]), !l.value && I.value.route && await h(I.value.route);
      } catch (d) {
        E.value = ie(d, "host API unavailable");
      }
    }), (d, a) => (v(), f("div", Mt, [
      Me.value ? (v(), f("div", Lt, D(Me.value), 1)) : C("", !0),
      l.value ? (v(), f(te, { key: 2 }, [
        g("div", Xt, [
          g("div", Zt, [
            g("button", {
              class: "kx-back",
              onClick: a[2] || (a[2] = (i) => o(n)())
            }, [
              m(o(x), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              a[16] || (a[16] = Q(" Back", -1))
            ]),
            g("h1", {
              class: "kx-title",
              title: l.value.name || "(untitled)"
            }, D(l.value.name || "(untitled)"), 9, en),
            l.value.badge ? (v(), ve(o($e), {
              key: 0,
              severity: r(l.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: q(() => [
                m(o(x), {
                  icon: l.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                Q(D(l.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : C("", !0),
            m(xt, {
              items: l.value.stat_items || []
            }, null, 8, ["items"]),
            l.value.auto_summary || l.value.auto_description ? (v(), f("span", tn, [
              m(o(ee), {
                ref_key: "summaryAnchor",
                ref: Pe,
                severity: "secondary",
                outlined: "",
                class: W(["kx-summary-btn", { on: ce.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ce.value,
                onClick: a[3] || (a[3] = me((i) => ce.value = !ce.value, ["stop"]))
              }, {
                icon: q(({ class: i }) => [
                  m(o(x), {
                    icon: "tabler:sparkles",
                    class: W(i),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              m($t, {
                open: ce.value,
                "onUpdate:open": a[5] || (a[5] = (i) => ce.value = i),
                anchor: Pe.value,
                width: 340
              }, {
                default: q(() => [
                  g("div", {
                    class: "kx-summary-pop",
                    onClick: a[4] || (a[4] = me(() => {
                    }, ["stop"]))
                  }, [
                    g("div", nn, [
                      m(o(x), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      a[17] || (a[17] = g("span", null, "About this knowledge base", -1))
                    ]),
                    l.value.auto_summary ? (v(), f("p", an, D(l.value.auto_summary), 1)) : C("", !0),
                    l.value.auto_description ? (v(), f("p", on, D(l.value.auto_description), 1)) : C("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : C("", !0)
          ]),
          g("div", sn, [
            o(oe) ? (v(), f("div", ln, [
              (v(!0), f(te, null, he(o(J), (i) => (v(), f("button", {
                key: i.id,
                class: W(["kx-viewseg-btn", { on: o(Y) === i.id }]),
                role: "tab",
                "aria-selected": o(Y) === i.id,
                onClick: (M) => o(R)(i.id)
              }, [
                i.icon ? (v(), ve(o(x), {
                  key: 0,
                  icon: i.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : C("", !0),
                Q(" " + D(i.label), 1)
              ], 10, rn))), 128))
            ])) : C("", !0),
            m(o(ee), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: a[6] || (a[6] = (i) => b(l.value))
            }, {
              icon: q(({ class: i }) => [
                m(o(x), {
                  icon: "tabler:pencil",
                  class: W(i),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            m(o(ee), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: a[7] || (a[7] = (i) => Oe(l.value))
            }, {
              icon: q(({ class: i }) => [
                m(o(x), {
                  icon: "tabler:share",
                  class: W(i),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            m(o(ee), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: a[8] || (a[8] = (i) => De(l.value))
            }, {
              icon: q(({ class: i }) => [
                m(o(x), {
                  icon: "tabler:trash",
                  class: W(i),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(U) ? (v(), f("div", cn, D(o(U)), 1)) : C("", !0),
        g("div", {
          class: W(["kx-body", { "kx-body-bleed": o(ae) }])
        }, [
          o(G) ? (v(), f("div", un, [
            m(o(x), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            a[18] || (a[18] = Q(" Loading… ", -1))
          ])) : (v(), f(te, { key: 1 }, [
            o(ae) ? C("", !0) : (v(), f(te, { key: 0 }, [
              g("div", dn, [
                l.value.description ? (v(), f("div", pn, D(l.value.description), 1)) : C("", !0),
                g("div", vn, [
                  l.value.embedding_model ? (v(), f("span", gn, [
                    m(o(x), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    Q(D(l.value.embedding_model), 1)
                  ])) : C("", !0)
                ])
              ]),
              l.value.auto_summary ? (v(), f("div", fn, [
                a[19] || (a[19] = g("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                Q(" " + D(l.value.auto_summary), 1)
              ])) : C("", !0)
            ], 64)),
            g("div", {
              ref_key: "detailHost",
              ref: se,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (v(), f(te, { key: 1 }, [
        g("header", Dt, [
          g("div", Ot, [
            m(o(x), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          a[10] || (a[10] = g("div", { class: "kx-head-text" }, [
            g("h1", { class: "kx-head-title" }, "Knowledge"),
            g("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          g("div", Ht, [
            g("span", Pt, D(o(H).length) + " knowledge base" + D(o(H).length !== 1 ? "s" : ""), 1),
            g("div", Nt, [
              m(o(x), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Ze(g("input", {
                "onUpdate:modelValue": a[0] || (a[0] = (i) => et(S) ? S.value = i : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [tt, o(S)]
              ])
            ]),
            m(o(ee), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: y
            }, {
              icon: q(({ class: i }) => [
                m(o(x), {
                  icon: "tabler:plus",
                  class: W(i),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(E) ? (v(), f("div", At, D(o(E)), 1)) : C("", !0),
        o(O) ? (v(), f("div", Kt, [
          m(o(x), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          a[11] || (a[11] = g("span", null, [
            g("strong", null, "No knowledge engine installed."),
            Q(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : C("", !0),
        g("div", Tt, [
          o(j) && !o(H).length ? (v(), f("div", zt, [
            m(o(x), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            a[12] || (a[12] = Q(" Loading… ", -1))
          ])) : o(H).length ? o(L).length ? (v(), f("div", Bt, [
            (v(!0), f(te, null, he(o(L), (i) => (v(), f("div", {
              key: i.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${i.name || "knowledge base"}`,
              onClick: (M) => o(Z)(i),
              onKeydown: [
                Ae((M) => o(Z)(i), ["enter"]),
                Ae(me((M) => o(Z)(i), ["prevent"]), ["space"])
              ]
            }, [
              g("div", qt, [
                g("span", Wt, [
                  m(o(x), {
                    icon: i.icon || i.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                g("div", Ut, [
                  g("div", {
                    class: "kx-card-name",
                    title: i.name || "(untitled)"
                  }, D(i.name || "(untitled)"), 9, Ft),
                  i.badge ? (v(), f("div", Gt, [
                    m(o($e), {
                      severity: r(i.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: q(() => [
                        m(o(x), {
                          icon: i.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        Q(D(i.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : C("", !0)
                ]),
                g("div", {
                  class: "kx-card-actions",
                  onClick: a[1] || (a[1] = me(() => {
                  }, ["stop"]))
                }, [
                  m(o(ee), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${i.name}`,
                    onClick: (M) => b(i)
                  }, {
                    icon: q(({ class: M }) => [
                      m(o(x), {
                        icon: "tabler:pencil",
                        class: W(M),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  m(o(ee), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${i.name}`,
                    onClick: (M) => Oe(i)
                  }, {
                    icon: q(({ class: M }) => [
                      m(o(x), {
                        icon: "tabler:share",
                        class: W(M),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"]),
                  m(o(ee), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${i.name}`,
                    onClick: (M) => De(i)
                  }, {
                    icon: q(({ class: M }) => [
                      m(o(x), {
                        icon: "tabler:trash",
                        class: W(M),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick"])
                ])
              ]),
              g("div", Jt, D(i.description || "No description"), 1),
              i.stat_items && i.stat_items.length ? (v(), f("div", Yt, [
                (v(!0), f(te, null, he(i.stat_items, (M, Be) => (v(), f("span", {
                  key: Be,
                  class: "kx-stat",
                  title: `${u(M.value)} ${M.label}`,
                  "aria-label": `${u(M.value)} ${M.label}`
                }, [
                  M.icon ? (v(), ve(o(x), {
                    key: 0,
                    icon: M.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : C("", !0),
                  Q(D(u(M.value)), 1)
                ], 8, Qt))), 128))
              ])) : C("", !0)
            ], 40, Vt))), 128))
          ])) : (v(), f("div", jt, [...a[15] || (a[15] = [
            g("div", { class: "kx-empty-title" }, "No matches", -1),
            g("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (v(), f("div", It, [
            g("div", Rt, [
              m(o(x), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            a[13] || (a[13] = g("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            a[14] || (a[14] = g("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            m(o(ee), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: y
            }, {
              icon: q(({ class: i }) => [
                m(o(x), {
                  icon: "tabler:plus",
                  class: W(i),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      m(Ge, {
        open: c.value,
        api: o(F),
        engines: o(_),
        models: o(A),
        target: p.value,
        "load-error": o(K),
        onRetry: o(X),
        onClose: a[9] || (a[9] = (i) => c.value = !1),
        onSaved: ke
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (v(), f("div", {
        key: 3,
        ref_key: "shareHost",
        ref: re
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
    return { rootComponent: yn, plugins: [Je] };
  }
}
ot(import.meta.url, bn);
//# sourceMappingURL=index.js.map
