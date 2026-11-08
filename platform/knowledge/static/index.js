import { u as Be, W as qe } from "./index-D52CRMw6.js";
import { B as Oe, s as He, a as X, f as Ve, e as se, _ as We, P as Ue } from "./KbDialog.vue_vue_type_script_setup_true_lang-CICQRGnH.js";
import { openBlock as g, createElementBlock as y, mergeProps as ae, createElementVNode as m, defineComponent as he, computed as ue, withModifiers as ie, Fragment as ee, createTextVNode as Z, toDisplayString as N, createCommentVNode as D, createVNode as b, unref as a, watch as ve, onBeforeUnmount as me, createBlock as fe, resolveDynamicComponent as Je, renderSlot as Ae, renderList as be, ref as M, nextTick as _e, normalizeStyle as Fe, onMounted as Ge, withDirectives as Ye, isRef as Qe, vModelText as Xe, withCtx as W, normalizeClass as U, withKeys as De } from "vue";
import { on as Ke, api as F, loadByTagName as Ne, host as Ze, define as et } from "@wippy-fe/proxy";
import { c as tt, a as nt, s as ot, u as at, b as it } from "./constants-Cgcp0OGP.js";
import { Icon as j } from "@iconify/vue";
import { s as st } from "./styles-C6pL1o85.js";
var rt = `
    .p-progressspinner {
        position: relative;
        margin: 0 auto;
        width: 100px;
        height: 100px;
        display: inline-block;
    }

    .p-progressspinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    .p-progressspinner-spin {
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        animation: p-progressspinner-rotate 2s linear infinite;
    }

    .p-progressspinner-circle {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        stroke: dt('progressspinner.colorOne');
        animation:
            p-progressspinner-dash 1.5s ease-in-out infinite,
            p-progressspinner-color 6s ease-in-out infinite;
        stroke-linecap: round;
    }

    @keyframes p-progressspinner-rotate {
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes p-progressspinner-dash {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
        }
        100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
        }
    }
    @keyframes p-progressspinner-color {
        100%,
        0% {
            stroke: dt('progressspinner.color.one');
        }
        40% {
            stroke: dt('progressspinner.color.two');
        }
        66% {
            stroke: dt('progressspinner.color.three');
        }
        80%,
        90% {
            stroke: dt('progressspinner.color.four');
        }
    }
`, lt = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, dt = Oe.extend({
  name: "progressspinner",
  style: rt,
  classes: lt
}), ct = {
  name: "BaseProgressSpinner",
  extends: He,
  props: {
    strokeWidth: {
      type: String,
      default: "2"
    },
    fill: {
      type: String,
      default: "none"
    },
    animationDuration: {
      type: String,
      default: "2s"
    }
  },
  style: dt,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Re = {
  name: "ProgressSpinner",
  extends: ct,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, ut = ["fill", "stroke-width"];
function pt(e, i, c, s, v, P) {
  return g(), y("div", ae({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(g(), y("svg", ae({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: P.svgStyle
  }, e.ptm("spin")), [m("circle", ae({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, ut)], 16))], 16);
}
Re.render = pt;
const gt = { key: 0 }, ft = /* @__PURE__ */ he({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const i = e, c = ue(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (s, v) => e.state.deleting_at ? (g(), y("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: v[1] || (v[1] = ie(() => {
      }, ["stop"])),
      onKeydown: v[2] || (v[2] = ie(() => {
      }, ["stop"]))
    }, [
      c.value ? (g(), y(ee, { key: 0 }, [
        m("span", null, [
          v[3] || (v[3] = Z("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (g(), y("span", gt, ": " + N(e.state.deletion_job.last_error), 1)) : D("", !0)
        ]),
        b(a(X), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: v[0] || (v[0] = ie((P) => s.$emit("retry"), ["stop"]))
        })
      ], 64)) : (g(), y(ee, { key: 1 }, [
        b(a(Re), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        v[4] || (v[4] = m("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : D("", !0);
  }
});
function vt(e, i, c, s) {
  const v = /* @__PURE__ */ new Set(), P = /* @__PURE__ */ new Map();
  function E(C, h) {
    const w = e.value.find((R) => i(R) === C), l = P.get(C), _ = h?.job_id || l?.state.deletion_job_id || w?.deletion_job_id, L = l ? l.state.deletion_job_id : w?.deleting_at ? w.deletion_job_id : void 0;
    if ((l || w?.deleting_at) && _ === L || _ && l?.superseded.has(_)) return;
    const x = {
      deleting_at: l?.state.deleting_at || w?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: _
    }, A = new Set(l?.superseded);
    for (const R of [l?.state.deletion_job_id, w?.deletion_job_id])
      R && R !== _ && A.add(R);
    P.set(C, { state: x, superseded: A }), w && (Object.assign(w, x), w.deletion_job = void 0);
  }
  const H = ve(() => e.value, (C, h = []) => {
    const w = C.filter((l) => !v.has(i(l)));
    for (const l of h)
      v.has(i(l)) || w.some((_) => i(_) === i(l)) || (c?.(i(l)), l.deleting_at && s?.(i(l)));
    if (w.length !== C.length) {
      e.value = w;
      return;
    }
    for (const l of C) {
      l.deleting_at && l.deletion_job === void 0 && !h.includes(l) && (l.deletion_job = null);
      const _ = P.get(i(l));
      if (_) {
        const x = l.deletion_job_id;
        l.deleting_at && x && x !== _.state.deletion_job_id && !_.superseded.has(x) && (_.state.deletion_job_id && _.superseded.add(_.state.deletion_job_id), _.state.deletion_job_id = x), x !== _.state.deletion_job_id && (l.deletion_job = void 0), Object.assign(l, _.state);
      }
      const L = h.find((x) => i(x) === i(l));
      l.deletion_job === void 0 && L?.deletion_job_id === l.deletion_job_id && (l.deletion_job = L?.deletion_job);
    }
  }, { immediate: !0 }), O = Ke("@message", (C) => {
    const h = tt(C);
    if (!h) return;
    const w = e.value.find((l) => i(l) === h.component_id);
    h.event === "component.deleted" ? (w && !v.has(h.component_id) && (c?.(h.component_id), s?.(h.component_id)), v.add(h.component_id), P.delete(h.component_id), e.value = e.value.filter((l) => i(l) !== h.component_id)) : w && E(h.component_id, { job_id: h.deletion_job_id });
  });
  return me(() => {
    H(), typeof O == "function" && O();
  }), { acceptDeletion: E };
}
var yt = `
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
`, mt = {
  root: function(i) {
    var c = i.props;
    return ["p-tag p-component", {
      "p-tag-info": c.severity === "info",
      "p-tag-success": c.severity === "success",
      "p-tag-warn": c.severity === "warn",
      "p-tag-danger": c.severity === "danger",
      "p-tag-secondary": c.severity === "secondary",
      "p-tag-contrast": c.severity === "contrast",
      "p-tag-rounded": c.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, bt = Oe.extend({
  name: "tag",
  style: yt,
  classes: mt
}), ht = {
  name: "BaseTag",
  extends: He,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: bt,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function ye(e) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(i) {
    return typeof i;
  } : function(i) {
    return i && typeof Symbol == "function" && i.constructor === Symbol && i !== Symbol.prototype ? "symbol" : typeof i;
  }, ye(e);
}
function kt(e, i, c) {
  return (i = wt(i)) in e ? Object.defineProperty(e, i, { value: c, enumerable: !0, configurable: !0, writable: !0 }) : e[i] = c, e;
}
function wt(e) {
  var i = _t(e, "string");
  return ye(i) == "symbol" ? i : i + "";
}
function _t(e, i) {
  if (ye(e) != "object" || !e) return e;
  var c = e[Symbol.toPrimitive];
  if (c !== void 0) {
    var s = c.call(e, i);
    if (ye(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (i === "string" ? String : Number)(e);
}
var xe = {
  name: "Tag",
  extends: ht,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ve(kt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, xt = ["data-p"];
function $t(e, i, c, s, v, P) {
  return g(), y("span", ae({
    class: e.cx("root"),
    "data-p": P.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (g(), fe(Je(e.$slots.icon), ae({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (g(), y("span", ae({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : D("", !0), e.value != null || e.$slots.default ? Ae(e.$slots, "default", {
    key: 2
  }, function() {
    return [m("span", ae({
      class: e.cx("label")
    }, e.ptm("label")), N(e.value), 17)];
  }) : D("", !0)], 16, xt);
}
xe.render = $t;
const Ct = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, St = {
  key: 0,
  "aria-hidden": "true"
}, Et = { class: "kx-header-stat" }, jt = { class: "kx-header-stat-label" }, Dt = /* @__PURE__ */ he({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (i, c) => e.items.length ? (g(), y("span", Ct, [
      (g(!0), y(ee, null, be(e.items, (s, v) => (g(), y(ee, { key: v }, [
        v ? (g(), y("span", St, " · ")) : D("", !0),
        m("span", Et, [
          s.icon ? (g(), fe(a(j), {
            key: 0,
            icon: s.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : D("", !0),
          m("span", jt, N(s.value.toLocaleString()) + " " + N(s.label), 1)
        ])
      ], 64))), 128))
    ])) : D("", !0);
  }
}), Mt = 2e3;
function Me(e) {
  const i = e.margin ?? 8, c = e.gap ?? 4, s = Math.max(0, e.viewportWidth), v = Math.max(0, e.viewportHeight), P = Math.max(0, s - i * 2), E = Math.min(Math.max(0, e.requestedWidth), P), H = e.align === "right" ? e.anchor.right - E : e.anchor.left, O = Math.max(i, Math.min(H, s - i - E)), C = Math.max(0, v - e.anchor.bottom - c - i), h = Math.max(0, e.anchor.top - c - i), w = C < e.requestedMaxHeight && h > C ? "above" : "below", l = w === "above" ? h : C, _ = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), l)), L = Math.min(Math.max(0, e.panelHeight ?? _), _), x = w === "above" ? e.anchor.top - c - L : e.anchor.bottom + c, A = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(O - A.left),
    width: Math.round(E),
    maxHeight: _,
    side: w,
    top: Math.round(x - A.top)
  };
}
const Lt = /* @__PURE__ */ he({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Mt }
  },
  emits: ["update:open"],
  setup(e, { emit: i }) {
    const c = e, s = i, v = M(null), P = M({ position: "fixed", visibility: "hidden" });
    function E() {
      const x = c.anchor, A = v.value;
      if (!x || !A) return;
      const R = x.getBoundingClientRect(), I = c.width === "anchor" ? Math.max(c.minWidth, R.width) : Math.max(c.minWidth, c.width), T = {
        anchor: R,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: I,
        requestedMaxHeight: c.maxHeight,
        align: c.align,
        gap: c.gap
      }, z = Me(T);
      Object.assign(A.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${z.width}px`,
        maxHeight: `${z.maxHeight}px`,
        visibility: "hidden"
      });
      const q = A.getBoundingClientRect(), V = Me({
        ...T,
        containingBlockOrigin: { left: q.left, top: q.top },
        panelHeight: q.height
      }), G = {
        position: "fixed",
        left: `${V.left}px`,
        top: `${V.top}px`,
        width: `${V.width}px`,
        maxHeight: `${V.maxHeight}px`,
        "--anchored-panel-available-height": `${V.maxHeight}px`,
        margin: "0",
        zIndex: String(c.zIndex),
        visibility: "visible"
      };
      P.value = G;
    }
    let H = null, O = !1;
    function C() {
      O || !c.open || (O = !0, requestAnimationFrame(() => {
        O = !1, c.open && E();
      }));
    }
    function h() {
      typeof ResizeObserver > "u" || (H = new ResizeObserver(C), v.value && H.observe(v.value), c.anchor && H.observe(c.anchor));
    }
    function w() {
      H?.disconnect(), H = null, O = !1;
    }
    ve(() => c.open, async (x) => {
      w(), x && (P.value = { position: "fixed", visibility: "hidden" }, await _e(), E(), h());
    }, { immediate: !0 });
    function l(x) {
      if (!c.open) return;
      const A = x.composedPath();
      v.value && A.includes(v.value) || c.anchor && A.includes(c.anchor) || s("update:open", !1);
    }
    function _(x) {
      c.open && x.key === "Escape" && s("update:open", !1);
    }
    function L() {
      c.open && E();
    }
    return document.addEventListener("click", l), document.addEventListener("keydown", _), window.addEventListener("resize", L), window.addEventListener("scroll", L, !0), me(() => {
      w(), document.removeEventListener("click", l), document.removeEventListener("keydown", _), window.removeEventListener("resize", L), window.removeEventListener("scroll", L, !0);
    }), (x, A) => e.open ? (g(), y("div", {
      key: 0,
      ref_key: "panel",
      ref: v,
      class: "anchored-panel",
      style: Fe(P.value)
    }, [
      Ae(x.$slots, "default")
    ], 4)) : D("", !0);
  }
});
function Pt() {
  let e = 0;
  return () => {
    const i = ++e;
    return () => i === e;
  };
}
const $e = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Le = Object.keys($e), Pe = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Ot({ detail: e }) {
  const i = M(!1), c = M(""), s = M(""), v = M([]), P = M(""), E = M([]), H = M([]), O = M("");
  let C = !0;
  const h = Pt();
  let w = !1, l = !1;
  const _ = ue(() => {
    const d = P.value.trim().toLowerCase();
    return d ? v.value.filter(
      (n) => (n.name || "").toLowerCase().includes(d) || (n.description || "").toLowerCase().includes(d)
    ) : v.value;
  });
  function L(d) {
    const n = d.toLowerCase();
    return n.includes("no implementation") || n.includes("no engine") || n.includes("contract unavailable") || n.includes("not found") && n.includes("binding");
  }
  async function x() {
    if (!C) return !1;
    const d = h();
    i.value = !0, c.value = "", s.value = "";
    try {
      const { data: n } = await F.get("/api/v1/knowledge/list");
      if (!n?.success) {
        const $ = n?.error || "failed to load knowledge bases";
        if (L($))
          return d() && C && (s.value = Pe), !1;
        throw new Error($);
      }
      return d() && C && (v.value = n.items || []), !0;
    } catch (n) {
      const $ = se(n, "could not load knowledge bases");
      return d() && C && (L($) ? s.value = Pe : c.value = $), !1;
    } finally {
      d() && (i.value = !1, C && l && !w && te());
    }
  }
  async function A() {
    try {
      const { data: d } = await F.get("/api/v1/knowledge/models");
      E.value = d?.success ? d.models || [] : [];
    } catch {
      E.value = [];
    }
  }
  async function R() {
    try {
      const { data: d } = await F.get("/api/v1/knowledge/engines");
      H.value = d?.success ? d.engines || [] : [];
    } catch {
      H.value = [];
    }
  }
  function I(d) {
    return H.value.find((n) => n.kb_type === d);
  }
  async function T() {
    O.value = "";
    try {
      const [d, n] = await Promise.all([
        F.get("/api/v1/knowledge/engines"),
        F.get("/api/v1/knowledge/models")
      ]);
      if (!d.data?.success) throw new Error(d.data?.error || "Could not load knowledge engines.");
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load embedding models.");
      H.value = d.data.engines || [], E.value = n.data.models || [];
    } catch (d) {
      H.value = [], E.value = [], O.value = se(d, "Could not load knowledge engines.");
    }
  }
  function z(d) {
    return !!d && typeof d == "object" && !Array.isArray(d);
  }
  function q(d) {
    if (z(d)) return d;
    if (!(typeof d != "string" || !d))
      try {
        const n = JSON.parse(d);
        return z(n) ? n : void 0;
      } catch {
        return;
      }
  }
  function V(d, n) {
    if (!n) return;
    let $ = d;
    for (const t of n.split(".")) {
      if (!z($)) return;
      $ = $[t];
    }
    return $;
  }
  function G(d, n) {
    if (!Array.isArray(n)) return [];
    const $ = [];
    for (const t of n) {
      const u = V(d, t.path), f = typeof u == "number" ? u : Number(u || 0);
      f < (t.min ?? 0) || $.push({ icon: t.icon, value: f, label: String(f === 1 ? t.singular : t.plural) });
    }
    return $;
  }
  function J(d, n) {
    return Object.prototype.hasOwnProperty.call(d, n);
  }
  function re(d, n) {
    return Le.some(($) => J(d, $)) ? !0 : Array.isArray(n) ? n.some(($) => {
      const t = $.path || "";
      return t !== "" && J(d, t.split(".")[0]);
    }) : !1;
  }
  function ne(d, n, $) {
    const t = String(n.kb_type || $ || ""), u = I(t), f = {
      kb_type: t || $,
      badge: u?.badge
    };
    for (const k of Le) {
      const S = n[k];
      J(n, k) && typeof S == "number" && (f[k] = S);
    }
    return (re(n, u?.stats_spec) || J(n, "kb_type")) && (f.stat_items = G({ ...d, ...n }, u?.stats_spec)), f;
  }
  function Y(d, n, $ = []) {
    const t = {};
    typeof n.title == "string" && (t.name = n.title), typeof n.comment == "string" && (t.description = n.comment), typeof n.icon == "string" && (t.icon = n.icon), typeof n.status == "string" && (t.status = n.status), typeof n.auto_summary == "string" && (t.auto_summary = n.auto_summary), typeof n.auto_description == "string" && (t.auto_description = n.auto_description), typeof n.kb_type == "string" && (t.kb_type = n.kb_type), Object.assign(t, ne(d, n, t.kb_type || d.kb_type));
    const u = { ...d, ...t };
    for (const f of $) {
      const k = f === "title" ? "name" : f;
      delete u[k];
    }
    return u;
  }
  const oe = M(null);
  function Q(d, n) {
    const $ = q(n.meta) || {}, t = n.deleted || [];
    v.value = v.value.map((u) => u.id === d ? Y(u, $, t) : u), e.value?.id === d && (e.value = Y(e.value, $, t));
  }
  function B() {
    C = !1, l = !1, pe?.(), oe.value?.(), oe.value = null;
  }
  async function te() {
    if (C) {
      if (w || i.value) {
        l = !0;
        return;
      }
      w = !0;
      try {
        do
          l = !1, await x();
        while (C && l);
      } finally {
        w = !1;
      }
    }
  }
  const pe = Ke("@message", (d) => {
    const n = nt(d, void 0, $e);
    if (!n) return;
    const $ = v.value.some((t) => t.id === n.component_id);
    ($ || e.value?.id === n.component_id) && Q(n.component_id, n), !$ && typeof n.meta.kb_type == "string" && n.meta.kb_type && te();
  });
  return me(B), {
    loading: i,
    error: c,
    notice: s,
    kbs: v,
    query: P,
    filtered: _,
    models: E,
    engines: H,
    dialogLoadError: O,
    load: x,
    loadModels: A,
    loadEngines: R,
    engineFor: I,
    loadDialogCatalog: T,
    detailUnsub: oe,
    applyComponentMetaEvent: Q,
    clearComponentSubscriptions: B
  };
}
function Ht({ detail: e, detailUnsub: i, kbs: c, engines: s, engineFor: v, applyComponentMetaEvent: P, route: E, navigate: H, loadEngines: O }) {
  const C = M(!1), h = M(""), w = M(null);
  let l = null, _ = 0, L = 0;
  const x = ue(() => e.value ? v(e.value.kb_type || "")?.manage_ui_id : void 0), A = ue(() => (e.value ? v(e.value.kb_type || "")?.manage_views : void 0) || []), R = ue(() => A.value.length > 1), I = M(""), T = M("");
  let z = !1, q = 0;
  function V() {
    const t = e.value?.kb_type;
    return t ? `kx:kb:detail-view:${t}` : null;
  }
  ve(A, (t) => {
    if (!t.length) {
      I.value = "";
      return;
    }
    const u = t.map((S) => S.id);
    let f = "";
    try {
      const S = V();
      f = S && localStorage.getItem(S) || "";
    } catch {
    }
    const k = u.includes(f) ? f : u[0];
    k !== I.value && (I.value = k);
  }, { immediate: !0 });
  function G() {
    const t = { kb_id: e.value?.id, route: T.value };
    return I.value && (t.view = I.value), JSON.stringify(t);
  }
  function J(t) {
    if (t !== I.value) {
      I.value = t;
      try {
        const u = V();
        u && localStorage.setItem(u, t);
      } catch {
      }
      try {
        l?.setAttribute("config", G());
      } catch {
      }
    }
  }
  function re(t) {
    t.stopPropagation();
    const u = e.value?.id;
    if (!u || z) return;
    const f = typeof t.detail == "string" ? t.detail : t.detail?.path ?? t.detail?.route ?? "", k = String(f || "").replace(/^\/+/, "");
    T.value = k, Q(k ? `${u}/${k}` : u);
  }
  function ne(t) {
    t.stopPropagation();
  }
  function Y(t = !0) {
    t && L++, l && (l.removeEventListener("kb-changed", ne), l.removeEventListener("navigate", re), l.remove(), l = null);
  }
  async function oe() {
    const t = ++L;
    Y(!1);
    const u = x.value, f = w.value, k = e.value?.id;
    if (!u || !f || !k) return;
    try {
      await Ne(u, { timeoutMs: 8e3 });
    } catch {
    }
    if (t !== L || e.value?.id !== k || x.value !== u || w.value !== f) return;
    f.replaceChildren();
    const S = document.createElement(u);
    try {
      S.setAttribute("config", G());
    } catch {
    }
    S.addEventListener("kb-changed", ne), S.addEventListener("navigate", re), f.appendChild(S), l = S;
  }
  function Q(t) {
    z || H(t);
  }
  function B(t, u) {
    return _ === t && e.value?.id === u;
  }
  async function te(t, u = !0) {
    const f = ++_, k = t.id;
    e.value = { ...t }, i.value?.(), i.value = k ? ot(k, (S) => P(k, S), $e) : null, h.value = "", C.value = !0, Y(), u && Q(k);
    try {
      const { data: S } = await F.get(`/api/v1/knowledge/${k}`);
      if (!B(f, k)) return;
      S?.success ? e.value = { ...e.value, ...S } : h.value = S?.error || "could not load knowledge base";
    } catch (S) {
      if (!B(f, k)) return;
      h.value = se(S, "could not load knowledge base");
    } finally {
      B(f, k) && (C.value = !1);
    }
    B(f, k) && (s.value.length || await O(), B(f, k) && (await _e(), B(f, k) && await oe()));
  }
  async function pe() {
    const t = e.value?.id;
    if (!t) return;
    const u = ++_;
    h.value = "";
    try {
      const { data: f } = await F.get(`/api/v1/knowledge/${t}`);
      if (!B(u, t)) return;
      f?.success ? e.value = { ...e.value, ...f } : h.value = f?.error || "could not load knowledge base";
    } catch (f) {
      if (!B(u, t)) return;
      h.value = se(f, "could not load knowledge base");
    }
    if (B(u, t) && (await _e(), !!B(u, t)))
      try {
        l?.setAttribute("config", G());
      } catch {
      }
  }
  function d() {
    const t = e.value?.id;
    if (!t || !T.value) {
      n();
      return;
    }
    H({ path: t, back: { within: t } });
  }
  function n(t = !0) {
    _++, Y(), i.value?.(), i.value = null, e.value = null, T.value = "", t && Q("");
  }
  async function $(t) {
    const u = ++q, f = String(t || "").split("/").filter(Boolean), k = f[0] || "", S = f.slice(1).join("/");
    z = !0;
    try {
      if (u !== q) return;
      if (!k)
        e.value && n(!1);
      else if (e.value?.id !== k) {
        T.value = S;
        const ke = c.value.find((ge) => ge.id === k);
        if (await te(ke || { id: k }, !1), u !== q) return;
      } else if (S !== T.value) {
        T.value = S;
        try {
          l?.setAttribute("config", G());
        } catch {
        }
      }
    } finally {
      u === q && (z = !1);
    }
  }
  return ve(E, (t) => {
    $(t);
  }), me(() => {
    Y(), i.value?.(), i.value = null;
  }), {
    detailLoading: C,
    detailError: h,
    detailHost: w,
    detailManageTag: x,
    detailViews: A,
    detailHasViews: R,
    detailView: I,
    innerRoute: T,
    setDetailView: J,
    openDetail: te,
    refreshOpenDetail: pe,
    closeDetail: n,
    backDetail: d,
    applyRoute: $,
    pushRoute: Q,
    unmountDetailWc: Y
  };
}
const At = { class: "kx" }, Kt = { class: "kx-head" }, Nt = { class: "kx-head-icon" }, Rt = { class: "kx-head-actions" }, It = { class: "kx-count" }, Tt = { class: "kx-search" }, zt = {
  key: 0,
  class: "kx-err"
}, Bt = {
  key: 1,
  class: "kx-notice"
}, qt = { class: "kx-body" }, Vt = {
  key: 0,
  class: "kx-loading"
}, Wt = {
  key: 1,
  class: "kx-empty"
}, Ut = { class: "kx-empty-ico" }, Jt = {
  key: 2,
  class: "kx-empty"
}, Ft = {
  key: 3,
  class: "kx-grid"
}, Gt = ["aria-label", "onClick", "onKeydown"], Yt = { class: "kx-card-head" }, Qt = { class: "kx-ficon" }, Xt = { class: "kx-card-id" }, Zt = ["title"], en = {
  key: 0,
  class: "kx-card-meta"
}, tn = { class: "kx-card-desc" }, nn = {
  key: 0,
  class: "kx-stats"
}, on = ["title", "aria-label"], an = { class: "kx-bar" }, sn = { class: "kx-bar-l" }, rn = ["title"], ln = { class: "kx-summary-pop-h" }, dn = {
  key: 0,
  class: "kx-summary-pop-sum"
}, cn = {
  key: 1,
  class: "kx-summary-pop-desc"
}, un = { class: "kx-bar-r" }, pn = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, gn = ["aria-selected", "onClick"], fn = {
  key: 0,
  class: "kx-err"
}, vn = {
  key: 0,
  class: "kx-loading"
}, yn = {
  key: 0,
  class: "kx-detail-meta"
}, mn = {
  key: 0,
  class: "kx-detail-desc"
}, bn = { class: "kx-stats" }, hn = {
  key: 0,
  class: "kx-stat"
}, kn = /* @__PURE__ */ he({
  __name: "knowledge",
  setup(e) {
    const i = (p) => (p ?? 0).toLocaleString();
    function c(p) {
      if (p === "neutral") return "secondary";
      if (p === "warning") return "warn";
      if (p === "info" || p === "success" || p === "danger") return p;
    }
    const s = M(null), v = Ot({ detail: s }), {
      loading: P,
      error: E,
      notice: H,
      kbs: O,
      query: C,
      filtered: h,
      models: w,
      engines: l,
      dialogLoadError: _,
      load: L,
      loadEngines: x,
      engineFor: A,
      loadDialogCatalog: R,
      detailUnsub: I,
      applyComponentMetaEvent: T
    } = v, z = at(), q = it(), V = Ht({
      detail: s,
      detailUnsub: I,
      kbs: O,
      engines: l,
      engineFor: A,
      applyComponentMetaEvent: T,
      route: ue(() => z.value.route),
      navigate: (p) => q("navigate", p),
      loadEngines: x
    }), {
      detailLoading: G,
      detailError: J,
      detailHost: re,
      detailManageTag: ne,
      detailViews: Y,
      detailHasViews: oe,
      detailView: Q,
      setDetailView: B,
      openDetail: te,
      refreshOpenDetail: pe,
      closeDetail: d,
      backDetail: n,
      applyRoute: $
    } = V;
    function t(p) {
      s.value ? J.value = p : E.value = p;
    }
    const u = M(!1), f = M(null);
    async function k() {
      f.value = null, await R(), u.value = !0;
    }
    async function S(p) {
      E.value = "", J.value = "", _.value = "", l.value.length || await x();
      try {
        const { data: r } = await F.get(`/api/v1/knowledge/${p.id}`);
        if (!r?.success) throw new Error(r?.error || "could not load knowledge base settings");
        f.value = {
          id: p.id,
          name: r.name ?? p.name,
          description: r.description ?? p.description,
          icon: r.icon ?? p.icon,
          kb_type: r.kb_type ?? p.kb_type,
          embedding_model: r.embedding_model,
          config: r.config && typeof r.config == "object" ? r.config : {}
        }, u.value = !0;
      } catch (r) {
        f.value = null, u.value = !1, t(se(r, "could not load knowledge base settings"));
      }
    }
    async function ke() {
      u.value = !1;
      const p = s.value?.id;
      if (await L(), p && f.value && f.value.id === p)
        try {
          const { data: r } = await F.get(`/api/v1/knowledge/${p}`);
          r?.success && s.value && s.value.id === p && (s.value = { ...s.value, ...r });
        } catch {
        }
      f.value = null;
    }
    async function ge(p) {
      if (await Ze.confirm({
        header: "Delete knowledge base",
        message: `Delete “${p.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        t(""), E.value = "";
        try {
          const { data: o } = await F.delete(`/api/v1/knowledge/${p.id}`);
          if (!o?.success) throw new Error(o?.error || "delete failed");
          Te(p.id, o), s.value?.id === p.id && d(), await L();
        } catch (o) {
          t(se(o, "delete failed"));
        }
      }
    }
    const le = M(!1), we = M(null), de = M(null);
    function Ce(p) {
      we.value = p, le.value = !0;
    }
    function Se() {
      le.value = !1, we.value = null;
    }
    const ce = M(!1), Ee = M(null);
    function je(p) {
      p.key === "Escape" && le.value && Se();
    }
    Ge(() => {
      window.addEventListener("keydown", je);
    }), me(() => {
      window.removeEventListener("keydown", je);
    });
    async function Ie() {
      const p = we.value;
      if (!de.value || !p) return;
      if (de.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Ne("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const r = document.createElement("kickside-share");
      r.setAttribute("config", JSON.stringify({
        resource_id: p.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(p.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(p.id)}`,
        title: p.name || ""
      })), r.style.display = "block", r.addEventListener("close", Se), de.value.appendChild(r);
    }
    ve([le, de], async () => {
      le.value && de.value && await Ie();
    }), Be(async () => {
      try {
        await Promise.all([L(), x(), pe()]), !s.value && z.value.route && await $(z.value.route);
      } catch (p) {
        E.value = se(p, "host API unavailable");
      }
    });
    const { acceptDeletion: Te } = vt(O, (p) => p.id, (p) => {
      s.value?.id === p && d();
    }, L);
    return (p, r) => (g(), y("div", At, [
      s.value ? (g(), y(ee, { key: 1 }, [
        m("div", an, [
          m("div", sn, [
            m("button", {
              class: "kx-back",
              onClick: r[2] || (r[2] = (o) => a(n)())
            }, [
              b(a(j), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              r[16] || (r[16] = Z(" Back", -1))
            ]),
            m("h1", {
              class: "kx-title",
              title: s.value.name || "(untitled)"
            }, N(s.value.name || "(untitled)"), 9, rn),
            s.value.badge ? (g(), fe(a(xe), {
              key: 0,
              severity: c(s.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: W(() => [
                b(a(j), {
                  icon: s.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                Z(N(s.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : D("", !0),
            b(Dt, {
              items: s.value.stat_items || []
            }, null, 8, ["items"]),
            s.value.auto_summary || s.value.auto_description ? (g(), y("span", {
              key: 1,
              ref_key: "summaryAnchor",
              ref: Ee,
              class: "kx-summary"
            }, [
              b(a(X), {
                severity: "secondary",
                outlined: "",
                class: U(["kx-summary-btn", { on: ce.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ce.value,
                onClick: r[3] || (r[3] = ie((o) => ce.value = !ce.value, ["stop"]))
              }, {
                icon: W(({ class: o }) => [
                  b(a(j), {
                    icon: "tabler:sparkles",
                    class: U(o),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              b(Lt, {
                open: ce.value,
                "onUpdate:open": r[5] || (r[5] = (o) => ce.value = o),
                anchor: Ee.value,
                width: 340
              }, {
                default: W(() => [
                  m("div", {
                    class: "kx-summary-pop",
                    onClick: r[4] || (r[4] = ie(() => {
                    }, ["stop"]))
                  }, [
                    m("div", ln, [
                      b(a(j), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      r[17] || (r[17] = m("span", null, "About this knowledge base", -1))
                    ]),
                    s.value.auto_summary ? (g(), y("p", dn, N(s.value.auto_summary), 1)) : D("", !0),
                    s.value.auto_description ? (g(), y("p", cn, N(s.value.auto_description), 1)) : D("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ], 512)) : D("", !0)
          ]),
          m("div", un, [
            a(oe) ? (g(), y("div", pn, [
              (g(!0), y(ee, null, be(a(Y), (o) => (g(), y("button", {
                key: o.id,
                class: U(["kx-viewseg-btn", { on: a(Q) === o.id }]),
                role: "tab",
                "aria-selected": a(Q) === o.id,
                onClick: (K) => a(B)(o.id)
              }, [
                o.icon ? (g(), fe(a(j), {
                  key: 0,
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : D("", !0),
                Z(" " + N(o.label), 1)
              ], 10, gn))), 128))
            ])) : D("", !0),
            b(a(X), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: r[6] || (r[6] = (o) => S(s.value))
            }, {
              icon: W(({ class: o }) => [
                b(a(j), {
                  icon: "tabler:pencil",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            b(a(X), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: r[7] || (r[7] = (o) => Ce(s.value))
            }, {
              icon: W(({ class: o }) => [
                b(a(j), {
                  icon: "tabler:share",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            b(a(X), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: r[8] || (r[8] = (o) => ge(s.value))
            }, {
              icon: W(({ class: o }) => [
                b(a(j), {
                  icon: "tabler:trash",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(J) ? (g(), y("div", fn, N(a(J)), 1)) : D("", !0),
        m("div", {
          class: U(["kx-body", { "kx-body-bleed": a(ne) }])
        }, [
          a(G) ? (g(), y("div", vn, [
            b(a(j), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            r[18] || (r[18] = Z(" Loading… ", -1))
          ])) : (g(), y(ee, { key: 1 }, [
            a(ne) ? D("", !0) : (g(), y("div", yn, [
              s.value.description ? (g(), y("div", mn, N(s.value.description), 1)) : D("", !0),
              m("div", bn, [
                s.value.embedding_model ? (g(), y("span", hn, [
                  b(a(j), {
                    icon: "tabler:vector",
                    "aria-hidden": "true"
                  }),
                  Z(N(s.value.embedding_model), 1)
                ])) : D("", !0)
              ])
            ])),
            m("div", {
              ref_key: "detailHost",
              ref: re,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (g(), y(ee, { key: 0 }, [
        m("header", Kt, [
          m("div", Nt, [
            b(a(j), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          r[10] || (r[10] = m("div", { class: "kx-head-text" }, [
            m("h1", { class: "kx-head-title" }, "Knowledge"),
            m("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          m("div", Rt, [
            m("span", It, N(a(O).length) + " knowledge base" + N(a(O).length !== 1 ? "s" : ""), 1),
            m("div", Tt, [
              b(a(j), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Ye(m("input", {
                "onUpdate:modelValue": r[0] || (r[0] = (o) => Qe(C) ? C.value = o : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Xe, a(C)]
              ])
            ]),
            b(a(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: k
            }, {
              icon: W(({ class: o }) => [
                b(a(j), {
                  icon: "tabler:plus",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(E) ? (g(), y("div", zt, N(a(E)), 1)) : D("", !0),
        a(H) ? (g(), y("div", Bt, [
          b(a(j), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          r[11] || (r[11] = m("span", null, [
            m("strong", null, "No knowledge engine installed."),
            Z(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : D("", !0),
        m("div", qt, [
          a(P) && !a(O).length ? (g(), y("div", Vt, [
            b(a(j), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            r[12] || (r[12] = Z(" Loading… ", -1))
          ])) : a(O).length ? a(h).length ? (g(), y("div", Ft, [
            (g(!0), y(ee, null, be(a(h), (o) => (g(), y("div", {
              key: o.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${o.name || "knowledge base"}`,
              onClick: (K) => !o.deleting_at && a(te)(o),
              onKeydown: [
                De((K) => !o.deleting_at && a(te)(o), ["enter"]),
                De(ie((K) => !o.deleting_at && a(te)(o), ["prevent"]), ["space"])
              ]
            }, [
              b(ft, {
                state: o,
                onRetry: (K) => ge(o)
              }, null, 8, ["state", "onRetry"]),
              m("div", Yt, [
                m("span", Qt, [
                  b(a(j), {
                    icon: o.icon || o.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                m("div", Xt, [
                  m("div", {
                    class: "kx-card-name",
                    title: o.name || "(untitled)"
                  }, N(o.name || "(untitled)"), 9, Zt),
                  o.badge ? (g(), y("div", en, [
                    b(a(xe), {
                      severity: c(o.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: W(() => [
                        b(a(j), {
                          icon: o.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        Z(N(o.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : D("", !0)
                ]),
                m("div", {
                  class: "kx-card-actions",
                  onClick: r[1] || (r[1] = ie(() => {
                  }, ["stop"]))
                }, [
                  b(a(X), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${o.name}`,
                    onClick: (K) => !o.deleting_at && S(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: W(({ class: K }) => [
                      b(a(j), {
                        icon: "tabler:pencil",
                        class: U(K),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  b(a(X), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${o.name}`,
                    onClick: (K) => Ce(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: W(({ class: K }) => [
                      b(a(j), {
                        icon: "tabler:share",
                        class: U(K),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  b(a(X), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${o.name}`,
                    onClick: (K) => ge(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: W(({ class: K }) => [
                      b(a(j), {
                        icon: "tabler:trash",
                        class: U(K),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              m("div", tn, N(o.description || "No description"), 1),
              o.stat_items && o.stat_items.length ? (g(), y("div", nn, [
                (g(!0), y(ee, null, be(o.stat_items, (K, ze) => (g(), y("span", {
                  key: ze,
                  class: "kx-stat",
                  title: `${i(K.value)} ${K.label}`,
                  "aria-label": `${i(K.value)} ${K.label}`
                }, [
                  K.icon ? (g(), fe(a(j), {
                    key: 0,
                    icon: K.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : D("", !0),
                  Z(N(i(K.value)), 1)
                ], 8, on))), 128))
              ])) : D("", !0)
            ], 40, Gt))), 128))
          ])) : (g(), y("div", Jt, [...r[15] || (r[15] = [
            m("div", { class: "kx-empty-title" }, "No matches", -1),
            m("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (g(), y("div", Wt, [
            m("div", Ut, [
              b(a(j), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            r[13] || (r[13] = m("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            r[14] || (r[14] = m("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            b(a(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: k
            }, {
              icon: W(({ class: o }) => [
                b(a(j), {
                  icon: "tabler:plus",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      b(We, {
        open: u.value,
        api: a(F),
        engines: a(l),
        models: a(w),
        target: f.value,
        "load-error": a(_),
        onRetry: a(R),
        onClose: r[9] || (r[9] = (o) => u.value = !1),
        onSaved: ke
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (g(), y("div", {
        key: 2,
        ref_key: "shareHost",
        ref: de
      }, null, 512)) : D("", !0)
    ]));
  }
}), wn = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, _n = {
  wippy: wn
};
class xn extends qe {
  static get wippyConfig() {
    return {
      propsSchema: _n.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: st
    };
  }
  static get vueConfig() {
    return { rootComponent: kn, plugins: [Ue] };
  }
}
et(import.meta.url, xn);
//# sourceMappingURL=index.js.map
