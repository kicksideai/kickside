import { B as G, R as Gt, s as tt, f as et, k as un, b as Vn, Q as Pt, z as It, a as Nt, c as Ot, T as On, C as Rn, K as Tt, v as En, V as en, d as cn, e as Et, u as jn, P as Dn } from "./wc-runtime-DZjbiMMb.js";
import { mergeProps as $, resolveDirective as qt, withDirectives as bt, openBlock as a, createBlock as k, resolveDynamicComponent as ut, withCtx as S, renderSlot as V, normalizeClass as X, createElementBlock as u, createElementVNode as l, createCommentVNode as m, defineComponent as K, unref as i, createVNode as y, Fragment as J, renderList as Q, createTextVNode as A, toDisplayString as w, resolveComponent as on, getCurrentInstance as Kn, computed as N, createSlots as Un, ref as _, onMounted as Mn, watch as jt, onBeforeUnmount as Wn, nextTick as pn, useId as Hn, withModifiers as mt, shallowRef as an, onUnmounted as Gn, vShow as rn } from "vue";
import { Icon as j } from "@iconify/vue";
import { loadByTagName as qn, api as at, host as bn } from "@wippy-fe/proxy";
var Zn = {
  root: function(n) {
    var e = n.instance, o = n.props;
    return ["p-tab", {
      "p-tab-active": e.active,
      "p-disabled": o.disabled
    }];
  }
}, Jn = G.extend({
  name: "tab",
  classes: Zn
}), Qn = {
  name: "BaseTab",
  extends: tt,
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
  style: Jn,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, vn = {
  name: "Tab",
  extends: Qn,
  inheritAttrs: !1,
  inject: ["$pcTabs", "$pcTabList"],
  methods: {
    onFocus: function() {
      this.$pcTabs.selectOnFocus && this.changeActiveValue();
    },
    onClick: function() {
      this.changeActiveValue();
    },
    onKeydown: function(n) {
      switch (n.code) {
        case "ArrowRight":
          this.onArrowRightKey(n);
          break;
        case "ArrowLeft":
          this.onArrowLeftKey(n);
          break;
        case "Home":
          this.onHomeKey(n);
          break;
        case "End":
          this.onEndKey(n);
          break;
        case "PageDown":
          this.onPageDownKey(n);
          break;
        case "PageUp":
          this.onPageUpKey(n);
          break;
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.onEnterKey(n);
          break;
      }
    },
    onArrowRightKey: function(n) {
      var e = this.findNextTab(n.currentTarget);
      e ? this.changeFocusedTab(n, e) : this.onHomeKey(n), n.preventDefault();
    },
    onArrowLeftKey: function(n) {
      var e = this.findPrevTab(n.currentTarget);
      e ? this.changeFocusedTab(n, e) : this.onEndKey(n), n.preventDefault();
    },
    onHomeKey: function(n) {
      var e = this.findFirstTab();
      this.changeFocusedTab(n, e), n.preventDefault();
    },
    onEndKey: function(n) {
      var e = this.findLastTab();
      this.changeFocusedTab(n, e), n.preventDefault();
    },
    onPageDownKey: function(n) {
      this.scrollInView(this.findLastTab()), n.preventDefault();
    },
    onPageUpKey: function(n) {
      this.scrollInView(this.findFirstTab()), n.preventDefault();
    },
    onEnterKey: function(n) {
      this.changeActiveValue();
    },
    findNextTab: function(n) {
      var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, o = e ? n : n.nextElementSibling;
      return o ? Pt(o, "data-p-disabled") || Pt(o, "data-pc-section") === "activebar" ? this.findNextTab(o) : It(o, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(n) {
      var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, o = e ? n : n.previousElementSibling;
      return o ? Pt(o, "data-p-disabled") || Pt(o, "data-pc-section") === "activebar" ? this.findPrevTab(o) : It(o, '[data-pc-name="tab"]') : null;
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
    changeFocusedTab: function(n, e) {
      Vn(e), this.scrollInView(e);
    },
    scrollInView: function(n) {
      var e;
      n == null || (e = n.scrollIntoView) === null || e === void 0 || e.call(n, {
        block: "nearest"
      });
    }
  },
  computed: {
    active: function() {
      var n;
      return un((n = this.$pcTabs) === null || n === void 0 ? void 0 : n.d_value, this.value);
    },
    id: function() {
      var n;
      return "".concat((n = this.$pcTabs) === null || n === void 0 ? void 0 : n.$id, "_tab_").concat(this.value);
    },
    ariaControls: function() {
      var n;
      return "".concat((n = this.$pcTabs) === null || n === void 0 ? void 0 : n.$id, "_tabpanel_").concat(this.value);
    },
    attrs: function() {
      return $(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return et({
        active: this.active
      });
    }
  },
  directives: {
    ripple: Gt
  }
};
function Yn(t, n, e, o, b, r) {
  var h = qt("ripple");
  return t.asChild ? V(t.$slots, "default", {
    key: 1,
    dataP: r.dataP,
    class: X(t.cx("root")),
    active: r.active,
    a11yAttrs: r.a11yAttrs,
    onClick: r.onClick
  }) : bt((a(), k(ut(t.as), $({
    key: 0,
    class: t.cx("root"),
    "data-p": r.dataP,
    onClick: r.onClick
  }, r.attrs), {
    default: S(function() {
      return [V(t.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[h]]);
}
vn.render = Yn;
var fn = {
  name: "ChevronLeftIcon",
  extends: Nt
};
function Xn(t) {
  return oe(t) || ee(t) || ne(t) || te();
}
function te() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ne(t, n) {
  if (t) {
    if (typeof t == "string") return Dt(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? Dt(t, n) : void 0;
  }
}
function ee(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function oe(t) {
  if (Array.isArray(t)) return Dt(t);
}
function Dt(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function ae(t, n, e, o, b, r) {
  return a(), u("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Xn(n[0] || (n[0] = [l("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
fn.render = ae;
var hn = {
  name: "ChevronRightIcon",
  extends: Nt
};
function re(t) {
  return de(t) || se(t) || le(t) || ie();
}
function ie() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function le(t, n) {
  if (t) {
    if (typeof t == "string") return Kt(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? Kt(t, n) : void 0;
  }
}
function se(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function de(t) {
  if (Array.isArray(t)) return Kt(t);
}
function Kt(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function ue(t, n, e, o, b, r) {
  return a(), u("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), re(n[0] || (n[0] = [l("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
hn.render = ue;
var ce = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, pe = G.extend({
  name: "tablist",
  classes: ce
}), be = {
  name: "BaseTabList",
  extends: tt,
  props: {},
  style: pe,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, gn = {
  name: "TabList",
  extends: be,
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
    showNavigators: function(n) {
      n ? this.bindResizeObserver() : this.unbindResizeObserver();
    },
    activeValue: {
      flush: "post",
      handler: function() {
        this.updateInkBar(), this.bindInkBarObserver();
      }
    }
  },
  mounted: function() {
    var n = this;
    setTimeout(function() {
      n.updateInkBar(), n.bindInkBarObserver();
    }, 150), this.showNavigators && (this.updateButtonState(), this.bindResizeObserver());
  },
  updated: function() {
    this.showNavigators && this.updateButtonState();
  },
  beforeUnmount: function() {
    this.unbindResizeObserver(), this.unbindInkBarObserver();
  },
  methods: {
    onScroll: function(n) {
      this.showNavigators && this.updateButtonState(), n.preventDefault();
    },
    onPrevButtonClick: function() {
      var n = this.$refs.content, e = this.getVisibleButtonWidths(), o = Ot(n) - e, b = Math.abs(n.scrollLeft), r = o * 0.8, h = b - r, C = Math.max(h, 0);
      n.scrollLeft = en(n) ? -1 * C : C;
    },
    onNextButtonClick: function() {
      var n = this.$refs.content, e = this.getVisibleButtonWidths(), o = Ot(n) - e, b = Math.abs(n.scrollLeft), r = o * 0.8, h = b + r, C = n.scrollWidth - o, z = Math.min(h, C);
      n.scrollLeft = en(n) ? -1 * z : z;
    },
    bindResizeObserver: function() {
      var n = this;
      this.resizeObserver = new ResizeObserver(function() {
        return n.updateButtonState();
      }), this.resizeObserver.observe(this.$refs.list);
    },
    unbindResizeObserver: function() {
      var n;
      (n = this.resizeObserver) === null || n === void 0 || n.unobserve(this.$refs.list), this.resizeObserver = void 0;
    },
    bindInkBarObserver: function() {
      var n = this;
      this.unbindInkBarObserver();
      var e = this.$refs.content, o = It(e, '[data-pc-name="tab"][data-p-active="true"]');
      o && (this.inkBarObserver = new ResizeObserver(function() {
        return n.updateInkBar();
      }), this.inkBarObserver.observe(o));
    },
    unbindInkBarObserver: function() {
      var n;
      (n = this.inkBarObserver) === null || n === void 0 || n.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var n = this.$refs, e = n.content, o = n.inkbar, b = n.tabs;
      if (o) {
        var r = It(e, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (o.style.height = Rn(r) + "px", o.style.top = Tt(r).top - Tt(b).top + "px") : (o.style.width = En(r) + "px", o.style.left = Tt(r).left - Tt(b).left + "px");
      }
    },
    updateButtonState: function() {
      var n = this.$refs, e = n.list, o = n.content, b = o.scrollTop, r = o.scrollWidth, h = o.scrollHeight, C = o.offsetWidth, z = o.offsetHeight, L = Math.abs(o.scrollLeft), d = [Ot(o), On(o)], x = d[0], P = d[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = b !== 0, this.isNextButtonEnabled = e.offsetHeight >= z && parseInt(b) !== h - P) : (this.isPrevButtonEnabled = L !== 0, this.isNextButtonEnabled = e.offsetWidth >= C && parseInt(L) !== r - x);
    },
    getVisibleButtonWidths: function() {
      var n = this.$refs, e = n.prevButton, o = n.nextButton, b = 0;
      return this.showNavigators && (b = (e?.offsetWidth || 0) + (o?.offsetWidth || 0)), b;
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
      return et({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: fn,
    ChevronRightIcon: hn
  },
  directives: {
    ripple: Gt
  }
}, ve = ["data-p"], fe = ["aria-label", "tabindex"], he = ["data-p"], ge = ["aria-orientation"], me = ["aria-label", "tabindex"];
function ye(t, n, e, o, b, r) {
  var h = qt("ripple");
  return a(), u("div", $({
    ref: "list",
    class: t.cx("root"),
    "data-p": r.dataP
  }, t.ptmi("root")), [r.showNavigators && b.isPrevButtonEnabled ? bt((a(), u("button", $({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: t.cx("prevButton"),
    "aria-label": r.prevButtonAriaLabel,
    tabindex: r.$pcTabs.tabindex,
    onClick: n[0] || (n[0] = function() {
      return r.onPrevButtonClick && r.onPrevButtonClick.apply(r, arguments);
    })
  }, t.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(a(), k(ut(r.templates.previcon || "ChevronLeftIcon"), $({
    "aria-hidden": "true"
  }, t.ptm("prevIcon")), null, 16))], 16, fe)), [[h]]) : m("", !0), l("div", $({
    ref: "content",
    class: t.cx("content"),
    onScroll: n[1] || (n[1] = function() {
      return r.onScroll && r.onScroll.apply(r, arguments);
    }),
    "data-p": r.dataP
  }, t.ptm("content")), [l("div", $({
    ref: "tabs",
    class: t.cx("tabList"),
    role: "tablist",
    "aria-orientation": r.$pcTabs.orientation || "horizontal"
  }, t.ptm("tabList")), [V(t.$slots, "default"), l("span", $({
    ref: "inkbar",
    class: t.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, t.ptm("activeBar")), null, 16)], 16, ge)], 16, he), r.showNavigators && b.isNextButtonEnabled ? bt((a(), u("button", $({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: t.cx("nextButton"),
    "aria-label": r.nextButtonAriaLabel,
    tabindex: r.$pcTabs.tabindex,
    onClick: n[2] || (n[2] = function() {
      return r.onNextButtonClick && r.onNextButtonClick.apply(r, arguments);
    })
  }, t.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(a(), k(ut(r.templates.nexticon || "ChevronRightIcon"), $({
    "aria-hidden": "true"
  }, t.ptm("nextIcon")), null, 16))], 16, me)), [[h]]) : m("", !0)], 16, ve);
}
gn.render = ye;
var ke = `
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
`, $e = {
  root: function(n) {
    var e = n.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": e.scrollable
    }];
  }
}, we = G.extend({
  name: "tabs",
  style: ke,
  classes: $e
}), xe = {
  name: "BaseTabs",
  extends: tt,
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
  style: we,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, mn = {
  name: "Tabs",
  extends: xe,
  inheritAttrs: !1,
  emits: ["update:value"],
  data: function() {
    return {
      d_value: this.value
    };
  },
  watch: {
    value: function(n) {
      this.d_value = n;
    }
  },
  methods: {
    updateValue: function(n) {
      this.d_value !== n && (this.d_value = n, this.$emit("update:value", n));
    },
    isVertical: function() {
      return this.orientation === "vertical";
    }
  }
};
function Ce(t, n, e, o, b, r) {
  return a(), u("div", $({
    class: t.cx("root")
  }, t.ptmi("root")), [V(t.$slots, "default")], 16);
}
mn.render = Ce;
const Se = {
  key: 0,
  class: "kx-system-tab-count"
}, Be = /* @__PURE__ */ K({
  __name: "SystemTabs",
  props: {
    value: {},
    label: {},
    items: {}
  },
  emits: ["update:value"],
  setup(t) {
    return (n, e) => (a(), k(i(mn), {
      class: "kx-system-tabs",
      "data-kx-separator": "surface",
      value: t.value,
      "onUpdate:value": e[0] || (e[0] = (o) => n.$emit("update:value", String(o)))
    }, {
      default: S(() => [
        y(i(gn), {
          pt: { tabList: { "aria-label": t.label } }
        }, {
          default: S(() => [
            (a(!0), u(J, null, Q(t.items, (o) => (a(), k(i(vn), $({
              key: o.value,
              value: o.value
            }, { ref_for: !0 }, o.controls ? { "aria-controls": o.controls } : {}), {
              default: S(() => [
                A(w(o.label), 1),
                o.count !== void 0 ? (a(), u("b", Se, w(o.count), 1)) : m("", !0)
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
}), Pe = { class: "kx-shell" }, Te = { class: "kx-rail" }, Ie = { class: "kx-main kx-system-pane" }, Ae = /* @__PURE__ */ K({
  __name: "Shell",
  setup(t) {
    return (n, e) => (a(), u("div", Pe, [
      l("aside", Te, [
        V(n.$slots, "rail")
      ]),
      l("main", Ie, [
        V(n.$slots, "default")
      ])
    ]));
  }
}), ze = { class: "kx-railhead" }, _e = { class: "kx-railhead-title" }, Le = { key: 0 }, Ne = { class: "kx-railhead-acts" }, Fe = /* @__PURE__ */ K({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(t) {
    return (n, e) => (a(), u("div", ze, [
      l("span", _e, [
        A(w(t.title), 1),
        t.count !== void 0 ? (a(), u("b", Le, w(t.count), 1)) : m("", !0)
      ]),
      l("div", Ne, [
        V(n.$slots, "actions")
      ])
    ]));
  }
});
var Zt = {
  name: "SpinnerIcon",
  extends: Nt
};
function Ve(t) {
  return je(t) || Ee(t) || Re(t) || Oe();
}
function Oe() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Re(t, n) {
  if (t) {
    if (typeof t == "string") return Ut(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? Ut(t, n) : void 0;
  }
}
function Ee(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function je(t) {
  if (Array.isArray(t)) return Ut(t);
}
function Ut(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function De(t, n, e, o, b, r) {
  return a(), u("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ve(n[0] || (n[0] = [l("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Zt.render = De;
var Ke = `
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
`, Ue = {
  root: function(n) {
    var e = n.props, o = n.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Et(e.value) && String(e.value).length === 1,
      "p-badge-dot": cn(e.value) && !o.$slots.default,
      "p-badge-sm": e.size === "small",
      "p-badge-lg": e.size === "large",
      "p-badge-xl": e.size === "xlarge",
      "p-badge-info": e.severity === "info",
      "p-badge-success": e.severity === "success",
      "p-badge-warn": e.severity === "warn",
      "p-badge-danger": e.severity === "danger",
      "p-badge-secondary": e.severity === "secondary",
      "p-badge-contrast": e.severity === "contrast"
    }];
  }
}, Me = G.extend({
  name: "badge",
  style: Ke,
  classes: Ue
}), We = {
  name: "BaseBadge",
  extends: tt,
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
  style: Me,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function yt(t) {
  "@babel/helpers - typeof";
  return yt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, yt(t);
}
function ln(t, n, e) {
  return (n = He(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function He(t) {
  var n = Ge(t, "string");
  return yt(n) == "symbol" ? n : n + "";
}
function Ge(t, n) {
  if (yt(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (yt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var yn = {
  name: "Badge",
  extends: We,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return et(ln(ln({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, qe = ["data-p"];
function Ze(t, n, e, o, b, r) {
  return a(), u("span", $({
    class: t.cx("root"),
    "data-p": r.dataP
  }, t.ptmi("root")), [V(t.$slots, "default", {}, function() {
    return [A(w(t.value), 1)];
  })], 16, qe);
}
yn.render = Ze;
var Je = `
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
function kt(t) {
  "@babel/helpers - typeof";
  return kt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, kt(t);
}
function nt(t, n, e) {
  return (n = Qe(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Qe(t) {
  var n = Ye(t, "string");
  return kt(n) == "symbol" ? n : n + "";
}
function Ye(t, n) {
  if (kt(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (kt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Xe = {
  root: function(n) {
    var e = n.instance, o = n.props;
    return ["p-button p-component", nt(nt(nt(nt(nt(nt(nt(nt(nt({
      "p-button-icon-only": e.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", e.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(n) {
    var e = n.props;
    return ["p-button-icon", nt({}, "p-button-icon-".concat(e.iconPos), e.label)];
  },
  label: "p-button-label"
}, to = G.extend({
  name: "button",
  style: Je,
  classes: Xe
}), no = {
  name: "BaseButton",
  extends: tt,
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
  style: to,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function $t(t) {
  "@babel/helpers - typeof";
  return $t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, $t(t);
}
function W(t, n, e) {
  return (n = eo(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function eo(t) {
  var n = oo(t, "string");
  return $t(n) == "symbol" ? n : n + "";
}
function oo(t, n) {
  if ($t(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if ($t(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var St = {
  name: "Button",
  extends: no,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(n) {
      var e = n === "root" ? this.ptmi : this.ptm;
      return e(n, {
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
      return $(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return cn(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return et(W(W(W(W(W(W(W(W(W(W({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return et(W(W({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return et(W(W({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Zt,
    Badge: yn
  },
  directives: {
    ripple: Gt
  }
}, ao = ["data-p"], ro = ["data-p"];
function io(t, n, e, o, b, r) {
  var h = on("SpinnerIcon"), C = on("Badge"), z = qt("ripple");
  return t.asChild ? V(t.$slots, "default", {
    key: 1,
    class: X(t.cx("root")),
    a11yAttrs: r.a11yAttrs
  }) : bt((a(), k(ut(t.as), $({
    key: 0,
    class: t.cx("root"),
    "data-p": r.dataP
  }, r.attrs), {
    default: S(function() {
      return [V(t.$slots, "default", {}, function() {
        return [t.loading ? V(t.$slots, "loadingicon", $({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (a(), u("span", $({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (a(), k(h, $({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : V(t.$slots, "icon", $({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (a(), u("span", $({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": r.dataIconP
          }, t.ptm("icon")), null, 16, ao)) : m("", !0)];
        }), t.label ? (a(), u("span", $({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": r.dataLabelP
        }), w(t.label), 17, ro)) : m("", !0), t.badge ? (a(), k(C, {
          key: 3,
          value: t.badge,
          class: X(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : m("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[z]]);
}
St.render = io;
const At = /* @__PURE__ */ K({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean },
    variant: { default: "plain" },
    size: { default: "md" },
    spin: { type: Boolean }
  },
  emits: ["click"],
  setup(t, { emit: n }) {
    const e = t, o = n, b = Kn(), r = N(
      () => Object.prototype.hasOwnProperty.call(b?.vnode.props ?? {}, "active")
    ), h = N(
      () => e.variant === "danger" ? "danger" : e.variant === "bordered" ? "secondary" : void 0
    ), C = N(
      () => e.size === "sm" ? "small" : e.size === "lg" ? "large" : void 0
    );
    return (z, L) => (a(), k(i(St), {
      type: "button",
      severity: h.value,
      text: t.variant !== "bordered" && !t.active,
      outlined: t.variant === "bordered",
      size: C.value,
      loading: t.spin,
      disabled: t.disabled || t.spin,
      pt: {
        root: {
          "aria-label": t.label,
          "aria-pressed": r.value ? String(t.active) : void 0,
          title: t.label
        }
      },
      onClick: L[0] || (L[0] = (d) => o("click"))
    }, {
      icon: S(() => [
        y(i(j), {
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), Y = /* @__PURE__ */ K({
  __name: "Button",
  props: {
    icon: {},
    variant: { default: "primary" },
    type: { default: "button" },
    loading: { type: Boolean },
    disabled: { type: Boolean },
    small: { type: Boolean }
  },
  emits: ["click"],
  setup(t, { emit: n }) {
    const e = t, o = n, b = N(
      () => e.variant === "danger" ? "danger" : e.variant === "primary" ? void 0 : "secondary"
    );
    return (r, h) => (a(), k(i(St), {
      type: t.type,
      severity: b.value,
      outlined: t.variant === "ghost",
      loading: t.loading,
      disabled: t.disabled || t.loading,
      size: t.small ? "small" : void 0,
      onClick: h[0] || (h[0] = (C) => o("click"))
    }, {
      default: S(() => [
        t.loading ? (a(), k(i(Zt), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : m("", !0),
        t.icon && !t.loading ? (a(), k(i(j), {
          key: 1,
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : m("", !0),
        V(r.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
});
var lo = {
  name: "BaseEditableHolder",
  extends: tt,
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
      handler: function(n) {
        this.d_value = n;
      }
    },
    defaultValue: function(n) {
      this.d_value = n;
    },
    $formName: {
      immediate: !0,
      handler: function(n) {
        var e, o;
        this.formField = ((e = this.$pcForm) === null || e === void 0 || (o = e.register) === null || o === void 0 ? void 0 : o.call(e, n, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(n) {
        var e, o;
        this.formField = ((e = this.$pcForm) === null || e === void 0 || (o = e.register) === null || o === void 0 ? void 0 : o.call(e, this.$formName, n)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(n) {
        this.d_value !== n && (this.d_value = n);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(n) {
        var e;
        (e = this.$pcForm) !== null && e !== void 0 && e.getFieldState(this.$formName) && n !== this.d_value && (this.d_value = n);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(n, e) {
      var o, b;
      this.controlled && (this.d_value = n, this.$emit("update:modelValue", n)), this.$emit("value-change", n), (o = (b = this.formField).onChange) === null || o === void 0 || o.call(b, {
        originalEvent: e,
        value: n
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var n = arguments.length, e = new Array(n), o = 0; o < n; o++)
        e[o] = arguments[o];
      return e.find(Et);
    }
  },
  computed: {
    $filled: function() {
      return Et(this.d_value);
    },
    $invalid: function() {
      var n, e;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (n = this.$pcFormField) === null || n === void 0 || (n = n.$field) === null || n === void 0 ? void 0 : n.invalid, (e = this.$pcForm) === null || e === void 0 || (e = e.getFieldState(this.$formName)) === null || e === void 0 ? void 0 : e.invalid);
    },
    $formName: function() {
      var n;
      return this.$formNovalidate ? void 0 : this.name || ((n = this.$formControl) === null || n === void 0 ? void 0 : n.name);
    },
    $formControl: function() {
      var n;
      return this.formControl || ((n = this.$pcFormField) === null || n === void 0 ? void 0 : n.formControl);
    },
    $formNovalidate: function() {
      var n;
      return (n = this.$formControl) === null || n === void 0 ? void 0 : n.novalidate;
    },
    $formDefaultValue: function() {
      var n, e;
      return this.findNonEmpty(this.d_value, (n = this.$pcFormField) === null || n === void 0 ? void 0 : n.initialValue, (e = this.$pcForm) === null || e === void 0 || (e = e.initialValues) === null || e === void 0 ? void 0 : e[this.$formName]);
    },
    $formValue: function() {
      var n, e;
      return this.findNonEmpty((n = this.$pcFormField) === null || n === void 0 || (n = n.$field) === null || n === void 0 ? void 0 : n.value, (e = this.$pcForm) === null || e === void 0 || (e = e.getFieldState(this.$formName)) === null || e === void 0 ? void 0 : e.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, kn = {
  name: "BaseInput",
  extends: lo,
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
      var n;
      return (n = this.variant) !== null && n !== void 0 ? n : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var n;
      return (n = this.fluid) !== null && n !== void 0 ? n : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, so = `
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
`, uo = {
  root: function(n) {
    var e = n.instance, o = n.props;
    return ["p-inputtext p-component", {
      "p-filled": e.$filled,
      "p-inputtext-sm p-inputfield-sm": o.size === "small",
      "p-inputtext-lg p-inputfield-lg": o.size === "large",
      "p-invalid": e.$invalid,
      "p-variant-filled": e.$variant === "filled",
      "p-inputtext-fluid": e.$fluid
    }];
  }
}, co = G.extend({
  name: "inputtext",
  style: so,
  classes: uo
}), po = {
  name: "BaseInputText",
  extends: kn,
  style: co,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function wt(t) {
  "@babel/helpers - typeof";
  return wt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, wt(t);
}
function bo(t, n, e) {
  return (n = vo(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function vo(t) {
  var n = fo(t, "string");
  return wt(n) == "symbol" ? n : n + "";
}
function fo(t, n) {
  if (wt(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (wt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Jt = {
  name: "InputText",
  extends: po,
  inheritAttrs: !1,
  methods: {
    onInput: function(n) {
      this.writeValue(n.target.value, n);
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
      return et(bo({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ho = ["value", "name", "disabled", "aria-invalid", "data-p"];
function go(t, n, e, o, b, r) {
  return a(), u("input", $({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": r.dataP,
    onInput: n[0] || (n[0] = function() {
      return r.onInput && r.onInput.apply(r, arguments);
    })
  }, r.attrs), null, 16, ho);
}
Jt.render = go;
var mo = `
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
`, yo = {
  root: "p-iconfield"
}, ko = G.extend({
  name: "iconfield",
  style: mo,
  classes: yo
}), $o = {
  name: "BaseIconField",
  extends: tt,
  style: ko,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, $n = {
  name: "IconField",
  extends: $o,
  inheritAttrs: !1
};
function wo(t, n, e, o, b, r) {
  return a(), u("div", $({
    class: t.cx("root")
  }, t.ptmi("root")), [V(t.$slots, "default")], 16);
}
$n.render = wo;
var xo = {
  root: "p-inputicon"
}, Co = G.extend({
  name: "inputicon",
  classes: xo
}), So = {
  name: "BaseInputIcon",
  extends: tt,
  style: Co,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, wn = {
  name: "InputIcon",
  extends: So,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Bo(t, n, e, o, b, r) {
  return a(), u("span", $({
    class: r.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [V(t.$slots, "default")], 16);
}
wn.render = Bo;
const sn = /* @__PURE__ */ K({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: n }) {
    const e = n;
    return (o, b) => (a(), k(i($n), { class: "km-search" }, {
      default: S(() => [
        y(i(wn), null, {
          default: S(() => [
            y(i(j), {
              icon: "tabler:search",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }),
        y(i(Jt), {
          class: "km-search-input",
          "aria-label": t.placeholder || "Search",
          "model-value": t.modelValue,
          placeholder: t.placeholder || "Search",
          "onUpdate:modelValue": b[0] || (b[0] = (r) => e("update:modelValue", r ?? ""))
        }, null, 8, ["aria-label", "model-value", "placeholder"]),
        t.modelValue ? (a(), k(i(St), {
          key: 0,
          text: "",
          severity: "secondary",
          class: "km-search-clear",
          "aria-label": "Clear search",
          onClick: b[1] || (b[1] = (r) => e("update:modelValue", ""))
        }, {
          icon: S(() => [
            y(i(j), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        })) : m("", !0)
      ]),
      _: 1
    }));
  }
}), Po = { class: "km-field" }, To = { class: "km-field-label" }, Io = {
  key: 0,
  class: "km-field-help"
}, zt = /* @__PURE__ */ K({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(t) {
    return (n, e) => (a(), u("label", Po, [
      l("span", To, w(t.label), 1),
      V(n.$slots, "default"),
      t.help ? (a(), u("small", Io, w(t.help), 1)) : m("", !0)
    ]));
  }
}), dn = /* @__PURE__ */ K({
  __name: "TextInput",
  props: {
    modelValue: {},
    type: { default: "text" },
    placeholder: {},
    readonly: { type: Boolean },
    disabled: { type: Boolean },
    autocomplete: {},
    min: {},
    max: {},
    step: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(t, { emit: n }) {
    const e = n;
    return (o, b) => (a(), k(i(Jt), {
      class: X(["km-input", t.mono && "mono"]),
      type: t.type,
      "model-value": String(t.modelValue),
      placeholder: t.placeholder,
      readonly: t.readonly,
      disabled: t.disabled,
      autocomplete: t.autocomplete,
      min: t.min,
      max: t.max,
      step: t.step,
      "onUpdate:modelValue": b[0] || (b[0] = (r) => e("update:modelValue", r ?? ""))
    }, null, 8, ["class", "type", "model-value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"]));
  }
});
var Ao = `
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
`, zo = {
  root: function(n) {
    var e = n.props;
    return ["p-tag p-component", {
      "p-tag-info": e.severity === "info",
      "p-tag-success": e.severity === "success",
      "p-tag-warn": e.severity === "warn",
      "p-tag-danger": e.severity === "danger",
      "p-tag-secondary": e.severity === "secondary",
      "p-tag-contrast": e.severity === "contrast",
      "p-tag-rounded": e.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, _o = G.extend({
  name: "tag",
  style: Ao,
  classes: zo
}), Lo = {
  name: "BaseTag",
  extends: tt,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: _o,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function xt(t) {
  "@babel/helpers - typeof";
  return xt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, xt(t);
}
function No(t, n, e) {
  return (n = Fo(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function Fo(t) {
  var n = Vo(t, "string");
  return xt(n) == "symbol" ? n : n + "";
}
function Vo(t, n) {
  if (xt(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (xt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var xn = {
  name: "Tag",
  extends: Lo,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return et(No({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Oo = ["data-p"];
function Ro(t, n, e, o, b, r) {
  return a(), u("span", $({
    class: t.cx("root"),
    "data-p": r.dataP
  }, t.ptmi("root")), [t.$slots.icon ? (a(), k(ut(t.$slots.icon), $({
    key: 0,
    class: t.cx("icon")
  }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (a(), u("span", $({
    key: 1,
    class: [t.cx("icon"), t.icon]
  }, t.ptm("icon")), null, 16)) : m("", !0), t.value != null || t.$slots.default ? V(t.$slots, "default", {
    key: 2
  }, function() {
    return [l("span", $({
      class: t.cx("label")
    }, t.ptm("label")), w(t.value), 17)];
  }) : m("", !0)], 16, Oo);
}
xn.render = Ro;
const Eo = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, _t = /* @__PURE__ */ K({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(t) {
    return (n, e) => (a(), k(i(xn), {
      severity: t.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: S(() => [
        t.dot ? (a(), u("span", Eo)) : t.icon ? (a(), k(i(j), {
          key: 1,
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : m("", !0),
        V(n.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), jo = { class: "km-notice-text" }, Lt = /* @__PURE__ */ K({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(t, { emit: n }) {
    const e = n, o = (b) => b === "danger" ? "tabler:alert-triangle" : b === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (b, r) => (a(), u("div", {
      class: X(["km-notice", `is-${t.severity}`]),
      role: "status"
    }, [
      y(i(j), {
        icon: o(t.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      l("span", jo, [
        V(b.$slots, "default")
      ]),
      l("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: r[0] || (r[0] = (h) => e("dismiss"))
      }, [
        y(i(j), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
});
var Do = `
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
`, Ko = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Uo = G.extend({
  name: "progressspinner",
  style: Do,
  classes: Ko
}), Mo = {
  name: "BaseProgressSpinner",
  extends: tt,
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
  style: Uo,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Cn = {
  name: "ProgressSpinner",
  extends: Mo,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Wo = ["fill", "stroke-width"];
function Ho(t, n, e, o, b, r) {
  return a(), u("div", $({
    class: t.cx("root"),
    role: "progressbar"
  }, t.ptmi("root")), [(a(), u("svg", $({
    class: t.cx("spin"),
    viewBox: "25 25 50 50",
    style: r.svgStyle
  }, t.ptm("spin")), [l("circle", $({
    class: t.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: t.fill,
    "stroke-width": t.strokeWidth,
    strokeMiterlimit: "10"
  }, t.ptm("circle")), null, 16, Wo)], 16))], 16);
}
Cn.render = Ho;
const Go = { class: "km-loading" }, qo = { key: 0 }, Mt = /* @__PURE__ */ K({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(t) {
    return (n, e) => (a(), u("div", Go, [
      y(i(Cn), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": t.label || "Loading"
      }, null, 8, ["aria-label"]),
      t.label ? (a(), u("span", qo, w(t.label), 1)) : m("", !0)
    ]));
  }
}), Zo = { class: "kx-empty" }, Jo = { class: "kx-empty-ico" }, Qo = { class: "kx-empty-title" }, Yo = {
  key: 0,
  class: "kx-empty-sub"
}, Sn = /* @__PURE__ */ K({
  __name: "EmptyState",
  props: {
    icon: {},
    title: {},
    hint: {},
    cta: {},
    ctaIcon: {}
  },
  emits: ["cta"],
  setup(t) {
    return (n, e) => (a(), u("div", Zo, [
      l("div", Jo, [
        y(i(j), {
          icon: t.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      l("div", Qo, w(t.title), 1),
      t.hint || n.$slots.hint ? (a(), u("p", Yo, [
        V(n.$slots, "hint", {}, () => [
          A(w(t.hint), 1)
        ])
      ])) : m("", !0),
      t.cta ? (a(), k(i(St), {
        key: 1,
        label: t.cta,
        onClick: e[0] || (e[0] = (o) => n.$emit("cta"))
      }, Un({ _: 2 }, [
        t.ctaIcon ? {
          name: "icon",
          fn: S(({ class: o }) => [
            y(i(j), {
              icon: t.ctaIcon,
              class: X(o),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          key: "0"
        } : void 0
      ]), 1032, ["label"])) : m("", !0)
    ]));
  }
});
var Bn = {
  name: "TimesCircleIcon",
  extends: Nt
};
function Xo(t) {
  return oa(t) || ea(t) || na(t) || ta();
}
function ta() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function na(t, n) {
  if (t) {
    if (typeof t == "string") return Wt(t, n);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? Wt(t, n) : void 0;
  }
}
function ea(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function oa(t) {
  if (Array.isArray(t)) return Wt(t);
}
function Wt(t, n) {
  (n == null || n > t.length) && (n = t.length);
  for (var e = 0, o = Array(n); e < n; e++) o[e] = t[e];
  return o;
}
function aa(t, n, e, o, b, r) {
  return a(), u("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Xo(n[0] || (n[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14C5.61553 14 4.26215 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303296 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303296 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26215 14 5.61553 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14ZM7 1.16667C5.84628 1.16667 4.71846 1.50879 3.75918 2.14976C2.79989 2.79074 2.05222 3.70178 1.61071 4.76768C1.16919 5.83358 1.05367 7.00647 1.27876 8.13803C1.50384 9.26958 2.05941 10.309 2.87521 11.1248C3.69102 11.9406 4.73042 12.4962 5.86198 12.7212C6.99353 12.9463 8.16642 12.8308 9.23232 12.3893C10.2982 11.9478 11.2093 11.2001 11.8502 10.2408C12.4912 9.28154 12.8333 8.15373 12.8333 7C12.8333 5.45291 12.2188 3.96918 11.1248 2.87521C10.0308 1.78125 8.5471 1.16667 7 1.16667ZM4.66662 9.91668C4.58998 9.91704 4.51404 9.90209 4.44325 9.87271C4.37246 9.84333 4.30826 9.8001 4.2544 9.74557C4.14516 9.6362 4.0838 9.48793 4.0838 9.33335C4.0838 9.17876 4.14516 9.0305 4.2544 8.92113L6.17553 7L4.25443 5.07891C4.15139 4.96832 4.09529 4.82207 4.09796 4.67094C4.10063 4.51982 4.16185 4.37563 4.26872 4.26876C4.3756 4.16188 4.51979 4.10066 4.67091 4.09799C4.82204 4.09532 4.96829 4.15142 5.07887 4.25446L6.99997 6.17556L8.92106 4.25446C9.03164 4.15142 9.1779 4.09532 9.32903 4.09799C9.48015 4.10066 9.62434 4.16188 9.73121 4.26876C9.83809 4.37563 9.89931 4.51982 9.90198 4.67094C9.90464 4.82207 9.84855 4.96832 9.74551 5.07891L7.82441 7L9.74554 8.92113C9.85478 9.0305 9.91614 9.17876 9.91614 9.33335C9.91614 9.48793 9.85478 9.6362 9.74554 9.74557C9.69168 9.8001 9.62748 9.84333 9.55669 9.87271C9.4859 9.90209 9.40996 9.91704 9.33332 9.91668C9.25668 9.91704 9.18073 9.90209 9.10995 9.87271C9.03916 9.84333 8.97495 9.8001 8.9211 9.74557L6.99997 7.82444L5.07884 9.74557C5.02499 9.8001 4.96078 9.84333 4.88999 9.87271C4.81921 9.90209 4.74326 9.91704 4.66662 9.91668Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Bn.render = aa;
var ra = `
    .p-chip {
        display: inline-flex;
        align-items: center;
        background: dt('chip.background');
        color: dt('chip.color');
        border-radius: dt('chip.border.radius');
        padding-block: dt('chip.padding.y');
        padding-inline: dt('chip.padding.x');
        gap: dt('chip.gap');
    }

    .p-chip-icon {
        color: dt('chip.icon.color');
        font-size: dt('chip.icon.size');
        width: dt('chip.icon.size');
        height: dt('chip.icon.size');
    }

    .p-chip-image {
        border-radius: 50%;
        width: dt('chip.image.width');
        height: dt('chip.image.height');
        margin-inline-start: calc(-1 * dt('chip.padding.y'));
    }

    .p-chip:has(.p-chip-remove-icon) {
        padding-inline-end: dt('chip.padding.y');
    }

    .p-chip:has(.p-chip-image) {
        padding-block-start: calc(dt('chip.padding.y') / 2);
        padding-block-end: calc(dt('chip.padding.y') / 2);
    }

    .p-chip-remove-icon {
        cursor: pointer;
        font-size: dt('chip.remove.icon.size');
        width: dt('chip.remove.icon.size');
        height: dt('chip.remove.icon.size');
        color: dt('chip.remove.icon.color');
        border-radius: 50%;
        transition:
            outline-color dt('chip.transition.duration'),
            box-shadow dt('chip.transition.duration');
        outline-color: transparent;
    }

    .p-chip-remove-icon:focus-visible {
        box-shadow: dt('chip.remove.icon.focus.ring.shadow');
        outline: dt('chip.remove.icon.focus.ring.width') dt('chip.remove.icon.focus.ring.style') dt('chip.remove.icon.focus.ring.color');
        outline-offset: dt('chip.remove.icon.focus.ring.offset');
    }
`, ia = {
  root: "p-chip p-component",
  image: "p-chip-image",
  icon: "p-chip-icon",
  label: "p-chip-label",
  removeIcon: "p-chip-remove-icon"
}, la = G.extend({
  name: "chip",
  style: ra,
  classes: ia
}), sa = {
  name: "BaseChip",
  extends: tt,
  props: {
    label: {
      type: [String, Number],
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    removable: {
      type: Boolean,
      default: !1
    },
    removeIcon: {
      type: String,
      default: void 0
    }
  },
  style: la,
  provide: function() {
    return {
      $pcChip: this,
      $parentInstance: this
    };
  }
}, Pn = {
  name: "Chip",
  extends: sa,
  inheritAttrs: !1,
  emits: ["remove"],
  data: function() {
    return {
      visible: !0
    };
  },
  methods: {
    onKeydown: function(n) {
      (n.key === "Enter" || n.key === "Backspace") && this.close(n);
    },
    close: function(n) {
      this.visible = !1, this.$emit("remove", n);
    }
  },
  computed: {
    dataP: function() {
      return et({
        removable: this.removable
      });
    }
  },
  components: {
    TimesCircleIcon: Bn
  }
}, da = ["aria-label", "data-p"], ua = ["src"];
function ca(t, n, e, o, b, r) {
  return b.visible ? (a(), u("div", $({
    key: 0,
    class: t.cx("root"),
    "aria-label": t.label
  }, t.ptmi("root"), {
    "data-p": r.dataP
  }), [V(t.$slots, "default", {}, function() {
    return [t.image ? (a(), u("img", $({
      key: 0,
      src: t.image
    }, t.ptm("image"), {
      class: t.cx("image")
    }), null, 16, ua)) : t.$slots.icon ? (a(), k(ut(t.$slots.icon), $({
      key: 1,
      class: t.cx("icon")
    }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (a(), u("span", $({
      key: 2,
      class: [t.cx("icon"), t.icon]
    }, t.ptm("icon")), null, 16)) : m("", !0), t.label !== null ? (a(), u("div", $({
      key: 3,
      class: t.cx("label")
    }, t.ptm("label")), w(t.label), 17)) : m("", !0)];
  }), t.removable ? V(t.$slots, "removeicon", {
    key: 0,
    removeCallback: r.close,
    keydownCallback: r.onKeydown
  }, function() {
    return [(a(), k(ut(t.removeIcon ? "span" : "TimesCircleIcon"), $({
      class: [t.cx("removeIcon"), t.removeIcon],
      onClick: r.close,
      onKeydown: r.onKeydown
    }, t.ptm("removeIcon")), null, 16, ["class", "onClick", "onKeydown"]))];
  }) : m("", !0)], 16, da)) : m("", !0);
}
Pn.render = ca;
var pa = `
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
`, ba = {
  root: function(n) {
    var e = n.instance, o = n.props;
    return ["p-radiobutton p-component", {
      "p-radiobutton-checked": e.checked,
      "p-disabled": o.disabled,
      "p-invalid": e.$pcRadioButtonGroup ? e.$pcRadioButtonGroup.$invalid : e.$invalid,
      "p-variant-filled": e.$variant === "filled",
      "p-radiobutton-sm p-inputfield-sm": o.size === "small",
      "p-radiobutton-lg p-inputfield-lg": o.size === "large"
    }];
  },
  box: "p-radiobutton-box",
  input: "p-radiobutton-input",
  icon: "p-radiobutton-icon"
}, va = G.extend({
  name: "radiobutton",
  style: pa,
  classes: ba
}), fa = {
  name: "BaseRadioButton",
  extends: kn,
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
  style: va,
  provide: function() {
    return {
      $pcRadioButton: this,
      $parentInstance: this
    };
  }
};
function Ct(t) {
  "@babel/helpers - typeof";
  return Ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, Ct(t);
}
function ha(t, n, e) {
  return (n = ga(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function ga(t) {
  var n = ma(t, "string");
  return Ct(n) == "symbol" ? n : n + "";
}
function ma(t, n) {
  if (Ct(t) != "object" || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(t, n);
    if (Ct(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var Ht = {
  name: "RadioButton",
  extends: fa,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  inject: {
    $pcRadioButtonGroup: {
      default: void 0
    }
  },
  methods: {
    getPTOptions: function(n) {
      var e = n === "root" ? this.ptmi : this.ptm;
      return e(n, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(n) {
      if (!this.disabled && !this.readonly) {
        var e = this.binary ? !this.checked : this.value;
        this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.writeValue(e, n) : this.writeValue(e, n), this.$emit("change", n);
      }
    },
    onFocus: function(n) {
      this.$emit("focus", n);
    },
    onBlur: function(n) {
      var e, o;
      this.$emit("blur", n), (e = (o = this.formField).onBlur) === null || e === void 0 || e.call(o, n);
    }
  },
  computed: {
    groupName: function() {
      return this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.groupName : this.$formName;
    },
    checked: function() {
      var n = this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.d_value : this.d_value;
      return n != null && (this.binary ? !!n : un(n, this.value));
    },
    dataP: function() {
      return et(ha({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ya = ["data-p-checked", "data-p-disabled", "data-p"], ka = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], $a = ["data-p"], wa = ["data-p"];
function xa(t, n, e, o, b, r) {
  return a(), u("div", $({
    class: t.cx("root")
  }, r.getPTOptions("root"), {
    "data-p-checked": r.checked,
    "data-p-disabled": t.disabled,
    "data-p": r.dataP
  }), [l("input", $({
    id: t.inputId,
    type: "radio",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    value: t.value,
    name: r.groupName,
    checked: r.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: n[0] || (n[0] = function() {
      return r.onFocus && r.onFocus.apply(r, arguments);
    }),
    onBlur: n[1] || (n[1] = function() {
      return r.onBlur && r.onBlur.apply(r, arguments);
    }),
    onChange: n[2] || (n[2] = function() {
      return r.onChange && r.onChange.apply(r, arguments);
    })
  }, r.getPTOptions("input")), null, 16, ka), l("div", $({
    class: t.cx("box")
  }, r.getPTOptions("box"), {
    "data-p": r.dataP
  }), [l("div", $({
    class: t.cx("icon")
  }, r.getPTOptions("icon"), {
    "data-p": r.dataP
  }), null, 16, wa)], 16, $a)], 16, ya);
}
Ht.render = xa;
const Ca = { class: "kx-wcmount" }, Sa = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, Rt = /* @__PURE__ */ K({
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
  setup(t, { emit: n }) {
    const e = t, o = n, b = _(null), r = _(!1);
    let h = null, C = 0;
    const z = /* @__PURE__ */ new Set();
    function L(g) {
      g.composedPath()[0] === h && (g.stopPropagation(), o("change", g.detail));
    }
    function d(g) {
      return g.composedPath()[0] !== h ? !1 : (g.stopPropagation(), !0);
    }
    function x(g) {
      d(g) && o("select", g.detail);
    }
    function P(g) {
      d(g) && o("created", g.detail);
    }
    function M(g) {
      d(g) && o("close", g.detail);
    }
    function U(g) {
      d(g) && o("error", g.detail);
    }
    function D(g) {
      if (typeof g == "string") return g;
      try {
        return JSON.stringify(g ?? {});
      } catch {
        return null;
      }
    }
    function E() {
      if (!h) return;
      const g = D(e.config);
      if (g !== null && h.setAttribute("config", g), e.schema !== void 0 && e.schema !== null) {
        const B = D(e.schema);
        B !== null && h.setAttribute("schema", B);
      }
      if (e.meta !== void 0 && e.meta !== null) {
        const B = D(e.meta);
        B !== null && h.setAttribute("meta", B);
      }
      e.provider && h.setAttribute("provider", e.provider), e.label && h.setAttribute("label", e.label);
      const F = e.attrs || {};
      for (const B of [...z])
        (!(B in F) || F[B] == null) && (h.removeAttribute(B), z.delete(B));
      for (const [B, T] of Object.entries(F)) {
        if (T == null) continue;
        const ot = typeof T == "object" ? D(T) : String(T);
        ot !== null && (h.setAttribute(B, ot), z.add(B));
      }
    }
    function R(g = h) {
      g && (g.removeEventListener("config-changed", L), g.removeEventListener("change", L), g.removeEventListener("select", x), g.removeEventListener("created", P), g.removeEventListener("close", M), g.removeEventListener("error", U), g === h && (h = null), z.clear());
    }
    async function it(g) {
      if (!customElements.get(g))
        try {
          await qn(g, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function rt() {
      const g = ++C, F = b.value, B = e.tag;
      if (r.value = !1, !!F && (R(), F.innerHTML = "", !!B))
        try {
          if (await it(B), g !== C || b.value !== F || e.tag !== B) return;
          const T = document.createElement(B);
          T.classList.add("kx-wcmount-surface"), h = T, E(), T.addEventListener("config-changed", L), T.addEventListener("change", L), T.addEventListener("select", x), T.addEventListener("created", P), T.addEventListener("close", M), T.addEventListener("error", U), T.style.display = "block", F.appendChild(T), r.value = !customElements.get(B);
        } catch {
          g === C && (r.value = !0);
        }
    }
    async function q() {
      r.value = !1, await pn(), await rt();
    }
    return Mn(rt), jt(() => e.tag, rt), jt(() => [e.config, e.schema, e.meta, e.provider, e.label, e.attrs], E, { deep: !0 }), Wn(() => {
      C += 1, R();
    }), (g, F) => (a(), u("div", Ca, [
      r.value ? (a(), u("div", Sa, [
        F[0] || (F[0] = l("span", null, "This setup panel couldn’t load.", -1)),
        l("button", {
          type: "button",
          onClick: q
        }, "Try again")
      ])) : (a(), u("div", {
        key: 1,
        ref_key: "host",
        ref: b
      }, null, 512))
    ]));
  }
});
function dt(t, n) {
  const e = t?.response?.data ?? t?.data;
  return typeof e?.error == "string" && e.error ? e.error : typeof e?.message == "string" && e.message ? e.message : t instanceof Error ? t.message : n;
}
function Ba() {
  const t = _([]), n = _([]), e = _(!0), o = _(!1), b = _("");
  let r = 0;
  async function h() {
    const d = ++r;
    e.value = !0, b.value = "";
    try {
      const [x, P] = await Promise.all([
        at.get("/api/v1/security/scopes?view=permissions&include_unavailable=true"),
        at.get("/api/v1/security/policies?assignable=true")
      ]);
      if (d !== r) return;
      t.value = x.data?.scopes ?? [], n.value = P.data?.policies ?? [];
    } catch (x) {
      d === r && (b.value = dt(x, "failed to load security"));
    } finally {
      d === r && (e.value = !1);
    }
  }
  async function C(d) {
    const P = (await at.get(`/api/v1/security/scopes?id=${encodeURIComponent(d)}`)).data?.scopes?.[0];
    if (!P) throw new Error("Role no longer available");
    return P;
  }
  async function z(d) {
    o.value = !0, b.value = "";
    try {
      return await at.post("/api/v1/security/scopes", d), await h(), !0;
    } catch (x) {
      return b.value = dt(x, "failed to save scope"), !1;
    } finally {
      o.value = !1;
    }
  }
  async function L(d) {
    o.value = !0, b.value = "";
    try {
      return await at.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(d)}`), await h(), !0;
    } catch (x) {
      return b.value = dt(x, "failed to delete scope"), !1;
    } finally {
      o.value = !1;
    }
  }
  return { scopes: t, assignablePolicies: n, loading: e, saving: o, error: b, load: h, loadComposition: C, saveScope: z, deleteScope: L };
}
function Pa() {
  const t = _([]), n = _(!1), e = _(!1), o = _(""), b = _(""), r = _(null);
  let h = 0;
  async function C() {
    const d = ++h;
    n.value = !0, o.value = "";
    try {
      const { data: x } = await at.get("/api/v1/security/delegations");
      if (x?.success !== !0 || !Array.isArray(x.delegations))
        throw new Error(x?.error || "Delegation inventory is unconfirmed");
      d === h && (t.value = x.delegations);
    } catch (x) {
      d === h && (o.value = dt(x, "Could not load run-as permissions"));
    } finally {
      d === h && (n.value = !1);
    }
  }
  async function z() {
    if (!r.value || e.value) return;
    const d = r.value;
    e.value = !0, o.value = "", b.value = "";
    try {
      const { data: x } = d.method === "save" ? await at.post("/api/v1/security/delegations", d.request) : await at.delete("/api/v1/security/delegations", { data: d.request });
      if (x?.success !== !0) throw new Error(x?.error || "Run-as request is unconfirmed");
      r.value = null, b.value = d.method === "save" ? "Run-as permission saved" : "Run-as permission revoked", await C();
    } catch (x) {
      o.value = dt(x, "Could not confirm run-as request");
      const P = x?.response?.status;
      P && P >= 400 && P < 500 && (r.value = null);
    } finally {
      e.value = !1;
    }
  }
  async function L(d, x) {
    r.value || e.value || (r.value = { method: d, request: {
      ...x,
      principal: { ...x.principal },
      ...x.groups ? { groups: [...x.groups].sort() } : {}
    } }, await z());
  }
  return { delegations: t, loading: n, saving: e, error: o, confirmation: b, pending: r, load: C, mutate: L, submit: z };
}
const Ta = {
  class: "ks-runas kx-system-pane",
  "aria-label": "Run-as permissions"
}, Ia = { class: "kx-system-tools" }, Aa = { class: "ks-runas-head kx-system-toolbar" }, za = { class: "ks-runas-count" }, _a = { class: "ks-runas-acts" }, La = { class: "kx-system-body ks-runas-body" }, Na = {
  key: 0,
  role: "alert"
}, Fa = { class: "ks-runas-form-head" }, Va = ["disabled", "inert"], Oa = { class: "ks-runas-steps" }, Ra = {
  key: 0,
  class: "ks-runas-chips",
  "aria-label": "Selected groups"
}, Ea = { class: "ks-runas-component-options" }, ja = ["for"], Da = ["for"], Ka = { class: "ks-runas-form-foot" }, Ua = {
  key: 3,
  class: "ks-runas-pending"
}, Ma = {
  key: 6,
  class: "ks-runas-list"
}, Wa = { class: "ks-runas-grant-body" }, Ha = { class: "ks-runas-grant-line" }, Ga = {
  key: 0,
  class: "ks-runas-who"
}, qa = { class: "ks-runas-verb" }, Za = { class: "ks-runas-who" }, Ja = { class: "ks-runas-grant-meta" }, Qa = { key: 0 }, Ya = { key: 1 }, Xa = { key: 2 }, tr = /* @__PURE__ */ K({
  __name: "Delegations",
  props: {
    scopes: {}
  },
  setup(t, { expose: n }) {
    const e = t, o = Pa(), { delegations: b, loading: r, saving: h, error: C, confirmation: z, pending: L } = o, d = _(!1), x = _(!1), P = _(""), M = _(""), U = _(!0), D = Hn(), E = _([]), R = N(() => h.value || !!L.value), it = N(() => !!P.value && E.value.length > 0 && (U.value || !!M.value)), rt = N(() => {
      const I = {};
      for (const v of e.scopes) I[v.id] = v.label || "Group unavailable";
      return I;
    }), q = _({});
    jt(b, async (I) => {
      const v = [...new Set(I.map((f) => f.principal.id))].filter((f) => !q.value[f]);
      if (v.length)
        try {
          const { data: f } = await at.post("/api/v1/principals/resolve", { refs: v.map((H) => ({ type: "user", id: H })) }), Z = { ...q.value };
          for (const H of Array.isArray(f?.principals) ? f.principals : [])
            H && typeof H.id == "string" && typeof H.label == "string" && (Z[H.id] = H.label);
          q.value = Z;
        } catch (f) {
          C.value = f && typeof f == "object" && "message" in f ? String(f.message) : "Could not resolve account names";
        }
    });
    const g = N(() => b.value.filter((I) => I.active)), F = N(() => b.value.filter((I) => !I.active)), B = N(() => x.value ? [...g.value, ...F.value] : g.value);
    function T(I, v) {
      if (!I || typeof I != "object") return;
      const f = I;
      R.value || f.type !== v || typeof f.id != "string" || (v === "user" ? P.value = f.id : f.id && !E.value.some((Z) => Z.id === f.id) && E.value.push({ id: f.id, label: typeof f.label == "string" ? f.label : f.id }));
    }
    function ot(I) {
      const v = I && typeof I == "object" ? I.thread_id : void 0;
      !R.value && typeof v == "string" && (M.value = v);
    }
    function lt(I) {
      C.value = I && typeof I == "object" && "message" in I ? String(I.message) : "Could not load the picker";
    }
    function vt() {
      P.value = "", M.value = "", U.value = !0, E.value = [], d.value = !0;
    }
    async function Bt() {
      it.value && (await o.mutate("save", {
        principal: { kind: "user", id: P.value },
        root: U.value ? "*" : M.value,
        groups: E.value.map((I) => I.id)
      }), !C.value && !L.value && (d.value = !1));
    }
    async function ct(I) {
      await bn.confirm({
        header: "Revoke run-as permission?",
        message: `Members of ${I.groups.map((f) => rt.value[f] || "Group unavailable").join(", ")} can no longer choose ${q.value[I.principal.id] || "Account unavailable"} in the Run as setting.`,
        icon: "tabler:user-off",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await o.mutate("revoke", { principal: I.principal, root: I.root });
    }
    return n({ load: o.load }), (I, v) => (a(), u("section", Ta, [
      l("div", Ia, [
        l("header", Aa, [
          l("span", za, w(g.value.length) + " active " + w(g.value.length === 1 ? "permission" : "permissions"), 1),
          l("div", _a, [
            y(i(At), {
              icon: "tabler:refresh",
              label: "Refresh",
              disabled: i(r) || R.value,
              spin: i(r),
              onClick: i(o).load
            }, null, 8, ["disabled", "spin", "onClick"]),
            d.value ? m("", !0) : (a(), k(i(Y), {
              key: 0,
              variant: "primary",
              icon: "tabler:plus",
              disabled: R.value,
              onClick: vt
            }, {
              default: S(() => [...v[9] || (v[9] = [
                A("New permission", -1)
              ])]),
              _: 1
            }, 8, ["disabled"]))
          ])
        ]),
        v[10] || (v[10] = l("p", { class: "ks-runas-lede" }, [
          A(" Agents, automations and workflows run with the access of the account set in their "),
          l("b", null, "Run as"),
          A(" setting. A permission lets members of a group choose a specific account there, typically a bot account, so the component works with that account's access instead of their own. ")
        ], -1))
      ]),
      l("div", La, [
        i(C) ? (a(), u("div", Na, [
          y(i(Lt), {
            severity: "danger",
            onDismiss: v[0] || (v[0] = (f) => C.value = "")
          }, {
            default: S(() => [
              A(w(i(C)), 1)
            ]),
            _: 1
          })
        ])) : m("", !0),
        i(z) ? (a(), k(i(Lt), {
          key: 1,
          "data-test": "delegation-confirmation",
          severity: "success",
          onDismiss: v[1] || (v[1] = (f) => z.value = "")
        }, {
          default: S(() => [
            A(w(i(z)), 1)
          ]),
          _: 1
        })) : m("", !0),
        d.value ? (a(), u("form", {
          key: 2,
          class: "ks-runas-form",
          onSubmit: mt(Bt, ["prevent"])
        }, [
          l("div", Fa, [
            v[11] || (v[11] = l("span", null, "New run-as permission", -1)),
            y(i(At), {
              icon: "tabler:x",
              label: "Cancel",
              disabled: R.value,
              onClick: v[2] || (v[2] = (f) => d.value = !1)
            }, null, 8, ["disabled"])
          ]),
          l("fieldset", {
            disabled: R.value,
            inert: R.value
          }, [
            l("ol", Oa, [
              l("li", null, [
                y(i(zt), {
                  label: "Account to run as",
                  help: "The account whose access the component uses. Its group memberships decide what the component can do."
                }, {
                  default: S(() => [
                    y(Rt, {
                      tag: "wc-principal-picker",
                      attrs: { kinds: "user", placeholder: "Choose an account…" },
                      config: { principal_id: P.value },
                      onChange: v[3] || (v[3] = (f) => T(f, "user")),
                      onError: lt
                    }, null, 8, ["config"])
                  ]),
                  _: 1
                })
              ]),
              l("li", null, [
                y(i(zt), {
                  label: "Who may choose it",
                  help: "Members of these groups see this account in the Run as setting. Nobody's group membership changes."
                }, {
                  default: S(() => [
                    y(Rt, {
                      tag: "wc-principal-picker",
                      attrs: { kinds: "group", placeholder: "Add a group…" },
                      config: {},
                      onChange: v[4] || (v[4] = (f) => T(f, "group")),
                      onError: lt
                    })
                  ]),
                  _: 1
                }),
                E.value.length ? (a(), u("div", Ra, [
                  (a(!0), u(J, null, Q(E.value, (f) => (a(), k(i(Pn), {
                    key: f.id,
                    label: f.label,
                    removable: !R.value,
                    pt: { removeIcon: { "aria-label": `Remove group ${f.label}` } },
                    onRemove: (Z) => E.value = E.value.filter((H) => H.id !== f.id)
                  }, null, 8, ["label", "removable", "pt", "onRemove"]))), 128))
                ])) : m("", !0)
              ]),
              l("li", null, [
                l("fieldset", null, [
                  v[14] || (v[14] = l("legend", { class: "km-field-label" }, "On which components", -1)),
                  l("div", Ea, [
                    l("label", {
                      class: "ks-runas-component-option",
                      for: `${i(D)}-any`
                    }, [
                      y(i(Ht), {
                        modelValue: U.value,
                        "onUpdate:modelValue": v[5] || (v[5] = (f) => U.value = f),
                        "input-id": `${i(D)}-any`,
                        name: i(D),
                        value: !0,
                        disabled: R.value
                      }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                      v[12] || (v[12] = A(" Any component ", -1))
                    ], 8, ja),
                    l("label", {
                      class: "ks-runas-component-option",
                      for: `${i(D)}-one`
                    }, [
                      y(i(Ht), {
                        modelValue: U.value,
                        "onUpdate:modelValue": v[6] || (v[6] = (f) => U.value = f),
                        "input-id": `${i(D)}-one`,
                        name: i(D),
                        value: !1,
                        disabled: R.value
                      }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                      v[13] || (v[13] = A(" One component ", -1))
                    ], 8, Da)
                  ]),
                  v[15] || (v[15] = l("small", { class: "km-field-help" }, "The person choosing the account must also be able to manage the component.", -1))
                ]),
                U.value ? m("", !0) : (a(), k(Rt, {
                  key: 0,
                  class: "ks-runas-component",
                  tag: "wc-component-picker",
                  attrs: { source: "/api/v1/security/delegations/roots", title: "Component", placeholder: "Choose a component you manage…" },
                  config: M.value ? { thread_id: M.value } : {},
                  onChange: ot,
                  onError: lt
                }, null, 8, ["config"]))
              ])
            ])
          ], 8, Va),
          l("div", Ka, [
            y(i(Y), {
              variant: "ghost",
              small: "",
              disabled: R.value,
              onClick: v[7] || (v[7] = (f) => d.value = !1)
            }, {
              default: S(() => [...v[16] || (v[16] = [
                A("Cancel", -1)
              ])]),
              _: 1
            }, 8, ["disabled"]),
            y(i(Y), {
              variant: "primary",
              small: "",
              icon: "tabler:device-floppy",
              disabled: !it.value || R.value,
              loading: i(h),
              onClick: Bt
            }, {
              default: S(() => [...v[17] || (v[17] = [
                A("Save permission", -1)
              ])]),
              _: 1
            }, 8, ["disabled", "loading"])
          ])
        ], 32)) : m("", !0),
        i(L) && !i(h) ? (a(), u("div", Ua, [
          v[19] || (v[19] = l("span", null, "We could not confirm whether the permission changed. Select Retry to check before making another change.", -1)),
          y(i(Y), {
            small: "",
            onClick: i(o).submit
          }, {
            default: S(() => [...v[18] || (v[18] = [
              A("Retry", -1)
            ])]),
            _: 1
          }, 8, ["onClick"])
        ])) : m("", !0),
        F.value.length ? (a(), k(i(Y), {
          key: 4,
          class: "ks-runas-history",
          variant: "ghost",
          small: "",
          "aria-expanded": x.value,
          onClick: v[8] || (v[8] = (f) => x.value = !x.value)
        }, {
          default: S(() => [
            A(w(x.value ? "Hide revoked permissions" : "Show revoked permissions"), 1)
          ]),
          _: 1
        }, 8, ["aria-expanded"])) : m("", !0),
        i(r) && !i(b).length ? (a(), k(i(Mt), {
          key: 5,
          label: "Loading run-as permissions…"
        })) : B.value.length ? (a(), u("div", Ma, [
          (a(!0), u(J, null, Q(B.value, (f) => (a(), u("article", {
            key: f.policy_id,
            class: X(["kx-card ks-runas-grant", { revoked: !f.active }])
          }, [
            y(i(j), {
              class: "ks-runas-grant-icon",
              icon: "tabler:user-shield",
              "aria-hidden": "true"
            }),
            l("div", Wa, [
              l("div", Ha, [
                f.active ? (a(), u("span", Ga, w(f.groups.map((Z) => rt.value[Z] || "Group unavailable").join(", ")), 1)) : m("", !0),
                l("span", qa, w(f.active ? "can run as" : "Permission to run as"), 1),
                l("span", Za, w(q.value[f.principal.id] || "Account unavailable"), 1)
              ]),
              l("div", Ja, [
                f.root === "*" ? (a(), u("span", Qa, "on any component they manage")) : f.root_label ? (a(), u("span", Ya, [
                  v[20] || (v[20] = A("on ", -1)),
                  l("b", null, w(f.root_label), 1)
                ])) : (a(), u("span", Xa, "on an unavailable component"))
              ])
            ]),
            f.active ? (a(), k(i(Y), {
              key: 1,
              variant: "ghost",
              small: "",
              icon: "tabler:user-off",
              disabled: R.value,
              "aria-label": `Revoke run-as permission for ${q.value[f.principal.id] || "Account unavailable"}`,
              onClick: (Z) => ct(f)
            }, {
              default: S(() => [...v[22] || (v[22] = [
                A("Revoke", -1)
              ])]),
              _: 1
            }, 8, ["disabled", "aria-label", "onClick"])) : (a(), k(i(_t), {
              key: 0,
              severity: "secondary"
            }, {
              default: S(() => [...v[21] || (v[21] = [
                A("revoked", -1)
              ])]),
              _: 1
            }))
          ], 2))), 128))
        ])) : !i(C) && !d.value ? (a(), k(i(Sn), {
          key: 7,
          icon: "tabler:user-shield",
          title: "No active run-as permissions"
        }, {
          hint: S(() => [...v[23] || (v[23] = [
            A("Without an active permission, the Run as setting offers only ", -1),
            l("b", null, "Me", -1),
            A(".", -1)
          ])]),
          _: 1
        })) : m("", !0)
      ])
    ]));
  }
}), nr = ["draggable"], er = { class: "ks-pcard-row" }, or = { class: "ks-pcard-body" }, ar = { class: "ks-pcard-head" }, rr = ["title"], ir = {
  key: 0,
  class: "ks-pcard-comment"
}, lr = {
  key: 1,
  class: "ks-pcard-comment"
}, sr = ["aria-label"], dr = ["aria-label"], gt = /* @__PURE__ */ K({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(t, { emit: n }) {
    const e = t, o = n, b = N(() => e.policy.title || e.policy.id);
    function r(h) {
      e.mode === "locked" || !h.dataTransfer || (h.dataTransfer.setData("text/plain", e.policy.id), h.dataTransfer.effectAllowed = e.mode === "palette" ? "copy" : "move");
    }
    return (h, C) => (a(), u("div", {
      class: X(["kx-card ks-pcard", t.mode]),
      draggable: t.mode !== "locked",
      onDragstart: r,
      onDblclick: C[2] || (C[2] = (z) => t.mode === "palette" && o("add"))
    }, [
      l("div", er, [
        t.mode === "locked" ? (a(), k(i(j), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (a(), k(i(j), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        l("div", or, [
          l("div", ar, [
            t.policy.effect === "allow" || t.policy.effect === "deny" ? (a(), k(_t, {
              key: 0,
              severity: t.policy.effect === "allow" ? "success" : "danger"
            }, {
              default: S(() => [
                A(w(t.policy.effect === "deny" ? "Blocks" : "Allows"), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : m("", !0),
            l("span", {
              class: "ks-pcard-title",
              title: b.value
            }, w(b.value), 9, rr)
          ]),
          t.policy.available === !1 ? (a(), u("div", ir, "No longer available")) : t.policy.comment ? (a(), u("div", lr, w(t.policy.comment), 1)) : m("", !0)
        ]),
        t.mode === "palette" ? (a(), u("button", {
          key: 2,
          class: "ks-pcard-act add",
          "aria-label": `Add permission ${b.value}`,
          onClick: C[0] || (C[0] = mt((z) => o("add"), ["stop"]))
        }, [
          y(i(j), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ], 8, sr)) : t.mode === "selected" ? (a(), u("button", {
          key: 3,
          class: "ks-pcard-act remove",
          "aria-label": `Remove permission ${b.value}`,
          onClick: C[1] || (C[1] = mt((z) => o("remove"), ["stop"]))
        }, [
          y(i(j), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ], 8, dr)) : m("", !0)
      ])
    ], 42, nr));
  }
}), ur = { class: "ks" }, cr = { class: "ks-rail-search" }, pr = { class: "ks-rail-list" }, br = {
  key: 0,
  class: "ks-rail-group"
}, vr = ["onClick"], fr = { class: "ks-scope-name" }, hr = ["onClick"], gr = { class: "ks-scope-name" }, mr = {
  key: 0,
  class: "ks-builder"
}, yr = { class: "ks-builder-head" }, kr = { class: "ks-builder-title" }, $r = { class: "ks-builder-acts" }, wr = {
  key: 0,
  class: "ks-overlay-warn"
}, xr = {
  key: 1,
  class: "ks-view-note"
}, Cr = { class: "ks-fields" }, Sr = {
  key: 0,
  class: "ks-pane locked-pane"
}, Br = { class: "ks-pane-head" }, Pr = { class: "ks-pane-sub" }, Tr = { class: "ks-pane-body" }, Ir = {
  key: 0,
  class: "ks-pane-empty"
}, Ar = { class: "ks-pane" }, zr = { class: "ks-pane-search" }, _r = { class: "ks-pane-body" }, Lr = {
  key: 0,
  class: "ks-pane-empty"
}, Nr = { class: "ks-pane-head" }, Fr = { class: "ks-pane-sub" }, Vr = { class: "ks-pane-body" }, Or = ["onDrop"], Rr = {
  key: 0,
  class: "ks-drop-hint"
}, Er = {
  key: 1,
  class: "ks-view"
}, jr = { class: "ks-builder-head" }, Dr = { class: "ks-builder-title" }, Kr = { class: "ks-builder-acts" }, Ur = {
  key: 0,
  class: "ks-view-note"
}, Mr = { class: "ks-view-list" }, Wr = { class: "ks-pane-body" }, Hr = {
  key: 0,
  class: "ks-pane-empty"
}, Gr = {
  key: 1,
  class: "ks-view-note",
  role: "alert"
}, qr = {
  key: 2,
  class: "ks-technical-list"
}, Zr = {
  key: 3,
  class: "ks-view-note"
}, Jr = {
  key: 1,
  class: "ks-ext-block"
}, Qr = { class: "ks-ext-head" }, Yr = { class: "ks-pane-body ks-view-list" }, Xr = {
  key: 2,
  class: "kx-system-body"
}, ti = /* @__PURE__ */ K({
  __name: "Security",
  setup(t) {
    const n = Ba(), { scopes: e, assignablePolicies: o, loading: b, saving: r, error: h } = n, C = _(""), z = _(""), L = _(null), d = _(null), x = _(null), P = an(null), M = _(!1), U = an(/* @__PURE__ */ new Set());
    let D = 0;
    const E = _("scopes"), R = _(null), it = _(!1);
    async function rt(c) {
      E.value = String(c), c === "delegations" && (it.value = !0, await pn(), await R.value?.load());
    }
    async function q() {
      I(), await n.load();
    }
    jn(async () => {
      await q(), E.value === "delegations" && await R.value?.load();
    });
    const g = N(() => {
      const c = C.value.trim().toLowerCase(), s = (p) => !c || p.label.toLowerCase().includes(c) || p.id.toLowerCase().includes(c);
      return {
        custom: e.value.filter((p) => p.source === "custom" && s(p)),
        builtin: e.value.filter((p) => p.source !== "custom" && s(p))
      };
    }), F = N(() => e.value.find((c) => c.id === L.value) || null), B = N(() => F.value && F.value.source !== "custom" ? F.value : null), T = N(() => !!d.value?.target), ot = N(() => B.value?.policies ?? []), lt = N(() => T.value ? ot.value : []), vt = N(() => new Map(o.value.map((c) => [c.id, c]))), Bt = N(() => {
      const c = F.value, s = T.value ? c?.overlay_policies : c?.policies;
      return new Map((s ?? []).map((p) => [p.id, p]));
    }), ct = N(() => (d.value?.policyIds ?? []).map((c) => Bt.value.get(c) ?? vt.value.get(c) ?? { id: c, available: !1 }));
    function I() {
      D++, M.value = !1, P.value = null, x.value && (x.value.open = !1);
    }
    async function v(c) {
      const s = c.currentTarget, p = B.value;
      if (!s.open || !p || P.value && !P.value.error) return;
      const O = { scope: null, loading: !0, error: "" };
      P.value = O;
      try {
        const st = await n.loadComposition(p.id);
        if (P.value !== O) return;
        P.value = { scope: st, loading: !1, error: "" };
      } catch (st) {
        if (P.value !== O) return;
        P.value = { scope: null, loading: !1, error: dt(st, "Failed to load technical policies") };
      }
    }
    const f = N(() => {
      const c = P.value?.scope;
      if (!c) return [];
      const s = new Set(ot.value.map((p) => p.id));
      return (c.base_policies ?? c.policies).filter((p) => !s.has(p.id));
    });
    function Z(c) {
      return [...new Set([...c.policies, ...c.overlay_policies ?? []].filter((s) => s.available !== !1 && vt.value.has(s.id)).map((s) => s.id))];
    }
    const H = N(() => F.value && Z(F.value).length > 0), Qt = N(() => {
      if (!d.value) return [];
      const c = /* @__PURE__ */ new Set([...d.value.policyIds, ...T.value ? U.value : []]), s = z.value.trim().toLowerCase();
      return o.value.filter((p) => !c.has(p.id) && (!s || (p.title || "").toLowerCase().includes(s) || p.id.toLowerCase().includes(s) || (p.comment || "").toLowerCase().includes(s)));
    });
    function Yt(c) {
      I(), z.value = "", L.value = c.id, d.value = c.source === "custom" ? { slug: c.slug || "", label: c.label, description: c.description, policyIds: c.policies.map((s) => s.id), enabled: c.enabled, isNew: !1, target: "" } : null;
    }
    function Ft() {
      I(), z.value = "", L.value = null, d.value = { slug: Array.from(crypto.getRandomValues(new Uint8Array(16)), (c) => c.toString(16).padStart(2, "0")).join(""), label: "", description: "", policyIds: [], enabled: !0, isNew: !0, target: "" };
    }
    function Xt(c) {
      const s = Z(c);
      s.length && (Ft(), Object.assign(d.value, {
        label: c.label ? `Copy of ${c.label}` : "",
        description: c.description,
        policyIds: s
      }));
    }
    function tn(c) {
      return c.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    async function Tn(c) {
      const s = D;
      M.value = !0;
      try {
        const p = P.value?.scope ?? await n.loadComposition(c.id);
        if (s !== D) return;
        I(), z.value = "", U.value = new Set((p.base_policies ?? p.policies).map((O) => O.id)), d.value = {
          slug: c.overlay_slug || tn(c.id),
          label: c.label || pt(c.id),
          description: c.description,
          policyIds: (c.overlay_policies ?? []).map((O) => O.id),
          enabled: !0,
          isNew: !c.overlay_slug,
          target: c.id
        };
      } catch (p) {
        s === D && (h.value = dt(p, "Failed to open the role extension"));
      } finally {
        s === D && (M.value = !1);
      }
    }
    function Vt(c, s) {
      !d.value || d.value.policyIds.includes(c) || T.value && U.value.has(c) || vt.value.has(c) && d.value.policyIds.splice(s ?? d.value.policyIds.length, 0, c);
    }
    function In(c) {
      d.value && (d.value.policyIds = d.value.policyIds.filter((s) => s !== c));
    }
    function An(c) {
      const s = c.dataTransfer?.getData("text/plain");
      s && Vt(s);
    }
    function zn(c, s) {
      c.stopPropagation();
      const p = c.dataTransfer?.getData("text/plain");
      if (!p || !d.value || p === s) return;
      const O = d.value.policyIds, st = O.indexOf(p);
      if (st === -1) {
        Vt(p, O.indexOf(s));
        return;
      }
      O.splice(st, 1), O.splice(O.indexOf(s), 0, p);
    }
    const _n = N(() => d.value ? !d.value.isNew || d.value.target ? d.value.slug : `${tn(d.value.label.normalize("NFKD").replace(/\p{M}/gu, "")).toLowerCase() || "role"}_${d.value.slug}` : ""), nn = N(() => !!d.value && d.value.label.trim() !== "" && (!d.value.isNew || d.value.policyIds.length > 0)), ft = _("");
    let ht = null;
    Gn(() => {
      ht && clearTimeout(ht);
    });
    function Ln(c) {
      ft.value = c, ht && clearTimeout(ht), ht = setTimeout(() => {
        ft.value = "";
      }, 3e3);
    }
    async function Nn() {
      if (!d.value || !nn.value) return;
      const c = d.value, s = _n.value, p = d.value.target, O = d.value.label.trim() || s;
      await n.saveScope({
        slug: s,
        target: p,
        label: d.value.label.trim(),
        description: d.value.description.trim(),
        policies: [...d.value.policyIds],
        enabled: d.value.enabled
      }) && (c.slug = s, c.isNew = !1, d.value === c && (L.value = p || `kickside.security.scopes:${s}`), Ln(`Saved “${O}”. The role will be available when assigning users.`));
    }
    async function Fn() {
      if (!d.value || d.value.isNew) return;
      const c = T.value;
      if (!await bn.confirm({
        header: c ? "Remove extension?" : "Delete role?",
        message: c ? "This removes the added permissions. Users keep the role’s original permissions." : "This removes the custom role and its permissions.",
        icon: "tabler:trash",
        acceptLabel: c ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await n.deleteScope(d.value.slug) && (d.value = null, L.value = null);
    }
    function pt(c) {
      return c.includes(":") ? c.split(":").slice(-1)[0] : c;
    }
    return (c, s) => (a(), u("div", ur, [
      y(Be, {
        value: E.value,
        label: "Security administration",
        items: [
          { value: "scopes", label: "Roles" },
          { value: "delegations", label: "Run as" }
        ],
        "onUpdate:value": rt
      }, null, 8, ["value"]),
      it.value ? bt((a(), k(tr, {
        key: 0,
        ref_key: "delegationPanel",
        ref: R,
        scopes: i(e)
      }, null, 8, ["scopes"])), [
        [rn, E.value === "delegations"]
      ]) : m("", !0),
      i(h) ? (a(), k(i(Lt), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: s[0] || (s[0] = (p) => h.value = "")
      }, {
        default: S(() => [
          A(w(i(h)), 1)
        ]),
        _: 1
      })) : ft.value ? (a(), k(i(Lt), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: s[1] || (s[1] = (p) => ft.value = "")
      }, {
        default: S(() => [
          A(w(ft.value), 1)
        ]),
        _: 1
      })) : m("", !0),
      E.value === "scopes" && i(b) && !i(e).length ? (a(), k(i(Mt), {
        key: 3,
        label: "Loading security…"
      })) : bt((a(), k(i(Ae), { key: 4 }, {
        rail: S(() => [
          y(i(Fe), {
            title: "Roles",
            count: i(e).length
          }, {
            actions: S(() => [
              y(i(At), {
                icon: "tabler:plus",
                label: "New role",
                disabled: i(r),
                onClick: Ft
              }, null, 8, ["disabled"]),
              y(i(At), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: i(b),
                spin: i(b),
                onClick: q
              }, null, 8, ["disabled", "spin"])
            ]),
            _: 1
          }, 8, ["count"]),
          l("div", cr, [
            y(i(sn), {
              modelValue: C.value,
              "onUpdate:modelValue": s[2] || (s[2] = (p) => C.value = p),
              placeholder: "Find a role…"
            }, null, 8, ["modelValue"])
          ]),
          l("div", pr, [
            g.value.custom.length ? (a(), u("div", br, "Custom")) : m("", !0),
            (a(!0), u(J, null, Q(g.value.custom, (p) => (a(), u("button", {
              key: p.id,
              class: X(["ks-scope-row", { active: p.id === L.value }]),
              onClick: (O) => Yt(p)
            }, [
              l("span", fr, w(p.label || pt(p.id)), 1)
            ], 10, vr))), 128)),
            s[11] || (s[11] = l("div", { class: "ks-rail-group" }, "Default", -1)),
            (a(!0), u(J, null, Q(g.value.builtin, (p) => (a(), u("button", {
              key: p.id,
              class: X(["ks-scope-row", { active: p.id === L.value }]),
              onClick: (O) => Yt(p)
            }, [
              l("span", gr, w(p.label || pt(p.id)), 1)
            ], 10, hr))), 128))
          ])
        ]),
        default: S(() => [
          d.value ? (a(), u("div", mr, [
            l("div", yr, [
              l("div", kr, [
                y(i(j), {
                  icon: T.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                l("span", null, w(T.value ? `Extend ${d.value.label || pt(d.value.target)}` : d.value.isNew ? "New role" : d.value.label || d.value.slug), 1),
                T.value ? (a(), k(i(_t), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: S(() => [...s[12] || (s[12] = [
                    A("Additional permissions", -1)
                  ])]),
                  _: 1
                })) : m("", !0)
              ]),
              l("div", $r, [
                !d.value.isNew && !T.value && F.value ? (a(), k(i(Y), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: i(r) || !H.value,
                  onClick: s[3] || (s[3] = (p) => Xt(F.value))
                }, {
                  default: S(() => [...s[13] || (s[13] = [
                    A("Copy permissions", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : m("", !0),
                d.value.isNew ? m("", !0) : (a(), k(i(Y), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: i(r),
                  onClick: Fn
                }, {
                  default: S(() => [
                    A(w(T.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                y(i(Y), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: i(r),
                  disabled: !nn.value,
                  onClick: Nn
                }, {
                  default: S(() => [
                    A(w(T.value ? "Save extension" : "Save role"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            T.value ? (a(), u("div", wr, [
              y(i(j), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              l("span", null, [
                s[14] || (s[14] = A("Adding permissions grants them to ", -1)),
                l("b", null, "everyone assigned " + w(F.value?.label || pt(d.value.target)), 1),
                s[15] || (s[15] = A(". You can remove permissions added by this extension. To restrict access, create a new role with only the permissions needed.", -1))
              ])
            ])) : (a(), u("p", xr, "Choose the permissions this role grants, then assign it in System → Users. To restrict a Member, assign this role instead of Member; other assigned roles may still grant access.")),
            l("div", Cr, [
              y(i(zt), { label: "Name" }, {
                default: S(() => [
                  y(i(dn), {
                    modelValue: d.value.label,
                    "onUpdate:modelValue": s[4] || (s[4] = (p) => d.value.label = p),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              y(i(zt), { label: "Description" }, {
                default: S(() => [
                  y(i(dn), {
                    modelValue: d.value.description,
                    "onUpdate:modelValue": s[5] || (s[5] = (p) => d.value.description = p),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            l("div", {
              class: X(["ks-panes", { three: T.value }])
            }, [
              T.value ? (a(), u("section", Sr, [
                l("header", Br, [
                  s[16] || (s[16] = l("span", null, "Original assignable permissions", -1)),
                  l("span", Pr, w(lt.value.length) + " · locked", 1)
                ]),
                l("div", Tr, [
                  (a(!0), u(J, null, Q(lt.value, (p) => (a(), k(gt, {
                    key: p.id,
                    policy: p,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  lt.value.length ? m("", !0) : (a(), u("div", Ir, "No original permissions available to assign."))
                ])
              ])) : m("", !0),
              l("section", Ar, [
                s[17] || (s[17] = l("header", { class: "ks-pane-head" }, [
                  l("span", null, "Available permissions"),
                  l("span", { class: "ks-pane-sub" }, "Click + to add")
                ], -1)),
                l("div", zr, [
                  y(i(sn), {
                    modelValue: z.value,
                    "onUpdate:modelValue": s[6] || (s[6] = (p) => z.value = p),
                    placeholder: "Search permissions…"
                  }, null, 8, ["modelValue"])
                ]),
                l("div", _r, [
                  (a(!0), u(J, null, Q(Qt.value, (p) => (a(), k(gt, {
                    key: p.id,
                    policy: p,
                    mode: "palette",
                    onAdd: (O) => Vt(p.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  Qt.value.length ? m("", !0) : (a(), u("div", Lr, "No matching permissions."))
                ])
              ]),
              l("section", {
                class: "ks-pane drop",
                onDragover: s[8] || (s[8] = mt(() => {
                }, ["prevent"])),
                onDrop: An
              }, [
                l("header", Nr, [
                  l("span", null, w(T.value ? "Added by you" : "In this role"), 1),
                  l("span", Fr, w(ct.value.length) + " " + w(ct.value.length === 1 ? "permission" : "permissions"), 1)
                ]),
                l("div", Vr, [
                  (a(!0), u(J, null, Q(ct.value, (p) => (a(), u("div", {
                    key: p.id,
                    onDragover: s[7] || (s[7] = mt(() => {
                    }, ["prevent"])),
                    onDrop: (O) => zn(O, p.id)
                  }, [
                    y(gt, {
                      policy: p,
                      mode: "selected",
                      onRemove: (O) => In(p.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, Or))), 128)),
                  ct.value.length ? m("", !0) : (a(), u("div", Rr, [
                    y(i(j), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    s[18] || (s[18] = l("span", null, "Use + on an available permission, or drag it here.", -1))
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : B.value ? (a(), u("div", Er, [
            l("div", jr, [
              l("div", Dr, [
                y(i(j), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                l("span", null, w(B.value.label || pt(B.value.id)), 1)
              ]),
              l("div", Kr, [
                y(i(Y), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  loading: M.value,
                  disabled: P.value?.loading,
                  onClick: s[9] || (s[9] = (p) => Tn(B.value))
                }, {
                  default: S(() => [
                    A(w(B.value.overlay_slug ? "Edit extension" : "Add permissions"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"]),
                y(i(Y), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: !H.value,
                  onClick: s[10] || (s[10] = (p) => Xt(B.value))
                }, {
                  default: S(() => [...s[19] || (s[19] = [
                    A("Copy permissions", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])
              ])
            ]),
            B.value.description ? (a(), u("p", Ur, w(B.value.description), 1)) : m("", !0),
            s[23] || (s[23] = l("p", { class: "ks-view-note" }, " Adding permissions affects everyone with this role. Copy permissions starts a custom role with the permissions available to assign. ", -1)),
            l("section", Mr, [
              s[20] || (s[20] = l("header", { class: "ks-pane-head" }, "Assignable permissions", -1)),
              l("div", Wr, [
                (a(!0), u(J, null, Q(ot.value, (p) => (a(), k(gt, {
                  key: p.id,
                  policy: p,
                  mode: "locked"
                }, null, 8, ["policy"]))), 128)),
                ot.value.length ? m("", !0) : (a(), u("div", Hr, "No assignable permissions in the original role."))
              ])
            ]),
            (a(), u("details", {
              key: B.value.id,
              ref_key: "technicalDetails",
              ref: x,
              class: "ks-technical",
              onToggle: v
            }, [
              s[21] || (s[21] = l("summary", null, "Technical policies", -1)),
              P.value?.loading ? (a(), k(i(Mt), {
                key: 0,
                label: "Loading technical policies…"
              })) : P.value?.error ? (a(), u("p", Gr, w(P.value.error) + ". Reopen to try again.", 1)) : f.value.length ? (a(), u("ul", qr, [
                (a(!0), u(J, null, Q(f.value, (p) => (a(), u("li", {
                  key: p.id
                }, [
                  l("code", null, w(p.id), 1)
                ]))), 128))
              ])) : P.value ? (a(), u("p", Zr, "No additional technical policies.")) : m("", !0)
            ], 32)),
            B.value.overlay_policies && B.value.overlay_policies.length ? (a(), u("div", Jr, [
              l("div", Qr, [
                y(i(j), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                s[22] || (s[22] = l("span", null, "Additional permissions", -1)),
                y(i(_t), { severity: "warn" }, {
                  default: S(() => [
                    A(w(B.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              l("div", Yr, [
                (a(!0), u(J, null, Q(B.value.overlay_policies, (p) => (a(), k(gt, {
                  key: p.id,
                  policy: p,
                  mode: "locked"
                }, null, 8, ["policy"]))), 128))
              ])
            ])) : m("", !0)
          ])) : (a(), u("div", Xr, [
            y(i(Sn), {
              icon: "tabler:shield-lock",
              title: "Roles",
              hint: "Choose a role to view its permissions, or create one with the permissions your team needs. Assign roles in System → Users.",
              cta: "New role",
              "cta-icon": "tabler:plus",
              onCta: Ft
            })
          ]))
        ]),
        _: 1
      }, 512)), [
        [rn, E.value === "scopes"]
      ])
    ]));
  }
}), ri = {
  rootComponent: ti,
  plugins: [Dn]
};
export {
  ri as mountConfig
};
//# sourceMappingURL=lazy-mount-AwrUG08-.js.map
