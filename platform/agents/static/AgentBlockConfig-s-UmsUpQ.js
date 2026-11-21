import { mergeProps as l, openBlock as d, createElementBlock as m, resolveComponent as B, resolveDirective as je, createBlock as A, Transition as Ke, withCtx as D, createElementVNode as b, renderSlot as S, normalizeClass as te, resolveDynamicComponent as Ie, createCommentVNode as P, withDirectives as De, Fragment as _, renderList as Oe, createVNode as L, createTextVNode as G, toDisplayString as E, normalizeProps as nt, createSlots as it, withModifiers as ot, defineComponent as st, ref as N, watch as rt, computed as at, onMounted as lt, unref as V } from "vue";
import { loadByTagName as dt } from "@wippy-fe/proxy";
import { B as W, f as U, R as Re, s as ge, k as He, a as be, z as Ne, e as he, b as Q, T as X, c as ut, d as ce, F as ct, M as Pe, g as pt, h as H, Y as ft, C as ht, I as mt, v as gt, D as bt, x as we, S as vt, O as yt, L as wt, i as It, $ as Ot, J as kt, p as Z, u as St, j as xt } from "./wc-runtime-BREvwtdZ.js";
import { s as zt, a as Ge, b as Ue } from "./index-BBQcPOpi.js";
import { s as Ct } from "./index-C6kCivCd.js";
import { _ as Lt } from "./MultiSelectField.vue_vue_type_script_setup_true_lang-NJY5V1IZ.js";
var ve = {
  name: "BaseInput",
  extends: zt,
  props: {
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcFluid: {
      default: void 0
    }
  },
  computed: {
    $variant: function() {
      var e;
      return (e = this.variant) !== null && e !== void 0 ? e : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var e;
      return (e = this.fluid) !== null && e !== void 0 ? e : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, $t = `
    .p-inputtext {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .p-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
    }

    .p-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .p-inputtext.p-variant-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .p-inputtext.p-variant-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .p-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-inputtext::placeholder {
        color: dt('inputtext.placeholder.color');
    }

    .p-inputtext.p-invalid::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }

    .p-inputtext-sm {
        font-size: dt('inputtext.sm.font.size');
        padding-block: dt('inputtext.sm.padding.y');
        padding-inline: dt('inputtext.sm.padding.x');
    }

    .p-inputtext-lg {
        font-size: dt('inputtext.lg.font.size');
        padding-block: dt('inputtext.lg.padding.y');
        padding-inline: dt('inputtext.lg.padding.x');
    }

    .p-inputtext-fluid {
        width: 100%;
    }
`, Pt = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": o.size === "small",
      "p-inputtext-lg p-inputfield-lg": o.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Tt = W.extend({
  name: "inputtext",
  style: $t,
  classes: Pt
}), Ft = {
  name: "BaseInputText",
  extends: ve,
  style: Tt,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function ne(t) {
  "@babel/helpers - typeof";
  return ne = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ne(t);
}
function Vt(t, e, n) {
  return (e = At(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function At(t) {
  var e = Mt(t, "string");
  return ne(e) == "symbol" ? e : e + "";
}
function Mt(t, e) {
  if (ne(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ne(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var me = {
  name: "InputText",
  extends: Ft,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return l(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return U(Vt({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Bt = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Et(t, e, n, o, s, i) {
  return d(), m("input", l({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": i.dataP,
    onInput: e[0] || (e[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, Bt);
}
me.render = Et;
var jt = `
    .p-message {
        display: grid;
        grid-template-rows: 1fr;
        border-radius: dt('message.border.radius');
        outline-width: dt('message.border.width');
        outline-style: solid;
    }

    .p-message-content-wrapper {
        min-height: 0;
    }

    .p-message-content {
        display: flex;
        align-items: center;
        padding: dt('message.content.padding');
        gap: dt('message.content.gap');
    }

    .p-message-icon {
        flex-shrink: 0;
    }

    .p-message-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-inline-start: auto;
        overflow: hidden;
        position: relative;
        width: dt('message.close.button.width');
        height: dt('message.close.button.height');
        border-radius: dt('message.close.button.border.radius');
        background: transparent;
        transition:
            background dt('message.transition.duration'),
            color dt('message.transition.duration'),
            outline-color dt('message.transition.duration'),
            box-shadow dt('message.transition.duration'),
            opacity 0.3s;
        outline-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        cursor: pointer;
        user-select: none;
    }

    .p-message-close-icon {
        font-size: dt('message.close.icon.size');
        width: dt('message.close.icon.size');
        height: dt('message.close.icon.size');
    }

    .p-message-close-button:focus-visible {
        outline-width: dt('message.close.button.focus.ring.width');
        outline-style: dt('message.close.button.focus.ring.style');
        outline-offset: dt('message.close.button.focus.ring.offset');
    }

    .p-message-info {
        background: dt('message.info.background');
        outline-color: dt('message.info.border.color');
        color: dt('message.info.color');
        box-shadow: dt('message.info.shadow');
    }

    .p-message-info .p-message-close-button:focus-visible {
        outline-color: dt('message.info.close.button.focus.ring.color');
        box-shadow: dt('message.info.close.button.focus.ring.shadow');
    }

    .p-message-info .p-message-close-button:hover {
        background: dt('message.info.close.button.hover.background');
    }

    .p-message-info.p-message-outlined {
        color: dt('message.info.outlined.color');
        outline-color: dt('message.info.outlined.border.color');
    }

    .p-message-info.p-message-simple {
        color: dt('message.info.simple.color');
    }

    .p-message-success {
        background: dt('message.success.background');
        outline-color: dt('message.success.border.color');
        color: dt('message.success.color');
        box-shadow: dt('message.success.shadow');
    }

    .p-message-success .p-message-close-button:focus-visible {
        outline-color: dt('message.success.close.button.focus.ring.color');
        box-shadow: dt('message.success.close.button.focus.ring.shadow');
    }

    .p-message-success .p-message-close-button:hover {
        background: dt('message.success.close.button.hover.background');
    }

    .p-message-success.p-message-outlined {
        color: dt('message.success.outlined.color');
        outline-color: dt('message.success.outlined.border.color');
    }

    .p-message-success.p-message-simple {
        color: dt('message.success.simple.color');
    }

    .p-message-warn {
        background: dt('message.warn.background');
        outline-color: dt('message.warn.border.color');
        color: dt('message.warn.color');
        box-shadow: dt('message.warn.shadow');
    }

    .p-message-warn .p-message-close-button:focus-visible {
        outline-color: dt('message.warn.close.button.focus.ring.color');
        box-shadow: dt('message.warn.close.button.focus.ring.shadow');
    }

    .p-message-warn .p-message-close-button:hover {
        background: dt('message.warn.close.button.hover.background');
    }

    .p-message-warn.p-message-outlined {
        color: dt('message.warn.outlined.color');
        outline-color: dt('message.warn.outlined.border.color');
    }

    .p-message-warn.p-message-simple {
        color: dt('message.warn.simple.color');
    }

    .p-message-error {
        background: dt('message.error.background');
        outline-color: dt('message.error.border.color');
        color: dt('message.error.color');
        box-shadow: dt('message.error.shadow');
    }

    .p-message-error .p-message-close-button:focus-visible {
        outline-color: dt('message.error.close.button.focus.ring.color');
        box-shadow: dt('message.error.close.button.focus.ring.shadow');
    }

    .p-message-error .p-message-close-button:hover {
        background: dt('message.error.close.button.hover.background');
    }

    .p-message-error.p-message-outlined {
        color: dt('message.error.outlined.color');
        outline-color: dt('message.error.outlined.border.color');
    }

    .p-message-error.p-message-simple {
        color: dt('message.error.simple.color');
    }

    .p-message-secondary {
        background: dt('message.secondary.background');
        outline-color: dt('message.secondary.border.color');
        color: dt('message.secondary.color');
        box-shadow: dt('message.secondary.shadow');
    }

    .p-message-secondary .p-message-close-button:focus-visible {
        outline-color: dt('message.secondary.close.button.focus.ring.color');
        box-shadow: dt('message.secondary.close.button.focus.ring.shadow');
    }

    .p-message-secondary .p-message-close-button:hover {
        background: dt('message.secondary.close.button.hover.background');
    }

    .p-message-secondary.p-message-outlined {
        color: dt('message.secondary.outlined.color');
        outline-color: dt('message.secondary.outlined.border.color');
    }

    .p-message-secondary.p-message-simple {
        color: dt('message.secondary.simple.color');
    }

    .p-message-contrast {
        background: dt('message.contrast.background');
        outline-color: dt('message.contrast.border.color');
        color: dt('message.contrast.color');
        box-shadow: dt('message.contrast.shadow');
    }

    .p-message-contrast .p-message-close-button:focus-visible {
        outline-color: dt('message.contrast.close.button.focus.ring.color');
        box-shadow: dt('message.contrast.close.button.focus.ring.shadow');
    }

    .p-message-contrast .p-message-close-button:hover {
        background: dt('message.contrast.close.button.hover.background');
    }

    .p-message-contrast.p-message-outlined {
        color: dt('message.contrast.outlined.color');
        outline-color: dt('message.contrast.outlined.border.color');
    }

    .p-message-contrast.p-message-simple {
        color: dt('message.contrast.simple.color');
    }

    .p-message-text {
        font-size: dt('message.text.font.size');
        font-weight: dt('message.text.font.weight');
    }

    .p-message-icon {
        font-size: dt('message.icon.size');
        width: dt('message.icon.size');
        height: dt('message.icon.size');
    }

    .p-message-sm .p-message-content {
        padding: dt('message.content.sm.padding');
    }

    .p-message-sm .p-message-text {
        font-size: dt('message.text.sm.font.size');
    }

    .p-message-sm .p-message-icon {
        font-size: dt('message.icon.sm.size');
        width: dt('message.icon.sm.size');
        height: dt('message.icon.sm.size');
    }

    .p-message-sm .p-message-close-icon {
        font-size: dt('message.close.icon.sm.size');
        width: dt('message.close.icon.sm.size');
        height: dt('message.close.icon.sm.size');
    }

    .p-message-lg .p-message-content {
        padding: dt('message.content.lg.padding');
    }

    .p-message-lg .p-message-text {
        font-size: dt('message.text.lg.font.size');
    }

    .p-message-lg .p-message-icon {
        font-size: dt('message.icon.lg.size');
        width: dt('message.icon.lg.size');
        height: dt('message.icon.lg.size');
    }

    .p-message-lg .p-message-close-icon {
        font-size: dt('message.close.icon.lg.size');
        width: dt('message.close.icon.lg.size');
        height: dt('message.close.icon.lg.size');
    }

    .p-message-outlined {
        background: transparent;
        outline-width: dt('message.outlined.border.width');
    }

    .p-message-simple {
        background: transparent;
        outline-color: transparent;
        box-shadow: none;
    }

    .p-message-simple .p-message-content {
        padding: dt('message.simple.content.padding');
    }

    .p-message-outlined .p-message-close-button:hover,
    .p-message-simple .p-message-close-button:hover {
        background: transparent;
    }

    .p-message-enter-active {
        animation: p-animate-message-enter 0.3s ease-out forwards;
        overflow: hidden;
    }

    .p-message-leave-active {
        animation: p-animate-message-leave 0.15s ease-in forwards;
        overflow: hidden;
    }

    @keyframes p-animate-message-enter {
        from {
            opacity: 0;
            grid-template-rows: 0fr;
        }
        to {
            opacity: 1;
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-message-leave {
        from {
            opacity: 1;
            grid-template-rows: 1fr;
        }
        to {
            opacity: 0;
            margin: 0;
            grid-template-rows: 0fr;
        }
    }
`, Kt = {
  root: function(e) {
    var n = e.props;
    return ["p-message p-component p-message-" + n.severity, {
      "p-message-outlined": n.variant === "outlined",
      "p-message-simple": n.variant === "simple",
      "p-message-sm": n.size === "small",
      "p-message-lg": n.size === "large"
    }];
  },
  contentWrapper: "p-message-content-wrapper",
  content: "p-message-content",
  icon: "p-message-icon",
  text: "p-message-text",
  closeButton: "p-message-close-button",
  closeIcon: "p-message-close-icon"
}, Dt = W.extend({
  name: "message",
  style: jt,
  classes: Kt
}), Rt = {
  name: "BaseMessage",
  extends: ge,
  props: {
    severity: {
      type: String,
      default: "info"
    },
    closable: {
      type: Boolean,
      default: !1
    },
    life: {
      type: Number,
      default: null
    },
    icon: {
      type: String,
      default: void 0
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: null,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: Dt,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function ie(t) {
  "@babel/helpers - typeof";
  return ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ie(t);
}
function Te(t, e, n) {
  return (e = Ht(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ht(t) {
  var e = Nt(t, "string");
  return ie(e) == "symbol" ? e : e + "";
}
function Nt(t, e) {
  if (ie(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ie(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var pe = {
  name: "Message",
  extends: Rt,
  inheritAttrs: !1,
  emits: ["close", "life-end"],
  timeout: null,
  data: function() {
    return {
      visible: !0
    };
  },
  mounted: function() {
    var e = this;
    this.life && setTimeout(function() {
      e.visible = !1, e.$emit("life-end");
    }, this.life);
  },
  methods: {
    close: function(e) {
      this.visible = !1, this.$emit("close", e);
    }
  },
  computed: {
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return U(Te(Te({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Re
  },
  components: {
    TimesIcon: Ge
  }
};
function oe(t) {
  "@babel/helpers - typeof";
  return oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, oe(t);
}
function Fe(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ve(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Fe(Object(n), !0).forEach(function(o) {
      Gt(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Fe(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Gt(t, e, n) {
  return (e = Ut(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ut(t) {
  var e = Wt(t, "string");
  return oe(e) == "symbol" ? e : e + "";
}
function Wt(t, e) {
  if (oe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (oe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var qt = ["data-p"], Jt = ["data-p"], Zt = ["data-p"], _t = ["aria-label", "data-p"], Yt = ["data-p"];
function Qt(t, e, n, o, s, i) {
  var a = B("TimesIcon"), u = je("ripple");
  return d(), A(Ke, l({
    name: "p-message",
    appear: ""
  }, t.ptmi("transition")), {
    default: D(function() {
      return [s.visible ? (d(), m("div", l({
        key: 0,
        class: t.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": i.dataP
      }, t.ptm("root")), [b("div", l({
        class: t.cx("contentWrapper")
      }, t.ptm("contentWrapper")), [t.$slots.container ? S(t.$slots, "container", {
        key: 0,
        closeCallback: i.close
      }) : (d(), m("div", l({
        key: 1,
        class: t.cx("content"),
        "data-p": i.dataP
      }, t.ptm("content")), [S(t.$slots, "icon", {
        class: te(t.cx("icon"))
      }, function() {
        return [(d(), A(Ie(t.icon ? "span" : null), l({
          class: [t.cx("icon"), t.icon],
          "data-p": i.dataP
        }, t.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), t.$slots.default ? (d(), m("div", l({
        key: 0,
        class: t.cx("text"),
        "data-p": i.dataP
      }, t.ptm("text")), [S(t.$slots, "default")], 16, Zt)) : P("", !0), t.closable ? De((d(), m("button", l({
        key: 1,
        class: t.cx("closeButton"),
        "aria-label": i.closeAriaLabel,
        type: "button",
        onClick: e[0] || (e[0] = function(c) {
          return i.close(c);
        }),
        "data-p": i.dataP
      }, Ve(Ve({}, t.closeButtonProps), t.ptm("closeButton"))), [S(t.$slots, "closeicon", {}, function() {
        return [t.closeIcon ? (d(), m("i", l({
          key: 0,
          class: [t.cx("closeIcon"), t.closeIcon],
          "data-p": i.dataP
        }, t.ptm("closeIcon")), null, 16, Yt)) : (d(), A(a, l({
          key: 1,
          class: [t.cx("closeIcon"), t.closeIcon],
          "data-p": i.dataP
        }, t.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, _t)), [[u]]) : P("", !0)], 16, Jt))], 16)], 16, qt)) : P("", !0)];
    }),
    _: 3
  }, 16);
}
pe.render = Qt;
var Xt = `
    .p-radiobutton {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('radiobutton.width');
        height: dt('radiobutton.height');
    }

    .p-radiobutton-input {
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
        border: 1px solid transparent;
        border-radius: 50%;
    }

    .p-radiobutton-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        border: 1px solid dt('radiobutton.border.color');
        background: dt('radiobutton.background');
        width: dt('radiobutton.width');
        height: dt('radiobutton.height');
        transition:
            background dt('radiobutton.transition.duration'),
            color dt('radiobutton.transition.duration'),
            border-color dt('radiobutton.transition.duration'),
            box-shadow dt('radiobutton.transition.duration'),
            outline-color dt('radiobutton.transition.duration');
        outline-color: transparent;
        box-shadow: dt('radiobutton.shadow');
    }

    .p-radiobutton-icon {
        transition-duration: dt('radiobutton.transition.duration');
        background: transparent;
        font-size: dt('radiobutton.icon.size');
        width: dt('radiobutton.icon.size');
        height: dt('radiobutton.icon.size');
        border-radius: 50%;
        backface-visibility: hidden;
        transform: translateZ(0) scale(0.1);
    }

    .p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:hover) .p-radiobutton-box {
        border-color: dt('radiobutton.hover.border.color');
    }

    .p-radiobutton-checked .p-radiobutton-box {
        border-color: dt('radiobutton.checked.border.color');
        background: dt('radiobutton.checked.background');
    }

    .p-radiobutton-checked .p-radiobutton-box .p-radiobutton-icon {
        background: dt('radiobutton.icon.checked.color');
        transform: translateZ(0) scale(1, 1);
        visibility: visible;
    }

    .p-radiobutton-checked:not(.p-disabled):has(.p-radiobutton-input:hover) .p-radiobutton-box {
        border-color: dt('radiobutton.checked.hover.border.color');
        background: dt('radiobutton.checked.hover.background');
    }

    .p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:hover).p-radiobutton-checked .p-radiobutton-box .p-radiobutton-icon {
        background: dt('radiobutton.icon.checked.hover.color');
    }

    .p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:focus-visible) .p-radiobutton-box {
        border-color: dt('radiobutton.focus.border.color');
        box-shadow: dt('radiobutton.focus.ring.shadow');
        outline: dt('radiobutton.focus.ring.width') dt('radiobutton.focus.ring.style') dt('radiobutton.focus.ring.color');
        outline-offset: dt('radiobutton.focus.ring.offset');
    }

    .p-radiobutton-checked:not(.p-disabled):has(.p-radiobutton-input:focus-visible) .p-radiobutton-box {
        border-color: dt('radiobutton.checked.focus.border.color');
    }

    .p-radiobutton.p-invalid > .p-radiobutton-box {
        border-color: dt('radiobutton.invalid.border.color');
    }

    .p-radiobutton.p-variant-filled .p-radiobutton-box {
        background: dt('radiobutton.filled.background');
    }

    .p-radiobutton.p-variant-filled.p-radiobutton-checked .p-radiobutton-box {
        background: dt('radiobutton.checked.background');
    }

    .p-radiobutton.p-variant-filled:not(.p-disabled):has(.p-radiobutton-input:hover).p-radiobutton-checked .p-radiobutton-box {
        background: dt('radiobutton.checked.hover.background');
    }

    .p-radiobutton.p-disabled {
        opacity: 1;
    }

    .p-radiobutton.p-disabled .p-radiobutton-box {
        background: dt('radiobutton.disabled.background');
        border-color: dt('radiobutton.checked.disabled.border.color');
    }

    .p-radiobutton-checked.p-disabled .p-radiobutton-box .p-radiobutton-icon {
        background: dt('radiobutton.icon.disabled.color');
    }

    .p-radiobutton-sm,
    .p-radiobutton-sm .p-radiobutton-box {
        width: dt('radiobutton.sm.width');
        height: dt('radiobutton.sm.height');
    }

    .p-radiobutton-sm .p-radiobutton-icon {
        font-size: dt('radiobutton.icon.sm.size');
        width: dt('radiobutton.icon.sm.size');
        height: dt('radiobutton.icon.sm.size');
    }

    .p-radiobutton-lg,
    .p-radiobutton-lg .p-radiobutton-box {
        width: dt('radiobutton.lg.width');
        height: dt('radiobutton.lg.height');
    }

    .p-radiobutton-lg .p-radiobutton-icon {
        font-size: dt('radiobutton.icon.lg.size');
        width: dt('radiobutton.icon.lg.size');
        height: dt('radiobutton.icon.lg.size');
    }
`, en = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-radiobutton p-component", {
      "p-radiobutton-checked": n.checked,
      "p-disabled": o.disabled,
      "p-invalid": n.$pcRadioButtonGroup ? n.$pcRadioButtonGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-radiobutton-sm p-inputfield-sm": o.size === "small",
      "p-radiobutton-lg p-inputfield-lg": o.size === "large"
    }];
  },
  box: "p-radiobutton-box",
  input: "p-radiobutton-input",
  icon: "p-radiobutton-icon"
}, tn = W.extend({
  name: "radiobutton",
  style: Xt,
  classes: en
}), nn = {
  name: "BaseRadioButton",
  extends: ve,
  props: {
    value: null,
    binary: Boolean,
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
  style: tn,
  provide: function() {
    return {
      $pcRadioButton: this,
      $parentInstance: this
    };
  }
};
function se(t) {
  "@babel/helpers - typeof";
  return se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, se(t);
}
function on(t, e, n) {
  return (e = sn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function sn(t) {
  var e = rn(t, "string");
  return se(e) == "symbol" ? e : e + "";
}
function rn(t, e) {
  if (se(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (se(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ke = {
  name: "RadioButton",
  extends: nn,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  inject: {
    $pcRadioButtonGroup: {
      default: void 0
    }
  },
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
        var n = this.binary ? !this.checked : this.value;
        this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.writeValue(n, e) : this.writeValue(n, e), this.$emit("change", e);
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
    groupName: function() {
      return this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.groupName : this.$formName;
    },
    checked: function() {
      var e = this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.d_value : this.d_value;
      return e != null && (this.binary ? !!e : He(e, this.value));
    },
    dataP: function() {
      return U(on({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, an = ["data-p-checked", "data-p-disabled", "data-p"], ln = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], dn = ["data-p"], un = ["data-p"];
function cn(t, e, n, o, s, i) {
  return d(), m("div", l({
    class: t.cx("root")
  }, i.getPTOptions("root"), {
    "data-p-checked": i.checked,
    "data-p-disabled": t.disabled,
    "data-p": i.dataP
  }), [b("input", l({
    id: t.inputId,
    type: "radio",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    value: t.value,
    name: i.groupName,
    checked: i.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return i.onChange && i.onChange.apply(i, arguments);
    })
  }, i.getPTOptions("input")), null, 16, ln), b("div", l({
    class: t.cx("box")
  }, i.getPTOptions("box"), {
    "data-p": i.dataP
  }), [b("div", l({
    class: t.cx("icon")
  }, i.getPTOptions("icon"), {
    "data-p": i.dataP
  }), null, 16, un)], 16, dn)], 16, an);
}
ke.render = cn;
var We = {
  name: "BlankIcon",
  extends: be
};
function pn(t) {
  return gn(t) || mn(t) || hn(t) || fn();
}
function fn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hn(t, e) {
  if (t) {
    if (typeof t == "string") return Se(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Se(t, e) : void 0;
  }
}
function mn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function gn(t) {
  if (Array.isArray(t)) return Se(t);
}
function Se(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function bn(t, e, n, o, s, i) {
  return d(), m("svg", l({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), pn(e[0] || (e[0] = [b("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
We.render = bn;
var qe = {
  name: "CheckIcon",
  extends: be
};
function vn(t) {
  return On(t) || In(t) || wn(t) || yn();
}
function yn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wn(t, e) {
  if (t) {
    if (typeof t == "string") return xe(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xe(t, e) : void 0;
  }
}
function In(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function On(t) {
  if (Array.isArray(t)) return xe(t);
}
function xe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function kn(t, e, n, o, s, i) {
  return d(), m("svg", l({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), vn(e[0] || (e[0] = [b("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
qe.render = kn;
var Je = {
  name: "ChevronDownIcon",
  extends: be
};
function Sn(t) {
  return Ln(t) || Cn(t) || zn(t) || xn();
}
function xn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zn(t, e) {
  if (t) {
    if (typeof t == "string") return ze(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ze(t, e) : void 0;
  }
}
function Cn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ln(t) {
  if (Array.isArray(t)) return ze(t);
}
function ze(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function $n(t, e, n, o, s, i) {
  return d(), m("svg", l({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Sn(e[0] || (e[0] = [b("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Je.render = $n;
var Ze = {
  name: "SearchIcon",
  extends: be
};
function Pn(t) {
  return An(t) || Vn(t) || Fn(t) || Tn();
}
function Tn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Fn(t, e) {
  if (t) {
    if (typeof t == "string") return Ce(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ce(t, e) : void 0;
  }
}
function Vn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function An(t) {
  if (Array.isArray(t)) return Ce(t);
}
function Ce(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Mn(t, e, n, o, s, i) {
  return d(), m("svg", l({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Pn(e[0] || (e[0] = [b("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ze.render = Mn;
var Bn = `
    .p-iconfield {
        position: relative;
        display: block;
    }

    .p-inputicon {
        position: absolute;
        top: 50%;
        margin-top: calc(-1 * (dt('icon.size') / 2));
        color: dt('iconfield.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .p-iconfield .p-inputicon:first-child {
        inset-inline-start: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputicon:last-child {
        inset-inline-end: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputtext:not(:first-child),
    .p-iconfield .p-inputwrapper:not(:first-child) .p-inputtext {
        padding-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield .p-inputtext:not(:last-child) {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield:has(.p-inputfield-sm) .p-inputicon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
        margin-top: calc(-1 * (dt('form.field.sm.font.size') / 2));
    }

    .p-iconfield:has(.p-inputfield-lg) .p-inputicon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
        margin-top: calc(-1 * (dt('form.field.lg.font.size') / 2));
    }
`, En = {
  root: "p-iconfield"
}, jn = W.extend({
  name: "iconfield",
  style: Bn,
  classes: En
}), Kn = {
  name: "BaseIconField",
  extends: ge,
  style: jn,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, _e = {
  name: "IconField",
  extends: Kn,
  inheritAttrs: !1
};
function Dn(t, e, n, o, s, i) {
  return d(), m("div", l({
    class: t.cx("root")
  }, t.ptmi("root")), [S(t.$slots, "default")], 16);
}
_e.render = Dn;
var Rn = {
  root: "p-inputicon"
}, Hn = W.extend({
  name: "inputicon",
  classes: Rn
}), Nn = {
  name: "BaseInputIcon",
  extends: ge,
  style: Hn,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, Ye = {
  name: "InputIcon",
  extends: Nn,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Gn(t, e, n, o, s, i) {
  return d(), m("span", l({
    class: i.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [S(t.$slots, "default")], 16);
}
Ye.render = Gn;
var Un = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Wn = `
.p-virtualscroller {
    position: relative;
    overflow: auto;
    contain: strict;
    transform: translateZ(0);
    will-change: scroll-position;
    outline: 0 none;
}

.p-virtualscroller-content {
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    min-width: 100%;
    will-change: transform;
}

.p-virtualscroller-spacer {
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 1px;
    transform-origin: 0 0;
    pointer-events: none;
}

.p-virtualscroller-loader {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-virtualscroller-loader-mask {
    display: flex;
    align-items: center;
    justify-content: center;
}

.p-virtualscroller-horizontal > .p-virtualscroller-content {
    display: flex;
}

.p-virtualscroller-inline .p-virtualscroller-content {
    position: static;
}

.p-virtualscroller .p-virtualscroller-loading {
    transform: none !important;
    min-height: 0;
    position: sticky;
    inset-block-start: 0;
    inset-inline-start: 0;
}
`, Ae = W.extend({
  name: "virtualscroller",
  css: Wn,
  style: Un
}), qn = {
  name: "BaseVirtualScroller",
  extends: ge,
  props: {
    id: {
      type: String,
      default: null
    },
    style: null,
    class: null,
    items: {
      type: Array,
      default: null
    },
    itemSize: {
      type: [Number, Array],
      default: 0
    },
    scrollHeight: null,
    scrollWidth: null,
    orientation: {
      type: String,
      default: "vertical"
    },
    numToleratedItems: {
      type: Number,
      default: null
    },
    delay: {
      type: Number,
      default: 0
    },
    resizeDelay: {
      type: Number,
      default: 10
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loaderDisabled: {
      type: Boolean,
      default: !1
    },
    columns: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    showSpacer: {
      type: Boolean,
      default: !0
    },
    showLoader: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: 0
    },
    inline: {
      type: Boolean,
      default: !1
    },
    step: {
      type: Number,
      default: 0
    },
    appendOnly: {
      type: Boolean,
      default: !1
    },
    autoSize: {
      type: Boolean,
      default: !1
    }
  },
  style: Ae,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    Ae.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function re(t) {
  "@babel/helpers - typeof";
  return re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, re(t);
}
function Me(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ee(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Me(Object(n), !0).forEach(function(o) {
      Qe(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Me(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Qe(t, e, n) {
  return (e = Jn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Jn(t) {
  var e = Zn(t, "string");
  return re(e) == "symbol" ? e : e + "";
}
function Zn(t, e) {
  if (re(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (re(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Xe = {
  name: "VirtualScroller",
  extends: qn,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
        top: 0,
        left: 0
      } : 0,
      d_numToleratedItems: this.numToleratedItems,
      d_loading: this.loading,
      loaderArr: [],
      spacerStyle: {},
      contentStyle: {}
    };
  },
  element: null,
  content: null,
  lastScrollPos: null,
  scrollTimeout: null,
  resizeTimeout: null,
  defaultWidth: 0,
  defaultHeight: 0,
  defaultContentWidth: 0,
  defaultContentHeight: 0,
  isRangeChanged: !1,
  lazyLoadState: {},
  resizeListener: null,
  resizeObserver: null,
  initialized: !1,
  watch: {
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, n) {
      this.lazy && e !== n && e !== this.d_loading && (this.d_loading = e);
    },
    items: {
      handler: function(e, n) {
        (!n || n.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
      },
      deep: !0
    },
    itemSize: function() {
      this.init(), this.calculateAutoSize();
    },
    orientation: function() {
      this.lastScrollPos = this.isBoth() ? {
        top: 0,
        left: 0
      } : 0;
    },
    scrollHeight: function() {
      this.init(), this.calculateAutoSize();
    },
    scrollWidth: function() {
      this.init(), this.calculateAutoSize();
    }
  },
  mounted: function() {
    this.viewInit(), this.lastScrollPos = this.isBoth() ? {
      top: 0,
      left: 0
    } : 0, this.lazyLoadState = this.lazyLoadState || {};
  },
  updated: function() {
    !this.initialized && this.viewInit();
  },
  unmounted: function() {
    this.unbindResizeListener(), this.initialized = !1;
  },
  methods: {
    viewInit: function() {
      he(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = Q(this.element), this.defaultHeight = X(this.element), this.defaultContentWidth = Q(this.content), this.defaultContentHeight = X(this.content), this.initialized = !0), this.element && this.bindResizeListener();
    },
    init: function() {
      this.disabled || (this.setSize(), this.calculateOptions(), this.setSpacerSize());
    },
    isVertical: function() {
      return this.orientation === "vertical";
    },
    isHorizontal: function() {
      return this.orientation === "horizontal";
    },
    isBoth: function() {
      return this.orientation === "both";
    },
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", s = this.isBoth(), i = this.isHorizontal(), a = s ? e.every(function(f) {
        return f > -1;
      }) : e > -1;
      if (a) {
        var u = this.first, c = this.element, h = c.scrollTop, p = h === void 0 ? 0 : h, v = c.scrollLeft, k = v === void 0 ? 0 : v, $ = this.calculateNumItems(), I = $.numToleratedItems, x = this.getContentPosition(), O = this.itemSize, z = function() {
          var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, R = arguments.length > 1 ? arguments[1] : void 0;
          return y <= R ? 0 : y;
        }, T = function(y, R, j) {
          return y * R + j;
        }, F = function() {
          var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, R = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: y,
            top: R,
            behavior: o
          });
        }, w = s ? {
          rows: 0,
          cols: 0
        } : 0, g = !1, r = !1;
        s ? (w = {
          rows: z(e[0], I[0]),
          cols: z(e[1], I[1])
        }, F(T(w.cols, O[1], x.left), T(w.rows, O[0], x.top)), r = this.lastScrollPos.top !== p || this.lastScrollPos.left !== k, g = w.rows !== u.rows || w.cols !== u.cols) : (w = z(e, I), i ? F(T(w, O, x.left), p) : F(k, T(w, O, x.top)), r = this.lastScrollPos !== (i ? k : p), g = w !== u), this.isRangeChanged = g, r && (this.first = w);
      }
    },
    scrollInView: function(e, n) {
      var o = this, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), a = this.isHorizontal(), u = i ? e.every(function(O) {
          return O > -1;
        }) : e > -1;
        if (u) {
          var c = this.getRenderedRange(), h = c.first, p = c.viewport, v = function() {
            var z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: z,
              top: T,
              behavior: s
            });
          }, k = n === "to-start", $ = n === "to-end";
          if (k) {
            if (i)
              p.first.rows - h.rows > e[0] ? v(p.first.cols * this.itemSize[1], (p.first.rows - 1) * this.itemSize[0]) : p.first.cols - h.cols > e[1] && v((p.first.cols - 1) * this.itemSize[1], p.first.rows * this.itemSize[0]);
            else if (p.first - h > e) {
              var I = (p.first - 1) * this.itemSize;
              a ? v(I, 0) : v(0, I);
            }
          } else if ($) {
            if (i)
              p.last.rows - h.rows <= e[0] + 1 ? v(p.first.cols * this.itemSize[1], (p.first.rows + 1) * this.itemSize[0]) : p.last.cols - h.cols <= e[1] + 1 && v((p.first.cols + 1) * this.itemSize[1], p.first.rows * this.itemSize[0]);
            else if (p.last - h <= e + 1) {
              var x = (p.first + 1) * this.itemSize;
              a ? v(x, 0) : v(0, x);
            }
          }
        }
      } else
        this.scrollToIndex(e, s);
    },
    getRenderedRange: function() {
      var e = function(v, k) {
        return Math.floor(v / (k || v));
      }, n = this.first, o = 0;
      if (this.element) {
        var s = this.isBoth(), i = this.isHorizontal(), a = this.element, u = a.scrollTop, c = a.scrollLeft;
        if (s)
          n = {
            rows: e(u, this.itemSize[0]),
            cols: e(c, this.itemSize[1])
          }, o = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var h = i ? c : u;
          n = e(h, this.itemSize), o = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: o
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), o = this.itemSize, s = this.getContentPosition(), i = this.element ? this.element.offsetWidth - s.left : 0, a = this.element ? this.element.offsetHeight - s.top : 0, u = function(k, $) {
        return Math.ceil(k / ($ || k));
      }, c = function(k) {
        return Math.ceil(k / 2);
      }, h = e ? {
        rows: u(a, o[0]),
        cols: u(i, o[1])
      } : u(n ? i : a, o), p = this.d_numToleratedItems || (e ? [c(h.rows), c(h.cols)] : c(h));
      return {
        numItemsInViewport: h,
        numToleratedItems: p
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), o = this.first, s = this.calculateNumItems(), i = s.numItemsInViewport, a = s.numToleratedItems, u = function(p, v, k) {
        var $ = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(p + v + (p < k ? 2 : 3) * k, $);
      }, c = n ? {
        rows: u(o.rows, i.rows, a[0]),
        cols: u(o.cols, i.cols, a[1], !0)
      } : u(o, i, a);
      this.last = c, this.numItemsInViewport = i, this.d_numToleratedItems = a, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var h;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: o.cols
          } : 0 : o,
          last: Math.min(e.step ? e.step : c, ((h = e.items) === null || h === void 0 ? void 0 : h.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), o = e.isHorizontal(), s = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var i = [Q(e.element), X(e.element)], a = i[0], u = i[1];
          (n || o) && (e.element.style.width = a < e.defaultWidth ? a + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || s) && (e.element.style.height = u < e.defaultHeight ? u + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, s = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(s ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, o) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), o = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), s = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), i = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: o,
          top: s,
          bottom: i,
          x: n + o,
          y: s + i
        };
      }
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      };
    },
    setSize: function() {
      var e = this;
      if (this.element) {
        var n = this.isBoth(), o = this.isHorizontal(), s = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || s.offsetWidth, "px"), a = this.scrollHeight || "".concat(this.element.offsetHeight || s.offsetHeight, "px"), u = function(h, p) {
          return e.element.style[h] = p;
        };
        n || o ? (u("height", a), u("width", i)) : u("height", a);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var o = this.isBoth(), s = this.isHorizontal(), i = this.getContentPosition(), a = function(c, h, p) {
          var v = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = ee(ee({}, e.spacerStyle), Qe({}, "".concat(c), (h || []).length * p + v + "px"));
        };
        o ? (a("height", n, this.itemSize[0], i.y), a("width", this.columns || n[1], this.itemSize[1], i.x)) : s ? a("width", this.columns || n, this.itemSize, i.x) : a("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var o = this.isBoth(), s = this.isHorizontal(), i = e ? e.first : this.first, a = function(p, v) {
          return p * v;
        }, u = function() {
          var p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, v = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = ee(ee({}, n.contentStyle), {
            transform: "translate3d(".concat(p, "px, ").concat(v, "px, 0)")
          });
        };
        if (o)
          u(a(i.cols, this.itemSize[1]), a(i.rows, this.itemSize[0]));
        else {
          var c = a(i, this.itemSize);
          s ? u(c, 0) : u(0, c);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, o = e.target, s = this.isBoth(), i = this.isHorizontal(), a = this.getContentPosition(), u = function(C, M) {
        return C ? C > M ? C - M : C : 0;
      }, c = function(C, M) {
        return Math.floor(C / (M || C));
      }, h = function(C, M, Y, de, K, q) {
        return C <= K ? K : q ? Y - de - K : M + K - 1;
      }, p = function(C, M, Y, de, K, q, ue, tt) {
        if (C <= q) return 0;
        var ye = Math.max(0, ue ? C < M ? Y : C - q : C > M ? Y : C - 2 * q), $e = n.getLast(ye, tt);
        return ye > $e ? $e - K : ye;
      }, v = function(C, M, Y, de, K, q) {
        var ue = M + de + 2 * K;
        return C >= K && (ue += K + 1), n.getLast(ue, q);
      }, k = u(o.scrollTop, a.top), $ = u(o.scrollLeft, a.left), I = s ? {
        rows: 0,
        cols: 0
      } : 0, x = this.last, O = !1, z = this.lastScrollPos;
      if (s) {
        var T = this.lastScrollPos.top <= k, F = this.lastScrollPos.left <= $;
        if (!this.appendOnly || this.appendOnly && (T || F)) {
          var w = {
            rows: c(k, this.itemSize[0]),
            cols: c($, this.itemSize[1])
          }, g = {
            rows: h(w.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], T),
            cols: h(w.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], F)
          };
          I = {
            rows: p(w.rows, g.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], T),
            cols: p(w.cols, g.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], F, !0)
          }, x = {
            rows: v(w.rows, I.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: v(w.cols, I.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, O = I.rows !== this.first.rows || x.rows !== this.last.rows || I.cols !== this.first.cols || x.cols !== this.last.cols || this.isRangeChanged, z = {
            top: k,
            left: $
          };
        }
      } else {
        var r = i ? $ : k, f = this.lastScrollPos <= r;
        if (!this.appendOnly || this.appendOnly && f) {
          var y = c(r, this.itemSize), R = h(y, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, f);
          I = p(y, R, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, f), x = v(y, I, this.last, this.numItemsInViewport, this.d_numToleratedItems), O = I !== this.first || x !== this.last || this.isRangeChanged, z = r;
        }
      }
      return {
        first: I,
        last: x,
        isRangeChanged: O,
        scrollPos: z
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), o = n.first, s = n.last, i = n.isRangeChanged, a = n.scrollPos;
      if (i) {
        var u = {
          first: o,
          last: s
        };
        if (this.setContentPosition(u), this.first = o, this.last = s, this.lastScrollPos = a, this.$emit("scroll-index-change", u), this.lazy && this.isPageChanged(o)) {
          var c, h, p = {
            first: this.step ? Math.min(this.getPageByFirst(o) * this.step, (((c = this.items) === null || c === void 0 ? void 0 : c.length) || 0) - this.step) : o,
            last: Math.min(this.step ? (this.getPageByFirst(o) + 1) * this.step : s, ((h = this.items) === null || h === void 0 ? void 0 : h.length) || 0)
          }, v = this.lazyLoadState.first !== p.first || this.lazyLoadState.last !== p.last;
          v && this.$emit("lazy-load", p), this.lazyLoadState = p;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var o = this.onScrollPositionChange(e), s = o.isRangeChanged, i = s || (this.step ? this.isPageChanged() : !1);
            i && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(e), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (he(e.element)) {
          var n = e.isBoth(), o = e.isVertical(), s = e.isHorizontal(), i = [Q(e.element), X(e.element)], a = i[0], u = i[1], c = a !== e.defaultWidth, h = u !== e.defaultHeight, p = n ? c || h : s ? c : o ? h : !1;
          p && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = a, e.defaultHeight = u, e.defaultContentWidth = Q(e.content), e.defaultContentHeight = X(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        e.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(e) {
      var n = (this.items || []).length, o = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: o,
        count: n,
        first: o === 0,
        last: o === n - 1,
        even: o % 2 === 0,
        odd: o % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var o = this.loaderArr.length;
      return ee({
        index: e,
        count: o,
        first: e === 0,
        last: e === o - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, n);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || Ne(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
    }
  },
  computed: {
    containerClass: function() {
      return ["p-virtualscroller", this.class, {
        "p-virtualscroller-inline": this.inline,
        "p-virtualscroller-both p-both-scroll": this.isBoth(),
        "p-virtualscroller-horizontal p-horizontal-scroll": this.isHorizontal()
      }];
    },
    contentClass: function() {
      return ["p-virtualscroller-content", {
        "p-virtualscroller-loading": this.d_loading
      }];
    },
    loaderClass: function() {
      return ["p-virtualscroller-loader", {
        "p-virtualscroller-loader-mask": !this.$slots.loader
      }];
    },
    loadedItems: function() {
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return e.columns ? n : n.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), n = this.isHorizontal();
        if (e || n)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: Ue
  }
}, _n = ["tabindex"];
function Yn(t, e, n, o, s, i) {
  var a = B("SpinnerIcon");
  return t.disabled ? (d(), m(_, {
    key: 1
  }, [S(t.$slots, "default"), S(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: i.loadedColumns
  })], 64)) : (d(), m("div", l({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, t.ptmi("root")), [S(t.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: s.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: t.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: s.spacerStyle,
    contentStyle: s.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [b("div", l({
      ref: i.contentRef,
      class: i.contentClass,
      style: s.contentStyle
    }, t.ptm("content")), [(d(!0), m(_, null, Oe(i.loadedItems, function(u, c) {
      return S(t.$slots, "item", {
        key: c,
        item: u,
        options: i.getOptions(c)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (d(), m("div", l({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: s.spacerStyle
  }, t.ptm("spacer")), null, 16)) : P("", !0), !t.loaderDisabled && t.showLoader && s.d_loading ? (d(), m("div", l({
    key: 1,
    class: i.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (d(!0), m(_, {
    key: 0
  }, Oe(s.loaderArr, function(u, c) {
    return S(t.$slots, "loader", {
      key: c,
      options: i.getLoaderOptions(c, i.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : P("", !0), S(t.$slots, "loadingicon", {}, function() {
    return [L(a, l({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : P("", !0)], 16, _n));
}
Xe.render = Yn;
var Qn = `
    .p-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('select.background');
        border: 1px solid dt('select.border.color');
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            outline-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration');
        border-radius: dt('select.border.radius');
        outline-color: transparent;
        box-shadow: dt('select.shadow');
    }

    .p-select:not(.p-disabled):hover {
        border-color: dt('select.hover.border.color');
    }

    .p-select:not(.p-disabled).p-focus {
        border-color: dt('select.focus.border.color');
        box-shadow: dt('select.focus.ring.shadow');
        outline: dt('select.focus.ring.width') dt('select.focus.ring.style') dt('select.focus.ring.color');
        outline-offset: dt('select.focus.ring.offset');
    }

    .p-select.p-variant-filled {
        background: dt('select.filled.background');
    }

    .p-select.p-variant-filled:not(.p-disabled):hover {
        background: dt('select.filled.hover.background');
    }

    .p-select.p-variant-filled:not(.p-disabled).p-focus {
        background: dt('select.filled.focus.background');
    }

    .p-select.p-invalid {
        border-color: dt('select.invalid.border.color');
    }

    .p-select.p-disabled {
        opacity: 1;
        background: dt('select.disabled.background');
    }

    .p-select-clear-icon {
        align-self: center;
        color: dt('select.clear.icon.color');
        inset-inline-end: dt('select.dropdown.width');
    }

    .p-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: transparent;
        color: dt('select.dropdown.color');
        width: dt('select.dropdown.width');
        border-start-end-radius: dt('select.border.radius');
        border-end-end-radius: dt('select.border.radius');
    }

    .p-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('select.padding.y') dt('select.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
        color: dt('select.color');
        background: transparent;
        border: 0 none;
        outline: 0 none;
        font-size: 1rem;
    }

    .p-select-label.p-placeholder {
        color: dt('select.placeholder.color');
    }

    .p-select.p-invalid .p-select-label.p-placeholder {
        color: dt('select.invalid.placeholder.color');
    }

    .p-select.p-disabled .p-select-label {
        color: dt('select.disabled.color');
    }

    .p-select-label-empty {
        overflow: hidden;
        opacity: 0;
    }

    input.p-select-label {
        cursor: default;
    }

    .p-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background: dt('select.overlay.background');
        color: dt('select.overlay.color');
        border: 1px solid dt('select.overlay.border.color');
        border-radius: dt('select.overlay.border.radius');
        box-shadow: dt('select.overlay.shadow');
        min-width: 100%;
        transform-origin: inherit;
        will-change: transform;
    }

    .p-select-header {
        padding: dt('select.list.header.padding');
    }

    .p-select-filter {
        width: 100%;
    }

    .p-select-list-container {
        overflow: auto;
    }

    .p-select-option-group {
        cursor: auto;
        margin: 0;
        padding: dt('select.option.group.padding');
        background: dt('select.option.group.background');
        color: dt('select.option.group.color');
        font-weight: dt('select.option.group.font.weight');
    }

    .p-select-list {
        margin: 0;
        padding: 0;
        list-style-type: none;
        padding: dt('select.list.padding');
        gap: dt('select.list.gap');
        display: flex;
        flex-direction: column;
    }

    .p-select-option {
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: dt('select.option.padding');
        border: 0 none;
        color: dt('select.option.color');
        background: transparent;
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration'),
            outline-color dt('select.transition.duration');
        border-radius: dt('select.option.border.radius');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled).p-focus {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option.p-select-option-selected {
        background: dt('select.option.selected.background');
        color: dt('select.option.selected.color');
    }

    .p-select-option.p-select-option-selected.p-focus {
        background: dt('select.option.selected.focus.background');
        color: dt('select.option.selected.focus.color');
    }

    .p-select-option-blank-icon {
        flex-shrink: 0;
    }

    .p-select-option-check-icon {
        position: relative;
        flex-shrink: 0;
        margin-inline-start: dt('select.checkmark.gutter.start');
        margin-inline-end: dt('select.checkmark.gutter.end');
        color: dt('select.checkmark.color');
    }

    .p-select-empty-message {
        padding: dt('select.empty.message.padding');
    }

    .p-select-fluid {
        display: flex;
        width: 100%;
    }

    .p-select-sm .p-select-label {
        font-size: dt('select.sm.font.size');
        padding-block: dt('select.sm.padding.y');
        padding-inline: dt('select.sm.padding.x');
    }

    .p-select-sm .p-select-dropdown .p-icon {
        font-size: dt('select.sm.font.size');
        width: dt('select.sm.font.size');
        height: dt('select.sm.font.size');
    }

    .p-select-lg .p-select-label {
        font-size: dt('select.lg.font.size');
        padding-block: dt('select.lg.padding.y');
        padding-inline: dt('select.lg.padding.x');
    }

    .p-select-lg .p-select-dropdown .p-icon {
        font-size: dt('select.lg.font.size');
        width: dt('select.lg.font.size');
        height: dt('select.lg.font.size');
    }

    .p-floatlabel-in .p-select-filter {
        padding-block-start: dt('select.padding.y');
        padding-block-end: dt('select.padding.y');
    }
`, Xn = {
  root: function(e) {
    var n = e.instance, o = e.props, s = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": o.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": s.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": s.focused || s.overlayVisible,
      "p-select-open": s.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": o.size === "small",
      "p-select-lg p-inputfield-lg": o.size === "large"
    }];
  },
  label: function(e) {
    var n, o = e.instance, s = e.props;
    return ["p-select-label", {
      "p-placeholder": !s.editable && o.label === s.placeholder,
      "p-select-label-empty": !s.editable && !o.$slots.value && (o.label === "p-emptylabel" || ((n = o.label) === null || n === void 0 ? void 0 : n.length) === 0)
    }];
  },
  clearIcon: "p-select-clear-icon",
  dropdown: "p-select-dropdown",
  loadingicon: "p-select-loading-icon",
  dropdownIcon: "p-select-dropdown-icon",
  overlay: "p-select-overlay p-component",
  header: "p-select-header",
  pcFilter: "p-select-filter",
  listContainer: "p-select-list-container",
  list: "p-select-list",
  optionGroup: "p-select-option-group",
  optionGroupLabel: "p-select-option-group-label",
  option: function(e) {
    var n = e.instance, o = e.props, s = e.state, i = e.option, a = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && o.highlightOnSelect,
      "p-focus": s.focusedOptionIndex === a,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, ei = W.extend({
  name: "select",
  style: Qn,
  classes: Xn
}), ti = {
  name: "BaseSelect",
  extends: ve,
  props: {
    options: Array,
    optionLabel: [String, Function],
    optionValue: [String, Function],
    optionDisabled: [String, Function],
    optionGroupLabel: [String, Function],
    optionGroupChildren: [String, Function],
    scrollHeight: {
      type: String,
      default: "14rem"
    },
    filter: Boolean,
    filterPlaceholder: String,
    filterLocale: String,
    filterMatchMode: {
      type: String,
      default: "contains"
    },
    filterFields: {
      type: Array,
      default: null
    },
    editable: Boolean,
    placeholder: {
      type: String,
      default: null
    },
    dataKey: null,
    showClear: {
      type: Boolean,
      default: !1
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
    labelId: {
      type: String,
      default: null
    },
    labelClass: {
      type: [String, Object],
      default: null
    },
    labelStyle: {
      type: Object,
      default: null
    },
    panelClass: {
      type: [String, Object],
      default: null
    },
    overlayStyle: {
      type: Object,
      default: null
    },
    overlayClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    clearIcon: {
      type: String,
      default: void 0
    },
    dropdownIcon: {
      type: String,
      default: void 0
    },
    filterIcon: {
      type: String,
      default: void 0
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    resetFilterOnHide: {
      type: Boolean,
      default: !1
    },
    resetFilterOnClear: {
      type: Boolean,
      default: !1
    },
    virtualScrollerOptions: {
      type: Object,
      default: null
    },
    autoOptionFocus: {
      type: Boolean,
      default: !1
    },
    autoFilterFocus: {
      type: Boolean,
      default: !1
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    },
    focusOnHover: {
      type: Boolean,
      default: !0
    },
    highlightOnSelect: {
      type: Boolean,
      default: !0
    },
    checkmark: {
      type: Boolean,
      default: !1
    },
    filterMessage: {
      type: String,
      default: null
    },
    selectionMessage: {
      type: String,
      default: null
    },
    emptySelectionMessage: {
      type: String,
      default: null
    },
    emptyFilterMessage: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    tabindex: {
      type: Number,
      default: 0
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    }
  },
  style: ei,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function ae(t) {
  "@babel/helpers - typeof";
  return ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ae(t);
}
function ni(t) {
  return ri(t) || si(t) || oi(t) || ii();
}
function ii() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function oi(t, e) {
  if (t) {
    if (typeof t == "string") return Le(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Le(t, e) : void 0;
  }
}
function si(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ri(t) {
  if (Array.isArray(t)) return Le(t);
}
function Le(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Be(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ee(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Be(Object(n), !0).forEach(function(o) {
      J(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Be(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function J(t, e, n) {
  return (e = ai(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ai(t) {
  var e = li(t, "string");
  return ae(e) == "symbol" ? e : e + "";
}
function li(t, e) {
  if (ae(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ae(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var et = {
  name: "Select",
  extends: ti,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "before-show", "before-hide", "show", "hide", "filter"],
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  labelClickListener: null,
  matchMediaOrientationListener: null,
  overlay: null,
  list: null,
  virtualScroller: null,
  searchTimeout: null,
  searchValue: null,
  isModelValueChanged: !1,
  data: function() {
    return {
      clicked: !1,
      focused: !1,
      focusedOptionIndex: -1,
      filterValue: null,
      overlayVisible: !1,
      queryOrientation: null
    };
  },
  watch: {
    modelValue: function() {
      this.isModelValueChanged = !0;
    },
    options: function() {
      this.autoUpdateModel();
    }
  },
  mounted: function() {
    this.autoUpdateModel(), this.bindLabelClickListener(), this.bindMatchMediaOrientationListener();
  },
  updated: function() {
    this.overlayVisible && this.isModelValueChanged && this.scrollInView(this.findSelectedOptionIndex()), this.isModelValueChanged = !1;
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (we.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? Z(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? Z(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? Z(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, o, s) {
      return this.ptm(s, {
        context: {
          option: e,
          index: o,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(o, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? Z(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return Z(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return Z(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && H(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && H(n.$refs.focusInput);
      };
      setTimeout(function() {
        o();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var o, s;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (o = (s = n.formField).onBlur) === null || o === void 0 || o.call(s, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (Ot())
        switch (e.code) {
          case "Backspace":
            this.onBackspaceKey(e, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(e);
            break;
          default:
            e.preventDefault();
            return;
        }
      var o = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !o && kt(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && H(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var o = this.searchOptions(e, n);
      !o && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && ce(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? It(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      H(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? wt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      H(n);
    },
    onOptionSelect: function(e, n) {
      var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var s = this.getOptionValue(n);
        this.updateModel(e, s), o && this.hide(!0);
      }
    },
    onOptionMouseMove: function(e, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, n);
    },
    onFilterChange: function(e) {
      var n = e.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      if (!e.isComposing)
        switch (e.code) {
          case "ArrowDown":
            this.onArrowDownKey(e);
            break;
          case "ArrowUp":
            this.onArrowUpKey(e, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(e, !0);
            break;
          case "Home":
            this.onHomeKey(e, !0);
            break;
          case "End":
            this.onEndKey(e, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(e);
            break;
          case "Escape":
            this.onEscapeKey(e);
            break;
          case "Tab":
            this.onTabKey(e);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      yt.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, n);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var o = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, o), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        e.shiftKey ? o.setSelectionRange(0, e.target.selectionStart) : (o.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        if (e.shiftKey)
          o.setSelectionRange(e.target.selectionStart, o.value.length);
        else {
          var s = o.value.length;
          o.setSelectionRange(s, s), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (H(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      we.set("overlay", e, this.$primevue.config.zIndex.overlay), vt(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && H(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && H(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      we.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? mt(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = gt(this.$el) + "px", bt(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var o = n.composedPath();
        e.overlayVisible && e.overlay && !o.includes(e.$el) && !o.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new ht(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !ft() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && he(n) && (this.labelClickListener = function() {
          H(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && he(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var e = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          e.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return pt(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return ce(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return He(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return Pe(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, o = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(s) {
        return n.isValidOption(s);
      }) : -1;
      return o > -1 ? o + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, o = e > 0 ? Pe(this.visibleOptions.slice(0, e), function(s) {
        return n.isValidOption(s);
      }) : -1;
      return o > -1 ? o : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, n) {
      var o = this;
      this.searchValue = (this.searchValue || "") + n;
      var s = -1, i = !1;
      return ce(this.searchValue) && (s = this.visibleOptions.findIndex(function(a) {
        return o.isOptionExactMatched(a);
      }), s === -1 && (s = this.visibleOptions.findIndex(function(a) {
        return o.isOptionStartsWith(a);
      })), s !== -1 && (i = !0), s === -1 && this.focusedOptionIndex === -1 && (s = this.findFirstFocusedOptionIndex()), s !== -1 && this.changeFocusedOptionIndex(e, s)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        o.searchValue = "", o.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var o = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, s = Ne(e.list, 'li[id="'.concat(o, '"]'));
        s ? s.scrollIntoView && s.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(n !== -1 ? n : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(e, n) {
      this.writeValue(n, e), this.$emit("change", {
        originalEvent: e,
        value: n
      });
    },
    flatOptions: function(e) {
      var n = this;
      return (e || []).reduce(function(o, s, i) {
        o.push({
          optionGroup: s,
          group: !0,
          index: i
        });
        var a = n.getOptionGroupChildren(s);
        return a && a.forEach(function(u) {
          return o.push(u);
        }), o;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, n) {
      this.list = e, n && n(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var o = ct.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var s = this.options || [], i = [];
          return s.forEach(function(a) {
            var u = e.getOptionGroupChildren(a), c = u.filter(function(h) {
              return o.includes(h);
            });
            c.length > 0 && i.push(Ee(Ee({}, a), {}, J({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", ni(c))));
          }), this.flatOptions(i);
        }
        return o;
      }
      return n;
    },
    // @deprecated use $filled instead
    hasSelectedOption: function() {
      return this.$filled;
    },
    label: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return ce(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
    },
    filterMessageText: function() {
      return this.filterMessage || this.$primevue.config.locale.searchMessage || "";
    },
    emptyFilterMessageText: function() {
      return this.emptyFilterMessage || this.$primevue.config.locale.emptySearchMessage || this.$primevue.config.locale.emptyFilterMessage || "";
    },
    emptyMessageText: function() {
      return this.emptyMessage || this.$primevue.config.locale.emptyMessage || "";
    },
    selectionMessageText: function() {
      return this.selectionMessage || this.$primevue.config.locale.selectionMessage || "";
    },
    emptySelectionMessageText: function() {
      return this.emptySelectionMessage || this.$primevue.config.locale.emptySelectionMessage || "";
    },
    selectedMessageText: function() {
      return this.$filled ? this.selectionMessageText.replaceAll("{0}", "1") : this.emptySelectionMessageText;
    },
    focusedOptionId: function() {
      return this.focusedOptionIndex !== -1 ? "".concat(this.$id, "_").concat(this.focusedOptionIndex) : null;
    },
    ariaSetSize: function() {
      var e = this;
      return this.visibleOptions.filter(function(n) {
        return !e.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return U(J({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return U(J(J({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return U(J({}, this.size, this.size));
    },
    overlayDataP: function() {
      return U(J({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: Re
  },
  components: {
    InputText: me,
    VirtualScroller: Xe,
    Portal: ut,
    InputIcon: Ye,
    IconField: _e,
    TimesIcon: Ge,
    ChevronDownIcon: Je,
    SpinnerIcon: Ue,
    SearchIcon: Ze,
    CheckIcon: qe,
    BlankIcon: We
  }
}, di = ["id", "data-p"], ui = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], ci = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], pi = ["data-p"], fi = ["id"], hi = ["id"], mi = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function gi(t, e, n, o, s, i) {
  var a = B("SpinnerIcon"), u = B("InputText"), c = B("SearchIcon"), h = B("InputIcon"), p = B("IconField"), v = B("CheckIcon"), k = B("BlankIcon"), $ = B("VirtualScroller"), I = B("Portal"), x = je("ripple");
  return d(), m("div", l({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, t.ptmi("root")), [t.editable ? (d(), m("input", l({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: i.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": s.overlayVisible,
    "aria-controls": s.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": s.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return i.onEditableInput && i.onEditableInput.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), null, 16, ui)) : (d(), m("span", l({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (i.label === "p-emptylabel" ? void 0 : i.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": s.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": s.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), [S(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var O;
    return [G(E(i.label === "p-emptylabel" ? " " : (O = i.label) !== null && O !== void 0 ? O : "empty"), 1)];
  })], 16, ci)), i.isClearIconVisible ? S(t.$slots, "clearicon", {
    key: 2,
    class: te(t.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(d(), A(Ie(t.clearIcon ? "i" : "TimesIcon"), l({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: i.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : P("", !0), b("div", l({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? S(t.$slots, "loadingicon", {
    key: 0,
    class: te(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (d(), m("span", l({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (d(), A(a, l({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : S(t.$slots, "dropdownicon", {
    key: 1,
    class: te(t.cx("dropdownIcon"))
  }, function() {
    return [(d(), A(Ie(t.dropdownIcon ? "span" : "ChevronDownIcon"), l({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), L(I, {
    appendTo: t.appendTo
  }, {
    default: D(function() {
      return [L(Ke, l({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: D(function() {
          return [s.overlayVisible ? (d(), m("div", l({
            key: 0,
            ref: i.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return i.onOverlayKeyDown && i.onOverlayKeyDown.apply(i, arguments);
            }),
            "data-p": i.overlayDataP
          }, t.ptm("overlay")), [b("span", l({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return i.onFirstHiddenFocus && i.onFirstHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), S(t.$slots, "header", {
            value: t.d_value,
            options: i.visibleOptions
          }), t.filter ? (d(), m("div", l({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [L(p, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: D(function() {
              return [L(u, {
                ref: "filterInput",
                type: "text",
                value: s.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: te(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": i.focusedOptionId,
                onKeydown: i.onFilterKeyDown,
                onBlur: i.onFilterBlur,
                onInput: i.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), L(h, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: D(function() {
                  return [S(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (d(), m("span", l({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (d(), A(c, nt(l({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), b("span", l({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), E(i.filterResultMessageText), 17)], 16)) : P("", !0), b("div", l({
            class: t.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [L($, l({
            ref: i.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), it({
            content: D(function(O) {
              var z = O.styleClass, T = O.contentRef, F = O.items, w = O.getItemOptions, g = O.contentStyle, r = O.itemSize;
              return [b("ul", l({
                ref: function(y) {
                  return i.listRef(y, T);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), z],
                style: g,
                role: "listbox"
              }, t.ptm("list")), [(d(!0), m(_, null, Oe(F, function(f, y) {
                return d(), m(_, {
                  key: i.getOptionRenderKey(f, i.getOptionIndex(y, w))
                }, [i.isOptionGroup(f) ? (d(), m("li", l({
                  key: 0,
                  id: t.$id + "_" + i.getOptionIndex(y, w),
                  style: {
                    height: r ? r + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [S(t.$slots, "optiongroup", {
                  option: f.optionGroup,
                  index: i.getOptionIndex(y, w)
                }, function() {
                  return [b("span", l({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), E(i.getOptionGroupLabel(f.optionGroup)), 17)];
                })], 16, hi)) : De((d(), m("li", l({
                  key: 1,
                  id: t.$id + "_" + i.getOptionIndex(y, w),
                  class: t.cx("option", {
                    option: f,
                    focusedOption: i.getOptionIndex(y, w)
                  }),
                  style: {
                    height: r ? r + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(f),
                  "aria-selected": i.isSelected(f),
                  "aria-disabled": i.isOptionDisabled(f),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(y, w)),
                  onMousedown: function(j) {
                    return i.onOptionSelect(j, f);
                  },
                  onMousemove: function(j) {
                    return i.onOptionMouseMove(j, i.getOptionIndex(y, w));
                  },
                  onClick: e[8] || (e[8] = ot(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && i.isSelected(f),
                  "data-p-focused": s.focusedOptionIndex === i.getOptionIndex(y, w),
                  "data-p-disabled": i.isOptionDisabled(f)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(f, w, y, "option")), [t.checkmark ? (d(), m(_, {
                  key: 0
                }, [i.isSelected(f) ? (d(), A(v, l({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (d(), A(k, l({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : P("", !0), S(t.$slots, "option", {
                  option: f,
                  selected: i.isSelected(f),
                  index: i.getOptionIndex(y, w)
                }, function() {
                  return [b("span", l({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), E(i.getOptionLabel(f)), 17)];
                })], 16, mi)), [[x]])], 64);
              }), 128)), s.filterValue && (!F || F && F.length === 0) ? (d(), m("li", l({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [S(t.$slots, "emptyfilter", {}, function() {
                return [G(E(i.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (d(), m("li", l({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [S(t.$slots, "empty", {}, function() {
                return [G(E(i.emptyMessageText), 1)];
              })], 16)) : P("", !0)], 16, fi)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: D(function(O) {
              var z = O.options;
              return [S(t.$slots, "loader", {
                options: z
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), S(t.$slots, "footer", {
            value: t.d_value,
            options: i.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (d(), m("span", l({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), E(i.emptyMessageText), 17)) : P("", !0), b("span", l({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), E(i.selectedMessageText), 17), b("span", l({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return i.onLastHiddenFocus && i.onLastHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, pi)) : P("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, di);
}
et.render = gi;
var bi = `
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`, vi = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-textarea p-component", {
      "p-filled": n.$filled,
      "p-textarea-resizable ": o.autoResize,
      "p-textarea-sm p-inputfield-sm": o.size === "small",
      "p-textarea-lg p-inputfield-lg": o.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-textarea-fluid": n.$fluid
    }];
  }
}, yi = W.extend({
  name: "textarea",
  style: bi,
  classes: vi
}), wi = {
  name: "BaseTextarea",
  extends: ve,
  props: {
    autoResize: Boolean
  },
  style: yi,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function le(t) {
  "@babel/helpers - typeof";
  return le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, le(t);
}
function Ii(t, e, n) {
  return (e = Oi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Oi(t) {
  var e = ki(t, "string");
  return le(e) == "symbol" ? e : e + "";
}
function ki(t, e) {
  if (le(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (le(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var fe = {
  name: "Textarea",
  extends: wi,
  inheritAttrs: !1,
  observer: null,
  mounted: function() {
    var e = this;
    this.autoResize && (this.observer = new ResizeObserver(function() {
      requestAnimationFrame(function() {
        e.resize();
      });
    }), this.observer.observe(this.$el));
  },
  updated: function() {
    this.autoResize && this.resize();
  },
  beforeUnmount: function() {
    this.observer && this.observer.disconnect();
  },
  methods: {
    resize: function() {
      if (this.$el.offsetParent) {
        var e = this.$el.style.height, n = parseInt(e) || 0, o = this.$el.scrollHeight, s = !n || o > n, i = n && o < n;
        i ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : s && (this.$el.style.height = "".concat(o, "px"));
      }
    },
    onInput: function(e) {
      this.autoResize && this.resize(), this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return l(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return U(Ii({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Si = ["value", "name", "disabled", "aria-invalid", "data-p"];
function xi(t, e, n, o, s, i) {
  return d(), m("textarea", l({
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.invalid || void 0,
    "data-p": i.dataP,
    onInput: e[0] || (e[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, Si);
}
fe.render = xi;
const zi = { class: "kx-agent-block" }, Ci = { class: "kx-agent-block__modes" }, Li = { for: "agent-source-existing" }, $i = { for: "agent-source-inline" }, Pi = {
  key: 0,
  class: "kx-agent-block__field"
}, Ti = {
  key: 1,
  class: "kx-agent-block__loading",
  role: "status"
}, Fi = ["config"], Vi = {
  key: 1,
  class: "kx-agent-block__field"
}, Ai = { class: "kx-agent-block__field" }, Mi = { class: "kx-agent-block__field" }, Bi = { class: "kx-agent-block__field" }, Ei = {
  key: 2,
  class: "kx-agent-block__field"
}, ji = { class: "kx-agent-block__field" }, Ki = { class: "kx-agent-block__field" }, Wi = /* @__PURE__ */ st({
  __name: "AgentBlockConfig",
  setup(t) {
    const e = St(), n = xt(), o = e.value.config, s = N(o?.agent_id ? "existing" : "inline"), i = N({ ...o || {} }), a = N(o?.exit_schema ? JSON.stringify(o.exit_schema, null, 2) : ""), u = N(o?.context ? JSON.stringify(o.context, null, 2) : ""), c = N(""), h = N(""), p = N(!1), v = N(""), k = [
      { label: "Auto", value: "auto" },
      { label: "Require a tool", value: "any" },
      { label: "No tools", value: "none" }
    ];
    rt(() => e.value.config, (g) => {
      i.value = { ...g || {} }, s.value = i.value.agent_id ? "existing" : "inline", a.value = i.value.exit_schema ? JSON.stringify(i.value.exit_schema, null, 2) : "", u.value = i.value.context ? JSON.stringify(i.value.context, null, 2) : "";
    });
    const $ = at(() => JSON.stringify({ agent_id: i.value.agent_id || "" }));
    function I() {
      const g = { ...i.value };
      s.value === "existing" ? delete g.instructions : delete g.agent_id;
      for (const r of Object.keys(g)) {
        const f = g[r];
        (f === "" || f == null || Array.isArray(f) && f.length === 0) && delete g[r];
      }
      i.value = g, n("config-changed", g);
    }
    function x(g) {
      s.value = g, g === "existing" ? delete i.value.instructions : delete i.value.agent_id, I();
    }
    function O(g) {
      if (g.composedPath()[0] !== g.currentTarget) return;
      const r = g.detail;
      i.value.agent_id = r?.agent_id || "", I();
    }
    function z(g, r) {
      i.value[g] = r || "", I();
    }
    function T(g) {
      i.value.tool_calling = g, i.value.tool_calling === "none" && (delete i.value.tools, delete i.value.exit_schema, a.value = "", c.value = ""), I();
    }
    function F(g) {
      i.value.tools = [...g], I();
    }
    function w(g, r) {
      r ||= "", g === "exit_schema" ? a.value = r : u.value = r;
      const f = g === "exit_schema" ? c : h;
      if (!r.trim()) {
        delete i.value[g], f.value = "", I();
        return;
      }
      try {
        const y = JSON.parse(r);
        if (!y || typeof y != "object" || Array.isArray(y)) throw new Error("Enter a JSON object.");
        if (g === "exit_schema" && y.type !== "object") throw new Error("Output shape must declare type: object.");
        if (g === "exit_schema" && i.value.tool_calling === "none") throw new Error("Output shape requires tool calling.");
        i.value[g] = y, f.value = "", I();
      } catch (y) {
        f.value = y instanceof Error ? y.message : "Enter a JSON object.";
      }
    }
    return lt(async () => {
      p.value = !1, v.value = "";
      try {
        await dt("wc-agent-picker", { timeoutMs: 8e3 }), p.value = !0;
      } catch {
        v.value = "Couldn’t load the Agent picker. Switch to inline instructions or try again.";
      }
    }), (g, r) => (d(), m("div", zi, [
      b("fieldset", Ci, [
        r[11] || (r[11] = b("legend", null, "Agent source", -1)),
        b("label", Li, [
          L(V(ke), {
            "input-id": "agent-source-existing",
            modelValue: s.value,
            "onUpdate:modelValue": r[0] || (r[0] = (f) => s.value = f),
            name: "agent-source",
            value: "existing",
            onChange: r[1] || (r[1] = (f) => x("existing"))
          }, null, 8, ["modelValue"]),
          r[9] || (r[9] = G(" Existing agent", -1))
        ]),
        b("label", $i, [
          L(V(ke), {
            "input-id": "agent-source-inline",
            modelValue: s.value,
            "onUpdate:modelValue": r[2] || (r[2] = (f) => s.value = f),
            name: "agent-source",
            value: "inline",
            onChange: r[3] || (r[3] = (f) => x("inline"))
          }, null, 8, ["modelValue"]),
          r[10] || (r[10] = G(" Inline instructions", -1))
        ])
      ]),
      s.value === "existing" ? (d(), m("div", Pi, [
        r[13] || (r[13] = b("span", null, "Agent", -1)),
        v.value ? (d(), A(V(pe), {
          key: 0,
          severity: "error",
          size: "small",
          closable: !1
        }, {
          default: D(() => [
            G(E(v.value), 1)
          ]),
          _: 1
        })) : p.value ? (d(), m("wc-agent-picker", {
          key: 2,
          config: $.value,
          onChange: O
        }, null, 40, Fi)) : (d(), m("div", Ti, [
          L(V(Ct), {
            class: "kx-agent-block__spinner",
            "stroke-width": "4",
            "aria-label": "Loading Agent picker"
          }),
          r[12] || (r[12] = b("span", null, "Loading Agent picker…", -1))
        ])),
        r[14] || (r[14] = b("small", null, "Select one exact installed Agent.", -1))
      ])) : (d(), m("label", Vi, [
        r[15] || (r[15] = b("span", null, "Instructions", -1)),
        L(V(fe), {
          class: "kx-agent-block__control",
          "model-value": i.value.instructions || "",
          rows: "5",
          placeholder: "What should this step do?",
          "onUpdate:modelValue": r[4] || (r[4] = (f) => z("instructions", f))
        }, null, 8, ["model-value"]),
        r[16] || (r[16] = b("small", null, "The upstream Block output is provided as this Agent’s input.", -1))
      ])),
      b("label", Ai, [
        r[17] || (r[17] = b("span", null, "Name", -1)),
        L(V(me), {
          class: "kx-agent-block__control",
          "model-value": i.value.name || "",
          placeholder: "Agent step",
          "onUpdate:modelValue": r[5] || (r[5] = (f) => z("name", f))
        }, null, 8, ["model-value"])
      ]),
      b("label", Mi, [
        r[18] || (r[18] = b("span", null, "Model or class", -1)),
        L(V(me), {
          class: "kx-agent-block__control",
          "model-value": i.value.model || "",
          placeholder: "Use the Agent or system default",
          "onUpdate:modelValue": r[6] || (r[6] = (f) => z("model", f))
        }, null, 8, ["model-value"])
      ]),
      b("label", Bi, [
        r[19] || (r[19] = b("span", null, "Tool calling", -1)),
        L(V(et), {
          class: "kx-agent-block__control",
          "model-value": i.value.tool_calling || "auto",
          options: k,
          "option-label": "label",
          "option-value": "value",
          "onUpdate:modelValue": T
        }, null, 8, ["model-value"])
      ]),
      i.value.tool_calling !== "none" ? (d(), m("div", Ei, [
        r[20] || (r[20] = b("span", null, "Tools", -1)),
        L(Lt, {
          source: "/api/v1/agents/tools",
          "response-key": "tools",
          "label-key": "title",
          "desc-key": "llm_description",
          "meta-key": "llm_alias",
          "icon-key": "icon",
          placeholder: "Search tools to add…",
          selected: i.value.tools || [],
          onChange: F
        }, null, 8, ["selected"]),
        r[21] || (r[21] = b("small", null, "Select exact installed tools.", -1))
      ])) : P("", !0),
      b("label", ji, [
        r[22] || (r[22] = b("span", null, "Output shape", -1)),
        L(V(fe), {
          class: "kx-agent-block__control",
          "model-value": a.value,
          rows: "4",
          placeholder: "JSON Schema object",
          invalid: !!c.value,
          "onUpdate:modelValue": r[7] || (r[7] = (f) => w("exit_schema", f))
        }, null, 8, ["model-value", "invalid"]),
        c.value ? (d(), A(V(pe), {
          key: 0,
          severity: "error",
          size: "small",
          closable: !1
        }, {
          default: D(() => [
            G(E(c.value), 1)
          ]),
          _: 1
        })) : P("", !0)
      ]),
      b("label", Ki, [
        r[23] || (r[23] = b("span", null, "Context", -1)),
        L(V(fe), {
          class: "kx-agent-block__control",
          "model-value": u.value,
          rows: "3",
          placeholder: "JSON object",
          invalid: !!h.value,
          "onUpdate:modelValue": r[8] || (r[8] = (f) => w("context", f))
        }, null, 8, ["model-value", "invalid"]),
        h.value ? (d(), A(V(pe), {
          key: 0,
          severity: "error",
          size: "small",
          closable: !1
        }, {
          default: D(() => [
            G(E(h.value), 1)
          ]),
          _: 1
        })) : P("", !0)
      ])
    ]));
  }
});
export {
  Wi as default
};
//# sourceMappingURL=AgentBlockConfig-s-UmsUpQ.js.map
