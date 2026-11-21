import { s as wt, B as _t, a as Qt, b as tn, c as Ut, f as at, R as nn, L as fn, d as J, v as rt, e as mn, U as gn, I as Kt, g as hn, r as en, h as vn, i as yn, j as kn, C as xn, k as Cn, S as wn, _ as _n, x as Bt, m as Sn, u as $n, P as Ln } from "./wc-runtime-D7LwCPSS.js";
import { openBlock as c, createElementBlock as b, mergeProps as w, createElementVNode as i, renderSlot as O, createTextVNode as B, toDisplayString as h, resolveComponent as Ct, resolveDirective as on, withDirectives as Q, createBlock as Z, resolveDynamicComponent as Ot, withCtx as C, createCommentVNode as E, normalizeClass as S, computed as M, createVNode as u, Transition as zn, Fragment as W, ref as z, defineComponent as En, unref as r, vModelText as yt, renderList as kt, withModifiers as Dn, isRef as An, withKeys as Pn } from "vue";
import { Icon as m } from "@iconify/vue";
import { api as ct, host as V } from "@wippy-fe/proxy";
var rn = {
  name: "SpinnerIcon",
  extends: wt
};
function In(t) {
  return jn(t) || Mn(t) || On(t) || Bn();
}
function Bn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function On(t, n) {
  if (t) {
    if (typeof t == "string") return Mt(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? Mt(t, n) : void 0;
  }
}
function Mn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function jn(t) {
  if (Array.isArray(t)) return Mt(t);
}
function Mt(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function Tn(t, n, e, o, d, s) {
  return c(), b("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), In(n[0] || (n[0] = [i("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
rn.render = Tn;
var Fn = `
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
`, Rn = {
  root: function(n) {
    var e = n.props, o = n.instance;
    return ["p-badge p-component", {
      "p-badge-circle": tn(e.value) && String(e.value).length === 1,
      "p-badge-dot": Qt(e.value) && !o.$slots.default,
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
}, Un = _t.extend({
  name: "badge",
  style: Fn,
  classes: Rn
}), Hn = {
  name: "BaseBadge",
  extends: Ut,
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
  style: Un,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function it(t) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, it(t);
}
function Wt(t, n, e) {
  return (n = Vn(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Vn(t) {
  var n = Nn(t, "string");
  return it(n) == "symbol" ? n : n + "";
}
function Nn(t, n) {
  if (it(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (it(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var an = {
  name: "Badge",
  extends: Hn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return at(Wt(Wt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Kn = ["data-p"];
function Wn(t, n, e, o, d, s) {
  return c(), b("span", w({
    class: t.cx("root"),
    "data-p": s.dataP
  }, t.ptmi("root")), [O(t.$slots, "default", {}, function() {
    return [B(h(t.value), 1)];
  })], 16, Kn);
}
an.render = Wn;
var Zn = `
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
function lt(t) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, lt(t);
}
function F(t, n, e) {
  return (n = Yn(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Yn(t) {
  var n = Xn(t, "string");
  return lt(n) == "symbol" ? n : n + "";
}
function Xn(t, n) {
  if (lt(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (lt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Gn = {
  root: function(n) {
    var e = n.instance, o = n.props;
    return ["p-button p-component", F(F(F(F(F(F(F(F(F({
      "p-button-icon-only": e.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", e.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(n) {
    var e = n.props;
    return ["p-button-icon", F({}, "p-button-icon-".concat(e.iconPos), e.label)];
  },
  label: "p-button-label"
}, qn = _t.extend({
  name: "button",
  style: Zn,
  classes: Gn
}), Jn = {
  name: "BaseButton",
  extends: Ut,
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
  style: qn,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function st(t) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, st(t);
}
function I(t, n, e) {
  return (n = Qn(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Qn(t) {
  var n = te(t, "string");
  return st(n) == "symbol" ? n : n + "";
}
function te(t, n) {
  if (st(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (st(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var L = {
  name: "Button",
  extends: Jn,
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
      return Qt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return at(I(I(I(I(I(I(I(I(I(I({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return at(I(I({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return at(I(I({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: rn,
    Badge: an
  },
  directives: {
    ripple: nn
  }
}, ne = ["data-p"], ee = ["data-p"];
function oe(t, n, e, o, d, s) {
  var k = Ct("SpinnerIcon"), v = Ct("Badge"), g = on("ripple");
  return t.asChild ? O(t.$slots, "default", {
    key: 1,
    class: S(t.cx("root")),
    a11yAttrs: s.a11yAttrs
  }) : Q((c(), Z(Ot(t.as), w({
    key: 0,
    class: t.cx("root"),
    "data-p": s.dataP
  }, s.attrs), {
    default: C(function() {
      return [O(t.$slots, "default", {}, function() {
        return [t.loading ? O(t.$slots, "loadingicon", w({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (c(), b("span", w({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (c(), Z(k, w({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : O(t.$slots, "icon", w({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (c(), b("span", w({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": s.dataIconP
          }, t.ptm("icon")), null, 16, ne)) : E("", !0)];
        }), t.label ? (c(), b("span", w({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": s.dataLabelP
        }), h(t.label), 17, ee)) : E("", !0), t.badge ? (c(), Z(v, {
          key: 3,
          value: t.badge,
          class: S(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : E("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[g]]);
}
L.render = oe;
var ln = {
  name: "TimesIcon",
  extends: wt
};
function re(t) {
  return se(t) || le(t) || ie(t) || ae();
}
function ae() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ie(t, n) {
  if (t) {
    if (typeof t == "string") return jt(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? jt(t, n) : void 0;
  }
}
function le(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function se(t) {
  if (Array.isArray(t)) return jt(t);
}
function jt(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function de(t, n, e, o, d, s) {
  return c(), b("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), re(n[0] || (n[0] = [i("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ln.render = de;
var sn = {
  name: "WindowMaximizeIcon",
  extends: wt
};
function ue(t) {
  return fe(t) || pe(t) || be(t) || ce();
}
function ce() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function be(t, n) {
  if (t) {
    if (typeof t == "string") return Tt(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? Tt(t, n) : void 0;
  }
}
function pe(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function fe(t) {
  if (Array.isArray(t)) return Tt(t);
}
function Tt(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function me(t, n, e, o, d, s) {
  return c(), b("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ue(n[0] || (n[0] = [i("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
sn.render = me;
var dn = {
  name: "WindowMinimizeIcon",
  extends: wt
};
function ge(t) {
  return ke(t) || ye(t) || ve(t) || he();
}
function he() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ve(t, n) {
  if (t) {
    if (typeof t == "string") return Ft(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? Ft(t, n) : void 0;
  }
}
function ye(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ke(t) {
  if (Array.isArray(t)) return Ft(t);
}
function Ft(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function xe(t, n, e, o, d, s) {
  return c(), b("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ge(n[0] || (n[0] = [i("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
dn.render = xe;
var Ce = _t.extend({
  name: "focustrap-directive"
}), we = mn.extend({
  style: Ce
});
function dt(t) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, dt(t);
}
function Zt(t, n) {
  var e = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    n && (o = o.filter(function(d) {
      return Object.getOwnPropertyDescriptor(t, d).enumerable;
    })), e.push.apply(e, o);
  }
  return e;
}
function Yt(t) {
  for (var n = 1; n < arguments.length; n++) {
    var e = arguments[n] != null ? arguments[n] : {};
    n % 2 ? Zt(Object(e), !0).forEach(function(o) {
      _e(t, o, e[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(e)) : Zt(Object(e)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(e, o));
    });
  }
  return t;
}
function _e(t, n, e) {
  return (n = Se(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Se(t) {
  var n = $e(t, "string");
  return dt(n) == "symbol" ? n : n + "";
}
function $e(t, n) {
  if (dt(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (dt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Le = we.extend("focustrap", {
  mounted: function(n, e) {
    var o = e.value || {}, d = o.disabled;
    d || (this.createHiddenFocusableElements(n, e), this.bind(n, e), this.autoElementFocus(n, e)), n.setAttribute("data-pd-focustrap", !0), this.$el = n;
  },
  updated: function(n, e) {
    var o = e.value || {}, d = o.disabled;
    d && this.unbind(n);
  },
  unmounted: function(n) {
    this.unbind(n);
  },
  methods: {
    getComputedSelector: function(n) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(n ?? "");
    },
    bind: function(n, e) {
      var o = this, d = e.value || {}, s = d.onFocusIn, k = d.onFocusOut;
      n.$_pfocustrap_mutationobserver = new MutationObserver(function(v) {
        v.forEach(function(g) {
          if (g.type === "childList" && !n.contains(document.activeElement)) {
            var p = function(_) {
              var D = Kt(_) ? Kt(_, o.getComputedSelector(n.$_pfocustrap_focusableselector)) ? _ : rt(n, o.getComputedSelector(n.$_pfocustrap_focusableselector)) : rt(_);
              return tn(D) ? D : _.nextSibling && p(_.nextSibling);
            };
            J(p(g.nextSibling));
          }
        });
      }), n.$_pfocustrap_mutationobserver.disconnect(), n.$_pfocustrap_mutationobserver.observe(n, {
        childList: !0
      }), n.$_pfocustrap_focusinlistener = function(v) {
        return s && s(v);
      }, n.$_pfocustrap_focusoutlistener = function(v) {
        return k && k(v);
      }, n.addEventListener("focusin", n.$_pfocustrap_focusinlistener), n.addEventListener("focusout", n.$_pfocustrap_focusoutlistener);
    },
    unbind: function(n) {
      n.$_pfocustrap_mutationobserver && n.$_pfocustrap_mutationobserver.disconnect(), n.$_pfocustrap_focusinlistener && n.removeEventListener("focusin", n.$_pfocustrap_focusinlistener) && (n.$_pfocustrap_focusinlistener = null), n.$_pfocustrap_focusoutlistener && n.removeEventListener("focusout", n.$_pfocustrap_focusoutlistener) && (n.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(n) {
      this.autoElementFocus(this.$el, {
        value: Yt(Yt({}, n), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(n, e) {
      var o = e.value || {}, d = o.autoFocusSelector, s = d === void 0 ? "" : d, k = o.firstFocusableSelector, v = k === void 0 ? "" : k, g = o.autoFocus, p = g === void 0 ? !1 : g, $ = rt(n, "[autofocus]".concat(this.getComputedSelector(s)));
      p && !$ && ($ = rt(n, this.getComputedSelector(v))), J($);
    },
    onFirstHiddenElementFocus: function(n) {
      var e, o = n.currentTarget, d = n.relatedTarget, s = d === o.$_pfocustrap_lasthiddenfocusableelement || !((e = this.$el) !== null && e !== void 0 && e.contains(d)) ? rt(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      J(s);
    },
    onLastHiddenElementFocus: function(n) {
      var e, o = n.currentTarget, d = n.relatedTarget, s = d === o.$_pfocustrap_firsthiddenfocusableelement || !((e = this.$el) !== null && e !== void 0 && e.contains(d)) ? fn(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      J(s);
    },
    createHiddenFocusableElements: function(n, e) {
      var o = this, d = e.value || {}, s = d.tabIndex, k = s === void 0 ? 0 : s, v = d.firstFocusableSelector, g = v === void 0 ? "" : v, p = d.lastFocusableSelector, $ = p === void 0 ? "" : p, _ = function(T) {
        return gn("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: k,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: T?.bind(o)
        });
      }, D = _(this.onFirstHiddenElementFocus), P = _(this.onLastHiddenElementFocus);
      D.$_pfocustrap_lasthiddenfocusableelement = P, D.$_pfocustrap_focusableselector = g, D.setAttribute("data-pc-section", "firstfocusableelement"), P.$_pfocustrap_firsthiddenfocusableelement = D, P.$_pfocustrap_focusableselector = $, P.setAttribute("data-pc-section", "lastfocusableelement"), n.prepend(D), n.append(P);
    }
  }
});
function Xt() {
  vn({
    variableName: en("scrollbar.width").name
  });
}
function Gt() {
  hn({
    variableName: en("scrollbar.width").name
  });
}
var ze = `
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
`, Ee = {
  mask: function(n) {
    var e = n.position, o = n.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: e === "left" || e === "topleft" || e === "bottomleft" ? "flex-start" : e === "right" || e === "topright" || e === "bottomright" ? "flex-end" : "center",
      alignItems: e === "top" || e === "topleft" || e === "topright" ? "flex-start" : e === "bottom" || e === "bottomleft" || e === "bottomright" ? "flex-end" : "center",
      pointerEvents: o ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, De = {
  mask: function(n) {
    var e = n.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], d = o.find(function(s) {
      return s === e.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": e.modal
    }, d ? "p-dialog-".concat(d) : ""];
  },
  root: function(n) {
    var e = n.props, o = n.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": e.maximizable && o.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, Ae = _t.extend({
  name: "dialog",
  style: ze,
  classes: De,
  inlineStyles: Ee
}), Pe = {
  name: "BaseDialog",
  extends: Ut,
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
  style: Ae,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Rt = {
  name: "Dialog",
  extends: Pe,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var n = this;
    return {
      dialogRef: M(function() {
        return n._instance;
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && Bt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && Bt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Sn(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), J(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && Bt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(n) {
      this.maskMouseDownTarget = n.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var n = function(d) {
        return d && d.querySelector("[autofocus]");
      }, e = this.$slots.footer && n(this.footerContainer);
      e || (e = this.$slots.header && n(this.headerContainer), e || (e = this.$slots.default && n(this.content), e || (this.maximizable ? (this.focusableMax = !0, e = this.maximizableButton) : (this.focusableClose = !0, e = this.closeButton)))), e && J(e, {
        focusVisible: !0
      });
    },
    maximize: function(n) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", n)) : (this.maximized = !0, this.$emit("maximize", n)), this.modal || (this.maximized ? Xt() : Gt());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Xt();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Gt();
    },
    onKeyDown: function(n) {
      n.code === "Escape" && this.closeOnEscape && !n.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(n) {
      this.container = n;
    },
    maskRef: function(n) {
      this.mask = n;
    },
    contentRef: function(n) {
      this.content = n;
    },
    headerContainerRef: function(n) {
      this.headerContainer = n;
    },
    footerContainerRef: function(n) {
      this.footerContainer = n;
    },
    maximizableRef: function(n) {
      this.maximizableButton = n ? n.$el : void 0;
    },
    closeButtonRef: function(n) {
      this.closeButton = n ? n.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var n;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", _n(this.styleElement, "nonce", (n = this.$primevue) === null || n === void 0 || (n = n.config) === null || n === void 0 || (n = n.csp) === null || n === void 0 ? void 0 : n.nonce), document.head.appendChild(this.styleElement);
        var e = "";
        for (var o in this.breakpoints)
          e += `
                        @media screen and (max-width: `.concat(o, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[o], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = e;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(n) {
      n.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = n.pageX, this.lastPageY = n.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && wn(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", n));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var n = this;
      this.documentDragListener = function(e) {
        if (n.dragging) {
          var o = kn(n.container), d = xn(n.container), s = e.pageX - n.lastPageX, k = e.pageY - n.lastPageY, v = n.container.getBoundingClientRect(), g = v.left + s, p = v.top + k, $ = Cn(), _ = getComputedStyle(n.container), D = parseFloat(_.marginLeft), P = parseFloat(_.marginTop);
          n.container.style.position = "fixed", n.keepInViewport ? (g >= n.minX && g + o < $.width && (n.lastPageX = e.pageX, n.container.style.left = g - D + "px"), p >= n.minY && p + d < $.height && (n.lastPageY = e.pageY, n.container.style.top = p - P + "px")) : (n.lastPageX = e.pageX, n.container.style.left = g - D + "px", n.lastPageY = e.pageY, n.container.style.top = p - P + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var n = this;
      this.documentDragEndListener = function(e) {
        n.dragging && (n.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !n.isUnstyled && (document.body.style["user-select"] = ""), n.$emit("dragend", e));
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
      return at({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: nn,
    focustrap: Le
  },
  components: {
    Button: L,
    Portal: yn,
    WindowMinimizeIcon: dn,
    WindowMaximizeIcon: sn,
    TimesIcon: ln
  }
};
function ut(t) {
  "@babel/helpers - typeof";
  return ut = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, ut(t);
}
function qt(t, n) {
  var e = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    n && (o = o.filter(function(d) {
      return Object.getOwnPropertyDescriptor(t, d).enumerable;
    })), e.push.apply(e, o);
  }
  return e;
}
function Jt(t) {
  for (var n = 1; n < arguments.length; n++) {
    var e = arguments[n] != null ? arguments[n] : {};
    n % 2 ? qt(Object(e), !0).forEach(function(o) {
      Ie(t, o, e[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(e)) : qt(Object(e)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(e, o));
    });
  }
  return t;
}
function Ie(t, n, e) {
  return (n = Be(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Be(t) {
  var n = Oe(t, "string");
  return ut(n) == "symbol" ? n : n + "";
}
function Oe(t, n) {
  if (ut(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (ut(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Me = ["data-p"], je = ["aria-labelledby", "aria-modal", "data-p"], Te = ["id"], Fe = ["data-p"];
function Re(t, n, e, o, d, s) {
  var k = Ct("Button"), v = Ct("Portal"), g = on("focustrap");
  return c(), Z(v, {
    appendTo: t.appendTo
  }, {
    default: C(function() {
      return [d.containerVisible ? (c(), b("div", w({
        key: 0,
        ref: s.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: n[1] || (n[1] = function() {
          return s.onMaskMouseDown && s.onMaskMouseDown.apply(s, arguments);
        }),
        onMouseup: n[2] || (n[2] = function() {
          return s.onMaskMouseUp && s.onMaskMouseUp.apply(s, arguments);
        }),
        "data-p": s.dataP
      }, t.ptm("mask")), [u(zn, w({
        name: "p-dialog",
        onEnter: s.onEnter,
        onAfterEnter: s.onAfterEnter,
        onBeforeLeave: s.onBeforeLeave,
        onLeave: s.onLeave,
        onAfterLeave: s.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: C(function() {
          return [t.visible ? Q((c(), b("div", w({
            key: 0,
            ref: s.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": s.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": s.dataP
          }, t.ptmi("root")), [t.$slots.container ? O(t.$slots, "container", {
            key: 0,
            closeCallback: s.close,
            maximizeCallback: function($) {
              return s.maximize($);
            },
            initDragCallback: s.initDrag
          }) : (c(), b(W, {
            key: 1
          }, [t.showHeader ? (c(), b("div", w({
            key: 0,
            ref: s.headerContainerRef,
            class: t.cx("header"),
            onMousedown: n[0] || (n[0] = function() {
              return s.initDrag && s.initDrag.apply(s, arguments);
            })
          }, t.ptm("header")), [O(t.$slots, "header", {
            class: S(t.cx("title"))
          }, function() {
            return [t.header ? (c(), b("span", w({
              key: 0,
              id: s.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), h(t.header), 17, Te)) : E("", !0)];
          }), i("div", w({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? O(t.$slots, "maximizebutton", {
            key: 0,
            maximized: d.maximized,
            maximizeCallback: function($) {
              return s.maximize($);
            }
          }, function() {
            return [u(k, w({
              ref: s.maximizableRef,
              autofocus: d.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: s.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: C(function(p) {
                return [O(t.$slots, "maximizeicon", {
                  maximized: d.maximized
                }, function() {
                  return [(c(), Z(Ot(s.maximizeIconComponent), w({
                    class: [p.class, d.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : E("", !0), t.closable ? O(t.$slots, "closebutton", {
            key: 1,
            closeCallback: s.close
          }, function() {
            return [u(k, w({
              ref: s.closeButtonRef,
              autofocus: d.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: s.close,
              "aria-label": s.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: C(function(p) {
                return [O(t.$slots, "closeicon", {}, function() {
                  return [(c(), Z(Ot(t.closeIcon ? "span" : "TimesIcon"), w({
                    class: [t.closeIcon, p.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : E("", !0)], 16)], 16)) : E("", !0), i("div", w({
            ref: s.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": s.dataP
          }, Jt(Jt({}, t.contentProps), t.ptm("content"))), [O(t.$slots, "default")], 16, Fe), t.footer || t.$slots.footer ? (c(), b("div", w({
            key: 1,
            ref: s.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [O(t.$slots, "footer", {}, function() {
            return [B(h(t.footer), 1)];
          })], 16)) : E("", !0)], 64))], 16, je)), [[g, {
            disabled: !t.modal
          }]]) : E("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Me)) : E("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Rt.render = Re;
function Ue(t, n) {
  if (t && typeof t == "object") {
    const e = t, o = e.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof e.message == "string" && e.message) return e.message;
  }
  return n;
}
function R(t, n) {
  if (t && typeof t == "object") {
    const e = t;
    e.response?.status === 401 && V.handleError("auth-expired", e);
  }
  return Ue(t, n);
}
async function He() {
  try {
    const { data: t } = await ct.get("/api/v1/mcp/credentials");
    if (!t?.success) throw new Error(t?.error || "failed to load credentials");
    return {
      credentials: t.credentials || [],
      mcpUrl: typeof t.mcp_url == "string" ? t.mcp_url : ""
    };
  } catch (t) {
    throw new Error(R(t, "could not load credentials"));
  }
}
async function Ve(t) {
  try {
    const n = t ? `/api/v1/mcp/components?parent_id=${encodeURIComponent(t)}` : "/api/v1/mcp/components", { data: e } = await ct.get(n);
    if (!e?.success) throw new Error(e?.error || "failed to load components");
    return e.components || [];
  } catch (n) {
    throw new Error(R(n, "could not load components"));
  }
}
async function Ne(t) {
  try {
    const { data: n } = await ct.post("/api/v1/mcp/credentials", t);
    if (!n?.success || !n.credential) throw new Error(n?.error || "create failed");
    return n.credential;
  } catch (n) {
    throw new Error(R(n, "could not create credential"));
  }
}
async function Ke(t, n) {
  try {
    const { data: e } = await ct.patch(`/api/v1/mcp/credentials/${t}`, n);
    if (!e?.success) throw new Error(e?.error || "update failed");
  } catch (e) {
    throw new Error(R(e, "could not update credential"));
  }
}
async function We(t) {
  try {
    const { data: n } = await ct.delete("/api/v1/mcp/credentials/" + t);
    if (!n?.success) throw new Error(n?.error || "delete failed");
  } catch (n) {
    throw new Error(R(n, "could not delete credential"));
  }
}
const Ze = {
  folder: "tabler:folder",
  workspace: "tabler:folder",
  knowledge_base: "tabler:books",
  agent: "tabler:robot",
  connection: "tabler:plug",
  inbox: "tabler:inbox"
};
function Ye({ credentials: t, reload: n }) {
  const e = z(!1), o = z(!1), d = z(""), s = z(null), k = z({ label: "", ttl: "", traits: [] }), v = z({}), g = z([]), p = z([]), $ = z([]), _ = z(!1), D = z(""), P = M(() => {
    const f = typeof location < "u" ? location.origin : "";
    return f && f !== "null" ? `${f.replace(/\/$/, "")}/api/public/mcp` : "/api/public/mcp";
  }), j = M(() => s.value?.mcp_url || t.value.find((f) => f.mcp_url)?.mcp_url || D.value || P.value), T = M(() => s.value ? JSON.stringify({ type: "streamable-http", url: j.value, headers: { Authorization: `Bearer ${s.value.token}` } }, null, 2) : ""), bt = M(() => s.value ? `claude mcp add --transport http kickside ${j.value} --header "Authorization: Bearer ${s.value.token}"` : ""), St = M(() => JSON.stringify({
    traits: k.value.traits,
    trait_contexts: v.value
  }));
  async function H(f, x) {
    _.value = !0;
    try {
      $.value = await Ve(f), x && p.value.push(x);
    } catch (U) {
      $.value = [], d.value = R(U, "could not load components");
    } finally {
      _.value = !1;
    }
  }
  function $t() {
    k.value = { label: "", ttl: "", traits: [] }, v.value = {}, g.value = [], p.value = [], d.value = "", s.value = null, e.value = !0, H(void 0, null);
  }
  function Lt() {
    e.value = !1, s.value = null, d.value = "";
  }
  function Y(f) {
    const x = p.value[f];
    p.value = p.value.slice(0, f), H(x?.id, x || null);
  }
  function pt() {
    p.value = [], H(void 0, null);
  }
  function ft(f) {
    H(f.id, { id: f.id, name: f.name || "" });
  }
  const X = M(() => p.value.length ? p.value[p.value.length - 1] : null);
  function N(f) {
    return g.value.some((x) => x.id === f);
  }
  const K = M(() => p.value.length === 0), zt = M(() => K.value ? g.value.length === 0 : N(X.value.id)), mt = M(() => K.value ? g.value.length === 0 ? "Home — full account" : "Scope to home" : N(X.value.id) ? "Added" : "Add this folder");
  function Et() {
    K.value ? g.value = [] : tt(X.value);
  }
  function tt(f) {
    N(f.id) ? g.value = g.value.filter((x) => x.id !== f.id) : g.value.push({ id: f.id, name: f.name || "" });
  }
  function G(f) {
    g.value = g.value.filter((x) => x.id !== f);
  }
  function Dt(f) {
    return f.class && Ze[f.class] || "tabler:box";
  }
  function nt(f) {
    const x = f.detail;
    !Array.isArray(x?.traits) || !x.trait_contexts || typeof x.trait_contexts != "object" || Array.isArray(x.trait_contexts) || (k.value.traits = x.traits.filter((U) => typeof U == "string"), v.value = x.trait_contexts);
  }
  async function gt() {
    const f = k.value.label.trim();
    if (!f) {
      d.value = "A label is required so you can recognize this credential later.";
      return;
    }
    o.value = !0, d.value = "";
    try {
      const x = parseInt(k.value.ttl, 10), U = await Ne({
        whitelist_component_ids: g.value.map((At) => At.id),
        label: f,
        allowed_trait_ids: k.value.traits,
        default_active_trait_ids: k.value.traits,
        agent_profile: { trait_contexts: v.value },
        expires_at: x > 0 ? Math.floor(Date.now() / 1e3) + x * 86400 : void 0
      });
      s.value = U, V.toast({ severity: "success", summary: "Credential created", detail: U.label || U.token_prefix }), await n();
    } catch (x) {
      d.value = R(x, "create failed");
    } finally {
      o.value = !1;
    }
  }
  return {
    createOpen: e,
    saving: o,
    formError: d,
    minted: s,
    form: k,
    whitelist: g,
    crumbs: p,
    children: $,
    browsing: _,
    serverMcpUrl: D,
    browserOrigin: P,
    mcpUrl: j,
    snippet: T,
    claudeCodeCmd: bt,
    traitPickerValue: St,
    openCreate: $t,
    closeCreate: Lt,
    browse: H,
    crumbTo: Y,
    crumbRoot: pt,
    openFolder: ft,
    currentFolder: X,
    inWhitelist: N,
    atRoot: K,
    scopeActive: zt,
    scopeLabel: mt,
    addScope: Et,
    toggleWhitelist: tt,
    removeWhitelist: G,
    classIcon: Dt,
    onTraitPickerChange: nt,
    submit: gt
  };
}
const Xe = {
  active: "Active",
  revoked: "Revoked"
};
function Ge(t) {
  return t ? Xe[t] ?? t : "";
}
function xt(t) {
  return (t.name || "").trim() || "Unknown component";
}
const qe = { class: "kx" }, Je = { class: "kx-head" }, Qe = { class: "kx-head-icon" }, to = { class: "kx-head-actions" }, no = { class: "kx-search" }, eo = { class: "kx-connect-strip" }, oo = { class: "kx-connect-url" }, ro = {
  key: 0,
  class: "kx-err"
}, ao = { class: "kx-body" }, io = {
  key: 0,
  class: "kx-loading"
}, lo = {
  key: 1,
  class: "kx-empty"
}, so = { class: "kx-empty-ico" }, uo = { class: "kx-empty-actions" }, co = {
  key: 2,
  class: "kx-empty"
}, bo = { class: "kx-empty-ico" }, po = { class: "kx-empty-actions" }, fo = {
  key: 3,
  class: "kx-grid"
}, mo = { class: "kx-card-head" }, go = { class: "kx-ficon" }, ho = { class: "kx-card-id" }, vo = ["title"], yo = { class: "kx-card-meta" }, ko = {
  key: 0,
  class: "kx-chip kx-tag-sm kx-ver"
}, xo = { class: "kx-card-desc" }, Co = { key: 0 }, wo = { key: 1 }, _o = { class: "kx-modal-head-icon" }, So = { class: "kx-modal-head-text" }, $o = { class: "kx-modal-head-title" }, Lo = { class: "kx-modal-head-sub" }, zo = {
  key: 0,
  class: "kx-modal-body"
}, Eo = { class: "kx-field-row" }, Do = { class: "kx-field" }, Ao = { class: "kx-field" }, Po = { class: "kx-field" }, Io = {
  key: 0,
  class: "kx-scope-chips"
}, Bo = { class: "kx-scope-chip-name" }, Oo = {
  key: 0,
  class: "kx-id"
}, Mo = ["onClick"], jo = {
  key: 1,
  class: "kx-scope-note"
}, To = { key: 0 }, Fo = { key: 1 }, Ro = { class: "kx-browser" }, Uo = { class: "kx-crumbs" }, Ho = { key: 0 }, Vo = ["title", "onClick"], No = { class: "kx-browser-list" }, Ko = {
  key: 0,
  class: "kx-tool-empty"
}, Wo = {
  key: 1,
  class: "kx-tool-empty"
}, Zo = ["onClick"], Yo = {
  key: 0,
  class: "kx-id"
}, Xo = ["value", "refresh-key"], Go = {
  key: 0,
  class: "kx-err inline"
}, qo = {
  key: 1,
  class: "kx-modal-body"
}, Jo = { class: "kx-field" }, Qo = { class: "kx-token" }, tr = { class: "kx-field" }, nr = { class: "kx-token" }, er = { class: "kx-field" }, or = { class: "kx-snip" }, rr = { class: "kx-field" }, ar = { class: "kx-snip" }, ir = { class: "kx-connect-note" }, lr = { class: "kx-modal-body" }, sr = { class: "kx-field" }, dr = /* @__PURE__ */ En({
  __name: "mcp",
  setup(t) {
    const n = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, e = z(!1), o = z(""), d = z([]), s = z(""), k = z(0);
    let v = 0, g = !1;
    const p = M(() => {
      const y = s.value.trim().toLowerCase();
      return y ? d.value.filter((l) => (l.label || "").toLowerCase().includes(y)) : d.value;
    }), $ = Ye({ credentials: d, reload: () => ht() }), {
      createOpen: _,
      saving: D,
      formError: P,
      minted: j,
      form: T,
      whitelist: bt,
      crumbs: St,
      children: H,
      browsing: $t,
      serverMcpUrl: Lt,
      mcpUrl: Y,
      snippet: pt,
      claudeCodeCmd: ft,
      traitPickerValue: X,
      openCreate: N,
      closeCreate: K,
      crumbTo: zt,
      crumbRoot: mt,
      openFolder: Et,
      currentFolder: tt,
      inWhitelist: G,
      atRoot: Dt,
      scopeActive: nt,
      scopeLabel: gt,
      addScope: f,
      toggleWhitelist: x,
      removeWhitelist: U,
      classIcon: At,
      onTraitPickerChange: Ht,
      submit: un
    } = $;
    async function ht() {
      const y = ++v;
      e.value = !0, o.value = "";
      try {
        const l = await He();
        y === v && (d.value = l.credentials, l.mcpUrl && (Lt.value = l.mcpUrl));
      } catch (l) {
        y === v && (d.value = [], o.value = R(l, "could not load credentials"));
      } finally {
        y === v && (e.value = !1);
      }
    }
    function cn(y) {
      if (!y) return "";
      const l = Math.max(0, Math.round(Date.now() / 1e3 - y));
      if (l < 60) return "just now";
      const a = Math.round(l / 60);
      if (a < 60) return `${a}m ago`;
      const A = Math.round(a / 60);
      if (A < 24) return `${A}h ago`;
      const It = Math.round(A / 24);
      return It < 30 ? `${It}d ago` : new Date(y * 1e3).toLocaleDateString();
    }
    const vt = z(null), q = z(""), et = z(!1);
    function bn(y) {
      vt.value = y, q.value = y.label || "";
    }
    function Pt() {
      vt.value = null, q.value = "";
    }
    async function Vt() {
      const y = vt.value;
      if (!y) return;
      const l = q.value.trim();
      if (l) {
        et.value = !0;
        try {
          await Ke(y.credential_id, { label: l }), V.toast({ severity: "success", summary: "Renamed", detail: l }), Pt(), await ht();
        } catch (a) {
          o.value = R(a, "rename failed");
        } finally {
          et.value = !1;
        }
      }
    }
    async function ot(y, l) {
      try {
        await navigator.clipboard.writeText(y), V.toast({ severity: "success", summary: "Copied", detail: l });
      } catch {
        V.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function pn(y) {
      if (await V.confirm({
        message: `Delete “${y.label || y.token_prefix}”? This permanently removes the credential and its token. This can't be undone.`,
        header: "Delete credential",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await We(y.credential_id), V.toast({ severity: "success", summary: "Deleted", detail: y.label || y.token_prefix }), await ht();
        } catch (a) {
          o.value = R(a, "delete failed"), V.toast({ severity: "error", summary: "Delete failed", detail: o.value });
        }
    }
    const Nt = M({
      get: () => vt.value !== null,
      set: (y) => {
        y || Pt();
      }
    });
    return $n(async () => {
      g && (k.value += 1), g = !0, await ht();
    }), (y, l) => (c(), b("div", qe, [
      i("header", Je, [
        i("div", Qe, [
          u(r(m), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        l[15] || (l[15] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "MCP credentials"),
          i("p", { class: "kx-head-sub" }, "Tokens an agent can use to act as you, optionally scoped to components you pick.")
        ], -1)),
        i("div", to, [
          i("div", no, [
            u(r(m), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Q(i("input", {
              "onUpdate:modelValue": l[0] || (l[0] = (a) => s.value = a),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search credentials…",
              "aria-label": "Search credentials"
            }, null, 512), [
              [yt, s.value]
            ])
          ]),
          u(r(L), {
            type: "button",
            label: "New credential",
            onClick: r(N)
          }, {
            icon: C(({ class: a }) => [
              u(r(m), {
                icon: "tabler:plus",
                class: S(a),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["onClick"])
        ])
      ]),
      i("div", eo, [
        u(r(m), {
          icon: "tabler:world",
          "aria-hidden": "true"
        }),
        l[16] || (l[16] = i("span", { class: "kx-connect-lbl" }, "Endpoint", -1)),
        i("code", oo, h(r(Y)), 1),
        u(r(L), {
          type: "button",
          severity: "secondary",
          outlined: "",
          size: "small",
          title: "Copy endpoint URL",
          "aria-label": "Copy endpoint URL",
          onClick: l[1] || (l[1] = (a) => ot(r(Y), "endpoint URL"))
        }, {
          icon: C(({ class: a }) => [
            u(r(m), {
              icon: "tabler:copy",
              class: S(a),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }),
        l[17] || (l[17] = i("span", { class: "kx-connect-hint" }, "Claude (claude.ai): Settings → Connectors → Add custom connector → paste this URL — sign-in happens here via OAuth, no token needed. Tokens below are for clients without OAuth.", -1))
      ]),
      o.value ? (c(), b("div", ro, h(o.value), 1)) : E("", !0),
      i("div", ao, [
        e.value && !d.value.length ? (c(), b("div", io, [
          u(r(m), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          l[18] || (l[18] = B(" Loading…", -1))
        ])) : d.value.length ? p.value.length ? (c(), b("div", fo, [
          (c(!0), b(W, null, kt(p.value, (a) => (c(), b("div", {
            key: a.credential_id,
            class: "kx-card"
          }, [
            i("div", mo, [
              i("span", go, [
                u(r(m), {
                  icon: "tabler:plug-connected",
                  "aria-hidden": "true"
                })
              ]),
              i("div", ho, [
                i("div", {
                  class: "kx-card-name",
                  title: a.label || "(unlabeled)"
                }, h(a.label || "(unlabeled)"), 9, vo),
                i("div", yo, [
                  i("span", {
                    class: S(["kx-chip kx-tag-sm", (a.whitelist_component_ids?.length || 0) > 0 ? "kx-scope" : "kx-ver"])
                  }, [
                    u(r(m), {
                      icon: (a.whitelist_component_ids?.length || 0) > 0 ? "tabler:lock" : "tabler:world",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    B(" " + h((a.whitelist_component_ids?.length || 0) > 0 ? `${a.whitelist_component_ids.length} scoped` : "full account"), 1)
                  ], 2),
                  (a.allowed_trait_ids?.length || 0) > 0 ? (c(), b("span", ko, [
                    u(r(m), {
                      icon: "tabler:puzzle",
                      "aria-hidden": "true"
                    }),
                    B(" " + h(a.allowed_trait_ids.length) + " " + h(a.allowed_trait_ids.length === 1 ? "capability" : "capabilities"), 1)
                  ])) : E("", !0),
                  i("span", {
                    class: S(["kx-chip kx-tag-sm kx-status", a.status === "active" ? "kx-status-on" : "kx-status-off"])
                  }, h(r(Ge)(a.status)), 3)
                ])
              ]),
              i("div", {
                class: "kx-card-actions",
                onClick: l[3] || (l[3] = Dn(() => {
                }, ["stop"]))
              }, [
                u(r(L), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Rename",
                  "aria-label": "Rename",
                  onClick: (A) => bn(a)
                }, {
                  icon: C(({ class: A }) => [
                    u(r(m), {
                      icon: "tabler:pencil",
                      class: S(A),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                u(r(L), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": "Delete",
                  onClick: (A) => pn(a)
                }, {
                  icon: C(({ class: A }) => [
                    u(r(m), {
                      icon: "tabler:trash",
                      class: S(A),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ])
            ]),
            i("div", xo, [
              i("code", null, h(a.token_prefix) + "…", 1),
              a.last_used_at ? (c(), b("span", Co, " · used " + h(cn(a.last_used_at)), 1)) : E("", !0),
              a.expires_at ? (c(), b("span", wo, " · expires " + h(new Date(a.expires_at * 1e3).toLocaleDateString()), 1)) : E("", !0)
            ])
          ]))), 128))
        ])) : (c(), b("div", co, [
          i("div", bo, [
            u(r(m), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          l[21] || (l[21] = i("div", { class: "kx-empty-title" }, "No matches", -1)),
          i("div", po, [
            u(r(L), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: l[2] || (l[2] = (a) => s.value = "")
            }, {
              icon: C(({ class: a }) => [
                u(r(m), {
                  icon: "tabler:x",
                  class: S(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (c(), b("div", lo, [
          i("div", so, [
            u(r(m), {
              icon: "tabler:plug-connected",
              "aria-hidden": "true"
            })
          ]),
          l[19] || (l[19] = i("div", { class: "kx-empty-title" }, "No credentials yet", -1)),
          l[20] || (l[20] = i("div", { class: "kx-empty-sub" }, "Mint a token an agent can use to act as you — scoped to the components and capabilities you choose.", -1)),
          i("div", uo, [
            u(r(L), {
              type: "button",
              label: "New credential",
              onClick: r(N)
            }, {
              icon: C(({ class: a }) => [
                u(r(m), {
                  icon: "tabler:plus",
                  class: S(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["onClick"])
          ])
        ]))
      ]),
      u(r(Rt), {
        visible: r(_),
        "onUpdate:visible": l[12] || (l[12] = (a) => An(_) ? _.value = a : null),
        modal: "",
        class: "kx-dialog kx-modal-xl",
        "aria-label": "New MCP credential",
        pt: n
      }, {
        header: C(() => [
          i("span", _o, [
            u(r(m), {
              icon: "tabler:plug-connected",
              "aria-hidden": "true"
            })
          ]),
          i("span", So, [
            i("span", $o, h(r(j) ? "Credential created" : "New credential"), 1),
            i("span", Lo, h(r(j) ? "Copy the token now — it is shown once." : "Scope it, name it, pick its capabilities."), 1)
          ])
        ]),
        footer: C(() => [
          r(j) ? (c(), Z(r(L), {
            key: 1,
            type: "button",
            label: "Done",
            onClick: r(K)
          }, {
            icon: C(({ class: a }) => [
              u(r(m), {
                icon: "tabler:check",
                class: S(a),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["onClick"])) : (c(), b(W, { key: 0 }, [
            u(r(L), {
              type: "button",
              label: "Cancel",
              severity: "secondary",
              outlined: "",
              disabled: r(D),
              onClick: r(K)
            }, null, 8, ["disabled", "onClick"]),
            u(r(L), {
              type: "button",
              label: "Create credential",
              loading: r(D),
              disabled: r(D) || !r(T).label.trim(),
              onClick: r(un)
            }, {
              icon: C(({ class: a }) => [
                u(r(m), {
                  icon: "tabler:check",
                  class: S(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled", "onClick"])
          ], 64))
        ]),
        default: C(() => [
          r(j) ? (c(), b("div", qo, [
            i("div", Jo, [
              l[26] || (l[26] = i("span", { class: "kx-field-lbl" }, [
                B("Endpoint URL "),
                i("span", { class: "kx-field-hint-inline" }, "— public MCP endpoint")
              ], -1)),
              i("div", Qo, [
                i("code", null, h(r(Y)), 1),
                u(r(L), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: l[8] || (l[8] = (a) => ot(r(Y), "endpoint URL"))
                }, {
                  icon: C(({ class: a }) => [
                    u(r(m), {
                      icon: "tabler:copy",
                      class: S(a),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            i("div", tr, [
              l[27] || (l[27] = i("span", { class: "kx-field-lbl" }, [
                B("Bearer token "),
                i("span", { class: "kx-field-hint-inline" }, "— shown once")
              ], -1)),
              i("div", nr, [
                i("code", null, h(r(j).token), 1),
                u(r(L), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy token",
                  "aria-label": "Copy token",
                  onClick: l[9] || (l[9] = (a) => ot(r(j).token, "token"))
                }, {
                  icon: C(({ class: a }) => [
                    u(r(m), {
                      icon: "tabler:copy",
                      class: S(a),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            i("div", er, [
              l[28] || (l[28] = i("span", { class: "kx-field-lbl" }, [
                B("Claude Code "),
                i("span", { class: "kx-field-hint-inline" }, "— one command")
              ], -1)),
              i("div", or, [
                i("pre", null, h(r(ft)), 1),
                u(r(L), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy command",
                  "aria-label": "Copy command",
                  onClick: l[10] || (l[10] = (a) => ot(r(ft), "command"))
                }, {
                  icon: C(({ class: a }) => [
                    u(r(m), {
                      icon: "tabler:copy",
                      class: S(a),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            i("div", rr, [
              l[29] || (l[29] = i("span", { class: "kx-field-lbl" }, [
                B("Other clients "),
                i("span", { class: "kx-field-hint-inline" }, "— streamable-http config")
              ], -1)),
              i("div", ar, [
                i("pre", null, h(r(pt)), 1),
                u(r(L), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Copy config",
                  "aria-label": "Copy config",
                  onClick: l[11] || (l[11] = (a) => ot(r(pt), "config"))
                }, {
                  icon: C(({ class: a }) => [
                    u(r(m), {
                      icon: "tabler:copy",
                      class: S(a),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                })
              ])
            ]),
            i("div", ir, [
              u(r(m), {
                icon: "tabler:info-circle",
                "aria-hidden": "true"
              }),
              l[30] || (l[30] = i("span", null, "Connecting from Claude (claude.ai)? You don't need this token — add the endpoint URL as a custom connector and approve the OAuth consent instead.", -1))
            ])
          ])) : (c(), b("div", zo, [
            i("div", Eo, [
              i("label", Do, [
                l[22] || (l[22] = i("span", { class: "kx-field-lbl" }, "Label", -1)),
                Q(i("input", {
                  "onUpdate:modelValue": l[4] || (l[4] = (a) => r(T).label = a),
                  class: "kx-input",
                  type: "text",
                  placeholder: "research-agent"
                }, null, 512), [
                  [yt, r(T).label]
                ])
              ]),
              i("label", Ao, [
                l[23] || (l[23] = i("span", { class: "kx-field-lbl" }, [
                  B("Expires "),
                  i("span", { class: "kx-field-hint-inline" }, "— days")
                ], -1)),
                Q(i("input", {
                  "onUpdate:modelValue": l[5] || (l[5] = (a) => r(T).ttl = a),
                  class: "kx-input",
                  type: "number",
                  min: "1",
                  placeholder: "never"
                }, null, 512), [
                  [yt, r(T).ttl]
                ])
              ])
            ]),
            i("div", Po, [
              l[25] || (l[25] = i("span", { class: "kx-field-lbl" }, [
                B("Scope "),
                i("span", { class: "kx-field-hint-inline" }, "— leave empty for full account, or add components to confine it")
              ], -1)),
              r(bt).length ? (c(), b("div", Io, [
                (c(!0), b(W, null, kt(r(bt), (a) => (c(), b("span", {
                  key: a.id,
                  class: "kx-scope-chip"
                }, [
                  u(r(m), {
                    icon: "tabler:lock",
                    "aria-hidden": "true"
                  }),
                  i("span", Bo, [
                    B(h(r(xt)(a)), 1),
                    a.name ? E("", !0) : (c(), b("span", Oo, h(a.id), 1))
                  ]),
                  i("button", {
                    class: "kx-scope-chip-x",
                    title: "Remove",
                    "aria-label": "Remove",
                    onClick: (A) => r(U)(a.id)
                  }, [
                    u(r(m), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ], 8, Mo)
                ]))), 128))
              ])) : (c(), b("div", jo, [
                u(r(m), {
                  icon: "tabler:world",
                  "aria-hidden": "true"
                }),
                r(tt) ? (c(), b("span", To, 'Full account so far — nothing scoped yet. Use "' + h(r(gt)) + '" to confine it to ' + h(r(xt)(r(tt))) + ".", 1)) : (c(), b("span", Fo, "Full account — reaches everything you can."))
              ])),
              i("div", Ro, [
                i("div", Uo, [
                  i("button", {
                    class: "kx-crumb",
                    "aria-label": "Home",
                    onClick: l[6] || (l[6] = //@ts-ignore
                    (...a) => r(mt) && r(mt)(...a))
                  }, [
                    u(r(m), {
                      icon: "tabler:home",
                      "aria-hidden": "true"
                    }),
                    r(Dt) ? (c(), b("span", Ho, "Home")) : E("", !0)
                  ]),
                  (c(!0), b(W, null, kt(r(St), (a, A) => (c(), b(W, {
                    key: a.id
                  }, [
                    u(r(m), {
                      icon: "tabler:chevron-right",
                      class: "kx-crumb-sep",
                      "aria-hidden": "true"
                    }),
                    i("button", {
                      class: "kx-crumb",
                      title: a.name ? void 0 : a.id,
                      onClick: (It) => r(zt)(A)
                    }, h(r(xt)(a)), 9, Vo)
                  ], 64))), 128)),
                  u(r(L), {
                    type: "button",
                    size: "small",
                    class: "kx-crumb-add",
                    severity: r(nt) ? void 0 : "secondary",
                    outlined: !r(nt),
                    label: r(gt),
                    onClick: r(f)
                  }, {
                    icon: C(({ class: a }) => [
                      u(r(m), {
                        icon: r(nt) ? "tabler:check" : "tabler:plus",
                        class: S(a),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ]),
                    _: 1
                  }, 8, ["severity", "outlined", "label", "onClick"])
                ]),
                i("div", No, [
                  r($t) ? (c(), b("div", Ko, [
                    u(r(m), {
                      icon: "tabler:loader-2",
                      class: "spin",
                      "aria-hidden": "true"
                    }),
                    l[24] || (l[24] = B(" Loading…", -1))
                  ])) : r(H).length ? E("", !0) : (c(), b("div", Wo, "Nothing here.")),
                  (c(!0), b(W, null, kt(r(H), (a) => (c(), b("div", {
                    key: a.id,
                    class: "kx-browse-row"
                  }, [
                    i("button", {
                      class: "kx-browse-open",
                      onClick: (A) => r(Et)(a),
                      title: "Open"
                    }, [
                      u(r(m), {
                        icon: r(At)(a),
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      i("span", null, [
                        B(h(r(xt)(a)), 1),
                        a.name?.trim() ? E("", !0) : (c(), b("span", Yo, h(a.id), 1))
                      ])
                    ], 8, Zo),
                    u(r(L), {
                      type: "button",
                      size: "small",
                      severity: r(G)(a.id) ? void 0 : "secondary",
                      outlined: !r(G)(a.id),
                      label: r(G)(a.id) ? "Added" : "Add",
                      onClick: (A) => r(x)(a)
                    }, {
                      icon: C(({ class: A }) => [
                        u(r(m), {
                          icon: r(G)(a.id) ? "tabler:check" : "tabler:plus",
                          class: S(A),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"])
                      ]),
                      _: 2
                    }, 1032, ["severity", "outlined", "label", "onClick"])
                  ]))), 128))
                ])
              ])
            ]),
            i("wc-agent-trait-picker", {
              value: r(X),
              "refresh-key": k.value,
              "keep-menu-open-on-add": "",
              onChange: l[7] || (l[7] = //@ts-ignore
              (...a) => r(Ht) && r(Ht)(...a))
            }, null, 40, Xo),
            r(P) ? (c(), b("div", Go, h(r(P)), 1)) : E("", !0)
          ]))
        ]),
        _: 1
      }, 8, ["visible"]),
      u(r(Rt), {
        visible: Nt.value,
        "onUpdate:visible": l[14] || (l[14] = (a) => Nt.value = a),
        modal: "",
        class: "kx-dialog",
        header: "Rename credential",
        "aria-label": "Rename credential",
        pt: n
      }, {
        footer: C(() => [
          u(r(L), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: et.value,
            onClick: Pt
          }, null, 8, ["disabled"]),
          u(r(L), {
            type: "button",
            label: "Save",
            loading: et.value,
            disabled: et.value || !q.value.trim(),
            onClick: Vt
          }, {
            icon: C(({ class: a }) => [
              u(r(m), {
                icon: "tabler:check",
                class: S(a),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: C(() => [
          i("div", lr, [
            i("div", sr, [
              l[31] || (l[31] = i("span", { class: "kx-field-lbl" }, "Label", -1)),
              Q(i("input", {
                "onUpdate:modelValue": l[13] || (l[13] = (a) => q.value = a),
                class: "kx-input",
                type: "text",
                placeholder: "A name you'll recognize",
                onKeydown: Pn(Vt, ["enter"])
              }, null, 544), [
                [yt, q.value]
              ])
            ])
          ])
        ]),
        _: 1
      }, 8, ["visible"])
    ]));
  }
}), fr = {
  rootComponent: dr,
  plugins: [Ln]
};
export {
  fr as mountConfig
};
//# sourceMappingURL=lazy-mount-D8gSJRTc.js.map
