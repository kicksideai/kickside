import { resolveDirective as ye, withDirectives as we, openBlock as g, createElementBlock as v, mergeProps as $, createElementVNode as y, renderSlot as W, normalizeClass as xe, createCommentVNode as B, toDisplayString as P, resolveComponent as Se, Fragment as G, renderList as ke, createBlock as Y, createSlots as Ae, withCtx as M, defineComponent as se, ref as S, onMounted as Oe, watch as Z, onBeforeUnmount as ue, nextTick as Ee, computed as H, unref as L, createVNode as I, withKeys as Le, withModifiers as $e, createTextVNode as te } from "vue";
import { b as de, a as Te, s as ze } from "./index-I_-ROi8M.js";
import { B as X, R as ce, l as ee, f as ne, t as J, y as j } from "./index-B9KLaL2S.js";
import { Z as Ve, s as U } from "./pickerselect-BuC_5yaD.js";
import { Icon as oe } from "@iconify/vue";
import { loadByTagName as Ie, api as Be } from "@wippy-fe/proxy";
import { A as Pe } from "./http-error-B4DMrBUB.js";
var Ce = `
    .p-togglebutton {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        overflow: hidden;
        position: relative;
        color: dt('togglebutton.color');
        background: dt('togglebutton.background');
        border: 1px solid dt('togglebutton.border.color');
        padding: dt('togglebutton.padding');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
        border-radius: dt('togglebutton.border.radius');
        outline-color: transparent;
        font-weight: dt('togglebutton.font.weight');
    }

    .p-togglebutton-content {
        display: inline-flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        gap: dt('togglebutton.gap');
        padding: dt('togglebutton.content.padding');
        background: transparent;
        border-radius: dt('togglebutton.content.border.radius');
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover {
        background: dt('togglebutton.hover.background');
        color: dt('togglebutton.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked {
        background: dt('togglebutton.checked.background');
        border-color: dt('togglebutton.checked.border.color');
        color: dt('togglebutton.checked.color');
    }

    .p-togglebutton-checked .p-togglebutton-content {
        background: dt('togglebutton.content.checked.background');
        box-shadow: dt('togglebutton.content.checked.shadow');
    }

    .p-togglebutton:focus-visible {
        box-shadow: dt('togglebutton.focus.ring.shadow');
        outline: dt('togglebutton.focus.ring.width') dt('togglebutton.focus.ring.style') dt('togglebutton.focus.ring.color');
        outline-offset: dt('togglebutton.focus.ring.offset');
    }

    .p-togglebutton.p-invalid {
        border-color: dt('togglebutton.invalid.border.color');
    }

    .p-togglebutton:disabled {
        opacity: 1;
        cursor: default;
        background: dt('togglebutton.disabled.background');
        border-color: dt('togglebutton.disabled.border.color');
        color: dt('togglebutton.disabled.color');
    }

    .p-togglebutton-label,
    .p-togglebutton-icon {
        position: relative;
        transition: none;
    }

    .p-togglebutton-icon {
        color: dt('togglebutton.icon.color');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover .p-togglebutton-icon {
        color: dt('togglebutton.icon.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked .p-togglebutton-icon {
        color: dt('togglebutton.icon.checked.color');
    }

    .p-togglebutton:disabled .p-togglebutton-icon {
        color: dt('togglebutton.icon.disabled.color');
    }

    .p-togglebutton-sm {
        padding: dt('togglebutton.sm.padding');
        font-size: dt('togglebutton.sm.font.size');
    }

    .p-togglebutton-sm .p-togglebutton-content {
        padding: dt('togglebutton.content.sm.padding');
    }

    .p-togglebutton-lg {
        padding: dt('togglebutton.lg.padding');
        font-size: dt('togglebutton.lg.font.size');
    }

    .p-togglebutton-lg .p-togglebutton-content {
        padding: dt('togglebutton.content.lg.padding');
    }

    .p-togglebutton-fluid {
        width: 100%;
    }
`, _e = {
  root: function(n) {
    var t = n.instance, o = n.props;
    return ["p-togglebutton p-component", {
      "p-togglebutton-checked": t.active,
      "p-invalid": t.$invalid,
      "p-togglebutton-fluid": o.fluid,
      "p-togglebutton-sm p-inputfield-sm": o.size === "small",
      "p-togglebutton-lg p-inputfield-lg": o.size === "large"
    }];
  },
  content: "p-togglebutton-content",
  icon: "p-togglebutton-icon",
  label: "p-togglebutton-label"
}, Ne = X.extend({
  name: "togglebutton",
  style: Ce,
  classes: _e
}), De = {
  name: "BaseToggleButton",
  extends: de,
  props: {
    onIcon: String,
    offIcon: String,
    onLabel: {
      type: String,
      default: "Yes"
    },
    offLabel: {
      type: String,
      default: "No"
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: Ne,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function N(e) {
  "@babel/helpers - typeof";
  return N = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, N(e);
}
function Re(e, n, t) {
  return (n = je(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function je(e) {
  var n = Ke(e, "string");
  return N(n) == "symbol" ? n : n + "";
}
function Ke(e, n) {
  if (N(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(e, n);
    if (N(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(e);
}
var fe = {
  name: "ToggleButton",
  extends: De,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getPTOptions: function(n) {
      var t = n === "root" ? this.ptmi : this.ptm;
      return t(n, {
        context: {
          active: this.active,
          disabled: this.disabled
        }
      });
    },
    onChange: function(n) {
      !this.disabled && !this.readonly && (this.writeValue(!this.d_value, n), this.$emit("change", n));
    },
    onBlur: function(n) {
      var t, o;
      (t = (o = this.formField).onBlur) === null || t === void 0 || t.call(o, n);
    }
  },
  computed: {
    active: function() {
      return this.d_value === !0;
    },
    hasLabel: function() {
      return ne(this.onLabel) && ne(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return ee(Re({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: ce
  }
}, Me = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], Fe = ["data-p"];
function He(e, n, t, o, c, a) {
  var l = ye("ripple");
  return we((g(), v("button", $({
    type: "button",
    class: e.cx("root"),
    tabindex: e.tabindex,
    disabled: e.disabled,
    "aria-pressed": e.d_value,
    onClick: n[0] || (n[0] = function() {
      return a.onChange && a.onChange.apply(a, arguments);
    }),
    onBlur: n[1] || (n[1] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    })
  }, a.getPTOptions("root"), {
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "data-p-checked": a.active,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [y("span", $({
    class: e.cx("content")
  }, a.getPTOptions("content"), {
    "data-p": a.dataP
  }), [W(e.$slots, "default", {}, function() {
    return [W(e.$slots, "icon", {
      value: e.d_value,
      class: xe(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (g(), v("span", $({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, a.getPTOptions("icon")), null, 16)) : B("", !0)];
    }), y("span", $({
      class: e.cx("label")
    }, a.getPTOptions("label")), P(a.label), 17)];
  })], 16, Fe)], 16, Me)), [[l]]);
}
fe.render = He;
var Je = `
    .p-selectbutton {
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        outline-color: transparent;
        border-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton {
        border-radius: 0;
        border-width: 1px 1px 1px 0;
    }

    .p-selectbutton .p-togglebutton:focus-visible {
        position: relative;
        z-index: 1;
    }

    .p-selectbutton .p-togglebutton:first-child {
        border-inline-start-width: 1px;
        border-start-start-radius: dt('selectbutton.border.radius');
        border-end-start-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton:last-child {
        border-start-end-radius: dt('selectbutton.border.radius');
        border-end-end-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton.p-invalid {
        outline: 1px solid dt('selectbutton.invalid.border.color');
        outline-offset: 0;
    }

    .p-selectbutton-fluid {
        width: 100%;
    }

    .p-selectbutton-fluid .p-togglebutton {
        flex: 1 1 0;
    }
`, Ue = {
  root: function(n) {
    var t = n.props, o = n.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": o.$invalid,
      // @todo: check
      "p-selectbutton-fluid": t.fluid
    }];
  }
}, qe = X.extend({
  name: "selectbutton",
  style: Je,
  classes: Ue
}), We = {
  name: "BaseSelectButton",
  extends: de,
  props: {
    options: Array,
    optionLabel: null,
    optionValue: null,
    optionDisabled: null,
    multiple: Boolean,
    allowEmpty: {
      type: Boolean,
      default: !0
    },
    dataKey: null,
    ariaLabelledby: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: qe,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function Ge(e, n) {
  var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!t) {
    if (Array.isArray(e) || (t = pe(e)) || n) {
      t && (e = t);
      var o = 0, c = function() {
      };
      return { s: c, n: function() {
        return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
      }, e: function(u) {
        throw u;
      }, f: c };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var a, l = !0, s = !1;
  return { s: function() {
    t = t.call(e);
  }, n: function() {
    var u = t.next();
    return l = u.done, u;
  }, e: function(u) {
    s = !0, a = u;
  }, f: function() {
    try {
      l || t.return == null || t.return();
    } finally {
      if (s) throw a;
    }
  } };
}
function Ye(e) {
  return Xe(e) || Qe(e) || pe(e) || Ze();
}
function Ze() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pe(e, n) {
  if (e) {
    if (typeof e == "string") return Q(e, n);
    var t = {}.toString.call(e).slice(8, -1);
    return t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set" ? Array.from(e) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? Q(e, n) : void 0;
  }
}
function Qe(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Xe(e) {
  if (Array.isArray(e)) return Q(e);
}
function Q(e, n) {
  (n == null || n > e.length) && (n = e.length);
  for (var t = 0, o = Array(n); t < n; t++) o[t] = e[t];
  return o;
}
var be = {
  name: "SelectButton",
  extends: We,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(n) {
      return this.optionLabel ? j(n, this.optionLabel) : n;
    },
    getOptionValue: function(n) {
      return this.optionValue ? j(n, this.optionValue) : n;
    },
    getOptionRenderKey: function(n) {
      return this.dataKey ? j(n, this.dataKey) : this.getOptionLabel(n);
    },
    isOptionDisabled: function(n) {
      return this.optionDisabled ? j(n, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(n) {
      if (this.allowEmpty) return !1;
      var t = this.isSelected(n);
      return this.multiple ? t && this.d_value.length === 1 : t;
    },
    onOptionSelect: function(n, t, o) {
      var c = this;
      if (!(this.disabled || this.isOptionDisabled(t) || this.isOptionReadonly(t))) {
        var a = this.isSelected(t), l = this.getOptionValue(t), s;
        if (this.multiple)
          if (a) {
            if (s = this.d_value.filter(function(i) {
              return !J(i, l, c.equalityKey);
            }), !this.allowEmpty && s.length === 0) return;
          } else
            s = this.d_value ? [].concat(Ye(this.d_value), [l]) : [l];
        else {
          if (a && !this.allowEmpty) return;
          s = a ? null : l;
        }
        this.writeValue(s, n), this.$emit("change", {
          originalEvent: n,
          value: s
        });
      }
    },
    isSelected: function(n) {
      var t = !1, o = this.getOptionValue(n);
      if (this.multiple) {
        if (this.d_value) {
          var c = Ge(this.d_value), a;
          try {
            for (c.s(); !(a = c.n()).done; ) {
              var l = a.value;
              if (J(l, o, this.equalityKey)) {
                t = !0;
                break;
              }
            }
          } catch (s) {
            c.e(s);
          } finally {
            c.f();
          }
        }
      } else
        t = J(this.d_value, o, this.equalityKey);
      return t;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return ee({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: ce
  },
  components: {
    ToggleButton: fe
  }
}, et = ["aria-labelledby", "data-p"];
function tt(e, n, t, o, c, a) {
  var l = Se("ToggleButton");
  return g(), v("div", $({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": a.dataP
  }), [(g(!0), v(G, null, ke(e.options, function(s, i) {
    return g(), Y(l, {
      key: a.getOptionRenderKey(s),
      modelValue: a.isSelected(s),
      onLabel: a.getOptionLabel(s),
      offLabel: a.getOptionLabel(s),
      disabled: e.disabled || a.isOptionDisabled(s),
      unstyled: e.unstyled,
      size: e.size,
      readonly: a.isOptionReadonly(s),
      onChange: function(k) {
        return a.onOptionSelect(k, s, i);
      },
      pt: e.ptm("pcToggleButton")
    }, Ae({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: M(function() {
        return [W(e.$slots, "option", {
          option: s,
          index: i
        }, function() {
          return [y("span", $({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), P(a.getOptionLabel(s)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, et);
}
be.render = tt;
var nt = `
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
`, ot = {
  root: function(n) {
    var t = n.instance, o = n.props;
    return ["p-textarea p-component", {
      "p-filled": t.$filled,
      "p-textarea-resizable ": o.autoResize,
      "p-textarea-sm p-inputfield-sm": o.size === "small",
      "p-textarea-lg p-inputfield-lg": o.size === "large",
      "p-invalid": t.$invalid,
      "p-variant-filled": t.$variant === "filled",
      "p-textarea-fluid": t.$fluid
    }];
  }
}, at = X.extend({
  name: "textarea",
  style: nt,
  classes: ot
}), rt = {
  name: "BaseTextarea",
  extends: Te,
  props: {
    autoResize: Boolean
  },
  style: at,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function D(e) {
  "@babel/helpers - typeof";
  return D = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, D(e);
}
function lt(e, n, t) {
  return (n = it(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function it(e) {
  var n = st(e, "string");
  return D(n) == "symbol" ? n : n + "";
}
function st(e, n) {
  if (D(e) != "object" || !e) return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var o = t.call(e, n);
    if (D(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(e);
}
var ge = {
  name: "Textarea",
  extends: rt,
  inheritAttrs: !1,
  observer: null,
  mounted: function() {
    var n = this;
    this.autoResize && (this.observer = new ResizeObserver(function() {
      requestAnimationFrame(function() {
        n.resize();
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
        var n = this.$el.style.height, t = parseInt(n) || 0, o = this.$el.scrollHeight, c = !t || o > t, a = t && o < t;
        a ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : c && (this.$el.style.height = "".concat(o, "px"));
      }
    },
    onInput: function(n) {
      this.autoResize && this.resize(), this.writeValue(n.target.value, n);
    }
  },
  computed: {
    attrs: function() {
      return $(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ee(lt({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ut = ["value", "name", "disabled", "aria-invalid", "data-p"];
function dt(e, n, t, o, c, a) {
  return g(), v("textarea", $({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": a.dataP,
    onInput: n[0] || (n[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, ut);
}
ge.render = dt;
const ct = { class: "kx-wcmount" }, ft = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, pt = /* @__PURE__ */ se({
  __name: "WcMount",
  props: {
    tag: {},
    config: {},
    schema: {},
    meta: {},
    provider: {},
    label: {},
    attrs: {}
  },
  emits: ["change", "select", "created", "close", "error"],
  setup(e, { emit: n }) {
    const t = e, o = n, c = S(null), a = S(!1);
    let l = null, s = 0;
    const i = /* @__PURE__ */ new Set();
    function u(r) {
      r.composedPath()[0] === l && (r.stopPropagation(), o("change", r.detail));
    }
    function k(r) {
      return r.composedPath()[0] !== l ? !1 : (r.stopPropagation(), !0);
    }
    function T(r) {
      k(r) && o("select", r.detail);
    }
    function z(r) {
      k(r) && o("created", r.detail);
    }
    function R(r) {
      k(r) && o("close", r.detail);
    }
    function O(r) {
      k(r) && o("error", r.detail);
    }
    function m(r) {
      if (typeof r == "string") return r;
      try {
        return JSON.stringify(r ?? {});
      } catch {
        return null;
      }
    }
    function E() {
      if (!l) return;
      const r = m(t.config);
      if (r !== null && l.setAttribute("config", r), t.schema !== void 0 && t.schema !== null) {
        const f = m(t.schema);
        f !== null && l.setAttribute("schema", f);
      }
      if (t.meta !== void 0 && t.meta !== null) {
        const f = m(t.meta);
        f !== null && l.setAttribute("meta", f);
      }
      t.provider && l.setAttribute("provider", t.provider), t.label && l.setAttribute("label", t.label);
      const h = t.attrs || {};
      for (const f of [...i])
        (!(f in h) || h[f] == null) && (l.removeAttribute(f), i.delete(f));
      for (const [f, b] of Object.entries(h)) {
        if (b == null) continue;
        const C = typeof b == "object" ? m(b) : String(b);
        C !== null && (l.setAttribute(f, C), i.add(f));
      }
    }
    function A(r = l) {
      r && (r.removeEventListener("config-changed", u), r.removeEventListener("change", u), r.removeEventListener("select", T), r.removeEventListener("created", z), r.removeEventListener("close", R), r.removeEventListener("error", O), r === l && (l = null), i.clear());
    }
    async function V(r) {
      if (!customElements.get(r))
        try {
          await Ie(r, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function w() {
      const r = ++s, h = c.value, f = t.tag;
      if (a.value = !1, !!h && (A(), h.innerHTML = "", !!f))
        try {
          if (await V(f), r !== s || c.value !== h || t.tag !== f) return;
          const b = document.createElement(f);
          b.classList.add("kx-wcmount-surface"), l = b, E(), b.addEventListener("config-changed", u), b.addEventListener("change", u), b.addEventListener("select", T), b.addEventListener("created", z), b.addEventListener("close", R), b.addEventListener("error", O), b.style.display = "block", h.appendChild(b), a.value = !customElements.get(f);
        } catch {
          r === s && (a.value = !0);
        }
    }
    async function F() {
      a.value = !1, await Ee(), await w();
    }
    return Oe(w), Z(() => t.tag, w), Z(() => [t.config, t.schema, t.meta, t.provider, t.label, t.attrs], E, { deep: !0 }), ue(() => {
      s += 1, A();
    }), (r, h) => (g(), v("div", ct, [
      a.value ? (g(), v("div", ft, [
        h[0] || (h[0] = y("span", null, "This setup panel couldn’t load.", -1)),
        y("button", {
          type: "button",
          onClick: F
        }, "Try again")
      ])) : (g(), v("div", {
        key: 1,
        ref_key: "host",
        ref: c
      }, null, 512))
    ]));
  }
}), bt = (e, n) => {
  const t = e.__vccOpts || e;
  for (const [o, c] of n)
    t[o] = c;
  return t;
}, gt = /* @__PURE__ */ bt(pt, [["__scopeId", "data-v-3d6a00f1"]]);
function K(e) {
  const n = e.trim();
  if (!n) return { value: null, error: "" };
  try {
    const t = JSON.parse(n);
    return !t || typeof t != "object" || Array.isArray(t) ? { value: null, error: "Must be a JSON object." } : { value: t, error: "" };
  } catch (t) {
    return { value: null, error: `Invalid JSON: ${t instanceof Error ? t.message : "parse error"}` };
  }
}
const ae = "AI assist is temporarily unavailable. Try again shortly.", vt = "AI assist isn’t available here yet.", ht = {
  assist_unavailable: ae,
  "assist unavailable": ae
};
function re(e) {
  return typeof e == "string" ? e.trim() : "";
}
function le(e, n) {
  const t = re(e?.message);
  if (t) return t;
  const o = re(e?.error);
  if (!o) return n;
  const c = ht[o.toLowerCase()];
  return c || (/_/.test(o) && !/\s/.test(o) ? n : o);
}
const mt = 11e4;
function yt(e) {
  return "schema" in e;
}
const ie = vt, q = "The assistant couldn’t draft a schema.";
async function wt(e, n, t = {}, o) {
  const c = { intent: e };
  n != null && (c.current_schema = n);
  const a = {};
  t.surface && (a.surface = t.surface), t.sample !== void 0 && (a.sample = t.sample), Object.keys(a).length && (c.context = a);
  let l;
  try {
    l = (await Be.post("/api/v1/workflows/assist/schema", c, {
      timeout: mt,
      signal: o
    })).data;
  } catch (u) {
    const k = String(u?.code || ""), T = String(u?.name || "");
    if (k === "ERR_CANCELED" || T === "CanceledError" || T === "AbortError")
      return { error: "Draft cancelled." };
    if (Pe(u) === 404) return { error: ie, unavailable: !0 };
    const z = u?.response?.data;
    return z ? { error: le(z, u instanceof Error && u.message ? u.message : q) } : { error: u instanceof Error && u.message ? u.message : q };
  }
  if (!l || typeof l != "object") return { error: ie, unavailable: !0 };
  const s = l;
  if (s.success === !1) return { error: le(s, q) };
  const i = s.schema;
  return !i || typeof i != "object" || Array.isArray(i) ? { error: "The assistant returned no schema." } : { schema: i, notes: s.notes != null ? String(s.notes) : void 0 };
}
const xt = { class: "wf-sed" }, St = { class: "wf-sed-bar" }, kt = {
  key: 0,
  class: "wf-panel-label wf-sed-label"
}, At = {
  key: 0,
  class: "wf-field-err"
}, Ot = { class: "wf-sed-assist" }, Et = {
  key: 0,
  class: "wf-sed-draft",
  role: "status",
  "aria-label": "Drafted fields ready to review"
}, Lt = { class: "wf-sed-draft-copy" }, $t = { class: "wf-sed-draft-actions" }, Tt = {
  key: 1,
  class: "wf-panel-hint wf-panel-hint--warn wf-sed-msg"
}, zt = {
  key: 2,
  class: "wf-field-err wf-sed-msg"
}, Vt = "wc-schema-form", Rt = /* @__PURE__ */ se({
  __name: "SchemaEditor",
  props: {
    modelValue: {},
    mode: { default: "schema" },
    schema: {},
    surface: {},
    sample: {},
    label: {},
    rows: { default: 10 },
    placeholder: {},
    resetKey: {},
    allowEmpty: { type: Boolean }
  },
  emits: ["update:modelValue", "change", "clear", "valid"],
  setup(e, { emit: n }) {
    const t = e, o = n, c = H(() => t.mode !== "value"), a = H(() => t.mode === "value" && Ve(t.schema)), l = S("code"), s = [
      { label: "Form", value: "form" },
      { label: "JSON", value: "code" }
    ], i = S(""), u = S("");
    function k() {
      const p = t.modelValue;
      p && typeof p == "object" ? i.value = JSON.stringify(p, null, 2) : t.allowEmpty ? i.value = "" : i.value = JSON.stringify(c.value ? { type: "object", properties: {} } : {}, null, 2), u.value = "", b(), a.value || (l.value = "code"), o("valid", !0);
    }
    function T() {
      b();
      const p = !i.value.trim(), { value: d, error: x } = K(i.value);
      u.value = x, o("valid", !x), !(p || x || !d) && o("update:modelValue", d);
    }
    function z() {
      if (t.allowEmpty && !i.value.trim()) {
        u.value = "", b(), o("valid", !0), o("clear");
        return;
      }
      const { value: p, error: d } = K(i.value);
      u.value = d, o("valid", !d), !(d || !p) && (b(), o("update:modelValue", p), o("change", p));
    }
    function R(p) {
      if (!p || typeof p != "object") return;
      const d = { ...t.modelValue || {}, ...p };
      i.value = JSON.stringify(d, null, 2), o("update:modelValue", d), o("change", d);
    }
    const O = S(""), m = S(!1), E = S(""), A = S(!1), V = S(""), w = S(null), F = H(() => w.value !== null);
    let r = null, h = 0;
    function f() {
      h++, r?.abort(), r = null, m.value = !1;
    }
    function b() {
      w.value = null, V.value = "", E.value = "";
    }
    async function C() {
      if (m.value) {
        f();
        return;
      }
      const p = O.value.trim();
      if (!p || A.value) return;
      const d = new AbortController(), x = ++h;
      r = d, m.value = !0, E.value = "";
      const me = K(i.value).value, _ = await wt(p, me, { surface: t.surface, sample: t.sample }, d.signal);
      d.signal.aborted || r !== d || x !== h || (r = null, m.value = !1, yt(_) ? (w.value = i.value, i.value = JSON.stringify(_.schema, null, 2), V.value = _.notes || "Drafted from your description — accept it or undo.", u.value = "", O.value = "") : (_.unavailable && (A.value = !0), E.value = _.error));
    }
    function ve() {
      const { value: p, error: d } = K(i.value);
      u.value = d, o("valid", !d), !(d || !p) && (o("update:modelValue", p), o("change", p), w.value = null, V.value = "");
    }
    function he() {
      w.value !== null && (i.value = w.value, w.value = null, V.value = "", u.value = "", o("valid", !0));
    }
    return Z(() => t.resetKey, () => {
      f(), k();
    }, { immediate: !0 }), ue(f), (p, d) => (g(), v("div", xt, [
      y("div", St, [
        e.label ? (g(), v("span", kt, P(e.label), 1)) : B("", !0),
        d[3] || (d[3] = y("span", { class: "wf-sed-spacer" }, null, -1)),
        a.value ? (g(), Y(L(be), {
          key: 1,
          modelValue: l.value,
          "onUpdate:modelValue": d[0] || (d[0] = (x) => l.value = x),
          class: "wf-sed-views",
          options: s,
          "option-label": "label",
          "option-value": "value",
          "aria-label": "Editor view"
        }, null, 8, ["modelValue"])) : B("", !0)
      ]),
      a.value && l.value === "form" ? (g(), Y(gt, {
        key: 0,
        tag: Vt,
        schema: e.schema,
        config: e.modelValue || {},
        onChange: R
      }, null, 8, ["schema", "config"])) : (g(), v(G, { key: 1 }, [
        I(L(ge), {
          modelValue: i.value,
          "onUpdate:modelValue": d[1] || (d[1] = (x) => i.value = x),
          class: "wf-textarea wf-mono wf-sed-code",
          rows: e.rows,
          spellcheck: "false",
          placeholder: e.placeholder,
          "aria-label": e.label || (c.value ? "JSON schema" : "JSON value"),
          onInput: T,
          onChange: z
        }, null, 8, ["modelValue", "rows", "placeholder", "aria-label"]),
        u.value ? (g(), v("p", At, P(u.value), 1)) : B("", !0)
      ], 64)),
      c.value ? (g(), v(G, { key: 2 }, [
        y("div", Ot, [
          I(L(ze), {
            modelValue: O.value,
            "onUpdate:modelValue": d[2] || (d[2] = (x) => O.value = x),
            class: "wf-input wf-sed-intent",
            type: "text",
            placeholder: "Describe the expected fields — e.g. a lead with email and company",
            "aria-label": "Describe the expected fields",
            disabled: A.value,
            onKeydown: Le($e(C, ["prevent"]), ["enter"])
          }, null, 8, ["modelValue", "disabled", "onKeydown"]),
          I(L(U), {
            type: "button",
            class: "wf-sed-go",
            disabled: A.value || !m.value && !O.value.trim(),
            title: A.value ? "AI assist unavailable" : m.value ? "Cancel this draft" : "Draft the fields with AI",
            onClick: C
          }, {
            default: M(() => [
              I(L(oe), {
                icon: m.value ? "tabler:x" : "tabler:wand",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              y("span", null, P(m.value ? "Cancel" : "Draft with AI"), 1)
            ]),
            _: 1
          }, 8, ["disabled", "title"])
        ]),
        F.value ? (g(), v("div", Et, [
          y("div", Lt, [
            I(L(oe), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            y("span", null, P(V.value), 1)
          ]),
          y("div", $t, [
            I(L(U), {
              type: "button",
              class: "wf-sed-undo",
              severity: "secondary",
              outlined: "",
              onClick: he
            }, {
              default: M(() => [...d[4] || (d[4] = [
                te("Undo", -1)
              ])]),
              _: 1
            }),
            I(L(U), {
              type: "button",
              class: "wf-sed-accept",
              onClick: ve
            }, {
              default: M(() => [...d[5] || (d[5] = [
                te("Accept", -1)
              ])]),
              _: 1
            })
          ])
        ])) : B("", !0),
        A.value ? (g(), v("p", Tt, "AI assist isn’t available here yet.")) : E.value ? (g(), v("p", zt, P(E.value), 1)) : B("", !0)
      ], 64)) : B("", !0)
    ]));
  }
});
export {
  vt as A,
  gt as W,
  Rt as _,
  ge as a,
  le as h,
  be as s
};
