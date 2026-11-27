import { openBlock as l, createElementBlock as p, mergeProps as w, createElementVNode as v, renderSlot as M, createTextVNode as ue, toDisplayString as _, resolveComponent as ee, resolveDirective as it, withDirectives as Ce, createBlock as N, resolveDynamicComponent as Pe, withCtx as Z, createCommentVNode as x, normalizeClass as se, watch as pe, onBeforeUnmount as Ie, computed as G, createVNode as T, Transition as St, Fragment as Y, renderList as ge, normalizeProps as Yt, createSlots as Xt, withModifiers as Jt, defineComponent as ze, ref as F, onMounted as Ue, nextTick as qe, unref as j, vModelText as We, vShow as Qt } from "vue";
import { Icon as ce } from "@iconify/vue";
import { c as ye, B as fe, d as xt, e as me, s as Se, f as de, R as rt, L as Ot, g as J, v as Le, h as en, U as tn, I as st, i as nn, r as $t, j as on, k as Lt, m as _t, C as rn, n as an, S as zt, _ as ln, x as _e, o as sn, z as Et, p as Re, q as Ee, T as Fe, F as dn, M as dt, t as un, w as cn, Y as pn, y as fn, A as bn, D as hn, O as mn, $ as vn, J as gn, E as $e } from "./wc-runtime-CPT3aEO7.js";
import { on as yn, loadByTagName as Ne, api as ve } from "@wippy-fe/proxy";
import { a as kn, s as wn } from "./componentRealtime-m98w4dre.js";
var Ge = {
  name: "SpinnerIcon",
  extends: ye
};
function Cn(t) {
  return On(t) || xn(t) || Sn(t) || In();
}
function In() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Sn(t, e) {
  if (t) {
    if (typeof t == "string") return Ze(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ze(t, e) : void 0;
  }
}
function xn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function On(t) {
  if (Array.isArray(t)) return Ze(t);
}
function Ze(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function $n(t, e, n, o, r, i) {
  return l(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Cn(e[0] || (e[0] = [v("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ge.render = $n;
var Ln = `
    .p-badge {
        display: inline-flex;
        border-radius: dt('badge.border.radius');
        align-items: center;
        justify-content: center;
        padding: dt('badge.padding');
        background: dt('badge.primary.background');
        color: dt('badge.primary.color');
        font-size: dt('badge.font.size');
        font-weight: dt('badge.font.weight');
        min-width: dt('badge.min.width');
        height: dt('badge.height');
    }

    .p-badge-dot {
        width: dt('badge.dot.size');
        min-width: dt('badge.dot.size');
        height: dt('badge.dot.size');
        border-radius: 50%;
        padding: 0;
    }

    .p-badge-circle {
        padding: 0;
        border-radius: 50%;
    }

    .p-badge-secondary {
        background: dt('badge.secondary.background');
        color: dt('badge.secondary.color');
    }

    .p-badge-success {
        background: dt('badge.success.background');
        color: dt('badge.success.color');
    }

    .p-badge-info {
        background: dt('badge.info.background');
        color: dt('badge.info.color');
    }

    .p-badge-warn {
        background: dt('badge.warn.background');
        color: dt('badge.warn.color');
    }

    .p-badge-danger {
        background: dt('badge.danger.background');
        color: dt('badge.danger.color');
    }

    .p-badge-contrast {
        background: dt('badge.contrast.background');
        color: dt('badge.contrast.color');
    }

    .p-badge-sm {
        font-size: dt('badge.sm.font.size');
        min-width: dt('badge.sm.min.width');
        height: dt('badge.sm.height');
    }

    .p-badge-lg {
        font-size: dt('badge.lg.font.size');
        min-width: dt('badge.lg.min.width');
        height: dt('badge.lg.height');
    }

    .p-badge-xl {
        font-size: dt('badge.xl.font.size');
        min-width: dt('badge.xl.min.width');
        height: dt('badge.xl.height');
    }
`, _n = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": me(n.value) && String(n.value).length === 1,
      "p-badge-dot": xt(n.value) && !o.$slots.default,
      "p-badge-sm": n.size === "small",
      "p-badge-lg": n.size === "large",
      "p-badge-xl": n.size === "xlarge",
      "p-badge-info": n.severity === "info",
      "p-badge-success": n.severity === "success",
      "p-badge-warn": n.severity === "warn",
      "p-badge-danger": n.severity === "danger",
      "p-badge-secondary": n.severity === "secondary",
      "p-badge-contrast": n.severity === "contrast"
    }];
  }
}, zn = fe.extend({
  name: "badge",
  style: Ln,
  classes: _n
}), En = {
  name: "BaseBadge",
  extends: Se,
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    severity: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    }
  },
  style: zn,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function De(t) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, De(t);
}
function ut(t, e, n) {
  return (e = Fn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Fn(t) {
  var e = An(t, "string");
  return De(e) == "symbol" ? e : e + "";
}
function An(t, e) {
  if (De(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (De(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ft = {
  name: "Badge",
  extends: En,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return de(ut(ut({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Pn = ["data-p"];
function Dn(t, e, n, o, r, i) {
  return l(), p("span", w({
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [M(t.$slots, "default", {}, function() {
    return [ue(_(t.value), 1)];
  })], 16, Pn);
}
Ft.render = Dn;
var Mn = `
    .p-button {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        color: dt('button.primary.color');
        background: dt('button.primary.background');
        border: 1px solid dt('button.primary.border.color');
        padding: dt('button.padding.y') dt('button.padding.x');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('button.transition.duration'),
            color dt('button.transition.duration'),
            border-color dt('button.transition.duration'),
            outline-color dt('button.transition.duration'),
            box-shadow dt('button.transition.duration');
        border-radius: dt('button.border.radius');
        outline-color: transparent;
        gap: dt('button.gap');
    }

    .p-button:disabled {
        cursor: default;
    }

    .p-button-icon-right {
        order: 1;
    }

    .p-button-icon-right:dir(rtl) {
        order: -1;
    }

    .p-button:not(.p-button-vertical) .p-button-icon:not(.p-button-icon-right):dir(rtl) {
        order: 1;
    }

    .p-button-icon-bottom {
        order: 2;
    }

    .p-button-icon-only {
        width: dt('button.icon.only.width');
        padding-inline-start: 0;
        padding-inline-end: 0;
        gap: 0;
    }

    .p-button-icon-only.p-button-rounded {
        border-radius: 50%;
        height: dt('button.icon.only.width');
    }

    .p-button-icon-only .p-button-label {
        visibility: hidden;
        width: 0;
    }

    .p-button-icon-only::after {
        content: " ";
        visibility: hidden;
        width: 0;
    }

    .p-button-sm {
        font-size: dt('button.sm.font.size');
        padding: dt('button.sm.padding.y') dt('button.sm.padding.x');
    }

    .p-button-sm .p-button-icon {
        font-size: dt('button.sm.font.size');
    }

    .p-button-sm.p-button-icon-only {
        width: dt('button.sm.icon.only.width');
    }

    .p-button-sm.p-button-icon-only.p-button-rounded {
        height: dt('button.sm.icon.only.width');
    }

    .p-button-lg {
        font-size: dt('button.lg.font.size');
        padding: dt('button.lg.padding.y') dt('button.lg.padding.x');
    }

    .p-button-lg .p-button-icon {
        font-size: dt('button.lg.font.size');
    }

    .p-button-lg.p-button-icon-only {
        width: dt('button.lg.icon.only.width');
    }

    .p-button-lg.p-button-icon-only.p-button-rounded {
        height: dt('button.lg.icon.only.width');
    }

    .p-button-vertical {
        flex-direction: column;
    }

    .p-button-label {
        font-weight: dt('button.label.font.weight');
    }

    .p-button-fluid {
        width: 100%;
    }

    .p-button-fluid.p-button-icon-only {
        width: dt('button.icon.only.width');
    }

    .p-button:not(:disabled):hover {
        background: dt('button.primary.hover.background');
        border: 1px solid dt('button.primary.hover.border.color');
        color: dt('button.primary.hover.color');
    }

    .p-button:not(:disabled):active {
        background: dt('button.primary.active.background');
        border: 1px solid dt('button.primary.active.border.color');
        color: dt('button.primary.active.color');
    }

    .p-button:focus-visible {
        box-shadow: dt('button.primary.focus.ring.shadow');
        outline: dt('button.focus.ring.width') dt('button.focus.ring.style') dt('button.primary.focus.ring.color');
        outline-offset: dt('button.focus.ring.offset');
    }

    .p-button .p-badge {
        min-width: dt('button.badge.size');
        height: dt('button.badge.size');
        line-height: dt('button.badge.size');
    }

    .p-button-raised {
        box-shadow: dt('button.raised.shadow');
    }

    .p-button-rounded {
        border-radius: dt('button.rounded.border.radius');
    }

    .p-button-secondary {
        background: dt('button.secondary.background');
        border: 1px solid dt('button.secondary.border.color');
        color: dt('button.secondary.color');
    }

    .p-button-secondary:not(:disabled):hover {
        background: dt('button.secondary.hover.background');
        border: 1px solid dt('button.secondary.hover.border.color');
        color: dt('button.secondary.hover.color');
    }

    .p-button-secondary:not(:disabled):active {
        background: dt('button.secondary.active.background');
        border: 1px solid dt('button.secondary.active.border.color');
        color: dt('button.secondary.active.color');
    }

    .p-button-secondary:focus-visible {
        outline-color: dt('button.secondary.focus.ring.color');
        box-shadow: dt('button.secondary.focus.ring.shadow');
    }

    .p-button-success {
        background: dt('button.success.background');
        border: 1px solid dt('button.success.border.color');
        color: dt('button.success.color');
    }

    .p-button-success:not(:disabled):hover {
        background: dt('button.success.hover.background');
        border: 1px solid dt('button.success.hover.border.color');
        color: dt('button.success.hover.color');
    }

    .p-button-success:not(:disabled):active {
        background: dt('button.success.active.background');
        border: 1px solid dt('button.success.active.border.color');
        color: dt('button.success.active.color');
    }

    .p-button-success:focus-visible {
        outline-color: dt('button.success.focus.ring.color');
        box-shadow: dt('button.success.focus.ring.shadow');
    }

    .p-button-info {
        background: dt('button.info.background');
        border: 1px solid dt('button.info.border.color');
        color: dt('button.info.color');
    }

    .p-button-info:not(:disabled):hover {
        background: dt('button.info.hover.background');
        border: 1px solid dt('button.info.hover.border.color');
        color: dt('button.info.hover.color');
    }

    .p-button-info:not(:disabled):active {
        background: dt('button.info.active.background');
        border: 1px solid dt('button.info.active.border.color');
        color: dt('button.info.active.color');
    }

    .p-button-info:focus-visible {
        outline-color: dt('button.info.focus.ring.color');
        box-shadow: dt('button.info.focus.ring.shadow');
    }

    .p-button-warn {
        background: dt('button.warn.background');
        border: 1px solid dt('button.warn.border.color');
        color: dt('button.warn.color');
    }

    .p-button-warn:not(:disabled):hover {
        background: dt('button.warn.hover.background');
        border: 1px solid dt('button.warn.hover.border.color');
        color: dt('button.warn.hover.color');
    }

    .p-button-warn:not(:disabled):active {
        background: dt('button.warn.active.background');
        border: 1px solid dt('button.warn.active.border.color');
        color: dt('button.warn.active.color');
    }

    .p-button-warn:focus-visible {
        outline-color: dt('button.warn.focus.ring.color');
        box-shadow: dt('button.warn.focus.ring.shadow');
    }

    .p-button-help {
        background: dt('button.help.background');
        border: 1px solid dt('button.help.border.color');
        color: dt('button.help.color');
    }

    .p-button-help:not(:disabled):hover {
        background: dt('button.help.hover.background');
        border: 1px solid dt('button.help.hover.border.color');
        color: dt('button.help.hover.color');
    }

    .p-button-help:not(:disabled):active {
        background: dt('button.help.active.background');
        border: 1px solid dt('button.help.active.border.color');
        color: dt('button.help.active.color');
    }

    .p-button-help:focus-visible {
        outline-color: dt('button.help.focus.ring.color');
        box-shadow: dt('button.help.focus.ring.shadow');
    }

    .p-button-danger {
        background: dt('button.danger.background');
        border: 1px solid dt('button.danger.border.color');
        color: dt('button.danger.color');
    }

    .p-button-danger:not(:disabled):hover {
        background: dt('button.danger.hover.background');
        border: 1px solid dt('button.danger.hover.border.color');
        color: dt('button.danger.hover.color');
    }

    .p-button-danger:not(:disabled):active {
        background: dt('button.danger.active.background');
        border: 1px solid dt('button.danger.active.border.color');
        color: dt('button.danger.active.color');
    }

    .p-button-danger:focus-visible {
        outline-color: dt('button.danger.focus.ring.color');
        box-shadow: dt('button.danger.focus.ring.shadow');
    }

    .p-button-contrast {
        background: dt('button.contrast.background');
        border: 1px solid dt('button.contrast.border.color');
        color: dt('button.contrast.color');
    }

    .p-button-contrast:not(:disabled):hover {
        background: dt('button.contrast.hover.background');
        border: 1px solid dt('button.contrast.hover.border.color');
        color: dt('button.contrast.hover.color');
    }

    .p-button-contrast:not(:disabled):active {
        background: dt('button.contrast.active.background');
        border: 1px solid dt('button.contrast.active.border.color');
        color: dt('button.contrast.active.color');
    }

    .p-button-contrast:focus-visible {
        outline-color: dt('button.contrast.focus.ring.color');
        box-shadow: dt('button.contrast.focus.ring.shadow');
    }

    .p-button-outlined {
        background: transparent;
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):hover {
        background: dt('button.outlined.primary.hover.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):active {
        background: dt('button.outlined.primary.active.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined.p-button-secondary {
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):hover {
        background: dt('button.outlined.secondary.hover.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):active {
        background: dt('button.outlined.secondary.active.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-success {
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):hover {
        background: dt('button.outlined.success.hover.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):active {
        background: dt('button.outlined.success.active.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-info {
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):hover {
        background: dt('button.outlined.info.hover.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):active {
        background: dt('button.outlined.info.active.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-warn {
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):hover {
        background: dt('button.outlined.warn.hover.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):active {
        background: dt('button.outlined.warn.active.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-help {
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):hover {
        background: dt('button.outlined.help.hover.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):active {
        background: dt('button.outlined.help.active.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-danger {
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):hover {
        background: dt('button.outlined.danger.hover.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):active {
        background: dt('button.outlined.danger.active.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-contrast {
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):hover {
        background: dt('button.outlined.contrast.hover.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):active {
        background: dt('button.outlined.contrast.active.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-plain {
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):hover {
        background: dt('button.outlined.plain.hover.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):active {
        background: dt('button.outlined.plain.active.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-text {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):hover {
        background: dt('button.text.primary.hover.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):active {
        background: dt('button.text.primary.active.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text.p-button-secondary {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):hover {
        background: dt('button.text.secondary.hover.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):active {
        background: dt('button.text.secondary.active.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-success {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):hover {
        background: dt('button.text.success.hover.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):active {
        background: dt('button.text.success.active.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-info {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):hover {
        background: dt('button.text.info.hover.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):active {
        background: dt('button.text.info.active.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-warn {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):hover {
        background: dt('button.text.warn.hover.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):active {
        background: dt('button.text.warn.active.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-help {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):hover {
        background: dt('button.text.help.hover.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):active {
        background: dt('button.text.help.active.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-danger {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):hover {
        background: dt('button.text.danger.hover.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):active {
        background: dt('button.text.danger.active.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-contrast {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):hover {
        background: dt('button.text.contrast.hover.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):active {
        background: dt('button.text.contrast.active.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-plain {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):hover {
        background: dt('button.text.plain.hover.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):active {
        background: dt('button.text.plain.active.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-link {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.color');
    }

    .p-button-link:not(:disabled):hover {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.hover.color');
    }

    .p-button-link:not(:disabled):hover .p-button-label {
        text-decoration: underline;
    }

    .p-button-link:not(:disabled):active {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.active.color');
    }
`;
function Me(t) {
  "@babel/helpers - typeof";
  return Me = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Me(t);
}
function le(t, e, n) {
  return (e = Tn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Tn(t) {
  var e = Vn(t, "string");
  return Me(e) == "symbol" ? e : e + "";
}
function Vn(t, e) {
  if (Me(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Me(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Bn = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", le(le(le(le(le(le(le(le(le({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", le({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, jn = fe.extend({
  name: "button",
  style: Mn,
  classes: Bn
}), Hn = {
  name: "BaseButton",
  extends: Se,
  props: {
    label: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconPos: {
      type: String,
      default: "left"
    },
    iconClass: {
      type: [String, Object],
      default: null
    },
    badge: {
      type: String,
      default: null
    },
    badgeClass: {
      type: [String, Object],
      default: null
    },
    badgeSeverity: {
      type: String,
      default: "secondary"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    as: {
      type: [String, Object],
      default: "BUTTON"
    },
    asChild: {
      type: Boolean,
      default: !1
    },
    link: {
      type: Boolean,
      default: !1
    },
    severity: {
      type: String,
      default: null
    },
    raised: {
      type: Boolean,
      default: !1
    },
    rounded: {
      type: Boolean,
      default: !1
    },
    text: {
      type: Boolean,
      default: !1
    },
    outlined: {
      type: Boolean,
      default: !1
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    },
    plain: {
      type: Boolean,
      default: !1
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: jn,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function Te(t) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Te(t);
}
function Q(t, e, n) {
  return (e = Kn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Kn(t) {
  var e = Rn(t, "string");
  return Te(e) == "symbol" ? e : e + "";
}
function Rn(t, e) {
  if (Te(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Te(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var W = {
  name: "Button",
  extends: Hn,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          disabled: this.disabled
        }
      });
    }
  },
  computed: {
    disabled: function() {
      return this.$attrs.disabled || this.$attrs.disabled === "" || this.loading;
    },
    defaultAriaLabel: function() {
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : this.$attrs.ariaLabel;
    },
    hasIcon: function() {
      return this.icon || this.$slots.icon;
    },
    attrs: function() {
      return w(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
    },
    asAttrs: function() {
      return this.as === "BUTTON" ? {
        type: "button",
        disabled: this.disabled
      } : void 0;
    },
    a11yAttrs: function() {
      return {
        "aria-label": this.defaultAriaLabel,
        "data-pc-name": "button",
        "data-p-disabled": this.disabled,
        "data-p-severity": this.severity
      };
    },
    hasFluid: function() {
      return xt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return de(Q(Q(Q(Q(Q(Q(Q(Q(Q(Q({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return de(Q(Q({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return de(Q(Q({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Ge,
    Badge: Ft
  },
  directives: {
    ripple: rt
  }
}, Nn = ["data-p"], Un = ["data-p"];
function Gn(t, e, n, o, r, i) {
  var s = ee("SpinnerIcon"), f = ee("Badge"), u = it("ripple");
  return t.asChild ? M(t.$slots, "default", {
    key: 1,
    class: se(t.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : Ce((l(), N(Pe(t.as), w({
    key: 0,
    class: t.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: Z(function() {
      return [M(t.$slots, "default", {}, function() {
        return [t.loading ? M(t.$slots, "loadingicon", w({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (l(), p("span", w({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (l(), N(s, w({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : M(t.$slots, "icon", w({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (l(), p("span", w({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": i.dataIconP
          }, t.ptm("icon")), null, 16, Nn)) : x("", !0)];
        }), t.label ? (l(), p("span", w({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": i.dataLabelP
        }), _(t.label), 17, Un)) : x("", !0), t.badge ? (l(), N(f, {
          key: 3,
          value: t.badge,
          class: se(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : x("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[u]]);
}
W.render = Gn;
function Wn(t, e, n, o) {
  const r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map();
  function s(c, a) {
    const b = t.value.find((P) => e(P) === c), d = i.get(c), C = a?.job_id || d?.state.deletion_job_id || b?.deletion_job_id, $ = d ? d.state.deletion_job_id : b?.deleting_at ? b.deletion_job_id : void 0;
    if ((d || b?.deleting_at) && C === $ || C && d?.superseded.has(C)) return;
    const S = {
      deleting_at: d?.state.deleting_at || b?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: C
    }, O = new Set(d?.superseded);
    for (const P of [d?.state.deletion_job_id, b?.deletion_job_id])
      P && P !== C && O.add(P);
    i.set(c, { state: S, superseded: O }), b && (Object.assign(b, S), b.deletion_job = void 0);
  }
  const f = pe(() => t.value, (c, a = []) => {
    const b = c.filter((d) => !r.has(e(d)));
    for (const d of a)
      r.has(e(d)) || b.some((C) => e(C) === e(d)) || (n?.(e(d)), d.deleting_at && o?.(e(d)));
    if (b.length !== c.length) {
      t.value = b;
      return;
    }
    for (const d of c) {
      d.deleting_at && d.deletion_job === void 0 && !a.includes(d) && (d.deletion_job = null);
      const C = i.get(e(d));
      if (C) {
        const S = d.deletion_job_id;
        d.deleting_at && S && S !== C.state.deletion_job_id && !C.superseded.has(S) && (C.state.deletion_job_id && C.superseded.add(C.state.deletion_job_id), C.state.deletion_job_id = S), S !== C.state.deletion_job_id && (d.deletion_job = void 0), Object.assign(d, C.state);
      }
      const $ = a.find((S) => e(S) === e(d));
      d.deletion_job === void 0 && $?.deletion_job_id === d.deletion_job_id && (d.deletion_job = $?.deletion_job);
    }
  }, { immediate: !0 }), u = yn("@message", (c) => {
    const a = kn(c);
    if (!a) return;
    const b = t.value.find((d) => e(d) === a.component_id);
    a.event === "component.deleted" ? (b && !r.has(a.component_id) && (n?.(a.component_id), o?.(a.component_id)), r.add(a.component_id), i.delete(a.component_id), t.value = t.value.filter((d) => e(d) !== a.component_id)) : b && s(a.component_id, { job_id: a.deletion_job_id });
  });
  return Ie(() => {
    f(), typeof u == "function" && u();
  }), { acceptDeletion: s };
}
var at = {
  name: "TimesIcon",
  extends: ye
};
function qn(t) {
  return Jn(t) || Xn(t) || Yn(t) || Zn();
}
function Zn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Yn(t, e) {
  if (t) {
    if (typeof t == "string") return Ye(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ye(t, e) : void 0;
  }
}
function Xn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Jn(t) {
  if (Array.isArray(t)) return Ye(t);
}
function Ye(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Qn(t, e, n, o, r, i) {
  return l(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), qn(e[0] || (e[0] = [v("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
at.render = Qn;
var At = {
  name: "WindowMaximizeIcon",
  extends: ye
};
function eo(t) {
  return io(t) || oo(t) || no(t) || to();
}
function to() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function no(t, e) {
  if (t) {
    if (typeof t == "string") return Xe(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xe(t, e) : void 0;
  }
}
function oo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function io(t) {
  if (Array.isArray(t)) return Xe(t);
}
function Xe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function ro(t, e, n, o, r, i) {
  return l(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), eo(e[0] || (e[0] = [v("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
At.render = ro;
var Pt = {
  name: "WindowMinimizeIcon",
  extends: ye
};
function ao(t) {
  return co(t) || uo(t) || so(t) || lo();
}
function lo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function so(t, e) {
  if (t) {
    if (typeof t == "string") return Je(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Je(t, e) : void 0;
  }
}
function uo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function co(t) {
  if (Array.isArray(t)) return Je(t);
}
function Je(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function po(t, e, n, o, r, i) {
  return l(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ao(e[0] || (e[0] = [v("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Pt.render = po;
var fo = fe.extend({
  name: "focustrap-directive"
}), bo = en.extend({
  style: fo
});
function Ve(t) {
  "@babel/helpers - typeof";
  return Ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ve(t);
}
function ct(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function pt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ct(Object(n), !0).forEach(function(o) {
      ho(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ct(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function ho(t, e, n) {
  return (e = mo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function mo(t) {
  var e = vo(t, "string");
  return Ve(e) == "symbol" ? e : e + "";
}
function vo(t, e) {
  if (Ve(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ve(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var go = bo.extend("focustrap", {
  mounted: function(e, n) {
    var o = n.value || {}, r = o.disabled;
    r || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var o = n.value || {}, r = o.disabled;
    r && this.unbind(e);
  },
  unmounted: function(e) {
    this.unbind(e);
  },
  methods: {
    getComputedSelector: function(e) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(e ?? "");
    },
    bind: function(e, n) {
      var o = this, r = n.value || {}, i = r.onFocusIn, s = r.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(f) {
        f.forEach(function(u) {
          if (u.type === "childList" && !e.contains(document.activeElement)) {
            var c = function(b) {
              var d = st(b) ? st(b, o.getComputedSelector(e.$_pfocustrap_focusableselector)) ? b : Le(e, o.getComputedSelector(e.$_pfocustrap_focusableselector)) : Le(b);
              return me(d) ? d : b.nextSibling && c(b.nextSibling);
            };
            J(c(u.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(f) {
        return i && i(f);
      }, e.$_pfocustrap_focusoutlistener = function(f) {
        return s && s(f);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: pt(pt({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var o = n.value || {}, r = o.autoFocusSelector, i = r === void 0 ? "" : r, s = o.firstFocusableSelector, f = s === void 0 ? "" : s, u = o.autoFocus, c = u === void 0 ? !1 : u, a = Le(e, "[autofocus]".concat(this.getComputedSelector(i)));
      c && !a && (a = Le(e, this.getComputedSelector(f))), J(a);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, r = e.relatedTarget, i = r === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(r)) ? Le(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      J(i);
    },
    onLastHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, r = e.relatedTarget, i = r === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(r)) ? Ot(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      J(i);
    },
    createHiddenFocusableElements: function(e, n) {
      var o = this, r = n.value || {}, i = r.tabIndex, s = i === void 0 ? 0 : i, f = r.firstFocusableSelector, u = f === void 0 ? "" : f, c = r.lastFocusableSelector, a = c === void 0 ? "" : c, b = function(S) {
        return tn("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: s,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: S?.bind(o)
        });
      }, d = b(this.onFirstHiddenElementFocus), C = b(this.onLastHiddenElementFocus);
      d.$_pfocustrap_lasthiddenfocusableelement = C, d.$_pfocustrap_focusableselector = u, d.setAttribute("data-pc-section", "firstfocusableelement"), C.$_pfocustrap_firsthiddenfocusableelement = d, C.$_pfocustrap_focusableselector = a, C.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(d), e.append(C);
    }
  }
});
function ft() {
  on({
    variableName: $t("scrollbar.width").name
  });
}
function bt() {
  nn({
    variableName: $t("scrollbar.width").name
  });
}
var yo = `
    .p-dialog {
        max-height: 90%;
        transform: scale(1);
        border-radius: dt('dialog.border.radius');
        box-shadow: dt('dialog.shadow');
        background: dt('dialog.background');
        border: 1px solid dt('dialog.border.color');
        color: dt('dialog.color');
        will-change: transform;
    }

    .p-dialog-content {
        overflow-y: auto;
        padding: dt('dialog.content.padding');
        flex-grow: 1;
    }

    .p-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('dialog.header.padding');
    }

    .p-dialog-title {
        font-weight: dt('dialog.title.font.weight');
        font-size: dt('dialog.title.font.size');
    }

    .p-dialog-footer {
        flex-shrink: 0;
        padding: dt('dialog.footer.padding');
        display: flex;
        justify-content: flex-end;
        gap: dt('dialog.footer.gap');
    }

    .p-dialog-header-actions {
        display: flex;
        align-items: center;
        gap: dt('dialog.header.gap');
    }

    .p-dialog-top .p-dialog,
    .p-dialog-bottom .p-dialog,
    .p-dialog-left .p-dialog,
    .p-dialog-right .p-dialog,
    .p-dialog-topleft .p-dialog,
    .p-dialog-topright .p-dialog,
    .p-dialog-bottomleft .p-dialog,
    .p-dialog-bottomright .p-dialog {
        margin: 1rem;
    }

    .p-dialog-maximized {
        width: 100vw !important;
        height: 100vh !important;
        top: 0px !important;
        left: 0px !important;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
    }

    .p-dialog .p-resizable-handle {
        position: absolute;
        font-size: 0.1px;
        display: block;
        cursor: se-resize;
        width: 12px;
        height: 12px;
        right: 1px;
        bottom: 1px;
    }

    .p-dialog-enter-active {
        animation: p-animate-dialog-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-dialog-leave-active {
        animation: p-animate-dialog-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-dialog-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-dialog-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`, ko = {
  mask: function(e) {
    var n = e.position, o = e.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: o ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, wo = {
  mask: function(e) {
    var n = e.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], r = o.find(function(i) {
      return i === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, r ? "p-dialog-".concat(r) : ""];
  },
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && o.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, Co = fe.extend({
  name: "dialog",
  style: yo,
  classes: wo,
  inlineStyles: ko
}), Io = {
  name: "BaseDialog",
  extends: Se,
  props: {
    header: {
      type: null,
      default: null
    },
    footer: {
      type: null,
      default: null
    },
    visible: {
      type: Boolean,
      default: !1
    },
    modal: {
      type: Boolean,
      default: null
    },
    contentStyle: {
      type: null,
      default: null
    },
    contentClass: {
      type: String,
      default: null
    },
    contentProps: {
      type: null,
      default: null
    },
    maximizable: {
      type: Boolean,
      default: !1
    },
    dismissableMask: {
      type: Boolean,
      default: !1
    },
    closable: {
      type: Boolean,
      default: !0
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    },
    showHeader: {
      type: Boolean,
      default: !0
    },
    blockScroll: {
      type: Boolean,
      default: !1
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    position: {
      type: String,
      default: "center"
    },
    breakpoints: {
      type: Object,
      default: null
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    keepInViewport: {
      type: Boolean,
      default: !0
    },
    minX: {
      type: Number,
      default: 0
    },
    minY: {
      type: Number,
      default: 0
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    maximizeIcon: {
      type: String,
      default: void 0
    },
    minimizeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    maximizeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    _instance: null
  },
  style: Co,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Dt = {
  name: "Dialog",
  extends: Io,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: G(function() {
        return e._instance;
      })
    };
  },
  data: function() {
    return {
      containerVisible: this.visible,
      maximized: !1,
      focusableMax: null,
      focusableClose: null,
      target: null
    };
  },
  documentKeydownListener: null,
  container: null,
  mask: null,
  content: null,
  headerContainer: null,
  footerContainer: null,
  maximizableButton: null,
  closeButton: null,
  styleElement: null,
  dragging: null,
  documentDragListener: null,
  documentDragEndListener: null,
  lastPageX: null,
  lastPageY: null,
  maskMouseDownTarget: null,
  updated: function() {
    this.visible && (this.containerVisible = this.visible);
  },
  beforeUnmount: function() {
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && _e.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && _e.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && sn(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), J(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && _e.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(e) {
      this.maskMouseDownTarget = e.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var e = function(r) {
        return r && r.querySelector("[autofocus]");
      }, n = this.$slots.footer && e(this.footerContainer);
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && J(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? ft() : bt());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && ft();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && bt();
    },
    onKeyDown: function(e) {
      e.code === "Escape" && this.closeOnEscape && !e.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(e) {
      this.container = e;
    },
    maskRef: function(e) {
      this.mask = e;
    },
    contentRef: function(e) {
      this.content = e;
    },
    headerContainerRef: function(e) {
      this.headerContainer = e;
    },
    footerContainerRef: function(e) {
      this.footerContainer = e;
    },
    maximizableRef: function(e) {
      this.maximizableButton = e ? e.$el : void 0;
    },
    closeButtonRef: function(e) {
      this.closeButton = e ? e.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var e;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", ln(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var o in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(o, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[o], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = n;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(e) {
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && zt(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", e));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var e = this;
      this.documentDragListener = function(n) {
        if (e.dragging) {
          var o = _t(e.container), r = rn(e.container), i = n.pageX - e.lastPageX, s = n.pageY - e.lastPageY, f = e.container.getBoundingClientRect(), u = f.left + i, c = f.top + s, a = an(), b = getComputedStyle(e.container), d = parseFloat(b.marginLeft), C = parseFloat(b.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (u >= e.minX && u + o < a.width && (e.lastPageX = n.pageX, e.container.style.left = u - d + "px"), c >= e.minY && c + r < a.height && (e.lastPageY = n.pageY, e.container.style.top = c - C + "px")) : (e.lastPageX = n.pageX, e.container.style.left = u - d + "px", e.lastPageY = n.pageY, e.container.style.top = c - C + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var e = this;
      this.documentDragEndListener = function(n) {
        e.dragging && (e.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !e.isUnstyled && (document.body.style["user-select"] = ""), e.$emit("dragend", n));
      }, window.document.addEventListener("mouseup", this.documentDragEndListener);
    },
    unbindDocumentDragEndListener: function() {
      this.documentDragEndListener && (window.document.removeEventListener("mouseup", this.documentDragEndListener), this.documentDragEndListener = null);
    }
  },
  computed: {
    maximizeIconComponent: function() {
      return this.maximized ? this.minimizeIcon ? "span" : "WindowMinimizeIcon" : this.maximizeIcon ? "span" : "WindowMaximizeIcon";
    },
    ariaLabelledById: function() {
      return this.header != null || this.$attrs["aria-labelledby"] !== null ? this.$id + "_header" : null;
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return de({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: rt,
    focustrap: go
  },
  components: {
    Button: W,
    Portal: Lt,
    WindowMinimizeIcon: Pt,
    WindowMaximizeIcon: At,
    TimesIcon: at
  }
};
function Be(t) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Be(t);
}
function ht(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function mt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ht(Object(n), !0).forEach(function(o) {
      So(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ht(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function So(t, e, n) {
  return (e = xo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function xo(t) {
  var e = Oo(t, "string");
  return Be(e) == "symbol" ? e : e + "";
}
function Oo(t, e) {
  if (Be(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Be(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var $o = ["data-p"], Lo = ["aria-labelledby", "aria-modal", "data-p"], _o = ["id"], zo = ["data-p"];
function Eo(t, e, n, o, r, i) {
  var s = ee("Button"), f = ee("Portal"), u = it("focustrap");
  return l(), N(f, {
    appendTo: t.appendTo
  }, {
    default: Z(function() {
      return [r.containerVisible ? (l(), p("div", w({
        key: 0,
        ref: i.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return i.onMaskMouseDown && i.onMaskMouseDown.apply(i, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return i.onMaskMouseUp && i.onMaskMouseUp.apply(i, arguments);
        }),
        "data-p": i.dataP
      }, t.ptm("mask")), [T(St, w({
        name: "p-dialog",
        onEnter: i.onEnter,
        onAfterEnter: i.onAfterEnter,
        onBeforeLeave: i.onBeforeLeave,
        onLeave: i.onLeave,
        onAfterLeave: i.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: Z(function() {
          return [t.visible ? Ce((l(), p("div", w({
            key: 0,
            ref: i.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": i.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": i.dataP
          }, t.ptmi("root")), [t.$slots.container ? M(t.$slots, "container", {
            key: 0,
            closeCallback: i.close,
            maximizeCallback: function(a) {
              return i.maximize(a);
            },
            initDragCallback: i.initDrag
          }) : (l(), p(Y, {
            key: 1
          }, [t.showHeader ? (l(), p("div", w({
            key: 0,
            ref: i.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return i.initDrag && i.initDrag.apply(i, arguments);
            })
          }, t.ptm("header")), [M(t.$slots, "header", {
            class: se(t.cx("title"))
          }, function() {
            return [t.header ? (l(), p("span", w({
              key: 0,
              id: i.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), _(t.header), 17, _o)) : x("", !0)];
          }), v("div", w({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? M(t.$slots, "maximizebutton", {
            key: 0,
            maximized: r.maximized,
            maximizeCallback: function(a) {
              return i.maximize(a);
            }
          }, function() {
            return [T(s, w({
              ref: i.maximizableRef,
              autofocus: r.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: i.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: Z(function(c) {
                return [M(t.$slots, "maximizeicon", {
                  maximized: r.maximized
                }, function() {
                  return [(l(), N(Pe(i.maximizeIconComponent), w({
                    class: [c.class, r.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : x("", !0), t.closable ? M(t.$slots, "closebutton", {
            key: 1,
            closeCallback: i.close
          }, function() {
            return [T(s, w({
              ref: i.closeButtonRef,
              autofocus: r.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: i.close,
              "aria-label": i.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: Z(function(c) {
                return [M(t.$slots, "closeicon", {}, function() {
                  return [(l(), N(Pe(t.closeIcon ? "span" : "TimesIcon"), w({
                    class: [t.closeIcon, c.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : x("", !0)], 16)], 16)) : x("", !0), v("div", w({
            ref: i.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": i.dataP
          }, mt(mt({}, t.contentProps), t.ptm("content"))), [M(t.$slots, "default")], 16, zo), t.footer || t.$slots.footer ? (l(), p("div", w({
            key: 1,
            ref: i.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [M(t.$slots, "footer", {}, function() {
            return [ue(_(t.footer), 1)];
          })], 16)) : x("", !0)], 64))], 16, Lo)), [[u, {
            disabled: !t.modal
          }]]) : x("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, $o)) : x("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Dt.render = Eo;
var Mt = {
  name: "BlankIcon",
  extends: ye
};
function Fo(t) {
  return Mo(t) || Do(t) || Po(t) || Ao();
}
function Ao() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Po(t, e) {
  if (t) {
    if (typeof t == "string") return Qe(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qe(t, e) : void 0;
  }
}
function Do(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Mo(t) {
  if (Array.isArray(t)) return Qe(t);
}
function Qe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function To(t, e, n, o, r, i) {
  return l(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Fo(e[0] || (e[0] = [v("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Mt.render = To;
var Tt = {
  name: "CheckIcon",
  extends: ye
};
function Vo(t) {
  return Ko(t) || Ho(t) || jo(t) || Bo();
}
function Bo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jo(t, e) {
  if (t) {
    if (typeof t == "string") return et(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? et(t, e) : void 0;
  }
}
function Ho(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ko(t) {
  if (Array.isArray(t)) return et(t);
}
function et(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Ro(t, e, n, o, r, i) {
  return l(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Vo(e[0] || (e[0] = [v("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Tt.render = Ro;
var Vt = {
  name: "ChevronDownIcon",
  extends: ye
};
function No(t) {
  return qo(t) || Wo(t) || Go(t) || Uo();
}
function Uo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Go(t, e) {
  if (t) {
    if (typeof t == "string") return tt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tt(t, e) : void 0;
  }
}
function Wo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function qo(t) {
  if (Array.isArray(t)) return tt(t);
}
function tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Zo(t, e, n, o, r, i) {
  return l(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), No(e[0] || (e[0] = [v("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Vt.render = Zo;
var Bt = {
  name: "SearchIcon",
  extends: ye
};
function Yo(t) {
  return ei(t) || Qo(t) || Jo(t) || Xo();
}
function Xo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jo(t, e) {
  if (t) {
    if (typeof t == "string") return nt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nt(t, e) : void 0;
  }
}
function Qo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ei(t) {
  if (Array.isArray(t)) return nt(t);
}
function nt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function ti(t, e, n, o, r, i) {
  return l(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Yo(e[0] || (e[0] = [v("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Bt.render = ti;
var ni = `
    .p-iconfield {
        position: relative;
        display: block;
    }

    .p-inputicon {
        position: absolute;
        top: 50%;
        margin-top: calc(-1 * (dt('icon.size') / 2));
        color: dt('iconfield.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .p-iconfield .p-inputicon:first-child {
        inset-inline-start: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputicon:last-child {
        inset-inline-end: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputtext:not(:first-child),
    .p-iconfield .p-inputwrapper:not(:first-child) .p-inputtext {
        padding-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield .p-inputtext:not(:last-child) {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield:has(.p-inputfield-sm) .p-inputicon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
        margin-top: calc(-1 * (dt('form.field.sm.font.size') / 2));
    }

    .p-iconfield:has(.p-inputfield-lg) .p-inputicon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
        margin-top: calc(-1 * (dt('form.field.lg.font.size') / 2));
    }
`, oi = {
  root: "p-iconfield"
}, ii = fe.extend({
  name: "iconfield",
  style: ni,
  classes: oi
}), ri = {
  name: "BaseIconField",
  extends: Se,
  style: ii,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, jt = {
  name: "IconField",
  extends: ri,
  inheritAttrs: !1
};
function ai(t, e, n, o, r, i) {
  return l(), p("div", w({
    class: t.cx("root")
  }, t.ptmi("root")), [M(t.$slots, "default")], 16);
}
jt.render = ai;
var li = {
  root: "p-inputicon"
}, si = fe.extend({
  name: "inputicon",
  classes: li
}), di = {
  name: "BaseInputIcon",
  extends: Se,
  style: si,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, Ht = {
  name: "InputIcon",
  extends: di,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function ui(t, e, n, o, r, i) {
  return l(), p("span", w({
    class: i.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [M(t.$slots, "default")], 16);
}
Ht.render = ui;
var ci = {
  name: "BaseEditableHolder",
  extends: Se,
  emits: ["update:modelValue", "value-change"],
  props: {
    modelValue: {
      type: null,
      default: void 0
    },
    defaultValue: {
      type: null,
      default: void 0
    },
    name: {
      type: String,
      default: void 0
    },
    invalid: {
      type: Boolean,
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    formControl: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcForm: {
      default: void 0
    },
    $pcFormField: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_value: this.defaultValue !== void 0 ? this.defaultValue : this.modelValue
    };
  },
  watch: {
    modelValue: {
      deep: !0,
      handler: function(e) {
        this.d_value = e;
      }
    },
    defaultValue: function(e) {
      this.d_value = e;
    },
    $formName: {
      immediate: !0,
      handler: function(e) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, this.$formName, e)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(e) {
        this.d_value !== e && (this.d_value = e);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(e) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && e !== this.d_value && (this.d_value = e);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(e, n) {
      var o, r;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (o = (r = this.formField).onChange) === null || o === void 0 || o.call(r, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), o = 0; o < e; o++)
        n[o] = arguments[o];
      return n.find(me);
    }
  },
  computed: {
    $filled: function() {
      return me(this.d_value);
    },
    $invalid: function() {
      var e, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var e;
      return this.$formNovalidate ? void 0 : this.name || ((e = this.$formControl) === null || e === void 0 ? void 0 : e.name);
    },
    $formControl: function() {
      var e;
      return this.formControl || ((e = this.$pcFormField) === null || e === void 0 ? void 0 : e.formControl);
    },
    $formNovalidate: function() {
      var e;
      return (e = this.$formControl) === null || e === void 0 ? void 0 : e.novalidate;
    },
    $formDefaultValue: function() {
      var e, n;
      return this.findNonEmpty(this.d_value, (e = this.$pcFormField) === null || e === void 0 ? void 0 : e.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var e, n;
      return this.findNonEmpty((e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, Kt = {
  name: "BaseInput",
  extends: ci,
  props: {
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcFluid: {
      default: void 0
    }
  },
  computed: {
    $variant: function() {
      var e;
      return (e = this.variant) !== null && e !== void 0 ? e : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var e;
      return (e = this.fluid) !== null && e !== void 0 ? e : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, pi = `
    .p-inputtext {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .p-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
    }

    .p-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .p-inputtext.p-variant-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .p-inputtext.p-variant-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .p-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-inputtext::placeholder {
        color: dt('inputtext.placeholder.color');
    }

    .p-inputtext.p-invalid::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }

    .p-inputtext-sm {
        font-size: dt('inputtext.sm.font.size');
        padding-block: dt('inputtext.sm.padding.y');
        padding-inline: dt('inputtext.sm.padding.x');
    }

    .p-inputtext-lg {
        font-size: dt('inputtext.lg.font.size');
        padding-block: dt('inputtext.lg.padding.y');
        padding-inline: dt('inputtext.lg.padding.x');
    }

    .p-inputtext-fluid {
        width: 100%;
    }
`, fi = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": o.size === "small",
      "p-inputtext-lg p-inputfield-lg": o.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, bi = fe.extend({
  name: "inputtext",
  style: pi,
  classes: fi
}), hi = {
  name: "BaseInputText",
  extends: Kt,
  style: bi,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function je(t) {
  "@babel/helpers - typeof";
  return je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, je(t);
}
function mi(t, e, n) {
  return (e = vi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function vi(t) {
  var e = gi(t, "string");
  return je(e) == "symbol" ? e : e + "";
}
function gi(t, e) {
  if (je(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (je(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Rt = {
  name: "InputText",
  extends: hi,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return w(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return de(mi({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, yi = ["value", "name", "disabled", "aria-invalid", "data-p"];
function ki(t, e, n, o, r, i) {
  return l(), p("input", w({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": i.dataP,
    onInput: e[0] || (e[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, yi);
}
Rt.render = ki;
var wi = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Ci = `
.p-virtualscroller {
    position: relative;
    overflow: auto;
    contain: strict;
    transform: translateZ(0);
    will-change: scroll-position;
    outline: 0 none;
}

.p-virtualscroller-content {
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    min-width: 100%;
    will-change: transform;
}

.p-virtualscroller-spacer {
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 1px;
    transform-origin: 0 0;
    pointer-events: none;
}

.p-virtualscroller-loader {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-virtualscroller-loader-mask {
    display: flex;
    align-items: center;
    justify-content: center;
}

.p-virtualscroller-horizontal > .p-virtualscroller-content {
    display: flex;
}

.p-virtualscroller-inline .p-virtualscroller-content {
    position: static;
}

.p-virtualscroller .p-virtualscroller-loading {
    transform: none !important;
    min-height: 0;
    position: sticky;
    inset-block-start: 0;
    inset-inline-start: 0;
}
`, vt = fe.extend({
  name: "virtualscroller",
  css: Ci,
  style: wi
}), Ii = {
  name: "BaseVirtualScroller",
  extends: Se,
  props: {
    id: {
      type: String,
      default: null
    },
    style: null,
    class: null,
    items: {
      type: Array,
      default: null
    },
    itemSize: {
      type: [Number, Array],
      default: 0
    },
    scrollHeight: null,
    scrollWidth: null,
    orientation: {
      type: String,
      default: "vertical"
    },
    numToleratedItems: {
      type: Number,
      default: null
    },
    delay: {
      type: Number,
      default: 0
    },
    resizeDelay: {
      type: Number,
      default: 10
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loaderDisabled: {
      type: Boolean,
      default: !1
    },
    columns: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    showSpacer: {
      type: Boolean,
      default: !0
    },
    showLoader: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: 0
    },
    inline: {
      type: Boolean,
      default: !1
    },
    step: {
      type: Number,
      default: 0
    },
    appendOnly: {
      type: Boolean,
      default: !1
    },
    autoSize: {
      type: Boolean,
      default: !1
    }
  },
  style: vt,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    vt.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function He(t) {
  "@babel/helpers - typeof";
  return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, He(t);
}
function gt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ae(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? gt(Object(n), !0).forEach(function(o) {
      Nt(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : gt(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Nt(t, e, n) {
  return (e = Si(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Si(t) {
  var e = xi(t, "string");
  return He(e) == "symbol" ? e : e + "";
}
function xi(t, e) {
  if (He(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (He(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ut = {
  name: "VirtualScroller",
  extends: Ii,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
        top: 0,
        left: 0
      } : 0,
      d_numToleratedItems: this.numToleratedItems,
      d_loading: this.loading,
      loaderArr: [],
      spacerStyle: {},
      contentStyle: {}
    };
  },
  element: null,
  content: null,
  lastScrollPos: null,
  scrollTimeout: null,
  resizeTimeout: null,
  defaultWidth: 0,
  defaultHeight: 0,
  defaultContentWidth: 0,
  defaultContentHeight: 0,
  isRangeChanged: !1,
  lazyLoadState: {},
  resizeListener: null,
  resizeObserver: null,
  initialized: !1,
  watch: {
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, n) {
      this.lazy && e !== n && e !== this.d_loading && (this.d_loading = e);
    },
    items: {
      handler: function(e, n) {
        (!n || n.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
      },
      deep: !0
    },
    itemSize: function() {
      this.init(), this.calculateAutoSize();
    },
    orientation: function() {
      this.lastScrollPos = this.isBoth() ? {
        top: 0,
        left: 0
      } : 0;
    },
    scrollHeight: function() {
      this.init(), this.calculateAutoSize();
    },
    scrollWidth: function() {
      this.init(), this.calculateAutoSize();
    }
  },
  mounted: function() {
    this.viewInit(), this.lastScrollPos = this.isBoth() ? {
      top: 0,
      left: 0
    } : 0, this.lazyLoadState = this.lazyLoadState || {};
  },
  updated: function() {
    !this.initialized && this.viewInit();
  },
  unmounted: function() {
    this.unbindResizeListener(), this.initialized = !1;
  },
  methods: {
    viewInit: function() {
      Re(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = Ee(this.element), this.defaultHeight = Fe(this.element), this.defaultContentWidth = Ee(this.content), this.defaultContentHeight = Fe(this.content), this.initialized = !0), this.element && this.bindResizeListener();
    },
    init: function() {
      this.disabled || (this.setSize(), this.calculateOptions(), this.setSpacerSize());
    },
    isVertical: function() {
      return this.orientation === "vertical";
    },
    isHorizontal: function() {
      return this.orientation === "horizontal";
    },
    isBoth: function() {
      return this.orientation === "both";
    },
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), i = this.isHorizontal(), s = r ? e.every(function(m) {
        return m > -1;
      }) : e > -1;
      if (s) {
        var f = this.first, u = this.element, c = u.scrollTop, a = c === void 0 ? 0 : c, b = u.scrollLeft, d = b === void 0 ? 0 : b, C = this.calculateNumItems(), $ = C.numToleratedItems, S = this.getContentPosition(), O = this.itemSize, P = function() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, L = arguments.length > 1 ? arguments[1] : void 0;
          return g <= L ? 0 : g;
        }, B = function(g, L, R) {
          return g * L + R;
        }, A = function() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: g,
            top: L,
            behavior: o
          });
        }, z = r ? {
          rows: 0,
          cols: 0
        } : 0, I = !1, D = !1;
        r ? (z = {
          rows: P(e[0], $[0]),
          cols: P(e[1], $[1])
        }, A(B(z.cols, O[1], S.left), B(z.rows, O[0], S.top)), D = this.lastScrollPos.top !== a || this.lastScrollPos.left !== d, I = z.rows !== f.rows || z.cols !== f.cols) : (z = P(e, $), i ? A(B(z, O, S.left), a) : A(d, B(z, O, S.top)), D = this.lastScrollPos !== (i ? d : a), I = z !== f), this.isRangeChanged = I, D && (this.first = z);
      }
    },
    scrollInView: function(e, n) {
      var o = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), s = this.isHorizontal(), f = i ? e.every(function(O) {
          return O > -1;
        }) : e > -1;
        if (f) {
          var u = this.getRenderedRange(), c = u.first, a = u.viewport, b = function() {
            var P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, B = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: P,
              top: B,
              behavior: r
            });
          }, d = n === "to-start", C = n === "to-end";
          if (d) {
            if (i)
              a.first.rows - c.rows > e[0] ? b(a.first.cols * this.itemSize[1], (a.first.rows - 1) * this.itemSize[0]) : a.first.cols - c.cols > e[1] && b((a.first.cols - 1) * this.itemSize[1], a.first.rows * this.itemSize[0]);
            else if (a.first - c > e) {
              var $ = (a.first - 1) * this.itemSize;
              s ? b($, 0) : b(0, $);
            }
          } else if (C) {
            if (i)
              a.last.rows - c.rows <= e[0] + 1 ? b(a.first.cols * this.itemSize[1], (a.first.rows + 1) * this.itemSize[0]) : a.last.cols - c.cols <= e[1] + 1 && b((a.first.cols + 1) * this.itemSize[1], a.first.rows * this.itemSize[0]);
            else if (a.last - c <= e + 1) {
              var S = (a.first + 1) * this.itemSize;
              s ? b(S, 0) : b(0, S);
            }
          }
        }
      } else
        this.scrollToIndex(e, r);
    },
    getRenderedRange: function() {
      var e = function(b, d) {
        return Math.floor(b / (d || b));
      }, n = this.first, o = 0;
      if (this.element) {
        var r = this.isBoth(), i = this.isHorizontal(), s = this.element, f = s.scrollTop, u = s.scrollLeft;
        if (r)
          n = {
            rows: e(f, this.itemSize[0]),
            cols: e(u, this.itemSize[1])
          }, o = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var c = i ? u : f;
          n = e(c, this.itemSize), o = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: o
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), o = this.itemSize, r = this.getContentPosition(), i = this.element ? this.element.offsetWidth - r.left : 0, s = this.element ? this.element.offsetHeight - r.top : 0, f = function(d, C) {
        return Math.ceil(d / (C || d));
      }, u = function(d) {
        return Math.ceil(d / 2);
      }, c = e ? {
        rows: f(s, o[0]),
        cols: f(i, o[1])
      } : f(n ? i : s, o), a = this.d_numToleratedItems || (e ? [u(c.rows), u(c.cols)] : u(c));
      return {
        numItemsInViewport: c,
        numToleratedItems: a
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), o = this.first, r = this.calculateNumItems(), i = r.numItemsInViewport, s = r.numToleratedItems, f = function(a, b, d) {
        var C = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(a + b + (a < d ? 2 : 3) * d, C);
      }, u = n ? {
        rows: f(o.rows, i.rows, s[0]),
        cols: f(o.cols, i.cols, s[1], !0)
      } : f(o, i, s);
      this.last = u, this.numItemsInViewport = i, this.d_numToleratedItems = s, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var c;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: o.cols
          } : 0 : o,
          last: Math.min(e.step ? e.step : u, ((c = e.items) === null || c === void 0 ? void 0 : c.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), o = e.isHorizontal(), r = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var i = [Ee(e.element), Fe(e.element)], s = i[0], f = i[1];
          (n || o) && (e.element.style.width = s < e.defaultWidth ? s + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || r) && (e.element.style.height = f < e.defaultHeight ? f + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, r = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(r ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, o) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), o = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), r = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), i = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: o,
          top: r,
          bottom: i,
          x: n + o,
          y: r + i
        };
      }
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      };
    },
    setSize: function() {
      var e = this;
      if (this.element) {
        var n = this.isBoth(), o = this.isHorizontal(), r = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || r.offsetWidth, "px"), s = this.scrollHeight || "".concat(this.element.offsetHeight || r.offsetHeight, "px"), f = function(c, a) {
          return e.element.style[c] = a;
        };
        n || o ? (f("height", s), f("width", i)) : f("height", s);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var o = this.isBoth(), r = this.isHorizontal(), i = this.getContentPosition(), s = function(u, c, a) {
          var b = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Ae(Ae({}, e.spacerStyle), Nt({}, "".concat(u), (c || []).length * a + b + "px"));
        };
        o ? (s("height", n, this.itemSize[0], i.y), s("width", this.columns || n[1], this.itemSize[1], i.x)) : r ? s("width", this.columns || n, this.itemSize, i.x) : s("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var o = this.isBoth(), r = this.isHorizontal(), i = e ? e.first : this.first, s = function(a, b) {
          return a * b;
        }, f = function() {
          var a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Ae(Ae({}, n.contentStyle), {
            transform: "translate3d(".concat(a, "px, ").concat(b, "px, 0)")
          });
        };
        if (o)
          f(s(i.cols, this.itemSize[1]), s(i.rows, this.itemSize[0]));
        else {
          var u = s(i, this.itemSize);
          r ? f(u, 0) : f(0, u);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, o = e.target, r = this.isBoth(), i = this.isHorizontal(), s = this.getContentPosition(), f = function(H, K) {
        return H ? H > K ? H - K : H : 0;
      }, u = function(H, K) {
        return Math.floor(H / (K || H));
      }, c = function(H, K, re, oe, X, ie) {
        return H <= X ? X : ie ? re - oe - X : K + X - 1;
      }, a = function(H, K, re, oe, X, ie, te, be) {
        if (H <= ie) return 0;
        var he = Math.max(0, te ? H < K ? re : H - ie : H > K ? re : H - 2 * ie), xe = n.getLast(he, be);
        return he > xe ? xe - X : he;
      }, b = function(H, K, re, oe, X, ie) {
        var te = K + oe + 2 * X;
        return H >= X && (te += X + 1), n.getLast(te, ie);
      }, d = f(o.scrollTop, s.top), C = f(o.scrollLeft, s.left), $ = r ? {
        rows: 0,
        cols: 0
      } : 0, S = this.last, O = !1, P = this.lastScrollPos;
      if (r) {
        var B = this.lastScrollPos.top <= d, A = this.lastScrollPos.left <= C;
        if (!this.appendOnly || this.appendOnly && (B || A)) {
          var z = {
            rows: u(d, this.itemSize[0]),
            cols: u(C, this.itemSize[1])
          }, I = {
            rows: c(z.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], B),
            cols: c(z.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], A)
          };
          $ = {
            rows: a(z.rows, I.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], B),
            cols: a(z.cols, I.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], A, !0)
          }, S = {
            rows: b(z.rows, $.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: b(z.cols, $.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, O = $.rows !== this.first.rows || S.rows !== this.last.rows || $.cols !== this.first.cols || S.cols !== this.last.cols || this.isRangeChanged, P = {
            top: d,
            left: C
          };
        }
      } else {
        var D = i ? C : d, m = this.lastScrollPos <= D;
        if (!this.appendOnly || this.appendOnly && m) {
          var g = u(D, this.itemSize), L = c(g, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, m);
          $ = a(g, L, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, m), S = b(g, $, this.last, this.numItemsInViewport, this.d_numToleratedItems), O = $ !== this.first || S !== this.last || this.isRangeChanged, P = D;
        }
      }
      return {
        first: $,
        last: S,
        isRangeChanged: O,
        scrollPos: P
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), o = n.first, r = n.last, i = n.isRangeChanged, s = n.scrollPos;
      if (i) {
        var f = {
          first: o,
          last: r
        };
        if (this.setContentPosition(f), this.first = o, this.last = r, this.lastScrollPos = s, this.$emit("scroll-index-change", f), this.lazy && this.isPageChanged(o)) {
          var u, c, a = {
            first: this.step ? Math.min(this.getPageByFirst(o) * this.step, (((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0) - this.step) : o,
            last: Math.min(this.step ? (this.getPageByFirst(o) + 1) * this.step : r, ((c = this.items) === null || c === void 0 ? void 0 : c.length) || 0)
          }, b = this.lazyLoadState.first !== a.first || this.lazyLoadState.last !== a.last;
          b && this.$emit("lazy-load", a), this.lazyLoadState = a;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var o = this.onScrollPositionChange(e), r = o.isRangeChanged, i = r || (this.step ? this.isPageChanged() : !1);
            i && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(e), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (Re(e.element)) {
          var n = e.isBoth(), o = e.isVertical(), r = e.isHorizontal(), i = [Ee(e.element), Fe(e.element)], s = i[0], f = i[1], u = s !== e.defaultWidth, c = f !== e.defaultHeight, a = n ? u || c : r ? u : o ? c : !1;
          a && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = s, e.defaultHeight = f, e.defaultContentWidth = Ee(e.content), e.defaultContentHeight = Fe(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        e.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(e) {
      var n = (this.items || []).length, o = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: o,
        count: n,
        first: o === 0,
        last: o === n - 1,
        even: o % 2 === 0,
        odd: o % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var o = this.loaderArr.length;
      return Ae({
        index: e,
        count: o,
        first: e === 0,
        last: e === o - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, n);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || Et(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
    }
  },
  computed: {
    containerClass: function() {
      return ["p-virtualscroller", this.class, {
        "p-virtualscroller-inline": this.inline,
        "p-virtualscroller-both p-both-scroll": this.isBoth(),
        "p-virtualscroller-horizontal p-horizontal-scroll": this.isHorizontal()
      }];
    },
    contentClass: function() {
      return ["p-virtualscroller-content", {
        "p-virtualscroller-loading": this.d_loading
      }];
    },
    loaderClass: function() {
      return ["p-virtualscroller-loader", {
        "p-virtualscroller-loader-mask": !this.$slots.loader
      }];
    },
    loadedItems: function() {
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return e.columns ? n : n.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), n = this.isHorizontal();
        if (e || n)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: Ge
  }
}, Oi = ["tabindex"];
function $i(t, e, n, o, r, i) {
  var s = ee("SpinnerIcon");
  return t.disabled ? (l(), p(Y, {
    key: 1
  }, [M(t.$slots, "default"), M(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: i.loadedColumns
  })], 64)) : (l(), p("div", w({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, t.ptmi("root")), [M(t.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: r.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: t.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: r.spacerStyle,
    contentStyle: r.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [v("div", w({
      ref: i.contentRef,
      class: i.contentClass,
      style: r.contentStyle
    }, t.ptm("content")), [(l(!0), p(Y, null, ge(i.loadedItems, function(f, u) {
      return M(t.$slots, "item", {
        key: u,
        item: f,
        options: i.getOptions(u)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (l(), p("div", w({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, t.ptm("spacer")), null, 16)) : x("", !0), !t.loaderDisabled && t.showLoader && r.d_loading ? (l(), p("div", w({
    key: 1,
    class: i.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (l(!0), p(Y, {
    key: 0
  }, ge(r.loaderArr, function(f, u) {
    return M(t.$slots, "loader", {
      key: u,
      options: i.getLoaderOptions(u, i.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : x("", !0), M(t.$slots, "loadingicon", {}, function() {
    return [T(s, w({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : x("", !0)], 16, Oi));
}
Ut.render = $i;
var Li = `
    .p-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('select.background');
        border: 1px solid dt('select.border.color');
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            outline-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration');
        border-radius: dt('select.border.radius');
        outline-color: transparent;
        box-shadow: dt('select.shadow');
    }

    .p-select:not(.p-disabled):hover {
        border-color: dt('select.hover.border.color');
    }

    .p-select:not(.p-disabled).p-focus {
        border-color: dt('select.focus.border.color');
        box-shadow: dt('select.focus.ring.shadow');
        outline: dt('select.focus.ring.width') dt('select.focus.ring.style') dt('select.focus.ring.color');
        outline-offset: dt('select.focus.ring.offset');
    }

    .p-select.p-variant-filled {
        background: dt('select.filled.background');
    }

    .p-select.p-variant-filled:not(.p-disabled):hover {
        background: dt('select.filled.hover.background');
    }

    .p-select.p-variant-filled:not(.p-disabled).p-focus {
        background: dt('select.filled.focus.background');
    }

    .p-select.p-invalid {
        border-color: dt('select.invalid.border.color');
    }

    .p-select.p-disabled {
        opacity: 1;
        background: dt('select.disabled.background');
    }

    .p-select-clear-icon {
        align-self: center;
        color: dt('select.clear.icon.color');
        inset-inline-end: dt('select.dropdown.width');
    }

    .p-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: transparent;
        color: dt('select.dropdown.color');
        width: dt('select.dropdown.width');
        border-start-end-radius: dt('select.border.radius');
        border-end-end-radius: dt('select.border.radius');
    }

    .p-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('select.padding.y') dt('select.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
        color: dt('select.color');
        background: transparent;
        border: 0 none;
        outline: 0 none;
        font-size: 1rem;
    }

    .p-select-label.p-placeholder {
        color: dt('select.placeholder.color');
    }

    .p-select.p-invalid .p-select-label.p-placeholder {
        color: dt('select.invalid.placeholder.color');
    }

    .p-select.p-disabled .p-select-label {
        color: dt('select.disabled.color');
    }

    .p-select-label-empty {
        overflow: hidden;
        opacity: 0;
    }

    input.p-select-label {
        cursor: default;
    }

    .p-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background: dt('select.overlay.background');
        color: dt('select.overlay.color');
        border: 1px solid dt('select.overlay.border.color');
        border-radius: dt('select.overlay.border.radius');
        box-shadow: dt('select.overlay.shadow');
        min-width: 100%;
        transform-origin: inherit;
        will-change: transform;
    }

    .p-select-header {
        padding: dt('select.list.header.padding');
    }

    .p-select-filter {
        width: 100%;
    }

    .p-select-list-container {
        overflow: auto;
    }

    .p-select-option-group {
        cursor: auto;
        margin: 0;
        padding: dt('select.option.group.padding');
        background: dt('select.option.group.background');
        color: dt('select.option.group.color');
        font-weight: dt('select.option.group.font.weight');
    }

    .p-select-list {
        margin: 0;
        padding: 0;
        list-style-type: none;
        padding: dt('select.list.padding');
        gap: dt('select.list.gap');
        display: flex;
        flex-direction: column;
    }

    .p-select-option {
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: dt('select.option.padding');
        border: 0 none;
        color: dt('select.option.color');
        background: transparent;
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration'),
            outline-color dt('select.transition.duration');
        border-radius: dt('select.option.border.radius');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled).p-focus {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option.p-select-option-selected {
        background: dt('select.option.selected.background');
        color: dt('select.option.selected.color');
    }

    .p-select-option.p-select-option-selected.p-focus {
        background: dt('select.option.selected.focus.background');
        color: dt('select.option.selected.focus.color');
    }
   
    .p-select-option-blank-icon {
        flex-shrink: 0;
    }

    .p-select-option-check-icon {
        position: relative;
        flex-shrink: 0;
        margin-inline-start: dt('select.checkmark.gutter.start');
        margin-inline-end: dt('select.checkmark.gutter.end');
        color: dt('select.checkmark.color');
    }

    .p-select-empty-message {
        padding: dt('select.empty.message.padding');
    }

    .p-select-fluid {
        display: flex;
        width: 100%;
    }

    .p-select-sm .p-select-label {
        font-size: dt('select.sm.font.size');
        padding-block: dt('select.sm.padding.y');
        padding-inline: dt('select.sm.padding.x');
    }

    .p-select-sm .p-select-dropdown .p-icon {
        font-size: dt('select.sm.font.size');
        width: dt('select.sm.font.size');
        height: dt('select.sm.font.size');
    }

    .p-select-lg .p-select-label {
        font-size: dt('select.lg.font.size');
        padding-block: dt('select.lg.padding.y');
        padding-inline: dt('select.lg.padding.x');
    }

    .p-select-lg .p-select-dropdown .p-icon {
        font-size: dt('select.lg.font.size');
        width: dt('select.lg.font.size');
        height: dt('select.lg.font.size');
    }

    .p-floatlabel-in .p-select-filter {
        padding-block-start: dt('select.padding.y');
        padding-block-end: dt('select.padding.y');
    }
`, _i = {
  root: function(e) {
    var n = e.instance, o = e.props, r = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": o.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": r.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": r.focused || r.overlayVisible,
      "p-select-open": r.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": o.size === "small",
      "p-select-lg p-inputfield-lg": o.size === "large"
    }];
  },
  label: function(e) {
    var n, o = e.instance, r = e.props;
    return ["p-select-label", {
      "p-placeholder": !r.editable && o.label === r.placeholder,
      "p-select-label-empty": !r.editable && !o.$slots.value && (o.label === "p-emptylabel" || ((n = o.label) === null || n === void 0 ? void 0 : n.length) === 0)
    }];
  },
  clearIcon: "p-select-clear-icon",
  dropdown: "p-select-dropdown",
  loadingicon: "p-select-loading-icon",
  dropdownIcon: "p-select-dropdown-icon",
  overlay: "p-select-overlay p-component",
  header: "p-select-header",
  pcFilter: "p-select-filter",
  listContainer: "p-select-list-container",
  list: "p-select-list",
  optionGroup: "p-select-option-group",
  optionGroupLabel: "p-select-option-group-label",
  option: function(e) {
    var n = e.instance, o = e.props, r = e.state, i = e.option, s = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && o.highlightOnSelect,
      "p-focus": r.focusedOptionIndex === s,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, zi = fe.extend({
  name: "select",
  style: Li,
  classes: _i
}), Ei = {
  name: "BaseSelect",
  extends: Kt,
  props: {
    options: Array,
    optionLabel: [String, Function],
    optionValue: [String, Function],
    optionDisabled: [String, Function],
    optionGroupLabel: [String, Function],
    optionGroupChildren: [String, Function],
    scrollHeight: {
      type: String,
      default: "14rem"
    },
    filter: Boolean,
    filterPlaceholder: String,
    filterLocale: String,
    filterMatchMode: {
      type: String,
      default: "contains"
    },
    filterFields: {
      type: Array,
      default: null
    },
    editable: Boolean,
    placeholder: {
      type: String,
      default: null
    },
    dataKey: null,
    showClear: {
      type: Boolean,
      default: !1
    },
    inputId: {
      type: String,
      default: null
    },
    inputClass: {
      type: [String, Object],
      default: null
    },
    inputStyle: {
      type: Object,
      default: null
    },
    labelId: {
      type: String,
      default: null
    },
    labelClass: {
      type: [String, Object],
      default: null
    },
    labelStyle: {
      type: Object,
      default: null
    },
    panelClass: {
      type: [String, Object],
      default: null
    },
    overlayStyle: {
      type: Object,
      default: null
    },
    overlayClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    clearIcon: {
      type: String,
      default: void 0
    },
    dropdownIcon: {
      type: String,
      default: void 0
    },
    filterIcon: {
      type: String,
      default: void 0
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    resetFilterOnHide: {
      type: Boolean,
      default: !1
    },
    resetFilterOnClear: {
      type: Boolean,
      default: !1
    },
    virtualScrollerOptions: {
      type: Object,
      default: null
    },
    autoOptionFocus: {
      type: Boolean,
      default: !1
    },
    autoFilterFocus: {
      type: Boolean,
      default: !1
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    },
    focusOnHover: {
      type: Boolean,
      default: !0
    },
    highlightOnSelect: {
      type: Boolean,
      default: !0
    },
    checkmark: {
      type: Boolean,
      default: !1
    },
    filterMessage: {
      type: String,
      default: null
    },
    selectionMessage: {
      type: String,
      default: null
    },
    emptySelectionMessage: {
      type: String,
      default: null
    },
    emptyFilterMessage: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    tabindex: {
      type: Number,
      default: 0
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    }
  },
  style: zi,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Ke(t) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ke(t);
}
function Fi(t) {
  return Mi(t) || Di(t) || Pi(t) || Ai();
}
function Ai() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pi(t, e) {
  if (t) {
    if (typeof t == "string") return ot(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ot(t, e) : void 0;
  }
}
function Di(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Mi(t) {
  if (Array.isArray(t)) return ot(t);
}
function ot(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function yt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function kt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? yt(Object(n), !0).forEach(function(o) {
      we(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : yt(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function we(t, e, n) {
  return (e = Ti(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ti(t) {
  var e = Vi(t, "string");
  return Ke(e) == "symbol" ? e : e + "";
}
function Vi(t, e) {
  if (Ke(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ke(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Gt = {
  name: "Select",
  extends: Ei,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "before-show", "before-hide", "show", "hide", "filter"],
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  labelClickListener: null,
  matchMediaOrientationListener: null,
  overlay: null,
  list: null,
  virtualScroller: null,
  searchTimeout: null,
  searchValue: null,
  isModelValueChanged: !1,
  data: function() {
    return {
      clicked: !1,
      focused: !1,
      focusedOptionIndex: -1,
      filterValue: null,
      overlayVisible: !1,
      queryOrientation: null
    };
  },
  watch: {
    modelValue: function() {
      this.isModelValueChanged = !0;
    },
    options: function() {
      this.autoUpdateModel();
    }
  },
  mounted: function() {
    this.autoUpdateModel(), this.bindLabelClickListener(), this.bindMatchMediaOrientationListener();
  },
  updated: function() {
    this.overlayVisible && this.isModelValueChanged && this.scrollInView(this.findSelectedOptionIndex()), this.isModelValueChanged = !1;
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (_e.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? $e(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? $e(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? $e(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, o, r) {
      return this.ptm(r, {
        context: {
          option: e,
          index: o,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(o, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? $e(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return $e(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return $e(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && J(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && J(n.$refs.focusInput);
      };
      setTimeout(function() {
        o();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var o, r;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (o = (r = n.formField).onBlur) === null || o === void 0 || o.call(r, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (vn())
        switch (e.code) {
          case "Backspace":
            this.onBackspaceKey(e, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(e);
            break;
          default:
            e.preventDefault();
            return;
        }
      var o = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !o && gn(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && J(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var o = this.searchOptions(e, n);
      !o && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && me(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Le(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      J(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Ot(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      J(n);
    },
    onOptionSelect: function(e, n) {
      var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var r = this.getOptionValue(n);
        this.updateModel(e, r), o && this.hide(!0);
      }
    },
    onOptionMouseMove: function(e, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, n);
    },
    onFilterChange: function(e) {
      var n = e.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      if (!e.isComposing)
        switch (e.code) {
          case "ArrowDown":
            this.onArrowDownKey(e);
            break;
          case "ArrowUp":
            this.onArrowUpKey(e, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(e, !0);
            break;
          case "Home":
            this.onHomeKey(e, !0);
            break;
          case "End":
            this.onEndKey(e, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(e);
            break;
          case "Escape":
            this.onEscapeKey(e);
            break;
          case "Tab":
            this.onTabKey(e);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      mn.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, n);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var o = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, o), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        e.shiftKey ? o.setSelectionRange(0, e.target.selectionStart) : (o.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        if (e.shiftKey)
          o.setSelectionRange(e.target.selectionStart, o.value.length);
        else {
          var r = o.value.length;
          o.setSelectionRange(r, r), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (J(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      _e.set("overlay", e, this.$primevue.config.zIndex.overlay), zt(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && J(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && J(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      _e.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? bn(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = _t(this.$el) + "px", hn(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var o = n.composedPath();
        e.overlayVisible && e.overlay && !o.includes(e.$el) && !o.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new fn(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !pn() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Re(n) && (this.labelClickListener = function() {
          J(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && Re(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var e = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          e.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return cn(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return me(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return un(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return dt(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, o = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, o = e > 0 ? dt(this.visibleOptions.slice(0, e), function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, n) {
      var o = this;
      this.searchValue = (this.searchValue || "") + n;
      var r = -1, i = !1;
      return me(this.searchValue) && (r = this.visibleOptions.findIndex(function(s) {
        return o.isOptionExactMatched(s);
      }), r === -1 && (r = this.visibleOptions.findIndex(function(s) {
        return o.isOptionStartsWith(s);
      })), r !== -1 && (i = !0), r === -1 && this.focusedOptionIndex === -1 && (r = this.findFirstFocusedOptionIndex()), r !== -1 && this.changeFocusedOptionIndex(e, r)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        o.searchValue = "", o.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var o = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, r = Et(e.list, 'li[id="'.concat(o, '"]'));
        r ? r.scrollIntoView && r.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(n !== -1 ? n : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(e, n) {
      this.writeValue(n, e), this.$emit("change", {
        originalEvent: e,
        value: n
      });
    },
    flatOptions: function(e) {
      var n = this;
      return (e || []).reduce(function(o, r, i) {
        o.push({
          optionGroup: r,
          group: !0,
          index: i
        });
        var s = n.getOptionGroupChildren(r);
        return s && s.forEach(function(f) {
          return o.push(f);
        }), o;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, n) {
      this.list = e, n && n(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var o = dn.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], i = [];
          return r.forEach(function(s) {
            var f = e.getOptionGroupChildren(s), u = f.filter(function(c) {
              return o.includes(c);
            });
            u.length > 0 && i.push(kt(kt({}, s), {}, we({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", Fi(u))));
          }), this.flatOptions(i);
        }
        return o;
      }
      return n;
    },
    // @deprecated use $filled instead
    hasSelectedOption: function() {
      return this.$filled;
    },
    label: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return me(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
    },
    filterMessageText: function() {
      return this.filterMessage || this.$primevue.config.locale.searchMessage || "";
    },
    emptyFilterMessageText: function() {
      return this.emptyFilterMessage || this.$primevue.config.locale.emptySearchMessage || this.$primevue.config.locale.emptyFilterMessage || "";
    },
    emptyMessageText: function() {
      return this.emptyMessage || this.$primevue.config.locale.emptyMessage || "";
    },
    selectionMessageText: function() {
      return this.selectionMessage || this.$primevue.config.locale.selectionMessage || "";
    },
    emptySelectionMessageText: function() {
      return this.emptySelectionMessage || this.$primevue.config.locale.emptySelectionMessage || "";
    },
    selectedMessageText: function() {
      return this.$filled ? this.selectionMessageText.replaceAll("{0}", "1") : this.emptySelectionMessageText;
    },
    focusedOptionId: function() {
      return this.focusedOptionIndex !== -1 ? "".concat(this.$id, "_").concat(this.focusedOptionIndex) : null;
    },
    ariaSetSize: function() {
      var e = this;
      return this.visibleOptions.filter(function(n) {
        return !e.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return de(we({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return de(we(we({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return de(we({}, this.size, this.size));
    },
    overlayDataP: function() {
      return de(we({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: rt
  },
  components: {
    InputText: Rt,
    VirtualScroller: Ut,
    Portal: Lt,
    InputIcon: Ht,
    IconField: jt,
    TimesIcon: at,
    ChevronDownIcon: Vt,
    SpinnerIcon: Ge,
    SearchIcon: Bt,
    CheckIcon: Tt,
    BlankIcon: Mt
  }
}, Bi = ["id", "data-p"], ji = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Hi = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], Ki = ["data-p"], Ri = ["id"], Ni = ["id"], Ui = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Gi(t, e, n, o, r, i) {
  var s = ee("SpinnerIcon"), f = ee("InputText"), u = ee("SearchIcon"), c = ee("InputIcon"), a = ee("IconField"), b = ee("CheckIcon"), d = ee("BlankIcon"), C = ee("VirtualScroller"), $ = ee("Portal"), S = it("ripple");
  return l(), p("div", w({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, t.ptmi("root")), [t.editable ? (l(), p("input", w({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: i.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": r.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return i.onEditableInput && i.onEditableInput.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), null, 16, ji)) : (l(), p("span", w({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (i.label === "p-emptylabel" ? void 0 : i.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), [M(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var O;
    return [ue(_(i.label === "p-emptylabel" ? " " : (O = i.label) !== null && O !== void 0 ? O : "empty"), 1)];
  })], 16, Hi)), i.isClearIconVisible ? M(t.$slots, "clearicon", {
    key: 2,
    class: se(t.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(l(), N(Pe(t.clearIcon ? "i" : "TimesIcon"), w({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: i.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : x("", !0), v("div", w({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? M(t.$slots, "loadingicon", {
    key: 0,
    class: se(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (l(), p("span", w({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (l(), N(s, w({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : M(t.$slots, "dropdownicon", {
    key: 1,
    class: se(t.cx("dropdownIcon"))
  }, function() {
    return [(l(), N(Pe(t.dropdownIcon ? "span" : "ChevronDownIcon"), w({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), T($, {
    appendTo: t.appendTo
  }, {
    default: Z(function() {
      return [T(St, w({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: Z(function() {
          return [r.overlayVisible ? (l(), p("div", w({
            key: 0,
            ref: i.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return i.onOverlayKeyDown && i.onOverlayKeyDown.apply(i, arguments);
            }),
            "data-p": i.overlayDataP
          }, t.ptm("overlay")), [v("span", w({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return i.onFirstHiddenFocus && i.onFirstHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), M(t.$slots, "header", {
            value: t.d_value,
            options: i.visibleOptions
          }), t.filter ? (l(), p("div", w({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [T(a, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: Z(function() {
              return [T(f, {
                ref: "filterInput",
                type: "text",
                value: r.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: se(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": i.focusedOptionId,
                onKeydown: i.onFilterKeyDown,
                onBlur: i.onFilterBlur,
                onInput: i.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), T(c, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: Z(function() {
                  return [M(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (l(), p("span", w({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (l(), N(u, Yt(w({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), v("span", w({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), _(i.filterResultMessageText), 17)], 16)) : x("", !0), v("div", w({
            class: t.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [T(C, w({
            ref: i.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), Xt({
            content: Z(function(O) {
              var P = O.styleClass, B = O.contentRef, A = O.items, z = O.getItemOptions, I = O.contentStyle, D = O.itemSize;
              return [v("ul", w({
                ref: function(g) {
                  return i.listRef(g, B);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), P],
                style: I,
                role: "listbox"
              }, t.ptm("list")), [(l(!0), p(Y, null, ge(A, function(m, g) {
                return l(), p(Y, {
                  key: i.getOptionRenderKey(m, i.getOptionIndex(g, z))
                }, [i.isOptionGroup(m) ? (l(), p("li", w({
                  key: 0,
                  id: t.$id + "_" + i.getOptionIndex(g, z),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [M(t.$slots, "optiongroup", {
                  option: m.optionGroup,
                  index: i.getOptionIndex(g, z)
                }, function() {
                  return [v("span", w({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), _(i.getOptionGroupLabel(m.optionGroup)), 17)];
                })], 16, Ni)) : Ce((l(), p("li", w({
                  key: 1,
                  id: t.$id + "_" + i.getOptionIndex(g, z),
                  class: t.cx("option", {
                    option: m,
                    focusedOption: i.getOptionIndex(g, z)
                  }),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(m),
                  "aria-selected": i.isSelected(m),
                  "aria-disabled": i.isOptionDisabled(m),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(g, z)),
                  onMousedown: function(R) {
                    return i.onOptionSelect(R, m);
                  },
                  onMousemove: function(R) {
                    return i.onOptionMouseMove(R, i.getOptionIndex(g, z));
                  },
                  onClick: e[8] || (e[8] = Jt(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && i.isSelected(m),
                  "data-p-focused": r.focusedOptionIndex === i.getOptionIndex(g, z),
                  "data-p-disabled": i.isOptionDisabled(m)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(m, z, g, "option")), [t.checkmark ? (l(), p(Y, {
                  key: 0
                }, [i.isSelected(m) ? (l(), N(b, w({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (l(), N(d, w({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : x("", !0), M(t.$slots, "option", {
                  option: m,
                  selected: i.isSelected(m),
                  index: i.getOptionIndex(g, z)
                }, function() {
                  return [v("span", w({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), _(i.getOptionLabel(m)), 17)];
                })], 16, Ui)), [[S]])], 64);
              }), 128)), r.filterValue && (!A || A && A.length === 0) ? (l(), p("li", w({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [M(t.$slots, "emptyfilter", {}, function() {
                return [ue(_(i.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (l(), p("li", w({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [M(t.$slots, "empty", {}, function() {
                return [ue(_(i.emptyMessageText), 1)];
              })], 16)) : x("", !0)], 16, Ri)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: Z(function(O) {
              var P = O.options;
              return [M(t.$slots, "loader", {
                options: P
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), M(t.$slots, "footer", {
            value: t.d_value,
            options: i.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (l(), p("span", w({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), _(i.emptyMessageText), 17)) : x("", !0), v("span", w({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), _(i.selectedMessageText), 17), v("span", w({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return i.onLastHiddenFocus && i.onLastHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, Ki)) : x("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, Bi);
}
Gt.render = Gi;
const Wi = /* @__PURE__ */ ze({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const n = t, o = e, r = F(null);
    let i = null;
    function s(u) {
      o("update:modelValue", u.detail || "");
    }
    async function f() {
      if (r.value) {
        i && i.removeEventListener("select", s), r.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await Ne("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        r.value && (i = document.createElement("wc-icon-picker"), i.setAttribute("value", n.modelValue || ""), n.fallback && i.setAttribute("fallback", n.fallback), i.addEventListener("select", s), r.value.appendChild(i));
      }
    }
    return Ue(f), pe(() => n.modelValue, (u) => {
      i && i.getAttribute("value") !== u && i.setAttribute("value", u || "");
    }), Ie(() => {
      i && i.removeEventListener("select", s);
    }), (u, c) => (l(), p("div", {
      ref_key: "host",
      ref: r,
      class: "wc-iconfield"
    }, null, 512));
  }
});
function ne(t, e) {
  if (t && typeof t == "object") {
    const n = t, o = n.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return e;
}
const qi = { class: "kx-wcmount" }, Zi = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, Yi = /* @__PURE__ */ ze({
  __name: "WcMount",
  props: {
    tag: {},
    config: {},
    schema: {},
    meta: {},
    provider: {},
    label: {},
    attrs: {}
  },
  emits: ["change", "select", "created", "close", "error"],
  setup(t, { emit: e }) {
    const n = t, o = e, r = F(null), i = F(!1);
    let s = null, f = 0;
    const u = /* @__PURE__ */ new Set();
    function c(I) {
      I.composedPath()[0] === s && (I.stopPropagation(), o("change", I.detail));
    }
    function a(I) {
      return I.composedPath()[0] !== s ? !1 : (I.stopPropagation(), !0);
    }
    function b(I) {
      a(I) && o("select", I.detail);
    }
    function d(I) {
      a(I) && o("created", I.detail);
    }
    function C(I) {
      a(I) && o("close", I.detail);
    }
    function $(I) {
      a(I) && o("error", I.detail);
    }
    function S(I) {
      if (typeof I == "string") return I;
      try {
        return JSON.stringify(I ?? {});
      } catch {
        return null;
      }
    }
    function O() {
      if (!s) return;
      const I = S(n.config);
      if (I !== null && s.setAttribute("config", I), n.schema !== void 0 && n.schema !== null) {
        const m = S(n.schema);
        m !== null && s.setAttribute("schema", m);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const m = S(n.meta);
        m !== null && s.setAttribute("meta", m);
      }
      n.provider && s.setAttribute("provider", n.provider), n.label && s.setAttribute("label", n.label);
      const D = n.attrs || {};
      for (const m of [...u])
        (!(m in D) || D[m] == null) && (s.removeAttribute(m), u.delete(m));
      for (const [m, g] of Object.entries(D)) {
        if (g == null) continue;
        const L = typeof g == "object" ? S(g) : String(g);
        L !== null && (s.setAttribute(m, L), u.add(m));
      }
    }
    function P(I = s) {
      I && (I.removeEventListener("config-changed", c), I.removeEventListener("change", c), I.removeEventListener("select", b), I.removeEventListener("created", d), I.removeEventListener("close", C), I.removeEventListener("error", $), I === s && (s = null), u.clear());
    }
    async function B(I) {
      if (!customElements.get(I))
        try {
          await Ne(I, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function A() {
      const I = ++f, D = r.value, m = n.tag;
      if (i.value = !1, !!D && (P(), D.innerHTML = "", !!m))
        try {
          if (await B(m), I !== f || r.value !== D || n.tag !== m) return;
          const g = document.createElement(m);
          g.classList.add("kx-wcmount-surface"), s = g, O(), g.addEventListener("config-changed", c), g.addEventListener("change", c), g.addEventListener("select", b), g.addEventListener("created", d), g.addEventListener("close", C), g.addEventListener("error", $), g.style.display = "block", D.appendChild(g), i.value = !customElements.get(m);
        } catch {
          I === f && (i.value = !0);
        }
    }
    async function z() {
      i.value = !1, await qe(), await A();
    }
    return Ue(A), pe(() => n.tag, A), pe(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], O, { deep: !0 }), Ie(() => {
      f += 1, P();
    }), (I, D) => (l(), p("div", qi, [
      i.value ? (l(), p("div", Zi, [
        D[0] || (D[0] = v("span", null, "This setup panel couldn’t load.", -1)),
        v("button", {
          type: "button",
          onClick: z
        }, "Try again")
      ])) : (l(), p("div", {
        key: 1,
        ref_key: "host",
        ref: r
      }, null, 512))
    ]));
  }
});
function wt() {
  let t = 0;
  return () => {
    const e = ++t;
    return () => e === t;
  };
}
const Xi = ["aria-label"], Ji = { class: "kx-field-lbl" }, Qi = { class: "kx-2p-r-note" }, er = ["datetime"], tr = { key: 1 }, nr = { class: "kx-drive-actions" }, or = {
  key: 0,
  role: "status"
}, ir = {
  key: 1,
  role: "status"
}, rr = {
  key: 2,
  role: "alert",
  class: "kx-err inline"
}, ar = {
  key: 3,
  class: "kx-err inline"
}, lr = {
  key: 4,
  class: "kx-2p-r-note"
}, sr = {
  key: 5,
  class: "kx-2p-r-note"
}, dr = ["href"], ur = {
  key: 0,
  role: "status"
}, cr = {
  key: 1,
  role: "alert",
  class: "kx-err inline"
}, pr = {
  key: 2,
  class: "kx-drive-failures"
}, fr = ["href"], br = { key: 0 }, hr = {
  key: 1,
  class: "kx-err inline"
}, mr = { key: 2 }, vr = {
  key: 3,
  class: "kx-2p-r-note"
}, gr = /* @__PURE__ */ ze({
  __name: "DriveSyncActivity",
  props: {
    sync: {}
  },
  setup(t) {
    const e = t, n = G(() => `/api/v1/automations/${encodeURIComponent(e.sync.id)}`), o = F(e.sync.drive_status), r = G(() => o.value?.drives?.find((E) => E.source_kind === "collection")), i = G(() => r.value?.last_round_at), s = G(() => o.value?.delivery_failures?.count || 0), f = G(() => o.value?.delivery_failures?.last_error), u = G(() => !e.sync.deleting_at && ((e.sync.access_level || 0) & 2) !== 0 && !!r.value?.drive_key && r.value.enabled !== !1), c = G(() => ((e.sync.access_level || 0) & 8) !== 0), a = F(!1), b = F(""), d = F(""), C = F(!1), $ = F(!1), S = F(!1), O = wt();
    let P = "", B = !1;
    async function A() {
      const E = O();
      a.value = !0, b.value = "";
      try {
        const { data: V } = await ve.get(`${n.value}/status`);
        if (!V.success) throw new Error(ne({ response: { data: V } }, "Could not refresh sync status"));
        E() && (o.value = V);
      } catch (V) {
        E() && (b.value = ne(V, "Could not refresh sync status"));
      } finally {
        E() && (a.value = !1);
      }
    }
    async function z() {
      const E = r.value;
      if (!(!E || !u.value || S.value)) {
        P ||= crypto.randomUUID(), S.value = !0, $.value = !1, d.value = "";
        try {
          const { data: V } = await ve.post(`${n.value}/control`, {
            control: "run_now",
            drive_key: E.drive_key,
            request_id: P
          });
          if (B) return;
          if (!V.success) throw new Error(ne({ response: { data: V } }, "Could not start the sync"));
          if (V.state !== "succeeded" && V.state !== "pending") throw new Error("Sync request was not accepted");
          C.value = V.state === "pending", $.value = !C.value, $.value && (P = ""), await A();
        } catch (V) {
          B || (d.value = ne(V, "Could not start the sync"));
        } finally {
          B || (S.value = !1);
        }
      }
    }
    const I = F(!1), D = F([]), m = F(""), g = F(!1), L = F(""), R = wt(), H = G(() => D.value.filter((E) => E.state === "dead" || E.state === "failed" || E.state === "uncertain"));
    function K(E) {
      return /^google:drive:([\w-]+)$/.exec(E)?.[1];
    }
    function re(E) {
      return `https://drive.google.com/open?id=${encodeURIComponent(E)}`;
    }
    function oe(E) {
      return typeof E == "string" ? E : E?.message || "No reason recorded";
    }
    function X(E) {
      return E === "resolved" ? "Delivered" : E === "dead" || E === "failed" || E === "uncertain" ? "Failed" : "Pending";
    }
    function ie(E) {
      return { pending: "Pending", indexed: "Indexed", failed: "Failed", superseded: "Superseded" }[E];
    }
    function te(E) {
      return new Date(E).toLocaleString();
    }
    async function be(E = !1) {
      const V = R(), U = E ? m.value : "";
      E || (D.value = [], m.value = ""), g.value = !0, L.value = "";
      try {
        const { data: ae } = await ve.get(`${n.value}/history`, {
          params: { kind: "deliveries", page_size: 25, ...U ? { page_token: U } : {} }
        });
        if (!ae.success) throw new Error(ne({ response: { data: ae } }, "Could not read file activity"));
        if (U && ae.next_page_token === U) throw new Error("Delivery history repeated its page");
        if (!V()) return;
        const Oe = new Map(D.value.map((k) => [k.item_key, k]));
        for (const k of Array.isArray(ae.entries) ? ae.entries : [])
          K(k.item_key) && !Oe.has(k.item_key) && Oe.set(k.item_key, k);
        D.value = [...Oe.values()], m.value = ae.next_page_token || "";
      } catch (ae) {
        V() && (L.value = ne(ae, "Could not read file activity"));
      } finally {
        V() && (g.value = !1);
      }
    }
    function he() {
      I.value = !I.value, I.value && be();
    }
    pe(() => e.sync.drive_status, (E) => {
      o.value = E;
    }), pe(() => i.value, (E, V) => {
      E !== V && ($.value = !1, I.value && be());
    });
    const xe = wn(e.sync.id, () => {
      A();
    });
    return Ie(() => {
      B = !0, O(), R(), xe?.();
    }), (E, V) => (l(), p("section", {
      class: "kx-drive-sync",
      "aria-label": t.sync.title || "Linked Drive folder"
    }, [
      v("h4", Ji, _(t.sync.title || "Linked Drive folder"), 1),
      v("p", Qi, [
        V[2] || (V[2] = ue("Last sync ", -1)),
        i.value ? (l(), p("time", {
          key: 0,
          datetime: i.value
        }, _(te(i.value)), 9, er)) : (l(), p("span", tr, "Never"))
      ]),
      v("div", nr, [
        u.value ? (l(), N(j(W), {
          key: 0,
          type: "button",
          size: "small",
          label: C.value ? "Check sync request" : "Sync now",
          loading: S.value,
          onClick: z
        }, null, 8, ["label", "loading"])) : x("", !0),
        T(j(W), {
          type: "button",
          size: "small",
          severity: "secondary",
          text: "",
          label: "Refresh status",
          disabled: a.value,
          onClick: A
        }, null, 8, ["disabled"])
      ]),
      C.value ? (l(), p("p", or, "Sync request pending.")) : $.value ? (l(), p("p", ir, "Sync requested.")) : x("", !0),
      d.value || b.value ? (l(), p("p", rr, _(d.value || b.value), 1)) : x("", !0),
      r.value?.last_error?.message ? (l(), p("p", ar, _(r.value.last_error.message), 1)) : x("", !0),
      s.value ? (l(), p("p", lr, _(s.value) + " failed file " + _(s.value === 1 ? "delivery" : "deliveries"), 1)) : x("", !0),
      f.value?.message && !H.value.some((U) => I.value && U.item_key === f.value?.item_key) ? (l(), p("p", sr, [
        f.value.item_key && K(f.value.item_key) ? (l(), p("a", {
          key: 0,
          href: re(K(f.value.item_key)),
          target: "_blank",
          rel: "noopener noreferrer"
        }, "Drive file " + _(K(f.value.item_key)), 9, dr)) : x("", !0),
        ue(" " + _(f.value.message), 1)
      ])) : x("", !0),
      c.value ? (l(), N(j(W), {
        key: 6,
        type: "button",
        size: "small",
        severity: "secondary",
        text: "",
        label: I.value ? "Hide file activity" : "Show file activity",
        "aria-expanded": I.value,
        onClick: he
      }, null, 8, ["label", "aria-expanded"])) : x("", !0),
      c.value && I.value ? (l(), p(Y, { key: 7 }, [
        g.value ? (l(), p("p", ur, "Loading file activity…")) : x("", !0),
        L.value ? (l(), p("p", cr, _(L.value), 1)) : x("", !0),
        D.value.length ? (l(), p("ul", pr, [
          (l(!0), p(Y, null, ge(D.value, (U) => (l(), p("li", {
            key: U.item_key
          }, [
            v("a", {
              href: re(K(U.item_key)),
              target: "_blank",
              rel: "noopener noreferrer"
            }, "Drive file " + _(K(U.item_key)), 9, fr),
            v("p", null, "Delivery: " + _(X(U.state)), 1),
            U.indexing ? (l(), p("p", br, "Indexing: " + _(ie(U.indexing.status)), 1)) : x("", !0),
            U.indexing?.reason ? (l(), p("p", hr, _(U.indexing.reason), 1)) : U.state !== "resolved" ? (l(), p("p", mr, _(oe(U.error)), 1)) : x("", !0)
          ]))), 128))
        ])) : !g.value && !L.value ? (l(), p("p", vr, "No files on this delivery history page.")) : x("", !0),
        L.value ? (l(), N(j(W), {
          key: 4,
          type: "button",
          size: "small",
          severity: "secondary",
          outlined: "",
          label: "Retry file activity",
          onClick: V[0] || (V[0] = (U) => be())
        })) : m.value ? (l(), N(j(W), {
          key: 5,
          type: "button",
          size: "small",
          severity: "secondary",
          outlined: "",
          label: "More delivery history",
          disabled: g.value,
          onClick: V[1] || (V[1] = (U) => be(!0))
        }, null, 8, ["disabled"])) : x("", !0)
      ], 64)) : x("", !0)
    ], 8, Xi));
  }
}), Wt = "kickside.google.source:drive_folder", qt = "kickside.knowledge.sink:kb_upload", Zt = "kickside.sync:sync", yr = {
  key: 0,
  class: "kx-form"
}, kr = {
  key: 0,
  role: "status",
  class: "kx-2p-r-note"
}, wr = {
  key: 1,
  role: "alert",
  class: "kx-err inline"
}, Cr = {
  key: 2,
  class: "kx-drive-actions"
}, Ct = 20, Ir = /* @__PURE__ */ ze({
  __name: "DriveFolderSyncs",
  props: {
    kbId: {},
    linkedFolder: {}
  },
  setup(t) {
    const e = t, n = F([]), o = F(!1), r = F(""), i = F(!1);
    let s = 0, f = 0;
    async function u(a, b) {
      try {
        const { data: d } = await ve.get(
          `/api/v1/automations/${encodeURIComponent(a.id)}/config`
        );
        if (!d.success) throw new Error(ne({ response: { data: d } }, "Could not read sync settings"));
        return d.config?.source?.port === Wt && d.config.sink?.port === qt && d.config.sink.config?.kb_id === b;
      } catch (d) {
        const C = d?.response?.status;
        if (C === 403 || C === 404) return !1;
        throw d;
      }
    }
    async function c(a = !1) {
      if (a && o.value) return;
      const b = ++f, d = e.kbId, C = a ? s : 0;
      a || (n.value = [], i.value = !1), o.value = !0, r.value = "";
      try {
        const { data: $ } = await ve.get("/api/v1/automations", {
          params: { parent_id: d, limit: Ct, offset: C }
        });
        if (b !== f) return;
        if (!$.success) throw new Error(ne({ response: { data: $ } }, "Could not list Drive syncs"));
        const S = Array.isArray($.automations) ? $.automations : [], O = S.filter((A) => A.type === Zt && !A.deleting_at && !A.availability), P = await Promise.all(O.map((A) => u(A, d)));
        if (b !== f) return;
        const B = new Map(n.value.map((A) => [A.id, A]));
        for (const [A, z] of O.entries())
          P[A] && B.set(z.id, z);
        n.value = [...B.values()], s = C + S.length, i.value = S.length === Ct;
      } catch ($) {
        b === f && (r.value = ne($, "Could not list Drive syncs"));
      } finally {
        b === f && (o.value = !1);
      }
    }
    return Wn(n, (a) => a.id, void 0, () => {
      c();
    }), pe(() => [e.kbId, e.linkedFolder], () => {
      c();
    }, { immediate: !0 }), Ie(() => {
      f += 1;
    }), (a, b) => n.value.length || o.value || r.value || i.value ? (l(), p("div", yr, [
      (l(!0), p(Y, null, ge(n.value, (d) => (l(), N(gr, {
        key: d.id,
        sync: d
      }, null, 8, ["sync"]))), 128)),
      o.value ? (l(), p("p", kr, "Loading linked folders…")) : x("", !0),
      r.value ? (l(), p("p", wr, _(r.value), 1)) : x("", !0),
      i.value || r.value ? (l(), p("div", Cr, [
        r.value ? (l(), N(j(W), {
          key: 0,
          type: "button",
          label: "Try again",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: b[0] || (b[0] = (d) => c())
        })) : (l(), N(j(W), {
          key: 1,
          type: "button",
          label: "More linked folders",
          severity: "secondary",
          size: "small",
          outlined: "",
          disabled: o.value,
          onClick: b[1] || (b[1] = (d) => c(!0))
        }, null, 8, ["disabled"]))
      ])) : x("", !0)
    ])) : x("", !0);
  }
}), Sr = {
  key: 0,
  class: "kx-form kx-drive-source",
  "aria-label": "Google Drive source"
}, xr = {
  key: 0,
  role: "status"
}, Or = ["inert"], $r = {
  key: 0,
  class: "kx-drive-actions"
}, Lr = { class: "kx-drive-actions" }, _r = {
  key: 0,
  role: "status"
}, zr = {
  key: 1,
  role: "alert",
  class: "kx-err inline"
}, Er = {
  key: 2,
  class: "kx-2p-r-note"
}, Fr = {
  key: 3,
  class: "kx-drive-folders"
}, Ar = { class: "kx-drive-actions" }, Pr = {
  key: 4,
  class: "kx-2p-r-note"
}, Dr = {
  key: 5,
  role: "alert",
  class: "kx-err inline"
}, Mr = /* @__PURE__ */ ze({
  __name: "DriveFolderSource",
  props: {
    kbId: {}
  },
  setup(t) {
    const e = t, n = G(() => `/api/v1/knowledge/${encodeURIComponent(e.kbId)}/drive-folders`), o = F(""), r = F(""), i = F([]), s = G(() => i.value.at(-1)), f = F(), u = F([]), c = F(), a = F(!1), b = F(!1), d = F(""), C = F(""), $ = F("");
    let S = 0, O;
    Ue(async () => {
      try {
        const { data: m } = await ve.get(n.value);
        m.available && m.actor_id && (o.value = m.actor_id);
      } catch {
      }
    }), Ie(() => {
      S += 1;
    });
    function P() {
      S += 1, f.value = void 0, u.value = [], c.value = void 0, a.value = !1, d.value = "", C.value = "", O = void 0;
    }
    function B(m) {
      const g = m?.connection_id, L = typeof g == "string" ? g : "";
      b.value || L === r.value || (r.value = L, i.value = [], P());
    }
    async function A(m = !1) {
      const g = s.value;
      if (!g || !r.value || a.value) return;
      const L = ++S;
      a.value = !0, d.value = "";
      try {
        const { data: R } = await ve.post(n.value, {
          connection_id: r.value,
          action: g.action,
          drive_id: g.drive_id,
          parent_id: g.parent_id,
          cursor: m ? c.value : void 0
        });
        if (L !== S) return;
        if (!R.success) throw new Error(R.error || "Could not load Drive folders");
        f.value = R.parent;
        const H = new Map((m ? u.value : []).map((K) => [K.id, K]));
        for (const K of Array.isArray(R.items) ? R.items : []) H.set(K.id, K);
        u.value = [...H.values()], c.value = R.next_cursor;
      } catch (R) {
        L === S && (d.value = ne(R, "Could not load Drive folders"));
      } finally {
        L === S && (a.value = !1);
      }
    }
    function z(m) {
      b.value || (P(), m ? i.value.push(m) : i.value.pop(), A());
    }
    function I(m) {
      s.value?.action === "list_shared_drives" ? z({ action: "list_folders", label: m.name, drive_id: m.id }) : z({ action: "list_folders", label: m.name, drive_id: s.value?.drive_id, parent_id: m.id });
    }
    async function D() {
      const m = f.value;
      if (b.value || a.value || !m || !r.value) return;
      O ||= { component_id: crypto.randomUUID(), request_id: crypto.randomUUID() };
      const g = S;
      b.value = !0, C.value = "";
      try {
        const { data: L } = await ve.post("/api/v1/automations/selected", {
          ...O,
          principal: { kind: "user", id: o.value },
          type: Zt,
          parent_id: e.kbId,
          input: {
            title: `Google Drive · ${m.name}`,
            enabled: !0,
            reconcile: !0,
            trigger: {
              v: 2,
              source: Wt,
              backfill: "all",
              schedule: { type: "interval", expression: "15m" },
              config: { connection_id: r.value, folder_id: m.id }
            },
            sink_port: qt,
            sink_config: { kb_id: e.kbId },
            transform: { kind: "none" }
          }
        });
        if (g !== S) return;
        if (!L.success || L.id !== O.component_id)
          throw new Error(ne({ response: { data: L } }, "Could not confirm the Drive folder link"));
        $.value = m.name;
      } catch (L) {
        g === S && (C.value = ne(L, "Could not link the Drive folder"));
      } finally {
        g === S && (b.value = !1);
      }
    }
    return (m, g) => o.value ? (l(), p("section", Sr, [
      g[4] || (g[4] = v("h3", { class: "kx-field-lbl" }, "Google Drive source", -1)),
      T(Ir, {
        "kb-id": t.kbId,
        "linked-folder": $.value
      }, null, 8, ["kb-id", "linked-folder"]),
      $.value ? (l(), p("p", xr, _($.value) + " is linked and will sync every 15 minutes. Manage the sync in Automations. ", 1)) : (l(), p(Y, { key: 1 }, [
        v("div", { inert: b.value }, [
          T(Yi, {
            tag: "wc-connection-picker",
            provider: "google",
            label: "Google Drive connection",
            config: { connection_id: r.value },
            attrs: { "reply-only": "false" },
            onChange: B
          }, null, 8, ["config"])
        ], 8, Or),
        r.value && !s.value ? (l(), p("div", $r, [
          T(j(W), {
            type: "button",
            label: "My Drive",
            size: "small",
            outlined: "",
            onClick: g[0] || (g[0] = (L) => z({ action: "list_folders", label: "My Drive" }))
          }),
          T(j(W), {
            type: "button",
            label: "Shared drives",
            size: "small",
            outlined: "",
            onClick: g[1] || (g[1] = (L) => z({ action: "list_shared_drives", label: "Shared drives" }))
          })
        ])) : x("", !0),
        s.value ? (l(), p(Y, { key: 1 }, [
          v("div", Lr, [
            T(j(W), {
              type: "button",
              label: "Back",
              severity: "secondary",
              size: "small",
              text: "",
              disabled: b.value,
              onClick: g[2] || (g[2] = (L) => z())
            }, null, 8, ["disabled"]),
            v("span", null, _(s.value.label), 1)
          ]),
          a.value ? (l(), p("p", _r, "Loading Drive folders…")) : x("", !0),
          d.value ? (l(), p("p", zr, _(d.value), 1)) : !a.value && !u.value.length && !c.value ? (l(), p("p", Er, _(s.value.action === "list_shared_drives" ? "No shared drives found." : "No subfolders found."), 1)) : x("", !0),
          u.value.length ? (l(), p("ul", Fr, [
            (l(!0), p(Y, null, ge(u.value, (L) => (l(), p("li", {
              key: L.id
            }, [
              T(j(W), {
                type: "button",
                label: L.name,
                size: "small",
                text: "",
                disabled: b.value,
                onClick: (R) => I(L)
              }, null, 8, ["label", "disabled", "onClick"])
            ]))), 128))
          ])) : x("", !0),
          v("div", Ar, [
            d.value || c.value ? (l(), N(j(W), {
              key: 0,
              type: "button",
              label: d.value ? "Try again" : "Load more",
              size: "small",
              outlined: "",
              disabled: a.value || b.value,
              onClick: g[3] || (g[3] = (L) => A(!!c.value))
            }, null, 8, ["label", "disabled"])) : x("", !0),
            f.value ? (l(), N(j(W), {
              key: 1,
              type: "button",
              label: C.value ? "Retry linking folder" : "Link this folder",
              size: "small",
              loading: b.value,
              disabled: a.value,
              onClick: D
            }, null, 8, ["label", "loading", "disabled"])) : x("", !0)
          ]),
          f.value ? (l(), p("p", Pr, "Files directly in this folder will sync every 15 minutes.")) : x("", !0),
          C.value ? (l(), p("p", Dr, _(C.value), 1)) : x("", !0)
        ], 64)) : x("", !0)
      ], 64))
    ])) : x("", !0);
  }
}), Tr = { class: "kx-modal-head-icon" }, Vr = { class: "kx-modal-head-text" }, Br = { class: "kx-modal-head-title" }, jr = { class: "kx-modal-head-sub" }, Hr = { class: "kx-2p" }, Kr = { class: "kx-2p-l" }, Rr = { class: "kx-form" }, Nr = { class: "kx-field" }, Ur = { class: "kx-name-row" }, Gr = { class: "kx-field" }, Wr = {
  key: 0,
  class: "kx-field"
}, qr = { class: "kx-type sel kx-type-fixed" }, Zr = { class: "kx-type-name" }, Yr = { class: "kx-type-desc" }, Xr = {
  key: 1,
  class: "kx-field"
}, Jr = {
  key: 0,
  class: "kx-cat-search"
}, Qr = { class: "kx-cat" }, ea = ["onClick"], ta = { class: "kx-cat-ico" }, na = { class: "kx-cat-text" }, oa = { class: "kx-cat-name" }, ia = { class: "kx-cat-desc" }, ra = {
  class: "kx-notice kx-notice-error",
  style: { margin: "0" }
}, aa = {
  key: 1,
  class: "kx-notice",
  style: { margin: "0" }
}, la = {
  key: 2,
  class: "kx-cat-empty"
}, sa = { class: "kx-2p-r" }, da = { class: "kx-2p-r-body" }, ua = {
  key: 1,
  class: "kx-form"
}, ca = {
  key: 0,
  class: "kx-field"
}, pa = ["value"], fa = {
  key: 1,
  class: "kx-field"
}, ba = { class: "kx-options" }, ha = { class: "kx-field-lbl" }, ma = {
  key: 0,
  class: "kx-field-hint-inline"
}, va = {
  key: 1,
  class: "kx-check"
}, ga = ["checked", "onChange"], ya = ["type", "min", "max", "step", "value", "onInput"], ka = {
  key: 2,
  class: "kx-2p-r-note"
}, wa = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, It = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.", $a = /* @__PURE__ */ ze({
  __name: "KbDialog",
  props: {
    open: { type: Boolean },
    api: {},
    engines: {},
    models: {},
    target: {},
    parentId: {},
    loadError: {}
  },
  emits: ["close", "saved", "retry"],
  setup(t, { emit: e }) {
    const n = {
      header: { class: "kx-modal-head" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-modal-foot" }
    }, o = t, r = e, i = F(!1), s = F(""), f = F(""), u = F({ name: "", description: "", icon: "", kb_type: "" }), c = F({ embedding_model: "", config: {} }), a = G(() => !!o.target);
    function b(k) {
      return o.engines.find((h) => h.kb_type === k);
    }
    const d = G(() => b(u.value.kb_type)), C = G(() => !!d.value?.create_ui_id), $ = G(() => {
      const k = f.value.trim().toLowerCase();
      return k ? o.engines.filter((h) => (h.label || "").toLowerCase().includes(k) || (h.description || "").toLowerCase().includes(k) || (h.kb_type || "").toLowerCase().includes(k)) : o.engines;
    }), S = G(() => !a.value && o.engines.length > 6), O = F({}), P = F(""), B = G(() => {
      const k = d.value?.config_schema?.properties || {};
      return Object.entries(k).map(([h, y]) => ({ key: h, ...y })).sort((h, y) => (h.order ?? 100) - (y.order ?? 100) || h.key.localeCompare(y.key));
    });
    function A(k) {
      const h = { ...k?.default_config || {} }, y = k?.config_schema?.properties || {};
      for (const [q, ke] of Object.entries(y))
        h[q] === void 0 && ke.default !== void 0 && (h[q] = ke.default);
      return h;
    }
    function z(k) {
      return k.replace(/[_-]+/g, " ").replace(/\b\w/g, (h) => h.toUpperCase());
    }
    function I(k) {
      return k.target?.value ?? "";
    }
    function D(k) {
      return k.target?.checked === !0;
    }
    function m(k) {
      const h = O.value[k];
      return h == null ? "" : String(h);
    }
    function g(k) {
      return O.value[k] === !0;
    }
    function L(k, h) {
      if (k.type === "boolean")
        O.value[k.key] = h === !0;
      else if (k.type === "integer") {
        const y = Number.parseInt(String(h), 10);
        O.value[k.key] = Number.isNaN(y) ? void 0 : y;
      } else if (k.type === "number") {
        const y = Number.parseFloat(String(h));
        O.value[k.key] = Number.isNaN(y) ? void 0 : y;
      } else
        O.value[k.key] = String(h);
      H();
    }
    function R(k) {
      return (k.options || k.enum || []).map((y) => {
        if (y && typeof y == "object") {
          const q = String(y.value);
          return { label: y.label || q, value: q };
        }
        return { label: String(y), value: String(y) };
      });
    }
    function H() {
      c.value = { embedding_model: P.value, config: { ...O.value } };
    }
    function K(k) {
      P.value = k.detail || "", H();
    }
    const re = F(null);
    let oe = null, X = 0;
    function ie(k) {
      const h = k.detail;
      h && typeof h == "object" && (c.value = {
        embedding_model: typeof h.embedding_model == "string" ? h.embedding_model : c.value.embedding_model,
        config: h.config && typeof h.config == "object" ? { ...h.config } : c.value.config
      });
    }
    function te() {
      oe && (oe.removeEventListener("config-changed", ie), oe.remove(), oe = null);
    }
    async function be() {
      const k = ++X;
      te();
      const h = d.value, y = h?.create_ui_id, q = re.value;
      if (!y || !q) return;
      try {
        await Ne(y, { timeoutMs: 8e3 });
      } catch {
      }
      if (k !== X) return;
      q.replaceChildren();
      const ke = document.createElement(y), lt = { ...a.value ? o.target?.config || {} : A(h) };
      h?.config_schema && (lt.config_schema = h.config_schema);
      try {
        ke.setAttribute("config", JSON.stringify({
          id: a.value ? o.target?.id : void 0,
          kb_type: u.value.kb_type,
          embedding_model: a.value && o.target?.embedding_model || "",
          config: lt,
          edit: a.value
        }));
      } catch {
      }
      ke.addEventListener("config-changed", ie), q.appendChild(ke), oe = ke;
    }
    async function he() {
      C.value ? (await qe(), be()) : (te(), O.value = a.value && o.target?.config ? { ...o.target.config } : A(d.value), P.value = a.value ? "" : o.models[0]?.name || "", H());
    }
    pe(() => u.value.kb_type, he);
    function xe() {
      if (s.value = "", f.value = "", o.target) {
        const k = o.target;
        u.value = { name: k.name || "", description: k.description || "", icon: k.icon || "", kb_type: k.kb_type || "" };
      } else {
        const k = o.engines[0]?.kb_type || "";
        u.value = { name: "", description: "", icon: "", kb_type: k };
      }
      c.value = { embedding_model: "", config: {} }, qe(() => {
        he();
      });
    }
    pe(() => o.open, (k) => {
      k ? xe() : te();
    }), Ie(te), Ue(() => {
      Ne("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    function E() {
      te(), r("close");
    }
    const V = G({
      get: () => o.open,
      set: (k) => {
        k || E();
      }
    }), U = G(() => !u.value.name.trim() || !u.value.kb_type ? !1 : a.value ? !0 : !!c.value.embedding_model);
    async function ae() {
      if (!u.value.name.trim()) {
        s.value = "Name is required.";
        return;
      }
      if (!a.value && !c.value.embedding_model) {
        s.value = "An embedding model is required. None are available — install a model provider first.";
        return;
      }
      i.value = !0, s.value = "";
      try {
        if (a.value && o.target) {
          const { data: k } = await o.api.put(`/api/v1/knowledge/${o.target.id}`, {
            name: u.value.name,
            description: u.value.description,
            icon: u.value.icon,
            config: c.value.config
          });
          if (!k?.success) {
            s.value = k?.error || "save failed";
            return;
          }
        } else {
          const { data: k } = await o.api.post("/api/v1/knowledge/create", {
            name: u.value.name,
            description: u.value.description,
            icon: u.value.icon,
            kb_type: u.value.kb_type,
            embedding_model: c.value.embedding_model,
            config: c.value.config,
            parent_id: o.parentId || ""
          });
          if (!k?.success) {
            const h = k?.error || "create failed";
            s.value = Oe(h) ? It : h;
            return;
          }
        }
        te(), r("saved");
      } catch (k) {
        const h = ne(k, a.value ? "save failed" : "create failed");
        s.value = Oe(h) ? It : h;
      } finally {
        i.value = !1;
      }
    }
    function Oe(k) {
      const h = k.toLowerCase();
      return h.includes("no implementation") || h.includes("no engine") || h.includes("contract unavailable") || h.includes("not found") && h.includes("binding");
    }
    return (k, h) => (l(), N(j(Dt), {
      visible: V.value,
      "onUpdate:visible": h[5] || (h[5] = (y) => V.value = y),
      modal: "",
      "dismissable-mask": !0,
      class: "kx-dialog",
      pt: n,
      "aria-label": a.value ? "Edit knowledge base" : "New knowledge base"
    }, {
      header: Z(() => [
        v("span", Tr, [
          T(j(ce), {
            icon: u.value.icon || d.value?.icon || "tabler:books",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        v("span", Vr, [
          v("span", Br, _(a.value ? "Edit knowledge base" : "New knowledge base"), 1),
          v("span", jr, _(u.value.description.trim() || "A collection your agents search and reason over."), 1)
        ])
      ]),
      footer: Z(() => [
        s.value ? (l(), p("div", wa, _(s.value), 1)) : x("", !0),
        T(j(W), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: i.value,
          onClick: E
        }, null, 8, ["disabled"]),
        T(j(W), {
          type: "button",
          label: i.value ? a.value ? "Saving…" : "Creating…" : a.value ? "Save changes" : "Create",
          loading: i.value,
          disabled: i.value || !U.value,
          onClick: ae
        }, {
          icon: Z(({ class: y }) => [
            T(j(ce), {
              icon: a.value ? "tabler:device-floppy" : "tabler:check",
              class: se(y),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          _: 1
        }, 8, ["label", "loading", "disabled"])
      ]),
      default: Z(() => [
        v("div", Hr, [
          v("div", Kr, [
            v("div", Rr, [
              v("div", Nr, [
                h[6] || (h[6] = v("span", { class: "kx-field-lbl" }, "Name", -1)),
                v("div", Ur, [
                  T(Wi, {
                    class: "kx-name-icon",
                    modelValue: u.value.icon,
                    "onUpdate:modelValue": h[0] || (h[0] = (y) => u.value.icon = y),
                    fallback: d.value?.icon || "tabler:books"
                  }, null, 8, ["modelValue", "fallback"]),
                  Ce(v("input", {
                    "onUpdate:modelValue": h[1] || (h[1] = (y) => u.value.name = y),
                    class: "kx-input",
                    type: "text",
                    placeholder: "e.g. Product docs"
                  }, null, 512), [
                    [We, u.value.name]
                  ])
                ])
              ]),
              v("label", Gr, [
                h[7] || (h[7] = v("span", { class: "kx-field-lbl" }, [
                  ue("Description "),
                  v("span", { class: "kx-field-hint-inline" }, "— optional")
                ], -1)),
                Ce(v("textarea", {
                  "onUpdate:modelValue": h[2] || (h[2] = (y) => u.value.description = y),
                  class: "kx-input kx-textarea",
                  rows: "3",
                  placeholder: "What this knowledge base holds."
                }, null, 512), [
                  [We, u.value.description]
                ])
              ]),
              a.value && d.value ? (l(), p("div", Wr, [
                h[8] || (h[8] = v("span", { class: "kx-field-lbl" }, "Type", -1)),
                v("div", qr, [
                  v("span", Zr, [
                    T(j(ce), {
                      icon: d.value.icon || "tabler:database",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    ue(_(d.value.label), 1)
                  ]),
                  v("span", Yr, _(d.value.description), 1)
                ])
              ])) : (l(), p("div", Xr, [
                h[10] || (h[10] = v("span", { class: "kx-field-lbl" }, "Type", -1)),
                S.value ? (l(), p("div", Jr, [
                  T(j(ce), {
                    icon: "tabler:search",
                    "aria-hidden": "true"
                  }),
                  Ce(v("input", {
                    "onUpdate:modelValue": h[3] || (h[3] = (y) => f.value = y),
                    type: "text",
                    placeholder: "Search types…",
                    "aria-label": "Search knowledge base types"
                  }, null, 512), [
                    [We, f.value]
                  ])
                ])) : x("", !0),
                v("div", Qr, [
                  (l(!0), p(Y, null, ge($.value, (y) => (l(), p("button", {
                    key: y.kb_type,
                    type: "button",
                    class: se(["kx-cat-card", { sel: u.value.kb_type === y.kb_type }]),
                    onClick: (q) => u.value.kb_type = y.kb_type
                  }, [
                    v("span", ta, [
                      T(j(ce), {
                        icon: y.icon || "tabler:database",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    v("span", na, [
                      v("span", oa, _(y.label), 1),
                      v("span", ia, _(y.description), 1)
                    ]),
                    T(j(ce), {
                      icon: "tabler:check",
                      class: "kx-cat-check",
                      "aria-hidden": "true"
                    })
                  ], 10, ea))), 128)),
                  t.loadError ? (l(), p(Y, { key: 0 }, [
                    v("div", ra, [
                      T(j(ce), {
                        icon: "tabler:alert-triangle",
                        "aria-hidden": "true"
                      }),
                      v("span", null, "Couldn't load knowledge engines. " + _(t.loadError), 1)
                    ]),
                    T(j(W), {
                      type: "button",
                      size: "small",
                      severity: "secondary",
                      outlined: "",
                      class: "kx-cat-retry",
                      label: "Try again",
                      onClick: h[4] || (h[4] = (y) => r("retry"))
                    }, {
                      icon: Z(({ class: y }) => [
                        T(j(ce), {
                          icon: "tabler:refresh",
                          class: se(y),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    })
                  ], 64)) : t.engines.length ? $.value.length ? x("", !0) : (l(), p("div", la, "No types match “" + _(f.value) + "”.", 1)) : (l(), p("div", aa, [
                    T(j(ce), {
                      icon: "tabler:info-circle",
                      "aria-hidden": "true"
                    }),
                    h[9] || (h[9] = v("span", null, "No knowledge engine installed. Install a KB engine to create knowledge bases.", -1))
                  ]))
                ])
              ]))
            ])
          ]),
          v("div", sa, [
            h[13] || (h[13] = v("div", { class: "kx-2p-r-head" }, "Configuration", -1)),
            v("div", da, [
              t.open && t.target ? (l(), N(Mr, {
                key: t.target.id,
                "kb-id": t.target.id
              }, null, 8, ["kb-id"])) : x("", !0),
              Ce(v("div", {
                ref_key: "customHost",
                ref: re,
                class: "kx-engine-host"
              }, null, 512), [
                [Qt, C.value]
              ]),
              C.value ? x("", !0) : (l(), p("div", ua, [
                a.value ? x("", !0) : (l(), p("div", ca, [
                  h[11] || (h[11] = v("span", { class: "kx-field-lbl" }, "Embedding model", -1)),
                  v("wc-model-picker", {
                    value: P.value,
                    capability: "embed",
                    onSelect: K
                  }, null, 40, pa)
                ])),
                B.value.length ? (l(), p("div", fa, [
                  h[12] || (h[12] = v("span", { class: "kx-field-lbl" }, "Options", -1)),
                  v("div", ba, [
                    (l(!0), p(Y, null, ge(B.value, (y) => (l(), p("label", {
                      key: y.key,
                      class: "kx-option"
                    }, [
                      v("span", ha, [
                        ue(_(y.label || z(y.key)) + " ", 1),
                        y.description ? (l(), p("span", ma, "— " + _(y.description), 1)) : x("", !0)
                      ]),
                      y.enum && y.enum.length || y.options && y.options.length ? (l(), N(j(Gt), {
                        key: 0,
                        class: "kx-select",
                        "model-value": m(y.key),
                        options: R(y),
                        "option-label": "label",
                        "option-value": "value",
                        "onUpdate:modelValue": (q) => L(y, q)
                      }, null, 8, ["model-value", "options", "onUpdate:modelValue"])) : y.type === "boolean" ? (l(), p("label", va, [
                        v("input", {
                          type: "checkbox",
                          checked: g(y.key),
                          onChange: (q) => L(y, D(q))
                        }, null, 40, ga),
                        v("span", null, _(g(y.key) ? "Enabled" : "Disabled"), 1)
                      ])) : (l(), p("input", {
                        key: 2,
                        class: "kx-input",
                        type: y.type === "integer" || y.type === "number" ? "number" : "text",
                        min: y.minimum,
                        max: y.maximum,
                        step: y.type === "integer" ? 1 : void 0,
                        value: m(y.key),
                        onInput: (q) => L(y, I(q))
                      }, null, 40, ya))
                    ]))), 128))
                  ])
                ])) : x("", !0),
                a.value && !B.value.length ? (l(), p("p", ka, "This knowledge base type has no editable configuration.")) : x("", !0)
              ]))
            ])
          ])
        ])
      ]),
      _: 1
    }, 8, ["visible", "aria-label"]));
  }
});
export {
  $a as _,
  ne as e,
  wt as l,
  W as s,
  Wn as u
};
//# sourceMappingURL=KbDialog.vue_vue_type_script_setup_true_lang-kdYNKpWo.js.map
