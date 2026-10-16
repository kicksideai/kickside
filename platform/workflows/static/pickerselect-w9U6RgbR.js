import { api as K } from "@wippy-fe/proxy";
import { c as Q, B as P, H as ut, f as zt, k as z, l as I, R as ct, s as jt } from "./index-B9KLaL2S.js";
import { openBlock as u, createElementBlock as p, mergeProps as c, createElementVNode as g, renderSlot as b, createTextVNode as pt, toDisplayString as _, resolveComponent as H, resolveDirective as Nt, withDirectives as bt, createBlock as $, resolveDynamicComponent as X, withCtx as m, createCommentVNode as S, normalizeClass as w, createVNode as v, Transition as Rt, vShow as Bt, defineComponent as ft, computed as U, ref as W, unref as y, Fragment as gt, renderList as Et } from "vue";
import { Icon as M } from "@iconify/vue";
import { s as Tt } from "./index-I_-ROi8M.js";
import { s as Ot } from "./index-DRigRSgk.js";
var ht = {
  name: "SpinnerIcon",
  extends: Q
};
function Lt(t) {
  return Wt(t) || Ut(t) || Dt(t) || Ft();
}
function Ft() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Dt(t, n) {
  if (t) {
    if (typeof t == "string") return J(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? J(t, n) : void 0;
  }
}
function Ut(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Wt(t) {
  if (Array.isArray(t)) return J(t);
}
function J(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function Mt(t, n, e, o, r, i) {
  return u(), p("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Lt(n[0] || (n[0] = [g("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ht.render = Mt;
var qt = `
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
`, Vt = {
  root: function(n) {
    var e = n.props, o = n.instance;
    return ["p-badge p-component", {
      "p-badge-circle": zt(e.value) && String(e.value).length === 1,
      "p-badge-dot": ut(e.value) && !o.$slots.default,
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
}, Kt = P.extend({
  name: "badge",
  style: qt,
  classes: Vt
}), Ht = {
  name: "BaseBadge",
  extends: z,
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
  style: Kt,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function R(t) {
  "@babel/helpers - typeof";
  return R = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, R(t);
}
function et(t, n, e) {
  return (n = Jt(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Jt(t) {
  var n = Yt(t, "string");
  return R(n) == "symbol" ? n : n + "";
}
function Yt(t, n) {
  if (R(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (R(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var yt = {
  name: "Badge",
  extends: Ht,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return I(et(et({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Gt = ["data-p"];
function Zt(t, n, e, o, r, i) {
  return u(), p("span", c({
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [b(t.$slots, "default", {}, function() {
    return [pt(_(t.value), 1)];
  })], 16, Gt);
}
yt.render = Zt;
var Qt = `
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
function B(t) {
  "@babel/helpers - typeof";
  return B = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, B(t);
}
function k(t, n, e) {
  return (n = Xt(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Xt(t) {
  var n = tn(t, "string");
  return B(n) == "symbol" ? n : n + "";
}
function tn(t, n) {
  if (B(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (B(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var nn = {
  root: function(n) {
    var e = n.instance, o = n.props;
    return ["p-button p-component", k(k(k(k(k(k(k(k(k({
      "p-button-icon-only": e.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", e.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(n) {
    var e = n.props;
    return ["p-button-icon", k({}, "p-button-icon-".concat(e.iconPos), e.label)];
  },
  label: "p-button-label"
}, en = P.extend({
  name: "button",
  style: Qt,
  classes: nn
}), on = {
  name: "BaseButton",
  extends: z,
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
  style: en,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function E(t) {
  "@babel/helpers - typeof";
  return E = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, E(t);
}
function h(t, n, e) {
  return (n = rn(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function rn(t) {
  var n = an(t, "string");
  return E(n) == "symbol" ? n : n + "";
}
function an(t, n) {
  if (E(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (E(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var T = {
  name: "Button",
  extends: on,
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
      return c(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return ut(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return I(h(h(h(h(h(h(h(h(h(h({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return I(h(h({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return I(h(h({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: ht,
    Badge: yt
  },
  directives: {
    ripple: ct
  }
}, sn = ["data-p"], dn = ["data-p"];
function ln(t, n, e, o, r, i) {
  var a = H("SpinnerIcon"), d = H("Badge"), s = Nt("ripple");
  return t.asChild ? b(t.$slots, "default", {
    key: 1,
    class: w(t.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : bt((u(), $(X(t.as), c({
    key: 0,
    class: t.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: m(function() {
      return [b(t.$slots, "default", {}, function() {
        return [t.loading ? b(t.$slots, "loadingicon", c({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (u(), p("span", c({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (u(), $(a, c({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : b(t.$slots, "icon", c({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (u(), p("span", c({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": i.dataIconP
          }, t.ptm("icon")), null, 16, sn)) : S("", !0)];
        }), t.label ? (u(), p("span", c({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": i.dataLabelP
        }), _(t.label), 17, dn)) : S("", !0), t.badge ? (u(), $(d, {
          key: 3,
          value: t.badge,
          class: w(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : S("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[s]]);
}
T.render = ln;
function ot(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : null;
}
function O(t, n = "") {
  const e = ot(t);
  if (!e) return n;
  if (typeof e.message == "string" && e.message.trim()) return e.message.trim();
  const o = ot(e.error);
  return o && typeof o.message == "string" && o.message.trim() ? o.message.trim() : typeof e.error == "string" && e.error.trim() ? e.error.trim() : o && typeof o.code == "string" && o.code.trim() ? o.code.trim() : typeof e.code == "string" && e.code.trim() ? e.code.trim() : n;
}
function un(t) {
  const n = t, e = O(n?.response?.data) || O(n?.data);
  return e || (t instanceof Error && t.message && t.message !== "[object Object]" && !/^request failed/i.test(t.message) && !/status code/i.test(t.message) ? t.message : "");
}
function He(t, n) {
  const e = un(t);
  return e ? /nothing to undo/i.test(e) ? "Nothing to undo." : /nothing to redo/i.test(e) ? "Nothing to redo." : /boundary_node_remove_refused/i.test(e) ? "Start, Finish, and Error steps are locked and can’t be deleted." : e : n;
}
async function D(t, n) {
  const { data: e } = await K.post(t, n);
  if (e && e.success === !1) throw new Error(O(e, "request failed"));
  return e;
}
async function A(t) {
  const { data: n } = await K.get(t);
  if (n && n.success === !1) throw new Error(O(n, "request failed"));
  return n;
}
function mt(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : {};
}
function rt(t) {
  const n = mt(t);
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
function cn(t, n) {
  return t.toLowerCase() === n.toLowerCase();
}
function pn(t) {
  if (!Array.isArray(t)) return [];
  const n = [];
  for (const e of t) {
    const o = String(e ?? "").trim();
    o && (n.some((r) => cn(r, o)) || n.push(o));
  }
  return n;
}
async function Je(t = {}) {
  const n = [];
  let e = 0;
  do {
    const o = new URLSearchParams();
    t.filter === "published" && o.set("published", "true"), o.set("fields", "labels,head_seq,interface,published_interface,published_def_seq,has_draft_changes,parent_id,parent_name,breadcrumb,last_run,node_count,run_count"), o.set("limit", "100"), o.set("offset", String(e));
    const r = await A(`/api/v1/workflows?${o}`);
    if (!Array.isArray(r.workflows)) throw new Error("The server returns no workflow page.");
    n.push(...r.workflows);
    const i = r.next_offset;
    if (i != null && (typeof i != "number" || !Number.isSafeInteger(i) || i <= e))
      throw new Error("The server returns an invalid workflow offset.");
    e = i ?? void 0;
  } while (e !== void 0);
  return n.map((o) => {
    const r = mt(o.last_run);
    return {
      id: String(o.id || ""),
      title: String(o.title || "Untitled Workflow"),
      status: o.status != null ? String(o.status) : void 0,
      labels: pn(o.labels),
      updated_at: o.updated_at != null ? String(o.updated_at) : void 0,
      node_count: o.node_count != null ? Number(o.node_count) : void 0,
      run_count: o.run_count != null ? Number(o.run_count) : void 0,
      head_seq: o.head_seq != null ? Number(o.head_seq) : void 0,
      interface: rt(o.interface),
      published_version: o.published_version != null ? Number(o.published_version) : void 0,
      published_def_seq: o.published_def_seq != null ? Number(o.published_def_seq) : void 0,
      published_interface: rt(o.published_interface),
      has_draft_changes: o.has_draft_changes === !0,
      // Placement is present only on placed, actor-readable rows; a root or access-filtered
      // parent leaves all three absent (never a fabricated location).
      parent_id: o.parent_id != null ? String(o.parent_id) : void 0,
      parent_name: o.parent_name != null ? String(o.parent_name) : void 0,
      breadcrumb: o.breadcrumb != null ? String(o.breadcrumb) : void 0,
      last_run: Object.keys(r).length ? {
        run_id: String(r.run_id || ""),
        status: String(r.status || ""),
        error: r.error != null ? String(r.error) : null,
        started_at: r.started_at != null ? String(r.started_at) : null,
        finished_at: r.finished_at != null ? String(r.finished_at) : null
      } : null
    };
  });
}
async function Ye(t, n) {
  const e = await D("/api/v1/workflows", { title: t, parent_id: n || void 0 }), o = String(e.flow_id || "");
  if (!o) throw new Error("the server did not return a Workflow id");
  return o;
}
async function Ge(t) {
  if (!t) return;
  const { data: n } = await K.delete(`/api/v1/workflows/${encodeURIComponent(t)}`);
  if (n && n.success === !1) throw new Error(String(n.error || "delete failed"));
}
async function Ze(t) {
  const n = await A(`/api/v1/workflows/${encodeURIComponent(t)}/state`), e = n.state;
  return e && typeof e == "object" ? e : n;
}
function tt(t) {
  return {
    events: Array.isArray(t.events) ? t.events : [],
    head_seq: Number(t.head_seq || 0),
    can_undo: t.can_undo === !0,
    can_redo: t.can_redo === !0
  };
}
async function Qe(t, n) {
  const e = { commands: n }, o = new TextEncoder().encode(JSON.stringify(e)).byteLength < 60 * 1024, { data: r } = await K.post(`/api/v1/workflows/${encodeURIComponent(t)}/apply`, e, {
    adapter: "fetch",
    fetchOptions: { keepalive: o }
  });
  if (r && r.success === !1) throw new Error(O(r, "request failed"));
  return tt(r);
}
async function Xe(t) {
  const n = await D(`/api/v1/workflows/${encodeURIComponent(t)}/undo`, {});
  return tt(n);
}
async function to(t) {
  const n = await D(`/api/v1/workflows/${encodeURIComponent(t)}/redo`, {});
  return tt(n);
}
function bn(t, n) {
  if (typeof t == "string" && String(n || "").includes("json"))
    try {
      return JSON.parse(t);
    } catch {
      return t;
    }
  return t;
}
function fn(t) {
  return t.map((n) => ({
    data_id: String(n.data_id || ""),
    node_id: String(n.node_id || ""),
    type: String(n.type || n.data_type || ""),
    content: bn(n.content, n.content_type),
    content_type: n.content_type != null ? String(n.content_type) : void 0,
    discriminator: n.discriminator != null ? String(n.discriminator) : void 0,
    created_at: n.created_at != null ? String(n.created_at) : void 0
  }));
}
async function no(t, n = 20) {
  const e = await A(`/api/v1/workflows/${encodeURIComponent(t)}/runs?limit=${n}`);
  return (Array.isArray(e.runs) ? e.runs : []).map(vt);
}
async function eo(t, n) {
  const e = await A(`/api/v1/workflows/${encodeURIComponent(t)}/runs/${encodeURIComponent(n)}`), o = vt(e.run || {}), r = (Array.isArray(e.nodes) ? e.nodes : []).map((a) => ({
    engine_node_id: String(a.engine_node_id || ""),
    parent_engine_node_id: a.parent_engine_node_id != null ? String(a.parent_engine_node_id) : void 0,
    def_node_id: String(a.def_node_id || ""),
    type: String(a.type || ""),
    status: String(a.status || ""),
    title: String(a.title || "")
  })), i = e.input && typeof e.input == "object" && !Array.isArray(e.input) ? e.input : void 0;
  return { run: o, input: i, errorRouted: e.error_routed === !0, nodes: r, execution: vn(e.execution) };
}
async function oo(t, n, e = 100, o = 0) {
  const r = Math.max(1, Math.min(200, e)), i = Math.max(0, o), a = await A(`/api/v1/workflows/${encodeURIComponent(t)}/runs/${encodeURIComponent(n)}/events?limit=${r}&offset=${i}`), d = a.timeline && typeof a.timeline == "object" ? a.timeline : {};
  return {
    events: (Array.isArray(d.events) ? d.events : []).map((l) => ({
      seq: Number(l.seq || 0),
      occurred_at: l.occurred_at != null ? String(l.occurred_at) : void 0,
      source: String(l.source || "engine"),
      type: String(l.type || "event"),
      engine_node_id: l.engine_node_id != null ? String(l.engine_node_id) : void 0,
      ...l.raw !== void 0 ? { raw: l.raw } : {}
    })),
    count: Number(d.count || 0),
    limit: Number(d.limit || r),
    offset: Number(d.offset || i),
    next_offset: d.next_offset != null ? Number(d.next_offset) : null
  };
}
async function ro(t, n) {
  const e = await A(`/api/v1/workflows/${encodeURIComponent(t)}/runs/${encodeURIComponent(n)}/export`);
  if (e.export === void 0) throw new Error("the server did not return a run export");
  return e.export;
}
async function io(t, n, e) {
  if (!t || !n || !e) return [];
  const o = await A(`/api/v1/workflows/${encodeURIComponent(t)}/runs/${encodeURIComponent(n)}/nodes/${encodeURIComponent(e)}/data`), r = Array.isArray(o.data) ? o.data : [];
  return fn(r);
}
function vt(t) {
  const n = mn(t), e = t.automation_ref == null ? void 0 : yn(t.automation_ref);
  return {
    run_id: String(t.run_id || ""),
    ...n,
    ...e ? { automation_ref: e } : {},
    origin: t.origin != null ? String(t.origin) : void 0,
    status: String(t.status || "pending"),
    error: t.error != null ? String(t.error) : null,
    started_at: t.started_at != null ? String(t.started_at) : null,
    finished_at: t.finished_at != null ? String(t.finished_at) : null,
    ...t.output !== void 0 ? { output: t.output } : {},
    dataflow_id: t.dataflow_id != null ? String(t.dataflow_id) : void 0,
    ...t.dataflow_status != null ? { dataflow_status: String(t.dataflow_status) } : {}
  };
}
function gn(t) {
  const n = t && typeof t == "object" && !Array.isArray(t) ? t : {}, e = typeof n.id == "string" ? n.id : "", o = Number(n.version);
  if (n.kind !== "flow" || !e || !Number.isInteger(o) || o < 1)
    throw new Error("the server returned an invalid Workflow reference");
  return { kind: "flow", id: e, version: o };
}
function hn(t) {
  const n = t && typeof t == "object" && !Array.isArray(t) ? t : {}, e = typeof n.id == "string" ? n.id : "", o = Number(n.def_seq);
  if (n.kind !== "flow" || !e || !Number.isInteger(o) || o < 0)
    throw new Error("the server returned an invalid Workflow draft reference");
  return { kind: "flow", id: e, def_seq: o };
}
function yn(t) {
  const n = t && typeof t == "object" && !Array.isArray(t) ? t : {}, e = typeof n.id == "string" ? n.id : "", o = Number(n.revision);
  if (n.kind !== "automation" || !e || !Number.isInteger(o) || o < 1)
    throw new Error("the server returned an invalid Automation reference");
  return { kind: "automation", id: e, revision: o };
}
function mn(t) {
  if (t.flow_ref != null && t.draft_ref == null) return { flow_ref: gn(t.flow_ref) };
  if (t.draft_ref != null && t.flow_ref == null) return { draft_ref: hn(t.draft_ref) };
  throw new Error("the server must return exactly one Workflow run reference");
}
function vn(t) {
  const n = t && typeof t == "object" && !Array.isArray(t) ? t : {}, e = n.process && typeof n.process == "object" && !Array.isArray(n.process) ? n.process : null;
  return {
    dataflow_id: n.dataflow_id != null ? String(n.dataflow_id) : void 0,
    parent_dataflow_id: n.parent_dataflow_id != null ? String(n.parent_dataflow_id) : void 0,
    ...e ? { process: {
      id: e.id != null ? String(e.id) : void 0,
      host: e.host != null ? String(e.host) : void 0,
      pid: e.pid != null ? String(e.pid) : void 0
    } } : {}
  };
}
async function ao(t, n = {}) {
  const e = {};
  n.input !== void 0 && (e.input = n.input);
  const o = await D(`/api/v1/workflows/${encodeURIComponent(t)}/simulate`, e), r = String(o.run_id || "");
  if (!r) throw new Error("the server did not return a run id");
  return r;
}
async function so(t, n, e = {}) {
  if (!Number.isInteger(n) || n < 1) throw new Error("a published Workflow version is required");
  const o = await D(`/api/v1/workflows/${encodeURIComponent(t)}/run`, { version: n, input: e }), r = String(o.run_id || "");
  if (!r) throw new Error("the server did not return a run id");
  return r;
}
function j(t, n) {
  for (let e = t.length - 1; e >= 0; e--)
    if (t[e].type === n && t[e].content != null) return t[e];
}
function kn(t) {
  const n = j(t, "node.input");
  return n ? n.content : null;
}
function wn(t) {
  const n = j(t, "node.output");
  if (n) return n.content;
  const e = j(t, "node.result")?.content;
  if (e && typeof e == "object" && "data_ids" in e && "output" in e)
    return e.output ?? null;
  const o = j(t, "agent.action");
  if (o) {
    const i = o.content;
    if (i && typeof i == "object" && "result" in i) {
      const a = i.result;
      if (a != null) return a;
    }
    return i;
  }
  const r = j(t, "node.result");
  if (r) {
    const i = r.content;
    return i && typeof i == "object" && "data_ids" in i && "success" in i ? i.output ?? null : i;
  }
  return null;
}
const kt = /^(failed|failure|error|node failed|step failed)\.?$/i, L = "This step failed.";
function q(t) {
  return !!t && typeof t == "object" && !Array.isArray(t);
}
function V(...t) {
  for (const n of t) if (typeof n == "string" && n.trim()) return n.trim();
}
function _n(t) {
  for (let n = t.length - 1; n >= 0; n--) {
    const e = t[n];
    if (e.type === "node.error" || e.type === "node.result" && (e.discriminator || "").startsWith("result.error")) return e;
  }
}
function Sn(t) {
  if (!q(t)) return { message: L, hasDetail: !1 };
  const n = V(t.code), e = V(t.message);
  return { message: e || L, code: n, detail: t, hasDetail: !!e };
}
function xn(t) {
  const n = _n(t);
  return n ? Sn(n.content) : null;
}
function $n(t) {
  const n = t.trim();
  if (n.startsWith("{") || n.startsWith("["))
    try {
      return JSON.parse(n);
    } catch {
      return;
    }
}
function it(t) {
  const n = V(t.code), e = V(t.message);
  return e && !kt.test(e) ? { message: e, code: n, generic: !1 } : { message: L, code: n, generic: !0 };
}
function Cn(t) {
  if (t == null) return { message: "", generic: !0 };
  if (q(t)) return it(t);
  const n = String(t).trim();
  if (!n) return { message: "", generic: !0 };
  const e = n.match(/^Node\s+\[[^\]]+\]\s+failed:\s*(.*)$/i), o = (e ? e[1] : n).trim(), r = $n(o);
  return q(r) ? it(r) : !o || kt.test(o) ? { message: L, generic: !0 } : { message: o, generic: !1 };
}
function wt(t) {
  const n = Cn(t);
  return n.generic ? "" : n.message;
}
function An(t) {
  const n = [];
  for (const e of t) {
    if (e.type !== "agent.action" || e.content == null) continue;
    const o = e.content, r = q(o) ? o : {};
    n.push({
      result: "result" in r ? r.result : void 0,
      toolCalls: Array.isArray(r.tool_calls) ? r.tool_calls : [],
      raw: o
    });
  }
  return n;
}
function In(t) {
  let n = Number.POSITIVE_INFINITY, e = Number.NEGATIVE_INFINITY, o, r;
  for (const i of t) {
    if (!i.created_at) continue;
    const a = Date.parse(i.created_at);
    Number.isFinite(a) && (a < n && (n = a, o = i.created_at), a > e && (e = a, r = i.created_at));
  }
  return !Number.isFinite(n) || !Number.isFinite(e) ? {} : { startedAt: o, finishedAt: r, durationMs: Math.max(0, e - n) };
}
function lo(t) {
  if (!Number.isFinite(t) || t < 0) return "—";
  if (t < 1e3) return `${Math.round(t)}ms`;
  if (t < 6e4) return `${(t / 1e3).toFixed(1)}s`;
  const n = Math.round(t / 1e3), e = Math.floor(n / 60), o = n % 60;
  return `${e}m ${o}s`;
}
function Pn(t) {
  if (typeof t == "string") return t;
  try {
    return JSON.stringify(t, null, 2);
  } catch {
    return String(t);
  }
}
function zn(t, n = 40) {
  const e = t.split(`
`);
  return e.length <= n ? { preview: t, truncated: !1, totalLines: e.length, hiddenLines: 0 } : {
    preview: e.slice(0, n).join(`
`),
    truncated: !0,
    totalLines: e.length,
    hiddenLines: e.length - n
  };
}
function uo(t, n = {}) {
  let e = xn(t);
  if (!e && n.failed) {
    const o = wt(n.runError);
    e = o ? { message: o, hasDetail: !0 } : { message: L, hasDetail: !1 };
  }
  return {
    input: kn(t),
    output: wn(t),
    error: e,
    agentActions: An(t),
    timing: In(t)
  };
}
function _t(t) {
  const n = t.toLowerCase();
  return n === "completed" || n === "complete" || n === "success" || n === "succeeded" ? "ok" : n === "failed" || n === "error" || n === "cancelled" || n === "canceled" || n === "terminated" ? "error" : "pending";
}
function co(t) {
  return _t(t.status) === "pending" && t.dataflow_status === "waiting" ? "waiting" : t.status;
}
function po(t) {
  return _t(t.status) === "error" ? wt(t.error) : "";
}
function bo(t) {
  const n = t.trim();
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : "Pending";
}
function fo(t) {
  return [...t].sort((n, e) => {
    const o = Date.parse(n.started_at || n.finished_at || "") || 0, r = Date.parse(e.started_at || e.finished_at || "") || 0;
    return r !== o ? r - o : e.run_id.localeCompare(n.run_id);
  });
}
function go(t, n = Date.now()) {
  if (!t) return "—";
  const e = Date.parse(t);
  if (!Number.isFinite(e)) return "—";
  const o = Math.round((n - e) / 1e3);
  if (o < 5) return "just now";
  if (o < 60) return `${o}s ago`;
  const r = Math.round(o / 60);
  if (r < 60) return `${r}m ago`;
  const i = Math.round(r / 60);
  if (i < 24) return `${i}h ago`;
  const a = Math.round(i / 24);
  return a < 30 ? `${a}d ago` : new Date(e).toLocaleDateString();
}
function ho(t) {
  return t.length > 8 ? t.slice(0, 8) : t;
}
function yo(t) {
  const n = Number(t) || 0;
  return n > 0 ? { label: `v${n}`, kind: "published", title: `Ran published version ${n}` } : { label: "Draft run", kind: "draft", title: "Ran your current draft — not a published version" };
}
var jn = `
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
`, Nn = {
  root: "p-iconfield"
}, Rn = P.extend({
  name: "iconfield",
  style: jn,
  classes: Nn
}), Bn = {
  name: "BaseIconField",
  extends: z,
  style: Rn,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, St = {
  name: "IconField",
  extends: Bn,
  inheritAttrs: !1
};
function En(t, n, e, o, r, i) {
  return u(), p("div", c({
    class: t.cx("root")
  }, t.ptmi("root")), [b(t.$slots, "default")], 16);
}
St.render = En;
var Tn = {
  root: "p-inputicon"
}, On = P.extend({
  name: "inputicon",
  classes: Tn
}), Ln = {
  name: "BaseInputIcon",
  extends: z,
  style: On,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, xt = {
  name: "InputIcon",
  extends: Ln,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Fn(t, n, e, o, r, i) {
  return u(), p("span", c({
    class: i.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [b(t.$slots, "default")], 16);
}
xt.render = Fn;
var Dn = `
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
`, Un = {
  root: function(n) {
    var e = n.props;
    return ["p-tag p-component", {
      "p-tag-info": e.severity === "info",
      "p-tag-success": e.severity === "success",
      "p-tag-warn": e.severity === "warn",
      "p-tag-danger": e.severity === "danger",
      "p-tag-secondary": e.severity === "secondary",
      "p-tag-contrast": e.severity === "contrast",
      "p-tag-rounded": e.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, Wn = P.extend({
  name: "tag",
  style: Dn,
  classes: Un
}), Mn = {
  name: "BaseTag",
  extends: z,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Wn,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function F(t) {
  "@babel/helpers - typeof";
  return F = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, F(t);
}
function qn(t, n, e) {
  return (n = Vn(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Vn(t) {
  var n = Kn(t, "string");
  return F(n) == "symbol" ? n : n + "";
}
function Kn(t, n) {
  if (F(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (F(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Hn = {
  name: "Tag",
  extends: Mn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return I(qn({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Jn = ["data-p"];
function Yn(t, n, e, o, r, i) {
  return u(), p("span", c({
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [t.$slots.icon ? (u(), $(X(t.$slots.icon), c({
    key: 0,
    class: t.cx("icon")
  }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (u(), p("span", c({
    key: 1,
    class: [t.cx("icon"), t.icon]
  }, t.ptm("icon")), null, 16)) : S("", !0), t.value != null || t.$slots.default ? b(t.$slots, "default", {
    key: 2
  }, function() {
    return [g("span", c({
      class: t.cx("label")
    }, t.ptm("label")), _(t.value), 17)];
  }) : S("", !0)], 16, Jn);
}
Hn.render = Yn;
var $t = {
  name: "PlusIcon",
  extends: Q
};
function Gn(t) {
  return te(t) || Xn(t) || Qn(t) || Zn();
}
function Zn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Qn(t, n) {
  if (t) {
    if (typeof t == "string") return Y(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? Y(t, n) : void 0;
  }
}
function Xn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function te(t) {
  if (Array.isArray(t)) return Y(t);
}
function Y(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function ne(t, n, e, o, r, i) {
  return u(), p("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Gn(n[0] || (n[0] = [g("path", {
    d: "M7.67742 6.32258V0.677419C7.67742 0.497757 7.60605 0.325452 7.47901 0.198411C7.35197 0.0713707 7.17966 0 7 0C6.82034 0 6.64803 0.0713707 6.52099 0.198411C6.39395 0.325452 6.32258 0.497757 6.32258 0.677419V6.32258H0.677419C0.497757 6.32258 0.325452 6.39395 0.198411 6.52099C0.0713707 6.64803 0 6.82034 0 7C0 7.17966 0.0713707 7.35197 0.198411 7.47901C0.325452 7.60605 0.497757 7.67742 0.677419 7.67742H6.32258V13.3226C6.32492 13.5015 6.39704 13.6725 6.52358 13.799C6.65012 13.9255 6.82106 13.9977 7 14C7.17966 14 7.35197 13.9286 7.47901 13.8016C7.60605 13.6745 7.67742 13.5022 7.67742 13.3226V7.67742H13.3226C13.5022 7.67742 13.6745 7.60605 13.8016 7.47901C13.9286 7.35197 14 7.17966 14 7C13.9977 6.82106 13.9255 6.65012 13.799 6.52358C13.6725 6.39704 13.5015 6.32492 13.3226 6.32258H7.67742Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
$t.render = ne;
function mo(t) {
  return t === "flow";
}
function vo(t) {
  return t === "for_each";
}
const ee = { id: "failed", label: "Failed" }, oe = {
  type: "object",
  required: ["code", "message"],
  additionalProperties: !1,
  properties: {
    code: { type: "string" },
    message: { type: "string" }
  }
};
function re(t) {
  return t === ee.id;
}
const at = {
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
}, ie = {
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
function ko(t) {
  return ie[t] || "wf-hue--violet";
}
const wo = {
  start: "input_schema",
  finish: "output_schema",
  error: "error_schema"
};
function _o(t) {
  return t === "start" || t === "finish" || t === "error";
}
const So = ["Structure", "Blocks", "Workflows", "Logic", "Notes"], ae = {
  amber: "--wf-amber",
  violet: "--wf-violet",
  blue: "--wf-blue",
  teal: "--wf-teal",
  rose: "--wf-rose",
  emerald: "--p-success-500",
  green: "--p-success-500",
  red: "--wf-danger"
};
function se(t) {
  return t && ae[t] || "--wf-violet";
}
const N = {}, C = {};
function xo(t) {
  for (const n of Object.keys(C)) delete C[n];
  for (const n of Object.keys(N)) delete N[n];
  for (const n of t)
    !n || !n.id || (C[n.id] = n, N[n.id] = {
      kind: "block",
      label: n.label || n.id,
      hueVar: se(n.hue),
      icon: n.icon || "tabler:puzzle",
      category: n.category || "Blocks",
      waits: n.waits === !0,
      blurb: n.blurb || "",
      outPorts: n.ports?.length ? n.ports.map((e) => ({ id: e.id, label: e.label })) : void 0
    });
}
function $o(t) {
  return t ? C[t]?.config_schema : void 0;
}
function Co(t) {
  return t ? C[t]?.config_wc : void 0;
}
function Ao(t) {
  const n = t ? C[t] : void 0;
  return n?.tool === !0 || n?.source_kind === "tool";
}
function de(t, n) {
  if (!(!t || !n))
    return C[t]?.ports?.find((e) => e.id === n)?.schema;
}
function Ct(t, n) {
  return t === "block" && n && N[n] ? N[n] : at[t] || at.block;
}
function le(t, n) {
  return Ct(t, n).waits === !0;
}
function Io(t, n) {
  const e = t === "block" && n ? C[n] : void 0;
  if (e?.ports?.length) {
    const o = e.ports.filter((r) => !r.direction || r.direction === "out");
    return o.length ? o.map(({ id: r, label: i }) => ({ id: r, label: i })) : [{ id: "", label: "" }];
  }
  return Ct(t, n).outPorts || [{ id: "", label: "" }];
}
function G(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : null;
}
function x(t) {
  if (typeof t == "string") {
    const n = t.trim();
    if (!n) return null;
    try {
      return G(JSON.parse(n));
    } catch {
      return null;
    }
  }
  return G(t);
}
function Po(t, n) {
  if (t === n) return !0;
  const e = /* @__PURE__ */ new Set(["number", "integer"]);
  return e.has(t) && e.has(n) ? !0 : t === "any" || n === "any";
}
function ue(t) {
  const n = t.type;
  return typeof n == "string" && n ? n : Array.isArray(n) && typeof n[0] == "string" ? n[0] : t.properties && typeof t.properties == "object" ? "object" : "schema";
}
function st(t) {
  const n = x(t);
  if (!n) return "No schema";
  const e = ue(n), o = G(n.properties) || {}, r = Object.keys(o);
  if (!r.length) return e;
  const i = r.slice(0, 3).join(", ");
  return `${e}: ${i}${r.length > 3 ? ` +${r.length - 3}` : ""}`;
}
function ce(t) {
  if (t)
    return t.kind === "start" ? t.config?.input_schema ?? t.output_schema : t.output_schema;
}
function pe(t, n) {
  if (t)
    return t.kind === "finish" ? t.config?.output_schema ?? t.input_schema : t.kind === "error" ? t.config?.error_schema ?? t.input_schema : t.input_schema;
}
function zo(t, n) {
  return !t || n != null ? !1 : t.kind === "block" || t.kind === "flow";
}
function be(t, n, e = /* @__PURE__ */ new Set()) {
  const o = t.nodes[n.source_id], r = de(o?.ref, n.source_port);
  if (r != null) return r;
  if (re(n.source_port)) return oe;
  if (o?.kind === "branch") {
    if (e.has(o.id)) return;
    e.add(o.id);
    const i = Object.values(t.edges).find((a) => a.target_id === o.id);
    return i ? be(t, i, e) : void 0;
  }
  return ce(o);
}
function jo(t, n) {
  if (!n || n.kind !== "finish") return null;
  const e = x(pe(n)), o = e?.properties && typeof e.properties == "object" && !Array.isArray(e.properties) ? e.properties : {};
  if (!e || e.type !== "object" || Object.keys(o).length > 0) return null;
  const r = x(t);
  if (!r) return null;
  const i = r.properties && typeof r.properties == "object" && !Array.isArray(r.properties) ? r.properties : {};
  return r.type !== "object" || Object.keys(i).length > 0 ? r : null;
}
function No(t, n) {
  const e = new Map(n.filter((i) => !!i.ref).map((i) => [`${i.kind}:${i.ref}`, i])), o = new Map(n.filter((i) => !i.ref).map((i) => [String(i.kind), i]));
  let r = 0;
  for (const i of Object.values(t)) {
    const a = (i.ref ? e.get(`${i.kind}:${i.ref}`) : void 0) || o.get(String(i.kind));
    if (!a) continue;
    let d = !1;
    for (const s of ["input_schema", "output_schema", "config_schema"])
      a[s] !== void 0 && i[s] !== a[s] && (i[s] = a[s], d = !0);
    a.icon && i.icon !== a.icon && (i.icon = a.icon, d = !0), d && r++;
  }
  return r;
}
const fe = /* @__PURE__ */ new Set(["completed", "failed", "cancelled", "canceled", "terminated"]);
function dt(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : {};
}
function Ro(t, n) {
  if (!n) return !1;
  const e = dt(t), o = dt(e.data), r = Object.keys(o).length ? o : e, i = String(r.thread_id || e.thread_id || ""), a = String(e.topic || r.topic || "");
  return String(r.event_type || e.event_type || "") === "events.appended" && (i === n || !i && a === `kickside.thread.${n}`);
}
function ge(t) {
  return !fe.has(t.toLowerCase());
}
function he(t) {
  const n = t.toLowerCase();
  return n === "completed" || n === "complete" || n === "done" || n === "success" || n === "succeeded" ? "completed" : n === "failed" || n === "error" || n === "cancelled" || n === "canceled" || n === "terminated" ? "failed" : n === "running" || n === "active" || n === "executing" || n === "started" ? "running" : n === "pending" || n === "queued" || n === "waiting" || n === "blocked" || n === "ready" ? "pending" : "idle";
}
function Bo(t, n, e, o = !1) {
  const r = e.toLowerCase(), i = ge(r), a = {};
  for (const s of Object.keys(t.nodes)) a[s] = "idle";
  for (const s of n) {
    if (!s.def_node_id || !(s.def_node_id in t.nodes)) continue;
    let l = he(s.status);
    i && le(t.nodes[s.def_node_id].kind, t.nodes[s.def_node_id].ref) && (l === "running" || l === "pending") && (l = "awaiting"), a[s.def_node_id] = l;
  }
  for (const s of Object.values(t.nodes))
    s.kind === "start" && e ? a[s.id] = "completed" : s.kind === "finish" ? r === "completed" ? a[s.id] = "completed" : i && (a[s.id] = "pending") : s.kind === "error" && r === "failed" && o && (a[s.id] = "failed");
  const d = {};
  for (const s of Object.values(t.edges)) {
    const l = a[s.source_id] || "idle", f = a[s.target_id] || "idle";
    l === "completed" && (f === "completed" || f === "failed") || l === "failed" && f === "failed" ? d[s.id] = "done" : l === "completed" && (f === "running" || f === "pending" || f === "awaiting") ? d[s.id] = "active" : d[s.id] = "idle";
  }
  return { active: i, node: a, edge: d };
}
function Eo() {
  return { active: !1, node: {}, edge: {} };
}
function To(t) {
  return Object.values(t.nodes).find((n) => n.kind === "start")?.id || "";
}
var At = {
  name: "MinusIcon",
  extends: Q
};
function ye(t) {
  return we(t) || ke(t) || ve(t) || me();
}
function me() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ve(t, n) {
  if (t) {
    if (typeof t == "string") return Z(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? Z(t, n) : void 0;
  }
}
function ke(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function we(t) {
  if (Array.isArray(t)) return Z(t);
}
function Z(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function _e(t, n, e, o, r, i) {
  return u(), p("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ye(n[0] || (n[0] = [g("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
At.render = _e;
var Se = `
    .p-panel {
        display: block;
        border: 1px solid dt('panel.border.color');
        border-radius: dt('panel.border.radius');
        background: dt('panel.background');
        color: dt('panel.color');
    }

    .p-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: dt('panel.header.padding');
        background: dt('panel.header.background');
        color: dt('panel.header.color');
        border-style: solid;
        border-width: dt('panel.header.border.width');
        border-color: dt('panel.header.border.color');
        border-radius: dt('panel.header.border.radius');
    }

    .p-panel-toggleable .p-panel-header {
        padding: dt('panel.toggleable.header.padding');
    }

    .p-panel-title {
        line-height: 1;
        font-weight: dt('panel.title.font.weight');
    }

    .p-panel-content-container {
        display: grid;
        grid-template-rows: 1fr;
    }

    .p-panel-content-wrapper {
        min-height: 0;
    }

    .p-panel-content {
        padding: dt('panel.content.padding');
    }

    .p-panel-footer {
        padding: dt('panel.footer.padding');
    }
`, xe = {
  root: function(n) {
    var e = n.props;
    return ["p-panel p-component", {
      "p-panel-toggleable": e.toggleable
    }];
  },
  header: "p-panel-header",
  title: "p-panel-title",
  headerActions: "p-panel-header-actions",
  pcToggleButton: "p-panel-toggle-button",
  contentContainer: "p-panel-content-container",
  contentWrapper: "p-panel-content-wrapper",
  content: "p-panel-content",
  footer: "p-panel-footer"
}, $e = P.extend({
  name: "panel",
  style: Se,
  classes: xe
}), Ce = {
  name: "BasePanel",
  extends: z,
  props: {
    header: String,
    toggleable: Boolean,
    collapsed: Boolean,
    toggleButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    }
  },
  style: $e,
  provide: function() {
    return {
      $pcPanel: this,
      $parentInstance: this
    };
  }
}, It = {
  name: "Panel",
  extends: Ce,
  inheritAttrs: !1,
  emits: ["update:collapsed", "toggle"],
  data: function() {
    return {
      d_collapsed: this.collapsed
    };
  },
  watch: {
    collapsed: function(n) {
      this.d_collapsed = n;
    }
  },
  methods: {
    toggle: function(n) {
      this.d_collapsed = !this.d_collapsed, this.$emit("update:collapsed", this.d_collapsed), this.$emit("toggle", {
        originalEvent: n,
        value: this.d_collapsed
      });
    },
    onKeyDown: function(n) {
      (n.code === "Enter" || n.code === "NumpadEnter" || n.code === "Space") && (this.toggle(n), n.preventDefault());
    }
  },
  computed: {
    buttonAriaLabel: function() {
      return this.toggleButtonProps && this.toggleButtonProps.ariaLabel ? this.toggleButtonProps.ariaLabel : this.header;
    },
    dataP: function() {
      return I({
        toggleable: this.toggleable
      });
    }
  },
  components: {
    PlusIcon: $t,
    MinusIcon: At,
    Button: T
  },
  directives: {
    ripple: ct
  }
}, Ae = ["data-p"], Ie = ["data-p"], Pe = ["id"], ze = ["id", "aria-labelledby"];
function je(t, n, e, o, r, i) {
  var a = H("Button");
  return u(), p("div", c({
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [g("div", c({
    class: t.cx("header"),
    "data-p": i.dataP
  }, t.ptm("header")), [b(t.$slots, "header", {
    id: t.$id + "_header",
    class: w(t.cx("title")),
    collapsed: r.d_collapsed
  }, function() {
    return [t.header ? (u(), p("span", c({
      key: 0,
      id: t.$id + "_header",
      class: t.cx("title")
    }, t.ptm("title")), _(t.header), 17, Pe)) : S("", !0)];
  }), g("div", c({
    class: t.cx("headerActions")
  }, t.ptm("headerActions")), [b(t.$slots, "icons"), t.toggleable ? b(t.$slots, "togglebutton", {
    key: 0,
    collapsed: r.d_collapsed,
    toggleCallback: function(s) {
      return i.toggle(s);
    },
    keydownCallback: function(s) {
      return i.onKeyDown(s);
    }
  }, function() {
    return [v(a, c({
      id: t.$id + "_header",
      class: t.cx("pcToggleButton"),
      "aria-label": i.buttonAriaLabel,
      "aria-controls": t.$id + "_content",
      "aria-expanded": !r.d_collapsed,
      unstyled: t.unstyled,
      onClick: n[0] || (n[0] = function(d) {
        return i.toggle(d);
      }),
      onKeydown: n[1] || (n[1] = function(d) {
        return i.onKeyDown(d);
      })
    }, t.toggleButtonProps, {
      pt: t.ptm("pcToggleButton")
    }), {
      icon: m(function(d) {
        return [b(t.$slots, t.$slots.toggleicon ? "toggleicon" : "togglericon", {
          collapsed: r.d_collapsed
        }, function() {
          return [(u(), $(X(r.d_collapsed ? "PlusIcon" : "MinusIcon"), c({
            class: d.class
          }, t.ptm("pcToggleButton").icon), null, 16, ["class"]))];
        })];
      }),
      _: 3
    }, 16, ["id", "class", "aria-label", "aria-controls", "aria-expanded", "unstyled", "pt"])];
  }) : S("", !0)], 16)], 16, Ie), v(Rt, c({
    name: "p-collapsible"
  }, t.ptm("transition")), {
    default: m(function() {
      return [bt(g("div", c({
        id: t.$id + "_content",
        class: t.cx("contentContainer"),
        role: "region",
        "aria-labelledby": t.$id + "_header"
      }, t.ptm("contentContainer")), [g("div", c({
        class: t.cx("contentWrapper")
      }, t.ptm("contentWrapper")), [g("div", c({
        class: t.cx("content")
      }, t.ptm("content")), [b(t.$slots, "default")], 16), t.$slots.footer ? (u(), p("div", c({
        key: 0,
        class: t.cx("footer")
      }, t.ptm("footer")), [b(t.$slots, "footer")], 16)) : S("", !0)], 16)], 16, ze), [[Bt, !r.d_collapsed]])];
    }),
    _: 3
  }, 16)], 16, Ae);
}
It.render = je;
const Ne = { class: "wf-payload-title" }, Re = ["source"], Be = { class: "wf-run-output wf-mono" }, Oo = /* @__PURE__ */ ft({
  __name: "RunPayload",
  props: {
    value: {},
    label: {},
    icon: { default: "tabler:code" },
    open: { type: Boolean, default: !0 },
    maxLines: { default: 40 }
  },
  setup(t) {
    const n = t, e = U(() => typeof n.value == "string"), o = U(() => Pn(n.value)), r = U(() => zn(o.value, n.maxLines)), i = W(!n.open), a = W(!1), d = W(!1);
    async function s() {
      try {
        await navigator.clipboard.writeText(o.value), d.value = !0, setTimeout(() => {
          d.value = !1;
        }, 1400);
      } catch {
      }
    }
    return (l, f) => (u(), $(y(It), {
      collapsed: i.value,
      "onUpdate:collapsed": f[1] || (f[1] = (nt) => i.value = nt),
      class: "wf-payload",
      toggleable: ""
    }, {
      header: m(() => [
        g("span", Ne, [
          v(y(M), {
            icon: t.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          g("span", null, _(t.label), 1)
        ])
      ]),
      icons: m(() => [
        v(y(T), {
          class: "wf-payload-copy",
          severity: "secondary",
          outlined: "",
          size: "small",
          title: d.value ? "Copied" : "Copy to clipboard",
          onClick: s
        }, {
          default: m(() => [
            v(y(M), {
              icon: d.value ? "tabler:check" : "tabler:copy",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            g("span", null, _(d.value ? "Copied" : "Copy"), 1)
          ]),
          _: 1
        }, 8, ["title"])
      ]),
      default: m(() => [
        e.value ? (u(), p("wc-render-markdown", {
          key: 0,
          class: "wf-run-md",
          source: String(t.value)
        }, null, 8, Re)) : (u(), p(gt, { key: 1 }, [
          g("pre", Be, _(a.value || !r.value.truncated ? o.value : r.value.preview), 1),
          r.value.truncated ? (u(), $(y(T), {
            key: 0,
            class: "wf-payload-more",
            severity: "secondary",
            outlined: "",
            size: "small",
            onClick: f[0] || (f[0] = (nt) => a.value = !a.value)
          }, {
            default: m(() => [
              v(y(M), {
                icon: a.value ? "tabler:chevrons-up" : "tabler:chevrons-down",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              g("span", null, _(a.value ? "Show less" : `Show ${r.value.hiddenLines} more lines`), 1)
            ]),
            _: 1
          })) : S("", !0)
        ], 64))
      ]),
      _: 1
    }, 8, ["collapsed"]));
  }
});
function Ee(t) {
  return !!(t && typeof t.picker == "string" && t.picker && t.picker !== "wc-schema-form");
}
function Pt(t) {
  return t?.config_schema;
}
function Te(t, n = "ports") {
  const e = Pt(t);
  if (!e) return null;
  const o = [];
  for (const [l, f] of Object.entries(e))
    Ee(f) && o.push([l, f]);
  if (o.length === 0) return null;
  o.length > 1 && console.error(`${n}: port schema declares multiple picker fields`, o.map(([l]) => l));
  const [r, i] = o[0], a = typeof i.title == "string" ? i.title : "", d = typeof i.detail == "string" ? i.detail : "", s = typeof i.delete_endpoint == "string" ? i.delete_endpoint : "";
  return { key: r, tag: i.picker ?? "", title: a, schema: { properties: { [r]: i } }, detail: d, deleteEndpoint: s };
}
function Lo(t, n = "ports") {
  const e = Pt(t);
  if (!e) return null;
  const o = Te(t, n)?.key, r = {};
  for (const [i, a] of Object.entries(e))
    i !== o && (r[i] = a);
  return Object.keys(r).length ? { type: "object", properties: r } : null;
}
function Oe(t) {
  if (!t) return null;
  if (typeof t == "string")
    try {
      return JSON.parse(t);
    } catch {
      return null;
    }
  return t;
}
function Fo(t) {
  const n = Oe(t);
  return !!(n && n.properties && Object.keys(n.properties).length);
}
function Do(t) {
  const n = t;
  return Number(n?.response?.status ?? n?.status ?? 0);
}
function lt(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : {};
}
function Le(t) {
  return [...t].sort((n, e) => e.version - n.version)[0] || null;
}
function Fe(t) {
  const n = lt(t.params), e = lt(n.interface), o = x(n.input_schema) || x(e.input_schema), r = x(n.output_schema) || x(e.output_schema);
  return o && r ? { input_schema: o, output_schema: r } : null;
}
function De(t) {
  const n = t.published_interface || t.interface;
  if (!n) return null;
  const e = x(n.input_schema), o = x(n.output_schema);
  return e && o ? { input_schema: e, output_schema: o } : null;
}
function Uo(t, n, e, o) {
  const r = Le(e), i = De(t) || Fe(n), a = t.published_version || r?.version, d = !!i, s = t.has_draft_changes === !0;
  return {
    ...t,
    is_current: t.id === o,
    callable: d,
    published_version: a,
    has_draft_changes: s,
    input_schema: i?.input_schema,
    output_schema: i?.output_schema,
    input_summary: st(i?.input_schema),
    output_summary: st(i?.output_schema),
    trigger_label: "Declared input",
    leaf_count: i ? 1 : 0
  };
}
const Wo = /* @__PURE__ */ ft({
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
    const e = t, o = n, r = W(""), i = U(() => {
      const d = r.value.trim().toLowerCase();
      return d ? e.rows.filter((s) => e.matches(s, d)) : e.rows;
    });
    function a(d) {
      return e.isEmphasized?.(d) === !0;
    }
    return (d, s) => (u(), p("div", {
      class: w(t.rootClass)
    }, [
      v(y(St), {
        class: w(["wf-search", t.searchClass])
      }, {
        default: m(() => [
          v(y(xt), null, {
            default: m(() => [
              v(y(M), {
                icon: "tabler:search",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          }),
          v(y(Tt), {
            modelValue: r.value,
            "onUpdate:modelValue": s[0] || (s[0] = (l) => r.value = l),
            placeholder: t.placeholder,
            "aria-label": t.placeholder
          }, null, 8, ["modelValue", "placeholder", "aria-label"])
        ]),
        _: 1
      }, 8, ["class"]),
      b(d.$slots, "before-list"),
      t.loading ? (u(), p("div", {
        key: 0,
        class: w(t.noteClass)
      }, [
        v(y(Ot), {
          class: "wf-status-spinner",
          "stroke-width": "4",
          "aria-label": "Loading Workflows"
        }),
        s[1] || (s[1] = g("span", null, "Loading Workflows…", -1))
      ], 2)) : t.error ? (u(), $(y(jt), {
        key: 1,
        class: w(t.errorClass),
        severity: "error",
        closable: !1
      }, {
        default: m(() => [
          pt(_(t.error), 1)
        ]),
        _: 1
      }, 8, ["class"])) : (u(), p("div", {
        key: 2,
        class: w(t.listClass)
      }, [
        (u(!0), p(gt, null, Et(i.value, (l) => (u(), $(y(T), {
          key: l.id,
          type: "button",
          class: w([t.rowClass, t.rowExtraClass?.(l)]),
          severity: a(l) ? void 0 : "secondary",
          text: t.quietRows === !0,
          outlined: t.quietRows !== !0 && !a(l),
          disabled: t.isDisabled?.(l),
          onClick: (f) => o("select", l)
        }, {
          default: m(() => [
            b(d.$slots, "row", { item: l })
          ]),
          _: 2
        }, 1032, ["class", "severity", "text", "outlined", "disabled", "onClick"]))), 128)),
        i.value.length ? S("", !0) : (u(), p("p", {
          key: 0,
          class: w(t.emptyClass)
        }, _(t.rows.length ? "No matching Workflows." : t.emptyMessage), 3))
      ], 2))
    ], 2));
  }
}), Mo = ":host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}";
export {
  Pn as $,
  Io as A,
  vo as B,
  mo as C,
  Ct as D,
  _o as E,
  ee as F,
  re as G,
  be as H,
  pe as I,
  zo as J,
  st as K,
  jo as L,
  Ro as M,
  To as N,
  eo as O,
  ge as P,
  Bo as Q,
  ao as R,
  no as S,
  Eo as T,
  oe as U,
  ce as V,
  Cn as W,
  at as X,
  xo as Y,
  So as Z,
  It as _,
  mt as a,
  oo as a0,
  lo as a1,
  yo as a2,
  co as a3,
  ho as a4,
  Oo as a5,
  io as a6,
  uo as a7,
  ro as a8,
  fo as a9,
  Wo as aa,
  Uo as ab,
  Do as ac,
  wn as ad,
  Oe as ae,
  Ao as af,
  $o as ag,
  Co as ah,
  Te as ai,
  Lo as aj,
  wo as ak,
  Xe as al,
  to as am,
  Ze as an,
  No as ao,
  Mo as ap,
  wt as aq,
  Fo as ar,
  so as as,
  rt as b,
  un as c,
  _t as d,
  bo as e,
  po as f,
  A as g,
  cn as h,
  ht as i,
  St as j,
  xt as k,
  Hn as l,
  He as m,
  pn as n,
  $t as o,
  D as p,
  yt as q,
  go as r,
  T as s,
  Ge as t,
  Qe as u,
  Ye as v,
  Je as w,
  ko as x,
  x as y,
  Po as z
};
