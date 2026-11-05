import { u as Ve, W as qe } from "./index-D52CRMw6.js";
import { B as Oe, s as He, a as Z, e as ne, f as We, _ as Ue, P as Fe } from "./KbDialog.vue_vue_type_script_setup_true_lang-phDmIDoa.js";
import { openBlock as p, createElementBlock as h, mergeProps as ie, createElementVNode as m, defineComponent as be, computed as ue, withModifiers as se, Fragment as J, createTextVNode as G, toDisplayString as N, createCommentVNode as L, createVNode as k, unref as a, watch as ve, onBeforeUnmount as me, createBlock as fe, resolveDynamicComponent as Ge, renderSlot as Ae, renderList as he, ref as P, nextTick as _e, normalizeStyle as Je, onMounted as Ye, withDirectives as Qe, isRef as Xe, vModelText as Ze, withCtx as q, normalizeClass as W, withKeys as Me } from "vue";
import { _ as et } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as Ke, api as U, host as Ne, loadByTagName as Ie, define as tt } from "@wippy-fe/proxy";
import { c as nt, a as ot, s as at, u as it, b as st } from "./constants-1YdzWmIJ.js";
import { Icon as j } from "@iconify/vue";
import { s as rt } from "./styles-Bn0s9kIq.js";
var lt = `
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
`, dt = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, ct = Oe.extend({
  name: "progressspinner",
  style: lt,
  classes: dt
}), ut = {
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
  style: ct,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Re = {
  name: "ProgressSpinner",
  extends: ut,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, pt = ["fill", "stroke-width"];
function gt(e, i, d, s, y, E) {
  return p(), h("div", ie({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(p(), h("svg", ie({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: E.svgStyle
  }, e.ptm("spin")), [m("circle", ie({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, pt)], 16))], 16);
}
Re.render = gt;
const ft = { key: 0 }, vt = /* @__PURE__ */ be({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const i = e, d = ue(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (s, y) => e.state.deleting_at ? (p(), h("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: y[1] || (y[1] = se(() => {
      }, ["stop"])),
      onKeydown: y[2] || (y[2] = se(() => {
      }, ["stop"]))
    }, [
      d.value ? (p(), h(J, { key: 0 }, [
        m("span", null, [
          y[3] || (y[3] = G("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (p(), h("span", ft, ": " + N(e.state.deletion_job.last_error), 1)) : L("", !0)
        ]),
        k(a(Z), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: y[0] || (y[0] = se((E) => s.$emit("retry"), ["stop"]))
        })
      ], 64)) : (p(), h(J, { key: 1 }, [
        k(a(Re), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        y[4] || (y[4] = m("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : L("", !0);
  }
}), yt = /* @__PURE__ */ et(vt, [["__scopeId", "data-v-69a579d4"]]);
function mt(e, i, d) {
  let s = !0;
  const y = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Map();
  function D(b, w) {
    const g = e.value.find((C) => i(C) === b), v = E.get(b), _ = {
      deleting_at: v?.deleting_at || g?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: w?.job_id || v?.deletion_job_id || g?.deletion_job_id
    };
    E.set(b, _), g && (Object.assign(g, _), g.deletion_job = void 0);
  }
  async function O(b) {
    const w = i(b), g = E.get(w), v = () => s && e.value.includes(b) && E.get(w) === g;
    try {
      const { data: _ } = await U.get(`/api/v1/components/${encodeURIComponent(w)}`);
      if (!_?.success) throw new Error(ne(_, "Could not read deletion progress"));
      v() && (b.deleting_at = g?.deleting_at || _.deleting_at, b.deletion_job_id = g?.deletion_job_id || _.deletion_job_id, g && (g.deletion_job_id = b.deletion_job_id), b.deletion_job = _.deletion_job ?? null);
    } catch (_) {
      v() && Ne.handleError("other", { message: ne(_, "Could not read deletion progress") });
    }
  }
  const H = ve(() => e.value, (b, w = []) => {
    const g = b.filter((v) => !y.has(i(v)));
    for (const v of w) !y.has(i(v)) && !g.some((_) => i(_) === i(v)) && d?.(i(v));
    for (const v of E.keys()) g.some((_) => i(_) === v) || E.delete(v);
    if (g.length !== b.length) {
      e.value = g;
      return;
    }
    for (const v of b) {
      const _ = E.get(i(v));
      _ && Object.assign(v, _);
      const C = w.find((K) => i(K) === i(v));
      v.deletion_job === void 0 && C?.deletion_job_id === v.deletion_job_id && (v.deletion_job = C?.deletion_job), v.deleting_at && O(v);
    }
  }, { immediate: !0 }), M = Ke("@message", (b) => {
    const w = nt(b);
    if (!w) return;
    const g = e.value.find((v) => i(v) === w.component_id);
    w.event === "component.deleted" ? (g && !y.has(w.component_id) && d?.(w.component_id), y.add(w.component_id), E.delete(w.component_id), e.value = e.value.filter((v) => i(v) !== w.component_id)) : g && (D(w.component_id), O(g));
  });
  return me(() => {
    s = !1, H(), typeof M == "function" && M();
  }), { acceptDeletion: D };
}
var ht = `
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
`, bt = {
  root: function(i) {
    var d = i.props;
    return ["p-tag p-component", {
      "p-tag-info": d.severity === "info",
      "p-tag-success": d.severity === "success",
      "p-tag-warn": d.severity === "warn",
      "p-tag-danger": d.severity === "danger",
      "p-tag-secondary": d.severity === "secondary",
      "p-tag-contrast": d.severity === "contrast",
      "p-tag-rounded": d.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, kt = Oe.extend({
  name: "tag",
  style: ht,
  classes: bt
}), wt = {
  name: "BaseTag",
  extends: He,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: kt,
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
function _t(e, i, d) {
  return (i = xt(i)) in e ? Object.defineProperty(e, i, { value: d, enumerable: !0, configurable: !0, writable: !0 }) : e[i] = d, e;
}
function xt(e) {
  var i = $t(e, "string");
  return ye(i) == "symbol" ? i : i + "";
}
function $t(e, i) {
  if (ye(e) != "object" || !e) return e;
  var d = e[Symbol.toPrimitive];
  if (d !== void 0) {
    var s = d.call(e, i);
    if (ye(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (i === "string" ? String : Number)(e);
}
var xe = {
  name: "Tag",
  extends: wt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return We(_t({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Ct = ["data-p"];
function St(e, i, d, s, y, E) {
  return p(), h("span", ie({
    class: e.cx("root"),
    "data-p": E.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (p(), fe(Ge(e.$slots.icon), ie({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (p(), h("span", ie({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : L("", !0), e.value != null || e.$slots.default ? Ae(e.$slots, "default", {
    key: 2
  }, function() {
    return [m("span", ie({
      class: e.cx("label")
    }, e.ptm("label")), N(e.value), 17)];
  }) : L("", !0)], 16, Ct);
}
xe.render = St;
const Et = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, Dt = {
  key: 0,
  "aria-hidden": "true"
}, Mt = { class: "kx-header-stat" }, Lt = { class: "kx-header-stat-label" }, jt = /* @__PURE__ */ be({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (i, d) => e.items.length ? (p(), h("span", Et, [
      (p(!0), h(J, null, he(e.items, (s, y) => (p(), h(J, { key: y }, [
        y ? (p(), h("span", Dt, " · ")) : L("", !0),
        m("span", Mt, [
          s.icon ? (p(), fe(a(j), {
            key: 0,
            icon: s.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : L("", !0),
          m("span", Lt, N(s.value.toLocaleString()) + " " + N(s.label), 1)
        ])
      ], 64))), 128))
    ])) : L("", !0);
  }
}), Pt = 2e3;
function Le(e) {
  const i = e.margin ?? 8, d = e.gap ?? 4, s = Math.max(0, e.viewportWidth), y = Math.max(0, e.viewportHeight), E = Math.max(0, s - i * 2), D = Math.min(Math.max(0, e.requestedWidth), E), O = e.align === "right" ? e.anchor.right - D : e.anchor.left, H = Math.max(i, Math.min(O, s - i - D)), M = Math.max(0, y - e.anchor.bottom - d - i), b = Math.max(0, e.anchor.top - d - i), w = M < e.requestedMaxHeight && b > M ? "above" : "below", g = w === "above" ? b : M, v = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), g)), _ = Math.min(Math.max(0, e.panelHeight ?? v), v), C = w === "above" ? e.anchor.top - d - _ : e.anchor.bottom + d, K = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(H - K.left),
    width: Math.round(D),
    maxHeight: v,
    side: w,
    top: Math.round(C - K.top)
  };
}
const Ot = /* @__PURE__ */ be({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Pt }
  },
  emits: ["update:open"],
  setup(e, { emit: i }) {
    const d = e, s = i, y = P(null), E = P({ position: "fixed", visibility: "hidden" });
    function D() {
      const C = d.anchor, K = y.value;
      if (!C || !K) return;
      const ee = C.getBoundingClientRect(), I = d.width === "anchor" ? Math.max(d.minWidth, ee.width) : Math.max(d.minWidth, d.width), R = {
        anchor: ee,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: I,
        requestedMaxHeight: d.maxHeight,
        align: d.align,
        gap: d.gap
      }, T = Le(R);
      Object.assign(K.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${T.width}px`,
        maxHeight: `${T.maxHeight}px`,
        visibility: "hidden"
      });
      const B = K.getBoundingClientRect(), V = Le({
        ...R,
        containingBlockOrigin: { left: B.left, top: B.top },
        panelHeight: B.height
      }), Y = {
        position: "fixed",
        left: `${V.left}px`,
        top: `${V.top}px`,
        width: `${V.width}px`,
        maxHeight: `${V.maxHeight}px`,
        "--anchored-panel-available-height": `${V.maxHeight}px`,
        margin: "0",
        zIndex: String(d.zIndex),
        visibility: "visible"
      };
      E.value = Y;
    }
    let O = null, H = !1;
    function M() {
      H || !d.open || (H = !0, requestAnimationFrame(() => {
        H = !1, d.open && D();
      }));
    }
    function b() {
      typeof ResizeObserver > "u" || (O = new ResizeObserver(M), y.value && O.observe(y.value), d.anchor && O.observe(d.anchor));
    }
    function w() {
      O?.disconnect(), O = null, H = !1;
    }
    ve(() => d.open, async (C) => {
      w(), C && (E.value = { position: "fixed", visibility: "hidden" }, await _e(), D(), b());
    }, { immediate: !0 });
    function g(C) {
      if (!d.open) return;
      const K = C.composedPath();
      y.value && K.includes(y.value) || d.anchor && K.includes(d.anchor) || s("update:open", !1);
    }
    function v(C) {
      d.open && C.key === "Escape" && s("update:open", !1);
    }
    function _() {
      d.open && D();
    }
    return document.addEventListener("click", g), document.addEventListener("keydown", v), window.addEventListener("resize", _), window.addEventListener("scroll", _, !0), me(() => {
      w(), document.removeEventListener("click", g), document.removeEventListener("keydown", v), window.removeEventListener("resize", _), window.removeEventListener("scroll", _, !0);
    }), (C, K) => e.open ? (p(), h("div", {
      key: 0,
      ref_key: "panel",
      ref: y,
      class: "anchored-panel",
      style: Je(E.value)
    }, [
      Ae(C.$slots, "default")
    ], 4)) : L("", !0);
  }
}), $e = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, je = Object.keys($e), Pe = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Ht({ detail: e }) {
  const i = P(!1), d = P(""), s = P(""), y = P([]), E = P(""), D = P([]), O = P([]), H = P("");
  let M = !0, b = 0, w = !1, g = !1;
  const v = ue(() => {
    const l = E.value.trim().toLowerCase();
    return l ? y.value.filter(
      (n) => (n.name || "").toLowerCase().includes(l) || (n.description || "").toLowerCase().includes(l)
    ) : y.value;
  });
  function _(l) {
    const n = l.toLowerCase();
    return n.includes("no implementation") || n.includes("no engine") || n.includes("contract unavailable") || n.includes("not found") && n.includes("binding");
  }
  async function C() {
    if (!M) return !1;
    const l = ++b;
    i.value = !0, d.value = "", s.value = "";
    try {
      const { data: n } = await U.get("/api/v1/knowledge/list");
      if (!n?.success) {
        const $ = n?.error || "failed to load knowledge bases";
        if (_($))
          return l === b && M && (s.value = Pe), !1;
        throw new Error($);
      }
      return l === b && M && (y.value = n.items || []), !0;
    } catch (n) {
      const $ = ne(n, "could not load knowledge bases");
      return l === b && M && (_($) ? s.value = Pe : d.value = $), !1;
    } finally {
      l === b && (i.value = !1, M && g && !w && te());
    }
  }
  async function K() {
    try {
      const { data: l } = await U.get("/api/v1/knowledge/models");
      D.value = l?.success ? l.models || [] : [];
    } catch {
      D.value = [];
    }
  }
  async function ee() {
    try {
      const { data: l } = await U.get("/api/v1/knowledge/engines");
      O.value = l?.success ? l.engines || [] : [];
    } catch {
      O.value = [];
    }
  }
  function I(l) {
    return O.value.find((n) => n.kb_type === l);
  }
  async function R() {
    H.value = "";
    try {
      const [l, n] = await Promise.all([
        U.get("/api/v1/knowledge/engines"),
        U.get("/api/v1/knowledge/models")
      ]);
      if (!l.data?.success) throw new Error(l.data?.error || "Could not load knowledge engines.");
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load embedding models.");
      O.value = l.data.engines || [], D.value = n.data.models || [];
    } catch (l) {
      O.value = [], D.value = [], H.value = ne(l, "Could not load knowledge engines.");
    }
  }
  function T(l) {
    return !!l && typeof l == "object" && !Array.isArray(l);
  }
  function B(l) {
    if (T(l)) return l;
    if (!(typeof l != "string" || !l))
      try {
        const n = JSON.parse(l);
        return T(n) ? n : void 0;
      } catch {
        return;
      }
  }
  function V(l, n) {
    if (!n) return;
    let $ = l;
    for (const t of n.split(".")) {
      if (!T($)) return;
      $ = $[t];
    }
    return $;
  }
  function Y(l, n) {
    if (!Array.isArray(n)) return [];
    const $ = [];
    for (const t of n) {
      const c = V(l, t.path), f = typeof c == "number" ? c : Number(c || 0);
      f < (t.min ?? 0) || $.push({ icon: t.icon, value: f, label: String(f === 1 ? t.singular : t.plural) });
    }
    return $;
  }
  function F(l, n) {
    return Object.prototype.hasOwnProperty.call(l, n);
  }
  function re(l, n) {
    return je.some(($) => F(l, $)) ? !0 : Array.isArray(n) ? n.some(($) => {
      const t = $.path || "";
      return t !== "" && F(l, t.split(".")[0]);
    }) : !1;
  }
  function oe(l, n, $) {
    const t = String(n.kb_type || $ || ""), c = I(t), f = {
      kb_type: t || $,
      badge: c?.badge
    };
    for (const x of je) {
      const S = n[x];
      F(n, x) && typeof S == "number" && (f[x] = S);
    }
    return (re(n, c?.stats_spec) || F(n, "kb_type")) && (f.stat_items = Y({ ...l, ...n }, c?.stats_spec)), f;
  }
  function Q(l, n, $ = []) {
    const t = {};
    typeof n.title == "string" && (t.name = n.title), typeof n.comment == "string" && (t.description = n.comment), typeof n.icon == "string" && (t.icon = n.icon), typeof n.status == "string" && (t.status = n.status), typeof n.auto_summary == "string" && (t.auto_summary = n.auto_summary), typeof n.auto_description == "string" && (t.auto_description = n.auto_description), typeof n.kb_type == "string" && (t.kb_type = n.kb_type), Object.assign(t, oe(l, n, t.kb_type || l.kb_type));
    const c = { ...l, ...t };
    for (const f of $) {
      const x = f === "title" ? "name" : f;
      delete c[x];
    }
    return c;
  }
  const ae = P(null);
  function X(l, n) {
    const $ = B(n.meta) || {}, t = n.deleted || [];
    y.value = y.value.map((c) => c.id === l ? Q(c, $, t) : c), e.value?.id === l && (e.value = Q(e.value, $, t));
  }
  function z() {
    M = !1, g = !1, pe?.(), ae.value?.(), ae.value = null;
  }
  async function te() {
    if (M) {
      if (w || i.value) {
        g = !0;
        return;
      }
      w = !0;
      try {
        do
          g = !1, await C();
        while (M && g);
      } finally {
        w = !1;
      }
    }
  }
  const pe = Ke("@message", (l) => {
    const n = ot(l, void 0, $e);
    if (!n) return;
    const $ = y.value.some((t) => t.id === n.component_id);
    ($ || e.value?.id === n.component_id) && X(n.component_id, n), !$ && typeof n.meta.kb_type == "string" && n.meta.kb_type && te();
  });
  return me(z), {
    loading: i,
    error: d,
    notice: s,
    kbs: y,
    query: E,
    filtered: v,
    models: D,
    engines: O,
    dialogLoadError: H,
    load: C,
    loadModels: K,
    loadEngines: ee,
    engineFor: I,
    loadDialogCatalog: R,
    detailUnsub: ae,
    applyComponentMetaEvent: X,
    clearComponentSubscriptions: z
  };
}
function At({ detail: e, detailUnsub: i, kbs: d, engines: s, engineFor: y, applyComponentMetaEvent: E, route: D, navigate: O, loadEngines: H }) {
  const M = P(!1), b = P(""), w = P(null);
  let g = null, v = 0, _ = 0;
  const C = ue(() => e.value ? y(e.value.kb_type || "")?.manage_ui_id : void 0), K = ue(() => (e.value ? y(e.value.kb_type || "")?.manage_views : void 0) || []), ee = ue(() => K.value.length > 1), I = P(""), R = P("");
  let T = !1, B = 0;
  function V() {
    const t = e.value?.kb_type;
    return t ? `kx:kb:detail-view:${t}` : null;
  }
  ve(K, (t) => {
    if (!t.length) {
      I.value = "";
      return;
    }
    const c = t.map((S) => S.id);
    let f = "";
    try {
      const S = V();
      f = S && localStorage.getItem(S) || "";
    } catch {
    }
    const x = c.includes(f) ? f : c[0];
    x !== I.value && (I.value = x);
  }, { immediate: !0 });
  function Y() {
    const t = { kb_id: e.value?.id, route: R.value };
    return I.value && (t.view = I.value), JSON.stringify(t);
  }
  function F(t) {
    if (t !== I.value) {
      I.value = t;
      try {
        const c = V();
        c && localStorage.setItem(c, t);
      } catch {
      }
      try {
        g?.setAttribute("config", Y());
      } catch {
      }
    }
  }
  function re(t) {
    t.stopPropagation();
    const c = e.value?.id;
    if (!c || T) return;
    const f = typeof t.detail == "string" ? t.detail : t.detail?.path ?? t.detail?.route ?? "", x = String(f || "").replace(/^\/+/, "");
    R.value = x, X(x ? `${c}/${x}` : c);
  }
  function oe(t) {
    t.stopPropagation();
  }
  function Q(t = !0) {
    t && _++, g && (g.removeEventListener("kb-changed", oe), g.removeEventListener("navigate", re), g.remove(), g = null);
  }
  async function ae() {
    const t = ++_;
    Q(!1);
    const c = C.value, f = w.value, x = e.value?.id;
    if (!c || !f || !x) return;
    try {
      await Ie(c, { timeoutMs: 8e3 });
    } catch {
    }
    if (t !== _ || e.value?.id !== x || C.value !== c || w.value !== f) return;
    f.replaceChildren();
    const S = document.createElement(c);
    try {
      S.setAttribute("config", Y());
    } catch {
    }
    S.addEventListener("kb-changed", oe), S.addEventListener("navigate", re), f.appendChild(S), g = S;
  }
  function X(t) {
    T || O(t);
  }
  function z(t, c) {
    return v === t && e.value?.id === c;
  }
  async function te(t, c = !0) {
    const f = ++v, x = t.id;
    e.value = { ...t }, i.value?.(), i.value = x ? at(x, (S) => E(x, S), $e) : null, b.value = "", M.value = !0, Q(), c && X(x);
    try {
      const { data: S } = await U.get(`/api/v1/knowledge/${x}`);
      if (!z(f, x)) return;
      S?.success ? e.value = { ...e.value, ...S } : b.value = S?.error || "could not load knowledge base";
    } catch (S) {
      if (!z(f, x)) return;
      b.value = ne(S, "could not load knowledge base");
    } finally {
      z(f, x) && (M.value = !1);
    }
    z(f, x) && (s.value.length || await H(), z(f, x) && (await _e(), z(f, x) && await ae()));
  }
  async function pe() {
    const t = e.value?.id;
    if (!t) return;
    const c = ++v;
    b.value = "";
    try {
      const { data: f } = await U.get(`/api/v1/knowledge/${t}`);
      if (!z(c, t)) return;
      f?.success ? e.value = { ...e.value, ...f } : b.value = f?.error || "could not load knowledge base";
    } catch (f) {
      if (!z(c, t)) return;
      b.value = ne(f, "could not load knowledge base");
    }
    if (z(c, t) && (await _e(), !!z(c, t)))
      try {
        g?.setAttribute("config", Y());
      } catch {
      }
  }
  function l() {
    const t = e.value?.id;
    if (!t || !R.value) {
      n();
      return;
    }
    O({ path: t, back: { within: t } });
  }
  function n(t = !0) {
    v++, Q(), i.value?.(), i.value = null, e.value = null, R.value = "", t && X("");
  }
  async function $(t) {
    const c = ++B, f = String(t || "").split("/").filter(Boolean), x = f[0] || "", S = f.slice(1).join("/");
    T = !0;
    try {
      if (c !== B) return;
      if (!x)
        e.value && n(!1);
      else if (e.value?.id !== x) {
        R.value = S;
        const ke = d.value.find((ge) => ge.id === x);
        if (await te(ke || { id: x }, !1), c !== B) return;
      } else if (S !== R.value) {
        R.value = S;
        try {
          g?.setAttribute("config", Y());
        } catch {
        }
      }
    } finally {
      c === B && (T = !1);
    }
  }
  return ve(D, (t) => {
    $(t);
  }), me(() => {
    Q(), i.value?.(), i.value = null;
  }), {
    detailLoading: M,
    detailError: b,
    detailHost: w,
    detailManageTag: C,
    detailViews: K,
    detailHasViews: ee,
    detailView: I,
    innerRoute: R,
    setDetailView: F,
    openDetail: te,
    refreshOpenDetail: pe,
    closeDetail: n,
    backDetail: l,
    applyRoute: $,
    pushRoute: X,
    unmountDetailWc: Q
  };
}
const Kt = { class: "kx" }, Nt = { class: "kx-head" }, It = { class: "kx-head-icon" }, Rt = { class: "kx-head-actions" }, Tt = { class: "kx-count" }, zt = { class: "kx-search" }, Bt = {
  key: 0,
  class: "kx-err"
}, Vt = {
  key: 1,
  class: "kx-notice"
}, qt = { class: "kx-body" }, Wt = {
  key: 0,
  class: "kx-loading"
}, Ut = {
  key: 1,
  class: "kx-empty"
}, Ft = { class: "kx-empty-ico" }, Gt = {
  key: 2,
  class: "kx-empty"
}, Jt = {
  key: 3,
  class: "kx-grid"
}, Yt = ["aria-label", "onClick", "onKeydown"], Qt = { class: "kx-card-head" }, Xt = { class: "kx-ficon" }, Zt = { class: "kx-card-id" }, en = ["title"], tn = {
  key: 0,
  class: "kx-card-meta"
}, nn = { class: "kx-card-desc" }, on = {
  key: 0,
  class: "kx-stats"
}, an = ["title", "aria-label"], sn = { class: "kx-bar" }, rn = { class: "kx-bar-l" }, ln = ["title"], dn = {
  key: 1,
  class: "kx-summary"
}, cn = { class: "kx-summary-pop-h" }, un = {
  key: 0,
  class: "kx-summary-pop-sum"
}, pn = {
  key: 1,
  class: "kx-summary-pop-desc"
}, gn = { class: "kx-bar-r" }, fn = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, vn = ["aria-selected", "onClick"], yn = {
  key: 0,
  class: "kx-err"
}, mn = {
  key: 0,
  class: "kx-loading"
}, hn = { class: "kx-detail-meta" }, bn = {
  key: 0,
  class: "kx-detail-desc"
}, kn = { class: "kx-stats" }, wn = {
  key: 0,
  class: "kx-stat"
}, _n = {
  key: 0,
  class: "kx-detail-summary"
}, xn = /* @__PURE__ */ be({
  __name: "knowledge",
  setup(e) {
    const i = (u) => (u ?? 0).toLocaleString();
    function d(u) {
      if (u === "neutral") return "secondary";
      if (u === "warning") return "warn";
      if (u === "info" || u === "success" || u === "danger") return u;
    }
    const s = P(null), y = Ht({ detail: s }), {
      loading: E,
      error: D,
      notice: O,
      kbs: H,
      query: M,
      filtered: b,
      models: w,
      engines: g,
      dialogLoadError: v,
      load: _,
      loadEngines: C,
      engineFor: K,
      loadDialogCatalog: ee,
      detailUnsub: I,
      applyComponentMetaEvent: R
    } = y, T = it(), B = st(), V = At({
      detail: s,
      detailUnsub: I,
      kbs: H,
      engines: g,
      engineFor: K,
      applyComponentMetaEvent: R,
      route: ue(() => T.value.route),
      navigate: (u) => B("navigate", u),
      loadEngines: C
    }), {
      detailLoading: Y,
      detailError: F,
      detailHost: re,
      detailManageTag: oe,
      detailViews: Q,
      detailHasViews: ae,
      detailView: X,
      setDetailView: z,
      openDetail: te,
      refreshOpenDetail: pe,
      closeDetail: l,
      backDetail: n,
      applyRoute: $
    } = V;
    function t(u) {
      s.value ? F.value = u : D.value = u;
    }
    const c = P(!1), f = P(null);
    async function x() {
      f.value = null, await ee(), c.value = !0;
    }
    async function S(u) {
      D.value = "", F.value = "", v.value = "", g.value.length || await C();
      try {
        const { data: r } = await U.get(`/api/v1/knowledge/${u.id}`);
        if (!r?.success) throw new Error(r?.error || "could not load knowledge base settings");
        f.value = {
          id: u.id,
          name: r.name ?? u.name,
          description: r.description ?? u.description,
          icon: r.icon ?? u.icon,
          kb_type: r.kb_type ?? u.kb_type,
          embedding_model: r.embedding_model,
          config: r.config && typeof r.config == "object" ? r.config : {}
        }, c.value = !0;
      } catch (r) {
        f.value = null, c.value = !1, t(ne(r, "could not load knowledge base settings"));
      }
    }
    async function ke() {
      c.value = !1;
      const u = s.value?.id;
      if (await _(), u && f.value && f.value.id === u)
        try {
          const { data: r } = await U.get(`/api/v1/knowledge/${u}`);
          r?.success && s.value && s.value.id === u && (s.value = { ...s.value, ...r });
        } catch {
        }
      f.value = null;
    }
    async function ge(u) {
      if (await Ne.confirm({
        header: "Delete knowledge base",
        message: `Delete “${u.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        t(""), D.value = "";
        try {
          const { data: o } = await U.delete(`/api/v1/knowledge/${u.id}`);
          if (!o?.success) throw new Error(o?.error || "delete failed");
          ze(u.id, o), s.value?.id === u.id && l(), await _();
        } catch (o) {
          t(ne(o, "delete failed"));
        }
      }
    }
    const le = P(!1), we = P(null), de = P(null);
    function Ce(u) {
      we.value = u, le.value = !0;
    }
    function Se() {
      le.value = !1, we.value = null;
    }
    const ce = P(!1), Ee = P(null);
    function De(u) {
      u.key === "Escape" && le.value && Se();
    }
    Ye(() => {
      window.addEventListener("keydown", De);
    }), me(() => {
      window.removeEventListener("keydown", De);
    });
    async function Te() {
      const u = we.value;
      if (!de.value || !u) return;
      if (de.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Ie("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const r = document.createElement("kickside-share");
      r.setAttribute("config", JSON.stringify({
        resource_id: u.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(u.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(u.id)}`,
        title: u.name || ""
      })), r.style.display = "block", r.addEventListener("close", Se), de.value.appendChild(r);
    }
    ve([le, de], async () => {
      le.value && de.value && await Te();
    }), Ve(async () => {
      try {
        await Promise.all([_(), C(), pe()]), !s.value && T.value.route && await $(T.value.route);
      } catch (u) {
        D.value = ne(u, "host API unavailable");
      }
    });
    const { acceptDeletion: ze } = mt(H, (u) => u.id, (u) => {
      s.value?.id === u && l();
    });
    return (u, r) => (p(), h("div", Kt, [
      s.value ? (p(), h(J, { key: 1 }, [
        m("div", sn, [
          m("div", rn, [
            m("button", {
              class: "kx-back",
              onClick: r[2] || (r[2] = (o) => a(n)())
            }, [
              k(a(j), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              r[16] || (r[16] = G(" Back", -1))
            ]),
            m("h1", {
              class: "kx-title",
              title: s.value.name || "(untitled)"
            }, N(s.value.name || "(untitled)"), 9, ln),
            s.value.badge ? (p(), fe(a(xe), {
              key: 0,
              severity: d(s.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: q(() => [
                k(a(j), {
                  icon: s.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                G(N(s.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : L("", !0),
            k(jt, {
              items: s.value.stat_items || []
            }, null, 8, ["items"]),
            s.value.auto_summary || s.value.auto_description ? (p(), h("span", dn, [
              k(a(Z), {
                ref_key: "summaryAnchor",
                ref: Ee,
                severity: "secondary",
                outlined: "",
                class: W(["kx-summary-btn", { on: ce.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ce.value,
                onClick: r[3] || (r[3] = se((o) => ce.value = !ce.value, ["stop"]))
              }, {
                icon: q(({ class: o }) => [
                  k(a(j), {
                    icon: "tabler:sparkles",
                    class: W(o),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              k(Ot, {
                open: ce.value,
                "onUpdate:open": r[5] || (r[5] = (o) => ce.value = o),
                anchor: Ee.value,
                width: 340
              }, {
                default: q(() => [
                  m("div", {
                    class: "kx-summary-pop",
                    onClick: r[4] || (r[4] = se(() => {
                    }, ["stop"]))
                  }, [
                    m("div", cn, [
                      k(a(j), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      r[17] || (r[17] = m("span", null, "About this knowledge base", -1))
                    ]),
                    s.value.auto_summary ? (p(), h("p", un, N(s.value.auto_summary), 1)) : L("", !0),
                    s.value.auto_description ? (p(), h("p", pn, N(s.value.auto_description), 1)) : L("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : L("", !0)
          ]),
          m("div", gn, [
            a(ae) ? (p(), h("div", fn, [
              (p(!0), h(J, null, he(a(Q), (o) => (p(), h("button", {
                key: o.id,
                class: W(["kx-viewseg-btn", { on: a(X) === o.id }]),
                role: "tab",
                "aria-selected": a(X) === o.id,
                onClick: (A) => a(z)(o.id)
              }, [
                o.icon ? (p(), fe(a(j), {
                  key: 0,
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : L("", !0),
                G(" " + N(o.label), 1)
              ], 10, vn))), 128))
            ])) : L("", !0),
            k(a(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: r[6] || (r[6] = (o) => S(s.value))
            }, {
              icon: q(({ class: o }) => [
                k(a(j), {
                  icon: "tabler:pencil",
                  class: W(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            k(a(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: r[7] || (r[7] = (o) => Ce(s.value))
            }, {
              icon: q(({ class: o }) => [
                k(a(j), {
                  icon: "tabler:share",
                  class: W(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            k(a(Z), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: r[8] || (r[8] = (o) => ge(s.value))
            }, {
              icon: q(({ class: o }) => [
                k(a(j), {
                  icon: "tabler:trash",
                  class: W(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(F) ? (p(), h("div", yn, N(a(F)), 1)) : L("", !0),
        m("div", {
          class: W(["kx-body", { "kx-body-bleed": a(oe) }])
        }, [
          a(Y) ? (p(), h("div", mn, [
            k(a(j), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            r[18] || (r[18] = G(" Loading… ", -1))
          ])) : (p(), h(J, { key: 1 }, [
            a(oe) ? L("", !0) : (p(), h(J, { key: 0 }, [
              m("div", hn, [
                s.value.description ? (p(), h("div", bn, N(s.value.description), 1)) : L("", !0),
                m("div", kn, [
                  s.value.embedding_model ? (p(), h("span", wn, [
                    k(a(j), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    G(N(s.value.embedding_model), 1)
                  ])) : L("", !0)
                ])
              ]),
              s.value.auto_summary ? (p(), h("div", _n, [
                r[19] || (r[19] = m("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                G(" " + N(s.value.auto_summary), 1)
              ])) : L("", !0)
            ], 64)),
            m("div", {
              ref_key: "detailHost",
              ref: re,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (p(), h(J, { key: 0 }, [
        m("header", Nt, [
          m("div", It, [
            k(a(j), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          r[10] || (r[10] = m("div", { class: "kx-head-text" }, [
            m("h1", { class: "kx-head-title" }, "Knowledge"),
            m("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          m("div", Rt, [
            m("span", Tt, N(a(H).length) + " knowledge base" + N(a(H).length !== 1 ? "s" : ""), 1),
            m("div", zt, [
              k(a(j), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Qe(m("input", {
                "onUpdate:modelValue": r[0] || (r[0] = (o) => Xe(M) ? M.value = o : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Ze, a(M)]
              ])
            ]),
            k(a(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: x
            }, {
              icon: q(({ class: o }) => [
                k(a(j), {
                  icon: "tabler:plus",
                  class: W(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(D) ? (p(), h("div", Bt, N(a(D)), 1)) : L("", !0),
        a(O) ? (p(), h("div", Vt, [
          k(a(j), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          r[11] || (r[11] = m("span", null, [
            m("strong", null, "No knowledge engine installed."),
            G(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : L("", !0),
        m("div", qt, [
          a(E) && !a(H).length ? (p(), h("div", Wt, [
            k(a(j), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            r[12] || (r[12] = G(" Loading… ", -1))
          ])) : a(H).length ? a(b).length ? (p(), h("div", Jt, [
            (p(!0), h(J, null, he(a(b), (o) => (p(), h("div", {
              key: o.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${o.name || "knowledge base"}`,
              onClick: (A) => !o.deleting_at && a(te)(o),
              onKeydown: [
                Me((A) => !o.deleting_at && a(te)(o), ["enter"]),
                Me(se((A) => !o.deleting_at && a(te)(o), ["prevent"]), ["space"])
              ]
            }, [
              k(yt, {
                state: o,
                onRetry: (A) => ge(o)
              }, null, 8, ["state", "onRetry"]),
              m("div", Qt, [
                m("span", Xt, [
                  k(a(j), {
                    icon: o.icon || o.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                m("div", Zt, [
                  m("div", {
                    class: "kx-card-name",
                    title: o.name || "(untitled)"
                  }, N(o.name || "(untitled)"), 9, en),
                  o.badge ? (p(), h("div", tn, [
                    k(a(xe), {
                      severity: d(o.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: q(() => [
                        k(a(j), {
                          icon: o.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        G(N(o.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : L("", !0)
                ]),
                m("div", {
                  class: "kx-card-actions",
                  onClick: r[1] || (r[1] = se(() => {
                  }, ["stop"]))
                }, [
                  k(a(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${o.name}`,
                    onClick: (A) => !o.deleting_at && S(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: q(({ class: A }) => [
                      k(a(j), {
                        icon: "tabler:pencil",
                        class: W(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  k(a(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${o.name}`,
                    onClick: (A) => Ce(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: q(({ class: A }) => [
                      k(a(j), {
                        icon: "tabler:share",
                        class: W(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  k(a(Z), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${o.name}`,
                    onClick: (A) => ge(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: q(({ class: A }) => [
                      k(a(j), {
                        icon: "tabler:trash",
                        class: W(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              m("div", nn, N(o.description || "No description"), 1),
              o.stat_items && o.stat_items.length ? (p(), h("div", on, [
                (p(!0), h(J, null, he(o.stat_items, (A, Be) => (p(), h("span", {
                  key: Be,
                  class: "kx-stat",
                  title: `${i(A.value)} ${A.label}`,
                  "aria-label": `${i(A.value)} ${A.label}`
                }, [
                  A.icon ? (p(), fe(a(j), {
                    key: 0,
                    icon: A.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : L("", !0),
                  G(N(i(A.value)), 1)
                ], 8, an))), 128))
              ])) : L("", !0)
            ], 40, Yt))), 128))
          ])) : (p(), h("div", Gt, [...r[15] || (r[15] = [
            m("div", { class: "kx-empty-title" }, "No matches", -1),
            m("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (p(), h("div", Ut, [
            m("div", Ft, [
              k(a(j), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            r[13] || (r[13] = m("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            r[14] || (r[14] = m("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            k(a(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: x
            }, {
              icon: q(({ class: o }) => [
                k(a(j), {
                  icon: "tabler:plus",
                  class: W(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      k(Ue, {
        open: c.value,
        api: a(U),
        engines: a(g),
        models: a(w),
        target: f.value,
        "load-error": a(v),
        onRetry: a(ee),
        onClose: r[9] || (r[9] = (o) => c.value = !1),
        onSaved: ke
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (p(), h("div", {
        key: 2,
        ref_key: "shareHost",
        ref: de
      }, null, 512)) : L("", !0)
    ]));
  }
}), $n = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, Cn = {
  wippy: $n
};
class Sn extends qe {
  static get wippyConfig() {
    return {
      propsSchema: Cn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: rt
    };
  }
  static get vueConfig() {
    return { rootComponent: xn, plugins: [Fe] };
  }
}
tt(import.meta.url, Sn);
//# sourceMappingURL=index.js.map
