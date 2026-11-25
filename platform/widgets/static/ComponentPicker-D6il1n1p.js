import { openBlock as s, createElementBlock as b, mergeProps as P, renderSlot as at, createTextVNode as mt, toDisplayString as F, resolveComponent as Tt, resolveDirective as ln, withDirectives as un, createBlock as bt, resolveDynamicComponent as sn, withCtx as Ft, createCommentVNode as D, normalizeClass as Z, createElementVNode as x, defineComponent as Ut, computed as f, withModifiers as U, Fragment as Q, createVNode as w, unref as j, watch as pt, onBeforeUnmount as cn, ref as $, withKeys as Et, renderList as bn } from "vue";
import { Icon as A } from "@iconify/vue";
import { on as pn, api as yt } from "@wippy-fe/proxy";
import { u as gn, a as fn, B as kt, b as Rt, s as vn, c as wt, f as gt, R as hn } from "./wc-runtime-Vcu3yWjv.js";
import { p as yn } from "./pickerValue-SPnnNBeX.js";
import { _ as mn } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { s as kn } from "./index-CWLxPt_A.js";
import { _ as wn } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
const xn = () => gn(), _n = () => fn();
var Sn = `
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
`, $n = {
  root: function(n) {
    var d = n.props, e = n.instance;
    return ["p-badge p-component", {
      "p-badge-circle": vn(d.value) && String(d.value).length === 1,
      "p-badge-dot": Rt(d.value) && !e.$slots.default,
      "p-badge-sm": d.size === "small",
      "p-badge-lg": d.size === "large",
      "p-badge-xl": d.size === "xlarge",
      "p-badge-info": d.severity === "info",
      "p-badge-success": d.severity === "success",
      "p-badge-warn": d.severity === "warn",
      "p-badge-danger": d.severity === "danger",
      "p-badge-secondary": d.severity === "secondary",
      "p-badge-contrast": d.severity === "contrast"
    }];
  }
}, jn = kt.extend({
  name: "badge",
  style: Sn,
  classes: $n
}), Pn = {
  name: "BaseBadge",
  extends: wt,
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
  style: jn,
  provide: function() {
    return {
      $pcBadge: this,
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
function Nt(t, n, d) {
  return (n = Cn(n)) in t ? Object.defineProperty(t, n, { value: d, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = d, t;
}
function Cn(t) {
  var n = In(t, "string");
  return dt(n) == "symbol" ? n : n + "";
}
function In(t, n) {
  if (dt(t) != "object" || !t) return t;
  var d = t[Symbol.toPrimitive];
  if (d !== void 0) {
    var e = d.call(t, n);
    if (dt(e) != "object") return e;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Kt = {
  name: "Badge",
  extends: Pn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return gt(Nt(Nt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, zn = ["data-p"];
function Bn(t, n, d, e, u, i) {
  return s(), b("span", P({
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [at(t.$slots, "default", {}, function() {
    return [mt(F(t.value), 1)];
  })], 16, zn);
}
Kt.render = Bn;
var On = `
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
function lt(t) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, lt(t);
}
function L(t, n, d) {
  return (n = An(n)) in t ? Object.defineProperty(t, n, { value: d, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = d, t;
}
function An(t) {
  var n = Ln(t, "string");
  return lt(n) == "symbol" ? n : n + "";
}
function Ln(t, n) {
  if (lt(t) != "object" || !t) return t;
  var d = t[Symbol.toPrimitive];
  if (d !== void 0) {
    var e = d.call(t, n);
    if (lt(e) != "object") return e;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Dn = {
  root: function(n) {
    var d = n.instance, e = n.props;
    return ["p-button p-component", L(L(L(L(L(L(L(L(L({
      "p-button-icon-only": d.hasIcon && !e.label && !e.badge,
      "p-button-vertical": (e.iconPos === "top" || e.iconPos === "bottom") && e.label,
      "p-button-loading": e.loading,
      "p-button-link": e.link || e.variant === "link"
    }, "p-button-".concat(e.severity), e.severity), "p-button-raised", e.raised), "p-button-rounded", e.rounded), "p-button-text", e.text || e.variant === "text"), "p-button-outlined", e.outlined || e.variant === "outlined"), "p-button-sm", e.size === "small"), "p-button-lg", e.size === "large"), "p-button-plain", e.plain), "p-button-fluid", d.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(n) {
    var d = n.props;
    return ["p-button-icon", L({}, "p-button-icon-".concat(d.iconPos), d.label)];
  },
  label: "p-button-label"
}, Tn = kt.extend({
  name: "button",
  style: On,
  classes: Dn
}), En = {
  name: "BaseButton",
  extends: wt,
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
  style: Tn,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function it(t) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, it(t);
}
function k(t, n, d) {
  return (n = Nn(n)) in t ? Object.defineProperty(t, n, { value: d, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = d, t;
}
function Nn(t) {
  var n = Fn(t, "string");
  return it(n) == "symbol" ? n : n + "";
}
function Fn(t, n) {
  if (it(t) != "object" || !t) return t;
  var d = t[Symbol.toPrimitive];
  if (d !== void 0) {
    var e = d.call(t, n);
    if (it(e) != "object") return e;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Vt = {
  name: "Button",
  extends: En,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(n) {
      var d = n === "root" ? this.ptmi : this.ptm;
      return d(n, {
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
      return P(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Rt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return gt(k(k(k(k(k(k(k(k(k(k({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return gt(k(k({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return gt(k(k({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: kn,
    Badge: Kt
  },
  directives: {
    ripple: hn
  }
}, Un = ["data-p"], Rn = ["data-p"];
function Kn(t, n, d, e, u, i) {
  var T = Tt("SpinnerIcon"), E = Tt("Badge"), C = ln("ripple");
  return t.asChild ? at(t.$slots, "default", {
    key: 1,
    class: Z(t.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : un((s(), bt(sn(t.as), P({
    key: 0,
    class: t.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: Ft(function() {
      return [at(t.$slots, "default", {}, function() {
        return [t.loading ? at(t.$slots, "loadingicon", P({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (s(), b("span", P({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (s(), bt(T, P({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : at(t.$slots, "icon", P({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (s(), b("span", P({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": i.dataIconP
          }, t.ptm("icon")), null, 16, Un)) : D("", !0)];
        }), t.label ? (s(), b("span", P({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": i.dataLabelP
        }), F(t.label), 17, Rn)) : D("", !0), t.badge ? (s(), bt(E, {
          key: 3,
          value: t.badge,
          class: Z(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : D("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[C]]);
}
Vt.render = Kn;
var Vn = `
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
`, Mn = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Wn = kt.extend({
  name: "progressspinner",
  style: Vn,
  classes: Mn
}), Jn = {
  name: "BaseProgressSpinner",
  extends: wt,
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
  style: Wn,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Mt = {
  name: "ProgressSpinner",
  extends: Jn,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Qn = ["fill", "stroke-width"];
function qn(t, n, d, e, u, i) {
  return s(), b("div", P({
    class: t.cx("root"),
    role: "progressbar"
  }, t.ptmi("root")), [(s(), b("svg", P({
    class: t.cx("spin"),
    viewBox: "25 25 50 50",
    style: i.svgStyle
  }, t.ptm("spin")), [x("circle", P({
    class: t.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: t.fill,
    "stroke-width": t.strokeWidth,
    strokeMiterlimit: "10"
  }, t.ptm("circle")), null, 16, Qn)], 16))], 16);
}
Mt.render = qn;
const Gn = { key: 0 }, Hn = /* @__PURE__ */ Ut({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(t) {
    const n = t, d = f(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (e, u) => t.state.deleting_at ? (s(), b("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: u[1] || (u[1] = U(() => {
      }, ["stop"])),
      onKeydown: u[2] || (u[2] = U(() => {
      }, ["stop"]))
    }, [
      d.value ? (s(), b(Q, { key: 0 }, [
        x("span", null, [
          u[3] || (u[3] = mt("Deletion failed", -1)),
          t.state.deletion_job?.last_error ? (s(), b("span", Gn, ": " + F(t.state.deletion_job.last_error), 1)) : D("", !0)
        ]),
        w(j(Vt), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: u[0] || (u[0] = U((i) => e.$emit("retry"), ["stop"]))
        })
      ], 64)) : (s(), b(Q, { key: 1 }, [
        w(j(Mt), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        u[4] || (u[4] = x("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : D("", !0);
  }
});
function rt(t) {
  return !!t && typeof t == "object" && !Array.isArray(t);
}
function Xn(t, n) {
  return t;
}
function Yn(t, n, d) {
  const e = rt(t) ? t : {}, u = [
    e,
    rt(e.data) ? e.data : null,
    rt(e.payload) ? e.payload : null,
    rt(e.detail) ? e.detail : null
  ].filter(Boolean);
  for (const i of u) {
    if (i.event !== "component.meta.changed" && i.event !== "component.deleting" && i.event !== "component.deleted") continue;
    const T = String(i.component_id || ""), E = String(e.topic || i.topic || "");
    if (!T && (!E.startsWith("component.") || E === "component.")) continue;
    const C = T || n || E.slice(10);
    return i.event === "component.deleting" && typeof i.deletion_job_id == "string" && i.deletion_job_id ? { event: i.event, component_id: C, deletion_job_id: i.deletion_job_id } : i.event !== "component.meta.changed" ? { event: i.event, component_id: C } : {
      event: "component.meta.changed",
      component_id: C,
      meta: Xn(rt(i.meta) ? i.meta : {}),
      deleted: Array.isArray(i.deleted) ? i.deleted.map(String) : []
    };
  }
  return null;
}
function Zn(t, n) {
  const d = Yn(t, n);
  return d && d.event !== "component.meta.changed" ? d : null;
}
function to(t, n, d, e) {
  const u = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map();
  function T(_, g) {
    const v = t.value.find((R) => n(R) === _), l = i.get(_), p = g?.job_id || l?.state.deletion_job_id || v?.deletion_job_id, I = l ? l.state.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((l || v?.deleting_at) && p === I || p && l?.superseded.has(p)) return;
    const m = {
      deleting_at: l?.state.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: p
    }, q = new Set(l?.superseded);
    for (const R of [l?.state.deletion_job_id, v?.deletion_job_id])
      R && R !== p && q.add(R);
    i.set(_, { state: m, superseded: q }), v && (Object.assign(v, m), v.deletion_job = void 0);
  }
  const E = pt(() => t.value, (_, g = []) => {
    const v = _.filter((l) => !u.has(n(l)));
    for (const l of g)
      u.has(n(l)) || v.some((p) => n(p) === n(l)) || l.deleting_at && e?.(n(l));
    if (v.length !== _.length) {
      t.value = v;
      return;
    }
    for (const l of _) {
      l.deleting_at && l.deletion_job === void 0 && !g.includes(l) && (l.deletion_job = null);
      const p = i.get(n(l));
      if (p) {
        const m = l.deletion_job_id;
        l.deleting_at && m && m !== p.state.deletion_job_id && !p.superseded.has(m) && (p.state.deletion_job_id && p.superseded.add(p.state.deletion_job_id), p.state.deletion_job_id = m), m !== p.state.deletion_job_id && (l.deletion_job = void 0), Object.assign(l, p.state);
      }
      const I = g.find((m) => n(m) === n(l));
      l.deletion_job === void 0 && I?.deletion_job_id === l.deletion_job_id && (l.deletion_job = I?.deletion_job);
    }
  }, { immediate: !0 }), C = pn("@message", (_) => {
    const g = Zn(_);
    if (!g) return;
    const v = t.value.find((l) => n(l) === g.component_id);
    g.event === "component.deleted" ? (v && !u.has(g.component_id) && e?.(g.component_id), u.add(g.component_id), i.delete(g.component_id), t.value = t.value.filter((l) => n(l) !== g.component_id)) : v && T(g.component_id, { job_id: g.deletion_job_id });
  });
  return cn(() => {
    E(), typeof C == "function" && C();
  }), { acceptDeletion: T };
}
const no = ["aria-expanded", "onKeydown"], oo = { class: "cp-pop" }, eo = {
  key: 0,
  class: "cp-state"
}, ro = {
  key: 1,
  class: "cp-create"
}, ao = {
  key: 2,
  class: "cp-state cp-state--stack"
}, lo = { class: "cp-list" }, io = ["disabled", "onClick"], uo = { class: "cp-label" }, so = ["disabled", "onClick"], co = ["onClick"], bo = {
  key: 0,
  class: "cp-del-err",
  "data-test": "cp-del-err"
}, wo = /* @__PURE__ */ Ut({
  __name: "ComponentPicker",
  setup(t) {
    const n = xn(), d = _n();
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
    function i(o) {
      return e(o.id || o.thread_id || o.component_id || o.webhook_id).trim();
    }
    function T(o) {
      const r = u(o.attrs), a = u(o.meta);
      return e(
        o.label || o.title || o.name || o.component_title || r && (r.label || r.title || r.name) || a && (a.label || a.title || a.name)
      ).trim();
    }
    function E(o) {
      const r = u(o.meta);
      return e(o.icon || o.component_icon || r && r.icon).trim() || "tabler:message-circle";
    }
    const C = f(() => {
      const o = u(n.value?.schema);
      if (!o) return null;
      const r = u(o.properties);
      if (!r) return { key: "", field: o };
      const a = Object.entries(r).flatMap(([O, ot]) => {
        const et = u(ot);
        return et ? [{ key: O, field: et }] : [];
      }), c = a.filter(({ field: O }) => O.picker === "wc-component-picker");
      if (c.length === 1) return c[0];
      const h = a.filter(({ field: O }) => typeof O.value_field == "string" && O.value_field);
      return h.length === 1 ? h[0] : null;
    });
    function _(o) {
      return e(C.value?.field[o]).trim();
    }
    const g = f(() => {
      const o = C.value;
      return o?.key ? { key: o.key, valueField: typeof o.field.value_field == "string" && o.field.value_field ? o.field.value_field : "" } : null;
    });
    function v(o, r) {
      const a = g.value;
      if (!a) return { thread_id: r };
      if (!a.valueField) return { [a.key]: r };
      if (!(a.valueField in o)) throw new Error("Catalog item is missing its declared selection value.");
      return { [a.key]: o[a.valueField] };
    }
    function l(o) {
      const r = g.value;
      if (!r) return yn(o, "thread_id");
      const a = u(o), c = a && Object.hasOwn(a, r.key) ? a[r.key] : r.valueField ? void 0 : a?.thread_id;
      if (typeof c == "string") return c;
      const h = u(c);
      return typeof h?.id == "string" ? h.id : "";
    }
    const p = f(() => e(n.value?.source).trim() || _("source") || "/api/v1/threads"), I = f(() => p.value.split("?")[0] === "/api/v1/threads"), m = f(() => {
      const o = e(n.value?.meta).trim();
      if (o.startsWith("{"))
        try {
          return JSON.parse(o);
        } catch {
          return {};
        }
      return {};
    }), q = f(() => e(n.value?.threadClass).trim() || e(m.value.thread_class).trim() || _("class")), R = f(() => e(n.value?.implId).trim() || e(m.value.impl_id).trim() || _("impl_id")), xt = f(() => e(n.value?.deleteEndpoint).trim() || e(m.value.delete_endpoint).trim()), ft = f(() => {
      if (!I.value) return null;
      const o = m.value?.component?.create_ui;
      return o && typeof o == "object" ? o : null;
    }), K = $(null), ut = f(() => e(ft.value?.tag_name).trim() || e(K.value?.tag_name).trim()), Wt = f(() => e(ft.value?.title).trim() || e(K.value?.title).trim()), W = f(() => (e(n.value?.title).trim() || e(m.value.title).trim()).toLowerCase()), _t = f(() => n.value?.placeholder || (W.value ? `Select a ${W.value}…` : "Select…")), Jt = f(() => W.value || Wt.value.toLowerCase() || "one"), St = f(() => `Create new ${Jt.value}`), vt = f(() => W.value ? `Untitled ${W.value}` : "Untitled"), Qt = f(() => W.value ? `No ${W.value} available yet — create one first, then return here.` : "Nothing available yet — create one first, then return here."), z = $([]), G = $(!1), H = $(!1), B = $(!1), st = $(!1), S = $(""), tt = $(""), X = $(""), V = $(""), $t = $(null);
    async function qt() {
      if (!I.value) {
        K.value = null;
        return;
      }
      if (ft.value) {
        K.value = null;
        return;
      }
      const o = q.value;
      if (!o) {
        K.value = null;
        return;
      }
      try {
        const { data: r } = await yt.get(`/api/v1/component-kinds/create-view?class=${encodeURIComponent(o)}`), a = r?.create_view;
        K.value = a && e(a.tag_name).trim() ? a : null;
      } catch {
        K.value = null;
      }
    }
    async function nt() {
      if (!H.value) {
        H.value = !0;
        try {
          const [o, r = ""] = p.value.split("?"), a = new URLSearchParams(r);
          I.value && (q.value && a.set("thread_class", q.value), R.value && a.set("impl_id", R.value)), I.value && a.set("limit", "100");
          const c = I.value ? `${o}?${a}` : p.value, h = [];
          let O = c, ot = 0;
          const et = /* @__PURE__ */ new Set();
          for (; ; ) {
            const { data: y } = await yt.get(O);
            if (y?.success === !1) throw new Error(String(y.error || "Could not load components"));
            const M = Array.isArray(y?.items) ? y.items : Array.isArray(y?.threads) ? y.threads : [];
            h.push(...M);
            const N = y?.next_offset;
            if (N != null) {
              if (typeof N != "number" || !Number.isSafeInteger(N) || N <= ot)
                throw new Error("The server returns an invalid component offset.");
              ot = N;
              const [an, dn = ""] = c.split("?"), Dt = new URLSearchParams(dn);
              Dt.set("offset", String(ot)), O = `${an}?${Dt}`;
              continue;
            }
            if (I.value) break;
            const Y = y?.next_cursor;
            if (Y == null) break;
            if (typeof Y != "string" || Y === "" || et.has(Y))
              throw new Error("The server returns an invalid component cursor.");
            et.add(Y);
            const [en, rn = ""] = c.split("?"), Lt = new URLSearchParams(rn);
            Lt.set("cursor", Y), O = `${en}?${Lt}`;
          }
          const Ot = /* @__PURE__ */ new Set(), At = [];
          for (const y of h) {
            const M = i(y);
            if (!M || Ot.has(M)) continue;
            Ot.add(M);
            const N = T(y);
            At.push({
              id: M,
              label: N && N !== M ? N : vt.value,
              icon: E(y),
              selection: v(y, M),
              deleting_at: typeof y.deleting_at == "string" ? y.deleting_at : void 0,
              deletion_job_id: typeof y.deletion_job_id == "string" ? y.deletion_job_id : void 0,
              deletion_job: y.deletion_job
            });
          }
          z.value = At, G.value = !0, d("load", void 0);
        } catch (o) {
          d("error", { message: "failed to list options", error: o });
        } finally {
          H.value = !1;
        }
        qt();
      }
    }
    const ct = f(() => z.value.find((o) => o.id === S.value) || null), J = $(null);
    function jt(o, r) {
      o && r && (J.value = { id: o, label: r });
    }
    const Gt = f(() => {
      const o = ct.value;
      return o ? o.label : J.value && J.value.id === S.value ? J.value.label : H.value || !G.value ? _t.value : vt.value;
    });
    pt([ct, S], ([o, r]) => {
      o ? jt(r, o.label) : J.value && J.value.id !== r && (J.value = null);
    }, { immediate: !0 });
    async function Ht() {
      !S.value || ct.value || H.value || await nt();
    }
    function Pt(o) {
      S.value = o.id, jt(o.id, o.label), d("change", o.selection), d("config-changed", o.selection), B.value = !1;
    }
    function Xt(o) {
      V.value = "", tt.value = o.id;
    }
    function Yt() {
      tt.value = "", V.value = "";
    }
    function Ct(o, r) {
      const a = o && typeof o == "object" ? o : r && typeof r == "object" && r.response?.data && typeof r.response.data == "object" ? r.response.data : null;
      if (a) {
        const c = e(a.error).trim();
        if (c) return c;
        const h = Number(a.subscriber_count);
        if (h > 0) return `In use by ${h} — remove those first.`;
      }
      return r instanceof Error && r.message ? r.message : "Could not delete.";
    }
    async function It(o) {
      const r = xt.value;
      if (!(!r || X.value)) {
        X.value = o.id, V.value = "";
        try {
          const a = `${r.replace(/\/+$/, "")}/${encodeURIComponent(o.id)}`, { data: c } = await yt.delete(a);
          if (c && typeof c == "object" && c.success === !1) {
            V.value = Ct(c, null);
            return;
          }
          on(o.id, c), tt.value = "", G.value = !1, await nt();
        } catch (a) {
          V.value = Ct(null, a);
        } finally {
          X.value = "";
        }
      }
    }
    function Zt(o) {
      if (typeof o == "string") return o;
      if (!o || typeof o != "object") return "";
      const r = o;
      return e(r.thread_id || r.webhook_id || r.component_id || r.id).trim();
    }
    function tn(o) {
      if (!o || typeof o != "object") return "";
      const r = o;
      return e(r.label || r.title || r.name).trim();
    }
    function zt() {
      ut.value && (st.value = !0);
    }
    function Bt() {
      st.value = !1;
    }
    async function nn(o) {
      const r = Zt(o);
      if (st.value = !1, G.value = !1, await nt(), r) {
        const a = z.value.find((h) => h.id === r);
        if (!a && g.value?.valueField) {
          const h = "The created item has no published selection value in the catalog.";
          d("error", { message: h, error: new Error(h) });
          return;
        }
        const c = a || { id: r, label: tn(o) || vt.value, icon: "tabler:components", selection: v({ id: r }, r) };
        z.value.find((h) => h.id === r) || (z.value = [c, ...z.value]), Pt(c), d("created", { thread_id: r });
      }
    }
    pt(() => [n.value?.value, n.value?.config, n.value?.schema], () => {
      S.value = l(n.value?.config) || l(n.value?.value), Ht();
    }, { immediate: !0 }), pt(() => [n.value?.threadClass, n.value?.implId, n.value?.meta, n.value?.source, n.value?.schema], () => {
      G.value = !1, z.value = [], K.value = null, tt.value = "", V.value = "", Bt(), B.value && nt();
    });
    function ht() {
      B.value = !B.value, B.value && !G.value && nt();
    }
    const { acceptDeletion: on } = to(z, (o) => o.id, void 0, (o) => {
      o === S.value && (S.value = "");
    });
    return (o, r) => (s(), b(Q, null, [
      x("div", {
        ref_key: "ctrl",
        ref: $t,
        class: Z(["cp", B.value && "cp-open"]),
        role: "button",
        tabindex: "0",
        "aria-expanded": B.value,
        onClick: ht,
        onKeydown: [
          Et(ht, ["enter"]),
          Et(U(ht, ["prevent"]), ["space"])
        ]
      }, [
        w(j(A), {
          icon: ct.value?.icon || "tabler:message-circle",
          class: "cp-lead",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        x("span", {
          class: Z(["cp-value", !S.value && "cp-ph"])
        }, F(S.value ? Gt.value : _t.value), 3),
        w(j(A), {
          icon: B.value ? "tabler:chevron-up" : "tabler:chevron-down",
          class: "cp-caret",
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 42, no),
      w(wn, {
        open: B.value,
        "onUpdate:open": r[0] || (r[0] = (a) => B.value = a),
        anchor: $t.value,
        "min-width": 260,
        "max-height": 320
      }, {
        default: Ft(() => [
          x("div", oo, [
            H.value && !z.value.length ? (s(), b("div", eo, [
              w(j(A), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              r[1] || (r[1] = mt(" Loading…", -1))
            ])) : st.value ? (s(), b("div", ro, [
              w(mn, {
                tag: ut.value,
                onCreated: nn,
                onClose: Bt
              }, null, 8, ["tag"])
            ])) : z.value.length ? (s(), b(Q, { key: 3 }, [
              x("div", lo, [
                (s(!0), b(Q, null, bn(z.value, (a) => (s(), b("div", {
                  key: a.id,
                  class: Z(["cp-row cp-row--compound", a.id === S.value && "cp-row-on"])
                }, [
                  x("button", {
                    type: "button",
                    class: "cp-row-main",
                    disabled: !!a.deleting_at,
                    onClick: (c) => Pt(a)
                  }, [
                    w(j(A), {
                      icon: a.icon,
                      class: "cp-ico",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    x("span", uo, F(a.label), 1),
                    a.id === S.value ? (s(), bt(j(A), {
                      key: 0,
                      icon: "tabler:check",
                      class: "cp-check",
                      "aria-hidden": "true"
                    })) : D("", !0)
                  ], 8, io),
                  w(Hn, {
                    state: a,
                    onRetry: (c) => It(a)
                  }, null, 8, ["state", "onRetry"]),
                  xt.value && !a.deleting_at ? (s(), b(Q, { key: 0 }, [
                    tt.value === a.id ? (s(), b(Q, { key: 0 }, [
                      x("button", {
                        type: "button",
                        class: "cp-row-del cp-row-del-yes",
                        disabled: X.value === a.id,
                        title: "Confirm delete",
                        "aria-label": "Confirm delete",
                        "data-test": "cp-del-confirm",
                        onClick: U((c) => It(a), ["stop"])
                      }, [
                        w(j(A), {
                          icon: X.value === a.id ? "tabler:loader-2" : "tabler:check",
                          class: Z(X.value === a.id && "spin"),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"])
                      ], 8, so),
                      x("button", {
                        type: "button",
                        class: "cp-row-del",
                        title: "Cancel",
                        "aria-label": "Cancel delete",
                        onClick: U(Yt, ["stop"])
                      }, [
                        w(j(A), {
                          icon: "tabler:x",
                          "aria-hidden": "true"
                        })
                      ])
                    ], 64)) : (s(), b("button", {
                      key: 1,
                      type: "button",
                      class: "cp-row-del",
                      title: "Delete",
                      "aria-label": "Delete",
                      "data-test": "cp-del",
                      onClick: U((c) => Xt(a), ["stop"])
                    }, [
                      w(j(A), {
                        icon: "tabler:trash",
                        "aria-hidden": "true"
                      })
                    ], 8, co))
                  ], 64)) : D("", !0)
                ], 2))), 128)),
                V.value ? (s(), b("div", bo, F(V.value), 1)) : D("", !0)
              ]),
              ut.value ? (s(), b("button", {
                key: 0,
                type: "button",
                class: "cp-create-foot",
                "data-test": "cp-create-foot",
                onClick: U(zt, ["stop"])
              }, [
                w(j(A), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                x("span", null, F(St.value), 1)
              ])) : D("", !0)
            ], 64)) : (s(), b("div", ao, [
              x("span", null, F(Qt.value), 1),
              ut.value ? (s(), b("button", {
                key: 0,
                type: "button",
                class: "cp-create-btn",
                "data-test": "cp-create",
                onClick: U(zt, ["stop"])
              }, [
                w(j(A), {
                  icon: "tabler:plus",
                  "aria-hidden": "true"
                }),
                x("span", null, F(St.value), 1)
              ])) : D("", !0)
            ]))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
export {
  wo as default
};
//# sourceMappingURL=ComponentPicker-D6il1n1p.js.map
