import { B as xt, b as Ie, s as Ae, c as jt, f as kt, R as Le, d as Me, L as Dn, e as yt, v as Ct, g as zn, U as En, I as he, h as In, r as Re, i as An, j as Ln, k as Mn, C as Rn, m as jn, S as Tn, _ as Bn, x as Jt, n as On, u as Fn, a as Nn, o as Un, P as Hn } from "./wc-runtime-CFU5M_Nd.js";
import { openBlock as l, createElementBlock as c, mergeProps as T, renderSlot as Q, createTextVNode as at, toDisplayString as C, resolveComponent as Ot, resolveDirective as je, withDirectives as ct, createBlock as N, resolveDynamicComponent as Ft, withCtx as O, createCommentVNode as $, normalizeClass as V, createElementVNode as u, defineComponent as ft, computed as A, withModifiers as Qt, Fragment as K, createVNode as D, unref as r, watch as Nt, onBeforeUnmount as le, Transition as Vn, isRef as Kn, vModelText as ne, renderList as rt, vModelCheckbox as Te, vModelDynamic as qn, ref as M, nextTick as te } from "vue";
import { s as Wn, a as Yn, b as Zn } from "./index-BSqkwqpC.js";
import { on as Be, api as bt, host as oe, loadByTagName as Gn } from "@wippy-fe/proxy";
import { Icon as R } from "@iconify/vue";
import { e as ot, _ as Ut } from "./WcMount.vue_vue_type_script_setup_true_lang-DeFg3QZK.js";
import { a as Xn, e as Jn, b as Qn, f as to, d as ye, v as eo, c as no, u as oo, i as ro } from "./install-form-6s2z0ljk.js";
import { _ as ao } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
import { r as io } from "./principals-Bury5BH3.js";
var so = `
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
`, lo = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Ae(n.value) && String(n.value).length === 1,
      "p-badge-dot": Ie(n.value) && !o.$slots.default,
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
}, uo = xt.extend({
  name: "badge",
  style: so,
  classes: lo
}), co = {
  name: "BaseBadge",
  extends: jt,
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
  style: uo,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function zt(t) {
  "@babel/helpers - typeof";
  return zt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, zt(t);
}
function ke(t, e, n) {
  return (e = bo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function bo(t) {
  var e = po(t, "string");
  return zt(e) == "symbol" ? e : e + "";
}
function po(t, e) {
  if (zt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (zt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Oe = {
  name: "Badge",
  extends: co,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return kt(ke(ke({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, fo = ["data-p"];
function mo(t, e, n, o, i, a) {
  return l(), c("span", T({
    class: t.cx("root"),
    "data-p": a.dataP
  }, t.ptmi("root")), [Q(t.$slots, "default", {}, function() {
    return [at(C(t.value), 1)];
  })], 16, fo);
}
Oe.render = mo;
var go = `
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
function Et(t) {
  "@babel/helpers - typeof";
  return Et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Et(t);
}
function lt(t, e, n) {
  return (e = vo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function vo(t) {
  var e = ho(t, "string");
  return Et(e) == "symbol" ? e : e + "";
}
function ho(t, e) {
  if (Et(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Et(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var yo = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", lt(lt(lt(lt(lt(lt(lt(lt(lt({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", lt({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, ko = xt.extend({
  name: "button",
  style: go,
  classes: yo
}), xo = {
  name: "BaseButton",
  extends: jt,
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
  style: ko,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function It(t) {
  "@babel/helpers - typeof";
  return It = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, It(t);
}
function J(t, e, n) {
  return (e = _o(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function _o(t) {
  var e = wo(t, "string");
  return It(e) == "symbol" ? e : e + "";
}
function wo(t, e) {
  if (It(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (It(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var G = {
  name: "Button",
  extends: xo,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
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
      return Ie(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return kt(J(J(J(J(J(J(J(J(J(J({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return kt(J(J({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return kt(J(J({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Wn,
    Badge: Oe
  },
  directives: {
    ripple: Le
  }
}, $o = ["data-p"], Co = ["data-p"];
function So(t, e, n, o, i, a) {
  var f = Ot("SpinnerIcon"), g = Ot("Badge"), x = je("ripple");
  return t.asChild ? Q(t.$slots, "default", {
    key: 1,
    class: V(t.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : ct((l(), N(Ft(t.as), T({
    key: 0,
    class: t.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: O(function() {
      return [Q(t.$slots, "default", {}, function() {
        return [t.loading ? Q(t.$slots, "loadingicon", T({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (l(), c("span", T({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (l(), N(f, T({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : Q(t.$slots, "icon", T({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (l(), c("span", T({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": a.dataIconP
          }, t.ptm("icon")), null, 16, $o)) : $("", !0)];
        }), t.label ? (l(), c("span", T({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": a.dataLabelP
        }), C(t.label), 17, Co)) : $("", !0), t.badge ? (l(), N(g, {
          key: 3,
          value: t.badge,
          class: V(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : $("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[x]]);
}
G.render = So;
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
`, Do = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, zo = xt.extend({
  name: "progressspinner",
  style: Po,
  classes: Do
}), Eo = {
  name: "BaseProgressSpinner",
  extends: jt,
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
  style: zo,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Fe = {
  name: "ProgressSpinner",
  extends: Eo,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Io = ["fill", "stroke-width"];
function Ao(t, e, n, o, i, a) {
  return l(), c("div", T({
    class: t.cx("root"),
    role: "progressbar"
  }, t.ptmi("root")), [(l(), c("svg", T({
    class: t.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, t.ptm("spin")), [u("circle", T({
    class: t.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: t.fill,
    "stroke-width": t.strokeWidth,
    strokeMiterlimit: "10"
  }, t.ptm("circle")), null, 16, Io)], 16))], 16);
}
Fe.render = Ao;
const Lo = { key: 0 }, Mo = /* @__PURE__ */ ft({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(t) {
    const e = t, n = A(() => e.state.deletion_job === null || ["dead", "cancelled"].includes(e.state.deletion_job?.status || ""));
    return (o, i) => t.state.deleting_at ? (l(), c("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: i[1] || (i[1] = Qt(() => {
      }, ["stop"])),
      onKeydown: i[2] || (i[2] = Qt(() => {
      }, ["stop"]))
    }, [
      n.value ? (l(), c(K, { key: 0 }, [
        u("span", null, [
          i[3] || (i[3] = at("Deletion failed", -1)),
          t.state.deletion_job?.last_error ? (l(), c("span", Lo, ": " + C(t.state.deletion_job.last_error), 1)) : $("", !0)
        ]),
        D(r(G), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: i[0] || (i[0] = Qt((a) => o.$emit("retry"), ["stop"]))
        })
      ], 64)) : (l(), c(K, { key: 1 }, [
        D(r(Fe), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        i[4] || (i[4] = u("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : $("", !0);
  }
});
function St(t) {
  return !!t && typeof t == "object" && !Array.isArray(t);
}
function Ro(t, e) {
  if (e == null) return e;
  switch (t) {
    case "boolean":
    case "checkbox":
      return typeof e == "boolean" ? e : e === "true" ? !0 : e === "false" ? !1 : e;
    case "number":
    case "integer": {
      if (typeof e == "number") return e;
      if (typeof e == "string" && e.trim() !== "") {
        const n = Number(e);
        if (!Number.isNaN(n)) return n;
      }
      return e;
    }
    case "object":
    case "array":
      if (typeof e == "string")
        try {
          const n = JSON.parse(e);
          if (n && typeof n == "object") return n;
        } catch {
        }
      return e;
    default:
      return e;
  }
}
function jo(t, e) {
  if (!e) return t;
  const n = {};
  for (const [o, i] of Object.entries(t))
    n[o] = Ro(e[o], i);
  return n;
}
function Ne(t, e, n) {
  if (e !== void 0 && !e) return null;
  const o = St(t) ? t : {}, i = [
    o,
    St(o.data) ? o.data : null,
    St(o.payload) ? o.payload : null,
    St(o.detail) ? o.detail : null
  ].filter(Boolean);
  for (const a of i) {
    if (a.event !== "component.meta.changed" && a.event !== "component.deleting" && a.event !== "component.deleted") continue;
    const f = String(a.component_id || ""), g = String(o.topic || a.topic || "");
    if (e === void 0) {
      if (!f && (!g.startsWith("component.") || g === "component.")) continue;
    } else if (f && f !== e || !f && g !== `component.${e}`) continue;
    const x = f || e || g.slice(10);
    return a.event === "component.deleting" && typeof a.deletion_job_id == "string" && a.deletion_job_id ? { event: a.event, component_id: x, deletion_job_id: a.deletion_job_id } : a.event !== "component.meta.changed" ? { event: a.event, component_id: x } : {
      event: "component.meta.changed",
      component_id: x,
      meta: jo(St(a.meta) ? a.meta : {}, n),
      deleted: Array.isArray(a.deleted) ? a.deleted.map(String) : []
    };
  }
  return null;
}
function To(t, e, n) {
  const o = Ne(t, e, n);
  return o?.event === "component.meta.changed" ? o : null;
}
function Bo(t, e) {
  const n = Ne(t, e);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function Oo(t, e, n) {
  if (!t) return null;
  const o = Be(`component.${t}`, (i) => {
    const a = To(i, t, n);
    a && e(a);
  });
  return typeof o == "function" ? o : null;
}
function Fo(t, e, n, o) {
  const i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
  function f(p, h) {
    const v = t.value.find((F) => e(F) === p), m = a.get(p), d = h?.job_id || m?.state.deletion_job_id || v?.deletion_job_id, S = m ? m.state.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((m || v?.deleting_at) && d === S || d && m?.superseded.has(d)) return;
    const P = {
      deleting_at: m?.state.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: d
    }, H = new Set(m?.superseded);
    for (const F of [m?.state.deletion_job_id, v?.deletion_job_id])
      F && F !== d && H.add(F);
    a.set(p, { state: P, superseded: H }), v && (Object.assign(v, P), v.deletion_job = void 0);
  }
  const g = Nt(() => t.value, (p, h = []) => {
    const v = p.filter((m) => !i.has(e(m)));
    for (const m of h)
      i.has(e(m)) || v.some((d) => e(d) === e(m)) || m.deleting_at && o?.(e(m));
    if (v.length !== p.length) {
      t.value = v;
      return;
    }
    for (const m of p) {
      m.deleting_at && m.deletion_job === void 0 && !h.includes(m) && (m.deletion_job = null);
      const d = a.get(e(m));
      if (d) {
        const P = m.deletion_job_id;
        m.deleting_at && P && P !== d.state.deletion_job_id && !d.superseded.has(P) && (d.state.deletion_job_id && d.superseded.add(d.state.deletion_job_id), d.state.deletion_job_id = P), P !== d.state.deletion_job_id && (m.deletion_job = void 0), Object.assign(m, d.state);
      }
      const S = h.find((P) => e(P) === e(m));
      m.deletion_job === void 0 && S?.deletion_job_id === m.deletion_job_id && (m.deletion_job = S?.deletion_job);
    }
  }, { immediate: !0 }), x = Be("@message", (p) => {
    const h = Bo(p);
    if (!h) return;
    const v = t.value.find((m) => e(m) === h.component_id);
    h.event === "component.deleted" ? (v && !i.has(h.component_id) && o?.(h.component_id), i.add(h.component_id), a.delete(h.component_id), t.value = t.value.filter((m) => e(m) !== h.component_id)) : v && f(h.component_id, { job_id: h.deletion_job_id });
  });
  return le(() => {
    g(), typeof x == "function" && x();
  }), { acceptDeletion: f };
}
var Ue = {
  name: "WindowMaximizeIcon",
  extends: Me
};
function No(t) {
  return Ko(t) || Vo(t) || Ho(t) || Uo();
}
function Uo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ho(t, e) {
  if (t) {
    if (typeof t == "string") return re(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? re(t, e) : void 0;
  }
}
function Vo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ko(t) {
  if (Array.isArray(t)) return re(t);
}
function re(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function qo(t, e, n, o, i, a) {
  return l(), c("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), No(e[0] || (e[0] = [u("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ue.render = qo;
var He = {
  name: "WindowMinimizeIcon",
  extends: Me
};
function Wo(t) {
  return Xo(t) || Go(t) || Zo(t) || Yo();
}
function Yo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zo(t, e) {
  if (t) {
    if (typeof t == "string") return ae(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ae(t, e) : void 0;
  }
}
function Go(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Xo(t) {
  if (Array.isArray(t)) return ae(t);
}
function ae(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Jo(t, e, n, o, i, a) {
  return l(), c("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Wo(e[0] || (e[0] = [u("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
He.render = Jo;
var Qo = xt.extend({
  name: "focustrap-directive"
}), tr = zn.extend({
  style: Qo
});
function At(t) {
  "@babel/helpers - typeof";
  return At = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, At(t);
}
function xe(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function _e(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? xe(Object(n), !0).forEach(function(o) {
      er(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : xe(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function er(t, e, n) {
  return (e = nr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function nr(t) {
  var e = or(t, "string");
  return At(e) == "symbol" ? e : e + "";
}
function or(t, e) {
  if (At(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (At(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var rr = tr.extend("focustrap", {
  mounted: function(e, n) {
    var o = n.value || {}, i = o.disabled;
    i || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var o = n.value || {}, i = o.disabled;
    i && this.unbind(e);
  },
  unmounted: function(e) {
    this.unbind(e);
  },
  methods: {
    getComputedSelector: function(e) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(e ?? "");
    },
    bind: function(e, n) {
      var o = this, i = n.value || {}, a = i.onFocusIn, f = i.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(g) {
        g.forEach(function(x) {
          if (x.type === "childList" && !e.contains(document.activeElement)) {
            var p = function(v) {
              var m = he(v) ? he(v, o.getComputedSelector(e.$_pfocustrap_focusableselector)) ? v : Ct(e, o.getComputedSelector(e.$_pfocustrap_focusableselector)) : Ct(v);
              return Ae(m) ? m : v.nextSibling && p(v.nextSibling);
            };
            yt(p(x.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(g) {
        return a && a(g);
      }, e.$_pfocustrap_focusoutlistener = function(g) {
        return f && f(g);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: _e(_e({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var o = n.value || {}, i = o.autoFocusSelector, a = i === void 0 ? "" : i, f = o.firstFocusableSelector, g = f === void 0 ? "" : f, x = o.autoFocus, p = x === void 0 ? !1 : x, h = Ct(e, "[autofocus]".concat(this.getComputedSelector(a)));
      p && !h && (h = Ct(e, this.getComputedSelector(g))), yt(h);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, i = e.relatedTarget, a = i === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Ct(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      yt(a);
    },
    onLastHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, i = e.relatedTarget, a = i === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Dn(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      yt(a);
    },
    createHiddenFocusableElements: function(e, n) {
      var o = this, i = n.value || {}, a = i.tabIndex, f = a === void 0 ? 0 : a, g = i.firstFocusableSelector, x = g === void 0 ? "" : g, p = i.lastFocusableSelector, h = p === void 0 ? "" : p, v = function(P) {
        return En("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: f,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: P?.bind(o)
        });
      }, m = v(this.onFirstHiddenElementFocus), d = v(this.onLastHiddenElementFocus);
      m.$_pfocustrap_lasthiddenfocusableelement = d, m.$_pfocustrap_focusableselector = x, m.setAttribute("data-pc-section", "firstfocusableelement"), d.$_pfocustrap_firsthiddenfocusableelement = m, d.$_pfocustrap_focusableselector = h, d.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(m), e.append(d);
    }
  }
});
function we() {
  An({
    variableName: Re("scrollbar.width").name
  });
}
function $e() {
  In({
    variableName: Re("scrollbar.width").name
  });
}
var ar = `
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
`, ir = {
  mask: function(e) {
    var n = e.position, o = e.modal;
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
}, sr = {
  mask: function(e) {
    var n = e.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], i = o.find(function(a) {
      return a === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, i ? "p-dialog-".concat(i) : ""];
  },
  root: function(e) {
    var n = e.props, o = e.instance;
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
}, lr = xt.extend({
  name: "dialog",
  style: ar,
  classes: sr,
  inlineStyles: ir
}), ur = {
  name: "BaseDialog",
  extends: jt,
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
  style: lr,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Dt = {
  name: "Dialog",
  extends: ur,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: A(function() {
        return e._instance;
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && Jt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && Jt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && On(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), yt(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && Jt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(e) {
      this.maskMouseDownTarget = e.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var e = function(i) {
        return i && i.querySelector("[autofocus]");
      }, n = this.$slots.footer && e(this.footerContainer);
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && yt(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? we() : $e());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && we();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && $e();
    },
    onKeyDown: function(e) {
      e.code === "Escape" && this.closeOnEscape && !e.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(e) {
      this.container = e;
    },
    maskRef: function(e) {
      this.mask = e;
    },
    contentRef: function(e) {
      this.content = e;
    },
    headerContainerRef: function(e) {
      this.headerContainer = e;
    },
    footerContainerRef: function(e) {
      this.footerContainer = e;
    },
    maximizableRef: function(e) {
      this.maximizableButton = e ? e.$el : void 0;
    },
    closeButtonRef: function(e) {
      this.closeButton = e ? e.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var e;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Bn(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
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
    initDrag: function(e) {
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Tn(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", e));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var e = this;
      this.documentDragListener = function(n) {
        if (e.dragging) {
          var o = Mn(e.container), i = Rn(e.container), a = n.pageX - e.lastPageX, f = n.pageY - e.lastPageY, g = e.container.getBoundingClientRect(), x = g.left + a, p = g.top + f, h = jn(), v = getComputedStyle(e.container), m = parseFloat(v.marginLeft), d = parseFloat(v.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (x >= e.minX && x + o < h.width && (e.lastPageX = n.pageX, e.container.style.left = x - m + "px"), p >= e.minY && p + i < h.height && (e.lastPageY = n.pageY, e.container.style.top = p - d + "px")) : (e.lastPageX = n.pageX, e.container.style.left = x - m + "px", e.lastPageY = n.pageY, e.container.style.top = p - d + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var e = this;
      this.documentDragEndListener = function(n) {
        e.dragging && (e.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !e.isUnstyled && (document.body.style["user-select"] = ""), e.$emit("dragend", n));
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
      return kt({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Le,
    focustrap: rr
  },
  components: {
    Button: G,
    Portal: Ln,
    WindowMinimizeIcon: He,
    WindowMaximizeIcon: Ue,
    TimesIcon: Yn
  }
};
function Lt(t) {
  "@babel/helpers - typeof";
  return Lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Lt(t);
}
function Ce(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Se(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ce(Object(n), !0).forEach(function(o) {
      dr(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ce(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function dr(t, e, n) {
  return (e = cr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function cr(t) {
  var e = br(t, "string");
  return Lt(e) == "symbol" ? e : e + "";
}
function br(t, e) {
  if (Lt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Lt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var pr = ["data-p"], fr = ["aria-labelledby", "aria-modal", "data-p"], mr = ["id"], gr = ["data-p"];
function vr(t, e, n, o, i, a) {
  var f = Ot("Button"), g = Ot("Portal"), x = je("focustrap");
  return l(), N(g, {
    appendTo: t.appendTo
  }, {
    default: O(function() {
      return [i.containerVisible ? (l(), c("div", T({
        key: 0,
        ref: a.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return a.onMaskMouseDown && a.onMaskMouseDown.apply(a, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return a.onMaskMouseUp && a.onMaskMouseUp.apply(a, arguments);
        }),
        "data-p": a.dataP
      }, t.ptm("mask")), [D(Vn, T({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: O(function() {
          return [t.visible ? ct((l(), c("div", T({
            key: 0,
            ref: a.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": a.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": a.dataP
          }, t.ptmi("root")), [t.$slots.container ? Q(t.$slots, "container", {
            key: 0,
            closeCallback: a.close,
            maximizeCallback: function(h) {
              return a.maximize(h);
            },
            initDragCallback: a.initDrag
          }) : (l(), c(K, {
            key: 1
          }, [t.showHeader ? (l(), c("div", T({
            key: 0,
            ref: a.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, t.ptm("header")), [Q(t.$slots, "header", {
            class: V(t.cx("title"))
          }, function() {
            return [t.header ? (l(), c("span", T({
              key: 0,
              id: a.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), C(t.header), 17, mr)) : $("", !0)];
          }), u("div", T({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? Q(t.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(h) {
              return a.maximize(h);
            }
          }, function() {
            return [D(f, T({
              ref: a.maximizableRef,
              autofocus: i.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: a.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: O(function(p) {
                return [Q(t.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(l(), N(Ft(a.maximizeIconComponent), T({
                    class: [p.class, i.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : $("", !0), t.closable ? Q(t.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [D(f, T({
              ref: a.closeButtonRef,
              autofocus: i.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: a.close,
              "aria-label": a.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: O(function(p) {
                return [Q(t.$slots, "closeicon", {}, function() {
                  return [(l(), N(Ft(t.closeIcon ? "span" : "TimesIcon"), T({
                    class: [t.closeIcon, p.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : $("", !0)], 16)], 16)) : $("", !0), u("div", T({
            ref: a.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": a.dataP
          }, Se(Se({}, t.contentProps), t.ptm("content"))), [Q(t.$slots, "default")], 16, gr), t.footer || t.$slots.footer ? (l(), c("div", T({
            key: 1,
            ref: a.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [Q(t.$slots, "footer", {}, function() {
            return [at(C(t.footer), 1)];
          })], 16)) : $("", !0)], 64))], 16, fr)), [[x, {
            disabled: !t.modal
          }]]) : $("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, pr)) : $("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Dt.render = vr;
var hr = `
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
  root: function(e) {
    var n = e.props;
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
}, kr = xt.extend({
  name: "tag",
  style: hr,
  classes: yr
}), xr = {
  name: "BaseTag",
  extends: jt,
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
function Mt(t) {
  "@babel/helpers - typeof";
  return Mt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Mt(t);
}
function _r(t, e, n) {
  return (e = wr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function wr(t) {
  var e = $r(t, "string");
  return Mt(e) == "symbol" ? e : e + "";
}
function $r(t, e) {
  if (Mt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Mt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ue = {
  name: "Tag",
  extends: xr,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return kt(_r({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Cr = ["data-p"];
function Sr(t, e, n, o, i, a) {
  return l(), c("span", T({
    class: t.cx("root"),
    "data-p": a.dataP
  }, t.ptmi("root")), [t.$slots.icon ? (l(), N(Ft(t.$slots.icon), T({
    key: 0,
    class: t.cx("icon")
  }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (l(), c("span", T({
    key: 1,
    class: [t.cx("icon"), t.icon]
  }, t.ptm("icon")), null, 16)) : $("", !0), t.value != null || t.$slots.default ? Q(t.$slots, "default", {
    key: 2
  }, function() {
    return [u("span", T({
      class: t.cx("label")
    }, t.ptm("label")), C(t.value), 17)];
  }) : $("", !0)], 16, Cr);
}
ue.render = Sr;
function Pr(t) {
  if (!t) return null;
  let e;
  if (typeof t == "number")
    e = t;
  else {
    const n = t.trim();
    if (/^\d+$/.test(n))
      e = Number(n);
    else {
      const o = Date.parse(n);
      return Number.isNaN(o) ? null : o;
    }
  }
  return Number.isFinite(e) ? e < 1e12 ? e * 1e3 : e : null;
}
function pt(t, e) {
  const n = Pr(t);
  if (n === null) return "";
  const o = e?.now ?? Date.now(), i = e?.suffix ?? !0, a = e?.maxUnit ?? "day", f = e?.future ?? !1, g = 6e4, x = 60 * g, p = 24 * x, h = 30 * p, v = 365 * p, m = o - n;
  if (f && m < 0) {
    const P = -m;
    return P < g ? "in <1m" : P < x ? `in ${Math.floor(P / g)}m` : P < p ? `in ${Math.floor(P / x)}h` : `in ${Math.floor(P / p)}d`;
  }
  const d = Math.max(0, m);
  if (d < g) return "just now";
  const S = i ? " ago" : "";
  return d < x ? `${Math.floor(d / g)}m${S}` : d < p ? `${Math.floor(d / x)}h${S}` : a === "year" ? d < h ? `${Math.floor(d / p)}d${S}` : d < v ? `${Math.floor(d / h)}mo${S}` : `${Math.floor(d / v)}y${S}` : `${Math.floor(d / p)}d${S}`;
}
function ie(t) {
  return String(t.description || "").trim();
}
function Ve(t) {
  const e = t?.tag_name;
  return typeof e == "string" ? e.trim() : "";
}
function Ke(t) {
  const e = typeof t?.base_path == "string" ? t.base_path.trim() : "", n = typeof t?.entry_point == "string" ? t.entry_point.trim() : "";
  return e && n ? `/${e}/${n}` : typeof t?.url == "string" ? t.url.trim() : "";
}
function se(t) {
  return Ve(t?.component?.create_ui);
}
function Dr(t) {
  return Ke(t?.component?.create_ui);
}
function de(t) {
  return Ve(t?.component?.manage_ui);
}
function qe(t) {
  return Ke(t?.component?.manage_ui);
}
function We(t, e) {
  return { id: t.id, automation: t, public_state: t.public_state || {}, type: e };
}
let Pe = 0;
function zr(t) {
  t && (Pe += 1, t.setAttribute("submit-nonce", String(Pe)));
}
const Er = { class: "kx-modal-head-icon" }, Ir = { class: "kx-modal-head-text" }, Ar = { class: "kx-modal-head-title" }, Lr = {
  key: 0,
  class: "kx-2p-l"
}, Mr = { class: "kx-cat-search" }, Rr = {
  key: 0,
  class: "kx-cat-empty"
}, jr = {
  key: 1,
  class: "kx-cat"
}, Tr = ["onClick"], Br = { class: "kx-cat-ico" }, Or = { class: "kx-cat-text" }, Fr = { class: "kx-cat-name" }, Nr = {
  key: 0,
  class: "kx-cat-desc"
}, Ur = { class: "kx-2p-r" }, Hr = {
  key: 0,
  class: "kx-2p-r-head"
}, Vr = { class: "kx-2p-r-body" }, Kr = {
  key: 0,
  class: "kx-2p-r-note"
}, qr = {
  key: 1,
  class: "kx-2p-r-note"
}, Wr = {
  key: 2,
  class: "kx-form"
}, Yr = { class: "kx-field-lbl" }, Zr = {
  key: 0,
  class: "kx-req",
  "aria-hidden": "true"
}, Gr = ["onUpdate:modelValue"], Xr = ["onUpdate:modelValue"], Jr = ["onUpdate:modelValue", "type", "placeholder"], Qr = {
  key: 4,
  class: "kx-field-hint"
}, ta = {
  key: 5,
  class: "kx-field-hint"
}, ea = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, na = /* @__PURE__ */ ft({
  __name: "InstallDialog",
  props: {
    flow: {},
    componentMode: { type: Boolean },
    dialogPt: {}
  },
  setup(t) {
    const e = t, {
      showTypeCatalog: n,
      installFields: o,
      showInstall: i,
      installType: a,
      installForm: f,
      installing: g,
      customSaving: x,
      installError: p,
      customInstallHost: h,
      installSearchInput: v,
      typeSearch: m,
      filteredTypes: d,
      chooseType: S,
      closeInstall: P,
      focusInstallDialog: H,
      onCreate: F
    } = e.flow;
    return (nt, Y) => (l(), N(r(Dt), {
      visible: r(i),
      modal: !0,
      "block-scroll": !0,
      "dismissable-mask": !0,
      pt: t.dialogPt,
      class: V(["kx-modal kx-modal-2p", { "kx-modal-solo": !r(n) }]),
      "aria-label": "Add an automation",
      "onUpdate:visible": Y[1] || (Y[1] = (L) => {
        L || r(P)();
      }),
      onShow: r(H)
    }, {
      header: O(() => [
        u("span", Er, [
          D(r(R), {
            icon: r(a) && r(a).icon || "tabler:bolt",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        u("span", Ir, [
          u("span", Ar, C(r(a) ? r(a).title || r(a).name : "Add an automation"), 1),
          Y[2] || (Y[2] = u("span", { class: "kx-modal-head-sub" }, "Configure an automation.", -1))
        ])
      ]),
      footer: O(() => [
        r(p) ? (l(), c("div", ea, C(r(p)), 1)) : $("", !0),
        D(r(G), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: r(g) || r(x),
          onClick: r(P)
        }, null, 8, ["disabled", "onClick"]),
        r(a) ? (l(), N(r(G), {
          key: 1,
          type: "button",
          "data-testid": "automations-install-create",
          label: r(g) || r(x) ? "Creating…" : "Create",
          loading: r(g) || r(x),
          disabled: r(g) || r(x),
          onClick: r(F)
        }, {
          icon: O(({ class: L }) => [
            D(r(R), {
              icon: "tabler:plus",
              class: V(L),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["label", "loading", "disabled", "onClick"])) : $("", !0)
      ]),
      default: O(() => [
        u("div", {
          class: V(["kx-2p", { "kx-2p-solo": !r(n) }])
        }, [
          r(n) ? (l(), c("div", Lr, [
            u("div", Mr, [
              D(r(R), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              ct(u("input", {
                ref_key: "installSearchInput",
                ref: v,
                "onUpdate:modelValue": Y[0] || (Y[0] = (L) => Kn(m) ? m.value = L : null),
                "data-modal-initial": "",
                type: "text",
                placeholder: "Search types…",
                "aria-label": "Search automation types"
              }, null, 512), [
                [ne, r(m)]
              ])
            ]),
            r(d).length ? (l(), c("div", jr, [
              (l(!0), c(K, null, rt(r(d), (L) => (l(), c("button", {
                key: L.id,
                class: V(["kx-cat-card", r(a)?.id === L.id && "sel"]),
                onClick: (j) => r(S)(L)
              }, [
                u("span", Br, [
                  D(r(R), {
                    icon: L.icon || "tabler:sparkles",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                u("span", Or, [
                  u("span", Fr, C(L.title || L.name), 1),
                  r(ie)(L) ? (l(), c("span", Nr, C(r(ie)(L)), 1)) : $("", !0)
                ]),
                D(r(R), {
                  icon: "tabler:check",
                  class: "kx-cat-check",
                  "aria-hidden": "true"
                })
              ], 10, Tr))), 128))
            ])) : (l(), c("div", Rr, "No setups match “" + C(r(m)) + "”.", 1))
          ])) : $("", !0),
          u("div", Ur, [
            r(n) ? (l(), c("div", Hr, "Setup")) : $("", !0),
            u("div", Vr, [
              r(a) ? (l(), c(K, { key: 1 }, [
                r(se)(r(a)) ? (l(), c("div", {
                  key: 0,
                  ref_key: "customInstallHost",
                  ref: h,
                  class: "kx-custom-host"
                }, null, 512)) : r(o).length ? (l(), c("div", Wr, [
                  (l(!0), c(K, null, rt(r(o), ([L, j]) => (l(), c("label", {
                    key: L,
                    class: "kx-field"
                  }, [
                    u("span", Yr, [
                      at(C(j.title || L) + " ", 1),
                      r(Xn)(r(a), L) ? (l(), c("span", Zr, "*")) : $("", !0)
                    ]),
                    j.enum ? (l(), N(r(Zn), {
                      key: 0,
                      class: "kx-select",
                      "model-value": r(f)[L],
                      options: r(Jn)(r(a), L, j),
                      "option-label": "label",
                      "option-value": "value",
                      placeholder: "—",
                      "aria-label": j.title || L,
                      "onUpdate:modelValue": (q) => r(f)[L] = q
                    }, null, 8, ["model-value", "options", "aria-label", "onUpdate:modelValue"])) : j.type === "boolean" ? ct((l(), c("input", {
                      key: 1,
                      "onUpdate:modelValue": (q) => r(f)[L] = q,
                      class: "kx-check",
                      type: "checkbox"
                    }, null, 8, Gr)), [
                      [Te, r(f)[L]]
                    ]) : j.type === "number" || j.type === "integer" ? ct((l(), c("input", {
                      key: 2,
                      "onUpdate:modelValue": (q) => r(f)[L] = q,
                      class: "kx-input",
                      type: "number"
                    }, null, 8, Xr)), [
                      [
                        ne,
                        r(f)[L],
                        void 0,
                        { number: !0 }
                      ]
                    ]) : ct((l(), c("input", {
                      key: 3,
                      "onUpdate:modelValue": (q) => r(f)[L] = q,
                      class: "kx-input",
                      type: r(Qn)(j),
                      placeholder: j.description || ""
                    }, null, 8, Jr)), [
                      [qn, r(f)[L]]
                    ]),
                    j.description && !(j.type !== "boolean" && !j.enum) ? (l(), c("span", Qr, C(j.description), 1)) : j.description && j.enum ? (l(), c("span", ta, C(j.description), 1)) : $("", !0)
                  ]))), 128))
                ])) : (l(), c("div", qr, "This automation needs no configuration."))
              ], 64)) : (l(), c("p", Kr, "Select an automation type to configure it."))
            ])
          ])
        ], 2)
      ]),
      _: 1
    }, 8, ["visible", "pt", "class", "onShow"]));
  }
}), oa = {
  key: 0,
  class: "kx-metrics"
}, ra = { class: "kx-metric-k" }, aa = ["title"], ia = {
  key: 1,
  class: "kx-metric-details"
}, sa = { class: "kx-metrics kx-metrics-detail" }, la = { class: "kx-metric-k" }, ua = ["title"], da = /* @__PURE__ */ ft({
  __name: "RowMetrics",
  props: {
    face: { default: () => [] },
    detail: { default: () => [] }
  },
  setup(t) {
    return (e, n) => (l(), c(K, null, [
      t.face.length ? (l(), c("div", oa, [
        (l(!0), c(K, null, rt(t.face, (o) => (l(), c("span", {
          key: o.label,
          class: "kx-metric"
        }, [
          o.icon ? (l(), N(r(R), {
            key: 0,
            icon: o.icon,
            class: "kx-metric-i",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : $("", !0),
          u("span", ra, C(o.label), 1),
          u("span", {
            class: "kx-metric-v",
            title: o.title
          }, C(o.value), 9, aa)
        ]))), 128))
      ])) : $("", !0),
      t.detail.length ? (l(), c("details", ia, [
        n[0] || (n[0] = u("summary", { class: "kx-metric-more" }, "Details", -1)),
        u("div", sa, [
          (l(!0), c(K, null, rt(t.detail, (o) => (l(), c("span", {
            key: o.label,
            class: "kx-metric"
          }, [
            o.icon ? (l(), N(r(R), {
              key: 0,
              icon: o.icon,
              class: "kx-metric-i",
              "aria-hidden": "true"
            }, null, 8, ["icon"])) : $("", !0),
            u("span", la, C(o.label), 1),
            u("span", {
              class: "kx-metric-v",
              title: o.title
            }, C(o.value), 9, ua)
          ]))), 128))
        ])
      ])) : $("", !0)
    ], 64));
  }
}), ca = /* @__PURE__ */ new Set(["pause", "resume"]), ba = /* @__PURE__ */ new Set(["reconfigure"]), De = /* @__PURE__ */ new Set(["run_now", "trigger", "execute", "run"]), ee = {
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
function Ye(t) {
  return t.has("run_now") ? "run_now" : t.has("trigger") ? "trigger" : t.has("execute") ? "execute" : "";
}
function pa(t) {
  return t.replace(/[._-]+/g, " ").replace(/\b\w/g, (e) => e.toUpperCase());
}
function ze(t) {
  return { label: pa(t), description: "Run this action.", group: "recovery", icon: "tabler:bolt" };
}
function Ze(t) {
  return new Set([...t?.controls || [], ...t?.actions || []].map((e) => e.name).filter(Boolean));
}
function Ge(t) {
  const e = [...Ze(t)], n = !!de(t);
  return {
    declared: e,
    requiresKeys: t?.controls?.filter((o) => o.keys_required).map((o) => o.name),
    runNow: Ye(new Set(e)),
    canReconfigure: n,
    // An automation is a component, so it shares through the generic component
    // access endpoints; the server is the authority on who may grant.
    canShare: !0,
    canExport: t?.exportable === !0,
    canDelete: !0
  };
}
function Xe(t) {
  const e = t instanceof Set ? t : new Set(t);
  return e.has("rewind") ? "rewind" : e.has("resync") ? "resync" : "";
}
function Je(t) {
  const e = [];
  if (t.runNow) {
    const o = ee[t.runNow] || ee.trigger;
    e.push({ method: t.runNow, ...o, kind: "call" });
  }
  const n = /* @__PURE__ */ new Set();
  for (const o of t.declared) {
    if (ca.has(o) || o === t.runNow || t.runNow !== "run_now" && De.has(o) || ba.has(o) || n.has(o)) continue;
    n.add(o);
    const i = t.runNow === "run_now" && De.has(o) ? { ...ze(o), group: "run" } : ee[o] || ze(o);
    e.push({ method: o, ...i, kind: "call", disabled: t.requiresKeys?.includes(o) });
  }
  return t.canReconfigure && e.push({ method: "reconfigure", label: "Reconfigure", description: "Change how this automation is set up.", group: "edit", icon: "tabler:settings", kind: "reconfigure" }), t.canShare && e.push({ method: "share", label: "Share", description: "Give other people access to this automation.", group: "edit", icon: "tabler:users", kind: "share" }), t.canExport && e.push({ method: "export", label: "Export", description: "Download a portable copy to import elsewhere.", group: "edit", icon: "tabler:download", kind: "export" }), t.canDelete && e.push({ method: "delete", label: "Delete", description: "Stop it and remove its setup. This cannot be undone.", group: "delete", icon: "tabler:trash", kind: "delete", danger: !0 }), e;
}
const fa = ["run", "recovery", "edit", "delete"], ma = {
  run: "Run",
  recovery: "Recovery",
  edit: "Edit",
  delete: ""
};
function ga(t) {
  return fa.map((e) => ({ group: e, label: ma[e], items: t.filter((n) => n.group === e) })).filter((e) => e.items.length > 0);
}
function va(t, e) {
  return t.group === "run" ? `Run ${e} now` : t.method === "reconfigure" ? `Edit ${e}` : `${t.label} ${e}`;
}
const ha = ["aria-label"], ya = {
  key: 1,
  class: "kx-menu-sep",
  role: "separator"
}, ka = ["data-testid", "aria-label", "disabled", "onClick"], xa = { class: "kx-menu-item-body" }, _a = { class: "kx-menu-item-label" }, wa = { class: "kx-menu-item-desc" }, Qe = /* @__PURE__ */ ft({
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
  setup(t, { emit: e }) {
    const n = t, o = e, i = M(!1), a = M(null), f = A(() => ga(n.items));
    function g() {
      i.value = !i.value;
    }
    function x() {
      i.value = !1;
    }
    function p(h) {
      n.disabled || h.disabled || (x(), o("select", h.method));
    }
    return (h, v) => (l(), c("span", {
      ref_key: "trigger",
      ref: a,
      class: "kx-menu"
    }, [
      D(r(G), {
        type: "button",
        severity: "secondary",
        outlined: "",
        size: t.size === "normal" ? void 0 : "small",
        class: V(["kx-menu-trigger", i.value && "is-active"]),
        "aria-haspopup": !0,
        "aria-expanded": i.value,
        "aria-label": t.triggerLabel || `More actions for ${t.name}`,
        title: "More actions",
        disabled: t.disabled,
        onClick: g
      }, {
        icon: O(({ class: m }) => [
          D(r(R), {
            icon: "tabler:dots",
            "aria-hidden": "true",
            class: V(m)
          }, null, 8, ["class"])
        ]),
        _: 1
      }, 8, ["size", "class", "aria-expanded", "aria-label", "disabled"]),
      D(ao, {
        open: i.value,
        "onUpdate:open": v[0] || (v[0] = (m) => i.value = m),
        anchor: a.value,
        align: "right",
        width: 264,
        "max-height": 460,
        gap: 6
      }, {
        default: O(() => [
          u("div", {
            class: "kx-menu-panel",
            role: "menu",
            "aria-label": `Actions for ${t.name}`
          }, [
            (l(!0), c(K, null, rt(f.value, (m, d) => (l(), c(K, {
              key: m.group
            }, [
              m.label ? (l(), c("div", {
                key: 0,
                class: V(["kx-menu-group", d === 0 && "is-first"])
              }, C(m.label), 3)) : d > 0 ? (l(), c("div", ya)) : $("", !0),
              (l(!0), c(K, null, rt(m.items, (S) => (l(), c("button", {
                key: S.method,
                type: "button",
                role: "menuitem",
                class: V(["kx-menu-item", [S.danger && "is-danger", S.warn && "is-warn"]]),
                "data-testid": `action-${S.method}`,
                "aria-label": r(va)(S, t.name),
                disabled: t.disabled || S.disabled || t.busy && S.kind === "call",
                onClick: (P) => p(S)
              }, [
                D(r(R), {
                  icon: S.icon,
                  class: "kx-menu-item-ico",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                u("span", xa, [
                  u("span", _a, [
                    at(C(S.label) + " ", 1),
                    S.warn ? (l(), N(r(R), {
                      key: 0,
                      icon: "tabler:alert-triangle",
                      class: "kx-menu-item-warn",
                      "aria-hidden": "true"
                    })) : $("", !0)
                  ]),
                  u("span", wa, C(S.description), 1)
                ])
              ], 10, ka))), 128))
            ], 64))), 128))
          ], 8, ha)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 512));
  }
}), $a = {
  "aria-label": "History",
  class: "kx-history"
}, Ca = {
  key: 0,
  role: "status",
  class: "kx-dnote"
}, Sa = {
  key: 1,
  role: "alert",
  class: "kx-dnote kx-dnote-err"
}, Pa = {
  key: 0,
  class: "kx-dnote"
}, Da = { class: "kx-history-head" }, za = ["datetime"], Ea = { class: "kx-history-state" }, Ia = { class: "kx-history-kv" }, Aa = { class: "kx-dfact-k" }, La = ["aria-label"], Ma = {
  class: "kx-history-v",
  "aria-label": "Authorized by"
}, Ra = { class: "kx-history-v" }, ja = {
  key: 0,
  class: "kx-dmsg is-err"
}, Ta = {
  key: 1,
  class: "kx-dmsg is-err"
}, Ba = /* @__PURE__ */ ft({
  __name: "ExecutionHistory",
  props: {
    root: {}
  },
  emits: ["error"],
  setup(t, { emit: e }) {
    const n = t, o = e, i = M([]), a = M([]), f = M([]), g = M(""), x = M(""), p = M(!1), h = M("");
    let v = 0;
    function m() {
      i.value = [], a.value = [], f.value = [], g.value = "", x.value = "";
    }
    function d(k) {
      return f.value.find((s) => s.type === k?.kind && s.id === k?.id)?.label || "Account unavailable";
    }
    function S(k, s) {
      const y = d(s);
      return k.evidence_status === "inferred" ? `${y} (unverified)` : y;
    }
    function P(k) {
      return k.evidence_status === "absent" ? "Account not recorded" : k.evidence_status === "unresolved" ? "Account unavailable" : S(k, k.evidence?.identity?.principal);
    }
    function H(k) {
      return {
        resolved: "Delivered",
        waiting: "Waiting to retry",
        uncertain: "Needs attention",
        failed: "Failed",
        filtered: "Skipped",
        superseded: "Replaced",
        succeeded: "Accepted",
        pending: "Updating…"
      }[k] || "Outcome unavailable";
    }
    const F = {
      pending: "Pending",
      running: "Running",
      completed: "Completed",
      failed: "Failed",
      cancelled: "Cancelled",
      terminated: "Terminated"
    }, nt = A(() => [
      ...i.value.map((k) => ({
        key: Y(k),
        at: k.round_at,
        state: k.state,
        account: P(k),
        role: "Run by",
        authorizer: k.evidence?.identity?.authorized_by ? S(k, k.evidence.identity.authorized_by) : void 0,
        error: L(k.error),
        workflowRun: k.workflow_run
      })),
      ...a.value.map((k) => ({
        key: `${k.generation}:${k.request_id}`,
        at: k.created_at,
        state: k.state,
        account: k.initiation ? d({ kind: "user", id: k.initiation.actor_id }) : "Account not recorded",
        role: "Requested by",
        authorizer: void 0,
        error: "",
        workflowRun: void 0
      }))
    ].sort((k, s) => s.at.localeCompare(k.at) || k.key.localeCompare(s.key)));
    function Y(k) {
      return JSON.stringify([k.drive_key, k.round_token, k.source_port, k.item_key, k.identity_key]);
    }
    function L(k) {
      return ot(k, typeof k == "string" ? k : "");
    }
    async function j(k, s, y = "") {
      const { data: z } = await bt.get(
        "/api/v1/automations/" + encodeURIComponent(k) + "/history",
        { params: { kind: s, page_size: 25, ...y ? { page_token: y } : {} } }
      );
      if (!z.success || z.kind !== s || !Array.isArray(z.entries)) throw new Error(z.error?.message || "Could not read execution history");
      if (z.next_page_token && z.next_page_token === y) throw new Error("History page repeats its cursor");
      return z;
    }
    async function q(k, s) {
      const y = /* @__PURE__ */ new Map();
      function z(B) {
        B && (B.kind === "user" || B.kind === "group") && y.set(B.kind + ":" + B.id, { type: B.kind, id: B.id });
      }
      for (const B of k)
        z(B.evidence?.identity?.principal), z(B.evidence?.identity?.authorized_by);
      for (const B of s)
        B.initiation && z({ kind: "user", id: B.initiation.actor_id });
      return io([...y.values()]);
    }
    function X(k) {
      m(), h.value = ot(k, "Could not read execution history"), o("error", { message: h.value, error: k });
    }
    async function it() {
      const k = ++v, s = n.root;
      if (m(), h.value = "", p.value = !1, !!s) {
        p.value = !0;
        try {
          const [y, z] = await Promise.all([j(s, "deliveries"), j(s, "controls")]), B = await q(y.entries, z.entries);
          if (k !== v) return;
          i.value = y.entries, a.value = z.entries, f.value = B, g.value = y.next_page_token || "", x.value = z.next_page_token || "";
        } catch (y) {
          k === v && X(y);
        } finally {
          k === v && (p.value = !1);
        }
      }
    }
    async function Z() {
      if (p.value || !g.value && !x.value) return;
      const k = v, s = n.root;
      p.value = !0, h.value = "";
      try {
        const [y, z] = await Promise.all([
          g.value ? j(s, "deliveries", g.value) : null,
          x.value ? j(s, "controls", x.value) : null
        ]), B = [...i.value, ...y?.entries || []], mt = [...a.value, ...z?.entries || []], U = await q(B, mt);
        if (k !== v) return;
        i.value = B, a.value = mt, f.value = U, g.value = y?.next_page_token || "", x.value = z?.next_page_token || "";
      } catch (y) {
        k === v && X(y);
      } finally {
        k === v && (p.value = !1);
      }
    }
    return Nt(() => n.root, () => {
      it();
    }, { immediate: !0 }), le(() => {
      v += 1;
    }), (k, s) => (l(), c("section", $a, [
      s[2] || (s[2] = u("h3", { class: "kx-dsub-lbl" }, "History", -1)),
      p.value ? (l(), c("p", Ca, "Loading history…")) : $("", !0),
      h.value ? (l(), c("p", Sa, C(h.value), 1)) : (l(), c(K, { key: 2 }, [
        !p.value && !nt.value.length ? (l(), c("p", Pa, "No history yet.")) : $("", !0),
        (l(!0), c(K, null, rt(nt.value, (y) => (l(), c("article", {
          key: y.key,
          class: "kx-history-entry"
        }, [
          u("div", Da, [
            u("time", {
              class: "kx-history-meta",
              datetime: y.at
            }, C(r(pt)(y.at, { future: !0 })), 9, za),
            u("span", Ea, C(H(y.state)), 1)
          ]),
          u("dl", Ia, [
            u("dt", Aa, C(y.role), 1),
            u("dd", {
              class: "kx-history-v",
              "aria-label": y.role
            }, C(y.account), 9, La),
            y.authorizer ? (l(), c(K, { key: 0 }, [
              s[0] || (s[0] = u("dt", { class: "kx-dfact-k" }, "Authorized by", -1)),
              u("dd", Ma, C(y.authorizer), 1)
            ], 64)) : $("", !0),
            y.workflowRun ? (l(), c(K, { key: 1 }, [
              s[1] || (s[1] = u("dt", { class: "kx-dfact-k" }, "Workflow run", -1)),
              u("dd", Ra, C(F[y.workflowRun.status]), 1)
            ], 64)) : $("", !0)
          ]),
          y.error ? (l(), c("p", ja, C(y.error), 1)) : $("", !0),
          y.workflowRun?.error ? (l(), c("p", Ta, C(y.workflowRun.error), 1)) : $("", !0)
        ]))), 128)),
        g.value || x.value ? (l(), N(r(G), {
          key: 1,
          label: "More history",
          severity: "secondary",
          disabled: p.value,
          onClick: Z
        }, null, 8, ["disabled"])) : $("", !0)
      ], 64))
    ]));
  }
});
function Rt(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function Oa(t) {
  return Rt(t) && typeof t.code == "string" && typeof t.message == "string" && typeof t.at == "string" && (t.item_key === void 0 || typeof t.item_key == "string");
}
function Fa(t) {
  if (!Rt(t) || typeof t.drive_key != "string") return !1;
  for (const e of ["source_kind", "phase"])
    if (t[e] !== void 0 && typeof t[e] != "string") return !1;
  if (t.enabled !== void 0 && typeof t.enabled != "boolean") return !1;
  for (const e of ["next_run_at", "last_run_at", "last_round_at"])
    if (t[e] !== void 0 && t[e] !== null && typeof t[e] != "string") return !1;
  for (const e of ["unresolved_count", "uncertain_count"])
    if (t[e] !== void 0 && (typeof t[e] != "number" || !Number.isInteger(t[e]) || t[e] < 0)) return !1;
  return !(t.last_error !== void 0 && t.last_error !== null && (!Rt(t.last_error) || t.last_error.message !== void 0 && typeof t.last_error.message != "string"));
}
function Na(t) {
  if (!Rt(t) || t.success !== !0 || !Array.isArray(t.drives) || !t.drives.every(Fa) || t.next_page_token !== void 0 && t.next_page_token !== null && (typeof t.next_page_token != "string" || !t.next_page_token)) return !1;
  const e = t.delivery_failures;
  return e === void 0 || Rt(e) && typeof e.count == "number" && Number.isInteger(e.count) && e.count >= 0 && (e.last_error === void 0 || Oa(e.last_error));
}
const tn = {
  blocked_identity: "The account this automation runs as needs to be confirmed.",
  blocked_access: "This automation lost access to something it uses.",
  blocked_declaration: "This automation's settings need to be fixed."
};
function Vt(t) {
  return (t?.drives || []).filter((e) => e.source_kind !== "none");
}
function Bt(t) {
  return t.enabled === !1 || t.phase === "paused";
}
function Ee(t) {
  return (t.source_kind === "timer" || t.source_kind === "collection") && (t.phase === "pending" || t.phase === "active") && typeof t.next_run_at == "string" && Date.parse(t.next_run_at) > Date.now();
}
function Ua(t) {
  const e = Vt(t), n = (t?.delivery_failures?.count || 0) > 0;
  if (!e.length) return n ? { kind: "warn", label: "Needs attention" } : null;
  if (e.some((i) => (i.phase || "") in tn)) return { kind: "warn", label: "Needs attention" };
  if (e.every(Bt)) return { kind: "off", label: "Paused" };
  if (n) return { kind: "warn", label: "Needs attention" };
  if (e.some((i) => i.phase === "degraded")) return { kind: "warn", label: "Retrying" };
  if (e.some((i) => i.phase === "backpressure")) return { kind: "live", label: "Catching up" };
  if (e.some((i) => !Bt(i) && i.phase === "pending" && !Ee(i))) return { kind: "neutral", label: "Starting" };
  const o = e.filter((i) => !Bt(i) && i.source_kind !== "reconcile");
  return o.length && o.every(Ee) ? { kind: "on", label: "Scheduled" } : { kind: "on", label: "Active" };
}
function Ha(t) {
  const e = t?.delivery_failures?.last_error;
  if (e) return `${e.code}: ${e.message}`;
  const n = Vt(t);
  for (const o of n) {
    const i = tn[o.phase || ""];
    if (i) return i;
  }
  for (const o of n) {
    if (o.phase !== "degraded") continue;
    return (typeof o.last_error?.message == "string" ? o.last_error.message.trim() : "") || "The last run failed; it is retrying.";
  }
  return "";
}
function Va(t) {
  const e = Vt(t), n = [], o = Pt(t).next;
  o && n.push({ label: "Next run", value: o, time: !0 });
  const i = e.reduce((a, f) => a + (f.unresolved_count || 0), 0);
  return i > 0 && n.push({ label: "Waiting to retry", value: `${i} ${i === 1 ? "item" : "items"}` }), n;
}
function Pt(t) {
  const e = Vt(t), n = e.map((i) => i.last_run_at).filter((i) => typeof i == "string" && !!i).sort().at(-1), o = e.filter((i) => !Bt(i)).map((i) => i.next_run_at).filter((i) => typeof i == "string" && !!i).sort()[0];
  return { last: n, next: o };
}
const Ka = /* @__PURE__ */ new Set(["status", "enabled", "last_error", "last_run_at", "next_run_at"]);
function qa(t) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (e) => e.toUpperCase());
}
function Wa(t) {
  return t.replace(/\b\w/g, (e) => e.toUpperCase());
}
function Ya(t) {
  return t && t.charAt(0).toUpperCase() + t.slice(1);
}
function Za(t, e) {
  if (t.type === "boolean") return e === !0 ? "Yes" : "No";
  const n = String(e);
  return t.key.endsWith("_at") || /^\d{4}-\d{2}-\d{2}T/.test(n) ? pt(n, { future: !0 }) || n : t.type === "text" ? Ya(n) : n;
}
function en(t) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t) || /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(t) ? !0 : /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:_-]*$/i.test(t) && /:[0-9a-f-]{6,}/i.test(t);
}
function Ga(t) {
  return en(t) ? { text: t.length > 12 ? `${t.slice(0, 8)}…` : t, title: t } : { text: t };
}
const Xa = [
  { match: /component_id not in scope|not in scope/i, text: "Not part of this workspace" },
  { match: /transform output must be an object/i, text: "Item format not recognized" },
  { match: /trigger events dropped/i, text: "Incoming events were dropped" },
  { match: /requires dest_ref/i, text: "Missing a destination reference" },
  { match: /does not declare sink operation|accepts source payloads only/i, text: "Destination cannot accept this item" },
  { match: /sink write (returned a non-object|did not acknowledge)/i, text: "Destination did not confirm the save" },
  { match: /(sink|source) resolve/i, text: "Source or destination unavailable" }
];
function Ja(t) {
  const e = t.trim();
  if (!e) return { text: "" };
  for (const n of Xa)
    if (n.match.test(e)) return { text: n.text, title: e };
  return { text: "Skipped", title: e };
}
function nn(t) {
  return /reason/i.test(t);
}
function Qa(t, e) {
  return nn(t.key) || /(^|_)item(_key)?$/i.test(t.key) ? !0 : typeof e == "string" && en(e);
}
function ti(t, e) {
  const n = Wa(t.label || qa(t.key));
  if (nn(t.key)) {
    const { text: a, title: f } = Ja(String(e));
    return { label: n, value: a, title: f, icon: t.icon };
  }
  const { text: o, title: i } = Ga(Za(t, e));
  return { label: n, value: o, title: i, icon: t.icon };
}
function Ht(t, e, n) {
  const o = e;
  if (!t || !o) return [];
  const i = [];
  for (const a of t) {
    if (!a?.key || Ka.has(a.key) || a.role === "subtitle") continue;
    const f = o[a.key];
    f == null || f === "" || a.hidden || a.hide_zero && f === 0 || Qa(a, f) === n && i.push(ti(a, f));
  }
  return i;
}
function ce(t) {
  return String(t?.status || "").toLowerCase();
}
function ei(t) {
  return typeof t == "string" && /\b(completed|succeeded|successfully)\b/i.test(t);
}
function on(t) {
  const e = ce(t);
  return e === "completed" || e === "failed";
}
function be(t) {
  const e = ce(t);
  return e === "failed" || e === "failing" ? !0 : !!t?.last_error && !ei(t.last_error);
}
function rn(t, e) {
  if (e?.code === "unavailable") return { tone: "error", text: "Its module is unavailable. Reinstall its module to use this automation." };
  const n = typeof t?.last_error == "string" ? t.last_error.trim() : "";
  return n ? be(t) ? { tone: "error", text: n } : { tone: "success", text: n } : null;
}
function an(t, e, n, o) {
  if (o?.code === "unavailable") return { kind: "warn", label: "Unavailable" };
  const i = Ua(n);
  if (i) return i;
  if (!t)
    return e ? { kind: "neutral", label: "…" } : { kind: "neutral", label: "Installed" };
  const a = ce(t);
  return be(t) ? { kind: "warn", label: a === "failed" ? "Failed" : "Failing" } : a === "completed" ? { kind: "done", label: "Completed" } : a === "paused" || t.enabled === !1 ? { kind: "off", label: "Paused" } : a === "running" ? { kind: "live", label: "Running" } : { kind: "on", label: "Active" };
}
function sn(t) {
  switch (t) {
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
function ln(t, e) {
  const n = (t || []).find((i) => i?.role === "subtitle"), o = n ? e?.[n.key] : void 0;
  return typeof o == "string" ? o.trim() : "";
}
async function un(t) {
  const e = [], n = /* @__PURE__ */ new Set();
  let o, i;
  do {
    const a = o ? `?page_token=${encodeURIComponent(o)}` : "", { data: f } = await bt.get(`/api/v1/automations/${encodeURIComponent(t)}/status${a}`);
    if (!Na(f)) throw new Error("Invalid automation status response");
    if (e.push(...f.drives), i = f.delivery_failures, o = f.next_page_token || void 0, o && n.has(o)) throw new Error("Automation status repeated a page token");
    o && n.add(o);
  } while (o);
  return { drives: e, delivery_failures: i };
}
const ni = ["aria-label"], oi = { class: "kx-drawer-head" }, ri = { class: "kx-ficon" }, ai = { class: "kx-drawer-id" }, ii = ["title"], si = { class: "kx-drawer-sub" }, li = { class: "kx-drawer-controls" }, ui = {
  class: "kx-tabs",
  role: "tablist"
}, di = ["aria-selected", "data-testid", "onClick"], ci = { class: "kx-drawer-body" }, bi = {
  key: 0,
  class: "kx-dsec"
}, pi = {
  key: 0,
  class: "kx-errcard",
  "data-testid": "drawer-error-card"
}, fi = { class: "kx-errcard-head" }, mi = { class: "kx-errcard-cause" }, gi = { class: "kx-dgrid" }, vi = { class: "kx-dfact-k" }, hi = { class: "kx-dfact-v" }, yi = {
  key: 1,
  class: "kx-dsub"
}, ki = { class: "kx-metrics" }, xi = { class: "kx-metric-k" }, _i = ["title"], wi = {
  key: 1,
  class: "kx-dsec",
  "data-testid": "drawer-config"
}, $i = {
  key: 2,
  class: "kx-dnote"
}, Ci = {
  key: 2,
  class: "kx-dsec"
}, Si = { class: "kx-dgrid" }, Pi = { class: "kx-dfact" }, Di = { class: "kx-dfact-v" }, zi = { class: "kx-dfact" }, Ei = { class: "kx-dfact-v" }, Ii = { class: "kx-dfact" }, Ai = { class: "kx-dfact-v" }, Li = {
  key: 0,
  class: "kx-dsub"
}, Mi = /* @__PURE__ */ ft({
  __name: "DetailDrawer",
  props: {
    automation: { default: () => ({ id: "" }) },
    type: {}
  },
  emits: ["close", "action", "recover", "changed"],
  setup(t, { emit: e }) {
    const n = t, o = e, i = M("overview"), a = [
      { id: "overview", label: "Overview", icon: "tabler:layout-dashboard" },
      { id: "config", label: "Config", icon: "tabler:settings" },
      { id: "activity", label: "Activity", icon: "tabler:history" }
    ], f = A(() => n.automation.title || n.automation.id), g = A(() => n.automation.icon || n.type?.icon || "tabler:bolt"), x = A(() => n.type?.title || "Automation"), p = A(() => n.automation.public_state), h = A(() => Ge(n.type)), v = A(() => Je(h.value)), m = A(() => h.value.declared.includes("status")), d = M(null);
    let S = 0;
    async function P(U) {
      const I = ++S;
      if (!U || !n.automation.drive_status || n.automation.availability) {
        d.value = null;
        return;
      }
      d.value = n.automation.drive_status;
      const E = await un(U);
      I === S && n.automation.id === U && (d.value = E);
    }
    Nt(() => [n.automation.id, n.automation.drive_status, n.automation.availability], ([U]) => {
      P(U).catch((I) => oe.handleError("other", { message: String(I) }));
    }, { immediate: !0 });
    const H = A(() => an(p.value, m.value, d.value, n.automation.availability)), F = A(() => H.value.kind === "off"), nt = A(() => on(p.value)), Y = A(() => (h.value.declared.includes("pause") || h.value.declared.includes("resume")) && !nt.value), L = A(() => be(p.value)), j = A(() => Xe(h.value.declared)), q = A(() => {
      if (n.automation.availability) return rn(p.value, n.automation.availability)?.text || "";
      const U = Ha(d.value);
      if (U) return U;
      const I = typeof p.value?.last_error == "string" ? p.value.last_error.trim() : "";
      return L.value ? I : "";
    }), X = A(() => ln(n.type?.public_state_schema?.fields, p.value)), it = A(() => {
      const U = n.type?.public_state_schema?.fields;
      return [...Ht(U, p.value, !1), ...Ht(U, p.value, !0)];
    }), Z = A(() => {
      const U = p.value, I = [];
      X.value && I.push({ label: "When", value: X.value });
      const E = Va(d.value);
      U?.next_run_at && !E.some((ut) => ut.label === "Next run") && I.push({ label: "Next run", value: pt(U.next_run_at, { future: !0 }) });
      for (const ut of E)
        I.push({ label: ut.label, value: ut.time ? pt(ut.value, { future: !0 }) : ut.value });
      return I;
    }), k = A(() => {
      const U = d.value?.drives.flatMap((E) => typeof E.last_round_at == "string" ? [E.last_round_at] : []) || [], I = d.value?.delivery_failures?.last_error?.at;
      return I && U.push(I), U.sort().at(-1) || p.value?.last_run_at;
    }), s = A(() => d.value?.delivery_failures), y = A(() => {
      const U = s.value?.last_error;
      return U ? `${U.code}: ${U.message}` : p.value?.last_error;
    }), z = A(() => de(n.type)), B = A(() => We(n.automation, n.type)), mt = A(() => ({ location: qe(n.type) }));
    return Nt(() => n.automation.id, () => {
      i.value = "overview";
    }), (U, I) => (l(), c(K, null, [
      u("div", {
        class: "kx-drawer-scrim",
        onClick: I[0] || (I[0] = (E) => o("close"))
      }),
      u("aside", {
        class: "kx-drawer",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": f.value,
        "data-testid": "detail-drawer"
      }, [
        u("header", oi, [
          u("span", ri, [
            D(r(R), {
              icon: g.value,
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          u("div", ai, [
            u("div", {
              class: "kx-drawer-name",
              title: f.value
            }, C(f.value), 9, ii),
            u("div", si, C(x.value), 1)
          ]),
          D(r(ue), {
            severity: r(sn)(H.value.kind),
            class: "kx-badge kx-tag-sm"
          }, {
            default: O(() => [
              H.value.kind === "live" ? (l(), N(r(R), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : $("", !0),
              at(" " + C(H.value.label), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          u("div", li, [
            Y.value ? (l(), N(r(G), {
              key: 0,
              type: "button",
              severity: "secondary",
              outlined: "",
              size: "small",
              "aria-label": `${F.value ? "Resume" : "Pause"} ${f.value}`,
              title: F.value ? "Resume" : "Pause",
              disabled: !!t.automation.deleting_at,
              onClick: I[1] || (I[1] = (E) => !t.automation.deleting_at && o("action", F.value ? "resume" : "pause"))
            }, {
              icon: O(({ class: E }) => [
                D(r(R), {
                  icon: F.value ? "tabler:player-play-filled" : "tabler:player-pause",
                  "aria-hidden": "true",
                  class: V(E)
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["aria-label", "title", "disabled"])) : $("", !0),
            D(Qe, {
              items: v.value,
              name: f.value,
              disabled: !!t.automation.deleting_at,
              onSelect: I[2] || (I[2] = (E) => !t.automation.deleting_at && o("action", E))
            }, null, 8, ["items", "name", "disabled"]),
            D(r(G), {
              type: "button",
              severity: "secondary",
              text: "",
              size: "small",
              class: "kx-drawer-close",
              "aria-label": "Close details",
              title: "Close",
              onClick: I[3] || (I[3] = (E) => o("close"))
            }, {
              icon: O(({ class: E }) => [
                D(r(R), {
                  icon: "tabler:x",
                  "aria-hidden": "true",
                  class: V(E)
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]),
        u("nav", ui, [
          (l(), c(K, null, rt(a, (E) => u("button", {
            key: E.id,
            type: "button",
            role: "tab",
            class: V(["kx-tab", i.value === E.id && "is-active"]),
            "aria-selected": i.value === E.id,
            "data-testid": `drawer-tab-${E.id}`,
            onClick: (ut) => i.value = E.id
          }, [
            D(r(R), {
              icon: E.icon,
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            at(" " + C(E.label), 1)
          ], 10, di)), 64))
        ]),
        u("div", ci, [
          i.value === "overview" ? (l(), c("section", bi, [
            q.value ? (l(), c("div", pi, [
              u("div", fi, [
                D(r(R), {
                  icon: "tabler:alert-circle",
                  "aria-hidden": "true"
                }),
                u("span", null, C(n.automation.availability ? "This automation is unavailable" : "This automation is failing"), 1)
              ]),
              u("p", mi, C(q.value), 1),
              j.value ? (l(), N(r(G), {
                key: 0,
                type: "button",
                size: "small",
                severity: "danger",
                "aria-label": `Recover ${f.value}`,
                "data-testid": "drawer-recover",
                label: "Recover",
                disabled: !!t.automation.deleting_at,
                onClick: I[4] || (I[4] = (E) => !t.automation.deleting_at && o("recover"))
              }, {
                icon: O(({ class: E }) => [
                  D(r(R), {
                    icon: "tabler:rotate-clockwise-2",
                    "aria-hidden": "true",
                    class: V(E)
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["aria-label", "disabled"])) : $("", !0)
            ])) : $("", !0),
            u("div", gi, [
              (l(!0), c(K, null, rt(Z.value, (E) => (l(), c("div", {
                key: E.label,
                class: "kx-dfact"
              }, [
                u("span", vi, C(E.label), 1),
                u("strong", hi, C(E.value), 1)
              ]))), 128))
            ]),
            it.value.length ? (l(), c("div", yi, [
              I[9] || (I[9] = u("div", { class: "kx-dsub-lbl" }, "Progress", -1)),
              u("div", ki, [
                (l(!0), c(K, null, rt(it.value, (E) => (l(), c("span", {
                  key: E.label,
                  class: "kx-metric"
                }, [
                  E.icon ? (l(), N(r(R), {
                    key: 0,
                    icon: E.icon,
                    class: "kx-metric-i",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])) : $("", !0),
                  u("span", xi, C(E.label), 1),
                  u("span", {
                    class: "kx-metric-v",
                    title: E.title
                  }, C(E.value), 9, _i)
                ]))), 128))
              ])
            ])) : $("", !0)
          ])) : i.value === "config" ? (l(), c("section", wi, [
            !t.automation.deleting_at && !t.automation.availability && ((t.automation.access_level || 0) & 8) !== 0 ? (l(), N(Ut, {
              key: 0,
              tag: "wc-execution-identity-editor",
              attrs: { root: t.automation.id },
              onChange: I[5] || (I[5] = (E) => o("changed"))
            }, null, 8, ["attrs"])) : $("", !0),
            z.value && !t.automation.deleting_at ? (l(), N(Ut, {
              key: 1,
              class: "kx-manage-host",
              tag: z.value,
              config: B.value,
              meta: mt.value,
              onChange: I[6] || (I[6] = (E) => o("changed")),
              onClose: I[7] || (I[7] = (E) => i.value = "overview")
            }, null, 8, ["tag", "config", "meta"])) : (l(), c("div", $i, "This automation type declares no settings view."))
          ])) : (l(), c("section", Ci, [
            u("div", Si, [
              u("div", Pi, [
                I[10] || (I[10] = u("span", { class: "kx-dfact-k" }, "Last run", -1)),
                u("strong", Di, C(k.value ? r(pt)(k.value, { future: !0 }) : "Never"), 1)
              ]),
              u("div", zi, [
                I[11] || (I[11] = u("span", { class: "kx-dfact-k" }, "Last outcome", -1)),
                u("strong", Ei, C(s.value?.count ? "Failed delivery" : p.value?.status || "—"), 1)
              ]),
              u("div", Ii, [
                I[12] || (I[12] = u("span", { class: "kx-dfact-k" }, "Failed deliveries", -1)),
                u("strong", Ai, C(s.value?.count ?? 0), 1)
              ])
            ]),
            typeof y.value == "string" && y.value.trim() ? (l(), c("div", Li, [
              I[13] || (I[13] = u("div", { class: "kx-dsub-lbl" }, "Last message", -1)),
              u("p", {
                class: V(["kx-dmsg", L.value || s.value?.count ? "is-err" : "is-ok"])
              }, C(y.value), 3)
            ])) : $("", !0),
            !t.automation.availability && ((t.automation.access_level || 0) & 8) !== 0 ? (l(), N(Ba, {
              key: 1,
              root: t.automation.id,
              onError: I[8] || (I[8] = (E) => r(oe).handleError("other", { message: E.message }))
            }, null, 8, ["root"])) : $("", !0)
          ]))
        ])
      ], 8, ni)
    ], 64));
  }
});
function Ri(t) {
  const e = M(!1), n = M(null), o = M({}), i = M(!1), a = M(!1), f = M(""), g = M(null), x = M(null);
  let p = null;
  const h = M(""), v = A(() => t.types.value.filter(
    (s) => s.installable !== !1 && Object.entries(t.inputPreset.value).every(([y, z]) => {
      const B = s.inputs?.properties?.[y];
      return !!B && (!B.enum || typeof z == "string" && B.enum.includes(z));
    })
  )), m = A(() => !t.componentMode.value || !t.preferredTypeId.value || n.value?.id !== t.preferredTypeId.value), d = A(() => n.value ? to(n.value).filter(([s]) => !(s in t.inputPreset.value)) : []), S = A(() => {
    const s = h.value.trim().toLowerCase();
    return s ? v.value.filter(
      (y) => (y.title || "").toLowerCase().includes(s) || (y.name || "").toLowerCase().includes(s) || ie(y).toLowerCase().includes(s)
    ) : v.value;
  });
  function P(s) {
    X(), h.value = "", n.value = s || null, o.value = s ? { ...ye(s), ...t.inputPreset.value } : {}, f.value = "", e.value = !0, te(Y);
  }
  function H(s) {
    X(), n.value = s, o.value = { ...ye(s), ...t.inputPreset.value }, f.value = "", te(Y);
  }
  function F() {
    X(), e.value = !1, n.value = null, o.value = {}, f.value = "", a.value = !1, t.createMode.value && t.emitHost("close", {});
  }
  function nt() {
    !m.value || n.value || te(() => x.value?.focus({ preventScroll: !0 }));
  }
  async function Y() {
    const s = n.value, y = se(s);
    if (!(!y || !s || !g.value))
      try {
        if (await Gn(y, { timeoutMs: 8e3 }), n.value?.id !== s.id || !g.value) return;
        const z = document.createElement(y);
        z.setAttribute("type-id", s.id), z.setAttribute("input", JSON.stringify(t.inputPreset.value)), t.effectiveParentId.value && z.setAttribute("parent-id", t.effectiveParentId.value), z.setAttribute("embedded", "true"), z.addEventListener("automation-installed", q), z.addEventListener("submit-state", L), g.value.innerHTML = "", g.value.appendChild(z), p = z;
      } catch (z) {
        const B = Dr(s);
        f.value = `Failed to load setup UI (${y}${B ? ` at ${B}` : ""}): ` + (z instanceof Error ? z.message : String(z));
      }
  }
  function L(s) {
    a.value = !!s.detail?.saving;
  }
  function j() {
    se(n.value) ? zr(p) : k();
  }
  async function q(s) {
    const y = s.detail;
    if (y?.success === !1) {
      f.value = y?.error || "Could not create the automation.", a.value = !1;
      return;
    }
    if (t.createMode.value) {
      t.emitHost("created", { id: y?.id });
      return;
    }
    F(), await t.reload();
  }
  function X() {
    p && (p.removeEventListener("automation-installed", q), p.removeEventListener("submit-state", L), p.remove(), p = null), g.value && (g.value.innerHTML = "");
  }
  function it() {
    const s = t.preferredTypeId.value;
    return s ? v.value.find((y) => y.id === s) : void 0;
  }
  function Z() {
    P(it());
  }
  async function k() {
    const s = n.value;
    if (!s) return;
    const y = eo(s, o.value);
    if (y) {
      f.value = y;
      return;
    }
    i.value = !0, f.value = "";
    try {
      const { data: z } = await bt.post("/api/v1/automations", {
        type: s.id,
        input: no(s, o.value),
        parent_id: t.effectiveParentId.value || void 0
      });
      if (z?.success) {
        if (t.createMode.value) {
          t.emitHost("created", { id: z.id });
          return;
        }
        F(), await t.reload();
      } else
        f.value = ot({ response: { data: z } }, "install failed");
    } catch (z) {
      f.value = ot(z, "install failed");
    } finally {
      i.value = !1;
    }
  }
  return {
    showTypeCatalog: m,
    installFields: d,
    showInstall: e,
    installType: n,
    installForm: o,
    installing: i,
    customSaving: a,
    installError: f,
    customInstallHost: g,
    installSearchInput: x,
    typeSearch: h,
    filteredTypes: S,
    openInstall: P,
    openPreferredInstall: Z,
    chooseType: H,
    closeInstall: F,
    focusInstallDialog: nt,
    onCreate: j,
    unmountCustomInstallUi: X
  };
}
function ji({ automations: t, types: e, query: n, drawerId: o }) {
  const i = A(() => {
    const s = {};
    for (const y of e.value) s[y.id] = y;
    return s;
  }), a = A(() => {
    const s = n.value.trim().toLowerCase();
    return s ? t.value.filter(
      (y) => (y.title || "").toLowerCase().includes(s) || (y.description || "").toLowerCase().includes(s) || (y.type || "").toLowerCase().includes(s)
    ) : t.value;
  });
  function f(s) {
    return s.title || s.id;
  }
  function g(s) {
    return s.type ? i.value[s.type] : void 0;
  }
  function x(s) {
    return s.icon ? s.icon : g(s)?.icon || "tabler:bolt";
  }
  function p(s) {
    return Ze(g(s));
  }
  function h(s, y) {
    return p(s).has(y);
  }
  function v(s) {
    return Ye(p(s));
  }
  function m(s) {
    return Je(Ge(g(s)));
  }
  function d(s) {
    return Xe(p(s));
  }
  function S(s) {
    return de(g(s));
  }
  function P(s) {
    return qe(g(s));
  }
  function H(s) {
    return s ? We(s, g(s)) : {};
  }
  function F(s) {
    return s.public_state;
  }
  function nt(s) {
    return Ht(g(s)?.public_state_schema?.fields, F(s), !1);
  }
  function Y(s) {
    return Ht(g(s)?.public_state_schema?.fields, F(s), !0);
  }
  function L(s) {
    return on(F(s));
  }
  function j(s) {
    return rn(F(s), s.availability);
  }
  function q(s) {
    return an(F(s), h(s, "status"), s.drive_status, s.availability);
  }
  function X(s) {
    return q(s).kind === "off";
  }
  function it(s) {
    return ln(g(s)?.public_state_schema?.fields, F(s));
  }
  const Z = A(() => t.value.find((s) => s.id === o.value) || null), k = A(() => Z.value ? g(Z.value) : void 0);
  return {
    typeById: i,
    filtered: a,
    pretty: f,
    typeFor: g,
    iconFor: x,
    declaredActions: p,
    hasAction: h,
    runNowFor: v,
    actionItemsFor: m,
    recoverFor: d,
    manageTag: S,
    manageLocation: P,
    manageConfig: H,
    statusFor: F,
    metrics: nt,
    detailMetrics: Y,
    isTerminal: L,
    rowMessage: j,
    statusOf: q,
    isPaused: X,
    subtitleLine: it,
    drawerAutomation: Z,
    drawerType: k
  };
}
function Ti(t, e) {
  const n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
  let i = 0;
  const a = /* @__PURE__ */ new Map();
  function f(v, m) {
    const d = m.meta, S = t.value.find((P) => P.id === v);
    S && (S.public_state = { ...S.public_state || {}, ...d }, typeof d.title == "string" && (S.title = d.title), typeof d.comment == "string" && (S.description = d.comment), g(v).catch((P) => oe.handleError("other", { message: String(P) })));
  }
  async function g(v) {
    if (!t.value.some((P) => P.id === v && P.drive_status)) return;
    const m = Symbol(v);
    a.set(v, m);
    const d = await un(v);
    if (a.get(v) !== m) return;
    a.delete(v);
    const S = t.value.find((P) => P.id === v);
    S && (S.drive_status = d);
  }
  function x(v) {
    const m = {};
    for (const d of e(v)?.public_state_schema?.fields || [])
      d?.key && d.type && (m[d.key] = d.type);
    return m;
  }
  function p() {
    i++, o.clear(), a.clear();
    for (const v of n.values()) v();
    n.clear();
  }
  function h() {
    const v = new Set(t.value.map((d) => d.id).filter(Boolean));
    for (const [d, S] of n)
      v.has(d) || (S(), n.delete(d), a.delete(d));
    const m = i;
    for (const d of v) {
      if (n.has(d) || o.has(d)) continue;
      o.add(d);
      const S = t.value.find((H) => H.id === d), P = Oo(d, (H) => f(d, H), S ? x(S) : void 0);
      if (o.delete(d), !!P) {
        if (m !== i || !t.value.some((H) => H.id === d)) {
          P();
          continue;
        }
        n.set(d, P);
      }
    }
  }
  return { syncRealtimeSubscriptions: h, clearRealtimeSubscriptions: p, refreshDriveStatus: g };
}
function Bi() {
  let t = 0;
  return () => {
    const e = ++t;
    return () => e === t;
  };
}
function Oi({ automations: t, types: e, loading: n, error: o, parentId: i, syncRealtimeSubscriptions: a }) {
  async function f() {
    try {
      const { data: h } = await bt.get("/api/v1/automations/types");
      e.value = h?.success ? h.types || [] : [];
    } catch {
      e.value = [];
    }
  }
  const g = Bi();
  async function x() {
    const h = g();
    n.value = !0, o.value = "";
    try {
      const { data: v } = await bt.get("/api/v1/automations", { params: { class: "automation", parent_id: i() } });
      if (!v?.success) throw new Error(ot(v?.error, "failed to load automations"));
      if (!h()) return;
      t.value = v.automations || [], a();
    } catch (v) {
      if (!h()) return;
      a(), o.value = ot(v, "failed to load automations");
    } finally {
      h() && (n.value = !1);
    }
  }
  async function p() {
    await f(), await x();
  }
  return { fetchTypes: f, fetchAutomations: x, reload: p };
}
function Fi(t, e, n) {
  async function o(i) {
    t.value = i.id, e.value = "";
    try {
      const { data: a } = await bt.get(`/api/v1/automations/${encodeURIComponent(i.id)}/export`);
      if (!a?.success || !a.artifact)
        throw new Error(a?.error?.message || a?.error || "Automation export failed.");
      const f = n(i).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "automation", g = new Blob([`${JSON.stringify(a.artifact, null, 2)}
`], { type: "application/json" }), x = URL.createObjectURL(g), p = document.createElement("a");
      p.href = x, p.download = `${f}.automation.json`, document.body.appendChild(p), p.click(), p.remove(), URL.revokeObjectURL(x);
    } catch (a) {
      e.value = ot(a, "Automation export failed.");
    } finally {
      t.value = "";
    }
  }
  return { exportAutomation: o };
}
const Ni = { class: "kx" }, Ui = {
  key: 0,
  class: "kx-head"
}, Hi = { class: "kx-head-icon" }, Vi = { class: "kx-head-actions" }, Ki = { class: "kx-count" }, qi = { class: "kx-search" }, Wi = {
  key: 1,
  class: "kx-err"
}, Yi = {
  key: 2,
  class: "kx-body"
}, Zi = {
  key: 0,
  class: "kx-loading"
}, Gi = {
  key: 1,
  class: "kx-empty"
}, Xi = { class: "kx-empty-ico" }, Ji = {
  key: 2,
  class: "kx-empty"
}, Qi = {
  key: 3,
  class: "kx-list"
}, ts = ["aria-label", "onClick", "disabled"], es = { class: "kx-ficon" }, ns = { class: "kx-id" }, os = ["title"], rs = { class: "kx-sub" }, as = { key: 0 }, is = { key: 1 }, ss = { key: 2 }, ls = { class: "kx-actions" }, us = {
  key: 0,
  class: "kx-rowfoot"
}, ds = ["title"], cs = { class: "kx-modal-head-icon" }, bs = { class: "kx-modal-head-text" }, ps = { class: "kx-modal-head-title" }, fs = { class: "kx-modal-head-sub" }, ms = { class: "kx-modal-body" }, gs = { class: "kx-modal-head-icon" }, vs = { class: "kx-modal-head-text" }, hs = { class: "kx-modal-head-title" }, ys = { class: "kx-modal-head-sub" }, ks = { class: "kx-modal-body" }, xs = { class: "kx-modal-body" }, _s = {
  key: 0,
  class: "kx-delopts"
}, ws = ["onUpdate:modelValue"], $s = { class: "kx-delopt-copy" }, Cs = { class: "kx-delopt-t" }, Ss = {
  key: 0,
  class: "kx-delopt-d"
}, Ps = {
  key: 1,
  class: "kx-err inline",
  role: "alert",
  "data-testid": "automations-delete-error"
}, Ds = /* @__PURE__ */ ft({
  __name: "automations",
  setup(t) {
    const e = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = M([]), o = M([]), i = M(!1), a = M(""), f = M(""), g = M(""), x = /* @__PURE__ */ new Map(), p = M(""), h = M(""), v = ji({ automations: n, types: o, query: f, drawerId: h }), {
      filtered: m,
      pretty: d,
      typeFor: S,
      iconFor: P,
      hasAction: H,
      actionItemsFor: F,
      recoverFor: nt,
      manageTag: Y,
      manageLocation: L,
      manageConfig: j,
      metrics: q,
      detailMetrics: X,
      isTerminal: it,
      rowMessage: Z,
      statusOf: k,
      isPaused: s,
      subtitleLine: y,
      drawerAutomation: z,
      drawerType: B
    } = v, mt = Ti(n, S), { syncRealtimeSubscriptions: U, clearRealtimeSubscriptions: I, refreshDriveStatus: E } = mt, ut = Fi(p, a, d), { exportAutomation: dn } = ut, gt = Fn(), cn = Nn(), _t = A(() => gt.value?.mode === "create"), Kt = A(() => gt.value?.mode === "component"), bn = oo(gt), pe = A(() => String(gt.value?.componentId || "").trim()), pn = A(() => String(gt.value?.typeId || "").trim()), fn = A(() => pe.value || bn.value), mn = Oi({
      automations: n,
      types: o,
      loading: i,
      error: a,
      parentId: () => pe.value || void 0,
      syncRealtimeSubscriptions: U
    }), { fetchAutomations: vt, reload: qt } = mn, wt = Ri({
      types: o,
      createMode: _t,
      componentMode: Kt,
      effectiveParentId: fn,
      preferredTypeId: pn,
      inputPreset: A(() => ro(gt.value?.input)),
      emitHost: (_, w) => cn(_, w),
      reload: () => qt()
    }), st = M(null), Tt = M({}), $t = M(!1), ht = M(""), tt = M(null), dt = M(null);
    function gn(_) {
      dt.value = _;
    }
    function fe() {
      dt.value = null;
    }
    function vn(_) {
      const w = _?.id || "";
      return {
        resource_id: w,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(w)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(w)}`,
        title: _ ? d(_) : ""
      };
    }
    function me(_, w) {
      if (!_.deleting_at)
        switch (w) {
          case "reconfigure":
            Cn(_);
            break;
          case "share":
            gn(_);
            break;
          case "export":
            dn(_);
            break;
          case "delete":
            Yt(_);
            break;
          default:
            Wt(_, w);
        }
    }
    function ge(_) {
      if (_.deleting_at) return;
      const w = nt(_);
      w && Wt(_, w);
    }
    function hn(_) {
      h.value = _.id, vt();
    }
    function yn() {
      h.value = "";
    }
    function kn(_) {
      const w = z.value;
      w && me(w, _);
    }
    function xn() {
      const _ = z.value;
      _ && ge(_);
    }
    async function Wt(_, w) {
      if (_.deleting_at || g.value) return;
      g.value = _.id, a.value = "";
      const b = S(_)?.controls?.some((et) => et.name === w) === !0, W = `${_.id}:${w}`, ve = b ? x.get(W) || crypto.randomUUID() : "";
      b && x.set(W, ve);
      try {
        const { data: et } = await bt.post(
          `/api/v1/automations/${_.id}/actions/${w}`,
          b ? { request_id: ve } : {}
        );
        if (!et?.success) {
          a.value = ot({ response: { data: et } }, `${w} failed`);
          return;
        }
        if (b && et.result?.state === "succeeded" && x.delete(W), et.result && typeof et.result == "object") {
          const { success: Xt, ...Pn } = et.result;
          _.public_state = { ..._.public_state || {}, ...Pn };
        }
        if (_.drive_status?.drives?.length)
          await E(_.id);
        else if (w === "pause" || w === "resume") {
          const Xt = typeof et.result?.paused == "boolean" ? et.result.paused : w === "pause";
          _.public_state = {
            ..._.public_state || {},
            enabled: !Xt,
            status: et.result?.status || (Xt ? "paused" : "active")
          };
        }
      } catch (et) {
        a.value = ot(et, `${w} failed`);
      } finally {
        g.value = "";
      }
    }
    async function _n(_) {
      await Wt(_, s(_) ? "resume" : "pause");
    }
    function Yt(_) {
      st.value = _, ht.value = "";
      const w = S(_), b = {};
      for (const W of w?.delete_options || []) b[W.key] = !!W.default;
      Tt.value = b;
    }
    function Zt(_) {
      return _ ? S(_)?.delete_options || [] : [];
    }
    function wn(_) {
      tt.value = null, Yt(_);
    }
    async function $n() {
      const _ = st.value;
      if (_) {
        $t.value = !0, ht.value = "";
        try {
          const b = Zt(_).length ? { options: { ...Tt.value } } : {}, { data: W } = await bt.delete(`/api/v1/automations/${_.id}`, { data: b });
          W?.success ? (Sn(_.id, W), st.value = null, await vt()) : ht.value = ot({ response: { data: W } }, "failed to delete automation");
        } catch (w) {
          ht.value = ot(w, "failed to delete automation");
        } finally {
          $t.value = !1;
        }
      }
    }
    function Cn(_) {
      Y(_) && (tt.value = _);
    }
    async function Gt(_ = !0) {
      tt.value = null, _ && await qt();
    }
    Un(async () => {
      try {
        await qt(), _t.value && wt.openPreferredInstall();
      } catch (_) {
        a.value = ot(_, "host API unavailable");
      }
    }), le(() => {
      wt.unmountCustomInstallUi(), I();
    });
    const { acceptDeletion: Sn } = Fo(n, (_) => _.id, void 0, vt);
    return (_, w) => (l(), c("div", Ni, [
      _t.value ? $("", !0) : (l(), c("header", Ui, [
        Kt.value ? $("", !0) : (l(), c(K, { key: 0 }, [
          u("div", Hi, [
            D(r(R), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          w[10] || (w[10] = u("div", { class: "kx-head-text" }, [
            u("h1", { class: "kx-head-title" }, "Automations"),
            u("p", { class: "kx-head-sub" }, "Scheduled and event-driven jobs that run on their own.")
          ], -1))
        ], 64)),
        u("div", Vi, [
          u("span", Ki, C(n.value.length) + " automation" + C(n.value.length !== 1 ? "s" : ""), 1),
          u("div", qi, [
            D(r(R), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            ct(u("input", {
              "onUpdate:modelValue": w[0] || (w[0] = (b) => f.value = b),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search automations…"
            }, null, 512), [
              [ne, f.value]
            ])
          ]),
          D(r(G), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: w[1] || (w[1] = (b) => r(wt).openPreferredInstall())
          }, {
            icon: O(({ class: b }) => [
              D(r(R), {
                icon: "tabler:plus",
                class: V(b),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ])),
      !_t.value && a.value ? (l(), c("div", Wi, C(a.value), 1)) : $("", !0),
      _t.value ? $("", !0) : (l(), c("div", Yi, [
        i.value && !n.value.length ? (l(), c("div", Zi, [
          D(r(R), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          w[11] || (w[11] = at(" Loading… ", -1))
        ])) : n.value.length ? r(m).length ? (l(), c("div", Qi, [
          (l(!0), c(K, null, rt(r(m), (b) => (l(), c("div", {
            key: b.id,
            class: V(["kx-row", h.value === b.id && "is-open"])
          }, [
            u("button", {
              type: "button",
              class: "kx-open",
              "aria-label": `Open ${r(d)(b)} details`,
              onClick: (W) => !b.deleting_at && hn(b),
              disabled: !!b.deleting_at
            }, [
              u("span", es, [
                D(r(R), {
                  icon: r(P)(b),
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              u("span", ns, [
                u("span", {
                  class: "kx-name",
                  title: r(d)(b)
                }, C(r(d)(b)), 9, os),
                u("span", rs, [
                  u("span", null, C(r(S)(b)?.title || "Automation"), 1),
                  r(y)(b) ? (l(), c("span", as, " · " + C(r(y)(b)), 1)) : $("", !0),
                  r(Pt)(b.drive_status).last ? (l(), c("span", is, " · last ran " + C(r(pt)(r(Pt)(b.drive_status).last, { future: !0 })), 1)) : $("", !0),
                  r(Pt)(b.drive_status).next ? (l(), c("span", ss, " · next " + C(r(pt)(r(Pt)(b.drive_status).next, { future: !0 })), 1)) : $("", !0)
                ])
              ])
            ], 8, ts),
            D(r(ue), {
              severity: r(sn)(r(k)(b).kind),
              class: "kx-badge kx-tag-sm"
            }, {
              default: O(() => [
                r(k)(b).kind === "live" ? (l(), N(r(R), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : $("", !0),
                at(" " + C(r(k)(b).label), 1)
              ]),
              _: 2
            }, 1032, ["severity"]),
            u("div", ls, [
              (r(H)(b, "pause") || r(H)(b, "resume")) && !r(it)(b) ? (l(), N(r(G), {
                key: 0,
                type: "button",
                severity: "secondary",
                outlined: "",
                size: "small",
                disabled: !!b.deleting_at || g.value === b.id,
                "aria-label": `${r(s)(b) ? "Resume" : "Pause"} ${r(d)(b)}`,
                title: r(s)(b) ? "Resume" : "Pause",
                onClick: (W) => _n(b)
              }, {
                icon: O(({ class: W }) => [
                  D(r(R), {
                    icon: r(s)(b) ? "tabler:player-play-filled" : "tabler:player-pause",
                    "aria-hidden": "true",
                    class: V(W)
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["disabled", "aria-label", "title", "onClick"])) : $("", !0),
              D(Qe, {
                items: r(F)(b),
                name: r(d)(b),
                busy: !!b.deleting_at || g.value === b.id,
                onSelect: (W) => me(b, W)
              }, null, 8, ["items", "name", "busy", "onSelect"])
            ]),
            b.deleting_at || r(Z)(b) || r(X)(b).length || r(q)(b).length ? (l(), c("div", us, [
              D(Mo, {
                state: b,
                onRetry: (W) => Yt(b)
              }, null, 8, ["state", "onRetry"]),
              r(Z)(b) ? (l(), c("div", {
                key: 0,
                class: V(["kx-rowmsg", `kx-rowmsg-${r(Z)(b)?.tone}`])
              }, [
                D(r(R), {
                  icon: r(Z)(b)?.tone === "error" ? "tabler:alert-circle" : "tabler:circle-check",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                u("span", {
                  class: "kx-rowmsg-txt",
                  title: r(Z)(b)?.text
                }, C(r(Z)(b)?.text), 9, ds),
                r(Z)(b)?.tone === "error" && r(nt)(b) ? (l(), N(r(G), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  text: "",
                  size: "small",
                  class: "kx-recover",
                  "data-testid": "row-recover",
                  "aria-label": `Recover ${r(d)(b)}`,
                  disabled: !!b.deleting_at || g.value === b.id,
                  label: "Recover",
                  onClick: (W) => ge(b)
                }, {
                  icon: O(({ class: W }) => [
                    D(r(R), {
                      icon: "tabler:rotate-clockwise-2",
                      "aria-hidden": "true",
                      class: V(W)
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])) : $("", !0)
              ], 2)) : $("", !0),
              D(da, {
                face: r(q)(b),
                detail: r(X)(b)
              }, null, 8, ["face", "detail"])
            ])) : $("", !0)
          ], 2))), 128))
        ])) : (l(), c("div", Ji, [...w[14] || (w[14] = [
          u("div", { class: "kx-empty-title" }, "No matches", -1),
          u("div", { class: "kx-empty-sub" }, "No automations match the current search.", -1)
        ])])) : (l(), c("div", Gi, [
          u("div", Xi, [
            D(r(R), {
              icon: "tabler:bolt",
              "aria-hidden": "true"
            })
          ]),
          w[12] || (w[12] = u("div", { class: "kx-empty-title" }, "No automations yet", -1)),
          w[13] || (w[13] = u("div", { class: "kx-empty-sub" }, "Choose an automation type to get started.", -1)),
          D(r(G), {
            type: "button",
            "data-testid": "automations-add",
            label: "Add automation",
            onClick: w[2] || (w[2] = (b) => r(wt).openPreferredInstall())
          }, {
            icon: O(({ class: b }) => [
              D(r(R), {
                icon: "tabler:plus",
                class: V(b),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]))
      ])),
      r(z) ? (l(), N(Mi, {
        key: 3,
        automation: r(z),
        type: r(B),
        onClose: yn,
        onAction: kn,
        onRecover: xn,
        onChanged: r(vt)
      }, null, 8, ["automation", "type", "onChanged"])) : $("", !0),
      D(na, {
        flow: r(wt),
        "component-mode": Kt.value,
        "dialog-pt": e
      }, null, 8, ["flow", "component-mode"]),
      tt.value ? (l(), N(r(Dt), {
        key: 4,
        visible: !!tt.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: e,
        class: "kx-modal kx-modal-manage",
        "aria-label": r(d)(tt.value),
        "onUpdate:visible": w[6] || (w[6] = (b) => {
          b || Gt(!1);
        })
      }, {
        header: O(() => [
          u("span", cs, [
            D(r(R), {
              icon: r(P)(tt.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          u("span", bs, [
            u("span", ps, C(r(d)(tt.value)), 1),
            u("span", fs, C(r(S)(tt.value)?.title || "Automation"), 1)
          ])
        ]),
        footer: O(() => [
          D(r(G), {
            type: "button",
            class: "kx-foot-delete",
            severity: "danger",
            outlined: "",
            label: "Delete",
            onClick: w[5] || (w[5] = (b) => wn(tt.value))
          }, {
            icon: O(({ class: b }) => [
              D(r(R), {
                icon: "tabler:trash",
                "aria-hidden": "true",
                class: V(b)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ]),
        default: O(() => [
          u("div", ms, [
            D(Ut, {
              class: "kx-manage-host",
              tag: r(Y)(tt.value),
              config: r(j)(tt.value),
              meta: { location: r(L)(tt.value) },
              onCreated: w[3] || (w[3] = (b) => Gt(!0)),
              onClose: w[4] || (w[4] = (b) => Gt(!0)),
              onChange: r(vt)
            }, null, 8, ["tag", "config", "meta", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : $("", !0),
      dt.value ? (l(), N(r(Dt), {
        key: 5,
        visible: !!dt.value,
        modal: "",
        pt: e,
        class: "kx-modal",
        "aria-label": `Share ${r(d)(dt.value)}`,
        "onUpdate:visible": w[7] || (w[7] = (b) => {
          b || fe();
        })
      }, {
        header: O(() => [
          u("span", gs, [
            D(r(R), {
              icon: "tabler:users",
              "aria-hidden": "true"
            })
          ]),
          u("span", vs, [
            u("span", hs, "Share " + C(r(d)(dt.value)), 1),
            u("span", ys, C(r(S)(dt.value)?.title || "Automation"), 1)
          ])
        ]),
        default: O(() => [
          u("div", ks, [
            D(Ut, {
              class: "kx-manage-host",
              tag: "kickside-share",
              config: vn(dt.value),
              onClose: fe,
              onChange: r(vt)
            }, null, 8, ["config", "onChange"])
          ])
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])) : $("", !0),
      st.value ? (l(), N(r(Dt), {
        key: 6,
        visible: !!st.value,
        modal: !0,
        "dismissable-mask": !0,
        pt: e,
        class: "kx-modal",
        header: "Delete automation",
        "aria-label": "Delete automation",
        "onUpdate:visible": w[9] || (w[9] = (b) => {
          b || (st.value = null);
        })
      }, {
        footer: O(() => [
          D(r(G), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: $t.value,
            onClick: w[8] || (w[8] = (b) => st.value = null)
          }, null, 8, ["disabled"]),
          D(r(G), {
            type: "button",
            "data-testid": "automations-confirm-delete",
            severity: "danger",
            label: "Delete",
            loading: $t.value,
            disabled: $t.value,
            onClick: $n
          }, {
            icon: O(({ class: b }) => [
              D(r(R), {
                icon: "tabler:trash",
                class: V(b),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ]),
        default: O(() => [
          u("div", xs, [
            u("p", null, [
              w[15] || (w[15] = at(" Delete ", -1)),
              u("strong", null, C(r(d)(st.value)), 1),
              w[16] || (w[16] = at("? It will stop running and its setup will be removed. This can't be undone. ", -1))
            ]),
            Zt(st.value).length ? (l(), c("div", _s, [
              (l(!0), c(K, null, rt(Zt(st.value), (b) => (l(), c("label", {
                key: b.key,
                class: "kx-delopt"
              }, [
                ct(u("input", {
                  "onUpdate:modelValue": (W) => Tt.value[b.key] = W,
                  type: "checkbox"
                }, null, 8, ws), [
                  [Te, Tt.value[b.key]]
                ]),
                u("span", $s, [
                  u("span", Cs, C(b.title || b.key), 1),
                  b.description ? (l(), c("span", Ss, C(b.description), 1)) : $("", !0)
                ])
              ]))), 128))
            ])) : $("", !0),
            ht.value ? (l(), c("div", Ps, C(ht.value), 1)) : $("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible"])) : $("", !0)
    ]));
  }
}), Bs = {
  rootComponent: Ds,
  plugins: [Hn]
};
export {
  Bs as mountConfig
};
//# sourceMappingURL=lazy-mount-sm8SAZm8.js.map
