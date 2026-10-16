import { a as Ze, c as Ye, b as Je, W as Qe } from "./useSessionsApi-WrUiyRNa.js";
import { A as Xe, s as et, a as be, B as me, b as ge, c as se, f as de, d as Ae, z as Me, e as ye, R as re, T as le, g as tt, h as nt, F as it, M as $e, k as st, i as ot, j as G, Y as rt, I as lt, v as at, D as dt, S as ut, L as ct, l as pt, $ as ft, J as ht, p as ne, m as mt, P as vt } from "./styles-DUbfgJ3E.js";
import { openBlock as h, createElementBlock as v, mergeProps as f, createElementVNode as I, renderSlot as $, resolveComponent as N, Fragment as oe, renderList as Oe, createCommentVNode as R, createVNode as D, resolveDirective as yt, createTextVNode as ue, toDisplayString as M, normalizeClass as Q, createBlock as ie, resolveDynamicComponent as xe, withCtx as W, Transition as bt, normalizeProps as gt, createSlots as It, withDirectives as Ee, withModifiers as Ot, defineComponent as St, ref as q, computed as wt, onMounted as Ct, onBeforeUnmount as kt, unref as Z, vShow as Lt } from "vue";
import { Icon as ve } from "@iconify/vue";
import { on as ze, define as $t } from "@wippy-fe/proxy";
import { s as xt, x as Ie } from "./index-D3S3Ui1l.js";
import { a as Y } from "./artifactPresentation-Dgf5Fs_k.js";
function ce(t) {
  "@babel/helpers - typeof";
  return ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ce(t);
}
function zt(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function Ft(t, e) {
  for (var n = 0; n < e.length; n++) {
    var i = e[n];
    i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(t, Tt(i.key), i);
  }
}
function Vt(t, e, n) {
  return e && Ft(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function Tt(t) {
  var e = Pt(t, "string");
  return ce(e) == "symbol" ? e : e + "";
}
function Pt(t, e) {
  if (ce(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (ce(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var At = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    zt(this, t), this.element = e, this.listener = n;
  }
  return Vt(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Xe(this.element);
      for (var n = 0; n < this.scrollableParents.length; n++)
        this.scrollableParents[n].addEventListener("scroll", this.listener);
    }
  }, {
    key: "unbindScrollListener",
    value: function() {
      if (this.scrollableParents)
        for (var n = 0; n < this.scrollableParents.length; n++)
          this.scrollableParents[n].removeEventListener("scroll", this.listener);
    }
  }, {
    key: "destroy",
    value: function() {
      this.unbindScrollListener(), this.element = null, this.listener = null, this.scrollableParents = null;
    }
  }]);
})(), Mt = et(), Be = {
  name: "BlankIcon",
  extends: be
};
function Et(t) {
  return Ht(t) || Dt(t) || Kt(t) || Bt();
}
function Bt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kt(t, e) {
  if (t) {
    if (typeof t == "string") return Se(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Se(t, e) : void 0;
  }
}
function Dt(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ht(t) {
  if (Array.isArray(t)) return Se(t);
}
function Se(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function jt(t, e, n, i, o, s) {
  return h(), v("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Et(e[0] || (e[0] = [I("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Be.render = jt;
var Ke = {
  name: "CheckIcon",
  extends: be
};
function Rt(t) {
  return Wt(t) || Gt(t) || Ut(t) || Nt();
}
function Nt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ut(t, e) {
  if (t) {
    if (typeof t == "string") return we(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? we(t, e) : void 0;
  }
}
function Gt(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Wt(t) {
  if (Array.isArray(t)) return we(t);
}
function we(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function _t(t, e, n, i, o, s) {
  return h(), v("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Rt(e[0] || (e[0] = [I("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ke.render = _t;
var De = {
  name: "ChevronDownIcon",
  extends: be
};
function qt(t) {
  return Qt(t) || Jt(t) || Yt(t) || Zt();
}
function Zt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Yt(t, e) {
  if (t) {
    if (typeof t == "string") return Ce(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ce(t, e) : void 0;
  }
}
function Jt(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Qt(t) {
  if (Array.isArray(t)) return Ce(t);
}
function Ce(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Xt(t, e, n, i, o, s) {
  return h(), v("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), qt(e[0] || (e[0] = [I("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
De.render = Xt;
var He = {
  name: "SearchIcon",
  extends: be
};
function en(t) {
  return on(t) || sn(t) || nn(t) || tn();
}
function tn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function nn(t, e) {
  if (t) {
    if (typeof t == "string") return ke(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ke(t, e) : void 0;
  }
}
function sn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function on(t) {
  if (Array.isArray(t)) return ke(t);
}
function ke(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function rn(t, e, n, i, o, s) {
  return h(), v("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), en(e[0] || (e[0] = [I("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
He.render = rn;
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
}, dn = me.extend({
  name: "iconfield",
  style: ln,
  classes: an
}), un = {
  name: "BaseIconField",
  extends: ge,
  style: dn,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, je = {
  name: "IconField",
  extends: un,
  inheritAttrs: !1
};
function cn(t, e, n, i, o, s) {
  return h(), v("div", f({
    class: t.cx("root")
  }, t.ptmi("root")), [$(t.$slots, "default")], 16);
}
je.render = cn;
var pn = {
  root: "p-inputicon"
}, fn = me.extend({
  name: "inputicon",
  classes: pn
}), hn = {
  name: "BaseInputIcon",
  extends: ge,
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
}, Re = {
  name: "InputIcon",
  extends: hn,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function mn(t, e, n, i, o, s) {
  return h(), v("span", f({
    class: s.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [$(t.$slots, "default")], 16);
}
Re.render = mn;
var vn = {
  name: "BaseEditableHolder",
  extends: ge,
  emits: ["update:modelValue", "value-change"],
  props: {
    modelValue: {
      type: null,
      default: void 0
    },
    defaultValue: {
      type: null,
      default: void 0
    },
    name: {
      type: String,
      default: void 0
    },
    invalid: {
      type: Boolean,
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    formControl: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcForm: {
      default: void 0
    },
    $pcFormField: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_value: this.defaultValue !== void 0 ? this.defaultValue : this.modelValue
    };
  },
  watch: {
    modelValue: {
      deep: !0,
      handler: function(e) {
        this.d_value = e;
      }
    },
    defaultValue: function(e) {
      this.d_value = e;
    },
    $formName: {
      immediate: !0,
      handler: function(e) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, this.$formName, e)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(e) {
        this.d_value !== e && (this.d_value = e);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(e) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && e !== this.d_value && (this.d_value = e);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(e, n) {
      var i, o;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (i = (o = this.formField).onChange) === null || i === void 0 || i.call(o, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), i = 0; i < e; i++)
        n[i] = arguments[i];
      return n.find(se);
    }
  },
  computed: {
    $filled: function() {
      return se(this.d_value);
    },
    $invalid: function() {
      var e, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var e;
      return this.$formNovalidate ? void 0 : this.name || ((e = this.$formControl) === null || e === void 0 ? void 0 : e.name);
    },
    $formControl: function() {
      var e;
      return this.formControl || ((e = this.$pcFormField) === null || e === void 0 ? void 0 : e.formControl);
    },
    $formNovalidate: function() {
      var e;
      return (e = this.$formControl) === null || e === void 0 ? void 0 : e.novalidate;
    },
    $formDefaultValue: function() {
      var e, n;
      return this.findNonEmpty(this.d_value, (e = this.$pcFormField) === null || e === void 0 ? void 0 : e.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var e, n;
      return this.findNonEmpty((e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, Ne = {
  name: "BaseInput",
  extends: vn,
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
}, yn = `
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
`, bn = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": i.size === "small",
      "p-inputtext-lg p-inputfield-lg": i.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, gn = me.extend({
  name: "inputtext",
  style: yn,
  classes: bn
}), In = {
  name: "BaseInputText",
  extends: Ne,
  style: gn,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function pe(t) {
  "@babel/helpers - typeof";
  return pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, pe(t);
}
function On(t, e, n) {
  return (e = Sn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Sn(t) {
  var e = wn(t, "string");
  return pe(e) == "symbol" ? e : e + "";
}
function wn(t, e) {
  if (pe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (pe(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ue = {
  name: "InputText",
  extends: In,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return f(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return de(On({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Cn = ["value", "name", "disabled", "aria-invalid", "data-p"];
function kn(t, e, n, i, o, s) {
  return h(), v("input", f({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": s.dataP,
    onInput: e[0] || (e[0] = function() {
      return s.onInput && s.onInput.apply(s, arguments);
    })
  }, s.attrs), null, 16, Cn);
}
Ue.render = kn;
var Ln = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, $n = `
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
`, Fe = me.extend({
  name: "virtualscroller",
  css: $n,
  style: Ln
}), xn = {
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
  style: Fe,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    Fe.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function fe(t) {
  "@babel/helpers - typeof";
  return fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, fe(t);
}
function Ve(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function ae(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ve(Object(n), !0).forEach(function(i) {
      Ge(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ve(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Ge(t, e, n) {
  return (e = zn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function zn(t) {
  var e = Fn(t, "string");
  return fe(e) == "symbol" ? e : e + "";
}
function Fn(t, e) {
  if (fe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (fe(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var We = {
  name: "VirtualScroller",
  extends: xn,
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
      ye(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = re(this.element), this.defaultHeight = le(this.element), this.defaultContentWidth = re(this.content), this.defaultContentHeight = le(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", o = this.isBoth(), s = this.isHorizontal(), l = o ? e.every(function(O) {
        return O > -1;
      }) : e > -1;
      if (l) {
        var a = this.first, d = this.element, c = d.scrollTop, u = c === void 0 ? 0 : c, m = d.scrollLeft, y = m === void 0 ? 0 : m, k = this.calculateNumItems(), S = k.numToleratedItems, C = this.getContentPosition(), b = this.itemSize, z = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, H = arguments.length > 1 ? arguments[1] : void 0;
          return w <= H ? 0 : w;
        }, V = function(w, H, B) {
          return w * H + B;
        }, T = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, H = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: w,
            top: H,
            behavior: i
          });
        }, g = o ? {
          rows: 0,
          cols: 0
        } : 0, P = !1, F = !1;
        o ? (g = {
          rows: z(e[0], S[0]),
          cols: z(e[1], S[1])
        }, T(V(g.cols, b[1], C.left), V(g.rows, b[0], C.top)), F = this.lastScrollPos.top !== u || this.lastScrollPos.left !== y, P = g.rows !== a.rows || g.cols !== a.cols) : (g = z(e, S), s ? T(V(g, b, C.left), u) : T(y, V(g, b, C.top)), F = this.lastScrollPos !== (s ? y : u), P = g !== a), this.isRangeChanged = P, F && (this.first = g);
      }
    },
    scrollInView: function(e, n) {
      var i = this, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var s = this.isBoth(), l = this.isHorizontal(), a = s ? e.every(function(b) {
          return b > -1;
        }) : e > -1;
        if (a) {
          var d = this.getRenderedRange(), c = d.first, u = d.viewport, m = function() {
            var z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return i.scrollTo({
              left: z,
              top: V,
              behavior: o
            });
          }, y = n === "to-start", k = n === "to-end";
          if (y) {
            if (s)
              u.first.rows - c.rows > e[0] ? m(u.first.cols * this.itemSize[1], (u.first.rows - 1) * this.itemSize[0]) : u.first.cols - c.cols > e[1] && m((u.first.cols - 1) * this.itemSize[1], u.first.rows * this.itemSize[0]);
            else if (u.first - c > e) {
              var S = (u.first - 1) * this.itemSize;
              l ? m(S, 0) : m(0, S);
            }
          } else if (k) {
            if (s)
              u.last.rows - c.rows <= e[0] + 1 ? m(u.first.cols * this.itemSize[1], (u.first.rows + 1) * this.itemSize[0]) : u.last.cols - c.cols <= e[1] + 1 && m((u.first.cols + 1) * this.itemSize[1], u.first.rows * this.itemSize[0]);
            else if (u.last - c <= e + 1) {
              var C = (u.first + 1) * this.itemSize;
              l ? m(C, 0) : m(0, C);
            }
          }
        }
      } else
        this.scrollToIndex(e, o);
    },
    getRenderedRange: function() {
      var e = function(m, y) {
        return Math.floor(m / (y || m));
      }, n = this.first, i = 0;
      if (this.element) {
        var o = this.isBoth(), s = this.isHorizontal(), l = this.element, a = l.scrollTop, d = l.scrollLeft;
        if (o)
          n = {
            rows: e(a, this.itemSize[0]),
            cols: e(d, this.itemSize[1])
          }, i = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var c = s ? d : a;
          n = e(c, this.itemSize), i = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: i
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), i = this.itemSize, o = this.getContentPosition(), s = this.element ? this.element.offsetWidth - o.left : 0, l = this.element ? this.element.offsetHeight - o.top : 0, a = function(y, k) {
        return Math.ceil(y / (k || y));
      }, d = function(y) {
        return Math.ceil(y / 2);
      }, c = e ? {
        rows: a(l, i[0]),
        cols: a(s, i[1])
      } : a(n ? s : l, i), u = this.d_numToleratedItems || (e ? [d(c.rows), d(c.cols)] : d(c));
      return {
        numItemsInViewport: c,
        numToleratedItems: u
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), i = this.first, o = this.calculateNumItems(), s = o.numItemsInViewport, l = o.numToleratedItems, a = function(u, m, y) {
        var k = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(u + m + (u < y ? 2 : 3) * y, k);
      }, d = n ? {
        rows: a(i.rows, s.rows, l[0]),
        cols: a(i.cols, s.cols, l[1], !0)
      } : a(i, s, l);
      this.last = d, this.numItemsInViewport = s, this.d_numToleratedItems = l, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: s.rows
      }).map(function() {
        return Array.from({
          length: s.cols
        });
      }) : Array.from({
        length: s
      })), this.lazy && Promise.resolve().then(function() {
        var c;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: i.cols
          } : 0 : i,
          last: Math.min(e.step ? e.step : d, ((c = e.items) === null || c === void 0 ? void 0 : c.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), i = e.isHorizontal(), o = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var s = [re(e.element), le(e.element)], l = s[0], a = s[1];
          (n || i) && (e.element.style.width = l < e.defaultWidth ? l + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || o) && (e.element.style.height = a < e.defaultHeight ? a + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, o = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(o ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, i) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), i = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), o = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), s = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: i,
          top: o,
          bottom: s,
          x: n + i,
          y: o + s
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
        var n = this.isBoth(), i = this.isHorizontal(), o = this.element.parentElement, s = this.scrollWidth || "".concat(this.element.offsetWidth || o.offsetWidth, "px"), l = this.scrollHeight || "".concat(this.element.offsetHeight || o.offsetHeight, "px"), a = function(c, u) {
          return e.element.style[c] = u;
        };
        n || i ? (a("height", l), a("width", s)) : a("height", l);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var i = this.isBoth(), o = this.isHorizontal(), s = this.getContentPosition(), l = function(d, c, u) {
          var m = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = ae(ae({}, e.spacerStyle), Ge({}, "".concat(d), (c || []).length * u + m + "px"));
        };
        i ? (l("height", n, this.itemSize[0], s.y), l("width", this.columns || n[1], this.itemSize[1], s.x)) : o ? l("width", this.columns || n, this.itemSize, s.x) : l("height", n, this.itemSize, s.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var i = this.isBoth(), o = this.isHorizontal(), s = e ? e.first : this.first, l = function(u, m) {
          return u * m;
        }, a = function() {
          var u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, m = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = ae(ae({}, n.contentStyle), {
            transform: "translate3d(".concat(u, "px, ").concat(m, "px, 0)")
          });
        };
        if (i)
          a(l(s.cols, this.itemSize[1]), l(s.rows, this.itemSize[0]));
        else {
          var d = l(s, this.itemSize);
          o ? a(d, 0) : a(0, d);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, i = e.target, o = this.isBoth(), s = this.isHorizontal(), l = this.getContentPosition(), a = function(x, A) {
        return x ? x > A ? x - A : x : 0;
      }, d = function(x, A) {
        return Math.floor(x / (A || x));
      }, c = function(x, A, _, X, K, U) {
        return x <= K ? K : U ? _ - X - K : A + K - 1;
      }, u = function(x, A, _, X, K, U, r, p) {
        if (x <= U) return 0;
        var L = Math.max(0, r ? x < A ? _ : x - U : x > A ? _ : x - 2 * U), E = n.getLast(L, p);
        return L > E ? E - K : L;
      }, m = function(x, A, _, X, K, U) {
        var r = A + X + 2 * K;
        return x >= K && (r += K + 1), n.getLast(r, U);
      }, y = a(i.scrollTop, l.top), k = a(i.scrollLeft, l.left), S = o ? {
        rows: 0,
        cols: 0
      } : 0, C = this.last, b = !1, z = this.lastScrollPos;
      if (o) {
        var V = this.lastScrollPos.top <= y, T = this.lastScrollPos.left <= k;
        if (!this.appendOnly || this.appendOnly && (V || T)) {
          var g = {
            rows: d(y, this.itemSize[0]),
            cols: d(k, this.itemSize[1])
          }, P = {
            rows: c(g.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], V),
            cols: c(g.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], T)
          };
          S = {
            rows: u(g.rows, P.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], V),
            cols: u(g.cols, P.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], T, !0)
          }, C = {
            rows: m(g.rows, S.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: m(g.cols, S.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, b = S.rows !== this.first.rows || C.rows !== this.last.rows || S.cols !== this.first.cols || C.cols !== this.last.cols || this.isRangeChanged, z = {
            top: y,
            left: k
          };
        }
      } else {
        var F = s ? k : y, O = this.lastScrollPos <= F;
        if (!this.appendOnly || this.appendOnly && O) {
          var w = d(F, this.itemSize), H = c(w, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, O);
          S = u(w, H, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, O), C = m(w, S, this.last, this.numItemsInViewport, this.d_numToleratedItems), b = S !== this.first || C !== this.last || this.isRangeChanged, z = F;
        }
      }
      return {
        first: S,
        last: C,
        isRangeChanged: b,
        scrollPos: z
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), i = n.first, o = n.last, s = n.isRangeChanged, l = n.scrollPos;
      if (s) {
        var a = {
          first: i,
          last: o
        };
        if (this.setContentPosition(a), this.first = i, this.last = o, this.lastScrollPos = l, this.$emit("scroll-index-change", a), this.lazy && this.isPageChanged(i)) {
          var d, c, u = {
            first: this.step ? Math.min(this.getPageByFirst(i) * this.step, (((d = this.items) === null || d === void 0 ? void 0 : d.length) || 0) - this.step) : i,
            last: Math.min(this.step ? (this.getPageByFirst(i) + 1) * this.step : o, ((c = this.items) === null || c === void 0 ? void 0 : c.length) || 0)
          }, m = this.lazyLoadState.first !== u.first || this.lazyLoadState.last !== u.last;
          m && this.$emit("lazy-load", u), this.lazyLoadState = u;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var i = this.onScrollPositionChange(e), o = i.isRangeChanged, s = o || (this.step ? this.isPageChanged() : !1);
            s && (this.d_loading = !0);
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
        if (ye(e.element)) {
          var n = e.isBoth(), i = e.isVertical(), o = e.isHorizontal(), s = [re(e.element), le(e.element)], l = s[0], a = s[1], d = l !== e.defaultWidth, c = a !== e.defaultHeight, u = n ? d || c : o ? d : i ? c : !1;
          u && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = l, e.defaultHeight = a, e.defaultContentWidth = re(e.content), e.defaultContentHeight = le(e.content), e.init());
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
      var n = (this.items || []).length, i = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: i,
        count: n,
        first: i === 0,
        last: i === n - 1,
        even: i % 2 === 0,
        odd: i % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var i = this.loaderArr.length;
      return ae({
        index: e,
        count: i,
        first: e === 0,
        last: e === i - 1,
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
      this.content = e || this.content || Me(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Ae
  }
}, Vn = ["tabindex"];
function Tn(t, e, n, i, o, s) {
  var l = N("SpinnerIcon");
  return t.disabled ? (h(), v(oe, {
    key: 1
  }, [$(t.$slots, "default"), $(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: s.loadedColumns
  })], 64)) : (h(), v("div", f({
    key: 0,
    ref: s.elementRef,
    class: s.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return s.onScroll && s.onScroll.apply(s, arguments);
    })
  }, t.ptmi("root")), [$(t.$slots, "content", {
    styleClass: s.contentClass,
    items: s.loadedItems,
    getItemOptions: s.getOptions,
    loading: o.d_loading,
    getLoaderOptions: s.getLoaderOptions,
    itemSize: t.itemSize,
    rows: s.loadedRows,
    columns: s.loadedColumns,
    contentRef: s.contentRef,
    spacerStyle: o.spacerStyle,
    contentStyle: o.contentStyle,
    vertical: s.isVertical(),
    horizontal: s.isHorizontal(),
    both: s.isBoth()
  }, function() {
    return [I("div", f({
      ref: s.contentRef,
      class: s.contentClass,
      style: o.contentStyle
    }, t.ptm("content")), [(h(!0), v(oe, null, Oe(s.loadedItems, function(a, d) {
      return $(t.$slots, "item", {
        key: d,
        item: a,
        options: s.getOptions(d)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (h(), v("div", f({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: o.spacerStyle
  }, t.ptm("spacer")), null, 16)) : R("", !0), !t.loaderDisabled && t.showLoader && o.d_loading ? (h(), v("div", f({
    key: 1,
    class: s.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (h(!0), v(oe, {
    key: 0
  }, Oe(o.loaderArr, function(a, d) {
    return $(t.$slots, "loader", {
      key: d,
      options: s.getLoaderOptions(d, s.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : R("", !0), $(t.$slots, "loadingicon", {}, function() {
    return [D(l, f({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : R("", !0)], 16, Vn));
}
We.render = Tn;
var Pn = `
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
  root: function(e) {
    var n = e.instance, i = e.props, o = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": i.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": o.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": o.focused || o.overlayVisible,
      "p-select-open": o.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": i.size === "small",
      "p-select-lg p-inputfield-lg": i.size === "large"
    }];
  },
  label: function(e) {
    var n, i = e.instance, o = e.props;
    return ["p-select-label", {
      "p-placeholder": !o.editable && i.label === o.placeholder,
      "p-select-label-empty": !o.editable && !i.$slots.value && (i.label === "p-emptylabel" || ((n = i.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = e.instance, i = e.props, o = e.state, s = e.option, l = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(s) && i.highlightOnSelect,
      "p-focus": o.focusedOptionIndex === l,
      "p-disabled": n.isOptionDisabled(s)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, Mn = me.extend({
  name: "select",
  style: Pn,
  classes: An
}), En = {
  name: "BaseSelect",
  extends: Ne,
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
function he(t) {
  "@babel/helpers - typeof";
  return he = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, he(t);
}
function Bn(t) {
  return jn(t) || Hn(t) || Dn(t) || Kn();
}
function Kn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Dn(t, e) {
  if (t) {
    if (typeof t == "string") return Le(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Le(t, e) : void 0;
  }
}
function Hn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function jn(t) {
  if (Array.isArray(t)) return Le(t);
}
function Le(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Te(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Pe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Te(Object(n), !0).forEach(function(i) {
      J(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Te(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function J(t, e, n) {
  return (e = Rn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Rn(t) {
  var e = Nn(t, "string");
  return he(e) == "symbol" ? e : e + "";
}
function Nn(t, e) {
  if (he(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (he(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var _e = {
  name: "Select",
  extends: En,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Ie.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? ne(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? ne(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? ne(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, i, o) {
      return this.ptm(o, {
        context: {
          option: e,
          index: i,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(i, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? ne(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return ne(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return ne(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(i) {
        return n.isOptionGroup(i);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && G(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, i = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && G(n.$refs.focusInput);
      };
      setTimeout(function() {
        i();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var i, o;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (i = (o = n.formField).onBlur) === null || i === void 0 || i.call(o, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (ft())
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
      var i = e.metaKey || e.ctrlKey;
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
          !i && ht(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && G(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var i = this.searchOptions(e, n);
      !i && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && se(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? pt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      G(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? ct(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      G(n);
    },
    onOptionSelect: function(e, n) {
      var i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var o = this.getOptionValue(n);
        this.updateModel(e, o), i && this.hide(!0);
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
      Mt.emit("overlay-click", {
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
        var i = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, i), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = e.currentTarget;
        e.shiftKey ? i.setSelectionRange(0, e.target.selectionStart) : (i.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = e.currentTarget;
        if (e.shiftKey)
          i.setSelectionRange(e.target.selectionStart, i.value.length);
        else {
          var o = i.value.length;
          i.setSelectionRange(o, o), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (G(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      Ie.set("overlay", e, this.$primevue.config.zIndex.overlay), ut(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && G(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && G(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      Ie.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? lt(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = at(this.$el) + "px", dt(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var i = n.composedPath();
        e.overlayVisible && e.overlay && !i.includes(e.$el) && !i.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new At(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !rt() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && ye(n) && (this.labelClickListener = function() {
          G(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && ye(e) && e.removeEventListener("click", this.labelClickListener);
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
      return ot(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return se(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return st(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return $e(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, i = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(o) {
        return n.isValidOption(o);
      }) : -1;
      return i > -1 ? i + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, i = e > 0 ? $e(this.visibleOptions.slice(0, e), function(o) {
        return n.isValidOption(o);
      }) : -1;
      return i > -1 ? i : e;
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
      var i = this;
      this.searchValue = (this.searchValue || "") + n;
      var o = -1, s = !1;
      return se(this.searchValue) && (o = this.visibleOptions.findIndex(function(l) {
        return i.isOptionExactMatched(l);
      }), o === -1 && (o = this.visibleOptions.findIndex(function(l) {
        return i.isOptionStartsWith(l);
      })), o !== -1 && (s = !0), o === -1 && this.focusedOptionIndex === -1 && (o = this.findFirstFocusedOptionIndex()), o !== -1 && this.changeFocusedOptionIndex(e, o)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        i.searchValue = "", i.searchTimeout = null;
      }, 500), s;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var i = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, o = Me(e.list, 'li[id="'.concat(i, '"]'));
        o ? o.scrollIntoView && o.scrollIntoView({
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
      return (e || []).reduce(function(i, o, s) {
        i.push({
          optionGroup: o,
          group: !0,
          index: s
        });
        var l = n.getOptionGroupChildren(o);
        return l && l.forEach(function(a) {
          return i.push(a);
        }), i;
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
        var i = it.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var o = this.options || [], s = [];
          return o.forEach(function(l) {
            var a = e.getOptionGroupChildren(l), d = a.filter(function(c) {
              return i.includes(c);
            });
            d.length > 0 && s.push(Pe(Pe({}, l), {}, J({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", Bn(d))));
          }), this.flatOptions(s);
        }
        return i;
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
      return se(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return de(J({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return de(J(J({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return de(J({}, this.size, this.size));
    },
    overlayDataP: function() {
      return de(J({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: nt
  },
  components: {
    InputText: Ue,
    VirtualScroller: We,
    Portal: tt,
    InputIcon: Re,
    IconField: je,
    TimesIcon: xt,
    ChevronDownIcon: De,
    SpinnerIcon: Ae,
    SearchIcon: He,
    CheckIcon: Ke,
    BlankIcon: Be
  }
}, Un = ["id", "data-p"], Gn = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Wn = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], _n = ["data-p"], qn = ["id"], Zn = ["id"], Yn = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Jn(t, e, n, i, o, s) {
  var l = N("SpinnerIcon"), a = N("InputText"), d = N("SearchIcon"), c = N("InputIcon"), u = N("IconField"), m = N("CheckIcon"), y = N("BlankIcon"), k = N("VirtualScroller"), S = N("Portal"), C = yt("ripple");
  return h(), v("div", f({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return s.onContainerClick && s.onContainerClick.apply(s, arguments);
    }),
    "data-p": s.containerDataP
  }, t.ptmi("root")), [t.editable ? (h(), v("input", f({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: s.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": o.overlayVisible,
    "aria-controls": o.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": o.focused ? s.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return s.onFocus && s.onFocus.apply(s, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return s.onBlur && s.onBlur.apply(s, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return s.onKeyDown && s.onKeyDown.apply(s, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return s.onEditableInput && s.onEditableInput.apply(s, arguments);
    }),
    "data-p": s.labelDataP
  }, t.ptm("label")), null, 16, Gn)) : (h(), v("span", f({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (s.label === "p-emptylabel" ? void 0 : s.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": o.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": o.focused ? s.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return s.onFocus && s.onFocus.apply(s, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return s.onBlur && s.onBlur.apply(s, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return s.onKeyDown && s.onKeyDown.apply(s, arguments);
    }),
    "data-p": s.labelDataP
  }, t.ptm("label")), [$(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var b;
    return [ue(M(s.label === "p-emptylabel" ? " " : (b = s.label) !== null && b !== void 0 ? b : "empty"), 1)];
  })], 16, Wn)), s.isClearIconVisible ? $(t.$slots, "clearicon", {
    key: 2,
    class: Q(t.cx("clearIcon")),
    clearCallback: s.onClearClick
  }, function() {
    return [(h(), ie(xe(t.clearIcon ? "i" : "TimesIcon"), f({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: s.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : R("", !0), I("div", f({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? $(t.$slots, "loadingicon", {
    key: 0,
    class: Q(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (h(), v("span", f({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (h(), ie(l, f({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : $(t.$slots, "dropdownicon", {
    key: 1,
    class: Q(t.cx("dropdownIcon"))
  }, function() {
    return [(h(), ie(xe(t.dropdownIcon ? "span" : "ChevronDownIcon"), f({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": s.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), D(S, {
    appendTo: t.appendTo
  }, {
    default: W(function() {
      return [D(bt, f({
        name: "p-anchored-overlay",
        onEnter: s.onOverlayEnter,
        onAfterEnter: s.onOverlayAfterEnter,
        onLeave: s.onOverlayLeave,
        onAfterLeave: s.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: W(function() {
          return [o.overlayVisible ? (h(), v("div", f({
            key: 0,
            ref: s.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return s.onOverlayClick && s.onOverlayClick.apply(s, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return s.onOverlayKeyDown && s.onOverlayKeyDown.apply(s, arguments);
            }),
            "data-p": s.overlayDataP
          }, t.ptm("overlay")), [I("span", f({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return s.onFirstHiddenFocus && s.onFirstHiddenFocus.apply(s, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), $(t.$slots, "header", {
            value: t.d_value,
            options: s.visibleOptions
          }), t.filter ? (h(), v("div", f({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [D(u, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: W(function() {
              return [D(a, {
                ref: "filterInput",
                type: "text",
                value: o.filterValue,
                onVnodeMounted: s.onFilterUpdated,
                onVnodeUpdated: s.onFilterUpdated,
                class: Q(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": s.focusedOptionId,
                onKeydown: s.onFilterKeyDown,
                onBlur: s.onFilterBlur,
                onInput: s.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), D(c, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: W(function() {
                  return [$(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (h(), v("span", f({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (h(), ie(d, gt(f({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), I("span", f({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), M(s.filterResultMessageText), 17)], 16)) : R("", !0), I("div", f({
            class: t.cx("listContainer"),
            style: {
              "max-height": s.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [D(k, f({
            ref: s.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: s.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: s.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), It({
            content: W(function(b) {
              var z = b.styleClass, V = b.contentRef, T = b.items, g = b.getItemOptions, P = b.contentStyle, F = b.itemSize;
              return [I("ul", f({
                ref: function(w) {
                  return s.listRef(w, V);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), z],
                style: P,
                role: "listbox"
              }, t.ptm("list")), [(h(!0), v(oe, null, Oe(T, function(O, w) {
                return h(), v(oe, {
                  key: s.getOptionRenderKey(O, s.getOptionIndex(w, g))
                }, [s.isOptionGroup(O) ? (h(), v("li", f({
                  key: 0,
                  id: t.$id + "_" + s.getOptionIndex(w, g),
                  style: {
                    height: F ? F + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [$(t.$slots, "optiongroup", {
                  option: O.optionGroup,
                  index: s.getOptionIndex(w, g)
                }, function() {
                  return [I("span", f({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), M(s.getOptionGroupLabel(O.optionGroup)), 17)];
                })], 16, Zn)) : Ee((h(), v("li", f({
                  key: 1,
                  id: t.$id + "_" + s.getOptionIndex(w, g),
                  class: t.cx("option", {
                    option: O,
                    focusedOption: s.getOptionIndex(w, g)
                  }),
                  style: {
                    height: F ? F + "px" : void 0
                  },
                  role: "option",
                  "aria-label": s.getOptionLabel(O),
                  "aria-selected": s.isSelected(O),
                  "aria-disabled": s.isOptionDisabled(O),
                  "aria-setsize": s.ariaSetSize,
                  "aria-posinset": s.getAriaPosInset(s.getOptionIndex(w, g)),
                  onMousedown: function(B) {
                    return s.onOptionSelect(B, O);
                  },
                  onMousemove: function(B) {
                    return s.onOptionMouseMove(B, s.getOptionIndex(w, g));
                  },
                  onClick: e[8] || (e[8] = Ot(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && s.isSelected(O),
                  "data-p-focused": o.focusedOptionIndex === s.getOptionIndex(w, g),
                  "data-p-disabled": s.isOptionDisabled(O)
                }, {
                  ref_for: !0
                }, s.getPTItemOptions(O, g, w, "option")), [t.checkmark ? (h(), v(oe, {
                  key: 0
                }, [s.isSelected(O) ? (h(), ie(m, f({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (h(), ie(y, f({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : R("", !0), $(t.$slots, "option", {
                  option: O,
                  selected: s.isSelected(O),
                  index: s.getOptionIndex(w, g)
                }, function() {
                  return [I("span", f({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), M(s.getOptionLabel(O)), 17)];
                })], 16, Yn)), [[C]])], 64);
              }), 128)), o.filterValue && (!T || T && T.length === 0) ? (h(), v("li", f({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [$(t.$slots, "emptyfilter", {}, function() {
                return [ue(M(s.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (h(), v("li", f({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [$(t.$slots, "empty", {}, function() {
                return [ue(M(s.emptyMessageText), 1)];
              })], 16)) : R("", !0)], 16, qn)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: W(function(b) {
              var z = b.options;
              return [$(t.$slots, "loader", {
                options: z
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), $(t.$slots, "footer", {
            value: t.d_value,
            options: s.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (h(), v("span", f({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), M(s.emptyMessageText), 17)) : R("", !0), I("span", f({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), M(s.selectedMessageText), 17), I("span", f({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return s.onLastHiddenFocus && s.onLastHiddenFocus.apply(s, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, _n)) : R("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, Un);
}
_e.render = Jn;
const Qn = {
  class: "kx-artifact-panel",
  "aria-label": "Artifact preview"
}, Xn = { class: "kx-artifact-panel-head" }, ei = { class: "kx-artifact-panel-title" }, ti = { class: "kx-artifact-select-option" }, ni = { class: "kx-artifact-select-option-title" }, ii = { class: "kx-artifact-select-option-sub" }, si = { class: "kx-artifact-panel-actions" }, oi = ["disabled"], ri = ["disabled"], li = {
  key: 0,
  class: "kx-artifact-panel-error",
  role: "alert"
}, ai = ["disabled"], di = {
  class: "sr-only",
  "aria-live": "polite"
}, ui = {
  key: 1,
  class: "kx-artifact-panel-body"
}, ci = ["id"], pi = {
  key: 2,
  class: "kx-artifact-panel-empty"
}, fi = /* @__PURE__ */ St({
  __name: "ArtifactPanel",
  setup(t) {
    const e = Je(), n = Ze(), i = q([]), o = q(""), s = q(T(window.location.pathname)), l = q(!!s.value), a = q(""), d = q(""), c = q(!1), u = [], m = /* @__PURE__ */ new Set();
    let y = null, k = 0, S = 0, C = "";
    const b = wt(() => i.value.find((r) => Y(r) === o.value));
    function z(r) {
      if (!r || typeof r != "object") return "";
      const p = r;
      return String(p.uuid || p.artifactId || "");
    }
    function V(r) {
      if (!r || typeof r != "object") return "";
      const p = r;
      return String(p.sessionId || p.session_id || "");
    }
    function T(r) {
      if (!r.startsWith("/sessions/")) return "";
      const p = r.slice(10).split("/")[0] || "";
      try {
        return decodeURIComponent(p);
      } catch {
        return "";
      }
    }
    async function g() {
      const r = s.value, p = ++k;
      if (!r) {
        i.value = [], o.value = "", l.value = !1, d.value = "";
        return;
      }
      l.value = !0, d.value = "";
      try {
        const L = await e.artifacts({ sessionId: r, limit: 100 });
        if (p !== k || r !== s.value) return;
        const E = b.value, j = L.artifacts.filter((te) => !te.session_id || te.session_id === r), ee = E?.session_id === r && !j.some((te) => Y(te) === o.value) ? [E, ...j] : j;
        i.value = ee, !ee.some((te) => Y(te) === o.value) && !C && (o.value = ee[0] ? Y(ee[0]) : "");
      } catch (L) {
        if (p !== k || r !== s.value) return;
        o.value || (d.value = L.message || "Could not load artifacts");
      } finally {
        p === k && (l.value = !1);
      }
    }
    function P() {
      y && clearTimeout(y), y = setTimeout(() => {
        g();
      }, 150);
    }
    async function F(r) {
      if (!r) return;
      const p = s.value;
      if (!p) return;
      if (c.value = !1, d.value = "", i.value.some((j) => Y(j) === r)) {
        S++, C = "", o.value = r;
        return;
      }
      if (m.has(r)) return;
      const L = ++S;
      C = r;
      const E = o.value;
      o.value = "", m.add(r);
      try {
        const j = await e.artifact(r);
        if (L !== S || p !== s.value) {
          o.value || (o.value = E);
          return;
        }
        if (j.session_id && j.session_id !== p) {
          o.value = E;
          return;
        }
        i.value = [j, ...i.value.filter((ee) => Y(ee) !== r)], o.value = r;
      } catch (j) {
        L === S && (o.value || (o.value = E), d.value = j.message || "Could not load artifact details");
      } finally {
        m.delete(r), C === r && (C = "");
      }
    }
    function O(r) {
      r !== s.value && (s.value = r, k++, S++, y && (clearTimeout(y), y = null), i.value = [], o.value = "", C = "", c.value = !1, d.value = "", l.value = !!r, r && P());
    }
    function w(r) {
      if (r.channel === "kickside:artifact-session") {
        O(V(r.payload));
        return;
      }
      if (r.channel !== "kickside:artifact-open") return;
      const p = z(r.payload);
      p && (F(p), P());
    }
    function H(r) {
      if (!r) return "Generation time unavailable";
      const p = new Date(r);
      return Number.isNaN(p.getTime()) ? "Generation time unavailable" : `Generated ${new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(p)}`;
    }
    function B(r) {
      const p = String(r || "").toLowerCase();
      return p.includes("markdown") ? "md" : p.includes("html") ? "html" : p.includes("json") ? "json" : p.includes("javascript") ? "js" : p.includes("css") ? "css" : "txt";
    }
    function x(r) {
      return `${String(r || "artifact").trim().replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-").replace(/[. ]+$/g, "") || "artifact"}.${B(b.value?.content_type)}`;
    }
    async function A() {
      if (!o.value) throw new Error("Select an artifact first");
      return e.artifactContent(o.value);
    }
    async function _() {
      a.value = "copy", d.value = "";
      try {
        await navigator.clipboard.writeText(await A()), c.value = !0, window.setTimeout(() => {
          c.value = !1;
        }, 1600);
      } catch (r) {
        d.value = r.message || "Could not copy artifact";
      } finally {
        a.value = "";
      }
    }
    async function X() {
      a.value = "save", d.value = "";
      try {
        const r = await A(), p = new Blob([r], { type: b.value?.content_type || "text/plain;charset=utf-8" }), L = URL.createObjectURL(p), E = document.createElement("a");
        E.href = L, E.download = x(b.value?.title), E.click(), URL.revokeObjectURL(L);
      } catch (r) {
        d.value = r.message || "Could not save artifact";
      } finally {
        a.value = "";
      }
    }
    function K() {
      n?.broadcast("kickside:artifact-close", { panelId: "artifact" });
    }
    const U = Ye(P);
    return Ct(() => {
      const r = n?.subscribe(w);
      r && u.push(r), u.push(ze("artifact:*", P)), u.push(ze("session:*", P));
    }), kt(() => {
      u.forEach((r) => r()), k++, S++, y && clearTimeout(y);
    }), (r, p) => Ee((h(), v("section", Qn, [
      I("header", Xn, [
        I("div", ei, [
          p[2] || (p[2] = I("label", {
            class: "sr-only",
            for: "artifact-panel-selector"
          }, "Artifact", -1)),
          D(Z(_e), {
            "input-id": "artifact-panel-selector",
            modelValue: o.value,
            "onUpdate:modelValue": [
              p[0] || (p[0] = (L) => o.value = L),
              p[1] || (p[1] = (L) => F(L))
            ],
            class: "kx-artifact-panel-select",
            "overlay-class": "kx-artifact-panel-select-overlay",
            options: i.value,
            "option-label": "title",
            "option-value": Z(Y),
            placeholder: l.value ? "Loading artifacts…" : "Select an artifact",
            disabled: l.value
          }, {
            value: W(() => [
              I("span", {
                class: Q(["kx-artifact-select-value", { "is-placeholder": !b.value }])
              }, M(b.value?.title || (l.value ? "Loading artifacts…" : "Select an artifact")), 3)
            ]),
            option: W(({ option: L }) => [
              I("span", ti, [
                I("span", ni, M(L.title || "Untitled artifact"), 1),
                I("span", ii, M(H(L.created_at)), 1)
              ])
            ]),
            _: 1
          }, 8, ["modelValue", "options", "option-value", "placeholder", "disabled"])
        ]),
        I("div", si, [
          I("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !o.value || !!a.value,
            onClick: _
          }, [
            D(Z(ve), {
              icon: a.value === "copy" ? "tabler:loader-2" : c.value ? "tabler:check" : "tabler:copy",
              class: Q({ spin: a.value === "copy" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            ue(" " + M(c.value ? "Copied" : "Copy"), 1)
          ], 8, oi),
          I("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !o.value || !!a.value,
            onClick: X
          }, [
            D(Z(ve), {
              icon: a.value === "save" ? "tabler:loader-2" : "tabler:download",
              class: Q({ spin: a.value === "save" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            p[3] || (p[3] = ue(" Save ", -1))
          ], 8, ri),
          I("button", {
            type: "button",
            class: "kx-panel-close",
            "aria-label": "Close artifact panel",
            onClick: K
          }, [
            D(Z(ve), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])
      ]),
      d.value ? (h(), v("div", li, [
        I("span", null, M(d.value), 1),
        o.value ? R("", !0) : (h(), v("button", {
          key: 0,
          type: "button",
          class: "kx-artifact-panel-retry",
          disabled: l.value,
          onClick: g
        }, "Retry", 8, ai))
      ])) : R("", !0),
      I("span", di, M(c.value ? "Artifact copied to clipboard" : ""), 1),
      o.value ? (h(), v("div", ui, [
        I("w-artifact", { id: o.value }, null, 8, ci)
      ])) : (h(), v("div", pi, [
        D(Z(ve), {
          icon: "tabler:file-description",
          "aria-hidden": "true"
        }),
        p[4] || (p[4] = I("span", null, "Select an artifact to preview it.", -1))
      ]))
    ], 512)), [
      [Lt, Z(U) !== !1]
    ]);
  }
});
class qe extends Qe {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: mt
    };
  }
  static get vueConfig() {
    return { rootComponent: fi, plugins: [vt] };
  }
}
async function Si() {
  return qe;
}
$t(import.meta.url, qe);
export {
  Si as webComponent
};
//# sourceMappingURL=artifact_panel.js.map
