import { B as Be, s as je, f as Ge, a as Qe, P as Xe } from "./wc-runtime-Bmxpx-Ro.js";
import { openBlock as r, createElementBlock as p, mergeProps as de, createElementVNode as g, defineComponent as Ee, computed as be, withModifiers as ue, Fragment as te, createTextVNode as ee, toDisplayString as H, createCommentVNode as y, createVNode as _, unref as a, createBlock as j, resolveDynamicComponent as Ze, renderSlot as Ve, renderList as $e, ref as x, watch as Se, nextTick as Me, onBeforeUnmount as De, normalizeStyle as et, onMounted as tt, withDirectives as nt, isRef as at, vModelText as ot, withCtx as J, normalizeClass as G, withKeys as ze } from "vue";
import { s as X, e as pe, l as st, u as it, _ as rt } from "./KbDialog.vue_vue_type_script_setup_true_lang-DiRAkw8s.js";
import { Icon as E } from "@iconify/vue";
import { on as lt, api as Q, loadByTagName as We, host as ct } from "@wippy-fe/proxy";
import { u as dt, a as ut } from "./constants-BEKvlp0G.js";
import { c as pt, s as vt } from "./componentRealtime-m98w4dre.js";
var ft = `
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
`, gt = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, yt = Be.extend({
  name: "progressspinner",
  style: ft,
  classes: gt
}), mt = {
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
  style: yt,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Ue = {
  name: "ProgressSpinner",
  extends: mt,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, ht = ["fill", "stroke-width"];
function bt(e, d, s, w, m, l) {
  return r(), p("div", de({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(r(), p("svg", de({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: l.svgStyle
  }, e.ptm("spin")), [g("circle", de({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, ht)], 16))], 16);
}
Ue.render = bt;
const kt = { key: 0 }, wt = /* @__PURE__ */ Ee({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const d = e, s = be(() => d.state.deletion_job === null || ["dead", "cancelled"].includes(d.state.deletion_job?.status || ""));
    return (w, m) => e.state.deleting_at ? (r(), p("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: m[1] || (m[1] = ue(() => {
      }, ["stop"])),
      onKeydown: m[2] || (m[2] = ue(() => {
      }, ["stop"]))
    }, [
      s.value ? (r(), p(te, { key: 0 }, [
        g("span", null, [
          m[3] || (m[3] = ee("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (r(), p("span", kt, ": " + H(e.state.deletion_job.last_error), 1)) : y("", !0)
        ]),
        _(a(X), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: m[0] || (m[0] = ue((l) => w.$emit("retry"), ["stop"]))
        })
      ], 64)) : (r(), p(te, { key: 1 }, [
        _(a(Ue), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        m[4] || (m[4] = g("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : y("", !0);
  }
});
var _t = `
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
`, xt = {
  root: function(d) {
    var s = d.props;
    return ["p-tag p-component", {
      "p-tag-info": s.severity === "info",
      "p-tag-success": s.severity === "success",
      "p-tag-warn": s.severity === "warn",
      "p-tag-danger": s.severity === "danger",
      "p-tag-secondary": s.severity === "secondary",
      "p-tag-contrast": s.severity === "contrast",
      "p-tag-rounded": s.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, $t = Be.extend({
  name: "tag",
  style: _t,
  classes: xt
}), St = {
  name: "BaseTag",
  extends: je,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: $t,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function _e(e) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(d) {
    return typeof d;
  } : function(d) {
    return d && typeof Symbol == "function" && d.constructor === Symbol && d !== Symbol.prototype ? "symbol" : typeof d;
  }, _e(e);
}
function Ct(e, d, s) {
  return (d = Et(d)) in e ? Object.defineProperty(e, d, { value: s, enumerable: !0, configurable: !0, writable: !0 }) : e[d] = s, e;
}
function Et(e) {
  var d = Dt(e, "string");
  return _e(d) == "symbol" ? d : d + "";
}
function Dt(e, d) {
  if (_e(e) != "object" || !e) return e;
  var s = e[Symbol.toPrimitive];
  if (s !== void 0) {
    var w = s.call(e, d);
    if (_e(w) != "object") return w;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (d === "string" ? String : Number)(e);
}
var Pe = {
  name: "Tag",
  extends: St,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ge(Ct({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Lt = ["data-p"];
function Mt(e, d, s, w, m, l) {
  return r(), p("span", de({
    class: e.cx("root"),
    "data-p": l.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (r(), j(Ze(e.$slots.icon), de({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (r(), p("span", de({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : y("", !0), e.value != null || e.$slots.default ? Ve(e.$slots, "default", {
    key: 2
  }, function() {
    return [g("span", de({
      class: e.cx("label")
    }, e.ptm("label")), H(e.value), 17)];
  }) : y("", !0)], 16, Lt);
}
Pe.render = Mt;
const Pt = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, Rt = {
  key: 0,
  "aria-hidden": "true"
}, Ot = { class: "kx-header-stat" }, At = { class: "kx-header-stat-label" }, Ht = /* @__PURE__ */ Ee({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (d, s) => e.items.length ? (r(), p("span", Pt, [
      (r(!0), p(te, null, $e(e.items, (w, m) => (r(), p(te, { key: m }, [
        m ? (r(), p("span", Rt, " · ")) : y("", !0),
        g("span", Ot, [
          w.icon ? (r(), j(a(E), {
            key: 0,
            icon: w.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : y("", !0),
          g("span", At, H(w.value.toLocaleString()) + " " + H(w.label), 1)
        ])
      ], 64))), 128))
    ])) : y("", !0);
  }
}), Nt = 2e3;
function Ie(e) {
  const d = e.margin ?? 8, s = e.gap ?? 4, w = Math.max(0, e.viewportWidth), m = Math.max(0, e.viewportHeight), l = Math.max(0, w - d * 2), D = Math.min(Math.max(0, e.requestedWidth), l), B = e.align === "right" ? e.anchor.right - D : e.anchor.left, M = Math.max(d, Math.min(B, w - d - D)), R = Math.max(0, m - e.anchor.bottom - s - d), N = Math.max(0, e.anchor.top - s - d), $ = R < e.requestedMaxHeight && N > R ? "above" : "below", S = $ === "above" ? N : R, O = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), S)), A = Math.min(Math.max(0, e.panelHeight ?? O), O), C = $ === "above" ? e.anchor.top - s - A : e.anchor.bottom + s, L = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(M - L.left),
    width: Math.round(D),
    maxHeight: O,
    side: $,
    top: Math.round(C - L.top)
  };
}
const Tt = /* @__PURE__ */ Ee({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Nt }
  },
  emits: ["update:open"],
  setup(e, { emit: d }) {
    const s = e, w = d, m = x(null), l = x({ position: "fixed", visibility: "hidden" });
    function D() {
      const C = s.anchor, L = m.value;
      if (!C || !L) return;
      const K = C.getBoundingClientRect(), T = s.width === "anchor" ? Math.max(s.minWidth, K.width) : Math.max(s.minWidth, s.width), I = {
        anchor: K,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: T,
        requestedMaxHeight: s.maxHeight,
        align: s.align,
        gap: s.gap
      }, W = Ie(I);
      Object.assign(L.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${W.width}px`,
        maxHeight: `${W.maxHeight}px`,
        visibility: "hidden"
      });
      const V = L.getBoundingClientRect(), U = Ie({
        ...I,
        containingBlockOrigin: { left: V.left, top: V.top },
        panelHeight: V.height
      }), Y = {
        position: "fixed",
        left: `${U.left}px`,
        top: `${U.top}px`,
        width: `${U.width}px`,
        maxHeight: `${U.maxHeight}px`,
        "--anchored-panel-available-height": `${U.maxHeight}px`,
        margin: "0",
        zIndex: String(s.zIndex),
        visibility: "visible"
      };
      l.value = Y;
    }
    let B = null, M = !1;
    function R() {
      M || !s.open || (M = !0, requestAnimationFrame(() => {
        M = !1, s.open && D();
      }));
    }
    function N() {
      typeof ResizeObserver > "u" || (B = new ResizeObserver(R), m.value && B.observe(m.value), s.anchor && B.observe(s.anchor));
    }
    function $() {
      B?.disconnect(), B = null, M = !1;
    }
    Se(() => s.open, async (C) => {
      $(), C && (l.value = { position: "fixed", visibility: "hidden" }, await Me(), D(), N());
    }, { immediate: !0 });
    function S(C) {
      if (!s.open) return;
      const L = C.composedPath();
      m.value && L.includes(m.value) || s.anchor && L.includes(s.anchor) || w("update:open", !1);
    }
    function O(C) {
      !s.open || C.key !== "Escape" || (C.preventDefault(), C.stopImmediatePropagation(), w("update:open", !1));
    }
    function A() {
      s.open && D();
    }
    return document.addEventListener("click", S), document.addEventListener("keydown", O, !0), window.addEventListener("resize", A), window.addEventListener("scroll", A, !0), De(() => {
      $(), document.removeEventListener("click", S), document.removeEventListener("keydown", O, !0), window.removeEventListener("resize", A), window.removeEventListener("scroll", A, !0);
    }), (C, L) => e.open ? (r(), p("div", {
      key: 0,
      ref_key: "panel",
      ref: m,
      class: "anchored-panel",
      style: et(l.value)
    }, [
      Ve(C.$slots, "default")
    ], 4)) : y("", !0);
  }
}), Oe = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Ke = Object.keys(Oe), Re = [
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
function Ce(e, d) {
  const s = { ...e, stat_items: d?.stat_items };
  for (const w of Re) {
    const m = d?.[w];
    m === void 0 ? delete s[w] : s[w] = m;
  }
  return s;
}
const qe = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function zt({ detail: e }) {
  const d = x(!1), s = x(""), w = x(""), m = x(!1), l = x(""), D = x([]), B = x(""), M = x([]), R = x([]), N = x("");
  let $ = !0;
  const S = st();
  let O = !1, A = !1, C = 0, L = !1;
  const K = /* @__PURE__ */ new Set(), T = be(() => {
    const n = B.value.trim().toLowerCase();
    return n ? D.value.filter(
      (t) => (t.name || "").toLowerCase().includes(n) || (t.description || "").toLowerCase().includes(n)
    ) : D.value;
  });
  function I(n) {
    const t = n.toLowerCase();
    return t.includes("no implementation") || t.includes("no engine") || t.includes("contract unavailable") || t.includes("not found") && t.includes("binding");
  }
  async function W() {
    if (!$) return !1;
    const n = S();
    C++, d.value = !0, s.value = "", w.value = "", l.value = "";
    try {
      const { data: t } = await Q.get("/api/v1/knowledge/list");
      if (!t?.success) {
        const v = t?.error || "failed to load knowledge bases";
        if (I(v))
          return n() && $ && (l.value = qe), !1;
        throw new Error(v);
      }
      return n() && $ && (D.value = t.items || [], m.value = !0), !0;
    } catch (t) {
      const v = pe(t, "could not load knowledge bases");
      return n() && $ && (I(v) ? l.value = qe : w.value = v), !1;
    } finally {
      n() && (d.value = !1, $ && A && !O && b(), K.size && Z());
    }
  }
  async function V() {
    try {
      const { data: n } = await Q.get("/api/v1/knowledge/models");
      M.value = n?.success ? n.models || [] : [];
    } catch {
      M.value = [];
    }
  }
  async function U() {
    try {
      const { data: n } = await Q.get("/api/v1/knowledge/engines");
      R.value = n?.success ? n.engines || [] : [];
    } catch {
      R.value = [];
    }
  }
  function Y(n) {
    return R.value.find((t) => t.kb_type === n);
  }
  async function ce() {
    N.value = "";
    try {
      const [n, t] = await Promise.all([
        Q.get("/api/v1/knowledge/engines"),
        Q.get("/api/v1/knowledge/models")
      ]);
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load knowledge engines.");
      if (!t.data?.success) throw new Error(t.data?.error || "Could not load embedding models.");
      R.value = n.data.engines || [], M.value = t.data.models || [];
    } catch (n) {
      R.value = [], M.value = [], N.value = pe(n, "Could not load knowledge engines.");
    }
  }
  function ae(n) {
    return !!n && typeof n == "object" && !Array.isArray(n);
  }
  function ve(n) {
    if (ae(n)) return n;
    if (!(typeof n != "string" || !n))
      try {
        const t = JSON.parse(n);
        return ae(t) ? t : void 0;
      } catch {
        return;
      }
  }
  function ne(n, t) {
    if (!t) return;
    let v = n;
    for (const f of t.split(".")) {
      if (!ae(v)) return;
      v = v[f];
    }
    return v;
  }
  function oe(n, t) {
    if (!Array.isArray(t)) return [];
    const v = [];
    for (const f of t) {
      const z = ne(n, f.path), h = typeof z == "number" ? z : Number(z || 0);
      h < (f.min ?? 0) || v.push({ icon: f.icon, value: h, label: String(h === 1 ? f.singular : f.plural) });
    }
    return v;
  }
  function F(n, t) {
    return Object.prototype.hasOwnProperty.call(n, t);
  }
  function q(n, t) {
    return Ke.some((v) => F(n, v)) ? !0 : Array.isArray(t) ? t.some((v) => {
      const f = v.path || "";
      return f !== "" && F(n, f.split(".")[0]);
    }) : !1;
  }
  function fe(n, t, v) {
    const f = String(t.kb_type || v || ""), z = Y(f), h = {
      kb_type: f || v,
      badge: z?.badge
    };
    for (const re of Ke) {
      const le = t[re];
      F(t, re) && typeof le == "number" && (h[re] = le);
    }
    return (q(t, z?.stats_spec) || F(t, "kb_type")) && (h.stat_items = oe({ ...n, ...t }, z?.stats_spec)), h;
  }
  function ge(n, t, v = []) {
    const f = {};
    typeof t.title == "string" && (f.name = t.title), typeof t.comment == "string" && (f.description = t.comment), typeof t.icon == "string" && (f.icon = t.icon), typeof t.status == "string" && (f.status = t.status), typeof t.auto_summary == "string" && (f.auto_summary = t.auto_summary), typeof t.auto_description == "string" && (f.auto_description = t.auto_description), typeof t.kb_type == "string" && (f.kb_type = t.kb_type), n.stats_from_store || Object.assign(f, fe(n, t, f.kb_type || n.kb_type));
    const z = { ...n, ...f };
    for (const h of v) {
      const re = h === "title" ? "name" : h;
      n.stats_from_store && Re.some((le) => le === re) || delete z[re];
    }
    return z;
  }
  const se = x(null);
  function ie(n, t) {
    const v = ve(t.meta) || {}, f = t.deleted || [], z = D.value.find((h) => h.id === n && h.stats_from_store) || (e.value?.id === n ? e.value : void 0);
    z?.stats_from_store && (Re.some((h) => F(v, h) || f.includes(h)) || q(v, Y(z.kb_type || "")?.stats_spec)) && (K.add(n), Z()), D.value = D.value.map((h) => h.id === n ? ge(h, v, f) : h), e.value?.id === n && (e.value = ge(e.value, v, f));
  }
  async function Z() {
    if (!(L || d.value || !$ || !K.size)) {
      L = !0;
      try {
        for (await Promise.resolve(); $ && !d.value && K.size; ) {
          const n = [...K].slice(0, 100);
          for (const h of n) K.delete(h);
          const t = C, { data: v } = await Q.get(`/api/v1/knowledge/list?ids=${n.map(encodeURIComponent).join(",")}`);
          if (!$) return;
          if (t !== C) {
            for (const h of n) K.add(h);
            continue;
          }
          if (!v?.success) continue;
          const f = new Map(
            (v.items || []).map((h) => [h.id, h])
          ), z = new Set(n);
          D.value = D.value.map((h) => h.stats_from_store && z.has(h.id) ? Ce(h, f.get(h.id)) : h), e.value?.stats_from_store && z.has(e.value.id) && (e.value = Ce(e.value, f.get(e.value.id)));
        }
      } catch {
      } finally {
        L = !1, K.size && Z();
      }
    }
  }
  function u() {
    $ = !1, A = !1, K.clear(), k?.(), se.value?.(), se.value = null;
  }
  async function b() {
    if ($) {
      if (O || d.value) {
        A = !0;
        return;
      }
      O = !0;
      try {
        do
          A = !1, await W();
        while ($ && A);
      } finally {
        O = !1;
      }
    }
  }
  const k = lt("@message", (n) => {
    const t = pt(n, void 0, Oe);
    if (!t) return;
    const v = D.value.some((f) => f.id === t.component_id);
    (v || e.value?.id === t.component_id) && ie(t.component_id, t), !v && typeof t.meta.kb_type == "string" && t.meta.kb_type && b();
  });
  return De(u), {
    loading: d,
    error: s,
    catalogError: w,
    catalogLoaded: m,
    notice: l,
    kbs: D,
    query: B,
    filtered: T,
    models: M,
    engines: R,
    dialogLoadError: N,
    load: W,
    loadModels: V,
    loadEngines: U,
    engineFor: Y,
    loadDialogCatalog: ce,
    detailUnsub: se,
    applyComponentMetaEvent: ie,
    clearComponentSubscriptions: u
  };
}
function It({ detail: e, detailUnsub: d, kbs: s, engines: w, engineFor: m, applyComponentMetaEvent: l, route: D, navigate: B, loadEngines: M }) {
  const R = x(!1), N = x(""), $ = x(null);
  let S = null, O = 0, A = 0;
  const C = be(() => e.value ? m(e.value.kb_type || "")?.manage_ui_id : void 0), L = be(() => (e.value ? m(e.value.kb_type || "")?.manage_views : void 0) || []), K = be(() => L.value.length > 1), T = x(""), I = x("");
  let W = !1, V = 0;
  function U() {
    const u = e.value?.kb_type;
    return u ? `kx:kb:detail-view:${u}` : null;
  }
  Se(L, (u) => {
    if (!u.length) {
      T.value = "";
      return;
    }
    const b = u.map((t) => t.id);
    let k = "";
    try {
      const t = U();
      k = t && localStorage.getItem(t) || "";
    } catch {
    }
    const n = b.includes(k) ? k : b[0];
    n !== T.value && (T.value = n);
  }, { immediate: !0 });
  function Y() {
    const u = { kb_id: e.value?.id, route: I.value };
    return T.value && (u.view = T.value), JSON.stringify(u);
  }
  function ce(u) {
    if (u !== T.value) {
      T.value = u;
      try {
        const b = U();
        b && localStorage.setItem(b, u);
      } catch {
      }
      try {
        S?.setAttribute("config", Y());
      } catch {
      }
    }
  }
  function ae(u) {
    u.stopPropagation();
    const b = e.value?.id;
    if (!b || W) return;
    const k = typeof u.detail == "string" ? u.detail : u.detail?.path ?? u.detail?.route ?? "", n = String(k || "").replace(/^\/+/, "");
    I.value = n, F(n ? `${b}/${n}` : b);
  }
  function ve(u) {
    u.stopPropagation();
  }
  function ne(u = !0) {
    u && A++, S && (S.removeEventListener("kb-changed", ve), S.removeEventListener("navigate", ae), S.remove(), S = null);
  }
  async function oe() {
    const u = ++A;
    ne(!1);
    const b = C.value, k = $.value, n = e.value?.id;
    if (!b || !k || !n) return;
    try {
      await We(b, { timeoutMs: 8e3 });
    } catch {
    }
    if (u !== A || e.value?.id !== n || C.value !== b || $.value !== k) return;
    k.replaceChildren();
    const t = document.createElement(b);
    try {
      t.setAttribute("config", Y());
    } catch {
    }
    t.addEventListener("kb-changed", ve), t.addEventListener("navigate", ae), k.appendChild(t), S = t;
  }
  function F(u) {
    W || B(u);
  }
  function q(u, b) {
    return O === u && e.value?.id === b;
  }
  async function fe(u, b = !0) {
    const k = ++O, n = u.id;
    e.value = { ...u }, d.value?.(), d.value = n ? vt(n, (t) => l(n, t), Oe) : null, N.value = "", R.value = !0, ne(), b && F(n);
    try {
      const { data: t } = await Q.get(`/api/v1/knowledge/${n}`);
      if (!q(k, n)) return;
      if (t?.success) {
        const v = { ...e.value, ...t };
        e.value = t.stats_from_store ? Ce(v, t) : v;
      } else N.value = t?.error || "could not load knowledge base";
    } catch (t) {
      if (!q(k, n)) return;
      N.value = pe(t, "could not load knowledge base");
    } finally {
      q(k, n) && (R.value = !1);
    }
    q(k, n) && (w.value.length || await M(), q(k, n) && (await Me(), q(k, n) && await oe()));
  }
  async function ge() {
    const u = e.value?.id;
    if (!u) return;
    const b = ++O;
    N.value = "";
    try {
      const { data: k } = await Q.get(`/api/v1/knowledge/${u}`);
      if (!q(b, u)) return;
      if (k?.success) {
        const n = { ...e.value, ...k };
        e.value = k.stats_from_store ? Ce(n, k) : n;
      } else N.value = k?.error || "could not load knowledge base";
    } catch (k) {
      if (!q(b, u)) return;
      N.value = pe(k, "could not load knowledge base");
    }
    if (q(b, u) && (await Me(), !!q(b, u)))
      try {
        S?.setAttribute("config", Y());
      } catch {
      }
  }
  function se() {
    const u = e.value?.id;
    if (!u || !I.value) {
      ie();
      return;
    }
    B({ path: u, back: { within: u } });
  }
  function ie(u = !0) {
    O++, ne(), d.value?.(), d.value = null, e.value = null, I.value = "", u && F("");
  }
  async function Z(u) {
    const b = ++V, k = String(u || "").split("/").filter(Boolean), n = k[0] || "", t = k.slice(1).join("/");
    W = !0;
    try {
      if (b !== V) return;
      if (!n)
        e.value && ie(!1);
      else if (e.value?.id !== n) {
        I.value = t;
        const v = s.value.find((f) => f.id === n);
        if (await fe(v || { id: n }, !1), b !== V) return;
      } else if (t !== I.value) {
        I.value = t;
        try {
          S?.setAttribute("config", Y());
        } catch {
        }
      }
    } finally {
      b === V && (W = !1);
    }
  }
  return Se(D, (u) => {
    Z(u);
  }), De(() => {
    ne(), d.value?.(), d.value = null;
  }), {
    detailLoading: R,
    detailError: N,
    detailHost: $,
    detailManageTag: C,
    detailViews: L,
    detailHasViews: K,
    detailView: T,
    innerRoute: I,
    setDetailView: ce,
    openDetail: fe,
    refreshOpenDetail: ge,
    closeDetail: ie,
    backDetail: se,
    applyRoute: Z,
    pushRoute: F,
    unmountDetailWc: ne
  };
}
const Kt = { class: "kx" }, qt = { class: "kx-head" }, Bt = { class: "kx-head-icon" }, jt = { class: "kx-head-actions" }, Vt = {
  key: 0,
  class: "kx-count"
}, Wt = { class: "kx-search" }, Ut = {
  key: 0,
  class: "kx-err"
}, Yt = {
  key: 1,
  class: "kx-err",
  role: "alert"
}, Ft = {
  key: 2,
  class: "kx-notice"
}, Jt = { class: "kx-body" }, Gt = {
  key: 0,
  class: "kx-loading"
}, Qt = {
  key: 2,
  class: "kx-empty"
}, Xt = { class: "kx-empty-ico" }, Zt = {
  key: 3,
  class: "kx-empty"
}, en = {
  key: 4,
  class: "kx-grid"
}, tn = ["aria-label", "onClick", "onKeydown"], nn = {
  key: 1,
  class: "kx-sub",
  role: "status"
}, an = { class: "kx-card-head" }, on = { class: "kx-ficon" }, sn = { class: "kx-card-id" }, rn = ["title"], ln = {
  key: 0,
  class: "kx-sub"
}, cn = {
  key: 1,
  class: "kx-card-meta"
}, dn = { class: "kx-card-desc" }, un = {
  key: 2,
  class: "kx-stats"
}, pn = ["title", "aria-label"], vn = { class: "kx-bar" }, fn = { class: "kx-bar-l" }, gn = ["title"], yn = {
  key: 0,
  class: "kx-sub"
}, mn = { class: "kx-summary-pop-h" }, hn = {
  key: 0,
  class: "kx-summary-pop-sum"
}, bn = {
  key: 1,
  class: "kx-summary-pop-desc"
}, kn = { class: "kx-bar-r" }, wn = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, _n = ["aria-selected", "onClick"], xn = {
  key: 0,
  class: "kx-err"
}, $n = {
  key: 0,
  class: "kx-loading"
}, Sn = {
  key: 0,
  class: "kx-detail-meta"
}, Cn = {
  key: 0,
  class: "kx-detail-desc"
}, En = { class: "kx-stats" }, Dn = {
  key: 0,
  class: "kx-stat"
}, ke = 2, we = 4, xe = 8, Ln = /* @__PURE__ */ Ee({
  __name: "knowledge",
  setup(e) {
    const d = (c) => (c ?? 0).toLocaleString();
    function s(c, i) {
      return ((c.access_level ?? 0) & i) !== 0;
    }
    function w(c) {
      return typeof c.access_level == "number" && !s(c, ke | we | xe);
    }
    function m(c) {
      if (c === "neutral") return "secondary";
      if (c === "warning") return "warn";
      if (c === "info" || c === "success" || c === "danger") return c;
    }
    const l = x(null), D = zt({ detail: l }), {
      loading: B,
      error: M,
      catalogError: R,
      catalogLoaded: N,
      notice: $,
      kbs: S,
      query: O,
      filtered: A,
      models: C,
      engines: L,
      dialogLoadError: K,
      load: T,
      loadEngines: I,
      engineFor: W,
      loadDialogCatalog: V,
      detailUnsub: U,
      applyComponentMetaEvent: Y
    } = D, ce = dt(), ae = ut(), ve = It({
      detail: l,
      detailUnsub: U,
      kbs: S,
      engines: L,
      engineFor: W,
      applyComponentMetaEvent: Y,
      route: be(() => ce.value.route),
      navigate: (c) => ae("navigate", c),
      loadEngines: I
    }), {
      detailLoading: ne,
      detailError: oe,
      detailHost: F,
      detailManageTag: q,
      detailViews: fe,
      detailHasViews: ge,
      detailView: se,
      setDetailView: ie,
      openDetail: Z,
      refreshOpenDetail: u,
      closeDetail: b,
      backDetail: k,
      applyRoute: n
    } = ve;
    function t(c) {
      l.value ? oe.value = c : M.value = c;
    }
    const v = x(!1), f = x(null);
    async function z() {
      f.value = null, await V(), v.value = !0;
    }
    async function h(c) {
      if (s(c, ke)) {
        M.value = "", oe.value = "", K.value = "", L.value.length || await I();
        try {
          const { data: i } = await Q.get(`/api/v1/knowledge/${c.id}`);
          if (!i?.success) throw new Error(i?.error || "could not load knowledge base settings");
          if (!s(i, ke)) {
            await T(), l.value?.id === c.id && (l.value = { ...l.value, access_level: i.access_level }), t("You no longer have permission to edit this knowledge base.");
            return;
          }
          f.value = {
            id: c.id,
            name: i.name ?? c.name,
            description: i.description ?? c.description,
            icon: i.icon ?? c.icon,
            kb_type: i.kb_type ?? c.kb_type,
            embedding_model: i.embedding_model,
            config: i.config && typeof i.config == "object" ? i.config : {}
          }, v.value = !0;
        } catch (i) {
          f.value = null, v.value = !1, t(pe(i, "could not load knowledge base settings"));
        }
      }
    }
    async function re() {
      v.value = !1;
      const c = l.value?.id;
      if (await T(), c && f.value && f.value.id === c)
        try {
          const { data: i } = await Q.get(`/api/v1/knowledge/${c}`);
          i?.success && l.value && l.value.id === c && (l.value = { ...l.value, ...i });
        } catch {
        }
      f.value = null;
    }
    async function le(c) {
      if (!(!s(c, we) || !await ct.confirm({
        header: "Delete knowledge base",
        message: `Delete “${c.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))) {
        t(""), M.value = "";
        try {
          const { data: o } = await Q.delete(`/api/v1/knowledge/${c.id}`);
          if (!o?.success) throw new Error(o?.error || "delete failed");
          Fe(c.id, o), l.value?.id === c.id && b(), await T();
        } catch (o) {
          t(pe(o, "delete failed"));
        }
      }
    }
    const ye = x(!1), Le = x(null), me = x(null);
    function Ae(c) {
      s(c, xe) && (Le.value = c, ye.value = !0);
    }
    function He() {
      ye.value = !1, Le.value = null;
    }
    const he = x(!1), Ne = x(null);
    function Te(c) {
      c.key === "Escape" && ye.value && He();
    }
    tt(() => {
      window.addEventListener("keydown", Te);
    }), De(() => {
      window.removeEventListener("keydown", Te);
    });
    async function Ye() {
      const c = Le.value;
      if (!me.value || !c) return;
      if (me.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await We("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const i = document.createElement("kickside-share");
      i.setAttribute("config", JSON.stringify({
        resource_id: c.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(c.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(c.id)}`,
        title: c.name || ""
      })), i.style.display = "block", i.addEventListener("close", He), me.value.appendChild(i);
    }
    Se([ye, me], async () => {
      ye.value && me.value && await Ye();
    }), Qe(async () => {
      try {
        await Promise.all([T(), I(), u()]), !l.value && ce.value.route && await n(ce.value.route);
      } catch (c) {
        M.value = pe(c, "host API unavailable");
      }
    });
    const { acceptDeletion: Fe } = it(S, (c) => c.id, (c) => {
      l.value?.id === c && b();
    }, T);
    return (c, i) => (r(), p("div", Kt, [
      l.value ? (r(), p(te, { key: 1 }, [
        g("div", vn, [
          g("div", fn, [
            g("button", {
              class: "kx-back",
              onClick: i[2] || (i[2] = (o) => a(k)())
            }, [
              _(a(E), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              i[16] || (i[16] = ee(" Back", -1))
            ]),
            g("h1", {
              class: "kx-title",
              title: l.value.name || "(untitled)"
            }, H(l.value.name || "(untitled)"), 9, gn),
            w(l.value) ? (r(), p("span", yn, "Read only")) : y("", !0),
            l.value.badge ? (r(), j(a(Pe), {
              key: 1,
              severity: m(l.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: J(() => [
                _(a(E), {
                  icon: l.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                ee(H(l.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : y("", !0),
            _(Ht, {
              items: l.value.stat_items || []
            }, null, 8, ["items"]),
            l.value.auto_summary || l.value.auto_description ? (r(), p("span", {
              key: 2,
              ref_key: "summaryAnchor",
              ref: Ne,
              class: "kx-summary"
            }, [
              _(a(X), {
                severity: "secondary",
                outlined: "",
                class: G(["kx-summary-btn", { on: he.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": he.value,
                onClick: i[3] || (i[3] = ue((o) => he.value = !he.value, ["stop"]))
              }, {
                icon: J(({ class: o }) => [
                  _(a(E), {
                    icon: "tabler:sparkles",
                    class: G(o),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              _(Tt, {
                open: he.value,
                "onUpdate:open": i[5] || (i[5] = (o) => he.value = o),
                anchor: Ne.value,
                width: 340
              }, {
                default: J(() => [
                  g("div", {
                    class: "kx-summary-pop",
                    onClick: i[4] || (i[4] = ue(() => {
                    }, ["stop"]))
                  }, [
                    g("div", mn, [
                      _(a(E), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      i[17] || (i[17] = g("span", null, "About this knowledge base", -1))
                    ]),
                    l.value.auto_summary ? (r(), p("p", hn, H(l.value.auto_summary), 1)) : y("", !0),
                    l.value.auto_description ? (r(), p("p", bn, H(l.value.auto_description), 1)) : y("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ], 512)) : y("", !0)
          ]),
          g("div", kn, [
            a(ge) ? (r(), p("div", wn, [
              (r(!0), p(te, null, $e(a(fe), (o) => (r(), p("button", {
                key: o.id,
                class: G(["kx-viewseg-btn", { on: a(se) === o.id }]),
                role: "tab",
                "aria-selected": a(se) === o.id,
                onClick: (P) => a(ie)(o.id)
              }, [
                o.icon ? (r(), j(a(E), {
                  key: 0,
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : y("", !0),
                ee(" " + H(o.label), 1)
              ], 10, _n))), 128))
            ])) : y("", !0),
            s(l.value, ke) ? (r(), j(a(X), {
              key: 1,
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: i[6] || (i[6] = (o) => h(l.value))
            }, {
              icon: J(({ class: o }) => [
                _(a(E), {
                  icon: "tabler:pencil",
                  class: G(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : y("", !0),
            s(l.value, xe) ? (r(), j(a(X), {
              key: 2,
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: i[7] || (i[7] = (o) => Ae(l.value))
            }, {
              icon: J(({ class: o }) => [
                _(a(E), {
                  icon: "tabler:share",
                  class: G(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : y("", !0),
            s(l.value, we) ? (r(), j(a(X), {
              key: 3,
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: i[8] || (i[8] = (o) => le(l.value))
            }, {
              icon: J(({ class: o }) => [
                _(a(E), {
                  icon: "tabler:trash",
                  class: G(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : y("", !0)
          ])
        ]),
        a(oe) ? (r(), p("div", xn, H(a(oe)), 1)) : y("", !0),
        g("div", {
          class: G(["kx-body", { "kx-body-bleed": a(q) }])
        }, [
          a(ne) ? (r(), p("div", $n, [
            _(a(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[18] || (i[18] = ee(" Loading… ", -1))
          ])) : (r(), p(te, { key: 1 }, [
            a(q) ? y("", !0) : (r(), p("div", Sn, [
              l.value.description ? (r(), p("div", Cn, H(l.value.description), 1)) : y("", !0),
              g("div", En, [
                l.value.embedding_model ? (r(), p("span", Dn, [
                  _(a(E), {
                    icon: "tabler:vector",
                    "aria-hidden": "true"
                  }),
                  ee(H(l.value.embedding_model), 1)
                ])) : y("", !0)
              ])
            ])),
            g("div", {
              ref_key: "detailHost",
              ref: F,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (r(), p(te, { key: 0 }, [
        g("header", qt, [
          g("div", Bt, [
            _(a(E), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          i[10] || (i[10] = g("div", { class: "kx-head-text" }, [
            g("h1", { class: "kx-head-title" }, "Knowledge"),
            g("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          g("div", jt, [
            a(N) ? (r(), p("span", Vt, H(a(S).length) + " knowledge base" + H(a(S).length !== 1 ? "s" : ""), 1)) : y("", !0),
            g("div", Wt, [
              _(a(E), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              nt(g("input", {
                "onUpdate:modelValue": i[0] || (i[0] = (o) => at(O) ? O.value = o : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [ot, a(O)]
              ])
            ]),
            a(S).length ? (r(), j(a(X), {
              key: 1,
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: z
            }, {
              icon: J(({ class: o }) => [
                _(a(E), {
                  icon: "tabler:plus",
                  class: G(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : y("", !0)
          ])
        ]),
        a(M) ? (r(), p("div", Ut, H(a(M)), 1)) : y("", !0),
        a(R) ? (r(), p("div", Yt, H(a(R)), 1)) : y("", !0),
        a($) ? (r(), p("div", Ft, [
          _(a(E), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          i[11] || (i[11] = g("span", null, [
            g("strong", null, "No knowledge engine installed."),
            ee(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : y("", !0),
        g("div", Jt, [
          a(B) && !a(S).length ? (r(), p("div", Gt, [
            _(a(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[12] || (i[12] = ee(" Loading… ", -1))
          ])) : a(R) ? (r(), j(a(X), {
            key: 1,
            type: "button",
            label: "Retry",
            severity: "secondary",
            outlined: "",
            class: "kx-cat-retry",
            onClick: a(T)
          }, null, 8, ["onClick"])) : a(N) && !a($) && !a(S).length ? (r(), p("div", Qt, [
            g("div", Xt, [
              _(a(E), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            i[13] || (i[13] = g("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            i[14] || (i[14] = g("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            _(a(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: z
            }, {
              icon: J(({ class: o }) => [
                _(a(E), {
                  icon: "tabler:plus",
                  class: G(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])) : y("", !0),
          a(S).length && !a(A).length ? (r(), p("div", Zt, [...i[15] || (i[15] = [
            g("div", { class: "kx-empty-title" }, "No matches", -1),
            g("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : a(A).length ? (r(), p("div", en, [
            (r(!0), p(te, null, $e(a(A), (o) => (r(), p("div", {
              key: o.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${o.name || "knowledge base"}`,
              onClick: (P) => !o.deleting_at && a(Z)(o),
              onKeydown: [
                ze((P) => !o.deleting_at && a(Z)(o), ["enter"]),
                ze(ue((P) => !o.deleting_at && a(Z)(o), ["prevent"]), ["space"])
              ]
            }, [
              s(o, we) ? (r(), j(wt, {
                key: 0,
                state: o,
                onRetry: (P) => le(o)
              }, null, 8, ["state", "onRetry"])) : o.deleting_at ? (r(), p("span", nn, "Deletion requested")) : y("", !0),
              g("div", an, [
                g("span", on, [
                  _(a(E), {
                    icon: o.icon || o.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                g("div", sn, [
                  g("div", {
                    class: "kx-card-name",
                    title: o.name || "(untitled)"
                  }, H(o.name || "(untitled)"), 9, rn),
                  w(o) ? (r(), p("span", ln, "Read only")) : y("", !0),
                  o.badge ? (r(), p("div", cn, [
                    _(a(Pe), {
                      severity: m(o.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: J(() => [
                        _(a(E), {
                          icon: o.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        ee(H(o.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : y("", !0)
                ]),
                g("div", {
                  class: "kx-card-actions",
                  onClick: i[1] || (i[1] = ue(() => {
                  }, ["stop"]))
                }, [
                  s(o, ke) ? (r(), j(a(X), {
                    key: 0,
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${o.name}`,
                    onClick: (P) => !o.deleting_at && h(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: J(({ class: P }) => [
                      _(a(E), {
                        icon: "tabler:pencil",
                        class: G(P),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])) : y("", !0),
                  s(o, xe) ? (r(), j(a(X), {
                    key: 1,
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${o.name}`,
                    onClick: (P) => Ae(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: J(({ class: P }) => [
                      _(a(E), {
                        icon: "tabler:share",
                        class: G(P),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])) : y("", !0),
                  s(o, we) ? (r(), j(a(X), {
                    key: 2,
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${o.name}`,
                    onClick: (P) => le(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: J(({ class: P }) => [
                      _(a(E), {
                        icon: "tabler:trash",
                        class: G(P),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])) : y("", !0)
                ])
              ]),
              g("div", dn, H(o.description || "No description"), 1),
              o.stat_items && o.stat_items.length ? (r(), p("div", un, [
                (r(!0), p(te, null, $e(o.stat_items, (P, Je) => (r(), p("span", {
                  key: Je,
                  class: "kx-stat",
                  title: `${d(P.value)} ${P.label}`,
                  "aria-label": `${d(P.value)} ${P.label}`
                }, [
                  P.icon ? (r(), j(a(E), {
                    key: 0,
                    icon: P.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : y("", !0),
                  ee(H(d(P.value)), 1)
                ], 8, pn))), 128))
              ])) : y("", !0)
            ], 40, tn))), 128))
          ])) : y("", !0)
        ])
      ], 64)),
      _(rt, {
        open: v.value,
        api: a(Q),
        engines: a(L),
        models: a(C),
        target: f.value,
        "load-error": a(K),
        onRetry: a(V),
        onClose: i[9] || (i[9] = (o) => v.value = !1),
        onSaved: re
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      ye.value ? (r(), p("div", {
        key: 2,
        ref_key: "shareHost",
        ref: me
      }, null, 512)) : y("", !0)
    ]));
  }
}), Tn = {
  rootComponent: Ln,
  plugins: [Xe]
};
export {
  Tn as mountConfig
};
//# sourceMappingURL=lazy-mount-CTybdZzi.js.map
