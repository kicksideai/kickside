import { u as Ce, W as Te } from "./index-D52CRMw6.js";
import { B as G, s as J, f as oe, R as pe, k as Be, b as ze, Q as M, z as Z, a as ue, c as Q, T as Se, C as Ae, K as W, v as Le, V as ce, d as P, e as Ie, P as Pe } from "./index-CKAvFXRR.js";
import { openBlock as c, createElementBlock as u, mergeProps as x, createBlock as L, resolveDynamicComponent as q, createCommentVNode as w, renderSlot as F, createElementVNode as n, toDisplayString as g, resolveDirective as de, withDirectives as C, withCtx as $, normalizeClass as E, defineComponent as Ve, ref as _, computed as X, createVNode as f, unref as d, createTextVNode as Y, Fragment as V, renderList as K, withModifiers as Ee, vModelText as N, vModelCheckbox as ee, vModelSelect as Oe } from "vue";
import { Icon as z } from "@iconify/vue";
import { api as j, host as Ne, define as Ue } from "@wippy-fe/proxy";
import { f as De } from "./datetime--PfqsqnZ.js";
var Ke = `
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`, je = {
  root: function(r) {
    var a = r.props;
    return ["p-tag p-component", {
      "p-tag-info": a.severity === "info",
      "p-tag-success": a.severity === "success",
      "p-tag-warn": a.severity === "warn",
      "p-tag-danger": a.severity === "danger",
      "p-tag-secondary": a.severity === "secondary",
      "p-tag-contrast": a.severity === "contrast",
      "p-tag-rounded": a.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, Fe = G.extend({
  name: "tag",
  style: Ke,
  classes: je
}), Re = {
  name: "BaseTag",
  extends: J,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Fe,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function R(e) {
  "@babel/helpers - typeof";
  return R = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, R(e);
}
function Me(e, r, a) {
  return (r = We(r)) in e ? Object.defineProperty(e, r, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = a, e;
}
function We(e) {
  var r = He(e, "string");
  return R(r) == "symbol" ? r : r + "";
}
function He(e, r) {
  if (R(e) != "object" || !e) return e;
  var a = e[Symbol.toPrimitive];
  if (a !== void 0) {
    var i = a.call(e, r);
    if (R(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
}
var H = {
  name: "Tag",
  extends: Re,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return oe(Me({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Ze = ["data-p"];
function qe(e, r, a, i, p, s) {
  return c(), u("span", x({
    class: e.cx("root"),
    "data-p": s.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (c(), L(q(e.$slots.icon), x({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (c(), u("span", x({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : w("", !0), e.value != null || e.$slots.default ? F(e.$slots, "default", {
    key: 2
  }, function() {
    return [n("span", x({
      class: e.cx("label")
    }, e.ptm("label")), g(e.value), 17)];
  }) : w("", !0)], 16, Ze);
}
H.render = qe;
var Ge = {
  root: function(r) {
    var a = r.instance, i = r.props;
    return ["p-tab", {
      "p-tab-active": a.active,
      "p-disabled": i.disabled
    }];
  }
}, Je = G.extend({
  name: "tab",
  classes: Ge
}), Qe = {
  name: "BaseTab",
  extends: J,
  props: {
    value: {
      type: [String, Number],
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    as: {
      type: [String, Object],
      default: "BUTTON"
    },
    asChild: {
      type: Boolean,
      default: !1
    }
  },
  style: Je,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, re = {
  name: "Tab",
  extends: Qe,
  inheritAttrs: !1,
  inject: ["$pcTabs", "$pcTabList"],
  methods: {
    onFocus: function() {
      this.$pcTabs.selectOnFocus && this.changeActiveValue();
    },
    onClick: function() {
      this.changeActiveValue();
    },
    onKeydown: function(r) {
      switch (r.code) {
        case "ArrowRight":
          this.onArrowRightKey(r);
          break;
        case "ArrowLeft":
          this.onArrowLeftKey(r);
          break;
        case "Home":
          this.onHomeKey(r);
          break;
        case "End":
          this.onEndKey(r);
          break;
        case "PageDown":
          this.onPageDownKey(r);
          break;
        case "PageUp":
          this.onPageUpKey(r);
          break;
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.onEnterKey(r);
          break;
      }
    },
    onArrowRightKey: function(r) {
      var a = this.findNextTab(r.currentTarget);
      a ? this.changeFocusedTab(r, a) : this.onHomeKey(r), r.preventDefault();
    },
    onArrowLeftKey: function(r) {
      var a = this.findPrevTab(r.currentTarget);
      a ? this.changeFocusedTab(r, a) : this.onEndKey(r), r.preventDefault();
    },
    onHomeKey: function(r) {
      var a = this.findFirstTab();
      this.changeFocusedTab(r, a), r.preventDefault();
    },
    onEndKey: function(r) {
      var a = this.findLastTab();
      this.changeFocusedTab(r, a), r.preventDefault();
    },
    onPageDownKey: function(r) {
      this.scrollInView(this.findLastTab()), r.preventDefault();
    },
    onPageUpKey: function(r) {
      this.scrollInView(this.findFirstTab()), r.preventDefault();
    },
    onEnterKey: function(r) {
      this.changeActiveValue();
    },
    findNextTab: function(r) {
      var a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, i = a ? r : r.nextElementSibling;
      return i ? M(i, "data-p-disabled") || M(i, "data-pc-section") === "activebar" ? this.findNextTab(i) : Z(i, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(r) {
      var a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, i = a ? r : r.previousElementSibling;
      return i ? M(i, "data-p-disabled") || M(i, "data-pc-section") === "activebar" ? this.findPrevTab(i) : Z(i, '[data-pc-name="tab"]') : null;
    },
    findFirstTab: function() {
      return this.findNextTab(this.$pcTabList.$refs.tabs.firstElementChild, !0);
    },
    findLastTab: function() {
      return this.findPrevTab(this.$pcTabList.$refs.tabs.lastElementChild, !0);
    },
    changeActiveValue: function() {
      this.$pcTabs.updateValue(this.value);
    },
    changeFocusedTab: function(r, a) {
      ze(a), this.scrollInView(a);
    },
    scrollInView: function(r) {
      var a;
      r == null || (a = r.scrollIntoView) === null || a === void 0 || a.call(r, {
        block: "nearest"
      });
    }
  },
  computed: {
    active: function() {
      var r;
      return Be((r = this.$pcTabs) === null || r === void 0 ? void 0 : r.d_value, this.value);
    },
    id: function() {
      var r;
      return "".concat((r = this.$pcTabs) === null || r === void 0 ? void 0 : r.$id, "_tab_").concat(this.value);
    },
    ariaControls: function() {
      var r;
      return "".concat((r = this.$pcTabs) === null || r === void 0 ? void 0 : r.$id, "_tabpanel_").concat(this.value);
    },
    attrs: function() {
      return x(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
    },
    asAttrs: function() {
      return this.as === "BUTTON" ? {
        type: "button",
        disabled: this.disabled
      } : void 0;
    },
    a11yAttrs: function() {
      return {
        id: this.id,
        tabindex: this.active ? this.$pcTabs.tabindex : -1,
        role: "tab",
        "aria-selected": this.active,
        "aria-controls": this.ariaControls,
        "data-pc-name": "tab",
        "data-p-disabled": this.disabled,
        "data-p-active": this.active,
        onFocus: this.onFocus,
        onKeydown: this.onKeydown
      };
    },
    ptParams: function() {
      return {
        context: {
          active: this.active
        }
      };
    },
    dataP: function() {
      return oe({
        active: this.active
      });
    }
  },
  directives: {
    ripple: pe
  }
};
function Xe(e, r, a, i, p, s) {
  var y = de("ripple");
  return e.asChild ? F(e.$slots, "default", {
    key: 1,
    dataP: s.dataP,
    class: E(e.cx("root")),
    active: s.active,
    a11yAttrs: s.a11yAttrs,
    onClick: s.onClick
  }) : C((c(), L(q(e.as), x({
    key: 0,
    class: e.cx("root"),
    "data-p": s.dataP,
    onClick: s.onClick
  }, s.attrs), {
    default: $(function() {
      return [F(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[y]]);
}
re.render = Xe;
var ve = {
  name: "ChevronLeftIcon",
  extends: ue
};
function Ye(e) {
  return tr(e) || ar(e) || rr(e) || er();
}
function er() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function rr(e, r) {
  if (e) {
    if (typeof e == "string") return ae(e, r);
    var a = {}.toString.call(e).slice(8, -1);
    return a === "Object" && e.constructor && (a = e.constructor.name), a === "Map" || a === "Set" ? Array.from(e) : a === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a) ? ae(e, r) : void 0;
  }
}
function ar(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function tr(e) {
  if (Array.isArray(e)) return ae(e);
}
function ae(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var a = 0, i = Array(r); a < r; a++) i[a] = e[a];
  return i;
}
function or(e, r, a, i, p, s) {
  return c(), u("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ye(r[0] || (r[0] = [n("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ve.render = or;
var be = {
  name: "ChevronRightIcon",
  extends: ue
};
function nr(e) {
  return cr(e) || lr(e) || sr(e) || ir();
}
function ir() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function sr(e, r) {
  if (e) {
    if (typeof e == "string") return te(e, r);
    var a = {}.toString.call(e).slice(8, -1);
    return a === "Object" && e.constructor && (a = e.constructor.name), a === "Map" || a === "Set" ? Array.from(e) : a === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a) ? te(e, r) : void 0;
  }
}
function lr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function cr(e) {
  if (Array.isArray(e)) return te(e);
}
function te(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var a = 0, i = Array(r); a < r; a++) i[a] = e[a];
  return i;
}
function pr(e, r, a, i, p, s) {
  return c(), u("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), nr(r[0] || (r[0] = [n("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
be.render = pr;
var ur = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, dr = G.extend({
  name: "tablist",
  classes: ur
}), vr = {
  name: "BaseTabList",
  extends: J,
  props: {},
  style: dr,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, fe = {
  name: "TabList",
  extends: vr,
  inheritAttrs: !1,
  inject: ["$pcTabs"],
  data: function() {
    return {
      isPrevButtonEnabled: !1,
      isNextButtonEnabled: !0
    };
  },
  resizeObserver: void 0,
  inkBarObserver: void 0,
  watch: {
    showNavigators: function(r) {
      r ? this.bindResizeObserver() : this.unbindResizeObserver();
    },
    activeValue: {
      flush: "post",
      handler: function() {
        this.updateInkBar(), this.bindInkBarObserver();
      }
    }
  },
  mounted: function() {
    var r = this;
    setTimeout(function() {
      r.updateInkBar(), r.bindInkBarObserver();
    }, 150), this.showNavigators && (this.updateButtonState(), this.bindResizeObserver());
  },
  updated: function() {
    this.showNavigators && this.updateButtonState();
  },
  beforeUnmount: function() {
    this.unbindResizeObserver(), this.unbindInkBarObserver();
  },
  methods: {
    onScroll: function(r) {
      this.showNavigators && this.updateButtonState(), r.preventDefault();
    },
    onPrevButtonClick: function() {
      var r = this.$refs.content, a = this.getVisibleButtonWidths(), i = Q(r) - a, p = Math.abs(r.scrollLeft), s = i * 0.8, y = p - s, B = Math.max(y, 0);
      r.scrollLeft = ce(r) ? -1 * B : B;
    },
    onNextButtonClick: function() {
      var r = this.$refs.content, a = this.getVisibleButtonWidths(), i = Q(r) - a, p = Math.abs(r.scrollLeft), s = i * 0.8, y = p + s, B = r.scrollWidth - i, h = Math.min(y, B);
      r.scrollLeft = ce(r) ? -1 * h : h;
    },
    bindResizeObserver: function() {
      var r = this;
      this.resizeObserver = new ResizeObserver(function() {
        return r.updateButtonState();
      }), this.resizeObserver.observe(this.$refs.list);
    },
    unbindResizeObserver: function() {
      var r;
      (r = this.resizeObserver) === null || r === void 0 || r.unobserve(this.$refs.list), this.resizeObserver = void 0;
    },
    bindInkBarObserver: function() {
      var r = this;
      this.unbindInkBarObserver();
      var a = this.$refs.content, i = Z(a, '[data-pc-name="tab"][data-p-active="true"]');
      i && (this.inkBarObserver = new ResizeObserver(function() {
        return r.updateInkBar();
      }), this.inkBarObserver.observe(i));
    },
    unbindInkBarObserver: function() {
      var r;
      (r = this.inkBarObserver) === null || r === void 0 || r.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var r = this.$refs, a = r.content, i = r.inkbar, p = r.tabs;
      if (i) {
        var s = Z(a, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (i.style.height = Ae(s) + "px", i.style.top = W(s).top - W(p).top + "px") : (i.style.width = Le(s) + "px", i.style.left = W(s).left - W(p).left + "px");
      }
    },
    updateButtonState: function() {
      var r = this.$refs, a = r.list, i = r.content, p = i.scrollTop, s = i.scrollWidth, y = i.scrollHeight, B = i.offsetWidth, h = i.offsetHeight, S = Math.abs(i.scrollLeft), k = [Q(i), Se(i)], v = k[0], I = k[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = p !== 0, this.isNextButtonEnabled = a.offsetHeight >= h && parseInt(p) !== y - I) : (this.isPrevButtonEnabled = S !== 0, this.isNextButtonEnabled = a.offsetWidth >= B && parseInt(S) !== s - v);
    },
    getVisibleButtonWidths: function() {
      var r = this.$refs, a = r.prevButton, i = r.nextButton, p = 0;
      return this.showNavigators && (p = (a?.offsetWidth || 0) + (i?.offsetWidth || 0)), p;
    }
  },
  computed: {
    templates: function() {
      return this.$pcTabs.$slots;
    },
    activeValue: function() {
      return this.$pcTabs.d_value;
    },
    showNavigators: function() {
      return this.$pcTabs.showNavigators;
    },
    prevButtonAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.previous : void 0;
    },
    nextButtonAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.next : void 0;
    },
    dataP: function() {
      return oe({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: ve,
    ChevronRightIcon: be
  },
  directives: {
    ripple: pe
  }
}, br = ["data-p"], fr = ["aria-label", "tabindex"], hr = ["data-p"], gr = ["aria-orientation"], mr = ["aria-label", "tabindex"];
function yr(e, r, a, i, p, s) {
  var y = de("ripple");
  return c(), u("div", x({
    ref: "list",
    class: e.cx("root"),
    "data-p": s.dataP
  }, e.ptmi("root")), [s.showNavigators && p.isPrevButtonEnabled ? C((c(), u("button", x({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: e.cx("prevButton"),
    "aria-label": s.prevButtonAriaLabel,
    tabindex: s.$pcTabs.tabindex,
    onClick: r[0] || (r[0] = function() {
      return s.onPrevButtonClick && s.onPrevButtonClick.apply(s, arguments);
    })
  }, e.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(c(), L(q(s.templates.previcon || "ChevronLeftIcon"), x({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, fr)), [[y]]) : w("", !0), n("div", x({
    ref: "content",
    class: e.cx("content"),
    onScroll: r[1] || (r[1] = function() {
      return s.onScroll && s.onScroll.apply(s, arguments);
    }),
    "data-p": s.dataP
  }, e.ptm("content")), [n("div", x({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": s.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [F(e.$slots, "default"), n("span", x({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, gr)], 16, hr), s.showNavigators && p.isNextButtonEnabled ? C((c(), u("button", x({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: e.cx("nextButton"),
    "aria-label": s.nextButtonAriaLabel,
    tabindex: s.$pcTabs.tabindex,
    onClick: r[2] || (r[2] = function() {
      return s.onNextButtonClick && s.onNextButtonClick.apply(s, arguments);
    })
  }, e.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(c(), L(q(s.templates.nexticon || "ChevronRightIcon"), x({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, mr)), [[y]]) : w("", !0)], 16, br);
}
fe.render = yr;
var xr = `
    .p-tabs {
        display: flex;
        flex-direction: column;
    }

    .p-tablist {
        display: flex;
        position: relative;
        overflow: hidden;
        background: dt('tabs.tablist.background');
    }

    .p-tablist-viewport {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        scrollbar-width: none;
        overscroll-behavior: contain auto;
    }

    .p-tablist-viewport::-webkit-scrollbar {
        display: none;
    }

    .p-tablist-tab-list {
        position: relative;
        display: flex;
        border-style: solid;
        border-color: dt('tabs.tablist.border.color');
        border-width: dt('tabs.tablist.border.width');
    }

    .p-tablist-content {
        flex-grow: 1;
    }

    .p-tablist-nav-button {
        all: unset;
        position: absolute !important;
        flex-shrink: 0;
        inset-block-start: 0;
        z-index: 2;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: dt('tabs.nav.button.background');
        color: dt('tabs.nav.button.color');
        width: dt('tabs.nav.button.width');
        transition:
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        box-shadow: dt('tabs.nav.button.shadow');
        outline-color: transparent;
        cursor: pointer;
    }

    .p-tablist-nav-button:focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.nav.button.focus.ring.shadow');
        outline: dt('tabs.nav.button.focus.ring.width') dt('tabs.nav.button.focus.ring.style') dt('tabs.nav.button.focus.ring.color');
        outline-offset: dt('tabs.nav.button.focus.ring.offset');
    }

    .p-tablist-nav-button:hover {
        color: dt('tabs.nav.button.hover.color');
    }

    .p-tablist-prev-button {
        inset-inline-start: 0;
    }

    .p-tablist-next-button {
        inset-inline-end: 0;
    }

    .p-tablist-prev-button:dir(rtl),
    .p-tablist-next-button:dir(rtl) {
        transform: rotate(180deg);
    }

    .p-tab {
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        position: relative;
        border-style: solid;
        white-space: nowrap;
        gap: dt('tabs.tab.gap');
        background: dt('tabs.tab.background');
        border-width: dt('tabs.tab.border.width');
        border-color: dt('tabs.tab.border.color');
        color: dt('tabs.tab.color');
        padding: dt('tabs.tab.padding');
        font-weight: dt('tabs.tab.font.weight');
        transition:
            background dt('tabs.transition.duration'),
            border-color dt('tabs.transition.duration'),
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        margin: dt('tabs.tab.margin');
        outline-color: transparent;
    }

    .p-tab:not(.p-disabled):focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.tab.focus.ring.shadow');
        outline: dt('tabs.tab.focus.ring.width') dt('tabs.tab.focus.ring.style') dt('tabs.tab.focus.ring.color');
        outline-offset: dt('tabs.tab.focus.ring.offset');
    }

    .p-tab:not(.p-tab-active):not(.p-disabled):hover {
        background: dt('tabs.tab.hover.background');
        border-color: dt('tabs.tab.hover.border.color');
        color: dt('tabs.tab.hover.color');
    }

    .p-tab-active {
        background: dt('tabs.tab.active.background');
        border-color: dt('tabs.tab.active.border.color');
        color: dt('tabs.tab.active.color');
    }

    .p-tabpanels {
        background: dt('tabs.tabpanel.background');
        color: dt('tabs.tabpanel.color');
        padding: dt('tabs.tabpanel.padding');
        outline: 0 none;
    }

    .p-tabpanel:focus-visible {
        box-shadow: dt('tabs.tabpanel.focus.ring.shadow');
        outline: dt('tabs.tabpanel.focus.ring.width') dt('tabs.tabpanel.focus.ring.style') dt('tabs.tabpanel.focus.ring.color');
        outline-offset: dt('tabs.tabpanel.focus.ring.offset');
    }

    .p-tablist-active-bar {
        z-index: 1;
        display: block;
        position: absolute;
        inset-block-end: dt('tabs.active.bar.bottom');
        height: dt('tabs.active.bar.height');
        background: dt('tabs.active.bar.background');
        transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
    }
`, wr = {
  root: function(r) {
    var a = r.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": a.scrollable
    }];
  }
}, kr = G.extend({
  name: "tabs",
  style: xr,
  classes: wr
}), $r = {
  name: "BaseTabs",
  extends: J,
  props: {
    value: {
      type: [String, Number],
      default: void 0
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    scrollable: {
      type: Boolean,
      default: !1
    },
    showNavigators: {
      type: Boolean,
      default: !0
    },
    tabindex: {
      type: Number,
      default: 0
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    }
  },
  style: kr,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, he = {
  name: "Tabs",
  extends: $r,
  inheritAttrs: !1,
  emits: ["update:value"],
  data: function() {
    return {
      d_value: this.value
    };
  },
  watch: {
    value: function(r) {
      this.d_value = r;
    }
  },
  methods: {
    updateValue: function(r) {
      this.d_value !== r && (this.d_value = r, this.$emit("update:value", r));
    },
    isVertical: function() {
      return this.orientation === "vertical";
    }
  }
};
function _r(e, r, a, i, p, s) {
  return c(), u("div", x({
    class: e.cx("root")
  }, e.ptmi("root")), [F(e.$slots, "default")], 16);
}
he.render = _r;
const Cr = { class: "ku" }, Tr = { class: "kx-head" }, Br = { class: "kx-head-icon" }, zr = { class: "kx-head-actions" }, Sr = { class: "ku-bar" }, Ar = { class: "ku-count" }, Lr = {
  key: 0,
  role: "alert",
  class: "kx-err"
}, Ir = {
  key: 1,
  class: "kx-err"
}, Pr = ["id"], Vr = {
  key: 0,
  class: "kx-loading"
}, Er = {
  key: 1,
  class: "ku-empty kx-empty"
}, Or = { class: "kx-empty-ico" }, Nr = { class: "kx-empty-title" }, Ur = { class: "kx-empty-sub" }, Dr = { class: "kx-empty-actions" }, Kr = {
  key: 2,
  class: "ku-list"
}, jr = ["aria-label"], Fr = { class: "ku-account" }, Rr = { class: "ku-avatar" }, Mr = { class: "ku-id" }, Wr = { class: "ku-name" }, Hr = { class: "ku-email" }, Zr = { class: "ku-meta" }, qr = { class: "ku-date" }, Gr = { class: "ku-actions" }, Jr = { class: "kx-modal-head-icon" }, Qr = { class: "kx-modal-head-text" }, Xr = { class: "kx-modal-head-title" }, Yr = {
  key: 0,
  class: "ku-field"
}, ea = { class: "ku-field" }, ra = {
  key: 1,
  class: "ku-field"
}, aa = { class: "ku-field" }, ta = {
  key: 0,
  class: "ku-check"
}, oa = ["value"], na = { class: "ku-check-label" }, ia = { class: "ku-check-id" }, sa = {
  key: 0,
  class: "ku-field"
}, la = { class: "ku-field" }, ca = { class: "ku-field" }, pa = ["value"], ua = {
  key: 1,
  class: "ku-field"
}, da = { class: "ku-field" }, va = ["value"], ba = { class: "ku-check-label" }, fa = { class: "ku-check-id" }, ha = {
  key: 2,
  role: "alert",
  class: "kx-err inline"
}, ga = {
  key: 3,
  class: "kx-err inline"
}, ma = /* @__PURE__ */ Ve({
  __name: "users",
  setup(e) {
    const r = [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Suspended", value: "suspended" },
      { label: "Pending", value: "pending" }
    ], a = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, i = _([]), p = _("users"), s = _(!1), y = _([]), B = _(!1), h = _(""), S = _(""), k = _(!1), v = _({ email: "", full_name: "", password: "", groups: [] }), I = _(!0), A = _(!1), O = _(!1), b = _({ user_id: "", email: "", full_name: "", status: "", password: "", groups: [] }), U = X({
      get: () => k.value || O.value,
      set: (l) => {
        l || (k.value = !1, O.value = !1);
      }
    }), ne = X(() => (k.value ? "Create " : "Edit ") + (T.value ? "bot" : "user")), T = X(() => k.value ? p.value === "bots" : s.value);
    function ge(l) {
      switch (l) {
        case "active":
          return "success";
        case "suspended":
          return "danger";
        case "pending":
          return "warn";
        default:
          return "secondary";
      }
    }
    function me(l) {
      return y.value.find((t) => t.id === l)?.label ?? l;
    }
    function ye(l) {
      const t = y.value.find((o) => o.id === l);
      return l === "app.security:admin" ? "warn" : t && t.built_in === !1 ? "success" : "info";
    }
    function xe(l) {
      return (l.full_name || l.email).split(" ").map((o) => o[0]).join("").toUpperCase().slice(0, 2);
    }
    async function D() {
      B.value = !0, h.value = "";
      try {
        const { data: l } = await j.get(p.value === "bots" ? "/api/v1/users/bots" : "/api/v1/users");
        i.value = l.success ? l.users || [] : [];
      } catch (l) {
        i.value = [], h.value = l instanceof Error ? l.message : "failed to load users";
      } finally {
        B.value = !1;
      }
    }
    async function we() {
      S.value = "";
      try {
        const { data: l } = await j.get("/api/v1/users/assignable-scopes"), t = l.success ? l.scopes || [] : [];
        y.value = t.map((o) => ({
          id: o.id,
          label: o.label || o.id,
          description: o.description,
          built_in: o.source === "builtin"
        }));
      } catch (l) {
        y.value = [], S.value = l instanceof Error ? l.message : "failed to load security groups";
      }
    }
    async function ke(l) {
      p.value = l, k.value = !1, O.value = !1, await D();
    }
    function ie() {
      v.value = { email: "", full_name: "", password: "", groups: [] }, I.value = !0, O.value = !1, k.value = !0;
    }
    async function se() {
      if (!(T.value ? !v.value.full_name.trim() : !v.value.email || !v.value.password)) {
        A.value = !0, h.value = "";
        try {
          const l = T.value ? { full_name: v.value.full_name, groups: v.value.groups } : {
            email: v.value.email,
            full_name: v.value.full_name,
            password: v.value.password,
            ...I.value ? {} : { groups: v.value.groups }
          }, { data: t } = await j.post(
            T.value ? "/api/v1/users/bots" : "/api/v1/users",
            l
          );
          t.success && t.user ? (k.value = !1, await D()) : h.value = t.error || "failed to create user";
        } catch (l) {
          h.value = l instanceof Error ? l.message : "failed to create user";
        } finally {
          A.value = !1;
        }
      }
    }
    function $e(l) {
      k.value = !1, s.value = l.bot_account === !0, b.value = {
        user_id: l.user_id,
        email: l.email,
        full_name: l.full_name,
        status: l.status,
        password: "",
        groups: [...l.security_groups]
      }, O.value = !0;
    }
    async function le() {
      const l = b.value.user_id;
      if (l) {
        A.value = !0, h.value = "";
        try {
          const t = {};
          !s.value && b.value.email && (t.email = b.value.email), b.value.full_name && (t.full_name = b.value.full_name), b.value.status && (t.status = b.value.status), !s.value && b.value.password && (t.password = b.value.password);
          const { data: o } = await j.put(`/api/v1/users/${l}`, { ...t, groups: b.value.groups });
          o.success ? (O.value = !1, await D()) : h.value = o.error || "failed to update user";
        } catch (t) {
          h.value = t instanceof Error ? t.message : "failed to update user";
        } finally {
          A.value = !1;
        }
      }
    }
    async function _e(l) {
      const t = l.full_name || l.email;
      if (await Ne.confirm({
        header: l.bot_account ? "Disable bot" : "Delete user",
        message: l.bot_account ? `Disable “${t}”? This revokes access and retains the account and its history.` : `Delete “${t}”? This permanently removes the user and revokes all access.`,
        icon: "tabler:trash",
        acceptLabel: l.bot_account ? "Disable" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        h.value = "";
        try {
          const { data: m } = await j.delete(`/api/v1/users/${l.user_id}`);
          m.success ? await D() : h.value = m.error || "failed to delete user";
        } catch (m) {
          h.value = m instanceof Error ? m.message : "failed to delete user";
        }
      }
    }
    return Ce(async () => {
      await we(), await D();
    }), (l, t) => (c(), u("div", Cr, [
      n("header", Tr, [
        n("div", Br, [
          f(d(z), {
            icon: "tabler:users",
            "aria-hidden": "true"
          })
        ]),
        t[14] || (t[14] = n("div", { class: "kx-head-text" }, [
          n("h1", { class: "kx-title" }, "Users"),
          n("p", { class: "kx-head-sub" }, "Manage user and bot accounts and their security groups.")
        ], -1)),
        n("div", zr, [
          f(d(P), {
            type: "button",
            "aria-label": p.value === "bots" ? "Create bot" : "Create user",
            class: "ku-btn-primary",
            label: p.value === "bots" ? "Create bot" : "Create user",
            onClick: ie
          }, {
            icon: $(({ class: o }) => [
              f(d(z), {
                icon: "tabler:user-plus",
                class: E(o),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["aria-label", "label"])
        ])
      ]),
      f(d(he), {
        class: "ku-tabs",
        value: p.value,
        "onUpdate:value": t[0] || (t[0] = (o) => ke(o))
      }, {
        default: $(() => [
          f(d(fe), { "aria-label": "Account type" }, {
            default: $(() => [
              f(d(re), {
                value: "users",
                "aria-controls": "users-accounts"
              }, {
                default: $(() => [...t[15] || (t[15] = [
                  Y("All users", -1)
                ])]),
                _: 1
              }),
              f(d(re), {
                value: "bots",
                "aria-controls": "users-bots"
              }, {
                default: $(() => [...t[16] || (t[16] = [
                  Y("Bots", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      n("div", Sr, [
        n("span", Ar, g(i.value.length) + " " + g(p.value === "bots" ? "bot" : "user") + g(i.value.length !== 1 ? "s" : ""), 1)
      ]),
      h.value && !U.value ? (c(), u("div", Lr, g(h.value), 1)) : w("", !0),
      S.value && !U.value ? (c(), u("div", Ir, g(S.value), 1)) : w("", !0),
      n("div", {
        class: "ku-body",
        role: "tabpanel",
        id: p.value === "bots" ? "users-bots" : "users-accounts"
      }, [
        B.value ? (c(), u("div", Vr, [
          f(d(z), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          t[17] || (t[17] = Y(" Loading…", -1))
        ])) : i.value.length ? (c(), u("div", Kr, [
          n("table", {
            class: "ku-table",
            "aria-label": p.value === "bots" ? "Bots" : "All users"
          }, [
            t[18] || (t[18] = n("thead", null, [
              n("tr", null, [
                n("th", { scope: "col" }, "Account"),
                n("th", { scope: "col" }, "Status"),
                n("th", { scope: "col" }, "Security groups"),
                n("th", { scope: "col" }, "Created"),
                n("th", { scope: "col" }, [
                  n("span", { class: "sr-only" }, "Actions")
                ])
              ])
            ], -1)),
            n("tbody", null, [
              (c(!0), u(V, null, K(i.value, (o) => (c(), u("tr", {
                key: o.user_id,
                class: "ku-row"
              }, [
                n("td", null, [
                  n("div", Fr, [
                    n("span", Rr, g(xe(o)), 1),
                    n("div", Mr, [
                      n("div", Wr, g(o.full_name || o.email), 1),
                      n("div", Hr, g(o.email), 1)
                    ]),
                    o.bot_account ? (c(), L(d(H), {
                      key: 0,
                      severity: "info",
                      value: "Bot",
                      class: "ku-badge kx-tag-sm"
                    })) : w("", !0)
                  ])
                ]),
                n("td", null, [
                  f(d(H), {
                    severity: ge(o.status),
                    value: o.status,
                    class: "ku-badge kx-tag-sm"
                  }, null, 8, ["severity", "value"])
                ]),
                n("td", null, [
                  n("div", Zr, [
                    (c(!0), u(V, null, K(o.security_groups, (m) => (c(), L(d(H), {
                      key: m,
                      severity: ye(m),
                      value: me(m),
                      class: "ku-badge kx-tag-sm"
                    }, null, 8, ["severity", "value"]))), 128))
                  ])
                ]),
                n("td", qr, g(d(De)(o.created_at, { month: "short", day: "numeric", year: "numeric" })), 1),
                n("td", null, [
                  n("div", Gr, [
                    f(d(P), {
                      type: "button",
                      severity: "secondary",
                      outlined: "",
                      size: "small",
                      "aria-label": `Edit ${o.full_name || o.email}`,
                      onClick: (m) => $e(o)
                    }, {
                      icon: $(({ class: m }) => [
                        f(d(z), {
                          icon: "tabler:edit",
                          class: E(m),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "onClick"]),
                    f(d(P), {
                      type: "button",
                      severity: "danger",
                      outlined: "",
                      size: "small",
                      "aria-label": `${o.bot_account ? "Disable" : "Delete"} ${o.full_name || o.email}`,
                      onClick: (m) => _e(o)
                    }, {
                      icon: $(({ class: m }) => [
                        f(d(z), {
                          icon: "tabler:trash",
                          class: E(m),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "onClick"])
                  ])
                ])
              ]))), 128))
            ])
          ], 8, jr)
        ])) : (c(), u("div", Er, [
          n("div", Or, [
            f(d(z), {
              icon: p.value === "bots" ? "tabler:robot" : "tabler:users",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          n("div", Nr, "No " + g(p.value === "bots" ? "bots" : "users") + " yet", 1),
          n("div", Ur, g(p.value === "bots" ? "Create a bot account and choose its security groups." : "Create your first user to grant access to the workspace."), 1),
          n("div", Dr, [
            f(d(P), {
              type: "button",
              "aria-label": p.value === "bots" ? "Create bot" : "Create user",
              class: "ku-btn-primary",
              label: p.value === "bots" ? "Create bot" : "Create user",
              onClick: ie
            }, {
              icon: $(({ class: o }) => [
                f(d(z), {
                  icon: "tabler:user-plus",
                  class: E(o),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["aria-label", "label"])
          ])
        ]))
      ], 8, Pr),
      f(d(Ie), {
        visible: U.value,
        "onUpdate:visible": t[13] || (t[13] = (o) => U.value = o),
        modal: "",
        class: "kx-dialog",
        pt: a,
        "aria-label": ne.value
      }, {
        header: $(() => [
          n("span", Jr, [
            f(d(z), {
              icon: T.value ? "tabler:robot" : "tabler:user",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          n("span", Qr, [
            n("span", Xr, g(ne.value), 1)
          ])
        ]),
        footer: $(() => [
          f(d(P), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: A.value,
            onClick: t[12] || (t[12] = (o) => U.value = !1)
          }, null, 8, ["disabled"]),
          k.value ? (c(), L(d(P), {
            key: 0,
            type: "button",
            label: "Create",
            class: "ku-btn-primary",
            loading: A.value,
            disabled: A.value || (T.value ? !v.value.full_name.trim() : !v.value.email || !v.value.password),
            onClick: se
          }, {
            icon: $(({ class: o }) => [
              f(d(z), {
                icon: "tabler:check",
                class: E(o),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])) : (c(), L(d(P), {
            key: 1,
            type: "button",
            label: "Save",
            class: "ku-btn-primary",
            loading: A.value,
            disabled: A.value,
            onClick: le
          }, {
            icon: $(({ class: o }) => [
              f(d(z), {
                icon: "tabler:device-floppy",
                class: E(o),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"]))
        ]),
        default: $(() => [
          n("form", {
            class: "ku-form",
            onSubmit: t[11] || (t[11] = Ee((o) => k.value ? se() : le(), ["prevent"]))
          }, [
            k.value ? (c(), u(V, { key: 0 }, [
              T.value ? w("", !0) : (c(), u("div", Yr, [
                t[19] || (t[19] = n("label", {
                  class: "ku-label",
                  for: "account-email"
                }, "Email", -1)),
                C(n("input", {
                  id: "account-email",
                  "onUpdate:modelValue": t[1] || (t[1] = (o) => v.value.email = o),
                  type: "email",
                  class: "ku-input",
                  placeholder: "user@example.com"
                }, null, 512), [
                  [N, v.value.email]
                ])
              ])),
              n("div", ea, [
                t[20] || (t[20] = n("label", {
                  class: "ku-label",
                  for: "account-name"
                }, "Full name", -1)),
                C(n("input", {
                  id: "account-name",
                  "onUpdate:modelValue": t[2] || (t[2] = (o) => v.value.full_name = o),
                  "aria-label": "Full name",
                  type: "text",
                  class: "ku-input",
                  placeholder: "Jane Doe"
                }, null, 512), [
                  [N, v.value.full_name]
                ])
              ]),
              T.value ? w("", !0) : (c(), u("div", ra, [
                t[21] || (t[21] = n("label", {
                  class: "ku-label",
                  for: "account-password"
                }, "Password", -1)),
                C(n("input", {
                  id: "account-password",
                  "onUpdate:modelValue": t[3] || (t[3] = (o) => v.value.password = o),
                  type: "password",
                  class: "ku-input",
                  placeholder: "Minimum 8 characters",
                  autocomplete: "new-password"
                }, null, 512), [
                  [N, v.value.password]
                ])
              ])),
              n("div", aa, [
                t[23] || (t[23] = n("label", { class: "ku-label" }, "Security groups", -1)),
                T.value ? w("", !0) : (c(), u("label", ta, [
                  C(n("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": t[4] || (t[4] = (o) => I.value = o),
                    "aria-label": "Use default membership"
                  }, null, 512), [
                    [ee, I.value]
                  ]),
                  t[22] || (t[22] = n("span", { class: "ku-check-label" }, "Use default membership", -1))
                ])),
                T.value || !I.value ? (c(!0), u(V, { key: 1 }, K(y.value, (o) => (c(), u("label", {
                  key: o.id,
                  class: "ku-check"
                }, [
                  C(n("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": t[5] || (t[5] = (m) => v.value.groups = m),
                    value: o.id
                  }, null, 8, oa), [
                    [ee, v.value.groups]
                  ]),
                  n("span", na, g(o.label), 1),
                  n("span", ia, g(o.id), 1)
                ]))), 128)) : w("", !0)
              ])
            ], 64)) : (c(), u(V, { key: 1 }, [
              T.value ? w("", !0) : (c(), u("div", sa, [
                t[24] || (t[24] = n("label", {
                  class: "ku-label",
                  for: "account-email"
                }, "Email", -1)),
                C(n("input", {
                  id: "account-email",
                  "onUpdate:modelValue": t[6] || (t[6] = (o) => b.value.email = o),
                  type: "email",
                  class: "ku-input"
                }, null, 512), [
                  [N, b.value.email]
                ])
              ])),
              n("div", la, [
                t[25] || (t[25] = n("label", {
                  class: "ku-label",
                  for: "account-name"
                }, "Full name", -1)),
                C(n("input", {
                  id: "account-name",
                  "onUpdate:modelValue": t[7] || (t[7] = (o) => b.value.full_name = o),
                  "aria-label": "Full name",
                  type: "text",
                  class: "ku-input"
                }, null, 512), [
                  [N, b.value.full_name]
                ])
              ]),
              n("div", ca, [
                t[26] || (t[26] = n("label", { class: "ku-label" }, "Status", -1)),
                C(n("select", {
                  "onUpdate:modelValue": t[8] || (t[8] = (o) => b.value.status = o),
                  class: "ku-input",
                  "aria-label": "Status"
                }, [
                  (c(), u(V, null, K(r, (o) => n("option", {
                    key: o.value,
                    value: o.value
                  }, g(o.label), 9, pa)), 64))
                ], 512), [
                  [Oe, b.value.status]
                ])
              ]),
              T.value ? w("", !0) : (c(), u("div", ua, [
                t[27] || (t[27] = n("label", {
                  class: "ku-label",
                  for: "account-password"
                }, "New password", -1)),
                C(n("input", {
                  id: "account-password",
                  "onUpdate:modelValue": t[9] || (t[9] = (o) => b.value.password = o),
                  type: "password",
                  class: "ku-input",
                  placeholder: "Leave empty to keep current",
                  autocomplete: "new-password"
                }, null, 512), [
                  [N, b.value.password]
                ])
              ])),
              n("div", da, [
                t[28] || (t[28] = n("label", { class: "ku-label" }, "Security groups", -1)),
                (c(!0), u(V, null, K(y.value, (o) => (c(), u("label", {
                  key: o.id,
                  class: "ku-check"
                }, [
                  C(n("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": t[10] || (t[10] = (m) => b.value.groups = m),
                    value: o.id
                  }, null, 8, va), [
                    [ee, b.value.groups]
                  ]),
                  n("span", ba, g(o.label), 1),
                  n("span", fa, g(o.id), 1)
                ]))), 128))
              ])
            ], 64)),
            h.value ? (c(), u("div", ha, g(h.value), 1)) : w("", !0),
            S.value ? (c(), u("div", ga, g(S.value), 1)) : w("", !0)
          ], 32)
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])
    ]));
  }
}), ya = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-modal-head-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-modal-head-icon svg{width:20px;height:20px}.kx-modal-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-modal-head-title{font-size:15.5px;font-weight:700;color:var(--p-text-color);line-height:1.2}.kx-modal-head-sub{font-size:12.5px;font-weight:400;color:var(--p-text-muted-color);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.ku{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.ku-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin:0;padding:16px 24px 10px;flex-wrap:wrap}.ku-count{font-size:12.5px;color:var(--p-text-muted-color)}.ku-tabs{padding:0 24px}.ku-body{flex:1 0 auto;min-height:0;width:100%;margin:0;padding:6px 24px 20px}.ku-list{border:1px solid var(--p-content-border-color);border-radius:14px;overflow-x:auto}.ku-table{width:100%;border-collapse:collapse;text-align:left}.ku-table th{padding:12px 16px;font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.ku-table td{padding:11px 16px;border-top:1px solid var(--p-content-border-color);vertical-align:middle}.ku-row:hover{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.ku-account{display:flex;align-items:center;gap:14px}.ku-avatar{width:40px;height:40px;flex:none;border-radius:10px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);font-weight:700;font-size:13px}.ku-id{min-width:0}.ku-name{font-size:14px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ku-email{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ku-meta{display:flex;flex-wrap:wrap;gap:5px}.ku-badge{text-transform:capitalize}.ku-date{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap}.ku-actions{display:flex;justify-content:flex-end;gap:6px}.ku-form{padding:16px 20px;display:flex;flex-direction:column;gap:14px}.ku-field{display:flex;flex-direction:column;gap:6px}.ku-label{font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.ku-input{width:100%;padding:8px 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.ku-check{display:flex;align-items:center;gap:8px;cursor:pointer}.ku-check input{accent-color:var(--p-primary-color)}.ku-check-label{font-size:13px;color:var(--p-text-color)}.ku-check-id{font-size:11px;color:var(--p-text-muted-color);font-family:ui-monospace,monospace}.kx-dialog{--p-dialog-content-padding: 0;width:min(520px,calc(100vw - 32px))}.kx-dialog>.kx-dialog-header{display:flex;align-items:center;gap:12px;padding:16px 20px}.kx-dialog>.kx-dialog-content{padding:0;overflow:auto;min-height:0}.kx-dialog>.kx-dialog-footer{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}', xa = { props: { type: "object", properties: {} } }, wa = {
  wippy: xa
};
class ka extends Te {
  static get wippyConfig() {
    return {
      propsSchema: wa.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ya
    };
  }
  static get vueConfig() {
    return { rootComponent: ma, plugins: [Pe] };
  }
}
Ue(import.meta.url, ka);
//# sourceMappingURL=index.js.map
