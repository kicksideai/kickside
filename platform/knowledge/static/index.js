import { u as qe, W as Ve } from "./index-D52CRMw6.js";
import { B as Oe, s as He, a as X, e as ne, f as We, _ as Ue, P as Je } from "./KbDialog.vue_vue_type_script_setup_true_lang-phDmIDoa.js";
import { openBlock as g, createElementBlock as y, mergeProps as ie, createElementVNode as h, defineComponent as be, computed as ue, withModifiers as se, Fragment as ee, createTextVNode as Z, toDisplayString as R, createCommentVNode as D, createVNode as _, unref as a, watch as ve, onBeforeUnmount as me, createBlock as fe, resolveDynamicComponent as Fe, renderSlot as Ae, renderList as he, ref as M, nextTick as we, normalizeStyle as Ge, onMounted as Ye, withDirectives as Qe, isRef as Xe, vModelText as Ze, withCtx as W, normalizeClass as U, withKeys as De } from "vue";
import { on as Ke, api as J, host as Ne, loadByTagName as Re, define as et } from "@wippy-fe/proxy";
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
}, Ie = {
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
function pt(e, i, c, s, m, L) {
  return g(), y("div", ie({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(g(), y("svg", ie({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: L.svgStyle
  }, e.ptm("spin")), [h("circle", ie({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, ut)], 16))], 16);
}
Ie.render = pt;
const gt = { key: 0 }, ft = /* @__PURE__ */ be({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const i = e, c = ue(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (s, m) => e.state.deleting_at ? (g(), y("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: m[1] || (m[1] = se(() => {
      }, ["stop"])),
      onKeydown: m[2] || (m[2] = se(() => {
      }, ["stop"]))
    }, [
      c.value ? (g(), y(ee, { key: 0 }, [
        h("span", null, [
          m[3] || (m[3] = Z("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (g(), y("span", gt, ": " + R(e.state.deletion_job.last_error), 1)) : D("", !0)
        ]),
        _(a(X), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: m[0] || (m[0] = se((L) => s.$emit("retry"), ["stop"]))
        })
      ], 64)) : (g(), y(ee, { key: 1 }, [
        _(a(Ie), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        m[4] || (m[4] = h("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : D("", !0);
  }
});
function vt(e, i, c, s) {
  let m = !0;
  const L = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Map();
  function P(v, k) {
    const b = e.value.find((I) => i(I) === v), d = C.get(v), w = k?.job_id || d?.deletion_job_id || b?.deletion_job_id, B = d ? d.deletion_job_id : b?.deleting_at ? b.deletion_job_id : void 0;
    if ((d || b?.deleting_at) && w === B) return;
    const K = {
      deleting_at: d?.deleting_at || b?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: w
    };
    C.set(v, K), b && (Object.assign(b, K), b.deletion_job = void 0);
  }
  async function O(v) {
    const k = i(v), b = C.get(k), d = () => m && e.value.includes(v) && C.get(k) === b;
    try {
      const { data: w } = await J.get(`/api/v1/components/${encodeURIComponent(k)}`);
      if (!w?.success) throw new Error(ne(w, "Could not read deletion progress"));
      d() && (v.deleting_at = b?.deleting_at || w.deleting_at, v.deletion_job_id = w.deletion_job_id, b && (b.deletion_job_id = v.deletion_job_id), v.deletion_job = w.deletion_job ?? null);
    } catch (w) {
      d() && Ne.handleError("other", { message: ne(w, "Could not read deletion progress") });
    }
  }
  let S = [];
  const N = ve(() => e.value, (v, k = []) => {
    const b = v.filter((d) => !L.has(i(d)));
    for (const d of k)
      L.has(i(d)) || b.some((w) => i(w) === i(d)) || (c?.(i(d)), d.deleting_at && s?.(i(d)));
    if (b.length !== v.length) {
      e.value = b;
      return;
    }
    for (const d of v) {
      const w = C.get(i(d));
      w && (d.deletion_job_id !== w.deletion_job_id && (d.deletion_job = void 0), Object.assign(d, w));
      const B = k.find((K) => i(K) === i(d));
      d.deletion_job === void 0 && B?.deletion_job_id === d.deletion_job_id && (d.deletion_job = B?.deletion_job), d.deleting_at && !S.includes(d) && O(d);
    }
    S = v;
  }, { immediate: !0 }), A = Ke("@message", (v) => {
    const k = tt(v);
    if (!k) return;
    const b = e.value.find((d) => i(d) === k.component_id);
    k.event === "component.deleted" ? (b && !L.has(k.component_id) && (c?.(k.component_id), s?.(k.component_id)), L.add(k.component_id), C.delete(k.component_id), e.value = e.value.filter((d) => i(d) !== k.component_id)) : b && P(k.component_id, { job_id: k.deletion_job_id });
  });
  return me(() => {
    m = !1, N(), typeof A == "function" && A();
  }), { acceptDeletion: P };
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
function kt(e, i, c) {
  return (i = _t(i)) in e ? Object.defineProperty(e, i, { value: c, enumerable: !0, configurable: !0, writable: !0 }) : e[i] = c, e;
}
function _t(e) {
  var i = wt(e, "string");
  return ye(i) == "symbol" ? i : i + "";
}
function wt(e, i) {
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
  extends: bt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return We(kt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, xt = ["data-p"];
function $t(e, i, c, s, m, L) {
  return g(), y("span", ie({
    class: e.cx("root"),
    "data-p": L.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (g(), fe(Fe(e.$slots.icon), ie({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (g(), y("span", ie({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : D("", !0), e.value != null || e.$slots.default ? Ae(e.$slots, "default", {
    key: 2
  }, function() {
    return [h("span", ie({
      class: e.cx("label")
    }, e.ptm("label")), R(e.value), 17)];
  }) : D("", !0)], 16, xt);
}
xe.render = $t;
const Ct = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, Et = {
  key: 0,
  "aria-hidden": "true"
}, St = { class: "kx-header-stat" }, jt = { class: "kx-header-stat-label" }, Dt = /* @__PURE__ */ be({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (i, c) => e.items.length ? (g(), y("span", Ct, [
      (g(!0), y(ee, null, he(e.items, (s, m) => (g(), y(ee, { key: m }, [
        m ? (g(), y("span", Et, " · ")) : D("", !0),
        h("span", St, [
          s.icon ? (g(), fe(a(j), {
            key: 0,
            icon: s.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : D("", !0),
          h("span", jt, R(s.value.toLocaleString()) + " " + R(s.label), 1)
        ])
      ], 64))), 128))
    ])) : D("", !0);
  }
}), Mt = 2e3;
function Me(e) {
  const i = e.margin ?? 8, c = e.gap ?? 4, s = Math.max(0, e.viewportWidth), m = Math.max(0, e.viewportHeight), L = Math.max(0, s - i * 2), C = Math.min(Math.max(0, e.requestedWidth), L), P = e.align === "right" ? e.anchor.right - C : e.anchor.left, O = Math.max(i, Math.min(P, s - i - C)), S = Math.max(0, m - e.anchor.bottom - c - i), N = Math.max(0, e.anchor.top - c - i), A = S < e.requestedMaxHeight && N > S ? "above" : "below", v = A === "above" ? N : S, k = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), v)), b = Math.min(Math.max(0, e.panelHeight ?? k), k), d = A === "above" ? e.anchor.top - c - b : e.anchor.bottom + c, w = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(O - w.left),
    width: Math.round(C),
    maxHeight: k,
    side: A,
    top: Math.round(d - w.top)
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
    zIndex: { default: Mt }
  },
  emits: ["update:open"],
  setup(e, { emit: i }) {
    const c = e, s = i, m = M(null), L = M({ position: "fixed", visibility: "hidden" });
    function C() {
      const d = c.anchor, w = m.value;
      if (!d || !w) return;
      const B = d.getBoundingClientRect(), K = c.width === "anchor" ? Math.max(c.minWidth, B.width) : Math.max(c.minWidth, c.width), I = {
        anchor: B,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: K,
        requestedMaxHeight: c.maxHeight,
        align: c.align,
        gap: c.gap
      }, T = Me(I);
      Object.assign(w.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${T.width}px`,
        maxHeight: `${T.maxHeight}px`,
        visibility: "hidden"
      });
      const q = w.getBoundingClientRect(), V = Me({
        ...I,
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
      L.value = G;
    }
    let P = null, O = !1;
    function S() {
      O || !c.open || (O = !0, requestAnimationFrame(() => {
        O = !1, c.open && C();
      }));
    }
    function N() {
      typeof ResizeObserver > "u" || (P = new ResizeObserver(S), m.value && P.observe(m.value), c.anchor && P.observe(c.anchor));
    }
    function A() {
      P?.disconnect(), P = null, O = !1;
    }
    ve(() => c.open, async (d) => {
      A(), d && (L.value = { position: "fixed", visibility: "hidden" }, await we(), C(), N());
    }, { immediate: !0 });
    function v(d) {
      if (!c.open) return;
      const w = d.composedPath();
      m.value && w.includes(m.value) || c.anchor && w.includes(c.anchor) || s("update:open", !1);
    }
    function k(d) {
      c.open && d.key === "Escape" && s("update:open", !1);
    }
    function b() {
      c.open && C();
    }
    return document.addEventListener("click", v), document.addEventListener("keydown", k), window.addEventListener("resize", b), window.addEventListener("scroll", b, !0), me(() => {
      A(), document.removeEventListener("click", v), document.removeEventListener("keydown", k), window.removeEventListener("resize", b), window.removeEventListener("scroll", b, !0);
    }), (d, w) => e.open ? (g(), y("div", {
      key: 0,
      ref_key: "panel",
      ref: m,
      class: "anchored-panel",
      style: Ge(L.value)
    }, [
      Ae(d.$slots, "default")
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
  const i = M(!1), c = M(""), s = M(""), m = M([]), L = M(""), C = M([]), P = M([]), O = M("");
  let S = !0;
  const N = Pt();
  let A = !1, v = !1;
  const k = ue(() => {
    const l = L.value.trim().toLowerCase();
    return l ? m.value.filter(
      (n) => (n.name || "").toLowerCase().includes(l) || (n.description || "").toLowerCase().includes(l)
    ) : m.value;
  });
  function b(l) {
    const n = l.toLowerCase();
    return n.includes("no implementation") || n.includes("no engine") || n.includes("contract unavailable") || n.includes("not found") && n.includes("binding");
  }
  async function d() {
    if (!S) return !1;
    const l = N();
    i.value = !0, c.value = "", s.value = "";
    try {
      const { data: n } = await J.get("/api/v1/knowledge/list");
      if (!n?.success) {
        const $ = n?.error || "failed to load knowledge bases";
        if (b($))
          return l() && S && (s.value = Pe), !1;
        throw new Error($);
      }
      return l() && S && (m.value = n.items || []), !0;
    } catch (n) {
      const $ = ne(n, "could not load knowledge bases");
      return l() && S && (b($) ? s.value = Pe : c.value = $), !1;
    } finally {
      l() && (i.value = !1, S && v && !A && te());
    }
  }
  async function w() {
    try {
      const { data: l } = await J.get("/api/v1/knowledge/models");
      C.value = l?.success ? l.models || [] : [];
    } catch {
      C.value = [];
    }
  }
  async function B() {
    try {
      const { data: l } = await J.get("/api/v1/knowledge/engines");
      P.value = l?.success ? l.engines || [] : [];
    } catch {
      P.value = [];
    }
  }
  function K(l) {
    return P.value.find((n) => n.kb_type === l);
  }
  async function I() {
    O.value = "";
    try {
      const [l, n] = await Promise.all([
        J.get("/api/v1/knowledge/engines"),
        J.get("/api/v1/knowledge/models")
      ]);
      if (!l.data?.success) throw new Error(l.data?.error || "Could not load knowledge engines.");
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load embedding models.");
      P.value = l.data.engines || [], C.value = n.data.models || [];
    } catch (l) {
      P.value = [], C.value = [], O.value = ne(l, "Could not load knowledge engines.");
    }
  }
  function T(l) {
    return !!l && typeof l == "object" && !Array.isArray(l);
  }
  function q(l) {
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
  function G(l, n) {
    if (!Array.isArray(n)) return [];
    const $ = [];
    for (const t of n) {
      const u = V(l, t.path), f = typeof u == "number" ? u : Number(u || 0);
      f < (t.min ?? 0) || $.push({ icon: t.icon, value: f, label: String(f === 1 ? t.singular : t.plural) });
    }
    return $;
  }
  function F(l, n) {
    return Object.prototype.hasOwnProperty.call(l, n);
  }
  function re(l, n) {
    return Le.some(($) => F(l, $)) ? !0 : Array.isArray(n) ? n.some(($) => {
      const t = $.path || "";
      return t !== "" && F(l, t.split(".")[0]);
    }) : !1;
  }
  function oe(l, n, $) {
    const t = String(n.kb_type || $ || ""), u = K(t), f = {
      kb_type: t || $,
      badge: u?.badge
    };
    for (const x of Le) {
      const E = n[x];
      F(n, x) && typeof E == "number" && (f[x] = E);
    }
    return (re(n, u?.stats_spec) || F(n, "kb_type")) && (f.stat_items = G({ ...l, ...n }, u?.stats_spec)), f;
  }
  function Y(l, n, $ = []) {
    const t = {};
    typeof n.title == "string" && (t.name = n.title), typeof n.comment == "string" && (t.description = n.comment), typeof n.icon == "string" && (t.icon = n.icon), typeof n.status == "string" && (t.status = n.status), typeof n.auto_summary == "string" && (t.auto_summary = n.auto_summary), typeof n.auto_description == "string" && (t.auto_description = n.auto_description), typeof n.kb_type == "string" && (t.kb_type = n.kb_type), Object.assign(t, oe(l, n, t.kb_type || l.kb_type));
    const u = { ...l, ...t };
    for (const f of $) {
      const x = f === "title" ? "name" : f;
      delete u[x];
    }
    return u;
  }
  const ae = M(null);
  function Q(l, n) {
    const $ = q(n.meta) || {}, t = n.deleted || [];
    m.value = m.value.map((u) => u.id === l ? Y(u, $, t) : u), e.value?.id === l && (e.value = Y(e.value, $, t));
  }
  function z() {
    S = !1, v = !1, pe?.(), ae.value?.(), ae.value = null;
  }
  async function te() {
    if (S) {
      if (A || i.value) {
        v = !0;
        return;
      }
      A = !0;
      try {
        do
          v = !1, await d();
        while (S && v);
      } finally {
        A = !1;
      }
    }
  }
  const pe = Ke("@message", (l) => {
    const n = nt(l, void 0, $e);
    if (!n) return;
    const $ = m.value.some((t) => t.id === n.component_id);
    ($ || e.value?.id === n.component_id) && Q(n.component_id, n), !$ && typeof n.meta.kb_type == "string" && n.meta.kb_type && te();
  });
  return me(z), {
    loading: i,
    error: c,
    notice: s,
    kbs: m,
    query: L,
    filtered: k,
    models: C,
    engines: P,
    dialogLoadError: O,
    load: d,
    loadModels: w,
    loadEngines: B,
    engineFor: K,
    loadDialogCatalog: I,
    detailUnsub: ae,
    applyComponentMetaEvent: Q,
    clearComponentSubscriptions: z
  };
}
function Ht({ detail: e, detailUnsub: i, kbs: c, engines: s, engineFor: m, applyComponentMetaEvent: L, route: C, navigate: P, loadEngines: O }) {
  const S = M(!1), N = M(""), A = M(null);
  let v = null, k = 0, b = 0;
  const d = ue(() => e.value ? m(e.value.kb_type || "")?.manage_ui_id : void 0), w = ue(() => (e.value ? m(e.value.kb_type || "")?.manage_views : void 0) || []), B = ue(() => w.value.length > 1), K = M(""), I = M("");
  let T = !1, q = 0;
  function V() {
    const t = e.value?.kb_type;
    return t ? `kx:kb:detail-view:${t}` : null;
  }
  ve(w, (t) => {
    if (!t.length) {
      K.value = "";
      return;
    }
    const u = t.map((E) => E.id);
    let f = "";
    try {
      const E = V();
      f = E && localStorage.getItem(E) || "";
    } catch {
    }
    const x = u.includes(f) ? f : u[0];
    x !== K.value && (K.value = x);
  }, { immediate: !0 });
  function G() {
    const t = { kb_id: e.value?.id, route: I.value };
    return K.value && (t.view = K.value), JSON.stringify(t);
  }
  function F(t) {
    if (t !== K.value) {
      K.value = t;
      try {
        const u = V();
        u && localStorage.setItem(u, t);
      } catch {
      }
      try {
        v?.setAttribute("config", G());
      } catch {
      }
    }
  }
  function re(t) {
    t.stopPropagation();
    const u = e.value?.id;
    if (!u || T) return;
    const f = typeof t.detail == "string" ? t.detail : t.detail?.path ?? t.detail?.route ?? "", x = String(f || "").replace(/^\/+/, "");
    I.value = x, Q(x ? `${u}/${x}` : u);
  }
  function oe(t) {
    t.stopPropagation();
  }
  function Y(t = !0) {
    t && b++, v && (v.removeEventListener("kb-changed", oe), v.removeEventListener("navigate", re), v.remove(), v = null);
  }
  async function ae() {
    const t = ++b;
    Y(!1);
    const u = d.value, f = A.value, x = e.value?.id;
    if (!u || !f || !x) return;
    try {
      await Re(u, { timeoutMs: 8e3 });
    } catch {
    }
    if (t !== b || e.value?.id !== x || d.value !== u || A.value !== f) return;
    f.replaceChildren();
    const E = document.createElement(u);
    try {
      E.setAttribute("config", G());
    } catch {
    }
    E.addEventListener("kb-changed", oe), E.addEventListener("navigate", re), f.appendChild(E), v = E;
  }
  function Q(t) {
    T || P(t);
  }
  function z(t, u) {
    return k === t && e.value?.id === u;
  }
  async function te(t, u = !0) {
    const f = ++k, x = t.id;
    e.value = { ...t }, i.value?.(), i.value = x ? ot(x, (E) => L(x, E), $e) : null, N.value = "", S.value = !0, Y(), u && Q(x);
    try {
      const { data: E } = await J.get(`/api/v1/knowledge/${x}`);
      if (!z(f, x)) return;
      E?.success ? e.value = { ...e.value, ...E } : N.value = E?.error || "could not load knowledge base";
    } catch (E) {
      if (!z(f, x)) return;
      N.value = ne(E, "could not load knowledge base");
    } finally {
      z(f, x) && (S.value = !1);
    }
    z(f, x) && (s.value.length || await O(), z(f, x) && (await we(), z(f, x) && await ae()));
  }
  async function pe() {
    const t = e.value?.id;
    if (!t) return;
    const u = ++k;
    N.value = "";
    try {
      const { data: f } = await J.get(`/api/v1/knowledge/${t}`);
      if (!z(u, t)) return;
      f?.success ? e.value = { ...e.value, ...f } : N.value = f?.error || "could not load knowledge base";
    } catch (f) {
      if (!z(u, t)) return;
      N.value = ne(f, "could not load knowledge base");
    }
    if (z(u, t) && (await we(), !!z(u, t)))
      try {
        v?.setAttribute("config", G());
      } catch {
      }
  }
  function l() {
    const t = e.value?.id;
    if (!t || !I.value) {
      n();
      return;
    }
    P({ path: t, back: { within: t } });
  }
  function n(t = !0) {
    k++, Y(), i.value?.(), i.value = null, e.value = null, I.value = "", t && Q("");
  }
  async function $(t) {
    const u = ++q, f = String(t || "").split("/").filter(Boolean), x = f[0] || "", E = f.slice(1).join("/");
    T = !0;
    try {
      if (u !== q) return;
      if (!x)
        e.value && n(!1);
      else if (e.value?.id !== x) {
        I.value = E;
        const ke = c.value.find((ge) => ge.id === x);
        if (await te(ke || { id: x }, !1), u !== q) return;
      } else if (E !== I.value) {
        I.value = E;
        try {
          v?.setAttribute("config", G());
        } catch {
        }
      }
    } finally {
      u === q && (T = !1);
    }
  }
  return ve(C, (t) => {
    $(t);
  }), me(() => {
    Y(), i.value?.(), i.value = null;
  }), {
    detailLoading: S,
    detailError: N,
    detailHost: A,
    detailManageTag: d,
    detailViews: w,
    detailHasViews: B,
    detailView: K,
    innerRoute: I,
    setDetailView: F,
    openDetail: te,
    refreshOpenDetail: pe,
    closeDetail: n,
    backDetail: l,
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
}, hn = { class: "kx-stats" }, bn = {
  key: 0,
  class: "kx-stat"
}, kn = /* @__PURE__ */ be({
  __name: "knowledge",
  setup(e) {
    const i = (p) => (p ?? 0).toLocaleString();
    function c(p) {
      if (p === "neutral") return "secondary";
      if (p === "warning") return "warn";
      if (p === "info" || p === "success" || p === "danger") return p;
    }
    const s = M(null), m = Ot({ detail: s }), {
      loading: L,
      error: C,
      notice: P,
      kbs: O,
      query: S,
      filtered: N,
      models: A,
      engines: v,
      dialogLoadError: k,
      load: b,
      loadEngines: d,
      engineFor: w,
      loadDialogCatalog: B,
      detailUnsub: K,
      applyComponentMetaEvent: I
    } = m, T = at(), q = it(), V = Ht({
      detail: s,
      detailUnsub: K,
      kbs: O,
      engines: v,
      engineFor: w,
      applyComponentMetaEvent: I,
      route: ue(() => T.value.route),
      navigate: (p) => q("navigate", p),
      loadEngines: d
    }), {
      detailLoading: G,
      detailError: F,
      detailHost: re,
      detailManageTag: oe,
      detailViews: Y,
      detailHasViews: ae,
      detailView: Q,
      setDetailView: z,
      openDetail: te,
      refreshOpenDetail: pe,
      closeDetail: l,
      backDetail: n,
      applyRoute: $
    } = V;
    function t(p) {
      s.value ? F.value = p : C.value = p;
    }
    const u = M(!1), f = M(null);
    async function x() {
      f.value = null, await B(), u.value = !0;
    }
    async function E(p) {
      C.value = "", F.value = "", k.value = "", v.value.length || await d();
      try {
        const { data: r } = await J.get(`/api/v1/knowledge/${p.id}`);
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
        f.value = null, u.value = !1, t(ne(r, "could not load knowledge base settings"));
      }
    }
    async function ke() {
      u.value = !1;
      const p = s.value?.id;
      if (await b(), p && f.value && f.value.id === p)
        try {
          const { data: r } = await J.get(`/api/v1/knowledge/${p}`);
          r?.success && s.value && s.value.id === p && (s.value = { ...s.value, ...r });
        } catch {
        }
      f.value = null;
    }
    async function ge(p) {
      if (await Ne.confirm({
        header: "Delete knowledge base",
        message: `Delete “${p.name || "(untitled)"}”? This removes the knowledge base and all of its contents. This can't be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        t(""), C.value = "";
        try {
          const { data: o } = await J.delete(`/api/v1/knowledge/${p.id}`);
          if (!o?.success) throw new Error(o?.error || "delete failed");
          ze(p.id, o), s.value?.id === p.id && l(), await b();
        } catch (o) {
          t(ne(o, "delete failed"));
        }
      }
    }
    const le = M(!1), _e = M(null), de = M(null);
    function Ce(p) {
      _e.value = p, le.value = !0;
    }
    function Ee() {
      le.value = !1, _e.value = null;
    }
    const ce = M(!1), Se = M(null);
    function je(p) {
      p.key === "Escape" && le.value && Ee();
    }
    Ye(() => {
      window.addEventListener("keydown", je);
    }), me(() => {
      window.removeEventListener("keydown", je);
    });
    async function Te() {
      const p = _e.value;
      if (!de.value || !p) return;
      if (de.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Re("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const r = document.createElement("kickside-share");
      r.setAttribute("config", JSON.stringify({
        resource_id: p.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(p.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(p.id)}`,
        title: p.name || ""
      })), r.style.display = "block", r.addEventListener("close", Ee), de.value.appendChild(r);
    }
    ve([le, de], async () => {
      le.value && de.value && await Te();
    }), qe(async () => {
      try {
        await Promise.all([b(), d(), pe()]), !s.value && T.value.route && await $(T.value.route);
      } catch (p) {
        C.value = ne(p, "host API unavailable");
      }
    });
    const { acceptDeletion: ze } = vt(O, (p) => p.id, (p) => {
      s.value?.id === p && l();
    }, b);
    return (p, r) => (g(), y("div", At, [
      s.value ? (g(), y(ee, { key: 1 }, [
        h("div", an, [
          h("div", sn, [
            h("button", {
              class: "kx-back",
              onClick: r[2] || (r[2] = (o) => a(n)())
            }, [
              _(a(j), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              r[16] || (r[16] = Z(" Back", -1))
            ]),
            h("h1", {
              class: "kx-title",
              title: s.value.name || "(untitled)"
            }, R(s.value.name || "(untitled)"), 9, rn),
            s.value.badge ? (g(), fe(a(xe), {
              key: 0,
              severity: c(s.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: W(() => [
                _(a(j), {
                  icon: s.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                Z(R(s.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : D("", !0),
            _(Dt, {
              items: s.value.stat_items || []
            }, null, 8, ["items"]),
            s.value.auto_summary || s.value.auto_description ? (g(), y("span", {
              key: 1,
              ref_key: "summaryAnchor",
              ref: Se,
              class: "kx-summary"
            }, [
              _(a(X), {
                severity: "secondary",
                outlined: "",
                class: U(["kx-summary-btn", { on: ce.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ce.value,
                onClick: r[3] || (r[3] = se((o) => ce.value = !ce.value, ["stop"]))
              }, {
                icon: W(({ class: o }) => [
                  _(a(j), {
                    icon: "tabler:sparkles",
                    class: U(o),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              _(Lt, {
                open: ce.value,
                "onUpdate:open": r[5] || (r[5] = (o) => ce.value = o),
                anchor: Se.value,
                width: 340
              }, {
                default: W(() => [
                  h("div", {
                    class: "kx-summary-pop",
                    onClick: r[4] || (r[4] = se(() => {
                    }, ["stop"]))
                  }, [
                    h("div", ln, [
                      _(a(j), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      r[17] || (r[17] = h("span", null, "About this knowledge base", -1))
                    ]),
                    s.value.auto_summary ? (g(), y("p", dn, R(s.value.auto_summary), 1)) : D("", !0),
                    s.value.auto_description ? (g(), y("p", cn, R(s.value.auto_description), 1)) : D("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ], 512)) : D("", !0)
          ]),
          h("div", un, [
            a(ae) ? (g(), y("div", pn, [
              (g(!0), y(ee, null, he(a(Y), (o) => (g(), y("button", {
                key: o.id,
                class: U(["kx-viewseg-btn", { on: a(Q) === o.id }]),
                role: "tab",
                "aria-selected": a(Q) === o.id,
                onClick: (H) => a(z)(o.id)
              }, [
                o.icon ? (g(), fe(a(j), {
                  key: 0,
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : D("", !0),
                Z(" " + R(o.label), 1)
              ], 10, gn))), 128))
            ])) : D("", !0),
            _(a(X), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: r[6] || (r[6] = (o) => E(s.value))
            }, {
              icon: W(({ class: o }) => [
                _(a(j), {
                  icon: "tabler:pencil",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            _(a(X), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: r[7] || (r[7] = (o) => Ce(s.value))
            }, {
              icon: W(({ class: o }) => [
                _(a(j), {
                  icon: "tabler:share",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            _(a(X), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: r[8] || (r[8] = (o) => ge(s.value))
            }, {
              icon: W(({ class: o }) => [
                _(a(j), {
                  icon: "tabler:trash",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(F) ? (g(), y("div", fn, R(a(F)), 1)) : D("", !0),
        h("div", {
          class: U(["kx-body", { "kx-body-bleed": a(oe) }])
        }, [
          a(G) ? (g(), y("div", vn, [
            _(a(j), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            r[18] || (r[18] = Z(" Loading… ", -1))
          ])) : (g(), y(ee, { key: 1 }, [
            a(oe) ? D("", !0) : (g(), y("div", yn, [
              s.value.description ? (g(), y("div", mn, R(s.value.description), 1)) : D("", !0),
              h("div", hn, [
                s.value.embedding_model ? (g(), y("span", bn, [
                  _(a(j), {
                    icon: "tabler:vector",
                    "aria-hidden": "true"
                  }),
                  Z(R(s.value.embedding_model), 1)
                ])) : D("", !0)
              ])
            ])),
            h("div", {
              ref_key: "detailHost",
              ref: re,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (g(), y(ee, { key: 0 }, [
        h("header", Kt, [
          h("div", Nt, [
            _(a(j), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          r[10] || (r[10] = h("div", { class: "kx-head-text" }, [
            h("h1", { class: "kx-head-title" }, "Knowledge"),
            h("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          h("div", Rt, [
            h("span", It, R(a(O).length) + " knowledge base" + R(a(O).length !== 1 ? "s" : ""), 1),
            h("div", Tt, [
              _(a(j), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Qe(h("input", {
                "onUpdate:modelValue": r[0] || (r[0] = (o) => Xe(S) ? S.value = o : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Ze, a(S)]
              ])
            ]),
            _(a(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: x
            }, {
              icon: W(({ class: o }) => [
                _(a(j), {
                  icon: "tabler:plus",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(C) ? (g(), y("div", zt, R(a(C)), 1)) : D("", !0),
        a(P) ? (g(), y("div", Bt, [
          _(a(j), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          r[11] || (r[11] = h("span", null, [
            h("strong", null, "No knowledge engine installed."),
            Z(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : D("", !0),
        h("div", qt, [
          a(L) && !a(O).length ? (g(), y("div", Vt, [
            _(a(j), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            r[12] || (r[12] = Z(" Loading… ", -1))
          ])) : a(O).length ? a(N).length ? (g(), y("div", Ft, [
            (g(!0), y(ee, null, he(a(N), (o) => (g(), y("div", {
              key: o.id,
              class: "kx-card",
              role: "button",
              tabindex: "0",
              "aria-label": `Open ${o.name || "knowledge base"}`,
              onClick: (H) => !o.deleting_at && a(te)(o),
              onKeydown: [
                De((H) => !o.deleting_at && a(te)(o), ["enter"]),
                De(se((H) => !o.deleting_at && a(te)(o), ["prevent"]), ["space"])
              ]
            }, [
              _(ft, {
                state: o,
                onRetry: (H) => ge(o)
              }, null, 8, ["state", "onRetry"]),
              h("div", Yt, [
                h("span", Qt, [
                  _(a(j), {
                    icon: o.icon || o.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                h("div", Xt, [
                  h("div", {
                    class: "kx-card-name",
                    title: o.name || "(untitled)"
                  }, R(o.name || "(untitled)"), 9, Zt),
                  o.badge ? (g(), y("div", en, [
                    _(a(xe), {
                      severity: c(o.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: W(() => [
                        _(a(j), {
                          icon: o.badge.icon,
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        Z(R(o.badge.label), 1)
                      ]),
                      _: 2
                    }, 1032, ["severity"])
                  ])) : D("", !0)
                ]),
                h("div", {
                  class: "kx-card-actions",
                  onClick: r[1] || (r[1] = se(() => {
                  }, ["stop"]))
                }, [
                  _(a(X), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${o.name}`,
                    onClick: (H) => !o.deleting_at && E(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: W(({ class: H }) => [
                      _(a(j), {
                        icon: "tabler:pencil",
                        class: U(H),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  _(a(X), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${o.name}`,
                    onClick: (H) => Ce(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: W(({ class: H }) => [
                      _(a(j), {
                        icon: "tabler:share",
                        class: U(H),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  _(a(X), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${o.name}`,
                    onClick: (H) => ge(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: W(({ class: H }) => [
                      _(a(j), {
                        icon: "tabler:trash",
                        class: U(H),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              h("div", tn, R(o.description || "No description"), 1),
              o.stat_items && o.stat_items.length ? (g(), y("div", nn, [
                (g(!0), y(ee, null, he(o.stat_items, (H, Be) => (g(), y("span", {
                  key: Be,
                  class: "kx-stat",
                  title: `${i(H.value)} ${H.label}`,
                  "aria-label": `${i(H.value)} ${H.label}`
                }, [
                  H.icon ? (g(), fe(a(j), {
                    key: 0,
                    icon: H.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : D("", !0),
                  Z(R(i(H.value)), 1)
                ], 8, on))), 128))
              ])) : D("", !0)
            ], 40, Gt))), 128))
          ])) : (g(), y("div", Jt, [...r[15] || (r[15] = [
            h("div", { class: "kx-empty-title" }, "No matches", -1),
            h("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (g(), y("div", Wt, [
            h("div", Ut, [
              _(a(j), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            r[13] || (r[13] = h("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            r[14] || (r[14] = h("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            _(a(X), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: x
            }, {
              icon: W(({ class: o }) => [
                _(a(j), {
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
      _(Ue, {
        open: u.value,
        api: a(J),
        engines: a(v),
        models: a(A),
        target: f.value,
        "load-error": a(k),
        onRetry: a(B),
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
}), _n = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link sub-path under /knowledge: a kb id, optionally followed by an in-KB node path (kbId/nodeId)." } } } }, wn = {
  wippy: _n
};
class xn extends Ve {
  static get wippyConfig() {
    return {
      propsSchema: wn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: st
    };
  }
  static get vueConfig() {
    return { rootComponent: kn, plugins: [Je] };
  }
}
et(import.meta.url, xn);
//# sourceMappingURL=index.js.map
