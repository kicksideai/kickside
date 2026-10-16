import { B as St, l as Ct, d as Lt, f as Pt, g as et, R as Et, h as Ft, u as qt, a as Dt, s as Kt, W as Wt, e as mt, b as Jt, c as Ht, P as Qt } from "./styles-BeIlQBlD.js";
import { openBlock as i, createElementBlock as u, mergeProps as S, renderSlot as F, createTextVNode as v, toDisplayString as g, resolveComponent as q, resolveDirective as Gt, withDirectives as w, createBlock as st, resolveDynamicComponent as Xt, withCtx as Yt, createCommentVNode as f, normalizeClass as kt, defineComponent as Zt, computed as T, ref as s, onMounted as tn, watch as nn, withModifiers as ct, createElementVNode as r, createVNode as x, unref as E, Fragment as y, vModelText as I, renderList as on, vModelCheckbox as en } from "vue";
import { Icon as xt } from "@iconify/vue";
import { loadByTagName as bt, api as ot, define as rn } from "@wippy-fe/proxy";
var an = `
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
`, ln = {
  root: function(e) {
    var a = e.props, l = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Lt(a.value) && String(a.value).length === 1,
      "p-badge-dot": Ct(a.value) && !l.$slots.default,
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
}, dn = St.extend({
  name: "badge",
  style: an,
  classes: ln
}), un = {
  name: "BaseBadge",
  extends: Pt,
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
  style: dn,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function D(n) {
  "@babel/helpers - typeof";
  return D = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, D(n);
}
function wt(n, e, a) {
  return (e = sn(e)) in n ? Object.defineProperty(n, e, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = a, n;
}
function sn(n) {
  var e = cn(n, "string");
  return D(e) == "symbol" ? e : e + "";
}
function cn(n, e) {
  if (D(n) != "object" || !n) return n;
  var a = n[Symbol.toPrimitive];
  if (a !== void 0) {
    var l = a.call(n, e);
    if (D(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var zt = {
  name: "Badge",
  extends: un,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return et(wt(wt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, bn = ["data-p"];
function pn(n, e, a, l, rt, h) {
  return i(), u("span", S({
    class: n.cx("root"),
    "data-p": h.dataP
  }, n.ptmi("root")), [F(n.$slots, "default", {}, function() {
    return [v(g(n.value), 1)];
  })], 16, bn);
}
zt.render = pn;
var gn = `
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
function K(n) {
  "@babel/helpers - typeof";
  return K = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, K(n);
}
function m(n, e, a) {
  return (e = vn(e)) in n ? Object.defineProperty(n, e, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = a, n;
}
function vn(n) {
  var e = fn(n, "string");
  return K(e) == "symbol" ? e : e + "";
}
function fn(n, e) {
  if (K(n) != "object" || !n) return n;
  var a = n[Symbol.toPrimitive];
  if (a !== void 0) {
    var l = a.call(n, e);
    if (K(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var hn = {
  root: function(e) {
    var a = e.instance, l = e.props;
    return ["p-button p-component", m(m(m(m(m(m(m(m(m({
      "p-button-icon-only": a.hasIcon && !l.label && !l.badge,
      "p-button-vertical": (l.iconPos === "top" || l.iconPos === "bottom") && l.label,
      "p-button-loading": l.loading,
      "p-button-link": l.link || l.variant === "link"
    }, "p-button-".concat(l.severity), l.severity), "p-button-raised", l.raised), "p-button-rounded", l.rounded), "p-button-text", l.text || l.variant === "text"), "p-button-outlined", l.outlined || l.variant === "outlined"), "p-button-sm", l.size === "small"), "p-button-lg", l.size === "large"), "p-button-plain", l.plain), "p-button-fluid", a.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var a = e.props;
    return ["p-button-icon", m({}, "p-button-icon-".concat(a.iconPos), a.label)];
  },
  label: "p-button-label"
}, yn = St.extend({
  name: "button",
  style: gn,
  classes: hn
}), mn = {
  name: "BaseButton",
  extends: Pt,
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
  style: yn,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function W(n) {
  "@babel/helpers - typeof";
  return W = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, W(n);
}
function p(n, e, a) {
  return (e = kn(e)) in n ? Object.defineProperty(n, e, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : n[e] = a, n;
}
function kn(n) {
  var e = xn(n, "string");
  return W(e) == "symbol" ? e : e + "";
}
function xn(n, e) {
  if (W(n) != "object" || !n) return n;
  var a = n[Symbol.toPrimitive];
  if (a !== void 0) {
    var l = a.call(n, e);
    if (W(l) != "object") return l;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(n);
}
var pt = {
  name: "Button",
  extends: mn,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(e) {
      var a = e === "root" ? this.ptmi : this.ptm;
      return a(e, {
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
      return S(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Ct(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return et(p(p(p(p(p(p(p(p(p(p({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return et(p(p({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return et(p(p({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Ft,
    Badge: zt
  },
  directives: {
    ripple: Et
  }
}, wn = ["data-p"], Sn = ["data-p"];
function Cn(n, e, a, l, rt, h) {
  var $ = q("SpinnerIcon"), A = q("Badge"), at = Gt("ripple");
  return n.asChild ? F(n.$slots, "default", {
    key: 1,
    class: kt(n.cx("root")),
    a11yAttrs: h.a11yAttrs
  }) : w((i(), st(Xt(n.as), S({
    key: 0,
    class: n.cx("root"),
    "data-p": h.dataP
  }, h.attrs), {
    default: Yt(function() {
      return [F(n.$slots, "default", {}, function() {
        return [n.loading ? F(n.$slots, "loadingicon", S({
          key: 0,
          class: [n.cx("loadingIcon"), n.cx("icon")]
        }, n.ptm("loadingIcon")), function() {
          return [n.loadingIcon ? (i(), u("span", S({
            key: 0,
            class: [n.cx("loadingIcon"), n.cx("icon"), n.loadingIcon]
          }, n.ptm("loadingIcon")), null, 16)) : (i(), st($, S({
            key: 1,
            class: [n.cx("loadingIcon"), n.cx("icon")],
            spin: ""
          }, n.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : F(n.$slots, "icon", S({
          key: 1,
          class: [n.cx("icon")]
        }, n.ptm("icon")), function() {
          return [n.icon ? (i(), u("span", S({
            key: 0,
            class: [n.cx("icon"), n.icon, n.iconClass],
            "data-p": h.dataIconP
          }, n.ptm("icon")), null, 16, wn)) : f("", !0)];
        }), n.label ? (i(), u("span", S({
          key: 2,
          class: n.cx("label")
        }, n.ptm("label"), {
          "data-p": h.dataLabelP
        }), g(n.label), 17, Sn)) : f("", !0), n.badge ? (i(), st(A, {
          key: 3,
          value: n.badge,
          class: kt(n.badgeClass),
          severity: n.badgeSeverity,
          unstyled: n.unstyled,
          pt: n.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : f("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[at]]);
}
pt.render = Cn;
const Pn = { class: "kx-cr-head" }, zn = { class: "kx-cr-ico" }, $n = { class: "kx-cr-title" }, An = { class: "kx-id" }, _n = {
  key: 0,
  class: "kx-note"
}, Mn = { class: "kx-field" }, In = { class: "kx-field" }, Bn = {
  class: "kx-input kx-input-ro",
  role: "textbox",
  "aria-readonly": "true"
}, Nn = { class: "kx-id" }, jn = { class: "kx-field" }, Tn = { class: "kx-field" }, Un = { class: "kx-adv" }, On = {
  key: 0,
  class: "kx-adv-badge kx-tag-sm"
}, Vn = {
  key: 0,
  class: "kx-adv-body"
}, Rn = { class: "kx-field" }, Ln = {
  key: 0,
  class: "kx-field"
}, En = {
  key: 1,
  class: "kx-field"
}, Fn = {
  key: 2,
  class: "kx-field"
}, qn = { class: "kx-field" }, Dn = { class: "kx-field-lbl" }, Kn = {
  key: 0,
  class: "kx-id"
}, Wn = { class: "kx-field" }, Jn = { class: "kx-check kx-check-control" }, Hn = { class: "kx-field" }, Qn = { class: "kx-inline-control kx-inline-control-standalone" }, Gn = {
  key: 2,
  class: "kx-error"
}, Xn = { class: "kx-actions" }, Yn = /* @__PURE__ */ Zt({
  __name: "ChannelResponderManage",
  setup(n) {
    function e(o) {
      return (o.title || "").trim() || "Unknown capability";
    }
    async function a(o, t) {
      const c = t ? { parent_id: t } : {}, { data: b } = await ot.post(`/api/v1/connections/${encodeURIComponent(o)}/discover_resources`, c);
      return Array.isArray(b?.items) ? b.items : [];
    }
    async function l(o, t, c) {
      for (const b of c)
        if (String(b.id ?? "") === t) return String(b.label || "").trim() || null;
      for (const b of c) {
        const z = String(b.id ?? "");
        if (!z || b.selectable === !0 || b.drillable !== !0) continue;
        const d = await l(o, t, await a(o, z));
        if (d) return d;
      }
      return null;
    }
    async function rt(o, t) {
      if (!o || !t) return null;
      try {
        return await l(o, t, await a(o));
      } catch {
        return null;
      }
    }
    const h = qt(), $ = Dt(), A = T(() => {
      const o = [h.value.config, h.value.value];
      for (const t of o) {
        if (t && typeof t == "object" && typeof t.id == "string")
          return String(t.id);
        if (typeof t == "string")
          try {
            const c = JSON.parse(t);
            if (c && typeof c.id == "string") return c.id;
          } catch {
          }
      }
      return "";
    });
    function at() {
      const o = h.value.config;
      return o && typeof o == "object" && !Array.isArray(o) ? o : {};
    }
    function $t() {
      const o = at().automation;
      return o && typeof o == "object" && !Array.isArray(o) ? o : {};
    }
    const U = s(!0), J = s(!1), C = s(""), O = s(""), lt = s(""), _ = s(""), dt = s(""), it = s(""), H = s(!1), Q = T(() => lt.value || it.value), B = s(""), ut = s(""), gt = s(!1), k = s([]), P = s({}), G = s([]), N = s(""), M = s(!0), X = s(120), j = s(10), V = s("immediate"), At = [
      { label: "Immediate", value: "immediate" },
      { label: "Lazy", value: "lazy" }
    ], Y = s(8), Z = s("class:fast"), tt = s("Only reply when the accumulated channel messages are relevant to the agent. Ignore noise, acknowledgements, and unrelated chatter."), nt = s(""), R = s(!1), _t = T(() => G.value.filter((o) => !!o.web_component && k.value.includes(o.id))), L = T(() => V.value === "lazy"), vt = T(() => O.value.trim() ? B.value ? "" : "An agent is required." : "Name is required."), ft = T(() => !vt.value);
    function Mt(o) {
      const t = o.detail, c = t && Array.isArray(t.selected) ? t.selected.map(String) : [], b = t && Array.isArray(t.labels) ? t.labels.map(String) : [];
      B.value = c[0] || "", ut.value = (b[0] || "").trim();
    }
    async function ht(o) {
      if (!o.length) {
        G.value = [];
        return;
      }
      try {
        const { data: t } = await ot.get(`/api/v1/agents/traits?ids=${o.map(encodeURIComponent).join(",")}`);
        G.value = t?.traits || [];
      } catch (t) {
        G.value = [], $("error", { message: "failed to load capabilities", error: t });
      }
    }
    function It(o) {
      const t = o.detail, c = t && Array.isArray(t.selected) ? t.selected.map(String) : [];
      k.value = c;
      const b = {};
      for (const z of c) z in P.value && (b[z] = P.value[z]);
      P.value = b, ht(c);
    }
    function Bt(o, t) {
      P.value = { ...P.value, [o]: t };
    }
    function Nt() {
      const o = {};
      for (const t of k.value) {
        const c = P.value[t];
        c && typeof c == "object" && (o[t] = c);
      }
      return o;
    }
    async function jt() {
      if (!(lt.value || !dt.value || !_.value)) {
        H.value = !0;
        try {
          it.value = await rt(dt.value, _.value) || "";
        } finally {
          H.value = !1;
        }
      }
    }
    function Tt(o, t) {
      O.value = String(o.title || $t().title || ""), lt.value = String(o.channel_name || t.channel || ""), _.value = String(o.channel_id || ""), dt.value = String(o.connection_id || ""), it.value = "", jt(), B.value = String(o.agent_id || ""), ut.value = String(o.agent_name || t.agent || ""), gt.value = o.paused === !0, k.value = Array.isArray(o.traits) ? o.traits.map(String) : [], P.value = o.trait_contexts && typeof o.trait_contexts == "object" ? o.trait_contexts : {}, N.value = String(o.context || ""), M.value = o.session_policy?.rotate_after_idle !== !1, X.value = Math.max(1, Math.min(43200, Number(o.session_policy?.idle_seconds || 7200) / 60)), j.value = Math.max(1, Math.min(1440, Number(o.session_policy?.runtime_idle_seconds || 600) / 60)), V.value = o.response_policy?.mode === "lazy" ? "lazy" : "immediate", Y.value = Math.max(1, Math.min(120, Math.floor(Number(o.response_policy?.wait_seconds) || 8))), Z.value = String(o.response_policy?.assessor_model || "class:fast"), tt.value = String(o.response_policy?.prompt || "Only reply when the accumulated channel messages are relevant to the agent. Ignore noise, acknowledgements, and unrelated chatter."), nt.value = String(o.system_prompt || ""), R.value = !1, ht(k.value);
    }
    async function yt() {
      if (!A.value) {
        C.value = "Automation id is required.", U.value = !1;
        return;
      }
      U.value = !0, C.value = "";
      try {
        const { data: o } = await ot.post(`/api/v1/automations/${encodeURIComponent(A.value)}/actions/read_config`, {}), t = o?.result?.state || {}, c = o?.result?.public_state || {};
        Tt(t, c);
      } catch (o) {
        C.value = mt(o, "failed to load responder");
      } finally {
        U.value = !1;
      }
    }
    async function Ut() {
      if (!ft.value) {
        C.value = vt.value;
        return;
      }
      J.value = !0, C.value = "";
      try {
        const o = {
          title: O.value.trim(),
          agent_id: B.value,
          agent_name: ut.value,
          target: "channel",
          traits: [...k.value],
          trait_contexts: Nt(),
          context: N.value.trim(),
          session_policy: {
            rotate_after_idle: M.value,
            idle_seconds: Math.max(60, Math.min(2592e3, Math.floor((Number(X.value) || 120) * 60))),
            runtime_idle_seconds: Math.max(60, Math.min(86400, Math.floor((Number(j.value) || 10) * 60)))
          },
          response_policy: {
            mode: V.value,
            wait_seconds: Math.max(1, Math.min(120, Math.floor(Number(Y.value) || 8))),
            assessor_model: Z.value || "class:fast",
            prompt: tt.value.trim()
          },
          system_prompt: nt.value.trim()
        }, { data: t } = await ot.post(`/api/v1/automations/${encodeURIComponent(A.value)}/actions/configure`, { input: o });
        $("change", { id: A.value, state: t?.result?.state }), $("close", {});
      } catch (o) {
        const t = mt(o, "save failed");
        C.value = t, $("error", { message: t, error: o });
      } finally {
        J.value = !1;
      }
    }
    function Ot() {
      $("close", {});
    }
    tn(() => {
      bt("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      }), bt("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), bt("wc-multiselect", { timeoutMs: 8e3 }).catch(() => {
      }), yt();
    }), nn(A, yt);
    function Vt(o) {
      Z.value = String(o.detail || "class:fast");
    }
    return (o, t) => {
      const c = q("wc-agent-picker"), b = q("wc-model-picker"), z = q("wc-multiselect");
      return i(), u("form", {
        class: "kx-cr",
        onSubmit: ct(Ut, ["prevent"])
      }, [
        r("div", Pn, [
          r("span", zn, [
            x(E(xt), {
              icon: "tabler:message-2-bolt",
              "aria-hidden": "true"
            })
          ]),
          r("div", $n, [
            t[13] || (t[13] = r("h2", null, "Channel responder", -1)),
            r("span", null, [
              Q.value ? (i(), u(y, { key: 0 }, [
                v(g(Q.value), 1)
              ], 64)) : H.value ? (i(), u(y, { key: 1 }, [
                v("Resolving…")
              ], 64)) : _.value ? (i(), u(y, { key: 2 }, [
                t[12] || (t[12] = v("Unknown channel", -1)),
                r("span", An, g(_.value), 1)
              ], 64)) : (i(), u(y, { key: 3 }, [
                v("Channel")
              ], 64)),
              gt.value ? (i(), u(y, { key: 4 }, [
                v(" · paused")
              ], 64)) : f("", !0)
            ])
          ])
        ]),
        U.value ? (i(), u("div", _n, "Loading responder settings…")) : (i(), u(y, { key: 1 }, [
          r("label", Mn, [
            t[14] || (t[14] = r("span", { class: "kx-field-lbl" }, "Name", -1)),
            w(r("input", {
              "onUpdate:modelValue": t[0] || (t[0] = (d) => O.value = d),
              class: "kx-input",
              type: "text",
              placeholder: "Support channel responder"
            }, null, 512), [
              [I, O.value]
            ])
          ]),
          r("label", In, [
            t[16] || (t[16] = r("span", { class: "kx-field-lbl" }, "Channel", -1)),
            r("div", Bn, [
              Q.value ? (i(), u(y, { key: 0 }, [
                v(g(Q.value), 1)
              ], 64)) : H.value ? (i(), u(y, { key: 1 }, [
                v("Resolving…")
              ], 64)) : _.value ? (i(), u(y, { key: 2 }, [
                t[15] || (t[15] = v("Unknown channel", -1)),
                r("span", Nn, g(_.value), 1)
              ], 64)) : (i(), u(y, { key: 3 }, [
                v("Channel")
              ], 64))
            ])
          ]),
          r("div", jn, [
            t[17] || (t[17] = r("span", { class: "kx-field-lbl" }, "Agent", -1)),
            x(c, {
              placeholder: "Pick an agent…",
              multi: "false",
              selected: B.value ? JSON.stringify([B.value]) : "[]",
              onChange: Mt
            }, null, 8, ["selected"])
          ]),
          r("label", Tn, [
            t[18] || (t[18] = r("span", { class: "kx-field-lbl" }, "System prompt", -1)),
            w(r("textarea", {
              "onUpdate:modelValue": t[1] || (t[1] = (d) => nt.value = d),
              class: "kx-input kx-textarea kx-textarea-lg",
              rows: "7",
              placeholder: "Instructions applied to every channel turn."
            }, null, 512), [
              [I, nt.value]
            ])
          ]),
          r("div", Un, [
            r("button", {
              type: "button",
              class: "kx-adv-toggle",
              onClick: t[2] || (t[2] = (d) => R.value = !R.value)
            }, [
              x(E(xt), {
                icon: R.value ? "tabler:chevron-down" : "tabler:chevron-right",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              t[19] || (t[19] = v(" Advanced ", -1)),
              k.value.length || N.value.trim() || M.value || j.value !== 10 || L.value ? (i(), u("span", On, g(k.value.length) + g(N.value.trim() ? " + context" : "") + g(M.value ? " + chat cutoff" : "") + g(j.value !== 10 ? " + runtime idle" : "") + g(L.value ? " + lazy" : ""), 1)) : f("", !0)
            ]),
            R.value ? (i(), u("div", Vn, [
              r("div", Rn, [
                t[20] || (t[20] = r("span", { class: "kx-field-lbl" }, "Response mode", -1)),
                x(E(Kt), {
                  modelValue: V.value,
                  "onUpdate:modelValue": t[3] || (t[3] = (d) => V.value = d),
                  class: "kx-select",
                  options: At,
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Response mode"
                }, null, 8, ["modelValue"])
              ]),
              L.value ? (i(), u("label", Ln, [
                t[21] || (t[21] = r("span", { class: "kx-field-lbl" }, "Quiet window seconds", -1)),
                w(r("input", {
                  "onUpdate:modelValue": t[4] || (t[4] = (d) => Y.value = d),
                  class: "kx-input",
                  type: "number",
                  min: "1",
                  max: "120",
                  step: "1"
                }, null, 512), [
                  [
                    I,
                    Y.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ])) : f("", !0),
              L.value ? (i(), u("div", En, [
                t[22] || (t[22] = r("span", { class: "kx-field-lbl" }, "Assessment model", -1)),
                x(b, {
                  value: Z.value,
                  capability: "generate",
                  onSelect: Vt
                }, null, 8, ["value"])
              ])) : f("", !0),
              L.value ? (i(), u("label", Fn, [
                t[23] || (t[23] = r("span", { class: "kx-field-lbl" }, "Lazy response prompt", -1)),
                w(r("textarea", {
                  "onUpdate:modelValue": t[5] || (t[5] = (d) => tt.value = d),
                  class: "kx-input kx-textarea",
                  rows: "4",
                  placeholder: "Tell the responder when to stay quiet and when to answer."
                }, null, 512), [
                  [I, tt.value]
                ])
              ])) : f("", !0),
              r("div", qn, [
                t[24] || (t[24] = r("span", { class: "kx-field-lbl" }, "Additional capabilities", -1)),
                x(z, {
                  source: "/api/v1/agents/traits",
                  "response-key": "traits",
                  "label-key": "title",
                  "desc-key": "description",
                  placeholder: "Add capabilities on top of the agent's own…",
                  selected: JSON.stringify(k.value),
                  onChange: It
                }, null, 8, ["selected"])
              ]),
              (i(!0), u(y, null, on(_t.value, (d) => (i(), u("div", {
                key: d.id,
                class: "kx-field kx-trait-cfg"
              }, [
                r("span", Dn, [
                  v(g(e(d)), 1),
                  d.title?.trim() ? f("", !0) : (i(), u("span", Kn, g(d.id), 1))
                ]),
                x(Wt, {
                  tag: d.web_component || "",
                  config: P.value[d.id] || {},
                  provider: d.provider,
                  onChange: (Rt) => Bt(d.id, Rt)
                }, null, 8, ["tag", "config", "provider", "onChange"])
              ]))), 128)),
              r("label", Wn, [
                t[25] || (t[25] = r("span", { class: "kx-field-lbl" }, "Additional prompt context", -1)),
                w(r("textarea", {
                  "onUpdate:modelValue": t[6] || (t[6] = (d) => N.value = d),
                  class: "kx-input kx-textarea",
                  rows: "3",
                  placeholder: "Stable prompt context for every reply in this channel."
                }, null, 512), [
                  [I, N.value]
                ])
              ]),
              r("label", Jn, [
                w(r("input", {
                  "onUpdate:modelValue": t[7] || (t[7] = (d) => M.value = d),
                  type: "checkbox"
                }, null, 512), [
                  [en, M.value]
                ]),
                r("span", null, [
                  t[28] || (t[28] = r("strong", null, "Start a new chat after quiet time", -1)),
                  t[29] || (t[29] = r("small", null, "When the channel is quiet for the selected time, the next message starts a fresh chat history.", -1)),
                  M.value ? (i(), u("span", {
                    key: 0,
                    class: "kx-inline-control",
                    onClick: t[10] || (t[10] = ct(() => {
                    }, ["stop"]))
                  }, [
                    t[26] || (t[26] = r("span", null, "After", -1)),
                    w(r("input", {
                      "onUpdate:modelValue": t[8] || (t[8] = (d) => X.value = d),
                      class: "kx-input kx-number-sm",
                      type: "number",
                      min: "1",
                      max: "43200",
                      step: "1",
                      onClick: t[9] || (t[9] = ct(() => {
                      }, ["stop"]))
                    }, null, 512), [
                      [
                        I,
                        X.value,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    t[27] || (t[27] = r("span", null, "minutes", -1))
                  ])) : f("", !0)
                ])
              ]),
              r("label", Hn, [
                t[31] || (t[31] = r("span", { class: "kx-field-lbl" }, "Stop idle responder after", -1)),
                r("span", Qn, [
                  w(r("input", {
                    "onUpdate:modelValue": t[11] || (t[11] = (d) => j.value = d),
                    class: "kx-input kx-number-sm",
                    type: "number",
                    min: "1",
                    max: "1440",
                    step: "1"
                  }, null, 512), [
                    [
                      I,
                      j.value,
                      void 0,
                      { number: !0 }
                    ]
                  ]),
                  t[30] || (t[30] = r("span", null, "minutes without activity", -1))
                ]),
                t[32] || (t[32] = r("small", { class: "kx-field-help" }, "Ends the live responder process; the next channel message starts it again.", -1))
              ])
            ])) : f("", !0)
          ])
        ], 64)),
        C.value ? (i(), u("div", Gn, g(C.value), 1)) : f("", !0),
        r("div", Xn, [
          x(E(pt), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            onClick: Ot
          }),
          x(E(pt), {
            type: "submit",
            label: "Save",
            loading: J.value,
            disabled: U.value || J.value || !ft.value
          }, null, 8, ["loading", "disabled"])
        ])
      ], 32);
    };
  }
}), Zn = {
  type: "object",
  properties: {
    config: { type: "object" },
    value: { type: "object" }
  }
};
class to extends Jt {
  static get wippyConfig() {
    return {
      propsSchema: Zn,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ht
    };
  }
  static get vueConfig() {
    return { rootComponent: Yn, plugins: [Qt] };
  }
}
rn(import.meta.url, to);
//# sourceMappingURL=channel_responder_manage.js.map
