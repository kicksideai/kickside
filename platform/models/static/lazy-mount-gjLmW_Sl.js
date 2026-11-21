import { B as G, R as Me, s as ae, f as ue, k as gt, b as J, Q as re, z as de, a as je, c as he, T as wt, C as $t, K as ie, v as Ct, V as Ie, L as St, d as X, e as xt, U as Tt, I as Oe, g as Bt, h as _t, r as Ue, i as Lt, j as Pt, x as ye, m as Et, u as It, P as Ot } from "./wc-runtime-DYOSFvWw.js";
import { mergeProps as B, resolveDirective as Se, withDirectives as ce, openBlock as i, createBlock as C, resolveDynamicComponent as Y, withCtx as x, renderSlot as I, normalizeClass as H, createElementBlock as c, createElementVNode as l, createCommentVNode as k, defineComponent as A, unref as r, createVNode as y, Fragment as R, renderList as K, createTextVNode as _, toDisplayString as m, getCurrentInstance as At, computed as $, createSlots as He, resolveComponent as Ae, Transition as Dt, normalizeStyle as Ft, reactive as Vt, toRef as zt, watch as We, ref as z } from "vue";
import { host as De } from "@wippy-fe/proxy";
import { Icon as F } from "@iconify/vue";
import { s as xe, _ as Te, a as Be, b as Rt, i as Nt, c as Kt } from "./ProviderProfileEditor.vue_vue_type_script_setup_true_lang-Bk2OLic6.js";
import { s as Mt, p as jt, h as Ut, a as Ht, b as Wt, m as _e, o as Zt, c as qt, d as Jt, e as Gt, f as se, _ as le, i as Fe, g as Ve, u as Qt, j as ze, k as Xt, l as Yt, n as en } from "./useModelsApi-Df0MsoJU.js";
var tn = {
  root: function(t) {
    var n = t.instance, a = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": a.disabled
    }];
  }
}, nn = G.extend({
  name: "tab",
  classes: tn
}), an = {
  name: "BaseTab",
  extends: ae,
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
  style: nn,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, Ze = {
  name: "Tab",
  extends: an,
  inheritAttrs: !1,
  inject: ["$pcTabs", "$pcTabList"],
  methods: {
    onFocus: function() {
      this.$pcTabs.selectOnFocus && this.changeActiveValue();
    },
    onClick: function() {
      this.changeActiveValue();
    },
    onKeydown: function(t) {
      switch (t.code) {
        case "ArrowRight":
          this.onArrowRightKey(t);
          break;
        case "ArrowLeft":
          this.onArrowLeftKey(t);
          break;
        case "Home":
          this.onHomeKey(t);
          break;
        case "End":
          this.onEndKey(t);
          break;
        case "PageDown":
          this.onPageDownKey(t);
          break;
        case "PageUp":
          this.onPageUpKey(t);
          break;
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.onEnterKey(t);
          break;
      }
    },
    onArrowRightKey: function(t) {
      var n = this.findNextTab(t.currentTarget);
      n ? this.changeFocusedTab(t, n) : this.onHomeKey(t), t.preventDefault();
    },
    onArrowLeftKey: function(t) {
      var n = this.findPrevTab(t.currentTarget);
      n ? this.changeFocusedTab(t, n) : this.onEndKey(t), t.preventDefault();
    },
    onHomeKey: function(t) {
      var n = this.findFirstTab();
      this.changeFocusedTab(t, n), t.preventDefault();
    },
    onEndKey: function(t) {
      var n = this.findLastTab();
      this.changeFocusedTab(t, n), t.preventDefault();
    },
    onPageDownKey: function(t) {
      this.scrollInView(this.findLastTab()), t.preventDefault();
    },
    onPageUpKey: function(t) {
      this.scrollInView(this.findFirstTab()), t.preventDefault();
    },
    onEnterKey: function(t) {
      this.changeActiveValue();
    },
    findNextTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, a = n ? t : t.nextElementSibling;
      return a ? re(a, "data-p-disabled") || re(a, "data-pc-section") === "activebar" ? this.findNextTab(a) : de(a, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, a = n ? t : t.previousElementSibling;
      return a ? re(a, "data-p-disabled") || re(a, "data-pc-section") === "activebar" ? this.findPrevTab(a) : de(a, '[data-pc-name="tab"]') : null;
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
    changeFocusedTab: function(t, n) {
      J(n), this.scrollInView(n);
    },
    scrollInView: function(t) {
      var n;
      t == null || (n = t.scrollIntoView) === null || n === void 0 || n.call(t, {
        block: "nearest"
      });
    }
  },
  computed: {
    active: function() {
      var t;
      return gt((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
    },
    id: function() {
      var t;
      return "".concat((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.$id, "_tab_").concat(this.value);
    },
    ariaControls: function() {
      var t;
      return "".concat((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.$id, "_tabpanel_").concat(this.value);
    },
    attrs: function() {
      return B(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return ue({
        active: this.active
      });
    }
  },
  directives: {
    ripple: Me
  }
};
function on(e, t, n, a, s, o) {
  var u = Se("ripple");
  return e.asChild ? I(e.$slots, "default", {
    key: 1,
    dataP: o.dataP,
    class: H(e.cx("root")),
    active: o.active,
    a11yAttrs: o.a11yAttrs,
    onClick: o.onClick
  }) : ce((i(), C(Y(e.as), B({
    key: 0,
    class: e.cx("root"),
    "data-p": o.dataP,
    onClick: o.onClick
  }, o.attrs), {
    default: x(function() {
      return [I(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[u]]);
}
Ze.render = on;
var qe = {
  name: "ChevronLeftIcon",
  extends: je
};
function rn(e) {
  return cn(e) || dn(e) || ln(e) || sn();
}
function sn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ln(e, t) {
  if (e) {
    if (typeof e == "string") return we(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? we(e, t) : void 0;
  }
}
function dn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function cn(e) {
  if (Array.isArray(e)) return we(e);
}
function we(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function un(e, t, n, a, s, o) {
  return i(), c("svg", B({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), rn(t[0] || (t[0] = [l("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
qe.render = un;
var Je = {
  name: "ChevronRightIcon",
  extends: je
};
function pn(e) {
  return mn(e) || vn(e) || fn(e) || bn();
}
function bn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fn(e, t) {
  if (e) {
    if (typeof e == "string") return $e(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? $e(e, t) : void 0;
  }
}
function vn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function mn(e) {
  if (Array.isArray(e)) return $e(e);
}
function $e(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function hn(e, t, n, a, s, o) {
  return i(), c("svg", B({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), pn(t[0] || (t[0] = [l("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Je.render = hn;
var yn = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, kn = G.extend({
  name: "tablist",
  classes: yn
}), gn = {
  name: "BaseTabList",
  extends: ae,
  props: {},
  style: kn,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, Ge = {
  name: "TabList",
  extends: gn,
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
    showNavigators: function(t) {
      t ? this.bindResizeObserver() : this.unbindResizeObserver();
    },
    activeValue: {
      flush: "post",
      handler: function() {
        this.updateInkBar(), this.bindInkBarObserver();
      }
    }
  },
  mounted: function() {
    var t = this;
    setTimeout(function() {
      t.updateInkBar(), t.bindInkBarObserver();
    }, 150), this.showNavigators && (this.updateButtonState(), this.bindResizeObserver());
  },
  updated: function() {
    this.showNavigators && this.updateButtonState();
  },
  beforeUnmount: function() {
    this.unbindResizeObserver(), this.unbindInkBarObserver();
  },
  methods: {
    onScroll: function(t) {
      this.showNavigators && this.updateButtonState(), t.preventDefault();
    },
    onPrevButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), a = he(t) - n, s = Math.abs(t.scrollLeft), o = a * 0.8, u = s - o, b = Math.max(u, 0);
      t.scrollLeft = Ie(t) ? -1 * b : b;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), a = he(t) - n, s = Math.abs(t.scrollLeft), o = a * 0.8, u = s + o, b = t.scrollWidth - a, f = Math.min(u, b);
      t.scrollLeft = Ie(t) ? -1 * f : f;
    },
    bindResizeObserver: function() {
      var t = this;
      this.resizeObserver = new ResizeObserver(function() {
        return t.updateButtonState();
      }), this.resizeObserver.observe(this.$refs.list);
    },
    unbindResizeObserver: function() {
      var t;
      (t = this.resizeObserver) === null || t === void 0 || t.unobserve(this.$refs.list), this.resizeObserver = void 0;
    },
    bindInkBarObserver: function() {
      var t = this;
      this.unbindInkBarObserver();
      var n = this.$refs.content, a = de(n, '[data-pc-name="tab"][data-p-active="true"]');
      a && (this.inkBarObserver = new ResizeObserver(function() {
        return t.updateInkBar();
      }), this.inkBarObserver.observe(a));
    },
    unbindInkBarObserver: function() {
      var t;
      (t = this.inkBarObserver) === null || t === void 0 || t.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var t = this.$refs, n = t.content, a = t.inkbar, s = t.tabs;
      if (a) {
        var o = de(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (a.style.height = $t(o) + "px", a.style.top = ie(o).top - ie(s).top + "px") : (a.style.width = Ct(o) + "px", a.style.left = ie(o).left - ie(s).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, a = t.content, s = a.scrollTop, o = a.scrollWidth, u = a.scrollHeight, b = a.offsetWidth, f = a.offsetHeight, S = Math.abs(a.scrollLeft), T = [he(a), wt(a)], v = T[0], p = T[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = s !== 0, this.isNextButtonEnabled = n.offsetHeight >= f && parseInt(s) !== u - p) : (this.isPrevButtonEnabled = S !== 0, this.isNextButtonEnabled = n.offsetWidth >= b && parseInt(S) !== o - v);
    },
    getVisibleButtonWidths: function() {
      var t = this.$refs, n = t.prevButton, a = t.nextButton, s = 0;
      return this.showNavigators && (s = (n?.offsetWidth || 0) + (a?.offsetWidth || 0)), s;
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
      return ue({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: qe,
    ChevronRightIcon: Je
  },
  directives: {
    ripple: Me
  }
}, wn = ["data-p"], $n = ["aria-label", "tabindex"], Cn = ["data-p"], Sn = ["aria-orientation"], xn = ["aria-label", "tabindex"];
function Tn(e, t, n, a, s, o) {
  var u = Se("ripple");
  return i(), c("div", B({
    ref: "list",
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [o.showNavigators && s.isPrevButtonEnabled ? ce((i(), c("button", B({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: e.cx("prevButton"),
    "aria-label": o.prevButtonAriaLabel,
    tabindex: o.$pcTabs.tabindex,
    onClick: t[0] || (t[0] = function() {
      return o.onPrevButtonClick && o.onPrevButtonClick.apply(o, arguments);
    })
  }, e.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(i(), C(Y(o.templates.previcon || "ChevronLeftIcon"), B({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, $n)), [[u]]) : k("", !0), l("div", B({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    }),
    "data-p": o.dataP
  }, e.ptm("content")), [l("div", B({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": o.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [I(e.$slots, "default"), l("span", B({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Sn)], 16, Cn), o.showNavigators && s.isNextButtonEnabled ? ce((i(), c("button", B({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: e.cx("nextButton"),
    "aria-label": o.nextButtonAriaLabel,
    tabindex: o.$pcTabs.tabindex,
    onClick: t[2] || (t[2] = function() {
      return o.onNextButtonClick && o.onNextButtonClick.apply(o, arguments);
    })
  }, e.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(i(), C(Y(o.templates.nexticon || "ChevronRightIcon"), B({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, xn)), [[u]]) : k("", !0)], 16, wn);
}
Ge.render = Tn;
var Bn = `
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
`, _n = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, Ln = G.extend({
  name: "tabs",
  style: Bn,
  classes: _n
}), Pn = {
  name: "BaseTabs",
  extends: ae,
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
  style: Ln,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, Qe = {
  name: "Tabs",
  extends: Pn,
  inheritAttrs: !1,
  emits: ["update:value"],
  data: function() {
    return {
      d_value: this.value
    };
  },
  watch: {
    value: function(t) {
      this.d_value = t;
    }
  },
  methods: {
    updateValue: function(t) {
      this.d_value !== t && (this.d_value = t, this.$emit("update:value", t));
    },
    isVertical: function() {
      return this.orientation === "vertical";
    }
  }
};
function En(e, t, n, a, s, o) {
  return i(), c("div", B({
    class: e.cx("root")
  }, e.ptmi("root")), [I(e.$slots, "default")], 16);
}
Qe.render = En;
const In = {
  key: 0,
  class: "kx-system-tab-count"
}, On = /* @__PURE__ */ A({
  __name: "SystemTabs",
  props: {
    value: {},
    label: {},
    items: {}
  },
  emits: ["update:value"],
  setup(e) {
    return (t, n) => (i(), C(r(Qe), {
      class: "kx-system-tabs",
      "data-kx-separator": "surface",
      value: e.value,
      "onUpdate:value": n[0] || (n[0] = (a) => t.$emit("update:value", String(a)))
    }, {
      default: x(() => [
        y(r(Ge), {
          pt: { tabList: { "aria-label": e.label } }
        }, {
          default: x(() => [
            (i(!0), c(R, null, K(e.items, (a) => (i(), C(r(Ze), B({
              key: a.value,
              value: a.value
            }, { ref_for: !0 }, a.controls ? { "aria-controls": a.controls } : {}), {
              default: x(() => [
                _(m(a.label), 1),
                a.count !== void 0 ? (i(), c("b", In, m(a.count), 1)) : k("", !0)
              ]),
              _: 2
            }, 1040, ["value"]))), 128))
          ]),
          _: 1
        }, 8, ["pt"])
      ]),
      _: 1
    }, 8, ["value"]));
  }
}), An = { class: "kx-shell" }, Dn = { class: "kx-rail" }, Fn = { class: "kx-main" }, Vn = /* @__PURE__ */ A({
  __name: "Shell",
  setup(e) {
    return (t, n) => (i(), c("div", An, [
      l("aside", Dn, [
        I(t.$slots, "rail")
      ]),
      l("main", Fn, [
        I(t.$slots, "default")
      ])
    ]));
  }
}), zn = { class: "kx-railhead" }, Rn = { class: "kx-railhead-title" }, Nn = { key: 0 }, Kn = { class: "kx-railhead-acts" }, Mn = /* @__PURE__ */ A({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (i(), c("div", zn, [
      l("span", Rn, [
        _(m(e.title), 1),
        e.count !== void 0 ? (i(), c("b", Nn, m(e.count), 1)) : k("", !0)
      ]),
      l("div", Kn, [
        I(t.$slots, "actions")
      ])
    ]));
  }
}), V = /* @__PURE__ */ A({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean },
    variant: { default: "plain" },
    severity: {},
    size: { default: "md" },
    spin: { type: Boolean }
  },
  emits: ["click"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = At(), o = $(
      () => Object.prototype.hasOwnProperty.call(s?.vnode.props ?? {}, "active")
    ), u = $(() => {
      if (n.severity) return n.severity;
      if (n.variant === "danger") return "danger";
      if (n.variant === "bordered") return "secondary";
    }), b = $(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (f, S) => (i(), C(r(xe), {
      severity: u.value,
      text: e.variant !== "bordered" && !e.active,
      outlined: e.variant === "bordered",
      size: b.value,
      loading: e.spin,
      disabled: e.disabled || e.spin,
      pt: {
        root: {
          "aria-label": e.label,
          "aria-pressed": o.value ? String(e.active) : void 0,
          title: e.label
        }
      },
      onClick: S[0] || (S[0] = (T) => a("click"))
    }, {
      icon: x(() => [
        y(r(F), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), jn = { class: "km-search" }, Un = ["value", "placeholder"], Hn = /* @__PURE__ */ A({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (a, s) => (i(), c("div", jn, [
      y(r(F), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      l("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: s[0] || (s[0] = (o) => n("update:modelValue", o.target.value))
      }, null, 40, Un),
      e.modelValue ? (i(), c("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: s[1] || (s[1] = (o) => n("update:modelValue", ""))
      }, [
        y(r(F), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : k("", !0)
    ]));
  }
});
var Wn = `
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
`, Zn = {
  root: function(t) {
    var n = t.props;
    return ["p-tag p-component", {
      "p-tag-info": n.severity === "info",
      "p-tag-success": n.severity === "success",
      "p-tag-warn": n.severity === "warn",
      "p-tag-danger": n.severity === "danger",
      "p-tag-secondary": n.severity === "secondary",
      "p-tag-contrast": n.severity === "contrast",
      "p-tag-rounded": n.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, qn = G.extend({
  name: "tag",
  style: Wn,
  classes: Zn
}), Jn = {
  name: "BaseTag",
  extends: ae,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: qn,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function ee(e) {
  "@babel/helpers - typeof";
  return ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ee(e);
}
function Gn(e, t, n) {
  return (t = Qn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qn(e) {
  var t = Xn(e, "string");
  return ee(t) == "symbol" ? t : t + "";
}
function Xn(e, t) {
  if (ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (ee(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Xe = {
  name: "Tag",
  extends: Jn,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ue(Gn({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Yn = ["data-p"];
function ea(e, t, n, a, s, o) {
  return i(), c("span", B({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (i(), C(Y(e.$slots.icon), B({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (i(), c("span", B({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : k("", !0), e.value != null || e.$slots.default ? I(e.$slots, "default", {
    key: 2
  }, function() {
    return [l("span", B({
      class: e.cx("label")
    }, e.ptm("label")), m(e.value), 17)];
  }) : k("", !0)], 16, Yn);
}
Xe.render = ea;
const ta = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, N = /* @__PURE__ */ A({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (i(), C(r(Xe), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: x(() => [
        e.dot ? (i(), c("span", ta)) : e.icon ? (i(), C(r(F), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : k("", !0),
        I(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), na = { class: "kx-empty" }, aa = { class: "kx-empty-ico" }, oa = { class: "kx-empty-title" }, ra = {
  key: 0,
  class: "kx-empty-sub"
}, Ce = /* @__PURE__ */ A({
  __name: "EmptyState",
  props: {
    icon: {},
    title: {},
    hint: {},
    cta: {},
    ctaIcon: {}
  },
  emits: ["cta"],
  setup(e) {
    return (t, n) => (i(), c("div", na, [
      l("div", aa, [
        y(r(F), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      l("div", oa, m(e.title), 1),
      e.hint || t.$slots.hint ? (i(), c("p", ra, [
        I(t.$slots, "hint", {}, () => [
          _(m(e.hint), 1)
        ])
      ])) : k("", !0),
      e.cta ? (i(), C(r(xe), {
        key: 1,
        label: e.cta,
        onClick: n[0] || (n[0] = (a) => t.$emit("cta"))
      }, He({ _: 2 }, [
        e.ctaIcon ? {
          name: "icon",
          fn: x(({ class: a }) => [
            y(r(F), {
              icon: e.ctaIcon,
              class: H(a),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          key: "0"
        } : void 0
      ]), 1032, ["label"])) : k("", !0)
    ]));
  }
});
var ia = G.extend({
  name: "focustrap-directive"
}), sa = xt.extend({
  style: ia
});
function te(e) {
  "@babel/helpers - typeof";
  return te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, te(e);
}
function Re(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function Ne(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Re(Object(n), !0).forEach(function(a) {
      la(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Re(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function la(e, t, n) {
  return (t = da(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function da(e) {
  var t = ca(e, "string");
  return te(t) == "symbol" ? t : t + "";
}
function ca(e, t) {
  if (te(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (te(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ua = sa.extend("focustrap", {
  mounted: function(t, n) {
    var a = n.value || {}, s = a.disabled;
    s || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var a = n.value || {}, s = a.disabled;
    s && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var a = this, s = n.value || {}, o = s.onFocusIn, u = s.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(b) {
        b.forEach(function(f) {
          if (f.type === "childList" && !t.contains(document.activeElement)) {
            var S = function(v) {
              var p = Oe(v) ? Oe(v, a.getComputedSelector(t.$_pfocustrap_focusableselector)) ? v : X(t, a.getComputedSelector(t.$_pfocustrap_focusableselector)) : X(v);
              return Bt(p) ? p : v.nextSibling && S(v.nextSibling);
            };
            J(S(f.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(b) {
        return o && o(b);
      }, t.$_pfocustrap_focusoutlistener = function(b) {
        return u && u(b);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: Ne(Ne({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var a = n.value || {}, s = a.autoFocusSelector, o = s === void 0 ? "" : s, u = a.firstFocusableSelector, b = u === void 0 ? "" : u, f = a.autoFocus, S = f === void 0 ? !1 : f, T = X(t, "[autofocus]".concat(this.getComputedSelector(o)));
      S && !T && (T = X(t, this.getComputedSelector(b))), J(T);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, s = t.relatedTarget, o = s === a.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? X(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_lasthiddenfocusableelement;
      J(o);
    },
    onLastHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, s = t.relatedTarget, o = s === a.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? St(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_firsthiddenfocusableelement;
      J(o);
    },
    createHiddenFocusableElements: function(t, n) {
      var a = this, s = n.value || {}, o = s.tabIndex, u = o === void 0 ? 0 : o, b = s.firstFocusableSelector, f = b === void 0 ? "" : b, S = s.lastFocusableSelector, T = S === void 0 ? "" : S, v = function(E) {
        return Tt("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: u,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: E?.bind(a)
        });
      }, p = v(this.onFirstHiddenElementFocus), h = v(this.onLastHiddenElementFocus);
      p.$_pfocustrap_lasthiddenfocusableelement = h, p.$_pfocustrap_focusableselector = f, p.setAttribute("data-pc-section", "firstfocusableelement"), h.$_pfocustrap_firsthiddenfocusableelement = p, h.$_pfocustrap_focusableselector = T, h.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(p), t.append(h);
    }
  }
});
function pa() {
  Lt({
    variableName: Ue("scrollbar.width").name
  });
}
function ba() {
  _t({
    variableName: Ue("scrollbar.width").name
  });
}
var fa = `
    .p-drawer {
        display: flex;
        flex-direction: column;
        transform: translate3d(0px, 0px, 0px);
        position: relative;
        transition: transform 0.3s;
        background: dt('drawer.background');
        color: dt('drawer.color');
        border-style: solid;
        border-color: dt('drawer.border.color');
        box-shadow: dt('drawer.shadow');
    }

    .p-drawer-content {
        overflow-y: auto;
        flex-grow: 1;
        padding: dt('drawer.content.padding');
    }

    .p-drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('drawer.header.padding');
    }

    .p-drawer-footer {
        padding: dt('drawer.footer.padding');
    }

    .p-drawer-title {
        font-weight: dt('drawer.title.font.weight');
        font-size: dt('drawer.title.font.size');
    }

    .p-drawer-full .p-drawer {
        transition: none;
        transform: none;
        width: 100vw !important;
        height: 100vh !important;
        max-height: 100%;
        top: 0px !important;
        left: 0px !important;
        border-width: 1px;
    }

    .p-drawer-left .p-drawer-enter-active {
        animation: p-animate-drawer-enter-left 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-left .p-drawer-leave-active {
        animation: p-animate-drawer-leave-left 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-right .p-drawer-enter-active {
        animation: p-animate-drawer-enter-right 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-right .p-drawer-leave-active {
        animation: p-animate-drawer-leave-right 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-top .p-drawer-enter-active {
        animation: p-animate-drawer-enter-top 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-top .p-drawer-leave-active {
        animation: p-animate-drawer-leave-top 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-bottom .p-drawer-enter-active {
        animation: p-animate-drawer-enter-bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-bottom .p-drawer-leave-active {
        animation: p-animate-drawer-leave-bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-full .p-drawer-enter-active {
        animation: p-animate-drawer-enter-full 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-full .p-drawer-leave-active {
        animation: p-animate-drawer-leave-full 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    
    .p-drawer-left .p-drawer {
        width: 20rem;
        height: 100%;
        border-inline-end-width: 1px;
    }

    .p-drawer-right .p-drawer {
        width: 20rem;
        height: 100%;
        border-inline-start-width: 1px;
    }

    .p-drawer-top .p-drawer {
        height: 10rem;
        width: 100%;
        border-block-end-width: 1px;
    }

    .p-drawer-bottom .p-drawer {
        height: 10rem;
        width: 100%;
        border-block-start-width: 1px;
    }

    .p-drawer-left .p-drawer-content,
    .p-drawer-right .p-drawer-content,
    .p-drawer-top .p-drawer-content,
    .p-drawer-bottom .p-drawer-content {
        width: 100%;
        height: 100%;
    }

    .p-drawer-open {
        display: flex;
    }

    .p-drawer-mask:dir(rtl) {
        flex-direction: row-reverse;
    }

    @keyframes p-animate-drawer-enter-left {
        from {
            transform: translate3d(-100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-left {
        to {
            transform: translate3d(-100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-right {
        from {
            transform: translate3d(100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-right {
        to {
            transform: translate3d(100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-top {
        from {
            transform: translate3d(0px, -100%, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-top {
        to {
            transform: translate3d(0px, -100%, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-bottom {
        from {
            transform: translate3d(0px, 100%, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-bottom {
        to {
            transform: translate3d(0px, 100%, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-full {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-drawer-leave-full {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`, va = {
  mask: function(t) {
    var n = t.position, a = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" ? "flex-start" : n === "right" ? "flex-end" : "center",
      alignItems: n === "top" ? "flex-start" : n === "bottom" ? "flex-end" : "center",
      pointerEvents: a ? "auto" : "none"
    };
  },
  root: {
    pointerEvents: "auto"
  }
}, ma = {
  mask: function(t) {
    var n = t.instance, a = t.props, s = ["left", "right", "top", "bottom"], o = s.find(function(u) {
      return u === a.position;
    });
    return ["p-drawer-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": a.modal,
      "p-drawer-open": n.containerVisible,
      "p-drawer-full": n.fullScreen
    }, o ? "p-drawer-".concat(o) : ""];
  },
  root: function(t) {
    var n = t.instance;
    return ["p-drawer p-component", {
      "p-drawer-full": n.fullScreen
    }];
  },
  header: "p-drawer-header",
  title: "p-drawer-title",
  pcCloseButton: "p-drawer-close-button",
  content: "p-drawer-content",
  footer: "p-drawer-footer"
}, ha = G.extend({
  name: "drawer",
  style: fa,
  classes: ma,
  inlineStyles: va
}), ya = {
  name: "BaseDrawer",
  extends: ae,
  props: {
    visible: {
      type: Boolean,
      default: !1
    },
    position: {
      type: String,
      default: "left"
    },
    header: {
      type: null,
      default: null
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    dismissable: {
      type: Boolean,
      default: !0
    },
    showCloseIcon: {
      type: Boolean,
      default: !0
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
    closeIcon: {
      type: String,
      default: void 0
    },
    modal: {
      type: Boolean,
      default: !0
    },
    blockScroll: {
      type: Boolean,
      default: !1
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    }
  },
  style: ha,
  provide: function() {
    return {
      $pcDrawer: this,
      $parentInstance: this
    };
  }
};
function ne(e) {
  "@babel/helpers - typeof";
  return ne = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ne(e);
}
function ke(e, t, n) {
  return (t = ka(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ka(e) {
  var t = ga(e, "string");
  return ne(t) == "symbol" ? t : t + "";
}
function ga(e, t) {
  if (ne(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (ne(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ye = {
  name: "Drawer",
  extends: ya,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "after-show", "hide", "after-hide", "before-hide"],
  data: function() {
    return {
      containerVisible: this.visible
    };
  },
  container: null,
  mask: null,
  content: null,
  headerContainer: null,
  footerContainer: null,
  closeButton: null,
  outsideClickListener: null,
  documentKeydownListener: null,
  watch: {
    dismissable: function(t) {
      t && !this.modal ? this.bindOutsideClickListener() : this.unbindOutsideClickListener();
    }
  },
  updated: function() {
    this.visible && (this.containerVisible = this.visible);
  },
  beforeUnmount: function() {
    this.disableDocumentSettings(), this.mask && this.autoZIndex && ye.clear(this.mask), this.container = null, this.mask = null;
  },
  methods: {
    hide: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.focus(), this.bindDocumentKeyDownListener(), this.autoZIndex && ye.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.enableDocumentSettings(), this.$emit("after-show");
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Et(this.mask, "p-overlay-mask-leave-active"), this.$emit("before-hide");
    },
    onLeave: function() {
      this.$emit("hide");
    },
    onAfterLeave: function() {
      this.autoZIndex && ye.clear(this.mask), this.unbindDocumentKeyDownListener(), this.containerVisible = !1, this.disableDocumentSettings(), this.$emit("after-hide");
    },
    onMaskClick: function(t) {
      this.dismissable && this.modal && this.mask === t.target && this.hide();
    },
    focus: function() {
      var t = function(s) {
        return s && s.querySelector("[autofocus]");
      }, n = this.$slots.header && t(this.headerContainer);
      n || (n = this.$slots.default && t(this.container), n || (n = this.$slots.footer && t(this.footerContainer), n || (n = this.closeButton))), n && J(n);
    },
    enableDocumentSettings: function() {
      this.dismissable && !this.modal && this.bindOutsideClickListener(), this.blockScroll && pa();
    },
    disableDocumentSettings: function() {
      this.unbindOutsideClickListener(), this.blockScroll && ba();
    },
    onKeydown: function(t) {
      t.code === "Escape" && this.closeOnEscape && this.hide();
    },
    containerRef: function(t) {
      this.container = t;
    },
    maskRef: function(t) {
      this.mask = t;
    },
    contentRef: function(t) {
      this.content = t;
    },
    headerContainerRef: function(t) {
      this.headerContainer = t;
    },
    footerContainerRef: function(t) {
      this.footerContainer = t;
    },
    closeButtonRef: function(t) {
      this.closeButton = t ? t.$el : void 0;
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeydown, document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        t.isOutsideClicked(n) && t.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    isOutsideClicked: function(t) {
      return this.container && !this.container.contains(t.target);
    }
  },
  computed: {
    fullScreen: function() {
      return this.position === "full";
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return ue(ke(ke(ke({
        "full-screen": this.position === "full"
      }, this.position, this.position), "open", this.containerVisible), "modal", this.modal));
    }
  },
  directives: {
    focustrap: ua
  },
  components: {
    Button: xe,
    Portal: Pt,
    TimesIcon: Mt
  }
}, wa = ["data-p"], $a = ["role", "aria-modal", "data-p"];
function Ca(e, t, n, a, s, o) {
  var u = Ae("Button"), b = Ae("Portal"), f = Se("focustrap");
  return i(), C(b, null, {
    default: x(function() {
      return [s.containerVisible ? (i(), c("div", B({
        key: 0,
        ref: o.maskRef,
        onMousedown: t[0] || (t[0] = function() {
          return o.onMaskClick && o.onMaskClick.apply(o, arguments);
        }),
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        "data-p": o.dataP
      }, e.ptm("mask")), [y(Dt, B({
        name: "p-drawer",
        onEnter: o.onEnter,
        onAfterEnter: o.onAfterEnter,
        onBeforeLeave: o.onBeforeLeave,
        onLeave: o.onLeave,
        onAfterLeave: o.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: x(function() {
          return [e.visible ? ce((i(), c("div", B({
            key: 0,
            ref: o.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: e.modal ? "dialog" : "complementary",
            "aria-modal": e.modal ? !0 : void 0,
            "data-p": o.dataP
          }, e.ptmi("root")), [e.$slots.container ? I(e.$slots, "container", {
            key: 0,
            closeCallback: o.hide
          }) : (i(), c(R, {
            key: 1
          }, [l("div", B({
            ref: o.headerContainerRef,
            class: e.cx("header")
          }, e.ptm("header")), [I(e.$slots, "header", {
            class: H(e.cx("title"))
          }, function() {
            return [e.header ? (i(), c("div", B({
              key: 0,
              class: e.cx("title")
            }, e.ptm("title")), m(e.header), 17)) : k("", !0)];
          }), e.showCloseIcon ? I(e.$slots, "closebutton", {
            key: 0,
            closeCallback: o.hide
          }, function() {
            return [y(u, B({
              ref: o.closeButtonRef,
              type: "button",
              class: e.cx("pcCloseButton"),
              "aria-label": o.closeAriaLabel,
              unstyled: e.unstyled,
              onClick: o.hide
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "iconcontainer"
            }), {
              icon: x(function(S) {
                return [I(e.$slots, "closeicon", {}, function() {
                  return [(i(), C(Y(e.closeIcon ? "span" : "TimesIcon"), B({
                    class: [e.closeIcon, S.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onClick", "pt"])];
          }) : k("", !0)], 16), l("div", B({
            ref: o.contentRef,
            class: e.cx("content")
          }, e.ptm("content")), [I(e.$slots, "default")], 16), e.$slots.footer ? (i(), c("div", B({
            key: 0,
            ref: o.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [I(e.$slots, "footer")], 16)) : k("", !0)], 64))], 16, $a)), [[f]]) : k("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, wa)) : k("", !0)];
    }),
    _: 3
  });
}
Ye.render = Ca;
const Sa = { class: "km-drawer-title" }, xa = /* @__PURE__ */ A({
  __name: "Drawer",
  props: {
    open: { type: Boolean },
    title: {},
    icon: {},
    wide: { type: Boolean },
    back: { type: Boolean }
  },
  emits: ["close", "back"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = $(() => n.wide ? "min(720px, calc(100vw - 36px))" : "min(560px, calc(100vw - 36px))");
    function o(u) {
      u || a("close");
    }
    return (u, b) => (i(), C(r(Ye), {
      visible: e.open,
      position: "right",
      modal: !0,
      pt: { content: { class: "km-drawer-content" } },
      dismissable: !0,
      "close-on-escape": !0,
      style: Ft({ width: s.value }),
      "aria-label": e.title,
      "onUpdate:visible": o
    }, He({
      header: x(() => [
        e.back ? (i(), C(V, {
          key: 0,
          icon: "tabler:chevron-left",
          label: "Back",
          onClick: b[0] || (b[0] = (f) => a("back"))
        })) : k("", !0),
        l("span", Sa, [
          e.icon ? (i(), C(r(F), {
            key: 0,
            icon: e.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : k("", !0),
          _(m(e.title), 1)
        ])
      ]),
      default: x(() => [
        I(u.$slots, "default")
      ]),
      _: 2
    }, [
      u.$slots.footer ? {
        name: "footer",
        fn: x(() => [
          I(u.$slots, "footer")
        ]),
        key: "0"
      } : void 0
    ]), 1032, ["visible", "style", "aria-label"]));
  }
});
function Ta(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const n = e.trim();
    if (/^\d+$/.test(n))
      t = Number(n);
    else {
      const a = Date.parse(n);
      return Number.isNaN(a) ? null : a;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function Ba(e) {
  const t = Ta(e);
  return t === null ? "" : new Date(t).toLocaleString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
const _a = ["title"], La = { class: "km-prow-text" }, Pa = { class: "km-prow-name" }, Ea = ["title"], Ia = { class: "km-prow-sub" }, Oa = { class: "km-prow-acts" }, Aa = {
  key: 0,
  class: "km-prow-msg"
}, Da = /* @__PURE__ */ A({
  __name: "ProviderRow",
  props: {
    profile: {},
    providerIcon: {},
    adapterTitle: {},
    selected: { type: Boolean },
    discoverable: { type: Boolean },
    discovering: { type: Boolean },
    busy: { type: Boolean }
  },
  emits: ["select", "edit", "discover", "delete"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = $(() => {
      if (!n.discoverable) return "Automatic model discovery is not available for this provider";
      const o = Ba(n.profile.last_discovered_at);
      return o ? `Discover models (last ${o})` : "Discover models";
    });
    return (o, u) => (i(), c("div", {
      class: H(["km-prow", { on: e.selected }])
    }, [
      l("button", {
        class: "km-prow-main",
        title: r(jt)(e.profile),
        onClick: u[0] || (u[0] = (b) => a("select"))
      }, [
        y(r(Te), {
          icon: e.providerIcon,
          size: "sm"
        }, null, 8, ["icon"]),
        l("span", La, [
          l("span", Pa, [
            l("span", null, m(e.profile.name), 1),
            r(Ut)(e.profile) ? (i(), C(r(F), {
              key: 0,
              icon: "tabler:key",
              class: "km-prow-cred",
              title: "Credentials stored",
              "aria-hidden": "true"
            })) : k("", !0),
            l("span", {
              class: H(["km-prow-dot", r(Wt)(e.profile.status)]),
              title: r(Ht)(e.profile.status),
              "aria-hidden": "true"
            }, null, 10, Ea)
          ]),
          l("span", Ia, m(e.adapterTitle), 1)
        ]),
        e.profile.enabled ? k("", !0) : (i(), C(r(N), {
          key: 0,
          severity: "warn"
        }, {
          default: x(() => [...u[4] || (u[4] = [
            _("off", -1)
          ])]),
          _: 1
        }))
      ], 8, _a),
      l("div", Oa, [
        y(r(V), {
          icon: "tabler:radar-2",
          label: s.value,
          size: "sm",
          disabled: !e.discoverable || e.discovering || e.busy,
          spin: e.discovering,
          onClick: u[1] || (u[1] = (b) => a("discover"))
        }, null, 8, ["label", "disabled", "spin"]),
        y(r(V), {
          icon: "tabler:edit",
          label: "Edit provider",
          size: "sm",
          disabled: e.busy,
          onClick: u[2] || (u[2] = (b) => a("edit"))
        }, null, 8, ["disabled"]),
        y(r(V), {
          icon: "tabler:trash",
          label: "Delete provider",
          size: "sm",
          variant: "danger",
          disabled: e.busy,
          onClick: u[3] || (u[3] = (b) => a("delete"))
        }, null, 8, ["disabled"])
      ]),
      e.profile.message ? (i(), c("div", Aa, m(e.profile.message), 1)) : k("", !0)
    ], 2));
  }
}), Fa = { class: "km-plist" }, Va = {
  key: 0,
  class: "km-plist-empty"
}, za = /* @__PURE__ */ A({
  __name: "ProviderList",
  props: {
    profiles: {},
    adapters: {},
    selectedId: {},
    discovering: {},
    busy: { type: Boolean }
  },
  emits: ["select", "edit", "discover", "delete", "add"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = _e(() => n.adapters, () => n.profiles);
    return (o, u) => (i(), c("div", Fa, [
      l("button", {
        class: H(["km-plist-all", { on: e.selectedId === "all" }]),
        onClick: u[0] || (u[0] = (b) => a("select", "all"))
      }, " All providers ", 2),
      e.profiles.length ? k("", !0) : (i(), c("div", Va, [
        u[3] || (u[3] = l("p", null, "No providers connected.", -1)),
        y(r(Be), {
          small: "",
          icon: "tabler:plus",
          onClick: u[1] || (u[1] = (b) => a("add"))
        }, {
          default: x(() => [...u[2] || (u[2] = [
            _("Add provider", -1)
          ])]),
          _: 1
        })
      ])),
      (i(!0), c(R, null, K(e.profiles, (b) => (i(), C(Da, {
        key: b.id,
        profile: b,
        "provider-icon": r(s).providerIcon(b.provider_id, b.id),
        "adapter-title": r(s).adapterTitle(b.provider_id),
        selected: e.selectedId === b.id,
        discoverable: r(s).isDiscoverable(b),
        discovering: e.discovering === b.id,
        busy: e.busy,
        onSelect: (f) => a("select", b.id),
        onEdit: (f) => a("edit", b),
        onDiscover: (f) => a("discover", b),
        onDelete: (f) => a("delete", b)
      }, null, 8, ["profile", "provider-icon", "adapter-title", "selected", "discoverable", "discovering", "busy", "onSelect", "onEdit", "onDiscover", "onDelete"]))), 128))
    ]));
  }
}), Ra = { class: "km-mrow-id" }, Na = { class: "km-mrow-title" }, Ka = { class: "km-mrow-title-text" }, Ma = { class: "km-mrow-sub" }, ja = { class: "km-mrow-prov" }, Ua = { class: "km-mrow-mono" }, Ha = { class: "km-mrow-tags" }, Wa = {
  key: 0,
  class: "km-tag-group km-tag-classes"
}, Za = { class: "km-tag-group km-tag-caps" }, qa = { class: "km-mrow-limits" }, Ja = {
  class: "km-mrow-limit-chips",
  "aria-label": "Token limits"
}, Ga = { class: "km-mrow-acts" }, Qa = { class: "km-mrow-probe-head" }, Xa = { class: "km-mrow-probe-msg" }, Ya = {
  key: 0,
  class: "km-probe-time"
}, eo = {
  key: 0,
  class: "km-mrow-probe-body"
}, to = {
  key: 0,
  class: "km-probe-tokens"
}, no = {
  key: 1,
  class: "km-probe-out"
}, ao = {
  key: 2,
  class: "km-probe-out"
}, Ke = 5, oo = /* @__PURE__ */ A({
  __name: "ModelRow",
  props: {
    model: {},
    providerIcon: {},
    providerTitle: {},
    profileTitle: {},
    probing: { type: Boolean },
    probeState: {},
    probeDetailsOpen: { type: Boolean },
    busy: { type: Boolean }
  },
  emits: ["edit", "delete", "probe", "toggle-probe-details", "toggle-enabled"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = $(() => n.model.capabilities ?? []), o = $(() => s.value.slice(0, Ke)), u = $(() => Math.max(0, s.value.length - Ke)), b = $(() => s.value.includes("reasoning") || s.value.includes("extended_thinking") || Zt(n.model, "reasoning_model_request") === "true"), f = $(() => n.model.enabled !== !1 && (s.value.includes("generate") || s.value.includes("tool_use"))), S = $(() => n.probeState?.model === n.model.name ? n.probeState : null), T = $(() => S.value?.status || "idle"), v = $(() => T.value === "ok" || T.value === "fail"), p = $(() => T.value === "ok" ? "tabler:circle-check" : T.value === "fail" ? "tabler:circle-x" : "tabler:activity-heartbeat"), h = $(() => {
      if (T.value === "ok") return "success";
      if (T.value === "fail") return "danger";
    }), D = $(() => n.probing ? `Checking ${n.model.title || n.model.name}` : T.value === "ok" ? "Model check succeeded. View details" : T.value === "fail" ? "Model check failed. View details" : "Run model check"), E = $(() => {
      const O = S.value?.data?.tokens;
      if (!O) return [];
      const g = ["prompt_tokens", "completion_tokens", "total_tokens", "thinking_tokens"], L = /* @__PURE__ */ new Set(), M = [], j = (U) => {
        const Z = O[U];
        typeof Z == "number" && Z > 0 && !L.has(U) && (L.add(U), M.push({ label: U.replace(/_tokens$/, "").replace(/_input$/, "").replace(/_/g, " "), value: Z }));
      };
      return g.forEach(j), Object.keys(O).forEach(j), M;
    });
    function W() {
      v.value ? a("toggle-probe-details") : a("probe");
    }
    return (O, g) => (i(), c("div", {
      class: H(["km-mrow", { "km-mrow-off": e.model.enabled === !1 }])
    }, [
      y(r(Te), { icon: e.providerIcon }, null, 8, ["icon"]),
      l("div", Ra, [
        l("div", Na, [
          l("span", Ka, m(e.model.title || e.model.name), 1),
          y(r(N), {
            severity: r(qt)(e.model.source)
          }, {
            default: x(() => [
              _(m(r(Jt)(e.model.source)), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          e.model.enabled === !1 ? (i(), C(r(N), {
            key: 0,
            severity: "secondary",
            icon: "tabler:ban"
          }, {
            default: x(() => [...g[4] || (g[4] = [
              _("disabled", -1)
            ])]),
            _: 1
          })) : k("", !0)
        ]),
        l("div", Ma, [
          l("span", ja, m(e.providerTitle || "—"), 1),
          e.model.provider_profile_id ? (i(), c(R, { key: 0 }, [
            _(" · " + m(e.profileTitle), 1)
          ], 64)) : k("", !0),
          l("span", Ua, " · " + m(e.model.name), 1)
        ])
      ]),
      l("div", Ha, [
        (e.model.class || []).length ? (i(), c("span", Wa, [
          (i(!0), c(R, null, K(e.model.class || [], (L) => (i(), C(r(N), {
            key: `k-${L}`,
            severity: "",
            icon: "tabler:category-2"
          }, {
            default: x(() => [
              _(m(L), 1)
            ]),
            _: 2
          }, 1024))), 128))
        ])) : k("", !0),
        l("span", Za, [
          b.value ? (i(), C(r(N), {
            key: 0,
            severity: "info",
            icon: "tabler:bulb"
          }, {
            default: x(() => [...g[5] || (g[5] = [
              _("reasoning", -1)
            ])]),
            _: 1
          })) : k("", !0),
          (i(!0), c(R, null, K(o.value, (L) => (i(), C(r(N), {
            key: `c-${L}`,
            severity: "secondary",
            icon: r(Gt)(L) || void 0
          }, {
            default: x(() => [
              _(m(L), 1)
            ]),
            _: 2
          }, 1032, ["icon"]))), 128)),
          u.value ? (i(), C(r(N), {
            key: 1,
            severity: "secondary"
          }, {
            default: x(() => [
              _("+" + m(u.value), 1)
            ]),
            _: 1
          })) : k("", !0)
        ])
      ]),
      l("div", qa, [
        l("span", null, [
          l("b", null, m(r(se)(e.model.max_tokens)), 1),
          g[6] || (g[6] = _(" ctx", -1))
        ]),
        l("span", null, [
          l("b", null, m(r(se)(e.model.output_tokens)), 1),
          g[7] || (g[7] = _(" out", -1))
        ])
      ]),
      l("div", Ja, [
        l("span", null, [
          l("b", null, m(r(se)(e.model.max_tokens)), 1),
          g[8] || (g[8] = _(" ctx", -1))
        ]),
        l("span", null, [
          l("b", null, m(r(se)(e.model.output_tokens)), 1),
          g[9] || (g[9] = _(" out", -1))
        ])
      ]),
      l("div", Ga, [
        f.value ? (i(), C(r(V), {
          key: 0,
          icon: p.value,
          label: D.value,
          size: "sm",
          variant: "bordered",
          severity: h.value,
          active: v.value && e.probeDetailsOpen,
          spin: e.probing,
          disabled: e.probing || !v.value && e.busy,
          onClick: W
        }, null, 8, ["icon", "label", "severity", "active", "spin", "disabled"])) : k("", !0),
        y(r(V), {
          icon: e.model.enabled === !1 ? "tabler:circle-check" : "tabler:circle-minus",
          label: e.model.enabled === !1 ? "Enable model" : "Disable model",
          size: "sm",
          variant: "bordered",
          disabled: e.busy,
          onClick: g[0] || (g[0] = (L) => a("toggle-enabled"))
        }, null, 8, ["icon", "label", "disabled"]),
        y(r(V), {
          icon: "tabler:adjustments",
          label: "Edit model",
          size: "sm",
          variant: "bordered",
          onClick: g[1] || (g[1] = (L) => a("edit"))
        }),
        e.model.source !== "registry" ? (i(), C(r(V), {
          key: 1,
          icon: "tabler:trash",
          label: "Delete model",
          size: "sm",
          variant: "bordered",
          severity: "danger",
          onClick: g[2] || (g[2] = (L) => a("delete"))
        })) : k("", !0)
      ]),
      e.probeDetailsOpen && v.value ? (i(), c("div", {
        key: 0,
        class: H(["km-mrow-probe", T.value])
      }, [
        l("div", Qa, [
          y(r(F), {
            icon: T.value === "ok" ? "tabler:circle-check" : "tabler:circle-x",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          l("span", Xa, m(T.value === "ok" ? "Model works" : "Model check failed"), 1),
          S.value?.data && S.value.data.elapsed_ms != null ? (i(), c("span", Ya, m(S.value.data.elapsed_ms) + " ms", 1)) : k("", !0),
          y(r(Be), {
            icon: "tabler:activity-heartbeat",
            variant: "ghost",
            small: "",
            disabled: e.probing || e.busy,
            onClick: g[3] || (g[3] = (L) => a("probe"))
          }, {
            default: x(() => [...g[10] || (g[10] = [
              _(" Run again ", -1)
            ])]),
            _: 1
          }, 8, ["disabled"])
        ]),
        S.value?.data ? (i(), c("div", eo, [
          E.value.length ? (i(), c("div", to, [
            g[11] || (g[11] = l("span", { class: "km-probe-tokens-l" }, "Tokens", -1)),
            (i(!0), c(R, null, K(E.value, (L) => (i(), c("span", {
              key: L.label,
              class: "km-probe-tok"
            }, [
              l("b", null, m(L.value), 1),
              _(" " + m(L.label), 1)
            ]))), 128))
          ])) : k("", !0),
          S.value.data.output ? (i(), c("div", no, [
            g[12] || (g[12] = l("span", null, "Output", -1)),
            l("pre", null, m(S.value.data.output), 1)
          ])) : k("", !0),
          S.value.data.error ? (i(), c("div", ao, [
            g[13] || (g[13] = l("span", null, "Error", -1)),
            l("pre", null, m(S.value.data.error), 1)
          ])) : k("", !0)
        ])) : k("", !0)
      ], 2)) : k("", !0)
    ], 2));
  }
}), ge = 120;
function ro(e) {
  const t = Vt({
    search: "",
    source: "all",
    capability: "all",
    klass: "all",
    profile: "all",
    provider: "all",
    limit: ge
  }), n = $(() => {
    const v = /* @__PURE__ */ new Set();
    for (const p of e.value) for (const h of p.capabilities ?? []) v.add(h);
    return Array.from(v).sort();
  }), a = $(() => {
    const v = /* @__PURE__ */ new Set();
    for (const p of e.value) for (const h of p.class ?? []) v.add(h);
    return Array.from(v).sort();
  }), s = $(() => {
    const v = /* @__PURE__ */ new Set();
    for (const p of e.value) p.provider_id && v.add(p.provider_id);
    return Array.from(v).sort();
  }), o = $(() => {
    const v = t.search.trim().toLowerCase();
    return e.value.filter((p) => t.source !== "all" && p.source !== t.source || t.capability !== "all" && !(p.capabilities ?? []).includes(t.capability) || t.klass !== "all" && !(p.class ?? []).includes(t.klass) || t.profile !== "all" && (p.provider_profile_id || "") !== t.profile || t.provider !== "all" && (p.provider_id || "") !== t.provider ? !1 : v ? [
      p.name,
      p.title,
      p.provider_model,
      p.provider_id,
      p.provider_profile_id,
      ...p.capabilities ?? [],
      ...p.class ?? []
    ].filter(Boolean).some((h) => String(h).toLowerCase().includes(v)) : !0);
  }), u = $(() => o.value.slice(0, t.limit)), b = $(() => u.value.length < o.value.length), f = $(
    () => (t.source !== "all" ? 1 : 0) + (t.capability !== "all" ? 1 : 0) + (t.klass !== "all" ? 1 : 0) + (t.profile !== "all" ? 1 : 0) + (t.provider !== "all" ? 1 : 0) + (t.search.trim() ? 1 : 0)
  );
  function S() {
    t.limit += ge;
  }
  function T() {
    t.search = "", t.source = "all", t.capability = "all", t.klass = "all", t.profile = "all", t.provider = "all", t.limit = ge;
  }
  return {
    state: t,
    capabilityOptions: n,
    classOptions: a,
    providerOptions: s,
    filtered: o,
    visible: u,
    hasMore: b,
    activeCount: f,
    more: S,
    reset: T
  };
}
const io = { class: "km-pool kx-system-pane" }, so = { class: "km-pool-head kx-system-tools" }, lo = { class: "km-pool-head-top" }, co = { class: "km-pool-title" }, uo = { class: "km-pool-counts" }, po = { class: "km-pool-filters" }, bo = {
  key: 0,
  class: "km-pool-body kx-system-body"
}, fo = {
  key: 1,
  class: "km-pool-body kx-system-body"
}, vo = {
  key: 2,
  class: "km-pool-table kx-system-body"
}, mo = {
  key: 0,
  class: "km-pool-more"
}, ho = /* @__PURE__ */ A({
  __name: "ModelPool",
  props: {
    models: {},
    profiles: {},
    adapters: {},
    selectedProfileId: {},
    probingModel: {},
    probeState: {},
    probeDetailsModel: {},
    busy: { type: Boolean }
  },
  emits: ["edit", "delete", "probe", "toggle-probe-details", "toggle-enabled", "add"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = _e(() => n.adapters, () => n.profiles), o = ro(zt(n, "models")), u = [
      { label: "All sources", value: "all" },
      { label: "Built-in", value: "registry" },
      { label: "Discovered", value: "discovered" },
      { label: "Overlay", value: "overlay" }
    ], b = $(() => [
      { label: "All providers", value: "all" },
      ...o.providerOptions.value.map((v) => ({ label: s.adapterTitle(v), value: v }))
    ]), f = $(() => [
      { label: "All capabilities", value: "all" },
      ...o.capabilityOptions.value.map((v) => ({ label: v, value: v }))
    ]), S = $(() => [
      { label: "All classes", value: "all" },
      ...o.classOptions.value.map((v) => ({ label: v, value: v }))
    ]), T = $(() => {
      let v = 0, p = 0, h = 0;
      for (const D of n.models)
        D.source === "registry" ? v++ : D.source === "discovered" ? p++ : h++;
      return { registry: v, discovered: p, overlay: h };
    });
    return We(() => n.selectedProfileId, (v) => {
      o.state.profile = v || "all";
    }, { immediate: !0 }), (v, p) => (i(), c("div", io, [
      l("header", so, [
        l("div", lo, [
          l("div", co, [
            p[8] || (p[8] = l("span", null, "Model pool", -1)),
            l("span", uo, [
              y(r(N), { severity: "info" }, {
                default: x(() => [
                  _(m(T.value.registry) + " built-in", 1)
                ]),
                _: 1
              }),
              y(r(N), { severity: "success" }, {
                default: x(() => [
                  _(m(T.value.discovered) + " discovered", 1)
                ]),
                _: 1
              }),
              y(r(N), { severity: "warn" }, {
                default: x(() => [
                  _(m(T.value.overlay) + " overlay", 1)
                ]),
                _: 1
              })
            ])
          ]),
          y(r(Hn), {
            modelValue: r(o).state.search,
            "onUpdate:modelValue": p[0] || (p[0] = (h) => r(o).state.search = h),
            placeholder: "Search models"
          }, null, 8, ["modelValue"])
        ]),
        l("div", po, [
          y(r(le), {
            modelValue: r(o).state.source,
            "onUpdate:modelValue": p[1] || (p[1] = (h) => r(o).state.source = h),
            options: u,
            "aria-label": "Source"
          }, null, 8, ["modelValue"]),
          y(r(le), {
            modelValue: r(o).state.provider,
            "onUpdate:modelValue": p[2] || (p[2] = (h) => r(o).state.provider = h),
            options: b.value,
            "aria-label": "Provider"
          }, null, 8, ["modelValue", "options"]),
          y(r(le), {
            modelValue: r(o).state.capability,
            "onUpdate:modelValue": p[3] || (p[3] = (h) => r(o).state.capability = h),
            options: f.value,
            "aria-label": "Capability"
          }, null, 8, ["modelValue", "options"]),
          y(r(le), {
            modelValue: r(o).state.klass,
            "onUpdate:modelValue": p[4] || (p[4] = (h) => r(o).state.klass = h),
            options: S.value,
            "aria-label": "Class"
          }, null, 8, ["modelValue", "options"]),
          r(o).activeCount.value ? (i(), C(r(V), {
            key: 0,
            icon: "tabler:filter-off",
            label: "Clear filters",
            variant: "bordered",
            onClick: p[5] || (p[5] = (h) => r(o).reset())
          })) : k("", !0)
        ])
      ]),
      e.models.length ? r(o).filtered.value.length ? (i(), c("div", vo, [
        p[9] || (p[9] = l("div", { class: "km-pool-cols" }, [
          l("span"),
          l("span", null, "Model"),
          l("span", null, "Capabilities & classes"),
          l("span", { class: "km-pool-cols-r" }, "Limits"),
          l("span")
        ], -1)),
        (i(!0), c(R, null, K(r(o).visible.value, (h) => (i(), C(oo, {
          key: h.name,
          model: h,
          "provider-icon": r(s).providerIcon(h.provider_id, h.provider_profile_id),
          "provider-title": r(s).adapterTitle(h.provider_id),
          "profile-title": r(s).profileTitle(h.provider_profile_id),
          probing: e.probingModel === h.name,
          "probe-state": e.probeState,
          "probe-details-open": e.probeDetailsModel === h.name,
          busy: e.busy,
          onEdit: (D) => a("edit", h),
          onDelete: (D) => a("delete", h),
          onProbe: (D) => a("probe", h),
          onToggleProbeDetails: (D) => a("toggle-probe-details", h),
          onToggleEnabled: (D) => a("toggle-enabled", h)
        }, null, 8, ["model", "provider-icon", "provider-title", "profile-title", "probing", "probe-state", "probe-details-open", "busy", "onEdit", "onDelete", "onProbe", "onToggleProbeDetails", "onToggleEnabled"]))), 128)),
        r(o).hasMore.value ? (i(), c("div", mo, [
          y(r(Be), {
            variant: "ghost",
            icon: "tabler:chevron-down",
            onClick: p[7] || (p[7] = (h) => r(o).more())
          }, {
            default: x(() => [
              _(" Show more (" + m(r(o).filtered.value.length - r(o).visible.value.length) + ") ", 1)
            ]),
            _: 1
          })
        ])) : k("", !0)
      ])) : (i(), c("div", fo, [
        y(r(Ce), {
          icon: "tabler:search-off",
          title: "No models match",
          hint: "Adjust the search or filters."
        })
      ])) : (i(), c("div", bo, [
        y(r(Ce), {
          icon: "tabler:cpu",
          title: "No models yet",
          hint: "Connect a provider and discover its models, or add one manually.",
          cta: "Add provider",
          "cta-icon": "tabler:plus",
          onCta: p[6] || (p[6] = (h) => a("add"))
        })
      ]))
    ]));
  }
}), yo = { class: "km-classes kx-system-pane" }, ko = {
  key: 0,
  class: "km-pool-body kx-system-body"
}, go = {
  key: 1,
  class: "km-pool-table km-classes-list kx-system-body"
}, wo = { class: "km-class-head" }, $o = { class: "km-class-head-text" }, Co = { class: "km-class-title" }, So = {
  key: 0,
  class: "km-class-desc"
}, xo = { class: "km-class-meta" }, To = { class: "km-class-count" }, Bo = {
  key: 0,
  class: "km-class-members"
}, _o = {
  key: 1,
  class: "km-class-rank"
}, Lo = { class: "km-class-member-name" }, Po = { class: "km-class-member-pri" }, Eo = {
  key: 1,
  class: "km-class-empty"
}, Io = /* @__PURE__ */ A({
  __name: "ModelClasses",
  props: {
    classes: {}
  },
  setup(e) {
    return (t, n) => (i(), c("div", yo, [
      e.classes.length ? (i(), c("div", go, [
        (i(!0), c(R, null, K(e.classes, (a) => (i(), c("article", {
          key: a.name,
          class: "km-class"
        }, [
          l("div", wo, [
            y(r(Te), {
              icon: a.icon || "tabler:category",
              size: "sm"
            }, null, 8, ["icon"]),
            l("div", $o, [
              l("div", Co, m(a.title || a.name), 1),
              a.description ? (i(), c("div", So, m(a.description), 1)) : k("", !0)
            ]),
            l("div", xo, [
              l("span", To, m(a.models.length) + " model" + m(a.models.length === 1 ? "" : "s"), 1)
            ])
          ]),
          a.models.length ? (i(), c("div", Bo, [
            (i(!0), c(R, null, K(a.models, (s, o) => (i(), c("div", {
              key: s.name,
              class: H(["km-class-member", { top: o === 0 }])
            }, [
              o === 0 ? (i(), C(r(N), {
                key: 0,
                severity: "success",
                icon: "tabler:check"
              }, {
                default: x(() => [...n[0] || (n[0] = [
                  _("active", -1)
                ])]),
                _: 1
              })) : (i(), c("span", _o, m(o + 1), 1)),
              l("span", Lo, m(s.title || s.name), 1),
              l("span", Po, "priority " + m(s.priority ?? 0), 1)
            ], 2))), 128))
          ])) : (i(), c("div", Eo, "No models assigned to this class yet."))
        ]))), 128))
      ])) : (i(), c("div", ko, [
        y(r(Ce), {
          icon: "tabler:category-2",
          title: "No model classes",
          hint: "Classes group models by purpose. The highest-priority model in each class is selected automatically."
        })
      ]))
    ]));
  }
}), Oo = { class: "km-picker" }, Ao = {
  key: 0,
  class: "km-picker-sec"
}, Do = { class: "km-picker-list" }, Fo = ["onClick"], Vo = { class: "km-picker-ico" }, zo = { class: "km-picker-body" }, Ro = { class: "km-picker-name" }, No = { class: "km-picker-desc" }, Ko = {
  key: 1,
  class: "km-picker-sec"
}, Mo = { class: "km-picker-list" }, jo = ["onClick"], Uo = { class: "km-picker-ico" }, Ho = { class: "km-picker-body" }, Wo = { class: "km-picker-name" }, Zo = { class: "km-picker-desc" }, qo = /* @__PURE__ */ A({
  __name: "ProviderPicker",
  props: {
    presets: {}
  },
  emits: ["pick"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = $(() => n.presets.filter((u) => !Fe(u))), o = $(() => n.presets.filter(Fe));
    return (u, b) => (i(), c("div", Oo, [
      s.value.length ? (i(), c("section", Ao, [
        b[0] || (b[0] = l("div", { class: "km-picker-sec-title" }, "Native providers", -1)),
        l("div", Do, [
          (i(!0), c(R, null, K(s.value, (f) => (i(), c("button", {
            key: f.id,
            class: "km-picker-item",
            onClick: (S) => a("pick", f)
          }, [
            l("span", Vo, [
              y(r(F), {
                icon: r(Ve)(f),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            l("span", zo, [
              l("span", Ro, m(f.title), 1),
              l("span", No, m(f.description), 1)
            ]),
            y(r(F), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, Fo))), 128))
        ])
      ])) : k("", !0),
      o.value.length ? (i(), c("section", Ko, [
        b[1] || (b[1] = l("div", { class: "km-picker-sec-title" }, "OpenAI-compatible", -1)),
        l("div", Mo, [
          (i(!0), c(R, null, K(o.value, (f) => (i(), c("button", {
            key: f.id,
            class: "km-picker-item",
            onClick: (S) => a("pick", f)
          }, [
            l("span", Uo, [
              y(r(F), {
                icon: r(Ve)(f),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            l("span", Ho, [
              l("span", Wo, m(f.title), 1),
              l("span", Zo, m(f.config?.base_url || f.description), 1)
            ]),
            y(r(F), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, jo))), 128))
        ])
      ])) : k("", !0)
    ]));
  }
}), Jo = { class: "km" }, Go = { class: "kx-rail-body" }, Qo = "kickside-model-provider-openai-compatible", Xo = "wippy.llm.openai_compat:provider", Yo = /* @__PURE__ */ A({
  __name: "models",
  setup(e) {
    const t = Qt(), { adapters: n, presets: a, profiles: s, models: o, classes: u, loading: b, saving: f, discovering: S, probing: T, error: v } = t, p = z("models"), h = _e(() => n.value, () => s.value), D = z("all"), E = z("none"), W = z("create"), O = z(null), g = z(null), L = z(null), M = z({ status: "idle" }), j = z({ status: "idle" }), U = z(""), Z = z(null), Q = z("");
    function et(d) {
      const w = /* @__PURE__ */ new Set();
      for (const P of o.value) for (const oe of d(P) ?? []) w.add(oe);
      return Array.from(w).sort();
    }
    const tt = $(() => et((d) => d.capabilities)), nt = $(() => {
      const d = /* @__PURE__ */ new Set();
      for (const w of u.value) w.name && d.add(w.name);
      for (const w of o.value) for (const P of w.class ?? []) d.add(P);
      return Array.from(d).sort();
    }), at = $(
      () => g.value?.provider_id || O.value?.provider_id || Xo
    ), pe = $(() => h.adapterFor(at.value)), be = $(
      () => O.value?.profile_editor_tag || pe.value?.profile_editor_tag || Qo
    ), ot = $(() => Rt(be.value)), rt = $(() => Nt(be.value)), it = $(() => E.value !== "none"), fe = $(() => E.value === "pick" ? { title: "Add provider", icon: "tabler:plug-connected", back: !1 } : E.value === "provider" ? W.value === "edit" ? { title: g.value?.name || "Edit provider", icon: "tabler:plug-connected", back: !1 } : { title: O.value?.title || "Add provider", icon: "tabler:plug-connected", back: !0 } : E.value === "model" ? { title: L.value?.title || L.value?.name || "Edit model", icon: "tabler:adjustments", back: !1 } : { title: "", icon: "", back: !1 });
    function q() {
      f.value || (E.value = "none", O.value = null, g.value = null, L.value = null, M.value = { status: "idle" });
    }
    function ve() {
      W.value = "create", O.value = null, g.value = null, E.value = "pick";
    }
    function st(d) {
      O.value = d, E.value = "provider";
    }
    function lt() {
      O.value = null, E.value = "pick";
    }
    function dt(d) {
      W.value = "edit", O.value = null, g.value = d, M.value = { status: "idle" }, E.value = "provider";
    }
    async function Le() {
      if (!g.value) return;
      M.value = { status: "testing" };
      const d = await t.testProfile(g.value.id);
      M.value = { status: d.ok ? "ok" : "fail", message: d.message };
    }
    function ct(d) {
      L.value = d, E.value = "model";
    }
    async function Pe(d) {
      const w = d?.detail ?? d;
      await t.saveProfile(W.value, g.value?.id || "", w) && q();
    }
    async function ut(d) {
      await t.saveCard(d) && q();
    }
    function pt(d) {
      return {
        name: d.name,
        title: d.title || d.name,
        description: d.description || "",
        provider_id: d.provider_id,
        provider_profile_id: d.provider_profile_id || void 0,
        provider_model: d.provider_model || d.name,
        capabilities: [...d.capabilities ?? []],
        classes: [...d.class ?? []],
        priority: Number(d.priority ?? 10),
        pricing: d.pricing ?? {},
        options: d.options ?? {},
        metadata: d.metadata ?? {},
        source: d.source === "registry" ? "overlay" : d.source || "overlay",
        enabled: d.enabled === !1
      };
    }
    async function bt(d) {
      await t.saveCard(pt(d));
    }
    async function ft(d) {
      U.value = "", j.value = { status: "testing", model: d.name, message: `Probing ${d.title || d.name}` };
      const w = await t.testModel(d.name);
      j.value = {
        status: w.ok ? "ok" : "fail",
        model: d.name,
        message: w.message,
        data: w.data
      };
    }
    function vt(d) {
      j.value.model === d.name && (j.value.status !== "ok" && j.value.status !== "fail" || (U.value = U.value === d.name ? "" : d.name));
    }
    async function mt() {
      const d = await t.exportSetup();
      if (!d) return;
      const w = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" })), P = document.createElement("a");
      P.href = w, P.download = "models-export.json", P.click(), URL.revokeObjectURL(w);
    }
    function Ee(d, w) {
      return `${d}: ${w.created.length} created, ${w.updated.length} updated, ${w.unchanged.length} unchanged`;
    }
    async function ht(d) {
      const w = d.target, P = w.files?.[0];
      if (w.value = "", !P) return;
      Q.value = "";
      let oe;
      try {
        oe = JSON.parse(await P.text());
      } catch {
        v.value = `${P.name} is not valid JSON`;
        return;
      }
      const me = await t.importSetup(oe);
      me && (Q.value = `${Ee("Providers", me.profiles)}. ${Ee("Models", me.cards)}.`);
    }
    async function yt(d) {
      await De.confirm({
        header: "Delete provider",
        message: `Remove “${d.name}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await t.deleteProfile(d.id);
    }
    async function kt(d) {
      if (d.source === "registry") return;
      const w = d.title || d.name;
      await De.confirm({
        header: "Delete model",
        message: `Remove “${w}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await t.deleteCard(d.name);
    }
    return We(p, (d) => {
      d === "classes" && t.loadClasses();
    }), It(async () => {
      await Promise.all([t.load(), t.loadClasses()]);
    }), (d, w) => (i(), c("div", Jo, [
      y(On, {
        value: p.value,
        label: "Model sections",
        items: [
          { value: "models", label: "Models", count: r(o).length },
          { value: "classes", label: "Classes", count: r(u).length }
        ],
        "onUpdate:value": w[0] || (w[0] = (P) => p.value = P)
      }, null, 8, ["value", "items"]),
      r(v) ? (i(), C(r(ze), {
        key: 0,
        severity: "danger",
        class: "km-top-notice",
        onDismiss: w[1] || (w[1] = (P) => v.value = "")
      }, {
        default: x(() => [
          _(m(r(v)), 1)
        ]),
        _: 1
      })) : k("", !0),
      Q.value ? (i(), C(r(ze), {
        key: 1,
        class: "km-top-notice",
        onDismiss: w[2] || (w[2] = (P) => Q.value = "")
      }, {
        default: x(() => [
          _(m(Q.value), 1)
        ]),
        _: 1
      })) : k("", !0),
      r(b) && !r(o).length && !r(s).length ? (i(), C(r(Xt), {
        key: 2,
        label: "Loading models…"
      })) : (i(), C(r(Vn), { key: 3 }, {
        rail: x(() => [
          y(r(Mn), {
            title: "Providers",
            count: r(s).length
          }, {
            actions: x(() => [
              y(r(V), {
                icon: "tabler:plus",
                label: "Add provider",
                disabled: r(f),
                onClick: ve
              }, null, 8, ["disabled"]),
              y(r(V), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: r(b),
                spin: r(b),
                onClick: r(t).load
              }, null, 8, ["disabled", "spin", "onClick"]),
              y(r(V), {
                icon: "tabler:download",
                label: "Export models",
                disabled: r(f),
                onClick: mt
              }, null, 8, ["disabled"]),
              y(r(V), {
                icon: "tabler:upload",
                label: "Import models",
                disabled: r(f),
                onClick: w[3] || (w[3] = (P) => Z.value?.click())
              }, null, 8, ["disabled"]),
              l("input", {
                ref_key: "importInput",
                ref: Z,
                type: "file",
                accept: "application/json,.json",
                hidden: "",
                onChange: ht
              }, null, 544)
            ]),
            _: 1
          }, 8, ["count"]),
          l("div", Go, [
            y(za, {
              profiles: r(s),
              adapters: r(n),
              "selected-id": D.value,
              discovering: r(S),
              busy: r(f),
              onSelect: w[4] || (w[4] = (P) => D.value = P),
              onAdd: ve,
              onEdit: dt,
              onDiscover: w[5] || (w[5] = (P) => r(t).discover(P.id)),
              onDelete: yt
            }, null, 8, ["profiles", "adapters", "selected-id", "discovering", "busy"])
          ])
        ]),
        default: x(() => [
          p.value === "models" ? (i(), C(ho, {
            key: 0,
            "selected-profile-id": D.value,
            models: r(o),
            profiles: r(s),
            adapters: r(n),
            "probing-model": r(T),
            "probe-state": j.value,
            "probe-details-model": U.value,
            busy: r(f),
            onEdit: ct,
            onDelete: kt,
            onProbe: ft,
            onToggleProbeDetails: vt,
            onToggleEnabled: bt,
            onAdd: ve
          }, null, 8, ["selected-profile-id", "models", "profiles", "adapters", "probing-model", "probe-state", "probe-details-model", "busy"])) : (i(), C(Io, {
            key: 1,
            classes: r(u)
          }, null, 8, ["classes"]))
        ]),
        _: 1
      })),
      y(r(xa), {
        open: it.value,
        title: fe.value.title,
        icon: fe.value.icon,
        back: fe.value.back,
        onClose: q,
        onBack: lt
      }, {
        default: x(() => [
          E.value === "pick" ? (i(), C(qo, {
            key: 0,
            presets: r(a),
            onPick: st
          }, null, 8, ["presets"])) : E.value === "provider" && rt.value ? (i(), C(Kt, {
            key: 1,
            "spec-key": ot.value,
            mode: W.value,
            adapter: pe.value || void 0,
            preset: O.value || void 0,
            profile: g.value,
            saving: r(f),
            "test-state": M.value,
            onSave: Pe,
            onCancel: q,
            onTest: Le
          }, null, 8, ["spec-key", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : E.value === "provider" ? (i(), C(Yt, {
            key: 2,
            tag: be.value,
            mode: W.value,
            adapter: pe.value || void 0,
            preset: O.value || void 0,
            profile: g.value,
            saving: r(f),
            "test-state": M.value,
            onSave: Pe,
            onCancel: q,
            onTest: Le
          }, null, 8, ["tag", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : E.value === "model" ? (i(), C(en, {
            key: 3,
            model: L.value,
            profiles: r(s),
            saving: r(f),
            "capability-options": tt.value,
            "class-options": nt.value,
            onSave: ut,
            onCancel: q
          }, null, 8, ["model", "profiles", "saving", "capability-options", "class-options"])) : k("", !0)
        ]),
        _: 1
      }, 8, ["open", "title", "icon", "back"])
    ]));
  }
}), ir = {
  rootComponent: Yo,
  plugins: [Ot]
};
export {
  ir as mountConfig
};
//# sourceMappingURL=lazy-mount-gjLmW_Sl.js.map
