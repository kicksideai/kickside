import { s as Mt, B as Ct, a as Vo, b as At, c as Gt, f as mt, R as ao, L as Do, d as Me, v as Qt, e as hi, U as bi, I as mo, g as vi, r as Ro, h as gi, i as Bo, j as Ho, C as yi, k as ki, S as Uo, _ as wi, x as en, m as Si, z as jo, n as En, o as ln, T as rn, F as $i, M as ho, p as Ci, q as Ii, Y as _i, t as xi, u as Oi, D as Li, O as zi, $ as Ai, J as Mi, w as Jt, y as Ei, P as Pi } from "./wc-runtime-Chhe4T5p.js";
import { openBlock as a, createElementBlock as u, mergeProps as Z, createElementVNode as r, renderSlot as le, createTextVNode as A, toDisplayString as c, resolveComponent as Ae, resolveDirective as lo, withDirectives as Be, createBlock as be, resolveDynamicComponent as fn, withCtx as oe, createCommentVNode as h, normalizeClass as ae, computed as q, createVNode as m, Transition as No, Fragment as J, renderList as re, normalizeProps as Fi, createSlots as Ti, withModifiers as xn, defineComponent as on, ref as B, watch as qe, nextTick as mn, onBeforeUnmount as Ko, normalizeStyle as Kt, onUnmounted as ro, onMounted as uo, unref as o, useId as Vi, vModelText as On, vShow as un, vModelCheckbox as Di, isRef as zt, withKeys as Ri } from "vue";
import { Icon as $ } from "@iconify/vue";
import { m as hn, r as ht, a as Pn, b as tn, c as Fn, K as qt, d as bo, e as Ee, f as Nn, i as vo, g as go, h as Bi, j as Tn, s as Hi, k as Ui, l as ji, n as Ni, o as Ki, p as qo, q as nn, t as bn, u as Go, v as qi, w as Ln, x as fe, y as Gi, z as Wi, A as Zi, B as Yi, C as Xi, D as cn, E as vn, F as Vn, G as pn } from "./requiredSetup-CKaPvMvx.js";
import { api as co, loadByTagName as Wo, host as Zo, on as Ji } from "@wippy-fe/proxy";
var Rn = {
  name: "SpinnerIcon",
  extends: Mt
};
function Qi(e) {
  return os(e) || ns(e) || ts(e) || es();
}
function es() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ts(e, t) {
  if (e) {
    if (typeof e == "string") return Kn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kn(e, t) : void 0;
  }
}
function ns(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function os(e) {
  if (Array.isArray(e)) return Kn(e);
}
function Kn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function is(e, t, n, s, i, l) {
  return a(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Qi(t[0] || (t[0] = [r("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Rn.render = is;
var ss = `
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
`, as = {
  root: function(t) {
    var n = t.props, s = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": At(n.value) && String(n.value).length === 1,
      "p-badge-dot": Vo(n.value) && !s.$slots.default,
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
}, ls = Ct.extend({
  name: "badge",
  style: ss,
  classes: as
}), rs = {
  name: "BaseBadge",
  extends: Gt,
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
  style: ls,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function gn(e) {
  "@babel/helpers - typeof";
  return gn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, gn(e);
}
function yo(e, t, n) {
  return (t = us(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function us(e) {
  var t = ds(e, "string");
  return gn(t) == "symbol" ? t : t + "";
}
function ds(e, t) {
  if (gn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (gn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Yo = {
  name: "Badge",
  extends: rs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return mt(yo(yo({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, cs = ["data-p"];
function ps(e, t, n, s, i, l) {
  return a(), u("span", Z({
    class: e.cx("root"),
    "data-p": l.dataP
  }, e.ptmi("root")), [le(e.$slots, "default", {}, function() {
    return [A(c(e.value), 1)];
  })], 16, cs);
}
Yo.render = ps;
var fs = `
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
function yn(e) {
  "@babel/helpers - typeof";
  return yn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, yn(e);
}
function ft(e, t, n) {
  return (t = ms(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ms(e) {
  var t = hs(e, "string");
  return yn(t) == "symbol" ? t : t + "";
}
function hs(e, t) {
  if (yn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (yn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var bs = {
  root: function(t) {
    var n = t.instance, s = t.props;
    return ["p-button p-component", ft(ft(ft(ft(ft(ft(ft(ft(ft({
      "p-button-icon-only": n.hasIcon && !s.label && !s.badge,
      "p-button-vertical": (s.iconPos === "top" || s.iconPos === "bottom") && s.label,
      "p-button-loading": s.loading,
      "p-button-link": s.link || s.variant === "link"
    }, "p-button-".concat(s.severity), s.severity), "p-button-raised", s.raised), "p-button-rounded", s.rounded), "p-button-text", s.text || s.variant === "text"), "p-button-outlined", s.outlined || s.variant === "outlined"), "p-button-sm", s.size === "small"), "p-button-lg", s.size === "large"), "p-button-plain", s.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", ft({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, vs = Ct.extend({
  name: "button",
  style: fs,
  classes: bs
}), gs = {
  name: "BaseButton",
  extends: Gt,
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
  style: vs,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function kn(e) {
  "@babel/helpers - typeof";
  return kn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, kn(e);
}
function Te(e, t, n) {
  return (t = ys(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ys(e) {
  var t = ks(e, "string");
  return kn(t) == "symbol" ? t : t + "";
}
function ks(e, t) {
  if (kn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (kn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ce = {
  name: "Button",
  extends: gs,
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
      return Z(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Vo(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return mt(Te(Te(Te(Te(Te(Te(Te(Te(Te(Te({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return mt(Te(Te({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return mt(Te(Te({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Rn,
    Badge: Yo
  },
  directives: {
    ripple: ao
  }
}, ws = ["data-p"], Ss = ["data-p"];
function $s(e, t, n, s, i, l) {
  var p = Ae("SpinnerIcon"), b = Ae("Badge"), v = lo("ripple");
  return e.asChild ? le(e.$slots, "default", {
    key: 1,
    class: ae(e.cx("root")),
    a11yAttrs: l.a11yAttrs
  }) : Be((a(), be(fn(e.as), Z({
    key: 0,
    class: e.cx("root"),
    "data-p": l.dataP
  }, l.attrs), {
    default: oe(function() {
      return [le(e.$slots, "default", {}, function() {
        return [e.loading ? le(e.$slots, "loadingicon", Z({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (a(), u("span", Z({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (a(), be(p, Z({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : le(e.$slots, "icon", Z({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (a(), u("span", Z({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": l.dataIconP
          }, e.ptm("icon")), null, 16, ws)) : h("", !0)];
        }), e.label ? (a(), u("span", Z({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": l.dataLabelP
        }), c(e.label), 17, Ss)) : h("", !0), e.badge ? (a(), be(b, {
          key: 3,
          value: e.badge,
          class: ae(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : h("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[v]]);
}
ce.render = $s;
var po = {
  name: "TimesIcon",
  extends: Mt
};
function Cs(e) {
  return Os(e) || xs(e) || _s(e) || Is();
}
function Is() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _s(e, t) {
  if (e) {
    if (typeof e == "string") return qn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qn(e, t) : void 0;
  }
}
function xs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Os(e) {
  if (Array.isArray(e)) return qn(e);
}
function qn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Ls(e, t, n, s, i, l) {
  return a(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Cs(t[0] || (t[0] = [r("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
po.render = Ls;
var Xo = {
  name: "WindowMaximizeIcon",
  extends: Mt
};
function zs(e) {
  return Ps(e) || Es(e) || Ms(e) || As();
}
function As() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ms(e, t) {
  if (e) {
    if (typeof e == "string") return Gn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gn(e, t) : void 0;
  }
}
function Es(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ps(e) {
  if (Array.isArray(e)) return Gn(e);
}
function Gn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Fs(e, t, n, s, i, l) {
  return a(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), zs(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xo.render = Fs;
var Jo = {
  name: "WindowMinimizeIcon",
  extends: Mt
};
function Ts(e) {
  return Bs(e) || Rs(e) || Ds(e) || Vs();
}
function Vs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ds(e, t) {
  if (e) {
    if (typeof e == "string") return Wn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wn(e, t) : void 0;
  }
}
function Rs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Bs(e) {
  if (Array.isArray(e)) return Wn(e);
}
function Wn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Hs(e, t, n, s, i, l) {
  return a(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ts(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jo.render = Hs;
var Us = Ct.extend({
  name: "focustrap-directive"
}), js = hi.extend({
  style: Us
});
function wn(e) {
  "@babel/helpers - typeof";
  return wn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, wn(e);
}
function ko(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function wo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ko(Object(n), !0).forEach(function(s) {
      Ns(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ko(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Ns(e, t, n) {
  return (t = Ks(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ks(e) {
  var t = qs(e, "string");
  return wn(t) == "symbol" ? t : t + "";
}
function qs(e, t) {
  if (wn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (wn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Gs = js.extend("focustrap", {
  mounted: function(t, n) {
    var s = n.value || {}, i = s.disabled;
    i || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var s = n.value || {}, i = s.disabled;
    i && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var s = this, i = n.value || {}, l = i.onFocusIn, p = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(b) {
        b.forEach(function(v) {
          if (v.type === "childList" && !t.contains(document.activeElement)) {
            var y = function(C) {
              var M = mo(C) ? mo(C, s.getComputedSelector(t.$_pfocustrap_focusableselector)) ? C : Qt(t, s.getComputedSelector(t.$_pfocustrap_focusableselector)) : Qt(C);
              return At(M) ? M : C.nextSibling && y(C.nextSibling);
            };
            Me(y(v.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(b) {
        return l && l(b);
      }, t.$_pfocustrap_focusoutlistener = function(b) {
        return p && p(b);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: wo(wo({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var s = n.value || {}, i = s.autoFocusSelector, l = i === void 0 ? "" : i, p = s.firstFocusableSelector, b = p === void 0 ? "" : p, v = s.autoFocus, y = v === void 0 ? !1 : v, w = Qt(t, "[autofocus]".concat(this.getComputedSelector(l)));
      y && !w && (w = Qt(t, this.getComputedSelector(b))), Me(w);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, i = t.relatedTarget, l = i === s.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Qt(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_lasthiddenfocusableelement;
      Me(l);
    },
    onLastHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, i = t.relatedTarget, l = i === s.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Do(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_firsthiddenfocusableelement;
      Me(l);
    },
    createHiddenFocusableElements: function(t, n) {
      var s = this, i = n.value || {}, l = i.tabIndex, p = l === void 0 ? 0 : l, b = i.firstFocusableSelector, v = b === void 0 ? "" : b, y = i.lastFocusableSelector, w = y === void 0 ? "" : y, C = function(U) {
        return bi("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: p,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: U?.bind(s)
        });
      }, M = C(this.onFirstHiddenElementFocus), E = C(this.onLastHiddenElementFocus);
      M.$_pfocustrap_lasthiddenfocusableelement = E, M.$_pfocustrap_focusableselector = v, M.setAttribute("data-pc-section", "firstfocusableelement"), E.$_pfocustrap_firsthiddenfocusableelement = M, E.$_pfocustrap_focusableselector = w, E.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(M), t.append(E);
    }
  }
});
function So() {
  gi({
    variableName: Ro("scrollbar.width").name
  });
}
function $o() {
  vi({
    variableName: Ro("scrollbar.width").name
  });
}
var Ws = `
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
`, Zs = {
  mask: function(t) {
    var n = t.position, s = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: s ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, Ys = {
  mask: function(t) {
    var n = t.props, s = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], i = s.find(function(l) {
      return l === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, i ? "p-dialog-".concat(i) : ""];
  },
  root: function(t) {
    var n = t.props, s = t.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && s.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, Xs = Ct.extend({
  name: "dialog",
  style: Ws,
  classes: Ys,
  inlineStyles: Zs
}), Js = {
  name: "BaseDialog",
  extends: Gt,
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
  style: Xs,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Qo = {
  name: "Dialog",
  extends: Js,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: q(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && en.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && en.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Si(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), Me(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && en.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(t) {
      this.maskMouseDownTarget = t.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var t = function(i) {
        return i && i.querySelector("[autofocus]");
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && Me(n, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? So() : $o());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && So();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && $o();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", wi(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var s in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(s, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[s], ` !important;
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
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Uo(document.body, {
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
          var s = Ho(t.container), i = yi(t.container), l = n.pageX - t.lastPageX, p = n.pageY - t.lastPageY, b = t.container.getBoundingClientRect(), v = b.left + l, y = b.top + p, w = ki(), C = getComputedStyle(t.container), M = parseFloat(C.marginLeft), E = parseFloat(C.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (v >= t.minX && v + s < w.width && (t.lastPageX = n.pageX, t.container.style.left = v - M + "px"), y >= t.minY && y + i < w.height && (t.lastPageY = n.pageY, t.container.style.top = y - E + "px")) : (t.lastPageX = n.pageX, t.container.style.left = v - M + "px", t.lastPageY = n.pageY, t.container.style.top = y - E + "px");
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
      return mt({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: ao,
    focustrap: Gs
  },
  components: {
    Button: ce,
    Portal: Bo,
    WindowMinimizeIcon: Jo,
    WindowMaximizeIcon: Xo,
    TimesIcon: po
  }
};
function Sn(e) {
  "@babel/helpers - typeof";
  return Sn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Sn(e);
}
function Co(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function Io(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Co(Object(n), !0).forEach(function(s) {
      Qs(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Co(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Qs(e, t, n) {
  return (t = ea(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ea(e) {
  var t = ta(e, "string");
  return Sn(t) == "symbol" ? t : t + "";
}
function ta(e, t) {
  if (Sn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (Sn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var na = ["data-p"], oa = ["aria-labelledby", "aria-modal", "data-p"], ia = ["id"], sa = ["data-p"];
function aa(e, t, n, s, i, l) {
  var p = Ae("Button"), b = Ae("Portal"), v = lo("focustrap");
  return a(), be(b, {
    appendTo: e.appendTo
  }, {
    default: oe(function() {
      return [i.containerVisible ? (a(), u("div", Z({
        key: 0,
        ref: l.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return l.onMaskMouseDown && l.onMaskMouseDown.apply(l, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return l.onMaskMouseUp && l.onMaskMouseUp.apply(l, arguments);
        }),
        "data-p": l.dataP
      }, e.ptm("mask")), [m(No, Z({
        name: "p-dialog",
        onEnter: l.onEnter,
        onAfterEnter: l.onAfterEnter,
        onBeforeLeave: l.onBeforeLeave,
        onLeave: l.onLeave,
        onAfterLeave: l.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: oe(function() {
          return [e.visible ? Be((a(), u("div", Z({
            key: 0,
            ref: l.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": l.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": l.dataP
          }, e.ptmi("root")), [e.$slots.container ? le(e.$slots, "container", {
            key: 0,
            closeCallback: l.close,
            maximizeCallback: function(w) {
              return l.maximize(w);
            },
            initDragCallback: l.initDrag
          }) : (a(), u(J, {
            key: 1
          }, [e.showHeader ? (a(), u("div", Z({
            key: 0,
            ref: l.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return l.initDrag && l.initDrag.apply(l, arguments);
            })
          }, e.ptm("header")), [le(e.$slots, "header", {
            class: ae(e.cx("title"))
          }, function() {
            return [e.header ? (a(), u("span", Z({
              key: 0,
              id: l.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), c(e.header), 17, ia)) : h("", !0)];
          }), r("div", Z({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? le(e.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(w) {
              return l.maximize(w);
            }
          }, function() {
            return [m(p, Z({
              ref: l.maximizableRef,
              autofocus: i.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: l.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: oe(function(y) {
                return [le(e.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(a(), be(fn(l.maximizeIconComponent), Z({
                    class: [y.class, i.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : h("", !0), e.closable ? le(e.$slots, "closebutton", {
            key: 1,
            closeCallback: l.close
          }, function() {
            return [m(p, Z({
              ref: l.closeButtonRef,
              autofocus: i.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: l.close,
              "aria-label": l.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: oe(function(y) {
                return [le(e.$slots, "closeicon", {}, function() {
                  return [(a(), be(fn(e.closeIcon ? "span" : "TimesIcon"), Z({
                    class: [e.closeIcon, y.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : h("", !0)], 16)], 16)) : h("", !0), r("div", Z({
            ref: l.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": l.dataP
          }, Io(Io({}, e.contentProps), e.ptm("content"))), [le(e.$slots, "default")], 16, sa), e.footer || e.$slots.footer ? (a(), u("div", Z({
            key: 1,
            ref: l.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [le(e.$slots, "footer", {}, function() {
            return [A(c(e.footer), 1)];
          })], 16)) : h("", !0)], 64))], 16, oa)), [[v, {
            disabled: !e.modal
          }]]) : h("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, na)) : h("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Qo.render = aa;
var ei = {
  name: "BlankIcon",
  extends: Mt
};
function la(e) {
  return ca(e) || da(e) || ua(e) || ra();
}
function ra() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ua(e, t) {
  if (e) {
    if (typeof e == "string") return Zn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zn(e, t) : void 0;
  }
}
function da(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ca(e) {
  if (Array.isArray(e)) return Zn(e);
}
function Zn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function pa(e, t, n, s, i, l) {
  return a(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), la(t[0] || (t[0] = [r("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
ei.render = pa;
var ti = {
  name: "CheckIcon",
  extends: Mt
};
function fa(e) {
  return va(e) || ba(e) || ha(e) || ma();
}
function ma() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ha(e, t) {
  if (e) {
    if (typeof e == "string") return Yn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yn(e, t) : void 0;
  }
}
function ba(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function va(e) {
  if (Array.isArray(e)) return Yn(e);
}
function Yn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function ga(e, t, n, s, i, l) {
  return a(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), fa(t[0] || (t[0] = [r("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ti.render = ga;
var ni = {
  name: "ChevronDownIcon",
  extends: Mt
};
function ya(e) {
  return $a(e) || Sa(e) || wa(e) || ka();
}
function ka() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wa(e, t) {
  if (e) {
    if (typeof e == "string") return Xn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xn(e, t) : void 0;
  }
}
function Sa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $a(e) {
  if (Array.isArray(e)) return Xn(e);
}
function Xn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Ca(e, t, n, s, i, l) {
  return a(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ya(t[0] || (t[0] = [r("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ni.render = Ca;
var oi = {
  name: "SearchIcon",
  extends: Mt
};
function Ia(e) {
  return La(e) || Oa(e) || xa(e) || _a();
}
function _a() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xa(e, t) {
  if (e) {
    if (typeof e == "string") return Jn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jn(e, t) : void 0;
  }
}
function Oa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function La(e) {
  if (Array.isArray(e)) return Jn(e);
}
function Jn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function za(e, t, n, s, i, l) {
  return a(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ia(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
oi.render = za;
var Aa = `
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
`, Ma = {
  root: "p-iconfield"
}, Ea = Ct.extend({
  name: "iconfield",
  style: Aa,
  classes: Ma
}), Pa = {
  name: "BaseIconField",
  extends: Gt,
  style: Ea,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, ii = {
  name: "IconField",
  extends: Pa,
  inheritAttrs: !1
};
function Fa(e, t, n, s, i, l) {
  return a(), u("div", Z({
    class: e.cx("root")
  }, e.ptmi("root")), [le(e.$slots, "default")], 16);
}
ii.render = Fa;
var Ta = {
  root: "p-inputicon"
}, Va = Ct.extend({
  name: "inputicon",
  classes: Ta
}), Da = {
  name: "BaseInputIcon",
  extends: Gt,
  style: Va,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, si = {
  name: "InputIcon",
  extends: Da,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Ra(e, t, n, s, i, l) {
  return a(), u("span", Z({
    class: l.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [le(e.$slots, "default")], 16);
}
si.render = Ra;
var Ba = {
  name: "BaseEditableHolder",
  extends: Gt,
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
        var n, s;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (s = n.register) === null || s === void 0 ? void 0 : s.call(n, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var n, s;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (s = n.register) === null || s === void 0 ? void 0 : s.call(n, this.$formName, t)) || {};
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
      var s, i;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (s = (i = this.formField).onChange) === null || s === void 0 || s.call(i, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
        n[s] = arguments[s];
      return n.find(At);
    }
  },
  computed: {
    $filled: function() {
      return At(this.d_value);
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
}, ai = {
  name: "BaseInput",
  extends: Ba,
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
}, Ha = `
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
`, Ua = {
  root: function(t) {
    var n = t.instance, s = t.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": s.size === "small",
      "p-inputtext-lg p-inputfield-lg": s.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, ja = Ct.extend({
  name: "inputtext",
  style: Ha,
  classes: Ua
}), Na = {
  name: "BaseInputText",
  extends: ai,
  style: ja,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function $n(e) {
  "@babel/helpers - typeof";
  return $n = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $n(e);
}
function Ka(e, t, n) {
  return (t = qa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function qa(e) {
  var t = Ga(e, "string");
  return $n(t) == "symbol" ? t : t + "";
}
function Ga(e, t) {
  if ($n(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if ($n(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var li = {
  name: "InputText",
  extends: Na,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return Z(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return mt(Ka({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Wa = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Za(e, t, n, s, i, l) {
  return a(), u("input", Z({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": l.dataP,
    onInput: t[0] || (t[0] = function() {
      return l.onInput && l.onInput.apply(l, arguments);
    })
  }, l.attrs), null, 16, Wa);
}
li.render = Za;
var Ya = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Xa = `
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
`, _o = Ct.extend({
  name: "virtualscroller",
  css: Xa,
  style: Ya
}), Ja = {
  name: "BaseVirtualScroller",
  extends: Gt,
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
  style: _o,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var t;
    _o.loadCSS({
      nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
    });
  }
};
function Cn(e) {
  "@babel/helpers - typeof";
  return Cn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Cn(e);
}
function xo(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function dn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? xo(Object(n), !0).forEach(function(s) {
      ri(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : xo(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function ri(e, t, n) {
  return (t = Qa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qa(e) {
  var t = el(e, "string");
  return Cn(t) == "symbol" ? t : t + "";
}
function el(e, t) {
  if (Cn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (Cn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ui = {
  name: "VirtualScroller",
  extends: Ja,
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
      En(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = ln(this.element), this.defaultHeight = rn(this.element), this.defaultContentWidth = ln(this.content), this.defaultContentHeight = rn(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", i = this.isBoth(), l = this.isHorizontal(), p = i ? t.every(function(f) {
        return f > -1;
      }) : t > -1;
      if (p) {
        var b = this.first, v = this.element, y = v.scrollTop, w = y === void 0 ? 0 : y, C = v.scrollLeft, M = C === void 0 ? 0 : C, E = this.calculateNumItems(), F = E.numToleratedItems, U = this.getContentPosition(), L = this.itemSize, j = function() {
          var k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, O = arguments.length > 1 ? arguments[1] : void 0;
          return k <= O ? 0 : k;
        }, N = function(k, O, ue) {
          return k * O + ue;
        }, P = function() {
          var k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, O = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: k,
            top: O,
            behavior: s
          });
        }, z = i ? {
          rows: 0,
          cols: 0
        } : 0, d = !1, ee = !1;
        i ? (z = {
          rows: j(t[0], F[0]),
          cols: j(t[1], F[1])
        }, P(N(z.cols, L[1], U.left), N(z.rows, L[0], U.top)), ee = this.lastScrollPos.top !== w || this.lastScrollPos.left !== M, d = z.rows !== b.rows || z.cols !== b.cols) : (z = j(t, F), l ? P(N(z, L, U.left), w) : P(M, N(z, L, U.top)), ee = this.lastScrollPos !== (l ? M : w), d = z !== b), this.isRangeChanged = d, ee && (this.first = z);
      }
    },
    scrollInView: function(t, n) {
      var s = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var l = this.isBoth(), p = this.isHorizontal(), b = l ? t.every(function(L) {
          return L > -1;
        }) : t > -1;
        if (b) {
          var v = this.getRenderedRange(), y = v.first, w = v.viewport, C = function() {
            var j = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return s.scrollTo({
              left: j,
              top: N,
              behavior: i
            });
          }, M = n === "to-start", E = n === "to-end";
          if (M) {
            if (l)
              w.first.rows - y.rows > t[0] ? C(w.first.cols * this.itemSize[1], (w.first.rows - 1) * this.itemSize[0]) : w.first.cols - y.cols > t[1] && C((w.first.cols - 1) * this.itemSize[1], w.first.rows * this.itemSize[0]);
            else if (w.first - y > t) {
              var F = (w.first - 1) * this.itemSize;
              p ? C(F, 0) : C(0, F);
            }
          } else if (E) {
            if (l)
              w.last.rows - y.rows <= t[0] + 1 ? C(w.first.cols * this.itemSize[1], (w.first.rows + 1) * this.itemSize[0]) : w.last.cols - y.cols <= t[1] + 1 && C((w.first.cols + 1) * this.itemSize[1], w.first.rows * this.itemSize[0]);
            else if (w.last - y <= t + 1) {
              var U = (w.first + 1) * this.itemSize;
              p ? C(U, 0) : C(0, U);
            }
          }
        }
      } else
        this.scrollToIndex(t, i);
    },
    getRenderedRange: function() {
      var t = function(C, M) {
        return Math.floor(C / (M || C));
      }, n = this.first, s = 0;
      if (this.element) {
        var i = this.isBoth(), l = this.isHorizontal(), p = this.element, b = p.scrollTop, v = p.scrollLeft;
        if (i)
          n = {
            rows: t(b, this.itemSize[0]),
            cols: t(v, this.itemSize[1])
          }, s = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var y = l ? v : b;
          n = t(y, this.itemSize), s = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: s
        }
      };
    },
    calculateNumItems: function() {
      var t = this.isBoth(), n = this.isHorizontal(), s = this.itemSize, i = this.getContentPosition(), l = this.element ? this.element.offsetWidth - i.left : 0, p = this.element ? this.element.offsetHeight - i.top : 0, b = function(M, E) {
        return Math.ceil(M / (E || M));
      }, v = function(M) {
        return Math.ceil(M / 2);
      }, y = t ? {
        rows: b(p, s[0]),
        cols: b(l, s[1])
      } : b(n ? l : p, s), w = this.d_numToleratedItems || (t ? [v(y.rows), v(y.cols)] : v(y));
      return {
        numItemsInViewport: y,
        numToleratedItems: w
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), s = this.first, i = this.calculateNumItems(), l = i.numItemsInViewport, p = i.numToleratedItems, b = function(w, C, M) {
        var E = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(w + C + (w < M ? 2 : 3) * M, E);
      }, v = n ? {
        rows: b(s.rows, l.rows, p[0]),
        cols: b(s.cols, l.cols, p[1], !0)
      } : b(s, l, p);
      this.last = v, this.numItemsInViewport = l, this.d_numToleratedItems = p, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: l.rows
      }).map(function() {
        return Array.from({
          length: l.cols
        });
      }) : Array.from({
        length: l
      })), this.lazy && Promise.resolve().then(function() {
        var y;
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: s.cols
          } : 0 : s,
          last: Math.min(t.step ? t.step : v, ((y = t.items) === null || y === void 0 ? void 0 : y.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), s = t.isHorizontal(), i = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var l = [ln(t.element), rn(t.element)], p = l[0], b = l[1];
          (n || s) && (t.element.style.width = p < t.defaultWidth ? p + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || i) && (t.element.style.height = b < t.defaultHeight ? b + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, i = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(i ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, s) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), s = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), i = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), l = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
        return {
          left: n,
          right: s,
          top: i,
          bottom: l,
          x: n + s,
          y: i + l
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
        var n = this.isBoth(), s = this.isHorizontal(), i = this.element.parentElement, l = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), p = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), b = function(y, w) {
          return t.element.style[y] = w;
        };
        n || s ? (b("height", p), b("width", l)) : b("height", p);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var s = this.isBoth(), i = this.isHorizontal(), l = this.getContentPosition(), p = function(v, y, w) {
          var C = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = dn(dn({}, t.spacerStyle), ri({}, "".concat(v), (y || []).length * w + C + "px"));
        };
        s ? (p("height", n, this.itemSize[0], l.y), p("width", this.columns || n[1], this.itemSize[1], l.x)) : i ? p("width", this.columns || n, this.itemSize, l.x) : p("height", n, this.itemSize, l.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var s = this.isBoth(), i = this.isHorizontal(), l = t ? t.first : this.first, p = function(w, C) {
          return w * C;
        }, b = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = dn(dn({}, n.contentStyle), {
            transform: "translate3d(".concat(w, "px, ").concat(C, "px, 0)")
          });
        };
        if (s)
          b(p(l.cols, this.itemSize[1]), p(l.rows, this.itemSize[0]));
        else {
          var v = p(l, this.itemSize);
          i ? b(v, 0) : b(0, v);
        }
      }
    },
    onScrollPositionChange: function(t) {
      var n = this, s = t.target, i = this.isBoth(), l = this.isHorizontal(), p = this.getContentPosition(), b = function(R, Q) {
        return R ? R > Q ? R - Q : R : 0;
      }, v = function(R, Q) {
        return Math.floor(R / (Q || R));
      }, y = function(R, Q, K, ne, I, V) {
        return R <= I ? I : V ? K - ne - I : Q + I - 1;
      }, w = function(R, Q, K, ne, I, V, W, te) {
        if (R <= V) return 0;
        var se = Math.max(0, W ? R < Q ? K : R - V : R > Q ? K : R - 2 * V), ie = n.getLast(se, te);
        return se > ie ? ie - I : se;
      }, C = function(R, Q, K, ne, I, V) {
        var W = Q + ne + 2 * I;
        return R >= I && (W += I + 1), n.getLast(W, V);
      }, M = b(s.scrollTop, p.top), E = b(s.scrollLeft, p.left), F = i ? {
        rows: 0,
        cols: 0
      } : 0, U = this.last, L = !1, j = this.lastScrollPos;
      if (i) {
        var N = this.lastScrollPos.top <= M, P = this.lastScrollPos.left <= E;
        if (!this.appendOnly || this.appendOnly && (N || P)) {
          var z = {
            rows: v(M, this.itemSize[0]),
            cols: v(E, this.itemSize[1])
          }, d = {
            rows: y(z.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], N),
            cols: y(z.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], P)
          };
          F = {
            rows: w(z.rows, d.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], N),
            cols: w(z.cols, d.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], P, !0)
          }, U = {
            rows: C(z.rows, F.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: C(z.cols, F.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, L = F.rows !== this.first.rows || U.rows !== this.last.rows || F.cols !== this.first.cols || U.cols !== this.last.cols || this.isRangeChanged, j = {
            top: M,
            left: E
          };
        }
      } else {
        var ee = l ? E : M, f = this.lastScrollPos <= ee;
        if (!this.appendOnly || this.appendOnly && f) {
          var k = v(ee, this.itemSize), O = y(k, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, f);
          F = w(k, O, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, f), U = C(k, F, this.last, this.numItemsInViewport, this.d_numToleratedItems), L = F !== this.first || U !== this.last || this.isRangeChanged, j = ee;
        }
      }
      return {
        first: F,
        last: U,
        isRangeChanged: L,
        scrollPos: j
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), s = n.first, i = n.last, l = n.isRangeChanged, p = n.scrollPos;
      if (l) {
        var b = {
          first: s,
          last: i
        };
        if (this.setContentPosition(b), this.first = s, this.last = i, this.lastScrollPos = p, this.$emit("scroll-index-change", b), this.lazy && this.isPageChanged(s)) {
          var v, y, w = {
            first: this.step ? Math.min(this.getPageByFirst(s) * this.step, (((v = this.items) === null || v === void 0 ? void 0 : v.length) || 0) - this.step) : s,
            last: Math.min(this.step ? (this.getPageByFirst(s) + 1) * this.step : i, ((y = this.items) === null || y === void 0 ? void 0 : y.length) || 0)
          }, C = this.lazyLoadState.first !== w.first || this.lazyLoadState.last !== w.last;
          C && this.$emit("lazy-load", w), this.lazyLoadState = w;
        }
      }
    },
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var s = this.onScrollPositionChange(t), i = s.isRangeChanged, l = i || (this.step ? this.isPageChanged() : !1);
            l && (this.d_loading = !0);
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
        if (En(t.element)) {
          var n = t.isBoth(), s = t.isVertical(), i = t.isHorizontal(), l = [ln(t.element), rn(t.element)], p = l[0], b = l[1], v = p !== t.defaultWidth, y = b !== t.defaultHeight, w = n ? v || y : i ? v : s ? y : !1;
          w && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = p, t.defaultHeight = b, t.defaultContentWidth = ln(t.content), t.defaultContentHeight = rn(t.content), t.init());
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
      var n = (this.items || []).length, s = this.isBoth() ? this.first.rows + t : this.first + t;
      return {
        index: s,
        count: n,
        first: s === 0,
        last: s === n - 1,
        even: s % 2 === 0,
        odd: s % 2 !== 0
      };
    },
    getLoaderOptions: function(t, n) {
      var s = this.loaderArr.length;
      return dn({
        index: t,
        count: s,
        first: t === 0,
        last: t === s - 1,
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
      this.content = t || this.content || jo(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Rn
  }
}, tl = ["tabindex"];
function nl(e, t, n, s, i, l) {
  var p = Ae("SpinnerIcon");
  return e.disabled ? (a(), u(J, {
    key: 1
  }, [le(e.$slots, "default"), le(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: l.loadedColumns
  })], 64)) : (a(), u("div", Z({
    key: 0,
    ref: l.elementRef,
    class: l.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return l.onScroll && l.onScroll.apply(l, arguments);
    })
  }, e.ptmi("root")), [le(e.$slots, "content", {
    styleClass: l.contentClass,
    items: l.loadedItems,
    getItemOptions: l.getOptions,
    loading: i.d_loading,
    getLoaderOptions: l.getLoaderOptions,
    itemSize: e.itemSize,
    rows: l.loadedRows,
    columns: l.loadedColumns,
    contentRef: l.contentRef,
    spacerStyle: i.spacerStyle,
    contentStyle: i.contentStyle,
    vertical: l.isVertical(),
    horizontal: l.isHorizontal(),
    both: l.isBoth()
  }, function() {
    return [r("div", Z({
      ref: l.contentRef,
      class: l.contentClass,
      style: i.contentStyle
    }, e.ptm("content")), [(a(!0), u(J, null, re(l.loadedItems, function(b, v) {
      return le(e.$slots, "item", {
        key: v,
        item: b,
        options: l.getOptions(v)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (a(), u("div", Z({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, e.ptm("spacer")), null, 16)) : h("", !0), !e.loaderDisabled && e.showLoader && i.d_loading ? (a(), u("div", Z({
    key: 1,
    class: l.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (a(!0), u(J, {
    key: 0
  }, re(i.loaderArr, function(b, v) {
    return le(e.$slots, "loader", {
      key: v,
      options: l.getLoaderOptions(v, l.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : h("", !0), le(e.$slots, "loadingicon", {}, function() {
    return [m(p, Z({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : h("", !0)], 16, tl));
}
ui.render = nl;
var ol = `
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
`, il = {
  root: function(t) {
    var n = t.instance, s = t.props, i = t.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": s.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": i.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": i.focused || i.overlayVisible,
      "p-select-open": i.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": s.size === "small",
      "p-select-lg p-inputfield-lg": s.size === "large"
    }];
  },
  label: function(t) {
    var n, s = t.instance, i = t.props;
    return ["p-select-label", {
      "p-placeholder": !i.editable && s.label === i.placeholder,
      "p-select-label-empty": !i.editable && !s.$slots.value && (s.label === "p-emptylabel" || ((n = s.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = t.instance, s = t.props, i = t.state, l = t.option, p = t.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(l) && s.highlightOnSelect,
      "p-focus": i.focusedOptionIndex === p,
      "p-disabled": n.isOptionDisabled(l)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, sl = Ct.extend({
  name: "select",
  style: ol,
  classes: il
}), al = {
  name: "BaseSelect",
  extends: ai,
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
  style: sl,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function In(e) {
  "@babel/helpers - typeof";
  return In = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, In(e);
}
function ll(e) {
  return cl(e) || dl(e) || ul(e) || rl();
}
function rl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ul(e, t) {
  if (e) {
    if (typeof e == "string") return Qn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qn(e, t) : void 0;
  }
}
function dl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function cl(e) {
  if (Array.isArray(e)) return Qn(e);
}
function Qn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Oo(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function Lo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Oo(Object(n), !0).forEach(function(s) {
      Nt(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Oo(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Nt(e, t, n) {
  return (t = pl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function pl(e) {
  var t = fl(e, "string");
  return In(t) == "symbol" ? t : t + "";
}
function fl(e, t) {
  if (In(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (In(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var zn = {
  name: "Select",
  extends: al,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (en.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? Jt(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? Jt(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? Jt(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
    },
    getPTItemOptions: function(t, n, s, i) {
      return this.ptm(i, {
        context: {
          option: t,
          index: s,
          selected: this.isSelected(t),
          focused: this.focusedOptionIndex === this.getOptionIndex(s, n),
          disabled: this.isOptionDisabled(t)
        }
      });
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? Jt(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return Jt(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return Jt(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(s) {
        return n.isOptionGroup(s);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && Me(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, s = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && Me(n.$refs.focusInput);
      };
      setTimeout(function() {
        s();
      }, 0);
    },
    onFocus: function(t) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", t));
    },
    onBlur: function(t) {
      var n = this;
      setTimeout(function() {
        var s, i;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", t), (s = (i = n.formField).onBlur) === null || s === void 0 || s.call(i, t);
      }, 100);
    },
    onKeyDown: function(t) {
      var n = this;
      if (this.disabled) {
        t.preventDefault();
        return;
      }
      if (Ai())
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
      var s = t.metaKey || t.ctrlKey;
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
          !s && Mi(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && Me(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var s = this.searchOptions(t, n);
      !s && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && At(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Qt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Me(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Do(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Me(n);
    },
    onOptionSelect: function(t, n) {
      var s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var i = this.getOptionValue(n);
        this.updateModel(t, i), s && this.hide(!0);
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
      zi.emit("overlay-click", {
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
        var s = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, s), !this.overlayVisible && this.show(), t.preventDefault();
      }
    },
    onArrowLeftKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var s = t.currentTarget;
        t.shiftKey ? s.setSelectionRange(0, t.target.selectionStart) : (s.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(t, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onEndKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var s = t.currentTarget;
        if (t.shiftKey)
          s.setSelectionRange(t.target.selectionStart, s.value.length);
        else {
          var i = s.value.length;
          s.setSelectionRange(i, i), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (Me(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      en.set("overlay", t, this.$primevue.config.zIndex.overlay), Uo(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && Me(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && Me(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      en.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Oi(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = Ho(this.$el) + "px", Li(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var s = n.composedPath();
        t.overlayVisible && t.overlay && !s.includes(t.$el) && !s.includes(t.overlay) && t.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var t = this;
      this.scrollHandler || (this.scrollHandler = new xi(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !_i() && t.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var t = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && En(n) && (this.labelClickListener = function() {
          Me(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && En(t) && t.removeEventListener("click", this.labelClickListener);
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
      return Ii(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return At(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
    },
    isValidSelectedOption: function(t) {
      return this.isValidOption(t) && this.isSelected(t);
    },
    isSelected: function(t) {
      return Ci(this.d_value, this.getOptionValue(t), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var t = this;
      return ho(this.visibleOptions, function(n) {
        return t.isValidOption(n);
      });
    },
    findNextOptionIndex: function(t) {
      var n = this, s = t < this.visibleOptions.length - 1 ? this.visibleOptions.slice(t + 1).findIndex(function(i) {
        return n.isValidOption(i);
      }) : -1;
      return s > -1 ? s + t + 1 : t;
    },
    findPrevOptionIndex: function(t) {
      var n = this, s = t > 0 ? ho(this.visibleOptions.slice(0, t), function(i) {
        return n.isValidOption(i);
      }) : -1;
      return s > -1 ? s : t;
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
      var s = this;
      this.searchValue = (this.searchValue || "") + n;
      var i = -1, l = !1;
      return At(this.searchValue) && (i = this.visibleOptions.findIndex(function(p) {
        return s.isOptionExactMatched(p);
      }), i === -1 && (i = this.visibleOptions.findIndex(function(p) {
        return s.isOptionStartsWith(p);
      })), i !== -1 && (l = !0), i === -1 && this.focusedOptionIndex === -1 && (i = this.findFirstFocusedOptionIndex()), i !== -1 && this.changeFocusedOptionIndex(t, i)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        s.searchValue = "", s.searchTimeout = null;
      }, 500), l;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var s = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, i = jo(t.list, 'li[id="'.concat(s, '"]'));
        i ? i.scrollIntoView && i.scrollIntoView({
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
      return (t || []).reduce(function(s, i, l) {
        s.push({
          optionGroup: i,
          group: !0,
          index: l
        });
        var p = n.getOptionGroupChildren(i);
        return p && p.forEach(function(b) {
          return s.push(b);
        }), s;
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
        var s = $i.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], l = [];
          return i.forEach(function(p) {
            var b = t.getOptionGroupChildren(p), v = b.filter(function(y) {
              return s.includes(y);
            });
            v.length > 0 && l.push(Lo(Lo({}, p), {}, Nt({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", ll(v))));
          }), this.flatOptions(l);
        }
        return s;
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
      return At(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return mt(Nt({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return mt(Nt(Nt({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return mt(Nt({}, this.size, this.size));
    },
    overlayDataP: function() {
      return mt(Nt({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: ao
  },
  components: {
    InputText: li,
    VirtualScroller: ui,
    Portal: Bo,
    InputIcon: si,
    IconField: ii,
    TimesIcon: po,
    ChevronDownIcon: ni,
    SpinnerIcon: Rn,
    SearchIcon: oi,
    CheckIcon: ti,
    BlankIcon: ei
  }
}, ml = ["id", "data-p"], hl = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], bl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], vl = ["data-p"], gl = ["id"], yl = ["id"], kl = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function wl(e, t, n, s, i, l) {
  var p = Ae("SpinnerIcon"), b = Ae("InputText"), v = Ae("SearchIcon"), y = Ae("InputIcon"), w = Ae("IconField"), C = Ae("CheckIcon"), M = Ae("BlankIcon"), E = Ae("VirtualScroller"), F = Ae("Portal"), U = lo("ripple");
  return a(), u("div", Z({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return l.onContainerClick && l.onContainerClick.apply(l, arguments);
    }),
    "data-p": l.containerDataP
  }, e.ptmi("root")), [e.editable ? (a(), u("input", Z({
    key: 0,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    type: "text",
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    value: l.editableInputValue,
    placeholder: e.placeholder,
    tabindex: e.disabled ? -1 : e.tabindex,
    disabled: e.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": i.overlayVisible ? e.$id + "_list" : void 0,
    "aria-activedescendant": i.focused ? l.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return l.onFocus && l.onFocus.apply(l, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return l.onBlur && l.onBlur.apply(l, arguments);
    }),
    onKeydown: t[2] || (t[2] = function() {
      return l.onKeyDown && l.onKeyDown.apply(l, arguments);
    }),
    onInput: t[3] || (t[3] = function() {
      return l.onEditableInput && l.onEditableInput.apply(l, arguments);
    }),
    "data-p": l.labelDataP
  }, e.ptm("label")), null, 16, hl)) : (a(), u("span", Z({
    key: 1,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    tabindex: e.disabled ? -1 : e.tabindex,
    role: "combobox",
    "aria-label": e.ariaLabel || (l.label === "p-emptylabel" ? void 0 : l.label),
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": i.focused ? l.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    "aria-disabled": e.disabled,
    onFocus: t[4] || (t[4] = function() {
      return l.onFocus && l.onFocus.apply(l, arguments);
    }),
    onBlur: t[5] || (t[5] = function() {
      return l.onBlur && l.onBlur.apply(l, arguments);
    }),
    onKeydown: t[6] || (t[6] = function() {
      return l.onKeyDown && l.onKeyDown.apply(l, arguments);
    }),
    "data-p": l.labelDataP
  }, e.ptm("label")), [le(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var L;
    return [A(c(l.label === "p-emptylabel" ? " " : (L = l.label) !== null && L !== void 0 ? L : "empty"), 1)];
  })], 16, bl)), l.isClearIconVisible ? le(e.$slots, "clearicon", {
    key: 2,
    class: ae(e.cx("clearIcon")),
    clearCallback: l.onClearClick
  }, function() {
    return [(a(), be(fn(e.clearIcon ? "i" : "TimesIcon"), Z({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: l.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : h("", !0), r("div", Z({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? le(e.$slots, "loadingicon", {
    key: 0,
    class: ae(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (a(), u("span", Z({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (a(), be(p, Z({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : le(e.$slots, "dropdownicon", {
    key: 1,
    class: ae(e.cx("dropdownIcon"))
  }, function() {
    return [(a(), be(fn(e.dropdownIcon ? "span" : "ChevronDownIcon"), Z({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": l.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), m(F, {
    appendTo: e.appendTo
  }, {
    default: oe(function() {
      return [m(No, Z({
        name: "p-anchored-overlay",
        onEnter: l.onOverlayEnter,
        onAfterEnter: l.onOverlayAfterEnter,
        onLeave: l.onOverlayLeave,
        onAfterLeave: l.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: oe(function() {
          return [i.overlayVisible ? (a(), u("div", Z({
            key: 0,
            ref: l.overlayRef,
            class: [e.cx("overlay"), e.panelClass, e.overlayClass],
            style: [e.panelStyle, e.overlayStyle],
            onClick: t[10] || (t[10] = function() {
              return l.onOverlayClick && l.onOverlayClick.apply(l, arguments);
            }),
            onKeydown: t[11] || (t[11] = function() {
              return l.onOverlayKeyDown && l.onOverlayKeyDown.apply(l, arguments);
            }),
            "data-p": l.overlayDataP
          }, e.ptm("overlay")), [r("span", Z({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[7] || (t[7] = function() {
              return l.onFirstHiddenFocus && l.onFirstHiddenFocus.apply(l, arguments);
            })
          }, e.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), le(e.$slots, "header", {
            value: e.d_value,
            options: l.visibleOptions
          }), e.filter ? (a(), u("div", Z({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [m(w, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: oe(function() {
              return [m(b, {
                ref: "filterInput",
                type: "text",
                value: i.filterValue,
                onVnodeMounted: l.onFilterUpdated,
                onVnodeUpdated: l.onFilterUpdated,
                class: ae(e.cx("pcFilter")),
                placeholder: e.filterPlaceholder,
                variant: e.variant,
                unstyled: e.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": e.$id + "_list",
                "aria-activedescendant": l.focusedOptionId,
                onKeydown: l.onFilterKeyDown,
                onBlur: l.onFilterBlur,
                onInput: l.onFilterChange,
                pt: e.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), m(y, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: oe(function() {
                  return [le(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (a(), u("span", Z({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (a(), be(v, Fi(Z({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), r("span", Z({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), c(l.filterResultMessageText), 17)], 16)) : h("", !0), r("div", Z({
            class: e.cx("listContainer"),
            style: {
              "max-height": l.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [m(E, Z({
            ref: l.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: l.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: l.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), Ti({
            content: oe(function(L) {
              var j = L.styleClass, N = L.contentRef, P = L.items, z = L.getItemOptions, d = L.contentStyle, ee = L.itemSize;
              return [r("ul", Z({
                ref: function(k) {
                  return l.listRef(k, N);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), j],
                style: d,
                role: "listbox"
              }, e.ptm("list")), [(a(!0), u(J, null, re(P, function(f, k) {
                return a(), u(J, {
                  key: l.getOptionRenderKey(f, l.getOptionIndex(k, z))
                }, [l.isOptionGroup(f) ? (a(), u("li", Z({
                  key: 0,
                  id: e.$id + "_" + l.getOptionIndex(k, z),
                  style: {
                    height: ee ? ee + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [le(e.$slots, "optiongroup", {
                  option: f.optionGroup,
                  index: l.getOptionIndex(k, z)
                }, function() {
                  return [r("span", Z({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), c(l.getOptionGroupLabel(f.optionGroup)), 17)];
                })], 16, yl)) : Be((a(), u("li", Z({
                  key: 1,
                  id: e.$id + "_" + l.getOptionIndex(k, z),
                  class: e.cx("option", {
                    option: f,
                    focusedOption: l.getOptionIndex(k, z)
                  }),
                  style: {
                    height: ee ? ee + "px" : void 0
                  },
                  role: "option",
                  "aria-label": l.getOptionLabel(f),
                  "aria-selected": l.isSelected(f),
                  "aria-disabled": l.isOptionDisabled(f),
                  "aria-setsize": l.ariaSetSize,
                  "aria-posinset": l.getAriaPosInset(l.getOptionIndex(k, z)),
                  onMousedown: function(ue) {
                    return l.onOptionSelect(ue, f);
                  },
                  onMousemove: function(ue) {
                    return l.onOptionMouseMove(ue, l.getOptionIndex(k, z));
                  },
                  onClick: t[8] || (t[8] = xn(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && l.isSelected(f),
                  "data-p-focused": i.focusedOptionIndex === l.getOptionIndex(k, z),
                  "data-p-disabled": l.isOptionDisabled(f)
                }, {
                  ref_for: !0
                }, l.getPTItemOptions(f, z, k, "option")), [e.checkmark ? (a(), u(J, {
                  key: 0
                }, [l.isSelected(f) ? (a(), be(C, Z({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (a(), be(M, Z({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : h("", !0), le(e.$slots, "option", {
                  option: f,
                  selected: l.isSelected(f),
                  index: l.getOptionIndex(k, z)
                }, function() {
                  return [r("span", Z({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), c(l.getOptionLabel(f)), 17)];
                })], 16, kl)), [[U]])], 64);
              }), 128)), i.filterValue && (!P || P && P.length === 0) ? (a(), u("li", Z({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [le(e.$slots, "emptyfilter", {}, function() {
                return [A(c(l.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (a(), u("li", Z({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [le(e.$slots, "empty", {}, function() {
                return [A(c(l.emptyMessageText), 1)];
              })], 16)) : h("", !0)], 16, gl)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: oe(function(L) {
              var j = L.options;
              return [le(e.$slots, "loader", {
                options: j
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), le(e.$slots, "footer", {
            value: e.d_value,
            options: l.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (a(), u("span", Z({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), c(l.emptyMessageText), 17)) : h("", !0), r("span", Z({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), c(l.selectedMessageText), 17), r("span", Z({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[9] || (t[9] = function() {
              return l.onLastHiddenFocus && l.onLastHiddenFocus.apply(l, arguments);
            })
          }, e.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, vl)) : h("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, ml);
}
zn.render = wl;
const Sl = 2e3;
function zo(e) {
  const t = e.margin ?? 8, n = e.gap ?? 4, s = Math.max(0, e.viewportWidth), i = Math.max(0, e.viewportHeight), l = Math.max(0, s - t * 2), p = Math.min(Math.max(0, e.requestedWidth), l), b = e.align === "right" ? e.anchor.right - p : e.anchor.left, v = Math.max(t, Math.min(b, s - t - p)), y = Math.max(0, i - e.anchor.bottom - n - t), w = Math.max(0, e.anchor.top - n - t), C = y < e.requestedMaxHeight && w > y ? "above" : "below", M = C === "above" ? w : y, E = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), M)), F = Math.min(Math.max(0, e.panelHeight ?? E), E), U = C === "above" ? e.anchor.top - n - F : e.anchor.bottom + n, L = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(v - L.left),
    width: Math.round(p),
    maxHeight: E,
    side: C,
    top: Math.round(U - L.top)
  };
}
const di = /* @__PURE__ */ on({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Sl }
  },
  emits: ["update:open"],
  setup(e, { emit: t }) {
    const n = e, s = t, i = B(null), l = B({ position: "fixed", visibility: "hidden" });
    function p() {
      const U = n.anchor, L = i.value;
      if (!U || !L) return;
      const j = U.getBoundingClientRect(), N = n.width === "anchor" ? Math.max(n.minWidth, j.width) : Math.max(n.minWidth, n.width), P = {
        anchor: j,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: N,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, z = zo(P);
      Object.assign(L.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${z.width}px`,
        maxHeight: `${z.maxHeight}px`,
        visibility: "hidden"
      });
      const d = L.getBoundingClientRect(), ee = zo({
        ...P,
        containingBlockOrigin: { left: d.left, top: d.top },
        panelHeight: d.height
      }), f = {
        position: "fixed",
        left: `${ee.left}px`,
        top: `${ee.top}px`,
        width: `${ee.width}px`,
        maxHeight: `${ee.maxHeight}px`,
        "--anchored-panel-available-height": `${ee.maxHeight}px`,
        margin: "0",
        zIndex: String(n.zIndex),
        visibility: "visible"
      };
      l.value = f;
    }
    let b = null, v = !1;
    function y() {
      v || !n.open || (v = !0, requestAnimationFrame(() => {
        v = !1, n.open && p();
      }));
    }
    function w() {
      typeof ResizeObserver > "u" || (b = new ResizeObserver(y), i.value && b.observe(i.value), n.anchor && b.observe(n.anchor));
    }
    function C() {
      b?.disconnect(), b = null, v = !1;
    }
    qe(() => n.open, async (U) => {
      C(), U && (l.value = { position: "fixed", visibility: "hidden" }, await mn(), p(), w());
    }, { immediate: !0 });
    function M(U) {
      if (!n.open) return;
      const L = U.composedPath();
      i.value && L.includes(i.value) || n.anchor && L.includes(n.anchor) || s("update:open", !1);
    }
    function E(U) {
      !n.open || U.key !== "Escape" || (U.preventDefault(), U.stopImmediatePropagation(), s("update:open", !1));
    }
    function F() {
      n.open && p();
    }
    return document.addEventListener("click", M), document.addEventListener("keydown", E, !0), window.addEventListener("resize", F), window.addEventListener("scroll", F, !0), Ko(() => {
      C(), document.removeEventListener("click", M), document.removeEventListener("keydown", E, !0), window.removeEventListener("resize", F), window.removeEventListener("scroll", F, !0);
    }), (U, L) => e.open ? (a(), u("div", {
      key: 0,
      ref_key: "panel",
      ref: i,
      class: "anchored-panel",
      style: Kt(l.value)
    }, [
      le(U.$slots, "default")
    ], 4)) : h("", !0);
  }
});
function $l(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const n = e.trim();
    if (/^\d+$/.test(n))
      t = Number(n);
    else {
      const s = Date.parse(n);
      return Number.isNaN(s) ? null : s;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function Dn(e, t) {
  const n = $l(e);
  if (n === null) return "";
  const s = t?.now ?? Date.now(), i = t?.suffix ?? !0, l = t?.maxUnit ?? "day", p = t?.future ?? !1, b = 6e4, v = 60 * b, y = 24 * v, w = 30 * y, C = 365 * y, M = s - n;
  if (p && M < 0) {
    const U = -M;
    return U < b ? "in <1m" : U < v ? `in ${Math.floor(U / b)}m` : U < y ? `in ${Math.floor(U / v)}h` : `in ${Math.floor(U / y)}d`;
  }
  const E = Math.max(0, M);
  if (E < b) return "just now";
  const F = i ? " ago" : "";
  return E < v ? `${Math.floor(E / b)}m${F}` : E < y ? `${Math.floor(E / v)}h${F}` : l === "year" ? E < w ? `${Math.floor(E / y)}d${F}` : E < C ? `${Math.floor(E / w)}mo${F}` : `${Math.floor(E / C)}y${F}` : `${Math.floor(E / y)}d${F}`;
}
const eo = {
  tool: { label: "Tools", icon: "tabler:tool" },
  "agent.trait": { label: "Agent capabilities", icon: "tabler:robot" },
  "contract.binding": { label: "Contract bindings", icon: "tabler:plug-connected" },
  "contract.definition": { label: "Contracts", icon: "tabler:file-description" },
  "view.page": { label: "Pages", icon: "tabler:browser" },
  "view.component": { label: "Components", icon: "tabler:components" }
};
function Cl(e) {
  const t = e.meta?.type || "";
  return t && eo[t] ? t : e.kind;
}
function Il(e) {
  return String(e.id).split(":").pop() || e.id;
}
function _l(e) {
  const t = e.meta || {};
  return String(t.comment || t.title || "");
}
function xl(e, t) {
  return String(e.meta?.icon || t);
}
function ot(e, t) {
  const n = t instanceof Error ? t.message : String(t);
  console.error(`[${e}]`, n, t);
}
function to() {
  window.dispatchEvent(new CustomEvent("kickside:modules-changed")), window.dispatchEvent(new CustomEvent("kickside:nav-changed"));
}
function Ol(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e.dependencies || []) {
    const s = String(n.component || n.name || n.id || "");
    s && t.set(s, {
      ...n,
      dependencyId: n.id,
      component: s,
      is_root: n.is_root ?? !0,
      used_by: n.used_by || [],
      used_by_count: n.used_by_count || 0,
      source: n.source || "hub"
    });
  }
  for (const n of e.modules || []) {
    const s = String(n.name || "");
    if (!s) continue;
    const i = t.get(s);
    if (i)
      t.set(s, {
        ...i,
        version: i.version || n.version || "",
        is_root: i.is_root ?? n.is_root ?? !n.transitive,
        used_by: i.used_by || n.used_by || [],
        used_by_count: i.used_by_count ?? n.used_by_count ?? 0,
        source: i.source || n.source || "hub"
      });
    else {
      const l = n.used_by || [], p = n.used_by_count || l.length || 0;
      if (n.is_root !== !0 && n.transitive === !0 && p === 0) continue;
      const b = s.split("/");
      t.set(s, {
        id: s,
        namespace: b.length > 1 ? b[0] : "",
        name: b[b.length - 1] || s,
        component: s,
        version: n.version || "",
        is_root: n.is_root ?? !n.transitive,
        used_by: l,
        used_by_count: p,
        source: n.source || "local"
      });
    }
  }
  return Array.from(t.values()).filter((n) => n.installed !== !1);
}
function Ao(e) {
  const t = e.migrations || [];
  if (t.length === 0) return "";
  const n = t.filter((l) => l.status === "applied").length, s = t.filter((l) => l.status === "pending").length, i = [];
  return n > 0 && i.push(`${n} applied`), s > 0 && i.push(`${s} pending`), i.join(", ") || `${t.length} migrations`;
}
function Ll({ hub: e, installed: t, catalog: n, installedDepFor: s, installedCanUpdate: i, installedUpdateDisabledReason: l, installedCanUninstall: p, installedIsPrivate: b }) {
  const v = B(null), y = B(null), w = B(""), C = B([]), M = B(!1), E = B("readme"), F = B([]), U = q(() => C.value.filter((K) => K.kind === "env.variable")), L = q(() => C.value.filter((K) => K.kind === "ns.requirement")), j = q(() => {
    const K = {};
    for (const ne of C.value) {
      if (ne.kind === "env.variable" || ne.kind === "ns.requirement") continue;
      const I = Cl(ne);
      (K[I] ||= []).push(ne);
    }
    return Object.entries(K).map(([ne, I]) => ({
      key: ne,
      label: eo[ne]?.label || ne,
      icon: eo[ne]?.icon || "tabler:point",
      items: I
    })).sort((ne, I) => I.items.length - ne.items.length);
  }), N = q(() => F.value.find((K) => K.version === v.value?.version) || F.value[0]), P = q(() => v.value ? s(v.value.component) : void 0), z = q(() => !!(P.value && i(P.value))), d = q(() => P.value && !i(P.value) ? l(P.value) : ""), ee = q(() => !!(P.value && p(P.value))), f = q(() => hn(y.value) || !!(P.value && b(P.value)));
  async function k(K) {
    try {
      const ne = t.value.find((W) => W.component === K);
      return ne?.entries ? ne.entries : ((await e.listDependencies({ component: K, includeMigrations: !1 })).dependencies || []).find((W) => W.component === K)?.entries || [];
    } catch (ne) {
      return ot("modules:entries", ne), [];
    }
  }
  async function O(K, ne) {
    if (ne && ne.full_name) return ne;
    const I = n.value.find((V) => Fn(V, K));
    if (I) return I;
    try {
      const V = K.split("/").pop() || K, te = ((await e.browseModules({ query: V, pageSize: 50 })).items || []).find((se) => Fn(se, K));
      if (te) return te;
    } catch {
    }
    return { full_name: K, component: K, latest_version: "", type: "library" };
  }
  async function ue(K) {
    const ne = "component" in K && typeof K.component == "string" && !("full_name" in K) ? K.component : Pn(K), I = s(ne), V = "full_name" in K ? K : void 0;
    v.value = {
      component: ne,
      label: V ? tn(V) : ne,
      description: V?.description || "",
      version: I ? ht(I) : String(V?.latest_version || ""),
      installed: !!I,
      installedId: I?.id
    }, y.value = V || null, w.value = "", C.value = [], F.value = [], E.value = "readme", M.value = !0;
    try {
      const [W, te, se, ie] = await Promise.all([
        O(ne, V),
        e.getReadme(ne).then((pe) => pe.content || "").catch(() => ""),
        I ? k(ne) : Promise.resolve([]),
        e.listVersions(ne).then((pe) => pe.items || []).catch(() => [])
      ]);
      y.value = W, w.value = te, C.value = se, F.value = ie, v.value && (v.value = {
        ...v.value,
        label: tn(W),
        description: W.description || v.value.description,
        version: I ? ht(I) : String(W.latest_version || v.value.version)
      }), te || (E.value = "overview");
    } finally {
      M.value = !1;
    }
  }
  function R() {
    v.value = null;
  }
  async function Q() {
    if (!v.value) return;
    const K = v.value.component, ne = s(K);
    v.value = {
      ...v.value,
      installed: !!ne,
      installedId: ne?.id,
      version: ne ? ht(ne) : v.value.version
    }, C.value = ne ? await k(K) : [];
  }
  return {
    selected: v,
    selectedModule: y,
    detailReadme: w,
    detailEntries: C,
    detailLoading: M,
    detailTab: E,
    detailVersions: F,
    envVars: U,
    requirements: L,
    detailGroups: j,
    versionMeta: N,
    selectedInstalledDep: P,
    selectedCanUpdate: z,
    selectedUpdateDisabledReason: d,
    selectedCanUninstall: ee,
    selectedIsPrivate: f,
    loadEntriesFor: k,
    findModule: O,
    openDetail: ue,
    closeDetail: R,
    refreshSelectedDetail: Q
  };
}
const zl = [
  { until: 1e3, label: "Planning uninstall" },
  { until: 4e3, label: "Stopping services" },
  { until: 6e3, label: "Removing entries" },
  { until: 8e3, label: "Updating lock" },
  { until: 1 / 0, label: "Finalizing" }
];
function Al(e, t) {
  const n = B(0);
  let s = 0, i = null;
  function l() {
    i && (clearInterval(i), i = null);
  }
  qe(e, (v) => {
    l(), v ? (s = Date.now(), n.value = 0, i = setInterval(() => {
      n.value = Date.now() - s;
    }, 200)) : n.value = 0;
  }), ro(l);
  const p = q(() => t.find((v) => n.value < v.until)?.label || t[t.length - 1].label), b = q(() => Math.floor(n.value / 1e3));
  return { phase: p, elapsedSec: b };
}
function Ml({ hub: e, selected: t, selectedInstalledDep: n, installedIsRoot: s, installedUninstallDisabledReason: i, installedCanUninstall: l, refreshAll: p, refreshSelectedDetail: b, showToast: v, notifyModulesChanged: y }) {
  const w = B(!1), C = B(null), M = B("block"), E = B(!1), F = B(!1), U = B(null), L = B([]), j = B(null), N = B(null), P = B([]), { phase: z, elapsedSec: d } = Al(E, zl), ee = q(() => {
    const Q = n.value;
    return !t.value?.installed || !Q || s(Q) ? "" : i(Q);
  }), f = q(() => C.value ? E.value ? "Uninstall is running." : F.value ? "Waiting for uninstall preview to finish." : P.value.length > 0 ? `Still required by: ${P.value.join(", ")}. Uninstall those root modules first.` : j.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : N.value && !U.value ? N.value : U.value ? "" : "Run Preview first so Keeper can show what will be removed." : ""), k = q(() => C.value ? E.value ? "Uninstall is running." : F.value ? "Waiting for uninstall preview to finish." : P.value.length > 0 ? `Still required by: ${P.value.join(", ")}. Uninstall those root modules first.` : j.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : "" : "No module selected.");
  async function O(Q) {
    l(Q) && (C.value = Q, M.value = "block", j.value = null, N.value = null, P.value = [], U.value = null, L.value = [], w.value = !0, ue());
  }
  async function ue() {
    const Q = C.value;
    if (Q) {
      F.value = !0, j.value = null, N.value = null, P.value = [], U.value = null, L.value = [];
      try {
        const K = await e.uninstall({ id: Q.id, component: Q.component, dry_run: !0, migration_policy: M.value });
        U.value = K.preview || K.payload?.preview || null, U.value || (N.value = "Uninstall preview returned no preview data.");
      } catch (K) {
        if (ot("modules:uninstall-preview", K), K instanceof qt && (j.value = K.code, P.value = bo(K.details), K.code === "NOT_FOUND")) {
          w.value = !1, C.value = null, v("ok", "Module already removed; refreshed installed modules"), await p(), await b();
          return;
        }
        N.value = Ee(K, "uninstall preview failed");
      } finally {
        F.value = !1;
      }
    }
  }
  async function R() {
    const Q = C.value;
    if (!(!Q || k.value)) {
      E.value = !0, j.value = null, N.value = null, L.value = [];
      try {
        const K = await e.uninstall({ id: Q.id, component: Q.component, migration_policy: M.value });
        L.value = Nn(K), v("ok", `Module uninstalled: ${Q.id}`), y(), await p(), await b();
      } catch (K) {
        if (ot("modules:uninstall", K), K instanceof qt && (j.value = K.code, P.value = bo(K.details), L.value = Nn(K.details), K.code === "NOT_FOUND")) {
          w.value = !1, C.value = null, v("ok", "Module already removed; refreshed installed modules"), await p(), await b();
          return;
        }
        N.value = Ee(K, "uninstall failed");
      } finally {
        E.value = !1;
      }
    }
  }
  return qe(M, () => {
    w.value && C.value && !E.value && ue();
  }), {
    uninstallDialogOpen: w,
    uninstallDep: C,
    uninstallPolicy: M,
    uninstallRunning: E,
    uninstallPreviewLoading: F,
    uninstallPreview: U,
    uninstallExecution: L,
    uninstallCode: j,
    uninstallError: N,
    uninstallRequiredBy: P,
    uninstallPhase: z,
    uninstallElapsedSec: d,
    selectedUninstallBlockedReason: ee,
    uninstallBlockedReason: f,
    uninstallActionBlockedReason: k,
    openUninstallDialog: O,
    previewUninstall: ue,
    runUninstall: R
  };
}
const An = "kickside/kickside", nt = "keeper/keeper", fo = "0.5.116", El = `>=${fo}`, ci = { includeEntries: !1, includeMigrations: !1 };
function pi(e) {
  return e?.match(/^v?(\d+\.\d+\.\d+)(?:\+[\w.-]+)?$/)?.[1];
}
function Mn(e) {
  const t = pi(e);
  if (!t) return !1;
  const [n, s, i] = t.split(".").map(Number);
  return n > 0 || s > 5 || s === 5 && i >= 116;
}
function fi(e) {
  return e.modules?.find((t) => t.name === nt && t.installed !== !1);
}
async function no(e) {
  const t = await e.listDependencies(ci), n = fi(t);
  if (Mn(n?.version)) return null;
  const s = t.dependencies.find((i) => i.component === nt && i.installed !== !1 && i.is_root !== !1);
  if (!n?.version || !s?.id || n.source === "local" || s.source === "local")
    throw new Error(`Verify an active Hub-installed Keeper ${fo} or newer before updating KickSide.`);
  return { active: n.version, root: s, state: t };
}
function oo(e) {
  const t = e.missing_requirements || [], n = (e.requirements || []).filter((s) => s.invalid).map((s) => `${s.id || s.parameter_name}: ${s.invalid_reason || "invalid value"}`);
  return t.length || n.length ? [
    t.length ? `Missing required settings: ${t.join(", ")}` : "",
    n.length ? `Invalid settings: ${n.join(", ")}` : ""
  ].filter(Boolean).join(". ") : e.applicable === !1 ? "Update plan cannot be applied" : null;
}
function io(e) {
  return e ? Array.isArray(e) ? e : Object.entries(e).map(([t, n]) => ({
    name: t,
    value: n
  })) : [];
}
function Mo(e) {
  return JSON.stringify(e, (t, n) => !n || typeof n != "object" || Array.isArray(n) ? n : Object.fromEntries(Object.entries(n).sort(([s], [i]) => s.localeCompare(i))));
}
function Pl(e, t) {
  const n = io(e), s = io(t);
  if (n.length !== s.length) return !1;
  const i = /* @__PURE__ */ new Set();
  for (const l of n) {
    const p = s.filter((b) => b.name === l.name || !l.name.includes(":") && b.name.split(":").at(-1) === l.name);
    if (p.length !== 1 || i.has(p[0].name) || Mo(p[0].value) !== Mo(l.value)) return !1;
    i.add(p[0].name);
  }
  return !0;
}
const mi = `Update Keeper to ${fo} or newer first, then retry the KickSide update.`;
async function Fl(e, t, n) {
  const s = t.root, i = Mn(n) ? `>=${pi(n)}` : El, l = await e.planBatchInstall({
    dependencies: [{ id: s.id, component: nt, version: i, parameters: io(s.parameters) }],
    run_migrations: !0,
    migration_policy: "up"
  }), p = l.plans?.[0], b = p && oo(p);
  if (b) throw new Error(`Keeper: ${b}`);
  const v = l.install_payload?.dependencies, y = v?.[0], w = p?.graph?.find((E) => E.module === nt)?.version, C = new Map(t.state.modules?.map((E) => [E.name, E.version]));
  if (!l.applicable || l.plans?.length !== 1 || v?.length !== 1 || y?.component !== nt || y.id !== s.id || y.version !== i || !Pl(s.parameters, y.parameters) || !Mn(w) || p?.graph?.some((E) => E.module !== nt && C.get(E.module) !== E.version))
    throw new Error(`The Keeper prerequisite needs a separate review. ${mi}`);
  if ((await e.install(l.install_payload)).success !== !0)
    throw new Error("Keeper did not confirm the prerequisite install. Check the installed modules before retrying.");
  for (let E = 0; E < 12; E++) {
    try {
      const F = await e.listDependencies(ci), U = fi(F), L = await e.securityProjectionStatus();
      if (U?.version && Mn(U.version) && L.current) return U.version;
    } catch {
    }
    E < 11 && await new Promise((F) => setTimeout(F, 750));
  }
  throw new Error("Keeper was installed but its active version could not be verified. Check the installed modules before retrying.");
}
function Tl({ hub: e, installed: t, installedError: n, installedCanUpdate: s, installedIsRoot: i, showToast: l, notifyModulesChanged: p, refreshAll: b, refreshSelectedDetail: v }) {
  const y = B({}), w = B(!1), C = B(!1);
  let M = !1;
  const E = q(() => t.value.filter((I) => {
    const V = P(I);
    return s(I) && i(I) && V && ["available", "failed", "blocked", "skipped"].includes(V.status) && j(V.latestVersion, ht(I));
  }));
  function F(I) {
    return (String(I || "").trim().replace(/^[^\d]*/, "").match(/\d+(?:\.\d+)*/)?.[0] || "").split(".").filter(Boolean).map(Number);
  }
  function U(I, V) {
    const W = F(I), te = F(V), se = Math.max(W.length, te.length);
    for (let ie = 0; ie < se; ie++) {
      const pe = W[ie] || 0, we = te[ie] || 0;
      if (pe !== we) return pe > we ? 1 : -1;
    }
    return String(I || "").localeCompare(String(V || ""));
  }
  function L(I = []) {
    const V = I.find((W) => W.is_latest) || I[0];
    return String(V?.version || "");
  }
  function j(I, V) {
    return !!(I && V && I !== V && U(I, V) > 0);
  }
  function N(I) {
    const V = String(I || "").trim().replace(/^[>=<~^]+v?/, "");
    return V ? `>=${V}` : ">=v0.0.0";
  }
  function P(I) {
    return I?.component && y.value[I.component] || null;
  }
  function z(I, V) {
    const W = y.value[I];
    y.value = {
      ...y.value,
      [I]: {
        component: I,
        currentVersion: V.currentVersion ?? W?.currentVersion ?? "",
        latestVersion: V.latestVersion ?? W?.latestVersion ?? "",
        status: V.status ?? W?.status ?? "current",
        message: V.message
      }
    };
  }
  function d(I) {
    const V = P(I);
    return V ? V.status === "available" ? `${V.currentVersion || "?"} → ${V.latestVersion || "?"}` : V.status === "queued" ? "queued" : V.status === "skipped" ? "skipped" : V.status === "planning" ? "planning" : V.status === "updating" ? "updating" : V.status === "updated" ? "updated" : V.status === "blocked" ? "blocked" : V.status === "failed" ? "failed" : "" : "";
  }
  function ee(I) {
    const V = P(I)?.status;
    return V === "planning" || V === "updating" ? "tabler:loader-2" : V === "updated" ? "tabler:check" : V === "queued" ? "tabler:clock" : V === "skipped" ? "tabler:player-skip-forward" : V === "blocked" ? "tabler:lock" : V === "failed" ? "tabler:alert-triangle" : "tabler:arrow-up-circle";
  }
  function f(I) {
    const V = P(I)?.status;
    return V === "planning" || V === "updating";
  }
  async function k() {
    if (!e || w.value) return;
    w.value = !0, n.value = null;
    const I = {};
    let V = 0, W = 0;
    try {
      for (const te of t.value) {
        if (!s(te) || !i(te)) continue;
        const se = ht(te);
        try {
          const ie = await e.listVersions(te.component), pe = L(ie.items), we = j(pe, se) ? "available" : "current";
          we === "available" && V++, I[te.component] = { component: te.component, currentVersion: se, latestVersion: pe, status: we }, y.value = { ...I };
        } catch (ie) {
          W++, I[te.component] = {
            component: te.component,
            currentVersion: se,
            latestVersion: "",
            status: "failed",
            message: Ee(ie, "version scan failed")
          }, y.value = { ...I };
        }
      }
      l("ok", `Found ${V} update${V === 1 ? "" : "s"}${W ? `, ${W} failed` : ""}`);
    } finally {
      w.value = !1;
    }
  }
  async function O(I, V) {
    z(I, { status: "planning", message: void 0 });
    try {
      const W = await e.planInstall({ component: I, version: V, run_migrations: !0 }), te = I === An ? oo(W) : W.missing_requirements?.length ? `Missing required settings: ${W.missing_requirements.join(", ")}` : null;
      return te ? (z(I, { status: "blocked", message: te }), null) : W;
    } catch (W) {
      const te = Ee(W, "update plan failed");
      return z(I, { status: "failed", message: te }), null;
    }
  }
  async function ue(I) {
    const V = y.value[nt]?.latestVersion;
    z(nt, { currentVersion: I.active, status: "planning" });
    try {
      const W = await Fl(e, I, V);
      z(nt, { status: "updated", currentVersion: W, latestVersion: W });
    } catch (W) {
      throw z(nt, { status: "failed", message: Ee(W, "Keeper update failed") }), W;
    }
  }
  async function R(I) {
    if (!e || !I.component || C.value || M) return !1;
    M = !0;
    let V = !1;
    try {
      let W = P(I);
      if (!W) {
        const pe = ht(I), we = await e.listVersions(I.component), He = L(we.items);
        W = {
          component: I.component,
          currentVersion: pe,
          latestVersion: He,
          status: j(He, pe) ? "available" : "current"
        }, z(I.component, W);
      }
      if (!W.latestVersion || !j(W.latestVersion, ht(I))) return !0;
      const te = N(W.latestVersion), se = I.component === An ? await no(e) : null;
      let ie = await O(I.component, te);
      if (!ie) return !1;
      if (se && (await ue(se), V = !0, ie = await O(I.component, te), !ie)) {
        const pe = P(I)?.message || "KickSide update paused";
        return z(I.component, { message: `Keeper was updated. ${pe}` }), !1;
      }
      return z(I.component, { status: "updating" }), await e.install({
        ...ie.install_payload,
        component: I.component,
        version: te,
        run_migrations: !0,
        migration_policy: "up"
      }), z(I.component, {
        status: "updated",
        currentVersion: W.latestVersion,
        latestVersion: W.latestVersion
      }), V || p(), !0;
    } catch (W) {
      const te = Ee(W, "update failed");
      return z(I.component, { status: "failed", message: V ? `Keeper was updated. ${te}` : te }), !1;
    } finally {
      try {
        V && (p(), await Q());
      } finally {
        M = !1;
      }
    }
  }
  async function Q() {
    try {
      await b(), await v();
    } catch (I) {
      l("error", `Module status could not be refreshed: ${Ee(I, "refresh failed")}`);
    }
  }
  async function K(I, V) {
    for (const se of I) z(se.component, { status: "planning" });
    const W = await e.planBatchInstall({
      dependencies: I.map((se) => ({
        id: se.dependencyId,
        component: se.component,
        version: N(P(se).latestVersion)
      })),
      run_migrations: !0,
      migration_policy: "up"
    }), te = /* @__PURE__ */ new Map();
    for (const se of W.plans) {
      const ie = oo(se);
      ie && te.set(se.dependency?.component || "Unknown module", ie);
    }
    if (!W.applicable || te.size) {
      for (const ie of I) z(ie.component, {
        status: te.has(ie.component) ? "blocked" : "skipped",
        message: te.get(ie.component) || "Batch not applied because its plan is blocked"
      });
      const se = te.size ? [...te].map(([ie, pe]) => `${ie}: ${pe}`).join(". ") : V ? "Update plan cannot be applied." : "Update plan cannot be applied. No modules were changed.";
      return l("error", V ? `Keeper was updated. ${se}` : se), null;
    }
    if (!W.install_payload?.dependencies?.length) throw new Error("Update plan returned no install payload");
    return W.install_payload;
  }
  async function ne() {
    if (C.value || M || E.value.length === 0) return;
    C.value = !0;
    let I = [...E.value], V = !1, W = !1;
    try {
      const te = I.some((pe) => pe.component === An) ? await no(e) : null;
      let se = await K(I, !1);
      if (!se || te && (await ue(te), V = !0, I = I.filter((pe) => pe.component !== nt), se = await K(I, !0), !se))
        return;
      const ie = I.length + (V ? 1 : 0);
      for (const pe of I) z(pe.component, { status: "updating" });
      await e.install(se), W = !0;
      for (const pe of I) z(pe.component, { status: "updated" });
      l("ok", `Updated ${ie} module${ie === 1 ? "" : "s"}`);
    } catch (te) {
      const se = Ee(te, "update failed"), ie = V ? `Keeper was updated. ${se}` : se;
      for (const pe of I) z(pe.component, { status: "failed", message: ie });
      l("error", ie);
    } finally {
      try {
        (V || W) && p(), await Q();
      } finally {
        C.value = !1;
      }
    }
  }
  return {
    updateScan: y,
    updateScanLoading: w,
    updateAllRunning: C,
    availableUpdates: E,
    updateInfoForDep: P,
    updateStatusLabel: d,
    updateStatusIcon: ee,
    updateStatusBusy: f,
    scanInstalledUpdates: k,
    updateInstalledDependency: R,
    updateAllAvailable: ne
  };
}
function Vl({ hub: e, loadCatalog: t }) {
  const n = B(!1), s = B(!1), i = B(!1), l = B(!1), p = B(null), b = B(""), v = B(!1), y = B(!1), w = B(null), C = q(() => p.value?.orgs || []), M = q(() => p.value?.username || p.value?.user_id || ""), E = q(() => !!p.value?.authenticated), F = q(() => !!(p.value?.authenticated && p.value?.expired)), U = q(() => i.value ? "tabler:key" : F.value ? "tabler:alert-triangle" : "tabler:key-off"), L = q(() => i.value ? "Hub token set" : F.value ? "Hub token expired" : "Set Hub token"), j = q(() => {
    const f = p.value?.expires_at;
    if (!f) return "";
    const k = new Date(f);
    return isNaN(k.getTime()) ? "" : k.toLocaleDateString();
  });
  function N(f) {
    p.value = f?.authenticated ? f : null;
    const k = vo(f);
    i.value = k, l.value = k;
  }
  async function P() {
    try {
      const { data: f } = await co.get("/api/v1/user/me");
      n.value = !!(f?.success && f?.security?.is_admin);
    } catch (f) {
      ot("modules:auth", f), n.value = !1;
    } finally {
      s.value = !0;
    }
  }
  async function z() {
    try {
      const f = await e.authStatus();
      N(f);
    } catch (f) {
      ot("modules:hub-auth", f);
    }
  }
  async function d() {
    const f = b.value.trim();
    if (!f) {
      w.value = "Paste a Hub token first.";
      return;
    }
    w.value = null, y.value = !0;
    try {
      const k = await e.authenticate(f);
      N(k), vo(k) ? (b.value = "", v.value = !1, await t()) : w.value = "That token is invalid or expired.";
    } catch (k) {
      w.value = Ee(k, "failed to save Hub token");
    } finally {
      y.value = !1;
    }
  }
  async function ee() {
    w.value = null;
    try {
      await e.logout();
    } catch (f) {
      w.value = Ee(f, "failed to clear Hub token");
      return;
    }
    N(null), await t();
  }
  return {
    isAdmin: n,
    authLoaded: s,
    hubConnected: i,
    hubUsable: l,
    hubStatus: p,
    hubToken: b,
    showTokenPanel: v,
    hubConnecting: y,
    hubError: w,
    hubOrgs: C,
    hubIdentity: M,
    hubTokenStored: E,
    hubTokenExpired: F,
    hubTokenIcon: U,
    hubTokenButtonLabel: L,
    hubExpiry: j,
    applyHubAuthStatus: N,
    loadAuth: P,
    loadHubAuth: z,
    saveHubToken: d,
    clearHubToken: ee
  };
}
const Dl = ["kickside", "kickside-plugin"], Eo = "kickside", Rl = "https://portal.wippy.ai/account/tokens", Bl = [
  { label: "Block if any applied", value: "block" },
  { label: "Leave applied migrations", value: "leave" },
  { label: "Revert (down) - may lose data", value: "down" }
];
function Hl() {
  const e = Go(co), t = B(!0), n = B(null), s = Vl({ hub: e, loadCatalog: _n }), {
    isAdmin: i,
    authLoaded: l,
    hubConnected: p,
    hubUsable: b,
    hubStatus: v,
    hubToken: y,
    showTokenPanel: w,
    hubConnecting: C,
    hubError: M,
    hubOrgs: E,
    hubIdentity: F,
    hubTokenStored: U,
    hubTokenExpired: L,
    hubTokenIcon: j,
    hubTokenButtonLabel: N,
    hubExpiry: P,
    loadAuth: z,
    loadHubAuth: d,
    saveHubToken: ee,
    clearHubToken: f
  } = s, k = B([]), O = B(""), ue = B("all"), R = B(!1), Q = B(null), K = B(!0), ne = B([]), I = B(!1), V = B(null), W = B(""), te = B("downloads"), se = Ll({
    hub: e,
    installed: k,
    catalog: ne,
    installedDepFor: Le,
    installedCanUpdate: St,
    installedUpdateDisabledReason: Xt,
    installedCanUninstall: Lt,
    installedIsPrivate: Ot
  }), {
    selected: ie,
    selectedModule: pe,
    detailReadme: we,
    detailEntries: He,
    detailLoading: Ge,
    detailTab: bt,
    detailVersions: Et,
    envVars: Pt,
    requirements: Ie,
    detailGroups: Wt,
    versionMeta: it,
    selectedInstalledDep: We,
    selectedCanUpdate: vt,
    selectedUpdateDisabledReason: st,
    selectedCanUninstall: Ze,
    selectedIsPrivate: Ue,
    openDetail: Ve,
    closeDetail: _e,
    refreshSelectedDetail: Ye
  } = se, Xe = Ml({
    hub: e,
    selected: ie,
    selectedInstalledDep: We,
    installedIsRoot: Oe,
    installedUninstallDisabledReason: Yt,
    installedCanUninstall: Lt,
    refreshAll: Ut,
    refreshSelectedDetail: Ye,
    showToast: x,
    notifyModulesChanged: to
  }), {
    uninstallDialogOpen: Ft,
    uninstallDep: at,
    uninstallPolicy: Je,
    uninstallRunning: je,
    uninstallPreviewLoading: Tt,
    uninstallPreview: S,
    uninstallExecution: _,
    uninstallCode: D,
    uninstallError: H,
    uninstallRequiredBy: Y,
    uninstallPhase: X,
    uninstallElapsedSec: me,
    selectedUninstallBlockedReason: $e,
    uninstallBlockedReason: lt,
    uninstallActionBlockedReason: Vt,
    openUninstallDialog: ve,
    previewUninstall: De,
    runUninstall: rt
  } = Xe, gt = Tl({
    hub: e,
    installed: k,
    installedError: Q,
    installedCanUpdate: St,
    installedIsRoot: Oe,
    showToast: x,
    notifyModulesChanged: to,
    refreshAll: Ut,
    refreshSelectedDetail: Ye
  }), {
    updateScanLoading: yt,
    updateAllRunning: ke,
    availableUpdates: Pe,
    updateInfoForDep: ut,
    updateStatusLabel: Qe,
    updateStatusIcon: sn,
    updateStatusBusy: Dt,
    scanInstalledUpdates: It,
    updateInstalledDependency: Re,
    updateAllAvailable: Ne
  } = gt, kt = q(() => {
    const T = /* @__PURE__ */ new Set();
    for (const de of k.value)
      if (de.installed !== !1)
        for (const jt of go(de)) T.add(jt);
    return T;
  }), wt = q(() => Bi(ne.value, W.value)), Ce = q(() => wt.value.filter((T) => !$t(T))), dt = q(() => W.value.trim() || Ce.value.length < 7 ? [] : [...Ce.value].sort((T, de) => (de.total_downloads || 0) - (T.total_downloads || 0)).slice(0, 6)), an = q(() => new Set(dt.value.map(Tn))), _t = q(() => Hi(Ce.value.filter((T) => !an.value.has(Tn(T))), te.value)), ct = q(() => k.value.filter((T) => T.installed !== !1).length), pt = q(() => {
    const T = O.value.trim().toLowerCase(), de = ue.value, jt = k.value.filter((Fe) => Fe.installed === !1 || de === "root" && !Oe(Fe) || de === "transitive" && Oe(Fe) || de === "local" && Fe.source !== "local" ? !1 : T ? [
      Fe.component,
      Fe.id,
      Fe.name,
      Fe.namespace,
      Fe.version,
      Fe.source,
      Bt(Fe),
      Ht(Fe),
      Ao(Fe),
      ht(Fe)
    ].filter(Boolean).join(" ").toLowerCase().includes(T) : !0);
    return Ui(jt, xe);
  }), et = q(() => k.value.filter((T) => T.installed !== !1 && !!xe(T.component)).length), Se = q(() => pt.value.filter((T) => !!xe(T.component)).length), tt = q(() => l.value && !i.value), ye = B(null), Zt = q(() => ye.value !== null);
  function xe(T) {
    return ne.value.find((de) => Fn(de, T));
  }
  function xt(T) {
    return bn({ full_name: T.component });
  }
  function Rt(T) {
    const de = xe(T.component);
    return de ? nn(de) : "tabler:package";
  }
  function Ot(T) {
    return hn(xe(T.component)) || hn(T);
  }
  function Oe(T) {
    return ji(T || {});
  }
  function Bt(T) {
    return Ni(T);
  }
  function Ht(T) {
    return Ki(T);
  }
  function Yt(T) {
    if (Oe(T)) return "";
    const de = Ht(T);
    return de ? `Installed as a dependency; ${de}` : "Installed as a dependency of another module";
  }
  function St(T) {
    return !!(T?.component && T.source !== "local");
  }
  function Xt(T) {
    return T.source === "local" ? "Local replacement; update from source" : "No Hub dependency update action available";
  }
  function Lt(T) {
    return !!(T && Oe(T));
  }
  function $t(T) {
    return go(T).some((de) => kt.value.has(de));
  }
  function Le(T) {
    return k.value.find((de) => Fn(de, T));
  }
  function x(T, de) {
    const jt = Zo?.toast;
    typeof jt == "function" ? jt({ severity: T === "ok" ? "success" : "error", summary: de }) : (n.value = { kind: T, message: de }, setTimeout(() => {
      n.value?.message === de && (n.value = null);
    }, 5e3));
  }
  function g() {
    ie.value && G({
      full_name: ie.value.component,
      latest_version: ie.value.version,
      description: ie.value.description
    });
  }
  function Ke() {
    const T = ie.value && Le(ie.value.component);
    T && St(T) && ge(T);
  }
  function Bn() {
    const T = ie.value && Le(ie.value.component);
    T && Lt(T) && ve(T);
  }
  async function Hn() {
    R.value = !0, Q.value = null;
    try {
      k.value = Ol(await e.listDependencies());
    } catch (T) {
      k.value = [], ot("modules:listDependencies", T), Q.value = Ee(T, "dependency graph unavailable");
    }
    R.value = !1;
  }
  async function _n() {
    I.value = !0, V.value = null;
    try {
      ne.value = (await e.fetchAllByKeyword(Dl)).filter(qi);
    } catch (T) {
      ot("modules:catalog", T), T instanceof qt && (T.code === "UNAUTHORIZED" || T.code === "FORBIDDEN") ? b.value = !1 : V.value = Ee(T, `failed to load ${Eo} catalog`);
    } finally {
      I.value = !1;
    }
  }
  async function Ut() {
    await Promise.all([Hn(), _n()]);
  }
  function G(T) {
    const de = Pn(T);
    ye.value = {
      mode: "install",
      component: de,
      version: T.latest_version ? String(T.latest_version) : "",
      currentId: null,
      catalogItem: xe(de) || T,
      installedDep: null
    };
  }
  function ge(T) {
    St(T) && (ye.value = {
      mode: "update",
      component: T.component,
      // Let the dialog load and select the newest published release. Seeding
      // this with the resolved version re-submits the current package while
      // presenting the operation as an update.
      version: "",
      currentId: T.dependencyId || null,
      catalogItem: xe(T.component) || null,
      installedDep: T
    });
  }
  function he() {
    ye.value = null;
  }
  async function ze() {
    await Ut(), await Ye(), he();
  }
  return uo(() => {
    Wo("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
    });
  }), Ei(async () => {
    try {
      if (await z(), !i.value) return;
      await d(), await Ut();
    } finally {
      t.value = !1;
    }
  }), {
    LABEL: Eo,
    HUB_PORTAL: Rl,
    UNINSTALL_MIGRATION_OPTIONS: Bl,
    initialLoading: t,
    accessDenied: tt,
    statusBanner: n,
    hubConnected: p,
    hubStatus: v,
    hubToken: y,
    showTokenPanel: w,
    hubConnecting: C,
    hubError: M,
    hubOrgs: E,
    hubIdentity: F,
    hubTokenStored: U,
    hubTokenExpired: L,
    hubTokenIcon: j,
    hubTokenButtonLabel: N,
    hubExpiry: P,
    selected: ie,
    selectedModule: pe,
    detailReadme: we,
    detailEntries: He,
    detailLoading: Ge,
    detailTab: bt,
    detailVersions: Et,
    envVars: Pt,
    requirements: Ie,
    detailGroups: Wt,
    versionMeta: it,
    selectedCanUpdate: vt,
    selectedUpdateDisabledReason: st,
    selectedCanUninstall: Ze,
    selectedIsPrivate: Ue,
    selectedUninstallBlockedReason: $e,
    entryName: Il,
    entryDesc: _l,
    entryIcon: xl,
    installed: k,
    installedFilter: O,
    installedKindFilter: ue,
    installedTotal: ct,
    updateScanLoading: yt,
    updateAllRunning: ke,
    availableUpdates: Pe,
    installedLoading: R,
    installedError: Q,
    installedOpen: K,
    catalog: ne,
    catalogLoading: I,
    catalogError: V,
    catalogInstalledTotal: et,
    visibleCatalogInstalled: Se,
    browseFilter: W,
    sortBy: te,
    availableItems: Ce,
    featured: dt,
    sortedItems: _t,
    visibleInstalled: pt,
    catalogItemFor: xe,
    installedAccent: xt,
    installedIcon: Rt,
    installedIsPrivate: Ot,
    installedIsRoot: Oe,
    installedRole: Bt,
    installedUsedBy: Ht,
    installedCanUpdate: St,
    installedUpdateDisabledReason: Xt,
    installedCanUninstall: Lt,
    installedMigrationSummary: Ao,
    updateInfoForDep: ut,
    updateStatusLabel: Qe,
    updateStatusIcon: sn,
    updateStatusBusy: Dt,
    scanInstalledUpdates: It,
    updateInstalledDependency: Re,
    updateAllAvailable: Ne,
    installDialogOpen: Zt,
    installTarget: ye,
    closeInstallDialog: he,
    onInstallChanged: ze,
    uninstallDialogOpen: Ft,
    uninstallDep: at,
    uninstallPolicy: Je,
    uninstallRunning: je,
    uninstallPreviewLoading: Tt,
    uninstallPreview: S,
    uninstallExecution: _,
    uninstallCode: D,
    uninstallError: H,
    uninstallRequiredBy: Y,
    uninstallBlockedReason: lt,
    uninstallActionBlockedReason: Vt,
    uninstallPhase: X,
    uninstallElapsedSec: me,
    previewUninstall: De,
    executionStepLabel: qo,
    openDetail: Ve,
    closeDetail: _e,
    detailInstall: g,
    detailUpdate: Ke,
    detailUninstall: Bn,
    refreshAll: Ut,
    saveHubToken: ee,
    clearHubToken: f,
    openUpdateDialog: ge,
    openUninstallDialog: ve,
    installedUninstallDisabledReason: Yt,
    runUninstall: rt
  };
}
const Ul = ["aria-label", "aria-busy"], jl = /* @__PURE__ */ on({
  __name: "NativeDialog",
  props: {
    visible: { type: Boolean },
    busy: { type: Boolean },
    label: {},
    headerClass: {},
    contentClass: {},
    footerClass: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, s = t, i = B(null);
    async function l() {
      await mn();
      const b = i.value;
      b && (n.visible && !b.open ? b.showModal() : !n.visible && b.open && b.close());
    }
    function p(b) {
      b.preventDefault(), n.busy || s("close");
    }
    return qe(() => n.visible, l), uo(l), Ko(() => {
      i.value?.open && i.value.close();
    }), (b, v) => (a(), u("dialog", {
      ref_key: "dialog",
      ref: i,
      class: "kx-native-dialog",
      "aria-label": e.label,
      "aria-modal": "true",
      "aria-busy": e.busy || void 0,
      onCancel: p,
      onClose: v[1] || (v[1] = () => {
        e.visible && !e.busy && s("close");
      })
    }, [
      r("header", {
        class: ae(e.headerClass)
      }, [
        le(b.$slots, "header"),
        m(o(ce), {
          type: "button",
          text: "",
          severity: "secondary",
          "aria-label": "Close dialog",
          disabled: e.busy,
          onClick: v[0] || (v[0] = (y) => s("close"))
        }, {
          default: oe(() => [...v[2] || (v[2] = [
            A("×", -1)
          ])]),
          _: 1
        }, 8, ["disabled"])
      ], 2),
      r("div", {
        class: ae(e.contentClass)
      }, [
        le(b.$slots, "default")
      ], 2),
      b.$slots.footer ? (a(), u("footer", {
        key: 0,
        class: ae(e.footerClass)
      }, [
        le(b.$slots, "footer")
      ], 2)) : h("", !0)
    ], 40, Ul));
  }
}), Nl = ["aria-expanded", "aria-controls", "aria-label", "disabled"], Kl = { class: "p-select-label" }, ql = {
  key: 0,
  class: "kx-ps-val"
}, Gl = { class: "kx-ps-val-label" }, Wl = {
  key: 1,
  class: "kx-ps-ph"
}, Zl = { class: "p-select-dropdown" }, Yl = { class: "p-select-overlay kx-ps-panel" }, Xl = { class: "p-select-header" }, Jl = ["aria-label", "aria-controls", "aria-activedescendant"], Ql = ["id", "aria-label"], er = {
  class: "p-select-option-group",
  role: "presentation"
}, tr = ["id", "aria-selected", "onClick", "onMousemove"], nr = { class: "kx-ps-opt-body" }, or = { class: "kx-ps-opt-title" }, ir = {
  key: 0,
  class: "kx-ps-opt-sub"
}, sr = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, ar = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, lr = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, rr = ["disabled"], Po = /* @__PURE__ */ on({
  __name: "PickerSelect",
  props: {
    items: {},
    modelValue: {},
    placeholder: {},
    ariaLabel: {},
    disabled: { type: Boolean },
    remote: { type: Boolean },
    loading: { type: Boolean },
    more: { type: Boolean },
    error: {}
  },
  emits: ["update:modelValue", "search", "more"],
  setup(e, { emit: t }) {
    const n = e, s = t, i = B(null), l = B(null), p = B(!1), b = B(""), v = B(0), y = Vi(), w = q(() => {
      const L = b.value.trim().toLowerCase(), j = /* @__PURE__ */ new Map();
      for (const P of n.items) {
        if (!n.remote && L && ![P.title, P.subtitle, P.id, P.group].some((ee) => ee?.toLowerCase().includes(L))) continue;
        const z = P.group || "Other", d = j.get(z);
        d ? d.push(P) : j.set(z, [P]);
      }
      let N = 0;
      return [...j.entries()].sort((P, z) => P[0].localeCompare(z[0])).map(([P, z]) => ({ group: P, items: z.map((d) => ({ item: d, index: N++ })) }));
    }), C = q(() => w.value.flatMap((L) => L.items)), M = q(() => n.items.find((L) => L.id === n.modelValue)), E = q(() => C.value[v.value] ? `${y}-${v.value}` : void 0);
    qe(b, () => {
      v.value = 0;
    }), qe([p, b], ([L, j]) => {
      L && n.remote && s("search", j);
    }), qe(() => n.disabled, (L) => {
      L && (p.value = !1);
    }), qe(p, async (L) => {
      if (!L) {
        i.value?.focus();
        return;
      }
      b.value = "", v.value = Math.max(0, C.value.findIndex(({ item: j }) => j.id === n.modelValue)), await mn(), l.value?.focus();
    });
    function F(L) {
      n.disabled || n.loading || (s("update:modelValue", L.id), p.value = !1);
    }
    async function U(L) {
      if (L.key === "Escape" && p.value) {
        L.preventDefault(), L.stopPropagation(), p.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(L.key)) return;
      if (L.preventDefault(), !p.value) {
        p.value = !0;
        return;
      }
      if (L.key === "Enter") {
        const P = C.value[v.value];
        P && F(P.item);
        return;
      }
      const j = C.value.length - 1;
      v.value = L.key === "Home" ? 0 : L.key === "End" ? j : Math.max(0, Math.min(j, v.value + (L.key === "ArrowDown" ? 1 : -1))), await mn(), i.value?.getRootNode()?.querySelector(`[id="${E.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (L, j) => (a(), u(J, null, [
      r("button", {
        ref_key: "anchor",
        ref: i,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": p.value,
        "aria-controls": o(y),
        "aria-label": e.ariaLabel,
        disabled: e.disabled,
        onClick: j[0] || (j[0] = (N) => p.value = !p.value),
        onKeydown: U
      }, [
        r("span", Kl, [
          M.value ? (a(), u("span", ql, [
            m(o($), {
              icon: M.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            r("span", Gl, c(M.value.title), 1)
          ])) : (a(), u("span", Wl, c(e.placeholder || "Select…"), 1))
        ]),
        r("span", Zl, [
          m(o($), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, Nl),
      m(di, {
        open: p.value,
        "onUpdate:open": j[3] || (j[3] = (N) => p.value = N),
        anchor: i.value
      }, {
        default: oe(() => [
          r("div", Yl, [
            r("div", Xl, [
              Be(r("input", {
                ref_key: "search",
                ref: l,
                "onUpdate:modelValue": j[1] || (j[1] = (N) => b.value = N),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${e.ariaLabel || e.placeholder || "options"}`,
                "aria-controls": o(y),
                "aria-activedescendant": E.value,
                onKeydown: U
              }, null, 40, Jl), [
                [On, b.value]
              ])
            ]),
            r("ul", {
              id: o(y),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": e.ariaLabel || e.placeholder || "Options"
            }, [
              (a(!0), u(J, null, re(w.value, (N) => (a(), u(J, {
                key: N.group
              }, [
                r("li", er, c(N.group), 1),
                (a(!0), u(J, null, re(N.items, ({ item: P, index: z }) => (a(), u("li", {
                  id: `${o(y)}-${z}`,
                  key: P.id,
                  class: ae(["p-select-option kx-ps-option", { "p-select-option-selected": P.id === e.modelValue, "p-focus": z === v.value }]),
                  role: "option",
                  "aria-selected": P.id === e.modelValue,
                  onClick: (d) => F(P),
                  onMousemove: (d) => v.value = z
                }, [
                  m(o($), {
                    icon: P.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  r("span", nr, [
                    r("span", or, c(P.title), 1),
                    P.subtitle ? (a(), u("span", ir, c(P.subtitle), 1)) : h("", !0)
                  ])
                ], 42, tr))), 128))
              ], 64))), 128)),
              e.loading ? (a(), u("li", sr, "Loading…")) : !C.value.length && !e.error ? (a(), u("li", ar, "No matches")) : h("", !0)
            ], 8, Ql),
            e.error ? (a(), u("div", lr, c(e.error), 1)) : h("", !0),
            e.more ? (a(), u("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: e.loading || e.disabled,
              onClick: j[2] || (j[2] = (N) => s("more"))
            }, "Load more", 8, rr)) : h("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
function so() {
  return { status: "idle", modules: [], findings: [], scanned: 0, total: 0 };
}
function ur(e) {
  return e.some((t) => t.severity === "critical") ? "critical" : e.length > 0 ? "warnings" : "clean";
}
const Fo = {
  info: { label: "Info", icon: "tabler:info-circle", tone: "info" },
  warning: { label: "Warning", icon: "tabler:alert-triangle", tone: "warn" },
  critical: { label: "Critical", icon: "tabler:shield-x", tone: "danger" }
};
function dr(e) {
  return e.severity !== "critical";
}
const cr = ["clean", "warnings", "critical", "error", "unavailable", "skipped"];
function To(e) {
  return cr.includes(e) ? e : "clean";
}
function pr(e) {
  return e === "critical" ? "critical" : e === "warning" ? "warning" : "info";
}
function fr(e) {
  const t = e && typeof e == "object" ? e : {}, n = [], s = [];
  for (const b of t.modules || []) {
    const v = String(b.module || ""), y = b.version ? String(b.version) : void 0, w = (b.findings || []).map((C, M) => ({
      id: `${v}#${M}`,
      module: v,
      version: y,
      severity: pr(C.severity),
      title: String(C.title || "Issue"),
      detail: C.detail ? String(C.detail) : void 0,
      location: C.location ? String(C.location) : void 0
    }));
    for (const C of w) s.push(C);
    n.push({
      module: v,
      version: y,
      status: To(b.status),
      summary: b.summary ? String(b.summary) : void 0,
      findings: w
    });
  }
  const i = typeof t.total == "number" ? t.total : n.length, l = typeof t.scanned == "number" ? t.scanned : n.length;
  return {
    status: t.overall_status ? To(t.overall_status) : ur(s),
    summary: t.overall_summary ? String(t.overall_summary) : void 0,
    modules: n,
    findings: s,
    scanned: l,
    total: i
  };
}
function mr({ props: e, hub: t, plan: n, activeSection: s, versionArg: i, requirementPayload: l, invalidatePlan: p, refreshPlan: b, planCurrent: v }) {
  const y = B([]), w = B({}), C = B({}), M = q(() => {
    const S = /* @__PURE__ */ new Map();
    for (const _ of y.value) {
      const D = String(_.module || "");
      S.has(D) || S.set(D, []), S.get(D).push(_);
    }
    return Array.from(S.entries()).map(([_, D]) => ({ module: _, items: D, direct: !D.every((H) => Ln(H, e.component)) })).sort((_, D) => _.direct === D.direct ? _.module.localeCompare(D.module) : _.direct ? -1 : 1);
  }), E = q(() => y.value.filter((S) => !Ln(S, e.component))), F = q(() => y.value.filter((S) => !we(S))), U = q(() => y.value.length - E.value.length), L = q(() => {
    const S = [];
    for (const _ of y.value) {
      const D = fe(_);
      !D || !_.required && !_.missing || R(w.value[D]) && S.push(D);
    }
    return S;
  }), j = q(() => y.value.filter((S) => !R(w.value[fe(S)])).length), N = q(() => it().length), P = B(!1), z = B(null);
  let d = null;
  const ee = B(0), f = B({}), k = q(() => Object.keys(f.value).length);
  let O = 0;
  const ue = /* @__PURE__ */ new Set();
  function R(S) {
    return S == null || S === "" || typeof S == "string" && !S.trim() || Array.isArray(S) && S.length === 0 || typeof S == "object" && Object.keys(S).length === 0;
  }
  function Q(S) {
    return S == null ? "" : typeof S == "object" ? JSON.stringify(S) : String(S);
  }
  function K(S) {
    if (S.expected_type) return S.expected_type;
    const _ = [S.value, S.default, ...(S.suggestions || []).map((D) => D.value)];
    for (const D of _) {
      if (typeof D == "boolean" || typeof D == "number") return typeof D;
      if (Array.isArray(D)) return "array";
      if (D && typeof D == "object") return "object";
    }
    return "string";
  }
  function ne(S, _) {
    if (typeof _ != "string") return _;
    const D = _.trim(), H = K(S);
    if (H === "boolean") return /^(true|false)$/.test(D) ? D === "true" : _;
    if (H === "number" || H === "integer") return D && Number.isFinite(Number(D)) ? Number(D) : _;
    if (H === "array" || H === "object")
      try {
        return JSON.parse(D);
      } catch {
        return _;
      }
    return _;
  }
  function I(S, _) {
    const D = K(S);
    return D === "array" ? Array.isArray(_) : D === "object" ? _ !== null && typeof _ == "object" && !Array.isArray(_) : D === "integer" ? typeof _ == "number" && Number.isInteger(_) : typeof _ === D && (D !== "number" || Number.isFinite(_));
  }
  function V(S, _) {
    const D = fe(S);
    if (!D || we(S)) return;
    const H = ne(S, _ ?? "");
    JSON.stringify(w.value[D]) !== JSON.stringify(H) && (ue.add(D), w.value = { ...w.value, [D]: H }, p());
  }
  function W(S) {
    const _ = w.value[fe(S)];
    return !we(S) && !R(_) && !I(S, _);
  }
  function te(S) {
    const _ = K(S);
    return _ === "boolean" ? "expects true or false" : `expects ${_ === "integer" || _ === "object" || _ === "array" ? "an" : "a"} ${_}`;
  }
  const se = q(() => y.value.filter(W).map(fe).filter(Boolean));
  function ie(S) {
    return Q(w.value[fe(S)]);
  }
  function pe(S) {
    return (S.required || S.missing) === !0 && R(w.value[fe(S)]);
  }
  function we(S) {
    return Ln(S, e.component) && S.missing !== !0 && !ue.has(fe(S));
  }
  function He(S) {
    const _ = /* @__PURE__ */ new Set(), D = [];
    for (const H of S.suggestions || []) {
      const Y = Q(H.value).trim();
      if (!Y || _.has(Y)) continue;
      _.add(Y);
      const X = String(H.label || Y).trim(), me = [H.kind, H.source, H.description].filter(Boolean).map(String).join(" | ");
      D.push({ label: X && X !== Y ? `${X} (${Y})` : Y, value: Y, title: me });
    }
    return D;
  }
  function Ge() {
    const S = {}, _ = (H, Y) => {
      if (H = String(H || "").trim(), !H) return;
      S[H] = Y;
      const X = H.includes(":") && H.split(":").pop() || "";
      X && S[X] === void 0 && (S[X] = S[H]);
    }, D = e.installedDep?.parameters;
    if (Array.isArray(D))
      for (const H of D)
        _(H.name, H.value);
    else if (D && typeof D == "object")
      for (const [H, Y] of Object.entries(D)) _(H, Y);
    return S;
  }
  async function bt() {
    if (C.value = {}, !!t)
      try {
        const S = await t.listDependencies({ includeEntries: !1, includeMigrations: !1 }), _ = {}, D = (H, Y) => {
          H = String(H || "").trim();
          const X = String(Y ?? "").trim();
          if (!H || !X || _[H] !== void 0) return;
          _[H] = Y;
          const me = H.includes(":") && H.split(":").pop() || "";
          me && _[me] === void 0 && (_[me] = _[H]);
        };
        for (const H of S.dependencies || []) {
          const Y = H.parameters;
          if (Array.isArray(Y))
            for (const X of Y) D(X.name, X.value);
          else if (Y && typeof Y == "object")
            for (const [X, me] of Object.entries(Y)) D(X, me);
        }
        C.value = _;
      } catch (S) {
        ot("install:dependency-parameters", S);
      }
  }
  function Et(S) {
    for (const _ of n.value?.recommended_parameters || [])
      if (_.name === S && Q(_.value).trim() !== "") return Q(_.value);
    return "";
  }
  function Pt(S) {
    const _ = [
      fe(S),
      String(S.parameter_name || ""),
      String(S.full_id || ""),
      String(S.name || ""),
      String(S.short_name || "")
    ].map((D) => D.trim()).filter(Boolean);
    for (const D of _) {
      const H = Q(C.value[D]).trim();
      if (H) return H;
      const Y = D.includes(":") && D.split(":").pop() || "";
      if (Y) {
        const X = Q(C.value[Y]).trim();
        if (X) return X;
      }
    }
    return "";
  }
  function Ie(S) {
    const _ = fe(S);
    if (!_ || we(S) || String(w.value[_] ?? "").trim()) return "";
    const H = Et(_).trim();
    if (H) return H;
    const Y = Pt(S);
    if (Y) return Y;
    const X = Q(S.default).trim();
    if (X) return X;
    const me = He(S).map((lt) => lt.value).filter(Boolean);
    if (me.length === 1) return me[0];
    const $e = Wt(S);
    return $e.length && $e[0].score > 0 && ($e.length === 1 || $e[0].score > $e[1].score) ? $e[0].value : "";
  }
  function Wt(S) {
    return String(S.expected_kind || "").trim() !== "security.scope" ? [] : (S.suggestions || []).map((_) => {
      const D = Q(_.value).trim(), H = String(_.label || "").toLowerCase(), Y = String(_.description || "").toLowerCase();
      let X = 0;
      return D || (X -= 1e3), (H.includes("system") || Y.includes("system") || Y.includes("internal")) && (X -= 50), (H.includes("admin") || Y.includes("full access") || Y.includes("assign sparingly")) && (X -= 50), (Y.includes("signed-in") || Y.includes("authenticated")) && (X += 30), (H === "user" || H === "member") && (X += 20), { value: D, score: X };
    }).filter((_) => _.value).sort((_, D) => D.score - _.score || _.value.localeCompare(D.value));
  }
  function it() {
    const S = [];
    for (const _ of F.value) {
      if (!pe(_)) continue;
      const D = fe(_), H = Ie(_);
      D && H && S.push({ name: D, value: H });
    }
    return S;
  }
  function We(S) {
    return Ie(S) !== "";
  }
  function vt(S) {
    const _ = fe(S), D = Ie(S);
    if (!_ || !D) {
      s.value = "requirements", ee.value++;
      return;
    }
    V(S, D);
  }
  function st() {
    const S = it();
    if (!S.length) {
      s.value = "requirements", ee.value++;
      return;
    }
    for (const _ of S) {
      const D = y.value.find((H) => fe(H) === _.name);
      D && V(D, String(_.value));
    }
  }
  function Ze() {
    return F.value.filter((S) => R(w.value[fe(S)]) && (S.missing || S.value_source === "conflict" || S.expected_type || He(S).length)).map((S) => ({ name: S.full_id || fe(S) }));
  }
  const Ue = q(() => Ze().length);
  function Ve(S, _) {
    return R(_) || !I(S, _) ? !1 : !S.expected_kind || !!S.suggestions?.some((D) => D.value === _);
  }
  function _e(S) {
    const _ = { ...f.value }, D = { ...w.value };
    for (const H of S) {
      const Y = _[H];
      Y?.value !== void 0 && (D[H] = Y.value, ue.add(H), delete _[H]);
    }
    return w.value = D, p(), _;
  }
  async function Ye(S) {
    if (!v.value || P.value) return;
    const _ = _e(S), D = O;
    if (await b(), D !== O || !v.value) return;
    const H = {};
    for (const Y of F.value) {
      const X = fe(Y), me = _[X];
      me && R(w.value[X]) && Y.expected_type === me.expected_type && Y.expected_kind === me.expected_kind && Ve(Y, me.value) && (H[X] = me);
    }
    f.value = H;
  }
  function Xe(S) {
    const _ = { ...f.value };
    for (const D of S) delete _[D];
    f.value = _;
  }
  function Ft(S) {
    !v.value || P.value || _e(S);
  }
  async function at(S) {
    const _ = Ze();
    if (!v.value || !_.length || P.value) return;
    je();
    const D = O, H = new AbortController();
    d = H, P.value = !0, z.value = null, f.value = {}, await new Promise((Y) => {
      let X = !1, me = !1;
      const $e = (ve) => {
        if (X) return;
        if (X = !0, clearTimeout(lt), H.signal.aborted || D !== O || d !== H) {
          Y();
          return;
        }
        d = null;
        const De = ve && typeof ve == "object" ? ve : {};
        if (De.success === !0) {
          const rt = new Set(_.map((ke) => ke.name)), gt = {}, yt = new Map((De.requirements || []).map((ke) => [ke.full_id, ke]));
          y.value = y.value.map((ke) => ({
            ...ke,
            resolution_error: yt.get(ke.full_id)?.resolution_error
          }));
          for (const ke of De.parameters || []) {
            const Pe = y.value.find((ut) => (ut.full_id || fe(ut)) === ke.name || fe(ut) === ke.name);
            if (!Pe || !rt.has(Pe.full_id || fe(Pe)) || !Ve(Pe, ke.value) || typeof ke.reason != "string" || !ke.reason.trim()) {
              z.value = { tone: "warning", code: "INVALID_CHOICE", message: "AI returns an invalid planned value or omits its reason. Choose a value manually." };
              continue;
            }
            gt[fe(Pe)] = { ...Pe, value: ke.value, choice_reason: ke.reason };
          }
          f.value = gt, Object.keys(gt).length ? z.value = { tone: "success", message: "Review AI suggestions before applying." } : z.value || (z.value = { tone: "warning", message: "No valid AI suggestion is available. Choose a value manually." });
        } else
          z.value = {
            tone: "warning",
            code: De.code,
            kind: De.kind,
            details: De.details,
            message: De.error || "AI could not resolve these settings. Choose a value manually."
          };
        P.value = !1, Y();
      }, lt = setTimeout(() => {
        $e({ success: !1, code: "TIMEOUT", error: "AI requirement resolution timed out." }), H.abort();
      }, 2e4);
      H.signal.addEventListener("abort", () => {
        X || (X = !0, clearTimeout(lt), Y());
      }, { once: !0 });
      const Vt = {
        component: e.component,
        ...i() ? { version: i() } : {},
        ...e.mode === "update" && e.currentId ? { current_id: e.currentId } : {},
        ...l(),
        requirements: _,
        signal: H.signal,
        accept: () => {
          X || (me = !0);
        },
        respond: $e
      };
      S?.dispatchEvent(new CustomEvent("instrumentRequirementResolution", { detail: Vt, bubbles: !0, composed: !0 })), me || $e({ success: !1, code: "MODEL_UNAVAILABLE", error: "Configure an AI model to suggest settings, or choose values manually." });
    });
  }
  function Je(S, _) {
    n.value = S, y.value = (S.requirements || []).filter((Y) => Y.name !== "required_setup" && Y.short_name !== "required_setup");
    const D = Ge(), H = {};
    for (const Y of y.value) {
      const X = fe(Y);
      if (!X) continue;
      const me = String(Y.name || Y.short_name || X.split(":").pop() || "");
      H[X] = (ue.has(X) ? _[X] : R(_[X]) ? void 0 : _[X]) ?? D[X] ?? D[me] ?? C.value[X] ?? C.value[me] ?? Y.value ?? Y.default ?? "";
    }
    w.value = H;
    for (const Y of ue)
      Y in H || ue.delete(Y);
  }
  function je() {
    d?.abort(), d = null, P.value = !1, O++, f.value = {}, z.value = null;
  }
  function Tt() {
    je(), y.value = [], w.value = {}, ue.clear(), C.value = {}, P.value = !1, z.value = null;
  }
  return {
    pendingSuggestions: f,
    pendingCount: k,
    acceptSuggestions: Ye,
    rejectSuggestions: Xe,
    editSuggestions: Ft,
    displayValue: Q,
    requirements: y,
    parameterValues: w,
    installedParameterHints: C,
    requirementGroups: M,
    rootRequirements: E,
    editableRequirements: F,
    transitiveRequirementCount: U,
    missingRequirements: L,
    boundRequirementCount: j,
    autoFitCount: N,
    aiResolving: P,
    aiResolutionNotice: z,
    typeInvalidRequirements: se,
    highlightTick: ee,
    aiResolvableCount: Ue,
    setParameter: V,
    requirementTypeInvalid: W,
    requirementTypeHint: te,
    requirementValue: ie,
    requirementMissing: pe,
    requirementReadOnly: we,
    requirementOptions: He,
    loadInstalledParameterHints: bt,
    applyPlan: Je,
    recommendedValueFor: Et,
    hintedValueFor: Pt,
    autoFitValue: Ie,
    canAutoFitRequirement: We,
    autoFitRequirement: vt,
    autoFitRequirements: st,
    resolveRequirementsWithAI: at,
    abortAI: je,
    resetRequirements: Tt
  };
}
function Un(e) {
  return e.map((t) => [t.module, t.version || ""].join("\0")).sort().join("");
}
function hr({ props: e, hub: t, plan: n, planCurrent: s, versionArg: i }) {
  const l = B(so()), p = B(/* @__PURE__ */ new Set()), b = B(!1);
  let v = 0, y = null;
  const w = q(() => l.value.findings.filter(dr)), C = q(() => w.value.filter((N) => !p.value.has(N.id)));
  function M(N) {
    const P = new Set(p.value);
    P.add(N.id), p.value = P;
  }
  function E() {
    const N = new Set(p.value);
    for (const P of w.value) N.add(P.id);
    p.value = N;
  }
  function F(N) {
    const P = N ? Un(N) : null;
    P !== y && (v++, y = P, l.value = { ...so(), total: N?.length || 0 }, p.value = /* @__PURE__ */ new Set(), b.value = !1);
  }
  async function U() {
    if (!t || !e.component || !s.value) return;
    const N = n.value?.graph || [], P = Un(N), z = ++v;
    p.value = /* @__PURE__ */ new Set(), b.value = !1, l.value = { status: "scanning", modules: [], findings: [], scanned: 0, total: N.length };
    try {
      const d = await t.scan({ component: e.component, version: i() });
      if (z !== v) return;
      const ee = fr(d);
      if (Un(ee.modules) !== P)
        throw new Error("Security scan resolved different module versions. Refresh the install plan and scan again.");
      l.value = ee;
    } catch (d) {
      if (z === v) {
        const ee = d instanceof qt && (d.status === 404 || d.code === "UNKNOWN" || d.code === "NETWORK");
        l.value = ee ? { status: "unavailable", modules: [], findings: [], scanned: 0, total: N.length, error: "Security scan unavailable" } : { status: "error", modules: [], findings: [], scanned: 0, total: N.length, error: Ee(d, "scan failed") };
      }
    }
  }
  function L() {
    const N = n.value?.graph || [];
    v++, l.value = {
      status: "skipped",
      modules: [],
      findings: [],
      scanned: 0,
      total: N.length,
      summary: "Security scan skipped by operator."
    }, p.value = /* @__PURE__ */ new Set(), b.value = !1;
  }
  function j() {
    v++;
  }
  return { scan: l, acknowledged: p, criticalConfirmed: b, softFindings: w, unacknowledgedSoft: C, acknowledge: M, acknowledgeAllSoft: E, resetScanForPlan: F, runScanNow: U, skipScan: L, cancelScan: j };
}
const br = {
  "hub.install.started": "Publishing changeset",
  "hub.install.finished": "Finalizing",
  "hub.migrations.started": "Running migrations",
  "hub.migrations.finished": "Migrations applied",
  "hub.uninstall.started": "Removing entries"
}, jn = [
  { label: "Run migrations (up)", value: "up" },
  { label: "Skip migrations (none)", value: "none" }
];
function vr(e) {
  if (!e || typeof e != "object") return "";
  const t = [e, e.data, e.payload, e.detail];
  for (const n of t)
    if (n && typeof n == "object" && typeof n.event == "string")
      return String(n.event);
  return "";
}
function gr(e, t) {
  const n = Go(co), s = B("overview"), i = B(""), l = B("pin"), p = B([]), b = B(!1), v = q(() => [
    { label: "latest", value: "" },
    ...p.value.map((G) => String(G.version || "")).filter(Boolean).map((G) => ({ label: G, value: G }))
  ]), y = q(() => p.value.find((G) => G.version === i.value) || p.value[0]);
  function w() {
    const G = i.value.trim().replace(/^>=?/, "");
    if (G)
      return l.value === "track" ? `>=${G}` : G;
  }
  const C = q(() => e.installedDep ? ht(e.installedDep) : ""), M = B(""), E = B(!1), F = B(null), U = B(!1), L = B(!1), j = B(null), N = B(null), P = B(null), z = q(() => (F.value?.graph || []).filter((G) => G.direct || G.module === e.component)), d = q(() => (F.value?.graph || []).filter((G) => !G.direct && G.module !== e.component)), ee = q(() => Gi(F.value?.graph || [])), f = q(() => {
    const G = [], ge = (he, ze) => {
      for (const T of he)
        G.push({ ...T, level: ze }), ge(T.children, ze + 1);
    };
    return ge(ee.value, 0), G;
  }), k = q(() => F.value?.module_count || F.value?.graph?.length || 0), O = q(() => (F.value?.graph || []).reduce((G, ge) => G + (ge.size_bytes || 0), 0));
  function ue(G) {
    return Yi(G, { currentVersion: C.value, targetModule: e.component });
  }
  const R = mr({ props: e, hub: n, plan: F, activeSection: s, versionArg: w, requirementPayload: xt, invalidatePlan: x, refreshPlan: $t, planCurrent: L }), {
    pendingSuggestions: Q,
    pendingCount: K,
    acceptSuggestions: ne,
    rejectSuggestions: I,
    editSuggestions: V,
    displayValue: W,
    requirements: te,
    requirementGroups: se,
    rootRequirements: ie,
    transitiveRequirementCount: pe,
    parameterValues: we,
    editableRequirements: He,
    missingRequirements: Ge,
    boundRequirementCount: bt,
    autoFitCount: Et,
    aiResolvableCount: Pt,
    aiResolving: Ie,
    aiResolutionNotice: Wt,
    resolveRequirementsWithAI: it,
    highlightTick: We,
    setParameter: vt,
    requirementValue: st,
    requirementMissing: Ze,
    requirementReadOnly: Ue,
    requirementOptions: Ve,
    typeInvalidRequirements: _e,
    requirementTypeInvalid: Ye,
    requirementTypeHint: Xe,
    canAutoFitRequirement: Ft,
    autoFitRequirement: at,
    autoFitRequirements: Je,
    loadInstalledParameterHints: je,
    applyPlan: Tt,
    resetRequirements: S,
    abortAI: _
  } = R, D = B("up"), H = B([]), Y = q(() => H.value.length > 0), X = q({
    get: () => Y.value ? "up" : D.value,
    set: (G) => {
      D.value = G;
    }
  }), me = q(() => Y.value ? [jn[0]] : jn), $e = q(() => F.value?.migrations || []), lt = q(() => F.value?.dependency?.id || F.value?.install_payload?.id || ""), Vt = hr({ props: e, hub: n, plan: F, planCurrent: L, versionArg: w }), {
    scan: ve,
    acknowledged: De,
    criticalConfirmed: rt,
    softFindings: gt,
    unacknowledgedSoft: yt,
    acknowledge: ke,
    acknowledgeAllSoft: Pe,
    resetScanForPlan: ut,
    runScanNow: Qe,
    skipScan: sn,
    cancelScan: Dt
  } = Vt, It = q(() => {
    const G = U.value || Ie.value ? { tone: "loading" } : K.value ? { tone: "warn", badge: String(K.value) } : Ge.value.length || _e.value.length ? { tone: "danger", badge: String(Ge.value.length + _e.value.length) } : te.value.length ? { tone: "ok" } : { tone: "none" }, ge = {
      scanning: "loading",
      clean: "ok",
      warnings: "warn",
      critical: "danger",
      error: "danger",
      unavailable: "none",
      idle: "none",
      skipped: "none"
    }[ve.value.status] || "none";
    return {
      overview: { tone: "none" },
      modules: U.value ? { tone: "loading" } : F.value ? { tone: "none", badge: String(k.value) } : { tone: "none" },
      requirements: G,
      scan: { tone: ge, badge: ve.value.findings.length ? String(ve.value.findings.length) : void 0 },
      review: $e.value.length ? { tone: "none", badge: String($e.value.length) } : { tone: "none" }
    };
  }), Re = B(!1), Ne = B(!1), kt = B(null), wt = B(null), Ce = B(null), dt = B(null), an = q(() => Nn(kt.value || dt.value)), _t = B(""), ct = B(0);
  let pt = null, et = null, Se = 0, tt = 0, ye = 0;
  function Zt() {
    _t.value = "", ct.value = 0;
    const G = Date.now();
    pt = setInterval(() => {
      ct.value = Math.floor((Date.now() - G) / 1e3);
    }, 250);
    try {
      const ge = Ji("keeper.hub", (he) => {
        const ze = br[vr(he)];
        ze && (_t.value = ze);
      });
      et = typeof ge == "function" ? ge : null;
    } catch {
      et = null;
    }
  }
  function xe() {
    if (pt && (clearInterval(pt), pt = null), et) {
      try {
        et();
      } catch {
      }
      et = null;
    }
  }
  function xt() {
    const G = [], ge = [];
    for (const he of He.value) {
      const ze = fe(he);
      if (!ze) continue;
      const T = we.value[ze], de = typeof T == "string" ? T.trim() : T;
      if (de == null || de === "") continue;
      (Ln(he, e.component) ? ge : G).push({ name: ze, value: de });
    }
    return {
      parameters: G.length ? G : void 0,
      requirement_bindings: ge.length ? ge : void 0
    };
  }
  function Rt(G, ge) {
    const he = Zo?.toast;
    typeof he == "function" && he({ severity: G === "ok" ? "success" : "error", summary: ge });
  }
  async function Ot(G) {
    if (!n || !e.component || !L.value || F.value?.applicable === !1 || K.value || Ie.value) return;
    const ge = ++ye, he = () => ge === ye && e.open;
    G ? Ne.value = !0 : Re.value = !0, kt.value = null, Ce.value = null, wt.value = null, dt.value = null, G || Zt();
    let ze = !1;
    try {
      if (!G && e.mode === "update" && e.component === An) {
        if (await no(n)) throw new Error(mi);
        if (!he()) return;
      }
      const T = await n.install({
        component: e.component,
        version: w(),
        id: e.mode === "update" && e.currentId ? e.currentId : void 0,
        dry_run: G || void 0,
        migration_policy: X.value,
        ...xt()
      });
      if (!he()) return;
      if (T.success !== !0) throw new qt("INSTALL_INCOMPLETE", "Keeper does not confirm a successful install.", void 0, T);
      if (G || await Xi(n, H.value, {
        isCurrent: he,
        onPhase: (de) => {
          _t.value = de;
        }
      }), !he()) return;
      if (kt.value = T, !G) {
        const de = e.mode === "update" ? "updated" : "installed";
        Rt("ok", `Module ${de}: ${T.dependency?.id || e.component}`), to(), ze = !0;
      }
    } catch (T) {
      if (!he()) return;
      ot("install:run", T), T instanceof qt && (Ce.value = T.code, dt.value = T.details), wt.value = Ee(T, G ? "preview failed" : "install failed"), Rt("error", wt.value);
    } finally {
      ge === ye && (G ? Ne.value = !1 : (Re.value = !1, xe()));
    }
    ze && t("changed");
  }
  const Oe = q(() => !F.value || j.value ? "modules" : K.value || Ie.value || Ge.value.length || _e.value.length || !L.value || F.value.applicable === !1 || te.value.some((G) => G.invalid) ? "requirements" : ve.value.status === "idle" || ve.value.status === "scanning" || ve.value.status === "critical" && !rt.value || yt.value.length ? "scan" : null), Bt = q(() => Re.value || Ne.value || U.value || !F.value || !!j.value || !L.value || K.value > 0 || Ie.value || ve.value.status === "scanning" || s.value === "scan" && ve.value.status === "idle"), Ht = q(() => {
    if (K.value) return `Review ${K.value} AI suggestion${K.value === 1 ? "" : "s"}`;
    if (Ie.value) return "Resolving settings…";
    if (!L.value) return "Validating settings…";
    const G = Ge.value.length;
    return G ? `${G} required setting${G === 1 ? "" : "s"} missing` : "Review requirement errors";
  }), Yt = q(() => Re.value || Ne.value || U.value || !F.value || !!j.value || !L.value || K.value > 0 || Ie.value), St = q(() => Re.value ? e.mode === "update" ? "Updating…" : "Installing…" : Oe.value === "scan" && ve.value.status === "idle" ? s.value === "scan" ? "Choose scan option" : "Review scan choice" : Oe.value === "scan" && s.value === "scan" && (ve.value.status === "warnings" || ve.value.status === "critical") ? "Install anyway" : e.mode === "update" ? "Update" : "Install");
  function Xt() {
    if (Bt.value) return;
    const G = Oe.value;
    if (G === "requirements") {
      s.value = "requirements", We.value++;
      return;
    }
    if (G === "scan") {
      if (s.value !== "scan") {
        s.value = "scan";
        return;
      }
      if (ve.value.status === "idle" || ve.value.status === "scanning" || ve.value.status === "critical" && !rt.value || (Pe(), Oe.value)) return;
    }
    if (G === "modules") {
      s.value = "modules";
      return;
    }
    Ot(!1);
  }
  function Lt() {
    if (!L.value || F.value?.applicable === !1 || K.value || Ie.value || te.value.some((G) => G.invalid) || Ge.value.length || _e.value.length) {
      s.value = "requirements", We.value++;
      return;
    }
    s.value = "review", Ot(!0);
  }
  async function $t() {
    if (!n || !e.component) return;
    Le && (clearTimeout(Le), Le = null);
    const G = ++Se;
    L.value = !1, U.value = !0, j.value = null, N.value = null, P.value = null;
    const ge = { ...we.value };
    try {
      const he = await n.planInstall({
        component: e.component,
        version: w(),
        id: e.mode === "update" && e.currentId ? e.currentId : void 0,
        run_migrations: X.value === "up",
        ...xt()
      });
      if (G !== Se || !e.open) return;
      const ze = Zi(he.requirements || []);
      H.value = ze, Tt(he, ge), L.value = !0, ut(he.graph || []);
    } catch (he) {
      if (G !== Se || !e.open) return;
      ot("install:plan", he), F.value = null, ve.value = so(), j.value = Ee(he, "failed to plan install"), he instanceof qt && (N.value = he.code, P.value = he.details);
    } finally {
      G === Se && (U.value = !1);
    }
  }
  let Le = null;
  function x() {
    Se++, L.value = !1, _(), g();
  }
  function g() {
    Le && clearTimeout(Le), Le = setTimeout(() => {
      $t();
    }, 350);
  }
  async function Ke() {
    if (p.value = [], !(!n || !e.component)) {
      b.value = !0;
      try {
        const G = await n.listVersions(e.component);
        p.value = G.items || [];
      } catch (G) {
        ot("install:versions", G);
      } finally {
        b.value = !1;
      }
    }
  }
  async function Bn() {
    if (M.value = "", !(!n || !e.component)) {
      E.value = !0;
      try {
        const G = await n.getReadme(e.component);
        M.value = G.content || "";
      } catch {
      } finally {
        E.value = !1;
      }
    }
  }
  function Hn() {
    Se++, s.value = "overview", F.value = null, L.value = !1, H.value = [], Re.value = !1, Ne.value = !1, j.value = null, N.value = null, P.value = null, X.value = "up", kt.value = null, wt.value = null, Ce.value = null, dt.value = null, S(), ut(), M.value = "", p.value = [];
  }
  async function _n() {
    const G = ++tt;
    Hn(), i.value = e.mode === "update" ? "" : e.version || "", l.value = "track", await Promise.all([Ke(), Bn(), je()]), !(!e.open || G !== tt) && (e.mode === "update" && !i.value && p.value.length && (i.value = String(p.value[0].version || "")), await $t());
  }
  qe(() => e.open, (G) => {
    if (G) {
      _n();
      return;
    }
    _(), xe(), ye++, Re.value = !1, Ne.value = !1, tt++, Se++, Dt(), Le && (clearTimeout(Le), Le = null);
  }, { immediate: !0 }), qe([i, l], () => {
    e.open && n && x();
  }, { flush: "sync" }), qe(X, () => {
    e.open && n && F.value && x();
  }, { flush: "sync" }), ro(() => {
    ye++, _(), xe(), tt++, Se++, Dt(), Le && clearTimeout(Le);
  });
  function Ut() {
    _(), ye++, Re.value = !1, Ne.value = !1, xe(), t("close");
  }
  return {
    // nav
    activeSection: s,
    sectionStatus: It,
    blockingSection: Oe,
    // version
    version: i,
    versionMode: l,
    versionOptions: v,
    versionsLoading: b,
    versionMeta: y,
    currentVersion: C,
    // overview
    readme: M,
    readmeLoading: E,
    // plan
    plan: F,
    planCurrent: L,
    planLoading: U,
    planError: j,
    planCode: N,
    planErrorDetails: P,
    directModules: z,
    transitiveModules: d,
    planTree: ee,
    planRows: f,
    moduleCount: k,
    totalSize: O,
    badgesForNode: ue,
    // requirements
    requirements: te,
    requirementGroups: se,
    rootRequirements: ie,
    editableRequirements: He,
    transitiveRequirementCount: pe,
    parameterValues: we,
    missingRequirements: Ge,
    boundRequirementCount: bt,
    autoFitCount: Et,
    aiResolvableCount: Pt,
    aiResolving: Ie,
    aiResolutionNotice: Wt,
    resolveRequirementsWithAI: it,
    pendingSuggestions: Q,
    pendingCount: K,
    acceptSuggestions: ne,
    rejectSuggestions: I,
    editSuggestions: V,
    displayValue: W,
    highlightTick: We,
    setParameter: vt,
    requirementValue: st,
    requirementMissing: Ze,
    requirementReadOnly: Ue,
    requirementOptions: Ve,
    requirementConfiguredBy: Wi,
    typeInvalidRequirements: _e,
    requirementTypeInvalid: Ye,
    requirementTypeHint: Xe,
    canAutoFitRequirement: Ft,
    autoFitRequirement: at,
    autoFitRequirements: Je,
    // review / options
    requiredSetup: Y,
    migrationPolicy: X,
    migrationOptions: me,
    migrations: $e,
    destinationId: lt,
    INSTALL_MIGRATION_OPTIONS: jn,
    // scan
    scan: ve,
    acknowledged: De,
    criticalConfirmed: rt,
    softFindings: gt,
    unacknowledgedSoft: yt,
    acknowledge: ke,
    acknowledgeAllSoft: Pe,
    runScanNow: Qe,
    skipScan: sn,
    // execution
    running: Re,
    dryRunning: Ne,
    result: kt,
    resultError: wt,
    resultCode: Ce,
    resultErrorDetails: dt,
    resultExecution: an,
    executionStepLabel: qo,
    progressPhase: _t,
    elapsedSec: ct,
    requirementStatusMessage: Ht,
    primaryDisabled: Bt,
    previewDisabled: Yt,
    primaryLabel: St,
    primaryAction: Xt,
    preview: Lt,
    refreshPlan: $t,
    close: Ut
  };
}
const yr = { class: "km-2p-head-icon" }, kr = { class: "km-2p-head-text" }, wr = { class: "km-2p-head-title" }, Sr = { class: "km-2p-head-sub" }, $r = { class: "km-dim km-mono" }, Cr = { class: "km-2p" }, Ir = {
  class: "km-2p-nav",
  "aria-label": "Install steps"
}, _r = ["onClick"], xr = { class: "km-2p-navlabel" }, Or = { class: "km-2p-navstatus" }, Lr = {
  key: 2,
  class: "km-dot km-dot-danger",
  "aria-hidden": "true"
}, zr = {
  key: 3,
  class: "km-dot km-dot-warn",
  "aria-hidden": "true"
}, Ar = {
  key: 4,
  class: "km-navbadge"
}, Mr = { class: "km-sec" }, Er = { class: "km-ov-hero" }, Pr = { class: "km-ov-icon" }, Fr = { class: "km-grow km-min0" }, Tr = { class: "km-row-wrap" }, Vr = { class: "km-ov-name" }, Dr = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Rr = {
  key: 1,
  class: "badge-warn kx-tag-caps"
}, Br = { class: "km-ov-org km-mono" }, Hr = {
  key: 0,
  class: "km-ov-desc"
}, Ur = {
  key: 1,
  class: "km-hint"
}, jr = { class: "km-field" }, Nr = {
  class: "km-seg",
  role: "group",
  "aria-label": "Version mode"
}, Kr = ["aria-pressed"], qr = ["aria-pressed"], Gr = { class: "km-hint" }, Wr = { class: "km-ov-meta" }, Zr = { class: "km-meta-row" }, Yr = {
  key: 0,
  class: "km-meta-row"
}, Xr = {
  key: 1,
  class: "km-meta-row"
}, Jr = ["title"], Qr = {
  key: 2,
  class: "km-meta-row"
}, eu = {
  key: 3,
  class: "km-meta-row"
}, tu = {
  key: 4,
  class: "km-meta-row"
}, nu = {
  key: 5,
  class: "km-meta-row"
}, ou = {
  key: 2,
  class: "km-loading"
}, iu = {
  key: 3,
  class: "km-ov-readme"
}, su = { class: "km-sec" }, au = {
  key: 1,
  class: "km-msg km-msg-err"
}, lu = {
  key: 0,
  class: "km-code"
}, ru = { class: "km-sec-title" }, uu = {
  key: 0,
  class: "km-dim"
}, du = {
  key: 1,
  class: "km-tree-spacer",
  "aria-hidden": "true"
}, cu = { class: "km-mrow-badge kx-tag-caps" }, pu = { class: "km-mrow-name km-mono" }, fu = {
  key: 2,
  class: "km-mrow-ver km-mono"
}, mu = {
  key: 3,
  class: "km-dim km-mono"
}, hu = {
  key: 4,
  class: "km-dim"
}, bu = { class: "km-sec" }, vu = {
  key: 1,
  class: "km-empty-inline"
}, gu = { class: "km-sec-title" }, yu = { class: "km-dim" }, ku = { class: "km-req-toolbar" }, wu = {
  key: 0,
  class: "km-code"
}, Su = {
  key: 1,
  class: "km-code"
}, $u = {
  key: 2,
  class: "km-mono"
}, Cu = {
  key: 1,
  class: "km-req-toolbar",
  role: "status"
}, Iu = { class: "km-grow" }, _u = { class: "km-req-group-head" }, xu = { class: "km-mono" }, Ou = {
  key: 0,
  class: "km-dim"
}, Lu = { class: "km-req-meta" }, zu = { class: "km-mono km-req-name" }, Au = {
  key: 0,
  class: "km-req-flag"
}, Mu = {
  key: 1,
  class: "km-chip km-mono"
}, Eu = ["aria-label", "disabled", "value", "list", "placeholder", "onInput"], Pu = ["id"], Fu = ["value", "title"], Tu = {
  key: 1,
  class: "km-readonly-field km-mono"
}, Vu = { class: "km-req-foot" }, Du = {
  key: 0,
  class: "km-req-src"
}, Ru = {
  key: 1,
  class: "km-req-invalid"
}, Bu = {
  key: 2,
  class: "km-req-invalid"
}, Hu = {
  key: 3,
  class: "km-req-info"
}, Uu = {
  key: 4,
  class: "km-req-info"
}, ju = ["aria-label"], Nu = { class: "km-mono" }, Ku = { class: "km-row-gap" }, qu = {
  key: 3,
  class: "km-msg km-msg-err",
  role: "alert"
}, Gu = { class: "km-code" }, Wu = { key: 0 }, Zu = {
  key: 4,
  class: "km-req-desc"
}, Yu = { class: "km-sec" }, Xu = { class: "km-sec-title" }, Ju = {
  key: 0,
  class: "km-scan-run"
}, Qu = {
  key: 1,
  class: "km-msg km-msg-info"
}, ed = {
  key: 2,
  class: "km-scan-run"
}, td = { class: "km-grow" }, nd = {
  key: 3,
  class: "km-empty-inline"
}, od = {
  key: 4,
  class: "km-msg km-msg-err"
}, id = {
  key: 5,
  class: "km-msg km-msg-info"
}, sd = {
  key: 0,
  class: "km-scan-overall"
}, ad = {
  key: 1,
  class: "km-msg km-msg-err"
}, ld = { class: "km-scan-mod-head" }, rd = { class: "km-mono km-scan-mod-name" }, ud = { class: "km-chip" }, dd = {
  key: 0,
  class: "km-scan-mod-sum"
}, cd = { class: "km-grow km-min0" }, pd = { class: "km-finding-head" }, fd = { class: "km-finding-title" }, md = {
  key: 0,
  class: "km-finding-detail"
}, hd = {
  key: 1,
  class: "km-finding-loc km-mono"
}, bd = ["onClick"], vd = {
  key: 1,
  class: "km-dim km-scan-mod-clean"
}, gd = {
  key: 2,
  class: "km-check km-mt"
}, yd = { class: "km-sec" }, kd = { class: "km-sec-title" }, wd = { class: "km-review-grid" }, Sd = { class: "km-review-tile" }, $d = { class: "km-review-tile" }, Cd = { class: "km-review-tile" }, Id = { class: "km-review-tile" }, _d = { class: "km-field" }, xd = {
  key: 0,
  class: "km-hint"
}, Od = {
  key: 1,
  class: "km-mig-list"
}, Ld = { class: "km-mono km-trunc" }, zd = { class: "km-chip" }, Ad = { class: "km-hint" }, Md = { class: "km-adv" }, Ed = { class: "km-adv-body" }, Pd = { class: "km-meta-row" }, Fd = { class: "km-mono" }, Td = { class: "km-meta-row" }, Vd = { class: "km-mono" }, Dd = {
  key: 0,
  class: "km-panel km-panel-ok"
}, Rd = { class: "km-panel-title" }, Bd = {
  key: 0,
  class: "km-dim"
}, Hd = {
  key: 1,
  class: "km-dim"
}, Ud = {
  key: 0,
  class: "km-dim"
}, jd = {
  key: 1,
  class: "km-ledger"
}, Nd = { class: "km-ledger-step" }, Kd = { class: "km-grow" }, qd = { class: "km-chip" }, Gd = {
  key: 0,
  class: "km-ledger-msg"
}, Wd = {
  key: 2,
  class: "km-msg km-msg-err"
}, Zd = {
  key: 0,
  class: "km-code"
}, Yd = {
  key: 0,
  class: "km-running km-2p-progress"
}, Xd = { class: "km-grow km-running-label" }, Jd = { class: "km-dim" }, Qd = {
  key: 0,
  class: "km-foot-note"
}, ec = /* @__PURE__ */ on({
  __name: "InstallDialog",
  props: {
    open: { type: Boolean },
    mode: {},
    component: {},
    version: {},
    currentId: {},
    catalogItem: {},
    installedDep: {}
  },
  emits: ["close", "changed"],
  setup(e, { emit: t }) {
    const n = e, i = gr(n, t), l = [
      { key: "overview", label: "Overview", icon: "tabler:info-circle" },
      { key: "modules", label: "Modules", icon: "tabler:hierarchy-2" },
      { key: "requirements", label: "Requirements", icon: "tabler:adjustments" },
      { key: "scan", label: "Security scan", icon: "tabler:shield-check" },
      { key: "review", label: "Review & install", icon: "tabler:checklist" }
    ], p = q(() => n.catalogItem || { full_name: n.component, component: n.component }), b = q(() => bn(p.value)), v = q(() => n.mode === "update" ? "Update module" : "Install module");
    function y(z) {
      const d = i.requirementOptions(z), ee = i.requirementValue(z);
      return ee && !d.some((f) => f.value === ee) ? [{ label: `${ee} (current)`, value: ee }, ...d] : d;
    }
    function w(z) {
      return `km-req-options-${fe(z).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    }
    function C(z) {
      return {
        provided: "you set this",
        provided_bare: "you set this",
        existing: "auto-detected",
        existing_bare: "auto-detected",
        default: "package default",
        registry: "from registry",
        conflict: "multiple candidates — pick one"
      }[String(z.value_source || "")] || "";
    }
    const M = B(null), E = B(!1);
    let F;
    ro(() => clearTimeout(F)), qe(() => i.highlightTick.value, async (z, d, ee) => {
      let f = !0;
      if (ee(() => {
        f = !1;
      }), i.activeSection.value !== "requirements" || (await mn(), !f)) return;
      M.value?.querySelector(".km-req.is-missing, .km-req.is-invalid")?.scrollIntoView({ block: "center", behavior: "smooth" }), E.value = !0, clearTimeout(F), F = setTimeout(() => {
        E.value = !1;
      }, 1200);
    });
    function U(z) {
      return Fo[z.severity].tone;
    }
    function L(z) {
      return z === "critical" || z === "error" ? "km-dot-danger" : z === "warnings" ? "km-dot-warn" : "km-dot-ok";
    }
    function j(z) {
      return `km-plan-badge kx-tag-caps km-plan-badge-${z}`;
    }
    function N(z) {
      return z === "failed" || z === "rollback_failed" ? "km-ledger-bad" : z === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok";
    }
    const P = q(() => i.progressPhase.value || (n.mode === "update" ? "Updating…" : "Installing…"));
    return uo(() => {
      Wo("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (z, d) => {
      const ee = Ae("wc-render-markdown");
      return a(), be(jl, {
        visible: e.open,
        busy: o(i).running.value || o(i).dryRunning.value,
        label: v.value,
        class: "km-dialog km-dialog-2p",
        "header-class": "km-modal-head km-2p-head",
        "content-class": "km-dialog-content km-dialog-content-2p",
        "footer-class": "km-modal-foot km-2p-foot",
        style: Kt({ "--accent": b.value }),
        onClose: d[19] || (d[19] = (f) => o(i).close())
      }, {
        header: oe(() => [
          r("span", yr, [
            m(o($), {
              icon: o(nn)(p.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          r("span", kr, [
            r("span", wr, c(v.value), 1),
            r("span", Sr, [
              A(c(o(tn)(p.value)) + " ", 1),
              r("span", $r, c(n.component), 1)
            ])
          ])
        ]),
        footer: oe(() => [
          o(i).running.value ? (a(), u("div", Yd, [
            m(o($), {
              icon: "tabler:loader-2",
              class: "km-i spin km-accent",
              "aria-hidden": "true"
            }),
            r("span", Xd, c(P.value), 1),
            r("span", Jd, c(o(i).elapsedSec.value) + "s", 1)
          ])) : (a(), u(J, { key: 1 }, [
            o(i).blockingSection.value === "requirements" ? (a(), u("span", Qd, [
              m(o($), {
                icon: "tabler:alert-triangle",
                class: "km-i-sm",
                "aria-hidden": "true"
              }),
              A(" " + c(o(i).requirementStatusMessage.value), 1)
            ])) : h("", !0),
            o(i).blockingSection.value === "requirements" ? (a(), be(o(ce), {
              key: 1,
              size: "small",
              severity: "secondary",
              outlined: "",
              disabled: o(i).autoFitCount.value === 0,
              onClick: d[15] || (d[15] = (f) => o(i).autoFitRequirements())
            }, {
              default: oe(() => [
                m(o($), {
                  icon: "tabler:wand",
                  class: "km-i",
                  "aria-hidden": "true"
                }),
                d[75] || (d[75] = A(" Auto-fit ", -1))
              ]),
              _: 1
            }, 8, ["disabled"])) : h("", !0),
            d[78] || (d[78] = r("span", { class: "km-grow" }, null, -1)),
            m(o(ce), {
              size: "small",
              severity: "secondary",
              text: "",
              onClick: d[16] || (d[16] = (f) => o(i).close())
            }, {
              default: oe(() => [...d[76] || (d[76] = [
                A("Cancel", -1)
              ])]),
              _: 1
            }),
            m(o(ce), {
              size: "small",
              severity: "secondary",
              outlined: "",
              disabled: o(i).previewDisabled.value,
              onClick: d[17] || (d[17] = (f) => o(i).preview())
            }, {
              default: oe(() => [
                m(o($), {
                  icon: o(i).dryRunning.value ? "tabler:loader-2" : "tabler:eye",
                  class: ae(["km-i", o(i).dryRunning.value && "spin"]),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"]),
                d[77] || (d[77] = A(" Preview changes ", -1))
              ]),
              _: 1
            }, 8, ["disabled"]),
            m(o(ce), {
              size: "small",
              disabled: o(i).primaryDisabled.value,
              onClick: d[18] || (d[18] = (f) => o(i).primaryAction())
            }, {
              default: oe(() => [
                m(o($), {
                  icon: n.mode === "update" ? "tabler:refresh-dot" : "tabler:download",
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                A(" " + c(o(i).primaryLabel.value), 1)
              ]),
              _: 1
            }, 8, ["disabled"])
          ], 64))
        ]),
        default: oe(() => [
          r("div", Cr, [
            r("nav", Ir, [
              (a(), u(J, null, re(l, (f) => r("button", {
                key: f.key,
                class: ae(["km-2p-navitem", { active: o(i).activeSection.value === f.key }]),
                onClick: (k) => o(i).activeSection.value = f.key
              }, [
                m(o($), {
                  icon: f.icon,
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                r("span", xr, c(f.label), 1),
                r("span", Or, [
                  o(i).sectionStatus.value[f.key].tone === "loading" ? (a(), be(o($), {
                    key: 0,
                    icon: "tabler:loader-2",
                    class: "km-i-sm spin km-dim",
                    "aria-hidden": "true"
                  })) : o(i).sectionStatus.value[f.key].tone === "ok" ? (a(), be(o($), {
                    key: 1,
                    icon: "tabler:circle-check-filled",
                    class: "km-i-sm km-sev-ok-fg",
                    "aria-hidden": "true"
                  })) : o(i).sectionStatus.value[f.key].tone === "danger" ? (a(), u("span", Lr)) : o(i).sectionStatus.value[f.key].tone === "warn" ? (a(), u("span", zr)) : h("", !0),
                  o(i).sectionStatus.value[f.key].badge ? (a(), u("span", Ar, c(o(i).sectionStatus.value[f.key].badge), 1)) : h("", !0)
                ])
              ], 10, _r)), 64))
            ]),
            r("div", {
              ref_key: "mainRef",
              ref: M,
              class: "km-2p-main"
            }, [
              Be(r("section", Mr, [
                r("div", Er, [
                  r("span", Pr, [
                    m(o($), {
                      icon: o(nn)(p.value),
                      class: "km-i-lg",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  r("div", Fr, [
                    r("div", Tr, [
                      r("span", Vr, c(o(tn)(p.value)), 1),
                      o(cn)(p.value) ? (a(), u("span", Dr, "app")) : h("", !0),
                      p.value.deprecated ? (a(), u("span", Rr, "deprecated")) : h("", !0)
                    ]),
                    r("div", Br, c(n.component), 1)
                  ])
                ]),
                p.value.description ? (a(), u("p", Hr, c(p.value.description), 1)) : h("", !0),
                n.mode === "update" && !n.currentId ? (a(), u("p", Ur, " Updating this module creates an application root dependency for the selected version. This version also applies to modules that depend on it; the plan shows any conflicts. ")) : h("", !0),
                r("div", jr, [
                  d[21] || (d[21] = r("label", { class: "km-label" }, "Version", -1)),
                  m(Po, {
                    modelValue: o(i).version.value,
                    "onUpdate:modelValue": d[0] || (d[0] = (f) => o(i).version.value = f),
                    items: o(i).versionOptions.value.map((f) => ({ id: f.value, title: f.label })),
                    placeholder: "latest",
                    "aria-label": "Version"
                  }, null, 8, ["modelValue", "items"]),
                  r("div", Nr, [
                    r("button", {
                      class: ae(["km-seg-btn", { active: o(i).versionMode.value === "pin" }]),
                      "aria-pressed": o(i).versionMode.value === "pin",
                      onClick: d[1] || (d[1] = (f) => o(i).versionMode.value = "pin")
                    }, [
                      m(o($), {
                        icon: "tabler:pin",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      A(" Pin " + c(o(i).version.value || "latest"), 1)
                    ], 10, Kr),
                    r("button", {
                      class: ae(["km-seg-btn", { active: o(i).versionMode.value === "track" }]),
                      "aria-pressed": o(i).versionMode.value === "track",
                      onClick: d[2] || (d[2] = (f) => o(i).versionMode.value = "track")
                    }, [
                      m(o($), {
                        icon: "tabler:arrow-up-circle",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      d[20] || (d[20] = A(" Track updates ", -1))
                    ], 10, qr)
                  ]),
                  r("p", Gr, c(o(i).versionMode.value === "pin" ? "Locks to this exact version; future updates are manual." : `Tracks ${o(i).version.value ? "≥ " + o(i).version.value : "all"} releases on the next resolve.`), 1)
                ]),
                r("div", Wr, [
                  r("div", Zr, [
                    m(o($), {
                      icon: "tabler:download",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[22] || (d[22] = r("span", null, "Downloads", -1)),
                    r("b", null, c(o(vn)(p.value.total_downloads)), 1)
                  ]),
                  p.value.favorites_count ? (a(), u("div", Yr, [
                    m(o($), {
                      icon: "tabler:star",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[23] || (d[23] = r("span", null, "Favorites", -1)),
                    r("b", null, c(p.value.favorites_count), 1)
                  ])) : h("", !0),
                  p.value.license ? (a(), u("div", Xr, [
                    m(o($), {
                      icon: "tabler:license",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[24] || (d[24] = r("span", null, "License", -1)),
                    r("b", {
                      title: p.value.license
                    }, c(o(Vn)(p.value.license)), 9, Jr)
                  ])) : h("", !0),
                  p.value.type ? (a(), u("div", Qr, [
                    m(o($), {
                      icon: "tabler:category",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[25] || (d[25] = r("span", null, "Type", -1)),
                    r("b", null, c(p.value.type), 1)
                  ])) : h("", !0),
                  o(i).versionMeta.value?.entry_count ? (a(), u("div", eu, [
                    m(o($), {
                      icon: "tabler:list-numbers",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[26] || (d[26] = r("span", null, "Entries", -1)),
                    r("b", null, c(o(i).versionMeta.value.entry_count), 1)
                  ])) : h("", !0),
                  o(i).versionMeta.value?.size_bytes ? (a(), u("div", tu, [
                    m(o($), {
                      icon: "tabler:weight",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[27] || (d[27] = r("span", null, "Size", -1)),
                    r("b", null, c(o(pn)(o(i).versionMeta.value.size_bytes)), 1)
                  ])) : h("", !0),
                  p.value.update_time ? (a(), u("div", nu, [
                    m(o($), {
                      icon: "tabler:clock",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[28] || (d[28] = r("span", null, "Updated", -1)),
                    r("b", null, c(o(Dn)(p.value.update_time, { maxUnit: "year" })), 1)
                  ])) : h("", !0)
                ]),
                o(i).readmeLoading.value ? (a(), u("div", ou, [
                  m(o($), {
                    icon: "tabler:loader-2",
                    class: "km-i spin",
                    "aria-hidden": "true"
                  }),
                  d[29] || (d[29] = A(" Loading README…", -1))
                ])) : o(i).readme.value ? (a(), u("article", iu, [
                  m(ee, {
                    source: o(i).readme.value
                  }, null, 8, ["source"])
                ])) : h("", !0)
              ], 512), [
                [un, o(i).activeSection.value === "overview"]
              ]),
              Be(r("section", su, [
                o(i).planLoading.value ? (a(), u(J, { key: 0 }, [
                  d[30] || (d[30] = r("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "40%" }
                  }, null, -1)),
                  (a(), u(J, null, re(4, (f) => r("div", {
                    class: "km-skel km-skel-card",
                    key: f
                  })), 64))
                ], 64)) : o(i).planError.value ? (a(), u("div", au, [
                  o(i).planCode.value ? (a(), u("span", lu, c(o(i).planCode.value), 1)) : h("", !0),
                  A(c(o(i).planError.value), 1)
                ])) : o(i).plan.value ? (a(), u(J, { key: 2 }, [
                  r("div", ru, [
                    m(o($), {
                      icon: "tabler:hierarchy-2",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    A(" Installs " + c(o(i).moduleCount.value) + " module" + c(o(i).moduleCount.value === 1 ? "" : "s") + " ", 1),
                    o(i).totalSize.value ? (a(), u("span", uu, "· " + c(o(pn)(o(i).totalSize.value)), 1)) : h("", !0)
                  ]),
                  d[32] || (d[32] = r("p", { class: "km-hint" }, "Includes these dependencies at the versions shown.", -1)),
                  (a(!0), u(J, null, re(o(i).planRows.value, (f) => (a(), u("div", {
                    key: f.path || f.module,
                    class: ae(["km-mrow", { "km-mrow-direct": f.direct || f.module === n.component, "km-mrow-transitive": !(f.direct || f.module === n.component) }]),
                    style: Kt({ "--tree-level": f.level })
                  }, [
                    f.level > 0 ? (a(), be(o($), {
                      key: 0,
                      icon: "tabler:corner-down-right",
                      class: "km-i-sm km-dim",
                      "aria-hidden": "true"
                    })) : (a(), u("span", du)),
                    r("span", cu, c(f.direct || f.module === n.component ? "direct" : "transitive"), 1),
                    r("span", pu, c(f.module), 1),
                    f.version ? (a(), u("span", fu, c(f.version), 1)) : h("", !0),
                    f.constraint ? (a(), u("span", mu, c(f.constraint), 1)) : h("", !0),
                    d[31] || (d[31] = r("span", { class: "km-grow" }, null, -1)),
                    (a(!0), u(J, null, re(o(i).badgesForNode(f), (k) => (a(), u("span", {
                      key: k.label,
                      class: ae(j(k.tone))
                    }, c(k.label), 3))), 128)),
                    f.size_bytes ? (a(), u("span", hu, c(o(pn)(f.size_bytes)), 1)) : h("", !0)
                  ], 6))), 128))
                ], 64)) : h("", !0)
              ], 512), [
                [un, o(i).activeSection.value === "modules"]
              ]),
              Be(r("section", bu, [
                o(i).planLoading.value ? (a(), u(J, { key: 0 }, [
                  d[33] || (d[33] = r("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "30%" }
                  }, null, -1)),
                  (a(), u(J, null, re(3, (f) => r("div", {
                    class: "km-skel km-skel-field",
                    key: f
                  })), 64))
                ], 64)) : o(i).requirements.value.length ? (a(), u(J, { key: 2 }, [
                  r("div", gu, [
                    m(o($), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    d[35] || (d[35] = A(" Configuration ", -1)),
                    r("span", yu, "(" + c(o(i).boundRequirementCount.value) + "/" + c(o(i).requirements.value.length) + " set)", 1)
                  ]),
                  r("div", ku, [
                    d[37] || (d[37] = r("p", { class: "km-hint km-grow" }, "Connect required resources. Resources already configured by a dependency are shown for review.", -1)),
                    o(i).aiResolvableCount.value ? (a(), be(o(ce), {
                      key: 0,
                      size: "small",
                      severity: "secondary",
                      outlined: "",
                      disabled: o(i).aiResolving.value || !o(i).planCurrent.value,
                      onClick: d[3] || (d[3] = (f) => o(i).resolveRequirementsWithAI(M.value))
                    }, {
                      default: oe(() => [
                        m(o($), {
                          icon: o(i).aiResolving.value ? "tabler:loader-2" : "tabler:sparkles",
                          class: ae(["km-i", o(i).aiResolving.value && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        A(" " + c(o(i).aiResolving.value ? "Resolving…" : "Resolve with AI"), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled"])) : h("", !0),
                    o(i).missingRequirements.value.length ? (a(), be(o(ce), {
                      key: 1,
                      size: "small",
                      severity: "secondary",
                      outlined: "",
                      disabled: o(i).autoFitCount.value === 0,
                      onClick: d[4] || (d[4] = (f) => o(i).autoFitRequirements())
                    }, {
                      default: oe(() => [
                        m(o($), {
                          icon: "tabler:wand",
                          class: "km-i",
                          "aria-hidden": "true"
                        }),
                        d[36] || (d[36] = A(" Auto-fit ", -1))
                      ]),
                      _: 1
                    }, 8, ["disabled"])) : h("", !0)
                  ]),
                  o(i).aiResolutionNotice.value ? (a(), u("div", {
                    key: 0,
                    class: ae(["km-msg", o(i).aiResolutionNotice.value.tone === "success" ? "km-msg-ok" : "km-msg-warn"]),
                    role: "status"
                  }, [
                    o(i).aiResolutionNotice.value.code ? (a(), u("span", wu, c(o(i).aiResolutionNotice.value.code), 1)) : h("", !0),
                    o(i).aiResolutionNotice.value.kind ? (a(), u("span", Su, c(o(i).aiResolutionNotice.value.kind), 1)) : h("", !0),
                    A(" " + c(o(i).aiResolutionNotice.value.message) + " ", 1),
                    o(i).aiResolutionNotice.value.details ? (a(), u("pre", $u, c(JSON.stringify(o(i).aiResolutionNotice.value.details, null, 2)), 1)) : h("", !0)
                  ], 2)) : h("", !0),
                  o(i).pendingCount.value ? (a(), u("div", Cu, [
                    r("span", Iu, "Review " + c(o(i).pendingCount.value) + " AI suggestion" + c(o(i).pendingCount.value === 1 ? "" : "s") + " before applying.", 1),
                    m(o(ce), {
                      size: "small",
                      disabled: !o(i).planCurrent.value,
                      onClick: d[5] || (d[5] = (f) => o(i).acceptSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, {
                      default: oe(() => [...d[38] || (d[38] = [
                        A("Accept all", -1)
                      ])]),
                      _: 1
                    }, 8, ["disabled"]),
                    m(o(ce), {
                      size: "small",
                      severity: "secondary",
                      onClick: d[6] || (d[6] = (f) => o(i).rejectSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, {
                      default: oe(() => [...d[39] || (d[39] = [
                        A("Reject all", -1)
                      ])]),
                      _: 1
                    }),
                    m(o(ce), {
                      size: "small",
                      severity: "secondary",
                      disabled: !o(i).planCurrent.value,
                      onClick: d[7] || (d[7] = (f) => o(i).editSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, {
                      default: oe(() => [...d[40] || (d[40] = [
                        A("Edit all", -1)
                      ])]),
                      _: 1
                    }, 8, ["disabled"])
                  ])) : h("", !0),
                  (a(!0), u(J, null, re(o(i).requirementGroups.value, (f) => (a(), u("div", {
                    key: f.module,
                    class: "km-req-group"
                  }, [
                    r("div", _u, [
                      m(o($), {
                        icon: f.direct ? "tabler:package" : "tabler:corner-down-right",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      r("span", xu, c(f.module), 1),
                      f.direct ? h("", !0) : (a(), u("span", Ou, "dependency"))
                    ]),
                    (a(!0), u(J, null, re(f.items, (k) => (a(), u("div", {
                      key: o(fe)(k),
                      class: ae(["km-req", { "is-missing": o(i).requirementMissing(k), "is-invalid": o(i).requirementTypeInvalid(k), "is-flash": E.value && (o(i).requirementMissing(k) || o(i).requirementTypeInvalid(k)) }])
                    }, [
                      r("div", Lu, [
                        r("span", zu, c(k.name || o(fe)(k)), 1),
                        k.required || k.missing ? (a(), u("span", Au, "required")) : h("", !0),
                        k.expected_kind ? (a(), u("span", Mu, c(k.expected_kind), 1)) : h("", !0),
                        d[42] || (d[42] = r("span", { class: "km-grow" }, null, -1)),
                        o(i).requirementMissing(k) && o(i).canAutoFitRequirement(k) ? (a(), be(o(ce), {
                          key: 2,
                          size: "small",
                          severity: "secondary",
                          outlined: "",
                          class: "km-req-fit",
                          onClick: (O) => o(i).autoFitRequirement(k)
                        }, {
                          default: oe(() => [
                            m(o($), {
                              icon: "tabler:wand",
                              class: "km-i-sm",
                              "aria-hidden": "true"
                            }),
                            d[41] || (d[41] = A(" Auto-fit ", -1))
                          ]),
                          _: 1
                        }, 8, ["onClick"])) : h("", !0)
                      ]),
                      o(i).requirementReadOnly(k) ? (a(), u("div", Tu, c(o(i).requirementValue(k) || o(i).displayValue(k.default) || "not set"), 1)) : (a(), u(J, { key: 0 }, [
                        r("input", {
                          class: "km-input km-w-full",
                          "aria-label": k.name || o(fe)(k),
                          disabled: o(i).running.value || o(i).dryRunning.value,
                          value: o(i).requirementValue(k),
                          list: y(k).length ? w(k) : void 0,
                          placeholder: o(i).displayValue(k.default) || (k.expected_kind ? `Enter ${k.expected_kind} id` : "Enter registry id or value"),
                          onInput: (O) => o(i).setParameter(k, O.target.value)
                        }, null, 40, Eu),
                        y(k).length ? (a(), u("datalist", {
                          key: 0,
                          id: w(k)
                        }, [
                          (a(!0), u(J, null, re(y(k), (O) => (a(), u("option", {
                            key: O.value,
                            value: O.value,
                            title: O.title
                          }, c(O.label), 9, Fu))), 128))
                        ], 8, Pu)) : h("", !0)
                      ], 64)),
                      r("div", Vu, [
                        C(k) ? (a(), u("span", Du, [
                          m(o($), {
                            icon: "tabler:wand",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          A(" " + c(C(k)), 1)
                        ])) : h("", !0),
                        o(i).requirementTypeInvalid(k) ? (a(), u("span", Ru, [
                          m(o($), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          A(" " + c(o(i).requirementTypeHint(k)), 1)
                        ])) : k.invalid ? (a(), u("span", Bu, [
                          m(o($), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          A(" " + c(k.invalid_reason || "invalid value"), 1)
                        ])) : h("", !0),
                        o(i).requirementMissing(k) && !o(i).canAutoFitRequirement(k) ? (a(), u("span", Hu, [
                          m(o($), {
                            icon: "tabler:hand-click",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          d[43] || (d[43] = A(" choose a value to continue ", -1))
                        ])) : h("", !0),
                        o(i).requirementReadOnly(k) ? (a(), u("span", Uu, [
                          m(o($), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          A(" configured by " + c(o(i).requirementConfiguredBy(k)) + "; install it directly to override ", 1)
                        ])) : h("", !0)
                      ]),
                      o(i).pendingSuggestions.value[o(fe)(k)] ? (a(), u("div", {
                        key: 2,
                        class: "km-ai-proposal",
                        role: "group",
                        "aria-label": `AI suggestion for ${k.name || o(fe)(k)}`
                      }, [
                        r("div", Nu, "Suggested value: " + c(o(i).displayValue(o(i).pendingSuggestions.value[o(fe)(k)].value)), 1),
                        r("p", null, c(o(i).pendingSuggestions.value[o(fe)(k)].choice_reason), 1),
                        r("div", Ku, [
                          m(o(ce), {
                            size: "small",
                            disabled: !o(i).planCurrent.value,
                            onClick: (O) => o(i).acceptSuggestions([o(fe)(k)])
                          }, {
                            default: oe(() => [...d[44] || (d[44] = [
                              A("Accept", -1)
                            ])]),
                            _: 1
                          }, 8, ["disabled", "onClick"]),
                          m(o(ce), {
                            size: "small",
                            severity: "secondary",
                            onClick: (O) => o(i).rejectSuggestions([o(fe)(k)])
                          }, {
                            default: oe(() => [...d[45] || (d[45] = [
                              A("Reject", -1)
                            ])]),
                            _: 1
                          }, 8, ["onClick"]),
                          m(o(ce), {
                            size: "small",
                            severity: "secondary",
                            onClick: (O) => o(i).editSuggestions([o(fe)(k)])
                          }, {
                            default: oe(() => [...d[46] || (d[46] = [
                              A("Edit", -1)
                            ])]),
                            _: 1
                          }, 8, ["onClick"])
                        ])
                      ], 8, ju)) : h("", !0),
                      k.resolution_error ? (a(), u("div", qu, [
                        r("span", Gu, c(k.resolution_error.kind || k.resolution_error.code), 1),
                        A(" " + c(k.resolution_error.message) + " ", 1),
                        k.resolution_error.details ? (a(), u("pre", Wu, c(JSON.stringify(k.resolution_error.details, null, 2)), 1)) : h("", !0)
                      ])) : h("", !0),
                      k.description ? (a(), u("div", Zu, c(k.description), 1)) : h("", !0)
                    ], 2))), 128))
                  ]))), 128))
                ], 64)) : (a(), u("div", vu, [
                  m(o($), {
                    icon: "tabler:circle-check",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  d[34] || (d[34] = r("p", null, "Nothing to configure — this module needs no additional resources.", -1))
                ]))
              ], 512), [
                [un, o(i).activeSection.value === "requirements"]
              ]),
              Be(r("section", Yu, [
                r("div", Xu, [
                  m(o($), {
                    icon: "tabler:shield-check",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  d[47] || (d[47] = A(" Security scan", -1))
                ]),
                d[60] || (d[60] = r("p", { class: "km-hint" }, "An agent reviews the code of every module being installed. Heuristic, not a guarantee — review flagged items before proceeding.", -1)),
                o(i).scan.value.status === "idle" ? (a(), u("div", Ju, [
                  m(o($), {
                    icon: "tabler:shield-question",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  d[50] || (d[50] = r("span", { class: "km-grow" }, "Security scan not run. Running the reviewer may spend LLM tokens.", -1)),
                  m(o(ce), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    onClick: d[8] || (d[8] = (f) => o(i).skipScan())
                  }, {
                    default: oe(() => [
                      m(o($), {
                        icon: "tabler:player-skip-forward",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[48] || (d[48] = A(" Skip scan ", -1))
                    ]),
                    _: 1
                  }),
                  m(o(ce), {
                    size: "small",
                    disabled: !o(i).planCurrent.value,
                    onClick: d[9] || (d[9] = (f) => o(i).runScanNow())
                  }, {
                    default: oe(() => [
                      m(o($), {
                        icon: "tabler:shield-check",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[49] || (d[49] = A(" Run scan ", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : o(i).scan.value.status === "skipped" ? (a(), u("div", Qu, [
                  m(o($), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  d[52] || (d[52] = A(" Security scan skipped. Install can continue without spending reviewer tokens. ", -1)),
                  m(o(ce), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    class: "km-mt",
                    disabled: !o(i).planCurrent.value,
                    onClick: d[10] || (d[10] = (f) => o(i).runScanNow())
                  }, {
                    default: oe(() => [
                      m(o($), {
                        icon: "tabler:shield-check",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[51] || (d[51] = A(" Run scan", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : o(i).scan.value.status === "scanning" ? (a(), u("div", ed, [
                  m(o($), {
                    icon: "tabler:loader-2",
                    class: "km-i spin km-accent",
                    "aria-hidden": "true"
                  }),
                  r("span", td, [
                    A("Scanning " + c(o(i).scan.value.total || "") + " module" + c(o(i).scan.value.total === 1 ? "" : "s") + "… ", 1),
                    d[53] || (d[53] = r("span", { class: "km-dim" }, "this can take a moment", -1))
                  ])
                ])) : o(i).scan.value.status === "clean" ? (a(), u("div", nd, [
                  m(o($), {
                    icon: "tabler:shield-check-filled",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  r("p", null, "No issues found across " + c(o(i).scan.value.scanned) + " module" + c(o(i).scan.value.scanned === 1 ? "" : "s") + ".", 1)
                ])) : o(i).scan.value.status === "error" ? (a(), u("div", od, [
                  A(" Scan failed: " + c(o(i).scan.value.error) + " ", 1),
                  m(o(ce), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    class: "km-mt",
                    disabled: !o(i).planCurrent.value,
                    onClick: d[11] || (d[11] = (f) => o(i).runScanNow())
                  }, {
                    default: oe(() => [
                      m(o($), {
                        icon: "tabler:refresh",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[54] || (d[54] = A(" Retry", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : o(i).scan.value.status === "unavailable" ? (a(), u("div", id, [
                  m(o($), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  d[56] || (d[56] = A(" Security scan unavailable ", -1)),
                  m(o(ce), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    class: "km-mt",
                    disabled: !o(i).planCurrent.value,
                    onClick: d[12] || (d[12] = (f) => o(i).runScanNow())
                  }, {
                    default: oe(() => [
                      m(o($), {
                        icon: "tabler:refresh",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[55] || (d[55] = A(" Retry", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : (a(), u(J, { key: 6 }, [
                  o(i).scan.value.summary ? (a(), u("p", sd, c(o(i).scan.value.summary), 1)) : h("", !0),
                  o(i).scan.value.status === "critical" ? (a(), u("div", ad, [
                    m(o($), {
                      icon: "tabler:shield-x",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    d[57] || (d[57] = A(" Critical findings must be reviewed and confirmed before install.", -1))
                  ])) : h("", !0),
                  (a(!0), u(J, null, re(o(i).scan.value.modules, (f) => (a(), u("div", {
                    key: f.module,
                    class: "km-scan-mod"
                  }, [
                    r("div", ld, [
                      r("span", {
                        class: ae(["km-dot", L(f.status)]),
                        "aria-hidden": "true"
                      }, null, 2),
                      r("span", rd, [
                        A(c(f.module), 1),
                        f.version ? (a(), u(J, { key: 0 }, [
                          A("@" + c(f.version), 1)
                        ], 64)) : h("", !0)
                      ]),
                      d[58] || (d[58] = r("span", { class: "km-grow" }, null, -1)),
                      r("span", ud, c(f.status), 1)
                    ]),
                    f.summary ? (a(), u("p", dd, c(f.summary), 1)) : h("", !0),
                    (a(!0), u(J, null, re(f.findings, (k) => (a(), u("div", {
                      key: k.id,
                      class: ae(["km-finding", `km-sev-${U(k)}`])
                    }, [
                      m(o($), {
                        icon: o(Fo)[k.severity].icon,
                        class: "km-i km-finding-icon",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      r("div", cd, [
                        r("div", pd, [
                          r("span", fd, c(k.title), 1)
                        ]),
                        k.detail ? (a(), u("div", md, c(k.detail), 1)) : h("", !0),
                        k.location ? (a(), u("div", hd, c(k.location), 1)) : h("", !0),
                        k.severity !== "critical" ? (a(), u("button", {
                          key: 2,
                          class: ae(["km-ack", { done: o(i).acknowledged.value.has(k.id) }]),
                          onClick: (O) => o(i).acknowledge(k)
                        }, [
                          m(o($), {
                            icon: o(i).acknowledged.value.has(k.id) ? "tabler:check" : "tabler:eye",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }, null, 8, ["icon"]),
                          A(" " + c(o(i).acknowledged.value.has(k.id) ? "Acknowledged" : "Acknowledge"), 1)
                        ], 10, bd)) : h("", !0)
                      ])
                    ], 2))), 128)),
                    f.findings.length ? h("", !0) : (a(), u("p", vd, "No issues in this module."))
                  ]))), 128)),
                  o(i).scan.value.status === "critical" ? (a(), u("label", gd, [
                    Be(r("input", {
                      type: "checkbox",
                      "onUpdate:modelValue": d[13] || (d[13] = (f) => o(i).criticalConfirmed.value = f)
                    }, null, 512), [
                      [Di, o(i).criticalConfirmed.value]
                    ]),
                    d[59] || (d[59] = r("span", null, "I understand the critical findings and want to install anyway.", -1))
                  ])) : h("", !0)
                ], 64))
              ], 512), [
                [un, o(i).activeSection.value === "scan"]
              ]),
              Be(r("section", yd, [
                r("div", kd, [
                  m(o($), {
                    icon: "tabler:checklist",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  d[61] || (d[61] = A(" Review & install", -1))
                ]),
                r("div", wd, [
                  r("div", Sd, [
                    m(o($), {
                      icon: "tabler:package",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    r("b", null, c(o(i).moduleCount.value), 1),
                    d[62] || (d[62] = r("span", null, "modules", -1))
                  ]),
                  r("div", $d, [
                    m(o($), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    r("b", null, c(o(i).boundRequirementCount.value) + "/" + c(o(i).requirements.value.length), 1),
                    d[63] || (d[63] = r("span", null, "configured", -1))
                  ]),
                  r("div", Cd, [
                    m(o($), {
                      icon: "tabler:database",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    r("b", null, c(o(i).migrations.value.length), 1),
                    d[64] || (d[64] = r("span", null, "migrations", -1))
                  ]),
                  r("div", Id, [
                    m(o($), {
                      icon: o(i).scan.value.status === "clean" ? "tabler:shield-check" : o(i).scan.value.status === "critical" ? "tabler:shield-x" : o(i).scan.value.status === "skipped" ? "tabler:shield-off" : "tabler:shield",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    r("b", null, c(o(i).scan.value.status === "scanning" ? "…" : o(i).scan.value.status === "skipped" || o(i).scan.value.status === "idle" ? "—" : o(i).scan.value.findings.length), 1),
                    d[65] || (d[65] = r("span", null, "scan findings", -1))
                  ])
                ]),
                r("div", _d, [
                  d[68] || (d[68] = r("label", { class: "km-label" }, "Migration policy", -1)),
                  m(Po, {
                    modelValue: o(i).migrationPolicy.value,
                    "onUpdate:modelValue": d[14] || (d[14] = (f) => o(i).migrationPolicy.value = f),
                    items: o(i).migrationOptions.value.map((f) => ({ id: f.value, title: f.label })),
                    "aria-label": "Migration policy"
                  }, null, 8, ["modelValue", "items"]),
                  o(i).requiredSetup.value ? (a(), u("p", xd, "This module requires setup. Installation completes after migrations and setup pass verification.")) : h("", !0),
                  o(i).migrations.value.length ? (a(), u("div", Od, [
                    (a(!0), u(J, null, re(o(i).migrations.value, (f) => (a(), u("div", {
                      key: f.id,
                      class: "km-mig-row"
                    }, [
                      m(o($), {
                        icon: "tabler:database-import",
                        class: "km-i-xs km-dim",
                        "aria-hidden": "true"
                      }),
                      r("span", Ld, c(f.id), 1),
                      d[66] || (d[66] = r("span", { class: "km-grow" }, null, -1)),
                      r("span", zd, c(f.status), 1)
                    ]))), 128))
                  ])) : h("", !0),
                  r("p", Ad, [
                    m(o($), {
                      icon: "tabler:shield-lock",
                      class: "km-i-xs",
                      "aria-hidden": "true"
                    }),
                    d[67] || (d[67] = A(" Changes are transactional — if any step fails, the registry, lock and migrations are rolled back.", -1))
                  ])
                ]),
                r("details", Md, [
                  d[71] || (d[71] = r("summary", null, "Advanced", -1)),
                  r("div", Ed, [
                    r("div", Pd, [
                      d[69] || (d[69] = r("span", null, "Installs as", -1)),
                      r("b", Fd, c(o(i).destinationId.value || "—"), 1)
                    ]),
                    r("div", Td, [
                      d[70] || (d[70] = r("span", null, "Version", -1)),
                      r("b", Vd, c(o(i).versionMode.value === "pin" ? o(i).version.value || "latest" : "≥ " + (o(i).version.value || "0.0.0")), 1)
                    ])
                  ])
                ]),
                o(i).result.value ? (a(), u("div", Dd, [
                  r("div", Rd, c(o(i).result.value.dry_run ? "Dry-run preview" : "Applied"), 1),
                  o(i).result.value.dry_run ? (a(), u(J, { key: 0 }, [
                    d[72] || (d[72] = r("div", { class: "km-dim" }, "No changes were applied.", -1)),
                    o(i).resultExecution.value.length ? (a(), u("div", Bd, c(o(i).resultExecution.value.length) + " planned step" + c(o(i).resultExecution.value.length === 1 ? "" : "s") + " below.", 1)) : (a(), u("div", Hd, "No install steps are available for this preview."))
                  ], 64)) : (a(), u(J, { key: 1 }, [
                    d[73] || (d[73] = r("div", { class: "km-dim" }, "Changes applied successfully.", -1)),
                    o(i).result.value.apply?.message ? (a(), u("div", Ud, c(o(i).result.value.apply.message), 1)) : h("", !0)
                  ], 64))
                ])) : h("", !0),
                o(i).resultExecution.value.length ? (a(), u("div", jd, [
                  d[74] || (d[74] = r("div", { class: "km-panel-title" }, "Install steps", -1)),
                  (a(!0), u(J, null, re(o(i).resultExecution.value, (f, k) => (a(), u("div", {
                    key: `${f.step}-${k}`,
                    class: ae(["km-ledger-row", N(f.status)])
                  }, [
                    r("span", Nd, c(k + 1), 1),
                    r("span", Kd, c(o(i).executionStepLabel(f)), 1),
                    r("span", qd, c(f.status), 1),
                    f.message ? (a(), u("span", Gd, c(f.message), 1)) : h("", !0)
                  ], 2))), 128))
                ])) : h("", !0),
                o(i).resultError.value ? (a(), u("div", Wd, [
                  o(i).resultCode.value ? (a(), u("span", Zd, c(o(i).resultCode.value), 1)) : h("", !0),
                  A(c(o(i).resultError.value), 1)
                ])) : h("", !0)
              ], 512), [
                [un, o(i).activeSection.value === "review"]
              ])
            ], 512)
          ])
        ]),
        _: 1
      }, 8, ["visible", "busy", "label", "style"]);
    };
  }
}), tc = { class: "d-hero" }, nc = { class: "d-hero-icon" }, oc = { class: "km-grow km-min0" }, ic = { class: "km-row-wrap" }, sc = { class: "d-hero-name" }, ac = { class: "d-ver" }, lc = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, rc = {
  key: 1,
  class: "badge-installed kx-tag-caps"
}, uc = {
  key: 2,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, dc = {
  key: 3,
  class: "badge-warn kx-tag-caps"
}, cc = { class: "d-hero-org" }, pc = {
  key: 0,
  class: "d-hero-desc"
}, fc = { class: "d-hero-actions" }, mc = ["href"], hc = ["href"], bc = { class: "d-grid" }, vc = { class: "d-side" }, gc = { class: "d-block" }, yc = { class: "d-row" }, kc = { class: "d-row-v" }, wc = {
  key: 0,
  class: "d-row"
}, Sc = { class: "d-row-v" }, $c = {
  key: 1,
  class: "d-row"
}, Cc = ["title"], Ic = {
  key: 2,
  class: "d-row"
}, _c = { class: "d-row-v" }, xc = {
  key: 3,
  class: "d-row"
}, Oc = {
  key: 4,
  class: "d-row"
}, Lc = { class: "d-row-v" }, zc = {
  key: 5,
  class: "d-row"
}, Ac = { class: "d-row-v" }, Mc = {
  key: 6,
  class: "d-row"
}, Ec = { class: "d-row-v" }, Pc = {
  key: 0,
  class: "d-block"
}, Fc = { class: "km-pills" }, Tc = {
  key: 1,
  class: "d-block"
}, Vc = { class: "km-dep-list" }, Dc = { class: "km-trunc" }, Rc = { class: "km-dim" }, Bc = {
  key: 2,
  class: "d-block"
}, Hc = { class: "km-pills" }, Uc = { class: "d-main" }, jc = { class: "d-tabs" }, Nc = ["disabled"], Kc = {
  key: 0,
  class: "km-dim"
}, qc = { class: "d-tab-body" }, Gc = {
  key: 0,
  class: "km-loading"
}, Wc = {
  key: 0,
  class: "d-empty"
}, Zc = {
  key: 1,
  class: "rm"
}, Yc = {
  key: 2,
  class: "km-stack-lg"
}, Xc = { key: 0 }, Jc = { class: "d-block-title d-accent" }, Qc = { class: "km-dim" }, ep = { class: "km-2col" }, tp = { class: "d-field-i" }, np = { class: "km-grow km-min0" }, op = { class: "d-cfg-name" }, ip = {
  key: 0,
  class: "d-cfg-desc"
}, sp = { key: 1 }, ap = { class: "d-block-title" }, lp = { class: "km-2col" }, rp = { class: "d-field-i d-field-i-req" }, up = { class: "km-grow km-min0" }, dp = { class: "d-cfg-name" }, cp = {
  key: 0,
  class: "d-cfg-desc"
}, pp = { class: "d-field-i d-field-i-req" }, fp = { class: "km-grow km-min0" }, mp = { class: "d-cfg-name" }, hp = {
  key: 0,
  class: "d-cfg-desc"
}, bp = {
  key: 1,
  class: "d-cfg-desc km-mono"
}, vp = { class: "d-block-title" }, gp = { key: 0 }, yp = { class: "d-sub" }, kp = { class: "km-pills" }, wp = {
  key: 1,
  class: "km-muted"
}, Sp = {
  key: 1,
  class: "km-muted"
}, $p = {
  key: 2,
  class: "km-stack"
}, Cp = { class: "km-group-head" }, Ip = { class: "km-dim" }, _p = { class: "km-2col" }, xp = { class: "d-entry-name" }, Op = { class: "d-entry-id" }, Lp = {
  key: 0,
  class: "km-muted"
}, zp = {
  key: 1,
  class: "d-vers"
}, Ap = { class: "d-ver-tag" }, Mp = {
  key: 0,
  class: "km-dim"
}, Ep = {
  key: 1,
  class: "km-dim km-inline"
}, Pp = {
  key: 2,
  class: "km-dim"
}, Fp = /* @__PURE__ */ on({
  __name: "ModuleDetailView",
  props: {
    page: {}
  },
  setup(e) {
    const t = e, {
      selectedModule: n,
      selectedIsPrivate: s,
      selectedCanUpdate: i,
      selectedUpdateDisabledReason: l,
      selectedCanUninstall: p,
      selectedUninstallBlockedReason: b,
      detailUpdate: v,
      detailUninstall: y,
      detailInstall: w,
      closeDetail: C,
      versionMeta: M,
      detailTab: E,
      detailReadme: F,
      detailLoading: U,
      detailVersions: L,
      envVars: j,
      requirements: N,
      entryIcon: P,
      entryName: z,
      entryDesc: d,
      detailGroups: ee
    } = t.page, f = q(() => t.page.selected.value);
    return (k, O) => {
      const ue = Ae("wc-render-markdown");
      return a(), u("div", {
        class: "d-page",
        style: Kt({ "--accent": o(n) ? o(bn)(o(n)) : "var(--p-primary-color)" })
      }, [
        r("button", {
          class: "d-back",
          onClick: O[0] || (O[0] = //@ts-ignore
          (...R) => o(C) && o(C)(...R))
        }, [
          m(o($), {
            icon: "tabler:arrow-left",
            class: "km-i-sm",
            "aria-hidden": "true"
          }),
          O[4] || (O[4] = A(" Back to modules ", -1))
        ]),
        r("header", tc, [
          r("div", nc, [
            m(o($), {
              icon: o(n) ? o(nn)(o(n)) : "tabler:package",
              class: "km-i-lg",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          r("div", oc, [
            r("div", ic, [
              r("h2", sc, c(f.value.label), 1),
              r("span", ac, c(f.value.version || "—"), 1),
              o(cn)(o(n)) ? (a(), u("span", lc, "app")) : h("", !0),
              f.value.installed ? (a(), u("span", rc, "installed")) : h("", !0),
              o(s) ? (a(), u("span", uc, [
                m(o($), {
                  icon: "tabler:lock",
                  class: "km-i-xs",
                  "aria-hidden": "true"
                }),
                O[5] || (O[5] = A(" private", -1))
              ])) : h("", !0),
              o(n)?.deprecated ? (a(), u("span", dc, "deprecated")) : h("", !0)
            ]),
            r("div", cc, c(f.value.component), 1),
            f.value.description ? (a(), u("p", pc, c(f.value.description), 1)) : h("", !0),
            r("div", fc, [
              f.value.installed ? (a(), u(J, { key: 0 }, [
                o(i) ? (a(), be(o(ce), {
                  key: 0,
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  onClick: o(v)
                }, {
                  default: oe(() => [
                    m(o($), {
                      icon: "tabler:refresh-dot",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    O[6] || (O[6] = A(" Update ", -1))
                  ]),
                  _: 1
                }, 8, ["onClick"])) : (a(), be(o(ce), {
                  key: 1,
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  disabled: "",
                  title: o(l) || void 0
                }, {
                  default: oe(() => [
                    m(o($), {
                      icon: "tabler:refresh-off",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    O[7] || (O[7] = A(" Update ", -1))
                  ]),
                  _: 1
                }, 8, ["title"])),
                o(p) ? (a(), be(o(ce), {
                  key: 2,
                  size: "small",
                  severity: "danger",
                  text: "",
                  onClick: o(y)
                }, {
                  default: oe(() => [
                    m(o($), {
                      icon: "tabler:trash",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    O[8] || (O[8] = A(" Uninstall ", -1))
                  ]),
                  _: 1
                }, 8, ["onClick"])) : o(b) ? (a(), be(o(ce), {
                  key: 3,
                  size: "small",
                  severity: "danger",
                  text: "",
                  disabled: "",
                  title: o(b)
                }, {
                  default: oe(() => [
                    m(o($), {
                      icon: "tabler:trash-off",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    O[9] || (O[9] = A(" Uninstall ", -1))
                  ]),
                  _: 1
                }, 8, ["title"])) : h("", !0)
              ], 64)) : (a(), be(o(ce), {
                key: 1,
                size: "small",
                onClick: o(w)
              }, {
                default: oe(() => [
                  m(o($), {
                    icon: "tabler:download",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  O[10] || (O[10] = A(" Install ", -1))
                ]),
                _: 1
              }, 8, ["onClick"])),
              o(n)?.repository ? (a(), u("a", {
                key: 2,
                href: String(o(n).repository),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                m(o($), {
                  icon: "tabler:brand-github",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                O[11] || (O[11] = A(" Repository", -1))
              ], 8, mc)) : h("", !0),
              o(n)?.homepage ? (a(), u("a", {
                key: 3,
                href: String(o(n).homepage),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                m(o($), {
                  icon: "tabler:home",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                O[12] || (O[12] = A(" Homepage", -1))
              ], 8, hc)) : h("", !0)
            ])
          ])
        ]),
        r("div", bc, [
          r("aside", vc, [
            r("section", gc, [
              r("div", yc, [
                m(o($), {
                  icon: "tabler:download",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[13] || (O[13] = r("span", { class: "d-row-k" }, "Downloads", -1)),
                r("span", kc, c(o(vn)(o(n)?.total_downloads)), 1)
              ]),
              o(n)?.favorites_count ? (a(), u("div", wc, [
                m(o($), {
                  icon: "tabler:star",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[14] || (O[14] = r("span", { class: "d-row-k" }, "Favorites", -1)),
                r("span", Sc, c(o(n).favorites_count), 1)
              ])) : h("", !0),
              o(n)?.license ? (a(), u("div", $c, [
                m(o($), {
                  icon: "tabler:license",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[15] || (O[15] = r("span", { class: "d-row-k" }, "License", -1)),
                r("span", {
                  class: "d-row-v",
                  title: o(n).license
                }, c(o(Vn)(o(n).license)), 9, Cc)
              ])) : h("", !0),
              o(n)?.type ? (a(), u("div", Ic, [
                m(o($), {
                  icon: "tabler:category",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[16] || (O[16] = r("span", { class: "d-row-k" }, "Type", -1)),
                r("span", _c, c(o(n).type), 1)
              ])) : h("", !0),
              o(s) ? (a(), u("div", xc, [
                m(o($), {
                  icon: "tabler:lock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[17] || (O[17] = r("span", { class: "d-row-k" }, "Visibility", -1)),
                O[18] || (O[18] = r("span", { class: "d-row-v" }, "Private", -1))
              ])) : h("", !0),
              o(n)?.update_time ? (a(), u("div", Oc, [
                m(o($), {
                  icon: "tabler:clock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[19] || (O[19] = r("span", { class: "d-row-k" }, "Updated", -1)),
                r("span", Lc, c(o(Dn)(o(n).update_time, { maxUnit: "year" })), 1)
              ])) : h("", !0),
              o(M)?.entry_count ? (a(), u("div", zc, [
                m(o($), {
                  icon: "tabler:list-numbers",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[20] || (O[20] = r("span", { class: "d-row-k" }, "Entries", -1)),
                r("span", Ac, c(o(M).entry_count), 1)
              ])) : h("", !0),
              o(M)?.size_bytes ? (a(), u("div", Mc, [
                m(o($), {
                  icon: "tabler:weight",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[21] || (O[21] = r("span", { class: "d-row-k" }, "Size", -1)),
                r("span", Ec, c(o(pn)(o(M).size_bytes)), 1)
              ])) : h("", !0)
            ]),
            (o(n)?.keywords || []).length ? (a(), u("section", Pc, [
              O[22] || (O[22] = r("div", { class: "d-block-title" }, "Keywords", -1)),
              r("div", Fc, [
                (a(!0), u(J, null, re(o(n).keywords, (R) => (a(), u("span", {
                  key: R,
                  class: "provides-pill"
                }, c(R), 1))), 128))
              ])
            ])) : h("", !0),
            (o(M)?.dependencies || []).length ? (a(), u("section", Tc, [
              O[23] || (O[23] = r("div", { class: "d-block-title" }, "Dependencies", -1)),
              r("div", Vc, [
                (a(!0), u(J, null, re(o(M).dependencies, (R, Q) => (a(), u("div", {
                  key: Q,
                  class: "km-dep"
                }, [
                  r("span", Dc, c(R.org) + "/" + c(R.name), 1),
                  r("span", Rc, c(R.version_constraint), 1)
                ]))), 128))
              ])
            ])) : h("", !0),
            (o(M)?.lua_modules || []).length ? (a(), u("section", Bc, [
              O[24] || (O[24] = r("div", { class: "d-block-title" }, "Lua modules", -1)),
              r("div", Hc, [
                (a(!0), u(J, null, re(o(M).lua_modules, (R) => (a(), u("span", {
                  key: R,
                  class: "provides-pill"
                }, c(R), 1))), 128))
              ])
            ])) : h("", !0)
          ]),
          r("main", Uc, [
            r("div", jc, [
              r("button", {
                class: ae(["d-tab", { active: o(E) === "readme" }]),
                disabled: !o(F) && !o(U),
                onClick: O[1] || (O[1] = (R) => E.value = "readme")
              }, "Readme", 10, Nc),
              r("button", {
                class: ae(["d-tab", { active: o(E) === "overview" }]),
                onClick: O[2] || (O[2] = (R) => E.value = "overview")
              }, "Overview", 2),
              r("button", {
                class: ae(["d-tab", { active: o(E) === "versions" }]),
                onClick: O[3] || (O[3] = (R) => E.value = "versions")
              }, [
                O[25] || (O[25] = A("Versions ", -1)),
                o(L).length ? (a(), u("span", Kc, c(o(L).length), 1)) : h("", !0)
              ], 2)
            ]),
            r("div", qc, [
              o(U) ? (a(), u("div", Gc, [
                m(o($), {
                  icon: "tabler:loader-2",
                  class: "km-i spin",
                  "aria-hidden": "true"
                }),
                O[26] || (O[26] = A(" Loading… ", -1))
              ])) : o(E) === "readme" ? (a(), u(J, { key: 1 }, [
                o(F) ? (a(), u("article", Zc, [
                  m(ue, { source: o(F) }, null, 8, ["source"])
                ])) : (a(), u("div", Wc, [
                  m(o($), {
                    icon: "tabler:file-off",
                    class: "km-i-xl km-dim",
                    "aria-hidden": "true"
                  }),
                  O[27] || (O[27] = r("p", { class: "km-mt" }, "No README provided.", -1))
                ]))
              ], 64)) : o(E) === "overview" ? (a(), u("div", Yc, [
                o(j).length ? (a(), u("section", Xc, [
                  r("div", Jc, [
                    m(o($), {
                      icon: "tabler:settings-2",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    O[28] || (O[28] = A(" Environment ", -1)),
                    r("span", Qc, c(o(j).length), 1)
                  ]),
                  O[29] || (O[29] = r("p", { class: "d-sub" }, "Variables this module reads — set them in your environment.", -1)),
                  r("div", ep, [
                    (a(!0), u(J, null, re(o(j), (R) => (a(), u("div", {
                      key: R.id,
                      class: "d-field d-field-env"
                    }, [
                      r("span", tp, [
                        m(o($), {
                          icon: o(P)(R, "tabler:variable"),
                          class: "km-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"])
                      ]),
                      r("span", np, [
                        r("span", op, c(o(z)(R)), 1),
                        o(d)(R) ? (a(), u("span", ip, c(o(d)(R)), 1)) : h("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : h("", !0),
                o(N).length || (o(M)?.requirements || []).length ? (a(), u("section", sp, [
                  r("div", ap, [
                    m(o($), {
                      icon: "tabler:plug-connected",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    O[30] || (O[30] = A(" Requires", -1))
                  ]),
                  O[31] || (O[31] = r("p", { class: "d-sub" }, "Host resources this module is wired to at install.", -1)),
                  r("div", lp, [
                    o(N).length ? (a(!0), u(J, { key: 0 }, re(o(N), (R) => (a(), u("div", {
                      key: R.id,
                      class: "d-field d-field-req"
                    }, [
                      r("span", rp, [
                        m(o($), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      r("span", up, [
                        r("span", dp, c(o(z)(R)), 1),
                        o(d)(R) ? (a(), u("span", cp, c(o(d)(R)), 1)) : h("", !0)
                      ])
                    ]))), 128)) : (a(!0), u(J, { key: 1 }, re(o(M).requirements, (R, Q) => (a(), u("div", {
                      key: Q,
                      class: "d-field d-field-req"
                    }, [
                      r("span", pp, [
                        m(o($), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      r("span", fp, [
                        r("span", mp, c(R.name), 1),
                        R.description ? (a(), u("span", hp, c(R.description), 1)) : h("", !0),
                        R.default ? (a(), u("span", bp, "default: " + c(R.default), 1)) : h("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : h("", !0),
                r("section", null, [
                  r("div", vp, [
                    m(o($), {
                      icon: "tabler:package",
                      class: "km-i-sm d-accent-i",
                      "aria-hidden": "true"
                    }),
                    O[32] || (O[32] = A(" Provides", -1))
                  ]),
                  f.value.installed ? o(ee).length ? (a(), u("div", $p, [
                    (a(!0), u(J, null, re(o(ee), (R) => (a(), u("div", {
                      key: R.key
                    }, [
                      r("div", Cp, [
                        m(o($), {
                          icon: R.icon,
                          class: "km-i-sm d-accent-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        A(" " + c(R.label) + " ", 1),
                        r("span", Ip, c(R.items.length), 1)
                      ]),
                      r("div", _p, [
                        (a(!0), u(J, null, re(R.items, (Q) => (a(), u("div", {
                          key: Q.id,
                          class: "d-entry"
                        }, [
                          r("div", xp, c(Q.meta && Q.meta.title || o(z)(Q)), 1),
                          r("div", Op, c(Q.id), 1)
                        ]))), 128))
                      ])
                    ]))), 128))
                  ])) : (a(), u("p", Sp, "No registry entries.")) : (a(), u("div", gp, [
                    (o(M)?.entry_kinds || []).length ? (a(), u(J, { key: 0 }, [
                      r("p", yp, "Publishes " + c(o(M).entry_count || o(M).entry_kinds.length) + " entries; per-entry detail resolves after install.", 1),
                      r("div", kp, [
                        (a(!0), u(J, null, re(o(M).entry_kinds, (R) => (a(), u("span", {
                          key: R,
                          class: "provides-pill"
                        }, c(R), 1))), 128))
                      ])
                    ], 64)) : (a(), u("p", wp, [...O[33] || (O[33] = [
                      A("See the ", -1),
                      r("strong", null, "Readme", -1),
                      A(" tab for details.", -1)
                    ])]))
                  ]))
                ])
              ])) : (a(), u(J, { key: 3 }, [
                o(L).length ? (a(), u("div", zp, [
                  (a(!0), u(J, null, re(o(L), (R) => (a(), u("div", {
                    key: R.version,
                    class: "d-ver-row"
                  }, [
                    r("span", Ap, c(R.version), 1),
                    R.create_time ? (a(), u("span", Mp, c(o(Dn)(R.create_time, { maxUnit: "year" })), 1)) : h("", !0),
                    O[34] || (O[34] = r("span", { class: "km-grow" }, null, -1)),
                    R.download_count ? (a(), u("span", Ep, [
                      m(o($), {
                        icon: "tabler:download",
                        class: "km-i-xs",
                        "aria-hidden": "true"
                      }),
                      A(" " + c(o(vn)(R.download_count)), 1)
                    ])) : h("", !0),
                    R.size_bytes ? (a(), u("span", Pp, c(o(pn)(R.size_bytes)), 1)) : h("", !0)
                  ]))), 128))
                ])) : (a(), u("p", Lp, "No published versions."))
              ], 64))
            ])
          ])
        ])
      ], 4);
    };
  }
}), Tp = { class: "km" }, Vp = {
  key: 1,
  class: "km-loading km-center km-initial-loading",
  role: "status",
  "aria-live": "polite"
}, Dp = {
  key: 2,
  class: "km-denied"
}, Rp = { class: "km-denied-box" }, Bp = {
  key: 3,
  class: "km-scroll"
}, Hp = {
  key: 1,
  class: "km-list"
}, Up = { class: "km-sec-bar km-sec-bar-toolbar" }, jp = { class: "km-controls" }, Np = {
  key: 0,
  class: "km-btn-count"
}, Kp = { class: "km-hub-auth-panel" }, qp = { class: "km-hub-auth-row" }, Gp = {
  key: 0,
  class: "km-hub-auth-meta"
}, Wp = {
  key: 1,
  class: "km-hub-auth-meta"
}, Zp = {
  key: 2,
  class: "km-hub-auth-orgs"
}, Yp = { class: "km-hub-auth-org-name" }, Xp = {
  key: 0,
  class: "km-hub-auth-org-role"
}, Jp = { class: "km-hub-auth-hint" }, Qp = ["href"], ef = { class: "km-hub-auth-actions" }, tf = {
  key: 0,
  class: "km-msg km-msg-err"
}, nf = {
  key: 1,
  class: "km-msg"
}, of = {
  key: 2,
  class: "km-msg km-msg-err"
}, sf = {
  key: 3,
  class: "km-loading km-center"
}, af = { key: 0 }, lf = { class: "hub-section-head" }, rf = { class: "feat-grid" }, uf = ["onClick"], df = { class: "feat-icon" }, cf = { class: "feat-body" }, pf = { class: "km-row-wrap" }, ff = { class: "feat-name" }, mf = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, hf = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, bf = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, vf = { class: "feat-org" }, gf = {
  key: 0,
  class: "feat-desc"
}, yf = { class: "feat-meta" }, kf = { class: "meta-pill" }, wf = { class: "meta-pill" }, Sf = ["title"], $f = { class: "hub-section-head" }, Cf = { class: "hub-section-title" }, If = { class: "hub-section-sub" }, _f = { class: "mod-grid" }, xf = ["onClick"], Of = { class: "mod-icon" }, Lf = { class: "mod-body" }, zf = { class: "km-row-wrap" }, Af = { class: "mod-name" }, Mf = { class: "mod-version" }, Ef = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Pf = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Ff = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, Tf = { class: "mod-org" }, Vf = {
  key: 0,
  class: "mod-desc"
}, Df = { class: "mod-foot" }, Rf = { class: "foot-stat" }, Bf = {
  key: 0,
  class: "foot-stat"
}, Hf = ["title"], Uf = {
  key: 2,
  class: "foot-stat km-dim km-ml-auto"
}, jf = {
  key: 5,
  class: "km-empty"
}, Nf = { class: "km-muted" }, Kf = { class: "km-mono" }, qf = {
  key: 6,
  class: "km-empty"
}, Gf = {
  key: 7,
  class: "km-empty"
}, Wf = { class: "km-muted" }, Zf = { class: "km-mono" }, Yf = {
  key: 0,
  class: "km-installed"
}, Xf = ["aria-expanded"], Jf = { class: "km-sub" }, Qf = {
  key: 0,
  class: "km-update-count"
}, em = {
  key: 1,
  class: "km-update-count"
}, tm = {
  key: 0,
  class: "km-msg km-msg-err km-mb"
}, nm = {
  key: 1,
  class: "inst-toolbar"
}, om = {
  key: 2,
  class: "inst-list"
}, im = ["onClick"], sm = { class: "inst-icon" }, am = { class: "km-grow km-min0" }, lm = { class: "km-row-tight" }, rm = { class: "inst-name" }, um = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, dm = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, cm = {
  key: 2,
  class: "km-chip"
}, pm = ["title"], fm = { class: "inst-id" }, mm = {
  key: 0,
  class: "km-dim"
}, hm = {
  key: 0,
  class: "inst-update-msg"
}, bm = { class: "inst-ver" }, vm = { class: "inst-migs" }, gm = { class: "inst-actions" }, ym = ["disabled", "aria-label", "onClick"], km = ["disabled", "aria-label", "onClick"], wm = ["title", "aria-label"], Sm = ["aria-label", "onClick"], $m = ["title", "aria-label"], Cm = {
  key: 3,
  class: "km-empty inst-empty"
}, Im = { class: "km-modal-body" }, _m = { class: "km-uninstall-target" }, xm = { class: "km-mono" }, Om = { class: "km-dim" }, Lm = {
  key: 0,
  class: "km-msg km-msg-err"
}, zm = {
  key: 0,
  class: "km-code"
}, Am = {
  key: 1,
  class: "km-mt"
}, Mm = {
  key: 1,
  class: "km-msg km-msg-info"
}, Em = {
  key: 2,
  class: "km-running"
}, Pm = {
  key: 3,
  class: "km-uninstall-preview"
}, Fm = {
  key: 0,
  class: "km-msg"
}, Tm = {
  key: 1,
  class: "km-preview-block"
}, Vm = { class: "km-mono" }, Dm = { class: "km-dim" }, Rm = {
  key: 2,
  class: "km-preview-block"
}, Bm = { class: "km-mono" }, Hm = { class: "km-dim" }, Um = {
  key: 3,
  class: "km-preview-block"
}, jm = { class: "km-mono" }, Nm = { class: "km-dim" }, Km = {
  key: 4,
  class: "km-ledger"
}, qm = { class: "km-ledger-step" }, Gm = { class: "km-grow" }, Wm = { class: "km-chip" }, Zm = {
  key: 0,
  class: "km-ledger-msg"
}, Ym = {
  key: 5,
  class: "km-running"
}, Xm = { class: "km-grow km-running-label" }, Jm = { class: "km-dim" }, Qm = /* @__PURE__ */ on({
  __name: "modules",
  setup(e) {
    const t = Hl(), {
      LABEL: n,
      HUB_PORTAL: s,
      UNINSTALL_MIGRATION_OPTIONS: i,
      initialLoading: l,
      accessDenied: p,
      statusBanner: b,
      hubConnected: v,
      hubStatus: y,
      hubToken: w,
      showTokenPanel: C,
      hubConnecting: M,
      hubError: E,
      hubOrgs: F,
      hubIdentity: U,
      hubTokenStored: L,
      hubTokenExpired: j,
      hubTokenIcon: N,
      hubTokenButtonLabel: P,
      hubExpiry: z,
      saveHubToken: d,
      clearHubToken: ee,
      selected: f,
      selectedModule: k,
      detailReadme: O,
      detailLoading: ue,
      detailTab: R,
      detailVersions: Q,
      envVars: K,
      requirements: ne,
      detailGroups: I,
      versionMeta: V,
      selectedCanUpdate: W,
      selectedUpdateDisabledReason: te,
      selectedCanUninstall: se,
      selectedIsPrivate: ie,
      selectedUninstallBlockedReason: pe,
      entryName: we,
      entryDesc: He,
      entryIcon: Ge,
      openDetail: bt,
      closeDetail: Et,
      detailInstall: Pt,
      detailUpdate: Ie,
      detailUninstall: Wt,
      installed: it,
      installedFilter: We,
      installedKindFilter: vt,
      installedTotal: st,
      updateScanLoading: Ze,
      updateAllRunning: Ue,
      availableUpdates: Ve,
      installedLoading: _e,
      installedError: Ye,
      installedOpen: Xe,
      catalog: Ft,
      catalogLoading: at,
      catalogError: Je,
      catalogInstalledTotal: je,
      visibleCatalogInstalled: Tt,
      browseFilter: S,
      sortBy: _,
      availableItems: D,
      featured: H,
      sortedItems: Y,
      visibleInstalled: X,
      catalogItemFor: me,
      installedAccent: $e,
      installedIcon: lt,
      installedIsRoot: Vt,
      installedIsPrivate: ve,
      installedRole: De,
      installedUsedBy: rt,
      installedCanUpdate: gt,
      installedUpdateDisabledReason: yt,
      installedCanUninstall: ke,
      installedUninstallDisabledReason: Pe,
      installedMigrationSummary: ut,
      updateInfoForDep: Qe,
      updateStatusLabel: sn,
      updateStatusIcon: Dt,
      updateStatusBusy: It,
      scanInstalledUpdates: Re,
      updateInstalledDependency: Ne,
      updateAllAvailable: kt,
      refreshAll: wt,
      installTarget: Ce,
      closeInstallDialog: dt,
      onInstallChanged: an,
      openUpdateDialog: _t,
      uninstallDialogOpen: ct,
      uninstallDep: pt,
      uninstallPolicy: et,
      uninstallRunning: Se,
      uninstallPreviewLoading: tt,
      uninstallPreview: ye,
      uninstallExecution: Zt,
      uninstallCode: xe,
      uninstallError: xt,
      uninstallRequiredBy: Rt,
      uninstallBlockedReason: Ot,
      uninstallActionBlockedReason: Oe,
      uninstallPhase: Bt,
      uninstallElapsedSec: Ht,
      openUninstallDialog: Yt,
      previewUninstall: St,
      executionStepLabel: Xt,
      runUninstall: Lt
    } = t, $t = B(null);
    return (Le, x) => (a(), u("div", Tp, [
      o(b) ? (a(), u("div", {
        key: 0,
        class: ae(["km-banner", o(b).kind === "ok" ? "km-banner-ok" : "km-banner-err"])
      }, c(o(b).message), 3)) : h("", !0),
      o(l) ? (a(), u("div", Vp, [
        m(o($), {
          icon: "tabler:loader-2",
          class: "km-i spin",
          "aria-hidden": "true"
        }),
        x[12] || (x[12] = A(" Loading modules… ", -1))
      ])) : o(p) ? (a(), u("div", Dp, [
        r("div", Rp, [
          m(o($), {
            icon: "tabler:lock",
            class: "km-denied-icon",
            "aria-hidden": "true"
          }),
          x[13] || (x[13] = r("p", { class: "km-denied-title" }, "Admins only", -1)),
          x[14] || (x[14] = r("p", { class: "km-denied-sub" }, "You need admin access to manage modules.", -1))
        ])
      ])) : (a(), u("div", Bp, [
        o(f) ? (a(), be(Fp, {
          key: 0,
          page: o(t)
        }, null, 8, ["page"])) : (a(), u("div", Hp, [
          r("section", null, [
            r("div", Up, [
              r("div", jp, [
                m(o(ce), {
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  disabled: o(_e) || o(at),
                  onClick: o(wt)
                }, {
                  default: oe(() => [
                    m(o($), {
                      icon: o(_e) || o(at) ? "tabler:loader-2" : "tabler:refresh",
                      class: ae(["km-i", (o(_e) || o(at)) && "spin"]),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    x[15] || (x[15] = A(" Refresh ", -1))
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                m(o(ce), {
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  disabled: o(Ze) || o(Ue) || o(_e) || o(st) === 0,
                  onClick: o(Re)
                }, {
                  default: oe(() => [
                    m(o($), {
                      icon: o(Ze) ? "tabler:loader-2" : "tabler:refresh-dot",
                      class: ae(["km-i", o(Ze) && "spin"]),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    x[16] || (x[16] = A(" Scan updates ", -1))
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                m(o(ce), {
                  size: "small",
                  disabled: o(Ue) || o(Ze) || o(Ve).length === 0,
                  onClick: o(kt)
                }, {
                  default: oe(() => [
                    m(o($), {
                      icon: o(Ue) ? "tabler:loader-2" : "tabler:download",
                      class: ae(["km-i", o(Ue) && "spin"]),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    x[17] || (x[17] = A(" Update all ", -1)),
                    o(Ve).length ? (a(), u("span", Np, c(o(Ve).length), 1)) : h("", !0)
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                Be(r("input", {
                  "onUpdate:modelValue": x[0] || (x[0] = (g) => zt(S) ? S.value = g : null),
                  class: "km-input km-filter",
                  placeholder: "Filter…"
                }, null, 512), [
                  [On, o(S)]
                ]),
                m(o(zn), {
                  modelValue: o(_),
                  "onUpdate:modelValue": x[1] || (x[1] = (g) => zt(_) ? _.value = g : null),
                  class: "km-sort",
                  options: [
                    { label: "Top downloads", value: "downloads" },
                    { label: "Name A→Z", value: "name" },
                    { label: "Recently updated", value: "recent" }
                  ],
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Sort modules"
                }, null, 8, ["modelValue"]),
                r("div", {
                  ref_key: "anchorEl",
                  ref: $t,
                  class: "km-hub-auth"
                }, [
                  m(o(ce), {
                    size: "small",
                    severity: o(v) ? "secondary" : o(j) ? "warn" : void 0,
                    outlined: o(v) || o(j),
                    disabled: o(M),
                    onClick: x[2] || (x[2] = (g) => C.value = !o(C))
                  }, {
                    default: oe(() => [
                      m(o($), {
                        icon: o(N),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      A(" " + c(o(P)) + " ", 1),
                      m(o($), {
                        icon: "tabler:chevron-down",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      })
                    ]),
                    _: 1
                  }, 8, ["severity", "outlined", "disabled"]),
                  m(di, {
                    open: o(C),
                    "onUpdate:open": x[5] || (x[5] = (g) => zt(C) ? C.value = g : null),
                    anchor: $t.value,
                    align: "right",
                    width: 300
                  }, {
                    default: oe(() => [
                      r("div", Kp, [
                        x[21] || (x[21] = r("div", { class: "km-hub-auth-title" }, "Wippy Hub token", -1)),
                        o(L) ? (a(), u("div", {
                          key: 0,
                          class: ae(["km-hub-auth-active", o(j) && "is-expired"])
                        }, [
                          r("div", qp, [
                            m(o($), {
                              icon: o(j) ? "tabler:alert-triangle" : "tabler:circle-check-filled",
                              class: ae(["km-i-sm", o(j) ? "km-hub-warn" : "km-hub-ok"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            r("span", null, [
                              A(c(o(j) ? "Token expired" : "Token active"), 1),
                              o(U) ? (a(), u(J, { key: 0 }, [
                                x[18] || (x[18] = A(" — ", -1)),
                                r("strong", null, c(o(U)), 1)
                              ], 64)) : h("", !0)
                            ])
                          ]),
                          o(y)?.registry ? (a(), u("div", Gp, c(o(y).registry), 1)) : h("", !0),
                          o(z) ? (a(), u("div", Wp, "Expires " + c(o(z)), 1)) : h("", !0),
                          o(F).length ? (a(), u("div", Zp, [
                            x[19] || (x[19] = r("div", { class: "km-hub-auth-orgs-label" }, "Organizations", -1)),
                            (a(!0), u(J, null, re(o(F), (g) => (a(), u("div", {
                              key: g.id || g.name,
                              class: "km-hub-auth-org"
                            }, [
                              m(o($), {
                                icon: "tabler:building",
                                class: "km-i-sm",
                                "aria-hidden": "true"
                              }),
                              r("span", Yp, c(g.display_name || g.name), 1),
                              g.role ? (a(), u("span", Xp, c(g.role), 1)) : h("", !0)
                            ]))), 128))
                          ])) : h("", !0)
                        ], 2)) : h("", !0),
                        r("p", Jp, [
                          A(c(o(L) ? "Replace the token, or" : "Paste a Hub registry token to browse and install private modules.") + " ", 1),
                          o(L) ? (a(), u(J, { key: 0 }, [
                            A("create a new one")
                          ], 64)) : h("", !0),
                          r("a", {
                            href: o(s),
                            target: "_blank",
                            rel: "noopener"
                          }, c(o(L) ? "↗" : "Create one →"), 9, Qp)
                        ]),
                        Be(r("input", {
                          "onUpdate:modelValue": x[3] || (x[3] = (g) => zt(w) ? w.value = g : null),
                          type: "password",
                          class: "km-input km-hub-auth-input",
                          placeholder: "wpy_…",
                          autocomplete: "off",
                          onKeyup: x[4] || (x[4] = Ri(
                            //@ts-ignore
                            (...g) => o(d) && o(d)(...g),
                            ["enter"]
                          ))
                        }, null, 544), [
                          [On, o(w)]
                        ]),
                        r("div", ef, [
                          m(o(ce), {
                            size: "small",
                            disabled: o(M),
                            onClick: o(d)
                          }, {
                            default: oe(() => [
                              m(o($), {
                                icon: o(M) ? "tabler:loader-2" : "tabler:device-floppy",
                                class: ae(["km-i", o(M) && "spin"]),
                                "aria-hidden": "true"
                              }, null, 8, ["icon", "class"]),
                              A(" " + c(o(M) ? "Saving…" : o(L) ? "Replace token" : "Save token"), 1)
                            ]),
                            _: 1
                          }, 8, ["disabled", "onClick"]),
                          o(L) ? (a(), be(o(ce), {
                            key: 0,
                            size: "small",
                            severity: "secondary",
                            outlined: "",
                            onClick: o(ee)
                          }, {
                            default: oe(() => [
                              m(o($), {
                                icon: "tabler:trash",
                                class: "km-i",
                                "aria-hidden": "true"
                              }),
                              x[20] || (x[20] = A(" Clear ", -1))
                            ]),
                            _: 1
                          }, 8, ["onClick"])) : h("", !0)
                        ])
                      ])
                    ]),
                    _: 1
                  }, 8, ["open", "anchor"])
                ], 512)
              ])
            ]),
            o(E) ? (a(), u("div", tf, c(o(E)), 1)) : h("", !0),
            !o(v) && o(j) ? (a(), u("div", nf, "Your Wippy Hub token is expired.")) : h("", !0),
            o(Je) ? (a(), u("div", of, c(o(Je)), 1)) : h("", !0),
            o(at) || o(_e) ? (a(), u("div", sf, [
              m(o($), {
                icon: "tabler:loader-2",
                class: "km-i spin",
                "aria-hidden": "true"
              }),
              x[22] || (x[22] = A(" Loading modules… ", -1))
            ])) : o(D).length > 0 ? (a(), u(J, { key: 4 }, [
              o(H).length ? (a(), u("div", af, [
                r("div", lf, [
                  m(o($), {
                    icon: "tabler:flame",
                    class: "km-i km-flame",
                    "aria-hidden": "true"
                  }),
                  x[23] || (x[23] = r("span", { class: "hub-section-title" }, "Most popular", -1)),
                  x[24] || (x[24] = r("span", { class: "hub-section-sub" }, "by downloads", -1))
                ]),
                r("div", rf, [
                  (a(!0), u(J, null, re(o(H), (g) => (a(), u("button", {
                    key: "f" + o(Tn)(g),
                    class: "feat-card",
                    style: Kt({ "--accent": o(bn)(g) }),
                    onClick: (Ke) => o(bt)(g)
                  }, [
                    x[26] || (x[26] = r("span", { class: "feat-strip" }, null, -1)),
                    r("span", df, [
                      m(o($), {
                        icon: o(nn)(g),
                        class: "km-i-lg",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    r("span", cf, [
                      r("span", pf, [
                        r("span", ff, c(o(tn)(g)), 1),
                        o(cn)(g) ? (a(), u("span", mf, "app")) : h("", !0),
                        o(hn)(g) ? (a(), u("span", hf, [
                          m(o($), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          x[25] || (x[25] = A(" private", -1))
                        ])) : h("", !0),
                        g.deprecated ? (a(), u("span", bf, "deprecated")) : h("", !0)
                      ]),
                      r("span", vf, c(o(Pn)(g)), 1),
                      g.description ? (a(), u("span", gf, c(g.description), 1)) : h("", !0),
                      r("span", yf, [
                        r("span", kf, [
                          m(o($), {
                            icon: "tabler:tag",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          A(" " + c(g.latest_version || "?"), 1)
                        ]),
                        r("span", wf, [
                          m(o($), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          A(" " + c(o(vn)(g.total_downloads)), 1)
                        ]),
                        g.license ? (a(), u("span", {
                          key: 0,
                          class: "meta-pill",
                          title: g.license
                        }, [
                          m(o($), {
                            icon: "tabler:license",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          A(" " + c(o(Vn)(g.license)), 1)
                        ], 8, Sf)) : h("", !0)
                      ])
                    ])
                  ], 12, uf))), 128))
                ])
              ])) : h("", !0),
              r("div", {
                class: ae(o(H).length ? "km-mt-sm" : "")
              }, [
                r("div", $f, [
                  m(o($), {
                    icon: "tabler:apps",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  r("span", Cf, c(o(H).length ? "All modules" : "Available"), 1),
                  r("span", If, c(o(D).length) + " available", 1)
                ]),
                r("div", _f, [
                  (a(!0), u(J, null, re(o(Y), (g) => (a(), u("button", {
                    key: o(Tn)(g),
                    class: "mod-card",
                    style: Kt({ "--accent": o(bn)(g) }),
                    onClick: (Ke) => o(bt)(g)
                  }, [
                    r("span", Of, [
                      m(o($), {
                        icon: o(nn)(g),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    r("span", Lf, [
                      r("span", zf, [
                        r("span", Af, c(o(tn)(g)), 1),
                        r("span", Mf, c(g.latest_version || "—"), 1),
                        o(cn)(g) ? (a(), u("span", Ef, "app")) : h("", !0),
                        o(hn)(g) ? (a(), u("span", Pf, [
                          m(o($), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          x[27] || (x[27] = A(" private", -1))
                        ])) : h("", !0),
                        g.deprecated ? (a(), u("span", Ff, "deprecated")) : h("", !0)
                      ]),
                      r("span", Tf, c(o(Pn)(g)), 1),
                      g.description ? (a(), u("span", Vf, c(g.description), 1)) : h("", !0),
                      r("span", Df, [
                        r("span", Rf, [
                          m(o($), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          A(" " + c(o(vn)(g.total_downloads)), 1)
                        ]),
                        g.favorites_count ? (a(), u("span", Bf, [
                          m(o($), {
                            icon: "tabler:star",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          A(" " + c(g.favorites_count), 1)
                        ])) : h("", !0),
                        g.license ? (a(), u("span", {
                          key: 1,
                          class: "foot-stat km-dim",
                          title: g.license
                        }, c(o(Vn)(g.license)), 9, Hf)) : h("", !0),
                        g.update_time ? (a(), u("span", Uf, c(o(Dn)(g.update_time, { maxUnit: "year" })), 1)) : h("", !0)
                      ])
                    ])
                  ], 12, xf))), 128))
                ])
              ], 2)
            ], 64)) : !o(Je) && o(Ft).length === 0 ? (a(), u("div", jf, [
              m(o($), {
                icon: "tabler:package-off",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              r("p", Nf, [
                x[28] || (x[28] = A(" No modules tagged ", -1)),
                r("code", Kf, c(o(n)), 1),
                x[29] || (x[29] = A(" are published yet. ", -1))
              ])
            ])) : !o(Je) && o(S) ? (a(), u("div", qf, [...x[30] || (x[30] = [
              r("p", { class: "km-muted" }, "No available modules match this filter.", -1)
            ])])) : o(Je) ? h("", !0) : (a(), u("div", Gf, [
              m(o($), {
                icon: "tabler:circle-check",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              r("p", Wf, [
                x[31] || (x[31] = A(" All ", -1)),
                r("code", Zf, c(o(n)), 1),
                x[32] || (x[32] = A(" modules are installed — manage them under Installed below. ", -1))
              ])
            ]))
          ]),
          o(it).length > 0 || o(Ye) ? (a(), u("section", Yf, [
            r("button", {
              class: "km-collapse-head",
              "aria-expanded": o(Xe),
              onClick: x[6] || (x[6] = (g) => Xe.value = !o(Xe))
            }, [
              m(o($), {
                icon: o(Xe) ? "tabler:chevron-down" : "tabler:chevron-right",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              x[33] || (x[33] = r("span", { class: "km-h2" }, "Installed", -1)),
              r("span", Jf, [
                A(c(o(X).length), 1),
                o(X).length !== o(st) ? (a(), u(J, { key: 0 }, [
                  A(" of " + c(o(st)), 1)
                ], 64)) : h("", !0),
                A(" module" + c(o(X).length === 1 ? "" : "s"), 1)
              ]),
              o(je) > 0 && o(je) !== o(st) ? (a(), u("span", Qf, c(o(Tt)) + " of " + c(o(je)) + " hub module" + c(o(je) === 1 ? "" : "s"), 1)) : h("", !0),
              o(Ve).length ? (a(), u("span", em, c(o(Ve).length) + " update" + c(o(Ve).length === 1 ? "" : "s"), 1)) : h("", !0)
            ], 8, Xf),
            o(Xe) ? (a(), u(J, { key: 0 }, [
              o(Ye) ? (a(), u("div", tm, c(o(Ye)), 1)) : h("", !0),
              o(it).length > 0 ? (a(), u("div", nm, [
                Be(r("input", {
                  "onUpdate:modelValue": x[7] || (x[7] = (g) => zt(We) ? We.value = g : null),
                  class: "km-input km-filter inst-filter",
                  placeholder: "Search installed…",
                  "aria-label": "Search installed modules"
                }, null, 512), [
                  [On, o(We)]
                ]),
                m(o(zn), {
                  modelValue: o(vt),
                  "onUpdate:modelValue": x[8] || (x[8] = (g) => zt(vt) ? vt.value = g : null),
                  class: "km-sort",
                  options: [
                    { label: "All installed", value: "all" },
                    { label: "Root only", value: "root" },
                    { label: "Transitive only", value: "transitive" },
                    { label: "Local replacements", value: "local" }
                  ],
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Filter installed modules"
                }, null, 8, ["modelValue"])
              ])) : h("", !0),
              o(X).length > 0 ? (a(), u("div", om, [
                (a(!0), u(J, null, re(o(X), (g) => (a(), u("button", {
                  key: g.id,
                  class: "inst-row",
                  style: Kt({ "--accent": o($e)(g) }),
                  onClick: (Ke) => o(bt)(g)
                }, [
                  x[35] || (x[35] = r("span", {
                    class: "inst-strip",
                    "aria-hidden": "true"
                  }, null, -1)),
                  r("div", sm, [
                    m(o($), {
                      icon: o(lt)(g),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  r("div", am, [
                    r("div", lm, [
                      r("span", rm, c(g.component), 1),
                      o(cn)(o(me)(g.component)) ? (a(), u("span", um, "app")) : h("", !0),
                      r("span", {
                        class: ae(o(Vt)(g) ? "badge-installed kx-tag-caps" : "km-chip")
                      }, c(o(De)(g)), 3),
                      o(ve)(g) ? (a(), u("span", dm, [
                        m(o($), {
                          icon: "tabler:lock",
                          class: "km-i-xs",
                          "aria-hidden": "true"
                        }),
                        x[34] || (x[34] = A(" private", -1))
                      ])) : h("", !0),
                      g.source ? (a(), u("span", cm, c(g.source), 1)) : h("", !0),
                      o(Qe)(g) && o(Qe)(g)?.status !== "current" ? (a(), u("span", {
                        key: 3,
                        class: ae(["inst-update", o(Qe)(g)?.status]),
                        title: o(Qe)(g)?.message || ""
                      }, [
                        m(o($), {
                          icon: o(Dt)(g),
                          class: ae(["km-i-xs", o(It)(g) && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        A(" " + c(o(sn)(g)), 1)
                      ], 10, pm)) : h("", !0)
                    ]),
                    r("div", fm, [
                      A(c(g.id) + " ", 1),
                      o(rt)(g) ? (a(), u("span", mm, " · " + c(o(rt)(g)), 1)) : h("", !0)
                    ]),
                    o(Qe)(g)?.message ? (a(), u("div", hm, c(o(Qe)(g)?.message), 1)) : h("", !0)
                  ]),
                  r("span", bm, c(o(ht)(g)), 1),
                  r("span", vm, c(o(ut)(g)), 1),
                  r("div", gm, [
                    o(Qe)(g)?.status === "available" || o(It)(g) ? (a(), u("button", {
                      key: 0,
                      class: "km-icon-btn",
                      disabled: o(It)(g) || o(Ue),
                      "aria-label": `Update ${g.component}`,
                      onClick: xn((Ke) => o(Ne)(g), ["stop"])
                    }, [
                      m(o($), {
                        icon: o(Dt)(g),
                        class: ae(["km-i", o(It)(g) && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ], 8, ym)) : o(gt)(g) ? (a(), u("button", {
                      key: 1,
                      class: "km-icon-btn",
                      disabled: o(Ue),
                      "aria-label": `Open update planner for ${g.component}`,
                      onClick: xn((Ke) => o(_t)(g), ["stop"])
                    }, [
                      m(o($), {
                        icon: "tabler:refresh-dot",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, km)) : (a(), u("button", {
                      key: 2,
                      class: "km-icon-btn",
                      disabled: "",
                      title: o(yt)(g),
                      "aria-label": `Cannot update ${g.component}: ${o(yt)(g)}`
                    }, [
                      m(o($), {
                        icon: "tabler:refresh-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, wm)),
                    o(ke)(g) ? (a(), u("button", {
                      key: 3,
                      class: "km-icon-btn km-danger",
                      "aria-label": `Uninstall ${g.component}`,
                      onClick: xn((Ke) => o(Yt)(g), ["stop"])
                    }, [
                      m(o($), {
                        icon: "tabler:trash",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Sm)) : (a(), u("button", {
                      key: 4,
                      class: "km-icon-btn",
                      disabled: "",
                      title: o(Pe)(g),
                      "aria-label": `Cannot uninstall ${g.component}: ${o(Pe)(g)}`
                    }, [
                      m(o($), {
                        icon: "tabler:trash-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, $m))
                  ]),
                  m(o($), {
                    icon: "tabler:chevron-right",
                    class: "km-i km-chev",
                    "aria-hidden": "true"
                  })
                ], 12, im))), 128))
              ])) : o(it).length > 0 ? (a(), u("div", Cm, [
                m(o($), {
                  icon: "tabler:filter-off",
                  class: "km-i-xl km-dim km-block",
                  "aria-hidden": "true"
                }),
                x[36] || (x[36] = r("p", { class: "km-muted" }, "No installed modules match this filter.", -1))
              ])) : h("", !0)
            ], 64)) : h("", !0)
          ])) : h("", !0)
        ]))
      ])),
      o(Ce) ? (a(), be(ec, {
        key: 4,
        open: !0,
        mode: o(Ce).mode,
        component: o(Ce).component,
        version: o(Ce).version,
        "current-id": o(Ce).currentId,
        "catalog-item": o(Ce).catalogItem,
        "installed-dep": o(Ce).installedDep,
        onClose: o(dt),
        onChanged: o(an)
      }, null, 8, ["mode", "component", "version", "current-id", "catalog-item", "installed-dep", "onClose", "onChanged"])) : h("", !0),
      m(o(Qo), {
        visible: o(ct),
        "onUpdate:visible": x[11] || (x[11] = (g) => zt(ct) ? ct.value = g : null),
        modal: "",
        closable: !o(Se),
        "dismissable-mask": !o(Se),
        "close-on-escape": !o(Se),
        class: "km-dialog",
        pt: { header: { class: "km-modal-head" }, content: { class: "km-dialog-content" }, footer: { class: "km-modal-foot" } },
        style: { width: "min(560px, calc(100vw - 40px))" }
      }, {
        header: oe(() => [...x[37] || (x[37] = [
          r("span", null, "Uninstall module", -1)
        ])]),
        footer: oe(() => [
          m(o(ce), {
            size: "small",
            severity: "secondary",
            text: "",
            disabled: o(Se),
            onClick: x[10] || (x[10] = (g) => ct.value = !1)
          }, {
            default: oe(() => [...x[50] || (x[50] = [
              A("Cancel", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]),
          m(o(ce), {
            size: "small",
            severity: "secondary",
            outlined: "",
            disabled: o(Se) || o(tt),
            onClick: o(St)
          }, {
            default: oe(() => [
              m(o($), {
                icon: o(tt) ? "tabler:loader-2" : "tabler:eye",
                class: ae(["km-i", o(tt) && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              x[51] || (x[51] = A(" Preview ", -1))
            ]),
            _: 1
          }, 8, ["disabled", "onClick"]),
          m(o(ce), {
            size: "small",
            severity: "danger",
            disabled: !!o(Oe),
            title: o(Oe) || void 0,
            onClick: o(Lt)
          }, {
            default: oe(() => [
              m(o($), {
                icon: o(Se) ? "tabler:loader-2" : "tabler:trash",
                class: ae(["km-i", o(Se) && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              x[52] || (x[52] = A(" Uninstall ", -1))
            ]),
            _: 1
          }, 8, ["disabled", "title", "onClick"])
        ]),
        default: oe(() => [
          r("div", Im, [
            r("p", _m, [
              x[38] || (x[38] = A(" Uninstall ", -1)),
              r("code", xm, c(o(pt)?.component), 1),
              r("span", Om, "(" + c(o(pt)?.id) + ")", 1)
            ]),
            r("div", null, [
              x[39] || (x[39] = r("label", { class: "km-label" }, "Migration policy", -1)),
              m(o(zn), {
                modelValue: o(et),
                "onUpdate:modelValue": x[9] || (x[9] = (g) => zt(et) ? et.value = g : null),
                class: "km-sort km-w-full",
                options: o(i),
                "option-label": "label",
                "option-value": "value",
                "aria-label": "Uninstall migration policy"
              }, null, 8, ["modelValue", "options"]),
              x[40] || (x[40] = r("p", { class: "km-req-desc" }, [
                A("Default "),
                r("code", { class: "km-mono" }, "block"),
                A(". Choose "),
                r("code", { class: "km-mono" }, "down"),
                A(" only if the module's down migrations are safe; data loss is possible.")
              ], -1))
            ]),
            o(xt) ? (a(), u("div", Lm, [
              o(xe) ? (a(), u("span", zm, c(o(xe)), 1)) : h("", !0),
              A(c(o(xt)) + " ", 1),
              o(Rt).length ? (a(), u("div", Am, "required by: " + c(o(Rt).join(", ")), 1)) : h("", !0)
            ])) : h("", !0),
            o(Ot) ? (a(), u("div", Mm, [
              x[41] || (x[41] = r("strong", null, "Uninstall blocked:", -1)),
              A(" " + c(o(Ot)), 1)
            ])) : h("", !0),
            o(tt) ? (a(), u("div", Em, [
              m(o($), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              x[42] || (x[42] = r("span", { class: "km-grow km-running-label" }, "Previewing uninstall", -1))
            ])) : o(ye) ? (a(), u("div", Pm, [
              o(ye).warnings?.length ? (a(), u("div", Fm, [
                (a(!0), u(J, null, re(o(ye).warnings, (g) => (a(), u("div", { key: g }, c(g), 1))), 128))
              ])) : h("", !0),
              o(ye).removed?.length ? (a(), u("div", Tm, [
                x[44] || (x[44] = r("div", { class: "km-preview-title" }, "Removed", -1)),
                (a(!0), u(J, null, re(o(ye).removed, (g) => (a(), u("div", {
                  key: g.name || g.component,
                  class: "km-preview-row"
                }, [
                  m(o($), {
                    icon: "tabler:minus",
                    class: "km-i-xs km-danger-fg",
                    "aria-hidden": "true"
                  }),
                  r("span", Vm, c(g.name || g.component), 1),
                  x[43] || (x[43] = r("span", { class: "km-grow" }, null, -1)),
                  r("span", Dm, c(g.version), 1)
                ]))), 128))
              ])) : h("", !0),
              o(ye).kept?.length ? (a(), u("div", Rm, [
                x[46] || (x[46] = r("div", { class: "km-preview-title" }, "Kept, still needed", -1)),
                (a(!0), u(J, null, re(o(ye).kept, (g) => (a(), u("div", {
                  key: g.name || g.component,
                  class: "km-preview-row"
                }, [
                  m(o($), {
                    icon: "tabler:lock",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  r("span", Bm, c(g.name || g.component), 1),
                  x[45] || (x[45] = r("span", { class: "km-grow" }, null, -1)),
                  r("span", Hm, c(g.version), 1)
                ]))), 128))
              ])) : h("", !0),
              o(ye).kept_under_uncertainty?.length ? (a(), u("div", Um, [
                x[48] || (x[48] = r("div", { class: "km-preview-title" }, "Kept because usage is unclear", -1)),
                (a(!0), u(J, null, re(o(ye).kept_under_uncertainty, (g) => (a(), u("div", {
                  key: g.name || g.component,
                  class: "km-preview-row"
                }, [
                  m(o($), {
                    icon: "tabler:help",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  r("span", jm, c(g.name || g.component), 1),
                  x[47] || (x[47] = r("span", { class: "km-grow" }, null, -1)),
                  r("span", Nm, c(g.reason || g.version), 1)
                ]))), 128))
              ])) : h("", !0)
            ])) : h("", !0),
            o(Zt).length ? (a(), u("div", Km, [
              x[49] || (x[49] = r("div", { class: "km-panel-title" }, "Uninstall steps", -1)),
              (a(!0), u(J, null, re(o(Zt), (g, Ke) => (a(), u("div", {
                key: `${g.step}-${Ke}`,
                class: ae(["km-ledger-row", g.status === "failed" || g.status === "rollback_failed" ? "km-ledger-bad" : g.status === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok"])
              }, [
                r("span", qm, c(Ke + 1), 1),
                r("span", Gm, c(o(Xt)(g)), 1),
                r("span", Wm, c(g.status), 1),
                g.message ? (a(), u("span", Zm, c(g.message), 1)) : h("", !0)
              ], 2))), 128))
            ])) : h("", !0),
            o(Se) ? (a(), u("div", Ym, [
              m(o($), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              r("span", Xm, c(o(Bt)), 1),
              r("span", Jm, c(o(Ht)) + "s", 1)
            ])) : h("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible", "closable", "dismissable-mask", "close-on-escape"])
    ]));
  }
}), ah = {
  rootComponent: Qm,
  plugins: [Pi]
};
export {
  ah as mountConfig
};
//# sourceMappingURL=lazy-mount-C-7Te4jf.js.map
