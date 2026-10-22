import { api as j } from "@wippy-fe/proxy";
import { openBlock as u, createElementBlock as p, mergeProps as b, createElementVNode as M, renderSlot as g, createTextVNode as H, toDisplayString as I, resolveComponent as T, resolveDirective as rt, withDirectives as it, createBlock as x, resolveDynamicComponent as at, withCtx as w, createCommentVNode as A, normalizeClass as h, defineComponent as dt, ref as st, computed as ut, createVNode as k, unref as v, Fragment as lt, renderList as ct } from "vue";
import { c as bt, B, H as J, f as pt, k as O, l as P, R as ft, s as ht } from "./index-B9KLaL2S.js";
import { s as gt } from "./index-I_-ROi8M.js";
import { s as yt } from "./index-DRigRSgk.js";
import { Icon as mt } from "@iconify/vue";
var Y = {
  name: "SpinnerIcon",
  extends: bt
};
function vt(t) {
  return St(t) || xt(t) || wt(t) || kt();
}
function kt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wt(t, n) {
  if (t) {
    if (typeof t == "string") return E(t, n);
    var o = {}.toString.call(t).slice(8, -1);
    return o === "Object" && t.constructor && (o = t.constructor.name), o === "Map" || o === "Set" ? Array.from(t) : o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? E(t, n) : void 0;
  }
}
function xt(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function St(t) {
  if (Array.isArray(t)) return E(t);
}
function E(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var o = 0, e = Array(n); o < n; o++) e[o] = t[o];
  return e;
}
function _t(t, n, o, e, i, r) {
  return u(), p("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), vt(n[0] || (n[0] = [M("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Y.render = _t;
var $t = `
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
`, Ct = {
  root: function(n) {
    var o = n.props, e = n.instance;
    return ["p-badge p-component", {
      "p-badge-circle": pt(o.value) && String(o.value).length === 1,
      "p-badge-dot": J(o.value) && !e.$slots.default,
      "p-badge-sm": o.size === "small",
      "p-badge-lg": o.size === "large",
      "p-badge-xl": o.size === "xlarge",
      "p-badge-info": o.severity === "info",
      "p-badge-success": o.severity === "success",
      "p-badge-warn": o.severity === "warn",
      "p-badge-danger": o.severity === "danger",
      "p-badge-secondary": o.severity === "secondary",
      "p-badge-contrast": o.severity === "contrast"
    }];
  }
}, zt = B.extend({
  name: "badge",
  style: $t,
  classes: Ct
}), At = {
  name: "BaseBadge",
  extends: O,
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
  style: zt,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function _(t) {
  "@babel/helpers - typeof";
  return _ = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, _(t);
}
function V(t, n, o) {
  return (n = Pt(n)) in t ? Object.defineProperty(t, n, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = o, t;
}
function Pt(t) {
  var n = It(t, "string");
  return _(n) == "symbol" ? n : n + "";
}
function It(t, n) {
  if (_(t) != "object" || !t) return t;
  var o = t[Symbol.toPrimitive];
  if (o !== void 0) {
    var e = o.call(t, n);
    if (_(e) != "object") return e;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var G = {
  name: "Badge",
  extends: At,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return P(V(V({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, jt = ["data-p"];
function Bt(t, n, o, e, i, r) {
  return u(), p("span", b({
    class: t.cx("root"),
    "data-p": r.dataP
  }, t.ptmi("root")), [g(t.$slots, "default", {}, function() {
    return [H(I(t.value), 1)];
  })], 16, jt);
}
G.render = Bt;
var Ot = `
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
function $(t) {
  "@babel/helpers - typeof";
  return $ = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, $(t);
}
function f(t, n, o) {
  return (n = Ft(n)) in t ? Object.defineProperty(t, n, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = o, t;
}
function Ft(t) {
  var n = Et(t, "string");
  return $(n) == "symbol" ? n : n + "";
}
function Et(t, n) {
  if ($(t) != "object" || !t) return t;
  var o = t[Symbol.toPrimitive];
  if (o !== void 0) {
    var e = o.call(t, n);
    if ($(e) != "object") return e;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Nt = {
  root: function(n) {
    var o = n.instance, e = n.props;
    return ["p-button p-component", f(f(f(f(f(f(f(f(f({
      "p-button-icon-only": o.hasIcon && !e.label && !e.badge,
      "p-button-vertical": (e.iconPos === "top" || e.iconPos === "bottom") && e.label,
      "p-button-loading": e.loading,
      "p-button-link": e.link || e.variant === "link"
    }, "p-button-".concat(e.severity), e.severity), "p-button-raised", e.raised), "p-button-rounded", e.rounded), "p-button-text", e.text || e.variant === "text"), "p-button-outlined", e.outlined || e.variant === "outlined"), "p-button-sm", e.size === "small"), "p-button-lg", e.size === "large"), "p-button-plain", e.plain), "p-button-fluid", o.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(n) {
    var o = n.props;
    return ["p-button-icon", f({}, "p-button-icon-".concat(o.iconPos), o.label)];
  },
  label: "p-button-label"
}, Lt = B.extend({
  name: "button",
  style: Ot,
  classes: Nt
}), Rt = {
  name: "BaseButton",
  extends: O,
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
  style: Lt,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function C(t) {
  "@babel/helpers - typeof";
  return C = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, C(t);
}
function l(t, n, o) {
  return (n = Tt(n)) in t ? Object.defineProperty(t, n, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = o, t;
}
function Tt(t) {
  var n = Vt(t, "string");
  return C(n) == "symbol" ? n : n + "";
}
function Vt(t, n) {
  if (C(t) != "object" || !t) return t;
  var o = t[Symbol.toPrimitive];
  if (o !== void 0) {
    var e = o.call(t, n);
    if (C(e) != "object") return e;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Z = {
  name: "Button",
  extends: Rt,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(n) {
      var o = n === "root" ? this.ptmi : this.ptm;
      return o(n, {
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
      return b(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return J(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return P(l(l(l(l(l(l(l(l(l(l({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return P(l(l({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return P(l(l({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Y,
    Badge: G
  },
  directives: {
    ripple: ft
  }
}, qt = ["data-p"], Wt = ["data-p"];
function Dt(t, n, o, e, i, r) {
  var a = T("SpinnerIcon"), s = T("Badge"), d = rt("ripple");
  return t.asChild ? g(t.$slots, "default", {
    key: 1,
    class: h(t.cx("root")),
    a11yAttrs: r.a11yAttrs
  }) : it((u(), x(at(t.as), b({
    key: 0,
    class: t.cx("root"),
    "data-p": r.dataP
  }, r.attrs), {
    default: w(function() {
      return [g(t.$slots, "default", {}, function() {
        return [t.loading ? g(t.$slots, "loadingicon", b({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (u(), p("span", b({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (u(), x(a, b({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : g(t.$slots, "icon", b({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (u(), p("span", b({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": r.dataIconP
          }, t.ptm("icon")), null, 16, qt)) : A("", !0)];
        }), t.label ? (u(), p("span", b({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": r.dataLabelP
        }), I(t.label), 17, Wt)) : A("", !0), t.badge ? (u(), x(s, {
          key: 3,
          value: t.badge,
          class: h(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : A("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[d]]);
}
Z.render = Dt;
function q(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : null;
}
function z(t, n = "") {
  const o = q(t);
  if (!o) return n;
  if (typeof o.message == "string" && o.message.trim()) return o.message.trim();
  const e = q(o.error);
  return e && typeof e.message == "string" && e.message.trim() ? e.message.trim() : typeof o.error == "string" && o.error.trim() ? o.error.trim() : e && typeof e.code == "string" && e.code.trim() ? e.code.trim() : typeof o.code == "string" && o.code.trim() ? o.code.trim() : n;
}
function Ut(t) {
  const n = t, o = z(n?.response?.data) || z(n?.data);
  return o || (t instanceof Error && t.message && t.message !== "[object Object]" && !/^request failed/i.test(t.message) && !/status code/i.test(t.message) ? t.message : "");
}
function Cn(t, n) {
  const o = Ut(t);
  return o ? /nothing to undo/i.test(o) ? "Nothing to undo." : /nothing to redo/i.test(o) ? "Nothing to redo." : /boundary_node_remove_refused/i.test(o) ? "Start, Finish, and Error steps are locked and can’t be deleted." : o : n;
}
async function L(t, n) {
  const { data: o } = await j.post(t, n);
  if (o && o.success === !1) throw new Error(z(o, "request failed"));
  return o;
}
async function Q(t) {
  const { data: n } = await j.get(t);
  if (n && n.success === !1) throw new Error(z(n, "request failed"));
  return n;
}
function X(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : {};
}
function W(t) {
  const n = X(t);
  return Object.keys(n).length ? {
    input_schema: n.input_schema,
    output_schema: n.output_schema,
    error_schema: n.error_schema,
    input_count: n.input_count != null ? Number(n.input_count) : void 0,
    output_count: n.output_count != null ? Number(n.output_count) : void 0,
    error_count: n.error_count != null ? Number(n.error_count) : void 0,
    input_keys: Array.isArray(n.input_keys) ? n.input_keys.map(String) : void 0,
    output_keys: Array.isArray(n.output_keys) ? n.output_keys.map(String) : void 0,
    error_keys: Array.isArray(n.error_keys) ? n.error_keys.map(String) : void 0
  } : null;
}
function Kt(t, n) {
  return t.toLowerCase() === n.toLowerCase();
}
function Mt(t) {
  if (!Array.isArray(t)) return [];
  const n = [];
  for (const o of t) {
    const e = String(o ?? "").trim();
    e && (n.some((i) => Kt(i, e)) || n.push(e));
  }
  return n;
}
async function zn(t = {}) {
  const n = [];
  let o = 0;
  do {
    const e = new URLSearchParams();
    t.filter === "published" && e.set("published", "true"), e.set("fields", "labels,head_seq,interface,published_interface,published_def_seq,has_draft_changes,parent_id,parent_name,breadcrumb,last_run,node_count,run_count"), e.set("limit", "100"), e.set("offset", String(o));
    const i = await Q(`/api/v1/workflows?${e}`);
    if (!Array.isArray(i.workflows)) throw new Error("The server returns no workflow page.");
    n.push(...i.workflows);
    const r = i.next_offset;
    if (r != null && (typeof r != "number" || !Number.isSafeInteger(r) || r <= o))
      throw new Error("The server returns an invalid workflow offset.");
    o = r ?? void 0;
  } while (o !== void 0);
  return n.map((e) => {
    const i = X(e.last_run);
    return {
      id: String(e.id || ""),
      title: String(e.title || "Untitled Workflow"),
      status: e.status != null ? String(e.status) : void 0,
      labels: Mt(e.labels),
      updated_at: e.updated_at != null ? String(e.updated_at) : void 0,
      node_count: e.node_count != null ? Number(e.node_count) : void 0,
      run_count: e.run_count != null ? Number(e.run_count) : void 0,
      head_seq: e.head_seq != null ? Number(e.head_seq) : void 0,
      interface: W(e.interface),
      published_version: e.published_version != null ? Number(e.published_version) : void 0,
      published_def_seq: e.published_def_seq != null ? Number(e.published_def_seq) : void 0,
      published_interface: W(e.published_interface),
      has_draft_changes: e.has_draft_changes === !0,
      // Placement is present only on placed, actor-readable rows; a root or access-filtered
      // parent leaves all three absent (never a fabricated location).
      parent_id: e.parent_id != null ? String(e.parent_id) : void 0,
      parent_name: e.parent_name != null ? String(e.parent_name) : void 0,
      breadcrumb: e.breadcrumb != null ? String(e.breadcrumb) : void 0,
      last_run: Object.keys(i).length ? {
        run_id: String(i.run_id || ""),
        status: String(i.status || ""),
        error: i.error != null ? String(i.error) : null,
        started_at: i.started_at != null ? String(i.started_at) : null,
        finished_at: i.finished_at != null ? String(i.finished_at) : null
      } : null
    };
  });
}
async function An(t, n) {
  const o = await L("/api/v1/workflows", { title: t, parent_id: n || void 0 }), e = String(o.flow_id || "");
  if (!e) throw new Error("the server did not return a Workflow id");
  return e;
}
async function Pn(t) {
  if (!t) return;
  const { data: n } = await j.delete(`/api/v1/workflows/${encodeURIComponent(t)}`);
  if (n && n.success === !1) throw new Error(String(n.error || "delete failed"));
}
async function In(t) {
  const n = await Q(`/api/v1/workflows/${encodeURIComponent(t)}/state`), o = n.state;
  return o && typeof o == "object" ? o : n;
}
function R(t) {
  return {
    events: Array.isArray(t.events) ? t.events : [],
    head_seq: Number(t.head_seq || 0),
    can_undo: t.can_undo === !0,
    can_redo: t.can_redo === !0
  };
}
async function jn(t, n) {
  const o = { commands: n }, e = new TextEncoder().encode(JSON.stringify(o)).byteLength < 60 * 1024, { data: i } = await j.post(`/api/v1/workflows/${encodeURIComponent(t)}/apply`, o, {
    adapter: "fetch",
    fetchOptions: { keepalive: e }
  });
  if (i && i.success === !1) throw new Error(z(i, "request failed"));
  return R(i);
}
async function Bn(t) {
  const n = await L(`/api/v1/workflows/${encodeURIComponent(t)}/undo`, {});
  return R(n);
}
async function On(t) {
  const n = await L(`/api/v1/workflows/${encodeURIComponent(t)}/redo`, {});
  return R(n);
}
var Ht = `
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
`, Jt = {
  root: "p-iconfield"
}, Yt = B.extend({
  name: "iconfield",
  style: Ht,
  classes: Jt
}), Gt = {
  name: "BaseIconField",
  extends: O,
  style: Yt,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, tt = {
  name: "IconField",
  extends: Gt,
  inheritAttrs: !1
};
function Zt(t, n, o, e, i, r) {
  return u(), p("div", b({
    class: t.cx("root")
  }, t.ptmi("root")), [g(t.$slots, "default")], 16);
}
tt.render = Zt;
var Qt = {
  root: "p-inputicon"
}, Xt = B.extend({
  name: "inputicon",
  classes: Qt
}), tn = {
  name: "BaseInputIcon",
  extends: O,
  style: Xt,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, nt = {
  name: "InputIcon",
  extends: tn,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function nn(t, n, o, e, i, r) {
  return u(), p("span", b({
    class: r.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [g(t.$slots, "default")], 16);
}
nt.render = nn;
function Fn(t) {
  return t === "flow";
}
function En(t) {
  return t === "for_each";
}
const on = { id: "failed", label: "Failed" }, en = {
  type: "object",
  required: ["code", "message"],
  additionalProperties: !1,
  properties: {
    code: { type: "string" },
    message: { type: "string" }
  }
};
function rn(t) {
  return t === on.id;
}
const D = {
  block: {
    kind: "block",
    label: "Block",
    hueVar: "--wf-violet",
    icon: "tabler:box",
    category: "Blocks",
    blurb: "Runs a typed reusable Block and continues with its result."
  },
  branch: {
    kind: "branch",
    label: "Condition",
    hueVar: "--wf-teal",
    icon: "tabler:arrows-split-2",
    category: "Logic",
    blurb: "Chooses between two paths: True runs when the condition holds, False otherwise.",
    // Compiler contract: the condition lives on the node (config.predicate) and the arms
    // leave the true/false ports (graph.lua rewrites them to the predicate and its negation).
    outPorts: [{ id: "true", label: "True" }, { id: "false", label: "False" }]
  },
  cycle: {
    kind: "cycle",
    label: "Loop",
    hueVar: "--wf-teal",
    icon: "tabler:rotate",
    category: "Logic",
    blurb: "Repeats the steps inside its body while its condition holds, then continues when it stops.",
    // Body wires the repeated subgraph (rendered as the loop container); done is the exit.
    // Directional labels so a first-timer sees which port is the loop and which is the exit.
    outPorts: [{ id: "body", label: "each pass →" }, { id: "done", label: "→ when done" }],
    continuation: "done"
  },
  // Combine is the one convergence kind, carrying both semantics through a mode toggle:
  // wait_all waits for every incoming path, first_wins continues on the first to arrive.
  combine: {
    kind: "combine",
    label: "Combine",
    hueVar: "--wf-teal",
    icon: "tabler:arrow-merge",
    category: "Logic",
    blurb: "Brings several incoming paths back into one — either waiting for every path or continuing on the first to arrive."
  },
  // For-each runs the body once per array item and continues with the collected results.
  for_each: {
    kind: "for_each",
    label: "For each",
    hueVar: "--wf-teal",
    icon: "tabler:arrows-split",
    category: "Logic",
    blurb: "Runs the steps inside its body once per array item, then continues with the collected results.",
    // Body wires the per-item subgraph (rendered as the container); the default continuation
    // carries the results array. Directional labels keep the per-item body apart from it.
    outPorts: [{ id: "body", label: "each item →" }, { id: "done", label: "→ all results" }],
    continuation: "done"
  },
  flow: {
    kind: "flow",
    label: "Workflow",
    hueVar: "--wf-violet",
    icon: "tabler:route",
    category: "Workflows",
    blurb: "Expands an exact published Workflow into this Workflow and continues with its result."
  },
  // Boundary nodes: the pinned workflow contract. Start declares the run input,
  // Finish the successful output, Error the failure output. These three — never
  // definition params — are the sole source of a workflow's interface.
  // Boundary nodes carry the "contract" palette (--wf-contract-*): a calm, desaturated
  // family set apart from the punchy per-kind data hues, so they read as the workflow's
  // interface, not another data step.
  start: {
    kind: "start",
    label: "Start",
    hueVar: "--wf-contract-in",
    icon: "tabler:player-play",
    category: "Structure",
    blurb: "Sets the input for each run. One Start step per Workflow."
  },
  finish: {
    kind: "finish",
    label: "Finish",
    hueVar: "--wf-contract-out",
    icon: "tabler:circle-check",
    category: "Structure",
    blurb: "Sets the result when a run succeeds."
  },
  error: {
    kind: "error",
    label: "Error",
    hueVar: "--wf-contract-err",
    icon: "tabler:circle-x",
    category: "Structure",
    blurb: "Sets the result when a run fails."
  }
}, an = {
  "--wf-amber": "wf-hue--amber",
  "--wf-violet": "wf-hue--violet",
  "--wf-blue": "wf-hue--blue",
  "--wf-teal": "wf-hue--teal",
  "--wf-rose": "wf-hue--rose",
  "--wf-muted": "wf-hue--slate",
  "--p-success-500": "wf-hue--ok",
  "--wf-danger": "wf-hue--danger",
  "--wf-contract-in": "wf-hue--contract-in",
  "--wf-contract-out": "wf-hue--contract-out",
  "--wf-contract-err": "wf-hue--contract-err"
};
function Nn(t) {
  return an[t] || "wf-hue--violet";
}
const Ln = {
  start: "input_schema",
  finish: "output_schema",
  error: "error_schema"
};
function Rn(t) {
  return t === "start" || t === "finish" || t === "error";
}
const Tn = ["Structure", "Blocks", "Workflows", "Logic", "Notes"], dn = {
  amber: "--wf-amber",
  violet: "--wf-violet",
  blue: "--wf-blue",
  teal: "--wf-teal",
  rose: "--wf-rose",
  emerald: "--p-success-500",
  green: "--p-success-500",
  red: "--wf-danger"
};
function sn(t) {
  return t && dn[t] || "--wf-violet";
}
const S = {}, m = {};
function Vn(t) {
  for (const n of Object.keys(m)) delete m[n];
  for (const n of Object.keys(S)) delete S[n];
  for (const n of t)
    !n || !n.id || (m[n.id] = n, S[n.id] = {
      kind: "block",
      label: n.label || n.id,
      hueVar: sn(n.hue),
      icon: n.icon || "tabler:puzzle",
      category: n.category || "Blocks",
      waits: n.waits === !0,
      blurb: n.blurb || "",
      outPorts: n.ports?.length ? n.ports.map((o) => ({ id: o.id, label: o.label })) : void 0
    });
}
function qn(t) {
  return t ? m[t]?.config_schema : void 0;
}
function Wn(t) {
  return t ? m[t]?.config_wc : void 0;
}
function Dn(t) {
  const n = t ? m[t] : void 0;
  return n?.tool === !0 || n?.source_kind === "tool";
}
function un(t, n) {
  if (!(!t || !n))
    return m[t]?.ports?.find((o) => o.id === n)?.schema;
}
function ot(t, n) {
  return t === "block" && n && S[n] ? S[n] : D[t] || D.block;
}
function Un(t, n) {
  return ot(t, n).waits === !0;
}
function Kn(t, n) {
  const o = t === "block" && n ? m[n] : void 0;
  if (o?.ports?.length) {
    const e = o.ports.filter((i) => !i.direction || i.direction === "out");
    return e.length ? e.map(({ id: i, label: r }) => ({ id: i, label: r })) : [{ id: "", label: "" }];
  }
  return ot(t, n).outPorts || [{ id: "", label: "" }];
}
function N(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : null;
}
function y(t) {
  if (typeof t == "string") {
    const n = t.trim();
    if (!n) return null;
    try {
      return N(JSON.parse(n));
    } catch {
      return null;
    }
  }
  return N(t);
}
function Mn(t, n) {
  if (t === n) return !0;
  const o = /* @__PURE__ */ new Set(["number", "integer"]);
  return o.has(t) && o.has(n) ? !0 : t === "any" || n === "any";
}
function ln(t) {
  const n = t.type;
  return typeof n == "string" && n ? n : Array.isArray(n) && typeof n[0] == "string" ? n[0] : t.properties && typeof t.properties == "object" ? "object" : "schema";
}
function U(t) {
  const n = y(t);
  if (!n) return "No schema";
  const o = ln(n), e = N(n.properties) || {}, i = Object.keys(e);
  if (!i.length) return o;
  const r = i.slice(0, 3).join(", ");
  return `${o}: ${r}${i.length > 3 ? ` +${i.length - 3}` : ""}`;
}
function cn(t) {
  if (t)
    return t.kind === "start" ? t.config?.input_schema ?? t.output_schema : t.output_schema;
}
function bn(t, n) {
  if (t)
    return t.kind === "finish" ? t.config?.output_schema ?? t.input_schema : t.kind === "error" ? t.config?.error_schema ?? t.input_schema : t.input_schema;
}
function Hn(t, n) {
  return !t || n != null ? !1 : t.kind === "block" || t.kind === "flow";
}
function pn(t, n, o = /* @__PURE__ */ new Set()) {
  const e = t.nodes[n.source_id], i = un(e?.ref, n.source_port);
  if (i != null) return i;
  if (rn(n.source_port)) return en;
  if (e?.kind === "branch") {
    if (o.has(e.id)) return;
    o.add(e.id);
    const r = Object.values(t.edges).find((a) => a.target_id === e.id);
    return r ? pn(t, r, o) : void 0;
  }
  return cn(e);
}
function Jn(t, n) {
  if (!n || n.kind !== "finish") return null;
  const o = y(bn(n)), e = o?.properties && typeof o.properties == "object" && !Array.isArray(o.properties) ? o.properties : {};
  if (!o || o.type !== "object" || Object.keys(e).length > 0) return null;
  const i = y(t);
  if (!i) return null;
  const r = i.properties && typeof i.properties == "object" && !Array.isArray(i.properties) ? i.properties : {};
  return i.type !== "object" || Object.keys(r).length > 0 ? i : null;
}
function Yn(t, n) {
  const o = new Map(n.filter((r) => !!r.ref).map((r) => [`${r.kind}:${r.ref}`, r])), e = new Map(n.filter((r) => !r.ref).map((r) => [String(r.kind), r]));
  let i = 0;
  for (const r of Object.values(t)) {
    const a = (r.ref ? o.get(`${r.kind}:${r.ref}`) : void 0) || e.get(String(r.kind));
    if (!a) continue;
    let s = !1;
    for (const d of ["input_schema", "output_schema", "config_schema"])
      a[d] !== void 0 && r[d] !== a[d] && (r[d] = a[d], s = !0);
    a.icon && r.icon !== a.icon && (r.icon = a.icon, s = !0), s && i++;
  }
  return i;
}
function fn(t) {
  return !!(t && typeof t.picker == "string" && t.picker && t.picker !== "wc-schema-form");
}
function et(t) {
  return t?.config_schema;
}
function hn(t, n = "ports") {
  const o = et(t);
  if (!o) return null;
  const e = [];
  for (const [c, F] of Object.entries(o))
    fn(F) && e.push([c, F]);
  if (e.length === 0) return null;
  e.length > 1 && console.error(`${n}: port schema declares multiple picker fields`, e.map(([c]) => c));
  const [i, r] = e[0], a = typeof r.title == "string" ? r.title : "", s = typeof r.detail == "string" ? r.detail : "", d = typeof r.delete_endpoint == "string" ? r.delete_endpoint : "";
  return { key: i, tag: r.picker ?? "", title: a, schema: { properties: { [i]: r } }, detail: s, deleteEndpoint: d };
}
function Gn(t, n = "ports") {
  const o = et(t);
  if (!o) return null;
  const e = hn(t, n)?.key, i = {};
  for (const [r, a] of Object.entries(o))
    r !== e && (i[r] = a);
  return Object.keys(i).length ? { type: "object", properties: i } : null;
}
function gn(t) {
  if (!t) return null;
  if (typeof t == "string")
    try {
      return JSON.parse(t);
    } catch {
      return null;
    }
  return t;
}
function Zn(t) {
  const n = gn(t);
  return !!(n && n.properties && Object.keys(n.properties).length);
}
function K(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : {};
}
function yn(t) {
  return [...t].sort((n, o) => o.version - n.version)[0] || null;
}
function mn(t) {
  const n = K(t.params), o = K(n.interface), e = y(n.input_schema) || y(o.input_schema), i = y(n.output_schema) || y(o.output_schema);
  return e && i ? { input_schema: e, output_schema: i } : null;
}
function vn(t) {
  const n = t.published_interface || t.interface;
  if (!n) return null;
  const o = y(n.input_schema), e = y(n.output_schema);
  return o && e ? { input_schema: o, output_schema: e } : null;
}
function Qn(t, n, o, e) {
  const i = yn(o), r = vn(t) || mn(n), a = t.published_version || i?.version, s = !!r, d = t.has_draft_changes === !0;
  return {
    ...t,
    is_current: t.id === e,
    callable: s,
    published_version: a,
    has_draft_changes: d,
    input_schema: r?.input_schema,
    output_schema: r?.output_schema,
    input_summary: U(r?.input_schema),
    output_summary: U(r?.output_schema),
    trigger_label: "Declared input",
    leaf_count: r ? 1 : 0
  };
}
const Xn = /* @__PURE__ */ dt({
  __name: "WorkflowSearchList",
  props: {
    rows: {},
    loading: { type: Boolean },
    error: {},
    matches: { type: Function },
    placeholder: {},
    emptyMessage: {},
    rootClass: {},
    searchClass: {},
    noteClass: {},
    errorClass: {},
    listClass: {},
    rowClass: {},
    rowExtraClass: { type: Function },
    isDisabled: { type: Function },
    isEmphasized: { type: Function },
    quietRows: { type: Boolean },
    emptyClass: {}
  },
  emits: ["select"],
  setup(t, { emit: n }) {
    const o = t, e = n, i = st(""), r = ut(() => {
      const s = i.value.trim().toLowerCase();
      return s ? o.rows.filter((d) => o.matches(d, s)) : o.rows;
    });
    function a(s) {
      return o.isEmphasized?.(s) === !0;
    }
    return (s, d) => (u(), p("div", {
      class: h(t.rootClass)
    }, [
      k(v(tt), {
        class: h(["wf-search", t.searchClass])
      }, {
        default: w(() => [
          k(v(nt), null, {
            default: w(() => [
              k(v(mt), {
                icon: "tabler:search",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }),
          k(v(gt), {
            modelValue: i.value,
            "onUpdate:modelValue": d[0] || (d[0] = (c) => i.value = c),
            placeholder: t.placeholder,
            "aria-label": t.placeholder
          }, null, 8, ["modelValue", "placeholder", "aria-label"])
        ]),
        _: 1
      }, 8, ["class"]),
      g(s.$slots, "before-list"),
      t.loading ? (u(), p("div", {
        key: 0,
        class: h(t.noteClass)
      }, [
        k(v(yt), {
          class: "wf-status-spinner",
          "stroke-width": "4",
          "aria-label": "Loading Workflows"
        }),
        d[1] || (d[1] = M("span", null, "Loading Workflows…", -1))
      ], 2)) : t.error ? (u(), x(v(ht), {
        key: 1,
        class: h(t.errorClass),
        severity: "error",
        closable: !1
      }, {
        default: w(() => [
          H(I(t.error), 1)
        ]),
        _: 1
      }, 8, ["class"])) : (u(), p("div", {
        key: 2,
        class: h(t.listClass)
      }, [
        (u(!0), p(lt, null, ct(r.value, (c) => (u(), x(v(Z), {
          key: c.id,
          type: "button",
          class: h([t.rowClass, t.rowExtraClass?.(c)]),
          severity: a(c) ? void 0 : "secondary",
          text: t.quietRows === !0,
          outlined: t.quietRows !== !0 && !a(c),
          disabled: t.isDisabled?.(c),
          onClick: (F) => e("select", c)
        }, {
          default: w(() => [
            g(s.$slots, "row", { item: c })
          ]),
          _: 2
        }, 1032, ["class", "severity", "text", "outlined", "disabled", "onClick"]))), 128)),
        r.value.length ? A("", !0) : (u(), p("p", {
          key: 0,
          class: h(t.emptyClass)
        }, I(t.rows.length ? "No matching Workflows." : t.emptyMessage), 3))
      ], 2))
    ], 2));
  }
}), to = ":host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}";
export {
  pn as A,
  bn as B,
  Hn as C,
  U as D,
  Jn as E,
  on as F,
  en as G,
  cn as H,
  Vn as I,
  Tn as J,
  D as K,
  Qn as L,
  gn as M,
  Dn as N,
  qn as O,
  Wn as P,
  hn as Q,
  Gn as R,
  Ln as S,
  Bn as T,
  On as U,
  In as V,
  Yn as W,
  to as X,
  Zn as Y,
  Un as Z,
  Xn as _,
  X as a,
  W as b,
  Ut as c,
  Kt as d,
  Y as e,
  tt as f,
  Q as g,
  nt as h,
  Cn as i,
  G as j,
  Pn as k,
  jn as l,
  An as m,
  Mt as n,
  zn as o,
  L as p,
  Nn as q,
  y as r,
  Z as s,
  Mn as t,
  Kn as u,
  En as v,
  Fn as w,
  ot as x,
  Rn as y,
  rn as z
};
