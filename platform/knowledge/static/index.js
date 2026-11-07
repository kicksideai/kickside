import { u as Ve, W as qe } from "./index-D52CRMw6.js";
import { B as Oe, s as He, a as ee, e as ne, f as We, _ as Ue, P as Fe } from "./KbDialog.vue_vue_type_script_setup_true_lang-phDmIDoa.js";
import { openBlock as g, createElementBlock as m, mergeProps as ie, createElementVNode as y, defineComponent as be, computed as ue, withModifiers as se, Fragment as Y, createTextVNode as J, toDisplayString as N, createCommentVNode as D, createVNode as b, unref as a, watch as ve, onBeforeUnmount as me, createBlock as fe, resolveDynamicComponent as Ge, renderSlot as Ae, renderList as he, ref as j, nextTick as we, normalizeStyle as Je, onMounted as Ye, withDirectives as Qe, isRef as Xe, vModelText as Ze, withCtx as W, normalizeClass as U, withKeys as Me } from "vue";
import { _ as et } from "./_plugin-vue_export-helper-CHgC5LLL.js";
import { on as Ke, api as F, host as Ne, loadByTagName as Re, define as tt } from "@wippy-fe/proxy";
import { c as nt, a as ot, s as at, u as it, b as st } from "./constants-Cgcp0OGP.js";
import { Icon as M } from "@iconify/vue";
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
}, Ie = {
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
function gt(e, i, d, r, h, P) {
  return g(), m("div", ie({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(g(), m("svg", ie({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: P.svgStyle
  }, e.ptm("spin")), [y("circle", ie({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, pt)], 16))], 16);
}
Ie.render = gt;
const ft = { key: 0 }, vt = /* @__PURE__ */ be({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const i = e, d = ue(() => i.state.deletion_job === null || ["dead", "cancelled"].includes(i.state.deletion_job?.status || ""));
    return (r, h) => e.state.deleting_at ? (g(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: h[1] || (h[1] = se(() => {
      }, ["stop"])),
      onKeydown: h[2] || (h[2] = se(() => {
      }, ["stop"]))
    }, [
      d.value ? (g(), m(Y, { key: 0 }, [
        y("span", null, [
          h[3] || (h[3] = J("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (g(), m("span", ft, ": " + N(e.state.deletion_job.last_error), 1)) : D("", !0)
        ]),
        b(a(ee), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: h[0] || (h[0] = se((P) => r.$emit("retry"), ["stop"]))
        })
      ], 64)) : (g(), m(Y, { key: 1 }, [
        b(a(Ie), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        h[4] || (h[4] = y("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : D("", !0);
  }
}), yt = /* @__PURE__ */ et(vt, [["__scopeId", "data-v-63c136c7"]]);
function mt(e, i, d, r) {
  let h = !0;
  const P = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Map();
  function O(v, k) {
    const _ = e.value.find((B) => i(B) === v), c = C.get(v), w = {
      deleting_at: c?.deleting_at || _?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: k?.job_id || c?.deletion_job_id || _?.deletion_job_id
    };
    C.set(v, w), _ && (Object.assign(_, w), _.deletion_job = void 0);
  }
  async function H(v) {
    const k = i(v), _ = C.get(k), c = () => h && e.value.includes(v) && C.get(k) === _;
    try {
      const { data: w } = await F.get(`/api/v1/components/${encodeURIComponent(k)}`);
      if (!w?.success) throw new Error(ne(w, "Could not read deletion progress"));
      c() && (v.deleting_at = _?.deleting_at || w.deleting_at, v.deletion_job_id = w.deletion_job_id, _ && (_.deletion_job_id = v.deletion_job_id), v.deletion_job = w.deletion_job ?? null);
    } catch (w) {
      c() && Ne.handleError("other", { message: ne(w, "Could not read deletion progress") });
    }
  }
  let E = [];
  const L = ve(() => e.value, (v, k = []) => {
    const _ = v.filter((c) => !P.has(i(c)));
    for (const c of k)
      P.has(i(c)) || _.some((w) => i(w) === i(c)) || (d?.(i(c)), c.deleting_at);
    if (_.length !== v.length) {
      e.value = _;
      return;
    }
    for (const c of v) {
      const w = C.get(i(c));
      w && (c.deletion_job_id !== w.deletion_job_id && (c.deletion_job = void 0), Object.assign(c, w));
      const B = k.find((R) => i(R) === i(c));
      c.deletion_job === void 0 && B?.deletion_job_id === c.deletion_job_id && (c.deletion_job = B?.deletion_job), c.deleting_at && !E.includes(c) && H(c);
    }
    E = v;
  }, { immediate: !0 }), K = Ke("@message", (v) => {
    const k = nt(v);
    if (!k) return;
    const _ = e.value.find((c) => i(c) === k.component_id);
    k.event === "component.deleted" ? (_ && !P.has(k.component_id) && d?.(k.component_id), P.add(k.component_id), C.delete(k.component_id), e.value = e.value.filter((c) => i(c) !== k.component_id)) : _ && O(k.component_id, { job_id: k.deletion_job_id });
  });
  return me(() => {
    h = !1, L(), typeof K == "function" && K();
  }), { acceptDeletion: O };
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
}), _t = {
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
function wt(e, i, d) {
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
    var r = d.call(e, i);
    if (ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (i === "string" ? String : Number)(e);
}
var xe = {
  name: "Tag",
  extends: _t,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return We(wt({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Ct = ["data-p"];
function St(e, i, d, r, h, P) {
  return g(), m("span", ie({
    class: e.cx("root"),
    "data-p": P.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (g(), fe(Ge(e.$slots.icon), ie({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (g(), m("span", ie({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : D("", !0), e.value != null || e.$slots.default ? Ae(e.$slots, "default", {
    key: 2
  }, function() {
    return [y("span", ie({
      class: e.cx("label")
    }, e.ptm("label")), N(e.value), 17)];
  }) : D("", !0)], 16, Ct);
}
xe.render = St;
const Et = {
  key: 0,
  class: "kx-header-stats",
  "aria-label": "Knowledge statistics"
}, Dt = {
  key: 0,
  "aria-hidden": "true"
}, Mt = { class: "kx-header-stat" }, jt = { class: "kx-header-stat-label" }, Lt = /* @__PURE__ */ be({
  __name: "KnowledgeStats",
  props: {
    items: {}
  },
  setup(e) {
    return (i, d) => e.items.length ? (g(), m("span", Et, [
      (g(!0), m(Y, null, he(e.items, (r, h) => (g(), m(Y, { key: h }, [
        h ? (g(), m("span", Dt, " · ")) : D("", !0),
        y("span", Mt, [
          r.icon ? (g(), fe(a(M), {
            key: 0,
            icon: r.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : D("", !0),
          y("span", jt, N(r.value.toLocaleString()) + " " + N(r.label), 1)
        ])
      ], 64))), 128))
    ])) : D("", !0);
  }
}), Pt = 2e3;
function je(e) {
  const i = e.margin ?? 8, d = e.gap ?? 4, r = Math.max(0, e.viewportWidth), h = Math.max(0, e.viewportHeight), P = Math.max(0, r - i * 2), C = Math.min(Math.max(0, e.requestedWidth), P), O = e.align === "right" ? e.anchor.right - C : e.anchor.left, H = Math.max(i, Math.min(O, r - i - C)), E = Math.max(0, h - e.anchor.bottom - d - i), L = Math.max(0, e.anchor.top - d - i), K = E < e.requestedMaxHeight && L > E ? "above" : "below", v = K === "above" ? L : E, k = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), v)), _ = Math.min(Math.max(0, e.panelHeight ?? k), k), c = K === "above" ? e.anchor.top - d - _ : e.anchor.bottom + d, w = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(H - w.left),
    width: Math.round(C),
    maxHeight: k,
    side: K,
    top: Math.round(c - w.top)
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
    const d = e, r = i, h = j(null), P = j({ position: "fixed", visibility: "hidden" });
    function C() {
      const c = d.anchor, w = h.value;
      if (!c || !w) return;
      const B = c.getBoundingClientRect(), R = d.width === "anchor" ? Math.max(d.minWidth, B.width) : Math.max(d.minWidth, d.width), I = {
        anchor: B,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: R,
        requestedMaxHeight: d.maxHeight,
        align: d.align,
        gap: d.gap
      }, T = je(I);
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
      const V = w.getBoundingClientRect(), q = je({
        ...I,
        containingBlockOrigin: { left: V.left, top: V.top },
        panelHeight: V.height
      }), Q = {
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
      P.value = Q;
    }
    let O = null, H = !1;
    function E() {
      H || !d.open || (H = !0, requestAnimationFrame(() => {
        H = !1, d.open && C();
      }));
    }
    function L() {
      typeof ResizeObserver > "u" || (O = new ResizeObserver(E), h.value && O.observe(h.value), d.anchor && O.observe(d.anchor));
    }
    function K() {
      O?.disconnect(), O = null, H = !1;
    }
    ve(() => d.open, async (c) => {
      K(), c && (P.value = { position: "fixed", visibility: "hidden" }, await we(), C(), L());
    }, { immediate: !0 });
    function v(c) {
      if (!d.open) return;
      const w = c.composedPath();
      h.value && w.includes(h.value) || d.anchor && w.includes(d.anchor) || r("update:open", !1);
    }
    function k(c) {
      d.open && c.key === "Escape" && r("update:open", !1);
    }
    function _() {
      d.open && C();
    }
    return document.addEventListener("click", v), document.addEventListener("keydown", k), window.addEventListener("resize", _), window.addEventListener("scroll", _, !0), me(() => {
      K(), document.removeEventListener("click", v), document.removeEventListener("keydown", k), window.removeEventListener("resize", _), window.removeEventListener("scroll", _, !0);
    }), (c, w) => e.open ? (g(), m("div", {
      key: 0,
      ref_key: "panel",
      ref: h,
      class: "anchored-panel",
      style: Je(P.value)
    }, [
      Ae(c.$slots, "default")
    ], 4)) : D("", !0);
  }
}), $e = {
  document_count: "integer",
  embedding_count: "integer",
  claim_count: "integer"
}, Le = Object.keys($e), Pe = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.";
function Ht({ detail: e }) {
  const i = j(!1), d = j(""), r = j(""), h = j([]), P = j(""), C = j([]), O = j([]), H = j("");
  let E = !0, L = 0, K = !1, v = !1;
  const k = ue(() => {
    const l = P.value.trim().toLowerCase();
    return l ? h.value.filter(
      (n) => (n.name || "").toLowerCase().includes(l) || (n.description || "").toLowerCase().includes(l)
    ) : h.value;
  });
  function _(l) {
    const n = l.toLowerCase();
    return n.includes("no implementation") || n.includes("no engine") || n.includes("contract unavailable") || n.includes("not found") && n.includes("binding");
  }
  async function c() {
    if (!E) return !1;
    const l = ++L;
    i.value = !0, d.value = "", r.value = "";
    try {
      const { data: n } = await F.get("/api/v1/knowledge/list");
      if (!n?.success) {
        const $ = n?.error || "failed to load knowledge bases";
        if (_($))
          return l === L && E && (r.value = Pe), !1;
        throw new Error($);
      }
      return l === L && E && (h.value = n.items || []), !0;
    } catch (n) {
      const $ = ne(n, "could not load knowledge bases");
      return l === L && E && (_($) ? r.value = Pe : d.value = $), !1;
    } finally {
      l === L && (i.value = !1, E && v && !K && te());
    }
  }
  async function w() {
    try {
      const { data: l } = await F.get("/api/v1/knowledge/models");
      C.value = l?.success ? l.models || [] : [];
    } catch {
      C.value = [];
    }
  }
  async function B() {
    try {
      const { data: l } = await F.get("/api/v1/knowledge/engines");
      O.value = l?.success ? l.engines || [] : [];
    } catch {
      O.value = [];
    }
  }
  function R(l) {
    return O.value.find((n) => n.kb_type === l);
  }
  async function I() {
    H.value = "";
    try {
      const [l, n] = await Promise.all([
        F.get("/api/v1/knowledge/engines"),
        F.get("/api/v1/knowledge/models")
      ]);
      if (!l.data?.success) throw new Error(l.data?.error || "Could not load knowledge engines.");
      if (!n.data?.success) throw new Error(n.data?.error || "Could not load embedding models.");
      O.value = l.data.engines || [], C.value = n.data.models || [];
    } catch (l) {
      O.value = [], C.value = [], H.value = ne(l, "Could not load knowledge engines.");
    }
  }
  function T(l) {
    return !!l && typeof l == "object" && !Array.isArray(l);
  }
  function V(l) {
    if (T(l)) return l;
    if (!(typeof l != "string" || !l))
      try {
        const n = JSON.parse(l);
        return T(n) ? n : void 0;
      } catch {
        return;
      }
  }
  function q(l, n) {
    if (!n) return;
    let $ = l;
    for (const t of n.split(".")) {
      if (!T($)) return;
      $ = $[t];
    }
    return $;
  }
  function Q(l, n) {
    if (!Array.isArray(n)) return [];
    const $ = [];
    for (const t of n) {
      const u = q(l, t.path), f = typeof u == "number" ? u : Number(u || 0);
      f < (t.min ?? 0) || $.push({ icon: t.icon, value: f, label: String(f === 1 ? t.singular : t.plural) });
    }
    return $;
  }
  function G(l, n) {
    return Object.prototype.hasOwnProperty.call(l, n);
  }
  function re(l, n) {
    return Le.some(($) => G(l, $)) ? !0 : Array.isArray(n) ? n.some(($) => {
      const t = $.path || "";
      return t !== "" && G(l, t.split(".")[0]);
    }) : !1;
  }
  function oe(l, n, $) {
    const t = String(n.kb_type || $ || ""), u = R(t), f = {
      kb_type: t || $,
      badge: u?.badge
    };
    for (const x of Le) {
      const S = n[x];
      G(n, x) && typeof S == "number" && (f[x] = S);
    }
    return (re(n, u?.stats_spec) || G(n, "kb_type")) && (f.stat_items = Q({ ...l, ...n }, u?.stats_spec)), f;
  }
  function X(l, n, $ = []) {
    const t = {};
    typeof n.title == "string" && (t.name = n.title), typeof n.comment == "string" && (t.description = n.comment), typeof n.icon == "string" && (t.icon = n.icon), typeof n.status == "string" && (t.status = n.status), typeof n.auto_summary == "string" && (t.auto_summary = n.auto_summary), typeof n.auto_description == "string" && (t.auto_description = n.auto_description), typeof n.kb_type == "string" && (t.kb_type = n.kb_type), Object.assign(t, oe(l, n, t.kb_type || l.kb_type));
    const u = { ...l, ...t };
    for (const f of $) {
      const x = f === "title" ? "name" : f;
      delete u[x];
    }
    return u;
  }
  const ae = j(null);
  function Z(l, n) {
    const $ = V(n.meta) || {}, t = n.deleted || [];
    h.value = h.value.map((u) => u.id === l ? X(u, $, t) : u), e.value?.id === l && (e.value = X(e.value, $, t));
  }
  function z() {
    E = !1, v = !1, pe?.(), ae.value?.(), ae.value = null;
  }
  async function te() {
    if (E) {
      if (K || i.value) {
        v = !0;
        return;
      }
      K = !0;
      try {
        do
          v = !1, await c();
        while (E && v);
      } finally {
        K = !1;
      }
    }
  }
  const pe = Ke("@message", (l) => {
    const n = ot(l, void 0, $e);
    if (!n) return;
    const $ = h.value.some((t) => t.id === n.component_id);
    ($ || e.value?.id === n.component_id) && Z(n.component_id, n), !$ && typeof n.meta.kb_type == "string" && n.meta.kb_type && te();
  });
  return me(z), {
    loading: i,
    error: d,
    notice: r,
    kbs: h,
    query: P,
    filtered: k,
    models: C,
    engines: O,
    dialogLoadError: H,
    load: c,
    loadModels: w,
    loadEngines: B,
    engineFor: R,
    loadDialogCatalog: I,
    detailUnsub: ae,
    applyComponentMetaEvent: Z,
    clearComponentSubscriptions: z
  };
}
function At({ detail: e, detailUnsub: i, kbs: d, engines: r, engineFor: h, applyComponentMetaEvent: P, route: C, navigate: O, loadEngines: H }) {
  const E = j(!1), L = j(""), K = j(null);
  let v = null, k = 0, _ = 0;
  const c = ue(() => e.value ? h(e.value.kb_type || "")?.manage_ui_id : void 0), w = ue(() => (e.value ? h(e.value.kb_type || "")?.manage_views : void 0) || []), B = ue(() => w.value.length > 1), R = j(""), I = j("");
  let T = !1, V = 0;
  function q() {
    const t = e.value?.kb_type;
    return t ? `kx:kb:detail-view:${t}` : null;
  }
  ve(w, (t) => {
    if (!t.length) {
      R.value = "";
      return;
    }
    const u = t.map((S) => S.id);
    let f = "";
    try {
      const S = q();
      f = S && localStorage.getItem(S) || "";
    } catch {
    }
    const x = u.includes(f) ? f : u[0];
    x !== R.value && (R.value = x);
  }, { immediate: !0 });
  function Q() {
    const t = { kb_id: e.value?.id, route: I.value };
    return R.value && (t.view = R.value), JSON.stringify(t);
  }
  function G(t) {
    if (t !== R.value) {
      R.value = t;
      try {
        const u = q();
        u && localStorage.setItem(u, t);
      } catch {
      }
      try {
        v?.setAttribute("config", Q());
      } catch {
      }
    }
  }
  function re(t) {
    t.stopPropagation();
    const u = e.value?.id;
    if (!u || T) return;
    const f = typeof t.detail == "string" ? t.detail : t.detail?.path ?? t.detail?.route ?? "", x = String(f || "").replace(/^\/+/, "");
    I.value = x, Z(x ? `${u}/${x}` : u);
  }
  function oe(t) {
    t.stopPropagation();
  }
  function X(t = !0) {
    t && _++, v && (v.removeEventListener("kb-changed", oe), v.removeEventListener("navigate", re), v.remove(), v = null);
  }
  async function ae() {
    const t = ++_;
    X(!1);
    const u = c.value, f = K.value, x = e.value?.id;
    if (!u || !f || !x) return;
    try {
      await Re(u, { timeoutMs: 8e3 });
    } catch {
    }
    if (t !== _ || e.value?.id !== x || c.value !== u || K.value !== f) return;
    f.replaceChildren();
    const S = document.createElement(u);
    try {
      S.setAttribute("config", Q());
    } catch {
    }
    S.addEventListener("kb-changed", oe), S.addEventListener("navigate", re), f.appendChild(S), v = S;
  }
  function Z(t) {
    T || O(t);
  }
  function z(t, u) {
    return k === t && e.value?.id === u;
  }
  async function te(t, u = !0) {
    const f = ++k, x = t.id;
    e.value = { ...t }, i.value?.(), i.value = x ? at(x, (S) => P(x, S), $e) : null, L.value = "", E.value = !0, X(), u && Z(x);
    try {
      const { data: S } = await F.get(`/api/v1/knowledge/${x}`);
      if (!z(f, x)) return;
      S?.success ? e.value = { ...e.value, ...S } : L.value = S?.error || "could not load knowledge base";
    } catch (S) {
      if (!z(f, x)) return;
      L.value = ne(S, "could not load knowledge base");
    } finally {
      z(f, x) && (E.value = !1);
    }
    z(f, x) && (r.value.length || await H(), z(f, x) && (await we(), z(f, x) && await ae()));
  }
  async function pe() {
    const t = e.value?.id;
    if (!t) return;
    const u = ++k;
    L.value = "";
    try {
      const { data: f } = await F.get(`/api/v1/knowledge/${t}`);
      if (!z(u, t)) return;
      f?.success ? e.value = { ...e.value, ...f } : L.value = f?.error || "could not load knowledge base";
    } catch (f) {
      if (!z(u, t)) return;
      L.value = ne(f, "could not load knowledge base");
    }
    if (z(u, t) && (await we(), !!z(u, t)))
      try {
        v?.setAttribute("config", Q());
      } catch {
      }
  }
  function l() {
    const t = e.value?.id;
    if (!t || !I.value) {
      n();
      return;
    }
    O({ path: t, back: { within: t } });
  }
  function n(t = !0) {
    k++, X(), i.value?.(), i.value = null, e.value = null, I.value = "", t && Z("");
  }
  async function $(t) {
    const u = ++V, f = String(t || "").split("/").filter(Boolean), x = f[0] || "", S = f.slice(1).join("/");
    T = !0;
    try {
      if (u !== V) return;
      if (!x)
        e.value && n(!1);
      else if (e.value?.id !== x) {
        I.value = S;
        const ke = d.value.find((ge) => ge.id === x);
        if (await te(ke || { id: x }, !1), u !== V) return;
      } else if (S !== I.value) {
        I.value = S;
        try {
          v?.setAttribute("config", Q());
        } catch {
        }
      }
    } finally {
      u === V && (T = !1);
    }
  }
  return ve(C, (t) => {
    $(t);
  }), me(() => {
    X(), i.value?.(), i.value = null;
  }), {
    detailLoading: E,
    detailError: L,
    detailHost: K,
    detailManageTag: c,
    detailViews: w,
    detailHasViews: B,
    detailView: R,
    innerRoute: I,
    setDetailView: G,
    openDetail: te,
    refreshOpenDetail: pe,
    closeDetail: n,
    backDetail: l,
    applyRoute: $,
    pushRoute: Z,
    unmountDetailWc: X
  };
}
const Kt = { class: "kx" }, Nt = { class: "kx-head" }, Rt = { class: "kx-head-icon" }, It = { class: "kx-head-actions" }, Tt = { class: "kx-count" }, zt = { class: "kx-search" }, Bt = {
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
}, kn = { class: "kx-stats" }, _n = {
  key: 0,
  class: "kx-stat"
}, wn = {
  key: 0,
  class: "kx-detail-summary"
}, xn = /* @__PURE__ */ be({
  __name: "knowledge",
  setup(e) {
    const i = (p) => (p ?? 0).toLocaleString();
    function d(p) {
      if (p === "neutral") return "secondary";
      if (p === "warning") return "warn";
      if (p === "info" || p === "success" || p === "danger") return p;
    }
    const r = j(null), h = Ht({ detail: r }), {
      loading: P,
      error: C,
      notice: O,
      kbs: H,
      query: E,
      filtered: L,
      models: K,
      engines: v,
      dialogLoadError: k,
      load: _,
      loadEngines: c,
      engineFor: w,
      loadDialogCatalog: B,
      detailUnsub: R,
      applyComponentMetaEvent: I
    } = h, T = it(), V = st(), q = At({
      detail: r,
      detailUnsub: R,
      kbs: H,
      engines: v,
      engineFor: w,
      applyComponentMetaEvent: I,
      route: ue(() => T.value.route),
      navigate: (p) => V("navigate", p),
      loadEngines: c
    }), {
      detailLoading: Q,
      detailError: G,
      detailHost: re,
      detailManageTag: oe,
      detailViews: X,
      detailHasViews: ae,
      detailView: Z,
      setDetailView: z,
      openDetail: te,
      refreshOpenDetail: pe,
      closeDetail: l,
      backDetail: n,
      applyRoute: $
    } = q;
    function t(p) {
      r.value ? G.value = p : C.value = p;
    }
    const u = j(!1), f = j(null);
    async function x() {
      f.value = null, await B(), u.value = !0;
    }
    async function S(p) {
      C.value = "", G.value = "", k.value = "", v.value.length || await c();
      try {
        const { data: s } = await F.get(`/api/v1/knowledge/${p.id}`);
        if (!s?.success) throw new Error(s?.error || "could not load knowledge base settings");
        f.value = {
          id: p.id,
          name: s.name ?? p.name,
          description: s.description ?? p.description,
          icon: s.icon ?? p.icon,
          kb_type: s.kb_type ?? p.kb_type,
          embedding_model: s.embedding_model,
          config: s.config && typeof s.config == "object" ? s.config : {}
        }, u.value = !0;
      } catch (s) {
        f.value = null, u.value = !1, t(ne(s, "could not load knowledge base settings"));
      }
    }
    async function ke() {
      u.value = !1;
      const p = r.value?.id;
      if (await _(), p && f.value && f.value.id === p)
        try {
          const { data: s } = await F.get(`/api/v1/knowledge/${p}`);
          s?.success && r.value && r.value.id === p && (r.value = { ...r.value, ...s });
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
          const { data: o } = await F.delete(`/api/v1/knowledge/${p.id}`);
          if (!o?.success) throw new Error(o?.error || "delete failed");
          ze(p.id, o), r.value?.id === p.id && l(), await _();
        } catch (o) {
          t(ne(o, "delete failed"));
        }
      }
    }
    const le = j(!1), _e = j(null), de = j(null);
    function Ce(p) {
      _e.value = p, le.value = !0;
    }
    function Se() {
      le.value = !1, _e.value = null;
    }
    const ce = j(!1), Ee = j(null);
    function De(p) {
      p.key === "Escape" && le.value && Se();
    }
    Ye(() => {
      window.addEventListener("keydown", De);
    }), me(() => {
      window.removeEventListener("keydown", De);
    });
    async function Te() {
      const p = _e.value;
      if (!de.value || !p) return;
      if (de.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Re("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const s = document.createElement("kickside-share");
      s.setAttribute("config", JSON.stringify({
        resource_id: p.id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(p.id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(p.id)}`,
        title: p.name || ""
      })), s.style.display = "block", s.addEventListener("close", Se), de.value.appendChild(s);
    }
    ve([le, de], async () => {
      le.value && de.value && await Te();
    }), Ve(async () => {
      try {
        await Promise.all([_(), c(), pe()]), !r.value && T.value.route && await $(T.value.route);
      } catch (p) {
        C.value = ne(p, "host API unavailable");
      }
    });
    const { acceptDeletion: ze } = mt(H, (p) => p.id, (p) => {
      r.value?.id === p && l();
    });
    return (p, s) => (g(), m("div", Kt, [
      r.value ? (g(), m(Y, { key: 1 }, [
        y("div", sn, [
          y("div", rn, [
            y("button", {
              class: "kx-back",
              onClick: s[2] || (s[2] = (o) => a(n)())
            }, [
              b(a(M), {
                icon: "tabler:arrow-left",
                "aria-hidden": "true"
              }),
              s[16] || (s[16] = J(" Back", -1))
            ]),
            y("h1", {
              class: "kx-title",
              title: r.value.name || "(untitled)"
            }, N(r.value.name || "(untitled)"), 9, ln),
            r.value.badge ? (g(), fe(a(xe), {
              key: 0,
              severity: d(r.value.badge.tone),
              class: "kx-pill kx-tag-caps"
            }, {
              default: W(() => [
                b(a(M), {
                  icon: r.value.badge.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                J(N(r.value.badge.label), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : D("", !0),
            b(Lt, {
              items: r.value.stat_items || []
            }, null, 8, ["items"]),
            r.value.auto_summary || r.value.auto_description ? (g(), m("span", dn, [
              b(a(ee), {
                ref_key: "summaryAnchor",
                ref: Ee,
                severity: "secondary",
                outlined: "",
                class: U(["kx-summary-btn", { on: ce.value }]),
                type: "button",
                title: "About this knowledge base",
                "aria-label": "About this knowledge base",
                "aria-expanded": ce.value,
                onClick: s[3] || (s[3] = se((o) => ce.value = !ce.value, ["stop"]))
              }, {
                icon: W(({ class: o }) => [
                  b(a(M), {
                    icon: "tabler:sparkles",
                    class: U(o),
                    "aria-hidden": "true"
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class", "aria-expanded"]),
              b(Ot, {
                open: ce.value,
                "onUpdate:open": s[5] || (s[5] = (o) => ce.value = o),
                anchor: Ee.value,
                width: 340
              }, {
                default: W(() => [
                  y("div", {
                    class: "kx-summary-pop",
                    onClick: s[4] || (s[4] = se(() => {
                    }, ["stop"]))
                  }, [
                    y("div", cn, [
                      b(a(M), {
                        icon: "tabler:sparkles",
                        "aria-hidden": "true"
                      }),
                      s[17] || (s[17] = y("span", null, "About this knowledge base", -1))
                    ]),
                    r.value.auto_summary ? (g(), m("p", un, N(r.value.auto_summary), 1)) : D("", !0),
                    r.value.auto_description ? (g(), m("p", pn, N(r.value.auto_description), 1)) : D("", !0)
                  ])
                ]),
                _: 1
              }, 8, ["open", "anchor"])
            ])) : D("", !0)
          ]),
          y("div", gn, [
            a(ae) ? (g(), m("div", fn, [
              (g(!0), m(Y, null, he(a(X), (o) => (g(), m("button", {
                key: o.id,
                class: U(["kx-viewseg-btn", { on: a(Z) === o.id }]),
                role: "tab",
                "aria-selected": a(Z) === o.id,
                onClick: (A) => a(z)(o.id)
              }, [
                o.icon ? (g(), fe(a(M), {
                  key: 0,
                  icon: o.icon,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])) : D("", !0),
                J(" " + N(o.label), 1)
              ], 10, vn))), 128))
            ])) : D("", !0),
            b(a(ee), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Edit",
              onClick: s[6] || (s[6] = (o) => S(r.value))
            }, {
              icon: W(({ class: o }) => [
                b(a(M), {
                  icon: "tabler:pencil",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            b(a(ee), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Share",
              onClick: s[7] || (s[7] = (o) => Ce(r.value))
            }, {
              icon: W(({ class: o }) => [
                b(a(M), {
                  icon: "tabler:share",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }),
            b(a(ee), {
              type: "button",
              severity: "danger",
              outlined: "",
              label: "Delete",
              onClick: s[8] || (s[8] = (o) => ge(r.value))
            }, {
              icon: W(({ class: o }) => [
                b(a(M), {
                  icon: "tabler:trash",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(G) ? (g(), m("div", yn, N(a(G)), 1)) : D("", !0),
        y("div", {
          class: U(["kx-body", { "kx-body-bleed": a(oe) }])
        }, [
          a(Q) ? (g(), m("div", mn, [
            b(a(M), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            s[18] || (s[18] = J(" Loading… ", -1))
          ])) : (g(), m(Y, { key: 1 }, [
            a(oe) ? D("", !0) : (g(), m(Y, { key: 0 }, [
              y("div", hn, [
                r.value.description ? (g(), m("div", bn, N(r.value.description), 1)) : D("", !0),
                y("div", kn, [
                  r.value.embedding_model ? (g(), m("span", _n, [
                    b(a(M), {
                      icon: "tabler:vector",
                      "aria-hidden": "true"
                    }),
                    J(N(r.value.embedding_model), 1)
                  ])) : D("", !0)
                ])
              ]),
              r.value.auto_summary ? (g(), m("div", wn, [
                s[19] || (s[19] = y("div", { class: "kx-detail-summary-lbl" }, "Summary", -1)),
                J(" " + N(r.value.auto_summary), 1)
              ])) : D("", !0)
            ], 64)),
            y("div", {
              ref_key: "detailHost",
              ref: re,
              class: "kx-detail-host"
            }, null, 512)
          ], 64))
        ], 2)
      ], 64)) : (g(), m(Y, { key: 0 }, [
        y("header", Nt, [
          y("div", Rt, [
            b(a(M), {
              icon: "tabler:books",
              "aria-hidden": "true"
            })
          ]),
          s[10] || (s[10] = y("div", { class: "kx-head-text" }, [
            y("h1", { class: "kx-head-title" }, "Knowledge"),
            y("p", { class: "kx-head-sub" }, "Knowledge bases your agents search and reason over.")
          ], -1)),
          y("div", It, [
            y("span", Tt, N(a(H).length) + " knowledge base" + N(a(H).length !== 1 ? "s" : ""), 1),
            y("div", zt, [
              b(a(M), {
                icon: "tabler:search",
                class: "kx-search-ico",
                "aria-hidden": "true"
              }),
              Qe(y("input", {
                "onUpdate:modelValue": s[0] || (s[0] = (o) => Xe(E) ? E.value = o : null),
                class: "kx-search-input",
                type: "text",
                placeholder: "Search knowledge bases…"
              }, null, 512), [
                [Ze, a(E)]
              ])
            ]),
            b(a(ee), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: x
            }, {
              icon: W(({ class: o }) => [
                b(a(M), {
                  icon: "tabler:plus",
                  class: U(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        a(C) ? (g(), m("div", Bt, N(a(C)), 1)) : D("", !0),
        a(O) ? (g(), m("div", Vt, [
          b(a(M), {
            icon: "tabler:info-circle",
            "aria-hidden": "true"
          }),
          s[11] || (s[11] = y("span", null, [
            y("strong", null, "No knowledge engine installed."),
            J(" Install a KB engine to create and browse knowledge bases.")
          ], -1))
        ])) : D("", !0),
        y("div", qt, [
          a(P) && !a(H).length ? (g(), m("div", Wt, [
            b(a(M), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            s[12] || (s[12] = J(" Loading… ", -1))
          ])) : a(H).length ? a(L).length ? (g(), m("div", Jt, [
            (g(!0), m(Y, null, he(a(L), (o) => (g(), m("div", {
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
              b(yt, {
                state: o,
                onRetry: (A) => ge(o)
              }, null, 8, ["state", "onRetry"]),
              y("div", Qt, [
                y("span", Xt, [
                  b(a(M), {
                    icon: o.icon || o.badge?.icon || "tabler:books",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                y("div", Zt, [
                  y("div", {
                    class: "kx-card-name",
                    title: o.name || "(untitled)"
                  }, N(o.name || "(untitled)"), 9, en),
                  o.badge ? (g(), m("div", tn, [
                    b(a(xe), {
                      severity: d(o.badge.tone),
                      class: "kx-pill kx-tag-caps"
                    }, {
                      default: W(() => [
                        b(a(M), {
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
                  onClick: s[1] || (s[1] = se(() => {
                  }, ["stop"]))
                }, [
                  b(a(ee), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Edit",
                    "aria-label": `Edit ${o.name}`,
                    onClick: (A) => !o.deleting_at && S(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: W(({ class: A }) => [
                      b(a(M), {
                        icon: "tabler:pencil",
                        class: U(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  b(a(ee), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    title: "Share",
                    "aria-label": `Share ${o.name}`,
                    onClick: (A) => Ce(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: W(({ class: A }) => [
                      b(a(M), {
                        icon: "tabler:share",
                        class: U(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"]),
                  b(a(ee), {
                    type: "button",
                    severity: "danger",
                    outlined: "",
                    size: "small",
                    title: "Delete",
                    "aria-label": `Delete ${o.name}`,
                    onClick: (A) => ge(o),
                    disabled: !!o.deleting_at
                  }, {
                    icon: W(({ class: A }) => [
                      b(a(M), {
                        icon: "tabler:trash",
                        class: U(A),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["aria-label", "onClick", "disabled"])
                ])
              ]),
              y("div", nn, N(o.description || "No description"), 1),
              o.stat_items && o.stat_items.length ? (g(), m("div", on, [
                (g(!0), m(Y, null, he(o.stat_items, (A, Be) => (g(), m("span", {
                  key: Be,
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
                ], 8, an))), 128))
              ])) : D("", !0)
            ], 40, Yt))), 128))
          ])) : (g(), m("div", Gt, [...s[15] || (s[15] = [
            y("div", { class: "kx-empty-title" }, "No matches", -1),
            y("div", { class: "kx-empty-sub" }, "No knowledge bases match the current search.", -1)
          ])])) : (g(), m("div", Ut, [
            y("div", Ft, [
              b(a(M), {
                icon: "tabler:books",
                "aria-hidden": "true"
              })
            ]),
            s[13] || (s[13] = y("div", { class: "kx-empty-title" }, "No knowledge bases yet", -1)),
            s[14] || (s[14] = y("div", { class: "kx-empty-sub" }, "A knowledge base your agents can search and reason over.", -1)),
            b(a(ee), {
              type: "button",
              "data-testid": "knowledge-create",
              label: "New knowledge base",
              onClick: x
            }, {
              icon: W(({ class: o }) => [
                b(a(M), {
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
      b(Ue, {
        open: u.value,
        api: a(F),
        engines: a(v),
        models: a(K),
        target: f.value,
        "load-error": a(k),
        onRetry: a(B),
        onClose: s[9] || (s[9] = (o) => u.value = !1),
        onSaved: ke
      }, null, 8, ["open", "api", "engines", "models", "target", "load-error", "onRetry"]),
      le.value ? (g(), m("div", {
        key: 2,
        ref_key: "shareHost",
        ref: de
      }, null, 512)) : D("", !0)
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
