import { u as Be, W as Ve } from "./index-D52CRMw6.js";
import { B as Oe, s as Ae, a as Z, e as ne, f as qe, _ as We, P as Ue } from "./KbDialog.vue_vue_type_script_setup_true_lang-phDmIDoa.js";
import { openBlock as u, createElementBlock as v, mergeProps as se, createElementVNode as f, defineComponent as be, computed as ue, withModifiers as ie, Fragment as J, createTextVNode as G, toDisplayString as H, createCommentVNode as E, createVNode as m, unref as o, watch as ve, onBeforeUnmount as me, createBlock as fe, resolveDynamicComponent as Fe, renderSlot as Ke, renderList as he, ref as M, nextTick as _e, normalizeStyle as Ge, onMounted as Je, withDirectives as Ye, isRef as Qe, vModelText as Xe, withCtx as q, normalizeClass as W, withKeys as Me } from "vue";
import { _ as Ze } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as Ne, api as U, host as Re, loadByTagName as Ie, define as et } from "@wippy-fe/proxy";
import { c as tt, a as nt, s as at, u as ot, b as st } from "./constants-1YdzWmIJ.js";
import { Icon as D } from "@iconify/vue";
import { s as it } from "./styles-Bn0s9kIq.js";
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
  extends: Ae,
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
}, Te = {
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
function pt(e, l, d, s, y, O) {
  return u(), v("div", se({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(u(), v("svg", se({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: O.svgStyle
  }, e.ptm("spin")), [f("circle", se({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, ut)], 16))], 16);
}
Te.render = pt;
const gt = { key: 0 }, ft = /* @__PURE__ */ be({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const l = e, d = ue(() => !l.state.deletion_job || ["dead", "cancelled"].includes(l.state.deletion_job.status));
    return (s, y) => e.state.deleting_at ? (u(), v("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: y[1] || (y[1] = ie(() => {
      }, ["stop"])),
      onKeydown: y[2] || (y[2] = ie(() => {
      }, ["stop"]))
    }, [
      d.value ? (u(), v(J, { key: 0 }, [
        f("span", null, [
          y[3] || (y[3] = G("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (u(), v("span", gt, ": " + H(e.state.deletion_job.last_error), 1)) : E("", !0)
        ]),
        m(o(Z), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: y[0] || (y[0] = ie((O) => s.$emit("retry"), ["stop"]))
        })
      ], 64)) : (u(), v(J, { key: 1 }, [
        m(o(Te), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        y[4] || (y[4] = f("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : E("", !0);
  }
}), vt = /* @__PURE__ */ Ze(ft, [["__scopeId", "data-v-13f5648e"]]);
function yt(e, l, d) {
  let s = !0;
  async function y(w) {
    try {
      const { data: b } = await U.get(`/api/v1/components/${encodeURIComponent(l(w))}`);
      if (!b?.success) throw new Error(ne(b, "Could not read deletion progress"));
      s && e.value.includes(w) && (w.deleting_at = b.deleting_at, w.deletion_job_id = b.deletion_job_id, w.deletion_job = b.deletion_job);
    } catch (b) {
      s && e.value.includes(w) && Re.handleError("other", { message: ne(b, "Could not read deletion progress") });
    }
  }
  const O = ve(() => e.value, (w, b = []) => {
    for (const _ of b) w.some(($) => l($) === l(_)) || d?.(l(_));
    for (const _ of w) _.deleting_at && y(_);
  }, { immediate: !0 }), C = Ne("@message", (w) => {
    const b = tt(w);
    if (!b) return;
    const _ = e.value.find(($) => l($) === b.component_id);
    _ && (b.event === "component.deleted" ? e.value = e.value.filter(($) => l($) !== b.component_id) : y(_));
  });
  me(() => {
    s = !1, O(), typeof C == "function" && C();
  });
}
var mt = `
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
`, ht = {
  root: function(l) {
    var d = l.props;
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
}, bt = Oe.extend({
  name: "tag",
  style: mt,
  classes: ht
}), kt = {
  name: "BaseTag",
  extends: Ae,
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
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(l) {
    return typeof l;
  } : function(l) {
    return l && typeof Symbol == "function" && l.constructor === Symbol && l !== Symbol.prototype ? "symbol" : typeof l;
  }, ye(e);
}
function wt(e, l, d) {
  return (l = _t(l)) in e ? Object.defineProperty(e, l, { value: d, enumerable: !0, configurable: !0, writable: !0 }) : e[l] = d, e;
}
function _t(e) {
  var l = xt(e, "string");
  return ye(l) == "symbol" ? l : l + "";
}
function xt(e, l) {
  if (ye(e) != "object" || !e) return e;
  var d = e[Symbol.toPrimitive];
  if (d !== void 0) {
    var s = d.call(e, l);
    if (ye(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (l === "string" ? String : Number)(e);
}
var xe = {
  name: "Tag",
  extends: kt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return qe(wt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, $t = ["data-p"];
function Ct(e, l, d, s, y, O) {
  return u(), v("span", se({
    class: e.cx("root"),
    "data-p": O.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (u(), fe(Fe(e.$slots.icon), se({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (u(), v("span", se({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : E("", !0), e.value != null || e.$slots.default ? Ke(e.$slots, "default", {
    key: 2
  }, function() {
    return [f("span", se({
      class: e.cx("label")
    }, e.ptm("label")), H(e.value), 17)];
  }) : E("", !0)], 16, $t);
}
xe.render = Ct;
const Et = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, St = {
  key: 0,
  "aria-hidden": "true"
}, Dt = { class: "kx-header-stat" }, Mt = { class: "kx-header-stat-label" }, Lt = /* @__PURE__ */ be({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (l, d) => e.items.length ? (u(), v("span", Et, [
      (u(!0), v(J, null, he(e.items, (s, y) => (u(), v(J, { key: y }, [
        y ? (u(), v("span", St, " · ")) : E("", !0),
        f("span", Dt, [
          s.icon ? (u(), fe(o(D), {
            key: 0,
            icon: s.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : E("", !0),
          f("span", Mt, H(s.value.toLocaleString()) + " " + H(s.label), 1)
        ])
      ], 64))), 128))
    ])) : E("", !0);
  }
}), Pt = 2e3;
function Le(e) {
  const l = e.margin ?? 8, d = e.gap ?? 4, s = Math.max(0, e.viewportWidth), y = Math.max(0, e.viewportHeight), O = Math.max(0, s - l * 2), C = Math.min(Math.max(0, e.requestedWidth), O), w = e.align === "right" ? e.anchor.right - C : e.anchor.left, b = Math.max(l, Math.min(w, s - l - C)), _ = Math.max(0, y - e.anchor.bottom - d - l), $ = Math.max(0, e.anchor.top - d - l), K = _ < e.requestedMaxHeight && $ > _ ? "above" : "below", S = K === "above" ? $ : _, R = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), S)), N = Math.min(Math.max(0, e.panelHeight ?? R), R), L = K === "above" ? e.anchor.top - d - N : e.anchor.bottom + d, A = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(b - A.left),
    width: Math.round(C),
    maxHeight: R,
    side: K,
    top: Math.round(L - A.top)
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
    zIndex: { default: Pt }
  },
  emits: ["update:open"],
  setup(e, { emit: l }) {
    const d = e, s = l, y = M(null), O = M({ position: "fixed", visibility: "hidden" });
    function C() {
      const L = d.anchor, A = y.value;
      if (!L || !A) return;
      const ee = L.getBoundingClientRect(), I = d.width === "anchor" ? Math.max(d.minWidth, ee.width) : Math.max(d.minWidth, d.width), T = {
        anchor: ee,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: I,
        requestedMaxHeight: d.maxHeight,
        align: d.align,
        gap: d.gap
      }, j = Le(T);
      Object.assign(A.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${j.width}px`,
        maxHeight: `${j.maxHeight}px`,
        visibility: "hidden"
      });
      const B = A.getBoundingClientRect(), V = Le({
        ...T,
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
      O.value = Y;
    }
    let w = null, b = !1;
    function _() {
      b || !d.open || (b = !0, requestAnimationFrame(() => {
        b = !1, d.open && C();
      }));
    }
    function $() {
      typeof ResizeObserver > "u" || (w = new ResizeObserver(_), y.value && w.observe(y.value), d.anchor && w.observe(d.anchor));
    }
    function K() {
      w?.disconnect(), w = null, b = !1;
    }
    ve(() => d.open, async (L) => {
      K(), L && (O.value = { position: "fixed", visibility: "hidden" }, await _e(), C(), $());
    }, { immediate: !0 });
    function S(L) {
      if (!d.open) return;
      const A = L.composedPath();
      y.value && A.includes(y.value) || d.anchor && A.includes(d.anchor) || s("update:open", !1);
    }
    function R(L) {
      d.open && L.key === "Escape" && s("update:open", !1);
    }
    function N() {
      d.open && C();
    }
    return document.addEventListener("click", S), document.addEventListener("keydown", R), window.addEventListener("resize", N), window.addEventListener("scroll", N, !0), me(() => {
      K(), document.removeEventListener("click", S), document.removeEventListener("keydown", R), window.removeEventListener("resize", N), window.removeEventListener("scroll", N, !0);
    }), (L, A) => e.open ? (u(), v("div", {
      key: 0,
      ref_key: "panel",
      ref: y,
      class: "anchored-panel",
      style: Ge(O.value)
    }, [
      Ke(L.$slots, "default")
    ], 4)) : E("", !0);
  }
}), $e = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Pe = Object.keys($e), He = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Ot({ detail: e }) {
  const l = M(!1), d = M(""), s = M(""), y = M([]), O = M(""), C = M([]), w = M([]), b = M("");
  let _ = !0, $ = 0, K = !1, S = !1;
  const R = ue(() => {
    const r = O.value.trim().toLowerCase();
    return r ? y.value.filter(
      (n) => (n.name || "").toLowerCase().includes(r) || (n.description || "").toLowerCase().includes(r)
    ) : y.value;
  });
  function N(r) {
    const n = r.toLowerCase();
    return n.includes("no implementation") || n.includes("no engine") || n.includes("contract unavailable") || n.includes("not found") && n.includes("binding");
  }
  async function L() {
    if (!_) return !1;
    const r = ++$;
    l.value = !0, d.value = "", s.value = "";
    try {
      const { data: n } = await U.get("/api/v1/knowledge/list");
      if (!n?.success) {
        const k = n?.error || "failed to load knowledge bases";
        if (N(k))
          return r === $ && _ && (s.value = He), !1;
        throw new Error(k);
      }
      return r === $ && _ && (y.value = n.items || []), !0;
    } catch (n) {
      const k = ne(n, "could not load knowledge bases");
      return r === $ && _ && (N(k) ? s.value = He : d.value = k), !1;
    } finally {
      r === $ && (l.value = !1, _ && S && !K && te());
    }
  }
  async function A() {
    try {
      const { data: r } = await U.get("/api/v1/knowledge/models");
      C.value = r?.success ? r.models || [] : [];
    } catch {
      C.value = [];
    }
  }
  async function ee() {
    try {
      const { data: r } = await U.get("/api/v1/knowledge/engines");
      w.value = r?.success ? r.engines || [] : [];
    } catch {
      w.value = [];
    }
  }
  function I(r) {
    return w.value.find((n) => n.kb_type === r);
  }
  async function T() {
    b.value = "";
    try {
      const [r, n] = await Promise.all([
        U.get("/api/v1/knowledge/engines"),
        U.get("/api/v1/knowledge/models")
      ]);
      if (!r.data?.success) throw new Error(r.data?.error || "Could not load knowledge engines.");
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load embedding models.");
      w.value = r.data.engines || [], C.value = n.data.models || [];
    } catch (r) {
      w.value = [], C.value = [], b.value = ne(r, "Could not load knowledge engines.");
    }
  }
  function j(r) {
    return !!r && typeof r == "object" && !Array.isArray(r);
  }
  function B(r) {
    if (j(r)) return r;
    if (!(typeof r != "string" || !r))
      try {
        const n = JSON.parse(r);
        return j(n) ? n : void 0;
      } catch {
        return;
      }
  }
  function V(r, n) {
    if (!n) return;
    let k = r;
    for (const t of n.split(".")) {
      if (!j(k)) return;
      k = k[t];
    }
    return k;
  }
  function Y(r, n) {
    if (!Array.isArray(n)) return [];
    const k = [];
    for (const t of n) {
      const c = V(r, t.path), g = typeof c == "number" ? c : Number(c || 0);
      g < (t.min ?? 0) || k.push({ icon: t.icon, value: g, label: String(g === 1 ? t.singular : t.plural) });
    }
    return k;
  }
  function F(r, n) {
    return Object.prototype.hasOwnProperty.call(r, n);
  }
  function re(r, n) {
    return Pe.some((k) => F(r, k)) ? !0 : Array.isArray(n) ? n.some((k) => {
      const t = k.path || "";
      return t !== "" && F(r, t.split(".")[0]);
    }) : !1;
  }
  function ae(r, n, k) {
    const t = String(n.kb_type || k || ""), c = I(t), g = {
      kb_type: t || k,
      badge: c?.badge
    };
    for (const h of Pe) {
      const x = n[h];
      F(n, h) && typeof x == "number" && (g[h] = x);
    }
    return (re(n, c?.stats_spec) || F(n, "kb_type")) && (g.stat_items = Y({ ...r, ...n }, c?.stats_spec)), g;
  }
  function Q(r, n, k = []) {
    const t = {};
    typeof n.title == "string" && (t.name = n.title), typeof n.comment == "string" && (t.description = n.comment), typeof n.icon == "string" && (t.icon = n.icon), typeof n.status == "string" && (t.status = n.status), typeof n.auto_summary == "string" && (t.auto_summary = n.auto_summary), typeof n.auto_description == "string" && (t.auto_description = n.auto_description), typeof n.kb_type == "string" && (t.kb_type = n.kb_type), Object.assign(t, ae(r, n, t.kb_type || r.kb_type));
    const c = { ...r, ...t };
    for (const g of k) {
      const h = g === "title" ? "name" : g;
      delete c[h];
    }
    return c;
  }
  const oe = M(null);
  function X(r, n) {
    const k = B(n.meta) || {}, t = n.deleted || [];
    y.value = y.value.map((c) => c.id === r ? Q(c, k, t) : c), e.value?.id === r && (e.value = Q(e.value, k, t));
  }
  function z() {
    _ = !1, S = !1, pe?.(), oe.value?.(), oe.value = null;
  }
  async function te() {
    if (_) {
      if (K || l.value) {
        S = !0;
        return;
      }
      K = !0;
      try {
        do
          S = !1, await L();
        while (_ && S);
      } finally {
        K = !1;
      }
    }
  }
  const pe = Ne("@message", (r) => {
    const n = nt(r, void 0, $e);
    if (!n) return;
    const k = y.value.some((t) => t.id === n.component_id);
    (k || e.value?.id === n.component_id) && X(n.component_id, n), !k && typeof n.meta.kb_type == "string" && n.meta.kb_type && te();
  });
  return me(z), {
    loading: l,
    error: d,
    notice: s,
    kbs: y,
    query: O,
    filtered: R,
    models: C,
    engines: w,
    dialogLoadError: b,
    load: L,
    loadModels: A,
    loadEngines: ee,
    engineFor: I,
    loadDialogCatalog: T,
    detailUnsub: oe,
    applyComponentMetaEvent: X,
    clearComponentSubscriptions: z
  };
}
function At({ detail: e, detailUnsub: l, kbs: d, engines: s, engineFor: y, applyComponentMetaEvent: O, route: C, navigate: w, loadEngines: b }) {
  const _ = M(!1), $ = M(""), K = M(null);
  let S = null, R = 0, N = 0;
  const L = ue(() => e.value ? y(e.value.kb_type || "")?.manage_ui_id : void 0), A = ue(() => (e.value ? y(e.value.kb_type || "")?.manage_views : void 0) || []), ee = ue(() => A.value.length > 1), I = M(""), T = M("");
  let j = !1, B = 0;
  function V() {
    const t = e.value?.kb_type;
    return t ? `kx:kb:detail-view:${t}` : null;
  }
  ve(A, (t) => {
    if (!t.length) {
      I.value = "";
      return;
    }
    const c = t.map((x) => x.id);
    let g = "";
    try {
      const x = V();
      g = x && localStorage.getItem(x) || "";
    } catch {
    }
    const h = c.includes(g) ? g : c[0];
    h !== I.value && (I.value = h);
  }, { immediate: !0 });
  function Y() {
    const t = { kb_id: e.value?.id, route: T.value };
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
        S?.setAttribute("config", Y());
      } catch {
      }
    }
  }
  function re(t) {
    t.stopPropagation();
    const c = e.value?.id;
    if (!c || j) return;
    const g = typeof t.detail == "string" ? t.detail : t.detail?.path ?? t.detail?.route ?? "", h = String(g || "").replace(/^\/+/, "");
    T.value = h, X(h ? `${c}/${h}` : c);
  }
  function ae(t) {
    t.stopPropagation();
  }
  function Q(t = !0) {
    t && N++, S && (S.removeEventListener("kb-changed", ae), S.removeEventListener("navigate", re), S.remove(), S = null);
  }
  async function oe() {
    const t = ++N;
    Q(!1);
    const c = L.value, g = K.value, h = e.value?.id;
    if (!c || !g || !h) return;
    try {
      await Ie(c, { timeoutMs: 8e3 });
    } catch {
    }
    if (t !== N || e.value?.id !== h || L.value !== c || K.value !== g) return;
    g.replaceChildren();
    const x = document.createElement(c);
    try {
      x.setAttribute("config", Y());
    } catch {
    }
    x.addEventListener("kb-changed", ae), x.addEventListener("navigate", re), g.appendChild(x), S = x;
  }
  function X(t) {
    j || w(t);
  }
  function z(t, c) {
    return R === t && e.value?.id === c;
  }
  async function te(t, c = !0) {
    const g = ++R, h = t.id;
    e.value = { ...t }, l.value?.(), l.value = h ? at(h, (x) => O(h, x), $e) : null, $.value = "", _.value = !0, Q(), c && X(h);
    try {
      const { data: x } = await U.get(`/api/v1/knowledge/${h}`);
      if (!z(g, h)) return;
      x?.success ? e.value = { ...e.value, ...x } : $.value = x?.error || "could not load knowledge base";
    } catch (x) {
      if (!z(g, h)) return;
      $.value = ne(x, "could not load knowledge base");
    } finally {
      z(g, h) && (_.value = !1);
    }
    z(g, h) && (s.value.length || await b(), z(g, h) && (await _e(), z(g, h) && await oe()));
  }
  async function pe() {
    const t = e.value?.id;
    if (!t) return;
    const c = ++R;
    $.value = "";
    try {
      const { data: g } = await U.get(`/api/v1/knowledge/${t}`);
      if (!z(c, t)) return;
      g?.success ? e.value = { ...e.value, ...g } : $.value = g?.error || "could not load knowledge base";
    } catch (g) {
      if (!z(c, t)) return;
      $.value = ne(g, "could not load knowledge base");
    }
    if (z(c, t) && (await _e(), !!z(c, t)))
      try {
        S?.setAttribute("config", Y());
      } catch {
      }
  }
  function r() {
    const t = e.value?.id;
    if (!t || !T.value) {
      n();
      return;
    }
    w({ path: t, back: { within: t } });
  }
  function n(t = !0) {
    R++, Q(), l.value?.(), l.value = null, e.value = null, T.value = "", t && X("");
  }
  async function k(t) {
    const c = ++B, g = String(t || "").split("/").filter(Boolean), h = g[0] || "", x = g.slice(1).join("/");
    j = !0;
    try {
      if (c !== B) return;
      if (!h)
        e.value && n(!1);
      else if (e.value?.id !== h) {
        T.value = x;
        const ke = d.value.find((ge) => ge.id === h);
        if (await te(ke || { id: h }, !1), c !== B) return;
      } else if (x !== T.value) {
        T.value = x;
        try {
          S?.setAttribute("config", Y());
        } catch {
        }
      }
    } finally {
      c === B && (j = !1);
    }
  }
  return ve(C, (t) => {
    k(t);
  }), me(() => {
    Q(), l.value?.(), l.value = null;
  }), {
    detailLoading: _,
    detailError: $,
    detailHost: K,
    detailManageTag: L,
    detailViews: A,
    detailHasViews: ee,
    detailView: I,
    innerRoute: T,
    setDetailView: F,
    openDetail: te,
    refreshOpenDetail: pe,
    closeDetail: n,
    backDetail: r,
    applyRoute: k,
    pushRoute: X,
    unmountDetailWc: Q
  };
}
const Kt = { class: "kx" }, Nt = { class: "kx-head" }, Rt = { class: "kx-head-icon" }, It = { class: "kx-head-actions" }, Tt = { class: "kx-count" }, jt = { class: "kx-search" }, zt = {
  key: 0,
  class: "kx-err"
}, Bt = {
  key: 1,
  class: "kx-notice"
}, Vt = { class: "kx-body" }, qt = {
  key: 0,
  class: "kx-loading"
}, Wt = {
  key: 1,
  class: "kx-empty"
}, Ut = { class: "kx-empty-ico" }, Ft = {
  key: 2,
  class: "kx-empty"
}, Gt = {
  key: 3,
  class: "kx-grid"
}, Jt = ["aria-label", "onClick", "onKeydown"], Yt = { class: "kx-card-head" }, Qt = { class: "kx-ficon" }, Xt = { class: "kx-card-id" }, Zt = ["title"], en = {
  key: 0,
  class: "kx-card-meta"
}, tn = { class: "kx-card-desc" }, nn = {
  key: 0,
  class: "kx-stats"
}, an = ["title", "aria-label"], on = { class: "kx-bar" }, sn = { class: "kx-bar-l" }, rn = ["title"], ln = {
  key: 1,
  class: "kx-summary"
}, dn = { class: "kx-summary-pop-h" }, cn = {
  key: 0,
  class: "kx-summary-pop-sum"
}, un = {
  key: 1,
  class: "kx-summary-pop-desc"
}, pn = { class: "kx-bar-r" }, gn = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, fn = ["aria-selected", "onClick"], vn = {
  key: 0,
  class: "kx-err"
}, yn = {
  key: 0,
  class: "kx-loading"
}, mn = { class: "kx-detail-meta" }, hn = {
  key: 0,
  class: "kx-detail-desc"
}, bn = { class: "kx-stats" }, kn = {
  key: 0,
  class: "kx-stat"
}, wn = {
  key: 0,
  class: "kx-detail-summary"
}, _n = /* @__PURE__ */ be({
  __name: "knowledge",
  setup(e) {
    const l = (p) => (p ?? 0).toLocaleString();
    function d(p) {
      if (p === "neutral") return "secondary";
      if (p === "warning") return "warn";
      if (p === "info" || p === "success" || p === "danger") return p;
    }
    const s = M(null), y = Ot({ detail: s }), {
      loading: O,
      error: C,
      notice: w,
      kbs: b,
      query: _,
      filtered: $,
      models: K,
      engines: S,
      dialogLoadError: R,
      load: N,
      loadEngines: L,
      engineFor: A,
      loadDialogCatalog: ee,
      detailUnsub: I,
      applyComponentMetaEvent: T
    } = y, j = ot(), B = st(), V = At({
      detail: s,
      detailUnsub: I,
      kbs: b,
      engines: S,
      engineFor: A,
      applyComponentMetaEvent: T,
      route: ue(() => j.value.route),
      navigate: (p) => B("navigate", p),
      loadEngines: L
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
      closeDetail: r,
      backDetail: n,
      applyRoute: k
    } = V;
    function t(p) {
      s.value ? F.value = p : C.value = p;
    }
    const c = M(!1), g = M(null);
    async function h() {
      g.value = null, await ee(), c.value = !0;
    }
    async function x(p) {
      C.value = "", F.value = "", R.value = "", S.value.length || await L();
      try {
        const { data: i } = await U.get(`/api/v1/knowledge/${p.id}`);
        if (!i?.success) throw new Error(i?.error || "could not load knowledge base settings");
        g.value = {
          id: p.id,
          name: i.name ?? p.name,
          description: i.description ?? p.description,
          icon: i.icon ?? p.icon,
          kb_type: i.kb_type ?? p.kb_type,
          embedding_model: i.embedding_model,
          config: i.config && typeof i.config == "object" ? i.config : {}
        }, c.value = !0;
      } catch (i) {
        g.value = null, c.value = !1, t(ne(i, "could not load knowledge base settings"));
      }
    }
    async function ke() {
      c.value = !1;
      const p = s.value?.id;
      if (await N(), p && g.value && g.value.id === p)
        try {
          const { data: i } = await U.get(`/api/v1/knowledge/${p}`);
          i?.success && s.value && s.value.id === p && (s.value = { ...s.value, ...i });
        } catch {
        }
      g.value = null;
    }
    async function ge(p) {
      if (await Re.confirm({
        header: "Delete knowledge base",
        message: `Delete “${p.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        t(""), C.value = "";
        try {
          const { data: a } = await U.delete(`/api/v1/knowledge/${p.id}`);
          if (!a?.success) throw new Error(a?.error || "delete failed");
          s.value?.id === p.id && r(), await N();
        } catch (a) {
          t(ne(a, "delete failed"));
        }
      }
    }
    const le = M(!1), we = M(null), de = M(null);
    function Ce(p) {
      we.value = p, le.value = !0;
    }
    function Ee() {
      le.value = !1, we.value = null;
    }
    const ce = M(!1), Se = M(null);
    function De(p) {
      p.key === "Escape" && le.value && Ee();
    }
    Je(() => {
      window.addEventListener("keydown", De);
    }), me(() => {
      window.removeEventListener("keydown", De);
    });
    async function je() {
      const p = we.value;
      if (!de.value || !p) return;
      if (de.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Ie("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const i = document.createElement("kickside-share");
      i.setAttribute("config", JSON.stringify({
        resource_id: p.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(p.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(p.id)}`,
        title: p.name || ""
      })), i.style.display = "block", i.addEventListener("close", Ee), de.value.appendChild(i);
    }
    return ve([le, de], async () => {
      le.value && de.value && await je();
    }), Be(async () => {
      try {
        await Promise.all([N(), L(), pe()]), !s.value && j.value.route && await k(j.value.route);
      } catch (p) {
        C.value = ne(p, "host API unavailable");
      }
    }), yt(b, (p) => p.id, (p) => {
      s.value?.id === p && r();
    }), (p, i) => (u(), v("div", Kt, [
      s.value ? (u(), v(J, { key: 1 }, [
        f("div", on, [
          f("div", sn, [
            f("button", {
              class: "kx-back",
              onClick: i[2] || (i[2] = (a) => o(n)())
            }, [
              m(o(D), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              i[16] || (i[16] = G(" Back", -1))
            ]),
            f("h1", {
              class: "kx-title",
              title: s.value.name || "(untitled)"
            }, H(s.value.name || "(untitled)"), 9, rn),
            s.value.badge ? (u(), fe(o(xe), {
              key: 0,
              severity: d(s.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: q(() => [
                m(o(D), {
                  icon: s.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                G(H(s.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : E("", !0),
            m(Lt, {
              items: s.value.stat_items || []
            }, null, 8, ["items"]),
            s.value.auto_summary || s.value.auto_description ? (u(), v("span", ln, [
              m(o(Z), {
                ref_key: "summaryAnchor",
                ref: Se,
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
                  m(o(D), {
                    icon: "tabler:sparkles",
                    class: W(a),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              m(Ht, {
                open: ce.value,
                "onUpdate:open": i[5] || (i[5] = (a) => ce.value = a),
                anchor: Se.value,
                width: 340
              }, {
                default: q(() => [
                  f("div", {
                    class: "kx-summary-pop",
                    onClick: i[4] || (i[4] = ie(() => {
                    }, ["stop"]))
                  }, [
                    f("div", dn, [
                      m(o(D), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      i[17] || (i[17] = f("span", null, "About this knowledge base", -1))
                    ]),
                    s.value.auto_summary ? (u(), v("p", cn, H(s.value.auto_summary), 1)) : E("", !0),
                    s.value.auto_description ? (u(), v("p", un, H(s.value.auto_description), 1)) : E("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : E("", !0)
          ]),
          f("div", pn, [
            o(oe) ? (u(), v("div", gn, [
              (u(!0), v(J, null, he(o(Q), (a) => (u(), v("button", {
                key: a.id,
                class: W(["kx-viewseg-btn", { on: o(X) === a.id }]),
                role: "tab",
                "aria-selected": o(X) === a.id,
                onClick: (P) => o(z)(a.id)
              }, [
                a.icon ? (u(), fe(o(D), {
                  key: 0,
                  icon: a.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : E("", !0),
                G(" " + H(a.label), 1)
              ], 10, fn))), 128))
            ])) : E("", !0),
            m(o(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: i[6] || (i[6] = (a) => x(s.value))
            }, {
              icon: q(({ class: a }) => [
                m(o(D), {
                  icon: "tabler:pencil",
                  class: W(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            m(o(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: i[7] || (i[7] = (a) => Ce(s.value))
            }, {
              icon: q(({ class: a }) => [
                m(o(D), {
                  icon: "tabler:share",
                  class: W(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            m(o(Z), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: i[8] || (i[8] = (a) => ge(s.value))
            }, {
              icon: q(({ class: a }) => [
                m(o(D), {
                  icon: "tabler:trash",
                  class: W(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(F) ? (u(), v("div", vn, H(o(F)), 1)) : E("", !0),
        f("div", {
          class: W(["kx-body", { "kx-body-bleed": o(ae) }])
        }, [
          o(Y) ? (u(), v("div", yn, [
            m(o(D), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[18] || (i[18] = G(" Loading… ", -1))
          ])) : (u(), v(J, { key: 1 }, [
            o(ae) ? E("", !0) : (u(), v(J, { key: 0 }, [
              f("div", mn, [
                s.value.description ? (u(), v("div", hn, H(s.value.description), 1)) : E("", !0),
                f("div", bn, [
                  s.value.embedding_model ? (u(), v("span", kn, [
                    m(o(D), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    G(H(s.value.embedding_model), 1)
                  ])) : E("", !0)
                ])
              ]),
              s.value.auto_summary ? (u(), v("div", wn, [
                i[19] || (i[19] = f("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                G(" " + H(s.value.auto_summary), 1)
              ])) : E("", !0)
            ], 64)),
            f("div", {
              ref_key: "detailHost",
              ref: re,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (u(), v(J, { key: 0 }, [
        f("header", Nt, [
          f("div", Rt, [
            m(o(D), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          i[10] || (i[10] = f("div", { class: "kx-head-text" }, [
            f("h1", { class: "kx-head-title" }, "Knowledge"),
            f("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          f("div", It, [
            f("span", Tt, H(o(b).length) + " knowledge base" + H(o(b).length !== 1 ? "s" : ""), 1),
            f("div", jt, [
              m(o(D), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Ye(f("input", {
                "onUpdate:modelValue": i[0] || (i[0] = (a) => Qe(_) ? _.value = a : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Xe, o(_)]
              ])
            ]),
            m(o(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: h
            }, {
              icon: q(({ class: a }) => [
                m(o(D), {
                  icon: "tabler:plus",
                  class: W(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(C) ? (u(), v("div", zt, H(o(C)), 1)) : E("", !0),
        o(w) ? (u(), v("div", Bt, [
          m(o(D), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          i[11] || (i[11] = f("span", null, [
            f("strong", null, "No knowledge engine installed."),
            G(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : E("", !0),
        f("div", Vt, [
          o(O) && !o(b).length ? (u(), v("div", qt, [
            m(o(D), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[12] || (i[12] = G(" Loading… ", -1))
          ])) : o(b).length ? o($).length ? (u(), v("div", Gt, [
            (u(!0), v(J, null, he(o($), (a) => (u(), v("div", {
              key: a.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${a.name || "knowledge base"}`,
              onClick: (P) => !a.deleting_at && o(te)(a),
              onKeydown: [
                Me((P) => !a.deleting_at && o(te)(a), ["enter"]),
                Me(ie((P) => !a.deleting_at && o(te)(a), ["prevent"]), ["space"])
              ]
            }, [
              m(vt, {
                state: a,
                onRetry: (P) => ge(a)
              }, null, 8, ["state", "onRetry"]),
              f("div", Yt, [
                f("span", Qt, [
                  m(o(D), {
                    icon: a.icon || a.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                f("div", Xt, [
                  f("div", {
                    class: "kx-card-name",
                    title: a.name || "(untitled)"
                  }, H(a.name || "(untitled)"), 9, Zt),
                  a.badge ? (u(), v("div", en, [
                    m(o(xe), {
                      severity: d(a.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: q(() => [
                        m(o(D), {
                          icon: a.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        G(H(a.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : E("", !0)
                ]),
                f("div", {
                  class: "kx-card-actions",
                  onClick: i[1] || (i[1] = ie(() => {
                  }, ["stop"]))
                }, [
                  m(o(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${a.name}`,
                    onClick: (P) => !a.deleting_at && x(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: q(({ class: P }) => [
                      m(o(D), {
                        icon: "tabler:pencil",
                        class: W(P),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  m(o(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${a.name}`,
                    onClick: (P) => Ce(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: q(({ class: P }) => [
                      m(o(D), {
                        icon: "tabler:share",
                        class: W(P),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  m(o(Z), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${a.name}`,
                    onClick: (P) => ge(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: q(({ class: P }) => [
                      m(o(D), {
                        icon: "tabler:trash",
                        class: W(P),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              f("div", tn, H(a.description || "No description"), 1),
              a.stat_items && a.stat_items.length ? (u(), v("div", nn, [
                (u(!0), v(J, null, he(a.stat_items, (P, ze) => (u(), v("span", {
                  key: ze,
                  class: "kx-stat",
                  title: `${l(P.value)} ${P.label}`,
                  "aria-label": `${l(P.value)} ${P.label}`
                }, [
                  P.icon ? (u(), fe(o(D), {
                    key: 0,
                    icon: P.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : E("", !0),
                  G(H(l(P.value)), 1)
                ], 8, an))), 128))
              ])) : E("", !0)
            ], 40, Jt))), 128))
          ])) : (u(), v("div", Ft, [...i[15] || (i[15] = [
            f("div", { class: "kx-empty-title" }, "No matches", -1),
            f("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (u(), v("div", Wt, [
            f("div", Ut, [
              m(o(D), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            i[13] || (i[13] = f("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            i[14] || (i[14] = f("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            m(o(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: h
            }, {
              icon: q(({ class: a }) => [
                m(o(D), {
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
      m(We, {
        open: c.value,
        api: o(U),
        engines: o(S),
        models: o(K),
        target: g.value,
        "load-error": o(R),
        onRetry: o(ee),
        onClose: i[9] || (i[9] = (a) => c.value = !1),
        onSaved: ke
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (u(), v("div", {
        key: 2,
        ref_key: "shareHost",
        ref: de
      }, null, 512)) : E("", !0)
    ]));
  }
}), xn = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, $n = {
  wippy: xn
};
class Cn extends Ve {
  static get wippyConfig() {
    return {
      propsSchema: $n.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: it
    };
  }
  static get vueConfig() {
    return { rootComponent: _n, plugins: [Ue] };
  }
}
et(import.meta.url, Cn);
//# sourceMappingURL=index.js.map
