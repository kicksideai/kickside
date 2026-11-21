import { B as Re, s as ze, f as je, u as Ve, P as We } from "./wc-runtime-CPT3aEO7.js";
import { openBlock as f, createElementBlock as g, mergeProps as re, createElementVNode as m, defineComponent as we, computed as ge, withModifiers as le, Fragment as Z, createTextVNode as Q, toDisplayString as P, createCommentVNode as x, createVNode as h, unref as o, createBlock as me, resolveDynamicComponent as Ue, renderSlot as Ne, renderList as he, ref as $, watch as be, nextTick as xe, onBeforeUnmount as _e, normalizeStyle as Fe, onMounted as Je, withDirectives as Ye, isRef as Ge, vModelText as Qe, withCtx as U, normalizeClass as F, withKeys as Pe } from "vue";
import { s as X, e as ce, l as Xe, u as Ze, _ as et } from "./KbDialog.vue_vue_type_script_setup_true_lang-kdYNKpWo.js";
import { Icon as _ } from "@iconify/vue";
import { on as tt, api as J, loadByTagName as Te, host as nt } from "@wippy-fe/proxy";
import { u as at, a as ot } from "./constants-C13Pvq5r.js";
import { c as st, s as it } from "./componentRealtime-m98w4dre.js";
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
}, ct = Re.extend({
  name: "progressspinner",
  style: rt,
  classes: lt
}), dt = {
  name: "BaseProgressSpinner",
  extends: ze,
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
}, ut = ["fill", "stroke-width"];
function pt(e, d, c, i, v, H) {
  return f(), g("div", re({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(f(), g("svg", re({
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
  }, e.ptm("circle")), null, 16, ut)], 16))], 16);
}
Ke.render = pt;
const ft = { key: 0 }, vt = /* @__PURE__ */ we({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const d = e, c = ge(() => d.state.deletion_job === null || ["dead", "cancelled"].includes(d.state.deletion_job?.status || ""));
    return (i, v) => e.state.deleting_at ? (f(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: v[1] || (v[1] = le(() => {
      }, ["stop"])),
      onKeydown: v[2] || (v[2] = le(() => {
      }, ["stop"]))
    }, [
      c.value ? (f(), g(Z, { key: 0 }, [
        m("span", null, [
          v[3] || (v[3] = Q("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (f(), g("span", ft, ": " + P(e.state.deletion_job.last_error), 1)) : x("", !0)
        ]),
        h(o(X), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: v[0] || (v[0] = le((H) => i.$emit("retry"), ["stop"]))
        })
      ], 64)) : (f(), g(Z, { key: 1 }, [
        h(o(Ke), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        v[4] || (v[4] = m("span", null, "Deleting…", -1))
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
`, mt = {
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
}, yt = Re.extend({
  name: "tag",
  style: gt,
  classes: mt
}), ht = {
  name: "BaseTag",
  extends: ze,
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
function ye(e) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(d) {
    return typeof d;
  } : function(d) {
    return d && typeof Symbol == "function" && d.constructor === Symbol && d !== Symbol.prototype ? "symbol" : typeof d;
  }, ye(e);
}
function bt(e, d, c) {
  return (d = kt(d)) in e ? Object.defineProperty(e, d, { value: c, enumerable: !0, configurable: !0, writable: !0 }) : e[d] = c, e;
}
function kt(e) {
  var d = wt(e, "string");
  return ye(d) == "symbol" ? d : d + "";
}
function wt(e, d) {
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
  extends: ht,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return je(bt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, _t = ["data-p"];
function xt(e, d, c, i, v, H) {
  return f(), g("span", re({
    class: e.cx("root"),
    "data-p": H.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (f(), me(Ue(e.$slots.icon), re({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (f(), g("span", re({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : x("", !0), e.value != null || e.$slots.default ? Ne(e.$slots, "default", {
    key: 2
  }, function() {
    return [m("span", re({
      class: e.cx("label")
    }, e.ptm("label")), P(e.value), 17)];
  }) : x("", !0)], 16, _t);
}
$e.render = xt;
const $t = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, St = {
  key: 0,
  "aria-hidden": "true"
}, Ct = { class: "kx-header-stat" }, Et = { class: "kx-header-stat-label" }, Mt = /* @__PURE__ */ we({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (d, c) => e.items.length ? (f(), g("span", $t, [
      (f(!0), g(Z, null, he(e.items, (i, v) => (f(), g(Z, { key: v }, [
        v ? (f(), g("span", St, " · ")) : x("", !0),
        m("span", Ct, [
          i.icon ? (f(), me(o(_), {
            key: 0,
            icon: i.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : x("", !0),
          m("span", Et, P(i.value.toLocaleString()) + " " + P(i.label), 1)
        ])
      ], 64))), 128))
    ])) : x("", !0);
  }
}), Dt = 2e3;
function Oe(e) {
  const d = e.margin ?? 8, c = e.gap ?? 4, i = Math.max(0, e.viewportWidth), v = Math.max(0, e.viewportHeight), H = Math.max(0, i - d * 2), C = Math.min(Math.max(0, e.requestedWidth), H), M = e.align === "right" ? e.anchor.right - C : e.anchor.left, D = Math.max(d, Math.min(M, i - d - C)), k = Math.max(0, v - e.anchor.bottom - c - d), R = Math.max(0, e.anchor.top - c - d), z = k < e.requestedMaxHeight && R > k ? "above" : "below", w = z === "above" ? R : k, O = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), w)), L = Math.min(Math.max(0, e.panelHeight ?? O), O), b = z === "above" ? e.anchor.top - c - L : e.anchor.bottom + c, A = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(D - A.left),
    width: Math.round(C),
    maxHeight: O,
    side: z,
    top: Math.round(b - A.top)
  };
}
const Lt = /* @__PURE__ */ we({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Dt }
  },
  emits: ["update:open"],
  setup(e, { emit: d }) {
    const c = e, i = d, v = $(null), H = $({ position: "fixed", visibility: "hidden" });
    function C() {
      const b = c.anchor, A = v.value;
      if (!b || !A) return;
      const Y = b.getBoundingClientRect(), N = c.width === "anchor" ? Math.max(c.minWidth, Y.width) : Math.max(c.minWidth, c.width), T = {
        anchor: Y,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: N,
        requestedMaxHeight: c.maxHeight,
        align: c.align,
        gap: c.gap
      }, q = Oe(T);
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
      const I = A.getBoundingClientRect(), V = Oe({
        ...T,
        containingBlockOrigin: { left: I.left, top: I.top },
        panelHeight: I.height
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
    let M = null, D = !1;
    function k() {
      D || !c.open || (D = !0, requestAnimationFrame(() => {
        D = !1, c.open && C();
      }));
    }
    function R() {
      typeof ResizeObserver > "u" || (M = new ResizeObserver(k), v.value && M.observe(v.value), c.anchor && M.observe(c.anchor));
    }
    function z() {
      M?.disconnect(), M = null, D = !1;
    }
    be(() => c.open, async (b) => {
      z(), b && (H.value = { position: "fixed", visibility: "hidden" }, await xe(), C(), R());
    }, { immediate: !0 });
    function w(b) {
      if (!c.open) return;
      const A = b.composedPath();
      v.value && A.includes(v.value) || c.anchor && A.includes(c.anchor) || i("update:open", !1);
    }
    function O(b) {
      !c.open || b.key !== "Escape" || (b.preventDefault(), b.stopImmediatePropagation(), i("update:open", !1));
    }
    function L() {
      c.open && C();
    }
    return document.addEventListener("click", w), document.addEventListener("keydown", O, !0), window.addEventListener("resize", L), window.addEventListener("scroll", L, !0), _e(() => {
      z(), document.removeEventListener("click", w), document.removeEventListener("keydown", O, !0), window.removeEventListener("resize", L), window.removeEventListener("scroll", L, !0);
    }), (b, A) => e.open ? (f(), g("div", {
      key: 0,
      ref_key: "panel",
      ref: v,
      class: "anchored-panel",
      style: Fe(H.value)
    }, [
      Ne(b.$slots, "default")
    ], 4)) : x("", !0);
  }
}), Ce = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Ae = Object.keys(Ce), Se = [
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
    const v = d?.[i];
    v === void 0 ? delete c[i] : c[i] = v;
  }
  return c;
}
const He = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Pt({ detail: e }) {
  const d = $(!1), c = $(""), i = $(""), v = $([]), H = $(""), C = $([]), M = $([]), D = $("");
  let k = !0;
  const R = Xe();
  let z = !1, w = !1, O = 0, L = !1;
  const b = /* @__PURE__ */ new Set(), A = ge(() => {
    const n = H.value.trim().toLowerCase();
    return n ? v.value.filter(
      (t) => (t.name || "").toLowerCase().includes(n) || (t.description || "").toLowerCase().includes(n)
    ) : v.value;
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
        const s = t?.error || "failed to load knowledge bases";
        if (Y(s))
          return n() && k && (i.value = He), !1;
        throw new Error(s);
      }
      return n() && k && (v.value = t.items || []), !0;
    } catch (t) {
      const s = ce(t, "could not load knowledge bases");
      return n() && k && (Y(s) ? i.value = He : c.value = s), !1;
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
      M.value = n?.success ? n.engines || [] : [];
    } catch {
      M.value = [];
    }
  }
  function I(n) {
    return M.value.find((t) => t.kb_type === n);
  }
  async function V() {
    D.value = "";
    try {
      const [n, t] = await Promise.all([
        J.get("/api/v1/knowledge/engines"),
        J.get("/api/v1/knowledge/models")
      ]);
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load knowledge engines.");
      if (!t.data?.success) throw new Error(t.data?.error || "Could not load embedding models.");
      M.value = n.data.engines || [], C.value = t.data.models || [];
    } catch (n) {
      M.value = [], C.value = [], D.value = ce(n, "Could not load knowledge engines.");
    }
  }
  function W(n) {
    return !!n && typeof n == "object" && !Array.isArray(n);
  }
  function te(n) {
    if (W(n)) return n;
    if (!(typeof n != "string" || !n))
      try {
        const t = JSON.parse(n);
        return W(t) ? t : void 0;
      } catch {
        return;
      }
  }
  function de(n, t) {
    if (!t) return;
    let s = n;
    for (const r of t.split(".")) {
      if (!W(s)) return;
      s = s[r];
    }
    return s;
  }
  function se(n, t) {
    if (!Array.isArray(t)) return [];
    const s = [];
    for (const r of t) {
      const S = de(n, r.path), y = typeof S == "number" ? S : Number(S || 0);
      y < (r.min ?? 0) || s.push({ icon: r.icon, value: y, label: String(y === 1 ? r.singular : r.plural) });
    }
    return s;
  }
  function B(n, t) {
    return Object.prototype.hasOwnProperty.call(n, t);
  }
  function ue(n, t) {
    return Ae.some((s) => B(n, s)) ? !0 : Array.isArray(t) ? t.some((s) => {
      const r = s.path || "";
      return r !== "" && B(n, r.split(".")[0]);
    }) : !1;
  }
  function ee(n, t, s) {
    const r = String(t.kb_type || s || ""), S = I(r), y = {
      kb_type: r || s,
      badge: S?.badge
    };
    for (const j of Ae) {
      const oe = t[j];
      B(t, j) && typeof oe == "number" && (y[j] = oe);
    }
    return (ue(t, S?.stats_spec) || B(t, "kb_type")) && (y.stat_items = se({ ...n, ...t }, S?.stats_spec)), y;
  }
  function K(n, t, s = []) {
    const r = {};
    typeof t.title == "string" && (r.name = t.title), typeof t.comment == "string" && (r.description = t.comment), typeof t.icon == "string" && (r.icon = t.icon), typeof t.status == "string" && (r.status = t.status), typeof t.auto_summary == "string" && (r.auto_summary = t.auto_summary), typeof t.auto_description == "string" && (r.auto_description = t.auto_description), typeof t.kb_type == "string" && (r.kb_type = t.kb_type), n.stats_from_store || Object.assign(r, ee(n, t, r.kb_type || n.kb_type));
    const S = { ...n, ...r };
    for (const y of s) {
      const j = y === "title" ? "name" : y;
      n.stats_from_store && Se.some((oe) => oe === j) || delete S[j];
    }
    return S;
  }
  const G = $(null);
  function pe(n, t) {
    const s = te(t.meta) || {}, r = t.deleted || [], S = v.value.find((y) => y.id === n && y.stats_from_store) || (e.value?.id === n ? e.value : void 0);
    S?.stats_from_store && (Se.some((y) => B(s, y) || r.includes(y)) || ue(s, I(S.kb_type || "")?.stats_spec)) && (b.add(n), ne()), v.value = v.value.map((y) => y.id === n ? K(y, s, r) : y), e.value?.id === n && (e.value = K(e.value, s, r));
  }
  async function ne() {
    if (!(L || d.value || !k || !b.size)) {
      L = !0;
      try {
        for (await Promise.resolve(); k && !d.value && b.size; ) {
          const n = [...b].slice(0, 100);
          for (const y of n) b.delete(y);
          const t = O, { data: s } = await J.get(`/api/v1/knowledge/list?ids=${n.map(encodeURIComponent).join(",")}`);
          if (!k) return;
          if (t !== O) {
            for (const y of n) b.add(y);
            continue;
          }
          if (!s?.success) continue;
          const r = new Map(
            (s.items || []).map((y) => [y.id, y])
          ), S = new Set(n);
          v.value = v.value.map((y) => y.stats_from_store && S.has(y.id) ? ke(y, r.get(y.id)) : y), e.value?.stats_from_store && S.has(e.value.id) && (e.value = ke(e.value, r.get(e.value.id)));
        }
      } catch {
      } finally {
        L = !1, b.size && ne();
      }
    }
  }
  function ae() {
    k = !1, w = !1, b.clear(), u?.(), G.value?.(), G.value = null;
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
  const u = tt("@message", (n) => {
    const t = st(n, void 0, Ce);
    if (!t) return;
    const s = v.value.some((r) => r.id === t.component_id);
    (s || e.value?.id === t.component_id) && pe(t.component_id, t), !s && typeof t.meta.kb_type == "string" && t.meta.kb_type && ie();
  });
  return _e(ae), {
    loading: d,
    error: c,
    notice: i,
    kbs: v,
    query: H,
    filtered: A,
    models: C,
    engines: M,
    dialogLoadError: D,
    load: N,
    loadModels: T,
    loadEngines: q,
    engineFor: I,
    loadDialogCatalog: V,
    detailUnsub: G,
    applyComponentMetaEvent: pe,
    clearComponentSubscriptions: ae
  };
}
function Ot({ detail: e, detailUnsub: d, kbs: c, engines: i, engineFor: v, applyComponentMetaEvent: H, route: C, navigate: M, loadEngines: D }) {
  const k = $(!1), R = $(""), z = $(null);
  let w = null, O = 0, L = 0;
  const b = ge(() => e.value ? v(e.value.kb_type || "")?.manage_ui_id : void 0), A = ge(() => (e.value ? v(e.value.kb_type || "")?.manage_views : void 0) || []), Y = ge(() => A.value.length > 1), N = $(""), T = $("");
  let q = !1, I = 0;
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
    const s = n.includes(t) ? t : n[0];
    s !== N.value && (N.value = s);
  }, { immediate: !0 });
  function W() {
    const u = { kb_id: e.value?.id, route: T.value };
    return N.value && (u.view = N.value), JSON.stringify(u);
  }
  function te(u) {
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
  function de(u) {
    u.stopPropagation();
    const n = e.value?.id;
    if (!n || q) return;
    const t = typeof u.detail == "string" ? u.detail : u.detail?.path ?? u.detail?.route ?? "", s = String(t || "").replace(/^\/+/, "");
    T.value = s, ee(s ? `${n}/${s}` : n);
  }
  function se(u) {
    u.stopPropagation();
  }
  function B(u = !0) {
    u && L++, w && (w.removeEventListener("kb-changed", se), w.removeEventListener("navigate", de), w.remove(), w = null);
  }
  async function ue() {
    const u = ++L;
    B(!1);
    const n = b.value, t = z.value, s = e.value?.id;
    if (!n || !t || !s) return;
    try {
      await Te(n, { timeoutMs: 8e3 });
    } catch {
    }
    if (u !== L || e.value?.id !== s || b.value !== n || z.value !== t) return;
    t.replaceChildren();
    const r = document.createElement(n);
    try {
      r.setAttribute("config", W());
    } catch {
    }
    r.addEventListener("kb-changed", se), r.addEventListener("navigate", de), t.appendChild(r), w = r;
  }
  function ee(u) {
    q || M(u);
  }
  function K(u, n) {
    return O === u && e.value?.id === n;
  }
  async function G(u, n = !0) {
    const t = ++O, s = u.id;
    e.value = { ...u }, d.value?.(), d.value = s ? it(s, (r) => H(s, r), Ce) : null, R.value = "", k.value = !0, B(), n && ee(s);
    try {
      const { data: r } = await J.get(`/api/v1/knowledge/${s}`);
      if (!K(t, s)) return;
      if (r?.success) {
        const S = { ...e.value, ...r };
        e.value = r.stats_from_store ? ke(S, r) : S;
      } else R.value = r?.error || "could not load knowledge base";
    } catch (r) {
      if (!K(t, s)) return;
      R.value = ce(r, "could not load knowledge base");
    } finally {
      K(t, s) && (k.value = !1);
    }
    K(t, s) && (i.value.length || await D(), K(t, s) && (await xe(), K(t, s) && await ue()));
  }
  async function pe() {
    const u = e.value?.id;
    if (!u) return;
    const n = ++O;
    R.value = "";
    try {
      const { data: t } = await J.get(`/api/v1/knowledge/${u}`);
      if (!K(n, u)) return;
      if (t?.success) {
        const s = { ...e.value, ...t };
        e.value = t.stats_from_store ? ke(s, t) : s;
      } else R.value = t?.error || "could not load knowledge base";
    } catch (t) {
      if (!K(n, u)) return;
      R.value = ce(t, "could not load knowledge base");
    }
    if (K(n, u) && (await xe(), !!K(n, u)))
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
    M({ path: u, back: { within: u } });
  }
  function ae(u = !0) {
    O++, B(), d.value?.(), d.value = null, e.value = null, T.value = "", u && ee("");
  }
  async function ie(u) {
    const n = ++I, t = String(u || "").split("/").filter(Boolean), s = t[0] || "", r = t.slice(1).join("/");
    q = !0;
    try {
      if (n !== I) return;
      if (!s)
        e.value && ae(!1);
      else if (e.value?.id !== s) {
        T.value = r;
        const S = c.value.find((y) => y.id === s);
        if (await G(S || { id: s }, !1), n !== I) return;
      } else if (r !== T.value) {
        T.value = r;
        try {
          w?.setAttribute("config", W());
        } catch {
        }
      }
    } finally {
      n === I && (q = !1);
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
    setDetailView: te,
    openDetail: G,
    refreshOpenDetail: pe,
    closeDetail: ae,
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
}, jt = {
  key: 1,
  class: "kx-empty"
}, Vt = { class: "kx-empty-ico" }, Wt = {
  key: 2,
  class: "kx-empty"
}, Ut = {
  key: 3,
  class: "kx-grid"
}, Ft = ["aria-label", "onClick", "onKeydown"], Jt = { class: "kx-card-head" }, Yt = { class: "kx-ficon" }, Gt = { class: "kx-card-id" }, Qt = ["title"], Xt = {
  key: 0,
  class: "kx-card-meta"
}, Zt = { class: "kx-card-desc" }, en = {
  key: 0,
  class: "kx-stats"
}, tn = ["title", "aria-label"], nn = { class: "kx-bar" }, an = { class: "kx-bar-l" }, on = ["title"], sn = { class: "kx-summary-pop-h" }, rn = {
  key: 0,
  class: "kx-summary-pop-sum"
}, ln = {
  key: 1,
  class: "kx-summary-pop-desc"
}, cn = { class: "kx-bar-r" }, dn = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, un = ["aria-selected", "onClick"], pn = {
  key: 0,
  class: "kx-err"
}, fn = {
  key: 0,
  class: "kx-loading"
}, vn = {
  key: 0,
  class: "kx-detail-meta"
}, gn = {
  key: 0,
  class: "kx-detail-desc"
}, mn = { class: "kx-stats" }, yn = {
  key: 0,
  class: "kx-stat"
}, hn = /* @__PURE__ */ we({
  __name: "knowledge",
  setup(e) {
    const d = (p) => (p ?? 0).toLocaleString();
    function c(p) {
      if (p === "neutral") return "secondary";
      if (p === "warning") return "warn";
      if (p === "info" || p === "success" || p === "danger") return p;
    }
    const i = $(null), v = Pt({ detail: i }), {
      loading: H,
      error: C,
      notice: M,
      kbs: D,
      query: k,
      filtered: R,
      models: z,
      engines: w,
      dialogLoadError: O,
      load: L,
      loadEngines: b,
      engineFor: A,
      loadDialogCatalog: Y,
      detailUnsub: N,
      applyComponentMetaEvent: T
    } = v, q = at(), I = ot(), V = Ot({
      detail: i,
      detailUnsub: N,
      kbs: D,
      engines: w,
      engineFor: A,
      applyComponentMetaEvent: T,
      route: ge(() => q.value.route),
      navigate: (p) => I("navigate", p),
      loadEngines: b
    }), {
      detailLoading: W,
      detailError: te,
      detailHost: de,
      detailManageTag: se,
      detailViews: B,
      detailHasViews: ue,
      detailView: ee,
      setDetailView: K,
      openDetail: G,
      refreshOpenDetail: pe,
      closeDetail: ne,
      backDetail: ae,
      applyRoute: ie
    } = V;
    function u(p) {
      i.value ? te.value = p : C.value = p;
    }
    const n = $(!1), t = $(null);
    async function s() {
      t.value = null, await Y(), n.value = !0;
    }
    async function r(p) {
      C.value = "", te.value = "", O.value = "", w.value.length || await b();
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
        t.value = null, n.value = !1, u(ce(l, "could not load knowledge base settings"));
      }
    }
    async function S() {
      n.value = !1;
      const p = i.value?.id;
      if (await L(), p && t.value && t.value.id === p)
        try {
          const { data: l } = await J.get(`/api/v1/knowledge/${p}`);
          l?.success && i.value && i.value.id === p && (i.value = { ...i.value, ...l });
        } catch {
        }
      t.value = null;
    }
    async function y(p) {
      if (await nt.confirm({
        header: "Delete knowledge base",
        message: `Delete “${p.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        u(""), C.value = "";
        try {
          const { data: a } = await J.delete(`/api/v1/knowledge/${p.id}`);
          if (!a?.success) throw new Error(a?.error || "delete failed");
          qe(p.id, a), i.value?.id === p.id && ne(), await L();
        } catch (a) {
          u(ce(a, "delete failed"));
        }
      }
    }
    const j = $(!1), oe = $(null), fe = $(null);
    function Ee(p) {
      oe.value = p, j.value = !0;
    }
    function Me() {
      j.value = !1, oe.value = null;
    }
    const ve = $(!1), De = $(null);
    function Le(p) {
      p.key === "Escape" && j.value && Me();
    }
    Je(() => {
      window.addEventListener("keydown", Le);
    }), _e(() => {
      window.removeEventListener("keydown", Le);
    });
    async function Ie() {
      const p = oe.value;
      if (!fe.value || !p) return;
      if (fe.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Te("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const l = document.createElement("kickside-share");
      l.setAttribute("config", JSON.stringify({
        resource_id: p.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(p.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(p.id)}`,
        title: p.name || ""
      })), l.style.display = "block", l.addEventListener("close", Me), fe.value.appendChild(l);
    }
    be([j, fe], async () => {
      j.value && fe.value && await Ie();
    }), Ve(async () => {
      try {
        await Promise.all([L(), b(), pe()]), !i.value && q.value.route && await ie(q.value.route);
      } catch (p) {
        C.value = ce(p, "host API unavailable");
      }
    });
    const { acceptDeletion: qe } = Ze(D, (p) => p.id, (p) => {
      i.value?.id === p && ne();
    }, L);
    return (p, l) => (f(), g("div", At, [
      i.value ? (f(), g(Z, { key: 1 }, [
        m("div", nn, [
          m("div", an, [
            m("button", {
              class: "kx-back",
              onClick: l[2] || (l[2] = (a) => o(ae)())
            }, [
              h(o(_), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              l[16] || (l[16] = Q(" Back", -1))
            ]),
            m("h1", {
              class: "kx-title",
              title: i.value.name || "(untitled)"
            }, P(i.value.name || "(untitled)"), 9, on),
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
                Q(P(i.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : x("", !0),
            h(Mt, {
              items: i.value.stat_items || []
            }, null, 8, ["items"]),
            i.value.auto_summary || i.value.auto_description ? (f(), g("span", {
              key: 1,
              ref_key: "summaryAnchor",
              ref: De,
              class: "kx-summary"
            }, [
              h(o(X), {
                severity: "secondary",
                outlined: "",
                class: F(["kx-summary-btn", { on: ve.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ve.value,
                onClick: l[3] || (l[3] = le((a) => ve.value = !ve.value, ["stop"]))
              }, {
                icon: U(({ class: a }) => [
                  h(o(_), {
                    icon: "tabler:sparkles",
                    class: F(a),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              h(Lt, {
                open: ve.value,
                "onUpdate:open": l[5] || (l[5] = (a) => ve.value = a),
                anchor: De.value,
                width: 340
              }, {
                default: U(() => [
                  m("div", {
                    class: "kx-summary-pop",
                    onClick: l[4] || (l[4] = le(() => {
                    }, ["stop"]))
                  }, [
                    m("div", sn, [
                      h(o(_), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      l[17] || (l[17] = m("span", null, "About this knowledge base", -1))
                    ]),
                    i.value.auto_summary ? (f(), g("p", rn, P(i.value.auto_summary), 1)) : x("", !0),
                    i.value.auto_description ? (f(), g("p", ln, P(i.value.auto_description), 1)) : x("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ], 512)) : x("", !0)
          ]),
          m("div", cn, [
            o(ue) ? (f(), g("div", dn, [
              (f(!0), g(Z, null, he(o(B), (a) => (f(), g("button", {
                key: a.id,
                class: F(["kx-viewseg-btn", { on: o(ee) === a.id }]),
                role: "tab",
                "aria-selected": o(ee) === a.id,
                onClick: (E) => o(K)(a.id)
              }, [
                a.icon ? (f(), me(o(_), {
                  key: 0,
                  icon: a.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : x("", !0),
                Q(" " + P(a.label), 1)
              ], 10, un))), 128))
            ])) : x("", !0),
            h(o(X), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: l[6] || (l[6] = (a) => r(i.value))
            }, {
              icon: U(({ class: a }) => [
                h(o(_), {
                  icon: "tabler:pencil",
                  class: F(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(o(X), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: l[7] || (l[7] = (a) => Ee(i.value))
            }, {
              icon: U(({ class: a }) => [
                h(o(_), {
                  icon: "tabler:share",
                  class: F(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(o(X), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: l[8] || (l[8] = (a) => y(i.value))
            }, {
              icon: U(({ class: a }) => [
                h(o(_), {
                  icon: "tabler:trash",
                  class: F(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(te) ? (f(), g("div", pn, P(o(te)), 1)) : x("", !0),
        m("div", {
          class: F(["kx-body", { "kx-body-bleed": o(se) }])
        }, [
          o(W) ? (f(), g("div", fn, [
            h(o(_), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            l[18] || (l[18] = Q(" Loading… ", -1))
          ])) : (f(), g(Z, { key: 1 }, [
            o(se) ? x("", !0) : (f(), g("div", vn, [
              i.value.description ? (f(), g("div", gn, P(i.value.description), 1)) : x("", !0),
              m("div", mn, [
                i.value.embedding_model ? (f(), g("span", yn, [
                  h(o(_), {
                    icon: "tabler:vector",
                    "aria-hidden": "true"
                  }),
                  Q(P(i.value.embedding_model), 1)
                ])) : x("", !0)
              ])
            ])),
            m("div", {
              ref_key: "detailHost",
              ref: de,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (f(), g(Z, { key: 0 }, [
        m("header", Ht, [
          m("div", Rt, [
            h(o(_), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          l[10] || (l[10] = m("div", { class: "kx-head-text" }, [
            m("h1", { class: "kx-head-title" }, "Knowledge"),
            m("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          m("div", zt, [
            m("span", Nt, P(o(D).length) + " knowledge base" + P(o(D).length !== 1 ? "s" : ""), 1),
            m("div", Tt, [
              h(o(_), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Ye(m("input", {
                "onUpdate:modelValue": l[0] || (l[0] = (a) => Ge(k) ? k.value = a : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Qe, o(k)]
              ])
            ]),
            h(o(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: s
            }, {
              icon: U(({ class: a }) => [
                h(o(_), {
                  icon: "tabler:plus",
                  class: F(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        o(C) ? (f(), g("div", Kt, P(o(C)), 1)) : x("", !0),
        o(M) ? (f(), g("div", It, [
          h(o(_), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          l[11] || (l[11] = m("span", null, [
            m("strong", null, "No knowledge engine installed."),
            Q(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : x("", !0),
        m("div", qt, [
          o(H) && !o(D).length ? (f(), g("div", Bt, [
            h(o(_), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            l[12] || (l[12] = Q(" Loading… ", -1))
          ])) : o(D).length ? o(R).length ? (f(), g("div", Ut, [
            (f(!0), g(Z, null, he(o(R), (a) => (f(), g("div", {
              key: a.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${a.name || "knowledge base"}`,
              onClick: (E) => !a.deleting_at && o(G)(a),
              onKeydown: [
                Pe((E) => !a.deleting_at && o(G)(a), ["enter"]),
                Pe(le((E) => !a.deleting_at && o(G)(a), ["prevent"]), ["space"])
              ]
            }, [
              h(vt, {
                state: a,
                onRetry: (E) => y(a)
              }, null, 8, ["state", "onRetry"]),
              m("div", Jt, [
                m("span", Yt, [
                  h(o(_), {
                    icon: a.icon || a.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                m("div", Gt, [
                  m("div", {
                    class: "kx-card-name",
                    title: a.name || "(untitled)"
                  }, P(a.name || "(untitled)"), 9, Qt),
                  a.badge ? (f(), g("div", Xt, [
                    h(o($e), {
                      severity: c(a.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: U(() => [
                        h(o(_), {
                          icon: a.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        Q(P(a.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : x("", !0)
                ]),
                m("div", {
                  class: "kx-card-actions",
                  onClick: l[1] || (l[1] = le(() => {
                  }, ["stop"]))
                }, [
                  h(o(X), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${a.name}`,
                    onClick: (E) => !a.deleting_at && r(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: U(({ class: E }) => [
                      h(o(_), {
                        icon: "tabler:pencil",
                        class: F(E),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  h(o(X), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${a.name}`,
                    onClick: (E) => Ee(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: U(({ class: E }) => [
                      h(o(_), {
                        icon: "tabler:share",
                        class: F(E),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  h(o(X), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${a.name}`,
                    onClick: (E) => y(a),
                    disabled: !!a.deleting_at
                  }, {
                    icon: U(({ class: E }) => [
                      h(o(_), {
                        icon: "tabler:trash",
                        class: F(E),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              m("div", Zt, P(a.description || "No description"), 1),
              a.stat_items && a.stat_items.length ? (f(), g("div", en, [
                (f(!0), g(Z, null, he(a.stat_items, (E, Be) => (f(), g("span", {
                  key: Be,
                  class: "kx-stat",
                  title: `${d(E.value)} ${E.label}`,
                  "aria-label": `${d(E.value)} ${E.label}`
                }, [
                  E.icon ? (f(), me(o(_), {
                    key: 0,
                    icon: E.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : x("", !0),
                  Q(P(d(E.value)), 1)
                ], 8, tn))), 128))
              ])) : x("", !0)
            ], 40, Ft))), 128))
          ])) : (f(), g("div", Wt, [...l[15] || (l[15] = [
            m("div", { class: "kx-empty-title" }, "No matches", -1),
            m("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (f(), g("div", jt, [
            m("div", Vt, [
              h(o(_), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            l[13] || (l[13] = m("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            l[14] || (l[14] = m("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            h(o(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: s
            }, {
              icon: U(({ class: a }) => [
                h(o(_), {
                  icon: "tabler:plus",
                  class: F(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ]))
        ])
      ], 64)),
      h(et, {
        open: n.value,
        api: o(J),
        engines: o(w),
        models: o(z),
        target: t.value,
        "load-error": o(O),
        onRetry: o(Y),
        onClose: l[9] || (l[9] = (a) => n.value = !1),
        onSaved: S
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      j.value ? (f(), g("div", {
        key: 2,
        ref_key: "shareHost",
        ref: fe
      }, null, 512)) : x("", !0)
    ]));
  }
}), Cn = {
  rootComponent: hn,
  plugins: [We]
};
export {
  Cn as mountConfig
};
//# sourceMappingURL=lazy-mount-DZ7wwJ5Y.js.map
