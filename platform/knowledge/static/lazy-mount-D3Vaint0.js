import { B as He, s as Re, f as Ve, a as We, P as Ue } from "./wc-runtime-Bmxpx-Ro.js";
import { openBlock as v, createElementBlock as y, mergeProps as re, createElementVNode as h, defineComponent as we, computed as ve, withModifiers as le, Fragment as Z, createTextVNode as Q, toDisplayString as R, createCommentVNode as j, createVNode as k, unref as s, watch as ye, onBeforeUnmount as be, createBlock as me, resolveDynamicComponent as Je, renderSlot as ze, renderList as ke, ref as M, nextTick as xe, normalizeStyle as Ye, onMounted as Fe, withDirectives as Ge, isRef as Qe, vModelText as Xe, withCtx as J, normalizeClass as Y, withKeys as Le } from "vue";
import { s as X, e as de, _ as Ze } from "./KbDialog.vue_vue_type_script_setup_true_lang-DxwanWWB.js";
import { on as Ne, api as F, loadByTagName as Te, host as et } from "@wippy-fe/proxy";
import { c as tt, a as nt, s as ot, u as at, b as st } from "./constants-7oupJIJB.js";
import { Icon as E } from "@iconify/vue";
var it = `
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
`, rt = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, lt = He.extend({
  name: "progressspinner",
  style: it,
  classes: rt
}), dt = {
  name: "BaseProgressSpinner",
  extends: Re,
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
  style: lt,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Ke = {
  name: "ProgressSpinner",
  extends: dt,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, ct = ["fill", "stroke-width"];
function ut(e, o, c, r, f, L) {
  return v(), y("div", re({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(v(), y("svg", re({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: L.svgStyle
  }, e.ptm("spin")), [h("circle", re({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, ct)], 16))], 16);
}
Ke.render = ut;
const pt = { key: 0 }, ft = /* @__PURE__ */ we({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const o = e, c = ve(() => o.state.deletion_job === null || ["dead", "cancelled"].includes(o.state.deletion_job?.status || ""));
    return (r, f) => e.state.deleting_at ? (v(), y("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = le(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = le(() => {
      }, ["stop"]))
    }, [
      c.value ? (v(), y(Z, { key: 0 }, [
        h("span", null, [
          f[3] || (f[3] = Q("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (v(), y("span", pt, ": " + R(e.state.deletion_job.last_error), 1)) : j("", !0)
        ]),
        k(s(X), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = le((L) => r.$emit("retry"), ["stop"]))
        })
      ], 64)) : (v(), y(Z, { key: 1 }, [
        k(s(Ke), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = h("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : j("", !0);
  }
});
function gt(e, o, c, r) {
  const f = /* @__PURE__ */ new Set(), L = /* @__PURE__ */ new Map();
  function S(w, x) {
    const $ = e.value.find((z) => o(z) === w), u = L.get(w), _ = x?.job_id || u?.state.deletion_job_id || $?.deletion_job_id, C = u ? u.state.deletion_job_id : $?.deleting_at ? $.deletion_job_id : void 0;
    if ((u || $?.deleting_at) && _ === C || _ && u?.superseded.has(_)) return;
    const m = {
      deleting_at: u?.state.deleting_at || $?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: _
    }, A = new Set(u?.superseded);
    for (const z of [u?.state.deletion_job_id, $?.deletion_job_id])
      z && z !== _ && A.add(z);
    L.set(w, { state: m, superseded: A }), $ && (Object.assign($, m), $.deletion_job = void 0);
  }
  const O = ye(() => e.value, (w, x = []) => {
    const $ = w.filter((u) => !f.has(o(u)));
    for (const u of x)
      f.has(o(u)) || $.some((_) => o(_) === o(u)) || (c?.(o(u)), u.deleting_at && r?.(o(u)));
    if ($.length !== w.length) {
      e.value = $;
      return;
    }
    for (const u of w) {
      u.deleting_at && u.deletion_job === void 0 && !x.includes(u) && (u.deletion_job = null);
      const _ = L.get(o(u));
      if (_) {
        const m = u.deletion_job_id;
        u.deleting_at && m && m !== _.state.deletion_job_id && !_.superseded.has(m) && (_.state.deletion_job_id && _.superseded.add(_.state.deletion_job_id), _.state.deletion_job_id = m), m !== _.state.deletion_job_id && (u.deletion_job = void 0), Object.assign(u, _.state);
      }
      const C = x.find((m) => o(m) === o(u));
      u.deletion_job === void 0 && C?.deletion_job_id === u.deletion_job_id && (u.deletion_job = C?.deletion_job);
    }
  }, { immediate: !0 }), P = Ne("@message", (w) => {
    const x = tt(w);
    if (!x) return;
    const $ = e.value.find((u) => o(u) === x.component_id);
    x.event === "component.deleted" ? ($ && !f.has(x.component_id) && (c?.(x.component_id), r?.(x.component_id)), f.add(x.component_id), L.delete(x.component_id), e.value = e.value.filter((u) => o(u) !== x.component_id)) : $ && S(x.component_id, { job_id: x.deletion_job_id });
  });
  return be(() => {
    O(), typeof P == "function" && P();
  }), { acceptDeletion: S };
}
var vt = `
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
  root: function(o) {
    var c = o.props;
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
}, yt = He.extend({
  name: "tag",
  style: vt,
  classes: mt
}), ht = {
  name: "BaseTag",
  extends: Re,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: yt,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function he(e) {
  "@babel/helpers - typeof";
  return he = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(o) {
    return typeof o;
  } : function(o) {
    return o && typeof Symbol == "function" && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, he(e);
}
function bt(e, o, c) {
  return (o = kt(o)) in e ? Object.defineProperty(e, o, { value: c, enumerable: !0, configurable: !0, writable: !0 }) : e[o] = c, e;
}
function kt(e) {
  var o = _t(e, "string");
  return he(o) == "symbol" ? o : o + "";
}
function _t(e, o) {
  if (he(e) != "object" || !e) return e;
  var c = e[Symbol.toPrimitive];
  if (c !== void 0) {
    var r = c.call(e, o);
    if (he(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (o === "string" ? String : Number)(e);
}
var $e = {
  name: "Tag",
  extends: ht,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ve(bt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, wt = ["data-p"];
function xt(e, o, c, r, f, L) {
  return v(), y("span", re({
    class: e.cx("root"),
    "data-p": L.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (v(), me(Je(e.$slots.icon), re({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (v(), y("span", re({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : j("", !0), e.value != null || e.$slots.default ? ze(e.$slots, "default", {
    key: 2
  }, function() {
    return [h("span", re({
      class: e.cx("label")
    }, e.ptm("label")), R(e.value), 17)];
  }) : j("", !0)], 16, wt);
}
$e.render = xt;
const $t = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, St = {
  key: 0,
  "aria-hidden": "true"
}, Ct = { class: "kx-header-stat" }, Et = { class: "kx-header-stat-label" }, jt = /* @__PURE__ */ we({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (o, c) => e.items.length ? (v(), y("span", $t, [
      (v(!0), y(Z, null, ke(e.items, (r, f) => (v(), y(Z, { key: f }, [
        f ? (v(), y("span", St, " · ")) : j("", !0),
        h("span", Ct, [
          r.icon ? (v(), me(s(E), {
            key: 0,
            icon: r.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : j("", !0),
          h("span", Et, R(r.value.toLocaleString()) + " " + R(r.label), 1)
        ])
      ], 64))), 128))
    ])) : j("", !0);
  }
}), Mt = 2e3;
function Pe(e) {
  const o = e.margin ?? 8, c = e.gap ?? 4, r = Math.max(0, e.viewportWidth), f = Math.max(0, e.viewportHeight), L = Math.max(0, r - o * 2), S = Math.min(Math.max(0, e.requestedWidth), L), O = e.align === "right" ? e.anchor.right - S : e.anchor.left, P = Math.max(o, Math.min(O, r - o - S)), w = Math.max(0, f - e.anchor.bottom - c - o), x = Math.max(0, e.anchor.top - c - o), $ = w < e.requestedMaxHeight && x > w ? "above" : "below", u = $ === "above" ? x : w, _ = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), u)), C = Math.min(Math.max(0, e.panelHeight ?? _), _), m = $ === "above" ? e.anchor.top - c - C : e.anchor.bottom + c, A = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(P - A.left),
    width: Math.round(S),
    maxHeight: _,
    side: $,
    top: Math.round(m - A.top)
  };
}
const Dt = /* @__PURE__ */ we({
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
  setup(e, { emit: o }) {
    const c = e, r = o, f = M(null), L = M({ position: "fixed", visibility: "hidden" });
    function S() {
      const m = c.anchor, A = f.value;
      if (!m || !A) return;
      const z = m.getBoundingClientRect(), N = c.width === "anchor" ? Math.max(c.minWidth, z.width) : Math.max(c.minWidth, c.width), T = {
        anchor: z,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: N,
        requestedMaxHeight: c.maxHeight,
        align: c.align,
        gap: c.gap
      }, q = Pe(T);
      Object.assign(A.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${q.width}px`,
        maxHeight: `${q.maxHeight}px`,
        visibility: "hidden"
      });
      const I = A.getBoundingClientRect(), W = Pe({
        ...T,
        containingBlockOrigin: { left: I.left, top: I.top },
        panelHeight: I.height
      }), U = {
        position: "fixed",
        left: `${W.left}px`,
        top: `${W.top}px`,
        width: `${W.width}px`,
        maxHeight: `${W.maxHeight}px`,
        "--anchored-panel-available-height": `${W.maxHeight}px`,
        margin: "0",
        zIndex: String(c.zIndex),
        visibility: "visible"
      };
      L.value = U;
    }
    let O = null, P = !1;
    function w() {
      P || !c.open || (P = !0, requestAnimationFrame(() => {
        P = !1, c.open && S();
      }));
    }
    function x() {
      typeof ResizeObserver > "u" || (O = new ResizeObserver(w), f.value && O.observe(f.value), c.anchor && O.observe(c.anchor));
    }
    function $() {
      O?.disconnect(), O = null, P = !1;
    }
    ye(() => c.open, async (m) => {
      $(), m && (L.value = { position: "fixed", visibility: "hidden" }, await xe(), S(), x());
    }, { immediate: !0 });
    function u(m) {
      if (!c.open) return;
      const A = m.composedPath();
      f.value && A.includes(f.value) || c.anchor && A.includes(c.anchor) || r("update:open", !1);
    }
    function _(m) {
      !c.open || m.key !== "Escape" || (m.preventDefault(), m.stopImmediatePropagation(), r("update:open", !1));
    }
    function C() {
      c.open && S();
    }
    return document.addEventListener("click", u), document.addEventListener("keydown", _, !0), window.addEventListener("resize", C), window.addEventListener("scroll", C, !0), be(() => {
      $(), document.removeEventListener("click", u), document.removeEventListener("keydown", _, !0), window.removeEventListener("resize", C), window.removeEventListener("scroll", C, !0);
    }), (m, A) => e.open ? (v(), y("div", {
      key: 0,
      ref_key: "panel",
      ref: f,
      class: "anchored-panel",
      style: Ye(L.value)
    }, [
      ze(m.$slots, "default")
    ], 4)) : j("", !0);
  }
});
function Lt() {
  let e = 0;
  return () => {
    const o = ++e;
    return () => o === e;
  };
}
const Ce = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Oe = Object.keys(Ce), Se = [
  "document_count",
  "embedding_count",
  "claim_count",
  "failed_count",
  "node_count",
  "edge_count",
  "concept_count",
  "chunk_count",
  "summary_count"
];
function _e(e, o) {
  const c = { ...e, stat_items: o?.stat_items };
  for (const r of Se) {
    const f = o?.[r];
    f === void 0 ? delete c[r] : c[r] = f;
  }
  return c;
}
const Ae = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Pt({ detail: e }) {
  const o = M(!1), c = M(""), r = M(""), f = M([]), L = M(""), S = M([]), O = M([]), P = M("");
  let w = !0;
  const x = Lt();
  let $ = !1, u = !1, _ = 0, C = !1;
  const m = /* @__PURE__ */ new Set(), A = ve(() => {
    const n = L.value.trim().toLowerCase();
    return n ? f.value.filter(
      (t) => (t.name || "").toLowerCase().includes(n) || (t.description || "").toLowerCase().includes(n)
    ) : f.value;
  });
  function z(n) {
    const t = n.toLowerCase();
    return t.includes("no implementation") || t.includes("no engine") || t.includes("contract unavailable") || t.includes("not found") && t.includes("binding");
  }
  async function N() {
    if (!w) return !1;
    const n = x();
    _++, o.value = !0, c.value = "", r.value = "";
    try {
      const { data: t } = await F.get("/api/v1/knowledge/list");
      if (!t?.success) {
        const i = t?.error || "failed to load knowledge bases";
        if (z(i))
          return n() && w && (r.value = Ae), !1;
        throw new Error(i);
      }
      return n() && w && (f.value = t.items || []), !0;
    } catch (t) {
      const i = de(t, "could not load knowledge bases");
      return n() && w && (z(i) ? r.value = Ae : c.value = i), !1;
    } finally {
      n() && (o.value = !1, w && u && !$ && ie(), m.size && ne());
    }
  }
  async function T() {
    try {
      const { data: n } = await F.get("/api/v1/knowledge/models");
      S.value = n?.success ? n.models || [] : [];
    } catch {
      S.value = [];
    }
  }
  async function q() {
    try {
      const { data: n } = await F.get("/api/v1/knowledge/engines");
      O.value = n?.success ? n.engines || [] : [];
    } catch {
      O.value = [];
    }
  }
  function I(n) {
    return O.value.find((t) => t.kb_type === n);
  }
  async function W() {
    P.value = "";
    try {
      const [n, t] = await Promise.all([
        F.get("/api/v1/knowledge/engines"),
        F.get("/api/v1/knowledge/models")
      ]);
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load knowledge engines.");
      if (!t.data?.success) throw new Error(t.data?.error || "Could not load embedding models.");
      O.value = n.data.engines || [], S.value = t.data.models || [];
    } catch (n) {
      O.value = [], S.value = [], P.value = de(n, "Could not load knowledge engines.");
    }
  }
  function U(n) {
    return !!n && typeof n == "object" && !Array.isArray(n);
  }
  function te(n) {
    if (U(n)) return n;
    if (!(typeof n != "string" || !n))
      try {
        const t = JSON.parse(n);
        return U(t) ? t : void 0;
      } catch {
        return;
      }
  }
  function ce(n, t) {
    if (!t) return;
    let i = n;
    for (const l of t.split(".")) {
      if (!U(i)) return;
      i = i[l];
    }
    return i;
  }
  function se(n, t) {
    if (!Array.isArray(t)) return [];
    const i = [];
    for (const l of t) {
      const D = ce(n, l.path), b = typeof D == "number" ? D : Number(D || 0);
      b < (l.min ?? 0) || i.push({ icon: l.icon, value: b, label: String(b === 1 ? l.singular : l.plural) });
    }
    return i;
  }
  function B(n, t) {
    return Object.prototype.hasOwnProperty.call(n, t);
  }
  function ue(n, t) {
    return Oe.some((i) => B(n, i)) ? !0 : Array.isArray(t) ? t.some((i) => {
      const l = i.path || "";
      return l !== "" && B(n, l.split(".")[0]);
    }) : !1;
  }
  function ee(n, t, i) {
    const l = String(t.kb_type || i || ""), D = I(l), b = {
      kb_type: l || i,
      badge: D?.badge
    };
    for (const V of Oe) {
      const ae = t[V];
      B(t, V) && typeof ae == "number" && (b[V] = ae);
    }
    return (ue(t, D?.stats_spec) || B(t, "kb_type")) && (b.stat_items = se({ ...n, ...t }, D?.stats_spec)), b;
  }
  function K(n, t, i = []) {
    const l = {};
    typeof t.title == "string" && (l.name = t.title), typeof t.comment == "string" && (l.description = t.comment), typeof t.icon == "string" && (l.icon = t.icon), typeof t.status == "string" && (l.status = t.status), typeof t.auto_summary == "string" && (l.auto_summary = t.auto_summary), typeof t.auto_description == "string" && (l.auto_description = t.auto_description), typeof t.kb_type == "string" && (l.kb_type = t.kb_type), n.stats_from_store || Object.assign(l, ee(n, t, l.kb_type || n.kb_type));
    const D = { ...n, ...l };
    for (const b of i) {
      const V = b === "title" ? "name" : b;
      n.stats_from_store && Se.some((ae) => ae === V) || delete D[V];
    }
    return D;
  }
  const G = M(null);
  function pe(n, t) {
    const i = te(t.meta) || {}, l = t.deleted || [], D = f.value.find((b) => b.id === n && b.stats_from_store) || (e.value?.id === n ? e.value : void 0);
    D?.stats_from_store && (Se.some((b) => B(i, b) || l.includes(b)) || ue(i, I(D.kb_type || "")?.stats_spec)) && (m.add(n), ne()), f.value = f.value.map((b) => b.id === n ? K(b, i, l) : b), e.value?.id === n && (e.value = K(e.value, i, l));
  }
  async function ne() {
    if (!(C || o.value || !w || !m.size)) {
      C = !0;
      try {
        for (await Promise.resolve(); w && !o.value && m.size; ) {
          const n = [...m].slice(0, 100);
          for (const b of n) m.delete(b);
          const t = _, { data: i } = await F.get(`/api/v1/knowledge/list?ids=${n.map(encodeURIComponent).join(",")}`);
          if (!w) return;
          if (t !== _) {
            for (const b of n) m.add(b);
            continue;
          }
          if (!i?.success) continue;
          const l = new Map(
            (i.items || []).map((b) => [b.id, b])
          ), D = new Set(n);
          f.value = f.value.map((b) => b.stats_from_store && D.has(b.id) ? _e(b, l.get(b.id)) : b), e.value?.stats_from_store && D.has(e.value.id) && (e.value = _e(e.value, l.get(e.value.id)));
        }
      } catch {
      } finally {
        C = !1, m.size && ne();
      }
    }
  }
  function oe() {
    w = !1, u = !1, m.clear(), p?.(), G.value?.(), G.value = null;
  }
  async function ie() {
    if (w) {
      if ($ || o.value) {
        u = !0;
        return;
      }
      $ = !0;
      try {
        do
          u = !1, await N();
        while (w && u);
      } finally {
        $ = !1;
      }
    }
  }
  const p = Ne("@message", (n) => {
    const t = nt(n, void 0, Ce);
    if (!t) return;
    const i = f.value.some((l) => l.id === t.component_id);
    (i || e.value?.id === t.component_id) && pe(t.component_id, t), !i && typeof t.meta.kb_type == "string" && t.meta.kb_type && ie();
  });
  return be(oe), {
    loading: o,
    error: c,
    notice: r,
    kbs: f,
    query: L,
    filtered: A,
    models: S,
    engines: O,
    dialogLoadError: P,
    load: N,
    loadModels: T,
    loadEngines: q,
    engineFor: I,
    loadDialogCatalog: W,
    detailUnsub: G,
    applyComponentMetaEvent: pe,
    clearComponentSubscriptions: oe
  };
}
function Ot({ detail: e, detailUnsub: o, kbs: c, engines: r, engineFor: f, applyComponentMetaEvent: L, route: S, navigate: O, loadEngines: P }) {
  const w = M(!1), x = M(""), $ = M(null);
  let u = null, _ = 0, C = 0;
  const m = ve(() => e.value ? f(e.value.kb_type || "")?.manage_ui_id : void 0), A = ve(() => (e.value ? f(e.value.kb_type || "")?.manage_views : void 0) || []), z = ve(() => A.value.length > 1), N = M(""), T = M("");
  let q = !1, I = 0;
  function W() {
    const p = e.value?.kb_type;
    return p ? `kx:kb:detail-view:${p}` : null;
  }
  ye(A, (p) => {
    if (!p.length) {
      N.value = "";
      return;
    }
    const n = p.map((l) => l.id);
    let t = "";
    try {
      const l = W();
      t = l && localStorage.getItem(l) || "";
    } catch {
    }
    const i = n.includes(t) ? t : n[0];
    i !== N.value && (N.value = i);
  }, { immediate: !0 });
  function U() {
    const p = { kb_id: e.value?.id, route: T.value };
    return N.value && (p.view = N.value), JSON.stringify(p);
  }
  function te(p) {
    if (p !== N.value) {
      N.value = p;
      try {
        const n = W();
        n && localStorage.setItem(n, p);
      } catch {
      }
      try {
        u?.setAttribute("config", U());
      } catch {
      }
    }
  }
  function ce(p) {
    p.stopPropagation();
    const n = e.value?.id;
    if (!n || q) return;
    const t = typeof p.detail == "string" ? p.detail : p.detail?.path ?? p.detail?.route ?? "", i = String(t || "").replace(/^\/+/, "");
    T.value = i, ee(i ? `${n}/${i}` : n);
  }
  function se(p) {
    p.stopPropagation();
  }
  function B(p = !0) {
    p && C++, u && (u.removeEventListener("kb-changed", se), u.removeEventListener("navigate", ce), u.remove(), u = null);
  }
  async function ue() {
    const p = ++C;
    B(!1);
    const n = m.value, t = $.value, i = e.value?.id;
    if (!n || !t || !i) return;
    try {
      await Te(n, { timeoutMs: 8e3 });
    } catch {
    }
    if (p !== C || e.value?.id !== i || m.value !== n || $.value !== t) return;
    t.replaceChildren();
    const l = document.createElement(n);
    try {
      l.setAttribute("config", U());
    } catch {
    }
    l.addEventListener("kb-changed", se), l.addEventListener("navigate", ce), t.appendChild(l), u = l;
  }
  function ee(p) {
    q || O(p);
  }
  function K(p, n) {
    return _ === p && e.value?.id === n;
  }
  async function G(p, n = !0) {
    const t = ++_, i = p.id;
    e.value = { ...p }, o.value?.(), o.value = i ? ot(i, (l) => L(i, l), Ce) : null, x.value = "", w.value = !0, B(), n && ee(i);
    try {
      const { data: l } = await F.get(`/api/v1/knowledge/${i}`);
      if (!K(t, i)) return;
      if (l?.success) {
        const D = { ...e.value, ...l };
        e.value = l.stats_from_store ? _e(D, l) : D;
      } else x.value = l?.error || "could not load knowledge base";
    } catch (l) {
      if (!K(t, i)) return;
      x.value = de(l, "could not load knowledge base");
    } finally {
      K(t, i) && (w.value = !1);
    }
    K(t, i) && (r.value.length || await P(), K(t, i) && (await xe(), K(t, i) && await ue()));
  }
  async function pe() {
    const p = e.value?.id;
    if (!p) return;
    const n = ++_;
    x.value = "";
    try {
      const { data: t } = await F.get(`/api/v1/knowledge/${p}`);
      if (!K(n, p)) return;
      if (t?.success) {
        const i = { ...e.value, ...t };
        e.value = t.stats_from_store ? _e(i, t) : i;
      } else x.value = t?.error || "could not load knowledge base";
    } catch (t) {
      if (!K(n, p)) return;
      x.value = de(t, "could not load knowledge base");
    }
    if (K(n, p) && (await xe(), !!K(n, p)))
      try {
        u?.setAttribute("config", U());
      } catch {
      }
  }
  function ne() {
    const p = e.value?.id;
    if (!p || !T.value) {
      oe();
      return;
    }
    O({ path: p, back: { within: p } });
  }
  function oe(p = !0) {
    _++, B(), o.value?.(), o.value = null, e.value = null, T.value = "", p && ee("");
  }
  async function ie(p) {
    const n = ++I, t = String(p || "").split("/").filter(Boolean), i = t[0] || "", l = t.slice(1).join("/");
    q = !0;
    try {
      if (n !== I) return;
      if (!i)
        e.value && oe(!1);
      else if (e.value?.id !== i) {
        T.value = l;
        const D = c.value.find((b) => b.id === i);
        if (await G(D || { id: i }, !1), n !== I) return;
      } else if (l !== T.value) {
        T.value = l;
        try {
          u?.setAttribute("config", U());
        } catch {
        }
      }
    } finally {
      n === I && (q = !1);
    }
  }
  return ye(S, (p) => {
    ie(p);
  }), be(() => {
    B(), o.value?.(), o.value = null;
  }), {
    detailLoading: w,
    detailError: x,
    detailHost: $,
    detailManageTag: m,
    detailViews: A,
    detailHasViews: z,
    detailView: N,
    innerRoute: T,
    setDetailView: te,
    openDetail: G,
    refreshOpenDetail: pe,
    closeDetail: oe,
    backDetail: ne,
    applyRoute: ie,
    pushRoute: ee,
    unmountDetailWc: B
  };
}
const At = { class: "kx" }, Ht = { class: "kx-head" }, Rt = { class: "kx-head-icon" }, zt = { class: "kx-head-actions" }, Nt = { class: "kx-count" }, Tt = { class: "kx-search" }, Kt = {
  key: 0,
  class: "kx-err"
}, It = {
  key: 1,
  class: "kx-notice"
}, qt = { class: "kx-body" }, Bt = {
  key: 0,
  class: "kx-loading"
}, Vt = {
  key: 1,
  class: "kx-empty"
}, Wt = { class: "kx-empty-ico" }, Ut = {
  key: 2,
  class: "kx-empty"
}, Jt = {
  key: 3,
  class: "kx-grid"
}, Yt = ["aria-label", "onClick", "onKeydown"], Ft = { class: "kx-card-head" }, Gt = { class: "kx-ficon" }, Qt = { class: "kx-card-id" }, Xt = ["title"], Zt = {
  key: 0,
  class: "kx-card-meta"
}, en = { class: "kx-card-desc" }, tn = {
  key: 0,
  class: "kx-stats"
}, nn = ["title", "aria-label"], on = { class: "kx-bar" }, an = { class: "kx-bar-l" }, sn = ["title"], rn = { class: "kx-summary-pop-h" }, ln = {
  key: 0,
  class: "kx-summary-pop-sum"
}, dn = {
  key: 1,
  class: "kx-summary-pop-desc"
}, cn = { class: "kx-bar-r" }, un = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, pn = ["aria-selected", "onClick"], fn = {
  key: 0,
  class: "kx-err"
}, gn = {
  key: 0,
  class: "kx-loading"
}, vn = {
  key: 0,
  class: "kx-detail-meta"
}, mn = {
  key: 0,
  class: "kx-detail-desc"
}, yn = { class: "kx-stats" }, hn = {
  key: 0,
  class: "kx-stat"
}, bn = /* @__PURE__ */ we({
  __name: "knowledge",
  setup(e) {
    const o = (g) => (g ?? 0).toLocaleString();
    function c(g) {
      if (g === "neutral") return "secondary";
      if (g === "warning") return "warn";
      if (g === "info" || g === "success" || g === "danger") return g;
    }
    const r = M(null), f = Pt({ detail: r }), {
      loading: L,
      error: S,
      notice: O,
      kbs: P,
      query: w,
      filtered: x,
      models: $,
      engines: u,
      dialogLoadError: _,
      load: C,
      loadEngines: m,
      engineFor: A,
      loadDialogCatalog: z,
      detailUnsub: N,
      applyComponentMetaEvent: T
    } = f, q = at(), I = st(), W = Ot({
      detail: r,
      detailUnsub: N,
      kbs: P,
      engines: u,
      engineFor: A,
      applyComponentMetaEvent: T,
      route: ve(() => q.value.route),
      navigate: (g) => I("navigate", g),
      loadEngines: m
    }), {
      detailLoading: U,
      detailError: te,
      detailHost: ce,
      detailManageTag: se,
      detailViews: B,
      detailHasViews: ue,
      detailView: ee,
      setDetailView: K,
      openDetail: G,
      refreshOpenDetail: pe,
      closeDetail: ne,
      backDetail: oe,
      applyRoute: ie
    } = W;
    function p(g) {
      r.value ? te.value = g : S.value = g;
    }
    const n = M(!1), t = M(null);
    async function i() {
      t.value = null, await z(), n.value = !0;
    }
    async function l(g) {
      S.value = "", te.value = "", _.value = "", u.value.length || await m();
      try {
        const { data: d } = await F.get(`/api/v1/knowledge/${g.id}`);
        if (!d?.success) throw new Error(d?.error || "could not load knowledge base settings");
        t.value = {
          id: g.id,
          name: d.name ?? g.name,
          description: d.description ?? g.description,
          icon: d.icon ?? g.icon,
          kb_type: d.kb_type ?? g.kb_type,
          embedding_model: d.embedding_model,
          config: d.config && typeof d.config == "object" ? d.config : {}
        }, n.value = !0;
      } catch (d) {
        t.value = null, n.value = !1, p(de(d, "could not load knowledge base settings"));
      }
    }
    async function D() {
      n.value = !1;
      const g = r.value?.id;
      if (await C(), g && t.value && t.value.id === g)
        try {
          const { data: d } = await F.get(`/api/v1/knowledge/${g}`);
          d?.success && r.value && r.value.id === g && (r.value = { ...r.value, ...d });
        } catch {
        }
      t.value = null;
    }
    async function b(g) {
      if (await et.confirm({
        header: "Delete knowledge base",
        message: `Delete “${g.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        p(""), S.value = "";
        try {
          const { data: a } = await F.delete(`/api/v1/knowledge/${g.id}`);
          if (!a?.success) throw new Error(a?.error || "delete failed");
          qe(g.id, a), r.value?.id === g.id && ne(), await C();
        } catch (a) {
          p(de(a, "delete failed"));
        }
      }
    }
    const V = M(!1), ae = M(null), fe = M(null);
    function Ee(g) {
      ae.value = g, V.value = !0;
    }
    function je() {
      V.value = !1, ae.value = null;
    }
    const ge = M(!1), Me = M(null);
    function De(g) {
      g.key === "Escape" && V.value && je();
    }
    Fe(() => {
      window.addEventListener("keydown", De);
    }), be(() => {
      window.removeEventListener("keydown", De);
    });
    async function Ie() {
      const g = ae.value;
      if (!fe.value || !g) return;
      if (fe.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Te("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const d = document.createElement("kickside-share");
      d.setAttribute("config", JSON.stringify({
        resource_id: g.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(g.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(g.id)}`,
        title: g.name || ""
      })), d.style.display = "block", d.addEventListener("close", je), fe.value.appendChild(d);
    }
    ye([V, fe], async () => {
      V.value && fe.value && await Ie();
    }), We(async () => {
      try {
        await Promise.all([C(), m(), pe()]), !r.value && q.value.route && await ie(q.value.route);
      } catch (g) {
        S.value = de(g, "host API unavailable");
      }
    });
    const { acceptDeletion: qe } = gt(P, (g) => g.id, (g) => {
      r.value?.id === g && ne();
    }, C);
    return (g, d) => (v(), y("div", At, [
      r.value ? (v(), y(Z, { key: 1 }, [
        h("div", on, [
          h("div", an, [
            h("button", {
              class: "kx-back",
              onClick: d[2] || (d[2] = (a) => s(oe)())
            }, [
              k(s(E), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              d[16] || (d[16] = Q(" Back", -1))
            ]),
            h("h1", {
              class: "kx-title",
              title: r.value.name || "(untitled)"
            }, R(r.value.name || "(untitled)"), 9, sn),
            r.value.badge ? (v(), me(s($e), {
              key: 0,
              severity: c(r.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: J(() => [
                k(s(E), {
                  icon: r.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                Q(R(r.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : j("", !0),
            k(jt, {
              items: r.value.stat_items || []
            }, null, 8, ["items"]),
            r.value.auto_summary || r.value.auto_description ? (v(), y("span", {
              key: 1,
              ref_key: "summaryAnchor",
              ref: Me,
              class: "kx-summary"
            }, [
              k(s(X), {
                severity: "secondary",
                outlined: "",
                class: Y(["kx-summary-btn", { on: ge.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ge.value,
                onClick: d[3] || (d[3] = le((a) => ge.value = !ge.value, ["stop"]))
              }, {
                icon: J(({ class: a }) => [
                  k(s(E), {
                    icon: "tabler:sparkles",
                    class: Y(a),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              k(Dt, {
                open: ge.value,
                "onUpdate:open": d[5] || (d[5] = (a) => ge.value = a),
                anchor: Me.value,
                width: 340
              }, {
                default: J(() => [
                  h("div", {
                    class: "kx-summary-pop",
                    onClick: d[4] || (d[4] = le(() => {
                    }, ["stop"]))
                  }, [
                    h("div", rn, [
                      k(s(E), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      d[17] || (d[17] = h("span", null, "About this knowledge base", -1))
                    ]),
                    r.value.auto_summary ? (v(), y("p", ln, R(r.value.auto_summary), 1)) : j("", !0),
                    r.value.auto_description ? (v(), y("p", dn, R(r.value.auto_description), 1)) : j("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ], 512)) : j("", !0)
          ]),
          h("div", cn, [
            s(ue) ? (v(), y("div", un, [
              (v(!0), y(Z, null, ke(s(B), (a) => (v(), y("button", {
                key: a.id,
                class: Y(["kx-viewseg-btn", { on: s(ee) === a.id }]),
                role: "tab",
                "aria-selected": s(ee) === a.id,
                onClick: (H) => s(K)(a.id)
              }, [
                a.icon ? (v(), me(s(E), {
                  key: 0,
                  icon: a.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : j("", !0),
                Q(" " + R(a.label), 1)
              ], 10, pn))), 128))
            ])) : j("", !0),
            k(s(X), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: d[6] || (d[6] = (a) => l(r.value))
            }, {
              icon: J(({ class: a }) => [
                k(s(E), {
                  icon: "tabler:pencil",
                  class: Y(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            k(s(X), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: d[7] || (d[7] = (a) => Ee(r.value))
            }, {
              icon: J(({ class: a }) => [
                k(s(E), {
                  icon: "tabler:share",
                  class: Y(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            k(s(X), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: d[8] || (d[8] = (a) => b(r.value))
            }, {
              icon: J(({ class: a }) => [
                k(s(E), {
                  icon: "tabler:trash",
                  class: Y(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        s(te) ? (v(), y("div", fn, R(s(te)), 1)) : j("", !0),
        h("div", {
          class: Y(["kx-body", { "kx-body-bleed": s(se) }])
        }, [
          s(U) ? (v(), y("div", gn, [
            k(s(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            d[18] || (d[18] = Q(" Loading… ", -1))
          ])) : (v(), y(Z, { key: 1 }, [
            s(se) ? j("", !0) : (v(), y("div", vn, [
              r.value.description ? (v(), y("div", mn, R(r.value.description), 1)) : j("", !0),
              h("div", yn, [
                r.value.embedding_model ? (v(), y("span", hn, [
                  k(s(E), {
                    icon: "tabler:vector",
                    "aria-hidden": "true"
                  }),
                  Q(R(r.value.embedding_model), 1)
                ])) : j("", !0)
              ])
            ])),
            h("div", {
              ref_key: "detailHost",
              ref: ce,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (v(), y(Z, { key: 0 }, [
        h("header", Ht, [
          h("div", Rt, [
            k(s(E), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          d[10] || (d[10] = h("div", { class: "kx-head-text" }, [
            h("h1", { class: "kx-head-title" }, "Knowledge"),
            h("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          h("div", zt, [
            h("span", Nt, R(s(P).length) + " knowledge base" + R(s(P).length !== 1 ? "s" : ""), 1),
            h("div", Tt, [
              k(s(E), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Ge(h("input", {
                "onUpdate:modelValue": d[0] || (d[0] = (a) => Qe(w) ? w.value = a : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Xe, s(w)]
              ])
            ]),
            k(s(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: i
            }, {
              icon: J(({ class: a }) => [
                k(s(E), {
                  icon: "tabler:plus",
                  class: Y(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        s(S) ? (v(), y("div", Kt, R(s(S)), 1)) : j("", !0),
        s(O) ? (v(), y("div", It, [
          k(s(E), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          d[11] || (d[11] = h("span", null, [
            h("strong", null, "No knowledge engine installed."),
            Q(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : j("", !0),
        h("div", qt, [
          s(L) && !s(P).length ? (v(), y("div", Bt, [
            k(s(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            d[12] || (d[12] = Q(" Loading… ", -1))
          ])) : s(P).length ? s(x).length ? (v(), y("div", Jt, [
            (v(!0), y(Z, null, ke(s(x), (a) => (v(), y("div", {
              key: a.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${a.name || "knowledge base"}`,
              onClick: (H) => !a.deleting_at && s(G)(a),
              onKeydown: [
                Le((H) => !a.deleting_at && s(G)(a), ["enter"]),
                Le(le((H) => !a.deleting_at && s(G)(a), ["prevent"]), ["space"])
              ]
            }, [
              k(ft, {
                state: a,
                onRetry: (H) => b(a)
              }, null, 8, ["state", "onRetry"]),
              h("div", Ft, [
                h("span", Gt, [
                  k(s(E), {
                    icon: a.icon || a.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                h("div", Qt, [
                  h("div", {
                    class: "kx-card-name",
                    title: a.name || "(untitled)"
                  }, R(a.name || "(untitled)"), 9, Xt),
                  a.badge ? (v(), y("div", Zt, [
                    k(s($e), {
                      severity: c(a.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: J(() => [
                        k(s(E), {
                          icon: a.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        Q(R(a.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : j("", !0)
                ]),
                h("div", {
                  class: "kx-card-actions",
                  onClick: d[1] || (d[1] = le(() => {
                  }, ["stop"]))
                }, [
                  k(s(X), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${a.name}`,
                    onClick: (H) => !a.deleting_at && l(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: J(({ class: H }) => [
                      k(s(E), {
                        icon: "tabler:pencil",
                        class: Y(H),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  k(s(X), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${a.name}`,
                    onClick: (H) => Ee(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: J(({ class: H }) => [
                      k(s(E), {
                        icon: "tabler:share",
                        class: Y(H),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  k(s(X), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${a.name}`,
                    onClick: (H) => b(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: J(({ class: H }) => [
                      k(s(E), {
                        icon: "tabler:trash",
                        class: Y(H),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              h("div", en, R(a.description || "No description"), 1),
              a.stat_items && a.stat_items.length ? (v(), y("div", tn, [
                (v(!0), y(Z, null, ke(a.stat_items, (H, Be) => (v(), y("span", {
                  key: Be,
                  class: "kx-stat",
                  title: `${o(H.value)} ${H.label}`,
                  "aria-label": `${o(H.value)} ${H.label}`
                }, [
                  H.icon ? (v(), me(s(E), {
                    key: 0,
                    icon: H.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : j("", !0),
                  Q(R(o(H.value)), 1)
                ], 8, nn))), 128))
              ])) : j("", !0)
            ], 40, Yt))), 128))
          ])) : (v(), y("div", Ut, [...d[15] || (d[15] = [
            h("div", { class: "kx-empty-title" }, "No matches", -1),
            h("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (v(), y("div", Vt, [
            h("div", Wt, [
              k(s(E), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            d[13] || (d[13] = h("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            d[14] || (d[14] = h("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            k(s(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: i
            }, {
              icon: J(({ class: a }) => [
                k(s(E), {
                  icon: "tabler:plus",
                  class: Y(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      k(Ze, {
        open: n.value,
        api: s(F),
        engines: s(u),
        models: s($),
        target: t.value,
        "load-error": s(_),
        onRetry: s(z),
        onClose: d[9] || (d[9] = (a) => n.value = !1),
        onSaved: D
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      V.value ? (v(), y("div", {
        key: 2,
        ref_key: "shareHost",
        ref: fe
      }, null, 512)) : j("", !0)
    ]));
  }
}), Cn = {
  rootComponent: bn,
  plugins: [Ue]
};
export {
  Cn as mountConfig
};
//# sourceMappingURL=lazy-mount-D3Vaint0.js.map
