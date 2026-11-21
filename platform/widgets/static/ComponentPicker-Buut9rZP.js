import { openBlock as c, createElementBlock as b, mergeProps as C, renderSlot as et, createTextVNode as yt, toDisplayString as N, resolveComponent as At, resolveDirective as nn, withDirectives as on, createBlock as ct, resolveDynamicComponent as en, withCtx as Ot, createCommentVNode as L, normalizeClass as Q, createElementVNode as x, defineComponent as Tt, computed as f, withModifiers as U, Fragment as q, createVNode as w, unref as j, watch as bt, onBeforeUnmount as rn, ref as $, withKeys as Dt, renderList as an } from "vue";
import { Icon as A } from "@iconify/vue";
import { on as dn, api as ht } from "@wippy-fe/proxy";
import { u as ln, a as un, B as mt, b as Et, s as sn, c as kt, f as pt, R as cn } from "./wc-runtime-Vcu3yWjv.js";
import { p as bn } from "./pickerValue-SPnnNBeX.js";
import { _ as pn } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { s as gn } from "./index-CWLxPt_A.js";
import { _ as fn } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
const vn = () => ln(), hn = () => un();
var yn = `
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
`, mn = {
  root: function(n) {
    var a = n.props, e = n.instance;
    return ["p-badge p-component", {
      "p-badge-circle": sn(a.value) && String(a.value).length === 1,
      "p-badge-dot": Et(a.value) && !e.$slots.default,
      "p-badge-sm": a.size === "small",
      "p-badge-lg": a.size === "large",
      "p-badge-xl": a.size === "xlarge",
      "p-badge-info": a.severity === "info",
      "p-badge-success": a.severity === "success",
      "p-badge-warn": a.severity === "warn",
      "p-badge-danger": a.severity === "danger",
      "p-badge-secondary": a.severity === "secondary",
      "p-badge-contrast": a.severity === "contrast"
    }];
  }
}, kn = mt.extend({
  name: "badge",
  style: yn,
  classes: mn
}), wn = {
  name: "BaseBadge",
  extends: kt,
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
  style: kn,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function rt(t) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, rt(t);
}
function Lt(t, n, a) {
  return (n = xn(n)) in t ? Object.defineProperty(t, n, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = a, t;
}
function xn(t) {
  var n = _n(t, "string");
  return rt(n) == "symbol" ? n : n + "";
}
function _n(t, n) {
  if (rt(t) != "object" || !t) return t;
  var a = t[Symbol.toPrimitive];
  if (a !== void 0) {
    var e = a.call(t, n);
    if (rt(e) != "object") return e;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Nt = {
  name: "Badge",
  extends: wn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return pt(Lt(Lt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Sn = ["data-p"];
function $n(t, n, a, e, u, l) {
  return c(), b("span", C({
    class: t.cx("root"),
    "data-p": l.dataP
  }, t.ptmi("root")), [et(t.$slots, "default", {}, function() {
    return [yt(N(t.value), 1)];
  })], 16, Sn);
}
Nt.render = $n;
var jn = `
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
function at(t) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, at(t);
}
function D(t, n, a) {
  return (n = Cn(n)) in t ? Object.defineProperty(t, n, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = a, t;
}
function Cn(t) {
  var n = Pn(t, "string");
  return at(n) == "symbol" ? n : n + "";
}
function Pn(t, n) {
  if (at(t) != "object" || !t) return t;
  var a = t[Symbol.toPrimitive];
  if (a !== void 0) {
    var e = a.call(t, n);
    if (at(e) != "object") return e;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var In = {
  root: function(n) {
    var a = n.instance, e = n.props;
    return ["p-button p-component", D(D(D(D(D(D(D(D(D({
      "p-button-icon-only": a.hasIcon && !e.label && !e.badge,
      "p-button-vertical": (e.iconPos === "top" || e.iconPos === "bottom") && e.label,
      "p-button-loading": e.loading,
      "p-button-link": e.link || e.variant === "link"
    }, "p-button-".concat(e.severity), e.severity), "p-button-raised", e.raised), "p-button-rounded", e.rounded), "p-button-text", e.text || e.variant === "text"), "p-button-outlined", e.outlined || e.variant === "outlined"), "p-button-sm", e.size === "small"), "p-button-lg", e.size === "large"), "p-button-plain", e.plain), "p-button-fluid", a.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(n) {
    var a = n.props;
    return ["p-button-icon", D({}, "p-button-icon-".concat(a.iconPos), a.label)];
  },
  label: "p-button-label"
}, zn = mt.extend({
  name: "button",
  style: jn,
  classes: In
}), Bn = {
  name: "BaseButton",
  extends: kt,
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
  style: zn,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function dt(t) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, dt(t);
}
function k(t, n, a) {
  return (n = An(n)) in t ? Object.defineProperty(t, n, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = a, t;
}
function An(t) {
  var n = Dn(t, "string");
  return dt(n) == "symbol" ? n : n + "";
}
function Dn(t, n) {
  if (dt(t) != "object" || !t) return t;
  var a = t[Symbol.toPrimitive];
  if (a !== void 0) {
    var e = a.call(t, n);
    if (dt(e) != "object") return e;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Ut = {
  name: "Button",
  extends: Bn,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(n) {
      var a = n === "root" ? this.ptmi : this.ptm;
      return a(n, {
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
      return C(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Et(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return pt(k(k(k(k(k(k(k(k(k(k({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return pt(k(k({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return pt(k(k({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: gn,
    Badge: Nt
  },
  directives: {
    ripple: cn
  }
}, Ln = ["data-p"], On = ["data-p"];
function Tn(t, n, a, e, u, l) {
  var O = At("SpinnerIcon"), T = At("Badge"), P = nn("ripple");
  return t.asChild ? et(t.$slots, "default", {
    key: 1,
    class: Q(t.cx("root")),
    a11yAttrs: l.a11yAttrs
  }) : on((c(), ct(en(t.as), C({
    key: 0,
    class: t.cx("root"),
    "data-p": l.dataP
  }, l.attrs), {
    default: Ot(function() {
      return [et(t.$slots, "default", {}, function() {
        return [t.loading ? et(t.$slots, "loadingicon", C({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (c(), b("span", C({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (c(), ct(O, C({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : et(t.$slots, "icon", C({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (c(), b("span", C({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": l.dataIconP
          }, t.ptm("icon")), null, 16, Ln)) : L("", !0)];
        }), t.label ? (c(), b("span", C({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": l.dataLabelP
        }), N(t.label), 17, On)) : L("", !0), t.badge ? (c(), ct(T, {
          key: 3,
          value: t.badge,
          class: Q(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : L("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[P]]);
}
Ut.render = Tn;
var En = `
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
`, Nn = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Un = mt.extend({
  name: "progressspinner",
  style: En,
  classes: Nn
}), Fn = {
  name: "BaseProgressSpinner",
  extends: kt,
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
  style: Un,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Ft = {
  name: "ProgressSpinner",
  extends: Fn,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Rn = ["fill", "stroke-width"];
function Kn(t, n, a, e, u, l) {
  return c(), b("div", C({
    class: t.cx("root"),
    role: "progressbar"
  }, t.ptmi("root")), [(c(), b("svg", C({
    class: t.cx("spin"),
    viewBox: "25 25 50 50",
    style: l.svgStyle
  }, t.ptm("spin")), [x("circle", C({
    class: t.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: t.fill,
    "stroke-width": t.strokeWidth,
    strokeMiterlimit: "10"
  }, t.ptm("circle")), null, 16, Rn)], 16))], 16);
}
Ft.render = Kn;
const Vn = { key: 0 }, Wn = /* @__PURE__ */ Tt({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(t) {
    const n = t, a = f(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (e, u) => t.state.deleting_at ? (c(), b("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: u[1] || (u[1] = U(() => {
      }, ["stop"])),
      onKeydown: u[2] || (u[2] = U(() => {
      }, ["stop"]))
    }, [
      a.value ? (c(), b(q, { key: 0 }, [
        x("span", null, [
          u[3] || (u[3] = yt("Deletion failed", -1)),
          t.state.deletion_job?.last_error ? (c(), b("span", Vn, ": " + N(t.state.deletion_job.last_error), 1)) : L("", !0)
        ]),
        w(j(Ut), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: u[0] || (u[0] = U((l) => e.$emit("retry"), ["stop"]))
        })
      ], 64)) : (c(), b(q, { key: 1 }, [
        w(j(Ft), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        u[4] || (u[4] = x("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : L("", !0);
  }
});
function ot(t) {
  return !!t && typeof t == "object" && !Array.isArray(t);
}
function Mn(t, n) {
  return t;
}
function qn(t, n, a) {
  const e = ot(t) ? t : {}, u = [
    e,
    ot(e.data) ? e.data : null,
    ot(e.payload) ? e.payload : null,
    ot(e.detail) ? e.detail : null
  ].filter(Boolean);
  for (const l of u) {
    if (l.event !== "component.meta.changed" && l.event !== "component.deleting" && l.event !== "component.deleted") continue;
    const O = String(l.component_id || ""), T = String(e.topic || l.topic || "");
    if (!O && (!T.startsWith("component.") || T === "component.")) continue;
    const P = O || n || T.slice(10);
    return l.event === "component.deleting" && typeof l.deletion_job_id == "string" && l.deletion_job_id ? { event: l.event, component_id: P, deletion_job_id: l.deletion_job_id } : l.event !== "component.meta.changed" ? { event: l.event, component_id: P } : {
      event: "component.meta.changed",
      component_id: P,
      meta: Mn(ot(l.meta) ? l.meta : {}),
      deleted: Array.isArray(l.deleted) ? l.deleted.map(String) : []
    };
  }
  return null;
}
function Jn(t, n) {
  const a = qn(t, n);
  return a && a.event !== "component.meta.changed" ? a : null;
}
function Gn(t, n, a, e) {
  const u = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
  function O(_, v) {
    const g = t.value.find((F) => n(F) === _), i = l.get(_), p = v?.job_id || i?.state.deletion_job_id || g?.deletion_job_id, z = i ? i.state.deletion_job_id : g?.deleting_at ? g.deletion_job_id : void 0;
    if ((i || g?.deleting_at) && p === z || p && i?.superseded.has(p)) return;
    const m = {
      deleting_at: i?.state.deleting_at || g?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: p
    }, X = new Set(i?.superseded);
    for (const F of [i?.state.deletion_job_id, g?.deletion_job_id])
      F && F !== p && X.add(F);
    l.set(_, { state: m, superseded: X }), g && (Object.assign(g, m), g.deletion_job = void 0);
  }
  const T = bt(() => t.value, (_, v = []) => {
    const g = _.filter((i) => !u.has(n(i)));
    for (const i of v)
      u.has(n(i)) || g.some((p) => n(p) === n(i)) || i.deleting_at && e?.(n(i));
    if (g.length !== _.length) {
      t.value = g;
      return;
    }
    for (const i of _) {
      i.deleting_at && i.deletion_job === void 0 && !v.includes(i) && (i.deletion_job = null);
      const p = l.get(n(i));
      if (p) {
        const m = i.deletion_job_id;
        i.deleting_at && m && m !== p.state.deletion_job_id && !p.superseded.has(m) && (p.state.deletion_job_id && p.superseded.add(p.state.deletion_job_id), p.state.deletion_job_id = m), m !== p.state.deletion_job_id && (i.deletion_job = void 0), Object.assign(i, p.state);
      }
      const z = v.find((m) => n(m) === n(i));
      i.deletion_job === void 0 && z?.deletion_job_id === i.deletion_job_id && (i.deletion_job = z?.deletion_job);
    }
  }, { immediate: !0 }), P = dn("@message", (_) => {
    const v = Jn(_);
    if (!v) return;
    const g = t.value.find((i) => n(i) === v.component_id);
    v.event === "component.deleted" ? (g && !u.has(v.component_id) && e?.(v.component_id), u.add(v.component_id), l.delete(v.component_id), t.value = t.value.filter((i) => n(i) !== v.component_id)) : g && O(v.component_id, { job_id: v.deletion_job_id });
  });
  return rn(() => {
    T(), typeof P == "function" && P();
  }), { acceptDeletion: O };
}
const Hn = ["aria-expanded", "onKeydown"], Qn = { class: "cp-pop" }, Xn = {
  key: 0,
  class: "cp-state"
}, Yn = {
  key: 1,
  class: "cp-create"
}, Zn = {
  key: 2,
  class: "cp-state cp-state--stack"
}, to = { class: "cp-list" }, no = ["disabled", "onClick"], oo = { class: "cp-label" }, eo = ["disabled", "onClick"], ro = ["onClick"], ao = {
  key: 0,
  class: "cp-del-err",
  "data-test": "cp-del-err"
}, fo = /* @__PURE__ */ Tt({
  __name: "ComponentPicker",
  setup(t) {
    const n = vn(), a = hn();
    function e(o) {
      return typeof o == "string" ? o : o == null ? "" : String(o);
    }
    function u(o) {
      if (o && typeof o == "object") return o;
      if (typeof o == "string" && o.trim().startsWith("{"))
        try {
          const r = JSON.parse(o);
          return r && typeof r == "object" ? r : null;
        } catch {
          return null;
        }
      return null;
    }
    function l(o) {
      return e(o.id || o.thread_id || o.component_id || o.webhook_id).trim();
    }
    function O(o) {
      const r = u(o.attrs);
      return e(
        o.label || o.title || o.name || o.component_title || r && (r.label || r.title || r.name)
      ).trim();
    }
    function T(o) {
      return e(o.icon || o.component_icon).trim() || "tabler:message-circle";
    }
    function P(o, r) {
      const d = u(o);
      if (!d) return "";
      const s = e(d[r]).trim();
      if (s) return s;
      const y = u(d.properties);
      if (!y) return "";
      for (const st of Object.values(y)) {
        const tt = u(st), nt = e(tt?.[r]).trim();
        if (nt) return nt;
      }
      return "";
    }
    const _ = f(() => {
      const o = u(u(n.value?.schema)?.properties);
      for (const [r, d] of Object.entries(o || {})) {
        const s = u(d);
        if (typeof s?.value_field == "string" && s.value_field) return { key: r, valueField: s.value_field };
      }
      return null;
    });
    function v(o, r) {
      const d = _.value;
      if (!d) return { thread_id: r };
      if (!(d.valueField in o)) throw new Error("Catalog item is missing its declared selection value.");
      return { [d.key]: o[d.valueField] };
    }
    function g(o) {
      const r = _.value;
      if (!r) return bn(o, "thread_id");
      const d = u(o)?.[r.key];
      if (typeof d == "string") return d;
      const s = u(d);
      return typeof s?.id == "string" ? s.id : "";
    }
    const i = f(() => e(n.value?.source).trim() || P(n.value?.schema, "source") || "/api/v1/threads"), p = f(() => i.value.split("?")[0] === "/api/v1/threads"), z = f(() => {
      const o = e(n.value?.meta).trim();
      if (o.startsWith("{"))
        try {
          return JSON.parse(o);
        } catch {
          return {};
        }
      return {};
    }), m = f(() => e(n.value?.threadClass).trim() || e(z.value.thread_class).trim()), X = f(() => e(n.value?.implId).trim() || e(z.value.impl_id).trim() || P(n.value?.schema, "impl_id")), F = f(() => e(n.value?.deleteEndpoint).trim() || e(z.value.delete_endpoint).trim()), gt = f(() => {
      if (!p.value) return null;
      const o = z.value?.component?.create_ui;
      return o && typeof o == "object" ? o : null;
    }), R = $(null), it = f(() => e(gt.value?.tag_name).trim() || e(R.value?.tag_name).trim()), Rt = f(() => e(gt.value?.title).trim() || e(R.value?.title).trim()), W = f(() => (e(n.value?.title).trim() || e(z.value.title).trim()).toLowerCase()), wt = f(() => n.value?.placeholder || (W.value ? `Select a ${W.value}…` : "Select…")), Kt = f(() => W.value || Rt.value.toLowerCase() || "one"), xt = f(() => `Create new ${Kt.value}`), ft = f(() => W.value ? `Untitled ${W.value}` : "Untitled"), Vt = f(() => W.value ? `No ${W.value} available yet — create one first, then return here.` : "Nothing available yet — create one first, then return here."), I = $([]), J = $(!1), G = $(!1), B = $(!1), lt = $(!1), S = $(""), Y = $(""), H = $(""), K = $(""), _t = $(null);
    async function Wt() {
      if (!p.value) {
        R.value = null;
        return;
      }
      if (gt.value) {
        R.value = null;
        return;
      }
      const o = m.value;
      if (!o) {
        R.value = null;
        return;
      }
      try {
        const { data: r } = await ht.get(`/api/v1/component-kinds/create-view?class=${encodeURIComponent(o)}`), d = r?.create_view;
        R.value = d && e(d.tag_name).trim() ? d : null;
      } catch {
        R.value = null;
      }
    }
    async function Z() {
      if (!G.value) {
        G.value = !0;
        try {
          const [o, r = ""] = i.value.split("?"), d = new URLSearchParams(r);
          p.value && (m.value && d.set("thread_class", m.value), X.value && d.set("impl_id", X.value), d.set("limit", "100"));
          const s = p.value ? `${o}?${d}` : i.value, y = [];
          let st = s, tt = 0;
          for (; ; ) {
            const { data: h } = await ht.get(st);
            if (h?.success === !1) throw new Error(String(h.error || "Could not load components"));
            const V = Array.isArray(h?.items) ? h.items : Array.isArray(h?.threads) ? h.threads : [];
            y.push(...V);
            const E = h?.next_offset;
            if (E == null) break;
            if (typeof E != "number" || !Number.isSafeInteger(E) || E <= tt)
              throw new Error("The server returns an invalid component offset.");
            tt = E;
            const [Zt, tn = ""] = s.split("?"), Bt = new URLSearchParams(tn);
            Bt.set("offset", String(tt)), st = `${Zt}?${Bt}`;
          }
          const nt = /* @__PURE__ */ new Set(), zt = [];
          for (const h of y) {
            const V = l(h);
            if (!V || nt.has(V)) continue;
            nt.add(V);
            const E = O(h);
            zt.push({
              id: V,
              label: E && E !== V ? E : ft.value,
              icon: T(h),
              selection: v(h, V),
              deleting_at: typeof h.deleting_at == "string" ? h.deleting_at : void 0,
              deletion_job_id: typeof h.deletion_job_id == "string" ? h.deletion_job_id : void 0,
              deletion_job: h.deletion_job
            });
          }
          I.value = zt, J.value = !0, a("load", void 0);
        } catch (o) {
          a("error", { message: "failed to list options", error: o });
        } finally {
          G.value = !1;
        }
        Wt();
      }
    }
    const ut = f(() => I.value.find((o) => o.id === S.value) || null), M = $(null);
    function St(o, r) {
      o && r && (M.value = { id: o, label: r });
    }
    const Mt = f(() => {
      const o = ut.value;
      return o ? o.label : M.value && M.value.id === S.value ? M.value.label : G.value || !J.value ? wt.value : ft.value;
    });
    bt([ut, S], ([o, r]) => {
      o ? St(r, o.label) : M.value && M.value.id !== r && (M.value = null);
    }, { immediate: !0 });
    async function qt() {
      !S.value || ut.value || G.value || await Z();
    }
    function $t(o) {
      S.value = o.id, St(o.id, o.label), a("change", o.selection), a("config-changed", o.selection), B.value = !1;
    }
    function Jt(o) {
      K.value = "", Y.value = o.id;
    }
    function Gt() {
      Y.value = "", K.value = "";
    }
    function jt(o, r) {
      const d = o && typeof o == "object" ? o : r && typeof r == "object" && r.response?.data && typeof r.response.data == "object" ? r.response.data : null;
      if (d) {
        const s = e(d.error).trim();
        if (s) return s;
        const y = Number(d.subscriber_count);
        if (y > 0) return `In use by ${y} — remove those first.`;
      }
      return r instanceof Error && r.message ? r.message : "Could not delete.";
    }
    async function Ct(o) {
      const r = F.value;
      if (!(!r || H.value)) {
        H.value = o.id, K.value = "";
        try {
          const d = `${r.replace(/\/+$/, "")}/${encodeURIComponent(o.id)}`, { data: s } = await ht.delete(d);
          if (s && typeof s == "object" && s.success === !1) {
            K.value = jt(s, null);
            return;
          }
          Yt(o.id, s), Y.value = "", J.value = !1, await Z();
        } catch (d) {
          K.value = jt(null, d);
        } finally {
          H.value = "";
        }
      }
    }
    function Ht(o) {
      if (typeof o == "string") return o;
      if (!o || typeof o != "object") return "";
      const r = o;
      return e(r.thread_id || r.webhook_id || r.component_id || r.id).trim();
    }
    function Qt(o) {
      if (!o || typeof o != "object") return "";
      const r = o;
      return e(r.label || r.title || r.name).trim();
    }
    function Pt() {
      it.value && (lt.value = !0);
    }
    function It() {
      lt.value = !1;
    }
    async function Xt(o) {
      const r = Ht(o);
      if (lt.value = !1, J.value = !1, await Z(), r) {
        const d = I.value.find((y) => y.id === r);
        if (!d && _.value) {
          const y = "The created item has no published selection value in the catalog.";
          a("error", { message: y, error: new Error(y) });
          return;
        }
        const s = d || { id: r, label: Qt(o) || ft.value, icon: "tabler:components", selection: { thread_id: r } };
        I.value.find((y) => y.id === r) || (I.value = [s, ...I.value]), $t(s), a("created", { thread_id: r });
      }
    }
    bt(() => [n.value?.value, n.value?.config, n.value?.schema], () => {
      S.value = g(n.value?.config) || g(n.value?.value), qt();
    }, { immediate: !0 }), bt(() => [n.value?.threadClass, n.value?.implId, n.value?.meta, n.value?.source, n.value?.schema], () => {
      J.value = !1, I.value = [], R.value = null, Y.value = "", K.value = "", It(), B.value && Z();
    });
    function vt() {
      B.value = !B.value, B.value && !J.value && Z();
    }
    const { acceptDeletion: Yt } = Gn(I, (o) => o.id, void 0, (o) => {
      o === S.value && (S.value = "");
    });
    return (o, r) => (c(), b(q, null, [
      x("div", {
        ref_key: "ctrl",
        ref: _t,
        class: Q(["cp", B.value && "cp-open"]),
        role: "button",
        tabindex: "0",
        "aria-expanded": B.value,
        onClick: vt,
        onKeydown: [
          Dt(vt, ["enter"]),
          Dt(U(vt, ["prevent"]), ["space"])
        ]
      }, [
        w(j(A), {
          icon: ut.value?.icon || "tabler:message-circle",
          class: "cp-lead",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        x("span", {
          class: Q(["cp-value", !S.value && "cp-ph"])
        }, N(S.value ? Mt.value : wt.value), 3),
        w(j(A), {
          icon: B.value ? "tabler:chevron-up" : "tabler:chevron-down",
          class: "cp-caret",
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 42, Hn),
      w(fn, {
        open: B.value,
        "onUpdate:open": r[0] || (r[0] = (d) => B.value = d),
        anchor: _t.value,
        "min-width": 260,
        "max-height": 320
      }, {
        default: Ot(() => [
          x("div", Qn, [
            G.value && !I.value.length ? (c(), b("div", Xn, [
              w(j(A), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              r[1] || (r[1] = yt(" Loading…", -1))
            ])) : lt.value ? (c(), b("div", Yn, [
              w(pn, {
                tag: it.value,
                onCreated: Xt,
                onClose: It
              }, null, 8, ["tag"])
            ])) : I.value.length ? (c(), b(q, { key: 3 }, [
              x("div", to, [
                (c(!0), b(q, null, an(I.value, (d) => (c(), b("div", {
                  key: d.id,
                  class: Q(["cp-row cp-row--compound", d.id === S.value && "cp-row-on"])
                }, [
                  x("button", {
                    type: "button",
                    class: "cp-row-main",
                    disabled: !!d.deleting_at,
                    onClick: (s) => $t(d)
                  }, [
                    w(j(A), {
                      icon: d.icon,
                      class: "cp-ico",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    x("span", oo, N(d.label), 1),
                    d.id === S.value ? (c(), ct(j(A), {
                      key: 0,
                      icon: "tabler:check",
                      class: "cp-check",
                      "aria-hidden": "true"
                    })) : L("", !0)
                  ], 8, no),
                  w(Wn, {
                    state: d,
                    onRetry: (s) => Ct(d)
                  }, null, 8, ["state", "onRetry"]),
                  F.value && !d.deleting_at ? (c(), b(q, { key: 0 }, [
                    Y.value === d.id ? (c(), b(q, { key: 0 }, [
                      x("button", {
                        type: "button",
                        class: "cp-row-del cp-row-del-yes",
                        disabled: H.value === d.id,
                        title: "Confirm delete",
                        "aria-label": "Confirm delete",
                        "data-test": "cp-del-confirm",
                        onClick: U((s) => Ct(d), ["stop"])
                      }, [
                        w(j(A), {
                          icon: H.value === d.id ? "tabler:loader-2" : "tabler:check",
                          class: Q(H.value === d.id && "spin"),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"])
                      ], 8, eo),
                      x("button", {
                        type: "button",
                        class: "cp-row-del",
                        title: "Cancel",
                        "aria-label": "Cancel delete",
                        onClick: U(Gt, ["stop"])
                      }, [
                        w(j(A), {
                          icon: "tabler:x",
                          "aria-hidden": "true"
                        })
                      ])
                    ], 64)) : (c(), b("button", {
                      key: 1,
                      type: "button",
                      class: "cp-row-del",
                      title: "Delete",
                      "aria-label": "Delete",
                      "data-test": "cp-del",
                      onClick: U((s) => Jt(d), ["stop"])
                    }, [
                      w(j(A), {
                        icon: "tabler:trash",
                        "aria-hidden": "true"
                      })
                    ], 8, ro))
                  ], 64)) : L("", !0)
                ], 2))), 128)),
                K.value ? (c(), b("div", ao, N(K.value), 1)) : L("", !0)
              ]),
              it.value ? (c(), b("button", {
                key: 0,
                type: "button",
                class: "cp-create-foot",
                "data-test": "cp-create-foot",
                onClick: U(Pt, ["stop"])
              }, [
                w(j(A), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                x("span", null, N(xt.value), 1)
              ])) : L("", !0)
            ], 64)) : (c(), b("div", Zn, [
              x("span", null, N(Vt.value), 1),
              it.value ? (c(), b("button", {
                key: 0,
                type: "button",
                class: "cp-create-btn",
                "data-test": "cp-create",
                onClick: U(Pt, ["stop"])
              }, [
                w(j(A), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                x("span", null, N(xt.value), 1)
              ])) : L("", !0)
            ]))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
export {
  fo as default
};
//# sourceMappingURL=ComponentPicker-Buut9rZP.js.map
