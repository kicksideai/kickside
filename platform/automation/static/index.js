import { e as re, _ as _o, W as Me, u as $o, a as Co, c as So, b as zo } from "./errMsg-CFwf-kA2.js";
import { B as De, l as Pt, s as It, a as je, f as me, R as Et, b as Po, c as At, L as Io, d as fe, v as ke, e as Eo, U as Ao, I as gt, g as Do, r as Dt, h as Lo, i as Mo, j as Ro, k as To, C as Oo, m as jo, S as Bo, _ as Fo, x as We, W as No, n as Uo, o as Ho, P as Vo } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DdaB0Y7l.js";
import { openBlock as s, createElementBlock as d, mergeProps as H, renderSlot as Q, createTextVNode as le, toDisplayString as g, resolveComponent as Re, resolveDirective as Lt, withDirectives as ue, createBlock as N, resolveDynamicComponent as Te, withCtx as F, createCommentVNode as h, normalizeClass as q, createElementVNode as l, computed as D, createVNode as I, Transition as Ko, Fragment as Y, defineComponent as ge, unref as r, isRef as qo, vModelText as Ge, renderList as ee, vModelCheckbox as Mt, vModelDynamic as Wo, ref as j, watch as Je, onBeforeUnmount as Rt, nextTick as Ye } from "vue";
import { Icon as O } from "@iconify/vue";
import { api as pe, host as Xe, loadByTagName as Yo, on as Zo, define as Go } from "@wippy-fe/proxy";
import { r as Jo } from "./principals-Bury5BH3.js";
var Xo = `
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
`, Qo = {
  root: function(t) {
    var o = t.props, n = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": It(o.value) && String(o.value).length === 1,
      "p-badge-dot": Pt(o.value) && !n.$slots.default,
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
}, en = De.extend({
  name: "badge",
  style: Xo,
  classes: Qo
}), tn = {
  name: "BaseBadge",
  extends: je,
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
  style: en,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Ce(e) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ce(e);
}
function vt(e, t, o) {
  return (t = on(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function on(e) {
  var t = nn(e, "string");
  return Ce(t) == "symbol" ? t : t + "";
}
function nn(e, t) {
  if (Ce(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Ce(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Tt = {
  name: "Badge",
  extends: tn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return me(vt(vt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, rn = ["data-p"];
function an(e, t, o, n, i, a) {
  return s(), d("span", H({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [Q(e.$slots, "default", {}, function() {
    return [le(g(e.value), 1)];
  })], 16, rn);
}
Tt.render = an;
var sn = `
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
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function se(e, t, o) {
  return (t = ln(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function ln(e) {
  var t = cn(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function cn(e, t) {
  if (Se(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Se(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var dn = {
  root: function(t) {
    var o = t.instance, n = t.props;
    return ["p-button p-component", se(se(se(se(se(se(se(se(se({
      "p-button-icon-only": o.hasIcon && !n.label && !n.badge,
      "p-button-vertical": (n.iconPos === "top" || n.iconPos === "bottom") && n.label,
      "p-button-loading": n.loading,
      "p-button-link": n.link || n.variant === "link"
    }, "p-button-".concat(n.severity), n.severity), "p-button-raised", n.raised), "p-button-rounded", n.rounded), "p-button-text", n.text || n.variant === "text"), "p-button-outlined", n.outlined || n.variant === "outlined"), "p-button-sm", n.size === "small"), "p-button-lg", n.size === "large"), "p-button-plain", n.plain), "p-button-fluid", o.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var o = t.props;
    return ["p-button-icon", se({}, "p-button-icon-".concat(o.iconPos), o.label)];
  },
  label: "p-button-label"
}, un = De.extend({
  name: "button",
  style: sn,
  classes: dn
}), pn = {
  name: "BaseButton",
  extends: je,
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
  style: un,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function ze(e) {
  "@babel/helpers - typeof";
  return ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ze(e);
}
function X(e, t, o) {
  return (t = bn(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function bn(e) {
  var t = fn(e, "string");
  return ze(t) == "symbol" ? t : t + "";
}
function fn(e, t) {
  if (ze(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (ze(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var J = {
  name: "Button",
  extends: pn,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      var o = t === "root" ? this.ptmi : this.ptm;
      return o(t, {
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
      return H(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Pt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return me(X(X(X(X(X(X(X(X(X(X({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return me(X(X({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return me(X(X({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Po,
    Badge: Tt
  },
  directives: {
    ripple: Et
  }
}, mn = ["data-p"], gn = ["data-p"];
function vn(e, t, o, n, i, a) {
  var f = Re("SpinnerIcon"), m = Re("Badge"), w = Lt("ripple");
  return e.asChild ? Q(e.$slots, "default", {
    key: 1,
    class: q(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : ue((s(), N(Te(e.as), H({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: F(function() {
      return [Q(e.$slots, "default", {}, function() {
        return [e.loading ? Q(e.$slots, "loadingicon", H({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (s(), d("span", H({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (s(), N(f, H({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : Q(e.$slots, "icon", H({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (s(), d("span", H({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, mn)) : h("", !0)];
        }), e.label ? (s(), d("span", H({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), g(e.label), 17, gn)) : h("", !0), e.badge ? (s(), N(m, {
          key: 3,
          value: e.badge,
          class: q(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : h("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[w]]);
}
J.render = vn;
var Ot = {
  name: "WindowMaximizeIcon",
  extends: At
};
function hn(e) {
  return wn(e) || kn(e) || yn(e) || xn();
}
function xn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yn(e, t) {
  if (e) {
    if (typeof e == "string") return Qe(e, t);
    var o = {}.toString.call(e).slice(8, -1);
    return o === "Object" && e.constructor && (o = e.constructor.name), o === "Map" || o === "Set" ? Array.from(e) : o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? Qe(e, t) : void 0;
  }
}
function kn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function wn(e) {
  if (Array.isArray(e)) return Qe(e);
}
function Qe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var o = 0, n = Array(t); o < t; o++) n[o] = e[o];
  return n;
}
function _n(e, t, o, n, i, a) {
  return s(), d("svg", H({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), hn(t[0] || (t[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ot.render = _n;
var jt = {
  name: "WindowMinimizeIcon",
  extends: At
};
function $n(e) {
  return Pn(e) || zn(e) || Sn(e) || Cn();
}
function Cn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Sn(e, t) {
  if (e) {
    if (typeof e == "string") return et(e, t);
    var o = {}.toString.call(e).slice(8, -1);
    return o === "Object" && e.constructor && (o = e.constructor.name), o === "Map" || o === "Set" ? Array.from(e) : o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? et(e, t) : void 0;
  }
}
function zn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Pn(e) {
  if (Array.isArray(e)) return et(e);
}
function et(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var o = 0, n = Array(t); o < t; o++) n[o] = e[o];
  return n;
}
function In(e, t, o, n, i, a) {
  return s(), d("svg", H({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), $n(t[0] || (t[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
jt.render = In;
var En = De.extend({
  name: "focustrap-directive"
}), An = Eo.extend({
  style: En
});
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function ht(e, t) {
  var o = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), o.push.apply(o, n);
  }
  return o;
}
function xt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var o = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ht(Object(o), !0).forEach(function(n) {
      Dn(e, n, o[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(o)) : ht(Object(o)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(o, n));
    });
  }
  return e;
}
function Dn(e, t, o) {
  return (t = Ln(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function Ln(e) {
  var t = Mn(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function Mn(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Pe(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Rn = An.extend("focustrap", {
  mounted: function(t, o) {
    var n = o.value || {}, i = n.disabled;
    i || (this.createHiddenFocusableElements(t, o), this.bind(t, o), this.autoElementFocus(t, o)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, o) {
    var n = o.value || {}, i = n.disabled;
    i && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, o) {
      var n = this, i = o.value || {}, a = i.onFocusIn, f = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(m) {
        m.forEach(function(w) {
          if (w.type === "childList" && !t.contains(document.activeElement)) {
            var u = function(x) {
              var _ = gt(x) ? gt(x, n.getComputedSelector(t.$_pfocustrap_focusableselector)) ? x : ke(t, n.getComputedSelector(t.$_pfocustrap_focusableselector)) : ke(x);
              return It(_) ? _ : x.nextSibling && u(x.nextSibling);
            };
            fe(u(w.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(m) {
        return a && a(m);
      }, t.$_pfocustrap_focusoutlistener = function(m) {
        return f && f(m);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: xt(xt({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, o) {
      var n = o.value || {}, i = n.autoFocusSelector, a = i === void 0 ? "" : i, f = n.firstFocusableSelector, m = f === void 0 ? "" : f, w = n.autoFocus, u = w === void 0 ? !1 : w, z = ke(t, "[autofocus]".concat(this.getComputedSelector(a)));
      u && !z && (z = ke(t, this.getComputedSelector(m))), fe(z);
    },
    onFirstHiddenElementFocus: function(t) {
      var o, n = t.currentTarget, i = t.relatedTarget, a = i === n.$_pfocustrap_lasthiddenfocusableelement || !((o = this.$el) !== null && o !== void 0 && o.contains(i)) ? ke(n.parentElement, this.getComputedSelector(n.$_pfocustrap_focusableselector)) : n.$_pfocustrap_lasthiddenfocusableelement;
      fe(a);
    },
    onLastHiddenElementFocus: function(t) {
      var o, n = t.currentTarget, i = t.relatedTarget, a = i === n.$_pfocustrap_firsthiddenfocusableelement || !((o = this.$el) !== null && o !== void 0 && o.contains(i)) ? Io(n.parentElement, this.getComputedSelector(n.$_pfocustrap_focusableselector)) : n.$_pfocustrap_firsthiddenfocusableelement;
      fe(a);
    },
    createHiddenFocusableElements: function(t, o) {
      var n = this, i = o.value || {}, a = i.tabIndex, f = a === void 0 ? 0 : a, m = i.firstFocusableSelector, w = m === void 0 ? "" : m, u = i.lastFocusableSelector, z = u === void 0 ? "" : u, x = function(M) {
        return Ao("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: f,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: M?.bind(n)
        });
      }, _ = x(this.onFirstHiddenElementFocus), p = x(this.onLastHiddenElementFocus);
      _.$_pfocustrap_lasthiddenfocusableelement = p, _.$_pfocustrap_focusableselector = w, _.setAttribute("data-pc-section", "firstfocusableelement"), p.$_pfocustrap_firsthiddenfocusableelement = _, p.$_pfocustrap_focusableselector = z, p.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(_), t.append(p);
    }
  }
});
function yt() {
  Lo({
    variableName: Dt("scrollbar.width").name
  });
}
function kt() {
  Do({
    variableName: Dt("scrollbar.width").name
  });
}
var Tn = `
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
`, On = {
  mask: function(t) {
    var o = t.position, n = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: o === "left" || o === "topleft" || o === "bottomleft" ? "flex-start" : o === "right" || o === "topright" || o === "bottomright" ? "flex-end" : "center",
      alignItems: o === "top" || o === "topleft" || o === "topright" ? "flex-start" : o === "bottom" || o === "bottomleft" || o === "bottomright" ? "flex-end" : "center",
      pointerEvents: n ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, jn = {
  mask: function(t) {
    var o = t.props, n = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], i = n.find(function(a) {
      return a === o.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": o.modal
    }, i ? "p-dialog-".concat(i) : ""];
  },
  root: function(t) {
    var o = t.props, n = t.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": o.maximizable && n.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, Bn = De.extend({
  name: "dialog",
  style: Tn,
  classes: jn,
  inlineStyles: On
}), Fn = {
  name: "BaseDialog",
  extends: je,
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
  style: Bn,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, $e = {
  name: "Dialog",
  extends: Fn,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: D(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && We.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && We.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && No(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), fe(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && We.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
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
      }, o = this.$slots.footer && t(this.footerContainer);
      o || (o = this.$slots.header && t(this.headerContainer), o || (o = this.$slots.default && t(this.content), o || (this.maximizable ? (this.focusableMax = !0, o = this.maximizableButton) : (this.focusableClose = !0, o = this.closeButton)))), o && fe(o, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? yt() : kt());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && yt();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && kt();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Fo(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
        var o = "";
        for (var n in this.breakpoints)
          o += `
                        @media screen and (max-width: `.concat(n, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[n], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = o;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(t) {
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Bo(document.body, {
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
      this.documentDragListener = function(o) {
        if (t.dragging) {
          var n = To(t.container), i = Oo(t.container), a = o.pageX - t.lastPageX, f = o.pageY - t.lastPageY, m = t.container.getBoundingClientRect(), w = m.left + a, u = m.top + f, z = jo(), x = getComputedStyle(t.container), _ = parseFloat(x.marginLeft), p = parseFloat(x.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (w >= t.minX && w + n < z.width && (t.lastPageX = o.pageX, t.container.style.left = w - _ + "px"), u >= t.minY && u + i < z.height && (t.lastPageY = o.pageY, t.container.style.top = u - p + "px")) : (t.lastPageX = o.pageX, t.container.style.left = w - _ + "px", t.lastPageY = o.pageY, t.container.style.top = u - p + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var t = this;
      this.documentDragEndListener = function(o) {
        t.dragging && (t.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !t.isUnstyled && (document.body.style["user-select"] = ""), t.$emit("dragend", o));
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
      return me({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Et,
    focustrap: Rn
  },
  components: {
    Button: J,
    Portal: Ro,
    WindowMinimizeIcon: jt,
    WindowMaximizeIcon: Ot,
    TimesIcon: Mo
  }
};
function Ie(e) {
  "@babel/helpers - typeof";
  return Ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ie(e);
}
function wt(e, t) {
  var o = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), o.push.apply(o, n);
  }
  return o;
}
function _t(e) {
  for (var t = 1; t < arguments.length; t++) {
    var o = arguments[t] != null ? arguments[t] : {};
    t % 2 ? wt(Object(o), !0).forEach(function(n) {
      Nn(e, n, o[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(o)) : wt(Object(o)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(o, n));
    });
  }
  return e;
}
function Nn(e, t, o) {
  return (t = Un(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function Un(e) {
  var t = Hn(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function Hn(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Ie(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Vn = ["data-p"], Kn = ["aria-labelledby", "aria-modal", "data-p"], qn = ["id"], Wn = ["data-p"];
function Yn(e, t, o, n, i, a) {
  var f = Re("Button"), m = Re("Portal"), w = Lt("focustrap");
  return s(), N(m, {
    appendTo: e.appendTo
  }, {
    default: F(function() {
      return [i.containerVisible ? (s(), d("div", H({
        key: 0,
        ref: a.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return a.onMaskMouseDown && a.onMaskMouseDown.apply(a, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return a.onMaskMouseUp && a.onMaskMouseUp.apply(a, arguments);
        }),
        "data-p": a.dataP
      }, e.ptm("mask")), [I(Ko, H({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: F(function() {
          return [e.visible ? ue((s(), d("div", H({
            key: 0,
            ref: a.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": a.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": a.dataP
          }, e.ptmi("root")), [e.$slots.container ? Q(e.$slots, "container", {
            key: 0,
            closeCallback: a.close,
            maximizeCallback: function(z) {
              return a.maximize(z);
            },
            initDragCallback: a.initDrag
          }) : (s(), d(Y, {
            key: 1
          }, [e.showHeader ? (s(), d("div", H({
            key: 0,
            ref: a.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, e.ptm("header")), [Q(e.$slots, "header", {
            class: q(e.cx("title"))
          }, function() {
            return [e.header ? (s(), d("span", H({
              key: 0,
              id: a.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), g(e.header), 17, qn)) : h("", !0)];
          }), l("div", H({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? Q(e.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(z) {
              return a.maximize(z);
            }
          }, function() {
            return [I(f, H({
              ref: a.maximizableRef,
              autofocus: i.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: a.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: F(function(u) {
                return [Q(e.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(s(), N(Te(a.maximizeIconComponent), H({
                    class: [u.class, i.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : h("", !0), e.closable ? Q(e.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [I(f, H({
              ref: a.closeButtonRef,
              autofocus: i.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: a.close,
              "aria-label": a.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: F(function(u) {
                return [Q(e.$slots, "closeicon", {}, function() {
                  return [(s(), N(Te(e.closeIcon ? "span" : "TimesIcon"), H({
                    class: [e.closeIcon, u.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : h("", !0)], 16)], 16)) : h("", !0), l("div", H({
            ref: a.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": a.dataP
          }, _t(_t({}, e.contentProps), e.ptm("content"))), [Q(e.$slots, "default")], 16, Wn), e.footer || e.$slots.footer ? (s(), d("div", H({
            key: 1,
            ref: a.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [Q(e.$slots, "footer", {}, function() {
            return [le(g(e.footer), 1)];
          })], 16)) : h("", !0)], 64))], 16, Kn)), [[w, {
            disabled: !e.modal
          }]]) : h("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Vn)) : h("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
$e.render = Yn;
var Zn = `
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
`, Gn = {
  root: function(t) {
    var o = t.props;
    return ["p-tag p-component", {
      "p-tag-info": o.severity === "info",
      "p-tag-success": o.severity === "success",
      "p-tag-warn": o.severity === "warn",
      "p-tag-danger": o.severity === "danger",
      "p-tag-secondary": o.severity === "secondary",
      "p-tag-contrast": o.severity === "contrast",
      "p-tag-rounded": o.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, Jn = De.extend({
  name: "tag",
  style: Zn,
  classes: Gn
}), Xn = {
  name: "BaseTag",
  extends: je,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Jn,
  provide: function() {
    return {
      $pcTag: this,
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
function Qn(e, t, o) {
  return (t = er(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function er(e) {
  var t = tr(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function tr(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Ee(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var nt = {
  name: "Tag",
  extends: Xn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return me(Qn({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, or = ["data-p"];
function nr(e, t, o, n, i, a) {
  return s(), d("span", H({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (s(), N(Te(e.$slots.icon), H({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (s(), d("span", H({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : h("", !0), e.value != null || e.$slots.default ? Q(e.$slots, "default", {
    key: 2
  }, function() {
    return [l("span", H({
      class: e.cx("label")
    }, e.ptm("label")), g(e.value), 17)];
  }) : h("", !0)], 16, or);
}
nt.render = nr;
function rr(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const o = e.trim();
    if (/^\d+$/.test(o))
      t = Number(o);
    else {
      const n = Date.parse(o);
      return Number.isNaN(n) ? null : n;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function ce(e, t) {
  const o = rr(e);
  if (o === null) return "";
  const n = t?.now ?? Date.now(), i = t?.suffix ?? !0, a = t?.maxUnit ?? "day", f = t?.future ?? !1, m = 6e4, w = 60 * m, u = 24 * w, z = 30 * u, x = 365 * u, _ = n - o;
  if (f && _ < 0) {
    const M = -_;
    return M < m ? "in <1m" : M < w ? `in ${Math.floor(M / m)}m` : M < u ? `in ${Math.floor(M / w)}h` : `in ${Math.floor(M / u)}d`;
  }
  const p = Math.max(0, _);
  if (p < m) return "just now";
  const y = i ? " ago" : "";
  return p < w ? `${Math.floor(p / m)}m${y}` : p < u ? `${Math.floor(p / w)}h${y}` : a === "year" ? p < z ? `${Math.floor(p / u)}d${y}` : p < x ? `${Math.floor(p / z)}mo${y}` : `${Math.floor(p / x)}y${y}` : `${Math.floor(p / u)}d${y}`;
}
function ar(e) {
  return D(() => {
    const t = e.value;
    return t ? (typeof t.parentId == "string" ? t.parentId : "").trim() : "";
  });
}
function ir(e) {
  if (e == null || e === "") return {};
  const t = typeof e == "string" ? JSON.parse(e) : e;
  if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("Install input must be an object.");
  return t;
}
function tt(e) {
  return String(e.description || "").trim();
}
function Bt(e) {
  const t = e?.tag_name;
  return typeof t == "string" ? t.trim() : "";
}
function Ft(e) {
  const t = typeof e?.base_path == "string" ? e.base_path.trim() : "", o = typeof e?.entry_point == "string" ? e.entry_point.trim() : "";
  return t && o ? `/${t}/${o}` : typeof e?.url == "string" ? e.url.trim() : "";
}
function ot(e) {
  return Bt(e?.component?.create_ui);
}
function sr(e) {
  return Ft(e?.component?.create_ui);
}
function rt(e) {
  return Bt(e?.component?.manage_ui);
}
function Nt(e) {
  return Ft(e?.component?.manage_ui);
}
function Ut(e, t) {
  return { id: e.id, automation: e, public_state: e.public_state || {}, type: t };
}
let $t = 0;
function lr(e) {
  e && ($t += 1, e.setAttribute("submit-nonce", String($t)));
}
function at(e) {
  const t = e.inputs?.properties || {};
  return Object.entries(t);
}
function it(e, t) {
  return (e.inputs?.required || []).includes(t);
}
function cr(e) {
  return e.type === "password" || e.format === "password" || e.sensitive === !0 ? "password" : "text";
}
function Ct(e) {
  const t = {};
  for (const [o, n] of at(e))
    n.default !== void 0 ? t[o] = n.default : n.type === "boolean" ? t[o] = !1 : t[o] = "";
  return t;
}
function dr(e, t) {
  for (const o of e.inputs?.required || []) {
    const n = t[o];
    if (n === "" || n === void 0 || n === null)
      return `${e.inputs?.properties?.[o]?.title || o} is required.`;
  }
  for (const [o, n] of at(e)) {
    const i = t[o];
    if (i === "" || i === void 0 || n.type !== "object" && n.type !== "array") continue;
    let a = i;
    if (typeof i == "string")
      try {
        a = JSON.parse(i);
      } catch {
        return `${n.title || o} must be a JSON ${n.type}.`;
      }
    if (n.type === "array" ? !Array.isArray(a) : a === null || typeof a != "object" || Array.isArray(a))
      return `${n.title || o} must be a JSON ${n.type}.`;
  }
  return "";
}
function ur(e, t) {
  const o = {};
  for (const [n, i] of Object.entries(t)) {
    if (i === "" && !it(e, n)) continue;
    const a = e.inputs?.properties?.[n];
    o[n] = (a?.type === "object" || a?.type === "array") && typeof i == "string" ? JSON.parse(i) : i;
  }
  return o;
}
function pr(e, t) {
  return e.enum_labels?.[t] || t;
}
function br(e, t, o) {
  const n = (o.enum || []).map((i) => ({ label: pr(o, i), value: i }));
  return it(e, t) ? n : [{ label: "—", value: "" }, ...n];
}
const fr = { class: "kx-modal-head-icon" }, mr = { class: "kx-modal-head-text" }, gr = { class: "kx-modal-head-title" }, vr = {
  key: 0,
  class: "kx-2p-l"
}, hr = { class: "kx-cat-search" }, xr = {
  key: 0,
  class: "kx-cat-empty"
}, yr = {
  key: 1,
  class: "kx-cat"
}, kr = ["onClick"], wr = { class: "kx-cat-ico" }, _r = { class: "kx-cat-text" }, $r = { class: "kx-cat-name" }, Cr = {
  key: 0,
  class: "kx-cat-desc"
}, Sr = { class: "kx-2p-r" }, zr = {
  key: 0,
  class: "kx-2p-r-head"
}, Pr = { class: "kx-2p-r-body" }, Ir = {
  key: 0,
  class: "kx-2p-r-note"
}, Er = {
  key: 1,
  class: "kx-2p-r-note"
}, Ar = {
  key: 2,
  class: "kx-form"
}, Dr = { class: "kx-field-lbl" }, Lr = {
  key: 0,
  class: "kx-req",
  "aria-hidden": "true"
}, Mr = ["onUpdate:modelValue"], Rr = ["onUpdate:modelValue"], Tr = ["onUpdate:modelValue", "type", "placeholder"], Or = {
  key: 4,
  class: "kx-field-hint"
}, jr = {
  key: 5,
  class: "kx-field-hint"
}, Br = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, Fr = /* @__PURE__ */ ge({
  __name: "InstallDialog",
  props: {
    flow: {},
    componentMode: { type: Boolean },
    dialogPt: {}
  },
  setup(e) {
    const t = e, {
      showTypeCatalog: o,
      installFields: n,
      showInstall: i,
      installType: a,
      installForm: f,
      installing: m,
      customSaving: w,
      installError: u,
      customInstallHost: z,
      installSearchInput: x,
      typeSearch: _,
      filteredTypes: p,
      chooseType: y,
      closeInstall: M,
      focusInstallDialog: W,
      onCreate: K
    } = t.flow;
    return (ne, G) => (s(), N(r($e), {
      visible: r(i),
      modal: !0,
      "block-scroll": !0,
      "dismissable-mask": !0,
      pt: e.dialogPt,
      class: q(["kx-modal kx-modal-2p", { "kx-modal-solo": !r(o) }]),
      "aria-label": "Add an automation",
      "onUpdate:visible": G[1] || (G[1] = (A) => {
        A || r(M)();
      }),
      onShow: r(W)
    }, {
      header: F(() => [
        l("span", fr, [
          I(r(O), {
            icon: r(a) && r(a).icon || "tabler:bolt",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        l("span", mr, [
          l("span", gr, g(r(a) ? r(a).title || r(a).name : "Add an automation"), 1),
          G[2] || (G[2] = l("span", { class: "kx-modal-head-sub" }, "Configure an automation.", -1))
        ])
      ]),
      footer: F(() => [
        r(u) ? (s(), d("div", Br, g(r(u)), 1)) : h("", !0),
        I(r(J), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: r(m) || r(w),
          onClick: r(M)
        }, null, 8, ["disabled", "onClick"]),
        r(a) ? (s(), N(r(J), {
          key: 1,
          type: "button",
          "data-testid": "automations-install-create",
          label: r(m) || r(w) ? "Creating…" : "Create",
          loading: r(m) || r(w),
          disabled: r(m) || r(w),
          onClick: r(K)
        }, {
          icon: F(({ class: A }) => [
            I(r(O), {
              icon: "tabler:plus",
              class: q(A),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["label", "loading", "disabled", "onClick"])) : h("", !0)
      ]),
      default: F(() => [
        l("div", {
          class: q(["kx-2p", { "kx-2p-solo": !r(o) }])
        }, [
          r(o) ? (s(), d("div", vr, [
            l("div", hr, [
              I(r(O), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              ue(l("input", {
                ref_key: "installSearchInput",
                ref: x,
                "onUpdate:modelValue": G[0] || (G[0] = (A) => qo(_) ? _.value = A : null),
                "data-modal-initial": "",
                type: "text",
                placeholder: "Search types…",
                "aria-label": "Search automation types"
              }, null, 512), [
                [Ge, r(_)]
              ])
            ]),
            r(p).length ? (s(), d("div", yr, [
              (s(!0), d(Y, null, ee(r(p), (A) => (s(), d("button", {
                key: A.id,
                class: q(["kx-cat-card", r(a)?.id === A.id && "sel"]),
                onClick: (U) => r(y)(A)
              }, [
                l("span", wr, [
                  I(r(O), {
                    icon: A.icon || "tabler:sparkles",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                l("span", _r, [
                  l("span", $r, g(A.title || A.name), 1),
                  r(tt)(A) ? (s(), d("span", Cr, g(r(tt)(A)), 1)) : h("", !0)
                ]),
                I(r(O), {
                  icon: "tabler:check",
                  class: "kx-cat-check",
                  "aria-hidden": "true"
                })
              ], 10, kr))), 128))
            ])) : (s(), d("div", xr, "No setups match “" + g(r(_)) + "”.", 1))
          ])) : h("", !0),
          l("div", Sr, [
            r(o) ? (s(), d("div", zr, "Setup")) : h("", !0),
            l("div", Pr, [
              r(a) ? (s(), d(Y, { key: 1 }, [
                r(ot)(r(a)) ? (s(), d("div", {
                  key: 0,
                  ref_key: "customInstallHost",
                  ref: z,
                  class: "kx-custom-host"
                }, null, 512)) : r(n).length ? (s(), d("div", Ar, [
                  (s(!0), d(Y, null, ee(r(n), ([A, U]) => (s(), d("label", {
                    key: A,
                    class: "kx-field"
                  }, [
                    l("span", Dr, [
                      le(g(U.title || A) + " ", 1),
                      r(it)(r(a), A) ? (s(), d("span", Lr, "*")) : h("", !0)
                    ]),
                    U.enum ? (s(), N(r(Uo), {
                      key: 0,
                      class: "kx-select",
                      "model-value": r(f)[A],
                      options: r(br)(r(a), A, U),
                      "option-label": "label",
                      "option-value": "value",
                      placeholder: "—",
                      "aria-label": U.title || A,
                      "onUpdate:modelValue": ($) => r(f)[A] = $
                    }, null, 8, ["model-value", "options", "aria-label", "onUpdate:modelValue"])) : U.type === "boolean" ? ue((s(), d("input", {
                      key: 1,
                      "onUpdate:modelValue": ($) => r(f)[A] = $,
                      class: "kx-check",
                      type: "checkbox"
                    }, null, 8, Mr)), [
                      [Mt, r(f)[A]]
                    ]) : U.type === "number" || U.type === "integer" ? ue((s(), d("input", {
                      key: 2,
                      "onUpdate:modelValue": ($) => r(f)[A] = $,
                      class: "kx-input",
                      type: "number"
                    }, null, 8, Rr)), [
                      [
                        Ge,
                        r(f)[A],
                        void 0,
                        { number: !0 }
                      ]
                    ]) : ue((s(), d("input", {
                      key: 3,
                      "onUpdate:modelValue": ($) => r(f)[A] = $,
                      class: "kx-input",
                      type: r(cr)(U),
                      placeholder: U.description || ""
                    }, null, 8, Tr)), [
                      [Wo, r(f)[A]]
                    ]),
                    U.description && !(U.type !== "boolean" && !U.enum) ? (s(), d("span", Or, g(U.description), 1)) : U.description && U.enum ? (s(), d("span", jr, g(U.description), 1)) : h("", !0)
                  ]))), 128))
                ])) : (s(), d("div", Er, "This automation needs no configuration."))
              ], 64)) : (s(), d("p", Ir, "Select an automation type to configure it."))
            ])
          ])
        ], 2)
      ]),
      _: 1
    }, 8, ["visible", "pt", "class", "onShow"]));
  }
}), Nr = {
  key: 0,
  class: "kx-metrics"
}, Ur = { class: "kx-metric-k" }, Hr = ["title"], Vr = {
  key: 1,
  class: "kx-metric-details"
}, Kr = { class: "kx-metrics kx-metrics-detail" }, qr = { class: "kx-metric-k" }, Wr = ["title"], Yr = /* @__PURE__ */ ge({
  __name: "RowMetrics",
  props: {
    face: { default: () => [] },
    detail: { default: () => [] }
  },
  setup(e) {
    return (t, o) => (s(), d(Y, null, [
      e.face.length ? (s(), d("div", Nr, [
        (s(!0), d(Y, null, ee(e.face, (n) => (s(), d("span", {
          key: n.label,
          class: "kx-metric"
        }, [
          n.icon ? (s(), N(r(O), {
            key: 0,
            icon: n.icon,
            class: "kx-metric-i",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : h("", !0),
          l("span", Ur, g(n.label), 1),
          l("span", {
            class: "kx-metric-v",
            title: n.title
          }, g(n.value), 9, Hr)
        ]))), 128))
      ])) : h("", !0),
      e.detail.length ? (s(), d("details", Vr, [
        o[0] || (o[0] = l("summary", { class: "kx-metric-more" }, "Details", -1)),
        l("div", Kr, [
          (s(!0), d(Y, null, ee(e.detail, (n) => (s(), d("span", {
            key: n.label,
            class: "kx-metric"
          }, [
            n.icon ? (s(), N(r(O), {
              key: 0,
              icon: n.icon,
              class: "kx-metric-i",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : h("", !0),
            l("span", qr, g(n.label), 1),
            l("span", {
              class: "kx-metric-v",
              title: n.title
            }, g(n.value), 9, Wr)
          ]))), 128))
        ])
      ])) : h("", !0)
    ], 64));
  }
}), Zr = /* @__PURE__ */ new Set(["pause", "resume"]), Gr = /* @__PURE__ */ new Set(["reconfigure"]), St = /* @__PURE__ */ new Set(["run_now", "trigger", "execute", "run"]), Ze = {
  run_now: { label: "Run now", description: "Wake the drive to process available work. Paused drives stay paused.", group: "run", icon: "tabler:player-play" },
  discard: { label: "Discard", description: "Select uncertain item keys to discard them.", group: "recovery", icon: "tabler:trash" },
  trigger: { label: "Run now", description: "Run this automation immediately.", group: "run", icon: "tabler:player-play" },
  execute: { label: "Run now", description: "Run this automation immediately.", group: "run", icon: "tabler:player-play" },
  run: { label: "Run now", description: "Run this automation immediately.", group: "run", icon: "tabler:player-play" },
  rewind: { label: "Rewind & reprocess", description: "Reset progress to the start and re-drain every item.", group: "recovery", icon: "tabler:rotate-clockwise-2", warn: !0 },
  resync: { label: "Resync", description: "Reset source progress and reconcile from scratch.", group: "recovery", icon: "tabler:refresh", warn: !0 },
  replay: { label: "Replay", description: "Retry failed, uncertain, or waiting items.", group: "recovery", icon: "tabler:player-track-next", warn: !0 },
  reconcile: { label: "Reconcile", description: "Recompute state against the source of truth.", group: "recovery", icon: "tabler:adjustments-check" },
  status: { label: "Refresh status", description: "Fetch the latest run status now.", group: "recovery", icon: "tabler:activity-heartbeat" }
};
function Ht(e) {
  return e.has("run_now") ? "run_now" : e.has("trigger") ? "trigger" : e.has("execute") ? "execute" : "";
}
function Jr(e) {
  return e.replace(/[._-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function zt(e) {
  return { label: Jr(e), description: "Run this action.", group: "recovery", icon: "tabler:bolt" };
}
function Vt(e) {
  return new Set([...e?.controls || [], ...e?.actions || []].map((t) => t.name).filter(Boolean));
}
function Kt(e) {
  const t = [...Vt(e)], o = !!rt(e);
  return {
    declared: t,
    requiresKeys: e?.controls?.filter((n) => n.keys_required).map((n) => n.name),
    runNow: Ht(new Set(t)),
    canReconfigure: o,
    // An automation is a component, so it shares through the generic component
    // access endpoints; the server is the authority on who may grant.
    canShare: !0,
    canExport: e?.exportable === !0,
    canDelete: !0
  };
}
function qt(e) {
  const t = e instanceof Set ? e : new Set(e);
  return t.has("rewind") ? "rewind" : t.has("resync") ? "resync" : "";
}
function Wt(e) {
  const t = [];
  if (e.runNow) {
    const n = Ze[e.runNow] || Ze.trigger;
    t.push({ method: e.runNow, ...n, kind: "call" });
  }
  const o = /* @__PURE__ */ new Set();
  for (const n of e.declared) {
    if (Zr.has(n) || n === e.runNow || e.runNow !== "run_now" && St.has(n) || Gr.has(n) || o.has(n)) continue;
    o.add(n);
    const i = e.runNow === "run_now" && St.has(n) ? { ...zt(n), group: "run" } : Ze[n] || zt(n);
    t.push({ method: n, ...i, kind: "call", disabled: e.requiresKeys?.includes(n) });
  }
  return e.canReconfigure && t.push({ method: "reconfigure", label: "Reconfigure", description: "Change how this automation is set up.", group: "edit", icon: "tabler:settings", kind: "reconfigure" }), e.canShare && t.push({ method: "share", label: "Share", description: "Give other people access to this automation.", group: "edit", icon: "tabler:users", kind: "share" }), e.canExport && t.push({ method: "export", label: "Export", description: "Download a portable copy to import elsewhere.", group: "edit", icon: "tabler:download", kind: "export" }), e.canDelete && t.push({ method: "delete", label: "Delete", description: "Stop it and remove its setup. This cannot be undone.", group: "delete", icon: "tabler:trash", kind: "delete", danger: !0 }), t;
}
const Xr = ["run", "recovery", "edit", "delete"], Qr = {
  run: "Run",
  recovery: "Recovery",
  edit: "Edit",
  delete: ""
};
function ea(e) {
  return Xr.map((t) => ({ group: t, label: Qr[t], items: e.filter((o) => o.group === t) })).filter((t) => t.items.length > 0);
}
function ta(e, t) {
  return e.group === "run" ? `Run ${t} now` : e.method === "reconfigure" ? `Edit ${t}` : `${e.label} ${t}`;
}
const oa = ["aria-label"], na = {
  key: 1,
  class: "kx-menu-sep",
  role: "separator"
}, ra = ["data-testid", "aria-label", "disabled", "onClick"], aa = { class: "kx-menu-item-body" }, ia = { class: "kx-menu-item-label" }, sa = { class: "kx-menu-item-desc" }, Yt = /* @__PURE__ */ ge({
  __name: "ActionMenu",
  props: {
    items: {},
    name: {},
    busy: { type: Boolean },
    size: {},
    triggerLabel: {}
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const o = e, n = t, i = j(!1), a = j(null), f = D(() => ea(o.items));
    function m() {
      i.value = !i.value;
    }
    function w() {
      i.value = !1;
    }
    function u(z) {
      w(), n("select", z.method);
    }
    return (z, x) => (s(), d("span", {
      ref_key: "trigger",
      ref: a,
      class: "kx-menu"
    }, [
      I(r(J), {
        type: "button",
        severity: "secondary",
        outlined: "",
        size: e.size === "normal" ? void 0 : "small",
        class: q(["kx-menu-trigger", i.value && "is-active"]),
        "aria-haspopup": !0,
        "aria-expanded": i.value,
        "aria-label": e.triggerLabel || `More actions for ${e.name}`,
        title: "More actions",
        onClick: m
      }, {
        icon: F(({ class: _ }) => [
          I(r(O), {
            icon: "tabler:dots",
            "aria-hidden": "true",
            class: q(_)
          }, null, 8, ["class"])
        ]),
        _: 1
      }, 8, ["size", "class", "aria-expanded", "aria-label"]),
      I(Ho, {
        open: i.value,
        "onUpdate:open": x[0] || (x[0] = (_) => i.value = _),
        anchor: a.value,
        align: "right",
        width: 264,
        "max-height": 460,
        gap: 6
      }, {
        default: F(() => [
          l("div", {
            class: "kx-menu-panel",
            role: "menu",
            "aria-label": `Actions for ${e.name}`
          }, [
            (s(!0), d(Y, null, ee(f.value, (_, p) => (s(), d(Y, {
              key: _.group
            }, [
              _.label ? (s(), d("div", {
                key: 0,
                class: q(["kx-menu-group", p === 0 && "is-first"])
              }, g(_.label), 3)) : p > 0 ? (s(), d("div", na)) : h("", !0),
              (s(!0), d(Y, null, ee(_.items, (y) => (s(), d("button", {
                key: y.method,
                type: "button",
                role: "menuitem",
                class: q(["kx-menu-item", [y.danger && "is-danger", y.warn && "is-warn"]]),
                "data-testid": `action-${y.method}`,
                "aria-label": r(ta)(y, e.name),
                disabled: y.disabled || e.busy && y.kind === "call",
                onClick: (M) => u(y)
              }, [
                I(r(O), {
                  icon: y.icon,
                  class: "kx-menu-item-ico",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                l("span", aa, [
                  l("span", ia, [
                    le(g(y.label) + " ", 1),
                    y.warn ? (s(), N(r(O), {
                      key: 0,
                      icon: "tabler:alert-triangle",
                      class: "kx-menu-item-warn",
                      "aria-hidden": "true"
                    })) : h("", !0)
                  ]),
                  l("span", sa, g(y.description), 1)
                ])
              ], 10, ra))), 128))
            ], 64))), 128))
          ], 8, oa)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 512));
  }
}), la = {
  "aria-label": "Execution history",
  class: "kx-history"
}, ca = {
  key: 0,
  role: "status"
}, da = {
  key: 1,
  role: "alert"
}, ua = { key: 0 }, pa = { key: 0 }, ba = ["title"], fa = ["title"], ma = { key: 1 }, ga = { key: 0 }, va = { key: 0 }, ha = ["title"], xa = { key: 1 }, ya = /* @__PURE__ */ ge({
  __name: "ExecutionHistory",
  props: {
    root: {}
  },
  emits: ["error"],
  setup(e, { emit: t }) {
    const o = e, n = t, i = j([]), a = j([]), f = j([]), m = j(""), w = j(""), u = j(!1), z = j("");
    let x = 0;
    function _() {
      i.value = [], a.value = [], f.value = [], m.value = "", w.value = "";
    }
    function p($) {
      return f.value.find((E) => E.type === $?.kind && E.id === $?.id)?.label || "Account unavailable";
    }
    function y($) {
      return {
        recorded: "Recorded admission",
        absent: "Identity evidence absent",
        inferred: "Identity evidence inferred; unverified",
        unresolved: "Identity unresolved"
      }[$.evidence_status];
    }
    function M($) {
      return JSON.stringify([$.drive_key, $.round_token, $.source_port, $.item_key, $.identity_key]);
    }
    function W($) {
      return re($, typeof $ == "string" ? $ : "");
    }
    async function K($, E, S = "") {
      const { data: R } = await pe.get(
        "/api/v1/automations/" + encodeURIComponent($) + "/history",
        { params: { kind: E, page_size: 25, ...S ? { page_token: S } : {} } }
      );
      if (!R.success || R.kind !== E || !Array.isArray(R.entries)) throw new Error(R.error?.message || "Could not read execution history");
      if (R.next_page_token && R.next_page_token === S) throw new Error("History page repeats its cursor");
      return R;
    }
    async function ne($, E) {
      const S = /* @__PURE__ */ new Map();
      function R(T) {
        T && (T.kind === "user" || T.kind === "group") && S.set(T.kind + ":" + T.id, { type: T.kind, id: T.id });
      }
      for (const T of $)
        R(T.evidence?.identity?.principal), R(T.evidence?.identity?.authorized_by);
      for (const T of E)
        T.initiation && R({ kind: "user", id: T.initiation.actor_id });
      return Jo([...S.values()]);
    }
    function G($) {
      _(), z.value = re($, "Could not read execution history"), n("error", { message: z.value, error: $ });
    }
    async function A() {
      const $ = ++x, E = o.root;
      if (_(), z.value = "", u.value = !1, !!E) {
        u.value = !0;
        try {
          const [S, R] = await Promise.all([K(E, "deliveries"), K(E, "controls")]), T = await ne(S.entries, R.entries);
          if ($ !== x) return;
          i.value = S.entries, a.value = R.entries, f.value = T, m.value = S.next_page_token || "", w.value = R.next_page_token || "";
        } catch (S) {
          $ === x && G(S);
        } finally {
          $ === x && (u.value = !1);
        }
      }
    }
    async function U($) {
      if (u.value) return;
      const E = x, S = o.root, R = $ === "deliveries" ? m.value : w.value;
      if (R) {
        u.value = !0, z.value = "";
        try {
          const T = await K(S, $, R), c = $ === "deliveries" ? [...i.value, ...T.entries] : i.value, L = $ === "controls" ? [...a.value, ...T.entries] : a.value, B = await ne(c, L);
          if (E !== x) return;
          i.value = c, a.value = L, f.value = B, $ === "deliveries" ? m.value = T.next_page_token || "" : w.value = T.next_page_token || "";
        } catch (T) {
          E === x && G(T);
        } finally {
          E === x && (u.value = !1);
        }
      }
    }
    return Je(() => o.root, () => {
      A();
    }, { immediate: !0 }), Rt(() => {
      x += 1;
    }), ($, E) => (s(), d("section", la, [
      u.value ? (s(), d("p", ca, "Loading execution history…")) : h("", !0),
      z.value ? (s(), d("p", da, g(z.value), 1)) : (s(), d(Y, { key: 2 }, [
        l("div", null, [
          E[4] || (E[4] = l("h3", null, "Committed deliveries", -1)),
          !u.value && !i.value.length ? (s(), d("p", ua, "No retained deliveries.")) : h("", !0),
          (s(!0), d(Y, null, ee(i.value, (S) => (s(), d("article", {
            key: M(S),
            class: "kx-history-entry"
          }, [
            l("strong", null, g(S.item_key) + " · " + g(S.state), 1),
            l("p", null, "Round starts " + g(r(ce)(S.round_at, { future: !0 })), 1),
            l("p", null, g(y(S)), 1),
            S.evidence?.identity ? (s(), d("dl", pa, [
              E[3] || (E[3] = l("dt", null, "Executor", -1)),
              l("dd", {
                title: S.evidence.identity.principal.id,
                "aria-label": "Historical executor"
              }, g(p(S.evidence.identity.principal)), 9, ba),
              S.evidence.identity.authorized_by ? (s(), d(Y, { key: 0 }, [
                E[2] || (E[2] = l("dt", null, "Authorized by", -1)),
                l("dd", {
                  title: S.evidence.identity.authorized_by.id,
                  "aria-label": "Historical authorizer"
                }, g(p(S.evidence.identity.authorized_by)), 9, fa)
              ], 64)) : h("", !0)
            ])) : h("", !0),
            W(S.error) ? (s(), d("p", ma, g(W(S.error)), 1)) : h("", !0)
          ]))), 128)),
          m.value ? (s(), N(r(J), {
            key: 1,
            label: "More deliveries",
            severity: "secondary",
            disabled: u.value,
            onClick: E[0] || (E[0] = (S) => U("deliveries"))
          }, null, 8, ["disabled"])) : h("", !0)
        ]),
        l("div", null, [
          E[6] || (E[6] = l("h3", null, "Control requests", -1)),
          E[7] || (E[7] = l("p", null, "Control requests and delivery admission are independent records.", -1)),
          !u.value && !a.value.length ? (s(), d("p", ga, "No retained control requests.")) : h("", !0),
          (s(!0), d(Y, null, ee(a.value, (S) => (s(), d("article", {
            key: `${S.generation}:${S.request_id}`,
            class: "kx-history-entry"
          }, [
            l("strong", null, g(S.state), 1),
            l("p", null, "Requested " + g(r(ce)(S.created_at, { future: !0 })), 1),
            S.initiation ? (s(), d("dl", va, [
              E[5] || (E[5] = l("dt", null, "Initiated by", -1)),
              l("dd", {
                title: S.initiation.actor_id,
                "aria-label": "Control initiator"
              }, g(p({ kind: "user", id: S.initiation.actor_id })), 9, ha)
            ])) : (s(), d("p", xa, "Initiator not recorded."))
          ]))), 128)),
          w.value ? (s(), N(r(J), {
            key: 1,
            label: "More control requests",
            severity: "secondary",
            disabled: u.value,
            onClick: E[1] || (E[1] = (S) => U("controls"))
          }, null, 8, ["disabled"])) : h("", !0)
        ])
      ], 64))
    ]));
  }
}), ka = /* @__PURE__ */ _o(ya, [["__scopeId", "data-v-3d5e957f"]]);
function Ae(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function wa(e) {
  return Ae(e) && typeof e.code == "string" && typeof e.message == "string" && typeof e.at == "string" && (e.item_key === void 0 || typeof e.item_key == "string");
}
function _a(e) {
  if (!Ae(e) || typeof e.drive_key != "string") return !1;
  for (const t of ["source_kind", "phase"])
    if (e[t] !== void 0 && typeof e[t] != "string") return !1;
  if (e.enabled !== void 0 && typeof e.enabled != "boolean") return !1;
  for (const t of ["next_run_at", "last_run_at", "last_round_at"])
    if (e[t] !== void 0 && e[t] !== null && typeof e[t] != "string") return !1;
  for (const t of ["unresolved_count", "uncertain_count"])
    if (e[t] !== void 0 && (typeof e[t] != "number" || !Number.isInteger(e[t]) || e[t] < 0)) return !1;
  return !(e.last_error !== void 0 && e.last_error !== null && (!Ae(e.last_error) || e.last_error.message !== void 0 && typeof e.last_error.message != "string"));
}
function $a(e) {
  if (!Ae(e) || e.success !== !0 || !Array.isArray(e.drives) || !e.drives.every(_a) || e.next_page_token !== void 0 && e.next_page_token !== null && (typeof e.next_page_token != "string" || !e.next_page_token)) return !1;
  const t = e.delivery_failures;
  return t === void 0 || Ae(t) && typeof t.count == "number" && Number.isInteger(t.count) && t.count >= 0 && (t.last_error === void 0 || wa(t.last_error));
}
const Zt = {
  blocked_identity: "The account this automation runs as needs to be confirmed.",
  blocked_access: "This automation lost access to something it uses.",
  blocked_declaration: "This automation's settings need to be fixed."
};
function Be(e) {
  return (e?.drives || []).filter((t) => t.source_kind !== "none");
}
function Gt(e) {
  return e.enabled === !1 || e.phase === "paused";
}
function Ca(e) {
  const t = Be(e), o = (e?.delivery_failures?.count || 0) > 0;
  return t.length ? t.some((n) => (n.phase || "") in Zt) ? { kind: "warn", label: "Needs attention" } : t.every(Gt) ? { kind: "off", label: "Paused" } : o ? { kind: "warn", label: "Needs attention" } : t.some((n) => n.phase === "degraded") ? { kind: "warn", label: "Retrying" } : t.some((n) => n.phase === "backpressure") ? { kind: "live", label: "Catching up" } : t.some((n) => n.phase === "pending") ? { kind: "neutral", label: "Starting" } : { kind: "on", label: "Active" } : o ? { kind: "warn", label: "Needs attention" } : null;
}
function Sa(e) {
  const t = e?.delivery_failures?.last_error;
  if (t) return `${t.code}: ${t.message}`;
  const o = Be(e);
  for (const n of o) {
    const i = Zt[n.phase || ""];
    if (i) return i;
  }
  for (const n of o) {
    if (n.phase !== "degraded") continue;
    return (typeof n.last_error?.message == "string" ? n.last_error.message.trim() : "") || "The last run failed; it is retrying.";
  }
  return "";
}
function za(e) {
  const t = Be(e), o = [], n = _e(e).next;
  n && o.push({ label: "Next run", value: n, time: !0 });
  const i = t.reduce((a, f) => a + (f.unresolved_count || 0), 0);
  return i > 0 && o.push({ label: "Waiting to retry", value: `${i} ${i === 1 ? "item" : "items"}` }), o;
}
function _e(e) {
  const t = Be(e), o = t.map((i) => i.last_run_at).filter((i) => typeof i == "string" && !!i).sort().at(-1), n = t.filter((i) => !Gt(i)).map((i) => i.next_run_at).filter((i) => typeof i == "string" && !!i).sort()[0];
  return { last: o, next: n };
}
const Pa = /* @__PURE__ */ new Set(["status", "enabled", "last_error", "last_run_at", "next_run_at"]);
function Ia(e) {
  return e.replace(/_/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Ea(e) {
  return e.replace(/\b\w/g, (t) => t.toUpperCase());
}
function Aa(e) {
  return e && e.charAt(0).toUpperCase() + e.slice(1);
}
function Da(e, t) {
  if (e.type === "boolean") return t === !0 ? "Yes" : "No";
  const o = String(t);
  return e.key.endsWith("_at") || /^\d{4}-\d{2}-\d{2}T/.test(o) ? ce(o, { future: !0 }) || o : e.type === "text" ? Aa(o) : o;
}
function Jt(e) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e) || /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(e) ? !0 : /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:_-]*$/i.test(e) && /:[0-9a-f-]{6,}/i.test(e);
}
function La(e) {
  return Jt(e) ? { text: e.length > 12 ? `${e.slice(0, 8)}…` : e, title: e } : { text: e };
}
const Ma = [
  { match: /component_id not in scope|not in scope/i, text: "Not part of this workspace" },
  { match: /transform output must be an object/i, text: "Item format not recognized" },
  { match: /trigger events dropped/i, text: "Incoming events were dropped" },
  { match: /requires dest_ref/i, text: "Missing a destination reference" },
  { match: /does not declare sink operation|accepts source payloads only/i, text: "Destination cannot accept this item" },
  { match: /sink write (returned a non-object|did not acknowledge)/i, text: "Destination did not confirm the save" },
  { match: /(sink|source) resolve/i, text: "Source or destination unavailable" }
];
function Ra(e) {
  const t = e.trim();
  if (!t) return { text: "" };
  for (const o of Ma)
    if (o.match.test(t)) return { text: o.text, title: t };
  return { text: "Skipped", title: t };
}
function Xt(e) {
  return /reason/i.test(e);
}
function Ta(e, t) {
  return Xt(e.key) || /(^|_)item(_key)?$/i.test(e.key) ? !0 : typeof t == "string" && Jt(t);
}
function Oa(e, t) {
  const o = Ea(e.label || Ia(e.key));
  if (Xt(e.key)) {
    const { text: a, title: f } = Ra(String(t));
    return { label: o, value: a, title: f, icon: e.icon };
  }
  const { text: n, title: i } = La(Da(e, t));
  return { label: o, value: n, title: i, icon: e.icon };
}
function Oe(e, t, o) {
  const n = t;
  if (!e || !n) return [];
  const i = [];
  for (const a of e) {
    if (!a?.key || Pa.has(a.key) || a.role === "subtitle") continue;
    const f = n[a.key];
    f == null || f === "" || a.hidden || a.hide_zero && f === 0 || Ta(a, f) === o && i.push(Oa(a, f));
  }
  return i;
}
function st(e) {
  return String(e?.status || "").toLowerCase();
}
function ja(e) {
  return typeof e == "string" && /\b(completed|succeeded|successfully)\b/i.test(e);
}
function Qt(e) {
  const t = st(e);
  return t === "completed" || t === "failed";
}
function lt(e) {
  const t = st(e);
  return t === "failed" || t === "failing" ? !0 : !!e?.last_error && !ja(e.last_error);
}
function eo(e, t) {
  if (t?.code === "unavailable") return { tone: "error", text: "Its module is unavailable. Reinstall its module to use this automation." };
  const o = typeof e?.last_error == "string" ? e.last_error.trim() : "";
  return o ? lt(e) ? { tone: "error", text: o } : { tone: "success", text: o } : null;
}
function to(e, t, o, n) {
  if (n?.code === "unavailable") return { kind: "warn", label: "Unavailable" };
  const i = Ca(o);
  if (i) return i;
  if (!e)
    return t ? { kind: "neutral", label: "…" } : { kind: "neutral", label: "Installed" };
  const a = st(e);
  return lt(e) ? { kind: "warn", label: a === "failed" ? "Failed" : "Failing" } : a === "completed" ? { kind: "done", label: "Completed" } : a === "paused" || e.enabled === !1 ? { kind: "off", label: "Paused" } : a === "running" ? { kind: "live", label: "Running" } : { kind: "on", label: "Active" };
}
function oo(e) {
  switch (e) {
    case "on":
    case "live":
    case "done":
      return "success";
    case "warn":
      return "danger";
    case "off":
      return "warn";
    default:
      return "secondary";
  }
}
function no(e, t) {
  const o = (e || []).find((i) => i?.role === "subtitle"), n = o ? t?.[o.key] : void 0;
  return typeof n == "string" ? n.trim() : "";
}
async function ro(e) {
  const t = [], o = /* @__PURE__ */ new Set();
  let n, i;
  do {
    const a = n ? `?page_token=${encodeURIComponent(n)}` : "", { data: f } = await pe.get(`/api/v1/automations/${encodeURIComponent(e)}/status${a}`);
    if (!$a(f)) throw new Error("Invalid automation status response");
    if (t.push(...f.drives), i = f.delivery_failures, n = f.next_page_token || void 0, n && o.has(n)) throw new Error("Automation status repeated a page token");
    n && o.add(n);
  } while (n);
  return { drives: t, delivery_failures: i };
}
const Ba = ["aria-label"], Fa = { class: "kx-drawer-head" }, Na = { class: "kx-ficon" }, Ua = { class: "kx-drawer-id" }, Ha = ["title"], Va = { class: "kx-drawer-sub" }, Ka = { class: "kx-drawer-controls" }, qa = {
  class: "kx-tabs",
  role: "tablist"
}, Wa = ["aria-selected", "data-testid", "onClick"], Ya = { class: "kx-drawer-body" }, Za = {
  key: 0,
  class: "kx-dsec"
}, Ga = {
  key: 0,
  class: "kx-errcard",
  "data-testid": "drawer-error-card"
}, Ja = { class: "kx-errcard-head" }, Xa = { class: "kx-errcard-cause" }, Qa = { class: "kx-dgrid" }, ei = { class: "kx-dfact-k" }, ti = { class: "kx-dfact-v" }, oi = {
  key: 1,
  class: "kx-dsub"
}, ni = { class: "kx-metrics" }, ri = { class: "kx-metric-k" }, ai = ["title"], ii = {
  key: 1,
  class: "kx-dsec"
}, si = {
  key: 0,
  class: "kx-dnote"
}, li = {
  key: 1,
  class: "kx-dgrid"
}, ci = { class: "kx-dfact-k" }, di = ["title"], ui = {
  key: 2,
  class: "kx-dsec",
  "data-testid": "drawer-config"
}, pi = {
  key: 2,
  class: "kx-dnote"
}, bi = {
  key: 3,
  class: "kx-dsec"
}, fi = { class: "kx-dgrid" }, mi = { class: "kx-dfact" }, gi = { class: "kx-dfact-v" }, vi = { class: "kx-dfact" }, hi = { class: "kx-dfact-v" }, xi = { class: "kx-dfact" }, yi = { class: "kx-dfact-v" }, ki = {
  key: 0,
  class: "kx-dsub"
}, wi = /* @__PURE__ */ ge({
  __name: "DetailDrawer",
  props: {
    automation: { default: () => ({ id: "" }) },
    type: {}
  },
  emits: ["close", "action", "recover", "changed"],
  setup(e, { emit: t }) {
    const o = e, n = t, i = j("overview"), a = [
      { id: "overview", label: "Overview", icon: "tabler:layout-dashboard" },
      { id: "state", label: "State", icon: "tabler:chart-dots" },
      { id: "config", label: "Config", icon: "tabler:settings" },
      { id: "activity", label: "Activity", icon: "tabler:history" }
    ], f = D(() => o.automation.title || o.automation.id), m = D(() => o.automation.icon || o.type?.icon || "tabler:bolt"), w = D(() => o.type?.title || "Automation"), u = D(() => o.automation.public_state), z = D(() => Kt(o.type)), x = D(() => Wt(z.value)), _ = D(() => z.value.declared.includes("status")), p = j(null);
    let y = 0;
    async function M(V) {
      const P = ++y;
      if (!V || !o.automation.drive_status || o.automation.availability) {
        p.value = null;
        return;
      }
      p.value = o.automation.drive_status;
      const C = await ro(V);
      P === y && o.automation.id === V && (p.value = C);
    }
    Je(() => [o.automation.id, o.automation.drive_status, o.automation.availability], ([V]) => {
      M(V).catch((P) => Xe.handleError("other", { message: String(P) }));
    }, { immediate: !0 });
    const W = D(() => to(u.value, _.value, p.value, o.automation.availability)), K = D(() => W.value.kind === "off"), ne = D(() => Qt(u.value)), G = D(() => (z.value.declared.includes("pause") || z.value.declared.includes("resume")) && !ne.value), A = D(() => lt(u.value)), U = D(() => qt(z.value.declared)), $ = D(() => {
      if (o.automation.availability) return eo(u.value, o.automation.availability)?.text || "";
      const V = Sa(p.value);
      if (V) return V;
      const P = typeof u.value?.last_error == "string" ? u.value.last_error.trim() : "";
      return A.value ? P : "";
    }), E = D(() => no(o.type?.public_state_schema?.fields, u.value)), S = D(() => {
      const V = o.type?.public_state_schema?.fields;
      return [...Oe(V, u.value, !1), ...Oe(V, u.value, !0)];
    }), R = D(() => {
      const V = u.value, P = [];
      P.push({ label: "Status", value: W.value.label }), o.automation.availability || P.push({ label: "Enabled", value: K.value ? "Paused" : "Yes" }), E.value && P.push({ label: "When", value: E.value }), V?.last_run_at && P.push({ label: "Last run", value: ce(V.last_run_at, { future: !0 }) }), V?.next_run_at && P.push({ label: "Next run", value: ce(V.next_run_at, { future: !0 }) });
      for (const C of za(p.value))
        P.push({ label: C.label, value: C.time ? ce(C.value, { future: !0 }) : C.value });
      return P;
    }), T = D(() => {
      const V = p.value?.drives.flatMap((C) => typeof C.last_round_at == "string" ? [C.last_round_at] : []) || [], P = p.value?.delivery_failures?.last_error?.at;
      return P && V.push(P), V.sort().at(-1) || u.value?.last_run_at;
    }), c = D(() => p.value?.delivery_failures), L = D(() => {
      const V = c.value?.last_error;
      return V ? `${V.code}: ${V.message}` : u.value?.last_error;
    }), B = D(() => rt(o.type)), ae = D(() => Ut(o.automation, o.type)), Fe = D(() => ({ location: Nt(o.type) }));
    return Je(() => o.automation.id, () => {
      i.value = "overview";
    }), (V, P) => (s(), d(Y, null, [
      l("div", {
        class: "kx-drawer-scrim",
        onClick: P[0] || (P[0] = (C) => n("close"))
      }),
      l("aside", {
        class: "kx-drawer",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": f.value,
        "data-testid": "detail-drawer"
      }, [
        l("header", Fa, [
          l("span", Na, [
            I(r(O), {
              icon: m.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("div", Ua, [
            l("div", {
              class: "kx-drawer-name",
              title: f.value
            }, g(f.value), 9, Ha),
            l("div", Va, g(w.value), 1)
          ]),
          I(r(nt), {
            severity: r(oo)(W.value.kind),
            class: "kx-badge kx-tag-sm"
          }, {
            default: F(() => [
              W.value.kind === "live" ? (s(), N(r(O), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : h("", !0),
              le(" " + g(W.value.label), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          l("div", Ka, [
            G.value ? (s(), N(r(J), {
              key: 0,
              type: "button",
              severity: "secondary",
              outlined: "",
              size: "small",
              "aria-label": `${K.value ? "Resume" : "Pause"} ${f.value}`,
              title: K.value ? "Resume" : "Pause",
              onClick: P[1] || (P[1] = (C) => n("action", K.value ? "resume" : "pause"))
            }, {
              icon: F(({ class: C }) => [
                I(r(O), {
                  icon: K.value ? "tabler:player-play-filled" : "tabler:player-pause",
                  "aria-hidden": "true",
                  class: q(C)
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["aria-label", "title"])) : h("", !0),
            I(Yt, {
              items: x.value,
              name: f.value,
              onSelect: P[2] || (P[2] = (C) => n("action", C))
            }, null, 8, ["items", "name"]),
            I(r(J), {
              type: "button",
              severity: "secondary",
              text: "",
              size: "small",
              class: "kx-drawer-close",
              "aria-label": "Close details",
              title: "Close",
              onClick: P[3] || (P[3] = (C) => n("close"))
            }, {
              icon: F(({ class: C }) => [
                I(r(O), {
                  icon: "tabler:x",
                  "aria-hidden": "true",
                  class: q(C)
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        l("nav", qa, [
          (s(), d(Y, null, ee(a, (C) => l("button", {
            key: C.id,
            type: "button",
            role: "tab",
            class: q(["kx-tab", i.value === C.id && "is-active"]),
            "aria-selected": i.value === C.id,
            "data-testid": `drawer-tab-${C.id}`,
            onClick: (ct) => i.value = C.id
          }, [
            I(r(O), {
              icon: C.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            le(" " + g(C.label), 1)
          ], 10, Wa)), 64))
        ]),
        l("div", Ya, [
          i.value === "overview" ? (s(), d("section", Za, [
            $.value ? (s(), d("div", Ga, [
              l("div", Ja, [
                I(r(O), {
                  icon: "tabler:alert-circle",
                  "aria-hidden": "true"
                }),
                l("span", null, g(o.automation.availability ? "This automation is unavailable" : "This automation is failing"), 1)
              ]),
              l("p", Xa, g($.value), 1),
              U.value ? (s(), N(r(J), {
                key: 0,
                type: "button",
                size: "small",
                severity: "danger",
                "aria-label": `Recover ${f.value}`,
                "data-testid": "drawer-recover",
                label: "Recover",
                onClick: P[4] || (P[4] = (C) => n("recover"))
              }, {
                icon: F(({ class: C }) => [
                  I(r(O), {
                    icon: "tabler:rotate-clockwise-2",
                    "aria-hidden": "true",
                    class: q(C)
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["aria-label"])) : h("", !0)
            ])) : h("", !0),
            l("div", Qa, [
              (s(!0), d(Y, null, ee(R.value, (C) => (s(), d("div", {
                key: C.label,
                class: "kx-dfact"
              }, [
                l("span", ei, g(C.label), 1),
                l("strong", ti, g(C.value), 1)
              ]))), 128))
            ]),
            S.value.length ? (s(), d("div", oi, [
              P[9] || (P[9] = l("div", { class: "kx-dsub-lbl" }, "Progress", -1)),
              l("div", ni, [
                (s(!0), d(Y, null, ee(S.value, (C) => (s(), d("span", {
                  key: C.label,
                  class: "kx-metric"
                }, [
                  C.icon ? (s(), N(r(O), {
                    key: 0,
                    icon: C.icon,
                    class: "kx-metric-i",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : h("", !0),
                  l("span", ri, g(C.label), 1),
                  l("span", {
                    class: "kx-metric-v",
                    title: C.title
                  }, g(C.value), 9, ai)
                ]))), 128))
              ])
            ])) : h("", !0)
          ])) : i.value === "state" ? (s(), d("section", ii, [
            S.value.length ? (s(), d("div", li, [
              (s(!0), d(Y, null, ee(S.value, (C) => (s(), d("div", {
                key: C.label,
                class: "kx-dfact"
              }, [
                l("span", ci, g(C.label), 1),
                l("strong", {
                  class: "kx-dfact-v",
                  title: C.title
                }, g(C.value), 9, di)
              ]))), 128))
            ])) : (s(), d("div", si, "This automation reports no additional state."))
          ])) : i.value === "config" ? (s(), d("section", ui, [
            !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (s(), N(Me, {
              key: 0,
              tag: "wc-execution-identity-editor",
              attrs: { root: e.automation.id },
              onChange: P[5] || (P[5] = (C) => n("changed"))
            }, null, 8, ["attrs"])) : h("", !0),
            B.value ? (s(), N(Me, {
              key: 1,
              class: "kx-manage-host",
              tag: B.value,
              config: ae.value,
              meta: Fe.value,
              onChange: P[6] || (P[6] = (C) => n("changed")),
              onClose: P[7] || (P[7] = (C) => i.value = "overview")
            }, null, 8, ["tag", "config", "meta"])) : (s(), d("div", pi, "This automation type declares no settings view."))
          ])) : (s(), d("section", bi, [
            l("div", fi, [
              l("div", mi, [
                P[10] || (P[10] = l("span", { class: "kx-dfact-k" }, "Last run", -1)),
                l("strong", gi, g(T.value ? r(ce)(T.value, { future: !0 }) : "Never"), 1)
              ]),
              l("div", vi, [
                P[11] || (P[11] = l("span", { class: "kx-dfact-k" }, "Last outcome", -1)),
                l("strong", hi, g(c.value?.count ? "Failed delivery" : u.value?.status || "—"), 1)
              ]),
              l("div", xi, [
                P[12] || (P[12] = l("span", { class: "kx-dfact-k" }, "Failed deliveries", -1)),
                l("strong", yi, g(c.value?.count ?? 0), 1)
              ])
            ]),
            typeof L.value == "string" && L.value.trim() ? (s(), d("div", ki, [
              P[13] || (P[13] = l("div", { class: "kx-dsub-lbl" }, "Last message", -1)),
              l("p", {
                class: q(["kx-dmsg", A.value || c.value?.count ? "is-err" : "is-ok"])
              }, g(L.value), 3)
            ])) : h("", !0),
            !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (s(), N(ka, {
              key: 1,
              root: e.automation.id,
              onError: P[8] || (P[8] = (C) => r(Xe).handleError("other", { message: C.message }))
            }, null, 8, ["root"])) : h("", !0)
          ]))
        ])
      ], 8, Ba)
    ], 64));
  }
});
function _i(e) {
  const t = j(!1), o = j(null), n = j({}), i = j(!1), a = j(!1), f = j(""), m = j(null), w = j(null);
  let u = null;
  const z = j(""), x = D(() => e.types.value.filter(
    (c) => c.installable !== !1 && Object.entries(e.inputPreset.value).every(([L, B]) => {
      const ae = c.inputs?.properties?.[L];
      return !!ae && (!ae.enum || typeof B == "string" && ae.enum.includes(B));
    })
  )), _ = D(() => !e.componentMode.value || !e.preferredTypeId.value || o.value?.id !== e.preferredTypeId.value), p = D(() => o.value ? at(o.value).filter(([c]) => !(c in e.inputPreset.value)) : []), y = D(() => {
    const c = z.value.trim().toLowerCase();
    return c ? x.value.filter(
      (L) => (L.title || "").toLowerCase().includes(c) || (L.name || "").toLowerCase().includes(c) || tt(L).toLowerCase().includes(c)
    ) : x.value;
  });
  function M(c) {
    E(), z.value = "", o.value = c || null, n.value = c ? { ...Ct(c), ...e.inputPreset.value } : {}, f.value = "", t.value = !0, Ye(G);
  }
  function W(c) {
    E(), o.value = c, n.value = { ...Ct(c), ...e.inputPreset.value }, f.value = "", Ye(G);
  }
  function K() {
    E(), t.value = !1, o.value = null, n.value = {}, f.value = "", a.value = !1, e.createMode.value && e.emitHost("close", {});
  }
  function ne() {
    !_.value || o.value || Ye(() => w.value?.focus({ preventScroll: !0 }));
  }
  async function G() {
    const c = o.value, L = ot(c);
    if (!(!L || !c || !m.value))
      try {
        if (await Yo(L, { timeoutMs: 8e3 }), o.value?.id !== c.id || !m.value) return;
        const B = document.createElement(L);
        B.setAttribute("type-id", c.id), B.setAttribute("input", JSON.stringify(e.inputPreset.value)), e.effectiveParentId.value && B.setAttribute("parent-id", e.effectiveParentId.value), B.setAttribute("embedded", "true"), B.addEventListener("automation-installed", $), B.addEventListener("submit-state", A), m.value.innerHTML = "", m.value.appendChild(B), u = B;
      } catch (B) {
        const ae = sr(c);
        f.value = `Failed to load setup UI (${L}${ae ? ` at ${ae}` : ""}): ` + (B instanceof Error ? B.message : String(B));
      }
  }
  function A(c) {
    a.value = !!c.detail?.saving;
  }
  function U() {
    ot(o.value) ? lr(u) : T();
  }
  async function $(c) {
    const L = c.detail;
    if (L?.success === !1) {
      f.value = L?.error || "Could not create the automation.", a.value = !1;
      return;
    }
    if (e.createMode.value) {
      e.emitHost("created", { id: L?.id });
      return;
    }
    K(), await e.reload();
  }
  function E() {
    u && (u.removeEventListener("automation-installed", $), u.removeEventListener("submit-state", A), u.remove(), u = null), m.value && (m.value.innerHTML = "");
  }
  function S() {
    const c = e.preferredTypeId.value;
    return c ? x.value.find((L) => L.id === c) : void 0;
  }
  function R() {
    M(S());
  }
  async function T() {
    const c = o.value;
    if (!c) return;
    const L = dr(c, n.value);
    if (L) {
      f.value = L;
      return;
    }
    i.value = !0, f.value = "";
    try {
      const { data: B } = await pe.post("/api/v1/automations", {
        type: c.id,
        input: ur(c, n.value),
        parent_id: e.effectiveParentId.value || void 0
      });
      if (B?.success) {
        if (e.createMode.value) {
          e.emitHost("created", { id: B.id });
          return;
        }
        K(), await e.reload();
      } else
        f.value = re({ response: { data: B } }, "install failed");
    } catch (B) {
      f.value = re(B, "install failed");
    } finally {
      i.value = !1;
    }
  }
  return {
    showTypeCatalog: _,
    installFields: p,
    showInstall: t,
    installType: o,
    installForm: n,
    installing: i,
    customSaving: a,
    installError: f,
    customInstallHost: m,
    installSearchInput: w,
    typeSearch: z,
    filteredTypes: y,
    openInstall: M,
    openPreferredInstall: R,
    chooseType: W,
    closeInstall: K,
    focusInstallDialog: ne,
    onCreate: U,
    unmountCustomInstallUi: E
  };
}
function $i({ automations: e, types: t, query: o, drawerId: n }) {
  const i = D(() => {
    const c = {};
    for (const L of t.value) c[L.id] = L;
    return c;
  }), a = D(() => {
    const c = o.value.trim().toLowerCase();
    return c ? e.value.filter(
      (L) => (L.title || "").toLowerCase().includes(c) || (L.description || "").toLowerCase().includes(c) || (L.type || "").toLowerCase().includes(c)
    ) : e.value;
  });
  function f(c) {
    return c.title || c.id;
  }
  function m(c) {
    return c.type ? i.value[c.type] : void 0;
  }
  function w(c) {
    return c.icon ? c.icon : m(c)?.icon || "tabler:bolt";
  }
  function u(c) {
    return Vt(m(c));
  }
  function z(c, L) {
    return u(c).has(L);
  }
  function x(c) {
    return Ht(u(c));
  }
  function _(c) {
    return Wt(Kt(m(c)));
  }
  function p(c) {
    return qt(u(c));
  }
  function y(c) {
    return rt(m(c));
  }
  function M(c) {
    return Nt(m(c));
  }
  function W(c) {
    return c ? Ut(c, m(c)) : {};
  }
  function K(c) {
    return c.public_state;
  }
  function ne(c) {
    return Oe(m(c)?.public_state_schema?.fields, K(c), !1);
  }
  function G(c) {
    return Oe(m(c)?.public_state_schema?.fields, K(c), !0);
  }
  function A(c) {
    return Qt(K(c));
  }
  function U(c) {
    return eo(K(c), c.availability);
  }
  function $(c) {
    return to(K(c), z(c, "status"), c.drive_status, c.availability);
  }
  function E(c) {
    return $(c).kind === "off";
  }
  function S(c) {
    return no(m(c)?.public_state_schema?.fields, K(c));
  }
  const R = D(() => e.value.find((c) => c.id === n.value) || null), T = D(() => R.value ? m(R.value) : void 0);
  return {
    typeById: i,
    filtered: a,
    pretty: f,
    typeFor: m,
    iconFor: w,
    declaredActions: u,
    hasAction: z,
    runNowFor: x,
    actionItemsFor: _,
    recoverFor: p,
    manageTag: y,
    manageLocation: M,
    manageConfig: W,
    statusFor: K,
    metrics: ne,
    detailMetrics: G,
    isTerminal: A,
    rowMessage: U,
    statusOf: $,
    isPaused: E,
    subtitleLine: S,
    drawerAutomation: R,
    drawerType: T
  };
}
function we(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Ci(e, t) {
  if (t == null) return t;
  switch (e) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const o = Number(t);
        if (!Number.isNaN(o)) return o;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const o = JSON.parse(t);
          if (o && typeof o == "object") return o;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function Si(e, t) {
  if (!t) return e;
  const o = {};
  for (const [n, i] of Object.entries(e))
    o[n] = Ci(t[n], i);
  return o;
}
function zi(e, t, o) {
  if (!t) return null;
  const n = we(e) ? e : {}, i = [
    n,
    we(n.data) ? n.data : null,
    we(n.payload) ? n.payload : null,
    we(n.detail) ? n.detail : null
  ].filter(Boolean);
  for (const a of i) {
    if (a.event !== "component.meta.changed") continue;
    const f = String(a.component_id || ""), m = String(n.topic || a.topic || "");
    if (!(f && f !== t) && !(!f && m !== `component.${t}`))
      return {
        event: "component.meta.changed",
        component_id: f || t,
        meta: Si(we(a.meta) ? a.meta : {}, o),
        deleted: Array.isArray(a.deleted) ? a.deleted.map(String) : []
      };
  }
  return null;
}
function Pi(e, t, o) {
  if (!e) return null;
  const n = Zo(`component.${e}`, (i) => {
    const a = zi(i, e, o);
    a && t(a);
  });
  return typeof n == "function" ? n : null;
}
function Ii(e, t) {
  const o = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  let i = 0;
  const a = /* @__PURE__ */ new Map();
  function f(x, _) {
    const p = _.meta;
    e.value = e.value.map((y) => {
      if (y.id !== x) return y;
      const M = {
        ...y,
        public_state: { ...y.public_state || {}, ...p }
      };
      return typeof p.title == "string" && (M.title = p.title), typeof p.comment == "string" && (M.description = p.comment), M;
    }), m(x).catch((y) => Xe.handleError("other", { message: String(y) }));
  }
  async function m(x) {
    if (!e.value.some((y) => y.id === x && y.drive_status)) return;
    const _ = Symbol(x);
    a.set(x, _);
    const p = await ro(x);
    a.get(x) === _ && (a.delete(x), e.value = e.value.map((y) => y.id === x ? { ...y, drive_status: p } : y));
  }
  function w(x) {
    const _ = {};
    for (const p of t(x)?.public_state_schema?.fields || [])
      p?.key && p.type && (_[p.key] = p.type);
    return _;
  }
  function u() {
    i++, n.clear(), a.clear();
    for (const x of o.values()) x();
    o.clear();
  }
  function z() {
    const x = new Set(e.value.map((p) => p.id).filter(Boolean));
    for (const [p, y] of o)
      x.has(p) || (y(), o.delete(p), a.delete(p));
    const _ = i;
    for (const p of x) {
      if (o.has(p) || n.has(p)) continue;
      n.add(p);
      const y = e.value.find((W) => W.id === p), M = Pi(p, (W) => f(p, W), y ? w(y) : void 0);
      if (n.delete(p), !!M) {
        if (_ !== i || !e.value.some((W) => W.id === p)) {
          M();
          continue;
        }
        o.set(p, M);
      }
    }
  }
  return { syncRealtimeSubscriptions: z, clearRealtimeSubscriptions: u, refreshDriveStatus: m };
}
function Ei({ automations: e, types: t, loading: o, error: n, parentId: i, syncRealtimeSubscriptions: a }) {
  async function f() {
    try {
      const { data: u } = await pe.get("/api/v1/automations/types");
      t.value = u?.success ? u.types || [] : [];
    } catch {
      t.value = [];
    }
  }
  async function m() {
    o.value = !0, n.value = "";
    try {
      const { data: u } = await pe.get("/api/v1/automations", { params: { class: "automation", parent_id: i() } });
      e.value = u?.success ? u.automations || [] : [], a();
    } catch (u) {
      e.value = [], a(), n.value = re(u, "failed to load automations");
    } finally {
      o.value = !1;
    }
  }
  async function w() {
    await f(), await m();
  }
  return { fetchTypes: f, fetchAutomations: m, reload: w };
}
function Ai(e, t, o) {
  async function n(i) {
    e.value = i.id, t.value = "";
    try {
      const { data: a } = await pe.get(`/api/v1/automations/${encodeURIComponent(i.id)}/export`);
      if (!a?.success || !a.artifact)
        throw new Error(a?.error?.message || a?.error || "Automation export failed.");
      const f = o(i).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "automation", m = new Blob([`${JSON.stringify(a.artifact, null, 2)}
`], { type: "application/json" }), w = URL.createObjectURL(m), u = document.createElement("a");
      u.href = w, u.download = `${f}.automation.json`, document.body.appendChild(u), u.click(), u.remove(), URL.revokeObjectURL(w);
    } catch (a) {
      t.value = re(a, "Automation export failed.");
    } finally {
      e.value = "";
    }
  }
  return { exportAutomation: n };
}
const Di = { class: "kx" }, Li = {
  key: 0,
  class: "kx-head"
}, Mi = { class: "kx-head-icon" }, Ri = { class: "kx-head-actions" }, Ti = { class: "kx-count" }, Oi = { class: "kx-search" }, ji = {
  key: 1,
  class: "kx-err"
}, Bi = {
  key: 2,
  class: "kx-body"
}, Fi = {
  key: 0,
  class: "kx-loading"
}, Ni = {
  key: 1,
  class: "kx-empty"
}, Ui = { class: "kx-empty-ico" }, Hi = {
  key: 2,
  class: "kx-empty"
}, Vi = {
  key: 3,
  class: "kx-list"
}, Ki = ["aria-label", "onClick"], qi = { class: "kx-ficon" }, Wi = { class: "kx-id" }, Yi = ["title"], Zi = { class: "kx-sub" }, Gi = { key: 0 }, Ji = { key: 1 }, Xi = { key: 2 }, Qi = { class: "kx-actions" }, es = {
  key: 0,
  class: "kx-rowfoot"
}, ts = ["title"], os = { class: "kx-modal-head-icon" }, ns = { class: "kx-modal-head-text" }, rs = { class: "kx-modal-head-title" }, as = { class: "kx-modal-head-sub" }, is = { class: "kx-modal-body" }, ss = { class: "kx-modal-head-icon" }, ls = { class: "kx-modal-head-text" }, cs = { class: "kx-modal-head-title" }, ds = { class: "kx-modal-head-sub" }, us = { class: "kx-modal-body" }, ps = { class: "kx-modal-body" }, bs = {
  key: 0,
  class: "kx-delopts"
}, fs = ["onUpdate:modelValue"], ms = { class: "kx-delopt-copy" }, gs = { class: "kx-delopt-t" }, vs = {
  key: 0,
  class: "kx-delopt-d"
}, hs = /* @__PURE__ */ ge({
  __name: "automations",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, o = j([]), n = j([]), i = j(!1), a = j(""), f = j(""), m = j(""), w = /* @__PURE__ */ new Map(), u = j(""), z = j(""), x = $i({ automations: o, types: n, query: f, drawerId: z }), {
      filtered: _,
      pretty: p,
      typeFor: y,
      iconFor: M,
      hasAction: W,
      actionItemsFor: K,
      recoverFor: ne,
      manageTag: G,
      manageLocation: A,
      manageConfig: U,
      metrics: $,
      detailMetrics: E,
      isTerminal: S,
      rowMessage: R,
      statusOf: T,
      isPaused: c,
      subtitleLine: L,
      drawerAutomation: B,
      drawerType: ae
    } = x, Fe = Ii(o, y), { syncRealtimeSubscriptions: V, clearRealtimeSubscriptions: P, refreshDriveStatus: C } = Fe, ct = Ai(u, a, p), { exportAutomation: ao } = ct, be = $o(), io = Co(), ve = D(() => be.value?.mode === "create"), Ne = D(() => be.value?.mode === "component"), so = ar(be), dt = D(() => String(be.value?.componentId || "").trim()), lo = D(() => String(be.value?.typeId || "").trim()), co = D(() => dt.value || so.value), uo = Ei({
      automations: o,
      types: n,
      loading: i,
      error: a,
      parentId: () => dt.value || void 0,
      syncRealtimeSubscriptions: V
    }), { fetchAutomations: he, reload: Ue } = uo, xe = _i({
      types: n,
      createMode: ve,
      componentMode: Ne,
      effectiveParentId: co,
      preferredTypeId: lo,
      inputPreset: D(() => ir(be.value?.input)),
      emitHost: (k, v) => io(k, v),
      reload: () => Ue()
    }), ie = j(null), Le = j({}), ye = j(!1), te = j(null), de = j(null);
    function po(k) {
      de.value = k;
    }
    function ut() {
      de.value = null;
    }
    function bo(k) {
      const v = k?.id || "";
      return {
        resource_id: v,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(v)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(v)}`,
        title: k ? p(k) : ""
      };
    }
    function pt(k, v) {
      switch (v) {
        case "reconfigure":
          ko(k);
          break;
        case "share":
          po(k);
          break;
        case "export":
          ao(k);
          break;
        case "delete":
          ft(k);
          break;
        default:
          He(k, v);
      }
    }
    function bt(k) {
      const v = ne(k);
      v && He(k, v);
    }
    function fo(k) {
      z.value = k.id, he();
    }
    function mo() {
      z.value = "";
    }
    function go(k) {
      const v = B.value;
      v && pt(v, k);
    }
    function vo() {
      const k = B.value;
      k && bt(k);
    }
    async function He(k, v) {
      if (m.value) return;
      m.value = k.id, a.value = "";
      const b = y(k)?.controls?.some((oe) => oe.name === v) === !0, Z = `${k.id}:${v}`, mt = b ? w.get(Z) || crypto.randomUUID() : "";
      b && w.set(Z, mt);
      try {
        const { data: oe } = await pe.post(
          `/api/v1/automations/${k.id}/actions/${v}`,
          b ? { request_id: mt } : {}
        );
        if (!oe?.success) {
          a.value = re({ response: { data: oe } }, `${v} failed`);
          return;
        }
        if (b && oe.result?.state === "succeeded" && w.delete(Z), oe.result && typeof oe.result == "object") {
          const { success: qe, ...wo } = oe.result;
          k.public_state = { ...k.public_state || {}, ...wo };
        }
        if (k.drive_status?.drives?.length)
          await C(k.id);
        else if (v === "pause" || v === "resume") {
          const qe = typeof oe.result?.paused == "boolean" ? oe.result.paused : v === "pause";
          k.public_state = {
            ...k.public_state || {},
            enabled: !qe,
            status: oe.result?.status || (qe ? "paused" : "active")
          };
        }
      } catch (oe) {
        a.value = re(oe, `${v} failed`);
      } finally {
        m.value = "";
      }
    }
    async function ho(k) {
      await He(k, c(k) ? "resume" : "pause");
    }
    function ft(k) {
      ie.value = k;
      const v = y(k), b = {};
      for (const Z of v?.delete_options || []) b[Z.key] = !!Z.default;
      Le.value = b;
    }
    function Ve(k) {
      return k ? y(k)?.delete_options || [] : [];
    }
    function xo(k) {
      te.value = null, ft(k);
    }
    async function yo() {
      const k = ie.value;
      if (k) {
        ye.value = !0, a.value = "";
        try {
          const b = Ve(k).length ? { options: { ...Le.value } } : {}, { data: Z } = await pe.delete(`/api/v1/automations/${k.id}`, { data: b });
          Z?.success ? (ie.value = null, await he()) : a.value = re({ response: { data: Z } }, "failed to delete automation");
        } catch (v) {
          a.value = re(v, "failed to delete automation");
        } finally {
          ye.value = !1;
        }
      }
    }
    function ko(k) {
      G(k) && (te.value = k);
    }
    async function Ke(k = !0) {
      te.value = null, k && await Ue();
    }
    return So(async () => {
      try {
        await Ue(), ve.value && xe.openPreferredInstall();
      } catch (k) {
        a.value = re(k, "host API unavailable");
      }
    }), Rt(() => {
      xe.unmountCustomInstallUi(), P();
    }), (k, v) => (s(), d("div", Di, [
      ve.value ? h("", !0) : (s(), d("header", Li, [
        Ne.value ? h("", !0) : (s(), d(Y, { key: 0 }, [
          l("div", Mi, [
            I(r(O), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          v[10] || (v[10] = l("div", { class: "kx-head-text" }, [
            l("h1", { class: "kx-head-title" }, "Automations"),
            l("p", { class: "kx-head-sub" }, "Scheduled and event-driven jobs that run on their own.")
          ], -1))
        ], 64)),
        l("div", Ri, [
          l("span", Ti, g(o.value.length) + " automation" + g(o.value.length !== 1 ? "s" : ""), 1),
          l("div", Oi, [
            I(r(O), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            ue(l("input", {
              "onUpdate:modelValue": v[0] || (v[0] = (b) => f.value = b),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search automations…"
            }, null, 512), [
              [Ge, f.value]
            ])
          ]),
          I(r(J), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: v[1] || (v[1] = (b) => r(xe).openPreferredInstall())
          }, {
            icon: F(({ class: b }) => [
              I(r(O), {
                icon: "tabler:plus",
                class: q(b),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ])),
      !ve.value && a.value ? (s(), d("div", ji, g(a.value), 1)) : h("", !0),
      ve.value ? h("", !0) : (s(), d("div", Bi, [
        i.value && !o.value.length ? (s(), d("div", Fi, [
          I(r(O), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          v[11] || (v[11] = le(" Loading… ", -1))
        ])) : o.value.length ? r(_).length ? (s(), d("div", Vi, [
          (s(!0), d(Y, null, ee(r(_), (b) => (s(), d("div", {
            key: b.id,
            class: q(["kx-row", z.value === b.id && "is-open"])
          }, [
            l("button", {
              type: "button",
              class: "kx-open",
              "aria-label": `Open ${r(p)(b)} details`,
              onClick: (Z) => fo(b)
            }, [
              l("span", qi, [
                I(r(O), {
                  icon: r(M)(b),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              l("span", Wi, [
                l("span", {
                  class: "kx-name",
                  title: r(p)(b)
                }, g(r(p)(b)), 9, Yi),
                l("span", Zi, [
                  l("span", null, g(r(y)(b)?.title || "Automation"), 1),
                  r(L)(b) ? (s(), d("span", Gi, " · " + g(r(L)(b)), 1)) : h("", !0),
                  r(_e)(b.drive_status).last ? (s(), d("span", Ji, " · last ran " + g(r(ce)(r(_e)(b.drive_status).last, { future: !0 })), 1)) : h("", !0),
                  r(_e)(b.drive_status).next ? (s(), d("span", Xi, " · next " + g(r(ce)(r(_e)(b.drive_status).next, { future: !0 })), 1)) : h("", !0)
                ])
              ])
            ], 8, Ki),
            I(r(nt), {
              severity: r(oo)(r(T)(b).kind),
              class: "kx-badge kx-tag-sm"
            }, {
              default: F(() => [
                r(T)(b).kind === "live" ? (s(), N(r(O), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : h("", !0),
                le(" " + g(r(T)(b).label), 1)
              ]),
              _: 2
            }, 1032, ["severity"]),
            l("div", Qi, [
              (r(W)(b, "pause") || r(W)(b, "resume")) && !r(S)(b) ? (s(), N(r(J), {
                key: 0,
                type: "button",
                severity: "secondary",
                outlined: "",
                size: "small",
                disabled: m.value === b.id,
                "aria-label": `${r(c)(b) ? "Resume" : "Pause"} ${r(p)(b)}`,
                title: r(c)(b) ? "Resume" : "Pause",
                onClick: (Z) => ho(b)
              }, {
                icon: F(({ class: Z }) => [
                  I(r(O), {
                    icon: r(c)(b) ? "tabler:player-play-filled" : "tabler:player-pause",
                    "aria-hidden": "true",
                    class: q(Z)
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["disabled", "aria-label", "title", "onClick"])) : h("", !0),
              I(Yt, {
                items: r(K)(b),
                name: r(p)(b),
                busy: m.value === b.id,
                onSelect: (Z) => pt(b, Z)
              }, null, 8, ["items", "name", "busy", "onSelect"])
            ]),
            r(R)(b) || r(E)(b).length || r($)(b).length ? (s(), d("div", es, [
              r(R)(b) ? (s(), d("div", {
                key: 0,
                class: q(["kx-rowmsg", `kx-rowmsg-${r(R)(b)?.tone}`])
              }, [
                I(r(O), {
                  icon: r(R)(b)?.tone === "error" ? "tabler:alert-circle" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                l("span", {
                  class: "kx-rowmsg-txt",
                  title: r(R)(b)?.text
                }, g(r(R)(b)?.text), 9, ts),
                r(R)(b)?.tone === "error" && r(ne)(b) ? (s(), N(r(J), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  text: "",
                  size: "small",
                  class: "kx-recover",
                  "data-testid": "row-recover",
                  "aria-label": `Recover ${r(p)(b)}`,
                  disabled: m.value === b.id,
                  label: "Recover",
                  onClick: (Z) => bt(b)
                }, {
                  icon: F(({ class: Z }) => [
                    I(r(O), {
                      icon: "tabler:rotate-clockwise-2",
                      "aria-hidden": "true",
                      class: q(Z)
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])) : h("", !0)
              ], 2)) : h("", !0),
              I(Yr, {
                face: r($)(b),
                detail: r(E)(b)
              }, null, 8, ["face", "detail"])
            ])) : h("", !0)
          ], 2))), 128))
        ])) : (s(), d("div", Hi, [...v[14] || (v[14] = [
          l("div", { class: "kx-empty-title" }, "No matches", -1),
          l("div", { class: "kx-empty-sub" }, "No automations match the current search.", -1)
        ])])) : (s(), d("div", Ni, [
          l("div", Ui, [
            I(r(O), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          v[12] || (v[12] = l("div", { class: "kx-empty-title" }, "No automations yet", -1)),
          v[13] || (v[13] = l("div", { class: "kx-empty-sub" }, "Choose an automation type to get started.", -1)),
          I(r(J), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: v[2] || (v[2] = (b) => r(xe).openPreferredInstall())
          }, {
            icon: F(({ class: b }) => [
              I(r(O), {
                icon: "tabler:plus",
                class: q(b),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ])),
      r(B) ? (s(), N(wi, {
        key: 3,
        automation: r(B),
        type: r(ae),
        onClose: mo,
        onAction: go,
        onRecover: vo,
        onChanged: r(he)
      }, null, 8, ["automation", "type", "onChanged"])) : h("", !0),
      I(Fr, {
        flow: r(xe),
        "component-mode": Ne.value,
        "dialog-pt": t
      }, null, 8, ["flow", "component-mode"]),
      te.value ? (s(), N(r($e), {
        key: 4,
        visible: !!te.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal kx-modal-manage",
        "aria-label": r(p)(te.value),
        "onUpdate:visible": v[6] || (v[6] = (b) => {
          b || Ke(!1);
        })
      }, {
        header: F(() => [
          l("span", os, [
            I(r(O), {
              icon: r(M)(te.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("span", ns, [
            l("span", rs, g(r(p)(te.value)), 1),
            l("span", as, g(r(y)(te.value)?.title || "Automation"), 1)
          ])
        ]),
        footer: F(() => [
          I(r(J), {
            type: "button",
            class: "kx-foot-delete",
            severity: "danger",
            outlined: "",
            label: "Delete",
            onClick: v[5] || (v[5] = (b) => xo(te.value))
          }, {
            icon: F(({ class: b }) => [
              I(r(O), {
                icon: "tabler:trash",
                "aria-hidden": "true",
                class: q(b)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]),
        default: F(() => [
          l("div", is, [
            I(Me, {
              class: "kx-manage-host",
              tag: r(G)(te.value),
              config: r(U)(te.value),
              meta: { location: r(A)(te.value) },
              onCreated: v[3] || (v[3] = (b) => Ke(!0)),
              onClose: v[4] || (v[4] = (b) => Ke(!0)),
              onChange: r(he)
            }, null, 8, ["tag", "config", "meta", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : h("", !0),
      de.value ? (s(), N(r($e), {
        key: 5,
        visible: !!de.value,
        modal: "",
        pt: t,
        class: "kx-modal",
        "aria-label": `Share ${r(p)(de.value)}`,
        "onUpdate:visible": v[7] || (v[7] = (b) => {
          b || ut();
        })
      }, {
        header: F(() => [
          l("span", ss, [
            I(r(O), {
              icon: "tabler:users",
              "aria-hidden": "true"
            })
          ]),
          l("span", ls, [
            l("span", cs, "Share " + g(r(p)(de.value)), 1),
            l("span", ds, g(r(y)(de.value)?.title || "Automation"), 1)
          ])
        ]),
        default: F(() => [
          l("div", us, [
            I(Me, {
              class: "kx-manage-host",
              tag: "kickside-share",
              config: bo(de.value),
              onClose: ut,
              onChange: r(he)
            }, null, 8, ["config", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : h("", !0),
      ie.value ? (s(), N(r($e), {
        key: 6,
        visible: !!ie.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal",
        header: "Delete automation",
        "aria-label": "Delete automation",
        "onUpdate:visible": v[9] || (v[9] = (b) => {
          b || (ie.value = null);
        })
      }, {
        footer: F(() => [
          I(r(J), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: ye.value,
            onClick: v[8] || (v[8] = (b) => ie.value = null)
          }, null, 8, ["disabled"]),
          I(r(J), {
            type: "button",
            "data-testid": "automations-confirm-delete",
            severity: "danger",
            label: "Delete",
            loading: ye.value,
            disabled: ye.value,
            onClick: yo
          }, {
            icon: F(({ class: b }) => [
              I(r(O), {
                icon: "tabler:trash",
                class: q(b),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: F(() => [
          l("div", ps, [
            l("p", null, [
              v[15] || (v[15] = le(" Delete ", -1)),
              l("strong", null, g(r(p)(ie.value)), 1),
              v[16] || (v[16] = le("? It will stop running and its setup will be removed. This can't be undone. ", -1))
            ]),
            Ve(ie.value).length ? (s(), d("div", bs, [
              (s(!0), d(Y, null, ee(Ve(ie.value), (b) => (s(), d("label", {
                key: b.key,
                class: "kx-delopt"
              }, [
                ue(l("input", {
                  "onUpdate:modelValue": (Z) => Le.value[b.key] = Z,
                  type: "checkbox"
                }, null, 8, fs), [
                  [Mt, Le.value[b.key]]
                ]),
                l("span", ms, [
                  l("span", gs, g(b.title || b.key), 1),
                  b.description ? (s(), d("span", vs, g(b.description), 1)) : h("", !0)
                ])
              ]))), 128))
            ])) : h("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"])) : h("", !0)
    ]));
  }
}), xs = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-modal-head-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-modal-head-icon svg{width:20px;height:20px}.kx-modal-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-modal-head-title{font-size:15.5px;font-weight:700;color:var(--p-text-color);line-height:1.2}.kx-modal-head-sub{font-size:12.5px;font-weight:400;color:var(--p-text-muted-color);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{--kx-modal-shadow: var(--kx-shadow-lg);display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.kx-head-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-count{font-size:12.5px;color:var(--p-text-muted-color);display:inline-flex;align-items:center;gap:5px}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{height:34px;width:220px;max-width:40vw;padding:0 10px 0 30px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.kx-body{flex:1 0 auto;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-list{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden;background:var(--p-content-background);max-width:1100px}.kx-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"main status actions" "foot foot   foot";align-items:center;column-gap:14px;row-gap:6px;padding:10px 14px;border-bottom:1px solid var(--p-content-border-color)}.kx-row:last-child{border-bottom:none}.kx-row.is-open{background:var(--kx-wash-primary)}.kx-row:hover{background:var(--kx-overlay-subtle)}.kx-row.is-open:hover{background:var(--kx-wash-primary)}.kx-open{grid-area:main;display:flex;align-items:center;gap:12px;min-width:0;padding:0;margin:0;border:none;background:transparent;text-align:left;font:inherit;color:inherit;cursor:pointer}.kx-ficon{width:38px;height:38px;flex:none;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--kx-wash-primary);color:var(--p-primary-color)}.kx-ficon svg{width:20px;height:20px}.kx-id{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}.kx-name{display:block;font-size:14px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-sub{display:block;font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-open:focus-visible{outline:none}.kx-open:focus-visible .kx-name{text-decoration:underline;text-underline-offset:2px;text-decoration-color:var(--p-primary-color)}.kx-rowfoot{grid-area:foot;padding-left:50px;display:flex;flex-direction:column;gap:4px;min-width:0}.kx-rowfoot:empty{display:none}.kx-rowmsg{font-size:11.5px;display:flex;align-items:center;gap:5px;min-width:0}.kx-rowmsg-txt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-rowmsg svg{width:13px;height:13px;flex:none}.kx-rowmsg-error{color:var(--p-danger-600, var(--p-danger-500))}.kx-rowmsg-success{color:var(--p-success-600, var(--p-success-500))}.kx-recover{flex:none;margin-left:2px}.kx-badge{grid-area:status;border:1px solid color-mix(in srgb,currentColor 28%,transparent)}.kx-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}.kx-badge:has(svg):before{display:none}.kx-actions{grid-area:actions;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;min-width:0}.kx-actions .is-active{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 38%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-admin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}.kx-admin-item{min-width:0;padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:10px;background:var(--p-content-background)}.kx-admin-item>span{display:block;margin-bottom:4px;color:var(--p-text-muted-color);font-size:10.5px;font-weight:700;letter-spacing:.055em;text-transform:uppercase}.kx-admin-item strong{display:block;overflow:hidden;color:var(--p-text-color);font-size:12.5px;text-overflow:ellipsis;white-space:nowrap}.kx-admin-item strong em{color:var(--p-text-muted-color);font-size:11px;font-style:normal;font-weight:600}.kx-admin-item code{display:block;margin-top:4px;overflow:hidden;color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;text-overflow:ellipsis;white-space:nowrap}.kx-admin-item a{display:inline-block;margin-top:4px;color:var(--p-primary-color);font-size:11px;font-weight:650;text-decoration:none}.kx-admin-item a:hover{text-decoration:underline}@media(max-width:560px){.kx-row{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"main   actions" "status status" "foot   foot";align-items:center;row-gap:8px}.kx-badge{justify-self:start}.kx-rowfoot{padding-left:0}}@media(max-width:640px){.kx-admin-grid{grid-template-columns:1fr}}.kx-modal{--p-dialog-content-padding: 0;max-width:calc(100vw - 32px);max-height:90vh}.kx-modal>.kx-dialog-header{padding:16px 18px;border-bottom:1px solid var(--p-content-border-color);gap:10px}.kx-modal>.kx-dialog-content{padding:0;display:flex;flex-direction:column;min-height:0;overflow:hidden}.kx-modal>.kx-dialog-footer{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.kx-2p-r-body>*{animation:kx-pane-fade .28s ease both}@keyframes kx-pane-fade{0%{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){.kx-2p-r-body>*{animation:none}}.kx-modal-body{padding:18px;font-size:13.5px;line-height:1.5;color:var(--p-text-color);overflow-y:auto}.kx-modal-body p{margin:0 0 10px}.kx-modal-body p:last-child{margin-bottom:0}.kx-form{display:flex;flex-direction:column;gap:14px}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-req{color:var(--p-danger-500)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-select{width:100%;min-width:0}.kx-check,.kx-delopt input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-check:before,.kx-delopt input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-check:checked,.kx-delopt input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-check:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset)}.kx-check:checked:before,.kx-delopt input:checked:before{transform:rotate(45deg) scale(1)}.kx-check:disabled,.kx-delopt input:disabled{opacity:.55;cursor:not-allowed}.kx-field-hint{font-size:11px;line-height:1.3;color:var(--p-text-muted-color);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.kx-custom-host{min-height:180px;width:100%}.kx-custom-host>*{display:block;width:100%}.kx-delopts{display:flex;flex-direction:column;gap:10px;margin-top:14px}.kx-delopt{display:flex;align-items:flex-start;gap:10px;cursor:pointer}.kx-delopt input{margin-top:2px}.kx-delopt-copy{min-width:0;display:flex;flex-direction:column;gap:2px}.kx-delopt-t{display:block;font-size:13px;font-weight:600;color:var(--p-text-color)}.kx-delopt-d{display:block;font-size:11.5px;line-height:1.35;color:var(--p-text-muted-color)}.kx-modal-2p{width:min(880px,calc(100vw - 40px));max-width:100%}.kx-modal-solo{width:min(620px,calc(100vw - 40px));max-width:100%}.kx-modal-manage{width:min(760px,calc(100vw - 40px));max-width:100%}.kx-manage-host{display:block;min-height:180px}.kx-2p{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);min-height:0;flex:1;overflow:hidden}.kx-2p-solo{grid-template-columns:minmax(0,1fr)}.kx-2p-solo .kx-2p-r-body{padding-top:16px}.kx-2p-l{padding:16px;overflow-y:auto;border-right:1px solid var(--p-content-border-color);display:flex;flex-direction:column;gap:10px}.kx-2p-r{display:flex;flex-direction:column;min-width:0;min-height:0;background:color-mix(in srgb,var(--p-text-color) 2.5%,var(--p-content-background))}.kx-2p-r-head{padding:14px 18px 10px;font-size:12.5px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-2p-r-body{padding:0 18px 18px;overflow-y:auto;flex:1;min-height:0}.kx-2p-r-note{margin:0;font-size:12.5px;color:var(--p-text-muted-color)}.kx-foot-err{order:-1;flex:1 0 100%;margin:0;max-width:none}.kx-foot-err+.p-button{margin-left:auto}.kx-foot-delete{margin-right:auto}.kx-cat-search{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;flex:none;border:1px solid var(--p-content-border-color);border-radius:8px;color:var(--p-text-muted-color)}.kx-cat-search svg{width:15px;height:15px;flex:none}.kx-cat-search input{flex:1;border:none;background:transparent;outline:none;font:inherit;font-size:13px;color:var(--p-text-color)}.kx-cat{display:flex;flex-direction:column;gap:6px}.kx-cat-card{display:flex;align-items:center;gap:11px;text-align:left;width:100%;padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:14px;background:transparent;color:var(--p-text-color);cursor:pointer;transition:border-color .14s,background .14s}.kx-cat-card:hover{background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.kx-cat-card.sel{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 9%,transparent)}.kx-cat-ico{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.kx-cat-ico svg{width:18px;height:18px}.kx-cat-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-cat-name{font-size:13px;font-weight:600}.kx-cat-desc{font-size:11px;line-height:1.3;color:var(--p-text-muted-color);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.kx-cat-check{width:17px;height:17px;flex:none;color:var(--p-primary-color);visibility:hidden}.kx-cat-card.sel .kx-cat-check{visibility:visible}.kx-cat-empty{font-size:12.5px;color:var(--p-text-muted-color);padding:4px 2px}@media(max-width:760px){.kx-modal-2p{width:560px}.kx-2p{grid-template-columns:1fr}.kx-2p-l{border-right:none;border-bottom:1px solid var(--p-content-border-color)}}.kx-flow{display:flex;flex-direction:column;gap:14px;padding:6px 0 0}.kx-pipe,.kx-stage{display:flex;flex-direction:column;gap:8px}.kx-stage-mid{background:transparent}.kx-stage-head{display:flex;align-items:center;gap:8px}.kx-stage-ico{width:26px;height:26px;border-radius:11px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-stage-ico svg{width:15px;height:15px}.kx-stage-lbl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-stage-cfg{margin-top:2px}.kx-stage-badges{display:flex;flex-wrap:wrap;gap:6px}.kx-stage-desc{margin:0;font-size:12px;line-height:1.4;color:var(--p-text-muted-color)}.kx-stage-opts{display:flex;flex-direction:column;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-opts-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-pipe-conn{display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 0;color:var(--p-text-muted-color);font-size:11px}.kx-pipe-conn svg{width:16px;height:16px}.kx-runopts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.kx-detect{display:flex;align-items:center;gap:6px;font-size:11.5px;line-height:1.35;padding:7px 9px;border-radius:8px;color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 10%,transparent)}.kx-detect svg{width:14px;height:14px;flex:none}.kx-detect-warn{color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-flow-enable{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--p-text-muted-color);cursor:pointer}.kx-flow-enable input{width:16px;height:16px;accent-color:var(--p-primary-color)}.kx-textarea{height:auto;min-height:72px;padding:8px 10px;line-height:1.4;resize:vertical}.kx-wcmount{width:100%}.kx-wcmount>div{display:block;width:100%}.kx-metrics{display:flex;flex-wrap:wrap;gap:5px 6px;margin-top:5px;min-width:0}.kx-metric{display:inline-flex;align-items:center;gap:5px;max-width:100%;font-size:11.5px;line-height:1.6;padding:2px 9px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 6%,transparent);color:var(--p-text-color)}.kx-metric-i{width:13px;height:13px;color:var(--p-text-muted-color);flex:none}.kx-metric-k{color:var(--p-text-muted-color);font-weight:600;flex:none}.kx-metric-v{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-metric-details{margin-top:5px}.kx-metric-more{display:inline-flex;align-items:center;gap:4px;cursor:pointer;list-style:none;font-size:11.5px;font-weight:600;color:var(--p-text-muted-color);user-select:none}.kx-metric-more::-webkit-details-marker{display:none}.kx-metric-more:before{content:"";width:0;height:0;border-left:4px solid currentColor;border-top:3px solid transparent;border-bottom:3px solid transparent;transition:transform .15s;flex:none}.kx-metric-details[open] .kx-metric-more:before{transform:rotate(90deg)}.kx-metric-more:hover{color:var(--p-text-color)}.kx-metrics-detail{margin-top:4px}@media(prefers-reduced-motion:reduce){.kx-modal{transition:none}}.kx-cat-search:focus-within{border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-cat-search input:focus{box-shadow:none}.kx-cat-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-menu{position:relative;display:inline-flex}.kx-menu-trigger.is-active{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 38%,var(--p-content-border-color));background:var(--kx-wash-primary)}.kx-menu-panel{display:flex;flex-direction:column;gap:1px;padding:6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);background:var(--p-content-background);box-shadow:var(--kx-shadow-lg);max-height:min(70vh,460px);overflow-y:auto}.kx-menu-group{padding:8px 10px 4px;font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-menu-group.is-first{padding-top:4px}.kx-menu-sep{height:1px;margin:5px 6px;background:var(--p-content-border-color)}.kx-menu-item{display:flex;align-items:flex-start;gap:10px;width:100%;padding:8px 10px;text-align:left;border:none;border-radius:var(--kx-radius-10);background:transparent;color:var(--p-text-color);cursor:pointer;transition:background .12s}.kx-menu-item:hover,.kx-menu-item:focus-visible{background:var(--kx-overlay-hover);outline:none}.kx-menu-item:disabled{opacity:.5;cursor:not-allowed}.kx-menu-item-ico{width:17px;height:17px;flex:none;margin-top:1px;color:var(--p-text-muted-color)}.kx-menu-item-body{display:flex;flex-direction:column;gap:1px;min-width:0}.kx-menu-item-label{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600}.kx-menu-item-desc{font-size:11px;line-height:1.35;color:var(--p-text-muted-color)}.kx-menu-item-warn{width:12px;height:12px;color:var(--p-warn-600, var(--p-warn-500))}.kx-menu-item.is-warn .kx-menu-item-ico{color:var(--p-warn-600, var(--p-warn-500))}.kx-menu-item.is-danger .kx-menu-item-ico{color:var(--p-danger-600, var(--p-danger-500))}.kx-menu-item.is-danger:hover,.kx-menu-item.is-danger:focus-visible{background:var(--kx-wash-danger)}.kx-menu-item.is-danger .kx-menu-item-label{color:var(--p-danger-600, var(--p-danger-500))}.kx-drawer-scrim{position:fixed;inset:0;z-index:60;background:color-mix(in srgb,var(--p-text-color) 40%,transparent);animation:kx-fade .18s ease both}.kx-drawer{position:fixed;top:0;right:0;height:100%;width:min(468px,100vw);z-index:61;display:flex;flex-direction:column;min-height:0;background:var(--p-content-background);border-left:1px solid var(--p-content-border-color);box-shadow:var(--kx-shadow-lg);animation:kx-slide-in .22s cubic-bezier(.22,.61,.36,1) both}@keyframes kx-fade{0%{opacity:0}to{opacity:1}}@keyframes kx-slide-in{0%{transform:translate(24px);opacity:0}to{transform:none;opacity:1}}@media(prefers-reduced-motion:reduce){.kx-drawer,.kx-drawer-scrim{animation:none}}.kx-drawer-head{display:flex;align-items:center;gap:11px;padding:16px 16px 14px;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-drawer-id{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}.kx-drawer-name{font-size:15px;font-weight:700;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-drawer-sub{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-drawer-controls{display:flex;align-items:center;gap:6px;flex:none}.kx-drawer .kx-badge{flex:none}.kx-tabs{display:flex;gap:2px;padding:6px 12px 0;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-tab{display:inline-flex;align-items:center;gap:6px;padding:8px 12px 10px;margin-bottom:-1px;border:none;border-bottom:2px solid transparent;background:transparent;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;color:var(--p-text-muted-color);transition:color .12s}.kx-tab svg{width:15px;height:15px}.kx-tab:hover{color:var(--p-text-color)}.kx-tab.is-active{color:var(--p-primary-color);border-bottom-color:var(--p-primary-color)}.kx-tab:focus-visible{outline:none;color:var(--p-primary-color)}.kx-drawer-body{flex:1;min-height:0;overflow-y:auto;padding:16px}.kx-dsec{display:flex;flex-direction:column;gap:16px}.kx-dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.kx-dfact{padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);min-width:0}.kx-dfact-k{display:block;margin-bottom:4px;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-dfact-v{display:block;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-dsub{display:flex;flex-direction:column;gap:8px}.kx-dsub-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-dnote{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--p-text-muted-color);padding:4px 0}.kx-dnote-err{color:var(--p-danger-600, var(--p-danger-500))}.kx-dsec-foot{padding-top:4px}.kx-dmsg{margin:0;font-size:12.5px;line-height:1.5;padding:10px 12px;border-radius:var(--kx-radius-10);background:var(--kx-surface-1);color:var(--p-text-color);word-break:break-word}.kx-dmsg.is-err{background:var(--kx-wash-danger);color:var(--p-danger-700, var(--p-danger-600, var(--p-danger-500)))}.kx-dmsg.is-ok{background:var(--kx-wash-success);color:var(--p-success-700, var(--p-success-600, var(--p-success-500)))}.kx-errcard{display:flex;flex-direction:column;gap:9px;padding:13px 14px;border:1px solid color-mix(in srgb,var(--p-danger-500) 40%,var(--p-content-border-color));border-radius:var(--kx-radius-14);background:var(--kx-wash-danger)}.kx-errcard-head{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--p-danger-700, var(--p-danger-600, var(--p-danger-500)))}.kx-errcard-head svg{width:17px;height:17px;flex:none}.kx-errcard-cause{margin:0;font-size:12.5px;line-height:1.5;color:var(--p-text-color);word-break:break-word}.kx-errcard .p-button{align-self:flex-start}.kx-hint{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:var(--kx-radius-10);background:var(--kx-wash-info);font-size:12px;line-height:1.45;color:var(--p-text-color)}.kx-hint svg{width:16px;height:16px;flex:none;margin-top:1px;color:var(--p-info-600, var(--p-info-500))}', ys = { props: { type: "object", properties: { mode: { type: "string", default: "", description: '"create" when mounted as the workspace "+" -> Automation create view: opens straight into the install popup and emits created/close. Unset renders the full Automations page.' }, "parent-id": { type: "string", default: "", description: "Workspace folder to place the new automation under (create mode; empty = root)." }, "component-id": { type: "string", default: "", description: "Optional owning component; scopes rows and places newly created Automations under that component." }, input: { type: "string", default: "", description: "Initial declared install inputs as a JSON object, supplied by the owning component." }, "type-id": { type: "string", default: "", description: "Optional registry automation type id to preselect in create or component mode. The manager treats the id opaquely and mounts that type's declared create view." } } } }, ks = {
  wippy: ys
};
class ws extends zo {
  static get wippyConfig() {
    return {
      propsSchema: ks.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: xs
    };
  }
  static get vueConfig() {
    return { rootComponent: hs, plugins: [Vo] };
  }
}
Go(import.meta.url, ws);
//# sourceMappingURL=index.js.map
