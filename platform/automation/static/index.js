import { _ as Et, e as ee, W as Re, u as Dn, a as Pn, c as En, b as In } from "./errMsg-BT807vrI.js";
import { B as ve, l as It, s as Lt, L as Ln, b as ge, v as we, U as An, I as vt, d as Mn, r as At, a as jn, c as Rn, e as Tn, C as On, h as Bn, S as Fn, _ as Nn, W as Un, f as Hn, P as Vn } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DNnuyvEa.js";
import { openBlock as s, createElementBlock as u, mergeProps as F, renderSlot as Q, createTextVNode as ae, toDisplayString as y, resolveComponent as Te, resolveDirective as Mt, withDirectives as pe, createBlock as U, resolveDynamicComponent as Oe, withCtx as N, createCommentVNode as _, normalizeClass as W, createElementVNode as l, defineComponent as be, computed as L, withModifiers as Xe, Fragment as Y, createVNode as z, unref as r, watch as Be, onBeforeUnmount as it, Transition as Kn, isRef as qn, vModelText as tt, renderList as te, vModelCheckbox as jt, vModelDynamic as Wn, ref as O, nextTick as Je } from "vue";
import { s as Ae, f as me, R as Rt, a as Yn, b as Tt, B as Zn, c as Gn, x as Qe, d as Xn } from "./index-DVv1zr-X.js";
import { on as Ot, api as de, host as Fe, loadByTagName as Jn, define as Qn } from "@wippy-fe/proxy";
import { Icon as T } from "@iconify/vue";
import { i as eo, e as to, a as no, f as oo, d as ht, v as ro, b as ao, u as io, c as so } from "./install-form-Ce0pU51G.js";
import { r as lo } from "./principals-Bury5BH3.js";
var co = `
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
`, uo = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Lt(n.value) && String(n.value).length === 1,
      "p-badge-dot": It(n.value) && !o.$slots.default,
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
}, po = ve.extend({
  name: "badge",
  style: co,
  classes: uo
}), bo = {
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
  style: po,
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
function xt(e, t, n) {
  return (t = fo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function fo(e) {
  var t = go(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function go(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Se(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Bt = {
  name: "Badge",
  extends: bo,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return me(xt(xt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, mo = ["data-p"];
function vo(e, t, n, o, i, a) {
  return s(), u("span", F({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [Q(e.$slots, "default", {}, function() {
    return [ae(y(e.value), 1)];
  })], 16, mo);
}
Bt.render = vo;
var ho = `
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
function le(e, t, n) {
  return (t = xo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xo(e) {
  var t = yo(e, "string");
  return ze(t) == "symbol" ? t : t + "";
}
function yo(e, t) {
  if (ze(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ze(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ko = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-button p-component", le(le(le(le(le(le(le(le(le({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", le({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, wo = ve.extend({
  name: "button",
  style: ho,
  classes: ko
}), _o = {
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
  style: wo,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function De(e) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, De(e);
}
function J(e, t, n) {
  return (t = $o(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $o(e) {
  var t = Co(e, "string");
  return De(t) == "symbol" ? t : t + "";
}
function Co(e, t) {
  if (De(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (De(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var X = {
  name: "Button",
  extends: _o,
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
      return F(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return It(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return me(J(J(J(J(J(J(J(J(J(J({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return me(J(J({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return me(J(J({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Yn,
    Badge: Bt
  },
  directives: {
    ripple: Rt
  }
}, So = ["data-p"], zo = ["data-p"];
function Do(e, t, n, o, i, a) {
  var f = Te("SpinnerIcon"), g = Te("Badge"), $ = Mt("ripple");
  return e.asChild ? Q(e.$slots, "default", {
    key: 1,
    class: W(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : pe((s(), U(Oe(e.as), F({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: N(function() {
      return [Q(e.$slots, "default", {}, function() {
        return [e.loading ? Q(e.$slots, "loadingicon", F({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (s(), u("span", F({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (s(), U(f, F({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : Q(e.$slots, "icon", F({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (s(), u("span", F({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, So)) : _("", !0)];
        }), e.label ? (s(), u("span", F({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), y(e.label), 17, zo)) : _("", !0), e.badge ? (s(), U(g, {
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
X.render = Do;
var Po = `
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
`, Eo = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Io = ve.extend({
  name: "progressspinner",
  style: Po,
  classes: Eo
}), Lo = {
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
  style: Io,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Ft = {
  name: "ProgressSpinner",
  extends: Lo,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Ao = ["fill", "stroke-width"];
function Mo(e, t, n, o, i, a) {
  return s(), u("div", F({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(s(), u("svg", F({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [l("circle", F({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, Ao)], 16))], 16);
}
Ft.render = Mo;
const jo = { key: 0 }, Ro = /* @__PURE__ */ be({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, n = L(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (o, i) => e.state.deleting_at ? (s(), u("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: i[1] || (i[1] = Xe(() => {
      }, ["stop"])),
      onKeydown: i[2] || (i[2] = Xe(() => {
      }, ["stop"]))
    }, [
      n.value ? (s(), u(Y, { key: 0 }, [
        l("span", null, [
          i[3] || (i[3] = ae("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (s(), u("span", jo, ": " + y(e.state.deletion_job.last_error), 1)) : _("", !0)
        ]),
        z(r(X), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: i[0] || (i[0] = Xe((a) => o.$emit("retry"), ["stop"]))
        })
      ], 64)) : (s(), u(Y, { key: 1 }, [
        z(r(Ft), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        i[4] || (i[4] = l("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : _("", !0);
  }
}), To = /* @__PURE__ */ Et(Ro, [["__scopeId", "data-v-69a579d4"]]);
function _e(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Oo(e, t) {
  if (t == null) return t;
  switch (e) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const n = Number(t);
        if (!Number.isNaN(n)) return n;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const n = JSON.parse(t);
          if (n && typeof n == "object") return n;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function Bo(e, t) {
  if (!t) return e;
  const n = {};
  for (const [o, i] of Object.entries(e))
    n[o] = Oo(t[o], i);
  return n;
}
function Nt(e, t, n) {
  if (t !== void 0 && !t) return null;
  const o = _e(e) ? e : {}, i = [
    o,
    _e(o.data) ? o.data : null,
    _e(o.payload) ? o.payload : null,
    _e(o.detail) ? o.detail : null
  ].filter(Boolean);
  for (const a of i) {
    if (a.event !== "component.meta.changed" && a.event !== "component.deleting" && a.event !== "component.deleted") continue;
    const f = String(a.component_id || ""), g = String(o.topic || a.topic || "");
    if (t === void 0) {
      if (!f && (!g.startsWith("component.") || g === "component.")) continue;
    } else if (f && f !== t || !f && g !== `component.${t}`) continue;
    const $ = f || t || g.slice(10);
    return a.event !== "component.meta.changed" ? { event: a.event, component_id: $ } : {
      event: "component.meta.changed",
      component_id: $,
      meta: Bo(_e(a.meta) ? a.meta : {}, n),
      deleted: Array.isArray(a.deleted) ? a.deleted.map(String) : []
    };
  }
  return null;
}
function Fo(e, t, n) {
  const o = Nt(e, t, n);
  return o?.event === "component.meta.changed" ? o : null;
}
function No(e, t) {
  const n = Nt(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function Uo(e, t, n) {
  if (!e) return null;
  const o = Ot(`component.${e}`, (i) => {
    const a = Fo(i, e, n);
    a && t(a);
  });
  return typeof o == "function" ? o : null;
}
function Ho(e, t, n) {
  let o = !0;
  const i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
  function f(x, m) {
    const h = e.value.find((A) => t(A) === x), c = a.get(x), v = {
      deleting_at: c?.deleting_at || h?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: m?.job_id || c?.deletion_job_id || h?.deletion_job_id
    };
    a.set(x, v), h && (Object.assign(h, v), h.deletion_job = void 0);
  }
  async function g(x) {
    const m = t(x), h = a.get(m), c = () => o && e.value.includes(x) && a.get(m) === h;
    try {
      const { data: v } = await de.get(`/api/v1/components/${encodeURIComponent(m)}`);
      if (!v?.success) throw new Error(ee(v, "Could not read deletion progress"));
      c() && (x.deleting_at = h?.deleting_at || v.deleting_at, x.deletion_job_id = v.deletion_job_id, h && (h.deletion_job_id = x.deletion_job_id), x.deletion_job = v.deletion_job ?? null);
    } catch (v) {
      c() && Fe.handleError("other", { message: ee(v, "Could not read deletion progress") });
    }
  }
  const $ = Be(() => e.value, (x, m = []) => {
    const h = x.filter((c) => !i.has(t(c)));
    for (const c of m) !i.has(t(c)) && h.some((v) => t(v) === t(c));
    if (h.length !== x.length) {
      e.value = h;
      return;
    }
    for (const c of x) {
      const v = a.get(t(c));
      v && (c.deletion_job_id !== v.deletion_job_id && (c.deletion_job = void 0), Object.assign(c, v));
      const A = m.find((K) => t(K) === t(c));
      c.deletion_job === void 0 && A?.deletion_job_id === c.deletion_job_id && (c.deletion_job = A?.deletion_job), c.deleting_at && g(c);
    }
  }, { immediate: !0 }), b = Ot("@message", (x) => {
    const m = No(x);
    if (!m) return;
    const h = e.value.find((c) => t(c) === m.component_id);
    m.event === "component.deleted" ? (h && i.has(m.component_id), i.add(m.component_id), a.delete(m.component_id), e.value = e.value.filter((c) => t(c) !== m.component_id)) : h && (f(m.component_id), g(h));
  });
  return it(() => {
    o = !1, $(), typeof b == "function" && b();
  }), { acceptDeletion: f };
}
var Ut = {
  name: "WindowMaximizeIcon",
  extends: Tt
};
function Vo(e) {
  return Yo(e) || Wo(e) || qo(e) || Ko();
}
function Ko() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qo(e, t) {
  if (e) {
    if (typeof e == "string") return nt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nt(e, t) : void 0;
  }
}
function Wo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Yo(e) {
  if (Array.isArray(e)) return nt(e);
}
function nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Zo(e, t, n, o, i, a) {
  return s(), u("svg", F({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Vo(t[0] || (t[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ut.render = Zo;
var Ht = {
  name: "WindowMinimizeIcon",
  extends: Tt
};
function Go(e) {
  return er(e) || Qo(e) || Jo(e) || Xo();
}
function Xo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jo(e, t) {
  if (e) {
    if (typeof e == "string") return ot(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ot(e, t) : void 0;
  }
}
function Qo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function er(e) {
  if (Array.isArray(e)) return ot(e);
}
function ot(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function tr(e, t, n, o, i, a) {
  return s(), u("svg", F({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Go(t[0] || (t[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ht.render = tr;
var nr = ve.extend({
  name: "focustrap-directive"
}), or = Zn.extend({
  style: nr
});
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function yt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function kt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? yt(Object(n), !0).forEach(function(o) {
      rr(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function rr(e, t, n) {
  return (t = ar(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ar(e) {
  var t = ir(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function ir(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Pe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var sr = or.extend("focustrap", {
  mounted: function(t, n) {
    var o = n.value || {}, i = o.disabled;
    i || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var o = n.value || {}, i = o.disabled;
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
      var o = this, i = n.value || {}, a = i.onFocusIn, f = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(g) {
        g.forEach(function($) {
          if ($.type === "childList" && !t.contains(document.activeElement)) {
            var b = function(m) {
              var h = vt(m) ? vt(m, o.getComputedSelector(t.$_pfocustrap_focusableselector)) ? m : we(t, o.getComputedSelector(t.$_pfocustrap_focusableselector)) : we(m);
              return Lt(h) ? h : m.nextSibling && b(m.nextSibling);
            };
            ge(b($.nextSibling));
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
    autoElementFocus: function(t, n) {
      var o = n.value || {}, i = o.autoFocusSelector, a = i === void 0 ? "" : i, f = o.firstFocusableSelector, g = f === void 0 ? "" : f, $ = o.autoFocus, b = $ === void 0 ? !1 : $, x = we(t, "[autofocus]".concat(this.getComputedSelector(a)));
      b && !x && (x = we(t, this.getComputedSelector(g))), ge(x);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, i = t.relatedTarget, a = i === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? we(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      ge(a);
    },
    onLastHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, i = t.relatedTarget, a = i === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Ln(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      ge(a);
    },
    createHiddenFocusableElements: function(t, n) {
      var o = this, i = n.value || {}, a = i.tabIndex, f = a === void 0 ? 0 : a, g = i.firstFocusableSelector, $ = g === void 0 ? "" : g, b = i.lastFocusableSelector, x = b === void 0 ? "" : b, m = function(A) {
        return An("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: f,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: A?.bind(o)
        });
      }, h = m(this.onFirstHiddenElementFocus), c = m(this.onLastHiddenElementFocus);
      h.$_pfocustrap_lasthiddenfocusableelement = c, h.$_pfocustrap_focusableselector = $, h.setAttribute("data-pc-section", "firstfocusableelement"), c.$_pfocustrap_firsthiddenfocusableelement = h, c.$_pfocustrap_focusableselector = x, c.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(h), t.append(c);
    }
  }
});
function wt() {
  jn({
    variableName: At("scrollbar.width").name
  });
}
function _t() {
  Mn({
    variableName: At("scrollbar.width").name
  });
}
var lr = `
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
`, cr = {
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
}, dr = {
  mask: function(t) {
    var n = t.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], i = o.find(function(a) {
      return a === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, i ? "p-dialog-".concat(i) : ""];
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
}, ur = ve.extend({
  name: "dialog",
  style: lr,
  classes: dr,
  inlineStyles: cr
}), pr = {
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
  style: ur,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Ce = {
  name: "Dialog",
  extends: pr,
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
      this.modal && !this.isUnstyled && Un(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), ge(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
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
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && ge(n, {
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Nn(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
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
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Fn(document.body, {
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
          var o = Tn(t.container), i = On(t.container), a = n.pageX - t.lastPageX, f = n.pageY - t.lastPageY, g = t.container.getBoundingClientRect(), $ = g.left + a, b = g.top + f, x = Bn(), m = getComputedStyle(t.container), h = parseFloat(m.marginLeft), c = parseFloat(m.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? ($ >= t.minX && $ + o < x.width && (t.lastPageX = n.pageX, t.container.style.left = $ - h + "px"), b >= t.minY && b + i < x.height && (t.lastPageY = n.pageY, t.container.style.top = b - c + "px")) : (t.lastPageX = n.pageX, t.container.style.left = $ - h + "px", t.lastPageY = n.pageY, t.container.style.top = b - c + "px");
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
      return me({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Rt,
    focustrap: sr
  },
  components: {
    Button: X,
    Portal: Rn,
    WindowMinimizeIcon: Ht,
    WindowMaximizeIcon: Ut,
    TimesIcon: Gn
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
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ct(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $t(Object(n), !0).forEach(function(o) {
      br(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $t(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function br(e, t, n) {
  return (t = fr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function fr(e) {
  var t = gr(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function gr(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ee(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var mr = ["data-p"], vr = ["aria-labelledby", "aria-modal", "data-p"], hr = ["id"], xr = ["data-p"];
function yr(e, t, n, o, i, a) {
  var f = Te("Button"), g = Te("Portal"), $ = Mt("focustrap");
  return s(), U(g, {
    appendTo: e.appendTo
  }, {
    default: N(function() {
      return [i.containerVisible ? (s(), u("div", F({
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
      }, e.ptm("mask")), [z(Kn, F({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: N(function() {
          return [e.visible ? pe((s(), u("div", F({
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
            maximizeCallback: function(x) {
              return a.maximize(x);
            },
            initDragCallback: a.initDrag
          }) : (s(), u(Y, {
            key: 1
          }, [e.showHeader ? (s(), u("div", F({
            key: 0,
            ref: a.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, e.ptm("header")), [Q(e.$slots, "header", {
            class: W(e.cx("title"))
          }, function() {
            return [e.header ? (s(), u("span", F({
              key: 0,
              id: a.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), y(e.header), 17, hr)) : _("", !0)];
          }), l("div", F({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? Q(e.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(x) {
              return a.maximize(x);
            }
          }, function() {
            return [z(f, F({
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
              icon: N(function(b) {
                return [Q(e.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(s(), U(Oe(a.maximizeIconComponent), F({
                    class: [b.class, i.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : _("", !0), e.closable ? Q(e.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [z(f, F({
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
              icon: N(function(b) {
                return [Q(e.$slots, "closeicon", {}, function() {
                  return [(s(), U(Oe(e.closeIcon ? "span" : "TimesIcon"), F({
                    class: [e.closeIcon, b.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : _("", !0)], 16)], 16)) : _("", !0), l("div", F({
            ref: a.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": a.dataP
          }, Ct(Ct({}, e.contentProps), e.ptm("content"))), [Q(e.$slots, "default")], 16, xr), e.footer || e.$slots.footer ? (s(), u("div", F({
            key: 1,
            ref: a.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [Q(e.$slots, "footer", {}, function() {
            return [ae(y(e.footer), 1)];
          })], 16)) : _("", !0)], 64))], 16, vr)), [[$, {
            disabled: !e.modal
          }]]) : _("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, mr)) : _("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Ce.render = yr;
var kr = `
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
`, wr = {
  root: function(t) {
    var n = t.props;
    return ["p-tag p-component", {
      "p-tag-info": n.severity === "info",
      "p-tag-success": n.severity === "success",
      "p-tag-warn": n.severity === "warn",
      "p-tag-danger": n.severity === "danger",
      "p-tag-secondary": n.severity === "secondary",
      "p-tag-contrast": n.severity === "contrast",
      "p-tag-rounded": n.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, _r = ve.extend({
  name: "tag",
  style: kr,
  classes: wr
}), $r = {
  name: "BaseTag",
  extends: Ae,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: _r,
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
function Cr(e, t, n) {
  return (t = Sr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Sr(e) {
  var t = zr(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function zr(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ie(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var st = {
  name: "Tag",
  extends: $r,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return me(Cr({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Dr = ["data-p"];
function Pr(e, t, n, o, i, a) {
  return s(), u("span", F({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (s(), U(Oe(e.$slots.icon), F({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (s(), u("span", F({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : _("", !0), e.value != null || e.$slots.default ? Q(e.$slots, "default", {
    key: 2
  }, function() {
    return [l("span", F({
      class: e.cx("label")
    }, e.ptm("label")), y(e.value), 17)];
  }) : _("", !0)], 16, Dr);
}
st.render = Pr;
function Er(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const n = e.trim();
    if (/^\d+$/.test(n))
      t = Number(n);
    else {
      const o = Date.parse(n);
      return Number.isNaN(o) ? null : o;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function ce(e, t) {
  const n = Er(e);
  if (n === null) return "";
  const o = t?.now ?? Date.now(), i = t?.suffix ?? !0, a = t?.maxUnit ?? "day", f = t?.future ?? !1, g = 6e4, $ = 60 * g, b = 24 * $, x = 30 * b, m = 365 * b, h = o - n;
  if (f && h < 0) {
    const A = -h;
    return A < g ? "in <1m" : A < $ ? `in ${Math.floor(A / g)}m` : A < b ? `in ${Math.floor(A / $)}h` : `in ${Math.floor(A / b)}d`;
  }
  const c = Math.max(0, h);
  if (c < g) return "just now";
  const v = i ? " ago" : "";
  return c < $ ? `${Math.floor(c / g)}m${v}` : c < b ? `${Math.floor(c / $)}h${v}` : a === "year" ? c < x ? `${Math.floor(c / b)}d${v}` : c < m ? `${Math.floor(c / x)}mo${v}` : `${Math.floor(c / m)}y${v}` : `${Math.floor(c / b)}d${v}`;
}
function rt(e) {
  return String(e.description || "").trim();
}
function Vt(e) {
  const t = e?.tag_name;
  return typeof t == "string" ? t.trim() : "";
}
function Kt(e) {
  const t = typeof e?.base_path == "string" ? e.base_path.trim() : "", n = typeof e?.entry_point == "string" ? e.entry_point.trim() : "";
  return t && n ? `/${t}/${n}` : typeof e?.url == "string" ? e.url.trim() : "";
}
function at(e) {
  return Vt(e?.component?.create_ui);
}
function Ir(e) {
  return Kt(e?.component?.create_ui);
}
function lt(e) {
  return Vt(e?.component?.manage_ui);
}
function qt(e) {
  return Kt(e?.component?.manage_ui);
}
function Wt(e, t) {
  return { id: e.id, automation: e, public_state: e.public_state || {}, type: t };
}
let St = 0;
function Lr(e) {
  e && (St += 1, e.setAttribute("submit-nonce", String(St)));
}
const Ar = { class: "kx-modal-head-icon" }, Mr = { class: "kx-modal-head-text" }, jr = { class: "kx-modal-head-title" }, Rr = {
  key: 0,
  class: "kx-2p-l"
}, Tr = { class: "kx-cat-search" }, Or = {
  key: 0,
  class: "kx-cat-empty"
}, Br = {
  key: 1,
  class: "kx-cat"
}, Fr = ["onClick"], Nr = { class: "kx-cat-ico" }, Ur = { class: "kx-cat-text" }, Hr = { class: "kx-cat-name" }, Vr = {
  key: 0,
  class: "kx-cat-desc"
}, Kr = { class: "kx-2p-r" }, qr = {
  key: 0,
  class: "kx-2p-r-head"
}, Wr = { class: "kx-2p-r-body" }, Yr = {
  key: 0,
  class: "kx-2p-r-note"
}, Zr = {
  key: 1,
  class: "kx-2p-r-note"
}, Gr = {
  key: 2,
  class: "kx-form"
}, Xr = { class: "kx-field-lbl" }, Jr = {
  key: 0,
  class: "kx-req",
  "aria-hidden": "true"
}, Qr = ["onUpdate:modelValue"], ea = ["onUpdate:modelValue"], ta = ["onUpdate:modelValue", "type", "placeholder"], na = {
  key: 4,
  class: "kx-field-hint"
}, oa = {
  key: 5,
  class: "kx-field-hint"
}, ra = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, aa = /* @__PURE__ */ be({
  __name: "InstallDialog",
  props: {
    flow: {},
    componentMode: { type: Boolean },
    dialogPt: {}
  },
  setup(e) {
    const t = e, {
      showTypeCatalog: n,
      installFields: o,
      showInstall: i,
      installType: a,
      installForm: f,
      installing: g,
      customSaving: $,
      installError: b,
      customInstallHost: x,
      installSearchInput: m,
      typeSearch: h,
      filteredTypes: c,
      chooseType: v,
      closeInstall: A,
      focusInstallDialog: K,
      onCreate: q
    } = t.flow;
    return (re, G) => (s(), U(r(Ce), {
      visible: r(i),
      modal: !0,
      "block-scroll": !0,
      "dismissable-mask": !0,
      pt: e.dialogPt,
      class: W(["kx-modal kx-modal-2p", { "kx-modal-solo": !r(n) }]),
      "aria-label": "Add an automation",
      "onUpdate:visible": G[1] || (G[1] = (I) => {
        I || r(A)();
      }),
      onShow: r(K)
    }, {
      header: N(() => [
        l("span", Ar, [
          z(r(T), {
            icon: r(a) && r(a).icon || "tabler:bolt",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        l("span", Mr, [
          l("span", jr, y(r(a) ? r(a).title || r(a).name : "Add an automation"), 1),
          G[2] || (G[2] = l("span", { class: "kx-modal-head-sub" }, "Configure an automation.", -1))
        ])
      ]),
      footer: N(() => [
        r(b) ? (s(), u("div", ra, y(r(b)), 1)) : _("", !0),
        z(r(X), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: r(g) || r($),
          onClick: r(A)
        }, null, 8, ["disabled", "onClick"]),
        r(a) ? (s(), U(r(X), {
          key: 1,
          type: "button",
          "data-testid": "automations-install-create",
          label: r(g) || r($) ? "Creating…" : "Create",
          loading: r(g) || r($),
          disabled: r(g) || r($),
          onClick: r(q)
        }, {
          icon: N(({ class: I }) => [
            z(r(T), {
              icon: "tabler:plus",
              class: W(I),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["label", "loading", "disabled", "onClick"])) : _("", !0)
      ]),
      default: N(() => [
        l("div", {
          class: W(["kx-2p", { "kx-2p-solo": !r(n) }])
        }, [
          r(n) ? (s(), u("div", Rr, [
            l("div", Tr, [
              z(r(T), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              pe(l("input", {
                ref_key: "installSearchInput",
                ref: m,
                "onUpdate:modelValue": G[0] || (G[0] = (I) => qn(h) ? h.value = I : null),
                "data-modal-initial": "",
                type: "text",
                placeholder: "Search types…",
                "aria-label": "Search automation types"
              }, null, 512), [
                [tt, r(h)]
              ])
            ]),
            r(c).length ? (s(), u("div", Br, [
              (s(!0), u(Y, null, te(r(c), (I) => (s(), u("button", {
                key: I.id,
                class: W(["kx-cat-card", r(a)?.id === I.id && "sel"]),
                onClick: (H) => r(v)(I)
              }, [
                l("span", Nr, [
                  z(r(T), {
                    icon: I.icon || "tabler:sparkles",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                l("span", Ur, [
                  l("span", Hr, y(I.title || I.name), 1),
                  r(rt)(I) ? (s(), u("span", Vr, y(r(rt)(I)), 1)) : _("", !0)
                ]),
                z(r(T), {
                  icon: "tabler:check",
                  class: "kx-cat-check",
                  "aria-hidden": "true"
                })
              ], 10, Fr))), 128))
            ])) : (s(), u("div", Or, "No setups match “" + y(r(h)) + "”.", 1))
          ])) : _("", !0),
          l("div", Kr, [
            r(n) ? (s(), u("div", qr, "Setup")) : _("", !0),
            l("div", Wr, [
              r(a) ? (s(), u(Y, { key: 1 }, [
                r(at)(r(a)) ? (s(), u("div", {
                  key: 0,
                  ref_key: "customInstallHost",
                  ref: x,
                  class: "kx-custom-host"
                }, null, 512)) : r(o).length ? (s(), u("div", Gr, [
                  (s(!0), u(Y, null, te(r(o), ([I, H]) => (s(), u("label", {
                    key: I,
                    class: "kx-field"
                  }, [
                    l("span", Xr, [
                      ae(y(H.title || I) + " ", 1),
                      r(eo)(r(a), I) ? (s(), u("span", Jr, "*")) : _("", !0)
                    ]),
                    H.enum ? (s(), U(r(Xn), {
                      key: 0,
                      class: "kx-select",
                      "model-value": r(f)[I],
                      options: r(to)(r(a), I, H),
                      "option-label": "label",
                      "option-value": "value",
                      placeholder: "—",
                      "aria-label": H.title || I,
                      "onUpdate:modelValue": (C) => r(f)[I] = C
                    }, null, 8, ["model-value", "options", "aria-label", "onUpdate:modelValue"])) : H.type === "boolean" ? pe((s(), u("input", {
                      key: 1,
                      "onUpdate:modelValue": (C) => r(f)[I] = C,
                      class: "kx-check",
                      type: "checkbox"
                    }, null, 8, Qr)), [
                      [jt, r(f)[I]]
                    ]) : H.type === "number" || H.type === "integer" ? pe((s(), u("input", {
                      key: 2,
                      "onUpdate:modelValue": (C) => r(f)[I] = C,
                      class: "kx-input",
                      type: "number"
                    }, null, 8, ea)), [
                      [
                        tt,
                        r(f)[I],
                        void 0,
                        { number: !0 }
                      ]
                    ]) : pe((s(), u("input", {
                      key: 3,
                      "onUpdate:modelValue": (C) => r(f)[I] = C,
                      class: "kx-input",
                      type: r(no)(H),
                      placeholder: H.description || ""
                    }, null, 8, ta)), [
                      [Wn, r(f)[I]]
                    ]),
                    H.description && !(H.type !== "boolean" && !H.enum) ? (s(), u("span", na, y(H.description), 1)) : H.description && H.enum ? (s(), u("span", oa, y(H.description), 1)) : _("", !0)
                  ]))), 128))
                ])) : (s(), u("div", Zr, "This automation needs no configuration."))
              ], 64)) : (s(), u("p", Yr, "Select an automation type to configure it."))
            ])
          ])
        ], 2)
      ]),
      _: 1
    }, 8, ["visible", "pt", "class", "onShow"]));
  }
}), ia = {
  key: 0,
  class: "kx-metrics"
}, sa = { class: "kx-metric-k" }, la = ["title"], ca = {
  key: 1,
  class: "kx-metric-details"
}, da = { class: "kx-metrics kx-metrics-detail" }, ua = { class: "kx-metric-k" }, pa = ["title"], ba = /* @__PURE__ */ be({
  __name: "RowMetrics",
  props: {
    face: { default: () => [] },
    detail: { default: () => [] }
  },
  setup(e) {
    return (t, n) => (s(), u(Y, null, [
      e.face.length ? (s(), u("div", ia, [
        (s(!0), u(Y, null, te(e.face, (o) => (s(), u("span", {
          key: o.label,
          class: "kx-metric"
        }, [
          o.icon ? (s(), U(r(T), {
            key: 0,
            icon: o.icon,
            class: "kx-metric-i",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : _("", !0),
          l("span", sa, y(o.label), 1),
          l("span", {
            class: "kx-metric-v",
            title: o.title
          }, y(o.value), 9, la)
        ]))), 128))
      ])) : _("", !0),
      e.detail.length ? (s(), u("details", ca, [
        n[0] || (n[0] = l("summary", { class: "kx-metric-more" }, "Details", -1)),
        l("div", da, [
          (s(!0), u(Y, null, te(e.detail, (o) => (s(), u("span", {
            key: o.label,
            class: "kx-metric"
          }, [
            o.icon ? (s(), U(r(T), {
              key: 0,
              icon: o.icon,
              class: "kx-metric-i",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : _("", !0),
            l("span", ua, y(o.label), 1),
            l("span", {
              class: "kx-metric-v",
              title: o.title
            }, y(o.value), 9, pa)
          ]))), 128))
        ])
      ])) : _("", !0)
    ], 64));
  }
}), fa = /* @__PURE__ */ new Set(["pause", "resume"]), ga = /* @__PURE__ */ new Set(["reconfigure"]), zt = /* @__PURE__ */ new Set(["run_now", "trigger", "execute", "run"]), et = {
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
function Yt(e) {
  return e.has("run_now") ? "run_now" : e.has("trigger") ? "trigger" : e.has("execute") ? "execute" : "";
}
function ma(e) {
  return e.replace(/[._-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Dt(e) {
  return { label: ma(e), description: "Run this action.", group: "recovery", icon: "tabler:bolt" };
}
function Zt(e) {
  return new Set([...e?.controls || [], ...e?.actions || []].map((t) => t.name).filter(Boolean));
}
function Gt(e) {
  const t = [...Zt(e)], n = !!lt(e);
  return {
    declared: t,
    requiresKeys: e?.controls?.filter((o) => o.keys_required).map((o) => o.name),
    runNow: Yt(new Set(t)),
    canReconfigure: n,
    // An automation is a component, so it shares through the generic component
    // access endpoints; the server is the authority on who may grant.
    canShare: !0,
    canExport: e?.exportable === !0,
    canDelete: !0
  };
}
function Xt(e) {
  const t = e instanceof Set ? e : new Set(e);
  return t.has("rewind") ? "rewind" : t.has("resync") ? "resync" : "";
}
function Jt(e) {
  const t = [];
  if (e.runNow) {
    const o = et[e.runNow] || et.trigger;
    t.push({ method: e.runNow, ...o, kind: "call" });
  }
  const n = /* @__PURE__ */ new Set();
  for (const o of e.declared) {
    if (fa.has(o) || o === e.runNow || e.runNow !== "run_now" && zt.has(o) || ga.has(o) || n.has(o)) continue;
    n.add(o);
    const i = e.runNow === "run_now" && zt.has(o) ? { ...Dt(o), group: "run" } : et[o] || Dt(o);
    t.push({ method: o, ...i, kind: "call", disabled: e.requiresKeys?.includes(o) });
  }
  return e.canReconfigure && t.push({ method: "reconfigure", label: "Reconfigure", description: "Change how this automation is set up.", group: "edit", icon: "tabler:settings", kind: "reconfigure" }), e.canShare && t.push({ method: "share", label: "Share", description: "Give other people access to this automation.", group: "edit", icon: "tabler:users", kind: "share" }), e.canExport && t.push({ method: "export", label: "Export", description: "Download a portable copy to import elsewhere.", group: "edit", icon: "tabler:download", kind: "export" }), e.canDelete && t.push({ method: "delete", label: "Delete", description: "Stop it and remove its setup. This cannot be undone.", group: "delete", icon: "tabler:trash", kind: "delete", danger: !0 }), t;
}
const va = ["run", "recovery", "edit", "delete"], ha = {
  run: "Run",
  recovery: "Recovery",
  edit: "Edit",
  delete: ""
};
function xa(e) {
  return va.map((t) => ({ group: t, label: ha[t], items: e.filter((n) => n.group === t) })).filter((t) => t.items.length > 0);
}
function ya(e, t) {
  return e.group === "run" ? `Run ${t} now` : e.method === "reconfigure" ? `Edit ${t}` : `${e.label} ${t}`;
}
const ka = ["aria-label"], wa = {
  key: 1,
  class: "kx-menu-sep",
  role: "separator"
}, _a = ["data-testid", "aria-label", "disabled", "onClick"], $a = { class: "kx-menu-item-body" }, Ca = { class: "kx-menu-item-label" }, Sa = { class: "kx-menu-item-desc" }, Qt = /* @__PURE__ */ be({
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
    const n = e, o = t, i = O(!1), a = O(null), f = L(() => xa(n.items));
    function g() {
      i.value = !i.value;
    }
    function $() {
      i.value = !1;
    }
    function b(x) {
      n.disabled || x.disabled || ($(), o("select", x.method));
    }
    return (x, m) => (s(), u("span", {
      ref_key: "trigger",
      ref: a,
      class: "kx-menu"
    }, [
      z(r(X), {
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
        icon: N(({ class: h }) => [
          z(r(T), {
            icon: "tabler:dots",
            "aria-hidden": "true",
            class: W(h)
          }, null, 8, ["class"])
        ]),
        _: 1
      }, 8, ["size", "class", "aria-expanded", "aria-label", "disabled"]),
      z(Hn, {
        open: i.value,
        "onUpdate:open": m[0] || (m[0] = (h) => i.value = h),
        anchor: a.value,
        align: "right",
        width: 264,
        "max-height": 460,
        gap: 6
      }, {
        default: N(() => [
          l("div", {
            class: "kx-menu-panel",
            role: "menu",
            "aria-label": `Actions for ${e.name}`
          }, [
            (s(!0), u(Y, null, te(f.value, (h, c) => (s(), u(Y, {
              key: h.group
            }, [
              h.label ? (s(), u("div", {
                key: 0,
                class: W(["kx-menu-group", c === 0 && "is-first"])
              }, y(h.label), 3)) : c > 0 ? (s(), u("div", wa)) : _("", !0),
              (s(!0), u(Y, null, te(h.items, (v) => (s(), u("button", {
                key: v.method,
                type: "button",
                role: "menuitem",
                class: W(["kx-menu-item", [v.danger && "is-danger", v.warn && "is-warn"]]),
                "data-testid": `action-${v.method}`,
                "aria-label": r(ya)(v, e.name),
                disabled: e.disabled || v.disabled || e.busy && v.kind === "call",
                onClick: (A) => b(v)
              }, [
                z(r(T), {
                  icon: v.icon,
                  class: "kx-menu-item-ico",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                l("span", $a, [
                  l("span", Ca, [
                    ae(y(v.label) + " ", 1),
                    v.warn ? (s(), U(r(T), {
                      key: 0,
                      icon: "tabler:alert-triangle",
                      class: "kx-menu-item-warn",
                      "aria-hidden": "true"
                    })) : _("", !0)
                  ]),
                  l("span", Sa, y(v.description), 1)
                ])
              ], 10, _a))), 128))
            ], 64))), 128))
          ], 8, ka)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 512));
  }
}), za = {
  "aria-label": "Execution history",
  class: "kx-history"
}, Da = {
  key: 0,
  role: "status"
}, Pa = {
  key: 1,
  role: "alert"
}, Ea = { key: 0 }, Ia = { key: 0 }, La = ["title"], Aa = ["title"], Ma = { key: 1 }, ja = { key: 0 }, Ra = { key: 0 }, Ta = ["title"], Oa = { key: 1 }, Ba = /* @__PURE__ */ be({
  __name: "ExecutionHistory",
  props: {
    root: {}
  },
  emits: ["error"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = O([]), a = O([]), f = O([]), g = O(""), $ = O(""), b = O(!1), x = O("");
    let m = 0;
    function h() {
      i.value = [], a.value = [], f.value = [], g.value = "", $.value = "";
    }
    function c(C) {
      return f.value.find((E) => E.type === C?.kind && E.id === C?.id)?.label || "Account unavailable";
    }
    function v(C) {
      return {
        recorded: "Recorded admission",
        absent: "Identity evidence absent",
        inferred: "Identity evidence inferred; unverified",
        unresolved: "Identity unresolved"
      }[C.evidence_status];
    }
    function A(C) {
      return JSON.stringify([C.drive_key, C.round_token, C.source_port, C.item_key, C.identity_key]);
    }
    function K(C) {
      return ee(C, typeof C == "string" ? C : "");
    }
    async function q(C, E, D = "") {
      const { data: j } = await de.get(
        "/api/v1/automations/" + encodeURIComponent(C) + "/history",
        { params: { kind: E, page_size: 25, ...D ? { page_token: D } : {} } }
      );
      if (!j.success || j.kind !== E || !Array.isArray(j.entries)) throw new Error(j.error?.message || "Could not read execution history");
      if (j.next_page_token && j.next_page_token === D) throw new Error("History page repeats its cursor");
      return j;
    }
    async function re(C, E) {
      const D = /* @__PURE__ */ new Map();
      function j(R) {
        R && (R.kind === "user" || R.kind === "group") && D.set(R.kind + ":" + R.id, { type: R.kind, id: R.id });
      }
      for (const R of C)
        j(R.evidence?.identity?.principal), j(R.evidence?.identity?.authorized_by);
      for (const R of E)
        R.initiation && j({ kind: "user", id: R.initiation.actor_id });
      return lo([...D.values()]);
    }
    function G(C) {
      h(), x.value = ee(C, "Could not read execution history"), o("error", { message: x.value, error: C });
    }
    async function I() {
      const C = ++m, E = n.root;
      if (h(), x.value = "", b.value = !1, !!E) {
        b.value = !0;
        try {
          const [D, j] = await Promise.all([q(E, "deliveries"), q(E, "controls")]), R = await re(D.entries, j.entries);
          if (C !== m) return;
          i.value = D.entries, a.value = j.entries, f.value = R, g.value = D.next_page_token || "", $.value = j.next_page_token || "";
        } catch (D) {
          C === m && G(D);
        } finally {
          C === m && (b.value = !1);
        }
      }
    }
    async function H(C) {
      if (b.value) return;
      const E = m, D = n.root, j = C === "deliveries" ? g.value : $.value;
      if (j) {
        b.value = !0, x.value = "";
        try {
          const R = await q(D, C, j), d = C === "deliveries" ? [...i.value, ...R.entries] : i.value, M = C === "controls" ? [...a.value, ...R.entries] : a.value, B = await re(d, M);
          if (E !== m) return;
          i.value = d, a.value = M, f.value = B, C === "deliveries" ? g.value = R.next_page_token || "" : $.value = R.next_page_token || "";
        } catch (R) {
          E === m && G(R);
        } finally {
          E === m && (b.value = !1);
        }
      }
    }
    return Be(() => n.root, () => {
      I();
    }, { immediate: !0 }), it(() => {
      m += 1;
    }), (C, E) => (s(), u("section", za, [
      b.value ? (s(), u("p", Da, "Loading execution history…")) : _("", !0),
      x.value ? (s(), u("p", Pa, y(x.value), 1)) : (s(), u(Y, { key: 2 }, [
        l("div", null, [
          E[4] || (E[4] = l("h3", null, "Committed deliveries", -1)),
          !b.value && !i.value.length ? (s(), u("p", Ea, "No retained deliveries.")) : _("", !0),
          (s(!0), u(Y, null, te(i.value, (D) => (s(), u("article", {
            key: A(D),
            class: "kx-history-entry"
          }, [
            l("strong", null, y(D.item_key) + " · " + y(D.state), 1),
            l("p", null, "Round starts " + y(r(ce)(D.round_at, { future: !0 })), 1),
            l("p", null, y(v(D)), 1),
            D.evidence?.identity ? (s(), u("dl", Ia, [
              E[3] || (E[3] = l("dt", null, "Executor", -1)),
              l("dd", {
                title: D.evidence.identity.principal.id,
                "aria-label": "Historical executor"
              }, y(c(D.evidence.identity.principal)), 9, La),
              D.evidence.identity.authorized_by ? (s(), u(Y, { key: 0 }, [
                E[2] || (E[2] = l("dt", null, "Authorized by", -1)),
                l("dd", {
                  title: D.evidence.identity.authorized_by.id,
                  "aria-label": "Historical authorizer"
                }, y(c(D.evidence.identity.authorized_by)), 9, Aa)
              ], 64)) : _("", !0)
            ])) : _("", !0),
            K(D.error) ? (s(), u("p", Ma, y(K(D.error)), 1)) : _("", !0)
          ]))), 128)),
          g.value ? (s(), U(r(X), {
            key: 1,
            label: "More deliveries",
            severity: "secondary",
            disabled: b.value,
            onClick: E[0] || (E[0] = (D) => H("deliveries"))
          }, null, 8, ["disabled"])) : _("", !0)
        ]),
        l("div", null, [
          E[6] || (E[6] = l("h3", null, "Control requests", -1)),
          E[7] || (E[7] = l("p", null, "Control requests and delivery admission are independent records.", -1)),
          !b.value && !a.value.length ? (s(), u("p", ja, "No retained control requests.")) : _("", !0),
          (s(!0), u(Y, null, te(a.value, (D) => (s(), u("article", {
            key: `${D.generation}:${D.request_id}`,
            class: "kx-history-entry"
          }, [
            l("strong", null, y(D.state), 1),
            l("p", null, "Requested " + y(r(ce)(D.created_at, { future: !0 })), 1),
            D.initiation ? (s(), u("dl", Ra, [
              E[5] || (E[5] = l("dt", null, "Initiated by", -1)),
              l("dd", {
                title: D.initiation.actor_id,
                "aria-label": "Control initiator"
              }, y(c({ kind: "user", id: D.initiation.actor_id })), 9, Ta)
            ])) : (s(), u("p", Oa, "Initiator not recorded."))
          ]))), 128)),
          $.value ? (s(), U(r(X), {
            key: 1,
            label: "More control requests",
            severity: "secondary",
            disabled: b.value,
            onClick: E[1] || (E[1] = (D) => H("controls"))
          }, null, 8, ["disabled"])) : _("", !0)
        ])
      ], 64))
    ]));
  }
}), Fa = /* @__PURE__ */ Et(Ba, [["__scopeId", "data-v-3d5e957f"]]);
function Le(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Na(e) {
  return Le(e) && typeof e.code == "string" && typeof e.message == "string" && typeof e.at == "string" && (e.item_key === void 0 || typeof e.item_key == "string");
}
function Ua(e) {
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
function Ha(e) {
  if (!Le(e) || e.success !== !0 || !Array.isArray(e.drives) || !e.drives.every(Ua) || e.next_page_token !== void 0 && e.next_page_token !== null && (typeof e.next_page_token != "string" || !e.next_page_token)) return !1;
  const t = e.delivery_failures;
  return t === void 0 || Le(t) && typeof t.count == "number" && Number.isInteger(t.count) && t.count >= 0 && (t.last_error === void 0 || Na(t.last_error));
}
const en = {
  blocked_identity: "The account this automation runs as needs to be confirmed.",
  blocked_access: "This automation lost access to something it uses.",
  blocked_declaration: "This automation's settings need to be fixed."
};
function Ue(e) {
  return (e?.drives || []).filter((t) => t.source_kind !== "none");
}
function je(e) {
  return e.enabled === !1 || e.phase === "paused";
}
function Pt(e) {
  return (e.source_kind === "timer" || e.source_kind === "collection") && (e.phase === "pending" || e.phase === "active") && typeof e.next_run_at == "string" && Date.parse(e.next_run_at) > Date.now();
}
function Va(e) {
  const t = Ue(e), n = (e?.delivery_failures?.count || 0) > 0;
  if (!t.length) return n ? { kind: "warn", label: "Needs attention" } : null;
  if (t.some((i) => (i.phase || "") in en)) return { kind: "warn", label: "Needs attention" };
  if (t.every(je)) return { kind: "off", label: "Paused" };
  if (n) return { kind: "warn", label: "Needs attention" };
  if (t.some((i) => i.phase === "degraded")) return { kind: "warn", label: "Retrying" };
  if (t.some((i) => i.phase === "backpressure")) return { kind: "live", label: "Catching up" };
  if (t.some((i) => !je(i) && i.phase === "pending" && !Pt(i))) return { kind: "neutral", label: "Starting" };
  const o = t.filter((i) => !je(i) && i.source_kind !== "reconcile");
  return o.length && o.every(Pt) ? { kind: "on", label: "Scheduled" } : { kind: "on", label: "Active" };
}
function Ka(e) {
  const t = e?.delivery_failures?.last_error;
  if (t) return `${t.code}: ${t.message}`;
  const n = Ue(e);
  for (const o of n) {
    const i = en[o.phase || ""];
    if (i) return i;
  }
  for (const o of n) {
    if (o.phase !== "degraded") continue;
    return (typeof o.last_error?.message == "string" ? o.last_error.message.trim() : "") || "The last run failed; it is retrying.";
  }
  return "";
}
function qa(e) {
  const t = Ue(e), n = [], o = $e(e).next;
  o && n.push({ label: "Next run", value: o, time: !0 });
  const i = t.reduce((a, f) => a + (f.unresolved_count || 0), 0);
  return i > 0 && n.push({ label: "Waiting to retry", value: `${i} ${i === 1 ? "item" : "items"}` }), n;
}
function $e(e) {
  const t = Ue(e), n = t.map((i) => i.last_run_at).filter((i) => typeof i == "string" && !!i).sort().at(-1), o = t.filter((i) => !je(i)).map((i) => i.next_run_at).filter((i) => typeof i == "string" && !!i).sort()[0];
  return { last: n, next: o };
}
const Wa = /* @__PURE__ */ new Set(["status", "enabled", "last_error", "last_run_at", "next_run_at"]);
function Ya(e) {
  return e.replace(/_/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Za(e) {
  return e.replace(/\b\w/g, (t) => t.toUpperCase());
}
function Ga(e) {
  return e && e.charAt(0).toUpperCase() + e.slice(1);
}
function Xa(e, t) {
  if (e.type === "boolean") return t === !0 ? "Yes" : "No";
  const n = String(t);
  return e.key.endsWith("_at") || /^\d{4}-\d{2}-\d{2}T/.test(n) ? ce(n, { future: !0 }) || n : e.type === "text" ? Ga(n) : n;
}
function tn(e) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e) || /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(e) ? !0 : /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:_-]*$/i.test(e) && /:[0-9a-f-]{6,}/i.test(e);
}
function Ja(e) {
  return tn(e) ? { text: e.length > 12 ? `${e.slice(0, 8)}…` : e, title: e } : { text: e };
}
const Qa = [
  { match: /component_id not in scope|not in scope/i, text: "Not part of this workspace" },
  { match: /transform output must be an object/i, text: "Item format not recognized" },
  { match: /trigger events dropped/i, text: "Incoming events were dropped" },
  { match: /requires dest_ref/i, text: "Missing a destination reference" },
  { match: /does not declare sink operation|accepts source payloads only/i, text: "Destination cannot accept this item" },
  { match: /sink write (returned a non-object|did not acknowledge)/i, text: "Destination did not confirm the save" },
  { match: /(sink|source) resolve/i, text: "Source or destination unavailable" }
];
function ei(e) {
  const t = e.trim();
  if (!t) return { text: "" };
  for (const n of Qa)
    if (n.match.test(t)) return { text: n.text, title: t };
  return { text: "Skipped", title: t };
}
function nn(e) {
  return /reason/i.test(e);
}
function ti(e, t) {
  return nn(e.key) || /(^|_)item(_key)?$/i.test(e.key) ? !0 : typeof t == "string" && tn(t);
}
function ni(e, t) {
  const n = Za(e.label || Ya(e.key));
  if (nn(e.key)) {
    const { text: a, title: f } = ei(String(t));
    return { label: n, value: a, title: f, icon: e.icon };
  }
  const { text: o, title: i } = Ja(Xa(e, t));
  return { label: n, value: o, title: i, icon: e.icon };
}
function Ne(e, t, n) {
  const o = t;
  if (!e || !o) return [];
  const i = [];
  for (const a of e) {
    if (!a?.key || Wa.has(a.key) || a.role === "subtitle") continue;
    const f = o[a.key];
    f == null || f === "" || a.hidden || a.hide_zero && f === 0 || ti(a, f) === n && i.push(ni(a, f));
  }
  return i;
}
function ct(e) {
  return String(e?.status || "").toLowerCase();
}
function oi(e) {
  return typeof e == "string" && /\b(completed|succeeded|successfully)\b/i.test(e);
}
function on(e) {
  const t = ct(e);
  return t === "completed" || t === "failed";
}
function dt(e) {
  const t = ct(e);
  return t === "failed" || t === "failing" ? !0 : !!e?.last_error && !oi(e.last_error);
}
function rn(e, t) {
  if (t?.code === "unavailable") return { tone: "error", text: "Its module is unavailable. Reinstall its module to use this automation." };
  const n = typeof e?.last_error == "string" ? e.last_error.trim() : "";
  return n ? dt(e) ? { tone: "error", text: n } : { tone: "success", text: n } : null;
}
function an(e, t, n, o) {
  if (o?.code === "unavailable") return { kind: "warn", label: "Unavailable" };
  const i = Va(n);
  if (i) return i;
  if (!e)
    return t ? { kind: "neutral", label: "…" } : { kind: "neutral", label: "Installed" };
  const a = ct(e);
  return dt(e) ? { kind: "warn", label: a === "failed" ? "Failed" : "Failing" } : a === "completed" ? { kind: "done", label: "Completed" } : a === "paused" || e.enabled === !1 ? { kind: "off", label: "Paused" } : a === "running" ? { kind: "live", label: "Running" } : { kind: "on", label: "Active" };
}
function sn(e) {
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
function ln(e, t) {
  const n = (e || []).find((i) => i?.role === "subtitle"), o = n ? t?.[n.key] : void 0;
  return typeof o == "string" ? o.trim() : "";
}
async function cn(e) {
  const t = [], n = /* @__PURE__ */ new Set();
  let o, i;
  do {
    const a = o ? `?page_token=${encodeURIComponent(o)}` : "", { data: f } = await de.get(`/api/v1/automations/${encodeURIComponent(e)}/status${a}`);
    if (!Ha(f)) throw new Error("Invalid automation status response");
    if (t.push(...f.drives), i = f.delivery_failures, o = f.next_page_token || void 0, o && n.has(o)) throw new Error("Automation status repeated a page token");
    o && n.add(o);
  } while (o);
  return { drives: t, delivery_failures: i };
}
const ri = ["aria-label"], ai = { class: "kx-drawer-head" }, ii = { class: "kx-ficon" }, si = { class: "kx-drawer-id" }, li = ["title"], ci = { class: "kx-drawer-sub" }, di = { class: "kx-drawer-controls" }, ui = {
  class: "kx-tabs",
  role: "tablist"
}, pi = ["aria-selected", "data-testid", "onClick"], bi = { class: "kx-drawer-body" }, fi = {
  key: 0,
  class: "kx-dsec"
}, gi = {
  key: 0,
  class: "kx-errcard",
  "data-testid": "drawer-error-card"
}, mi = { class: "kx-errcard-head" }, vi = { class: "kx-errcard-cause" }, hi = { class: "kx-dgrid" }, xi = { class: "kx-dfact-k" }, yi = { class: "kx-dfact-v" }, ki = {
  key: 1,
  class: "kx-dsub"
}, wi = { class: "kx-metrics" }, _i = { class: "kx-metric-k" }, $i = ["title"], Ci = {
  key: 1,
  class: "kx-dsec"
}, Si = {
  key: 0,
  class: "kx-dnote"
}, zi = {
  key: 1,
  class: "kx-dgrid"
}, Di = { class: "kx-dfact-k" }, Pi = ["title"], Ei = {
  key: 2,
  class: "kx-dsec",
  "data-testid": "drawer-config"
}, Ii = {
  key: 2,
  class: "kx-dnote"
}, Li = {
  key: 3,
  class: "kx-dsec"
}, Ai = { class: "kx-dgrid" }, Mi = { class: "kx-dfact" }, ji = { class: "kx-dfact-v" }, Ri = { class: "kx-dfact" }, Ti = { class: "kx-dfact-v" }, Oi = { class: "kx-dfact" }, Bi = { class: "kx-dfact-v" }, Fi = {
  key: 0,
  class: "kx-dsub"
}, Ni = /* @__PURE__ */ be({
  __name: "DetailDrawer",
  props: {
    automation: { default: () => ({ id: "" }) },
    type: {}
  },
  emits: ["close", "action", "recover", "changed"],
  setup(e, { emit: t }) {
    const n = e, o = t, i = O("overview"), a = [
      { id: "overview", label: "Overview", icon: "tabler:layout-dashboard" },
      { id: "state", label: "State", icon: "tabler:chart-dots" },
      { id: "config", label: "Config", icon: "tabler:settings" },
      { id: "activity", label: "Activity", icon: "tabler:history" }
    ], f = L(() => n.automation.title || n.automation.id), g = L(() => n.automation.icon || n.type?.icon || "tabler:bolt"), $ = L(() => n.type?.title || "Automation"), b = L(() => n.automation.public_state), x = L(() => Gt(n.type)), m = L(() => Jt(x.value)), h = L(() => x.value.declared.includes("status")), c = O(null);
    let v = 0;
    async function A(V) {
      const P = ++v;
      if (!V || !n.automation.drive_status || n.automation.availability) {
        c.value = null;
        return;
      }
      c.value = n.automation.drive_status;
      const S = await cn(V);
      P === v && n.automation.id === V && (c.value = S);
    }
    Be(() => [n.automation.id, n.automation.drive_status, n.automation.availability], ([V]) => {
      A(V).catch((P) => Fe.handleError("other", { message: String(P) }));
    }, { immediate: !0 });
    const K = L(() => an(b.value, h.value, c.value, n.automation.availability)), q = L(() => K.value.kind === "off"), re = L(() => on(b.value)), G = L(() => (x.value.declared.includes("pause") || x.value.declared.includes("resume")) && !re.value), I = L(() => dt(b.value)), H = L(() => Xt(x.value.declared)), C = L(() => {
      if (n.automation.availability) return rn(b.value, n.automation.availability)?.text || "";
      const V = Ka(c.value);
      if (V) return V;
      const P = typeof b.value?.last_error == "string" ? b.value.last_error.trim() : "";
      return I.value ? P : "";
    }), E = L(() => ln(n.type?.public_state_schema?.fields, b.value)), D = L(() => {
      const V = n.type?.public_state_schema?.fields;
      return [...Ne(V, b.value, !1), ...Ne(V, b.value, !0)];
    }), j = L(() => {
      const V = b.value, P = [];
      P.push({ label: "Status", value: K.value.label }), n.automation.availability || P.push({ label: "Enabled", value: q.value ? "Paused" : "Yes" }), E.value && P.push({ label: "When", value: E.value }), V?.last_run_at && P.push({ label: "Last run", value: ce(V.last_run_at, { future: !0 }) }), V?.next_run_at && P.push({ label: "Next run", value: ce(V.next_run_at, { future: !0 }) });
      for (const S of qa(c.value))
        P.push({ label: S.label, value: S.time ? ce(S.value, { future: !0 }) : S.value });
      return P;
    }), R = L(() => {
      const V = c.value?.drives.flatMap((S) => typeof S.last_round_at == "string" ? [S.last_round_at] : []) || [], P = c.value?.delivery_failures?.last_error?.at;
      return P && V.push(P), V.sort().at(-1) || b.value?.last_run_at;
    }), d = L(() => c.value?.delivery_failures), M = L(() => {
      const V = d.value?.last_error;
      return V ? `${V.code}: ${V.message}` : b.value?.last_error;
    }), B = L(() => lt(n.type)), ie = L(() => Wt(n.automation, n.type)), He = L(() => ({ location: qt(n.type) }));
    return Be(() => n.automation.id, () => {
      i.value = "overview";
    }), (V, P) => (s(), u(Y, null, [
      l("div", {
        class: "kx-drawer-scrim",
        onClick: P[0] || (P[0] = (S) => o("close"))
      }),
      l("aside", {
        class: "kx-drawer",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": f.value,
        "data-testid": "detail-drawer"
      }, [
        l("header", ai, [
          l("span", ii, [
            z(r(T), {
              icon: g.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("div", si, [
            l("div", {
              class: "kx-drawer-name",
              title: f.value
            }, y(f.value), 9, li),
            l("div", ci, y($.value), 1)
          ]),
          z(r(st), {
            severity: r(sn)(K.value.kind),
            class: "kx-badge kx-tag-sm"
          }, {
            default: N(() => [
              K.value.kind === "live" ? (s(), U(r(T), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : _("", !0),
              ae(" " + y(K.value.label), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          l("div", di, [
            G.value ? (s(), U(r(X), {
              key: 0,
              type: "button",
              severity: "secondary",
              outlined: "",
              size: "small",
              "aria-label": `${q.value ? "Resume" : "Pause"} ${f.value}`,
              title: q.value ? "Resume" : "Pause",
              disabled: !!e.automation.deleting_at,
              onClick: P[1] || (P[1] = (S) => !e.automation.deleting_at && o("action", q.value ? "resume" : "pause"))
            }, {
              icon: N(({ class: S }) => [
                z(r(T), {
                  icon: q.value ? "tabler:player-play-filled" : "tabler:player-pause",
                  "aria-hidden": "true",
                  class: W(S)
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["aria-label", "title", "disabled"])) : _("", !0),
            z(Qt, {
              items: m.value,
              name: f.value,
              disabled: !!e.automation.deleting_at,
              onSelect: P[2] || (P[2] = (S) => !e.automation.deleting_at && o("action", S))
            }, null, 8, ["items", "name", "disabled"]),
            z(r(X), {
              type: "button",
              severity: "secondary",
              text: "",
              size: "small",
              class: "kx-drawer-close",
              "aria-label": "Close details",
              title: "Close",
              onClick: P[3] || (P[3] = (S) => o("close"))
            }, {
              icon: N(({ class: S }) => [
                z(r(T), {
                  icon: "tabler:x",
                  "aria-hidden": "true",
                  class: W(S)
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        l("nav", ui, [
          (s(), u(Y, null, te(a, (S) => l("button", {
            key: S.id,
            type: "button",
            role: "tab",
            class: W(["kx-tab", i.value === S.id && "is-active"]),
            "aria-selected": i.value === S.id,
            "data-testid": `drawer-tab-${S.id}`,
            onClick: (ut) => i.value = S.id
          }, [
            z(r(T), {
              icon: S.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            ae(" " + y(S.label), 1)
          ], 10, pi)), 64))
        ]),
        l("div", bi, [
          i.value === "overview" ? (s(), u("section", fi, [
            C.value ? (s(), u("div", gi, [
              l("div", mi, [
                z(r(T), {
                  icon: "tabler:alert-circle",
                  "aria-hidden": "true"
                }),
                l("span", null, y(n.automation.availability ? "This automation is unavailable" : "This automation is failing"), 1)
              ]),
              l("p", vi, y(C.value), 1),
              H.value ? (s(), U(r(X), {
                key: 0,
                type: "button",
                size: "small",
                severity: "danger",
                "aria-label": `Recover ${f.value}`,
                "data-testid": "drawer-recover",
                label: "Recover",
                disabled: !!e.automation.deleting_at,
                onClick: P[4] || (P[4] = (S) => !e.automation.deleting_at && o("recover"))
              }, {
                icon: N(({ class: S }) => [
                  z(r(T), {
                    icon: "tabler:rotate-clockwise-2",
                    "aria-hidden": "true",
                    class: W(S)
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["aria-label", "disabled"])) : _("", !0)
            ])) : _("", !0),
            l("div", hi, [
              (s(!0), u(Y, null, te(j.value, (S) => (s(), u("div", {
                key: S.label,
                class: "kx-dfact"
              }, [
                l("span", xi, y(S.label), 1),
                l("strong", yi, y(S.value), 1)
              ]))), 128))
            ]),
            D.value.length ? (s(), u("div", ki, [
              P[9] || (P[9] = l("div", { class: "kx-dsub-lbl" }, "Progress", -1)),
              l("div", wi, [
                (s(!0), u(Y, null, te(D.value, (S) => (s(), u("span", {
                  key: S.label,
                  class: "kx-metric"
                }, [
                  S.icon ? (s(), U(r(T), {
                    key: 0,
                    icon: S.icon,
                    class: "kx-metric-i",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : _("", !0),
                  l("span", _i, y(S.label), 1),
                  l("span", {
                    class: "kx-metric-v",
                    title: S.title
                  }, y(S.value), 9, $i)
                ]))), 128))
              ])
            ])) : _("", !0)
          ])) : i.value === "state" ? (s(), u("section", Ci, [
            D.value.length ? (s(), u("div", zi, [
              (s(!0), u(Y, null, te(D.value, (S) => (s(), u("div", {
                key: S.label,
                class: "kx-dfact"
              }, [
                l("span", Di, y(S.label), 1),
                l("strong", {
                  class: "kx-dfact-v",
                  title: S.title
                }, y(S.value), 9, Pi)
              ]))), 128))
            ])) : (s(), u("div", Si, "This automation reports no additional state."))
          ])) : i.value === "config" ? (s(), u("section", Ei, [
            !e.automation.deleting_at && !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (s(), U(Re, {
              key: 0,
              tag: "wc-execution-identity-editor",
              attrs: { root: e.automation.id },
              onChange: P[5] || (P[5] = (S) => o("changed"))
            }, null, 8, ["attrs"])) : _("", !0),
            B.value && !e.automation.deleting_at ? (s(), U(Re, {
              key: 1,
              class: "kx-manage-host",
              tag: B.value,
              config: ie.value,
              meta: He.value,
              onChange: P[6] || (P[6] = (S) => o("changed")),
              onClose: P[7] || (P[7] = (S) => i.value = "overview")
            }, null, 8, ["tag", "config", "meta"])) : (s(), u("div", Ii, "This automation type declares no settings view."))
          ])) : (s(), u("section", Li, [
            l("div", Ai, [
              l("div", Mi, [
                P[10] || (P[10] = l("span", { class: "kx-dfact-k" }, "Last run", -1)),
                l("strong", ji, y(R.value ? r(ce)(R.value, { future: !0 }) : "Never"), 1)
              ]),
              l("div", Ri, [
                P[11] || (P[11] = l("span", { class: "kx-dfact-k" }, "Last outcome", -1)),
                l("strong", Ti, y(d.value?.count ? "Failed delivery" : b.value?.status || "—"), 1)
              ]),
              l("div", Oi, [
                P[12] || (P[12] = l("span", { class: "kx-dfact-k" }, "Failed deliveries", -1)),
                l("strong", Bi, y(d.value?.count ?? 0), 1)
              ])
            ]),
            typeof M.value == "string" && M.value.trim() ? (s(), u("div", Fi, [
              P[13] || (P[13] = l("div", { class: "kx-dsub-lbl" }, "Last message", -1)),
              l("p", {
                class: W(["kx-dmsg", I.value || d.value?.count ? "is-err" : "is-ok"])
              }, y(M.value), 3)
            ])) : _("", !0),
            !e.automation.availability && ((e.automation.access_level || 0) & 8) !== 0 ? (s(), U(Fa, {
              key: 1,
              root: e.automation.id,
              onError: P[8] || (P[8] = (S) => r(Fe).handleError("other", { message: S.message }))
            }, null, 8, ["root"])) : _("", !0)
          ]))
        ])
      ], 8, ri)
    ], 64));
  }
});
function Ui(e) {
  const t = O(!1), n = O(null), o = O({}), i = O(!1), a = O(!1), f = O(""), g = O(null), $ = O(null);
  let b = null;
  const x = O(""), m = L(() => e.types.value.filter(
    (d) => d.installable !== !1 && Object.entries(e.inputPreset.value).every(([M, B]) => {
      const ie = d.inputs?.properties?.[M];
      return !!ie && (!ie.enum || typeof B == "string" && ie.enum.includes(B));
    })
  )), h = L(() => !e.componentMode.value || !e.preferredTypeId.value || n.value?.id !== e.preferredTypeId.value), c = L(() => n.value ? oo(n.value).filter(([d]) => !(d in e.inputPreset.value)) : []), v = L(() => {
    const d = x.value.trim().toLowerCase();
    return d ? m.value.filter(
      (M) => (M.title || "").toLowerCase().includes(d) || (M.name || "").toLowerCase().includes(d) || rt(M).toLowerCase().includes(d)
    ) : m.value;
  });
  function A(d) {
    E(), x.value = "", n.value = d || null, o.value = d ? { ...ht(d), ...e.inputPreset.value } : {}, f.value = "", t.value = !0, Je(G);
  }
  function K(d) {
    E(), n.value = d, o.value = { ...ht(d), ...e.inputPreset.value }, f.value = "", Je(G);
  }
  function q() {
    E(), t.value = !1, n.value = null, o.value = {}, f.value = "", a.value = !1, e.createMode.value && e.emitHost("close", {});
  }
  function re() {
    !h.value || n.value || Je(() => $.value?.focus({ preventScroll: !0 }));
  }
  async function G() {
    const d = n.value, M = at(d);
    if (!(!M || !d || !g.value))
      try {
        if (await Jn(M, { timeoutMs: 8e3 }), n.value?.id !== d.id || !g.value) return;
        const B = document.createElement(M);
        B.setAttribute("type-id", d.id), B.setAttribute("input", JSON.stringify(e.inputPreset.value)), e.effectiveParentId.value && B.setAttribute("parent-id", e.effectiveParentId.value), B.setAttribute("embedded", "true"), B.addEventListener("automation-installed", C), B.addEventListener("submit-state", I), g.value.innerHTML = "", g.value.appendChild(B), b = B;
      } catch (B) {
        const ie = Ir(d);
        f.value = `Failed to load setup UI (${M}${ie ? ` at ${ie}` : ""}): ` + (B instanceof Error ? B.message : String(B));
      }
  }
  function I(d) {
    a.value = !!d.detail?.saving;
  }
  function H() {
    at(n.value) ? Lr(b) : R();
  }
  async function C(d) {
    const M = d.detail;
    if (M?.success === !1) {
      f.value = M?.error || "Could not create the automation.", a.value = !1;
      return;
    }
    if (e.createMode.value) {
      e.emitHost("created", { id: M?.id });
      return;
    }
    q(), await e.reload();
  }
  function E() {
    b && (b.removeEventListener("automation-installed", C), b.removeEventListener("submit-state", I), b.remove(), b = null), g.value && (g.value.innerHTML = "");
  }
  function D() {
    const d = e.preferredTypeId.value;
    return d ? m.value.find((M) => M.id === d) : void 0;
  }
  function j() {
    A(D());
  }
  async function R() {
    const d = n.value;
    if (!d) return;
    const M = ro(d, o.value);
    if (M) {
      f.value = M;
      return;
    }
    i.value = !0, f.value = "";
    try {
      const { data: B } = await de.post("/api/v1/automations", {
        type: d.id,
        input: ao(d, o.value),
        parent_id: e.effectiveParentId.value || void 0
      });
      if (B?.success) {
        if (e.createMode.value) {
          e.emitHost("created", { id: B.id });
          return;
        }
        q(), await e.reload();
      } else
        f.value = ee({ response: { data: B } }, "install failed");
    } catch (B) {
      f.value = ee(B, "install failed");
    } finally {
      i.value = !1;
    }
  }
  return {
    showTypeCatalog: h,
    installFields: c,
    showInstall: t,
    installType: n,
    installForm: o,
    installing: i,
    customSaving: a,
    installError: f,
    customInstallHost: g,
    installSearchInput: $,
    typeSearch: x,
    filteredTypes: v,
    openInstall: A,
    openPreferredInstall: j,
    chooseType: K,
    closeInstall: q,
    focusInstallDialog: re,
    onCreate: H,
    unmountCustomInstallUi: E
  };
}
function Hi({ automations: e, types: t, query: n, drawerId: o }) {
  const i = L(() => {
    const d = {};
    for (const M of t.value) d[M.id] = M;
    return d;
  }), a = L(() => {
    const d = n.value.trim().toLowerCase();
    return d ? e.value.filter(
      (M) => (M.title || "").toLowerCase().includes(d) || (M.description || "").toLowerCase().includes(d) || (M.type || "").toLowerCase().includes(d)
    ) : e.value;
  });
  function f(d) {
    return d.title || d.id;
  }
  function g(d) {
    return d.type ? i.value[d.type] : void 0;
  }
  function $(d) {
    return d.icon ? d.icon : g(d)?.icon || "tabler:bolt";
  }
  function b(d) {
    return Zt(g(d));
  }
  function x(d, M) {
    return b(d).has(M);
  }
  function m(d) {
    return Yt(b(d));
  }
  function h(d) {
    return Jt(Gt(g(d)));
  }
  function c(d) {
    return Xt(b(d));
  }
  function v(d) {
    return lt(g(d));
  }
  function A(d) {
    return qt(g(d));
  }
  function K(d) {
    return d ? Wt(d, g(d)) : {};
  }
  function q(d) {
    return d.public_state;
  }
  function re(d) {
    return Ne(g(d)?.public_state_schema?.fields, q(d), !1);
  }
  function G(d) {
    return Ne(g(d)?.public_state_schema?.fields, q(d), !0);
  }
  function I(d) {
    return on(q(d));
  }
  function H(d) {
    return rn(q(d), d.availability);
  }
  function C(d) {
    return an(q(d), x(d, "status"), d.drive_status, d.availability);
  }
  function E(d) {
    return C(d).kind === "off";
  }
  function D(d) {
    return ln(g(d)?.public_state_schema?.fields, q(d));
  }
  const j = L(() => e.value.find((d) => d.id === o.value) || null), R = L(() => j.value ? g(j.value) : void 0);
  return {
    typeById: i,
    filtered: a,
    pretty: f,
    typeFor: g,
    iconFor: $,
    declaredActions: b,
    hasAction: x,
    runNowFor: m,
    actionItemsFor: h,
    recoverFor: c,
    manageTag: v,
    manageLocation: A,
    manageConfig: K,
    statusFor: q,
    metrics: re,
    detailMetrics: G,
    isTerminal: I,
    rowMessage: H,
    statusOf: C,
    isPaused: E,
    subtitleLine: D,
    drawerAutomation: j,
    drawerType: R
  };
}
function Vi(e, t) {
  const n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
  let i = 0;
  const a = /* @__PURE__ */ new Map();
  function f(m, h) {
    const c = h.meta;
    e.value = e.value.map((v) => {
      if (v.id !== m) return v;
      const A = {
        ...v,
        public_state: { ...v.public_state || {}, ...c }
      };
      return typeof c.title == "string" && (A.title = c.title), typeof c.comment == "string" && (A.description = c.comment), A;
    }), g(m).catch((v) => Fe.handleError("other", { message: String(v) }));
  }
  async function g(m) {
    if (!e.value.some((v) => v.id === m && v.drive_status)) return;
    const h = Symbol(m);
    a.set(m, h);
    const c = await cn(m);
    a.get(m) === h && (a.delete(m), e.value = e.value.map((v) => v.id === m ? { ...v, drive_status: c } : v));
  }
  function $(m) {
    const h = {};
    for (const c of t(m)?.public_state_schema?.fields || [])
      c?.key && c.type && (h[c.key] = c.type);
    return h;
  }
  function b() {
    i++, o.clear(), a.clear();
    for (const m of n.values()) m();
    n.clear();
  }
  function x() {
    const m = new Set(e.value.map((c) => c.id).filter(Boolean));
    for (const [c, v] of n)
      m.has(c) || (v(), n.delete(c), a.delete(c));
    const h = i;
    for (const c of m) {
      if (n.has(c) || o.has(c)) continue;
      o.add(c);
      const v = e.value.find((K) => K.id === c), A = Uo(c, (K) => f(c, K), v ? $(v) : void 0);
      if (o.delete(c), !!A) {
        if (h !== i || !e.value.some((K) => K.id === c)) {
          A();
          continue;
        }
        n.set(c, A);
      }
    }
  }
  return { syncRealtimeSubscriptions: x, clearRealtimeSubscriptions: b, refreshDriveStatus: g };
}
function Ki({ automations: e, types: t, loading: n, error: o, parentId: i, syncRealtimeSubscriptions: a }) {
  async function f() {
    try {
      const { data: b } = await de.get("/api/v1/automations/types");
      t.value = b?.success ? b.types || [] : [];
    } catch {
      t.value = [];
    }
  }
  async function g() {
    n.value = !0, o.value = "";
    try {
      const { data: b } = await de.get("/api/v1/automations", { params: { class: "automation", parent_id: i() } });
      if (!b?.success) throw new Error(ee(b?.error, "failed to load automations"));
      e.value = b.automations || [], a();
    } catch (b) {
      a(), o.value = ee(b, "failed to load automations");
    } finally {
      n.value = !1;
    }
  }
  async function $() {
    await f(), await g();
  }
  return { fetchTypes: f, fetchAutomations: g, reload: $ };
}
function qi(e, t, n) {
  async function o(i) {
    e.value = i.id, t.value = "";
    try {
      const { data: a } = await de.get(`/api/v1/automations/${encodeURIComponent(i.id)}/export`);
      if (!a?.success || !a.artifact)
        throw new Error(a?.error?.message || a?.error || "Automation export failed.");
      const f = n(i).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "automation", g = new Blob([`${JSON.stringify(a.artifact, null, 2)}
`], { type: "application/json" }), $ = URL.createObjectURL(g), b = document.createElement("a");
      b.href = $, b.download = `${f}.automation.json`, document.body.appendChild(b), b.click(), b.remove(), URL.revokeObjectURL($);
    } catch (a) {
      t.value = ee(a, "Automation export failed.");
    } finally {
      e.value = "";
    }
  }
  return { exportAutomation: o };
}
const Wi = { class: "kx" }, Yi = {
  key: 0,
  class: "kx-head"
}, Zi = { class: "kx-head-icon" }, Gi = { class: "kx-head-actions" }, Xi = { class: "kx-count" }, Ji = { class: "kx-search" }, Qi = {
  key: 1,
  class: "kx-err"
}, es = {
  key: 2,
  class: "kx-body"
}, ts = {
  key: 0,
  class: "kx-loading"
}, ns = {
  key: 1,
  class: "kx-empty"
}, os = { class: "kx-empty-ico" }, rs = {
  key: 2,
  class: "kx-empty"
}, as = {
  key: 3,
  class: "kx-list"
}, is = ["aria-label", "onClick", "disabled"], ss = { class: "kx-ficon" }, ls = { class: "kx-id" }, cs = ["title"], ds = { class: "kx-sub" }, us = { key: 0 }, ps = { key: 1 }, bs = { key: 2 }, fs = { class: "kx-actions" }, gs = {
  key: 0,
  class: "kx-rowfoot"
}, ms = ["title"], vs = { class: "kx-modal-head-icon" }, hs = { class: "kx-modal-head-text" }, xs = { class: "kx-modal-head-title" }, ys = { class: "kx-modal-head-sub" }, ks = { class: "kx-modal-body" }, ws = { class: "kx-modal-head-icon" }, _s = { class: "kx-modal-head-text" }, $s = { class: "kx-modal-head-title" }, Cs = { class: "kx-modal-head-sub" }, Ss = { class: "kx-modal-body" }, zs = { class: "kx-modal-body" }, Ds = {
  key: 0,
  class: "kx-delopts"
}, Ps = ["onUpdate:modelValue"], Es = { class: "kx-delopt-copy" }, Is = { class: "kx-delopt-t" }, Ls = {
  key: 0,
  class: "kx-delopt-d"
}, As = /* @__PURE__ */ be({
  __name: "automations",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = O([]), o = O([]), i = O(!1), a = O(""), f = O(""), g = O(""), $ = /* @__PURE__ */ new Map(), b = O(""), x = O(""), m = Hi({ automations: n, types: o, query: f, drawerId: x }), {
      filtered: h,
      pretty: c,
      typeFor: v,
      iconFor: A,
      hasAction: K,
      actionItemsFor: q,
      recoverFor: re,
      manageTag: G,
      manageLocation: I,
      manageConfig: H,
      metrics: C,
      detailMetrics: E,
      isTerminal: D,
      rowMessage: j,
      statusOf: R,
      isPaused: d,
      subtitleLine: M,
      drawerAutomation: B,
      drawerType: ie
    } = m, He = Vi(n, v), { syncRealtimeSubscriptions: V, clearRealtimeSubscriptions: P, refreshDriveStatus: S } = He, ut = qi(b, a, c), { exportAutomation: dn } = ut, fe = Dn(), un = Pn(), he = L(() => fe.value?.mode === "create"), Ve = L(() => fe.value?.mode === "component"), pn = io(fe), pt = L(() => String(fe.value?.componentId || "").trim()), bn = L(() => String(fe.value?.typeId || "").trim()), fn = L(() => pt.value || pn.value), gn = Ki({
      automations: n,
      types: o,
      loading: i,
      error: a,
      parentId: () => pt.value || void 0,
      syncRealtimeSubscriptions: V
    }), { fetchAutomations: xe, reload: Ke } = gn, ye = Ui({
      types: o,
      createMode: he,
      componentMode: Ve,
      effectiveParentId: fn,
      preferredTypeId: bn,
      inputPreset: L(() => so(fe.value?.input)),
      emitHost: (k, w) => un(k, w),
      reload: () => Ke()
    }), se = O(null), Me = O({}), ke = O(!1), ne = O(null), ue = O(null);
    function mn(k) {
      ue.value = k;
    }
    function bt() {
      ue.value = null;
    }
    function vn(k) {
      const w = k?.id || "";
      return {
        resource_id: w,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(w)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(w)}`,
        title: k ? c(k) : ""
      };
    }
    function ft(k, w) {
      if (!k.deleting_at)
        switch (w) {
          case "reconfigure":
            Cn(k);
            break;
          case "share":
            mn(k);
            break;
          case "export":
            dn(k);
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
      const w = re(k);
      w && qe(k, w);
    }
    function hn(k) {
      x.value = k.id, xe();
    }
    function xn() {
      x.value = "";
    }
    function yn(k) {
      const w = B.value;
      w && ft(w, k);
    }
    function kn() {
      const k = B.value;
      k && gt(k);
    }
    async function qe(k, w) {
      if (k.deleting_at || g.value) return;
      g.value = k.id, a.value = "";
      const p = v(k)?.controls?.some((oe) => oe.name === w) === !0, Z = `${k.id}:${w}`, mt = p ? $.get(Z) || crypto.randomUUID() : "";
      p && $.set(Z, mt);
      try {
        const { data: oe } = await de.post(
          `/api/v1/automations/${k.id}/actions/${w}`,
          p ? { request_id: mt } : {}
        );
        if (!oe?.success) {
          a.value = ee({ response: { data: oe } }, `${w} failed`);
          return;
        }
        if (p && oe.result?.state === "succeeded" && $.delete(Z), oe.result && typeof oe.result == "object") {
          const { success: Ge, ...zn } = oe.result;
          k.public_state = { ...k.public_state || {}, ...zn };
        }
        if (k.drive_status?.drives?.length)
          await S(k.id);
        else if (w === "pause" || w === "resume") {
          const Ge = typeof oe.result?.paused == "boolean" ? oe.result.paused : w === "pause";
          k.public_state = {
            ...k.public_state || {},
            enabled: !Ge,
            status: oe.result?.status || (Ge ? "paused" : "active")
          };
        }
      } catch (oe) {
        a.value = ee(oe, `${w} failed`);
      } finally {
        g.value = "";
      }
    }
    async function wn(k) {
      await qe(k, d(k) ? "resume" : "pause");
    }
    function We(k) {
      se.value = k;
      const w = v(k), p = {};
      for (const Z of w?.delete_options || []) p[Z.key] = !!Z.default;
      Me.value = p;
    }
    function Ye(k) {
      return k ? v(k)?.delete_options || [] : [];
    }
    function _n(k) {
      ne.value = null, We(k);
    }
    async function $n() {
      const k = se.value;
      if (k) {
        ke.value = !0, a.value = "";
        try {
          const p = Ye(k).length ? { options: { ...Me.value } } : {}, { data: Z } = await de.delete(`/api/v1/automations/${k.id}`, { data: p });
          Z?.success ? (Sn(k.id, Z), se.value = null, await xe()) : a.value = ee({ response: { data: Z } }, "failed to delete automation");
        } catch (w) {
          a.value = ee(w, "failed to delete automation");
        } finally {
          ke.value = !1;
        }
      }
    }
    function Cn(k) {
      G(k) && (ne.value = k);
    }
    async function Ze(k = !0) {
      ne.value = null, k && await Ke();
    }
    En(async () => {
      try {
        await Ke(), he.value && ye.openPreferredInstall();
      } catch (k) {
        a.value = ee(k, "host API unavailable");
      }
    }), it(() => {
      ye.unmountCustomInstallUi(), P();
    });
    const { acceptDeletion: Sn } = Ho(n, (k) => k.id);
    return (k, w) => (s(), u("div", Wi, [
      he.value ? _("", !0) : (s(), u("header", Yi, [
        Ve.value ? _("", !0) : (s(), u(Y, { key: 0 }, [
          l("div", Zi, [
            z(r(T), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          w[10] || (w[10] = l("div", { class: "kx-head-text" }, [
            l("h1", { class: "kx-head-title" }, "Automations"),
            l("p", { class: "kx-head-sub" }, "Scheduled and event-driven jobs that run on their own.")
          ], -1))
        ], 64)),
        l("div", Gi, [
          l("span", Xi, y(n.value.length) + " automation" + y(n.value.length !== 1 ? "s" : ""), 1),
          l("div", Ji, [
            z(r(T), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            pe(l("input", {
              "onUpdate:modelValue": w[0] || (w[0] = (p) => f.value = p),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search automations…"
            }, null, 512), [
              [tt, f.value]
            ])
          ]),
          z(r(X), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: w[1] || (w[1] = (p) => r(ye).openPreferredInstall())
          }, {
            icon: N(({ class: p }) => [
              z(r(T), {
                icon: "tabler:plus",
                class: W(p),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ])),
      !he.value && a.value ? (s(), u("div", Qi, y(a.value), 1)) : _("", !0),
      he.value ? _("", !0) : (s(), u("div", es, [
        i.value && !n.value.length ? (s(), u("div", ts, [
          z(r(T), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          w[11] || (w[11] = ae(" Loading… ", -1))
        ])) : n.value.length ? r(h).length ? (s(), u("div", as, [
          (s(!0), u(Y, null, te(r(h), (p) => (s(), u("div", {
            key: p.id,
            class: W(["kx-row", x.value === p.id && "is-open"])
          }, [
            l("button", {
              type: "button",
              class: "kx-open",
              "aria-label": `Open ${r(c)(p)} details`,
              onClick: (Z) => !p.deleting_at && hn(p),
              disabled: !!p.deleting_at
            }, [
              l("span", ss, [
                z(r(T), {
                  icon: r(A)(p),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              l("span", ls, [
                l("span", {
                  class: "kx-name",
                  title: r(c)(p)
                }, y(r(c)(p)), 9, cs),
                l("span", ds, [
                  l("span", null, y(r(v)(p)?.title || "Automation"), 1),
                  r(M)(p) ? (s(), u("span", us, " · " + y(r(M)(p)), 1)) : _("", !0),
                  r($e)(p.drive_status).last ? (s(), u("span", ps, " · last ran " + y(r(ce)(r($e)(p.drive_status).last, { future: !0 })), 1)) : _("", !0),
                  r($e)(p.drive_status).next ? (s(), u("span", bs, " · next " + y(r(ce)(r($e)(p.drive_status).next, { future: !0 })), 1)) : _("", !0)
                ])
              ])
            ], 8, is),
            z(r(st), {
              severity: r(sn)(r(R)(p).kind),
              class: "kx-badge kx-tag-sm"
            }, {
              default: N(() => [
                r(R)(p).kind === "live" ? (s(), U(r(T), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : _("", !0),
                ae(" " + y(r(R)(p).label), 1)
              ]),
              _: 2
            }, 1032, ["severity"]),
            l("div", fs, [
              (r(K)(p, "pause") || r(K)(p, "resume")) && !r(D)(p) ? (s(), U(r(X), {
                key: 0,
                type: "button",
                severity: "secondary",
                outlined: "",
                size: "small",
                disabled: !!p.deleting_at || g.value === p.id,
                "aria-label": `${r(d)(p) ? "Resume" : "Pause"} ${r(c)(p)}`,
                title: r(d)(p) ? "Resume" : "Pause",
                onClick: (Z) => wn(p)
              }, {
                icon: N(({ class: Z }) => [
                  z(r(T), {
                    icon: r(d)(p) ? "tabler:player-play-filled" : "tabler:player-pause",
                    "aria-hidden": "true",
                    class: W(Z)
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["disabled", "aria-label", "title", "onClick"])) : _("", !0),
              z(Qt, {
                items: r(q)(p),
                name: r(c)(p),
                busy: !!p.deleting_at || g.value === p.id,
                onSelect: (Z) => ft(p, Z)
              }, null, 8, ["items", "name", "busy", "onSelect"])
            ]),
            p.deleting_at || r(j)(p) || r(E)(p).length || r(C)(p).length ? (s(), u("div", gs, [
              z(To, {
                state: p,
                onRetry: (Z) => We(p)
              }, null, 8, ["state", "onRetry"]),
              r(j)(p) ? (s(), u("div", {
                key: 0,
                class: W(["kx-rowmsg", `kx-rowmsg-${r(j)(p)?.tone}`])
              }, [
                z(r(T), {
                  icon: r(j)(p)?.tone === "error" ? "tabler:alert-circle" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                l("span", {
                  class: "kx-rowmsg-txt",
                  title: r(j)(p)?.text
                }, y(r(j)(p)?.text), 9, ms),
                r(j)(p)?.tone === "error" && r(re)(p) ? (s(), U(r(X), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  text: "",
                  size: "small",
                  class: "kx-recover",
                  "data-testid": "row-recover",
                  "aria-label": `Recover ${r(c)(p)}`,
                  disabled: !!p.deleting_at || g.value === p.id,
                  label: "Recover",
                  onClick: (Z) => gt(p)
                }, {
                  icon: N(({ class: Z }) => [
                    z(r(T), {
                      icon: "tabler:rotate-clockwise-2",
                      "aria-hidden": "true",
                      class: W(Z)
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])) : _("", !0)
              ], 2)) : _("", !0),
              z(ba, {
                face: r(C)(p),
                detail: r(E)(p)
              }, null, 8, ["face", "detail"])
            ])) : _("", !0)
          ], 2))), 128))
        ])) : (s(), u("div", rs, [...w[14] || (w[14] = [
          l("div", { class: "kx-empty-title" }, "No matches", -1),
          l("div", { class: "kx-empty-sub" }, "No automations match the current search.", -1)
        ])])) : (s(), u("div", ns, [
          l("div", os, [
            z(r(T), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          w[12] || (w[12] = l("div", { class: "kx-empty-title" }, "No automations yet", -1)),
          w[13] || (w[13] = l("div", { class: "kx-empty-sub" }, "Choose an automation type to get started.", -1)),
          z(r(X), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: w[2] || (w[2] = (p) => r(ye).openPreferredInstall())
          }, {
            icon: N(({ class: p }) => [
              z(r(T), {
                icon: "tabler:plus",
                class: W(p),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ])),
      r(B) ? (s(), U(Ni, {
        key: 3,
        automation: r(B),
        type: r(ie),
        onClose: xn,
        onAction: yn,
        onRecover: kn,
        onChanged: r(xe)
      }, null, 8, ["automation", "type", "onChanged"])) : _("", !0),
      z(aa, {
        flow: r(ye),
        "component-mode": Ve.value,
        "dialog-pt": t
      }, null, 8, ["flow", "component-mode"]),
      ne.value ? (s(), U(r(Ce), {
        key: 4,
        visible: !!ne.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: t,
        class: "kx-modal kx-modal-manage",
        "aria-label": r(c)(ne.value),
        "onUpdate:visible": w[6] || (w[6] = (p) => {
          p || Ze(!1);
        })
      }, {
        header: N(() => [
          l("span", vs, [
            z(r(T), {
              icon: r(A)(ne.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("span", hs, [
            l("span", xs, y(r(c)(ne.value)), 1),
            l("span", ys, y(r(v)(ne.value)?.title || "Automation"), 1)
          ])
        ]),
        footer: N(() => [
          z(r(X), {
            type: "button",
            class: "kx-foot-delete",
            severity: "danger",
            outlined: "",
            label: "Delete",
            onClick: w[5] || (w[5] = (p) => _n(ne.value))
          }, {
            icon: N(({ class: p }) => [
              z(r(T), {
                icon: "tabler:trash",
                "aria-hidden": "true",
                class: W(p)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]),
        default: N(() => [
          l("div", ks, [
            z(Re, {
              class: "kx-manage-host",
              tag: r(G)(ne.value),
              config: r(H)(ne.value),
              meta: { location: r(I)(ne.value) },
              onCreated: w[3] || (w[3] = (p) => Ze(!0)),
              onClose: w[4] || (w[4] = (p) => Ze(!0)),
              onChange: r(xe)
            }, null, 8, ["tag", "config", "meta", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : _("", !0),
      ue.value ? (s(), U(r(Ce), {
        key: 5,
        visible: !!ue.value,
        modal: "",
        pt: t,
        class: "kx-modal",
        "aria-label": `Share ${r(c)(ue.value)}`,
        "onUpdate:visible": w[7] || (w[7] = (p) => {
          p || bt();
        })
      }, {
        header: N(() => [
          l("span", ws, [
            z(r(T), {
              icon: "tabler:users",
              "aria-hidden": "true"
            })
          ]),
          l("span", _s, [
            l("span", $s, "Share " + y(r(c)(ue.value)), 1),
            l("span", Cs, y(r(v)(ue.value)?.title || "Automation"), 1)
          ])
        ]),
        default: N(() => [
          l("div", Ss, [
            z(Re, {
              class: "kx-manage-host",
              tag: "kickside-share",
              config: vn(ue.value),
              onClose: bt,
              onChange: r(xe)
            }, null, 8, ["config", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : _("", !0),
      se.value ? (s(), U(r(Ce), {
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
        footer: N(() => [
          z(r(X), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: ke.value,
            onClick: w[8] || (w[8] = (p) => se.value = null)
          }, null, 8, ["disabled"]),
          z(r(X), {
            type: "button",
            "data-testid": "automations-confirm-delete",
            severity: "danger",
            label: "Delete",
            loading: ke.value,
            disabled: ke.value,
            onClick: $n
          }, {
            icon: N(({ class: p }) => [
              z(r(T), {
                icon: "tabler:trash",
                class: W(p),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: N(() => [
          l("div", zs, [
            l("p", null, [
              w[15] || (w[15] = ae(" Delete ", -1)),
              l("strong", null, y(r(c)(se.value)), 1),
              w[16] || (w[16] = ae("? It will stop running and its setup will be removed. This can't be undone. ", -1))
            ]),
            Ye(se.value).length ? (s(), u("div", Ds, [
              (s(!0), u(Y, null, te(Ye(se.value), (p) => (s(), u("label", {
                key: p.key,
                class: "kx-delopt"
              }, [
                pe(l("input", {
                  "onUpdate:modelValue": (Z) => Me.value[p.key] = Z,
                  type: "checkbox"
                }, null, 8, Ps), [
                  [jt, Me.value[p.key]]
                ]),
                l("span", Es, [
                  l("span", Is, y(p.title || p.key), 1),
                  p.description ? (s(), u("span", Ls, y(p.description), 1)) : _("", !0)
                ])
              ]))), 128))
            ])) : _("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"])) : _("", !0)
    ]));
  }
}), Ms = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-modal-head-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-modal-head-icon svg{width:20px;height:20px}.kx-modal-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-modal-head-title{font-size:15.5px;font-weight:700;color:var(--p-text-color);line-height:1.2}.kx-modal-head-sub{font-size:12.5px;font-weight:400;color:var(--p-text-muted-color);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{--kx-modal-shadow: var(--kx-shadow-lg);display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.kx-head-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-count{font-size:12.5px;color:var(--p-text-muted-color);display:inline-flex;align-items:center;gap:5px}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{height:34px;width:220px;max-width:40vw;padding:0 10px 0 30px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.kx-body{flex:1 0 auto;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-list{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden;background:var(--p-content-background);max-width:1100px}.kx-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"main status actions" "foot foot   foot";align-items:center;column-gap:14px;row-gap:6px;padding:10px 14px;border-bottom:1px solid var(--p-content-border-color)}.kx-row:last-child{border-bottom:none}.kx-row.is-open{background:var(--kx-wash-primary)}.kx-row:hover{background:var(--kx-overlay-subtle)}.kx-row.is-open:hover{background:var(--kx-wash-primary)}.kx-open{grid-area:main;display:flex;align-items:center;gap:12px;min-width:0;padding:0;margin:0;border:none;background:transparent;text-align:left;font:inherit;color:inherit;cursor:pointer}.kx-ficon{width:38px;height:38px;flex:none;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--kx-wash-primary);color:var(--p-primary-color)}.kx-ficon svg{width:20px;height:20px}.kx-id{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}.kx-name{display:block;font-size:14px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-sub{display:block;font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-open:focus-visible{outline:none}.kx-open:focus-visible .kx-name{text-decoration:underline;text-underline-offset:2px;text-decoration-color:var(--p-primary-color)}.kx-rowfoot{grid-area:foot;padding-left:50px;display:flex;flex-direction:column;gap:4px;min-width:0}.kx-rowfoot:empty{display:none}.kx-rowmsg{font-size:11.5px;display:flex;align-items:center;gap:5px;min-width:0}.kx-rowmsg-txt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-rowmsg svg{width:13px;height:13px;flex:none}.kx-rowmsg-error{color:var(--p-danger-600, var(--p-danger-500))}.kx-rowmsg-success{color:var(--p-success-600, var(--p-success-500))}.kx-recover{flex:none;margin-left:2px}.kx-badge{grid-area:status;border:1px solid color-mix(in srgb,currentColor 28%,transparent)}.kx-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}.kx-badge:has(svg):before{display:none}.kx-actions{grid-area:actions;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;min-width:0}.kx-actions .is-active{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 38%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-admin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}.kx-admin-item{min-width:0;padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:10px;background:var(--p-content-background)}.kx-admin-item>span{display:block;margin-bottom:4px;color:var(--p-text-muted-color);font-size:10.5px;font-weight:700;letter-spacing:.055em;text-transform:uppercase}.kx-admin-item strong{display:block;overflow:hidden;color:var(--p-text-color);font-size:12.5px;text-overflow:ellipsis;white-space:nowrap}.kx-admin-item strong em{color:var(--p-text-muted-color);font-size:11px;font-style:normal;font-weight:600}.kx-admin-item code{display:block;margin-top:4px;overflow:hidden;color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;text-overflow:ellipsis;white-space:nowrap}.kx-admin-item a{display:inline-block;margin-top:4px;color:var(--p-primary-color);font-size:11px;font-weight:650;text-decoration:none}.kx-admin-item a:hover{text-decoration:underline}@media(max-width:560px){.kx-row{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"main   actions" "status status" "foot   foot";align-items:center;row-gap:8px}.kx-badge{justify-self:start}.kx-rowfoot{padding-left:0}}@media(max-width:640px){.kx-admin-grid{grid-template-columns:1fr}}.kx-modal{--p-dialog-content-padding: 0;max-width:calc(100vw - 32px);max-height:90vh}.kx-modal>.kx-dialog-header{padding:16px 18px;border-bottom:1px solid var(--p-content-border-color);gap:10px}.kx-modal>.kx-dialog-content{padding:0;display:flex;flex-direction:column;min-height:0;overflow:hidden}.kx-modal>.kx-dialog-footer{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.kx-2p-r-body>*{animation:kx-pane-fade .28s ease both}@keyframes kx-pane-fade{0%{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){.kx-2p-r-body>*{animation:none}}.kx-modal-body{padding:18px;font-size:13.5px;line-height:1.5;color:var(--p-text-color);overflow-y:auto}.kx-modal-body p{margin:0 0 10px}.kx-modal-body p:last-child{margin-bottom:0}.kx-form{display:flex;flex-direction:column;gap:14px}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-req{color:var(--p-danger-500)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-select{width:100%;min-width:0}.kx-check,.kx-delopt input{appearance:none;-webkit-appearance:none;width:18px;height:18px;margin:0;flex:none;display:grid;place-content:center;border:1px solid var(--p-content-border-color);border-radius:8px;background:var(--p-content-background);cursor:pointer;transition:border-color .15s,background-color .15s,box-shadow .15s,opacity .15s}.kx-check:before,.kx-delopt input:before{content:"";width:5px;height:9px;border:solid var(--p-button-primary-color);border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);transform-origin:center;transition:transform .12s ease-out}.kx-check:checked,.kx-delopt input:checked{border-color:var(--p-primary-color);background:var(--p-primary-color)}.kx-check:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset)}.kx-check:checked:before,.kx-delopt input:checked:before{transform:rotate(45deg) scale(1)}.kx-check:disabled,.kx-delopt input:disabled{opacity:.55;cursor:not-allowed}.kx-field-hint{font-size:11px;line-height:1.3;color:var(--p-text-muted-color);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.kx-custom-host{min-height:180px;width:100%}.kx-custom-host>*{display:block;width:100%}.kx-delopts{display:flex;flex-direction:column;gap:10px;margin-top:14px}.kx-delopt{display:flex;align-items:flex-start;gap:10px;cursor:pointer}.kx-delopt input{margin-top:2px}.kx-delopt-copy{min-width:0;display:flex;flex-direction:column;gap:2px}.kx-delopt-t{display:block;font-size:13px;font-weight:600;color:var(--p-text-color)}.kx-delopt-d{display:block;font-size:11.5px;line-height:1.35;color:var(--p-text-muted-color)}.kx-modal-2p{width:min(880px,calc(100vw - 40px));max-width:100%}.kx-modal-solo{width:min(620px,calc(100vw - 40px));max-width:100%}.kx-modal-manage{width:min(760px,calc(100vw - 40px));max-width:100%}.kx-manage-host{display:block;min-height:180px}.kx-2p{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);min-height:0;flex:1;overflow:hidden}.kx-2p-solo{grid-template-columns:minmax(0,1fr)}.kx-2p-solo .kx-2p-r-body{padding-top:16px}.kx-2p-l{padding:16px;overflow-y:auto;border-right:1px solid var(--p-content-border-color);display:flex;flex-direction:column;gap:10px}.kx-2p-r{display:flex;flex-direction:column;min-width:0;min-height:0;background:color-mix(in srgb,var(--p-text-color) 2.5%,var(--p-content-background))}.kx-2p-r-head{padding:14px 18px 10px;font-size:12.5px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-2p-r-body{padding:0 18px 18px;overflow-y:auto;flex:1;min-height:0}.kx-2p-r-note{margin:0;font-size:12.5px;color:var(--p-text-muted-color)}.kx-foot-err{order:-1;flex:1 0 100%;margin:0;max-width:none}.kx-foot-err+.p-button{margin-left:auto}.kx-foot-delete{margin-right:auto}.kx-cat-search{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;flex:none;border:1px solid var(--p-content-border-color);border-radius:8px;color:var(--p-text-muted-color)}.kx-cat-search svg{width:15px;height:15px;flex:none}.kx-cat-search input{flex:1;border:none;background:transparent;outline:none;font:inherit;font-size:13px;color:var(--p-text-color)}.kx-cat{display:flex;flex-direction:column;gap:6px}.kx-cat-card{display:flex;align-items:center;gap:11px;text-align:left;width:100%;padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:14px;background:transparent;color:var(--p-text-color);cursor:pointer;transition:border-color .14s,background .14s}.kx-cat-card:hover{background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.kx-cat-card.sel{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 9%,transparent)}.kx-cat-ico{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.kx-cat-ico svg{width:18px;height:18px}.kx-cat-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-cat-name{font-size:13px;font-weight:600}.kx-cat-desc{font-size:11px;line-height:1.3;color:var(--p-text-muted-color);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.kx-cat-check{width:17px;height:17px;flex:none;color:var(--p-primary-color);visibility:hidden}.kx-cat-card.sel .kx-cat-check{visibility:visible}.kx-cat-empty{font-size:12.5px;color:var(--p-text-muted-color);padding:4px 2px}@media(max-width:760px){.kx-modal-2p{width:560px}.kx-2p{grid-template-columns:1fr}.kx-2p-l{border-right:none;border-bottom:1px solid var(--p-content-border-color)}}.kx-flow{display:flex;flex-direction:column;gap:14px;padding:6px 0 0}.kx-pipe,.kx-stage{display:flex;flex-direction:column;gap:8px}.kx-stage-mid{background:transparent}.kx-stage-head{display:flex;align-items:center;gap:8px}.kx-stage-ico{width:26px;height:26px;border-radius:11px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-stage-ico svg{width:15px;height:15px}.kx-stage-lbl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-stage-cfg{margin-top:2px}.kx-stage-badges{display:flex;flex-wrap:wrap;gap:6px}.kx-stage-desc{margin:0;font-size:12px;line-height:1.4;color:var(--p-text-muted-color)}.kx-stage-opts{display:flex;flex-direction:column;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-opts-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-pipe-conn{display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 0;color:var(--p-text-muted-color);font-size:11px}.kx-pipe-conn svg{width:16px;height:16px}.kx-runopts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.kx-detect{display:flex;align-items:center;gap:6px;font-size:11.5px;line-height:1.35;padding:7px 9px;border-radius:8px;color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 10%,transparent)}.kx-detect svg{width:14px;height:14px;flex:none}.kx-detect-warn{color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-flow-enable{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--p-text-muted-color);cursor:pointer}.kx-flow-enable input{width:16px;height:16px;accent-color:var(--p-primary-color)}.kx-textarea{height:auto;min-height:72px;padding:8px 10px;line-height:1.4;resize:vertical}.kx-wcmount{width:100%}.kx-wcmount>div{display:block;width:100%}.kx-metrics{display:flex;flex-wrap:wrap;gap:5px 6px;margin-top:5px;min-width:0}.kx-metric{display:inline-flex;align-items:center;gap:5px;max-width:100%;font-size:11.5px;line-height:1.6;padding:2px 9px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 6%,transparent);color:var(--p-text-color)}.kx-metric-i{width:13px;height:13px;color:var(--p-text-muted-color);flex:none}.kx-metric-k{color:var(--p-text-muted-color);font-weight:600;flex:none}.kx-metric-v{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-metric-details{margin-top:5px}.kx-metric-more{display:inline-flex;align-items:center;gap:4px;cursor:pointer;list-style:none;font-size:11.5px;font-weight:600;color:var(--p-text-muted-color);user-select:none}.kx-metric-more::-webkit-details-marker{display:none}.kx-metric-more:before{content:"";width:0;height:0;border-left:4px solid currentColor;border-top:3px solid transparent;border-bottom:3px solid transparent;transition:transform .15s;flex:none}.kx-metric-details[open] .kx-metric-more:before{transform:rotate(90deg)}.kx-metric-more:hover{color:var(--p-text-color)}.kx-metrics-detail{margin-top:4px}@media(prefers-reduced-motion:reduce){.kx-modal{transition:none}}.kx-cat-search:focus-within{border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-cat-search input:focus{box-shadow:none}.kx-cat-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-menu{position:relative;display:inline-flex}.kx-menu-trigger.is-active{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 38%,var(--p-content-border-color));background:var(--kx-wash-primary)}.kx-menu-panel{display:flex;flex-direction:column;gap:1px;padding:6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-14);background:var(--p-content-background);box-shadow:var(--kx-shadow-lg);max-height:min(70vh,460px);overflow-y:auto}.kx-menu-group{padding:8px 10px 4px;font-size:9.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-menu-group.is-first{padding-top:4px}.kx-menu-sep{height:1px;margin:5px 6px;background:var(--p-content-border-color)}.kx-menu-item{display:flex;align-items:flex-start;gap:10px;width:100%;padding:8px 10px;text-align:left;border:none;border-radius:var(--kx-radius-10);background:transparent;color:var(--p-text-color);cursor:pointer;transition:background .12s}.kx-menu-item:hover,.kx-menu-item:focus-visible{background:var(--kx-overlay-hover);outline:none}.kx-menu-item:disabled{opacity:.5;cursor:not-allowed}.kx-menu-item-ico{width:17px;height:17px;flex:none;margin-top:1px;color:var(--p-text-muted-color)}.kx-menu-item-body{display:flex;flex-direction:column;gap:1px;min-width:0}.kx-menu-item-label{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600}.kx-menu-item-desc{font-size:11px;line-height:1.35;color:var(--p-text-muted-color)}.kx-menu-item-warn{width:12px;height:12px;color:var(--p-warn-600, var(--p-warn-500))}.kx-menu-item.is-warn .kx-menu-item-ico{color:var(--p-warn-600, var(--p-warn-500))}.kx-menu-item.is-danger .kx-menu-item-ico{color:var(--p-danger-600, var(--p-danger-500))}.kx-menu-item.is-danger:hover,.kx-menu-item.is-danger:focus-visible{background:var(--kx-wash-danger)}.kx-menu-item.is-danger .kx-menu-item-label{color:var(--p-danger-600, var(--p-danger-500))}.kx-drawer-scrim{position:fixed;inset:0;z-index:60;background:color-mix(in srgb,var(--p-text-color) 40%,transparent);animation:kx-fade .18s ease both}.kx-drawer{position:fixed;top:0;right:0;height:100%;width:min(468px,100vw);z-index:61;display:flex;flex-direction:column;min-height:0;background:var(--p-content-background);border-left:1px solid var(--p-content-border-color);box-shadow:var(--kx-shadow-lg);animation:kx-slide-in .22s cubic-bezier(.22,.61,.36,1) both}@keyframes kx-fade{0%{opacity:0}to{opacity:1}}@keyframes kx-slide-in{0%{transform:translate(24px);opacity:0}to{transform:none;opacity:1}}@media(prefers-reduced-motion:reduce){.kx-drawer,.kx-drawer-scrim{animation:none}}.kx-drawer-head{display:flex;align-items:center;gap:11px;padding:16px 16px 14px;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-drawer-id{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px}.kx-drawer-name{font-size:15px;font-weight:700;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-drawer-sub{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-drawer-controls{display:flex;align-items:center;gap:6px;flex:none}.kx-drawer .kx-badge{flex:none}.kx-tabs{display:flex;gap:2px;padding:6px 12px 0;border-bottom:1px solid var(--p-content-border-color);flex:none}.kx-tab{display:inline-flex;align-items:center;gap:6px;padding:8px 12px 10px;margin-bottom:-1px;border:none;border-bottom:2px solid transparent;background:transparent;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;color:var(--p-text-muted-color);transition:color .12s}.kx-tab svg{width:15px;height:15px}.kx-tab:hover{color:var(--p-text-color)}.kx-tab.is-active{color:var(--p-primary-color);border-bottom-color:var(--p-primary-color)}.kx-tab:focus-visible{outline:none;color:var(--p-primary-color)}.kx-drawer-body{flex:1;min-height:0;overflow-y:auto;padding:16px}.kx-dsec{display:flex;flex-direction:column;gap:16px}.kx-dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.kx-dfact{padding:10px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-surface-1);min-width:0}.kx-dfact-k{display:block;margin-bottom:4px;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-dfact-v{display:block;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-dsub{display:flex;flex-direction:column;gap:8px}.kx-dsub-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-dnote{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--p-text-muted-color);padding:4px 0}.kx-dnote-err{color:var(--p-danger-600, var(--p-danger-500))}.kx-dsec-foot{padding-top:4px}.kx-dmsg{margin:0;font-size:12.5px;line-height:1.5;padding:10px 12px;border-radius:var(--kx-radius-10);background:var(--kx-surface-1);color:var(--p-text-color);word-break:break-word}.kx-dmsg.is-err{background:var(--kx-wash-danger);color:var(--p-danger-700, var(--p-danger-600, var(--p-danger-500)))}.kx-dmsg.is-ok{background:var(--kx-wash-success);color:var(--p-success-700, var(--p-success-600, var(--p-success-500)))}.kx-errcard{display:flex;flex-direction:column;gap:9px;padding:13px 14px;border:1px solid color-mix(in srgb,var(--p-danger-500) 40%,var(--p-content-border-color));border-radius:var(--kx-radius-14);background:var(--kx-wash-danger)}.kx-errcard-head{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--p-danger-700, var(--p-danger-600, var(--p-danger-500)))}.kx-errcard-head svg{width:17px;height:17px;flex:none}.kx-errcard-cause{margin:0;font-size:12.5px;line-height:1.5;color:var(--p-text-color);word-break:break-word}.kx-errcard .p-button{align-self:flex-start}.kx-hint{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:var(--kx-radius-10);background:var(--kx-wash-info);font-size:12px;line-height:1.45;color:var(--p-text-color)}.kx-hint svg{width:16px;height:16px;flex:none;margin-top:1px;color:var(--p-info-600, var(--p-info-500))}', js = { props: { type: "object", properties: { mode: { type: "string", default: "", description: '"create" when mounted as the workspace "+" -> Automation create view: opens straight into the install popup and emits created/close. Unset renders the full Automations page.' }, "parent-id": { type: "string", default: "", description: "Workspace folder to place the new automation under (create mode; empty = root)." }, "component-id": { type: "string", default: "", description: "Optional owning component; scopes rows and places newly created Automations under that component." }, input: { type: "string", default: "", description: "Initial declared install inputs as a JSON object, supplied by the owning component." }, "type-id": { type: "string", default: "", description: "Optional registry automation type id to preselect in create or component mode. The manager treats the id opaquely and mounts that type's declared create view." } } } }, Rs = {
  wippy: js
};
class Ts extends In {
  static get wippyConfig() {
    return {
      propsSchema: Rs.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ms
    };
  }
  static get vueConfig() {
    return { rootComponent: As, plugins: [Vn] };
  }
}
Qn(import.meta.url, Ts);
//# sourceMappingURL=index.js.map
