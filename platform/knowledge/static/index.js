import { u as Be, W as qe } from "./index-D52CRMw6.js";
import { B as Oe, s as He, a as Z, f as Ve, e as se, _ as We, P as Ue } from "./KbDialog.vue_vue_type_script_setup_true_lang-CICQRGnH.js";
import { openBlock as g, createElementBlock as m, mergeProps as ae, createElementVNode as y, defineComponent as be, computed as ue, withModifiers as ie, Fragment as F, createTextVNode as J, toDisplayString as N, createCommentVNode as D, createVNode as h, unref as a, watch as ve, onBeforeUnmount as me, createBlock as fe, resolveDynamicComponent as Je, renderSlot as Ae, renderList as he, ref as j, nextTick as _e, normalizeStyle as Fe, onMounted as Ge, withDirectives as Ye, isRef as Qe, vModelText as Xe, withCtx as V, normalizeClass as W, withKeys as Me } from "vue";
import { on as Ke, api as G, loadByTagName as Ne, host as Ze, define as et } from "@wippy-fe/proxy";
import { c as tt, a as nt, s as ot, u as at, b as it } from "./constants-Cgcp0OGP.js";
import { Icon as M } from "@iconify/vue";
import { s as st } from "./styles-BYv45jhF.js";
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
function pt(e, i, d, s, v, P) {
  return g(), m("div", ae({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(g(), m("svg", ae({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: P.svgStyle
  }, e.ptm("spin")), [y("circle", ae({
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
const gt = { key: 0 }, ft = /* @__PURE__ */ be({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const i = e, d = ue(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (s, v) => e.state.deleting_at ? (g(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: v[1] || (v[1] = ie(() => {
      }, ["stop"])),
      onKeydown: v[2] || (v[2] = ie(() => {
      }, ["stop"]))
    }, [
      d.value ? (g(), m(F, { key: 0 }, [
        y("span", null, [
          v[3] || (v[3] = J("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (g(), m("span", gt, ": " + N(e.state.deletion_job.last_error), 1)) : D("", !0)
        ]),
        h(a(Z), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: v[0] || (v[0] = ie((P) => s.$emit("retry"), ["stop"]))
        })
      ], 64)) : (g(), m(F, { key: 1 }, [
        h(a(Re), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        v[4] || (v[4] = y("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : D("", !0);
  }
});
function vt(e, i, d, s) {
  const v = /* @__PURE__ */ new Set(), P = /* @__PURE__ */ new Map();
  function S(x, b) {
    const w = e.value.find((K) => i(K) === x), c = P.get(x), E = b?.job_id || c?.deletion_job_id || w?.deletion_job_id, L = c ? c.deletion_job_id : w?.deleting_at ? w.deletion_job_id : void 0;
    if ((c || w?.deleting_at) && E === L) return;
    const $ = {
      deleting_at: c?.deleting_at || w?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: E
    };
    P.set(x, $), w && (Object.assign(w, $), w.deletion_job = void 0);
  }
  const H = ve(() => e.value, (x, b = []) => {
    const w = x.filter((c) => !v.has(i(c)));
    for (const c of b)
      v.has(i(c)) || w.some((E) => i(E) === i(c)) || (d?.(i(c)), c.deleting_at && s?.(i(c)));
    if (w.length !== x.length) {
      e.value = w;
      return;
    }
    for (const c of x) {
      c.deleting_at && c.deletion_job === void 0 && !b.includes(c) && (c.deletion_job = null);
      const E = P.get(i(c));
      E && (c.deletion_job_id !== E.deletion_job_id && (c.deletion_job = void 0), Object.assign(c, E));
      const L = b.find(($) => i($) === i(c));
      c.deletion_job === void 0 && L?.deletion_job_id === c.deletion_job_id && (c.deletion_job = L?.deletion_job);
    }
  }, { immediate: !0 }), O = Ke("@message", (x) => {
    const b = tt(x);
    if (!b) return;
    const w = e.value.find((c) => i(c) === b.component_id);
    b.event === "component.deleted" ? (w && !v.has(b.component_id) && (d?.(b.component_id), s?.(b.component_id)), v.add(b.component_id), P.delete(b.component_id), e.value = e.value.filter((c) => i(c) !== b.component_id)) : w && S(b.component_id, { job_id: b.deletion_job_id });
  });
  return me(() => {
    H(), typeof O == "function" && O();
  }), { acceptDeletion: S };
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
}, ht = Oe.extend({
  name: "tag",
  style: yt,
  classes: mt
}), bt = {
  name: "BaseTag",
  extends: He,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: ht,
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
function kt(e, i, d) {
  return (i = wt(i)) in e ? Object.defineProperty(e, i, { value: d, enumerable: !0, configurable: !0, writable: !0 }) : e[i] = d, e;
}
function wt(e) {
  var i = _t(e, "string");
  return ye(i) == "symbol" ? i : i + "";
}
function _t(e, i) {
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
  extends: bt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ve(kt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, xt = ["data-p"];
function $t(e, i, d, s, v, P) {
  return g(), m("span", ae({
    class: e.cx("root"),
    "data-p": P.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (g(), fe(Je(e.$slots.icon), ae({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (g(), m("span", ae({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : D("", !0), e.value != null || e.$slots.default ? Ae(e.$slots, "default", {
    key: 2
  }, function() {
    return [y("span", ae({
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
}, Et = { class: "kx-header-stat" }, Dt = { class: "kx-header-stat-label" }, Mt = /* @__PURE__ */ be({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (i, d) => e.items.length ? (g(), m("span", Ct, [
      (g(!0), m(F, null, he(e.items, (s, v) => (g(), m(F, { key: v }, [
        v ? (g(), m("span", St, " · ")) : D("", !0),
        y("span", Et, [
          s.icon ? (g(), fe(a(M), {
            key: 0,
            icon: s.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : D("", !0),
          y("span", Dt, N(s.value.toLocaleString()) + " " + N(s.label), 1)
        ])
      ], 64))), 128))
    ])) : D("", !0);
  }
}), jt = 2e3;
function je(e) {
  const i = e.margin ?? 8, d = e.gap ?? 4, s = Math.max(0, e.viewportWidth), v = Math.max(0, e.viewportHeight), P = Math.max(0, s - i * 2), S = Math.min(Math.max(0, e.requestedWidth), P), H = e.align === "right" ? e.anchor.right - S : e.anchor.left, O = Math.max(i, Math.min(H, s - i - S)), x = Math.max(0, v - e.anchor.bottom - d - i), b = Math.max(0, e.anchor.top - d - i), w = x < e.requestedMaxHeight && b > x ? "above" : "below", c = w === "above" ? b : x, E = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), c)), L = Math.min(Math.max(0, e.panelHeight ?? E), E), $ = w === "above" ? e.anchor.top - d - L : e.anchor.bottom + d, K = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(O - K.left),
    width: Math.round(S),
    maxHeight: E,
    side: w,
    top: Math.round($ - K.top)
  };
}
const Lt = /* @__PURE__ */ be({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: jt }
  },
  emits: ["update:open"],
  setup(e, { emit: i }) {
    const d = e, s = i, v = j(null), P = j({ position: "fixed", visibility: "hidden" });
    function S() {
      const $ = d.anchor, K = v.value;
      if (!$ || !K) return;
      const ee = $.getBoundingClientRect(), R = d.width === "anchor" ? Math.max(d.minWidth, ee.width) : Math.max(d.minWidth, d.width), T = {
        anchor: ee,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: R,
        requestedMaxHeight: d.maxHeight,
        align: d.align,
        gap: d.gap
      }, z = je(T);
      Object.assign(K.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${z.width}px`,
        maxHeight: `${z.maxHeight}px`,
        visibility: "hidden"
      });
      const B = K.getBoundingClientRect(), q = je({
        ...T,
        containingBlockOrigin: { left: B.left, top: B.top },
        panelHeight: B.height
      }), Y = {
        position: "fixed",
        left: `${q.left}px`,
        top: `${q.top}px`,
        width: `${q.width}px`,
        maxHeight: `${q.maxHeight}px`,
        "--anchored-panel-available-height": `${q.maxHeight}px`,
        margin: "0",
        zIndex: String(d.zIndex),
        visibility: "visible"
      };
      P.value = Y;
    }
    let H = null, O = !1;
    function x() {
      O || !d.open || (O = !0, requestAnimationFrame(() => {
        O = !1, d.open && S();
      }));
    }
    function b() {
      typeof ResizeObserver > "u" || (H = new ResizeObserver(x), v.value && H.observe(v.value), d.anchor && H.observe(d.anchor));
    }
    function w() {
      H?.disconnect(), H = null, O = !1;
    }
    ve(() => d.open, async ($) => {
      w(), $ && (P.value = { position: "fixed", visibility: "hidden" }, await _e(), S(), b());
    }, { immediate: !0 });
    function c($) {
      if (!d.open) return;
      const K = $.composedPath();
      v.value && K.includes(v.value) || d.anchor && K.includes(d.anchor) || s("update:open", !1);
    }
    function E($) {
      d.open && $.key === "Escape" && s("update:open", !1);
    }
    function L() {
      d.open && S();
    }
    return document.addEventListener("click", c), document.addEventListener("keydown", E), window.addEventListener("resize", L), window.addEventListener("scroll", L, !0), me(() => {
      w(), document.removeEventListener("click", c), document.removeEventListener("keydown", E), window.removeEventListener("resize", L), window.removeEventListener("scroll", L, !0);
    }), ($, K) => e.open ? (g(), m("div", {
      key: 0,
      ref_key: "panel",
      ref: v,
      class: "anchored-panel",
      style: Fe(P.value)
    }, [
      Ae($.$slots, "default")
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
  const i = j(!1), d = j(""), s = j(""), v = j([]), P = j(""), S = j([]), H = j([]), O = j("");
  let x = !0;
  const b = Pt();
  let w = !1, c = !1;
  const E = ue(() => {
    const l = P.value.trim().toLowerCase();
    return l ? v.value.filter(
      (n) => (n.name || "").toLowerCase().includes(l) || (n.description || "").toLowerCase().includes(l)
    ) : v.value;
  });
  function L(l) {
    const n = l.toLowerCase();
    return n.includes("no implementation") || n.includes("no engine") || n.includes("contract unavailable") || n.includes("not found") && n.includes("binding");
  }
  async function $() {
    if (!x) return !1;
    const l = b();
    i.value = !0, d.value = "", s.value = "";
    try {
      const { data: n } = await G.get("/api/v1/knowledge/list");
      if (!n?.success) {
        const _ = n?.error || "failed to load knowledge bases";
        if (L(_))
          return l() && x && (s.value = Pe), !1;
        throw new Error(_);
      }
      return l() && x && (v.value = n.items || []), !0;
    } catch (n) {
      const _ = se(n, "could not load knowledge bases");
      return l() && x && (L(_) ? s.value = Pe : d.value = _), !1;
    } finally {
      l() && (i.value = !1, x && c && !w && te());
    }
  }
  async function K() {
    try {
      const { data: l } = await G.get("/api/v1/knowledge/models");
      S.value = l?.success ? l.models || [] : [];
    } catch {
      S.value = [];
    }
  }
  async function ee() {
    try {
      const { data: l } = await G.get("/api/v1/knowledge/engines");
      H.value = l?.success ? l.engines || [] : [];
    } catch {
      H.value = [];
    }
  }
  function R(l) {
    return H.value.find((n) => n.kb_type === l);
  }
  async function T() {
    O.value = "";
    try {
      const [l, n] = await Promise.all([
        G.get("/api/v1/knowledge/engines"),
        G.get("/api/v1/knowledge/models")
      ]);
      if (!l.data?.success) throw new Error(l.data?.error || "Could not load knowledge engines.");
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load embedding models.");
      H.value = l.data.engines || [], S.value = n.data.models || [];
    } catch (l) {
      H.value = [], S.value = [], O.value = se(l, "Could not load knowledge engines.");
    }
  }
  function z(l) {
    return !!l && typeof l == "object" && !Array.isArray(l);
  }
  function B(l) {
    if (z(l)) return l;
    if (!(typeof l != "string" || !l))
      try {
        const n = JSON.parse(l);
        return z(n) ? n : void 0;
      } catch {
        return;
      }
  }
  function q(l, n) {
    if (!n) return;
    let _ = l;
    for (const t of n.split(".")) {
      if (!z(_)) return;
      _ = _[t];
    }
    return _;
  }
  function Y(l, n) {
    if (!Array.isArray(n)) return [];
    const _ = [];
    for (const t of n) {
      const u = q(l, t.path), f = typeof u == "number" ? u : Number(u || 0);
      f < (t.min ?? 0) || _.push({ icon: t.icon, value: f, label: String(f === 1 ? t.singular : t.plural) });
    }
    return _;
  }
  function U(l, n) {
    return Object.prototype.hasOwnProperty.call(l, n);
  }
  function re(l, n) {
    return Le.some((_) => U(l, _)) ? !0 : Array.isArray(n) ? n.some((_) => {
      const t = _.path || "";
      return t !== "" && U(l, t.split(".")[0]);
    }) : !1;
  }
  function ne(l, n, _) {
    const t = String(n.kb_type || _ || ""), u = R(t), f = {
      kb_type: t || _,
      badge: u?.badge
    };
    for (const k of Le) {
      const C = n[k];
      U(n, k) && typeof C == "number" && (f[k] = C);
    }
    return (re(n, u?.stats_spec) || U(n, "kb_type")) && (f.stat_items = Y({ ...l, ...n }, u?.stats_spec)), f;
  }
  function Q(l, n, _ = []) {
    const t = {};
    typeof n.title == "string" && (t.name = n.title), typeof n.comment == "string" && (t.description = n.comment), typeof n.icon == "string" && (t.icon = n.icon), typeof n.status == "string" && (t.status = n.status), typeof n.auto_summary == "string" && (t.auto_summary = n.auto_summary), typeof n.auto_description == "string" && (t.auto_description = n.auto_description), typeof n.kb_type == "string" && (t.kb_type = n.kb_type), Object.assign(t, ne(l, n, t.kb_type || l.kb_type));
    const u = { ...l, ...t };
    for (const f of _) {
      const k = f === "title" ? "name" : f;
      delete u[k];
    }
    return u;
  }
  const oe = j(null);
  function X(l, n) {
    const _ = B(n.meta) || {}, t = n.deleted || [];
    v.value = v.value.map((u) => u.id === l ? Q(u, _, t) : u), e.value?.id === l && (e.value = Q(e.value, _, t));
  }
  function I() {
    x = !1, c = !1, pe?.(), oe.value?.(), oe.value = null;
  }
  async function te() {
    if (x) {
      if (w || i.value) {
        c = !0;
        return;
      }
      w = !0;
      try {
        do
          c = !1, await $();
        while (x && c);
      } finally {
        w = !1;
      }
    }
  }
  const pe = Ke("@message", (l) => {
    const n = nt(l, void 0, $e);
    if (!n) return;
    const _ = v.value.some((t) => t.id === n.component_id);
    (_ || e.value?.id === n.component_id) && X(n.component_id, n), !_ && typeof n.meta.kb_type == "string" && n.meta.kb_type && te();
  });
  return me(I), {
    loading: i,
    error: d,
    notice: s,
    kbs: v,
    query: P,
    filtered: E,
    models: S,
    engines: H,
    dialogLoadError: O,
    load: $,
    loadModels: K,
    loadEngines: ee,
    engineFor: R,
    loadDialogCatalog: T,
    detailUnsub: oe,
    applyComponentMetaEvent: X,
    clearComponentSubscriptions: I
  };
}
function Ht({ detail: e, detailUnsub: i, kbs: d, engines: s, engineFor: v, applyComponentMetaEvent: P, route: S, navigate: H, loadEngines: O }) {
  const x = j(!1), b = j(""), w = j(null);
  let c = null, E = 0, L = 0;
  const $ = ue(() => e.value ? v(e.value.kb_type || "")?.manage_ui_id : void 0), K = ue(() => (e.value ? v(e.value.kb_type || "")?.manage_views : void 0) || []), ee = ue(() => K.value.length > 1), R = j(""), T = j("");
  let z = !1, B = 0;
  function q() {
    const t = e.value?.kb_type;
    return t ? `kx:kb:detail-view:${t}` : null;
  }
  ve(K, (t) => {
    if (!t.length) {
      R.value = "";
      return;
    }
    const u = t.map((C) => C.id);
    let f = "";
    try {
      const C = q();
      f = C && localStorage.getItem(C) || "";
    } catch {
    }
    const k = u.includes(f) ? f : u[0];
    k !== R.value && (R.value = k);
  }, { immediate: !0 });
  function Y() {
    const t = { kb_id: e.value?.id, route: T.value };
    return R.value && (t.view = R.value), JSON.stringify(t);
  }
  function U(t) {
    if (t !== R.value) {
      R.value = t;
      try {
        const u = q();
        u && localStorage.setItem(u, t);
      } catch {
      }
      try {
        c?.setAttribute("config", Y());
      } catch {
      }
    }
  }
  function re(t) {
    t.stopPropagation();
    const u = e.value?.id;
    if (!u || z) return;
    const f = typeof t.detail == "string" ? t.detail : t.detail?.path ?? t.detail?.route ?? "", k = String(f || "").replace(/^\/+/, "");
    T.value = k, X(k ? `${u}/${k}` : u);
  }
  function ne(t) {
    t.stopPropagation();
  }
  function Q(t = !0) {
    t && L++, c && (c.removeEventListener("kb-changed", ne), c.removeEventListener("navigate", re), c.remove(), c = null);
  }
  async function oe() {
    const t = ++L;
    Q(!1);
    const u = $.value, f = w.value, k = e.value?.id;
    if (!u || !f || !k) return;
    try {
      await Ne(u, { timeoutMs: 8e3 });
    } catch {
    }
    if (t !== L || e.value?.id !== k || $.value !== u || w.value !== f) return;
    f.replaceChildren();
    const C = document.createElement(u);
    try {
      C.setAttribute("config", Y());
    } catch {
    }
    C.addEventListener("kb-changed", ne), C.addEventListener("navigate", re), f.appendChild(C), c = C;
  }
  function X(t) {
    z || H(t);
  }
  function I(t, u) {
    return E === t && e.value?.id === u;
  }
  async function te(t, u = !0) {
    const f = ++E, k = t.id;
    e.value = { ...t }, i.value?.(), i.value = k ? ot(k, (C) => P(k, C), $e) : null, b.value = "", x.value = !0, Q(), u && X(k);
    try {
      const { data: C } = await G.get(`/api/v1/knowledge/${k}`);
      if (!I(f, k)) return;
      C?.success ? e.value = { ...e.value, ...C } : b.value = C?.error || "could not load knowledge base";
    } catch (C) {
      if (!I(f, k)) return;
      b.value = se(C, "could not load knowledge base");
    } finally {
      I(f, k) && (x.value = !1);
    }
    I(f, k) && (s.value.length || await O(), I(f, k) && (await _e(), I(f, k) && await oe()));
  }
  async function pe() {
    const t = e.value?.id;
    if (!t) return;
    const u = ++E;
    b.value = "";
    try {
      const { data: f } = await G.get(`/api/v1/knowledge/${t}`);
      if (!I(u, t)) return;
      f?.success ? e.value = { ...e.value, ...f } : b.value = f?.error || "could not load knowledge base";
    } catch (f) {
      if (!I(u, t)) return;
      b.value = se(f, "could not load knowledge base");
    }
    if (I(u, t) && (await _e(), !!I(u, t)))
      try {
        c?.setAttribute("config", Y());
      } catch {
      }
  }
  function l() {
    const t = e.value?.id;
    if (!t || !T.value) {
      n();
      return;
    }
    H({ path: t, back: { within: t } });
  }
  function n(t = !0) {
    E++, Q(), i.value?.(), i.value = null, e.value = null, T.value = "", t && X("");
  }
  async function _(t) {
    const u = ++B, f = String(t || "").split("/").filter(Boolean), k = f[0] || "", C = f.slice(1).join("/");
    z = !0;
    try {
      if (u !== B) return;
      if (!k)
        e.value && n(!1);
      else if (e.value?.id !== k) {
        T.value = C;
        const ke = d.value.find((ge) => ge.id === k);
        if (await te(ke || { id: k }, !1), u !== B) return;
      } else if (C !== T.value) {
        T.value = C;
        try {
          c?.setAttribute("config", Y());
        } catch {
        }
      }
    } finally {
      u === B && (z = !1);
    }
  }
  return ve(S, (t) => {
    _(t);
  }), me(() => {
    Q(), i.value?.(), i.value = null;
  }), {
    detailLoading: x,
    detailError: b,
    detailHost: w,
    detailManageTag: $,
    detailViews: K,
    detailHasViews: ee,
    detailView: R,
    innerRoute: T,
    setDetailView: U,
    openDetail: te,
    refreshOpenDetail: pe,
    closeDetail: n,
    backDetail: l,
    applyRoute: _,
    pushRoute: X,
    unmountDetailWc: Q
  };
}
const At = { class: "kx" }, Kt = { class: "kx-head" }, Nt = { class: "kx-head-icon" }, Rt = { class: "kx-head-actions" }, Tt = { class: "kx-count" }, zt = { class: "kx-search" }, It = {
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
}, on = ["title", "aria-label"], an = { class: "kx-bar" }, sn = { class: "kx-bar-l" }, rn = ["title"], ln = {
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
    const i = (p) => (p ?? 0).toLocaleString();
    function d(p) {
      if (p === "neutral") return "secondary";
      if (p === "warning") return "warn";
      if (p === "info" || p === "success" || p === "danger") return p;
    }
    const s = j(null), v = Ot({ detail: s }), {
      loading: P,
      error: S,
      notice: H,
      kbs: O,
      query: x,
      filtered: b,
      models: w,
      engines: c,
      dialogLoadError: E,
      load: L,
      loadEngines: $,
      engineFor: K,
      loadDialogCatalog: ee,
      detailUnsub: R,
      applyComponentMetaEvent: T
    } = v, z = at(), B = it(), q = Ht({
      detail: s,
      detailUnsub: R,
      kbs: O,
      engines: c,
      engineFor: K,
      applyComponentMetaEvent: T,
      route: ue(() => z.value.route),
      navigate: (p) => B("navigate", p),
      loadEngines: $
    }), {
      detailLoading: Y,
      detailError: U,
      detailHost: re,
      detailManageTag: ne,
      detailViews: Q,
      detailHasViews: oe,
      detailView: X,
      setDetailView: I,
      openDetail: te,
      refreshOpenDetail: pe,
      closeDetail: l,
      backDetail: n,
      applyRoute: _
    } = q;
    function t(p) {
      s.value ? U.value = p : S.value = p;
    }
    const u = j(!1), f = j(null);
    async function k() {
      f.value = null, await ee(), u.value = !0;
    }
    async function C(p) {
      S.value = "", U.value = "", E.value = "", c.value.length || await $();
      try {
        const { data: r } = await G.get(`/api/v1/knowledge/${p.id}`);
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
          const { data: r } = await G.get(`/api/v1/knowledge/${p}`);
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
        t(""), S.value = "";
        try {
          const { data: o } = await G.delete(`/api/v1/knowledge/${p.id}`);
          if (!o?.success) throw new Error(o?.error || "delete failed");
          ze(p.id, o), s.value?.id === p.id && l(), await L();
        } catch (o) {
          t(se(o, "delete failed"));
        }
      }
    }
    const le = j(!1), we = j(null), de = j(null);
    function Ce(p) {
      we.value = p, le.value = !0;
    }
    function Se() {
      le.value = !1, we.value = null;
    }
    const ce = j(!1), Ee = j(null);
    function De(p) {
      p.key === "Escape" && le.value && Se();
    }
    Ge(() => {
      window.addEventListener("keydown", De);
    }), me(() => {
      window.removeEventListener("keydown", De);
    });
    async function Te() {
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
      le.value && de.value && await Te();
    }), Be(async () => {
      try {
        await Promise.all([L(), $(), pe()]), !s.value && z.value.route && await _(z.value.route);
      } catch (p) {
        S.value = se(p, "host API unavailable");
      }
    });
    const { acceptDeletion: ze } = vt(O, (p) => p.id, (p) => {
      s.value?.id === p && l();
    }, L);
    return (p, r) => (g(), m("div", At, [
      s.value ? (g(), m(F, { key: 1 }, [
        y("div", an, [
          y("div", sn, [
            y("button", {
              class: "kx-back",
              onClick: r[2] || (r[2] = (o) => a(n)())
            }, [
              h(a(M), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              r[16] || (r[16] = J(" Back", -1))
            ]),
            y("h1", {
              class: "kx-title",
              title: s.value.name || "(untitled)"
            }, N(s.value.name || "(untitled)"), 9, rn),
            s.value.badge ? (g(), fe(a(xe), {
              key: 0,
              severity: d(s.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: V(() => [
                h(a(M), {
                  icon: s.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                J(N(s.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : D("", !0),
            h(Mt, {
              items: s.value.stat_items || []
            }, null, 8, ["items"]),
            s.value.auto_summary || s.value.auto_description ? (g(), m("span", ln, [
              h(a(Z), {
                ref_key: "summaryAnchor",
                ref: Ee,
                severity: "secondary",
                outlined: "",
                class: W(["kx-summary-btn", { on: ce.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ce.value,
                onClick: r[3] || (r[3] = ie((o) => ce.value = !ce.value, ["stop"]))
              }, {
                icon: V(({ class: o }) => [
                  h(a(M), {
                    icon: "tabler:sparkles",
                    class: W(o),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              h(Lt, {
                open: ce.value,
                "onUpdate:open": r[5] || (r[5] = (o) => ce.value = o),
                anchor: Ee.value,
                width: 340
              }, {
                default: V(() => [
                  y("div", {
                    class: "kx-summary-pop",
                    onClick: r[4] || (r[4] = ie(() => {
                    }, ["stop"]))
                  }, [
                    y("div", dn, [
                      h(a(M), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      r[17] || (r[17] = y("span", null, "About this knowledge base", -1))
                    ]),
                    s.value.auto_summary ? (g(), m("p", cn, N(s.value.auto_summary), 1)) : D("", !0),
                    s.value.auto_description ? (g(), m("p", un, N(s.value.auto_description), 1)) : D("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : D("", !0)
          ]),
          y("div", pn, [
            a(oe) ? (g(), m("div", gn, [
              (g(!0), m(F, null, he(a(Q), (o) => (g(), m("button", {
                key: o.id,
                class: W(["kx-viewseg-btn", { on: a(X) === o.id }]),
                role: "tab",
                "aria-selected": a(X) === o.id,
                onClick: (A) => a(I)(o.id)
              }, [
                o.icon ? (g(), fe(a(M), {
                  key: 0,
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : D("", !0),
                J(" " + N(o.label), 1)
              ], 10, fn))), 128))
            ])) : D("", !0),
            h(a(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: r[6] || (r[6] = (o) => C(s.value))
            }, {
              icon: V(({ class: o }) => [
                h(a(M), {
                  icon: "tabler:pencil",
                  class: W(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(a(Z), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: r[7] || (r[7] = (o) => Ce(s.value))
            }, {
              icon: V(({ class: o }) => [
                h(a(M), {
                  icon: "tabler:share",
                  class: W(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            h(a(Z), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: r[8] || (r[8] = (o) => ge(s.value))
            }, {
              icon: V(({ class: o }) => [
                h(a(M), {
                  icon: "tabler:trash",
                  class: W(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(U) ? (g(), m("div", vn, N(a(U)), 1)) : D("", !0),
        y("div", {
          class: W(["kx-body", { "kx-body-bleed": a(ne) }])
        }, [
          a(Y) ? (g(), m("div", yn, [
            h(a(M), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            r[18] || (r[18] = J(" Loading… ", -1))
          ])) : (g(), m(F, { key: 1 }, [
            a(ne) ? D("", !0) : (g(), m(F, { key: 0 }, [
              y("div", mn, [
                s.value.description ? (g(), m("div", hn, N(s.value.description), 1)) : D("", !0),
                y("div", bn, [
                  s.value.embedding_model ? (g(), m("span", kn, [
                    h(a(M), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    J(N(s.value.embedding_model), 1)
                  ])) : D("", !0)
                ])
              ]),
              s.value.auto_summary ? (g(), m("div", wn, [
                r[19] || (r[19] = y("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                J(" " + N(s.value.auto_summary), 1)
              ])) : D("", !0)
            ], 64)),
            y("div", {
              ref_key: "detailHost",
              ref: re,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (g(), m(F, { key: 0 }, [
        y("header", Kt, [
          y("div", Nt, [
            h(a(M), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          r[10] || (r[10] = y("div", { class: "kx-head-text" }, [
            y("h1", { class: "kx-head-title" }, "Knowledge"),
            y("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          y("div", Rt, [
            y("span", Tt, N(a(O).length) + " knowledge base" + N(a(O).length !== 1 ? "s" : ""), 1),
            y("div", zt, [
              h(a(M), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Ye(y("input", {
                "onUpdate:modelValue": r[0] || (r[0] = (o) => Qe(x) ? x.value = o : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Xe, a(x)]
              ])
            ]),
            h(a(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: k
            }, {
              icon: V(({ class: o }) => [
                h(a(M), {
                  icon: "tabler:plus",
                  class: W(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(S) ? (g(), m("div", It, N(a(S)), 1)) : D("", !0),
        a(H) ? (g(), m("div", Bt, [
          h(a(M), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          r[11] || (r[11] = y("span", null, [
            y("strong", null, "No knowledge engine installed."),
            J(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : D("", !0),
        y("div", qt, [
          a(P) && !a(O).length ? (g(), m("div", Vt, [
            h(a(M), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            r[12] || (r[12] = J(" Loading… ", -1))
          ])) : a(O).length ? a(b).length ? (g(), m("div", Ft, [
            (g(!0), m(F, null, he(a(b), (o) => (g(), m("div", {
              key: o.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${o.name || "knowledge base"}`,
              onClick: (A) => !o.deleting_at && a(te)(o),
              onKeydown: [
                Me((A) => !o.deleting_at && a(te)(o), ["enter"]),
                Me(ie((A) => !o.deleting_at && a(te)(o), ["prevent"]), ["space"])
              ]
            }, [
              h(ft, {
                state: o,
                onRetry: (A) => ge(o)
              }, null, 8, ["state", "onRetry"]),
              y("div", Yt, [
                y("span", Qt, [
                  h(a(M), {
                    icon: o.icon || o.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                y("div", Xt, [
                  y("div", {
                    class: "kx-card-name",
                    title: o.name || "(untitled)"
                  }, N(o.name || "(untitled)"), 9, Zt),
                  o.badge ? (g(), m("div", en, [
                    h(a(xe), {
                      severity: d(o.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: V(() => [
                        h(a(M), {
                          icon: o.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        J(N(o.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : D("", !0)
                ]),
                y("div", {
                  class: "kx-card-actions",
                  onClick: r[1] || (r[1] = ie(() => {
                  }, ["stop"]))
                }, [
                  h(a(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${o.name}`,
                    onClick: (A) => !o.deleting_at && C(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: V(({ class: A }) => [
                      h(a(M), {
                        icon: "tabler:pencil",
                        class: W(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  h(a(Z), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${o.name}`,
                    onClick: (A) => Ce(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: V(({ class: A }) => [
                      h(a(M), {
                        icon: "tabler:share",
                        class: W(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  h(a(Z), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${o.name}`,
                    onClick: (A) => ge(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: V(({ class: A }) => [
                      h(a(M), {
                        icon: "tabler:trash",
                        class: W(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              y("div", tn, N(o.description || "No description"), 1),
              o.stat_items && o.stat_items.length ? (g(), m("div", nn, [
                (g(!0), m(F, null, he(o.stat_items, (A, Ie) => (g(), m("span", {
                  key: Ie,
                  class: "kx-stat",
                  title: `${i(A.value)} ${A.label}`,
                  "aria-label": `${i(A.value)} ${A.label}`
                }, [
                  A.icon ? (g(), fe(a(M), {
                    key: 0,
                    icon: A.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : D("", !0),
                  J(N(i(A.value)), 1)
                ], 8, on))), 128))
              ])) : D("", !0)
            ], 40, Gt))), 128))
          ])) : (g(), m("div", Jt, [...r[15] || (r[15] = [
            y("div", { class: "kx-empty-title" }, "No matches", -1),
            y("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (g(), m("div", Wt, [
            y("div", Ut, [
              h(a(M), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            r[13] || (r[13] = y("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            r[14] || (r[14] = y("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            h(a(Z), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: k
            }, {
              icon: V(({ class: o }) => [
                h(a(M), {
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
      h(We, {
        open: u.value,
        api: a(G),
        engines: a(c),
        models: a(w),
        target: f.value,
        "load-error": a(E),
        onRetry: a(ee),
        onClose: r[9] || (r[9] = (o) => u.value = !1),
        onSaved: ke
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (g(), m("div", {
        key: 2,
        ref_key: "shareHost",
        ref: de
      }, null, 512)) : D("", !0)
    ]));
  }
}), xn = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, $n = {
  wippy: xn
};
class Cn extends qe {
  static get wippyConfig() {
    return {
      propsSchema: $n.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: st
    };
  }
  static get vueConfig() {
    return { rootComponent: _n, plugins: [Ue] };
  }
}
et(import.meta.url, Cn);
//# sourceMappingURL=index.js.map
