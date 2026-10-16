import { openBlock as u, createElementBlock as p, mergeProps as I, renderSlot as O, createTextVNode as N, toDisplayString as S, resolveComponent as at, resolveDirective as se, withDirectives as G, createBlock as X, resolveDynamicComponent as Lt, withCtx as Z, createCommentVNode as $, normalizeClass as j, createElementVNode as a, computed as L, createVNode as A, Transition as je, Fragment as M, defineComponent as rt, renderList as W, unref as d, ref as B, vModelText as q, onMounted as de, watch as zt, onBeforeUnmount as Me, nextTick as Et, shallowRef as Fe, isRef as Qt } from "vue";
import { Icon as R } from "@iconify/vue";
import { B as it, l as ce, b as ue, L as Ve, d as ot, f as gt, U as Re, i as Jt, j as Ne, r as be, m as He, a as Ue, v as Ke, C as Ge, n as We, S as Ze, _ as Xe, o as Ye, q as qe, k as Qe } from "./primevue-plugin-Dn0ACs8V.js";
import { b as Vt, f as J, R as pe, d as Je, c as Rt, B as tn, a as en, x as Pt, g as nn, e as on, s as rn } from "./index-CAXh6BYi.js";
import { loadByTagName as Bt, api as It } from "@wippy-fe/proxy";
import { u as an, b as ln, t as sn, W as dn } from "./trait-presentation-BWGyO4dN.js";
import { _ as cn } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
var un = `
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
`, bn = {
  root: function(e) {
    var n = e.props, r = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": ue(n.value) && String(n.value).length === 1,
      "p-badge-dot": ce(n.value) && !r.$slots.default,
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
}, pn = it.extend({
  name: "badge",
  style: un,
  classes: bn
}), gn = {
  name: "BaseBadge",
  extends: Vt,
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
  style: pn,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function ht(t) {
  "@babel/helpers - typeof";
  return ht = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ht(t);
}
function te(t, e, n) {
  return (e = hn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function hn(t) {
  var e = fn(t, "string");
  return ht(e) == "symbol" ? e : e + "";
}
function fn(t, e) {
  if (ht(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ht(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ge = {
  name: "Badge",
  extends: gn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return J(te(te({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, mn = ["data-p"];
function vn(t, e, n, r, b, o) {
  return u(), p("span", I({
    class: t.cx("root"),
    "data-p": o.dataP
  }, t.ptmi("root")), [O(t.$slots, "default", {}, function() {
    return [N(S(t.value), 1)];
  })], 16, mn);
}
ge.render = vn;
var yn = `
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
function ft(t) {
  "@babel/helpers - typeof";
  return ft = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ft(t);
}
function K(t, e, n) {
  return (e = kn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function kn(t) {
  var e = xn(t, "string");
  return ft(e) == "symbol" ? e : e + "";
}
function xn(t, e) {
  if (ft(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ft(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var wn = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-button p-component", K(K(K(K(K(K(K(K(K({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", K({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, _n = it.extend({
  name: "button",
  style: yn,
  classes: wn
}), Cn = {
  name: "BaseButton",
  extends: Vt,
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
  style: _n,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function mt(t) {
  "@babel/helpers - typeof";
  return mt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, mt(t);
}
function D(t, e, n) {
  return (e = Sn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Sn(t) {
  var e = $n(t, "string");
  return mt(e) == "symbol" ? e : e + "";
}
function $n(t, e) {
  if (mt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (mt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var vt = {
  name: "Button",
  extends: Cn,
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
      return I(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return ce(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return J(D(D(D(D(D(D(D(D(D(D({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return J(D(D({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return J(D(D({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Je,
    Badge: ge
  },
  directives: {
    ripple: pe
  }
}, In = ["data-p"], zn = ["data-p"];
function An(t, e, n, r, b, o) {
  var k = at("SpinnerIcon"), y = at("Badge"), f = se("ripple");
  return t.asChild ? O(t.$slots, "default", {
    key: 1,
    class: j(t.cx("root")),
    a11yAttrs: o.a11yAttrs
  }) : G((u(), X(Lt(t.as), I({
    key: 0,
    class: t.cx("root"),
    "data-p": o.dataP
  }, o.attrs), {
    default: Z(function() {
      return [O(t.$slots, "default", {}, function() {
        return [t.loading ? O(t.$slots, "loadingicon", I({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (u(), p("span", I({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (u(), X(k, I({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : O(t.$slots, "icon", I({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (u(), p("span", I({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": o.dataIconP
          }, t.ptm("icon")), null, 16, In)) : $("", !0)];
        }), t.label ? (u(), p("span", I({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": o.dataLabelP
        }), S(t.label), 17, zn)) : $("", !0), t.badge ? (u(), X(y, {
          key: 3,
          value: t.badge,
          class: j(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : $("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[f]]);
}
vt.render = An;
var he = {
  name: "WindowMaximizeIcon",
  extends: Rt
};
function Pn(t) {
  return Bn(t) || En(t) || Ln(t) || Tn();
}
function Tn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ln(t, e) {
  if (t) {
    if (typeof t == "string") return Ot(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ot(t, e) : void 0;
  }
}
function En(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Bn(t) {
  if (Array.isArray(t)) return Ot(t);
}
function Ot(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function On(t, e, n, r, b, o) {
  return u(), p("svg", I({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Pn(e[0] || (e[0] = [a("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
he.render = On;
var fe = {
  name: "WindowMinimizeIcon",
  extends: Rt
};
function Dn(t) {
  return Vn(t) || Fn(t) || Mn(t) || jn();
}
function jn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Mn(t, e) {
  if (t) {
    if (typeof t == "string") return Dt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dt(t, e) : void 0;
  }
}
function Fn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Vn(t) {
  if (Array.isArray(t)) return Dt(t);
}
function Dt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Rn(t, e, n, r, b, o) {
  return u(), p("svg", I({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Dn(e[0] || (e[0] = [a("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
fe.render = Rn;
var Nn = it.extend({
  name: "focustrap-directive"
}), Hn = tn.extend({
  style: Nn
});
function yt(t) {
  "@babel/helpers - typeof";
  return yt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, yt(t);
}
function ee(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(b) {
      return Object.getOwnPropertyDescriptor(t, b).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ne(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ee(Object(n), !0).forEach(function(r) {
      Un(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ee(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Un(t, e, n) {
  return (e = Kn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Kn(t) {
  var e = Gn(t, "string");
  return yt(e) == "symbol" ? e : e + "";
}
function Gn(t, e) {
  if (yt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (yt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Wn = Hn.extend("focustrap", {
  mounted: function(e, n) {
    var r = n.value || {}, b = r.disabled;
    b || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var r = n.value || {}, b = r.disabled;
    b && this.unbind(e);
  },
  unmounted: function(e) {
    this.unbind(e);
  },
  methods: {
    getComputedSelector: function(e) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(e ?? "");
    },
    bind: function(e, n) {
      var r = this, b = n.value || {}, o = b.onFocusIn, k = b.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(y) {
        y.forEach(function(f) {
          if (f.type === "childList" && !e.contains(document.activeElement)) {
            var z = function(T) {
              var v = Jt(T) ? Jt(T, r.getComputedSelector(e.$_pfocustrap_focusableselector)) ? T : gt(e, r.getComputedSelector(e.$_pfocustrap_focusableselector)) : gt(T);
              return ue(v) ? v : T.nextSibling && z(T.nextSibling);
            };
            ot(z(f.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(y) {
        return o && o(y);
      }, e.$_pfocustrap_focusoutlistener = function(y) {
        return k && k(y);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: ne(ne({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var r = n.value || {}, b = r.autoFocusSelector, o = b === void 0 ? "" : b, k = r.firstFocusableSelector, y = k === void 0 ? "" : k, f = r.autoFocus, z = f === void 0 ? !1 : f, _ = gt(e, "[autofocus]".concat(this.getComputedSelector(o)));
      z && !_ && (_ = gt(e, this.getComputedSelector(y))), ot(_);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, r = e.currentTarget, b = e.relatedTarget, o = b === r.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(b)) ? gt(r.parentElement, this.getComputedSelector(r.$_pfocustrap_focusableselector)) : r.$_pfocustrap_lasthiddenfocusableelement;
      ot(o);
    },
    onLastHiddenElementFocus: function(e) {
      var n, r = e.currentTarget, b = e.relatedTarget, o = b === r.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(b)) ? Ve(r.parentElement, this.getComputedSelector(r.$_pfocustrap_focusableselector)) : r.$_pfocustrap_firsthiddenfocusableelement;
      ot(o);
    },
    createHiddenFocusableElements: function(e, n) {
      var r = this, b = n.value || {}, o = b.tabIndex, k = o === void 0 ? 0 : o, y = b.firstFocusableSelector, f = y === void 0 ? "" : y, z = b.lastFocusableSelector, _ = z === void 0 ? "" : z, T = function(m) {
        return Re("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: k,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: m?.bind(r)
        });
      }, v = T(this.onFirstHiddenElementFocus), i = T(this.onLastHiddenElementFocus);
      v.$_pfocustrap_lasthiddenfocusableelement = i, v.$_pfocustrap_focusableselector = f, v.setAttribute("data-pc-section", "firstfocusableelement"), i.$_pfocustrap_firsthiddenfocusableelement = v, i.$_pfocustrap_focusableselector = _, i.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(v), e.append(i);
    }
  }
});
function oe() {
  He({
    variableName: be("scrollbar.width").name
  });
}
function re() {
  Ne({
    variableName: be("scrollbar.width").name
  });
}
var Zn = `
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
`, Xn = {
  mask: function(e) {
    var n = e.position, r = e.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: r ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, Yn = {
  mask: function(e) {
    var n = e.props, r = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], b = r.find(function(o) {
      return o === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, b ? "p-dialog-".concat(b) : ""];
  },
  root: function(e) {
    var n = e.props, r = e.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && r.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, qn = it.extend({
  name: "dialog",
  style: Zn,
  classes: Yn,
  inlineStyles: Xn
}), Qn = {
  name: "BaseDialog",
  extends: Vt,
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
  style: qn,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, me = {
  name: "Dialog",
  extends: Qn,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: L(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && Pt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && Pt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Ye(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), ot(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && Pt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(e) {
      this.maskMouseDownTarget = e.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var e = function(b) {
        return b && b.querySelector("[autofocus]");
      }, n = this.$slots.footer && e(this.footerContainer);
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && ot(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? oe() : re());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && oe();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && re();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Xe(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var r in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(r, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[r], ` !important;
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
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Ze(document.body, {
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
          var r = Ke(e.container), b = Ge(e.container), o = n.pageX - e.lastPageX, k = n.pageY - e.lastPageY, y = e.container.getBoundingClientRect(), f = y.left + o, z = y.top + k, _ = We(), T = getComputedStyle(e.container), v = parseFloat(T.marginLeft), i = parseFloat(T.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (f >= e.minX && f + r < _.width && (e.lastPageX = n.pageX, e.container.style.left = f - v + "px"), z >= e.minY && z + b < _.height && (e.lastPageY = n.pageY, e.container.style.top = z - i + "px")) : (e.lastPageX = n.pageX, e.container.style.left = f - v + "px", e.lastPageY = n.pageY, e.container.style.top = z - i + "px");
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
      return J({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: pe,
    focustrap: Wn
  },
  components: {
    Button: vt,
    Portal: Ue,
    WindowMinimizeIcon: fe,
    WindowMaximizeIcon: he,
    TimesIcon: en
  }
};
function kt(t) {
  "@babel/helpers - typeof";
  return kt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, kt(t);
}
function ae(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(b) {
      return Object.getOwnPropertyDescriptor(t, b).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ie(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ae(Object(n), !0).forEach(function(r) {
      Jn(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ae(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Jn(t, e, n) {
  return (e = to(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function to(t) {
  var e = eo(t, "string");
  return kt(e) == "symbol" ? e : e + "";
}
function eo(t, e) {
  if (kt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (kt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var no = ["data-p"], oo = ["aria-labelledby", "aria-modal", "data-p"], ro = ["id"], ao = ["data-p"];
function io(t, e, n, r, b, o) {
  var k = at("Button"), y = at("Portal"), f = se("focustrap");
  return u(), X(y, {
    appendTo: t.appendTo
  }, {
    default: Z(function() {
      return [b.containerVisible ? (u(), p("div", I({
        key: 0,
        ref: o.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return o.onMaskMouseDown && o.onMaskMouseDown.apply(o, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return o.onMaskMouseUp && o.onMaskMouseUp.apply(o, arguments);
        }),
        "data-p": o.dataP
      }, t.ptm("mask")), [A(je, I({
        name: "p-dialog",
        onEnter: o.onEnter,
        onAfterEnter: o.onAfterEnter,
        onBeforeLeave: o.onBeforeLeave,
        onLeave: o.onLeave,
        onAfterLeave: o.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: Z(function() {
          return [t.visible ? G((u(), p("div", I({
            key: 0,
            ref: o.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": o.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": o.dataP
          }, t.ptmi("root")), [t.$slots.container ? O(t.$slots, "container", {
            key: 0,
            closeCallback: o.close,
            maximizeCallback: function(_) {
              return o.maximize(_);
            },
            initDragCallback: o.initDrag
          }) : (u(), p(M, {
            key: 1
          }, [t.showHeader ? (u(), p("div", I({
            key: 0,
            ref: o.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return o.initDrag && o.initDrag.apply(o, arguments);
            })
          }, t.ptm("header")), [O(t.$slots, "header", {
            class: j(t.cx("title"))
          }, function() {
            return [t.header ? (u(), p("span", I({
              key: 0,
              id: o.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), S(t.header), 17, ro)) : $("", !0)];
          }), a("div", I({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? O(t.$slots, "maximizebutton", {
            key: 0,
            maximized: b.maximized,
            maximizeCallback: function(_) {
              return o.maximize(_);
            }
          }, function() {
            return [A(k, I({
              ref: o.maximizableRef,
              autofocus: b.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: o.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: Z(function(z) {
                return [O(t.$slots, "maximizeicon", {
                  maximized: b.maximized
                }, function() {
                  return [(u(), X(Lt(o.maximizeIconComponent), I({
                    class: [z.class, b.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : $("", !0), t.closable ? O(t.$slots, "closebutton", {
            key: 1,
            closeCallback: o.close
          }, function() {
            return [A(k, I({
              ref: o.closeButtonRef,
              autofocus: b.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: o.close,
              "aria-label": o.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: Z(function(z) {
                return [O(t.$slots, "closeicon", {}, function() {
                  return [(u(), X(Lt(t.closeIcon ? "span" : "TimesIcon"), I({
                    class: [t.closeIcon, z.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : $("", !0)], 16)], 16)) : $("", !0), a("div", I({
            ref: o.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": o.dataP
          }, ie(ie({}, t.contentProps), t.ptm("content"))), [O(t.$slots, "default")], 16, ao), t.footer || t.$slots.footer ? (u(), p("div", I({
            key: 1,
            ref: o.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [O(t.$slots, "footer", {}, function() {
            return [N(S(t.footer), 1)];
          })], 16)) : $("", !0)], 64))], 16, oo)), [[f, {
            disabled: !t.modal
          }]]) : $("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, no)) : $("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
me.render = io;
var lo = `
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`, so = {
  root: {
    position: "relative"
  }
}, co = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, uo = it.extend({
  name: "toggleswitch",
  style: lo,
  classes: co,
  inlineStyles: so
}), bo = {
  name: "BaseToggleSwitch",
  extends: nn,
  props: {
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
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
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    }
  },
  style: uo,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, jt = {
  name: "ToggleSwitch",
  extends: bo,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(e) {
      if (!this.disabled && !this.readonly) {
        var n = this.checked ? this.falseValue : this.trueValue;
        this.writeValue(n, e), this.$emit("change", e);
      }
    },
    onFocus: function(e) {
      this.$emit("focus", e);
    },
    onBlur: function(e) {
      var n, r;
      this.$emit("blur", e), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, e);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return J({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, po = ["data-p-checked", "data-p-disabled", "data-p"], go = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], ho = ["data-p"], fo = ["data-p"];
function mo(t, e, n, r, b, o) {
  return u(), p("div", I({
    class: t.cx("root"),
    style: t.sx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-disabled": t.disabled,
    "data-p": o.dataP
  }), [a("input", I({
    id: t.inputId,
    type: "checkbox",
    role: "switch",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    checked: o.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-checked": o.checked,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, go), a("div", I({
    class: t.cx("slider")
  }, o.getPTOptions("slider"), {
    "data-p": o.dataP
  }), [a("div", I({
    class: t.cx("handle")
  }, o.getPTOptions("handle"), {
    "data-p": o.dataP
  }), [O(t.$slots, "handle", {
    checked: o.checked
  })], 16, fo)], 16, ho)], 16, po);
}
jt.render = mo;
const vo = {
  class: "kx-nav",
  role: "tablist",
  "aria-label": "Agent sections"
}, yo = ["aria-selected", "onClick"], ko = { class: "kx-nav-ico" }, xo = { class: "kx-nav-lbl" }, wo = {
  key: 0,
  class: "kx-nav-meta"
}, _o = /* @__PURE__ */ rt({
  __name: "AgentNav",
  props: {
    items: {},
    active: {}
  },
  emits: ["select"],
  setup(t, { emit: e }) {
    const n = e;
    return (r, b) => (u(), p("nav", vo, [
      (u(!0), p(M, null, W(t.items, (o) => (u(), p("button", {
        key: o.key,
        type: "button",
        role: "tab",
        class: j(["kx-nav-item", t.active === o.key && "kx-nav-item-on"]),
        "aria-selected": t.active === o.key,
        onClick: (k) => n("select", o.key)
      }, [
        a("span", ko, [
          A(d(R), {
            icon: o.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        a("span", xo, S(o.label), 1),
        o.meta ? (u(), p("span", wo, S(o.meta), 1)) : $("", !0)
      ], 10, yo))), 128))
    ]));
  }
});
var ve = {
  name: "MinusIcon",
  extends: Rt
};
function Co(t) {
  return zo(t) || Io(t) || $o(t) || So();
}
function So() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $o(t, e) {
  if (t) {
    if (typeof t == "string") return Mt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mt(t, e) : void 0;
  }
}
function Io(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function zo(t) {
  if (Array.isArray(t)) return Mt(t);
}
function Mt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Ao(t, e, n, r, b, o) {
  return u(), p("svg", I({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Co(e[0] || (e[0] = [a("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ve.render = Ao;
var Po = `
    .p-checkbox {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('checkbox.width');
        height: dt('checkbox.height');
    }

    .p-checkbox-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: dt('checkbox.border.radius');
    }

    .p-checkbox-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: dt('checkbox.border.radius');
        border: 1px solid dt('checkbox.border.color');
        background: dt('checkbox.background');
        width: dt('checkbox.width');
        height: dt('checkbox.height');
        transition:
            background dt('checkbox.transition.duration'),
            color dt('checkbox.transition.duration'),
            border-color dt('checkbox.transition.duration'),
            box-shadow dt('checkbox.transition.duration'),
            outline-color dt('checkbox.transition.duration');
        outline-color: transparent;
        box-shadow: dt('checkbox.shadow');
    }

    .p-checkbox-icon {
        transition-duration: dt('checkbox.transition.duration');
        color: dt('checkbox.icon.color');
        font-size: dt('checkbox.icon.size');
        width: dt('checkbox.icon.size');
        height: dt('checkbox.icon.size');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        border-color: dt('checkbox.hover.border.color');
    }

    .p-checkbox-checked .p-checkbox-box {
        border-color: dt('checkbox.checked.border.color');
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked .p-checkbox-icon {
        color: dt('checkbox.icon.checked.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
        border-color: dt('checkbox.checked.hover.border.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {
        color: dt('checkbox.icon.checked.hover.color');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.focus.border.color');
        box-shadow: dt('checkbox.focus.ring.shadow');
        outline: dt('checkbox.focus.ring.width') dt('checkbox.focus.ring.style') dt('checkbox.focus.ring.color');
        outline-offset: dt('checkbox.focus.ring.offset');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.checked.focus.border.color');
    }

    .p-checkbox.p-invalid > .p-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }

    .p-checkbox.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.filled.background');
    }

    .p-checkbox-checked.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
    }

    .p-checkbox.p-disabled {
        opacity: 1;
    }

    .p-checkbox.p-disabled .p-checkbox-box {
        background: dt('checkbox.disabled.background');
        border-color: dt('checkbox.checked.disabled.border.color');
    }

    .p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {
        color: dt('checkbox.icon.disabled.color');
    }

    .p-checkbox-sm,
    .p-checkbox-sm .p-checkbox-box {
        width: dt('checkbox.sm.width');
        height: dt('checkbox.sm.height');
    }

    .p-checkbox-sm .p-checkbox-icon {
        font-size: dt('checkbox.icon.sm.size');
        width: dt('checkbox.icon.sm.size');
        height: dt('checkbox.icon.sm.size');
    }

    .p-checkbox-lg,
    .p-checkbox-lg .p-checkbox-box {
        width: dt('checkbox.lg.width');
        height: dt('checkbox.lg.height');
    }

    .p-checkbox-lg .p-checkbox-icon {
        font-size: dt('checkbox.icon.lg.size');
        width: dt('checkbox.icon.lg.size');
        height: dt('checkbox.icon.lg.size');
    }
`, To = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-checkbox p-component", {
      "p-checkbox-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$pcCheckboxGroup ? n.$pcCheckboxGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-checkbox-sm p-inputfield-sm": r.size === "small",
      "p-checkbox-lg p-inputfield-lg": r.size === "large"
    }];
  },
  box: "p-checkbox-box",
  input: "p-checkbox-input",
  icon: "p-checkbox-icon"
}, Lo = it.extend({
  name: "checkbox",
  style: Po,
  classes: To
}), Eo = {
  name: "BaseCheckbox",
  extends: rn,
  props: {
    value: null,
    binary: Boolean,
    indeterminate: {
      type: Boolean,
      default: !1
    },
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    required: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
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
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    }
  },
  style: Lo,
  provide: function() {
    return {
      $pcCheckbox: this,
      $parentInstance: this
    };
  }
};
function xt(t) {
  "@babel/helpers - typeof";
  return xt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, xt(t);
}
function Bo(t, e, n) {
  return (e = Oo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Oo(t) {
  var e = Do(t, "string");
  return xt(e) == "symbol" ? e : e + "";
}
function Do(t, e) {
  if (xt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (xt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function jo(t) {
  return Ro(t) || Vo(t) || Fo(t) || Mo();
}
function Mo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Fo(t, e) {
  if (t) {
    if (typeof t == "string") return Ft(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ft(t, e) : void 0;
  }
}
function Vo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ro(t) {
  if (Array.isArray(t)) return Ft(t);
}
function Ft(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var ye = {
  name: "Checkbox",
  extends: Eo,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "update:indeterminate"],
  inject: {
    $pcCheckboxGroup: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_indeterminate: this.indeterminate
    };
  },
  watch: {
    indeterminate: function(e) {
      this.d_indeterminate = e, this.updateIndeterminate();
    }
  },
  mounted: function() {
    this.updateIndeterminate();
  },
  updated: function() {
    this.updateIndeterminate();
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          checked: this.checked,
          indeterminate: this.d_indeterminate,
          disabled: this.disabled
        }
      });
    },
    onChange: function(e) {
      var n = this;
      if (!this.disabled && !this.readonly) {
        var r = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, b;
        this.binary ? b = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? b = r.filter(function(o) {
          return !Qe(o, n.value);
        }) : b = r ? [].concat(jo(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(b, e) : this.writeValue(b, e), this.$emit("change", e);
      }
    },
    onFocus: function(e) {
      this.$emit("focus", e);
    },
    onBlur: function(e) {
      var n, r;
      this.$emit("blur", e), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, e);
    },
    updateIndeterminate: function() {
      this.$refs.input && (this.$refs.input.indeterminate = this.d_indeterminate);
    }
  },
  computed: {
    groupName: function() {
      return this.$pcCheckboxGroup ? this.$pcCheckboxGroup.groupName : this.$formName;
    },
    checked: function() {
      var e = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value;
      return this.d_indeterminate ? !1 : this.binary ? e === this.trueValue : qe(this.value, e);
    },
    dataP: function() {
      return J(Bo({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: on,
    MinusIcon: ve
  }
}, No = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Ho = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Uo = ["data-p"];
function Ko(t, e, n, r, b, o) {
  var k = at("CheckIcon"), y = at("MinusIcon");
  return u(), p("div", I({
    class: t.cx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-indeterminate": b.d_indeterminate || void 0,
    "data-p-disabled": t.disabled,
    "data-p": o.dataP
  }), [a("input", I({
    ref: "input",
    id: t.inputId,
    type: "checkbox",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    value: t.value,
    name: o.groupName,
    checked: o.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    required: t.required,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, Ho), a("div", I({
    class: t.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [O(t.$slots, "icon", {
    checked: o.checked,
    indeterminate: b.d_indeterminate,
    class: j(t.cx("icon")),
    dataP: o.dataP
  }, function() {
    return [o.checked ? (u(), X(k, I({
      key: 0,
      class: t.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : b.d_indeterminate ? (u(), X(y, I({
      key: 1,
      class: t.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : $("", !0)];
  })], 16, Uo)], 16, No);
}
ye.render = Ko;
const Go = {
  class: "tool-reference",
  "aria-label": "Tool reference"
}, Wo = { class: "kx-field" }, Zo = { class: "tool-reference__list" }, Xo = ["data-tool-id"], Yo = { class: "tool-reference__title" }, qo = { key: 0 }, Qo = { class: "tool-reference__description" }, Jo = { key: 0 }, tr = {
  key: 0,
  class: "kx-sec-foot"
}, er = { "aria-label": "Tool combinations" }, nr = ["data-trait-id"], or = {
  key: 0,
  class: "tool-reference__description"
}, rr = {
  key: 1,
  class: "tool-reference__description"
}, ar = { class: "tool-reference__list" }, ir = { class: "tool-reference__description" }, lr = {
  key: 0,
  class: "kx-sec-foot"
}, sr = /* @__PURE__ */ rt({
  __name: "ToolReference",
  props: {
    tools: {},
    traits: {},
    selected: {},
    activeTraits: {},
    selectableIds: {}
  },
  emits: ["change", "addCapability"],
  setup(t, { emit: e }) {
    const n = t, r = e, b = B(""), o = L(() => b.value.trim().toLowerCase());
    function k(v) {
      return [v.id, v.title, v.llm_alias, v.llm_description].some((i) => i?.toLowerCase().includes(o.value));
    }
    const y = L(() => n.tools.filter(k)), f = L(() => new Set(n.selectableIds ?? n.traits.map((v) => v.id)));
    function z(v) {
      const i = /* @__PURE__ */ new Map();
      for (const c of v.tools || []) {
        const m = new RegExp("^" + c.split("*").map((g) => g.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$"), x = n.tools.filter((g) => m.test(g.id));
        x.length || i.set(c, { id: c });
        for (const g of x) i.set(g.id, { id: g.id, tool: g });
      }
      return [...i.values()];
    }
    const _ = L(() => n.traits.filter((v) => v.tools?.length).map((v) => ({ trait: v, tools: z(v) })).filter(({ trait: v, tools: i }) => !o.value || [v.id, v.title, v.description, v.prompt].some((c) => c?.toLowerCase().includes(o.value)) || i.some(({ id: c, tool: m }) => m ? k(m) : c.toLowerCase().includes(o.value))));
    function T(v, i) {
      r("change", i ? [...n.selected, v] : n.selected.filter((c) => c !== v));
    }
    return (v, i) => (u(), p("section", Go, [
      a("label", Wo, [
        i[1] || (i[1] = a("span", { class: "kx-field-lbl" }, "Search tools and combinations", -1)),
        G(a("input", {
          "onUpdate:modelValue": i[0] || (i[0] = (c) => b.value = c),
          class: "kx-input",
          type: "search",
          "aria-label": "Search tool reference",
          placeholder: "Search names, descriptions or aliases…"
        }, null, 512), [
          [q, b.value]
        ])
      ]),
      i[5] || (i[5] = a("p", { class: "kx-sec-foot" }, "Descriptions and guidance below come from the installed tools and capabilities.", -1)),
      i[6] || (i[6] = a("h3", { class: "kx-group-title" }, "Tools", -1)),
      a("ul", Zo, [
        (u(!0), p(M, null, W(y.value, (c) => (u(), p("li", {
          key: c.id,
          "data-tool-id": c.id,
          class: "tool-reference__item"
        }, [
          a("div", Yo, [
            A(d(ye), {
              "model-value": t.selected.includes(c.id),
              binary: "",
              "aria-label": `Select ${c.title || c.id}`,
              "onUpdate:modelValue": (m) => T(c.id, m === !0)
            }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"]),
            a("strong", null, S(c.title || c.id), 1),
            c.llm_alias ? (u(), p("code", qo, S(c.llm_alias), 1)) : $("", !0)
          ]),
          a("p", Qo, S(c.llm_description || "No description declared."), 1),
          c.input_schema ? (u(), p("details", Jo, [
            i[2] || (i[2] = a("summary", null, "Declared inputs", -1)),
            a("pre", null, S(JSON.stringify(c.input_schema, null, 2)), 1)
          ])) : $("", !0)
        ], 8, Xo))), 128))
      ]),
      y.value.length ? $("", !0) : (u(), p("p", tr, "No matching tools.")),
      a("section", er, [
        i[3] || (i[3] = a("h3", { class: "kx-group-title" }, "Tool combinations", -1)),
        i[4] || (i[4] = a("p", { class: "kx-sec-foot" }, "Adding a capability includes its declared tools automatically.", -1)),
        (u(!0), p(M, null, W(_.value, ({ trait: c, tools: m }) => (u(), p("details", {
          key: c.id,
          "data-trait-id": c.id,
          class: "tool-reference__item"
        }, [
          a("summary", null, S(c.title || c.id), 1),
          c.description ? (u(), p("p", or, S(c.description), 1)) : $("", !0),
          c.prompt ? (u(), p("p", rr, S(c.prompt), 1)) : $("", !0),
          a("ul", ar, [
            (u(!0), p(M, null, W(m, ({ id: x, tool: g }) => (u(), p("li", { key: x }, [
              a("strong", null, S(g?.title || x), 1),
              a("p", ir, S(g?.llm_description || (g ? "No description declared." : "This tool is not in the available catalog.")), 1)
            ]))), 128))
          ]),
          A(d(vt), {
            label: t.activeTraits.includes(c.id) ? "Capability added" : f.value.has(c.id) ? "Add capability" : "Managed in agent settings",
            disabled: t.activeTraits.includes(c.id) || !f.value.has(c.id),
            severity: "secondary",
            outlined: "",
            onClick: (x) => r("addCapability", c.id)
          }, null, 8, ["label", "disabled", "onClick"])
        ], 8, nr))), 128)),
        _.value.length ? $("", !0) : (u(), p("p", lr, "No matching declared tool combinations."))
      ])
    ]));
  }
}), dr = /* @__PURE__ */ rt({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const n = t, r = e, b = B(null);
    let o = null;
    function k(f) {
      r("update:modelValue", f.detail || "");
    }
    async function y() {
      if (b.value) {
        o && o.removeEventListener("select", k), b.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await Bt("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        b.value && (o = document.createElement("wc-icon-picker"), o.setAttribute("value", n.modelValue || ""), n.fallback && o.setAttribute("fallback", n.fallback), o.addEventListener("select", k), b.value.appendChild(o));
      }
    }
    return de(y), zt(() => n.modelValue, (f) => {
      o && o.getAttribute("value") !== f && o.setAttribute("value", f || "");
    }), Me(() => {
      o && o.removeEventListener("select", k);
    }), (f, z) => (u(), p("div", {
      ref_key: "host",
      ref: b,
      class: "wc-iconfield"
    }, null, 512));
  }
});
function cr({ form: t, traits: e, redirectTrait: n }) {
  const { collapsedTraits: r, isTraitCollapsed: b, toggleTraitCollapsed: o } = an(), k = B(!0), y = L(() => e().filter((h) => h.id !== n)), f = (h) => t.value.traits.includes(h.id), z = L(() => y.value.filter(f));
  function _(h) {
    return !!h && typeof h == "object" && !Array.isArray(h);
  }
  function T(h) {
    const w = _(t.value.trait_contexts[h]) ? t.value.trait_contexts[h] : {}, V = _(t.value.trait_agent_options[h]) ? t.value.trait_agent_options[h] : null;
    return V ? { ...w, agent_options: V } : w;
  }
  function v(h, w) {
    if (_(w) && (Object.prototype.hasOwnProperty.call(w, "context") || Object.prototype.hasOwnProperty.call(w, "agent_options"))) {
      t.value.trait_contexts = { ...t.value.trait_contexts, [h]: _(w.context) ? w.context : {} };
      const Q = { ...t.value.trait_agent_options };
      _(w.agent_options) && Object.keys(w.agent_options).length ? Q[h] = w.agent_options : delete Q[h], t.value.trait_agent_options = Q;
      return;
    }
    t.value.trait_contexts = { ...t.value.trait_contexts, [h]: w };
    const V = { ...t.value.trait_agent_options };
    delete V[h], t.value.trait_agent_options = V;
  }
  const i = B(""), c = B(!1), m = B(null), x = B(null), g = B([]), C = B(-1), H = "agent-capabilities-listbox", F = L(() => {
    const h = i.value.trim().toLowerCase();
    return y.value.filter((w) => !f(w)).filter((w) => !h || (w.title || w.id).toLowerCase().includes(h) || (w.description || "").toLowerCase().includes(h));
  }), lt = L(() => C.value >= 0 ? `agent-capability-option-${C.value}` : void 0);
  zt([c, F], ([h, w]) => {
    g.value = [], C.value = h && w.length ? 0 : -1;
  });
  function wt(h, w) {
    h instanceof HTMLElement && (g.value[w] = h);
  }
  function st(h, w = !1) {
    C.value = h, !(!w || h < 0) && Et(() => g.value[h]?.scrollIntoView?.({ block: "nearest" }));
  }
  function dt() {
    c.value = !0, st(F.value.length ? 0 : -1, !0);
  }
  function _t(h) {
    const w = F.value.length;
    if (h.key === "Escape") {
      c.value = !1;
      return;
    }
    if (h.key === "Tab") {
      c.value = !1;
      return;
    }
    if (h.key === "ArrowDown" || h.key === "ArrowUp") {
      if (h.preventDefault(), c.value = !0, !w) return;
      const V = h.key === "ArrowDown" ? 1 : -1, Q = C.value < 0 ? V > 0 ? -1 : 0 : C.value;
      st((Q + V + w) % w, !0);
      return;
    }
    if (h.key === "Home" || h.key === "End") {
      if (!c.value || !w) return;
      h.preventDefault(), st(h.key === "Home" ? 0 : w - 1, !0);
      return;
    }
    if (h.key === "Enter" && c.value && C.value >= 0) {
      h.preventDefault();
      const V = F.value[C.value];
      V && Ct(V.id);
    }
  }
  function Ct(h) {
    t.value.traits.includes(h) || St(h), i.value = "", c.value = !1, C.value = -1, Et(() => x.value?.focus({ preventScroll: !0 }));
  }
  function St(h) {
    const w = t.value.traits.indexOf(h);
    w >= 0 ? (t.value.traits.splice(w, 1), r.value.has(h) && o(h)) : t.value.traits.push(h);
  }
  function tt(h) {
    t.value.tools = [...h];
  }
  return {
    collapsedTraits: r,
    isTraitCollapsed: b,
    toggleTraitCollapsed: o,
    showAdvancedTools: k,
    selectableTraits: y,
    traitOn: f,
    activeTraits: z,
    traitMountConfig: T,
    onTraitConfig: v,
    tintOf: sn,
    badgesOf: ln,
    traitQuery: i,
    traitMenuOpen: c,
    traitAddRoot: m,
    traitSearchInput: x,
    traitActiveIndex: C,
    traitListboxId: H,
    addableTraits: F,
    activeTraitOptionId: lt,
    setTraitOptionRef: wt,
    onTraitQueryInput: dt,
    onTraitQueryKeydown: _t,
    addTrait: Ct,
    toggleTrait: St,
    onToolsChange: tt
  };
}
const Tt = "kickside.agents.traits:redirect", ur = "kickside.agents.traits:artifacts", br = "kickside.uploads.traits:file_manager", $t = "user_agent:";
function pr({ form: t, agentId: e, agents: n, redirectTrait: r }) {
  const b = B("delegates");
  function o(c) {
    const m = c.detail;
    return m && Array.isArray(m.selected) ? m.selected.map(String) : [];
  }
  function k(c) {
    const m = new Set([e(), `${$t}${e()}`].filter(Boolean));
    t.value.delegates = c.filter((x) => !m.has(x));
  }
  const y = (c) => c.startsWith($t) ? c.slice($t.length) : c, f = L(() => {
    const c = t.value.trait_contexts[r];
    return c && Array.isArray(c.targets) ? c.targets : [];
  }), z = L(() => f.value.map((c) => c.agent_id));
  function _(c) {
    t.value.trait_contexts = { ...t.value.trait_contexts, [r]: { targets: c } };
    const m = t.value.traits.indexOf(r);
    c.length && m < 0 ? t.value.traits.push(r) : !c.length && m >= 0 && t.value.traits.splice(m, 1);
  }
  function T(c) {
    const m = new Set([e(), `${$t}${e()}`].filter(Boolean)), x = c.filter((C) => !m.has(C)), g = new Map(f.value.map((C) => [C.agent_id, C.comment]));
    _(x.map((C) => ({ agent_id: C, comment: g.get(C) || "" })));
  }
  function v(c) {
    const m = y(c);
    return n().find((x) => x.id === m)?.title || m;
  }
  function i(c, m) {
    _(f.value.map((x) => x.agent_id === c ? { ...x, comment: m } : x));
  }
  return { routeView: b, pickIds: o, onDelegatesChange: k, redirectTargets: f, redirectSelectedIds: z, setRedirects: _, onRedirectsChange: T, redirectLabel: v, setRedirectCommentById: i };
}
function le(t, e) {
  if (t && typeof t == "object") {
    const n = t, r = n.response?.data?.error;
    if (typeof r == "string") return r;
    if (r && typeof r == "object" && typeof r.message == "string")
      return r.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return e;
}
function gr({ form: t, valid: e, tab: n, blank: r, agentId: b, parentId: o, models: k, redirectTrait: y, emitSaved: f }) {
  const z = B(!1), _ = B(!1), T = B("");
  async function v(m) {
    z.value = !0, t.value = r(!1);
    try {
      const { data: x } = await It.get(`/api/v1/user-agents/${m}`);
      if (x?.success && x.agent) {
        const g = x.agent;
        t.value = {
          title: g.title || "",
          description: g.description || "",
          icon: g.icon || "tabler:robot",
          public: g.public === !0,
          prompt: g.prompt || "",
          model: g.model || k()[0]?.name || "",
          temperature: typeof g.temperature == "number" ? g.temperature : null,
          max_tokens: typeof g.max_tokens == "number" ? g.max_tokens : 8e3,
          thinking_effort: typeof g.thinking_effort == "number" ? g.thinking_effort : null,
          traits: Array.isArray(g.traits) ? [...g.traits] : [],
          trait_contexts: g.trait_contexts && typeof g.trait_contexts == "object" ? { ...g.trait_contexts } : {},
          trait_agent_options: g.trait_agent_options && typeof g.trait_agent_options == "object" ? { ...g.trait_agent_options } : {},
          tools: Array.isArray(g.tools) ? [...g.tools] : [],
          delegates: Array.isArray(g.delegates) ? [...g.delegates] : [],
          memory_target_id: g.memory_target_id || "",
          memory_provider_id: g.memory_provider_id || ""
        };
      }
    } catch (x) {
      T.value = le(x, "could not load agent");
    } finally {
      z.value = !1;
    }
  }
  function i(m) {
    const x = {};
    for (const g of t.value.traits)
      Object.prototype.hasOwnProperty.call(m, g) && (x[g] = m[g]);
    return x;
  }
  async function c() {
    if (!e.value) {
      T.value = t.value.title.trim() ? "Check the model and token limits." : "Name is required.", t.value.title.trim() && (n.value = "model");
      return;
    }
    _.value = !0, T.value = "";
    const m = {
      title: t.value.title.trim(),
      description: t.value.description,
      icon: t.value.icon,
      public: t.value.public,
      prompt: t.value.prompt,
      model: t.value.model,
      temperature: t.value.temperature ?? !1,
      max_tokens: t.value.max_tokens,
      thinking_effort: t.value.thinking_effort ?? !1,
      traits: t.value.traits,
      trait_contexts: i(t.value.trait_contexts),
      trait_agent_options: i(t.value.trait_agent_options),
      tools: t.value.tools,
      delegates: t.value.delegates,
      memory_target_id: t.value.memory_target_id,
      memory_provider_id: t.value.memory_provider_id
    }, x = b();
    if (x) {
      const g = /* @__PURE__ */ new Set([x, `user_agent:${x}`]);
      m.delegates = m.delegates.filter((H) => !g.has(H));
      const C = m.trait_contexts?.[y];
      if (C && Array.isArray(C.targets)) {
        const H = C.targets.filter((F) => !g.has(F.agent_id));
        m.trait_contexts = { ...m.trait_contexts, [y]: { ...C, targets: H } }, H.length || (m.traits = m.traits.filter((F) => F !== y));
      }
    }
    try {
      let g = x || "";
      if (x) {
        const { data: C } = await It.put(`/api/v1/user-agents/${x}`, m);
        if (!C?.success) throw new Error(C?.error || "save failed");
      } else {
        const { data: C } = await It.post("/api/v1/user-agents", { ...m, parent_id: o() || void 0 });
        if (!C?.success) throw new Error(C?.error || "create failed");
        g = C.component_id || "";
      }
      f(g);
    } catch (g) {
      T.value = le(g, "save failed");
    } finally {
      _.value = !1;
    }
  }
  return { loading: z, saving: _, error: T, loadAgent: v, save: c };
}
const hr = { class: "kx-modal-head" }, fr = { class: "kx-modal-head-icon" }, mr = { class: "kx-modal-head-text" }, vr = { class: "kx-modal-head-title" }, yr = { class: "kx-modal-head-sub" }, kr = {
  key: 0,
  class: "kx-2p"
}, xr = { class: "kx-loading" }, wr = {
  key: 1,
  class: "kx-2p"
}, _r = { class: "kx-2p-l" }, Cr = { class: "kx-form" }, Sr = { class: "kx-field" }, $r = { class: "kx-name-row" }, Ir = { class: "kx-field" }, zr = { class: "kx-2p-r" }, Ar = { class: "kx-2p-r-head" }, Pr = { class: "kx-2p-r-body" }, Tr = {
  key: 0,
  class: "kx-form kx-form-grow"
}, Lr = { class: "kx-field kx-field-grow" }, Er = {
  key: 1,
  class: "kx-form"
}, Br = { class: "kx-field" }, Or = ["value"], Dr = { class: "kx-field" }, jr = ["max"], Mr = {
  key: 0,
  class: "kx-field-err"
}, Fr = { class: "kx-field" }, Vr = { class: "kx-toggle" }, Rr = {
  key: 0,
  class: "kx-think"
}, Nr = { class: "kx-field-hint-inline" }, Hr = { class: "kx-field" }, Ur = {
  key: 0,
  class: "kx-toggle"
}, Kr = {
  key: 1,
  class: "kx-sec-foot"
}, Gr = {
  key: 2,
  class: "kx-think"
}, Wr = { class: "kx-field-hint-inline" }, Zr = {
  key: 2,
  class: "kx-form"
}, Xr = { class: "kx-group" }, Yr = { class: "kx-group-head" }, qr = { class: "kx-group-meta" }, Qr = ["aria-expanded", "aria-controls", "aria-activedescendant"], Jr = ["id"], ta = ["id", "onMouseenter", "onClick"], ea = { class: "kx-tadd-opt-text" }, na = { class: "kx-trait-name" }, oa = {
  key: 0,
  class: "kx-trait-desc"
}, ra = { class: "kx-trait-badges" }, aa = {
  key: 0,
  class: "kx-tadd-empty"
}, ia = {
  key: 0,
  class: "kx-traits"
}, la = { class: "kx-trait-row" }, sa = { class: "kx-trait-text" }, da = { class: "kx-trait-name" }, ca = {
  key: 0,
  class: "kx-trait-desc"
}, ua = { class: "kx-trait-badges" }, ba = { class: "kx-trait-actions" }, pa = ["aria-expanded", "title", "aria-label", "onClick"], ga = ["aria-label", "onClick"], ha = {
  key: 0,
  class: "kx-trait-cfg"
}, fa = {
  key: 1,
  class: "kx-sec-foot"
}, ma = { class: "kx-group" }, va = ["aria-expanded"], ya = { class: "kx-group-meta" }, ka = {
  key: 3,
  class: "kx-form"
}, xa = {
  class: "kx-seg",
  role: "tablist"
}, wa = ["aria-selected"], _a = {
  key: 0,
  class: "kx-seg-count"
}, Ca = ["aria-selected"], Sa = {
  key: 0,
  class: "kx-seg-count"
}, $a = ["selected"], Ia = ["selected"], za = {
  key: 0,
  class: "kx-redirect-comments"
}, Aa = { class: "kx-redirect-comment-name" }, Pa = ["value", "onInput"], Ta = { class: "kx-modal-foot" }, La = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, Ea = {
  key: 1,
  class: "kx-embed"
}, Ba = {
  class: "kx-modal kx-modal-agent kx-modal-embed",
  role: "dialog",
  "aria-modal": "true"
}, Na = /* @__PURE__ */ rt({
  __name: "AgentForm",
  props: {
    open: { type: Boolean },
    embedded: { type: Boolean },
    agentId: {},
    traits: {},
    tools: {},
    models: {},
    agents: {},
    parentId: {}
  },
  emits: ["close", "saved"],
  setup(t, { emit: e }) {
    const n = Fe(), r = rt({
      setup(P, { slots: l }) {
        return n.value = l.default, () => {
        };
      }
    }), b = rt({
      render() {
        return n.value ? n.value() : null;
      }
    }), o = t, k = e, y = L(() => {
      switch (f.value) {
        case "model":
          return "Model";
        case "caps":
          return "Capabilities";
        case "routing":
          return "Routing";
        default:
          return "Prompt";
      }
    }), f = B("prompt"), z = ["fast", "nano", "balanced", "premium"], _ = L(() => {
      const P = /* @__PURE__ */ new Set();
      for (const l of o.models) for (const s of l.class || []) P.add(s);
      return [...P].sort((l, s) => {
        const E = z.indexOf(l), U = z.indexOf(s);
        return (E < 0 ? 99 : E) - (U < 0 ? 99 : U) || l.localeCompare(s);
      });
    });
    function T() {
      return _.value.includes("fast") ? "class:fast" : _.value.length ? "class:" + _.value[0] : o.models[0]?.name || "";
    }
    function v(P = !0) {
      return {
        title: "",
        description: "",
        icon: "tabler:robot",
        prompt: "",
        public: !1,
        model: T(),
        temperature: null,
        max_tokens: 8e3,
        thinking_effort: null,
        traits: P ? [ur, br] : [],
        trait_contexts: {},
        trait_agent_options: {},
        tools: [],
        delegates: [],
        memory_target_id: "",
        memory_provider_id: ""
      };
    }
    const i = B(v()), c = L(() => !!o.agentId), m = L({
      get: () => o.open,
      set: (P) => {
        P || k("close");
      }
    }), x = B(null);
    function g() {
      Et(() => x.value?.focus({ preventScroll: !0 }));
    }
    const C = L({
      get: () => Math.round((i.value.temperature ?? 0.5) * 50),
      set: (P) => {
        i.value.temperature = Math.max(0, Math.min(2, (Number(P) || 0) / 50));
      }
    }), H = L({
      get: () => i.value.temperature !== null,
      set: (P) => {
        i.value.temperature = P ? i.value.temperature ?? 0.5 : null;
      }
    }), F = L(() => i.value.model.startsWith("class:") ? o.models.filter((P) => P.class?.includes(i.value.model.slice(6))) : o.models.filter((P) => P.name === i.value.model)), lt = L(() => {
      const P = F.value.map((l) => l.output_tokens).filter((l) => typeof l == "number" && Number.isFinite(l) && l > 0);
      return P.length ? Math.min(...P) : 128e3;
    }), wt = L(() => !ct.value && (F.value.length === 0 || F.value.some((P) => !P.capabilities?.includes("reasoning")))), st = L(() => ct.value ? "Extended thinking sets its own temperature." : "The selected models reason instead of sampling, so temperature is not applied."), dt = L(() => !Number.isInteger(i.value.max_tokens) || i.value.max_tokens < 1 || i.value.max_tokens > lt.value), _t = L(() => i.value.title.trim().length > 0 && !!i.value.model && !dt.value), Ct = gr({
      form: i,
      valid: _t,
      tab: f,
      blank: v,
      agentId: () => o.agentId,
      parentId: () => o.parentId,
      models: () => o.models,
      redirectTrait: Tt,
      emitSaved: (P) => k("saved", P)
    }), { loading: St, saving: tt, error: h, loadAgent: w, save: V } = Ct;
    zt(() => o.models, () => {
      !c.value && !i.value.model && (i.value.model = T());
    }, { immediate: !0 }), de(() => {
      Bt("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), Bt("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    function Q(P) {
      i.value.model = P.detail;
    }
    const ct = L({
      get: () => i.value.thinking_effort !== null,
      set: (P) => {
        i.value.thinking_effort = P ? i.value.thinking_effort ?? 50 : null;
      }
    }), ke = cr({ form: i, traits: () => o.traits, redirectTrait: Tt }), {
      isTraitCollapsed: ut,
      toggleTraitCollapsed: xe,
      showAdvancedTools: bt,
      selectableTraits: we,
      activeTraits: pt,
      traitMountConfig: _e,
      onTraitConfig: Ce,
      tintOf: Nt,
      badgesOf: Ht,
      traitQuery: At,
      traitMenuOpen: et,
      traitAddRoot: Ut,
      traitSearchInput: Se,
      traitActiveIndex: Kt,
      traitListboxId: Gt,
      addableTraits: Wt,
      activeTraitOptionId: $e,
      setTraitOptionRef: Ie,
      onTraitQueryInput: Zt,
      onTraitQueryKeydown: Xt,
      addTrait: Yt,
      toggleTrait: ze,
      onToolsChange: Ae
    } = ke, Pe = pr({
      form: i,
      agentId: () => o.agentId,
      agents: () => o.agents,
      redirectTrait: Tt
    }), {
      routeView: Y,
      pickIds: qt,
      onDelegatesChange: Te,
      redirectTargets: nt,
      redirectSelectedIds: Le,
      onRedirectsChange: Ee,
      redirectLabel: Be,
      setRedirectCommentById: Oe
    } = Pe;
    zt(() => [o.open, o.agentId], ([P]) => {
      P && (f.value = "prompt", Y.value = "delegates", h.value = "", o.agentId ? w(o.agentId) : i.value = v());
    }, { immediate: !0 });
    const De = L(() => [
      { key: "prompt", label: "Prompt", icon: "tabler:keyboard", meta: i.value.prompt.trim() ? "•" : "" },
      { key: "model", label: "Model", icon: "tabler:cpu", meta: "" },
      { key: "caps", label: "Capabilities", icon: "tabler:puzzle", meta: pt.value.length ? String(pt.value.length) : "" },
      { key: "routing", label: "Routing", icon: "tabler:arrows-split-2", meta: i.value.delegates.length + nt.value.length ? String(i.value.delegates.length + nt.value.length) : "" }
    ]);
    return (P, l) => (u(), p(M, null, [
      A(d(r), null, {
        default: Z(() => [
          a("div", hr, [
            a("span", fr, [
              A(d(R), {
                icon: i.value.icon || "tabler:robot",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            a("span", mr, [
              a("span", vr, S(c.value ? "Edit agent" : "New agent"), 1),
              a("span", yr, S(i.value.title.trim() || "Configure persona, model and capabilities."), 1)
            ]),
            a("button", {
              class: "kx-modal-x",
              "aria-label": "Close",
              onClick: l[0] || (l[0] = (s) => k("close"))
            }, [
              A(d(R), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])
          ]),
          d(St) ? (u(), p("div", kr, [
            a("div", xr, [
              A(d(R), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              l[23] || (l[23] = N(" Loading…", -1))
            ])
          ])) : (u(), p("div", wr, [
            a("div", _r, [
              a("div", Cr, [
                a("div", Sr, [
                  l[24] || (l[24] = a("span", { class: "kx-field-lbl" }, "Name", -1)),
                  a("div", $r, [
                    A(dr, {
                      class: "kx-name-icon",
                      modelValue: i.value.icon,
                      "onUpdate:modelValue": l[1] || (l[1] = (s) => i.value.icon = s),
                      fallback: "tabler:robot"
                    }, null, 8, ["modelValue"]),
                    G(a("input", {
                      ref_key: "agentNameInput",
                      ref: x,
                      "onUpdate:modelValue": l[2] || (l[2] = (s) => i.value.title = s),
                      class: "kx-input",
                      "data-agent-name": "",
                      "aria-label": "Agent name",
                      placeholder: "e.g. Research assistant"
                    }, null, 512), [
                      [q, i.value.title]
                    ])
                  ])
                ]),
                a("label", Ir, [
                  l[25] || (l[25] = a("span", { class: "kx-field-lbl" }, [
                    N("Description "),
                    a("span", { class: "kx-field-hint-inline" }, "— shown in pickers")
                  ], -1)),
                  G(a("textarea", {
                    "onUpdate:modelValue": l[3] || (l[3] = (s) => i.value.description = s),
                    class: "kx-input kx-textarea kx-textarea-sm",
                    rows: "2",
                    placeholder: "What this agent is for."
                  }, null, 512), [
                    [q, i.value.description]
                  ])
                ])
              ]),
              A(_o, {
                items: De.value,
                active: f.value,
                onSelect: l[4] || (l[4] = (s) => f.value = s)
              }, null, 8, ["items", "active"])
            ]),
            a("div", zr, [
              a("div", Ar, S(y.value), 1),
              a("div", Pr, [
                f.value === "prompt" ? (u(), p("div", Tr, [
                  a("label", Lr, [
                    l[26] || (l[26] = a("span", { class: "kx-field-lbl" }, [
                      N("System prompt "),
                      a("span", { class: "kx-field-hint-inline" }, "— the agent's persona and instructions")
                    ], -1)),
                    G(a("textarea", {
                      "onUpdate:modelValue": l[5] || (l[5] = (s) => i.value.prompt = s),
                      class: "kx-input kx-textarea kx-textarea-lg",
                      placeholder: "You are a helpful assistant that…"
                    }, null, 512), [
                      [q, i.value.prompt]
                    ])
                  ]),
                  l[27] || (l[27] = a("p", { class: "kx-sec-foot" }, "Keep the prompt clear and operational. Capabilities and routing are configured in their own sections.", -1))
                ])) : f.value === "model" ? (u(), p("div", Er, [
                  a("div", Br, [
                    l[28] || (l[28] = a("span", { class: "kx-field-lbl" }, "Model", -1)),
                    a("wc-model-picker", {
                      value: i.value.model || "",
                      onSelect: Q
                    }, null, 40, Or)
                  ]),
                  a("label", Dr, [
                    l[29] || (l[29] = a("span", { class: "kx-field-lbl" }, [
                      N("Max tokens "),
                      a("span", { class: "kx-field-hint-inline" }, "— response length cap")
                    ], -1)),
                    G(a("input", {
                      "onUpdate:modelValue": l[6] || (l[6] = (s) => i.value.max_tokens = s),
                      type: "number",
                      min: "1",
                      max: lt.value,
                      step: "1",
                      class: j(["kx-input", dt.value && "kx-input-err"])
                    }, null, 10, jr), [
                      [
                        q,
                        i.value.max_tokens,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    dt.value ? (u(), p("span", Mr, "Must be between 1 and " + S(lt.value) + ".", 1)) : $("", !0)
                  ]),
                  a("div", Fr, [
                    a("div", Vr, [
                      A(d(jt), {
                        modelValue: ct.value,
                        "onUpdate:modelValue": l[7] || (l[7] = (s) => ct.value = s),
                        "input-id": "agent-thinking"
                      }, null, 8, ["modelValue"]),
                      l[30] || (l[30] = a("label", {
                        for: "agent-thinking",
                        class: "kx-toggle-copy"
                      }, [
                        a("span", { class: "kx-field-lbl" }, "Extended thinking")
                      ], -1))
                    ]),
                    ct.value ? (u(), p("div", Rr, [
                      a("span", Nr, "Effort: " + S(i.value.thinking_effort) + "%", 1),
                      G(a("input", {
                        "onUpdate:modelValue": l[8] || (l[8] = (s) => i.value.thinking_effort = s),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "5",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          q,
                          i.value.thinking_effort,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : $("", !0)
                  ]),
                  a("div", Hr, [
                    wt.value ? (u(), p("div", Ur, [
                      A(d(jt), {
                        modelValue: H.value,
                        "onUpdate:modelValue": l[9] || (l[9] = (s) => H.value = s),
                        "input-id": "agent-temperature"
                      }, null, 8, ["modelValue"]),
                      l[31] || (l[31] = a("label", {
                        for: "agent-temperature",
                        class: "kx-toggle-copy"
                      }, [
                        a("span", { class: "kx-field-lbl" }, "Custom temperature")
                      ], -1))
                    ])) : (u(), p("p", Kr, S(st.value), 1)),
                    wt.value && H.value ? (u(), p("div", Gr, [
                      a("span", Wr, S(C.value) + "% · higher is more creative · unsupported on most current models", 1),
                      G(a("input", {
                        "onUpdate:modelValue": l[10] || (l[10] = (s) => C.value = s),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "1",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          q,
                          C.value,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : $("", !0)
                  ])
                ])) : f.value === "caps" ? (u(), p("div", Zr, [
                  a("div", Xr, [
                    a("div", Yr, [
                      l[32] || (l[32] = a("span", { class: "kx-group-title" }, "Capabilities", -1)),
                      a("span", qr, S(d(pt).length) + " active", 1)
                    ]),
                    a("div", {
                      ref_key: "traitAddRoot",
                      ref: Ut,
                      class: "kx-tadd"
                    }, [
                      G(a("input", {
                        ref_key: "traitSearchInput",
                        ref: Se,
                        "onUpdate:modelValue": l[11] || (l[11] = (s) => Qt(At) ? At.value = s : null),
                        class: "kx-input kx-tadd-input",
                        type: "text",
                        role: "combobox",
                        "aria-label": "Search capabilities to add",
                        "aria-autocomplete": "list",
                        "aria-expanded": d(et),
                        "aria-controls": d(Gt),
                        "aria-activedescendant": d(et) ? d($e) : void 0,
                        placeholder: "Search capabilities to add…",
                        onFocus: l[12] || (l[12] = (s) => et.value = !0),
                        onInput: l[13] || (l[13] = //@ts-ignore
                        (...s) => d(Zt) && d(Zt)(...s)),
                        onKeydown: l[14] || (l[14] = //@ts-ignore
                        (...s) => d(Xt) && d(Xt)(...s))
                      }, null, 40, Qr), [
                        [q, d(At)]
                      ]),
                      A(cn, {
                        open: d(et),
                        "onUpdate:open": l[15] || (l[15] = (s) => Qt(et) ? et.value = s : null),
                        anchor: d(Ut)
                      }, {
                        default: Z(() => [
                          a("div", {
                            id: d(Gt),
                            class: "kx-tadd-menu",
                            role: "listbox",
                            "aria-label": "Available capabilities"
                          }, [
                            (u(!0), p(M, null, W(d(Wt), (s, E) => (u(), p("button", {
                              key: s.id,
                              id: `agent-capability-option-${E}`,
                              ref_for: !0,
                              ref: (U) => d(Ie)(U, E),
                              type: "button",
                              class: j(["kx-tadd-opt", E === d(Kt) && "kx-tadd-opt-active"]),
                              tabindex: "-1",
                              role: "option",
                              "aria-selected": !1,
                              onMouseenter: (U) => Kt.value = E,
                              onClick: (U) => d(Yt)(s.id)
                            }, [
                              a("span", {
                                class: j(["kx-trait-ico", `kx-tint-${d(Nt)(s)}`])
                              }, [
                                A(d(R), {
                                  icon: s.icon || "tabler:puzzle",
                                  "aria-hidden": "true"
                                }, null, 8, ["icon"])
                              ], 2),
                              a("span", ea, [
                                a("span", na, S(s.title || s.id), 1),
                                s.description ? (u(), p("span", oa, S(s.description), 1)) : $("", !0)
                              ]),
                              a("span", ra, [
                                (u(!0), p(M, null, W(d(Ht)(s), (U) => (u(), p("span", {
                                  key: U.key,
                                  class: j(["kx-badge kx-tag-caps", `kx-badge-${U.key}`])
                                }, S(U.label), 3))), 128))
                              ])
                            ], 42, ta))), 128)),
                            d(Wt).length ? $("", !0) : (u(), p("div", aa, "No matching capabilities."))
                          ], 8, Jr)
                        ]),
                        _: 1
                      }, 8, ["open", "anchor"])
                    ], 512),
                    d(pt).length ? (u(), p("ul", ia, [
                      (u(!0), p(M, null, W(d(pt), (s) => (u(), p("li", {
                        key: s.id,
                        class: "kx-trait"
                      }, [
                        a("div", la, [
                          a("span", {
                            class: j(["kx-trait-ico", `kx-tint-${d(Nt)(s)}`])
                          }, [
                            A(d(R), {
                              icon: s.icon || "tabler:puzzle",
                              "aria-hidden": "true"
                            }, null, 8, ["icon"])
                          ], 2),
                          a("span", sa, [
                            a("span", da, S(s.title || s.id), 1),
                            s.description ? (u(), p("span", ca, S(s.description), 1)) : $("", !0)
                          ]),
                          a("span", ua, [
                            (u(!0), p(M, null, W(d(Ht)(s), (E) => (u(), p("span", {
                              key: E.key,
                              class: j(["kx-badge kx-tag-caps", `kx-badge-${E.key}`])
                            }, S(E.label), 3))), 128))
                          ]),
                          a("span", ba, [
                            s.web_component ? (u(), p("button", {
                              key: 0,
                              type: "button",
                              class: "kx-trait-fold",
                              "aria-expanded": !d(ut)(s.id),
                              title: d(ut)(s.id) ? "Show settings" : "Hide settings",
                              "aria-label": d(ut)(s.id) ? "Show settings" : "Hide settings",
                              onClick: (E) => d(xe)(s.id)
                            }, [
                              A(d(R), {
                                icon: d(ut)(s.id) ? "tabler:chevron-right" : "tabler:chevron-down",
                                "aria-hidden": "true"
                              }, null, 8, ["icon"])
                            ], 8, pa)) : $("", !0),
                            a("button", {
                              type: "button",
                              class: "kx-trait-x",
                              "aria-label": `Remove ${s.title || s.id} capability`,
                              onClick: (E) => d(ze)(s.id)
                            }, [
                              A(d(R), {
                                icon: "tabler:x",
                                "aria-hidden": "true"
                              })
                            ], 8, ga)
                          ])
                        ]),
                        s.web_component && !d(ut)(s.id) ? (u(), p("div", ha, [
                          A(dn, {
                            tag: s.web_component,
                            config: d(_e)(s.id),
                            provider: s.provider,
                            onChange: (E) => d(Ce)(s.id, E)
                          }, null, 8, ["tag", "config", "provider", "onChange"])
                        ])) : $("", !0)
                      ]))), 128))
                    ])) : (u(), p("p", fa, "No capabilities yet. Add one above to give this agent what it can do."))
                  ]),
                  a("div", ma, [
                    a("button", {
                      type: "button",
                      class: "kx-group-toggle",
                      "aria-expanded": d(bt),
                      onClick: l[16] || (l[16] = (s) => bt.value = !d(bt))
                    }, [
                      A(d(R), {
                        icon: d(bt) ? "tabler:chevron-down" : "tabler:chevron-right",
                        class: "kx-adv-caret",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      l[33] || (l[33] = a("span", { class: "kx-group-title" }, "Tools and combinations", -1)),
                      a("span", ya, S(i.value.tools.length) + " selected", 1)
                    ], 8, va),
                    d(bt) ? (u(), p(M, { key: 0 }, [
                      l[34] || (l[34] = a("p", { class: "kx-sec-foot" }, "Capabilities add the tools they need automatically. Pick individual tools only for fine-grained control.", -1)),
                      A(sr, {
                        tools: t.tools,
                        traits: t.traits,
                        "selectable-ids": d(we).map((s) => s.id),
                        selected: i.value.tools,
                        "active-traits": i.value.traits,
                        onChange: d(Ae),
                        onAddCapability: d(Yt)
                      }, null, 8, ["tools", "traits", "selectable-ids", "selected", "active-traits", "onChange", "onAddCapability"])
                    ], 64)) : $("", !0)
                  ])
                ])) : f.value === "routing" ? (u(), p("div", ka, [
                  a("div", xa, [
                    a("button", {
                      type: "button",
                      role: "tab",
                      class: j(["kx-seg-btn", d(Y) === "delegates" && "kx-seg-btn-on"]),
                      "aria-selected": d(Y) === "delegates",
                      onClick: l[17] || (l[17] = (s) => Y.value = "delegates")
                    }, [
                      A(d(R), {
                        icon: "tabler:arrow-ramp-right-3",
                        "aria-hidden": "true"
                      }),
                      l[35] || (l[35] = N(" Delegates ", -1)),
                      i.value.delegates.length ? (u(), p("span", _a, S(i.value.delegates.length), 1)) : $("", !0)
                    ], 10, wa),
                    a("button", {
                      type: "button",
                      role: "tab",
                      class: j(["kx-seg-btn", d(Y) === "redirects" && "kx-seg-btn-on"]),
                      "aria-selected": d(Y) === "redirects",
                      onClick: l[18] || (l[18] = (s) => Y.value = "redirects")
                    }, [
                      A(d(R), {
                        icon: "tabler:arrows-split-2",
                        "aria-hidden": "true"
                      }),
                      l[36] || (l[36] = N(" Redirects ", -1)),
                      d(nt).length ? (u(), p("span", Sa, S(d(nt).length), 1)) : $("", !0)
                    ], 10, Ca)
                  ]),
                  d(Y) === "delegates" ? (u(), p(M, { key: 0 }, [
                    l[37] || (l[37] = a("p", { class: "kx-sec-foot" }, "When this agent decides a task belongs to another, it can hand off while keeping the chat. Pick the agents it may delegate to.", -1)),
                    a("wc-agent-picker", {
                      placeholder: "Search agents to delegate to…",
                      selected: JSON.stringify(i.value.delegates),
                      onChange: l[19] || (l[19] = (s) => d(Te)(d(qt)(s)))
                    }, null, 40, $a)
                  ], 64)) : (u(), p(M, { key: 1 }, [
                    l[38] || (l[38] = a("p", { class: "kx-sec-foot" }, [
                      N("A redirect is not a delegate: it "),
                      a("strong", null, "transfers the whole chat"),
                      N(" — the target agent takes over and this one stops. Pick the agents it may hand off to, and note when (injected into the prompt).")
                    ], -1)),
                    a("wc-agent-picker", {
                      placeholder: "Search agents to redirect to…",
                      selected: JSON.stringify(d(Le)),
                      onChange: l[20] || (l[20] = (s) => d(Ee)(d(qt)(s)))
                    }, null, 40, Ia),
                    d(nt).length ? (u(), p("div", za, [
                      (u(!0), p(M, null, W(d(nt), (s) => (u(), p("div", {
                        key: s.agent_id,
                        class: "kx-redirect-comment-row"
                      }, [
                        a("span", Aa, [
                          A(d(R), {
                            icon: "tabler:arrows-split-2",
                            "aria-hidden": "true"
                          }),
                          N(" " + S(d(Be)(s.agent_id)), 1)
                        ]),
                        a("input", {
                          value: s.comment,
                          class: "kx-input kx-redirect-comment",
                          placeholder: "When to redirect here (injected into the prompt)…",
                          onInput: (E) => d(Oe)(s.agent_id, E.target.value)
                        }, null, 40, Pa)
                      ]))), 128))
                    ])) : $("", !0)
                  ], 64))
                ])) : $("", !0)
              ])
            ])
          ])),
          a("div", Ta, [
            d(h) ? (u(), p("div", La, S(d(h)), 1)) : $("", !0),
            A(d(vt), {
              type: "button",
              label: "Cancel",
              severity: "secondary",
              outlined: "",
              disabled: d(tt),
              onClick: l[21] || (l[21] = (s) => k("close"))
            }, null, 8, ["disabled"]),
            A(d(vt), {
              type: "button",
              "data-testid": "agent-form-save",
              label: d(tt) ? c.value ? "Saving…" : "Creating…" : c.value ? "Save changes" : "Create agent",
              loading: d(tt),
              disabled: d(tt) || !_t.value,
              onClick: d(V)
            }, {
              icon: Z(({ class: s }) => [
                A(d(R), {
                  icon: c.value ? "tabler:device-floppy" : "tabler:plus",
                  class: j(s),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["label", "loading", "disabled", "onClick"])
          ])
        ]),
        _: 1
      }),
      t.embedded ? t.open ? (u(), p("div", Ea, [
        a("div", Ba, [
          A(d(b))
        ])
      ])) : $("", !0) : (u(), X(d(me), {
        key: 0,
        visible: m.value,
        "onUpdate:visible": l[22] || (l[22] = (s) => m.value = s),
        modal: "",
        "block-scroll": "",
        "show-header": !1,
        "dismissable-mask": !0,
        draggable: !1,
        pt: { root: { class: "kx-modal kx-modal-agent", role: "dialog", "aria-modal": "true", "aria-label": c.value ? "Edit agent" : "New agent" }, content: { class: "kx-modal-content" } },
        onShow: g
      }, {
        default: Z(() => [
          A(d(b))
        ]),
        _: 1
      }, 8, ["visible", "pt"]))
    ], 64));
  }
});
async function Ha() {
  const t = [], e = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
  let r;
  do {
    const b = new URLSearchParams({ limit: "100" });
    r && b.set("cursor", r);
    const { data: o } = await It.get(`/api/v1/agents/tools?${b.toString()}`), k = o;
    if (!k?.success) throw new Error("could not load tools");
    for (const f of k.tools || [])
      f.id && !e.has(f.id) && (e.add(f.id), t.push(f));
    const y = typeof k.next_cursor == "string" && k.next_cursor ? k.next_cursor : void 0;
    if (y && n.has(y)) throw new Error("tool catalog pagination did not advance");
    y && n.add(y), r = y;
  } while (r);
  return t;
}
export {
  Na as _,
  le as e,
  Ha as l,
  vt as s
};
//# sourceMappingURL=toolCatalog-B7JOn9aF.js.map
