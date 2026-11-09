import { B as Y, R as Me, s as re, f as pe, k as _t, b as G, Q as le, z as ce, a as je, c as he, T as St, C as Tt, K as de, v as xt, V as Ve, d as Ue, _ as Q, L as Bt, e as te, g as Lt, U as Pt, I as Ee, h as Vt, i as Et, r as He, j as Ot, l as At, m as It, x as ge, W as Dt, p as Nt, n as Se, o as Ft, q as Rt, t as zt, u as Te, w as Kt, y as Mt, A as jt, D as Ut, E as ue, F as ne, G as Oe, H as Ae, J as We, M as I, N as z, O as Ie, P as Ht, S as Wt, X as qt, Y as Zt, Z as Jt, $ as qe, a0 as Gt, a1 as Qt, a2 as Ze, a3 as Je, a4 as Ge, a5 as Xt, a6 as Yt } from "./styles-whfc2RAV.js";
import { mergeProps as B, resolveDirective as xe, withDirectives as X, openBlock as d, createBlock as S, resolveDynamicComponent as ae, withCtx as y, renderSlot as E, normalizeClass as U, createElementBlock as f, createElementVNode as u, createCommentVNode as w, defineComponent as O, createTextVNode as T, toDisplayString as g, getCurrentInstance as en, computed as $, unref as o, createVNode as b, ref as N, Fragment as F, renderList as j, withModifiers as Qe, vModelText as Xe, resolveComponent as De, Transition as tn, normalizeStyle as nn, createSlots as an, reactive as Ye, toRef as on, watch as Be, h as sn } from "vue";
import { host as Ne, define as rn } from "@wippy-fe/proxy";
import { Icon as D } from "@iconify/vue";
var ln = {
  root: function(t) {
    var n = t.instance, a = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": a.disabled
    }];
  }
}, dn = Y.extend({
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
}, we = {
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
      return _t((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
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
      return pe({
        active: this.active
      });
    }
  },
  directives: {
    ripple: Me
  }
};
function cn(e, t, n, a, l, i) {
  var s = xe("ripple");
  return e.asChild ? E(e.$slots, "default", {
    key: 1,
    dataP: i.dataP,
    class: U(e.cx("root")),
    active: i.active,
    a11yAttrs: i.a11yAttrs,
    onClick: i.onClick
  }) : X((d(), S(ae(e.as), B({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP,
    onClick: i.onClick
  }, i.attrs), {
    default: y(function() {
      return [E(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[s]]);
}
we.render = cn;
var et = {
  name: "ChevronLeftIcon",
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
function hn(e, t, n, a, l, i) {
  return d(), f("svg", B({
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
et.render = hn;
var tt = {
  name: "ChevronRightIcon",
  extends: je
};
function gn(e) {
  return $n(e) || wn(e) || kn(e) || yn();
}
function yn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function kn(e, t) {
  if (e) {
    if (typeof e == "string") return Ce(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ce(e, t) : void 0;
  }
}
function wn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $n(e) {
  if (Array.isArray(e)) return Ce(e);
}
function Ce(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function Cn(e, t, n, a, l, i) {
  return d(), f("svg", B({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), gn(t[0] || (t[0] = [u("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
tt.render = Cn;
var _n = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, Sn = Y.extend({
  name: "tablist",
  classes: _n
}), Tn = {
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
}, nt = {
  name: "TabList",
  extends: Tn,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), a = he(t) - n, l = Math.abs(t.scrollLeft), i = a * 0.8, s = l - i, m = Math.max(s, 0);
      t.scrollLeft = Ve(t) ? -1 * m : m;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), a = he(t) - n, l = Math.abs(t.scrollLeft), i = a * 0.8, s = l + i, m = t.scrollWidth - a, h = Math.min(s, m);
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
      var t = this.$refs, n = t.content, a = t.inkbar, l = t.tabs;
      if (a) {
        var i = ce(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (a.style.height = Tt(i) + "px", a.style.top = de(i).top - de(l).top + "px") : (a.style.width = xt(i) + "px", a.style.left = de(i).left - de(l).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, a = t.content, l = a.scrollTop, i = a.scrollWidth, s = a.scrollHeight, m = a.offsetWidth, h = a.offsetHeight, _ = Math.abs(a.scrollLeft), k = [he(a), St(a)], c = k[0], r = k[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = l !== 0, this.isNextButtonEnabled = n.offsetHeight >= h && parseInt(l) !== s - r) : (this.isPrevButtonEnabled = _ !== 0, this.isNextButtonEnabled = n.offsetWidth >= m && parseInt(_) !== i - c);
    },
    getVisibleButtonWidths: function() {
      var t = this.$refs, n = t.prevButton, a = t.nextButton, l = 0;
      return this.showNavigators && (l = (n?.offsetWidth || 0) + (a?.offsetWidth || 0)), l;
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
    ChevronLeftIcon: et,
    ChevronRightIcon: tt
  },
  directives: {
    ripple: Me
  }
}, xn = ["data-p"], Bn = ["aria-label", "tabindex"], Ln = ["data-p"], Pn = ["aria-orientation"], Vn = ["aria-label", "tabindex"];
function En(e, t, n, a, l, i) {
  var s = xe("ripple");
  return d(), f("div", B({
    ref: "list",
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [i.showNavigators && l.isPrevButtonEnabled ? X((d(), f("button", B({
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
  }), [(d(), S(ae(i.templates.previcon || "ChevronLeftIcon"), B({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, Bn)), [[s]]) : w("", !0), u("div", B({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    }),
    "data-p": i.dataP
  }, e.ptm("content")), [u("div", B({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": i.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [E(e.$slots, "default"), u("span", B({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Pn)], 16, Ln), i.showNavigators && l.isNextButtonEnabled ? X((d(), f("button", B({
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
  }), [(d(), S(ae(i.templates.nexticon || "ChevronRightIcon"), B({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Vn)), [[s]]) : w("", !0)], 16, xn);
}
nt.render = En;
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
}, In = Y.extend({
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
}, at = {
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
function Nn(e, t, n, a, l, i) {
  return d(), f("div", B({
    class: e.cx("root")
  }, e.ptmi("root")), [E(e.$slots, "default")], 16);
}
at.render = Nn;
const Fn = { class: "km-shell" }, Rn = { class: "km-rail" }, zn = { class: "km-main" }, Kn = /* @__PURE__ */ O({
  __name: "Shell",
  setup(e) {
    return (t, n) => (d(), f("div", Fn, [
      u("aside", Rn, [
        E(t.$slots, "rail")
      ]),
      u("main", zn, [
        E(t.$slots, "default")
      ])
    ]));
  }
}), Mn = { class: "km-railhead" }, jn = { class: "km-railhead-title" }, Un = { key: 0 }, Hn = { class: "km-railhead-acts" }, Wn = /* @__PURE__ */ O({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (d(), f("div", Mn, [
      u("span", jn, [
        T(g(e.title), 1),
        e.count !== void 0 ? (d(), f("b", Un, g(e.count), 1)) : w("", !0)
      ]),
      u("div", Hn, [
        E(t.$slots, "actions")
      ])
    ]));
  }
}), M = /* @__PURE__ */ O({
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
    const n = e, a = t, l = en(), i = $(
      () => Object.prototype.hasOwnProperty.call(l?.vnode.props ?? {}, "active")
    ), s = $(() => {
      if (n.severity) return n.severity;
      if (n.variant === "danger") return "danger";
      if (n.variant === "bordered") return "secondary";
    }), m = $(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (h, _) => (d(), S(o(Ue), {
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
      icon: y(() => [
        b(o(D), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), qn = { class: "km-search" }, Zn = ["value", "placeholder"], Jn = /* @__PURE__ */ O({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (a, l) => (d(), f("div", qn, [
      b(o(D), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      u("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: l[0] || (l[0] = (i) => n("update:modelValue", i.target.value))
      }, null, 40, Zn),
      e.modelValue ? (d(), f("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: l[1] || (l[1] = (i) => n("update:modelValue", ""))
      }, [
        b(o(D), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : w("", !0)
    ]));
  }
}), Gn = { class: "km-taginput-wrap" }, Qn = { class: "km-tag-label" }, Xn = ["title", "aria-label", "disabled", "onClick"], Yn = ["placeholder", "disabled"], ea = {
  key: 0,
  class: "km-tag-sug"
}, ta = ["disabled", "onClick"], Fe = /* @__PURE__ */ O({
  __name: "TagInput",
  props: {
    modelValue: {},
    suggestions: { default: () => [] },
    placeholder: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, a = t, l = N(""), i = N(null), s = $(() => {
      const k = l.value.trim().toLowerCase();
      return n.suggestions.filter((c) => !n.modelValue.includes(c)).filter((c) => !k || c.toLowerCase().includes(k));
    });
    function m(k) {
      const c = k.trim();
      if (!c || n.modelValue.includes(c)) {
        l.value = "";
        return;
      }
      a("update:modelValue", [...n.modelValue, c]), l.value = "", i.value?.focus();
    }
    function h(k) {
      a("update:modelValue", n.modelValue.filter((c) => c !== k));
    }
    function _(k) {
      k.key === "Enter" || k.key === "," ? (k.preventDefault(), m(l.value || s.value[0] || "")) : k.key === "Backspace" && !l.value && n.modelValue.length && h(n.modelValue[n.modelValue.length - 1]);
    }
    return (k, c) => (d(), f("div", Gn, [
      u("div", {
        class: U(["km-taginput", { disabled: e.disabled }]),
        onClick: c[1] || (c[1] = (r) => i.value?.focus())
      }, [
        (d(!0), f(F, null, j(e.modelValue, (r) => (d(), f("span", {
          key: r,
          class: "km-tag"
        }, [
          u("span", Qn, g(r), 1),
          u("button", {
            type: "button",
            class: "km-tag-x",
            title: `Remove ${r}`,
            "aria-label": `Remove ${r}`,
            disabled: e.disabled,
            onClick: Qe((p) => h(r), ["stop"])
          }, [
            b(o(D), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ], 8, Xn)
        ]))), 128)),
        X(u("input", {
          ref_key: "inputEl",
          ref: i,
          "onUpdate:modelValue": c[0] || (c[0] = (r) => l.value = r),
          class: "km-tag-field",
          type: "text",
          placeholder: e.modelValue.length ? "" : e.placeholder || "Add…",
          disabled: e.disabled,
          spellcheck: "false",
          autocomplete: "off",
          onKeydown: _
        }, null, 40, Yn), [
          [Xe, l.value]
        ])
      ], 2),
      s.value.length ? (d(), f("div", ea, [
        (d(!0), f(F, null, j(s.value, (r) => (d(), f("button", {
          key: r,
          type: "button",
          class: "km-tag-sug-item",
          disabled: e.disabled,
          onClick: (p) => m(r)
        }, [
          b(o(D), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          }),
          T(" " + g(r), 1)
        ], 8, ta))), 128))
      ])) : w("", !0)
    ]));
  }
});
var na = `
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
`, aa = {
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
}, oa = Y.extend({
  name: "tag",
  style: na,
  classes: aa
}), ia = {
  name: "BaseTag",
  extends: re,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: oa,
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
function sa(e, t, n) {
  return (t = ra(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ra(e) {
  var t = la(e, "string");
  return oe(t) == "symbol" ? t : t + "";
}
function la(e, t) {
  if (oe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (oe(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ot = {
  name: "Tag",
  extends: ia,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return pe(sa({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, da = ["data-p"];
function ua(e, t, n, a, l, i) {
  return d(), f("span", B({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (d(), S(ae(e.$slots.icon), B({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (d(), f("span", B({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : w("", !0), e.value != null || e.$slots.default ? E(e.$slots, "default", {
    key: 2
  }, function() {
    return [u("span", B({
      class: e.cx("label")
    }, e.ptm("label")), g(e.value), 17)];
  }) : w("", !0)], 16, da);
}
ot.render = ua;
const ca = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, K = /* @__PURE__ */ O({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (d(), S(o(ot), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: y(() => [
        e.dot ? (d(), f("span", ca)) : e.icon ? (d(), S(o(D), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : w("", !0),
        E(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), pa = { class: "km-empty" }, ba = { class: "km-empty-title" }, fa = {
  key: 0,
  class: "km-empty-hint"
}, _e = /* @__PURE__ */ O({
  __name: "EmptyState",
  props: {
    icon: {},
    title: {},
    hint: {},
    cta: {},
    ctaIcon: {}
  },
  emits: ["cta"],
  setup(e, { emit: t }) {
    const n = t;
    return (a, l) => (d(), f("div", pa, [
      b(o(D), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      u("div", ba, g(e.title), 1),
      e.hint ? (d(), f("p", fa, g(e.hint), 1)) : w("", !0),
      e.cta ? (d(), S(Q, {
        key: 1,
        icon: e.ctaIcon,
        onClick: l[0] || (l[0] = (i) => n("cta"))
      }, {
        default: y(() => [
          T(g(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : w("", !0)
    ]));
  }
});
var va = Y.extend({
  name: "focustrap-directive"
}), ma = Lt.extend({
  style: va
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
    t && (a = a.filter(function(l) {
      return Object.getOwnPropertyDescriptor(e, l).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function ze(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Re(Object(n), !0).forEach(function(a) {
      ha(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Re(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function ha(e, t, n) {
  return (t = ga(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ga(e) {
  var t = ya(e, "string");
  return ie(t) == "symbol" ? t : t + "";
}
function ya(e, t) {
  if (ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (ie(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ka = ma.extend("focustrap", {
  mounted: function(t, n) {
    var a = n.value || {}, l = a.disabled;
    l || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var a = n.value || {}, l = a.disabled;
    l && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var a = this, l = n.value || {}, i = l.onFocusIn, s = l.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(m) {
        m.forEach(function(h) {
          if (h.type === "childList" && !t.contains(document.activeElement)) {
            var _ = function(c) {
              var r = Ee(c) ? Ee(c, a.getComputedSelector(t.$_pfocustrap_focusableselector)) ? c : te(t, a.getComputedSelector(t.$_pfocustrap_focusableselector)) : te(c);
              return Vt(r) ? r : c.nextSibling && _(c.nextSibling);
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
      var a = n.value || {}, l = a.autoFocusSelector, i = l === void 0 ? "" : l, s = a.firstFocusableSelector, m = s === void 0 ? "" : s, h = a.autoFocus, _ = h === void 0 ? !1 : h, k = te(t, "[autofocus]".concat(this.getComputedSelector(i)));
      _ && !k && (k = te(t, this.getComputedSelector(m))), G(k);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, l = t.relatedTarget, i = l === a.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(l)) ? te(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_lasthiddenfocusableelement;
      G(i);
    },
    onLastHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, l = t.relatedTarget, i = l === a.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(l)) ? Bt(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_firsthiddenfocusableelement;
      G(i);
    },
    createHiddenFocusableElements: function(t, n) {
      var a = this, l = n.value || {}, i = l.tabIndex, s = i === void 0 ? 0 : i, m = l.firstFocusableSelector, h = m === void 0 ? "" : m, _ = l.lastFocusableSelector, k = _ === void 0 ? "" : _, c = function(P) {
        return Pt("span", {
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
function wa() {
  Ot({
    variableName: He("scrollbar.width").name
  });
}
function $a() {
  Et({
    variableName: He("scrollbar.width").name
  });
}
var Ca = `
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
`, _a = {
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
}, Sa = {
  mask: function(t) {
    var n = t.instance, a = t.props, l = ["left", "right", "top", "bottom"], i = l.find(function(s) {
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
}, Ta = Y.extend({
  name: "drawer",
  style: Ca,
  classes: Sa,
  inlineStyles: _a
}), xa = {
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
  style: Ta,
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
function ye(e, t, n) {
  return (t = Ba(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ba(e) {
  var t = La(e, "string");
  return se(t) == "symbol" ? t : t + "";
}
function La(e, t) {
  if (se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (se(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var it = {
  name: "Drawer",
  extends: xa,
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
    this.disableDocumentSettings(), this.mask && this.autoZIndex && ge.clear(this.mask), this.container = null, this.mask = null;
  },
  methods: {
    hide: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.focus(), this.bindDocumentKeyDownListener(), this.autoZIndex && ge.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.enableDocumentSettings(), this.$emit("after-show");
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Dt(this.mask, "p-overlay-mask-leave-active"), this.$emit("before-hide");
    },
    onLeave: function() {
      this.$emit("hide");
    },
    onAfterLeave: function() {
      this.autoZIndex && ge.clear(this.mask), this.unbindDocumentKeyDownListener(), this.containerVisible = !1, this.disableDocumentSettings(), this.$emit("after-hide");
    },
    onMaskClick: function(t) {
      this.dismissable && this.modal && this.mask === t.target && this.hide();
    },
    focus: function() {
      var t = function(l) {
        return l && l.querySelector("[autofocus]");
      }, n = this.$slots.header && t(this.headerContainer);
      n || (n = this.$slots.default && t(this.container), n || (n = this.$slots.footer && t(this.footerContainer), n || (n = this.closeButton))), n && G(n);
    },
    enableDocumentSettings: function() {
      this.dismissable && !this.modal && this.bindOutsideClickListener(), this.blockScroll && wa();
    },
    disableDocumentSettings: function() {
      this.unbindOutsideClickListener(), this.blockScroll && $a();
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
      return pe(ye(ye(ye({
        "full-screen": this.position === "full"
      }, this.position, this.position), "open", this.containerVisible), "modal", this.modal));
    }
  },
  directives: {
    focustrap: ka
  },
  components: {
    Button: Ue,
    Portal: It,
    TimesIcon: At
  }
}, Pa = ["data-p"], Va = ["role", "aria-modal", "data-p"];
function Ea(e, t, n, a, l, i) {
  var s = De("Button"), m = De("Portal"), h = xe("focustrap");
  return d(), S(m, null, {
    default: y(function() {
      return [l.containerVisible ? (d(), f("div", B({
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
      }, e.ptm("mask")), [b(tn, B({
        name: "p-drawer",
        onEnter: i.onEnter,
        onAfterEnter: i.onAfterEnter,
        onBeforeLeave: i.onBeforeLeave,
        onLeave: i.onLeave,
        onAfterLeave: i.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: y(function() {
          return [e.visible ? X((d(), f("div", B({
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
          }) : (d(), f(F, {
            key: 1
          }, [u("div", B({
            ref: i.headerContainerRef,
            class: e.cx("header")
          }, e.ptm("header")), [E(e.$slots, "header", {
            class: U(e.cx("title"))
          }, function() {
            return [e.header ? (d(), f("div", B({
              key: 0,
              class: e.cx("title")
            }, e.ptm("title")), g(e.header), 17)) : w("", !0)];
          }), e.showCloseIcon ? E(e.$slots, "closebutton", {
            key: 0,
            closeCallback: i.hide
          }, function() {
            return [b(s, B({
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
              icon: y(function(_) {
                return [E(e.$slots, "closeicon", {}, function() {
                  return [(d(), S(ae(e.closeIcon ? "span" : "TimesIcon"), B({
                    class: [e.closeIcon, _.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onClick", "pt"])];
          }) : w("", !0)], 16), u("div", B({
            ref: i.contentRef,
            class: e.cx("content")
          }, e.ptm("content")), [E(e.$slots, "default")], 16), e.$slots.footer ? (d(), f("div", B({
            key: 0,
            ref: i.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [E(e.$slots, "footer")], 16)) : w("", !0)], 64))], 16, Va)), [[h]]) : w("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Pa)) : w("", !0)];
    }),
    _: 3
  });
}
it.render = Ea;
const Oa = { class: "km-drawer-title" }, Aa = /* @__PURE__ */ O({
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
    const n = e, a = t, l = $(() => n.wide ? "min(720px, calc(100vw - 36px))" : "min(560px, calc(100vw - 36px))");
    function i(s) {
      s || a("close");
    }
    return (s, m) => (d(), S(o(it), {
      visible: e.open,
      position: "right",
      modal: !0,
      pt: { content: { class: "km-drawer-content" } },
      dismissable: !0,
      "close-on-escape": !0,
      style: nn({ width: l.value }),
      "aria-label": e.title,
      "onUpdate:visible": i
    }, an({
      header: y(() => [
        e.back ? (d(), S(M, {
          key: 0,
          icon: "tabler:chevron-left",
          label: "Back",
          onClick: m[0] || (m[0] = (h) => a("back"))
        })) : w("", !0),
        u("span", Oa, [
          e.icon ? (d(), S(o(D), {
            key: 0,
            icon: e.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : w("", !0),
          T(g(e.title), 1)
        ])
      ]),
      default: y(() => [
        E(s.$slots, "default")
      ]),
      _: 2
    }, [
      s.$slots.footer ? {
        name: "footer",
        fn: y(() => [
          E(s.$slots, "footer")
        ]),
        key: "0"
      } : void 0
    ]), 1032, ["visible", "style", "aria-label"]));
  }
});
function Ia(e) {
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
function Da(e) {
  const t = Ia(e);
  return t === null ? "" : new Date(t).toLocaleString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
const Na = ["title"], Fa = { class: "km-prow-text" }, Ra = { class: "km-prow-name" }, za = ["title"], Ka = { class: "km-prow-sub" }, Ma = { class: "km-prow-acts" }, ja = {
  key: 0,
  class: "km-prow-msg"
}, Ua = /* @__PURE__ */ O({
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
    const n = e, a = t, l = $(() => {
      if (!n.discoverable) return "Automatic model discovery is not available for this provider";
      const i = Da(n.profile.last_discovered_at);
      return i ? `Discover models (last ${i})` : "Discover models";
    });
    return (i, s) => (d(), f("div", {
      class: U(["km-prow", { on: e.selected }])
    }, [
      u("button", {
        class: "km-prow-main",
        title: o(Nt)(e.profile),
        onClick: s[0] || (s[0] = (m) => a("select"))
      }, [
        b(o(Se), {
          icon: e.providerIcon,
          size: "sm"
        }, null, 8, ["icon"]),
        u("span", Fa, [
          u("span", Ra, [
            u("span", null, g(e.profile.name), 1),
            o(Ft)(e.profile) ? (d(), S(o(D), {
              key: 0,
              icon: "tabler:key",
              class: "km-prow-cred",
              title: "Credentials stored",
              "aria-hidden": "true"
            })) : w("", !0),
            u("span", {
              class: U(["km-prow-dot", o(zt)(e.profile.status)]),
              title: o(Rt)(e.profile.status),
              "aria-hidden": "true"
            }, null, 10, za)
          ]),
          u("span", Ka, g(e.adapterTitle), 1)
        ]),
        e.profile.enabled ? w("", !0) : (d(), S(o(K), {
          key: 0,
          severity: "warn"
        }, {
          default: y(() => [...s[4] || (s[4] = [
            T("off", -1)
          ])]),
          _: 1
        }))
      ], 8, Na),
      u("div", Ma, [
        b(o(M), {
          icon: "tabler:radar-2",
          label: l.value,
          size: "sm",
          disabled: !e.discoverable || e.discovering || e.busy,
          spin: e.discovering,
          onClick: s[1] || (s[1] = (m) => a("discover"))
        }, null, 8, ["label", "disabled", "spin"]),
        b(o(M), {
          icon: "tabler:edit",
          label: "Edit provider",
          size: "sm",
          disabled: e.busy,
          onClick: s[2] || (s[2] = (m) => a("edit"))
        }, null, 8, ["disabled"]),
        b(o(M), {
          icon: "tabler:trash",
          label: "Delete provider",
          size: "sm",
          variant: "danger",
          disabled: e.busy,
          onClick: s[3] || (s[3] = (m) => a("delete"))
        }, null, 8, ["disabled"])
      ]),
      e.profile.message ? (d(), f("div", ja, g(e.profile.message), 1)) : w("", !0)
    ], 2));
  }
}), Ha = { class: "km-plist" }, Wa = {
  key: 0,
  class: "km-plist-empty"
}, qa = /* @__PURE__ */ O({
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
    const n = e, a = t, l = Te(() => n.adapters, () => n.profiles, () => n.presets);
    return (i, s) => (d(), f("div", Ha, [
      u("button", {
        class: U(["km-plist-all", { on: e.selectedId === "all" }]),
        onClick: s[0] || (s[0] = (m) => a("select", "all"))
      }, " All providers ", 2),
      e.profiles.length ? w("", !0) : (d(), f("div", Wa, [
        s[3] || (s[3] = u("p", null, "No providers connected.", -1)),
        b(o(Q), {
          small: "",
          icon: "tabler:plus",
          onClick: s[1] || (s[1] = (m) => a("add"))
        }, {
          default: y(() => [...s[2] || (s[2] = [
            T("Add provider", -1)
          ])]),
          _: 1
        })
      ])),
      (d(!0), f(F, null, j(e.profiles, (m) => (d(), S(Ua, {
        key: m.id,
        profile: m,
        "provider-icon": o(l).providerIcon(m.provider_id),
        "adapter-title": o(l).adapterTitle(m.provider_id),
        selected: e.selectedId === m.id,
        discoverable: o(l).isDiscoverable(m),
        discovering: e.discovering === m.id,
        busy: e.busy,
        onSelect: (h) => a("select", m.id),
        onEdit: (h) => a("edit", m),
        onDiscover: (h) => a("discover", m),
        onDelete: (h) => a("delete", m)
      }, null, 8, ["profile", "provider-icon", "adapter-title", "selected", "discoverable", "discovering", "busy", "onSelect", "onEdit", "onDiscover", "onDelete"]))), 128))
    ]));
  }
}), Za = { class: "km-mrow-id" }, Ja = { class: "km-mrow-title" }, Ga = { class: "km-mrow-title-text" }, Qa = { class: "km-mrow-sub" }, Xa = { class: "km-mrow-prov" }, Ya = { class: "km-mrow-mono" }, eo = { class: "km-mrow-tags" }, to = {
  key: 0,
  class: "km-tag-group km-tag-classes"
}, no = { class: "km-tag-group km-tag-caps" }, ao = { class: "km-mrow-limits" }, oo = {
  class: "km-mrow-limit-chips",
  "aria-label": "Token limits"
}, io = { class: "km-mrow-acts" }, so = { class: "km-mrow-probe-head" }, ro = { class: "km-mrow-probe-msg" }, lo = {
  key: 0,
  class: "km-probe-time"
}, uo = {
  key: 0,
  class: "km-mrow-probe-body"
}, co = {
  key: 0,
  class: "km-probe-tokens"
}, po = {
  key: 1,
  class: "km-probe-out"
}, bo = {
  key: 2,
  class: "km-probe-out"
}, Ke = 5, fo = /* @__PURE__ */ O({
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
    const n = e, a = t, l = $(() => n.model.capabilities ?? []), i = $(() => l.value.slice(0, Ke)), s = $(() => Math.max(0, l.value.length - Ke)), m = $(() => l.value.includes("reasoning") || l.value.includes("extended_thinking") || Kt(n.model, "reasoning_model_request") === "true"), h = $(() => n.model.enabled !== !1 && (l.value.includes("generate") || l.value.includes("tool_use"))), _ = $(() => n.probeState?.model === n.model.name ? n.probeState : null), k = $(() => _.value?.status || "idle"), c = $(() => k.value === "ok" || k.value === "fail"), r = $(() => k.value === "ok" ? "tabler:circle-check" : k.value === "fail" ? "tabler:circle-x" : "tabler:activity-heartbeat"), p = $(() => {
      if (k.value === "ok") return "success";
      if (k.value === "fail") return "danger";
    }), V = $(() => n.probing ? `Checking ${n.model.title || n.model.name}` : k.value === "ok" ? "Model check succeeded. View details" : k.value === "fail" ? "Model check failed. View details" : "Run model check"), P = $(() => {
      const A = _.value?.data?.tokens;
      if (!A) return [];
      const C = ["prompt_tokens", "completion_tokens", "total_tokens", "thinking_tokens"], L = /* @__PURE__ */ new Set(), H = [], W = (q) => {
        const ee = A[q];
        typeof ee == "number" && ee > 0 && !L.has(q) && (L.add(q), H.push({ label: q.replace(/_tokens$/, "").replace(/_input$/, "").replace(/_/g, " "), value: ee }));
      };
      return C.forEach(W), Object.keys(A).forEach(W), H;
    });
    function Z() {
      c.value ? a("toggle-probe-details") : a("probe");
    }
    return (A, C) => (d(), f("div", {
      class: U(["km-mrow", { "km-mrow-off": e.model.enabled === !1 }])
    }, [
      b(o(Se), { icon: e.providerIcon }, null, 8, ["icon"]),
      u("div", Za, [
        u("div", Ja, [
          u("span", Ga, g(e.model.title || e.model.name), 1),
          b(o(K), {
            severity: o(Mt)(e.model.source)
          }, {
            default: y(() => [
              T(g(o(jt)(e.model.source)), 1)
            ]),
            _: 1
          }, 8, ["severity"]),
          e.model.enabled === !1 ? (d(), S(o(K), {
            key: 0,
            severity: "secondary",
            icon: "tabler:ban"
          }, {
            default: y(() => [...C[4] || (C[4] = [
              T("disabled", -1)
            ])]),
            _: 1
          })) : w("", !0)
        ]),
        u("div", Qa, [
          u("span", Xa, g(e.providerTitle || "—"), 1),
          e.model.provider_profile_id ? (d(), f(F, { key: 0 }, [
            T(" · " + g(e.profileTitle), 1)
          ], 64)) : w("", !0),
          u("span", Ya, " · " + g(e.model.name), 1)
        ])
      ]),
      u("div", eo, [
        (e.model.class || []).length ? (d(), f("span", to, [
          (d(!0), f(F, null, j(e.model.class || [], (L) => (d(), S(o(K), {
            key: `k-${L}`,
            severity: "",
            icon: "tabler:category-2"
          }, {
            default: y(() => [
              T(g(L), 1)
            ]),
            _: 2
          }, 1024))), 128))
        ])) : w("", !0),
        u("span", no, [
          m.value ? (d(), S(o(K), {
            key: 0,
            severity: "info",
            icon: "tabler:bulb"
          }, {
            default: y(() => [...C[5] || (C[5] = [
              T("reasoning", -1)
            ])]),
            _: 1
          })) : w("", !0),
          (d(!0), f(F, null, j(i.value, (L) => (d(), S(o(K), {
            key: `c-${L}`,
            severity: "secondary",
            icon: o(Ut)(L) || void 0
          }, {
            default: y(() => [
              T(g(L), 1)
            ]),
            _: 2
          }, 1032, ["icon"]))), 128)),
          s.value ? (d(), S(o(K), {
            key: 1,
            severity: "secondary"
          }, {
            default: y(() => [
              T("+" + g(s.value), 1)
            ]),
            _: 1
          })) : w("", !0)
        ])
      ]),
      u("div", ao, [
        u("span", null, [
          u("b", null, g(o(ue)(e.model.max_tokens)), 1),
          C[6] || (C[6] = T(" ctx", -1))
        ]),
        u("span", null, [
          u("b", null, g(o(ue)(e.model.output_tokens)), 1),
          C[7] || (C[7] = T(" out", -1))
        ])
      ]),
      u("div", oo, [
        u("span", null, [
          u("b", null, g(o(ue)(e.model.max_tokens)), 1),
          C[8] || (C[8] = T(" ctx", -1))
        ]),
        u("span", null, [
          u("b", null, g(o(ue)(e.model.output_tokens)), 1),
          C[9] || (C[9] = T(" out", -1))
        ])
      ]),
      u("div", io, [
        h.value ? (d(), S(o(M), {
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
        b(o(M), {
          icon: e.model.enabled === !1 ? "tabler:circle-check" : "tabler:circle-minus",
          label: e.model.enabled === !1 ? "Enable model" : "Disable model",
          size: "sm",
          variant: "bordered",
          disabled: e.busy,
          onClick: C[0] || (C[0] = (L) => a("toggle-enabled"))
        }, null, 8, ["icon", "label", "disabled"]),
        b(o(M), {
          icon: "tabler:adjustments",
          label: "Edit model",
          size: "sm",
          variant: "bordered",
          onClick: C[1] || (C[1] = (L) => a("edit"))
        }),
        e.model.source !== "registry" ? (d(), S(o(M), {
          key: 1,
          icon: "tabler:trash",
          label: "Delete model",
          size: "sm",
          variant: "bordered",
          severity: "danger",
          onClick: C[2] || (C[2] = (L) => a("delete"))
        })) : w("", !0)
      ]),
      e.probeDetailsOpen && c.value ? (d(), f("div", {
        key: 0,
        class: U(["km-mrow-probe", k.value])
      }, [
        u("div", so, [
          b(o(D), {
            icon: k.value === "ok" ? "tabler:circle-check" : "tabler:circle-x",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          u("span", ro, g(k.value === "ok" ? "Model works" : "Model check failed"), 1),
          _.value?.data && _.value.data.elapsed_ms != null ? (d(), f("span", lo, g(_.value.data.elapsed_ms) + " ms", 1)) : w("", !0),
          b(o(Q), {
            icon: "tabler:activity-heartbeat",
            variant: "ghost",
            small: "",
            disabled: e.probing || e.busy,
            onClick: C[3] || (C[3] = (L) => a("probe"))
          }, {
            default: y(() => [...C[10] || (C[10] = [
              T(" Run again ", -1)
            ])]),
            _: 1
          }, 8, ["disabled"])
        ]),
        _.value?.data ? (d(), f("div", uo, [
          P.value.length ? (d(), f("div", co, [
            C[11] || (C[11] = u("span", { class: "km-probe-tokens-l" }, "Tokens", -1)),
            (d(!0), f(F, null, j(P.value, (L) => (d(), f("span", {
              key: L.label,
              class: "km-probe-tok"
            }, [
              u("b", null, g(L.value), 1),
              T(" " + g(L.label), 1)
            ]))), 128))
          ])) : w("", !0),
          _.value.data.output ? (d(), f("div", po, [
            C[12] || (C[12] = u("span", null, "Output", -1)),
            u("pre", null, g(_.value.data.output), 1)
          ])) : w("", !0),
          _.value.data.error ? (d(), f("div", bo, [
            C[13] || (C[13] = u("span", null, "Error", -1)),
            u("pre", null, g(_.value.data.error), 1)
          ])) : w("", !0)
        ])) : w("", !0)
      ], 2)) : w("", !0)
    ], 2));
  }
}), ke = 120;
function vo(e) {
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
  }), l = $(() => {
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
    providerOptions: l,
    filtered: i,
    visible: s,
    hasMore: m,
    activeCount: h,
    more: _,
    reset: k
  };
}
const mo = { class: "km-pool" }, ho = { class: "km-pool-head" }, go = { class: "km-pool-head-top" }, yo = { class: "km-pool-title" }, ko = { class: "km-pool-counts" }, wo = { class: "km-pool-filters" }, $o = {
  key: 0,
  class: "km-pool-body"
}, Co = {
  key: 1,
  class: "km-pool-body"
}, _o = {
  key: 2,
  class: "km-pool-table"
}, So = {
  key: 0,
  class: "km-pool-more"
}, To = /* @__PURE__ */ O({
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
    const n = e, a = t, l = Te(() => n.adapters, () => n.profiles, () => n.presets), i = vo(on(n, "models")), s = [
      { label: "All sources", value: "all" },
      { label: "Built-in", value: "registry" },
      { label: "Discovered", value: "discovered" },
      { label: "Overlay", value: "overlay" }
    ], m = $(() => [
      { label: "All providers", value: "all" },
      ...i.providerOptions.value.map((c) => ({ label: l.adapterTitle(c), value: c }))
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
    }, { immediate: !0 }), (c, r) => (d(), f("div", mo, [
      u("header", ho, [
        u("div", go, [
          u("div", yo, [
            r[8] || (r[8] = u("span", null, "Model pool", -1)),
            u("span", ko, [
              b(o(K), { severity: "info" }, {
                default: y(() => [
                  T(g(k.value.registry) + " built-in", 1)
                ]),
                _: 1
              }),
              b(o(K), { severity: "success" }, {
                default: y(() => [
                  T(g(k.value.discovered) + " discovered", 1)
                ]),
                _: 1
              }),
              b(o(K), { severity: "warn" }, {
                default: y(() => [
                  T(g(k.value.overlay) + " overlay", 1)
                ]),
                _: 1
              })
            ])
          ]),
          b(o(Jn), {
            modelValue: o(i).state.search,
            "onUpdate:modelValue": r[0] || (r[0] = (p) => o(i).state.search = p),
            placeholder: "Search models"
          }, null, 8, ["modelValue"])
        ]),
        u("div", wo, [
          b(o(ne), {
            modelValue: o(i).state.source,
            "onUpdate:modelValue": r[1] || (r[1] = (p) => o(i).state.source = p),
            options: s,
            "aria-label": "Source"
          }, null, 8, ["modelValue"]),
          b(o(ne), {
            modelValue: o(i).state.provider,
            "onUpdate:modelValue": r[2] || (r[2] = (p) => o(i).state.provider = p),
            options: m.value,
            "aria-label": "Provider"
          }, null, 8, ["modelValue", "options"]),
          b(o(ne), {
            modelValue: o(i).state.capability,
            "onUpdate:modelValue": r[3] || (r[3] = (p) => o(i).state.capability = p),
            options: h.value,
            "aria-label": "Capability"
          }, null, 8, ["modelValue", "options"]),
          b(o(ne), {
            modelValue: o(i).state.klass,
            "onUpdate:modelValue": r[4] || (r[4] = (p) => o(i).state.klass = p),
            options: _.value,
            "aria-label": "Class"
          }, null, 8, ["modelValue", "options"]),
          o(i).activeCount.value ? (d(), S(o(M), {
            key: 0,
            icon: "tabler:filter-off",
            label: "Clear filters",
            variant: "bordered",
            onClick: r[5] || (r[5] = (p) => o(i).reset())
          })) : w("", !0)
        ])
      ]),
      e.models.length ? o(i).filtered.value.length ? (d(), f("div", _o, [
        r[9] || (r[9] = u("div", { class: "km-pool-cols" }, [
          u("span"),
          u("span", null, "Model"),
          u("span", null, "Capabilities & classes"),
          u("span", { class: "km-pool-cols-r" }, "Limits"),
          u("span")
        ], -1)),
        (d(!0), f(F, null, j(o(i).visible.value, (p) => (d(), S(fo, {
          key: p.name,
          model: p,
          "provider-icon": o(l).providerIcon(p.provider_id),
          "provider-title": o(l).adapterTitle(p.provider_id),
          "profile-title": o(l).profileTitle(p.provider_profile_id),
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
        o(i).hasMore.value ? (d(), f("div", So, [
          b(o(Q), {
            variant: "ghost",
            icon: "tabler:chevron-down",
            onClick: r[7] || (r[7] = (p) => o(i).more())
          }, {
            default: y(() => [
              T(" Show more (" + g(o(i).filtered.value.length - o(i).visible.value.length) + ") ", 1)
            ]),
            _: 1
          })
        ])) : w("", !0)
      ])) : (d(), f("div", Co, [
        b(o(_e), {
          icon: "tabler:search-off",
          title: "No models match",
          hint: "Adjust the search or filters."
        })
      ])) : (d(), f("div", $o, [
        b(o(_e), {
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
}), xo = { class: "km-classes" }, Bo = {
  key: 0,
  class: "km-pool-body"
}, Lo = {
  key: 1,
  class: "km-pool-table km-classes-list"
}, Po = { class: "km-class-head" }, Vo = { class: "km-class-head-text" }, Eo = { class: "km-class-title" }, Oo = {
  key: 0,
  class: "km-class-desc"
}, Ao = { class: "km-class-meta" }, Io = { class: "km-class-count" }, Do = {
  key: 0,
  class: "km-class-members"
}, No = {
  key: 1,
  class: "km-class-rank"
}, Fo = { class: "km-class-member-name" }, Ro = { class: "km-class-member-pri" }, zo = {
  key: 1,
  class: "km-class-empty"
}, Ko = /* @__PURE__ */ O({
  __name: "ModelClasses",
  props: {
    classes: {}
  },
  setup(e) {
    return (t, n) => (d(), f("div", xo, [
      e.classes.length ? (d(), f("div", Lo, [
        (d(!0), f(F, null, j(e.classes, (a) => (d(), f("article", {
          key: a.name,
          class: "km-class"
        }, [
          u("div", Po, [
            b(o(Se), {
              icon: a.icon || "tabler:category",
              size: "sm"
            }, null, 8, ["icon"]),
            u("div", Vo, [
              u("div", Eo, g(a.title || a.name), 1),
              a.description ? (d(), f("div", Oo, g(a.description), 1)) : w("", !0)
            ]),
            u("div", Ao, [
              u("span", Io, g(a.models.length) + " model" + g(a.models.length === 1 ? "" : "s"), 1)
            ])
          ]),
          a.models.length ? (d(), f("div", Do, [
            (d(!0), f(F, null, j(a.models, (l, i) => (d(), f("div", {
              key: l.name,
              class: U(["km-class-member", { top: i === 0 }])
            }, [
              i === 0 ? (d(), S(o(K), {
                key: 0,
                severity: "success",
                icon: "tabler:check"
              }, {
                default: y(() => [...n[0] || (n[0] = [
                  T("active", -1)
                ])]),
                _: 1
              })) : (d(), f("span", No, g(i + 1), 1)),
              u("span", Fo, g(l.title || l.name), 1),
              u("span", Ro, "priority " + g(l.priority ?? 0), 1)
            ], 2))), 128))
          ])) : (d(), f("div", zo, "No models assigned to this class yet."))
        ]))), 128))
      ])) : (d(), f("div", Bo, [
        b(o(_e), {
          icon: "tabler:category-2",
          title: "No model classes",
          hint: "Classes group models by purpose. The highest-priority model in each class is selected automatically."
        })
      ]))
    ]));
  }
}), Mo = { class: "km-picker" }, jo = {
  key: 0,
  class: "km-picker-sec"
}, Uo = { class: "km-picker-list" }, Ho = ["onClick"], Wo = { class: "km-picker-ico" }, qo = { class: "km-picker-body" }, Zo = { class: "km-picker-name" }, Jo = { class: "km-picker-desc" }, Go = {
  key: 1,
  class: "km-picker-sec"
}, Qo = { class: "km-picker-list" }, Xo = ["onClick"], Yo = { class: "km-picker-ico" }, ei = { class: "km-picker-body" }, ti = { class: "km-picker-name" }, ni = { class: "km-picker-desc" }, ai = /* @__PURE__ */ O({
  __name: "ProviderPicker",
  props: {
    presets: {}
  },
  emits: ["pick"],
  setup(e, { emit: t }) {
    const n = e, a = t, l = $(() => n.presets.filter((s) => !Oe(s))), i = $(() => n.presets.filter(Oe));
    return (s, m) => (d(), f("div", Mo, [
      l.value.length ? (d(), f("section", jo, [
        m[0] || (m[0] = u("div", { class: "km-picker-sec-title" }, "Native providers", -1)),
        u("div", Uo, [
          (d(!0), f(F, null, j(l.value, (h) => (d(), f("button", {
            key: h.id,
            class: "km-picker-item",
            onClick: (_) => a("pick", h)
          }, [
            u("span", Wo, [
              b(o(D), {
                icon: o(Ae)(h),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            u("span", qo, [
              u("span", Zo, g(h.title), 1),
              u("span", Jo, g(h.description), 1)
            ]),
            b(o(D), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, Ho))), 128))
        ])
      ])) : w("", !0),
      i.value.length ? (d(), f("section", Go, [
        m[1] || (m[1] = u("div", { class: "km-picker-sec-title" }, "OpenAI-compatible", -1)),
        u("div", Qo, [
          (d(!0), f(F, null, j(i.value, (h) => (d(), f("button", {
            key: h.id,
            class: "km-picker-item",
            onClick: (_) => a("pick", h)
          }, [
            u("span", Yo, [
              b(o(D), {
                icon: o(Ae)(h),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            u("span", ei, [
              u("span", ti, g(h.title), 1),
              u("span", ni, g(h.config?.base_url || h.description), 1)
            ]),
            b(o(D), {
              icon: "tabler:chevron-right",
              class: "km-picker-go",
              "aria-hidden": "true"
            })
          ], 8, Xo))), 128))
        ])
      ])) : w("", !0)
    ]));
  }
}), oi = { class: "km-form-sec" }, ii = { class: "km-form-id" }, si = { class: "km-form-sec" }, ri = { class: "km-form-grid" }, li = { class: "km-form-sec" }, di = { class: "km-form-sec" }, ui = { class: "km-form-grid" }, ci = { class: "km-form-grid" }, pi = { class: "km-form-sec" }, bi = {
  key: 0,
  class: "km-adv-body"
}, fi = { class: "km-form-grid" }, vi = ["disabled"], mi = { class: "km-form-foot" }, hi = /* @__PURE__ */ O({
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
    const n = e, a = t, l = N(""), i = N(!1), s = Ye({
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
      if (l.value = "", i.value = !1, !c) return;
      const r = c.options ?? {};
      s.name = c.name, s.title = c.title || c.name, s.description = c.description || "", s.provider_id = c.provider_id || "", s.provider_profile_id = c.provider_profile_id || "", s.provider_model = c.provider_model || c.name, s.capabilities = [...c.capabilities ?? []], s.classes = [...c.class ?? []], s.priority = Number(c.priority ?? 10), s.max_tokens = Number(c.max_tokens ?? 0), s.output_tokens = Number(c.output_tokens ?? 0), s.dimensions = Number(c.dimensions ?? 0), s.reasoning_model_request = r.reasoning_model_request === !0, s.thinking_effort = typeof r.thinking_effort == "string" || typeof r.thinking_effort == "number" ? r.thinking_effort : "", s.temperature = r.temperature === void 0 ? "" : String(r.temperature), s.options_json = JSON.stringify(r, null, 2), s.source = c.source === "registry" ? "overlay" : c.source || "overlay", s.enabled = c.enabled !== !1;
    }, { immediate: !0 });
    const m = $(() => n.capabilityOptions ?? []), h = $(() => n.classOptions ?? []), _ = $(() => [
      { label: "Registry default", value: "" },
      ...n.profiles.map((c) => ({ label: c.name, value: c.id }))
    ]);
    function k() {
      l.value = "";
      let c = {};
      try {
        c = JSON.parse(s.options_json || "{}");
      } catch {
        l.value = "model options JSON is invalid", i.value = !0;
        return;
      }
      s.reasoning_model_request ? c.reasoning_model_request = !0 : delete c.reasoning_model_request;
      const r = String(s.thinking_effort).trim(), p = Number(r);
      if (r === "" || Number.isFinite(p) && p <= 0 ? delete c.thinking_effort : c.thinking_effort = Number.isFinite(p) ? p : r, s.temperature !== "") {
        const V = Number(s.temperature);
        if (!Number.isFinite(V) || V < 0 || V > 2) {
          l.value = "temperature must be between 0 and 2";
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
    return (c, r) => (d(), f("form", {
      class: "km-form",
      onSubmit: Qe(k, ["prevent"])
    }, [
      l.value ? (d(), S(o(We), {
        key: 0,
        severity: "danger",
        onDismiss: r[0] || (r[0] = (p) => l.value = "")
      }, {
        default: y(() => [
          T(g(l.value), 1)
        ]),
        _: 1
      })) : w("", !0),
      u("section", oi, [
        r[20] || (r[20] = u("div", { class: "km-form-sec-title" }, "Identity", -1)),
        b(o(I), { label: "Title" }, {
          default: y(() => [
            b(o(z), {
              modelValue: s.title,
              "onUpdate:modelValue": r[1] || (r[1] = (p) => s.title = p),
              disabled: e.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        b(o(I), { label: "Description" }, {
          default: y(() => [
            b(o(z), {
              modelValue: s.description,
              "onUpdate:modelValue": r[2] || (r[2] = (p) => s.description = p),
              disabled: e.saving
            }, null, 8, ["modelValue", "disabled"])
          ]),
          _: 1
        }),
        u("div", ii, g(s.name), 1)
      ]),
      u("section", si, [
        r[21] || (r[21] = u("div", { class: "km-form-sec-title" }, "Routing", -1)),
        u("div", ri, [
          b(o(I), { label: "Provider profile" }, {
            default: y(() => [
              b(o(ne), {
                modelValue: s.provider_profile_id,
                "onUpdate:modelValue": r[3] || (r[3] = (p) => s.provider_profile_id = p),
                options: _.value,
                "aria-label": "Provider profile"
              }, null, 8, ["modelValue", "options"])
            ]),
            _: 1
          }),
          b(o(I), { label: "Provider model" }, {
            default: y(() => [
              b(o(z), {
                modelValue: s.provider_model,
                "onUpdate:modelValue": r[4] || (r[4] = (p) => s.provider_model = p),
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      u("section", li, [
        r[22] || (r[22] = u("div", { class: "km-form-sec-title" }, "Capabilities & classes", -1)),
        b(o(I), { label: "Capabilities" }, {
          default: y(() => [
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
        b(o(I), { label: "Classes" }, {
          default: y(() => [
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
      u("section", di, [
        r[23] || (r[23] = u("div", { class: "km-form-sec-title" }, "Request options", -1)),
        b(o(Ie), {
          modelValue: s.reasoning_model_request,
          "onUpdate:modelValue": r[7] || (r[7] = (p) => s.reasoning_model_request = p),
          label: "Reasoning model",
          disabled: e.saving
        }, null, 8, ["modelValue", "disabled"]),
        u("div", ui, [
          b(o(I), { label: "Thinking effort" }, {
            default: y(() => [
              b(o(z), {
                modelValue: s.thinking_effort,
                "onUpdate:modelValue": r[8] || (r[8] = (p) => s.thinking_effort = p),
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          b(o(I), {
            label: "Temperature",
            help: "0–2; blank to leave unset."
          }, {
            default: y(() => [
              b(o(z), {
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
        u("div", ci, [
          b(o(I), { label: "Context" }, {
            default: y(() => [
              b(o(z), {
                modelValue: s.max_tokens,
                "onUpdate:modelValue": r[10] || (r[10] = (p) => s.max_tokens = p),
                type: "number",
                min: 0,
                disabled: e.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          b(o(I), { label: "Output" }, {
            default: y(() => [
              b(o(z), {
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
      u("section", pi, [
        u("button", {
          type: "button",
          class: U(["km-adv-toggle", { open: i.value }]),
          onClick: r[12] || (r[12] = (p) => i.value = !i.value)
        }, [
          b(o(D), {
            icon: "tabler:chevron-right",
            class: "km-adv-chev",
            "aria-hidden": "true"
          }),
          r[24] || (r[24] = T(" Advanced ", -1))
        ], 2),
        i.value ? (d(), f("div", bi, [
          u("div", fi, [
            b(o(I), { label: "Provider id" }, {
              default: y(() => [
                b(o(z), {
                  modelValue: s.provider_id,
                  "onUpdate:modelValue": r[13] || (r[13] = (p) => s.provider_id = p),
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            b(o(I), { label: "Source" }, {
              default: y(() => [
                b(o(z), {
                  modelValue: s.source,
                  "onUpdate:modelValue": r[14] || (r[14] = (p) => s.source = p),
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            b(o(I), { label: "Priority" }, {
              default: y(() => [
                b(o(z), {
                  modelValue: s.priority,
                  "onUpdate:modelValue": r[15] || (r[15] = (p) => s.priority = p),
                  type: "number",
                  disabled: e.saving
                }, null, 8, ["modelValue", "disabled"])
              ]),
              _: 1
            }),
            b(o(I), { label: "Dimensions" }, {
              default: y(() => [
                b(o(z), {
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
          b(o(I), {
            label: "Options JSON",
            help: "Raw provider options; merged with the controls above."
          }, {
            default: y(() => [
              X(u("textarea", {
                "onUpdate:modelValue": r[17] || (r[17] = (p) => s.options_json = p),
                class: "km-input mono km-textarea",
                disabled: e.saving
              }, null, 8, vi), [
                [Xe, s.options_json]
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
      u("div", mi, [
        b(o(Q), {
          variant: "ghost",
          disabled: e.saving,
          onClick: r[19] || (r[19] = (p) => a("cancel"))
        }, {
          default: y(() => [...r[25] || (r[25] = [
            T("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        b(o(Q), {
          type: "submit",
          icon: "tabler:device-floppy",
          loading: e.saving
        }, {
          default: y(() => [
            T(g(e.saving ? "Saving" : "Save model"), 1)
          ]),
          _: 1
        }, 8, ["loading"])
      ])
    ], 32));
  }
}), gi = { class: "km" }, yi = { class: "km-rail-body" }, ki = "kickside-model-provider-openai-compatible", wi = "wippy.llm.openai_compat:provider", $i = /* @__PURE__ */ O({
  __name: "models",
  setup(e) {
    const t = Ht(), { adapters: n, presets: a, profiles: l, models: i, classes: s, loading: m, saving: h, discovering: _, probing: k, error: c } = t, r = N("models"), p = Te(() => n.value, () => l.value), V = N("all"), P = N("none"), Z = N("create"), A = N(null), C = N(null), L = N(null), H = N({ status: "idle" }), W = N({ status: "idle" }), q = N("");
    function ee(v) {
      const x = /* @__PURE__ */ new Set();
      for (const R of i.value) for (const Ct of v(R) ?? []) x.add(Ct);
      return Array.from(x).sort();
    }
    const st = $(() => ee((v) => v.capabilities)), rt = $(() => {
      const v = /* @__PURE__ */ new Set();
      for (const x of s.value) x.name && v.add(x.name);
      for (const x of i.value) for (const R of x.class ?? []) v.add(R);
      return Array.from(v).sort();
    }), lt = $(
      () => C.value?.provider_id || A.value?.provider_id || wi
    ), be = $(() => p.adapterFor(lt.value)), fe = $(
      () => A.value?.profile_editor_tag || be.value?.profile_editor_tag || ki
    ), dt = $(() => Wt(fe.value)), ut = $(() => qt(fe.value)), ct = $(() => P.value !== "none"), ve = $(() => P.value === "pick" ? { title: "Add provider", icon: "tabler:plug-connected", back: !1 } : P.value === "provider" ? Z.value === "edit" ? { title: C.value?.name || "Edit provider", icon: "tabler:plug-connected", back: !1 } : { title: A.value?.title || "Add provider", icon: "tabler:plug-connected", back: !0 } : P.value === "model" ? { title: L.value?.title || L.value?.name || "Edit model", icon: "tabler:adjustments", back: !1 } : { title: "", icon: "", back: !1 });
    function J() {
      h.value || (P.value = "none", A.value = null, C.value = null, L.value = null, H.value = { status: "idle" });
    }
    function me() {
      Z.value = "create", A.value = null, C.value = null, P.value = "pick";
    }
    function pt(v) {
      A.value = v, P.value = "provider";
    }
    function bt() {
      A.value = null, P.value = "pick";
    }
    function ft(v) {
      Z.value = "edit", A.value = null, C.value = v, H.value = { status: "idle" }, P.value = "provider";
    }
    async function Le() {
      if (!C.value) return;
      H.value = { status: "testing" };
      const v = await t.testProfile(C.value.id);
      H.value = { status: v.ok ? "ok" : "fail", message: v.message };
    }
    function vt(v) {
      L.value = v, P.value = "model";
    }
    async function Pe(v) {
      const x = v?.detail ?? v;
      await t.saveProfile(Z.value, C.value?.id || "", x) && J();
    }
    async function mt(v) {
      await t.saveCard(v) && J();
    }
    function ht(v) {
      return {
        name: v.name,
        title: v.title || v.name,
        description: v.description || "",
        provider_id: v.provider_id,
        provider_profile_id: v.provider_profile_id || void 0,
        provider_model: v.provider_model || v.name,
        capabilities: [...v.capabilities ?? []],
        classes: [...v.class ?? []],
        priority: Number(v.priority ?? 10),
        max_tokens: Number(v.max_tokens ?? 0),
        output_tokens: Number(v.output_tokens ?? 0),
        dimensions: Number(v.dimensions ?? 0),
        pricing: v.pricing ?? {},
        options: v.options ?? {},
        metadata: v.metadata ?? {},
        source: v.source === "registry" ? "overlay" : v.source || "overlay",
        enabled: v.enabled === !1
      };
    }
    async function gt(v) {
      await t.saveCard(ht(v));
    }
    async function yt(v) {
      q.value = "", W.value = { status: "testing", model: v.name, message: `Probing ${v.title || v.name}` };
      const x = await t.testModel(v.name);
      W.value = {
        status: x.ok ? "ok" : "fail",
        model: v.name,
        message: x.message,
        data: x.data
      };
    }
    function kt(v) {
      W.value.model === v.name && (W.value.status !== "ok" && W.value.status !== "fail" || (q.value = q.value === v.name ? "" : v.name));
    }
    async function wt(v) {
      await Ne.confirm({
        header: "Delete provider",
        message: `Remove “${v.name}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await t.deleteProfile(v.id);
    }
    async function $t(v) {
      if (v.source === "registry") return;
      const x = v.title || v.name;
      await Ne.confirm({
        header: "Delete model",
        message: `Remove “${x}”? This cannot be undone.`,
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await t.deleteCard(v.name);
    }
    return Be(r, (v) => {
      v === "classes" && t.loadClasses();
    }), Zt(async () => {
      await Promise.all([t.load(), t.loadClasses()]);
    }), (v, x) => (d(), f("div", gi, [
      o(c) ? (d(), S(o(We), {
        key: 0,
        severity: "danger",
        class: "km-top-notice",
        onDismiss: x[0] || (x[0] = (R) => c.value = "")
      }, {
        default: y(() => [
          T(g(o(c)), 1)
        ]),
        _: 1
      })) : w("", !0),
      o(m) && !o(i).length && !o(l).length ? (d(), S(o(Jt), {
        key: 1,
        label: "Loading models…"
      })) : (d(), S(o(Kn), { key: 2 }, {
        rail: y(() => [
          b(o(Wn), {
            title: "Providers",
            count: o(l).length
          }, {
            actions: y(() => [
              b(o(M), {
                icon: "tabler:plus",
                label: "Add provider",
                disabled: o(h),
                onClick: me
              }, null, 8, ["disabled"]),
              b(o(M), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: o(m),
                spin: o(m),
                onClick: o(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          u("div", yi, [
            b(qa, {
              profiles: o(l),
              adapters: o(n),
              presets: o(a),
              "selected-id": V.value,
              discovering: o(_),
              busy: o(h),
              onSelect: x[1] || (x[1] = (R) => V.value = R),
              onAdd: me,
              onEdit: ft,
              onDiscover: x[2] || (x[2] = (R) => o(t).discover(R.id)),
              onDelete: wt
            }, null, 8, ["profiles", "adapters", "presets", "selected-id", "discovering", "busy"])
          ])
        ]),
        default: y(() => [
          b(o(at), {
            class: "km-tabs",
            "data-kx-separator": "surface",
            value: r.value,
            "onUpdate:value": x[3] || (x[3] = (R) => r.value = String(R))
          }, {
            default: y(() => [
              b(o(nt), { "aria-label": "Model sections" }, {
                default: y(() => [
                  b(o(we), { value: "models" }, {
                    default: y(() => [
                      x[4] || (x[4] = T("Models", -1)),
                      u("b", null, g(o(i).length), 1)
                    ]),
                    _: 1
                  }),
                  b(o(we), { value: "classes" }, {
                    default: y(() => [
                      x[5] || (x[5] = T("Classes", -1)),
                      u("b", null, g(o(s).length), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["value"]),
          r.value === "models" ? (d(), S(To, {
            key: 0,
            "selected-profile-id": V.value,
            models: o(i),
            profiles: o(l),
            adapters: o(n),
            presets: o(a),
            "probing-model": o(k),
            "probe-state": W.value,
            "probe-details-model": q.value,
            busy: o(h),
            onEdit: vt,
            onDelete: $t,
            onProbe: yt,
            onToggleProbeDetails: kt,
            onToggleEnabled: gt,
            onAdd: me
          }, null, 8, ["selected-profile-id", "models", "profiles", "adapters", "presets", "probing-model", "probe-state", "probe-details-model", "busy"])) : (d(), S(Ko, {
            key: 1,
            classes: o(s)
          }, null, 8, ["classes"]))
        ]),
        _: 1
      })),
      b(o(Aa), {
        open: ct.value,
        title: ve.value.title,
        icon: ve.value.icon,
        back: ve.value.back,
        onClose: J,
        onBack: bt
      }, {
        default: y(() => [
          P.value === "pick" ? (d(), S(ai, {
            key: 0,
            presets: o(a),
            onPick: pt
          }, null, 8, ["presets"])) : P.value === "provider" && ut.value ? (d(), S(qe, {
            key: 1,
            "spec-key": dt.value,
            mode: Z.value,
            adapter: be.value || void 0,
            preset: A.value || void 0,
            profile: C.value,
            saving: o(h),
            "test-state": H.value,
            onSave: Pe,
            onCancel: J,
            onTest: Le
          }, null, 8, ["spec-key", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : P.value === "provider" ? (d(), S(Gt, {
            key: 2,
            tag: fe.value,
            mode: Z.value,
            adapter: be.value || void 0,
            preset: A.value || void 0,
            profile: C.value,
            saving: o(h),
            "test-state": H.value,
            onSave: Pe,
            onCancel: J,
            onTest: Le
          }, null, 8, ["tag", "mode", "adapter", "preset", "profile", "saving", "test-state"])) : P.value === "model" ? (d(), S(hi, {
            key: 3,
            model: L.value,
            profiles: o(l),
            saving: o(h),
            "capability-options": st.value,
            "class-options": rt.value,
            onSave: mt,
            onCancel: J
          }, null, 8, ["model", "profiles", "saving", "capability-options", "class-options"])) : w("", !0)
        ]),
        _: 1
      }, 8, ["open", "title", "icon", "back"])
    ]));
  }
}), Ci = { props: { type: "object", properties: {} } }, _i = {
  wippy: Ci
};
class Si extends Ze {
  static get wippyConfig() {
    return {
      propsSchema: _i.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Je
    };
  }
  static get vueConfig() {
    return { rootComponent: $i, plugins: [Ge] };
  }
}
const Ti = {
  type: "object",
  properties: {
    mode: { type: "string" },
    adapter: { type: "object" },
    preset: { type: "object" },
    profile: { type: "object" },
    saving: { type: "boolean" }
  }
};
function xi(e) {
  return O({
    name: `provider-editor-${e}`,
    setup() {
      const t = Xt(), n = Yt();
      return () => sn(qe, {
        ...t.value,
        specKey: e,
        onSave: (a) => n("save", a),
        onCancel: () => n("cancel", void 0),
        onTest: () => n("test", void 0)
      });
    }
  });
}
function Bi(e) {
  const t = xi(e);
  return class extends Ze {
    static get wippyConfig() {
      return {
        propsSchema: Ti,
        hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
        inlineCss: Je
      };
    }
    static get vueConfig() {
      return { rootComponent: t, plugins: [Ge] };
    }
  };
}
rn(import.meta.url, Si);
for (const [e, t] of Object.entries(Qt))
  customElements.get(e) || customElements.define(e, Bi(t));
//# sourceMappingURL=index.js.map
