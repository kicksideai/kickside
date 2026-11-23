import { B as He, s as Re, f as Be, a as je, P as Ve } from "./wc-runtime-Bmxpx-Ro.js";
import { openBlock as f, createElementBlock as v, mergeProps as re, createElementVNode as m, defineComponent as we, computed as ge, withModifiers as ve, Fragment as X, createTextVNode as G, toDisplayString as P, createCommentVNode as x, createVNode as h, unref as o, createBlock as me, resolveDynamicComponent as We, renderSlot as ze, renderList as he, ref as $, watch as be, nextTick as xe, onBeforeUnmount as _e, normalizeStyle as Ue, onMounted as Fe, withDirectives as Je, isRef as Ye, vModelText as Ge, withCtx as U, normalizeClass as F } from "vue";
import { s as Q, e as le, l as Qe, u as Xe, _ as Ze } from "./KbDialog.vue_vue_type_script_setup_true_lang-DiRAkw8s.js";
import { Icon as _ } from "@iconify/vue";
import { on as et, api as J, loadByTagName as Ne, host as tt } from "@wippy-fe/proxy";
import { u as nt, a as at } from "./constants-BEKvlp0G.js";
import { c as ot, s as st } from "./componentRealtime-m98w4dre.js";
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
}), ct = {
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
}, dt = ["fill", "stroke-width"];
function ut(e, d, c, i, g, H) {
  return f(), v("div", re({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(f(), v("svg", re({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: H.svgStyle
  }, e.ptm("spin")), [m("circle", re({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, dt)], 16))], 16);
}
Te.render = ut;
const pt = { key: 0 }, ft = /* @__PURE__ */ we({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const d = e, c = ge(() => d.state.deletion_job === null || ["dead", "cancelled"].includes(d.state.deletion_job?.status || ""));
    return (i, g) => e.state.deleting_at ? (f(), v("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: g[1] || (g[1] = ve(() => {
      }, ["stop"])),
      onKeydown: g[2] || (g[2] = ve(() => {
      }, ["stop"]))
    }, [
      c.value ? (f(), v(X, { key: 0 }, [
        m("span", null, [
          g[3] || (g[3] = G("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (f(), v("span", pt, ": " + P(e.state.deletion_job.last_error), 1)) : x("", !0)
        ]),
        h(o(Q), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: g[0] || (g[0] = ve((H) => i.$emit("retry"), ["stop"]))
        })
      ], 64)) : (f(), v(X, { key: 1 }, [
        h(o(Te), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        g[4] || (g[4] = m("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : x("", !0);
  }
});
var gt = `
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
`, vt = {
  root: function(d) {
    var c = d.props;
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
}, mt = He.extend({
  name: "tag",
  style: gt,
  classes: vt
}), yt = {
  name: "BaseTag",
  extends: Re,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: mt,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function ye(e) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(d) {
    return typeof d;
  } : function(d) {
    return d && typeof Symbol == "function" && d.constructor === Symbol && d !== Symbol.prototype ? "symbol" : typeof d;
  }, ye(e);
}
function ht(e, d, c) {
  return (d = bt(d)) in e ? Object.defineProperty(e, d, { value: c, enumerable: !0, configurable: !0, writable: !0 }) : e[d] = c, e;
}
function bt(e) {
  var d = kt(e, "string");
  return ye(d) == "symbol" ? d : d + "";
}
function kt(e, d) {
  if (ye(e) != "object" || !e) return e;
  var c = e[Symbol.toPrimitive];
  if (c !== void 0) {
    var i = c.call(e, d);
    if (ye(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (d === "string" ? String : Number)(e);
}
var $e = {
  name: "Tag",
  extends: yt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Be(ht({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, wt = ["data-p"];
function _t(e, d, c, i, g, H) {
  return f(), v("span", re({
    class: e.cx("root"),
    "data-p": H.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (f(), me(We(e.$slots.icon), re({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (f(), v("span", re({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : x("", !0), e.value != null || e.$slots.default ? ze(e.$slots, "default", {
    key: 2
  }, function() {
    return [m("span", re({
      class: e.cx("label")
    }, e.ptm("label")), P(e.value), 17)];
  }) : x("", !0)], 16, wt);
}
$e.render = _t;
const xt = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, $t = {
  key: 0,
  "aria-hidden": "true"
}, St = { class: "kx-header-stat" }, Ct = { class: "kx-header-stat-label" }, Et = /* @__PURE__ */ we({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (d, c) => e.items.length ? (f(), v("span", xt, [
      (f(!0), v(X, null, he(e.items, (i, g) => (f(), v(X, { key: g }, [
        g ? (f(), v("span", $t, " · ")) : x("", !0),
        m("span", St, [
          i.icon ? (f(), me(o(_), {
            key: 0,
            icon: i.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : x("", !0),
          m("span", Ct, P(i.value.toLocaleString()) + " " + P(i.label), 1)
        ])
      ], 64))), 128))
    ])) : x("", !0);
  }
}), Mt = 2e3;
function Pe(e) {
  const d = e.margin ?? 8, c = e.gap ?? 4, i = Math.max(0, e.viewportWidth), g = Math.max(0, e.viewportHeight), H = Math.max(0, i - d * 2), C = Math.min(Math.max(0, e.requestedWidth), H), E = e.align === "right" ? e.anchor.right - C : e.anchor.left, M = Math.max(d, Math.min(E, i - d - C)), k = Math.max(0, g - e.anchor.bottom - c - d), R = Math.max(0, e.anchor.top - c - d), z = k < e.requestedMaxHeight && R > k ? "above" : "below", w = z === "above" ? R : k, O = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), w)), D = Math.min(Math.max(0, e.panelHeight ?? O), O), b = z === "above" ? e.anchor.top - c - D : e.anchor.bottom + c, A = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(M - A.left),
    width: Math.round(C),
    maxHeight: O,
    side: z,
    top: Math.round(b - A.top)
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
  setup(e, { emit: d }) {
    const c = e, i = d, g = $(null), H = $({ position: "fixed", visibility: "hidden" });
    function C() {
      const b = c.anchor, A = g.value;
      if (!b || !A) return;
      const Y = b.getBoundingClientRect(), N = c.width === "anchor" ? Math.max(c.minWidth, Y.width) : Math.max(c.minWidth, c.width), T = {
        anchor: Y,
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
      const K = A.getBoundingClientRect(), V = Pe({
        ...T,
        containingBlockOrigin: { left: K.left, top: K.top },
        panelHeight: K.height
      }), W = {
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
      H.value = W;
    }
    let E = null, M = !1;
    function k() {
      M || !c.open || (M = !0, requestAnimationFrame(() => {
        M = !1, c.open && C();
      }));
    }
    function R() {
      typeof ResizeObserver > "u" || (E = new ResizeObserver(k), g.value && E.observe(g.value), c.anchor && E.observe(c.anchor));
    }
    function z() {
      E?.disconnect(), E = null, M = !1;
    }
    be(() => c.open, async (b) => {
      z(), b && (H.value = { position: "fixed", visibility: "hidden" }, await xe(), C(), R());
    }, { immediate: !0 });
    function w(b) {
      if (!c.open) return;
      const A = b.composedPath();
      g.value && A.includes(g.value) || c.anchor && A.includes(c.anchor) || i("update:open", !1);
    }
    function O(b) {
      !c.open || b.key !== "Escape" || (b.preventDefault(), b.stopImmediatePropagation(), i("update:open", !1));
    }
    function D() {
      c.open && C();
    }
    return document.addEventListener("click", w), document.addEventListener("keydown", O, !0), window.addEventListener("resize", D), window.addEventListener("scroll", D, !0), _e(() => {
      z(), document.removeEventListener("click", w), document.removeEventListener("keydown", O, !0), window.removeEventListener("resize", D), window.removeEventListener("scroll", D, !0);
    }), (b, A) => e.open ? (f(), v("div", {
      key: 0,
      ref_key: "panel",
      ref: g,
      class: "anchored-panel",
      style: Ue(H.value)
    }, [
      ze(b.$slots, "default")
    ], 4)) : x("", !0);
  }
}), Ce = {
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
function ke(e, d) {
  const c = { ...e, stat_items: d?.stat_items };
  for (const i of Se) {
    const g = d?.[i];
    g === void 0 ? delete c[i] : c[i] = g;
  }
  return c;
}
const Ae = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Lt({ detail: e }) {
  const d = $(!1), c = $(""), i = $(""), g = $([]), H = $(""), C = $([]), E = $([]), M = $("");
  let k = !0;
  const R = Qe();
  let z = !1, w = !1, O = 0, D = !1;
  const b = /* @__PURE__ */ new Set(), A = ge(() => {
    const n = H.value.trim().toLowerCase();
    return n ? g.value.filter(
      (t) => (t.name || "").toLowerCase().includes(n) || (t.description || "").toLowerCase().includes(n)
    ) : g.value;
  });
  function Y(n) {
    const t = n.toLowerCase();
    return t.includes("no implementation") || t.includes("no engine") || t.includes("contract unavailable") || t.includes("not found") && t.includes("binding");
  }
  async function N() {
    if (!k) return !1;
    const n = R();
    O++, d.value = !0, c.value = "", i.value = "";
    try {
      const { data: t } = await J.get("/api/v1/knowledge/list");
      if (!t?.success) {
        const a = t?.error || "failed to load knowledge bases";
        if (Y(a))
          return n() && k && (i.value = Ae), !1;
        throw new Error(a);
      }
      return n() && k && (g.value = t.items || []), !0;
    } catch (t) {
      const a = le(t, "could not load knowledge bases");
      return n() && k && (Y(a) ? i.value = Ae : c.value = a), !1;
    } finally {
      n() && (d.value = !1, k && w && !z && ie(), b.size && ne());
    }
  }
  async function T() {
    try {
      const { data: n } = await J.get("/api/v1/knowledge/models");
      C.value = n?.success ? n.models || [] : [];
    } catch {
      C.value = [];
    }
  }
  async function q() {
    try {
      const { data: n } = await J.get("/api/v1/knowledge/engines");
      E.value = n?.success ? n.engines || [] : [];
    } catch {
      E.value = [];
    }
  }
  function K(n) {
    return E.value.find((t) => t.kb_type === n);
  }
  async function V() {
    M.value = "";
    try {
      const [n, t] = await Promise.all([
        J.get("/api/v1/knowledge/engines"),
        J.get("/api/v1/knowledge/models")
      ]);
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load knowledge engines.");
      if (!t.data?.success) throw new Error(t.data?.error || "Could not load embedding models.");
      E.value = n.data.engines || [], C.value = t.data.models || [];
    } catch (n) {
      E.value = [], C.value = [], M.value = le(n, "Could not load knowledge engines.");
    }
  }
  function W(n) {
    return !!n && typeof n == "object" && !Array.isArray(n);
  }
  function ee(n) {
    if (W(n)) return n;
    if (!(typeof n != "string" || !n))
      try {
        const t = JSON.parse(n);
        return W(t) ? t : void 0;
      } catch {
        return;
      }
  }
  function ce(n, t) {
    if (!t) return;
    let a = n;
    for (const r of t.split(".")) {
      if (!W(a)) return;
      a = a[r];
    }
    return a;
  }
  function se(n, t) {
    if (!Array.isArray(t)) return [];
    const a = [];
    for (const r of t) {
      const S = ce(n, r.path), y = typeof S == "number" ? S : Number(S || 0);
      y < (r.min ?? 0) || a.push({ icon: r.icon, value: y, label: String(y === 1 ? r.singular : r.plural) });
    }
    return a;
  }
  function B(n, t) {
    return Object.prototype.hasOwnProperty.call(n, t);
  }
  function de(n, t) {
    return Oe.some((a) => B(n, a)) ? !0 : Array.isArray(t) ? t.some((a) => {
      const r = a.path || "";
      return r !== "" && B(n, r.split(".")[0]);
    }) : !1;
  }
  function Z(n, t, a) {
    const r = String(t.kb_type || a || ""), S = K(r), y = {
      kb_type: r || a,
      badge: S?.badge
    };
    for (const j of Oe) {
      const oe = t[j];
      B(t, j) && typeof oe == "number" && (y[j] = oe);
    }
    return (de(t, S?.stats_spec) || B(t, "kb_type")) && (y.stat_items = se({ ...n, ...t }, S?.stats_spec)), y;
  }
  function I(n, t, a = []) {
    const r = {};
    typeof t.title == "string" && (r.name = t.title), typeof t.comment == "string" && (r.description = t.comment), typeof t.icon == "string" && (r.icon = t.icon), typeof t.status == "string" && (r.status = t.status), typeof t.auto_summary == "string" && (r.auto_summary = t.auto_summary), typeof t.auto_description == "string" && (r.auto_description = t.auto_description), typeof t.kb_type == "string" && (r.kb_type = t.kb_type), n.stats_from_store || Object.assign(r, Z(n, t, r.kb_type || n.kb_type));
    const S = { ...n, ...r };
    for (const y of a) {
      const j = y === "title" ? "name" : y;
      n.stats_from_store && Se.some((oe) => oe === j) || delete S[j];
    }
    return S;
  }
  const te = $(null);
  function ue(n, t) {
    const a = ee(t.meta) || {}, r = t.deleted || [], S = g.value.find((y) => y.id === n && y.stats_from_store) || (e.value?.id === n ? e.value : void 0);
    S?.stats_from_store && (Se.some((y) => B(a, y) || r.includes(y)) || de(a, K(S.kb_type || "")?.stats_spec)) && (b.add(n), ne()), g.value = g.value.map((y) => y.id === n ? I(y, a, r) : y), e.value?.id === n && (e.value = I(e.value, a, r));
  }
  async function ne() {
    if (!(D || d.value || !k || !b.size)) {
      D = !0;
      try {
        for (await Promise.resolve(); k && !d.value && b.size; ) {
          const n = [...b].slice(0, 100);
          for (const y of n) b.delete(y);
          const t = O, { data: a } = await J.get(`/api/v1/knowledge/list?ids=${n.map(encodeURIComponent).join(",")}`);
          if (!k) return;
          if (t !== O) {
            for (const y of n) b.add(y);
            continue;
          }
          if (!a?.success) continue;
          const r = new Map(
            (a.items || []).map((y) => [y.id, y])
          ), S = new Set(n);
          g.value = g.value.map((y) => y.stats_from_store && S.has(y.id) ? ke(y, r.get(y.id)) : y), e.value?.stats_from_store && S.has(e.value.id) && (e.value = ke(e.value, r.get(e.value.id)));
        }
      } catch {
      } finally {
        D = !1, b.size && ne();
      }
    }
  }
  function ae() {
    k = !1, w = !1, b.clear(), u?.(), te.value?.(), te.value = null;
  }
  async function ie() {
    if (k) {
      if (z || d.value) {
        w = !0;
        return;
      }
      z = !0;
      try {
        do
          w = !1, await N();
        while (k && w);
      } finally {
        z = !1;
      }
    }
  }
  const u = et("@message", (n) => {
    const t = ot(n, void 0, Ce);
    if (!t) return;
    const a = g.value.some((r) => r.id === t.component_id);
    (a || e.value?.id === t.component_id) && ue(t.component_id, t), !a && typeof t.meta.kb_type == "string" && t.meta.kb_type && ie();
  });
  return _e(ae), {
    loading: d,
    error: c,
    notice: i,
    kbs: g,
    query: H,
    filtered: A,
    models: C,
    engines: E,
    dialogLoadError: M,
    load: N,
    loadModels: T,
    loadEngines: q,
    engineFor: K,
    loadDialogCatalog: V,
    detailUnsub: te,
    applyComponentMetaEvent: ue,
    clearComponentSubscriptions: ae
  };
}
function Pt({ detail: e, detailUnsub: d, kbs: c, engines: i, engineFor: g, applyComponentMetaEvent: H, route: C, navigate: E, loadEngines: M }) {
  const k = $(!1), R = $(""), z = $(null);
  let w = null, O = 0, D = 0;
  const b = ge(() => e.value ? g(e.value.kb_type || "")?.manage_ui_id : void 0), A = ge(() => (e.value ? g(e.value.kb_type || "")?.manage_views : void 0) || []), Y = ge(() => A.value.length > 1), N = $(""), T = $("");
  let q = !1, K = 0;
  function V() {
    const u = e.value?.kb_type;
    return u ? `kx:kb:detail-view:${u}` : null;
  }
  be(A, (u) => {
    if (!u.length) {
      N.value = "";
      return;
    }
    const n = u.map((r) => r.id);
    let t = "";
    try {
      const r = V();
      t = r && localStorage.getItem(r) || "";
    } catch {
    }
    const a = n.includes(t) ? t : n[0];
    a !== N.value && (N.value = a);
  }, { immediate: !0 });
  function W() {
    const u = { kb_id: e.value?.id, route: T.value };
    return N.value && (u.view = N.value), JSON.stringify(u);
  }
  function ee(u) {
    if (u !== N.value) {
      N.value = u;
      try {
        const n = V();
        n && localStorage.setItem(n, u);
      } catch {
      }
      try {
        w?.setAttribute("config", W());
      } catch {
      }
    }
  }
  function ce(u) {
    u.stopPropagation();
    const n = e.value?.id;
    if (!n || q) return;
    const t = typeof u.detail == "string" ? u.detail : u.detail?.path ?? u.detail?.route ?? "", a = String(t || "").replace(/^\/+/, "");
    T.value = a, Z(a ? `${n}/${a}` : n);
  }
  function se(u) {
    u.stopPropagation();
  }
  function B(u = !0) {
    u && D++, w && (w.removeEventListener("kb-changed", se), w.removeEventListener("navigate", ce), w.remove(), w = null);
  }
  async function de() {
    const u = ++D;
    B(!1);
    const n = b.value, t = z.value, a = e.value?.id;
    if (!n || !t || !a) return;
    try {
      await Ne(n, { timeoutMs: 8e3 });
    } catch {
    }
    if (u !== D || e.value?.id !== a || b.value !== n || z.value !== t) return;
    t.replaceChildren();
    const r = document.createElement(n);
    try {
      r.setAttribute("config", W());
    } catch {
    }
    r.addEventListener("kb-changed", se), r.addEventListener("navigate", ce), t.appendChild(r), w = r;
  }
  function Z(u) {
    q || E(u);
  }
  function I(u, n) {
    return O === u && e.value?.id === n;
  }
  async function te(u, n = !0) {
    const t = ++O, a = u.id;
    e.value = { ...u }, d.value?.(), d.value = a ? st(a, (r) => H(a, r), Ce) : null, R.value = "", k.value = !0, B(), n && Z(a);
    try {
      const { data: r } = await J.get(`/api/v1/knowledge/${a}`);
      if (!I(t, a)) return;
      if (r?.success) {
        const S = { ...e.value, ...r };
        e.value = r.stats_from_store ? ke(S, r) : S;
      } else R.value = r?.error || "could not load knowledge base";
    } catch (r) {
      if (!I(t, a)) return;
      R.value = le(r, "could not load knowledge base");
    } finally {
      I(t, a) && (k.value = !1);
    }
    I(t, a) && (i.value.length || await M(), I(t, a) && (await xe(), I(t, a) && await de()));
  }
  async function ue() {
    const u = e.value?.id;
    if (!u) return;
    const n = ++O;
    R.value = "";
    try {
      const { data: t } = await J.get(`/api/v1/knowledge/${u}`);
      if (!I(n, u)) return;
      if (t?.success) {
        const a = { ...e.value, ...t };
        e.value = t.stats_from_store ? ke(a, t) : a;
      } else R.value = t?.error || "could not load knowledge base";
    } catch (t) {
      if (!I(n, u)) return;
      R.value = le(t, "could not load knowledge base");
    }
    if (I(n, u) && (await xe(), !!I(n, u)))
      try {
        w?.setAttribute("config", W());
      } catch {
      }
  }
  function ne() {
    const u = e.value?.id;
    if (!u || !T.value) {
      ae();
      return;
    }
    E({ path: u, back: { within: u } });
  }
  function ae(u = !0) {
    O++, B(), d.value?.(), d.value = null, e.value = null, T.value = "", u && Z("");
  }
  async function ie(u) {
    const n = ++K, t = String(u || "").split("/").filter(Boolean), a = t[0] || "", r = t.slice(1).join("/");
    q = !0;
    try {
      if (n !== K) return;
      if (!a)
        e.value && ae(!1);
      else if (e.value?.id !== a) {
        T.value = r;
        const S = c.value.find((y) => y.id === a);
        if (await te(S || { id: a }, !1), n !== K) return;
      } else if (r !== T.value) {
        T.value = r;
        try {
          w?.setAttribute("config", W());
        } catch {
        }
      }
    } finally {
      n === K && (q = !1);
    }
  }
  return be(C, (u) => {
    ie(u);
  }), _e(() => {
    B(), d.value?.(), d.value = null;
  }), {
    detailLoading: k,
    detailError: R,
    detailHost: z,
    detailManageTag: b,
    detailViews: A,
    detailHasViews: Y,
    detailView: N,
    innerRoute: T,
    setDetailView: ee,
    openDetail: te,
    refreshOpenDetail: ue,
    closeDetail: ae,
    backDetail: ne,
    applyRoute: ie,
    pushRoute: Z,
    unmountDetailWc: B
  };
}
const Ot = { class: "kx" }, At = { class: "kx-head" }, Ht = { class: "kx-head-icon" }, Rt = { class: "kx-head-actions" }, zt = { class: "kx-count" }, Nt = { class: "kx-search" }, Tt = {
  key: 0,
  class: "kx-err"
}, It = {
  key: 1,
  class: "kx-notice"
}, Kt = { class: "kx-body" }, qt = {
  key: 0,
  class: "kx-loading"
}, Bt = {
  key: 1,
  class: "kx-empty"
}, jt = { class: "kx-empty-ico" }, Vt = {
  key: 2,
  class: "kx-empty"
}, Wt = {
  key: 3,
  class: "kx-grid"
}, Ut = { class: "kx-card-head" }, Ft = { class: "kx-ficon" }, Jt = { class: "kx-card-id" }, Yt = ["title", "aria-label", "disabled", "onClick"], Gt = {
  key: 0,
  class: "kx-card-meta"
}, Qt = { class: "kx-card-actions" }, Xt = { class: "kx-card-desc" }, Zt = {
  key: 0,
  class: "kx-stats"
}, en = ["title", "aria-label"], tn = { class: "kx-bar" }, nn = { class: "kx-bar-l" }, an = ["title"], on = { class: "kx-summary-pop-h" }, sn = {
  key: 0,
  class: "kx-summary-pop-sum"
}, rn = {
  key: 1,
  class: "kx-summary-pop-desc"
}, ln = { class: "kx-bar-r" }, cn = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, dn = ["aria-selected", "onClick"], un = {
  key: 0,
  class: "kx-err"
}, pn = {
  key: 0,
  class: "kx-loading"
}, fn = {
  key: 0,
  class: "kx-detail-meta"
}, gn = {
  key: 0,
  class: "kx-detail-desc"
}, vn = { class: "kx-stats" }, mn = {
  key: 0,
  class: "kx-stat"
}, yn = /* @__PURE__ */ we({
  __name: "knowledge",
  setup(e) {
    const d = (p) => (p ?? 0).toLocaleString();
    function c(p) {
      if (p === "neutral") return "secondary";
      if (p === "warning") return "warn";
      if (p === "info" || p === "success" || p === "danger") return p;
    }
    const i = $(null), g = Lt({ detail: i }), {
      loading: H,
      error: C,
      notice: E,
      kbs: M,
      query: k,
      filtered: R,
      models: z,
      engines: w,
      dialogLoadError: O,
      load: D,
      loadEngines: b,
      engineFor: A,
      loadDialogCatalog: Y,
      detailUnsub: N,
      applyComponentMetaEvent: T
    } = g, q = nt(), K = at(), V = Pt({
      detail: i,
      detailUnsub: N,
      kbs: M,
      engines: w,
      engineFor: A,
      applyComponentMetaEvent: T,
      route: ge(() => q.value.route),
      navigate: (p) => K("navigate", p),
      loadEngines: b
    }), {
      detailLoading: W,
      detailError: ee,
      detailHost: ce,
      detailManageTag: se,
      detailViews: B,
      detailHasViews: de,
      detailView: Z,
      setDetailView: I,
      openDetail: te,
      refreshOpenDetail: ue,
      closeDetail: ne,
      backDetail: ae,
      applyRoute: ie
    } = V;
    function u(p) {
      i.value ? ee.value = p : C.value = p;
    }
    const n = $(!1), t = $(null);
    async function a() {
      t.value = null, await Y(), n.value = !0;
    }
    async function r(p) {
      C.value = "", ee.value = "", O.value = "", w.value.length || await b();
      try {
        const { data: l } = await J.get(`/api/v1/knowledge/${p.id}`);
        if (!l?.success) throw new Error(l?.error || "could not load knowledge base settings");
        t.value = {
          id: p.id,
          name: l.name ?? p.name,
          description: l.description ?? p.description,
          icon: l.icon ?? p.icon,
          kb_type: l.kb_type ?? p.kb_type,
          embedding_model: l.embedding_model,
          config: l.config && typeof l.config == "object" ? l.config : {}
        }, n.value = !0;
      } catch (l) {
        t.value = null, n.value = !1, u(le(l, "could not load knowledge base settings"));
      }
    }
    async function S() {
      n.value = !1;
      const p = i.value?.id;
      if (await D(), p && t.value && t.value.id === p)
        try {
          const { data: l } = await J.get(`/api/v1/knowledge/${p}`);
          l?.success && i.value && i.value.id === p && (i.value = { ...i.value, ...l });
        } catch {
        }
      t.value = null;
    }
    async function y(p) {
      if (await tt.confirm({
        header: "Delete knowledge base",
        message: `Delete “${p.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        u(""), C.value = "";
        try {
          const { data: s } = await J.delete(`/api/v1/knowledge/${p.id}`);
          if (!s?.success) throw new Error(s?.error || "delete failed");
          Ke(p.id, s), i.value?.id === p.id && ne(), await D();
        } catch (s) {
          u(le(s, "delete failed"));
        }
      }
    }
    const j = $(!1), oe = $(null), pe = $(null);
    function Ee(p) {
      oe.value = p, j.value = !0;
    }
    function Me() {
      j.value = !1, oe.value = null;
    }
    const fe = $(!1), De = $(null);
    function Le(p) {
      p.key === "Escape" && j.value && Me();
    }
    Fe(() => {
      window.addEventListener("keydown", Le);
    }), _e(() => {
      window.removeEventListener("keydown", Le);
    });
    async function Ie() {
      const p = oe.value;
      if (!pe.value || !p) return;
      if (pe.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Ne("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const l = document.createElement("kickside-share");
      l.setAttribute("config", JSON.stringify({
        resource_id: p.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(p.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(p.id)}`,
        title: p.name || ""
      })), l.style.display = "block", l.addEventListener("close", Me), pe.value.appendChild(l);
    }
    be([j, pe], async () => {
      j.value && pe.value && await Ie();
    }), je(async () => {
      try {
        await Promise.all([D(), b(), ue()]), !i.value && q.value.route && await ie(q.value.route);
      } catch (p) {
        C.value = le(p, "host API unavailable");
      }
    });
    const { acceptDeletion: Ke } = Xe(M, (p) => p.id, (p) => {
      i.value?.id === p && ne();
    }, D);
    return (p, l) => (f(), v("div", Ot, [
      i.value ? (f(), v(X, { key: 1 }, [
        m("div", tn, [
          m("div", nn, [
            m("button", {
              class: "kx-back",
              onClick: l[1] || (l[1] = (s) => o(ae)())
            }, [
              h(o(_), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              l[15] || (l[15] = G(" Back", -1))
            ]),
            m("h1", {
              class: "kx-title",
              title: i.value.name || "(untitled)"
            }, P(i.value.name || "(untitled)"), 9, an),
            i.value.badge ? (f(), me(o($e), {
              key: 0,
              severity: c(i.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: U(() => [
                h(o(_), {
                  icon: i.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                G(P(i.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : x("", !0),
            h(Et, {
              items: i.value.stat_items || []
            }, null, 8, ["items"]),
            i.value.auto_summary || i.value.auto_description ? (f(), v("span", {
              key: 1,
              ref_key: "summaryAnchor",
              ref: De,
              class: "kx-summary"
            }, [
              h(o(Q), {
                severity: "secondary",
                outlined: "",
                class: F(["kx-summary-btn", { on: fe.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": fe.value,
                onClick: l[2] || (l[2] = ve((s) => fe.value = !fe.value, ["stop"]))
              }, {
                icon: U(({ class: s }) => [
                  h(o(_), {
                    icon: "tabler:sparkles",
                    class: F(s),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              h(Dt, {
                open: fe.value,
                "onUpdate:open": l[4] || (l[4] = (s) => fe.value = s),
                anchor: De.value,
                width: 340
              }, {
                default: U(() => [
                  m("div", {
                    class: "kx-summary-pop",
                    onClick: l[3] || (l[3] = ve(() => {
                    }, ["stop"]))
                  }, [
                    m("div", on, [
                      h(o(_), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      l[16] || (l[16] = m("span", null, "About this knowledge base", -1))
                    ]),
                    i.value.auto_summary ? (f(), v("p", sn, P(i.value.auto_summary), 1)) : x("", !0),
                    i.value.auto_description ? (f(), v("p", rn, P(i.value.auto_description), 1)) : x("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ], 512)) : x("", !0)
          ]),
          m("div", ln, [
            o(de) ? (f(), v("div", cn, [
              (f(!0), v(X, null, he(o(B), (s) => (f(), v("button", {
                key: s.id,
                class: F(["kx-viewseg-btn", { on: o(Z) === s.id }]),
                role: "tab",
                "aria-selected": o(Z) === s.id,
                onClick: (L) => o(I)(s.id)
              }, [
                s.icon ? (f(), me(o(_), {
                  key: 0,
                  icon: s.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : x("", !0),
                G(" " + P(s.label), 1)
              ], 10, dn))), 128))
            ])) : x("", !0),
            h(o(Q), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: l[5] || (l[5] = (s) => r(i.value))
            }, {
              icon: U(({ class: s }) => [
                h(o(_), {
                  icon: "tabler:pencil",
                  class: F(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(o(Q), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: l[6] || (l[6] = (s) => Ee(i.value))
            }, {
              icon: U(({ class: s }) => [
                h(o(_), {
                  icon: "tabler:share",
                  class: F(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(o(Q), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: l[7] || (l[7] = (s) => y(i.value))
            }, {
              icon: U(({ class: s }) => [
                h(o(_), {
                  icon: "tabler:trash",
                  class: F(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(ee) ? (f(), v("div", un, P(o(ee)), 1)) : x("", !0),
        m("div", {
          class: F(["kx-body", { "kx-body-bleed": o(se) }])
        }, [
          o(W) ? (f(), v("div", pn, [
            h(o(_), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            l[17] || (l[17] = G(" Loading… ", -1))
          ])) : (f(), v(X, { key: 1 }, [
            o(se) ? x("", !0) : (f(), v("div", fn, [
              i.value.description ? (f(), v("div", gn, P(i.value.description), 1)) : x("", !0),
              m("div", vn, [
                i.value.embedding_model ? (f(), v("span", mn, [
                  h(o(_), {
                    icon: "tabler:vector",
                    "aria-hidden": "true"
                  }),
                  G(P(i.value.embedding_model), 1)
                ])) : x("", !0)
              ])
            ])),
            m("div", {
              ref_key: "detailHost",
              ref: ce,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (f(), v(X, { key: 0 }, [
        m("header", At, [
          m("div", Ht, [
            h(o(_), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          l[9] || (l[9] = m("div", { class: "kx-head-text" }, [
            m("h1", { class: "kx-head-title" }, "Knowledge"),
            m("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          m("div", Rt, [
            m("span", zt, P(o(M).length) + " knowledge base" + P(o(M).length !== 1 ? "s" : ""), 1),
            m("div", Nt, [
              h(o(_), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Je(m("input", {
                "onUpdate:modelValue": l[0] || (l[0] = (s) => Ye(k) ? k.value = s : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Ge, o(k)]
              ])
            ]),
            h(o(Q), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: a
            }, {
              icon: U(({ class: s }) => [
                h(o(_), {
                  icon: "tabler:plus",
                  class: F(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(C) ? (f(), v("div", Tt, P(o(C)), 1)) : x("", !0),
        o(E) ? (f(), v("div", It, [
          h(o(_), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          l[10] || (l[10] = m("span", null, [
            m("strong", null, "No knowledge engine installed."),
            G(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : x("", !0),
        m("div", Kt, [
          o(H) && !o(M).length ? (f(), v("div", qt, [
            h(o(_), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            l[11] || (l[11] = G(" Loading… ", -1))
          ])) : o(M).length ? o(R).length ? (f(), v("div", Wt, [
            (f(!0), v(X, null, he(o(R), (s) => (f(), v("div", {
              key: s.id,
              class: "kx-card"
            }, [
              h(ft, {
                state: s,
                onRetry: (L) => y(s)
              }, null, 8, ["state", "onRetry"]),
              m("div", Ut, [
                m("span", Ft, [
                  h(o(_), {
                    icon: s.icon || s.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                m("div", Jt, [
                  m("button", {
                    type: "button",
                    class: "kx-card-name kx-card-open",
                    title: s.name || "(untitled)",
                    "aria-label": `Open ${s.name || "knowledge base"}`,
                    disabled: !!s.deleting_at,
                    onClick: (L) => o(te)(s)
                  }, P(s.name || "(untitled)"), 9, Yt),
                  s.badge ? (f(), v("div", Gt, [
                    h(o($e), {
                      severity: c(s.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: U(() => [
                        h(o(_), {
                          icon: s.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        G(P(s.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : x("", !0)
                ]),
                m("div", Qt, [
                  h(o(Q), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${s.name}`,
                    onClick: (L) => !s.deleting_at && r(s),
                    disabled: !!s.deleting_at
                  }, {
                    icon: U(({ class: L }) => [
                      h(o(_), {
                        icon: "tabler:pencil",
                        class: F(L),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  h(o(Q), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${s.name}`,
                    onClick: (L) => Ee(s),
                    disabled: !!s.deleting_at
                  }, {
                    icon: U(({ class: L }) => [
                      h(o(_), {
                        icon: "tabler:share",
                        class: F(L),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  h(o(Q), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${s.name}`,
                    onClick: (L) => y(s),
                    disabled: !!s.deleting_at
                  }, {
                    icon: U(({ class: L }) => [
                      h(o(_), {
                        icon: "tabler:trash",
                        class: F(L),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              m("div", Xt, P(s.description || "No description"), 1),
              s.stat_items && s.stat_items.length ? (f(), v("div", Zt, [
                (f(!0), v(X, null, he(s.stat_items, (L, qe) => (f(), v("span", {
                  key: qe,
                  class: "kx-stat",
                  title: `${d(L.value)} ${L.label}`,
                  "aria-label": `${d(L.value)} ${L.label}`
                }, [
                  L.icon ? (f(), me(o(_), {
                    key: 0,
                    icon: L.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : x("", !0),
                  G(P(d(L.value)), 1)
                ], 8, en))), 128))
              ])) : x("", !0)
            ]))), 128))
          ])) : (f(), v("div", Vt, [...l[14] || (l[14] = [
            m("div", { class: "kx-empty-title" }, "No matches", -1),
            m("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (f(), v("div", Bt, [
            m("div", jt, [
              h(o(_), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            l[12] || (l[12] = m("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            l[13] || (l[13] = m("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            h(o(Q), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: a
            }, {
              icon: U(({ class: s }) => [
                h(o(_), {
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
      h(Ze, {
        open: n.value,
        api: o(J),
        engines: o(w),
        models: o(z),
        target: t.value,
        "load-error": o(O),
        onRetry: o(Y),
        onClose: l[8] || (l[8] = (s) => n.value = !1),
        onSaved: S
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      j.value ? (f(), v("div", {
        key: 2,
        ref_key: "shareHost",
        ref: pe
      }, null, 512)) : x("", !0)
    ]));
  }
}), Sn = {
  rootComponent: yn,
  plugins: [Ve]
};
export {
  Sn as mountConfig
};
//# sourceMappingURL=lazy-mount-Ccu741KW.js.map
