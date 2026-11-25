import { openBlock as i, createElementBlock as p, mergeProps as v, createElementVNode as b, renderSlot as C, createTextVNode as L, toDisplayString as S, resolveComponent as q, resolveDirective as ct, withDirectives as bt, createBlock as k, resolveDynamicComponent as pt, withCtx as y, createCommentVNode as w, normalizeClass as F, defineComponent as I, computed as _, unref as c, createVNode as g, ref as Z, onMounted as gt, watch as Q, onBeforeUnmount as ht, useModel as vt, mergeModels as mt, reactive as ft, withModifiers as yt, Fragment as R, renderList as U } from "vue";
import { Icon as j } from "@iconify/vue";
import { E as kt } from "./provider-tags-C0mtMONl.js";
import { a as wt, B as W, A as tt, g as G, s as Y, f as T, R as $t } from "./wc-runtime-DYOSFvWw.js";
import { loadByTagName as xt } from "@wippy-fe/proxy";
var nt = {
  name: "SpinnerIcon",
  extends: wt
};
function _t(t) {
  return Ct(t) || Vt(t) || Pt(t) || St();
}
function St() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pt(t, n) {
  if (t) {
    if (typeof t == "string") return K(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? K(t, n) : void 0;
  }
}
function Vt(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ct(t) {
  if (Array.isArray(t)) return K(t);
}
function K(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function It(t, n, e, o, s, d) {
  return i(), p("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), _t(n[0] || (n[0] = [b("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
nt.render = It;
var At = `
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
`, Ft = {
  root: function(n) {
    var e = n.props, o = n.instance;
    return ["p-badge p-component", {
      "p-badge-circle": G(e.value) && String(e.value).length === 1,
      "p-badge-dot": tt(e.value) && !o.$slots.default,
      "p-badge-sm": e.size === "small",
      "p-badge-lg": e.size === "large",
      "p-badge-xl": e.size === "xlarge",
      "p-badge-info": e.severity === "info",
      "p-badge-success": e.severity === "success",
      "p-badge-warn": e.severity === "warn",
      "p-badge-danger": e.severity === "danger",
      "p-badge-secondary": e.severity === "secondary",
      "p-badge-contrast": e.severity === "contrast"
    }];
  }
}, Bt = W.extend({
  name: "badge",
  style: At,
  classes: Ft
}), Tt = {
  name: "BaseBadge",
  extends: Y,
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
  style: Bt,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function O(t) {
  "@babel/helpers - typeof";
  return O = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, O(t);
}
function X(t, n, e) {
  return (n = Ot(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Ot(t) {
  var n = Et(t, "string");
  return O(n) == "symbol" ? n : n + "";
}
function Et(t, n) {
  if (O(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (O(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var et = {
  name: "Badge",
  extends: Tt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return T(X(X({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, zt = ["data-p"];
function Nt(t, n, e, o, s, d) {
  return i(), p("span", v({
    class: t.cx("root"),
    "data-p": d.dataP
  }, t.ptmi("root")), [C(t.$slots, "default", {}, function() {
    return [L(S(t.value), 1)];
  })], 16, zt);
}
et.render = Nt;
var Lt = `
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
function E(t) {
  "@babel/helpers - typeof";
  return E = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, E(t);
}
function x(t, n, e) {
  return (n = jt(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function jt(t) {
  var n = Rt(t, "string");
  return E(n) == "symbol" ? n : n + "";
}
function Rt(t, n) {
  if (E(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (E(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Ut = {
  root: function(n) {
    var e = n.instance, o = n.props;
    return ["p-button p-component", x(x(x(x(x(x(x(x(x({
      "p-button-icon-only": e.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", e.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(n) {
    var e = n.props;
    return ["p-button-icon", x({}, "p-button-icon-".concat(e.iconPos), e.label)];
  },
  label: "p-button-label"
}, Dt = W.extend({
  name: "button",
  style: Lt,
  classes: Ut
}), Gt = {
  name: "BaseButton",
  extends: Y,
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
  style: Dt,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function z(t) {
  "@babel/helpers - typeof";
  return z = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, z(t);
}
function h(t, n, e) {
  return (n = Kt(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Kt(t) {
  var n = Mt(t, "string");
  return z(n) == "symbol" ? n : n + "";
}
function Mt(t, n) {
  if (z(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (z(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var ot = {
  name: "Button",
  extends: Gt,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(n) {
      var e = n === "root" ? this.ptmi : this.ptm;
      return e(n, {
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
      return tt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return T(h(h(h(h(h(h(h(h(h(h({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return T(h(h({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return T(h(h({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: nt,
    Badge: et
  },
  directives: {
    ripple: $t
  }
}, Wt = ["data-p"], Yt = ["data-p"];
function Ht(t, n, e, o, s, d) {
  var m = q("SpinnerIcon"), $ = q("Badge"), f = ct("ripple");
  return t.asChild ? C(t.$slots, "default", {
    key: 1,
    class: F(t.cx("root")),
    a11yAttrs: d.a11yAttrs
  }) : bt((i(), k(pt(t.as), v({
    key: 0,
    class: t.cx("root"),
    "data-p": d.dataP
  }, d.attrs), {
    default: y(function() {
      return [C(t.$slots, "default", {}, function() {
        return [t.loading ? C(t.$slots, "loadingicon", v({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (i(), p("span", v({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (i(), k(m, v({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : C(t.$slots, "icon", v({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (i(), p("span", v({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": d.dataIconP
          }, t.ptm("icon")), null, 16, Wt)) : w("", !0)];
        }), t.label ? (i(), p("span", v({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": d.dataLabelP
        }), S(t.label), 17, Yt)) : w("", !0), t.badge ? (i(), k($, {
          key: 3,
          value: t.badge,
          class: F(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : w("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[f]]);
}
ot.render = Ht;
const D = /* @__PURE__ */ I({
  __name: "Button",
  props: {
    icon: {},
    variant: { default: "primary" },
    type: { default: "button" },
    loading: { type: Boolean },
    disabled: { type: Boolean },
    small: { type: Boolean }
  },
  emits: ["click"],
  setup(t, { emit: n }) {
    const e = t, o = n, s = _(
      () => e.variant === "danger" ? "danger" : e.variant === "primary" ? void 0 : "secondary"
    );
    return (d, m) => (i(), k(c(ot), {
      type: t.type,
      severity: s.value,
      outlined: t.variant === "ghost",
      loading: t.loading,
      disabled: t.disabled || t.loading,
      size: t.small ? "small" : void 0,
      onClick: m[0] || (m[0] = ($) => o("click"))
    }, {
      default: y(() => [
        t.icon && !t.loading ? (i(), k(c(j), {
          key: 0,
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : w("", !0),
        C(d.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
});
var Jt = {
  name: "BaseEditableHolder",
  extends: Y,
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
      handler: function(n) {
        this.d_value = n;
      }
    },
    defaultValue: function(n) {
      this.d_value = n;
    },
    $formName: {
      immediate: !0,
      handler: function(n) {
        var e, o;
        this.formField = ((e = this.$pcForm) === null || e === void 0 || (o = e.register) === null || o === void 0 ? void 0 : o.call(e, n, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(n) {
        var e, o;
        this.formField = ((e = this.$pcForm) === null || e === void 0 || (o = e.register) === null || o === void 0 ? void 0 : o.call(e, this.$formName, n)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(n) {
        this.d_value !== n && (this.d_value = n);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(n) {
        var e;
        (e = this.$pcForm) !== null && e !== void 0 && e.getFieldState(this.$formName) && n !== this.d_value && (this.d_value = n);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(n, e) {
      var o, s;
      this.controlled && (this.d_value = n, this.$emit("update:modelValue", n)), this.$emit("value-change", n), (o = (s = this.formField).onChange) === null || o === void 0 || o.call(s, {
        originalEvent: e,
        value: n
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var n = arguments.length, e = new Array(n), o = 0; o < n; o++)
        e[o] = arguments[o];
      return e.find(G);
    }
  },
  computed: {
    $filled: function() {
      return G(this.d_value);
    },
    $invalid: function() {
      var n, e;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (n = this.$pcFormField) === null || n === void 0 || (n = n.$field) === null || n === void 0 ? void 0 : n.invalid, (e = this.$pcForm) === null || e === void 0 || (e = e.getFieldState(this.$formName)) === null || e === void 0 ? void 0 : e.invalid);
    },
    $formName: function() {
      var n;
      return this.$formNovalidate ? void 0 : this.name || ((n = this.$formControl) === null || n === void 0 ? void 0 : n.name);
    },
    $formControl: function() {
      var n;
      return this.formControl || ((n = this.$pcFormField) === null || n === void 0 ? void 0 : n.formControl);
    },
    $formNovalidate: function() {
      var n;
      return (n = this.$formControl) === null || n === void 0 ? void 0 : n.novalidate;
    },
    $formDefaultValue: function() {
      var n, e;
      return this.findNonEmpty(this.d_value, (n = this.$pcFormField) === null || n === void 0 ? void 0 : n.initialValue, (e = this.$pcForm) === null || e === void 0 || (e = e.initialValues) === null || e === void 0 ? void 0 : e[this.$formName]);
    },
    $formValue: function() {
      var n, e;
      return this.findNonEmpty((n = this.$pcFormField) === null || n === void 0 || (n = n.$field) === null || n === void 0 ? void 0 : n.value, (e = this.$pcForm) === null || e === void 0 || (e = e.getFieldState(this.$formName)) === null || e === void 0 ? void 0 : e.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
};
const qt = { class: "km-field" }, Xt = { class: "km-field-label" }, Zt = {
  key: 0,
  class: "km-field-help"
}, V = /* @__PURE__ */ I({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(t) {
    return (n, e) => (i(), p("label", qt, [
      b("span", Xt, S(t.label), 1),
      C(n.$slots, "default"),
      t.help ? (i(), p("small", Zt, S(t.help), 1)) : w("", !0)
    ]));
  }
}), Qt = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], A = /* @__PURE__ */ I({
  __name: "TextInput",
  props: {
    modelValue: {},
    type: { default: "text" },
    placeholder: {},
    readonly: { type: Boolean },
    disabled: { type: Boolean },
    autocomplete: {},
    min: {},
    max: {},
    step: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(t, { emit: n }) {
    const e = n;
    function o(s) {
      const d = s.target;
      e("update:modelValue", d.value);
    }
    return (s, d) => (i(), p("input", {
      class: F(["km-input", t.mono && "mono"]),
      type: t.type,
      value: t.modelValue,
      placeholder: t.placeholder,
      readonly: t.readonly,
      disabled: t.disabled,
      autocomplete: t.autocomplete,
      min: t.min,
      max: t.max,
      step: t.step,
      onInput: o
    }, null, 42, Qt));
  }
});
var tn = `
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`, nn = {
  root: {
    position: "relative"
  }
}, en = {
  root: function(n) {
    var e = n.instance, o = n.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": e.checked,
      "p-disabled": o.disabled,
      "p-invalid": e.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, on = W.extend({
  name: "toggleswitch",
  style: tn,
  classes: en,
  inlineStyles: nn
}), rn = {
  name: "BaseToggleSwitch",
  extends: Jt,
  props: {
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
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
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    }
  },
  style: on,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, rt = {
  name: "ToggleSwitch",
  extends: rn,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  methods: {
    getPTOptions: function(n) {
      var e = n === "root" ? this.ptmi : this.ptm;
      return e(n, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(n) {
      if (!this.disabled && !this.readonly) {
        var e = this.checked ? this.falseValue : this.trueValue;
        this.writeValue(e, n), this.$emit("change", n);
      }
    },
    onFocus: function(n) {
      this.$emit("focus", n);
    },
    onBlur: function(n) {
      var e, o;
      this.$emit("blur", n), (e = (o = this.formField).onBlur) === null || e === void 0 || e.call(o, n);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return T({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, dn = ["data-p-checked", "data-p-disabled", "data-p"], an = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], ln = ["data-p"], sn = ["data-p"];
function un(t, n, e, o, s, d) {
  return i(), p("div", v({
    class: t.cx("root"),
    style: t.sx("root")
  }, d.getPTOptions("root"), {
    "data-p-checked": d.checked,
    "data-p-disabled": t.disabled,
    "data-p": d.dataP
  }), [b("input", v({
    id: t.inputId,
    type: "checkbox",
    role: "switch",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    checked: d.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-checked": d.checked,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: n[0] || (n[0] = function() {
      return d.onFocus && d.onFocus.apply(d, arguments);
    }),
    onBlur: n[1] || (n[1] = function() {
      return d.onBlur && d.onBlur.apply(d, arguments);
    }),
    onChange: n[2] || (n[2] = function() {
      return d.onChange && d.onChange.apply(d, arguments);
    })
  }, d.getPTOptions("input")), null, 16, an), b("div", v({
    class: t.cx("slider")
  }, d.getPTOptions("slider"), {
    "data-p": d.dataP
  }), [b("div", v({
    class: t.cx("handle")
  }, d.getPTOptions("handle"), {
    "data-p": d.dataP
  }), [C(t.$slots, "handle", {
    checked: d.checked
  })], 16, sn)], 16, ln)], 16, dn);
}
rt.render = un;
const cn = {
  key: 0,
  class: "km-switch-label"
}, bn = /* @__PURE__ */ I({
  __name: "Toggle",
  props: {
    modelValue: { type: Boolean },
    label: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(t, { emit: n }) {
    const e = t, o = n, s = _({
      get: () => e.modelValue,
      set: (d) => o("update:modelValue", d)
    });
    return (d, m) => (i(), p("label", {
      class: F(["km-switch", { disabled: t.disabled }])
    }, [
      g(c(rt), {
        modelValue: s.value,
        "onUpdate:modelValue": m[0] || (m[0] = ($) => s.value = $),
        disabled: t.disabled
      }, null, 8, ["modelValue", "disabled"]),
      t.label ? (i(), p("span", cn, S(t.label), 1)) : w("", !0)
    ], 2));
  }
}), pn = /* @__PURE__ */ I({
  __name: "Avatar",
  props: {
    icon: {},
    size: { default: "md" }
  },
  setup(t) {
    return (n, e) => (i(), p("span", {
      class: F(["km-avatar", t.size !== "md" && t.size])
    }, [
      g(c(j), {
        icon: t.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 2));
  }
}), M = {
  openai_compat: {
    key: "openai_compat",
    title: "OpenAI Compatible",
    subtitle: "Chat Completions compatible endpoints, including local and hosted providers.",
    defaultProviderId: "wippy.llm.openai_compat:provider",
    icon: "tabler:plug",
    fields: [
      { key: "base_url", label: "Base URL", placeholder: "http://localhost:11434/v1", section: "endpoint", help: "Your endpoint v1 root." },
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0, help: "Optional for local endpoints." },
      { key: "test_model", label: "Test model", placeholder: "gemma-4-12b", section: "advanced", help: "Probe model for Test connection; auto-picked from discovery when blank." },
      { key: "api_key_env", label: "API key env", placeholder: "OPENROUTER_API_KEY", section: "advanced" },
      { key: "organization", label: "Organization", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  openai: {
    key: "openai",
    title: "OpenAI",
    subtitle: "Native OpenAI Responses and embeddings provider.",
    defaultProviderId: "wippy.llm.openai:provider",
    icon: "tabler:brand-openai",
    fields: [
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0 },
      { key: "base_url", label: "Base URL", placeholder: "https://api.openai.com/v1", section: "advanced" },
      { key: "test_model", label: "Test model", placeholder: "gpt-4o-mini", section: "advanced", help: "Probe model for Test connection; auto-picked when blank." },
      { key: "api_key_env", label: "API key env", placeholder: "OPENAI_API_KEY", section: "advanced" },
      { key: "organization", label: "Organization", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  anthropic: {
    key: "anthropic",
    title: "Anthropic",
    subtitle: "Claude Messages API provider with model discovery.",
    defaultProviderId: "wippy.llm.claude:provider",
    icon: "tabler:hexagon-letter-c",
    fields: [
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0 },
      { key: "base_url", label: "Base URL", placeholder: "https://api.anthropic.com", section: "advanced" },
      { key: "api_key_env", label: "API key env", placeholder: "ANTHROPIC_API_KEY", section: "advanced" },
      { key: "api_version", label: "API version", placeholder: "2023-06-01", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  google_genai: {
    key: "google_genai",
    title: "Google Gemini",
    subtitle: "Gemini Developer API using API-key auth and models.list discovery.",
    defaultProviderId: "wippy.llm.google.generative_ai:provider",
    icon: "tabler:brand-google",
    fields: [
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0 },
      { key: "base_url", label: "Base URL", placeholder: "https://generativelanguage.googleapis.com/v1beta/models", section: "advanced" },
      { key: "api_key_env", label: "API key env", placeholder: "GEMINI_API_KEY", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  google_vertex: {
    key: "google_vertex",
    title: "Google Vertex AI",
    subtitle: "Vertex context for explicit model overlays using project, location, and Google credentials.",
    defaultProviderId: "wippy.llm.google.vertex:provider",
    icon: "tabler:cloud",
    fields: [
      { key: "project", label: "Project", placeholder: "my-gcp-project", section: "endpoint", help: "Required unless the service-account JSON has project_id." },
      { key: "location", label: "Location", placeholder: "us-central1", section: "endpoint", help: "Required for Vertex model calls." },
      { key: "google_credentials", label: "Service account JSON/base64", type: "password", section: "auth", secret: !0, help: "Refreshable by the models token supervisor." },
      { key: "project_env", label: "Project env", placeholder: "GOOGLE_CLOUD_PROJECT", section: "advanced" },
      { key: "location_env", label: "Location env", placeholder: "VERTEX_AI_LOCATION", section: "advanced" },
      { key: "google_credentials_env", label: "Credentials env", placeholder: "GOOGLE_CREDENTIALS", section: "advanced", help: "Optional pointer to service-account JSON/base64." },
      { key: "access_token", label: "Access token", type: "password", section: "advanced", secret: !0, help: "For externally rotated tokens only." },
      { key: "access_token_env", label: "Access token env", placeholder: "GOOGLE_ACCESS_TOKEN", section: "advanced", help: "The supervisor does not refresh direct access tokens." },
      { key: "base_url", label: "Base URL override", placeholder: "https://us-central1-aiplatform.googleapis.com/v1", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  bedrock: {
    key: "bedrock",
    title: "AWS Bedrock",
    subtitle: "Bedrock Converse and InvokeModel through AWS SigV4.",
    defaultProviderId: "wippy.llm.bedrock:provider",
    icon: "tabler:brand-aws",
    fields: [
      { key: "region", label: "Region", placeholder: "us-east-1", section: "endpoint" },
      { key: "access_key", label: "Access key", type: "password", section: "auth", secret: !0 },
      { key: "secret_key", label: "Secret key", type: "password", section: "auth", secret: !0 },
      { key: "region_env", label: "Region env", placeholder: "AWS_REGION", section: "advanced" },
      { key: "access_key_env", label: "Access key env", placeholder: "AWS_ACCESS_KEY_ID", section: "advanced" },
      { key: "secret_key_env", label: "Secret key env", placeholder: "AWS_SECRET_ACCESS_KEY", section: "advanced" },
      { key: "session_token", label: "Session token", type: "password", section: "advanced", secret: !0 },
      { key: "session_token_env", label: "Session token env", placeholder: "AWS_SESSION_TOKEN", section: "advanced" },
      { key: "bedrock_provider", label: "Discovery provider filter", placeholder: "Anthropic", section: "advanced" },
      { key: "base_url", label: "Base URL override", placeholder: "https://bedrock.us-east-1.amazonaws.com", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  }
}, dt = kt;
function gn(t) {
  return t && dt[t] || "openai_compat";
}
function Nn(t) {
  return !!(t && dt[t]);
}
function Ln(t) {
  return M[gn(t)];
}
const hn = /* @__PURE__ */ I({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: n }) {
    const e = t, o = n, s = Z(null);
    let d = null;
    function m(f) {
      o("update:modelValue", f.detail || "");
    }
    async function $() {
      if (s.value) {
        d && d.removeEventListener("select", m), s.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await xt("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        s.value && (d = document.createElement("wc-icon-picker"), d.setAttribute("value", e.modelValue || ""), e.fallback && d.setAttribute("fallback", e.fallback), d.addEventListener("select", m), s.value.appendChild(d));
      }
    }
    return gt($), Q(() => e.modelValue, (f) => {
      d && d.getAttribute("value") !== f && d.setAttribute("value", f || "");
    }), ht(() => {
      d && d.removeEventListener("select", m);
    }), (f, N) => (i(), p("div", {
      ref_key: "host",
      ref: s,
      class: "wc-iconfield"
    }, null, 512));
  }
}), vn = /* @__PURE__ */ I({
  __name: "ProfileIconField",
  props: /* @__PURE__ */ mt({
    fallback: {},
    disabled: { type: Boolean }
  }, {
    modelValue: { required: !0 },
    modelModifiers: {}
  }),
  emits: ["update:modelValue"],
  setup(t) {
    const n = vt(t, "modelValue");
    return (e, o) => (i(), k(c(V), { label: "Provider icon" }, {
      default: y(() => [
        g(hn, {
          modelValue: n.value,
          "onUpdate:modelValue": o[0] || (o[0] = (s) => n.value = s),
          fallback: t.fallback || "tabler:cpu",
          inert: t.disabled
        }, null, 8, ["modelValue", "fallback", "inert"])
      ]),
      _: 1
    }));
  }
}), mn = { class: "km-editor-head" }, fn = { class: "km-editor-head-text" }, yn = { class: "km-editor-head-title" }, kn = { class: "km-editor-head-sub" }, wn = { class: "km-form-sec" }, $n = { class: "km-form-grid" }, xn = {
  key: 0,
  class: "km-form-sec"
}, _n = { class: "km-form-grid" }, Sn = {
  key: 1,
  class: "km-form-sec"
}, Pn = { class: "km-form-grid" }, Vn = ["aria-expanded"], Cn = {
  key: 2,
  class: "km-form-sec"
}, In = { class: "km-form-grid" }, An = {
  key: 0,
  class: "km-spin",
  "aria-hidden": "true"
}, Fn = { class: "km-form-foot" }, jn = /* @__PURE__ */ I({
  __name: "ProviderProfileEditor",
  props: {
    mode: {},
    adapter: {},
    preset: {},
    profile: {},
    saving: { type: Boolean },
    testState: {},
    specKey: {}
  },
  emits: ["save", "cancel", "test"],
  setup(t, { emit: n }) {
    const e = t, o = n, s = _(() => M[e.specKey] ?? M.openai_compat), d = _(() => e.mode === "edit"), m = _(() => d.value), $ = _(() => e.testState?.status === "testing"), f = _(() => s.value.fields), N = (u) => u.section ?? "endpoint", H = _(() => f.value.filter((u) => N(u) === "endpoint")), J = _(() => f.value.filter((u) => N(u) === "auth")), at = _(() => f.value.filter((u) => N(u) === "advanced")), B = Z(!1), l = ft({
      id: "",
      name: "",
      provider_id: "",
      icon: "",
      retry_attempts: "",
      retry_backoff_ms: "",
      enabled: !0
    });
    function lt(u, a) {
      if (u.secret) return "";
      const r = a[u.key];
      return u.type === "number" ? r ?? "" : r || "";
    }
    function it() {
      const u = e.profile?.config || e.preset?.config || {};
      l.id = e.profile?.id || "", l.name = e.profile?.name || e.preset?.title || s.value.title, l.provider_id = e.profile?.provider_id || e.preset?.provider_id || e.adapter?.id || s.value.defaultProviderId, l.icon = d.value ? e.profile?.icon || "" : e.preset?.icon || "", l.retry_attempts = u.retry?.attempts ?? "", l.retry_backoff_ms = u.retry?.backoff_ms ?? "", l.enabled = e.profile?.enabled !== !1;
      for (const a of f.value) l[a.key] = lt(a, u);
    }
    Q(() => [e.profile, e.preset, e.adapter, e.mode, e.specKey], it, { immediate: !0 });
    function st(u, a) {
      const r = l[a.key];
      if (a.secret) {
        typeof r == "string" && r.trim() && (u[a.key] = r);
        return;
      }
      if (a.type === "number") {
        r !== "" ? u[a.key] = Number(r) : e.profile?.config?.[a.key] != null && (u[a.key] = "");
        return;
      }
      if (typeof r == "string") {
        const P = r.trim();
        P && (u[a.key] = P);
        return;
      }
      r != null && r !== "" && (u[a.key] = r);
    }
    function ut() {
      const u = {
        id: l.id || void 0,
        name: l.name,
        provider_id: l.provider_id,
        icon: l.icon,
        enabled: l.enabled
      };
      for (const r of f.value) st(u, r);
      const a = {};
      l.retry_attempts !== "" && (a.attempts = Number(l.retry_attempts)), l.retry_backoff_ms !== "" && (a.backoff_ms = Number(l.retry_backoff_ms)), u.retry = a, o("save", u);
    }
    return (u, a) => (i(), p("form", {
      class: "km-form",
      onSubmit: yt(ut, ["prevent"])
    }, [
      b("div", mn, [
        g(c(pn), {
          icon: l.icon || e.adapter?.icon || s.value.icon
        }, null, 8, ["icon"]),
        b("div", fn, [
          b("div", yn, S(e.preset?.title || s.value.title), 1),
          b("div", kn, S(s.value.subtitle), 1)
        ])
      ]),
      b("section", wn, [
        a[9] || (a[9] = b("div", { class: "km-form-sec-title" }, "Identity", -1)),
        b("div", $n, [
          g(c(V), { label: "Name" }, {
            default: y(() => [
              g(c(A), {
                modelValue: l.name,
                "onUpdate:modelValue": a[0] || (a[0] = (r) => l.name = r),
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          g(vn, {
            modelValue: l.icon,
            "onUpdate:modelValue": a[1] || (a[1] = (r) => l.icon = r),
            fallback: e.adapter?.icon,
            disabled: e.saving
          }, null, 8, ["modelValue", "fallback", "disabled"])
        ])
      ]),
      H.value.length ? (i(), p("section", xn, [
        a[10] || (a[10] = b("div", { class: "km-form-sec-title" }, "Endpoint", -1)),
        b("div", _n, [
          (i(!0), p(R, null, U(H.value, (r) => (i(), k(c(V), {
            key: r.key,
            label: r.label,
            help: r.help
          }, {
            default: y(() => [
              g(c(A), {
                modelValue: l[r.key],
                "onUpdate:modelValue": (P) => l[r.key] = P,
                type: r.type === "number" ? "number" : "text",
                placeholder: r.placeholder,
                disabled: e.saving
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "placeholder", "disabled"])
            ]),
            _: 2
          }, 1032, ["label", "help"]))), 128))
        ])
      ])) : w("", !0),
      J.value.length ? (i(), p("section", Sn, [
        a[11] || (a[11] = b("div", { class: "km-form-sec-title" }, "Authentication", -1)),
        b("div", Pn, [
          (i(!0), p(R, null, U(J.value, (r) => (i(), k(c(V), {
            key: r.key,
            label: r.label,
            help: r.help
          }, {
            default: y(() => [
              g(c(A), {
                modelValue: l[r.key],
                "onUpdate:modelValue": (P) => l[r.key] = P,
                type: r.type === "password" ? "password" : "text",
                placeholder: r.placeholder,
                autocomplete: r.secret ? "new-password" : void 0,
                disabled: e.saving
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "placeholder", "autocomplete", "disabled"])
            ]),
            _: 2
          }, 1032, ["label", "help"]))), 128))
        ])
      ])) : w("", !0),
      b("button", {
        type: "button",
        class: "km-adv-toggle",
        "aria-expanded": B.value,
        onClick: a[2] || (a[2] = (r) => B.value = !B.value)
      }, [
        g(c(j), {
          icon: B.value ? "tabler:chevron-down" : "tabler:chevron-right",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        a[12] || (a[12] = b("span", null, "Advanced settings", -1))
      ], 8, Vn),
      B.value ? (i(), p("section", Cn, [
        b("div", In, [
          d.value ? w("", !0) : (i(), k(c(V), {
            key: 0,
            label: "ID",
            help: "Optional; generated when left blank."
          }, {
            default: y(() => [
              g(c(A), {
                modelValue: l.id,
                "onUpdate:modelValue": a[3] || (a[3] = (r) => l.id = r),
                disabled: e.saving,
                placeholder: "auto"
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })),
          (i(!0), p(R, null, U(at.value, (r) => (i(), k(c(V), {
            key: r.key,
            label: r.label,
            help: r.help
          }, {
            default: y(() => [
              g(c(A), {
                modelValue: l[r.key],
                "onUpdate:modelValue": (P) => l[r.key] = P,
                type: r.type === "number" ? "number" : r.type === "password" ? "password" : "text",
                step: r.type === "number" ? "any" : void 0,
                placeholder: r.placeholder,
                autocomplete: r.secret ? "new-password" : void 0,
                disabled: e.saving
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "step", "placeholder", "autocomplete", "disabled"])
            ]),
            _: 2
          }, 1032, ["label", "help"]))), 128)),
          g(c(V), { label: "Retry attempts" }, {
            default: y(() => [
              g(c(A), {
                modelValue: l.retry_attempts,
                "onUpdate:modelValue": a[4] || (a[4] = (r) => l.retry_attempts = r),
                type: "number",
                step: "any",
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          g(c(V), { label: "Retry backoff (ms)" }, {
            default: y(() => [
              g(c(A), {
                modelValue: l.retry_backoff_ms,
                "onUpdate:modelValue": a[5] || (a[5] = (r) => l.retry_backoff_ms = r),
                type: "number",
                step: "any",
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ])) : w("", !0),
      d.value ? (i(), k(c(bn), {
        key: 3,
        modelValue: l.enabled,
        "onUpdate:modelValue": a[6] || (a[6] = (r) => l.enabled = r),
        label: "Enabled",
        disabled: e.saving
      }, null, 8, ["modelValue", "disabled"])) : w("", !0),
      e.testState && e.testState.status !== "idle" ? (i(), p("div", {
        key: 4,
        class: F(["km-test-result", e.testState.status])
      }, [
        $.value ? (i(), p("span", An)) : (i(), k(c(j), {
          key: 1,
          icon: e.testState.status === "ok" ? "tabler:circle-check" : "tabler:circle-x",
          "aria-hidden": "true"
        }, null, 8, ["icon"])),
        b("span", null, S($.value ? "Testing connection…" : e.testState.message), 1)
      ], 2)) : w("", !0),
      b("div", Fn, [
        m.value ? (i(), k(c(D), {
          key: 0,
          variant: "soft",
          icon: "tabler:plug-connected",
          loading: $.value,
          disabled: e.saving,
          onClick: a[7] || (a[7] = (r) => o("test"))
        }, {
          default: y(() => [...a[13] || (a[13] = [
            L(" Test connection ", -1)
          ])]),
          _: 1
        }, 8, ["loading", "disabled"])) : w("", !0),
        a[15] || (a[15] = b("span", { class: "km-form-foot-sp" }, null, -1)),
        g(c(D), {
          variant: "ghost",
          disabled: e.saving,
          onClick: a[8] || (a[8] = (r) => o("cancel"))
        }, {
          default: y(() => [...a[14] || (a[14] = [
            L("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        g(c(D), {
          type: "submit",
          icon: "tabler:device-floppy",
          loading: e.saving
        }, {
          default: y(() => [
            L(S(e.saving ? "Saving" : "Save provider"), 1)
          ]),
          _: 1
        }, 8, ["loading"])
      ])
    ], 32));
  }
});
export {
  pn as _,
  D as a,
  gn as b,
  jn as c,
  Ln as d,
  Jt as e,
  nt as f,
  V as g,
  A as h,
  Nn as i,
  bn as j,
  vn as k,
  ot as s
};
//# sourceMappingURL=ProviderProfileEditor.vue_vue_type_script_setup_true_lang-Bk2OLic6.js.map
