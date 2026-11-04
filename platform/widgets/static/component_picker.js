import { u as rt, a as nt, W as et } from "./index-C70m2Vvt.js";
import { openBlock as s, createElementBlock as d, mergeProps as _, renderSlot as X, createTextVNode as fo, toDisplayString as E, resolveComponent as Ao, resolveDirective as at, withDirectives as it, createBlock as io, resolveDynamicComponent as ct, withCtx as Do, createCommentVNode as j, normalizeClass as K, createElementVNode as y, defineComponent as Oo, computed as g, withModifiers as A, Fragment as F, createVNode as m, unref as S, watch as co, onBeforeUnmount as lt, ref as k, withKeys as Lo, renderList as st } from "vue";
import { Icon as C } from "@iconify/vue";
import { on as pt, api as lo, host as dt, define as ut } from "@wippy-fe/proxy";
import { p as bt } from "./pickerValue-SPnnNBeX.js";
import { _ as gt, W as vt } from "./WcMount-N7EOK1cC.js";
import { B as ho, l as Uo, s as ft, a as mo, f as so, R as ht, b as mt } from "./index-nfQnU_Pv.js";
import { e as No } from "./errMsg-CxKGcp1F.js";
import { _ as yt } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
const wt = () => rt(), xt = () => nt();
var kt = `
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
`, St = {
  root: function(t) {
    var a = t.props, n = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": ft(a.value) && String(a.value).length === 1,
      "p-badge-dot": Uo(a.value) && !n.$slots.default,
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
}, _t = ho.extend({
  name: "badge",
  style: kt,
  classes: St
}), zt = {
  name: "BaseBadge",
  extends: mo,
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
  style: _t,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Y(o) {
  "@babel/helpers - typeof";
  return Y = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Y(o);
}
function To(o, t, a) {
  return (t = $t(t)) in o ? Object.defineProperty(o, t, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : o[t] = a, o;
}
function $t(o) {
  var t = Ct(o, "string");
  return Y(t) == "symbol" ? t : t + "";
}
function Ct(o, t) {
  if (Y(o) != "object" || !o) return o;
  var a = o[Symbol.toPrimitive];
  if (a !== void 0) {
    var n = a.call(o, t);
    if (Y(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(o);
}
var Fo = {
  name: "Badge",
  extends: zt,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return so(To(To({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Pt = ["data-p"];
function jt(o, t, a, n, c, p) {
  return s(), d("span", _({
    class: o.cx("root"),
    "data-p": p.dataP
  }, o.ptmi("root")), [X(o.$slots, "default", {}, function() {
    return [fo(E(o.value), 1)];
  })], 16, Pt);
}
Fo.render = jt;
var It = `
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
function Z(o) {
  "@babel/helpers - typeof";
  return Z = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Z(o);
}
function P(o, t, a) {
  return (t = Bt(t)) in o ? Object.defineProperty(o, t, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : o[t] = a, o;
}
function Bt(o) {
  var t = Et(o, "string");
  return Z(t) == "symbol" ? t : t + "";
}
function Et(o, t) {
  if (Z(o) != "object" || !o) return o;
  var a = o[Symbol.toPrimitive];
  if (a !== void 0) {
    var n = a.call(o, t);
    if (Z(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(o);
}
var At = {
  root: function(t) {
    var a = t.instance, n = t.props;
    return ["p-button p-component", P(P(P(P(P(P(P(P(P({
      "p-button-icon-only": a.hasIcon && !n.label && !n.badge,
      "p-button-vertical": (n.iconPos === "top" || n.iconPos === "bottom") && n.label,
      "p-button-loading": n.loading,
      "p-button-link": n.link || n.variant === "link"
    }, "p-button-".concat(n.severity), n.severity), "p-button-raised", n.raised), "p-button-rounded", n.rounded), "p-button-text", n.text || n.variant === "text"), "p-button-outlined", n.outlined || n.variant === "outlined"), "p-button-sm", n.size === "small"), "p-button-lg", n.size === "large"), "p-button-plain", n.plain), "p-button-fluid", a.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var a = t.props;
    return ["p-button-icon", P({}, "p-button-icon-".concat(a.iconPos), a.label)];
  },
  label: "p-button-label"
}, Lt = ho.extend({
  name: "button",
  style: It,
  classes: At
}), Nt = {
  name: "BaseButton",
  extends: mo,
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
  style: Lt,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function oo(o) {
  "@babel/helpers - typeof";
  return oo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, oo(o);
}
function h(o, t, a) {
  return (t = Tt(t)) in o ? Object.defineProperty(o, t, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : o[t] = a, o;
}
function Tt(o) {
  var t = Dt(o, "string");
  return oo(t) == "symbol" ? t : t + "";
}
function Dt(o, t) {
  if (oo(o) != "object" || !o) return o;
  var a = o[Symbol.toPrimitive];
  if (a !== void 0) {
    var n = a.call(o, t);
    if (oo(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(o);
}
var Ro = {
  name: "Button",
  extends: Nt,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      var a = t === "root" ? this.ptmi : this.ptm;
      return a(t, {
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
      return _(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Uo(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return so(h(h(h(h(h(h(h(h(h(h({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return so(h(h({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return so(h(h({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: mt,
    Badge: Fo
  },
  directives: {
    ripple: ht
  }
}, Ot = ["data-p"], Ut = ["data-p"];
function Ft(o, t, a, n, c, p) {
  var I = Ao("SpinnerIcon"), b = Ao("Badge"), u = at("ripple");
  return o.asChild ? X(o.$slots, "default", {
    key: 1,
    class: K(o.cx("root")),
    a11yAttrs: p.a11yAttrs
  }) : it((s(), io(ct(o.as), _({
    key: 0,
    class: o.cx("root"),
    "data-p": p.dataP
  }, p.attrs), {
    default: Do(function() {
      return [X(o.$slots, "default", {}, function() {
        return [o.loading ? X(o.$slots, "loadingicon", _({
          key: 0,
          class: [o.cx("loadingIcon"), o.cx("icon")]
        }, o.ptm("loadingIcon")), function() {
          return [o.loadingIcon ? (s(), d("span", _({
            key: 0,
            class: [o.cx("loadingIcon"), o.cx("icon"), o.loadingIcon]
          }, o.ptm("loadingIcon")), null, 16)) : (s(), io(I, _({
            key: 1,
            class: [o.cx("loadingIcon"), o.cx("icon")],
            spin: ""
          }, o.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : X(o.$slots, "icon", _({
          key: 1,
          class: [o.cx("icon")]
        }, o.ptm("icon")), function() {
          return [o.icon ? (s(), d("span", _({
            key: 0,
            class: [o.cx("icon"), o.icon, o.iconClass],
            "data-p": p.dataIconP
          }, o.ptm("icon")), null, 16, Ot)) : j("", !0)];
        }), o.label ? (s(), d("span", _({
          key: 2,
          class: o.cx("label")
        }, o.ptm("label"), {
          "data-p": p.dataLabelP
        }), E(o.label), 17, Ut)) : j("", !0), o.badge ? (s(), io(b, {
          key: 3,
          value: o.badge,
          class: K(o.badgeClass),
          severity: o.badgeSeverity,
          unstyled: o.unstyled,
          pt: o.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : j("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[u]]);
}
Ro.render = Ft;
var Rt = `
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
`, Mt = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Wt = ho.extend({
  name: "progressspinner",
  style: Rt,
  classes: Mt
}), Kt = {
  name: "BaseProgressSpinner",
  extends: mo,
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
  style: Wt,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Mo = {
  name: "ProgressSpinner",
  extends: Kt,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Vt = ["fill", "stroke-width"];
function Jt(o, t, a, n, c, p) {
  return s(), d("div", _({
    class: o.cx("root"),
    role: "progressbar"
  }, o.ptmi("root")), [(s(), d("svg", _({
    class: o.cx("spin"),
    viewBox: "25 25 50 50",
    style: p.svgStyle
  }, o.ptm("spin")), [y("circle", _({
    class: o.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: o.fill,
    "stroke-width": o.strokeWidth,
    strokeMiterlimit: "10"
  }, o.ptm("circle")), null, 16, Vt)], 16))], 16);
}
Mo.render = Jt;
const qt = { key: 0 }, Ht = /* @__PURE__ */ Oo({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(o) {
    const t = o, a = g(() => t.state.deletion_job?.status === "dead");
    return (n, c) => o.state.deleting_at ? (s(), d("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: c[1] || (c[1] = A(() => {
      }, ["stop"])),
      onKeydown: c[2] || (c[2] = A(() => {
      }, ["stop"]))
    }, [
      a.value ? (s(), d(F, { key: 0 }, [
        y("span", null, [
          c[3] || (c[3] = fo("Deletion failed", -1)),
          o.state.deletion_job?.last_error ? (s(), d("span", qt, ": " + E(o.state.deletion_job.last_error), 1)) : j("", !0)
        ]),
        m(S(Ro), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: c[0] || (c[0] = A((p) => n.$emit("retry"), ["stop"]))
        })
      ], 64)) : (s(), d(F, { key: 1 }, [
        m(S(Mo), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        c[4] || (c[4] = y("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : j("", !0);
  }
}), Gt = /* @__PURE__ */ gt(Ht, [["__scopeId", "data-v-ff2ded5c"]]);
function Q(o) {
  return !!o && typeof o == "object" && !Array.isArray(o);
}
function Qt(o, t) {
  return o;
}
function Xt(o, t, a) {
  const n = Q(o) ? o : {}, c = [
    n,
    Q(n.data) ? n.data : null,
    Q(n.payload) ? n.payload : null,
    Q(n.detail) ? n.detail : null
  ].filter(Boolean);
  for (const p of c) {
    if (p.event !== "component.meta.changed" && p.event !== "component.deleting" && p.event !== "component.deleted") continue;
    const I = String(p.component_id || ""), b = String(n.topic || p.topic || "");
    if (!I && (!b.startsWith("component.") || b === "component.")) continue;
    const u = I || t || b.slice(10);
    return p.event !== "component.meta.changed" ? { event: p.event, component_id: u } : {
      event: "component.meta.changed",
      component_id: u,
      meta: Qt(Q(p.meta) ? p.meta : {}),
      deleted: Array.isArray(p.deleted) ? p.deleted.map(String) : []
    };
  }
  return null;
}
function Yt(o, t) {
  const a = Xt(o, t);
  return a && a.event !== "component.meta.changed" ? a : null;
}
function Zt(o, t, a) {
  let n = !0;
  async function c(b) {
    try {
      const { data: u } = await lo.get(`/api/v1/components/${encodeURIComponent(t(b))}`);
      if (!u?.success) throw new Error(No(u, "Could not read deletion progress"));
      n && o.value.includes(b) && (b.deleting_at = u.deleting_at, b.deletion_job_id = u.deletion_job_id, b.deletion_job = u.deletion_job);
    } catch (u) {
      n && o.value.includes(b) && dt.handleError("other", { message: No(u, "Could not read deletion progress") });
    }
  }
  const p = co(() => o.value, (b, u = []) => {
    for (const w of u) b.some((D) => t(D) === t(w)) || a?.(t(w));
    for (const w of b) w.deleting_at && c(w);
  }, { immediate: !0 }), I = pt("@message", (b) => {
    const u = Yt(b);
    if (!u) return;
    const w = o.value.find((D) => t(D) === u.component_id);
    w && (u.event === "component.deleted" ? o.value = o.value.filter((D) => t(D) !== u.component_id) : c(w));
  });
  lt(() => {
    n = !1, p(), typeof I == "function" && I();
  });
}
const or = ["aria-expanded", "onKeydown"], tr = { class: "cp-pop" }, rr = {
  key: 0,
  class: "cp-state"
}, nr = {
  key: 1,
  class: "cp-create"
}, er = {
  key: 2,
  class: "cp-state cp-state--stack"
}, ar = { class: "cp-list" }, ir = ["disabled", "onClick"], cr = { class: "cp-label" }, lr = ["disabled", "onClick"], sr = ["onClick"], pr = {
  key: 0,
  class: "cp-del-err",
  "data-test": "cp-del-err"
}, dr = /* @__PURE__ */ Oo({
  __name: "ComponentPicker",
  setup(o) {
    const t = wt(), a = xt();
    function n(r) {
      return typeof r == "string" ? r : r == null ? "" : String(r);
    }
    function c(r) {
      if (r && typeof r == "object") return r;
      if (typeof r == "string" && r.trim().startsWith("{"))
        try {
          const e = JSON.parse(r);
          return e && typeof e == "object" ? e : null;
        } catch {
          return null;
        }
      return null;
    }
    function p(r) {
      return n(r.id || r.thread_id || r.component_id || r.webhook_id).trim();
    }
    function I(r) {
      const e = c(r.attrs);
      return n(
        r.label || r.title || r.name || r.component_title || e && (e.label || e.title || e.name)
      ).trim();
    }
    function b(r) {
      return n(r.icon || r.component_icon).trim() || "tabler:message-circle";
    }
    function u(r, e) {
      const i = c(r);
      if (!i) return "";
      const l = n(i[e]).trim();
      if (l) return l;
      const f = c(i.properties);
      if (!f) return "";
      for (const ao of Object.values(f)) {
        const H = c(ao), G = n(H?.[e]).trim();
        if (G) return G;
      }
      return "";
    }
    const w = g(() => {
      const r = c(c(t.value?.schema)?.properties);
      for (const [e, i] of Object.entries(r || {})) {
        const l = c(i);
        if (typeof l?.value_field == "string" && l.value_field) return { key: e, valueField: l.value_field };
      }
      return null;
    });
    function D(r, e) {
      const i = w.value;
      if (!i) return { thread_id: e };
      if (!(i.valueField in r)) throw new Error("Catalog item is missing its declared selection value.");
      return { [i.key]: r[i.valueField] };
    }
    function yo(r) {
      const e = w.value;
      if (!e) return bt(r, "thread_id");
      const i = c(r)?.[e.key];
      if (typeof i == "string") return i;
      const l = c(i);
      return typeof l?.id == "string" ? l.id : "";
    }
    const po = g(() => n(t.value?.source).trim() || u(t.value?.schema, "source") || "/api/v1/threads"), to = g(() => po.value.split("?")[0] === "/api/v1/threads"), V = g(() => {
      const r = n(t.value?.meta).trim();
      if (r.startsWith("{"))
        try {
          return JSON.parse(r);
        } catch {
          return {};
        }
      return {};
    }), uo = g(() => n(t.value?.threadClass).trim() || n(V.value.thread_class).trim()), wo = g(() => n(t.value?.implId).trim() || n(V.value.impl_id).trim() || u(t.value?.schema, "impl_id")), xo = g(() => n(t.value?.deleteEndpoint).trim() || n(V.value.delete_endpoint).trim()), bo = g(() => {
      if (!to.value) return null;
      const r = V.value?.component?.create_ui;
      return r && typeof r == "object" ? r : null;
    }), L = k(null), ro = g(() => n(bo.value?.tag_name).trim() || n(L.value?.tag_name).trim()), Wo = g(() => n(bo.value?.title).trim() || n(L.value?.title).trim()), O = g(() => (n(t.value?.title).trim() || n(V.value.title).trim()).toLowerCase()), ko = g(() => t.value?.placeholder || (O.value ? `Select a ${O.value}…` : "Select…")), Ko = g(() => O.value || Wo.value.toLowerCase() || "one"), So = g(() => `Create new ${Ko.value}`), go = g(() => O.value ? `Untitled ${O.value}` : "Untitled"), Vo = g(() => O.value ? `No ${O.value} available yet — create one first, then return here.` : "Nothing available yet — create one first, then return here."), z = k([]), R = k(!1), M = k(!1), $ = k(!1), no = k(!1), x = k(""), J = k(""), W = k(""), N = k(""), _o = k(null);
    async function Jo() {
      if (!to.value) {
        L.value = null;
        return;
      }
      if (bo.value) {
        L.value = null;
        return;
      }
      const r = uo.value;
      if (!r) {
        L.value = null;
        return;
      }
      try {
        const { data: e } = await lo.get(`/api/v1/component-kinds/create-view?class=${encodeURIComponent(r)}`), i = e?.create_view;
        L.value = i && n(i.tag_name).trim() ? i : null;
      } catch {
        L.value = null;
      }
    }
    async function q() {
      if (!M.value) {
        M.value = !0;
        try {
          const [r, e = ""] = po.value.split("?"), i = new URLSearchParams(e);
          to.value && (uo.value && i.set("thread_class", uo.value), wo.value && i.set("impl_id", wo.value), i.set("limit", "100"));
          const l = to.value ? `${r}?${i}` : po.value, f = [];
          let ao = l, H = 0;
          for (; ; ) {
            const { data: v } = await lo.get(ao);
            if (v?.success === !1) throw new Error(String(v.error || "Could not load components"));
            const T = Array.isArray(v?.items) ? v.items : Array.isArray(v?.threads) ? v.threads : [];
            f.push(...T);
            const B = v?.next_offset;
            if (B == null) break;
            if (typeof B != "number" || !Number.isSafeInteger(B) || B <= H)
              throw new Error("The server returns an invalid component offset.");
            H = B;
            const [ot, tt = ""] = l.split("?"), Eo = new URLSearchParams(tt);
            Eo.set("offset", String(H)), ao = `${ot}?${Eo}`;
          }
          const G = /* @__PURE__ */ new Set(), Bo = [];
          for (const v of f) {
            const T = p(v);
            if (!T || G.has(T)) continue;
            G.add(T);
            const B = I(v);
            Bo.push({
              id: T,
              label: B && B !== T ? B : go.value,
              icon: b(v),
              selection: D(v, T),
              deleting_at: typeof v.deleting_at == "string" ? v.deleting_at : void 0,
              deletion_job_id: typeof v.deletion_job_id == "string" ? v.deletion_job_id : void 0
            });
          }
          z.value = Bo, R.value = !0, a("load", void 0);
        } catch (r) {
          a("error", { message: "failed to list options", error: r });
        } finally {
          M.value = !1;
        }
        Jo();
      }
    }
    const eo = g(() => z.value.find((r) => r.id === x.value) || null), U = k(null);
    function zo(r, e) {
      r && e && (U.value = { id: r, label: e });
    }
    const qo = g(() => {
      const r = eo.value;
      return r ? r.label : U.value && U.value.id === x.value ? U.value.label : M.value || !R.value ? ko.value : go.value;
    });
    co([eo, x], ([r, e]) => {
      r ? zo(e, r.label) : U.value && U.value.id !== e && (U.value = null);
    }, { immediate: !0 });
    async function Ho() {
      !x.value || eo.value || M.value || await q();
    }
    function $o(r) {
      x.value = r.id, zo(r.id, r.label), a("change", r.selection), a("config-changed", r.selection), $.value = !1;
    }
    function Go(r) {
      N.value = "", J.value = r.id;
    }
    function Qo() {
      J.value = "", N.value = "";
    }
    function Co(r, e) {
      const i = r && typeof r == "object" ? r : e && typeof e == "object" && e.response?.data && typeof e.response.data == "object" ? e.response.data : null;
      if (i) {
        const l = n(i.error).trim();
        if (l) return l;
        const f = Number(i.subscriber_count);
        if (f > 0) return `In use by ${f} — remove those first.`;
      }
      return e instanceof Error && e.message ? e.message : "Could not delete.";
    }
    async function Po(r) {
      const e = xo.value;
      if (!(!e || W.value)) {
        W.value = r.id, N.value = "";
        try {
          const i = `${e.replace(/\/+$/, "")}/${encodeURIComponent(r.id)}`, { data: l } = await lo.delete(i);
          if (l && typeof l == "object" && l.success === !1) {
            N.value = Co(l, null);
            return;
          }
          J.value = "", R.value = !1, await q();
        } catch (i) {
          N.value = Co(null, i);
        } finally {
          W.value = "";
        }
      }
    }
    function Xo(r) {
      if (typeof r == "string") return r;
      if (!r || typeof r != "object") return "";
      const e = r;
      return n(e.thread_id || e.webhook_id || e.component_id || e.id).trim();
    }
    function Yo(r) {
      if (!r || typeof r != "object") return "";
      const e = r;
      return n(e.label || e.title || e.name).trim();
    }
    function jo() {
      ro.value && (no.value = !0);
    }
    function Io() {
      no.value = !1;
    }
    async function Zo(r) {
      const e = Xo(r);
      if (no.value = !1, R.value = !1, await q(), e) {
        const i = z.value.find((f) => f.id === e);
        if (!i && w.value) {
          const f = "The created item has no published selection value in the catalog.";
          a("error", { message: f, error: new Error(f) });
          return;
        }
        const l = i || { id: e, label: Yo(r) || go.value, icon: "tabler:components", selection: { thread_id: e } };
        z.value.find((f) => f.id === e) || (z.value = [l, ...z.value]), $o(l), a("created", { thread_id: e });
      }
    }
    co(() => [t.value?.value, t.value?.config, t.value?.schema], () => {
      x.value = yo(t.value?.config) || yo(t.value?.value), Ho();
    }, { immediate: !0 }), co(() => [t.value?.threadClass, t.value?.implId, t.value?.meta, t.value?.source, t.value?.schema], () => {
      R.value = !1, z.value = [], L.value = null, J.value = "", N.value = "", Io(), $.value && q();
    });
    function vo() {
      $.value = !$.value, $.value && !R.value && q();
    }
    return Zt(z, (r) => r.id, (r) => {
      r === x.value && (x.value = "");
    }), (r, e) => (s(), d(F, null, [
      y("div", {
        ref_key: "ctrl",
        ref: _o,
        class: K(["cp", $.value && "cp-open"]),
        role: "button",
        tabindex: "0",
        "aria-expanded": $.value,
        onClick: vo,
        onKeydown: [
          Lo(vo, ["enter"]),
          Lo(A(vo, ["prevent"]), ["space"])
        ]
      }, [
        m(S(C), {
          icon: eo.value?.icon || "tabler:message-circle",
          class: "cp-lead",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        y("span", {
          class: K(["cp-value", !x.value && "cp-ph"])
        }, E(x.value ? qo.value : ko.value), 3),
        m(S(C), {
          icon: $.value ? "tabler:chevron-up" : "tabler:chevron-down",
          class: "cp-caret",
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 42, or),
      m(yt, {
        open: $.value,
        "onUpdate:open": e[0] || (e[0] = (i) => $.value = i),
        anchor: _o.value,
        "min-width": 260,
        "max-height": 320
      }, {
        default: Do(() => [
          y("div", tr, [
            M.value && !z.value.length ? (s(), d("div", rr, [
              m(S(C), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              e[1] || (e[1] = fo(" Loading…", -1))
            ])) : no.value ? (s(), d("div", nr, [
              m(vt, {
                tag: ro.value,
                onCreated: Zo,
                onClose: Io
              }, null, 8, ["tag"])
            ])) : z.value.length ? (s(), d(F, { key: 3 }, [
              y("div", ar, [
                (s(!0), d(F, null, st(z.value, (i) => (s(), d("div", {
                  key: i.id,
                  class: K(["cp-row cp-row--compound", i.id === x.value && "cp-row-on"])
                }, [
                  y("button", {
                    type: "button",
                    class: "cp-row-main",
                    disabled: !!i.deleting_at,
                    onClick: (l) => $o(i)
                  }, [
                    m(S(C), {
                      icon: i.icon,
                      class: "cp-ico",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    y("span", cr, E(i.label), 1),
                    i.id === x.value ? (s(), io(S(C), {
                      key: 0,
                      icon: "tabler:check",
                      class: "cp-check",
                      "aria-hidden": "true"
                    })) : j("", !0)
                  ], 8, ir),
                  m(Gt, {
                    state: i,
                    onRetry: (l) => Po(i)
                  }, null, 8, ["state", "onRetry"]),
                  xo.value && !i.deleting_at ? (s(), d(F, { key: 0 }, [
                    J.value === i.id ? (s(), d(F, { key: 0 }, [
                      y("button", {
                        type: "button",
                        class: "cp-row-del cp-row-del-yes",
                        disabled: W.value === i.id,
                        title: "Confirm delete",
                        "aria-label": "Confirm delete",
                        "data-test": "cp-del-confirm",
                        onClick: A((l) => Po(i), ["stop"])
                      }, [
                        m(S(C), {
                          icon: W.value === i.id ? "tabler:loader-2" : "tabler:check",
                          class: K(W.value === i.id && "spin"),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"])
                      ], 8, lr),
                      y("button", {
                        type: "button",
                        class: "cp-row-del",
                        title: "Cancel",
                        "aria-label": "Cancel delete",
                        onClick: A(Qo, ["stop"])
                      }, [
                        m(S(C), {
                          icon: "tabler:x",
                          "aria-hidden": "true"
                        })
                      ])
                    ], 64)) : (s(), d("button", {
                      key: 1,
                      type: "button",
                      class: "cp-row-del",
                      title: "Delete",
                      "aria-label": "Delete",
                      "data-test": "cp-del",
                      onClick: A((l) => Go(i), ["stop"])
                    }, [
                      m(S(C), {
                        icon: "tabler:trash",
                        "aria-hidden": "true"
                      })
                    ], 8, sr))
                  ], 64)) : j("", !0)
                ], 2))), 128)),
                N.value ? (s(), d("div", pr, E(N.value), 1)) : j("", !0)
              ]),
              ro.value ? (s(), d("button", {
                key: 0,
                type: "button",
                class: "cp-create-foot",
                "data-test": "cp-create-foot",
                onClick: A(jo, ["stop"])
              }, [
                m(S(C), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                y("span", null, E(So.value), 1)
              ])) : j("", !0)
            ], 64)) : (s(), d("div", er, [
              y("span", null, E(Vo.value), 1),
              ro.value ? (s(), d("button", {
                key: 0,
                type: "button",
                class: "cp-create-btn",
                "data-test": "cp-create",
                onClick: A(jo, ["stop"])
              }, [
                m(S(C), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                y("span", null, E(So.value), 1)
              ])) : j("", !0)
            ]))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), ur = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}:host{display:block}*,*:before,*:after{box-sizing:border-box}.cp{display:flex;align-items:center;gap:8px;width:100%;min-height:36px;padding:6px 10px;border:1px solid var(--p-content-border-color);background:var(--p-content-background);border-radius:8px;color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;transition:border-color .12s}.cp:hover,.cp-open{border-color:var(--p-primary-color)}.cp-lead{width:16px;height:16px;color:var(--p-text-muted-color);flex-shrink:0}.cp-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cp-ph{color:var(--p-text-muted-color)}.cp-caret{width:16px;height:16px;color:var(--p-text-muted-color);flex-shrink:0}.cp-pop{box-sizing:border-box;overflow:hidden;max-width:calc(100vw - 16px);max-height:var(--anchored-panel-available-height, 360px);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--p-select-overlay-border-radius);box-shadow:var(--p-select-overlay-shadow);padding:6px;display:flex;flex-direction:column;gap:2px;transition:height .2s ease,max-height .2s ease}.cp-state{display:flex;align-items:center;justify-content:center;gap:6px;padding:18px;font-size:12.5px;color:var(--p-text-muted-color)}.cp-list,.cp-tree{display:flex;flex-direction:column;gap:1px;flex:1 1 auto;min-height:0;overflow-y:auto}.cp-row{display:flex;align-items:center;gap:7px;width:100%;text-align:left;padding:8px;border:none;border-radius:8px;background:transparent;color:var(--p-text-color);cursor:pointer;outline:none;transition:background .1s}.cp-row:hover,.cp-row--compound:hover{background:var(--p-select-option-focus-background)}.cp-row:focus-visible,.cp-row--compound:focus-within{background:var(--p-select-option-focus-background);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--p-primary-color) 72%,transparent)}.cp-row-on{background:var(--p-select-option-selected-background)}.cp-row-main{display:flex;align-items:center;gap:7px;width:auto;min-width:0;flex:1;padding:8px;border:none;border-radius:8px;background:transparent;color:var(--p-text-color);cursor:pointer;outline:none;font:inherit;text-align:left}.cp-ico{width:16px;height:16px;color:var(--p-text-muted-color);flex-shrink:0}.cp-row-on .cp-ico{color:var(--p-primary-color)}.cp-label{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.cp-meta{font-size:11px;color:var(--p-text-muted-color);flex-shrink:0}.cp-check{width:16px;height:16px;color:var(--p-primary-color);flex-shrink:0}@media(prefers-reduced-motion:reduce){.cp-pop{transition:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.cp-state--stack{align-items:flex-start;flex-direction:column;gap:8px}.cp-create{padding:10px;overflow:auto}.kx-wcmount{display:block;width:100%}.kx-wcmount-fail{font-size:12px;color:var(--p-text-muted-color);padding:8px;border:1px dashed var(--p-content-border-color);border-radius:8px}.cp-create-btn{appearance:none;border:1px solid var(--p-primary-color);background:var(--p-primary-color);color:var(--p-button-primary-color);border-radius:8px;padding:8px 10px;font-size:12px;font-weight:650;display:inline-flex;align-items:center;gap:6px;cursor:pointer}.cp-create-foot{appearance:none;width:100%;margin-top:2px;border:1px dashed color-mix(in srgb,var(--p-primary-color) 55%,transparent);background:transparent;color:var(--p-primary-color);border-radius:8px;padding:8px;font-size:12.5px;font-weight:650;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}.cp-create-foot:hover{background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.cp-row--compound{gap:2px;padding:0}.cp-row-del{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin-right:4px;padding:0;border:none;border-radius:8px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;transition:background .1s,color .1s}.cp-row-del:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500)}.cp-row-del:disabled{opacity:.6;cursor:default}.cp-row-del-yes{color:var(--p-danger-500)}.cp-del-err{margin:4px 2px;padding:8px 10px;border-radius:10px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);background:color-mix(in srgb,var(--p-danger-500) 7%,transparent);font-size:12px;line-height:1.4;color:var(--p-danger-600, var(--p-danger-500))}', br = {
  type: "object",
  properties: {
    source: { type: "string", description: "Endpoint listing the picker catalog. When absent, the field schema's declared source wins, then the thread endpoint default." },
    schema: { type: "string", default: "", description: "Field schema. Its primary field may declare source to select a non-thread picker catalog." },
    "thread-class": { type: "string", default: "", description: "The component class to scope the instance list to (meta.thread_class)." },
    "impl-id": { type: "string", default: "", description: "Stored component implementation binding to scope the instance list to." },
    meta: { type: "string", default: "", description: 'JSON object {type:"thread", thread_class}. Supplies thread_class when set; the poller mount passes it.' },
    value: { type: "string", default: "", description: "Current selection: a JSON object string {thread_id} or empty." },
    config: { type: "string", default: "", description: "Alias of value: a JSON object string {thread_id}. Used by the poller config form." },
    placeholder: { type: "string", default: "", description: 'Text shown when nothing is selected. Empty lets the field title drive the prompt ("Select a <noun>…"), falling back to a neutral "Select…".' },
    "delete-endpoint": { type: "string", default: "", description: "Base endpoint enabling per-row deletion (DELETE <endpoint>/<id>). Empty disables it. Also read from meta.delete_endpoint." }
  }
};
class gr extends et {
  static get wippyConfig() {
    return {
      propsSchema: br,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: ur
    };
  }
  static get vueConfig() {
    return { rootComponent: dr };
  }
}
ut(import.meta.url, gr);
//# sourceMappingURL=component_picker.js.map
