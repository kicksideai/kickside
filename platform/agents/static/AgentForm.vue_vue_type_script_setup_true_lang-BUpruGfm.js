import { openBlock as u, createElementBlock as f, mergeProps as _, renderSlot as D, createTextVNode as A, toDisplayString as I, resolveComponent as ut, resolveDirective as Ft, withDirectives as R, createBlock as H, resolveDynamicComponent as mt, withCtx as j, createCommentVNode as z, normalizeClass as N, createElementVNode as i, computed as E, createVNode as $, Transition as fe, Fragment as W, defineComponent as Q, renderList as vt, unref as b, ref as U, onMounted as Vt, watch as yt, onBeforeUnmount as he, shallowRef as me, vModelText as X, nextTick as ve } from "vue";
import { Icon as M } from "@iconify/vue";
import { B as at, n as Rt, d as Nt, s as _t, f as G, R as Ht, a as Ut, L as ye, h as Y, i as J, o as ke, U as we, q as It, r as xe, t as Kt, w as Ce, c as _e, v as Se, y as $e, A as Ee, S as ze, _ as Le, x as gt, E as Ie } from "./wc-runtime-BREvwtdZ.js";
import { b as Pe, a as Be, s as De } from "./index-BBQcPOpi.js";
import { loadByTagName as kt, api as ft } from "@wippy-fe/proxy";
import { _ as Ae } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { _ as Oe } from "./toolCatalog-W6OjlU7E.js";
var Te = `
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
`, Me = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Nt(n.value) && String(n.value).length === 1,
      "p-badge-dot": Rt(n.value) && !o.$slots.default,
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
}, je = at.extend({
  name: "badge",
  style: Te,
  classes: Me
}), Fe = {
  name: "BaseBadge",
  extends: _t,
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
  style: je,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function tt(t) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, tt(t);
}
function Pt(t, e, n) {
  return (e = Ve(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ve(t) {
  var e = Re(t, "string");
  return tt(e) == "symbol" ? e : e + "";
}
function Re(t, e) {
  if (tt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (tt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Wt = {
  name: "Badge",
  extends: Fe,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return G(Pt(Pt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Ne = ["data-p"];
function He(t, e, n, o, s, r) {
  return u(), f("span", _({
    class: t.cx("root"),
    "data-p": r.dataP
  }, t.ptmi("root")), [D(t.$slots, "default", {}, function() {
    return [A(I(t.value), 1)];
  })], 16, Ne);
}
Wt.render = He;
var Ue = `
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
function et(t) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, et(t);
}
function O(t, e, n) {
  return (e = Ke(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ke(t) {
  var e = We(t, "string");
  return et(e) == "symbol" ? e : e + "";
}
function We(t, e) {
  if (et(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (et(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ze = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", O(O(O(O(O(O(O(O(O({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", O({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Xe = at.extend({
  name: "button",
  style: Ue,
  classes: Ze
}), Ye = {
  name: "BaseButton",
  extends: _t,
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
  style: Xe,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function nt(t) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, nt(t);
}
function B(t, e, n) {
  return (e = Ge(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ge(t) {
  var e = qe(t, "string");
  return nt(e) == "symbol" ? e : e + "";
}
function qe(t, e) {
  if (nt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (nt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ct = {
  name: "Button",
  extends: Ye,
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
      return Rt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return G(B(B(B(B(B(B(B(B(B(B({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return G(B(B({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return G(B(B({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Pe,
    Badge: Wt
  },
  directives: {
    ripple: Ht
  }
}, Je = ["data-p"], Qe = ["data-p"];
function tn(t, e, n, o, s, r) {
  var y = ut("SpinnerIcon"), x = ut("Badge"), g = Ft("ripple");
  return t.asChild ? D(t.$slots, "default", {
    key: 1,
    class: N(t.cx("root")),
    a11yAttrs: r.a11yAttrs
  }) : R((u(), H(mt(t.as), _({
    key: 0,
    class: t.cx("root"),
    "data-p": r.dataP
  }, r.attrs), {
    default: j(function() {
      return [D(t.$slots, "default", {}, function() {
        return [t.loading ? D(t.$slots, "loadingicon", _({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (u(), f("span", _({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (u(), H(y, _({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : D(t.$slots, "icon", _({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (u(), f("span", _({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": r.dataIconP
          }, t.ptm("icon")), null, 16, Je)) : z("", !0)];
        }), t.label ? (u(), f("span", _({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": r.dataLabelP
        }), I(t.label), 17, Qe)) : z("", !0), t.badge ? (u(), H(x, {
          key: 3,
          value: t.badge,
          class: N(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : z("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[g]]);
}
ct.render = tn;
var Zt = {
  name: "WindowMaximizeIcon",
  extends: Ut
};
function en(t) {
  return an(t) || rn(t) || on(t) || nn();
}
function nn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function on(t, e) {
  if (t) {
    if (typeof t == "string") return wt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? wt(t, e) : void 0;
  }
}
function rn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function an(t) {
  if (Array.isArray(t)) return wt(t);
}
function wt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function ln(t, e, n, o, s, r) {
  return u(), f("svg", _({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), en(e[0] || (e[0] = [i("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Zt.render = ln;
var Xt = {
  name: "WindowMinimizeIcon",
  extends: Ut
};
function sn(t) {
  return bn(t) || cn(t) || un(t) || dn();
}
function dn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function un(t, e) {
  if (t) {
    if (typeof t == "string") return xt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(t, e) : void 0;
  }
}
function cn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function bn(t) {
  if (Array.isArray(t)) return xt(t);
}
function xt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function pn(t, e, n, o, s, r) {
  return u(), f("svg", _({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), sn(e[0] || (e[0] = [i("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xt.render = pn;
var gn = at.extend({
  name: "focustrap-directive"
}), fn = ke.extend({
  style: gn
});
function ot(t) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ot(t);
}
function Bt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Dt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Bt(Object(n), !0).forEach(function(o) {
      hn(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Bt(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function hn(t, e, n) {
  return (e = mn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function mn(t) {
  var e = vn(t, "string");
  return ot(e) == "symbol" ? e : e + "";
}
function vn(t, e) {
  if (ot(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ot(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var yn = fn.extend("focustrap", {
  mounted: function(e, n) {
    var o = n.value || {}, s = o.disabled;
    s || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var o = n.value || {}, s = o.disabled;
    s && this.unbind(e);
  },
  unmounted: function(e) {
    this.unbind(e);
  },
  methods: {
    getComputedSelector: function(e) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(e ?? "");
    },
    bind: function(e, n) {
      var o = this, s = n.value || {}, r = s.onFocusIn, y = s.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(x) {
        x.forEach(function(g) {
          if (g.type === "childList" && !e.contains(document.activeElement)) {
            var k = function(p) {
              var m = It(p) ? It(p, o.getComputedSelector(e.$_pfocustrap_focusableselector)) ? p : J(e, o.getComputedSelector(e.$_pfocustrap_focusableselector)) : J(p);
              return Nt(m) ? m : p.nextSibling && k(p.nextSibling);
            };
            Y(k(g.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(x) {
        return r && r(x);
      }, e.$_pfocustrap_focusoutlistener = function(x) {
        return y && y(x);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: Dt(Dt({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var o = n.value || {}, s = o.autoFocusSelector, r = s === void 0 ? "" : s, y = o.firstFocusableSelector, x = y === void 0 ? "" : y, g = o.autoFocus, k = g === void 0 ? !1 : g, C = J(e, "[autofocus]".concat(this.getComputedSelector(r)));
      k && !C && (C = J(e, this.getComputedSelector(x))), Y(C);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, s = e.relatedTarget, r = s === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? J(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      Y(r);
    },
    onLastHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, s = e.relatedTarget, r = s === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? ye(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      Y(r);
    },
    createHiddenFocusableElements: function(e, n) {
      var o = this, s = n.value || {}, r = s.tabIndex, y = r === void 0 ? 0 : r, x = s.firstFocusableSelector, g = x === void 0 ? "" : x, k = s.lastFocusableSelector, C = k === void 0 ? "" : k, p = function(S) {
        return we("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: y,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: S?.bind(o)
        });
      }, m = p(this.onFirstHiddenElementFocus), l = p(this.onLastHiddenElementFocus);
      m.$_pfocustrap_lasthiddenfocusableelement = l, m.$_pfocustrap_focusableselector = g, m.setAttribute("data-pc-section", "firstfocusableelement"), l.$_pfocustrap_firsthiddenfocusableelement = m, l.$_pfocustrap_focusableselector = C, l.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(m), e.append(l);
    }
  }
});
function At() {
  Ce({
    variableName: Kt("scrollbar.width").name
  });
}
function Ot() {
  xe({
    variableName: Kt("scrollbar.width").name
  });
}
var kn = `
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
`, wn = {
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
}, xn = {
  mask: function(e) {
    var n = e.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], s = o.find(function(r) {
      return r === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, s ? "p-dialog-".concat(s) : ""];
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
}, Cn = at.extend({
  name: "dialog",
  style: kn,
  classes: xn,
  inlineStyles: wn
}), _n = {
  name: "BaseDialog",
  extends: _t,
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
  style: Cn,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Yt = {
  name: "Dialog",
  extends: _n,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: E(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && gt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && gt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Ie(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), Y(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && gt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(e) {
      this.maskMouseDownTarget = e.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var e = function(s) {
        return s && s.querySelector("[autofocus]");
      }, n = this.$slots.footer && e(this.footerContainer);
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && Y(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? At() : Ot());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && At();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Ot();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Le(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
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
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && ze(document.body, {
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
          var o = Se(e.container), s = $e(e.container), r = n.pageX - e.lastPageX, y = n.pageY - e.lastPageY, x = e.container.getBoundingClientRect(), g = x.left + r, k = x.top + y, C = Ee(), p = getComputedStyle(e.container), m = parseFloat(p.marginLeft), l = parseFloat(p.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (g >= e.minX && g + o < C.width && (e.lastPageX = n.pageX, e.container.style.left = g - m + "px"), k >= e.minY && k + s < C.height && (e.lastPageY = n.pageY, e.container.style.top = k - l + "px")) : (e.lastPageX = n.pageX, e.container.style.left = g - m + "px", e.lastPageY = n.pageY, e.container.style.top = k - l + "px");
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
      return G({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Ht,
    focustrap: yn
  },
  components: {
    Button: ct,
    Portal: _e,
    WindowMinimizeIcon: Xt,
    WindowMaximizeIcon: Zt,
    TimesIcon: Be
  }
};
function rt(t) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, rt(t);
}
function Tt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Mt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Tt(Object(n), !0).forEach(function(o) {
      Sn(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Tt(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Sn(t, e, n) {
  return (e = $n(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function $n(t) {
  var e = En(t, "string");
  return rt(e) == "symbol" ? e : e + "";
}
function En(t, e) {
  if (rt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (rt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var zn = ["data-p"], Ln = ["aria-labelledby", "aria-modal", "data-p"], In = ["id"], Pn = ["data-p"];
function Bn(t, e, n, o, s, r) {
  var y = ut("Button"), x = ut("Portal"), g = Ft("focustrap");
  return u(), H(x, {
    appendTo: t.appendTo
  }, {
    default: j(function() {
      return [s.containerVisible ? (u(), f("div", _({
        key: 0,
        ref: r.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return r.onMaskMouseDown && r.onMaskMouseDown.apply(r, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return r.onMaskMouseUp && r.onMaskMouseUp.apply(r, arguments);
        }),
        "data-p": r.dataP
      }, t.ptm("mask")), [$(fe, _({
        name: "p-dialog",
        onEnter: r.onEnter,
        onAfterEnter: r.onAfterEnter,
        onBeforeLeave: r.onBeforeLeave,
        onLeave: r.onLeave,
        onAfterLeave: r.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: j(function() {
          return [t.visible ? R((u(), f("div", _({
            key: 0,
            ref: r.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": r.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": r.dataP
          }, t.ptmi("root")), [t.$slots.container ? D(t.$slots, "container", {
            key: 0,
            closeCallback: r.close,
            maximizeCallback: function(C) {
              return r.maximize(C);
            },
            initDragCallback: r.initDrag
          }) : (u(), f(W, {
            key: 1
          }, [t.showHeader ? (u(), f("div", _({
            key: 0,
            ref: r.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return r.initDrag && r.initDrag.apply(r, arguments);
            })
          }, t.ptm("header")), [D(t.$slots, "header", {
            class: N(t.cx("title"))
          }, function() {
            return [t.header ? (u(), f("span", _({
              key: 0,
              id: r.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), I(t.header), 17, In)) : z("", !0)];
          }), i("div", _({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? D(t.$slots, "maximizebutton", {
            key: 0,
            maximized: s.maximized,
            maximizeCallback: function(C) {
              return r.maximize(C);
            }
          }, function() {
            return [$(y, _({
              ref: r.maximizableRef,
              autofocus: s.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: r.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: j(function(k) {
                return [D(t.$slots, "maximizeicon", {
                  maximized: s.maximized
                }, function() {
                  return [(u(), H(mt(r.maximizeIconComponent), _({
                    class: [k.class, s.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : z("", !0), t.closable ? D(t.$slots, "closebutton", {
            key: 1,
            closeCallback: r.close
          }, function() {
            return [$(y, _({
              ref: r.closeButtonRef,
              autofocus: s.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: r.close,
              "aria-label": r.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: j(function(k) {
                return [D(t.$slots, "closeicon", {}, function() {
                  return [(u(), H(mt(t.closeIcon ? "span" : "TimesIcon"), _({
                    class: [t.closeIcon, k.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : z("", !0)], 16)], 16)) : z("", !0), i("div", _({
            ref: r.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": r.dataP
          }, Mt(Mt({}, t.contentProps), t.ptm("content"))), [D(t.$slots, "default")], 16, Pn), t.footer || t.$slots.footer ? (u(), f("div", _({
            key: 1,
            ref: r.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [D(t.$slots, "footer", {}, function() {
            return [A(I(t.footer), 1)];
          })], 16)) : z("", !0)], 64))], 16, Ln)), [[g, {
            disabled: !t.modal
          }]]) : z("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, zn)) : z("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Yt.render = Bn;
var Dn = `
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
`, An = {
  root: {
    position: "relative"
  }
}, On = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": n.checked,
      "p-disabled": o.disabled,
      "p-invalid": n.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, Tn = at.extend({
  name: "toggleswitch",
  style: Dn,
  classes: On,
  inlineStyles: An
}), Mn = {
  name: "BaseToggleSwitch",
  extends: De,
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
  style: Tn,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, Ct = {
  name: "ToggleSwitch",
  extends: Mn,
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
      var n, o;
      this.$emit("blur", e), (n = (o = this.formField).onBlur) === null || n === void 0 || n.call(o, e);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return G({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, jn = ["data-p-checked", "data-p-disabled", "data-p"], Fn = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], Vn = ["data-p"], Rn = ["data-p"];
function Nn(t, e, n, o, s, r) {
  return u(), f("div", _({
    class: t.cx("root"),
    style: t.sx("root")
  }, r.getPTOptions("root"), {
    "data-p-checked": r.checked,
    "data-p-disabled": t.disabled,
    "data-p": r.dataP
  }), [i("input", _({
    id: t.inputId,
    type: "checkbox",
    role: "switch",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    checked: r.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-checked": r.checked,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return r.onFocus && r.onFocus.apply(r, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return r.onBlur && r.onBlur.apply(r, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return r.onChange && r.onChange.apply(r, arguments);
    })
  }, r.getPTOptions("input")), null, 16, Fn), i("div", _({
    class: t.cx("slider")
  }, r.getPTOptions("slider"), {
    "data-p": r.dataP
  }), [i("div", _({
    class: t.cx("handle")
  }, r.getPTOptions("handle"), {
    "data-p": r.dataP
  }), [D(t.$slots, "handle", {
    checked: r.checked
  })], 16, Rn)], 16, Vn)], 16, jn);
}
Ct.render = Nn;
const Hn = {
  class: "kx-nav",
  role: "tablist",
  "aria-label": "Agent sections"
}, Un = ["aria-selected", "onClick"], Kn = { class: "kx-nav-ico" }, Wn = { class: "kx-nav-lbl" }, Zn = {
  key: 0,
  class: "kx-nav-meta"
}, Xn = /* @__PURE__ */ Q({
  __name: "AgentNav",
  props: {
    items: {},
    active: {}
  },
  emits: ["select"],
  setup(t, { emit: e }) {
    const n = e;
    return (o, s) => (u(), f("nav", Hn, [
      (u(!0), f(W, null, vt(t.items, (r) => (u(), f("button", {
        key: r.key,
        type: "button",
        role: "tab",
        class: N(["kx-nav-item", t.active === r.key && "kx-nav-item-on"]),
        "aria-selected": t.active === r.key,
        onClick: (y) => n("select", r.key)
      }, [
        i("span", Kn, [
          $(b(M), {
            icon: r.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        i("span", Wn, I(r.label), 1),
        r.meta ? (u(), f("span", Zn, I(r.meta), 1)) : z("", !0)
      ], 10, Un))), 128))
    ]));
  }
}), Yn = /* @__PURE__ */ Q({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const n = t, o = e, s = U(null);
    let r = null;
    function y(g) {
      o("update:modelValue", g.detail || "");
    }
    async function x() {
      if (s.value) {
        r && r.removeEventListener("select", y), s.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await kt("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        s.value && (r = document.createElement("wc-icon-picker"), r.setAttribute("value", n.modelValue || ""), n.fallback && r.setAttribute("fallback", n.fallback), r.addEventListener("select", y), s.value.appendChild(r));
      }
    }
    return Vt(x), yt(() => n.modelValue, (g) => {
      r && r.getAttribute("value") !== g && r.setAttribute("value", g || "");
    }), he(() => {
      r && r.removeEventListener("select", y);
    }), (g, k) => (u(), f("div", {
      ref_key: "host",
      ref: s,
      class: "wc-iconfield"
    }, null, 512));
  }
});
function Gn({ form: t, traits: e, redirectTrait: n }) {
  const o = E(() => e().filter((p) => p.id !== n)), s = (p) => t.value.traits.includes(p.id), r = E(() => o.value.filter(s));
  function y(p) {
    return !!p && typeof p == "object" && !Array.isArray(p);
  }
  function x(p) {
    const m = y(t.value.trait_contexts[p]) ? t.value.trait_contexts[p] : {}, l = y(t.value.trait_agent_options[p]) ? t.value.trait_agent_options[p] : null;
    return l ? { ...m, agent_options: l } : m;
  }
  function g(p, m) {
    if (y(m) && (Object.prototype.hasOwnProperty.call(m, "context") || Object.prototype.hasOwnProperty.call(m, "agent_options"))) {
      t.value.trait_contexts = { ...t.value.trait_contexts, [p]: y(m.context) ? m.context : {} };
      const v = { ...t.value.trait_agent_options };
      y(m.agent_options) && Object.keys(m.agent_options).length ? v[p] = m.agent_options : delete v[p], t.value.trait_agent_options = v;
      return;
    }
    t.value.trait_contexts = { ...t.value.trait_contexts, [p]: m };
    const l = { ...t.value.trait_agent_options };
    delete l[p], t.value.trait_agent_options = l;
  }
  const k = E(() => t.value.traits.filter((p) => p !== n));
  function C(p) {
    t.value.traits = [...t.value.traits.filter((m) => m === n), ...p];
  }
  return {
    selectableTraits: o,
    selectedCapabilities: k,
    activeTraits: r,
    traitMountConfig: x,
    onTraitConfig: g,
    onCapabilitiesChange: C
  };
}
const ht = "kickside.agents.traits:redirect", qn = "kickside.agents.traits:artifacts", Jn = "kickside.uploads.traits:file_manager", dt = "user_agent:";
function Qn({ form: t, agentId: e, agents: n, redirectTrait: o }) {
  const s = U("delegates");
  function r(v) {
    const S = v.detail;
    return S && Array.isArray(S.selected) ? S.selected.map(String) : [];
  }
  function y(v) {
    const S = new Set([e(), `${dt}${e()}`].filter(Boolean));
    t.value.delegates = v.filter((w) => !S.has(w));
  }
  const x = (v) => v.startsWith(dt) ? v.slice(dt.length) : v, g = E(() => {
    const v = t.value.trait_contexts[o];
    return v && Array.isArray(v.targets) ? v.targets : [];
  }), k = E(() => g.value.map((v) => v.agent_id));
  function C(v) {
    t.value.trait_contexts = { ...t.value.trait_contexts, [o]: { targets: v } };
    const S = t.value.traits.indexOf(o);
    v.length && S < 0 ? t.value.traits.push(o) : !v.length && S >= 0 && t.value.traits.splice(S, 1);
  }
  function p(v) {
    const S = new Set([e(), `${dt}${e()}`].filter(Boolean)), w = v.filter((c) => !S.has(c)), L = new Map(g.value.map((c) => [c.agent_id, c.comment]));
    C(w.map((c) => ({ agent_id: c, comment: L.get(c) || "" })));
  }
  function m(v) {
    const S = x(v);
    return n().find((w) => w.id === S)?.title || S;
  }
  function l(v, S) {
    C(g.value.map((w) => w.agent_id === v ? { ...w, comment: S } : w));
  }
  return { routeView: s, pickIds: r, onDelegatesChange: y, redirectTargets: g, redirectSelectedIds: k, setRedirects: C, onRedirectsChange: p, redirectLabel: m, setRedirectCommentById: l };
}
function jt(t, e) {
  if (t && typeof t == "object") {
    const n = t, o = n.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return e;
}
function to({ form: t, maxTokens: e, valid: n, tab: o, blank: s, agentId: r, parentId: y, models: x, redirectTrait: g, emitSaved: k }) {
  const C = U(!1), p = U(!1), m = U("");
  async function l(w) {
    C.value = !0, t.value = s(!1);
    try {
      const { data: L } = await ft.get(`/api/v1/user-agents/${w}`);
      if (L?.success && L.agent) {
        const c = L.agent;
        t.value = {
          title: c.title || "",
          description: c.description || "",
          icon: c.icon || "tabler:robot",
          public: c.public === !0,
          prompt: c.prompt || "",
          model: c.model || x()[0]?.name || "",
          temperature: typeof c.temperature == "number" ? c.temperature : null,
          max_tokens: typeof c.max_tokens == "number" ? c.max_tokens : null,
          thinking_effort: typeof c.thinking_effort == "number" ? c.thinking_effort : null,
          traits: Array.isArray(c.traits) ? [...c.traits] : [],
          trait_contexts: c.trait_contexts && typeof c.trait_contexts == "object" ? { ...c.trait_contexts } : {},
          trait_agent_options: c.trait_agent_options && typeof c.trait_agent_options == "object" ? { ...c.trait_agent_options } : {},
          tools: Array.isArray(c.tools) ? [...c.tools] : [],
          delegates: Array.isArray(c.delegates) ? [...c.delegates] : [],
          memory_target_id: c.memory_target_id || "",
          memory_provider_id: c.memory_provider_id || ""
        };
      }
    } catch (L) {
      m.value = jt(L, "could not load agent");
    } finally {
      C.value = !1;
    }
  }
  function v(w) {
    const L = {};
    for (const c of t.value.traits)
      Object.prototype.hasOwnProperty.call(w, c) && (L[c] = w[c]);
    return L;
  }
  async function S() {
    if (!n.value) {
      m.value = t.value.title.trim() ? "Check the model and token limits." : "Name is required.", t.value.title.trim() && (o.value = "model");
      return;
    }
    p.value = !0, m.value = "";
    const w = {
      title: t.value.title.trim(),
      description: t.value.description,
      icon: t.value.icon,
      public: t.value.public,
      prompt: t.value.prompt,
      model: t.value.model,
      temperature: t.value.temperature ?? !1,
      thinking_effort: t.value.thinking_effort ?? !1,
      traits: t.value.traits,
      trait_contexts: v(t.value.trait_contexts),
      trait_agent_options: v(t.value.trait_agent_options),
      tools: t.value.tools,
      delegates: t.value.delegates,
      memory_target_id: t.value.memory_target_id,
      memory_provider_id: t.value.memory_provider_id
    };
    typeof e.value == "number" && (w.max_tokens = e.value);
    const L = r();
    if (L) {
      const c = /* @__PURE__ */ new Set([L, `user_agent:${L}`]);
      w.delegates = w.delegates.filter((F) => !c.has(F));
      const P = w.trait_contexts?.[g];
      if (P && Array.isArray(P.targets)) {
        const F = P.targets.filter((K) => !c.has(K.agent_id));
        w.trait_contexts = { ...w.trait_contexts, [g]: { ...P, targets: F } }, F.length || (w.traits = w.traits.filter((K) => K !== g));
      }
    }
    try {
      let c = L || "";
      if (L) {
        const { data: P } = await ft.put(`/api/v1/user-agents/${L}`, w);
        if (!P?.success) throw new Error(P?.error || "save failed");
      } else {
        const { data: P } = await ft.post("/api/v1/user-agents", { ...w, parent_id: y() || void 0 });
        if (!P?.success) throw new Error(P?.error || "create failed");
        c = P.component_id || "";
      }
      k(c);
    } catch (c) {
      m.value = jt(c, "save failed");
    } finally {
      p.value = !1;
    }
  }
  return { loading: C, saving: p, error: m, loadAgent: l, save: S };
}
const eo = { class: "kx-modal-head" }, no = { class: "kx-modal-head-icon" }, oo = { class: "kx-modal-head-text" }, ro = { class: "kx-modal-head-title" }, ao = { class: "kx-modal-head-sub" }, io = {
  key: 0,
  class: "kx-2p"
}, lo = { class: "kx-loading" }, so = {
  key: 1,
  class: "kx-2p"
}, uo = { class: "kx-2p-l" }, co = { class: "kx-form" }, bo = { class: "kx-field" }, po = { class: "kx-name-row" }, go = { class: "kx-field" }, fo = { class: "kx-2p-r" }, ho = { class: "kx-2p-r-head" }, mo = { class: "kx-2p-r-body" }, vo = {
  key: 0,
  class: "kx-form kx-form-grow"
}, yo = { class: "kx-field kx-field-grow" }, ko = {
  key: 1,
  class: "kx-form"
}, wo = { class: "kx-field" }, xo = ["value"], Co = { class: "kx-field" }, _o = ["placeholder", "aria-invalid"], So = {
  key: 0,
  class: "kx-field-err"
}, $o = { class: "kx-field" }, Eo = { class: "kx-toggle" }, zo = {
  key: 0,
  class: "kx-think"
}, Lo = { class: "kx-field-hint-inline" }, Io = { class: "kx-field" }, Po = {
  key: 0,
  class: "kx-toggle"
}, Bo = {
  key: 1,
  class: "kx-sec-foot"
}, Do = {
  key: 2,
  class: "kx-think"
}, Ao = { class: "kx-field-hint-inline" }, Oo = {
  key: 2,
  class: "kx-form"
}, To = {
  key: 0,
  class: "kx-group",
  "aria-label": "Existing direct tools"
}, Mo = { class: "kx-group-head" }, jo = { class: "kx-group-meta" }, Fo = { class: "kx-direct-tools" }, Vo = ["data-tool-id"], Ro = ["aria-label", "onClick"], No = {
  key: 3,
  class: "kx-form"
}, Ho = {
  class: "kx-seg",
  role: "tablist"
}, Uo = ["aria-selected"], Ko = {
  key: 0,
  class: "kx-seg-count"
}, Wo = ["aria-selected"], Zo = {
  key: 0,
  class: "kx-seg-count"
}, Xo = ["selected"], Yo = ["selected"], Go = {
  key: 0,
  class: "kx-redirect-comments"
}, qo = { class: "kx-redirect-comment-name" }, Jo = ["value", "onInput"], Qo = { class: "kx-modal-foot" }, tr = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, er = {
  key: 1,
  class: "kx-embed"
}, nr = {
  class: "kx-modal kx-modal-agent kx-modal-embed",
  role: "dialog",
  "aria-modal": "true"
}, or = 8e3, cr = /* @__PURE__ */ Q({
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
    const n = me(), o = Q({
      setup(h, { slots: a }) {
        return n.value = a.default, () => {
        };
      }
    }), s = Q({
      render() {
        return n.value ? n.value() : null;
      }
    }), r = t, y = e, x = E(() => {
      switch (g.value) {
        case "model":
          return "Model";
        case "caps":
          return "Capabilities";
        case "routing":
          return "Routing";
        default:
          return "Prompt";
      }
    }), g = U("prompt"), k = ["fast", "nano", "balanced", "premium"], C = E(() => {
      const h = /* @__PURE__ */ new Set();
      for (const a of r.models) for (const d of a.class || []) h.add(d);
      return [...h].sort((a, d) => {
        const T = k.indexOf(a), pt = k.indexOf(d);
        return (T < 0 ? 99 : T) - (pt < 0 ? 99 : pt) || a.localeCompare(d);
      });
    });
    function p() {
      return C.value.includes("fast") ? "class:fast" : C.value.length ? "class:" + C.value[0] : r.models[0]?.name || "";
    }
    function m(h = !0) {
      return {
        title: "",
        description: "",
        icon: "tabler:robot",
        prompt: "",
        public: !1,
        model: p(),
        temperature: null,
        max_tokens: null,
        thinking_effort: null,
        traits: h ? [qn, Jn] : [],
        trait_contexts: {},
        trait_agent_options: {},
        tools: [],
        delegates: [],
        memory_target_id: "",
        memory_provider_id: ""
      };
    }
    const l = U(m()), v = E(() => !!r.agentId), S = E(() => l.value.tools.map((h) => ({
      id: h,
      title: r.tools.find((a) => a.id === h)?.title || h
    }))), w = E({
      get: () => r.open,
      set: (h) => {
        h || y("close");
      }
    }), L = U(null);
    function c() {
      ve(() => L.value?.focus({ preventScroll: !0 }));
    }
    const P = E({
      get: () => Math.round((l.value.temperature ?? 0.5) * 50),
      set: (h) => {
        l.value.temperature = Math.max(0, Math.min(2, (Number(h) || 0) / 50));
      }
    }), F = E({
      get: () => l.value.temperature !== null,
      set: (h) => {
        l.value.temperature = h ? l.value.temperature ?? 0.5 : null;
      }
    }), K = E(() => l.value.model.startsWith("class:") ? r.models.filter((h) => h.class?.includes(l.value.model.slice(6))) : r.models.filter((h) => h.name === l.value.model)), St = E(() => {
      const h = K.value.map((a) => a.output_tokens).filter((a) => typeof a == "number" && Number.isFinite(a) && a > 0);
      return h.length ? Math.max(1, Math.floor(Math.min(or, ...h))) : void 0;
    }), it = E({
      get: () => l.value.max_tokens ?? St.value,
      set: (h) => {
        l.value.max_tokens = h;
      }
    }), $t = E(() => !q.value && (K.value.length === 0 || K.value.some((h) => !h.capabilities?.includes("reasoning")))), Gt = E(() => q.value ? "Extended thinking sets its own temperature." : "The selected models reason instead of sampling, so temperature is not applied."), lt = E(() => {
      const h = it.value;
      return h !== void 0 && (typeof h != "number" || !Number.isSafeInteger(h) || h < 1);
    }), Et = E(() => l.value.title.trim().length > 0 && !!l.value.model && !lt.value), qt = to({
      form: l,
      maxTokens: it,
      valid: Et,
      tab: g,
      blank: m,
      agentId: () => r.agentId,
      parentId: () => r.parentId,
      models: () => r.models,
      redirectTrait: ht,
      emitSaved: (h) => y("saved", h)
    }), { loading: Jt, saving: st, error: bt, loadAgent: Qt, save: te } = qt;
    yt(() => r.models, () => {
      !v.value && !l.value.model && (l.value.model = p());
    }, { immediate: !0 }), Vt(() => {
      kt("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), kt("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    function ee(h) {
      l.value.model = h.detail;
    }
    const q = E({
      get: () => l.value.thinking_effort !== null,
      set: (h) => {
        l.value.thinking_effort = h ? l.value.thinking_effort ?? 50 : null;
      }
    }), { selectableTraits: ne, selectedCapabilities: oe, activeTraits: zt, traitMountConfig: re, onTraitConfig: ae, onCapabilitiesChange: ie } = Gn({ form: l, traits: () => r.traits, redirectTrait: ht }), le = Qn({
      form: l,
      agentId: () => r.agentId,
      agents: () => r.agents,
      redirectTrait: ht
    }), {
      routeView: V,
      pickIds: Lt,
      onDelegatesChange: se,
      redirectTargets: Z,
      redirectSelectedIds: de,
      onRedirectsChange: ue,
      redirectLabel: ce,
      setRedirectCommentById: be
    } = le;
    yt(() => [r.open, r.agentId], ([h]) => {
      h && (g.value = "prompt", V.value = "delegates", bt.value = "", r.agentId ? Qt(r.agentId) : l.value = m());
    }, { immediate: !0 });
    const pe = E(() => [
      { key: "prompt", label: "Prompt", icon: "tabler:keyboard", meta: l.value.prompt.trim() ? "•" : "" },
      { key: "model", label: "Model", icon: "tabler:cpu", meta: "" },
      { key: "caps", label: "Capabilities", icon: "tabler:puzzle", meta: zt.value.length ? String(zt.value.length) : "" },
      { key: "routing", label: "Routing", icon: "tabler:arrows-split-2", meta: l.value.delegates.length + Z.value.length ? String(l.value.delegates.length + Z.value.length) : "" }
    ]);
    return (h, a) => (u(), f(W, null, [
      $(b(o), null, {
        default: j(() => [
          i("div", eo, [
            i("span", no, [
              $(b(M), {
                icon: l.value.icon || "tabler:robot",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            i("span", oo, [
              i("span", ro, I(v.value ? "Edit agent" : "New agent"), 1),
              i("span", ao, I(l.value.title.trim() || "Configure persona, model and capabilities."), 1)
            ]),
            i("button", {
              class: "kx-modal-x",
              "aria-label": "Close",
              onClick: a[0] || (a[0] = (d) => y("close"))
            }, [
              $(b(M), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])
          ]),
          b(Jt) ? (u(), f("div", io, [
            i("div", lo, [
              $(b(M), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              a[17] || (a[17] = A(" Loading…", -1))
            ])
          ])) : (u(), f("div", so, [
            i("div", uo, [
              i("div", co, [
                i("div", bo, [
                  a[18] || (a[18] = i("span", { class: "kx-field-lbl" }, "Name", -1)),
                  i("div", po, [
                    $(Yn, {
                      class: "kx-name-icon",
                      modelValue: l.value.icon,
                      "onUpdate:modelValue": a[1] || (a[1] = (d) => l.value.icon = d),
                      fallback: "tabler:robot"
                    }, null, 8, ["modelValue"]),
                    R(i("input", {
                      ref_key: "agentNameInput",
                      ref: L,
                      "onUpdate:modelValue": a[2] || (a[2] = (d) => l.value.title = d),
                      class: "kx-input",
                      "data-agent-name": "",
                      "aria-label": "Agent name",
                      placeholder: "e.g. Research assistant"
                    }, null, 512), [
                      [X, l.value.title]
                    ])
                  ])
                ]),
                i("label", go, [
                  a[19] || (a[19] = i("span", { class: "kx-field-lbl" }, [
                    A("Description "),
                    i("span", { class: "kx-field-hint-inline" }, "— shown in pickers")
                  ], -1)),
                  R(i("textarea", {
                    "onUpdate:modelValue": a[3] || (a[3] = (d) => l.value.description = d),
                    class: "kx-input kx-textarea kx-textarea-sm",
                    rows: "2",
                    placeholder: "What this agent is for."
                  }, null, 512), [
                    [X, l.value.description]
                  ])
                ])
              ]),
              $(Xn, {
                items: pe.value,
                active: g.value,
                onSelect: a[4] || (a[4] = (d) => g.value = d)
              }, null, 8, ["items", "active"])
            ]),
            i("div", fo, [
              i("div", ho, I(x.value), 1),
              i("div", mo, [
                g.value === "prompt" ? (u(), f("div", vo, [
                  i("label", yo, [
                    a[20] || (a[20] = i("span", { class: "kx-field-lbl" }, [
                      A("System prompt "),
                      i("span", { class: "kx-field-hint-inline" }, "— the agent's persona and instructions")
                    ], -1)),
                    R(i("textarea", {
                      "onUpdate:modelValue": a[5] || (a[5] = (d) => l.value.prompt = d),
                      class: "kx-input kx-textarea kx-textarea-lg",
                      placeholder: "You are a helpful assistant that…"
                    }, null, 512), [
                      [X, l.value.prompt]
                    ])
                  ]),
                  a[21] || (a[21] = i("p", { class: "kx-sec-foot" }, "Keep the prompt clear and operational. Capabilities and routing are configured in their own sections.", -1))
                ])) : g.value === "model" ? (u(), f("div", ko, [
                  i("div", wo, [
                    a[22] || (a[22] = i("span", { class: "kx-field-lbl" }, "Model", -1)),
                    i("wc-model-picker", {
                      value: l.value.model || "",
                      onSelect: ee
                    }, null, 40, xo)
                  ]),
                  i("label", Co, [
                    a[23] || (a[23] = i("span", { class: "kx-field-lbl" }, [
                      A("Max tokens "),
                      i("span", { class: "kx-field-hint-inline" }, "— requested response cap")
                    ], -1)),
                    R(i("input", {
                      "onUpdate:modelValue": a[6] || (a[6] = (d) => it.value = d),
                      type: "number",
                      min: "1",
                      step: "1",
                      placeholder: St.value === void 0 ? "Model default" : void 0,
                      class: N(["kx-input", lt.value && "kx-input-err"]),
                      "aria-invalid": lt.value || void 0
                    }, null, 10, _o), [
                      [
                        X,
                        it.value,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    lt.value ? (u(), f("span", So, "Enter a positive whole number that can be saved accurately.")) : z("", !0)
                  ]),
                  i("div", $o, [
                    i("div", Eo, [
                      $(b(Ct), {
                        modelValue: q.value,
                        "onUpdate:modelValue": a[7] || (a[7] = (d) => q.value = d),
                        "input-id": "agent-thinking"
                      }, null, 8, ["modelValue"]),
                      a[24] || (a[24] = i("label", {
                        for: "agent-thinking",
                        class: "kx-toggle-copy"
                      }, [
                        i("span", { class: "kx-field-lbl" }, "Extended thinking")
                      ], -1))
                    ]),
                    q.value ? (u(), f("div", zo, [
                      i("span", Lo, "Effort: " + I(l.value.thinking_effort) + "%", 1),
                      R(i("input", {
                        "onUpdate:modelValue": a[8] || (a[8] = (d) => l.value.thinking_effort = d),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "5",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          X,
                          l.value.thinking_effort,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : z("", !0)
                  ]),
                  i("div", Io, [
                    $t.value ? (u(), f("div", Po, [
                      $(b(Ct), {
                        modelValue: F.value,
                        "onUpdate:modelValue": a[9] || (a[9] = (d) => F.value = d),
                        "input-id": "agent-temperature"
                      }, null, 8, ["modelValue"]),
                      a[25] || (a[25] = i("label", {
                        for: "agent-temperature",
                        class: "kx-toggle-copy"
                      }, [
                        i("span", { class: "kx-field-lbl" }, "Custom temperature")
                      ], -1))
                    ])) : (u(), f("p", Bo, I(Gt.value), 1)),
                    $t.value && F.value ? (u(), f("div", Do, [
                      i("span", Ao, I(P.value) + "% · higher is more creative · unsupported on most current models", 1),
                      R(i("input", {
                        "onUpdate:modelValue": a[10] || (a[10] = (d) => P.value = d),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "1",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          X,
                          P.value,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : z("", !0)
                  ])
                ])) : g.value === "caps" ? (u(), f("div", Oo, [
                  $(Oe, {
                    traits: b(ne),
                    tools: t.tools,
                    selected: b(oe),
                    onChange: b(ie)
                  }, {
                    config: j(({ trait: d }) => [
                      d.web_component ? (u(), H(Ae, {
                        key: 0,
                        tag: d.web_component,
                        config: b(re)(d.id),
                        schema: d.context_schema,
                        provider: d.provider,
                        onChange: (T) => b(ae)(d.id, T)
                      }, null, 8, ["tag", "config", "schema", "provider", "onChange"])) : z("", !0)
                    ]),
                    _: 1
                  }, 8, ["traits", "tools", "selected", "onChange"]),
                  l.value.tools.length ? (u(), f("section", To, [
                    i("div", Mo, [
                      a[26] || (a[26] = i("span", { class: "kx-group-title" }, "Existing direct tools", -1)),
                      i("span", jo, I(l.value.tools.length), 1)
                    ]),
                    i("ul", Fo, [
                      (u(!0), f(W, null, vt(S.value, ({ id: d, title: T }) => (u(), f("li", {
                        key: d,
                        "data-tool-id": d
                      }, [
                        i("span", null, I(T), 1),
                        i("button", {
                          type: "button",
                          class: "kx-trait-x",
                          "aria-label": `Remove ${T} tool`,
                          onClick: (pt) => l.value.tools = l.value.tools.filter((ge) => ge !== d)
                        }, [
                          $(b(M), {
                            icon: "tabler:x",
                            "aria-hidden": "true"
                          })
                        ], 8, Ro)
                      ], 8, Vo))), 128))
                    ])
                  ])) : z("", !0)
                ])) : g.value === "routing" ? (u(), f("div", No, [
                  i("div", Ho, [
                    i("button", {
                      type: "button",
                      role: "tab",
                      class: N(["kx-seg-btn", b(V) === "delegates" && "kx-seg-btn-on"]),
                      "aria-selected": b(V) === "delegates",
                      onClick: a[11] || (a[11] = (d) => V.value = "delegates")
                    }, [
                      $(b(M), {
                        icon: "tabler:arrow-ramp-right-3",
                        "aria-hidden": "true"
                      }),
                      a[27] || (a[27] = A(" Delegates ", -1)),
                      l.value.delegates.length ? (u(), f("span", Ko, I(l.value.delegates.length), 1)) : z("", !0)
                    ], 10, Uo),
                    i("button", {
                      type: "button",
                      role: "tab",
                      class: N(["kx-seg-btn", b(V) === "redirects" && "kx-seg-btn-on"]),
                      "aria-selected": b(V) === "redirects",
                      onClick: a[12] || (a[12] = (d) => V.value = "redirects")
                    }, [
                      $(b(M), {
                        icon: "tabler:arrows-split-2",
                        "aria-hidden": "true"
                      }),
                      a[28] || (a[28] = A(" Redirects ", -1)),
                      b(Z).length ? (u(), f("span", Zo, I(b(Z).length), 1)) : z("", !0)
                    ], 10, Wo)
                  ]),
                  b(V) === "delegates" ? (u(), f(W, { key: 0 }, [
                    a[29] || (a[29] = i("p", { class: "kx-sec-foot" }, "When this agent decides a task belongs to another, it can hand off while keeping the chat. Pick the agents it may delegate to.", -1)),
                    i("wc-agent-picker", {
                      placeholder: "Search agents to delegate to…",
                      selected: JSON.stringify(l.value.delegates),
                      onChange: a[13] || (a[13] = (d) => b(se)(b(Lt)(d)))
                    }, null, 40, Xo)
                  ], 64)) : (u(), f(W, { key: 1 }, [
                    a[30] || (a[30] = i("p", { class: "kx-sec-foot" }, [
                      A("A redirect is not a delegate: it "),
                      i("strong", null, "transfers the whole chat"),
                      A(" — the target agent takes over and this one stops. Pick the agents it may hand off to, and note when (injected into the prompt).")
                    ], -1)),
                    i("wc-agent-picker", {
                      placeholder: "Search agents to redirect to…",
                      selected: JSON.stringify(b(de)),
                      onChange: a[14] || (a[14] = (d) => b(ue)(b(Lt)(d)))
                    }, null, 40, Yo),
                    b(Z).length ? (u(), f("div", Go, [
                      (u(!0), f(W, null, vt(b(Z), (d) => (u(), f("div", {
                        key: d.agent_id,
                        class: "kx-redirect-comment-row"
                      }, [
                        i("span", qo, [
                          $(b(M), {
                            icon: "tabler:arrows-split-2",
                            "aria-hidden": "true"
                          }),
                          A(" " + I(b(ce)(d.agent_id)), 1)
                        ]),
                        i("input", {
                          value: d.comment,
                          class: "kx-input kx-redirect-comment",
                          placeholder: "When to redirect here (injected into the prompt)…",
                          onInput: (T) => b(be)(d.agent_id, T.target.value)
                        }, null, 40, Jo)
                      ]))), 128))
                    ])) : z("", !0)
                  ], 64))
                ])) : z("", !0)
              ])
            ])
          ])),
          i("div", Qo, [
            b(bt) ? (u(), f("div", tr, I(b(bt)), 1)) : z("", !0),
            $(b(ct), {
              type: "button",
              label: "Cancel",
              severity: "secondary",
              outlined: "",
              disabled: b(st),
              onClick: a[15] || (a[15] = (d) => y("close"))
            }, null, 8, ["disabled"]),
            $(b(ct), {
              type: "button",
              "data-testid": "agent-form-save",
              label: b(st) ? v.value ? "Saving…" : "Creating…" : v.value ? "Save changes" : "Create agent",
              loading: b(st),
              disabled: b(st) || !Et.value,
              onClick: b(te)
            }, {
              icon: j(({ class: d }) => [
                $(b(M), {
                  icon: v.value ? "tabler:device-floppy" : "tabler:plus",
                  class: N(d),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["label", "loading", "disabled", "onClick"])
          ])
        ]),
        _: 1
      }),
      t.embedded ? t.open ? (u(), f("div", er, [
        i("div", nr, [
          $(b(s))
        ])
      ])) : z("", !0) : (u(), H(b(Yt), {
        key: 0,
        visible: w.value,
        "onUpdate:visible": a[16] || (a[16] = (d) => w.value = d),
        modal: "",
        "block-scroll": "",
        "show-header": !1,
        "dismissable-mask": !0,
        draggable: !1,
        pt: { root: { class: "kx-modal kx-modal-agent", role: "dialog", "aria-modal": "true", "aria-label": v.value ? "Edit agent" : "New agent" }, content: { class: "kx-modal-content" } },
        onShow: c
      }, {
        default: j(() => [
          $(b(s))
        ]),
        _: 1
      }, 8, ["visible", "pt"]))
    ], 64));
  }
});
export {
  cr as _,
  jt as e,
  ct as s
};
//# sourceMappingURL=AgentForm.vue_vue_type_script_setup_true_lang-BUpruGfm.js.map
