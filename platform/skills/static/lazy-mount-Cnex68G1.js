import { s as se, B as oe, l as wt, a as le, b as de, f as ne, R as tt, L as Ct, c as U, v as ge, d as Jt, U as Qt, I as lt, e as en, r as St, g as tn, h as xt, i as It, C as nn, j as on, S as Ot, _ as rn, x as ke, k as an, z as $t, m as Be, n as Se, T as xe, F as ln, M as st, o as sn, p as dn, Y as un, q as cn, t as pn, D as fn, O as hn, $ as bn, J as mn, w as ve, y as vn, P as gn } from "./wc-runtime-DNkGTY_i.js";
import { openBlock as a, createElementBlock as u, mergeProps as v, createElementVNode as f, renderSlot as L, createTextVNode as W, toDisplayString as O, resolveComponent as q, resolveDirective as nt, withDirectives as pe, createBlock as Y, resolveDynamicComponent as $e, withCtx as P, createCommentVNode as x, normalizeClass as K, defineComponent as He, computed as je, withModifiers as Me, Fragment as Q, createVNode as w, unref as I, watch as ot, onBeforeUnmount as Lt, Transition as zt, ref as V, onMounted as yn, renderList as we, normalizeProps as kn, createSlots as wn, vModelText as De } from "vue";
import { on as Cn, api as fe, host as ye, loadByTagName as Ft } from "@wippy-fe/proxy";
import { Icon as M } from "@iconify/vue";
var Ke = {
  name: "SpinnerIcon",
  extends: se
};
function Sn(e) {
  return $n(e) || On(e) || In(e) || xn();
}
function xn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function In(e, t) {
  if (e) {
    if (typeof e == "string") return We(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? We(e, t) : void 0;
  }
}
function On(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $n(e) {
  if (Array.isArray(e)) return We(e);
}
function We(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ln(e, t, n, o, r, i) {
  return a(), u("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Sn(t[0] || (t[0] = [f("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ke.render = Ln;
var zn = `
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
`, Fn = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": le(n.value) && String(n.value).length === 1,
      "p-badge-dot": wt(n.value) && !o.$slots.default,
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
}, _n = oe.extend({
  name: "badge",
  style: zn,
  classes: Fn
}), An = {
  name: "BaseBadge",
  extends: de,
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
  style: _n,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Le(e) {
  "@babel/helpers - typeof";
  return Le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Le(e);
}
function dt(e, t, n) {
  return (t = En(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function En(e) {
  var t = Pn(e, "string");
  return Le(t) == "symbol" ? t : t + "";
}
function Pn(e, t) {
  if (Le(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Le(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _t = {
  name: "Badge",
  extends: An,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ne(dt(dt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Vn = ["data-p"];
function Tn(e, t, n, o, r, i) {
  return a(), u("span", v({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [L(e.$slots, "default", {}, function() {
    return [W(O(e.value), 1)];
  })], 16, Vn);
}
_t.render = Tn;
var Dn = `
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
function ze(e) {
  "@babel/helpers - typeof";
  return ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ze(e);
}
function te(e, t, n) {
  return (t = Mn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Mn(e) {
  var t = Bn(e, "string");
  return ze(t) == "symbol" ? t : t + "";
}
function Bn(e, t) {
  if (ze(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ze(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var jn = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-button p-component", te(te(te(te(te(te(te(te(te({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", te({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Hn = oe.extend({
  name: "button",
  style: Dn,
  classes: jn
}), Kn = {
  name: "BaseButton",
  extends: de,
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
  style: Hn,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function Fe(e) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Fe(e);
}
function Z(e, t, n) {
  return (t = Rn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Rn(e) {
  var t = Nn(e, "string");
  return Fe(t) == "symbol" ? t : t + "";
}
function Nn(e, t) {
  if (Fe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Fe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var N = {
  name: "Button",
  extends: Kn,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
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
      return v(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return wt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return ne(Z(Z(Z(Z(Z(Z(Z(Z(Z(Z({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return ne(Z(Z({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return ne(Z(Z({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Ke,
    Badge: _t
  },
  directives: {
    ripple: tt
  }
}, Un = ["data-p"], Wn = ["data-p"];
function Gn(e, t, n, o, r, i) {
  var s = q("SpinnerIcon"), h = q("Badge"), b = nt("ripple");
  return e.asChild ? L(e.$slots, "default", {
    key: 1,
    class: K(e.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : pe((a(), Y($e(e.as), v({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: P(function() {
      return [L(e.$slots, "default", {}, function() {
        return [e.loading ? L(e.$slots, "loadingicon", v({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (a(), u("span", v({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (a(), Y(s, v({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : L(e.$slots, "icon", v({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (a(), u("span", v({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": i.dataIconP
          }, e.ptm("icon")), null, 16, Un)) : x("", !0)];
        }), e.label ? (a(), u("span", v({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": i.dataLabelP
        }), O(e.label), 17, Wn)) : x("", !0), e.badge ? (a(), Y(h, {
          key: 3,
          value: e.badge,
          class: K(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : x("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[b]]);
}
N.render = Gn;
var Zn = `
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
`, qn = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Yn = oe.extend({
  name: "progressspinner",
  style: Zn,
  classes: qn
}), Xn = {
  name: "BaseProgressSpinner",
  extends: de,
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
  style: Yn,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, At = {
  name: "ProgressSpinner",
  extends: Xn,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Jn = ["fill", "stroke-width"];
function Qn(e, t, n, o, r, i) {
  return a(), u("div", v({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(a(), u("svg", v({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: i.svgStyle
  }, e.ptm("spin")), [f("circle", v({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, Jn)], 16))], 16);
}
At.render = Qn;
const eo = { key: 0 }, to = /* @__PURE__ */ He({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, n = je(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (o, r) => e.state.deleting_at ? (a(), u("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: r[1] || (r[1] = Me(() => {
      }, ["stop"])),
      onKeydown: r[2] || (r[2] = Me(() => {
      }, ["stop"]))
    }, [
      n.value ? (a(), u(Q, { key: 0 }, [
        f("span", null, [
          r[3] || (r[3] = W("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (a(), u("span", eo, ": " + O(e.state.deletion_job.last_error), 1)) : x("", !0)
        ]),
        w(I(N), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: r[0] || (r[0] = Me((i) => o.$emit("retry"), ["stop"]))
        })
      ], 64)) : (a(), u(Q, { key: 1 }, [
        w(I(At), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        r[4] || (r[4] = f("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : x("", !0);
  }
});
function Ie(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function no(e, t) {
  return e;
}
function oo(e, t, n) {
  const o = Ie(e) ? e : {}, r = [
    o,
    Ie(o.data) ? o.data : null,
    Ie(o.payload) ? o.payload : null,
    Ie(o.detail) ? o.detail : null
  ].filter(Boolean);
  for (const i of r) {
    if (i.event !== "component.meta.changed" && i.event !== "component.deleting" && i.event !== "component.deleted") continue;
    const s = String(i.component_id || ""), h = String(o.topic || i.topic || "");
    if (!s && (!h.startsWith("component.") || h === "component.")) continue;
    const b = s || t || h.slice(10);
    return i.event === "component.deleting" && typeof i.deletion_job_id == "string" && i.deletion_job_id ? { event: i.event, component_id: b, deletion_job_id: i.deletion_job_id } : i.event !== "component.meta.changed" ? { event: i.event, component_id: b } : {
      event: "component.meta.changed",
      component_id: b,
      meta: no(Ie(i.meta) ? i.meta : {}),
      deleted: Array.isArray(i.deleted) ? i.deleted.map(String) : []
    };
  }
  return null;
}
function io(e, t) {
  const n = oo(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function ro(e, t, n, o) {
  const r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map();
  function s(p, d) {
    const g = e.value.find((E) => t(E) === p), c = i.get(p), y = d?.job_id || c?.state.deletion_job_id || g?.deletion_job_id, _ = c ? c.state.deletion_job_id : g?.deleting_at ? g.deletion_job_id : void 0;
    if ((c || g?.deleting_at) && y === _ || y && c?.superseded.has(y)) return;
    const C = {
      deleting_at: c?.state.deleting_at || g?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: y
    }, $ = new Set(c?.superseded);
    for (const E of [c?.state.deletion_job_id, g?.deletion_job_id])
      E && E !== y && $.add(E);
    i.set(p, { state: C, superseded: $ }), g && (Object.assign(g, C), g.deletion_job = void 0);
  }
  const h = ot(() => e.value, (p, d = []) => {
    const g = p.filter((c) => !r.has(t(c)));
    for (const c of d)
      r.has(t(c)) || g.some((y) => t(y) === t(c)) || c.deleting_at && o?.(t(c));
    if (g.length !== p.length) {
      e.value = g;
      return;
    }
    for (const c of p) {
      c.deleting_at && c.deletion_job === void 0 && !d.includes(c) && (c.deletion_job = null);
      const y = i.get(t(c));
      if (y) {
        const C = c.deletion_job_id;
        c.deleting_at && C && C !== y.state.deletion_job_id && !y.superseded.has(C) && (y.state.deletion_job_id && y.superseded.add(y.state.deletion_job_id), y.state.deletion_job_id = C), C !== y.state.deletion_job_id && (c.deletion_job = void 0), Object.assign(c, y.state);
      }
      const _ = d.find((C) => t(C) === t(c));
      c.deletion_job === void 0 && _?.deletion_job_id === c.deletion_job_id && (c.deletion_job = _?.deletion_job);
    }
  }, { immediate: !0 }), b = Cn("@message", (p) => {
    const d = io(p);
    if (!d) return;
    const g = e.value.find((c) => t(c) === d.component_id);
    d.event === "component.deleted" ? (g && !r.has(d.component_id) && o?.(d.component_id), r.add(d.component_id), i.delete(d.component_id), e.value = e.value.filter((c) => t(c) !== d.component_id)) : g && s(d.component_id, { job_id: d.deletion_job_id });
  });
  return Lt(() => {
    h(), typeof b == "function" && b();
  }), { acceptDeletion: s };
}
var it = {
  name: "TimesIcon",
  extends: se
};
function ao(e) {
  return co(e) || uo(e) || so(e) || lo();
}
function lo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function so(e, t) {
  if (e) {
    if (typeof e == "string") return Ge(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ge(e, t) : void 0;
  }
}
function uo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function co(e) {
  if (Array.isArray(e)) return Ge(e);
}
function Ge(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function po(e, t, n, o, r, i) {
  return a(), u("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ao(t[0] || (t[0] = [f("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
it.render = po;
var Et = {
  name: "WindowMaximizeIcon",
  extends: se
};
function fo(e) {
  return vo(e) || mo(e) || bo(e) || ho();
}
function ho() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bo(e, t) {
  if (e) {
    if (typeof e == "string") return Ze(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ze(e, t) : void 0;
  }
}
function mo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function vo(e) {
  if (Array.isArray(e)) return Ze(e);
}
function Ze(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function go(e, t, n, o, r, i) {
  return a(), u("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), fo(t[0] || (t[0] = [f("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Et.render = go;
var Pt = {
  name: "WindowMinimizeIcon",
  extends: se
};
function yo(e) {
  return So(e) || Co(e) || wo(e) || ko();
}
function ko() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wo(e, t) {
  if (e) {
    if (typeof e == "string") return qe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qe(e, t) : void 0;
  }
}
function Co(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function So(e) {
  if (Array.isArray(e)) return qe(e);
}
function qe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function xo(e, t, n, o, r, i) {
  return a(), u("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), yo(t[0] || (t[0] = [f("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Pt.render = xo;
var Io = oe.extend({
  name: "focustrap-directive"
}), Oo = Jt.extend({
  style: Io
});
function _e(e) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _e(e);
}
function ut(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ct(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ut(Object(n), !0).forEach(function(o) {
      $o(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ut(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function $o(e, t, n) {
  return (t = Lo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Lo(e) {
  var t = zo(e, "string");
  return _e(t) == "symbol" ? t : t + "";
}
function zo(e, t) {
  if (_e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (_e(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Fo = Oo.extend("focustrap", {
  mounted: function(t, n) {
    var o = n.value || {}, r = o.disabled;
    r || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var o = n.value || {}, r = o.disabled;
    r && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var o = this, r = n.value || {}, i = r.onFocusIn, s = r.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(h) {
        h.forEach(function(b) {
          if (b.type === "childList" && !t.contains(document.activeElement)) {
            var p = function(g) {
              var c = lt(g) ? lt(g, o.getComputedSelector(t.$_pfocustrap_focusableselector)) ? g : ge(t, o.getComputedSelector(t.$_pfocustrap_focusableselector)) : ge(g);
              return le(c) ? c : g.nextSibling && p(g.nextSibling);
            };
            U(p(b.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(h) {
        return i && i(h);
      }, t.$_pfocustrap_focusoutlistener = function(h) {
        return s && s(h);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: ct(ct({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var o = n.value || {}, r = o.autoFocusSelector, i = r === void 0 ? "" : r, s = o.firstFocusableSelector, h = s === void 0 ? "" : s, b = o.autoFocus, p = b === void 0 ? !1 : b, d = ge(t, "[autofocus]".concat(this.getComputedSelector(i)));
      p && !d && (d = ge(t, this.getComputedSelector(h))), U(d);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, r = t.relatedTarget, i = r === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(r)) ? ge(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      U(i);
    },
    onLastHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, r = t.relatedTarget, i = r === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(r)) ? Ct(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      U(i);
    },
    createHiddenFocusableElements: function(t, n) {
      var o = this, r = n.value || {}, i = r.tabIndex, s = i === void 0 ? 0 : i, h = r.firstFocusableSelector, b = h === void 0 ? "" : h, p = r.lastFocusableSelector, d = p === void 0 ? "" : p, g = function(C) {
        return Qt("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: s,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: C?.bind(o)
        });
      }, c = g(this.onFirstHiddenElementFocus), y = g(this.onLastHiddenElementFocus);
      c.$_pfocustrap_lasthiddenfocusableelement = y, c.$_pfocustrap_focusableselector = b, c.setAttribute("data-pc-section", "firstfocusableelement"), y.$_pfocustrap_firsthiddenfocusableelement = c, y.$_pfocustrap_focusableselector = d, y.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(c), t.append(y);
    }
  }
});
function pt() {
  tn({
    variableName: St("scrollbar.width").name
  });
}
function ft() {
  en({
    variableName: St("scrollbar.width").name
  });
}
var _o = `
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
`, Ao = {
  mask: function(t) {
    var n = t.position, o = t.modal;
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
}, Eo = {
  mask: function(t) {
    var n = t.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], r = o.find(function(i) {
      return i === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, r ? "p-dialog-".concat(r) : ""];
  },
  root: function(t) {
    var n = t.props, o = t.instance;
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
}, Po = oe.extend({
  name: "dialog",
  style: _o,
  classes: Eo,
  inlineStyles: Ao
}), Vo = {
  name: "BaseDialog",
  extends: de,
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
  style: Po,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Vt = {
  name: "Dialog",
  extends: Vo,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: je(function() {
        return t._instance;
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && ke.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && ke.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && an(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), U(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && ke.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(t) {
      this.maskMouseDownTarget = t.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var t = function(r) {
        return r && r.querySelector("[autofocus]");
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && U(n, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? pt() : ft());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && pt();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && ft();
    },
    onKeyDown: function(t) {
      t.code === "Escape" && this.closeOnEscape && !t.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(t) {
      this.container = t;
    },
    maskRef: function(t) {
      this.mask = t;
    },
    contentRef: function(t) {
      this.content = t;
    },
    headerContainerRef: function(t) {
      this.headerContainer = t;
    },
    footerContainerRef: function(t) {
      this.footerContainer = t;
    },
    maximizableRef: function(t) {
      this.maximizableButton = t ? t.$el : void 0;
    },
    closeButtonRef: function(t) {
      this.closeButton = t ? t.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var t;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", rn(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
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
    initDrag: function(t) {
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Ot(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", t));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var t = this;
      this.documentDragListener = function(n) {
        if (t.dragging) {
          var o = It(t.container), r = nn(t.container), i = n.pageX - t.lastPageX, s = n.pageY - t.lastPageY, h = t.container.getBoundingClientRect(), b = h.left + i, p = h.top + s, d = on(), g = getComputedStyle(t.container), c = parseFloat(g.marginLeft), y = parseFloat(g.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (b >= t.minX && b + o < d.width && (t.lastPageX = n.pageX, t.container.style.left = b - c + "px"), p >= t.minY && p + r < d.height && (t.lastPageY = n.pageY, t.container.style.top = p - y + "px")) : (t.lastPageX = n.pageX, t.container.style.left = b - c + "px", t.lastPageY = n.pageY, t.container.style.top = p - y + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var t = this;
      this.documentDragEndListener = function(n) {
        t.dragging && (t.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !t.isUnstyled && (document.body.style["user-select"] = ""), t.$emit("dragend", n));
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
      return ne({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: tt,
    focustrap: Fo
  },
  components: {
    Button: N,
    Portal: xt,
    WindowMinimizeIcon: Pt,
    WindowMaximizeIcon: Et,
    TimesIcon: it
  }
};
function Ae(e) {
  "@babel/helpers - typeof";
  return Ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ae(e);
}
function ht(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function bt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ht(Object(n), !0).forEach(function(o) {
      To(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ht(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function To(e, t, n) {
  return (t = Do(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Do(e) {
  var t = Mo(e, "string");
  return Ae(t) == "symbol" ? t : t + "";
}
function Mo(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ae(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Bo = ["data-p"], jo = ["aria-labelledby", "aria-modal", "data-p"], Ho = ["id"], Ko = ["data-p"];
function Ro(e, t, n, o, r, i) {
  var s = q("Button"), h = q("Portal"), b = nt("focustrap");
  return a(), Y(h, {
    appendTo: e.appendTo
  }, {
    default: P(function() {
      return [r.containerVisible ? (a(), u("div", v({
        key: 0,
        ref: i.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return i.onMaskMouseDown && i.onMaskMouseDown.apply(i, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return i.onMaskMouseUp && i.onMaskMouseUp.apply(i, arguments);
        }),
        "data-p": i.dataP
      }, e.ptm("mask")), [w(zt, v({
        name: "p-dialog",
        onEnter: i.onEnter,
        onAfterEnter: i.onAfterEnter,
        onBeforeLeave: i.onBeforeLeave,
        onLeave: i.onLeave,
        onAfterLeave: i.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: P(function() {
          return [e.visible ? pe((a(), u("div", v({
            key: 0,
            ref: i.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": i.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": i.dataP
          }, e.ptmi("root")), [e.$slots.container ? L(e.$slots, "container", {
            key: 0,
            closeCallback: i.close,
            maximizeCallback: function(d) {
              return i.maximize(d);
            },
            initDragCallback: i.initDrag
          }) : (a(), u(Q, {
            key: 1
          }, [e.showHeader ? (a(), u("div", v({
            key: 0,
            ref: i.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return i.initDrag && i.initDrag.apply(i, arguments);
            })
          }, e.ptm("header")), [L(e.$slots, "header", {
            class: K(e.cx("title"))
          }, function() {
            return [e.header ? (a(), u("span", v({
              key: 0,
              id: i.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), O(e.header), 17, Ho)) : x("", !0)];
          }), f("div", v({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? L(e.$slots, "maximizebutton", {
            key: 0,
            maximized: r.maximized,
            maximizeCallback: function(d) {
              return i.maximize(d);
            }
          }, function() {
            return [w(s, v({
              ref: i.maximizableRef,
              autofocus: r.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: i.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: P(function(p) {
                return [L(e.$slots, "maximizeicon", {
                  maximized: r.maximized
                }, function() {
                  return [(a(), Y($e(i.maximizeIconComponent), v({
                    class: [p.class, r.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : x("", !0), e.closable ? L(e.$slots, "closebutton", {
            key: 1,
            closeCallback: i.close
          }, function() {
            return [w(s, v({
              ref: i.closeButtonRef,
              autofocus: r.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: i.close,
              "aria-label": i.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: P(function(p) {
                return [L(e.$slots, "closeicon", {}, function() {
                  return [(a(), Y($e(e.closeIcon ? "span" : "TimesIcon"), v({
                    class: [e.closeIcon, p.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : x("", !0)], 16)], 16)) : x("", !0), f("div", v({
            ref: i.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": i.dataP
          }, bt(bt({}, e.contentProps), e.ptm("content"))), [L(e.$slots, "default")], 16, Ko), e.footer || e.$slots.footer ? (a(), u("div", v({
            key: 1,
            ref: i.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [L(e.$slots, "footer", {}, function() {
            return [W(O(e.footer), 1)];
          })], 16)) : x("", !0)], 64))], 16, jo)), [[b, {
            disabled: !e.modal
          }]]) : x("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Bo)) : x("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Vt.render = Ro;
function No(e, t) {
  if (e && typeof e == "object") {
    const n = e, o = n.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return t;
}
function ae(e, t) {
  if (e && typeof e == "object") {
    const n = e;
    n.response?.status === 401 && ye.handleError("auth-expired", n);
  }
  return No(e, t);
}
async function Uo() {
  try {
    const { data: e } = await fe.get("/api/v1/skills?limit=100");
    if (!e?.success) throw new Error(e?.error || "failed to load skills");
    return e.skills || [];
  } catch (e) {
    throw new Error(ae(e, "could not load skills"));
  }
}
async function mt(e, t) {
  try {
    const n = t != null ? `/api/v1/skills/${e}?version=${t}` : `/api/v1/skills/${e}`, { data: o } = await fe.get(n);
    if (!o?.success || !o.skill) throw new Error(o?.error || "failed to load skill");
    return o.skill;
  } catch (n) {
    throw new Error(ae(n, "could not load skill"));
  }
}
async function Wo(e) {
  try {
    const { data: t } = await fe.get(`/api/v1/skills/${e}/versions`);
    if (!t?.success) throw new Error(t?.error || "failed to load versions");
    return t.versions || [];
  } catch (t) {
    throw new Error(ae(t, "could not load versions"));
  }
}
async function Go(e, t, n) {
  const { data: o } = await fe.get(`/api/v1/skills/${encodeURIComponent(e)}/file?path=${encodeURIComponent(t)}&version=${n}&format=base64`);
  if (!o?.success || !o.file) throw new Error(o?.error || "could not read skill file");
  const r = o.file, i = Uint8Array.from(atob(r.content), (s) => s.charCodeAt(0));
  return new Blob([i], { type: r.mime_type || "application/octet-stream" });
}
const Zo = {
  active: "Active",
  archived: "Archived"
};
function qo(e) {
  return e ? Zo[e] ?? e : "";
}
const Yo = {
  reference: "Reference",
  asset: "Asset",
  script: "Script"
};
function Xo(e) {
  return e ? Yo[e] ?? e : "";
}
const Jo = /* @__PURE__ */ He({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, o = t, r = V(null);
    let i = null;
    function s(b) {
      o("update:modelValue", b.detail || "");
    }
    async function h() {
      if (r.value) {
        i && i.removeEventListener("select", s), r.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await Ft("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        r.value && (i = document.createElement("wc-icon-picker"), i.setAttribute("value", n.modelValue || ""), n.fallback && i.setAttribute("fallback", n.fallback), i.addEventListener("select", s), r.value.appendChild(i));
      }
    }
    return yn(h), ot(() => n.modelValue, (b) => {
      i && i.getAttribute("value") !== b && i.setAttribute("value", b || "");
    }), Lt(() => {
      i && i.removeEventListener("select", s);
    }), (b, p) => (a(), u("div", {
      ref_key: "host",
      ref: r,
      class: "wc-iconfield"
    }, null, 512));
  }
});
function Qo() {
  let e = 0;
  return () => {
    const t = ++e;
    return () => t === e;
  };
}
var Tt = {
  name: "BlankIcon",
  extends: se
};
function ei(e) {
  return ii(e) || oi(e) || ni(e) || ti();
}
function ti() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ni(e, t) {
  if (e) {
    if (typeof e == "string") return Ye(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ye(e, t) : void 0;
  }
}
function oi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ii(e) {
  if (Array.isArray(e)) return Ye(e);
}
function Ye(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ri(e, t, n, o, r, i) {
  return a(), u("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ei(t[0] || (t[0] = [f("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Tt.render = ri;
var Dt = {
  name: "CheckIcon",
  extends: se
};
function ai(e) {
  return ui(e) || di(e) || si(e) || li();
}
function li() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function si(e, t) {
  if (e) {
    if (typeof e == "string") return Xe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xe(e, t) : void 0;
  }
}
function di(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ui(e) {
  if (Array.isArray(e)) return Xe(e);
}
function Xe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ci(e, t, n, o, r, i) {
  return a(), u("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ai(t[0] || (t[0] = [f("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Dt.render = ci;
var Mt = {
  name: "ChevronDownIcon",
  extends: se
};
function pi(e) {
  return mi(e) || bi(e) || hi(e) || fi();
}
function fi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hi(e, t) {
  if (e) {
    if (typeof e == "string") return Je(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Je(e, t) : void 0;
  }
}
function bi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function mi(e) {
  if (Array.isArray(e)) return Je(e);
}
function Je(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function vi(e, t, n, o, r, i) {
  return a(), u("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), pi(t[0] || (t[0] = [f("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Mt.render = vi;
var Bt = {
  name: "SearchIcon",
  extends: se
};
function gi(e) {
  return Ci(e) || wi(e) || ki(e) || yi();
}
function yi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ki(e, t) {
  if (e) {
    if (typeof e == "string") return Qe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qe(e, t) : void 0;
  }
}
function wi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ci(e) {
  if (Array.isArray(e)) return Qe(e);
}
function Qe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Si(e, t, n, o, r, i) {
  return a(), u("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), gi(t[0] || (t[0] = [f("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Bt.render = Si;
var xi = `
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
`, Ii = {
  root: "p-iconfield"
}, Oi = oe.extend({
  name: "iconfield",
  style: xi,
  classes: Ii
}), $i = {
  name: "BaseIconField",
  extends: de,
  style: Oi,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, jt = {
  name: "IconField",
  extends: $i,
  inheritAttrs: !1
};
function Li(e, t, n, o, r, i) {
  return a(), u("div", v({
    class: e.cx("root")
  }, e.ptmi("root")), [L(e.$slots, "default")], 16);
}
jt.render = Li;
var zi = {
  root: "p-inputicon"
}, Fi = oe.extend({
  name: "inputicon",
  classes: zi
}), _i = {
  name: "BaseInputIcon",
  extends: de,
  style: Fi,
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
  extends: _i,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Ai(e, t, n, o, r, i) {
  return a(), u("span", v({
    class: i.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [L(e.$slots, "default")], 16);
}
Ht.render = Ai;
var Ei = {
  name: "BaseEditableHolder",
  extends: de,
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
      handler: function(t) {
        this.d_value = t;
      }
    },
    defaultValue: function(t) {
      this.d_value = t;
    },
    $formName: {
      immediate: !0,
      handler: function(t) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, this.$formName, t)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(t) {
        this.d_value !== t && (this.d_value = t);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(t) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && t !== this.d_value && (this.d_value = t);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(t, n) {
      var o, r;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (o = (r = this.formField).onChange) === null || o === void 0 || o.call(r, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), o = 0; o < t; o++)
        n[o] = arguments[o];
      return n.find(le);
    }
  },
  computed: {
    $filled: function() {
      return le(this.d_value);
    },
    $invalid: function() {
      var t, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var t;
      return this.$formNovalidate ? void 0 : this.name || ((t = this.$formControl) === null || t === void 0 ? void 0 : t.name);
    },
    $formControl: function() {
      var t;
      return this.formControl || ((t = this.$pcFormField) === null || t === void 0 ? void 0 : t.formControl);
    },
    $formNovalidate: function() {
      var t;
      return (t = this.$formControl) === null || t === void 0 ? void 0 : t.novalidate;
    },
    $formDefaultValue: function() {
      var t, n;
      return this.findNonEmpty(this.d_value, (t = this.$pcFormField) === null || t === void 0 ? void 0 : t.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var t, n;
      return this.findNonEmpty((t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
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
  extends: Ei,
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
      var t;
      return (t = this.variant) !== null && t !== void 0 ? t : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var t;
      return (t = this.fluid) !== null && t !== void 0 ? t : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, Pi = `
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
`, Vi = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": o.size === "small",
      "p-inputtext-lg p-inputfield-lg": o.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Ti = oe.extend({
  name: "inputtext",
  style: Pi,
  classes: Vi
}), Di = {
  name: "BaseInputText",
  extends: Kt,
  style: Ti,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function Ee(e) {
  "@babel/helpers - typeof";
  return Ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ee(e);
}
function Mi(e, t, n) {
  return (t = Bi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Bi(e) {
  var t = ji(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function ji(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ee(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Rt = {
  name: "InputText",
  extends: Di,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return v(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ne(Mi({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Hi = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Ki(e, t, n, o, r, i) {
  return a(), u("input", v({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": i.dataP,
    onInput: t[0] || (t[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, Hi);
}
Rt.render = Ki;
var Ri = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Ni = `
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
`, vt = oe.extend({
  name: "virtualscroller",
  css: Ni,
  style: Ri
}), Ui = {
  name: "BaseVirtualScroller",
  extends: de,
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
    var t;
    vt.loadCSS({
      nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
    });
  }
};
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function gt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Oe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? gt(Object(n), !0).forEach(function(o) {
      Nt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : gt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Nt(e, t, n) {
  return (t = Wi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Wi(e) {
  var t = Gi(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function Gi(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Pe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ut = {
  name: "VirtualScroller",
  extends: Ui,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var t = this.isBoth();
    return {
      first: t ? {
        rows: 0,
        cols: 0
      } : 0,
      last: t ? {
        rows: 0,
        cols: 0
      } : 0,
      page: t ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: t ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: t ? {
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
    numToleratedItems: function(t) {
      this.d_numToleratedItems = t;
    },
    loading: function(t, n) {
      this.lazy && t !== n && t !== this.d_loading && (this.d_loading = t);
    },
    items: {
      handler: function(t, n) {
        (!n || n.length !== (t || []).length) && (this.init(), this.calculateAutoSize());
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
      Be(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = Se(this.element), this.defaultHeight = xe(this.element), this.defaultContentWidth = Se(this.content), this.defaultContentHeight = xe(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
    scrollTo: function(t) {
      this.element && this.element.scrollTo(t);
    },
    scrollToIndex: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), i = this.isHorizontal(), s = r ? t.every(function(z) {
        return z > -1;
      }) : t > -1;
      if (s) {
        var h = this.first, b = this.element, p = b.scrollTop, d = p === void 0 ? 0 : p, g = b.scrollLeft, c = g === void 0 ? 0 : g, y = this.calculateNumItems(), _ = y.numToleratedItems, C = this.getContentPosition(), $ = this.itemSize, E = function() {
          var A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, X = arguments.length > 1 ? arguments[1] : void 0;
          return A <= X ? 0 : A;
        }, j = function(A, X, R) {
          return A * X + R;
        }, H = function() {
          var A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, X = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: A,
            top: X,
            behavior: o
          });
        }, F = r ? {
          rows: 0,
          cols: 0
        } : 0, S = !1, T = !1;
        r ? (F = {
          rows: E(t[0], _[0]),
          cols: E(t[1], _[1])
        }, H(j(F.cols, $[1], C.left), j(F.rows, $[0], C.top)), T = this.lastScrollPos.top !== d || this.lastScrollPos.left !== c, S = F.rows !== h.rows || F.cols !== h.cols) : (F = E(t, _), i ? H(j(F, $, C.left), d) : H(c, j(F, $, C.top)), T = this.lastScrollPos !== (i ? c : d), S = F !== h), this.isRangeChanged = S, T && (this.first = F);
      }
    },
    scrollInView: function(t, n) {
      var o = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), s = this.isHorizontal(), h = i ? t.every(function($) {
          return $ > -1;
        }) : t > -1;
        if (h) {
          var b = this.getRenderedRange(), p = b.first, d = b.viewport, g = function() {
            var E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: E,
              top: j,
              behavior: r
            });
          }, c = n === "to-start", y = n === "to-end";
          if (c) {
            if (i)
              d.first.rows - p.rows > t[0] ? g(d.first.cols * this.itemSize[1], (d.first.rows - 1) * this.itemSize[0]) : d.first.cols - p.cols > t[1] && g((d.first.cols - 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.first - p > t) {
              var _ = (d.first - 1) * this.itemSize;
              s ? g(_, 0) : g(0, _);
            }
          } else if (y) {
            if (i)
              d.last.rows - p.rows <= t[0] + 1 ? g(d.first.cols * this.itemSize[1], (d.first.rows + 1) * this.itemSize[0]) : d.last.cols - p.cols <= t[1] + 1 && g((d.first.cols + 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.last - p <= t + 1) {
              var C = (d.first + 1) * this.itemSize;
              s ? g(C, 0) : g(0, C);
            }
          }
        }
      } else
        this.scrollToIndex(t, r);
    },
    getRenderedRange: function() {
      var t = function(g, c) {
        return Math.floor(g / (c || g));
      }, n = this.first, o = 0;
      if (this.element) {
        var r = this.isBoth(), i = this.isHorizontal(), s = this.element, h = s.scrollTop, b = s.scrollLeft;
        if (r)
          n = {
            rows: t(h, this.itemSize[0]),
            cols: t(b, this.itemSize[1])
          }, o = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var p = i ? b : h;
          n = t(p, this.itemSize), o = n + this.numItemsInViewport;
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
      var t = this.isBoth(), n = this.isHorizontal(), o = this.itemSize, r = this.getContentPosition(), i = this.element ? this.element.offsetWidth - r.left : 0, s = this.element ? this.element.offsetHeight - r.top : 0, h = function(c, y) {
        return Math.ceil(c / (y || c));
      }, b = function(c) {
        return Math.ceil(c / 2);
      }, p = t ? {
        rows: h(s, o[0]),
        cols: h(i, o[1])
      } : h(n ? i : s, o), d = this.d_numToleratedItems || (t ? [b(p.rows), b(p.cols)] : b(p));
      return {
        numItemsInViewport: p,
        numToleratedItems: d
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), o = this.first, r = this.calculateNumItems(), i = r.numItemsInViewport, s = r.numToleratedItems, h = function(d, g, c) {
        var y = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(d + g + (d < c ? 2 : 3) * c, y);
      }, b = n ? {
        rows: h(o.rows, i.rows, s[0]),
        cols: h(o.cols, i.cols, s[1], !0)
      } : h(o, i, s);
      this.last = b, this.numItemsInViewport = i, this.d_numToleratedItems = s, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var p;
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: o.cols
          } : 0 : o,
          last: Math.min(t.step ? t.step : b, ((p = t.items) === null || p === void 0 ? void 0 : p.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), o = t.isHorizontal(), r = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var i = [Se(t.element), xe(t.element)], s = i[0], h = i[1];
          (n || o) && (t.element.style.width = s < t.defaultWidth ? s + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || r) && (t.element.style.height = h < t.defaultHeight ? h + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, r = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(r ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, o) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), o = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), r = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), i = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
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
      var t = this;
      if (this.element) {
        var n = this.isBoth(), o = this.isHorizontal(), r = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || r.offsetWidth, "px"), s = this.scrollHeight || "".concat(this.element.offsetHeight || r.offsetHeight, "px"), h = function(p, d) {
          return t.element.style[p] = d;
        };
        n || o ? (h("height", s), h("width", i)) : h("height", s);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var o = this.isBoth(), r = this.isHorizontal(), i = this.getContentPosition(), s = function(b, p, d) {
          var g = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = Oe(Oe({}, t.spacerStyle), Nt({}, "".concat(b), (p || []).length * d + g + "px"));
        };
        o ? (s("height", n, this.itemSize[0], i.y), s("width", this.columns || n[1], this.itemSize[1], i.x)) : r ? s("width", this.columns || n, this.itemSize, i.x) : s("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var o = this.isBoth(), r = this.isHorizontal(), i = t ? t.first : this.first, s = function(d, g) {
          return d * g;
        }, h = function() {
          var d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, g = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Oe(Oe({}, n.contentStyle), {
            transform: "translate3d(".concat(d, "px, ").concat(g, "px, 0)")
          });
        };
        if (o)
          h(s(i.cols, this.itemSize[1]), s(i.rows, this.itemSize[0]));
        else {
          var b = s(i, this.itemSize);
          r ? h(b, 0) : h(0, b);
        }
      }
    },
    onScrollPositionChange: function(t) {
      var n = this, o = t.target, r = this.isBoth(), i = this.isHorizontal(), s = this.getContentPosition(), h = function(B, G) {
        return B ? B > G ? B - G : B : 0;
      }, b = function(B, G) {
        return Math.floor(B / (G || B));
      }, p = function(B, G, ee, he, J, ie) {
        return B <= J ? J : ie ? ee - he - J : G + J - 1;
      }, d = function(B, G, ee, he, J, ie, be, Te) {
        if (B <= ie) return 0;
        var Ce = Math.max(0, be ? B < G ? ee : B - ie : B > G ? ee : B - 2 * ie), re = n.getLast(Ce, Te);
        return Ce > re ? re - J : Ce;
      }, g = function(B, G, ee, he, J, ie) {
        var be = G + he + 2 * J;
        return B >= J && (be += J + 1), n.getLast(be, ie);
      }, c = h(o.scrollTop, s.top), y = h(o.scrollLeft, s.left), _ = r ? {
        rows: 0,
        cols: 0
      } : 0, C = this.last, $ = !1, E = this.lastScrollPos;
      if (r) {
        var j = this.lastScrollPos.top <= c, H = this.lastScrollPos.left <= y;
        if (!this.appendOnly || this.appendOnly && (j || H)) {
          var F = {
            rows: b(c, this.itemSize[0]),
            cols: b(y, this.itemSize[1])
          }, S = {
            rows: p(F.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], j),
            cols: p(F.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], H)
          };
          _ = {
            rows: d(F.rows, S.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], j),
            cols: d(F.cols, S.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], H, !0)
          }, C = {
            rows: g(F.rows, _.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: g(F.cols, _.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, $ = _.rows !== this.first.rows || C.rows !== this.last.rows || _.cols !== this.first.cols || C.cols !== this.last.cols || this.isRangeChanged, E = {
            top: c,
            left: y
          };
        }
      } else {
        var T = i ? y : c, z = this.lastScrollPos <= T;
        if (!this.appendOnly || this.appendOnly && z) {
          var A = b(T, this.itemSize), X = p(A, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, z);
          _ = d(A, X, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, z), C = g(A, _, this.last, this.numItemsInViewport, this.d_numToleratedItems), $ = _ !== this.first || C !== this.last || this.isRangeChanged, E = T;
        }
      }
      return {
        first: _,
        last: C,
        isRangeChanged: $,
        scrollPos: E
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), o = n.first, r = n.last, i = n.isRangeChanged, s = n.scrollPos;
      if (i) {
        var h = {
          first: o,
          last: r
        };
        if (this.setContentPosition(h), this.first = o, this.last = r, this.lastScrollPos = s, this.$emit("scroll-index-change", h), this.lazy && this.isPageChanged(o)) {
          var b, p, d = {
            first: this.step ? Math.min(this.getPageByFirst(o) * this.step, (((b = this.items) === null || b === void 0 ? void 0 : b.length) || 0) - this.step) : o,
            last: Math.min(this.step ? (this.getPageByFirst(o) + 1) * this.step : r, ((p = this.items) === null || p === void 0 ? void 0 : p.length) || 0)
          }, g = this.lazyLoadState.first !== d.first || this.lazyLoadState.last !== d.last;
          g && this.$emit("lazy-load", d), this.lazyLoadState = d;
        }
      }
    },
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var o = this.onScrollPositionChange(t), r = o.isRangeChanged, i = r || (this.step ? this.isPageChanged() : !1);
            i && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(t), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(t);
    },
    onResize: function() {
      var t = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (Be(t.element)) {
          var n = t.isBoth(), o = t.isVertical(), r = t.isHorizontal(), i = [Se(t.element), xe(t.element)], s = i[0], h = i[1], b = s !== t.defaultWidth, p = h !== t.defaultHeight, d = n ? b || p : r ? b : o ? p : !1;
          d && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = s, t.defaultHeight = h, t.defaultContentWidth = Se(t.content), t.defaultContentHeight = xe(t.content), t.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        t.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(t) {
      var n = (this.items || []).length, o = this.isBoth() ? this.first.rows + t : this.first + t;
      return {
        index: o,
        count: n,
        first: o === 0,
        last: o === n - 1,
        even: o % 2 === 0,
        odd: o % 2 !== 0
      };
    },
    getLoaderOptions: function(t, n) {
      var o = this.loaderArr.length;
      return Oe({
        index: t,
        count: o,
        first: t === 0,
        last: t === o - 1,
        even: t % 2 === 0,
        odd: t % 2 !== 0
      }, n);
    },
    getPageByFirst: function(t) {
      return Math.floor(((t ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(t) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(t ?? this.first) : !0;
    },
    setContentEl: function(t) {
      this.content = t || this.content || $t(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(t) {
      this.element = t;
    },
    contentRef: function(t) {
      this.content = t;
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
      var t = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return t.columns ? n : n.slice(t.appendOnly ? 0 : t.first.cols, t.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var t = this.isBoth(), n = this.isHorizontal();
        if (t || n)
          return this.d_loading && this.loaderDisabled ? t ? this.loaderArr[0] : this.loaderArr : this.columns.slice(t ? this.first.cols : this.first, t ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: Ke
  }
}, Zi = ["tabindex"];
function qi(e, t, n, o, r, i) {
  var s = q("SpinnerIcon");
  return e.disabled ? (a(), u(Q, {
    key: 1
  }, [L(e.$slots, "default"), L(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: i.loadedColumns
  })], 64)) : (a(), u("div", v({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, e.ptmi("root")), [L(e.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: r.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: e.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: r.spacerStyle,
    contentStyle: r.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [f("div", v({
      ref: i.contentRef,
      class: i.contentClass,
      style: r.contentStyle
    }, e.ptm("content")), [(a(!0), u(Q, null, we(i.loadedItems, function(h, b) {
      return L(e.$slots, "item", {
        key: b,
        item: h,
        options: i.getOptions(b)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (a(), u("div", v({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, e.ptm("spacer")), null, 16)) : x("", !0), !e.loaderDisabled && e.showLoader && r.d_loading ? (a(), u("div", v({
    key: 1,
    class: i.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (a(!0), u(Q, {
    key: 0
  }, we(r.loaderArr, function(h, b) {
    return L(e.$slots, "loader", {
      key: b,
      options: i.getLoaderOptions(b, i.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : x("", !0), L(e.$slots, "loadingicon", {}, function() {
    return [w(s, v({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : x("", !0)], 16, Zi));
}
Ut.render = qi;
var Yi = `
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
`, Xi = {
  root: function(t) {
    var n = t.instance, o = t.props, r = t.state;
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
  label: function(t) {
    var n, o = t.instance, r = t.props;
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
  option: function(t) {
    var n = t.instance, o = t.props, r = t.state, i = t.option, s = t.focusedOption;
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
}, Ji = oe.extend({
  name: "select",
  style: Yi,
  classes: Xi
}), Qi = {
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
  style: Ji,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Ve(e) {
  "@babel/helpers - typeof";
  return Ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ve(e);
}
function er(e) {
  return ir(e) || or(e) || nr(e) || tr();
}
function tr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function nr(e, t) {
  if (e) {
    if (typeof e == "string") return et(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? et(e, t) : void 0;
  }
}
function or(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ir(e) {
  if (Array.isArray(e)) return et(e);
}
function et(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function yt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function kt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? yt(Object(n), !0).forEach(function(o) {
      ce(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function ce(e, t, n) {
  return (t = rr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function rr(e) {
  var t = ar(e, "string");
  return Ve(t) == "symbol" ? t : t + "";
}
function ar(e, t) {
  if (Ve(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ve(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Wt = {
  name: "Select",
  extends: Qi,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (ke.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? ve(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? ve(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? ve(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
    },
    getPTItemOptions: function(t, n, o, r) {
      return this.ptm(r, {
        context: {
          option: t,
          index: o,
          selected: this.isSelected(t),
          focused: this.focusedOptionIndex === this.getOptionIndex(o, n),
          disabled: this.isOptionDisabled(t)
        }
      });
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? ve(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return ve(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return ve(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && U(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && U(n.$refs.focusInput);
      };
      setTimeout(function() {
        o();
      }, 0);
    },
    onFocus: function(t) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", t));
    },
    onBlur: function(t) {
      var n = this;
      setTimeout(function() {
        var o, r;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", t), (o = (r = n.formField).onBlur) === null || o === void 0 || o.call(r, t);
      }, 100);
    },
    onKeyDown: function(t) {
      var n = this;
      if (this.disabled) {
        t.preventDefault();
        return;
      }
      if (bn())
        switch (t.code) {
          case "Backspace":
            this.onBackspaceKey(t, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(t);
            break;
          default:
            t.preventDefault();
            return;
        }
      var o = t.metaKey || t.ctrlKey;
      switch (t.code) {
        case "ArrowDown":
          this.onArrowDownKey(t);
          break;
        case "ArrowUp":
          this.onArrowUpKey(t, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(t, this.editable);
          break;
        case "Home":
          this.onHomeKey(t, this.editable);
          break;
        case "End":
          this.onEndKey(t, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(t);
          break;
        case "PageUp":
          this.onPageUpKey(t);
          break;
        case "Space":
          this.onSpaceKey(t, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(t);
          break;
        case "Escape":
          this.onEscapeKey(t);
          break;
        case "Tab":
          this.onTabKey(t);
          break;
        case "Backspace":
          this.onBackspaceKey(t, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !o && mn(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && U(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var o = this.searchOptions(t, n);
      !o && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && le(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? ge(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      U(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Ct(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      U(n);
    },
    onOptionSelect: function(t, n) {
      var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var r = this.getOptionValue(n);
        this.updateModel(t, r), o && this.hide(!0);
      }
    },
    onOptionMouseMove: function(t, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(t, n);
    },
    onFilterChange: function(t) {
      var n = t.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: t,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(t) {
      if (!t.isComposing)
        switch (t.code) {
          case "ArrowDown":
            this.onArrowDownKey(t);
            break;
          case "ArrowUp":
            this.onArrowUpKey(t, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(t, !0);
            break;
          case "Home":
            this.onHomeKey(t, !0);
            break;
          case "End":
            this.onEndKey(t, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(t);
            break;
          case "Escape":
            this.onEscapeKey(t);
            break;
          case "Tab":
            this.onTabKey(t);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(t) {
      hn.emit("overlay-click", {
        originalEvent: t,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(t) {
      switch (t.code) {
        case "Escape":
          this.onEscapeKey(t);
          break;
      }
    },
    onArrowDownKey: function(t) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(t, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, n);
      }
      t.preventDefault();
    },
    onArrowUpKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (t.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), t.preventDefault();
      else {
        var o = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, o), !this.overlayVisible && this.show(), t.preventDefault();
      }
    },
    onArrowLeftKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = t.currentTarget;
        t.shiftKey ? o.setSelectionRange(0, t.target.selectionStart) : (o.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(t, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onEndKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = t.currentTarget;
        if (t.shiftKey)
          o.setSelectionRange(t.target.selectionStart, o.value.length);
        else {
          var r = o.value.length;
          o.setSelectionRange(r, r), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(t, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onPageUpKey: function(t) {
      this.scrollInView(0), t.preventDefault();
    },
    onPageDownKey: function(t) {
      this.scrollInView(this.visibleOptions.length - 1), t.preventDefault();
    },
    onEnterKey: function(t) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(t)), t.preventDefault();
    },
    onSpaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(t);
    },
    onEscapeKey: function(t) {
      this.overlayVisible && this.hide(!0), t.preventDefault(), t.stopPropagation();
    },
    onTabKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (U(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      ke.set("overlay", t, this.$primevue.config.zIndex.overlay), Ot(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && U(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && U(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      ke.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? pn(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = It(this.$el) + "px", fn(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var o = n.composedPath();
        t.overlayVisible && t.overlay && !o.includes(t.$el) && !o.includes(t.overlay) && t.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var t = this;
      this.scrollHandler || (this.scrollHandler = new cn(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !un() && t.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var t = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Be(n) && (this.labelClickListener = function() {
          U(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && Be(t) && t.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var t = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          t.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return dn(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(t) {
      var n;
      return this.isValidOption(t) && typeof this.getOptionLabel(t) == "string" && ((n = this.getOptionLabel(t)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(t) {
      var n;
      return this.isValidOption(t) && typeof this.getOptionLabel(t) == "string" && ((n = this.getOptionLabel(t)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(t) {
      return le(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
    },
    isValidSelectedOption: function(t) {
      return this.isValidOption(t) && this.isSelected(t);
    },
    isSelected: function(t) {
      return sn(this.d_value, this.getOptionValue(t), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var t = this;
      return st(this.visibleOptions, function(n) {
        return t.isValidOption(n);
      });
    },
    findNextOptionIndex: function(t) {
      var n = this, o = t < this.visibleOptions.length - 1 ? this.visibleOptions.slice(t + 1).findIndex(function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o + t + 1 : t;
    },
    findPrevOptionIndex: function(t) {
      var n = this, o = t > 0 ? st(this.visibleOptions.slice(0, t), function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o : t;
    },
    findSelectedOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var t = this.findSelectedOptionIndex();
      return t < 0 ? this.findFirstOptionIndex() : t;
    },
    findLastFocusedOptionIndex: function() {
      var t = this.findSelectedOptionIndex();
      return t < 0 ? this.findLastOptionIndex() : t;
    },
    searchOptions: function(t, n) {
      var o = this;
      this.searchValue = (this.searchValue || "") + n;
      var r = -1, i = !1;
      return le(this.searchValue) && (r = this.visibleOptions.findIndex(function(s) {
        return o.isOptionExactMatched(s);
      }), r === -1 && (r = this.visibleOptions.findIndex(function(s) {
        return o.isOptionStartsWith(s);
      })), r !== -1 && (i = !0), r === -1 && this.focusedOptionIndex === -1 && (r = this.findFirstFocusedOptionIndex()), r !== -1 && this.changeFocusedOptionIndex(t, r)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        o.searchValue = "", o.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var o = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, r = $t(t.list, 'li[id="'.concat(o, '"]'));
        r ? r.scrollIntoView && r.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : t.virtualScrollerDisabled || t.virtualScroller && t.virtualScroller.scrollToIndex(n !== -1 ? n : t.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(t, n) {
      this.writeValue(n, t), this.$emit("change", {
        originalEvent: t,
        value: n
      });
    },
    flatOptions: function(t) {
      var n = this;
      return (t || []).reduce(function(o, r, i) {
        o.push({
          optionGroup: r,
          group: !0,
          index: i
        });
        var s = n.getOptionGroupChildren(r);
        return s && s.forEach(function(h) {
          return o.push(h);
        }), o;
      }, []);
    },
    overlayRef: function(t) {
      this.overlay = t;
    },
    listRef: function(t, n) {
      this.list = t, n && n(t);
    },
    virtualScrollerRef: function(t) {
      this.virtualScroller = t;
    }
  },
  computed: {
    visibleOptions: function() {
      var t = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var o = ln.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], i = [];
          return r.forEach(function(s) {
            var h = t.getOptionGroupChildren(s), b = h.filter(function(p) {
              return o.includes(p);
            });
            b.length > 0 && i.push(kt(kt({}, s), {}, ce({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", er(b))));
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
      var t = this.findSelectedOptionIndex();
      return t !== -1 ? this.getOptionLabel(this.visibleOptions[t]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var t = this.findSelectedOptionIndex();
      return t !== -1 ? this.getOptionLabel(this.visibleOptions[t]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return le(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      var t = this;
      return this.visibleOptions.filter(function(n) {
        return !t.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return ne(ce({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return ne(ce(ce({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return ne(ce({}, this.size, this.size));
    },
    overlayDataP: function() {
      return ne(ce({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: tt
  },
  components: {
    InputText: Rt,
    VirtualScroller: Ut,
    Portal: xt,
    InputIcon: Ht,
    IconField: jt,
    TimesIcon: it,
    ChevronDownIcon: Mt,
    SpinnerIcon: Ke,
    SearchIcon: Bt,
    CheckIcon: Dt,
    BlankIcon: Tt
  }
}, lr = ["id", "data-p"], sr = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], dr = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], ur = ["data-p"], cr = ["id"], pr = ["id"], fr = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function hr(e, t, n, o, r, i) {
  var s = q("SpinnerIcon"), h = q("InputText"), b = q("SearchIcon"), p = q("InputIcon"), d = q("IconField"), g = q("CheckIcon"), c = q("BlankIcon"), y = q("VirtualScroller"), _ = q("Portal"), C = nt("ripple");
  return a(), u("div", v({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, e.ptmi("root")), [e.editable ? (a(), u("input", v({
    key: 0,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    type: "text",
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    value: i.editableInputValue,
    placeholder: e.placeholder,
    tabindex: e.disabled ? -1 : e.tabindex,
    disabled: e.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": r.overlayVisible ? e.$id + "_list" : void 0,
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: t[2] || (t[2] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    onInput: t[3] || (t[3] = function() {
      return i.onEditableInput && i.onEditableInput.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, e.ptm("label")), null, 16, sr)) : (a(), u("span", v({
    key: 1,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    tabindex: e.disabled ? -1 : e.tabindex,
    role: "combobox",
    "aria-label": e.ariaLabel || (i.label === "p-emptylabel" ? void 0 : i.label),
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    "aria-disabled": e.disabled,
    onFocus: t[4] || (t[4] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[5] || (t[5] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: t[6] || (t[6] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, e.ptm("label")), [L(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var $;
    return [W(O(i.label === "p-emptylabel" ? " " : ($ = i.label) !== null && $ !== void 0 ? $ : "empty"), 1)];
  })], 16, dr)), i.isClearIconVisible ? L(e.$slots, "clearicon", {
    key: 2,
    class: K(e.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(a(), Y($e(e.clearIcon ? "i" : "TimesIcon"), v({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: i.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : x("", !0), f("div", v({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? L(e.$slots, "loadingicon", {
    key: 0,
    class: K(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (a(), u("span", v({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (a(), Y(s, v({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : L(e.$slots, "dropdownicon", {
    key: 1,
    class: K(e.cx("dropdownIcon"))
  }, function() {
    return [(a(), Y($e(e.dropdownIcon ? "span" : "ChevronDownIcon"), v({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), w(_, {
    appendTo: e.appendTo
  }, {
    default: P(function() {
      return [w(zt, v({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: P(function() {
          return [r.overlayVisible ? (a(), u("div", v({
            key: 0,
            ref: i.overlayRef,
            class: [e.cx("overlay"), e.panelClass, e.overlayClass],
            style: [e.panelStyle, e.overlayStyle],
            onClick: t[10] || (t[10] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            }),
            onKeydown: t[11] || (t[11] = function() {
              return i.onOverlayKeyDown && i.onOverlayKeyDown.apply(i, arguments);
            }),
            "data-p": i.overlayDataP
          }, e.ptm("overlay")), [f("span", v({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[7] || (t[7] = function() {
              return i.onFirstHiddenFocus && i.onFirstHiddenFocus.apply(i, arguments);
            })
          }, e.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), L(e.$slots, "header", {
            value: e.d_value,
            options: i.visibleOptions
          }), e.filter ? (a(), u("div", v({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [w(d, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: P(function() {
              return [w(h, {
                ref: "filterInput",
                type: "text",
                value: r.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: K(e.cx("pcFilter")),
                placeholder: e.filterPlaceholder,
                variant: e.variant,
                unstyled: e.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": e.$id + "_list",
                "aria-activedescendant": i.focusedOptionId,
                onKeydown: i.onFilterKeyDown,
                onBlur: i.onFilterBlur,
                onInput: i.onFilterChange,
                pt: e.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), w(p, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: P(function() {
                  return [L(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (a(), u("span", v({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (a(), Y(b, kn(v({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), f("span", v({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), O(i.filterResultMessageText), 17)], 16)) : x("", !0), f("div", v({
            class: e.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [w(y, v({
            ref: i.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), wn({
            content: P(function($) {
              var E = $.styleClass, j = $.contentRef, H = $.items, F = $.getItemOptions, S = $.contentStyle, T = $.itemSize;
              return [f("ul", v({
                ref: function(A) {
                  return i.listRef(A, j);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), E],
                style: S,
                role: "listbox"
              }, e.ptm("list")), [(a(!0), u(Q, null, we(H, function(z, A) {
                return a(), u(Q, {
                  key: i.getOptionRenderKey(z, i.getOptionIndex(A, F))
                }, [i.isOptionGroup(z) ? (a(), u("li", v({
                  key: 0,
                  id: e.$id + "_" + i.getOptionIndex(A, F),
                  style: {
                    height: T ? T + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [L(e.$slots, "optiongroup", {
                  option: z.optionGroup,
                  index: i.getOptionIndex(A, F)
                }, function() {
                  return [f("span", v({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), O(i.getOptionGroupLabel(z.optionGroup)), 17)];
                })], 16, pr)) : pe((a(), u("li", v({
                  key: 1,
                  id: e.$id + "_" + i.getOptionIndex(A, F),
                  class: e.cx("option", {
                    option: z,
                    focusedOption: i.getOptionIndex(A, F)
                  }),
                  style: {
                    height: T ? T + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(z),
                  "aria-selected": i.isSelected(z),
                  "aria-disabled": i.isOptionDisabled(z),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(A, F)),
                  onMousedown: function(R) {
                    return i.onOptionSelect(R, z);
                  },
                  onMousemove: function(R) {
                    return i.onOptionMouseMove(R, i.getOptionIndex(A, F));
                  },
                  onClick: t[8] || (t[8] = Me(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && i.isSelected(z),
                  "data-p-focused": r.focusedOptionIndex === i.getOptionIndex(A, F),
                  "data-p-disabled": i.isOptionDisabled(z)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(z, F, A, "option")), [e.checkmark ? (a(), u(Q, {
                  key: 0
                }, [i.isSelected(z) ? (a(), Y(g, v({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (a(), Y(c, v({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : x("", !0), L(e.$slots, "option", {
                  option: z,
                  selected: i.isSelected(z),
                  index: i.getOptionIndex(A, F)
                }, function() {
                  return [f("span", v({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), O(i.getOptionLabel(z)), 17)];
                })], 16, fr)), [[C]])], 64);
              }), 128)), r.filterValue && (!H || H && H.length === 0) ? (a(), u("li", v({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [L(e.$slots, "emptyfilter", {}, function() {
                return [W(O(i.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (a(), u("li", v({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [L(e.$slots, "empty", {}, function() {
                return [W(O(i.emptyMessageText), 1)];
              })], 16)) : x("", !0)], 16, cr)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: P(function($) {
              var E = $.options;
              return [L(e.$slots, "loader", {
                options: E
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), L(e.$slots, "footer", {
            value: e.d_value,
            options: i.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (a(), u("span", v({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), O(i.emptyMessageText), 17)) : x("", !0), f("span", v({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), O(i.selectedMessageText), 17), f("span", v({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[9] || (t[9] = function() {
              return i.onLastHiddenFocus && i.onLastHiddenFocus.apply(i, arguments);
            })
          }, e.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, ur)) : x("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, lr);
}
Wt.render = hr;
const br = /* @__PURE__ */ He({
  __name: "SelectField",
  props: {
    modelValue: {},
    options: {},
    ariaLabel: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (o, r) => (a(), Y(I(Wt), {
      class: "kx-select",
      "model-value": e.modelValue,
      options: e.options,
      "option-label": "label",
      "option-value": "value",
      "aria-label": e.ariaLabel,
      placeholder: e.placeholder,
      "onUpdate:modelValue": r[0] || (r[0] = (i) => n("update:modelValue", i))
    }, null, 8, ["model-value", "options", "aria-label", "placeholder"]));
  }
}), mr = { class: "kx" }, vr = { class: "kx-head" }, gr = { class: "kx-head-icon" }, yr = { class: "kx-head-actions" }, kr = { class: "kx-search" }, wr = {
  key: 0,
  class: "kx-err"
}, Cr = { class: "kx-body" }, Sr = {
  key: 0,
  class: "kx-loading"
}, xr = {
  key: 1,
  class: "kx-empty"
}, Ir = { class: "kx-empty-ico" }, Or = { class: "kx-empty-actions" }, $r = {
  key: 2,
  class: "kx-empty"
}, Lr = { class: "kx-empty-ico" }, zr = { class: "kx-empty-sub" }, Fr = { class: "kx-empty-actions" }, _r = {
  key: 3,
  class: "kx-grid"
}, Ar = { class: "kx-card-head" }, Er = { class: "kx-ficon" }, Pr = { class: "kx-card-id" }, Vr = ["title", "aria-label", "disabled", "onClick"], Tr = { class: "kx-card-meta" }, Dr = {
  key: 0,
  class: "kx-chip kx-tag-sm kx-ver"
}, Mr = ["title"], Br = {
  key: 2,
  class: "kx-chip kx-tag-sm kx-scope"
}, jr = {
  key: 3,
  class: "kx-chip kx-tag-sm kx-status"
}, Hr = { class: "kx-card-actions" }, Kr = { class: "kx-card-desc" }, Rr = { class: "kx-modal-head-icon" }, Nr = { class: "kx-modal-head-text" }, Ur = { class: "kx-modal-head-title" }, Wr = { class: "kx-modal-head-sub" }, Gr = {
  key: 0,
  class: "kx-chip kx-tag-sm kx-ver"
}, Zr = { class: "kx-edit-cols" }, qr = { class: "kx-edit-left" }, Yr = { class: "kx-field" }, Xr = { class: "kx-name-row" }, Jr = ["disabled"], Qr = { class: "kx-field" }, ea = { class: "kx-field" }, ta = {
  key: 0,
  class: "kx-meta-line"
}, na = { key: 0 }, oa = { key: 1 }, ia = { key: 2 }, ra = {
  key: 1,
  class: "kx-field"
}, aa = { class: "kx-files" }, la = {
  key: 0,
  class: "kx-file-kind"
}, sa = ["aria-label", "aria-busy"], da = {
  key: 0,
  role: "status"
}, ua = {
  key: 1,
  role: "alert"
}, ca = {
  key: 2,
  class: "kx-file-content"
}, pa = {
  key: 2,
  class: "kx-field"
}, fa = { class: "kx-field-lbl" }, ha = { class: "kx-field-hint-inline" }, ba = { class: "kx-vers" }, ma = ["onClick"], va = { class: "kx-chip kx-tag-sm kx-ver" }, ga = { class: "kx-ver-when" }, ya = {
  key: 0,
  class: "kx-ver-files"
}, ka = { class: "kx-edit-right" }, wa = { class: "kx-edit-right-head" }, Ca = { class: "kx-field-lbl" }, Sa = { class: "kx-field-hint-inline" }, xa = {
  key: 0,
  class: "kx-preview-bar"
}, Ia = { class: "kx-preview-tag" }, Oa = ["value"], $a = {
  key: 0,
  class: "kx-err inline kx-edit-err"
}, Ue = "tabler:bulb", La = /* @__PURE__ */ He({
  __name: "skills",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = [
      { label: "Active", value: "active" },
      { label: "Archived", value: "archived" }
    ], o = V(!1), r = V(""), i = V([]), s = V(""), h = je(() => {
      const k = s.value.trim().toLowerCase();
      return k ? i.value.filter((m) => (m.name || "").toLowerCase().includes(k) || (m.description || "").toLowerCase().includes(k)) : i.value;
    }), b = Qo();
    async function p() {
      const k = b();
      o.value = !0, r.value = "";
      try {
        const m = await Uo();
        k() && (i.value = m);
      } catch (m) {
        k() && (r.value = ae(m, "could not load skills"));
      } finally {
        k() && (o.value = !1);
      }
    }
    const d = V(!1), g = V(!1), c = V(""), y = V(null), _ = V([]), C = V(null), $ = V(!1), E = V(""), j = V(""), H = V("");
    async function F(k, m = !1) {
      if (!(!y.value || !C.value?.version)) {
        $.value = !0, E.value = k.path, j.value = "", H.value = "";
        try {
          const l = await Go(y.value.skill_id, k.path, C.value.version);
          if (m) {
            const D = URL.createObjectURL(l);
            try {
              const ue = document.createElement("a");
              ue.href = D, ue.download = k.path.split("/").pop() || k.path, ue.click();
            } finally {
              URL.revokeObjectURL(D);
            }
          } else l.type.startsWith("text/") || /(?:json|xml|javascript|yaml)$/.test(l.type) ? j.value = await l.text() : j.value = "Binary file. Download to view its content.";
        } catch (l) {
          H.value = ae(l, "could not read skill file");
        } finally {
          $.value = !1;
        }
      }
    }
    const S = V({ name: "", description: "", body: "", status: "active", icon: Ue }), T = V([]), z = V(null), A = V(""), X = V(null), R = je(() => z.value !== null);
    function B() {
      y.value = null, C.value = null, _.value = [], T.value = [], ee(), S.value = { name: "", description: "", body: "", status: "active", icon: Ue }, c.value = "", d.value = !0;
    }
    async function G(k) {
      y.value = k, C.value = null, _.value = [], T.value = [], ee(), c.value = "", S.value = {
        name: k.name || "",
        description: k.description || "",
        body: "",
        status: k.status || "active",
        icon: k.icon || Ue
      }, d.value = !0;
      try {
        const m = await mt(k.skill_id);
        C.value = m, S.value.body = m.body || "", S.value.description = m.description || S.value.description, S.value.status = m.status || S.value.status, S.value.icon = m.icon || S.value.icon, _.value = Array.isArray(m.files) ? m.files : [];
      } catch (m) {
        c.value = ae(m, "could not load skill body");
      }
      try {
        T.value = await Wo(k.skill_id);
      } catch {
        T.value = [];
      }
    }
    function ee() {
      E.value = "", j.value = "", H.value = "", z.value = null, A.value = "", X.value = null;
    }
    async function he(k) {
      if (y.value) {
        c.value = "";
        try {
          const m = await mt(y.value.skill_id, k);
          X.value = m, A.value = m.body || "", z.value = k;
        } catch (m) {
          c.value = ae(m, "could not load version");
        }
      }
    }
    function J() {
      ee();
    }
    function ie() {
      S.value.body = A.value, ee();
    }
    function be(k) {
      if (!k) return "";
      const m = Date.parse(k);
      if (Number.isNaN(m)) return "";
      const l = Math.max(0, Math.round((Date.now() - m) / 1e3));
      if (l < 60) return "just now";
      const D = Math.round(l / 60);
      if (D < 60) return `${D}m ago`;
      const ue = Math.round(D / 60);
      if (ue < 24) return `${ue}h ago`;
      const at = Math.round(ue / 24);
      return at < 30 ? `${at}d ago` : new Date(m).toLocaleDateString();
    }
    function Te() {
      d.value = !1, y.value = null, C.value = null, T.value = [], ee(), c.value = "";
    }
    async function Ce() {
      if (!S.value.name.trim()) {
        c.value = "Name is required.";
        return;
      }
      if (!S.value.description.trim()) {
        c.value = "A description is required — it is what agents use to find the skill.";
        return;
      }
      g.value = !0, c.value = "";
      try {
        if (y.value) {
          const { data: k } = await fe.patch(`/api/v1/skills/${y.value.skill_id}`, {
            body: S.value.body,
            description: S.value.description,
            status: S.value.status,
            icon: S.value.icon
          });
          if (!k?.success) throw new Error(k?.error || "save failed");
          ye.toast({ severity: "success", summary: "Saved", detail: `New version of ${S.value.name}` });
        } else {
          const { data: k } = await fe.post("/api/v1/skills", {
            name: S.value.name,
            description: S.value.description,
            body: S.value.body,
            status: S.value.status,
            icon: S.value.icon
          });
          if (!k?.success) throw new Error(k?.error || "create failed");
          ye.toast({ severity: "success", summary: "Created", detail: S.value.name });
        }
        Te(), await p();
      } catch (k) {
        c.value = ae(k, "save failed");
      } finally {
        g.value = !1;
      }
    }
    const re = V(!1), Re = V(null), me = V(null);
    let Ne = null;
    function Gt(k) {
      Re.value = k, re.value = !0;
    }
    function Zt() {
      re.value = !1, Re.value = null;
    }
    async function qt() {
      const k = Re.value;
      if (!me.value || !k) return;
      if (me.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Ft("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const m = document.createElement("kickside-share");
      m.setAttribute("config", JSON.stringify({
        resource_id: k.skill_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(k.skill_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(k.skill_id)}`,
        title: k.name || ""
      })), m.addEventListener("close", Zt), me.value.appendChild(m), Ne = m;
    }
    ot([re, me], async () => {
      re.value && me.value ? await qt() : !re.value && Ne && (Ne = null);
    });
    async function rt(k) {
      if (await ye.confirm({
        message: `Delete “${k.name || "this skill"}”? This removes it and its version history. This can't be undone.`,
        header: "Delete skill",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          const { data: l } = await fe.delete(`/api/v1/skills/${k.skill_id}`);
          if (!l?.success) throw new Error(l?.error || "delete failed");
          Xt(k.skill_id, l), ye.toast({ severity: "success", summary: "Deletion accepted", detail: k.name || "skill" }), await p();
        } catch (l) {
          r.value = ae(l, "delete failed"), ye.toast({ severity: "error", summary: "Delete failed", detail: r.value });
        }
    }
    function Yt(k) {
      return k === "script" ? "tabler:file-code" : k === "asset" ? "tabler:file-download" : "tabler:file-text";
    }
    vn(p);
    const { acceptDeletion: Xt } = ro(i, (k) => k.skill_id, void 0, p);
    return (k, m) => (a(), u("div", mr, [
      f("header", vr, [
        f("div", gr, [
          w(I(M), {
            icon: "tabler:bulb",
            "aria-hidden": "true"
          })
        ]),
        m[8] || (m[8] = f("div", { class: "kx-head-text" }, [
          f("h1", { class: "kx-title" }, "Skills"),
          f("p", { class: "kx-head-sub" }, "Reusable procedures your agents discover, follow, and refine.")
        ], -1)),
        f("div", yr, [
          f("div", kr, [
            w(I(M), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            pe(f("input", {
              "onUpdate:modelValue": m[0] || (m[0] = (l) => s.value = l),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search skills…",
              "aria-label": "Search skills"
            }, null, 512), [
              [De, s.value]
            ])
          ]),
          w(I(N), {
            type: "button",
            "data-testid": "skills-create",
            label: "New skill",
            onClick: B
          }, {
            icon: P(({ class: l }) => [
              w(I(M), {
                icon: "tabler:plus",
                class: K(l),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      r.value ? (a(), u("div", wr, O(r.value), 1)) : x("", !0),
      f("div", Cr, [
        o.value && !i.value.length ? (a(), u("div", Sr, [
          w(I(M), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          m[9] || (m[9] = W(" Loading… ", -1))
        ])) : i.value.length ? h.value.length ? (a(), u("div", _r, [
          (a(!0), u(Q, null, we(h.value, (l) => (a(), u("div", {
            key: l.skill_id,
            class: "kx-card"
          }, [
            w(to, {
              state: l,
              onRetry: (D) => rt(l)
            }, null, 8, ["state", "onRetry"]),
            f("div", Ar, [
              f("span", Er, [
                w(I(M), {
                  icon: l.icon || "tabler:bulb",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              f("div", Pr, [
                f("button", {
                  type: "button",
                  class: "kx-card-name kx-card-open",
                  title: l.name || "(untitled)",
                  "aria-label": `Open ${l.name || "skill"}`,
                  disabled: !!l.deleting_at,
                  onClick: (D) => G(l)
                }, O(l.name || "(untitled)"), 9, Vr),
                f("div", Tr, [
                  l.version ? (a(), u("span", Dr, "v" + O(l.version), 1)) : x("", !0),
                  l.file_count ? (a(), u("span", {
                    key: 1,
                    class: "kx-chip kx-tag-sm kx-files-badge",
                    title: `${l.file_count} bundled file${l.file_count === 1 ? "" : "s"}`
                  }, [
                    w(I(M), {
                      icon: "tabler:paperclip",
                      "aria-hidden": "true"
                    }),
                    W(" " + O(l.file_count), 1)
                  ], 8, Mr)) : x("", !0),
                  l.agent_id ? (a(), u("span", Br, [
                    w(I(M), {
                      icon: "tabler:robot",
                      "aria-hidden": "true"
                    }),
                    m[13] || (m[13] = W(" agent", -1))
                  ])) : x("", !0),
                  l.status && l.status !== "active" ? (a(), u("span", jr, O(I(qo)(l.status)), 1)) : x("", !0)
                ])
              ]),
              f("div", Hr, [
                w(I(N), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit / refine",
                  "aria-label": `Edit ${l.name}`,
                  onClick: (D) => !l.deleting_at && G(l),
                  disabled: !!l.deleting_at
                }, {
                  icon: P(({ class: D }) => [
                    w(I(M), {
                      icon: "tabler:pencil",
                      class: K(D),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                w(I(N), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${l.name}`,
                  onClick: (D) => Gt(l),
                  disabled: !!l.deleting_at
                }, {
                  icon: P(({ class: D }) => [
                    w(I(M), {
                      icon: "tabler:share",
                      class: K(D),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                w(I(N), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${l.name}`,
                  onClick: (D) => rt(l),
                  disabled: !!l.deleting_at
                }, {
                  icon: P(({ class: D }) => [
                    w(I(M), {
                      icon: "tabler:trash",
                      class: K(D),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])
              ])
            ]),
            f("div", Kr, O(l.description || "No description"), 1)
          ]))), 128))
        ])) : (a(), u("div", $r, [
          f("div", Lr, [
            w(I(M), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          m[12] || (m[12] = f("div", { class: "kx-empty-title" }, "No matches", -1)),
          f("div", zr, "Nothing matches “" + O(s.value) + "”. Try a different term or clear the search.", 1),
          f("div", Fr, [
            w(I(N), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: m[1] || (m[1] = (l) => s.value = "")
            }, {
              icon: P(({ class: l }) => [
                w(I(M), {
                  icon: "tabler:x",
                  class: K(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (a(), u("div", xr, [
          f("div", Ir, [
            w(I(M), {
              icon: "tabler:bulb",
              "aria-hidden": "true"
            })
          ]),
          m[10] || (m[10] = f("div", { class: "kx-empty-title" }, "No skills yet", -1)),
          m[11] || (m[11] = f("div", { class: "kx-empty-sub" }, "Skills are reusable procedures your agents discover, follow, and refine over time. Write one, or let an agent author it from a task it just did.", -1)),
          f("div", Or, [
            w(I(N), {
              type: "button",
              "data-testid": "skills-create",
              label: "New skill",
              onClick: B
            }, {
              icon: P(({ class: l }) => [
                w(I(M), {
                  icon: "tabler:plus",
                  class: K(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      w(I(Vt), {
        visible: d.value,
        "onUpdate:visible": m[7] || (m[7] = (l) => d.value = l),
        modal: "",
        class: "kx-dialog kx-modal-xl",
        pt: t,
        "aria-label": "Edit skill"
      }, {
        header: P(() => [
          f("span", Rr, [
            w(I(M), {
              icon: S.value.icon || "tabler:bulb",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          f("span", Nr, [
            f("span", Ur, O(y.value ? "Refine skill" : "New skill"), 1),
            f("span", Wr, O(S.value.description.trim() || "A reusable procedure your agents discover and follow."), 1)
          ]),
          y.value?.version ? (a(), u("span", Gr, "v" + O(y.value.version), 1)) : x("", !0)
        ]),
        footer: P(() => [
          w(I(N), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: g.value,
            onClick: Te
          }, null, 8, ["disabled"]),
          w(I(N), {
            type: "button",
            label: y.value ? "Save new version" : "Create skill",
            loading: g.value,
            disabled: g.value || R.value,
            onClick: Ce
          }, {
            icon: P(({ class: l }) => [
              w(I(M), {
                icon: y.value ? "tabler:device-floppy" : "tabler:check",
                class: K(l),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        default: P(() => [
          f("div", Zr, [
            f("div", qr, [
              f("div", Yr, [
                m[14] || (m[14] = f("span", { class: "kx-field-lbl" }, "Name", -1)),
                f("div", Xr, [
                  w(Jo, {
                    class: "kx-name-icon",
                    modelValue: S.value.icon,
                    "onUpdate:modelValue": m[2] || (m[2] = (l) => S.value.icon = l),
                    fallback: "tabler:bulb"
                  }, null, 8, ["modelValue"]),
                  pe(f("input", {
                    "onUpdate:modelValue": m[3] || (m[3] = (l) => S.value.name = l),
                    class: "kx-input",
                    type: "text",
                    disabled: !!y.value,
                    placeholder: "e.g. Triage a bug report"
                  }, null, 8, Jr), [
                    [De, S.value.name]
                  ])
                ])
              ]),
              f("label", Qr, [
                m[15] || (m[15] = f("span", { class: "kx-field-lbl" }, [
                  W("Description "),
                  f("span", { class: "kx-field-hint-inline" }, "— what it does + when to use it (drives discovery)")
                ], -1)),
                pe(f("textarea", {
                  "onUpdate:modelValue": m[4] || (m[4] = (l) => S.value.description = l),
                  class: "kx-input kx-textarea kx-textarea-sm",
                  rows: "3",
                  placeholder: "Summarize a long chat into action items."
                }, null, 512), [
                  [De, S.value.description]
                ])
              ]),
              f("div", ea, [
                m[16] || (m[16] = f("span", { class: "kx-field-lbl" }, "Status", -1)),
                w(br, {
                  modelValue: S.value.status,
                  "onUpdate:modelValue": m[5] || (m[5] = (l) => S.value.status = l),
                  options: n,
                  "aria-label": "Status"
                }, null, 8, ["modelValue"])
              ]),
              C.value ? (a(), u("div", ta, [
                C.value.version ? (a(), u("span", na, "v" + O(C.value.version), 1)) : x("", !0),
                C.value.license ? (a(), u("span", oa, "· " + O(C.value.license), 1)) : x("", !0),
                C.value.file_count ? (a(), u("span", ia, "· " + O(C.value.file_count) + " file" + O(C.value.file_count === 1 ? "" : "s"), 1)) : x("", !0)
              ])) : x("", !0),
              _.value.length ? (a(), u("div", ra, [
                m[17] || (m[17] = f("span", { class: "kx-field-lbl" }, [
                  W("Bundled files "),
                  f("span", { class: "kx-field-hint-inline" }, "— loaded on demand")
                ], -1)),
                f("div", aa, [
                  (a(!0), u(Q, null, we(_.value, (l) => (a(), u("div", {
                    key: l.path,
                    class: "kx-file"
                  }, [
                    w(I(M), {
                      icon: Yt(l.kind),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    w(I(N), {
                      type: "button",
                      text: "",
                      class: "kx-file-path",
                      label: l.path,
                      disabled: $.value,
                      onClick: (D) => F(l)
                    }, null, 8, ["label", "disabled", "onClick"]),
                    w(I(N), {
                      type: "button",
                      text: "",
                      "aria-label": `Download ${l.path}`,
                      disabled: $.value,
                      onClick: (D) => F(l, !0)
                    }, {
                      icon: P(({ class: D }) => [
                        w(I(M), {
                          icon: "tabler:download",
                          class: K(D),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "disabled", "onClick"]),
                    l.kind ? (a(), u("span", la, O(I(Xo)(l.kind)), 1)) : x("", !0)
                  ]))), 128))
                ]),
                E.value ? (a(), u("div", {
                  key: 0,
                  role: "region",
                  "aria-label": E.value,
                  "aria-busy": $.value
                }, [
                  $.value ? (a(), u("p", da, "Reading " + O(E.value) + "…", 1)) : x("", !0),
                  H.value ? (a(), u("p", ua, O(H.value), 1)) : x("", !0),
                  j.value ? (a(), u("pre", ca, O(j.value), 1)) : x("", !0)
                ], 8, sa)) : x("", !0)
              ])) : x("", !0),
              y.value && T.value.length ? (a(), u("div", pa, [
                f("span", fa, [
                  m[18] || (m[18] = W("Version history ", -1)),
                  f("span", ha, "— " + O(T.value.length) + " version" + O(T.value.length === 1 ? "" : "s"), 1)
                ]),
                f("div", ba, [
                  (a(!0), u(Q, null, we(T.value, (l) => (a(), u("button", {
                    key: l.version,
                    type: "button",
                    class: K(["kx-ver-row", z.value === l.version && "kx-ver-row-on"]),
                    onClick: (D) => he(l.version)
                  }, [
                    f("span", va, "v" + O(l.version), 1),
                    f("span", ga, O(be(l.created_at)), 1),
                    l.file_count ? (a(), u("span", ya, [
                      w(I(M), {
                        icon: "tabler:paperclip",
                        "aria-hidden": "true"
                      }),
                      W(" " + O(l.file_count), 1)
                    ])) : x("", !0)
                  ], 10, ma))), 128))
                ])
              ])) : x("", !0)
            ]),
            f("div", ka, [
              f("div", wa, [
                f("span", Ca, [
                  m[19] || (m[19] = W("Skill instructions ", -1)),
                  f("span", Sa, "— the procedure the agent follows" + O(y.value && !R.value ? "; saving creates a new version" : ""), 1)
                ]),
                R.value ? (a(), u("div", xa, [
                  f("span", Ia, [
                    w(I(M), {
                      icon: "tabler:eye",
                      "aria-hidden": "true"
                    }),
                    W(" Previewing v" + O(z.value) + " (read-only)", 1)
                  ]),
                  w(I(N), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    label: "Back to current",
                    onClick: J
                  }, {
                    icon: P(({ class: l }) => [
                      w(I(M), {
                        icon: "tabler:arrow-back-up",
                        class: K(l),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }),
                  w(I(N), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    label: "Restore this version",
                    onClick: ie
                  }, {
                    icon: P(({ class: l }) => [
                      w(I(M), {
                        icon: "tabler:history",
                        class: K(l),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  })
                ])) : x("", !0)
              ]),
              R.value ? (a(), u("textarea", {
                key: 0,
                value: A.value,
                class: "kx-input kx-body-editor kx-body-preview",
                readonly: "",
                "aria-label": "Previewed skill version (read-only)"
              }, null, 8, Oa)) : pe((a(), u("textarea", {
                key: 1,
                "onUpdate:modelValue": m[6] || (m[6] = (l) => S.value.body = l),
                class: "kx-input kx-body-editor",
                "aria-label": "Skill instructions",
                placeholder: `1. …
2. …`
              }, null, 512)), [
                [De, S.value.body]
              ])
            ])
          ]),
          c.value ? (a(), u("div", $a, O(c.value), 1)) : x("", !0)
        ]),
        _: 1
      }, 8, ["visible"]),
      re.value ? (a(), u("div", {
        key: 1,
        ref_key: "shareHost",
        ref: me
      }, null, 512)) : x("", !0)
    ]));
  }
}), Ea = {
  rootComponent: La,
  plugins: [gn]
};
export {
  Ea as mountConfig
};
//# sourceMappingURL=lazy-mount-Cnex68G1.js.map
