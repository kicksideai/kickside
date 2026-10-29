import { resolveDirective as ve, withDirectives as he, openBlock as f, createElementBlock as p, mergeProps as y, createElementVNode as g, renderSlot as M, normalizeClass as me, createCommentVNode as S, toDisplayString as k, resolveComponent as ye, Fragment as H, renderList as we, createBlock as q, createSlots as xe, withCtx as _, defineComponent as Se, computed as R, ref as v, watch as ke, onBeforeUnmount as Ae, unref as m, createVNode as x, withKeys as Oe, withModifiers as $e, createTextVNode as Q } from "vue";
import { b as re, a as Ve, s as ze } from "./index-CghiLgVY.js";
import { B as G, h as le, i as Y, j as Z, k as F, p as N } from "./index-BhiG6P-P.js";
import { X as Ie, f as U } from "./pickerselect-CbBE-k9N.js";
import { Icon as ee } from "@iconify/vue";
import { W as Be } from "./WcMount-BphSenvv.js";
import { api as Te } from "@wippy-fe/proxy";
import { A as Le } from "./http-error-B_1dDIXt.js";
var Ee = `
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
`, Pe = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-togglebutton p-component", {
      "p-togglebutton-checked": n.active,
      "p-invalid": n.$invalid,
      "p-togglebutton-fluid": o.fluid,
      "p-togglebutton-sm p-inputfield-sm": o.size === "small",
      "p-togglebutton-lg p-inputfield-lg": o.size === "large"
    }];
  },
  content: "p-togglebutton-content",
  icon: "p-togglebutton-icon",
  label: "p-togglebutton-label"
}, Ce = G.extend({
  name: "togglebutton",
  style: Ee,
  classes: Pe
}), Ne = {
  name: "BaseToggleButton",
  extends: re,
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
  style: Ce,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
  }
};
function T(e) {
  "@babel/helpers - typeof";
  return T = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, T(e);
}
function De(e, t, n) {
  return (t = _e(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function _e(e) {
  var t = je(e, "string");
  return T(t) == "symbol" ? t : t + "";
}
function je(e, t) {
  if (T(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (T(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ie = {
  name: "ToggleButton",
  extends: Ne,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          active: this.active,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      !this.disabled && !this.readonly && (this.writeValue(!this.d_value, t), this.$emit("change", t));
    },
    onBlur: function(t) {
      var n, o;
      (n = (o = this.formField).onBlur) === null || n === void 0 || n.call(o, t);
    }
  },
  computed: {
    active: function() {
      return this.d_value === !0;
    },
    hasLabel: function() {
      return Z(this.onLabel) && Z(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return Y(De({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: le
  }
}, Ke = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], Re = ["data-p"];
function Fe(e, t, n, o, u, a) {
  var d = ve("ripple");
  return he((f(), p("button", y({
    type: "button",
    class: e.cx("root"),
    tabindex: e.tabindex,
    disabled: e.disabled,
    "aria-pressed": e.d_value,
    onClick: t[0] || (t[0] = function() {
      return a.onChange && a.onChange.apply(a, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    })
  }, a.getPTOptions("root"), {
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "data-p-checked": a.active,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [g("span", y({
    class: e.cx("content")
  }, a.getPTOptions("content"), {
    "data-p": a.dataP
  }), [M(e.$slots, "default", {}, function() {
    return [M(e.$slots, "icon", {
      value: e.d_value,
      class: me(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (f(), p("span", y({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, a.getPTOptions("icon")), null, 16)) : S("", !0)];
    }), g("span", y({
      class: e.cx("label")
    }, a.getPTOptions("label")), k(a.label), 17)];
  })], 16, Re)], 16, Ke)), [[d]]);
}
ie.render = Fe;
var Ue = `
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
`, Je = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": o.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, Me = G.extend({
  name: "selectbutton",
  style: Ue,
  classes: Je
}), He = {
  name: "BaseSelectButton",
  extends: re,
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
  style: Me,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function qe(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = se(e)) || t) {
      n && (e = n);
      var o = 0, u = function() {
      };
      return { s: u, n: function() {
        return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
      }, e: function(s) {
        throw s;
      }, f: u };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var a, d = !0, i = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var s = n.next();
    return d = s.done, s;
  }, e: function(s) {
    i = !0, a = s;
  }, f: function() {
    try {
      d || n.return == null || n.return();
    } finally {
      if (i) throw a;
    }
  } };
}
function We(e) {
  return Xe(e) || Ye(e) || se(e) || Ge();
}
function Ge() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function se(e, t) {
  if (e) {
    if (typeof e == "string") return W(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? W(e, t) : void 0;
  }
}
function Ye(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Xe(e) {
  if (Array.isArray(e)) return W(e);
}
function W(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
var ue = {
  name: "SelectButton",
  extends: He,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(t) {
      return this.optionLabel ? N(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? N(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t) {
      return this.dataKey ? N(t, this.dataKey) : this.getOptionLabel(t);
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? N(t, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(t) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(t);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(t, n, o) {
      var u = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var a = this.isSelected(n), d = this.getOptionValue(n), i;
        if (this.multiple)
          if (a) {
            if (i = this.d_value.filter(function(r) {
              return !F(r, d, u.equalityKey);
            }), !this.allowEmpty && i.length === 0) return;
          } else
            i = this.d_value ? [].concat(We(this.d_value), [d]) : [d];
        else {
          if (a && !this.allowEmpty) return;
          i = a ? null : d;
        }
        this.writeValue(i, t), this.$emit("change", {
          originalEvent: t,
          value: i
        });
      }
    },
    isSelected: function(t) {
      var n = !1, o = this.getOptionValue(t);
      if (this.multiple) {
        if (this.d_value) {
          var u = qe(this.d_value), a;
          try {
            for (u.s(); !(a = u.n()).done; ) {
              var d = a.value;
              if (F(d, o, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (i) {
            u.e(i);
          } finally {
            u.f();
          }
        }
      } else
        n = F(this.d_value, o, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return Y({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: le
  },
  components: {
    ToggleButton: ie
  }
}, Qe = ["aria-labelledby", "data-p"];
function Ze(e, t, n, o, u, a) {
  var d = ye("ToggleButton");
  return f(), p("div", y({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": a.dataP
  }), [(f(!0), p(H, null, we(e.options, function(i, r) {
    return f(), q(d, {
      key: a.getOptionRenderKey(i),
      modelValue: a.isSelected(i),
      onLabel: a.getOptionLabel(i),
      offLabel: a.getOptionLabel(i),
      disabled: e.disabled || a.isOptionDisabled(i),
      unstyled: e.unstyled,
      size: e.size,
      readonly: a.isOptionReadonly(i),
      onChange: function(O) {
        return a.onOptionSelect(O, i, r);
      },
      pt: e.ptm("pcToggleButton")
    }, xe({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: _(function() {
        return [M(e.$slots, "option", {
          option: i,
          index: r
        }, function() {
          return [g("span", y({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), k(a.getOptionLabel(i)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Qe);
}
ue.render = Ze;
var et = `
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
`, tt = {
  root: function(t) {
    var n = t.instance, o = t.props;
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
}, nt = G.extend({
  name: "textarea",
  style: et,
  classes: tt
}), ot = {
  name: "BaseTextarea",
  extends: Ve,
  props: {
    autoResize: Boolean
  },
  style: nt,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function L(e) {
  "@babel/helpers - typeof";
  return L = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, L(e);
}
function at(e, t, n) {
  return (t = rt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function rt(e) {
  var t = lt(e, "string");
  return L(t) == "symbol" ? t : t + "";
}
function lt(e, t) {
  if (L(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (L(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var de = {
  name: "Textarea",
  extends: ot,
  inheritAttrs: !1,
  observer: null,
  mounted: function() {
    var t = this;
    this.autoResize && (this.observer = new ResizeObserver(function() {
      requestAnimationFrame(function() {
        t.resize();
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
        var t = this.$el.style.height, n = parseInt(t) || 0, o = this.$el.scrollHeight, u = !n || o > n, a = n && o < n;
        a ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : u && (this.$el.style.height = "".concat(o, "px"));
      }
    },
    onInput: function(t) {
      this.autoResize && this.resize(), this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return y(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Y(at({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, it = ["value", "name", "disabled", "aria-invalid", "data-p"];
function st(e, t, n, o, u, a) {
  return f(), p("textarea", y({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": a.dataP,
    onInput: t[0] || (t[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, it);
}
de.render = st;
function D(e) {
  const t = e.trim();
  if (!t) return { value: null, error: "" };
  try {
    const n = JSON.parse(t);
    return !n || typeof n != "object" || Array.isArray(n) ? { value: null, error: "Must be a JSON object." } : { value: n, error: "" };
  } catch (n) {
    return { value: null, error: `Invalid JSON: ${n instanceof Error ? n.message : "parse error"}` };
  }
}
const te = "AI assist is temporarily unavailable. Try again shortly.", ut = "AI assist isn’t available here yet.", dt = {
  assist_unavailable: te,
  "assist unavailable": te
};
function ne(e) {
  return typeof e == "string" ? e.trim() : "";
}
function oe(e, t) {
  const n = ne(e?.message);
  if (n) return n;
  const o = ne(e?.error);
  if (!o) return t;
  const u = dt[o.toLowerCase()];
  return u || (/_/.test(o) && !/\s/.test(o) ? t : o);
}
const ct = 11e4;
function ft(e) {
  return "schema" in e;
}
const ae = ut, J = "The assistant couldn’t draft a schema.";
async function pt(e, t, n = {}, o) {
  const u = { intent: e };
  t != null && (u.current_schema = t);
  const a = {};
  n.surface && (a.surface = n.surface), n.sample !== void 0 && (a.sample = n.sample), Object.keys(a).length && (u.context = a);
  let d;
  try {
    d = (await Te.post("/api/v1/workflows/assist/schema", u, {
      timeout: ct,
      signal: o
    })).data;
  } catch (s) {
    const O = String(s?.code || ""), E = String(s?.name || "");
    if (O === "ERR_CANCELED" || E === "CanceledError" || E === "AbortError")
      return { error: "Draft cancelled." };
    if (Le(s) === 404) return { error: ae, unavailable: !0 };
    const P = s?.response?.data;
    return P ? { error: oe(P, s instanceof Error && s.message ? s.message : J) } : { error: s instanceof Error && s.message ? s.message : J };
  }
  if (!d || typeof d != "object") return { error: ae, unavailable: !0 };
  const i = d;
  if (i.success === !1) return { error: oe(i, J) };
  const r = i.schema;
  return !r || typeof r != "object" || Array.isArray(r) ? { error: "The assistant returned no schema." } : { schema: r, notes: i.notes != null ? String(i.notes) : void 0 };
}
const bt = { class: "wf-sed" }, gt = { class: "wf-sed-bar" }, vt = {
  key: 0,
  class: "wf-panel-label wf-sed-label"
}, ht = {
  key: 0,
  class: "wf-field-err"
}, mt = { class: "wf-sed-assist" }, yt = {
  key: 0,
  class: "wf-sed-draft",
  role: "status",
  "aria-label": "Drafted fields ready to review"
}, wt = { class: "wf-sed-draft-copy" }, xt = { class: "wf-sed-draft-actions" }, St = {
  key: 1,
  class: "wf-panel-hint wf-panel-hint--warn wf-sed-msg"
}, kt = {
  key: 2,
  class: "wf-field-err wf-sed-msg"
}, At = "wc-schema-form", Et = /* @__PURE__ */ Se({
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
  setup(e, { emit: t }) {
    const n = e, o = t, u = R(() => n.mode !== "value"), a = R(() => n.mode === "value" && Ie(n.schema)), d = v("code"), i = [
      { label: "Form", value: "form" },
      { label: "JSON", value: "code" }
    ], r = v(""), s = v("");
    function O() {
      const c = n.modelValue;
      c && typeof c == "object" ? r.value = JSON.stringify(c, null, 2) : n.allowEmpty ? r.value = "" : r.value = JSON.stringify(u.value ? { type: "object", properties: {} } : {}, null, 2), s.value = "", C(), a.value || (d.value = "code"), o("valid", !0);
    }
    function E() {
      C();
      const c = !r.value.trim(), { value: l, error: b } = D(r.value);
      s.value = b, o("valid", !b), !(c || b || !l) && o("update:modelValue", l);
    }
    function P() {
      if (n.allowEmpty && !r.value.trim()) {
        s.value = "", C(), o("valid", !0), o("clear");
        return;
      }
      const { value: c, error: l } = D(r.value);
      s.value = l, o("valid", !l), !(l || !c) && (C(), o("update:modelValue", c), o("change", c));
    }
    function ce(c) {
      if (!c || typeof c != "object") return;
      const l = { ...n.modelValue || {}, ...c };
      r.value = JSON.stringify(l, null, 2), o("update:modelValue", l), o("change", l);
    }
    const $ = v(""), h = v(!1), V = v(""), A = v(!1), z = v(""), w = v(null), fe = R(() => w.value !== null);
    let I = null, j = 0;
    function K() {
      j++, I?.abort(), I = null, h.value = !1;
    }
    function C() {
      w.value = null, z.value = "", V.value = "";
    }
    async function X() {
      if (h.value) {
        K();
        return;
      }
      const c = $.value.trim();
      if (!c || A.value) return;
      const l = new AbortController(), b = ++j;
      I = l, h.value = !0, V.value = "";
      const ge = D(r.value).value, B = await pt(c, ge, { surface: n.surface, sample: n.sample }, l.signal);
      l.signal.aborted || I !== l || b !== j || (I = null, h.value = !1, ft(B) ? (w.value = r.value, r.value = JSON.stringify(B.schema, null, 2), z.value = B.notes || "Drafted from your description — accept it or undo.", s.value = "", $.value = "") : (B.unavailable && (A.value = !0), V.value = B.error));
    }
    function pe() {
      const { value: c, error: l } = D(r.value);
      s.value = l, o("valid", !l), !(l || !c) && (o("update:modelValue", c), o("change", c), w.value = null, z.value = "");
    }
    function be() {
      w.value !== null && (r.value = w.value, w.value = null, z.value = "", s.value = "", o("valid", !0));
    }
    return ke(() => n.resetKey, () => {
      K(), O();
    }, { immediate: !0 }), Ae(K), (c, l) => (f(), p("div", bt, [
      g("div", gt, [
        e.label ? (f(), p("span", vt, k(e.label), 1)) : S("", !0),
        l[3] || (l[3] = g("span", { class: "wf-sed-spacer" }, null, -1)),
        a.value ? (f(), q(m(ue), {
          key: 1,
          modelValue: d.value,
          "onUpdate:modelValue": l[0] || (l[0] = (b) => d.value = b),
          class: "wf-sed-views",
          options: i,
          "option-label": "label",
          "option-value": "value",
          "aria-label": "Editor view"
        }, null, 8, ["modelValue"])) : S("", !0)
      ]),
      a.value && d.value === "form" ? (f(), q(Be, {
        key: 0,
        tag: At,
        schema: e.schema,
        config: e.modelValue || {},
        onChange: ce
      }, null, 8, ["schema", "config"])) : (f(), p(H, { key: 1 }, [
        x(m(de), {
          modelValue: r.value,
          "onUpdate:modelValue": l[1] || (l[1] = (b) => r.value = b),
          class: "wf-textarea wf-mono wf-sed-code",
          rows: e.rows,
          spellcheck: "false",
          placeholder: e.placeholder,
          "aria-label": e.label || (u.value ? "JSON schema" : "JSON value"),
          onInput: E,
          onChange: P
        }, null, 8, ["modelValue", "rows", "placeholder", "aria-label"]),
        s.value ? (f(), p("p", ht, k(s.value), 1)) : S("", !0)
      ], 64)),
      u.value ? (f(), p(H, { key: 2 }, [
        g("div", mt, [
          x(m(ze), {
            modelValue: $.value,
            "onUpdate:modelValue": l[2] || (l[2] = (b) => $.value = b),
            class: "wf-input wf-sed-intent",
            type: "text",
            placeholder: "Describe the expected fields — e.g. a lead with email and company",
            "aria-label": "Describe the expected fields",
            disabled: A.value,
            onKeydown: Oe($e(X, ["prevent"]), ["enter"])
          }, null, 8, ["modelValue", "disabled", "onKeydown"]),
          x(m(U), {
            type: "button",
            class: "wf-sed-go",
            disabled: A.value || !h.value && !$.value.trim(),
            title: A.value ? "AI assist unavailable" : h.value ? "Cancel this draft" : "Draft the fields with AI",
            onClick: X
          }, {
            default: _(() => [
              x(m(ee), {
                icon: h.value ? "tabler:x" : "tabler:wand",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              g("span", null, k(h.value ? "Cancel" : "Draft with AI"), 1)
            ]),
            _: 1
          }, 8, ["disabled", "title"])
        ]),
        fe.value ? (f(), p("div", yt, [
          g("div", wt, [
            x(m(ee), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            g("span", null, k(z.value), 1)
          ]),
          g("div", xt, [
            x(m(U), {
              type: "button",
              class: "wf-sed-undo",
              severity: "secondary",
              outlined: "",
              onClick: be
            }, {
              default: _(() => [...l[4] || (l[4] = [
                Q("Undo", -1)
              ])]),
              _: 1
            }),
            x(m(U), {
              type: "button",
              class: "wf-sed-accept",
              onClick: pe
            }, {
              default: _(() => [...l[5] || (l[5] = [
                Q("Accept", -1)
              ])]),
              _: 1
            })
          ])
        ])) : S("", !0),
        A.value ? (f(), p("p", St, "AI assist isn’t available here yet.")) : V.value ? (f(), p("p", kt, k(V.value), 1)) : S("", !0)
      ], 64)) : S("", !0)
    ]));
  }
});
export {
  ut as A,
  Et as _,
  de as a,
  oe as h,
  ue as s
};
