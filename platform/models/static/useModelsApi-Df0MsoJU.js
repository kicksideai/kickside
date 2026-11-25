import { openBlock as h, createElementBlock as b, mergeProps as g, createElementVNode as I, renderSlot as T, resolveComponent as N, Fragment as q, renderList as le, createCommentVNode as M, createVNode as v, resolveDirective as it, createTextVNode as W, toDisplayString as E, normalizeClass as Y, createBlock as G, resolveDynamicComponent as Te, withCtx as z, Transition as st, normalizeProps as ot, createSlots as rt, withDirectives as ye, withModifiers as ze, defineComponent as ee, unref as O, ref as F, computed as ve, vModelText as Re, reactive as lt, watch as ge, onMounted as at, onBeforeUnmount as dt, vShow as ut } from "vue";
import { a as pe, B as te, s as Ie, f as re, z as He, p as be, c as ie, T as se, j as ct, R as pt, g as me, F as ft, M as Fe, k as ht, q as mt, b as _, Y as vt, t as gt, w as bt, v as yt, D as It, x as Se, S as Ot, O as St, L as wt, d as kt, $ as Ct, J as Lt, y as Q } from "./wc-runtime-DYOSFvWw.js";
import { Icon as ae } from "@iconify/vue";
import { e as xt, f as je, g as P, h as H, j as Ae, a as Me, k as Vt } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-Bk2OLic6.js";
import { loadByTagName as zt, api as R } from "@wippy-fe/proxy";
var Ue = {
  name: "BlankIcon",
  extends: pe
};
function $t(e) {
  return Mt(e) || At(e) || Ft(e) || Tt();
}
function Tt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ft(e, t) {
  if (e) {
    if (typeof e == "string") return we(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? we(e, t) : void 0;
  }
}
function At(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Mt(e) {
  if (Array.isArray(e)) return we(e);
}
function we(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Pt(e, t, n, s, o, i) {
  return h(), b("svg", g({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), $t(t[0] || (t[0] = [I("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Ue.render = Pt;
var Ne = {
  name: "CheckIcon",
  extends: pe
};
function Et(e) {
  return Rt(e) || Kt(e) || Dt(e) || Bt();
}
function Bt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Dt(e, t) {
  if (e) {
    if (typeof e == "string") return ke(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ke(e, t) : void 0;
  }
}
function Kt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Rt(e) {
  if (Array.isArray(e)) return ke(e);
}
function ke(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Ht(e, t, n, s, o, i) {
  return h(), b("svg", g({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Et(t[0] || (t[0] = [I("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ne.render = Ht;
var _e = {
  name: "ChevronDownIcon",
  extends: pe
};
function jt(e) {
  return Gt(e) || _t(e) || Nt(e) || Ut();
}
function Ut() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Nt(e, t) {
  if (e) {
    if (typeof e == "string") return Ce(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ce(e, t) : void 0;
  }
}
function _t(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Gt(e) {
  if (Array.isArray(e)) return Ce(e);
}
function Ce(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Wt(e, t, n, s, o, i) {
  return h(), b("svg", g({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), jt(t[0] || (t[0] = [I("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
_e.render = Wt;
var Ge = {
  name: "SearchIcon",
  extends: pe
};
function qt(e) {
  return Qt(e) || Yt(e) || Jt(e) || Zt();
}
function Zt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jt(e, t) {
  if (e) {
    if (typeof e == "string") return Le(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Le(e, t) : void 0;
  }
}
function Yt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Qt(e) {
  if (Array.isArray(e)) return Le(e);
}
function Le(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Xt(e, t, n, s, o, i) {
  return h(), b("svg", g({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), qt(t[0] || (t[0] = [I("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ge.render = Xt;
var We = {
  name: "TimesIcon",
  extends: pe
};
function en(e) {
  return on(e) || sn(e) || nn(e) || tn();
}
function tn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function nn(e, t) {
  if (e) {
    if (typeof e == "string") return xe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xe(e, t) : void 0;
  }
}
function sn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function on(e) {
  if (Array.isArray(e)) return xe(e);
}
function xe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function rn(e, t, n, s, o, i) {
  return h(), b("svg", g({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), en(t[0] || (t[0] = [I("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
We.render = rn;
var ln = `
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
`, an = {
  root: "p-iconfield"
}, dn = te.extend({
  name: "iconfield",
  style: ln,
  classes: an
}), un = {
  name: "BaseIconField",
  extends: Ie,
  style: dn,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, qe = {
  name: "IconField",
  extends: un,
  inheritAttrs: !1
};
function cn(e, t, n, s, o, i) {
  return h(), b("div", g({
    class: e.cx("root")
  }, e.ptmi("root")), [T(e.$slots, "default")], 16);
}
qe.render = cn;
var pn = {
  root: "p-inputicon"
}, fn = te.extend({
  name: "inputicon",
  classes: pn
}), hn = {
  name: "BaseInputIcon",
  extends: Ie,
  style: fn,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, Ze = {
  name: "InputIcon",
  extends: hn,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function mn(e, t, n, s, o, i) {
  return h(), b("span", g({
    class: i.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [T(e.$slots, "default")], 16);
}
Ze.render = mn;
var Je = {
  name: "BaseInput",
  extends: xt,
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
      var t;
      return (t = this.variant) !== null && t !== void 0 ? t : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var t;
      return (t = this.fluid) !== null && t !== void 0 ? t : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, vn = `
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
`, gn = {
  root: function(t) {
    var n = t.instance, s = t.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": s.size === "small",
      "p-inputtext-lg p-inputfield-lg": s.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, bn = te.extend({
  name: "inputtext",
  style: vn,
  classes: gn
}), yn = {
  name: "BaseInputText",
  extends: Je,
  style: bn,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function de(e) {
  "@babel/helpers - typeof";
  return de = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, de(e);
}
function In(e, t, n) {
  return (t = On(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function On(e) {
  var t = Sn(e, "string");
  return de(t) == "symbol" ? t : t + "";
}
function Sn(e, t) {
  if (de(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (de(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ye = {
  name: "InputText",
  extends: yn,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return g(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return re(In({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, wn = ["value", "name", "disabled", "aria-invalid", "data-p"];
function kn(e, t, n, s, o, i) {
  return h(), b("input", g({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": i.dataP,
    onInput: t[0] || (t[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, wn);
}
Ye.render = kn;
var Cn = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Ln = `
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
`, Pe = te.extend({
  name: "virtualscroller",
  css: Ln,
  style: Cn
}), xn = {
  name: "BaseVirtualScroller",
  extends: Ie,
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
  style: Pe,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var t;
    Pe.loadCSS({
      nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
    });
  }
};
function ue(e) {
  "@babel/helpers - typeof";
  return ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ue(e);
}
function Ee(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function oe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ee(Object(n), !0).forEach(function(s) {
      Qe(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ee(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Qe(e, t, n) {
  return (t = Vn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Vn(e) {
  var t = zn(e, "string");
  return ue(t) == "symbol" ? t : t + "";
}
function zn(e, t) {
  if (ue(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (ue(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Xe = {
  name: "VirtualScroller",
  extends: xn,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var t = this.isBoth();
    return {
      first: t ? {
        rows: 0,
        cols: 0
      } : 0,
      last: t ? {
        rows: 0,
        cols: 0
      } : 0,
      page: t ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: t ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: t ? {
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
    numToleratedItems: function(t) {
      this.d_numToleratedItems = t;
    },
    loading: function(t, n) {
      this.lazy && t !== n && t !== this.d_loading && (this.d_loading = t);
    },
    items: {
      handler: function(t, n) {
        (!n || n.length !== (t || []).length) && (this.init(), this.calculateAutoSize());
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
      be(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = ie(this.element), this.defaultHeight = se(this.element), this.defaultContentWidth = ie(this.content), this.defaultContentHeight = se(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
    scrollTo: function(t) {
      this.element && this.element.scrollTo(t);
    },
    scrollToIndex: function(t) {
      var n = this, s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", o = this.isBoth(), i = this.isHorizontal(), r = o ? t.every(function(x) {
        return x > -1;
      }) : t > -1;
      if (r) {
        var f = this.first, p = this.element, d = p.scrollTop, u = d === void 0 ? 0 : d, a = p.scrollLeft, l = a === void 0 ? 0 : a, c = this.calculateNumItems(), S = c.numToleratedItems, $ = this.getContentPosition(), w = this.itemSize, L = function() {
          var V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, y = arguments.length > 1 ? arguments[1] : void 0;
          return V <= y ? 0 : V;
        }, A = function(V, y, m) {
          return V * y + m;
        }, B = function() {
          var V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: V,
            top: y,
            behavior: s
          });
        }, C = o ? {
          rows: 0,
          cols: 0
        } : 0, j = !1, D = !1;
        o ? (C = {
          rows: L(t[0], S[0]),
          cols: L(t[1], S[1])
        }, B(A(C.cols, w[1], $.left), A(C.rows, w[0], $.top)), D = this.lastScrollPos.top !== u || this.lastScrollPos.left !== l, j = C.rows !== f.rows || C.cols !== f.cols) : (C = L(t, S), i ? B(A(C, w, $.left), u) : B(l, A(C, w, $.top)), D = this.lastScrollPos !== (i ? l : u), j = C !== f), this.isRangeChanged = j, D && (this.first = C);
      }
    },
    scrollInView: function(t, n) {
      var s = this, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), r = this.isHorizontal(), f = i ? t.every(function(w) {
          return w > -1;
        }) : t > -1;
        if (f) {
          var p = this.getRenderedRange(), d = p.first, u = p.viewport, a = function() {
            var L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return s.scrollTo({
              left: L,
              top: A,
              behavior: o
            });
          }, l = n === "to-start", c = n === "to-end";
          if (l) {
            if (i)
              u.first.rows - d.rows > t[0] ? a(u.first.cols * this.itemSize[1], (u.first.rows - 1) * this.itemSize[0]) : u.first.cols - d.cols > t[1] && a((u.first.cols - 1) * this.itemSize[1], u.first.rows * this.itemSize[0]);
            else if (u.first - d > t) {
              var S = (u.first - 1) * this.itemSize;
              r ? a(S, 0) : a(0, S);
            }
          } else if (c) {
            if (i)
              u.last.rows - d.rows <= t[0] + 1 ? a(u.first.cols * this.itemSize[1], (u.first.rows + 1) * this.itemSize[0]) : u.last.cols - d.cols <= t[1] + 1 && a((u.first.cols + 1) * this.itemSize[1], u.first.rows * this.itemSize[0]);
            else if (u.last - d <= t + 1) {
              var $ = (u.first + 1) * this.itemSize;
              r ? a($, 0) : a(0, $);
            }
          }
        }
      } else
        this.scrollToIndex(t, o);
    },
    getRenderedRange: function() {
      var t = function(a, l) {
        return Math.floor(a / (l || a));
      }, n = this.first, s = 0;
      if (this.element) {
        var o = this.isBoth(), i = this.isHorizontal(), r = this.element, f = r.scrollTop, p = r.scrollLeft;
        if (o)
          n = {
            rows: t(f, this.itemSize[0]),
            cols: t(p, this.itemSize[1])
          }, s = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var d = i ? p : f;
          n = t(d, this.itemSize), s = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: s
        }
      };
    },
    calculateNumItems: function() {
      var t = this.isBoth(), n = this.isHorizontal(), s = this.itemSize, o = this.getContentPosition(), i = this.element ? this.element.offsetWidth - o.left : 0, r = this.element ? this.element.offsetHeight - o.top : 0, f = function(l, c) {
        return Math.ceil(l / (c || l));
      }, p = function(l) {
        return Math.ceil(l / 2);
      }, d = t ? {
        rows: f(r, s[0]),
        cols: f(i, s[1])
      } : f(n ? i : r, s), u = this.d_numToleratedItems || (t ? [p(d.rows), p(d.cols)] : p(d));
      return {
        numItemsInViewport: d,
        numToleratedItems: u
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), s = this.first, o = this.calculateNumItems(), i = o.numItemsInViewport, r = o.numToleratedItems, f = function(u, a, l) {
        var c = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(u + a + (u < l ? 2 : 3) * l, c);
      }, p = n ? {
        rows: f(s.rows, i.rows, r[0]),
        cols: f(s.cols, i.cols, r[1], !0)
      } : f(s, i, r);
      this.last = p, this.numItemsInViewport = i, this.d_numToleratedItems = r, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var d;
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: s.cols
          } : 0 : s,
          last: Math.min(t.step ? t.step : p, ((d = t.items) === null || d === void 0 ? void 0 : d.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), s = t.isHorizontal(), o = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var i = [ie(t.element), se(t.element)], r = i[0], f = i[1];
          (n || s) && (t.element.style.width = r < t.defaultWidth ? r + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || o) && (t.element.style.height = f < t.defaultHeight ? f + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, o = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(o ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, s) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), s = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), o = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), i = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
        return {
          left: n,
          right: s,
          top: o,
          bottom: i,
          x: n + s,
          y: o + i
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
      var t = this;
      if (this.element) {
        var n = this.isBoth(), s = this.isHorizontal(), o = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || o.offsetWidth, "px"), r = this.scrollHeight || "".concat(this.element.offsetHeight || o.offsetHeight, "px"), f = function(d, u) {
          return t.element.style[d] = u;
        };
        n || s ? (f("height", r), f("width", i)) : f("height", r);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var s = this.isBoth(), o = this.isHorizontal(), i = this.getContentPosition(), r = function(p, d, u) {
          var a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = oe(oe({}, t.spacerStyle), Qe({}, "".concat(p), (d || []).length * u + a + "px"));
        };
        s ? (r("height", n, this.itemSize[0], i.y), r("width", this.columns || n[1], this.itemSize[1], i.x)) : o ? r("width", this.columns || n, this.itemSize, i.x) : r("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var s = this.isBoth(), o = this.isHorizontal(), i = t ? t.first : this.first, r = function(u, a) {
          return u * a;
        }, f = function() {
          var u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = oe(oe({}, n.contentStyle), {
            transform: "translate3d(".concat(u, "px, ").concat(a, "px, 0)")
          });
        };
        if (s)
          f(r(i.cols, this.itemSize[1]), r(i.rows, this.itemSize[0]));
        else {
          var p = r(i, this.itemSize);
          o ? f(p, 0) : f(0, p);
        }
      }
    },
    onScrollPositionChange: function(t) {
      var n = this, s = t.target, o = this.isBoth(), i = this.isHorizontal(), r = this.getContentPosition(), f = function(k, K) {
        return k ? k > K ? k - K : k : 0;
      }, p = function(k, K) {
        return Math.floor(k / (K || k));
      }, d = function(k, K, ne, fe, U, Z) {
        return k <= U ? U : Z ? ne - fe - U : K + U - 1;
      }, u = function(k, K, ne, fe, U, Z, he, nt) {
        if (k <= Z) return 0;
        var Oe = Math.max(0, he ? k < K ? ne : k - Z : k > K ? ne : k - 2 * Z), $e = n.getLast(Oe, nt);
        return Oe > $e ? $e - U : Oe;
      }, a = function(k, K, ne, fe, U, Z) {
        var he = K + fe + 2 * U;
        return k >= U && (he += U + 1), n.getLast(he, Z);
      }, l = f(s.scrollTop, r.top), c = f(s.scrollLeft, r.left), S = o ? {
        rows: 0,
        cols: 0
      } : 0, $ = this.last, w = !1, L = this.lastScrollPos;
      if (o) {
        var A = this.lastScrollPos.top <= l, B = this.lastScrollPos.left <= c;
        if (!this.appendOnly || this.appendOnly && (A || B)) {
          var C = {
            rows: p(l, this.itemSize[0]),
            cols: p(c, this.itemSize[1])
          }, j = {
            rows: d(C.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], A),
            cols: d(C.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], B)
          };
          S = {
            rows: u(C.rows, j.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], A),
            cols: u(C.cols, j.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], B, !0)
          }, $ = {
            rows: a(C.rows, S.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: a(C.cols, S.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, w = S.rows !== this.first.rows || $.rows !== this.last.rows || S.cols !== this.first.cols || $.cols !== this.last.cols || this.isRangeChanged, L = {
            top: l,
            left: c
          };
        }
      } else {
        var D = i ? c : l, x = this.lastScrollPos <= D;
        if (!this.appendOnly || this.appendOnly && x) {
          var V = p(D, this.itemSize), y = d(V, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, x);
          S = u(V, y, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, x), $ = a(V, S, this.last, this.numItemsInViewport, this.d_numToleratedItems), w = S !== this.first || $ !== this.last || this.isRangeChanged, L = D;
        }
      }
      return {
        first: S,
        last: $,
        isRangeChanged: w,
        scrollPos: L
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), s = n.first, o = n.last, i = n.isRangeChanged, r = n.scrollPos;
      if (i) {
        var f = {
          first: s,
          last: o
        };
        if (this.setContentPosition(f), this.first = s, this.last = o, this.lastScrollPos = r, this.$emit("scroll-index-change", f), this.lazy && this.isPageChanged(s)) {
          var p, d, u = {
            first: this.step ? Math.min(this.getPageByFirst(s) * this.step, (((p = this.items) === null || p === void 0 ? void 0 : p.length) || 0) - this.step) : s,
            last: Math.min(this.step ? (this.getPageByFirst(s) + 1) * this.step : o, ((d = this.items) === null || d === void 0 ? void 0 : d.length) || 0)
          }, a = this.lazyLoadState.first !== u.first || this.lazyLoadState.last !== u.last;
          a && this.$emit("lazy-load", u), this.lazyLoadState = u;
        }
      }
    },
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var s = this.onScrollPositionChange(t), o = s.isRangeChanged, i = o || (this.step ? this.isPageChanged() : !1);
            i && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(t), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(t);
    },
    onResize: function() {
      var t = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (be(t.element)) {
          var n = t.isBoth(), s = t.isVertical(), o = t.isHorizontal(), i = [ie(t.element), se(t.element)], r = i[0], f = i[1], p = r !== t.defaultWidth, d = f !== t.defaultHeight, u = n ? p || d : o ? p : s ? d : !1;
          u && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = r, t.defaultHeight = f, t.defaultContentWidth = ie(t.content), t.defaultContentHeight = se(t.content), t.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        t.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(t) {
      var n = (this.items || []).length, s = this.isBoth() ? this.first.rows + t : this.first + t;
      return {
        index: s,
        count: n,
        first: s === 0,
        last: s === n - 1,
        even: s % 2 === 0,
        odd: s % 2 !== 0
      };
    },
    getLoaderOptions: function(t, n) {
      var s = this.loaderArr.length;
      return oe({
        index: t,
        count: s,
        first: t === 0,
        last: t === s - 1,
        even: t % 2 === 0,
        odd: t % 2 !== 0
      }, n);
    },
    getPageByFirst: function(t) {
      return Math.floor(((t ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(t) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(t ?? this.first) : !0;
    },
    setContentEl: function(t) {
      this.content = t || this.content || He(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(t) {
      this.element = t;
    },
    contentRef: function(t) {
      this.content = t;
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
      var t = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return t.columns ? n : n.slice(t.appendOnly ? 0 : t.first.cols, t.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var t = this.isBoth(), n = this.isHorizontal();
        if (t || n)
          return this.d_loading && this.loaderDisabled ? t ? this.loaderArr[0] : this.loaderArr : this.columns.slice(t ? this.first.cols : this.first, t ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: je
  }
}, $n = ["tabindex"];
function Tn(e, t, n, s, o, i) {
  var r = N("SpinnerIcon");
  return e.disabled ? (h(), b(q, {
    key: 1
  }, [T(e.$slots, "default"), T(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: i.loadedColumns
  })], 64)) : (h(), b("div", g({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, e.ptmi("root")), [T(e.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: o.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: e.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: o.spacerStyle,
    contentStyle: o.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [I("div", g({
      ref: i.contentRef,
      class: i.contentClass,
      style: o.contentStyle
    }, e.ptm("content")), [(h(!0), b(q, null, le(i.loadedItems, function(f, p) {
      return T(e.$slots, "item", {
        key: p,
        item: f,
        options: i.getOptions(p)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (h(), b("div", g({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: o.spacerStyle
  }, e.ptm("spacer")), null, 16)) : M("", !0), !e.loaderDisabled && e.showLoader && o.d_loading ? (h(), b("div", g({
    key: 1,
    class: i.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (h(!0), b(q, {
    key: 0
  }, le(o.loaderArr, function(f, p) {
    return T(e.$slots, "loader", {
      key: p,
      options: i.getLoaderOptions(p, i.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : M("", !0), T(e.$slots, "loadingicon", {}, function() {
    return [v(r, g({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : M("", !0)], 16, $n));
}
Xe.render = Tn;
var Fn = `
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
`, An = {
  root: function(t) {
    var n = t.instance, s = t.props, o = t.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": s.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": o.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": o.focused || o.overlayVisible,
      "p-select-open": o.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": s.size === "small",
      "p-select-lg p-inputfield-lg": s.size === "large"
    }];
  },
  label: function(t) {
    var n, s = t.instance, o = t.props;
    return ["p-select-label", {
      "p-placeholder": !o.editable && s.label === o.placeholder,
      "p-select-label-empty": !o.editable && !s.$slots.value && (s.label === "p-emptylabel" || ((n = s.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
  option: function(t) {
    var n = t.instance, s = t.props, o = t.state, i = t.option, r = t.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && s.highlightOnSelect,
      "p-focus": o.focusedOptionIndex === r,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, Mn = te.extend({
  name: "select",
  style: Fn,
  classes: An
}), Pn = {
  name: "BaseSelect",
  extends: Je,
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
  style: Mn,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function ce(e) {
  "@babel/helpers - typeof";
  return ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ce(e);
}
function En(e) {
  return Rn(e) || Kn(e) || Dn(e) || Bn();
}
function Bn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Dn(e, t) {
  if (e) {
    if (typeof e == "string") return Ve(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ve(e, t) : void 0;
  }
}
function Kn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Rn(e) {
  if (Array.isArray(e)) return Ve(e);
}
function Ve(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Be(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function De(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Be(Object(n), !0).forEach(function(s) {
      J(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Be(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function J(e, t, n) {
  return (t = Hn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Hn(e) {
  var t = jn(e, "string");
  return ce(t) == "symbol" ? t : t + "";
}
function jn(e, t) {
  if (ce(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (ce(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var et = {
  name: "Select",
  extends: Pn,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Se.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? Q(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? Q(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? Q(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
    },
    getPTItemOptions: function(t, n, s, o) {
      return this.ptm(o, {
        context: {
          option: t,
          index: s,
          selected: this.isSelected(t),
          focused: this.focusedOptionIndex === this.getOptionIndex(s, n),
          disabled: this.isOptionDisabled(t)
        }
      });
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? Q(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return Q(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return Q(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(s) {
        return n.isOptionGroup(s);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && _(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, s = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && _(n.$refs.focusInput);
      };
      setTimeout(function() {
        s();
      }, 0);
    },
    onFocus: function(t) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", t));
    },
    onBlur: function(t) {
      var n = this;
      setTimeout(function() {
        var s, o;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", t), (s = (o = n.formField).onBlur) === null || s === void 0 || s.call(o, t);
      }, 100);
    },
    onKeyDown: function(t) {
      var n = this;
      if (this.disabled) {
        t.preventDefault();
        return;
      }
      if (Ct())
        switch (t.code) {
          case "Backspace":
            this.onBackspaceKey(t, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(t);
            break;
          default:
            t.preventDefault();
            return;
        }
      var s = t.metaKey || t.ctrlKey;
      switch (t.code) {
        case "ArrowDown":
          this.onArrowDownKey(t);
          break;
        case "ArrowUp":
          this.onArrowUpKey(t, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(t, this.editable);
          break;
        case "Home":
          this.onHomeKey(t, this.editable);
          break;
        case "End":
          this.onEndKey(t, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(t);
          break;
        case "PageUp":
          this.onPageUpKey(t);
          break;
        case "Space":
          this.onSpaceKey(t, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(t);
          break;
        case "Escape":
          this.onEscapeKey(t);
          break;
        case "Tab":
          this.onTabKey(t);
          break;
        case "Backspace":
          this.onBackspaceKey(t, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !s && Lt(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && _(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var s = this.searchOptions(t, n);
      !s && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && me(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? kt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      _(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? wt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      _(n);
    },
    onOptionSelect: function(t, n) {
      var s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var o = this.getOptionValue(n);
        this.updateModel(t, o), s && this.hide(!0);
      }
    },
    onOptionMouseMove: function(t, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(t, n);
    },
    onFilterChange: function(t) {
      var n = t.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: t,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(t) {
      if (!t.isComposing)
        switch (t.code) {
          case "ArrowDown":
            this.onArrowDownKey(t);
            break;
          case "ArrowUp":
            this.onArrowUpKey(t, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(t, !0);
            break;
          case "Home":
            this.onHomeKey(t, !0);
            break;
          case "End":
            this.onEndKey(t, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(t);
            break;
          case "Escape":
            this.onEscapeKey(t);
            break;
          case "Tab":
            this.onTabKey(t);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(t) {
      St.emit("overlay-click", {
        originalEvent: t,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(t) {
      switch (t.code) {
        case "Escape":
          this.onEscapeKey(t);
          break;
      }
    },
    onArrowDownKey: function(t) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(t, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, n);
      }
      t.preventDefault();
    },
    onArrowUpKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (t.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), t.preventDefault();
      else {
        var s = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, s), !this.overlayVisible && this.show(), t.preventDefault();
      }
    },
    onArrowLeftKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var s = t.currentTarget;
        t.shiftKey ? s.setSelectionRange(0, t.target.selectionStart) : (s.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(t, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onEndKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var s = t.currentTarget;
        if (t.shiftKey)
          s.setSelectionRange(t.target.selectionStart, s.value.length);
        else {
          var o = s.value.length;
          s.setSelectionRange(o, o), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(t, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onPageUpKey: function(t) {
      this.scrollInView(0), t.preventDefault();
    },
    onPageDownKey: function(t) {
      this.scrollInView(this.visibleOptions.length - 1), t.preventDefault();
    },
    onEnterKey: function(t) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(t)), t.preventDefault();
    },
    onSpaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(t);
    },
    onEscapeKey: function(t) {
      this.overlayVisible && this.hide(!0), t.preventDefault(), t.stopPropagation();
    },
    onTabKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (_(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      Se.set("overlay", t, this.$primevue.config.zIndex.overlay), Ot(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && _(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && _(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      Se.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? bt(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = yt(this.$el) + "px", It(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var s = n.composedPath();
        t.overlayVisible && t.overlay && !s.includes(t.$el) && !s.includes(t.overlay) && t.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var t = this;
      this.scrollHandler || (this.scrollHandler = new gt(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !vt() && t.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var t = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && be(n) && (this.labelClickListener = function() {
          _(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && be(t) && t.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var t = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          t.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return mt(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(t) {
      var n;
      return this.isValidOption(t) && typeof this.getOptionLabel(t) == "string" && ((n = this.getOptionLabel(t)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(t) {
      var n;
      return this.isValidOption(t) && typeof this.getOptionLabel(t) == "string" && ((n = this.getOptionLabel(t)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(t) {
      return me(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
    },
    isValidSelectedOption: function(t) {
      return this.isValidOption(t) && this.isSelected(t);
    },
    isSelected: function(t) {
      return ht(this.d_value, this.getOptionValue(t), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var t = this;
      return Fe(this.visibleOptions, function(n) {
        return t.isValidOption(n);
      });
    },
    findNextOptionIndex: function(t) {
      var n = this, s = t < this.visibleOptions.length - 1 ? this.visibleOptions.slice(t + 1).findIndex(function(o) {
        return n.isValidOption(o);
      }) : -1;
      return s > -1 ? s + t + 1 : t;
    },
    findPrevOptionIndex: function(t) {
      var n = this, s = t > 0 ? Fe(this.visibleOptions.slice(0, t), function(o) {
        return n.isValidOption(o);
      }) : -1;
      return s > -1 ? s : t;
    },
    findSelectedOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var t = this.findSelectedOptionIndex();
      return t < 0 ? this.findFirstOptionIndex() : t;
    },
    findLastFocusedOptionIndex: function() {
      var t = this.findSelectedOptionIndex();
      return t < 0 ? this.findLastOptionIndex() : t;
    },
    searchOptions: function(t, n) {
      var s = this;
      this.searchValue = (this.searchValue || "") + n;
      var o = -1, i = !1;
      return me(this.searchValue) && (o = this.visibleOptions.findIndex(function(r) {
        return s.isOptionExactMatched(r);
      }), o === -1 && (o = this.visibleOptions.findIndex(function(r) {
        return s.isOptionStartsWith(r);
      })), o !== -1 && (i = !0), o === -1 && this.focusedOptionIndex === -1 && (o = this.findFirstFocusedOptionIndex()), o !== -1 && this.changeFocusedOptionIndex(t, o)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        s.searchValue = "", s.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var s = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, o = He(t.list, 'li[id="'.concat(s, '"]'));
        o ? o.scrollIntoView && o.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : t.virtualScrollerDisabled || t.virtualScroller && t.virtualScroller.scrollToIndex(n !== -1 ? n : t.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(t, n) {
      this.writeValue(n, t), this.$emit("change", {
        originalEvent: t,
        value: n
      });
    },
    flatOptions: function(t) {
      var n = this;
      return (t || []).reduce(function(s, o, i) {
        s.push({
          optionGroup: o,
          group: !0,
          index: i
        });
        var r = n.getOptionGroupChildren(o);
        return r && r.forEach(function(f) {
          return s.push(f);
        }), s;
      }, []);
    },
    overlayRef: function(t) {
      this.overlay = t;
    },
    listRef: function(t, n) {
      this.list = t, n && n(t);
    },
    virtualScrollerRef: function(t) {
      this.virtualScroller = t;
    }
  },
  computed: {
    visibleOptions: function() {
      var t = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var s = ft.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var o = this.options || [], i = [];
          return o.forEach(function(r) {
            var f = t.getOptionGroupChildren(r), p = f.filter(function(d) {
              return s.includes(d);
            });
            p.length > 0 && i.push(De(De({}, r), {}, J({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", En(p))));
          }), this.flatOptions(i);
        }
        return s;
      }
      return n;
    },
    // @deprecated use $filled instead
    hasSelectedOption: function() {
      return this.$filled;
    },
    label: function() {
      var t = this.findSelectedOptionIndex();
      return t !== -1 ? this.getOptionLabel(this.visibleOptions[t]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var t = this.findSelectedOptionIndex();
      return t !== -1 ? this.getOptionLabel(this.visibleOptions[t]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return me(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      var t = this;
      return this.visibleOptions.filter(function(n) {
        return !t.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return re(J({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return re(J(J({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return re(J({}, this.size, this.size));
    },
    overlayDataP: function() {
      return re(J({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: pt
  },
  components: {
    InputText: Ye,
    VirtualScroller: Xe,
    Portal: ct,
    InputIcon: Ze,
    IconField: qe,
    TimesIcon: We,
    ChevronDownIcon: _e,
    SpinnerIcon: je,
    SearchIcon: Ge,
    CheckIcon: Ne,
    BlankIcon: Ue
  }
}, Un = ["id", "data-p"], Nn = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], _n = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], Gn = ["data-p"], Wn = ["id"], qn = ["id"], Zn = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Jn(e, t, n, s, o, i) {
  var r = N("SpinnerIcon"), f = N("InputText"), p = N("SearchIcon"), d = N("InputIcon"), u = N("IconField"), a = N("CheckIcon"), l = N("BlankIcon"), c = N("VirtualScroller"), S = N("Portal"), $ = it("ripple");
  return h(), b("div", g({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, e.ptmi("root")), [e.editable ? (h(), b("input", g({
    key: 0,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    type: "text",
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    value: i.editableInputValue,
    placeholder: e.placeholder,
    tabindex: e.disabled ? -1 : e.tabindex,
    disabled: e.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": o.overlayVisible,
    "aria-controls": o.overlayVisible ? e.$id + "_list" : void 0,
    "aria-activedescendant": o.focused ? i.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: t[2] || (t[2] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    onInput: t[3] || (t[3] = function() {
      return i.onEditableInput && i.onEditableInput.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, e.ptm("label")), null, 16, Nn)) : (h(), b("span", g({
    key: 1,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    tabindex: e.disabled ? -1 : e.tabindex,
    role: "combobox",
    "aria-label": e.ariaLabel || (i.label === "p-emptylabel" ? void 0 : i.label),
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": o.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": o.focused ? i.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    "aria-disabled": e.disabled,
    onFocus: t[4] || (t[4] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[5] || (t[5] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: t[6] || (t[6] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, e.ptm("label")), [T(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var w;
    return [W(E(i.label === "p-emptylabel" ? " " : (w = i.label) !== null && w !== void 0 ? w : "empty"), 1)];
  })], 16, _n)), i.isClearIconVisible ? T(e.$slots, "clearicon", {
    key: 2,
    class: Y(e.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(h(), G(Te(e.clearIcon ? "i" : "TimesIcon"), g({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: i.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : M("", !0), I("div", g({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? T(e.$slots, "loadingicon", {
    key: 0,
    class: Y(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (h(), b("span", g({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (h(), G(r, g({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : T(e.$slots, "dropdownicon", {
    key: 1,
    class: Y(e.cx("dropdownIcon"))
  }, function() {
    return [(h(), G(Te(e.dropdownIcon ? "span" : "ChevronDownIcon"), g({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), v(S, {
    appendTo: e.appendTo
  }, {
    default: z(function() {
      return [v(st, g({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: z(function() {
          return [o.overlayVisible ? (h(), b("div", g({
            key: 0,
            ref: i.overlayRef,
            class: [e.cx("overlay"), e.panelClass, e.overlayClass],
            style: [e.panelStyle, e.overlayStyle],
            onClick: t[10] || (t[10] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            }),
            onKeydown: t[11] || (t[11] = function() {
              return i.onOverlayKeyDown && i.onOverlayKeyDown.apply(i, arguments);
            }),
            "data-p": i.overlayDataP
          }, e.ptm("overlay")), [I("span", g({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[7] || (t[7] = function() {
              return i.onFirstHiddenFocus && i.onFirstHiddenFocus.apply(i, arguments);
            })
          }, e.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), T(e.$slots, "header", {
            value: e.d_value,
            options: i.visibleOptions
          }), e.filter ? (h(), b("div", g({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [v(u, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: z(function() {
              return [v(f, {
                ref: "filterInput",
                type: "text",
                value: o.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: Y(e.cx("pcFilter")),
                placeholder: e.filterPlaceholder,
                variant: e.variant,
                unstyled: e.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": e.$id + "_list",
                "aria-activedescendant": i.focusedOptionId,
                onKeydown: i.onFilterKeyDown,
                onBlur: i.onFilterBlur,
                onInput: i.onFilterChange,
                pt: e.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), v(d, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: z(function() {
                  return [T(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (h(), b("span", g({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (h(), G(p, ot(g({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), I("span", g({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), E(i.filterResultMessageText), 17)], 16)) : M("", !0), I("div", g({
            class: e.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [v(c, g({
            ref: i.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), rt({
            content: z(function(w) {
              var L = w.styleClass, A = w.contentRef, B = w.items, C = w.getItemOptions, j = w.contentStyle, D = w.itemSize;
              return [I("ul", g({
                ref: function(V) {
                  return i.listRef(V, A);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), L],
                style: j,
                role: "listbox"
              }, e.ptm("list")), [(h(!0), b(q, null, le(B, function(x, V) {
                return h(), b(q, {
                  key: i.getOptionRenderKey(x, i.getOptionIndex(V, C))
                }, [i.isOptionGroup(x) ? (h(), b("li", g({
                  key: 0,
                  id: e.$id + "_" + i.getOptionIndex(V, C),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [T(e.$slots, "optiongroup", {
                  option: x.optionGroup,
                  index: i.getOptionIndex(V, C)
                }, function() {
                  return [I("span", g({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), E(i.getOptionGroupLabel(x.optionGroup)), 17)];
                })], 16, qn)) : ye((h(), b("li", g({
                  key: 1,
                  id: e.$id + "_" + i.getOptionIndex(V, C),
                  class: e.cx("option", {
                    option: x,
                    focusedOption: i.getOptionIndex(V, C)
                  }),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(x),
                  "aria-selected": i.isSelected(x),
                  "aria-disabled": i.isOptionDisabled(x),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(V, C)),
                  onMousedown: function(m) {
                    return i.onOptionSelect(m, x);
                  },
                  onMousemove: function(m) {
                    return i.onOptionMouseMove(m, i.getOptionIndex(V, C));
                  },
                  onClick: t[8] || (t[8] = ze(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && i.isSelected(x),
                  "data-p-focused": o.focusedOptionIndex === i.getOptionIndex(V, C),
                  "data-p-disabled": i.isOptionDisabled(x)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(x, C, V, "option")), [e.checkmark ? (h(), b(q, {
                  key: 0
                }, [i.isSelected(x) ? (h(), G(a, g({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (h(), G(l, g({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : M("", !0), T(e.$slots, "option", {
                  option: x,
                  selected: i.isSelected(x),
                  index: i.getOptionIndex(V, C)
                }, function() {
                  return [I("span", g({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), E(i.getOptionLabel(x)), 17)];
                })], 16, Zn)), [[$]])], 64);
              }), 128)), o.filterValue && (!B || B && B.length === 0) ? (h(), b("li", g({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [T(e.$slots, "emptyfilter", {}, function() {
                return [W(E(i.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (h(), b("li", g({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [T(e.$slots, "empty", {}, function() {
                return [W(E(i.emptyMessageText), 1)];
              })], 16)) : M("", !0)], 16, Wn)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: z(function(w) {
              var L = w.options;
              return [T(e.$slots, "loader", {
                options: L
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), T(e.$slots, "footer", {
            value: e.d_value,
            options: i.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (h(), b("span", g({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), E(i.emptyMessageText), 17)) : M("", !0), I("span", g({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), E(i.selectedMessageText), 17), I("span", g({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[9] || (t[9] = function() {
              return i.onLastHiddenFocus && i.onLastHiddenFocus.apply(i, arguments);
            })
          }, e.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, Gn)) : M("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, Un);
}
et.render = Jn;
const Yn = /* @__PURE__ */ ee({
  __name: "SelectField",
  props: {
    modelValue: {},
    options: {},
    ariaLabel: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, o) => (h(), G(O(et), {
      class: "km-select",
      "model-value": e.modelValue,
      options: e.options,
      "option-label": "label",
      "option-value": "value",
      "aria-label": e.ariaLabel,
      placeholder: e.placeholder,
      "onUpdate:modelValue": o[0] || (o[0] = (i) => n("update:modelValue", i))
    }, null, 8, ["model-value", "options", "aria-label", "placeholder"]));
  }
}), Qn = { class: "km-taginput-wrap" }, Xn = { class: "km-tag-label" }, ei = ["title", "aria-label", "disabled", "onClick"], ti = ["placeholder", "disabled"], ni = {
  key: 0,
  class: "km-tag-sug"
}, ii = ["disabled", "onClick"], Ke = /* @__PURE__ */ ee({
  __name: "TagInput",
  props: {
    modelValue: {},
    suggestions: { default: () => [] },
    placeholder: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, s = t, o = F(""), i = F(null), r = ve(() => {
      const u = o.value.trim().toLowerCase();
      return n.suggestions.filter((a) => !n.modelValue.includes(a)).filter((a) => !u || a.toLowerCase().includes(u));
    });
    function f(u) {
      const a = u.trim();
      if (!a || n.modelValue.includes(a)) {
        o.value = "";
        return;
      }
      s("update:modelValue", [...n.modelValue, a]), o.value = "", i.value?.focus();
    }
    function p(u) {
      s("update:modelValue", n.modelValue.filter((a) => a !== u));
    }
    function d(u) {
      u.key === "Enter" || u.key === "," ? (u.preventDefault(), f(o.value || r.value[0] || "")) : u.key === "Backspace" && !o.value && n.modelValue.length && p(n.modelValue[n.modelValue.length - 1]);
    }
    return (u, a) => (h(), b("div", Qn, [
      I("div", {
        class: Y(["km-taginput", { disabled: e.disabled }]),
        onClick: a[1] || (a[1] = (l) => i.value?.focus())
      }, [
        (h(!0), b(q, null, le(e.modelValue, (l) => (h(), b("span", {
          key: l,
          class: "km-tag"
        }, [
          I("span", Xn, E(l), 1),
          I("button", {
            type: "button",
            class: "km-tag-x",
            title: `Remove ${l}`,
            "aria-label": `Remove ${l}`,
            disabled: e.disabled,
            onClick: ze((c) => p(l), ["stop"])
          }, [
            v(O(ae), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ], 8, ei)
        ]))), 128)),
        ye(I("input", {
          ref_key: "inputEl",
          ref: i,
          "onUpdate:modelValue": a[0] || (a[0] = (l) => o.value = l),
          class: "km-tag-field",
          type: "text",
          placeholder: e.modelValue.length ? "" : e.placeholder || "Add…",
          disabled: e.disabled,
          spellcheck: "false",
          autocomplete: "off",
          onKeydown: d
        }, null, 40, ti), [
          [Re, o.value]
        ])
      ], 2),
      r.value.length ? (h(), b("div", ni, [
        (h(!0), b(q, null, le(r.value, (l) => (h(), b("button", {
          key: l,
          type: "button",
          class: "km-tag-sug-item",
          disabled: e.disabled,
          onClick: (c) => f(l)
        }, [
          v(O(ae), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          }),
          W(" " + E(l), 1)
        ], 8, ii))), 128))
      ])) : M("", !0)
    ]));
  }
}), si = { class: "km-notice-text" }, oi = /* @__PURE__ */ ee({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t;
    return (s, o) => (h(), b("div", {
      class: Y(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      v(O(ae), {
        icon: e.severity === "danger" ? "tabler:alert-triangle" : "tabler:info-circle",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      I("span", si, [
        T(s.$slots, "default")
      ]),
      I("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: o[0] || (o[0] = (i) => n("dismiss"))
      }, [
        v(O(ae), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
});
var ri = `
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
`, li = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, ai = te.extend({
  name: "progressspinner",
  style: ri,
  classes: li
}), di = {
  name: "BaseProgressSpinner",
  extends: Ie,
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
  style: ai,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, tt = {
  name: "ProgressSpinner",
  extends: di,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, ui = ["fill", "stroke-width"];
function ci(e, t, n, s, o, i) {
  return h(), b("div", g({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(h(), b("svg", g({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: i.svgStyle
  }, e.ptm("spin")), [I("circle", g({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, ui)], 16))], 16);
}
tt.render = ci;
const pi = { class: "km-loading" }, fi = { key: 0 }, Di = /* @__PURE__ */ ee({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (h(), b("div", pi, [
      v(O(tt), {
        style: { width: "2rem", height: "2rem", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (h(), b("span", fi, E(e.label), 1)) : M("", !0)
    ]));
  }
}), hi = "wippy.llm.openai_compat:provider";
function Ki(e) {
  return e === "healthy" ? "success" : e === "unhealthy" ? "danger" : e === "degraded" ? "warn" : "secondary";
}
const mi = {
  healthy: "Healthy",
  unhealthy: "Unhealthy",
  degraded: "Degraded"
};
function Ri(e) {
  return e && mi[e] || "Unknown";
}
function Hi(e) {
  return e === "registry" ? "info" : e === "discovered" ? "success" : e === "overlay" ? "warn" : "secondary";
}
function ji(e) {
  return e === "registry" ? "built-in" : e || "model";
}
function Ui(e) {
  return !e || e <= 0 ? "Unknown" : e >= 1e3 ? `${Math.round(e / 1e3)}k` : String(e);
}
function Ni(e) {
  return e.icon || "tabler:plug";
}
const vi = {
  tools: "tabler:tool",
  tool_use: "tabler:tool",
  function_calling: "tabler:tool",
  vision: "tabler:eye",
  image: "tabler:photo",
  images: "tabler:photo",
  multimodal: "tabler:photo",
  embed: "tabler:vector",
  embedding: "tabler:vector",
  embeddings: "tabler:vector",
  audio: "tabler:microphone",
  speech: "tabler:microphone",
  reasoning: "tabler:bulb",
  thinking: "tabler:bulb"
};
function _i(e) {
  return vi[e.toLowerCase()] || "";
}
function Gi(e) {
  return e.provider_id === hi;
}
function Wi(e) {
  const t = e.config || {};
  return t.base_url || t.region || t.location || "default endpoint";
}
function qi(e) {
  return !!(e.has_api_key || e.has_api_key_env || e.secret_fields?.length);
}
function Zi(e, t) {
  const n = e.options?.[t];
  return n == null || n === "" ? "" : String(n);
}
function Ji(e, t) {
  const n = (o) => e().find((i) => i.id === o), s = (o) => t().find((i) => i.id === o);
  return {
    adapterFor: n,
    profileFor: s,
    adapterTitle: (o) => n(o)?.title || o || "",
    profileTitle: (o) => s(o)?.name || o || "",
    isDiscoverable: (o) => n(o.provider_id)?.discoverable === !0,
    providerIcon: (o, i) => {
      const r = s(i);
      return r?.provider_id === o && r?.icon || n(o)?.icon || "tabler:cpu";
    }
  };
}
const gi = { class: "km-form-sec" }, bi = { class: "km-form-id" }, yi = { class: "km-form-sec" }, Ii = { class: "km-form-grid" }, Oi = { class: "km-form-sec" }, Si = { class: "km-form-sec" }, wi = { class: "km-form-grid" }, ki = { class: "km-form-grid" }, Ci = { class: "km-form-sec" }, Li = {
  key: 0,
  class: "km-adv-body"
}, xi = { class: "km-form-grid" }, Vi = ["disabled"], zi = { class: "km-form-foot" }, Yi = /* @__PURE__ */ ee({
  __name: "ModelEditor",
  props: {
    model: {},
    profiles: {},
    saving: { type: Boolean },
    capabilityOptions: {},
    classOptions: {}
  },
  emits: ["save", "cancel"],
  setup(e, { emit: t }) {
    const n = e, s = t, o = F(""), i = F(!1), r = lt({
      name: "",
      title: "",
      description: "",
      provider_id: "",
      provider_profile_id: "",
      provider_model: "",
      capabilities: [],
      classes: [],
      priority: 10,
      max_tokens: "",
      output_tokens: "",
      dimensions: "",
      reasoning_model_request: !1,
      thinking_effort: "",
      temperature: "",
      options_json: "{}",
      source: "overlay",
      enabled: !0
    });
    ge(() => n.model, (a) => {
      if (o.value = "", i.value = !1, !a) return;
      const l = a.options ?? {};
      r.name = a.name, r.title = a.title || a.name, r.description = a.description || "", r.provider_id = a.provider_id || "", r.provider_profile_id = a.provider_profile_id || "", r.provider_model = a.provider_model || a.name, r.capabilities = [...a.capabilities ?? []], r.classes = [...a.class ?? []], r.priority = Number(a.priority ?? 10), r.max_tokens = String(a.max_tokens ?? ""), r.output_tokens = String(a.output_tokens ?? ""), r.dimensions = String(a.dimensions ?? ""), r.reasoning_model_request = l.reasoning_model_request === !0, r.thinking_effort = typeof l.thinking_effort == "string" || typeof l.thinking_effort == "number" ? l.thinking_effort : "", r.temperature = l.temperature === void 0 ? "" : String(l.temperature), r.options_json = JSON.stringify(l, null, 2), r.source = a.source === "registry" ? "overlay" : a.source || "overlay", r.enabled = a.enabled !== !1;
    }, { immediate: !0 });
    const f = ve(() => n.capabilityOptions ?? []), p = ve(() => n.classOptions ?? []), d = ve(() => [
      { label: "Registry default", value: "" },
      ...n.profiles.map((a) => ({ label: a.name, value: a.id }))
    ]);
    function u() {
      o.value = "";
      let a = {};
      try {
        a = JSON.parse(r.options_json || "{}");
      } catch {
        o.value = "model options JSON is invalid", i.value = !0;
        return;
      }
      r.reasoning_model_request ? a.reasoning_model_request = !0 : delete a.reasoning_model_request;
      const l = String(r.thinking_effort).trim(), c = Number(l);
      if (l === "" || Number.isFinite(c) && c <= 0 ? delete a.thinking_effort : a.thinking_effort = Number.isFinite(c) ? c : l, r.temperature !== "") {
        const S = Number(r.temperature);
        if (!Number.isFinite(S) || S < 0 || S > 2) {
          o.value = "temperature must be between 0 and 2";
          return;
        }
        a.temperature = S;
      } else
        delete a.temperature;
      s("save", {
        name: r.name,
        title: r.title,
        description: r.description,
        provider_id: r.provider_id,
        provider_profile_id: r.provider_profile_id || void 0,
        provider_model: r.provider_model,
        capabilities: [...r.capabilities],
        classes: [...r.classes],
        priority: Number(r.priority),
        max_tokens: r.max_tokens === String(n.model?.max_tokens ?? "") ? void 0 : r.max_tokens,
        output_tokens: r.output_tokens === String(n.model?.output_tokens ?? "") ? void 0 : r.output_tokens,
        dimensions: r.dimensions === String(n.model?.dimensions ?? "") ? void 0 : r.dimensions,
        options: a,
        source: r.source,
        enabled: r.enabled
      });
    }
    return (a, l) => (h(), b("form", {
      class: "km-form",
      onSubmit: ze(u, ["prevent"])
    }, [
      o.value ? (h(), G(O(oi), {
        key: 0,
        severity: "danger",
        onDismiss: l[0] || (l[0] = (c) => o.value = "")
      }, {
        default: z(() => [
          W(E(o.value), 1)
        ]),
        _: 1
      })) : M("", !0),
      I("section", gi, [
        l[20] || (l[20] = I("div", { class: "km-form-sec-title" }, "Identity", -1)),
        v(O(P), { label: "Title" }, {
          default: z(() => [
            v(O(H), {
              modelValue: r.title,
              "onUpdate:modelValue": l[1] || (l[1] = (c) => r.title = c),
              disabled: e.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        v(O(P), { label: "Description" }, {
          default: z(() => [
            v(O(H), {
              modelValue: r.description,
              "onUpdate:modelValue": l[2] || (l[2] = (c) => r.description = c),
              disabled: e.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        I("div", bi, E(r.name), 1)
      ]),
      I("section", yi, [
        l[21] || (l[21] = I("div", { class: "km-form-sec-title" }, "Routing", -1)),
        I("div", Ii, [
          v(O(P), { label: "Provider profile" }, {
            default: z(() => [
              v(O(Yn), {
                modelValue: r.provider_profile_id,
                "onUpdate:modelValue": l[3] || (l[3] = (c) => r.provider_profile_id = c),
                options: d.value,
                "aria-label": "Provider profile"
              }, null, 8, ["modelValue", "options"])
            ]),
            _: 1
          }),
          v(O(P), { label: "Provider model" }, {
            default: z(() => [
              v(O(H), {
                modelValue: r.provider_model,
                "onUpdate:modelValue": l[4] || (l[4] = (c) => r.provider_model = c),
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      I("section", Oi, [
        l[22] || (l[22] = I("div", { class: "km-form-sec-title" }, "Capabilities & classes", -1)),
        v(O(P), { label: "Capabilities" }, {
          default: z(() => [
            v(O(Ke), {
              modelValue: r.capabilities,
              "onUpdate:modelValue": l[5] || (l[5] = (c) => r.capabilities = c),
              suggestions: f.value,
              placeholder: "Add a capability…",
              disabled: e.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        }),
        v(O(P), { label: "Classes" }, {
          default: z(() => [
            v(O(Ke), {
              modelValue: r.classes,
              "onUpdate:modelValue": l[6] || (l[6] = (c) => r.classes = c),
              suggestions: p.value,
              placeholder: "Add a class…",
              disabled: e.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        })
      ]),
      I("section", Si, [
        l[23] || (l[23] = I("div", { class: "km-form-sec-title" }, "Request options", -1)),
        v(O(Ae), {
          modelValue: r.reasoning_model_request,
          "onUpdate:modelValue": l[7] || (l[7] = (c) => r.reasoning_model_request = c),
          label: "Reasoning model",
          disabled: e.saving
        }, null, 8, ["modelValue", "disabled"]),
        I("div", wi, [
          v(O(P), { label: "Thinking effort" }, {
            default: z(() => [
              v(O(H), {
                modelValue: r.thinking_effort,
                "onUpdate:modelValue": l[8] || (l[8] = (c) => r.thinking_effort = c),
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          v(O(P), {
            label: "Temperature",
            help: "0–2; blank to leave unset."
          }, {
            default: z(() => [
              v(O(H), {
                modelValue: r.temperature,
                "onUpdate:modelValue": l[9] || (l[9] = (c) => r.temperature = c),
                type: "number",
                min: 0,
                max: 2,
                step: 0.1,
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ]),
        I("div", ki, [
          v(O(P), { label: "Context" }, {
            default: z(() => [
              v(O(H), {
                modelValue: r.max_tokens,
                "onUpdate:modelValue": l[10] || (l[10] = (c) => r.max_tokens = c),
                type: "number",
                placeholder: "Unknown",
                min: 1,
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          v(O(P), { label: "Output" }, {
            default: z(() => [
              v(O(H), {
                modelValue: r.output_tokens,
                "onUpdate:modelValue": l[11] || (l[11] = (c) => r.output_tokens = c),
                type: "number",
                placeholder: "Unknown",
                min: 1,
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      I("section", Ci, [
        I("button", {
          type: "button",
          class: Y(["km-adv-toggle", { open: i.value }]),
          onClick: l[12] || (l[12] = (c) => i.value = !i.value)
        }, [
          v(O(ae), {
            icon: "tabler:chevron-right",
            class: "km-adv-chev",
            "aria-hidden": "true"
          }),
          l[24] || (l[24] = W(" Advanced ", -1))
        ], 2),
        i.value ? (h(), b("div", Li, [
          I("div", xi, [
            v(O(P), { label: "Provider id" }, {
              default: z(() => [
                v(O(H), {
                  modelValue: r.provider_id,
                  "onUpdate:modelValue": l[13] || (l[13] = (c) => r.provider_id = c),
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            v(O(P), { label: "Source" }, {
              default: z(() => [
                v(O(H), {
                  modelValue: r.source,
                  "onUpdate:modelValue": l[14] || (l[14] = (c) => r.source = c),
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            v(O(P), { label: "Priority" }, {
              default: z(() => [
                v(O(H), {
                  modelValue: r.priority,
                  "onUpdate:modelValue": l[15] || (l[15] = (c) => r.priority = c),
                  type: "number",
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            v(O(P), { label: "Dimensions" }, {
              default: z(() => [
                v(O(H), {
                  modelValue: r.dimensions,
                  "onUpdate:modelValue": l[16] || (l[16] = (c) => r.dimensions = c),
                  type: "number",
                  placeholder: "Unknown",
                  min: 1,
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            })
          ]),
          v(O(P), {
            label: "Options JSON",
            help: "Raw provider options; merged with the controls above."
          }, {
            default: z(() => [
              ye(I("textarea", {
                "onUpdate:modelValue": l[17] || (l[17] = (c) => r.options_json = c),
                class: "km-input mono km-textarea",
                disabled: e.saving
              }, null, 8, Vi), [
                [Re, r.options_json]
              ])
            ]),
            _: 1
          })
        ])) : M("", !0)
      ]),
      v(O(Ae), {
        modelValue: r.enabled,
        "onUpdate:modelValue": l[18] || (l[18] = (c) => r.enabled = c),
        label: "Enabled",
        disabled: e.saving
      }, null, 8, ["modelValue", "disabled"]),
      I("div", zi, [
        v(O(Me), {
          variant: "ghost",
          disabled: e.saving,
          onClick: l[19] || (l[19] = (c) => s("cancel"))
        }, {
          default: z(() => [...l[25] || (l[25] = [
            W("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        v(O(Me), {
          type: "submit",
          icon: "tabler:device-floppy",
          loading: e.saving
        }, {
          default: z(() => [
            W(E(e.saving ? "Saving" : "Save model"), 1)
          ]),
          _: 1
        }, 8, ["loading"])
      ])
    ], 32));
  }
}), $i = { class: "km-external-editor" }, Ti = {
  key: 0,
  class: "km-empty"
}, Fi = {
  key: 1,
  class: "km-test-result fail"
}, Qi = /* @__PURE__ */ ee({
  __name: "ExternalProviderEditor",
  props: {
    tag: {},
    mode: {},
    adapter: {},
    preset: {},
    profile: {},
    saving: { type: Boolean },
    testState: {}
  },
  emits: ["save", "cancel", "test"],
  setup(e, { emit: t }) {
    const n = e, s = t, o = F(null), i = F(!1), r = F(""), f = F("");
    let p = null, d = 0;
    function u(w) {
      s("save", { ...w.detail || {}, icon: f.value });
    }
    function a() {
      s("cancel");
    }
    function l() {
      s("test");
    }
    function c() {
      p && (p.removeEventListener("save", u), p.removeEventListener("cancel", a), p.removeEventListener("test", l), p.remove(), p = null);
    }
    function S() {
      p && Object.assign(p, {
        mode: n.mode,
        adapter: n.adapter,
        preset: n.preset,
        profile: n.profile,
        saving: n.saving === !0,
        testState: n.testState
      });
    }
    async function $() {
      const w = ++d;
      if (c(), r.value = "", !(!o.value || !n.tag)) {
        i.value = !0;
        try {
          if (await zt(n.tag, { timeoutMs: 8e3 }), w !== d || !o.value) return;
          const L = document.createElement(n.tag);
          L.addEventListener("save", u), L.addEventListener("cancel", a), L.addEventListener("test", l), p = L, S(), o.value.replaceChildren(L);
        } catch (L) {
          w === d && (r.value = L instanceof Error ? L.message : String(L));
        } finally {
          w === d && (i.value = !1);
        }
      }
    }
    return ge(() => [n.mode, n.profile, n.preset], () => {
      f.value = n.mode === "edit" ? n.profile?.icon || "" : n.preset?.icon || "";
    }, { immediate: !0 }), at($), ge(() => n.tag, $), ge(() => [n.mode, n.adapter, n.preset, n.profile, n.saving, n.testState], S), dt(() => {
      d++, c();
    }), (w, L) => (h(), b("div", $i, [
      i.value ? (h(), b("div", Ti, "Loading provider editor…")) : M("", !0),
      r.value ? (h(), b("div", Fi, [
        I("span", null, "Provider editor failed to load: " + E(r.value), 1),
        I("button", {
          type: "button",
          class: "km-adv-toggle",
          onClick: $
        }, "Retry")
      ])) : M("", !0),
      !i.value && !r.value ? (h(), G(Vt, {
        key: 2,
        modelValue: f.value,
        "onUpdate:modelValue": L[0] || (L[0] = (A) => f.value = A),
        fallback: e.adapter?.icon,
        disabled: e.saving
      }, null, 8, ["modelValue", "fallback", "disabled"])) : M("", !0),
      ye(I("div", {
        ref_key: "host",
        ref: o
      }, null, 512), [
        [ut, !i.value && !r.value]
      ])
    ]));
  }
});
function X(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function Xi() {
  const e = F([]), t = F([]), n = F([]), s = F([]), o = F([]), i = F(!0), r = F(!1), f = F(""), p = F(""), d = F("");
  let u = 0, a = 0;
  async function l() {
    const y = ++u;
    i.value = !0, d.value = "";
    try {
      const { data: m } = await R.get("/api/v1/models/admin");
      if (y !== u) return;
      e.value = m.adapters ?? [], t.value = m.presets ?? [], n.value = m.profiles ?? [], s.value = m.models ?? [];
    } catch (m) {
      y === u && (d.value = X(m, "failed to load models"));
    } finally {
      y === u && (i.value = !1);
    }
  }
  async function c() {
    const y = ++a;
    try {
      const { data: m } = await R.get("/api/v1/models/classes");
      y === a && (o.value = m.classes ?? []);
    } catch {
      y === a && (o.value = []);
    }
  }
  async function S(y, m) {
    r.value = !0, d.value = "";
    try {
      return await y(), await l(), !0;
    } catch (k) {
      return d.value = X(k, m), !1;
    } finally {
      r.value = !1;
    }
  }
  function $(y, m, k) {
    return S(async () => {
      y === "edit" ? await R.put(`/api/v1/models/provider-profiles/${encodeURIComponent(m)}`, k) : await R.post("/api/v1/models/provider-profiles", k);
    }, "failed to save profile");
  }
  function w(y) {
    return S(() => R.delete(`/api/v1/models/provider-profiles/${encodeURIComponent(y)}`).then(() => {
    }), "failed to delete profile");
  }
  function L(y) {
    return S(() => R.put("/api/v1/models/cards", y).then(() => {
    }), "failed to save model");
  }
  function A(y) {
    return y.length ? S(async () => {
      for (const m of y) await R.put("/api/v1/models/cards", m);
    }, "failed to save models") : Promise.resolve(!0);
  }
  function B(y) {
    return S(() => R.delete(`/api/v1/models/cards?name=${encodeURIComponent(y)}`).then(() => {
    }), "failed to delete model");
  }
  async function C() {
    d.value = "";
    try {
      const { data: y } = await R.get("/api/v1/models/export");
      return y;
    } catch (y) {
      return d.value = X(y, "failed to export models"), null;
    }
  }
  async function j(y) {
    let m = null;
    return await S(async () => {
      const { data: K } = await R.post("/api/v1/models/import", y);
      m = K;
    }, "failed to import models") ? m : null;
  }
  async function D(y) {
    f.value = y, d.value = "";
    try {
      const { data: m } = await R.post(`/api/v1/models/provider-profiles/${encodeURIComponent(y)}/discover`, {});
      return await l(), m && m.success === !1 ? (d.value = m.error || "connection failed", { ok: !1, message: d.value }) : { ok: !0, message: "Connection succeeded" };
    } catch (m) {
      return d.value = X(m, "connection failed"), { ok: !1, message: d.value };
    } finally {
      f.value = "";
    }
  }
  async function x(y) {
    d.value = "";
    try {
      const { data: m } = await R.post(`/api/v1/models/provider-profiles/${encodeURIComponent(y)}/test`, {});
      return await l(), m && m.success === !1 ? (d.value = m.error || "connection test failed", { ok: !1, message: d.value }) : { ok: !0, message: m?.message || "Connection test succeeded" };
    } catch (m) {
      const k = X(m, "connection test failed");
      return await l(), d.value = k, { ok: !1, message: k };
    }
  }
  async function V(y) {
    p.value = y, d.value = "";
    try {
      const { data: m } = await R.post("/api/v1/models/cards/test", { name: y });
      if (m && m.success === !1) {
        const k = m.error || m.message || "model probe failed";
        return { ok: !1, message: k, data: { ...m, error: m.error || m.message || k } };
      }
      return { ok: !0, message: "Model works", data: m };
    } catch (m) {
      const k = X(m, "model probe failed");
      return { ok: !1, message: k, data: { success: !1, model: y, error: k } };
    } finally {
      p.value = "";
    }
  }
  return {
    adapters: e,
    presets: t,
    profiles: n,
    models: s,
    classes: o,
    loading: i,
    saving: r,
    discovering: f,
    probing: p,
    error: d,
    load: l,
    loadClasses: c,
    saveProfile: $,
    deleteProfile: w,
    saveCard: L,
    saveCards: A,
    deleteCard: B,
    discover: D,
    testProfile: x,
    testModel: V,
    exportSetup: C,
    importSetup: j
  };
}
export {
  Yn as _,
  Ri as a,
  Ki as b,
  Hi as c,
  ji as d,
  _i as e,
  Ui as f,
  Ni as g,
  qi as h,
  Gi as i,
  oi as j,
  Di as k,
  Qi as l,
  Ji as m,
  Yi as n,
  Zi as o,
  Wi as p,
  We as s,
  Xi as u
};
//# sourceMappingURL=useModelsApi-Df0MsoJU.js.map
