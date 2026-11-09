import { e as oe, _ as Oe, u as zo, a as Po, b as Do, W as Eo } from "./errMsg-kIukmtcj.js";
import { B as xe, l as Et, s as At, L as Ao, b as ve, v as $e, U as Io, I as vt, d as Lo, r as It, a as jo, c as Mo, e as Ro, C as To, h as Oo, S as Bo, _ as Fo, W as No, f as Uo, P as Ho } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-DNnuyvEa.js";
import { openBlock as l, createElementBlock as u, mergeProps as T, renderSlot as J, createTextVNode as ae, toDisplayString as C, resolveComponent as Be, resolveDirective as Lt, withDirectives as ue, createBlock as N, resolveDynamicComponent as Fe, withCtx as B, createCommentVNode as $, normalizeClass as V, createElementVNode as c, defineComponent as fe, computed as L, withModifiers as Xe, Fragment as W, createVNode as P, unref as r, watch as Ne, onBeforeUnmount as st, Transition as Vo, isRef as Ko, vModelText as tt, renderList as ne, vModelCheckbox as jt, vModelDynamic as qo, ref as R, nextTick as Je } from "vue";
import { s as Me, f as he, R as Mt, a as Wo, b as Rt, B as Yo, c as Zo, x as Qe, d as Go } from "./index-H3SmzmI1.js";
import { on as Tt, api as pe, host as ot, loadByTagName as Xo, define as Jo } from "@wippy-fe/proxy";
import { Icon as M } from "@iconify/vue";
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
      "p-badge-circle": At(o.value) && String(o.value).length === 1,
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
}, un = xe.extend({
  name: "badge",
  style: cn,
  classes: dn
}), pn = {
  name: "BaseBadge",
  extends: Me,
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
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function xt(e, t, o) {
  return (t = bn(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function bn(e) {
  var t = fn(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function fn(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Pe(n) != "object") return n;
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
      return he(xt(xt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, mn = ["data-p"];
function gn(e, t, o, n, i, a) {
  return l(), u("span", T({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [J(e.$slots, "default", {}, function() {
    return [ae(C(e.value), 1)];
  })], 16, mn);
}
Ot.render = gn;
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
function De(e) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, De(e);
}
function le(e, t, o) {
  return (t = hn(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function hn(e) {
  var t = xn(e, "string");
  return De(t) == "symbol" ? t : t + "";
}
function xn(e, t) {
  if (De(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (De(n) != "object") return n;
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
}, kn = xe.extend({
  name: "button",
  style: vn,
  classes: yn
}), wn = {
  name: "BaseButton",
  extends: Me,
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
function Ee(e) {
  "@babel/helpers - typeof";
  return Ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ee(e);
}
function X(e, t, o) {
  return (t = _n(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function _n(e) {
  var t = $n(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function $n(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Ee(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Z = {
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
      return T(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return he(X(X(X(X(X(X(X(X(X(X({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return he(X(X({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return he(X(X({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
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
  var f = Be("SpinnerIcon"), g = Be("Badge"), y = Lt("ripple");
  return e.asChild ? J(e.$slots, "default", {
    key: 1,
    class: V(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : ue((l(), N(Fe(e.as), T({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: B(function() {
      return [J(e.$slots, "default", {}, function() {
        return [e.loading ? J(e.$slots, "loadingicon", T({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (l(), u("span", T({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (l(), N(f, T({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : J(e.$slots, "icon", T({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (l(), u("span", T({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Cn)) : $("", !0)];
        }), e.label ? (l(), u("span", T({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), C(e.label), 17, Sn)) : $("", !0), e.badge ? (l(), N(g, {
          key: 3,
          value: e.badge,
          class: V(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : $("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[y]]);
}
Z.render = zn;
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
}, En = xe.extend({
  name: "progressspinner",
  style: Pn,
  classes: Dn
}), An = {
  name: "BaseProgressSpinner",
  extends: Me,
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
  extends: An,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, In = ["fill", "stroke-width"];
function Ln(e, t, o, n, i, a) {
  return l(), u("div", T({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(l(), u("svg", T({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [c("circle", T({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, In)], 16))], 16);
}
Bt.render = Ln;
const jn = { key: 0 }, Mn = /* @__PURE__ */ fe({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, o = L(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (n, i) => e.state.deleting_at ? (l(), u("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: i[1] || (i[1] = Xe(() => {
      }, ["stop"])),
      onKeydown: i[2] || (i[2] = Xe(() => {
      }, ["stop"]))
    }, [
      o.value ? (l(), u(W, { key: 0 }, [
        c("span", null, [
          i[3] || (i[3] = ae("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (l(), u("span", jn, ": " + C(e.state.deletion_job.last_error), 1)) : $("", !0)
        ]),
        P(r(Z), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: i[0] || (i[0] = Xe((a) => n.$emit("retry"), ["stop"]))
        })
      ], 64)) : (l(), u(W, { key: 1 }, [
        P(r(Bt), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        i[4] || (i[4] = c("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : $("", !0);
  }
});
function Ce(e) {
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
  const n = Ce(e) ? e : {}, i = [
    n,
    Ce(n.data) ? n.data : null,
    Ce(n.payload) ? n.payload : null,
    Ce(n.detail) ? n.detail : null
  ].filter(Boolean);
  for (const a of i) {
    if (a.event !== "component.meta.changed" && a.event !== "component.deleting" && a.event !== "component.deleted") continue;
    const f = String(a.component_id || ""), g = String(n.topic || a.topic || "");
    if (t === void 0) {
      if (!f && (!g.startsWith("component.") || g === "component.")) continue;
    } else if (f && f !== t || !f && g !== `component.${t}`) continue;
    const y = f || t || g.slice(10);
    return a.event === "component.deleting" && typeof a.deletion_job_id == "string" && a.deletion_job_id ? { event: a.event, component_id: y, deletion_job_id: a.deletion_job_id } : a.event !== "component.meta.changed" ? { event: a.event, component_id: y } : {
      event: "component.meta.changed",
      component_id: y,
      meta: Tn(Ce(a.meta) ? a.meta : {}, o),
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
  const i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
  function f(b, h) {
    const v = e.value.find((O) => t(O) === b), m = a.get(b), d = h?.job_id || m?.state.deletion_job_id || v?.deletion_job_id, _ = m ? m.state.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((m || v?.deleting_at) && d === _ || d && m?.superseded.has(d)) return;
    const z = {
      deleting_at: m?.state.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: d
    }, U = new Set(m?.superseded);
    for (const O of [m?.state.deletion_job_id, v?.deletion_job_id])
      O && O !== d && U.add(O);
    a.set(b, { state: z, superseded: U }), v && (Object.assign(v, z), v.deletion_job = void 0);
  }
  const g = Ne(() => e.value, (b, h = []) => {
    const v = b.filter((m) => !i.has(t(m)));
    for (const m of h)
      i.has(t(m)) || v.some((d) => t(d) === t(m)) || m.deleting_at && n?.(t(m));
    if (v.length !== b.length) {
      e.value = v;
      return;
    }
    for (const m of b) {
      m.deleting_at && m.deletion_job === void 0 && !h.includes(m) && (m.deletion_job = null);
      const d = a.get(t(m));
      if (d) {
        const z = m.deletion_job_id;
        m.deleting_at && z && z !== d.state.deletion_job_id && !d.superseded.has(z) && (d.state.deletion_job_id && d.superseded.add(d.state.deletion_job_id), d.state.deletion_job_id = z), z !== d.state.deletion_job_id && (m.deletion_job = void 0), Object.assign(m, d.state);
      }
      const _ = h.find((z) => t(z) === t(m));
      m.deletion_job === void 0 && _?.deletion_job_id === m.deletion_job_id && (m.deletion_job = _?.deletion_job);
    }
  }, { immediate: !0 }), y = Tt("@message", (b) => {
    const h = Bn(b);
    if (!h) return;
    const v = e.value.find((m) => t(m) === h.component_id);
    h.event === "component.deleted" ? (v && !i.has(h.component_id) && n?.(h.component_id), i.add(h.component_id), a.delete(h.component_id), e.value = e.value.filter((m) => t(m) !== h.component_id)) : v && f(h.component_id, { job_id: h.deletion_job_id });
  });
  return st(() => {
    g(), typeof y == "function" && y();
  }), { acceptDeletion: f };
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
    if (typeof e == "string") return nt(e, t);
    var o = {}.toString.call(e).slice(8, -1);
    return o === "Object" && e.constructor && (o = e.constructor.name), o === "Map" || o === "Set" ? Array.from(e) : o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? nt(e, t) : void 0;
  }
}
function Kn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function qn(e) {
  if (Array.isArray(e)) return nt(e);
}
function nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var o = 0, n = Array(t); o < t; o++) n[o] = e[o];
  return n;
}
function Wn(e, t, o, n, i, a) {
  return l(), u("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Un(t[0] || (t[0] = [c("path", {
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
    if (typeof e == "string") return rt(e, t);
    var o = {}.toString.call(e).slice(8, -1);
    return o === "Object" && e.constructor && (o = e.constructor.name), o === "Map" || o === "Set" ? Array.from(e) : o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? rt(e, t) : void 0;
  }
}
function Xn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Jn(e) {
  if (Array.isArray(e)) return rt(e);
}
function rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var o = 0, n = Array(t); o < t; o++) n[o] = e[o];
  return n;
}
function Qn(e, t, o, n, i, a) {
  return l(), u("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Yn(t[0] || (t[0] = [c("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ut.render = Qn;
var er = xe.extend({
  name: "focustrap-directive"
}), tr = Yo.extend({
  style: er
});
function Ae(e) {
  "@babel/helpers - typeof";
  return Ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ae(e);
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
  return Ae(t) == "symbol" ? t : t + "";
}
function rr(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Ae(n) != "object") return n;
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
      var n = this, i = o.value || {}, a = i.onFocusIn, f = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(g) {
        g.forEach(function(y) {
          if (y.type === "childList" && !t.contains(document.activeElement)) {
            var b = function(v) {
              var m = vt(v) ? vt(v, n.getComputedSelector(t.$_pfocustrap_focusableselector)) ? v : $e(t, n.getComputedSelector(t.$_pfocustrap_focusableselector)) : $e(v);
              return At(m) ? m : v.nextSibling && b(v.nextSibling);
            };
            ve(b(y.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(g) {
        return a && a(g);
      }, t.$_pfocustrap_focusoutlistener = function(g) {
        return f && f(g);
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
      var n = o.value || {}, i = n.autoFocusSelector, a = i === void 0 ? "" : i, f = n.firstFocusableSelector, g = f === void 0 ? "" : f, y = n.autoFocus, b = y === void 0 ? !1 : y, h = $e(t, "[autofocus]".concat(this.getComputedSelector(a)));
      b && !h && (h = $e(t, this.getComputedSelector(g))), ve(h);
    },
    onFirstHiddenElementFocus: function(t) {
      var o, n = t.currentTarget, i = t.relatedTarget, a = i === n.$_pfocustrap_lasthiddenfocusableelement || !((o = this.$el) !== null && o !== void 0 && o.contains(i)) ? $e(n.parentElement, this.getComputedSelector(n.$_pfocustrap_focusableselector)) : n.$_pfocustrap_lasthiddenfocusableelement;
      ve(a);
    },
    onLastHiddenElementFocus: function(t) {
      var o, n = t.currentTarget, i = t.relatedTarget, a = i === n.$_pfocustrap_firsthiddenfocusableelement || !((o = this.$el) !== null && o !== void 0 && o.contains(i)) ? Ao(n.parentElement, this.getComputedSelector(n.$_pfocustrap_focusableselector)) : n.$_pfocustrap_firsthiddenfocusableelement;
      ve(a);
    },
    createHiddenFocusableElements: function(t, o) {
      var n = this, i = o.value || {}, a = i.tabIndex, f = a === void 0 ? 0 : a, g = i.firstFocusableSelector, y = g === void 0 ? "" : g, b = i.lastFocusableSelector, h = b === void 0 ? "" : b, v = function(z) {
        return Io("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: f,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: z?.bind(n)
        });
      }, m = v(this.onFirstHiddenElementFocus), d = v(this.onLastHiddenElementFocus);
      m.$_pfocustrap_lasthiddenfocusableelement = d, m.$_pfocustrap_focusableselector = y, m.setAttribute("data-pc-section", "firstfocusableelement"), d.$_pfocustrap_firsthiddenfocusableelement = m, d.$_pfocustrap_focusableselector = h, d.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(m), t.append(d);
    }
  }
});
function wt() {
  jo({
    variableName: It("scrollbar.width").name
  });
}
function _t() {
  Lo({
    variableName: It("scrollbar.width").name
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
}, cr = xe.extend({
  name: "dialog",
  style: ir,
  classes: lr,
  inlineStyles: sr
}), dr = {
  name: "BaseDialog",
  extends: Me,
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
}, ze = {
  name: "Dialog",
  extends: dr,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: L(function() {
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
      this.$emit("hide"), ve(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
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
      o || (o = this.$slots.header && t(this.headerContainer), o || (o = this.$slots.default && t(this.content), o || (this.maximizable ? (this.focusableMax = !0, o = this.maximizableButton) : (this.focusableClose = !0, o = this.closeButton)))), o && ve(o, {
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
          var n = Ro(t.container), i = To(t.container), a = o.pageX - t.lastPageX, f = o.pageY - t.lastPageY, g = t.container.getBoundingClientRect(), y = g.left + a, b = g.top + f, h = Oo(), v = getComputedStyle(t.container), m = parseFloat(v.marginLeft), d = parseFloat(v.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (y >= t.minX && y + n < h.width && (t.lastPageX = o.pageX, t.container.style.left = y - m + "px"), b >= t.minY && b + i < h.height && (t.lastPageY = o.pageY, t.container.style.top = b - d + "px")) : (t.lastPageX = o.pageX, t.container.style.left = y - m + "px", t.lastPageY = o.pageY, t.container.style.top = b - d + "px");
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
      return he({
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
    Button: Z,
    Portal: Mo,
    WindowMinimizeIcon: Ut,
    WindowMaximizeIcon: Nt,
    TimesIcon: Zo
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
  return Ie(t) == "symbol" ? t : t + "";
}
function br(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Ie(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var fr = ["data-p"], mr = ["aria-labelledby", "aria-modal", "data-p"], gr = ["id"], vr = ["data-p"];
function hr(e, t, o, n, i, a) {
  var f = Be("Button"), g = Be("Portal"), y = Lt("focustrap");
  return l(), N(g, {
    appendTo: e.appendTo
  }, {
    default: B(function() {
      return [i.containerVisible ? (l(), u("div", T({
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
      }, e.ptm("mask")), [P(Vo, T({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: B(function() {
          return [e.visible ? ue((l(), u("div", T({
            key: 0,
            ref: a.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": a.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": a.dataP
          }, e.ptmi("root")), [e.$slots.container ? J(e.$slots, "container", {
            key: 0,
            closeCallback: a.close,
            maximizeCallback: function(h) {
              return a.maximize(h);
            },
            initDragCallback: a.initDrag
          }) : (l(), u(W, {
            key: 1
          }, [e.showHeader ? (l(), u("div", T({
            key: 0,
            ref: a.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, e.ptm("header")), [J(e.$slots, "header", {
            class: V(e.cx("title"))
          }, function() {
            return [e.header ? (l(), u("span", T({
              key: 0,
              id: a.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), C(e.header), 17, gr)) : $("", !0)];
          }), c("div", T({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? J(e.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(h) {
              return a.maximize(h);
            }
          }, function() {
            return [P(f, T({
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
              icon: B(function(b) {
                return [J(e.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(l(), N(Fe(a.maximizeIconComponent), T({
                    class: [b.class, i.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : $("", !0), e.closable ? J(e.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [P(f, T({
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
              icon: B(function(b) {
                return [J(e.$slots, "closeicon", {}, function() {
                  return [(l(), N(Fe(e.closeIcon ? "span" : "TimesIcon"), T({
                    class: [e.closeIcon, b.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : $("", !0)], 16)], 16)) : $("", !0), c("div", T({
            ref: a.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": a.dataP
          }, Ct(Ct({}, e.contentProps), e.ptm("content"))), [J(e.$slots, "default")], 16, vr), e.footer || e.$slots.footer ? (l(), u("div", T({
            key: 1,
            ref: a.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [J(e.$slots, "footer", {}, function() {
            return [ae(C(e.footer), 1)];
          })], 16)) : $("", !0)], 64))], 16, mr)), [[y, {
            disabled: !e.modal
          }]]) : $("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, fr)) : $("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
ze.render = hr;
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
}, kr = xe.extend({
  name: "tag",
  style: xr,
  classes: yr
}), wr = {
  name: "BaseTag",
  extends: Me,
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
function Le(e) {
  "@babel/helpers - typeof";
  return Le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Le(e);
}
function _r(e, t, o) {
  return (t = $r(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function $r(e) {
  var t = Cr(e, "string");
  return Le(t) == "symbol" ? t : t + "";
}
function Cr(e, t) {
  if (Le(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var n = o.call(e, t);
    if (Le(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var lt = {
  name: "Tag",
  extends: wr,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return he(_r({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Sr = ["data-p"];
function zr(e, t, o, n, i, a) {
  return l(), u("span", T({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (l(), N(Fe(e.$slots.icon), T({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (l(), u("span", T({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : $("", !0), e.value != null || e.$slots.default ? J(e.$slots, "default", {
    key: 2
  }, function() {
    return [c("span", T({
      class: e.cx("label")
    }, e.ptm("label")), C(e.value), 17)];
  }) : $("", !0)], 16, Sr);
}
lt.render = zr;
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
function be(e, t) {
  const o = Pr(e);
  if (o === null) return "";
  const n = t?.now ?? Date.now(), i = t?.suffix ?? !0, a = t?.maxUnit ?? "day", f = t?.future ?? !1, g = 6e4, y = 60 * g, b = 24 * y, h = 30 * b, v = 365 * b, m = n - o;
  if (f && m < 0) {
    const z = -m;
    return z < g ? "in <1m" : z < y ? `in ${Math.floor(z / g)}m` : z < b ? `in ${Math.floor(z / y)}h` : `in ${Math.floor(z / b)}d`;
  }
  const d = Math.max(0, m);
  if (d < g) return "just now";
  const _ = i ? " ago" : "";
  return d < y ? `${Math.floor(d / g)}m${_}` : d < b ? `${Math.floor(d / y)}h${_}` : a === "year" ? d < h ? `${Math.floor(d / b)}d${_}` : d < v ? `${Math.floor(d / h)}mo${_}` : `${Math.floor(d / v)}y${_}` : `${Math.floor(d / b)}d${_}`;
}
function at(e) {
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
function it(e) {
  return Ht(e?.component?.create_ui);
}
function Dr(e) {
  return Vt(e?.component?.create_ui);
}
function ct(e) {
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
const Ar = { class: "kx-modal-head-icon" }, Ir = { class: "kx-modal-head-text" }, Lr = { class: "kx-modal-head-title" }, jr = {
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
}, na = /* @__PURE__ */ fe({
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
      installing: g,
      customSaving: y,
      installError: b,
      customInstallHost: h,
      installSearchInput: v,
      typeSearch: m,
      filteredTypes: d,
      chooseType: _,
      closeInstall: z,
      focusInstallDialog: U,
      onCreate: O
    } = t.flow;
    return (re, Y) => (l(), N(r(ze), {
      visible: r(i),
      modal: !0,
      "block-scroll": !0,
      "dismissable-mask": !0,
      pt: e.dialogPt,
      class: V(["kx-modal kx-modal-2p", { "kx-modal-solo": !r(o) }]),
      "aria-label": "Add an automation",
      "onUpdate:visible": Y[1] || (Y[1] = (I) => {
        I || r(z)();
      }),
      onShow: r(U)
    }, {
      header: B(() => [
        c("span", Ar, [
          P(r(M), {
            icon: r(a) && r(a).icon || "tabler:bolt",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        c("span", Ir, [
          c("span", Lr, C(r(a) ? r(a).title || r(a).name : "Add an automation"), 1),
          Y[2] || (Y[2] = c("span", { class: "kx-modal-head-sub" }, "Configure an automation.", -1))
        ])
      ]),
      footer: B(() => [
        r(b) ? (l(), u("div", oa, C(r(b)), 1)) : $("", !0),
        P(r(Z), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: r(g) || r(y),
          onClick: r(z)
        }, null, 8, ["disabled", "onClick"]),
        r(a) ? (l(), N(r(Z), {
          key: 1,
          type: "button",
          "data-testid": "automations-install-create",
          label: r(g) || r(y) ? "Creating…" : "Create",
          loading: r(g) || r(y),
          disabled: r(g) || r(y),
          onClick: r(O)
        }, {
          icon: B(({ class: I }) => [
            P(r(M), {
              icon: "tabler:plus",
              class: V(I),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["label", "loading", "disabled", "onClick"])) : $("", !0)
      ]),
      default: B(() => [
        c("div", {
          class: V(["kx-2p", { "kx-2p-solo": !r(o) }])
        }, [
          r(o) ? (l(), u("div", jr, [
            c("div", Mr, [
              P(r(M), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              ue(c("input", {
                ref_key: "installSearchInput",
                ref: v,
                "onUpdate:modelValue": Y[0] || (Y[0] = (I) => Ko(m) ? m.value = I : null),
                "data-modal-initial": "",
                type: "text",
                placeholder: "Search types…",
                "aria-label": "Search automation types"
              }, null, 512), [
                [tt, r(m)]
              ])
            ]),
            r(d).length ? (l(), u("div", Tr, [
              (l(!0), u(W, null, ne(r(d), (I) => (l(), u("button", {
                key: I.id,
                class: V(["kx-cat-card", r(a)?.id === I.id && "sel"]),
                onClick: (F) => r(_)(I)
              }, [
                c("span", Br, [
                  P(r(M), {
                    icon: I.icon || "tabler:sparkles",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                c("span", Fr, [
                  c("span", Nr, C(I.title || I.name), 1),
                  r(at)(I) ? (l(), u("span", Ur, C(r(at)(I)), 1)) : $("", !0)
                ]),
                P(r(M), {
                  icon: "tabler:check",
                  class: "kx-cat-check",
                  "aria-hidden": "true"
                })
              ], 10, Or))), 128))
            ])) : (l(), u("div", Rr, "No setups match “" + C(r(m)) + "”.", 1))
          ])) : $("", !0),
          c("div", Hr, [
            r(o) ? (l(), u("div", Vr, "Setup")) : $("", !0),
            c("div", Kr, [
              r(a) ? (l(), u(W, { key: 1 }, [
                r(it)(r(a)) ? (l(), u("div", {
                  key: 0,
                  ref_key: "customInstallHost",
                  ref: h,
                  class: "kx-custom-host"
                }, null, 512)) : r(n).length ? (l(), u("div", Yr, [
                  (l(!0), u(W, null, ne(r(n), ([I, F]) => (l(), u("label", {
                    key: I,
                    class: "kx-field"
                  }, [
                    c("span", Zr, [
                      ae(C(F.title || I) + " ", 1),
                      r(Qo)(r(a), I) ? (l(), u("span", Gr, "*")) : $("", !0)
                    ]),
                    F.enum ? (l(), N(r(Go), {
                      key: 0,
                      class: "kx-select",
                      "model-value": r(f)[I],
                      options: r(en)(r(a), I, F),
                      "option-label": "label",
                      "option-value": "value",
                      placeholder: "—",
                      "aria-label": F.title || I,
                      "onUpdate:modelValue": (K) => r(f)[I] = K
                    }, null, 8, ["model-value", "options", "aria-label", "onUpdate:modelValue"])) : F.type === "boolean" ? ue((l(), u("input", {
                      key: 1,
                      "onUpdate:modelValue": (K) => r(f)[I] = K,
                      class: "kx-check",
                      type: "checkbox"
                    }, null, 8, Xr)), [
                      [jt, r(f)[I]]
                    ]) : F.type === "number" || F.type === "integer" ? ue((l(), u("input", {
                      key: 2,
                      "onUpdate:modelValue": (K) => r(f)[I] = K,
                      class: "kx-input",
                      type: "number"
                    }, null, 8, Jr)), [
                      [
                        tt,
                        r(f)[I],
                        void 0,
                        { number: !0 }
                      ]
                    ]) : ue((l(), u("input", {
                      key: 3,
                      "onUpdate:modelValue": (K) => r(f)[I] = K,
                      class: "kx-input",
                      type: r(tn)(F),
                      placeholder: F.description || ""
                    }, null, 8, Qr)), [
                      [qo, r(f)[I]]
                    ]),
                    F.description && !(F.type !== "boolean" && !F.enum) ? (l(), u("span", ea, C(F.description), 1)) : F.description && F.enum ? (l(), u("span", ta, C(F.description), 1)) : $("", !0)
                  ]))), 128))
                ])) : (l(), u("div", Wr, "This automation needs no configuration."))
              ], 64)) : (l(), u("p", qr, "Select an automation type to configure it."))
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
}, la = { class: "kx-metrics kx-metrics-detail" }, ca = { class: "kx-metric-k" }, da = ["title"], ua = /* @__PURE__ */ fe({
  __name: "RowMetrics",
  props: {
    face: { default: () => [] },
    detail: { default: () => [] }
  },
  setup(e) {
    return (t, o) => (l(), u(W, null, [
      e.face.length ? (l(), u("div", ra, [
        (l(!0), u(W, null, ne(e.face, (n) => (l(), u("span", {
          key: n.label,
          class: "kx-metric"
        }, [
          n.icon ? (l(), N(r(M), {
            key: 0,
            icon: n.icon,
            class: "kx-metric-i",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : $("", !0),
          c("span", aa, C(n.label), 1),
          c("span", {
            class: "kx-metric-v",
            title: n.title
          }, C(n.value), 9, ia)
        ]))), 128))
      ])) : $("", !0),
      e.detail.length ? (l(), u("details", sa, [
        o[0] || (o[0] = c("summary", { class: "kx-metric-more" }, "Details", -1)),
        c("div", la, [
          (l(!0), u(W, null, ne(e.detail, (n) => (l(), u("span", {
            key: n.label,
            class: "kx-metric"
          }, [
            n.icon ? (l(), N(r(M), {
              key: 0,
              icon: n.icon,
              class: "kx-metric-i",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : $("", !0),
            c("span", ca, C(n.label), 1),
            c("span", {
              class: "kx-metric-v",
              title: n.title
            }, C(n.value), 9, da)
          ]))), 128))
        ])
      ])) : $("", !0)
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
  const t = [...Yt(e)], o = !!ct(e);
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
const ma = ["run", "recovery", "edit", "delete"], ga = {
  run: "Run",
  recovery: "Recovery",
  edit: "Edit",
  delete: ""
};
function va(e) {
  return ma.map((t) => ({ group: t, label: ga[t], items: e.filter((o) => o.group === t) })).filter((t) => t.items.length > 0);
}
function ha(e, t) {
  return e.group === "run" ? `Run ${t} now` : e.method === "reconfigure" ? `Edit ${t}` : `${e.label} ${t}`;
}
const xa = ["aria-label"], ya = {
  key: 1,
  class: "kx-menu-sep",
  role: "separator"
}, ka = ["data-testid", "aria-label", "disabled", "onClick"], wa = { class: "kx-menu-item-body" }, _a = { class: "kx-menu-item-label" }, $a = { class: "kx-menu-item-desc" }, Jt = /* @__PURE__ */ fe({
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
    const o = e, n = t, i = R(!1), a = R(null), f = L(() => va(o.items));
    function g() {
      i.value = !i.value;
    }
    function y() {
      i.value = !1;
    }
    function b(h) {
      o.disabled || h.disabled || (y(), n("select", h.method));
    }
    return (h, v) => (l(), u("span", {
      ref_key: "trigger",
      ref: a,
      class: "kx-menu"
    }, [
      P(r(Z), {
        type: "button",
        severity: "secondary",
        outlined: "",
        size: e.size === "normal" ? void 0 : "small",
        class: V(["kx-menu-trigger", i.value && "is-active"]),
        "aria-haspopup": !0,
        "aria-expanded": i.value,
        "aria-label": e.triggerLabel || `More actions for ${e.name}`,
        title: "More actions",
        disabled: e.disabled,
        onClick: g
      }, {
        icon: B(({ class: m }) => [
          P(r(M), {
            icon: "tabler:dots",
            "aria-hidden": "true",
            class: V(m)
          }, null, 8, ["class"])
        ]),
        _: 1
      }, 8, ["size", "class", "aria-expanded", "aria-label", "disabled"]),
      P(Uo, {
        open: i.value,
        "onUpdate:open": v[0] || (v[0] = (m) => i.value = m),
        anchor: a.value,
        align: "right",
        width: 264,
        "max-height": 460,
        gap: 6
      }, {
        default: B(() => [
          c("div", {
            class: "kx-menu-panel",
            role: "menu",
            "aria-label": `Actions for ${e.name}`
          }, [
            (l(!0), u(W, null, ne(f.value, (m, d) => (l(), u(W, {
              key: m.group
            }, [
              m.label ? (l(), u("div", {
                key: 0,
                class: V(["kx-menu-group", d === 0 && "is-first"])
              }, C(m.label), 3)) : d > 0 ? (l(), u("div", ya)) : $("", !0),
              (l(!0), u(W, null, ne(m.items, (_) => (l(), u("button", {
                key: _.method,
                type: "button",
                role: "menuitem",
                class: V(["kx-menu-item", [_.danger && "is-danger", _.warn && "is-warn"]]),
                "data-testid": `action-${_.method}`,
                "aria-label": r(ha)(_, e.name),
                disabled: e.disabled || _.disabled || e.busy && _.kind === "call",
                onClick: (z) => b(_)
              }, [
                P(r(M), {
                  icon: _.icon,
                  class: "kx-menu-item-ico",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                c("span", wa, [
                  c("span", _a, [
                    ae(C(_.label) + " ", 1),
                    _.warn ? (l(), N(r(M), {
                      key: 0,
                      icon: "tabler:alert-triangle",
                      class: "kx-menu-item-warn",
                      "aria-hidden": "true"
                    })) : $("", !0)
                  ]),
                  c("span", $a, C(_.description), 1)
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
  "aria-label": "History",
  class: "kx-history"
}, Sa = {
  key: 0,
  role: "status",
  class: "kx-dnote"
}, za = {
  key: 1,
  role: "alert",
  class: "kx-dnote kx-dnote-err"
}, Pa = {
  key: 0,
  class: "kx-dnote"
}, Da = { class: "kx-history-head" }, Ea = ["datetime"], Aa = { class: "kx-history-state" }, Ia = { class: "kx-history-kv" }, La = { class: "kx-dfact-k" }, ja = ["aria-label"], Ma = {
  class: "kx-history-v",
  "aria-label": "Authorized by"
}, Ra = {
  key: 0,
  class: "kx-dmsg is-err"
}, Ta = /* @__PURE__ */ fe({
  __name: "ExecutionHistory",
  props: {
    root: {}
  },
  emits: ["error"],
  setup(e, { emit: t }) {
    const o = e, n = t, i = R([]), a = R([]), f = R([]), g = R(""), y = R(""), b = R(!1), h = R("");
    let v = 0;
    function m() {
      i.value = [], a.value = [], f.value = [], g.value = "", y.value = "";
    }
    function d(x) {
      return f.value.find((j) => j.type === x?.kind && j.id === x?.id)?.label || "Account unavailable";
    }
    function _(x, j) {
      const s = d(j);
      return x.evidence_status === "inferred" ? `${s} (unverified)` : s;
    }
    function z(x) {
      return x.evidence_status === "absent" ? "Account not recorded" : x.evidence_status === "unresolved" ? "Account unavailable" : _(x, x.evidence?.identity?.principal);
    }
    function U(x) {
      return {
        resolved: "Completed",
        waiting: "Waiting to retry",
        uncertain: "Needs attention",
        failed: "Failed",
        filtered: "Skipped",
        superseded: "Replaced",
        succeeded: "Accepted",
        pending: "Updating…"
      }[x] || "Outcome unavailable";
    }
    const O = L(() => [
      ...i.value.map((x) => ({
        key: re(x),
        at: x.round_at,
        state: x.state,
        account: z(x),
        role: "Run by",
        authorizer: x.evidence?.identity?.authorized_by ? _(x, x.evidence.identity.authorized_by) : void 0,
        error: Y(x.error)
      })),
      ...a.value.map((x) => ({
        key: `${x.generation}:${x.request_id}`,
        at: x.created_at,
        state: x.state,
        account: x.initiation ? d({ kind: "user", id: x.initiation.actor_id }) : "Account not recorded",
        role: "Requested by",
        authorizer: void 0,
        error: ""
      }))
    ].sort((x, j) => j.at.localeCompare(x.at) || x.key.localeCompare(j.key)));
    function re(x) {
      return JSON.stringify([x.drive_key, x.round_token, x.source_port, x.item_key, x.identity_key]);
    }
    function Y(x) {
      return oe(x, typeof x == "string" ? x : "");
    }
    async function I(x, j, s = "") {
      const { data: S } = await pe.get(
        "/api/v1/automations/" + encodeURIComponent(x) + "/history",
        { params: { kind: j, page_size: 25, ...s ? { page_token: s } : {} } }
      );
      if (!S.success || S.kind !== j || !Array.isArray(S.entries)) throw new Error(S.error?.message || "Could not read execution history");
      if (S.next_page_token && S.next_page_token === s) throw new Error("History page repeats its cursor");
      return S;
    }
    async function F(x, j) {
      const s = /* @__PURE__ */ new Map();
      function S(D) {
        D && (D.kind === "user" || D.kind === "group") && s.set(D.kind + ":" + D.id, { type: D.kind, id: D.id });
      }
      for (const D of x)
        S(D.evidence?.identity?.principal), S(D.evidence?.identity?.authorized_by);
      for (const D of j)
        D.initiation && S({ kind: "user", id: D.initiation.actor_id });
      return ln([...s.values()]);
    }
    function K(x) {
      m(), h.value = oe(x, "Could not read execution history"), n("error", { message: h.value, error: x });
    }
    async function G() {
      const x = ++v, j = o.root;
      if (m(), h.value = "", b.value = !1, !!j) {
        b.value = !0;
        try {
          const [s, S] = await Promise.all([I(j, "deliveries"), I(j, "controls")]), D = await F(s.entries, S.entries);
          if (x !== v) return;
          i.value = s.entries, a.value = S.entries, f.value = D, g.value = s.next_page_token || "", y.value = S.next_page_token || "";
        } catch (s) {
          x === v && K(s);
        } finally {
          x === v && (b.value = !1);
        }
      }
    }
    async function ie() {
      if (b.value || !g.value && !y.value) return;
      const x = v, j = o.root;
      b.value = !0, h.value = "";
      try {
        const [s, S] = await Promise.all([
          g.value ? I(j, "deliveries", g.value) : null,
          y.value ? I(j, "controls", y.value) : null
        ]), D = [...i.value, ...s?.entries || []], Q = [...a.value, ...S?.entries || []], ye = await F(D, Q);
        if (x !== v) return;
        i.value = D, a.value = Q, f.value = ye, g.value = s?.next_page_token || "", y.value = S?.next_page_token || "";
      } catch (s) {
        x === v && K(s);
      } finally {
        x === v && (b.value = !1);
      }
    }
    return Ne(() => o.root, () => {
      G();
    }, { immediate: !0 }), st(() => {
      v += 1;
    }), (x, j) => (l(), u("section", Ca, [
      j[1] || (j[1] = c("h3", { class: "kx-dsub-lbl" }, "History", -1)),
      b.value ? (l(), u("p", Sa, "Loading history…")) : $("", !0),
      h.value ? (l(), u("p", za, C(h.value), 1)) : (l(), u(W, { key: 2 }, [
        !b.value && !O.value.length ? (l(), u("p", Pa, "No history yet.")) : $("", !0),
        (l(!0), u(W, null, ne(O.value, (s) => (l(), u("article", {
          key: s.key,
          class: "kx-history-entry"
        }, [
          c("div", Da, [
            c("time", {
              class: "kx-history-meta",
              datetime: s.at
            }, C(r(be)(s.at, { future: !0 })), 9, Ea),
            c("span", Aa, C(U(s.state)), 1)
          ]),
          c("dl", Ia, [
            c("dt", La, C(s.role), 1),
            c("dd", {
              class: "kx-history-v",
              "aria-label": s.role
            }, C(s.account), 9, ja),
            s.authorizer ? (l(), u(W, { key: 0 }, [
              j[0] || (j[0] = c("dt", { class: "kx-dfact-k" }, "Authorized by", -1)),
              c("dd", Ma, C(s.authorizer), 1)
            ], 64)) : $("", !0)
          ]),
          s.error ? (l(), u("p", Ra, C(s.error), 1)) : $("", !0)
        ]))), 128)),
        g.value || y.value ? (l(), N(r(Z), {
          key: 1,
          label: "More history",
          severity: "secondary",
          disabled: b.value,
          onClick: ie
        }, null, 8, ["disabled"])) : $("", !0)
      ], 64))
    ]));
  }
});
function je(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Oa(e) {
  return je(e) && typeof e.code == "string" && typeof e.message == "string" && typeof e.at == "string" && (e.item_key === void 0 || typeof e.item_key == "string");
}
function Ba(e) {
  if (!je(e) || typeof e.drive_key != "string") return !1;
  for (const t of ["source_kind", "phase"])
    if (e[t] !== void 0 && typeof e[t] != "string") return !1;
  if (e.enabled !== void 0 && typeof e.enabled != "boolean") return !1;
  for (const t of ["next_run_at", "last_run_at", "last_round_at"])
    if (e[t] !== void 0 && e[t] !== null && typeof e[t] != "string") return !1;
  for (const t of ["unresolved_count", "uncertain_count"])
    if (e[t] !== void 0 && (typeof e[t] != "number" || !Number.isInteger(e[t]) || e[t] < 0)) return !1;
  return !(e.last_error !== void 0 && e.last_error !== null && (!je(e.last_error) || e.last_error.message !== void 0 && typeof e.last_error.message != "string"));
}
function Fa(e) {
  if (!je(e) || e.success !== !0 || !Array.isArray(e.drives) || !e.drives.every(Ba) || e.next_page_token !== void 0 && e.next_page_token !== null && (typeof e.next_page_token != "string" || !e.next_page_token)) return !1;
  const t = e.delivery_failures;
  return t === void 0 || je(t) && typeof t.count == "number" && Number.isInteger(t.count) && t.count >= 0 && (t.last_error === void 0 || Oa(t.last_error));
}
const Qt = {
  blocked_identity: "The account this automation runs as needs to be confirmed.",
  blocked_access: "This automation lost access to something it uses.",
  blocked_declaration: "This automation's settings need to be fixed."
};
function He(e) {
  return (e?.drives || []).filter((t) => t.source_kind !== "none");
}
function Te(e) {
  return e.enabled === !1 || e.phase === "paused";
}
function Dt(e) {
  return (e.source_kind === "timer" || e.source_kind === "collection") && (e.phase === "pending" || e.phase === "active") && typeof e.next_run_at == "string" && Date.parse(e.next_run_at) > Date.now();
}
function Na(e) {
  const t = He(e), o = (e?.delivery_failures?.count || 0) > 0;
  if (!t.length) return o ? { kind: "warn", label: "Needs attention" } : null;
  if (t.some((i) => (i.phase || "") in Qt)) return { kind: "warn", label: "Needs attention" };
  if (t.every(Te)) return { kind: "off", label: "Paused" };
  if (o) return { kind: "warn", label: "Needs attention" };
  if (t.some((i) => i.phase === "degraded")) return { kind: "warn", label: "Retrying" };
  if (t.some((i) => i.phase === "backpressure")) return { kind: "live", label: "Catching up" };
  if (t.some((i) => !Te(i) && i.phase === "pending" && !Dt(i))) return { kind: "neutral", label: "Starting" };
  const n = t.filter((i) => !Te(i) && i.source_kind !== "reconcile");
  return n.length && n.every(Dt) ? { kind: "on", label: "Scheduled" } : { kind: "on", label: "Active" };
}
function Ua(e) {
  const t = e?.delivery_failures?.last_error;
  if (t) return `${t.code}: ${t.message}`;
  const o = He(e);
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
function Ha(e) {
  const t = He(e), o = [], n = Se(e).next;
  n && o.push({ label: "Next run", value: n, time: !0 });
  const i = t.reduce((a, f) => a + (f.unresolved_count || 0), 0);
  return i > 0 && o.push({ label: "Waiting to retry", value: `${i} ${i === 1 ? "item" : "items"}` }), o;
}
function Se(e) {
  const t = He(e), o = t.map((i) => i.last_run_at).filter((i) => typeof i == "string" && !!i).sort().at(-1), n = t.filter((i) => !Te(i)).map((i) => i.next_run_at).filter((i) => typeof i == "string" && !!i).sort()[0];
  return { last: o, next: n };
}
const Va = /* @__PURE__ */ new Set(["status", "enabled", "last_error", "last_run_at", "next_run_at"]);
function Ka(e) {
  return e.replace(/_/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function qa(e) {
  return e.replace(/\b\w/g, (t) => t.toUpperCase());
}
function Wa(e) {
  return e && e.charAt(0).toUpperCase() + e.slice(1);
}
function Ya(e, t) {
  if (e.type === "boolean") return t === !0 ? "Yes" : "No";
  const o = String(t);
  return e.key.endsWith("_at") || /^\d{4}-\d{2}-\d{2}T/.test(o) ? be(o, { future: !0 }) || o : e.type === "text" ? Wa(o) : o;
}
function eo(e) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e) || /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(e) ? !0 : /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:_-]*$/i.test(e) && /:[0-9a-f-]{6,}/i.test(e);
}
function Za(e) {
  return eo(e) ? { text: e.length > 12 ? `${e.slice(0, 8)}…` : e, title: e } : { text: e };
}
const Ga = [
  { match: /component_id not in scope|not in scope/i, text: "Not part of this workspace" },
  { match: /transform output must be an object/i, text: "Item format not recognized" },
  { match: /trigger events dropped/i, text: "Incoming events were dropped" },
  { match: /requires dest_ref/i, text: "Missing a destination reference" },
  { match: /does not declare sink operation|accepts source payloads only/i, text: "Destination cannot accept this item" },
  { match: /sink write (returned a non-object|did not acknowledge)/i, text: "Destination did not confirm the save" },
  { match: /(sink|source) resolve/i, text: "Source or destination unavailable" }
];
function Xa(e) {
  const t = e.trim();
  if (!t) return { text: "" };
  for (const o of Ga)
    if (o.match.test(t)) return { text: o.text, title: t };
  return { text: "Skipped", title: t };
}
function to(e) {
  return /reason/i.test(e);
}
function Ja(e, t) {
  return to(e.key) || /(^|_)item(_key)?$/i.test(e.key) ? !0 : typeof t == "string" && eo(t);
}
function Qa(e, t) {
  const o = qa(e.label || Ka(e.key));
  if (to(e.key)) {
    const { text: a, title: f } = Xa(String(t));
    return { label: o, value: a, title: f, icon: e.icon };
  }
  const { text: n, title: i } = Za(Ya(e, t));
  return { label: o, value: n, title: i, icon: e.icon };
}
function Ue(e, t, o) {
  const n = t;
  if (!e || !n) return [];
  const i = [];
  for (const a of e) {
    if (!a?.key || Va.has(a.key) || a.role === "subtitle") continue;
    const f = n[a.key];
    f == null || f === "" || a.hidden || a.hide_zero && f === 0 || Ja(a, f) === o && i.push(Qa(a, f));
  }
  return i;
}
function dt(e) {
  return String(e?.status || "").toLowerCase();
}
function ei(e) {
  return typeof e == "string" && /\b(completed|succeeded|successfully)\b/i.test(e);
}
function oo(e) {
  const t = dt(e);
  return t === "completed" || t === "failed";
}
function ut(e) {
  const t = dt(e);
  return t === "failed" || t === "failing" ? !0 : !!e?.last_error && !ei(e.last_error);
}
function no(e, t) {
  if (t?.code === "unavailable") return { tone: "error", text: "Its module is unavailable. Reinstall its module to use this automation." };
  const o = typeof e?.last_error == "string" ? e.last_error.trim() : "";
  return o ? ut(e) ? { tone: "error", text: o } : { tone: "success", text: o } : null;
}
function ro(e, t, o, n) {
  if (n?.code === "unavailable") return { kind: "warn", label: "Unavailable" };
  const i = Na(o);
  if (i) return i;
  if (!e)
    return t ? { kind: "neutral", label: "…" } : { kind: "neutral", label: "Installed" };
  const a = dt(e);
  return ut(e) ? { kind: "warn", label: a === "failed" ? "Failed" : "Failing" } : a === "completed" ? { kind: "done", label: "Completed" } : a === "paused" || e.enabled === !1 ? { kind: "off", label: "Paused" } : a === "running" ? { kind: "live", label: "Running" } : { kind: "on", label: "Active" };
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
    const a = n ? `?page_token=${encodeURIComponent(n)}` : "", { data: f } = await pe.get(`/api/v1/automations/${encodeURIComponent(e)}/status${a}`);
    if (!Fa(f)) throw new Error("Invalid automation status response");
    if (t.push(...f.drives), i = f.delivery_failures, n = f.next_page_token || void 0, n && o.has(n)) throw new Error("Automation status repeated a page token");
    n && o.add(n);
  } while (n);
  return { drives: t, delivery_failures: i };
}
const ti = ["aria-label"], oi = { class: "kx-drawer-head" }, ni = { class: "kx-ficon" }, ri = { class: "kx-drawer-id" }, ai = ["title"], ii = { class: "kx-drawer-sub" }, si = { class: "kx-drawer-controls" }, li = {
  class: "kx-tabs",
  role: "tablist"
}, ci = ["aria-selected", "data-testid", "onClick"], di = { class: "kx-drawer-body" }, ui = {
  key: 0,
  class: "kx-dsec"
}, pi = {
  key: 0,
  class: "kx-errcard",
  "data-testid": "drawer-error-card"
}, bi = { class: "kx-errcard-head" }, fi = { class: "kx-errcard-cause" }, mi = { class: "kx-dgrid" }, gi = { class: "kx-dfact-k" }, vi = { class: "kx-dfact-v" }, hi = {
  key: 1,
  class: "kx-dsub"
}, xi = { class: "kx-metrics" }, yi = { class: "kx-metric-k" }, ki = ["title"], wi = {
  key: 1,
  class: "kx-dsec",
  "data-testid": "drawer-config"
}, _i = {
  key: 2,
  class: "kx-dnote"
}, $i = {
  key: 2,
  class: "kx-dsec"
}, Ci = { class: "kx-dgrid" }, Si = { class: "kx-dfact" }, zi = { class: "kx-dfact-v" }, Pi = { class: "kx-dfact" }, Di = { class: "kx-dfact-v" }, Ei = { class: "kx-dfact" }, Ai = { class: "kx-dfact-v" }, Ii = {
  key: 0,
  class: "kx-dsub"
}, Li = /* @__PURE__ */ fe({
  __name: "DetailDrawer",
  props: {
    automation: { default: () => ({ id: "" }) },
    type: {}
  },
  emits: ["close", "action", "recover", "changed"],
  setup(e, { emit: t }) {
    const o = e, n = t, i = R("overview"), a = [
      { id: "overview", label: "Overview", icon: "tabler:layout-dashboard" },
      { id: "config", label: "Config", icon: "tabler:settings" },
      { id: "activity", label: "Activity", icon: "tabler:history" }
    ], f = L(() => o.automation.title || o.automation.id), g = L(() => o.automation.icon || o.type?.icon || "tabler:bolt"), y = L(() => o.type?.title || "Automation"), b = L(() => o.automation.public_state), h = L(() => Zt(o.type)), v = L(() => Xt(h.value)), m = L(() => h.value.declared.includes("status")), d = R(null);
    let _ = 0;
    async function z(H) {
      const A = ++_;
      if (!H || !o.automation.drive_status || o.automation.availability) {
        d.value = null;
        return;
      }
      d.value = o.automation.drive_status;
      const E = await so(H);
      A === _ && o.automation.id === H && (d.value = E);
    }
    Ne(() => [o.automation.id, o.automation.drive_status, o.automation.availability], ([H]) => {
      z(H).catch((A) => ot.handleError("other", { message: String(A) }));
    }, { immediate: !0 });
    const U = L(() => ro(b.value, m.value, d.value, o.automation.availability)), O = L(() => U.value.kind === "off"), re = L(() => oo(b.value)), Y = L(() => (h.value.declared.includes("pause") || h.value.declared.includes("resume")) && !re.value), I = L(() => ut(b.value)), F = L(() => Gt(h.value.declared)), K = L(() => {
      if (o.automation.availability) return no(b.value, o.automation.availability)?.text || "";
      const H = Ua(d.value);
      if (H) return H;
      const A = typeof b.value?.last_error == "string" ? b.value.last_error.trim() : "";
      return I.value ? A : "";
    }), G = L(() => io(o.type?.public_state_schema?.fields, b.value)), ie = L(() => {
      const H = o.type?.public_state_schema?.fields;
      return [...Ue(H, b.value, !1), ...Ue(H, b.value, !0)];
    }), x = L(() => {
      const H = b.value, A = [];
      G.value && A.push({ label: "When", value: G.value });
      const E = Ha(d.value);
      H?.next_run_at && !E.some((ce) => ce.label === "Next run") && A.push({ label: "Next run", value: be(H.next_run_at, { future: !0 }) });
      for (const ce of E)
        A.push({ label: ce.label, value: ce.time ? be(ce.value, { future: !0 }) : ce.value });
      return A;
    }), j = L(() => {
      const H = d.value?.drives.flatMap((E) => typeof E.last_round_at == "string" ? [E.last_round_at] : []) || [], A = d.value?.delivery_failures?.last_error?.at;
      return A && H.push(A), H.sort().at(-1) || b.value?.last_run_at;
    }), s = L(() => d.value?.delivery_failures), S = L(() => {
      const H = s.value?.last_error;
      return H ? `${H.code}: ${H.message}` : b.value?.last_error;
    }), D = L(() => ct(o.type)), Q = L(() => qt(o.automation, o.type)), ye = L(() => ({ location: Kt(o.type) }));
    return Ne(() => o.automation.id, () => {
      i.value = "overview";
    }), (H, A) => (l(), u(W, null, [
      c("div", {
        class: "kx-drawer-scrim",
        onClick: A[0] || (A[0] = (E) => n("close"))
      }),
      c("aside", {
        class: "kx-drawer",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": f.value,
        "data-testid": "detail-drawer"
      }, [
        c("header", oi, [
          c("span", ni, [
            P(r(M), {
              icon: g.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          c("div", ri, [
            c("div", {
              class: "kx-drawer-name",
              title: f.value
            }, C(f.value), 9, ai),
            c("div", ii, C(y.value), 1)
          ]),
          P(r(lt), {
            severity: r(ao)(U.value.kind),
            class: "kx-badge kx-tag-sm"
          }, {
            default: B(() => [
              U.value.kind === "live" ? (l(), N(r(M), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : $("", !0),
              ae(" " + C(U.value.label), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          c("div", si, [
            Y.value ? (l(), N(r(Z), {
              key: 0,
              type: "button",
              severity: "secondary",
              outlined: "",
              size: "small",
              "aria-label": `${O.value ? "Resume" : "Pause"} ${f.value}`,
              title: O.value ? "Resume" : "Pause",
              disabled: !!e.automation.deleting_at,
              onClick: A[1] || (A[1] = (E) => !e.automation.deleting_at && n("action", O.value ? "resume" : "pause"))
            }, {
              icon: B(({ class: E }) => [
                P(r(M), {
                  icon: O.value ? "tabler:player-play-filled" : "tabler:player-pause",
                  "aria-hidden": "true",
                  class: V(E)
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["aria-label", "title", "disabled"])) : $("", !0),
            P(Jt, {
              items: v.value,
              name: f.value,
              disabled: !!e.automation.deleting_at,
              onSelect: A[2] || (A[2] = (E) => !e.automation.deleting_at && n("action", E))
            }, null, 8, ["items", "name", "disabled"]),
            P(r(Z), {
              type: "button",
              severity: "secondary",
              text: "",
              size: "small",
              class: "kx-drawer-close",
              "aria-label": "Close details",
              title: "Close",
              onClick: A[3] || (A[3] = (E) => n("close"))
            }, {
              icon: B(({ class: E }) => [
                P(r(M), {
                  icon: "tabler:x",
                  "aria-hidden": "true",
                  class: V(E)
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        c("nav", li, [
          (l(), u(W, null, ne(a, (E) => c("button", {
            key: E.id,
            type: "button",
            role: "tab",
            class: V(["kx-tab", i.value === E.id && "is-active"]),
            "aria-selected": i.value === E.id,
            "data-testid": `drawer-tab-${E.id}`,
            onClick: (ce) => i.value = E.id
          }, [
            P(r(M), {
              icon: E.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ae(" " + C(E.label), 1)
          ], 10, ci)), 64))
        ]),
        c("div", di, [
          i.value === "overview" ? (l(), u("section", ui, [
            K.value ? (l(), u("div", pi, [
              c("div", bi, [
                P(r(M), {
                  icon: "tabler:alert-circle",
                  "aria-hidden": "true"
                }),
                c("span", null, C(o.automation.availability ? "This automation is unavailable" : "This automation is failing"), 1)
              ]),
              c("p", fi, C(K.value), 1),
              F.value ? (l(), N(r(Z), {
                key: 0,
                type: "button",
                size: "small",
                severity: "danger",
                "aria-label": `Recover ${f.value}`,
                "data-testid": "drawer-recover",
                label: "Recover",
                disabled: !!e.automation.deleting_at,
                onClick: A[4] || (A[4] = (E) => !e.automation.deleting_at && n("recover"))
              }, {
                icon: B(({ class: E }) => [
                  P(r(M), {
                    icon: "tabler:rotate-clockwise-2",
                    "aria-hidden": "true",
                    class: V(E)
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["aria-label", "disabled"])) : $("", !0)
            ])) : $("", !0),
            c("div", mi, [
              (l(!0), u(W, null, ne(x.value, (E) => (l(), u("div", {
                key: E.label,
                class: "kx-dfact"
              }, [
                c("span", gi, C(E.label), 1),
                c("strong", vi, C(E.value), 1)
              ]))), 128))
            ]),
            ie.value.length ? (l(), u("div", hi, [
              A[9] || (A[9] = c("div", { class: "kx-dsub-lbl" }, "Progress", -1)),
              c("div", xi, [
                (l(!0), u(W, null, ne(ie.value, (E) => (l(), u("span", {
                  key: E.label,
                  class: "kx-metric"
                }, [
                  E.icon ? (l(), N(r(M), {
                    key: 0,
                    icon: E.icon,
                    class: "kx-metric-i",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : $("", !0),
                  c("span", yi, C(E.label), 1),
                  c("span", {
                    class: "kx-metric-v",
                    title: E.title
                  }, C(E.value), 9, ki)
                ]))), 128))
              ])
            ])) : $("", !0)
          ])) : i.value === "config" ? (l(), u("section", wi, [
            !e.automation.deleting_at && !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (l(), N(Oe, {
              key: 0,
              tag: "wc-execution-identity-editor",
              attrs: { root: e.automation.id },
              onChange: A[5] || (A[5] = (E) => n("changed"))
            }, null, 8, ["attrs"])) : $("", !0),
            D.value && !e.automation.deleting_at ? (l(), N(Oe, {
              key: 1,
              class: "kx-manage-host",
              tag: D.value,
              config: Q.value,
              meta: ye.value,
              onChange: A[6] || (A[6] = (E) => n("changed")),
              onClose: A[7] || (A[7] = (E) => i.value = "overview")
            }, null, 8, ["tag", "config", "meta"])) : (l(), u("div", _i, "This automation type declares no settings view."))
          ])) : (l(), u("section", $i, [
            c("div", Ci, [
              c("div", Si, [
                A[10] || (A[10] = c("span", { class: "kx-dfact-k" }, "Last run", -1)),
                c("strong", zi, C(j.value ? r(be)(j.value, { future: !0 }) : "Never"), 1)
              ]),
              c("div", Pi, [
                A[11] || (A[11] = c("span", { class: "kx-dfact-k" }, "Last outcome", -1)),
                c("strong", Di, C(s.value?.count ? "Failed delivery" : b.value?.status || "—"), 1)
              ]),
              c("div", Ei, [
                A[12] || (A[12] = c("span", { class: "kx-dfact-k" }, "Failed deliveries", -1)),
                c("strong", Ai, C(s.value?.count ?? 0), 1)
              ])
            ]),
            typeof S.value == "string" && S.value.trim() ? (l(), u("div", Ii, [
              A[13] || (A[13] = c("div", { class: "kx-dsub-lbl" }, "Last message", -1)),
              c("p", {
                class: V(["kx-dmsg", I.value || s.value?.count ? "is-err" : "is-ok"])
              }, C(S.value), 3)
            ])) : $("", !0),
            !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (l(), N(Ta, {
              key: 1,
              root: e.automation.id,
              onError: A[8] || (A[8] = (E) => r(ot).handleError("other", { message: E.message }))
            }, null, 8, ["root"])) : $("", !0)
          ]))
        ])
      ], 8, ti)
    ], 64));
  }
});
function ji(e) {
  const t = R(!1), o = R(null), n = R({}), i = R(!1), a = R(!1), f = R(""), g = R(null), y = R(null);
  let b = null;
  const h = R(""), v = L(() => e.types.value.filter(
    (s) => s.installable !== !1 && Object.entries(e.inputPreset.value).every(([S, D]) => {
      const Q = s.inputs?.properties?.[S];
      return !!Q && (!Q.enum || typeof D == "string" && Q.enum.includes(D));
    })
  )), m = L(() => !e.componentMode.value || !e.preferredTypeId.value || o.value?.id !== e.preferredTypeId.value), d = L(() => o.value ? on(o.value).filter(([s]) => !(s in e.inputPreset.value)) : []), _ = L(() => {
    const s = h.value.trim().toLowerCase();
    return s ? v.value.filter(
      (S) => (S.title || "").toLowerCase().includes(s) || (S.name || "").toLowerCase().includes(s) || at(S).toLowerCase().includes(s)
    ) : v.value;
  });
  function z(s) {
    G(), h.value = "", o.value = s || null, n.value = s ? { ...ht(s), ...e.inputPreset.value } : {}, f.value = "", t.value = !0, Je(Y);
  }
  function U(s) {
    G(), o.value = s, n.value = { ...ht(s), ...e.inputPreset.value }, f.value = "", Je(Y);
  }
  function O() {
    G(), t.value = !1, o.value = null, n.value = {}, f.value = "", a.value = !1, e.createMode.value && e.emitHost("close", {});
  }
  function re() {
    !m.value || o.value || Je(() => y.value?.focus({ preventScroll: !0 }));
  }
  async function Y() {
    const s = o.value, S = it(s);
    if (!(!S || !s || !g.value))
      try {
        if (await Xo(S, { timeoutMs: 8e3 }), o.value?.id !== s.id || !g.value) return;
        const D = document.createElement(S);
        D.setAttribute("type-id", s.id), D.setAttribute("input", JSON.stringify(e.inputPreset.value)), e.effectiveParentId.value && D.setAttribute("parent-id", e.effectiveParentId.value), D.setAttribute("embedded", "true"), D.addEventListener("automation-installed", K), D.addEventListener("submit-state", I), g.value.innerHTML = "", g.value.appendChild(D), b = D;
      } catch (D) {
        const Q = Dr(s);
        f.value = `Failed to load setup UI (${S}${Q ? ` at ${Q}` : ""}): ` + (D instanceof Error ? D.message : String(D));
      }
  }
  function I(s) {
    a.value = !!s.detail?.saving;
  }
  function F() {
    it(o.value) ? Er(b) : j();
  }
  async function K(s) {
    const S = s.detail;
    if (S?.success === !1) {
      f.value = S?.error || "Could not create the automation.", a.value = !1;
      return;
    }
    if (e.createMode.value) {
      e.emitHost("created", { id: S?.id });
      return;
    }
    O(), await e.reload();
  }
  function G() {
    b && (b.removeEventListener("automation-installed", K), b.removeEventListener("submit-state", I), b.remove(), b = null), g.value && (g.value.innerHTML = "");
  }
  function ie() {
    const s = e.preferredTypeId.value;
    return s ? v.value.find((S) => S.id === s) : void 0;
  }
  function x() {
    z(ie());
  }
  async function j() {
    const s = o.value;
    if (!s) return;
    const S = nn(s, n.value);
    if (S) {
      f.value = S;
      return;
    }
    i.value = !0, f.value = "";
    try {
      const { data: D } = await pe.post("/api/v1/automations", {
        type: s.id,
        input: rn(s, n.value),
        parent_id: e.effectiveParentId.value || void 0
      });
      if (D?.success) {
        if (e.createMode.value) {
          e.emitHost("created", { id: D.id });
          return;
        }
        O(), await e.reload();
      } else
        f.value = oe({ response: { data: D } }, "install failed");
    } catch (D) {
      f.value = oe(D, "install failed");
    } finally {
      i.value = !1;
    }
  }
  return {
    showTypeCatalog: m,
    installFields: d,
    showInstall: t,
    installType: o,
    installForm: n,
    installing: i,
    customSaving: a,
    installError: f,
    customInstallHost: g,
    installSearchInput: y,
    typeSearch: h,
    filteredTypes: _,
    openInstall: z,
    openPreferredInstall: x,
    chooseType: U,
    closeInstall: O,
    focusInstallDialog: re,
    onCreate: F,
    unmountCustomInstallUi: G
  };
}
function Mi({ automations: e, types: t, query: o, drawerId: n }) {
  const i = L(() => {
    const s = {};
    for (const S of t.value) s[S.id] = S;
    return s;
  }), a = L(() => {
    const s = o.value.trim().toLowerCase();
    return s ? e.value.filter(
      (S) => (S.title || "").toLowerCase().includes(s) || (S.description || "").toLowerCase().includes(s) || (S.type || "").toLowerCase().includes(s)
    ) : e.value;
  });
  function f(s) {
    return s.title || s.id;
  }
  function g(s) {
    return s.type ? i.value[s.type] : void 0;
  }
  function y(s) {
    return s.icon ? s.icon : g(s)?.icon || "tabler:bolt";
  }
  function b(s) {
    return Yt(g(s));
  }
  function h(s, S) {
    return b(s).has(S);
  }
  function v(s) {
    return Wt(b(s));
  }
  function m(s) {
    return Xt(Zt(g(s)));
  }
  function d(s) {
    return Gt(b(s));
  }
  function _(s) {
    return ct(g(s));
  }
  function z(s) {
    return Kt(g(s));
  }
  function U(s) {
    return s ? qt(s, g(s)) : {};
  }
  function O(s) {
    return s.public_state;
  }
  function re(s) {
    return Ue(g(s)?.public_state_schema?.fields, O(s), !1);
  }
  function Y(s) {
    return Ue(g(s)?.public_state_schema?.fields, O(s), !0);
  }
  function I(s) {
    return oo(O(s));
  }
  function F(s) {
    return no(O(s), s.availability);
  }
  function K(s) {
    return ro(O(s), h(s, "status"), s.drive_status, s.availability);
  }
  function G(s) {
    return K(s).kind === "off";
  }
  function ie(s) {
    return io(g(s)?.public_state_schema?.fields, O(s));
  }
  const x = L(() => e.value.find((s) => s.id === n.value) || null), j = L(() => x.value ? g(x.value) : void 0);
  return {
    typeById: i,
    filtered: a,
    pretty: f,
    typeFor: g,
    iconFor: y,
    declaredActions: b,
    hasAction: h,
    runNowFor: v,
    actionItemsFor: m,
    recoverFor: d,
    manageTag: _,
    manageLocation: z,
    manageConfig: U,
    statusFor: O,
    metrics: re,
    detailMetrics: Y,
    isTerminal: I,
    rowMessage: F,
    statusOf: K,
    isPaused: G,
    subtitleLine: ie,
    drawerAutomation: x,
    drawerType: j
  };
}
function Ri(e, t) {
  const o = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  let i = 0;
  const a = /* @__PURE__ */ new Map();
  function f(v, m) {
    const d = m.meta, _ = e.value.find((z) => z.id === v);
    _ && (_.public_state = { ..._.public_state || {}, ...d }, typeof d.title == "string" && (_.title = d.title), typeof d.comment == "string" && (_.description = d.comment), g(v).catch((z) => ot.handleError("other", { message: String(z) })));
  }
  async function g(v) {
    if (!e.value.some((z) => z.id === v && z.drive_status)) return;
    const m = Symbol(v);
    a.set(v, m);
    const d = await so(v);
    if (a.get(v) !== m) return;
    a.delete(v);
    const _ = e.value.find((z) => z.id === v);
    _ && (_.drive_status = d);
  }
  function y(v) {
    const m = {};
    for (const d of t(v)?.public_state_schema?.fields || [])
      d?.key && d.type && (m[d.key] = d.type);
    return m;
  }
  function b() {
    i++, n.clear(), a.clear();
    for (const v of o.values()) v();
    o.clear();
  }
  function h() {
    const v = new Set(e.value.map((d) => d.id).filter(Boolean));
    for (const [d, _] of o)
      v.has(d) || (_(), o.delete(d), a.delete(d));
    const m = i;
    for (const d of v) {
      if (o.has(d) || n.has(d)) continue;
      n.add(d);
      const _ = e.value.find((U) => U.id === d), z = Fn(d, (U) => f(d, U), _ ? y(_) : void 0);
      if (n.delete(d), !!z) {
        if (m !== i || !e.value.some((U) => U.id === d)) {
          z();
          continue;
        }
        o.set(d, z);
      }
    }
  }
  return { syncRealtimeSubscriptions: h, clearRealtimeSubscriptions: b, refreshDriveStatus: g };
}
function Ti() {
  let e = 0;
  return () => {
    const t = ++e;
    return () => t === e;
  };
}
function Oi({ automations: e, types: t, loading: o, error: n, parentId: i, syncRealtimeSubscriptions: a }) {
  async function f() {
    try {
      const { data: h } = await pe.get("/api/v1/automations/types");
      t.value = h?.success ? h.types || [] : [];
    } catch {
      t.value = [];
    }
  }
  const g = Ti();
  async function y() {
    const h = g();
    o.value = !0, n.value = "";
    try {
      const { data: v } = await pe.get("/api/v1/automations", { params: { class: "automation", parent_id: i() } });
      if (!v?.success) throw new Error(oe(v?.error, "failed to load automations"));
      if (!h()) return;
      e.value = v.automations || [], a();
    } catch (v) {
      if (!h()) return;
      a(), n.value = oe(v, "failed to load automations");
    } finally {
      h() && (o.value = !1);
    }
  }
  async function b() {
    await f(), await y();
  }
  return { fetchTypes: f, fetchAutomations: y, reload: b };
}
function Bi(e, t, o) {
  async function n(i) {
    e.value = i.id, t.value = "";
    try {
      const { data: a } = await pe.get(`/api/v1/automations/${encodeURIComponent(i.id)}/export`);
      if (!a?.success || !a.artifact)
        throw new Error(a?.error?.message || a?.error || "Automation export failed.");
      const f = o(i).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "automation", g = new Blob([`${JSON.stringify(a.artifact, null, 2)}
`], { type: "application/json" }), y = URL.createObjectURL(g), b = document.createElement("a");
      b.href = y, b.download = `${f}.automation.json`, document.body.appendChild(b), b.click(), b.remove(), URL.revokeObjectURL(y);
    } catch (a) {
      t.value = oe(a, "Automation export failed.");
    } finally {
      e.value = "";
    }
  }
  return { exportAutomation: n };
}
const Fi = { class: "kx" }, Ni = {
  key: 0,
  class: "kx-head"
}, Ui = { class: "kx-head-icon" }, Hi = { class: "kx-head-actions" }, Vi = { class: "kx-count" }, Ki = { class: "kx-search" }, qi = {
  key: 1,
  class: "kx-err"
}, Wi = {
  key: 2,
  class: "kx-body"
}, Yi = {
  key: 0,
  class: "kx-loading"
}, Zi = {
  key: 1,
  class: "kx-empty"
}, Gi = { class: "kx-empty-ico" }, Xi = {
  key: 2,
  class: "kx-empty"
}, Ji = {
  key: 3,
  class: "kx-list"
}, Qi = ["aria-label", "onClick", "disabled"], es = { class: "kx-ficon" }, ts = { class: "kx-id" }, os = ["title"], ns = { class: "kx-sub" }, rs = { key: 0 }, as = { key: 1 }, is = { key: 2 }, ss = { class: "kx-actions" }, ls = {
  key: 0,
  class: "kx-rowfoot"
}, cs = ["title"], ds = { class: "kx-modal-head-icon" }, us = { class: "kx-modal-head-text" }, ps = { class: "kx-modal-head-title" }, bs = { class: "kx-modal-head-sub" }, fs = { class: "kx-modal-body" }, ms = { class: "kx-modal-head-icon" }, gs = { class: "kx-modal-head-text" }, vs = { class: "kx-modal-head-title" }, hs = { class: "kx-modal-head-sub" }, xs = { class: "kx-modal-body" }, ys = { class: "kx-modal-body" }, ks = {
  key: 0,
  class: "kx-delopts"
}, ws = ["onUpdate:modelValue"], _s = { class: "kx-delopt-copy" }, $s = { class: "kx-delopt-t" }, Cs = {
  key: 0,
  class: "kx-delopt-d"
}, Ss = /* @__PURE__ */ fe({
  __name: "automations",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, o = R([]), n = R([]), i = R(!1), a = R(""), f = R(""), g = R(""), y = /* @__PURE__ */ new Map(), b = R(""), h = R(""), v = Mi({ automations: o, types: n, query: f, drawerId: h }), {
      filtered: m,
      pretty: d,
      typeFor: _,
      iconFor: z,
      hasAction: U,
      actionItemsFor: O,
      recoverFor: re,
      manageTag: Y,
      manageLocation: I,
      manageConfig: F,
      metrics: K,
      detailMetrics: G,
      isTerminal: ie,
      rowMessage: x,
      statusOf: j,
      isPaused: s,
      subtitleLine: S,
      drawerAutomation: D,
      drawerType: Q
    } = v, ye = Ri(o, _), { syncRealtimeSubscriptions: H, clearRealtimeSubscriptions: A, refreshDriveStatus: E } = ye, ce = Bi(b, a, d), { exportAutomation: lo } = ce, me = zo(), co = Po(), ke = L(() => me.value?.mode === "create"), Ve = L(() => me.value?.mode === "component"), uo = an(me), pt = L(() => String(me.value?.componentId || "").trim()), po = L(() => String(me.value?.typeId || "").trim()), bo = L(() => pt.value || uo.value), fo = Oi({
      automations: o,
      types: n,
      loading: i,
      error: a,
      parentId: () => pt.value || void 0,
      syncRealtimeSubscriptions: H
    }), { fetchAutomations: ge, reload: Ke } = fo, we = ji({
      types: n,
      createMode: ke,
      componentMode: Ve,
      effectiveParentId: bo,
      preferredTypeId: po,
      inputPreset: L(() => sn(me.value?.input)),
      emitHost: (k, w) => co(k, w),
      reload: () => Ke()
    }), se = R(null), Re = R({}), _e = R(!1), ee = R(null), de = R(null);
    function mo(k) {
      de.value = k;
    }
    function bt() {
      de.value = null;
    }
    function go(k) {
      const w = k?.id || "";
      return {
        resource_id: w,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(w)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(w)}`,
        title: k ? d(k) : ""
      };
    }
    function ft(k, w) {
      if (!k.deleting_at)
        switch (w) {
          case "reconfigure":
            $o(k);
            break;
          case "share":
            mo(k);
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
    function mt(k) {
      if (k.deleting_at) return;
      const w = re(k);
      w && qe(k, w);
    }
    function vo(k) {
      h.value = k.id, ge();
    }
    function ho() {
      h.value = "";
    }
    function xo(k) {
      const w = D.value;
      w && ft(w, k);
    }
    function yo() {
      const k = D.value;
      k && mt(k);
    }
    async function qe(k, w) {
      if (k.deleting_at || g.value) return;
      g.value = k.id, a.value = "";
      const p = _(k)?.controls?.some((te) => te.name === w) === !0, q = `${k.id}:${w}`, gt = p ? y.get(q) || crypto.randomUUID() : "";
      p && y.set(q, gt);
      try {
        const { data: te } = await pe.post(
          `/api/v1/automations/${k.id}/actions/${w}`,
          p ? { request_id: gt } : {}
        );
        if (!te?.success) {
          a.value = oe({ response: { data: te } }, `${w} failed`);
          return;
        }
        if (p && te.result?.state === "succeeded" && y.delete(q), te.result && typeof te.result == "object") {
          const { success: Ge, ...So } = te.result;
          k.public_state = { ...k.public_state || {}, ...So };
        }
        if (k.drive_status?.drives?.length)
          await E(k.id);
        else if (w === "pause" || w === "resume") {
          const Ge = typeof te.result?.paused == "boolean" ? te.result.paused : w === "pause";
          k.public_state = {
            ...k.public_state || {},
            enabled: !Ge,
            status: te.result?.status || (Ge ? "paused" : "active")
          };
        }
      } catch (te) {
        a.value = oe(te, `${w} failed`);
      } finally {
        g.value = "";
      }
    }
    async function ko(k) {
      await qe(k, s(k) ? "resume" : "pause");
    }
    function We(k) {
      se.value = k;
      const w = _(k), p = {};
      for (const q of w?.delete_options || []) p[q.key] = !!q.default;
      Re.value = p;
    }
    function Ye(k) {
      return k ? _(k)?.delete_options || [] : [];
    }
    function wo(k) {
      ee.value = null, We(k);
    }
    async function _o() {
      const k = se.value;
      if (k) {
        _e.value = !0, a.value = "";
        try {
          const p = Ye(k).length ? { options: { ...Re.value } } : {}, { data: q } = await pe.delete(`/api/v1/automations/${k.id}`, { data: p });
          q?.success ? (Co(k.id, q), se.value = null, await ge()) : a.value = oe({ response: { data: q } }, "failed to delete automation");
        } catch (w) {
          a.value = oe(w, "failed to delete automation");
        } finally {
          _e.value = !1;
        }
      }
    }
    function $o(k) {
      Y(k) && (ee.value = k);
    }
    async function Ze(k = !0) {
      ee.value = null, k && await Ke();
    }
    Do(async () => {
      try {
        await Ke(), ke.value && we.openPreferredInstall();
      } catch (k) {
        a.value = oe(k, "host API unavailable");
      }
    }), st(() => {
      we.unmountCustomInstallUi(), A();
    });
    const { acceptDeletion: Co } = Nn(o, (k) => k.id, void 0, ge);
    return (k, w) => (l(), u("div", Fi, [
      ke.value ? $("", !0) : (l(), u("header", Ni, [
        Ve.value ? $("", !0) : (l(), u(W, { key: 0 }, [
          c("div", Ui, [
            P(r(M), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          w[10] || (w[10] = c("div", { class: "kx-head-text" }, [
            c("h1", { class: "kx-head-title" }, "Automations"),
            c("p", { class: "kx-head-sub" }, "Scheduled and event-driven jobs that run on their own.")
          ], -1))
        ], 64)),
        c("div", Hi, [
          c("span", Vi, C(o.value.length) + " automation" + C(o.value.length !== 1 ? "s" : ""), 1),
          c("div", Ki, [
            P(r(M), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            ue(c("input", {
              "onUpdate:modelValue": w[0] || (w[0] = (p) => f.value = p),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search automations…"
            }, null, 512), [
              [tt, f.value]
            ])
          ]),
          P(r(Z), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: w[1] || (w[1] = (p) => r(we).openPreferredInstall())
          }, {
            icon: B(({ class: p }) => [
              P(r(M), {
                icon: "tabler:plus",
                class: V(p),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ])),
      !ke.value && a.value ? (l(), u("div", qi, C(a.value), 1)) : $("", !0),
      ke.value ? $("", !0) : (l(), u("div", Wi, [
        i.value && !o.value.length ? (l(), u("div", Yi, [
          P(r(M), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          w[11] || (w[11] = ae(" Loading… ", -1))
        ])) : o.value.length ? r(m).length ? (l(), u("div", Ji, [
          (l(!0), u(W, null, ne(r(m), (p) => (l(), u("div", {
            key: p.id,
            class: V(["kx-row", h.value === p.id && "is-open"])
          }, [
            c("button", {
              type: "button",
              class: "kx-open",
              "aria-label": `Open ${r(d)(p)} details`,
              onClick: (q) => !p.deleting_at && vo(p),
              disabled: !!p.deleting_at
            }, [
              c("span", es, [
                P(r(M), {
                  icon: r(z)(p),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              c("span", ts, [
                c("span", {
                  class: "kx-name",
                  title: r(d)(p)
                }, C(r(d)(p)), 9, os),
                c("span", ns, [
                  c("span", null, C(r(_)(p)?.title || "Automation"), 1),
                  r(S)(p) ? (l(), u("span", rs, " · " + C(r(S)(p)), 1)) : $("", !0),
                  r(Se)(p.drive_status).last ? (l(), u("span", as, " · last ran " + C(r(be)(r(Se)(p.drive_status).last, { future: !0 })), 1)) : $("", !0),
                  r(Se)(p.drive_status).next ? (l(), u("span", is, " · next " + C(r(be)(r(Se)(p.drive_status).next, { future: !0 })), 1)) : $("", !0)
                ])
              ])
            ], 8, Qi),
            P(r(lt), {
              severity: r(ao)(r(j)(p).kind),
              class: "kx-badge kx-tag-sm"
            }, {
              default: B(() => [
                r(j)(p).kind === "live" ? (l(), N(r(M), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : $("", !0),
                ae(" " + C(r(j)(p).label), 1)
              ]),
              _: 2
            }, 1032, ["severity"]),
            c("div", ss, [
              (r(U)(p, "pause") || r(U)(p, "resume")) && !r(ie)(p) ? (l(), N(r(Z), {
                key: 0,
                type: "button",
                severity: "secondary",
                outlined: "",
                size: "small",
                disabled: !!p.deleting_at || g.value === p.id,
                "aria-label": `${r(s)(p) ? "Resume" : "Pause"} ${r(d)(p)}`,
                title: r(s)(p) ? "Resume" : "Pause",
                onClick: (q) => ko(p)
              }, {
                icon: B(({ class: q }) => [
                  P(r(M), {
                    icon: r(s)(p) ? "tabler:player-play-filled" : "tabler:player-pause",
                    "aria-hidden": "true",
                    class: V(q)
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["disabled", "aria-label", "title", "onClick"])) : $("", !0),
              P(Jt, {
                items: r(O)(p),
                name: r(d)(p),
                busy: !!p.deleting_at || g.value === p.id,
                onSelect: (q) => ft(p, q)
              }, null, 8, ["items", "name", "busy", "onSelect"])
            ]),
            p.deleting_at || r(x)(p) || r(G)(p).length || r(K)(p).length ? (l(), u("div", ls, [
              P(Mn, {
                state: p,
                onRetry: (q) => We(p)
              }, null, 8, ["state", "onRetry"]),
              r(x)(p) ? (l(), u("div", {
                key: 0,
                class: V(["kx-rowmsg", `kx-rowmsg-${r(x)(p)?.tone}`])
              }, [
                P(r(M), {
                  icon: r(x)(p)?.tone === "error" ? "tabler:alert-circle" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                c("span", {
                  class: "kx-rowmsg-txt",
                  title: r(x)(p)?.text
                }, C(r(x)(p)?.text), 9, cs),
                r(x)(p)?.tone === "error" && r(re)(p) ? (l(), N(r(Z), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  text: "",
                  size: "small",
                  class: "kx-recover",
                  "data-testid": "row-recover",
                  "aria-label": `Recover ${r(d)(p)}`,
                  disabled: !!p.deleting_at || g.value === p.id,
                  label: "Recover",
                  onClick: (q) => mt(p)
                }, {
                  icon: B(({ class: q }) => [
                    P(r(M), {
                      icon: "tabler:rotate-clockwise-2",
                      "aria-hidden": "true",
                      class: V(q)
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])) : $("", !0)
              ], 2)) : $("", !0),
              P(ua, {
                face: r(K)(p),
                detail: r(G)(p)
              }, null, 8, ["face", "detail"])
            ])) : $("", !0)
          ], 2))), 128))
        ])) : (l(), u("div", Xi, [...w[14] || (w[14] = [
          c("div", { class: "kx-empty-title" }, "No matches", -1),
          c("div", { class: "kx-empty-sub" }, "No automations match the current search.", -1)
        ])])) : (l(), u("div", Zi, [
          c("div", Gi, [
            P(r(M), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          w[12] || (w[12] = c("div", { class: "kx-empty-title" }, "No automations yet", -1)),
          w[13] || (w[13] = c("div", { class: "kx-empty-sub" }, "Choose an automation type to get started.", -1)),
          P(r(Z), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: w[2] || (w[2] = (p) => r(we).openPreferredInstall())
          }, {
            icon: B(({ class: p }) => [
              P(r(M), {
                icon: "tabler:plus",
                class: V(p),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ])),
      r(D) ? (l(), N(Li, {
        key: 3,
        automation: r(D),
        type: r(Q),
        onClose: ho,
        onAction: xo,
        onRecover: yo,
        onChanged: r(ge)
      }, null, 8, ["automation", "type", "onChanged"])) : $("", !0),
      P(na, {
        flow: r(we),
        "component-mode": Ve.value,
        "dialog-pt": t
      }, null, 8, ["flow", "component-mode"]),
      ee.value ? (l(), N(r(ze), {
        key: 4,
        visible: !!ee.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal kx-modal-manage",
        "aria-label": r(d)(ee.value),
        "onUpdate:visible": w[6] || (w[6] = (p) => {
          p || Ze(!1);
        })
      }, {
        header: B(() => [
          c("span", ds, [
            P(r(M), {
              icon: r(z)(ee.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          c("span", us, [
            c("span", ps, C(r(d)(ee.value)), 1),
            c("span", bs, C(r(_)(ee.value)?.title || "Automation"), 1)
          ])
        ]),
        footer: B(() => [
          P(r(Z), {
            type: "button",
            class: "kx-foot-delete",
            severity: "danger",
            outlined: "",
            label: "Delete",
            onClick: w[5] || (w[5] = (p) => wo(ee.value))
          }, {
            icon: B(({ class: p }) => [
              P(r(M), {
                icon: "tabler:trash",
                "aria-hidden": "true",
                class: V(p)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]),
        default: B(() => [
          c("div", fs, [
            P(Oe, {
              class: "kx-manage-host",
              tag: r(Y)(ee.value),
              config: r(F)(ee.value),
              meta: { location: r(I)(ee.value) },
              onCreated: w[3] || (w[3] = (p) => Ze(!0)),
              onClose: w[4] || (w[4] = (p) => Ze(!0)),
              onChange: r(ge)
            }, null, 8, ["tag", "config", "meta", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : $("", !0),
      de.value ? (l(), N(r(ze), {
        key: 5,
        visible: !!de.value,
        modal: "",
        pt: t,
        class: "kx-modal",
        "aria-label": `Share ${r(d)(de.value)}`,
        "onUpdate:visible": w[7] || (w[7] = (p) => {
          p || bt();
        })
      }, {
        header: B(() => [
          c("span", ms, [
            P(r(M), {
              icon: "tabler:users",
              "aria-hidden": "true"
            })
          ]),
          c("span", gs, [
            c("span", vs, "Share " + C(r(d)(de.value)), 1),
            c("span", hs, C(r(_)(de.value)?.title || "Automation"), 1)
          ])
        ]),
        default: B(() => [
          c("div", xs, [
            P(Oe, {
              class: "kx-manage-host",
              tag: "kickside-share",
              config: go(de.value),
              onClose: bt,
              onChange: r(ge)
            }, null, 8, ["config", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : $("", !0),
      se.value ? (l(), N(r(ze), {
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
        footer: B(() => [
          P(r(Z), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: _e.value,
            onClick: w[8] || (w[8] = (p) => se.value = null)
          }, null, 8, ["disabled"]),
          P(r(Z), {
            type: "button",
            "data-testid": "automations-confirm-delete",
            severity: "danger",
            label: "Delete",
            loading: _e.value,
            disabled: _e.value,
            onClick: _o
          }, {
            icon: B(({ class: p }) => [
              P(r(M), {
                icon: "tabler:trash",
                class: V(p),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: B(() => [
          c("div", ys, [
            c("p", null, [
              w[15] || (w[15] = ae(" Delete ", -1)),
              c("strong", null, C(r(d)(se.value)), 1),
              w[16] || (w[16] = ae("? It will stop running and its setup will be removed. This can't be undone. ", -1))
            ]),
            Ye(se.value).length ? (l(), u("div", ks, [
              (l(!0), u(W, null, ne(Ye(se.value), (p) => (l(), u("label", {
                key: p.key,
                class: "kx-delopt"
              }, [
                ue(c("input", {
                  "onUpdate:modelValue": (q) => Re.value[p.key] = q,
                  type: "checkbox"
                }, null, 8, ws), [
                  [jt, Re.value[p.key]]
                ]),
                c("span", _s, [
                  c("span", $s, C(p.title || p.key), 1),
                  p.description ? (l(), u("span", Cs, C(p.description), 1)) : $("", !0)
                ])
              ]))), 128))
            ])) : $("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"])) : $("", !0)
    ]));
  }
}), zs = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.component-deletion{display:inline-flex;align-items:center;gap:.5rem;color:var(--p-text-muted-color)}.component-deletion-spinner{width:1rem;height:1rem;margin:0}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-modal-head-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-modal-head-icon svg{width:20px;height:20px}.kx-modal-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-modal-head-title{font-size:15.5px;font-weight:700;color:var(--p-text-color);line-height:1.2}.kx-modal-head-sub{font-size:12.5px;font-weight:400;color:var(--p-text-muted-color);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}.kx-wcmount{display:block;width:100%;min-width:0;max-width:100%;overflow-x:clip;--p-border-radius: var(--wf-radius-sm, 8px);--p-content-border-radius: var(--wf-radius-sm, 8px)}.kx-wcmount .kx-wcmount-surface{display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;color:inherit}.kx-wcmount-fail{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--p-danger-600, var(--p-danger-500));padding:9px 10px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);border-radius:10px;background:color-mix(in srgb,var(--p-danger-500) 7%,transparent)}.kx-wcmount-fail>span{min-width:0;flex:1}.kx-wcmount-fail button{border:1px solid currentColor;border-radius:8px;padding:5px 9px;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}.anchored-panel{position:fixed;min-width:0;overflow:auto}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{--kx-modal-shadow: var(--kx-shadow-lg);display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.kx-head-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-count{font-size:12.5px;color:var(--p-text-muted-color);display:inline-flex;align-items:center;gap:5px}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{height:34px;width:220px;max-width:40vw;padding:0 10px 0 30px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.kx-body{flex:1 0 auto;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-list{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden;background:var(--p-content-background);max-width:1100px}.kx-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"main status actions" "foot foot   foot";align-items:center;column-gap:14px;row-gap:6px;padding:10px 14px;border-bottom:1px solid var(--p-content-border-color)}.kx-row:last-child{border-bottom:none}.kx-row.is-open{background:var(--kx-wash-primary)}.kx-row:hover{background:var(--kx-overlay-subtle)}.kx-row.is-open:hover{background:var(--kx-wash-primary)}.kx-open{grid-area:main;display:flex;align-items:center;gap:12px;min-width:0;padding:0;margin:0;border:none;background:transparent;text-align:left;font:inherit;color:inherit;cursor:pointer}.kx-ficon{width:38px;height:38px;flex:none;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--kx-wash-primary);color:var(--p-primary-color)}.kx-ficon svg{width:20px;height:20px}.kx-id{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}.kx-name{display:block;font-size:14px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-sub{display:block;font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-open:focus-visible{outline:none}.kx-open:focus-visible .kx-name{text-decoration:underline;text-underline-offset:2px;text-decoration-color:var(--p-primary-color)}.kx-rowfoot{grid-area:foot;padding-left:50px;display:flex;flex-direction:column;gap:4px;min-width:0}.kx-rowfoot:empty{display:none}.kx-rowmsg{font-size:11.5px;display:flex;align-items:center;gap:5px;min-width:0}.kx-rowmsg-txt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-rowmsg svg{width:13px;height:13px;flex:none}.kx-rowmsg-error{color:var(--p-danger-600, var(--p-danger-500))}.kx-rowmsg-success{color:var(--p-success-600, var(--p-success-500))}.kx-recover{flex:none;margin-left:2px}.kx-badge{grid-area:status;border:1px solid color-mix(in srgb,currentColor 28%,transparent)}.kx-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}.kx-badge:has(svg):before{display:none}.kx-actions{grid-area:actions;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;min-width:0}.kx-actions .is-active{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 38%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-admin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}.kx-admin-item{min-width:0;padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:10px;background:var(--p-content-background)}.kx-admin-item>span{display:block;margin-bottom:4px;color:var(--p-text-muted-color);font-size:10.5px;font-weight:700;letter-spacing:.055em;text-transform:uppercase}.kx-admin-item strong{display:block;overflow:hidden;color:var(--p-text-color);font-size:12.5px;text-overflow:ellipsis;white-space:nowrap}.kx-admin-item strong em{color:var(--p-text-muted-color);font-size:11px;font-style:normal;font-weight:600}.kx-admin-item code{display:block;margin-top:4px;overflow:hidden;color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;text-overflow:ellipsis;white-space:nowrap}.kx-admin-item a{display:inline-block;margin-top:4px;color:var(--p-primary-color);font-size:11px;font-weight:650;text-decoration:none}.kx-admin-item a:hover{text-decoration:underline}@media(max-width:560px){.kx-row{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"main   actions" "status status" "foot   foot";align-items:center;row-gap:8px}.kx-badge{justify-self:start}.kx-rowfoot{padding-left:0}}@media(max-width:640px){.kx-admin-grid{grid-template-columns:1fr}}.kx-modal{--p-dialog-content-padding: 0;max-width:calc(100vw - 32px);max-height:90vh}.kx-modal>.kx-dialog-header{padding:16px 18px;border-bottom:1px solid var(--p-content-border-color);gap:10px}.kx-modal>.kx-dialog-content{padding:0;display:flex;flex-direction:column;min-height:0;overflow:hidden}.kx-modal>.kx-dialog-footer{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.kx-2p-r-body>*{animation:kx-pane-fade .28s ease both}@keyframes kx-pane-fade{0%{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){.kx-2p-r-body>*{animation:none}}.kx-modal-body{padding:18px;font-size:13.5px;line-height:1.5;color:var(--p-text-color);overflow-y:auto}.kx-modal-body p{margin:0 0 10px}.kx-modal-body p:last-child{margin-bottom:0}.kx-form{display:flex;flex-direction:column;gap:14px}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-req{color:var(--p-danger-500)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-select{width:100%;min-width:0}.kx-check,.kx-delopt input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-check:before,.kx-delopt input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-check:checked,.kx-delopt input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-check:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset)}.kx-check:checked:before,.kx-delopt input:checked:before{transform:rotate(45deg) scale(1)}.kx-check:disabled,.kx-delopt input:disabled{opacity:.55;cursor:not-allowed}.kx-field-hint{font-size:11px;line-height:1.3;color:var(--p-text-muted-color);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.kx-custom-host{min-height:180px;width:100%}.kx-custom-host>*{display:block;width:100%}.kx-delopts{display:flex;flex-direction:column;gap:10px;margin-top:14px}.kx-delopt{display:flex;align-items:flex-start;gap:10px;cursor:pointer}.kx-delopt input{margin-top:2px}.kx-delopt-copy{min-width:0;display:flex;flex-direction:column;gap:2px}.kx-delopt-t{display:block;font-size:13px;font-weight:600;color:var(--p-text-color)}.kx-delopt-d{display:block;font-size:11.5px;line-height:1.35;color:var(--p-text-muted-color)}.kx-modal-2p{width:min(880px,calc(100vw - 40px));max-width:100%}.kx-modal-solo{width:min(620px,calc(100vw - 40px));max-width:100%}.kx-modal-manage{width:min(760px,calc(100vw - 40px));max-width:100%}.kx-manage-host{display:block;min-height:180px}.kx-2p{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);min-height:0;flex:1;overflow:hidden}.kx-2p-solo{grid-template-columns:minmax(0,1fr)}.kx-2p-solo .kx-2p-r-body{padding-top:16px}.kx-2p-l{padding:16px;overflow-y:auto;border-right:1px solid var(--p-content-border-color);display:flex;flex-direction:column;gap:10px}.kx-2p-r{display:flex;flex-direction:column;min-width:0;min-height:0;background:color-mix(in srgb,var(--p-text-color) 2.5%,var(--p-content-background))}.kx-2p-r-head{padding:14px 18px 10px;font-size:12.5px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-2p-r-body{padding:0 18px 18px;overflow-y:auto;flex:1;min-height:0}.kx-2p-r-note{margin:0;font-size:12.5px;color:var(--p-text-muted-color)}.kx-foot-err{order:-1;flex:1 0 100%;margin:0;max-width:none}.kx-foot-err+.p-button{margin-left:auto}.kx-foot-delete{margin-right:auto}.kx-cat-search{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;flex:none;border:1px solid var(--p-content-border-color);border-radius:8px;color:var(--p-text-muted-color)}.kx-cat-search svg{width:15px;height:15px;flex:none}.kx-cat-search input{flex:1;border:none;background:transparent;outline:none;font:inherit;font-size:13px;color:var(--p-text-color)}.kx-cat{display:flex;flex-direction:column;gap:6px}.kx-cat-card{display:flex;align-items:center;gap:11px;text-align:left;width:100%;padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:14px;background:transparent;color:var(--p-text-color);cursor:pointer;transition:border-color .14s,background .14s}.kx-cat-card:hover{background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.kx-cat-card.sel{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 9%,transparent)}.kx-cat-ico{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.kx-cat-ico svg{width:18px;height:18px}.kx-cat-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-cat-name{font-size:13px;font-weight:600}.kx-cat-desc{font-size:11px;line-height:1.3;color:var(--p-text-muted-color);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.kx-cat-check{width:17px;height:17px;flex:none;color:var(--p-primary-color);visibility:hidden}.kx-cat-card.sel .kx-cat-check{visibility:visible}.kx-cat-empty{font-size:12.5px;color:var(--p-text-muted-color);padding:4px 2px}@media(max-width:760px){.kx-modal-2p{width:560px}.kx-2p{grid-template-columns:1fr}.kx-2p-l{border-right:none;border-bottom:1px solid var(--p-content-border-color)}}.kx-flow{display:flex;flex-direction:column;gap:14px;padding:6px 0 0}.kx-pipe,.kx-stage{display:flex;flex-direction:column;gap:8px}.kx-stage-mid{background:transparent}.kx-stage-head{display:flex;align-items:center;gap:8px}.kx-stage-ico{width:26px;height:26px;border-radius:11px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-stage-ico svg{width:15px;height:15px}.kx-stage-lbl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-stage-cfg{margin-top:2px}.kx-stage-badges{display:flex;flex-wrap:wrap;gap:6px}.kx-stage-desc{margin:0;font-size:12px;line-height:1.4;color:var(--p-text-muted-color)}.kx-stage-opts{display:flex;flex-direction:column;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-opts-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-pipe-conn{display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 0;color:var(--p-text-muted-color);font-size:11px}.kx-pipe-conn svg{width:16px;height:16px}.kx-runopts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.kx-detect{display:flex;align-items:center;gap:6px;font-size:11.5px;line-height:1.35;padding:7px 9px;border-radius:8px;color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 10%,transparent)}.kx-detect svg{width:14px;height:14px;flex:none}.kx-detect-warn{color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-flow-enable{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--p-text-muted-color);cursor:pointer}.kx-flow-enable input{width:16px;height:16px;accent-color:var(--p-primary-color)}.kx-textarea{height:auto;min-height:72px;padding:8px 10px;line-height:1.4;resize:vertical}.kx-wcmount{width:100%}.kx-wcmount>div{display:block;width:100%}.kx-metrics{display:flex;flex-wrap:wrap;gap:5px 6px;margin-top:5px;min-width:0}.kx-metric{display:inline-flex;align-items:center;gap:5px;max-width:100%;font-size:11.5px;line-height:1.6;padding:2px 9px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 6%,transparent);color:var(--p-text-color)}.kx-metric-i{width:13px;height:13px;color:var(--p-text-muted-color);flex:none}.kx-metric-k{color:var(--p-text-muted-color);font-weight:600;flex:none}.kx-metric-v{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-metric-details{margin-top:5px}.kx-metric-more{display:inline-flex;align-items:center;gap:4px;cursor:pointer;list-style:none;font-size:11.5px;font-weight:600;color:var(--p-text-muted-color);user-select:none}.kx-metric-more::-webkit-details-marker{display:none}.kx-metric-more:before{content:"";width:0;height:0;border-left:4px solid currentColor;border-top:3px solid transparent;border-bottom:3px solid transparent;transition:transform .15s;flex:none}.kx-metric-details[open] .kx-metric-more:before{transform:rotate(90deg)}.kx-metric-more:hover{color:var(--p-text-color)}.kx-metrics-detail{margin-top:4px}@media(prefers-reduced-motion:reduce){.kx-modal{transition:none}}.kx-cat-search:focus-within{border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-cat-search input:focus{box-shadow:none}.kx-cat-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-menu{position:relative;display:inline-flex}.kx-menu-trigger.is-active{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 38%,var(--p-content-border-color));background:var(--kx-wash-primary)}.kx-menu-panel{display:flex;flex-direction:column;gap:1px;padding:6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);background:var(--p-content-background);box-shadow:var(--kx-shadow-lg);max-height:min(70vh,460px);overflow-y:auto}.kx-menu-group{padding:8px 10px 4px;font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-menu-group.is-first{padding-top:4px}.kx-menu-sep{height:1px;margin:5px 6px;background:var(--p-content-border-color)}.kx-menu-item{display:flex;align-items:flex-start;gap:10px;width:100%;padding:8px 10px;text-align:left;border:none;border-radius:var(--kx-radius-10);background:transparent;color:var(--p-text-color);cursor:pointer;transition:background .12s}.kx-menu-item:hover,.kx-menu-item:focus-visible{background:var(--kx-overlay-hover);outline:none}.kx-menu-item:disabled{opacity:.5;cursor:not-allowed}.kx-menu-item-ico{width:17px;height:17px;flex:none;margin-top:1px;color:var(--p-text-muted-color)}.kx-menu-item-body{display:flex;flex-direction:column;gap:1px;min-width:0}.kx-menu-item-label{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600}.kx-menu-item-desc{font-size:11px;line-height:1.35;color:var(--p-text-muted-color)}.kx-menu-item-warn{width:12px;height:12px;color:var(--p-warn-600, var(--p-warn-500))}.kx-menu-item.is-warn .kx-menu-item-ico{color:var(--p-warn-600, var(--p-warn-500))}.kx-menu-item.is-danger .kx-menu-item-ico{color:var(--p-danger-600, var(--p-danger-500))}.kx-menu-item.is-danger:hover,.kx-menu-item.is-danger:focus-visible{background:var(--kx-wash-danger)}.kx-menu-item.is-danger .kx-menu-item-label{color:var(--p-danger-600, var(--p-danger-500))}.kx-drawer-scrim{position:fixed;inset:0;z-index:60;background:color-mix(in srgb,var(--p-text-color) 40%,transparent);animation:kx-fade .18s ease both}.kx-drawer{position:fixed;top:0;right:0;height:100%;width:min(468px,100vw);z-index:61;display:flex;flex-direction:column;min-height:0;background:var(--p-content-background);border-left:1px solid var(--p-content-border-color);box-shadow:var(--kx-shadow-lg);animation:kx-slide-in .22s cubic-bezier(.22,.61,.36,1) both}@keyframes kx-fade{0%{opacity:0}to{opacity:1}}@keyframes kx-slide-in{0%{transform:translate(24px);opacity:0}to{transform:none;opacity:1}}@media(prefers-reduced-motion:reduce){.kx-drawer,.kx-drawer-scrim{animation:none}}.kx-drawer-head{display:flex;align-items:center;gap:11px;padding:16px 16px 14px;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-drawer-id{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}.kx-drawer-name{font-size:15px;font-weight:700;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-drawer-sub{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-drawer-controls{display:flex;align-items:center;gap:6px;flex:none}.kx-drawer .kx-badge{flex:none}.kx-tabs{display:flex;gap:2px;padding:6px 12px 0;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-tab{display:inline-flex;align-items:center;gap:6px;padding:8px 12px 10px;margin-bottom:-1px;border:none;border-bottom:2px solid transparent;background:transparent;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;color:var(--p-text-muted-color);transition:color .12s}.kx-tab svg{width:15px;height:15px}.kx-tab:hover{color:var(--p-text-color)}.kx-tab.is-active{color:var(--p-primary-color);border-bottom-color:var(--p-primary-color)}.kx-tab:focus-visible{outline:none;color:var(--p-primary-color)}.kx-drawer-body{flex:1;min-height:0;overflow-y:auto;padding:16px}.kx-dsec{display:flex;flex-direction:column;gap:16px}.kx-dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.kx-dfact{padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);min-width:0}.kx-dfact-k{display:block;margin-bottom:4px;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-dfact-v{display:block;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-dsub{display:flex;flex-direction:column;gap:8px}.kx-dsub-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-dnote{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--p-text-muted-color);padding:4px 0}.kx-dnote-err{color:var(--p-danger-600, var(--p-danger-500))}.kx-dsec-foot{padding-top:4px}.kx-dmsg{margin:0;font-size:12.5px;line-height:1.5;padding:10px 12px;border-radius:var(--kx-radius-10);background:var(--kx-surface-1);color:var(--p-text-color);word-break:break-word}.kx-dmsg.is-err{background:var(--kx-wash-danger);color:var(--p-danger-700, var(--p-danger-600, var(--p-danger-500)))}.kx-dmsg.is-ok{background:var(--kx-wash-success);color:var(--p-success-700, var(--p-success-600, var(--p-success-500)))}.kx-errcard{display:flex;flex-direction:column;gap:9px;padding:13px 14px;border:1px solid color-mix(in srgb,var(--p-danger-500) 40%,var(--p-content-border-color));border-radius:var(--kx-radius-14);background:var(--kx-wash-danger)}.kx-errcard-head{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--p-danger-700, var(--p-danger-600, var(--p-danger-500)))}.kx-errcard-head svg{width:17px;height:17px;flex:none}.kx-errcard-cause{margin:0;font-size:12.5px;line-height:1.5;color:var(--p-text-color);word-break:break-word}.kx-errcard .p-button{align-self:flex-start}.kx-hint{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:var(--kx-radius-10);background:var(--kx-wash-info);font-size:12px;line-height:1.45;color:var(--p-text-color)}.kx-hint svg{width:16px;height:16px;flex:none;margin-top:1px;color:var(--p-info-600, var(--p-info-500))}.kx-history{display:flex;flex-direction:column;gap:8px}.kx-history>h3{margin:0}.kx-history-entry{display:flex;flex-direction:column;gap:6px;padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);min-width:0}.kx-history-head{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}.kx-history-state{flex:none;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-history-meta{margin:0;font-size:12px;color:var(--p-text-muted-color)}.kx-history-kv{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:4px 12px;align-items:baseline}.kx-history-kv .kx-dfact-k{margin:0}.kx-history-v{margin:0;font-size:13px;color:var(--p-text-color);overflow-wrap:anywhere}', Ps = { props: { type: "object", properties: { mode: { type: "string", default: "", description: '"create" when mounted as the workspace "+" -> Automation create view: opens straight into the install popup and emits created/close. Unset renders the full Automations page.' }, "parent-id": { type: "string", default: "", description: "Workspace folder to place the new automation under (create mode; empty = root)." }, "component-id": { type: "string", default: "", description: "Optional owning component; scopes rows and places newly created Automations under that component." }, input: { type: "string", default: "", description: "Initial declared install inputs as a JSON object, supplied by the owning component." }, "type-id": { type: "string", default: "", description: "Optional registry automation type id to preselect in create or component mode. The manager treats the id opaquely and mounts that type's declared create view." } } } }, Ds = {
  wippy: Ps
};
class Es extends Eo {
  static get wippyConfig() {
    return {
      propsSchema: Ds.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: zs
    };
  }
  static get vueConfig() {
    return { rootComponent: Ss, plugins: [Ho] };
  }
}
Jo(import.meta.url, Es);
//# sourceMappingURL=index.js.map
