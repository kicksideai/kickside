import { e as te, _ as Re, u as zo, a as Po, b as Do, W as Eo } from "./errMsg-kIukmtcj.js";
import { B as he, l as Et, s as It, L as Io, b as me, v as we, U as Lo, I as vt, d as Ao, r as Lt, a as jo, c as Mo, e as Ro, C as To, h as Oo, S as Bo, _ as Fo, W as No, f as Uo, P as Ho } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-DNnuyvEa.js";
import { openBlock as s, createElementBlock as d, mergeProps as U, renderSlot as ee, createTextVNode as ae, toDisplayString as y, resolveComponent as Te, resolveDirective as At, withDirectives as pe, createBlock as V, resolveDynamicComponent as Oe, withCtx as H, createCommentVNode as _, normalizeClass as W, createElementVNode as l, defineComponent as be, computed as j, withModifiers as Xe, Fragment as Y, createVNode as D, unref as r, watch as Be, onBeforeUnmount as it, Transition as Vo, isRef as Ko, vModelText as tt, renderList as oe, vModelCheckbox as jt, vModelDynamic as qo, ref as B, nextTick as Je } from "vue";
import { s as Ae, f as ve, R as Mt, a as Wo, b as Rt, B as Yo, c as Zo, x as Qe, d as Go } from "./index-H3SmzmI1.js";
import { on as Tt, api as de, host as Fe, loadByTagName as Xo, define as Jo } from "@wippy-fe/proxy";
import { Icon as O } from "@iconify/vue";
import { i as Qo, e as en, a as tn, f as on, d as ht, v as nn, b as rn, u as an, c as sn } from "./install-form-Ce0pU51G.js";
import { r as ln } from "./principals-Bury5BH3.js";
var cn = `
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
`, dn = {
  root: function(t) {
    var o = t.props, n = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": It(o.value) && String(o.value).length === 1,
      "p-badge-dot": Et(o.value) && !n.$slots.default,
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
}, un = he.extend({
  name: "badge",
  style: cn,
  classes: dn
}), pn = {
  name: "BaseBadge",
  extends: Ae,
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
  style: un,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function xt(e, t, o) {
  return (t = bn(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function bn(e) {
  var t = fn(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function fn(e, t) {
  if (Se(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Se(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ot = {
  name: "Badge",
  extends: pn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ve(xt(xt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, gn = ["data-p"];
function mn(e, t, o, n, i, a) {
  return s(), d("span", U({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [ee(e.$slots, "default", {}, function() {
    return [ae(y(e.value), 1)];
  })], 16, gn);
}
Ot.render = mn;
var vn = `
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
function le(e, t, o) {
  return (t = hn(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function hn(e) {
  var t = xn(e, "string");
  return ze(t) == "symbol" ? t : t + "";
}
function xn(e, t) {
  if (ze(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (ze(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var yn = {
  root: function(t) {
    var o = t.instance, n = t.props;
    return ["p-button p-component", le(le(le(le(le(le(le(le(le({
      "p-button-icon-only": o.hasIcon && !n.label && !n.badge,
      "p-button-vertical": (n.iconPos === "top" || n.iconPos === "bottom") && n.label,
      "p-button-loading": n.loading,
      "p-button-link": n.link || n.variant === "link"
    }, "p-button-".concat(n.severity), n.severity), "p-button-raised", n.raised), "p-button-rounded", n.rounded), "p-button-text", n.text || n.variant === "text"), "p-button-outlined", n.outlined || n.variant === "outlined"), "p-button-sm", n.size === "small"), "p-button-lg", n.size === "large"), "p-button-plain", n.plain), "p-button-fluid", o.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var o = t.props;
    return ["p-button-icon", le({}, "p-button-icon-".concat(o.iconPos), o.label)];
  },
  label: "p-button-label"
}, kn = he.extend({
  name: "button",
  style: vn,
  classes: yn
}), wn = {
  name: "BaseButton",
  extends: Ae,
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
  style: kn,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
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
function Q(e, t, o) {
  return (t = _n(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function _n(e) {
  var t = $n(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function $n(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Pe(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var X = {
  name: "Button",
  extends: wn,
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
      return U(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return ve(Q(Q(Q(Q(Q(Q(Q(Q(Q(Q({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return ve(Q(Q({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return ve(Q(Q({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Wo,
    Badge: Ot
  },
  directives: {
    ripple: Mt
  }
}, Cn = ["data-p"], Sn = ["data-p"];
function zn(e, t, o, n, i, a) {
  var b = Te("SpinnerIcon"), g = Te("Badge"), $ = At("ripple");
  return e.asChild ? ee(e.$slots, "default", {
    key: 1,
    class: W(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : pe((s(), V(Oe(e.as), U({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: H(function() {
      return [ee(e.$slots, "default", {}, function() {
        return [e.loading ? ee(e.$slots, "loadingicon", U({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (s(), d("span", U({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (s(), V(b, U({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ee(e.$slots, "icon", U({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (s(), d("span", U({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Cn)) : _("", !0)];
        }), e.label ? (s(), d("span", U({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), y(e.label), 17, Sn)) : _("", !0), e.badge ? (s(), V(g, {
          key: 3,
          value: e.badge,
          class: W(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : _("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[$]]);
}
X.render = zn;
var Pn = `
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
`, Dn = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, En = he.extend({
  name: "progressspinner",
  style: Pn,
  classes: Dn
}), In = {
  name: "BaseProgressSpinner",
  extends: Ae,
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
  style: En,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Bt = {
  name: "ProgressSpinner",
  extends: In,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Ln = ["fill", "stroke-width"];
function An(e, t, o, n, i, a) {
  return s(), d("div", U({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(s(), d("svg", U({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [l("circle", U({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, Ln)], 16))], 16);
}
Bt.render = An;
const jn = { key: 0 }, Mn = /* @__PURE__ */ be({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, o = j(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (n, i) => e.state.deleting_at ? (s(), d("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: i[1] || (i[1] = Xe(() => {
      }, ["stop"])),
      onKeydown: i[2] || (i[2] = Xe(() => {
      }, ["stop"]))
    }, [
      o.value ? (s(), d(Y, { key: 0 }, [
        l("span", null, [
          i[3] || (i[3] = ae("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (s(), d("span", jn, ": " + y(e.state.deletion_job.last_error), 1)) : _("", !0)
        ]),
        D(r(X), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: i[0] || (i[0] = Xe((a) => n.$emit("retry"), ["stop"]))
        })
      ], 64)) : (s(), d(Y, { key: 1 }, [
        D(r(Bt), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        i[4] || (i[4] = l("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : _("", !0);
  }
});
function _e(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Rn(e, t) {
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
function Tn(e, t) {
  if (!t) return e;
  const o = {};
  for (const [n, i] of Object.entries(e))
    o[n] = Rn(t[n], i);
  return o;
}
function Ft(e, t, o) {
  if (t !== void 0 && !t) return null;
  const n = _e(e) ? e : {}, i = [
    n,
    _e(n.data) ? n.data : null,
    _e(n.payload) ? n.payload : null,
    _e(n.detail) ? n.detail : null
  ].filter(Boolean);
  for (const a of i) {
    if (a.event !== "component.meta.changed" && a.event !== "component.deleting" && a.event !== "component.deleted") continue;
    const b = String(a.component_id || ""), g = String(n.topic || a.topic || "");
    if (t === void 0) {
      if (!b && (!g.startsWith("component.") || g === "component.")) continue;
    } else if (b && b !== t || !b && g !== `component.${t}`) continue;
    const $ = b || t || g.slice(10);
    return a.event === "component.deleting" && typeof a.deletion_job_id == "string" && a.deletion_job_id ? { event: a.event, component_id: $, deletion_job_id: a.deletion_job_id } : a.event !== "component.meta.changed" ? { event: a.event, component_id: $ } : {
      event: "component.meta.changed",
      component_id: $,
      meta: Tn(_e(a.meta) ? a.meta : {}, o),
      deleted: Array.isArray(a.deleted) ? a.deleted.map(String) : []
    };
  }
  return null;
}
function On(e, t, o) {
  const n = Ft(e, t, o);
  return n?.event === "component.meta.changed" ? n : null;
}
function Bn(e, t) {
  const o = Ft(e, t);
  return o && o.event !== "component.meta.changed" ? o : null;
}
function Fn(e, t, o) {
  if (!e) return null;
  const n = Tt(`component.${e}`, (i) => {
    const a = On(i, e, o);
    a && t(a);
  });
  return typeof n == "function" ? n : null;
}
function Nn(e, t, o, n) {
  let i = !0;
  const a = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Map();
  function g(v, u) {
    const m = e.value.find((G) => t(G) === v), x = b.get(v), L = u?.job_id || x?.deletion_job_id || m?.deletion_job_id, N = x ? x.deletion_job_id : m?.deleting_at ? m.deletion_job_id : void 0;
    if ((x || m?.deleting_at) && L === N) return;
    const J = {
      deleting_at: x?.deleting_at || m?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: L
    };
    b.set(v, J), m && (Object.assign(m, J), m.deletion_job = void 0);
  }
  async function $(v) {
    const u = t(v), m = b.get(u), x = () => i && e.value.includes(v) && b.get(u) === m;
    try {
      const { data: L } = await de.get(`/api/v1/components/${encodeURIComponent(u)}`);
      if (!L?.success) throw new Error(te(L, "Could not read deletion progress"));
      x() && (v.deleting_at = m?.deleting_at || L.deleting_at, v.deletion_job_id = L.deletion_job_id, m && (m.deletion_job_id = v.deletion_job_id), v.deletion_job = L.deletion_job ?? null);
    } catch (L) {
      x() && Fe.handleError("other", { message: te(L, "Could not read deletion progress") });
    }
  }
  let f = [];
  const C = Be(() => e.value, (v, u = []) => {
    const m = v.filter((x) => !a.has(t(x)));
    for (const x of u)
      a.has(t(x)) || m.some((L) => t(L) === t(x)) || x.deleting_at && n?.(t(x));
    if (m.length !== v.length) {
      e.value = m;
      return;
    }
    for (const x of v) {
      const L = b.get(t(x));
      L && (x.deletion_job_id !== L.deletion_job_id && (x.deletion_job = void 0), Object.assign(x, L));
      const N = u.find((J) => t(J) === t(x));
      x.deletion_job === void 0 && N?.deletion_job_id === x.deletion_job_id && (x.deletion_job = N?.deletion_job), x.deleting_at && !f.includes(x) && $(x);
    }
    f = v;
  }, { immediate: !0 }), h = Tt("@message", (v) => {
    const u = Bn(v);
    if (!u) return;
    const m = e.value.find((x) => t(x) === u.component_id);
    u.event === "component.deleted" ? (m && !a.has(u.component_id) && n?.(u.component_id), a.add(u.component_id), b.delete(u.component_id), e.value = e.value.filter((x) => t(x) !== u.component_id)) : m && g(u.component_id, { job_id: u.deletion_job_id });
  });
  return it(() => {
    i = !1, C(), typeof h == "function" && h();
  }), { acceptDeletion: g };
}
var Nt = {
  name: "WindowMaximizeIcon",
  extends: Rt
};
function Un(e) {
  return qn(e) || Kn(e) || Vn(e) || Hn();
}
function Hn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Vn(e, t) {
  if (e) {
    if (typeof e == "string") return ot(e, t);
    var o = {}.toString.call(e).slice(8, -1);
    return o === "Object" && e.constructor && (o = e.constructor.name), o === "Map" || o === "Set" ? Array.from(e) : o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? ot(e, t) : void 0;
  }
}
function Kn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function qn(e) {
  if (Array.isArray(e)) return ot(e);
}
function ot(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var o = 0, n = Array(t); o < t; o++) n[o] = e[o];
  return n;
}
function Wn(e, t, o, n, i, a) {
  return s(), d("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Un(t[0] || (t[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Nt.render = Wn;
var Ut = {
  name: "WindowMinimizeIcon",
  extends: Rt
};
function Yn(e) {
  return Jn(e) || Xn(e) || Gn(e) || Zn();
}
function Zn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Gn(e, t) {
  if (e) {
    if (typeof e == "string") return nt(e, t);
    var o = {}.toString.call(e).slice(8, -1);
    return o === "Object" && e.constructor && (o = e.constructor.name), o === "Map" || o === "Set" ? Array.from(e) : o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? nt(e, t) : void 0;
  }
}
function Xn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Jn(e) {
  if (Array.isArray(e)) return nt(e);
}
function nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var o = 0, n = Array(t); o < t; o++) n[o] = e[o];
  return n;
}
function Qn(e, t, o, n, i, a) {
  return s(), d("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Yn(t[0] || (t[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ut.render = Qn;
var er = he.extend({
  name: "focustrap-directive"
}), tr = Yo.extend({
  style: er
});
function De(e) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, De(e);
}
function yt(e, t) {
  var o = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), o.push.apply(o, n);
  }
  return o;
}
function kt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var o = arguments[t] != null ? arguments[t] : {};
    t % 2 ? yt(Object(o), !0).forEach(function(n) {
      or(e, n, o[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(o)) : yt(Object(o)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(o, n));
    });
  }
  return e;
}
function or(e, t, o) {
  return (t = nr(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function nr(e) {
  var t = rr(e, "string");
  return De(t) == "symbol" ? t : t + "";
}
function rr(e, t) {
  if (De(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (De(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ar = tr.extend("focustrap", {
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
      var n = this, i = o.value || {}, a = i.onFocusIn, b = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(g) {
        g.forEach(function($) {
          if ($.type === "childList" && !t.contains(document.activeElement)) {
            var f = function(h) {
              var v = vt(h) ? vt(h, n.getComputedSelector(t.$_pfocustrap_focusableselector)) ? h : we(t, n.getComputedSelector(t.$_pfocustrap_focusableselector)) : we(h);
              return It(v) ? v : h.nextSibling && f(h.nextSibling);
            };
            me(f($.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(g) {
        return a && a(g);
      }, t.$_pfocustrap_focusoutlistener = function(g) {
        return b && b(g);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: kt(kt({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, o) {
      var n = o.value || {}, i = n.autoFocusSelector, a = i === void 0 ? "" : i, b = n.firstFocusableSelector, g = b === void 0 ? "" : b, $ = n.autoFocus, f = $ === void 0 ? !1 : $, C = we(t, "[autofocus]".concat(this.getComputedSelector(a)));
      f && !C && (C = we(t, this.getComputedSelector(g))), me(C);
    },
    onFirstHiddenElementFocus: function(t) {
      var o, n = t.currentTarget, i = t.relatedTarget, a = i === n.$_pfocustrap_lasthiddenfocusableelement || !((o = this.$el) !== null && o !== void 0 && o.contains(i)) ? we(n.parentElement, this.getComputedSelector(n.$_pfocustrap_focusableselector)) : n.$_pfocustrap_lasthiddenfocusableelement;
      me(a);
    },
    onLastHiddenElementFocus: function(t) {
      var o, n = t.currentTarget, i = t.relatedTarget, a = i === n.$_pfocustrap_firsthiddenfocusableelement || !((o = this.$el) !== null && o !== void 0 && o.contains(i)) ? Io(n.parentElement, this.getComputedSelector(n.$_pfocustrap_focusableselector)) : n.$_pfocustrap_firsthiddenfocusableelement;
      me(a);
    },
    createHiddenFocusableElements: function(t, o) {
      var n = this, i = o.value || {}, a = i.tabIndex, b = a === void 0 ? 0 : a, g = i.firstFocusableSelector, $ = g === void 0 ? "" : g, f = i.lastFocusableSelector, C = f === void 0 ? "" : f, h = function(x) {
        return Lo("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: b,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: x?.bind(n)
        });
      }, v = h(this.onFirstHiddenElementFocus), u = h(this.onLastHiddenElementFocus);
      v.$_pfocustrap_lasthiddenfocusableelement = u, v.$_pfocustrap_focusableselector = $, v.setAttribute("data-pc-section", "firstfocusableelement"), u.$_pfocustrap_firsthiddenfocusableelement = v, u.$_pfocustrap_focusableselector = C, u.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(v), t.append(u);
    }
  }
});
function wt() {
  jo({
    variableName: Lt("scrollbar.width").name
  });
}
function _t() {
  Ao({
    variableName: Lt("scrollbar.width").name
  });
}
var ir = `
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
`, sr = {
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
}, lr = {
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
}, cr = he.extend({
  name: "dialog",
  style: ir,
  classes: lr,
  inlineStyles: sr
}), dr = {
  name: "BaseDialog",
  extends: Ae,
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
  style: cr,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Ce = {
  name: "Dialog",
  extends: dr,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: j(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && Qe.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && Qe.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && No(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), me(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && Qe.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
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
      o || (o = this.$slots.header && t(this.headerContainer), o || (o = this.$slots.default && t(this.content), o || (this.maximizable ? (this.focusableMax = !0, o = this.maximizableButton) : (this.focusableClose = !0, o = this.closeButton)))), o && me(o, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? wt() : _t());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && wt();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && _t();
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
          var n = Ro(t.container), i = To(t.container), a = o.pageX - t.lastPageX, b = o.pageY - t.lastPageY, g = t.container.getBoundingClientRect(), $ = g.left + a, f = g.top + b, C = Oo(), h = getComputedStyle(t.container), v = parseFloat(h.marginLeft), u = parseFloat(h.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? ($ >= t.minX && $ + n < C.width && (t.lastPageX = o.pageX, t.container.style.left = $ - v + "px"), f >= t.minY && f + i < C.height && (t.lastPageY = o.pageY, t.container.style.top = f - u + "px")) : (t.lastPageX = o.pageX, t.container.style.left = $ - v + "px", t.lastPageY = o.pageY, t.container.style.top = f - u + "px");
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
      return ve({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Mt,
    focustrap: ar
  },
  components: {
    Button: X,
    Portal: Mo,
    WindowMinimizeIcon: Ut,
    WindowMaximizeIcon: Nt,
    TimesIcon: Zo
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
function $t(e, t) {
  var o = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), o.push.apply(o, n);
  }
  return o;
}
function Ct(e) {
  for (var t = 1; t < arguments.length; t++) {
    var o = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $t(Object(o), !0).forEach(function(n) {
      ur(e, n, o[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(o)) : $t(Object(o)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(o, n));
    });
  }
  return e;
}
function ur(e, t, o) {
  return (t = pr(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function pr(e) {
  var t = br(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function br(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Ee(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var fr = ["data-p"], gr = ["aria-labelledby", "aria-modal", "data-p"], mr = ["id"], vr = ["data-p"];
function hr(e, t, o, n, i, a) {
  var b = Te("Button"), g = Te("Portal"), $ = At("focustrap");
  return s(), V(g, {
    appendTo: e.appendTo
  }, {
    default: H(function() {
      return [i.containerVisible ? (s(), d("div", U({
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
      }, e.ptm("mask")), [D(Vo, U({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: H(function() {
          return [e.visible ? pe((s(), d("div", U({
            key: 0,
            ref: a.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": a.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": a.dataP
          }, e.ptmi("root")), [e.$slots.container ? ee(e.$slots, "container", {
            key: 0,
            closeCallback: a.close,
            maximizeCallback: function(C) {
              return a.maximize(C);
            },
            initDragCallback: a.initDrag
          }) : (s(), d(Y, {
            key: 1
          }, [e.showHeader ? (s(), d("div", U({
            key: 0,
            ref: a.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, e.ptm("header")), [ee(e.$slots, "header", {
            class: W(e.cx("title"))
          }, function() {
            return [e.header ? (s(), d("span", U({
              key: 0,
              id: a.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), y(e.header), 17, mr)) : _("", !0)];
          }), l("div", U({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? ee(e.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(C) {
              return a.maximize(C);
            }
          }, function() {
            return [D(b, U({
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
              icon: H(function(f) {
                return [ee(e.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(s(), V(Oe(a.maximizeIconComponent), U({
                    class: [f.class, i.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : _("", !0), e.closable ? ee(e.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [D(b, U({
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
              icon: H(function(f) {
                return [ee(e.$slots, "closeicon", {}, function() {
                  return [(s(), V(Oe(e.closeIcon ? "span" : "TimesIcon"), U({
                    class: [e.closeIcon, f.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : _("", !0)], 16)], 16)) : _("", !0), l("div", U({
            ref: a.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": a.dataP
          }, Ct(Ct({}, e.contentProps), e.ptm("content"))), [ee(e.$slots, "default")], 16, vr), e.footer || e.$slots.footer ? (s(), d("div", U({
            key: 1,
            ref: a.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [ee(e.$slots, "footer", {}, function() {
            return [ae(y(e.footer), 1)];
          })], 16)) : _("", !0)], 64))], 16, gr)), [[$, {
            disabled: !e.modal
          }]]) : _("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, fr)) : _("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Ce.render = hr;
var xr = `
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
`, yr = {
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
}, kr = he.extend({
  name: "tag",
  style: xr,
  classes: yr
}), wr = {
  name: "BaseTag",
  extends: Ae,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: kr,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
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
function _r(e, t, o) {
  return (t = $r(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function $r(e) {
  var t = Cr(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function Cr(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Ie(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var st = {
  name: "Tag",
  extends: wr,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ve(_r({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Sr = ["data-p"];
function zr(e, t, o, n, i, a) {
  return s(), d("span", U({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (s(), V(Oe(e.$slots.icon), U({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (s(), d("span", U({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : _("", !0), e.value != null || e.$slots.default ? ee(e.$slots, "default", {
    key: 2
  }, function() {
    return [l("span", U({
      class: e.cx("label")
    }, e.ptm("label")), y(e.value), 17)];
  }) : _("", !0)], 16, Sr);
}
st.render = zr;
function Pr(e) {
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
  const o = Pr(e);
  if (o === null) return "";
  const n = t?.now ?? Date.now(), i = t?.suffix ?? !0, a = t?.maxUnit ?? "day", b = t?.future ?? !1, g = 6e4, $ = 60 * g, f = 24 * $, C = 30 * f, h = 365 * f, v = n - o;
  if (b && v < 0) {
    const x = -v;
    return x < g ? "in <1m" : x < $ ? `in ${Math.floor(x / g)}m` : x < f ? `in ${Math.floor(x / $)}h` : `in ${Math.floor(x / f)}d`;
  }
  const u = Math.max(0, v);
  if (u < g) return "just now";
  const m = i ? " ago" : "";
  return u < $ ? `${Math.floor(u / g)}m${m}` : u < f ? `${Math.floor(u / $)}h${m}` : a === "year" ? u < C ? `${Math.floor(u / f)}d${m}` : u < h ? `${Math.floor(u / C)}mo${m}` : `${Math.floor(u / h)}y${m}` : `${Math.floor(u / f)}d${m}`;
}
function rt(e) {
  return String(e.description || "").trim();
}
function Ht(e) {
  const t = e?.tag_name;
  return typeof t == "string" ? t.trim() : "";
}
function Vt(e) {
  const t = typeof e?.base_path == "string" ? e.base_path.trim() : "", o = typeof e?.entry_point == "string" ? e.entry_point.trim() : "";
  return t && o ? `/${t}/${o}` : typeof e?.url == "string" ? e.url.trim() : "";
}
function at(e) {
  return Ht(e?.component?.create_ui);
}
function Dr(e) {
  return Vt(e?.component?.create_ui);
}
function lt(e) {
  return Ht(e?.component?.manage_ui);
}
function Kt(e) {
  return Vt(e?.component?.manage_ui);
}
function qt(e, t) {
  return { id: e.id, automation: e, public_state: e.public_state || {}, type: t };
}
let St = 0;
function Er(e) {
  e && (St += 1, e.setAttribute("submit-nonce", String(St)));
}
const Ir = { class: "kx-modal-head-icon" }, Lr = { class: "kx-modal-head-text" }, Ar = { class: "kx-modal-head-title" }, jr = {
  key: 0,
  class: "kx-2p-l"
}, Mr = { class: "kx-cat-search" }, Rr = {
  key: 0,
  class: "kx-cat-empty"
}, Tr = {
  key: 1,
  class: "kx-cat"
}, Or = ["onClick"], Br = { class: "kx-cat-ico" }, Fr = { class: "kx-cat-text" }, Nr = { class: "kx-cat-name" }, Ur = {
  key: 0,
  class: "kx-cat-desc"
}, Hr = { class: "kx-2p-r" }, Vr = {
  key: 0,
  class: "kx-2p-r-head"
}, Kr = { class: "kx-2p-r-body" }, qr = {
  key: 0,
  class: "kx-2p-r-note"
}, Wr = {
  key: 1,
  class: "kx-2p-r-note"
}, Yr = {
  key: 2,
  class: "kx-form"
}, Zr = { class: "kx-field-lbl" }, Gr = {
  key: 0,
  class: "kx-req",
  "aria-hidden": "true"
}, Xr = ["onUpdate:modelValue"], Jr = ["onUpdate:modelValue"], Qr = ["onUpdate:modelValue", "type", "placeholder"], ea = {
  key: 4,
  class: "kx-field-hint"
}, ta = {
  key: 5,
  class: "kx-field-hint"
}, oa = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, na = /* @__PURE__ */ be({
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
      installForm: b,
      installing: g,
      customSaving: $,
      installError: f,
      customInstallHost: C,
      installSearchInput: h,
      typeSearch: v,
      filteredTypes: u,
      chooseType: m,
      closeInstall: x,
      focusInstallDialog: L,
      onCreate: N
    } = t.flow;
    return (J, G) => (s(), V(r(Ce), {
      visible: r(i),
      modal: !0,
      "block-scroll": !0,
      "dismissable-mask": !0,
      pt: e.dialogPt,
      class: W(["kx-modal kx-modal-2p", { "kx-modal-solo": !r(o) }]),
      "aria-label": "Add an automation",
      "onUpdate:visible": G[1] || (G[1] = (A) => {
        A || r(x)();
      }),
      onShow: r(L)
    }, {
      header: H(() => [
        l("span", Ir, [
          D(r(O), {
            icon: r(a) && r(a).icon || "tabler:bolt",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        l("span", Lr, [
          l("span", Ar, y(r(a) ? r(a).title || r(a).name : "Add an automation"), 1),
          G[2] || (G[2] = l("span", { class: "kx-modal-head-sub" }, "Configure an automation.", -1))
        ])
      ]),
      footer: H(() => [
        r(f) ? (s(), d("div", oa, y(r(f)), 1)) : _("", !0),
        D(r(X), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: r(g) || r($),
          onClick: r(x)
        }, null, 8, ["disabled", "onClick"]),
        r(a) ? (s(), V(r(X), {
          key: 1,
          type: "button",
          "data-testid": "automations-install-create",
          label: r(g) || r($) ? "Creating…" : "Create",
          loading: r(g) || r($),
          disabled: r(g) || r($),
          onClick: r(N)
        }, {
          icon: H(({ class: A }) => [
            D(r(O), {
              icon: "tabler:plus",
              class: W(A),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["label", "loading", "disabled", "onClick"])) : _("", !0)
      ]),
      default: H(() => [
        l("div", {
          class: W(["kx-2p", { "kx-2p-solo": !r(o) }])
        }, [
          r(o) ? (s(), d("div", jr, [
            l("div", Mr, [
              D(r(O), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              pe(l("input", {
                ref_key: "installSearchInput",
                ref: h,
                "onUpdate:modelValue": G[0] || (G[0] = (A) => Ko(v) ? v.value = A : null),
                "data-modal-initial": "",
                type: "text",
                placeholder: "Search types…",
                "aria-label": "Search automation types"
              }, null, 512), [
                [tt, r(v)]
              ])
            ]),
            r(u).length ? (s(), d("div", Tr, [
              (s(!0), d(Y, null, oe(r(u), (A) => (s(), d("button", {
                key: A.id,
                class: W(["kx-cat-card", r(a)?.id === A.id && "sel"]),
                onClick: (K) => r(m)(A)
              }, [
                l("span", Br, [
                  D(r(O), {
                    icon: A.icon || "tabler:sparkles",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                l("span", Fr, [
                  l("span", Nr, y(A.title || A.name), 1),
                  r(rt)(A) ? (s(), d("span", Ur, y(r(rt)(A)), 1)) : _("", !0)
                ]),
                D(r(O), {
                  icon: "tabler:check",
                  class: "kx-cat-check",
                  "aria-hidden": "true"
                })
              ], 10, Or))), 128))
            ])) : (s(), d("div", Rr, "No setups match “" + y(r(v)) + "”.", 1))
          ])) : _("", !0),
          l("div", Hr, [
            r(o) ? (s(), d("div", Vr, "Setup")) : _("", !0),
            l("div", Kr, [
              r(a) ? (s(), d(Y, { key: 1 }, [
                r(at)(r(a)) ? (s(), d("div", {
                  key: 0,
                  ref_key: "customInstallHost",
                  ref: C,
                  class: "kx-custom-host"
                }, null, 512)) : r(n).length ? (s(), d("div", Yr, [
                  (s(!0), d(Y, null, oe(r(n), ([A, K]) => (s(), d("label", {
                    key: A,
                    class: "kx-field"
                  }, [
                    l("span", Zr, [
                      ae(y(K.title || A) + " ", 1),
                      r(Qo)(r(a), A) ? (s(), d("span", Gr, "*")) : _("", !0)
                    ]),
                    K.enum ? (s(), V(r(Go), {
                      key: 0,
                      class: "kx-select",
                      "model-value": r(b)[A],
                      options: r(en)(r(a), A, K),
                      "option-label": "label",
                      "option-value": "value",
                      placeholder: "—",
                      "aria-label": K.title || A,
                      "onUpdate:modelValue": (S) => r(b)[A] = S
                    }, null, 8, ["model-value", "options", "aria-label", "onUpdate:modelValue"])) : K.type === "boolean" ? pe((s(), d("input", {
                      key: 1,
                      "onUpdate:modelValue": (S) => r(b)[A] = S,
                      class: "kx-check",
                      type: "checkbox"
                    }, null, 8, Xr)), [
                      [jt, r(b)[A]]
                    ]) : K.type === "number" || K.type === "integer" ? pe((s(), d("input", {
                      key: 2,
                      "onUpdate:modelValue": (S) => r(b)[A] = S,
                      class: "kx-input",
                      type: "number"
                    }, null, 8, Jr)), [
                      [
                        tt,
                        r(b)[A],
                        void 0,
                        { number: !0 }
                      ]
                    ]) : pe((s(), d("input", {
                      key: 3,
                      "onUpdate:modelValue": (S) => r(b)[A] = S,
                      class: "kx-input",
                      type: r(tn)(K),
                      placeholder: K.description || ""
                    }, null, 8, Qr)), [
                      [qo, r(b)[A]]
                    ]),
                    K.description && !(K.type !== "boolean" && !K.enum) ? (s(), d("span", ea, y(K.description), 1)) : K.description && K.enum ? (s(), d("span", ta, y(K.description), 1)) : _("", !0)
                  ]))), 128))
                ])) : (s(), d("div", Wr, "This automation needs no configuration."))
              ], 64)) : (s(), d("p", qr, "Select an automation type to configure it."))
            ])
          ])
        ], 2)
      ]),
      _: 1
    }, 8, ["visible", "pt", "class", "onShow"]));
  }
}), ra = {
  key: 0,
  class: "kx-metrics"
}, aa = { class: "kx-metric-k" }, ia = ["title"], sa = {
  key: 1,
  class: "kx-metric-details"
}, la = { class: "kx-metrics kx-metrics-detail" }, ca = { class: "kx-metric-k" }, da = ["title"], ua = /* @__PURE__ */ be({
  __name: "RowMetrics",
  props: {
    face: { default: () => [] },
    detail: { default: () => [] }
  },
  setup(e) {
    return (t, o) => (s(), d(Y, null, [
      e.face.length ? (s(), d("div", ra, [
        (s(!0), d(Y, null, oe(e.face, (n) => (s(), d("span", {
          key: n.label,
          class: "kx-metric"
        }, [
          n.icon ? (s(), V(r(O), {
            key: 0,
            icon: n.icon,
            class: "kx-metric-i",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : _("", !0),
          l("span", aa, y(n.label), 1),
          l("span", {
            class: "kx-metric-v",
            title: n.title
          }, y(n.value), 9, ia)
        ]))), 128))
      ])) : _("", !0),
      e.detail.length ? (s(), d("details", sa, [
        o[0] || (o[0] = l("summary", { class: "kx-metric-more" }, "Details", -1)),
        l("div", la, [
          (s(!0), d(Y, null, oe(e.detail, (n) => (s(), d("span", {
            key: n.label,
            class: "kx-metric"
          }, [
            n.icon ? (s(), V(r(O), {
              key: 0,
              icon: n.icon,
              class: "kx-metric-i",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : _("", !0),
            l("span", ca, y(n.label), 1),
            l("span", {
              class: "kx-metric-v",
              title: n.title
            }, y(n.value), 9, da)
          ]))), 128))
        ])
      ])) : _("", !0)
    ], 64));
  }
}), pa = /* @__PURE__ */ new Set(["pause", "resume"]), ba = /* @__PURE__ */ new Set(["reconfigure"]), zt = /* @__PURE__ */ new Set(["run_now", "trigger", "execute", "run"]), et = {
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
function Wt(e) {
  return e.has("run_now") ? "run_now" : e.has("trigger") ? "trigger" : e.has("execute") ? "execute" : "";
}
function fa(e) {
  return e.replace(/[._-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Pt(e) {
  return { label: fa(e), description: "Run this action.", group: "recovery", icon: "tabler:bolt" };
}
function Yt(e) {
  return new Set([...e?.controls || [], ...e?.actions || []].map((t) => t.name).filter(Boolean));
}
function Zt(e) {
  const t = [...Yt(e)], o = !!lt(e);
  return {
    declared: t,
    requiresKeys: e?.controls?.filter((n) => n.keys_required).map((n) => n.name),
    runNow: Wt(new Set(t)),
    canReconfigure: o,
    // An automation is a component, so it shares through the generic component
    // access endpoints; the server is the authority on who may grant.
    canShare: !0,
    canExport: e?.exportable === !0,
    canDelete: !0
  };
}
function Gt(e) {
  const t = e instanceof Set ? e : new Set(e);
  return t.has("rewind") ? "rewind" : t.has("resync") ? "resync" : "";
}
function Xt(e) {
  const t = [];
  if (e.runNow) {
    const n = et[e.runNow] || et.trigger;
    t.push({ method: e.runNow, ...n, kind: "call" });
  }
  const o = /* @__PURE__ */ new Set();
  for (const n of e.declared) {
    if (pa.has(n) || n === e.runNow || e.runNow !== "run_now" && zt.has(n) || ba.has(n) || o.has(n)) continue;
    o.add(n);
    const i = e.runNow === "run_now" && zt.has(n) ? { ...Pt(n), group: "run" } : et[n] || Pt(n);
    t.push({ method: n, ...i, kind: "call", disabled: e.requiresKeys?.includes(n) });
  }
  return e.canReconfigure && t.push({ method: "reconfigure", label: "Reconfigure", description: "Change how this automation is set up.", group: "edit", icon: "tabler:settings", kind: "reconfigure" }), e.canShare && t.push({ method: "share", label: "Share", description: "Give other people access to this automation.", group: "edit", icon: "tabler:users", kind: "share" }), e.canExport && t.push({ method: "export", label: "Export", description: "Download a portable copy to import elsewhere.", group: "edit", icon: "tabler:download", kind: "export" }), e.canDelete && t.push({ method: "delete", label: "Delete", description: "Stop it and remove its setup. This cannot be undone.", group: "delete", icon: "tabler:trash", kind: "delete", danger: !0 }), t;
}
const ga = ["run", "recovery", "edit", "delete"], ma = {
  run: "Run",
  recovery: "Recovery",
  edit: "Edit",
  delete: ""
};
function va(e) {
  return ga.map((t) => ({ group: t, label: ma[t], items: e.filter((o) => o.group === t) })).filter((t) => t.items.length > 0);
}
function ha(e, t) {
  return e.group === "run" ? `Run ${t} now` : e.method === "reconfigure" ? `Edit ${t}` : `${e.label} ${t}`;
}
const xa = ["aria-label"], ya = {
  key: 1,
  class: "kx-menu-sep",
  role: "separator"
}, ka = ["data-testid", "aria-label", "disabled", "onClick"], wa = { class: "kx-menu-item-body" }, _a = { class: "kx-menu-item-label" }, $a = { class: "kx-menu-item-desc" }, Jt = /* @__PURE__ */ be({
  __name: "ActionMenu",
  props: {
    items: {},
    name: {},
    busy: { type: Boolean },
    disabled: { type: Boolean },
    size: {},
    triggerLabel: {}
  },
  emits: ["select"],
  setup(e, { emit: t }) {
    const o = e, n = t, i = B(!1), a = B(null), b = j(() => va(o.items));
    function g() {
      i.value = !i.value;
    }
    function $() {
      i.value = !1;
    }
    function f(C) {
      o.disabled || C.disabled || ($(), n("select", C.method));
    }
    return (C, h) => (s(), d("span", {
      ref_key: "trigger",
      ref: a,
      class: "kx-menu"
    }, [
      D(r(X), {
        type: "button",
        severity: "secondary",
        outlined: "",
        size: e.size === "normal" ? void 0 : "small",
        class: W(["kx-menu-trigger", i.value && "is-active"]),
        "aria-haspopup": !0,
        "aria-expanded": i.value,
        "aria-label": e.triggerLabel || `More actions for ${e.name}`,
        title: "More actions",
        disabled: e.disabled,
        onClick: g
      }, {
        icon: H(({ class: v }) => [
          D(r(O), {
            icon: "tabler:dots",
            "aria-hidden": "true",
            class: W(v)
          }, null, 8, ["class"])
        ]),
        _: 1
      }, 8, ["size", "class", "aria-expanded", "aria-label", "disabled"]),
      D(Uo, {
        open: i.value,
        "onUpdate:open": h[0] || (h[0] = (v) => i.value = v),
        anchor: a.value,
        align: "right",
        width: 264,
        "max-height": 460,
        gap: 6
      }, {
        default: H(() => [
          l("div", {
            class: "kx-menu-panel",
            role: "menu",
            "aria-label": `Actions for ${e.name}`
          }, [
            (s(!0), d(Y, null, oe(b.value, (v, u) => (s(), d(Y, {
              key: v.group
            }, [
              v.label ? (s(), d("div", {
                key: 0,
                class: W(["kx-menu-group", u === 0 && "is-first"])
              }, y(v.label), 3)) : u > 0 ? (s(), d("div", ya)) : _("", !0),
              (s(!0), d(Y, null, oe(v.items, (m) => (s(), d("button", {
                key: m.method,
                type: "button",
                role: "menuitem",
                class: W(["kx-menu-item", [m.danger && "is-danger", m.warn && "is-warn"]]),
                "data-testid": `action-${m.method}`,
                "aria-label": r(ha)(m, e.name),
                disabled: e.disabled || m.disabled || e.busy && m.kind === "call",
                onClick: (x) => f(m)
              }, [
                D(r(O), {
                  icon: m.icon,
                  class: "kx-menu-item-ico",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                l("span", wa, [
                  l("span", _a, [
                    ae(y(m.label) + " ", 1),
                    m.warn ? (s(), V(r(O), {
                      key: 0,
                      icon: "tabler:alert-triangle",
                      class: "kx-menu-item-warn",
                      "aria-hidden": "true"
                    })) : _("", !0)
                  ]),
                  l("span", $a, y(m.description), 1)
                ])
              ], 10, ka))), 128))
            ], 64))), 128))
          ], 8, xa)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 512));
  }
}), Ca = {
  "aria-label": "Execution history",
  class: "kx-history"
}, Sa = {
  key: 0,
  role: "status",
  class: "kx-dnote"
}, za = {
  key: 1,
  role: "alert",
  class: "kx-dnote kx-dnote-err"
}, Pa = { class: "kx-history-group" }, Da = {
  key: 0,
  class: "kx-dnote"
}, Ea = { class: "kx-history-head" }, Ia = ["title"], La = { class: "kx-history-state" }, Aa = { class: "kx-history-meta" }, ja = { class: "kx-history-meta" }, Ma = {
  key: 0,
  class: "kx-history-kv"
}, Ra = ["title"], Ta = ["title"], Oa = {
  key: 1,
  class: "kx-dmsg is-err"
}, Ba = { class: "kx-history-group" }, Fa = {
  key: 0,
  class: "kx-dnote"
}, Na = { class: "kx-history-head" }, Ua = { class: "kx-history-state" }, Ha = { class: "kx-history-meta" }, Va = {
  key: 0,
  class: "kx-history-kv"
}, Ka = ["title"], qa = {
  key: 1,
  class: "kx-history-meta"
}, Wa = /* @__PURE__ */ be({
  __name: "ExecutionHistory",
  props: {
    root: {}
  },
  emits: ["error"],
  setup(e, { emit: t }) {
    const o = e, n = t, i = B([]), a = B([]), b = B([]), g = B(""), $ = B(""), f = B(!1), C = B("");
    let h = 0;
    function v() {
      i.value = [], a.value = [], b.value = [], g.value = "", $.value = "";
    }
    function u(S) {
      return b.value.find((I) => I.type === S?.kind && I.id === S?.id)?.label || "Account unavailable";
    }
    function m(S) {
      return {
        recorded: "Recorded admission",
        absent: "Identity evidence absent",
        inferred: "Identity evidence inferred; unverified",
        unresolved: "Identity unresolved"
      }[S.evidence_status];
    }
    function x(S) {
      return JSON.stringify([S.drive_key, S.round_token, S.source_port, S.item_key, S.identity_key]);
    }
    function L(S) {
      return te(S, typeof S == "string" ? S : "");
    }
    async function N(S, I, P = "") {
      const { data: R } = await de.get(
        "/api/v1/automations/" + encodeURIComponent(S) + "/history",
        { params: { kind: I, page_size: 25, ...P ? { page_token: P } : {} } }
      );
      if (!R.success || R.kind !== I || !Array.isArray(R.entries)) throw new Error(R.error?.message || "Could not read execution history");
      if (R.next_page_token && R.next_page_token === P) throw new Error("History page repeats its cursor");
      return R;
    }
    async function J(S, I) {
      const P = /* @__PURE__ */ new Map();
      function R(T) {
        T && (T.kind === "user" || T.kind === "group") && P.set(T.kind + ":" + T.id, { type: T.kind, id: T.id });
      }
      for (const T of S)
        R(T.evidence?.identity?.principal), R(T.evidence?.identity?.authorized_by);
      for (const T of I)
        T.initiation && R({ kind: "user", id: T.initiation.actor_id });
      return ln([...P.values()]);
    }
    function G(S) {
      v(), C.value = te(S, "Could not read execution history"), n("error", { message: C.value, error: S });
    }
    async function A() {
      const S = ++h, I = o.root;
      if (v(), C.value = "", f.value = !1, !!I) {
        f.value = !0;
        try {
          const [P, R] = await Promise.all([N(I, "deliveries"), N(I, "controls")]), T = await J(P.entries, R.entries);
          if (S !== h) return;
          i.value = P.entries, a.value = R.entries, b.value = T, g.value = P.next_page_token || "", $.value = R.next_page_token || "";
        } catch (P) {
          S === h && G(P);
        } finally {
          S === h && (f.value = !1);
        }
      }
    }
    async function K(S) {
      if (f.value) return;
      const I = h, P = o.root, R = S === "deliveries" ? g.value : $.value;
      if (R) {
        f.value = !0, C.value = "";
        try {
          const T = await N(P, S, R), c = S === "deliveries" ? [...i.value, ...T.entries] : i.value, M = S === "controls" ? [...a.value, ...T.entries] : a.value, F = await J(c, M);
          if (I !== h) return;
          i.value = c, a.value = M, b.value = F, S === "deliveries" ? g.value = T.next_page_token || "" : $.value = T.next_page_token || "";
        } catch (T) {
          I === h && G(T);
        } finally {
          I === h && (f.value = !1);
        }
      }
    }
    return Be(() => o.root, () => {
      A();
    }, { immediate: !0 }), it(() => {
      h += 1;
    }), (S, I) => (s(), d("section", Ca, [
      f.value ? (s(), d("p", Sa, "Loading execution history…")) : _("", !0),
      C.value ? (s(), d("p", za, y(C.value), 1)) : (s(), d(Y, { key: 2 }, [
        l("div", Pa, [
          I[4] || (I[4] = l("h3", { class: "kx-dsub-lbl" }, "Committed deliveries", -1)),
          !f.value && !i.value.length ? (s(), d("p", Da, "No retained deliveries.")) : _("", !0),
          (s(!0), d(Y, null, oe(i.value, (P) => (s(), d("article", {
            key: x(P),
            class: "kx-history-entry"
          }, [
            l("div", Ea, [
              l("strong", {
                class: "kx-history-title",
                title: P.item_key
              }, y(P.item_key), 9, Ia),
              l("span", La, y(P.state), 1)
            ]),
            l("p", Aa, "Round starts " + y(r(ce)(P.round_at, { future: !0 })), 1),
            l("p", ja, y(m(P)), 1),
            P.evidence?.identity ? (s(), d("dl", Ma, [
              I[3] || (I[3] = l("dt", { class: "kx-dfact-k" }, "Executor", -1)),
              l("dd", {
                class: "kx-history-v",
                title: P.evidence.identity.principal.id,
                "aria-label": "Historical executor"
              }, y(u(P.evidence.identity.principal)), 9, Ra),
              P.evidence.identity.authorized_by ? (s(), d(Y, { key: 0 }, [
                I[2] || (I[2] = l("dt", { class: "kx-dfact-k" }, "Authorized by", -1)),
                l("dd", {
                  class: "kx-history-v",
                  title: P.evidence.identity.authorized_by.id,
                  "aria-label": "Historical authorizer"
                }, y(u(P.evidence.identity.authorized_by)), 9, Ta)
              ], 64)) : _("", !0)
            ])) : _("", !0),
            L(P.error) ? (s(), d("p", Oa, y(L(P.error)), 1)) : _("", !0)
          ]))), 128)),
          g.value ? (s(), V(r(X), {
            key: 1,
            label: "More deliveries",
            severity: "secondary",
            disabled: f.value,
            onClick: I[0] || (I[0] = (P) => K("deliveries"))
          }, null, 8, ["disabled"])) : _("", !0)
        ]),
        l("div", Ba, [
          I[6] || (I[6] = l("h3", { class: "kx-dsub-lbl" }, "Control requests", -1)),
          I[7] || (I[7] = l("p", { class: "kx-dnote" }, "Control requests and delivery admission are independent records.", -1)),
          !f.value && !a.value.length ? (s(), d("p", Fa, "No retained control requests.")) : _("", !0),
          (s(!0), d(Y, null, oe(a.value, (P) => (s(), d("article", {
            key: `${P.generation}:${P.request_id}`,
            class: "kx-history-entry"
          }, [
            l("div", Na, [
              l("span", Ua, y(P.state), 1)
            ]),
            l("p", Ha, "Requested " + y(r(ce)(P.created_at, { future: !0 })), 1),
            P.initiation ? (s(), d("dl", Va, [
              I[5] || (I[5] = l("dt", { class: "kx-dfact-k" }, "Initiated by", -1)),
              l("dd", {
                class: "kx-history-v",
                title: P.initiation.actor_id,
                "aria-label": "Control initiator"
              }, y(u({ kind: "user", id: P.initiation.actor_id })), 9, Ka)
            ])) : (s(), d("p", qa, "Initiator not recorded."))
          ]))), 128)),
          $.value ? (s(), V(r(X), {
            key: 1,
            label: "More control requests",
            severity: "secondary",
            disabled: f.value,
            onClick: I[1] || (I[1] = (P) => K("controls"))
          }, null, 8, ["disabled"])) : _("", !0)
        ])
      ], 64))
    ]));
  }
});
function Le(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Ya(e) {
  return Le(e) && typeof e.code == "string" && typeof e.message == "string" && typeof e.at == "string" && (e.item_key === void 0 || typeof e.item_key == "string");
}
function Za(e) {
  if (!Le(e) || typeof e.drive_key != "string") return !1;
  for (const t of ["source_kind", "phase"])
    if (e[t] !== void 0 && typeof e[t] != "string") return !1;
  if (e.enabled !== void 0 && typeof e.enabled != "boolean") return !1;
  for (const t of ["next_run_at", "last_run_at", "last_round_at"])
    if (e[t] !== void 0 && e[t] !== null && typeof e[t] != "string") return !1;
  for (const t of ["unresolved_count", "uncertain_count"])
    if (e[t] !== void 0 && (typeof e[t] != "number" || !Number.isInteger(e[t]) || e[t] < 0)) return !1;
  return !(e.last_error !== void 0 && e.last_error !== null && (!Le(e.last_error) || e.last_error.message !== void 0 && typeof e.last_error.message != "string"));
}
function Ga(e) {
  if (!Le(e) || e.success !== !0 || !Array.isArray(e.drives) || !e.drives.every(Za) || e.next_page_token !== void 0 && e.next_page_token !== null && (typeof e.next_page_token != "string" || !e.next_page_token)) return !1;
  const t = e.delivery_failures;
  return t === void 0 || Le(t) && typeof t.count == "number" && Number.isInteger(t.count) && t.count >= 0 && (t.last_error === void 0 || Ya(t.last_error));
}
const Qt = {
  blocked_identity: "The account this automation runs as needs to be confirmed.",
  blocked_access: "This automation lost access to something it uses.",
  blocked_declaration: "This automation's settings need to be fixed."
};
function Ue(e) {
  return (e?.drives || []).filter((t) => t.source_kind !== "none");
}
function Me(e) {
  return e.enabled === !1 || e.phase === "paused";
}
function Dt(e) {
  return (e.source_kind === "timer" || e.source_kind === "collection") && (e.phase === "pending" || e.phase === "active") && typeof e.next_run_at == "string" && Date.parse(e.next_run_at) > Date.now();
}
function Xa(e) {
  const t = Ue(e), o = (e?.delivery_failures?.count || 0) > 0;
  if (!t.length) return o ? { kind: "warn", label: "Needs attention" } : null;
  if (t.some((i) => (i.phase || "") in Qt)) return { kind: "warn", label: "Needs attention" };
  if (t.every(Me)) return { kind: "off", label: "Paused" };
  if (o) return { kind: "warn", label: "Needs attention" };
  if (t.some((i) => i.phase === "degraded")) return { kind: "warn", label: "Retrying" };
  if (t.some((i) => i.phase === "backpressure")) return { kind: "live", label: "Catching up" };
  if (t.some((i) => !Me(i) && i.phase === "pending" && !Dt(i))) return { kind: "neutral", label: "Starting" };
  const n = t.filter((i) => !Me(i) && i.source_kind !== "reconcile");
  return n.length && n.every(Dt) ? { kind: "on", label: "Scheduled" } : { kind: "on", label: "Active" };
}
function Ja(e) {
  const t = e?.delivery_failures?.last_error;
  if (t) return `${t.code}: ${t.message}`;
  const o = Ue(e);
  for (const n of o) {
    const i = Qt[n.phase || ""];
    if (i) return i;
  }
  for (const n of o) {
    if (n.phase !== "degraded") continue;
    return (typeof n.last_error?.message == "string" ? n.last_error.message.trim() : "") || "The last run failed; it is retrying.";
  }
  return "";
}
function Qa(e) {
  const t = Ue(e), o = [], n = $e(e).next;
  n && o.push({ label: "Next run", value: n, time: !0 });
  const i = t.reduce((a, b) => a + (b.unresolved_count || 0), 0);
  return i > 0 && o.push({ label: "Waiting to retry", value: `${i} ${i === 1 ? "item" : "items"}` }), o;
}
function $e(e) {
  const t = Ue(e), o = t.map((i) => i.last_run_at).filter((i) => typeof i == "string" && !!i).sort().at(-1), n = t.filter((i) => !Me(i)).map((i) => i.next_run_at).filter((i) => typeof i == "string" && !!i).sort()[0];
  return { last: o, next: n };
}
const ei = /* @__PURE__ */ new Set(["status", "enabled", "last_error", "last_run_at", "next_run_at"]);
function ti(e) {
  return e.replace(/_/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function oi(e) {
  return e.replace(/\b\w/g, (t) => t.toUpperCase());
}
function ni(e) {
  return e && e.charAt(0).toUpperCase() + e.slice(1);
}
function ri(e, t) {
  if (e.type === "boolean") return t === !0 ? "Yes" : "No";
  const o = String(t);
  return e.key.endsWith("_at") || /^\d{4}-\d{2}-\d{2}T/.test(o) ? ce(o, { future: !0 }) || o : e.type === "text" ? ni(o) : o;
}
function eo(e) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e) || /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(e) ? !0 : /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:_-]*$/i.test(e) && /:[0-9a-f-]{6,}/i.test(e);
}
function ai(e) {
  return eo(e) ? { text: e.length > 12 ? `${e.slice(0, 8)}…` : e, title: e } : { text: e };
}
const ii = [
  { match: /component_id not in scope|not in scope/i, text: "Not part of this workspace" },
  { match: /transform output must be an object/i, text: "Item format not recognized" },
  { match: /trigger events dropped/i, text: "Incoming events were dropped" },
  { match: /requires dest_ref/i, text: "Missing a destination reference" },
  { match: /does not declare sink operation|accepts source payloads only/i, text: "Destination cannot accept this item" },
  { match: /sink write (returned a non-object|did not acknowledge)/i, text: "Destination did not confirm the save" },
  { match: /(sink|source) resolve/i, text: "Source or destination unavailable" }
];
function si(e) {
  const t = e.trim();
  if (!t) return { text: "" };
  for (const o of ii)
    if (o.match.test(t)) return { text: o.text, title: t };
  return { text: "Skipped", title: t };
}
function to(e) {
  return /reason/i.test(e);
}
function li(e, t) {
  return to(e.key) || /(^|_)item(_key)?$/i.test(e.key) ? !0 : typeof t == "string" && eo(t);
}
function ci(e, t) {
  const o = oi(e.label || ti(e.key));
  if (to(e.key)) {
    const { text: a, title: b } = si(String(t));
    return { label: o, value: a, title: b, icon: e.icon };
  }
  const { text: n, title: i } = ai(ri(e, t));
  return { label: o, value: n, title: i, icon: e.icon };
}
function Ne(e, t, o) {
  const n = t;
  if (!e || !n) return [];
  const i = [];
  for (const a of e) {
    if (!a?.key || ei.has(a.key) || a.role === "subtitle") continue;
    const b = n[a.key];
    b == null || b === "" || a.hidden || a.hide_zero && b === 0 || li(a, b) === o && i.push(ci(a, b));
  }
  return i;
}
function ct(e) {
  return String(e?.status || "").toLowerCase();
}
function di(e) {
  return typeof e == "string" && /\b(completed|succeeded|successfully)\b/i.test(e);
}
function oo(e) {
  const t = ct(e);
  return t === "completed" || t === "failed";
}
function dt(e) {
  const t = ct(e);
  return t === "failed" || t === "failing" ? !0 : !!e?.last_error && !di(e.last_error);
}
function no(e, t) {
  if (t?.code === "unavailable") return { tone: "error", text: "Its module is unavailable. Reinstall its module to use this automation." };
  const o = typeof e?.last_error == "string" ? e.last_error.trim() : "";
  return o ? dt(e) ? { tone: "error", text: o } : { tone: "success", text: o } : null;
}
function ro(e, t, o, n) {
  if (n?.code === "unavailable") return { kind: "warn", label: "Unavailable" };
  const i = Xa(o);
  if (i) return i;
  if (!e)
    return t ? { kind: "neutral", label: "…" } : { kind: "neutral", label: "Installed" };
  const a = ct(e);
  return dt(e) ? { kind: "warn", label: a === "failed" ? "Failed" : "Failing" } : a === "completed" ? { kind: "done", label: "Completed" } : a === "paused" || e.enabled === !1 ? { kind: "off", label: "Paused" } : a === "running" ? { kind: "live", label: "Running" } : { kind: "on", label: "Active" };
}
function ao(e) {
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
function io(e, t) {
  const o = (e || []).find((i) => i?.role === "subtitle"), n = o ? t?.[o.key] : void 0;
  return typeof n == "string" ? n.trim() : "";
}
async function so(e) {
  const t = [], o = /* @__PURE__ */ new Set();
  let n, i;
  do {
    const a = n ? `?page_token=${encodeURIComponent(n)}` : "", { data: b } = await de.get(`/api/v1/automations/${encodeURIComponent(e)}/status${a}`);
    if (!Ga(b)) throw new Error("Invalid automation status response");
    if (t.push(...b.drives), i = b.delivery_failures, n = b.next_page_token || void 0, n && o.has(n)) throw new Error("Automation status repeated a page token");
    n && o.add(n);
  } while (n);
  return { drives: t, delivery_failures: i };
}
const ui = ["aria-label"], pi = { class: "kx-drawer-head" }, bi = { class: "kx-ficon" }, fi = { class: "kx-drawer-id" }, gi = ["title"], mi = { class: "kx-drawer-sub" }, vi = { class: "kx-drawer-controls" }, hi = {
  class: "kx-tabs",
  role: "tablist"
}, xi = ["aria-selected", "data-testid", "onClick"], yi = { class: "kx-drawer-body" }, ki = {
  key: 0,
  class: "kx-dsec"
}, wi = {
  key: 0,
  class: "kx-errcard",
  "data-testid": "drawer-error-card"
}, _i = { class: "kx-errcard-head" }, $i = { class: "kx-errcard-cause" }, Ci = { class: "kx-dgrid" }, Si = { class: "kx-dfact-k" }, zi = { class: "kx-dfact-v" }, Pi = {
  key: 1,
  class: "kx-dsub"
}, Di = { class: "kx-metrics" }, Ei = { class: "kx-metric-k" }, Ii = ["title"], Li = {
  key: 1,
  class: "kx-dsec"
}, Ai = {
  key: 0,
  class: "kx-dnote"
}, ji = {
  key: 1,
  class: "kx-dgrid"
}, Mi = { class: "kx-dfact-k" }, Ri = ["title"], Ti = {
  key: 2,
  class: "kx-dsec",
  "data-testid": "drawer-config"
}, Oi = {
  key: 2,
  class: "kx-dnote"
}, Bi = {
  key: 3,
  class: "kx-dsec"
}, Fi = { class: "kx-dgrid" }, Ni = { class: "kx-dfact" }, Ui = { class: "kx-dfact-v" }, Hi = { class: "kx-dfact" }, Vi = { class: "kx-dfact-v" }, Ki = { class: "kx-dfact" }, qi = { class: "kx-dfact-v" }, Wi = {
  key: 0,
  class: "kx-dsub"
}, Yi = /* @__PURE__ */ be({
  __name: "DetailDrawer",
  props: {
    automation: { default: () => ({ id: "" }) },
    type: {}
  },
  emits: ["close", "action", "recover", "changed"],
  setup(e, { emit: t }) {
    const o = e, n = t, i = B("overview"), a = [
      { id: "overview", label: "Overview", icon: "tabler:layout-dashboard" },
      { id: "state", label: "State", icon: "tabler:chart-dots" },
      { id: "config", label: "Config", icon: "tabler:settings" },
      { id: "activity", label: "Activity", icon: "tabler:history" }
    ], b = j(() => o.automation.title || o.automation.id), g = j(() => o.automation.icon || o.type?.icon || "tabler:bolt"), $ = j(() => o.type?.title || "Automation"), f = j(() => o.automation.public_state), C = j(() => Zt(o.type)), h = j(() => Xt(C.value)), v = j(() => C.value.declared.includes("status")), u = B(null);
    let m = 0;
    async function x(q) {
      const E = ++m;
      if (!q || !o.automation.drive_status || o.automation.availability) {
        u.value = null;
        return;
      }
      u.value = o.automation.drive_status;
      const z = await so(q);
      E === m && o.automation.id === q && (u.value = z);
    }
    Be(() => [o.automation.id, o.automation.drive_status, o.automation.availability], ([q]) => {
      x(q).catch((E) => Fe.handleError("other", { message: String(E) }));
    }, { immediate: !0 });
    const L = j(() => ro(f.value, v.value, u.value, o.automation.availability)), N = j(() => L.value.kind === "off"), J = j(() => oo(f.value)), G = j(() => (C.value.declared.includes("pause") || C.value.declared.includes("resume")) && !J.value), A = j(() => dt(f.value)), K = j(() => Gt(C.value.declared)), S = j(() => {
      if (o.automation.availability) return no(f.value, o.automation.availability)?.text || "";
      const q = Ja(u.value);
      if (q) return q;
      const E = typeof f.value?.last_error == "string" ? f.value.last_error.trim() : "";
      return A.value ? E : "";
    }), I = j(() => io(o.type?.public_state_schema?.fields, f.value)), P = j(() => {
      const q = o.type?.public_state_schema?.fields;
      return [...Ne(q, f.value, !1), ...Ne(q, f.value, !0)];
    }), R = j(() => {
      const q = f.value, E = [];
      E.push({ label: "Status", value: L.value.label }), o.automation.availability || E.push({ label: "Enabled", value: N.value ? "Paused" : "Yes" }), I.value && E.push({ label: "When", value: I.value }), q?.last_run_at && E.push({ label: "Last run", value: ce(q.last_run_at, { future: !0 }) }), q?.next_run_at && E.push({ label: "Next run", value: ce(q.next_run_at, { future: !0 }) });
      for (const z of Qa(u.value))
        E.push({ label: z.label, value: z.time ? ce(z.value, { future: !0 }) : z.value });
      return E;
    }), T = j(() => {
      const q = u.value?.drives.flatMap((z) => typeof z.last_round_at == "string" ? [z.last_round_at] : []) || [], E = u.value?.delivery_failures?.last_error?.at;
      return E && q.push(E), q.sort().at(-1) || f.value?.last_run_at;
    }), c = j(() => u.value?.delivery_failures), M = j(() => {
      const q = c.value?.last_error;
      return q ? `${q.code}: ${q.message}` : f.value?.last_error;
    }), F = j(() => lt(o.type)), ie = j(() => qt(o.automation, o.type)), He = j(() => ({ location: Kt(o.type) }));
    return Be(() => o.automation.id, () => {
      i.value = "overview";
    }), (q, E) => (s(), d(Y, null, [
      l("div", {
        class: "kx-drawer-scrim",
        onClick: E[0] || (E[0] = (z) => n("close"))
      }),
      l("aside", {
        class: "kx-drawer",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": b.value,
        "data-testid": "detail-drawer"
      }, [
        l("header", pi, [
          l("span", bi, [
            D(r(O), {
              icon: g.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("div", fi, [
            l("div", {
              class: "kx-drawer-name",
              title: b.value
            }, y(b.value), 9, gi),
            l("div", mi, y($.value), 1)
          ]),
          D(r(st), {
            severity: r(ao)(L.value.kind),
            class: "kx-badge kx-tag-sm"
          }, {
            default: H(() => [
              L.value.kind === "live" ? (s(), V(r(O), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : _("", !0),
              ae(" " + y(L.value.label), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          l("div", vi, [
            G.value ? (s(), V(r(X), {
              key: 0,
              type: "button",
              severity: "secondary",
              outlined: "",
              size: "small",
              "aria-label": `${N.value ? "Resume" : "Pause"} ${b.value}`,
              title: N.value ? "Resume" : "Pause",
              disabled: !!e.automation.deleting_at,
              onClick: E[1] || (E[1] = (z) => !e.automation.deleting_at && n("action", N.value ? "resume" : "pause"))
            }, {
              icon: H(({ class: z }) => [
                D(r(O), {
                  icon: N.value ? "tabler:player-play-filled" : "tabler:player-pause",
                  "aria-hidden": "true",
                  class: W(z)
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["aria-label", "title", "disabled"])) : _("", !0),
            D(Jt, {
              items: h.value,
              name: b.value,
              disabled: !!e.automation.deleting_at,
              onSelect: E[2] || (E[2] = (z) => !e.automation.deleting_at && n("action", z))
            }, null, 8, ["items", "name", "disabled"]),
            D(r(X), {
              type: "button",
              severity: "secondary",
              text: "",
              size: "small",
              class: "kx-drawer-close",
              "aria-label": "Close details",
              title: "Close",
              onClick: E[3] || (E[3] = (z) => n("close"))
            }, {
              icon: H(({ class: z }) => [
                D(r(O), {
                  icon: "tabler:x",
                  "aria-hidden": "true",
                  class: W(z)
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        l("nav", hi, [
          (s(), d(Y, null, oe(a, (z) => l("button", {
            key: z.id,
            type: "button",
            role: "tab",
            class: W(["kx-tab", i.value === z.id && "is-active"]),
            "aria-selected": i.value === z.id,
            "data-testid": `drawer-tab-${z.id}`,
            onClick: (ut) => i.value = z.id
          }, [
            D(r(O), {
              icon: z.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ae(" " + y(z.label), 1)
          ], 10, xi)), 64))
        ]),
        l("div", yi, [
          i.value === "overview" ? (s(), d("section", ki, [
            S.value ? (s(), d("div", wi, [
              l("div", _i, [
                D(r(O), {
                  icon: "tabler:alert-circle",
                  "aria-hidden": "true"
                }),
                l("span", null, y(o.automation.availability ? "This automation is unavailable" : "This automation is failing"), 1)
              ]),
              l("p", $i, y(S.value), 1),
              K.value ? (s(), V(r(X), {
                key: 0,
                type: "button",
                size: "small",
                severity: "danger",
                "aria-label": `Recover ${b.value}`,
                "data-testid": "drawer-recover",
                label: "Recover",
                disabled: !!e.automation.deleting_at,
                onClick: E[4] || (E[4] = (z) => !e.automation.deleting_at && n("recover"))
              }, {
                icon: H(({ class: z }) => [
                  D(r(O), {
                    icon: "tabler:rotate-clockwise-2",
                    "aria-hidden": "true",
                    class: W(z)
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["aria-label", "disabled"])) : _("", !0)
            ])) : _("", !0),
            l("div", Ci, [
              (s(!0), d(Y, null, oe(R.value, (z) => (s(), d("div", {
                key: z.label,
                class: "kx-dfact"
              }, [
                l("span", Si, y(z.label), 1),
                l("strong", zi, y(z.value), 1)
              ]))), 128))
            ]),
            P.value.length ? (s(), d("div", Pi, [
              E[9] || (E[9] = l("div", { class: "kx-dsub-lbl" }, "Progress", -1)),
              l("div", Di, [
                (s(!0), d(Y, null, oe(P.value, (z) => (s(), d("span", {
                  key: z.label,
                  class: "kx-metric"
                }, [
                  z.icon ? (s(), V(r(O), {
                    key: 0,
                    icon: z.icon,
                    class: "kx-metric-i",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : _("", !0),
                  l("span", Ei, y(z.label), 1),
                  l("span", {
                    class: "kx-metric-v",
                    title: z.title
                  }, y(z.value), 9, Ii)
                ]))), 128))
              ])
            ])) : _("", !0)
          ])) : i.value === "state" ? (s(), d("section", Li, [
            P.value.length ? (s(), d("div", ji, [
              (s(!0), d(Y, null, oe(P.value, (z) => (s(), d("div", {
                key: z.label,
                class: "kx-dfact"
              }, [
                l("span", Mi, y(z.label), 1),
                l("strong", {
                  class: "kx-dfact-v",
                  title: z.title
                }, y(z.value), 9, Ri)
              ]))), 128))
            ])) : (s(), d("div", Ai, "This automation reports no additional state."))
          ])) : i.value === "config" ? (s(), d("section", Ti, [
            !e.automation.deleting_at && !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (s(), V(Re, {
              key: 0,
              tag: "wc-execution-identity-editor",
              attrs: { root: e.automation.id },
              onChange: E[5] || (E[5] = (z) => n("changed"))
            }, null, 8, ["attrs"])) : _("", !0),
            F.value && !e.automation.deleting_at ? (s(), V(Re, {
              key: 1,
              class: "kx-manage-host",
              tag: F.value,
              config: ie.value,
              meta: He.value,
              onChange: E[6] || (E[6] = (z) => n("changed")),
              onClose: E[7] || (E[7] = (z) => i.value = "overview")
            }, null, 8, ["tag", "config", "meta"])) : (s(), d("div", Oi, "This automation type declares no settings view."))
          ])) : (s(), d("section", Bi, [
            l("div", Fi, [
              l("div", Ni, [
                E[10] || (E[10] = l("span", { class: "kx-dfact-k" }, "Last run", -1)),
                l("strong", Ui, y(T.value ? r(ce)(T.value, { future: !0 }) : "Never"), 1)
              ]),
              l("div", Hi, [
                E[11] || (E[11] = l("span", { class: "kx-dfact-k" }, "Last outcome", -1)),
                l("strong", Vi, y(c.value?.count ? "Failed delivery" : f.value?.status || "—"), 1)
              ]),
              l("div", Ki, [
                E[12] || (E[12] = l("span", { class: "kx-dfact-k" }, "Failed deliveries", -1)),
                l("strong", qi, y(c.value?.count ?? 0), 1)
              ])
            ]),
            typeof M.value == "string" && M.value.trim() ? (s(), d("div", Wi, [
              E[13] || (E[13] = l("div", { class: "kx-dsub-lbl" }, "Last message", -1)),
              l("p", {
                class: W(["kx-dmsg", A.value || c.value?.count ? "is-err" : "is-ok"])
              }, y(M.value), 3)
            ])) : _("", !0),
            !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (s(), V(Wa, {
              key: 1,
              root: e.automation.id,
              onError: E[8] || (E[8] = (z) => r(Fe).handleError("other", { message: z.message }))
            }, null, 8, ["root"])) : _("", !0)
          ]))
        ])
      ], 8, ui)
    ], 64));
  }
});
function Zi(e) {
  const t = B(!1), o = B(null), n = B({}), i = B(!1), a = B(!1), b = B(""), g = B(null), $ = B(null);
  let f = null;
  const C = B(""), h = j(() => e.types.value.filter(
    (c) => c.installable !== !1 && Object.entries(e.inputPreset.value).every(([M, F]) => {
      const ie = c.inputs?.properties?.[M];
      return !!ie && (!ie.enum || typeof F == "string" && ie.enum.includes(F));
    })
  )), v = j(() => !e.componentMode.value || !e.preferredTypeId.value || o.value?.id !== e.preferredTypeId.value), u = j(() => o.value ? on(o.value).filter(([c]) => !(c in e.inputPreset.value)) : []), m = j(() => {
    const c = C.value.trim().toLowerCase();
    return c ? h.value.filter(
      (M) => (M.title || "").toLowerCase().includes(c) || (M.name || "").toLowerCase().includes(c) || rt(M).toLowerCase().includes(c)
    ) : h.value;
  });
  function x(c) {
    I(), C.value = "", o.value = c || null, n.value = c ? { ...ht(c), ...e.inputPreset.value } : {}, b.value = "", t.value = !0, Je(G);
  }
  function L(c) {
    I(), o.value = c, n.value = { ...ht(c), ...e.inputPreset.value }, b.value = "", Je(G);
  }
  function N() {
    I(), t.value = !1, o.value = null, n.value = {}, b.value = "", a.value = !1, e.createMode.value && e.emitHost("close", {});
  }
  function J() {
    !v.value || o.value || Je(() => $.value?.focus({ preventScroll: !0 }));
  }
  async function G() {
    const c = o.value, M = at(c);
    if (!(!M || !c || !g.value))
      try {
        if (await Xo(M, { timeoutMs: 8e3 }), o.value?.id !== c.id || !g.value) return;
        const F = document.createElement(M);
        F.setAttribute("type-id", c.id), F.setAttribute("input", JSON.stringify(e.inputPreset.value)), e.effectiveParentId.value && F.setAttribute("parent-id", e.effectiveParentId.value), F.setAttribute("embedded", "true"), F.addEventListener("automation-installed", S), F.addEventListener("submit-state", A), g.value.innerHTML = "", g.value.appendChild(F), f = F;
      } catch (F) {
        const ie = Dr(c);
        b.value = `Failed to load setup UI (${M}${ie ? ` at ${ie}` : ""}): ` + (F instanceof Error ? F.message : String(F));
      }
  }
  function A(c) {
    a.value = !!c.detail?.saving;
  }
  function K() {
    at(o.value) ? Er(f) : T();
  }
  async function S(c) {
    const M = c.detail;
    if (M?.success === !1) {
      b.value = M?.error || "Could not create the automation.", a.value = !1;
      return;
    }
    if (e.createMode.value) {
      e.emitHost("created", { id: M?.id });
      return;
    }
    N(), await e.reload();
  }
  function I() {
    f && (f.removeEventListener("automation-installed", S), f.removeEventListener("submit-state", A), f.remove(), f = null), g.value && (g.value.innerHTML = "");
  }
  function P() {
    const c = e.preferredTypeId.value;
    return c ? h.value.find((M) => M.id === c) : void 0;
  }
  function R() {
    x(P());
  }
  async function T() {
    const c = o.value;
    if (!c) return;
    const M = nn(c, n.value);
    if (M) {
      b.value = M;
      return;
    }
    i.value = !0, b.value = "";
    try {
      const { data: F } = await de.post("/api/v1/automations", {
        type: c.id,
        input: rn(c, n.value),
        parent_id: e.effectiveParentId.value || void 0
      });
      if (F?.success) {
        if (e.createMode.value) {
          e.emitHost("created", { id: F.id });
          return;
        }
        N(), await e.reload();
      } else
        b.value = te({ response: { data: F } }, "install failed");
    } catch (F) {
      b.value = te(F, "install failed");
    } finally {
      i.value = !1;
    }
  }
  return {
    showTypeCatalog: v,
    installFields: u,
    showInstall: t,
    installType: o,
    installForm: n,
    installing: i,
    customSaving: a,
    installError: b,
    customInstallHost: g,
    installSearchInput: $,
    typeSearch: C,
    filteredTypes: m,
    openInstall: x,
    openPreferredInstall: R,
    chooseType: L,
    closeInstall: N,
    focusInstallDialog: J,
    onCreate: K,
    unmountCustomInstallUi: I
  };
}
function Gi({ automations: e, types: t, query: o, drawerId: n }) {
  const i = j(() => {
    const c = {};
    for (const M of t.value) c[M.id] = M;
    return c;
  }), a = j(() => {
    const c = o.value.trim().toLowerCase();
    return c ? e.value.filter(
      (M) => (M.title || "").toLowerCase().includes(c) || (M.description || "").toLowerCase().includes(c) || (M.type || "").toLowerCase().includes(c)
    ) : e.value;
  });
  function b(c) {
    return c.title || c.id;
  }
  function g(c) {
    return c.type ? i.value[c.type] : void 0;
  }
  function $(c) {
    return c.icon ? c.icon : g(c)?.icon || "tabler:bolt";
  }
  function f(c) {
    return Yt(g(c));
  }
  function C(c, M) {
    return f(c).has(M);
  }
  function h(c) {
    return Wt(f(c));
  }
  function v(c) {
    return Xt(Zt(g(c)));
  }
  function u(c) {
    return Gt(f(c));
  }
  function m(c) {
    return lt(g(c));
  }
  function x(c) {
    return Kt(g(c));
  }
  function L(c) {
    return c ? qt(c, g(c)) : {};
  }
  function N(c) {
    return c.public_state;
  }
  function J(c) {
    return Ne(g(c)?.public_state_schema?.fields, N(c), !1);
  }
  function G(c) {
    return Ne(g(c)?.public_state_schema?.fields, N(c), !0);
  }
  function A(c) {
    return oo(N(c));
  }
  function K(c) {
    return no(N(c), c.availability);
  }
  function S(c) {
    return ro(N(c), C(c, "status"), c.drive_status, c.availability);
  }
  function I(c) {
    return S(c).kind === "off";
  }
  function P(c) {
    return io(g(c)?.public_state_schema?.fields, N(c));
  }
  const R = j(() => e.value.find((c) => c.id === n.value) || null), T = j(() => R.value ? g(R.value) : void 0);
  return {
    typeById: i,
    filtered: a,
    pretty: b,
    typeFor: g,
    iconFor: $,
    declaredActions: f,
    hasAction: C,
    runNowFor: h,
    actionItemsFor: v,
    recoverFor: u,
    manageTag: m,
    manageLocation: x,
    manageConfig: L,
    statusFor: N,
    metrics: J,
    detailMetrics: G,
    isTerminal: A,
    rowMessage: K,
    statusOf: S,
    isPaused: I,
    subtitleLine: P,
    drawerAutomation: R,
    drawerType: T
  };
}
function Xi(e, t) {
  const o = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  let i = 0;
  const a = /* @__PURE__ */ new Map();
  function b(h, v) {
    const u = v.meta;
    e.value = e.value.map((m) => {
      if (m.id !== h) return m;
      const x = {
        ...m,
        public_state: { ...m.public_state || {}, ...u }
      };
      return typeof u.title == "string" && (x.title = u.title), typeof u.comment == "string" && (x.description = u.comment), x;
    }), g(h).catch((m) => Fe.handleError("other", { message: String(m) }));
  }
  async function g(h) {
    if (!e.value.some((m) => m.id === h && m.drive_status)) return;
    const v = Symbol(h);
    a.set(h, v);
    const u = await so(h);
    a.get(h) === v && (a.delete(h), e.value = e.value.map((m) => m.id === h ? { ...m, drive_status: u } : m));
  }
  function $(h) {
    const v = {};
    for (const u of t(h)?.public_state_schema?.fields || [])
      u?.key && u.type && (v[u.key] = u.type);
    return v;
  }
  function f() {
    i++, n.clear(), a.clear();
    for (const h of o.values()) h();
    o.clear();
  }
  function C() {
    const h = new Set(e.value.map((u) => u.id).filter(Boolean));
    for (const [u, m] of o)
      h.has(u) || (m(), o.delete(u), a.delete(u));
    const v = i;
    for (const u of h) {
      if (o.has(u) || n.has(u)) continue;
      n.add(u);
      const m = e.value.find((L) => L.id === u), x = Fn(u, (L) => b(u, L), m ? $(m) : void 0);
      if (n.delete(u), !!x) {
        if (v !== i || !e.value.some((L) => L.id === u)) {
          x();
          continue;
        }
        o.set(u, x);
      }
    }
  }
  return { syncRealtimeSubscriptions: C, clearRealtimeSubscriptions: f, refreshDriveStatus: g };
}
function Ji() {
  let e = 0;
  return () => {
    const t = ++e;
    return () => t === e;
  };
}
function Qi({ automations: e, types: t, loading: o, error: n, parentId: i, syncRealtimeSubscriptions: a }) {
  async function b() {
    try {
      const { data: C } = await de.get("/api/v1/automations/types");
      t.value = C?.success ? C.types || [] : [];
    } catch {
      t.value = [];
    }
  }
  const g = Ji();
  async function $() {
    const C = g();
    o.value = !0, n.value = "";
    try {
      const { data: h } = await de.get("/api/v1/automations", { params: { class: "automation", parent_id: i() } });
      if (!h?.success) throw new Error(te(h?.error, "failed to load automations"));
      if (!C()) return;
      e.value = h.automations || [], a();
    } catch (h) {
      if (!C()) return;
      a(), n.value = te(h, "failed to load automations");
    } finally {
      C() && (o.value = !1);
    }
  }
  async function f() {
    await b(), await $();
  }
  return { fetchTypes: b, fetchAutomations: $, reload: f };
}
function es(e, t, o) {
  async function n(i) {
    e.value = i.id, t.value = "";
    try {
      const { data: a } = await de.get(`/api/v1/automations/${encodeURIComponent(i.id)}/export`);
      if (!a?.success || !a.artifact)
        throw new Error(a?.error?.message || a?.error || "Automation export failed.");
      const b = o(i).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "automation", g = new Blob([`${JSON.stringify(a.artifact, null, 2)}
`], { type: "application/json" }), $ = URL.createObjectURL(g), f = document.createElement("a");
      f.href = $, f.download = `${b}.automation.json`, document.body.appendChild(f), f.click(), f.remove(), URL.revokeObjectURL($);
    } catch (a) {
      t.value = te(a, "Automation export failed.");
    } finally {
      e.value = "";
    }
  }
  return { exportAutomation: n };
}
const ts = { class: "kx" }, os = {
  key: 0,
  class: "kx-head"
}, ns = { class: "kx-head-icon" }, rs = { class: "kx-head-actions" }, as = { class: "kx-count" }, is = { class: "kx-search" }, ss = {
  key: 1,
  class: "kx-err"
}, ls = {
  key: 2,
  class: "kx-body"
}, cs = {
  key: 0,
  class: "kx-loading"
}, ds = {
  key: 1,
  class: "kx-empty"
}, us = { class: "kx-empty-ico" }, ps = {
  key: 2,
  class: "kx-empty"
}, bs = {
  key: 3,
  class: "kx-list"
}, fs = ["aria-label", "onClick", "disabled"], gs = { class: "kx-ficon" }, ms = { class: "kx-id" }, vs = ["title"], hs = { class: "kx-sub" }, xs = { key: 0 }, ys = { key: 1 }, ks = { key: 2 }, ws = { class: "kx-actions" }, _s = {
  key: 0,
  class: "kx-rowfoot"
}, $s = ["title"], Cs = { class: "kx-modal-head-icon" }, Ss = { class: "kx-modal-head-text" }, zs = { class: "kx-modal-head-title" }, Ps = { class: "kx-modal-head-sub" }, Ds = { class: "kx-modal-body" }, Es = { class: "kx-modal-head-icon" }, Is = { class: "kx-modal-head-text" }, Ls = { class: "kx-modal-head-title" }, As = { class: "kx-modal-head-sub" }, js = { class: "kx-modal-body" }, Ms = { class: "kx-modal-body" }, Rs = {
  key: 0,
  class: "kx-delopts"
}, Ts = ["onUpdate:modelValue"], Os = { class: "kx-delopt-copy" }, Bs = { class: "kx-delopt-t" }, Fs = {
  key: 0,
  class: "kx-delopt-d"
}, Ns = /* @__PURE__ */ be({
  __name: "automations",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, o = B([]), n = B([]), i = B(!1), a = B(""), b = B(""), g = B(""), $ = /* @__PURE__ */ new Map(), f = B(""), C = B(""), h = Gi({ automations: o, types: n, query: b, drawerId: C }), {
      filtered: v,
      pretty: u,
      typeFor: m,
      iconFor: x,
      hasAction: L,
      actionItemsFor: N,
      recoverFor: J,
      manageTag: G,
      manageLocation: A,
      manageConfig: K,
      metrics: S,
      detailMetrics: I,
      isTerminal: P,
      rowMessage: R,
      statusOf: T,
      isPaused: c,
      subtitleLine: M,
      drawerAutomation: F,
      drawerType: ie
    } = h, He = Xi(o, m), { syncRealtimeSubscriptions: q, clearRealtimeSubscriptions: E, refreshDriveStatus: z } = He, ut = es(f, a, u), { exportAutomation: lo } = ut, fe = zo(), co = Po(), xe = j(() => fe.value?.mode === "create"), Ve = j(() => fe.value?.mode === "component"), uo = an(fe), pt = j(() => String(fe.value?.componentId || "").trim()), po = j(() => String(fe.value?.typeId || "").trim()), bo = j(() => pt.value || uo.value), fo = Qi({
      automations: o,
      types: n,
      loading: i,
      error: a,
      parentId: () => pt.value || void 0,
      syncRealtimeSubscriptions: q
    }), { fetchAutomations: ge, reload: Ke } = fo, ye = Zi({
      types: n,
      createMode: xe,
      componentMode: Ve,
      effectiveParentId: bo,
      preferredTypeId: po,
      inputPreset: j(() => sn(fe.value?.input)),
      emitHost: (k, w) => co(k, w),
      reload: () => Ke()
    }), se = B(null), je = B({}), ke = B(!1), ne = B(null), ue = B(null);
    function go(k) {
      ue.value = k;
    }
    function bt() {
      ue.value = null;
    }
    function mo(k) {
      const w = k?.id || "";
      return {
        resource_id: w,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(w)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(w)}`,
        title: k ? u(k) : ""
      };
    }
    function ft(k, w) {
      if (!k.deleting_at)
        switch (w) {
          case "reconfigure":
            $o(k);
            break;
          case "share":
            go(k);
            break;
          case "export":
            lo(k);
            break;
          case "delete":
            We(k);
            break;
          default:
            qe(k, w);
        }
    }
    function gt(k) {
      if (k.deleting_at) return;
      const w = J(k);
      w && qe(k, w);
    }
    function vo(k) {
      C.value = k.id, ge();
    }
    function ho() {
      C.value = "";
    }
    function xo(k) {
      const w = F.value;
      w && ft(w, k);
    }
    function yo() {
      const k = F.value;
      k && gt(k);
    }
    async function qe(k, w) {
      if (k.deleting_at || g.value) return;
      g.value = k.id, a.value = "";
      const p = m(k)?.controls?.some((re) => re.name === w) === !0, Z = `${k.id}:${w}`, mt = p ? $.get(Z) || crypto.randomUUID() : "";
      p && $.set(Z, mt);
      try {
        const { data: re } = await de.post(
          `/api/v1/automations/${k.id}/actions/${w}`,
          p ? { request_id: mt } : {}
        );
        if (!re?.success) {
          a.value = te({ response: { data: re } }, `${w} failed`);
          return;
        }
        if (p && re.result?.state === "succeeded" && $.delete(Z), re.result && typeof re.result == "object") {
          const { success: Ge, ...So } = re.result;
          k.public_state = { ...k.public_state || {}, ...So };
        }
        if (k.drive_status?.drives?.length)
          await z(k.id);
        else if (w === "pause" || w === "resume") {
          const Ge = typeof re.result?.paused == "boolean" ? re.result.paused : w === "pause";
          k.public_state = {
            ...k.public_state || {},
            enabled: !Ge,
            status: re.result?.status || (Ge ? "paused" : "active")
          };
        }
      } catch (re) {
        a.value = te(re, `${w} failed`);
      } finally {
        g.value = "";
      }
    }
    async function ko(k) {
      await qe(k, c(k) ? "resume" : "pause");
    }
    function We(k) {
      se.value = k;
      const w = m(k), p = {};
      for (const Z of w?.delete_options || []) p[Z.key] = !!Z.default;
      je.value = p;
    }
    function Ye(k) {
      return k ? m(k)?.delete_options || [] : [];
    }
    function wo(k) {
      ne.value = null, We(k);
    }
    async function _o() {
      const k = se.value;
      if (k) {
        ke.value = !0, a.value = "";
        try {
          const p = Ye(k).length ? { options: { ...je.value } } : {}, { data: Z } = await de.delete(`/api/v1/automations/${k.id}`, { data: p });
          Z?.success ? (Co(k.id, Z), se.value = null, await ge()) : a.value = te({ response: { data: Z } }, "failed to delete automation");
        } catch (w) {
          a.value = te(w, "failed to delete automation");
        } finally {
          ke.value = !1;
        }
      }
    }
    function $o(k) {
      G(k) && (ne.value = k);
    }
    async function Ze(k = !0) {
      ne.value = null, k && await Ke();
    }
    Do(async () => {
      try {
        await Ke(), xe.value && ye.openPreferredInstall();
      } catch (k) {
        a.value = te(k, "host API unavailable");
      }
    }), it(() => {
      ye.unmountCustomInstallUi(), E();
    });
    const { acceptDeletion: Co } = Nn(o, (k) => k.id, void 0, ge);
    return (k, w) => (s(), d("div", ts, [
      xe.value ? _("", !0) : (s(), d("header", os, [
        Ve.value ? _("", !0) : (s(), d(Y, { key: 0 }, [
          l("div", ns, [
            D(r(O), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          w[10] || (w[10] = l("div", { class: "kx-head-text" }, [
            l("h1", { class: "kx-head-title" }, "Automations"),
            l("p", { class: "kx-head-sub" }, "Scheduled and event-driven jobs that run on their own.")
          ], -1))
        ], 64)),
        l("div", rs, [
          l("span", as, y(o.value.length) + " automation" + y(o.value.length !== 1 ? "s" : ""), 1),
          l("div", is, [
            D(r(O), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            pe(l("input", {
              "onUpdate:modelValue": w[0] || (w[0] = (p) => b.value = p),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search automations…"
            }, null, 512), [
              [tt, b.value]
            ])
          ]),
          D(r(X), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: w[1] || (w[1] = (p) => r(ye).openPreferredInstall())
          }, {
            icon: H(({ class: p }) => [
              D(r(O), {
                icon: "tabler:plus",
                class: W(p),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ])),
      !xe.value && a.value ? (s(), d("div", ss, y(a.value), 1)) : _("", !0),
      xe.value ? _("", !0) : (s(), d("div", ls, [
        i.value && !o.value.length ? (s(), d("div", cs, [
          D(r(O), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          w[11] || (w[11] = ae(" Loading… ", -1))
        ])) : o.value.length ? r(v).length ? (s(), d("div", bs, [
          (s(!0), d(Y, null, oe(r(v), (p) => (s(), d("div", {
            key: p.id,
            class: W(["kx-row", C.value === p.id && "is-open"])
          }, [
            l("button", {
              type: "button",
              class: "kx-open",
              "aria-label": `Open ${r(u)(p)} details`,
              onClick: (Z) => !p.deleting_at && vo(p),
              disabled: !!p.deleting_at
            }, [
              l("span", gs, [
                D(r(O), {
                  icon: r(x)(p),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              l("span", ms, [
                l("span", {
                  class: "kx-name",
                  title: r(u)(p)
                }, y(r(u)(p)), 9, vs),
                l("span", hs, [
                  l("span", null, y(r(m)(p)?.title || "Automation"), 1),
                  r(M)(p) ? (s(), d("span", xs, " · " + y(r(M)(p)), 1)) : _("", !0),
                  r($e)(p.drive_status).last ? (s(), d("span", ys, " · last ran " + y(r(ce)(r($e)(p.drive_status).last, { future: !0 })), 1)) : _("", !0),
                  r($e)(p.drive_status).next ? (s(), d("span", ks, " · next " + y(r(ce)(r($e)(p.drive_status).next, { future: !0 })), 1)) : _("", !0)
                ])
              ])
            ], 8, fs),
            D(r(st), {
              severity: r(ao)(r(T)(p).kind),
              class: "kx-badge kx-tag-sm"
            }, {
              default: H(() => [
                r(T)(p).kind === "live" ? (s(), V(r(O), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : _("", !0),
                ae(" " + y(r(T)(p).label), 1)
              ]),
              _: 2
            }, 1032, ["severity"]),
            l("div", ws, [
              (r(L)(p, "pause") || r(L)(p, "resume")) && !r(P)(p) ? (s(), V(r(X), {
                key: 0,
                type: "button",
                severity: "secondary",
                outlined: "",
                size: "small",
                disabled: !!p.deleting_at || g.value === p.id,
                "aria-label": `${r(c)(p) ? "Resume" : "Pause"} ${r(u)(p)}`,
                title: r(c)(p) ? "Resume" : "Pause",
                onClick: (Z) => ko(p)
              }, {
                icon: H(({ class: Z }) => [
                  D(r(O), {
                    icon: r(c)(p) ? "tabler:player-play-filled" : "tabler:player-pause",
                    "aria-hidden": "true",
                    class: W(Z)
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["disabled", "aria-label", "title", "onClick"])) : _("", !0),
              D(Jt, {
                items: r(N)(p),
                name: r(u)(p),
                busy: !!p.deleting_at || g.value === p.id,
                onSelect: (Z) => ft(p, Z)
              }, null, 8, ["items", "name", "busy", "onSelect"])
            ]),
            p.deleting_at || r(R)(p) || r(I)(p).length || r(S)(p).length ? (s(), d("div", _s, [
              D(Mn, {
                state: p,
                onRetry: (Z) => We(p)
              }, null, 8, ["state", "onRetry"]),
              r(R)(p) ? (s(), d("div", {
                key: 0,
                class: W(["kx-rowmsg", `kx-rowmsg-${r(R)(p)?.tone}`])
              }, [
                D(r(O), {
                  icon: r(R)(p)?.tone === "error" ? "tabler:alert-circle" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                l("span", {
                  class: "kx-rowmsg-txt",
                  title: r(R)(p)?.text
                }, y(r(R)(p)?.text), 9, $s),
                r(R)(p)?.tone === "error" && r(J)(p) ? (s(), V(r(X), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  text: "",
                  size: "small",
                  class: "kx-recover",
                  "data-testid": "row-recover",
                  "aria-label": `Recover ${r(u)(p)}`,
                  disabled: !!p.deleting_at || g.value === p.id,
                  label: "Recover",
                  onClick: (Z) => gt(p)
                }, {
                  icon: H(({ class: Z }) => [
                    D(r(O), {
                      icon: "tabler:rotate-clockwise-2",
                      "aria-hidden": "true",
                      class: W(Z)
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])) : _("", !0)
              ], 2)) : _("", !0),
              D(ua, {
                face: r(S)(p),
                detail: r(I)(p)
              }, null, 8, ["face", "detail"])
            ])) : _("", !0)
          ], 2))), 128))
        ])) : (s(), d("div", ps, [...w[14] || (w[14] = [
          l("div", { class: "kx-empty-title" }, "No matches", -1),
          l("div", { class: "kx-empty-sub" }, "No automations match the current search.", -1)
        ])])) : (s(), d("div", ds, [
          l("div", us, [
            D(r(O), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          w[12] || (w[12] = l("div", { class: "kx-empty-title" }, "No automations yet", -1)),
          w[13] || (w[13] = l("div", { class: "kx-empty-sub" }, "Choose an automation type to get started.", -1)),
          D(r(X), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: w[2] || (w[2] = (p) => r(ye).openPreferredInstall())
          }, {
            icon: H(({ class: p }) => [
              D(r(O), {
                icon: "tabler:plus",
                class: W(p),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ])),
      r(F) ? (s(), V(Yi, {
        key: 3,
        automation: r(F),
        type: r(ie),
        onClose: ho,
        onAction: xo,
        onRecover: yo,
        onChanged: r(ge)
      }, null, 8, ["automation", "type", "onChanged"])) : _("", !0),
      D(na, {
        flow: r(ye),
        "component-mode": Ve.value,
        "dialog-pt": t
      }, null, 8, ["flow", "component-mode"]),
      ne.value ? (s(), V(r(Ce), {
        key: 4,
        visible: !!ne.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal kx-modal-manage",
        "aria-label": r(u)(ne.value),
        "onUpdate:visible": w[6] || (w[6] = (p) => {
          p || Ze(!1);
        })
      }, {
        header: H(() => [
          l("span", Cs, [
            D(r(O), {
              icon: r(x)(ne.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("span", Ss, [
            l("span", zs, y(r(u)(ne.value)), 1),
            l("span", Ps, y(r(m)(ne.value)?.title || "Automation"), 1)
          ])
        ]),
        footer: H(() => [
          D(r(X), {
            type: "button",
            class: "kx-foot-delete",
            severity: "danger",
            outlined: "",
            label: "Delete",
            onClick: w[5] || (w[5] = (p) => wo(ne.value))
          }, {
            icon: H(({ class: p }) => [
              D(r(O), {
                icon: "tabler:trash",
                "aria-hidden": "true",
                class: W(p)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]),
        default: H(() => [
          l("div", Ds, [
            D(Re, {
              class: "kx-manage-host",
              tag: r(G)(ne.value),
              config: r(K)(ne.value),
              meta: { location: r(A)(ne.value) },
              onCreated: w[3] || (w[3] = (p) => Ze(!0)),
              onClose: w[4] || (w[4] = (p) => Ze(!0)),
              onChange: r(ge)
            }, null, 8, ["tag", "config", "meta", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : _("", !0),
      ue.value ? (s(), V(r(Ce), {
        key: 5,
        visible: !!ue.value,
        modal: "",
        pt: t,
        class: "kx-modal",
        "aria-label": `Share ${r(u)(ue.value)}`,
        "onUpdate:visible": w[7] || (w[7] = (p) => {
          p || bt();
        })
      }, {
        header: H(() => [
          l("span", Es, [
            D(r(O), {
              icon: "tabler:users",
              "aria-hidden": "true"
            })
          ]),
          l("span", Is, [
            l("span", Ls, "Share " + y(r(u)(ue.value)), 1),
            l("span", As, y(r(m)(ue.value)?.title || "Automation"), 1)
          ])
        ]),
        default: H(() => [
          l("div", js, [
            D(Re, {
              class: "kx-manage-host",
              tag: "kickside-share",
              config: mo(ue.value),
              onClose: bt,
              onChange: r(ge)
            }, null, 8, ["config", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : _("", !0),
      se.value ? (s(), V(r(Ce), {
        key: 6,
        visible: !!se.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal",
        header: "Delete automation",
        "aria-label": "Delete automation",
        "onUpdate:visible": w[9] || (w[9] = (p) => {
          p || (se.value = null);
        })
      }, {
        footer: H(() => [
          D(r(X), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: ke.value,
            onClick: w[8] || (w[8] = (p) => se.value = null)
          }, null, 8, ["disabled"]),
          D(r(X), {
            type: "button",
            "data-testid": "automations-confirm-delete",
            severity: "danger",
            label: "Delete",
            loading: ke.value,
            disabled: ke.value,
            onClick: _o
          }, {
            icon: H(({ class: p }) => [
              D(r(O), {
                icon: "tabler:trash",
                class: W(p),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: H(() => [
          l("div", Ms, [
            l("p", null, [
              w[15] || (w[15] = ae(" Delete ", -1)),
              l("strong", null, y(r(u)(se.value)), 1),
              w[16] || (w[16] = ae("? It will stop running and its setup will be removed. This can't be undone. ", -1))
            ]),
            Ye(se.value).length ? (s(), d("div", Rs, [
              (s(!0), d(Y, null, oe(Ye(se.value), (p) => (s(), d("label", {
                key: p.key,
                class: "kx-delopt"
              }, [
                pe(l("input", {
                  "onUpdate:modelValue": (Z) => je.value[p.key] = Z,
                  type: "checkbox"
                }, null, 8, Ts), [
                  [jt, je.value[p.key]]
                ]),
                l("span", Os, [
                  l("span", Bs, y(p.title || p.key), 1),
                  p.description ? (s(), d("span", Fs, y(p.description), 1)) : _("", !0)
                ])
              ]))), 128))
            ])) : _("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"])) : _("", !0)
    ]));
  }
}), Us = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.component-deletion{display:inline-flex;align-items:center;gap:.5rem;color:var(--p-text-muted-color)}.component-deletion-spinner{width:1rem;height:1rem;margin:0}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-modal-head-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-modal-head-icon svg{width:20px;height:20px}.kx-modal-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-modal-head-title{font-size:15.5px;font-weight:700;color:var(--p-text-color);line-height:1.2}.kx-modal-head-sub{font-size:12.5px;font-weight:400;color:var(--p-text-muted-color);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}.kx-wcmount{display:block;width:100%;min-width:0;max-width:100%;overflow-x:clip;--p-border-radius: var(--wf-radius-sm, 8px);--p-content-border-radius: var(--wf-radius-sm, 8px)}.kx-wcmount .kx-wcmount-surface{display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;color:inherit}.kx-wcmount-fail{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--p-danger-600, var(--p-danger-500));padding:9px 10px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);border-radius:10px;background:color-mix(in srgb,var(--p-danger-500) 7%,transparent)}.kx-wcmount-fail>span{min-width:0;flex:1}.kx-wcmount-fail button{border:1px solid currentColor;border-radius:8px;padding:5px 9px;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}.anchored-panel{position:fixed;min-width:0;overflow:auto}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{--kx-modal-shadow: var(--kx-shadow-lg);display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.kx-head-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-count{font-size:12.5px;color:var(--p-text-muted-color);display:inline-flex;align-items:center;gap:5px}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{height:34px;width:220px;max-width:40vw;padding:0 10px 0 30px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.kx-body{flex:1 0 auto;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-list{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden;background:var(--p-content-background);max-width:1100px}.kx-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"main status actions" "foot foot   foot";align-items:center;column-gap:14px;row-gap:6px;padding:10px 14px;border-bottom:1px solid var(--p-content-border-color)}.kx-row:last-child{border-bottom:none}.kx-row.is-open{background:var(--kx-wash-primary)}.kx-row:hover{background:var(--kx-overlay-subtle)}.kx-row.is-open:hover{background:var(--kx-wash-primary)}.kx-open{grid-area:main;display:flex;align-items:center;gap:12px;min-width:0;padding:0;margin:0;border:none;background:transparent;text-align:left;font:inherit;color:inherit;cursor:pointer}.kx-ficon{width:38px;height:38px;flex:none;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--kx-wash-primary);color:var(--p-primary-color)}.kx-ficon svg{width:20px;height:20px}.kx-id{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}.kx-name{display:block;font-size:14px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-sub{display:block;font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-open:focus-visible{outline:none}.kx-open:focus-visible .kx-name{text-decoration:underline;text-underline-offset:2px;text-decoration-color:var(--p-primary-color)}.kx-rowfoot{grid-area:foot;padding-left:50px;display:flex;flex-direction:column;gap:4px;min-width:0}.kx-rowfoot:empty{display:none}.kx-rowmsg{font-size:11.5px;display:flex;align-items:center;gap:5px;min-width:0}.kx-rowmsg-txt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-rowmsg svg{width:13px;height:13px;flex:none}.kx-rowmsg-error{color:var(--p-danger-600, var(--p-danger-500))}.kx-rowmsg-success{color:var(--p-success-600, var(--p-success-500))}.kx-recover{flex:none;margin-left:2px}.kx-badge{grid-area:status;border:1px solid color-mix(in srgb,currentColor 28%,transparent)}.kx-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}.kx-badge:has(svg):before{display:none}.kx-actions{grid-area:actions;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;min-width:0}.kx-actions .is-active{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 38%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-admin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}.kx-admin-item{min-width:0;padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:10px;background:var(--p-content-background)}.kx-admin-item>span{display:block;margin-bottom:4px;color:var(--p-text-muted-color);font-size:10.5px;font-weight:700;letter-spacing:.055em;text-transform:uppercase}.kx-admin-item strong{display:block;overflow:hidden;color:var(--p-text-color);font-size:12.5px;text-overflow:ellipsis;white-space:nowrap}.kx-admin-item strong em{color:var(--p-text-muted-color);font-size:11px;font-style:normal;font-weight:600}.kx-admin-item code{display:block;margin-top:4px;overflow:hidden;color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;text-overflow:ellipsis;white-space:nowrap}.kx-admin-item a{display:inline-block;margin-top:4px;color:var(--p-primary-color);font-size:11px;font-weight:650;text-decoration:none}.kx-admin-item a:hover{text-decoration:underline}@media(max-width:560px){.kx-row{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"main   actions" "status status" "foot   foot";align-items:center;row-gap:8px}.kx-badge{justify-self:start}.kx-rowfoot{padding-left:0}}@media(max-width:640px){.kx-admin-grid{grid-template-columns:1fr}}.kx-modal{--p-dialog-content-padding: 0;max-width:calc(100vw - 32px);max-height:90vh}.kx-modal>.kx-dialog-header{padding:16px 18px;border-bottom:1px solid var(--p-content-border-color);gap:10px}.kx-modal>.kx-dialog-content{padding:0;display:flex;flex-direction:column;min-height:0;overflow:hidden}.kx-modal>.kx-dialog-footer{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.kx-2p-r-body>*{animation:kx-pane-fade .28s ease both}@keyframes kx-pane-fade{0%{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){.kx-2p-r-body>*{animation:none}}.kx-modal-body{padding:18px;font-size:13.5px;line-height:1.5;color:var(--p-text-color);overflow-y:auto}.kx-modal-body p{margin:0 0 10px}.kx-modal-body p:last-child{margin-bottom:0}.kx-form{display:flex;flex-direction:column;gap:14px}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-req{color:var(--p-danger-500)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-select{width:100%;min-width:0}.kx-check,.kx-delopt input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-check:before,.kx-delopt input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-check:checked,.kx-delopt input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-check:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset)}.kx-check:checked:before,.kx-delopt input:checked:before{transform:rotate(45deg) scale(1)}.kx-check:disabled,.kx-delopt input:disabled{opacity:.55;cursor:not-allowed}.kx-field-hint{font-size:11px;line-height:1.3;color:var(--p-text-muted-color);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.kx-custom-host{min-height:180px;width:100%}.kx-custom-host>*{display:block;width:100%}.kx-delopts{display:flex;flex-direction:column;gap:10px;margin-top:14px}.kx-delopt{display:flex;align-items:flex-start;gap:10px;cursor:pointer}.kx-delopt input{margin-top:2px}.kx-delopt-copy{min-width:0;display:flex;flex-direction:column;gap:2px}.kx-delopt-t{display:block;font-size:13px;font-weight:600;color:var(--p-text-color)}.kx-delopt-d{display:block;font-size:11.5px;line-height:1.35;color:var(--p-text-muted-color)}.kx-modal-2p{width:min(880px,calc(100vw - 40px));max-width:100%}.kx-modal-solo{width:min(620px,calc(100vw - 40px));max-width:100%}.kx-modal-manage{width:min(760px,calc(100vw - 40px));max-width:100%}.kx-manage-host{display:block;min-height:180px}.kx-2p{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);min-height:0;flex:1;overflow:hidden}.kx-2p-solo{grid-template-columns:minmax(0,1fr)}.kx-2p-solo .kx-2p-r-body{padding-top:16px}.kx-2p-l{padding:16px;overflow-y:auto;border-right:1px solid var(--p-content-border-color);display:flex;flex-direction:column;gap:10px}.kx-2p-r{display:flex;flex-direction:column;min-width:0;min-height:0;background:color-mix(in srgb,var(--p-text-color) 2.5%,var(--p-content-background))}.kx-2p-r-head{padding:14px 18px 10px;font-size:12.5px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-2p-r-body{padding:0 18px 18px;overflow-y:auto;flex:1;min-height:0}.kx-2p-r-note{margin:0;font-size:12.5px;color:var(--p-text-muted-color)}.kx-foot-err{order:-1;flex:1 0 100%;margin:0;max-width:none}.kx-foot-err+.p-button{margin-left:auto}.kx-foot-delete{margin-right:auto}.kx-cat-search{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;flex:none;border:1px solid var(--p-content-border-color);border-radius:8px;color:var(--p-text-muted-color)}.kx-cat-search svg{width:15px;height:15px;flex:none}.kx-cat-search input{flex:1;border:none;background:transparent;outline:none;font:inherit;font-size:13px;color:var(--p-text-color)}.kx-cat{display:flex;flex-direction:column;gap:6px}.kx-cat-card{display:flex;align-items:center;gap:11px;text-align:left;width:100%;padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:14px;background:transparent;color:var(--p-text-color);cursor:pointer;transition:border-color .14s,background .14s}.kx-cat-card:hover{background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.kx-cat-card.sel{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 9%,transparent)}.kx-cat-ico{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.kx-cat-ico svg{width:18px;height:18px}.kx-cat-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-cat-name{font-size:13px;font-weight:600}.kx-cat-desc{font-size:11px;line-height:1.3;color:var(--p-text-muted-color);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.kx-cat-check{width:17px;height:17px;flex:none;color:var(--p-primary-color);visibility:hidden}.kx-cat-card.sel .kx-cat-check{visibility:visible}.kx-cat-empty{font-size:12.5px;color:var(--p-text-muted-color);padding:4px 2px}@media(max-width:760px){.kx-modal-2p{width:560px}.kx-2p{grid-template-columns:1fr}.kx-2p-l{border-right:none;border-bottom:1px solid var(--p-content-border-color)}}.kx-flow{display:flex;flex-direction:column;gap:14px;padding:6px 0 0}.kx-pipe,.kx-stage{display:flex;flex-direction:column;gap:8px}.kx-stage-mid{background:transparent}.kx-stage-head{display:flex;align-items:center;gap:8px}.kx-stage-ico{width:26px;height:26px;border-radius:11px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-stage-ico svg{width:15px;height:15px}.kx-stage-lbl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-stage-cfg{margin-top:2px}.kx-stage-badges{display:flex;flex-wrap:wrap;gap:6px}.kx-stage-desc{margin:0;font-size:12px;line-height:1.4;color:var(--p-text-muted-color)}.kx-stage-opts{display:flex;flex-direction:column;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-opts-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-pipe-conn{display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 0;color:var(--p-text-muted-color);font-size:11px}.kx-pipe-conn svg{width:16px;height:16px}.kx-runopts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.kx-detect{display:flex;align-items:center;gap:6px;font-size:11.5px;line-height:1.35;padding:7px 9px;border-radius:8px;color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 10%,transparent)}.kx-detect svg{width:14px;height:14px;flex:none}.kx-detect-warn{color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-flow-enable{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--p-text-muted-color);cursor:pointer}.kx-flow-enable input{width:16px;height:16px;accent-color:var(--p-primary-color)}.kx-textarea{height:auto;min-height:72px;padding:8px 10px;line-height:1.4;resize:vertical}.kx-wcmount{width:100%}.kx-wcmount>div{display:block;width:100%}.kx-metrics{display:flex;flex-wrap:wrap;gap:5px 6px;margin-top:5px;min-width:0}.kx-metric{display:inline-flex;align-items:center;gap:5px;max-width:100%;font-size:11.5px;line-height:1.6;padding:2px 9px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 6%,transparent);color:var(--p-text-color)}.kx-metric-i{width:13px;height:13px;color:var(--p-text-muted-color);flex:none}.kx-metric-k{color:var(--p-text-muted-color);font-weight:600;flex:none}.kx-metric-v{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-metric-details{margin-top:5px}.kx-metric-more{display:inline-flex;align-items:center;gap:4px;cursor:pointer;list-style:none;font-size:11.5px;font-weight:600;color:var(--p-text-muted-color);user-select:none}.kx-metric-more::-webkit-details-marker{display:none}.kx-metric-more:before{content:"";width:0;height:0;border-left:4px solid currentColor;border-top:3px solid transparent;border-bottom:3px solid transparent;transition:transform .15s;flex:none}.kx-metric-details[open] .kx-metric-more:before{transform:rotate(90deg)}.kx-metric-more:hover{color:var(--p-text-color)}.kx-metrics-detail{margin-top:4px}@media(prefers-reduced-motion:reduce){.kx-modal{transition:none}}.kx-cat-search:focus-within{border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-cat-search input:focus{box-shadow:none}.kx-cat-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-menu{position:relative;display:inline-flex}.kx-menu-trigger.is-active{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 38%,var(--p-content-border-color));background:var(--kx-wash-primary)}.kx-menu-panel{display:flex;flex-direction:column;gap:1px;padding:6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);background:var(--p-content-background);box-shadow:var(--kx-shadow-lg);max-height:min(70vh,460px);overflow-y:auto}.kx-menu-group{padding:8px 10px 4px;font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-menu-group.is-first{padding-top:4px}.kx-menu-sep{height:1px;margin:5px 6px;background:var(--p-content-border-color)}.kx-menu-item{display:flex;align-items:flex-start;gap:10px;width:100%;padding:8px 10px;text-align:left;border:none;border-radius:var(--kx-radius-10);background:transparent;color:var(--p-text-color);cursor:pointer;transition:background .12s}.kx-menu-item:hover,.kx-menu-item:focus-visible{background:var(--kx-overlay-hover);outline:none}.kx-menu-item:disabled{opacity:.5;cursor:not-allowed}.kx-menu-item-ico{width:17px;height:17px;flex:none;margin-top:1px;color:var(--p-text-muted-color)}.kx-menu-item-body{display:flex;flex-direction:column;gap:1px;min-width:0}.kx-menu-item-label{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600}.kx-menu-item-desc{font-size:11px;line-height:1.35;color:var(--p-text-muted-color)}.kx-menu-item-warn{width:12px;height:12px;color:var(--p-warn-600, var(--p-warn-500))}.kx-menu-item.is-warn .kx-menu-item-ico{color:var(--p-warn-600, var(--p-warn-500))}.kx-menu-item.is-danger .kx-menu-item-ico{color:var(--p-danger-600, var(--p-danger-500))}.kx-menu-item.is-danger:hover,.kx-menu-item.is-danger:focus-visible{background:var(--kx-wash-danger)}.kx-menu-item.is-danger .kx-menu-item-label{color:var(--p-danger-600, var(--p-danger-500))}.kx-drawer-scrim{position:fixed;inset:0;z-index:60;background:color-mix(in srgb,var(--p-text-color) 40%,transparent);animation:kx-fade .18s ease both}.kx-drawer{position:fixed;top:0;right:0;height:100%;width:min(468px,100vw);z-index:61;display:flex;flex-direction:column;min-height:0;background:var(--p-content-background);border-left:1px solid var(--p-content-border-color);box-shadow:var(--kx-shadow-lg);animation:kx-slide-in .22s cubic-bezier(.22,.61,.36,1) both}@keyframes kx-fade{0%{opacity:0}to{opacity:1}}@keyframes kx-slide-in{0%{transform:translate(24px);opacity:0}to{transform:none;opacity:1}}@media(prefers-reduced-motion:reduce){.kx-drawer,.kx-drawer-scrim{animation:none}}.kx-drawer-head{display:flex;align-items:center;gap:11px;padding:16px 16px 14px;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-drawer-id{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}.kx-drawer-name{font-size:15px;font-weight:700;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-drawer-sub{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-drawer-controls{display:flex;align-items:center;gap:6px;flex:none}.kx-drawer .kx-badge{flex:none}.kx-tabs{display:flex;gap:2px;padding:6px 12px 0;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-tab{display:inline-flex;align-items:center;gap:6px;padding:8px 12px 10px;margin-bottom:-1px;border:none;border-bottom:2px solid transparent;background:transparent;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;color:var(--p-text-muted-color);transition:color .12s}.kx-tab svg{width:15px;height:15px}.kx-tab:hover{color:var(--p-text-color)}.kx-tab.is-active{color:var(--p-primary-color);border-bottom-color:var(--p-primary-color)}.kx-tab:focus-visible{outline:none;color:var(--p-primary-color)}.kx-drawer-body{flex:1;min-height:0;overflow-y:auto;padding:16px}.kx-dsec{display:flex;flex-direction:column;gap:16px}.kx-dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.kx-dfact{padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);min-width:0}.kx-dfact-k{display:block;margin-bottom:4px;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-dfact-v{display:block;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-dsub{display:flex;flex-direction:column;gap:8px}.kx-dsub-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-dnote{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--p-text-muted-color);padding:4px 0}.kx-dnote-err{color:var(--p-danger-600, var(--p-danger-500))}.kx-dsec-foot{padding-top:4px}.kx-dmsg{margin:0;font-size:12.5px;line-height:1.5;padding:10px 12px;border-radius:var(--kx-radius-10);background:var(--kx-surface-1);color:var(--p-text-color);word-break:break-word}.kx-dmsg.is-err{background:var(--kx-wash-danger);color:var(--p-danger-700, var(--p-danger-600, var(--p-danger-500)))}.kx-dmsg.is-ok{background:var(--kx-wash-success);color:var(--p-success-700, var(--p-success-600, var(--p-success-500)))}.kx-errcard{display:flex;flex-direction:column;gap:9px;padding:13px 14px;border:1px solid color-mix(in srgb,var(--p-danger-500) 40%,var(--p-content-border-color));border-radius:var(--kx-radius-14);background:var(--kx-wash-danger)}.kx-errcard-head{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--p-danger-700, var(--p-danger-600, var(--p-danger-500)))}.kx-errcard-head svg{width:17px;height:17px;flex:none}.kx-errcard-cause{margin:0;font-size:12.5px;line-height:1.5;color:var(--p-text-color);word-break:break-word}.kx-errcard .p-button{align-self:flex-start}.kx-hint{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:var(--kx-radius-10);background:var(--kx-wash-info);font-size:12px;line-height:1.45;color:var(--p-text-color)}.kx-hint svg{width:16px;height:16px;flex:none;margin-top:1px;color:var(--p-info-600, var(--p-info-500))}.kx-history{display:flex;flex-direction:column;gap:20px}.kx-history-group{display:flex;flex-direction:column;gap:8px}.kx-history-group>h3{margin:0}.kx-history-entry{display:flex;flex-direction:column;gap:6px;padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);min-width:0}.kx-history-head{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}.kx-history-title{font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-history-state{flex:none;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-history-meta{margin:0;font-size:12px;color:var(--p-text-muted-color)}.kx-history-kv{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:4px 12px;align-items:baseline}.kx-history-kv .kx-dfact-k{margin:0}.kx-history-v{margin:0;font-size:13px;color:var(--p-text-color);overflow-wrap:anywhere}', Hs = { props: { type: "object", properties: { mode: { type: "string", default: "", description: '"create" when mounted as the workspace "+" -> Automation create view: opens straight into the install popup and emits created/close. Unset renders the full Automations page.' }, "parent-id": { type: "string", default: "", description: "Workspace folder to place the new automation under (create mode; empty = root)." }, "component-id": { type: "string", default: "", description: "Optional owning component; scopes rows and places newly created Automations under that component." }, input: { type: "string", default: "", description: "Initial declared install inputs as a JSON object, supplied by the owning component." }, "type-id": { type: "string", default: "", description: "Optional registry automation type id to preselect in create or component mode. The manager treats the id opaquely and mounts that type's declared create view." } } } }, Vs = {
  wippy: Hs
};
class Ks extends Eo {
  static get wippyConfig() {
    return {
      propsSchema: Vs.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Us
    };
  }
  static get vueConfig() {
    return { rootComponent: Ns, plugins: [Ho] };
  }
}
Jo(import.meta.url, Ks);
//# sourceMappingURL=index.js.map
