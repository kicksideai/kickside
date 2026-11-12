import { B as X, R as Me, s as re, f as pe, k as St, b as G, Q as le, z as ce, a as je, c as he, T as xt, C as Tt, K as de, v as Bt, V as Ve, d as _e, L as Lt, e as ee, g as Pt, U as Vt, I as Ee, h as Et, i as Ot, r as Ue, j as At, l as It, m as Dt, x as ye, W as Nt, p as Ft, _ as Se, n as Rt, o as zt, q as Kt, t as ne, u as xe, w as Mt, y as jt, A as Ut, D as Ht, E as ue, F as te, G as Oe, H as Ae, J as He, M as D, N as K, O as Ie, P as Wt, S as qt, X as Zt, Y as Jt, Z as Gt, $ as We, a0 as Qt, a1 as Xt, a2 as qe, a3 as Ze, a4 as Je, a5 as Yt, a6 as en } from "./styles-Dfzj1Ni6.js";
import { mergeProps as T, resolveDirective as Te, withDirectives as Q, openBlock as l, createBlock as S, resolveDynamicComponent as ae, withCtx as g, renderSlot as E, normalizeClass as U, createElementBlock as v, createElementVNode as u, createCommentVNode as w, defineComponent as O, unref as o, createVNode as b, Fragment as F, renderList as z, createTextVNode as x, toDisplayString as y, getCurrentInstance as tn, computed as $, ref as N, withModifiers as Ge, vModelText as Qe, createSlots as Xe, resolveComponent as De, Transition as nn, normalizeStyle as an, reactive as Ye, toRef as on, watch as Be, h as sn } from "vue";
import { host as Ne, define as rn } from "@wippy-fe/proxy";
import { Icon as A } from "@iconify/vue";
var ln = {
  root: function(t) {
    var n = t.instance, a = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": a.disabled
    }];
  }
}, dn = X.extend({
  name: "tab",
  classes: ln
}), un = {
  name: "BaseTab",
  extends: re,
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
  style: dn,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, et = {
  name: "Tab",
  extends: un,
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
      return a ? le(a, "data-p-disabled") || le(a, "data-pc-section") === "activebar" ? this.findNextTab(a) : ce(a, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, a = n ? t : t.previousElementSibling;
      return a ? le(a, "data-p-disabled") || le(a, "data-pc-section") === "activebar" ? this.findPrevTab(a) : ce(a, '[data-pc-name="tab"]') : null;
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
      G(n), this.scrollInView(n);
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
      return St((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
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
      return T(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return pe({
        active: this.active
      });
    }
  },
  directives: {
    ripple: Me
  }
};
function cn(e, t, n, a, d, i) {
  var s = Te("ripple");
  return e.asChild ? E(e.$slots, "default", {
    key: 1,
    dataP: i.dataP,
    class: U(e.cx("root")),
    active: i.active,
    a11yAttrs: i.a11yAttrs,
    onClick: i.onClick
  }) : Q((l(), S(ae(e.as), T({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP,
    onClick: i.onClick
  }, i.attrs), {
    default: g(function() {
      return [E(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[s]]);
}
et.render = cn;
var tt = {
  name: "ChevronLeftIcon",
  extends: je
};
function pn(e) {
  return mn(e) || fn(e) || vn(e) || bn();
}
function bn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vn(e, t) {
  if (e) {
    if (typeof e == "string") return we(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? we(e, t) : void 0;
  }
}
function fn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function mn(e) {
  if (Array.isArray(e)) return we(e);
}
function we(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function hn(e, t, n, a, d, i) {
  return l(), v("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), pn(t[0] || (t[0] = [u("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
tt.render = hn;
var nt = {
  name: "ChevronRightIcon",
  extends: je
};
function yn(e) {
  return $n(e) || wn(e) || kn(e) || gn();
}
function gn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function kn(e, t) {
  if (e) {
    if (typeof e == "string") return $e(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? $e(e, t) : void 0;
  }
}
function wn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $n(e) {
  if (Array.isArray(e)) return $e(e);
}
function $e(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function Cn(e, t, n, a, d, i) {
  return l(), v("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), yn(t[0] || (t[0] = [u("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
nt.render = Cn;
var _n = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, Sn = X.extend({
  name: "tablist",
  classes: _n
}), xn = {
  name: "BaseTabList",
  extends: re,
  props: {},
  style: Sn,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, at = {
  name: "TabList",
  extends: xn,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), a = he(t) - n, d = Math.abs(t.scrollLeft), i = a * 0.8, s = d - i, m = Math.max(s, 0);
      t.scrollLeft = Ve(t) ? -1 * m : m;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), a = he(t) - n, d = Math.abs(t.scrollLeft), i = a * 0.8, s = d + i, m = t.scrollWidth - a, h = Math.min(s, m);
      t.scrollLeft = Ve(t) ? -1 * h : h;
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
      var n = this.$refs.content, a = ce(n, '[data-pc-name="tab"][data-p-active="true"]');
      a && (this.inkBarObserver = new ResizeObserver(function() {
        return t.updateInkBar();
      }), this.inkBarObserver.observe(a));
    },
    unbindInkBarObserver: function() {
      var t;
      (t = this.inkBarObserver) === null || t === void 0 || t.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var t = this.$refs, n = t.content, a = t.inkbar, d = t.tabs;
      if (a) {
        var i = ce(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (a.style.height = Tt(i) + "px", a.style.top = de(i).top - de(d).top + "px") : (a.style.width = Bt(i) + "px", a.style.left = de(i).left - de(d).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, a = t.content, d = a.scrollTop, i = a.scrollWidth, s = a.scrollHeight, m = a.offsetWidth, h = a.offsetHeight, _ = Math.abs(a.scrollLeft), k = [he(a), xt(a)], c = k[0], r = k[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = d !== 0, this.isNextButtonEnabled = n.offsetHeight >= h && parseInt(d) !== s - r) : (this.isPrevButtonEnabled = _ !== 0, this.isNextButtonEnabled = n.offsetWidth >= m && parseInt(_) !== i - c);
    },
    getVisibleButtonWidths: function() {
      var t = this.$refs, n = t.prevButton, a = t.nextButton, d = 0;
      return this.showNavigators && (d = (n?.offsetWidth || 0) + (a?.offsetWidth || 0)), d;
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
      return pe({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: tt,
    ChevronRightIcon: nt
  },
  directives: {
    ripple: Me
  }
}, Tn = ["data-p"], Bn = ["aria-label", "tabindex"], Ln = ["data-p"], Pn = ["aria-orientation"], Vn = ["aria-label", "tabindex"];
function En(e, t, n, a, d, i) {
  var s = Te("ripple");
  return l(), v("div", T({
    ref: "list",
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [i.showNavigators && d.isPrevButtonEnabled ? Q((l(), v("button", T({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: e.cx("prevButton"),
    "aria-label": i.prevButtonAriaLabel,
    tabindex: i.$pcTabs.tabindex,
    onClick: t[0] || (t[0] = function() {
      return i.onPrevButtonClick && i.onPrevButtonClick.apply(i, arguments);
    })
  }, e.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(l(), S(ae(i.templates.previcon || "ChevronLeftIcon"), T({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, Bn)), [[s]]) : w("", !0), u("div", T({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    }),
    "data-p": i.dataP
  }, e.ptm("content")), [u("div", T({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": i.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [E(e.$slots, "default"), u("span", T({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Pn)], 16, Ln), i.showNavigators && d.isNextButtonEnabled ? Q((l(), v("button", T({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: e.cx("nextButton"),
    "aria-label": i.nextButtonAriaLabel,
    tabindex: i.$pcTabs.tabindex,
    onClick: t[2] || (t[2] = function() {
      return i.onNextButtonClick && i.onNextButtonClick.apply(i, arguments);
    })
  }, e.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(l(), S(ae(i.templates.nexticon || "ChevronRightIcon"), T({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Vn)), [[s]]) : w("", !0)], 16, Tn);
}
at.render = En;
var On = `
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
`, An = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, In = X.extend({
  name: "tabs",
  style: On,
  classes: An
}), Dn = {
  name: "BaseTabs",
  extends: re,
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
  style: In,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, ot = {
  name: "Tabs",
  extends: Dn,
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
function Nn(e, t, n, a, d, i) {
  return l(), v("div", T({
    class: e.cx("root")
  }, e.ptmi("root")), [E(e.$slots, "default")], 16);
}
ot.render = Nn;
const Fn = {
  key: 0,
  class: "kx-system-tab-count"
}, Rn = /* @__PURE__ */ O({
  __name: "SystemTabs",
  props: {
    value: {},
    label: {},
    items: {}
  },
  emits: ["update:value"],
  setup(e) {
    return (t, n) => (l(), S(o(ot), {
      class: "kx-system-tabs",
      "data-kx-separator": "surface",
      value: e.value,
      "onUpdate:value": n[0] || (n[0] = (a) => t.$emit("update:value", String(a)))
    }, {
      default: g(() => [
        b(o(at), {
          pt: { tabList: { "aria-label": e.label } }
        }, {
          default: g(() => [
            (l(!0), v(F, null, z(e.items, (a) => (l(), S(o(et), T({
              key: a.value,
              value: a.value
            }, { ref_for: !0 }, a.controls ? { "aria-controls": a.controls } : {}), {
              default: g(() => [
                x(y(a.label), 1),
                a.count !== void 0 ? (l(), v("b", Fn, y(a.count), 1)) : w("", !0)
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
}), zn = { class: "kx-shell" }, Kn = { class: "kx-rail" }, Mn = { class: "kx-main" }, jn = /* @__PURE__ */ O({
  __name: "Shell",
  setup(e) {
    return (t, n) => (l(), v("div", zn, [
      u("aside", Kn, [
        E(t.$slots, "rail")
      ]),
      u("main", Mn, [
        E(t.$slots, "default")
      ])
    ]));
  }
}), Un = { class: "kx-railhead" }, Hn = { class: "kx-railhead-title" }, Wn = { key: 0 }, qn = { class: "kx-railhead-acts" }, Zn = /* @__PURE__ */ O({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (l(), v("div", Un, [
      u("span", Hn, [
        x(y(e.title), 1),
        e.count !== void 0 ? (l(), v("b", Wn, y(e.count), 1)) : w("", !0)
      ]),
      u("div", qn, [
        E(t.$slots, "actions")
      ])
    ]));
  }
}), j = /* @__PURE__ */ O({
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
    const n = e, a = t, d = tn(), i = $(
      () => Object.prototype.hasOwnProperty.call(d?.vnode.props ?? {}, "active")
    ), s = $(() => {
      if (n.severity) return n.severity;
      if (n.variant === "danger") return "danger";
      if (n.variant === "bordered") return "secondary";
    }), m = $(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (h, _) => (l(), S(o(_e), {
      severity: s.value,
      text: e.variant !== "bordered" && !e.active,
      outlined: e.variant === "bordered",
      size: m.value,
      loading: e.spin,
      disabled: e.disabled || e.spin,
      pt: {
        root: {
          "aria-label": e.label,
          "aria-pressed": i.value ? String(e.active) : void 0,
          title: e.label
        }
      },
      onClick: _[0] || (_[0] = (k) => a("click"))
    }, {
      icon: g(() => [
        b(o(A), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), Jn = { class: "km-search" }, Gn = ["value", "placeholder"], Qn = /* @__PURE__ */ O({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (a, d) => (l(), v("div", Jn, [
      b(o(A), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      u("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: d[0] || (d[0] = (i) => n("update:modelValue", i.target.value))
      }, null, 40, Gn),
      e.modelValue ? (l(), v("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: d[1] || (d[1] = (i) => n("update:modelValue", ""))
      }, [
        b(o(A), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : w("", !0)
    ]));
  }
}), Xn = { class: "km-taginput-wrap" }, Yn = { class: "km-tag-label" }, ea = ["title", "aria-label", "disabled", "onClick"], ta = ["placeholder", "disabled"], na = {
  key: 0,
  class: "km-tag-sug"
}, aa = ["disabled", "onClick"], Fe = /* @__PURE__ */ O({
  __name: "TagInput",
  props: {
    modelValue: {},
    suggestions: { default: () => [] },
    placeholder: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, a = t, d = N(""), i = N(null), s = $(() => {
      const k = d.value.trim().toLowerCase();
      return n.suggestions.filter((c) => !n.modelValue.includes(c)).filter((c) => !k || c.toLowerCase().includes(k));
    });
    function m(k) {
      const c = k.trim();
      if (!c || n.modelValue.includes(c)) {
        d.value = "";
        return;
      }
      a("update:modelValue", [...n.modelValue, c]), d.value = "", i.value?.focus();
    }
    function h(k) {
      a("update:modelValue", n.modelValue.filter((c) => c !== k));
    }
    function _(k) {
      k.key === "Enter" || k.key === "," ? (k.preventDefault(), m(d.value || s.value[0] || "")) : k.key === "Backspace" && !d.value && n.modelValue.length && h(n.modelValue[n.modelValue.length - 1]);
    }
    return (k, c) => (l(), v("div", Xn, [
      u("div", {
        class: U(["km-taginput", { disabled: e.disabled }]),
        onClick: c[1] || (c[1] = (r) => i.value?.focus())
      }, [
        (l(!0), v(F, null, z(e.modelValue, (r) => (l(), v("span", {
          key: r,
          class: "km-tag"
        }, [
          u("span", Yn, y(r), 1),
          u("button", {
            type: "button",
            class: "km-tag-x",
            title: `Remove ${r}`,
            "aria-label": `Remove ${r}`,
            disabled: e.disabled,
            onClick: Ge((p) => h(r), ["stop"])
          }, [
            b(o(A), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ], 8, ea)
        ]))), 128)),
        Q(u("input", {
          ref_key: "inputEl",
          ref: i,
          "onUpdate:modelValue": c[0] || (c[0] = (r) => d.value = r),
          class: "km-tag-field",
          type: "text",
          placeholder: e.modelValue.length ? "" : e.placeholder || "Add…",
          disabled: e.disabled,
          spellcheck: "false",
          autocomplete: "off",
          onKeydown: _
        }, null, 40, ta), [
          [Qe, d.value]
        ])
      ], 2),
      s.value.length ? (l(), v("div", na, [
        (l(!0), v(F, null, z(s.value, (r) => (l(), v("button", {
          key: r,
          type: "button",
          class: "km-tag-sug-item",
          disabled: e.disabled,
          onClick: (p) => m(r)
        }, [
          b(o(A), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          }),
          x(" " + y(r), 1)
        ], 8, aa))), 128))
      ])) : w("", !0)
    ]));
  }
});
var oa = `
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
`, ia = {
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
}, sa = X.extend({
  name: "tag",
  style: oa,
  classes: ia
}), ra = {
  name: "BaseTag",
  extends: re,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: sa,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function oe(e) {
  "@babel/helpers - typeof";
  return oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, oe(e);
}
function la(e, t, n) {
  return (t = da(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function da(e) {
  var t = ua(e, "string");
  return oe(t) == "symbol" ? t : t + "";
}
function ua(e, t) {
  if (oe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (oe(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var it = {
  name: "Tag",
  extends: ra,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return pe(la({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, ca = ["data-p"];
function pa(e, t, n, a, d, i) {
  return l(), v("span", T({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (l(), S(ae(e.$slots.icon), T({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (l(), v("span", T({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : w("", !0), e.value != null || e.$slots.default ? E(e.$slots, "default", {
    key: 2
  }, function() {
    return [u("span", T({
      class: e.cx("label")
    }, e.ptm("label")), y(e.value), 17)];
  }) : w("", !0)], 16, ca);
}
it.render = pa;
const ba = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, M = /* @__PURE__ */ O({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (l(), S(o(it), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: g(() => [
        e.dot ? (l(), v("span", ba)) : e.icon ? (l(), S(o(A), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : w("", !0),
        E(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), va = { class: "kx-empty" }, fa = { class: "kx-empty-ico" }, ma = { class: "kx-empty-title" }, ha = {
  key: 0,
  class: "kx-empty-sub"
}, Ce = /* @__PURE__ */ O({
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
    return (t, n) => (l(), v("div", va, [
      u("div", fa, [
        b(o(A), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      u("div", ma, y(e.title), 1),
      e.hint || t.$slots.hint ? (l(), v("p", ha, [
        E(t.$slots, "hint", {}, () => [
          x(y(e.hint), 1)
        ])
      ])) : w("", !0),
      e.cta ? (l(), S(o(_e), {
        key: 1,
        label: e.cta,
        onClick: n[0] || (n[0] = (a) => t.$emit("cta"))
      }, Xe({ _: 2 }, [
        e.ctaIcon ? {
          name: "icon",
          fn: g(({ class: a }) => [
            b(o(A), {
              icon: e.ctaIcon,
              class: U(a),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          key: "0"
        } : void 0
      ]), 1032, ["label"])) : w("", !0)
    ]));
  }
});
var ya = X.extend({
  name: "focustrap-directive"
}), ga = Pt.extend({
  style: ya
});
function ie(e) {
  "@babel/helpers - typeof";
  return ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ie(e);
}
function Re(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(d) {
      return Object.getOwnPropertyDescriptor(e, d).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function ze(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Re(Object(n), !0).forEach(function(a) {
      ka(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Re(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function ka(e, t, n) {
  return (t = wa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function wa(e) {
  var t = $a(e, "string");
  return ie(t) == "symbol" ? t : t + "";
}
function $a(e, t) {
  if (ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (ie(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ca = ga.extend("focustrap", {
  mounted: function(t, n) {
    var a = n.value || {}, d = a.disabled;
    d || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var a = n.value || {}, d = a.disabled;
    d && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var a = this, d = n.value || {}, i = d.onFocusIn, s = d.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(m) {
        m.forEach(function(h) {
          if (h.type === "childList" && !t.contains(document.activeElement)) {
            var _ = function(c) {
              var r = Ee(c) ? Ee(c, a.getComputedSelector(t.$_pfocustrap_focusableselector)) ? c : ee(t, a.getComputedSelector(t.$_pfocustrap_focusableselector)) : ee(c);
              return Et(r) ? r : c.nextSibling && _(c.nextSibling);
            };
            G(_(h.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(m) {
        return i && i(m);
      }, t.$_pfocustrap_focusoutlistener = function(m) {
        return s && s(m);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: ze(ze({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var a = n.value || {}, d = a.autoFocusSelector, i = d === void 0 ? "" : d, s = a.firstFocusableSelector, m = s === void 0 ? "" : s, h = a.autoFocus, _ = h === void 0 ? !1 : h, k = ee(t, "[autofocus]".concat(this.getComputedSelector(i)));
      _ && !k && (k = ee(t, this.getComputedSelector(m))), G(k);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, d = t.relatedTarget, i = d === a.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(d)) ? ee(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_lasthiddenfocusableelement;
      G(i);
    },
    onLastHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, d = t.relatedTarget, i = d === a.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(d)) ? Lt(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_firsthiddenfocusableelement;
      G(i);
    },
    createHiddenFocusableElements: function(t, n) {
      var a = this, d = n.value || {}, i = d.tabIndex, s = i === void 0 ? 0 : i, m = d.firstFocusableSelector, h = m === void 0 ? "" : m, _ = d.lastFocusableSelector, k = _ === void 0 ? "" : _, c = function(P) {
        return Vt("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: s,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: P?.bind(a)
        });
      }, r = c(this.onFirstHiddenElementFocus), p = c(this.onLastHiddenElementFocus);
      r.$_pfocustrap_lasthiddenfocusableelement = p, r.$_pfocustrap_focusableselector = h, r.setAttribute("data-pc-section", "firstfocusableelement"), p.$_pfocustrap_firsthiddenfocusableelement = r, p.$_pfocustrap_focusableselector = k, p.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(r), t.append(p);
    }
  }
});
function _a() {
  At({
    variableName: Ue("scrollbar.width").name
  });
}
function Sa() {
  Ot({
    variableName: Ue("scrollbar.width").name
  });
}
var xa = `
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
`, Ta = {
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
}, Ba = {
  mask: function(t) {
    var n = t.instance, a = t.props, d = ["left", "right", "top", "bottom"], i = d.find(function(s) {
      return s === a.position;
    });
    return ["p-drawer-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": a.modal,
      "p-drawer-open": n.containerVisible,
      "p-drawer-full": n.fullScreen
    }, i ? "p-drawer-".concat(i) : ""];
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
}, La = X.extend({
  name: "drawer",
  style: xa,
  classes: Ba,
  inlineStyles: Ta
}), Pa = {
  name: "BaseDrawer",
  extends: re,
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
  style: La,
  provide: function() {
    return {
      $pcDrawer: this,
      $parentInstance: this
    };
  }
};
function se(e) {
  "@babel/helpers - typeof";
  return se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, se(e);
}
function ge(e, t, n) {
  return (t = Va(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Va(e) {
  var t = Ea(e, "string");
  return se(t) == "symbol" ? t : t + "";
}
function Ea(e, t) {
  if (se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (se(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var st = {
  name: "Drawer",
  extends: Pa,
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
      this.modal && !this.isUnstyled && Nt(this.mask, "p-overlay-mask-leave-active"), this.$emit("before-hide");
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
      var t = function(d) {
        return d && d.querySelector("[autofocus]");
      }, n = this.$slots.header && t(this.headerContainer);
      n || (n = this.$slots.default && t(this.container), n || (n = this.$slots.footer && t(this.footerContainer), n || (n = this.closeButton))), n && G(n);
    },
    enableDocumentSettings: function() {
      this.dismissable && !this.modal && this.bindOutsideClickListener(), this.blockScroll && _a();
    },
    disableDocumentSettings: function() {
      this.unbindOutsideClickListener(), this.blockScroll && Sa();
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
      return pe(ge(ge(ge({
        "full-screen": this.position === "full"
      }, this.position, this.position), "open", this.containerVisible), "modal", this.modal));
    }
  },
  directives: {
    focustrap: Ca
  },
  components: {
    Button: _e,
    Portal: Dt,
    TimesIcon: It
  }
}, Oa = ["data-p"], Aa = ["role", "aria-modal", "data-p"];
function Ia(e, t, n, a, d, i) {
  var s = De("Button"), m = De("Portal"), h = Te("focustrap");
  return l(), S(m, null, {
    default: g(function() {
      return [d.containerVisible ? (l(), v("div", T({
        key: 0,
        ref: i.maskRef,
        onMousedown: t[0] || (t[0] = function() {
          return i.onMaskClick && i.onMaskClick.apply(i, arguments);
        }),
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        "data-p": i.dataP
      }, e.ptm("mask")), [b(nn, T({
        name: "p-drawer",
        onEnter: i.onEnter,
        onAfterEnter: i.onAfterEnter,
        onBeforeLeave: i.onBeforeLeave,
        onLeave: i.onLeave,
        onAfterLeave: i.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: g(function() {
          return [e.visible ? Q((l(), v("div", T({
            key: 0,
            ref: i.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: e.modal ? "dialog" : "complementary",
            "aria-modal": e.modal ? !0 : void 0,
            "data-p": i.dataP
          }, e.ptmi("root")), [e.$slots.container ? E(e.$slots, "container", {
            key: 0,
            closeCallback: i.hide
          }) : (l(), v(F, {
            key: 1
          }, [u("div", T({
            ref: i.headerContainerRef,
            class: e.cx("header")
          }, e.ptm("header")), [E(e.$slots, "header", {
            class: U(e.cx("title"))
          }, function() {
            return [e.header ? (l(), v("div", T({
              key: 0,
              class: e.cx("title")
            }, e.ptm("title")), y(e.header), 17)) : w("", !0)];
          }), e.showCloseIcon ? E(e.$slots, "closebutton", {
            key: 0,
            closeCallback: i.hide
          }, function() {
            return [b(s, T({
              ref: i.closeButtonRef,
              type: "button",
              class: e.cx("pcCloseButton"),
              "aria-label": i.closeAriaLabel,
              unstyled: e.unstyled,
              onClick: i.hide
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "iconcontainer"
            }), {
              icon: g(function(_) {
                return [E(e.$slots, "closeicon", {}, function() {
                  return [(l(), S(ae(e.closeIcon ? "span" : "TimesIcon"), T({
                    class: [e.closeIcon, _.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onClick", "pt"])];
          }) : w("", !0)], 16), u("div", T({
            ref: i.contentRef,
            class: e.cx("content")
          }, e.ptm("content")), [E(e.$slots, "default")], 16), e.$slots.footer ? (l(), v("div", T({
            key: 0,
            ref: i.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [E(e.$slots, "footer")], 16)) : w("", !0)], 64))], 16, Aa)), [[h]]) : w("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Oa)) : w("", !0)];
    }),
    _: 3
  });
}
st.render = Ia;
const Da = { class: "km-drawer-title" }, Na = /* @__PURE__ */ O({
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
    const n = e, a = t, d = $(() => n.wide ? "min(720px, calc(100vw - 36px))" : "min(560px, calc(100vw - 36px))");
    function i(s) {
      s || a("close");
    }
    return (s, m) => (l(), S(o(st), {
      visible: e.open,
      position: "right",
      modal: !0,
      pt: { content: { class: "km-drawer-content" } },
      dismissable: !0,
      "close-on-escape": !0,
      style: an({ width: d.value }),
      "aria-label": e.title,
      "onUpdate:visible": i
    }, Xe({
      header: g(() => [
        e.back ? (l(), S(j, {
          key: 0,
          icon: "tabler:chevron-left",
          label: "Back",
          onClick: m[0] || (m[0] = (h) => a("back"))
        })) : w("", !0),
        u("span", Da, [
          e.icon ? (l(), S(o(A), {
            key: 0,
            icon: e.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : w("", !0),
          x(y(e.title), 1)
        ])
      ]),
      default: g(() => [
        E(s.$slots, "default")
      ]),
      _: 2
    }, [
      s.$slots.footer ? {
        name: "footer",
        fn: g(() => [
          E(s.$slots, "footer")
        ]),
        key: "0"
      } : void 0
    ]), 1032, ["visible", "style", "aria-label"]));
  }
});
function Fa(e) {
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
function Ra(e) {
  const t = Fa(e);
  return t === null ? "" : new Date(t).toLocaleString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
const za = ["title"], Ka = { class: "km-prow-text" }, Ma = { class: "km-prow-name" }, ja = ["title"], Ua = { class: "km-prow-sub" }, Ha = { class: "km-prow-acts" }, Wa = {
  key: 0,
  class: "km-prow-msg"
}, qa = /* @__PURE__ */ O({
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
    const n = e, a = t, d = $(() => {
      if (!n.discoverable) return "Automatic model discovery is not available for this provider";
      const i = Ra(n.profile.last_discovered_at);
      return i ? `Discover models (last ${i})` : "Discover models";
    });
    return (i, s) => (l(), v("div", {
      class: U(["km-prow", { on: e.selected }])
    }, [
      u("button", {
        class: "km-prow-main",
        title: o(Ft)(e.profile),
        onClick: s[0] || (s[0] = (m) => a("select"))
      }, [
        b(o(Se), {
          icon: e.providerIcon,
          size: "sm"
        }, null, 8, ["icon"]),
        u("span", Ka, [
          u("span", Ma, [
            u("span", null, y(e.profile.name), 1),
            o(Rt)(e.profile) ? (l(), S(o(A), {
              key: 0,
              icon: "tabler:key",
              class: "km-prow-cred",
              title: "Credentials stored",
              "aria-hidden": "true"
            })) : w("", !0),
            u("span", {
              class: U(["km-prow-dot", o(Kt)(e.profile.status)]),
              title: o(zt)(e.profile.status),
              "aria-hidden": "true"
            }, null, 10, ja)
          ]),
          u("span", Ua, y(e.adapterTitle), 1)
        ]),
        e.profile.enabled ? w("", !0) : (l(), S(o(M), {
          key: 0,
          severity: "warn"
        }, {
          default: g(() => [...s[4] || (s[4] = [
            x("off", -1)
          ])]),
          _: 1
        }))
      ], 8, za),
      u("div", Ha, [
        b(o(j), {
          icon: "tabler:radar-2",
          label: d.value,
          size: "sm",
          disabled: !e.discoverable || e.discovering || e.busy,
          spin: e.discovering,
          onClick: s[1] || (s[1] = (m) => a("discover"))
        }, null, 8, ["label", "disabled", "spin"]),
        b(o(j), {
          icon: "tabler:edit",
          label: "Edit provider",
          size: "sm",
          disabled: e.busy,
          onClick: s[2] || (s[2] = (m) => a("edit"))
        }, null, 8, ["disabled"]),
        b(o(j), {
          icon: "tabler:trash",
          label: "Delete provider",
          size: "sm",
          variant: "danger",
          disabled: e.busy,
          onClick: s[3] || (s[3] = (m) => a("delete"))
        }, null, 8, ["disabled"])
      ]),
      e.profile.message ? (l(), v("div", Wa, y(e.profile.message), 1)) : w("", !0)
    ], 2));
  }
}), Za = { class: "km-plist" }, Ja = {
  key: 0,
  class: "km-plist-empty"
}, Ga = /* @__PURE__ */ O({
  __name: "ProviderList",
  props: {
    profiles: {},
    adapters: {},
    presets: {},
    selectedId: {},
    discovering: {},
    busy: { type: Boolean }
  },
  emits: ["select", "edit", "discover", "delete", "add"],
  setup(e, { emit: t }) {
    const n = e, a = t, d = xe(() => n.adapters, () => n.profiles, () => n.presets);
    return (i, s) => (l(), v("div", Za, [
      u("button", {
        class: U(["km-plist-all", { on: e.selectedId === "all" }]),
        onClick: s[0] || (s[0] = (m) => a("select", "all"))
      }, " All providers ", 2),
      e.profiles.length ? w("", !0) : (l(), v("div", Ja, [
        s[3] || (s[3] = u("p", null, "No providers connected.", -1)),
        b(o(ne), {
          small: "",
          icon: "tabler:plus",
          onClick: s[1] || (s[1] = (m) => a("add"))
        }, {
          default: g(() => [...s[2] || (s[2] = [
            x("Add provider", -1)
          ])]),
          _: 1
        })
      ])),
      (l(!0), v(F, null, z(e.profiles, (m) => (l(), S(qa, {
        key: m.id,
        profile: m,
        "provider-icon": o(d).providerIcon(m.provider_id),
        "adapter-title": o(d).adapterTitle(m.provider_id),
        selected: e.selectedId === m.id,
        discoverable: o(d).isDiscoverable(m),
        discovering: e.discovering === m.id,
        busy: e.busy,
        onSelect: (h) => a("select", m.id),
        onEdit: (h) => a("edit", m),
        onDiscover: (h) => a("discover", m),
        onDelete: (h) => a("delete", m)
      }, null, 8, ["profile", "provider-icon", "adapter-title", "selected", "discoverable", "discovering", "busy", "onSelect", "onEdit", "onDiscover", "onDelete"]))), 128))
    ]));
  }
}), Qa = { class: "km-mrow-id" }, Xa = { class: "km-mrow-title" }, Ya = { class: "km-mrow-title-text" }, eo = { class: "km-mrow-sub" }, to = { class: "km-mrow-prov" }, no = { class: "km-mrow-mono" }, ao = { class: "km-mrow-tags" }, oo = {
  key: 0,
  class: "km-tag-group km-tag-classes"
}, io = { class: "km-tag-group km-tag-caps" }, so = { class: "km-mrow-limits" }, ro = {
  class: "km-mrow-limit-chips",
  "aria-label": "Token limits"
}, lo = { class: "km-mrow-acts" }, uo = { class: "km-mrow-probe-head" }, co = { class: "km-mrow-probe-msg" }, po = {
  key: 0,
  class: "km-probe-time"
}, bo = {
  key: 0,
  class: "km-mrow-probe-body"
}, vo = {
  key: 0,
  class: "km-probe-tokens"
}, fo = {
  key: 1,
  class: "km-probe-out"
}, mo = {
  key: 2,
  class: "km-probe-out"
}, Ke = 5, ho = /* @__PURE__ */ O({
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
    const n = e, a = t, d = $(() => n.model.capabilities ?? []), i = $(() => d.value.slice(0, Ke)), s = $(() => Math.max(0, d.value.length - Ke)), m = $(() => d.value.includes("reasoning") || d.value.includes("extended_thinking") || Mt(n.model, "reasoning_model_request") === "true"), h = $(() => n.model.enabled !== !1 && (d.value.includes("generate") || d.value.includes("tool_use"))), _ = $(() => n.probeState?.model === n.model.name ? n.probeState : null), k = $(() => _.value?.status || "idle"), c = $(() => k.value === "ok" || k.value === "fail"), r = $(() => k.value === "ok" ? "tabler:circle-check" : k.value === "fail" ? "tabler:circle-x" : "tabler:activity-heartbeat"), p = $(() => {
      if (k.value === "ok") return "success";
      if (k.value === "fail") return "danger";
    }), V = $(() => n.probing ? `Checking ${n.model.title || n.model.name}` : k.value === "ok" ? "Model check succeeded. View details" : k.value === "fail" ? "Model check failed. View details" : "Run model check"), P = $(() => {
      const I = _.value?.data?.tokens;
      if (!I) return [];
      const C = ["prompt_tokens", "completion_tokens", "total_tokens", "thinking_tokens"], L = /* @__PURE__ */ new Set(), H = [], W = (q) => {
        const Y = I[q];
        typeof Y == "number" && Y > 0 && !L.has(q) && (L.add(q), H.push({ label: q.replace(/_tokens$/, "").replace(/_input$/, "").replace(/_/g, " "), value: Y }));
      };
      return C.forEach(W), Object.keys(I).forEach(W), H;
    });
    function Z() {
      c.value ? a("toggle-probe-details") : a("probe");
    }
    return (I, C) => (l(), v("div", {
      class: U(["km-mrow", { "km-mrow-off": e.model.enabled === !1 }])
    }, [
      b(o(Se), { icon: e.providerIcon }, null, 8, ["icon"]),
      u("div", Qa, [
        u("div", Xa, [
          u("span", Ya, y(e.model.title || e.model.name), 1),
          b(o(M), {
            severity: o(jt)(e.model.source)
          }, {
            default: g(() => [
              x(y(o(Ut)(e.model.source)), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          e.model.enabled === !1 ? (l(), S(o(M), {
            key: 0,
            severity: "secondary",
            icon: "tabler:ban"
          }, {
            default: g(() => [...C[4] || (C[4] = [
              x("disabled", -1)
            ])]),
            _: 1
          })) : w("", !0)
        ]),
        u("div", eo, [
          u("span", to, y(e.providerTitle || "—"), 1),
          e.model.provider_profile_id ? (l(), v(F, { key: 0 }, [
            x(" · " + y(e.profileTitle), 1)
          ], 64)) : w("", !0),
          u("span", no, " · " + y(e.model.name), 1)
        ])
      ]),
      u("div", ao, [
        (e.model.class || []).length ? (l(), v("span", oo, [
          (l(!0), v(F, null, z(e.model.class || [], (L) => (l(), S(o(M), {
            key: `k-${L}`,
            severity: "",
            icon: "tabler:category-2"
          }, {
            default: g(() => [
              x(y(L), 1)
            ]),
            _: 2
          }, 1024))), 128))
        ])) : w("", !0),
        u("span", io, [
          m.value ? (l(), S(o(M), {
            key: 0,
            severity: "info",
            icon: "tabler:bulb"
          }, {
            default: g(() => [...C[5] || (C[5] = [
              x("reasoning", -1)
            ])]),
            _: 1
          })) : w("", !0),
          (l(!0), v(F, null, z(i.value, (L) => (l(), S(o(M), {
            key: `c-${L}`,
            severity: "secondary",
            icon: o(Ht)(L) || void 0
          }, {
            default: g(() => [
              x(y(L), 1)
            ]),
            _: 2
          }, 1032, ["icon"]))), 128)),
          s.value ? (l(), S(o(M), {
            key: 1,
            severity: "secondary"
          }, {
            default: g(() => [
              x("+" + y(s.value), 1)
            ]),
            _: 1
          })) : w("", !0)
        ])
      ]),
      u("div", so, [
        u("span", null, [
          u("b", null, y(o(ue)(e.model.max_tokens)), 1),
          C[6] || (C[6] = x(" ctx", -1))
        ]),
        u("span", null, [
          u("b", null, y(o(ue)(e.model.output_tokens)), 1),
          C[7] || (C[7] = x(" out", -1))
        ])
      ]),
      u("div", ro, [
        u("span", null, [
          u("b", null, y(o(ue)(e.model.max_tokens)), 1),
          C[8] || (C[8] = x(" ctx", -1))
        ]),
        u("span", null, [
          u("b", null, y(o(ue)(e.model.output_tokens)), 1),
          C[9] || (C[9] = x(" out", -1))
        ])
      ]),
      u("div", lo, [
        h.value ? (l(), S(o(j), {
          key: 0,
          icon: r.value,
          label: V.value,
          size: "sm",
          variant: "bordered",
          severity: p.value,
          active: c.value && e.probeDetailsOpen,
          spin: e.probing,
          disabled: e.probing || !c.value && e.busy,
          onClick: Z
        }, null, 8, ["icon", "label", "severity", "active", "spin", "disabled"])) : w("", !0),
        b(o(j), {
          icon: e.model.enabled === !1 ? "tabler:circle-check" : "tabler:circle-minus",
          label: e.model.enabled === !1 ? "Enable model" : "Disable model",
          size: "sm",
          variant: "bordered",
          disabled: e.busy,
          onClick: C[0] || (C[0] = (L) => a("toggle-enabled"))
        }, null, 8, ["icon", "label", "disabled"]),
        b(o(j), {
          icon: "tabler:adjustments",
          label: "Edit model",
          size: "sm",
          variant: "bordered",
          onClick: C[1] || (C[1] = (L) => a("edit"))
        }),
        e.model.source !== "registry" ? (l(), S(o(j), {
          key: 1,
          icon: "tabler:trash",
          label: "Delete model",
          size: "sm",
          variant: "bordered",
          severity: "danger",
          onClick: C[2] || (C[2] = (L) => a("delete"))
        })) : w("", !0)
      ]),
      e.probeDetailsOpen && c.value ? (l(), v("div", {
        key: 0,
        class: U(["km-mrow-probe", k.value])
      }, [
        u("div", uo, [
          b(o(A), {
            icon: k.value === "ok" ? "tabler:circle-check" : "tabler:circle-x",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          u("span", co, y(k.value === "ok" ? "Model works" : "Model check failed"), 1),
          _.value?.data && _.value.data.elapsed_ms != null ? (l(), v("span", po, y(_.value.data.elapsed_ms) + " ms", 1)) : w("", !0),
          b(o(ne), {
            icon: "tabler:activity-heartbeat",
            variant: "ghost",
            small: "",
            disabled: e.probing || e.busy,
            onClick: C[3] || (C[3] = (L) => a("probe"))
          }, {
            default: g(() => [...C[10] || (C[10] = [
              x(" Run again ", -1)
            ])]),
            _: 1
          }, 8, ["disabled"])
        ]),
        _.value?.data ? (l(), v("div", bo, [
          P.value.length ? (l(), v("div", vo, [
            C[11] || (C[11] = u("span", { class: "km-probe-tokens-l" }, "Tokens", -1)),
            (l(!0), v(F, null, z(P.value, (L) => (l(), v("span", {
              key: L.label,
              class: "km-probe-tok"
            }, [
              u("b", null, y(L.value), 1),
              x(" " + y(L.label), 1)
            ]))), 128))
          ])) : w("", !0),
          _.value.data.output ? (l(), v("div", fo, [
            C[12] || (C[12] = u("span", null, "Output", -1)),
            u("pre", null, y(_.value.data.output), 1)
          ])) : w("", !0),
          _.value.data.error ? (l(), v("div", mo, [
            C[13] || (C[13] = u("span", null, "Error", -1)),
            u("pre", null, y(_.value.data.error), 1)
          ])) : w("", !0)
        ])) : w("", !0)
      ], 2)) : w("", !0)
    ], 2));
  }
}), ke = 120;
function yo(e) {
  const t = Ye({
    search: "",
    source: "all",
    capability: "all",
    klass: "all",
    profile: "all",
    provider: "all",
    limit: ke
  }), n = $(() => {
    const c = /* @__PURE__ */ new Set();
    for (const r of e.value) for (const p of r.capabilities ?? []) c.add(p);
    return Array.from(c).sort();
  }), a = $(() => {
    const c = /* @__PURE__ */ new Set();
    for (const r of e.value) for (const p of r.class ?? []) c.add(p);
    return Array.from(c).sort();
  }), d = $(() => {
    const c = /* @__PURE__ */ new Set();
    for (const r of e.value) r.provider_id && c.add(r.provider_id);
    return Array.from(c).sort();
  }), i = $(() => {
    const c = t.search.trim().toLowerCase();
    return e.value.filter((r) => t.source !== "all" && r.source !== t.source || t.capability !== "all" && !(r.capabilities ?? []).includes(t.capability) || t.klass !== "all" && !(r.class ?? []).includes(t.klass) || t.profile !== "all" && (r.provider_profile_id || "") !== t.profile || t.provider !== "all" && (r.provider_id || "") !== t.provider ? !1 : c ? [
      r.name,
      r.title,
      r.provider_model,
      r.provider_id,
      r.provider_profile_id,
      ...r.capabilities ?? [],
      ...r.class ?? []
    ].filter(Boolean).some((p) => String(p).toLowerCase().includes(c)) : !0);
  }), s = $(() => i.value.slice(0, t.limit)), m = $(() => s.value.length < i.value.length), h = $(
    () => (t.source !== "all" ? 1 : 0) + (t.capability !== "all" ? 1 : 0) + (t.klass !== "all" ? 1 : 0) + (t.profile !== "all" ? 1 : 0) + (t.provider !== "all" ? 1 : 0) + (t.search.trim() ? 1 : 0)
  );
  function _() {
    t.limit += ke;
  }
  function k() {
    t.search = "", t.source = "all", t.capability = "all", t.klass = "all", t.profile = "all", t.provider = "all", t.limit = ke;
  }
  return {
    state: t,
    capabilityOptions: n,
    classOptions: a,
    providerOptions: d,
    filtered: i,
    visible: s,
    hasMore: m,
    activeCount: h,
    more: _,
    reset: k
  };
}
const go = { class: "km-pool kx-system-pane" }, ko = { class: "km-pool-head kx-system-tools" }, wo = { class: "km-pool-head-top" }, $o = { class: "km-pool-title" }, Co = { class: "km-pool-counts" }, _o = { class: "km-pool-filters" }, So = {
  key: 0,
  class: "km-pool-body kx-system-body"
}, xo = {
  key: 1,
  class: "km-pool-body kx-system-body"
}, To = {
  key: 2,
  class: "km-pool-table kx-system-body"
}, Bo = {
  key: 0,
  class: "km-pool-more"
}, Lo = /* @__PURE__ */ O({
  __name: "ModelPool",
  props: {
    models: {},
    profiles: {},
    adapters: {},
    presets: {},
    selectedProfileId: {},
    probingModel: {},
    probeState: {},
    probeDetailsModel: {},
    busy: { type: Boolean }
  },
  emits: ["edit", "delete", "probe", "toggle-probe-details", "toggle-enabled", "add"],
  setup(e, { emit: t }) {
    const n = e, a = t, d = xe(() => n.adapters, () => n.profiles, () => n.presets), i = yo(on(n, "models")), s = [
      { label: "All sources", value: "all" },
      { label: "Built-in", value: "registry" },
      { label: "Discovered", value: "discovered" },
      { label: "Overlay", value: "overlay" }
    ], m = $(() => [
      { label: "All providers", value: "all" },
      ...i.providerOptions.value.map((c) => ({ label: d.adapterTitle(c), value: c }))
    ]), h = $(() => [
      { label: "All capabilities", value: "all" },
      ...i.capabilityOptions.value.map((c) => ({ label: c, value: c }))
    ]), _ = $(() => [
      { label: "All classes", value: "all" },
      ...i.classOptions.value.map((c) => ({ label: c, value: c }))
    ]), k = $(() => {
      let c = 0, r = 0, p = 0;
      for (const V of n.models)
        V.source === "registry" ? c++ : V.source === "discovered" ? r++ : p++;
      return { registry: c, discovered: r, overlay: p };
    });
    return Be(() => n.selectedProfileId, (c) => {
      i.state.profile = c || "all";
    }, { immediate: !0 }), (c, r) => (l(), v("div", go, [
      u("header", ko, [
        u("div", wo, [
          u("div", $o, [
            r[8] || (r[8] = u("span", null, "Model pool", -1)),
            u("span", Co, [
              b(o(M), { severity: "info" }, {
                default: g(() => [
                  x(y(k.value.registry) + " built-in", 1)
                ]),
                _: 1
              }),
              b(o(M), { severity: "success" }, {
                default: g(() => [
                  x(y(k.value.discovered) + " discovered", 1)
                ]),
                _: 1
              }),
              b(o(M), { severity: "warn" }, {
                default: g(() => [
                  x(y(k.value.overlay) + " overlay", 1)
                ]),
                _: 1
              })
            ])
          ]),
          b(o(Qn), {
            modelValue: o(i).state.search,
            "onUpdate:modelValue": r[0] || (r[0] = (p) => o(i).state.search = p),
            placeholder: "Search models"
          }, null, 8, ["modelValue"])
        ]),
        u("div", _o, [
          b(o(te), {
            modelValue: o(i).state.source,
            "onUpdate:modelValue": r[1] || (r[1] = (p) => o(i).state.source = p),
            options: s,
            "aria-label": "Source"
          }, null, 8, ["modelValue"]),
          b(o(te), {
            modelValue: o(i).state.provider,
            "onUpdate:modelValue": r[2] || (r[2] = (p) => o(i).state.provider = p),
            options: m.value,
            "aria-label": "Provider"
          }, null, 8, ["modelValue", "options"]),
          b(o(te), {
            modelValue: o(i).state.capability,
            "onUpdate:modelValue": r[3] || (r[3] = (p) => o(i).state.capability = p),
            options: h.value,
            "aria-label": "Capability"
          }, null, 8, ["modelValue", "options"]),
          b(o(te), {
            modelValue: o(i).state.klass,
            "onUpdate:modelValue": r[4] || (r[4] = (p) => o(i).state.klass = p),
            options: _.value,
            "aria-label": "Class"
          }, null, 8, ["modelValue", "options"]),
          o(i).activeCount.value ? (l(), S(o(j), {
            key: 0,
            icon: "tabler:filter-off",
            label: "Clear filters",
            variant: "bordered",
            onClick: r[5] || (r[5] = (p) => o(i).reset())
          })) : w("", !0)
        ])
      ]),
      e.models.length ? o(i).filtered.value.length ? (l(), v("div", To, [
        r[9] || (r[9] = u("div", { class: "km-pool-cols" }, [
          u("span"),
          u("span", null, "Model"),
          u("span", null, "Capabilities & classes"),
          u("span", { class: "km-pool-cols-r" }, "Limits"),
          u("span")
        ], -1)),
        (l(!0), v(F, null, z(o(i).visible.value, (p) => (l(), S(ho, {
          key: p.name,
          model: p,
          "provider-icon": o(d).providerIcon(p.provider_id),
          "provider-title": o(d).adapterTitle(p.provider_id),
          "profile-title": o(d).profileTitle(p.provider_profile_id),
          probing: e.probingModel === p.name,
          "probe-state": e.probeState,
          "probe-details-open": e.probeDetailsModel === p.name,
          busy: e.busy,
          onEdit: (V) => a("edit", p),
          onDelete: (V) => a("delete", p),
          onProbe: (V) => a("probe", p),
          onToggleProbeDetails: (V) => a("toggle-probe-details", p),
          onToggleEnabled: (V) => a("toggle-enabled", p)
        }, null, 8, ["model", "provider-icon", "provider-title", "profile-title", "probing", "probe-state", "probe-details-open", "busy", "onEdit", "onDelete", "onProbe", "onToggleProbeDetails", "onToggleEnabled"]))), 128)),
        o(i).hasMore.value ? (l(), v("div", Bo, [
          b(o(ne), {
            variant: "ghost",
            icon: "tabler:chevron-down",
            onClick: r[7] || (r[7] = (p) => o(i).more())
          }, {
            default: g(() => [
              x(" Show more (" + y(o(i).filtered.value.length - o(i).visible.value.length) + ") ", 1)
            ]),
            _: 1
          })
        ])) : w("", !0)
      ])) : (l(), v("div", xo, [
        b(o(Ce), {
          icon: "tabler:search-off",
          title: "No models match",
          hint: "Adjust the search or filters."
        })
      ])) : (l(), v("div", So, [
        b(o(Ce), {
          icon: "tabler:cpu",
          title: "No models yet",
          hint: "Connect a provider and discover its models, or add one manually.",
          cta: "Add provider",
          "cta-icon": "tabler:plus",
          onCta: r[6] || (r[6] = (p) => a("add"))
        })
      ]))
    ]));
  }
}), Po = { class: "km-classes kx-system-pane" }, Vo = {
  key: 0,
  class: "km-pool-body kx-system-body"
}, Eo = {
  key: 1,
  class: "km-pool-table km-classes-list kx-system-body"
}, Oo = { class: "km-class-head" }, Ao = { class: "km-class-head-text" }, Io = { class: "km-class-title" }, Do = {
  key: 0,
  class: "km-class-desc"
}, No = { class: "km-class-meta" }, Fo = { class: "km-class-count" }, Ro = {
  key: 0,
  class: "km-class-members"
}, zo = {
  key: 1,
  class: "km-class-rank"
}, Ko = { class: "km-class-member-name" }, Mo = { class: "km-class-member-pri" }, jo = {
  key: 1,
  class: "km-class-empty"
}, Uo = /* @__PURE__ */ O({
  __name: "ModelClasses",
  props: {
    classes: {}
  },
  setup(e) {
    return (t, n) => (l(), v("div", Po, [
      e.classes.length ? (l(), v("div", Eo, [
        (l(!0), v(F, null, z(e.classes, (a) => (l(), v("article", {
          key: a.name,
          class: "km-class"
        }, [
          u("div", Oo, [
            b(o(Se), {
              icon: a.icon || "tabler:category",
              size: "sm"
            }, null, 8, ["icon"]),
            u("div", Ao, [
              u("div", Io, y(a.title || a.name), 1),
              a.description ? (l(), v("div", Do, y(a.description), 1)) : w("", !0)
            ]),
            u("div", No, [
              u("span", Fo, y(a.models.length) + " model" + y(a.models.length === 1 ? "" : "s"), 1)
            ])
          ]),
          a.models.length ? (l(), v("div", Ro, [
            (l(!0), v(F, null, z(a.models, (d, i) => (l(), v("div", {
              key: d.name,
              class: U(["km-class-member", { top: i === 0 }])
            }, [
              i === 0 ? (l(), S(o(M), {
                key: 0,
                severity: "success",
                icon: "tabler:check"
              }, {
                default: g(() => [...n[0] || (n[0] = [
                  x("active", -1)
                ])]),
                _: 1
              })) : (l(), v("span", zo, y(i + 1), 1)),
              u("span", Ko, y(d.title || d.name), 1),
              u("span", Mo, "priority " + y(d.priority ?? 0), 1)
            ], 2))), 128))
          ])) : (l(), v("div", jo, "No models assigned to this class yet."))
        ]))), 128))
      ])) : (l(), v("div", Vo, [
        b(o(Ce), {
          icon: "tabler:category-2",
          title: "No model classes",
          hint: "Classes group models by purpose. The highest-priority model in each class is selected automatically."
        })
      ]))
    ]));
  }
}), Ho = { class: "km-picker" }, Wo = {
  key: 0,
  class: "km-picker-sec"
}, qo = { class: "km-picker-list" }, Zo = ["onClick"], Jo = { class: "km-picker-ico" }, Go = { class: "km-picker-body" }, Qo = { class: "km-picker-name" }, Xo = { class: "km-picker-desc" }, Yo = {
  key: 1,
  class: "km-picker-sec"
}, ei = { class: "km-picker-list" }, ti = ["onClick"], ni = { class: "km-picker-ico" }, ai = { class: "km-picker-body" }, oi = { class: "km-picker-name" }, ii = { class: "km-picker-desc" }, si = /* @__PURE__ */ O({
  __name: "ProviderPicker",
  props: {
    presets: {}
  },
  emits: ["pick"],
  setup(e, { emit: t }) {
    const n = e, a = t, d = $(() => n.presets.filter((s) => !Oe(s))), i = $(() => n.presets.filter(Oe));
    return (s, m) => (l(), v("div", Ho, [
      d.value.length ? (l(), v("section", Wo, [
        m[0] || (m[0] = u("div", { class: "km-picker-sec-title" }, "Native providers", -1)),
        u("div", qo, [
          (l(!0), v(F, null, z(d.value, (h) => (l(), v("button", {
            key: h.id,
            class: "km-picker-item",
            onClick: (_) => a("pick", h)
          }, [
            u("span", Jo, [
              b(o(A), {
                icon: o(Ae)(h),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            u("span", Go, [
              u("span", Qo, y(h.title), 1),
              u("span", Xo, y(h.description), 1)
            ]),
            b(o(A), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, Zo))), 128))
        ])
      ])) : w("", !0),
      i.value.length ? (l(), v("section", Yo, [
        m[1] || (m[1] = u("div", { class: "km-picker-sec-title" }, "OpenAI-compatible", -1)),
        u("div", ei, [
          (l(!0), v(F, null, z(i.value, (h) => (l(), v("button", {
            key: h.id,
            class: "km-picker-item",
            onClick: (_) => a("pick", h)
          }, [
            u("span", ni, [
              b(o(A), {
                icon: o(Ae)(h),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            u("span", ai, [
              u("span", oi, y(h.title), 1),
              u("span", ii, y(h.config?.base_url || h.description), 1)
            ]),
            b(o(A), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, ti))), 128))
        ])
      ])) : w("", !0)
    ]));
  }
}), ri = { class: "km-form-sec" }, li = { class: "km-form-id" }, di = { class: "km-form-sec" }, ui = { class: "km-form-grid" }, ci = { class: "km-form-sec" }, pi = { class: "km-form-sec" }, bi = { class: "km-form-grid" }, vi = { class: "km-form-grid" }, fi = { class: "km-form-sec" }, mi = {
  key: 0,
  class: "km-adv-body"
}, hi = { class: "km-form-grid" }, yi = ["disabled"], gi = { class: "km-form-foot" }, ki = /* @__PURE__ */ O({
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
    const n = e, a = t, d = N(""), i = N(!1), s = Ye({
      name: "",
      title: "",
      description: "",
      provider_id: "",
      provider_profile_id: "",
      provider_model: "",
      capabilities: [],
      classes: [],
      priority: 10,
      max_tokens: 0,
      output_tokens: 0,
      dimensions: 0,
      reasoning_model_request: !1,
      thinking_effort: "",
      temperature: "",
      options_json: "{}",
      source: "overlay",
      enabled: !0
    });
    Be(() => n.model, (c) => {
      if (d.value = "", i.value = !1, !c) return;
      const r = c.options ?? {};
      s.name = c.name, s.title = c.title || c.name, s.description = c.description || "", s.provider_id = c.provider_id || "", s.provider_profile_id = c.provider_profile_id || "", s.provider_model = c.provider_model || c.name, s.capabilities = [...c.capabilities ?? []], s.classes = [...c.class ?? []], s.priority = Number(c.priority ?? 10), s.max_tokens = Number(c.max_tokens ?? 0), s.output_tokens = Number(c.output_tokens ?? 0), s.dimensions = Number(c.dimensions ?? 0), s.reasoning_model_request = r.reasoning_model_request === !0, s.thinking_effort = typeof r.thinking_effort == "string" || typeof r.thinking_effort == "number" ? r.thinking_effort : "", s.temperature = r.temperature === void 0 ? "" : String(r.temperature), s.options_json = JSON.stringify(r, null, 2), s.source = c.source === "registry" ? "overlay" : c.source || "overlay", s.enabled = c.enabled !== !1;
    }, { immediate: !0 });
    const m = $(() => n.capabilityOptions ?? []), h = $(() => n.classOptions ?? []), _ = $(() => [
      { label: "Registry default", value: "" },
      ...n.profiles.map((c) => ({ label: c.name, value: c.id }))
    ]);
    function k() {
      d.value = "";
      let c = {};
      try {
        c = JSON.parse(s.options_json || "{}");
      } catch {
        d.value = "model options JSON is invalid", i.value = !0;
        return;
      }
      s.reasoning_model_request ? c.reasoning_model_request = !0 : delete c.reasoning_model_request;
      const r = String(s.thinking_effort).trim(), p = Number(r);
      if (r === "" || Number.isFinite(p) && p <= 0 ? delete c.thinking_effort : c.thinking_effort = Number.isFinite(p) ? p : r, s.temperature !== "") {
        const V = Number(s.temperature);
        if (!Number.isFinite(V) || V < 0 || V > 2) {
          d.value = "temperature must be between 0 and 2";
          return;
        }
        c.temperature = V;
      } else
        delete c.temperature;
      a("save", {
        name: s.name,
        title: s.title,
        description: s.description,
        provider_id: s.provider_id,
        provider_profile_id: s.provider_profile_id || void 0,
        provider_model: s.provider_model,
        capabilities: [...s.capabilities],
        classes: [...s.classes],
        priority: Number(s.priority),
        max_tokens: Number(s.max_tokens),
        output_tokens: Number(s.output_tokens),
        dimensions: Number(s.dimensions),
        options: c,
        source: s.source,
        enabled: s.enabled
      });
    }
    return (c, r) => (l(), v("form", {
      class: "km-form",
      onSubmit: Ge(k, ["prevent"])
    }, [
      d.value ? (l(), S(o(He), {
        key: 0,
        severity: "danger",
        onDismiss: r[0] || (r[0] = (p) => d.value = "")
      }, {
        default: g(() => [
          x(y(d.value), 1)
        ]),
        _: 1
      })) : w("", !0),
      u("section", ri, [
        r[20] || (r[20] = u("div", { class: "km-form-sec-title" }, "Identity", -1)),
        b(o(D), { label: "Title" }, {
          default: g(() => [
            b(o(K), {
              modelValue: s.title,
              "onUpdate:modelValue": r[1] || (r[1] = (p) => s.title = p),
              disabled: e.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        b(o(D), { label: "Description" }, {
          default: g(() => [
            b(o(K), {
              modelValue: s.description,
              "onUpdate:modelValue": r[2] || (r[2] = (p) => s.description = p),
              disabled: e.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        u("div", li, y(s.name), 1)
      ]),
      u("section", di, [
        r[21] || (r[21] = u("div", { class: "km-form-sec-title" }, "Routing", -1)),
        u("div", ui, [
          b(o(D), { label: "Provider profile" }, {
            default: g(() => [
              b(o(te), {
                modelValue: s.provider_profile_id,
                "onUpdate:modelValue": r[3] || (r[3] = (p) => s.provider_profile_id = p),
                options: _.value,
                "aria-label": "Provider profile"
              }, null, 8, ["modelValue", "options"])
            ]),
            _: 1
          }),
          b(o(D), { label: "Provider model" }, {
            default: g(() => [
              b(o(K), {
                modelValue: s.provider_model,
                "onUpdate:modelValue": r[4] || (r[4] = (p) => s.provider_model = p),
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      u("section", ci, [
        r[22] || (r[22] = u("div", { class: "km-form-sec-title" }, "Capabilities & classes", -1)),
        b(o(D), { label: "Capabilities" }, {
          default: g(() => [
            b(o(Fe), {
              modelValue: s.capabilities,
              "onUpdate:modelValue": r[5] || (r[5] = (p) => s.capabilities = p),
              suggestions: m.value,
              placeholder: "Add a capability…",
              disabled: e.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        }),
        b(o(D), { label: "Classes" }, {
          default: g(() => [
            b(o(Fe), {
              modelValue: s.classes,
              "onUpdate:modelValue": r[6] || (r[6] = (p) => s.classes = p),
              suggestions: h.value,
              placeholder: "Add a class…",
              disabled: e.saving
            }, null, 8, ["modelValue", "suggestions", "disabled"])
          ]),
          _: 1
        })
      ]),
      u("section", pi, [
        r[23] || (r[23] = u("div", { class: "km-form-sec-title" }, "Request options", -1)),
        b(o(Ie), {
          modelValue: s.reasoning_model_request,
          "onUpdate:modelValue": r[7] || (r[7] = (p) => s.reasoning_model_request = p),
          label: "Reasoning model",
          disabled: e.saving
        }, null, 8, ["modelValue", "disabled"]),
        u("div", bi, [
          b(o(D), { label: "Thinking effort" }, {
            default: g(() => [
              b(o(K), {
                modelValue: s.thinking_effort,
                "onUpdate:modelValue": r[8] || (r[8] = (p) => s.thinking_effort = p),
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          b(o(D), {
            label: "Temperature",
            help: "0–2; blank to leave unset."
          }, {
            default: g(() => [
              b(o(K), {
                modelValue: s.temperature,
                "onUpdate:modelValue": r[9] || (r[9] = (p) => s.temperature = p),
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
        u("div", vi, [
          b(o(D), { label: "Context" }, {
            default: g(() => [
              b(o(K), {
                modelValue: s.max_tokens,
                "onUpdate:modelValue": r[10] || (r[10] = (p) => s.max_tokens = p),
                type: "number",
                min: 0,
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          b(o(D), { label: "Output" }, {
            default: g(() => [
              b(o(K), {
                modelValue: s.output_tokens,
                "onUpdate:modelValue": r[11] || (r[11] = (p) => s.output_tokens = p),
                type: "number",
                min: 0,
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      u("section", fi, [
        u("button", {
          type: "button",
          class: U(["km-adv-toggle", { open: i.value }]),
          onClick: r[12] || (r[12] = (p) => i.value = !i.value)
        }, [
          b(o(A), {
            icon: "tabler:chevron-right",
            class: "km-adv-chev",
            "aria-hidden": "true"
          }),
          r[24] || (r[24] = x(" Advanced ", -1))
        ], 2),
        i.value ? (l(), v("div", mi, [
          u("div", hi, [
            b(o(D), { label: "Provider id" }, {
              default: g(() => [
                b(o(K), {
                  modelValue: s.provider_id,
                  "onUpdate:modelValue": r[13] || (r[13] = (p) => s.provider_id = p),
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            b(o(D), { label: "Source" }, {
              default: g(() => [
                b(o(K), {
                  modelValue: s.source,
                  "onUpdate:modelValue": r[14] || (r[14] = (p) => s.source = p),
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            b(o(D), { label: "Priority" }, {
              default: g(() => [
                b(o(K), {
                  modelValue: s.priority,
                  "onUpdate:modelValue": r[15] || (r[15] = (p) => s.priority = p),
                  type: "number",
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            b(o(D), { label: "Dimensions" }, {
              default: g(() => [
                b(o(K), {
                  modelValue: s.dimensions,
                  "onUpdate:modelValue": r[16] || (r[16] = (p) => s.dimensions = p),
                  type: "number",
                  min: 0,
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            })
          ]),
          b(o(D), {
            label: "Options JSON",
            help: "Raw provider options; merged with the controls above."
          }, {
            default: g(() => [
              Q(u("textarea", {
                "onUpdate:modelValue": r[17] || (r[17] = (p) => s.options_json = p),
                class: "km-input mono km-textarea",
                disabled: e.saving
              }, null, 8, yi), [
                [Qe, s.options_json]
              ])
            ]),
            _: 1
          })
        ])) : w("", !0)
      ]),
      b(o(Ie), {
        modelValue: s.enabled,
        "onUpdate:modelValue": r[18] || (r[18] = (p) => s.enabled = p),
        label: "Enabled",
        disabled: e.saving
      }, null, 8, ["modelValue", "disabled"]),
      u("div", gi, [
        b(o(ne), {
          variant: "ghost",
          disabled: e.saving,
          onClick: r[19] || (r[19] = (p) => a("cancel"))
        }, {
          default: g(() => [...r[25] || (r[25] = [
            x("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        b(o(ne), {
          type: "submit",
          icon: "tabler:device-floppy",
          loading: e.saving
        }, {
          default: g(() => [
            x(y(e.saving ? "Saving" : "Save model"), 1)
          ]),
          _: 1
        }, 8, ["loading"])
      ])
    ], 32));
  }
}), wi = { class: "km" }, $i = { class: "kx-rail-body" }, Ci = "kickside-model-provider-openai-compatible", _i = "wippy.llm.openai_compat:provider", Si = /* @__PURE__ */ O({
  __name: "models",
  setup(e) {
    const t = Wt(), { adapters: n, presets: a, profiles: d, models: i, classes: s, loading: m, saving: h, discovering: _, probing: k, error: c } = t, r = N("models"), p = xe(() => n.value, () => d.value), V = N("all"), P = N("none"), Z = N("create"), I = N(null), C = N(null), L = N(null), H = N({ status: "idle" }), W = N({ status: "idle" }), q = N("");
    function Y(f) {
      const B = /* @__PURE__ */ new Set();
      for (const R of i.value) for (const _t of f(R) ?? []) B.add(_t);
      return Array.from(B).sort();
    }
    const rt = $(() => Y((f) => f.capabilities)), lt = $(() => {
      const f = /* @__PURE__ */ new Set();
      for (const B of s.value) B.name && f.add(B.name);
      for (const B of i.value) for (const R of B.class ?? []) f.add(R);
      return Array.from(f).sort();
    }), dt = $(
      () => C.value?.provider_id || I.value?.provider_id || _i
    ), be = $(() => p.adapterFor(dt.value)), ve = $(
      () => I.value?.profile_editor_tag || be.value?.profile_editor_tag || Ci
    ), ut = $(() => qt(ve.value)), ct = $(() => Zt(ve.value)), pt = $(() => P.value !== "none"), fe = $(() => P.value === "pick" ? { title: "Add provider", icon: "tabler:plug-connected", back: !1 } : P.value === "provider" ? Z.value === "edit" ? { title: C.value?.name || "Edit provider", icon: "tabler:plug-connected", back: !1 } : { title: I.value?.title || "Add provider", icon: "tabler:plug-connected", back: !0 } : P.value === "model" ? { title: L.value?.title || L.value?.name || "Edit model", icon: "tabler:adjustments", back: !1 } : { title: "", icon: "", back: !1 });
    function J() {
      h.value || (P.value = "none", I.value = null, C.value = null, L.value = null, H.value = { status: "idle" });
    }
    function me() {
      Z.value = "create", I.value = null, C.value = null, P.value = "pick";
    }
    function bt(f) {
      I.value = f, P.value = "provider";
    }
    function vt() {
      I.value = null, P.value = "pick";
    }
    function ft(f) {
      Z.value = "edit", I.value = null, C.value = f, H.value = { status: "idle" }, P.value = "provider";
    }
    async function Le() {
      if (!C.value) return;
      H.value = { status: "testing" };
      const f = await t.testProfile(C.value.id);
      H.value = { status: f.ok ? "ok" : "fail", message: f.message };
    }
    function mt(f) {
      L.value = f, P.value = "model";
    }
    async function Pe(f) {
      const B = f?.detail ?? f;
      await t.saveProfile(Z.value, C.value?.id || "", B) && J();
    }
    async function ht(f) {
      await t.saveCard(f) && J();
    }
    function yt(f) {
      return {
        name: f.name,
        title: f.title || f.name,
        description: f.description || "",
        provider_id: f.provider_id,
        provider_profile_id: f.provider_profile_id || void 0,
        provider_model: f.provider_model || f.name,
        capabilities: [...f.capabilities ?? []],
        classes: [...f.class ?? []],
        priority: Number(f.priority ?? 10),
        max_tokens: Number(f.max_tokens ?? 0),
        output_tokens: Number(f.output_tokens ?? 0),
        dimensions: Number(f.dimensions ?? 0),
        pricing: f.pricing ?? {},
        options: f.options ?? {},
        metadata: f.metadata ?? {},
        source: f.source === "registry" ? "overlay" : f.source || "overlay",
        enabled: f.enabled === !1
      };
    }
    async function gt(f) {
      await t.saveCard(yt(f));
    }
    async function kt(f) {
      q.value = "", W.value = { status: "testing", model: f.name, message: `Probing ${f.title || f.name}` };
      const B = await t.testModel(f.name);
      W.value = {
        status: B.ok ? "ok" : "fail",
        model: f.name,
        message: B.message,
        data: B.data
      };
    }
    function wt(f) {
      W.value.model === f.name && (W.value.status !== "ok" && W.value.status !== "fail" || (q.value = q.value === f.name ? "" : f.name));
    }
    async function $t(f) {
      await Ne.confirm({
        header: "Delete provider",
        message: `Remove “${f.name}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await t.deleteProfile(f.id);
    }
    async function Ct(f) {
      if (f.source === "registry") return;
      const B = f.title || f.name;
      await Ne.confirm({
        header: "Delete model",
        message: `Remove “${B}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await t.deleteCard(f.name);
    }
    return Be(r, (f) => {
      f === "classes" && t.loadClasses();
    }), Jt(async () => {
      await Promise.all([t.load(), t.loadClasses()]);
    }), (f, B) => (l(), v("div", wi, [
      b(Rn, {
        value: r.value,
        label: "Model sections",
        items: [
          { value: "models", label: "Models", count: o(i).length },
          { value: "classes", label: "Classes", count: o(s).length }
        ],
        "onUpdate:value": B[0] || (B[0] = (R) => r.value = R)
      }, null, 8, ["value", "items"]),
      o(c) ? (l(), S(o(He), {
        key: 0,
        severity: "danger",
        class: "km-top-notice",
        onDismiss: B[1] || (B[1] = (R) => c.value = "")
      }, {
        default: g(() => [
          x(y(o(c)), 1)
        ]),
        _: 1
      })) : w("", !0),
      o(m) && !o(i).length && !o(d).length ? (l(), S(o(Gt), {
        key: 1,
        label: "Loading models…"
      })) : (l(), S(o(jn), { key: 2 }, {
        rail: g(() => [
          b(o(Zn), {
            title: "Providers",
            count: o(d).length
          }, {
            actions: g(() => [
              b(o(j), {
                icon: "tabler:plus",
                label: "Add provider",
                disabled: o(h),
                onClick: me
              }, null, 8, ["disabled"]),
              b(o(j), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: o(m),
                spin: o(m),
                onClick: o(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          u("div", $i, [
            b(Ga, {
              profiles: o(d),
              adapters: o(n),
              presets: o(a),
              "selected-id": V.value,
              discovering: o(_),
              busy: o(h),
              onSelect: B[2] || (B[2] = (R) => V.value = R),
              onAdd: me,
              onEdit: ft,
              onDiscover: B[3] || (B[3] = (R) => o(t).discover(R.id)),
              onDelete: $t
            }, null, 8, ["profiles", "adapters", "presets", "selected-id", "discovering", "busy"])
          ])
        ]),
        default: g(() => [
          r.value === "models" ? (l(), S(Lo, {
            key: 0,
            "selected-profile-id": V.value,
            models: o(i),
            profiles: o(d),
            adapters: o(n),
            presets: o(a),
            "probing-model": o(k),
            "probe-state": W.value,
            "probe-details-model": q.value,
            busy: o(h),
            onEdit: mt,
            onDelete: Ct,
            onProbe: kt,
            onToggleProbeDetails: wt,
            onToggleEnabled: gt,
            onAdd: me
          }, null, 8, ["selected-profile-id", "models", "profiles", "adapters", "presets", "probing-model", "probe-state", "probe-details-model", "busy"])) : (l(), S(Uo, {
            key: 1,
            classes: o(s)
          }, null, 8, ["classes"]))
        ]),
        _: 1
      })),
      b(o(Na), {
        open: pt.value,
        title: fe.value.title,
        icon: fe.value.icon,
        back: fe.value.back,
        onClose: J,
        onBack: vt
      }, {
        default: g(() => [
          P.value === "pick" ? (l(), S(si, {
            key: 0,
            presets: o(a),
            onPick: bt
          }, null, 8, ["presets"])) : P.value === "provider" && ct.value ? (l(), S(We, {
            key: 1,
            "spec-key": ut.value,
            mode: Z.value,
            adapter: be.value || void 0,
            preset: I.value || void 0,
            profile: C.value,
            saving: o(h),
            "test-state": H.value,
            onSave: Pe,
            onCancel: J,
            onTest: Le
          }, null, 8, ["spec-key", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : P.value === "provider" ? (l(), S(Qt, {
            key: 2,
            tag: ve.value,
            mode: Z.value,
            adapter: be.value || void 0,
            preset: I.value || void 0,
            profile: C.value,
            saving: o(h),
            "test-state": H.value,
            onSave: Pe,
            onCancel: J,
            onTest: Le
          }, null, 8, ["tag", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : P.value === "model" ? (l(), S(ki, {
            key: 3,
            model: L.value,
            profiles: o(d),
            saving: o(h),
            "capability-options": rt.value,
            "class-options": lt.value,
            onSave: ht,
            onCancel: J
          }, null, 8, ["model", "profiles", "saving", "capability-options", "class-options"])) : w("", !0)
        ]),
        _: 1
      }, 8, ["open", "title", "icon", "back"])
    ]));
  }
}), xi = { props: { type: "object", properties: {} } }, Ti = {
  wippy: xi
};
class Bi extends qe {
  static get wippyConfig() {
    return {
      propsSchema: Ti.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ze
    };
  }
  static get vueConfig() {
    return { rootComponent: Si, plugins: [Je] };
  }
}
const Li = {
  type: "object",
  properties: {
    mode: { type: "string" },
    adapter: { type: "object" },
    preset: { type: "object" },
    profile: { type: "object" },
    saving: { type: "boolean" }
  }
};
function Pi(e) {
  return O({
    name: `provider-editor-${e}`,
    setup() {
      const t = Yt(), n = en();
      return () => sn(We, {
        ...t.value,
        specKey: e,
        onSave: (a) => n("save", a),
        onCancel: () => n("cancel", void 0),
        onTest: () => n("test", void 0)
      });
    }
  });
}
function Vi(e) {
  const t = Pi(e);
  return class extends qe {
    static get wippyConfig() {
      return {
        propsSchema: Li,
        hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
        inlineCss: Ze
      };
    }
    static get vueConfig() {
      return { rootComponent: t, plugins: [Je] };
    }
  };
}
rn(import.meta.url, Bi);
for (const [e, t] of Object.entries(Xt))
  customElements.get(e) || customElements.define(e, Vi(t));
//# sourceMappingURL=index.js.map
