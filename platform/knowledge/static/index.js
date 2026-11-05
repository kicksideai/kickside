import { u as Ve, W as qe } from "./index-D52CRMw6.js";
import { B as He, s as je, a as Z, e as ne, f as We, _ as Ue, P as Fe } from "./KbDialog.vue_vue_type_script_setup_true_lang-phDmIDoa.js";
import { openBlock as p, createElementBlock as m, mergeProps as se, createElementVNode as y, defineComponent as be, computed as ue, withModifiers as ie, Fragment as J, createTextVNode as G, toDisplayString as j, createCommentVNode as S, createVNode as k, unref as o, watch as ve, onBeforeUnmount as me, createBlock as fe, resolveDynamicComponent as Ge, renderSlot as Ae, renderList as he, ref as D, nextTick as _e, normalizeStyle as Je, onMounted as Ye, withDirectives as Qe, isRef as Xe, vModelText as Ze, withCtx as q, normalizeClass as W, withKeys as Me } from "vue";
import { _ as et } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as Ke, api as U, host as Ne, loadByTagName as Ie, define as tt } from "@wippy-fe/proxy";
import { c as nt, a as at, s as ot, u as st, b as it } from "./constants-1YdzWmIJ.js";
import { Icon as E } from "@iconify/vue";
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
}, ct = He.extend({
  name: "progressspinner",
  style: lt,
  classes: dt
}), ut = {
  name: "BaseProgressSpinner",
  extends: je,
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
function gt(e, r, d, s, f, H) {
  return p(), m("div", se({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(p(), m("svg", se({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: H.svgStyle
  }, e.ptm("spin")), [y("circle", se({
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
    const r = e, d = ue(() => r.state.deletion_job === null || ["dead", "cancelled"].includes(r.state.deletion_job?.status || ""));
    return (s, f) => e.state.deleting_at ? (p(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = ie(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = ie(() => {
      }, ["stop"]))
    }, [
      d.value ? (p(), m(J, { key: 0 }, [
        y("span", null, [
          f[3] || (f[3] = G("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (p(), m("span", ft, ": " + j(e.state.deletion_job.last_error), 1)) : S("", !0)
        ]),
        k(o(Z), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = ie((H) => s.$emit("retry"), ["stop"]))
        })
      ], 64)) : (p(), m(J, { key: 1 }, [
        k(o(Re), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = y("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : S("", !0);
  }
}), yt = /* @__PURE__ */ et(vt, [["__scopeId", "data-v-69a579d4"]]);
function mt(e, r, d) {
  let s = !0;
  const f = /* @__PURE__ */ new Set();
  function H(b, v) {
    const x = e.value.find((h) => r(h) === b);
    x && (x.deleting_at = x.deleting_at || (/* @__PURE__ */ new Date()).toISOString(), x.deletion_job_id = v?.job_id || x.deletion_job_id, x.deletion_job = void 0);
  }
  async function C(b) {
    b.deletion_job = void 0;
    try {
      const { data: v } = await U.get(`/api/v1/components/${encodeURIComponent(r(b))}`);
      if (!v?.success) throw new Error(ne(v, "Could not read deletion progress"));
      s && e.value.includes(b) && (b.deleting_at = v.deleting_at, b.deletion_job_id = v.deletion_job_id, b.deletion_job = v.deletion_job ?? null);
    } catch (v) {
      s && e.value.includes(b) && Ne.handleError("other", { message: ne(v, "Could not read deletion progress") });
    }
  }
  const P = ve(() => e.value, (b, v = []) => {
    const x = b.filter((h) => !f.has(r(h)));
    for (const h of v) !f.has(r(h)) && !x.some((A) => r(A) === r(h)) && d?.(r(h));
    if (x.length !== b.length) {
      e.value = x;
      return;
    }
    for (const h of b) h.deleting_at && C(h);
  }, { immediate: !0 }), L = Ke("@message", (b) => {
    const v = nt(b);
    if (!v) return;
    const x = e.value.find((h) => r(h) === v.component_id);
    v.event === "component.deleted" ? (x && !f.has(v.component_id) && d?.(v.component_id), f.add(v.component_id), e.value = e.value.filter((h) => r(h) !== v.component_id)) : x && (H(v.component_id), C(x));
  });
  return me(() => {
    s = !1, P(), typeof L == "function" && L();
  }), { acceptDeletion: H };
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
  root: function(r) {
    var d = r.props;
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
}, kt = He.extend({
  name: "tag",
  style: ht,
  classes: bt
}), wt = {
  name: "BaseTag",
  extends: je,
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
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, ye(e);
}
function _t(e, r, d) {
  return (r = xt(r)) in e ? Object.defineProperty(e, r, { value: d, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = d, e;
}
function xt(e) {
  var r = $t(e, "string");
  return ye(r) == "symbol" ? r : r + "";
}
function $t(e, r) {
  if (ye(e) != "object" || !e) return e;
  var d = e[Symbol.toPrimitive];
  if (d !== void 0) {
    var s = d.call(e, r);
    if (ye(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
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
function St(e, r, d, s, f, H) {
  return p(), m("span", se({
    class: e.cx("root"),
    "data-p": H.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (p(), fe(Ge(e.$slots.icon), se({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (p(), m("span", se({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : S("", !0), e.value != null || e.$slots.default ? Ae(e.$slots, "default", {
    key: 2
  }, function() {
    return [y("span", se({
      class: e.cx("label")
    }, e.ptm("label")), j(e.value), 17)];
  }) : S("", !0)], 16, Ct);
}
xe.render = St;
const Et = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, Dt = {
  key: 0,
  "aria-hidden": "true"
}, Mt = { class: "kx-header-stat" }, Lt = { class: "kx-header-stat-label" }, Pt = /* @__PURE__ */ be({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (r, d) => e.items.length ? (p(), m("span", Et, [
      (p(!0), m(J, null, he(e.items, (s, f) => (p(), m(J, { key: f }, [
        f ? (p(), m("span", Dt, " · ")) : S("", !0),
        y("span", Mt, [
          s.icon ? (p(), fe(o(E), {
            key: 0,
            icon: s.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : S("", !0),
          y("span", Lt, j(s.value.toLocaleString()) + " " + j(s.label), 1)
        ])
      ], 64))), 128))
    ])) : S("", !0);
  }
}), Ot = 2e3;
function Le(e) {
  const r = e.margin ?? 8, d = e.gap ?? 4, s = Math.max(0, e.viewportWidth), f = Math.max(0, e.viewportHeight), H = Math.max(0, s - r * 2), C = Math.min(Math.max(0, e.requestedWidth), H), P = e.align === "right" ? e.anchor.right - C : e.anchor.left, L = Math.max(r, Math.min(P, s - r - C)), b = Math.max(0, f - e.anchor.bottom - d - r), v = Math.max(0, e.anchor.top - d - r), x = b < e.requestedMaxHeight && v > b ? "above" : "below", h = x === "above" ? v : b, A = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), h)), N = Math.min(Math.max(0, e.panelHeight ?? A), A), M = x === "above" ? e.anchor.top - d - N : e.anchor.bottom + d, K = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(L - K.left),
    width: Math.round(C),
    maxHeight: A,
    side: x,
    top: Math.round(M - K.top)
  };
}
const Ht = /* @__PURE__ */ be({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Ot }
  },
  emits: ["update:open"],
  setup(e, { emit: r }) {
    const d = e, s = r, f = D(null), H = D({ position: "fixed", visibility: "hidden" });
    function C() {
      const M = d.anchor, K = f.value;
      if (!M || !K) return;
      const ee = M.getBoundingClientRect(), I = d.width === "anchor" ? Math.max(d.minWidth, ee.width) : Math.max(d.minWidth, d.width), R = {
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
      H.value = Y;
    }
    let P = null, L = !1;
    function b() {
      L || !d.open || (L = !0, requestAnimationFrame(() => {
        L = !1, d.open && C();
      }));
    }
    function v() {
      typeof ResizeObserver > "u" || (P = new ResizeObserver(b), f.value && P.observe(f.value), d.anchor && P.observe(d.anchor));
    }
    function x() {
      P?.disconnect(), P = null, L = !1;
    }
    ve(() => d.open, async (M) => {
      x(), M && (H.value = { position: "fixed", visibility: "hidden" }, await _e(), C(), v());
    }, { immediate: !0 });
    function h(M) {
      if (!d.open) return;
      const K = M.composedPath();
      f.value && K.includes(f.value) || d.anchor && K.includes(d.anchor) || s("update:open", !1);
    }
    function A(M) {
      d.open && M.key === "Escape" && s("update:open", !1);
    }
    function N() {
      d.open && C();
    }
    return document.addEventListener("click", h), document.addEventListener("keydown", A), window.addEventListener("resize", N), window.addEventListener("scroll", N, !0), me(() => {
      x(), document.removeEventListener("click", h), document.removeEventListener("keydown", A), window.removeEventListener("resize", N), window.removeEventListener("scroll", N, !0);
    }), (M, K) => e.open ? (p(), m("div", {
      key: 0,
      ref_key: "panel",
      ref: f,
      class: "anchored-panel",
      style: Je(H.value)
    }, [
      Ae(M.$slots, "default")
    ], 4)) : S("", !0);
  }
}), $e = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Pe = Object.keys($e), Oe = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function jt({ detail: e }) {
  const r = D(!1), d = D(""), s = D(""), f = D([]), H = D(""), C = D([]), P = D([]), L = D("");
  let b = !0, v = 0, x = !1, h = !1;
  const A = ue(() => {
    const l = H.value.trim().toLowerCase();
    return l ? f.value.filter(
      (n) => (n.name || "").toLowerCase().includes(l) || (n.description || "").toLowerCase().includes(l)
    ) : f.value;
  });
  function N(l) {
    const n = l.toLowerCase();
    return n.includes("no implementation") || n.includes("no engine") || n.includes("contract unavailable") || n.includes("not found") && n.includes("binding");
  }
  async function M() {
    if (!b) return !1;
    const l = ++v;
    r.value = !0, d.value = "", s.value = "";
    try {
      const { data: n } = await U.get("/api/v1/knowledge/list");
      if (!n?.success) {
        const _ = n?.error || "failed to load knowledge bases";
        if (N(_))
          return l === v && b && (s.value = Oe), !1;
        throw new Error(_);
      }
      return l === v && b && (f.value = n.items || []), !0;
    } catch (n) {
      const _ = ne(n, "could not load knowledge bases");
      return l === v && b && (N(_) ? s.value = Oe : d.value = _), !1;
    } finally {
      l === v && (r.value = !1, b && h && !x && te());
    }
  }
  async function K() {
    try {
      const { data: l } = await U.get("/api/v1/knowledge/models");
      C.value = l?.success ? l.models || [] : [];
    } catch {
      C.value = [];
    }
  }
  async function ee() {
    try {
      const { data: l } = await U.get("/api/v1/knowledge/engines");
      P.value = l?.success ? l.engines || [] : [];
    } catch {
      P.value = [];
    }
  }
  function I(l) {
    return P.value.find((n) => n.kb_type === l);
  }
  async function R() {
    L.value = "";
    try {
      const [l, n] = await Promise.all([
        U.get("/api/v1/knowledge/engines"),
        U.get("/api/v1/knowledge/models")
      ]);
      if (!l.data?.success) throw new Error(l.data?.error || "Could not load knowledge engines.");
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load embedding models.");
      P.value = l.data.engines || [], C.value = n.data.models || [];
    } catch (l) {
      P.value = [], C.value = [], L.value = ne(l, "Could not load knowledge engines.");
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
    let _ = l;
    for (const t of n.split(".")) {
      if (!T(_)) return;
      _ = _[t];
    }
    return _;
  }
  function Y(l, n) {
    if (!Array.isArray(n)) return [];
    const _ = [];
    for (const t of n) {
      const c = V(l, t.path), g = typeof c == "number" ? c : Number(c || 0);
      g < (t.min ?? 0) || _.push({ icon: t.icon, value: g, label: String(g === 1 ? t.singular : t.plural) });
    }
    return _;
  }
  function F(l, n) {
    return Object.prototype.hasOwnProperty.call(l, n);
  }
  function re(l, n) {
    return Pe.some((_) => F(l, _)) ? !0 : Array.isArray(n) ? n.some((_) => {
      const t = _.path || "";
      return t !== "" && F(l, t.split(".")[0]);
    }) : !1;
  }
  function ae(l, n, _) {
    const t = String(n.kb_type || _ || ""), c = I(t), g = {
      kb_type: t || _,
      badge: c?.badge
    };
    for (const w of Pe) {
      const $ = n[w];
      F(n, w) && typeof $ == "number" && (g[w] = $);
    }
    return (re(n, c?.stats_spec) || F(n, "kb_type")) && (g.stat_items = Y({ ...l, ...n }, c?.stats_spec)), g;
  }
  function Q(l, n, _ = []) {
    const t = {};
    typeof n.title == "string" && (t.name = n.title), typeof n.comment == "string" && (t.description = n.comment), typeof n.icon == "string" && (t.icon = n.icon), typeof n.status == "string" && (t.status = n.status), typeof n.auto_summary == "string" && (t.auto_summary = n.auto_summary), typeof n.auto_description == "string" && (t.auto_description = n.auto_description), typeof n.kb_type == "string" && (t.kb_type = n.kb_type), Object.assign(t, ae(l, n, t.kb_type || l.kb_type));
    const c = { ...l, ...t };
    for (const g of _) {
      const w = g === "title" ? "name" : g;
      delete c[w];
    }
    return c;
  }
  const oe = D(null);
  function X(l, n) {
    const _ = B(n.meta) || {}, t = n.deleted || [];
    f.value = f.value.map((c) => c.id === l ? Q(c, _, t) : c), e.value?.id === l && (e.value = Q(e.value, _, t));
  }
  function z() {
    b = !1, h = !1, pe?.(), oe.value?.(), oe.value = null;
  }
  async function te() {
    if (b) {
      if (x || r.value) {
        h = !0;
        return;
      }
      x = !0;
      try {
        do
          h = !1, await M();
        while (b && h);
      } finally {
        x = !1;
      }
    }
  }
  const pe = Ke("@message", (l) => {
    const n = at(l, void 0, $e);
    if (!n) return;
    const _ = f.value.some((t) => t.id === n.component_id);
    (_ || e.value?.id === n.component_id) && X(n.component_id, n), !_ && typeof n.meta.kb_type == "string" && n.meta.kb_type && te();
  });
  return me(z), {
    loading: r,
    error: d,
    notice: s,
    kbs: f,
    query: H,
    filtered: A,
    models: C,
    engines: P,
    dialogLoadError: L,
    load: M,
    loadModels: K,
    loadEngines: ee,
    engineFor: I,
    loadDialogCatalog: R,
    detailUnsub: oe,
    applyComponentMetaEvent: X,
    clearComponentSubscriptions: z
  };
}
function At({ detail: e, detailUnsub: r, kbs: d, engines: s, engineFor: f, applyComponentMetaEvent: H, route: C, navigate: P, loadEngines: L }) {
  const b = D(!1), v = D(""), x = D(null);
  let h = null, A = 0, N = 0;
  const M = ue(() => e.value ? f(e.value.kb_type || "")?.manage_ui_id : void 0), K = ue(() => (e.value ? f(e.value.kb_type || "")?.manage_views : void 0) || []), ee = ue(() => K.value.length > 1), I = D(""), R = D("");
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
    const c = t.map(($) => $.id);
    let g = "";
    try {
      const $ = V();
      g = $ && localStorage.getItem($) || "";
    } catch {
    }
    const w = c.includes(g) ? g : c[0];
    w !== I.value && (I.value = w);
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
        h?.setAttribute("config", Y());
      } catch {
      }
    }
  }
  function re(t) {
    t.stopPropagation();
    const c = e.value?.id;
    if (!c || T) return;
    const g = typeof t.detail == "string" ? t.detail : t.detail?.path ?? t.detail?.route ?? "", w = String(g || "").replace(/^\/+/, "");
    R.value = w, X(w ? `${c}/${w}` : c);
  }
  function ae(t) {
    t.stopPropagation();
  }
  function Q(t = !0) {
    t && N++, h && (h.removeEventListener("kb-changed", ae), h.removeEventListener("navigate", re), h.remove(), h = null);
  }
  async function oe() {
    const t = ++N;
    Q(!1);
    const c = M.value, g = x.value, w = e.value?.id;
    if (!c || !g || !w) return;
    try {
      await Ie(c, { timeoutMs: 8e3 });
    } catch {
    }
    if (t !== N || e.value?.id !== w || M.value !== c || x.value !== g) return;
    g.replaceChildren();
    const $ = document.createElement(c);
    try {
      $.setAttribute("config", Y());
    } catch {
    }
    $.addEventListener("kb-changed", ae), $.addEventListener("navigate", re), g.appendChild($), h = $;
  }
  function X(t) {
    T || P(t);
  }
  function z(t, c) {
    return A === t && e.value?.id === c;
  }
  async function te(t, c = !0) {
    const g = ++A, w = t.id;
    e.value = { ...t }, r.value?.(), r.value = w ? ot(w, ($) => H(w, $), $e) : null, v.value = "", b.value = !0, Q(), c && X(w);
    try {
      const { data: $ } = await U.get(`/api/v1/knowledge/${w}`);
      if (!z(g, w)) return;
      $?.success ? e.value = { ...e.value, ...$ } : v.value = $?.error || "could not load knowledge base";
    } catch ($) {
      if (!z(g, w)) return;
      v.value = ne($, "could not load knowledge base");
    } finally {
      z(g, w) && (b.value = !1);
    }
    z(g, w) && (s.value.length || await L(), z(g, w) && (await _e(), z(g, w) && await oe()));
  }
  async function pe() {
    const t = e.value?.id;
    if (!t) return;
    const c = ++A;
    v.value = "";
    try {
      const { data: g } = await U.get(`/api/v1/knowledge/${t}`);
      if (!z(c, t)) return;
      g?.success ? e.value = { ...e.value, ...g } : v.value = g?.error || "could not load knowledge base";
    } catch (g) {
      if (!z(c, t)) return;
      v.value = ne(g, "could not load knowledge base");
    }
    if (z(c, t) && (await _e(), !!z(c, t)))
      try {
        h?.setAttribute("config", Y());
      } catch {
      }
  }
  function l() {
    const t = e.value?.id;
    if (!t || !R.value) {
      n();
      return;
    }
    P({ path: t, back: { within: t } });
  }
  function n(t = !0) {
    A++, Q(), r.value?.(), r.value = null, e.value = null, R.value = "", t && X("");
  }
  async function _(t) {
    const c = ++B, g = String(t || "").split("/").filter(Boolean), w = g[0] || "", $ = g.slice(1).join("/");
    T = !0;
    try {
      if (c !== B) return;
      if (!w)
        e.value && n(!1);
      else if (e.value?.id !== w) {
        R.value = $;
        const ke = d.value.find((ge) => ge.id === w);
        if (await te(ke || { id: w }, !1), c !== B) return;
      } else if ($ !== R.value) {
        R.value = $;
        try {
          h?.setAttribute("config", Y());
        } catch {
        }
      }
    } finally {
      c === B && (T = !1);
    }
  }
  return ve(C, (t) => {
    _(t);
  }), me(() => {
    Q(), r.value?.(), r.value = null;
  }), {
    detailLoading: b,
    detailError: v,
    detailHost: x,
    detailManageTag: M,
    detailViews: K,
    detailHasViews: ee,
    detailView: I,
    innerRoute: R,
    setDetailView: F,
    openDetail: te,
    refreshOpenDetail: pe,
    closeDetail: n,
    backDetail: l,
    applyRoute: _,
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
}, nn = { class: "kx-card-desc" }, an = {
  key: 0,
  class: "kx-stats"
}, on = ["title", "aria-label"], sn = { class: "kx-bar" }, rn = { class: "kx-bar-l" }, ln = ["title"], dn = {
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
    const r = (u) => (u ?? 0).toLocaleString();
    function d(u) {
      if (u === "neutral") return "secondary";
      if (u === "warning") return "warn";
      if (u === "info" || u === "success" || u === "danger") return u;
    }
    const s = D(null), f = jt({ detail: s }), {
      loading: H,
      error: C,
      notice: P,
      kbs: L,
      query: b,
      filtered: v,
      models: x,
      engines: h,
      dialogLoadError: A,
      load: N,
      loadEngines: M,
      engineFor: K,
      loadDialogCatalog: ee,
      detailUnsub: I,
      applyComponentMetaEvent: R
    } = f, T = st(), B = it(), V = At({
      detail: s,
      detailUnsub: I,
      kbs: L,
      engines: h,
      engineFor: K,
      applyComponentMetaEvent: R,
      route: ue(() => T.value.route),
      navigate: (u) => B("navigate", u),
      loadEngines: M
    }), {
      detailLoading: Y,
      detailError: F,
      detailHost: re,
      detailManageTag: ae,
      detailViews: Q,
      detailHasViews: oe,
      detailView: X,
      setDetailView: z,
      openDetail: te,
      refreshOpenDetail: pe,
      closeDetail: l,
      backDetail: n,
      applyRoute: _
    } = V;
    function t(u) {
      s.value ? F.value = u : C.value = u;
    }
    const c = D(!1), g = D(null);
    async function w() {
      g.value = null, await ee(), c.value = !0;
    }
    async function $(u) {
      C.value = "", F.value = "", A.value = "", h.value.length || await M();
      try {
        const { data: i } = await U.get(`/api/v1/knowledge/${u.id}`);
        if (!i?.success) throw new Error(i?.error || "could not load knowledge base settings");
        g.value = {
          id: u.id,
          name: i.name ?? u.name,
          description: i.description ?? u.description,
          icon: i.icon ?? u.icon,
          kb_type: i.kb_type ?? u.kb_type,
          embedding_model: i.embedding_model,
          config: i.config && typeof i.config == "object" ? i.config : {}
        }, c.value = !0;
      } catch (i) {
        g.value = null, c.value = !1, t(ne(i, "could not load knowledge base settings"));
      }
    }
    async function ke() {
      c.value = !1;
      const u = s.value?.id;
      if (await N(), u && g.value && g.value.id === u)
        try {
          const { data: i } = await U.get(`/api/v1/knowledge/${u}`);
          i?.success && s.value && s.value.id === u && (s.value = { ...s.value, ...i });
        } catch {
        }
      g.value = null;
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
        t(""), C.value = "";
        try {
          const { data: a } = await U.delete(`/api/v1/knowledge/${u.id}`);
          if (!a?.success) throw new Error(a?.error || "delete failed");
          ze(u.id, a), s.value?.id === u.id && l(), await N();
        } catch (a) {
          t(ne(a, "delete failed"));
        }
      }
    }
    const le = D(!1), we = D(null), de = D(null);
    function Ce(u) {
      we.value = u, le.value = !0;
    }
    function Se() {
      le.value = !1, we.value = null;
    }
    const ce = D(!1), Ee = D(null);
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
      const i = document.createElement("kickside-share");
      i.setAttribute("config", JSON.stringify({
        resource_id: u.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(u.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(u.id)}`,
        title: u.name || ""
      })), i.style.display = "block", i.addEventListener("close", Se), de.value.appendChild(i);
    }
    ve([le, de], async () => {
      le.value && de.value && await Te();
    }), Ve(async () => {
      try {
        await Promise.all([N(), M(), pe()]), !s.value && T.value.route && await _(T.value.route);
      } catch (u) {
        C.value = ne(u, "host API unavailable");
      }
    });
    const { acceptDeletion: ze } = mt(L, (u) => u.id, (u) => {
      s.value?.id === u && l();
    });
    return (u, i) => (p(), m("div", Kt, [
      s.value ? (p(), m(J, { key: 1 }, [
        y("div", sn, [
          y("div", rn, [
            y("button", {
              class: "kx-back",
              onClick: i[2] || (i[2] = (a) => o(n)())
            }, [
              k(o(E), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              i[16] || (i[16] = G(" Back", -1))
            ]),
            y("h1", {
              class: "kx-title",
              title: s.value.name || "(untitled)"
            }, j(s.value.name || "(untitled)"), 9, ln),
            s.value.badge ? (p(), fe(o(xe), {
              key: 0,
              severity: d(s.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: q(() => [
                k(o(E), {
                  icon: s.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                G(j(s.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : S("", !0),
            k(Pt, {
              items: s.value.stat_items || []
            }, null, 8, ["items"]),
            s.value.auto_summary || s.value.auto_description ? (p(), m("span", dn, [
              k(o(Z), {
                ref_key: "summaryAnchor",
                ref: Ee,
                severity: "secondary",
                outlined: "",
                class: W(["kx-summary-btn", { on: ce.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ce.value,
                onClick: i[3] || (i[3] = ie((a) => ce.value = !ce.value, ["stop"]))
              }, {
                icon: q(({ class: a }) => [
                  k(o(E), {
                    icon: "tabler:sparkles",
                    class: W(a),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              k(Ht, {
                open: ce.value,
                "onUpdate:open": i[5] || (i[5] = (a) => ce.value = a),
                anchor: Ee.value,
                width: 340
              }, {
                default: q(() => [
                  y("div", {
                    class: "kx-summary-pop",
                    onClick: i[4] || (i[4] = ie(() => {
                    }, ["stop"]))
                  }, [
                    y("div", cn, [
                      k(o(E), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      i[17] || (i[17] = y("span", null, "About this knowledge base", -1))
                    ]),
                    s.value.auto_summary ? (p(), m("p", un, j(s.value.auto_summary), 1)) : S("", !0),
                    s.value.auto_description ? (p(), m("p", pn, j(s.value.auto_description), 1)) : S("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : S("", !0)
          ]),
          y("div", gn, [
            o(oe) ? (p(), m("div", fn, [
              (p(!0), m(J, null, he(o(Q), (a) => (p(), m("button", {
                key: a.id,
                class: W(["kx-viewseg-btn", { on: o(X) === a.id }]),
                role: "tab",
                "aria-selected": o(X) === a.id,
                onClick: (O) => o(z)(a.id)
              }, [
                a.icon ? (p(), fe(o(E), {
                  key: 0,
                  icon: a.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : S("", !0),
                G(" " + j(a.label), 1)
              ], 10, vn))), 128))
            ])) : S("", !0),
            k(o(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: i[6] || (i[6] = (a) => $(s.value))
            }, {
              icon: q(({ class: a }) => [
                k(o(E), {
                  icon: "tabler:pencil",
                  class: W(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            k(o(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: i[7] || (i[7] = (a) => Ce(s.value))
            }, {
              icon: q(({ class: a }) => [
                k(o(E), {
                  icon: "tabler:share",
                  class: W(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            k(o(Z), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: i[8] || (i[8] = (a) => ge(s.value))
            }, {
              icon: q(({ class: a }) => [
                k(o(E), {
                  icon: "tabler:trash",
                  class: W(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(F) ? (p(), m("div", yn, j(o(F)), 1)) : S("", !0),
        y("div", {
          class: W(["kx-body", { "kx-body-bleed": o(ae) }])
        }, [
          o(Y) ? (p(), m("div", mn, [
            k(o(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[18] || (i[18] = G(" Loading… ", -1))
          ])) : (p(), m(J, { key: 1 }, [
            o(ae) ? S("", !0) : (p(), m(J, { key: 0 }, [
              y("div", hn, [
                s.value.description ? (p(), m("div", bn, j(s.value.description), 1)) : S("", !0),
                y("div", kn, [
                  s.value.embedding_model ? (p(), m("span", wn, [
                    k(o(E), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    G(j(s.value.embedding_model), 1)
                  ])) : S("", !0)
                ])
              ]),
              s.value.auto_summary ? (p(), m("div", _n, [
                i[19] || (i[19] = y("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                G(" " + j(s.value.auto_summary), 1)
              ])) : S("", !0)
            ], 64)),
            y("div", {
              ref_key: "detailHost",
              ref: re,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (p(), m(J, { key: 0 }, [
        y("header", Nt, [
          y("div", It, [
            k(o(E), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          i[10] || (i[10] = y("div", { class: "kx-head-text" }, [
            y("h1", { class: "kx-head-title" }, "Knowledge"),
            y("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          y("div", Rt, [
            y("span", Tt, j(o(L).length) + " knowledge base" + j(o(L).length !== 1 ? "s" : ""), 1),
            y("div", zt, [
              k(o(E), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Qe(y("input", {
                "onUpdate:modelValue": i[0] || (i[0] = (a) => Xe(b) ? b.value = a : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Ze, o(b)]
              ])
            ]),
            k(o(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: w
            }, {
              icon: q(({ class: a }) => [
                k(o(E), {
                  icon: "tabler:plus",
                  class: W(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(C) ? (p(), m("div", Bt, j(o(C)), 1)) : S("", !0),
        o(P) ? (p(), m("div", Vt, [
          k(o(E), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          i[11] || (i[11] = y("span", null, [
            y("strong", null, "No knowledge engine installed."),
            G(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : S("", !0),
        y("div", qt, [
          o(H) && !o(L).length ? (p(), m("div", Wt, [
            k(o(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[12] || (i[12] = G(" Loading… ", -1))
          ])) : o(L).length ? o(v).length ? (p(), m("div", Jt, [
            (p(!0), m(J, null, he(o(v), (a) => (p(), m("div", {
              key: a.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${a.name || "knowledge base"}`,
              onClick: (O) => !a.deleting_at && o(te)(a),
              onKeydown: [
                Me((O) => !a.deleting_at && o(te)(a), ["enter"]),
                Me(ie((O) => !a.deleting_at && o(te)(a), ["prevent"]), ["space"])
              ]
            }, [
              k(yt, {
                state: a,
                onRetry: (O) => ge(a)
              }, null, 8, ["state", "onRetry"]),
              y("div", Qt, [
                y("span", Xt, [
                  k(o(E), {
                    icon: a.icon || a.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                y("div", Zt, [
                  y("div", {
                    class: "kx-card-name",
                    title: a.name || "(untitled)"
                  }, j(a.name || "(untitled)"), 9, en),
                  a.badge ? (p(), m("div", tn, [
                    k(o(xe), {
                      severity: d(a.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: q(() => [
                        k(o(E), {
                          icon: a.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        G(j(a.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : S("", !0)
                ]),
                y("div", {
                  class: "kx-card-actions",
                  onClick: i[1] || (i[1] = ie(() => {
                  }, ["stop"]))
                }, [
                  k(o(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${a.name}`,
                    onClick: (O) => !a.deleting_at && $(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: q(({ class: O }) => [
                      k(o(E), {
                        icon: "tabler:pencil",
                        class: W(O),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  k(o(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${a.name}`,
                    onClick: (O) => Ce(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: q(({ class: O }) => [
                      k(o(E), {
                        icon: "tabler:share",
                        class: W(O),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  k(o(Z), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${a.name}`,
                    onClick: (O) => ge(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: q(({ class: O }) => [
                      k(o(E), {
                        icon: "tabler:trash",
                        class: W(O),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              y("div", nn, j(a.description || "No description"), 1),
              a.stat_items && a.stat_items.length ? (p(), m("div", an, [
                (p(!0), m(J, null, he(a.stat_items, (O, Be) => (p(), m("span", {
                  key: Be,
                  class: "kx-stat",
                  title: `${r(O.value)} ${O.label}`,
                  "aria-label": `${r(O.value)} ${O.label}`
                }, [
                  O.icon ? (p(), fe(o(E), {
                    key: 0,
                    icon: O.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : S("", !0),
                  G(j(r(O.value)), 1)
                ], 8, on))), 128))
              ])) : S("", !0)
            ], 40, Yt))), 128))
          ])) : (p(), m("div", Gt, [...i[15] || (i[15] = [
            y("div", { class: "kx-empty-title" }, "No matches", -1),
            y("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (p(), m("div", Ut, [
            y("div", Ft, [
              k(o(E), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            i[13] || (i[13] = y("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            i[14] || (i[14] = y("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            k(o(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: w
            }, {
              icon: q(({ class: a }) => [
                k(o(E), {
                  icon: "tabler:plus",
                  class: W(a),
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
        api: o(U),
        engines: o(h),
        models: o(x),
        target: g.value,
        "load-error": o(A),
        onRetry: o(ee),
        onClose: i[9] || (i[9] = (a) => c.value = !1),
        onSaved: ke
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (p(), m("div", {
        key: 2,
        ref_key: "shareHost",
        ref: de
      }, null, 512)) : S("", !0)
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
