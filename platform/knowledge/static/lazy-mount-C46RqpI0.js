import { B as Ke, s as Be, f as Je, a as Ge, P as Qe } from "./wc-runtime-Bmxpx-Ro.js";
import { openBlock as r, createElementBlock as p, mergeProps as de, createElementVNode as g, defineComponent as Ee, computed as he, withModifiers as we, Fragment as ee, createTextVNode as Z, toDisplayString as A, createCommentVNode as y, createVNode as _, unref as a, createBlock as j, resolveDynamicComponent as Xe, renderSlot as je, renderList as $e, ref as x, watch as Se, nextTick as Me, onBeforeUnmount as De, normalizeStyle as Ze, onMounted as et, withDirectives as tt, isRef as nt, vModelText as at, withCtx as J, normalizeClass as G } from "vue";
import { s as X, e as ue, l as ot, u as st, _ as it } from "./KbDialog.vue_vue_type_script_setup_true_lang-DiRAkw8s.js";
import { Icon as E } from "@iconify/vue";
import { on as rt, api as Q, loadByTagName as Ve, host as lt } from "@wippy-fe/proxy";
import { u as ct, a as dt } from "./constants-BEKvlp0G.js";
import { c as ut, s as pt } from "./componentRealtime-m98w4dre.js";
var vt = `
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
`, ft = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, gt = Ke.extend({
  name: "progressspinner",
  style: vt,
  classes: ft
}), yt = {
  name: "BaseProgressSpinner",
  extends: Be,
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
  style: gt,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, We = {
  name: "ProgressSpinner",
  extends: yt,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, mt = ["fill", "stroke-width"];
function ht(e, d, s, w, m, l) {
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
  }, e.ptm("circle")), null, 16, mt)], 16))], 16);
}
We.render = ht;
const bt = { key: 0 }, kt = /* @__PURE__ */ Ee({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const d = e, s = he(() => d.state.deletion_job === null || ["dead", "cancelled"].includes(d.state.deletion_job?.status || ""));
    return (w, m) => e.state.deleting_at ? (r(), p("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: m[1] || (m[1] = we(() => {
      }, ["stop"])),
      onKeydown: m[2] || (m[2] = we(() => {
      }, ["stop"]))
    }, [
      s.value ? (r(), p(ee, { key: 0 }, [
        g("span", null, [
          m[3] || (m[3] = Z("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (r(), p("span", bt, ": " + A(e.state.deletion_job.last_error), 1)) : y("", !0)
        ]),
        _(a(X), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: m[0] || (m[0] = we((l) => w.$emit("retry"), ["stop"]))
        })
      ], 64)) : (r(), p(ee, { key: 1 }, [
        _(a(We), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        m[4] || (m[4] = g("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : y("", !0);
  }
});
var wt = `
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
`, _t = {
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
}, xt = Ke.extend({
  name: "tag",
  style: wt,
  classes: _t
}), $t = {
  name: "BaseTag",
  extends: Be,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: xt,
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
function St(e, d, s) {
  return (d = Ct(d)) in e ? Object.defineProperty(e, d, { value: s, enumerable: !0, configurable: !0, writable: !0 }) : e[d] = s, e;
}
function Ct(e) {
  var d = Et(e, "string");
  return _e(d) == "symbol" ? d : d + "";
}
function Et(e, d) {
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
  extends: $t,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Je(St({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Dt = ["data-p"];
function Lt(e, d, s, w, m, l) {
  return r(), p("span", de({
    class: e.cx("root"),
    "data-p": l.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (r(), j(Xe(e.$slots.icon), de({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (r(), p("span", de({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : y("", !0), e.value != null || e.$slots.default ? je(e.$slots, "default", {
    key: 2
  }, function() {
    return [g("span", de({
      class: e.cx("label")
    }, e.ptm("label")), A(e.value), 17)];
  }) : y("", !0)], 16, Dt);
}
Pe.render = Lt;
const Mt = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, Pt = {
  key: 0,
  "aria-hidden": "true"
}, Rt = { class: "kx-header-stat" }, Ot = { class: "kx-header-stat-label" }, At = /* @__PURE__ */ Ee({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (d, s) => e.items.length ? (r(), p("span", Mt, [
      (r(!0), p(ee, null, $e(e.items, (w, m) => (r(), p(ee, { key: m }, [
        m ? (r(), p("span", Pt, " · ")) : y("", !0),
        g("span", Rt, [
          w.icon ? (r(), j(a(E), {
            key: 0,
            icon: w.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : y("", !0),
          g("span", Ot, A(w.value.toLocaleString()) + " " + A(w.label), 1)
        ])
      ], 64))), 128))
    ])) : y("", !0);
  }
}), Ht = 2e3;
function ze(e) {
  const d = e.margin ?? 8, s = e.gap ?? 4, w = Math.max(0, e.viewportWidth), m = Math.max(0, e.viewportHeight), l = Math.max(0, w - d * 2), D = Math.min(Math.max(0, e.requestedWidth), l), B = e.align === "right" ? e.anchor.right - D : e.anchor.left, M = Math.max(d, Math.min(B, w - d - D)), P = Math.max(0, m - e.anchor.bottom - s - d), H = Math.max(0, e.anchor.top - s - d), $ = P < e.requestedMaxHeight && H > P ? "above" : "below", S = $ === "above" ? H : P, R = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), S)), O = Math.min(Math.max(0, e.panelHeight ?? R), R), C = $ === "above" ? e.anchor.top - s - O : e.anchor.bottom + s, L = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(M - L.left),
    width: Math.round(D),
    maxHeight: R,
    side: $,
    top: Math.round(C - L.top)
  };
}
const Nt = /* @__PURE__ */ Ee({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Ht }
  },
  emits: ["update:open"],
  setup(e, { emit: d }) {
    const s = e, w = d, m = x(null), l = x({ position: "fixed", visibility: "hidden" });
    function D() {
      const C = s.anchor, L = m.value;
      if (!C || !L) return;
      const q = C.getBoundingClientRect(), N = s.width === "anchor" ? Math.max(s.minWidth, q.width) : Math.max(s.minWidth, s.width), I = {
        anchor: q,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: N,
        requestedMaxHeight: s.maxHeight,
        align: s.align,
        gap: s.gap
      }, W = ze(I);
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
      const V = L.getBoundingClientRect(), U = ze({
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
    function P() {
      M || !s.open || (M = !0, requestAnimationFrame(() => {
        M = !1, s.open && D();
      }));
    }
    function H() {
      typeof ResizeObserver > "u" || (B = new ResizeObserver(P), m.value && B.observe(m.value), s.anchor && B.observe(s.anchor));
    }
    function $() {
      B?.disconnect(), B = null, M = !1;
    }
    Se(() => s.open, async (C) => {
      $(), C && (l.value = { position: "fixed", visibility: "hidden" }, await Me(), D(), H());
    }, { immediate: !0 });
    function S(C) {
      if (!s.open) return;
      const L = C.composedPath();
      m.value && L.includes(m.value) || s.anchor && L.includes(s.anchor) || w("update:open", !1);
    }
    function R(C) {
      !s.open || C.key !== "Escape" || (C.preventDefault(), C.stopImmediatePropagation(), w("update:open", !1));
    }
    function O() {
      s.open && D();
    }
    return document.addEventListener("click", S), document.addEventListener("keydown", R, !0), window.addEventListener("resize", O), window.addEventListener("scroll", O, !0), De(() => {
      $(), document.removeEventListener("click", S), document.removeEventListener("keydown", R, !0), window.removeEventListener("resize", O), window.removeEventListener("scroll", O, !0);
    }), (C, L) => e.open ? (r(), p("div", {
      key: 0,
      ref_key: "panel",
      ref: m,
      class: "anchored-panel",
      style: Ze(l.value)
    }, [
      je(C.$slots, "default")
    ], 4)) : y("", !0);
  }
}), Oe = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Ie = Object.keys(Oe), Re = [
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
function Tt({ detail: e }) {
  const d = x(!1), s = x(""), w = x(""), m = x(!1), l = x(""), D = x([]), B = x(""), M = x([]), P = x([]), H = x("");
  let $ = !0;
  const S = ot();
  let R = !1, O = !1, C = 0, L = !1;
  const q = /* @__PURE__ */ new Set(), N = he(() => {
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
      const v = ue(t, "could not load knowledge bases");
      return n() && $ && (I(v) ? l.value = qe : w.value = v), !1;
    } finally {
      n() && (d.value = !1, $ && O && !R && b(), q.size && ie());
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
      P.value = n?.success ? n.engines || [] : [];
    } catch {
      P.value = [];
    }
  }
  function Y(n) {
    return P.value.find((t) => t.kb_type === n);
  }
  async function ce() {
    H.value = "";
    try {
      const [n, t] = await Promise.all([
        Q.get("/api/v1/knowledge/engines"),
        Q.get("/api/v1/knowledge/models")
      ]);
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load knowledge engines.");
      if (!t.data?.success) throw new Error(t.data?.error || "Could not load embedding models.");
      P.value = n.data.engines || [], M.value = t.data.models || [];
    } catch (n) {
      P.value = [], M.value = [], H.value = ue(n, "Could not load knowledge engines.");
    }
  }
  function ne(n) {
    return !!n && typeof n == "object" && !Array.isArray(n);
  }
  function pe(n) {
    if (ne(n)) return n;
    if (!(typeof n != "string" || !n))
      try {
        const t = JSON.parse(n);
        return ne(t) ? t : void 0;
      } catch {
        return;
      }
  }
  function te(n, t) {
    if (!t) return;
    let v = n;
    for (const f of t.split(".")) {
      if (!ne(v)) return;
      v = v[f];
    }
    return v;
  }
  function ae(n, t) {
    if (!Array.isArray(t)) return [];
    const v = [];
    for (const f of t) {
      const T = te(n, f.path), h = typeof T == "number" ? T : Number(T || 0);
      h < (f.min ?? 0) || v.push({ icon: f.icon, value: h, label: String(h === 1 ? f.singular : f.plural) });
    }
    return v;
  }
  function F(n, t) {
    return Object.prototype.hasOwnProperty.call(n, t);
  }
  function K(n, t) {
    return Ie.some((v) => F(n, v)) ? !0 : Array.isArray(t) ? t.some((v) => {
      const f = v.path || "";
      return f !== "" && F(n, f.split(".")[0]);
    }) : !1;
  }
  function ve(n, t, v) {
    const f = String(t.kb_type || v || ""), T = Y(f), h = {
      kb_type: f || v,
      badge: T?.badge
    };
    for (const re of Ie) {
      const le = t[re];
      F(t, re) && typeof le == "number" && (h[re] = le);
    }
    return (K(t, T?.stats_spec) || F(t, "kb_type")) && (h.stat_items = ae({ ...n, ...t }, T?.stats_spec)), h;
  }
  function fe(n, t, v = []) {
    const f = {};
    typeof t.title == "string" && (f.name = t.title), typeof t.comment == "string" && (f.description = t.comment), typeof t.icon == "string" && (f.icon = t.icon), typeof t.status == "string" && (f.status = t.status), typeof t.auto_summary == "string" && (f.auto_summary = t.auto_summary), typeof t.auto_description == "string" && (f.auto_description = t.auto_description), typeof t.kb_type == "string" && (f.kb_type = t.kb_type), n.stats_from_store || Object.assign(f, ve(n, t, f.kb_type || n.kb_type));
    const T = { ...n, ...f };
    for (const h of v) {
      const re = h === "title" ? "name" : h;
      n.stats_from_store && Re.some((le) => le === re) || delete T[re];
    }
    return T;
  }
  const oe = x(null);
  function se(n, t) {
    const v = pe(t.meta) || {}, f = t.deleted || [], T = D.value.find((h) => h.id === n && h.stats_from_store) || (e.value?.id === n ? e.value : void 0);
    T?.stats_from_store && (Re.some((h) => F(v, h) || f.includes(h)) || K(v, Y(T.kb_type || "")?.stats_spec)) && (q.add(n), ie()), D.value = D.value.map((h) => h.id === n ? fe(h, v, f) : h), e.value?.id === n && (e.value = fe(e.value, v, f));
  }
  async function ie() {
    if (!(L || d.value || !$ || !q.size)) {
      L = !0;
      try {
        for (await Promise.resolve(); $ && !d.value && q.size; ) {
          const n = [...q].slice(0, 100);
          for (const h of n) q.delete(h);
          const t = C, { data: v } = await Q.get(`/api/v1/knowledge/list?ids=${n.map(encodeURIComponent).join(",")}`);
          if (!$) return;
          if (t !== C) {
            for (const h of n) q.add(h);
            continue;
          }
          if (!v?.success) continue;
          const f = new Map(
            (v.items || []).map((h) => [h.id, h])
          ), T = new Set(n);
          D.value = D.value.map((h) => h.stats_from_store && T.has(h.id) ? Ce(h, f.get(h.id)) : h), e.value?.stats_from_store && T.has(e.value.id) && (e.value = Ce(e.value, f.get(e.value.id)));
        }
      } catch {
      } finally {
        L = !1, q.size && ie();
      }
    }
  }
  function u() {
    $ = !1, O = !1, q.clear(), k?.(), oe.value?.(), oe.value = null;
  }
  async function b() {
    if ($) {
      if (R || d.value) {
        O = !0;
        return;
      }
      R = !0;
      try {
        do
          O = !1, await W();
        while ($ && O);
      } finally {
        R = !1;
      }
    }
  }
  const k = rt("@message", (n) => {
    const t = ut(n, void 0, Oe);
    if (!t) return;
    const v = D.value.some((f) => f.id === t.component_id);
    (v || e.value?.id === t.component_id) && se(t.component_id, t), !v && typeof t.meta.kb_type == "string" && t.meta.kb_type && b();
  });
  return De(u), {
    loading: d,
    error: s,
    catalogError: w,
    catalogLoaded: m,
    notice: l,
    kbs: D,
    query: B,
    filtered: N,
    models: M,
    engines: P,
    dialogLoadError: H,
    load: W,
    loadModels: V,
    loadEngines: U,
    engineFor: Y,
    loadDialogCatalog: ce,
    detailUnsub: oe,
    applyComponentMetaEvent: se,
    clearComponentSubscriptions: u
  };
}
function zt({ detail: e, detailUnsub: d, kbs: s, engines: w, engineFor: m, applyComponentMetaEvent: l, route: D, navigate: B, loadEngines: M }) {
  const P = x(!1), H = x(""), $ = x(null);
  let S = null, R = 0, O = 0;
  const C = he(() => e.value ? m(e.value.kb_type || "")?.manage_ui_id : void 0), L = he(() => (e.value ? m(e.value.kb_type || "")?.manage_views : void 0) || []), q = he(() => L.value.length > 1), N = x(""), I = x("");
  let W = !1, V = 0;
  function U() {
    const u = e.value?.kb_type;
    return u ? `kx:kb:detail-view:${u}` : null;
  }
  Se(L, (u) => {
    if (!u.length) {
      N.value = "";
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
    n !== N.value && (N.value = n);
  }, { immediate: !0 });
  function Y() {
    const u = { kb_id: e.value?.id, route: I.value };
    return N.value && (u.view = N.value), JSON.stringify(u);
  }
  function ce(u) {
    if (u !== N.value) {
      N.value = u;
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
  function ne(u) {
    u.stopPropagation();
    const b = e.value?.id;
    if (!b || W) return;
    const k = typeof u.detail == "string" ? u.detail : u.detail?.path ?? u.detail?.route ?? "", n = String(k || "").replace(/^\/+/, "");
    I.value = n, F(n ? `${b}/${n}` : b);
  }
  function pe(u) {
    u.stopPropagation();
  }
  function te(u = !0) {
    u && O++, S && (S.removeEventListener("kb-changed", pe), S.removeEventListener("navigate", ne), S.remove(), S = null);
  }
  async function ae() {
    const u = ++O;
    te(!1);
    const b = C.value, k = $.value, n = e.value?.id;
    if (!b || !k || !n) return;
    try {
      await Ve(b, { timeoutMs: 8e3 });
    } catch {
    }
    if (u !== O || e.value?.id !== n || C.value !== b || $.value !== k) return;
    k.replaceChildren();
    const t = document.createElement(b);
    try {
      t.setAttribute("config", Y());
    } catch {
    }
    t.addEventListener("kb-changed", pe), t.addEventListener("navigate", ne), k.appendChild(t), S = t;
  }
  function F(u) {
    W || B(u);
  }
  function K(u, b) {
    return R === u && e.value?.id === b;
  }
  async function ve(u, b = !0) {
    const k = ++R, n = u.id;
    e.value = { ...u }, d.value?.(), d.value = n ? pt(n, (t) => l(n, t), Oe) : null, H.value = "", P.value = !0, te(), b && F(n);
    try {
      const { data: t } = await Q.get(`/api/v1/knowledge/${n}`);
      if (!K(k, n)) return;
      if (t?.success) {
        const v = { ...e.value, ...t };
        e.value = t.stats_from_store ? Ce(v, t) : v;
      } else H.value = t?.error || "could not load knowledge base";
    } catch (t) {
      if (!K(k, n)) return;
      H.value = ue(t, "could not load knowledge base");
    } finally {
      K(k, n) && (P.value = !1);
    }
    K(k, n) && (w.value.length || await M(), K(k, n) && (await Me(), K(k, n) && await ae()));
  }
  async function fe() {
    const u = e.value?.id;
    if (!u) return;
    const b = ++R;
    H.value = "";
    try {
      const { data: k } = await Q.get(`/api/v1/knowledge/${u}`);
      if (!K(b, u)) return;
      if (k?.success) {
        const n = { ...e.value, ...k };
        e.value = k.stats_from_store ? Ce(n, k) : n;
      } else H.value = k?.error || "could not load knowledge base";
    } catch (k) {
      if (!K(b, u)) return;
      H.value = ue(k, "could not load knowledge base");
    }
    if (K(b, u) && (await Me(), !!K(b, u)))
      try {
        S?.setAttribute("config", Y());
      } catch {
      }
  }
  function oe() {
    const u = e.value?.id;
    if (!u || !I.value) {
      se();
      return;
    }
    B({ path: u, back: { within: u } });
  }
  function se(u = !0) {
    R++, te(), d.value?.(), d.value = null, e.value = null, I.value = "", u && F("");
  }
  async function ie(u) {
    const b = ++V, k = String(u || "").split("/").filter(Boolean), n = k[0] || "", t = k.slice(1).join("/");
    W = !0;
    try {
      if (b !== V) return;
      if (!n)
        e.value && se(!1);
      else if (e.value?.id !== n) {
        I.value = t;
        const v = s.value.find((f) => f.id === n);
        if (await ve(v || { id: n }, !1), b !== V) return;
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
    ie(u);
  }), De(() => {
    te(), d.value?.(), d.value = null;
  }), {
    detailLoading: P,
    detailError: H,
    detailHost: $,
    detailManageTag: C,
    detailViews: L,
    detailHasViews: q,
    detailView: N,
    innerRoute: I,
    setDetailView: ce,
    openDetail: ve,
    refreshOpenDetail: fe,
    closeDetail: se,
    backDetail: oe,
    applyRoute: ie,
    pushRoute: F,
    unmountDetailWc: te
  };
}
const It = { class: "kx" }, qt = { class: "kx-head" }, Kt = { class: "kx-head-icon" }, Bt = { class: "kx-head-actions" }, jt = {
  key: 0,
  class: "kx-count"
}, Vt = { class: "kx-search" }, Wt = {
  key: 0,
  class: "kx-err"
}, Ut = {
  key: 1,
  class: "kx-err",
  role: "alert"
}, Yt = {
  key: 2,
  class: "kx-notice"
}, Ft = { class: "kx-body" }, Jt = {
  key: 0,
  class: "kx-loading"
}, Gt = {
  key: 2,
  class: "kx-empty"
}, Qt = { class: "kx-empty-ico" }, Xt = {
  key: 3,
  class: "kx-empty"
}, Zt = {
  key: 4,
  class: "kx-grid"
}, en = {
  key: 1,
  class: "kx-sub",
  role: "status"
}, tn = { class: "kx-card-head" }, nn = { class: "kx-ficon" }, an = { class: "kx-card-id" }, on = ["title", "aria-label", "disabled", "onClick"], sn = {
  key: 0,
  class: "kx-sub"
}, rn = {
  key: 1,
  class: "kx-card-meta"
}, ln = { class: "kx-card-actions" }, cn = { class: "kx-card-desc" }, dn = {
  key: 2,
  class: "kx-stats"
}, un = ["title", "aria-label"], pn = { class: "kx-bar" }, vn = { class: "kx-bar-l" }, fn = ["title"], gn = {
  key: 0,
  class: "kx-sub"
}, yn = { class: "kx-summary-pop-h" }, mn = {
  key: 0,
  class: "kx-summary-pop-sum"
}, hn = {
  key: 1,
  class: "kx-summary-pop-desc"
}, bn = { class: "kx-bar-r" }, kn = {
  key: 0,
  class: "kx-viewseg",
  role: "tablist",
  "aria-label": "View mode"
}, wn = ["aria-selected", "onClick"], _n = {
  key: 0,
  class: "kx-err"
}, xn = {
  key: 0,
  class: "kx-loading"
}, $n = {
  key: 0,
  class: "kx-detail-meta"
}, Sn = {
  key: 0,
  class: "kx-detail-desc"
}, Cn = { class: "kx-stats" }, En = {
  key: 0,
  class: "kx-stat"
}, be = 2, ke = 4, xe = 8, Dn = /* @__PURE__ */ Ee({
  __name: "knowledge",
  setup(e) {
    const d = (c) => (c ?? 0).toLocaleString();
    function s(c, i) {
      return ((c.access_level ?? 0) & i) !== 0;
    }
    function w(c) {
      return typeof c.access_level == "number" && !s(c, be | ke | xe);
    }
    function m(c) {
      if (c === "neutral") return "secondary";
      if (c === "warning") return "warn";
      if (c === "info" || c === "success" || c === "danger") return c;
    }
    const l = x(null), D = Tt({ detail: l }), {
      loading: B,
      error: M,
      catalogError: P,
      catalogLoaded: H,
      notice: $,
      kbs: S,
      query: R,
      filtered: O,
      models: C,
      engines: L,
      dialogLoadError: q,
      load: N,
      loadEngines: I,
      engineFor: W,
      loadDialogCatalog: V,
      detailUnsub: U,
      applyComponentMetaEvent: Y
    } = D, ce = ct(), ne = dt(), pe = zt({
      detail: l,
      detailUnsub: U,
      kbs: S,
      engines: L,
      engineFor: W,
      applyComponentMetaEvent: Y,
      route: he(() => ce.value.route),
      navigate: (c) => ne("navigate", c),
      loadEngines: I
    }), {
      detailLoading: te,
      detailError: ae,
      detailHost: F,
      detailManageTag: K,
      detailViews: ve,
      detailHasViews: fe,
      detailView: oe,
      setDetailView: se,
      openDetail: ie,
      refreshOpenDetail: u,
      closeDetail: b,
      backDetail: k,
      applyRoute: n
    } = pe;
    function t(c) {
      l.value ? ae.value = c : M.value = c;
    }
    const v = x(!1), f = x(null);
    async function T() {
      f.value = null, await V(), v.value = !0;
    }
    async function h(c) {
      if (s(c, be)) {
        M.value = "", ae.value = "", q.value = "", L.value.length || await I();
        try {
          const { data: i } = await Q.get(`/api/v1/knowledge/${c.id}`);
          if (!i?.success) throw new Error(i?.error || "could not load knowledge base settings");
          if (!s(i, be)) {
            await N(), l.value?.id === c.id && (l.value = { ...l.value, access_level: i.access_level }), t("You no longer have permission to edit this knowledge base.");
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
          f.value = null, v.value = !1, t(ue(i, "could not load knowledge base settings"));
        }
      }
    }
    async function re() {
      v.value = !1;
      const c = l.value?.id;
      if (await N(), c && f.value && f.value.id === c)
        try {
          const { data: i } = await Q.get(`/api/v1/knowledge/${c}`);
          i?.success && l.value && l.value.id === c && (l.value = { ...l.value, ...i });
        } catch {
        }
      f.value = null;
    }
    async function le(c) {
      if (!(!s(c, ke) || !await lt.confirm({
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
          Ye(c.id, o), l.value?.id === c.id && b(), await N();
        } catch (o) {
          t(ue(o, "delete failed"));
        }
      }
    }
    const ge = x(!1), Le = x(null), ye = x(null);
    function Ae(c) {
      s(c, xe) && (Le.value = c, ge.value = !0);
    }
    function He() {
      ge.value = !1, Le.value = null;
    }
    const me = x(!1), Ne = x(null);
    function Te(c) {
      c.key === "Escape" && ge.value && He();
    }
    et(() => {
      window.addEventListener("keydown", Te);
    }), De(() => {
      window.removeEventListener("keydown", Te);
    });
    async function Ue() {
      const c = Le.value;
      if (!ye.value || !c) return;
      if (ye.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Ve("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const i = document.createElement("kickside-share");
      i.setAttribute("config", JSON.stringify({
        resource_id: c.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(c.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(c.id)}`,
        title: c.name || ""
      })), i.style.display = "block", i.addEventListener("close", He), ye.value.appendChild(i);
    }
    Se([ge, ye], async () => {
      ge.value && ye.value && await Ue();
    }), Ge(async () => {
      try {
        await Promise.all([N(), I(), u()]), !l.value && ce.value.route && await n(ce.value.route);
      } catch (c) {
        M.value = ue(c, "host API unavailable");
      }
    });
    const { acceptDeletion: Ye } = st(S, (c) => c.id, (c) => {
      l.value?.id === c && b();
    }, N);
    return (c, i) => (r(), p("div", It, [
      l.value ? (r(), p(ee, { key: 1 }, [
        g("div", pn, [
          g("div", vn, [
            g("button", {
              class: "kx-back",
              onClick: i[1] || (i[1] = (o) => a(k)())
            }, [
              _(a(E), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              i[15] || (i[15] = Z(" Back", -1))
            ]),
            g("h1", {
              class: "kx-title",
              title: l.value.name || "(untitled)"
            }, A(l.value.name || "(untitled)"), 9, fn),
            w(l.value) ? (r(), p("span", gn, "Read only")) : y("", !0),
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
                Z(A(l.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : y("", !0),
            _(At, {
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
                class: G(["kx-summary-btn", { on: me.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": me.value,
                onClick: i[2] || (i[2] = we((o) => me.value = !me.value, ["stop"]))
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
              _(Nt, {
                open: me.value,
                "onUpdate:open": i[4] || (i[4] = (o) => me.value = o),
                anchor: Ne.value,
                width: 340
              }, {
                default: J(() => [
                  g("div", {
                    class: "kx-summary-pop",
                    onClick: i[3] || (i[3] = we(() => {
                    }, ["stop"]))
                  }, [
                    g("div", yn, [
                      _(a(E), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      i[16] || (i[16] = g("span", null, "About this knowledge base", -1))
                    ]),
                    l.value.auto_summary ? (r(), p("p", mn, A(l.value.auto_summary), 1)) : y("", !0),
                    l.value.auto_description ? (r(), p("p", hn, A(l.value.auto_description), 1)) : y("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ], 512)) : y("", !0)
          ]),
          g("div", bn, [
            a(fe) ? (r(), p("div", kn, [
              (r(!0), p(ee, null, $e(a(ve), (o) => (r(), p("button", {
                key: o.id,
                class: G(["kx-viewseg-btn", { on: a(oe) === o.id }]),
                role: "tab",
                "aria-selected": a(oe) === o.id,
                onClick: (z) => a(se)(o.id)
              }, [
                o.icon ? (r(), j(a(E), {
                  key: 0,
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : y("", !0),
                Z(" " + A(o.label), 1)
              ], 10, wn))), 128))
            ])) : y("", !0),
            s(l.value, be) ? (r(), j(a(X), {
              key: 1,
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: i[5] || (i[5] = (o) => h(l.value))
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
              onClick: i[6] || (i[6] = (o) => Ae(l.value))
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
            s(l.value, ke) ? (r(), j(a(X), {
              key: 3,
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: i[7] || (i[7] = (o) => le(l.value))
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
        a(ae) ? (r(), p("div", _n, A(a(ae)), 1)) : y("", !0),
        g("div", {
          class: G(["kx-body", { "kx-body-bleed": a(K) }])
        }, [
          a(te) ? (r(), p("div", xn, [
            _(a(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[17] || (i[17] = Z(" Loading… ", -1))
          ])) : (r(), p(ee, { key: 1 }, [
            a(K) ? y("", !0) : (r(), p("div", $n, [
              l.value.description ? (r(), p("div", Sn, A(l.value.description), 1)) : y("", !0),
              g("div", Cn, [
                l.value.embedding_model ? (r(), p("span", En, [
                  _(a(E), {
                    icon: "tabler:vector",
                    "aria-hidden": "true"
                  }),
                  Z(A(l.value.embedding_model), 1)
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
      ], 64)) : (r(), p(ee, { key: 0 }, [
        g("header", qt, [
          g("div", Kt, [
            _(a(E), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          i[9] || (i[9] = g("div", { class: "kx-head-text" }, [
            g("h1", { class: "kx-head-title" }, "Knowledge"),
            g("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          g("div", Bt, [
            a(H) ? (r(), p("span", jt, A(a(S).length) + " knowledge base" + A(a(S).length !== 1 ? "s" : ""), 1)) : y("", !0),
            g("div", Vt, [
              _(a(E), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              tt(g("input", {
                "onUpdate:modelValue": i[0] || (i[0] = (o) => nt(R) ? R.value = o : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [at, a(R)]
              ])
            ]),
            a(S).length ? (r(), j(a(X), {
              key: 1,
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: T
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
        a(M) ? (r(), p("div", Wt, A(a(M)), 1)) : y("", !0),
        a(P) ? (r(), p("div", Ut, A(a(P)), 1)) : y("", !0),
        a($) ? (r(), p("div", Yt, [
          _(a(E), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          i[10] || (i[10] = g("span", null, [
            g("strong", null, "No knowledge engine installed."),
            Z(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : y("", !0),
        g("div", Ft, [
          a(B) && !a(S).length ? (r(), p("div", Jt, [
            _(a(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            i[11] || (i[11] = Z(" Loading… ", -1))
          ])) : a(P) ? (r(), j(a(X), {
            key: 1,
            type: "button",
            label: "Retry",
            severity: "secondary",
            outlined: "",
            class: "kx-cat-retry",
            onClick: a(N)
          }, null, 8, ["onClick"])) : a(H) && !a($) && !a(S).length ? (r(), p("div", Gt, [
            g("div", Qt, [
              _(a(E), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            i[12] || (i[12] = g("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            i[13] || (i[13] = g("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            _(a(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: T
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
          a(S).length && !a(O).length ? (r(), p("div", Xt, [...i[14] || (i[14] = [
            g("div", { class: "kx-empty-title" }, "No matches", -1),
            g("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : a(O).length ? (r(), p("div", Zt, [
            (r(!0), p(ee, null, $e(a(O), (o) => (r(), p("div", {
              key: o.id,
              class: "kx-card"
            }, [
              s(o, ke) ? (r(), j(kt, {
                key: 0,
                state: o,
                onRetry: (z) => le(o)
              }, null, 8, ["state", "onRetry"])) : o.deleting_at ? (r(), p("span", en, "Deletion requested")) : y("", !0),
              g("div", tn, [
                g("span", nn, [
                  _(a(E), {
                    icon: o.icon || o.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                g("div", an, [
                  g("button", {
                    type: "button",
                    class: "kx-card-name kx-card-open",
                    title: o.name || "(untitled)",
                    "aria-label": `Open ${o.name || "knowledge base"}`,
                    disabled: !!o.deleting_at,
                    onClick: (z) => a(ie)(o)
                  }, A(o.name || "(untitled)"), 9, on),
                  w(o) ? (r(), p("span", sn, "Read only")) : y("", !0),
                  o.badge ? (r(), p("div", rn, [
                    _(a(Pe), {
                      severity: m(o.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: J(() => [
                        _(a(E), {
                          icon: o.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        Z(A(o.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : y("", !0)
                ]),
                g("div", ln, [
                  s(o, be) ? (r(), j(a(X), {
                    key: 0,
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${o.name}`,
                    onClick: (z) => !o.deleting_at && h(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: J(({ class: z }) => [
                      _(a(E), {
                        icon: "tabler:pencil",
                        class: G(z),
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
                    onClick: (z) => Ae(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: J(({ class: z }) => [
                      _(a(E), {
                        icon: "tabler:share",
                        class: G(z),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])) : y("", !0),
                  s(o, ke) ? (r(), j(a(X), {
                    key: 2,
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${o.name}`,
                    onClick: (z) => le(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: J(({ class: z }) => [
                      _(a(E), {
                        icon: "tabler:trash",
                        class: G(z),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])) : y("", !0)
                ])
              ]),
              g("div", cn, A(o.description || "No description"), 1),
              o.stat_items && o.stat_items.length ? (r(), p("div", dn, [
                (r(!0), p(ee, null, $e(o.stat_items, (z, Fe) => (r(), p("span", {
                  key: Fe,
                  class: "kx-stat",
                  title: `${d(z.value)} ${z.label}`,
                  "aria-label": `${d(z.value)} ${z.label}`
                }, [
                  z.icon ? (r(), j(a(E), {
                    key: 0,
                    icon: z.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : y("", !0),
                  Z(A(d(z.value)), 1)
                ], 8, un))), 128))
              ])) : y("", !0)
            ]))), 128))
          ])) : y("", !0)
        ])
      ], 64)),
      _(it, {
        open: v.value,
        api: a(Q),
        engines: a(L),
        models: a(C),
        target: f.value,
        "load-error": a(q),
        onRetry: a(V),
        onClose: i[8] || (i[8] = (o) => v.value = !1),
        onSaved: re
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      ge.value ? (r(), p("div", {
        key: 2,
        ref_key: "shareHost",
        ref: ye
      }, null, 512)) : y("", !0)
    ]));
  }
}), Nn = {
  rootComponent: Dn,
  plugins: [Qe]
};
export {
  Nn as mountConfig
};
//# sourceMappingURL=lazy-mount-C46RqpI0.js.map
